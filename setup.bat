@echo off
setlocal enabledelayedexpansion

title LiveDRIVE Setup & Installer
color 0E

echo ======================================================
echo    __    _            ____  ____  _____ _    __ _____
echo   / /   (_)   _____  / __ \/ __ \/  _/ ^| / /____ /
echo  / /   / / ^| / / _ \/ / / / /_/ // / ^| ^| / / __/ / 
echo / /___/ /^| ^|/ /  __/ /_/ / _, _// /  ^| ^|/ / /___/  
echo /_____/_/ ^|___/\___/_____/_/ ^|_/___/  ^|___/_____/   
echo ======================================================
echo       AUTOMATED SETUP & TERMINAL CLI INSTALLER
echo ======================================================
echo.

set "SCRIPT_DIR=%~dp0"
set "BIN_DIR=%SCRIPT_DIR%bin"

:: 1. Check Python
echo [1/4] Checking Python installation...
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    where py >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo [ERROR] Python is not found in your PATH!
        echo Please install Python 3.10+ from https://www.python.org/
        pause
        exit /b 1
    ) else (
        set "PY_CMD=py"
    )
) else (
    set "PY_CMD=python"
)
%PY_CMD% --version
echo [OK] Python is available.
echo.

:: 2. Check Node & NPM
echo [2/4] Checking Node.js and npm...
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your PATH!
    echo Please install Node.js (v18+) from https://nodejs.org/
    pause
    exit /b 1
)
node -v
npm -v
echo [OK] Node.js and npm are available.
echo.

:: 3. Install Python Dependencies
echo [3/4] Installing Python dependencies (requirements.txt)...
%PY_CMD% -m pip install -r "%SCRIPT_DIR%requirements.txt"
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] Pip install had issues. Attempting direct dependency install...
    %PY_CMD% -m pip install flask flask-socketio websockets requests eventlet
)
echo [OK] Python dependencies ready.
echo.

:: 4. Install Frontend NPM Dependencies
echo [4/4] Installing Next.js Frontend dependencies...
cd /d "%SCRIPT_DIR%frontend"
call npm install
cd /d "%SCRIPT_DIR%"
echo [OK] Frontend packages ready.
echo.

:: 5. Create launcher binaries and wrappers
if not exist "%BIN_DIR%" mkdir "%BIN_DIR%"

echo @echo off > "%BIN_DIR%\livedrive.bat"
echo "%PY_CMD%" "%SCRIPT_DIR%livedrive_cli.py" %%* >> "%BIN_DIR%\livedrive.bat"

echo @echo off > "%BIN_DIR%\ld.bat"
echo "%PY_CMD%" "%SCRIPT_DIR%livedrive_cli.py" %%* >> "%BIN_DIR%\ld.bat"

echo @echo off > "%BIN_DIR%\ldui.bat"
echo "%PY_CMD%" "%SCRIPT_DIR%livedrive_cli.py" --ui %%* >> "%BIN_DIR%\ldui.bat"

echo @echo off > "%BIN_DIR%\ldcli.bat"
echo "%PY_CMD%" "%SCRIPT_DIR%livedrive_cli.py" --cli %%* >> "%BIN_DIR%\ldcli.bat"

:: Copy root wrappers as well
copy /Y "%BIN_DIR%\livedrive.bat" "%SCRIPT_DIR%livedrive.bat" >nul
copy /Y "%BIN_DIR%\ld.bat" "%SCRIPT_DIR%ld.bat" >nul
copy /Y "%BIN_DIR%\ldui.bat" "%SCRIPT_DIR%ldui.bat" >nul
copy /Y "%BIN_DIR%\ldcli.bat" "%SCRIPT_DIR%ldcli.bat" >nul

echo ======================================================
echo                 SETUP COMPLETE!
echo ======================================================
echo You can run LiveDRIVE commands directly from this folder:
echo   - livedrive   : Interactive menu or start all services
echo   - ld          : Alias for livedrive
echo   - ldui        : Start Next.js UI on http://localhost:3000
echo   - ldcli       : Start Backend servers (Relay + Flask)
echo.

set /p ADDPATH="Would you like to add LiveDRIVE to your User PATH so commands work everywhere? (Y/N): "
if /i "%ADDPATH%"=="Y" (
    echo Adding %BIN_DIR% to User PATH...
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set "USER_PATH=%%B"
    if "!USER_PATH!"=="" (
        setx PATH "%BIN_DIR%" >nul
    ) else (
        echo !USER_PATH! | find /i "%BIN_DIR%" >nul
        if %ERRORLEVEL% NEQ 0 (
            setx PATH "!USER_PATH!;%BIN_DIR%" >nul
            echo [SUCCESS] %BIN_DIR% added to PATH! Open a new command prompt to use everywhere.
        ) else (
            echo %BIN_DIR% is already in your PATH.
        )
    )
)

echo.
echo Launching LiveDRIVE now...
"%BIN_DIR%\livedrive.bat"
