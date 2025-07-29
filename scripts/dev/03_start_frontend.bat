REM ============================================
REM 📁 scripts/dev/03_start_frontend.bat
REM ============================================
@echo off
title CBM Frontend (DEV)
cd /d D:\Projet\CBM_GRC_Matcher\frontend

echo ============================================
echo    DEMARRAGE FRONTEND CBM
echo ============================================

if not exist "node_modules" (
    echo ❌ Dependencies manquantes
    echo Lancez d'abord: 01_setup_project.bat
    pause
    exit /b 1
)

if not exist ".env.development" (
    echo ❌ .env.development manquant
    echo Lancez d'abord: 01_setup_project.bat
    pause
    exit /b 1
)

echo Configuration:
echo - Mode: development
echo - Port: 5181
echo - API: http://127.0.0.1:5180/api/v1
echo.

echo 🚀 Démarrage serveur Vite...
echo    URL: http://127.0.0.1:5181
echo.
echo 💡 CTRL+C pour arrêter
echo ==========================================

npm run dev
