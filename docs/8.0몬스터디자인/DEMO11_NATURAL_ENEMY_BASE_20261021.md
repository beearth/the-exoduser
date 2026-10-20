> 2026-10-21 DEMO11-enemy-base3: F ef64bd17 등록/World/43을 단일 공통 prepared admission에 이관했다. A/B/D/F18종과 별도 문지기29로 단일 표19종이며3/7은 PC 조건 전 미등록이다. Mac29 constructor/attack/warning60/common35·사망8packet 모델은 이번 범위, PCI-11 final death/gate/죽은actor retention·F 특수 owner는 후행. source-selected slice와 전체 자동 CDF/전투를 구분한다.

> 2026-10-21 DEMO11-enemy-base2: A(d931ebe2)·B(c6d19973) 이관: 실제15종 등록은 NATURAL_REGISTRATIONS 단일 표, A/B 상수는 참조 view다. source-selected 입력 검증·원문 constructor는 각 profile에 유지하고 actor preparation→World/43은 common.admit_source_record 하나로 인수한다. 기존 source0 자동 P3 actor와 선택 A0 actor는 etype0 entry의 계약 variant이며 수치·탄을 서로 치환하지 않는다. A 기존 physical carrier는35에서 단일 clock으로 호출하고 PC body는 유지. B 탄 profile 부재·B8/D25 사망 경계는 후행이다.

# DEMO11-enemy-base — 자연 적 생성·등록 공통 계약

2026-10-21 D 후속:9fd31a64를 정상 merge9157697c하고 실제 D18/19/23/24/25의 factory/World/origin/탄을 공통 owner로 이관했다. 공개 Main.spawn_native_demo11_d 호출·D actor/ctor RNG/수치 body는 그대로다. NATURAL_REGISTRATIONS의 D5개는 prepared_record_only이며 자동 scheduler는 여전히 HOLD다. source-selected D가 먼저 부팅하면 bind의 두 번째 인자enable_scheduler=false로 selected-only 설치, 기존 명시 bind의 기본true/0 source scheduler는 보존한다. create_demo11_d는 profile builder로 유지하고 prepare_natural_profile→spawn_profile_record→공통 _admit_prepared가 실제 World capability를 소유한다. D 고유 zone와25 death/PC contact 경계는 후행이다. 상세 회귀·공용diff는 보고서 맨 위 후속 절을 따른다.

기준 main0138c5bb9 + DEMO11-43 9b763da9 + A cf7408d4. 원본 game.html SHA2564d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. DEMO11-35 registry727f6a02는 이 체인의 조상으로 재병합 불필요했다. B49a250ef/C9fde1d4a/D9627cf75 보고서는 읽기 참조이며 해당 제품을 임의 반입하지 않았다.

실제 경로는 `Main.bind_native_spawn_stage_provider(provider)`(43) 후 `Main.bind_native_natural_enemy_base(projectile_context_reader)`다. MAP11 provider가 현재·runtime_ready여야 하고, reader는 실제 lesson_active/qa_storage_active/aggro_active bool을 반환해야 한다. aggro이면 target node/좌표도 필요하다. 읽기 소유자가 없는 flag를 false 기본값으로 가리지 않는다. 시연 테스트에서는 QA storage/aggro를 설치하지 않은 격리 fixture가 명시 false를 공급한다. 실제 MAP11 제품 provider와 추가 전투/PC 상태 구현을 이 테스트로 인수하지 않는다.

공통 helper는 `native_natural_enemy_base.gd` 한 곳이다. source-selected 요청/29종 원문 선택/원본 literal RNG를 받은 뒤 factory 자연 목록→runtime 구성→실제 World admission→43 origin을 순서대로 호출한다. World는 같은 owner의 준비 receipt가 있는 actor만 기존 register_summoned_enemy로 받는다. 새 registry 배열/HP writer는 없다. constructor 이후 거절은 consumed prefix를 재생하지 않으며, origin이 거절돼도 이미 등록한 actor는 registered:true로 남긴다. 토큰은 group/spawn_n으로 중복을 막는다.

factory는 기존 초기 source16 검증·등록/소비 로직을 수정하지 않고 EOF의 NATURAL_REGISTRATIONS와 preparation API만 append한다. 최초 자동 source 등록은 **etype0 / normal / undefined-el / mods[]**이며, D 후속의 준비된5종 profile 등록과 구분한다. 기존 P3 type0 수치 계산은 build_natural_etype0_runtime으로 추출해 legacy와 공통 경로가 같이 호출한다. 새 HP/ATK 식 복제0. runtime에는 기존 P3가 누락했던 source color #dd4455(30909)를 자연 경로에서만 추가한다. sentinel el=-1은 원문 undefined의 경계 표현이며 physical0으로 대체하지 않는다. 기존 초기 etype0의 물리/스킨 exact 도메인은 완화하지 않는다.

다음 etype은 기존 kernel을 재사용하는 실제 actor 및 동일 constructor signature, radius_base/source_color/profile 등록을 덧붙이고 고유 상태만 구현한다. 특수 Player/사망 prefix가 없는 타입은 등록을 미리 READY로 하지 않는다. 새 타이머/사망 child는 공통 clock·Marker 후보·origin 체인을 사용해야 한다. 기존 constructor 함수는 P3 모듈에 보존했지만 자연 dispatch/권한·등록 bookkeeping은 공통 helper에만 모았다. 장래 constructor를 별도 데이터 owner로 옮길 때도 이 signature를 유지한다.

탄은 `base.emit_projectile(actor,raw)`→DEMO11-35.admit_natural_projectile→기존 BC09 begin/next birth·FULL parry_class reader→동일 pool/실제 Carrier/registry다. raw의 element는 실제 actor와 같아야 한다. web/trap/iceZone 등 specialized tick 거부는 그대로다. 35를 별도 복제하지 않고 natural source가 바인딩되면 기존 boss 자동 driver와 이중 tick되지 않게 공통 World source frame으로 넘긴다. PC protected contact는 기존 bind_protected_contact만 사용한다. 미바인딩은 motion/expiry만이며 피해·패링 성공이 아니다. boss 전용 source prefix와의 완전한 live 통합은 별도 인수사항이다.

기존 `request_native_etype_a_spawn`은 공통 기반이 연결된 World에서 이 owner로 인계하고, 연결 전에는 기존 A 좁은 접점을 보존한다. B preflight는 진짜 prepare/spawn_selected 인수로 대체할 자리이며 C의 PC 접점과 D 고유 행동은 별개 후속이다. 전체 타입/5종 자연 전투 완료로 승격하지 않는다. [검증·대체 위치·공용 범위 보고서](../engine/orders/reports/demo11-enemy-base_REPORT.md), [clock 계약](../9적ai패턴디자인/DEMO11_NATURAL_ENEMY_CLOCK_20261021.md).
