# BUILD explicit HTML media closure — 용량 해제 후 원근거 저장

20:27:53 KST에 완료한 메모리 검수만 저장했다. 저장 때 정상 완료 검사를 재실행하지 않았다. 작업ID BUILD-explicit-html-media-memory-autonomy-1126. 정책 autonomy-user-20261002-1126-v1, BUILD chat 01a0faaf-9dd5-7c91-ab09-ee0bcff343b0.

## 결과와 범위

현행 전체 plan이 index.html:566의 제목 이미지 output/imagegen/exoduser-hell-lord-logo-api-v1.png를 inputRoots/inputs/backup.inputs에서 동시에 제외해도 READY_PLAN_ONLY로 인수했다. 메모리 assertExplicitMediaInputs 후보는 REQUIRED_HTML_MEDIA_MISSING:index.html->output/imagegen/exoduser-hell-lord-logo-api-v1.png로 차단했다. 정상 선택은 core4+직접 참조 필수 이미지2=6파일, 누락 선택5파일이다. 정상 후보와 현행 plan 반환 객체가 동일했다.

| 신규 관측 | 결과 |
|---|---|
| CURRENT_ACCEPTS_MISSING_REQUIRED_MEDIA | PASS: 결함 재현 |
| CANDIDATE_REJECTS | PASS: 정확 누락경로 차단 |
| NORMAL_RESULT_EQUIVALENT | PASS |
| ONE_INPUT_SELECTION_DIFF | PASS |
| ONLY_EXISTING_EXPLICIT_REQUIRED_MEDIA | PASS |
| DESCRIPTORS_CLOSED | PASS |

사건2입력×현행/후보4 plan 호출, 신규6관측 PASS. 이전script/GLTFLoader/helper 및 전체검사 재실행0. 실제 package.files라는 새 필드를 만들지 않고 Windows build-nwjs.mjs의 실제 FILES REQUIRED와 Mac inputRoots/inputs/backup.inputs 선택을 구분했다.

기존 PC_PACKAGING_20260910.md:41은 credits.html·forge-tabs-v3만 선택적이고 나머지 명시 FILES/DIRS 누락은 실패라고 정했다. 이 계약에서 이미지 파일 목록을 도출하고 실제 HTML img/video/source src·video poster의 직접 참조와 교집합만 검사했다. 모든 assets나 DIRS 전체를 강제 포함하지 않는다. 외부 URL·data-src lazy·CSS 배경·동적 media는 검사 대상이 아니다. 이번 실행은 제목 img 한 사건이며 video/poster 누락을 검수했다고 집계하지 않는다.

실제 complete plan/listTree/sameInventory/readFile 및 path 보호 함수는 원소스 VM 실행이다. fs/runtime/libraryEvidence는 명시적 메모리 대역, 이미지 payload는 원 파일 bytes를 읽되 렌더링/생성/교체0. 이전 checks의 run 함수만 읽어 대역 plumbing을 재사용했으며 이전 checks writer/검사 전체 호출0. 합성 runtime8byte header·SHA/ref/UUID/포트3390은 대역값이며 실제 앱/원격 보존/사용 포트 완료값이 아니다.

## 소스·실행·저장 영수증

원검수 UTC 2026-10-02T11:27:53.784Z–11:27:53.879Z, 지정 Node v24.15.0, exec_command exit0, chunk d00bf4. capacity false 당시 파일·폴더 생성0. 실제 stdout은 28,935 tokens에서 tool max_output_tokens=1000에 의해 3,808문자로 잘렸다. 따라서 완전 outcome/trace JSON 보존을 주장하지 않는다. 아래는 반환된 원문 발췌 그대로이며 코드에는 당시 실행 로직 전체를 보존했다. 잘린 trace를 회복하려고 완료검사를 반복하지 않았다.

| 원검수 후 읽기 영수증 2026-10-02T11:28:30.624Z | bytes | SHA256 |
|---|---|---|
| packager.mjs | 15503 | 289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65 |
| index.html | 342046 | 38f4e0e97ed63014e86ec48a14d9d0a677472ef57b99916f9a48b7b3395e66c8 |
| 제목 로고 | 1629808 | 185abb93942ea45a21dcc2d80564e44e1895afa14127d4eac110faeb979a85ba |
| ENTER 이미지 | 1705403 | be2c63ada445a92bd99e16ef412c496c4c8f6747097417b545d4f4f91876c0e7 |

정확 저장 capacity는 actual STATE at 11:35:03.518638Z, Changes68, allowNewOwnedFiles=true, epoch capacity-after-8c317a73-1134, BUILD 저장1반복/2파일. Changes는 감독 제공 실제 STATE에서 읽었으며 개인 Git 조회0. 원총괄 checkpoint8c317a73 및72fe는 제공 이력으로서 독립 원격 관측 현재 HEAD가 아니다.

저장 명령을 조합한 functions.exec 첫 호출은 Unexpected token ')' 구문오류로 어떤 도구/쓰기도 실행되지 않았다. 즉시 수정한 호출에서 apply_patch로 checks.mjs를 저장했다. 초기 정책 hash검증도 문자열 전사 누락으로 AssertionError(exit1)를 냈고, 정확 값으로 고친 Read는 exit0/80f7e3cf084c440658b1fae27ad60999ea6e41aa048bb5d22d62a099ab4b9608 일치했다. 이 두 하니스/도구작성 오류를 숨기지 않으며 제품결함과 구분한다.

저장 코드 SHA ea29faf1d0db6749f99054930c57261851c6676aeb3068226f97074cde04c817, 8798bytes. 저장 후 packager 전체SHA는 원검수 관측값과 같다. 원plan fragment SHA b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6. report/checks2파일만 생성했고 실행0·서버0·Git0·공유docs0·production0·삭제0·타WIP수정0이다. 코드 저장은 원메모리 실행문을 추출한 것으로 source pin이 바뀌면 향후 실행이 다른 입력이라는 한계를 유지한다.

## 최소 후보

기존 core4 REQUIRED_INPUT_MISSING loop 직후 assertExplicitMediaInputs(sourceRoot,inputs)1호출. requiredMediaPaths는 실제 FILES에서 png/jpeg/webp/gif/svg/mp4/webm 확장자 항목을 도출한 목록이다. 목록만 있어도 강제하지 않고 HTML 직접참조와 교집합을 사용한다. 이 helper 정책을 Mac packager의 정식 required-input 정책으로 채택할지는 root 검토이며 생산 미적용이다.

```javascript
function mediaReferences(html){const refs=[];const clean=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi,'');for(const m of clean.matchAll(/<(img|video|source)\b([^>]*)>/gi)){for(const attribute of m[1].toLowerCase()==='video'?['src','poster']:['src']){const a=m[2].match(new RegExp('(?:^|\\s)'+attribute+'\\s*=\\s*(?:"([^"]*)"|\'([^\']*)\'|([^\\s>]+))','i'));if(!a)continue;const url=a[1]??a[2]??a[3];if(/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(url))continue;refs.push({tag:m[1].toLowerCase(),attribute,url,path:url.split(/[?#]/)[0].replace(/^\//,'')});}}return refs;}
function assertExplicitMediaInputs(sourceRoot,inputs){const selected=new Set(inputs.map(x=>x.path)),required=new Set(requiredMediaPaths);for(const input of inputs){if(!/\.html$/i.test(input.path))continue;for(const media of mediaReferences(readFile(path.join(sourceRoot,input.path)).toString())){const local=path.posix.normalize(path.posix.join(path.posix.dirname(input.path),media.path));if(!required.has(local))continue;relative(local);requireValue(selected.has(local),'REQUIRED_HTML_MEDIA_MISSING:'+input.path+'->'+local);}}}

// 기존 core4 loop 뒤:
assertExplicitMediaInputs(sourceRoot,inputs);
```

## docs 인계

원메모리 코드 작성 뒤 docs 전체 관련키워드 rg exit0, 원문 output SHA94b03ff011083b7827221a0f7b1a7686d1334de915ea2b662d43aa88d6e0d2b7. 파일 저장 뒤 새 source docs 동기화를 위해 좁은 관련키워드 전체docs rg1회 추가: exit0, chunk d07955,6행/5문서. 새 fixture 결과·old/new 정책 인계 목적이며 완료 source검사 재실행이 아니다.

| 정본 | old 현재계약 | new 정확 문안 |
|---|---|---|
| PC_PACKAGING_20260910.md / STEAM_LATEST_DEPLOY_20260909.md | Windows FILES 제목/ENTER 이미지 필수, credits/forge-tabs-v3 선택적 | Windows 필수 FILES와 Mac 선택inventory의 완전성은 별도다. index 제목 이미지가 inputRoots/inputs/backup.inputs에서 동시 제외되어도 원Mac plan READY_PLAN_ONLY임을 메모리에서 재현. 기존 명시 필수미디어와 HTML 직접참조 교집합 검사 후보는 REQUIRED_HTML_MEDIA_MISSING:index.html->output/imagegen/exoduser-hell-lord-logo-api-v1.png로 BLOCKED; 정상 plan 반환객체 동등. 후보 미적용이며 빌드/실앱 인수 아님 |
| INTEGRATION_BUILD_TEAM_MASTER.md | 선택root SHA 일치와 게임의존 완전성 root계약 | 자율 BUILD media 한 경계2입력/4전체plan/6관측 PASS, 원문 stdout 일부truncation·완전trace보존 미완료를 명시. script/module 전건 반복0. 외부/dynamic/lazy/allassets 강제정책0 |
| ENTER_ENGRAVED_20260907.md / PROLOGUE_STORYBOARD_v1.md / CHANGELOG_SYNC.md | 원제목이미지·contain·ENTER 구성 수치 확정 | 이미지 내용/위치/크기·연출·수치 변경0. 해당 원본의 패키지 선택 누락검수 후보만 인계, 실 native 시각·문영상재생·GPU/품질검수 별도 |

공유docs·보호2_3 쓰기0. 필요 code+docs/checkpoint는 원총괄 소유. 실제 앱 image load/error·시네마틱·video/poster/콘텐츠·서명/배포 Gate는 별도. productionApplied=false, runtimeAccepted=false, rebuildExecuted=false, visualAccepted=false. 이번epoch BUILD2파일 budget을 소비했으므로 다음독립업무는 메모리에서만 진행하고 newer epoch 전에 추가파일0.

## 보존된 실제 도구 출력

```text
Warning: truncated output (original token count: 28935)
Total output lines: 1

{"taskId":"BUILD-explicit-html-media-memory-autonomy-1126","policy":"autonomy-user-20261002-1126-v1","capacity":{"at":"2026-10-02T11:09:51.440473+00:00","changes":94,"method":"git status --porcelain=v1 --untracked-files=all -z","status":"new_file_generation_held_before_100","rootCompletedRaw14CheckpointRequested":true,"codex7StopSentOnce":true,"independentMemoryWorkMayContinue":true,"allowNewOwnedFiles":false,"autonomousMemoryWorkContinues":true},"newFiles":0,"newFolders":0,"started":"2026-10-02T11:27:53.784Z","ended":"2026-10-02T11:27:53.879Z","node":"/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node","checks":[{"id":"CURRENT_ACCEPTS_MISSING_REQUIRED_MEDIA","passed":true},{"id":"CANDIDATE_REJECTS","passed":true},{"id":"NORMAL_RESULT_EQUIVALENT","passed":true},{"id":"ONE_INPUT_SELECTION_DIFF","passed":true},{"id":"ONLY_EXISTING_EXPLICIT_REQUIRED_MEDIA","passed":true},{"id":"DESCRIPTORS_CLOSED","passed":true}],"sourceRefs":[{"path":"/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json","bytes":608847,"sha256":"58f322dd42686cde8e16ab1c0dc1807a7e4b9f949d2b6fa33c49680b1c3762c5","utc":"2026-10-02T11:27:53.785Z"},{"path":"/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261001/BUILD/mac-packager/packager.mjs","bytes":15503,"sha256":"289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65","utc":"2026-10-02T11:27:53.787Z"},{"path":"/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs","bytes":9233,"sha256":"567a4b2d6761974b8763abe03ac3c50fc5b973c36be6324c7200ac27b445a78f","utc":"2026-10-02T11:27:53.788Z"},{"path":"/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/PC_PACKAGING_20260910.md","bytes":10712,"sha256":"434d760b2d7d97f0a817574596ad508d3164a6af1e926eb98b97294d86841a3a","utc":"2026-10-02T11:27:53.788Z"},{"path":"/Users/fordeargamers/Projects/exoduser-mig…27935 tokens truncated…+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md","docs/4.1맵디자인+설정/CH1_POOL_SEEP_PASS51.md","docs/4.1맵디자인+설정/CH1_ORGANIC_CACHE_BUDGET_PASS86_20260929.md","docs/4.1맵디자인+설정/CH1_ARENA_TISSUE_PASS56.md","docs/4.1맵디자인+설정/CH1_LIVING_HELL_V4_20260925.md","docs/4.1맵디자인+설정/CH1_ROTTEN_FOREST_BOUNDARY_PASS95_20260930.md","docs/4.1맵디자인+설정/CH1_HILL_SHADING_PASS45.md","docs/4.1맵디자인+설정/CH1_1_BLOCKOUT_MASTER.md","docs/4.1맵디자인+설정/CH1_1_CRISP_SMOOTHING_REMODEL_2026-09-04.md","docs/0마스터플랜/mac-resume-20261001/11팀-UI03-병행후속.md","docs/4.1맵디자인+설정/CH1_LEAF_RETIREMENT_PASS43.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/supervisor/SUPERVISOR_STATE.json","docs/2_7 인벤토리+장비시스템/2_7 인벤토리+장비시스템.md","docs/0마스터플랜/mac-resume-20261001/ITEM-폴백마스킹-검수.md","docs/0마스터플랜/mac-resume-20261001/MAP020-뿌리변주-검수.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-entry-result.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/PERSISTENCE-MAC-PACKAGE-20261002.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/MAP-ART-REVIEW-20261002.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/BUILD-next-result.md","docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/FIVE-OWNER-INTEGRATION-20261002.md"],"outputSha256":"94b03ff011083b7827221a0f7b1a7686d1334de915ea2b662d43aa88d6e0d2b7"},"boundary":"Actual plan/helpers and explicit Windows FILES REQUIRED contract, actual index static img tag/image bytes, fs/runtime/library memory substitutes. Reused old run function only, old checks/outcomes not executed. Normal selection is small media boundary not full package. No external/dynamic/lazy data-src/all-assets policy.","productionApplied":false,"runtimeAccepted":false,"rebuildExecuted":false,"visualAccepted":false,"previousTestsRerun":0,"exitCode":0}

```

## 저장 영수증 JSON

```json
{
  "savedUtc": "2026-10-02T11:40:52.552Z",
  "checks": {
    "path": "tools/team-followup-20261002/supervisor-next/BUILD/BUILD-explicit-media-closure-autonomy-1126/checks.mjs",
    "bytes": 8798,
    "sha256": "ea29faf1d0db6749f99054930c57261851c6676aeb3068226f97074cde04c817"
  },
  "packagerAfterSave": {
    "bytes": 15503,
    "sha256": "289bf3a1bec9f2a8b06d9309d5fbdcbc672b6a46aeb20e85fb441dd2df45dc65"
  },
  "originalPlanFragmentSha256": "b4d4a7443f417fc08fafcafd6286f2b923c22b90cd0fa731faca4bfd6b79e6f6",
  "capacity": {
    "at": "2026-10-02T11:35:03.518638+00:00",
    "changes": 68,
    "method": "git status --porcelain=v1 --untracked-files=all -z",
    "status": "released_bounded_autonomous_outputs",
    "allowNewOwnedFiles": true,
    "epoch": "capacity-after-8c317a73-1134",
    "maxNewOutputFilesPerRole": 2,
    "maxSavedIterationsPerRole": 1,
    "maximumAdditionalTeamFiles": 30,
    "maximumProjectedChanges": 98,
    "afterBudgetExhausted": "continue independent memory work; no new files until a newer capacity epoch",
    "rootCheckpointCommit": "8c317a73a2b68c0dd7b80e128aa4d50c3b0ef096",
    "rootReceiptSHA256": "0e73363a040a32abc3fc9780090ad7540b9a044483d629da5562ce82dcf4fcb9",
    "checkpointAt80StopBefore100": true,
    "independentMemoryWorkMayContinue": true
  },
  "noTestsRerun": true
}
```

## 저장 후 docs 검색 원문

```text
docs/CHANGELOG_SYNC.md:2410:| 에셋 | `output/imagegen/exoduser-hell-lord-logo-api-v1.png`, 전체 프롬프트는 같은 폴더의 `exoduser-hell-lord-logo-v1.prompt.txt` |
docs/13출시·마케팅/PC_PACKAGING_20260910.md:41:| 누락 파일 처리 | 별도 통합 빌드에서 `credits.html`과 `output/imagegen/forge-tabs-v3/`만 선택적; 나머지 명시된 `FILES`·`DIRS` 및 `node-main.js` 누락 시 실패 | 기존 기본 빌드의 경고 후 진행 동작은 유지 |
docs/13출시·마케팅/PC_PACKAGING_20260910.md:54:2026-09-12 최초 데이터 전달: `/Users/fordeargamers/EXODUSER-20260912-update/package.nw/`에 런타임 데이터 7,134개 파일(4,605,783,485 bytes)을 복사했다. 일반/자원/시스템 튜토리얼과 배지 검사 및 패키징 의존성 검사 통과. 기본 게임과 쉬운 테스트본을 함께 포함한다. `credits.html`, `output/imagegen/forge-tabs-v3`는 원본에 없어 기존 빌더의 선택적 누락 규칙을 적용했다. 이 최초 폴더에는 Windows 실행 엔진이 없었다. 이후 사용자가 NO NAME USB로 복사했으며 7,134개 파일의 존재·크기 및 상위 전달 파일을 확인했다.
docs/13출시·마케팅/STEAM_LATEST_DEPLOY_20260909.md:13:| output 아트 | FILES: `output/imagegen/exoduser-hell-lord-logo-api-v1.png`, `enter-gothic-api-v1.png`(같은 폴더), `output/fdg_reference_1280x720.png`, `output/imagegen/forge-icon-sheet-v1.png`, `forge-icon-sheet-v3.png`(같은 폴더). DIRS: `output/imagegen/item-skins`, `forge-tabs-v3`, `forge-tabs-v4`(같은 폴더). v3는 원본 없는 레거시 폴백 경로로 복사 시 경고·스킵; 현행 6개 대장간 탭은 v4 사용 |
docs/cinematic/ENTER_ENGRAVED_20260907.md:33:| 원본·실제 적용 파일 | `output/imagegen/exoduser-hell-lord-logo-api-v1.png` |
docs/cinematic/PROLOGUE_STORYBOARD_v1.md:338:**원본 문 영상은 보존한다. 2026-09-07 최신 사용자 지시로 실제 이미지 API가 생성한 EXODUSER / HELL LORD 로고와 하단 작은 ENTER를 배치한다.** `.cin-game-title`은 contain 프레임 left 53.3%, top 37%, width 52%. `output/imagegen/exoduser-hell-lord-logo-api-v1.png`를 `cin-logo-art.js`에서 검정 매트 투명화 후 표시한다. 버튼은 `#cinClickPrompt > .cin-hell-frame > .cin-enter-btn`. 클릭 시 제목·버튼·암부가 함께 사라지며 기존 문 열림 영상 재생 동작을 유지한다. 상세 수치는 [현재 계약](ENTER_ENGRAVED_20260907.md) 참조.

```

