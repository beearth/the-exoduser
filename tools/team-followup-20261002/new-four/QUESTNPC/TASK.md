# QUESTNPC — 퀘스트·NPC 설계/구현 지도 초기 인수

작업 ID `QUESTNPC-INITIAL-FLOW-20261002`. 사용자 승인 신규 퀘스트·NPC Codex 팀의 실제 작업이다. 총괄이 새 채팅에 직접 전달한다. 작성 기준 HEAD `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`; 착수 시 실제 HEAD를 다시 기록한다.

## 경로와 안전 계약

실제 checkout은 **`/Users/fordeargamers/Projects/exoduser-migration-20261001`**이다. 이 TASK의 절대 경로는 **`/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/QUESTNPC/TASK.md`**다. 먼저 실제 cwd와 TASK 경로를 대조하고 AGENTS.md, 팀 연속 진행 정책, PROJECT_MANAGEMENT_MASTER.md 최신 운영 상태를 읽는다. `exoduser-migration-20261002` 등 별도 프로젝트·날짜 경로를 생성하지 않는다.

쓰기 소유권은 아래 **두 파일만**이다. TASK는 총괄 소유이므로 수정하지 않는다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/QUESTNPC/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/QUESTNPC/evidence.json`

다른 담당도 공유 checkout에서 작업 중이다. production·기존 test·공유 docs·old TASK·타인 WIP·저장·공용 인덱스는 읽기 전용이다. 파일/폴더 삭제 명령, cleanup·이동·rename, 소유 밖 쓰기, Git쓰기/commit/push/reset/checkout, 새 세션·하위 팀·메시지·자동화·설치·권한 변경은 금지한다. UI·서버·실게임·빌드·이미지 생성·테스트 재실행·checks/new tests는 하지 않는다. 허용 작업은 파일 Read/Grep/Glob, 읽기 전용 cwd/HEAD/status/SHA 확인, 위 두 보고 파일 작성이다. 오경로·오산출 발견 시 삭제하지 말고 총괄에 보고한다.

## 첫 한 건

**현재 quest/NPC 설계·구현 지도 1판**과 **기존 인물을 활용한 최소 퀘스트/NPC 흐름 검토 초안 1건**을 작성한다. 신규 인물·새 로어·보상량·경제·저장 schema·맵 배치/연동 수치를 확정하거나 생산에 구현하지 않는다. 미발견을 미구현 확정으로 쓰지 않고 검색 범위·정의·호출·저장 근거와 UNKNOWN을 구분한다.

| 먼저 읽을 근거 | 필요한 범위·주의 |
|---|---|
| `docs/11내러티브·로어디자인/WORLD_CORE.md` | 디로이/핵터 동료·거점 NPC 역할, 충 보유/TBD·장별 떡밥. 설계 역할을 실제 대장간 NPC 구현으로 계산하지 않음 |
| `docs/11내러티브·로어디자인/11내러티브·로어디자인.md`, `PETS_DESIGN_LOCK.md`, `펫_대사_스크립트.md` | 승인된 인물·화자·상황·대사·INTRO 연결. STORY의 로어 인수와 구분 |
| `docs/3.2메타·진행시스템/`, `docs/2_7 인벤토리+장비시스템/`, `docs/15 세이브+데이터구조/` | 파일 목록을 먼저 찾고 퀘스트·NPC·거점·상점·대장간·진행/저장과 직접 관련된 절만 읽음 |
| `game.html`, `game-easy-test.html`, `index.html` | 펫 대사 `_petSay`·`_checkPetDialogue`, 튜토리얼·상인/거래·대장간·stage 진행·intro 완료와 직렬화 경로. quest/NPC 고유 식별자는 실제 검색으로 확인 |

검색은 `quest`와 `request`를 구분하고, 문자열에 NPC 이름이 있다는 사실과 상호작용·조건·상태·보상이 실제 구현됐다는 사실을 구분한다. 지도 표는 `설계 id / 한글명·인물 / SSOT 파일·행 / source 파일·행·식별자 / 시작·상호작용·조건·종료·보상 / 저장·복원 연결 / 구현·설계·미연결·UNKNOWN / 관련 팀·Gate`로 작성한다.

초안은 기존 디로이/핵터 등의 승인 인물 중 근거 있는 1명을 고르고 `등장/접근 조건→대화 진입→목표 안내→기존 진행 사건 관측→완료 대화→중복 방지/취소·재진입`을 구체화한다. 기존 대사와 제안 문안을 표시하고 새 대사를 승인 원문으로 가장하지 않는다. 보상·저장·맵 연결이 필요하면 **현행 연결 근거와 미결정 항목만** 제시하며 임의 숫자·새 save 필드·맵 좌표를 만들지 않는다. 기존 제약만으로 가능한 흐름과 구현 의존성을 분리한다. ITEM/BALANCE는 보상 경제, UIUX는 대화 UI·입력, STORY는 로어, MAP은 실제 배치를 소유한다.

이번에는 맵 geometry·collision·랜드마크·카메라/전투 QA를 수행하지 않는다. 후속으로 실제 NPC 배치나 맵/카메라 작업에 들어가면 `docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체와 MAP SSOT 순서를 먼저 읽고 §23 보고·VISUAL VERDICT를 따른다. 보호 문서 `2_3` 수정·전투 수치 변경은 금지한다.

## 완료 근거

evidence.json에 taskId·provider·확인된 chat/sessionId(모르면 null)·receivedAt/startedAt/completedAt UTC·cwd/HEAD·ownedPaths·실제 Read 파일/행/식별자·명령/exit·Changes 시작/완료·보존 SHA를 기록한다. 최소 보존 대상은 `game.html`, `game-easy-test.html`, `server.cjs`, `node-main.js`, `index.html`, `test/nodeMainMats.test.js`의 착수/완료 SHA와 읽은 핵심 SSOT SHA다. 타 담당 변화는 근거·UNKNOWN을 남기고 되돌리지 않는다.

result.md에 지도·초안 1건·관련 키워드의 docs 전체 rg 결과·정확한 보충 문안·미구현/미실행 Gate를 한국어로 기록하고 최종 응답으로 보고한다. 초기 인수 완료와 퀘스트 실제 구현·세이브·패드·실플레이 검수는 별개다. Changes 80개부터 총괄 checkpoint 필요를 보고하고 100개 전에 새 산출을 멈춘다. 완료 후 새 일을 독자 생성하지 않고 총괄 배정을 기다린다.
