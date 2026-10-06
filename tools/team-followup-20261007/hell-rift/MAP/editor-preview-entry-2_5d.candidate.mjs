/* MAP editor preview-entry adapter — CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE
 *
 * Read-only glue. Changes NO current scene / history / save / player / shared editor / root lab / docs / nav / PNG.
 * On each click it reads the live editor snapshot+selection FRESH, verifies canonical via the public
 * assessRegistration (rejecting crop/nav/background/resident-placement drift), resolves the selected resident's
 * approach via the public prepareResidentPreview, then awaits a borrowed previewPort.enter(). Epochs invalidate
 * on cancel/dispose/next-click; a late-returned restore handle is disposed exactly once; on any failure the
 * existing pose is kept.
 *
 * Consumed public APIs (source:line, Read-verified this session):
 *   - assessRegistration(scene,{canonicalBytes,...})  tools/2_5d/scene-registration.mjs:141 (pin+canonicalCompare+transforms+projection+profile+nav1192 ⇒ ok)
 *   - prepareResidentPreview(scene,npcId,canWalk)->{ready,npcId,objectId,player(approach),foot,report}  tools/map-scene-resident-preview.mjs:22
 *   - editor handle EXODUSER_SCENE_EDITOR.snapshot()/selection()/ready  tools/map-scene-editor.js:618
 *   - MapSceneCore.canWalk  tools/map-scene-core.js:110
 *
 * Lifetime: OWNED = epoch counter, activeHandle, disposed flag, and every restore handle obtained from
 *   previewPort.enter (this adapter disposes them). BORROWED = readEditor's editor handle, previewPort,
 *   canonicalBytes (never disposed here).
 */
import '../../../map-scene-core.js';
import { assessRegistration } from '../../../2_5d/scene-registration.mjs';
import { prepareResidentPreview } from '../../../map-scene-resident-preview.mjs';

const K = globalThis.MapSceneCore;
const NPC_BY_OBJECT = new Map([
  ['obj-resident-haran', 'rift-rest-haran'], ['obj-resident-berin', 'rift-gift-berin'],
  ['obj-resident-nessa', 'rift-request-nessa'], ['obj-resident-dorik', 'rift-prepare-dorik']
]);

export function createEditorPreviewEntry({ readEditor, canonicalBytes = null, previewPort } = {}) {
  if (typeof readEditor !== 'function') throw new Error('readEditor 함수가 필요합니다 (borrowed)');
  if (!previewPort || typeof previewPort.enter !== 'function') throw new Error('previewPort.enter 가 필요합니다 (borrowed)');
  let epoch = 0, activeHandle = null, disposed = false;
  const disposedHandles = new WeakSet();
  const disposeHandle = (h) => { if (!h || (typeof h === 'object' && disposedHandles.has(h))) return; if (typeof h === 'object') disposedHandles.add(h); try { h.dispose?.(); } catch { /* idempotent */ } try { h.restore?.(); } catch { /* idempotent */ } };

  async function enter() {
    if (disposed) return { entered: false, reason: 'disposed' };
    const myEpoch = ++epoch;                       // invalidate any in-flight/previous request
    const priorActive = activeHandle;              // kept until a successful commit → pose preserved on failure
    const ed = readEditor();                       // fresh editor read every click (borrowed)
    if (!ed || typeof ed.snapshot !== 'function' || typeof ed.selection !== 'function' || ed.ready !== true)
      return { entered: false, reason: '편집기 핸들/스냅샷/선택 API 없음' };
    let scene, objectId;
    try { scene = ed.snapshot(); objectId = ed.selection(); } catch (e) { return { entered: false, reason: '편집기 스냅샷/선택 읽기 실패: ' + e.message }; }
    const npcId = NPC_BY_OBJECT.get(objectId);
    if (!npcId) return { entered: false, reason: '선택이 주민 객체가 아닙니다: ' + objectId };
    // Canonical gate: reject crop/nav/background/resident-placement drift. No scene/history/save mutation.
    let reg; try { reg = await assessRegistration(scene, { canonicalBytes }); } catch (e) { return { entered: false, reason: 'assessRegistration 실패: ' + e.message }; }
    if (disposed || epoch !== myEpoch) return { entered: false, reason: 'invalidated(assess)' };
    if (!reg.ok) return { entered: false, reason: 'canonical 불일치(crop/nav/배경/주민 배치 — 거절)', assess: { pin: reg.pin?.status, canonicalCompare: reg.canonicalCompare?.status, walkableCount: reg.walkableCount } };
    // Existing approach point (fresh nav recheck); no new geometry computed/rebuilt.
    const prep = prepareResidentPreview(scene, npcId, (sc, x, y, r) => K.canWalk(sc, x, y, r));
    if (!prep.ready) return { entered: false, reason: prep.reason };
    let handle; try { handle = await previewPort.enter({ npcId, objectId, x: prep.player.x, y: prep.player.y }); } catch (e) { return { entered: false, reason: 'previewPort.enter 실패: ' + e.message }; }
    if (disposed || epoch !== myEpoch) { disposeHandle(handle); return { entered: false, reason: 'invalidated(late) — restore handle 폐기, 기존 pose 유지' }; }
    if (priorActive && priorActive !== handle) disposeHandle(priorActive);   // replace prior preview once
    activeHandle = handle;
    return { entered: true, npcId, objectId, player: { ...prep.player }, assess: { walkableCount: reg.walkableCount } };
  }

  function cancel() { if (disposed) return; epoch++; }   // invalidate in-flight; its late handle is disposed on resolve

  function dispose() { if (disposed) return; disposed = true; epoch++; disposeHandle(activeHandle); activeHandle = null; }

  return Object.freeze({ enter, cancel, dispose });
}

export const EDITOR_PREVIEW_ENTRY = Object.freeze({
  completionId: 'CH1-RIFT-EDITOR-ENTRY-20261007-MAP-CANDIDATE',
  consumes: ['assessRegistration', 'prepareResidentPreview', 'EXODUSER_SCENE_EDITOR.snapshot/selection', 'borrowed previewPort.enter'],
  owned: 'epoch, activeHandle, disposed, restore handles from previewPort.enter (adapter disposes these)',
  borrowed: 'editor handle (readEditor), previewPort, canonicalBytes (never disposed here)',
  invariants: 'fresh editor read per click; canonical drift rejected; epoch invalidation; late handle disposed once; pose kept on failure; no scene/history/save/shared-file mutation',
  mutates: 'none — read-only; real editor button + lab port + GPU/screen are root-owned gates (PENDING)'
});
