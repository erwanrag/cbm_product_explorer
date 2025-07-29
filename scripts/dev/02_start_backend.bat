REM ============================================
REM 📁 scripts/dev/02_start_backend.bat
REM ============================================
@echo off
title CBM Backend (DEV)
cd /d D:\Projet\CBM_GRC_Matcher\backend

echo ============================================
echo    DEMARRAGE BACKEND CBM
echo ============================================

if not exist "venv" (
    echo ❌ Environnement virtuel manquant
    echo Lancez d'abord: 01_setup_project.bat
    pause
    exit /b 1
)

echo Activation environnement Python...
call venv\Scripts\activate.bat

echo Chargement variables .env.dev...
set /p dummy="Appuyez sur ENTRÉE pour continuer..."<nul

echo.
echo 🚀 Démarrage serveur FastAPI...
echo    URL: http://127.0.0.1:5180
echo    Docs: http://127.0.0.1:5180/docs
echo    Health: http://127.0.0.1:5180/healthcheck
echo.
echo 💡 CTRL+C pour arrêter
echo ==========================================

python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload --env-file ..\.env.dev