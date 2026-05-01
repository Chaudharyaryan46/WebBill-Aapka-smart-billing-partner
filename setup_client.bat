@echo off
title BillEasy POS - One Time Setup
echo ---------------------------------------------------
echo    🛠️  BillEasy POS - One Time Setup
echo ---------------------------------------------------
echo.

echo [1/3] Installing and Building Backend...
cd backend
call npm install
call npm run build
cd ..
echo ✅ Backend ready.
echo.

echo [2/3] Installing and Building Frontend...
cd frontend
call npm install
call npm run build
cd ..
echo ✅ Frontend ready.
echo.

echo [3/3] Installing Print Agent...
cd print-agent
call npm install
cd ..
echo ✅ Print Agent ready.
echo.

echo ---------------------------------------------------
echo    🎉 Setup Complete! 
echo    You can now use 'run_pos.bat' to start the system.
echo ---------------------------------------------------
pause
