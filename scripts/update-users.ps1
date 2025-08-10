# Update Users Script
# This script updates existing users who have email as username to have proper usernames

Write-Host "Updating existing users..." -ForegroundColor Yellow

try {
    # Wait a moment for the application to be ready
    Start-Sleep -Seconds 5
    
    # Call the update users endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/update-users" -Method POST -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "Users updated successfully!" -ForegroundColor Green
        Write-Host "Message: $($response.message)" -ForegroundColor Cyan
    } else {
        Write-Host "Failed to update users" -ForegroundColor Red
    }
} catch {
    Write-Host "Error updating users: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure the application is running first" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Updated Login Credentials:" -ForegroundColor Yellow
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host "" 