# Dashboard Application Manager
# Main entry point for dashboard operations

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "test", "logs", "status")]
    [string]$Action = "start"
)

Write-Host "🚀 Dashboard Application Manager" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

switch ($Action) {
    "start" {
        Write-Host "Starting Dashboard Application..." -ForegroundColor Yellow
        & "$PSScriptRoot\run-docker.ps1"
    }
    "stop" {
        Write-Host "Stopping Dashboard Application..." -ForegroundColor Yellow
        docker-compose -f "../docker/docker-compose.yml" down --volumes --remove-orphans
        Write-Host "✅ Dashboard stopped successfully" -ForegroundColor Green
    }
    "test" {
        Write-Host "Running Setup Tests..." -ForegroundColor Yellow
        & "$PSScriptRoot\test-setup.ps1"
    }
    "logs" {
        Write-Host "Showing Application Logs..." -ForegroundColor Yellow
        docker-compose -f "../docker/docker-compose.yml" logs -f
    }
    "status" {
        Write-Host "Checking Application Status..." -ForegroundColor Yellow
        docker-compose -f "../docker/docker-compose.yml" ps
    }
}

Write-Host "`n✅ Operation completed!" -ForegroundColor Green 