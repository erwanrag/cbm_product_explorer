@echo off
title CBM_GRC_Matcher - Start
cd /d D:\Projet\CBM_GRC_Matcher

:: 🔁 Choix dev/prod
set /p MODE=Mode [dev/prod] ?: 
if /i "%MODE%"=="prod" (
    set "BACKEND_CMD=uvicorn app.main:app --host 0.0.0.0 --port 5180 --workers 4"
) else (
    set "BACKEND_CMD=python -m uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload"
)

:: ✅ Redis (lancer uniquement s’il n’est pas déjà actif)
tasklist | find /i "redis-server.exe" > nul
if errorlevel 1 (
    echo 🔄 Redis...
    start "" cmd /c "cd /d C:\redis && redis-server.exe redis.windows.conf"
) else (
    echo ✅ Redis déjà actif.
)

:: ✅ Backend synchronisé
call venv\Scripts\activate
cd backend
%BACKEND_CMD%
