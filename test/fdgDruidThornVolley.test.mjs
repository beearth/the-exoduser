import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const html=readFileSync(new URL('../game.html',import.meta.url),'utf8');
function section(start,end){const a=html.indexOf(start),b=html.indexOf(end,a+start.length);assert.ok(a>=0&&b>a);return html.slice(a,b);}
const pool=section('function _mkProj()','// 적 투사체: 발사자');
const spawn=section('let _eProjDropCnt=0;','function _hurtProjectilePlayer(');
const finale=section('function _isDruidFinale(e)','function _druidFinaleHp(');
const fan=section("  case'bossFanWind':",'  // ── 보스 돌진:');
const motion=section('      // 빨콩/무지개콩 유도:','    // 탄막블랙홀에 포획된 탄').trimEnd().replace(/\}\s*$/,'');
const turn=section('function _enemyHomingTurnRate(p)','function _bigEnergyContactRadius(');
const q=section("      if(_qParryActive&&_parryClass==='magic'){ // 마법탄→Q","      else if(P.s==='whirlwind'");
const e=section("    if(p.redBean&&_parryClass==='physical'&&!_pHit",'    if(_physicalMouth');
const render=section('function _drawDruidThornShot(p,alpha)','function _fdDrawFly(');
const boss=phase=>({x:0,y:0,ib:true,_bossPhase:phase,atk:103,el:0,col:'#66dd22',facing:0,s:'bossFanWind',st2:0});
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function harness({stage=0,active=true,flag=true,demo=false}={}){
  const c=vm.createContext({URL});
  vm.runInContext(`
    var window={_FDGDruidQaStorage:{active:${active}}},location={href:'http://127.0.0.1:3333/game.html?fdgDruidThorn=${flag?'first':'off'}'},_DEMO_MODE=${demo},_DEMO_LAST_STAGE=3;
    var _PROJ_POOL=32,_projFree=[],projs=[],parries=[],ens=[],G={stage:${stage}},P={x:500,y:300,r:20,s:'idle',_stWingT:0,parryBank:0},EL={P:0,F:1,I:2,D:3,L:4,H:5},_prof={u:0};
    Math.random=()=>.5;
    function dst(x,y,a,b){return Math.hypot(x-a,y-b)}function _ancestorTargetForEnemy(){return null}function _aggroXY(){return {x:-600,y:0}}
    function _emitEnemyShot(e,p){return spawnProj(p)}function _recycleProj(p){_projFree.push(p)}
    function shQuery(){return ens}function _parryHomingTarget(){return ens[0]||null}function pParryProjDmg(d){return d}function _isFused(){return false}
    function poolPart(){}function addParts(){}function addTxt(){}function shake(){}function _T(s){return s}function _addBoom(){}function doParry(...a){parries.push(a)}
    var SFX={magic(){}};
    ${pool}${finale}${spawn}${turn}
    function fanTick(e){switch(e.s){${fan}}}
    function moveTick(p,sp=1){let nx,ny;${motion}}
    function qResponse(shot,active=true){let pw=0,_pHit=false;const _qParryActive=active,_parryClass=_projectileParryClass(shot),_sbPW=false;for(const p of [shot]){${q}}return _pHit}
    function eResponse(shot,active=true){let pw=0,_pHit=false;const _parryClass=_projectileParryClass(shot),_pDist=0,_rbDeflR=100,_sbActive=active,_physicalResourceMul=3;for(const p of [shot]){${e}}return shot.friendly}
    globalThis.h={G,P,projs,parries,ens,fanTick,moveTick,qResponse,eResponse,spawn:_spawnBossProjectile,plain:spawnProj,reset:_resetProj,make:_mkProj,canE:_eCanReflectProjectile,drop:()=>_eProjDropCnt,seed:n=>{_eProjDropCnt=n}};
  `,c);return c.h;
}

test('actual phase0/1 launch retains all 12 slots and native formulas for every drop seed',()=>{
  for(const stage of [0,3])for(const phase of [0,1])for(const seed of [0,1,2]){
    const h=harness({stage}),b=boss(phase);h.seed(seed);h.G._voidScarecrow={aggroOn:true,x:-600,y:0};h.fanTick(b);
    assert.equal(h.projs.length,12);assert.equal(h.drop(),seed);assert.equal(b.s,'recover');assert.equal(b.st2,45);
    assert.equal(h.projs.filter(p=>p.parryClass==='physical').length,8);assert.equal(h.projs.filter(p=>p.parryClass==='magic').length,4);
    h.projs.forEach((p,i)=>{
      const physical=i%3!==2,a=Math.atan2(300,500)-Math.PI*(.7+phase*.06)/2+Math.PI*(.7+phase*.06)*i/11;
      assert.equal(p._druidThornLane,i);assert.equal(p._druidThornVolley,true);assert.equal(p.blackBean,false);assert.equal(p.homing,false);
      close(Math.atan2(p.vy,p.vx),a);close(Math.hypot(p.vx,p.vy),physical?5:550/60);
      assert.equal(p.dmg,physical?133:266);assert.equal(p.life,400);assert.equal(p.ml,400);close(p.r,5.2);close(p.sz,2.4);assert.equal(p.el,0);assert.equal(p._druidPoison,true);
    });
  }
});

test('actual hostile motion keeps headings while the target moves for 36 ticks',()=>{
  const h=harness();h.fanTick(boss(0));const shots=[...h.projs];
  for(const p of shots){const {x,y,vx,vy}=p;for(let tick=0;tick<36;tick++){h.P.x=-400+tick*23;h.P.y=600-tick*17;h.moveTick(p);}close(p.vx,vx);close(p.vy,vy);close(p.x,x+vx*36);close(p.y,y+vy*36);}
});

test('first wind body and fan tell follow the same native aim before committing the launch',()=>{
  const h=harness(),b=boss(0);b.st2=10;b.facing=4.7;h.fanTick(b);close(b.facing,Math.atan2(300,500));assert.equal(h.projs.length,0);
  h.P.x=-500;h.P.y=100;h.fanTick(b);close(b.facing,Math.atan2(100,-500));b.st2=0;h.fanTick(b);close(b.facing,Math.atan2(100,-500));assert.equal(h.projs.length,12);
  const inactive=harness({flag:false}),old=boss(0);old.st2=10;old.facing=4.7;inactive.fanTick(old);assert.equal(old.facing,4.7);
});

test('existing E physical and Q magic responses produce guided blue with wrong classes rejected',()=>{
  const h=harness();h.fanTick(boss(0));h.ens.push({x:250,y:200,alive:true});
  const physical=h.projs[0],magic=h.projs[2];assert.equal(h.canE(magic),false);assert.equal(h.qResponse(physical),false);assert.equal(physical.friendly,false);
  assert.equal(h.eResponse(magic),false);assert.equal(magic.friendly,false);
  assert.equal(h.eResponse(physical),true);assert.equal(h.qResponse(magic),true);
  for(const p of [physical,magic]){assert.equal(p.blueBean,true);assert.equal(p.parryBlueBean,true);assert.equal(p.homing,true);const a=Math.atan2(p.vy,p.vx);h.ens[0].x=p.x;h.ens[0].y=p.y+300;h.moveTick(p);assert.notEqual(Math.atan2(p.vy,p.vx),a);}
  assert.equal(h.parries.length,2);assert.equal(h.canE({blackBean:true,parryClass:'magic'}),false);
});

test('default page, other bosses, finale, higher phases and reused pools retain their scope',()=>{
  for(const cfg of [{active:false},{flag:false},{stage:4},{stage:3,demo:true}]){const h=harness(cfg);h.fanTick(boss(0));assert.equal(h.projs.length,cfg.stage?2:3);assert.ok(h.projs.every(p=>!p._druidThornVolley));}
  const h=harness();for(const phase of [2,3,4]){h.projs.length=0;h.seed(0);h.fanTick(boss(phase));assert.equal(h.projs.length,Math.floor([0,0,13,14,16][phase]/3));assert.ok(h.projs.every(p=>!p._druidThornVolley));assert.ok(h.projs.some(p=>p.blackBean));}
  const p=h.make();p._druidThornVolley=true;p._druidThornLane=5;h.reset(p);assert.equal(p._druidThornVolley,false);assert.equal(p._druidThornLane,-1);
  const other=harness({stage:4});const shot=other.spawn(boss(0),{vx:1,vy:0,_druidThornVolley:true,_commit:true,life:400});assert.equal(shot._druidThornVolley,false);
});

test('owned physical silhouette is pointed and oriented, magic uses distinct compact geometry, source imagery stays unchanged',()=>{
  const calls=[],stack=[],X={globalAlpha:1,save(){stack.push(this.globalAlpha)},restore(){this.globalAlpha=stack.pop()},translate(...a){calls.push(['translate',...a])},rotate(a){calls.push(['rotate',a])},beginPath(){},moveTo(...a){calls.push(['point',...a])},lineTo(...a){calls.push(['point',...a])},closePath(){},fill(){calls.push(['fill',this.fillStyle])},stroke(){calls.push(['stroke',this.strokeStyle])}};
  const c=vm.createContext({X,_fdFlyImg:{complete:false}});vm.runInContext(render,c);
  const p={x:20,y:30,vx:0,vy:5,parryClass:'physical',_druidThornVolley:true,friendly:false},before=JSON.stringify(p);
  assert.equal(c._drawDruidPoisonShot(p,1),true);assert.equal(JSON.stringify(p),before);close(calls.find(a=>a[0]==='rotate')[1],Math.PI/2);assert.ok(calls.some(a=>a[0]==='point'&&a[1]===32&&a[2]===0));assert.equal(calls.filter(a=>a[0]==='fill').length,5);
  calls.length=0;assert.equal(c._drawDruidPoisonShot({...p,parryClass:'magic'},1),true);assert.ok(calls.some(a=>a[0]==='point'&&a[2]===12));assert.equal(calls.filter(a=>a[0]==='fill').length,2);assert.equal(X.globalAlpha,1);
  assert.equal(c._drawDruidPoisonShot({...p,friendly:true},1),false);
});

test('classic inline source compiles after the new actual consumers',()=>{
  let count=0;for(const m of html.matchAll(/<script\b([^>]*)>([^]*?)<\/script>/gi)){if(/type\s*=\s*["'](?:module|importmap)["']|src\s*=/.test(m[1]))continue;new vm.Script(m[2]);count++;}assert.ok(count>0);
});
