@echo off
setlocal
cd /d "%~dp0"
if not exist "EXODUSER-native-preview.exe" (
  echo EXODUSER-native-preview.exe is missing. Extract the complete preview ZIP first.
  pause
  exit /b 1
)
if not exist "EXODUSER-native-preview.pck" (
  echo EXODUSER-native-preview.pck is missing. Keep the EXE and PCK together.
  pause
  exit /b 1
)
start "" /wait "%~dp0EXODUSER-native-preview.exe" --fullscreen --rendering-method gl_compatibility --max-fps 240
exit /b %errorlevel%
