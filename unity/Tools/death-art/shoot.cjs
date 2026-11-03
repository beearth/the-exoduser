const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
(async()=>{const [,,html,dir]=process.argv;const b=await chromium.launch({headless:true});
const p=await b.newPage({viewport:{width:2200,height:1400}});await p.goto('file://'+html);
console.log(await p.evaluate(async()=>Promise.all([...document.fonts].map(f=>f.load().then(()=>f.status,e=>'ERR')))));await p.waitForTimeout(800);
await (await p.$('#cal')).screenshot({path:dir+'/death_calligraphy.png',omitBackground:true});
await (await p.$('#spl')).screenshot({path:dir+'/death_splatter.png',omitBackground:true});
// preview composite on black at 1920x1080 scale
await p.setViewportSize({width:1920,height:1080});
await p.setContent(`<body style="margin:0;background:#000;width:1920px;height:1080px;position:relative;overflow:hidden">
<img src="file://${dir}/death_splatter.png" style="position:absolute;width:700px;left:${960-350+10}px;top:${150}px">
<img src="file://${dir}/death_calligraphy.png" style="position:absolute;width:380px;left:${960-190}px;top:150px">
<div style="position:absolute;top:868px;width:100%;text-align:center;font:28px Cinzel,serif;letter-spacing:.42em;color:#b8141b">DEAD</div></body>`);
await p.waitForTimeout(500);await p.screenshot({path:dir+'/preview.png'});await b.close();})();
