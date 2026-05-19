@echo off
echo ═══════════════════════════════════════
echo   EXODUSER: HELL LORD — Steam Build Upload
echo   App ID: 4749590
echo ═══════════════════════════════════════
echo.

set /p STEAM_USER="Steam 계정 입력: "

echo.
echo [1/2] SteamCMD 로그인 + 빌드 업로드 시작...
echo.

steamcmd +login %STEAM_USER% +run_app_build "G:\hell\steam\app_build_4749590.vdf" +quit

echo.
echo ═══════════════════════════════════════
if %ERRORLEVEL%==0 (
  echo   업로드 완료! Steamworks에서 빌드 확인하세요:
  echo   https://partner.steamgames.com/apps/builds/4749590
) else (
  echo   업로드 실패. 위 오류 메시지 확인.
)
echo ═══════════════════════════════════════
pause
