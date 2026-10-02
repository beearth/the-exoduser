# QUESTNPC 후속 한 건 — 디로이 firstItem 표시 성공 후 소비 경계

## 실행 계약과 소유

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이며 타인 변경을 되돌리지 않는다. 먼저 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, 실제 `AGENTS.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json`을 읽고 COMMON 전부를 적용한다. 실제 cwd·총괄 제공 commit의 출처/시각(독립 현재 HEAD 확인 아님)·읽은 source SHA를 기록한다.

기본 쓰기 소유는 아래 두 파일뿐이다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QUESTNPC/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QUESTNPC/evidence.json`

실제 도달 가능한 새 경계를 검증할 필요가 있을 때만 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QUESTNPC/checks.mjs` **한 파일**을 추가할 수 있다. 총 소유 최대 3파일이며 별도 임시 fixture/패치 파일을 만들지 않는다. TASK·COMMON·이전 산출은 읽기 전용이다. 생산 코드·공유 docs·세이브필드/보상/배지 정책/NPC 배치·에셋·기존 검사·Git 변경·서버·빌드·실게임·UI·새 세션은 금지한다.

## 먼저 읽을 근거

1. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/11내러티브·로어디자인/펫_대사_스크립트.md`, 같은 폴더의 `PETS_DESIGN_LOCK.md`와 `WORLD_CORE.md`의 해당 companion/NPC section, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/2_4 펫시스템/2_4 펫시스템.md`를 읽는다. 디로이/헥터 역할과 안내 문구의 현재 승인 상태를 보호한다.
2. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/2게임디자인레벨디자인/SYSTEM_TUTORIAL_20260912.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/15 세이브+데이터구조/15 세이브+데이터구조.md`에서 표시·성공·skip·일회성·슬롯 배지와 run 상태의 구분을 확인한다.
3. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/QUESTNPC/TASK.md`, 같은 폴더의 `result.md`, `evidence.json`을 읽어 이전 11행 조사/후보를 입력으로만 사용한다.
4. `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html`의 `_checkPetDialogue`, `_petSayCD`, `_petSay`, `_petTut.firstItem`, bag 획득·장착/튜토리얼 연결 caller를 읽는다. 실제 import에서 확인한 system lesson script와 상태 reset/재진입 caller도 필요한 범위만 읽는다. source에 없는 파일명·행 번호를 만들지 않는다.

## 작업 한 건

디로이 `firstItem`의 **실제로 도달 가능한 경계 한 건**을 골라 현재의 flag 소비 순서와 표시 성공 후 소비 후보를 대조한다. caller의 선행 guard와 우선순위, `_petSayCD`와 `_petSay`의 반환값/부수효과까지 함께 읽는다. 하위 함수에만 가상의 bubble/CD 상태를 넣어 상위 guard가 막는 반례를 만들지 않는다.

`표시 성공 → 거절/중단 또는 취소 → 정상 재진입` 수명 표를 만들고, 각 상태에서 현재 `_petTut.firstItem`·bubble/CD·튜토리얼/배지 상태를 누가 언제 바꾸는지 source로 연결한다. 비동기 취소 API가 없으면 없는 것을 표시하고 실제 close/skip/사망/스테이지 변경/리셋 경로 중 선택 경계와 관련된 것만 조사한다. 안내 표시와 시스템 튜토리얼 실제 성공, 획득과 장착, 메모리 flag와 저장 배지를 합치지 않는다.

실제 실패 후 재안내를 막는 선소비 경로가 확인되면 `result.md` 안에서만 `_petSayCD`의 성공 반환 후 flag를 소비하는 최소 후보를 제안한다. 정상 경로의 메시지/횟수/CD/순서, 기존 다른 튜토리얼, 배지·보상 재실행 방지를 보호한다. 거절 경계가 도달 불가능하거나 이미 성공 보장이라면 새 버그를 만들지 말고 변경 불필요 근거와 미확인 계약을 보고한다. 새 대사·퀘스트 상태·세이브필드·보상·NPC 위치는 추가하지 않는다.

## 선택적 source fixture

새 경계를 의미 있게 검증할 수 있을 때만 소유 `checks.mjs` 하나를 작성한다. 실제 현재 source fragment를 읽어 사용하는 부분과 최소 대역을 구분하고, caller guard를 포함한다. **현재 source에서 경계 실패 → 메모리상 후보 통과 → 정상 표시 경로 동등성**을 한 실행에서 확인한다. 생산 source에 patch하거나 과거 검사를 반복/합산하지 않는다. source 구조 변경을 감지하면 임의 구현으로 대체하지 말고 오류를 기록한다.

실행은 `/Users/fordeargamers/.local/node-runtime/node-v24.15.0-darwin-arm64/bin/node /Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/QUESTNPC/checks.mjs`만 사용한다. UI/HTTP/실게임/저장/음성 검수로 계산하지 않는다. fixture가 불필요하면 작성·실행 0과 판단 이유를 기록한다.

## 산출과 완료 Gate

- 한국어 결과에 선택한 경계의 도달 chain, 성공/거절·취소/재진입 상태 표, 현재와 미적용 후보 비교, 실제 fragment와 대역의 한계, 정확한 canonical 문서/section/인계 문안을 넣는다. 관련 키워드를 docs 전체 `rg`로 검색하고 공유 docs는 쓰지 않는다.
- Gate: 실제 caller guard를 통과하는 근거 또는 반례 불성립 근거, 표시 성공 후 소비 판단, 정상 경로 보호, 새 save/reward/NPC/production 적용 0, 이전 조사·검사 재실행 0. 검증을 source fixture와 실제 플레이로 명확히 분리한다.
- `evidence.json`에 `taskId=continuous-QUESTNPC-first-item`, 실제 provider·확인된 chat/sessionId(미확인 null), UTC/KST 시각, 실제 읽은 절대 경로/source SHA, 실제 도구 이름/명령/exit/오류, 사용 source fragment·대역, 소유 출력 목록을 기록한다. 관련 스킬/API/MCP 사용은 COMMON에 따라 실제 SKILL 경로·호출·결과를 남긴다. 미사용 도구를 사용으로 쓰거나 thinking/인증/개인정보/프롬프트 원문을 복사하지 않는다.

완료 후 한 건의 결과·영향·검증 한계·총괄 적용 전 Gate를 보고하고 다음 지시를 기다린다.
