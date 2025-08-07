@echo off
title CBM Backend (PROD)

cd /d D:\Projet\CBM_Product_Explorer\backend

echo ============================================
echo     🚀 DEMARRAGE BACKEND CBM (PRODUCTION)
echo ============================================

call ..\venv\Scripts\activate.bat

echo ✅ Chargement variables d'environnement .env.prod...
set CBM_ENV=prod

echo 🔥 Lancement FastAPI avec uvicorn (sans reload)...
python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --env-file ..\.env.prod
