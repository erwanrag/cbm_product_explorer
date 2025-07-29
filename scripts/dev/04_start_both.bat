REM ============================================
REM 📁 scripts/dev/04_start_both.bat
REM ============================================
@echo off
title CBM - Contrôleur Principal
cd /d D:\Projet\CBM_GRC_Matcher

echo ============================================
echo    DEMARRAGE COMPLET CBM GRC MATCHER
echo ============================================

REM Vérification des prérequis
if not exist "backend\venv" (
    echo ❌ Setup incomplet. Lancement du setup...
    call scripts\dev\01_setup_project.bat
)

echo 🚀 Démarrage des services...
echo.

echo [1/2] Démarrage Backend...
start "CBM Backend (DEV)" cmd /k "cd /d D:\Projet\CBM_GRC_Matcher && scripts\dev\02_start_backend.bat"

echo [2/2] Attente backend puis démarrage Frontend...
echo Attente 8 secondes pour le démarrage du backend...
timeout /t 8 /nobreak >nul

start "CBM Frontend (DEV)" cmd /k "cd /d D:\Projet\CBM_GRC_Matcher && scripts\dev\03_start_frontend.bat"

echo.
echo ============================================
echo ✅ SERVICES DÉMARRÉS !
echo ============================================
echo.
echo 📊 Fenêtres ouvertes:
echo - CBM Backend (DEV)  : Serveur Python FastAPI
echo - CBM Frontend (DEV) : Serveur Vite React
echo.
echo 🌐 URLs:
echo - Frontend: http://127.0.0.1:5181
echo - Backend:  http://127.0.0.1:5180
echo - API Docs: http://127.0.0.1:5180/docs
echo.

echo Ouverture automatique du navigateur...
timeout /t 3 /nobreak >nul
start http://127.0.0.1:5181

echo.
echo 💡 Pour arrêter:
echo - Fermez les fenêtres Backend/Frontend
echo - OU utilisez: 05_stop_all.bat
echo.
pause
