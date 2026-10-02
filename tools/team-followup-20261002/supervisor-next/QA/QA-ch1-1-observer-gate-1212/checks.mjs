// AUTONOMOUS MEMORY WORK — scratchpad only (allowNewOwnedFiles=false, epoch capacity-after-8c317a73-1134).
// repo 파일 0, 실제 소스 파일 미수정, 실게임/브라우저/세이브 0.
//
// 목표(MILESTONE-CH1-1-PLAYABLE): 6단계 실제 플레이의 '첫 관측/진행 blocker'를 찾을 수 있는
//   현재 bootstrap/observer 실제 wiring 후보 1건. actual runtimeReady=false 를 성공으로 표시0,
//   API source fixture 를 플레이 증거로 대체0.
//
// 후보 = observer-gate: 실제 bootstrap handle/port 에 연결해 runtimeReady===true 일 때만 'observable',
//   아니면 BLOCKED(첫 blocker)로 보고하고 '플레이 증거'로 승격하지 않는다.

import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import path from 'node:path';

const ITEM = '/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/ITEM';
const API_PATH = path.join(ITEM, 'browser-bootstrap-api.js');
const INTEG_PATH = path.join(ITEM, 'browser-host/persistence-integration-port.js');
const MK_PATH = path.join(ITEM, 'browser-host/mk-item-fixture.js');
const PROP = '_d10PersistenceReviewPort';
const sha = s => createHash('sha256').update(s).digest('hex');

const apiText = readFileSync(API_PATH, 'utf8');
const m = new vm.SourceTextModule(apiText, {context: vm.createContext({}), identifier: API_PATH});
await m.link(() => { throw new Error('no imports'); });
await m.evaluate();
const {installD10Review} = m.namespace;
const {createD10PersistenceIntegration} = await import(pathToFileURL(INTEG_PATH).href);
const {createMkItemFixture} = await import(pathToFileURL(MK_PATH).href);

// ---- observer-gate 후보 (메모리 후보, 생산 미적용) ----
// 실제 설치 포트(또는 handle이 노출하는 포트 표면)를 받아 '플레이 관측 가능 여부'를 판정.
// 핵심 계약: runtimeReady!==true 이면 observable=false, 플레이 증거 금지, 첫 blocker 사유 반환.
const STAGES = [
  '1 로비→CH1-1 시작', '2 전투→처치→획득→장착', '3 보스 게이트 개방·진입',
  '4 보스전 사망·중단', '5 부활 필드 복귀', '6 보스 재도전·반환/저장',
];
function observerGate(port) {
  const flags = port ? {enabled: port.enabled, runtimeReady: port.runtimeReady, status: port.status} : null;
  if (!port) return {observable: false, playEvidence: false, blocker: 'no-port', flags};
  if (port.runtimeReady !== true) {
    return {observable: false, playEvidence: false,
      blocker: `runtimeReady=${port.runtimeReady} · ${port.status} 포트 — 라이브 플레이 관측자 아님`,
      firstBlockedStage: STAGES[0], flags};
  }
  // runtimeReady===true 여야만 관측 가능으로 승격(실제 스테이지 구독은 런타임 슬롯에서)
  return {observable: true, playEvidence: false /* 실게임 슬롯 전까지 여전히 증거 아님 */,
    note: '관측 가능 계약 충족 — 실제 플레이 증거는 root 단일 슬롯에서만', flags};
}

const REQUEST = {proposalOnly: true, uniqueId: 'UI-10', tier: 1, element: 0, baseRarity: 2};
const deps = () => {
  const mk = createMkItemFixture({random: () => 0.5});
  return {reviewOnly: true, createPort: ({mkItem, rng}) => createD10PersistenceIntegration({mkItem, rng}),
    mkItem: (...a) => mk(...a), rng: () => 0.5};
};
const results = [];

// ===== A. ACTUAL: 실제 설치 포트는 proposal/runtimeReady=false → 첫 blocker, 플레이 증거 아님 =====
{
  const host = {};
  const handle = installD10Review({host, ...deps()});
  const installedPort = Object.getOwnPropertyDescriptor(host, PROP).value;
  const g = observerGate(installedPort);
  // 안티-회귀: handle.read 등으로 '관측된 것처럼' 승격되지 않아야 함
  const g2 = observerGate(installedPort); // 재조회해도 동일(runtimeReady 불변)
  handle.uninstall();
  results.push({id: 'OBS-ACTUAL', band: '실제 설치 포트 관측 판정',
    ok: g.observable === false && g.playEvidence === false && g.flags.runtimeReady === false && g.flags.enabled === false && g.flags.status === 'proposal' && g2.observable === false,
    obs: `observable=${g.observable} playEvidence=${g.playEvidence} blocker="${g.blocker}" firstBlockedStage="${g.firstBlockedStage}" flags=${JSON.stringify(g.flags)}`});
}

// ===== B. CONTROL: runtimeReady=true 계약 shape 는 observable (단, 여전히 플레이 증거 아님) =====
// 주: 이것은 '런타임 준비 포트 계약 형태'일 뿐 실제 플레이가 아니다(명시).
{
  const runtimeReadyShape = Object.freeze({enabled: true, runtimeReady: true, status: 'runtime',
    createReview() {}, readItem() {}, restoreItem() {}, serializeItem() {}});
  const g = observerGate(runtimeReadyShape);
  results.push({id: 'OBS-CONTROL', band: 'runtimeReady 계약 shape 대조',
    ok: g.observable === true && g.playEvidence === false,
    obs: `observable=${g.observable} playEvidence=${g.playEvidence} note="${g.note}" flags=${JSON.stringify(g.flags)} (계약 shape일 뿐 실제 플레이 아님)`});
}

// ===== C. ANTI-FIXTURE: proposal 포트의 createReview 결과(아이템 생성)를 '진행/플레이 증거'로 승격 금지 =====
// createReview 는 실제 D10 instance를 만들지만, 그것이 '스테이지 진행 관측'은 아님을 게이트가 분리.
{
  const host = {};
  const handle = installD10Review({host, ...deps()});
  const port = Object.getOwnPropertyDescriptor(host, PROP).value;
  const madeItem = port.createReview(REQUEST);          // 실제 instance 생성됨(fixture 경로)
  const g = observerGate(port);
  handle.uninstall();
  // 아이템이 만들어졌어도 observable/playEvidence 는 여전히 false 여야 한다(진행 관측 아님)
  results.push({id: 'OBS-ANTI-FIXTURE', band: 'fixture 생성 ≠ 플레이 증거 분리',
    ok: madeItem && madeItem.uniqueId === 'UI-10' && g.observable === false && g.playEvidence === false,
    obs: `createReview 생성=${madeItem && madeItem.uniqueId} → 그러나 observable=${g.observable} playEvidence=${g.playEvidence} (fixture 생성을 진행 증거로 치환 안 함)`});
}

console.log(JSON.stringify({
  apiSha: sha(apiText),
  integSha: sha(readFileSync(INTEG_PATH, 'utf8')),
  mkSha: sha(readFileSync(MK_PATH, 'utf8')),
  node: process.version,
  firstObservationBlocker: '설치된 유일 bootstrap 포트 _d10PersistenceReviewPort 가 runtimeReady=false/enabled=false/status=proposal — 6단계 1단계도 이 포트로 관측 불가(라이브 observer 아님)',
  candidate: 'observer-gate: runtimeReady===true 전까지 observable=false·playEvidence=false·BLOCKED. 실제 플레이 증거는 root 단일 슬롯에서만. activation(enabled/runtimeReady) flip 은 런타임 소유 — QA 변경 0',
  dependencies: 'BUILD 로컬 후보 + 총괄 source 통합(runtimeReady 런타임 포트), MAP/BOSS 경로, QA 단일 실행 슬롯',
  checks: results, allPass: results.every(r => r.ok),
}, null, 2));
