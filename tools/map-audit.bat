@echo off
REM tools/map-audit.bat — 맵 감사 실행 (FAIL 1개 이상이면 exit 1)
set NODE=C:\nvm4w\nodejs\node.exe
if not exist "%NODE%" set NODE=node
"%NODE%" "%~dp0map-audit.js"
exit /b %errorlevel%
