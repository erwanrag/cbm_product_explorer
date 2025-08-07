REM ============================================
REM 📁 scripts/dev/07_logs.bat
REM ============================================
@echo off
title CBM - Logs
cd /d D:\Projet\CBM_Product_Explorer

echo ============================================
echo    CONSULTATION LOGS CBM
echo ============================================
echo.

if not exist "logs" (
    echo ❌ Dossier logs inexistant
    pause
    exit /b 0
)

echo Fichiers de logs disponibles:
dir logs\*.log /b 2>nul

echo.
set /p "CHOICE=Quel fichier consulter (ou 'all' pour tous) ?: "

if /i "%CHOICE%"=="all" (
    echo.
    echo ============================================
    echo    TOUS LES LOGS
    echo ============================================
    for %%f in (logs\*.log) do (
        echo.
        echo === %%f ===
        type "%%f" | tail -20
    )
) else (
    if exist "logs\%CHOICE%" (
        echo.
        echo ============================================
        echo    %CHOICE%
        echo ============================================
        type "logs\%CHOICE%"
    ) else (
        echo ❌ Fichier non trouvé: %CHOICE%
    )
)

echo.
pause
