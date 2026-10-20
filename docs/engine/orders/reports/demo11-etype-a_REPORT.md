# DEMO11-etype-a — selected etype0 origin 인계 / 묶음 부분 구현·BLOCKED

fetch 최신 main `0138c5bb9188d27cee10cb1a901d075092ddb88f`에서 `DEMO11-43 9b763da9`를 정상 **fast-forward merge**했다(재작성·rebase0). 작업 브랜치 `codex/demo11-etype-a-20261021`, 구현 기준/의존 `9b763da9`. 갭 문서는 `61ab71be:docs/engine/DEMO11_COMPLETION_GAP_20261021.md §4.1`을 읽기 참조했고, 현재 `FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md`와 FEATURE_INVENTORY의 EN-00/01/04/05/06을 대조했다.

## etype별 실제 범위

| ID / etype | 지원 전 | 지원 후 / 남은 부분 | 신규 경계 검사 수 |
|---|---|---|---|
| 51 / 0 | physical/flesh_crawler exact 초기 actor + P3 소환굴의 undefined-el type0 constructor/동적 등록. 43 origin 자동연결 없음 | **선택 완료 source 입력 → MAP11 후보 → 기존 P3 constructor → 실제 World registry →43 origin** 연결. 같은 소환 인덱스 중복 거절. 전투 v3 exact 초기 피해 도메인·자연 scheduler/clock·프로파일 전체 인수는 미완 | 28 |
| 52 / 1 | lightning/hive_bloater 고정 profile actor 있음 | 재작성0·기존 profile 그대로 보존. World 소환굴 등록은 actual type0 script만 허용하여 **새 MAP11 type1 미등록**. 자연 `el=undefined` constructor·다른 원소/상태/탄·동적 registry/PC 손상 owner 인수 필요 | 3 |
| 54 / 4 | dark medium + physical/spine_beast + ice/soul_flame exact profile | 재작성0. physical/ice 기존 actor로 실제 World 등록 gate 거절 확인. dark medium도 초기 exact factory gate이며 범용 자연 adapter 아님. 자연 constructor/원소·스킨 admission/PC owner 인수 필요 | 6 |
| 55 / 5 | 원본 데이터 있음, factory `native_type_ai_not_ported` | **미구현 유지**. 다른 적으로 대체0. 원본 windup/공통 탄 제외·전용 상태/피해 인수는 후속 Mac 작업이며 PC registry/보호 경계 인수와 함께 진행해야 함 | 3 |
| 56 / 6 | 원본 데이터 있음, factory `native_type_ai_not_ported` | **미구현 유지**. 다른 적/방패돌격으로 위장0. 원본 escort/shieldAng/bash와 정면 피해·PC 상태 owner/registry 인수가 필요 | 3 |

위 수치는 **지원 완료 검사 수가 아니라 이번 테스트의 타입별 경계·인계 단정 수**다. EN-00~99 분모/기존 프로필을 전체 자연 소환 지원으로 승격하지 않는다. P2-008a/b의20/21/47 파일 변경0.

## 구현·호출 계약

신규 `native_demo11_etype_a_spawn.gd`와 Main `request_native_etype_a_spawn(owner,group_id,source)`만 추가했다. **Main +8/−0, 3069–3076**, State/World/factory/기존 actor/피해·패링·P3/43 **0줄**. 이 줄 수는 **의존9b763da9 대비 본 단위 추가분**이다. 0138c5bb9→9b763da9에는 승인된43의 Main/P3/regions 변경이 들어 있으며, 그 내용을 재수정하지 않았다. Main EOF의 lazy consumer 한 곳으로 기존 AI·actor·HP 수식을 복제하지 않는다.

- `owner`는 실제 Main/World에 바인딩된 `NativeSpawnHoleSystem` 원본 노드여야 한다. 현재 source scheduler는43 provider bind 뒤 HOLD인 상태이며 **이 새 API를 자동 호출하지 않는다**. 이번 API 호출 테스트를 자연 시간 흐름의 성공으로 주장하지 않는다.
- `source`는 **이미 source 순서대로 선택·계산된** `{etype,spawn_n,elite,mods,speed_u,radius_u,literal:{st2,facing,projT,bossPatT,_bossOrbitAng,_erraticAng}}`. 지금 허용하는 것은 기존 P3 type0/elite0/mods[]/undefined-el 경로뿐이다. 숫자 유한성·U∈[0,1)·기존 `MKEN_LITERAL_DRAWS` 범위를 검사한다. 선택/난수/clock을 새로 만들거나 이 다섯 etype로 pool을 좁히지 않는다.
- G30969–31025/35674의 **29 etype 가중 풀·근접/원거리 50%·원래 RNG 순서**는 source scheduler 소유 그대로다. 그룹 밖/미지원 결과는 명시 거절하며 reroll·조용한 substitute·스폰 성공 카운트 지급0.
- G31120–31349/35674–35678의 생성자는 기존 P3 `_make_etype0_actor`를 직접 재사용한다. 현재 P.lv·HP/ATK·크기·스킨 seed·undefined element(-1/native.el 부재)·reviveIframes15를 보존. 사전 radius 산출은 그 기존 상수/식으로43에 전달하는 geometry 입력뿐이며 새 HP/ATK 식0.
- **배치**는 adapter `request_spawn`의 실제 MAP11 Marker 유래 provider receipt만 받는다. legacy 위치 선택/spiral/원본 16 id 좌표 복제0. 해당 group의 실제 G.spawnHoles 메타데이터를 사용하고 native home은 새 위치다. provider가 반경 geometry를 소유하며 격리 fixture의 좌표가 실맵 승인이라는 뜻은 아니다.
- World 실제 등록 후43 `register_actor_origin`을 호출한다. 미리 계획된 G._totalSpawned/지역 total을 actor 등록 수로 바꾸지 않는다. constructor prefix 이후 origin 거절이면 `{registered:true,source_prefix_consumed:true,actor,...}`로 **부분 commit을 그대로** 반환하며 재시도로 복제하지 않는다. spawn_n 토큰은 그 prefix부터 소비된다.
- 이 함수는 P3의 바깥 scheduler bookkeeping(시도/_spawned, 간격 곡선, 완료, metrics/actor timer 리스트)을 대행하지 않는다. **호출자가 원본 순서로 이어야 하며 현재 자동 연결은 미완**. 등록 actor의 legacy delta AI는 즉시 비활성화한다. 실제 source phase owner 인수 전에는 별도 clock으로 움직이지 않는다. reviveIframes/AI tick·등록 후 전투·origin kill까지의 자연 검증은 후속이다.

## 보호 경계·구체적인 후속 요청

1. **World 등록**: `world.gd:2920–2932`는 기존 `enemy_melee_flesh_crawler.gd` 실제 script만 허용. `register_summoned_enemy:2837–2846`은 `is_native_registry_ready/advance_native_phase` source actor 계약이 필수이며 기존1/4 actor에 없다. exact 초기 factory record/id/position gate도 범용 mkEn ingress가 아니다. **OLD→NEW 제안**: 소유자가 source constructor receipt·실제 script/etype/원소 profile·단일 clock readiness를 검증하는 별도 natural admission API를 제공. 기존 exact 초기 guard를 삭제하거나 모든 etype로 느슨하게 만들지 않는다.
2. **피해/패링**: `enemy_melee_flesh_crawler.gd:408–414` v3 normal-field domain은 initial015/order14/physical 및 actual script를 요구한다. 새 source0의 id/order/undefined-el은 이 도메인 밖이다. 기존 dedicated hurtE partial reader는 남아 있으므로 **모든 기존 피해가 불가능하다고 단정하지 않는다**. 다만 이 partial/legacy API로 source 전체 hurtE·poise·clock을 완료라고 표시할 수 없다. **NEW 제안**: 실제 constructor·registry identity를 인수한 PC 보호 owner의 source field/poise·player damage/parry API. 상속으로 exact domain을 true로 override하는 우회0.
3. **Mac 후속 미완**: 1/4 natural mkEn/원소·스킨 변형·미지원 AI 상태/탄, 5/6 전용 actor/state의 이식은 **이번 미구현**이다. 기존 profile과 보호 도메인/World 통합 계약 인수 뒤 이어야 한다. 본 보고서로 다섯 작업을 완료 처리하지 않는다. 5의 windup20(G38888),6의escort150/60%·angle .08sp/bash(G38891–38917,40762–40775,42167) 원본 분기와 별도로 기록.
4. **5종120fps 예산**: 실제5/6 actor 및1/4 자연 등록이 없어 요구한 **5종 동시 스폰 벤치 미실행(0회)**. 5개 요청 거절 시간·복제 type0·가짜 actor를 대체 벤치로 제출하지 않는다. 이 요구는 미충족이며 인수 뒤 실제5종 등록/단일 clock으로1회 수행해야 한다. 새 tick 경로/목록 생성 API0, private clock 추가0.

| 검증·제출 | 실제 결과 |
|---|---|
| 신규 | **48/0**, skip0·예상 밖 ERROR0. 실제 Main/43/P3 constructor/World registry/origin·Marker 위치·same spawn_n 중복·v3 도메인 유지·살아있는 actor kill 거절·원본 분모 유지·1/4 실제 등록 거절·5/6 명시 미지원. 새 userdir `EXODUSER-demo11-etype-a-Isolated-20261021`. 원본 HP/AI 재구현끼리 비교한 테스트가 아님 |
| 직접 관련 회귀 | **43=40/0, P3-002=298/0, 합338/0**, skip0·예상 밖 ERROR0. 43과 P3-002 각 파일 상수 격리명·각1회. P3 종료에 `WARNING: 8 ObjectDB instances were leaked at exit (run with --verbose for details)` 관측·원문 보존. 이번 별도 baseline/원인 진단은 하지 않았으며 새 consumer는 이 기존 스위트에서 생성되지 않음(lazy API). 기존 actor/factory/피해 코드 byte 동일 |
| 원본·실행 이력 | 초기 신규 테스트 `before` 타입 추론 parse error를 명시 int로 정정, 실패한 신규만 재실행. 이후 원소 강제 입력 거절·등록 직후 legacy delta AI HOLD를 보강한 변경에 대해 신규만 최종 재검증. Godot gate 매 실행 전 수2이상이면30초 대기. 하니스 출력 join·node-bin 명시, 종료 override0byte. 실제 사용자 저장 폴더0·UI/번역/에셋 생성0 |
| Git·원로그 | `~/exoduser-wt/_out/demo11-etype-a/`에 base/43 merge·source-evidence·기존 파일 hash·실행 로그·보고서 복사·DONE. 경로 지정 정상 stage/hook·자기branch 일반push·원격 SHA 일치 뒤 자기WT 제거. R 불변 |

**판정: 부분 구현·통합 BLOCKED / 다섯 etype 완료 아님.** 새로 연결한 것은 source-selected0의 실제 registry/origin 인계다. 나머지4 actor·자연 scheduler·보호 owner·5종 성능 검증을 미완으로 남긴다.
