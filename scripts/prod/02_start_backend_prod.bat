REM ============================================
REM 📁 scripts/prod/02_start_backend_prod.bat
REM ============================================
@echo off
setlocal EnableDelayedExpansion
title CBM Product Explorer Backend (PROD)

REM === Paramètres ==============================
set "BASE_DIR=D:\Projet\CBM_Product_Explorer"
REM PORT récupéré d'en haut si défini par 04_start_both_prod.bat, sinon 5180
if "%PORT%"=="" set "PORT=5180"
set "ENV_FILE=%BASE_DIR%\.env.prod"
REM ============================================

cd /d "%BASE_DIR%" || (
    echo ❌ Chemin invalide: %BASE_DIR%
    pause
    exit /b 1
)

echo ============================================
echo  🚀 DEMARRAGE BACKEND CBM (PROD)
echo ============================================

REM Vérification venv racine
if not exist "venv\Scripts\activate.bat" (
    echo ❌ venv manquant à la racine
    echo 💡 Lancez d'abord : scripts\prod\01_setup_project_prod.bat (ou dev)
    pause
    exit /b 1
)

echo [OK] Activation venv (racine)...
call venv\Scripts\activate.bat || (
    echo ❌ Echec activation venv
    pause
    exit /b 1
)

REM Vérif uvicorn
python -c "import uvicorn; print('[OK] uvicorn dispo')" 2>nul || (
    echo ❌ uvicorn non disponible dans cet environnement
    echo 💡 Installez les dépendances: scripts\prod\01_setup_project_prod.bat
    pause
    exit /b 1
)

REM Vérif fichier .env (prod)
if not exist "%ENV_FILE%" (
    echo ⚠️  %ENV_FILE% introuvable. On continue sans --env-file.
)

set "NODE_ENV=production"
set "PYTHON_ENV=production"
set "ENV=production"

cd backend

echo.
echo Lancement FastAPI (PROD)...
echo --------------------------------------------
echo  URL      : http://127.0.0.1:%PORT%
echo  Docs     : http://127.0.0.1:%PORT%/docs
echo  Health   : http://127.0.0.1:%PORT%/healthcheck
echo --------------------------------------------
echo  CTRL+C pour arrêter
echo ============================================

REM Démarrage uvicorn (sans --reload)
if exist "%ENV_FILE%" (
    python -m uvicorn app.main:app --host 0.0.0.0 --port %PORT% --env-file "%ENV_FILE%"
) else (
    python -m uvicorn app.main:app --host 0.0.0.0 --port %PORT%
)

if errorlevel 1 (
    echo.
    echo ❌ Erreur au démarrage backend (PROD)
    echo 💡 Vérifs :
    echo    1) %ENV_FILE% existe et est complet ?
    echo    2) DB/Redis/queues accessibles ?
    echo.
    pause
)

endlocal
