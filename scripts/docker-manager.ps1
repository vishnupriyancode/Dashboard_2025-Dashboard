param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("build", "start", "stop", "restart", "logs", "status", "clean", "shell")]
    [string]$Action = "status"
)

$ContainerName = "dashboard-app"
$ImageName = "dashboard:latest"
$ComposeFile = "docker/docker-compose.yml"

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Docker {
    try {
        docker --version | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Get-ContainerStatus {
    $container = docker ps -a --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($container -and $container -notlike "*$ContainerName*") {
        return "not-running"
    }
    $running = docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($running -and $running -like "*$ContainerName*") {
        return "running"
    }
    return "stopped"
}

function Start-Dashboard {
    Write-Info "Starting dashboard application..."
    
    if (-not (Test-Path $ComposeFile)) {
        Write-Error "Docker Compose file not found at $ComposeFile"
        return
    }
    
    try {
        Set-Location (Split-Path $ComposeFile)
        docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dashboard started successfully!"
            Write-Info "Frontend: http://localhost:3000"
            Write-Info "Backend API: http://localhost:5001"
        } else {
            Write-Error "Failed to start dashboard"
        }
    }
    catch {
        Write-Error "Error starting dashboard: $_"
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Stop-Dashboard {
    Write-Info "Stopping dashboard application..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        docker-compose down
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dashboard stopped successfully!"
        } else {
            Write-Error "Failed to stop dashboard"
        }
    }
    catch {
        Write-Error "Error stopping dashboard: $_"
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Build-Dashboard {
    Write-Info "Building dashboard Docker image..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        docker-compose build --no-cache
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dashboard image built successfully!"
        } else {
            Write-Error "Failed to build dashboard image"
        }
    }
    catch {
        Write-Error "Error building dashboard: $_"
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Show-Logs {
    Write-Info "Showing dashboard logs..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        docker-compose logs -f
    }
    catch {
        Write-Error "Error showing logs: $_"
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Show-Status {
    Write-Info "Dashboard Status:"
    Write-Host "=================" -ForegroundColor Yellow
    
    $status = Get-ContainerStatus
    switch ($status) {
        "running" {
            Write-Success "Container is running"
            $container = docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            Write-Host $container
        }
        "stopped" {
            Write-Host "Container is stopped" -ForegroundColor Yellow
        }
        "not-running" {
            Write-Host "Container does not exist" -ForegroundColor Gray
        }
    }
    
    Write-Host "`nPorts:" -ForegroundColor Yellow
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor White
    Write-Host "Backend:  http://localhost:5001" -ForegroundColor White
}

function Clean-Docker {
    Write-Info "Cleaning up Docker resources..."
    
    try {
        # Stop and remove containers
        docker stop $ContainerName 2>$null
        docker rm $ContainerName 2>$null
        
        # Remove image
        docker rmi $ImageName 2>$null
        
        # Clean up unused resources
        docker system prune -f
        
        Write-Success "Docker cleanup completed!"
    }
    catch {
        Write-Error "Error during cleanup: $_"
    }
}

function Enter-Shell {
    Write-Info "Entering dashboard container shell..."
    
    $status = Get-ContainerStatus
    if ($status -eq "running") {
        docker exec -it $ContainerName /bin/sh
    } else {
        Write-Error "Container is not running. Start it first with: .\docker-manager.ps1 -Action start"
    }
}

# Main execution
if (-not (Test-Docker)) {
    Write-Error "Docker is not installed or not running. Please install Docker Desktop and try again."
    exit 1
}

switch ($Action) {
    "build" { Build-Dashboard }
    "start" { Start-Dashboard }
    "stop" { Stop-Dashboard }
    "restart" { Stop-Dashboard; Start-Sleep 2; Start-Dashboard }
    "logs" { Show-Logs }
    "status" { Show-Status }
    "clean" { Clean-Docker }
    "shell" { Enter-Shell }
    default { Show-Status }
}
