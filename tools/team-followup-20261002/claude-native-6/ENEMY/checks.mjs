// ENEMY native follow-up — TCB-03/04 실제 도달경로 최소 fixture (읽기 전용 소스 추출)
// 목적: 생전예약→동일frame 사망탄 경로를 "실제 hurtE 사망블록 + 실제 발사 helper" 원문으로 재현하고,
//       TCB-04(사망탄 즉시발사)가 합성전용(도달불가)임을 실제 호출순서로 논증한다.
// 제약: 기존76검사 반복0. 생산 미적용. 후보는 메모리에서만 대조. 전체 게임 사본 생성0.
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
let head='UNKNOWN';try{head=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,env:{...process.env,GIT_OPTIONAL_LOCKS:'0'}}).toString().trim();}catch{}

// ── 소스 추출: 실제 발사 helper + eShootWind 완료 case + 실제 hurtE 사망탄 블록 ──
const HELPERS=['_fieldEnemyCanShoot','_prepareDarkSphere','_projectileParryClass','_emitEnemyShot','_tickEnemyShotWarnings','_cancelProjCharge','_spawnBossProjectile'];
function extract(html){
  const functions={},lineOf=off=>html.slice(0,off).split('\n').length;
  let hurtENode,hurtEScript,hurtEOffset,updateNode,updateScript,updateOffset;
  for(const m of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)){
    const body=m[1];if(!/function (hurtE|_emitEnemyShot|updateE)\(/.test(body))continue;
    const offset=m.index+m[0].indexOf('>')+1;
    const program=parse(body,{ecmaVersion:'latest',sourceType:'script'});
    for(const n of program.body){if(n.type!=='FunctionDeclaration')continue;
      functions[n.id.name]={text:body.slice(n.start,n.end),line:lineOf(offset+n.start)};
      if(n.id.name==='hurtE'){hurtENode=n;hurtEScript=body;hurtEOffset=offset;}
      if(n.id.name==='updateE'){updateNode=n;updateScript=body;updateOffset=offset;}
    }
  }
  assert.ok(hurtENode&&updateNode&&functions._emitEnemyShot,'실제 hurtE/updateE/_emitEnemyShot 추출');
  // eShootWind 완료 case (switch(e.s))
  let eShootWindCase;
  (function visit(n){if(!n||typeof n!=='object')return;
    if(n.type==='SwitchStatement'&&updateScript.slice(n.discriminant.start,n.discriminant.end)==='e.s')
      for(const c of n.cases)if(c.test?.type==='Literal'&&c.test.value==='eShootWind')
        eShootWindCase={text:updateScript.slice(c.start,c.end),line:lineOf(updateOffset+c.start)};
    for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
  })(updateNode);
  assert.ok(eShootWindCase,'eShootWind 완료 case 추출');
  // hurtE 내부 사망탄 if 블록 (etype29/55/59) — 실제 원문 슬라이스
  const deathBlocks={};
  (function visit(n){if(!n||typeof n!=='object')return;
    if(n.type==='IfStatement'){const t=hurtEScript.slice(n.test.start,n.test.end);
      for(const et of [29,55,59])if(t.startsWith(`e.etype===${et}`))deathBlocks[et]={text:hurtEScript.slice(n.start,n.end),testLine:lineOf(hurtEOffset+n.start),test:t};}
    for(const v of Object.values(n)){if(Array.isArray(v))v.forEach(visit);else if(v&&typeof v==='object')visit(v);}
  })(hurtENode);
  for(const et of [29,55,59])assert.ok(deathBlocks[et],`etype${et} 사망탄 블록 추출`);
  // alive=false 문장 (hurtE 본체 최종 처치) — 사망탄 블록 직전 발생지점을 라인으로 검증
  // hurtE 내 alive=false 지점은 여럿(환영 소멸 등 early return 경로 포함). etype29/55/59 블록을
  // 실제로 지배하는 것은 블록 직전의 최종 처치 alive=false 이므로 그 occurrence를 집는다.
  const hurtAbs=functions.hurtE.line, hurtTxt=functions.hurtE.text;
  const death29Local=hurtTxt.indexOf(deathBlocks[29].text);
  let aliveFalseLocal=-1,scan=-1;
  while((scan=hurtTxt.indexOf('atkTicketRelease(e);e.alive=false;G.kills++',scan+1))>=0&&scan<death29Local)aliveFalseLocal=scan;
  assert.ok(aliveFalseLocal>=0,'hurtE 사망탄 직전 alive=false 추출');
  const aliveFalseLine=hurtAbs+hurtTxt.slice(0,aliveFalseLocal).split('\n').length-1;
  for(const h of HELPERS)assert.ok(functions[h],`helper ${h}`);
  return {functions,eShootWindCase,deathBlocks,aliveFalseLine};
}

// ── 메모리 전용 후보(TCB-03/04 관련 2라인/파일): find에 dead, 즉시발사에 e.alive ──
function candidateEmit(src){
  let t=src.functions._emitEnemyShot.text;
  const imm1="if(e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean)";
  const imm2="if(e.alive&&e.s==='eShootWind'&&e.st2<=0&&e._swChargeEl===props.el&&!props.blackBean)";
  assert.equal(t.split(imm1).length-1,1,'즉시발사 유일');t=t.replace(imm1,imm2);
  const find1='w.owner===e&&w.frame===_gameFrame',find2='w.owner===e&&w.dead===!e.alive&&w.frame===_gameFrame';
  assert.equal(t.split(find1).length-1,1,'find 유일');t=t.replace(find1,find2);
  return t;
}

// ── VM 하니스: 실제 발사 helper + 실제 사망탄 블록 원문을 심는다 ──
function setup(src,{emitText,rnd=0.9}={}){
  const fired=[],rings=()=>ctx.G._shotWarnings||[];
  const math=Object.create(Math);math.random=()=>rnd;
  const ctx=vm.createContext({Math:math,window:{},console,
    G:{kills:0,_stageKills:0,hitStop:0,_noHitStopT:0,_flashT:0,_flashCol:''},
    P:{x:9999,y:9999,r:10,iframes:1,_freezeSlow:0},ens:[],_gameFrame:7,
    EL:{P:0,F:1,I:2,D:3,L:4},ELC:['white','red','blue','purple','yellow'],OPT:{hitStop:100},
    spawnProj:p=>{fired.push({...p});return p;},
    addParts(){},addTxt(){},shake(){},hurtP(){},SFX:{groggy(){},hit(){}},
    dst:(a,b,c,d)=>Math.hypot(a-c,b-d),_T:s=>s,_L:(a)=>a,
    _drawShootCharge(){},_drawProjectileChargeLabel(){},_BEAN_RAINBOW:['rainbow'],
    _mkProj:()=>({}),_resetProj(){},_projFree:[],_isBigEnergy:()=>false});
  for(const name of HELPERS){
    const text=(name==='_emitEnemyShot'&&emitText)?emitText:src.functions[name].text;
    vm.runInContext(text,ctx);
  }
  vm.runInContext(`function sourceShootCase(e,sp=1){switch(e.s){${src.eShootWindCase.text}}}`,ctx);
  // 실제 hurtE 사망탄 블록 3종을 원문 그대로 실행하는 함수 (alive=false는 소스상 선행 → 진입전 세팅)
  vm.runInContext(`function sourceDeathShots(e){${src.deathBlocks[29].text}
${src.deathBlocks[55].text}
${src.deathBlocks[59].text}}`,ctx);
  return {ctx,fired,rings};
}
function enemy(x){return {alive:true,ib:false,x:0,y:0,r:12,s:'idle',st2:30,el:2,etype:29,atk:10,_boneDeath:true,
  _hitStun:0,stunned:0,_frozen:0,...x};}

const results=[],sources={};
function check(file,name,fn){try{fn();results.push({file,name,status:'PASS'});}catch(e){results.push({file,name,status:'FAIL',error:e.message});}}
function witness(file,name,observe,expected){const actual=observe();results.push({file,name,status:JSON.stringify(actual)===JSON.stringify(expected)?'REPRODUCED':'FAIL',actual,expected});}

for(const file of ['game.html','game-easy-test.html']){
  const html=readFileSync(`${ROOT}/${file}`,'utf8');
  const src=extract(html);
  const emitCand=candidateEmit(src);
  sources[file]={sha256:sha(html),
    aliveFalseLine:src.aliveFalseLine,
    deathBlockLines:{29:src.deathBlocks[29].testLine,55:src.deathBlocks[55].testLine,59:src.deathBlocks[59].testLine},
    eShootWindCaseLine:src.eShootWindCase.line,
    helpers:Object.fromEntries(HELPERS.map(k=>[k,{line:src.functions[k].line,sha256:sha(src.functions[k].text)}])),
    hurtE:{line:src.functions.hurtE.line,sha256:sha(src.functions.hurtE.text)},
    deathBlockSha:Object.fromEntries([29,55,59].map(et=>[et,sha(src.deathBlocks[et].text)]))};

  // [S1] 소스 순서: alive=false(최종 처치)가 etype29/55/59 사망탄 블록보다 앞 → 블록 진입시 항상 alive=false
  check(file,'S1 사망탄 블록은 alive=false 이후(소스 라인 순서)',()=>{
    for(const et of [29,55,59])assert.ok(src.aliveFalseLine<src.deathBlocks[et].testLine,
      `alive=false(${src.aliveFalseLine}) < etype${et}(${src.deathBlocks[et].testLine})`);
  });

  // [S2] TCB-03 도달(원문 사망탄): 동일frame 생전예약(dead=false)과 키 일치 → 사망탄 흡수 → 둘 다 취소(0발)
  //      el=EL.I, blackBean=false, 동일 owner/frame/world/parryClass. 실제 사망탄 블록(rnd=0.9→redBean,el=EL.I) 사용.
  witness(file,'S2 TCB-03 생전예약+실제사망탄 흡수→둘다취소',()=>{
    const {ctx,fired}=setup(src,{rnd:0.9}),e=enemy();
    ctx._emitEnemyShot(e,{x:0,y:0,vx:2,vy:0,el:ctx.EL.I,col:'#4455aa',dmg:5,friendly:false}); // 생전예약 1링
    const livePre=ctx.G._shotWarnings.length,deadPre=ctx.G._shotWarnings.filter(w=>w.dead).length;
    e.alive=false;                 // 소스상 사망탄 블록보다 선행(S1) — 실제 진입 상태
    ctx.sourceDeathShots(e);       // 실제 etype29 사망탄 원문 실행(8발)
    const ringsAfter=ctx.G._shotWarnings.length,anyDeadRing=ctx.G._shotWarnings.some(w=>w.dead);
    ctx._tickEnemyShotWarnings(60);
    return {livePre,deadPre,ringsAfter,anyDeadRing,fired:fired.length};
  },{livePre:1,deadPre:0,ringsAfter:1,anyDeadRing:false,fired:0});

  // [S3] TCB-03 대조: 생전예약 없으면 실제 사망탄은 dead=true 링 단독 → 60f 후 전부 발사(의도 사망탄 보존)
  check(file,'S3 사망탄 단독(생전예약 없음): dead링→정상 방출',()=>{
    const {ctx,fired}=setup(src,{rnd:0.9}),e=enemy({alive:false});
    ctx.sourceDeathShots(e);
    assert.equal(ctx.G._shotWarnings.length,1);assert.equal(ctx.G._shotWarnings[0].dead,true);
    ctx._tickEnemyShotWarnings(59);assert.equal(fired.length,0);
    ctx._tickEnemyShotWarnings(1);assert.equal(fired.length,8);     // etype29 = 8방향
  });

  // [S4] TCB-04 불변식(실제 완료 case): st2<=0이면 _swFire 소진·_swChargeEl=null·s='idle'
  //      → updateE 밖에서 사망 소유자가 s==='eShootWind'&&st2<=0 상태로 남을 수 없음
  check(file,'S4 실제 eShootWind 완료 case가 eShootWind 상태를 소진',()=>{
    const {ctx,fired}=setup(src),e=enemy({s:'eShootWind',st2:0,_swChargeEl:0});
    let cbRan=false;e._swFire=()=>{cbRan=true;};
    ctx.sourceShootCase(e,1);
    assert.equal(cbRan,true);assert.equal(e._swFire,null);assert.equal(e._swChargeEl,null);assert.equal(e.s,'idle');
  });

  // [S5] TCB-04 도달불가(실제 순서): 완료 case 통과 후 사망 → 사망탄은 즉시발사 분기 못 탐(s!=='eShootWind')
  check(file,'S5 완료후 사망한 소유자의 실제 사망탄은 즉시발사 우회 안함',()=>{
    const {ctx,fired}=setup(src,{rnd:0.9}),e=enemy({s:'eShootWind',st2:0,_swChargeEl:2,_swFire:()=>{}});
    ctx.sourceShootCase(e,1);         // 실제 완료 → s='idle'
    assert.equal(e.s,'idle');
    e.alive=false;ctx.sourceDeathShots(e);  // 실제 사망탄
    assert.equal(fired.length,0);           // 즉시발사 아님 → 큐로 감
    assert.ok(ctx.G._shotWarnings.some(w=>w.dead));
    ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,8); // dead링 정상 방출
  });

  // [S6] TCB-04 합성전용: 완료 case를 건너뛰고 강제로 dead+eShootWind+st2<=0 구성해야만 즉시발사 발생
  //      (실제 호출순서로는 불가 — 기존76의 '사망시 완료 eShootWind 잔류'는 이 합성상태)
  witness(file,'S6 합성 강제상태만 즉시발사(60f 우회)',()=>{
    const {ctx,fired}=setup(src),e=enemy({alive:false,s:'eShootWind',st2:0,_swChargeEl:2});
    ctx._emitEnemyShot(e,{x:0,y:0,vx:2,vy:0,el:ctx.EL.I,col:'#4455aa',dmg:5,friendly:false});
    return {fired:fired.length,rings:(ctx.G._shotWarnings||[]).length};
  },{fired:1,rings:0});

  // [C1] 후보(메모리) find에 dead 추가 → TCB-03 해소: 사망탄이 생전링과 분리(dead=true) → 사망탄 방출·생전예약만 취소
  check(file,'C1 후보 find.dead: 생전예약 취소·실제 사망탄 방출',()=>{
    const {ctx,fired}=setup(src,{emitText:emitCand,rnd:0.9}),e=enemy();
    ctx._emitEnemyShot(e,{x:0,y:0,vx:2,vy:0,el:ctx.EL.I,col:'#4455aa',dmg:5,friendly:false});
    e.alive=false;ctx.sourceDeathShots(e);
    const deadRing=ctx.G._shotWarnings.filter(w=>w.dead).length,liveRing=ctx.G._shotWarnings.filter(w=>!w.dead).length;
    assert.equal(deadRing,1);assert.equal(liveRing,1);     // 두 링 분리
    ctx._tickEnemyShotWarnings(60);assert.equal(fired.length,8); // 사망탄만 방출, 생전예약 취소
  });

  // [C2] 후보(메모리) 즉시발사 e.alive 가드: 실제 도달경로(S5)에는 무영향(no-op), 합성상태(S6)만 차단
  check(file,'C2 후보 즉시발사가드: 실제경로 no-op·합성만 차단',()=>{
    // 실제 경로: 완료 case→사망→사망탄, 후보에서도 동일하게 큐로(원문과 결과 동일)
    const a=setup(src,{emitText:emitCand,rnd:0.9}),ea=enemy({s:'eShootWind',st2:0,_swChargeEl:2,_swFire:()=>{}});
    a.ctx.sourceShootCase(ea,1);ea.alive=false;a.ctx.sourceDeathShots(ea);
    assert.equal(a.fired.length,0);a.ctx._tickEnemyShotWarnings(60);assert.equal(a.fired.length,8);
    // 합성 강제상태: 원문은 1발 즉시, 후보는 0발(큐로) → 가드는 합성상태에만 작용
    const b=setup(src,{emitText:emitCand}),eb=enemy({alive:false,s:'eShootWind',st2:0,_swChargeEl:2});
    b.ctx._emitEnemyShot(eb,{x:0,y:0,vx:2,vy:0,el:b.ctx.EL.I,col:'#4455aa',dmg:5,friendly:false});
    assert.equal(b.fired.length,0);
  });

  // [P1] 보존: blackBean = Q전용 magic 패링(원문·후보 공통), 즉시발사·find가 blackBean 변경 안함
  check(file,'P1 blackBean Q전용 magic 패링 보존',()=>{
    const {ctx}=setup(src);
    assert.equal(ctx._projectileParryClass({blackBean:true,el:ctx.EL.P}),'magic'); // EL.P여도 blackBean→magic
    assert.equal(ctx._projectileParryClass({el:ctx.EL.P}),'physical');
    assert.equal(ctx._projectileParryClass({el:ctx.EL.I}),'magic');
  });

  // [P2] 보존: 실제 사망탄 수치(etype29 rnd=0→blackBean el=EL.P / rnd=0.9→redBean el=EL.I) 불변
  check(file,'P2 실제 사망탄 수치·속성 불변(blackBean/redBean 분기)',()=>{
    const bk=setup(src,{rnd:0}),ek=enemy({alive:false});bk.ctx.sourceDeathShots(ek);
    bk.ctx._tickEnemyShotWarnings(60);
    assert.equal(bk.fired.length,8);
    assert.ok(bk.fired.every(p=>p.blackBean===true&&p.el===bk.ctx.EL.P&&p.dmg===~~(10*1.5))); // atk10*1.5=15
    const rb=setup(src,{rnd:0.9}),er=enemy({alive:false});rb.ctx.sourceDeathShots(er);
    rb.ctx._tickEnemyShotWarnings(60);
    assert.ok(rb.fired.every(p=>p.redBean===true&&p.el===rb.ctx.EL.I&&p.dmg===~~(10*1.2))); // 1.2배=12
  });

  // [P3] 후보는 _emitEnemyShot 外 발사/사망탄 원문을 바꾸지 않음(해당 2라인 외 동일)
  check(file,'P3 후보는 지정 2라인 외 _emitEnemyShot 동일',()=>{
    const diff=[...src.functions._emitEnemyShot.text].filter((c,i)=>c!==emitCand[i]).length;
    assert.ok(emitCand!==src.functions._emitEnemyShot.text); // 변경 있음
    // 두 치환만 반영됐는지: 치환 후 원문으로 역치환하면 동일
    const back=emitCand.replace("if(e.alive&&e.s==='eShootWind'","if(e.s==='eShootWind'").replace('w.dead===!e.alive&&','');
    assert.equal(back,src.functions._emitEnemyShot.text);
  });
}

const failed=results.filter(r=>r.status==='FAIL');
const out={task:'native-hurtE-death-shot-fixture',scope:'TCB-03/04 실제 도달경로',startedAt,completedAt:new Date().toISOString(),head,
  node:process.version,sources,
  counts:{pass:results.filter(r=>r.status==='PASS').length,reproduced:results.filter(r=>r.status==='REPRODUCED').length,fail:failed.length},
  verdict:{'TCB-03':'REACHABLE(협소·흡수취소)','TCB-04':'UNREACHABLE(합성전용)'},
  results,candidateApplied:false,
  limits:['Node VM 소스 추출 — 실제 helper + 실제 eShootWind 완료 case + 실제 hurtE etype29/55/59 사망탄 블록만 실행',
    'alive=false 선행은 소스 라인 순서(S1)로 정적 검증, 블록 진입상태를 그 사실대로 구성',
    '전체 hurtE·updateE·게임루프·GPU픽셀·FPS·시각/청취 인수 미실행',
    '기존76검사 반복0 — 본 fixture는 TCB-03/04 도달경로 전용 신규 검사',
    'spawnProj/particles/render/geometry stub, 밸런스 수치는 사망탄 블록 원문 공식으로만 확인']};
console.log(JSON.stringify(out,null,2));
if(failed.length)process.exitCode=1;
