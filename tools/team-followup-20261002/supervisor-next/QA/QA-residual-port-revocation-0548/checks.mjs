// QA 작업감독 후속 — QA-residual-port-revocation-0548
// 새 경계: rollback delete 실패 후 host에 잔존한 raw _d10PersistenceReviewPort 의
//          직접 메서드 호출 수명(lifetime) vs handle.assertOwned 거부.
//
// 실제(실원문):
//   - browser-bootstrap-api.js 원문을 vm.SourceTextModule로 실행(설치/rollback/assertOwned/same/restore).
//   - createPort = 실제 createD10PersistenceIntegration (persistence-integration-port.js, 실제 factory 재사용,
//     가짜 counter port 아님). port.createReview는 실제 binding(createNewIdentifiedD10Instance 등) 실행.
//   - 관측 Object.getOwnPropertyDescriptor 는 harness realm 실제.
// 합성/대역:
//   - mkItem = 실제 createMkItemFixture({random: 합성 ()=>0.5})  (random만 합성, 생성 로직은 실제)
//   - rng = 합성 ()=>0.5 (D10 roll RNG)
//   - rollback delete 실패 host = 합성 Proxy(deleteProperty trap=false) — 실패 주입용 대역. 1 사건만.
//   - revocation 후보 데모 = 격리된 로컬 Proxy.revocable (실제 source 미반영, productionApplied=false).
//
// 실제 window/브라우저/UI/저장/서버 0. 외부 descriptor 강제정리/추가삭제 0.
// 실행: node --experimental-vm-modules checks.mjs

import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath, pathToFileURL} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ITEM = path.resolve(__dirname, '../../../../team-followup-20261001/ITEM');
const API_PATH = path.join(ITEM, 'browser-bootstrap-api.js');
const INTEG_PATH = path.join(ITEM, 'browser-host/persistence-integration-port.js');
const MK_PATH = path.join(ITEM, 'browser-host/mk-item-fixture.js');
const PROP = '_d10PersistenceReviewPort';
const t = () => new Date().toISOString();
const sha = p => createHash('sha256').update(readFileSync(p)).digest('hex');

// 실제 source 원문 → VM
const apiBytes = readFileSync(API_PATH);
const ctx = vm.createContext({});
const mod = new vm.SourceTextModule(apiBytes.toString('utf8'), {context: ctx, identifier: API_PATH});
await mod.link(() => { throw new Error('api 모듈 import 의존 없음'); });
await mod.evaluate();
const {installD10Review} = mod.namespace;

// 실제 factory / 실제 mkItem fixture 재사용
const {createD10PersistenceIntegration} = await import(pathToFileURL(INTEG_PATH).href);
const {createMkItemFixture} = await import(pathToFileURL(MK_PATH).href);

const REQUEST = {proposalOnly: true, uniqueId: 'UI-10', tier: 1, element: 0, baseRarity: 2};
function makeDeps(counters, onInstalled) {
  const mkItem = createMkItemFixture({random: () => { counters.rand++; return 0.5; }}); // random만 합성
  return {
    reviewOnly: true,
    createPort: ({mkItem: mk, rng}) => { counters.factory++; return createD10PersistenceIntegration({mkItem: mk, rng}); }, // 실제 factory
    mkItem: (...a) => { counters.mkItem++; return mkItem(...a); },
    rng: () => { counters.rng++; return 0.5; }, // 합성 D10 RNG
    ...(onInstalled ? {onInstalled} : {}),
  };
}
function snap(host) {
  const d = Object.getOwnPropertyDescriptor(host, PROP);
  if (!d) return {present: false};
  return {present: true, value: d.value, writable: d.writable, enumerable: d.enumerable, configurable: d.configurable, get: d.get, set: d.set};
}
const portBrief = p => p && typeof p === 'object'
  ? `port{status:${p.status},enabled:${p.enabled},runtimeReady:${p.runtimeReady},createReview:${typeof p.createReview}}` : String(p);
function instanceBrief(x) {
  if (!x || typeof x !== 'object') return String(x);
  return `instance{uniqueId:${x.uniqueId},hasUniqueRoll:${Object.hasOwn(x, 'uniqueRoll')},keys:${Object.keys(x).length}}`;
}

const results = [];
const rec = o => results.push(o);

// ===== RESID-LIFETIME: rollback delete 실패 1 사건 — 잔존 raw port 직접 호출 vs handle 거부 =====
let residualDirectWorks = false, residualPortRef = null;
(() => {
  const target = {};
  let delHits = 0;
  const host = new Proxy(target, {
    deleteProperty(tt, p) { if (p === PROP) { delHits++; return false; } return Reflect.deleteProperty(tt, p); },
  });
  const counters = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  let capturedHandle = null, agg = null;
  try {
    installD10Review({host, ...makeDeps(counters, h => { capturedHandle = h; throw new Error('late-install-failure'); })});
  } catch (e) { agg = e; }

  const isAgg = agg && agg.constructor && agg.constructor.name === 'AggregateError';
  const aggErrs = isAgg ? agg.errors.map(e => e && (e.message || String(e))) : [agg && agg.message];
  const Tresid = snap(host);
  residualPortRef = Tresid.present ? Tresid.value : null;

  // (a) handle.create → assertOwned가 active=false 로 거부해야 함
  let handleRejected = false, handleMsg = '';
  try { capturedHandle && capturedHandle.create(REQUEST); } catch (e) { handleRejected = true; handleMsg = e.message; }

  // (b) 잔존 raw port 직접 createReview → 가드 없이 실제 실행되는가
  let directResult = null, directThrew = false, directMsg = '';
  try { directResult = residualPortRef && residualPortRef.createReview(REQUEST); }
  catch (e) { directThrew = true; directMsg = e.message; }
  residualDirectWorks = !directThrew && !!directResult;

  const sameRef = residualPortRef && capturedHandle && residualPortRef === Tresid.value;
  const ok = isAgg && aggErrs[0] === 'late-install-failure' && aggErrs[1] === '검토 property 정리 실패'
    && delHits >= 1 && Tresid.present === true
    && handleRejected && handleMsg === '해제/교체된 검토 포트 호출 금지'
    && residualDirectWorks && directResult && directResult.uniqueId === 'UI-10';

  rec({
    id: 'RESID-LIFETIME', band: '핵심 새 경계: 잔존 raw port 직접 호출 수명',
    verdict: ok ? 'OBSERVED-LIFETIME-LEAK' : 'FAIL',
    input: 'rollback delete 실패 Proxy host(대역) 1 사건: onInstalled에서 handle 포획 후 throw → AggregateError → 잔존 port',
    expected: 'handle.create 는 assertOwned(active=false)로 거부, 그러나 잔존 raw host[prop].createReview 직접호출은 가드 없이 실제 D10 instance 반환(수명 지속)',
    observed: `AggregateError=${isAgg} errors=${JSON.stringify(aggErrs)} delHits=${delHits} | 잔존=${portBrief(residualPortRef)} sameRef=${sameRef} | handle.create 거부=${handleRejected}(${handleMsg}) | 직접 createReview: threw=${directThrew}${directMsg ? '(' + directMsg + ')' : ''} result=${instanceBrief(directResult)} | factory=${counters.factory} mkItem=${counters.mkItem} rng=${counters.rng}`,
    finding: 'handle은 revoke(active=false)되나 host에 잔존한 raw port 객체는 revocation이 없어 직접 메서드 호출이 계속 가능 → 수명 누수',
    productionEvidence: 'persistence-integration-port.js:29-39 persistenceReviewCallsite 가 window._d10PersistenceReviewPort 를 직접 읽어 port.createReview(request) 호출 — 생산 callsite가 handle이 아닌 raw port를 직접 사용함',
    restoration: 'RESIDUAL — 원 property 복원 실패(delete 불가)로 raw port 잔존. 외부 강제정리 0. PASS로 정리하지 않음',
    notes: '실제 factory/createReview/binding 실행(가짜 counter 아님). delete 실패 host만 대역. mkItem random/rng만 합성',
  });
})();

// ===== NORMAL-CMP: 정상 installed 포트 1 대조 (handle.create vs 직접 createReview, 같은 요청) =====
(() => {
  const host = {};
  const counters = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host, ...makeDeps(counters)});
  const T1 = snap(host);
  const ownedPort = T1.value;

  let viaHandle = null, hThrew = false;
  try { viaHandle = handle.create(REQUEST); } catch (e) { hThrew = true; }
  let viaDirect = null, dThrew = false;
  try { viaDirect = ownedPort.createReview(REQUEST); } catch (e) { dThrew = true; }

  // 정상 uninstall (delete 성공) → descriptor 제거. 단, 보관한 raw 참조는 여전히 호출 가능한가?
  const close = handle.uninstall();
  const Tafter = snap(host);
  let afterHandleRejected = false;
  try { handle.create(REQUEST); } catch (e) { afterHandleRejected = e.message === '해제/교체된 검토 포트 호출 금지'; }
  let retainedRefStillCallable = false;
  try { const r = ownedPort.createReview(REQUEST); retainedRefStillCallable = !!(r && r.uniqueId === 'UI-10'); } catch { /* */ }

  const ok = !hThrew && !dThrew && viaHandle && viaDirect
    && viaHandle.uniqueId === 'UI-10' && viaDirect.uniqueId === 'UI-10'
    && close.status === 'restored' && Tafter.present === false
    && afterHandleRejected && retainedRefStillCallable; // 삭제돼도 보관 raw 참조는 호출됨(수명)
  rec({
    id: 'NORMAL-CMP', band: '정상 포트 1 대조',
    verdict: ok ? 'PASS' : 'FAIL',
    input: '정상 install → handle.create 와 ownedPort.createReview 를 같은 요청으로 1회 대조, 이후 정상 uninstall',
    expected: 'owned 상태에서 handle.create 와 직접 createReview 모두 동일 요청에 D10 instance 반환. uninstall(delete 성공) 후 handle.create 거부·descriptor absent. 단 보관된 raw 참조는 여전히 호출 가능(port 객체에 revocation 없음)',
    observed: `handle.create=${instanceBrief(viaHandle)} | 직접=${instanceBrief(viaDirect)} | close=${close.status} after.present=${Tafter.present} | uninstall후 handle.create 거부=${afterHandleRejected} | 보관 raw 참조 호출가능=${retainedRefStillCallable}`,
    finding: '정상 경로에서도 raw port 객체 자체는 neutralize되지 않음 — descriptor 삭제만으로는 보관된 참조의 수명을 끝내지 못함(잔존과 동일한 근본 원인)',
    restoration: '정상 restored(delete 성공) — descriptor absent',
    notes: '같은 요청 1 대조만. 실제 factory/createReview 사용',
  });
})();

// ===== REVOKE-CAND: revocation/owned wrapper 메모리 후보 1개 (격리 데모, 생산 미반영) =====
(() => {
  // 후보: raw port 대신 Proxy.revocable(port) 를 host에 설치하고, uninstall/rollback-실패 시 revoke().
  // foreign preservation 보존: descriptor value(wrapper)·host는 그대로 두고 메서드만 무력화(삭제 0).
  // 여기서는 실제 source를 patch하지 않고 격리 데모로 '직접 호출 수명이 끊기는지'만 대조한다.
  const counters = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const deps = makeDeps(counters);
  const realPort = deps.createPort({mkItem: deps.mkItem, rng: deps.rng});
  const {proxy: wrapped, revoke} = Proxy.revocable(realPort, {});

  let beforeOk = false;
  try { const r = wrapped.createReview(REQUEST); beforeOk = !!(r && r.uniqueId === 'UI-10'); } catch { /* */ }
  revoke(); // = uninstall/rollback-실패 시점의 수명 종료 (descriptor/foreign 삭제 없이)
  let afterThrew = false, afterMsg = '';
  try { wrapped.createReview(REQUEST); } catch (e) { afterThrew = true; afterMsg = e.constructor.name; }
  // 원 realPort 참조는 보존됨(후보가 원 port를 파괴하지 않음 → foreign preservation 성립)
  let rawPortIntact = false;
  try { const r = realPort.createReview(REQUEST); rawPortIntact = !!(r && r.uniqueId === 'UI-10'); } catch { /* */ }

  const ok = beforeOk && afterThrew && rawPortIntact;
  rec({
    id: 'REVOKE-CAND', band: '메모리 후보(격리 데모, 생산 미반영)',
    verdict: ok ? 'CANDIDATE-VIABLE' : 'CANDIDATE-UNKNOWN',
    input: 'Proxy.revocable(realPort) 를 설치값으로 쓰는 가정. revoke()로 수명 종료(descriptor/foreign 삭제 0)',
    expected: 'revoke 전 직접 호출 가능 → revoke 후 직접 호출이 TypeError(revoked)로 차단 → 원 realPort는 파괴되지 않아 foreign preservation 성립',
    observed: `revoke전 호출=${beforeOk} | revoke후 차단=${afterThrew}(${afterMsg}) | 원 port 보존=${rawPortIntact}`,
    finding: ok
      ? 'revocable wrapper 1개로 잔존/보관참조의 직접 호출 수명을 끊을 수 있음(개념 검증). 단 new API/schema 아님, source 미patch, productionApplied=false'
      : '후보 데모 미검증',
    productionApplied: false,
    notes: '격리 데모 — 실제 browser-bootstrap-api.js 수정 0. 후보는 1개만 대조. 외부 descriptor 강제정리/추가삭제 0',
  });
})();

console.log(JSON.stringify({
  apiPath: path.relative(path.resolve(__dirname, '../../../../..'), API_PATH),
  sha256: {
    'browser-bootstrap-api.js': sha(API_PATH),
    'persistence-integration-port.js': sha(INTEG_PATH),
    'mk-item-fixture.js': sha(MK_PATH),
  },
  nodeVersion: process.version, flags: ['--experimental-vm-modules'], ranAtUtc: t(),
  residualDirectCallPossible: residualDirectWorks,
  productionApplied: false,
  checks: results,
}, null, 2));
