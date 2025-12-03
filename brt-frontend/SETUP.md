# Frontend React Setup Guide

## Project Overview

This is a React TypeScript application built with Vite, featuring a modern tech stack including React Router, TailwindCSS, React Query, and Zustand for state management. The application provides a dashboard interface for UGG HQ with authentication, access request management, audit logging, and real-time features.

## Tech Stack

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Vite** - Build tool and development server
- **TailwindCSS** - Utility-first CSS framework
- **React Router v7** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Zustand** - Client state management
- **Formik + Yup** - Form handling and validation
- **Axios** - HTTP client
- **Socket.io Client** - Real-time communication
- **Ethers.js** - Web3/Ethereum integration

## Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (or yarn/pnpm equivalent)
- **Git**

## Installation & Setup

### 1. Navigate
```bash
cd ugg-hq-test/frontend-react
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

Configure environment variables in `.env`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# WebSocket Configuration  
VITE_WS_URL=ws://localhost:8000

# App Configuration
VITE_APP_NAME=UGG HQ Dashboard
VITE_APP_VERSION=1.0.0

# Environment
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_WEBSOCKET=true
```

## Development

### Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## Project Structure

```
frontend-react/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── forms/        # Form components (LoginForm, RegisterForm)
│   │   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   │   └── ui/           # Basic UI components
│   ├── containers/        # Page-level components
│   │   ├── AccessRequestManagementPage.tsx
│   │   ├── AuditLogsPage.tsx
│   │   └── Dashboard.tsx
│   ├── features/         # Feature-based modules
│   │   ├── auth/         # Authentication feature
│   │   ├── access-requests/  # Access request management
│   │   └── audit-logs/   # Audit logging
│   ├── hooks/            # Custom React hooks
│   │   └── useWizard.tsx # Multi-step wizard hook
│   ├── services/         # API services
│   │   └── api.ts        # Axios configuration and API client
│   ├── stores/           # Zustand stores
│   │   └── authStore.ts  # Authentication state
│   ├── utils/            # Utility functions
│   │   └── validation/   # Form validation schemas
│   ├── App.tsx           # Main App component
│   └── main.tsx          # Application entry point
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # TailwindCSS configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Key Features

### Authentication System
- JWT-based authentication
- Login/Register forms with validation
- Password visibility toggles
- Protected routes
- Automatic token refresh

### Access Request Management
- Multi-step wizard for access requests
- File upload support with FormData handling
- Admin approval/rejection interface
- Role assignment on approval
- Real-time status updates

### Audit Logging
- Comprehensive activity tracking
- Filterable audit logs
- Search functionality
- Real-time log updates

### State Management
- **Zustand** for authentication state
- **React Query** for server state caching
- **Local Storage** for persistence

## API Integration

The frontend communicates with a Laravel backend via REST API:

- **Base URL**: `http://localhost:8000/api`
- **Authentication**: JWT tokens in Authorization header
- **File Uploads**: Automatic FormData conversion
- **Error Handling**: Centralized error management

### Key API Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `GET /auth/me` - Get current user
- `GET /access-requests` - List access requests
- `POST /access-requests` - Create access request
- `PUT /access-requests/{id}/approve` - Approve request
- `GET /audit-logs` - List audit logs

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React functional components with hooks
- Use custom hooks for complex logic
- Implement proper error boundaries

### Form Management
- Use Formik for form handling
- Implement Yup schemas for validation
- Handle file uploads with FormData

### State Management
- Use Zustand for global client state
- Use React Query for server state
- Avoid prop drilling with context when needed

### Styling
- Use TailwindCSS utility classes
- Follow responsive design principles
- Maintain consistent component styling

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Change port in vite.config.ts or kill existing process
   lsof -ti:5173 | xargs kill
   ```

2. **Environment Variables Not Loading**
   - Ensure variables are prefixed with `VITE_`
   - Restart development server after changes

3. **API Connection Issues**
   - Verify backend server is running on port 8000
   - Check CORS configuration in backend
   - Verify `VITE_API_BASE_URL` in `.env`

4. **Build Errors**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```
## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Update `.env` for production:
```env
VITE_NODE_ENV=production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-websocket-domain.com
```

### Static File Serving
The `dist/` folder contains all static files ready for deployment to any static hosting service (Netlify, Vercel, AWS S3, etc.).

## Contributing

1. Create feature branch from `main`
2. Follow existing code style and patterns
3. Add/update tests for new features
4. Update documentation as needed
5. Submit pull request with clear description

## Support

For development issues:
1. Check console for errors
2. Verify environment configuration
3. Ensure backend API is accessible
4. Check network requests in browser DevTools