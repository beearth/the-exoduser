import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const game = readFileSync(fileURLToPath(new URL('../game.html', import.meta.url)), 'utf8');
const metrics = { gameSha256: createHash('sha256').update(game).digest('hex'), fan: [], scope: [], movement: {}, elemBall: {}, charge: {}, oldSuiteRuns: 0, nativeBoots: 0, pngReads: 0, browserActions: 0 };
function section(start, end) {
  const a = game.indexOf(start);
  assert.ok(a >= 0, `missing native start: ${start}`);
  const b = game.indexOf(end, a + start.length);
  assert.ok(b > a, `missing native end: ${end}`);
  return game.slice(a, b);
}
const pool = section('function _mkProj()', '// 적 투사체: 발사자');
const spawn = section('let _eProjDropCnt=0;', 'function _hurtProjectilePlayer(');
const finale = section('function _isDruidFinale(e)', 'function _druidFinaleHp(');
const turnRate = section('function _enemyHomingTurnRate(p)', 'function _bigEnergyContactRadius(');
const fan = section("  case'bossFanWind':", '  // ── 보스 돌진:');
const ball = section("    case'elemBall':{", "    case'swordWave':{");
const face = section('  // ── 방향 추적:', '  // 어그로 추적:');
const charge = section("  case'bossChargeWind':", "  case'bossCharge':{");
const motion = section('      // 빨콩/무지개콩 유도:', '    // 탄막블랙홀에 포획된 탄').trimEnd().replace(/\}\s*$/, '');
const qResponse = section("      if(_qParryActive&&_parryClass==='magic'){ // 마법탄→Q", "      else if(P.s==='whirlwind'");

function harness(stage = 0, demo = false) {
  const c = vm.createContext({});
  vm.runInContext(`
    var window={},_DEMO_MODE=${demo},_DEMO_LAST_STAGE=3,_PROJ_POOL=32,_projFree=[],projs=[],launches=[],parries=[],ens=[];
    var G={stage:${stage}},P={x:500,y:300,r:20,s:'sBash',_stWingT:0,parryBank:0},EL={P:0,F:1,I:2,D:3,L:4,H:5},ELC=['#fff','#f00','#0ff','#a4f'],_prof={u:0};
    Math.random=()=>.5;
    function dst(x,y,a,b){return Math.hypot(a-x,b-y)}
    function _ancestorTargetForEnemy(){return null}
    function _aggroXY(){return P}
    function _emitEnemyShot(e,p){return spawnProj(p)}
    function _recycleProj(p){if(_projFree.length<_PROJ_POOL)_projFree.push(p)}
    function _parryHomingTarget(){return ens[0]||null}
    function shQuery(){return ens}
    function pParryProjDmg(dmg){return dmg}
    function _isFused(){return false}
    function poolPart(){} function addParts(){} function addTxt(){} function shake(){} function _T(s){return s}
    function doParry(...args){parries.push(args)}
    var SFX={magic(){},charge(){}};
    ${pool}
    ${spawn}
    ${finale}
    ${turnRate}
    const _nativeSpawn=_spawnBossProjectile;
    _spawnBossProjectile=(e,p)=>{launches.push({...p});return _nativeSpawn(e,p)};
    function fanTick(e){switch(e.s){${fan}}}
    function ballStart(e){switch('elemBall'){${ball}}}
    function moveTick(p,sp=1){let nx,ny;${motion}}
    function magicQ(shot,active=true){let pw=0,_pHit=false;const _qParryActive=active,_parryClass=_projectileParryClass(shot),_sbPW=false;for(const p of [shot]){${qResponse}}return _pHit}
    function chargeTick(e,sp=1){const d=dst(P.x,P.y,e.x,e.y);${face}e.st2-=sp;switch(e.s){${charge}}}
    globalThis.api={
      G,P,EL,projs,launches,parries,ens,
      fanTick,ballStart,moveTick,magicQ,chargeTick,
      spawn:_spawnBossProjectile,plainSpawn:spawnProj,reset:_resetProj,make:_mkProj,recycle:_recycleProj,
      classify:_projectileParryClass,normal:_isNormalDruidBoss,canE:_eCanReflectProjectile,
      clear(seed=0){projs.length=0;launches.length=0;parries.length=0;ens.length=0;_eProjDropCnt=seed},
      random(n){Math.random=()=>n},getDrop(){return _eProjDropCnt}
    };
  `, c);
  return c.api;
}
const boss = (phase = 0, ib = true) => ({ x: 0, y: 0, ib, _bossPhase: phase, atk: 103, el: 0, col: '#66dd22', facing: 0, s: 'bossFanWind', st2: 0, _alerted: true });
const close = (a, b, epsilon = 1e-10) => assert.ok(Math.abs(a - b) <= epsilon, `${a} != ${b}`);

test('NORMAL ownership and pooled flag reset preserve non-Druid/finale authority', () => {
  for (const [stage, demo, ib, expected] of [[0,false,true,true],[3,false,true,true],[4,false,true,false],[3,true,true,false],[0,false,false,false]]) {
    const h = harness(stage, demo), e = boss(0, ib);
    assert.equal(h.normal(e), expected);
    const p = h.spawn(e, { x:0,y:0,vx:4.4,vy:0,el:0,dmg:103,life:400,sz:1.2,parryClass:'magic',homing:false,_druidStraight:true,_commit:true });
    assert.equal(p._druidStraight, expected);
    assert.equal(p.homing, !expected);
    assert.equal(p.parryClass, 'magic');
    h.recycle(p);
    const reused = h.plainSpawn({ x:0,y:0,vx:4.4,vy:0,el:0,dmg:103,life:400,sz:1.2,_commit:true });
    assert.equal(reused, p);
    assert.equal(reused._druidStraight, false);
    assert.equal(reused._druidPoison, false);
    assert.equal(reused.parryClass, 'physical');
    assert.equal(reused.homing, true);
    assert.equal(h.make()._druidStraight, false);
    reused._druidStraight = true;h.reset(reused);assert.equal(reused._druidStraight,false);
    metrics.scope.push({stage,demo,ib,normal:expected,pooledReuse:true});
  }
  const h = harness();
  assert.equal(h.classify({elemBall:true,el:0}), 'forbidden');
  assert.equal(h.classify({blackBean:true,el:0}), 'magic');
  assert.equal(h.canE({blackBean:true,parryClass:'magic'}), false);
  assert.equal(h.canE({parryClass:'physical'}), true);
  assert.equal(h.canE({parryClass:'magic'}), false);
});

test('actual NORMAL fan keeps drop/speed/damage consumers and mixes class lanes', () => {
  const rawCounts = [10,12,13,14,16];
  for (const stage of [0,3]) for (let phase = 0; phase <= 4; phase++) for (const seed of [0,1,2]) {
    const h = harness(stage),e = boss(phase);h.clear(seed);h.fanTick(e);
    assert.equal(h.launches.length,rawCounts[phase]);
    assert.equal(h.projs.length, Math.floor((seed+rawCounts[phase])/3));
    assert.equal(e.s,'recover');assert.equal(e.st2,45);
    const kept=[];
    for (let i=0;i<rawCounts[phase];i++) {
      const input=h.launches[i],lane=i/(rawCounts[phase]-1),physical=lane<.28||lane>.72,black=phase>=2&&i%4===1;
      assert.equal(input.parryClass,physical&&!black?'physical':'magic');
      assert.equal(input.blackBean,black);assert.equal(input.homing,false);
      close(Math.hypot(input.vx,input.vy),4.4);
      assert.equal(input.dmg,Math.floor(103*(black?1.5:1.3)));
      if((seed+i+1)%3!==0)continue;
      const p=h.projs[kept.length];kept.push({laneIndex:i,parryClass:p.parryClass,black:p.blackBean,speed:Math.hypot(p.vx,p.vy),damage:p.dmg});
      assert.equal(p._druidPoison,true);assert.equal(p._druidStraight,true);assert.equal(p.homing,false);
      assert.equal(p.parryClass,input.parryClass);assert.equal(p.el,0);
      const finalSpeed=p.parryClass==='physical'?5:550/60;
      close(Math.hypot(p.vx,p.vy),finalSpeed);
      assert.equal(p.dmg,p.parryClass==='physical'?133:black?308:266);
      assert.equal(p.redBean,p.parryClass==='physical');
      assert.equal(p.rainbow,black);
    }
    assert.ok(kept.some(p=>p.parryClass==='physical'));
    assert.ok(kept.some(p=>p.parryClass==='magic'));
    if(phase>=2)assert.ok(kept.some(p=>p.black));
    metrics.fan.push({stage,phase,dropSeed:seed,raw:rawCounts[phase],retained:kept.length,kept});
  }
  for (const [stage,demo] of [[4,false],[3,true]]) {
    const h=harness(stage,demo),e=boss(2);e.el=3;h.fanTick(e);
    assert.equal(h.launches.length,11);
    assert.ok(h.launches.every(p=>p.redBean===true&&p.homing===true&&p._druidStraight===undefined));
    assert.ok(h.projs.every(p=>p.homing===true&&p._druidStraight===false));
  }
});

test('straight hostile trajectories, guided friendly response and scoped elemBall Q success', () => {
  const h=harness();
  for (const kind of ['physical','magic','black']) {
    const p=h.spawn(boss(),{x:0,y:0,vx:4.4,vy:0,el:0,dmg:133,sz:1.2,life:400,parryClass:kind==='physical'?'physical':'magic',blackBean:kind==='black',homing:false,_druidStraight:true,_commit:true});
    const vx=p.vx,vy=p.vy;
    for(let i=0;i<30;i++)h.moveTick(p);
    close(p.vx,vx);close(p.vy,vy);close(p.x,vx*30);close(p.y,0);
    metrics.movement[kind]={ticks:30,x:p.x,y:p.y,speed:Math.hypot(vx,vy),hostileHeadingUnchanged:true};
  }
  const oldBlack=h.plainSpawn({x:0,y:0,vx:4.4,vy:0,el:0,blackBean:true,dmg:100,sz:2,life:400,_commit:true});
  h.moveTick(oldBlack);assert.ok(oldBlack.vy>0);
  h.clear();const e=boss(0);e.s='idle';h.ballStart(e);
  assert.equal(h.launches.length,10);assert.equal(h.projs.length,3);
  const p=h.projs[0];assert.equal(p.elemBall,true);assert.equal(p.parryClass,'magic');assert.equal(p.homing,false);assert.equal(p._druidStraight,true);
  close(Math.hypot(p.vx,p.vy),10.8);assert.equal(p.dmg,618);close(p.r,20.8);assert.equal(p.sz,32);
  assert.equal(h.canE(p),false);
  h.ens.push({x:200,y:100,alive:true});
  assert.equal(h.magicQ(p,false),false);assert.equal(p.friendly,false);
  assert.equal(h.magicQ(p,true),true);assert.equal(p.friendly,true);assert.equal(p.blueBean,true);assert.equal(p.parryBlueBean,true);assert.equal(p.homing,true);assert.equal(p.elemBall,false);assert.equal(p._fromRainbow,false);assert.equal(h.parries.length,1);
  const angleBefore=Math.atan2(p.vy,p.vx);h.ens[0].x=p.x;h.ens[0].y=p.y+100;
  const angularDistance=a=>Math.abs(Math.atan2(Math.sin(Math.PI/2-a),Math.cos(Math.PI/2-a)));
  h.moveTick(p);assert.ok(angularDistance(Math.atan2(p.vy,p.vx))<angularDistance(angleBefore));
  metrics.elemBall={raw:10,retained:3,hostileSpeed:10.8,damage:618,radius:20.8,size:32,parryClass:'magic',QResponse:'friendly-guided-blue',elemBallAfterParry:false};
  h.clear();const rainbow=h.spawn(boss(2),{x:0,y:0,vx:4.4,vy:0,el:0,blackBean:true,parryClass:'magic',dmg:154,sz:2,life:400,homing:false,_druidStraight:true,_commit:true});
  h.ens.push({x:100,y:100,alive:true});assert.equal(h.magicQ(rainbow),true);assert.equal(rainbow._fromRainbow,true);assert.equal(rainbow.friendly,true);assert.equal(rainbow.homing,true);
  for(const [stage,demo] of [[4,false],[3,true]]){const a=harness(stage,demo);a.ballStart(boss());assert.ok(a.projs.every(p=>p.elemBall&&p.parryClass==='forbidden'&&p.homing&&!p._druidStraight));}
});

test('NORMAL charge locks actual global facing for the last 18f and committed charge', () => {
  for(const [stage,demo,locked] of [[0,false,true],[3,false,true],[3,true,true],[4,false,false]]) {
    const h=harness(stage,demo),e=boss();e.s='bossChargeWind';e.st2=20;e.facing=0;
    h.P.x=0;h.P.y=300;h.chargeTick(e);close(e.facing,Math.PI/2);assert.equal(e.st2,19);
    h.P.x=-300;h.P.y=0;
    for(let i=0;i<19;i++)h.chargeTick(e);
    assert.equal(e.s,'bossCharge');assert.equal(e.st2,50);
    close(e.facing,locked?Math.PI/2:Math.PI);
    close(e.echDx,locked?0:-1);close(e.echDy,locked?1:0);
    h.P.x=300;h.P.y=0;h.chargeTick(e);
    close(e.facing,locked?Math.PI/2:0);
    metrics.charge[`${stage}/${demo}`]={final18fLocked:locked,chargeDirection:[e.echDx,e.echDy],committedFacing:e.facing,chargeDuration:50};
  }
});

test.after(() => {
  if(process.env.FDG_NATIVE_ENCOUNTER_METRICS)writeFileSync(process.env.FDG_NATIVE_ENCOUNTER_METRICS,JSON.stringify(metrics,null,2)+'\n');
});
