// ANIMVFX supervisor-next — texture-failure-body-0548
// 한 경계: queue 성공 뒤 walk 텍스처 실패에서 "실제 2D body fallback의 도달성".
// 이전 continuous가 2D body를 모형(idle2D=1,walk2D=1)으로 둔 한계를 교정한다.
// 이번엔 실제 _drawEnemy8DirInstanced(GL sink) + 실제 2D body 원문 블록(canvas source-sink)을 함께 실행하고,
// idle-ready/walk-drawtexture-null 한 입력과 둘다 ready 정상 한 입력만 비교한다.
// 금지: mode0?draw0 모형, body skip 가드 단독 채택, 실제 GL/픽셀/시각 확장. productionApplied=false.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const read = p => fs.readFileSync(root + '/' + p, 'utf8');
const readBuf = p => fs.readFileSync(root + '/' + p);
const startedAt = new Date().toISOString();

const rows=[];
function check(id,action){ try{action();rows.push({id,status:'PASS'});}catch(e){rows.push({id,status:'FAIL',reason:e.message});} }
function expect(v,r){ if(!v) throw new Error(r); }
function eq(a,b,r){ if(a!==b) throw new Error(`${r}: got ${JSON.stringify(a)} want ${JSON.stringify(b)}`); }

// ── 실제 source 추출 ──
function extract(fileText){
  const mMax=fileText.match(/const _ENS_GL_MAX=(\d+),_ENS_GL_STRIDE=(\d+);/);
  const mGroups=fileText.match(/const _ENS8_GL_GROUPS=(\d+);/);
  const mG8Max=fileText.match(/const _ENS8_GL_MAX=([^;]+);/);
  const mQueue=fileText.match(/function _queueEnemy8DirInstanced\(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha\)\{[\s\S]*?\n\}/);
  const mDraw=fileText.match(/function _drawEnemy8DirInstanced\(\)\{[\s\S]*?\n\}/);
  const mFacing=fileText.match(/function _mobFacingDir8\(f\)\{[\s\S]*?\n\}/);
  const mPI2=fileText.match(/const _PI2=([^;]+);/);
  // 실제 2D body 블록: 일반 적 경로에만 있는 고유 앵커(`if(P){const _fdM2=dst2(P.x,P.y,e.x,e.y)`)로 좁게 매칭
  const mBody=fileText.match(/const _a8=_ch8Atlas\[1\];\s*\n\s*if\(_a8\)\{\s*\n\s*if\(P\)\{const _fdM2=dst2\(P\.x,P\.y,e\.x,e\.y\)[\s\S]*?X\.restore\(\);_eDrew=true;_usedSpr=true;\s*\n\s*\}\s*\n\s*\}/);
  expect(mMax&&mGroups&&mG8Max&&mQueue&&mDraw&&mFacing&&mPI2&&mBody,'source 추출 실패');
  expect(mBody[0].length<3000 && !mBody[0].includes('Math.random'),'2D body 블록 과다매칭('+(mBody?mBody[0].length:0)+'자)');
  const constSrc=`const _ENS_GL_MAX=${mMax[1]},_ENS_GL_STRIDE=${mMax[2]};const _ENS8_GL_GROUPS=${mGroups[1]};const _ENS8_GL_MAX=${mG8Max[1]};`;
  return { constSrc, queueSrc:mQueue[0], drawSrc:mDraw[0], facingSrc:mFacing[0], pi2Src:`const _PI2=${mPI2[1]};`, bodySrc:mBody[0],
    ENS_GL_MAX:Number(mMax[1]), STRIDE:Number(mMax[2]), GROUPS:Number(mGroups[1]), ENS8_GL_MAX:Number(mMax[1])*(mG8Max[1].includes('*2')?2:1),
    queueSha:sha(mQueue[0]), drawSha:sha(mDraw[0]), bodySha:sha(mBody[0]), facingSha:sha(mFacing[0]) };
}

// ── 샌드박스: 실제 queue+draw(GL sink) + 실제 2D body 블록(canvas sink) ──
function makeSandbox(ex){
  // GL draw용 스코프 (continuous와 동일 대역)
  const glFactory=new Function('bands',`
    ${ex.constSrc}
    let _ens8GLTotal=0;
    const _ens8GLCounts=new Uint16Array(_ENS8_GL_GROUPS);
    const _ens8GLImgs=new Array(_ENS8_GL_GROUPS);
    const _ens8GLCpu=new Float32Array(_ENS8_GL_GROUPS*_ENS_GL_MAX*_ENS_GL_STRIDE);
    let _dbgEns8GL=0,_dbgEns8GLDraws=0;
    const _useGL=true,_ensGLProg={},_ensGLVao={},_ensGLInstVBO={},_ensGLURes={},_ensGLUTex={},_glMainProg={};
    const VW=1280,VH=800; const _DCP={on:false,_onInst(){}};
    const _flush=()=>bands.log.push({call:'_flush'});
    const _getTex=(img,flag)=>{const ok=bands.texOK(img);bands.log.push({call:'_getTex',img:img&&img.__id,ok:!!ok});return ok?{__tex:img.__id}:null;};
    const GL={BLEND:1,SRC_ALPHA:2,ONE_MINUS_SRC_ALPHA:3,ARRAY_BUFFER:4,TEXTURE0:5,TEXTURE_2D:6,TRIANGLE_STRIP:7,
      enable(){},blendFunc(){},useProgram(){},bindVertexArray(){},bindBuffer(){},uniform1i(){},uniform2f(){},activeTexture(){},bindTexture(){},
      bufferSubData(t,d,src,so,len){const n=len/_ENS_GL_STRIDE,xs=[];for(let i=0;i<n;i++)xs.push(src[so+i*_ENS_GL_STRIDE]);bands.log.push({call:'bufferSubData',bucket:so/(_ENS_GL_MAX*_ENS_GL_STRIDE),instances:n,sentinels:xs});},
      drawArraysInstanced(m,f,c){bands.log.push({call:'drawArraysInstanced',count:c});}};
    ${ex.queueSrc}
    ${ex.drawSrc}
    return { queue:_queueEnemy8DirInstanced, draw:_drawEnemy8DirInstanced,
      getCount:b=>_ens8GLCounts[b], getTotal:()=>_ens8GLTotal };
  `);
  // 2D body용 스코프 (실제 블록 + 실제 _mobFacingDir8)
  const bodyFactory=new Function('X','e','sa','_a8obj','P','sink',`
    ${ex.pi2Src}
    const _MOB8_COLS=8, _MOB8_TOTAL=40;
    function dst2(a,b,c,d){return (c-a)**2+(d-b)**2;}
    ${ex.facingSrc}
    const _ch8Atlas={1:_a8obj};
    let _eDrew=false,_usedSpr=false;
    ${ex.bodySrc}
    return { _eDrew, _usedSpr, drawImages: sink.filter(s=>s.call==='drawImage') };
  `);
  return { glFactory, bodyFactory };
}

// ── fixture ──
const CELL=256, baseSz=140, sa=1;
const idleBucket=0, walkBucket=8; // facing=π/2 → 'south' → bucket 0
const idleImg={__id:'idle',width:2048,height:1280};
const walkImg={__id:'walk',width:8192,height:1280};
const e={ x:340,y:420,r:20, facing:Math.PI/2, _mob8Col:1,_mob8Row:3, _isMoving:true,_walkDist:200 };
const _mIdx=e._mob8Row*8+e._mob8Col; // 25
// walk 이미지 로드 완료(_mW.ready)는 GL _getTex(업로드)와 독립 — 두 입력 모두 true로 둔다.
function atlasObj(){
  return { meta:{cell:CELL},
    dirs:{ south:{img:idleImg,ready:true} },
    walkDirs:{ south:{img:walkImg,ready:true} },
    walkMeta:{ framesPerMob:4, _idxSet:new Set([_mIdx]) } };
}
function qIdle(st,x){return st.queue(idleBucket,idleImg,1*CELL,3*CELL,CELL,CELL,x,0,baseSz,baseSz,sa);}
function qWalk(st,x){return st.queue(walkBucket,walkImg,1*CELL,3*CELL,CELL,CELL,x,0,baseSz,baseSz,sa);}

function canvasSink(sink){
  return { save(){sink.push({call:'save'});}, restore(){sink.push({call:'restore'});},
    translate(x,y){sink.push({call:'translate',x,y});}, set globalAlpha(v){sink.push({call:'globalAlpha',v});}, get globalAlpha(){return 1;},
    set imageSmoothingEnabled(v){}, get imageSmoothingEnabled(){return false;},
    drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh){sink.push({call:'drawImage',img:img&&img.__id,sx,sy,sw,sh,dx,dy,dw,dh});} };
}

// 한 입력 실행: 실제 GL draw + 실제 2D body 를 source-sink로 실행
function runInput(ex, {walkTexOK}){
  const {glFactory,bodyFactory}=makeSandbox(ex);
  // GL: 단일 개체 idle+walk 큐 성공, draw 시 walk 텍스처만 walkTexOK 로 제어
  const bands={ texOK:(img)=> img && (img.__id!=='walk' || walkTexOK), log:[] };
  const st=glFactory(bands);
  const idleOK=qIdle(st,9999), walkOK=qWalk(st,8888);
  bands.log.length=0; const glDrawn=st.draw();
  const glBuf=bands.log.filter(l=>l.call==='bufferSubData');
  const glInst=bands.log.filter(l=>l.call==='drawArraysInstanced');
  const getTexCalls=bands.log.filter(l=>l.call==='_getTex').map(l=>({img:l.img,ok:l.ok}));
  const glIdle=glBuf.some(b=>b.bucket===idleBucket&&b.sentinels.includes(9999))?1:0;
  const glWalk=glBuf.some(b=>b.bucket===walkBucket&&b.sentinels.includes(8888))?1:0;
  // 2D body: 실제 원문 블록 실행 (GL-queued 개체여도 현행 무가드라 실행됨)
  const sink=[]; const X=canvasSink(sink);
  const r=bodyFactory(X,e,sa,atlasObj(),null,sink);
  const twoIdle=r.drawImages.filter(d=>d.img==='idle').length;
  const twoWalk=r.drawImages.filter(d=>d.img==='walk').length;
  return { idleOK,walkOK, glDrawn, getTexCalls, glIdle,glWalk, twoIdle,twoWalk,
    bodyRan:r.drawImages.length>0, eDrew:r._eDrew, usedSpr:r._usedSpr,
    drawImages:r.drawImages,
    sum:{ idle:glIdle+twoIdle, walk:glWalk+twoWalk } };
}

const files=['game.html','game-easy-test.html'];
const perFile={};
for(const f of files){
  const ex=extract(read(f));
  perFile[f]={ ex:{queueSha:ex.queueSha,drawSha:ex.drawSha,bodySha:ex.bodySha,facingSha:ex.facingSha,
      ENS_GL_MAX:ex.ENS_GL_MAX,ENS8_GL_MAX:ex.ENS8_GL_MAX,GROUPS:ex.GROUPS,STRIDE:ex.STRIDE},
    inputs:{
      both_ready: runInput(ex,{walkTexOK:true}),
      walk_tex_null: runInput(ex,{walkTexOK:false})
    } };
}

// ── 검증 ──
const gh=extract(read('game.html')), ge=extract(read('game-easy-test.html'));
check('EX-slices-identical',()=>{ expect(gh.queueSha===ge.queueSha&&gh.drawSha===ge.drawSha&&gh.bodySha===ge.bodySha,'queue/draw/body 양판 동일'); });
check('EX-body-no-guard',()=>{ expect(!/_ensGLQueued/.test(gh.bodySrc),'추출한 2D body 블록에 _ensGLQueued 가드 없음(현행)'); });

for(const f of files){
  const I=perFile[f].inputs, tag=f==='game.html'?'G':'E';
  // 정상(both ready): GL idle+walk, 2D body도 idle+walk 실제 drawImage → 합산 idle2/walk2 (전체 이중)
  check(`both-ready-double[${tag}]`,()=>{
    const b=I.both_ready;
    expect(b.idleOK&&b.walkOK,'큐 둘 다 성공');
    eq(b.glIdle,1,'GL idle'); eq(b.glWalk,1,'GL walk');
    expect(b.bodyRan===true,'2D body 실제 실행(drawImage 발생)');
    eq(b.twoIdle,1,'2D drawImage idle'); eq(b.twoWalk,1,'2D drawImage walk');
    eq(b.sum.idle,2,'idle 합산 이중'); eq(b.sum.walk,2,'walk 합산 이중');
  });
  // walk 텍스처 실패: GL walk 미출력, 2D body는 _mW.ready(이미지 로드) 기준이라 walk drawImage 수행 → walk 커버, idle은 이중
  check(`walk-tex-null-body-covers-walk[${tag}]`,()=>{
    const w=I.walk_tex_null;
    expect(w.idleOK&&w.walkOK,'큐 둘 다 성공(텍스처 실패는 draw 시점)');
    expect(w.getTexCalls.some(c=>c.img==='walk'&&c.ok===false),'draw _getTex walk 실패');
    eq(w.glIdle,1,'GL idle 출력'); eq(w.glWalk,0,'GL walk 미출력(텍스처 null)');
    expect(w.bodyRan===true,'2D body 실제 실행');
    eq(w.twoIdle,1,'2D idle'); eq(w.twoWalk,1,'2D walk — CPU drawImage는 GL _getTex와 독립, _mW.ready 기준');
    eq(w.sum.walk,1,'walk 합산 1(2D가 커버 — 현행 보행 누락 없음)');
    eq(w.sum.idle,2,'idle 합산 2(이중) — 픽셀 안전성은 미확정(GL/시각 Gate)');
  });
}

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const out={
  taskId:'supervisor-next/ANIMVFX/ANIMVFX-texture-failure-body-0548',
  provider:'VS Code Claude native (supervisor follow-up)',
  cwd:root, node:process.version, startedAt, endedAt,
  sourceReadSHA:{ note:'본 세션 실제 Read 시점 sha256(파일 전체내용). Git 미호출.',
    fileContent:Object.fromEntries(files.map(f=>[f,sha(readBuf(f))])),
    bodySlice:{ 'game.html':gh.bodySha,'game-easy-test.html':ge.bodySha },
    queueSlice:gh.queueSha, drawSlice:gh.drawSha },
  supervisorCheckpoint:{ note:'총괄 제공 원격검증(조회시점 근거, 독립 현재 HEAD 아님)',
    remote:'f2e70ef7c9c663fdd69e925bc379b6d6f8bcaa9c', game:'2e45', easy:'3e59', node:'541ff8' },
  bands:'GL=호출/bufferSubData/_getTex ready|fail 기록, 2D body=실제 원문 블록을 canvas source-sink(drawImage/save/restore/translate)로 실행. _mW.ready=이미지 로드(GL _getTex 업로드와 독립).',
  summary:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length },
  productionApplied:false,
  disclaimer:'source fixture PASS ≠ actual GL/pixel/visual/package PASS. idle 이중 픽셀 안전성 미확정.',
  rows, perFile
};
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
