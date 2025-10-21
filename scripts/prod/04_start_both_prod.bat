REM ============================================
REM 📁 scripts/prod/04_start_both_prod.bat - PROD
REM ============================================
@echo off
setlocal enabledelayedexpansion
title CBM Product Explorer - Contrôleur Principal (PROD)

REM === Paramètres =========================
set "BASE_DIR=D:\Projet\CBM_Product_Explorer"
set "BACKEND_PORT=5180"
set "FRONTEND_PORT=5181"
set "FRONTEND_URL=http://127.0.0.1:%FRONTEND_PORT%"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
set "API_DOCS_URL=%BACKEND_URL%/docs"
set "MAX_WAIT_SEC=60"
REM ========================================

cd /d "%BASE_DIR%" || (
    echo ❌ Impossible d'aller dans: %BASE_DIR%
    goto :end
)

echo ============================================
echo    DEMARRAGE COMPLET CBM PRODUCT EXPLORER (PROD)
echo ============================================

REM Vérification venv racine
if not exist "venv" (
    echo ❌ Setup incomplet. Lancement du setup (prod si dispo, sinon dev)...
    if exist "scripts\prod\01_setup_project_prod.bat" (
        call scripts\prod\01_setup_project_prod.bat
    ) else (
        call scripts\dev\01_setup_project.bat
    )
)

set "NODE_ENV=production"
set "PYTHON_ENV=production"
set "ENV=production"

echo 🚀 Démarrage des services (PROD)...
echo.

echo [1/2] Démarrage Backend (PROD)...
if exist "scripts\prod\02_start_backend_prod.bat" (
    start "CBM Product Explorer Backend (PROD)" cmd /k "cd /d %BASE_DIR% && set NODE_ENV=production && set PYTHON_ENV=production && set ENV=production && set PORT=%BACKEND_PORT% && scripts\prod\02_start_backend_prod.bat"
) else (
    echo ⚠️  scripts\prod\02_start_backend_prod.bat introuvable. Fallback DEV.
    start "CBM Product Explorer Backend (PROD via DEV)" cmd /k "cd /d %BASE_DIR% && set NODE_ENV=production && set PYTHON_ENV=production && set ENV=production && set PORT=%BACKEND_PORT% && scripts\dev\02_start_backend.bat"
)

echo [2/2] Attente dispo backend puis démarrage Frontend (PROD)...
call :wait_backend "%API_DOCS_URL%" %MAX_WAIT_SEC%

if exist "scripts\prod\03_start_frontend_prod.bat" (
    start "CBM Product Explorer Frontend (PROD)" cmd /k "cd /d %BASE_DIR% && set NODE_ENV=production && set ENV=production && set PORT=%FRONTEND_PORT% && scripts\prod\03_start_frontend_prod.bat"
) else (
    echo ⚠️  scripts\prod\03_start_frontend_prod.bat introuvable. Fallback DEV.
    start "CBM Product Explorer Frontend (PROD via DEV)" cmd /k "cd /d %BASE_DIR% && set NODE_ENV=production && set ENV=production && set PORT=%FRONTEND_PORT% && scripts\dev\03_start_frontend.bat"
)

echo.
echo ============================================
echo ✅ SERVICES DÉMARRÉS (PROD) !
echo ============================================
echo.
echo 📊 Fenêtres ouvertes:
echo - CBM Product Explorer Backend (PROD)  : FastAPI
echo - CBM Product Explorer Frontend (PROD) : Serveur statique (dist)
echo.
echo 🌐 URLs:
echo - Frontend: %FRONTEND_URL%
echo - Backend:  %BACKEND_URL%
echo - API Docs: %API_DOCS_URL%
echo.

echo Ouverture du navigateur...
timeout /t 2 /nobreak >nul
start "" "%FRONTEND_URL%"

echo.
echo 💡 Pour arrêter (PROD):
echo - Fermez les fenêtres Backend/Frontend
echo - OU utilisez: scripts\prod\05_stop_all_prod.bat
echo.
goto :end

:wait_backend
set "URL=%~1"
set "LIMIT=%~2"
set /a "elapsed=0"
echo ⏳ Attente backend %URL% (max %LIMIT%s)...
where curl >nul 2>nul
if %errorlevel%==0 (
    :curl_loop
    curl -s -o nul -w "%%{http_code}" "%URL%" > "%TEMP%\cbm_http.tmp" 2>nul
    set /p code=<"%TEMP%\cbm_http.tmp"
    del "%TEMP%\cbm_http.tmp" >nul 2>&1
    if "!code!"=="200" (
        echo ✅ Backend OK (HTTP 200)
        goto :eof
    )
    timeout /t 2 /nobreak >nul
    set /a "elapsed+=2"
    if !elapsed! GEQ %LIMIT% (
        echo ⚠️  Backend non dispo après %LIMIT%s. On continue...
        goto :eof
    )
    goto :curl_loop
) else (
    echo ⚠️  curl indisponible. Attente fixe de 8s...
    timeout /t 8 /nobreak >nul
    goto :eof
)

:end
endlocal
pause
