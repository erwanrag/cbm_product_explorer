@echo off
echo 🧹 Nettoyage du cache Redis DB 2...

:: ✅ Remplace ce chemin par le tien exact :
"C:\redis\redis-cli.exe" -n 2 FLUSHDB

echo ✅ Redis DB 2 vidée.
pause
