#  BRT (Blume Reserve Ticket) Management System

A full-stack web application for Blume Reserve Ticket operations, built with Laravel (backend) and React + TypeScript (frontend).

## Project Structure

```
├── brt-backend/     # Laravel API backend
├── brt-frontend/    # React + TypeScript frontend
├── README.md        # This file
└── .gitignore       # Git ignore rules
```

## Prerequisites

Before setting up this project, ensure you have the following installed:

- **PHP** >= 8.2
- **Composer** (PHP dependency manager)
- **Node.js** >= 18.x
- **npm** or **yarn** (Node package manager)
- **MySQL** or **PostgreSQL** database
- **Git**

## Quick Setup

### Backend Setup (Laravel)

1. Navigate to the backend directory:
   ```bash
   cd brt-backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Copy environment file and configure:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your database credentials and other configuration.

4. Generate application key:
   ```bash
   php artisan key:generate
   ```

5. Run database migrations:
   ```bash
   php artisan migrate
   ```

6. (Optional) Seed the database:
   ```bash
   php artisan db:seed
   ```

7. Install Node dependencies for asset compilation:
   ```bash
   npm install
   ```

8. Start the development server:
   ```bash
   # Option 1: Use the built-in development script (recommended)
   composer run dev
   
   # Option 2: Manual setup
   php artisan serve  # In one terminal
   npm run dev       # In another terminal
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup (React + TypeScript)

1. Navigate to the frontend directory:
   ```bash
   cd brt-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## Development Workflow

### Running Both Projects Simultaneously

1. **Backend**: From the `brt-backend` directory, run:
   ```bash
   composer run dev
   ```
   This starts the Laravel server, queue worker, logs, and Vite build process.

2. **Frontend**: From the `brt-frontend` directory, run:
   ```bash
   npm run dev
   ```

### Building for Production

**Backend**:
```bash
cd brt-backend
composer install --no-dev --optimize-autoloader
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**Frontend**:
```bash
cd brt-frontend
npm run build
```

## Testing

**Backend Tests**:
```bash
cd brt-backend
composer run test
# or
php artisan test
```

**Frontend Tests**:
```bash
cd brt-frontend
npm run test  # If test script is configured
```

## Key Features

- **Real-time notifications** using Pusher/Laravel Echo
- **JWT Authentication** for secure API access
- **Responsive UI** built with React and TailwindCSS
- **Type-safe** development with TypeScript
- **Modern tooling** with Vite for fast development

## API Documentation

The API endpoints are documented in the backend's route files:
- `brt-backend/routes/api.php` - Main API routes
- `brt-backend/routes/web.php` - Web routes

## Environment Configuration

### Backend (.env)
Key variables to configure:
```env
APP_NAME=BRT
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=brt_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

PUSHER_APP_ID=your_pusher_app_id
PUSHER_APP_KEY=your_pusher_key
PUSHER_APP_SECRET=your_pusher_secret
PUSHER_APP_CLUSTER=your_cluster

JWT_SECRET=your_jwt_secret
```

### Frontend
Create `.env` in `brt-frontend` if needed:
```env
VITE_API_URL=http://localhost:8000/api
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_cluster
```

## Troubleshooting

### Common Issues

1. **"Class not found" errors**: Run `composer dump-autoload`
2. **Database connection issues**: Check your `.env` database configuration
3. **CORS errors**: Ensure your frontend URL is in the backend's CORS configuration
4. **npm/node issues**: Try deleting `node_modules` and running `npm install` again
5. **Permission issues**: Ensure `storage` and `bootstrap/cache` directories are writable

### Clearing Caches

```bash
# Backend
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Frontend
npm run build  # Rebuilds assets
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

This project is licensed under the MIT License.