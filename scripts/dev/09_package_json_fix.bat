REM ============================================
REM 📁 scripts/dev/09_package_json_fix.bat
REM ============================================
@echo off
title CBM - Fix Package.json
cd /d D:\Projet\CBM_Product_Explorer\frontend

echo ============================================
echo    RÉPARATION PACKAGE.JSON
echo ============================================

if exist "package.json" (
    echo Sauvegarde package.json...
    copy package.json package.json.backup >nul
)

echo Création package.json corrigé...
(
echo {
echo   "name": "cbm-grc-matcher-frontend",
echo   "version": "2.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite --mode development --port 5181 --host 0.0.0.0",
echo     "build": "vite build --mode production",
echo     "preview": "vite preview --port 5181"
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
) > package.json

echo ✅ Package.json réparé !
echo.
echo Pour appliquer les changements:
echo 1. Supprimez node_modules
echo 2. Lancez npm install
echo.
pause
