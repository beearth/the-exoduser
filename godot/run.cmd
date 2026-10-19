@echo off
setlocal
set "FDG_PROJECT_DIR=%~dp0"
set "FDG_RUNTIME=%FDG_GODOT_BIN%"
if not defined FDG_RUNTIME for %%G in (godot4.exe godot.exe) do (
  if not defined FDG_RUNTIME for /f "delims=" %%P in ('where %%G 2^>nul') do set "FDG_RUNTIME=%%P"
)
if not defined FDG_RUNTIME (
  echo Set FDG_GODOT_BIN to the Godot 4.7.2 executable path.
  exit /b 1
)
if not exist "%FDG_RUNTIME%" (
  echo Godot executable is missing: "%FDG_RUNTIME%"
  exit /b 1
)
echo EXODUSER native partial preview - source: "%FDG_PROJECT_DIR%.."
echo This preview is not the complete latest web game.
if not exist "%FDG_PROJECT_DIR%.godot\imported" (
  echo Godot resources must be imported for this checkout. Automatic full import is disabled.
  exit /b 1
)
"%FDG_RUNTIME%" --path "%FDG_PROJECT_DIR%." %* -- --fdg-native-perspective-first
exit /b %errorlevel%
