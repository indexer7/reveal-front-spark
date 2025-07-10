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
  },
  {
    id: '3',
    email: 'analyst@reveal.me',
    password: 'analyst123',
    role: 'analyst' as const,
    name: 'Data Analyst',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    email: 'manager@reveal.me',
    password: 'manager123',
    role: 'admin' as const,
    name: 'System Manager',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let currentUser: typeof mockUsers[0] | null = null;

export const enableMockApi = () => {
  // Clear existing interceptors
  api.interceptors.request.clear();
  api.interceptors.response.clear();
  
  // Add response interceptor for mocking
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config;
      const url = config?.url || '';
      
      // Mock login
      if (url.includes('/api/auth/login') && config?.method === 'post') {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            const { email, password } = JSON.parse(config.data || '{}');
            const user = mockUsers.find(u => u.email === email && u.password === password);
            
            if (user) {
              currentUser = user;
              const { password: _, ...userWithoutPassword } = user;
              resolve({
                data: {
                  data: {
                    accessToken: 'mock-access-token-' + Date.now(),
                    user: userWithoutPassword
                  }
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
              });
            } else {
              reject({
                response: {
                  status: 401,
                  data: { error: 'Invalid credentials' }
                }
              });
            }
          }, 500);
        });
      }
      
      // Mock register (removed functionality)
      if (url.includes('/api/auth/register') && config?.method === 'post') {
        return Promise.reject({
          response: {
            status: 403,
            data: { error: 'Registration is disabled. Contact administrator for access.' }
          }
        });
      }
      
      // Mock refresh
      if (url.includes('/api/auth/refresh') && config?.method === 'post') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              data: {
                data: { accessToken: 'mock-refresh-token-' + Date.now() }
              },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            });
          }, 200);
        });
      }
      
      // Mock me endpoint
      if (url.includes('/api/auth/me') && config?.method === 'get') {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (currentUser) {
              const { password: _, ...userWithoutPassword } = currentUser;
              resolve({
                data: { data: userWithoutPassword },
                status: 200,
                statusText: 'OK',
                headers: {},
                config
              });
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
      if (url.includes('/api/auth/logout') && config?.method === 'post') {
        return new Promise((resolve) => {
          setTimeout(() => {
            currentUser = null;
            resolve({
              data: { data: null },
              status: 200,
              statusText: 'OK',
              headers: {},
              config
            });
          }, 200);
        });
      }
      
      return Promise.reject(error);
    }
  );
};