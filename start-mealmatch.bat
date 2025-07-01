@echo off
echo Starting MealMatch Application...

echo.
echo Starting Backend Server...
cd "c:\Users\Yogiraj Shinde\OneDrive\Desktop\New Edunet MealMatch\server"
start "MealMatch Backend" cmd /k "npm start"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo Starting Frontend...
cd "c:\Users\Yogiraj Shinde\OneDrive\Desktop\New Edunet MealMatch\client"
start "MealMatch Frontend" cmd /k "npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5000 (local development)
echo Frontend: http://localhost:3000 (local development)
echo.
echo For production deployment, use:
echo Backend: https://mealmatch-backend.onrender.com
echo Frontend: https://mealmatch-frontend.onrender.com
echo.
echo Press any key to exit this window...
pause >nul
