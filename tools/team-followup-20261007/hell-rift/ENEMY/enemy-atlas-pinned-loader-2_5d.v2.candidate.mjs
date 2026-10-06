// ════════════════════════════════════════════════════════════════════════
//  enemy-atlas-pinned-loader-2_5d.v2.candidate.mjs
//  OFFICIAL-COMPLETION-ID: CH1-RIFT-QUALITY-FIX-20261007-PINNED-LOADER-V2-CANDIDATE
//  배정: TASK CH1-RIFT-QUALITY-FIX-20261007-PINNED-LOADER-V2 (ROLE ENEMY)
//
//  v1(raw 16481B / 1ad5b47b…) 대비 실 결함수정:
//   · v1 은 fetchImage 결과 dim 만 검사 → v2 는 **raw bytes + fullSHA + PNG IHDR** 를 decode 전 검증.
//   · 실제 cell alpha decode(빈 walk 프레임 관측) — v1 은 alpha/빈셀 미검사.
//   · imageFor(mode,direction) + 텍스처 cache key = `mode|direction` (v1 은 dirKey-only → walk/idle 혼선).
//   · async 요청 generation/abort + disposed-late owned bitmap.close (누수 0). borrow 소유권 명시.
//   · col 0..7 / frame 0..3 정수 범위 검사.
//   · 실 외형 corrupted_wolf 를 'ghoul' 로 이름붙이지 않음(발명 0).
//  AI/spawn/combat/hp/collision/save 변경 0. 공유 billboard 수정 0(consumer adapter 를 본 파일에 포함).
//
//  ── 실 Read 근거 ─────────────────────────────────────────────────────────
//   AGENTS.md head / _MAP_SSOT_INDEX.md 읽기순서 head Read(운영·RETOUCH 상태). 본 작업은 loader/decode
//   (이미지 바이트·알파)이며 맵 geometry/가림/카메라/render-order 아님 → MAP_PRODUCTION_GUIDELINE_v0.9
//   전체 Read 를 '맵작업 선행 완료'로 보고하지 않음. VISUAL = NOT ASSESSED.
//   실측(2026-10-07 node decode): corrupted_wolf(col5,row1) east walk alpha>16 = [6010,6198,6454,0] → frame3 빈셀.
//
//  이 파일 1개만 소유. v1/raw/source/save/타인WIP 불변. harness/report/temp/backup/2번째raw 0.
//  보호 2_3/Q-only magic·blackBean(E 패링0)/어택티켓 금지/기존23/sourcePNG/nav1192 보존.
// ════════════════════════════════════════════════════════════════════════

import { ATLAS_PINS, uvCellInRange } from './enemy-atlas-pinned-loader-2_5d.candidate.mjs';
export { ATLAS_PINS, uvCellInRange };

// ── PNG IHDR 파서 (decode 전 규격 검증용) ────────────────────────────────
export function parsePngHeader(bytes){
  const sig = [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a];
  for(let i=0;i<8;i++) if(bytes[i]!==sig[i]) return { ok:false, reason:'not-png' };
  const u32=(o)=>(bytes[o]<<24|bytes[o+1]<<16|bytes[o+2]<<8|bytes[o+3])>>>0;
  // 8 sig + 4 len + 4 'IHDR' → data @16
  return Object.freeze({ ok:true, width:u32(16), height:u32(20), bitDepth:bytes[24], colorType:bytes[25],
    compression:bytes[26], filter:bytes[27], interlace:bytes[28] });
}

// ── 자산 바이트/SHA/IHDR 검증 (sha256 fn 주입: node crypto 또는 WebCrypto) ─
export function verifyAssetBytes(bytes, pin, expectedDims, sha256hex){
  const bytesOk = bytes && bytes.length === pin.bytes;
  const shaOk = typeof sha256hex === 'string' && sha256hex.toLowerCase() === pin.sha256;
  const ihdr = parsePngHeader(bytes);
  const dimsOk = !!(ihdr.ok && ihdr.width === expectedDims[0] && ihdr.height === expectedDims[1]);
  const formatOk = !!(ihdr.ok && ihdr.colorType === 6 && ihdr.bitDepth === 8 && ihdr.interlace === 0); // RGBA8 non-interlaced
  return Object.freeze({ ok: bytesOk && shaOk && dimsOk && formatOk, bytesOk, shaOk, dimsOk, formatOk, ihdr });
}

// ── 순수 PNG → RGBA 디코더 (colorType6/bd8/interlace0; inflate fn 주입) ────
export function decodeRGBA(bytes, inflate){
  const h = parsePngHeader(bytes);
  if(!h.ok || h.colorType !== 6 || h.bitDepth !== 8 || h.interlace !== 0) throw new Error('지원하지 않는 PNG 규격(RGBA8 non-interlaced 아님)');
  const W=h.width, H=h.height;
  let o=8; const idat=[];
  const u32=(o)=>(bytes[o]<<24|bytes[o+1]<<16|bytes[o+2]<<8|bytes[o+3])>>>0;
  while(o<bytes.length){ const len=u32(o); const t=String.fromCharCode(bytes[o+4],bytes[o+5],bytes[o+6],bytes[o+7]);
    const data=bytes.subarray(o+8,o+8+len); if(t==='IDAT') idat.push(data); if(t==='IEND') break; o+=12+len; }
  const concat = idat.length===1 ? idat[0] : _concat(idat);
  const raw = inflate(concat);
  const bpp=4, stride=W*bpp, rowlen=stride+1, out=new Uint8Array(H*stride);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<H;y++){ const ft=raw[y*rowlen], ri=y*rowlen+1, oi=y*stride;
    for(let x=0;x<stride;x++){ const rv=raw[ri+x]; const a=x>=bpp?out[oi+x-bpp]:0; const b=y>0?out[oi-stride+x]:0; const c=(x>=bpp&&y>0)?out[oi-stride+x-bpp]:0;
      let v; switch(ft){case 0:v=rv;break;case 1:v=rv+a;break;case 2:v=rv+b;break;case 3:v=rv+((a+b)>>1);break;case 4:v=rv+paeth(a,b,c);break;default:throw new Error('알 수 없는 PNG 필터 '+ft);} out[oi+x]=v&255; } }
  return { width:W, height:H, data:out };
}
function _concat(arrs){ let n=0; for(const a of arrs)n+=a.length; const o=new Uint8Array(n); let p=0; for(const a of arrs){o.set(a,p);p+=a.length;} return o; }

// ── cell alpha count (정수 범위 검사 col0..7/frame0..3/row0..rows-1) ──────
export function cellAlphaCount(decoded, mode, col, row, frame, alphaThresh=16){
  const P=ATLAS_PINS, cell=P.cell;
  if(!Number.isInteger(col)||col<0||col>=P.cols) throw new Error('col 범위 오류(0..'+(P.cols-1)+')');
  if(!Number.isInteger(row)||row<0||row>=P.rows) throw new Error('row 범위 오류(0..'+(P.rows-1)+')');
  const fr = mode==='walk' ? frame : 0;
  if(mode==='walk' && (!Number.isInteger(fr)||fr<0||fr>=P.framesPerMob)) throw new Error('frame 범위 오류(0..'+(P.framesPerMob-1)+')');
  if(!uvCellInRange(mode,col,row,fr)) throw new Error('UV cell 범위 초과');
  const sx = (mode==='walk' ? (col*P.framesPerMob+fr) : col)*cell, sy=row*cell;
  if(sx+cell>decoded.width || sy+cell>decoded.height) throw new Error('decoded 범위 초과');
  const stride=decoded.width*4; let cnt=0;
  for(let y=sy;y<sy+cell;y++){ const base=y*stride; for(let x=sx;x<sx+cell;x++){ if(decoded.data[base+x*4+3]>alphaThresh) cnt++; } }
  return cnt;
}

// ── walk 4프레임 가용 리포트 (빈셀 관측 → unavailable) ────────────────────
export function walkCellReport(decoded, col, row, alphaThresh=16){
  const counts=[]; const emptyFrames=[];
  for(let f=0;f<ATLAS_PINS.framesPerMob;f++){ const c=cellAlphaCount(decoded,'walk',col,row,f,alphaThresh); counts.push(c); if(c===0) emptyFrames.push(f); }
  return Object.freeze({ counts:Object.freeze(counts), emptyFrames:Object.freeze(emptyFrames), anyEmpty:emptyFrames.length>0, allEmpty:emptyFrames.length===ATLAS_PINS.framesPerMob });
}
// 빈 walk → walk unavailable: 모든 프레임이 비면 walk 자체 불가(=idle fallback). 일부 빈 프레임은 해당 프레임만 skip.
export function walkAvailability(report){
  if(report.allEmpty) return { walkUsable:false, reason:'all-walk-cells-empty', fallback:'idle', emptyFrames:report.emptyFrames };
  if(report.anyEmpty) return { walkUsable:true, skipFrames:report.emptyFrames, reason:'partial-empty-walk', fallback:'skip-empty-frame' };
  return { walkUsable:true, skipFrames:[], reason:'all-frames-present' };
}

// ── 실 loader v2: generation/abort + disposed-late bitmap.close + mode|dir cache ─
export function createPinnedLoaderV2(api = {}){
  const { fetchBitmap, skin } = api;          // fetchBitmap(path)->Promise<ImageBitmap|{image,width,height,close?}>
  const sk = skin || ATLAS_PINS.repSkin.skin;
  const bitmaps = new Map();                  // `mode|dir` -> {status,bitmap,width,height,gen}
  let gen = 0, disposed = false;
  const key=(m,d)=>`${m}|${d}`;

  async function load(mode, dir){
    if(disposed) return 'disposed';
    const myGen = ++gen;                       // 요청 generation (이후 요청/‍dispose 가 이 요청을 무효화)
    const path = mode==='walk'?ATLAS_PINS.walkPath(dir):ATLAS_PINS.idlePath(dir);
    const dims = mode==='walk'?ATLAS_PINS.walkDims:ATLAS_PINS.idleDims;
    const k=key(mode,dir); bitmaps.set(k,{status:'loading',bitmap:null,width:0,height:0,gen:myGen});
    if(typeof fetchBitmap!=='function'){ bitmaps.set(k,{status:'error',bitmap:null,width:0,height:0,gen:myGen,error:'no-fetchBitmap'}); return 'error'; }
    let res; try{ res=await fetchBitmap(path); }catch(e){ if(!disposed&&gen===myGen) bitmaps.set(k,{status:'error',bitmap:null,width:0,height:0,gen:myGen,error:String(e&&e.message||e)}); return 'error'; }
    const w=res&&(res.width), h=res&&(res.height);
    // disposed-late / superseded: 이 요청이 더 이상 유효하지 않으면 owned bitmap 즉시 close(누수 0)
    if(disposed || gen!==myGen){ if(res&&typeof res.close==='function') res.close(); return 'aborted'; }
    if(!res || w!==dims[0] || h!==dims[1]){ if(res&&typeof res.close==='function') res.close(); bitmaps.set(k,{status:'error',bitmap:null,width:w||0,height:h||0,gen:myGen,error:'dim-mismatch'}); return 'error'; }
    bitmaps.set(k,{status:'ready',bitmap:res,width:w,height:h,gen:myGen});
    return 'ready';
  }
  // mode+direction 정확 키 (v1 dirKey-only 혼선 수정). billboard texture cache 도 이 키를 써야 한다.
  function imageFor(mode, dir){ const e=bitmaps.get(key(mode,dir)); return (e&&e.status==='ready')?{image:e.bitmap,width:e.width,height:e.height,ready:true,cacheKey:key(mode,dir)}:{image:null,width:0,height:0,ready:false,cacheKey:key(mode,dir)}; }
  function status(mode,dir){ const e=bitmaps.get(key(mode,dir)); return e?e.status:'idle'; }
  function dispose(){ if(disposed) return false; disposed=true; gen++; bitmaps.forEach(e=>{ if(e.bitmap&&typeof e.bitmap.close==='function') e.bitmap.close(); }); bitmaps.clear(); return true; }
  return Object.freeze({ skin:sk, load, imageFor, status, dispose, get disposed(){return disposed;}, get ownsTextures(){return false;} });
}

// ── consumer adapter: 텍스처 cache key = `mode|direction` (공유 billboard 수정 0) ─
//   adapter 가 자기 Texture 를 mode+dir 로 캐시(소유). loader 는 bitmap 소유. 빈 walk 프레임 → idle fallback.
export function createModeDirTextureCache(api = {}){
  const { THREE, loader } = api;
  const cache = new Map();                    // `mode|dir` -> THREE.Texture (adapter 소유)
  let disposed=false;
  function get(mode, dir, walkAvail){
    if(disposed) return { ok:false, reason:'disposed' };
    const useMode = (mode==='walk' && walkAvail && walkAvail.walkUsable===false) ? 'idle' : mode; // 빈 walk → idle
    const img = loader.imageFor(useMode, dir);
    if(!img.ready) return { ok:false, reason:'image-not-ready', cacheKey:`${useMode}|${dir}`, usedMode:useMode };
    const ck=`${useMode}|${dir}`;
    let tex=cache.get(ck);
    if(!tex && THREE){ tex=new THREE.Texture(img.image); tex.needsUpdate=true; cache.set(ck,tex); }
    return { ok:true, cacheKey:ck, usedMode:useMode, texture:tex||null, fellBackToIdle:useMode!==mode };
  }
  function dispose(){ if(disposed) return false; disposed=true; cache.forEach(t=>t&&t.dispose&&t.dispose()); cache.clear(); return true; }
  return Object.freeze({ get, dispose, get size(){return cache.size;}, get disposed(){return disposed;} });
}
