@echo off
setlocal EnableDelayedExpansion
title CBM Backend (TEST PROD)

cd /d D:\Projet\CBM_GRC_Matcher\backend

echo ============================================
echo     🧪 TEST PROD-LIKE BACKEND (multi-workers)
echo ============================================

REM Activation environnement virtuel
if not exist "..\venv\Scripts\activate.bat" (
    echo ❌ Environnement virtuel manquant
    echo → Lancez d'abord : scripts\dev\01_setup_project.bat
    pause
    exit /b 1
)

call ..\venv\Scripts\activate.bat

REM Chargement .env.prod (ou .env.dev si tu veux)
echo ✅ Chargement environnement...
set /p dummy="Appuyez sur ENTRÉE pour démarrer sans reload et avec 4 workers..."<nul

echo.
echo 🚀 Lancement Uvicorn en mode production local :
echo    ➤ Host  : http://127.0.0.1:5180
echo    ➤ Docs  : http://127.0.0.1:5180/docs
echo    ➤ Mode  : multi-workers (4) sans --reload
echo ============================================

uvicorn app.main:app --host 127.0.0.1 --port 5180 --env-file ..\.env.dev --workers 4

endlocal
