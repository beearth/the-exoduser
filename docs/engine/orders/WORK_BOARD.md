# 공동 작업판 (Claude 총괄 ↔ Codex 총괄) — 단일 기준

> 이 문서가 **지금 누가 무엇을 하는지의 유일한 기준**이다. 새 작업을 시작하거나 끝낼 때 양쪽 총괄 모두 이 표를 먼저 읽고 갱신한다(경로 지정 커밋, 문서만 main 직접 push 허용).
> 상위 계획: [FDG_GAME_DEVELOPMENT_PLAN.md](../FDG_GAME_DEVELOPMENT_PLAN.md) · 사용자용 현황: [FDG_GODOT_PORT_STATUS.md](../FDG_GODOT_PORT_STATUS.md) · Mac 지시서: [MAC_ORDERS_20261020.md](MAC_ORDERS_20261020.md)

## 역할 (2026-10-20 사용자 지시 기준)
| 역할 | 누구 | 하는 일 |
|---|---|---|
| Claude 총괄 | PC Claude 세션 "Godot PC/Mac 이식 작업 지침" | 작업 배정·검수(원본 행·테스트 독립 재실행·화면 1x 확인)·main 병합·계획/현황 문서 |
| Codex 총괄 | Mac Codex(ROOT/ENGINE) | Mac 쪽 Codex 작업 배정·진행 관측·Mac 실행 인수, 이 표 갱신 |
| 맥북총괄 | Mac Claude 세션 | Mac 검증(실창 플레이·녹화), Codex 터미널 진행 관측·SHA 보고 |
| 실행 원칙 | 사용자 | "맥북으로 거의다", "단순업무는 코덱스", "토큰도 다 쓰고 환경도 다 쓰고" |

## 공통 규칙
1. **main 병합은 Claude 총괄만**(검수 후). 다른 모두는 자기 브랜치(`codex/…`, `claude/…`)에 커밋·push만.
2. 작업 시작 전 아래 "진행 중" 표에 행 추가 + **소유 파일** 기재. 다른 행의 소유 파일은 수정 금지(필요하면 그 담당에게 요청 또는 보고서에 기재).
3. 작업 끝 = 보고서(`docs/engine/orders/reports/<작업ID>_REPORT.md`, 자기 브랜치) + 이 표의 상태를 "검수 대기"로 + 브랜치명·SHA 기재.
4. 원본 행 근거·수치 무조정·가짜 PASS 금지·원본 에셋 바이트 복사·격리 사용자 폴더·2_3/Q·E/세이브 불변 — 계획 문서 규칙 그대로.
5. 같은 일을 두 곳에서 하지 않는다. 비어 보이면 표를 먼저 확인.

## 진행 중 (2026-10-20 갱신: Claude 총괄)
| 작업ID | 내용 | 담당·환경 | 브랜치 | 소유 파일(다른 담당 수정 금지) | 상태 |
|---|---|---|---|---|---|
| DOC-SYNC | 오늘 통합분 원본 수치·설계 docs 동기화 감사 | PC Codex | codex/doc-sync-pc-20261020 | DOC-SYNC_REPORT.md 및 설계 문서10개 정정 구역(2_3 제외) | **검수 완료·main 병합(Claude 총괄)** — 설계 문서 10종 원본 기준 정정, 코드 무변경. 2_4는 P2-004b와 충돌 → 상세 문장 유지+정정 주석 |
| P2-001l | 패링 연습 단계 0~7·입력 제한(allows) | PC heavy 담당 | claude/p2-001l-lesson-steps-20261020 | native_parry_lesson_flow.gd 등 레슨 파일, player.gd·main.gd 입력 처리 함수 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 병합본 독립 재실행 9종 0실패(L·K·H·J·QE·5c·HUD·지역·시작스킬), 화면 RETOUCH·step1~7·챕터2 미이식 |
| P2-006a | 드랍 바닥 표시·줍기·인벤 반입 | PC heavy 담당 — **Claude 사용 한도로 중단**(작업 폴더 G:\exoduser-wt\p2-002a-hud에 진행분 보존) | claude/p2-006a-drop-pickup-20261020 | 드랍 렌더·줍기 신규 스크립트 | **기능 완료·main 병합 / 디자인 미검수(RETOUCH)** — 총괄 독립: world_drops 18/0·pickup_contract 17/0·HUD 36/0·시작 스킬 27/0. 원본 에셋 189개 해시 일치(Codex). 처치 직후 캡처에서 드랍이 피 효과에 가려 판독 불가 → P2-006b 화면 마감 | |
| TRACE-META | 3.2 메타·진행·14 밸런스 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-15cb(MAC-LIVE에서 전환) | codex/trace-meta-20261020 | FDG_SOURCE_TRACE_META_20261020.md | 진행 중 |
| P2-006b | 드랍 화면 마감(피 효과 후 판독 캡처·라벨/빔 1x)·캡처의 LMB 슬롯 빈 칸 원인 확인 | PC VS Code Codex 4(P2-001l 후) | codex/p2-006b-pc-20261020 | native_world_drops.gd 표시부 | 배정 |
| P3-002 | 소환굴 시스템·후속 스폰·지역 처치 분모 | 클라우드 세션 cloud-spawnholes | claude/p3-002-spawn-holes | 소환굴 신규 스크립트, world 동적 등록 호출부 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 지역 초기화 순서 원본 31655 정정, 298/0·회귀 10종 0실패 |
| P2-007a | UI 마감: 원본 글꼴(나눔명조·Cinzel)·검기 색·인트로 가이드 패널 | 클라우드 세션 cloud-ui-polish | claude/p2-007a-ui-polish | assets/fonts, crescent.gd 색, 인트로 가이드 패널 | 시작 요청됨 |
| MAC-VERIFY | 최근 통합분 Mac 헤드리스 테스트 | Mac VS Code Codex 01a1586e-c1b7 | codex/mac-verify-20261020 (394c01388) | 없음 | **검수 완료·보고서 main 반영(Claude 총괄)** — 17종 실패 0, p1002e 검사 수 변동은 시작 장비 RNG(기지), stderr ERROR 3종은 QA-002 |
| QA-002 | 테스트 결정성(시작 장비 시드, 테스트 한정)·p2005b/c 종료 누수·p2003a dummy 텍스처 ERROR | Mac VS Code Codex 01a1586e-c1b7(맥북총괄 배정) | codex/qa-002-20261020 (e6f414b6 실행 merge) | 테스트10개(시드9·조명1), QA-002 보고서; 제품 파일 수정 금지 | 검수 대기·제품 회귀 보고 — main9528ea35 통합; G48·지역23/60/53/32·HUD0/32, 신규29회중27통과/검기2회220·1실패; etype20 poise owner HALT42490 실측; seed9종 분모 일치·D5회22/0·조명10/12·B/C종료0; 제품 수정0 |
| P5-001a | Mac 실행판·macOS export 점검 | Mac VS Code Codex 01a1586f-09bf | codex/p5-001a-mac-20261020 (67d625aaa) | 없음 | **검수 완료·보고서 main 반영** — Mac 네이티브 실행 CONFIRMED, 화면 관찰은 Godot 앱 제어 권한 미승인으로 BLOCKED, macOS 프리셋·4.7.2 export 템플릿 없음 |
| MAC-LIVE | Mac 실창 첫 전투 녹화 | Mac Codex(trace-meta로 전환) | codex/mac-live-20261020 (8b727b15b) | 없음 | BLOCKED — Godot 앱 제어 미승인으로 게임 창 녹화 불가. 부팅 렌더(Movie Maker 30초) 정상, 엔진 FPS 평균 138·최저 45(36표본) |
| MAC-TESTSWEEP | MAC-VERIFY 외 godot/tests 32종 Mac 헤드리스 | Mac VS Code Codex 01a1586f-2389 | codex/mac-testsweep-20261020 (cd6055eed) | 없음 | **검수 완료·보고서 main 반영** — 29 통과·3 미통과: starter_state 148/1(P3-003 병합 회귀, PC 재현 — STARTER-REGIONS 수정 배정), type3_spawn_recipe(외부 oracle 누락), windows_native_package(Windows export 전제) |
| STARTER-REGIONS | starter_state G 필드 수 기대값을 원본 지역 초기화 기준으로 정정(또는 제품 결함 보고) | Mac VS Code Codex 01a1586f-2389 | codex/starter-regions-fix-20261020 | test_native_main_source_starter_state.gd, STARTER-REGIONS_REPORT.md, 이 행만 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — P3-002 `_totalSpawned`(30625) 키 1개 추가 반영, 148/0 |
| TRACE-INVENTORY | 2_7 인벤토리·장비 원본 전수 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-09bf(18:32 착수) | codex/trace-inventory-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| TRACE-QUICKSLOT | 2_8 퀵슬롯·물약 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-5597(18:32 착수) | codex/trace-quickslot-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, 이식 단위 7개 |
| TRACE-SAVE | 15 세이브·데이터 원본 추적·이식 설계(세이브 형식은 보호 범위 표시만) | Mac VS Code Codex 01a158a5-5a79(18:32 착수) | codex/trace-save-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, SV-CONTRACT부터 이식 |
| TRACE-SETTINGS | 3.3 키바인딩·설정 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6274(18:32 착수) | codex/trace-settings-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, S01~S10 이식 순서안 |
| TRACE-REVIVE-SHIELD | 2_5 부활·에너지쉴드 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6b36(18:32 착수) | codex/trace-revive-shield-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| QA-001 | 기존 실패 테스트 7종 원인 진단 | PC Codex(codex exec) | codex/qa-001-pc-20261020 | 지정 테스트 7종 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 실패 18건+스크립트 오류 1건 해소, 제품 코드 0줄, 총괄 독립 재실행 7종 0실패 |
| P3-001 | 맵 pit_poison 타원 충돌 계약 | PC Codex(codex exec) | codex/p3-001-pc-20261020 | engine/fdg/map-source-adapter.js, godot/data/map.json, 맵 계약 테스트 | **검수 완료·main 병합(Claude 총괄 대리 커밋 3081760c5)** — Godot 195/195·Node 10, 실창 미검증 |
| P2-004b | 펫 대사 카테고리 160여 종 | **PC Codex**(codex exec) | codex/p2-004b-pc-20261020 | native_pets.gd 대사 테이블 | **검수 완료·main 병합(Claude 총괄)** — 원문 171/0, 대사 822/0, 런타임 10/0, 펫 회귀 20/0, Node 1/1(총괄 독립). 선언 연결 60·데이터 전용 111, 자연 발화 전체·실화면 미검증 | |
| P3-003 | 지역 시스템 | Mac Codex ENGINE(채택) + PC 총괄 통합 | codex/p3-003-20261020 → main | native_regions.gd 등 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 42702 _regKill 연결 포함 |
| FEATURE-INVENTORY | 전체 기능 분모 표·이식 상태 판정 | **PC VS Code Codex 1**(P3-003 중복 배정을 중단하고 전환 — P3-003은 Mac ENGINE 단독) | codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md | **main 병합(Claude 총괄 2026-10-20)** — 1,061행 분모, 완료(격리) 6·실플레이 0 |
| SV-CONTRACT | 세이브 5경로 key set 계약 테스트(제품 무변경) | Mac Codex 창6 01a158a5-5a79 | codex/sv-contract-20261020 | tests/test_native_save_contract.gd(신규) | 진행 중 |
| QS-01 | 퀵슬롯 1번 단위: 신규 계산 모듈+테스트(공용 0줄) | Mac Codex 창5 01a158a5-5597 | codex/qs-01-20261020 | 신규 모듈·테스트만 | 진행 중 |
| SETTINGS-S01 | 설정 원본 default 읽기 전용 view(source_options_state.gd 무수정) | Mac Codex 창7 01a158a5-6274 | codex/settings-s01-20261020 | native_settings_read_view.gd·test(신규) | 진행 중 |
| TRACE-WEAPONS | 2_2 무기·활·속성 원본 추적(문서만) | Mac Codex 창4 01a1586f-2389 | codex/trace-weapons-20261020 | FDG_SOURCE_TRACE_WEAPONS 문서 | 진행 중 |
| TRACE-BOSS-CH1 | 8.1 1장 보스 무브셋·HP·패턴 추적(문서만) | Mac Codex 창8 01a158a5-6b36 | codex/trace-boss-ch1-20261020 | FDG_SOURCE_TRACE_BOSS_CH1 문서 | 진행 중 |
| TRACE-SKILLS | 2_1 스킬·합체 원본 추적(문서만) | Mac Codex 01a1589e-e914 | codex/trace-skills-20261020 | 추적 문서 1개 | 진행 중 |
| TRACE-ITEMS | 7 아이템·어픽스 원본 추적(문서만) | Mac Codex 01a1589e-f8d5 | codex/trace-items-20261020 | 추적 문서 1개 | 진행 중 |
| P2-008a | 1-1 초기 미지원 적: etype20 빙결전사 exact 3개체(order4/10/12) | PC VS Code Codex | codex/p2-008a-ch1-enemies-pc-20261020 → main | enemy_melee_ch1_ice_warrior.gd·etype20 json·factory 등록 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 원본 39057~39060 빈 근접 분기·40499 _meleeET 제외·31154 _noProjEtypes[20] 확인(무공격 = 원본 동작), 병합본 14종 0실패, 지원 9/미지원 7, 화면·실플레이 미 |
| TRACE-CH1-ENEMIES | 1장 미이식 적 원본 추적(문서만) — PC P2-008a 구현과 겹치지 않게 P2-008a 범위는 참고만 | Mac Codex 01a1589f-0218 | codex/trace-ch1-enemies-20261020 | 추적 문서 1개 | 진행 중 |
| TRACE-SOUND | 6 사운드 원본 추적(문서만) | Mac Codex 01a1589f-0bf8 | codex/trace-sound-20261020 | 추적 문서 1개 | 진행 중 |

## 공용(누구도 단독 소유 아님 — 수정 시 최소 줄·보고 필수)

### FEATURE-INVENTORY PC 배정 (2026-10-20 사용자 최신 지시)

| 작업ID | 담당·브랜치 | 소유 파일 | 상태 |
|---|---|---|---|
| FEATURE-INVENTORY | PC Codex · codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md, docs/engine/orders/reports/FEATURE-INVENTORY_REPORT.md; 관련 계획 문서에 snapshot 링크만 추가 | 검수 대기 · 1,061행, 원본/근거3389참조·등록집합 대조. 정적 첫22통과/1서식실패 후 해당1검사만 수정·통과. 게임 실행/실플레이 인수 아님. P3-003은 Mac ENGINE 소유로 무수정. 커밋 SHA는 보고서 마감 단락/원격 ref에서 확인 |

FEATURE-INVENTORY 문서 체크포인트: `32492e498a3e5f53471c85eb6a6f752755b53000` / 브랜치 `codex/feature-inventory-pc-20261020`. 최종 판정 없음387·일부665·격리완료6·실플레이0·미확인3. 의미 검토의 보수화25행/집계 영향만 별도2검사군 통과(`classification-03.json`). 원본 HEAD 고정 snapshot이며 최신 main 전체 진행률로 사용하지 않는다.

`godot/scripts/main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`(공용 피해 집행자), `native_source_new_run_state.gd`(G/P 소유자)

## 검수·병합 완료 기록 (최근)
P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d — main ad7f15777까지. 상세는 계획 문서 작업표.

## 보존된 미완 작업 (현재 배정과 별도)

- Mac Codex ENGINE의 이전 `GODOT-INTEGRATE-DEATH-CORPSE-ONE-ENEMY-20261020`은 구 worktree(`codex/p1-002-audio-live-queue-20261018`, HEAD `3c5023a4`)에서 보존 마감했습니다. `world.gd`·`enemy_melee_flesh_crawler.gd`·신규 `native_normal_enemy_corpses.gd` WIP만 해당 구 worktree에 남아 있으며, 최신 main 파일의 소유권을 주장하지 않습니다. 담당 보고는 compile 통과, 실제 경로는 imported ctex 누락 실패이며 화면·양성 사망 인수 및 관련 docs 동기화는 미완료입니다. 신규 SHA·main 반영 없음. 원로그/변경 보존: Mac ENGINE의 `death-runtime-resume-20261020/PRESERVED-HANDOFF-20261020.json`. P3-003에는 섞지 않습니다.

## 공용 연결 요청 (미수정·총괄 조정)

- **P3-003 → PC Claude 총괄:** `native_normal_enemy_hurte.gd::_kill_pipeline`의 원본 42702 `stageKills` write 직후 실제 적을 `NativeRegions.record_actor_kill(_enemy)`의 원본 `_regKill` 대응 경로에 전달하는 약4줄이 필요합니다. MAC 지시서의 ‘공용 피해 집행자 — 수정 필요하면 보고서에만’에 따라 ENGINE는 이 파일을 수정하지 않습니다. PC 총괄이 삽입 또는 정확한 수정 범위를 확정해 주세요. 피해 계산·드랍·입력 변경은 요청하지 않습니다.
- **P3-003 ↔ P3-002:** 소환굴 확정 후 `NativeRegions.initialize_stage()`를 호출하는 연결 지점은 P3-002 담당·PC 총괄이 조정합니다. P3-003은 `_totalSpawned`·World 동적 등록에 쓰지 않으며, 실제 소환굴 분모가 없으면 미연결 상태를 그대로 보고합니다.

- **P3-003 환경 검증 기록:** 원앱 Godot 4.7.2의 첫 import에서 WT asset reimport·editor layout 완료 후 `~/Library/Application Support/Godot/editor_settings-4.7.tres` 저장 ERROR로 중단(exit −15). clean import PASS가 아닙니다. 원로그 `~/exoduser-wt/_out/P3-003/import-01.*` 보존, 추가 import·전역 설정 권한 확대 없이 생성된 자기 WT 캐시와 고유 격리 userdir로 실Main A/B 첫 검수 9assert/0fail·exit0·ERROR0을 확인했습니다(`actual-01.*`). Main HUD-bind 직후 배선 정정 후 `actual-order-02`(PID1015)도 9assert/0fail·exit0·ERROR0으로 보고됐습니다. override는 비웠고 editor_settings는 사전 사본과 exact hash 동일입니다. 실제 화면·전체 지역 전투 인수는 아직 없습니다.
- **P3-003 중복 방지:** 이 판의 담당은 기존 Mac ENGINE 단독입니다. PC 총괄의 FEATURE-INVENTORY 행에서 다른 P3 중복 배정 중단·전환을 확인했습니다. ROOT는 맥북총괄 관할 터미널에 별도 지시하거나 같은 지역 작업을 중복 배정하지 않습니다.

## P3-003 원격 제출 · PC Claude 총괄 검수 요청

- 브랜치 `codex/p3-003-20261020`, 원격 검수 SHA [`919f6a28ab4e64e8a07cd403551777d8dbc77e6a`](https://github.com/beearth/the-exoduser/commit/919f6a28ab4e64e8a07cd403551777d8dbc77e6a), [제출 보고서](https://github.com/beearth/the-exoduser/blob/919f6a28ab4e64e8a07cd403551777d8dbc77e6a/docs/engine/orders/reports/P3-003_REPORT.md).
- CLI push 최초 인증 실패는 원로그에 보존했습니다. ROOT가 공식 GitHub 연결로 등록된 8경로만 게시했으며 원격 branch ref·parent(base `efdbf76b`)·변경8경로를 확인했습니다. 로컬 최종 `8d7e67a66d5acb10e223191bec681692df080ab8`과 원격 전체 tree는 `ffb3443402e57613f238fbc36cbb25ede84eb223`로 동일합니다. 원격 API 커밋 SHA는 별도이며 로컬3커밋·INDEX/WORK는 변경하지 않았습니다. 강제 push·reset·main 코드 병합 없음.
- core27/0, 실제 Main 최초9/0 및 배선 정정9/0은 별개 검수입니다. 표시 최초6통과1실패·단일 기대값 수리1/0, import 종료 설정 저장 실패도 그대로 보존합니다. C 실제 처치·P3-002 확정 분모·필드보스 전투/효과·실창1x는 미완이므로 전체 지역 진행 완료가 아닙니다. 위 요청 연결점과 보고서를 PC 총괄이 검수·조정한 뒤 코드 main 병합을 결정합니다.
