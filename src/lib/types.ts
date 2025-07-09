// Core types for Reveal.me application

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'analyst' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: 'admin' | 'analyst' | 'viewer';
}

export interface ScanTarget {
  id: string;
  value: string;
  type: 'domain' | 'ip' | 'email' | 'phone';
}

export interface ScanJob {
  id: string;
  targets: ScanTarget[];
  status: 'pending' | 'running' | 'completed' | 'failed' | 'aborted';
  progress: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ScanTask {
  id: string;
  jobId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface ScoringWeights {
  osint: number;
  technical: number;
  reputation: number;
  behavioral: number;
}

export interface ScoringData {
  jobId: string;
  weights: ScoringWeights;
  scores: {
    overall: number;
    osint: number;
    technical: number;
    reputation: number;
    behavioral: number;
  };
  chartData: Array<{
    category: string;
    score: number;
    weight: number;
  }>;
}

export interface ReportData {
  jobId: string;
  status: 'generating' | 'ready' | 'failed';
  downloadUrl?: string;
  format: 'pdf' | 'html';
  generatedAt?: string;
}

export interface UploadFile {
  id: string;
  filename: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'uploading' | 'uploaded' | 'failed';
}

export interface AdminSettings {
  osintConnectors: {
    shodan: { apiKey?: string; enabled: boolean };
    virustotal: { apiKey?: string; enabled: boolean };
    greynoise: { apiKey?: string; enabled: boolean };
  };
  systemSettings: {
    maxConcurrentScans: number;
    defaultScanTimeout: number;
    retentionDays: number;
  };
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Utility types
export type ApiError = {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
};

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortDirection = 'asc' | 'desc';

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableFilter {
  key: string;
  value: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith';
}