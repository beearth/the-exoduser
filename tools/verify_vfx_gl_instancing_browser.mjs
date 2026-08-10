import { chromium } from 'playwright';

const COUNT=256;
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
  const result = await page.evaluate((count) => {
    const oldDbg=_dbgVfxGLDrawn;
    const tex=document.createElement('canvas');tex.width=tex.height=64;
    const tx=tex.getContext('2d');tx.fillStyle='#fff';tx.fillRect(0,0,64,64);
    try {
      if(_vfxGLCount!==0)throw new Error('VFX batch was not empty before isolated verification');
      while(GL.getError()!==GL.NO_ERROR){}
      _dbgVfxGLDrawn=0;
      let queued=0;const t0=performance.now();
      for(let i=0;i<count;i++)if(_queueVfxGL(tex,0,0,64,64,(i%32)*24,~~(i/32)*24,20,20,0,1))queued++;
      const drawn=_flushVfxGL(),prepMs=performance.now()-t0;
      return {useGL:_useGL,vfxGL:_vfxGLMode,queued,drawn,dbg:_dbgVfxGLDrawn,prepMs,glError:GL.getError()};
    } finally {_dbgVfxGLDrawn=oldDbg;}
  }, COUNT);
  const output={result,errors};
  if(!result.useGL||!result.vfxGL||result.queued!==COUNT||result.drawn !== COUNT||result.dbg!==COUNT||!Number.isFinite(result.prepMs)||result.glError !== 0||errors.length)throw new Error(JSON.stringify(output));
  console.log(JSON.stringify(output));
} finally {if(browser)await browser.close();}
