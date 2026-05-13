@echo off
echo [1/3] gamedemo.html 생성 (game.html + DEMO_MODE=true)...
powershell -Command "[System.IO.File]::WriteAllText('gamedemo.html', ([System.IO.File]::ReadAllText('game.html', [System.Text.Encoding]::UTF8) -replace 'const _DEMO_MODE=false;', 'const _DEMO_MODE=true;'), [System.Text.Encoding]::UTF8)"

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
