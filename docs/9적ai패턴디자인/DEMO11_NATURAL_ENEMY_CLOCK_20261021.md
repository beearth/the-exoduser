> 2026-10-21 DEMO11-enemy-base2: A/B/D clock 이관: A/B 기존 actor는 World native phase, A5 warning은 기존 priority1 World frame, A physical carrier는 자율 physics off 후35 common source frame.sp로 기존 _physics_process를1회 호출한다. D의 raw carrier는 기존35 source motion을 유지한다. 두 carrier 표현을 같은 pool로 섞지 않는다. source0 scheduler는 원문29/RNG 유지, 선택형 A/B/D 최초 bind는 scheduler=false를 유지하며 full auto 완료로 승격하지 않는다.

# DEMO11-enemy-base — 단일 source clock과 원본 순서

2026-10-21 D 후속: D 원본 actor의 World epoch와 common serial을 `_native_clock_updates`로 통일했다. D selected-only 모드에서는 source scheduler를 자동 실행하지 않으며 기존 D current/arena 범위를 보존한다. D frame의 Player snapshot·pause retain·D tag 탄만 회수·arena 해제 후 boss serial 양보는 기존 D clock regression으로 확인한다. 같은 frame을 별도 D driver와 common driver에서 두 번 실행하지 않는다. D 고유 AI/zone clock body는 변경하지 않고 profile로 유지한다. common raw entry에서도 타입별 suspend를 적용한다. [후속 보고](../engine/orders/reports/demo11-enemy-base_REPORT.md).

World 기존 priority−1의 min(delta×60,3)/native frame을 사용한다. 자연 actor는 자동 _physics_process를 끄고 기존 World owner phase에서 정확히1회 기존 flesh kernel을 호출한다. 별도 delta clock/HP/패링 식0. actor마다 마지막 frame을 확인하며 reviveIframes(34456)를 AI 앞에서 감소한다. P3의 legacy _spawned_actors 목록에 다시 넣지 않아 중복 감소하지 않는다. 타이머 RNG는 World.sample_native_random_unit에 연결해 기존 actor private seeded RNG를 자연 경로에서 사용하지 않는다. 기존 source field/poise exact 초기 도메인을 true로 override하지 않는다.

순서: World clock → 기존 owner/자연 적 AI → 기존 particle pool/탄 → birth2의 동일35 자연 registry 틱/실제 출생탄 포함 → HitFX3 → 자연 소환굴 scheduler4. 원문 적 루프344xx/탄34660/굴35636 순서에 따라 scheduler에서 새로 태어난 actor는 다음 frame부터 움직인다. 기존 World 큐/탄/초기 적 순서는 유지한다. 35의 native frame serial과 World frame을 공통 owner에서1회 연결하고 같은 frame 호출을 거절한다. Game/SceneTree pause·G.on/G.paused·lesson·stale provider는 중단한다. tick 경로 목록 생성 API0; context packet은 frame마다1회 만들며 static contract 반사는 바인딩에만 한다.

굴 스케줄러는 P3의120 update 진입·2000² 거리·90틱 지연·S8/M15/L15·alive cap/대기·간격 curve·완료 효과를 그대로 호출한다. 자연 owner가 Marker를 바인딩한 경우에만 기존 좌표 탐색 대신 공통 spawn_hole을 호출한다. 29종 CDF/근원거리50%·elite/mods·speed/radius·조건부 literal 순서를 유지한다. 미등록/미지원 elite 결과는 reroll/etype0 치환하지 않고 journal NOT_READY와 source attempt를 남긴다. 실제 actor/registered 수는 성공한 등록만 센다. _spawned는 원본 scheduler의 시도 인덱스이며 실제 등록 수와 구분한다.

새 MAP11 배치는 원본 좌표·spiral을 사용하지 않는다. 원문 첫 pos_angle/pos_radius U2개를 소비하고 provider에 source_position_uniforms로 넘긴다. provider가 실제 Marker candidate geometry를 소유한다. 웹 좌표/벽 반복 횟수와 같은 스트림이라는 뜻은 아니다. 새 지도에서의 단일 후보 정책이며 원본 벽30회 재시도는 복제하지 않는다. provider 후보 거절은 source 실패/소비 prefix로 남긴다. 실제 제품 MAP11의 geometry/난수 재시도 정책 인수는 별도다.

HP/피해는 기존 PC actor 인터페이스만 호출한다. legacy receive_damage의 실제 enemy_damage(raw_amount)→enemy_death 구간에만43 origin 인계를 붙인다. full PC hurtE의 사망 write event는 raw_amount legacy 후보를 만들지 않으므로 기존 hurtE42702의 지역 kill writer가 원순서대로 처리한다. 이 exact 구분으로 full hurtE 사망 직후 region을 미리 집계하지 않는다. 원본 분모는 변경하지 않고 duplicate kill은43이 거절한다. full v3 hurtE domain 인수·죽은 적 GC/보상·새 타입 사망 중간 prefix를 구현했다고 주장하지 않는다.

[생성·탄·후속 등록 계약](../8.0몬스터디자인/DEMO11_NATURAL_ENEMY_BASE_20261021.md). 검증의 고정600틱30자연 actor 벤치는 실제 Main/World/registry CPU 경로를 재며, 초기 source actor가 registry에 남아 쿼리에 참여한다. 격리 fixture의 Player iframe은 고정해 보호 피해 비용을 제외한다. 렌더/GPU/전체 게임120fps 보증이 아니며 mean/p95/p99/max를 함께 보고한다. 실제 profile별 PC 접촉 비용·5종 다양성은 후속이다.
