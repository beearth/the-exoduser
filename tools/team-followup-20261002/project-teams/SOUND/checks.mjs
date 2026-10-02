import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseExpressionAt } from 'acorn';

// Static contract audit only: no VM, game helper evaluation, audio, HTTP or old
// 18-group fixture execution. The sole write is this owner's evidence.json.
const ROOT = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const OWN = `${ROOT}/tools/team-followup-20261002/project-teams/SOUND`;
assert.equal(fileURLToPath(new URL('.', import.meta.url)).replace(/\/$/, ''), OWN);
const startedAt = new Date().toISOString();
const hash = value => createHash('sha256').update(value).digest('hex');
const reads = [];
function read(relative) {
  const began = new Date().toISOString();
  const buffer = readFileSync(`${ROOT}/${relative}`);
  const finishedAt = new Date().toISOString();
  reads.push({ path: `${ROOT}/${relative}`, startedAt: began, finishedAt,
    bytes: buffer.length, sha256: hash(buffer) });
  return buffer.toString('utf8');
}
const git = args => execFileSync('git', ['--no-optional-locks', ...args],
  { cwd: ROOT, encoding: 'utf8' }).trim();
const status = () => {
  const raw = execFileSync('git', ['--no-optional-locks', 'status', '--short',
    '--untracked-files=all'], { cwd: ROOT, encoding: 'utf8' });
  return { at: new Date().toISOString(), count: raw.split('\n').filter(Boolean).length,
    stdoutSha256: hash(raw) };
};
const head = git(['rev-parse', 'HEAD']);
const startStatus = status();
for (const path of ['AGENTS.md',
  'tools/team-followup-20261002/project-teams/SOUND/task.md',
  'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/native-recovery/SOUND-task.md',
  'docs/6사운드디자인/6사운드디자인.md',
  'docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md',
  'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/INTEGRATION-REVIEW-20261002.md']) read(path);
const priorPath = 'tools/team-followup-20261002/integration-review/mkitem-sideeffects-evidence.json';
const prior = JSON.parse(read(priorPath));
const priorTestsPath = 'tools/team-followup-20261002/integration-review/mkitem-sideeffects-tests.txt';
const priorTests = JSON.parse(read(priorTestsPath));
const teamState = JSON.parse(read('docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json'));
const soundOwner = teamState.teams.find(x => x.team === 'SOUND');
const otherProduction = ['server.cjs', 'node-main.js', 'index.html'].map(file =>
  ({ file, sha256: hash(read(file)) }));
const checks = [];
function check(id, fn) {
  try { fn(); checks.push({ id, status: 'PASS' }); }
  catch (error) { checks.push({ id, status: 'FAIL', error: error.message }); }
}
check('prior-artifact-18-groups-84-records-is-existing-evidence', () => {
  assert.equal(prior.groupCount, 18); assert.equal(prior.fixtureRuns, 84);
  assert.equal(prior.records.length, 84); assert.equal(prior.groups.length, 18);
  assert.ok(prior.groups.every(x => x.status === 'PASS'));
  assert.equal(priorTests.status, 'PASS');
  assert.equal(prior.audioPlayback, 0); assert.equal(prior.storageWritesByExtractedFunctions, 0);
});
check('recorded-first-and-full-refusal-rng-boundaries', () => {
  for (const r of prior.records) {
    assert.equal(r.rng.creation, 1);
    if (r.name === 'first_registration_actual_mkItem') assert.equal(r.rng.pickup, 42);
    if (r.name === 'duplicate_missing_ossuary_full_refusal') {
      assert.equal(r.result, false); assert.equal(r.rng.pickup, 41);
      assert.equal(r.calls.samples.length, 0); assert.equal(r.calls.saves, 0);
      assert.equal(r.calls.recalcSt, 1); assert.ok(r.inventory.equipped.ossuary);
    }
  }
});
const functions = ['mkItem', 'rollAffixes', 'pickupItem', '_boneRegister',
  '_grantOssuaryIfNeeded', 'registerBonePart', 'playItemPickupSfx', 'playSample',
  '_playSampleNow', '_sfxPri', '_sfxCat', '_sfxFrameReset', '_r', 'mbus'];
const sourceEvidence = [];
function extract(source, name) {
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} declaration`);
  const ast = parseExpressionAt(source, start, { ecmaVersion: 'latest' });
  return { ast, text: source.slice(start, ast.end), line: source.slice(0, start).split('\n').length };
}
function nodes(ast, predicate, found = []) {
  if (!ast || typeof ast !== 'object') return found;
  if (predicate(ast)) found.push(ast);
  for (const value of Object.values(ast)) {
    if (Array.isArray(value)) for (const entry of value) nodes(entry, predicate, found);
    else if (value && typeof value === 'object') nodes(value, predicate, found);
  }
  return found;
}
const calls = (ast, name) => nodes(ast, x => x.type === 'CallExpression' &&
  x.callee.type === 'Identifier' && x.callee.name === name);
const literal = node => node?.type === 'Literal' ? node.value : undefined;
for (const file of ['game.html', 'game-easy-test.html']) {
  const source = read(file);
  const blocks = Object.fromEntries(functions.map(name => [name, extract(source, name)]));
  const f = name => blocks[name].text;
  const a = name => blocks[name].ast;
  const boneBranch = a('pickupItem').body.body[0].consequent;
  const boneText = source.slice(boneBranch.start, boneBranch.end);
  check(`${file}:source-sha-matches-existing-trace`, () =>
    assert.equal(hash(source), prior.sources.find(x => x.file === file).sha256));
  check(`${file}:grant-before-register-before-bag`, () => {
    assert.equal(calls(boneBranch, '_grantOssuaryIfNeeded').length, 1);
    assert.equal(calls(boneBranch, '_boneRegister').length, 1);
    assert.ok(boneText.indexOf('_grantOssuaryIfNeeded()') < boneText.indexOf('_boneRegister(item)'));
    assert.ok(boneText.indexOf('_boneRegister(item)') < boneText.indexOf('INV.bag.push(item)'));
    assert.ok(boneText.includes('if(_boneRegister(item)){dbSaveForce();return true}'));
  });
  check(`${file}:refusal-before-one-generic-pickup-call`, () => {
    assert.equal(calls(boneBranch, 'playItemPickupSfx').length, 1);
    assert.equal(calls(boneBranch, 'playSample').length, 0);
    assert.ok(boneText.indexOf('return false') < boneText.indexOf('playItemPickupSfx(item)'));
    assert.ok(boneText.includes('INV.bag.pop()'));
  });
  check(`${file}:registration-sample-volume-pitch-and-points`, () => {
    const sample = calls(a('_boneRegister'), 'playSample');
    assert.equal(sample.length, 1); assert.equal(literal(sample[0].arguments[0]), 'ghost_laugh');
    assert.equal(literal(sample[0].arguments[1]), .8);
    assert.deepEqual(sample[0].arguments[2].arguments.map(literal), [1.2, .1]);
    assert.equal(sample[0].arguments.length, 3);
    assert.ok(f('_boneRegister').includes('(item.rarity||0)+(item.tier||0)'));
    assert.ok(f('_boneRegister').indexOf('INV.ossCollect[key]=') < f('_boneRegister').indexOf("playSample('ghost_laugh'"));
    assert.ok(f('_boneRegister').includes('shake(2)'));
  });
  check(`${file}:manual-registration-shares-sample-owner`, () => {
    assert.equal(calls(a('registerBonePart'), '_boneRegister').length, 1);
    assert.equal(calls(a('registerBonePart'), 'playSample').length, 0);
    assert.equal(calls(a('registerBonePart'), 'dbSaveForce').length, 1);
  });
  check(`${file}:grant-real-generator-and-no-extra-equip-audio`, () => {
    assert.equal(calls(a('_grantOssuaryIfNeeded'), 'mkItem').length, 1);
    assert.ok(f('_grantOssuaryIfNeeded').includes("mkItem('ossuary',0,EL.P,5)"));
    for (const name of ['playSample', 'playItemPickupSfx', 'playEquipSfx'])
      assert.equal(calls(a('_grantOssuaryIfNeeded'), name).length, 0);
    assert.equal(calls(a('_grantOssuaryIfNeeded'), 'recalcSt').length, 1);
    assert.ok(f('_grantOssuaryIfNeeded').includes('INV.equipped.ossuary=oss'));
  });
  check(`${file}:first-draw-also-grants-before-pickup`, () => {
    const start = source.indexOf('function draw(){');
    assert.ok(start >= 0);
    const entry = source.slice(start, start + 750);
    assert.ok(entry.includes('!window._ossGrantChk'));
    assert.ok(entry.includes('window._ossGrantChk=1;try{_grantOssuaryIfNeeded()}'));
  });
  check(`${file}:fixed-ossuary-fields-do-not-remove-previous-rng`, () => {
    const text = f('mkItem');
    const fixed = text.indexOf("if(slot==='ossuary'){", text.indexOf('item.socketCount='));
    assert.ok(fixed > text.indexOf('item.affixes=rollAffixes('));
    assert.ok(fixed > text.indexOf('const _scR=Math.random()'));
    for (const clause of ["item.name='전대의 유골함'", 'item.eDef=60',
      'item.bonusMp=150', 'item.ancPow=0.25', "id:'ancHP',tier:3,value:.9",
      'item._implicitVal=10', 'item.reqLv=0', 'item.socketCount=2;item.crystals=[null,null]'])
      assert.ok(text.slice(fixed).includes(clause), clause);
  });
  check(`${file}:generic-six-key-pool-one-selection-one-caller-pitch`, () => {
    const begin = source.indexOf('const _PICKUP_SFX_POOL=');
    const pool = parseExpressionAt(source, begin + 'const _PICKUP_SFX_POOL='.length,
      { ecmaVersion: 'latest' });
    assert.equal(pool.elements.length, 6);
    assert.equal(calls(a('playItemPickupSfx'), 'playSample').length, 1);
    assert.ok(f('playItemPickupSfx').includes('Math.random()*_PICKUP_SFX_POOL.length'));
    assert.ok(f('playItemPickupSfx').includes(',.5,_r(1,.05)'));
  });
  check(`${file}:ghost-node-priority-is-not-queue-bypass`, () => {
    assert.ok(f('_sfxPri').includes("if(key==='ghost_laugh')return _SFX_PRI.VOICE"));
    assert.ok(f('playSample').includes('const _isPri=pri||_isSkillSfx(key)||_isFootstepSfx(key)'));
    assert.ok(f('_sfxCat').includes('return key;'));
    assert.ok(!f('_sfxCat').includes('ghost_laugh'));
    assert.ok(f('_sfxFrameReset').includes('_sfxQueue.length=0'));
    assert.ok(!source.slice(source.indexOf('const _SKILL_SFX_KEYS='), source.indexOf('function _isSkillSfx(')).includes('ghost_laugh'));
  });
  check(`${file}:backend-pitch-rng-is-after-30ms-dedup`, () => {
    const text = f('playSample');
    assert.ok(text.includes('if(_now-_lt<30)return'));
    assert.ok(text.indexOf('if(_now-_lt<30)return') < text.indexOf('Math.random()*0.16'));
    assert.ok(text.includes('rate=rate*(0.92+Math.random()*0.16)'));
    assert.ok(text.includes('vol*=_gxVolMul;if(vol<0.01)return'));
  });
  check(`${file}:gain-master-and-idempotent-lifetime-contract`, () => {
    const text = f('_playSampleNow');
    assert.ok(text.includes('gain.gain.value=Math.min(1,(vol||1)*sfxVol())'));
    assert.ok(text.includes('gain.connect(mbus())'));
    assert.ok(f('mbus').includes('_mbus.gain.value=sfxVol()'));
    assert.ok(text.includes('if(_d)return;_d=true'));
    assert.ok(text.includes('src.onended=_dn'));
    assert.ok(text.includes('setTimeout(_dn,(_dur+.5)*1000)'));
    assert.ok(text.includes('src.disconnect();gain.disconnect()'));
    assert.ok(!text.includes('src.loop='));
    assert.ok(text.includes('if(!buf)') && text.includes('decodeAudioData'));
  });
  check(`${file}:two-player-callers-own-no-extra-sfx`, () => {
    const matches = [...source.matchAll(/if\(pickupItem\(wi\.item\)\)\{([^\n]+)\}/g)];
    assert.equal(matches.length, 2);
    assert.ok(matches.every(m => !/SFX\.|playSample|playItemPickupSfx/.test(m[1])));
    assert.ok(source.includes('ok=pickupItem(it.item);'));
  });
  const directGrantLines = source.split('\n').flatMap((text, index) =>
    text.includes('_grantOssuaryIfNeeded()') ? [{ line: index + 1, text }] : []);
  sourceEvidence.push({ file, sha256: hash(source), blocks: functions.map(name => ({ name,
    line: blocks[name].line, sha256: hash(blocks[name].text), bytes: Buffer.byteLength(blocks[name].text) })),
    directGrantLines });
}
const midStatus = status();
const docsKeyword = 'mkItem|rollAffixes|_grantOssuaryIfNeeded|_boneRegister|bonePart|ghost_laugh|playItemPickupSfx|_sfxPri|_sfxCat|_ossGrantChk';
const docsSearchAt = new Date().toISOString();
const docMatches = execFileSync('rg', ['-n', docsKeyword, 'docs/'], { cwd: ROOT, encoding: 'utf8' });
const docLines = docMatches.split('\n').filter(Boolean);
const docsPaths = [...new Set(docLines.map(line => line.split(':')[0]))];
const resultPath = 'tools/team-followup-20261002/project-teams/SOUND/result.md';
const report = read(resultPath);
check('report-separates-source-backend-rng-and-unverified-gates', () => {
  for (const marker of ['18그룹·84입력', 'playSample', '42', '41', '30ms',
    '_ossGrantChk', '실청취', '생산 연결0', 'SSOT 동기화 제안', '미확정'])
    assert.ok(report.includes(marker), marker);
});
check('owned-artifact-budget-and-owner-task-preservation', () => {
  const files = readdirSync(OWN);
  assert.ok(files.every(x => ['task.md', 'checks.mjs', 'result.md', 'evidence.json'].includes(x)));
  assert.ok(files.filter(x => x !== 'task.md').length <= 3);
  const taskRead = reads.find(x => x.path === `${OWN}/task.md`);
  assert.equal(hash(readFileSync(`${OWN}/task.md`)), taskRead.sha256);
});
check('production-source-bytes-preserved-during-static-audit', () => {
  for (const item of [...sourceEvidence, ...otherProduction])
    assert.equal(hash(readFileSync(`${ROOT}/${item.file}`)), item.sha256);
});
const finishedAt = new Date().toISOString();
const evidence = { task: 'mkitem-sideeffects-readonly', owner: 'SOUND project management chat',
  workdir: ROOT, status: checks.some(x => x.status === 'FAIL') ? 'STATIC_AUDIT_FAIL' : 'CONTRACT_READY_RUNTIME_PENDING',
  receipt: { recordedAt: '2026-10-02T03:43:55.681Z',
    instruction: `${OWN}/task.md`, source: 'trusted coordinating-chat assignment',
    exactInboundTimestamp: null, note: '초기 도구 cat은 exit0. 수신 메시지/최초 cat의 정확 시각은 도구 결과에 없어서 추정하지 않았다. 아래 timed reads는 이번 명령에서 실제 기록했다.' },
  timedReadStartedAt: reads[0].startedAt, firstArtifactCreatedAt: statSync(fileURLToPath(import.meta.url)).birthtime.toISOString(),
  execution: { startedAt, finishedAt, node: process.execPath, nodeVersion: process.version,
    kind: 'AST/source contract audit; no game helper execution', exitCode: checks.some(x => x.status === 'FAIL') ? 1 : 0,
    passed: checks.filter(x => x.status === 'PASS').length, failed: checks.filter(x => x.status === 'FAIL').length,
    previous18GroupFixtureReruns: 0, checks },
  head: { observed: head, final: git(['rev-parse', 'HEAD']), remoteQuery: 0,
    remote96610b6: '총괄 전달의 정확 ref 관찰; 이 팀은 독립 원격 조회0' },
  changes: { assignmentStart: { at: '2026-10-02T03:43:55.681Z', count: 23 },
    auditStart: startStatus, auditMiddle: midStatus, completion: status(),
    note: '공유 체크아웃 전체 개수이며 타 담당 변경을 본인 산출로 계산하지 않음' },
  reads, sources: sourceEvidence, otherProduction,
  existingEvidence: { path: `${ROOT}/${priorPath}`, checkedAt: prior.checkedAt,
    groups: prior.groupCount, inputs: prior.fixtureRuns, rerun: false, testsPath: `${ROOT}/${priorTestsPath}` },
  originalOwner: { snapshotAt: teamState.checkedAt, sessionId: soundOwner.sessionId,
    priorCompletedTask: soundOwner.priorCompletedTask, currentTaskReceivedAt: soundOwner.receivedAt,
    currentTaskReadAt: soundOwner.firstReadAt, newSessionOrMessage: 0,
    limitation: '원세션 실시간 조회0. 기록에는 같은 과제 새 Read/수신 근거가 없어 독립 소유 문서 과제로 수행함' },
  docsSearch: { startedAt: docsSearchAt, command: ['rg', '-n', docsKeyword, 'docs/'],
    matchingLines: docLines.length, files: docsPaths.map(path => `${ROOT}/${path}`), stdoutSha256: hash(docMatches),
    writes: 0, synchronization: '정확한 추가 문안은 result.md에 있으며 총괄의 생산 반영과 함께 해당 SSOT에 동기화' },
  artifacts: ['checks.mjs', 'result.md'].map(file => ({ path: `${OWN}/${file}`,
    sha256: hash(readFileSync(`${OWN}/${file}`)), bytes: statSync(`${OWN}/${file}`).size })),
  counts: { productionWrites: 0, existingOwnerWrites: 0, sharedDocsWrites: 0, gitWrites: 0,
    serverRuns: 0, UI: 0, gameRuns: 0, performanceMeasurements: 0, builds: 0,
    audioPlayback: 0, audioGeneration: 0, encoding: 0, installs: 0, agents: 0, newSessions: 0,
    messagesToOtherChats: 0, automationChanges: 0, gameHelperEvaluation: 0 },
  remainingGates: ['후보 고유키/파일/대상 이벤트/분류 미확정', '허용된 QA 단독 환경에서 실제 재생/중복/클리핑/수명 청취',
    '실제 저장/재로드와 유골함 기존 보유/미보유 확인', '현행 소스를 포함한 고유 패키지 runtime 인수',
    '새 키면 playSample dedup 통과율 변화에 따른 backend RNG 계약 별도 검수'],
  completedAt: finishedAt, timezone: 'UTC 기록; 한국어 보고는 Asia/Seoul' };
writeFileSync(`${OWN}/evidence.json`, `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ status: evidence.status, startedAt, finishedAt,
  passed: evidence.execution.passed, failed: evidence.execution.failed,
  failures: checks.filter(x => x.status === 'FAIL'), docsMatches: docLines.length,
  currentChanges: evidence.changes.completion.count, sourceChanges: 0,
  outputs: [`${OWN}/result.md`, `${OWN}/checks.mjs`, `${OWN}/evidence.json`] }, null, 2));
process.exitCode = evidence.execution.exitCode;
