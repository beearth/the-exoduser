INTEG-17b (2026-10-23)
기준 df828f88d39832bf140a7a8e46efbb5856c4626a + PC c8767624665cbde8f0fde0596da5c5cecc20b22c. 명시 fetch 및 ls-remote 일치. merge만 적용, 개선/수동 제품 코드 변경 없음.
충돌: docs/CHANGELOG_SYNC.md 1개, 양쪽 원문 모두 보존. 자동 병합 main.gd/boss_core/hurte의 기존 Mac 훅 유지. Mac UI/맵 기존 구현 유지.

| 인수 파일 | 리뷰 내용 |
|---|---|
| hud.gd | 키 캡 13슬롯·패드/KBM 이벤트 전환·바인딩 표기, 기존 UI 위치 유지 |
| main.gd | 패링 보상 커밋 후 통계, player_damage 통계 |
| native_demo11_boss_core.gd | 보상 성공 때 parries 증가, 기존 코어 유지 |
| native_demo11_life.gd | 틱당 2 감소·원문 부활력/JS 숫자·쓰러짐 레이어4·deaths |
| native_forge_panel.gd | AI 강화 버튼/대상/예산/결과·저장 연결·천 단위 표기 |
| native_m29_contact_services.gd | 실제 패링 보상 뒤 세션 통계 |
| native_meta_enhancement_transaction.gd | 원본 순서 AI 강화 거래·시도당 RNG 1회 |
| native_normal_enemy_hurte.gd | crits/dmgDealt/maxHit, 기존 귀속 훅 유지 |
| native_source_new_run_state.gd | _sStats 14키 초기화·증분·이동거리 및 AI 거래 소유 |
| native_source_player_initialization_services.gd | PHYS_STEP 1000/60·0..50ms·5step 상한 누산기·이동 통계 |
| tests 07/starter_state/pcia_wire_life | Main 도착 또는 60초·_sStats 키·틱당2 기대값 인수 |

PC 신규 AI 시험/관측 도구와 관련 docs도 원문 인수. 번역 목록 변경 없음; 문서 충돌은 byte 단위 줄 보존으로 해결, CRLF 정규화 없음. docs 전체 키워드 검색 목록 및 Mac 10파일 diff는 외부 산출물에 보존. 틱 경로 목록 API/ResourceLoader/매틱 할당을 추가하는 수동 변경 없음. PC 원변경의 기존 스냅샷/바인딩 리더 호출은 그대로 인수하며 성능 재검증 범위 아님.
실제 패드·Windows 실행·이미 열린 사용자 실행본 갱신은 미확인. PC 보고의 에너지쉴드 흡수/SFX/입력모드 저장 등 남은 차이는 그대로 보존.

검증: import 첫1회 성공 ERROR0. 테스트 재실행0; 모두 각1회. PC storage off, 07/04/intro/E2E storage on. 고유 격리 namespace 및 임시 override 원byte 복원, 실제 사용자 저장 폴더 미접근. 07은 캡처용 창 모드, 나머지 headless. 자기 Godot 전부 종료, PID81277만 잔존·미조작. 캐시 복제0.

| 테스트 | exit | 오류 | 결과 | 소유 |
|---|---|---|---|---|
| import1 | 0 | 0 | import 완료 | 통과 |
| test_demo11_07_lobby_entry | 0 | 0 | DEMO11_07_RESULT assertions=56 failures=0 | 통과 |
| test_native_main_source_starter_state | 2 | 1 | ERROR: STARTER_INVALID_ISOLATION /Users/fordeargamers/Library/Application Support/EXODUSER-demo11-Isolated-INTEG17b-1792691743122559000 | 인수 실행 조건 오류: 전용 ISOLATED_DIRECTORY 불일치, 코드 회귀 판정 불가 |
| test_pcia_wire_life | 0 | 0 | "checks":13, "failures":0 | 통과 |
| test_parity_hud_01 | 0 | 0 | "checks":17, "failures":0 | 통과 |
| test_pc_combat_kill | 0 | 0 | "assertions":47, "failures":0, "assertions":21 | 통과 |
| test_pc_boss_parity | 0 | 0 | "assertions":44, "failures":0 | 통과 |
| test_pc_move_skills | 0 | 0 | "assertions":271, "failures":0, "assertions":16 | 통과 |
| test_demo11_04_lobby | 0 | 0 | "checks":55, "failures":0 | 통과 |
| e2e_parity_intro_01 | 0 | 0 | "failures":0 | 통과 |

E2E: --demo11-storage=on, 새 --isolated-userdir, 주입0, 단1회. {'FAIL': 1, 'NOT_READY': 7, 'PASS': 10}; overall FAIL. 기존 13/5/0과 다르며 종주 통과 아님.

| 순서 | 단계 | 결과 | 사유/소유 |
|---|---|---|---|
| 1 | isolation | PASS |  |
| 2 | new_game | PASS |  |
| 3 | character_create | PASS |  |
| 4 | intro_skip | PASS |  |
| 5 | field_MAP11 | PASS |  |
| 6 | enemy_kill | PASS |  |
| 7 | item_pickup | PASS |  |
| 8 | equip | PASS |  |
| 9 | auto_potion | PASS |  |
| 10 | level_up | NOT_READY | natural combat XP did not level up (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 11 | stat_passive_invest | NOT_READY | growth/applyStats/queue owner not ready (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 12 | revival_interface | PASS |  |
| 13 | bossroom_gate | NOT_READY | actual MAP11 gate/arena prerequisites not satisfied (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 14 | boss_defeat_signal | NOT_READY | PCI-11_missing_actual_boss_damage_and_final_death_owner (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 15 | clear | NOT_READY | clear consumer did not accept contract (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 16 | demo_end | NOT_READY | next/end route not admitted (런타임 진행/선행조건 owner; 후속 단계 미도달) |
| 17 | save_handoff | FAIL | 저장/E2E 계약 owner 검토: receipt committed·disk found이나 player/lv 일치 조건 false; 세부 원인·회귀 여부 미확정(기준선 재실행0) |
| 18 | lobby_return | NOT_READY | actual lobby navigation not completed (런타임 진행/선행조건 owner; 후속 단계 미도달) |

R tracked INDEX/WORK 초기 clean, R Godot0. main push/force/reset/rebase0. 정상 hook 유지. 소스 merge 인수와 런타임 검증 미달을 구분한다.
