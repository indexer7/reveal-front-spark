# Reveal.me Frontend

A production-ready OSINT (Open Source Intelligence) scanning platform built with React, TypeScript, and modern web technologies.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

## 🏗️ Tech Stack

- **React 18** + **TypeScript** - Modern UI framework with type safety
- **Vite** - Fast build tool and dev server  
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router v6** - Client-side routing
- **React Query** - Data fetching and caching
- **React Flow** - Interactive diagrams
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **MSW** - API mocking for development
- **Vitest** - Unit testing framework

## 🌟 Features

### Core Functionality
- **Target Selection** - Add domains, IPs, emails, phone numbers for scanning
- **Real-time Monitoring** - Live scan progress with WebSocket updates (TODO)
- **Interactive Scoring** - Adjust risk weights with live chart updates
- **Report Generation** - PDF and HTML reports with comprehensive analysis
- **File Upload** - Drag-and-drop file management with progress tracking

### Security & Access Control
- **JWT Authentication** - Secure token-based auth with refresh tokens
- **Role-based Access** - Admin, Analyst, and Viewer roles
- **Protected Routes** - Automatic redirect for unauthenticated users
- **HttpOnly Cookies** - Secure refresh token storage

### User Experience
- **Professional Design** - Blue gradient theme with smooth animations
- **Responsive Layout** - Mobile-first design with collapsible sidebar
- **Real-time Updates** - Live polling for scan status and progress
- **Toast Notifications** - User-friendly success/error messaging
- **Loading States** - Skeleton loaders and spinners throughout

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn components + custom UI
│   └── layout/          # Layout components (sidebar, navbar)
├── hooks/               # Custom React hooks
├── pages/               # Route components
├── routes/              # Route protection logic
├── services/            # API client and services
├── lib/                 # Utilities and type definitions
└── mocks/               # MSW mock handlers
```

## 🔧 Environment Variables

Create a `.env.development` file:

```env
VITE_API_URL=http://localhost:8000
```

## 📚 Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run test       # Run tests with Vitest
```

## 🔐 Authentication Flow

1. **Login/Register** - Email/password with role selection
2. **JWT Tokens** - Access token (memory) + refresh token (HttpOnly cookie)
3. **Auto-refresh** - Transparent token renewal on 401 responses
4. **Role-based Access** - Route protection based on user roles

## 🔗 API Integration

The frontend expects a FastAPI backend with these endpoints:

- `POST /api/auth/login` - User authentication
- `POST /api/auth/register` - User registration  
- `POST /api/scan` - Start new OSINT scan
- `GET /api/scans/:id/status` - Get scan progress
- `GET /api/scoring/:id` - Get risk scoring data
- `POST /api/reports/:id/generate` - Generate reports

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests in watch mode  
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 🚀 Deployment

```bash
# Build for production
npm run build

# The dist/ folder contains optimized static files
# Deploy to any static hosting service
```

## 🎨 Design System

The application uses a custom blue-themed design system built on top of Tailwind CSS:

- **Primary Colors** - Professional blue gradients
- **Typography** - Clean, readable font hierarchy
- **Components** - Consistent spacing and rounded corners
- **Animations** - Smooth transitions and hover effects
- **Dark Mode** - Full dark theme support (TODO)

## 🔄 Development Workflow

1. **Mock-first Development** - Use MSW for API mocking during development
2. **Type Safety** - Comprehensive TypeScript coverage
3. **Component Testing** - Test components in isolation
4. **E2E Testing** - Critical user journeys (TODO)

## 📄 License

This project is proprietary software. All rights reserved.

## 🤝 Contributing

1. Follow the existing code style and patterns
2. Add tests for new features
3. Update documentation as needed
4. Use conventional commit messages

---

Built with ❤️ using modern web technologies for professional OSINT operations.