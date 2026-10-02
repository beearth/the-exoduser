// ANIMVFX native-partial-walk-queue-fixture
// 목적: idle 큐 성공 후 walk 큐 실패를 실제 source 함수 + 최소 fixture로 재현한다.
// 경계: 읽기 전용. 브라우저/GPU/픽셀/네트워크/Git쓰기 없음. 실제 게임 인수 아님.
// 실제 _queueEnemy8DirInstanced 원문을 추출해 주입 상태에서 실행하고,
// _prepEnemyInstanced(큐 순서/walk 반환 무시/_ensGLMode=1)·_drawEnemy8DirInstanced(버킷별 tex skip)·
// 2D body guard(현행 무가드 vs !_ensGLQueued 후보 vs precheck/rollback 후보)를 모델링한다.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const sha = v => crypto.createHash('sha256').update(v).digest('hex');
const readBuf = p => fs.readFileSync(root + '/' + p);
const read = p => fs.readFileSync(root + '/' + p, 'utf8');
const executionStartedAt = new Date().toISOString();

const rows = [];
function check(id, action){ try{ action(); rows.push({id,status:'PASS'}); }catch(e){ rows.push({id,status:'FAIL',reason:e.message}); } }
function expect(v, reason){ if(!v) throw new Error(reason); }
function eq(a,b,reason){ if(a!==b) throw new Error(`${reason}: got ${a} want ${b}`); }

// ── 읽기 전용 Git 스냅샷 (개수/HEAD 기록만, 쓰기 없음) ──
function gitSnapshot(){
  const head = spawnSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'});
  const status = spawnSync('git',['status','--short','--untracked-files=all'],{cwd:root,encoding:'utf8'});
  return { observedAt:new Date().toISOString(),
    head: head.status===0?head.stdout.trim():null,
    changes: status.status===0?status.stdout.split('\n').filter(Boolean).length:null };
}
const startSnapshot = gitSnapshot();

// ── 입력 파일 해시 (원격 SHA 재검증은 총괄 단계) ──
const files = ['game.html','game-easy-test.html'];
const fileSha = Object.fromEntries(files.map(f=>[f, sha(readBuf(f))]));

// ── 실제 source 추출: 용량 상수 + _queueEnemy8DirInstanced 원문 ──
function extract(fileText){
  const mMax   = fileText.match(/const _ENS_GL_MAX=(\d+),_ENS_GL_STRIDE=(\d+);/);
  const mGroups= fileText.match(/const _ENS8_GL_GROUPS=(\d+);/);
  const mG8Max = fileText.match(/const _ENS8_GL_MAX=([^;]+);/);
  const mFn    = fileText.match(/function _queueEnemy8DirInstanced\(bucket,img,sx,sy,sw,sh,x,y,dw,dh,alpha\)\{[\s\S]*?\n\}/);
  expect(mMax && mGroups && mG8Max && mFn, 'source 추출 실패');
  const constSrc = `const _ENS_GL_MAX=${mMax[1]},_ENS_GL_STRIDE=${mMax[2]};const _ENS8_GL_GROUPS=${mGroups[1]};const _ENS8_GL_MAX=${mG8Max[1]};`;
  return {
    constSrc, fnSrc: mFn[0],
    ENS_GL_MAX: Number(mMax[1]), STRIDE: Number(mMax[2]),
    GROUPS: Number(mGroups[1]), ENS8_GL_MAX: eval(mG8Max[1].replace('_ENS_GL_MAX', mMax[1])),
    sliceSha: sha(constSrc + '\n' + mFn[0])
  };
}

// 실제 원문 함수를 주입 상태 위에서 실행하는 인스턴스 생성
function makeState(ex){
  const factory = new Function(`
    ${ex.constSrc}
    let _ens8GLTotal=0;
    const _ens8GLCounts=new Uint16Array(_ENS8_GL_GROUPS);
    const _ens8GLImgs=new Array(_ENS8_GL_GROUPS);
    const _ens8GLCpu=new Float32Array(_ENS8_GL_GROUPS*_ENS_GL_MAX*_ENS_GL_STRIDE);
    ${ex.fnSrc}
    return {
      queue:_queueEnemy8DirInstanced,
      setTotal:v=>{_ens8GLTotal=v}, getTotal:()=>_ens8GLTotal,
      setCount:(b,v)=>{_ens8GLCounts[b]=v}, getCount:b=>_ens8GLCounts[b],
      imgs:()=>_ens8GLImgs
    };
  `);
  return factory();
}

// ── 고정 fixture (이전 팀 fixture와 연속: e=(340,420), r=20) ──
const idleImg = {width:2048,height:1280};   // atlas_ch1_8dir (idle)
const walkImg = {width:8192,height:1280};    // atlas_ch1_8dir_walk
const e = { x:340, y:420, r:20, _mob8Col:1, _mob8Row:3, _walkDist:200, _isMoving:true };
const CELL = 256, VW = 1280, VH = 800, CAM = {x:100,y:200};
const baseSz = Math.max(e.r*7, 80);                   // 140
const idleBucket = 0;                                  // south
const walkBucket = 8 + idleBucket;                     // 8
const sa = 1;
const qx = VW*0.5 + (e.x - CAM.x), qy = VH*0.5 + (e.y - CAM.y); // prep의 x,y 인자

// _prepEnemyInstanced 재현: idle 큐 → (조건) walk 큐 → walk 반환 무시 → idle 성공이면 _ensGLMode=1
function prep(st, {walkReady=true}){
  const idleOK = st.queue(idleBucket, idleImg, e._mob8Col*CELL, e._mob8Row*CELL, CELL, CELL, qx, qy, baseSz, baseSz, sa);
  let walkCalled=false, walkOK=false;
  if(idleOK){
    // prep 실제 조건: e._isMoving && walkDirs && walkMeta._idxSet.has(_mIdx) && _mW.ready
    const walkRequired = e._isMoving; // 이동 중 + walk 에셋 보유 가정
    if(walkRequired && walkReady){
      walkCalled=true;
      const mwf=4, frame=Math.trunc((e._walkDist||0)/128)%mwf;
      walkOK = st.queue(walkBucket, walkImg, (e._mob8Col*mwf+frame)*CELL, e._mob8Row*CELL, CELL, CELL, qx, qy, baseSz, baseSz, sa);
    }
    // 원문: walk 반환값(walkOK)은 저장/확인되지 않음. idle 성공이면 무조건 mode=1.
    return { idleOK, walkCalled, walkOK, ensGLMode: 1 };
  }
  return { idleOK, walkCalled:false, walkOK:false, ensGLMode: 0 };
}

// _drawEnemy8DirInstanced 재현: 버킷별 cnt>0 && img && tex 있으면 그림 (tex 실패 시 continue)
function drawGL(st, texOK){
  const idleCnt = st.getCount(idleBucket), walkCnt = st.getCount(walkBucket);
  const imgs = st.imgs();
  const idleDrawn = idleCnt>0 && !!imgs[idleBucket] && texOK.idle ? 1 : 0;
  const walkDrawn = walkCnt>0 && !!imgs[walkBucket] && texOK.walk ? 1 : 0;
  return { idleDrawn, walkDrawn };
}

// 2D body guard 정책별 2D 렌더 결정 (일반 적 경로, _a8 ready 가정)
// 원문 2D 경로: idle은 항상, walk는 e._isMoving && _mHasW && _mW.ready 일 때만 drawImage.
// 따라서 walk 에셋 미준비(C3)면 현행 2D도 walk를 그리지 않는다.
function body2D(policy, ensGLMode, walkAssetReady){
  // 현행: if(_a8){...} — _ensGLQueued 무가드 / guard·precheck·rollback: _ensGLMode=1이면 2D 전량 skip
  const skipAll = (policy==='guard' || policy==='precheck' || policy==='rollback') && ensGLMode===1;
  if(skipAll) return { idle2D:0, walk2D:0 };
  return { idle2D:1, walk2D: walkAssetReady?1:0 };
}

// 불변조건 집계: idle/walk 몸체가 GL+2D 합산 정확히 1회.
// walkDropped(실제결함)은 walk 에셋이 준비됐는데(=그릴 프레임 존재) 합산 0인 경우만 — C3의 정당한 부재와 구분.
function tally(gl, two, walkAssetReady){
  const totalIdle = gl.idleDrawn + two.idle2D;
  const totalWalk = gl.walkDrawn + two.walk2D;
  return { totalIdle, totalWalk,
    doubleRender: totalIdle>1 || totalWalk>1,
    walkDropped: walkAssetReady && totalWalk===0 };
}

// 4개 케이스를 각 정책으로 평가
const caseDefs = [
  { id:'C1-capacity-remain1', walkAssetReady:true, setup(st,ex){ st.setTotal(ex.ENS8_GL_MAX-1); return {walkReady:true}; },
    note:'전역 _ens8GLTotal=_ENS8_GL_MAX-1. idle 큐로 포화→walk 큐 전역한도 차단 (walk 에셋 준비됨)' },
  { id:'C2-walk-bucket-full', walkAssetReady:true, setup(st,ex){ st.setCount(walkBucket, ex.ENS_GL_MAX); return {walkReady:true}; },
    note:'walk 버킷(8+dir) _ens8GLCounts=_ENS_GL_MAX. idle 버킷 정상, walk 버킷별한도 차단 (walk 에셋 준비됨)' },
  { id:'C3-walk-not-ready', walkAssetReady:false, setup(st,ex){ return {walkReady:false}; },
    note:'_mW.ready/_idxSet 미충족. walk 큐 미호출 + 2D도 미그림 → walk 프레임 자체 부재(정당)' },
  { id:'C4-draw-tex-fail', walkAssetReady:true, setup(st,ex){ return {walkReady:true, drawTexWalk:false}; },
    note:'idle+walk 모두 큐 성공하나 draw 시 walk 버킷 _getTex=null → continue (walk 에셋 준비됨)' },
];
const policies = ['current','guard','precheck','rollback'];
const matrix = [];

for(const file of files){
  const ex = extract(read(file));
  for(const cd of caseDefs){
    for(const policy of policies){
      // 상태 초기화 (정책별로 독립 상태)
      const st = makeState(ex);
      const opts = cd.setup(st, ex) || {};
      const texWalk = opts.drawTexWalk!==false;

      // prep (큐). precheck/rollback은 prep 결과를 보정한다.
      let p = prep(st, { walkReady: opts.walkReady });

      // 정책별 큐-시점 보정
      if(p.idleOK && p.ensGLMode===1){
        const walkMissing = (p.walkCalled && !p.walkOK) /*C1,C2*/ || (opts.walkReady && !p.walkCalled)/*n/a*/;
        if(policy==='precheck' && walkMissing){
          // 사전확인: walk 필수인데 큐 못하면 GL 포기 → idle 큐 롤백 + mode=0 (전량 2D)
          p = { ...p, ensGLMode:0, rolledBack:true };
        }
        if(policy==='rollback' && walkMissing){
          // 동일객체 rollback: idle 큐 취소 → mode=0 (전량 2D)
          p = { ...p, ensGLMode:0, rolledBack:true };
        }
      }

      // draw: 정책이 rollback/precheck로 mode=0이면 GL 미그림 (전량 2D)
      const texOK = { idle:true, walk: texWalk };
      const gl = (p.ensGLMode===1) ? drawGL(st, texOK) : { idleDrawn:0, walkDrawn:0 };
      const two = body2D(policy, p.ensGLMode, cd.walkAssetReady);
      const t = tally(gl, two, cd.walkAssetReady);

      matrix.push({ file, case:cd.id, policy, walkAssetReady:cd.walkAssetReady,
        idleOK:p.idleOK, walkCalled:p.walkCalled, walkOK:p.walkOK, ensGLMode:p.ensGLMode,
        rolledBack:!!p.rolledBack,
        idleGL:gl.idleDrawn, walkGL:gl.walkDrawn, idle2D:two.idle2D, walk2D:two.walk2D,
        totalIdle:t.totalIdle, totalWalk:t.totalWalk,
        doubleRender:t.doubleRender, walkDropped:t.walkDropped });
    }
  }
}

// ── 검증 그룹 ──
const gh = extract(read('game.html'));
const ge = extract(read('game-easy-test.html'));

check('EX-source-slice-identical', ()=> expect(gh.sliceSha===ge.sliceSha, 'queue 함수 원문 두 HTML 동일'));
check('EX-capacity-constants', ()=>{ eq(gh.ENS_GL_MAX,512,'ENS_GL_MAX'); eq(gh.ENS8_GL_MAX,1024,'ENS8_GL_MAX'); eq(gh.GROUPS,16,'GROUPS'); });

// 핵심 재현: idle 성공 + walk 실패 (C1~C3은 walkOK=false/미호출, C4는 walkOK=true지만 draw 실패)
check('REPRO-C1-idle-ok-walk-globalcap', ()=>{
  const r = matrix.find(m=>m.file==='game.html'&&m.case==='C1-capacity-remain1'&&m.policy==='current');
  expect(r.idleOK===true && r.walkCalled===true && r.walkOK===false, 'C1 idle성공 walk전역한도실패');
});
check('REPRO-C2-idle-ok-walk-bucketfull', ()=>{
  const r = matrix.find(m=>m.file==='game.html'&&m.case==='C2-walk-bucket-full'&&m.policy==='current');
  expect(r.idleOK===true && r.walkCalled===true && r.walkOK===false, 'C2 idle성공 walk버킷포화실패');
});
check('REPRO-C3-idle-ok-walk-notready', ()=>{
  const r = matrix.find(m=>m.file==='game.html'&&m.case==='C3-walk-not-ready'&&m.policy==='current');
  expect(r.idleOK===true && r.walkCalled===false && r.walkOK===false, 'C3 idle성공 walk미호출');
});
check('REPRO-C4-idle-ok-walk-queued-drawfail', ()=>{
  const r = matrix.find(m=>m.file==='game.html'&&m.case==='C4-draw-tex-fail'&&m.policy==='current');
  expect(r.idleOK===true && r.walkCalled===true && r.walkOK===true && r.walkGL===0, 'C4 walk큐성공·draw실패');
});

// 현행(무가드): 모든 케이스에서 idle 이중 렌더(GL idle + 2D idle). walk 실제누락은 없음(2D가 보행 담당)
check('INV-current-double-render', ()=>{
  const cur = matrix.filter(m=>m.policy==='current');
  for(const m of cur){ expect(m.doubleRender===true && m.walkDropped===false, `${m.file}/${m.case} 현행 idle 이중렌더`); }
});
// guard(foot-shadow 미적용 후보): C1/C2/C4는 walk 에셋 준비됐는데 누락 — ANIM57이 놓친 반례. C3은 에셋부재라 정당(클린)
check('INV-guard-dropsWalk-C1C2C4', ()=>{
  const g = matrix.filter(m=>m.policy==='guard' && m.case!=='C3-walk-not-ready');
  for(const m of g){ expect(m.walkDropped===true && m.doubleRender===false, `${m.file}/${m.case} guard 보행누락 반례`); }
});
check('INV-guard-clean-C3', ()=>{
  const g = matrix.filter(m=>m.policy==='guard' && m.case==='C3-walk-not-ready');
  for(const m of g){ expect(m.doubleRender===false && m.walkDropped===false, `${m.file}/${m.case} guard C3 클린(에셋부재 정당)`); }
});
// precheck/rollback: C1/C2(큐시점 실패 감지→전량2D)와 C3(에셋부재)은 불변조건 충족. C4(draw실패)는 큐시점 후보로 미해결
check('INV-precheck-rollback-clean-C1C2C3', ()=>{
  const r = matrix.filter(m=>(m.policy==='precheck'||m.policy==='rollback') && m.case!=='C4-draw-tex-fail');
  for(const m of r){ expect(m.doubleRender===false && m.walkDropped===false, `${m.file}/${m.case}/${m.policy} 불변조건충족`); }
});
check('INV-precheck-rollback-C4-unresolved', ()=>{
  const r = matrix.filter(m=>(m.policy==='precheck'||m.policy==='rollback') && m.case==='C4-draw-tex-fail');
  // C4는 walk 큐가 성공하므로 큐-시점 감지 불가 → guard와 동일하게 보행 누락. draw-시점 처리가 필요함을 명시
  for(const m of r){ expect(m.walkDropped===true, `${m.file}/${m.case}/${m.policy} C4 큐시점후보 미해결`); }
});

const endSnapshot = gitSnapshot();
const fail = rows.filter(r=>r.status==='FAIL');
const out = {
  task:'native-partial-walk-queue-fixture', team:'ANIMVFX', provider:'claude-native-6',
  executionStartedAt, executionEndedAt:new Date().toISOString(),
  node:process.version,
  fileSha, sliceSha:{ 'game.html':gh.sliceSha, 'game-easy-test.html':ge.sliceSha },
  startSnapshot, endSnapshot,
  summary:{ total:rows.length, pass:rows.filter(r=>r.status==='PASS').length, fail:fail.length },
  rows, matrix
};
process.stdout.write(JSON.stringify(out, null, 2) + '\n');
process.exit(fail.length ? 1 : 0);
