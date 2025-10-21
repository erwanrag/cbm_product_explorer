REM ============================================
REM 📁 scripts/prod/03_start_frontend_prod.bat
REM ============================================
@echo off
title CBM Product Explorer Frontend (PROD)

REM === Paramètres ==============================
set "BASE_DIR=D:\Projet\CBM_Product_Explorer\frontend"
REM PORT récupéré d'en haut si défini par 04_start_both_prod.bat, sinon 5181
if "%PORT%"=="" set "PORT=5181"
set "API_URL=http://127.0.0.1:5180/api/v1"
REM ============================================

cd /d "%BASE_DIR%" || (
    echo ❌ Chemin invalide: %BASE_DIR%
    pause
    exit /b 1
)

echo ============================================
echo    DEMARRAGE FRONTEND CBM (PROD)
echo ============================================

if not exist "node_modules" (
    echo ❌ node_modules manquant
    echo Lancez d'abord l'installation (prod/dev).
    pause
    exit /b 1
)

REM .env.production utilisé par Vite au build
if not exist ".env.production" (
    echo ⚠️  .env.production introuvable. On continue avec les valeurs par défaut.
)

echo 🏗️  Build du frontend (vite build)...
call npm run build || (
    echo ❌ Echec du build
    pause
    exit /b 1
)

echo 🚀 Servir le build (dist)...
echo    URL: http://127.0.0.1:%PORT%
echo.
echo 💡 CTRL+C pour arrêter
echo ============================================

REM Méthode 1: npx serve si dispo (plus robuste pour prod locale)
where npx >nul 2>&1
if %errorlevel%==0 (
    npx serve -s dist -l %PORT%
) else (
    REM Méthode 2: vite preview en fallback
    call npm run preview -- --port %PORT% --host
)
