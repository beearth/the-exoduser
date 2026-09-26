const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const start=html.indexOf('function _kiSlashHoldMultiplier(');
  const end=html.indexOf('function _mkProj()',start);
  test(`${file}: held third hit gains one extra base hit per full second, capped at three seconds`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const m=vm.runInNewContext(html.slice(start,end)+';_kiSlashHoldMultiplier',{Math});
    assert.deepEqual([0,59,60,119,120,180,999].map(m),[1,1,2,2,3,4,4]);
  });
  test(`${file}: only charged third crescent grows in damage and collision radius`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const shots=[];
    const P={x:10,y:20,facing:0,skills:{kiSlash:1}};
    const scope={P,Math,_cresStep:2,_cresComboT:0,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent:(...args)=>shots.push(args),addTxt(){},_L:(ko)=>ko};
    vm.runInNewContext(html.slice(start,end)+';_fireKiSlashCrescent(3,60);_fireKiSlashCrescent(2,180)',scope);
    assert.equal(shots.length,2);
    assert.equal(shots[0][3],140,'one second should double the normal 70 damage');
    assert.equal(shots[0][5],3);
    assert.equal(shots[0][7],1.4,'charged third hit should look larger');
    assert.equal(shots[1][3],70,'the second hit must ignore charge');
    assert.equal(shots[1][7],1);
  });
  test(`${file}: holding waits and releasing fires the third hit once`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const P={x:10,y:20,facing:0,s:'wWindup',st2:999,_kiChargeActive:true,_kiChargeT:0,skills:{kiSlash:1}};
    const fired=[],scope={P,Math,isHeld:()=>true,_L:(ko)=>ko,_cresStep:2,_cresComboT:120,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent:(...args)=>fired.push(args),_startSilvertailAttackMotion(){},poolPart(){},addTxt(){},playSample(){},_gameFrame:1};
    const update=vm.runInNewContext(html.slice(start,end)+';_updateKiSlashThirdCharge',scope);
    update(60);
    assert.equal(fired.length,0);
    assert.equal(P.s,'wWindup');
    scope.isHeld=()=>false;
    update(0);
    assert.equal(fired.length,1);
    assert.equal(fired[0][3],140);
    assert.equal(fired[0][5],3);
    assert.equal(P.s,'wSwing');
    assert.equal(P._kiChargeActive,false);
  });
}
