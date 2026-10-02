// QA 연속 후속 — bootstrap descriptor rollback 실패 한 경계
//
// 기존 claude-native-6/QA의 6검사(fresh/data/accessor 복원·다른 value 교체·close 멱등·정상 rollback)와
// 구분되는 **새 경계만** 검증한다. 핵심 새 입력 = rollback 실패(복원 불가) + 최소 음성 대조.
//
// 실제(실원문): browser-bootstrap-api.js 원문을 vm.SourceTextModule로 실행. 설치/rollback 본문,
//   descriptor same/restore/catch/finally, controller, 관측 Object.getOwnPropertyDescriptor 모두 실제.
// 대역(stand-in): 합성 host의 deleteProperty / defineProperty trap으로 delete/defineProperty '실패만' 주입.
//   trap은 실패 주입용 대역이며 getOwnPropertyDescriptor는 trap하지 않아 관측은 실제로 유지된다.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
//        --experimental-vm-modules checks.mjs
// 합성 host에만 설치/변경. 실제 window/index host 쓰기·삭제 0. realm 감사 확대 0.

import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_PATH = path.resolve(__dirname, '../../../team-followup-20261001/ITEM/browser-bootstrap-api.js');
const PROP = '_d10PersistenceReviewPort';
const EXPECT_API_SHA = 'dcea3ff9722dde2fd200ecf1fb55f6d742f70631918fa7276c089e5e775ae9eb';
const t = () => new Date().toISOString();

const srcBytes = readFileSync(API_PATH);
const apiSha = createHash('sha256').update(srcBytes).digest('hex');
const context = vm.createContext({});
const mod = new vm.SourceTextModule(srcBytes.toString('utf8'), {context, identifier: API_PATH});
await mod.link(() => { throw new Error('api 모듈은 import 의존 없음'); });
await mod.evaluate();
const {installD10Review, createD10ReviewController} = mod.namespace;

// 실제 포트 계약 최소 fixture. createPort/rng 호출 수를 카운트(선행 거부 검증용).
function makeCounters() { return {createPort: 0, rng: 0, mkItem: 0}; }
function baseDeps(counters, onInstalled) {
  return {
    reviewOnly: true,
    createPort: ({mkItem, rng}) => { counters.createPort++; return {
      enabled: false, runtimeReady: false, status: 'proposal',
      createReview(r) { return {kind: 'proposal', r}; },
      readItem(i) { return {kind: 'read', i}; },
      restoreItem(i) { return i; },
      serializeItem(i) { return {serialized: true}; },
    }; },
    mkItem: () => { counters.mkItem++; return {fixture: true}; },
    rng: () => { counters.rng++; return 0.5; },
    ...(onInstalled ? {onInstalled} : {}),
  };
}

// 관측: harness realm 실제 getOwnPropertyDescriptor (value/get/set/writable/enumerable/configurable)
function snap(host) {
  const d = Object.getOwnPropertyDescriptor(host, PROP);
  const has = Object.prototype.hasOwnProperty.call(host, PROP);
  if (!d) return {present: false, has};
  return {present: true, has, value: d.value, writable: d.writable,
    enumerable: d.enumerable, configurable: d.configurable, get: d.get, set: d.set};
}
const FIELDS = ['present', 'value', 'writable', 'enumerable', 'configurable', 'get', 'set'];
const sameSnap = (a, b) => FIELDS.every(f => a[f] === b[f]);
function brief(s) {
  if (!s || !s.present) return 'absent';
  if (s.get !== undefined || s.set !== undefined)
    return `accessor{get:${s.get ? 'fn' : 'u'},set:${s.set ? 'fn' : 'u'},enum:${s.enumerable},cfg:${s.configurable}}`;
  const v = (s.value && typeof s.value === 'object') ? ('port@' + s.value.status) : JSON.stringify(s.value);
  return `data{value:${v},w:${s.writable},enum:${s.enumerable},cfg:${s.configurable}}`;
}

const results = [];
function rec(o) { results.push(o); }

// ===== RB-NONCFG: 원 nonconfigurable property 선행 거부 (음성 대조) =====
(() => {
  const host = {};
  const locked = {value: 'LOCKED', writable: false, enumerable: false, configurable: false};
  Object.defineProperty(host, PROP, locked);
  const T0 = snap(host);
  const c = makeCounters();
  let threw = false, msg = '';
  try { installD10Review({host, ...baseDeps(c)}); } catch (e) { threw = true; msg = e.message; }
  const T1 = snap(host);
  const ok = threw && msg === '원 비구성 property 보존' &&
    c.createPort === 0 && c.rng === 0 && c.mkItem === 0 &&   // factory/RNG 호출 전 거부
    sameSnap(T0, T1) && T1.configurable === false && T1.value === 'LOCKED' &&
    T1.get === undefined && T1.set === undefined;
  rec({id: 'RB-NONCFG', name: '원 nonconfigurable property 선행 거부', band: '음성 대조(새 경계)',
    verdict: ok ? 'PASS' : 'FAIL',
    input: "host[prop]={value:'LOCKED',writable:false,enumerable:false,configurable:false}",
    expected: "api.js:16 즉시 throw '원 비구성 property 보존', createPort/rng/mkItem 호출 0, 원 descriptor 6필드 불변",
    observed: `throw=${threw}(${msg}) | createPort=${c.createPort} rng=${c.rng} mkItem=${c.mkItem} | T0=${brief(T0)} T1=${brief(T1)} 불변=${sameSnap(T0, T1)}`,
    restoration: '원 property 변경 없음(설치 미착수)',
    notes: 'configurable===false 가드가 pending.add·factory·host 교체 검사보다 선행함(api.js:16 < 17)'});
})();

// ===== RB-FLAG: 설치 뒤 같은 value, flag만 변경 → same=false·foreign-preserved·미덮어쓰기 =====
(() => {
  const host = {};
  const c = makeCounters();
  const handle = installD10Review({host, ...baseDeps(c)});
  const T1 = snap(host);                       // installed: value=port, writable:true, enum:false, cfg:true
  const port = T1.value;
  // 외부가 value는 동일 port로 두고 writable만 true→false 로 변경 (이전 CE-FOR의 '다른 value'와 구분)
  Object.defineProperty(host, PROP, {value: port, writable: false, enumerable: false, configurable: true});
  const T2 = snap(host);
  // 소유권 후속 호출: handle.create → assertOwned가 same 불일치로 거부되어야 함
  let createThrew = false, createMsg = '';
  try { handle.create({x: 1}); } catch (e) { createThrew = true; createMsg = e.message; }
  const close = handle.uninstall();
  const T3 = snap(host);
  const ok =
    T1.writable === true && T1.value === port &&
    T2.value === port && T2.writable === false &&        // 같은 value, flag만 변경
    createThrew && createMsg === '해제/교체된 검토 포트 호출 금지' &&
    close.status === 'foreign-preserved' &&
    sameSnap(T2, T3) && T3.writable === false;           // 원 installed flag(writable:true)로 덮어쓰지 않음
  rec({id: 'RB-FLAG', name: '설치 뒤 같은 value·flag 변경 → 소유권 상실', band: '새 경계',
    verdict: ok ? 'PASS' : 'FAIL',
    input: '설치 후 외부가 value=동일 port 유지, writable만 true→false (다른 value 아님)',
    expected: "same()이 writable 차이로 false → handle.create 거부('해제/교체된 검토 포트 호출 금지') → uninstall=foreign-preserved → T3가 변경된 flag(writable:false) 보존(원값으로 덮어쓰지 않음)",
    observed: `T1=${brief(T1)} | T2=${brief(T2)}(value===port:${T2.value === port}) | create거부=${createThrew}(${createMsg}) | close=${close.status} | T3=${brief(T3)} T3==T2=${sameSnap(T2, T3)}`,
    restoration: '의도된 foreign-preserved — 외부 변경 보존(복원 생략은 설계)',
    notes: 'same은 value/get/set/writable/enumerable/configurable 6필드 AND 비교(api.js:5-7). value 동일해도 flag 1개 차이로 소유권 상실'});
})();

// ===== RB-DELFAIL: 늦은 실패 후 restore(delete) 실패 → AggregateError, 원복 불가(잔존 port) =====
(() => {
  // 대역: deleteProperty trap만 PROP에 대해 false 반환(삭제 실패 주입). 그 외 trap 없음 → 관측/정의는 실제.
  const target = {};
  let delTrapHits = 0;
  const host = new Proxy(target, {
    deleteProperty(tt, p) { if (p === PROP) { delTrapHits++; return false; } return Reflect.deleteProperty(tt, p); },
  });
  const T0 = snap(host);                        // absent → restore는 delete 분기(api.js:26 else)
  const c = makeCounters();
  let caught = null;
  // 늦은 설치 실패: onInstalled(api.js:45)에서 throw
  try {
    installD10Review({host, ...baseDeps(c, () => { throw new Error('late-install-failure'); })});
  } catch (e) { caught = e; }
  const Tend = snap(host);
  const isAgg = caught && caught.constructor && caught.constructor.name === 'AggregateError';
  const errs = isAgg ? caught.errors.map(e => e && e.message) : [caught && caught.message];
  const ok =
    T0.present === false && delTrapHits >= 1 &&
    isAgg && caught.message === '설치 실패 및 rollback 실패' &&
    errs[0] === 'late-install-failure' && errs[1] === '검토 property 정리 실패' &&
    Tend.present === true && Tend.value && Tend.value.status === 'proposal';   // 잔존: 설치 port 남음
  rec({id: 'RB-DELFAIL', name: 'rollback(delete) 실패 → 원복 불가', band: '핵심 새 경계: rollback 실패',
    verdict: ok ? 'OBSERVED-FAILURE' : 'FAIL',
    input: 'fresh host(Proxy, deleteProperty trap=false 대역) + onInstalled throw(늦은 설치 실패)',
    expected: "catch에서 same==installed → restore→Reflect.deleteProperty 실패 → '검토 property 정리 실패' → AggregateError([late-install-failure, 검토 property 정리 실패],'설치 실패 및 rollback 실패'). 원 property(absent) 복원 불가, 잔존=설치 port",
    observed: `T0=${brief(T0)} | delTrapHits=${delTrapHits} | AggregateError=${isAgg} msg='${caught && caught.message}' errors=${JSON.stringify(errs)} | 잔존 Tend=${brief(Tend)}`,
    restoration: 'RESIDUAL(잔존) — 원 property 복원 보장 불가. host에 설치 port가 남음. PASS로 정리하지 않음',
    notes: 'deleteProperty만 대역(실패 주입). install/rollback 본문·getOwnPropertyDescriptor는 실제 원문'});
})();

// ===== RB-DEFFAIL: 기존 data original, restore(defineProperty) 실패 → AggregateError, 원 data 소실 =====
(() => {
  // 대역: defineProperty trap이 PROP 2회차(복원)만 false. 1회차(설치)는 허용 → 관측은 실제.
  const target = {};
  Object.defineProperty(target, PROP, {value: 'ORIG-DATA', writable: true, enumerable: true, configurable: true});
  let defHits = 0;
  const host = new Proxy(target, {
    defineProperty(tt, p, desc) {
      if (p === PROP) { defHits++; if (defHits >= 2) return false; } // 2회차=restore → 실패 주입
      return Reflect.defineProperty(tt, p, desc);
    },
  });
  const T0 = snap(host);
  const c = makeCounters();
  let caught = null;
  try {
    installD10Review({host, ...baseDeps(c, () => { throw new Error('late-install-failure'); })});
  } catch (e) { caught = e; }
  const Tend = snap(host);
  const isAgg = caught && caught.constructor && caught.constructor.name === 'AggregateError';
  const errs = isAgg ? caught.errors.map(e => e && (e.message || String(e))) : [caught && caught.message];
  const ok =
    T0.present === true && T0.value === 'ORIG-DATA' && defHits >= 2 &&
    isAgg && caught.message === '설치 실패 및 rollback 실패' &&
    errs[0] === 'late-install-failure' &&
    Tend.present === true && Tend.value && Tend.value.status === 'proposal' &&  // 잔존 port, 원 ORIG-DATA 소실
    Tend.value !== 'ORIG-DATA';
  rec({id: 'RB-DEFFAIL', name: 'rollback(defineProperty) 실패 → 원 data 소실', band: '핵심 새 경계: rollback 실패',
    verdict: ok ? 'OBSERVED-FAILURE' : 'FAIL',
    input: "host[prop]={value:'ORIG-DATA',...} (Proxy, defineProperty 2회차=restore만 false 대역) + onInstalled throw",
    expected: "catch에서 restore→Object.defineProperty(원 data) 실패(TypeError) → AggregateError. 원 data 복원 불가, 잔존=설치 port(원 ORIG-DATA 소실)",
    observed: `T0=${brief(T0)} | defHits=${defHits} | AggregateError=${isAgg} msg='${caught && caught.message}' errors=${JSON.stringify(errs)} | 잔존 Tend=${brief(Tend)}`,
    restoration: 'RESIDUAL(잔존) — 원 data descriptor 복원 보장 불가, 소실. 잔존=설치 port. PASS로 정리하지 않음',
    notes: 'defineProperty 2회차만 대역(실패 주입). 설치 defineProperty·관측은 실제'});
})();

// ===== RB-SKIP: onInstalled가 descriptor 외부변경 후 throw → restore 생략(AggregateError 아님) =====
(() => {
  // rollback 실패와 혼동 금지: 이미 외부 변경되어 same!=installed면 catch가 restore를 '생략'하고 원오류만 재throw
  const host = {};
  const T0 = snap(host);
  const c = makeCounters();
  let caught = null;
  try {
    installD10Review({host, ...baseDeps(c, () => {
      Object.defineProperty(host, PROP, {value: 'FOREIGN-IN-CB', writable: true, enumerable: true, configurable: true});
      throw new Error('late-install-failure');
    })});
  } catch (e) { caught = e; }
  const Tend = snap(host);
  const isAgg = caught && caught.constructor && caught.constructor.name === 'AggregateError';
  const ok =
    T0.present === false && caught && !isAgg && caught.message === 'late-install-failure' &&  // 원오류만, AggregateError 아님
    Tend.present === true && Tend.value === 'FOREIGN-IN-CB';                                   // 외부 변경 보존(restore 생략)
  rec({id: 'RB-SKIP', name: 'descriptor 외부변경 후 실패 → restore 생략', band: '새 경계(혼동 방지 대조)',
    verdict: ok ? 'PASS' : 'FAIL',
    input: 'onInstalled이 host[prop]=FOREIGN-IN-CB로 변경한 뒤 throw',
    expected: "catch에서 same(descriptor,installed)=false → restore 생략 → 원오류 'late-install-failure'만 재throw(AggregateError 아님). 외부 변경값 보존",
    observed: `T0=${brief(T0)} | err='${caught && caught.message}' AggregateError=${isAgg} | 잔존 Tend=${brief(Tend)}`,
    restoration: 'restore 생략(설계) — 외부가 이미 교체했으므로 원복 시도 안 함. 잔존=외부값. rollback 실패(RB-DELFAIL/DEFFAIL)와 구분',
    notes: 'catch의 same 분기(api.js:50): 외부 변경 시 restore 생략→AggregateError 미발생. 삭제/정의 실패 경로와 명확히 다름'});
})();

// ---- 출력 ----
const byVerdict = results.reduce((a, r) => (a[r.verdict] = (a[r.verdict] || 0) + 1, a), {});
console.log(JSON.stringify({
  apiPath: path.relative(path.resolve(__dirname, '../../../..'), API_PATH),
  apiSha256: apiSha, apiShaMatchesContract: apiSha === EXPECT_API_SHA,
  nodeVersion: process.version, flags: ['--experimental-vm-modules'], ranAtUtc: t(),
  tally: byVerdict, total: results.length, checks: results,
}, null, 2));
