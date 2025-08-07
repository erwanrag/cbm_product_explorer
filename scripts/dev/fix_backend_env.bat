@echo off
title CBM Product Explorer - Fix Backend (venv racine)
cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo   REPARATION ENVIRONNEMENT BACKEND
echo   (Utilisation du venv RACINE)
echo ============================================

REM Supprimer TOUS les venv dans backend (pour éviter confusion)
echo [1/5] Nettoyage des environnements virtuels en double...
if exist "backend\venv" (
    echo Suppression du venv dans backend...
    rmdir /s /q "backend\venv"
    echo ✅ venv backend supprimé
)

REM Vérifier/créer le venv à la RACINE
if not exist "venv" (
    echo [2/5] Création de l'environnement virtuel à la RACINE...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Erreur lors de la création de l'environnement virtuel
        pause
        exit /b 1
    )
    echo ✅ Environnement virtuel racine créé
) else (
    echo [2/5] ✅ Environnement virtuel racine existe déjà
)

REM Activation du venv RACINE
echo [3/5] Activation de l'environnement virtuel RACINE...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ Erreur lors de l'activation
    pause
    exit /b 1
)
echo ✅ Environnement virtuel racine activé

REM Mise à jour de pip
echo [4/5] Mise à jour de pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo ⚠️ Avertissement: Impossible de mettre à jour pip
)

REM Installation des dépendances essentielles
echo [5/5] Installation des dépendances essentielles...
echo Installation de uvicorn et fastapi...
pip install uvicorn[standard] fastapi
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation de uvicorn/fastapi
    pause
    exit /b 1
)

echo Installation des autres dépendances...
pip install sqlalchemy redis python-multipart pydantic-settings
if errorlevel 1 (
    echo ❌ Erreur lors de l'installation des dépendances de base
    pause
    exit /b 1
)

REM Installation de Prophet (optionnel)
echo Installation de Prophet (peut prendre du temps)...
pip install prophet
if errorlevel 1 (
    echo ⚠️ Prophet n'a pas pu être installé (normal, pas critique)
    echo L'application fonctionnera sans Prophet
) else (
    echo ✅ Prophet installé avec succès
)

REM Installation depuis requirements.txt si existant
if exist "backend\requirements.txt" (
    echo Installation depuis backend\requirements.txt...
    pip install -r backend\requirements.txt
    if errorlevel 1 (
        echo ⚠️ Certaines dépendances de backend\requirements.txt ont échoué
    ) else (
        echo ✅ backend\requirements.txt installé
    )
) else (
    echo ℹ️ Aucun fichier backend\requirements.txt trouvé
)

REM Test de l'installation
echo.
echo 🧪 Test de l'installation...
python -c "import uvicorn; print('✅ uvicorn OK')"
if errorlevel 1 (
    echo ❌ uvicorn toujours non disponible
    pause
    exit /b 1
)

python -c "import fastapi; print('✅ fastapi OK')"
if errorlevel 1 (
    echo ❌ fastapi non disponible
    pause
    exit /b 1
)

python -c "from prophet import Prophet; print('✅ Prophet OK')" 2>nul
if errorlevel 1 (
    echo ⚠️ Prophet non disponible (optionnel)
) else (
    echo ✅ Prophet OK
)

echo.
echo ============================================
echo ✅ REPARATION TERMINÉE !
echo ============================================
echo.
echo Structure finale:
echo CBM_Product_Explorer/
echo ├── venv/                  ← UN SEUL venv ICI
echo ├── backend/               ← (plus de venv ici)
echo │   └── requirements.txt
echo └── scripts/dev/
echo.
echo L'environnement backend utilise maintenant le venv racine
echo Vous pouvez relancer: scripts\dev\04_start_both.bat
echo.
pause