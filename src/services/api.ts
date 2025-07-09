import axios, { AxiosError, AxiosResponse } from 'axios';
import type { 
  User, 
  AuthResponse, 
  LoginCredentials, 
  RegisterCredentials,
  ScanJob,
  ScanTask,
  ScoringData,
  ScoringWeights,
  ReportData,
  UploadFile,
  AdminSettings,
  ApiResponse,
  PaginatedResponse,
  ApiError 
} from '@/lib/types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  timeout: 30000,
  withCredentials: true, // Include cookies for refresh token
});

// Access token storage (in-memory)
let accessToken: string | null = null;

// Set access token
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await api.post('/api/auth/refresh');
        const newToken = response.data.accessToken;
        setAccessToken(newToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        setAccessToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API error handler
const handleApiError = (error: AxiosError): ApiError => {
  if (error.response?.data) {
    const errorData = error.response.data as any;
    return {
      message: errorData.message || errorData.detail || 'An error occurred',
      code: errorData.code,
      details: errorData.details,
    };
  }
  
  if (error.request) {
    return {
      message: 'Network error - please check your connection',
      code: 'NETWORK_ERROR',
    };
  }
  
  return {
    message: error.message || 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  };
};

// API wrapper function
const apiCall = async <T>(
  request: () => Promise<AxiosResponse<ApiResponse<T>>>
): Promise<T> => {
  try {
    const response = await request();
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return response.data.data as T;
  } catch (error) {
    const apiError = handleApiError(error as AxiosError);
    throw new Error(apiError.message);
  }
};

// Authentication API
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiCall(() => api.post('/api/auth/login', credentials)),
    
  register: (credentials: RegisterCredentials): Promise<AuthResponse> =>
    apiCall(() => api.post('/api/auth/register', credentials)),
    
  logout: (): Promise<void> =>
    apiCall(() => api.post('/api/auth/logout')),
    
  refresh: (): Promise<{ accessToken: string }> =>
    apiCall(() => api.post('/api/auth/refresh')),
    
  me: (): Promise<User> =>
    apiCall(() => api.get('/api/auth/me')),
};

// Scanning API
export const scanApi = {
  createScan: (targets: string[]): Promise<{ jobId: string }> =>
    apiCall(() => api.post('/api/scan', { targets })),
    
  getScanStatus: (jobId: string): Promise<ScanJob> =>
    apiCall(() => api.get(`/api/scans/${jobId}/status`)),
    
  getScanTasks: (jobId: string): Promise<ScanTask[]> =>
    apiCall(() => api.get(`/api/scans/${jobId}/tasks`)),
    
  abortScan: (jobId: string): Promise<void> =>
    apiCall(() => api.post(`/api/scans/${jobId}/abort`)),
    
  listScans: (page = 1, pageSize = 20): Promise<PaginatedResponse<ScanJob>> =>
    apiCall(() => api.get(`/api/scans?page=${page}&pageSize=${pageSize}`)),
};

// Scoring API
export const scoringApi = {
  getScoring: (jobId: string): Promise<ScoringData> =>
    apiCall(() => api.get(`/api/scoring/${jobId}`)),
    
  updateWeights: (jobId: string, weights: ScoringWeights): Promise<ScoringData> =>
    apiCall(() => api.post(`/api/scoring/${jobId}/weights`, weights)),
};

// Reports API
export const reportsApi = {
  generateReport: (jobId: string, format: 'pdf' | 'html'): Promise<{ reportId: string }> =>
    apiCall(() => api.post(`/api/reports/${jobId}/generate`, { format })),
    
  getReportStatus: (jobId: string): Promise<ReportData> =>
    apiCall(() => api.get(`/api/reports/${jobId}`)),
    
  downloadReport: (jobId: string, format: 'pdf' | 'html'): Promise<Blob> =>
    api.get(`/api/reports/${jobId}/download?format=${format}`, {
      responseType: 'blob',
    }).then(response => response.data),
};

// Upload API
export const uploadApi = {
  uploadFile: (file: File, onProgress?: (progress: number) => void): Promise<UploadFile> =>
    apiCall(() => {
      const formData = new FormData();
      formData.append('file', file);
      
      return api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });
    }),
    
  getUploadedFiles: (page = 1, pageSize = 20): Promise<PaginatedResponse<UploadFile>> =>
    apiCall(() => api.get(`/api/upload?page=${page}&pageSize=${pageSize}`)),
    
  deleteFile: (fileId: string): Promise<void> =>
    apiCall(() => api.delete(`/api/upload/${fileId}`)),
};

// Admin API
export const adminApi = {
  getUsers: (page = 1, pageSize = 20): Promise<PaginatedResponse<User>> =>
    apiCall(() => api.get(`/api/admin/users?page=${page}&pageSize=${pageSize}`)),
    
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> =>
    apiCall(() => api.post('/api/admin/users', userData)),
    
  updateUser: (userId: string, userData: Partial<User>): Promise<User> =>
    apiCall(() => api.put(`/api/admin/users/${userId}`, userData)),
    
  deleteUser: (userId: string): Promise<void> =>
    apiCall(() => api.delete(`/api/admin/users/${userId}`)),
    
  getSettings: (): Promise<AdminSettings> =>
    apiCall(() => api.get('/api/admin/settings')),
    
  updateSettings: (settings: Partial<AdminSettings>): Promise<AdminSettings> =>
    apiCall(() => api.put('/api/admin/settings', settings)),
    
  getLogs: (page = 1, pageSize = 50): Promise<PaginatedResponse<any>> =>
    apiCall(() => api.get(`/api/admin/logs?page=${page}&pageSize=${pageSize}`)),
};

export default api;