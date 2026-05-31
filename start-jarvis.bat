@echo off
title JARVIS Wealth Portal Launcher
color 0B

echo.
echo  ================================================
echo    J.A.R.V.I.S  WEALTH INTELLIGENCE PORTAL
echo    Starting all systems...
echo  ================================================
echo.

:: Start backend
echo [1/2] Starting Python Backend (port 8000)...
start "JARVIS Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

:: Wait for backend to initialise (fetches live data on startup)
echo       Waiting for data warm-up...
timeout /t 8 /nobreak > nul

:: Start frontend
echo [2/2] Starting React Frontend (port 5173)...
start "JARVIS Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  ================================================
echo    JARVIS IS ONLINE!
echo.
echo    Command Center:  http://localhost:5173
echo    API Explorer:    http://localhost:8000/docs
echo    Health Check:    http://localhost:8000/api/health
echo  ================================================
echo.
echo  Close both terminal windows to shut down JARVIS.
echo  Press any key to open the portal in your browser...
pause > nul
start http://localhost:5173
