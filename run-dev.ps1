# run-dev.ps1
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "Starting FOMS (Finance Operations Management System) Dev Environment" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Starting Backend C# API (LocalDB Database)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting FOMS Backend API...'; cd Finance_Capstone-backend/FOMS.Api; dotnet run --launch-profile http" -Title "FOMS Backend API"

Write-Host "`n[2/3] Starting YARP Proxy Gateway (http://localhost:5275)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host 'Starting FOMS YARP Proxy...'; cd Finance_Capstone-proxy/FOMS.Proxy; dotnet run --launch-profile http" -Title "FOMS YARP Proxy"

Write-Host "`n[3/3] Starting Frontend React Dev Server (Vite)..." -ForegroundColor Yellow
Set-Location -Path "Finance_Capstone-main"
npm run dev
