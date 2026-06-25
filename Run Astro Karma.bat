@echo off
title Astro Karma

REM ---- Backend (FastAPI) ----
cd /d "%~dp0api"
set FIRST=0
if not exist .venv set FIRST=1
if "%FIRST%"=="1" echo Setting up backend (first run, please wait)...
if "%FIRST%"=="1" python -m venv .venv
if not exist .env copy .env.example .env >nul
if "%FIRST%"=="1" call .venv\Scripts\python -m pip install -q -e .
start "Astro Karma API" cmd /k ".venv\Scripts\python -m uvicorn app.main:app --port 8077"

REM ---- Frontend (Vite) ----
cd /d "%~dp0web"
if not exist node_modules echo Installing frontend dependencies (first run only)...
if not exist node_modules call npm install

echo.
echo Starting Astro Karma - your browser will open at http://localhost:5173
echo Two windows will run: this one (web) and the API window. Close both to stop.
echo.

call npm run dev -- --open

echo.
echo Astro Karma web has stopped.
pause
