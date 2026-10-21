@echo off
python "%~dp0livedrive_cli.py" --cli %*
if %ERRORLEVEL% NEQ 0 (
    py "%~dp0livedrive_cli.py" --cli %*
)
