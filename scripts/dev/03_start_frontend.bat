@echo off
title CBM Frontend (DEV)
cd /d D:\Projet\CBM_Product_Explorer\frontend

echo ============================================
echo    DEMARRAGE FRONTEND CBM
echo ============================================

if not exist "node_modules" (
    echo ❌ Dependencies manquantes
    echo Lancez d'abord: 01_setup_project.bat
    pause
    exit /b 1
)

if not exist ".env.development" (
    echo ❌ .env.development manquant
    echo Lancez d'abord: 01_setup_project.bat
    pause
    exit /b 1
)

echo Configuration:
echo - Mode: development
echo - Port: 5181
echo - API: http://127.0.0.1:5180/api/v1
echo.

echo 🧹 Nettoyage du cache Vite...

if exist ".vite" (
    echo - Suppression de .vite
    rmdir /s /q .vite
)

if exist "node_modules\.vite" (
    echo - Suppression de node_modules\.vite
    rmdir /s /q node_modules\.vite
)

echo 🚀 Démarrage serveur Vite...
echo    URL: http://127.0.0.1:5181
echo.
echo 💡 CTRL+C pour arrêter
echo ============================================

npm run dev
