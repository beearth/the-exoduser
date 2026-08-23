@echo off
setlocal enabledelayedexpansion
set "PATH=C:\Windows\system32;C:\Windows;C:\Windows\System32\Wbem;C:\Windows\System32\WindowsPowerShell\v1.0;C:\nvm4w\nodejs;C:\Program Files\Git\cmd;C:\Program Files\Git\mingw64\bin;%APPDATA%\npm;%USERPROFILE%\.local\bin"
set "ROOT=G:\exoduser"
set "AL=%ROOT%\autoloop"
cd /d "%ROOT%"
if not exist "%AL%\logs" mkdir "%AL%\logs"
if exist "%AL%\STOP" echo [SKIP] STOP flag & exit /b 0
if exist "%AL%\LOCK" echo [SKIP] LOCK exists & exit /b 0
echo %DATE% %TIME% > "%AL%\LOCK"
set RETRY=0
:LOOP
if exist "%AL%\STOP" goto :DONE
for /f "tokens=1-4 delims=/ " %%a in ("%DATE%") do set "D=%%b%%c%%d"
set "LOG=%AL%\logs\%D%.log"
echo ==== START %DATE% %TIME% retry=!RETRY! ==== >> "%LOG%"
type "%AL%\AUTOLOOP.md" | claude -p "위 문서가 작업 지시서다. 그대로 수행하라." --permission-mode acceptEdits --max-turns 40 --max-budget-usd 3 --verbose >> "%LOG%" 2>&1
set "CODE=!ERRORLEVEL!"
echo ==== EXIT !CODE! %DATE% %TIME% ==== >> "%LOG%"
if "!CODE!"=="0" goto :DONE
set /a RETRY+=1
if !RETRY! GEQ 5 echo [ABORT] retry limit >> "%LOG%" & goto :DONE
timeout /t 60 /nobreak > nul
goto :LOOP
:DONE
del "%AL%\LOCK" 2>nul
endlocal
exit /b 0
