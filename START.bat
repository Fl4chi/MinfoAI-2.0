@echo off
title MinfoAI 2.0 - Avvio Automatico
color 0A

echo.
echo ========================================
echo    MinfoAI 2.0 - Avvio Automatico
echo ========================================
echo.

REM Controlla se Node.js è installato
echo [1/5] Controllo Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRORE] Node.js non installato!
    echo Scaricalo da: https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js trovato!

REM Controlla se MongoDB è in esecuzione
echo.
echo [2/5] Controllo MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %errorlevel% neq 0 (
    echo [WARNING] MongoDB non in esecuzione!
    echo Avviando MongoDB...
    start "" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
    timeout /t 3 >nul
)
echo [OK] MongoDB attivo!

REM Controlla se Ollama è in esecuzione (opzionale)
echo.
echo [3/5] Controllo Ollama...
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if %errorlevel% neq 0 (
    echo [INFO] Ollama non in esecuzione (opzionale)
    echo Avviando Ollama...
    start "" "ollama" serve
    timeout /t 2 >nul
) else (
    echo [OK] Ollama già attivo!
)

REM Installa dipendenze se necessario
echo.
echo [4/5] Controllo dipendenze...
if not exist "node_modules\" (
    echo Installando dipendenze...
    call npm install
) else (
    echo [OK] Dipendenze già installate!
)

REM Avvia il bot
echo.
echo [5/5] Avvio MinfoAI 2.0...
echo.
echo ========================================
echo    BOT IN ESECUZIONE
echo    Premi CTRL+C per fermare
echo ========================================
echo.

npm start

REM Se il bot si chiude, mostra messaggio
echo.
echo ========================================
echo    BOT TERMINATO
echo ========================================
pause
