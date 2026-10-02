// 기존22 검사 실행 없이 core7 byte pin과 acceptance manifest 구조만 인수한다.
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root='/Users/fordeargamers/Projects/exoduser-migration-20261001';
const owner=path.join(root,'tools/team-followup-20261002/codex-half/BUILD');
const task=path.join(owner,'TASK.md');
const digest=value=>createHash('sha256').update(value).digest('hex');
const names=['game.html','game-easy-test.html','server.cjs','node-main.js','ui-panels.js','package.json','index.html'];
const oldCommit='6be3a06b4e8d03768a35f4c57d419f45c8efeb39';
const oldId='08cac1ce-21fb-4874-b4df-c136df5ac269';
const job=path.join(root,'outputs/mac-package-ready/mac-packager-'+oldId);
const app=path.join(job,'package/EXODUSER-'+oldId+'.app');
const archive=path.join(app,'Contents/Resources/app.nw');
const expectedOwnerFiles=['TASK.md','checks.mjs','evidence.json','result.md'];
if(fs.realpathSync(root)!==root||fs.realpathSync(owner)!==owner||fs.realpathSync(task)!==task||fileURLToPath(import.meta.url)!==path.join(owner,'checks.mjs'))throw Error('PATH_BOUNDARY_CHANGED');
function safe(absolute){
  if(!absolute.startsWith(root+'/'))throw Error('PATH_OUTSIDE_CHECKOUT');
  let current='/';
  for(const part of absolute.split('/').filter(Boolean)){
    current=path.join(current,part);
    try{if(fs.lstatSync(current).isSymbolicLink())throw Error('SYMLINK_BOUNDARY_CHANGED: '+current);}catch(error){if(error.code==='ENOENT')return;throw error;}
  }
}
function read(absolute){
  safe(absolute);const before=fs.statSync(absolute);
  if(!before.isFile()||before.size>10*1024*1024)throw Error('SMALL_REGULAR_FILE_REQUIRED');
  const bytes=fs.readFileSync(absolute),after=fs.statSync(absolute);
  if(before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw Error('INPUT_CHANGED_DURING_PIN');
  return bytes;
}
function pin(absolute){
  safe(absolute);
  if(!fs.existsSync(absolute))return {path:absolute,exists:false,bytes:null,sha256:null};
  const bytes=read(absolute);return {path:absolute,exists:true,bytes:bytes.length,sha256:digest(bytes)};
}
const equal=(first,second)=>first.exists===second.exists&&first.bytes===second.bytes&&first.sha256===second.sha256;
const evidencePath=path.join(owner,'evidence.json'),reportPath=path.join(owner,'result.md');
const mode=process.argv[2];
if(process.argv.length!==3||!['--create','--verify'].includes(mode))throw Error('USE_CREATE_OR_VERIFY');
if(fs.readdirSync(owner).some(name=>!expectedOwnerFiles.includes(name)))throw Error('UNOWNED_FILE_IN_OWNER');

if(mode==='--verify'){
  const evidence=JSON.parse(read(evidencePath)),checks=[];
  const verify=(id,passed)=>checks.push({id,passed:Boolean(passed)});
  verify('manifest_seal',digest(JSON.stringify(evidence.acceptanceManifest))===evidence.acceptanceManifestSha256);
  verify('seven_rows',JSON.stringify(evidence.acceptanceManifest.rows.map(row=>row.file))===JSON.stringify(names));
  verify('explicit_stage_flags',evidence.acceptanceManifestReady===true&&evidence.rebuildExecuted===false&&evidence.runtimeAccepted===false&&evidence.productionApplied===false);
  verify('reference_sha_stable',evidence.references.every(ref=>equal(pin(ref.path),ref)));
  verify('source_archive_pins_stable',evidence.acceptanceManifest.rows.every(row=>equal(pin(row.source.path),row.source)&&equal(pin(row.archive.path),row.archive)));
  verify('task_draft_preserved',evidence.protectedInputs.every(ref=>equal(pin(ref.path),ref)));
  verify('report_sha',digest(read(reportPath))===evidence.report.sha256);
  verify('owner_limit',JSON.stringify(fs.readdirSync(owner).sort())===JSON.stringify(expectedOwnerFiles.slice().sort()));
  console.log(JSON.stringify({mode,status:checks.every(check=>check.passed)?'MANIFEST_STRUCTURE_AND_REFERENCES_PASS':'DRIFT_REQUIRES_ROOT_REVIEW',checks,passed:checks.filter(check=>check.passed).length,failed:checks.filter(check=>!check.passed).length,fixtureCount:0,prior22Reruns:0},null,2));
  if(checks.some(check=>!check.passed))process.exitCode=1;
}else{
  if(fs.existsSync(evidencePath)||fs.existsSync(reportPath))throw Error('EXISTING_SUBMISSION_PRESERVED_NO_DUPLICATE');
  const startedAt=new Date().toISOString();
  const referencePaths={
    task,
    priorEvidence:path.join(root,'tools/team-followup-20261002/project-teams/BUILD_TEAM/evidence.json'),
    priorReport:path.join(root,'tools/team-followup-20261002/project-teams/BUILD_TEAM/result.md'),
    config:path.join(root,'tools/team-followup-20261001/BUILD/integrated-mac-build-config.json'),
    buildResult:path.join(root,'tools/team-followup-20261001/BUILD/integrated-mac-build-result.json')
  };
  const references=Object.entries(referencePaths).map(([id,absolute])=>({id,...pin(absolute)}));
  const prior=JSON.parse(read(referencePaths.priorEvidence)),config=JSON.parse(read(referencePaths.config)),build=JSON.parse(read(referencePaths.buildResult));
  if(prior.summary.passed!==22||prior.summary.failed!==0||prior.files.length!==7||config.id!==oldId||build.sourceBackup!==oldCommit||config.backup.sha!==oldCommit||build.job!==job||build.appPath!==app)throw Error('PRIOR_ACCEPTANCE_IDENTITY_MISMATCH');
  const proof=id=>{
    const check=prior.checks.find(check=>check.id===id);
    if(!check?.passed)throw Error('PRIOR_RELATIONSHIP_PROOF_MISSING: '+id);
    return {referenceId:'priorEvidence',pointer:'/checks/'+prior.checks.indexOf(check),checkId:id,priorPassed:true};
  };
  const definitions=[
    {koreanName:'본편 HTML',kind:'KNOWN_FUNCTIONAL_DELTA',description:'선행 당시: 필터 초점 복귀·유골 행동 비활성화 초점 회수2종이 기존 앱에 미포함',proofs:['MANIFEST-game.html'],gates:['실제 키보드/패드·필터/유골 행동 초점','현행 전체입력 재검증·재빌드·실앱 저장 재실행']},
    {koreanName:'쉬운판 HTML',kind:'KNOWN_FUNCTIONAL_DELTA',description:'선행 당시: 위 초점2종이 기존 앱에 미포함; 기본 본편/easy 차이 보존',proofs:['MANIFEST-game-easy-test.html'],gates:['쉬운판 실제 UI·게임','현행 전체입력 재검증·재빌드']},
    {koreanName:'개발 서버',kind:'EXPECTED_EXCLUSION',description:'선행 당시: server.cjs는 기존 앱 입력에 없고 앱 서버는 node-main.js. 개발 INM/Range 인수를 앱 품질로 전달하지 않음',proofs:['DEV-SERVER-EXCLUDED'],gates:['개발 HTTP/HEAD/Range와 앱 내장 서버 별도 인수','서버 기능 앱 포팅은 별도 총괄 소유권']},
    {koreanName:'앱 내장 서버',kind:'EXPECTED_DERIVATION',description:'선행 당시: PORT3333→3383, SAVE_DIR→기존 job/user-state/saves 두 치환만',proofs:['SERVER-DERIVATION'],gates:['실제 앱 HTTP·슬롯 ACK→디스크→종료→재실행→GET','저장·미디어·이동 경로 계약']},
    {koreanName:'패널 스크립트',kind:'BYTE_IDENTICAL',description:'선행 당시: source/archive byte 동일',proofs:['UNCHANGED-ui-panels.js','MANIFEST-ui-panels.js'],gates:['native 패널 초점·전체 게임·레이아웃']},
    {koreanName:'패키지 설정',kind:'EXPECTED_DERIVATION',description:'선행 당시:3383 main/node-remote·고유job 프로필·product_string 파생. name/version/window·나머지 Chromium args 보존, private/type/scripts/devDependencies/dependencies 생략',proofs:['PACKAGE-DERIVATION'],gates:['실앱 부트·코덱·서명·절대 profile/save 이동 및 배포','런타임 의존성 전체 완전성']},
    {koreanName:'로비',kind:'BYTE_IDENTICAL',description:'선행 당시: source/archive byte 동일',proofs:['UNCHANGED-index.html','MANIFEST-index.html'],gates:['실앱 로비→캐릭터 선택→게임·미디어']}
  ];
  const rows=names.map((file,index)=>{
    const before=prior.files.find(row=>row.name===file),definition=definitions[index];
    if(!before||before.source.path!==path.join(root,file)||before.packaged.path!==path.join(archive,file))throw Error('PRIOR_CORE_PATH_MISMATCH');
    const source=pin(before.source.path),archived=pin(before.packaged.path);
    const historicalSource={...before.source,bytes:before.source.bytes??null,sha256:before.source.sha256??null};
    const historicalArchive={...before.packaged,bytes:before.packaged.bytes??null,sha256:before.packaged.sha256??null};
    const sourceMatchesPrior=equal(source,historicalSource),archiveMatchesPrior=equal(archived,historicalArchive);
    const reasons=[];
    if(!sourceMatchesPrior)reasons.push({side:'source',reason:'현행 file byte SHA/bytes 또는 존재 여부가 선행 pin과 다름. 기능 원인 미분류',before:historicalSource,actual:source});
    if(!archiveMatchesPrior)reasons.push({side:'archive',reason:'기존 archive byte SHA/bytes 또는 예상 부재가 선행 pin과 다름. 원인 미분류',before:historicalArchive,actual:archived});
    return {sourceId:'ACC-'+String(index+1).padStart(2,'0'),file,koreanName:definition.koreanName,source,archive:archived,historicalSource,historicalArchive,expectedInArchive:file!=='server.cjs',expectedRelationship:{kind:definition.kind,description:definition.description,scope:'선행22 검수 당시 계약, 이번 변환/기능 검사 재실행0',proofs:definition.proofs.map(proof)},evidenceAnchor:{referenceId:'priorEvidence',pointer:'/files/'+prior.files.indexOf(before),priorDiffHunkCount:before.delta?.hunks.length??0,priorDiffReused:true,newDiffRuns:0},sourceMatchesPrior,archiveMatchesPrior,drift:{status:reasons.length?'DRIFT_REQUIRES_ROOT_REVIEW':'PIN_MATCHES_PRIOR_EVIDENCE',reasons},verificationStage:'FILE_BYTE_PIN_AND_MANIFEST_DOCUMENTATION',runtimeAccepted:false,visualAccepted:false,remainingGates:definition.gates};
  });
  const protectedInputs=[pin(task),pin(path.join(root,'tools/team-followup-20261001/BUILD/runtime-acquire-config-draft.json'))];
  const keywords='acceptanceManifest|packaged-source-delta|08cac1ce|INTEGRATION_BUILD_TEAM_MASTER|releaseOssuaryAction|inventoryFilterKey|node-main|runtime-acquire-config-draft';
  const search=spawnSync('rg',['-n','-e',keywords,'docs/'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024});
  if(search.error||![0,1].includes(search.status))throw Error('DOCS_SEARCH_FAILED');
  const lines=search.stdout.split('\n').filter(Boolean),matchedFiles=[...new Set(lines.map(line=>line.split(':')[0]))].sort();
  const stability={references:references.map(ref=>({id:ref.id,unchanged:equal(pin(ref.path),ref)})),sourceArchive:rows.map(row=>({sourceId:row.sourceId,unchanged:equal(pin(row.source.path),row.source)&&equal(pin(row.archive.path),row.archive)})),protected:protectedInputs.map(ref=>({path:ref.path,unchanged:equal(pin(ref.path),ref)}))};
  const stable=Object.values(stability).flat().every(row=>row.unchanged);
  const acceptanceManifest={schemaVersion:1,algorithm:'SHA-256',sourceRoot:root,archiveJobPath:job,appPath:app,archivePath:archive,originalBuildInputCommit:oldCommit,referencePins:references,rows,stage:'FILE_BYTE_PIN_ONLY',referenceScope:'고정 core7·archive6+예상 비포함1; 현재전체7918입력/실앱 인수 아님'};
  const manifestHash=digest(JSON.stringify(acceptanceManifest)),driftRows=rows.filter(row=>row.drift.reasons.length);
  const evidence={schemaVersion:1,team:'BUILD',task:'archive-delta-acceptance-manifest',owner,receipt:{requestReceived:true,fullTaskReadConfirmed:true,requestExactAt:null,firstReadExactAt:null,recordedAfterReadAt:'2026-10-02T04:31:10.000Z',timestampLimit:'수신/첫 cat 도구에 명령별 시각이 없어 직후 clock 기록만 사용',authority:'최신 사용자: 총괄1+전문15=16, Claude8/Codex8. 이 BUILD 과제 범위 확대0'},execution:{startedAt,completedAt:new Date().toISOString(),nodeExecutable:process.execPath,nodeVersion:process.version,pathBoundaryVerified:true},priorAcceptance:{referenceId:'priorEvidence',acceptedGroups:22,previousValidationCompletedAt:prior.finalization.completedAt,rerunsThisTask:0,rootAcceptedSubmission:true},references,acceptanceManifest,acceptanceManifestSha256:manifestHash,acceptanceManifestReady:stable,sourcePinsMatchPrior:driftRows.length===0,sourceStatus:driftRows.length?'DRIFT_REQUIRES_ROOT_REVIEW':'SOURCE_PINS_MATCH_PRIOR_ACCEPTANCE',rebuildExecuted:false,runtimeAccepted:false,visualAccepted:false,productionApplied:false,counts:{manifestRows:7,sourcePins:7,archiveFilePins:rows.filter(row=>row.archive.exists).length,expectedArchiveAbsences:rows.filter(row=>!row.expectedInArchive&&!row.archive.exists).length,driftRows:driftRows.length,newFixtureCount:0,prior22Reruns:0,newFunctionalChecks:0},protectedInputs,stability,docsSearch:{command:'rg -n -e KEYWORDS docs/',keywords,exitCode:search.status,matchLines:lines.length,matchedFiles,outputSha256:digest(search.stdout)},headAndChanges:{currentGitHead:null,currentRemoteHead:null,currentChanges:null,queriesThisTask:0,priorHeadQuotedFromAcceptedEvidence:prior.finalization.head,priorHeadIsNotCurrent:true,backupCompletedDeclared:false},prohibitedActions:{gitCommands:0,indexAccesses:0,remoteQueries:0,deletions:0,moves:0,cleanup:0,outsideOwnerWrites:0,packagerImports:0,serverImports:0,gameImports:0,builds:0,assetCopies:0,fullAssetHashes:0,downloads:0,installs:0,serverStarts:0,httpRequests:0,gameRuns:0,appRuns:0,uiActions:0,newSessions:0,subagents:0,otherChatMessages:0,saveOrProfileContentReads:0},limitations:['source/manifest PASS ≠ runtime/visual PASS','manifest 준비는 현재 재빌드 승인·7918개 전체 입력 인수·앱 품질 승인 아님','이전 변환·diff를 근거로 인수했고 이번에는 최소 pin만 실행','현재 HEAD/Changes/원격 backup은 새로 조사·선언하지 않음']};
  const stamp=pin=>pin.exists?`${pin.bytes.toLocaleString('en-US')} / ${pin.sha256}`:'예상 비포함 / SHA 없음';
  const relationRows=rows.map(row=>`| ${row.sourceId} / ${row.koreanName} | ${row.file} | ${stamp(row.source)} | ${stamp(row.archive)} | ${row.expectedRelationship.kind}: ${row.expectedRelationship.description} | ${row.drift.status}${row.drift.reasons.length?' — 기능 원인 UNKNOWN':''} | ${row.remainingGates.join('; ')} |`).join('\n');
  const referenceRows=references.map(ref=>`| ${ref.id} | ${ref.path} | ${ref.bytes} | ${ref.sha256} |`).join('\n');
  const report=`# BUILD 기존 앱 acceptance manifest 고정 — 2026-10-02\n\n선행22 source-delta 검사를 완료 근거로 인수하고 재실행하지 않았다. 이번 신규 작업은 core7행의 파일 byte SHA/bytes pin과 근거 문서 SHA 고정이다. 상태 **${evidence.sourceStatus}**, acceptanceManifestReady=${evidence.acceptanceManifestReady}. 새 fixture0·새 기능검사0·이전22 재실행0이다.\n\n## 고정 대상과 검수 단계\n\n- checkout: ${root}\n- immutable TASK: ${task}\n- archive job: ${job}\n- app: ${app}\n- archive: ${archive}\n- 기존 생성 입력 commit: ${oldCommit}\n- 기존 입력7918개는 당시 목록이며 이번 전체입력 검수0\n- manifest SHA-256: ${manifestHash}\n- 실제 pin 실행: ${evidence.execution.startedAt}–${evidence.execution.completedAt}\n- 최신 운영 지시: 총괄1+전문15=16, Claude8/Codex8. 이 과제 범위 확대0\n\n## source ID·byte pin·예상 관계·drift·Gate\n\n각 예상 관계는 선행22 검수 당시 계약이다. 현행 source가 선행 SHA와 다르면 아래 실제 SHA를 유지하고 DRIFT_REQUIRES_ROOT_REVIEW로 기록하며 새 기능 원인을 추정하지 않는다. 선행 hunk 개수/근거 pointer는 evidence의 각 행에 재사용했고 새 diff 실행0이다.\n\n| source ID / 한글명 | 적용 파일 | 현재 source bytes / 전체 SHA-256 | archive bytes / 전체 SHA-256 | 선행 당시 예상 관계 | 이번 실제 pin 상태 | 미검수 Gate |\n|---|---|---|---|---|---|---|\n${relationRows}\n\n## 근거 파일의 전체 SHA 고정\n\n| 근거 ID | 절대경로 | bytes | SHA-256 |\n|---|---|---|---|\n${referenceRows}\n\n각 manifest 행의 evidenceAnchor와 expectedRelationship.proofs는 priorEvidence의 JSON pointer/check ID를 가리키며 위 priorEvidence 전체 SHA에 결속된다. config/result는 기존 앱 생성 신원·제작 commit 근거이지 현재 빌드 승인이 아니다.\n\n## 이번 건수와 준비/승인 구분\n\n| 항목 | 이번 실제 범위 |\n|---|---|\n| 신규 manifest/pin | source7·archive 실파일${evidence.counts.archiveFilePins}·예상 부재${evidence.counts.expectedArchiveAbsences}, 7행 고정 |\n| 신규 drift | ${evidence.counts.driftRows}행, sourceStatus=${evidence.sourceStatus}. 드리프트가 있으면 실제 신규 SHA와 전후값은 evidence에 보존 |\n| 이전 검사 |22 PASS를 인수, 실행0. 이번 pin/구조 검수와 합산하지 않음 |\n| fixture/기능 검사 |0/0. packager·서버·게임 코드 import/실행0 |\n| 상태 | acceptanceManifestReady=${evidence.acceptanceManifestReady}, rebuildExecuted=false, runtimeAccepted=false, visualAccepted=false, productionApplied=false |\n| 경로/보존 | root/TASK/owner realpath 일치, symlink 경계 거부. 기존 TASK·근거·사용자 config 초안과 source/archive pin 전후 보존=${stable}. 삭제/이동/cleanup0 |\n| 산출 | checks.mjs, result.md, evidence.json 3개만. 별도 manifest/config/patch/log/fixture/폴더 생성0 |\n| Git/Changes/원격 | Git 명령·인덱스 접근·원격 조회0, 현재 값UNKNOWN. 선행 인수된 head ${prior.finalization.head}은 이력이며 현재값으로 선언하지 않음 |\n\n**source/manifest PASS ≠ runtime/visual PASS.** 이 manifest는 재빌드 승인이 아니며 전체7918입력·실앱 로비/설정/저장→종료→재실행/HTTP/영상·음향/서명·배포 검수를 대신하지 않는다. server.cjs 개발 서버 인수는 앱 내장 node-main 품질로 전달하지 않는다.\n\n## docs 검색과 총괄 정정안\n\nchecks 코드 작성 뒤 docs 전체에서 ${keywords}를 rg 검색했다. ${lines.length}행/${matchedFiles.length}문서, 원문 output SHA=${evidence.docsSearch.outputSha256}; 정확 목록은 evidence.docsSearch.matchedFiles에 기록. 생산 수치/공식/포함·제외/변환 규칙 변경0, 공용 docs와 보호2_3 수정0이다.\n\n| 총괄 인수 대상 | 필요한 현재상태 추가안 |\n|---|---|\n| docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md | codex-half/BUILD evidence의 acceptance manifest SHA와 reference/core7 pin 상태를 기록. 이전22 인수·이번7행 pin·새fixture0·재빌드/실앱 미인수를 구분. drift가 있으면 DRIFT_REQUIRES_ROOT_REVIEW 및 실제 SHA 명시 |\n| 총괄 팀 상태·후속 인수표 | 본 과제 제출 완료와 acceptanceManifestReady를 기록하되 생산 반영·빌드·runtime/visual 완료로 집계하지 않음. Changes·원격 복구 확인/체크포인트는 총괄이 현재 실제 근거로 수행 |\n| 선행 BUILD 결과의 현행 상태 표 | 기존 보고서의 HEAD31454dfa 및 source SHA를 역사적 관측으로 유지. 이번 실제 SHA는 manifest 행을 참조하며 새 drift 원인을 임의 확정하지 않음 |\n\n재현은 지정 Node 전체 경로로 이 checks.mjs --verify이며 기존22나 packager를 실행하지 않는다. manifest 구조/근거 SHA 확인 결과·최종 산출 목록은 evidence.finalVerification에 별도로 기록한다. 자동 다음 작업·다른 채팅 메시지0, 결과만 총괄 인수에 맡긴다.\n`;
  evidence.report={path:reportPath,bytes:Buffer.byteLength(report),sha256:digest(report)};
  safe(reportPath);safe(evidencePath);
  fs.writeFileSync(reportPath,report,{flag:'wx'});
  fs.writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({mode,acceptanceManifestReady:evidence.acceptanceManifestReady,sourceStatus:evidence.sourceStatus,manifestSha256:manifestHash,counts:evidence.counts,docs:{lines:lines.length,files:matchedFiles.length},completedAt:evidence.execution.completedAt,rebuildExecuted:false,runtimeAccepted:false,productionApplied:false},null,2));
  if(!stable)process.exitCode=1;
}
