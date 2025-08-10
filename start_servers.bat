@echo off
echo ========================================
echo    Carbon Tracker Servers
echo ========================================
echo.
echo Starting servers...
echo.

echo [1/2] Starting Node.js HTTP Tracker Server...
start "Node.js Server" cmd /k "node server.js"

echo [2/2] Starting Python CodeCarbon Server...
start "Python Server" cmd /k "python app.py"

echo.
echo ========================================
echo    Servers Started!
echo ========================================
echo.
echo Node.js HTTP Tracker: http://localhost:3000
echo Python CodeCarbon:    http://localhost:5000
echo.
echo Press any key to close this window...
pause > nul
