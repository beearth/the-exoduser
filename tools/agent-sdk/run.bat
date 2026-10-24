@echo off
chcp 65001 >nul
cd /d "%~dp0"

where py >nul 2>nul && (set "PY=py -3") || (set "PY=python")
%PY% --version >nul 2>nul || (
  echo Python이 없습니다. https://www.python.org/downloads/ 에서 설치할 때 "Add python.exe to PATH"를 체크하세요.
  pause
  exit /b 1
)

if not exist .venv (
  echo 처음 실행: 환경을 준비합니다...
  %PY% -m venv .venv || (pause & exit /b 1)
)
call .venv\Scripts\activate.bat
python -m pip install -q --upgrade claude-agent-sdk || (pause & exit /b 1)

if "%ANTHROPIC_API_KEY%"=="" set /p "ANTHROPIC_API_KEY=Console API 키(sk-ant-...)를 붙여넣고 Enter: "

python exo_agent.py
pause
