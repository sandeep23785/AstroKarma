@echo off
title Astro Karma
cd /d "%~dp0web"

if not exist node_modules echo Installing dependencies (first run only, please wait)...
if not exist node_modules call npm install

echo.
echo Starting Astro Karma - your browser will open at http://localhost:5173
echo Close this window to stop the app.
echo.

call npm run dev -- --open

echo.
echo Astro Karma has stopped.
pause
