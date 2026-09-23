import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createCanvas} from 'canvas';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  const start=html.indexOf('    if(p.trap){',html.indexOf('// 패스 2: 메인 드로우'));
  const end=html.indexOf('    if(p.web){',start);
  assert.ok(start>=0&&end>start);
  const code='for(const p of projectiles){'+html.slice(start,end)+'}';
  test(file+': permanent traps show their contact boundary even at the dimmest pulse',()=>{
    for(const life of [600,1,0,-12000]){
      const canvas=createCanvas(96,96),X=canvas.getContext('2d');
      X.fillStyle='#18141b';X.fillRect(0,0,96,96);
      vm.runInNewContext(code,{X,projectiles:[{trap:true,x:48,y:48,life,ml:600}],_now:Math.PI*300,Math});
      const rgba=X.getImageData(48+28,48,1,1).data;
      assert.ok(rgba[0]>140&&rgba[0]>rgba[2]*1.3,'danger edge must be readable at the 28px contact radius, life='+life);
      assert.equal(X.globalAlpha,1);assert.equal(X.globalCompositeOperation,'source-over');
    }
  });
}
