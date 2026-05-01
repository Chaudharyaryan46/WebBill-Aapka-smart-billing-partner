@echo off
title BillEasy POS - System Launcher
echo ---------------------------------------------------
echo    🚀 Launching BillEasy Smart POS System
echo ---------------------------------------------------
echo.

:: 1. Start the Print Agent (Required for USB Printer)
echo [+] Starting Local Print Agent...
start "BillEasy Print Agent" cmd /c "cd print-agent && npm start"
timeout /t 3 >nul

:: 2. Start the Backend (If running locally)
:: If you have hosted your backend in the cloud, you can comment the next line out with '::'
echo [+] Starting Backend Cloud Bridge...
start "BillEasy Backend" cmd /c "cd backend && npm start"
timeout /t 5 >nul

:: 3. Open the POS Dashboard
echo [+] Opening POS Dashboard in Browser...
start http://localhost:3000

echo.
echo ---------------------------------------------------
echo    ✅ System is running! 
echo    ⚠️  DO NOT CLOSE the black windows while using the POS.
echo ---------------------------------------------------
pause
