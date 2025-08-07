@echo off
cd /d D:\Projet\CBM_Product_Explorer
call venv\Scripts\activate
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 5180 --reload
