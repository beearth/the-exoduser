const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

for(const file of ['game.html','game-easy-test.html']){
  const html=fs.readFileSync(path.join(__dirname,'..',file),'utf8');
  const start=html.indexOf('function _kiSlashHoldTier(');
  const end=html.indexOf('function _mkProj()',start);
  const vfxStart=html.indexOf('function _drawKiSlashCharge(');
  const vfxEnd=html.indexOf('function renderCrescents(',vfxStart);
  test(`${file}: held third hit doubles every 40 frames and reaches stage three at two seconds`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const m=vm.runInNewContext(html.slice(start,end)+';_kiSlashHoldMultiplier',{Math});
    assert.deepEqual([0,39,40,79,80,119,120,999].map(m),[1,1,2,2,4,4,8,8]);
  });
  test(`${file}: only charged third crescent grows in damage and collision radius`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const shots=[];
    const P={x:10,y:20,facing:0,skills:{kiSlash:1}};
    const scope={P,Math,_cresStep:2,_cresComboT:0,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent:(...args)=>shots.push(args),addTxt(){},_L:(ko)=>ko};
    vm.runInNewContext(html.slice(start,end)+';_fireKiSlashCrescent(3,40);_fireKiSlashCrescent(3,80);_fireKiSlashCrescent(3,120);_fireKiSlashCrescent(2,120)',scope);
    assert.equal(shots.length,4);
    assert.equal(shots[0][3],140,'first stage (40f) should double the normal 70 damage');
    assert.equal(shots[0][5],3);
    assert.equal(shots[0][7],1.4,'charged third hit should look larger');
    assert.equal(shots[1][3],280,'second stage (80f) should reach four times the base damage');
    assert.equal(shots[1][7],1.8,'projectile size follows charge tier');
    assert.equal(shots[2][3],560,'full charge (120f = 2s) should reach eight times the base damage');
    assert.equal(shots[2][7],2.2,'projectile size remains capped at the third charge tier');
    assert.equal(shots[3][3],70,'the second hit must ignore charge');
    assert.equal(shots[3][7],1);
  });
  test(`${file}: holding waits and releasing fires the third hit once`,()=>{
    assert.ok(start>=0&&end>start,'ki slash charge helpers must exist');
    const P={x:10,y:20,facing:0,s:'wWindup',st2:999,_kiChargeActive:true,_kiChargeT:0,skills:{kiSlash:1}};
    const fired=[],scope={P,Math,isHeld:()=>true,_L:(ko)=>ko,_cresStep:2,_cresComboT:120,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent:(...args)=>fired.push(args),_startSilvertailAttackMotion(){},poolPart(){},addTxt(){},playSample(){},_gameFrame:1};
    const update=vm.runInNewContext(html.slice(start,end)+';_updateKiSlashThirdCharge',scope);
    update(40);
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
  test(`${file}: charged third hit turns with live aim before release`,()=>{
    const P={x:10,y:20,facing:0,atkArc:0,s:'wWindup',st2:999,_kiChargeActive:true,_kiChargeT:60,skills:{kiSlash:1}};
    const shots=[],scope={P,Math,isHeld:()=>true,_L:(ko)=>ko,_cresStep:2,_cresComboT:120,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent:(...args)=>shots.push(args),_startSilvertailAttackMotion(){},addTxt(){},playSample(){}};
    const update=vm.runInNewContext(html.slice(start,end)+';_updateKiSlashThirdCharge',scope);
    P.facing=Math.PI/2;
    update(1);
    assert.equal(P.atkArc,Math.PI/2,'charge pose should follow the new aim');
    scope.isHeld=()=>false;
    update(0);
    assert.equal(shots[0][2],Math.PI/2,'released blade should use the same direction');
  });
  test(`${file}: third charge completion clangs and flashes exactly once`,()=>{
    const P={x:10,y:20,facing:Math.PI/4,atkArc:0,s:'wWindup',st2:999,_kiChargeActive:true,_kiChargeT:119,skills:{kiSlash:1}};
    const sounds=[],flashes=[];
    const scope={P,Math,isHeld:()=>true,_L:(ko)=>ko,_cresStep:2,_cresComboT:120,_cresCd:0,
      _addSkProf(){},_playKiSlashComboSfx(){},meleeRef:()=>10,statStr:()=>1,pAtkMul:()=>1,_skMul:()=>1,
      spawnCrescent(){},_startSilvertailAttackMotion(){},addTxt(){},
      playSample:(...args)=>sounds.push(args),playVFXAng:(...args)=>flashes.push(args),
      _VFX_SHEETS:{ki_slash_hit_2:{fw:627}}};
    const update=vm.runInNewContext(html.slice(start,end)+';_updateKiSlashThirdCharge',scope);
    update(1);update(1);update(40);
    assert.equal(sounds.length,1,'completed third tier should sound once while held');
    assert.equal(sounds[0][0],'sword_parry','full charge should have a metallic clang');
    assert.equal(flashes.length,1,'completed third tier should flash once while held');
    assert.equal(flashes[0][0],'ki_slash_hit_2');
    assert.equal(flashes[0][1],P.x);
    assert.equal(flashes[0][2],P.y);
    scope.isHeld=()=>false;update(0);
    assert.equal(sounds.length,1,'release should not repeat the completion clang');
    assert.equal(flashes.length,1,'release should not repeat the completion flash');
  });
  test(`${file}: charged blade does not draw stray arrow lines outside the sprite`,()=>{
    assert.ok(vfxStart>=0&&vfxEnd>vfxStart);
    let strokes=0;
    let origin,outer;
    const ctx={save(){},restore(){},translate(x,y){origin=[x,y]},rotate(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},stroke(){strokes++}};
    const scope={P:{x:0,y:0,facing:0,atkArc:0,_kiChargeActive:true,_kiChargeT:120},Math,_now:0,_gameFrame:0,
      C:{},_useGPU:false,_useGL:false,_KI_HOLD_STEP:40,_kiSlashRadiant:{surfaces:[null,null,{}],fw:100,fh:100},
      _kiSlashHoldTier:()=>2,_drawKiSlashFrame:(...args)=>{if(!outer)outer=args.slice(-4)}};
    vm.runInNewContext(html.slice(vfxStart,vfxEnd)+';_drawKiSlashCharge',scope)(ctx);
    assert.equal(strokes,3,'only the three short charge-stage marks should be stroked');
    assert.ok(Math.hypot(origin[0]-scope.P.x,origin[1]-scope.P.y)<=12,'charged blade should wrap the player');
    assert.ok(outer[2]<=115&&outer[3]<=115,'fully charged blade preview should stay close to body size');
  });
  test(`${file}: charge blade visibly grows at each completed stage`,()=>{
    assert.ok(vfxStart>=0&&vfxEnd>vfxStart);
    const sizes=[];
    for(const frames of [0,39,40,79,80,119,120]){
      const P={x:0,y:0,facing:0,atkArc:0,_kiChargeActive:true,_kiChargeT:frames};
      const ctx={save(){},restore(){},translate(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
      const scope={P,Math,_now:0,_gameFrame:0,C:{},_useGPU:false,_useGL:false,_KI_HOLD_STEP:40,
        _kiSlashRadiant:{surfaces:[null,null,{}],fw:100,fh:100},
        _kiSlashHoldTier:f=>Math.min(3,Math.floor(f/40)),
        _drawKiSlashFrame:(...args)=>{if(!scope.width)scope.width=args[args.length-2]}};
      vm.runInNewContext(html.slice(vfxStart,vfxEnd)+';_drawKiSlashCharge',scope)(ctx);
      sizes.push(scope.width);
    }
    assert.ok(sizes[2]-sizes[1]>=7,'first stage should visibly enlarge the blade');
    assert.ok(sizes[4]-sizes[3]>=7,'second stage should visibly enlarge the blade');
    assert.ok(sizes[6]-sizes[5]>=7,'third stage should visibly enlarge the blade');
    assert.ok(sizes[6]>=sizes[0]*1.4,'maximum charge blade should be distinctly larger than its start');
  });
  test(`${file}: charged third hit scales its impact flash with the attack radius`,()=>{
    const hitStart=html.indexOf('function _playKiSlashHit(');
    const hitEnd=html.indexOf('\n}',hitStart);
    assert.ok(hitStart>=0&&hitEnd>hitStart);
    const scales=[];
    const scope={_kiSlashPalette:()=>2,_VFX_SHEETS:{ki_slash_hit_2:{fw:627}},
      playVFXAng:(id,x,y,scale)=>scales.push(scale)};
    const play=vm.runInNewContext(html.slice(hitStart,hitEnd+2)+';_playKiSlashHit',scope);
    for(const chargeScale of [1,1.4,1.8,2.2])play({step:3,ang:0,chargeScale},0,0);
    assert.deepEqual(scales.map(x=>Math.round(x*627)),[184,258,331,405]);
  });
}
