# Mac 작업 지시서 — 2026-10-20 (총괄: PC Claude 세션 "Godot PC/Mac 이식 작업 지침")

> **먼저 [공동 작업판 WORK_BOARD.md](WORK_BOARD.md)를 읽고, 작업 시작·종료 시 그 표를 갱신하세요.** 누가 어떤 파일을 소유하는지가 거기 있습니다.

사용자 지시(2026-10-20): "니가 총괄하고 단순업무같은것들은 다 코덱스를 시켜", "맥북으로 거의다 시키면 좋아 이컴퓨터는 최대한 안쓰고".
→ 실행·테스트·구현은 **Mac**(Codex in VS Code, 맥 Claude 세션)에서. PC는 총괄 검수·문서·병합만.
이 문서의 작업을 **위에서부터 순서대로** 하세요. 보고는 한국어로.

## 공통 규칙 (반드시)
- 프로젝트: EXODUSER 웹 원본(`game.html`)을 Godot 4.7.2로 원본 기능·수치·체감 그대로 이식 중. 원본 행 번호 근거 필수, 수치 임의 조정 금지, 가짜 구현·가짜 PASS 금지.
- 기준 체크아웃 R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`은 **건드리지 말 것**(브랜치 전환·커밋 금지). 작업마다 새 worktree:
  ```
  cd /Users/fordeargamers/Projects/exoduser-migration-20261001
  git fetch origin
  git worktree add -b codex/<작업ID>-20261020 ~/exoduser-wt/<작업ID> origin/main
  ```
  그 worktree의 `godot/`에서 Godot import 1회: `"$FDG_GODOT_BIN" --headless --path . --import` (FDG_GODOT_BIN이 없으면 godot/run.command의 후보 순서: /Applications/Godot.app/Contents/MacOS/Godot → ~/.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot). **4.7.2가 아니면 멈추고 보고.** 과거 Mac 사고: 앱 복사본 서명 문제(AMFI SIGKILL)·전역 editor settings 오염 — 원본 앱만 쓰고, import 전 `~/Library/Application Support/Godot/`를 `~/exoduser-wt/_backup/godot-appsupport-<날짜>/`로 복사.
- 커밋은 자기 브랜치(`codex/...`)에만, **push는 자기 브랜치만 허용, main push·병합 금지**(총괄이 검수 후 합칩니다). 스테이징은 경로 지정(`git add -- <경로>`), `git add -A` 금지. 테스트 파일은 루트 .gitignore `test_*`에 걸리므로 `git add -f`.
- 헤드리스 테스트: `cd <worktree>/godot && "$FDG_GODOT_BIN" --headless --path . --script res://tests/<파일>.gd > <로그>.out 2> <로그>.err`. Main을 부팅하는 테스트는 **격리 사용자 폴더 필수**: `godot/override.cfg`에
  ```
  [application]

  config/use_custom_user_dir=true
  config/custom_user_dir_name="<격리이름>"
  ```
  를 쓰고 실행 → 끝나면 비우기(커밋 금지). 실제 저장 폴더 `EXODUSER-Godot-Native-First` 사용 금지. 테스트 상수 `USERDIR`/`ISOLATED_DIRECTORY`가 있으면 그 이름.
- 원로그·산출물: `~/exoduser-wt/_out/<작업ID>/`. 큰 임시물은 쓰고 지우기.
- 실패하면: 원로그 보존 → 원인 진단 → 최소 수정 → 바뀐 범위만 재검증. 통과한 검사 반복 금지.
- **각 작업 끝에 보고서**를 자기 브랜치의 `docs/engine/orders/reports/<작업ID>_REPORT.md`로 커밋·push: ①원본 근거 ②변경 파일 ③테스트(명령·수치·로그 경로) ④커밋 SHA ⑤남은 것/막힌 것. 총괄이 PC에서 fetch해 검수합니다.

### 지금 다른 담당(PC)이 작업 중 — 건드리지 말 것
- `godot/scripts/native_parry_lesson_flow.gd` 등 레슨 파일, player.gd·main.gd의 입력 처리 함수
- `godot/scripts/native_skill_slots.gd`, `native_source_player_regeneration_phase.gd`, player.gd·main.gd의 리젠 배선
- `godot/scripts/native_normal_enemy_hurte.gd`(공용 피해 집행자 — 수정 필요하면 보고서에만)

---

## 작업 1 — QA-001 기존 실패 테스트 원인 진단 (`codex/qa-001-20261020`)
main 기준으로 원래부터 실패하는 테스트들이 제품 결함인지 하니스 문제인지 가린다. PC 기준선(Windows):
| 테스트 | 격리 이름 | PC 기준선 |
|---|---|---|
| test_native_main_source_player_initialization | EXODUSER-MainSourceInitialization-Isolated-20261014 | 117검사/2실패 (movement_damage_preserves_source_speed) |
| test_native_main_source_starter_state | EXODUSER-MainSourceStarter-Isolated-20261014 | 145/2 |
| test_encounter_factory | EXODUSER-QA001-Isolated-20261020 | 3실패 |
| test_etype0_physical_flesh_crawler | EXODUSER-QA001-Isolated-20261020 | 1실패 |
| test_etype4_physical_spine_beast | EXODUSER-QA001-Isolated-20261020 | 1실패 |
| test_etype4_ice_soul_flame | EXODUSER-QA001-Isolated-20261020 | 3실패 |
| 자원 authority 테스트(godot/tests에서 `authority` 검색) | 테스트 상수 | 71/6 |
먼저 Mac에서 같은 수치가 나오는지 기록(PC와 다르면 그 자체가 중요한 발견). 그다음 실패마다 판정 표(테스트/실패명/판정: 제품 결함·하니스·낡은 기대값/근거). 하니스·낡은 기대값만 원본 근거로 고치고(검사 약화 금지), 제품 결함은 수정안만 보고. 회귀: 위 7개 + test_contracts·test_p1002e_melee_hurte(EXODUSER-P1002E-Isolated-20261019).

## 작업 2 — MAC-VERIFY 최근 통합분 Mac 실행 확인 (`codex/mac-verify-20261020`, 커밋 불필요하면 보고서만)
PC에서 통과한 테스트가 Mac에서도 같은지 확인: test_p1002e_melee_hurte, test_p1002f_dedicated_hurte(EXODUSER-P1002F-Isolated-20261020), test_p1002g_kislash_hurte(…P1002G…), test_p2001a_hit_feedback(…P2001A…), test_p2001b_death_fx(…P2001B…), test_p2001c_kill_rewards(…P2001C…), test_p2001h_curtain_spawn(…P2001H…), test_p2001i_boot_intro(…P2001I…), test_p2001j_lesson_clock(…P2001J…), test_p2001k_lesson_practice(…P2001K…), test_p2002a_hud(…P2002A…), test_p2002b_minimap_corner(…P2002B…), test_p2003a_lighting(…P2003A…), test_p2004a_pets(…P2004A…), test_p2005a_start_skills(…P2005A…), test_p2005b_giant_slam(…P2005B…), test_p2005c_spike_holy(…P2005C…) — 격리 이름은 각 테스트 상수 우선, 없으면 `EXODUSER-<ID>-Isolated-20261020` 형식. 표로 PC 결과와 비교. **실제 창으로 godot/run.command 실행해 부팅→인트로→커튼→첫 전투 30초 화면 녹화**(Mac 실플레이 인수 증거) — 경로만 보고.

## 작업 3 — P3-001 맵 pit_poison 타원 충돌 계약 (`codex/p3-001-20261020`)
웹 원본 main ffc907514(MAP-021)에서 1-1 동측 독 웅덩이 `pit_poison` 충돌이 원(반경 80) → 타원(colW80·colH58·colOy7, 중심 6500,5587)으로 바뀜(`_OBJ_META.pit_poison`). `engine/fdg/map-source-adapter.js` v7 delta 계약(약 662~673행)은 "circle radius80"만 받아 재추출 시 거부됨. 계약을 원본 타원 형태로 갱신하고 재추출·Godot 충돌 데이터가 원본과 같은지 확인. 맵 지형·배치·다른 충돌 변경 금지. node 테스트(`test/` — fdgNativeHandColliderDelta 등) + Godot 맵 테스트 회귀. 문서: docs/4.1맵디자인+설정/MAP_IMPROVEMENT_PROJECT.md 결정 기록·CH1_LIVING_DETAIL_RUNTIME_20260925.md §MAP-021.

## 작업 4 — P2-004b 펫 대사 카테고리 (`codex/p2-004b-20261020`)
P2-004a가 펫 4종·대사 엔진·튜토리얼 11종·긴급 2종을 `godot/scripts/native_pets.gd`에 이식함(문서 docs/engine/FDG_P2_004A_PETS_20261020.md, 설계 docs/2_4 펫시스템/). 남은 대사 카테고리(약 160종)를 **원문 그대로** 이식. 트리거가 미이식 시스템에 묶인 대사는 데이터만 넣고 "미연결"로 표에 기록(가짜 트리거 금지). 새 텍스트 금지. 검증: test_p2004a_pets 회귀 + 신규 테스트(카테고리별 트리거→선택·쿨다운·우선순위 원본 일치). 보고서에 카테고리별 표.

## 작업 5 — P3-003 지역 시스템 (`codex/p3-003-20261020`, Codex 총괄이 다음 빈 Codex에 배정)
웹 대조에서 미니맵 필드보스 사이트 4점(_FB_SITES×ELC색)·지역 처치(_regCur)·G._regions=true 지역 시스템이 Godot에 없음(P2-002b 보고). 원본 지역 시스템(지역 경계·클리어 틴트·필드보스 사이트·자물쇠·지역 처치 분모·지역 제목 #areaTitle 연출)을 행 근거로 추적해 이식. 필드보스 전투 자체는 범위가 크면 사이트 표시·진입 감지까지만 하고 경계 보고. 소환굴(P3-002, 클라우드)과 G._totalSpawned를 함께 쓰니 작업판의 소유 파일을 확인하고 겹치면 보고서에. 검증·보고 규칙 동일.

---
## 배정 변경 (2026-10-20 Claude 총괄)
- 작업 1(QA-001)·3(P3-001)·4(P2-004b)는 **PC Codex가 수행 중**(브랜치 codex/qa-001-pc-20261020·codex/p3-001-pc-20261020·codex/p2-004b-pc-20261020). **Mac에서는 하지 말 것.**
- Mac Codex 배정: ttys001 = 작업 2(MAC-VERIFY), ttys002 = 작업 5(P3-003 지역 시스템), ttys003 = 작업 6, ttys004 = 작업 7.

## 작업 6 — DOC-SYNC 오늘 통합분 docs 동기화 감사 (`codex/doc-sync-20261020`)
CLAUDE.md 'docs/ 동기화' 절대 규칙 적용. 오늘 main에 들어간 Godot 이식 작업(계획 문서 작업표 P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d)이 건드린 게임 수치·이름·공식이 docs/의 설계 문서(2_1 스킬, 14밸런스, 2_4 펫, 2_7 인벤토리, 7아이템, 3.1 UI, 5.1 임팩트, 6사운드 등)와 **원본 game.html 기준으로** 일치하는지 전수 대조. 불일치는 원본 코드 기준으로 문서를 정정하고 근거 행을 남긴다(코드는 수정 금지 — 원본 game.html이 기준). 결과 표(문서/항목/문서값/원본값/조치). docs/2_3(수정금지)은 설계 변경 없이 사실 표기만 대조하고 고칠 게 있으면 보고서에만.

## 작업 7 — FEATURE-INVENTORY 전체 기능 분모 표 (`codex/feature-inventory-20261020`)
계획 문서가 "전체 기능 분모가 없어 진행률·ETA를 표시하지 않는다"고 한 공백을 메운다. 원본 game.html·index.html·docs 기준으로 **플레이어가 체험하는 기능 단위 목록**(전투·스킬 종류별·몬스터 etype별·보스 19·맵 7장 35에리어·아이템/어픽스·인벤/장비·상점/NPC·진행/화폐/강화·세이브·설정/키바인딩·UI 화면·사운드·연출·로비/캐릭터 선택·컷신 등)을 만들고, 각 항목의 Godot 이식 상태를 실제 godot/ 코드·테스트·계획 문서 작업표로 판정(없음/일부/완료(격리 검수)/실플레이 인수). 판정 근거(파일·테스트·작업ID)를 칸에 적고 추정은 '미확인'. 결과: docs/engine/FDG_FEATURE_INVENTORY_20261020.md. 진행률은 항목 수 기준 단순 비율만(가중치·ETA 금지).
