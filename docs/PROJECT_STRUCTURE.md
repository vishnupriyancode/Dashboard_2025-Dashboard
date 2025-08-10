# Dashboard 2025 - Project Structure

## 📁 Folder Organization

This project follows a professional folder structure for better organization and maintainability.

### Root Directory Structure

```
Dashboard_2025/
├── 📁 backend/           # Backend Node.js application
├── 📁 frontend/          # Frontend React application
├── 📁 scripts/           # PowerShell and shell scripts
├── 📁 tests/             # Test files and connection scripts
├── 📁 docs/              # Documentation files
├── 📁 data/              # Data files (Excel, CSV, etc.)
├── 📁 config/            # Configuration files
├── 📁 docker/            # Docker-related files
├── 📁 logs/              # Application logs
└── 📁 .git/              # Git repository
```

## 📂 Detailed Folder Descriptions

### 🛠️ `scripts/` - Automation Scripts
Contains all PowerShell and shell scripts for managing the application:

- **`start-dashboard.ps1`** - Main entry point for dashboard operations
- **`run-docker.ps1`** - Docker container management
- **`test-setup.ps1`** - Comprehensive setup testing
- **`dashboard-manager.ps1`** - Advanced dashboard management
- **`start.sh`** - Container startup script

### 🧪 `tests/` - Testing Files
Contains test scripts and connection verification:

- **`test-connection.js`** - Database connectivity test

### 📚 `docs/` - Documentation
Project documentation and guides:

- **`README.md`** - Main project documentation
- **`QUICK_START.md`** - Quick start guide
- **`PROJECT_STRUCTURE.md`** - This file

### 📊 `data/` - Data Files
Contains data files and exports:

- **`api_responses.xlsx`** - API response data
- **`api_responses_3000.xlsx`** - Extended API response data

### ⚙️ `config/` - Configuration Files
Application configuration files:

- **`package.json`** - Node.js dependencies
- **`package-lock.json`** - Dependency lock file

### 🐳 `docker/` - Docker Configuration
Docker-related configuration files:

- **`Dockerfile`** - Container build instructions
- **`docker-compose.yml`** - Multi-container orchestration

## 🚀 Usage

### Quick Start
```powershell
# Start the dashboard
.\scripts\start-dashboard.ps1

# Run tests
.\scripts\start-dashboard.ps1 -Action test

# Check status
.\scripts\start-dashboard.ps1 -Action status

# View logs
.\scripts\start-dashboard.ps1 -Action logs

# Stop the dashboard
.\scripts\start-dashboard.ps1 -Action stop
```

### Available Actions
- **`start`** - Start the dashboard application
- **`stop`** - Stop the dashboard application
- **`test`** - Run setup tests
- **`logs`** - View application logs
- **`status`** - Check application status

## 🔧 Script Functions

### Main Scripts
1. **`start-dashboard.ps1`** - Centralized control script
2. **`run-docker.ps1`** - Docker container lifecycle management
3. **`test-setup.ps1`** - Post-deployment verification
4. **`test-connection.js`** - Database connectivity verification

### Workflow
1. **Deploy** → `run-docker.ps1`
2. **Start** → `start.sh` (inside container)
3. **Test** → `test-setup.ps1`
4. **Verify** → `test-connection.js`

## 📝 Notes

- All scripts are designed for Windows PowerShell environment
- Docker containers are used for isolation and consistency
- Database connectivity is verified before application startup
- Comprehensive testing ensures proper deployment 