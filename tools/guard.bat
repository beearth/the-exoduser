@echo off
REM tools/guard.bat — 커밋 전 검증 가드 실행 (node tools/guard.js)
REM node 전체경로 우선 (plain node = 깨진 shim 회피, CLAUDE.md 규칙)
set NODE=C:\nvm4w\nodejs\node.exe
if not exist "%NODE%" set NODE=node
"%NODE%" "%~dp0guard.js"
exit /b %errorlevel%
