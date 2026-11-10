@echo off
setlocal
cd /d "%~dp0"
title Qingzou Piano - localhost:4186
where py >nul 2>nul
if errorlevel 1 (
    echo Python launcher not found. Please install Python 3 with the py launcher.
    pause
    exit /b 1
)
py -X utf8 "%~dp0launcher.py" %*
if errorlevel 1 pause
endlocal
