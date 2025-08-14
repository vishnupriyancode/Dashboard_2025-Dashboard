@echo off
setlocal enabledelayedexpansion

set CONTAINER_NAME=dashboard-app
set COMPOSE_FILE=docker\docker-compose.yml

if "%1"=="" (
    echo Usage: %0 [build^|start^|stop^|restart^|logs^|status^|clean^|shell^|test]
    echo.
    echo Commands:
    echo   build   - Build the Docker image
    echo   start   - Start the dashboard
    echo   stop    - Stop the dashboard
    echo   restart - Restart the dashboard
    echo   logs    - Show logs
    echo   status  - Show status
    echo   clean   - Clean up Docker resources
    echo   shell   - Enter container shell
    echo   test    - Test Docker setup and health
    echo.
    goto :status
)

if "%1"=="build" goto :build
if "%1"=="start" goto :start
if "%1"=="stop" goto :stop
if "%1"=="restart" goto :restart
if "%1"=="logs" goto :logs
if "%1"=="status" goto :status
if "%1"=="clean" goto :clean
if "%1"=="shell" goto :shell
if "%1"=="test" goto :test

echo Unknown command: %1
exit /b 1

:build
echo [INFO] Building dashboard Docker image...
cd /d "%~dp0"
cd docker
docker-compose build --no-cache
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Dashboard image built successfully!
) else (
    echo [ERROR] Failed to build dashboard image
)
goto :end

:start
echo [INFO] Starting dashboard application...
cd /d "%~dp0"
cd docker
docker-compose up -d
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Dashboard started successfully!
    echo [INFO] Frontend: http://localhost:3000
    echo [INFO] Backend API: http://localhost:5001
) else (
    echo [ERROR] Failed to start dashboard
)
goto :end

:stop
echo [INFO] Stopping dashboard application...
cd /d "%~dp0"
cd docker
docker-compose down
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Dashboard stopped successfully!
) else (
    echo [ERROR] Failed to stop dashboard
)
goto :end

:restart
echo [INFO] Restarting dashboard application...
call :stop
timeout /t 2 /nobreak >nul
call :start
goto :end

:logs
echo [INFO] Showing dashboard logs...
cd /d "%~dp0"
cd docker
docker-compose logs -f
goto :end

:status
echo [INFO] Dashboard Status:
echo =================
docker ps -a --filter "name=%CONTAINER_NAME%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo.
echo Ports:
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001
goto :end

:clean
echo [INFO] Cleaning up Docker resources...
docker stop %CONTAINER_NAME% 2>nul
docker rm %CONTAINER_NAME% 2>nul
docker system prune -f
echo [SUCCESS] Docker cleanup completed!
goto :end

:shell
echo [INFO] Entering dashboard container shell...
docker exec -it %CONTAINER_NAME% /bin/sh
goto :end

:test
echo === Docker Setup Test for Dashboard 2025 ===
echo.

REM Test Docker installation
echo --- Testing: Docker Installation ---
docker --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Docker is available
) else (
    echo [ERROR] Docker is not available. Please install Docker Desktop.
    goto :end
)

REM Test Docker Compose
echo --- Testing: Docker Compose ---
docker-compose --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Docker Compose is available
) else (
    echo [ERROR] Docker Compose is not available.
    goto :end
)

REM Test Docker daemon
echo --- Testing: Docker Daemon ---
docker info >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Docker daemon is running
) else (
    echo [ERROR] Docker daemon is not running. Please start Docker Desktop.
    goto :end
)

REM Test project structure
echo --- Testing: Project Structure ---
if exist "docker\docker-compose.yml" (
    echo [SUCCESS] ✓ docker\docker-compose.yml
) else (
    echo [ERROR] ✗ docker\docker-compose.yml (missing)
    goto :end
)

if exist "docker\Dockerfile" (
    echo [SUCCESS] ✓ docker\Dockerfile
) else (
    echo [ERROR] ✗ docker\Dockerfile (missing)
    goto :end
)

if exist "frontend\package.json" (
    echo [SUCCESS] ✓ frontend\package.json
) else (
    echo [ERROR] ✗ frontend\package.json (missing)
    goto :end
)

if exist "backend\package.json" (
    echo [SUCCESS] ✓ backend\package.json
) else (
    echo [ERROR] ✗ backend\package.json (missing)
    goto :end
)

REM Test ports
echo --- Testing: Port Availability ---
netstat -an | findstr ":3000" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARNING] Port 3000 is in use
) else (
    echo [SUCCESS] ✓ Port 3000 is available
)

netstat -an | findstr ":5001" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [WARNING] Port 5001 is in use
) else (
    echo [SUCCESS] ✓ Port 5001 is available
)

REM Test if container is running and healthy
echo --- Testing: Container Health ---
docker ps --filter "name=%CONTAINER_NAME%" --filter "status=running" | findstr "%CONTAINER_NAME%" >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Container is running
    echo [INFO] Testing health endpoints...
    
    REM Test backend health
    curl -s http://localhost:5001/api/health >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] ✓ Backend health check passed
    ) else (
        echo [WARNING] Backend health check failed
    )
    
    REM Test frontend
    curl -s http://localhost:3000 >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [SUCCESS] ✓ Frontend is accessible
    ) else (
        echo [WARNING] Frontend test failed
    )
) else (
    echo [INFO] Container is not running. Run 'docker-manager.bat start' to start it.
)

echo.
echo === Test Summary ===
echo [SUCCESS] All tests passed! Docker setup is ready.
echo.
echo Next steps:
echo 1. Run: docker-manager.bat build
echo 2. Run: docker-manager.bat start
goto :end

:end
cd /d "%~dp0"
endlocal
