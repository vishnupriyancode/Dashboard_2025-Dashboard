# Dashboard Docker Stop Script
# This script stops and removes the dashboard Docker containers

Write-Host "Stopping Dashboard Docker Containers..." -ForegroundColor Yellow

# Stop and remove containers
Write-Host "Stopping containers..." -ForegroundColor Yellow
docker-compose -f docker/docker-compose.yml down

# Remove volumes (optional - uncomment if you want to clear data)
# Write-Host "Removing volumes..." -ForegroundColor Yellow
# docker-compose -f docker/docker-compose.yml down -v

Write-Host "Dashboard containers stopped successfully!" -ForegroundColor Green
Write-Host "To start again, run: .\scripts\run-docker.ps1" -ForegroundColor Cyan 