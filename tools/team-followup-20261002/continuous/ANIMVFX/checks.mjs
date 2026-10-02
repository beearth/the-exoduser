// ANIMVFX continuous — 실제 queue+draw 결합 부분실패 rollback 검증 (한 건)
// 핵심: 이전 harness는 ensGLMode/rolledBack 플래그만 바꾸고 count/total/buffer를 되돌리지 않았고,
//       mode0?draw0 집계로 통과를 강제했다. 실제 _drawEnemy8DirInstanced는 개체 mode가 아니라
//       버킷 count를 그리므로 그 GREEN은 rollback 검증이 아니었다.
// 이번엔 현재 양판 실제 _queueEnemy8DirInstanced + _drawEnemy8DirInstanced source를 함께 실행하고,
//       GL은 호출/전송버퍼 구간을 기록하는 작은 대역, _getTex는 ready/fail 대역으로만 둔다.
// 경계: 읽기 전용. Git 호출 0. 전체 게임/GL 부트 0. production/visual/GPU PASS 아님.
import fs from 'node:fs';
import crypto from 'node:crypto';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const read = p => fs.readFileSync(root + '/' + p, 'utf8');
const readBuf = p => fs.readFileSync(root + '/' + p);
const startedAt = new Date().toISOString();

const rows = [];
function check(id, action){ try{ action(); rows.push({id,status:'PASS'}); }catch(e){ rows.push({id,status:'FAIL',reason:e.message}); } }
function expect(v, reason){ if(!v) throw new Error(reason); }
function eq(a,b,reason){ if(a!==b) throw new Error(`${reason}: got ${a} want ${b}`); }
function same(a,b,reason){ if(JSON.stringify(a)!==JSON.stringify(b)) throw new Error(`${reason}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); }

// ── 실제 source 추출 (현재 파일 내용에서) ──
function extract(fileText){
  const mMax   = fileText.match(/const _ENS_GL_MAX=(\d+),_ENS_GL_STRIDE=(\d+);/);
  const mGroups= fileText.match(/const _ENS8_GL_GROUPS=(\d+);/);
  const mG8Max = fileText.match(/const _ENS8_GL_MAX=([^;]+);/);
  const mQueue = fileText.match(/function _queueEnemy8DirInstanced\(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha\)\{[\s\S]*?\n\}/);
  const mDraw  = fileText.match(/function _drawEnemy8DirInstanced\(\)\{[\s\S]*?\n\}/);
  expect(mMax && mGroups && mG8Max && mQueue && mDraw, 'source 추출 실패');
  const constSrc = `const _ENS_GL_MAX=${mMax[1]},_ENS_GL_STRIDE=${mMax[2]};const _ENS8_GL_GROUPS=${mGroups[1]};const _ENS8_GL_MAX=${mG8Max[1]};`;
  return {
    constSrc, queueSrc:mQueue[0], drawSrc:mDraw[0],
    ENS_GL_MAX:Number(mMax[1]), STRIDE:Number(mMax[2]), GROUPS:Number(mGroups[1]),
    ENS8_GL_MAX: Number(mMax[1]) * (mG8Max[1].includes('*2')?2:1),
    queueSha: sha(mQueue[0]), drawSha: sha(mDraw[0]), constSha: sha(constSrc)
  };
}

// ── 실제 두 함수를 공유 상태 위에서 실행하는 샌드박스 + GL/getTex 대역 ──
function makeSandbox(ex){
  const factory = new Function('bands', `
    ${ex.constSrc}
    let _ens8GLTotal=0;
    const _ens8GLCounts=new Uint16Array(_ENS8_GL_GROUPS);
    const _ens8GLImgs=new Array(_ENS8_GL_GROUPS);
    const _ens8GLCpu=new Float32Array(_ENS8_GL_GROUPS*_ENS_GL_MAX*_ENS_GL_STRIDE);
    let _dbgEns8GL=0,_dbgEns8GLDraws=0;
    // ── 대역(bands): 실제 전송·텍스처 성공/실패를 기록만 한다 ──
    const _useGL=true, _ensGLProg={}, _ensGLVao={}, _ensGLInstVBO={}, _ensGLURes={}, _ensGLUTex={}, _glMainProg={};
    const VW=1280, VH=800;
    const _DCP={on:false,_onInst(){}};
    const _flush=()=>{ bands.log.push({call:'_flush'}); };
    const _getTex=(img,flag)=>{ const ok=bands.texOK(img); bands.log.push({call:'_getTex',img:img&&img.__id,ok:!!ok}); return ok?({__tex:img.__id}):null; };
    const GL={
      BLEND:1,SRC_ALPHA:2,ONE_MINUS_SRC_ALPHA:3,ARRAY_BUFFER:4,TEXTURE0:5,TEXTURE_2D:6,TRIANGLE_STRIP:7,
      enable(){}, blendFunc(){}, useProgram(){}, bindVertexArray(){}, bindBuffer(){},
      uniform1i(){}, uniform2f(){}, activeTexture(){}, bindTexture(){},
      bufferSubData(target,dstOff,src,srcOff,len){
        // 실제 draw가 전송하는 버퍼 구간 + 그 안의 x sentinel(필드0) 기록
        const stride=_ENS_GL_STRIDE, n=len/stride, xs=[];
        for(let i=0;i<n;i++) xs.push(src[srcOff+i*stride+0]);
        bands.log.push({call:'bufferSubData',srcOff,len,instances:n,sentinels:xs});
      },
      drawArraysInstanced(mode,first,count){ bands.log.push({call:'drawArraysInstanced',count}); }
    };
    ${ex.queueSrc}
    ${ex.drawSrc}
    return {
      queue:_queueEnemy8DirInstanced,
      draw:_drawEnemy8DirInstanced,
      setTotal:v=>{_ens8GLTotal=v}, getTotal:()=>_ens8GLTotal,
      getCount:b=>_ens8GLCounts[b], setCount:(b,v)=>{_ens8GLCounts[b]=v},
      countSum:()=>{let s=0;for(let i=0;i<_ENS8_GL_GROUPS;i++)s+=_ens8GLCounts[i];return s;},
      // 실제 버퍼의 x sentinel을 버킷/슬롯에서 직접 읽어 유효 prefix 확인
      bufX:(bucket,slot)=>_ens8GLCpu[(bucket*_ENS_GL_MAX+slot)*_ENS_GL_STRIDE+0],
      imgs:()=>_ens8GLImgs,
      ENS8_GL_MAX:_ENS8_GL_MAX, ENS_GL_MAX:_ENS_GL_MAX
    };
  `);
  return factory;
}

// 공통 fixture
const CELL=256, baseSz=140, sa=1;
const idleBucket=0, walkBucket=8;
const idleImg={__id:'idle', width:2048, height:1280};
const walkImg={__id:'walk', width:8192, height:1280};
// 전송 x 인자 = sentinel id 로 사용 (queue가 _ens8GLCpu[_o]=x 로 저장)
function qIdle(st, x){ return st.queue(idleBucket, idleImg, 1*CELL, 3*CELL, CELL, CELL, x, 0, baseSz, baseSz, sa); }
function qWalk(st, x){ return st.queue(walkBucket, walkImg, 1*CELL, 3*CELL, CELL, CELL, x, 0, baseSz, baseSz, sa); }

// 기존 유효 큐를 실제 queue 호출로 채워 count/total/buffer를 일관 생성 (sentinel 구분)
function prefill(st, bucket, n, baseSentinel){
  for(let i=0;i<n;i++){ const ok=st.queue(bucket, bucket===walkBucket?walkImg:idleImg, 1*CELL,3*CELL,CELL,CELL, baseSentinel+i, 0, baseSz,baseSz,sa); if(!ok) throw new Error('prefill 거절 '+bucket+' '+i); }
}

// 실제 draw 실행 후 로그에서 각 버킷이 그린 sentinel/instances 추출
function runDraw(st, bands){
  bands.log.length=0;
  const drawn = st.draw();
  const buffers = bands.log.filter(e=>e.call==='bufferSubData');
  const instanced = bands.log.filter(e=>e.call==='drawArraysInstanced');
  const drawnSentinels = buffers.flatMap(b=>b.sentinels);
  return { drawn, buffers, instanced, drawnSentinels };
}

const TEST_IDLE=9999, TEST_WALK=8888;
const files=['game.html','game-easy-test.html'];
const perFile={};

for(const file of files){
  const ex = extract(read(file));
  const factory = makeSandbox(ex);
  const R = perFile[file] = { ex, scen:{} };

  // ═══ 시나리오 A: 전역 잔여1 → 마지막 이동 개체 idle 성공 / walk 거절 ═══
  // 정책별 독립 샌드박스. prefill: bucket0=3(유효 prefix), bucket1=511, bucket2=509 → total 1023.
  function setupRemain1(bands){
    const st = factory(bands);
    prefill(st, 0, 3, 1000);   // bucket0 유효 prefix: x=1000,1001,1002
    prefill(st, 1, 511, 2000);
    prefill(st, 2, 509, 3000);
    return st;
  }
  const texAllOK = { texOK:(img)=>true, log:[] };

  // A-current(무후보): idle 큐 성공 → walk 거절 → mode1(원문), count/total 잔류
  {
    const bands={...texAllOK,log:[]};
    const st=setupRemain1(bands);
    const beforeTotal=st.getTotal(), beforeB0=st.getCount(0), beforeSum=st.countSum();
    const idleOK=qIdle(st, TEST_IDLE);
    const afterIdleTotal=st.getTotal(), afterIdleB0=st.getCount(0);
    const walkOK=qWalk(st, TEST_WALK);           // 전역한도 거절 기대
    const d=runDraw(st, bands);
    R.scen.A_current={ beforeTotal,beforeB0,beforeSum, idleOK, afterIdleTotal,afterIdleB0, walkOK,
      total:st.getTotal(), countSum:st.countSum(), b0:st.getCount(0), b8:st.getCount(8),
      drawn:d.drawn, b0Instanced:d.instanced[0]&&d.instanced[0].count,
      testIdleDrawnGL:d.drawnSentinels.includes(TEST_IDLE),
      testWalkDrawnGL:d.drawnSentinels.includes(TEST_WALK),
      prefixDrawn:[1000,1001,1002].every(x=>d.drawnSentinels.includes(x)) };
  }

  // A-rollback(메모리/source 후보): walk 거절 시 idle의 count/total을 실제로 되돌림(마지막 append라 안전), mode0
  {
    const bands={...texAllOK,log:[]};
    const st=setupRemain1(bands);
    const idleOK=qIdle(st, TEST_IDLE);
    const bAfterIdle=st.getCount(0), tAfterIdle=st.getTotal();
    const walkOK=qWalk(st, TEST_WALK);
    let rolledBack=false;
    if(idleOK && !walkOK){ st.setCount(0, bAfterIdle-1); st.setTotal(tAfterIdle-1); rolledBack=true; } // 실제 상태 복원
    const d=runDraw(st, bands);
    R.scen.A_rollback={ idleOK, walkOK, rolledBack,
      total:st.getTotal(), countSum:st.countSum(), b0:st.getCount(0),
      testIdleDrawnGL:d.drawnSentinels.includes(TEST_IDLE),
      prefixDrawn:[1000,1001,1002].every(x=>d.drawnSentinels.includes(x)),
      // 다른 버킷 보존
      b1:st.getCount(1), b2:st.getCount(2),
      b1Drawn:d.drawnSentinels.includes(2000)&&d.drawnSentinels.includes(2510),
      b2Drawn:d.drawnSentinels.includes(3000)&&d.drawnSentinels.includes(3508),
      // 버퍼 prefix 슬롯 값 보존(실제 버퍼 재검)
      bufPrefix:[st.bufX(0,0),st.bufX(0,1),st.bufX(0,2)] };
  }

  // A-precheck(메모리/source 후보): 큐 전에 idle+walk 2슬롯 가능 여부 확인→불가면 GL 미큐(idle도 미기록), mode0
  {
    const bands={...texAllOK,log:[]};
    const st=setupRemain1(bands);
    const remain=st.ENS8_GL_MAX - st.getTotal();     // 1
    const willQueueGL = remain>=2;                    // idle+walk 둘 다 필요
    let idleOK=false, walkOK=false;
    if(willQueueGL){ idleOK=qIdle(st, TEST_IDLE); walkOK=qWalk(st, TEST_WALK); }
    const d=runDraw(st, bands);
    R.scen.A_precheck={ remain, willQueueGL, idleOK, walkOK,
      total:st.getTotal(), countSum:st.countSum(), b0:st.getCount(0),
      testIdleDrawnGL:d.drawnSentinels.includes(TEST_IDLE),
      prefixDrawn:[1000,1001,1002].every(x=>d.drawnSentinels.includes(x)),
      bufPrefix:[st.bufX(0,0),st.bufX(0,1),st.bufX(0,2)] };
  }

  // ═══ 시나리오 B: 큐 성공 뒤 draw의 walk texture 실패 (실제 draw + 실패 대역) ═══
  {
    const bands={ texOK:(img)=>img && img.__id!=='walk', log:[] }; // walk 텍스처만 실패
    const st=factory(bands);
    const idleOK=qIdle(st, TEST_IDLE);   // 용량 여유, 둘 다 성공
    const walkOK=qWalk(st, TEST_WALK);
    const d=runDraw(st, bands);
    // 큐시점 rollback/precheck는 walk 큐가 성공했으므로 트리거되지 않음 → draw 실패를 못 고침
    R.scen.B_walkTexFail={ idleOK, walkOK, b0:st.getCount(0), b8:st.getCount(8),
      testIdleDrawnGL:d.drawnSentinels.includes(TEST_IDLE),
      testWalkDrawnGL:d.drawnSentinels.includes(TEST_WALK),
      getTexCalls:bands.log.filter(e=>e.call==='_getTex').map(e=>({img:e.img,ok:e.ok})),
      instancedCount:d.instanced.length,
      queueTimeCandidateResolves:false };
  }

  // ═══ 시나리오 C: 정상 성공 경로 보존 (용량 여유, idle+walk 둘 다 성공) ═══
  {
    // baseline (무후보)
    const b1={...texAllOK,log:[]}; const s1=factory(b1);
    prefill(s1,0,5,100); prefill(s1,1,5,200);
    const i1=qIdle(s1,TEST_IDLE), w1=qWalk(s1,TEST_WALK);
    const base={ idleOK:i1, walkOK:w1, total:s1.getTotal(), b0:s1.getCount(0), b8:s1.getCount(8), countSum:s1.countSum() };
    const d1=runDraw(s1,b1);
    // candidate (rollback/precheck 로직 적용: walk 성공이므로 동일해야 함)
    const b2={...texAllOK,log:[]}; const s2=factory(b2);
    prefill(s2,0,5,100); prefill(s2,1,5,200);
    const remain=s2.ENS8_GL_MAX - s2.getTotal();
    let i2=false,w2=false,rb=false;
    if(remain>=2){ i2=qIdle(s2,TEST_IDLE); w2=qWalk(s2,TEST_WALK); if(i2&&!w2){s2.setCount(0,s2.getCount(0)-1);s2.setTotal(s2.getTotal()-1);rb=true;} }
    const cand={ idleOK:i2, walkOK:w2, rolledBack:rb, total:s2.getTotal(), b0:s2.getCount(0), b8:s2.getCount(8), countSum:s2.countSum() };
    const d2=runDraw(s2,b2);
    R.scen.C_normal={ base, cand, baseDrawn:d1.drawn, candDrawn:d2.drawn,
      baseTestDrawn:{idle:d1.drawnSentinels.includes(TEST_IDLE),walk:d2.drawnSentinels.includes(TEST_WALK)} };
  }
}

// 2D body gate(현행 원문): 일반 적 경로 `if(_a8){ idle; if(_isMoving&&_mHasW&&_mW.ready) walk }` — !_ensGLQueued 가드 없음.
// walk 에셋 준비됨(용량 거절이지 부재 아님) → 2D는 idle+walk 모두 그린다. ensGLMode는 2D 본체 분기에 영향 없음(현행).
// 합산 = GL(실제 draw 결과) + 2D(현행 게이트). 이 게이트는 source를 읽어 모델링했고 실행은 GL측만 실제다.
function sumFor(scen){
  const idleGL = scen.testIdleDrawnGL?1:0;
  const walkGL = scen.testWalkDrawnGL?1:0;
  const idle2D = 1, walk2D = 1;   // 현행 무가드 + walk 에셋 준비
  return { totalIdle:idleGL+idle2D, totalWalk:walkGL+walk2D };
}

// ── 검증 그룹 ──
const gh=perFile['game.html'].ex, ge=perFile['game-easy-test.html'].ex;
check('EX-queue-draw-slice-identical', ()=>{ expect(gh.queueSha===ge.queueSha,'queue 동일'); expect(gh.drawSha===ge.drawSha,'draw 동일'); });
check('EX-constants', ()=>{ eq(gh.ENS_GL_MAX,512,'ENS_GL_MAX'); eq(gh.ENS8_GL_MAX,1024,'ENS8_GL_MAX'); eq(gh.GROUPS,16,'GROUPS'); eq(gh.STRIDE,9,'STRIDE'); });

for(const file of files){
  const S=perFile[file].scen, tag=file==='game.html'?'G':'E';

  // A-current: idle 성공·walk 전역한도 거절, count/total 잔류, 실제 draw가 잔류 idle을 출력 + prefix 보존
  check(`A-current-residual-draws-idle[${tag}]`, ()=>{
    const a=S.A_current;
    expect(a.idleOK===true && a.walkOK===false, 'idle성공 walk전역거절');
    eq(a.beforeTotal, 1023, '큐 전 전역 잔여1(total=1023)');
    eq(a.afterIdleTotal, 1024, 'idle 큐 후 total=1024(포화)');
    eq(a.afterIdleB0, 4, 'idle 큐 후 bucket0=4');
    eq(a.total, 1024, '큐 후 total');
    eq(a.countSum, 1024, 'countSum==total');
    eq(a.b0, 4, 'bucket0 잔류(3+1)'); eq(a.b8, 0, 'walk 버킷 미기록');
    eq(a.b0Instanced, 4, '실제 draw bucket0 4개 instanced');
    expect(a.testIdleDrawnGL===true, '실제 draw가 잔류 test idle 출력');
    expect(a.testWalkDrawnGL===false, 'test walk GL 미출력');
    expect(a.prefixDrawn===true, '유효 prefix 1000~1002 출력');
  });
  // A-current 합산: idle 이중(2), walk 1 — 잔류 GL idle + 2D idle
  check(`A-current-sum-double-idle[${tag}]`, ()=>{
    const s=sumFor(S.A_current); eq(s.totalIdle,2,'idle 합산(이중)'); eq(s.totalWalk,1,'walk 합산');
  });

  // A-rollback: 실제 count/total 복원 → draw가 잔류 idle 미출력, prefix·타버킷 보존, 이 개체 2D 1회
  check(`A-rollback-restores-queue[${tag}]`, ()=>{
    const a=S.A_rollback;
    expect(a.rolledBack===true, 'rollback 트리거');
    eq(a.total, 1023, 'total 복원'); eq(a.countSum, 1023, 'countSum==total 복원'); eq(a.b0, 3, 'bucket0 복원');
    expect(a.testIdleDrawnGL===false, '실제 draw가 잔류 idle 미출력(진짜 복원)');
    expect(a.prefixDrawn===true, '유효 prefix 보존·출력');
    eq(a.b1,511,'bucket1 보존'); eq(a.b2,509,'bucket2 보존');
    expect(a.b1Drawn&&a.b2Drawn, '타 버킷 정상 출력');
    same(a.bufPrefix,[1000,1001,1002],'버퍼 prefix 슬롯 보존');
  });
  check(`A-rollback-sum-one[${tag}]`, ()=>{
    const s=sumFor(S.A_rollback); eq(s.totalIdle,1,'idle 합산 1(2D만)'); eq(s.totalWalk,1,'walk 합산 1(2D만)');
  });

  // A-precheck: idle 아예 미큐 → 잔류 없음, prefix 보존, 이 개체 2D 1회
  check(`A-precheck-no-residual[${tag}]`, ()=>{
    const a=S.A_precheck;
    expect(a.willQueueGL===false, '잔여1<2 → GL 미큐'); expect(a.idleOK===false,'idle 미큐');
    eq(a.total,1023,'total 불변'); eq(a.b0,3,'bucket0 불변');
    expect(a.testIdleDrawnGL===false,'잔류 없음'); expect(a.prefixDrawn===true,'prefix 보존');
    same(a.bufPrefix,[1000,1001,1002],'버퍼 prefix 보존');
  });
  check(`A-precheck-sum-one[${tag}]`, ()=>{
    const s=sumFor(S.A_precheck); eq(s.totalIdle,1,'idle 1'); eq(s.totalWalk,1,'walk 1');
  });

  // B: 큐 성공했으나 실제 draw에서 walk 텍스처 실패로 walk 버킷 건너뜀 → walk GL 미출력. 큐시점 후보 미해결.
  check(`B-walk-tex-fail-draw-skips[${tag}]`, ()=>{
    const b=S.B_walkTexFail;
    expect(b.idleOK&&b.walkOK, '큐는 둘 다 성공'); eq(b.b8,1,'walk 버킷 큐됨');
    expect(b.testIdleDrawnGL===true,'idle 출력'); expect(b.testWalkDrawnGL===false,'walk 텍스처 실패로 미출력');
    expect(b.getTexCalls.some(c=>c.img==='walk'&&c.ok===false),'_getTex walk 실패 기록');
    expect(b.queueTimeCandidateResolves===false,'큐시점 rollback/precheck 미해결 → FAIL/UNKNOWN 유지');
  });

  // C: 정상 성공 경로는 후보 적용 전후 동일 (count/total/draw 불변)
  check(`C-normal-path-equivalent[${tag}]`, ()=>{
    const c=S.C_normal;
    expect(c.base.idleOK&&c.base.walkOK,'baseline 둘 다 성공');
    expect(c.cand.idleOK&&c.cand.walkOK&&c.cand.rolledBack===false,'후보도 둘 다 성공·롤백 없음');
    eq(c.base.total,c.cand.total,'total 동일'); eq(c.base.b0,c.cand.b0,'bucket0 동일');
    eq(c.base.b8,c.cand.b8,'walk 버킷 동일'); eq(c.base.countSum,c.cand.countSum,'countSum 동일');
    eq(c.baseDrawn,c.candDrawn,'draw 출력 수 동일');
  });
}

const endedAt=new Date().toISOString();
const fail=rows.filter(r=>r.status==='FAIL');
const out={
  taskId:'continuous/ANIMVFX/실제-queue-draw-부분실패-rollback',
  provider:'VS Code Claude (claude-native, continuous follow-up)',
  cwd:root, cwdRealpath:root,
  node:process.version, startedAt, endedAt,
  sourceSHA:{
    note:'파일 전체내용 sha256(현재 Read 시점). Git 미호출. 총괄 제공 commit은 독립 관측 HEAD로 표시하지 않음.',
    fileContent:Object.fromEntries(files.map(f=>[f, sha(readBuf(f))])),
    queueSlice:{ 'game.html':gh.queueSha, 'game-easy-test.html':ge.queueSha },
    drawSlice:{ 'game.html':gh.drawSha, 'game-easy-test.html':ge.drawSha },
    constSlice:{ 'game.html':gh.constSha, 'game-easy-test.html':ge.constSha },
    headInherited:'UNKNOWN (Git 미호출; COMMON 제공 commit 7e69495046323b3120578f67635c20feb48b2a4f 은 총괄 출처, 본 세션 독립 관측 아님)'
  },
  constants:{ ENS_GL_MAX:gh.ENS_GL_MAX, ENS8_GL_MAX:gh.ENS8_GL_MAX, GROUPS:gh.GROUPS, STRIDE:gh.STRIDE,
    buckets:'idle 0-7 / walk 8-15', band:'GL=호출/bufferSubData 구간 기록, _getTex=ready/fail, _flush=noop, 2D gate=source 모델링' },
  summary:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length },
  productionApplied:false,
  disclaimer:'source fixture PASS ≠ GPU/runtime/visual PASS. 실제 GL 부트/업로드/픽셀 미검수.',
  rows,
  scenarios:perFile
};
// 큰 ex 원문 제거(보고 간결)
for(const f of files){ delete out.scenarios[f].ex.queueSrc; delete out.scenarios[f].ex.drawSrc; delete out.scenarios[f].ex.constSrc; }
process.stdout.write(JSON.stringify(out,null,2)+'\n');
process.exit(fail.length?1:0);
