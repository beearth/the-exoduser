# MAP 후속 한 건 — easy CH1-1 지원 계약과 source hook 차이

## 실행 계약과 소유

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이며 타인 변경을 되돌리지 않는다. 먼저 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, 실제 `AGENTS.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json`을 읽는다. COMMON 전부를 적용하고 실제 cwd·현재 HEAD·관련 source SHA를 기록한다.

쓰기 소유는 아래 두 파일뿐이다. TASK·COMMON·이전 산출은 읽기 전용이다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/MAP/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/MAP/evidence.json`

생산 코드·공유 docs·맵 layout/geometry/collision/오브젝트/에셋·기존 검사·Git 변경·서버·빌드·실게임·UI·camera QA·새 fixture/테스트 실행을 금지한다. 이전 3FAIL/23건 검사를 재실행하거나 합산하지 않는다. source 차이를 실게임/시각 실패로 선언하지 않는다.

## 선행 문서와 입력

1. 작업 전에 `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md`를 처음부터 끝까지 읽고 적용한다. 읽은 범위를 `evidence.json`에 남긴다. 이어 `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/_MAP_SSOT_INDEX.md`의 순서대로 CH1-1 현재 stage LOCK/SSOT를 확인한다. 가이드는 LOCK 수치/좌표를 임의로 덮어쓰지 않는다.
2. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/PC_PACKAGING_20260910.md`와 index에서 연결된 현재 릴리스/지원 문서를 관련 키워드로 확인한다.
3. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/project-teams/MAP/result.md` 및 같은 폴더의 `evidence.json`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/claude-native-6/MAP/result.md` 및 같은 폴더의 `evidence.json`을 과거 입력으로 읽는다. 이전 S03/S04/M15의 명칭·대상·SHA는 기록에서 확인하며 현재 검수로 재사용하지 않는다.
4. `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/build-nwjs.mjs`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/node-main.js`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/server.cjs`에서 easy 진입·정적 서비스·패키징 include/exclude 및 CH1-1 hook 호출부를 필요한 범위만 읽는다. 실제 import/script 대상 파일을 발견하면 그 경로를 근거로 읽는다.

## 작업 한 건

main의 CH1-1 source hook을 easy에 전파하기 **전에**, easy가 현재 지원·진입·출하 대상인지와 해당 차이가 버전 의도인지 누락인지를 확인한다. 파일 존재, 서버에서 접근 가능, 패키지에 포함, 사용자 진입점 있음, 실제 지원/출하 승인됨은 서로 다른 사실이다. 직접 호출과 간접 호출을 구분하고, 과거 패키징 문서만으로 현재 출하를 확정하지 않는다.

다음 전표를 만든다: `대상/현재 source SHA → 지원 문서·LOCK → 진입점/호출 chain → 패키징 계약 → CH1-1 generator/hook 선택 → 의도 증거 → 분류(의도/누락 후보/UNKNOWN)`. main/easy의 동일성 요구가 실제 계약에 있는지 먼저 판단한다. 이전 3FAIL은 계약 확인 전에는 drift 관찰이며 곧바로 생산 수정 사유가 아니다.

동일 계약 적용이 근거로 확인되면 기존 hook 연결을 최소로 맞추는 **미적용 patch 제안 한 건**을 `result.md` 안에만 적고, 바뀌는 caller와 보호할 LOCK, 총괄이 적용 후 확인할 Gate를 제시한다. 레이아웃 재생성·geometry 덮어쓰기·벽/좌표/오브젝트 편집은 제안 범위에도 넣지 않는다. 지원 의도가 불명확하면 강제 동기화 대신 필요한 결정과 담당을 명시한다.

## 산출과 완료 Gate

- 한국어 결과에 지원/진입/패키징/callsite 전표, 의도 대 누락 판단, 최소 후보 또는 결정 대기, 정확한 canonical 문서/section과 인계 문안을 넣는다. 관련 키워드를 docs 전체 `rg`로 검색하되 공유 docs는 쓰지 않는다.
- 가이드 §23의 `MAP PRODUCTION REPORT` 항목을 모두 사용한다. 본 작업이 source 계약 심사이며 제작 단계 실행 0임을 적고, 각 geometry/전투/카메라/TECH 항목은 수행하지 않았으면 미검수로 표기한다.
- `VISUAL VERDICT: RETOUCH`를 쓰되 **실제 시각 검수 미수행·판정 보류를 표시하는 값이며, 시각 품질을 확인한 RETOUCH/PASS가 아님**을 바로 옆에 적는다. 자동/source 일치 여부를 visual PASS로 대체하지 않는다.
- Gate: 가이드 전체·SSOT 선행 완료, 현재 easy 지원 범위와 hook 호출 근거가 분리됨, 부족한 지원/출하 근거 UNKNOWN, 이전 검사 반복 0, 생산/geometry/UI/게임/패키지 실행 0.
- `evidence.json`에 `taskId=continuous-MAP-easy-contract`, 실제 provider·확인된 chat/sessionId(미확인 null), UTC/KST 시각, 실제 읽은 절대 경로/범위/source SHA, 실제 도구 이름·명령·exit·오류와 소유 출력 두 파일을 기록한다. 스킬/API/MCP는 관련성이 있을 때만 COMMON에 따라 사용하고 실제 SKILL 경로·호출·결과를 기록한다. thinking/인증/개인정보/프롬프트 원문은 쓰지 않는다.

완료 후 한 건의 결과·영향·검증 한계·남은 결정 의존성을 보고하고 다음 지시를 기다린다.
