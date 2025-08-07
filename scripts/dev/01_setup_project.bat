REM ============================================
REM 📁 scripts/dev/01_setup_project.bat
REM ============================================
@echo off
title CBM - Setup Initial
cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo    SETUP INITIAL CBM Product Explorer
echo ======= =====================================

echo [1/5] Creation environnement Python...
if not exist "backend\venv" (
    cd backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install --upgrade pip
    pip install uvicorn fastapi sqlalchemy redis python-multipart
    pip install -r requirements.txt
    cd ..
    echo ✅ Environnement Python créé
) else (
    echo ✅ Environnement Python existe déjà
)

echo [2/5] Creation .env.development frontend...
if not exist "frontend\.env.development" (
    (
        echo VITE_API_URL=http://127.0.0.1:5180/api/v1
        echo VITE_ENV=dev
    ) > frontend\.env.development
    echo ✅ .env.development créé
) else (
    echo ✅ .env.development existe déjà
)

echo [3/5] Installation dépendances frontend...
cd frontend
if not exist "node_modules" (
    npm install
    echo ✅ Dependencies npm installées
) else (
    echo ✅ node_modules existe déjà
)
cd ..

echo [4/5] Test des services...
echo - Test Python...
backend\venv\Scripts\python --version
echo - Test Node.js...
node --version
echo - Test npm...
npm --version

echo [5/5] Création dossiers logs...
if not exist "logs" mkdir logs

echo.
echo ============================================
echo ✅ SETUP TERMINÉ !
echo ============================================
echo.
echo Vous pouvez maintenant utiliser:
echo - 02_start_backend.bat
echo - 03_start_frontend.bat  
echo - 04_start_both.bat
echo.
pause