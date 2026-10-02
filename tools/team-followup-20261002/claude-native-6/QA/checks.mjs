// VS Code Claude QA — native-descriptor-contract-fixture
// browser-bootstrap-api.js 실제 설치/해제 원문을 Node VM 합성 host에서 실행하여
// descriptor(value/get/set/writable/enumerable/configurable) 전후 보존을 검수한다.
//
// 실행: /Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node \
//        --experimental-vm-modules checks.mjs
//
// 규칙 준수: 실제 source 함수 원문만 VM으로 로드(사본 게임 생성 0). UI/실게임/새서버/CSP
// 평가 0. 16검사 반복 0. 관측은 harness realm의 실제 Object.getOwnPropertyDescriptor로 수행.
// host.js의 uninstall 반환값 폐기 UI표시는 코드평가 대상이 아니며 result.md에 미적용 제안으로 기록.

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

// ---- 1. 실제 source 원문 로드 + SHA 대조 ----
const srcBytes = readFileSync(API_PATH);
const apiSha = createHash('sha256').update(srcBytes).digest('hex');
const srcText = srcBytes.toString('utf8');

// ---- 2. 원문을 Node VM SourceTextModule로 실행 (사본 아님, 실제 바이트) ----
const context = vm.createContext({});
const mod = new vm.SourceTextModule(srcText, {context, identifier: API_PATH});
await mod.link(() => { throw new Error('api 모듈은 import 의존이 없어야 함'); });
await mod.evaluate();
const {installD10Review, createD10ReviewController} = mod.namespace;

// ---- 3. 합성 의존(실제 포트 계약 충족 최소 fixture) ----
function makePort() {
  return {
    enabled: false, runtimeReady: false, status: 'proposal',
    createReview(r) { return {kind: 'proposal-review', request: r}; },
    readItem(i) { return {kind: 'read', item: i}; },
    restoreItem(i) { return i; },
    serializeItem(i) { return {serialized: true, from: i}; },
  };
}
const deps = (onInstalled) => ({
  reviewOnly: true,
  createPort: ({mkItem, rng}) => makePort(),
  mkItem: () => ({fixture: true}),
  rng: () => 0.5,
  ...(onInstalled ? {onInstalled} : {}),
});

// ---- 4. 관측 원시연산: harness realm의 실제 getOwnPropertyDescriptor ----
function snap(host) {
  const d = Object.getOwnPropertyDescriptor(host, PROP);
  const has = Object.prototype.hasOwnProperty.call(host, PROP);
  if (!d) return {present: false, has, value: undefined, writable: undefined,
    enumerable: undefined, configurable: undefined, get: undefined, set: undefined};
  return {present: true, has, value: d.value, writable: d.writable,
    enumerable: d.enumerable, configurable: d.configurable, get: d.get, set: d.set};
}
const FIELDS = ['present', 'value', 'writable', 'enumerable', 'configurable', 'get', 'set'];
function diffSame(a, b) { return FIELDS.every(f => a[f] === b[f]); }
function brief(s) {
  if (!s.present) return 'absent';
  if (s.get !== undefined || s.set !== undefined)
    return `accessor{get:${s.get ? 'fn' : 'u'},set:${s.set ? 'fn' : 'u'},enum:${s.enumerable},cfg:${s.configurable}}`;
  return `data{value:${typeof s.value === 'object' ? 'port@' + (s.value && s.value.status) : JSON.stringify(s.value)},w:${s.writable},enum:${s.enumerable},cfg:${s.configurable}}`;
}

const results = [];
function record(id, name, input, expected, observed, pass, notes) {
  results.push({id, name, input, expected, observed, verdict: pass, notes});
}

// ========== OBS-FRESH: fresh-property (원 property 없음) ==========
(() => {
  const host = {};
  const T0 = snap(host);
  const handle = installD10Review({host, ...deps()});
  const T1 = snap(host);
  const portRef = T1.value;
  const close = handle.uninstall();
  const T3 = snap(host);
  const ok =
    T0.present === false && T0.has === false &&
    T1.present === true && T1.writable === true && T1.enumerable === false &&
    T1.configurable === true && T1.get === undefined && T1.set === undefined &&
    T1.value && T1.value.status === 'proposal' &&
    close.status === 'restored' &&
    T3.present === false && T3.has === false;
  record('OBS-FRESH', 'fresh-property 설치→해제',
    'host={} (원 property 없음)',
    'T0 absent → T1 data{w:true,enum:false,cfg:true,get/set:u} → close=restored → T3 absent(delete 분기 api.js:26)',
    `T0=${brief(T0)} | T1=${brief(T1)} | close=${close.status} | T3=${brief(T3)} | T1.value===portRef:${T1.value === portRef}`,
    ok ? 'PASS' : 'FAIL',
    'index.html 실호스트와 동일: original=undefined → restore()는 Reflect.deleteProperty');
})();

// ========== OBS-DATA: 기존 data descriptor 보존 복원 ==========
(() => {
  const host = {};
  const origDesc = {value: 'PRE-EXISTING', writable: false, enumerable: true, configurable: true};
  Object.defineProperty(host, PROP, origDesc);
  const T0 = snap(host);
  const handle = installD10Review({host, ...deps()});
  const T1 = snap(host);
  const close = handle.uninstall();
  const T3 = snap(host);
  // 설치 descriptor enumerable=original.enumerable(true) (api.js:23)
  const ok =
    T0.present === true && T0.value === 'PRE-EXISTING' && T0.writable === false &&
    T0.enumerable === true && T0.configurable === true &&
    T1.present === true && T1.enumerable === true && T1.writable === true &&
    T1.configurable === true && T1.value && T1.value.status === 'proposal' &&
    close.status === 'restored' &&
    diffSame(T0, T3); // 원 data descriptor 6필드 완전 복원
  record('OBS-DATA', '기존 data descriptor 복원',
    "host[prop]={value:'PRE-EXISTING',writable:false,enumerable:true,configurable:true}",
    'T1 enum=원값(true) 상속, close=restored, T3가 T0와 6필드 동일(원 data 복원 api.js:26 defineProperty)',
    `T0=${brief(T0)} | T1=${brief(T1)} | close=${close.status} | T3=${brief(T3)} | T3==T0:${diffSame(T0, T3)}`,
    ok ? 'PASS' : 'FAIL',
    'installed.enumerable=original.enumerable??false 상속 확인(api.js:23)');
})();

// ========== OBS-ACC: 기존 accessor descriptor 보존 복원 ==========
(() => {
  const host = {};
  let backing = 'accessor-backing';
  const getter = function () { return backing; };
  const setter = function (v) { backing = v; };
  const origDesc = {get: getter, set: setter, enumerable: true, configurable: true};
  Object.defineProperty(host, PROP, origDesc);
  const T0 = snap(host);
  const handle = installD10Review({host, ...deps()});
  const T1 = snap(host);
  const close = handle.uninstall();
  const T3 = snap(host);
  const ok =
    T0.present === true && T0.get === getter && T0.set === setter &&
    T0.value === undefined && T0.writable === undefined &&
    T0.enumerable === true && T0.configurable === true &&
    T1.present === true && T1.get === undefined && T1.set === undefined &&
    T1.writable === true && T1.value && T1.value.status === 'proposal' &&
    close.status === 'restored' &&
    T3.get === getter && T3.set === setter && T3.value === undefined &&
    T3.writable === undefined && T3.enumerable === true && T3.configurable === true &&
    diffSame(T0, T3);
  record('OBS-ACC', '기존 accessor descriptor 복원',
    'host[prop]=accessor{get,set,enumerable:true,configurable:true}',
    'T1은 data{get/set:u,w:true}로 교체, close=restored, T3가 원 accessor(get===getter,set===setter) 완전 복원',
    `T0=${brief(T0)} | T1=${brief(T1)} | close=${close.status} | T3=${brief(T3)} | get/set 동일:${T3.get === getter && T3.set === setter}`,
    ok ? 'PASS' : 'FAIL',
    'data→accessor 왕복: 함수 참조 동일성(===)까지 확인');
})();

// ========== CE-FOR: 타주체 교체 → foreign-preserved(복원/삭제 안 함) ==========
(() => {
  const host = {};
  const T0 = snap(host);
  const handle = installD10Review({host, ...deps()});
  const T1 = snap(host);
  // 타주체가 설치~닫기 사이에 property를 재지정 (harness-side 모델링, host 생산 쓰기 아님)
  const foreignDesc = {value: 'FOREIGN-OWNER', writable: true, enumerable: true, configurable: true};
  Object.defineProperty(host, PROP, foreignDesc);
  const T2 = snap(host);
  const close = handle.uninstall();
  const T3 = snap(host);
  const ok =
    T0.present === false &&
    T1.present === true && T1.value && T1.value.status === 'proposal' &&
    T2.present === true && T2.value === 'FOREIGN-OWNER' &&
    close.status === 'foreign-preserved' &&
    diffSame(T2, T3); // 교체값 그대로 보존(restore/delete 안 함 api.js:35-37)
  record('CE-FOR', '타주체 교체 → foreign-preserved',
    'install 후 외부가 host[prop]=FOREIGN-OWNER 재지정, 그 뒤 close',
    'close=foreign-preserved, T3가 T2(교체값)와 동일 — 원래 port로도 복원 안 하고 삭제도 안 함(api.js:35-37)',
    `T1=${brief(T1)} | T2=${brief(T2)} | close=${close.status} | T3=${brief(T3)} | T3==T2:${diffSame(T2, T3)}`,
    ok ? 'PASS' : 'FAIL',
    '!same(descriptor,installed) 분기: 타주체 소유권 보존. 교체 유발은 harness 모델링');
})();

// ========== CE-DUP: 중복 close → 멱등(already-uninstalled) ==========
(() => {
  const host = {};
  const controller = createD10ReviewController({host, ...deps()});
  const T1 = snap(host);
  const c1 = controller.close();
  const T3 = snap(host);
  const c2 = controller.close(); // 2회차
  const T3b = snap(host);
  const ok =
    T1.present === true && T1.value && T1.value.status === 'proposal' &&
    c1.status === 'restored' && T3.present === false &&
    c2.status === 'already-uninstalled' && T3b.present === false &&
    diffSame(T3, T3b); // 2회차 재삭제/재설치 없음
  record('CE-DUP', '중복 close 멱등',
    'createD10ReviewController → close() 2회 (controller엔 closed 가드 없음, api active 플래그가 멱등 담당)',
    '1회차=restored(T3 absent), 2회차=already-uninstalled(api.js:34), T3b==T3 불변',
    `T1=${brief(T1)} | close1=${c1.status} T3=${brief(T3)} | close2=${c2.status} T3b=${brief(T3b)} | 불변:${diffSame(T3, T3b)}`,
    ok ? 'PASS' : 'FAIL',
    'UI close()의 closed 가드와 별개로 api active 플래그가 2회차 no-op 보장');
})();

// ========== CE-LATE: 늦은완료(onInstalled 완료 훅) descriptor 원자성 ==========
(() => {
  // 6a: onInstalled(완료 훅)이 늦게 실행되는 시점에 descriptor는 이미 완전 설치 상태여야 함
  const hostA = {};
  let atCallback = null;
  const handle = installD10Review({host: hostA, ...deps((h) => { atCallback = snap(hostA); })});
  const T1 = snap(hostA);
  const closeA = handle.uninstall();
  const T3 = snap(hostA);
  const ok6a =
    atCallback && atCallback.present === true && diffSame(atCallback, T1) &&
    atCallback.value && atCallback.value.status === 'proposal' &&
    closeA.status === 'restored' && T3.present === false;

  // 6b: 늦은 완료 실패(onInstalled throw) → rollback으로 원상 복귀(fresh면 delete)
  const hostB = {};
  const T0b = snap(hostB);
  let threw = false, thrownMsg = '';
  try {
    installD10Review({host: hostB, ...deps(() => { throw new Error('late-completion-failure'); })});
  } catch (e) { threw = true; thrownMsg = e.message; }
  const Tb = snap(hostB);
  const ok6b = threw && T0b.present === false && Tb.present === false; // 반쯤 설치된 descriptor 잔존 0

  const ok = ok6a && ok6b;
  record('CE-LATE', '늦은완료(onInstalled) descriptor 원자성',
    '6a: onInstalled 시점 descriptor 관측 / 6b: onInstalled가 throw(늦은 완료 실패)',
    '6a: 콜백 시점 descriptor==T1(완전 설치, 반-설치 상태 없음), close=restored, T3 absent / 6b: install throw + rollback으로 host absent(잔존 0, api.js:48-53)',
    `6a atCallback=${atCallback ? brief(atCallback) : 'null'} ==T1:${atCallback ? diffSame(atCallback, T1) : false} close=${closeA.status} T3=${brief(T3)} | 6b threw=${threw}(${thrownMsg}) after=${brief(Tb)}`,
    ok ? 'PASS' : 'FAIL',
    'VM api는 동기 — 반-설치 descriptor는 존재하지 않음. 완료 훅/실패 rollback 모두 원자적');
})();

// ---- 출력 ----
const pass = results.filter(r => r.verdict === 'PASS').length;
const fail = results.filter(r => r.verdict === 'FAIL').length;
const summary = {
  apiPath: path.relative(path.resolve(__dirname, '../../../..'), API_PATH),
  apiSha256: apiSha,
  apiShaMatchesContract: apiSha === EXPECT_API_SHA,
  nodeVersion: process.version,
  ranAtUtc: t(),
  totals: {pass, fail, total: results.length},
  checks: results,
};
console.log(JSON.stringify(summary, null, 2));
