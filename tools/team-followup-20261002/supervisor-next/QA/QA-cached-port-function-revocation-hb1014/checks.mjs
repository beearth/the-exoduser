// QA-cached-port-function-revocation-hb1014
// 새 경계: 설치 중 const savedCreate = port.createReview 로 '함수'를 포획한 뒤,
//          uninstall / 설치실패 rollback 이후 savedCreate(request) 직접 호출이 여전히 실제 아이템을 만드는가.
//          (이전 residual-port task의 raw object reference / Proxy.revocable 단독 demo 와 구분 — 포획 '함수'가 핵심)
//
// 실제(실원문): browser-bootstrap-api.js 원문(vm) + 실제 createD10PersistenceIntegration factory
//   + 실제 createReview D10 binding(createNewIdentifiedD10Instance 등) + 실제 getOwnPropertyDescriptor.
// 대역/합성: rollback delete 실패 Proxy host(deleteProperty trap=false) = 실패 주입 대역;
//   mkItem random / D10 rng = ()=>0.5 합성(생성 로직은 실제); 가짜 counter port 사용 0.
// memory 후보: closure-guard-tied-to-installation-lifetime (source 미patch, productionApplied=false).
//
// 실제게임/사용자세이브/서버/Git/삭제 0. activation 0 / runtimeReady false 보존.
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

const ctx = vm.createContext({});
const mod = new vm.SourceTextModule(readFileSync(API_PATH, 'utf8'), {context: ctx, identifier: API_PATH});
await mod.link(() => { throw new Error('api 모듈 import 의존 없음'); });
await mod.evaluate();
const {installD10Review} = mod.namespace;
const {createD10PersistenceIntegration} = await import(pathToFileURL(INTEG_PATH).href);
const {createMkItemFixture} = await import(pathToFileURL(MK_PATH).href);

const REQUEST = {proposalOnly: true, uniqueId: 'UI-10', tier: 1, element: 0, baseRarity: 2};

// counters: factory/mkItem/rng(=storage는 proposal createReview 경로에 없음 → 0 by design)
function makeDeps(counters, {onInstalled, portWrap} = {}) {
  const mkItem = createMkItemFixture({random: () => { counters.rand++; return 0.5; }});
  return {
    reviewOnly: true,
    createPort: ({mkItem: mk, rng}) => {
      counters.factory++;
      const realPort = createD10PersistenceIntegration({mkItem: mk, rng});
      return portWrap ? portWrap(realPort) : realPort; // portWrap=후보 wrapper, 없으면 실제 raw port
    },
    mkItem: (...a) => { counters.mkItem++; return mkItem(...a); },
    rng: () => { counters.rng++; return 0.5; },
    ...(onInstalled ? {onInstalled} : {}),
  };
}
const snap = host => { const d = Object.getOwnPropertyDescriptor(host, PROP); return d ? {present: true, value: d.value} : {present: false}; };
const inst = x => (x && typeof x === 'object') ? `instance{uniqueId:${x.uniqueId},hasUniqueRoll:${Object.hasOwn(x, 'uniqueRoll')},keys:${Object.keys(x).length}}` : String(x);
const results = [];
const rec = o => results.push(o);

// ============ CONTROL: 정상 owned 동등성 (handle.create ≡ direct ≡ saved) — control 없이 PASS 금지 ============
(() => {
  const host = {};
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host, ...makeDeps(c)});
  const ownedPort = snap(host).value;
  const savedCreate = ownedPort.createReview;          // 설치 중 함수 포획
  const viaHandle = handle.create(REQUEST);
  const viaDirect = ownedPort.createReview(REQUEST);
  const viaSaved = savedCreate(REQUEST);
  const activationOk = ownedPort.enabled === false && ownedPort.runtimeReady === false && ownedPort.status === 'proposal';
  handle.uninstall();
  const ok = viaHandle.uniqueId === 'UI-10' && viaDirect.uniqueId === 'UI-10' && viaSaved.uniqueId === 'UI-10' && activationOk;
  rec({id: 'CONTROL-EQUIV', band: '정상 owned 동등성 control', verdict: ok ? 'PASS' : 'FAIL',
    expected: 'owned 상태에서 handle.create ≡ 직접 createReview ≡ 포획 savedCreate 모두 동일 D10 instance, enabled=false/runtimeReady=false/status=proposal',
    observed: `handle=${inst(viaHandle)} direct=${inst(viaDirect)} saved=${inst(viaSaved)} | activation보존=${activationOk}`,
    notes: '실제 factory/createReview 사용. 이 control이 성립해야 아래 defect/후보 판정 유효'});
})();

// ============ PRIMARY-A: 정상 uninstall 후 포획 함수 savedCreate 가 여전히 실제 아이템 생성 (defect) ============
(() => {
  const host = {};
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const handle = installD10Review({host, ...makeDeps(c)});
  const savedCreate = snap(host).value.createReview;   // 설치 중 함수 포획
  const close = handle.uninstall();                    // 정상 uninstall (delete 성공)
  const afterPresent = snap(host).present;
  let handleRejected = false; try { handle.create(REQUEST); } catch (e) { handleRejected = e.message === '해제/교체된 검토 포트 호출 금지'; }
  const before = {mkItem: c.mkItem, rng: c.rng, factory: c.factory};
  let savedResult = null, savedThrew = false; try { savedResult = savedCreate(REQUEST); } catch { savedThrew = true; }  // post-uninstall 직접 호출
  const calledAfter = {mkItem: c.mkItem - before.mkItem, rng: c.rng - before.rng, factory: c.factory - before.factory};
  const defect = !savedThrew && savedResult && savedResult.uniqueId === 'UI-10' && calledAfter.mkItem > 0 && calledAfter.rng > 0;
  rec({id: 'PRIMARY-A', band: '핵심 defect: 정상 uninstall 후 포획 함수 생존', verdict: defect ? 'DEFECT-CONFIRMED' : 'NO-DEFECT',
    expected: 'uninstall(restored) 후 handle.create 거부·descriptor absent 이지만 포획 savedCreate(request)는 실제 D10 instance 생성(factory/mkItem/rng 재호출)',
    observed: `close=${close.status} after.present=${afterPresent} handle거부=${handleRejected} | savedCreate=${inst(savedResult)} threw=${savedThrew} | post-uninstall 호출수 mkItem=${calledAfter.mkItem} rng=${calledAfter.rng}`,
    notes: '현행 source는 raw port를 설치 → 포획 함수는 closure(mkItem/rng) 기반이라 uninstall과 무관하게 동작'});
})();

// ============ PRIMARY-B: 설치실패 rollback(delete 실패) 후 포획 함수 savedCreate 생존 (defect) ============
(() => {
  const target = {}; let delHits = 0;
  const host = new Proxy(target, {deleteProperty(tt, p) { if (p === PROP) { delHits++; return false; } return Reflect.deleteProperty(tt, p); }});
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  let capturedHandle = null, savedCreate = null, agg = null;
  try {
    installD10Review({host, ...makeDeps(c, {onInstalled: h => { capturedHandle = h; savedCreate = host[PROP].createReview; throw new Error('late-install-failure'); }})});
  } catch (e) { agg = e; }
  const isAgg = agg && agg.constructor.name === 'AggregateError';
  const residual = snap(host).present;
  let handleRejected = false; try { capturedHandle && capturedHandle.create(REQUEST); } catch (e) { handleRejected = e.message === '해제/교체된 검토 포트 호출 금지'; }
  const before = {mkItem: c.mkItem, rng: c.rng};
  let savedResult = null, savedThrew = false; try { savedResult = savedCreate(REQUEST); } catch { savedThrew = true; }
  const calledAfter = {mkItem: c.mkItem - before.mkItem, rng: c.rng - before.rng};
  const defect = isAgg && delHits >= 1 && !savedThrew && savedResult && savedResult.uniqueId === 'UI-10' && calledAfter.mkItem > 0;
  rec({id: 'PRIMARY-B', band: '핵심 defect: 설치실패 rollback 후 포획 함수 생존', verdict: defect ? 'DEFECT-CONFIRMED' : 'NO-DEFECT',
    expected: 'AggregateError(설치실패+rollback delete 실패) 후 handle.create 거부, 그러나 onInstalled에서 포획한 savedCreate는 실제 D10 instance 생성',
    observed: `AggregateError=${isAgg} delHits=${delHits} residual=${residual} handle거부=${handleRejected} | savedCreate=${inst(savedResult)} threw=${savedThrew} | post-rollback 호출수 mkItem=${calledAfter.mkItem} rng=${calledAfter.rng}`,
    notes: 'onInstalled(api.js:45) 시점 host[prop]=port 이미 설치되어 함수 포획 가능. 실제 binding 실행'});
})();

// ============ REJECT-PROXY: 이전 task Proxy.revocable 단독 후보가 포획 함수를 놓침 → 기각 근거 ============
(() => {
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const deps = makeDeps(c);
  const realPort = deps.createPort({mkItem: deps.mkItem, rng: deps.rng});
  const {proxy, revoke} = Proxy.revocable(realPort, {});
  const savedCreate = proxy.createReview;              // revoke 전에 '함수' 포획(=raw 함수)
  const beforeOk = savedCreate(REQUEST).uniqueId === 'UI-10';
  revoke();                                            // Proxy 객체만 revoke
  let proxyAccessThrew = false; try { proxy.createReview; } catch { proxyAccessThrew = true; } // 객체 접근은 차단됨
  const before = {mkItem: c.mkItem};
  let savedStillWorks = false; try { savedStillWorks = savedCreate(REQUEST).uniqueId === 'UI-10'; } catch { /* */ }
  const leaked = c.mkItem - before.mkItem;
  const rejected = beforeOk && proxyAccessThrew && savedStillWorks && leaked > 0; // 포획 함수가 revoke 후에도 동작 → 기각
  rec({id: 'REJECT-PROXY', band: '기각 근거: Proxy 단독 revoke는 포획 함수 누수', verdict: rejected ? 'CANDIDATE-REJECTED' : 'UNEXPECTED',
    expected: 'revoke 후 proxy.createReview 접근은 TypeError지만, revoke 전 포획한 savedCreate(raw 함수)는 여전히 실제 아이템 생성 → Proxy 단독 후보 기각',
    observed: `revoke전=${beforeOk} proxy접근차단=${proxyAccessThrew} | revoke후 savedCreate 동작=${savedStillWorks} post-revoke mkItem=${leaked}`,
    notes: 'TASK 요건: Proxy 객체만 revoke하여 cached 함수를 놓치는 후보는 기각'});
})();

// ============ CANDIDATE: closure-guard-tied-to-installation-lifetime (포획 함수까지 무력화) ============
(() => {
  // 최소 memory 후보: raw port 대신 각 메서드를 installation lifetime 토큰(live)에 묶은 guard wrapper를 설치.
  // 포획 함수 savedCreate = wrapped.createReview 는 guard closure 이므로 revoke 후 호출 시 live 체크로 throw.
  // revoke 는 uninstall()/catch rollback 자리에 1줄 연결(최소 patch). 원 realPort 미파괴 → foreign preservation.
  function guardLifetime(realPort) {
    let live = true;
    const g = fn => (...a) => { if (!live) throw new Error('포트 수명 종료 · 포획 함수 호출 금지'); return fn.apply(realPort, a); };
    const wrapped = Object.freeze({
      status: realPort.status, enabled: realPort.enabled, runtimeReady: realPort.runtimeReady,
      createReview: g(realPort.createReview), readItem: g(realPort.readItem),
      restoreItem: g(realPort.restoreItem), serializeItem: g(realPort.serializeItem),
    });
    return {wrapped, revoke: () => { live = false; }, realPort};
  }
  let lifetime = null;
  const c = {factory: 0, mkItem: 0, rng: 0, rand: 0};
  const host = {};
  const handle = installD10Review({host, ...makeDeps(c, {portWrap: rp => { lifetime = guardLifetime(rp); return lifetime.wrapped; }})});
  const wrappedPort = snap(host).value;
  const savedCreate = wrappedPort.createReview;        // guard closure 포획
  const beforeOk = savedCreate(REQUEST).uniqueId === 'UI-10';
  const activationOk = wrappedPort.enabled === false && wrappedPort.runtimeReady === false && wrappedPort.status === 'proposal';
  // installation lifetime 종료(= uninstall/실패 rollback 시점에 wiring): api 미patch, 후보 hook 수동 호출
  handle.uninstall();           // 실제 api uninstall (descriptor 복원) — 원 소스 변경 0
  lifetime.revoke();            // 후보가 이 자리에 연결될 1줄
  const before = {mkItem: c.mkItem, rng: c.rng, factory: c.factory};
  let savedThrew = false, savedMsg = ''; try { savedCreate(REQUEST); } catch (e) { savedThrew = true; savedMsg = e.message; }
  const calledAfter = {mkItem: c.mkItem - before.mkItem, rng: c.rng - before.rng, factory: c.factory - before.factory};
  // foreign preservation: 원 realPort 자체는 파괴되지 않음(내부 재사용 가능), 단 host/외부에는 노출 안 됨
  const realPortIntact = lifetime.realPort.createReview(REQUEST).uniqueId === 'UI-10';
  const ok = beforeOk && activationOk && savedThrew && calledAfter.mkItem === 0 && calledAfter.rng === 0 && calledAfter.factory === 0 && realPortIntact;
  rec({id: 'CANDIDATE-GUARD', band: 'memory 후보: lifetime closure guard', verdict: ok ? 'CANDIDATE-VIABLE' : 'CANDIDATE-FAIL',
    expected: 'revoke 전 savedCreate 동작, revoke(=lifetime 종료) 후 savedCreate 호출이 throw + factory/mkItem/rng/storage 호출 0. 원 realPort 미파괴(foreign preservation). activation 보존',
    observed: `revoke전=${beforeOk} activation보존=${activationOk} | revoke후 savedCreate throw=${savedThrew}(${savedMsg}) post 호출수 mkItem=${calledAfter.mkItem} rng=${calledAfter.rng} factory=${calledAfter.factory} | realPort보존=${realPortIntact}`,
    minimalPatch: 'browser-bootstrap-api.js: 설치값을 guardLifetime(port).wrapped 로, uninstall()/catch rollback 자리에 lifetime.revoke() 1줄. 새 API/schema 0, productionApplied=false',
    notes: 'Proxy 단독(REJECT-PROXY)과 달리 포획 함수까지 lifetime에 묶여 무력화. storage 경로는 proposal createReview에 없어 0 by design'});
})();

console.log(JSON.stringify({
  checksPath: 'tools/team-followup-20261002/supervisor-next/QA/QA-cached-port-function-revocation-hb1014/checks.mjs',
  sha256: {'browser-bootstrap-api.js': sha(API_PATH), 'persistence-integration-port.js': sha(INTEG_PATH), 'mk-item-fixture.js': sha(MK_PATH)},
  nodeVersion: process.version, flags: ['--experimental-vm-modules'], ranAtUtc: t(),
  productionApplied: false, runtimeAccepted: false,
  checks: results,
}, null, 2));
