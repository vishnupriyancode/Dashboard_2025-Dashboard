param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("test", "build", "run", "clean")]
    [string]$Action = "test"
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

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Test-Docker {
    try {
        $version = docker --version
        Write-Success "Docker is available: $version"
        return $true
    }
    catch {
        Write-Error "Docker is not available. Please install Docker Desktop."
        return $false
    }
}

function Test-DockerCompose {
    try {
        $version = docker-compose --version
        Write-Success "Docker Compose is available: $version"
        return $true
    }
    catch {
        Write-Error "Docker Compose is not available."
        return $false
    }
}

function Test-DockerRunning {
    try {
        $info = docker info 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker daemon is running"
            return $true
        } else {
            Write-Error "Docker daemon is not running. Please start Docker Desktop."
            return $false
        }
    }
    catch {
        Write-Error "Cannot connect to Docker daemon. Please start Docker Desktop."
        return $false
    }
}

function Test-ProjectStructure {
    Write-Info "Checking project structure..."
    
    $requiredFiles = @(
        "docker/docker-compose.yml",
        "docker/Dockerfile",
        "scripts/start.sh",
        "frontend/package.json",
        "backend/package.json"
    )
    
    $missingFiles = @()
    foreach ($file in $requiredFiles) {
        if (Test-Path $file) {
            Write-Success "✓ $file"
        } else {
            Write-Error "✗ $file (missing)"
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        Write-Error "Missing required files: $($missingFiles -join ', ')"
        return $false
    }
    
    return $true
}

function Test-Ports {
    Write-Info "Checking port availability..."
    
    $ports = @(3000, 5001)
    $conflicts = @()
    
    foreach ($port in $ports) {
        $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($process) {
            Write-Warning "Port $port is in use by: $($process.ProcessName) (PID: $($process.OwningProcess))"
            $conflicts += $port
        } else {
            Write-Success "✓ Port $port is available"
        }
    }
    
    if ($conflicts.Count -gt 0) {
        Write-Warning "Some ports are in use. You may need to stop conflicting services."
        return $false
    }
    
    return $true
}

function Test-Build {
    Write-Info "Testing Docker build..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        Write-Info "Building Docker image (this may take several minutes)..."
        docker-compose build --no-cache
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker build completed successfully!"
            return $true
        } else {
            Write-Error "Docker build failed!"
            return $false
        }
    }
    catch {
        Write-Error "Error during Docker build: $_"
        return $false
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Test-Run {
    Write-Info "Testing Docker run..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        Write-Info "Starting container..."
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Container started successfully!"
            
            # Wait a moment for services to start
            Start-Sleep 10
            
            # Check container status
            $container = docker ps --filter "name=$ContainerName" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            Write-Info "Container status:"
            Write-Host $container
            
            # Test health endpoint
            Write-Info "Testing health endpoint..."
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5001/api/health" -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Success "✓ Backend health check passed"
                } else {
                    Write-Warning "Backend health check returned status: $($response.StatusCode)"
                }
            }
            catch {
                Write-Warning "Backend health check failed: $_"
            }
            
            # Test frontend
            Write-Info "Testing frontend..."
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Success "✓ Frontend is accessible"
                } else {
                    Write-Warning "Frontend returned status: $($response.StatusCode)"
                }
            }
            catch {
                Write-Warning "Frontend test failed: $_"
            }
            
            return $true
        } else {
            Write-Error "Failed to start container!"
            return $false
        }
    }
    catch {
        Write-Error "Error during Docker run: $_"
        return $false
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

function Clean-Test {
    Write-Info "Cleaning up test environment..."
    
    try {
        Set-Location (Split-Path $ComposeFile)
        docker-compose down
        docker system prune -f
        Write-Success "Cleanup completed!"
    }
    catch {
        Write-Error "Error during cleanup: $_"
    }
    finally {
        Set-Location $PSScriptRoot
    }
}

# Main execution
Write-Host "=== Docker Setup Test for Dashboard 2025 ===" -ForegroundColor Magenta
Write-Host ""

switch ($Action) {
    "test" {
        Write-Info "Running comprehensive Docker setup test..."
        
        $allTests = @(
            @{ Name = "Docker Installation"; Test = { Test-Docker } },
            @{ Name = "Docker Compose"; Test = { Test-DockerCompose } },
            @{ Name = "Docker Daemon"; Test = { Test-DockerRunning } },
            @{ Name = "Project Structure"; Test = { Test-ProjectStructure } },
            @{ Name = "Port Availability"; Test = { Test-Ports } }
        )
        
        $passed = 0
        $total = $allTests.Count
        
        foreach ($test in $allTests) {
            Write-Host "`n--- Testing: $($test.Name) ---" -ForegroundColor Yellow
            if (& $test.Test) {
                $passed++
            }
        }
        
        Write-Host "`n=== Test Summary ===" -ForegroundColor Magenta
        Write-Host "Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Red" })
        
        if ($passed -eq $total) {
            Write-Success "All tests passed! Docker setup is ready."
            Write-Info "Next steps:"
            Write-Info "1. Run: .\scripts\docker-manager.ps1 -Action build"
            Write-Info "2. Run: .\scripts\docker-manager.ps1 -Action start"
        } else {
            Write-Error "Some tests failed. Please fix the issues above before proceeding."
        }
    }
    "build" { Test-Build }
    "run" { Test-Run }
    "clean" { Clean-Test }
    default { 
        Write-Info "Usage: .\scripts\test-docker.ps1 [test|build|run|clean]"
        Write-Info "Default action is 'test'"
    }
}
