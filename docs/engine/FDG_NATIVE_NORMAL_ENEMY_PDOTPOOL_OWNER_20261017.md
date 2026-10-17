# 일반 적 피해 p_dot_pool 실제 typed 소유자 — 2026-10-17

현재 소스 연결은 8/25 callback·미연결17이다. 기존 V6의 p_dot_pool scalar 호출에 이 Dictionary를 직접 바인딩하지 않았다. 실제 본편·최신 실행판·전체 hurtE 완료가 아니다.

| API / 위치 | 현행 계약 |
|---|---|
| Formula.p_dot_pool()->Dictionary | 인자0. 기존 _container("PASSIVES",_passives_reader,_passives_bound,"pDot") → 실패는 같은 소유자의 _fail → 정상은 _ok(1.0+_passive_or0_mul(actualDict,"pDot",0.05),source). 새 상태·clock·기본 owner 제조 없음. |
| 원식 / 출처 | 확인된 독립 원함수 pDotPool @game.html:28068: 1+(PASSIVES.pDot\|\|0)*.05. source label은 pDotPool()=1+(PASSIVES.pDot\|\|0)*.05@game.html:28068. 기존 모든 원 수식·Q/E body 불변. |
| Formula.is_passives_reader_bound_to(expected:Callable)->bool | 기존 bound/valid 플래그와 Callable equality/get_object/get_method만 검사. 실제 reader/configure/current_status 호출0, 새 필드0. |
| Passives.is_current_passives_reader_bound_to(expected:Callable)->bool | 같은 방식으로 실제 bound current reader와 bundle의 current_passives Callable 일치를 확인. 조회·저장·clock0. |
| Services.read_normal_enemy_dot_pool_multiplier()->Dictionary | 인자0. 기존 current Main/Services/Providers owner 검사→현재 bundle.formula/passives/current_passives 및 양쪽 공개 binding 검사→Formula.p_dot_pool 1회→owner/fresh bundle/동일 Formula·Passives·reader Callable와 각각의 Script/life 및 binding 재검사. |
| pre 실패 | status NOT_READY/provider p_dot_pool/기존 owner 오류 또는 actual_normal_enemy_p_dot_pool_owner_unbound 또는 actual_normal_enemy_p_dot_pool_binding_mismatch. numeric value 폴백 없음. |
| post 실패 | context loss: actual_normal_enemy_p_dot_pool_context_lost/context_reason; 객체·Script·Callable 교체: actual_normal_enemy_p_dot_pool_owner_changed; binding 교체: actual_normal_enemy_p_dot_pool_binding_changed. 모두 provider p_dot_pool/read_result 원 Dictionary를 보존하며 최상위 value를 만들지 않는다. |
| 정상 raw | 기존 Formula의 status/value/non_finite/source/undefined_reads/reason을 복제·필터·상태변환 없이 같은 Dictionary로 반환. SOURCE_THROW/NOT_READY 역시 소유권 안정 시 원형 유지. |
| 노출 순서 | eq_affix/u_eq/p_atk_mul/melee_ref/parry_lesson_active/player_view/stat_str/p_dot_pool. 기존7 뒤 실제 Callable 1개. 전체25 presence 조건 불변. |

## 값·상태 경계

| 입력 / 조건 | 원래 지원 의미와 현재 한계 |
|---|---|
| 유효 PASSIVES Dictionary의 pDot absent/null/false/0/-0/NaN/빈 문자열 | 원 필드 truthiness fallback으로 항0·결과1.0. owner 유실을 알려진 필드 부재로 바꾼 것이 아니다. guarded absence는 undefined_reads=[]를 유지한다. |
| true / 유한 숫자 n | true는 결과1.05, 숫자는1+n×0.05. |
| 비어 있지 않은 문자열 | 기존 js_to_number를 재사용. "2"는1.1, 공백 문자열은 숫자변환0으로1, "bad"는NaN 결과/non_finite=true. NaN을 임의0이나1로 바꾸지 않는다. |
| Infinity | truthy이며 결과 non-finite 그대로. 새 clamp·전역 finite 정책 없음. |
| Array / Dictionary / Object | 모두 truthy. 기존 제한된 ToNumber: 빈 배열0·단일 숫자 배열 숫자·복수/boolean 배열 NaN, plain Dictionary는NaN. custom JS valueOf/toString/accessor/throw와 모든 문자 grammar의 일반 동등성은 미검증이다. 새 JS 해석기를 만들지 않는다. |
| reader unbound / freed | 기존 _call_reader의 NOT_READY/PASSIVES_reader_unbound 또는 PASSIVES_reader_target_freed를 기존 _fail 형식으로 보존. |
| bound reader가 null 반환 | 기존 _container가 SOURCE_THROW/원 TypeError/value null로 처리. Passives.current_status의 NR reason이 read_current_passives().value에서 사라지는 기존 경로는 이번에 고치지 않았다. |
| 기타 부적형 container | 기존 _container의 NOT_READY/PASSIVES_unsupported_shape 유지. 실제 current Passives 모듈은 부적형 원 reader를 NR/value null로 반환하므로 이 경우도 바깥 Formula에는 SOURCE_THROW가 전달될 수 있다. |

## 조회·검수·후속

| 항목 | 실제 범위 |
|---|---|
| 실제 binding | Providers의 기존 SOURCE_CURRENT binding 유지. Passives.bind_combat_stat_formula는 setup에서 current_status 1회 조회 후 Formula에 같은 모듈 read_current_passives를 바인딩한다. metadata 검사 메서드는 추가 조회0. |
| raw identity | State owned PASSIVES → Readers/Providers → Passives.current_status.value → Formula container의 같은 참조. 이번은 State/Providers body 수정0. |
| 부수조회 | 실제 Providers readiness/getbundle/domain guard에는 raw_grit.current_container, State guard에는 resource readiness/parameters 검사 호출이 있다. 이번 명시 stand-in 검수로 이 내부 부수조회·동기화를0이라 주장하지 않는다. |
| 첫 신규 검사 | Godot4.7.2 headless 첫1회: 행동76/76, setup37/37 PASS, exit0/양로그 오류·leak0. 이전 통과 suite/parse 재실행0. |
| 실제 코드 범위 | 실제 Formula/Passives/Affix 코드와 실제 SOURCE_CURRENT binding을 사용. observer subclass가 실제 super.p_dot_pool을 호출해 원 raw를 기록. 정확 추출 Services와 명시적 Main/actor/holder/current-reader/Providers stand-in으로 검수. |
| 포함 경계 | 18개 값 case·raw 동일성/metadata/runtime1query, binding setup1query, map8·metadata 검사 query0, bound null의 원 SOURCE_THROW, pre owner/lost/stale binding의 query0, post context/객체/reader/Script/binding 교체의 NR와 read_result 보존. reader Script 교체 case는 교체 후 기존 counter field를 읽지 않아 그 case의 reader 카운터를 별도로 확정하지 않는다. |
| 미검증 | 실제 State getter/전체 Main configure·자연 publication/lifetime·실 HP/clock/gameplay·rawgrit/resource inner query·전체 JS coercion 도메인. metadata hooks는 명시적 fixture이며 실제 natural reentrancy 증명이 아니다. |
| 다음 consumer | 기존 V6의 p_dot_pool 두 조건부 scalar 지점(출혈170/독173, source42163/42164)은 typed 소비가 아직 없다. 실제 API 인수 후 해당 원 lazy/query 위치·순서·raw/prefix/events/cursor를 보존하는 별도 후속이 필요하다. |
| 제품 한계 | unused V6 copy/가짜25 provider/실 kernel 등록/V6 Dict cast 없음. main/R 통합은 이 WIP 인수 후 별도이며 runtime/Web export/PC/실행판 교체0. latest_full_game=false/content_parity=INCOMPLETE, 기존 시각 RETOUCH 유지. |

아래 현행 문서의 과거7/18·6/19·5/20·4/21은 각 제출 시점 기록이다. 현재 source map은 이 문서의8/25·미17을 따른다. 이전 MAIN_SYNC의 pin·검사 결과는 바꾸지 않는다.
