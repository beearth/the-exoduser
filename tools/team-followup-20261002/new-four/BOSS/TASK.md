# BOSS — 보스전 설계·생산 대응 초기 인수

작업 ID `BOSS-INITIAL-SSOT-SOURCE-20261002`. 사용자 승인 신규 보스전 팀의 실제 작업이다. 실행 담당은 Mac Claude Code Terminal 20이며 총괄이 직접 전달한다. 다른 대화형 팀·headless 검토와 중복 실행하지 않는다. 작성 기준 HEAD `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`; 착수 시 실제 HEAD를 다시 기록한다.

## 경로와 안전 계약

실제 checkout은 **`/Users/fordeargamers/Projects/exoduser-migration-20261001`**이다. 이 TASK의 절대 경로는 **`/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/BOSS/TASK.md`**다. 먼저 실제 cwd와 TASK 경로가 정확히 일치하는지 확인하고 AGENTS.md, 팀 연속 진행 정책, PROJECT_MANAGEMENT_MASTER.md의 최신 운영 상태를 읽는다. 날짜를 바꾸거나 `exoduser-migration-20261002` 프로젝트를 만들지 않는다.

쓰기 소유권은 아래 **두 파일만**이다. TASK는 총괄 소유이므로 수정하지 않는다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/BOSS/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/BOSS/evidence.json`

다른 담당도 공유 checkout에서 작업 중이다. production·기존 test·공유 docs·old TASK·타인 WIP·저장·공용 인덱스는 읽기 전용이다. 파일/폴더 삭제 명령, 임의 cleanup·이동·rename, 소유 밖 쓰기, Git쓰기/commit/push/reset/checkout, 새 세션·하위 팀·메시지·자동화·설치·권한 변경은 모두 금지한다. UI·서버·실게임·빌드·이미지 생성·테스트 재실행·checks/new tests는 이번 초기 인수에 포함하지 않는다. 허용 작업은 파일 Read/Grep/Glob, 읽기 전용 cwd/HEAD/status/SHA 확인, 위 두 보고 파일 작성뿐이다. 오류 경로를 발견하면 삭제·복구하지 말고 총괄에 보고한다.

## 첫 한 건

설계의 **19보스·49 moves** 범위를 현재 양쪽 HTML과 대응시키는 목록 1판을 작성한다. 이 숫자를 실제 구현 완료 수로 가정하지 않는다. WORLD_CORE의 35보스 서사, stage 수, 고유 보스 수, 무브 정의·예약 인덱스·사용 가능 기술 수를 구분한다. 미구현 또는 연결 누락 중 근거가 확보된 우선 1건과 검수 Gate를 제안하며 생산 수치·보호 전투 설계는 바꾸지 않는다.

| 먼저 읽을 근거 | 필요한 범위·주의 |
|---|---|
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` | 최신 머리말, HP/ATK 실제 공식 감사 정정, `_BOSS_MOVESET`·49기술 출처, 렌더 LOCK. dead 상수는 실제 배율로 사용하지 않는다 |
| `docs/8.1보스디자인바이블/DARK_DRUID_DEMO_FINALE_DESIGN.md`, `DARK_DRUID_FINALE_PACING_v04.md`, `DARK_DRUID_FINALE_QA_20260909.md` | 일반 si0/si3와 데모 예외·최신 v0.4 계약·미완료 Gate를 구분 |
| `docs/8.1보스디자인바이블/BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md`, `BOSS_01_FOREST_NORMAL_POISON_MUSHROOM_GIANT.md`, `BOSS_02_FOREST_NORMAL_HELL_ABERRANT.md`, `BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER.md` | 기존 개별 설계와 현행 배정 비교. 흑요염 si0 이력을 현행 배정으로 승격하지 않음 |
| `docs/9적ai패턴디자인/`의 BOSS_MOVES 관련 문서 | 파일 목록·관련 절만 읽어 49종 설계 출처 확보 |
| `docs/11내러티브·로어디자인/WORLD_CORE.md` | 35보스/7장 서사 분배와 보스 콘텐츠 범위 차이 |
| `game.html`, `game-easy-test.html` | `BOSS_MOVES`, `_BOSS_MOVESET`, 보스 배정·생성·실행 분기, `_bossPhaseCheck`·피날레 관련 함수의 실제 대응. 최신 행 번호를 사용 |

현행 최우선 제한은 **si0/si3 다크드루이드**, **전체 보스 cageTrap 금지·예약 인덱스 보존**, **무지개탄 blackBean은 Q만 패링·E 불가**, **어택 티켓 추가 금지**다. `2_3 돌진+패링+방패시스템` 문서는 수정 금지다. ENEMY는 공용 AI, ANIMVFX는 렌더를 소유하므로 겹치는 변경은 제안·인계로 남긴다.

대응표에는 `설계 id / 한글명 / chapter·si / SSOT 파일·행 / 생산 파일·행·식별자 / 정의·배정·도달 경로 / 구현·예약·금지·미구현·UNKNOWN / 현재 수치·조건 / 차이 / 검수 Gate`를 담는다. 단순 이름 검색 성공을 실제 전투 구현으로 계산하지 않는다. 대응 목록이 확정되지 않으면 미확인 행과 근거를 남긴다. 우선 제안 1건은 입력 조건→예상 흐름→부족한 source 근거→필요한 담당·Gate를 구체화하고 실행하지 않은 것은 논리 검토로 표시한다.

맵 geometry·collision·랜드마크·카메라/전투 시각 QA는 이번에 수행하지 않는다. 후속으로 그 범위에 들어가면 `docs/4.1맵디자인+설정/EXODUSER_MAP_PRODUCTION_GUIDELINE_v0.9.md` 전체를 먼저 읽고 MAP SSOT 순서·§23 보고·VISUAL VERDICT를 따른다.

## 완료 근거

evidence.json에 taskId·provider/terminal·확인된 sessionId(모르면 null)·receivedAt/startedAt/completedAt UTC·실제 cwd/HEAD·ownedPaths·실제 Read 파일/행/식별자·명령/exit·Changes 시작/완료·보존 SHA를 기록한다. 최소 보존 대상은 `game.html`, `game-easy-test.html`, `server.cjs`, `node-main.js`, `index.html`, `test/nodeMainMats.test.js`의 착수/완료 SHA와 읽은 핵심 SSOT SHA다. 타 담당 변경이 있으면 변화 원인을 UNKNOWN/담당 변경으로 구분하며 되돌리지 않는다.

result.md에 목록 1판·우선 1건·정확한 docs 동기화 제안·미실행 항목을 한국어로 담고 최종 응답으로 보고한다. 관련 키워드는 docs 전체에서 rg 검색하되 보충 문안만 보고서에 남긴다. 숫자·실제 runtime·시각 PASS·팀 전체 동시가동을 추정하지 않는다. Changes 80개 도달 시 총괄 checkpoint 필요를 보고하고 100개 전에 새 산출을 멈춘다. 완료 후 새 일을 독자 생성하지 않고 다음 배정을 기다린다.
