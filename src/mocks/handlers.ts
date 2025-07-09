import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any;
    
    // Test credentials
    if (email === 'admin@reveal.me' && password === 'password123') {
      return HttpResponse.json({
        data: {
          accessToken: 'mock-access-token',
          user: {
            id: '1',
            email: 'admin@reveal.me',
            role: 'admin',
            name: 'Admin User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    }
    
    if (email === 'user@reveal.me' && password === 'password123') {
      return HttpResponse.json({
        data: {
          accessToken: 'mock-access-token',
          user: {
            id: '2',
            email: 'user@reveal.me',
            role: 'viewer',
            name: 'Test User',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Mock refresh endpoint
  http.post('/api/auth/refresh', () => {
    return HttpResponse.json({
      data: {
        accessToken: 'mock-refresh-token'
      }
    });
  }),

  // Mock user info endpoint
  http.get('/api/auth/me', () => {
    return HttpResponse.json({
      data: {
        id: '1',
        email: 'admin@reveal.me',
        role: 'admin',
        name: 'Admin User',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }),

  // Mock logout endpoint
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ data: null });
  })
];