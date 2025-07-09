// Simple axios interceptor-based mocking
import api from '@/services/api';

const mockUsers = [
  {
    id: '1',
    email: 'admin@reveal.me',
    password: 'password123',
    role: 'admin' as const,
    name: 'Admin User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'user@reveal.me',
    password: 'password123',
    role: 'viewer' as const,
    name: 'Test User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let currentUser: typeof mockUsers[0] | null = null;

export const enableMockApi = () => {
  // Remove any existing interceptors
  api.interceptors.response.clear();
  
  // Add mock interceptor
  api.interceptors.request.use((config) => {
    const url = config.url || '';
    
    // Mock login
    if (url.includes('/api/auth/login') && config.method === 'post') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const { email, password } = JSON.parse(config.data || '{}');
          const user = mockUsers.find(u => u.email === email && u.password === password);
          
          if (user) {
            currentUser = user;
            const { password: _, ...userWithoutPassword } = user;
            resolve({
              ...config,
              data: {
                data: {
                  accessToken: 'mock-access-token-' + Date.now(),
                  user: userWithoutPassword
                }
              }
            } as any);
          } else {
            reject({
              response: {
                status: 401,
                data: { error: 'Invalid credentials' }
              }
            });
          }
        }, 500); // Simulate network delay
      });
    }
    
    // Mock refresh
    if (url.includes('/api/auth/refresh') && config.method === 'post') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ...config,
            data: {
              data: { accessToken: 'mock-refresh-token-' + Date.now() }
            }
          } as any);
        }, 200);
      });
    }
    
    // Mock me endpoint
    if (url.includes('/api/auth/me') && config.method === 'get') {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (currentUser) {
            const { password: _, ...userWithoutPassword } = currentUser;
            resolve({
              ...config,
              data: { data: userWithoutPassword }
            } as any);
          } else {
            reject({
              response: {
                status: 401,
                data: { error: 'Unauthorized' }
              }
            });
          }
        }, 200);
      });
    }
    
    // Mock logout
    if (url.includes('/api/auth/logout') && config.method === 'post') {
      return new Promise((resolve) => {
        setTimeout(() => {
          currentUser = null;
          resolve({
            ...config,
            data: { data: null }
          } as any);
        }, 200);
      });
    }
    
    return config;
  });
};