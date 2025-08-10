
# 🚀 Quick Start Guide

## Prerequisites
- **Docker Desktop** installed and running
- Download from: https://www.docker.com/products/docker-desktop/

## 🎯 One-Click Start

### Option 1: Simple Startup Script (Recommended)
```powershell
.\start-dashboard.ps1
```

### Option 2: Manual Docker Commands
```bash
# Build and start
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

## 🌐 Access Your Application

Once started, access your application at:
- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🔐 Login Credentials
- **Username**: admin
- **Password**: admin123

## 📋 Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop application
docker-compose down

# Restart application
docker-compose restart

# Check status
docker-compose ps
```

## 🛠️ Troubleshooting

### If containers don't start:
1. Make sure Docker Desktop is running
2. Check logs: `docker-compose logs`
3. Try rebuilding: `docker-compose down && docker-compose up --build`

### If port 3000 is already in use:
1. Stop other applications using port 3000
2. Or modify the port in `docker-compose.yml`

## 📁 Project Structure
```
Dashboard-main/
├── frontend/          # React application
├── backend/           # Node.js API
├── docker-compose.yml # Docker configuration
├── Dockerfile         # Container setup
└── start-dashboard.ps1 # Quick start script
```

## 🎨 Features
- Modern glassy UI design
- User authentication
- Profile management
- Data visualization
- Responsive design

---

**Need help?** Check the main README.md for detailed documentation. 