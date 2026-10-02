# STORY — 세계관·챕터·대사·시네마틱 초기 인수

작업 ID `STORY-INITIAL-CONSISTENCY-20261002`. 사용자 승인 신규 스토리 팀의 실제 작업이다. 실행 담당은 Mac Claude Code Terminal 21이며 총괄이 직접 전달한다. 작성 기준 HEAD `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`; 착수 시 실제 HEAD를 다시 기록한다.

## 경로와 안전 계약

실제 checkout은 **`/Users/fordeargamers/Projects/exoduser-migration-20261001`**이다. 이 TASK의 절대 경로는 **`/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/STORY/TASK.md`**다. 먼저 실제 cwd와 TASK 경로를 대조하고 AGENTS.md, 팀 연속 진행 정책, PROJECT_MANAGEMENT_MASTER.md 최신 운영 상태를 읽는다. 날짜를 바꾼 별도 프로젝트·출력 경로를 만들지 않는다.

쓰기 소유권은 아래 **두 파일만**이다. TASK는 총괄 소유이므로 수정하지 않는다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/STORY/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/STORY/evidence.json`

다른 담당도 공유 checkout에서 작업 중이다. production·기존 test·공유 docs·old TASK·타인 WIP·저장·공용 인덱스는 읽기 전용이다. 파일/폴더 삭제 명령, cleanup·이동·rename, 소유 밖 쓰기, Git쓰기/commit/push/reset/checkout, 새 세션·하위 팀·메시지·자동화·설치·권한 변경은 금지한다. UI·서버·실게임·빌드·영상/이미지 생성·인코딩·테스트 재실행·checks/new tests는 이번에 하지 않는다. 허용 작업은 파일 Read/Grep/Glob, 읽기 전용 cwd/HEAD/status/SHA 확인, 위 두 보고 파일 작성이다. 잘못된 경로·산출을 발견하면 삭제하지 말고 총괄에 보고한다.

## 첫 한 건

현재 세계관·7장 구조·인물/대사·시네마틱의 **SSOT↔source 일관성표 1판**과 **source 연결 누락 우선 제안 1건**을 작성한다. 새 로어·TBD의 정답·보스 배정·새 대사·시네마틱 타이밍을 확정하지 않는다. 기존 자료의 디자인 LOCK과 최신 승인 대사가 우선이며, 오래된 버전 기록은 날짜·적용 상태와 함께 분리한다.

| 먼저 읽을 근거 | 필요한 범위·주의 |
|---|---|
| `docs/11내러티브·로어디자인/WORLD_CORE.md` | 악의 4법칙·단일 에너지·네메시아·7장/35보스·떡밥·TBD. UI 자원 MP/ST/신성력의 존재를 로어 규칙만으로 삭제하거나 모순 확정하지 않음 |
| `docs/11내러티브·로어디자인/11내러티브·로어디자인.md` | 최신 v23 공통영상/선택형 자막 머리말, 생성→스토리→INTRO→플레이, 승인 대사·부분 스킵 및 역사 버전 |
| `WARRIOR_DESIGN_LOCK.md`, `NEMESIA_DESIGN_LOCK.md`, `PETS_DESIGN_LOCK.md` | 전사·킬루·네메시아·디로이·핵터 정체성/디자인 LOCK. 인물 표시명 차이는 근거 없이 일괄 변경하지 않음 |
| `docs/11내러티브·로어디자인/펫_대사_스크립트.md` | 기존 대사·화자·상황. 게임 source의 펫 대사와 NPC 서사 역할을 구분 |
| `docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md`, `NEMESIA_DIALOGUE_20260910.md`, `STORY_KOREAN_GRAMMAR_20260910.md` 및 `docs/16번역·로컬라이제이션/WARRIOR_LANGUAGE_SUBTITLES_20260922.md` | 위 문서에서 연결된 현행 재생/대사/자막 계약 관련 절만 읽음 |
| `game.html`, `game-easy-test.html`, `index.html` | `PROLOGUE_LINES`, `INTRO_CUTSCENE_LINES`, `_renderIntroCutscene`, 펫 대사·로비 생성 후 스토리 재생/스킵/완료 플래그의 실제 연결. 행 번호는 현행 source로 확인 |

표 항목은 `서사 id / 한글명·화자 / 챕터·상황 / LOCK·SSOT 파일·행 / 현행 대사 또는 조건 / source 파일·행·식별자 / 연결·미연결·TBD·UNKNOWN / 역사 기록과 차이 / 영향·후속 Gate`다. WORLD_CORE의 초기 제목/스튜디오·친구 이름 TBD·35보스와 현행 브랜딩/킬루/보스 구성이 다르면 최신 근거를 대조하고 자동 정정하지 않는다. 줄 연결이나 문자열 정의만으로 전체 컷신 재생·자막·청취 인수를 선언하지 않는다.

우선 제안 1건은 현재 승인된 인물/대사/장면을 활용해 trigger→노출→종료/스킵→진행 연결을 설명한다. 실제 누락 근거·관련 팀·필요한 docs 문안·source 적용 후보 위치를 명시하고 생산 patch는 만들지 않는다. 신규 캐릭터/아트, 새 세계관 폭로 확정, 미구현 챕터의 출시 약속은 보류한다. QUESTNPC는 퀘스트 흐름, BOSS는 전투, ART는 에셋, SOUND는 음향을 소유하므로 겹치는 부분은 인계한다.

맵 배치·geometry·collision·카메라 QA는 이번 범위가 아니다. 후속으로 해당 범위에 들어가면 `docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체와 MAP SSOT 순서를 먼저 따른다. 보호 문서 `2_3` 수정과 전투 수치 변경은 금지한다.

## 완료 근거

evidence.json에 taskId·provider/terminal·확인된 sessionId(모르면 null)·receivedAt/startedAt/completedAt UTC·cwd/HEAD·ownedPaths·실제 Read 파일/행/식별자·명령/exit·Changes 시작/완료·보존 SHA를 기록한다. 최소 보존 대상은 `game.html`, `game-easy-test.html`, `server.cjs`, `node-main.js`, `index.html`, `test/nodeMainMats.test.js`의 착수/완료 SHA와 읽은 핵심 SSOT SHA다. 타 담당 변경은 근거와 UNKNOWN을 기록하며 되돌리지 않는다.

result.md에 일관성표·우선 제안 1건·관련 키워드의 docs 전체 rg 결과·정확한 보충 문안·미실행 Gate를 한국어로 담는다. 실제 Read·작성·검수·완료 시각을 구분하고 최종 응답으로 보고한다. 새 검사·실플레이·시청/청취 PASS·전체 구현 수를 추정하지 않는다. Changes 80개부터 총괄 checkpoint 필요를 보고하고 100개 전에 새 산출을 멈춘다. 완료 후 다음 일을 독자 생성하지 않고 총괄 배정을 기다린다.
