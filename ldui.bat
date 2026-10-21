@echo off
python "%~dp0livedrive_cli.py" --ui %*
if %ERRORLEVEL% NEQ 0 (
    py "%~dp0livedrive_cli.py" --ui %*
)
