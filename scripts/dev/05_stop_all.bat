REM ============================================
REM 📁 scripts/dev/05_stop_all.bat - CORRIGÉ
REM ============================================
@echo off
title CBM - Arrêt Services (DEV)
echo ============================================
echo    ARRÊT SERVICES CBM (DEV)
echo ============================================

echo Arrêt des processus CBM (DEV)...

REM Arrêt par titre de fenêtre (correspond à 04/02/03 DEV)
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Backend (DEV)" >nul 2>&1
taskkill /F /FI "WINDOWTITLE eq CBM Product Explorer Frontend (DEV)" >nul 2>&1

REM Arrêt par ports de dev (sécurité)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5180 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5181 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo ✅ Services CBM (DEV) arrêtés
echo.
echo Ports libérés (DEV):
echo - 5180 (Backend)
echo - 5181 (Frontend)
echo.
pause
