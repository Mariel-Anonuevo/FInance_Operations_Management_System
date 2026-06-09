@echo off
echo ====================================================================
echo Starting FOMS (Finance Operations Management System) Dev Environment
echo ====================================================================

echo.
echo [1/3] Starting Backend C# API (LocalDB Database)...
start "FOMS Backend API" cmd /k "cd Finance_Capstone-backend\FOMS.Api && dotnet run --launch-profile http"

echo.
echo [2/3] Starting YARP Proxy Gateway (http://localhost:5275)...
start "FOMS YARP Proxy" cmd /k "cd Finance_Capstone-proxy\FOMS.Proxy && dotnet run --launch-profile http"

echo.
echo [3/3] Starting Frontend React Dev Server (Vite)...
cd Finance_Capstone-main
npm run dev

pause
