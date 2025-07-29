@echo off
echo ========================================
echo    Fermeture de CBM GRC Matcher (local)
echo ========================================
echo.

:: ✅ Fermer uniquement les fenêtres nommées
taskkill /FI "WINDOWTITLE eq CBM Backend (dev)" >nul 2>&1
taskkill /FI "WINDOWTITLE eq CBM Backend (prod)" >nul 2>&1
taskkill /FI "WINDOWTITLE eq CBM Frontend (DEV)" >nul 2>&1

:: ℹ️ Ne pas fermer Redis car il est mutualisé

echo.
echo ✅ Backend et frontend CBM_GRC_Matcher arrêtés.
echo ========================================
pause
