@echo off
REM 도진 퀀트 킷 — alert 실행 런처 (작업 스케줄러가 호출)
REM 출력은 스크립트 내부 tee 로 reports\logs\ 에 자동 저장됨
"G:\hell\.venv\Scripts\python.exe" "G:\hell\reports\dojin_quant.py" alert
