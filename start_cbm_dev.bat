@echo off
REM start_cbm_dev.bat - Script de démarrage CBM GRC Matcher avec détection auto du projet
setlocal enabledelayedexpansion

echo 🚀 Démarrage CBM GRC Matcher - Environnement DEV
echo ==================================================

REM Détection automatique de la racine du projet
set "SCRIPT_DIR=%~dp0"
set "PROJECT_ROOT="

REM Recherche du fichier .env.dev pour déterminer la racine
if exist "%SCRIPT_DIR%.env.dev" (
    set "PROJECT_ROOT=%SCRIPT_DIR%"
    echo 📁 Racine détectée: %SCRIPT_DIR%
) else if exist "%SCRIPT_DIR%..\.env.dev" (
    set "PROJECT_ROOT=%SCRIPT_DIR%.."
    echo 📁 Racine détectée: %SCRIPT_DIR%..
) else if exist "%SCRIPT_DIR%..\..\.env.dev" (
    set "PROJECT_ROOT=%SCRIPT_DIR%..\.."
    echo 📁 Racine détectée: %SCRIPT_DIR%..\..
) else (
    echo ❌ Impossible de trouver la racine du projet CBM GRC Matcher
    echo    Le fichier .env.dev doit être présent dans le dossier racine
    echo.
    echo 💡 Structure attendue:
    echo    CBM_GRC_Matcher/
    echo    ├── .env.dev          ^<-- Ce fichier est requis
    echo    ├── backend/
    echo    ├── frontend/
    echo    └── scripts/dev/      ^<-- Vous êtes ici
    echo.
    pause
    exit /b 1
)

REM Changement vers la racine du projet
cd /d "%PROJECT_ROOT%"
echo 📂 Dossier de travail: %CD%

REM Vérification des prérequis
echo.
echo 🔍 Vérification des prérequis...

REM Vérification Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python n'est pas installé ou pas dans le PATH
    echo 💡 Installez Python depuis https://python.org
    pause
    exit /b 1
) else (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo ✅ Python %%i détecté
)

REM Vérification Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js n'est pas installé ou pas dans le PATH
    echo 💡 Installez Node.js depuis https://nodejs.org
    pause
    exit /b 1
) else (
    for /f %%i in ('node --version 2^>^&1') do echo ✅ Node.js %%i détecté
)

REM Vérification npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installé ou pas dans le PATH
    pause
    exit /b 1
) else (
    for /f %%i in ('npm --version 2^>^&1') do echo ✅ npm %%i détecté
)

REM Vérification de la structure du projet
echo.
echo 🔍 Vérification de la structure du projet...

if not exist "backend" (
    echo ❌ Dossier 'backend' manquant
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ Dossier 'frontend' manquant
    pause
    exit /b 1
)

if not exist ".env.dev" (
    echo ❌ Fichier .env.dev manquant
    pause
    exit /b 1
)

echo ✅ Structure du projet validée

REM Création automatique du .env.development frontend si manquant
if not exist "frontend\.env.development" (
    echo.
    echo 📝 Création de frontend\.env.development...
    (
        echo VITE_API_URL=http://127.0.0.1:5180/api/v1
        echo VITE_ENV=dev
        echo VITE_ENABLE_MOCK=false
        echo VITE_ANIMATIONS=true
        echo VITE_REQUEST_TIMEOUT=30000
        echo VITE_CACHE_TIMEOUT=300000
        echo VITE_RETRY_ATTEMPTS=3
        echo VITE_DEBOUNCE_DELAY=300
        echo VITE_THEME=light
        echo VITE_LANGUAGE=fr
        echo VITE_DEFAULT_PAGE_SIZE=50
        echo VITE_MAX_PAGE_SIZE=200
    ) > frontend\.env.development
    echo ✅ Fichier frontend\.env.development créé
)

REM Chargement des variables d'environnement
echo.
echo 🔧 Chargement de la configuration...
for /f "usebackq tokens=1,2 delims==" %%a in (".env.dev") do (
    set "line=%%a"
    if not "!line:~0,1!"=="#" (
        set "%%a=%%b"
    )
)

echo ✅ Configuration chargée:
echo    - Environnement: %CBM_ENV%
echo    - Base de données: %SQL_SERVER%
echo    - Redis: %REDIS_HOST%:%REDIS_PORT%
echo    - Backend: http://127.0.0.1:5180
echo    - Frontend: http://127.0.0.1:5181

echo.
echo 💡 Deux fenêtres vont s'ouvrir pour les logs
echo    Gardez cette fenêtre ouverte pour contrôler les services
echo.
pause

REM === DÉMARRAGE BACKEND ===
echo.
echo 📦 Préparation du backend...
cd backend

REM Vérification de requirements.txt
if not exist "requirements.txt" (
    echo ❌ Fichier requirements.txt manquant dans backend/
    pause
    exit /b 1
)

REM Création de l'environnement virtuel si nécessaire
if not exist "venv" (
    echo 🔨 Création de l'environnement virtuel Python...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erreur lors de la création de l'environnement virtuel
        pause
        exit /b 1
    )
)

REM Activation et installation des dépendances
echo 🔧 Activation de l'environnement virtuel...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erreur lors de l'activation de l'environnement virtuel
    echo 💡 Essayez de supprimer le dossier venv et relancer le script
    pause
    exit /b 1
)

echo 📥 Installation/mise à jour des dépendances Python...
pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances Python
    pause
    exit /b 1
)

REM Test Redis optionnel
echo.
echo 🔍 Test de connexion Redis...
redis-cli ping >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Redis non accessible - l'application fonctionnera sans cache
) else (
    echo ✅ Redis connecté
)

REM Démarrage du backend
echo.
echo 🚀 Démarrage du backend CBM...
start "CBM Backend" cmd /k "python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload --env-file ..\.env.dev"

REM Attente que le backend soit prêt
echo ⏳ Attente de la disponibilité du backend...
set /a attempts=0
:wait_backend
set /a attempts+=1
curl -s http://127.0.0.1:5180/healthcheck >nul 2>&1
if errorlevel 1 (
    if !attempts! geq 30 (
        echo.
        echo ❌ Le backend n'est pas accessible après 30 secondes
        echo 💡 Vérifiez la fenêtre "CBM Backend" pour les erreurs
        echo.
        pause
        goto cleanup
    )
    timeout /t 1 /nobreak >nul
    echo|set /p="."
    goto wait_backend
)
echo.
echo ✅ Backend accessible sur http://127.0.0.1:5180

REM === DÉMARRAGE FRONTEND ===
cd ..\frontend

echo.
echo 📦 Préparation du frontend...

REM Vérification de package.json
if not exist "package.json" (
    echo ❌ Fichier package.json manquant dans frontend/
    pause
    goto cleanup
)

REM Installation des dépendances Node.js
echo 📥 Vérification des dépendances npm...
if not exist "node_modules" (
    echo 📦 Installation des dépendances npm (première fois)...
    npm install
    if errorlevel 1 (
        echo ❌ Erreur lors de l'installation des dépendances npm
        pause
        goto cleanup
    )
) else (
    echo ✅ Dépendances npm déjà installées
)

REM Démarrage du frontend
echo.
echo 🚀 Démarrage du frontend CBM...
start "CBM Frontend" cmd /k "npm run dev"

REM Attente courte pour le frontend
echo ⏳ Démarrage du serveur de développement...
timeout /t 5 /nobreak >nul

REM Affichage des informations finales
echo.
echo 🎉 CBM GRC Matcher démarré avec succès !
echo ==========================================
echo.
echo 📱 Frontend:      http://127.0.0.1:5181
echo 🔧 Backend API:   http://127.0.0.1:5180
echo 📚 Documentation: http://127.0.0.1:5180/docs
echo 🏥 Health check:  http://127.0.0.1:5180/healthcheck
echo.
echo 📊 Fenêtres ouvertes:
echo    - "CBM Backend"  : Logs du serveur FastAPI
echo    - "CBM Frontend" : Logs du serveur Vite
echo.

REM Ouverture automatique du navigateur
echo 🌐 Ouverture automatique du navigateur...
timeout /t 2 /nobreak >nul
start http://127.0.0.1:5181

echo.
echo ⚡ Services actifs !
echo.
echo 🛑 Pour arrêter les services:
echo    - Fermez les fenêtres "CBM Backend" et "CBM Frontend"
echo    - OU appuyez sur une touche ici pour tout arrêter
echo.

REM Attente de l'utilisateur
pause

:cleanup
REM Nettoyage des processus
echo.
echo 🧹 Arrêt des services...
taskkill /f /fi "WindowTitle eq CBM Backend*" >nul 2>&1
taskkill /f /fi "WindowTitle eq CBM Frontend*" >nul 2>&1
echo ✅ Services arrêtés

cd ..
echo.
echo 👋 CBM GRC Matcher arrêté
echo    Vous pouvez fermer cette fenêtre
pause