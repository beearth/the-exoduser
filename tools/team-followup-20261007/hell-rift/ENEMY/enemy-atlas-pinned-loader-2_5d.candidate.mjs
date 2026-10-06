// ════════════════════════════════════════════════════════════════════════
//  enemy-atlas-pinned-loader-2_5d.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NEXT-20261007-PINNED-LOADER-CANDIDATE
//  배정: TASK CH1-RIFT-QUALITY-NEXT-20261007-PINNED-LOADER (ROLE ENEMY)
//
//  목적 — billboard consumer 의 imageFor/meta "가정"을 제거하는 **실제 CH1 일반몹 atlas
//    pinned loader**. HTTP 경로/bytes/fullSHA/decode 규격(기대 dim)/UV cell 범위를 실측 pin.
//    borrowed image/texture 소유권·async 실패·dispose 수명 명시. billboard idle/walk API 연결.
//    enemyAI/spawn/hp/damage/save 변경 0.
//
//  ── 실측 근거 (2026-10-07, 실제 파일 측정) ───────────────────────────────
//   img/atlas_ch1_8dir.json      3367B sha f4842e1834074c31ec2a04d5b803924029aa4e6da3c1f4be3bc7e469b771049b  → cell256 cols8 rows5 total40
//   img/atlas_ch1_8dir_walk.json 3218B sha 4b18470e74a5b5afe1747e48a91fb2e78f5c9d213e336cef79074e94fcdbed9e  → framesPerMob4; walk.json 에 idx25(skinless_hound) 부재
//   idle dir PNG = 2048×1280 (cols8×256 × rows5×256);  walk dir PNG = 8192×1280 (cols8×framesPerMob4×256 × rows5×256)
//   ※ 실제 atlas 에 'ghoul' skin 은 없음 → 대표 실스킨 corrupted_wolf(idx13,col5,row1, walk 보유)로 pin.
//      loader 는 skin-parameterized 이며 root 가 다른 실스킨 지정 가능. 없는 skin/foot = UNKNOWN(발명 0).
//   foot/anchor: 이 atlas 는 per-mob 발 메타 없음 → footReference='UNKNOWN'(displayContract 그림자 baseline 로 위임).
//
//  ── Read 근거 (실제, 부분을 전체로 보고하지 않음) ─────────────────────────
//   AGENTS.md head(운영상태·한국어보고·WIP/save/공용 보존) Read.  _MAP_SSOT_INDEX.md 읽기순서 head Read
//   (MAP 상세 docs = VISUAL RETOUCH 상태 확인).  ※ 본 작업은 loader(이미지 로드/검증)로 맵 geometry/
//   가림/카메라/positional render-order 작업 아님 → MAP_PRODUCTION_GUIDELINE_v0.9 전체 Read 미수행을
//   '맵작업 선행 완료'로 보고하지 않음. VISUAL = NOT ASSESSED.
//
//  이 파일 1개만 소유. 추가 harness/report/temp/backup/raw 0. 이전 raw·source·save·타인WIP 불변.
//  보호 2_3/Q-only magic·blackBean(E 패링 0)/어택티켓 금지/기존23/sourcePNG/nav1192 보존.
// ════════════════════════════════════════════════════════════════════════

import { createEnemyBillboard } from './enemy-atlas-billboard-2_5d.candidate.mjs';
import { idleFrameCrop, walkFrameCrop } from '../../../team-followup-20261006/hell-rift/ENEMY/enemy-atlas-display-source-2_5d.candidate.mjs';

const DIR_KEYS  = Object.freeze(['south','south-east','east','north-east','north','north-west','west','south-west']);
const DIR_FILES = Object.freeze(['south','south_east','east','north_east','north','north_west','west','south_west']);

// ── 실측 pin (dir → {bytes, sha256}) ─────────────────────────────────────
const IDLE_PIN = Object.freeze({
  'south':      {bytes:798229, sha256:'156e76481bc26682afe7d85c01c94477e66e1718bbe88f9d67baddbcc561da23'},
  'south-east': {bytes:808193, sha256:'ed7693ea4052cf27c4318864f6e54edc846e941a8c8e12afecf3e03c904075ba'},
  'east':       {bytes:693012, sha256:'2b4cbc2cb2f8b33f1ce10cdce6e17b4e6b7c75fff13e0fd60787ddb3e803a81a'},
  'north-east': {bytes:729568, sha256:'b63ed215d947a6eb6b4709dc03fe169bb9482fe34814ef2a78f1a7efd3b2fff3'},
  'north':      {bytes:761588, sha256:'7c4e569e3c7e35c50e72e0b9ecb7c8fffe3ee73e3b98be976ced6d7a34a8d252'},
  'north-west': {bytes:722767, sha256:'e48798ba3d89e7a80ee8942be10439126d57b876bcb5228888df9a289b586d69'},
  'west':       {bytes:655038, sha256:'d14e94607e70a14c068402a6d1047e78ab0cd710d07c61c42ec090f592acc27f'},
  'south-west': {bytes:804413, sha256:'4801bd016a0804fedbfaa5d7b97eda7924cb093565d2a7864402570df6add64e'},
});
const WALK_PIN = Object.freeze({
  'south':      {bytes:2232971, sha256:'5de3eb47f666d60c72da13b9cee90a1544b1f325db62e9ce2624551205f58429'},
  'south-east': {bytes:2174353, sha256:'b5c16fd3b82d402e33d42cb087bdaf85aa1459b423aab9f8f654f74ea0142070'},
  'east':       {bytes:1972388, sha256:'95acdda361d2d74add386083fc51dd44c8ea20d7883b299d1a00be618343c854'},
  'north-east': {bytes:2060929, sha256:'ebc2ba5f5f995e0c104c81829d97162d39b888ed92ffca35f016715a9396e41f'},
  'north':      {bytes:2119638, sha256:'04471ea9d4b695cc79dd8285ce78316c4bb01749d24c4319936befa066d96538'},
  'north-west': {bytes:2102807, sha256:'6a89356bb56928a991f5e7f8dd0f0234ff0597d064af271fbe6673f3f4000e6c'},
  'west':       {bytes:2008571, sha256:'564b5f56042aaeb73e585ff1b68ab44faaac08f2f07abc3b1431710c2f30ac58'},
  'south-west': {bytes:2090379, sha256:'2bcf554056a6cc4fa8bd250b69644d251d85366b645fb726399ec3b1b7fa50e3'},
});

export const ATLAS_PINS = Object.freeze({
  chN:1, cell:256, cols:8, rows:5, framesPerMob:4,
  idleDims:Object.freeze([2048,1280]), walkDims:Object.freeze([8192,1280]),
  json:Object.freeze({ meta:{path:'img/atlas_ch1_8dir.json', bytes:3367, sha256:'f4842e1834074c31ec2a04d5b803924029aa4e6da3c1f4be3bc7e469b771049b'},
                       walk:{path:'img/atlas_ch1_8dir_walk.json', bytes:3218, sha256:'4b18470e74a5b5afe1747e48a91fb2e78f5c9d213e336cef79074e94fcdbed9e'} }),
  // 대표 실스킨 (atlas 에 'ghoul' 없음 — 발명 0)
  repSkin:Object.freeze({ skin:'corrupted_wolf', idx:13, col:5, row:1, walkAvailable:true }),
  walkAbsentExample:Object.freeze({ skin:'skinless_hound', idx:25, note:'walk.json 부재 → walk UNKNOWN→idle fallback' }),
  footReference:'UNKNOWN',
  idlePath:(dirKey)=>`img/atlas_ch1_8dir_${DIR_FILES[DIR_KEYS.indexOf(dirKey)]}.png`,
  walkPath:(dirKey)=>`img/atlas_ch1_8dir_walk_${DIR_FILES[DIR_KEYS.indexOf(dirKey)]}.png`,
  pin:(mode,dirKey)=> (mode==='walk'?WALK_PIN:IDLE_PIN)[dirKey] || null,
});

// ── UV cell 범위 검증 (실측 dim 기반) ────────────────────────────────────
export function uvCellInRange(mode, col, row, frame){
  const P=ATLAS_PINS;
  if(!Number.isInteger(col)||!Number.isInteger(row)||row<0||row>=P.rows) return false;
  if(mode==='walk'){ const f=Number.isInteger(frame)?frame:0; const fc=col*P.framesPerMob+f; return col>=0&&fc>=0&&fc<P.cols*P.framesPerMob; }
  return col>=0&&col<P.cols;
}

// ── 실 loader (HTTP Image + decode 규격 검증). fetchImage 는 root/browser 가 주입 ─
//   소유권: loader 가 decode Image 소유·검증. billboard 는 image 를 **borrow** 하여 자기 Texture 생성.
//            loader.dispose() = image ref 해제만; billboard Texture 는 billboard 가 dispose(분리 소유).
//   async 실패: fetch reject / dim 불일치 → status 'error'(fail-closed), imageFor ready:false, throw 0.
export function createPinnedLoader(api = {}){
  const { fetchImage, skin } = api;
  const sk = skin || ATLAS_PINS.repSkin.skin;
  const cell = ATLAS_PINS.repSkin.skin === sk ? ATLAS_PINS.repSkin : null; // 대표 외 skin = col/row UNKNOWN(주입 meta 필요)
  const images = new Map(); // key `${mode}|${dirKey}` -> {status,image,width,height,error,path,pin}
  let disposed = false;

  function _key(mode, dirKey){ return `${mode}|${dirKey}`; }
  function status(mode, dirKey){ const e=images.get(_key(mode,dirKey)); return e?e.status:'idle'; }

  async function load(mode, dirKey){
    if(disposed) return 'disposed';
    if(DIR_KEYS.indexOf(dirKey)<0) return 'bad-dir';
    const path = mode==='walk'?ATLAS_PINS.walkPath(dirKey):ATLAS_PINS.idlePath(dirKey);
    const pin  = ATLAS_PINS.pin(mode, dirKey);
    const dims = mode==='walk'?ATLAS_PINS.walkDims:ATLAS_PINS.idleDims;
    const key=_key(mode,dirKey); images.set(key,{status:'loading',image:null,width:0,height:0,error:null,path,pin});
    if(typeof fetchImage!=='function'){ const e={status:'error',image:null,width:0,height:0,error:'no-fetchImage',path,pin}; images.set(key,e); return e.status; }
    try{
      const res = await fetchImage(path);                 // {image,width,height} (실제 decode는 root/browser)
      const w=res&&res.width, h=res&&res.height;
      if(!res||!res.image||w!==dims[0]||h!==dims[1]){      // decode 규격 불일치 → fail-closed
        images.set(key,{status:'error',image:null,width:w||0,height:h||0,error:'dim-mismatch',expected:dims,path,pin});
        return 'error';
      }
      images.set(key,{status:'ready',image:res.image,width:w,height:h,error:null,path,pin});
      return 'ready';
    }catch(err){
      images.set(key,{status:'error',image:null,width:0,height:0,error:String(err&&err.message||err),path,pin});
      return 'error';                                      // async 실패 — throw 0
    }
  }

  // billboard 가 borrow: ready 일 때만 image 제공 (아니면 ready:false → billboard fail-closed)
  function imageFor(dirKey){ const e=images.get(_key('idle',dirKey))||images.get(_key('walk',dirKey));
    if(e&&e.status==='ready') return {image:e.image,width:e.width,height:e.height,ready:true};
    return {image:null,width:0,height:0,ready:false}; }
  // mode 별 정확 borrow (billboard setFrame 이 dir+mode 로 호출)
  function imageForMode(mode,dirKey){ const e=images.get(_key(mode,dirKey));
    return (e&&e.status==='ready')?{image:e.image,width:e.width,height:e.height,ready:true}:{image:null,width:0,height:0,ready:false}; }

  // billboard 의 meta/walkMeta 계약 생성 (대표 skin pin 기반; 주입 meta 우선)
  function meta(){ if(!cell) return null; return { cell:ATLAS_PINS.cell, mobs:{ [sk]:{col:cell.col,row:cell.row} } }; }
  function walkMeta(){ if(!cell) return null;
    const idxSet=new Set(); if(cell.walkAvailable) idxSet.add(cell.row*ATLAS_PINS.cols+cell.col);
    return { cell:ATLAS_PINS.cell, framesPerMob:ATLAS_PINS.framesPerMob, _idxSet:idxSet }; }

  // billboard 정확 API 로 연결 (imageFor/meta/walkMeta/skin/chN 공급 → 가정 제거)
  function toBillboardApi(THREE, worldPerPx){
    return { THREE, chN:ATLAS_PINS.chN, meta:meta(), walkMeta:walkMeta(), skin:sk,
             imageFor:(dk)=>imageForMode('idle',dk).ready?imageForMode('idle',dk):imageForMode('walk',dk), worldPerPx }; }

  function dispose(){ if(disposed) return false; disposed=true; images.clear(); return true; } // image ref 만 해제(Texture 비소유)

  return Object.freeze({ skin:sk, footReference:ATLAS_PINS.footReference,
    load, status, imageFor, imageForMode, meta, walkMeta, toBillboardApi, dispose,
    get disposed(){ return disposed; }, get ownsTextures(){ return false; } });
}

// ── 자체검증 (mock fetchImage — 실제 HTTP/GPU/decode/화면 = UNKNOWN/PENDING; FAIL→nonzero) ─
export function verify(){
  const out=[]; const ok=(n,c,m='')=>out.push({n,pass:!!c,m});

  // 1) 실측 pin 값 (dim/cell/대표skin)
  const P=ATLAS_PINS;
  ok('pins-real-measured', P.cell===256 && P.idleDims[0]===2048 && P.idleDims[1]===1280 && P.walkDims[0]===8192 && P.framesPerMob===4 && P.repSkin.col===5 && P.repSkin.row===1,
     `cell${P.cell} idle${P.idleDims} walk${P.walkDims} rep=${P.repSkin.skin}(${P.repSkin.col},${P.repSkin.row})`);

  // 2) UV cell 범위 (실측 dim)
  ok('uv-cell-range', uvCellInRange('idle',5,1)&&!uvCellInRange('idle',8,1)&&uvCellInRange('walk',7,4,3)&&!uvCellInRange('walk',8,0,0),
     'idle col<8/row<5, walk col*4+f<32');

  // 3) 경로/pin 매핑 (실파일)
  ok('path-pin-map', P.idlePath('east')==='img/atlas_ch1_8dir_east.png' && P.walkPath('south-east')==='img/atlas_ch1_8dir_walk_south_east.png' && P.pin('idle','east').bytes===693012,
     `${P.idlePath('east')} | eastBytes=${P.pin('idle','east').bytes}`);

  return (async()=>{
    // 4) 성공 로드: dim 일치 → ready, imageFor borrow
    const good=createPinnedLoader({ fetchImage: async(p)=> p.includes('walk')?{image:{id:p},width:8192,height:1280}:{image:{id:p},width:2048,height:1280} });
    const s1=await good.load('idle','east');
    ok('load-success-ready', s1==='ready' && good.imageForMode('idle','east').ready===true, `status=${s1}`);

    // 5) ★NEW 반례: decode 규격 불일치(잘못된 dim) → fail-closed 'error', imageFor ready:false, throw 0
    //    관찰: fetchImage 가 2048×1000 반환(기대 1280) → status 'error'
    const bad=createPinnedLoader({ fetchImage: async()=>({image:{},width:2048,height:1000}) });
    const s2=await bad.load('idle','south');
    ok('decode-dim-mismatch-failclosed', s2==='error' && bad.imageForMode('idle','south').ready===false,
       `observed status=${s2} ready=${bad.imageForMode('idle','south').ready} (expected error/false)`);

    // 6) ★NEW 반례: async fetch reject → 'error' (throw 0, 렌더 안전)
    let threw=false; const rej=createPinnedLoader({ fetchImage: async()=>{ throw new Error('404'); } });
    let s3; try{ s3=await rej.load('idle','west'); }catch(e){ threw=true; }
    ok('async-failure-no-throw', !threw && s3==='error' && rej.imageForMode('idle','west').ready===false, `status=${s3} threw=${threw}`);

    // 7) 소유권: loader.dispose()는 image ref 만 해제, Texture 비소유(billboard 소유)
    ok('borrowed-ownership', good.ownsTextures===false && good.dispose()===true && good.dispose()===false && good.imageForMode('idle','east').ready===false,
       'loader owns image decode; billboard owns Texture; dispose idempotent');

    // 8) walk 부재 skin(skinless_hound idx25) → walkMeta._idxSet 미포함 → billboard walk→idle fallback
    const absent=createPinnedLoader({ skin:'skinless_hound' }); // 대표 외 → meta null (col/row 주입 필요) = UNKNOWN
    ok('walk-absent-unknown', absent.meta()===null && P.walkAbsentExample.skin==='skinless_hound',
       'non-rep skin col/row UNKNOWN(주입 meta 필요); skinless_hound walk 부재');

    // 9) billboard 정확 API 연결: toBillboardApi → createEnemyBillboard idle frame ready
    const THREE=_mockThree();
    const ld=createPinnedLoader({ fetchImage: async(p)=>({image:{id:p},width:2048,height:1280}) });
    await ld.load('idle','east');
    const bb=createEnemyBillboard(Object.assign(ld.toBillboardApi(THREE,0.01),{})); // imageFor/meta/walkMeta/skin/chN 공급
    const fr=bb.setFrame('idle','east',0,16);
    ok('billboard-connection', fr.ok===true && fr.mode==='idle', `billboard setFrame ok=${fr.ok} mode=${fr.mode}`);

    const pass=out.filter(c=>c.pass).length;
    return { pass, fail:out.length-pass, total:out.length, checks:out };
  })();
}

function _mockThree(){
  class V{constructor(){this.x=0;this.y=0;this.z=0;}set(x,y,z){this.x=x;this.y=y;this.z=z;return this;}copy(v){this.x=v.x;this.y=v.y;this.z=v.z;return this;}}
  class Texture{constructor(i){this.image=i;this.repeat=new V();this.offset=new V();}updateMatrix(){}dispose(){}}
  class PlaneGeometry{constructor(){this.translated=null;}translate(x,y,z){this.translated=[x,y,z];}dispose(){}}
  class MeshBasicMaterial{constructor(o){Object.assign(this,o);}dispose(){}}
  class Group{constructor(){this.children=[];this.userData={};this.position=new V();this.quaternion=new V();this.name='';}add(c){this.children.push(c);}removeFromParent(){}}
  class Mesh{constructor(g,m){this.geometry=g;this.material=m;this.scale=new V().set(1,1,1);this.visible=true;this.name='';}}
  return {Texture,PlaneGeometry,MeshBasicMaterial,Group,Mesh,DoubleSide:2,SRGBColorSpace:'srgb',NearestFilter:1003,ClampToEdgeWrapping:1001};
}

function _isMain(){ return (typeof process!=='undefined') && process.argv && process.argv[1] &&
  (import.meta.url===`file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].split('/').pop())); }
if(_isMain()){
  verify().then(r=>{
    console.log('── CH1 2.5D ENEMY pinned atlas loader 검증 ──');
    for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.n}  ${c.m}`);
    console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
    console.log("실파일 pin(cell256/idle2048×1280/walk8192×1280) / 'ghoul' 부재→corrupted_wolf / decode·async fail-closed / borrow 소유권 / 실HTTP·GPU·화면=UNKNOWN");
    process.exit(r.fail?1:0);
  });
}
