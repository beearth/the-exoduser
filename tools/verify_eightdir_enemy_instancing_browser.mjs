import { chromium } from 'playwright';

const COUNT=512;
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:3333/game.html?test=1', { waitUntil: 'commit', timeout: 10000 });
  await page.waitForTimeout(5000);
  const result = await page.evaluate(() => {
    const count=512;
    const oldAtlas = _ch8Atlas[1], oldEns = ens.slice(), oldCam = { x: G.cam.x, y: G.cam.y };
    const oldP = P ? { x: P.x, y: P.y } : null;
    const tex = document.createElement('canvas'); tex.width = tex.height = 256;
    const tx = tex.getContext('2d'); tx.fillStyle = '#fff'; tx.fillRect(0, 0, 256, 256);
    const entry = { img: tex, ready: true };
    const dirs={},walkDirs={};for(const dir of _ENS8_GL_DIRS){dirs[dir]=entry;walkDirs[dir]=entry;}
    _ch8Atlas[1] = { meta: { cell: 256 }, dirs, walkDirs, walkMeta: { _idxSet: new Set([0]), framesPerMob: 4 } };
    try {
      ens.length = 0;G.cam.x = 0;G.cam.y = 0;if(P){P.x=100000;P.y=100000;}
      for(let i=0;i<count;i++)ens.push({alive:true,x:(i%32)*10,y:~~(i/32)*10,r:12,ib:false,_isGhoul:false,_isSlime:false,
        _mob8dir:true,_mobCh:1,_mob8Col:0,_mob8Row:0,etype:0,facing:i%8*Math.PI/4,_isMoving:true,_walkDist:0,
        hp:10,mhp:10,stunned:0,reviveIframes:0,_spawnT:0});
      while(GL.getError()!==GL.NO_ERROR){}
      const t0=performance.now();
      _prepEnemyInstanced(-1000, 1000, -1000, 1000, performance.now(), 1000);
      const prepMs=performance.now()-t0,queued=ens.filter((e)=>e._ensGLMode).length;
      return { useGL:_useGL,ensGL:_ensGLMode,queued,sprites:_dbgEns8GL,draws:_dbgEns8GLDraws,prepMs,glError:GL.getError() };
    } finally {
      ens.length = 0;ens.push(...oldEns);_ch8Atlas[1] = oldAtlas;G.cam.x = oldCam.x;G.cam.y = oldCam.y;if(P&&oldP){P.x=oldP.x;P.y=oldP.y;}
    }
  });
  const output = { result, errors };
  if (!result.useGL || !result.ensGL || result.queued !== COUNT || result.sprites !== COUNT*2 || result.draws !== 16 || !Number.isFinite(result.prepMs) || result.glError !== 0 || errors.length) throw new Error(JSON.stringify(output));
  console.log(JSON.stringify(output));
} finally {
  if (browser) await browser.close();
}
