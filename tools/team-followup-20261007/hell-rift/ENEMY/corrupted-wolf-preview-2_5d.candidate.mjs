// ════════════════════════════════════════════════════════════════════════
//  corrupted-wolf-preview-2_5d.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-CONSUMER-LINK-20261007-CORRUPTED-WOLF-CONSUMER-CANDIDATE
//  배정: TASK CH1-RIFT-CONSUMER-LINK-20261007-CORRUPTED-WOLF-CONSUMER (ROLE ENEMY)
//
//  실제 corrupted_wolf(=CH1 일반몹, 'ghoul' 아님)의 idle + 유효 walk 프레임만 THREE billboard
//  로 표시하는 **브라우저 consumer**. 파이프라인을 자체 연결:
//    fetch raw bytes → fullSHA + atlas JSON 내용 + PNG IHDR 검증 → decode → (유효프레임) → texture.
//  잘못된 pin → ready 0.  THREE 없음 → ok/ready true 0(검증/decode 만, 표시 불가).
//
//  v2 의 **순수 검증/디코드 fn 만** 소비(sound). v2 loader 의 전역 generation 취약접점은 채택하지
//  않고(교차 방향 병렬 취소 결함) **key별 generation** 을 여기서 구현한다. v2 loader/UV reexport 0.
//  AI/spawn/damage/collision/save/원본18assets 변경 0. 공유 billboard/원본 수정 0.
//
//  소유 수명: 이 consumer 가 fetch/decode/생성한 bitmap·texture 를 **own**(dispose 시 해제).
//             외부(THREE/fetch)는 주입만. borrowed 리소스 없음. dispose 뒤 ready 복귀 0.
//
//  ── 실 Read 근거 ─────────────────────────────────────────────────────────
//   AGENTS.md head / _MAP_SSOT_INDEX.md 읽기순서 head Read. 본 작업=consumer(이미지 파이프라인),
//   맵 geometry/가림/카메라 QA 아님 → scope 확장 쓰기 0, map guide 전체 Read 를 선행완료로 주장 0.
//   실측 근거(2026-10-07 node decode): corrupted_wolf(col5,row1) east walk alpha>16 = [6010,6198,6454,0] → frame3 빈셀.
//   보호 2_3/Q-only magic·blackBean(E 패링0)/어택티켓 금지/기존23 보존.
// ════════════════════════════════════════════════════════════════════════

import { ATLAS_PINS, verifyAssetBytes, decodeRGBA, cellAlphaCount, uvCellInRange }
  from './enemy-atlas-pinned-loader-2_5d.v2.candidate.mjs';   // 순수 검증/디코드만 소비 (loader 미채택)

const DIR_OK = (d) => ATLAS_PINS.pin ? !!ATLAS_PINS.idlePath(d) : false;

// ── 1종 consumer. deps 주입(브라우저: fetchBytes/sha256hex/inflate/THREE/createImageBitmap) ──
export function createCorruptedWolfPreview(deps = {}){
  const { fetchBytes, sha256hex, inflate, THREE, createTexture } = deps;
  const P = ATLAS_PINS, cell = P.cell, fpm = P.framesPerMob;
  const skin = P.repSkin.skin;                 // 'corrupted_wolf' — 실외형 이름 유지
  let col = P.repSkin.col, row = P.repSkin.row; // JSON 검증 후 확정
  let inited = false, jsonOk = false, disposed = false;
  const entries = new Map();                    // `mode|dir` -> {status,ready,texture,bitmap,validFrames,gen}
  const genByKey = new Map();                   // key별 generation (교차 방향 병렬 취소 없음)

  const key = (m,d)=>`${m}|${d}`;
  const _releaseEntry = (e)=>{ if(!e) return; if(e.texture && e.texture.dispose) e.texture.dispose(); if(e.bitmap && e.bitmap.close) e.bitmap.close(); };

  async function _fetchVerify(path, pin, dims){
    const bytes = await fetchBytes(path);                     // 실제 raw bytes
    const sha = typeof sha256hex === 'function' ? await sha256hex(bytes) : null;
    const v = verifyAssetBytes(bytes, pin, dims, sha);        // bytes+fullSHA+IHDR(ct6/bd8/il0/dim)
    return { bytes, v };
  }

  // atlas JSON 내용 검증 → col/row 확정 (실 내용, pin 과 교차검증)
  async function init(){
    if(disposed) return false;
    try{
      const metaJson = P.json.meta;
      const bytes = await fetchBytes(metaJson.path);
      const sha = typeof sha256hex === 'function' ? await sha256hex(bytes) : null;
      if(bytes.length !== metaJson.bytes || sha !== metaJson.sha256) { jsonOk=false; inited=true; return false; }
      const text = (typeof TextDecoder!=='undefined') ? new TextDecoder().decode(bytes) : Buffer.from(bytes).toString('utf8');
      const j = JSON.parse(text);
      const m = j && j.mobs && j.mobs[skin];
      if(!m || !Number.isInteger(m.col) || !Number.isInteger(m.row) || j.cell !== cell){ jsonOk=false; inited=true; return false; }
      if(m.col !== col || m.row !== row){ col = m.col; row = m.row; }  // 실 JSON 우선(pin 과 불일치 시 로그는 root)
      jsonOk = true; inited = true; return true;
    }catch(e){ jsonOk=false; inited=true; return false; }
  }

  // key별 generation 로드: 같은 key 재요청만 이전 것을 무효화/해제, 다른 방향은 취소 0
  async function loadDir(mode, dir){
    if(disposed) return 'disposed';
    if(mode!=='idle' && mode!=='walk') return 'bad-mode';
    if(!DIR_OK(dir)) return 'bad-dir';
    const k = key(mode,dir);
    const myGen = (genByKey.get(k)||0) + 1; genByKey.set(k, myGen);
    const path = mode==='walk' ? P.walkPath(dir) : P.idlePath(dir);
    const pin  = P.pin(mode,dir);
    const dims = mode==='walk' ? P.walkDims : P.idleDims;
    let bytes, v;
    try{ ({bytes, v} = await _fetchVerify(path, pin, dims)); }
    catch(e){ if(genByKey.get(k)===myGen && !disposed) _store(k,{status:'error',ready:false,error:String(e&&e.message||e),gen:myGen}); return 'error'; }
    // 잘못된 pin → ready 0
    if(!v.ok){ if(genByKey.get(k)===myGen && !disposed) _store(k,{status:'bad-pin',ready:false,detail:v,gen:myGen}); return 'bad-pin'; }
    let decoded, validFrames=[0];
    try{ decoded = decodeRGBA(bytes, inflate); }
    catch(e){ if(genByKey.get(k)===myGen && !disposed) _store(k,{status:'decode-error',ready:false,error:String(e&&e.message||e),gen:myGen}); return 'decode-error'; }
    if(mode==='walk'){ validFrames = []; for(let f=0; f<fpm; f++){ if(cellAlphaCount(decoded,'walk',col,row,f) > 0) validFrames.push(f); } }
    else { validFrames = (cellAlphaCount(decoded,'idle',col,row,0) > 0) ? [0] : []; }
    // superseded(같은 key 새 요청) / disposed → 생성물 즉시 해제(누수 0)
    if(disposed || genByKey.get(k)!==myGen){ return 'aborted'; }
    // THREE 없음 → 검증/decode 만, 표시 불가(ready/ok true 0)
    if(!THREE && typeof createTexture!=='function'){ _store(k,{status:'verified-no-texture',ready:false,validFrames,gen:myGen}); return 'verified-no-texture'; }
    if(validFrames.length===0){ _store(k,{status:'all-empty',ready:false,validFrames,gen:myGen}); return 'all-empty'; }
    const bitmap = { width:decoded.width, height:decoded.height, close(){} }; // own(실제 브라우저는 ImageBitmap)
    const texture = typeof createTexture==='function' ? createTexture(bitmap) : new THREE.Texture(bitmap);
    if(texture && 'needsUpdate' in texture) texture.needsUpdate = true;
    _store(k,{status:'ready',ready:true,texture,bitmap,validFrames,gen:myGen}); // same-key 교체 시 이전 해제됨
    return 'ready';
  }
  function _store(k, entry){ const old = entries.get(k); if(old && old!==entry) _releaseEntry(old); entries.set(k, entry); }

  // 프레임 선택: 유효 walk 만(빈 frame3 제외) / idle. 정수 가드 col0..7·frame0..3.
  function frameFor(mode, dir, walkDist){
    if(disposed) return { ready:false, reason:'disposed' };
    if(mode==='walk'){
      const e = entries.get(key('walk',dir));
      if(!e || !e.ready || !e.validFrames || e.validFrames.length===0){
        const ie = entries.get(key('idle',dir));                 // 유효 walk 없음 → idle fallback
        return ie && ie.ready ? _emit('idle', ie, 0) : { ready:false, reason:'no-valid-walk-no-idle' };
      }
      const raw = ((Math.floor(_fin(walkDist)/128) % fpm) + fpm) % fpm; // 0..3
      const useFrame = e.validFrames.includes(raw) ? raw : null;        // 빈 frame → fallback
      if(useFrame==null){ const ie=entries.get(key('idle',dir)); return ie&&ie.ready ? _emit('idle',ie,0,{fellBackFromEmptyWalkFrame:raw}) : _emit('walk', e, e.validFrames[0], {skippedEmpty:raw}); }
      return _emit('walk', e, useFrame);
    }
    const e = entries.get(key('idle',dir));
    return e && e.ready ? _emit('idle', e, 0) : { ready:false, reason:'idle-not-ready' };
  }
  function _emit(mode, e, frame, extra){
    if(!Number.isInteger(col)||col<0||col>=P.cols) return { ready:false, reason:'col-range' };
    if(mode==='walk' && (!Number.isInteger(frame)||frame<0||frame>=fpm)) return { ready:false, reason:'frame-range' };
    if(!uvCellInRange(mode,col,row,frame)) return { ready:false, reason:'uv-range' };
    const W = mode==='walk'?P.walkDims[0]:P.idleDims[0], H = mode==='walk'?P.walkDims[1]:P.idleDims[1];
    const sx = (mode==='walk'?(col*fpm+frame):col)*cell, sy = row*cell;
    return Object.freeze({ ready:true, mode, dir:undefined, frame, texture:e.texture,
      uv:Object.freeze({ repeatX:cell/W, repeatY:cell/H, offsetX:sx/W, offsetY:1-(sy+cell)/H }),
      footAnchor:Object.freeze({x:0.5,y:1}), ...(extra||{}) });
  }
  const _fin=(v)=>Number.isFinite(v)?v:0;

  function dispose(){ if(disposed) return false; disposed=true; entries.forEach(_releaseEntry); entries.clear(); return true; }

  return Object.freeze({ skin, init, loadDir, frameFor, dispose,
    get inited(){return inited;}, get jsonOk(){return jsonOk;}, get disposed(){return disposed;},
    get ownsTextures(){return true;}, status:(m,d)=>{ const e=entries.get(key(m,d)); return e?e.status:'idle'; },
    validFrames:(d)=>{ const e=entries.get(key('walk',d)); return e&&e.validFrames?e.validFrames.slice():null; } });
}
