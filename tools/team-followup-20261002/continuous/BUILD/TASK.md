# BUILD 연속 후속 — 기존 앱 대비 최신 source delta와 실행 계획

## 시작·소유 경계

- 실제 cwd: `/Users/fordeargamers/Projects/exoduser-migration-20261001`.
- 먼저 읽을 COMMON: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`.
- 이 TASK: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/BUILD/TASK.md`.
- 제공자: 기존 Codex BUILD chat. COMMON/TASK·이전 TASK는 immutable, 새 세션/하위팀/외부메시지0이다.
- 쓰기 소유: `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/BUILD/result.md`, `evidence.json` 두 파일. 신규 작은 byte/manifest 검증이 필요할 때만 같은 폴더 `checks.mjs` 한 파일 추가. 별도 manifest/config/plan/patch/log 산출0; 계획은 두 보고서 안에 넣는다.
- 다른 담당과 공유 중이다. 기존 APP·archive·old manifest·입력 source·packager·완료산출·생산·공유docs·Git/index·저장·타인WIP를 쓰거나 되돌리지 않는다. 삭제/이동/cleanup0. 새 빌드·앱·UI·서버·다운로드/설치0.
- 총괄 제공 기준은 `7e69495046323b3120578f67635c20feb48b2a4f`. Git 조회0이며 제공 commit과 독립 관측 현재 HEAD를 혼동하지 않는다. 실제 source bytes/SHA는 새로 읽어 기록한다.

## 먼저 읽을 정본·완료 근거

`AGENTS.md`, 현재 총괄 담당표, `docs/13출시·마케팅/INTEGRATION_BUILD_TEAM_MASTER.md` 최신 NW.js 실패 응답 보강과 빌드/백업 계약, 저장 SSOT의 같은 보강을 읽는다. `tools/team-followup-20261002/codex-half/BUILD/result.md`·`evidence.json`의 sealed acceptanceManifest와 선행 project-teams/BUILD 근거, 기존 packager 계획/설정은 읽기만 한다. source-delta22·전수8258/7918입력·기존 기능검사를 반복하지 않는다.

기존 앱은 `outputs/mac-package-ready/mac-packager-08cac1ce-21fb-4874-b4df-c136df5ac269/package/EXODUSER-08cac1ce-21fb-4874-b4df-c136df5ac269.app`, archive는 그 아래 `Contents/Resources/app.nw`다. 당시 빌드 입력 commit `6be3a06b4e8d03768a35f4c57d419f45c8efeb39`와 선행 source pin은 역사적 근거다. 현재 source나 신규 앱의 신원으로 대체하지 않는다.

## 이번 한 건: 추가 source drift 재분류 + 계획1판

현행 `game.html`, `game-easy-test.html`, `node-main.js`의 실제 bytes/SHA와 같은 기존 archive3파일을 좁게 읽는다. 선행 core7/ACC 행에 기록된 source/archive SHA 및 파생 관계를 인수하고 **이번 세 파일의 추가 변화**를 실제 diff로 분리한다.

| 구분 | 처리 |
|---|---|
| 본편/easy 카드 수명 보강 | 총괄7e694950의 수정 근거와 현재 source에서 실제 변경 함수/분기를 찾는다. 함수 이름/줄 번호/전후 fragment SHA를 확인하며 원인을 commit 이름만으로 추측하지 않는다 |
| node-main 실패 응답 | POST `/api/mats`에 HTTP500 JSON `{ok:false,error:'Internal Server Error'}`가 추가됐다. 성공·clamp·직접write 계약 유지 여부를 byte로 재분류한다. 선행 ACC-04 source pin은 이전 코드다 |
| 기존 예상 파생 | PORT3333→3383·job 저장경로2치환, package 파생 필드/프로필, index/ui-panels 동일, 개발 server 예상 비포함 및 HTML의 기존 미포함 기능은 선행 당시 관계다. 추가 기능 drift와 별도 열로 기록한다 |
| 현재 의미 | old manifest의 `PIN_MATCHES_PRIOR_EVIDENCE`를 현재로 확대하지 않는다. 실제 현재 SHA·DRIFT 사유·archive 미반영 여부를 새 result/evidence에만 기록한다 |

ACC source ID는 기존 manifest의 실제 행에서 가져오며 임의 재번호·건수 추정0이다. 변경 없는 core7 나머지는 선행 근거를 재사용하고 새 측정했는지 명시한다. 전체 에셋/앱 트리 재해시·복사·구빌드 실행0. 기존 checks의 writer/old pin 검사를 재실행하지 않는다. 의미 있는 신규 checks가 필요하면 작은 입력·ACC 구조/실제byte 검증만 소유 폴더에서 실행한다.

새 패키지 입력/실행 **계획1판**을 result/evidence에 담는다: 현재 필수 source/doc·LOCK·에셋 입력 및 복구 근거 확인 순서, 새로운 고유 job/port/profile/save 분리 방식, 다운로드 차단·필수 입력 제외 금지, execute 전에 총괄 checkpoint/정확 입력 pin을 갱신할 Gate, 생성 후 archive SHA 및 로비/설정/저장→종료→재실행/미디어 검수 순서. 실행하지 않은 jobId/port/현재 원격 보존을 실제 완료 값처럼 확정하지 않는다. `planReady`와 `rebuildExecuted=false`, `runtimeAccepted=false`, `visualAccepted=false`를 구분한다.

## 보고·한계·다음 Gate

Node는 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node`만. source/byte 계획 인수이며 앱 품질 인수가 아니다. read 시간·현재 SHA·선행 근거 SHA·전후 보존·대역/실제·명령/exit를 evidence에 기록한다. 코드/fixture 산출 후 docs 전체 `acceptanceManifest|ACC-04|nodeMainMats|공유 악의|카드|08cac1ce|INTEGRATION_BUILD_TEAM_MASTER` rg 검색과 canonical 문안을 인계한다. 보호2_3/공유docs 쓰기0.

한국어로 추가 source delta·기존 파생 관계·미반영 앱 상태·최소 검증·계획 준비/실행 미완료를 보고한다. 다음 Gate는 총괄의 최신 입력/원격 checkpoint 및 빌드 단독 실행 승인이다. 이번 담당이 execute하거나 새로운 작업을 시작하지 않는다.
