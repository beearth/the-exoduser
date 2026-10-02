# BUILD Mac plan 런타임 필수 입력 누락 — 단일 경계 완료

현행 실제 plan이 game.html에서 직접 참조하는 ch1-forest-sway.js를 inputRoots/inputs/backup.inputs 모두에서 뺀 상태를 READY_PLAN_ONLY로 인수했다. 선택 inventory의 SHA가 일치해도 HTML 직접 의존 파일 완전성은 보장하지 않는다. 메모리 후보는 같은 입력을 BLOCKED로 거부하고 정상 closure 대조는 현행과 plan 결과 전체가 동일하다.

새 관측 6/6 PASS, 사건2입력×현행/후보4호출. 기존 완료 검사·전체7918/8258·helper검사·expanded _skUnclick검사 재실행0. productionApplied=false, runtimeAccepted=false, rebuildExecuted=false, visualAccepted=false.

## 원소스·caller 근거

실제 cwd /Users/fordeargamers/Projects/exoduser-migration-20261001; 2026-10-02T10:39:17.586Z–2026-10-02T10:39:17.725Z UTC. parent6b865637은 역사 제공값이고 Git/현재 HEAD 조회0. 원 plan line43, 원fragment SHA b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6, 후보SHA b5f379e5df873b218e1d0be639b04dc3050eda5314ac2a98bf666ff4c5ee8b15. checks SHA 4f82ce298efdce3d5dc06c11ae91272138c24417e7313a33507ac638a50001be.

- game.html:64의 직접 script src ch1-forest-sway.js?v=20260930-90와 build-nwjs.mjs FILES의 같은 경로를 근거로 선택했다. 비용·수치·CH1 맵 구현/geometry/visual은 변경·검수하지 않았다.
- 실제 listTree/sameInventory/plan/relative/directory/readFile/safeAncestors 전체를 VM에서 실행했다. 함수 모형으로 plan을 대체하지 않았다. libraryEvidence와 fs/runtime만 명시적 대역이다.
- 정상 81개, 누락 80개 선택. 유일한 차이는 ch1-forest-sway.js. 소스 Map에는 파일이 존재하지만 선택에서 제외돼 원 listTree는 읽지 않는다. 두 config.inputs/backup.inputs는 각 선택 결과 SHA에 정확히 맞춘다.
- runtime 대역은 arm64 header8바이트와 필수 helper/plist 경로 존재·pin만 충족한다. Mach-O/실런타임 관측이 아니다. memory UUID/port3388/ref/40hex SHA는 시험값이며 실 job/포트/원격승인 값이 아니다.

| 입력 | 현행 전체 plan | 메모리 후보 |
|---|---|---|
| ch1-forest-sway.js만 제외 | READY_PLAN_ONLY — 결함 재현 | BLOCKED / REQUIRED_HTML_DEPENDENCY_MISSING:game.html->ch1-forest-sway.js |
| 직접 local script/stylesheet closure | READY_PLAN_ONLY | READY_PLAN_ONLY, plan 반환 객체 전체동일 |

정상 control에는 credits.html을 넣지 않았고 실제 index.html 외부 https script도 로컬 필수 목록에서 제외했다. 외부 네트워크 호출0. 모든 assets를 강제 포함하지 않았다. 후보는 추가 HTML 읽기가 있으므로 fs trace 전체동등을 주장하지 않는다. 기존 plan 출력·파생 package/server·runtime/backup는 정상에서 동일하다.

## 최소 메모리 patch

기존 core4 REQUIRED_INPUT_MISSING loop 직후 assertHtmlInputClosure(sourceRoot,inputs)1호출을 추가한다. helper2함수는 아래와 같다. production 변경0.

```javascript
function directHtmlDependencies(html,file){
 const result=[],external=[];const clean=html.replace(/<!--[\s\S]*?-->/g,'');
 const attribute=(tag,key)=>{const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const m=tag.match(new RegExp('(?:^|\\s)'+escaped+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));return m?(m[1]??m[2]??m[3]):null;};
 for(const match of clean.matchAll(/<script\b[^>]*>[\s\S]*?<\/script\s*>|<link\b[^>]*>/gi)){
  const tag=match[0].slice(0,match[0].indexOf('>')+1),isScript=/^<script\b/i.test(tag);if(!isScript&&!(attribute(tag,'rel')||'').toLowerCase().split(/\s+/).includes('stylesheet'))continue;
  const value=attribute(tag,isScript?'src':'href');if(!value)continue;
  if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)){external.push(value);continue;}
  const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),value.split(/[?#]/)[0].replace(/^\//,'')));
  if(dependency&&dependency!=='.')result.push({file,path:dependency,url:value,kind:isScript?'script':'stylesheet'});
 }
 return {local:result,external};
}
function assertHtmlInputClosure(sourceRoot,inputs){
 const selected=new Set(inputs.map(input=>input.path));
 for(const input of inputs){if(!/\.html$/i.test(input.path))continue;
  const closure=directHtmlDependencies(readFile(path.join(sourceRoot,input.path)).toString(),input.path);
  for(const dependency of closure.local){relative(dependency.path);requireValue(selected.has(dependency.path),'REQUIRED_HTML_DEPENDENCY_MISSING:'+input.path+'->'+dependency.path);}
 }
}
// 기존 core4 loop 직후:
assertHtmlInputClosure(sourceRoot,inputs);
```

HTML에 직접 명시된 local script src / stylesheet href만 선택 inventory에서 검증한다. query/hash를 제거하고 페이지 기준 경로를 정규화하며 relative() 경계 검사를 유지한다. 외부 scheme/protocol-relative와 a href navigation은 강제하지 않는다. 현재 caller의 정적 패턴에 대한 최소 후보이며 일반 HTML base href/entity 특수처리·CSS url/JS import/동적 의존 완전성·모든 페이지/런타임 에셋 인수는 주장하지 않는다. 실제 파일이 삭제된 경우/중첩 HTML/구문 이상은 추가 사건으로 실행하지 않았다.

## docs 인계

checks 작성 뒤 docs 전체 관련키워드 rg1회: 35행/24문서, exit0, 원문SHA 1b9d432a50014fa54c8b2c3b214757db61a0499693c1fd322744fc5f7cb90a22. 정확 목록/evidence는 아래 JSON. 공유docs·보호2_3 변경0.

| 정본 | old 현재 계약 | new 정확 인계 문안·상태 |
|---|---|---|
| INTEGRATION_BUILD_TEAM_MASTER.md INT-001/선택root 계약 | CH1 script 포함 필요, 선택root 파일 SHA와 core4만 plan 강제; 게임의존성 완전성 root 계약 | BUILD hb1014에서 ch1-forest-sway.js 직접참조 파일을 inputRoots/inputs/backup.inputs에서 함께 제외해도 원 plan READY_PLAN_ONLY가 됨을 재현. 메모리 assertHtmlInputClosure 후보는 REQUIRED_HTML_DEPENDENCY_MISSING:game.html->ch1-forest-sway.js로 BLOCKED; 정상 plan 결과 동일. 미적용 후보이며 실앱 인수 아님 |
| BUILD_BACKUP_POLICY_20261001.md 빌드직전 입력 | 정확 입력 SHA·원격 보존 필요 | SHA inventory 자체 일치와 HTML 직접 local script/stylesheet 의존 선택 완전성을 구분한다. local 직접참조 누락은 빌드 전 거부하는 후보를 검토한다. external/optional credits·전체assets 강제 포함 정책 변경0, source+docs·원격 checkpoint는 총괄 소유 |
| packager 관련 docs/검수 제한 | 선택root 전체커버리지와 동적의존 UNKNOWN | 신규2입력/4전체plan 호출의 메모리 경계만 완료. dynamic import/CSS url/images/audio·실runtime·실앱·native/GPU/시각·서명/배포는 미검수. 기존 helper 통합검사 반복0 |

읽기 중 타팀WIP drift 0경로는 아래 전후SHA에 기록; 원소스 수정0. Git/Changes조회0,80 root checkpoint/100전 중단 감독관리. 새 산출 result.md/checks.mjs2파일, evidence JSON·명령/exit/UTC/전후보존은 report 내 포함한다. 하니스 실패0(최종조건); 정적 read 출력 truncation을 별도 영수증에 기록했다. 도구 exec_command만 실제 사용, 스킬/MCP/새팀/채팅/메시지/설치/빌드/서버/세이브/삭제0.

다음 Gate: 감독이 후보와 직접 참조 범위를 검수 후 총괄이 source+docs scoped 통합·정확 입력/원격 checkpoint. 실제 앱 재빌드 및 script/style 로드·시각 검수는 별도.

## 내장 실행 evidence JSON

```json
{
  "taskId": "BUILD-input-root-runtime-closure-hb1014",
  "provider": "Codex",
  "chatId": "01a0faaf-9dd5-7c91-ab09-ee0bcff343b0",
  "cwd": "/Users/fordeargamers/Projects/exoduser-migration-20261001",
  "owner": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-input-root-runtime-closure-hb1014",
  "startedUtc": "2026-10-02T10:39:17.586Z",
  "endedUtc": "2026-10-02T10:39:17.725Z",
  "startedKst": "2026-10-02T19:39:17.586+09:00",
  "command": "/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-input-root-runtime-closure-hb1014/checks.mjs",
  "exitCode": 0,
  "parentProvidedHistoricalCommit": "6b865637",
  "currentHead": "UNKNOWN_GIT_NOT_QUERIED",
  "refs": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-input-root-runtime-closure-hb1014/TASK.md",
      "bytes": 3996,
      "sha256": "a53733a3e8b667bf502da35d95efa72b983d2dd857c09c26499b3a868bd2dea1",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "bytes": 3373,
      "sha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "bytes": 26076,
      "sha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "bytes": 24374,
      "sha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md",
      "bytes": 21549,
      "sha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md",
      "bytes": 11649,
      "sha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/mac-packager/packager.mjs",
      "bytes": 15503,
      "sha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65",
      "utc": "2026-10-02T10:39:17.587Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs",
      "bytes": 9233,
      "sha256": "567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f",
      "utc": "2026-10-02T10:39:17.588Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html",
      "bytes": 342046,
      "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
      "utc": "2026-10-02T10:39:17.588Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "bytes": 4028178,
      "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "utc": "2026-10-02T10:39:17.590Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json",
      "bytes": 2040,
      "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js",
      "bytes": 10429,
      "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/geometry/ch1_si1_geometry.js",
      "bytes": 4400,
      "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/production_finish/layout.js",
      "bytes": 2857,
      "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-altar-moat.js",
      "bytes": 9514,
      "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-border-foreground.js",
      "bytes": 13209,
      "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22",
      "utc": "2026-10-02T10:39:17.600Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-boundary-edge.js",
      "bytes": 7032,
      "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-face-life.js",
      "bytes": 15841,
      "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-forest-sway.js",
      "bytes": 5573,
      "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-living-detail.js",
      "bytes": 68322,
      "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/character-story-player.js",
      "bytes": 7653,
      "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/cin-enter-engraved.css",
      "bytes": 3826,
      "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/cin-logo-art.js",
      "bytes": 1104,
      "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f",
      "utc": "2026-10-02T10:39:17.601Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-detail.css",
      "bytes": 4444,
      "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-fixed-background.css",
      "bytes": 895,
      "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-information.css",
      "bytes": 641,
      "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems-balance.css",
      "bytes": 436,
      "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems-finish.css",
      "bytes": 30102,
      "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems.css",
      "bytes": 16464,
      "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-oss-balance.css",
      "bytes": 6299,
      "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9",
      "utc": "2026-10-02T10:39:17.602Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-paperdoll.js",
      "bytes": 872,
      "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1",
      "utc": "2026-10-02T10:39:17.603Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-space.css",
      "bytes": 19748,
      "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650",
      "utc": "2026-10-02T10:39:17.603Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/knight-portrait.css",
      "bytes": 1086,
      "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a",
      "utc": "2026-10-02T10:39:17.603Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ar.js",
      "bytes": 151080,
      "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3",
      "utc": "2026-10-02T10:39:17.603Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_bg.js",
      "bytes": 252398,
      "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833",
      "utc": "2026-10-02T10:39:17.603Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_cs.js",
      "bytes": 193157,
      "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca",
      "utc": "2026-10-02T10:39:17.604Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_da.js",
      "bytes": 186292,
      "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58",
      "utc": "2026-10-02T10:39:17.604Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_de.js",
      "bytes": 172454,
      "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e",
      "utc": "2026-10-02T10:39:17.604Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_el.js",
      "bytes": 164851,
      "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b",
      "utc": "2026-10-02T10:39:17.604Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_es.js",
      "bytes": 177229,
      "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49",
      "utc": "2026-10-02T10:39:17.605Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_fi.js",
      "bytes": 129909,
      "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b",
      "utc": "2026-10-02T10:39:17.605Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_fr.js",
      "bytes": 181474,
      "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f",
      "utc": "2026-10-02T10:39:17.605Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_hu.js",
      "bytes": 134634,
      "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77",
      "utc": "2026-10-02T10:39:17.605Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_id.js",
      "bytes": 127904,
      "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc",
      "utc": "2026-10-02T10:39:17.606Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_it.js",
      "bytes": 131202,
      "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a",
      "utc": "2026-10-02T10:39:17.606Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ja.js",
      "bytes": 143810,
      "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818",
      "utc": "2026-10-02T10:39:17.606Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ms.js",
      "bytes": 136342,
      "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4",
      "utc": "2026-10-02T10:39:17.606Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_nl.js",
      "bytes": 191050,
      "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3",
      "utc": "2026-10-02T10:39:17.607Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_no.js",
      "bytes": 187183,
      "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee",
      "utc": "2026-10-02T10:39:17.607Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_pl.js",
      "bytes": 196283,
      "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3",
      "utc": "2026-10-02T10:39:17.608Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ptbr.js",
      "bytes": 193853,
      "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755",
      "utc": "2026-10-02T10:39:17.608Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ro.js",
      "bytes": 131692,
      "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6",
      "utc": "2026-10-02T10:39:17.608Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ru.js",
      "bytes": 223565,
      "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c",
      "utc": "2026-10-02T10:39:17.608Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_sv.js",
      "bytes": 172417,
      "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3",
      "utc": "2026-10-02T10:39:17.609Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_th.js",
      "bytes": 189606,
      "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0",
      "utc": "2026-10-02T10:39:17.609Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_tr.js",
      "bytes": 130343,
      "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3",
      "utc": "2026-10-02T10:39:17.609Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_uk.js",
      "bytes": 226546,
      "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c",
      "utc": "2026-10-02T10:39:17.610Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_vi.js",
      "bytes": 138818,
      "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896",
      "utc": "2026-10-02T10:39:17.610Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_zh.js",
      "bytes": 133167,
      "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556",
      "utc": "2026-10-02T10:39:17.610Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_zht.js",
      "bytes": 133198,
      "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2",
      "utc": "2026-10-02T10:39:17.610Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/level-up-vfx.js",
      "bytes": 7952,
      "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259",
      "utc": "2026-10-02T10:39:17.610Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-ancestor-art.css",
      "bytes": 2687,
      "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf",
      "utc": "2026-10-02T10:39:17.611Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-ancestor-sprite.js",
      "bytes": 4441,
      "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab",
      "utc": "2026-10-02T10:39:17.611Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-stage-info.js",
      "bytes": 1547,
      "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5",
      "utc": "2026-10-02T10:39:17.611Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby_i18n.js",
      "bytes": 121328,
      "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a",
      "utc": "2026-10-02T10:39:17.611Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-data.js",
      "bytes": 3467232,
      "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4",
      "utc": "2026-10-02T10:39:17.613Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-runtime.js",
      "bytes": 3404,
      "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205",
      "utc": "2026-10-02T10:39:17.614Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization.css",
      "bytes": 1242,
      "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150",
      "utc": "2026-10-02T10:39:17.614Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/maps_data.js",
      "bytes": 881757,
      "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e",
      "utc": "2026-10-02T10:39:17.614Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/parry-lesson.css",
      "bytes": 9609,
      "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/parry-lesson.js",
      "bytes": 52677,
      "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/player-attack-remaster.js",
      "bytes": 1568,
      "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/resource-practice.js",
      "bytes": 30174,
      "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/skill-workspace.css",
      "bytes": 5276,
      "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/stat-panel-ui.css",
      "bytes": 64640,
      "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/stat-panel-ui.js",
      "bytes": 51290,
      "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992",
      "utc": "2026-10-02T10:39:17.615Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/system-lesson.css",
      "bytes": 1726,
      "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/system-lesson.js",
      "bytes": 11465,
      "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/three-runtime.js",
      "bytes": 372,
      "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tutorial-badges.css",
      "bytes": 2711,
      "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tutorial-badges.js",
      "bytes": 6451,
      "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-foundation.css",
      "bytes": 21174,
      "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-panels.js",
      "bytes": 11883,
      "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5",
      "utc": "2026-10-02T10:39:17.616Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-refinement.css",
      "bytes": 149334,
      "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9",
      "utc": "2026-10-02T10:39:17.617Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/warrior-bat-swing.js",
      "bytes": 2191,
      "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921",
      "utc": "2026-10-02T10:39:17.617Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/warrior-dash-flight.js",
      "bytes": 1477,
      "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343",
      "utc": "2026-10-02T10:39:17.617Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-player.js",
      "bytes": 3502,
      "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50",
      "utc": "2026-10-02T10:39:17.617Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-subtitles-data.js",
      "bytes": 51862,
      "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768",
      "utc": "2026-10-02T10:39:17.617Z"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-subtitles.js",
      "bytes": 1818,
      "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b",
      "utc": "2026-10-02T10:39:17.617Z"
    }
  ],
  "sourceFragments": {
    "base": {
      "text": "const version='0.111.2';\nconst pins={\n  'index.js':'75e7a65f378bdc33677eb50d53bf9f6ccb90fceb639cdc9abd81205faeffa03d',\n  'bld.js':'9a52b68223e5dc1b3f59ed504db50dc888c6a4c23708b3307a300e48395f29f9',\n  'util.js':'0e35bc436cdfd26e0ba771748688825bfd6b46a6968915b6e12d3d1d23235844',\n  'bld/osx.js':'9db9b472d4eea79776076d187d5329107de73177d82628f88f006e3eb281968a'\n};\nconst digest=data=>createHash('sha256').update(data).digest('hex');\nconst requireValue=(condition,message)=>{if(!condition)throw Error(message);};\nconst protectedSegment=segment=>/^(saves?|userdata.*|profiles?|\\.git|\\.env.*|node_modules|tmp|dist(?:-.*)?|out)$/i.test(segment)||/\\.(app|exe|dll|nw|zip|pem|key)$/i.test(segment);\nfunction safeAncestors(absolute){\n  let current=path.parse(absolute).root;\n  for(const segment of absolute.slice(current.length).split(path.sep).filter(Boolean)){current=path.join(current,segment);requireValue(!fs.lstatSync(current).isSymbolicLink(),'SYMLINK_PATH');}\n}\nfunction directory(value){requireValue(typeof value==='string'&&path.isAbsolute(value),'ABSOLUTE_ROOT_REQUIRED');const resolved=path.resolve(value);safeAncestors(resolved);requireValue(fs.statSync(resolved).isDirectory(),'DIRECTORY_REQUIRED');return resolved;}\nfunction relative(value,protect=true){requireValue(typeof value==='string'&&value&&!path.isAbsolute(value)&&!value.includes('\\\\'),'RELATIVE_PATH_REQUIRED');const segments=value.split('/');requireValue(segments.every(segment=>segment&&segment!=='.'&&segment!=='..'),'PATH_ESCAPE');if(protect)requireValue(!segments.some(protectedSegment),'PROTECTED_INPUT');return value;}\nfunction readFile(absolute){safeAncestors(absolute);const descriptor=fs.openSync(absolute,fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW);try{const before=fs.fstatSync(descriptor);requireValue(before.isFile()&&before.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');const data=fs.readFileSync(descriptor);const after=fs.fstatSync(descriptor);requireValue(before.size===after.size&&before.mtimeMs===after.mtimeMs&&before.ctimeMs===after.ctimeMs,'SOURCE_CHANGED');return data;}finally{fs.closeSync(descriptor);}}\nfunction listTree(root,selection,protect=true){\n  const entries=[];\n  function visit(value){relative(value,protect);const absolute=path.join(root,value),stat=fs.lstatSync(absolute);\n    if(stat.isDirectory()){for(const name of fs.readdirSync(absolute).sort())visit(value+'/'+name);return;}\n    if(stat.isSymbolicLink()){\n      requireValue(!protect,'SYMLINK_INPUT');const target=fs.readlinkSync(absolute);requireValue(!path.isAbsolute(target),'ABSOLUTE_RUNTIME_LINK');const resolved=fs.realpathSync(absolute);requireValue(resolved.startsWith(root+path.sep),'RUNTIME_LINK_ESCAPE');entries.push({path:value,sha256:digest('symlink:'+target),target});return;\n    }\n    requireValue(stat.isFile()&&stat.nlink===1,'REGULAR_SINGLE_LINK_REQUIRED');entries.push({path:value,sha256:digest(readFile(absolute))});\n  }\n  for(const item of selection)visit(item);\n  const sorted=entries.sort((first,second)=>first.path.localeCompare(second.path));requireValue(new Set(sorted.map(entry=>entry.path)).size===sorted.length,'OVERLAPPING_ROOTS');return sorted;\n}\nfunction sameInventory(actual,expected){requireValue(Array.isArray(expected)&&expected.length>0,'EXPLICIT_SHA_INVENTORY_REQUIRED');const normalized=expected.map(entry=>({path:relative(entry.path,false),sha256:entry.sha256,...(entry.target===undefined?{}:{target:entry.target})})).sort((first,second)=>first.path.localeCompare(second.path));requireValue(normalized.every(entry=>/^[a-f0-9]{64}$/.test(entry.sha256)),'SHA_FORMAT');requireValue(JSON.stringify(actual)===JSON.stringify(normalized),'INVENTORY_SHA_OR_COVERAGE_MISMATCH');}\n",
      "sha256": "561d2dd443e5698d495bfd6365a85f07e7439ab99523acd21d1220bb198e371b"
    },
    "plan": {
      "text": "function plan(config){\n  try{\n    requireValue(process.platform==='darwin','DARWIN_HOST_REQUIRED');const arch=config.arch||process.arch;requireValue(['arm64','x64'].includes(arch),'MAC_ARCH_REQUIRED');\n    const sourceRoot=directory(config.sourceRoot),outputRoot=directory(config.outputRoot);requireValue(!sourceRoot.split(path.sep).some(protectedSegment),'PROTECTED_SOURCE_ROOT');requireValue(!outputRoot.split(path.sep).some(protectedSegment),'PROTECTED_OUTPUT_ROOT');\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');\n    const id=config.id||randomUUID();requireValue(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id),'UNIQUE_ID_REQUIRED');\n    const job=path.join(outputRoot,'mac-packager-'+id);try{fs.lstatSync(job);throw Error('JOB_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}\n    requireValue(Number.isInteger(config.port)&&config.port>=1024&&config.port<=65535&&![3333,3340].includes(config.port),'ISOLATED_PORT_REQUIRED');\n    requireValue(config.backup&&/^[a-f0-9]{40}$/.test(config.backup.sha)&&config.backup.sha===config.backup.remoteSha&&/^refs\\/(heads|tags)\\/.+/.test(config.backup.remoteRef)&&Number.isFinite(Date.parse(config.backup.verifiedAt)),'REMOTE_BACKUP_EVIDENCE_REQUIRED');\n    requireValue(Array.isArray(config.inputRoots)&&config.inputRoots.length>0,'INPUT_ROOTS_REQUIRED');const inputs=listTree(sourceRoot,config.inputRoots);sameInventory(inputs,config.inputs);\n    sameInventory(inputs,config.backup.inputs);for(const required of ['package.json','node-main.js','index.html','game.html'])requireValue(inputs.some(entry=>entry.path===required),'REQUIRED_INPUT_MISSING:'+required);\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');const cacheRoot=directory(config.runtime.cacheRoot),runtimeRoot=path.join(cacheRoot,`nwjs-v${version}-osx-${arch}`);directory(runtimeRoot);\n    requireValue(typeof config.runtime.releaseInfoPath==='string'&&path.isAbsolute(config.runtime.releaseInfoPath)&&config.runtime.releaseInfoPath.endsWith('.json')&&!config.runtime.releaseInfoPath.split(path.sep).some(protectedSegment),'ABSOLUTE_RELEASE_INFO_REQUIRED');const releaseBytes=readFile(config.runtime.releaseInfoPath),releaseInfo=JSON.parse(releaseBytes);requireValue(digest(releaseBytes)===config.runtime.releaseInfoSha256,'RELEASE_INFO_SHA');requireValue(releaseInfo.version==='v'+version&&/^[0-9]+(?:\\.[0-9]+){1,3}$/.test(releaseInfo.components?.chromium),'LOCAL_RELEASE_INFO_REQUIRED');\n    const runtimeFiles=listTree(runtimeRoot,['nwjs.app'],false);sameInventory(runtimeFiles,config.runtime.files);\n    const binary=readFile(path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'));requireValue(binary.length>=8&&binary.readUInt32LE(0)===0xfeedfacf&&binary.readUInt32LE(4)===(arch==='arm64'?0x0100000c:0x01000007),'RUNTIME_ARCH_UNKNOWN_OR_MISMATCH');\n    const chromium=releaseInfo.components.chromium;\n    const requiredRuntime=['nwjs.app/Contents/Info.plist','nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings'];\n    for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)'])requiredRuntime.push(`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/Info.plist`,`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/MacOS/${helper}`);\n    for(const required of requiredRuntime)requireValue(runtimeFiles.some(entry=>entry.path===required),'RUNTIME_FILE_MISSING:'+required);\n    const name='EXODUSER-'+id,stage=path.join(job,'stage'),output=path.join(job,'package'),saveRoot=path.join(job,'user-state/saves'),profile=path.join(job,'user-state/profile');\n    requireValue(path.isAbsolute(profile)&&!/[\\s\"'\\x00-\\x1f\\x7f]/.test(profile),'UNSUPPORTED_PROFILE_ARGUMENT_PATH');\n    const packageInfo=JSON.parse(readFile(path.join(sourceRoot,'package.json')));requireValue(packageInfo.main==='http://localhost:3333/index.html?demo=1'&&packageInfo['node-main']==='node-main.js','PACKAGE_ENTRY_CONTRACT');\n    requireValue(typeof packageInfo['chromium-args']==='string'&&(packageInfo['chromium-args'].match(/--user-data-dir=\\S+/g)||[]).length===1,'PROFILE_CONTRACT');\n    const derivedPackage={name:packageInfo.name,version:packageInfo.version,main:`http://127.0.0.1:${config.port}/index.html?demo=1`,'node-main':'node-main.js','node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],window:packageInfo.window,'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\\S+/,`--user-data-dir=${profile}`)};\n    const originalServer=readFile(path.join(sourceRoot,'node-main.js')).toString();const portNeedle='const PORT = 3333;',saveNeedle=\"const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');\";\n    requireValue(originalServer.split(portNeedle).length===2&&originalServer.split(saveNeedle).length===2,'SERVER_DERIVATION_CONTRACT');\n    const derivedServer=originalServer.replace(portNeedle,`const PORT = ${config.port};`).replace(saveNeedle,`const SAVE_DIR = ${JSON.stringify(saveRoot)};`);\n    return {status:'READY_PLAN_ONLY',id,job,sourceRoot,inputs,runtimeRoot,runtimeFiles,derivedPackage,derivedServer,backup:config.backup,library:libraryEvidence(),paths:{stage,output,profile,saveRoot},args:{version,flavor:'normal',platform:'osx',arch,srcDir:stage,cacheDir:cacheRoot,outDir:output,glob:false,managedManifest:false,zip:false,releaseInfo,app:{name,CFBundleIdentifier:'com.exoduser.mac.'+id,CFBundleName:name,CFBundleDisplayName:'EXODUSER',CFBundleVersion:'1.0.0',CFBundleShortVersionString:'1.0.0',LSApplicationCategoryType:'public.app-category.games'}},packageCreated:false,limits:['로컬bld내부API고정;최상위getter/manifest/다운로드호출안함','SHA/원격근거는제공된파일목록대조;외부Git조회아님','선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약','port는정적격리값;실행직전실제점유검사는별도','서명/코덱/실행검수미완료','프로필/저장절대경로는고유job에귀속;이동/배포계약별도']};\n  }catch(error){return {status:'BLOCKED',error:String(error.message),packageCreated:false};}\n}",
      "sha256": "b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6",
      "startLine": 43
    },
    "candidate": {
      "text": "function plan(config){\n  try{\n    requireValue(process.platform==='darwin','DARWIN_HOST_REQUIRED');const arch=config.arch||process.arch;requireValue(['arm64','x64'].includes(arch),'MAC_ARCH_REQUIRED');\n    const sourceRoot=directory(config.sourceRoot),outputRoot=directory(config.outputRoot);requireValue(!sourceRoot.split(path.sep).some(protectedSegment),'PROTECTED_SOURCE_ROOT');requireValue(!outputRoot.split(path.sep).some(protectedSegment),'PROTECTED_OUTPUT_ROOT');\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');\n    const id=config.id||randomUUID();requireValue(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(id),'UNIQUE_ID_REQUIRED');\n    const job=path.join(outputRoot,'mac-packager-'+id);try{fs.lstatSync(job);throw Error('JOB_ALREADY_EXISTS');}catch(error){if(error.code!=='ENOENT')throw error;}\n    requireValue(Number.isInteger(config.port)&&config.port>=1024&&config.port<=65535&&![3333,3340].includes(config.port),'ISOLATED_PORT_REQUIRED');\n    requireValue(config.backup&&/^[a-f0-9]{40}$/.test(config.backup.sha)&&config.backup.sha===config.backup.remoteSha&&/^refs\\/(heads|tags)\\/.+/.test(config.backup.remoteRef)&&Number.isFinite(Date.parse(config.backup.verifiedAt)),'REMOTE_BACKUP_EVIDENCE_REQUIRED');\n    requireValue(Array.isArray(config.inputRoots)&&config.inputRoots.length>0,'INPUT_ROOTS_REQUIRED');const inputs=listTree(sourceRoot,config.inputRoots);sameInventory(inputs,config.inputs);\n    sameInventory(inputs,config.backup.inputs);for(const required of ['package.json','node-main.js','index.html','game.html'])requireValue(inputs.some(entry=>entry.path===required),'REQUIRED_INPUT_MISSING:'+required);\n    assertHtmlInputClosure(sourceRoot,inputs);\n    requireValue(config.runtime&&config.runtime.cacheRoot,'MAC_RUNTIME_MISSING');const cacheRoot=directory(config.runtime.cacheRoot),runtimeRoot=path.join(cacheRoot,`nwjs-v${version}-osx-${arch}`);directory(runtimeRoot);\n    requireValue(typeof config.runtime.releaseInfoPath==='string'&&path.isAbsolute(config.runtime.releaseInfoPath)&&config.runtime.releaseInfoPath.endsWith('.json')&&!config.runtime.releaseInfoPath.split(path.sep).some(protectedSegment),'ABSOLUTE_RELEASE_INFO_REQUIRED');const releaseBytes=readFile(config.runtime.releaseInfoPath),releaseInfo=JSON.parse(releaseBytes);requireValue(digest(releaseBytes)===config.runtime.releaseInfoSha256,'RELEASE_INFO_SHA');requireValue(releaseInfo.version==='v'+version&&/^[0-9]+(?:\\.[0-9]+){1,3}$/.test(releaseInfo.components?.chromium),'LOCAL_RELEASE_INFO_REQUIRED');\n    const runtimeFiles=listTree(runtimeRoot,['nwjs.app'],false);sameInventory(runtimeFiles,config.runtime.files);\n    const binary=readFile(path.join(runtimeRoot,'nwjs.app/Contents/MacOS/nwjs'));requireValue(binary.length>=8&&binary.readUInt32LE(0)===0xfeedfacf&&binary.readUInt32LE(4)===(arch==='arm64'?0x0100000c:0x01000007),'RUNTIME_ARCH_UNKNOWN_OR_MISMATCH');\n    const chromium=releaseInfo.components.chromium;\n    const requiredRuntime=['nwjs.app/Contents/Info.plist','nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings'];\n    for(const helper of ['nwjs Helper','nwjs Helper (Alerts)','nwjs Helper (GPU)','nwjs Helper (Renderer)'])requiredRuntime.push(`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/Info.plist`,`nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/${chromium}/Helpers/${helper}.app/Contents/MacOS/${helper}`);\n    for(const required of requiredRuntime)requireValue(runtimeFiles.some(entry=>entry.path===required),'RUNTIME_FILE_MISSING:'+required);\n    const name='EXODUSER-'+id,stage=path.join(job,'stage'),output=path.join(job,'package'),saveRoot=path.join(job,'user-state/saves'),profile=path.join(job,'user-state/profile');\n    requireValue(path.isAbsolute(profile)&&!/[\\s\"'\\x00-\\x1f\\x7f]/.test(profile),'UNSUPPORTED_PROFILE_ARGUMENT_PATH');\n    const packageInfo=JSON.parse(readFile(path.join(sourceRoot,'package.json')));requireValue(packageInfo.main==='http://localhost:3333/index.html?demo=1'&&packageInfo['node-main']==='node-main.js','PACKAGE_ENTRY_CONTRACT');\n    requireValue(typeof packageInfo['chromium-args']==='string'&&(packageInfo['chromium-args'].match(/--user-data-dir=\\S+/g)||[]).length===1,'PROFILE_CONTRACT');\n    const derivedPackage={name:packageInfo.name,version:packageInfo.version,main:`http://127.0.0.1:${config.port}/index.html?demo=1`,'node-main':'node-main.js','node-remote':[`http://127.0.0.1:${config.port}`,`http://localhost:${config.port}`],window:packageInfo.window,'chromium-args':packageInfo['chromium-args'].replace(/--user-data-dir=\\S+/,`--user-data-dir=${profile}`)};\n    const originalServer=readFile(path.join(sourceRoot,'node-main.js')).toString();const portNeedle='const PORT = 3333;',saveNeedle=\"const SAVE_DIR = path.join(APPDATA, 'EXODUSER-HELL', 'saves');\";\n    requireValue(originalServer.split(portNeedle).length===2&&originalServer.split(saveNeedle).length===2,'SERVER_DERIVATION_CONTRACT');\n    const derivedServer=originalServer.replace(portNeedle,`const PORT = ${config.port};`).replace(saveNeedle,`const SAVE_DIR = ${JSON.stringify(saveRoot)};`);\n    return {status:'READY_PLAN_ONLY',id,job,sourceRoot,inputs,runtimeRoot,runtimeFiles,derivedPackage,derivedServer,backup:config.backup,library:libraryEvidence(),paths:{stage,output,profile,saveRoot},args:{version,flavor:'normal',platform:'osx',arch,srcDir:stage,cacheDir:cacheRoot,outDir:output,glob:false,managedManifest:false,zip:false,releaseInfo,app:{name,CFBundleIdentifier:'com.exoduser.mac.'+id,CFBundleName:name,CFBundleDisplayName:'EXODUSER',CFBundleVersion:'1.0.0',CFBundleShortVersionString:'1.0.0',LSApplicationCategoryType:'public.app-category.games'}},packageCreated:false,limits:['로컬bld내부API고정;최상위getter/manifest/다운로드호출안함','SHA/원격근거는제공된파일목록대조;외부Git조회아님','선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약','port는정적격리값;실행직전실제점유검사는별도','서명/코덱/실행검수미완료','프로필/저장절대경로는고유job에귀속;이동/배포계약별도']};\n  }catch(error){return {status:'BLOCKED',error:String(error.message),packageCreated:false};}\n}",
      "sha256": "b5f379e5df873b218e1d0be639b04dc3050eda5314ac2a98bf666ff4c5ee8b15"
    },
    "closureHelpers": {
      "directHtmlDependencies": "function directHtmlDependencies(html,file){\n const result=[],external=[];const clean=html.replace(/<!--[\\s\\S]*?-->/g,'');\n const attribute=(tag,key)=>{const escaped=key.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&');const m=tag.match(new RegExp('(?:^|\\\\s)'+escaped+'\\\\s*=\\\\s*(?:\"([^\"]*)\"|\\'([^\\']*)\\'|([^\\\\s>]+))','i'));return m?(m[1]??m[2]??m[3]):null;};\n for(const match of clean.matchAll(/<script\\b[^>]*>[\\s\\S]*?<\\/script\\s*>|<link\\b[^>]*>/gi)){\n  const tag=match[0].slice(0,match[0].indexOf('>')+1),isScript=/^<script\\b/i.test(tag);if(!isScript&&!(attribute(tag,'rel')||'').toLowerCase().split(/\\s+/).includes('stylesheet'))continue;\n  const value=attribute(tag,isScript?'src':'href');if(!value)continue;\n  if(/^(?:[a-z][a-z0-9+.-]*:|\\/\\/)/i.test(value)){external.push(value);continue;}\n  const dependency=path.posix.normalize(path.posix.join(path.posix.dirname(file),value.split(/[?#]/)[0].replace(/^\\//,'')));\n  if(dependency&&dependency!=='.')result.push({file,path:dependency,url:value,kind:isScript?'script':'stylesheet'});\n }\n return {local:result,external};\n}",
      "assertHtmlInputClosure": "function assertHtmlInputClosure(sourceRoot,inputs){\n const selected=new Set(inputs.map(input=>input.path));\n for(const input of inputs){if(!/\\.html$/i.test(input.path))continue;\n  const closure=directHtmlDependencies(readFile(path.join(sourceRoot,input.path)).toString(),input.path);\n  for(const dependency of closure.local){relative(dependency.path);requireValue(selected.has(dependency.path),'REQUIRED_HTML_DEPENDENCY_MISSING:'+input.path+'->'+dependency.path);}\n }\n}"
    },
    "caller": {
      "FILESFragment": "const FILES = [\n  'index.html', 'game.html', 'credits.html',\n  'game-easy-test.html', 'game-guide.html',\n  'player-attack-remaster.js',\n  'warrior-bat-swing.js',\n  'warrior-dash-flight.js',\n  'ch1-living-detail.js',\n  'ch1-forest-sway.js',\n  'ch1-face-life.js',\n  'ch1-altar-moat.js',\n  'ch1-border-foreground.js',\n  'ch1-boundary-edge.js',\n  'parry-lesson.js', 'parry-lesson.css', 'resource-practice.js',\n  'system-lesson.js', 'system-lesson.css',\n  'tutorial-badges.js', 'tutorial-badges.css',\n  'stat-panel-ui.js', 'stat-panel-ui.css',\n  'growth-tree-detail.css', 'growth-tree-fixed-background.css', 'growth-tree-information.css',\n  'ui-foundation.css',\n  'ui-refinement.css',\n  'inventory-gems.css',\n  'inventory-gems-finish.css',\n  'inventory-space.css',\n  'inventory-paperdoll.js', 'knight-portrait.css',\n  'inventory-oss-balance.css', 'inventory-gems-balance.css',\n  'skill-workspace.css',\n  'ui-panels.js',\n  'localization-runtime.js', 'localization-data.js', 'localization.css',\n  'lobby-stage-info.js', 'character-story-player.js', 'level-up-vfx.js',\n  'lobby-ancestor-art.css', 'lobby-ancestor-sprite.js',\n  'world-intro-player.js', 'world-intro-subtitles-data.js', 'world-intro-subtitles.js',\n  'cin-enter-engraved.css', 'cin-logo-art.js',\n  'GLTFLoader.js', 'three.min.js', 'three-runtime.js',\n  'maps_data.js', 'lobby_i18n.js',\n  'favicon.ico',\n  'proj_atlas.png', 'prefabs/registry.json',\n  'output/imagegen/exoduser-hell-lord-logo-api-v1.png', 'output/imagegen/enter-gothic-api-v1.png',\n  'output/fdg_reference_1280x720.png',\n  'output/imagegen/forge-icon-sheet-v1.png', 'output/imagegen/forge-icon-sheet-v3.png',\n];\nconst OPTIONAL_FILES = new Set(['credits.html']);\n",
      "sha256": "567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f"
    }
  },
  "closureRows": [
    {
      "file": "index.html",
      "local": [
        {
          "file": "index.html",
          "path": "localization-runtime.js",
          "url": "localization-runtime.js",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "localization-data.js",
          "url": "localization-data.js",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "localization.css",
          "url": "localization.css?v=20260909",
          "kind": "stylesheet"
        },
        {
          "file": "index.html",
          "path": "ui-foundation.css",
          "url": "ui-foundation.css?v=20260927-enter-responsive",
          "kind": "stylesheet"
        },
        {
          "file": "index.html",
          "path": "ui-refinement.css",
          "url": "ui-refinement.css?v=20260930-settings-title-plaque",
          "kind": "stylesheet"
        },
        {
          "file": "index.html",
          "path": "lobby-ancestor-art.css",
          "url": "lobby-ancestor-art.css?v=20260929-slotart3",
          "kind": "stylesheet"
        },
        {
          "file": "index.html",
          "path": "lobby-ancestor-sprite.js",
          "url": "lobby-ancestor-sprite.js?v=20260929-slotart2",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "lobby_i18n.js",
          "url": "lobby_i18n.js",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "lobby-stage-info.js",
          "url": "lobby-stage-info.js",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "character-story-player.js",
          "url": "character-story-player.js?v=20260914-space-hold",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "world-intro-player.js",
          "url": "world-intro-player.js?v=20260907-v12-fullscene-newvoice",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "world-intro-subtitles-data.js",
          "url": "world-intro-subtitles-data.js?v=20260907-v13-exodus-ko-escape",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "world-intro-subtitles.js",
          "url": "world-intro-subtitles.js?v=20260907-v6-cinema-size",
          "kind": "script"
        },
        {
          "file": "index.html",
          "path": "cin-enter-engraved.css",
          "url": "cin-enter-engraved.css?v=20260907-enter-4",
          "kind": "stylesheet"
        },
        {
          "file": "index.html",
          "path": "cin-logo-art.js",
          "url": "cin-logo-art.js?v=20260907-enter-2",
          "kind": "script"
        }
      ],
      "external": [
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"
      ]
    },
    {
      "file": "game.html",
      "local": [
        {
          "file": "game.html",
          "path": "player-attack-remaster.js",
          "url": "player-attack-remaster.js?v=20260915-spin-speed15",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "warrior-bat-swing.js",
          "url": "warrior-bat-swing.js?v=20260915-speed85",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "warrior-dash-flight.js",
          "url": "warrior-dash-flight.js?v=20260924-flight1",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "tutorial-badges.css",
          "url": "tutorial-badges.css?v=20260929-earned-hud",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "tutorial-badges.js",
          "url": "tutorial-badges.js?v=20260929-earned-hud",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "system-lesson.css",
          "url": "system-lesson.css?v=20260912-restored4",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "system-lesson.js",
          "url": "system-lesson.js?v=20260912-skip-density1",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "parry-lesson.css",
          "url": "parry-lesson.css?v=20260913-mission-details1",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "resource-practice.js",
          "url": "resource-practice.js?v=20260916-recovery2",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "parry-lesson.js",
          "url": "parry-lesson.js?v=20261001-kislash-2sec",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "three-runtime.js",
          "url": "three-runtime.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "maps_data.js",
          "url": "maps_data.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
          "url": "assets/map/ch1/geometry/ch1_si1_geometry.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "assets/map/ch1/production_finish/layout.js",
          "url": "assets/map/ch1/production_finish/layout.js?v=20260916-finish-1",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-living-detail.js",
          "url": "ch1-living-detail.js?v=20260929-87",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-forest-sway.js",
          "url": "ch1-forest-sway.js?v=20260930-90",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-face-life.js",
          "url": "ch1-face-life.js?v=20260930-97",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-altar-moat.js",
          "url": "ch1-altar-moat.js?v=20261001-3",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-border-foreground.js",
          "url": "ch1-border-foreground.js?v=20261001-3",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "ch1-boundary-edge.js",
          "url": "ch1-boundary-edge.js?v=20261001-5",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_zh.js",
          "url": "lang_zh.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ja.js",
          "url": "lang_ja.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_es.js",
          "url": "lang_es.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_zht.js",
          "url": "lang_zht.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ru.js",
          "url": "lang_ru.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_de.js",
          "url": "lang_de.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ptbr.js",
          "url": "lang_ptbr.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_fr.js",
          "url": "lang_fr.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_pl.js",
          "url": "lang_pl.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_it.js",
          "url": "lang_it.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_uk.js",
          "url": "lang_uk.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_tr.js",
          "url": "lang_tr.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_vi.js",
          "url": "lang_vi.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_th.js",
          "url": "lang_th.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_id.js",
          "url": "lang_id.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ar.js",
          "url": "lang_ar.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_sv.js",
          "url": "lang_sv.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_da.js",
          "url": "lang_da.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_no.js",
          "url": "lang_no.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_fi.js",
          "url": "lang_fi.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_cs.js",
          "url": "lang_cs.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_hu.js",
          "url": "lang_hu.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ro.js",
          "url": "lang_ro.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_nl.js",
          "url": "lang_nl.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_el.js",
          "url": "lang_el.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_bg.js",
          "url": "lang_bg.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "lang_ms.js",
          "url": "lang_ms.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "localization-runtime.js",
          "url": "localization-runtime.js",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "localization-data.js",
          "url": "localization-data.js?v=20260910-nemesia-dialogue",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "level-up-vfx.js",
          "url": "level-up-vfx.js?v=20260910-readable-v3",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "stat-panel-ui.css",
          "url": "stat-panel-ui.css?v=20260913-smooth-ui",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "localization.css",
          "url": "localization.css?v=20260909",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "ui-foundation.css",
          "url": "ui-foundation.css?v=20260930-lesson-translucent",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "ui-refinement.css",
          "url": "ui-refinement.css?v=20261001-combat-status22",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "growth-tree-detail.css",
          "url": "growth-tree-detail.css?v=20260927-body-art3",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "knight-portrait.css",
          "url": "knight-portrait.css?v=20260928-equipment-cutout3",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "inventory-paperdoll.js",
          "url": "inventory-paperdoll.js?v=20260928-equipment-cutout3",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "growth-tree-fixed-background.css",
          "url": "growth-tree-fixed-background.css?v=20260927-fixed2",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "growth-tree-information.css",
          "url": "growth-tree-information.css?v=20260927-info1",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "ui-panels.js",
          "url": "ui-panels.js?v=20261001-settings-nav17",
          "kind": "script"
        },
        {
          "file": "game.html",
          "path": "inventory-gems.css",
          "url": "inventory-gems.css?v=20260927-jewel-finish",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "inventory-gems-finish.css",
          "url": "inventory-gems-finish.css?v=20260927-square-art2",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "inventory-space.css",
          "url": "inventory-space.css?v=20260928-relic-frame1",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "skill-workspace.css",
          "url": "skill-workspace.css?v=20260928-fixed-categories5",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "inventory-oss-balance.css",
          "url": "inventory-oss-balance.css?v=20260928-ossuary-fit5",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "inventory-gems-balance.css",
          "url": "inventory-gems-balance.css?v=20260927-half",
          "kind": "stylesheet"
        },
        {
          "file": "game.html",
          "path": "stat-panel-ui.js",
          "url": "stat-panel-ui.js?v=20260927-auto-invest2",
          "kind": "script"
        }
      ],
      "external": []
    }
  ],
  "target": "ch1-forest-sway.js",
  "configuration": {
    "normal": {
      "sourceRoot": "/memory/project",
      "outputRoot": "/memory/output",
      "arch": "arm64",
      "id": "00000000-0000-4000-8000-000000000001",
      "port": 3388,
      "inputRoots": [
        "assets/map/ch1/geometry/ch1_si1_geometry.js",
        "assets/map/ch1/production_finish/layout.js",
        "ch1-altar-moat.js",
        "ch1-border-foreground.js",
        "ch1-boundary-edge.js",
        "ch1-face-life.js",
        "ch1-forest-sway.js",
        "ch1-living-detail.js",
        "character-story-player.js",
        "cin-enter-engraved.css",
        "cin-logo-art.js",
        "game.html",
        "growth-tree-detail.css",
        "growth-tree-fixed-background.css",
        "growth-tree-information.css",
        "index.html",
        "inventory-gems-balance.css",
        "inventory-gems-finish.css",
        "inventory-gems.css",
        "inventory-oss-balance.css",
        "inventory-paperdoll.js",
        "inventory-space.css",
        "knight-portrait.css",
        "lang_ar.js",
        "lang_bg.js",
        "lang_cs.js",
        "lang_da.js",
        "lang_de.js",
        "lang_el.js",
        "lang_es.js",
        "lang_fi.js",
        "lang_fr.js",
        "lang_hu.js",
        "lang_id.js",
        "lang_it.js",
        "lang_ja.js",
        "lang_ms.js",
        "lang_nl.js",
        "lang_no.js",
        "lang_pl.js",
        "lang_ptbr.js",
        "lang_ro.js",
        "lang_ru.js",
        "lang_sv.js",
        "lang_th.js",
        "lang_tr.js",
        "lang_uk.js",
        "lang_vi.js",
        "lang_zh.js",
        "lang_zht.js",
        "level-up-vfx.js",
        "lobby-ancestor-art.css",
        "lobby-ancestor-sprite.js",
        "lobby-stage-info.js",
        "lobby_i18n.js",
        "localization-data.js",
        "localization-runtime.js",
        "localization.css",
        "maps_data.js",
        "node-main.js",
        "package.json",
        "parry-lesson.css",
        "parry-lesson.js",
        "player-attack-remaster.js",
        "resource-practice.js",
        "skill-workspace.css",
        "stat-panel-ui.css",
        "stat-panel-ui.js",
        "system-lesson.css",
        "system-lesson.js",
        "three-runtime.js",
        "tutorial-badges.css",
        "tutorial-badges.js",
        "ui-foundation.css",
        "ui-panels.js",
        "ui-refinement.css",
        "warrior-bat-swing.js",
        "warrior-dash-flight.js",
        "world-intro-player.js",
        "world-intro-subtitles-data.js",
        "world-intro-subtitles.js"
      ],
      "inputs": [
        {
          "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
          "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
        },
        {
          "path": "assets/map/ch1/production_finish/layout.js",
          "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
        },
        {
          "path": "ch1-altar-moat.js",
          "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
        },
        {
          "path": "ch1-border-foreground.js",
          "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
        },
        {
          "path": "ch1-boundary-edge.js",
          "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
        },
        {
          "path": "ch1-face-life.js",
          "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
        },
        {
          "path": "ch1-forest-sway.js",
          "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
        },
        {
          "path": "ch1-living-detail.js",
          "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
        },
        {
          "path": "character-story-player.js",
          "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
        },
        {
          "path": "cin-enter-engraved.css",
          "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
        },
        {
          "path": "cin-logo-art.js",
          "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
        },
        {
          "path": "game.html",
          "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
        },
        {
          "path": "growth-tree-detail.css",
          "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
        },
        {
          "path": "growth-tree-fixed-background.css",
          "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
        },
        {
          "path": "growth-tree-information.css",
          "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
        },
        {
          "path": "index.html",
          "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
        },
        {
          "path": "inventory-gems-balance.css",
          "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
        },
        {
          "path": "inventory-gems-finish.css",
          "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
        },
        {
          "path": "inventory-gems.css",
          "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
        },
        {
          "path": "inventory-oss-balance.css",
          "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
        },
        {
          "path": "inventory-paperdoll.js",
          "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
        },
        {
          "path": "inventory-space.css",
          "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
        },
        {
          "path": "knight-portrait.css",
          "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
        },
        {
          "path": "lang_ar.js",
          "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
        },
        {
          "path": "lang_bg.js",
          "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
        },
        {
          "path": "lang_cs.js",
          "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
        },
        {
          "path": "lang_da.js",
          "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
        },
        {
          "path": "lang_de.js",
          "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
        },
        {
          "path": "lang_el.js",
          "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
        },
        {
          "path": "lang_es.js",
          "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
        },
        {
          "path": "lang_fi.js",
          "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
        },
        {
          "path": "lang_fr.js",
          "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
        },
        {
          "path": "lang_hu.js",
          "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
        },
        {
          "path": "lang_id.js",
          "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
        },
        {
          "path": "lang_it.js",
          "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
        },
        {
          "path": "lang_ja.js",
          "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
        },
        {
          "path": "lang_ms.js",
          "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
        },
        {
          "path": "lang_nl.js",
          "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
        },
        {
          "path": "lang_no.js",
          "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
        },
        {
          "path": "lang_pl.js",
          "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
        },
        {
          "path": "lang_ptbr.js",
          "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
        },
        {
          "path": "lang_ro.js",
          "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
        },
        {
          "path": "lang_ru.js",
          "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
        },
        {
          "path": "lang_sv.js",
          "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
        },
        {
          "path": "lang_th.js",
          "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
        },
        {
          "path": "lang_tr.js",
          "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
        },
        {
          "path": "lang_uk.js",
          "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
        },
        {
          "path": "lang_vi.js",
          "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
        },
        {
          "path": "lang_zh.js",
          "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
        },
        {
          "path": "lang_zht.js",
          "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
        },
        {
          "path": "level-up-vfx.js",
          "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
        },
        {
          "path": "lobby_i18n.js",
          "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
        },
        {
          "path": "lobby-ancestor-art.css",
          "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
        },
        {
          "path": "lobby-ancestor-sprite.js",
          "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
        },
        {
          "path": "lobby-stage-info.js",
          "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
        },
        {
          "path": "localization-data.js",
          "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
        },
        {
          "path": "localization-runtime.js",
          "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
        },
        {
          "path": "localization.css",
          "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
        },
        {
          "path": "maps_data.js",
          "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
        },
        {
          "path": "node-main.js",
          "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
        },
        {
          "path": "package.json",
          "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
        },
        {
          "path": "parry-lesson.css",
          "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
        },
        {
          "path": "parry-lesson.js",
          "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
        },
        {
          "path": "player-attack-remaster.js",
          "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
        },
        {
          "path": "resource-practice.js",
          "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
        },
        {
          "path": "skill-workspace.css",
          "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
        },
        {
          "path": "stat-panel-ui.css",
          "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
        },
        {
          "path": "stat-panel-ui.js",
          "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
        },
        {
          "path": "system-lesson.css",
          "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
        },
        {
          "path": "system-lesson.js",
          "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
        },
        {
          "path": "three-runtime.js",
          "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
        },
        {
          "path": "tutorial-badges.css",
          "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
        },
        {
          "path": "tutorial-badges.js",
          "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
        },
        {
          "path": "ui-foundation.css",
          "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
        },
        {
          "path": "ui-panels.js",
          "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
        },
        {
          "path": "ui-refinement.css",
          "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
        },
        {
          "path": "warrior-bat-swing.js",
          "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
        },
        {
          "path": "warrior-dash-flight.js",
          "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
        },
        {
          "path": "world-intro-player.js",
          "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
        },
        {
          "path": "world-intro-subtitles-data.js",
          "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
        },
        {
          "path": "world-intro-subtitles.js",
          "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
        }
      ],
      "backup": {
        "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "remoteSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "remoteRef": "refs/heads/memory-fixture-only",
        "verifiedAt": "2026-10-02T10:39:17.586Z",
        "inputs": [
          {
            "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "path": "assets/map/ch1/production_finish/layout.js",
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "path": "ch1-altar-moat.js",
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "path": "ch1-border-foreground.js",
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "path": "ch1-boundary-edge.js",
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "path": "ch1-face-life.js",
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "path": "ch1-forest-sway.js",
            "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
          },
          {
            "path": "ch1-living-detail.js",
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "path": "character-story-player.js",
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "path": "cin-enter-engraved.css",
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "path": "cin-logo-art.js",
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "path": "game.html",
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "path": "growth-tree-detail.css",
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "path": "growth-tree-fixed-background.css",
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "path": "growth-tree-information.css",
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "path": "index.html",
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "path": "inventory-gems-balance.css",
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "path": "inventory-gems-finish.css",
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "path": "inventory-gems.css",
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "path": "inventory-oss-balance.css",
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "path": "inventory-paperdoll.js",
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "path": "inventory-space.css",
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "path": "knight-portrait.css",
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "path": "lang_ar.js",
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "path": "lang_bg.js",
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "path": "lang_cs.js",
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "path": "lang_da.js",
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "path": "lang_de.js",
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "path": "lang_el.js",
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "path": "lang_es.js",
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "path": "lang_fi.js",
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "path": "lang_fr.js",
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "path": "lang_hu.js",
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "path": "lang_id.js",
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "path": "lang_it.js",
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "path": "lang_ja.js",
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "path": "lang_ms.js",
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "path": "lang_nl.js",
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "path": "lang_no.js",
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "path": "lang_pl.js",
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "path": "lang_ptbr.js",
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "path": "lang_ro.js",
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "path": "lang_ru.js",
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "path": "lang_sv.js",
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "path": "lang_th.js",
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "path": "lang_tr.js",
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "path": "lang_uk.js",
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "path": "lang_vi.js",
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "path": "lang_zh.js",
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "path": "lang_zht.js",
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "path": "level-up-vfx.js",
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "path": "lobby_i18n.js",
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "path": "lobby-ancestor-art.css",
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "path": "lobby-ancestor-sprite.js",
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "path": "lobby-stage-info.js",
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "path": "localization-data.js",
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "path": "localization-runtime.js",
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "path": "localization.css",
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "path": "maps_data.js",
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "path": "node-main.js",
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "path": "package.json",
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "path": "parry-lesson.css",
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "path": "parry-lesson.js",
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "path": "player-attack-remaster.js",
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "path": "resource-practice.js",
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "path": "skill-workspace.css",
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "path": "stat-panel-ui.css",
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "path": "stat-panel-ui.js",
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "path": "system-lesson.css",
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "path": "system-lesson.js",
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "path": "three-runtime.js",
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "path": "tutorial-badges.css",
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "path": "tutorial-badges.js",
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "path": "ui-foundation.css",
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "path": "ui-panels.js",
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "path": "ui-refinement.css",
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "path": "warrior-bat-swing.js",
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "path": "warrior-dash-flight.js",
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "path": "world-intro-player.js",
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "path": "world-intro-subtitles-data.js",
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "path": "world-intro-subtitles.js",
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          }
        ]
      },
      "runtime": {
        "cacheRoot": "/memory/cache",
        "releaseInfoPath": "/memory/release.json",
        "releaseInfoSha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706",
        "files": [
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Info.plist",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "path": "nwjs.app/Contents/MacOS/nwjs",
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          }
        ]
      }
    },
    "missing": {
      "sourceRoot": "/memory/project",
      "outputRoot": "/memory/output",
      "arch": "arm64",
      "id": "00000000-0000-4000-8000-000000000001",
      "port": 3388,
      "inputRoots": [
        "assets/map/ch1/geometry/ch1_si1_geometry.js",
        "assets/map/ch1/production_finish/layout.js",
        "ch1-altar-moat.js",
        "ch1-border-foreground.js",
        "ch1-boundary-edge.js",
        "ch1-face-life.js",
        "ch1-living-detail.js",
        "character-story-player.js",
        "cin-enter-engraved.css",
        "cin-logo-art.js",
        "game.html",
        "growth-tree-detail.css",
        "growth-tree-fixed-background.css",
        "growth-tree-information.css",
        "index.html",
        "inventory-gems-balance.css",
        "inventory-gems-finish.css",
        "inventory-gems.css",
        "inventory-oss-balance.css",
        "inventory-paperdoll.js",
        "inventory-space.css",
        "knight-portrait.css",
        "lang_ar.js",
        "lang_bg.js",
        "lang_cs.js",
        "lang_da.js",
        "lang_de.js",
        "lang_el.js",
        "lang_es.js",
        "lang_fi.js",
        "lang_fr.js",
        "lang_hu.js",
        "lang_id.js",
        "lang_it.js",
        "lang_ja.js",
        "lang_ms.js",
        "lang_nl.js",
        "lang_no.js",
        "lang_pl.js",
        "lang_ptbr.js",
        "lang_ro.js",
        "lang_ru.js",
        "lang_sv.js",
        "lang_th.js",
        "lang_tr.js",
        "lang_uk.js",
        "lang_vi.js",
        "lang_zh.js",
        "lang_zht.js",
        "level-up-vfx.js",
        "lobby-ancestor-art.css",
        "lobby-ancestor-sprite.js",
        "lobby-stage-info.js",
        "lobby_i18n.js",
        "localization-data.js",
        "localization-runtime.js",
        "localization.css",
        "maps_data.js",
        "node-main.js",
        "package.json",
        "parry-lesson.css",
        "parry-lesson.js",
        "player-attack-remaster.js",
        "resource-practice.js",
        "skill-workspace.css",
        "stat-panel-ui.css",
        "stat-panel-ui.js",
        "system-lesson.css",
        "system-lesson.js",
        "three-runtime.js",
        "tutorial-badges.css",
        "tutorial-badges.js",
        "ui-foundation.css",
        "ui-panels.js",
        "ui-refinement.css",
        "warrior-bat-swing.js",
        "warrior-dash-flight.js",
        "world-intro-player.js",
        "world-intro-subtitles-data.js",
        "world-intro-subtitles.js"
      ],
      "inputs": [
        {
          "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
          "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
        },
        {
          "path": "assets/map/ch1/production_finish/layout.js",
          "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
        },
        {
          "path": "ch1-altar-moat.js",
          "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
        },
        {
          "path": "ch1-border-foreground.js",
          "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
        },
        {
          "path": "ch1-boundary-edge.js",
          "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
        },
        {
          "path": "ch1-face-life.js",
          "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
        },
        {
          "path": "ch1-living-detail.js",
          "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
        },
        {
          "path": "character-story-player.js",
          "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
        },
        {
          "path": "cin-enter-engraved.css",
          "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
        },
        {
          "path": "cin-logo-art.js",
          "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
        },
        {
          "path": "game.html",
          "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
        },
        {
          "path": "growth-tree-detail.css",
          "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
        },
        {
          "path": "growth-tree-fixed-background.css",
          "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
        },
        {
          "path": "growth-tree-information.css",
          "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
        },
        {
          "path": "index.html",
          "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
        },
        {
          "path": "inventory-gems-balance.css",
          "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
        },
        {
          "path": "inventory-gems-finish.css",
          "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
        },
        {
          "path": "inventory-gems.css",
          "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
        },
        {
          "path": "inventory-oss-balance.css",
          "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
        },
        {
          "path": "inventory-paperdoll.js",
          "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
        },
        {
          "path": "inventory-space.css",
          "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
        },
        {
          "path": "knight-portrait.css",
          "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
        },
        {
          "path": "lang_ar.js",
          "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
        },
        {
          "path": "lang_bg.js",
          "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
        },
        {
          "path": "lang_cs.js",
          "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
        },
        {
          "path": "lang_da.js",
          "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
        },
        {
          "path": "lang_de.js",
          "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
        },
        {
          "path": "lang_el.js",
          "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
        },
        {
          "path": "lang_es.js",
          "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
        },
        {
          "path": "lang_fi.js",
          "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
        },
        {
          "path": "lang_fr.js",
          "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
        },
        {
          "path": "lang_hu.js",
          "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
        },
        {
          "path": "lang_id.js",
          "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
        },
        {
          "path": "lang_it.js",
          "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
        },
        {
          "path": "lang_ja.js",
          "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
        },
        {
          "path": "lang_ms.js",
          "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
        },
        {
          "path": "lang_nl.js",
          "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
        },
        {
          "path": "lang_no.js",
          "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
        },
        {
          "path": "lang_pl.js",
          "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
        },
        {
          "path": "lang_ptbr.js",
          "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
        },
        {
          "path": "lang_ro.js",
          "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
        },
        {
          "path": "lang_ru.js",
          "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
        },
        {
          "path": "lang_sv.js",
          "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
        },
        {
          "path": "lang_th.js",
          "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
        },
        {
          "path": "lang_tr.js",
          "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
        },
        {
          "path": "lang_uk.js",
          "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
        },
        {
          "path": "lang_vi.js",
          "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
        },
        {
          "path": "lang_zh.js",
          "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
        },
        {
          "path": "lang_zht.js",
          "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
        },
        {
          "path": "level-up-vfx.js",
          "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
        },
        {
          "path": "lobby_i18n.js",
          "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
        },
        {
          "path": "lobby-ancestor-art.css",
          "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
        },
        {
          "path": "lobby-ancestor-sprite.js",
          "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
        },
        {
          "path": "lobby-stage-info.js",
          "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
        },
        {
          "path": "localization-data.js",
          "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
        },
        {
          "path": "localization-runtime.js",
          "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
        },
        {
          "path": "localization.css",
          "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
        },
        {
          "path": "maps_data.js",
          "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
        },
        {
          "path": "node-main.js",
          "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
        },
        {
          "path": "package.json",
          "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
        },
        {
          "path": "parry-lesson.css",
          "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
        },
        {
          "path": "parry-lesson.js",
          "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
        },
        {
          "path": "player-attack-remaster.js",
          "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
        },
        {
          "path": "resource-practice.js",
          "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
        },
        {
          "path": "skill-workspace.css",
          "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
        },
        {
          "path": "stat-panel-ui.css",
          "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
        },
        {
          "path": "stat-panel-ui.js",
          "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
        },
        {
          "path": "system-lesson.css",
          "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
        },
        {
          "path": "system-lesson.js",
          "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
        },
        {
          "path": "three-runtime.js",
          "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
        },
        {
          "path": "tutorial-badges.css",
          "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
        },
        {
          "path": "tutorial-badges.js",
          "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
        },
        {
          "path": "ui-foundation.css",
          "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
        },
        {
          "path": "ui-panels.js",
          "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
        },
        {
          "path": "ui-refinement.css",
          "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
        },
        {
          "path": "warrior-bat-swing.js",
          "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
        },
        {
          "path": "warrior-dash-flight.js",
          "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
        },
        {
          "path": "world-intro-player.js",
          "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
        },
        {
          "path": "world-intro-subtitles-data.js",
          "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
        },
        {
          "path": "world-intro-subtitles.js",
          "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
        }
      ],
      "backup": {
        "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "remoteSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "remoteRef": "refs/heads/memory-fixture-only",
        "verifiedAt": "2026-10-02T10:39:17.586Z",
        "inputs": [
          {
            "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "path": "assets/map/ch1/production_finish/layout.js",
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "path": "ch1-altar-moat.js",
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "path": "ch1-border-foreground.js",
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "path": "ch1-boundary-edge.js",
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "path": "ch1-face-life.js",
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "path": "ch1-living-detail.js",
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "path": "character-story-player.js",
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "path": "cin-enter-engraved.css",
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "path": "cin-logo-art.js",
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "path": "game.html",
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "path": "growth-tree-detail.css",
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "path": "growth-tree-fixed-background.css",
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "path": "growth-tree-information.css",
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "path": "index.html",
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "path": "inventory-gems-balance.css",
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "path": "inventory-gems-finish.css",
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "path": "inventory-gems.css",
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "path": "inventory-oss-balance.css",
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "path": "inventory-paperdoll.js",
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "path": "inventory-space.css",
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "path": "knight-portrait.css",
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "path": "lang_ar.js",
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "path": "lang_bg.js",
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "path": "lang_cs.js",
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "path": "lang_da.js",
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "path": "lang_de.js",
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "path": "lang_el.js",
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "path": "lang_es.js",
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "path": "lang_fi.js",
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "path": "lang_fr.js",
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "path": "lang_hu.js",
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "path": "lang_id.js",
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "path": "lang_it.js",
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "path": "lang_ja.js",
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "path": "lang_ms.js",
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "path": "lang_nl.js",
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "path": "lang_no.js",
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "path": "lang_pl.js",
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "path": "lang_ptbr.js",
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "path": "lang_ro.js",
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "path": "lang_ru.js",
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "path": "lang_sv.js",
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "path": "lang_th.js",
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "path": "lang_tr.js",
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "path": "lang_uk.js",
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "path": "lang_vi.js",
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "path": "lang_zh.js",
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "path": "lang_zht.js",
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "path": "level-up-vfx.js",
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "path": "lobby_i18n.js",
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "path": "lobby-ancestor-art.css",
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "path": "lobby-ancestor-sprite.js",
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "path": "lobby-stage-info.js",
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "path": "localization-data.js",
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "path": "localization-runtime.js",
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "path": "localization.css",
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "path": "maps_data.js",
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "path": "node-main.js",
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "path": "package.json",
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "path": "parry-lesson.css",
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "path": "parry-lesson.js",
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "path": "player-attack-remaster.js",
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "path": "resource-practice.js",
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "path": "skill-workspace.css",
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "path": "stat-panel-ui.css",
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "path": "stat-panel-ui.js",
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "path": "system-lesson.css",
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "path": "system-lesson.js",
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "path": "three-runtime.js",
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "path": "tutorial-badges.css",
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "path": "tutorial-badges.js",
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "path": "ui-foundation.css",
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "path": "ui-panels.js",
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "path": "ui-refinement.css",
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "path": "warrior-bat-swing.js",
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "path": "warrior-dash-flight.js",
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "path": "world-intro-player.js",
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "path": "world-intro-subtitles-data.js",
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "path": "world-intro-subtitles.js",
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          }
        ]
      },
      "runtime": {
        "cacheRoot": "/memory/cache",
        "releaseInfoPath": "/memory/release.json",
        "releaseInfoSha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706",
        "files": [
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "path": "nwjs.app/Contents/Info.plist",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "path": "nwjs.app/Contents/MacOS/nwjs",
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          }
        ]
      }
    }
  },
  "outcomes": {
    "missing": {
      "current": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000001",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
              "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
            },
            {
              "path": "assets/map/ch1/production_finish/layout.js",
              "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
            },
            {
              "path": "ch1-altar-moat.js",
              "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
            },
            {
              "path": "ch1-border-foreground.js",
              "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
            },
            {
              "path": "ch1-boundary-edge.js",
              "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
            },
            {
              "path": "ch1-face-life.js",
              "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
            },
            {
              "path": "ch1-living-detail.js",
              "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
            },
            {
              "path": "character-story-player.js",
              "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
            },
            {
              "path": "cin-enter-engraved.css",
              "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
            },
            {
              "path": "cin-logo-art.js",
              "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "growth-tree-detail.css",
              "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
            },
            {
              "path": "growth-tree-fixed-background.css",
              "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
            },
            {
              "path": "growth-tree-information.css",
              "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "inventory-gems-balance.css",
              "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
            },
            {
              "path": "inventory-gems-finish.css",
              "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
            },
            {
              "path": "inventory-gems.css",
              "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
            },
            {
              "path": "inventory-oss-balance.css",
              "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
            },
            {
              "path": "inventory-paperdoll.js",
              "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
            },
            {
              "path": "inventory-space.css",
              "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
            },
            {
              "path": "knight-portrait.css",
              "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
            },
            {
              "path": "lang_ar.js",
              "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
            },
            {
              "path": "lang_bg.js",
              "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
            },
            {
              "path": "lang_cs.js",
              "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
            },
            {
              "path": "lang_da.js",
              "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
            },
            {
              "path": "lang_de.js",
              "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
            },
            {
              "path": "lang_el.js",
              "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
            },
            {
              "path": "lang_es.js",
              "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
            },
            {
              "path": "lang_fi.js",
              "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
            },
            {
              "path": "lang_fr.js",
              "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
            },
            {
              "path": "lang_hu.js",
              "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
            },
            {
              "path": "lang_id.js",
              "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
            },
            {
              "path": "lang_it.js",
              "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
            },
            {
              "path": "lang_ja.js",
              "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
            },
            {
              "path": "lang_ms.js",
              "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
            },
            {
              "path": "lang_nl.js",
              "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
            },
            {
              "path": "lang_no.js",
              "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
            },
            {
              "path": "lang_pl.js",
              "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
            },
            {
              "path": "lang_ptbr.js",
              "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
            },
            {
              "path": "lang_ro.js",
              "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
            },
            {
              "path": "lang_ru.js",
              "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
            },
            {
              "path": "lang_sv.js",
              "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
            },
            {
              "path": "lang_th.js",
              "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
            },
            {
              "path": "lang_tr.js",
              "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
            },
            {
              "path": "lang_uk.js",
              "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
            },
            {
              "path": "lang_vi.js",
              "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
            },
            {
              "path": "lang_zh.js",
              "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
            },
            {
              "path": "lang_zht.js",
              "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
            },
            {
              "path": "level-up-vfx.js",
              "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
            },
            {
              "path": "lobby_i18n.js",
              "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
            },
            {
              "path": "lobby-ancestor-art.css",
              "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
            },
            {
              "path": "lobby-ancestor-sprite.js",
              "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
            },
            {
              "path": "lobby-stage-info.js",
              "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
            },
            {
              "path": "localization-data.js",
              "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
            },
            {
              "path": "localization-runtime.js",
              "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
            },
            {
              "path": "localization.css",
              "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
            },
            {
              "path": "maps_data.js",
              "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            },
            {
              "path": "parry-lesson.css",
              "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
            },
            {
              "path": "parry-lesson.js",
              "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
            },
            {
              "path": "player-attack-remaster.js",
              "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
            },
            {
              "path": "resource-practice.js",
              "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
            },
            {
              "path": "skill-workspace.css",
              "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
            },
            {
              "path": "stat-panel-ui.css",
              "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
            },
            {
              "path": "stat-panel-ui.js",
              "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
            },
            {
              "path": "system-lesson.css",
              "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
            },
            {
              "path": "system-lesson.js",
              "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
            },
            {
              "path": "three-runtime.js",
              "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
            },
            {
              "path": "tutorial-badges.css",
              "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
            },
            {
              "path": "tutorial-badges.js",
              "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
            },
            {
              "path": "ui-foundation.css",
              "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
            },
            {
              "path": "ui-panels.js",
              "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
            },
            {
              "path": "ui-refinement.css",
              "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
            },
            {
              "path": "warrior-bat-swing.js",
              "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
            },
            {
              "path": "warrior-dash-flight.js",
              "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
            },
            {
              "path": "world-intro-player.js",
              "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
            },
            {
              "path": "world-intro-subtitles-data.js",
              "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
            },
            {
              "path": "world-intro-subtitles.js",
              "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3388/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3388",
              "http://localhost:3388"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3388;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteRef": "refs/heads/memory-fixture-only",
            "verifiedAt": "2026-10-02T10:39:17.586Z",
            "inputs": [
              {
                "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
                "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
              },
              {
                "path": "assets/map/ch1/production_finish/layout.js",
                "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
              },
              {
                "path": "ch1-altar-moat.js",
                "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
              },
              {
                "path": "ch1-border-foreground.js",
                "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
              },
              {
                "path": "ch1-boundary-edge.js",
                "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
              },
              {
                "path": "ch1-face-life.js",
                "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
              },
              {
                "path": "ch1-living-detail.js",
                "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
              },
              {
                "path": "character-story-player.js",
                "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
              },
              {
                "path": "cin-enter-engraved.css",
                "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
              },
              {
                "path": "cin-logo-art.js",
                "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "growth-tree-detail.css",
                "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
              },
              {
                "path": "growth-tree-fixed-background.css",
                "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
              },
              {
                "path": "growth-tree-information.css",
                "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "inventory-gems-balance.css",
                "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
              },
              {
                "path": "inventory-gems-finish.css",
                "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
              },
              {
                "path": "inventory-gems.css",
                "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
              },
              {
                "path": "inventory-oss-balance.css",
                "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
              },
              {
                "path": "inventory-paperdoll.js",
                "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
              },
              {
                "path": "inventory-space.css",
                "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
              },
              {
                "path": "knight-portrait.css",
                "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
              },
              {
                "path": "lang_ar.js",
                "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
              },
              {
                "path": "lang_bg.js",
                "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
              },
              {
                "path": "lang_cs.js",
                "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
              },
              {
                "path": "lang_da.js",
                "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
              },
              {
                "path": "lang_de.js",
                "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
              },
              {
                "path": "lang_el.js",
                "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
              },
              {
                "path": "lang_es.js",
                "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
              },
              {
                "path": "lang_fi.js",
                "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
              },
              {
                "path": "lang_fr.js",
                "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
              },
              {
                "path": "lang_hu.js",
                "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
              },
              {
                "path": "lang_id.js",
                "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
              },
              {
                "path": "lang_it.js",
                "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
              },
              {
                "path": "lang_ja.js",
                "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
              },
              {
                "path": "lang_ms.js",
                "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
              },
              {
                "path": "lang_nl.js",
                "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
              },
              {
                "path": "lang_no.js",
                "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
              },
              {
                "path": "lang_pl.js",
                "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
              },
              {
                "path": "lang_ptbr.js",
                "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
              },
              {
                "path": "lang_ro.js",
                "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
              },
              {
                "path": "lang_ru.js",
                "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
              },
              {
                "path": "lang_sv.js",
                "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
              },
              {
                "path": "lang_th.js",
                "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
              },
              {
                "path": "lang_tr.js",
                "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
              },
              {
                "path": "lang_uk.js",
                "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
              },
              {
                "path": "lang_vi.js",
                "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
              },
              {
                "path": "lang_zh.js",
                "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
              },
              {
                "path": "lang_zht.js",
                "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
              },
              {
                "path": "level-up-vfx.js",
                "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
              },
              {
                "path": "lobby_i18n.js",
                "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
              },
              {
                "path": "lobby-ancestor-art.css",
                "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
              },
              {
                "path": "lobby-ancestor-sprite.js",
                "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
              },
              {
                "path": "lobby-stage-info.js",
                "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
              },
              {
                "path": "localization-data.js",
                "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
              },
              {
                "path": "localization-runtime.js",
                "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
              },
              {
                "path": "localization.css",
                "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
              },
              {
                "path": "maps_data.js",
                "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              },
              {
                "path": "parry-lesson.css",
                "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
              },
              {
                "path": "parry-lesson.js",
                "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
              },
              {
                "path": "player-attack-remaster.js",
                "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
              },
              {
                "path": "resource-practice.js",
                "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
              },
              {
                "path": "skill-workspace.css",
                "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
              },
              {
                "path": "stat-panel-ui.css",
                "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
              },
              {
                "path": "stat-panel-ui.js",
                "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
              },
              {
                "path": "system-lesson.css",
                "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
              },
              {
                "path": "system-lesson.js",
                "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
              },
              {
                "path": "three-runtime.js",
                "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
              },
              {
                "path": "tutorial-badges.css",
                "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
              },
              {
                "path": "tutorial-badges.js",
                "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
              },
              {
                "path": "ui-foundation.css",
                "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
              },
              {
                "path": "ui-panels.js",
                "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
              },
              {
                "path": "ui-refinement.css",
                "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
              },
              {
                "path": "warrior-bat-swing.js",
                "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
              },
              {
                "path": "warrior-dash-flight.js",
                "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
              },
              {
                "path": "world-intro-player.js",
                "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
              },
              {
                "path": "world-intro-subtitles-data.js",
                "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
              },
              {
                "path": "world-intro-subtitles.js",
                "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000001",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "bytes": 4400,
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "bytes": 2857,
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-altar-moat.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-altar-moat.js",
            "bytes": 9514,
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-altar-moat.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-border-foreground.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-border-foreground.js",
            "bytes": 13209,
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-border-foreground.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-boundary-edge.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-boundary-edge.js",
            "bytes": 7032,
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-boundary-edge.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-face-life.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-face-life.js",
            "bytes": 15841,
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-face-life.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-living-detail.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-living-detail.js",
            "bytes": 68322,
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-living-detail.js"
          },
          {
            "op": "open",
            "path": "/memory/project/character-story-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/character-story-player.js",
            "bytes": 7653,
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "op": "close",
            "path": "/memory/project/character-story-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-enter-engraved.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-enter-engraved.css",
            "bytes": 3826,
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-enter-engraved.css"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-logo-art.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-logo-art.js",
            "bytes": 1104,
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-logo-art.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-detail.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-detail.css",
            "bytes": 4444,
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-detail.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "bytes": 895,
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-fixed-background.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-information.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-information.css",
            "bytes": 641,
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-information.css"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-balance.css",
            "bytes": 436,
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-finish.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-finish.css",
            "bytes": 30102,
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-finish.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems.css",
            "bytes": 16464,
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-oss-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-oss-balance.css",
            "bytes": 6299,
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-oss-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-paperdoll.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-paperdoll.js",
            "bytes": 872,
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-paperdoll.js"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-space.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-space.css",
            "bytes": 19748,
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-space.css"
          },
          {
            "op": "open",
            "path": "/memory/project/knight-portrait.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/knight-portrait.css",
            "bytes": 1086,
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "op": "close",
            "path": "/memory/project/knight-portrait.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ar.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ar.js",
            "bytes": 151080,
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ar.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_bg.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_bg.js",
            "bytes": 252398,
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_bg.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_cs.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_cs.js",
            "bytes": 193157,
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_cs.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_da.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_da.js",
            "bytes": 186292,
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_da.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_de.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_de.js",
            "bytes": 172454,
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_de.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_el.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_el.js",
            "bytes": 164851,
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_el.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_es.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_es.js",
            "bytes": 177229,
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_es.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fi.js",
            "bytes": 129909,
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fr.js",
            "bytes": 181474,
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_hu.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_hu.js",
            "bytes": 134634,
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_hu.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_id.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_id.js",
            "bytes": 127904,
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_id.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_it.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_it.js",
            "bytes": 131202,
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_it.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ja.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ja.js",
            "bytes": 143810,
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ja.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ms.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ms.js",
            "bytes": 136342,
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ms.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_nl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_nl.js",
            "bytes": 191050,
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_nl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_no.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_no.js",
            "bytes": 187183,
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_no.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_pl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_pl.js",
            "bytes": 196283,
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_pl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ptbr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ptbr.js",
            "bytes": 193853,
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ptbr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ro.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ro.js",
            "bytes": 131692,
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ro.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ru.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ru.js",
            "bytes": 223565,
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ru.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_sv.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_sv.js",
            "bytes": 172417,
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_sv.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_th.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_th.js",
            "bytes": 189606,
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_th.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_tr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_tr.js",
            "bytes": 130343,
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_tr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_uk.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_uk.js",
            "bytes": 226546,
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_uk.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_vi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_vi.js",
            "bytes": 138818,
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_vi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zh.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zh.js",
            "bytes": 133167,
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zh.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zht.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zht.js",
            "bytes": 133198,
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zht.js"
          },
          {
            "op": "open",
            "path": "/memory/project/level-up-vfx.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/level-up-vfx.js",
            "bytes": 7952,
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "op": "close",
            "path": "/memory/project/level-up-vfx.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-art.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-art.css",
            "bytes": 2687,
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-art.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "bytes": 4441,
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-sprite.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-stage-info.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-stage-info.js",
            "bytes": 1547,
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-stage-info.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby_i18n.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby_i18n.js",
            "bytes": 121328,
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby_i18n.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-data.js",
            "bytes": 3467232,
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-runtime.js",
            "bytes": 3404,
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization.css",
            "bytes": 1242,
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "op": "close",
            "path": "/memory/project/localization.css"
          },
          {
            "op": "open",
            "path": "/memory/project/maps_data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/maps_data.js",
            "bytes": 881757,
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "op": "close",
            "path": "/memory/project/maps_data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.css",
            "bytes": 9609,
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.js",
            "bytes": 52677,
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/player-attack-remaster.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/player-attack-remaster.js",
            "bytes": 1568,
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "op": "close",
            "path": "/memory/project/player-attack-remaster.js"
          },
          {
            "op": "open",
            "path": "/memory/project/resource-practice.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/resource-practice.js",
            "bytes": 30174,
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "op": "close",
            "path": "/memory/project/resource-practice.js"
          },
          {
            "op": "open",
            "path": "/memory/project/skill-workspace.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/skill-workspace.css",
            "bytes": 5276,
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "op": "close",
            "path": "/memory/project/skill-workspace.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.css",
            "bytes": 64640,
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.js",
            "bytes": 51290,
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.js"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.css",
            "bytes": 1726,
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.js",
            "bytes": 11465,
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/three-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/three-runtime.js",
            "bytes": 372,
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "op": "close",
            "path": "/memory/project/three-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.css",
            "bytes": 2711,
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.css"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.js",
            "bytes": 6451,
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-foundation.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-foundation.css",
            "bytes": 21174,
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-foundation.css"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-panels.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-panels.js",
            "bytes": 11883,
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-panels.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-refinement.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-refinement.css",
            "bytes": 149334,
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-refinement.css"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-bat-swing.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-bat-swing.js",
            "bytes": 2191,
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-bat-swing.js"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-dash-flight.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-dash-flight.js",
            "bytes": 1477,
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-dash-flight.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-player.js",
            "bytes": 3502,
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "bytes": 51862,
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles.js",
            "bytes": 1818,
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles.js"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      },
      "candidate": {
        "result": {
          "status": "BLOCKED",
          "error": "REQUIRED_HTML_DEPENDENCY_MISSING:game.html->ch1-forest-sway.js",
          "packageCreated": false
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "bytes": 4400,
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "bytes": 2857,
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-altar-moat.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-altar-moat.js",
            "bytes": 9514,
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-altar-moat.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-border-foreground.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-border-foreground.js",
            "bytes": 13209,
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-border-foreground.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-boundary-edge.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-boundary-edge.js",
            "bytes": 7032,
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-boundary-edge.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-face-life.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-face-life.js",
            "bytes": 15841,
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-face-life.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-living-detail.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-living-detail.js",
            "bytes": 68322,
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-living-detail.js"
          },
          {
            "op": "open",
            "path": "/memory/project/character-story-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/character-story-player.js",
            "bytes": 7653,
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "op": "close",
            "path": "/memory/project/character-story-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-enter-engraved.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-enter-engraved.css",
            "bytes": 3826,
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-enter-engraved.css"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-logo-art.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-logo-art.js",
            "bytes": 1104,
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-logo-art.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-detail.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-detail.css",
            "bytes": 4444,
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-detail.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "bytes": 895,
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-fixed-background.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-information.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-information.css",
            "bytes": 641,
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-information.css"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-balance.css",
            "bytes": 436,
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-finish.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-finish.css",
            "bytes": 30102,
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-finish.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems.css",
            "bytes": 16464,
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-oss-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-oss-balance.css",
            "bytes": 6299,
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-oss-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-paperdoll.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-paperdoll.js",
            "bytes": 872,
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-paperdoll.js"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-space.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-space.css",
            "bytes": 19748,
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-space.css"
          },
          {
            "op": "open",
            "path": "/memory/project/knight-portrait.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/knight-portrait.css",
            "bytes": 1086,
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "op": "close",
            "path": "/memory/project/knight-portrait.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ar.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ar.js",
            "bytes": 151080,
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ar.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_bg.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_bg.js",
            "bytes": 252398,
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_bg.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_cs.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_cs.js",
            "bytes": 193157,
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_cs.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_da.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_da.js",
            "bytes": 186292,
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_da.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_de.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_de.js",
            "bytes": 172454,
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_de.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_el.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_el.js",
            "bytes": 164851,
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_el.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_es.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_es.js",
            "bytes": 177229,
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_es.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fi.js",
            "bytes": 129909,
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fr.js",
            "bytes": 181474,
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_hu.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_hu.js",
            "bytes": 134634,
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_hu.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_id.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_id.js",
            "bytes": 127904,
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_id.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_it.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_it.js",
            "bytes": 131202,
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_it.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ja.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ja.js",
            "bytes": 143810,
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ja.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ms.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ms.js",
            "bytes": 136342,
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ms.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_nl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_nl.js",
            "bytes": 191050,
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_nl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_no.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_no.js",
            "bytes": 187183,
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_no.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_pl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_pl.js",
            "bytes": 196283,
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_pl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ptbr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ptbr.js",
            "bytes": 193853,
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ptbr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ro.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ro.js",
            "bytes": 131692,
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ro.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ru.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ru.js",
            "bytes": 223565,
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ru.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_sv.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_sv.js",
            "bytes": 172417,
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_sv.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_th.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_th.js",
            "bytes": 189606,
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_th.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_tr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_tr.js",
            "bytes": 130343,
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_tr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_uk.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_uk.js",
            "bytes": 226546,
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_uk.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_vi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_vi.js",
            "bytes": 138818,
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_vi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zh.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zh.js",
            "bytes": 133167,
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zh.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zht.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zht.js",
            "bytes": 133198,
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zht.js"
          },
          {
            "op": "open",
            "path": "/memory/project/level-up-vfx.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/level-up-vfx.js",
            "bytes": 7952,
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "op": "close",
            "path": "/memory/project/level-up-vfx.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-art.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-art.css",
            "bytes": 2687,
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-art.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "bytes": 4441,
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-sprite.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-stage-info.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-stage-info.js",
            "bytes": 1547,
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-stage-info.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby_i18n.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby_i18n.js",
            "bytes": 121328,
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby_i18n.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-data.js",
            "bytes": 3467232,
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-runtime.js",
            "bytes": 3404,
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization.css",
            "bytes": 1242,
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "op": "close",
            "path": "/memory/project/localization.css"
          },
          {
            "op": "open",
            "path": "/memory/project/maps_data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/maps_data.js",
            "bytes": 881757,
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "op": "close",
            "path": "/memory/project/maps_data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.css",
            "bytes": 9609,
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.js",
            "bytes": 52677,
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/player-attack-remaster.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/player-attack-remaster.js",
            "bytes": 1568,
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "op": "close",
            "path": "/memory/project/player-attack-remaster.js"
          },
          {
            "op": "open",
            "path": "/memory/project/resource-practice.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/resource-practice.js",
            "bytes": 30174,
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "op": "close",
            "path": "/memory/project/resource-practice.js"
          },
          {
            "op": "open",
            "path": "/memory/project/skill-workspace.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/skill-workspace.css",
            "bytes": 5276,
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "op": "close",
            "path": "/memory/project/skill-workspace.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.css",
            "bytes": 64640,
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.js",
            "bytes": 51290,
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.js"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.css",
            "bytes": 1726,
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.js",
            "bytes": 11465,
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/three-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/three-runtime.js",
            "bytes": 372,
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "op": "close",
            "path": "/memory/project/three-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.css",
            "bytes": 2711,
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.css"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.js",
            "bytes": 6451,
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-foundation.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-foundation.css",
            "bytes": 21174,
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-foundation.css"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-panels.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-panels.js",
            "bytes": 11883,
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-panels.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-refinement.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-refinement.css",
            "bytes": 149334,
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-refinement.css"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-bat-swing.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-bat-swing.js",
            "bytes": 2191,
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-bat-swing.js"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-dash-flight.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-dash-flight.js",
            "bytes": 1477,
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-dash-flight.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-player.js",
            "bytes": 3502,
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "bytes": 51862,
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles.js",
            "bytes": 1818,
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          }
        ],
        "outstandingDescriptors": 0
      }
    },
    "normal": {
      "current": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000001",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
              "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
            },
            {
              "path": "assets/map/ch1/production_finish/layout.js",
              "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
            },
            {
              "path": "ch1-altar-moat.js",
              "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
            },
            {
              "path": "ch1-border-foreground.js",
              "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
            },
            {
              "path": "ch1-boundary-edge.js",
              "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
            },
            {
              "path": "ch1-face-life.js",
              "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
            },
            {
              "path": "ch1-forest-sway.js",
              "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
            },
            {
              "path": "ch1-living-detail.js",
              "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
            },
            {
              "path": "character-story-player.js",
              "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
            },
            {
              "path": "cin-enter-engraved.css",
              "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
            },
            {
              "path": "cin-logo-art.js",
              "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "growth-tree-detail.css",
              "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
            },
            {
              "path": "growth-tree-fixed-background.css",
              "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
            },
            {
              "path": "growth-tree-information.css",
              "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "inventory-gems-balance.css",
              "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
            },
            {
              "path": "inventory-gems-finish.css",
              "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
            },
            {
              "path": "inventory-gems.css",
              "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
            },
            {
              "path": "inventory-oss-balance.css",
              "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
            },
            {
              "path": "inventory-paperdoll.js",
              "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
            },
            {
              "path": "inventory-space.css",
              "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
            },
            {
              "path": "knight-portrait.css",
              "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
            },
            {
              "path": "lang_ar.js",
              "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
            },
            {
              "path": "lang_bg.js",
              "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
            },
            {
              "path": "lang_cs.js",
              "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
            },
            {
              "path": "lang_da.js",
              "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
            },
            {
              "path": "lang_de.js",
              "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
            },
            {
              "path": "lang_el.js",
              "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
            },
            {
              "path": "lang_es.js",
              "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
            },
            {
              "path": "lang_fi.js",
              "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
            },
            {
              "path": "lang_fr.js",
              "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
            },
            {
              "path": "lang_hu.js",
              "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
            },
            {
              "path": "lang_id.js",
              "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
            },
            {
              "path": "lang_it.js",
              "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
            },
            {
              "path": "lang_ja.js",
              "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
            },
            {
              "path": "lang_ms.js",
              "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
            },
            {
              "path": "lang_nl.js",
              "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
            },
            {
              "path": "lang_no.js",
              "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
            },
            {
              "path": "lang_pl.js",
              "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
            },
            {
              "path": "lang_ptbr.js",
              "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
            },
            {
              "path": "lang_ro.js",
              "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
            },
            {
              "path": "lang_ru.js",
              "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
            },
            {
              "path": "lang_sv.js",
              "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
            },
            {
              "path": "lang_th.js",
              "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
            },
            {
              "path": "lang_tr.js",
              "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
            },
            {
              "path": "lang_uk.js",
              "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
            },
            {
              "path": "lang_vi.js",
              "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
            },
            {
              "path": "lang_zh.js",
              "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
            },
            {
              "path": "lang_zht.js",
              "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
            },
            {
              "path": "level-up-vfx.js",
              "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
            },
            {
              "path": "lobby_i18n.js",
              "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
            },
            {
              "path": "lobby-ancestor-art.css",
              "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
            },
            {
              "path": "lobby-ancestor-sprite.js",
              "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
            },
            {
              "path": "lobby-stage-info.js",
              "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
            },
            {
              "path": "localization-data.js",
              "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
            },
            {
              "path": "localization-runtime.js",
              "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
            },
            {
              "path": "localization.css",
              "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
            },
            {
              "path": "maps_data.js",
              "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            },
            {
              "path": "parry-lesson.css",
              "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
            },
            {
              "path": "parry-lesson.js",
              "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
            },
            {
              "path": "player-attack-remaster.js",
              "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
            },
            {
              "path": "resource-practice.js",
              "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
            },
            {
              "path": "skill-workspace.css",
              "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
            },
            {
              "path": "stat-panel-ui.css",
              "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
            },
            {
              "path": "stat-panel-ui.js",
              "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
            },
            {
              "path": "system-lesson.css",
              "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
            },
            {
              "path": "system-lesson.js",
              "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
            },
            {
              "path": "three-runtime.js",
              "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
            },
            {
              "path": "tutorial-badges.css",
              "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
            },
            {
              "path": "tutorial-badges.js",
              "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
            },
            {
              "path": "ui-foundation.css",
              "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
            },
            {
              "path": "ui-panels.js",
              "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
            },
            {
              "path": "ui-refinement.css",
              "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
            },
            {
              "path": "warrior-bat-swing.js",
              "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
            },
            {
              "path": "warrior-dash-flight.js",
              "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
            },
            {
              "path": "world-intro-player.js",
              "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
            },
            {
              "path": "world-intro-subtitles-data.js",
              "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
            },
            {
              "path": "world-intro-subtitles.js",
              "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3388/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3388",
              "http://localhost:3388"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3388;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteRef": "refs/heads/memory-fixture-only",
            "verifiedAt": "2026-10-02T10:39:17.586Z",
            "inputs": [
              {
                "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
                "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
              },
              {
                "path": "assets/map/ch1/production_finish/layout.js",
                "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
              },
              {
                "path": "ch1-altar-moat.js",
                "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
              },
              {
                "path": "ch1-border-foreground.js",
                "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
              },
              {
                "path": "ch1-boundary-edge.js",
                "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
              },
              {
                "path": "ch1-face-life.js",
                "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
              },
              {
                "path": "ch1-forest-sway.js",
                "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
              },
              {
                "path": "ch1-living-detail.js",
                "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
              },
              {
                "path": "character-story-player.js",
                "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
              },
              {
                "path": "cin-enter-engraved.css",
                "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
              },
              {
                "path": "cin-logo-art.js",
                "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "growth-tree-detail.css",
                "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
              },
              {
                "path": "growth-tree-fixed-background.css",
                "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
              },
              {
                "path": "growth-tree-information.css",
                "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "inventory-gems-balance.css",
                "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
              },
              {
                "path": "inventory-gems-finish.css",
                "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
              },
              {
                "path": "inventory-gems.css",
                "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
              },
              {
                "path": "inventory-oss-balance.css",
                "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
              },
              {
                "path": "inventory-paperdoll.js",
                "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
              },
              {
                "path": "inventory-space.css",
                "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
              },
              {
                "path": "knight-portrait.css",
                "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
              },
              {
                "path": "lang_ar.js",
                "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
              },
              {
                "path": "lang_bg.js",
                "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
              },
              {
                "path": "lang_cs.js",
                "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
              },
              {
                "path": "lang_da.js",
                "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
              },
              {
                "path": "lang_de.js",
                "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
              },
              {
                "path": "lang_el.js",
                "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
              },
              {
                "path": "lang_es.js",
                "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
              },
              {
                "path": "lang_fi.js",
                "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
              },
              {
                "path": "lang_fr.js",
                "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
              },
              {
                "path": "lang_hu.js",
                "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
              },
              {
                "path": "lang_id.js",
                "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
              },
              {
                "path": "lang_it.js",
                "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
              },
              {
                "path": "lang_ja.js",
                "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
              },
              {
                "path": "lang_ms.js",
                "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
              },
              {
                "path": "lang_nl.js",
                "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
              },
              {
                "path": "lang_no.js",
                "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
              },
              {
                "path": "lang_pl.js",
                "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
              },
              {
                "path": "lang_ptbr.js",
                "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
              },
              {
                "path": "lang_ro.js",
                "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
              },
              {
                "path": "lang_ru.js",
                "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
              },
              {
                "path": "lang_sv.js",
                "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
              },
              {
                "path": "lang_th.js",
                "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
              },
              {
                "path": "lang_tr.js",
                "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
              },
              {
                "path": "lang_uk.js",
                "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
              },
              {
                "path": "lang_vi.js",
                "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
              },
              {
                "path": "lang_zh.js",
                "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
              },
              {
                "path": "lang_zht.js",
                "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
              },
              {
                "path": "level-up-vfx.js",
                "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
              },
              {
                "path": "lobby_i18n.js",
                "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
              },
              {
                "path": "lobby-ancestor-art.css",
                "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
              },
              {
                "path": "lobby-ancestor-sprite.js",
                "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
              },
              {
                "path": "lobby-stage-info.js",
                "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
              },
              {
                "path": "localization-data.js",
                "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
              },
              {
                "path": "localization-runtime.js",
                "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
              },
              {
                "path": "localization.css",
                "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
              },
              {
                "path": "maps_data.js",
                "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              },
              {
                "path": "parry-lesson.css",
                "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
              },
              {
                "path": "parry-lesson.js",
                "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
              },
              {
                "path": "player-attack-remaster.js",
                "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
              },
              {
                "path": "resource-practice.js",
                "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
              },
              {
                "path": "skill-workspace.css",
                "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
              },
              {
                "path": "stat-panel-ui.css",
                "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
              },
              {
                "path": "stat-panel-ui.js",
                "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
              },
              {
                "path": "system-lesson.css",
                "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
              },
              {
                "path": "system-lesson.js",
                "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
              },
              {
                "path": "three-runtime.js",
                "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
              },
              {
                "path": "tutorial-badges.css",
                "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
              },
              {
                "path": "tutorial-badges.js",
                "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
              },
              {
                "path": "ui-foundation.css",
                "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
              },
              {
                "path": "ui-panels.js",
                "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
              },
              {
                "path": "ui-refinement.css",
                "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
              },
              {
                "path": "warrior-bat-swing.js",
                "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
              },
              {
                "path": "warrior-dash-flight.js",
                "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
              },
              {
                "path": "world-intro-player.js",
                "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
              },
              {
                "path": "world-intro-subtitles-data.js",
                "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
              },
              {
                "path": "world-intro-subtitles.js",
                "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000001",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "bytes": 4400,
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "bytes": 2857,
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-altar-moat.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-altar-moat.js",
            "bytes": 9514,
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-altar-moat.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-border-foreground.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-border-foreground.js",
            "bytes": 13209,
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-border-foreground.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-boundary-edge.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-boundary-edge.js",
            "bytes": 7032,
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-boundary-edge.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-face-life.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-face-life.js",
            "bytes": 15841,
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-face-life.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-forest-sway.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-forest-sway.js",
            "bytes": 5573,
            "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-forest-sway.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-living-detail.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-living-detail.js",
            "bytes": 68322,
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-living-detail.js"
          },
          {
            "op": "open",
            "path": "/memory/project/character-story-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/character-story-player.js",
            "bytes": 7653,
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "op": "close",
            "path": "/memory/project/character-story-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-enter-engraved.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-enter-engraved.css",
            "bytes": 3826,
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-enter-engraved.css"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-logo-art.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-logo-art.js",
            "bytes": 1104,
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-logo-art.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-detail.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-detail.css",
            "bytes": 4444,
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-detail.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "bytes": 895,
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-fixed-background.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-information.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-information.css",
            "bytes": 641,
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-information.css"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-balance.css",
            "bytes": 436,
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-finish.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-finish.css",
            "bytes": 30102,
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-finish.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems.css",
            "bytes": 16464,
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-oss-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-oss-balance.css",
            "bytes": 6299,
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-oss-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-paperdoll.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-paperdoll.js",
            "bytes": 872,
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-paperdoll.js"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-space.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-space.css",
            "bytes": 19748,
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-space.css"
          },
          {
            "op": "open",
            "path": "/memory/project/knight-portrait.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/knight-portrait.css",
            "bytes": 1086,
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "op": "close",
            "path": "/memory/project/knight-portrait.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ar.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ar.js",
            "bytes": 151080,
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ar.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_bg.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_bg.js",
            "bytes": 252398,
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_bg.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_cs.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_cs.js",
            "bytes": 193157,
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_cs.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_da.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_da.js",
            "bytes": 186292,
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_da.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_de.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_de.js",
            "bytes": 172454,
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_de.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_el.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_el.js",
            "bytes": 164851,
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_el.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_es.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_es.js",
            "bytes": 177229,
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_es.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fi.js",
            "bytes": 129909,
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fr.js",
            "bytes": 181474,
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_hu.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_hu.js",
            "bytes": 134634,
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_hu.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_id.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_id.js",
            "bytes": 127904,
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_id.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_it.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_it.js",
            "bytes": 131202,
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_it.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ja.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ja.js",
            "bytes": 143810,
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ja.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ms.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ms.js",
            "bytes": 136342,
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ms.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_nl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_nl.js",
            "bytes": 191050,
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_nl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_no.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_no.js",
            "bytes": 187183,
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_no.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_pl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_pl.js",
            "bytes": 196283,
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_pl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ptbr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ptbr.js",
            "bytes": 193853,
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ptbr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ro.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ro.js",
            "bytes": 131692,
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ro.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ru.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ru.js",
            "bytes": 223565,
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ru.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_sv.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_sv.js",
            "bytes": 172417,
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_sv.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_th.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_th.js",
            "bytes": 189606,
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_th.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_tr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_tr.js",
            "bytes": 130343,
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_tr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_uk.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_uk.js",
            "bytes": 226546,
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_uk.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_vi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_vi.js",
            "bytes": 138818,
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_vi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zh.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zh.js",
            "bytes": 133167,
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zh.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zht.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zht.js",
            "bytes": 133198,
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zht.js"
          },
          {
            "op": "open",
            "path": "/memory/project/level-up-vfx.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/level-up-vfx.js",
            "bytes": 7952,
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "op": "close",
            "path": "/memory/project/level-up-vfx.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-art.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-art.css",
            "bytes": 2687,
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-art.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "bytes": 4441,
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-sprite.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-stage-info.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-stage-info.js",
            "bytes": 1547,
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-stage-info.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby_i18n.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby_i18n.js",
            "bytes": 121328,
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby_i18n.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-data.js",
            "bytes": 3467232,
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-runtime.js",
            "bytes": 3404,
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization.css",
            "bytes": 1242,
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "op": "close",
            "path": "/memory/project/localization.css"
          },
          {
            "op": "open",
            "path": "/memory/project/maps_data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/maps_data.js",
            "bytes": 881757,
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "op": "close",
            "path": "/memory/project/maps_data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.css",
            "bytes": 9609,
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.js",
            "bytes": 52677,
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/player-attack-remaster.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/player-attack-remaster.js",
            "bytes": 1568,
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "op": "close",
            "path": "/memory/project/player-attack-remaster.js"
          },
          {
            "op": "open",
            "path": "/memory/project/resource-practice.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/resource-practice.js",
            "bytes": 30174,
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "op": "close",
            "path": "/memory/project/resource-practice.js"
          },
          {
            "op": "open",
            "path": "/memory/project/skill-workspace.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/skill-workspace.css",
            "bytes": 5276,
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "op": "close",
            "path": "/memory/project/skill-workspace.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.css",
            "bytes": 64640,
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.js",
            "bytes": 51290,
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.js"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.css",
            "bytes": 1726,
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.js",
            "bytes": 11465,
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/three-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/three-runtime.js",
            "bytes": 372,
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "op": "close",
            "path": "/memory/project/three-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.css",
            "bytes": 2711,
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.css"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.js",
            "bytes": 6451,
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-foundation.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-foundation.css",
            "bytes": 21174,
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-foundation.css"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-panels.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-panels.js",
            "bytes": 11883,
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-panels.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-refinement.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-refinement.css",
            "bytes": 149334,
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-refinement.css"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-bat-swing.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-bat-swing.js",
            "bytes": 2191,
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-bat-swing.js"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-dash-flight.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-dash-flight.js",
            "bytes": 1477,
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-dash-flight.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-player.js",
            "bytes": 3502,
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "bytes": 51862,
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles.js",
            "bytes": 1818,
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles.js"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      },
      "candidate": {
        "result": {
          "status": "READY_PLAN_ONLY",
          "id": "00000000-0000-4000-8000-000000000001",
          "job": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001",
          "sourceRoot": "/memory/project",
          "inputs": [
            {
              "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
              "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
            },
            {
              "path": "assets/map/ch1/production_finish/layout.js",
              "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
            },
            {
              "path": "ch1-altar-moat.js",
              "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
            },
            {
              "path": "ch1-border-foreground.js",
              "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
            },
            {
              "path": "ch1-boundary-edge.js",
              "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
            },
            {
              "path": "ch1-face-life.js",
              "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
            },
            {
              "path": "ch1-forest-sway.js",
              "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
            },
            {
              "path": "ch1-living-detail.js",
              "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
            },
            {
              "path": "character-story-player.js",
              "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
            },
            {
              "path": "cin-enter-engraved.css",
              "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
            },
            {
              "path": "cin-logo-art.js",
              "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
            },
            {
              "path": "game.html",
              "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
            },
            {
              "path": "growth-tree-detail.css",
              "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
            },
            {
              "path": "growth-tree-fixed-background.css",
              "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
            },
            {
              "path": "growth-tree-information.css",
              "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
            },
            {
              "path": "index.html",
              "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
            },
            {
              "path": "inventory-gems-balance.css",
              "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
            },
            {
              "path": "inventory-gems-finish.css",
              "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
            },
            {
              "path": "inventory-gems.css",
              "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
            },
            {
              "path": "inventory-oss-balance.css",
              "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
            },
            {
              "path": "inventory-paperdoll.js",
              "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
            },
            {
              "path": "inventory-space.css",
              "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
            },
            {
              "path": "knight-portrait.css",
              "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
            },
            {
              "path": "lang_ar.js",
              "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
            },
            {
              "path": "lang_bg.js",
              "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
            },
            {
              "path": "lang_cs.js",
              "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
            },
            {
              "path": "lang_da.js",
              "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
            },
            {
              "path": "lang_de.js",
              "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
            },
            {
              "path": "lang_el.js",
              "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
            },
            {
              "path": "lang_es.js",
              "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
            },
            {
              "path": "lang_fi.js",
              "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
            },
            {
              "path": "lang_fr.js",
              "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
            },
            {
              "path": "lang_hu.js",
              "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
            },
            {
              "path": "lang_id.js",
              "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
            },
            {
              "path": "lang_it.js",
              "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
            },
            {
              "path": "lang_ja.js",
              "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
            },
            {
              "path": "lang_ms.js",
              "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
            },
            {
              "path": "lang_nl.js",
              "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
            },
            {
              "path": "lang_no.js",
              "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
            },
            {
              "path": "lang_pl.js",
              "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
            },
            {
              "path": "lang_ptbr.js",
              "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
            },
            {
              "path": "lang_ro.js",
              "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
            },
            {
              "path": "lang_ru.js",
              "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
            },
            {
              "path": "lang_sv.js",
              "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
            },
            {
              "path": "lang_th.js",
              "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
            },
            {
              "path": "lang_tr.js",
              "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
            },
            {
              "path": "lang_uk.js",
              "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
            },
            {
              "path": "lang_vi.js",
              "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
            },
            {
              "path": "lang_zh.js",
              "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
            },
            {
              "path": "lang_zht.js",
              "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
            },
            {
              "path": "level-up-vfx.js",
              "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
            },
            {
              "path": "lobby_i18n.js",
              "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
            },
            {
              "path": "lobby-ancestor-art.css",
              "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
            },
            {
              "path": "lobby-ancestor-sprite.js",
              "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
            },
            {
              "path": "lobby-stage-info.js",
              "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
            },
            {
              "path": "localization-data.js",
              "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
            },
            {
              "path": "localization-runtime.js",
              "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
            },
            {
              "path": "localization.css",
              "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
            },
            {
              "path": "maps_data.js",
              "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
            },
            {
              "path": "node-main.js",
              "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
            },
            {
              "path": "package.json",
              "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
            },
            {
              "path": "parry-lesson.css",
              "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
            },
            {
              "path": "parry-lesson.js",
              "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
            },
            {
              "path": "player-attack-remaster.js",
              "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
            },
            {
              "path": "resource-practice.js",
              "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
            },
            {
              "path": "skill-workspace.css",
              "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
            },
            {
              "path": "stat-panel-ui.css",
              "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
            },
            {
              "path": "stat-panel-ui.js",
              "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
            },
            {
              "path": "system-lesson.css",
              "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
            },
            {
              "path": "system-lesson.js",
              "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
            },
            {
              "path": "three-runtime.js",
              "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
            },
            {
              "path": "tutorial-badges.css",
              "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
            },
            {
              "path": "tutorial-badges.js",
              "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
            },
            {
              "path": "ui-foundation.css",
              "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
            },
            {
              "path": "ui-panels.js",
              "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
            },
            {
              "path": "ui-refinement.css",
              "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
            },
            {
              "path": "warrior-bat-swing.js",
              "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
            },
            {
              "path": "warrior-dash-flight.js",
              "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
            },
            {
              "path": "world-intro-player.js",
              "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
            },
            {
              "path": "world-intro-subtitles-data.js",
              "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
            },
            {
              "path": "world-intro-subtitles.js",
              "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
            }
          ],
          "runtimeRoot": "/memory/cache/nwjs-v0.111.2-osx-arm64",
          "runtimeFiles": [
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
              "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
            },
            {
              "path": "nwjs.app/Contents/Info.plist",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            },
            {
              "path": "nwjs.app/Contents/MacOS/nwjs",
              "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
            },
            {
              "path": "nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
              "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
            }
          ],
          "derivedPackage": {
            "name": "hell-exoduser-release",
            "version": "1.0.0",
            "main": "http://127.0.0.1:3388/index.html?demo=1",
            "node-main": "node-main.js",
            "node-remote": [
              "http://127.0.0.1:3388",
              "http://localhost:3388"
            ],
            "window": {
              "title": "EXODUSER: HELL LORD",
              "width": 1920,
              "height": 1080,
              "min_width": 1280,
              "min_height": 720,
              "fullscreen": true,
              "resizable": true,
              "frame": false,
              "toolbar": false
            },
            "chromium-args": "--disable-features=CrossOriginOpenerPolicy,CrossOriginEmbedderPolicy,IsolateOrigins,SitePerProcess,SkiaGraphite --disable-site-isolation-trials --disable-web-security --no-sandbox --ignore-gpu-blocklist --enable-gpu-rasterization --allow-running-insecure-content --autoplay-policy=no-user-gesture-required --enable-features=SharedArrayBuffer --user-data-dir=/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile"
          },
          "derivedServer": "// NW.js node-main: 정적 파일 서버 + OAuth 라우트 (정식버전, port 3333)\nconst http = require('http');\nconst fs = require('fs');\nconst path = require('path');\nconst urlMod = require('url');\n\nconst LOG_FILE = path.join(__dirname, 'oauth-debug.log');\nfunction dlog(msg) {\n  try {\n    const line = '[' + new Date().toISOString() + '] ' + msg + '\\n';\n    fs.appendFileSync(LOG_FILE, line);\n  } catch (e) {}\n}\ndlog('=== EXODUSER RELEASE Server started ===');\n\nconst PORT = 3388;\nconst APP_DIR = __dirname;\n\nconst MIME = {\n  '.vtt': 'text/vtt; charset=utf-8',\n  '.html': 'text/html; charset=utf-8',\n  '.js':   'application/javascript',\n  '.css':  'text/css',\n  '.png':  'image/png',\n  '.jpg':  'image/jpeg',\n  '.jpeg': 'image/jpeg',\n  '.svg':  'image/svg+xml',\n  '.ico':  'image/x-icon',\n  '.json': 'application/json',\n  '.woff': 'font/woff',\n  '.woff2':'font/woff2',\n  '.mp3':  'audio/mpeg',\n  '.ogg':  'audio/ogg',\n  '.wav':  'audio/wav',\n  '.mp4':  'video/mp4',\n  '.webm': 'video/webm',\n  '.gif':  'image/gif',\n};\n\n// OAuth 토큰 저장소 (메모리, 단일 세션) — Supabase: access_token + refresh_token\nlet _oauthTokens = null;\nlet _oauthError = null;\n\n// 세이브 폴더: %APPDATA%\\EXODUSER-HELL\\saves\\ (EA와 동일 경로 공유)\nconst APPDATA = process.env.APPDATA || require('os').homedir();\nconst SAVE_DIR = \"/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves\";\nif (!fs.existsSync(SAVE_DIR)) fs.mkdirSync(SAVE_DIR, { recursive: true });\n\nfunction sanitizeSlot(name) {\n  return String(name).replace(/[^a-zA-Z0-9가-힣_\\-]/g, '_').slice(0, 50);\n}\nfunction sendJSON(res, status, data) {\n  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n  res.end(JSON.stringify(data));\n}\nfunction readBody(req) {\n  return new Promise((resolve, reject) => {\n    const chunks = [];\n    req.on('data', c => chunks.push(c));\n    req.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString())); } catch(e){ reject(e); } });\n    req.on('error', reject);\n  });\n}\n\nhttp.createServer(async (req, res) => {\n  let pathname = urlMod.parse(req.url).pathname;\n\n  // CORS preflight\n  if (req.method === 'OPTIONS') {\n    res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' });\n    return res.end();\n  }\n\n  // ── OAuth 라우트 ──\n  if (pathname === '/oauth-callback') {\n    dlog('oauth-callback hit: ' + req.url);\n    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });\n    res.end('<!DOCTYPE html><meta charset=utf-8><title>EXODUSER Login</title><style>html,body{background:#0a0004;color:#fff;font-family:-apple-system,sans-serif;margin:0;height:100%;overflow:hidden}.box{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh}.s{width:48px;height:48px;border:4px solid #cc3300;border-top-color:transparent;border-radius:50%;animation:r 1s linear infinite;margin-bottom:24px}@keyframes r{to{transform:rotate(360deg)}}h2{color:#cc3300;font-size:1.5rem;margin:0 0 8px}p{color:#aaa;margin:4px 0}.ok{color:#00ff88}.err{color:#ff5577}.cd{color:#ffcc44;font-size:0.85rem;margin-top:16px}</style><div class=box><div class=s id=spin></div><h2 id=t>로그인 처리 중...</h2><p id=m>잠시만 기다려주세요</p><div class=cd id=cd></div></div><script>(function(){var h=new URLSearchParams(location.hash.slice(1));var at=h.get(\"access_token\"),rt=h.get(\"refresh_token\"),e=h.get(\"error\");var payload=e?{error:e}:(at?{access_token:at,refresh_token:rt||\"\"}:{error:\"no_token\"});fetch(\"/oauth-deposit\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify(payload)}).then(function(){var ti=document.getElementById(\"t\"),me=document.getElementById(\"m\"),sp=document.getElementById(\"spin\"),cd=document.getElementById(\"cd\");if(e||!at){sp.style.display=\"none\";ti.className=\"err\";ti.textContent=\"로그인 실패\";me.textContent=e||\"토큰 없음\";return}sp.style.display=\"none\";ti.className=\"ok\";ti.textContent=\"✓ 로그인 완료\";me.textContent=\"게임으로 돌아갑니다\";var n=3;function tick(){if(n>0){cd.textContent=n+\"초 후 이 창이 닫힙니다\";n--;setTimeout(tick,1000)}else{try{window.close()}catch(_){}}}tick()})})()</script>');\n    return;\n  }\n\n  if (pathname === '/oauth-deposit' && req.method === 'POST') {\n    dlog('oauth-deposit POST received');\n    let body = '';\n    req.on('data', c => body += c);\n    req.on('end', () => {\n      try {\n        const d = JSON.parse(body);\n        if (d.error) { _oauthError = d.error; _oauthTokens = null; dlog('deposit error: ' + d.error); }\n        else { _oauthTokens = { access_token: d.access_token, refresh_token: d.refresh_token }; _oauthError = null; dlog('deposit tokens OK at_len=' + (d.access_token ? d.access_token.length : 0)); }\n        res.writeHead(200, { 'Content-Type': 'application/json' });\n        res.end('{\"ok\":true}');\n      } catch(e) { res.writeHead(400); res.end('{\"ok\":false}'); }\n    });\n    return;\n  }\n\n  if (pathname === '/oauth-poll') {\n    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });\n    if (_oauthTokens) {\n      const t = _oauthTokens; _oauthTokens = null;\n      dlog('poll: tokens delivered');\n      res.end(JSON.stringify({ access_token: t.access_token, refresh_token: t.refresh_token }));\n    } else if (_oauthError) {\n      const e = _oauthError; _oauthError = null;\n      res.end(JSON.stringify({ error: e }));\n    } else {\n      res.end('{}');\n    }\n    return;\n  }\n\n  // ── 세이브 API ──\n  if (pathname === '/api/slots' && req.method === 'GET') {\n    const files = fs.readdirSync(SAVE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));\n    const slots = files.map(f => {\n      try {\n        const d = JSON.parse(fs.readFileSync(path.join(SAVE_DIR, f), 'utf8'));\n        return { name: f.replace('.json',''), ts: d.ts||0, lv: d.player?.lv||1, stage: d.game?.stage||0, kills: d.game?.kills||0, charIdx: d.charIdx??0 };\n      } catch { return null; }\n    }).filter(Boolean);\n    return sendJSON(res, 200, { ok: true, slots });\n  }\n\n  if (pathname === '/api/save' && req.method === 'POST') {\n    let body, slot;\n    try {\n      body = await readBody(req);\n      slot = sanitizeSlot(body.slot || 'default');\n      if (body.data) fs.writeFileSync(path.join(SAVE_DIR, slot + '.json'), JSON.stringify(body.data, null, 2), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    if (!body.data) return sendJSON(res, 400, { ok: false, error: 'No data' });\n    return sendJSON(res, 200, { ok: true, slot });\n  }\n\n  if (pathname.startsWith('/api/load/') && req.method === 'GET') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (!fs.existsSync(fp)) return sendJSON(res, 404, { ok: false, error: 'Not found' });\n    return sendJSON(res, 200, { ok: true, data: JSON.parse(fs.readFileSync(fp, 'utf8')) });\n  }\n\n  if (pathname.startsWith('/api/save/') && req.method === 'DELETE') {\n    const slot = sanitizeSlot(decodeURIComponent(pathname.slice(10)));\n    const fp = path.join(SAVE_DIR, slot + '.json');\n    if (fs.existsSync(fp)) fs.unlinkSync(fp);\n    return sendJSON(res, 200, { ok: true });\n  }\n\n  // ── 정적 파일 서빙 ──\n  // 개발 서버와 동일한 공유 악의 저장 계약. 캐릭터 슬롯과 분리한다.\n  const MATS_FILE = path.join(SAVE_DIR, '_sharedMats.json');\n  if (pathname === '/api/mats' && req.method === 'GET') {\n    try {\n      if (fs.existsSync(MATS_FILE)) {\n        const d = JSON.parse(fs.readFileSync(MATS_FILE, 'utf8'));\n        return sendJSON(res, 200, { ok: true, mats: d.mats || 0 });\n      }\n    } catch (e) {}\n    return sendJSON(res, 200, { ok: true, mats: 0 });\n  }\n  if (pathname === '/api/mats' && req.method === 'POST') {\n    let n;\n    try {\n      const body = await readBody(req);\n      n = Math.max(0, Math.min(Math.floor(+body.mats || 0), Number.MAX_SAFE_INTEGER));\n      fs.writeFileSync(MATS_FILE, JSON.stringify({ mats: n, ts: Date.now() }), 'utf8');\n    } catch (error) {\n      return sendJSON(res, 500, { ok: false, error: 'Internal Server Error' });\n    }\n    return sendJSON(res, 200, { ok: true, mats: n });\n  }\n\n  if (pathname === '/' || pathname === '') pathname = '/index.html';\n  const filePath = path.join(APP_DIR, decodeURIComponent(pathname).replace(/\\.\\./g, ''));\n\n  if (req.headers?.range) {\n    fs.stat(filePath, (err, stat) => {\n      if (err || !stat.isFile()) { res.writeHead(404); return res.end(); }\n      const match = /^bytes=(\\d*)-(\\d*)$/.exec(req.headers.range);\n      let start = match?.[1] ? Number(match[1]) : 0;\n      let end = match?.[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;\n      if (match && !match[1] && match[2]) { start = Math.max(0, stat.size - Number(match[2])); end = stat.size - 1; }\n      if (!match || (!match[1] && !match[2]) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= stat.size || start > end) {\n        res.writeHead(416, { 'Content-Range': `bytes */${stat.size}`, 'Access-Control-Allow-Origin': '*' });\n        return res.end();\n      }\n      res.writeHead(206, {\n        'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Accept-Ranges': 'bytes',\n        'Content-Length': end-start+1, 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',\n        'Access-Control-Allow-Origin': '*',\n      });\n      if (req.method === 'HEAD') return res.end();\n      const stream = fs.createReadStream(filePath, { start, end });\n      stream.on('error', () => res.destroy());\n      res.on('close', () => stream.destroy());\n      stream.pipe(res);\n    });\n    return;\n  }\n\n  fs.readFile(filePath, (err, data) => {\n    if (err) { res.writeHead(404); res.end('Not found: ' + pathname); return; }\n    const ext = path.extname(filePath).toLowerCase();\n    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Content-Length': data.length, 'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*' };\n    if (ext === '.html') headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';\n    res.writeHead(200, headers);\n    res.end(req.method === 'HEAD' ? undefined : data);\n  });\n}).listen(PORT, '127.0.0.1', () => {\n  dlog('HTTP server listening on port ' + PORT);\n});\n",
          "backup": {
            "sha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteSha": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            "remoteRef": "refs/heads/memory-fixture-only",
            "verifiedAt": "2026-10-02T10:39:17.586Z",
            "inputs": [
              {
                "path": "assets/map/ch1/geometry/ch1_si1_geometry.js",
                "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
              },
              {
                "path": "assets/map/ch1/production_finish/layout.js",
                "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
              },
              {
                "path": "ch1-altar-moat.js",
                "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
              },
              {
                "path": "ch1-border-foreground.js",
                "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
              },
              {
                "path": "ch1-boundary-edge.js",
                "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
              },
              {
                "path": "ch1-face-life.js",
                "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
              },
              {
                "path": "ch1-forest-sway.js",
                "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
              },
              {
                "path": "ch1-living-detail.js",
                "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
              },
              {
                "path": "character-story-player.js",
                "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
              },
              {
                "path": "cin-enter-engraved.css",
                "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
              },
              {
                "path": "cin-logo-art.js",
                "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
              },
              {
                "path": "game.html",
                "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
              },
              {
                "path": "growth-tree-detail.css",
                "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
              },
              {
                "path": "growth-tree-fixed-background.css",
                "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
              },
              {
                "path": "growth-tree-information.css",
                "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
              },
              {
                "path": "index.html",
                "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
              },
              {
                "path": "inventory-gems-balance.css",
                "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
              },
              {
                "path": "inventory-gems-finish.css",
                "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
              },
              {
                "path": "inventory-gems.css",
                "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
              },
              {
                "path": "inventory-oss-balance.css",
                "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
              },
              {
                "path": "inventory-paperdoll.js",
                "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
              },
              {
                "path": "inventory-space.css",
                "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
              },
              {
                "path": "knight-portrait.css",
                "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
              },
              {
                "path": "lang_ar.js",
                "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
              },
              {
                "path": "lang_bg.js",
                "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
              },
              {
                "path": "lang_cs.js",
                "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
              },
              {
                "path": "lang_da.js",
                "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
              },
              {
                "path": "lang_de.js",
                "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
              },
              {
                "path": "lang_el.js",
                "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
              },
              {
                "path": "lang_es.js",
                "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
              },
              {
                "path": "lang_fi.js",
                "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
              },
              {
                "path": "lang_fr.js",
                "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
              },
              {
                "path": "lang_hu.js",
                "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
              },
              {
                "path": "lang_id.js",
                "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
              },
              {
                "path": "lang_it.js",
                "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
              },
              {
                "path": "lang_ja.js",
                "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
              },
              {
                "path": "lang_ms.js",
                "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
              },
              {
                "path": "lang_nl.js",
                "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
              },
              {
                "path": "lang_no.js",
                "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
              },
              {
                "path": "lang_pl.js",
                "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
              },
              {
                "path": "lang_ptbr.js",
                "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
              },
              {
                "path": "lang_ro.js",
                "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
              },
              {
                "path": "lang_ru.js",
                "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
              },
              {
                "path": "lang_sv.js",
                "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
              },
              {
                "path": "lang_th.js",
                "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
              },
              {
                "path": "lang_tr.js",
                "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
              },
              {
                "path": "lang_uk.js",
                "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
              },
              {
                "path": "lang_vi.js",
                "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
              },
              {
                "path": "lang_zh.js",
                "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
              },
              {
                "path": "lang_zht.js",
                "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
              },
              {
                "path": "level-up-vfx.js",
                "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
              },
              {
                "path": "lobby_i18n.js",
                "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
              },
              {
                "path": "lobby-ancestor-art.css",
                "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
              },
              {
                "path": "lobby-ancestor-sprite.js",
                "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
              },
              {
                "path": "lobby-stage-info.js",
                "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
              },
              {
                "path": "localization-data.js",
                "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
              },
              {
                "path": "localization-runtime.js",
                "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
              },
              {
                "path": "localization.css",
                "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
              },
              {
                "path": "maps_data.js",
                "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
              },
              {
                "path": "node-main.js",
                "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
              },
              {
                "path": "package.json",
                "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
              },
              {
                "path": "parry-lesson.css",
                "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
              },
              {
                "path": "parry-lesson.js",
                "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
              },
              {
                "path": "player-attack-remaster.js",
                "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
              },
              {
                "path": "resource-practice.js",
                "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
              },
              {
                "path": "skill-workspace.css",
                "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
              },
              {
                "path": "stat-panel-ui.css",
                "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
              },
              {
                "path": "stat-panel-ui.js",
                "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
              },
              {
                "path": "system-lesson.css",
                "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
              },
              {
                "path": "system-lesson.js",
                "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
              },
              {
                "path": "three-runtime.js",
                "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
              },
              {
                "path": "tutorial-badges.css",
                "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
              },
              {
                "path": "tutorial-badges.js",
                "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
              },
              {
                "path": "ui-foundation.css",
                "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
              },
              {
                "path": "ui-panels.js",
                "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
              },
              {
                "path": "ui-refinement.css",
                "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
              },
              {
                "path": "warrior-bat-swing.js",
                "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
              },
              {
                "path": "warrior-dash-flight.js",
                "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
              },
              {
                "path": "world-intro-player.js",
                "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
              },
              {
                "path": "world-intro-subtitles-data.js",
                "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
              },
              {
                "path": "world-intro-subtitles.js",
                "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
              }
            ]
          },
          "library": {
            "version": "4.17.10",
            "entry": "/memory/library/index.js",
            "buildEntry": "/memory/library/bld.js",
            "files": [],
            "fixtureOnly": true
          },
          "paths": {
            "stage": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "output": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "profile": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/profile",
            "saveRoot": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/user-state/saves"
          },
          "args": {
            "version": "0.111.2",
            "flavor": "normal",
            "platform": "osx",
            "arch": "arm64",
            "srcDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/stage",
            "cacheDir": "/memory/cache",
            "outDir": "/memory/output/mac-packager-00000000-0000-4000-8000-000000000001/package",
            "glob": false,
            "managedManifest": false,
            "zip": false,
            "releaseInfo": {
              "version": "v0.111.2",
              "components": {
                "chromium": "148.0.7778.97"
              }
            },
            "app": {
              "name": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleIdentifier": "com.exoduser.mac.00000000-0000-4000-8000-000000000001",
              "CFBundleName": "EXODUSER-00000000-0000-4000-8000-000000000001",
              "CFBundleDisplayName": "EXODUSER",
              "CFBundleVersion": "1.0.0",
              "CFBundleShortVersionString": "1.0.0",
              "LSApplicationCategoryType": "public.app-category.games"
            }
          },
          "packageCreated": false,
          "limits": [
            "로컬bld내부API고정;최상위getter/manifest/다운로드호출안함",
            "SHA/원격근거는제공된파일목록대조;외부Git조회아님",
            "선택root전체파일커버리지검사;선택root의게임의존성완전성은root승인계약",
            "port는정적격리값;실행직전실제점유검사는별도",
            "서명/코덱/실행검수미완료",
            "프로필/저장절대경로는고유job에귀속;이동/배포계약별도"
          ]
        },
        "trace": [
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js",
            "bytes": 4400,
            "sha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/geometry/ch1_si1_geometry.js"
          },
          {
            "op": "open",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js",
            "bytes": 2857,
            "sha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
          },
          {
            "op": "close",
            "path": "/memory/project/assets/map/ch1/production_finish/layout.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-altar-moat.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-altar-moat.js",
            "bytes": 9514,
            "sha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-altar-moat.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-border-foreground.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-border-foreground.js",
            "bytes": 13209,
            "sha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-border-foreground.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-boundary-edge.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-boundary-edge.js",
            "bytes": 7032,
            "sha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-boundary-edge.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-face-life.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-face-life.js",
            "bytes": 15841,
            "sha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-face-life.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-forest-sway.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-forest-sway.js",
            "bytes": 5573,
            "sha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-forest-sway.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ch1-living-detail.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ch1-living-detail.js",
            "bytes": 68322,
            "sha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
          },
          {
            "op": "close",
            "path": "/memory/project/ch1-living-detail.js"
          },
          {
            "op": "open",
            "path": "/memory/project/character-story-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/character-story-player.js",
            "bytes": 7653,
            "sha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
          },
          {
            "op": "close",
            "path": "/memory/project/character-story-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-enter-engraved.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-enter-engraved.css",
            "bytes": 3826,
            "sha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-enter-engraved.css"
          },
          {
            "op": "open",
            "path": "/memory/project/cin-logo-art.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/cin-logo-art.js",
            "bytes": 1104,
            "sha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
          },
          {
            "op": "close",
            "path": "/memory/project/cin-logo-art.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-detail.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-detail.css",
            "bytes": 4444,
            "sha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-detail.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-fixed-background.css",
            "bytes": 895,
            "sha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-fixed-background.css"
          },
          {
            "op": "open",
            "path": "/memory/project/growth-tree-information.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/growth-tree-information.css",
            "bytes": 641,
            "sha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
          },
          {
            "op": "close",
            "path": "/memory/project/growth-tree-information.css"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-balance.css",
            "bytes": 436,
            "sha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems-finish.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems-finish.css",
            "bytes": 30102,
            "sha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems-finish.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-gems.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-gems.css",
            "bytes": 16464,
            "sha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-gems.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-oss-balance.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-oss-balance.css",
            "bytes": 6299,
            "sha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-oss-balance.css"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-paperdoll.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-paperdoll.js",
            "bytes": 872,
            "sha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-paperdoll.js"
          },
          {
            "op": "open",
            "path": "/memory/project/inventory-space.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/inventory-space.css",
            "bytes": 19748,
            "sha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
          },
          {
            "op": "close",
            "path": "/memory/project/inventory-space.css"
          },
          {
            "op": "open",
            "path": "/memory/project/knight-portrait.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/knight-portrait.css",
            "bytes": 1086,
            "sha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
          },
          {
            "op": "close",
            "path": "/memory/project/knight-portrait.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ar.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ar.js",
            "bytes": 151080,
            "sha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ar.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_bg.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_bg.js",
            "bytes": 252398,
            "sha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_bg.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_cs.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_cs.js",
            "bytes": 193157,
            "sha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_cs.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_da.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_da.js",
            "bytes": 186292,
            "sha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_da.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_de.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_de.js",
            "bytes": 172454,
            "sha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_de.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_el.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_el.js",
            "bytes": 164851,
            "sha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_el.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_es.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_es.js",
            "bytes": 177229,
            "sha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_es.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fi.js",
            "bytes": 129909,
            "sha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_fr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_fr.js",
            "bytes": 181474,
            "sha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_fr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_hu.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_hu.js",
            "bytes": 134634,
            "sha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_hu.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_id.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_id.js",
            "bytes": 127904,
            "sha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_id.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_it.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_it.js",
            "bytes": 131202,
            "sha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_it.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ja.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ja.js",
            "bytes": 143810,
            "sha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ja.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ms.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ms.js",
            "bytes": 136342,
            "sha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ms.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_nl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_nl.js",
            "bytes": 191050,
            "sha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_nl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_no.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_no.js",
            "bytes": 187183,
            "sha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_no.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_pl.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_pl.js",
            "bytes": 196283,
            "sha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_pl.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ptbr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ptbr.js",
            "bytes": 193853,
            "sha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ptbr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ro.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ro.js",
            "bytes": 131692,
            "sha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ro.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_ru.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_ru.js",
            "bytes": 223565,
            "sha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_ru.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_sv.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_sv.js",
            "bytes": 172417,
            "sha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_sv.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_th.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_th.js",
            "bytes": 189606,
            "sha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_th.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_tr.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_tr.js",
            "bytes": 130343,
            "sha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_tr.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_uk.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_uk.js",
            "bytes": 226546,
            "sha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_uk.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_vi.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_vi.js",
            "bytes": 138818,
            "sha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_vi.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zh.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zh.js",
            "bytes": 133167,
            "sha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zh.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lang_zht.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lang_zht.js",
            "bytes": 133198,
            "sha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
          },
          {
            "op": "close",
            "path": "/memory/project/lang_zht.js"
          },
          {
            "op": "open",
            "path": "/memory/project/level-up-vfx.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/level-up-vfx.js",
            "bytes": 7952,
            "sha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
          },
          {
            "op": "close",
            "path": "/memory/project/level-up-vfx.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-art.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-art.css",
            "bytes": 2687,
            "sha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-art.css"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-ancestor-sprite.js",
            "bytes": 4441,
            "sha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-ancestor-sprite.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby-stage-info.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby-stage-info.js",
            "bytes": 1547,
            "sha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby-stage-info.js"
          },
          {
            "op": "open",
            "path": "/memory/project/lobby_i18n.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/lobby_i18n.js",
            "bytes": 121328,
            "sha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
          },
          {
            "op": "close",
            "path": "/memory/project/lobby_i18n.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-data.js",
            "bytes": 3467232,
            "sha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization-runtime.js",
            "bytes": 3404,
            "sha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
          },
          {
            "op": "close",
            "path": "/memory/project/localization-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/localization.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/localization.css",
            "bytes": 1242,
            "sha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
          },
          {
            "op": "close",
            "path": "/memory/project/localization.css"
          },
          {
            "op": "open",
            "path": "/memory/project/maps_data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/maps_data.js",
            "bytes": 881757,
            "sha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
          },
          {
            "op": "close",
            "path": "/memory/project/maps_data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.css",
            "bytes": 9609,
            "sha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/parry-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/parry-lesson.js",
            "bytes": 52677,
            "sha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
          },
          {
            "op": "close",
            "path": "/memory/project/parry-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/player-attack-remaster.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/player-attack-remaster.js",
            "bytes": 1568,
            "sha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
          },
          {
            "op": "close",
            "path": "/memory/project/player-attack-remaster.js"
          },
          {
            "op": "open",
            "path": "/memory/project/resource-practice.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/resource-practice.js",
            "bytes": 30174,
            "sha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
          },
          {
            "op": "close",
            "path": "/memory/project/resource-practice.js"
          },
          {
            "op": "open",
            "path": "/memory/project/skill-workspace.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/skill-workspace.css",
            "bytes": 5276,
            "sha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
          },
          {
            "op": "close",
            "path": "/memory/project/skill-workspace.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.css",
            "bytes": 64640,
            "sha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.css"
          },
          {
            "op": "open",
            "path": "/memory/project/stat-panel-ui.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/stat-panel-ui.js",
            "bytes": 51290,
            "sha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
          },
          {
            "op": "close",
            "path": "/memory/project/stat-panel-ui.js"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.css",
            "bytes": 1726,
            "sha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.css"
          },
          {
            "op": "open",
            "path": "/memory/project/system-lesson.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/system-lesson.js",
            "bytes": 11465,
            "sha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
          },
          {
            "op": "close",
            "path": "/memory/project/system-lesson.js"
          },
          {
            "op": "open",
            "path": "/memory/project/three-runtime.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/three-runtime.js",
            "bytes": 372,
            "sha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
          },
          {
            "op": "close",
            "path": "/memory/project/three-runtime.js"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.css",
            "bytes": 2711,
            "sha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.css"
          },
          {
            "op": "open",
            "path": "/memory/project/tutorial-badges.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/tutorial-badges.js",
            "bytes": 6451,
            "sha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
          },
          {
            "op": "close",
            "path": "/memory/project/tutorial-badges.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-foundation.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-foundation.css",
            "bytes": 21174,
            "sha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-foundation.css"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-panels.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-panels.js",
            "bytes": 11883,
            "sha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-panels.js"
          },
          {
            "op": "open",
            "path": "/memory/project/ui-refinement.css",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/ui-refinement.css",
            "bytes": 149334,
            "sha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
          },
          {
            "op": "close",
            "path": "/memory/project/ui-refinement.css"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-bat-swing.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-bat-swing.js",
            "bytes": 2191,
            "sha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-bat-swing.js"
          },
          {
            "op": "open",
            "path": "/memory/project/warrior-dash-flight.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/warrior-dash-flight.js",
            "bytes": 1477,
            "sha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
          },
          {
            "op": "close",
            "path": "/memory/project/warrior-dash-flight.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-player.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-player.js",
            "bytes": 3502,
            "sha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-player.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles-data.js",
            "bytes": 51862,
            "sha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles-data.js"
          },
          {
            "op": "open",
            "path": "/memory/project/world-intro-subtitles.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/world-intro-subtitles.js",
            "bytes": 1818,
            "sha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
          },
          {
            "op": "close",
            "path": "/memory/project/world-intro-subtitles.js"
          },
          {
            "op": "open",
            "path": "/memory/project/game.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/game.html",
            "bytes": 4028178,
            "sha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
          },
          {
            "op": "close",
            "path": "/memory/project/game.html"
          },
          {
            "op": "open",
            "path": "/memory/project/index.html",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/index.html",
            "bytes": 342046,
            "sha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
          },
          {
            "op": "close",
            "path": "/memory/project/index.html"
          },
          {
            "op": "open",
            "path": "/memory/release.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/release.json",
            "bytes": 64,
            "sha256": "2d4127eec1ff90a71cbb1362aa1011de7993a8992e90c2c419f79e4d2fa3c706"
          },
          {
            "op": "close",
            "path": "/memory/release.json"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Alerts).app/Contents/MacOS/nwjs Helper (Alerts)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (GPU).app/Contents/MacOS/nwjs Helper (GPU)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper (Renderer).app/Contents/MacOS/nwjs Helper (Renderer)"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper",
            "bytes": 24,
            "sha256": "eb02a05b932025295ad8f3640bb4dcdcf5a4e42f231b74f89070b58ad68d34f5"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Frameworks/nwjs Framework.framework/Versions/148.0.7778.97/Helpers/nwjs Helper.app/Contents/MacOS/nwjs Helper"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Info.plist"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings",
            "bytes": 25,
            "sha256": "5d99d608ee66038a298430ccfe32a97b0ea667c863128c63d0fce102fdff5d18"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/Resources/en.lproj/InfoPlist.strings"
          },
          {
            "op": "open",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs",
            "bytes": 8,
            "sha256": "6eca5cc86a53c80d74e777fffd48ee46b98f06a8b448d18106af49ac0862b875"
          },
          {
            "op": "close",
            "path": "/memory/cache/nwjs-v0.111.2-osx-arm64/nwjs.app/Contents/MacOS/nwjs"
          },
          {
            "op": "open",
            "path": "/memory/project/package.json",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/package.json",
            "bytes": 2040,
            "sha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
          },
          {
            "op": "close",
            "path": "/memory/project/package.json"
          },
          {
            "op": "open",
            "path": "/memory/project/node-main.js",
            "flags": 256
          },
          {
            "op": "read",
            "path": "/memory/project/node-main.js",
            "bytes": 10429,
            "sha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
          },
          {
            "op": "close",
            "path": "/memory/project/node-main.js"
          }
        ],
        "outstandingDescriptors": 0
      }
    }
  },
  "observations": [
    {
      "id": "MISSING-SCRIPT-ACCEPTED-BY-CURRENT",
      "passed": true
    },
    {
      "id": "CANDIDATE-REJECTS-SAME-SELECTION",
      "passed": true
    },
    {
      "id": "NORMAL-PLAN-EQUIVALENT",
      "passed": true
    },
    {
      "id": "OPTIONAL-EXTERNAL-NOT-REQUIRED",
      "passed": true
    },
    {
      "id": "ONLY-ONE-SELECTION-DIFF",
      "passed": true
    },
    {
      "id": "MEMORY-DESCRIPTORS-CLOSED",
      "passed": true
    }
  ],
  "counts": {
    "inputEvents": 2,
    "planCalls": 4,
    "previousTestsRerun": 0,
    "fullInputScans": 0
  },
  "boundary": {
    "real": "Source bytes for packager, FILES, selected HTML and their direct local script/stylesheet payloads. No game script executes.",
    "memory": "fs tree/descriptors/stat stable nlink1; runtime minimal synthetic header+helpers/releaseInfo; libraryEvidence explicit stub. Backup SHA/ref are synthetic valid-shaped data, not remote evidence. No plan module import/execute/build/network.",
    "guardScope": "Direct local HTML script src + stylesheet href only; no forced all-assets, image/audio/CSS url/JS dynamic import closure. External schemes/protocol-relative skipped; a href navigation/optional credits not selected. HTML token regex removes comments and consumes inline script bodies. General HTML parser/base href/entity edge cases remain unverified."
  },
  "preservation": [
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/supervisor-next/BUILD/BUILD-input-root-runtime-closure-hb1014/TASK.md",
      "beforeSha256": "a53733a3e8b667bf502da35d95efa72b983d2dd857c09c26499b3a868bd2dea1",
      "afterSha256": "a53733a3e8b667bf502da35d95efa72b983d2dd857c09c26499b3a868bd2dea1"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md",
      "beforeSha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e",
      "afterSha256": "de5a881270625a7b2d0e854331205e01372a037340a18474c6442b60e668465e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/AGENTS.md",
      "beforeSha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4",
      "afterSha256": "fd59bef70960bcaf1ab9910051faa860362884e574ac2869fad05c6872ae04e4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "beforeSha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520",
      "afterSha256": "86ada15a477fc128a77cf10c2337de9fdb36b3f9c463f008f5d3c97e82f60520"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md",
      "beforeSha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e",
      "afterSha256": "677cea72ca729d55cc69af0f35abb051220ae2b44bd97a9cb478982cea7dcb0e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md",
      "beforeSha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0",
      "afterSha256": "826cc57cba42f4edaddd3ef306966a1681d6b107cb1a67e475bb55e3cf2daca0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/mac-packager/packager.mjs",
      "beforeSha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65",
      "afterSha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs",
      "beforeSha256": "567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f",
      "afterSha256": "567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html",
      "beforeSha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8",
      "afterSha256": "38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html",
      "beforeSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b",
      "afterSha256": "8b4653f3f7282cf2a1adcf9c8f547b3d07b8bbf90362913a3b07f7e3b07a856b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json",
      "beforeSha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8",
      "afterSha256": "58d101ca053f29d36d0f9bd8d63639753fde807064d3c957e0bb6db17d4be0e8"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js",
      "beforeSha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3",
      "afterSha256": "09eba1c2b9aa83376b93f9d4a2f23467a1068df416d3fef2486734a27d83cfe3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/geometry/ch1_si1_geometry.js",
      "beforeSha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f",
      "afterSha256": "5bd88bd006d3b6c0f2336b767b4844e17409405d8420dc94290d59409898685f"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/assets/map/ch1/production_finish/layout.js",
      "beforeSha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab",
      "afterSha256": "94b974df0ea090bd0cedb4f492777194e3b5938bcace6a7db2fd879b89a20dab"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-altar-moat.js",
      "beforeSha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0",
      "afterSha256": "f5e1089d2f4a3ae2298472a30c02d6d7d6126265bb072e6ce50e9e6dce6dd1f0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-border-foreground.js",
      "beforeSha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22",
      "afterSha256": "7f0f3e2e373041adc9e39512b147ab535f99b89e914686ab7ff14eb602f46b22"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-boundary-edge.js",
      "beforeSha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2",
      "afterSha256": "e1271685ee41026e330c77dfb9c8fc83146f2d116b97512e37d82cf53798edc2"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-face-life.js",
      "beforeSha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53",
      "afterSha256": "a6e7a6e7457745c4f6519d52a0f24297d0b297914469413d74b8460bae5fce53"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-forest-sway.js",
      "beforeSha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643",
      "afterSha256": "4ae5af8e6f6c1fe2526b5d019fcdaab73abb673f16d0368b734c883583bdf643"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ch1-living-detail.js",
      "beforeSha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640",
      "afterSha256": "e5e7e75b3865a926dfb3f8a5a1cc284a5dc5a976233a591062fa6506fd4a6640"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/character-story-player.js",
      "beforeSha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94",
      "afterSha256": "3965e5d5767b26ab55bfcb7951306ecb67b2872c9518843eb853161c8ca72a94"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/cin-enter-engraved.css",
      "beforeSha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0",
      "afterSha256": "97274db5db6d3f01d8905b3d7f985694d96338836c8c4f756958c5a83041a5d0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/cin-logo-art.js",
      "beforeSha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f",
      "afterSha256": "102752b72f885f43606ee70ec5525adc5ae416e1756390ba63fe41dd9a76727f"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-detail.css",
      "beforeSha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d",
      "afterSha256": "e85445c6f9928983cf92ac276cc91d81f9566e38feee626ea9f7ec0a4e92ee1d"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-fixed-background.css",
      "beforeSha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229",
      "afterSha256": "c59a2535c99cfe6fdf39a8f21df512e4383154e1cad55e18626579aab6db3229"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/growth-tree-information.css",
      "beforeSha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333",
      "afterSha256": "fcf6ac8f660460f325e191c747fbeb4b8d42331ebf39f73d8d30acad01905333"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems-balance.css",
      "beforeSha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85",
      "afterSha256": "145dbe3bea6b1c6d5b9b0f77de79b2112051e60472ea59be5891677d92acff85"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems-finish.css",
      "beforeSha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894",
      "afterSha256": "05de59cdeafcda1f0bba702ad2749c829b7ff697beb2e7c97df814d3bfeef894"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-gems.css",
      "beforeSha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c",
      "afterSha256": "bfb4dd52ba32d4cf3b0169ee68a7867c3196678dcbbc8dfe5735b61205c72e7c"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-oss-balance.css",
      "beforeSha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9",
      "afterSha256": "4054bfd0ac09177fa2144cd5bb6f8b819b5abe8d0cfaa44d40b4fb3b207883d9"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-paperdoll.js",
      "beforeSha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1",
      "afterSha256": "929bc12a857ee40bea8e7a775a010b36a4fb7b192bb367dd362fbc49d96fe2e1"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/inventory-space.css",
      "beforeSha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650",
      "afterSha256": "dc6f6f4e6db2cbe8f7c94093427f6d28695184081c42f2033cb0f22d0876e650"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/knight-portrait.css",
      "beforeSha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a",
      "afterSha256": "2af98bd1f3e7c0ea8299e12b85f37f5a5c540a488f136adbb78c67d0fb9c3d1a"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ar.js",
      "beforeSha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3",
      "afterSha256": "25792ed0c59624a8a39aa89e8510c460469d4c7fcf313cd27e1c060980e4cbc3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_bg.js",
      "beforeSha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833",
      "afterSha256": "62a0c77d60c4fd5de9a6612ef955e135661c5b0493d229fe16df4f25faf80833"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_cs.js",
      "beforeSha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca",
      "afterSha256": "9a40007742d3f5ebf856951c6ac758a9e535cafe425a5b526187747bb235cbca"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_da.js",
      "beforeSha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58",
      "afterSha256": "dbad149478ed51c6e7f9a224919b75530b7eaa87639e16f9e6d2d49264031c58"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_de.js",
      "beforeSha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e",
      "afterSha256": "bceeb3458fb9821b49143c4cc3bc6d6e2cd14f6771d2fe7a7e3bb5d1a11f967e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_el.js",
      "beforeSha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b",
      "afterSha256": "c858f2ce87fac36d46ef08871f7efcdea2a72b5b3ae33adc627cdc833d1c825b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_es.js",
      "beforeSha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49",
      "afterSha256": "e19d77f6a655671e496e3c347187ae7ed26cc0a545b41e0b1425e655248acb49"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_fi.js",
      "beforeSha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b",
      "afterSha256": "f92892dbd52e30112fe66e1f7fb0cd65e36951b1e7d7e3ab0bf4d56052f2b81b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_fr.js",
      "beforeSha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f",
      "afterSha256": "278963095fb2ecfed7ae8b55115b3d4ee29791ec0784da9d941cd57acff24f9f"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_hu.js",
      "beforeSha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77",
      "afterSha256": "1524f3576d98566d720fa64f0da729da584c7e9ae10e661d11b7c62acd25fc77"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_id.js",
      "beforeSha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc",
      "afterSha256": "53696cf1936cf4a95007f129137f006e4535a82be21622145c45aaf08023bbdc"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_it.js",
      "beforeSha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a",
      "afterSha256": "670ff6deac905091350fc7fd42e50eb805df1c614186c66c0e56e0fbd473da6a"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ja.js",
      "beforeSha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818",
      "afterSha256": "e8ff8ddd2801d17d04b3ef9f9786e0dacc037152e00716af9f2a6e612d96a818"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ms.js",
      "beforeSha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4",
      "afterSha256": "fa7eb19cfd584a4915e60ed8f75217967eaa4ac4fb8a09d6b034a4e1aa9508d4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_nl.js",
      "beforeSha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3",
      "afterSha256": "0fe1833773ca61aba035d6ab28dc4eeb972a6ba71f99931fe3fdc510cbd986b3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_no.js",
      "beforeSha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee",
      "afterSha256": "751213ff412e24cb88b093e47ac4023b79afd3517b2f5548638c1e5717a96cee"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_pl.js",
      "beforeSha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3",
      "afterSha256": "4ea1589bd60b1b467b6c71287525d7f33414a95628da8bebf1d32eacd36debc3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ptbr.js",
      "beforeSha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755",
      "afterSha256": "42a200775212fc440d47111acda0c95e2c74c704e3d7a48f72b3b91bf806a755"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ro.js",
      "beforeSha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6",
      "afterSha256": "fcf3b7c28822f5c13a46a69e64c56b9073ebb6bc799d00df4eb37014a3534ef6"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_ru.js",
      "beforeSha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c",
      "afterSha256": "6a4747b045e822b3fe1c7be8fb25a0fe304b3ffa513ef34246f17453595b4a8c"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_sv.js",
      "beforeSha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3",
      "afterSha256": "daf75f3637163eb7168e2158a3e139e4d98f462ccc2359fd9643a5aaefb2aef3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_th.js",
      "beforeSha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0",
      "afterSha256": "0c0655c243dcdae3249f2c2738c05d6ab6600d1491ee8a476fe0010ac06e68d0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_tr.js",
      "beforeSha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3",
      "afterSha256": "b07ae784d6397bc8888ad1ea66bb5af9c22fe84f516bad7be006d2e2a6467bb3"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_uk.js",
      "beforeSha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c",
      "afterSha256": "8902200db50dfbfa5fd5d7e0c5c25ba3b77eaa2ae307bf1fdcd6d60960ffbf3c"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_vi.js",
      "beforeSha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896",
      "afterSha256": "d0aa594a425981968659b4eb94ba916dba736fc8c2edd8c5861e80c452645896"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_zh.js",
      "beforeSha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556",
      "afterSha256": "f610efb591289712163e776662f923f9afdbdb64c16a33c3b622dfcf95931556"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lang_zht.js",
      "beforeSha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2",
      "afterSha256": "19027b0177ad260167075a848bfc682a067e7e572548dc62d2039640f524e1b2"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/level-up-vfx.js",
      "beforeSha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259",
      "afterSha256": "184ebc2114aca1688bb9be07d41d9c115ed0e8a6f86db563898d5ead4c5c8259"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-ancestor-art.css",
      "beforeSha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf",
      "afterSha256": "7cb88610b801e894e3332442d4b490d7d687cb9048352bb3a0cbaf8afba063cf"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-ancestor-sprite.js",
      "beforeSha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab",
      "afterSha256": "38f8de6d4efaa8eebd01d48301e0641bc5cebe558199f96885ba4a1289f8e9ab"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby-stage-info.js",
      "beforeSha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5",
      "afterSha256": "690fd042b28ac88d42fb197ac3cf4ce164b9a0a37bfc55ba11afa7e389d36dc5"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/lobby_i18n.js",
      "beforeSha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a",
      "afterSha256": "aed031de1f722add233ef35ab8b37cd9cce38cc36d829858575ece841837613a"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-data.js",
      "beforeSha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4",
      "afterSha256": "7a8c41960b964928174d336ac7153a5104c57f37cc43ffe62ddbc9a26c91a1d4"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization-runtime.js",
      "beforeSha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205",
      "afterSha256": "00cdae7b9ea4742d7a905394e62809f8b67869c00f91189781f96988f2074205"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/localization.css",
      "beforeSha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150",
      "afterSha256": "f5efc438aad1efa24674f6c8f8ec9cbb0f1f98ab5055880f0f36ac9b65ef1150"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/maps_data.js",
      "beforeSha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e",
      "afterSha256": "01e74466ea797227d555288592edc959545cb2e44e64e607bf181e7d64c2870e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/parry-lesson.css",
      "beforeSha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0",
      "afterSha256": "85b8940734655871da786895129cd18bf42f81b05f67ab60d0bcb9e0842b4ef0"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/parry-lesson.js",
      "beforeSha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381",
      "afterSha256": "628a03f781211637262de0ba9d6105e50e54c886225ff4b7da219992697db381"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/player-attack-remaster.js",
      "beforeSha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a",
      "afterSha256": "e33c7d75ad7e8123fece283beab4272b381f3f615d2aa26d2e8d47f0c335306a"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/resource-practice.js",
      "beforeSha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e",
      "afterSha256": "6f3f59dc97b75faf4c2e65088263d364be1d37b11c0a0bcefb826f5b16d99e6e"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/skill-workspace.css",
      "beforeSha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15",
      "afterSha256": "551cb719c72bf6816f182fc0667f69e20da881e5368ed533f6f14aef5ef78b15"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/stat-panel-ui.css",
      "beforeSha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59",
      "afterSha256": "e9d138fdfe8b8b78893aed950a708823572979855d79f64adaa0388c2abedc59"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/stat-panel-ui.js",
      "beforeSha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992",
      "afterSha256": "29cd4ee53b27b58833b71064d1f492160633eaa533fd1e739cfc53ca63551992"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/system-lesson.css",
      "beforeSha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22",
      "afterSha256": "26ba389fc96e1a67c7a68a674543af3aea7b14cc259af779b26c04c14f8cee22"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/system-lesson.js",
      "beforeSha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62",
      "afterSha256": "b427b01599c06938a444f315598aac311bcf6d099e40d128541a55470bc57e62"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/three-runtime.js",
      "beforeSha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b",
      "afterSha256": "4e2ca7a11aa667ac7cd72c2ee16f5bd1c38d960be14a33a9f7a3e37901573c6b"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tutorial-badges.css",
      "beforeSha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26",
      "afterSha256": "cc00a901fb9210f77c0d484c3745b41a3ef94637ad39c1fd0be8a9fda17e9b26"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/tutorial-badges.js",
      "beforeSha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a",
      "afterSha256": "3177b01590943a9688247b8b504bd3be88afc916cbf9f0e7a54250fa3409670a"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-foundation.css",
      "beforeSha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9",
      "afterSha256": "35e5e1e9c09ae52e2d716c104a6228aab5e6e639e011809e05bf28a454b630d9"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-panels.js",
      "beforeSha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5",
      "afterSha256": "b22c4a31141672304a15adfae3a5050cb9fde3b96601507c8f10de3ea63f4cb5"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/ui-refinement.css",
      "beforeSha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9",
      "afterSha256": "9a02e776d7de264ae5e20d5d05fa78258c89ca73ac23cf4dfe0b2fd4c041fbc9"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/warrior-bat-swing.js",
      "beforeSha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921",
      "afterSha256": "6a1d0932a4e39584f31b2cb6e73b622c165b105a36a7d443969d8c9228040921"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/warrior-dash-flight.js",
      "beforeSha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343",
      "afterSha256": "691bda46db99c7dc755a2d6074647c9fdb5464fe8487faae917c85a96fa90343"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-player.js",
      "beforeSha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50",
      "afterSha256": "77eddd9269172ab9c27ae7a3a5f717cdcb2fb901cd9c9a09d7a0216e36f57b50"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-subtitles-data.js",
      "beforeSha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768",
      "afterSha256": "55b8f379da8cca06d396c8bb9da67fb9d4ead1ba9db3da1f120173ca0e610768"
    },
    {
      "path": "/Users/fordeargamers/Projects/exoduser-migration-20261001/world-intro-subtitles.js",
      "beforeSha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b",
      "afterSha256": "9e3ac2207ece4cf5591ef7eee5d3296f4024c0e5ecfdfcaeda19bd2918dbc92b"
    }
  ],
  "changedDuringRead": [],
  "checksSha256": "4f82ce298efdce3d5dc06c11ae91272138c24417e7313a33507ac638a50001be",
  "docsSearch": {
    "command": [
      "rg",
      "-n",
      "inputRoots|sameInventory|REQUIRED_INPUT_MISSING|ch1-forest-sway|런타임 필수|선택root|MAC_HELPER_PAYLOAD|INTEGRATION_BUILD_TEAM_MASTER",
      "docs/"
    ],
    "exitCode": 0,
    "lineCount": 35,
    "matchedFiles": [
      "docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md",
      "docs/0마스터플랜/TEAM_CONTINUATION_POLICY_20261001.md",
      "docs/0마스터플랜/TEAM_START_COMMANDS_20261001.md",
      "docs/0마스터플랜/mac-resume-20261001/BUILD-SOUND-잔여팀-인수검토.md",
      "docs/0마스터플랜/mac-resume-20261001/item-fallback-evidence/다음작업-감사.md",
      "docs/0마스터플랜/mac-resume-20261001/ui03-evidence/BUILD-팀검토.md",
      "docs/0마스터플랜/mac-resume-20261001/ui03-evidence/team-receipts.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-result.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-task.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/CONTINUOUS-INTEGRATION-20261002.md",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json",
      "docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_LOG.md",
      "docs/13출시·마케팅/BUILD_BACKUP_POLICY_20261001.md",
      "docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md",
      "docs/13출시·마케팅/MAC_HELPER_PAYLOAD_INTEGRITY_20261002.md",
      "docs/13출시·마케팅/PC_PACKAGING_20260910.md",
      "docs/4.1맵디자인+설정/CH1_FOREST_SWAY_PASS89_20260930.md",
      "docs/4.1맵디자인+설정/CH1_LIVING_DETAIL_RUNTIME_20260925.md",
      "docs/4.1맵디자인+설정/CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md",
      "docs/4.1맵디자인+설정/CH1_ROTTEN_FOREST_PASS90_20260930.md",
      "docs/4.1맵디자인+설정/DEPTH_2_5D_BENCHMARK_20260930.md",
      "docs/4.1맵디자인+설정/DEPTH_SLICE2_20261001.md",
      "docs/CHANGELOG_SYNC.md",
      "docs/GIT_PROVENANCE_NOTES.md"
    ],
    "outputSha256": "1b9d432a50014fa54c8b2c3b214757db61a0499693c1fd322744fc5f7cb90a22"
  },
  "productionApplied": false,
  "runtimeAccepted": false,
  "rebuildExecuted": false,
  "visualAccepted": false,
  "actualTools": [
    "functions.exec -> exec_command"
  ],
  "skillsUsed": [],
  "errors": [],
  "receipts": [
    {
      "chunk": "a76e08",
      "command": "cat exact TASK.md",
      "exitCode": 0
    },
    {
      "chunks": [
        "de1924",
        "3ab5ad",
        "fd355e"
      ],
      "command": "cat COMMON/AGENTS/TEAM_CONTINUATION_POLICY; read packager/FILES/HTML caller tags/BUILD master",
      "exitCode": 0,
      "outputTruncated": true
    }
  ],
  "nextGate": "감독이 후보와 직접 참조 범위를 검수 후 총괄이 source+docs scoped 통합·정확 입력/원격 checkpoint. 실제 앱 재빌드 및 script/style 로드·시각 검수는 별도."
}
```
