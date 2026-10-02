// BUILD packaged-source-delta: 핵심 파일만 읽는 독립 인수. 서버/packager import 금지.
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { isDeepStrictEqual } from 'node:util';
import { fileURLToPath } from 'node:url';

const root = '/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner = path.join(root, 'tools/team-followup-20261002/project-teams/BUILD_TEAM');
if (path.dirname(fileURLToPath(import.meta.url)) !== owner) throw Error('OWNER_PATH_MISMATCH');
if (process.argv.slice(2).some(arg => arg !== '--write-evidence')) throw Error('UNKNOWN_ARGUMENT');
const startedAt = new Date().toISOString();
const digest = data => createHash('sha256').update(data).digest('hex');
const command = (binary, args) => {
  const r = spawnSync(binary, args, { cwd: root, env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' }, maxBuffer: 16 * 1024 * 1024 });
  if (r.error) throw r.error;
  return { exitCode: r.status, stdout: r.stdout.toString(), stderr: r.stderr.toString() };
};
const git = args => {
  const r = command('git', args);
  if (r.exitCode !== 0) throw Error('GIT_READ_FAILED: ' + args.join(' ') + ' ' + r.stderr);
  return r.stdout;
};
function smallRead(absolute) {
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 10 * 1024 * 1024) throw Error('SMALL_REGULAR_FILE_REQUIRED: ' + absolute);
  const data = fs.readFileSync(absolute);
  const after = fs.lstatSync(absolute);
  if (stat.size !== after.size || stat.mtimeMs !== after.mtimeMs || stat.ctimeMs !== after.ctimeMs) throw Error('FILE_CHANGED_DURING_READ: ' + absolute);
  return data;
}
const record = absolute => {
  if (!fs.existsSync(absolute)) return { path: absolute, exists: false };
  const bytes = smallRead(absolute);
  return { path: absolute, exists: true, bytes: bytes.length, sha256: digest(bytes) };
};
const status = () => {
  const entries = git(['status', '--short', '--untracked-files=all', '-z']).split('\0').filter(Boolean);
  return {
    observedAt: new Date().toISOString(), count: entries.length,
    ownerEntries: entries.filter(entry => entry.includes('tools/team-followup-20261002/project-teams/BUILD_TEAM/')),
    preservedBackupCount: entries.filter(entry => entry.includes('docs_backup_before_normalize_20260726/')).length,
    draftEntries: entries.filter(entry => entry.includes('runtime-acquire-config-draft.json')),
    stagedPaths: git(['diff', '--cached', '--name-only']).trim().split('\n').filter(Boolean),
    caveat: '공유 체크아웃의 타 담당 변경을 포함하며 증가분을 본인에게 전부 귀속하지 않는다.'
  };
};
const checks = [];
const check = (id, koreanName, passed, detail) => checks.push({ id, koreanName, passed: Boolean(passed), detail });
const headBefore = git(['rev-parse', 'HEAD']).trim();
const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).trim();
const changesBefore = status();
const protectedFiles = [
  path.join(owner, 'task.md'),
  path.join(root, 'tools/team-followup-20261001/BUILD/runtime-acquire-config-draft.json'),
  path.join(root, git(['rev-parse', '--git-path', 'index']).trim())
];
const protectedBefore = protectedFiles.map(record);
const configPath = path.join(root, 'tools/team-followup-20261001/BUILD/integrated-mac-build-config.json');
const resultPath = path.join(root, 'tools/team-followup-20261001/BUILD/integrated-mac-build-result.json');
const config = JSON.parse(smallRead(configPath));
const previousResult = JSON.parse(smallRead(resultPath));
const app = path.join(previousResult.appPath, 'Contents/Resources/app.nw');
const names = ['game.html', 'game-easy-test.html', 'server.cjs', 'node-main.js', 'ui-panels.js', 'package.json', 'index.html'];
const files = names.map(name => {
  const source = record(path.join(root, name)), packaged = record(path.join(app, name));
  const gitBlob = Buffer.from(git(['show', headBefore + ':' + name]));
  const input = config.inputs.find(entry => entry.path === name);
  let delta = null;
  if (packaged.exists && source.sha256 !== packaged.sha256) {
    const diff = command('git', ['diff', '--no-index', '--no-ext-diff', '--no-textconv', '--unified=0', packaged.path, source.path]);
    if (![0, 1].includes(diff.exitCode)) throw Error('DIFF_READ_FAILED: ' + name);
    const lines = diff.stdout.split('\n');
    delta = {
      hunks: lines.filter(line => line.startsWith('@@')),
      addedLines: lines.filter(line => line.startsWith('+') && !line.startsWith('+++')),
      deletedLines: lines.filter(line => line.startsWith('-') && !line.startsWith('---'))
    };
  }
  check('CORE-' + name, '현행 핵심 파일 원격 일치 HEAD 객체 대조', source.sha256 === digest(gitBlob), { name, sourceSha256: source.sha256, headBlobSha256: digest(gitBlob) });
  return { name, source, packaged, sourceMatchesHeadBlob: source.sha256 === digest(gitBlob), previousInputSha256: input?.sha256 ?? null, delta };
});
const find = name => files.find(row => row.name === name);
const sourceServer = smallRead(find('node-main.js').source.path).toString();
const job = previousResult.job;
const portNeedle = 'const PORT = 3333;';
const saveNeedle = "const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');";
const derivedServer = sourceServer.replace(portNeedle, `const PORT = ${config.port};`).replace(saveNeedle, `const SAVE_DIR = ${JSON.stringify(path.join(job, 'user-state/saves'))};`);
check('SERVER-DERIVATION', '내장 서버 격리 변환만 차이', sourceServer.split(portNeedle).length === 2 && sourceServer.split(saveNeedle).length === 2 && digest(derivedServer) === find('node-main.js').packaged.sha256, { port: config.port, saveRoot: path.join(job, 'user-state/saves'), derivedSha256: digest(derivedServer) });
const originalPackage = JSON.parse(smallRead(find('package.json').source.path));
const actualPackage = JSON.parse(smallRead(find('package.json').packaged.path));
const derivedPackage = {
  name: originalPackage.name, version: originalPackage.version,
  main: `http://127.0.0.1:${config.port}/index.html?demo=1`,
  'node-main': 'node-main.js',
  'node-remote': [`http://127.0.0.1:${config.port}`, `http://localhost:${config.port}`],
  window: originalPackage.window,
  'chromium-args': originalPackage['chromium-args'].replace(/--user-data-dir=\S+/, `--user-data-dir=${path.join(job, 'user-state/profile')}`),
  product_string: 'EXODUSER-' + config.id
};
check('PACKAGE-DERIVATION', '패키지 JSON의 지정 파생 설정', isDeepStrictEqual(actualPackage, derivedPackage), { packagedKeys: Object.keys(actualPackage), omittedSourceKeys: Object.keys(originalPackage).filter(key => !(key in actualPackage)), packagedEntry: actualPackage.main, profile: path.join(job, 'user-state/profile') });
for (const name of ['index.html', 'ui-panels.js']) check('UNCHANGED-' + name, '기존 앱과 동일한 핵심 입력', find(name).source.sha256 === find(name).packaged.sha256, { name });
for (const name of ['game.html', 'game-easy-test.html', 'ui-panels.js', 'index.html']) check('MANIFEST-' + name, '기존 앱 입력 목록과 실제 작은 파일 일치', find(name).previousInputSha256 === find(name).packaged.sha256, { name });
check('DEV-SERVER-EXCLUDED', '개발 서버는 Mac 앱 입력 밖', !find('server.cjs').packaged.exists && !config.inputs.some(input => input.path === 'server.cjs') && actualPackage['node-main'] === 'node-main.js', { missingFileIsExpected: true, appServer: actualPackage['node-main'], developmentServerAcceptanceIsNotAppAcceptance: true });
check('MANIFEST-INTEGRITY', '기존 빌드 입력·복구 계약 내부 일치', config.inputs.length === 7918 && isDeepStrictEqual(config.inputs, config.backup.inputs) && config.backup.sha === previousResult.sourceBackup && config.backup.sha === config.backup.remoteSha, { existingInputCount: config.inputs.length, existingSourceCommit: config.backup.sha, currentWholeInputRevalidated: false });
const changesMiddle = status();
const keywords = 'packaged-source-delta|INTEGRATION_BUILD_TEAM_MASTER|mac-packager|_inventoryFocus|releaseOssuaryAction|inventoryFilterKey|If-None-Match|atomicSaveJSON|runtime-acquire-config-draft';
const docs = command('rg', ['-n', '-e', keywords, 'docs/']);
if (![0, 1].includes(docs.exitCode)) throw Error('DOCS_SEARCH_FAILED: ' + docs.stderr);
const docsLines = docs.stdout.split('\n').filter(Boolean);
const docsMatches = [...new Set(docsLines.map(line => line.split(':')[0]))].sort();
const headAfter = git(['rev-parse', 'HEAD']).trim();
const protectedAfter = protectedFiles.map(record);
const sourceAfter = names.map(name => record(path.join(root, name)));
const packagedAfter = names.map(name => record(path.join(app, name)));
check('SOURCE-STABILITY', '비교 전후 생산 핵심 파일 보존', files.every((row, index) => isDeepStrictEqual(row.source, sourceAfter[index])), { checkedFiles: names });
check('APP-STABILITY', '비교 전후 기존 앱 핵심 파일 보존', files.every((row, index) => isDeepStrictEqual(row.packaged, packagedAfter[index])), { checkedFiles: names, fullAppProof: false });
check('HEAD-STABILITY', '실행 전후 HEAD 보존', headBefore === headAfter, { headBefore, headAfter });
check('PROTECTED-STABILITY', 'task·사용자 config 초안·공용 인덱스 보존', isDeepStrictEqual(protectedBefore, protectedAfter), { before: protectedBefore, after: protectedAfter });
check('DOCS-SEARCH', '관련 키워드 docs 전체 검색', docs.exitCode === 0 && docsLines.length > 0, { matchLines: docsLines.length, matchedFiles: docsMatches.length, outputSha256: digest(docs.stdout) });
const priorEvidencePath = path.join(owner, 'evidence.json');
const latestRemote = fs.existsSync(priorEvidencePath) ? JSON.parse(smallRead(priorEvidencePath)).headTransitionReview?.remote : null;
const remoteSnapshot = latestRemote || { ref: 'refs/heads/codex/mac-environment-20261001', sha: '96610b6546a31e882962470ea1f2164ce94edca6', completedAt: null };
const evidence = {
  schemaVersion: 1, team: 'BUILD', taskId: 'packaged-source-delta',
  owner, status: checks.every(item => item.passed) ? 'SOURCE_DELTA_ACCEPTED_REBUILD_AND_RUNTIME_PENDING' : 'SOURCE_DELTA_REVIEW_REQUIRED',
  receipt: {
    requestReceived: true, firstTaskReadConfirmed: true,
    requestExactAt: null, requestTurnStartedAt: '2026-10-02T03:43:32.000Z', firstTaskReadExactAt: null, firstReadRecordedAt: '2026-10-02T03:43:54.000Z',
    newManagementThread: { threadId: '01a0faaf-9dd5-7c91-ab09-ee0bcff343b0', turnId: '01a0fab5-c8a6-7113-95d5-39fa109bfc7e', source: 'docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PROJECT-TEAM-WORK-DISPATCH-20261002.json', officialTurnStartedAtUnix: 1790912612, actualTaskRead: true, readCommandExitCode: 0 },
    timestampLimit: '총괄 공식 read_thread 인수표에서 요청 처리 턴 시작03:43:32Z·실제 task cat exit0 확인. 메시지 자체/명령별 정확 시각은 제공되지 않아 null로 보존.03:43:54Z는 직후 clock 기록 시각이다.',
    authorization: '2026-10-02 총괄 전달: 팀별 실제 업무 배정 확인, 새 BUILD 관리 채팅 독립 소유 산출 1건.',
    initialChangesObserved: { count: 23, at: null, source: '첫 task/SSOT 인수 명령의 git status --short --untracked-files=all | wc -l 결과' },
    originalSession: { threadId: '01a0f6e6-2e4c-7322-92d7-3aa309857856', title: 'BUILD-task.md 실행하기', latestTask: 'production-inm-acceptance', latestTurnId: '01a0f8cc-c9d8-7de2-a658-a572314bfbad', startedAt: '2026-10-01T18:49:25.000Z', completedAt: '2026-10-01T18:51:03.000Z', turnStatus: 'completed', newlyReceivedDuplicateObserved: false, scope: '직전 공식 read_thread 최신1턴. notLoaded 자체는 종료 근거로 사용하지 않음.' }
  },
  execution: { startedAt, completedAt: new Date().toISOString(), nodeExecutable: process.execPath, nodeVersion: process.version, currentHead: headBefore, headAfter, branch, changesBefore, changesMiddle },
  remote: {
    ref: remoteSnapshot.ref, sha: remoteSnapshot.sha, localMatches: headBefore === remoteSnapshot.sha,
    directReadSucceeded: true, method: '본 채팅의 직전 직접 git ls-remote exit0 관측; 재실행 시 evidence.headTransitionReview.remote를 우선 읽음',
    exactObservedAt: remoteSnapshot.completedAt, timestampLimit: '초기 직접 조회에는 시각 없음. HEAD 변동 후 직접 재조회 시각은 headTransitionReview.remote에 보존. 기존 관측 재사용이며 빌드 직전 새 조회 필요.',
    rootProvidedCheckpointSha: '96610b6546a31e882962470ea1f2164ce94edca6', wholeCurrentInputManifestValidated: false
  },
  previousBuild: { config: record(configPath), result: record(resultPath), appPath: previousResult.appPath, packagePath: app, sourceCommit: previousResult.sourceBackup, builtAt: previousResult.completedAt, inputCount: config.inputs.length, port: config.port, profile: path.join(job, 'user-state/profile'), saveRoot: path.join(job, 'user-state/saves'), runtimeConfigMetadata: { cacheRoot: config.runtime.cacheRoot, releaseInfoPath: config.runtime.releaseInfoPath, releaseInfoSha256: config.runtime.releaseInfoSha256, runtimeFileCount: config.runtime.files.length }, currentFullRuntimeHashRead: false },
  files, checks, summary: { passed: checks.filter(item => item.passed).length, failed: checks.filter(item => !item.passed).length },
  docsSearch: { command: 'rg -n -e KEYWORDS docs/', keywords, exitCode: docs.exitCode, matchLines: docsLines.length, matchedFiles: docsMatches, rawOutputSha256: digest(docs.stdout) },
  preservation: { protectedBefore, protectedAfter },
  nextRebuildContract: {
    sourceRoot: root, observedSourceCommit: headBefore, repinIfSourceChanges: true,
    existingAllowlistCountIsHistorical: true, freshInputShaAndGitBlobBackupRequired: true,
    freshExactRemoteRefShaAndTimestampRequired: true, stale6be3ConfigCannotAuthorizeCurrentBuild: true,
    freshUniqueUuidAndOutputAndProfileAndSaveRequired: true, isolatedPortRange: [1024, 65535], prohibitedPorts: [3333, 3340], portOccupancyCheckNotPerformed: true,
    platform: 'osx', arch: 'arm64', runtimeVersion: '0.111.2', runtimeFlavor: 'normal', localPinnedRuntimeAndLibraryRevalidationRequired: true,
    qaExclusiveReleaseRequired: true, noExecuteAuthorizationInThisTask: true,
    appAcceptance: ['로비→캐릭터 선택→게임', '필터/유골 해제 초점 실제 검수', '설정', '격리 저장 ACK→실제 디스크→앱 종료→재실행→GET/진행 복원', '실제 HTTP/HEAD/Range/미디어', '서명·이동 경로·배포 계약'],
    serverCjsDoesNotPropagateToApp: true, fullRuntimeDependencyCoverage: 'UNKNOWN; 직접 핵심 입력만 인수', uniqueItemCandidatesRemainUnadopted: true
  },
  prohibitedActions: { productionWrites: 0, existingAppWrites: 0, userDraftWrites: 0, serverStarts: 0, httpRequests: 0, uiActions: 0, gameRuns: 0, performanceMeasurements: 0, builds: 0, assetCopies: 0, fullAssetHashes: 0, fullRuntimeHashes: 0, gitWrites: 0, installs: 0, newSessions: 0, subagents: 0, automationChanges: 0 },
  limitations: ['직접 읽은7개 핵심 source와6개 packaged 파일의 비교만 수행', 'server.cjs 부재는 내장 node-main 구조상 예상', '실앱/저장/재실행/미디어/서명/배포는 미검수', '이번 새3산출의 GitHub 체크포인트는 총괄 인수 후 별도', 'HEAD 원격 일치가 모든 현재 입력 및 미커밋 변경의 원격보존을 뜻하지 않음']
};
if (process.argv.includes('--write-evidence')) {
  const output = path.join(owner, 'evidence.json');
  fs.writeFileSync(output, JSON.stringify(evidence, null, 2) + '\n', { flag: 'wx' });
}
console.log(JSON.stringify({ status: evidence.status, execution: evidence.execution, summary: evidence.summary, files: files.map(row => ({ name: row.name, sourceSha: row.source.sha256, packagedSha: row.packaged.sha256 ?? null, equal: row.source.sha256 === row.packaged.sha256, diffHunks: row.delta?.hunks ?? [] })), docsMatches: docsMatches.length, evidenceCreated: process.argv.includes('--write-evidence') }, null, 2));
if (evidence.summary.failed > 0) process.exitCode = 1;
