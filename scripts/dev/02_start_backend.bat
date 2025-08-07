REM ============================================
REM 📁 scripts/dev/02_start_backend.bat - CORRIGÉ
REM ============================================
@echo off
setlocal EnableDelayedExpansion
title CBM Product Explorer Backend (DEV)

cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo  🚀 DEMARRAGE BACKEND CBM PRODUCT EXPLORER
echo ============================================

REM Vérification de l'environnement virtuel RACINE
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Environnement virtuel manquant à la racine
    echo 💡 Lancez d'abord : scripts\dev\01_setup_project.bat
    pause
    exit /b 1
)

echo [OK] Activation de l'environnement Python (racine)...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erreur lors de l'activation de l'environnement virtuel
    echo 💡 Essayez : scripts\dev\01_setup_project.bat
    pause
    exit /b 1
)

REM Vérification d'uvicorn
echo [TEST] Vérification d'uvicorn...
python -c "import uvicorn; print('[OK] uvicorn disponible')" 2>nul
if errorlevel 1 (
    echo ❌ uvicorn non disponible dans cet environnement
    echo 💡 Lancez : scripts\dev\01_setup_project.bat
    pause
    exit /b 1
)

REM Vérification de Prophet (optionnel)
echo [TEST] Vérification de Prophet...
python -c "from prophet import Prophet; print('[OK] Prophet disponible')" 2>nul
if errorlevel 1 (
    echo [AVERTISSEMENT] Le module Prophet n'est pas installé.
    echo L'application fonctionnera sans les fonctionnalités de prédiction.
)

echo [OK] Chargement des variables d'environnement depuis .env.dev

REM Changement vers backend pour l'exécution
cd backend

echo.
echo Lancement du serveur FastAPI...
echo --------------------------------------------
echo  URL      : http://127.0.0.1:5180
echo  Docs     : http://127.0.0.1:5180/docs  
echo  Health   : http://127.0.0.1:5180/healthcheck
echo --------------------------------------------
echo  CTRL+C pour arrêter le serveur
echo ============================================

REM Démarrage du serveur 
python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload --env-file ..\.env.dev
if errorlevel 1 (
    echo.
    echo ❌ Erreur lors du démarrage du serveur
    echo 💡 Vérifications à faire :
    echo    1. Le fichier .env.dev existe-t-il à la racine ?
    echo    2. La base de données est-elle accessible ?
    echo    3. Redis est-il démarré ?
    echo.
    pause
)

endlocal