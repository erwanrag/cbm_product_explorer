@echo off
title CBM Product Explorer - Fix venv paths
cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo   CORRECTION CHEMINS ENVIRONNEMENT VIRTUEL  
echo ============================================

echo Problème détecté: Les chemins de l'environnement virtuel
echo pointent vers l'ancien dossier CBM_GRC_Matcher
echo.

echo [1/4] Suppression de l'ancien venv corrompu...
if exist "venv" (
    rmdir /s /q venv
    echo ✅ Ancien venv supprimé
)

if exist "backend\venv" (
    rmdir /s /q "backend\venv"
    echo ✅ venv backend supprimé
)

echo [2/4] Création d'un nouvel environnement virtuel...
python -m venv venv
if errorlevel 1 (
    echo ❌ Erreur lors de la création du venv
    pause
    exit /b 1
)
echo ✅ Nouvel environnement virtuel créé

echo [3/4] Activation et mise à jour de pip...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erreur activation venv
    pause
    exit /b 1
)

python -m pip install --upgrade pip

echo [4/4] Installation des dépendances essentielles...
pip install uvicorn[standard] fastapi
pip install slowapi
pip install sqlalchemy redis python-multipart pydantic-settings
pip install python-jose[cryptography] passlib[bcrypt] python-dotenv

echo Installation depuis requirements.txt si existant...
if exist "backend\requirements.txt" (
    pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo ⚠️ Certaines dépendances ont échoué, continuons...
    )
)

echo.
echo ============================================
echo ✅ ENVIRONNEMENT VIRTUEL CORRIGÉ !
echo ============================================
echo.
echo Structure finale:
echo CBM_Product_Explorer/
echo ├── venv/              ← Nouvel environnement correct
echo ├── backend/
echo └── frontend/
echo.
echo Test du nouvel environnement:
python -c "import uvicorn, fastapi, slowapi; print('✅ Toutes les dépendances principales OK')"
if errorlevel 1 (
    echo ⚠️ Certaines dépendances manquent encore
) else (
    echo ✅ Environnement prêt !
)

echo.
pause