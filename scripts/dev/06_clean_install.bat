REM ============================================
REM 📁 scripts/dev/06_clean_install.bat  
REM ============================================
@echo off
title CBM - Installation Propre
cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo    INSTALLATION PROPRE CBM
echo ============================================
echo.
echo ⚠️  ATTENTION: Cette opération va:
echo - Supprimer l'environnement Python
echo - Supprimer node_modules
echo - Réinstaller toutes les dépendances
echo.

set /p "CONFIRM=Continuer ? (oui/non): "
if /i not "%CONFIRM%"=="oui" (
    echo Opération annulée
    pause
    exit /b 0
)

echo.
echo [1/4] Arrêt des services...
call scripts\dev\05_stop_all.bat

echo [2/4] Suppression environnements...
if exist "backend\venv" (
    echo Suppression venv Python...
    rmdir /s /q "backend\venv"
)

if exist "frontend\node_modules" (
    echo Suppression node_modules...
    rmdir /s /q "frontend\node_modules"
)

if exist "frontend\package-lock.json" (
    del "frontend\package-lock.json"
)

echo [3/4] Nettoyage caches...
if exist "frontend\.vite" (
    rmdir /s /q "frontend\.vite"
)

if exist "backend\__pycache__" (
    rmdir /s /q "backend\__pycache__"
)

echo [4/4] Réinstallation...
call scripts\dev\01_setup_project.bat

echo.
echo ============================================
echo ✅ INSTALLATION PROPRE TERMINÉE !
echo ============================================
pause
