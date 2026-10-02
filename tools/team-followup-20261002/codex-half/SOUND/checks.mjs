import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, realpathSync, readdirSync, existsSync, lstatSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { parseExpressionAt } from 'acorn';

const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN = `${ROOT}/tools/team-followup-20261002/codex-half/SOUND`;
assert.equal(realpathSync(ROOT), ROOT);
assert.equal(realpathSync(OWN), OWN);
assert.equal(fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, ''), OWN);
const allowed = ['TASK.md', 'checks.mjs', 'result.md', 'evidence.json'];
assert.ok(readdirSync(OWN).every(file => allowed.includes(file)));
for (const file of allowed) if (existsSync(`${OWN}/${file}`))
  assert.equal(lstatSync(`${OWN}/${file}`).isSymbolicLink(), false);
const startedAt = new Date().toISOString();
const hash = value => createHash('sha256').update(value).digest('hex');
const reads = [];
function read(file) {
  const at = new Date().toISOString();
  const bytes = readFileSync(`${ROOT}/${file}`);
  reads.push({ path: `${ROOT}/${file}`, at, sha256: hash(bytes), bytes: bytes.length });
  return bytes.toString('utf8');
}
for (const path of ['AGENTS.md', 'tools/team-followup-20261002/codex-half/SOUND/TASK.md',
  'docs/6사운드디자인/6사운드디자인.md',
  'docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md',
  'tools/team-followup-20261002/project-teams/SOUND/result.md',
  'tools/team-followup-20261002/claude-provider/SOUND/result.md']) read(path);
const prior = JSON.parse(read('tools/team-followup-20261002/project-teams/SOUND/evidence.json'));
const provider = JSON.parse(read('tools/team-followup-20261002/claude-provider/SOUND/evidence.json'));
// Do not run either previous audit, the 18-group fixture, Git, HTML boot, or a server.
for (const file of ['server.cjs', 'node-main.js', 'index.html']) read(file);
const functionNames = ['_boneRegister', '_r', 'playSample', '_sfxFrameReset',
  '_sfxPri', '_sfxCat', '_isFootstepSfx', '_isSkillSfx'];
const constantNames = ['_MAX_ACTIVE_NODES', '_SFX_MAX', '_SFX_PER_FRAME', '_SFX_PRI', '_SKILL_SFX_KEYS'];
function extract(source, name, constant = false) {
  const anchor = constant ? `const ${name}=` : `function ${name}(`;
  const start = source.indexOf(anchor);
  assert.ok(start >= 0, anchor);
  const node = parseExpressionAt(source, constant ? start + anchor.length : start,
    { ecmaVersion: 'latest' });
  const code = source.slice(start, node.end) + (constant ? ';' : '');
  return { name, code, sha256: hash(code), start, end: node.end,
    line: source.slice(0, start).split('\n').length,
    endLine: source.slice(0, node.end).split('\n').length, bytes: Buffer.byteLength(code) };
}
const sources = ['game.html', 'game-easy-test.html'].map(file => {
  const source = read(file);
  const blocks = [...functionNames.map(name => extract(source, name)),
    ...constantNames.map(name => extract(source, name, true))];
  return { file, sha256: hash(source), blocks,
    fingerprint: hash(blocks.map(x => x.code).join('\n')) };
});
const sourceGroups = new Map();
for (const source of sources) {
  const group = sourceGroups.get(source.fingerprint);
  if (group) group.files.push(source.file);
  else sourceGroups.set(source.fingerprint, { ...source, files: [source.file] });
}
const originalFragment = "playSample('ghost_laugh',.8,_r(1.2,.1))";
const replacementFragment = "playSample('ghost_laugh',.8,_r(1.2,.1),1)";
const contrasts = [
  { id: 'baseline', ko: '정상 기준', active: 0, ahead: 0, pri: false, times: [100],
    expected: { caller: 1, backend: 1, ghostReached: 1, totalReached: 1, position: 0 } },
  { id: 'nodes48-current', ko: '노드48 포화·현행', active: 48, ahead: 0, pri: false, times: [100],
    expected: { caller: 1, backend: 1, ghostReached: 0, totalReached: 0, position: 0 } },
  { id: 'frame6-current', ko: '앞선 일반큐6·현행', active: 0, ahead: 6, pri: false, times: [100],
    expected: { caller: 1, backend: 1, ghostReached: 0, totalReached: 6, position: 6 } },
  { id: 'nodes48-pri1', ko: '노드48 포화·메모리 pri1', active: 48, ahead: 0, pri: true, times: [100],
    expected: { caller: 1, backend: 1, ghostReached: 1, totalReached: 1, position: 0 } },
  { id: 'frame6-pri1', ko: '앞선 일반큐6·메모리 pri1', active: 0, ahead: 6, pri: true, times: [100],
    expected: { caller: 1, backend: 1, ghostReached: 1, totalReached: 6, position: 0 } },
  { id: 'dedup20-current', ko: '20ms 간격 성공등록2·현행', active: 0, ahead: 0, pri: false, times: [100, 120],
    expected: { caller: 2, backend: 1, ghostReached: 1, totalReached: 1, position: 0 } },
  { id: 'dedup20-pri1', ko: '20ms 간격 성공등록2·메모리 pri1', active: 0, ahead: 0, pri: true, times: [100, 120],
    expected: { caller: 2, backend: 2, ghostReached: 2, totalReached: 2, position: 0 } },
];
const records = [];
const memoryEdits = [];
for (const group of sourceGroups.values()) {
  const registration = group.blocks.find(x => x.name === '_boneRegister');
  assert.equal(registration.code.split(originalFragment).length - 1, 1);
  const changed = registration.code.replace(originalFragment, replacementFragment);
  memoryEdits.push({ sourceFiles: group.files, target: '_boneRegister', changes: 1,
    originalFragment, replacementFragment, originalFragmentSha256: hash(originalFragment),
    replacementFragmentSha256: hash(replacementFragment), originalFunctionSha256: registration.sha256,
    memoryFunctionSha256: hash(changed), productionApplied: false });
  for (const scenario of contrasts) {
    let clock = 100, phase = 'prepare', origin = 'backend_pitch', sequenceIndex = 0;
    const trace = [], backendCalls = [], notifications = [], saves = [], inputItems = [];
    const sequence = [.25, .75, .5, .125];
    const math = Object.create(Math);
    math.random = () => {
      const value = sequence[sequenceIndex++ % sequence.length];
      trace.push({ index: trace.length, clock, phase, origin, value });
      return value;
    };
    const sandbox = { Math: math, IS_MOBILE: false, _gxVolMul: 1, _charIdx: 0,
      performance: { now: () => clock }, INV: { ossCollect: {} }, P: { x: 0, y: 0 },
      ANC_ROSTER: [{ id: 'iron_warlord', ko: '철갑 전대', en: 'Iron Warlord' }],
      _ossSetComplete: () => false, _T: text => text, _L: ko => ko, _rarName: () => '일반',
      notify: text => notifications.push(text), addTxt: () => {}, shake: () => {},
      dbSaveForce: () => saves.push({ at: clock }),
      _silvertailVoiceKey: key => key,
      _deathSfxCd: 0, _hitSfxCd: 0, _mSfxPlaying: 0, SFX: { _sbSndCd: 0 }, _actx: null,
      actx: () => ({ currentTime: clock / 1000 }),
      _resumeAudioCtx: () => { throw new Error('unexpected audio resume'); },
      fetch: () => { throw new Error('unexpected fetch'); },
      setTimeout: () => { throw new Error('unexpected real timer'); },
      AudioContext: function () { throw new Error('unexpected AudioContext'); } };
    const context = vm.createContext(sandbox);
    sandbox._playSampleNow = (key, vol, rate, startTime, pan) => {
      backendCalls.push({ key, vol, rate, startTime, pan, nodePriority: context._sfxPri(key),
        activeUnchanged: scenario.active, audibleVerified: false });
    };
    const init = `let _activeNodeCnt=${scenario.active};let _sfxFrameT=0;const _sfxFrameCnt={};const _sfxQueue=[];const _sfxLastT={};`;
    const program = `${init}\n${group.blocks.map(block =>
      scenario.pri && block.name === '_boneRegister' ? changed : block.code).join('\n')}`;
    vm.runInContext(program, context, { timeout: 1000, filename: `${group.file}:${scenario.id}` });
    // This wrapper invokes the extracted _r, including its actual Math.random call.
    const actualR = context._r;
    context._r = (...args) => {
      const previous = origin; origin = 'caller_pitch';
      try { return actualR(...args); } finally { origin = previous; }
    };
    for (let i = 0; i < scenario.ahead; i++) context.playSample(`fixture_warm_${i}`, .2, 1);
    const prepareRng = trace.filter(x => x.phase === 'prepare').length;
    phase = 'ghost';
    const registrations = [];
    for (let i = 0; i < scenario.times.length; i++) {
      clock = scenario.times[i];
      const item = { slot: 'bonePart', anc: 'iron_warlord', part: i ? 'torso' : 'skull',
        rarity: 0, tier: 0, name: i ? '철갑 전대의 몸통' : '철갑 전대의 두개골' };
      inputItems.push(item); registrations.push(context._boneRegister(item));
    }
    const beforeFlush = JSON.parse(vm.runInContext('JSON.stringify(_sfxQueue)', context));
    const ghostRng = trace.filter(x => x.phase === 'ghost');
    context._sfxFrameReset();
    const afterFlush = vm.runInContext('_sfxQueue.length', context);
    const caller = ghostRng.filter(x => x.origin === 'caller_pitch').length;
    const backend = ghostRng.filter(x => x.origin === 'backend_pitch').length;
    const ghostCalls = backendCalls.filter(x => x.key === 'ghost_laugh');
    const record = { id: scenario.id, ko: scenario.ko, sourceFiles: group.files,
      sourceFingerprint: group.fingerprint, input: { active: scenario.active,
        ahead: scenario.ahead, priMemoryOnly: scenario.pri, clockTimesMs: scenario.times,
        items: inputItems, buffer: 'loaded assumed; not read or decoded', IS_MOBILE: false },
      expected: scenario.expected, registrations, collection: context.INV.ossCollect,
      notifications: notifications.length, saveCalls: saves.length,
      prepareRng, callerRng: caller, backendPitchRng: backend,
      beforeFlush, queuePositions: beforeFlush.flatMap((q, i) => q.key === 'ghost_laugh' ? [i] : []),
      afterFlushQueueLength: afterFlush, ghostBackendReached: ghostCalls.length,
      totalBackendReached: backendCalls.length, backendCalls, rngTrace: trace,
      priority: context._sfxPri('ghost_laugh'), category: context._sfxCat('ghost_laugh'),
      status: 'PASS' };
    try {
      assert.equal(caller, scenario.expected.caller); assert.equal(backend, scenario.expected.backend);
      assert.equal(ghostCalls.length, scenario.expected.ghostReached);
      assert.equal(backendCalls.length, scenario.expected.totalReached);
      assert.equal(record.queuePositions[0], scenario.expected.position);
      assert.equal(prepareRng, scenario.ahead);
      assert.ok(registrations.every(x => x === true));
      assert.equal(Object.keys(context.INV.ossCollect).length, scenario.times.length);
      assert.equal(notifications.length, scenario.times.length); assert.equal(saves.length, 0);
      assert.equal(afterFlush, 0); assert.equal(record.priority, 9);
      assert.equal(record.category, 'ghost_laugh');
      assert.equal(vm.runInContext('_activeNodeCnt', context), scenario.active);
      for (const q of beforeFlush.filter(x => x.key === 'ghost_laugh'))
        assert.equal(q.pri ?? 0, scenario.pri ? 1 : 0);
      if (scenario.id === 'frame6-current')
        assert.deepEqual(backendCalls.map(x => x.key), Array.from({ length: 6 }, (_, i) => `fixture_warm_${i}`));
      if (scenario.id === 'frame6-pri1')
        assert.deepEqual(backendCalls.map(x => x.key), ['ghost_laugh', ...Array.from({ length: 5 }, (_, i) => `fixture_warm_${i}`)]);
    } catch (error) { record.status = 'FAIL'; record.error = error.message; }
    records.push(record);
  }
}
const keyword = 'ghost_laugh|_boneRegister|_sfxFrameReset|_SFX_PER_FRAME|_MAX_ACTIVE_NODES|30ms|playSample|_sfxPri';
const docsStartedAt = new Date().toISOString();
const docsOutput = execFileSync('rg', ['-n', keyword, 'docs/'], { cwd: ROOT, encoding: 'utf8' });
const docsMatches = docsOutput.split('\n').filter(Boolean);
const docsFiles = [...new Set(docsMatches.map(x => x.split(':')[0]))];
const bytePreservation = reads.map(item => ({ path: item.path,
  beforeSha256: item.sha256, afterSha256: hash(readFileSync(item.path)) }));
const preserved = bytePreservation.every(x => x.beforeSha256 === x.afterSha256);
const passCount = records.filter(x => x.status === 'PASS').length;
const failCount = records.length - passCount;
const completedAt = new Date().toISOString();
const metadata = sources.map(source => ({ file: `${ROOT}/${source.file}`, sha256: source.sha256,
  fingerprint: source.fingerprint, blocks: source.blocks.map(({ code, ...block }) => block) }));
const lineTable = sources[0].blocks.map(block => {
  const easy = sources[1].blocks.find(x => x.name === block.name);
  return `| ${block.name} | ${block.line} | ${easy.line} | ${block.sha256} | ${block.sha256 === easy.sha256 ? '동일' : '상이'} |`;
}).join('\n');
const rows = records.map(x => `| ${x.id} / ${x.ko} | ${x.input.active}/${x.input.ahead} | ${x.priority}/${x.input.priMemoryOnly ? 1 : 0}/${x.queuePositions.join(',')} | ${x.callerRng}/${x.backendPitchRng} | ${x.prepareRng} | ${x.notifications}/${x.saveCalls} | ${x.ghostBackendReached}/${x.totalBackendReached} | ${x.afterFlushQueueLength} | ${x.status} |`).join('\n');
const report = `# SOUND — ghost_laugh 큐 포화·RNG source fixture 인수

새 후속 한 건: **${passCount}대조 PASS/${failCount} FAIL**, 고유 backend source ${sourceGroups.size}개 실행. 본편/easy 추출 함수·상수 fingerprint ${sources[0].fingerprint === sources[1].fingerprint ? '동일' : '상이'}; 동일 source는 두 번 실행하지 않았다. 이전18그룹/84입력 및 정적31검사 재실행0. policyAdopted=false, productionApplied=false. **source fixture PASS ≠ runtime/visual/listening PASS**.

## 수신·읽기·실행 근거

| 단계 | 실제 근거 |
|---|---|
| 수신/최초 Read | 최신 총괄 메시지로 과제 수신, TASK.md 전문 cat exit0. 정확 메시지/첫 cat 시각은 없어서 추정하지 않았다. 실제 경로·목록 관찰 2026-10-02 13:31:12.695 KST; TASK 외 파일은 없었다. |
| 실제 checkout/소유 | realpath가 지정 checkout과 codex-half/SOUND 경로와 일치. 쓰기 파일은 checks.mjs/result.md/evidence.json 3개뿐. TASK/원후보/공유 docs/생산 파일은 보존했다. |
| 선행 인수 | AGENTS·사운드 SSOT·유골 등록·project-teams 31정적검수·claude-provider 읽기 검토 완료. Claude는 성공 Read/논리 반례 제출이며 fixture/청취 실행 근거가 아니다. |
| 실행 | Node ${process.version} 전체 경로, ${startedAt}→${completedAt} UTC. 실제 source 함수 실행과 명시 대역으로 결과를 분리했다. 정확 read SHA/시각·입력·trace는 evidence.json. |
| HEAD/Changes | 이번 TASK는 Git 명령0을 지정한다. 현재 HEAD/Changes는 독립 미조회(null); 이전31검수의 역사 HEAD ${prior.head.observed}, 당시 완료 Changes ${prior.changes.completion.count}를 현재 상태로 쓰지 않는다. |

## 실제 source와 양판 동일성

| source ID | 본편 시작행 | easy 시작행 | 추출 SHA256 | 양판 |
|---|---:|---:|---|---|
${lineTable}

생산 전체 파일 SHA는 evidence.json에 기록한다. 원문 추출은 Acorn AST이며 HTML 부트·서버 import 없이 최소 함수/관련 상수만 VM에서 실행했다. _r 계측 래퍼는 추출 원함수를 호출해 실제 Math.random 소비를 보존한다. 결정적 RNG [0.25,0.75,0.5,0.125] 순환, synthetic clock 100ms/120ms; 각 대조는 큐·노드·도감·dedup 기록이 비어 있는 새 context다.

## 대조 결과 — desktop48노드/프레임6/30ms

priority 열은 node priority/queue pri/flush 전 ghost 위치이며 0부터 시작한다. caller/backend RNG는 ghost 등록 구간만, 준비 RNG는 별도다. 도달은 _playSampleNow 호출 대역에 도달한 횟수이고 audible 횟수가 아니다.

| id / 한글명 | active/앞선큐 | priority/queue pri/위치 | caller/backend RNG | 준비 RNG | notify/save 호출 | ghost/전체 backend 도달 | flush 후 큐 | 결과 |
|---|---:|---|---:|---:|---:|---:|---:|---|
${rows}

노드48/프레임6 포화에서 현행 ghost는 caller/backend pitch RNG를 이미 소비하고 큐에 들어갔지만 flush 단계에서 backend 도달0, 큐0으로 폐기된다. VOICE9는 queue bypass가 아니다. 메모리 pri1은 unshift로 앞에 들어가 gate를 우회하여 backend에 도달한다. 프레임 대조에서는 ghost와 일반5개가 도달하고 앞서 준비한 여섯 번째 일반 키는 이번 flush에서 제외됐다.

100ms와120ms의 서로 다른 부위 성공 등록2건에서 현행 caller RNG2/backend RNG1, pri1은 caller2/backend2다. 도감 등록2/notify2와 큐/backend 도달 수는 별개다. 포화 보호와 30ms dedup 해제가 pri 플래그에 결합돼 있어 정책을 자동 채택할 수 없다.

## 메모리 대조와 명시 대역

| 항목 | 실제/대역과 한계 |
|---|---|
| 메모리 변경1곳 | _boneRegister의 \`${originalFragment}\`→\`${replacementFragment}\`만 바꿨다. exact fragment/원·대조 함수 SHA는 evidence.json. 생산 patch/정책/키/파일/볼륨 변경0. |
| 최소 입력 | 실제 _boneRegister가 받는 plain bonePart(iron_warlord/skull 또는 torso, rarity0/tier0/name)를 입력했다. mkItem/유골함 지급/가방/월드 caller는 이번 fixture에서 실행하지 않았다. |
| _silvertailVoiceKey | 명시 identity 대역. ghost_laugh는 앞선 source 검토에서 치환 미대상으로 확인됐지만 이번 전체 캐릭터 보이스 매핑은 실행0. |
| 도감/알림 | 실제 _boneRegister가 INV.ossCollect에 기록; ANC_ROSTER 1행 합성, _ossSetComplete=false 대역. notify 카운트 대역, _T/_L/_rarName 표시 대역. 해금·UI 실행0. |
| 저장 | _boneRegister에는 dbSaveForce 호출이 없어 모든 대조 save0. 이 값은 pickupItem의 저장 성공/실제 디스크 저장0이라는 일반 주장이 아니다. 저장 helper는 호출 기록 대역이다. |
| backend/AudioContext | _playSampleNow는 인수 기록만 하고 active 노드를 변경하지 않는 대역. actx는 currentTime(clock/1000) plain object, _actx=null. 버퍼는 준비됨 가정만; 파일/디코딩/실노드/eviction/컴프레서/수명 실행0. |
| 과장 정정 | headless 제안의 pri1→eviction 성공/재생1 표현을 이번 결과로 확정하지 않는다. 인수한 것은 backend 도달1이며 동일 priority9 노드 포화·load failure 등 실제 재생 Gate는 남아 있다. |

## docs 계약·한계 동기화안

코드 산출 뒤 docs 전체 관련 키워드를 rg 검색했다: ${docsMatches.length}행/${docsFiles.length}파일, 목록·정확 명령·출력SHA는 evidence.json. 공용 docs/보호2_3 수정0. 총괄에 아래 절을 사운드 SSOT 추가안으로 인계한다.

> ### ghost_laugh 등록 큐 포화·dedup — source fixture 인수
>
> | id / 수치 | 현행 계약과 검수 |
> |---|---|
> | _boneRegister / ghost_laugh | caller vol0.8, _r(1.2,0.1), explicit queue pri 없음. node priority VOICE9라도 desktop active48 또는 앞선 일반큐6 조건에서 flush 후 backend 호출0·큐0. |
> | 30ms same-key dedup | clock100/120ms에 성공등록2건은 caller RNG2/backend pitch RNG1. 도감/notify는2건. 메모리 pri1 대조는 backend RNG2로 바뀐다. |
> | 미적용 pri1 대조 | 같은 caller fragment에 pri1만 메모리 추가: 포화 gate bypass/backend 도달. 실제 노드 eviction·audible 보장 아님. policyAdopted=false/productionApplied=false. |
> | 근거 범위 | 양판 동일 source backend 1개·7대조. _playSampleNow/AudioContext/저장/표시는 명시 대역, source fixture PASS ≠ runtime/visual/listening PASS. 모바일·전체게임 RNG·전수 혼합·실청취/패키지 미검수. |

현재 채택0을 유지한다. 총괄의 포화 보호·dedup 유지/허용·월드/수동 등록 범위 결정, 허용 QA 단독 실노드/청취·저장·패키지 인수가 남는다. 새 작업·메시지·세션·하위팀·cleanup·삭제·Git·서버·실게임·UI·빌드·생성·인코딩0.
`;
writeFileSync(`${OWN}/result.md`, report);
const evidence = { task: 'ghost-laugh-queue-rng-source-fixture', status: failCount ? 'FAIL' : 'SOURCE_FIXTURE_PASS_RUNTIME_PENDING',
  policyAdopted: false, productionApplied: false, runtimeExecuted: false,
  sourceFixturePassIsNotRuntimeVisualListeningPass: true,
  receipt: { observedAt: '2026-10-02T04:31:12.695Z', exactInboundTimestamp: null,
    instruction: `${OWN}/TASK.md`, firstCatExitCode: 0, initialOwnedFiles: ['TASK.md'] },
  paths: { root: ROOT, rootReal: realpathSync(ROOT), owner: OWN, ownerReal: realpathSync(OWN) },
  execution: { startedAt, completedAt, node: process.execPath, version: process.version,
    uniqueBackendsExecuted: sourceGroups.size, sourceVariants: sources.length, contrasts: records.length,
    passed: passCount, failed: failCount, exitCode: failCount || !preserved ? 1 : 0,
    old18Group84InputsRerun: 0, previousStatic31Rerun: 0 },
  reads, sources: metadata, sourceGroups: [...sourceGroups.values()].map(({ fingerprint, files }) => ({ fingerprint, files })),
  memoryEdits, records, bytePreservation, allReadInputsBytePreserved: preserved,
  previousAcceptance: { staticChecks: prior.execution.passed, providerSuccessfulReads: provider.successfulReadCount,
    providerCompletedObservedAt: provider.completedObservedAt, providerFixtureRuns: 0,
    currentHead: null, currentChanges: null, gitCommands: 0,
    historicalOnly: { head: prior.head.observed, changes: prior.changes.completion,
      note: '과거 제공 근거이며 이번 현재 HEAD/Changes 검증이 아님' } },
  docsSearch: { at: docsStartedAt, command: ['rg', '-n', keyword, 'docs/'],
    matchedLines: docsMatches.length, fileCount: docsFiles.length, files: docsFiles.map(path => `${ROOT}/${path}`),
    outputSha256: hash(docsOutput), writes: 0, synchronizationProposal: `${OWN}/result.md` },
  stubs: ['_playSampleNow argument recorder; active count unchanged', 'actx plain clock object; _actx null',
    '_silvertailVoiceKey identity', '_ossSetComplete false', 'ANC_ROSTER one-row fixture',
    'notify/translation/UI/save recorders', 'deterministic Math.random counted; _r source retained'],
  artifacts: ['checks.mjs', 'result.md'].map(file => ({ path: `${OWN}/${file}`,
    sha256: hash(readFileSync(`${OWN}/${file}`)) })),
  counts: { productionWrites: 0, sharedDocsWrites: 0, ownerOutsideWrites: 0,
    deletions: 0, cleanup: 0, GitCommands: 0, GitWrites: 0, serverRuns: 0,
    HTTP: 0, gameRuns: 0, UI: 0, builds: 0, audioPlayback: 0, decode: 0,
    AudioContext: 0, realTimers: 0, audioGeneration: 0, encoding: 0, installs: 0,
    newSessions: 0, subteams: 0, messages: 0, automations: 0 },
  limits: ['Backend arrival is not audible playback or successful eviction.',
    'Synthetic desktop0/48 active counts; no mobile/negative/exhaustive mixed inputs.',
    'Caller/backend RNG belongs to ghost segment; six preparation RNG calls are separate.',
    'No mkItem, grant, full pickup/save flow, actual nodes, audio, or package verification.'] };
writeFileSync(`${OWN}/evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ status: evidence.status, contrasts: records.length, passed: passCount, failed: failCount,
  sourceBackendGroups: sourceGroups.size, allReadInputsBytePreserved: preserved,
  docsLines: docsMatches.length, docsFiles: docsFiles.length,
  results: records.map(({ id, callerRng, backendPitchRng, ghostBackendReached, totalBackendReached, status }) =>
    ({ id, callerRng, backendPitchRng, ghostBackendReached, totalBackendReached, status })),
  completedAt, outputs: allowed.filter(file => file !== 'TASK.md').map(file => `${OWN}/${file}`) }, null, 2));
process.exitCode = evidence.execution.exitCode;
