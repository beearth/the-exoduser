# STORY 후속 한 건 — 세계관 CIN_LINES 전표와 이전 분류 정정

## 실행 계약과 소유

실제 checkout은 `/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 다른 담당과 공유 중이며 타인 변경을 되돌리지 않는다. 먼저 `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/COMMON.md`, 실제 `AGENTS.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/PROJECT_MANAGEMENT_MASTER.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/0마스터플랜/mac-resume-20261001/vscode-dispatch/TEAM_UTILIZATION_20261001.json`을 읽는다. COMMON 전부를 적용하며 실제 cwd·총괄 제공 commit의 출처/시각(독립 현재 HEAD 확인 아님)·관련 source SHA를 기록한다.

쓰기 소유는 아래 두 파일뿐이다. TASK·COMMON·이전 결과는 읽기 전용이다.

- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/STORY/result.md`
- `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/continuous/STORY/evidence.json`

생산 코드·공유 docs·대사/로어/번역/영상/음성 에셋·Git 변경·기존 검사·새 fixture/테스트·서버·빌드·실게임·UI를 금지한다. WORLD_CORE의 TBD 이름이나 관계를 임의로 확정하지 않는다.

## 먼저 읽을 근거

1. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/11내러티브·로어디자인/WORLD_CORE.md`, 같은 폴더의 `11내러티브·로어디자인.md`, `WARRIOR_DESIGN_LOCK.md`, `NEMESIA_DESIGN_LOCK.md`, `PETS_DESIGN_LOCK.md`에서 현재 로어/명칭/구현 구분을 읽는다. 큰 문서는 관련 section을 읽고 범위를 기록한다.
2. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/cinematic/SPACE_HOLD_SKIP_20260914.md`, 같은 폴더의 `WARINTRO_CREATION_RUNTIME_20260910.md`, `NEMESIA_DIALOGUE_20260910.md`, `STORY_KOREAN_GRAMMAR_20260910.md`, `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/16번역·로컬라이제이션/WARRIOR_LANGUAGE_SUBTITLES_20260922.md`를 읽는다.
3. `/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/4.1맵디자인+설정/BOSS_CANONICAL_MAPPING.md`의 design 이름/런타임 slot 이중 체계와 hell index를 확인한다. 맵 geometry/제작/QA는 수행하지 않는다.
4. `/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/new-four/STORY/TASK.md`, 같은 폴더의 `result.md`, `evidence.json`을 과거 입력으로 읽는다.
5. `/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html`의 `CIN_LINES`, caption/language resolver, `_CIN_VOICE`, 이미지 선택/타이밍, Space 입력, 종료·로비 gate 및 연결된 실제 script를 읽는다. `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html`에서는 Killu/HELL_BOSSES/hell index/ready 관련 선언과 호출을 필요한 범위만 읽는다. 파일명·행 번호를 추정하지 않는다.

## 작업 한 건

세계관 프롤로그 `CIN_LINES`의 **텍스트 19항목 + 종료 1항목**을 현재 source로 확인하고 다음 전표를 만든다: `cue index → text/종료 구분 → 원문 참조 또는 짧은 요약 → 시작/지속 타이밍과 단위 → 이미지 index/유지/암전 → 언어 key와 실제 resolver → 종료/로비 연결`. 개수나 값이 현재 달라졌으면 실제값과 차이를 보고한다. 세계관 프롤로그와 전사 story v23 영상의 22 cue, game PRO/INTRO preview는 별도 경로로 구분한다.

`_CIN_VOICE=false`의 적용 경로와 음성 미사용 범위를 확인한다. 언어를 항목 내부 key 수만으로 판정하지 말고 `_CIN_I18N` 등 실제 보충 테이블 정의/로드/조회 및 영어·한국어 fallback까지 추적한다. 찾지 못한 지원 언어는 UNKNOWN으로 남기며 임의 script 이름을 만들지 않는다. caption 지원·음성 지원·실제 번역 QA는 분리한다.

Space의 첫 입력/다음 cue, hold 임계값과 단위, 취소·해제, media/BGM 정리, `skipToGate` 또는 동등 종료 경로와 로비 연결을 source로 대조한다. 전사 영상/세계관/game preview의 서로 다른 hold 계약을 하나로 합치지 않는다. 실제 UI 입력·음성/영상 재생 검수는 하지 않는다.

이전 STORY 보고의 `hell=6`을 6장으로 읽은 부분은 **0-based hell6 = 7장**인지 현재 canonical/source로 대조하여 새 보고에서 정정한다. Killu의 이름/slot 할당, stage `ready` 제작 상태, 실제 진입 지원, 보스 runtime 구현, 전투 검수와 로어 연결을 분리한다. `ready:false` 하나로 보스 전체 미구현을 확정하지 않는다. 과거 결과를 직접 편집하지 않는다.

WORLD_CORE의 친구/8장 등 TBD와 7장×5/35 기획, design 명명 보스 19와 runtime slot 35는 각 개념을 보존한다. Killu 관계/시간축 충돌 후보가 있으면 정확한 문서 위치와 UNKNOWN 결정 질문만 인계하고 새 이름·설정·수를 확정하지 않는다.

## 산출과 완료 Gate

- 한국어 보고에 20행 cue 전표, resolver/Space/종료 source chain, 이전 오독 정정 표(과거 주장/근거/현재 판정/남은 UNKNOWN), canonical 보호 항목을 넣는다.
- docs 전체 관련 키워드 `rg` 후 총괄용 정확한 문서/section/추가 문안을 제안한다. 신규 `WORLDVIEW_CINEMATIC_CIN_LINES_20261002.md`가 필요하면 목적과 전표 문안을 보고서 안에서만 제안하고 shared docs 파일은 만들지 않는다.
- Gate: 19+1의 현재 source 근거, 실제 resolver와 fallback 확인/UNKNOWN 구분, Space 경로별 계약 구분, hell6/ready 오독 정정, WORLD_CORE TBD·19/35 개념 보호, 생산·UI·재생·검사 실행 0. source 확인을 실제 언어/음성/전투/영화 PASS로 쓰지 않는다.
- `evidence.json`에 `taskId=continuous-STORY-cin-lines`, 실제 provider·확인된 chat/sessionId(미확인 null), UTC/KST 시각, 실제 읽은 절대 경로·범위·source SHA, 실제 도구 이름·명령·exit·오류, 소유 출력 두 파일을 기록한다. 관련 스킬/API/MCP는 COMMON에 따라 필요할 때 사용하고 정확한 SKILL 경로·호출·결과를 남긴다. 미사용 도구를 사용으로 계산하거나 thinking/인증/개인정보/프롬프트 원문을 쓰지 않는다.

완료 후 한 건의 결과·영향·검증 한계·다음 담당 의존성을 보고하고 다음 지시를 기다린다.
