@echo off
echo [1/3] gamedemo.html 생성 (game.html + DEMO_MODE=true)...
powershell -Command "(Get-Content 'game.html' -Raw) -replace 'const _DEMO_MODE=false;', 'const _DEMO_MODE=true;' | Set-Content 'gamedemo.html' -NoNewline"

echo [2/3] hell-build 동기화 중...
cp game.html ../hell-build/game.html
cp gamedemo.html ../hell-build/gamedemo.html
cp index.html ../hell-build/index.html
cp indexdemo.html ../hell-build/indexdemo.html
cp lang_*.js ../hell-build/
cp lobby_i18n.js ../hell-build/
cp maps_data.js ../hell-build/
echo 동기화 완료

echo [3/3] Vercel 배포 중...
cd ../hell-build
vercel --prod --yes
echo 배포 완료
