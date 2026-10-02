// ANIMVFX-gl2d-body-duplicate-omission-bd1405 (CH1-1 playable — hit/telegraph/lifetime 외 body draw 연결)
// 경계: _getTex partial failure 하에서 실제 _queueEnemy8DirInstanced→_drawEnemy8DirInstanced(bucket) + 실제 2D body caller
//       를 함께 실행해 "동시모드 body 중복(duplicate) 또는 누락(omission)"을 실제 성공/실패값·bucket 부작용으로 검수.
// 금지: 단독 !_ensGLQueued 가드 채택/원형폴백 복원/0548·원장표 재생산. 손작성 조건표 대신 원문 실행.
// 경계: 읽기 전용. Git 0. production 미적용. GL/pixel = QA Gate(기록기는 호출/버퍼 소비이지 GPU state 아님).
import fs from 'node:fs';
import crypto from 'node:crypto';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const read=p=>fs.readFileSync(root+'/'+p,'utf8');
const startedAt=new Date().toISOString();
const rows=[];
function check(id,a){ try{a();rows.push({id,status:'PASS'});}catch(e){rows.push({id,status:'FAIL',reason:e.message});} }
function expect(v,r){ if(!v) throw new Error(r); }
function eq(a,b,r){ if(a!==b) throw new Error(`${r}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }

const gh=read('game.html'), ge=read('game-easy-test.html');

// ── 실제 source 추출 ──
function ex(t){
  const mMax=t.match(/const _ENS_GL_MAX=(\d+),_ENS_GL_STRIDE=(\d+);/);
  const mGr=t.match(/const _ENS8_GL_GROUPS=(\d+);/);
  const mG8=t.match(/const _ENS8_GL_MAX=([^;]+);/);
  const q=t.match(/function _queueEnemy8DirInstanced\(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha\)\{[\s\S]*?\n\}/);
  const d=t.match(/function _drawEnemy8DirInstanced\(\)\{[\s\S]*?\n\}/);
  const body=t.match(/const _a8=_ch8Atlas\[1\];\s*\n\s*if\(_a8\)\{\s*\n\s*if\(P\)\{const _fdM2=dst2\(P\.x,P\.y,e\.x,e\.y\)[\s\S]*?X\.restore\(\);_eDrew=true;_usedSpr=true;\s*\n\s*\}\s*\n\s*\}/);
  expect(mMax&&mGr&&mG8&&q&&d&&body,'source 추출');
  expect(body[0].length<3000 && !body[0].includes('Math.random'),'body 과다매칭');
  return { constSrc:`const _ENS_GL_MAX=${mMax[1]},_ENS_GL_STRIDE=${mMax[2]};const _ENS8_GL_GROUPS=${mGr[1]};const _ENS8_GL_MAX=${mG8[1]};`,
    queueSrc:q[0], drawSrc:d[0], bodySrc:body[0],
    queueSha:sha(q[0]), drawSha:sha(d[0]), bodySha:sha(body[0]) };
}
const EX=ex(gh), EXe=ex(ge);

// ── 실제 queue+draw 샌드박스 (GL 기록기 + _getTex 대역) ──
function makeGL(E){
  const f=new Function('bands',`
    ${E.constSrc}
    let _ens8GLTotal=0;
    const _ens8GLCounts=new Uint16Array(_ENS8_GL_GROUPS);
    const _ens8GLImgs=new Array(_ENS8_GL_GROUPS);
    const _ens8GLCpu=new Float32Array(_ENS8_GL_GROUPS*_ENS_GL_MAX*_ENS_GL_STRIDE);
    let _dbgEns8GL=0,_dbgEns8GLDraws=0;
    const _useGL=true,_ensGLProg={},_ensGLVao={},_ensGLInstVBO={},_ensGLURes={},_ensGLUTex={},_glMainProg={};
    const VW=1280,VH=800; const _DCP={on:false,_onInst(){}};
    const _flush=()=>{};
    const _getTex=(img,flag)=>{const ok=bands.texOK(img);bands.log.push({c:'getTex',img:img&&img.__id,ok:!!ok});return ok?{__t:img.__id}:null;};
    const GL={BLEND:1,SRC_ALPHA:2,ONE_MINUS_SRC_ALPHA:3,ARRAY_BUFFER:4,TEXTURE0:5,TEXTURE_2D:6,TRIANGLE_STRIP:7,
      enable(){},blendFunc(){},useProgram(){},bindVertexArray(){},bindBuffer(){},uniform1i(){},uniform2f(){},activeTexture(){},bindTexture(){},
      bufferSubData(t,d,src,so,len){const bucket=so/(_ENS_GL_MAX*_ENS_GL_STRIDE);bands.log.push({c:'buffer',bucket,instances:len/_ENS_GL_STRIDE});},
      drawArraysInstanced(m,f,c){bands.log.push({c:'draw',count:c});}};
    ${E.queueSrc}
    ${E.drawSrc}
    return { queue:_queueEnemy8DirInstanced, draw:_drawEnemy8DirInstanced, count:b=>_ens8GLCounts[b], total:()=>_ens8GLTotal };
  `);
  return f;
}
// ── 실제 2D body 샌드박스 (canvas sink, drawImage by img id) ──
function makeBody(E){
  return new Function('X','e','sa','_a8obj','P','_mobFacingDir8',`
    const _MOB8_COLS=8; function dst2(a,b,c,d){return (c-a)**2+(d-b)**2;}
    const _ch8Atlas={1:_a8obj}; let _eDrew=false,_usedSpr=false;
    ${E.bodySrc}
    return {_eDrew};
  `);
}
const CELL=256, baseSz=140, sa=1, idleBucket=0, walkBucket=8;
const idleImg={__id:'idle',width:2048,height:1280}, walkImg={__id:'walk',width:8192,height:1280};
const e={x:0,y:0,r:20,facing:Math.PI/2,_mob8Col:1,_mob8Row:3,_isMoving:true,_walkDist:200};
function atlas(){ return {meta:{cell:CELL},dirs:{south:{img:idleImg,ready:true}},walkDirs:{south:{img:walkImg,ready:true}},walkMeta:{framesPerMob:4,_idxSet:new Set([e._mob8Row*8+e._mob8Col])}}; }
const facing=()=>'south';

// ── 한 시나리오 실행: 실제 queue+draw(성공/실패값·bucket 소비) + 정책별 2D body ──
function runScenario(E, {walkTexOK}){
  const glf=makeGL(E), bodyf=makeBody(E);
  const bands={ texOK:(img)=> img && (img.__id!=='walk' || walkTexOK), log:[] };
  const st=glf(bands);
  // 실제 queue (idle + walk), 용량 여유 → 둘 다 성공
  const idleQ=st.queue(idleBucket,idleImg,CELL,3*CELL,CELL,CELL,100,200,baseSz,baseSz,sa);
  const walkQ=st.queue(walkBucket,walkImg,CELL,3*CELL,CELL,CELL,100,200,baseSz,baseSz,sa);
  const qCounts={idleBucket:st.count(idleBucket), walkBucket:st.count(walkBucket), total:st.total()};
  // 실제 draw → bucket별 소비/출력
  bands.log.length=0; const drawn=st.draw();
  const buffers=bands.log.filter(l=>l.c==='buffer');
  const glIdleDrawn=buffers.some(b=>b.bucket===idleBucket)?1:0;
  const glWalkDrawn=buffers.some(b=>b.bucket===walkBucket)?1:0;
  const getTexCalls=bands.log.filter(l=>l.c==='getTex').map(l=>({img:l.img,ok:l.ok}));
  const ensGLMode=(idleQ)?1:0; // prep: idle 큐 성공 시 mode=1 (원문)

  // 정책별 실제 2D body 실행
  function body(policy){
    // guard-alone: mode=1이면 2D 전체 skip
    if(policy==='guardAlone' && ensGLMode===1) return {idle2D:0,walk2D:0};
    const sink=[]; const X={_a:1,set globalAlpha(v){},get globalAlpha(){return 1;},set imageSmoothingEnabled(v){},save(){},restore(){},translate(){},
      drawImage(img){sink.push(img&&img.__id);}};
    bodyf(X,e,sa,atlas(),null,facing);
    let idle2D=sink.filter(s=>s==='idle').length, walk2D=sink.filter(s=>s==='walk').length;
    // candidate(draw-feedback): GL이 이미 그린 bucket은 2D에서 commit 안 함 (per-bucket drawn 피드백 제안 모델)
    if(policy==='candidate'){ if(glIdleDrawn) idle2D=0; if(glWalkDrawn) walk2D=0; }
    return {idle2D,walk2D};
  }
  const out={};
  for(const p of ['current','guardAlone','candidate']){
    const b=body(p);
    const idleTotal=glIdleDrawn+b.idle2D, walkTotal=glWalkDrawn+b.walk2D;
    out[p]={ idle2D:b.idle2D, walk2D:b.walk2D, idleTotal, walkTotal,
      duplicate: idleTotal>1||walkTotal>1, omission: idleTotal===0||walkTotal===0 };
  }
  return { idleQ, walkQ, qCounts, glIdleDrawn, glWalkDrawn, getTexCalls, ensGLMode, policies:out };
}

const normal=runScenario(EX,{walkTexOK:true});
const walkFail=runScenario(EX,{walkTexOK:false});

// ── 검증 ──
check('EX-slices-identical', ()=>{ expect(EX.queueSha===EXe.queueSha&&EX.drawSha===EXe.drawSha&&EX.bodySha===EXe.bodySha,'queue/draw/body 양판 동일'); });
check('QUEUE-both-succeed-actual', ()=>{ expect(normal.idleQ===true&&normal.walkQ===true,'실제 queue 둘 다 성공'); eq(normal.qCounts.idleBucket,1,'idle bucket 1'); eq(normal.qCounts.walkBucket,1,'walk bucket 1'); });
check('DRAW-normal-both-buckets', ()=>{ eq(normal.glIdleDrawn,1,'GL idle 출력'); eq(normal.glWalkDrawn,1,'GL walk 출력'); });
check('DRAW-walkfail-skips-walk-bucket', ()=>{ eq(walkFail.glIdleDrawn,1,'idle 출력'); eq(walkFail.glWalkDrawn,0,'walk bucket _getTex 실패→skip'); expect(walkFail.getTexCalls.some(c=>c.img==='walk'&&c.ok===false),'_getTex walk 실패 기록'); });

// 현행(무가드): 정상=idle·walk 둘 다 GL+2D → DUPLICATE; walkfail=idle DUPLICATE(walk는 2D 커버)
check('CURRENT-duplicate', ()=>{
  expect(normal.policies.current.duplicate===true && normal.policies.current.idleTotal===2 && normal.policies.current.walkTotal===2,'정상 동시모드 중복');
  expect(walkFail.policies.current.duplicate===true && walkFail.policies.current.idleTotal===2 && walkFail.policies.current.walkTotal===1,'walkfail idle 중복');
});
// guard-alone: 정상=clean, walkfail=walk OMISSION (금지 이유)
check('GUARDALONE-omits-on-walkfail', ()=>{
  expect(normal.policies.guardAlone.duplicate===false && normal.policies.guardAlone.omission===false,'정상 clean');
  expect(walkFail.policies.guardAlone.omission===true && walkFail.policies.guardAlone.walkTotal===0,'walkfail walk 누락(가드단독 금지 근거)');
});
// candidate(draw-feedback): 정상·walkfail 둘 다 clean (중복0·누락0)
check('CANDIDATE-clean-both', ()=>{
  for(const s of [normal,walkFail]){ const c=s.policies.candidate; expect(c.duplicate===false && c.omission===false,'후보 clean'); }
  eq(walkFail.policies.candidate.walkTotal,1,'walkfail walk=1(2D가 실패 bucket만 커버)');
  eq(normal.policies.candidate.idleTotal,1,'정상 idle=1'); eq(normal.policies.candidate.walkTotal,1,'정상 walk=1');
});

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-gl2d-body-duplicate-omission-bd1405',
  recoveryTask:'RECOVERY-ANIMVFX-1405 (_getTex partial failure 동시모드 body 중복/누락)',
  capacityEpoch:'rolling-after-ca261460-1404 (credit 2, maxFiles 3, changes 63, stop<100)',
  provider:'VS Code Claude native (autonomous continuity)',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'실Read 시점 sha256. Git 미호출.', 'game.html':sha(gh), 'game-easy-test.html':sha(ge),
    queueSlice:EX.queueSha, drawSlice:EX.drawSha, bodySlice:EX.bodySha },
  bands:'실제 _queueEnemy8DirInstanced·_drawEnemy8DirInstanced·2D body 블록 원문 실행. GL=호출/bufferSubData bucket 소비 기록(+_getTex ready/fail 대역). candidate=실제 body 실행 후 GL-drawn bucket을 2D에서 미commit하는 per-bucket draw-feedback 모델(원문엔 없는 제안). GPU state/pixel 아님(QA Gate).',
  scenarios:{ normal, walkFail },
  finding:'현행 무가드 2D body는 GL-큐 성공 개체(mode=1)에도 실행되어, 정상에서 idle·walk 모두 GL+2D 동시 출력(DUPLICATE). _getTex walk 실패 시 GL walk bucket만 skip되고 2D가 idle·walk 그려 idle DUPLICATE. 단독 !_ensGLQueued 가드는 정상은 clean이나 walk 실패에서 walk OMISSION. draw-feedback 후보(bucket별 GL 실제 출력 여부를 body가 참조)만 정상·partial-fail 모두 중복0·누락0.',
  candidate:{ applied:false, type:'draw-time per-bucket feedback (NOT guard-alone, NOT circle fallback)',
    desc:'_drawEnemy8DirInstanced가 bucket별 실제 출력(idle/walk)을 개체 플래그로 남기고, 2D body가 GL이 그린 bucket은 생략·안 그린 bucket만 그림. duplicate/omission 동시 해소. source/판정/asset 불변(render 연결만).' },
  summary:{ groups:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length } },
  productionApplied:false, runtimeAccepted:false,
  disclaimer:'실제 _queue/_draw/body 호출 실행이나 GPU 업로드/픽셀/화면 PASS 아님. GL 상태·실제 가시성은 QA 화면 Gate. atlas-미준비는 별도 UNKNOWN(설계수용 임의확정 안 함).',
  docsHandoff:[
    {doc:'docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md', text:'현행 2D body 무가드로 GL-큐 개체도 2D 그려 동시모드 duplicate; _getTex partial fail 시 bucket skip. guard-alone은 partial-fail에서 omission. 해법은 draw-time per-bucket feedback(미적용).'},
    {doc:'docs/5.1임펙트디자인/ANIMATION_VFX_TEAM_MASTER.md', text:'body duplicate/omission은 동일 경계의 양면; bucket별 GL 실제 출력 피드백으로 동시 해소. guard-alone·원형폴백 금지.'},
  ],
  rows
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
