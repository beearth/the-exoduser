@echo off
rem Skill Forge Lab server (port 3334): max level, every skill Lv1, no fusions, nothing saved. Close this window to stop.
cd /d "%~dp0"
set PORT=3334
start "" "http://localhost:3334/game.html?forgelab=1&tutorial=0&resourceTutorial=0"
"C:\nvm4w\nodejs\node.exe" server.cjs
