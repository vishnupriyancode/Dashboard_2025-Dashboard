# Dashboard Manager Script
# Unified script to manage the Dashboard application with Docker

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "logs", "clean", "menu", "status")]
    [string]$Action = "menu"
)

Write-Host "🚀 Dashboard Manager" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green

# Check if Docker is running
function Test-DockerRunning {
    Write-Host "Checking Docker status..." -ForegroundColor Yellow
    try {
        docker version | Out-Null
        Write-Host "✅ Docker is running" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
        Write-Host "   Download Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        return $false
    }
}

# Function to show menu
function Show-Menu {
    Write-Host "`nSelect an option:" -ForegroundColor Cyan
    Write-Host "1. Start Application" -ForegroundColor White
    Write-Host "2. Stop Application" -ForegroundColor White
    Write-Host "3. View logs" -ForegroundColor White
    Write-Host "4. Check status" -ForegroundColor White
    Write-Host "5. Clean up (Remove containers and volumes)" -ForegroundColor White
    Write-Host "6. Exit" -ForegroundColor White
    Write-Host ""
}

# Function to start application
function Start-Application {
    Write-Host "`n🚀 Starting Dashboard Application..." -ForegroundColor Yellow
    Write-Host "Building and starting containers..." -ForegroundColor Yellow
    
    # Stop any existing containers first
    docker-compose down 2>$null
    
    # Build and start containers
    docker-compose up --build -d
    
    # Wait for containers to start
    Write-Host "`n⏳ Waiting for application to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check container status
    Write-Host "`n📊 Checking container status..." -ForegroundColor Yellow
    $containers = docker-compose ps --format json | ConvertFrom-Json
    $allRunning = $true

    foreach ($container in $containers) {
        if ($container.State -eq "running") {
            Write-Host "✅ $($container.Service): Running" -ForegroundColor Green
        } else {
            Write-Host "❌ $($container.Service): $($container.State)" -ForegroundColor Red
            $allRunning = $false
        }
    }

    if ($allRunning) {
        Write-Host "`n✅ Application started successfully!" -ForegroundColor Green
        Write-Host "`n🌐 Access your application:" -ForegroundColor Cyan
        Write-Host "   Main App: http://localhost:3000" -ForegroundColor White
        Write-Host "   Health Check: http://localhost:3000/api/health" -ForegroundColor White
        Write-Host "   Database: localhost:5432" -ForegroundColor White
        
        Write-Host "`n🔐 Default Login Credentials:" -ForegroundColor Yellow
        Write-Host "   Username: admin@example.com" -ForegroundColor White
        Write-Host "   Password: admin123" -ForegroundColor White
        
        # Try to open the application in default browser
        try {
            Start-Process "http://localhost:3000"
            Write-Host "`n🌐 Opening application in your browser..." -ForegroundColor Green
        } catch {
            Write-Host "`n💡 Please manually open: http://localhost:3000" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n❌ Some containers failed to start. Check logs with:" -ForegroundColor Red
        Write-Host "   docker-compose logs" -ForegroundColor Yellow
    }
}

# Function to stop containers
function Stop-Application {
    Write-Host "`n🛑 Stopping Dashboard Application..." -ForegroundColor Red
    Write-Host "=================================" -ForegroundColor Red
    
    Write-Host "`nStopping containers..." -ForegroundColor Yellow
    docker-compose down
    
    Write-Host "`n✅ Dashboard application stopped successfully!" -ForegroundColor Green
    Write-Host "`n💡 To start again, run: .\dashboard-manager.ps1 start" -ForegroundColor Cyan
}

# Function to view logs
function Show-Logs {
    Write-Host "`n📋 Showing logs (Press Ctrl+C to exit)..." -ForegroundColor Yellow
    docker-compose logs -f
}

# Function to check status
function Check-Status {
    Write-Host "`n📊 Checking application status..." -ForegroundColor Yellow
    $containers = docker-compose ps --format json | ConvertFrom-Json
    
    if ($containers.Count -eq 0) {
        Write-Host "❌ No containers are running" -ForegroundColor Red
        return
    }
    
    $allRunning = $true
    foreach ($container in $containers) {
        if ($container.State -eq "running") {
            Write-Host "✅ $($container.Service): Running" -ForegroundColor Green
        } else {
            Write-Host "❌ $($container.Service): $($container.State)" -ForegroundColor Red
            $allRunning = $false
        }
    }
    
    if ($allRunning) {
        Write-Host "`n🎉 Dashboard is running!" -ForegroundColor Green
        Write-Host "🌐 Access at: http://localhost:3000" -ForegroundColor Cyan
    } else {
        Write-Host "`n⚠️  Some containers are not running properly" -ForegroundColor Yellow
    }
}

# Function to clean up
function Clean-Up {
    Write-Host "`n🧹 Cleaning up containers and volumes..." -ForegroundColor Yellow
    Write-Host "⚠️  This will remove all data!" -ForegroundColor Red
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker-compose down -v
        docker system prune -f
        Write-Host "✅ Cleanup completed" -ForegroundColor Green
    } else {
        Write-Host "❌ Cleanup cancelled" -ForegroundColor Yellow
    }
}

# Main execution based on parameter
if (-not (Test-DockerRunning)) {
    exit 1
}

switch ($Action) {
    "start" { 
        Start-Application
        Write-Host "`nPress any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "stop" { 
        Stop-Application
        Write-Host "`nPress any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "logs" { Show-Logs }
    "status" { 
        Check-Status
        Write-Host "`nPress any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "clean" { 
        Clean-Up
        Write-Host "`nPress any key to exit..." -ForegroundColor Gray
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    }
    "menu" {
        # Main script loop
        do {
            Show-Menu
            $choice = Read-Host "Enter your choice (1-6)"
            
            switch ($choice) {
                "1" { Start-Application }
                "2" { Stop-Application }
                "3" { Show-Logs }
                "4" { Check-Status }
                "5" { Clean-Up }
                "6" { 
                    Write-Host "`n👋 Goodbye!" -ForegroundColor Green
                    exit 0 
                }
                default { 
                    Write-Host "`n❌ Invalid choice. Please try again." -ForegroundColor Red 
                }
            }
            
            if ($choice -ne "6") {
                Write-Host "`nPress any key to continue..." -ForegroundColor Gray
                $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
            }
        } while ($choice -ne "6")
    }
    default {
        Write-Host "`n❌ Invalid action. Use: start, stop, logs, clean, menu, or status" -ForegroundColor Red
        Write-Host "`n💡 Examples:" -ForegroundColor Cyan
        Write-Host "   .\dashboard-manager.ps1 start" -ForegroundColor Gray
        Write-Host "   .\dashboard-manager.ps1 stop" -ForegroundColor Gray
        Write-Host "   .\dashboard-manager.ps1 logs" -ForegroundColor Gray
        Write-Host "   .\dashboard-manager.ps1 menu" -ForegroundColor Gray
    }
} 