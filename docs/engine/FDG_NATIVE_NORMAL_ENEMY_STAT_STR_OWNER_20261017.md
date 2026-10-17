> 2026-10-17 ENGINE WIP 현행: 실제 callback **9/25·미16**. 신규 격리 행동41/41과 신규 map 경계 static9/9만 인수 범위다. 원 첫 parse 실패는 보존한다. 이 WIP를 main/R/served·전체 게임 최신화 완료로 해석하지 않는다.

> 2026-10-17 p_dot_pool 현행: 원본 PASSIVES 식의 typed reader와 current binding 검사/실제 callback을 추가했다. 현재 map 8/25·미연결17이며, 이전7/18·6/19 등은 당시 기록이다. [계약·원 raw·첫 검수](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md). 실행판·전체 hurtE 완료 아님.

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


## p_dot_pool 실제 소유자 추가 — 2026-10-17

| 항목 | 현행 소스 계약 |
|---|---|
| 원식 / API | Formula.p_dot_pool()->Dictionary(0): 기존 _container PASSIVES → 1+_passive_or0_mul(actualDict,"pDot",0.05) → 기존 _ok/_fail. 원 pDotPool @game.html:28068. 숫자·식·전역 상태 변경 없음. |
| binding 공개 검사 | Formula.is_passives_reader_bound_to(expected:Callable)->bool, Passives.is_current_passives_reader_bound_to(expected:Callable)->bool. 기존 bound/valid/Callable target·method/equality만 검사하여 추가 domain 조회·저장0. |
| 실제 bridge | Services.read_normal_enemy_dot_pool_multiplier()->Dictionary(0), 기존7 뒤 p_dot_pool. current Main/Services/Providers→같은 Formula/Passives/current_passives Callable/Script·binding을 전후 검사. Formula 1query, 정상 raw 같은 참조·원 status/metadata 유지. |
| 값 / 실패 | 유효Dict 필드 absent/null/falsy/NaN은 원 truthiness로1.0; owner 유실은1/{} 제조0. 기존 bound null→SOURCE_THROW 및 status 손실 경로 불변. invalid String/Infinity의 non_finite 보존; custom Object·전체 문자 grammar는 기존 부분 도메인 한계. context/객체·Script·binding post loss는 top NOT_READY/read_result 원 raw/최상위 numeric value0. |
| 현행 / 검수 | map8/25·미17, 25 presence 불변. 첫 신규 행동76/76+setup37/37 PASS/exit0/양로그 오류·leak0. 실제 Formula/Passives binding·정확 Services +명시 holder/current-reader stand-in 범위, 전체 State/Main·자연 수명·실전 미검증. setup bind query1/runtime query1과 실제 rawgrit/resource 부수조회未검증을 구분한다. |
| 다음 | V6 p_dot_pool scalar 전체4곳(170/173/566/570) typed 미지원·직결0. 첫 접점은170/173이다. 별도 consumer 인수 전 실제 kernel 등록/full25/full hurtE/latest 게임 완료0. |

상세는 [p_dot_pool 실제 소유자 계약](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 State/Providers getter 및 Q/E·저장·이전 승인 byte와 source sync 이력을 보존한다.


2026-10-17 사용처 정정: V6 p_dot_pool 전체는4곳(170/173/566/570, 원42163/42164/42426/42429)이며 첫 접점만170/173이다. 모두 not DOT이고, 뒤 두 곳은 각각 poisonDot/fireDot 어픽스값>0 및 해당 스택 write 후 결과<10에서 독립 조회한다. 각 지점 당시의 dmg×0.10 누적식·원 순서·lazy를 보존하며 네 곳 모두 typed 미전파다. [네 곳의 정확 조건](FDG_NATIVE_NORMAL_ENEMY_PDOTPOOL_OWNER_20261017.md)을 따른다. 원 API/코드·이전 PASS는 변경하지 않는다.


## 2026-10-17 ENGINE WIP: Main 소유 l_eq 이식

이 절은 현재 ENGINE WIP의 추가 구현 상태다. 기존 본문·동기화 checkpoint·과거 검수 결과는 해당 당시 기록으로 보존한다.

| 항목 | 현재 코드와 검증 상태 |
|---|---|
| 소유/최초값 | actual Main 인스턴스 하나를 native source-script context 하나로 대응하는 신규 설계. Main private Variant _source_l_eq_cache=null 선언 1회; Formula/Services/actor 교체는 초기화 사유가 아니다. |
| 실제 경로 | Main source-init 경계→Services weak current bridge→Formula.l_eq(stat)→Main-owned lazy query→State의 같은 actual INV/slot/item/special에 한정된 누락 필드 복원. 값은 actual legendarySpecial.val에서만 파생, 범용 setter 없음. |
| 순서/값 | cache={} 설치 후 INV/17 slot 순회. 첫 non-undefined, defined null/false/0/빈 문자열/NaN 보존·raw truthy 또는 숫자0. native 미표현 undefined/ToPropertyKey/prototype operand는 raw/prefix를 포함한 typed partial, retry/clear/rollback 없음. |
| cache hit/수명 | domain/INV/writer eager 조회 없이 새 metadata ownership guard. 같은 Main의 helper/actor 교체에도 cache 유지, 옛 caller와 Main 유실 거부. 기존 ordered affix/reference invalidation sink와 원 5개 reset 위치는 l_eq reset 권위로 확장하지 않음. |
| 등록/검수 | 현재 ENGINE WIP callback map **9/25·미16**. 기존8 뒤 실제 l_eq=Callable(self,read_normal_enemy_legendary_equipment) 하나를 추가했다. 원 첫 fixture parse 실패·행동0은 보존하고 header5줄만 수정한 새 namespace의 최초 신규 행동41/41 PASS도 별도 유지한다. 이번 등록 경계만 새 static9/9, 기존 행동·parser·static 검수 재실행0. 전체 hurtE 연결·실게임·main/R/served 반영은 미완이다. |
| 범위/한계 | full Main/Services.configure/State 자연 lifecycle·실 INV/save·원 JS boot/restore·게임/export/PC 최신판 완료 증거 없음. 초기 plan metadata에 불필요한 Q/E 선언·필드 및 Main876 Q currentOptions 할당 한 줄/Frame metadata도 포함됐으며 원본 보존·캐시 권위에서 제외. 실제 Q/E 실행·변경 없음. |

정확한 API·17 slot·최초 실패 로그·미소유 범위는 [Main 전설 장비 캐시 계약](FDG_NATIVE_MAIN_LEGENDARY_EQUIPMENT_CACHE_20261017.md)에 기록한다.
