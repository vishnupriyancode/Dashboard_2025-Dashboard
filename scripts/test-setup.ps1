# Test script to verify PostgreSQL and Dashboard setup
Write-Host "🧪 Testing PostgreSQL and Dashboard Setup" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if container is running
Write-Host "`n📊 Checking container status..." -ForegroundColor Yellow
$containerStatus = docker ps --filter "name=dashboard-app" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host $containerStatus

# Test database connection
Write-Host "`n🔍 Testing database connection..." -ForegroundColor Yellow
try {
    $dbTest = docker exec dashboard-app psql -U dashboard_user -d dashboard_db -c "SELECT version();" 2>$null
    if ($dbTest) {
        Write-Host "✅ PostgreSQL connection successful" -ForegroundColor Green
        Write-Host $dbTest
    } else {
        Write-Host "❌ PostgreSQL connection failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not test database connection" -ForegroundColor Red
}

# Test API health endpoint
Write-Host "`n🌐 Testing API health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 10
    if ($healthResponse.status -eq "ok") {
        Write-Host "✅ API health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ API health check failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not connect to API" -ForegroundColor Red
}

# Test database tables
Write-Host "`n📋 Testing database tables..." -ForegroundColor Yellow
try {
    $tables = docker exec dashboard-app psql -U dashboard_user -d dashboard_db -c "\dt" 2>$null
    if ($tables) {
        Write-Host "✅ Database tables found:" -ForegroundColor Green
        Write-Host $tables
    } else {
        Write-Host "❌ No tables found" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Could not check database tables" -ForegroundColor Red
}

Write-Host "`n✅ Setup test completed!" -ForegroundColor Green 