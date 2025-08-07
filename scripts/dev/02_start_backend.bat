@echo off
setlocal EnableDelayedExpansion
title CBM Backend (DEV)

REM ============================================
REM 📁 scripts/dev/02_start_backend.bat
REM ============================================

cd /d D:\Projet\CBM_Product_Explorer\backend

echo ============================================
echo     DEMARRAGE BACKEND CBM (DEV)
echo ============================================

REM Vérification de l’environnement virtuel
if not exist "..\venv\Scripts\activate.bat" (
    echo [ERREUR] Environnement virtuel manquant.
    echo Lancez d'abord : scripts\dev\01_setup_project.bat
    pause
    exit /b 1
)

echo [OK] Activation de l’environnement Python...
call ..\venv\Scripts\activate.bat

REM Vérification de la présence de Prophet
python -c "from prophet import Prophet; print('Prophet importé avec succès')" 2>nul
if errorlevel 1 (
    echo [AVERTISSEMENT] Le module Prophet n'est pas installé dans cet environnement virtuel.
    echo -> Lancez : pip install prophet
    pause
)

echo [OK] Chargement des variables d'environnement depuis .env.dev
set /p dummy="Appuyez sur ENTREE pour continuer..." <nul

echo.
echo Lancement du serveur FastAPI...
echo --------------------------------------------
echo  URL      : http://127.0.0.1:5180
echo  Docs     : http://127.0.0.1:5180/docs
echo  Health   : http://127.0.0.1:5180/healthcheck
echo --------------------------------------------
echo CTRL+C pour arrêter le serveur
echo ============================================

REM Ajout explicite du PYTHONPATH pour éviter ModuleNotFoundError
set PYTHONPATH=%CD%

python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload --env-file ..\.env.dev

endlocal
