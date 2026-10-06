// ════════════════════════════════════════════════════════════════════════
//  enemy-atlas-billboard-2_5d.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-NOW-20261007-BILLBOARD-CANDIDATE
//  배정: TASK CH1-RIFT-QUALITY-NOW-20261007-BILLBOARD (ROLE ENEMY)
//
//  UNIT1 — 기존 CH1 일반몹 1종을 실제 atlas/meta·cell 로 idle/walk Three 표시
//          (일반몹=리깅 없음 → 2D 아틀라스 프레임을 **카메라향 billboard quad** 로 표시).
//  UNIT2 — 발/크기·정렬/dispose·누락 fail-closed 실제 반례.
//  경계 — 보스(다크드루이드)는 BOSS 소유. 이 모듈은 produce 가 넘긴 일반몹 frame 전용.
//  금지 — 새 asset/rig/AI/spawn/collider/수치 0. 이미지 로드·실제 화면 관찰 0(= UNKNOWN).
//          positional render-order / 가림 / 맵 geometry 는 **root 단일 renderer 소유(후속 Gate)** — 미수행.
//
//  ── 읽기 전용 소비 (경로 매핑 반복 0) ────────────────────────────────────
//   crop/asset/display 계약은 기존 완료본에서 import (재구현/22.5° seam/walk-idx 반례 반복 0):
//     ../../../team-followup-20261006/hell-rift/ENEMY/enemy-atlas-display-source-2_5d.candidate.mjs
//   근거 source(game.html, 인용): idle crop (col*cell,row*cell,cell,cell) @19103; walk @5191;
//     baseSz=max(e.r*7,80) @5187; foot/shadow (x, y+r*0.35) @5195; 보스 분리 @10477.
//   rig API 형태(참조): tools/2_5d/character-rigs.mjs createCharacterRig 의 dispose/object3d 계약.
//
//  이 파일 1개만 소유. scratch/test/harness/report/temp/backup 0. raw24·source·save·타인WIP 불변.
//  보호 2_3/Q-only magic·blackBean(E 패링불가)/어택티켓 금지/기존23/사용자 save 유지.
// ════════════════════════════════════════════════════════════════════════

import { idleFrameCrop, walkFrameCrop, displayContract, atlasAssetPaths }
  from '../../../team-followup-20261006/hell-rift/ENEMY/enemy-atlas-display-source-2_5d.candidate.mjs';

export { atlasAssetPaths }; // 재노출(소비자 편의) — 신규 매핑 아님

// ── UNIT1/2: 일반몹 billboard (카메라향 quad, 발 접지, idle/walk) ──────────
//   api = { THREE, chN, meta, walkMeta, skin, imageFor(dirKey)->{image,width,height,ready}, worldPerPx }
//   THREE 부재 → throw (fail-closed). meta/이미지/보정 부재 → setFrame 이 {ok:false,reason} 반환.
export function createEnemyBillboard(api = {}){
  const { THREE, chN, meta, walkMeta, skin, imageFor, worldPerPx } = api;
  if(!THREE || !THREE.Texture || !THREE.PlaneGeometry || !THREE.MeshBasicMaterial || !(THREE.Mesh || THREE.Sprite) || !THREE.Group)
    throw new Error('THREE 2.5D 런타임 필요(Texture/PlaneGeometry/MeshBasicMaterial/Mesh/Group)'); // fail-closed

  const group = new THREE.Group(); group.name = `enemy-billboard-${skin || '?'}`;
  group.userData.billboard = true;                       // root 가 카메라 정렬(여기서 회전 소유 0)
  // 단위 평면: 중심→바닥(0) 이동 → 발이 group 원점. x 중심.
  const geometry = new THREE.PlaneGeometry(1, 1);
  if(geometry.translate) geometry.translate(0, 0.5, 0);  // bottom-center(foot) at origin
  const material = new THREE.MeshBasicMaterial({ transparent:true, depthWrite:false, side:THREE.DoubleSide, toneMapped:false });
  const mesh = new (THREE.Mesh || THREE.Sprite)(geometry, material);
  mesh.name = `${skin || '?'}-atlas-billboard`; mesh.frustumCulled = false; mesh.visible = false;
  group.add(mesh);

  const texturesByDir = new Map();   // dirKey -> THREE.Texture (per-dir atlas image)
  let disposed = false, state = Object.freeze({ ok:false, reason:'init' });

  function _texFor(dirKey, img){
    let tex = texturesByDir.get(dirKey);
    if(!tex){
      tex = new THREE.Texture(img.image);
      if('colorSpace' in tex && THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = false;
      if(THREE.NearestFilter){ tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter; }
      if(THREE.ClampToEdgeWrapping){ tex.wrapS = THREE.ClampToEdgeWrapping; tex.wrapT = THREE.ClampToEdgeWrapping; }
      tex.needsUpdate = true;
      texturesByDir.set(dirKey, tex);
    }
    return tex;
  }

  function setFrame(mode, dir, walkDist, sizeHint){
    if(disposed) return (state = Object.freeze({ ok:false, reason:'disposed' }));
    const crop = (mode === 'walk')
      ? walkFrameCrop(chN, meta, walkMeta, skin, dir, walkDist)
      : idleFrameCrop(chN, meta, skin, dir);
    if(crop.kind !== 'atlas-frame'){                       // meta 미로드/미지 skin/보스 등 → fail-closed
      mesh.visible = false; return (state = Object.freeze({ ok:false, reason:crop.reason || 'no-frame' }));
    }
    const img = typeof imageFor === 'function' ? imageFor(crop.dirKey) : null;
    if(!img || !img.ready || !Number.isFinite(img.width) || !Number.isFinite(img.height)){ // 누락/미준비 → fail-closed(반-초기화 0)
      mesh.visible = false; return (state = Object.freeze({ ok:false, reason:'image-not-ready', dirKey:crop.dirKey }));
    }
    if(!Number.isFinite(worldPerPx) || worldPerPx <= 0){   // 보정 미확인 → UNKNOWN(가짜 크기 0)
      mesh.visible = false; return (state = Object.freeze({ ok:false, reason:'calibration-required' }));
    }
    // UV: 아틀라스 셀 → 텍스처 repeat/offset (좌하 원점 보정)
    const tex = _texFor(crop.dirKey, img);
    tex.repeat.set(crop.sw / img.width, crop.sh / img.height);
    tex.offset.set(crop.sx / img.width, 1 - (crop.sy + crop.sh) / img.height);
    if(tex.updateMatrix) tex.updateMatrix();
    material.map = tex; material.needsUpdate = true;
    // 크기: displayContract.sizePx × worldPerPx (셀=정사각 → 정사각 quad). 발=bottom-center.
    const disp = displayContract({ r: Number.isFinite(sizeHint) ? sizeHint : 0 });
    const W = disp.sizePx * worldPerPx, H = W;             // baseSz 정사각
    if(mesh.scale && mesh.scale.set) mesh.scale.set(W, H, 1);
    mesh.visible = true;
    return (state = Object.freeze({ ok:true, mode: crop.mode, dirKey: crop.dirKey, frame: crop.frame ?? 0, worldSize:[W, H], footAtOrigin:true }));
  }

  // 발 접지: caller 가 group.position 을 적의 발 world(x, y+r*0.35)로 설정 (foot@origin 계약)
  function placeFoot(x, y){ if(group.position && group.position.set) group.position.set(x, y, 0); return group.position; }
  // 카메라향 정렬: root 가 camera quaternion 주입(여기서 render-order/가림 소유 0)
  function alignToCamera(camQuat){ if(camQuat && group.quaternion && group.quaternion.copy) group.quaternion.copy(camQuat); }

  function dispose(){                                       // 멱등 — 반-초기화/누락 경우에도 누수 0
    if(disposed) return false; disposed = true; mesh.visible = false;
    if(group.removeFromParent) group.removeFromParent();
    if(geometry.dispose) geometry.dispose();
    if(material.dispose) material.dispose();
    texturesByDir.forEach(t => t.dispose && t.dispose()); texturesByDir.clear();
    state = Object.freeze({ ok:false, reason:'disposed' });
    return true;
  }

  return Object.freeze({ object3d: group, mesh, setFrame, placeFoot, alignToCamera, dispose,
    get state(){ return state; }, get disposed(){ return disposed; } });
}

// ── 자체검증 (mock THREE — 이미지로드/화면 0; FAIL → nonzero) ──────────────
function _mockThree(){
  const log = { texDispose:0, geoDispose:0, matDispose:0, texCreated:0 };
  class Vec3 { constructor(){this.x=0;this.y=0;this.z=0;} set(x,y,z){this.x=x;this.y=y;this.z=z;return this;} copy(v){this.x=v.x;this.y=v.y;this.z=v.z;this.w=v.w;return this;} }
  class Texture { constructor(image){ this.image=image; this.repeat=new Vec3(); this.offset=new Vec3(); log.texCreated++; } updateMatrix(){} dispose(){ log.texDispose++; } }
  class PlaneGeometry { constructor(){ this.translated=null; } translate(x,y,z){ this.translated=[x,y,z]; } dispose(){ log.geoDispose++; } }
  class MeshBasicMaterial { constructor(o){ Object.assign(this,o); } dispose(){ log.matDispose++; } }
  class Group { constructor(){ this.children=[]; this.userData={}; this.position=new Vec3(); this.quaternion=new Vec3(); this.name=''; } add(c){ this.children.push(c); } removeFromParent(){} }
  class Mesh { constructor(g,m){ this.geometry=g; this.material=m; this.scale=new Vec3().set(1,1,1); this.visible=true; this.name=''; } }
  return { log, THREE:{ Texture, PlaneGeometry, MeshBasicMaterial, Group, Mesh, DoubleSide:2, SRGBColorSpace:'srgb', NearestFilter:1003, ClampToEdgeWrapping:1001 } };
}

export function verify(){
  const out=[]; const ok=(n,c,m='')=>out.push({n,pass:!!c,m});
  const { THREE, log } = _mockThree();
  const meta = { cell:48, mobs:{ ghoul:{col:3,row:2}, wisp:{col:5,row:4} } };     // ghoul idx19, wisp idx37
  const walkMeta = { framesPerMob:4, _idxSet:new Set([19]) };
  const imgReady = { image:{}, width:384, height:240, ready:true };
  const imageFor = (dk) => dk === 'north-east' ? { image:{}, width:384, height:240, ready:false } : imgReady; // ne = 누락
  const mkBill = () => createEnemyBillboard({ THREE, chN:1, meta, walkMeta, skin:'ghoul', imageFor, worldPerPx:0.01 });

  // 1) THREE 부재 → fail-closed throw
  let threw=false; try{ createEnemyBillboard({ chN:1, meta, imageFor, worldPerPx:0.01 }); }catch(e){ threw=true; }
  ok('missing-three-failclosed', threw, 'createEnemyBillboard throws without THREE');

  // 2) 발 접지: geometry translate(0,0.5,0) → bottom-center at origin
  const b=mkBill();
  ok('foot-at-origin', b.mesh.geometry.translated && b.mesh.geometry.translated[1]===0.5, `translate=${b.mesh.geometry.translated}`);

  // 3) idle UV: ghoul east sx144/sy96, img384×240 → repeat(.125,.2) offset(.375,.4)
  const si=b.setFrame('idle','east',0,16);
  const t=b.object3d.children[0].material.map;
  const uvOK = si.ok && Math.abs(t.repeat.x-0.125)<1e-9 && Math.abs(t.repeat.y-0.2)<1e-9 && Math.abs(t.offset.x-0.375)<1e-9 && Math.abs(t.offset.y-0.4)<1e-9;
  ok('idle-uv-mapping', uvOK, `repeat(${t.repeat.x},${t.repeat.y}) offset(${t.offset.x},${t.offset.y})`);

  // 4) 크기: r16 → sizePx112 × worldPerPx0.01 = 1.12 (정사각), 발@원점 유지
  const sz=b.mesh.scale;
  ok('size-worldPerPx', si.worldSize && Math.abs(si.worldSize[0]-1.12)<1e-9 && Math.abs(sz.x-1.12)<1e-9 && sz.y===sz.x && si.footAtOrigin,
     `W=${si.worldSize&&si.worldSize[0]} scale=(${sz.x},${sz.y})`);

  // 5) walk UV 전진: south walkDist300 → frame2, sx=(3*4+2)*48=672 → offset.x=672/384=1.75
  const sw=b.setFrame('walk','south',300,16);
  ok('walk-uv-advance', sw.ok && sw.mode==='walk' && sw.frame===2 && Math.abs(b.mesh.material.map.offset.x-1.75)<1e-9,
     `frame${sw.frame} offx${b.mesh.material.map.offset.x}`);

  // 6) ★NEW 반례: 누락(미준비) 이미지 → fail-closed, mesh 숨김, 누수 0
  //    관찰: north-east 이미지 ready=false → setFrame {ok:false,'image-not-ready'}, 새 texture 생성 0
  const texBefore=log.texCreated;
  const miss=b.setFrame('idle','north-east',0,16);
  const noLeak = (log.texCreated===texBefore);            // 미준비 → 텍스처 할당 0(반-초기화 0)
  ok('missing-image-failclosed', miss.ok===false && miss.reason==='image-not-ready' && b.mesh.visible===false && noLeak,
     `observed ok=${miss.ok} reason=${miss.reason} vis=${b.mesh.visible} texLeak=${!noLeak}`);

  // 7) meta 미로드 → UNKNOWN fail-closed
  const b2=createEnemyBillboard({ THREE, chN:1, meta:null, imageFor, worldPerPx:0.01 });
  ok('meta-unloaded-unknown', b2.setFrame('idle','east',0,16).ok===false);

  // 8) 보정 미확인 → calibration-required (가짜 크기 0)
  const b3=createEnemyBillboard({ THREE, chN:1, meta, walkMeta, skin:'ghoul', imageFor });
  ok('calibration-required', b3.setFrame('idle','east',0,16).reason==='calibration-required');

  // 9) dispose: geometry/material/모든 texture 해제 + 멱등(2회차 false, 중복해제 0)
  const texN=log.texCreated; const first=b.dispose(), second=b.dispose();
  ok('dispose-and-idempotent', first===true && second===false && log.geoDispose>=1 && log.matDispose>=1 && log.texDispose===texN && b.disposed && b.setFrame('idle','east',0,16).reason==='disposed',
     `geo${log.geoDispose} mat${log.matDispose} tex${log.texDispose}/${texN}`);

  const pass=out.filter(c=>c.pass).length;
  return { pass, fail:out.length-pass, total:out.length, checks:out };
}

function _isMain(){ return (typeof process!=='undefined') && process.argv && process.argv[1] &&
  (import.meta.url===`file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1].split('/').pop())); }
if(_isMain()){
  const r=verify();
  console.log('── CH1 2.5D ENEMY atlas billboard 검증 ──');
  for(const c of r.checks) console.log(`${c.pass?'PASS':'FAIL'}  ${c.n}  ${c.m}`);
  console.log(`\n총 ${r.total}  PASS ${r.pass}  FAIL ${r.fail}`);
  console.log('일반몹 billboard(카메라향 quad) / 발@원점 / 누락·보정·dispose fail-closed / render-order·가림=root 후속 / 화면 미관찰=UNKNOWN');
  process.exit(r.fail?1:0);
}
