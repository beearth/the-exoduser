/* MAP editor-roundtrip port adapter — CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-MAP-EDITOR-PORT-CANDIDATE
 *
 * Connects the REAL scene editor's clone/serialize/load/export to the v3 consumer's editorProvider
 * (scene-roundtrip-2_5d.v3.candidate.mjs). Read-only; writes NO editor/scene/nav/save/public/root/docs files.
 *
 * Real editor API confirmed (source:line, tools/map-scene-editor.js):
 *   clone     : window.EXODUSER_SCENE_EDITOR.snapshot() = K.clone(current())            :618  (public, sync)
 *   serialize : $('save').onclick → JSON.stringify(K.validate(current()))               :574  (private handler; replicable)
 *   load      : window.EXODUSER_SCENE_EDITOR.importProject(raw, save=false)             :576,:618 (public, ASYNC, browser-only)
 *               importProject decodes each asset via picture()/Image + checks naturalWidth/Height :27,:576
 *   export    : $('save') JSON :574 / $('png') :575                                     (private, browser download)
 *
 * The FULL import roundtrip is async + browser-only (image decode). Headless (Node) it is PENDING — no DOM/Image.
 * Only the serialization-format portion (clone + JSON.stringify/validate + parse) is headless-available and is
 * exposed as a clearly-labeled serialization-only sync provider (real:false) — NOT a real-editor VERIFIED.
 */
import '../../../map-scene-core.js';
const K = globalThis.MapSceneCore;

export const EDITOR_API = Object.freeze({
  clone:     'EXODUSER_SCENE_EDITOR.snapshot()            tools/map-scene-editor.js:618 (K.clone(current()), sync, public)',
  serialize: "$('save').onclick JSON.stringify(validate)   tools/map-scene-editor.js:574 (private handler)",
  load:      'EXODUSER_SCENE_EDITOR.importProject(raw,save) tools/map-scene-editor.js:576,618 (ASYNC, browser-only: picture()/Image :27)',
  export:    "$('save') JSON :574 / $('png') :575          (private, browser download)"
});

/* Validate a live editor handle's shape; report exactly which API is missing (fail-closed). */
export function validateEditorHandle(handle) {
  if (!handle || typeof handle !== 'object') return { status: 'UNKNOWN', reason: 'editor handle 없음 (headless/미연결)', missing: ['*'], api: EDITOR_API };
  const missing = [];
  if (typeof handle.snapshot !== 'function') missing.push('snapshot()');
  if (typeof handle.importProject !== 'function') missing.push('importProject()');
  if (handle.ready !== true) missing.push('ready===true');
  return missing.length ? { status: 'UNKNOWN', reason: '편집기 공개 API 일부 미노출', missing, api: EDITOR_API } : { status: 'READY', api: EDITOR_API };
}

/* Serialization-only SYNC provider for v3.editorProvider — clone + JSON.stringify(validate) ↔ validate(parse).
 * Baseline-protected: clones before serialize so the caller's input is never mutated. This exercises ONLY the
 * editor's save/serialize + core validate format roundtrip, NOT importProject image decode.
 * editorKind:'serialization-only', real:false — a v3 VERIFIED here is serialization fidelity, not real-editor. */
export function serializationProvider() {
  if (!K?.validate || !K?.clone) throw new Error('정본 코어가 없습니다');
  return Object.freeze({
    editorKind: 'serialization-only', real: false,
    save: (scene) => JSON.stringify(K.validate(K.clone(scene))),
    load: (text) => K.validate(JSON.parse(text))
  });
}

/* REAL editor roundtrip — ASYNC, browser-only. Imports the scene into a LIVE editor handle then exports its
 * snapshot through the real save path, comparing to a pristine baseline. PENDING when no live editor (headless),
 * reporting the exact browser-only API. `compare` is injected (e.g. v3 compareToCanonical) to stay fail-closed. */
export async function realEditorRoundtrip(baseline, handle, { compare } = {}) {
  const check = validateEditorHandle(handle);
  if (check.status !== 'READY') return { status: 'PENDING', kind: 'editor-real', reason: check.reason, missing: check.missing, api: EDITOR_API };
  if (!K?.clone || !K?.validate) return { status: 'UNKNOWN', kind: 'editor-real', reason: '정본 코어 없음' };
  try {
    const pristine = K.clone(K.validate(baseline));
    await handle.importProject(K.clone(pristine), false);     // real load into live editor (async, browser)
    const exported = K.validate(handle.snapshot());            // real export (clone of current())
    const serialized = JSON.stringify(exported);              // real save/serialize path (:574)
    const reloaded = K.validate(JSON.parse(serialized));
    const cmp = typeof compare === 'function' ? compare(reloaded, pristine) : { ok: JSON.stringify(reloaded) === JSON.stringify(pristine), diffs: [] };
    return { status: cmp.ok ? 'VERIFIED' : 'FAIL', kind: 'editor-real', real: true, diffs: cmp.diffs, serializedBytes: serialized.length };
  } catch (e) { return { status: 'FAIL', kind: 'editor-real', real: true, reason: e.message }; }
}

export const EDITOR_ROUNDTRIP_PORT = Object.freeze({
  completionId: 'CH1-2_5D-INTERACTIVE-RIFT-CONTINUATION-20261006-MAP-EDITOR-PORT-CANDIDATE',
  connects: 'scene-roundtrip-2_5d.v3.candidate.mjs editorProvider / editorRoundtrip',
  api: EDITOR_API,
  headlessStatus: 'serialization-only provider available; full importProject roundtrip PENDING (browser-only image decode)',
  mutates: 'none — read-only; real editor/visual/native adoption are root-owned gates'
});
