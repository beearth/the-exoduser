# 일반 적 피해 stat_str 실제 소유자 연결 — 2026-10-17

현재 단위는 원본 능력치 상수의 typed 공개 API와 실제 Services callback 연결이다. 본편 전체 피해 consumer·실행판 교체·최신 게임 완료가 아니다.

| 항목 | 현재 계약 |
|---|---|
| 원본 값 | combat_stat_formula/producer.gd의 기존 public const STAT_STR = 1.0. 새 기본값·부재 폴백이 아니다. 원본 주석 locator game.html:28654를 보존한다. V5의 27993 locator와 원문을 새로 대조하지 않았다. |
| 새 formula API | stat_str()->Dictionary, 인자 0. 같은 formula 소유자의 기존 _ok(STAT_STR, "statStr()=STAT_STR@game.html:28654")만 호출한다. configure/P/INV/PASSIVES 값 읽기·새 상태·계산식 변경 없음. |
| READY 원형 | {"status":"READY","value":1.0,"non_finite":false,"source":"statStr()=STAT_STR@game.html:28654","undefined_reads":[],"reason":""}. value는 float. |
| Services API | read_normal_enemy_strength_multiplier()->Dictionary, 인자 0. current Main/Services/Providers 소유권 검사 후 현재 bundle.formula를 캡처하여 stat_str() 1회 호출한다. |
| query 후 검사 | 기존 current Main/Services/Providers 소유권을 다시 검사하고 새 bundle의 formula 객체 is_same 및 캡처한 Script identity/lifetime을 대조한다. |
| raw 전달 | 정상 소유권에서는 formula Dictionary를 복제·필터·상태 변환 없이 그대로 반환한다. source NOT_READY도 같은 Dictionary로 반환한다. |
| 준비 전 실패 | status=NOT_READY, reason=기존 소유권 오류 또는 actual_normal_enemy_stat_str_formula_unbound, provider=stat_str. numeric value를 추가하지 않는다. |
| query 후 소유권 실패 | status=NOT_READY, reason=actual_normal_enemy_stat_str_context_lost, context_reason=기존 검사 오류, provider=stat_str, read_result=원 Dictionary. 최상위 value 없음. |
| query 후 formula 교체 | status=NOT_READY, reason=actual_normal_enemy_stat_str_formula_changed, provider=stat_str, read_result=원 Dictionary. 최상위 value 없음. |
| callback getter | 기존 Main.get_native_normal_enemy_damage_provider_callbacks() → Services.get_normal_enemy_damage_provider_callbacks(caller). 기존 6개 뒤 stat_str를 7번째 등록. getter 자체의 실제 formula/domain query 0. |
| 현행 map | eq_affix, u_eq, p_atk_mul, melee_ref, parry_lesson_active, player_view, stat_str. 7/25 공개; 미연결 18. |
| 남은 consumer | 보존된 V5 stat_str 세 위치는 아직 float callback을 요구한다. 이 typed Dictionary를 V5에 직접 바인딩하지 않는다. 기존 ENEMY V6에서 원래 query 위치·lazy/order·raw·prefix/events/cursor를 보존하여 세 곳만 typed 처리해야 한다. |
| 미연결 유지 | 25 Callable presence 조건 보존. unused kernel 복사·dummy callback·부재를 0/1로 변환·preflight 우회 없음. |

## 새 영향 검수

| 검사 | 첫 실행 결과 / 한계 |
|---|---|
| 실행 | Godot 4.7.2 headless, 독립 user namespace, 첫 실행 25/25 PASS, exit 0, stdio와 Godot log 모두 오류·leak 진단 없음. |
| 실제 실행 코드 | 실제 full formula script 및 기존 affix dependency를 그대로 로드. 새 stat_str와 같은 소유자의 기존 _ok 실행. 기존 Q/E 계산 함수 호출 없음. |
| Services 범위 | 현행 getter/새 reader/기존 소유권 helper를 정확 추출. Main/actor/State/resources/Providers는 명시적 stand-in이다. 실제 full Main configure·자연 런타임·실제 gameplay는 미검증. |
| 포함 | 실제 1.0/float/6키 raw shape·출처, map 7개/순서/같은 Services 소유, getter bundle/player query 0, query 전후 fresh bundle, raw 동일성, source NR 보존, unconfigured/Main 유실/누락 method 거절, query 중 Services/formula/script 교체·formula 해제 거절. |
| 변경 보존 | formula의 기존 byte prefix와 Services의 이전 여섯 callback/소유권/dispatch body를 보존. 소스 상수·전투 수치·새 전역 상태 변경 없음. |
| 재검사 | 기존 성공 suite 0회 재실행. 이번 25개와 이전 단위의 같은 개수 검사들은 서로 다른 범위다. |
| 제품 한계 | source/WIP 연결만. 실제 V6/full25/full hurtE·공개 플레이·PC·Web export 최신화·visual/performance 완료 아님. latest_full_game=false/content_parity=INCOMPLETE 유지. |

앞선 현행 문서의 6/25·미19와 그 이전 5/20·4/21은 해당 제출 시점의 기록이다. 현재 등록 상태는 이 문서의 7/25·미18을 따른다. 과거 MAIN_SYNC 문서의 인수 pin/검사 결과는 수정하지 않는다.
