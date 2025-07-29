REM ============================================
REM 📁 scripts/dev/08_test_api.bat
REM ============================================
@echo off
title CBM - Test API
echo ============================================
echo    TEST API CBM BACKEND
echo ============================================

echo Test de connectivité...
echo.

echo [1/4] Health check...
curl -s http://127.0.0.1:5180/healthcheck
if errorlevel 1 (
    echo ❌ Backend non accessible
    echo Démarrez d'abord le backend avec 02_start_backend.bat
    pause
    exit /b 1
) else (
    echo ✅ Backend accessible
)

echo.
echo [2/4] Test de l'API docs...
echo URL: http://127.0.0.1:5180/docs
start http://127.0.0.1:5180/docs

echo.
echo [3/4] Test endpoint identifiers...
curl -X POST http://127.0.0.1:5180/api/v1/identifiers/resolve-codpro ^
     -H "Content-Type: application/json" ^
     -d "{\"cod_pro\": 12345}"

echo.
echo [4/4] Test endpoint dashboard...
curl -X POST http://127.0.0.1:5180/api/v1/dashboard/fiche ^
     -H "Content-Type: application/json" ^
     -d "{\"cod_pro\": 12345}"

echo.
echo.
echo ============================================
echo ✅ TESTS API TERMINÉS
echo ============================================
pause
