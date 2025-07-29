@echo off
REM repair_cbm.bat - Script de réparation automatique
setlocal enabledelayedexpansion

echo ============================================
echo REPARATION CBM GRC MATCHER
echo ============================================

cd /d "D:\Projet\CBM_GRC_Matcher"
echo Dossier: %CD%

echo.
echo [1/4] Reparation du package.json...

REM Sauvegarde de l'ancien fichier
if exist "frontend\package.json" (
    copy "frontend\package.json" "frontend\package.json.backup" >nul
    echo Sauvegarde créée: package.json.backup
)

REM Création du nouveau package.json sans commentaires
echo Creation du nouveau package.json...
(
echo {
echo   "name": "cbm-grc-matcher-frontend",
echo   "version": "2.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite --mode development --port 5181 --host 0.0.0.0",
echo     "build": "vite build --mode production",
echo     "preview": "vite preview --port 5181",
echo     "lint": "eslint src --ext .js,.jsx --fix",
echo     "format": "prettier --write \"src/**/*.{js,jsx,json,css,md}\"",
echo     "clean": "rm -rf dist node_modules/.vite"
echo   },
echo   "dependencies": {
echo     "@emotion/react": "^11.14.0",
echo     "@emotion/styled": "^11.14.0",
echo     "@mui/icons-material": "^7.1.1", 
echo     "@mui/material": "^7.0.2",
echo     "@mui/x-data-grid": "^8.1.0",
echo     "@tanstack/react-query": "^5.81.2",
echo     "@tanstack/react-query-devtools": "^5.81.2",
echo     "axios": "^1.8.4",
echo     "dayjs": "^1.11.13",
echo     "framer-motion": "^12.7.4",
echo     "lodash.debounce": "^4.0.8",
echo     "plotly.js": "^3.0.1",
echo     "react": "^19.0.0",
echo     "react-dom": "^19.0.0",
echo     "react-plotly.js": "^2.6.0",
echo     "react-router-dom": "^7.5.1",
echo     "react-toastify": "^11.0.5"
echo   },
echo   "devDependencies": {
echo     "@vitejs/plugin-react": "^4.3.4",
echo     "eslint": "^8.57.0",
echo     "prettier": "^3.6.1",
echo     "vite": "^5.2.0"
echo   }
echo }
) > frontend\package.json

echo Package.json réparé !

echo.
echo [2/4] Nettoyage des caches npm...
cd frontend
if exist "node_modules" (
    echo Suppression node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Suppression package-lock.json...
    del package-lock.json
)

echo.
echo [3/4] Création de l'environnement Python...
cd ..\backend

if exist "venv" (
    echo Suppression ancien venv...
    rmdir /s /q venv
)

echo Création nouvel environnement virtuel...
python -m venv venv
if errorlevel 1 (
    echo ERREUR: Impossible de créer l'environnement virtuel
    pause
    exit /b 1
)

echo Activation environnement virtuel...
call venv\Scripts\activate.bat

echo Installation des dépendances Python...
pip install uvicorn fastapi sqlalchemy redis python-multipart
if errorlevel 1 (
    echo ERREUR: Installation des dépendances Python échouée
    pause
    exit /b 1
)

if exist "requirements.txt" (
    echo Installation requirements.txt...
    pip install -r requirements.txt
)

echo.
echo [4/4] Test des réparations...

echo Test Python/uvicorn...
python -c "import uvicorn; print('uvicorn OK')"
if errorlevel 1 (
    echo ERREUR: uvicorn toujours non disponible
    pause
    exit /b 1
)

cd ..\frontend
echo Test npm...
npm --version
if errorlevel 1 (
    echo ERREUR: npm toujours problématique
    pause
    exit /b 1
)

echo.
echo ============================================
echo REPARATION TERMINEE !
echo ============================================
echo.
echo Changements effectués:
echo - Package.json réparé (sauvegarde créée)
echo - Cache npm nettoyé
echo - Environnement Python recréé
echo - uvicorn installé
echo.
echo Vous pouvez maintenant relancer le script de démarrage
echo.

pause