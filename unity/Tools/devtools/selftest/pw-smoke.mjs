// exo-unity.ps1 browser 자체 점검: headless 크로미움으로 data: 페이지를 열고 제목을 읽어 닫는다.
// playwright 는 EXO_NODE_MODULES(기본 G:\exoduser\node_modules)에서 불러온다.
import { createRequire } from 'module';
import path from 'path';
const nm = process.env.EXO_NODE_MODULES || 'G:/exoduser/node_modules';
const req = createRequire(path.join(nm, 'x.js'));
const { chromium } = req('playwright');
const browser = await chromium.launch();                       // 가드가 headless:true + --mute-audio 를 강제한다
const page = await browser.newPage();
await page.goto('data:text/html,<title>exo-smoke</title><body>ok</body>');
await new Promise((r) => setTimeout(r, 2500));                  // 창 감시가 돌 시간
console.log('title=' + (await page.title()) + ' headless-ok');
await browser.close();
