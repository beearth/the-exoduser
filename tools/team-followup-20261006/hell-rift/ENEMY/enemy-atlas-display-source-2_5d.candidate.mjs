// ════════════════════════════════════════════════════════════════════════
//  enemy-atlas-display-source-2_5d.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-ENEMY-ATLAS-DISPLAY-CANDIDATE
//  배정: TASK CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006 (ROLE ENEMY)
//
//  UNIT1 — 기존 일반몹 _ch8Atlas / 8dir draw / walk metadata에서 실제 sprite
//          cell/crop/approved-asset-source 매핑 producer (순수 crop 수학).
//  UNIT2 — readonly atlas/frame crop + foot/display 계약을 root renderer에 제공.
//          atlas/provider 부재 → UNKNOWN/fallback-2d (fail-closed). 가짜 연결 PASS 0.
//  경계 — 보스 다크드루이드(e.ib / _drawDruidBoss)는 BOSS 소유 → 제외(겹침 0).
//         facing→dir 변환은 game `_mobFacingDir8` 소유 → 여기서 재구현/22.5° seam 반례 반복 0.
//  금지 — 새 asset/rig/AI/spawn/collider/수치 0. 이미지 로드·화면 관찰 0(= UNKNOWN).
//
//  ── 근거 source (game.html, 실제 read·인용) ──────────────────────────────
//   atlas 로드/구조 `_load8DirAtlas` @22277: a={dirs:{dk:{img,ready}}, meta, mobList, mobIdx,
//     walkDirs:{dk:{img,ready}}, walkMeta}; meta=JSON{mobs:{skin:{col,row}}, cell}; walkMeta=JSON{mobs:{skin:{idx}}, framesPerMob, _idxSet}.
//   dir 이름/키 @22274-22275: _8DIR_NAMES(파일명, 밑줄) / _8DIR_KEYS(내부키, 하이픈) — RIG/_ENS8_GL_DIRS 순서.
//   asset 경로 @22284/22312/22289/22317: img/atlas_ch{N}_8dir_{name}.png · _8dir_walk_{name}.png · _8dir.json · _8dir_walk.json
//   idle crop @19103/5187: (col*cell, row*cell, cell, cell)  cell=meta.cell.
//   walk crop/게이트 @5189-5191 / 19112-19115: 가용 = walkMeta._idxSet.has(row*COLS+col);
//     frame=~~(walkDist/128)%framesPerMob; sx=(col*framesPerMob+frame)*cell, sy=row*cell.
//   display @5187: baseSz=Math.max(e.r*7,80);  foot/shadow @5195: (e.x, e.y+e.r*0.35);  COLS _MOB8_COLS=8 @22213.
//   보스 분리: 일반몹 `_mob8dir && !e.ib`; 보스는 `_drawDruidBoss` 별도 @10477.
//
//  이 파일 1개만 소유. 추가 report/harness/backup/temp/asset 0. raw17 d2657041 불변.
//  보호 2_3/Q-only magic·blackBean(E불가)/어택티켓 금지/기존23/사용자 save 유지.
// ════════════════════════════════════════════════════════════════════════

export const DIR_KEYS   = Object.freeze(['south','south-east','east','north-east','north','north-west','west','south-west']); // _8DIR_KEYS
export const DIR_NAMES  = Object.freeze(['south','south_east','east','north_east','north','north_west','west','south_west']);  // _8DIR_NAMES (파일 접미)
export const MOB8_COLS  = 8;   // _MOB8_COLS @22213
export const WALK_FRAME_STRIDE = 128; // ~~(walkDist/128) @5191/19115

const _fin = (v, d = 0) => Number.isFinite(v) ? v : d;
const _dirIndex = (dir) => typeof dir === 'number' ? dir : DIR_KEYS.indexOf(dir);

// ── UNIT1: approved asset source 경로 매핑 (실제 로더가 쓰는 정확 경로) ────
export function atlasAssetPaths(chN){
  if(!Number.isInteger(chN) || chN < 1) return { kind:'unknown', reason:'bad-chapter' };
  const idle = {}, walk = {};
  DIR_NAMES.forEach((name, i) => {
    idle[DIR_KEYS[i]] = `img/atlas_ch${chN}_8dir_${name}.png`;
    walk[DIR_KEYS[i]] = `img/atlas_ch${chN}_8dir_walk_${name}.png`;
  });
  return Object.freeze({
    kind:'atlas-source', chN,
    metaJson:`img/atlas_ch${chN}_8dir.json`, walkMetaJson:`img/atlas_ch${chN}_8dir_walk.json`,
    idleDirPng:Object.freeze(idle), walkDirPng:Object.freeze(walk),
    note:'approved 기존 에셋 경로만 — 새 생성 0, 로드는 root renderer 소유(여기선 경로 계약만).',
  });
}

// mob cell (col,row) — meta.mobs[skin] 우선, 없으면 UNKNOWN (seed 폴백은 game 소유, 여기서 추정 0)
export function resolveMobCell(meta, skin){
  if(!meta || !meta.mobs || !meta.mobs[skin]) return null; // UNKNOWN: 메타 미로드/미지 skin
  const m = meta.mobs[skin];
  if(!Number.isInteger(m.col) || !Number.isInteger(m.row)) return null;
  return { col:m.col, row:m.row, idx:m.row * MOB8_COLS + m.col };
}

// ── UNIT2: frame crop 계약 (root renderer가 meta/walkMeta 주입) ───────────
//   atlas/provider 부재 → fail-closed. 이미지 ready 여부는 root가 판단(여기선 수학만).
export function idleFrameCrop(chN, meta, skin, dir){
  const cell = meta && Number.isFinite(meta.cell) ? meta.cell : null;
  const cell0 = resolveMobCell(meta, skin);
  const di = _dirIndex(dir);
  if(cell == null || !cell0 || di < 0 || di > 7) return { kind:'unknown', reason: cell==null?'meta-unloaded':(!cell0?'unknown-skin':'bad-dir') };
  return Object.freeze({
    kind:'atlas-frame', mode:'idle', dirKey:DIR_KEYS[di],
    asset:`img/atlas_ch${chN}_8dir_${DIR_NAMES[di]}.png`,
    sx:cell0.col*cell, sy:cell0.row*cell, sw:cell, sh:cell,
  });
}
export function walkFrameCrop(chN, meta, walkMeta, skin, dir, walkDist){
  const cell = meta && Number.isFinite(meta.cell) ? meta.cell : null;
  const cell0 = resolveMobCell(meta, skin);
  const di = _dirIndex(dir);
  if(cell == null || !cell0 || di < 0 || di > 7) return { kind:'unknown', reason:'meta-unloaded' };
  // 걷기 가용 게이트: walkMeta._idxSet.has(row*COLS+col) (source @5189-5190). 없으면 idle 폴백.
  const avail = !!(walkMeta && walkMeta._idxSet && typeof walkMeta._idxSet.has === 'function' && walkMeta._idxSet.has(cell0.idx));
  if(!avail) return idleFrameCrop(chN, meta, skin, dir); // 걷기 프레임 미제공 → idle (가짜 걷기 0)
  const fpm = Number.isInteger(walkMeta.framesPerMob) && walkMeta.framesPerMob > 0 ? walkMeta.framesPerMob : 4;
  const frame = ((Math.floor(_fin(walkDist) / WALK_FRAME_STRIDE) % fpm) + fpm) % fpm;
  return Object.freeze({
    kind:'atlas-frame', mode:'walk', dirKey:DIR_KEYS[di], frame, framesPerMob:fpm,
    asset:`img/atlas_ch${chN}_8dir_walk_${DIR_NAMES[di]}.png`,
    sx:(cell0.col*fpm + frame)*cell, sy:cell0.row*cell, sw:cell, sh:cell,
  });
}

// foot/display 계약 (비유한 radius/pos fail-safe — 기존 2D 좌표 안 깨지게)
export function displayContract(e){
  const r = Math.max(0, _fin(e && e.r));
  return Object.freeze({
    sizePx: Math.max(r*7, 80),                 // _baseSz @5187
    foot: Object.freeze({ x:_fin(e && e.x), y:_fin(e && e.y) + r*0.35 }), // 그림자 baseline @5195
    anchor: Object.freeze({ x:0.5, y:1 }),     // bottom-center, rig anchor 정합
  });
}

// ── 통합 producer: root renderer 한 번 호출 → frame + display 또는 fail-closed ─
//   api = { chN, meta, walkMeta, skin, dir, mode, walkDist }
export function produceEnemyAtlasFrame(e, api = {}){
  if(e && e.ib) return { kind:'boss-excluded', reason:'dark-druid/boss = BOSS 소유' }; // 경계
  const { chN, meta, walkMeta, skin, dir, mode, walkDist } = api;
  if(!meta) return { kind:'fallback-2d', reason:'atlas-provider-unloaded' };            // UNKNOWN/fail-closed
  const frame = (mode === 'walk')
    ? walkFrameCrop(chN, meta, walkMeta, skin, dir, walkDist)
    : idleFrameCrop(chN, meta, skin, dir);
  if(frame.kind !== 'atlas-frame') return { kind:'fallback-2d', reason:frame.reason };
  return Object.freeze({ kind:'atlas-frame', ...frame, display: displayContract(e) });
}

// ── 자체검증 (mock meta — 이미지 로드/화면 0; 새 핵심 반례 = walk _idxSet 게이트) ─
export function verify(){
  const out=[]; const ok=(n,c,m='')=>out.push({n,pass:!!c,m});
  // mock: ch1, cell 48, mob 'ghoul' at col3,row2 (idx=2*8+3=19); walk 제공(idx19) framesPerMob4
  const meta={ cell:48, mobs:{ ghoul:{col:3,row:2}, wisp:{col:5,row:4} } };
  const walkMeta={ framesPerMob:4, _idxSet:new Set([19]) }; // ghoul(idx19)만 걷기 제공, wisp(idx37) 미제공

  // 1) idle crop = col*cell,row*cell (source @19103)
  const il=idleFrameCrop(1,meta,'ghoul','east');
  ok('idle-crop-math', il.kind==='atlas-frame'&&il.sx===3*48&&il.sy===2*48&&il.sw===48&&il.sh===48&&il.asset==='img/atlas_ch1_8dir_east.png',
     `sx${il.sx} sy${il.sy} ${il.asset}`);

  // 2) walk crop = (col*fpm+frame)*cell (source @5191); walkDist 300→frame=~~(300/128)%4=2
  const wk=walkFrameCrop(1,meta,walkMeta,'ghoul','south',300);
  ok('walk-crop-math', wk.kind==='atlas-frame'&&wk.mode==='walk'&&wk.frame===2&&wk.sx===(3*4+2)*48&&wk.sy===2*48&&wk.asset==='img/atlas_ch1_8dir_walk_south.png',
     `frame${wk.frame} sx${wk.sx} ${wk.asset}`);

  // 3) ★NEW 반례: walk 미제공 mob(wisp, idx37 ∉ _idxSet) 이동중 → idle 폴백(가짜 걷기 0)
  //    관찰: produce mode='walk' 인데 _idxSet.has(37)=false → idleFrameCrop 반환
  const wmiss=walkFrameCrop(1,meta,walkMeta,'wisp','east',500);
  ok('walk-idxset-gate-fallback', wmiss.kind==='atlas-frame'&&wmiss.mode==='idle'&&wmiss.sx===5*48,
     `observed mode=${wmiss.mode} (expected idle; wisp idx37 ∉ _idxSet) sx${wmiss.sx}`);

  // 4) UNKNOWN fail-closed: meta 미로드 / 미지 skin / 보스 제외 / provider 부재
  ok('unknown-meta', idleFrameCrop(1,null,'ghoul','east').kind==='unknown');
  ok('unknown-skin', idleFrameCrop(1,meta,'dragon','east').kind==='unknown');
  ok('boss-excluded', produceEnemyAtlasFrame({ib:true},{chN:1,meta}).kind==='boss-excluded');
  ok('provider-unloaded-failclosed', produceEnemyAtlasFrame({},{chN:1}).kind==='fallback-2d');

  // 5) display 비유한 fail-safe (2D 좌표 안 깨짐); 유한은 그대로
  const dInf=displayContract({r:Infinity,x:10,y:20}), dOk=displayContract({r:16,x:10,y:20});
  ok('display-finite-safe', dInf.sizePx===80&&Number.isFinite(dInf.foot.y)&&dOk.sizePx===112&&Math.abs(dOk.foot.y-25.6)<1e-9,
     `inf→${dInf.sizePx}/${dInf.foot.y}  ok→${dOk.sizePx}/${dOk.foot.y}`);

  // 6) asset 경로 계약 (approved 기존 에셋만)
  const ap=atlasAssetPaths(1);
  ok('asset-paths', ap.kind==='atlas-source'&&ap.metaJson==='img/atlas_ch1_8dir.json'&&ap.idleDirPng.north==='img/atlas_ch1_8dir_north.png'&&ap.walkDirPng['south-east']==='img/atlas_ch1_8dir_walk_south_east.png',
     `${ap.idleDirPng.north} | ${ap.walkDirPng['south-east']}`);

  const pass=out.filter(c=>c.pass).length;
  return { pass, fail:out.length-pass, total:out.length, checks:out };
}

function _isMain(){ return (typeof process!=='undefined') && process.argv && process.argv[1] &&
  (import.meta.url===`file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].split('/').pop())); }
if(_isMain()){
  const r=verify();
  console.log('── CH1 2.5D ENEMY atlas-display source producer 검증 ──');
  for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.n}  ${c.m}`);
  console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
  console.log('보스 제외 / 새 asset·rig·AI·spawn 0 / 이미지로드·화면 0(=UNKNOWN) / walk _idxSet 게이트 반례 1');
  process.exit(r.fail?1:0);
}
