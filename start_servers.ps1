# Carbon Tracker Servers Startup Script
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Carbon Tracker Servers" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.7+" -ForegroundColor Red
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host ""

# Start Node.js server
Write-Host "[1/2] Starting Node.js HTTP Tracker Server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "node server.js" -WindowStyle Normal

# Start Python server
Write-Host "[2/2] Starting Python CodeCarbon Server..." -ForegroundColor Cyan
Start-Process -FilePath "cmd" -ArgumentList "/k", "python app.py" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    Servers Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Node.js HTTP Tracker: http://localhost:3000" -ForegroundColor White
Write-Host "Python CodeCarbon:    http://localhost:5000" -ForegroundColor White
Write-Host ""
Write-Host "Frontend Client:      cd client && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
