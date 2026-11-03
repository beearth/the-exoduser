# DEMO11-enemy-base2 — A·B·D 공통 admission·clock 이관

기준 `264069693ff307f5b240d9eeadf46367ce70a7fd`, 같은 `codex/demo11-enemy-base-20261021`. 의존 A `d931ebe2`, B `c6d19973`, 기존 D `9fd31a64`. 정상 merge A `23356ac8`, B `740b6651`; rebase/force/main push0. 최신 main 추가 merge 요청은 없으며 이번 범위는 이 세 묶음의 공통화다. R의 HEAD/branch/tracked INDEX/WORK는 별도로 시작·종료 대조한다.

## 이관 결과·동작 보존

사용자 지시의 13종은 등록 전체 수와 구분한다. A 0·1·4·5·6, B 8·9·10·11·12, D 18·19·23·24·25로 **등록은15종**이다. B8의 사망 폭발 PC owner와 D25의 사망 PC prefix는 기존 차단이므로, 실제 처치 확인 대상은 나머지13종이다. 차단을 생략한 lethal PASS를 만들지 않는다. 새 통합 하니스는 실제 Main/World/Marker provider·43 origin·PC 인터페이스를 사용하며 제품 MAP11 공개 플레이를 대신하지 않는다.

| 묶음·임시 경계 | 공통 기반으로 대체한 위치·보존 | 남은 범위 |
|---|---|---|
| A spawn·factory | source 입력 검증·원문 build는 기존 profile에 유지. 직접 actor.new/World.register_summoned_enemy/origin 등록을 common.admit_source_record→단일 prepared capability→World→43으로 대체. A 등록 상수는 단일 NATURAL_REGISTRATIONS 참조 view | 자동 source0은 기존 P3 constructor/자연 actor 유지. 선택 A0의 기존 constructor/actor는 같은 etype0 entry의 selected_actor variant. 중복 등록 행0, 두 생성 계약을 임의 교체0 |
| A projectile·clock | A fire facade→common.emit_profile_projectile→35 단일 registry. 기존 physical carrier의 configure/PC contact/수치/expiry body byte 보존. 자율 physics를 끄고 실제 World frame/sp로 35가1회 호출. A5 warning의 기존 World clock·원문60tick은 유지 | FULL raw carrier인 D와 A의 기존 profile carrier는 motion 표현만 다르고 admission·clock·registry는 하나. profile data를 BC09 free pool에 재활용0; A legacy 분류·PC 접촉 변경0 |
| B spawn·factory | 기존 source-selected guards·mkEn 수치 body 유지, factory의 직접 World 등록 삭제→common.admit_source_record. 같은 group/spawn_n ledger를 A/기존0과 공유. 등록표는 단일 표의 참조 view | 탄 profile/명령 owner 부재는 기존 NOT_READY 유지. B actor를 새 탄이나 가짜 receipt로 통과0. B9 deadPool·B11 자식 소환·B8 사망 폭발 후행 |
| D | 26406969 이관된 common profile/35 원문 carrier·공개 facade 그대로. A/B가 먼저 bind해도 같은 common owner 사용 | D25 사망 prefix·이동탄 protected contact·D 자동 scheduler HOLD 유지 |

A actor의 기존 legacy enemy_damage→enemy_death는 common이43 kill을 기록한다. 따라서 A 등록 회귀의 수동 record_actor_kill 첫 호출은 이제 중복 거부여야 한다. 이 단정만 common origin ownership에 맞게 바꾸고 실제 dead/HP 및 중복 거부 검사는 유지했다. source0 기존 자동 scheduler·비율29·RNG·P3 constructor 수치는 그대로다. 자동 CDF scheduler는 기존0만 유지하고 선택 A/B/D 확장14종은 HOLD로 제한한다. 선택형15종의 공통 World/35 clock 검수이며, 전체 CDF 자연 자동 플레이 완료가 아니다. 최종 리뷰에서 불필요한 A/B 자동 ingress 분기를 제거해 동작 범위 확장을 막았으며, 최종 통합에14종 자동 HOLD 단정을 추가했다. A/B 고유 actor AI는 원래 World phase를 사용하며 별도 delta clock을 만들지 않는다. 레거시 초기 source16 factory/PC profile dispatch prefix는 무수정이다.

## 검증·공용 변경 범위

신규 통합 최종은 **89/0**(직전 이관검사75/0 이력은 별도, 중복합산0). 최초72단정 중 D25 HP 불변 기대1실패(제품 오류/실제13처치 실패 아님)를 보존한다. 기존 D25 PC 경로는 HP 쓰기 후 death prefix를 거부하므로 HP≤0·alive 유지·not_ready 원문을 확인하도록 자기 단정을 고쳤고, 실패한 신규 suite만 재실행했다. 제품/PC 경로 교정0. 기존 회귀는 A2000/0·B104/0·D158/0(원문 JS oracle90 포함)·공통0 31/0·35 registry29/0·auto14/0 = **2336/0**, factory 별도3그룹/실패0, 각1회다. 통합89+관련2336=**2425/0**, 최종 실행 ERROR0·skip0. 기존 Camera2D interpolation 경고 원문은 보존하며 이번 종료 누수 진단0. 회귀 후 자동 ingress를 HOLD로 좁힌 변경은 해당14경계를 최종 통합89로 검증했고, 영향 없는 기존 묶음 회귀를 반복하지 않았다. source0/D의 자동 admission 정책은 최초26406969와 같고 A/B 공개 facade 코드는 guard 보완 전후 동일하다. Godot 전 정확한 pgrep count>=2면30초 대기, 각 override는 실행별 격리명 후0byte. 새 통합 이름 `EXODUSER-demo11-enemy-base2-Isolated-20261021`, 기존 회귀는 각 파일 상수. 실제 사용자 저장 읽기/복사/쓰기0. 모든 stdout/stderr·명령·gate·tested byte manifest는 `~/exoduser-wt/_out/demo11-enemy-base2/`.

| 파일·검사 | 실제 결과·범위 |
|---|---|
| 보호·행 범위 | merge 직후740b6651 대비, hunk 표기는 `−이전행 +최종행,개수`. State/World/Player/QE/hurtE/기존 physical carrier·flesh kernel·D actor 제품 변경0 |
| `main.gd` | +0 / −1; `-3073 +3072,0` |
| `enemy_factory.gd` | +25 / −20; `-683,0 +684,10`; `-689,2 +698,0`; `-723 +731`; `-728,7 +736`; `-736,7 +738,2`; `-744,0 +742`; `-748,3 +746,10` |
| `native_natural_enemy_base.gd` | +15 / −2; `-86 +86`; `-92 +92`; `-192,0 +193,13` |
| `native_demo11_boss_projectiles.gd` | +29 / −0; `-172,0 +173,6`; `-200,0 +207,3`; `-260,0 +270,20` |
| `native_demo11_etype_a_spawn.gd` | +10 / −6; `-49,0 +50,3`; `-66,5 +69,3`; `-75 +76`; `-80,0 +82,3` |
| `native_demo11_etype_a_projectiles.gd` | +5 / −9; `-2,2 +2`; `-5,7 +4,4` |
| `native_demo11_etype_b_spawn.gd` | +8 / −2; `-58,0 +59,3`; `-62 +65`; `-64 +67`; `-100,0 +104,3` |
| 통합·회귀 | 최종89/0 + 기존2336/0=2425/0, factory3그룹/실패0. 실제15종 spawn/tick·13종 PC 처치/43 origin·B8/D25 사망HOLD. B8은 HP 쓰기 전 거부, D25는 PC HP 쓰기 뒤 death prefix 거부로 HP≤0·alive/not_ready 유지. 가짜 사망 처리0 |
| 성능 관측 | 기존 공통0 회귀에 포함된 유효1회 30actor600tick: mean2.820302ms/p953.829/p994.009/max8.188ms. 이번 샘플은8.333ms 이내지만 환경 변동/CPU 부분 측정이므로 최적화 효과·전체120fps 완료로 주장0. 최초26406969의 최대8.38ms 이력도 보존 |

## F 이관 절차

1. F 완료 SHA를 같은 브랜치에 정상 merge하고, etype별 실제 actor/원문 constructor를 단일 NATURAL_REGISTRATIONS에 추가한다(기존 등록 중복0).
2. F source 검증·고유 동작은 profile에 남기고 World/origin·탄 admission은 common의 prepared capability/35로 넘긴다. 없는 PC owner는 종별 NOT_READY로 유지한다.
3. F 동작 불변 회귀1회와 A/B/D/F 통합 생명주기1회를 격리 실행하고, 공용 diff 줄·보호 byte·원격 일치·DONE을 남긴다. 성능 변경은 별도 담당과 통합한다.

초기 WT가 --no-checkout 상태에서 sparse index materialization 전 merge를 요청하여 자동 stash 복원이 시작됐다. 실제 merge/코드 수정 전 자기 prelaunch Git process만 중단하고, 자기 WT를 재생성해 sparse-checkout 뒤 read-tree -mu HEAD로 명시 materialize했다. R/브랜치 history reset0. 초기 A merge 시도 로그는 보존하고 유효 merge는 위23356ac8/740b6651만 인수한다. 최초 lifecycle 대기도 실행 전 계약 보존 보완을 위해 자기 waiter만 중단했고 Godot 테스트 실행0회다.

통합 최종의15actor 고정10native tick 관측은 [4195, 1074, 1061, 1052, 1240, 1062, 1076, 1190, 1277, 1068]µs, 15개 생성 벽시계13001µs다. 이는 짧은 기능 검사의 부수 관측이며 별도 장시간 벤치/전체fps 판정이 아니다. 원본 근거는 A 보고서 G30969–31025·G31120–31364·G35648–35688, B 보고서 G30847–30872·G31195–31204·각 상태/사망 구간, D 보고서의 원문 oracle 범위를 유지한다. 생성식·프로파일 수치 수정0, 원본 에셋은 기존 byte 참조만, 제품 UI·번역·저장 변경0.
