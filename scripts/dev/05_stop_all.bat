REM ============================================
REM 📁 scripts/dev/05_stop_all.bat
REM ============================================
@echo off
title CBM - Arrêt Services
echo ============================================
echo    ARRÊT SERVICES CBM
echo ============================================

echo Arrêt des processus CBM...

REM Arrêt par titre de fenêtre
taskkill /F /FI "WINDOWTITLE eq CBM Backend (DEV)*" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CBM Frontend (DEV)*" >nul 2>&1

REM Arrêt par port (sécurité)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5180 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5181 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Services CBM arrêtés
echo.
echo Ports libérés:
echo - 5180 (Backend)
echo - 5181 (Frontend)
echo.
pause