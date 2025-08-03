# Dashboard Application

A modern React dashboard application with a glassy UI design, featuring user authentication, data visualization, and profile management.

## 🚀 Quick Start

### Prerequisites
- **Docker Desktop** installed and running
- Download from: https://www.docker.com/products/docker-desktop/

### One-Click Start (Recommended)
```powershell
.\start-dashboard.ps1
```

### Manual Start
```bash
docker-compose up --build
```

### Access Your Application
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

### Login Credentials
- **Username**: admin@example.com
- **Password**: admin123

## 🚀 Features

- **Modern Glassy UI**: Beautiful glassmorphism design with backdrop blur effects
- **User Authentication**: Secure login system with profile management
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Data Visualization**: Interactive charts and data tables
- **Profile Management**: Modern user profile settings with password change functionality
- **Docker Support**: Complete containerization for easy deployment

## 🛠️ Technology Stack

- **Frontend**: React 18, React Router, Chart.js, Tailwind CSS
- **Backend**: Node.js, Express.js, SQLite3
- **Authentication**: bcrypt for password hashing
- **Containerization**: Docker & Docker Compose
- **Database**: SQLite (development) / PostgreSQL (production)

## 📦 Docker Setup

### Quick Commands

```bash
# Start application
.\start-dashboard.ps1

# Stop application
.\stop-dashboard.ps1

# View logs
docker-compose logs -f

# Restart application
docker-compose restart

# Check status
docker-compose ps
```

### Manual Docker Commands

```bash
# Build and start containers
docker-compose up --build

# Start containers in background
docker-compose up --build -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose build dashboard

# Clean up volumes (WARNING: This will delete all data)
docker-compose down -v
```

## 🔧 Manual Setup (Alternative)

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm run install-all
   ```

2. **Start development servers**
   ```bash
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5001

## 📁 Project Structure

```
Dashboard-main/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Login.jsx    # Login component
│   │   │   ├── UserProfile.jsx # Profile management
│   │   │   └── ...
│   │   ├── assets/          # Static assets
│   │   └── ...
├── backend/                  # Node.js backend
│   ├── routes/              # API routes
│   ├── config/              # Database configuration
│   └── ...
├── docker-compose.yml       # Docker setup
├── Dockerfile               # Production Dockerfile
├── start-dashboard.ps1      # Quick start script
├── stop-dashboard.ps1       # Stop script
└── QUICK_START.md          # Quick start guide
```

## 🔐 Authentication

The application includes a secure authentication system:

- **Login**: Modern glassy login interface
- **Profile Management**: User profile settings with password change
- **Session Management**: JWT-based authentication
- **Security**: bcrypt password hashing

### Default Credentials

- **Username**: admin@example.com
- **Password**: admin123

## 🎨 UI Features

### Glassmorphism Design
- Backdrop blur effects
- Translucent backgrounds
- Modern gradient overlays
- Smooth animations and transitions

### Profile Management
- Account information display
- Secure password change functionality
- Modern form design with validation
- Professional button styling with icons

## 🚀 Deployment

### Production Deployment

1. **Build the production image**
   ```bash
   docker build -t dashboard-app .
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Environment Variables**
   ```bash
   # Create .env file for production
   NODE_ENV=production
   PORT=5001
   REACT_APP_API_URL=http://your-domain.com/api
   ```

### Health Checks

The application includes health checks:
- Backend API health endpoint: `/api/health`
- Database connectivity monitoring
- Container health status

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Backend port | `5001` |
| `REACT_APP_API_URL` | Frontend API URL | `http://localhost:3000/api` |

### Database Configuration

- **Development**: SQLite3 (file-based)
- **Production**: PostgreSQL (recommended)

## 📊 Monitoring

### Logs
```bash
# View application logs
docker-compose logs -f dashboard

# View database logs
docker-compose logs -f db
```

### Health Monitoring
- Application health: `http://localhost:3000/api/health`
- Database connectivity monitoring
- Container resource usage

## 🛡️ Security Features

- Non-root user in containers
- Secure password hashing with bcrypt
- CORS configuration
- Input validation and sanitization
- SQL injection protection

## 🔄 Updates and Maintenance

### Updating the Application

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Rebuild containers**
   ```bash
   docker-compose down
   docker-compose up --build -d
   ```

### Backup and Restore

```bash
# Backup database
docker-compose exec db pg_dump -U postgres dashboard > backup.sql

# Restore database
docker-compose exec -T db psql -U postgres dashboard < backup.sql
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - Stop other applications using port 3000
   - Or modify the port in `docker-compose.yml`

2. **Containers won't start**
   - Make sure Docker Desktop is running
   - Check logs: `docker-compose logs`
   - Try rebuilding: `docker-compose down && docker-compose up --build`

3. **Database connection issues**
   - Wait for database to fully start (usually 30-60 seconds)
   - Check database logs: `docker-compose logs db`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Docker logs for troubleshooting

---

**Note**: This application is designed to run in Docker containers for optimal performance and consistency across different environments. 