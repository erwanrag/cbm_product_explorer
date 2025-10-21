REM ============================================
REM 📁 scripts/prod/05_stop_all_prod.bat
REM ============================================
@echo off
title CBM - Arrêt Services (PROD)
echo ============================================
echo    ARRÊT SERVICES CBM (PROD)
echo ============================================

echo Arrêt des processus CBM (PROD)...

REM Arrêt par titre de fenêtre (conforme à 04/02/03 PROD)
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Backend (PROD)" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Frontend (PROD)" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Backend (PROD via DEV)" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Frontend (PROD via DEV)" >nul 2>&1

REM Arrêt par ports (sécurité) - même ports par défaut que DEV
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5180 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5181 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Services CBM (PROD) arrêtés
echo.
echo Ports libérés (PROD):
echo - 5180 (Backend)
echo - 5181 (Frontend)
echo.
pause
