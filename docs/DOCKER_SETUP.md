# Docker Setup Guide

This guide will help you run the Dashboard application using Docker without any issues.

## Prerequisites

1. **Docker Desktop** - Make sure Docker Desktop is installed and running
2. **Docker Compose** - Should be included with Docker Desktop
3. **PowerShell** - For running the setup scripts

## Quick Start

### Option 1: Using PowerShell Scripts (Recommended)

1. **Start the application:**
   ```powershell
   .\scripts\run-docker.ps1
   ```

2. **Stop the application:**
   ```powershell
   .\scripts\stop-docker.ps1
   ```

### Option 2: Manual Docker Commands

1. **Navigate to the project root:**
   ```powershell
   cd Dashboard_2025
   ```

2. **Build and start containers:**
   ```powershell
   docker-compose -f docker/docker-compose.yml up --build -d
   ```

3. **Stop containers:**
   ```powershell
   docker-compose -f docker/docker-compose.yml down
   ```

## Accessing the Application

- **Dashboard URL:** http://localhost:3000
- **PostgreSQL Database:** localhost:5432
- **Default Login Credentials:**
  - Username: `admin`
  - Password: `admin123`

## Container Architecture

The application runs with two containers:

1. **PostgreSQL Database** (`dashboard-postgres`)
   - Port: 5432
   - Database: dashboard_db
   - User: dashboard_user
   - Password: dashboard_pass

2. **Dashboard Application** (`dashboard-app`)
   - Port: 3000 (mapped from container port 5001)
   - Serves both API and frontend
   - Built with Node.js 18 Alpine

## Useful Commands

### View Logs
```powershell
# View all logs
docker-compose -f docker/docker-compose.yml logs -f

# View specific service logs
docker-compose -f docker/docker-compose.yml logs -f dashboard
docker-compose -f docker/docker-compose.yml logs -f postgres
```

### Container Management
```powershell
# Check container status
docker-compose -f docker/docker-compose.yml ps

# Restart containers
docker-compose -f docker/docker-compose.yml restart

# Remove containers and volumes (WARNING: This will delete all data)
docker-compose -f docker/docker-compose.yml down -v
```

### Database Access
```powershell
# Connect to PostgreSQL container
docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard_db

# Backup database
docker exec dashboard-postgres pg_dump -U dashboard_user dashboard_db > backup.sql
```

## Troubleshooting

### Common Issues

1. **Port 3000 or 5432 already in use**
   ```powershell
   # Find processes using the ports
   netstat -ano | findstr :3000
   netstat -ano | findstr :5432
   
   # Kill the processes or change ports in docker-compose.yml
   ```

2. **Docker not running**
   - Start Docker Desktop
   - Wait for Docker to fully initialize
   - Try running the script again

3. **Build fails**
   ```powershell
   # Clean up and rebuild
   docker-compose -f docker/docker-compose.yml down
   docker system prune -f
   docker-compose -f docker/docker-compose.yml up --build -d
   ```

4. **Database connection issues**
   - Check if PostgreSQL container is running: `docker ps`
   - Check PostgreSQL logs: `docker-compose -f docker/docker-compose.yml logs postgres`
   - Ensure the DATABASE_URL environment variable is correct

5. **Frontend not loading**
   - Check if the build process completed successfully
   - Verify the static files are being served correctly
   - Check browser console for errors

### Reset Everything

If you need to start completely fresh:

```powershell
# Stop and remove everything
docker-compose -f docker/docker-compose.yml down -v
docker system prune -f
docker volume prune -f

# Rebuild from scratch
.\scripts\run-docker.ps1
```

## Development vs Production

- **Development:** The current setup is optimized for development with hot reloading disabled
- **Production:** For production deployment, consider:
  - Using environment variables for sensitive data
  - Setting up proper SSL/TLS certificates
  - Configuring proper logging and monitoring
  - Using a reverse proxy like nginx

## File Structure

```
Dashboard_2025/
├── docker/
│   ├── docker-compose.yml    # Container orchestration
│   └── Dockerfile           # Application container definition
├── scripts/
│   ├── run-docker.ps1       # Start script
│   ├── stop-docker.ps1      # Stop script
│   └── start.sh             # Container startup script
├── backend/                 # Backend application
├── frontend/               # Frontend application
└── docs/                   # Documentation
```

## Environment Variables

The following environment variables are configured in `docker-compose.yml`:

- `NODE_ENV=production`
- `PORT=5001`
- `DATABASE_URL=postgresql://dashboard_user:dashboard_pass@postgres:5432/dashboard_db`
- `REACT_APP_API_URL=http://localhost:3000/api`

## Support

If you encounter any issues:

1. Check the logs: `docker-compose -f docker/docker-compose.yml logs`
2. Verify Docker is running: `docker version`
3. Check container status: `docker ps`
4. Review this troubleshooting guide
5. Check the main README.md for additional information 