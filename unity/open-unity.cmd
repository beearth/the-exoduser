@echo off
setlocal
if not defined ALLUSERSPROFILE set "ALLUSERSPROFILE=%ProgramData%"
set "FDG_UNITY_EDITOR=C:\Program Files\Unity\Hub\Editor\6000.4.8f1\Editor\Unity.exe"
if not exist "%FDG_UNITY_EDITOR%" (
 echo Unity 6000.4.8f1 is required. Select this project in Unity Hub.
 exit /b 1
)
start "" "%FDG_UNITY_EDITOR%" -projectPath "%~dp0."
exit /b 0
