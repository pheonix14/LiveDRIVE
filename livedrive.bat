@echo off
python "%~dp0livedrive_cli.py" %*
if %ERRORLEVEL% NEQ 0 (
    py "%~dp0livedrive_cli.py" %*
)
