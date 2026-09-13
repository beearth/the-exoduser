import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  test(file+': live absorption plays shield audio and tutorial absorption delegates it once',()=>{
    const start=html.indexOf("    if(_qZone==='absorb'&&!p.friendly");
    const end=html.indexOf('      _recycleProj(p);continue;\n    }',start)+'      _recycleProj(p);continue;\n    }'.length;
    for(const lesson of [false,true]){
      const calls=[];const p={_lessonShot:lesson,el:0};
      const c={projs:[p],P:{},_qZone:'absorb',window:{_parryLesson:{miss:(p,absorbed)=>calls.push(['miss',absorbed])}},playSample:(key)=>calls.push(['sound',key]),addParts(){},addTxt(){},ELC:['white'],_T:s=>s,_recycleProj(){calls.push(['recycle']);}};
      vm.runInNewContext('for(const p of projs){'+html.slice(start,end)+'}',c);
      assert.deepEqual(calls,lesson?[['miss',true],['recycle']]:[['sound','shield_hit'],['recycle']]);
    }
  });
  test(file+': Q core shares the animated aura, while whirlwind has one layer',()=>{
    const start=html.indexOf('    if(_saReady&&_saWarmDone){');
    const code=html.slice(start,html.indexOf("    if(P.s==='sBlock'){",start));
    for(const s of ['sBlock','whirlwind'])for(const det of [false,true]){
      const draws=[];const c={P:{s,x:300,y:400},_saReady:true,_saWarmDone:true,_saTimer:0,_saFrame:0,_SA_COLS:2,_SA_CW:64,_SA_CH:64,ringR:150,pulse:1,_wwDetCD:0,_sbHasDet:det,pt:90,_s7UseLite:false,_SA_IMG:'blue',_SA_IMG_R:'red',X:{save(){},restore(){},drawImage(...args){draws.push(args);}}};
      vm.runInNewContext(code,c);
      const sizes=[...new Set(draws.map(a=>a[7]))];
      assert.deepEqual(sizes,s==='sBlock'?[562.5,75]:[562.5]);
      for(const d of draws){assert.equal(d[5]+d[7]/2,300);assert.equal(d[6]+d[8]/2,400);}
      if(s==='sBlock')assert.deepEqual(draws.filter(d=>d[7]===75).map(d=>d[0]),draws.filter(d=>d[7]===562.5).map(d=>d[0]));
      assert.equal(c._saTimer,1,'both layers advance a single shared animation clock');
    }
  });
}
test('guard practice uses shield audio once per absorption and keeps normal hurt audio',()=>{
  for(const guard of [true,false]){
    const p={friendly:false};const sounds=[];
    const l={step:guard?7:0,phase:'practice',pending:null,shot:p,saved:{},baseline:{},explode(){},completeStep(){this.pending='success';}};
    const c={window:{},P:{s:guard?'sBlock':'idle',hp:100,mhp:100,poise:4,x:0,y:0},pGuardAbsorb:()=>.3,doHitFlash(){},shake(){},playSample:(...a)=>sounds.push(a),addTxt(){}};
    vm.runInNewContext(readFileSync(new URL('../resource-practice.js',import.meta.url),'utf8'),c);
    const r=c.window._resourcePractice;Object.assign(r,{guardFired:guard,burstShots:guard?[p]:[],hitShots:new Set(),retryTicks:0,hits:0,baseline:{hp:100}});
    r.miss(l,p);r.miss(l,p);
    assert.deepEqual(sounds.map(a=>a[0]),[guard?'shield_hit':'player_hit1']);
    assert.ok(c.P.hp<100,'feedback changes must preserve actual practice damage');
  }
});
