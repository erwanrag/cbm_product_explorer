@echo off
cd /d D:\Projet\CBM_GRC_Matcher
call venv\Scripts\activate
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload
