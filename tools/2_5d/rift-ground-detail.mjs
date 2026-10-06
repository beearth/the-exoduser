/* Ground-only colour detail for the independent Hell Rift 2.5D consumer.
 * Geometry, navigation, source pixels and gameplay state are never changed.
 * Assign material only to the registered ground, never the skirt or abyss.
 */
import { RIFT_GROUND_DETAIL } from '../map-scene-rift-ground-detail.mjs';
import { residentPaintingProfile } from '../map-scene-rift-residents.mjs';
import { supportsRiftAmbience } from '../map-scene-rift-ambience.mjs';

export const RIFT_GROUND_DETAIL_MATERIAL = Object.freeze({
  source: RIFT_GROUND_DETAIL,
  sourceBytes: 2877605,
  sceneSha256: 'c508e70d23fafb9295798763c5224c7c92699dfea3d3beebdb6ab18173f44a3a',
  navSha256: 'a4508aa62f21c9b4380640307b36eef06656ebdf0c0245a2f78833d65dda0179',
  cleanPlateSha256: 'aa64cb7bbfff10c9d5ea2378ef3f8f528bbfb2acfb43ddb9a6520b9f24127673',
  grid: 200, tile: 40, world: 8000, navCells: 1192,
  patternSize: 480, worldPeriod: 320, alpha: .4,
  composite: 'soft-light', blendSpace: 'sRGB', scope: 'registered-ground-only'
});
export const RIFT_GROUND_DETAIL_PROVENANCE = Object.freeze({
  status: 'ROOT-PUBLIC-CONSUMER',
  basis: 'tools/map-scene-rift-ground-detail.mjs',
  basisContract: 'ROOT-RIFT-GROUND-MATERIAL-20261006',
  candidateSource: 'tools/team-followup-20261007/hell-rift/ANIMVFX/rift-ground-material-2_5d.candidate.mjs',
  candidatePin: null,
  candidateAdopted: false
});
const ROOT = new URL('../../', import.meta.url);
const C = RIFT_GROUND_DETAIL_MATERIAL;
const defaultCanvas = () => document.createElement('canvas');

// Input is an editor/terrain plain-data snapshot, not a live provider. Reject
// accessors before evaluating them and detach all navigation/registration data.
function copyScene(value, depth=0, seen=new Set(), budget={count:0}) {
  if (value === null || ['string', 'boolean'].includes(typeof value)) return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (!value || typeof value !== 'object' || depth > 24 || seen.has(value)) throw new Error('지면 scene 데이터 오류');
  const array = Array.isArray(value), proto = Object.getPrototypeOf(value);
  if (!array && proto !== Object.prototype && proto !== null) throw new Error('지면 scene은 plain 데이터여야 합니다');
  const out = array ? [] : Object.create(null), descriptors = Object.getOwnPropertyDescriptors(value);
  seen.add(value);
  for (const [key, entry] of Object.entries(descriptors)) {
    if (array && key === 'length') continue;
    if (!entry.enumerable) continue;
    if (!('value' in entry) || ++budget.count > 100000) throw new Error('지면 scene accessor/크기 오류');
    Object.defineProperty(out, key, { value: copyScene(entry.value, depth+1, seen, budget), enumerable: true, writable: true, configurable: true });
  }
  seen.delete(value);
  return out;
}
async function hash(bytes) {
  if (!globalThis.crypto?.subtle) throw new Error('지면 SHA256 검증을 사용할 수 없습니다');
  return Array.from(new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
function plateMatches(texture) {
  const image = texture?.image;
  return texture?.isTexture === true && texture.colorSpace === 'srgb' && texture.channel === 0 && texture.flipY === true &&
    (image?.naturalWidth ?? image?.width) === 1254 && (image?.naturalHeight ?? image?.height) === 1254 &&
    texture.offset?.x === 0 && texture.offset?.y === 0 && texture.repeat?.x === 1 && texture.repeat?.y === 1 && texture.rotation === 0;
}
function admission(scene) {
  if (!residentPaintingProfile(scene) || !supportsRiftAmbience(scene) || scene.layers.find(l => l.id === 'abyss')?.visible !== true ||
      scene.sourcePins?.cleanPlate !== C.cleanPlateSha256 || scene.sourcePins?.nav !== C.navSha256 || scene.sourcePins?.walkableCount !== C.navCells ||
      !Array.isArray(scene.walkable) || scene.walkable.length !== C.grid*C.grid) throw new Error('지면 정본 등록 불일치');
  const nav = new Uint8Array(scene.walkable.length);
  let cells=0;
  for (let i=0; i<nav.length; i++) {
    if (scene.walkable[i] !== 0 && scene.walkable[i] !== 1) throw new Error('지면 nav 값 오류');
    nav[i] = scene.walkable[i]; cells += nav[i];
  }
  if (cells !== C.navCells) throw new Error('지면 nav1192 불일치');
  return nav;
}
function masks(nav) {
  const hard = new Uint8Array(nav.length*4), soft = new Uint8Array(nav.length*4);
  let edgeCells=0;
  for (let i=0; i<nav.length; i++) {
    const x=i%C.grid, y=Math.floor(i/C.grid), k=i*4;
    const edge = !!nav[i] && (x===0 || y===0 || x===C.grid-1 || y===C.grid-1 || !nav[i-1] || !nav[i+1] || !nav[i-C.grid] || !nav[i+C.grid]);
    const h=nav[i]?255:0, s=nav[i]?(edge?128:255):0;
    hard[k]=hard[k+1]=hard[k+2]=h; hard[k+3]=255;
    soft[k]=soft[k+1]=soft[k+2]=s; soft[k+3]=255;
    if (edge) edgeCells++;
  }
  return {hard, soft, edgeCells, interiorCells:C.navCells-edgeCells};
}
async function loadPattern(fetcher, makeCanvas) {
  const s=C.source, response=await fetcher(new URL(s.src, ROOT), {cache:'no-store', redirect:'error'});
  if (!response?.ok || typeof response.arrayBuffer !== 'function') throw new Error('지면 원자료 HTTP 로딩 실패');
  const bytes=await response.arrayBuffer();
  if (!(bytes instanceof ArrayBuffer) || bytes.byteLength !== C.sourceBytes || await hash(bytes) !== s.sha256) throw new Error('지면 원자료 full SHA256 불일치');
  const url=URL.createObjectURL(new Blob([bytes], {type:'image/png'}));
  try {
    const image=new Image(); image.src=url; await image.decode();
    if (image.naturalWidth !== s.width || image.naturalHeight !== s.height) throw new Error('지면 원본1024×1536 불일치');
    const canvas=makeCanvas();
    if (!canvas || typeof canvas.getContext !== 'function') throw new Error('지면 crop canvas 오류');
    canvas.width=C.patternSize; canvas.height=C.patternSize;
    const ctx=canvas.getContext('2d');
    if (!ctx) throw new Error('지면 crop context 오류');
    const crop=s.crop;
    ctx.save();
    try {
      ctx.imageSmoothingEnabled=false;
      for (const [x,y,flipX,flipY] of [[0,0,1,1],[480,0,-1,1],[0,480,1,-1],[480,480,-1,-1]]) {
        ctx.save();
        try {ctx.translate(x,y); ctx.scale(flipX,flipY); ctx.drawImage(image,crop.x,crop.y,crop.w,crop.h,0,0,crop.w,crop.h);}
        finally {ctx.restore();}
      }
    } finally {ctx.restore();}
    return canvas;
  } finally {URL.revokeObjectURL(url);}
}

const FRAGMENT_PARS = `
varying vec2 vRiftGroundWorldUv;
uniform sampler2D riftGroundDetail;
uniform sampler2D riftGroundHard;
uniform sampler2D riftGroundSoft;
uniform float riftGroundAmount;
vec3 riftGroundToSRGB(vec3 x) {
  x = clamp(x, 0.0, 1.0);
  return mix(1.055 * pow(x, vec3(1.0 / 2.4)) - 0.055, 12.92 * x, step(x, vec3(0.0031308)));
}
vec3 riftGroundToLinear(vec3 x) {
  x = clamp(x, 0.0, 1.0);
  return mix(pow((x + 0.055) / 1.055, vec3(2.4)), x / 12.92, step(x, vec3(0.04045)));
}
vec3 riftGroundSoftLight(vec3 b, vec3 s) {
  vec3 d = mix(sqrt(b), ((16.0 * b - 12.0) * b + 4.0) * b, step(b, vec3(0.25)));
  return mix(b + (2.0 * s - 1.0) * (d - b), b - (1.0 - 2.0 * s) * b * (1.0 - b), step(s, vec3(0.5)));
}`;
const FRAGMENT_BLEND = `
#ifdef USE_MAP
  // Ground geometry UV is global worldX/8000, 1-worldY/8000.
  // A nearest hard gate forbids the linearly filtered inward fade spilling.
  bool riftInside = all(greaterThanEqual(vRiftGroundWorldUv, vec2(0.0))) && all(lessThan(vRiftGroundWorldUv, vec2(1.0)));
  float riftGate = riftInside ? texture2D(riftGroundHard, vRiftGroundWorldUv).r : 0.0;
  float riftFade = texture2D(riftGroundSoft, vRiftGroundWorldUv).r;
  vec4 riftDetail = texture2D(riftGroundDetail, fract(vRiftGroundWorldUv * 25.0));
  float riftAmount = riftGroundAmount * riftGate * riftFade * riftDetail.a;
  // Canvas soft-light acts on sRGB values; Three map samples are linear.
  // The outer branch preserves the original plate exactly when disabled/non-nav.
  if (riftAmount > 0.0) {
    vec3 riftBase = riftGroundToSRGB(diffuseColor.rgb);
    vec3 riftBlend = riftGroundToSRGB(riftDetail.rgb);
    diffuseColor.rgb = riftGroundToLinear(mix(riftBase, riftGroundSoftLight(riftBase, riftBlend), riftAmount));
  }
#endif`;

/**
 * Returns a new ground-only MeshBasicMaterial; plateTexture is borrowed and
 * remains caller-owned. Recreate after a scene/nav replacement. No own RAF,
 * timers, camera mutation, per-frame nav scan or scene/save writes.
 * The caller restores/replaces the mesh material before dispose(). Shader-link
 * acceptance belongs to the caller's real WebGL renderer, not this CPU adapter.
 */
export async function createRiftGroundDetailMaterial({THREE, sourceScene, plateTexture, enabled=true, fetcher=globalThis.fetch, makeCanvas=defaultCanvas}={}) {
  if (!THREE?.CanvasTexture || !THREE?.DataTexture || !THREE?.MeshBasicMaterial || typeof fetcher !== 'function' || typeof makeCanvas !== 'function' || typeof enabled !== 'boolean') throw new Error('지면 재질 런타임/옵션 오류');
  const source=copyScene(sourceScene), nav=admission(source);
  if (!plateMatches(plateTexture)) throw new Error('지면 plate texture1254²/global UV 등록 오류');
  if (await hash(nav) !== C.navSha256) throw new Error('지면 nav 실제 SHA256 불일치');
  const resources=new Set(), uniforms={riftGroundAmount:{value:enabled?C.alpha:0}};
  let material=null, disposed=false, compiled=false, compileCalls=0, enabledState=enabled, reason='prepared-not-webgl-compiled', error=null;
  const stats=masks(nav);
  function release() {
    for (const r of resources) {try {r.dispose();} catch (e) {error=String(e?.message||e);}}
    resources.clear();
  }
  try {
    const canvas=await loadPattern(fetcher, makeCanvas);
    const detail=new THREE.CanvasTexture(canvas); resources.add(detail);
    detail.colorSpace=THREE.SRGBColorSpace; detail.flipY=false;
    detail.magFilter=detail.minFilter=THREE.LinearFilter; detail.generateMipmaps=false;
    detail.wrapS=detail.wrapT=THREE.ClampToEdgeWrapping; detail.needsUpdate=true;
    const maskTexture=(bytes, filter)=>{
      const t=new THREE.DataTexture(bytes,C.grid,C.grid,THREE.RGBAFormat,THREE.UnsignedByteType); resources.add(t);
      t.colorSpace=THREE.NoColorSpace; t.flipY=false; t.magFilter=t.minFilter=filter;
      t.generateMipmaps=false; t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.needsUpdate=true; return t;
    };
    const hard=maskTexture(stats.hard,THREE.NearestFilter), soft=maskTexture(stats.soft,THREE.LinearFilter);
    uniforms.riftGroundDetail={value:detail}; uniforms.riftGroundHard={value:hard}; uniforms.riftGroundSoft={value:soft};
    material=new THREE.MeshBasicMaterial({map:plateTexture, side:THREE.DoubleSide}); resources.add(material);
    material.name='Hell Rift · pinned ground colour detail';
    material.customProgramCacheKey=()=> 'rift-ground-detail-srgb-soft-light-nav1192-v1';
    material.onBeforeCompile=shader=>{
      if (disposed) return;
      compileCalls++;
      const v=shader?.vertexShader, f=shader?.fragmentShader;
      if (typeof v !== 'string' || typeof f !== 'string' || !shader.uniforms ||
          !v.includes('#include <uv_pars_vertex>') || !v.includes('#include <uv_vertex>') ||
          !f.includes('#include <map_pars_fragment>') || !f.includes('#include <map_fragment>')) {
        compiled=false; reason='shader-contract-mismatch-plate-fallback'; error='Three shader chunk 등록 불일치'; return;
      }
      const vertex=v.replace('#include <uv_pars_vertex>','#include <uv_pars_vertex>\nvarying vec2 vRiftGroundWorldUv;')
        .replace('#include <uv_vertex>','#include <uv_vertex>\nvRiftGroundWorldUv = vec2(uv.x, 1.0 - uv.y);');
      const fragment=f.replace('#include <map_pars_fragment>','#include <map_pars_fragment>\n'+FRAGMENT_PARS)
        .replace('#include <map_fragment>','#include <map_fragment>\n'+FRAGMENT_BLEND);
      Object.assign(shader.uniforms,uniforms); shader.vertexShader=vertex; shader.fragmentShader=fragment;
      compiled=true; reason=enabledState?'ground-colour-detail':'disabled-original-plate'; error=null;
    };
    function setEnabled(value) {
      if (typeof value !== 'boolean') throw new Error('지면 enabled는 boolean이어야 합니다');
      if (disposed) return false;
      enabledState=value; uniforms.riftGroundAmount.value=value?C.alpha:0;
      if (compiled) reason=value?'ground-colour-detail':'disabled-original-plate';
      return value;
    }
    function snapshot() {
      return {disposed,enabled:!disposed&&enabledState,ready:!disposed,compiled,compileCalls,reason,error,
        source:{src:C.source.src,bytes:C.sourceBytes,sha256:C.source.sha256,width:C.source.width,height:C.source.height,crop:{...C.source.crop},fullPinVerified:true},
        sceneSha256:C.sceneSha256,scenePinVerification:'caller-terrain-pinned-scene; strict-detached-registration',
        navSha256:C.navSha256,navPinVerified:true,navCells:C.navCells,maskSize:{width:C.grid,height:C.grid},
        edgeCells:stats.edgeCells,interiorCells:stats.interiorCells,hardFilter:'nearest',softFilter:'linear-inward',
        patternSize:{width:C.patternSize,height:C.patternSize},worldPeriod:C.worldPeriod,alpha:C.alpha,
        composite:C.composite,blendSpace:C.blendSpace,textures:disposed?0:3,materials:disposed?0:1,borrowedPlateDisposed:false,
        ownRaf:false,ownTimers:false,sceneWrites:false,navWrites:false,geometryWrites:false,nativeAccepted:false,
        shaderLinkVerification:'caller-WebGL-required',provenance:{...RIFT_GROUND_DETAIL_PROVENANCE}};
    }
    function dispose() {
      if (disposed) return;
      disposed=true; enabledState=false; uniforms.riftGroundAmount.value=0;
      reason='disposed';
      material.onBeforeCompile=()=>{}; material.map=null;
      release();
      for (const key of ['riftGroundDetail','riftGroundHard','riftGroundSoft']) uniforms[key].value=null;
    }
    return Object.freeze({material,setEnabled,snapshot,dispose});
  } catch (e) {release(); throw e;}
}

export default createRiftGroundDetailMaterial;
