@echo off
setlocal
cd /d G:\exoduser
for /f "delims=" %%s in ('git stash create') do set "SHA=%%s"
if "%SHA%"=="" echo [SNAP] no changes to save & exit /b 0
for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "STAMP=%%t"
git stash store -m "SNAP_%STAMP%" %SHA%
echo [SNAP] saved %SHA%
git stash list
endlocal
