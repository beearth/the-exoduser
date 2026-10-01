// Submission review only: records known defects; does not modify the game.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const art = require('../ART/wa24-delta-probe.cjs');
const source = fs.readFileSync('game.html', 'utf8');
const start = source.indexOf('      // 카메라 트랜스폼');
const end = source.indexOf('      cx.restore();', start);
assert(start >= 0 && end > start);
const drawSource = source.slice(start, end);
assert(source.includes('cx.rect(_lbX,_lbY,cw,ch);cx.clip();cx.translate(_lbX,_lbY)'));
const rows = [];
for (const [w,h] of [[1920,1080],[2560,1080],[1920,1200],[1024,768]]) {
  for (const elapsed of [400,1200,2399]) {
    const {cw,ch} = art.predictLetterbox(w,h);
    let z=1,tx=0,ty=0,rect;
    const cx={
      translate(x,y){tx+=z*x;ty+=z*y;},
      scale(x,y){assert.equal(x,y);z*=x;},
      drawImage(img,x,y,width,height){rect={x:tx+z*x,y:ty+z*y,w:z*width,h:z*height};}
    };
    vm.runInNewContext(drawSource,{cx,cw,ch,ln:art.WA24,lineElapsed:elapsed,now:elapsed,
      img:{naturalWidth:2560,naturalHeight:1440},
      _ease:{linear:t=>t,out:t=>1-(1-t)*(1-t)},
      _cutShake:(mag,t)=>({x:(Math.sin(t*.047)*mag*2)|0,y:(Math.cos(t*.053)*mag*2)|0})});
    const top=Math.max(0,-rect.y)/rect.h,bottom=Math.max(0,rect.y+rect.h-ch)/rect.h;
    assert(top>0 && bottom>0, 'actual transform clips both vertical edges');
    rows.push({w,h,elapsed,zoom:z,baseVerdict:art.predictWa24Crop(w,h).verdict,
      topFraction:top,bottomFraction:bottom,combinedVerticalFraction:top+bottom});
  }
}
await import('../SKILL/ice-cancel-probe.safe.js');
let pending,raw={aim:true,mp:100,stk:0,rech:100,zones:[]};
const listeners=new Set();
const win={addEventListener(t,f){listeners.add(f);},removeEventListener(t,f){listeners.delete(f);},
  requestAnimationFrame(f){pending=f;return 1;},cancelAnimationFrame(){pending=null;}};
const probe=globalThis.IceCancelProbe.install({win,readRaw:()=>raw,now:()=>0});
// Synthetic one-update frame: timer has not expired, yet a stack is refunded.
raw={...raw,aim:false,stk:1,rech:99};
let tick=pending;pending=null;tick();
const counts=probe.dump().counts;
assert.equal(counts.rechargeTicks,1, 'documents erroneous recharge classification');
assert.equal(counts.stkRefund,0, 'documents missed illegal refund');
probe.dispose();
assert.equal(listeners.size,0);
// Install-time reader failure occurs after registering listeners.
assert.throws(()=>globalThis.IceCancelProbe.install({win,readRaw(){throw Error('fixture read');},now:()=>0}),/fixture read/);
assert.equal(listeners.size,3, 'documents failed-install listener leak');
console.log(JSON.stringify({status:'KNOWN_DEFECTS_REPRODUCED_NOT_ACCEPTANCE',
  sourceSha256:createHash('sha256').update(source).digest('hex'),crop:rows,
  skill:{falseRecharge:counts,failedInstallListeners:listeners.size},
  limits:'Static source execution and synthetic fixtures; no game, pixel or real-input verdict.'},null,2));
