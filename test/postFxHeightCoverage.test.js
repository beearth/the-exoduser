import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';

const layers={
  environment:{start:'{const _elHell=SI_TO_HELL[G.stage||0];',end:'// ═══ 지옥별 동적 비네팅',cache:'_envLightCvs'},
  vignette:{start:'// 비네팅 캐시 캔버스 (스테이지/해상도 변경 시만 리빌드)',end:'_pC3=performance.now();',cache:'_dvgCvs'},
  damage:{start:'if(!G._redTintCvs||',end:'G._redTintW=C.width;',cache:'_redTintCvs'}
};

for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
  for(const [name,layer] of Object.entries(layers)){
    const start=html.indexOf(layer.start);assert.ok(start>=0,`${file}: ${name} source missing`);
    let end=html.indexOf(layer.end,start);assert.ok(end>start);
    let pass=html.slice(start,end);
    if(name==='vignette')pass='{'+pass;
    if(name==='damage')pass=html.slice(start,html.indexOf('}',end)+1)+'X.drawImage(G._redTintCvs,0,0);';
    function runtime(height){
      const C=createCanvas(640,height),G={stage:0,_bossArena:false};
      const scope={C,G,X:C.getContext('2d'),document:{createElement:()=>createCanvas(1,1)},
        SI_TO_HELL:[0,1],_ENV_LIGHT:['rgba(20,40,80,.18)','rgba(50,20,10,.25)']};
      const context=vm.createContext(scope);
      return {C,G,render(){scope.X.clearRect(0,0,C.width,C.height);vm.runInContext(pass,context);
        return Buffer.from(scope.X.getImageData(0,0,C.width,C.height).data);}};
    }
    for(const height of [480,240])test(`${file}: ${name} covers a height-only resize from 360 to ${height}`,()=>{
      const current=runtime(360);current.render();current.C.height=height;
      const resized=current.render(),fresh=runtime(height).render();
      assert.equal(current.G[layer.cache].height,height,'cached filter retains the previous viewport height');
      assert.ok(resized.equals(fresh),'resizing must produce the same filter pixels as a fresh viewport');
    });
    test(`${file}: ${name} retains its stationary cache`,()=>{
      const r=runtime(360),first=r.render(),cache=r.G[layer.cache];
      const next=r.render();assert.equal(r.G[layer.cache],cache);assert.ok(next.equals(first));
    });
  }
}
