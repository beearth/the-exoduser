# DEMO11-47k — Mac gate/family/spawn caller

부분 완료. 기준 8bcf8b8403992bce31d21c11d1e9ebf02bcc30a9 (b07f5c56 통합 위), 별도 sparse worktree/branch. R 읽기 전용. Git SHA/원격 readback은 외부 DONE.txt 참조.

## 구현 및 한계

- MAP11 provider에 FieldbossMarkers/Angler0..3을 기존 west_upper/east_upper/early/east_lower 저작 좌표에서 설치. 각각 region0..3 및 반경44 적법성 확인. provider current의 immutable Marker 검사 포함. Main이 기존 실제 family owner에 bind하여 4앵글러 실제 생성/World phase tick까지 관측.
- 실제 transport 입장 호출자가 현재 OPT.diff/G._stageDiffOff/room0을 spawn_options로 전달. encounter는 실제 spawn contract의 canMv 전에 기존 World arena 공간을 활성화하고 실패 시 field로 복귀. Entry/Boss Marker, R1700, arena offset(0,-8000) 및 원 지역80%/필드보스 전제 유지.
- E2E는 실제 Gate Marker 접촉 위치에서 제품 request_transition 호출, receipt 및 실제 region/family/boss readback 기록. flags/HP/final signal/ack 주입0.
- **bossroom_gate PASS 미달.** 기준 브랜치에는 native_demo_anglers.bind_pc_source의 실제 HP/final readback owner가 없다. 실제 앵글러 처치에서 _fbDone이 되지 않으므로 원 규칙을 지키면 gate는 열리지 않는다. 보스 source_updateE_prefix owner도 미바인딩. 따라서 실제 개방/입장/보스 자연 스폰/AI tick/HP 감소는 모두 미관측이며 이 코드를 완료로 인수할 수 없다. 보스 최종사망 PCI-11/부활 PCI-01은 그대로 NOT_READY.

## 검증

제품 집중 테스트 10 PASS / 0 FAIL: 실제 Marker4/각 지역·반경 적법성4/family provider/실제 family 생성/실제 tick/locked gate 거절/no premature boss. import ERROR0. 관련 테스트와 E2E는 격리 user dir, Godot 동시1 이하. 실제 저장 폴더 접근0. 18단계 E2E 정확히1회, 10 PASS / 8 NOT_READY / 0 FAIL, engine ERROR0. 후행 clear/end/save/return을 가짜 통과시키지 않으며 이전47j 보고의 후행 PASS를 현재 결과로 재사용하지 않음.

| stage | status |
|---|---|
| isolation | PASS |
| new_game | PASS |
| character_create | PASS |
| intro_skip | PASS |
| field_MAP11 | PASS |
| enemy_kill | NOT_READY |
| revival_interface | NOT_READY |
| item_pickup | PASS |
| equip | PASS |
| auto_potion | NOT_READY |
| level_up | PASS |
| stat_passive_invest | PASS |
| bossroom_gate | NOT_READY |
| boss_defeat_signal | NOT_READY |
| clear | NOT_READY |
| demo_end | NOT_READY |
| save_handoff | PASS |
| lobby_return | NOT_READY |

physics callback span max **14.035ms**, **예산8.333ms 초과·성능 기준 미달** (headless wall CPU span; GPU/실창 성능 증명 아님). source_clock/PC HALT는 완화하지 않았다. 전체 출력은 외부 _out/DEMO11-47k 파일. 결과 출력은 판정 수/성능 위주로만 조회. 코드 변경 후 docs 전체 tracked keyword 검색 및 관련 engine SSOT/상태표/CHANGELOG 반영.

## MAP PRODUCTION REPORT

STAGE: MAP11 runtime 연결. MASTER: 기존 silhouette/regions/main route/side spaces 보존. OUTER MASS LEFT/RIGHT/TOP/SOUTH/major holes: 변경0. LARGE source/composite/overlap/repetition: 변경0. MEDIUM connections/holes: 변경0. GROUND shadow/contamination/integration: 변경0. PLAYABLE: Marker별 반경44 검증, 원 지역/FB gate 정책 유지; 실제 arena entry 미관측. LANDMARK primary/secondary/tertiary: 변경0. CAMERA QA START/EARLY/ARENA/SIDE L/SIDE R/LANDMARK/LATE/EXIT: 미수행. TECH QA route/collision: Marker legal 및 locked gate 차단; actual open path 미검증; pageerror/404/seam: 해당 웹 검수 미수행; loading: import ERROR0; performance 위 수치. FILES: runtime provider/Main/transport/encounter/tests 및 engine docs, 비주얼 파일 변경0/concurrent touched0/unrelated touched0. GIT: 자기 경로만 add·정상 hook commit·자기 branch push; deploy0. VISUAL VERDICT: RETOUCH (화면 미검수로 PASS 불가). NEXT PASS: physics span 초과 원인 분리·성능 재검증 및 실제 PC fieldboss HP/final readback + boss prefix/damage owner 인수 후 자연 처치→gate→arena→boss AI/HP 관측. main/PC 동기화 완료 주장0.
