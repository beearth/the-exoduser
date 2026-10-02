// Read-only production extraction; the candidate exists only in memory and result.md.
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const ROOT='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const require=createRequire(import.meta.url);
const {parse}=require(`${ROOT}/node_modules/acorn`);
const sha=s=>createHash('sha256').update(s).digest('hex');
const startedAt=new Date().toISOString();
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).toString().trim();
const replacements=[
  ["if(e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean)","if(e.alive&&e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean)"],
  ['w.owner===e&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el','w.owner===e&&w.dead===!e.alive&&w.frame===_gameFrame&&w.world===ens&&w.el===props.el'],
  ["if(e._hitStun>0)return; // 피격 경직: AI 스킵","if(e._hitStun>0){if(e.stunned>0||e._frozen>0)_cancelProjCharge(e,true);return;} // 피격 경직: AI 스킵"],
  ['    _cancelProjCharge(e);\n    // 스턴 캡','    _cancelProjCharge(e,true);\n    // 스턴 캡'],
  ['  if(e._frozen>0){\n    _cancelProjCharge(e);','  if(e._frozen>0){\n    _cancelProjCharge(e,true);']
];
function candidate(html){
  let out=html;
  for(const [before,after] of replacements){assert.equal(out.split(before).length-1,1,`unique replacement: ${before}`);out=out.replace(before,after);}
  const before=extract(out).functions._cancelProjCharge.text;
  const after=before.slice(0,-1).replace('function _cancelProjCharge(e){','function _cancelProjCharge(e,interrupt){')+";if(interrupt&&e.s==='eShootWind'){e._swFire=null;e._swChargeEl=null;e.s='idle';e.st2=0}}";
  assert.equal(out.split(before).length-1,1);return out.replace(before,after);
}
function extract(html){
  const functions={};let updateNode,updateScript,updateOffset;
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
    if(!m[1].includes('function _emitEnemyShot(')&&!m[1].includes('function updateE('))continue;
    const offset=m.index+m[0].indexOf('>')+1;
    const program=parse(m[1],{ecmaVersion:'latest',sourceType:'script'});
    for(const n of program.body){if(n.type!=='FunctionDeclaration')continue;
      functions[n.id.name]={text:m[1].slice(n.start,n.end),line:html.slice(0,offset+n.start).split('\n').length};
      if(n.id.name==='updateE'){updateNode=n;updateScript=m[1];updateOffset=offset;}
    }
  }
  assert.ok(updateNode&&functions._emitEnemyShot,'actual functions found');
  const cases={};
  function visit(n){if(!n||typeof n!=='object')return;
    if(n.type==='SwitchStatement'&&updateScript.slice(n.discriminant.start,n.discriminant.end)==='e.s'){
      for(const c of n.cases)if(c.test?.type==='Literal')cases[c.test.value]={text:updateScript.slice(c.start,c.end),line:html.slice(0,updateOffset+c.start).split('\n').length};
    }
    for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
  }visit(updateNode);
  assert.ok(cases.eShootWind&&cases.eChargeWind);
  const decrement=functions.updateE.text.match(/\be\.st2-=sp;/)?.[0];assert.ok(decrement);
  return {functions,cases,decrement};
}
function setup(source){
  const fired=[],rings=[];
  const math=Object.create(Math);math.random=()=>1;
  const ctx=vm.createContext({Math:math,window:{},G:{rifts:[],cam:{x:0,y:0}},P:{x:100,y:0,r:10},ens:[],_gameFrame:1,
    EL:{P:0,F:1,I:2,D:3,L:4},ELC:['white','red','blue','purple','yellow'],ETYPE_RANGE:{1:600},VW:1280,VH:800,
    spawnProj:p=>{fired.push({...p});return p;},addParts(){},_drawShootCharge:(...args)=>rings.push(args),_drawProjectileChargeLabel(){},_L:a=>a,
    _canMvTile:()=>true,_pushOutWall(){throw Error('unexpected wall path');},_spikeTrapSlowPct:()=>0,
    isW:()=>false,poolPart(){},_BEAN_RAINBOW:['rainbow']});
  const names=['_prepareDarkSphere','_projectileParryClass','_fieldEnemyCanShoot','_emitEnemyShot','_tickEnemyShotWarnings',
    '_cancelProjCharge','_fireChargedProj','_tickProjCharge','_spawnBossProjectile','_drawEnemyShotWarnings','updateE'];
  for(const name of names){assert.ok(source.functions[name],name);vm.runInContext(source.functions[name].text,ctx);}
  vm.runInContext(`function sourceShootCase(e,sp){${source.decrement}switch(e.s){${source.cases.eShootWind.text}}}
    function sourceChargeWindCase(e,sp=1){switch(e.s){${source.cases.eChargeWind.text}}}`,ctx);
  return {ctx,fired,rings};
}
function enemy(extra={}){return {alive:true,ib:false,x:0,y:0,r:12,kb:{x:0,y:0},s:'idle',st2:30,el:0,etype:1,atk:10,
  _hitStun:0,stunned:0,_frozen:0,_aAtkM:1,...extra};}
const shot={x:0,y:0,vx:3,vy:0,el:0,col:'white',life:180,dmg:8};
const results=[],sources={},patches=[];
function check(file,mode,name,fn){try{fn();results.push({file,mode,name,status:'PASS'});}catch(e){results.push({file,mode,name,status:'FAIL',error:e.message});}}
function witness(file,name,observe,expected){const actual=observe();const matched=JSON.stringify(actual)===JSON.stringify(expected);results.push({file,mode:'original-counterexample',name,status:matched?'REPRODUCED':'FAIL',actual,expected});}
for(const file of ['game.html','game-easy-test.html']){
  const original=readFileSync(`${ROOT}/${file}`,'utf8'),patched=candidate(original),orig=extract(original),cand=extract(patched);
  sources[file]={sha256:sha(original),functions:Object.fromEntries(['_emitEnemyShot','_tickEnemyShotWarnings','_cancelProjCharge','updateE','_spawnBossProjectile','_fireChargedProj'].map(k=>[k,{line:orig.functions[k].line,sha256:sha(orig.functions[k].text)}])),cases:orig.cases.eShootWind.line};
  const changed=original.split('\n'),next=patched.split('\n');assert.equal(changed.length,next.length);
  let patch=`--- a/${file}\n+++ b/${file}\n`;
  for(let i=0;i<changed.length;i++)if(changed[i]!==next[i])patch+=`@@ -${i+1},1 +${i+1},1 @@\n-${changed[i]}\n+${next[i]}\n`;
  patches.push(patch);
  for(const [mode,source] of [['original',orig],['candidate',cand]]){
    check(file,mode,'같은 속성 활체 연사:59f 대기+1f 후 2발・commit',()=>{
      const {ctx,fired}=setup(source),e=enemy();ctx._emitEnemyShot(e,{...shot});ctx._emitEnemyShot(e,{...shot,vx:-3});
      assert.equal(ctx.G._shotWarnings.length,1);ctx._tickEnemyShotWarnings(59);assert.equal(fired.length,0);
      ctx._tickEnemyShotWarnings(1);assert.equal(fired.length,2);assert.ok(fired.every(p=>p._commit));assert.equal(e._shotWarning,null);
    });
    for(const reason of ['stun','freeze','death','world'])check(file,mode,`예약 취소:${reason}`,()=>{
      const {ctx,fired}=setup(source),e=enemy();ctx._emitEnemyShot(e,{...shot});
      if(reason==='stun')e.stunned=10;if(reason==='freeze')e._frozen=10;if(reason==='death')e.alive=false;if(reason==='world')ctx.ens=[];
      ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,0);assert.equal(ctx.G._shotWarnings.length,0);assert.equal(e._shotWarning,null);
    });
    check(file,mode,'의도된 사망탄:스턴/빙결에도 사망 위치 60f 예고',()=>{
      const {ctx,fired}=setup(source),e=enemy({alive:false,x:40,y:50,stunned:10,_frozen:10});
      ctx._spawnBossProjectile(e,{...shot,x:40,y:50});e.x=99;ctx._tickEnemyShotWarnings(59);assert.equal(fired.length,0);
      ctx._tickEnemyShotWarnings(1);assert.equal(fired.length,1);assert.equal(fired[0].x,40);assert.equal(fired[0].y,50);
    });
    check(file,mode,'활체 이동만큼 발사점 보정',()=>{
      const {ctx,fired}=setup(source),e=enemy();ctx._emitEnemyShot(e,{...shot});e.x=10;e.y=20;
      ctx._tickEnemyShotWarnings(60);assert.equal(fired[0].x,10);assert.equal(fired[0].y,20);
    });
    check(file,mode,'완료된 살아있는 eShootWind 즉시 발사・추가지연0',()=>{
      const {ctx,fired}=setup(source),e=enemy({s:'eShootWind',st2:0,_swChargeEl:0});ctx._emitEnemyShot(e,{...shot});
      assert.equal(fired.length,1);assert.equal(fired[0]._commit,true);assert.equal(ctx.G._shotWarnings,undefined);
    });
    check(file,mode,'무지개탄 즉시발사 우회 금지・60f 큐 유지',()=>{
      const {ctx,fired}=setup(source),e=enemy({s:'eShootWind',st2:0,_swChargeEl:0});ctx._emitEnemyShot(e,{...shot,blackBean:true});
      assert.equal(fired.length,0);ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,1);assert.equal(fired[0].blackBean,true);
    });
    for(const reason of ['stun','freeze'])check(file,mode,`일반 차징 취소:${reason}`,()=>{
      const {ctx,fired}=setup(source),e=enemy({_projChargeT:1,_projChargeBean:'normal',_projChargeCol:'white'});
      if(reason==='stun')e.stunned=10;else e._frozen=10;
      ctx.updateE(e,1);assert.equal(e._projChargeT,0);assert.equal(e._projChargeBean,null);assert.equal(fired.length,0);
    });
    check(file,mode,'피격경직 단독:AI 중지・일반차징 예약 보존',()=>{
      const {ctx}=setup(source),e=enemy({_hitStun:5,_projChargeT:30,_telegraphT:20});ctx.updateE(e,1);
      assert.equal(e._projChargeT,30);assert.equal(e._telegraphT,19);
    });
    check(file,mode,'일반차징 정상완료가 동시 특수예고를 취소하지 않음',()=>{
      const {ctx,fired}=setup(source),e=enemy({s:'eShootWind',st2:1,_swChargeEl:0,_projChargeT:1,_projChargeBean:'normal'});
      e._swFire=()=>ctx._emitEnemyShot(e,{...shot});ctx._tickProjCharge(e,1);
      assert.equal(e.s,'eShootWind');assert.equal(typeof e._swFire,'function');assert.equal(fired.length,1);
      ctx.sourceShootCase(e,1);assert.equal(fired.length,2);
    });
    check(file,mode,'돌진 커밋 상태/시간 보존・예고 종료 전환',()=>{
      const {ctx}=setup(source),e=enemy({s:'eChargeWind',st2:0,_chgAimMax:90,_chgDur:19,_chgLen:798,echDx:1,echDy:0});
      ctx._cancelProjCharge(e);assert.equal(e.s,'eChargeWind');assert.equal(e.st2,0);
      ctx.sourceChargeWindCase(e);assert.equal(e.s,'eCharge');assert.equal(e.st2,19);
    });
    check(file,mode,'사망 본체의 잔류 차징 렌더 제외',()=>{
      const {ctx,rings}=setup(source);ctx.ens=[enemy({alive:false,_projChargeT:30,_projChargeCol:'white'})];ctx._drawEnemyShotWarnings();assert.equal(rings.length,0);
    });
  }
  for(const reason of ['stun','freeze']){
    witness(file,`특수 예고 ${reason} 뒤 기존 콜백 재발사`,()=>{
      const {ctx,fired}=setup(orig),e=enemy({s:'eShootWind',st2:1,_swChargeEl:0});e._swFire=()=>ctx._emitEnemyShot(e,{...shot});
      if(reason==='stun')e.stunned=10;else e._frozen=2;
      ctx.updateE(e,1);const retained=e.s==='eShootWind'&&typeof e._swFire==='function';e.stunned=0;e._frozen=0;
      ctx.sourceShootCase(e,1);return {retained,fired:fired.length};
    },{retained:true,fired:1});
    check(file,'candidate',`특수 예고 ${reason} 취소・이전 콜백 재실행0`,()=>{
      const {ctx,fired}=setup(cand),e=enemy({s:'eShootWind',st2:1,_swChargeEl:0});e._swFire=()=>ctx._emitEnemyShot(e,{...shot});
      if(reason==='stun')e.stunned=10;else e._frozen=2;
      ctx.updateE(e,1);assert.equal(e._swFire,null);assert.equal(e._swChargeEl,null);assert.equal(e.s,'idle');
      e.stunned=0;e._frozen=0;ctx.sourceShootCase(e,1);assert.equal(fired.length,0);
    });
  }
  witness(file,'피격경직+빙결:일반차징 취소 누락',()=>{
    const {ctx}=setup(orig),e=enemy({_hitStun:5,_frozen:10,_projChargeT:30});ctx.updateE(e,1);return e._projChargeT;
  },30);
  for(const reason of ['stun','freeze'])check(file,'candidate',`피격경직+${reason}:일반/특수 차징 정리`,()=>{
    const {ctx}=setup(cand),e=enemy({_hitStun:5,s:'eShootWind',_swFire:()=>{},_swChargeEl:0,_projChargeT:30});
    if(reason==='stun')e.stunned=10;else e._frozen=10;
    ctx.updateE(e,1);assert.equal(e._projChargeT,0);assert.equal(e._swFire,null);assert.equal(e.s,'idle');
  });
  witness(file,'살아있던 예약+동일tick 사망탄:같은 큐로 묶여 둘 다 취소',()=>{
    const {ctx,fired}=setup(orig),e=enemy();ctx._emitEnemyShot(e,{...shot});e.alive=false;
    ctx._spawnBossProjectile(e,{...shot,dmg:18});const rings=ctx.G._shotWarnings.length;ctx._tickEnemyShotWarnings(60);return {rings,fired:fired.length};
  },{rings:1,fired:0});
  check(file,'candidate','살아있던 예약 취소・동일tick 의도된 사망탄만 방출',()=>{
    const {ctx,fired}=setup(cand),e=enemy();ctx._emitEnemyShot(e,{...shot});e.alive=false;ctx._spawnBossProjectile(e,{...shot,dmg:18});
    assert.equal(ctx.G._shotWarnings.length,2);ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,1);assert.equal(fired[0].dmg,18);assert.equal(e._shotWarning,null);
  });
  witness(file,'사망시 완료 eShootWind 잔류:60f 예고 우회',()=>{
    const {ctx,fired}=setup(orig),e=enemy({alive:false,s:'eShootWind',st2:0,_swChargeEl:0});ctx._spawnBossProjectile(e,{...shot});return fired.length;
  },1);
  check(file,'candidate','사망시 완료 eShootWind 잔류:사망탄60f 예고 복구',()=>{
    const {ctx,fired}=setup(cand),e=enemy({alive:false,s:'eShootWind',st2:0,_swChargeEl:0});ctx._spawnBossProjectile(e,{...shot});
    assert.equal(fired.length,0);ctx._tickEnemyShotWarnings(59);assert.equal(fired.length,0);ctx._tickEnemyShotWarnings(1);assert.equal(fired.length,1);
  });
  check(file,'candidate','역방향 생명상태 변경도 사망/활체 큐 분리',()=>{
    const {ctx,fired}=setup(cand),e=enemy({alive:false});ctx._emitEnemyShot(e,{...shot,dmg:18});e.alive=true;
    ctx._emitEnemyShot(e,{...shot});e.stunned=10;ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,1);assert.equal(fired[0].dmg,18);
  });
  check(file,'candidate','보호 함수·돌진 본문·발사 수치 원문 불변',()=>{
    for(const k of ['_tickEnemyShotWarnings','_fireChargedProj','_tickProjCharge','_spawnBossProjectile','atkTicketRequest','atkTicketRelease','_poiseHit'])assert.equal(cand.functions[k].text,orig.functions[k].text,k);
    assert.equal(cand.cases.eChargeWind.text,orig.cases.eChargeWind.text);
    const guard=original.match(/if\(\(e\._stunImmune\|\|0\)>0\|\|e\.s==='eChargeWind'\|\|e\.s==='eCharge'\)continue;/)?.[0];
    const ctx=vm.createContext({accepted:[]});
    if(file==='game.html'){
      assert.ok(guard);assert.ok(patched.includes(guard));
      vm.runInContext(`function harpoonGuard(targets){for(const e of targets){${guard}accepted.push(e.s)}}`,ctx);
      ctx.harpoonGuard([enemy({s:'eChargeWind'}),enemy({s:'eCharge'}),enemy()]);assert.deepEqual([...ctx.accepted],['idle']);
    }
    const chain="if(e.s!=='eChargeWind'&&e.s!=='eCharge')e.stunned=~~(40*mult);";
    assert.ok(original.includes(chain)&&patched.includes(chain));vm.runInContext(`function chainGuard(e,mult){${chain}}`,ctx);
    for(const state of ['eChargeWind','eCharge','idle']){const e=enemy({s:state});ctx.chainGuard(e,1);assert.equal(e.stunned,state==='idle'?40:0);}
  });
}
const failed=results.filter(r=>r.status==='FAIL');
const out={task:'telegraph-cancel-boundary',startedAt,completedAt:new Date().toISOString(),head,sources,
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length},results,
  candidateApplied:false,candidatePatch:patches.join('\n'),limits:['Node VM source extraction; actual updateE interrupt early paths + extracted eShootWind/eChargeWind cases only','No full-game timing, render pixels, UI, server, or gameplay execution','Source globals (spawnProj, geometry, render, particles) explicitly stubbed; no FPS claim']};
console.log(JSON.stringify(out,null,2));if(failed.length)process.exitCode=1;
