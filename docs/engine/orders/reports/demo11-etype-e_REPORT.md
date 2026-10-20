> 2026-10-21 후속: 이하70d1ca22 당시 BLOCKED 근거 이력이다. DEMO11-enemy-base3에서 Mac29 constructor/공격/사망 packet 소비자와3/7 실제 준비 경계를 구현한다. PCI-11 최종사망/gate·3/7 PC 조건은 여전히 미확정이며 현행 범위/검증은 demo11-enemy-base3_REPORT.md.

# DEMO11-etype-e — 자연 등록 전제 BLOCKED

**자연 등록 구현 완료가 아니다.** 최신 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에 DEMO11-43 `9b763da9900c3c225fa60caa556f5b8c9ea227a3`, EL-01 `654845e4aed8f0401aebedd9ae459318bee239fb`, DEMO11-37 `05f41cc7b8ad220a3e573ee180d0dffcae29427b`를 정상 merge했다. 구현 검토 기준은 `52e21fd87471c7a1161360032a8916407dacd305`. merge 충돌은 CHANGELOG/WORK_BOARD/UI 문서 양쪽 절 및 Main의 PC stats·43 adapter·37 API, State의 forge·37 progression을 모두 보존했다. rebase0. 기존 생성 분기를 바꾸거나 미준비 actor를 등록하지 않았다.

| 단위 / etype | 실제 판정·최신 main 근거 | 다음 접점·소유 경계 |
|---|---|---|
| DEMO11-53 / 3 | **NOT_READY**. type3 recipe/binder/M29/M30는 있으나 `type3_summoned_actor.gd:370–414`는 standalone HP/쉴드/poise 경로이고 공용 `read_native_normal_enemy_hurte_fields`가 없다. 현재 공용 hurtE는 `native_normal_enemy_hurte.gd:105`의 실제 field owner를 요구한다. beam 옵션은72–81에서 실제 거절. 원본 initial16에는 etype3가 없어 임의 고정 위치/record를 발명할 수 없다 | PC 공용 hurtE owner read/write·현재 옵션 수용 계약이 필요. 기존 receive_damage로 대체하거나 거절 옵션을 제거하지 않는다. PC field adapter 인수 뒤 Marker/context 기반 recipe→binding→실제 World registry 순서. M29가 선택되면7과 같은 PC 준비 조건 |
| DEMO11-57 / 7 | **NOT_READY**. `native_type7_runtime.gd:39–63`은 자식 type3의 실제 M294cap·패링 callable을 필수로 요구한다. 실제 제공 가능한 callback만 넘긴 configure는 `missing_actual_type3_handle_m29_parry`로 거절. exact004는 아직 source report에서 unsupported, 다른008까지 일반화하지 않음. PC `claude/pc-m29-parry-20261021` 원격 ref 조회 성공/결과0행 | PC `handle_m29_parry(actor,target,event)`·실제 parry context·warning/impact/audio readiness 인수 뒤 exact004 prepare/install을 자연 owner로 연결. true cap/항상 false 패링을 제품에 넣지 않음. RNG·등록 선소비0 |
| DEMO11-78 / 29 | **NOT_READY**. EL-01 G31620–31628 forced 후처리는 구현됐으나 미등록 constructor가 있어야 한다. 실제 gate actor 및 계획된 attack/death producer는 기준 tree에 없다. G39125–39140·40526–40558 공격, G42817–42824 사망8탄을 실제 소비할 Mac actor는 **아직 미구현**이다. PC 사망/부활 뒤 G42737–42744 gate writer도 현재 native hurtE에 없다 | Mac 후행: exact29 ctor/공격/사망탄 adapter. PC 후행: 최종 사망/부활·보호 접촉 및 사망탄 carrier/패링 허용 계약. 확정 전 직접 HP·P 피해·gate 쓰기0. P3-003의 `_gateGuardKilled` 10% reader→37 gate를 그대로 소비해야 하며 `_bossUnlocked` 직접 대입 금지 |
| factory / PC 중첩 | `codex/p2-008b-ch1-enemies-pc-20261020 b406e4bc4c104ff42144c3222f7356858959873e` 읽기 참조. `enemy_factory.gd`의 validator/unsupported_reason/consume_atomic가 원격 PC 변경과 중첩. 사용자 ‘같은 줄이면 건너뜀’ 적용, 반입/수정0 | 자연 등록 전제가 모두 미준비이므로 append-only 이름만 추가한 가짜 지원 entry도 만들지 않는다. PC 기존 분기 보존. 원격 diff `pc-factory-overlap.diff` |

G31131–31167 constructor RNG, G31190–31193 type7 timer, G31230–31231 빙마 timer를 기존 커널의 권위로 유지한다. G39125–39140은 wind45·거리120/100 strict·I8탄 후 d>150&&d<1200의 .008sp RNG 순서다. G42818의 black U<.5/red U>=.5는 50/50이며 주석30%로 바꾸지 않는다. 기존 원본 추적·EL-01 테스트를 이번 자연 입장 증거로 재계산하지 않았다. 사망 전 임의 death-plan 실행으로 gate를 열지 않는다.

| 검증·제출 범위 | 결과·한계 |
|---|---|
| 새 거절 계약 테스트 | 실제 Main/World/source report·type3 script·공용 hurtE의 옵션 거절·실제 six-element emitter·type7 preflight·EL null 후처리·37 gate를 사용. **18/0**, 각1회·exit0·ERROR0·Camera 경고1. fixture readiness/패링 콜백0. 성공은 **미등록 거절 계약**만이며 자연 생성 PASS가 아니다 |
| 3종 동시 스폰 120fps 벤치 | **NOT_READY / 미실행**. 전제인 실제 준비된3종이 없어 벽시계 수치를 만들지 않았다. 기존9개 actor/0개 신규/빈 루프·dummy actor를3종 벤치로 대체하지 않음. 별도 raw benchmark-status.json에 미실행 근거 기록 |
| 공용 변경 | 의존 merge 대비 Main/State/World/Player/enemy_factory/기존 kernel/보호 피해·패링·저장 **0줄**. 새 상시 tick·목록 생성 API0. 새 재현 테스트1개 및 이 보고서/8.0/8.2/CHANGELOG, 번역 목록의 의존 추가절18 LF만 byte 단위 CRLF 정정(기존 main4225 CRLF bytes 그대로·최종4243 CRLF/bare LF0). 새 번역 문장0. PC branch는 읽기 참조만 |

원로그 `~/exoduser-wt/_out/demo11-etype-e/`. 신규 격리 `EXODUSER-demo11-etype-e-Isolated-20261021`, 실제 사용자 저장 read/copy0. Godot 전 pgrep>=2면30초 대기. 원본/큰 JSON 출력0. 구현 상태는 **BLOCKED(3 etype 자연 등록0)**이며 PC/자연 전투·시각/전체 성능은 미확인이다. 재개 조건은 위 etype별 실제 인터페이스 및 Mac29 consumer 인수이며, 단순 API 이름/자산 존재로 READY를 선언하지 않는다.

type7 거절 테스트의 summon_context key에는 현재 P 읽기 Callable만 넣어 callable 사전검사에 진입했다. 이는 실제 summon context shape/내용 인수나 실행 증거가 아니다. 실제 runtime은 그 context 읽기보다 앞에서 필수 handle_m29_parry 부재로 거절한다. 재개 시 stage/room/player_level/difficulty/stage_difficulty_offset을 실제 소유자에서 구성하는 caller도 필요하다. 이미 통과한 EL-01 및 과거 kernel 스위트는 own 제품 변경0이므로 재실행/이번 합산하지 않았다.
