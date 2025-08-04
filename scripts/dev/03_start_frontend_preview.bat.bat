@echo off
title CBM Frontend (PREVIEW)

cd /d D:\Projet\CBM_GRC_Matcher\frontend

echo ============================================
echo    DEMARRAGE FRONTEND CBM (PREVIEW)
echo ============================================

echo ✅ Préparation du mode preview...
echo ⚠️ Vérifiez que .env.production est correct

echo 🔥 Lancement de vite en mode preview (port 5181)...
call npm run preview -- --port 5181
