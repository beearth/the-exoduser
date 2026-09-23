import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(new URL('../'+file,import.meta.url),'utf8');
  function setup(){
    const start=html.indexOf('function _drawFlameBladeSwing(');
    assert.ok(start>=0,'Flame Blade renderer exists');
    const end=html.indexOf('\n// ── 회전참 대검',start);
    const calls=[];
    const ctx={save(){calls.push(['save'])},restore(){calls.push(['restore'])},translate(...a){calls.push(['translate',...a])},rotate(...a){calls.push(['rotate',...a])},drawImage(...a){calls.push(['draw',...a])}};
    const scope=vm.createContext({_charIdx:0,P:{s:'sBash',st2:24,_stWingT:40,_sBashChgMul:1,x:30,y:40,facing:Math.PI/2},_flameBladeReady:true,_flameBladeImg:{width:1774,height:887},_eSkillRangeMul:()=>1,sh:()=>({bonusRange:0})});
    vm.runInContext(html.slice(start,end),scope);
    return {scope,ctx,calls,draw:pose=>scope._drawFlameBladeSwing(ctx,pose)};
  }
  test(file+': cooldown E, unrelated actions and unloaded images never draw fire',()=>{
    const {scope,draw,calls}=setup();
    scope.P._stWingT=0;assert.equal(draw(),false);
    scope.P._stWingT=40;scope.P.s='wSwing';assert.equal(draw(),false);
    scope.P.s='sBash';scope._flameBladeReady=false;assert.equal(draw(),false);
    assert.equal(calls.length,0);
  });
  test(file+': all eight frames stay within the sheet, keep pivot and restore canvas state',()=>{
    const {scope,draw,calls}=setup();
    for(let frame=0;frame<8;frame++){
      calls.length=0;
      assert.equal(draw({kind:'shield',spinProgress:(frame+.1)/8}),true);
      const d=calls.find(x=>x[0]==='draw');
      assert.equal(Math.floor(d[2]/443.5),frame%4);
      assert.equal(Math.floor(d[3]/443.5),Math.floor(frame/4));
      assert.ok(d[2]>=0&&d[2]+d[4]<=1774&&d[3]>=0&&d[3]+d[5]<=887);
      assert.equal(d[6],-d[8]/2);assert.equal(d[7],-d[9]/2);
      assert.deepEqual(calls.find(x=>x[0]==='translate'),['translate',30,40]);
      assert.deepEqual(calls.find(x=>x[0]==='rotate'),['rotate',Math.PI/2]);
      assert.equal(calls.at(-1)[0],'restore');
    }
    scope.P._sBashChgMul=3;calls.length=0;draw();
    const charged=calls.find(x=>x[0]==='draw')[8];
    scope.P._sBashChgMul=1;calls.length=0;draw();
    assert.equal(charged,calls.find(x=>x[0]==='draw')[8]*3);
  });
  test(file+': fire animation ends with the swing and fallback can render',()=>{
    const {scope,draw,calls}=setup();
    scope.P.s='sRecover';scope.P.st2=0;
    assert.equal(draw(),false);assert.equal(calls.length,0);
  });
}
