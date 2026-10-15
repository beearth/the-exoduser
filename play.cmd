@echo off
setlocal
cd /d "%~dp0"
set "FDG_RUNTIME=%FDG_NODE_BIN%"
if not defined FDG_RUNTIME if exist "C:\nvm4w\nodejs\node.exe" set "FDG_RUNTIME=C:\nvm4w\nodejs\node.exe"
if not defined FDG_RUNTIME if exist "G:\NODE.JS\node.exe" set "FDG_RUNTIME=G:\NODE.JS\node.exe"
if not defined FDG_RUNTIME (
  echo Set FDG_NODE_BIN to the full Node executable path.
  exit /b 1
)
if not exist "%FDG_RUNTIME%" exit /b 1
echo EXODUSER web source: "%CD%"
git rev-parse --short HEAD
echo http://127.0.0.1:3333/index.html
echo If port 3333 is occupied, close the existing server yourself first.
"%FDG_RUNTIME%" "%~dp0server.cjs"
exit /b %errorlevel%
