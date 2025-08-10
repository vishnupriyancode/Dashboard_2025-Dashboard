# Dashboard Docker Setup Script
# This script builds and runs the dashboard application using Docker Compose

Write-Host "Starting Dashboard Docker Setup..." -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is available
Write-Host "Checking Docker Compose..." -ForegroundColor Yellow
try {
    docker-compose --version | Out-Null
    Write-Host "Docker Compose is available" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose is not available. Please install Docker Compose." -ForegroundColor Red
    exit 1
}

# Stop any existing containers
Write-Host "Stopping any existing containers..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml down 2>$null

# Remove any existing images to ensure fresh build
Write-Host "Removing existing dashboard image..." -ForegroundColor Yellow
docker rmi dashboard-dashboard 2>$null

# Build and start the containers
Write-Host "Building and starting containers..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml up --build -d

# Wait for containers to be ready
Write-Host "Waiting for containers to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Check container status
Write-Host "Checking container status..." -ForegroundColor Yellow
$postgresStatus = docker ps --filter "name=dashboard-postgres" --format "table {{.Status}}" 2>$null
$appStatus = docker ps --filter "name=dashboard-app" --format "table {{.Status}}" 2>$null

if ($postgresStatus -and $appStatus) {
    Write-Host "All containers are running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Dashboard is now available at: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "PostgreSQL is running on port: 5432" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Default login credentials:" -ForegroundColor Yellow
    Write-Host "  Username: admin" -ForegroundColor White
    Write-Host "  Password: admin123" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker-compose -f docker/docker-compose.yml logs -f" -ForegroundColor Gray
    Write-Host "To stop: docker-compose -f docker/docker-compose.yml down" -ForegroundColor Gray
} else {
    Write-Host "Some containers failed to start. Checking logs..." -ForegroundColor Red
    docker-compose -f docker/docker-compose.yml logs
    exit 1
} 