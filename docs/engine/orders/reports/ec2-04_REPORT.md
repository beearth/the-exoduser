# EC2-04 — 2장 돌진·강타 전용 진입 정책

작업ID `ec2-04` · 브랜치 `codex/ec2-04-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·중복·수정 범위

| 항목 | 확인 결과 |
|---|---|
| 최신 main·최소 기준 | fetch 후 `origin/main=0119f3048a459a458ba142d98f68126b8e281be1`. 최소 `ce141573ea1d7a344fd1990a14ef57f496149bb5`가 이 main의 조상임을 확인 |
| 의존 분기 | EC2-03은 아직 main에 없어 사용자 예외에 따라 `557eaff4deda2bd2dcac157a46615ee40fc433f9`에서 분기. 최신 main game.html과 byte 동일, M29/element emitter도 동일 확인. 최신 main 전체 통합 코드를 이 기반에 병합했다고 주장하지 않음 |
| 원본 지문 | game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 아래 행은 최신 main 원본 기준 |
| 승인 설계 | [trace-enemies-ch2 cf57f721 §4.2 CH2E-04](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md): 30의90/17/42·39직행30/default5·32/39 독립if/cooldown/overwrite·Pbean 요청/실효 차이. 기존M29/type7/common sweep 재구현0 |
| 착수 전 보드 확인 | 최신 main WORK_BOARD의 P2-008a/FIX=CH1빙결전사/crawler·factory, P2-008b=CH1order11/9 actor/factory 진행 중, CH1-01/02·BC01/02/03=main병합, TRACE-ELITES=문서 진행 중을 확인. 이번 신규 type30/32/39 전용 계산 파일과 진행 소유 경로 교집합0. WORK_BOARD 수정0·이 보고서/DONE으로 인계 |
| 변경6파일 | `godot/scripts/native_ch2_charge_slam_policy.gd`, `godot/tests/test_ch2_charge_slam_policy.gd`, 자기UID2개, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | factory/world/main/player/공용 hurtE/State·기존 테스트·다른 담당·저장·원본0줄. 기존 M29·type7·M30·공통 스윕/실제 AoE/입력 gate 변경0. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, tracked INDEX/WORK 불변 |

## API와 원본 정확 값

RefCounted `advance_trigger_clocks(actor,sp)`는 해당 전용 T만 사본에서 감소시키고 outer `idle_entered`를 반환한다. `plan_triggers(actor_at_site,player,distance,idle_entered,path_clear)`는 최신 스냅샷과 원래 한 번 검사한 idle/d로 전용 상태 진입·명령을 계산한다. 39의 roar clock·enrage/roar prefix는 별도 owner가 먼저 처리해야 하며 이 정책에 복제하지 않았다. 따라서 이 결과는 **전체 updateE나 실제 actor 등록/전투 완료가 아니다**.

READY는 actor 사본·순서 있는 commands·`product_connected=false`·`common_consumers_required=true`다. path_clear(actor_view,len) 콜백은 30이 실제 조건에 도달할 때만 필요하고, 누락/비bool은 NOT_READY로 진단한다. 벽 샘플링을 복제하거나 true로 대체하지 않는다. 외부 actor/Player에 직접 쓰지 않고 RNG/clock/World owner도 없다.

| 원본 game.html | 보존한 계약 |
|---|---|
| 39143–39149 | 30 idle: wildT−sp, ≤0·40&lt;d&lt;1200·_chgPathClear(714+r) 통과 시 현재P 조준→eChargeWind/st2=90/aimMax90/dur17/spd42/len714+r, T=Cd. text 돌진!(y−15,#884422,25)→SFX.charge |
| 39153–39163 | 32 idle: boulderT−sp, ≤0·d&lt;100→eSlamWind50/T=Cd. text(y−20,#ccaa88,35)→현재 실제거리&lt;800일 때groggy→shake6→P4방향(각PI×2×i/4+PI/4,spd2.5,요청1.3,life200,size3). d&lt;80이면 현재P조준 P1발(spd4,요청.8,life60,size2)→parts4 |
| 39255–39271 | 39의 세 clock/분노·주변 아군 포효 쓰기는 이 전용 charge/slam 앞의 별도 prefix. baseAtk/ally 상태를 새 영구 버프/독립 authority로 만들지 않음 |
| 39272–39275 | 39 chargeT≤0·100&lt;d&lt;1200→T=Cd, **eCharge 직행/st2=30**, 현재facing cos/sin. text(y−15,#ff6633,35)→charge. _chgAimMax/Dur/Spd/Len을 새로 넣거나 reset하지 않음 |
| 39277–39285 | 뒤의 독립 if: slamT≤0·d&lt;120→T=Cd/eSlamWind55. text(y−20,#ff6633,40)→현재거리&lt;800이면groggy→shake8→P8방향(spd3,요청1.5,life250,size3). d&lt;100이면 e.el1발(spd4,요청1.2,life60,size2)→parts4. radial/extra 색#441100 |
| 같은 두if | 100&lt;d&lt;120에서 charge를 먼저 설정한 뒤 slam이 s/st2를 덮는다. 두 Cd reset·echDx/Dy는 보존. elif/첫동작만 선택0 |
| 20049–20057,20119 | 명령은 eProjAt **요청값**이며 _beanRoll이 계수/색/속도를 바꾸고 life=trunc(life×1.5), 입오프셋/ang||facing 처리 후 warning으로 전달. 이 공통 알고리즘·패킷 생성은 새 모듈에 구현하지 않음 |
| 35674,31163 | 소환굴의 원소 undefined는 e.el에 그대로 저장된다. 입력 actor의 el 부재는 요청에도 키 부재로, 명시null은 키/값을 그대로 보존한다. P0 기본값/강제변환0. 명시 EL id0..6 외 잘못된 타입/범위는 진단 |
| 38884 /40519–40557 | 실제 owner의 st2 감소→AI 진입→공통 state 소비 순서를 유지해야 함. 현재 진입 tick에 또 st2를 감소시키지 않음. 공통 wind/charge/slam·벽 클립·sweep/Player피해/포이즈·주변KB는 기존/후속 owner 영역 |

39에 _chgSpd가 없으면 기존 common eCharge가5를 읽는다(40527 인접). 기존 field가0/17/42 등으로 있으면 이를 덮지 않고 source||5 규칙에 맡긴다. 30은 진입 시 자기42/17/90으로 덮는 원본 그대로다.

### Pbean 요청과 실효 — 원본 소비자 관측, Godot 신규 패킷 구현 아님

ATK31, 실제 eSlamWind에서 원본 eProjAt/bean을 고립 실행한 receipt(`source-request-examples.json`):

| 요청 | source bean 계수 | source warning 전 raw damage | life 요청→source |
|---|---:|---:|---:|
| 32 radial P,1.3 | 1.2 | 37 | 200→300 |
| 32 aim P,.8 | 1.2 | 37 | 60→90 |
| 39 radial P,1.5 | 1.2 | 37 | 250→375 |
| 39 extra D,1.2 | 1.0 | 31 | 60→90 |

신규 정책에는 요청 계수와 원소를 그대로 보존하고, normalized damage/속도/실탄/60f warning을 출력하지 않았다. 이 **원본 JS receipt3,202건**은 Godot 탄생성 PASS가 아니다. 기존 RAW_KEYS/source actor gate를 제거해 이 패킷을 붙이지 않았다. undefined 원소 역시 후속 실제 sentinel/binding 인수 없이는 실제 지원으로 세지 않는다.

## 검증·문서 대조

Godot4.7.2.stable.official.ed1daf0bf. 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을 기록했고2이상이면30초씩 대기했다(총6회). 새 테스트는 `EXODUSER-ec2-04-Isolated-20261020`, 기존은 각 파일 상수, 상수 없는 순수fixture/계약/factory 등은 작업 격리명. override는 매회 설정·finally0byte. --no-checkout/non-cone sparse로 필요한 source/scripts/tests/docs/회귀 리소스만 checkout했다.

신규 oracle는 원본의30/32 전체 전용if,39 charge/slam clock+두if만 발췌해 Node VM에서 실행한다. 39 분노/포효 prefix는 계산하지 않고 명시 후속입력 fixture로 최신facing/atk/x/y/s를 공급한다. path predicate는 true/false 읽기 fixture, _T/SFX/text/parts/shake는 명령 수집, Math.random 호출은 오류다. eProjAt/_beanRoll은 원본만 실행해서 reference를 기록한다. game/DOM/실제World를 부팅하지 않았다.

최종 **2,639사례**에서 원본 actor 사본 전체·T감소·commands 순서/인자·path 호출 시점/횟수/길이·입력불변을 binary64 **정확 비교(허용오차0)** 했다. 엄격한40/80/100/120/1200 양쪽, stale d 대 현재거리800, idle1회, charge뒤slam overwrite, partialtimer 조건, null/undefined12사례, 비수치/누락/미연결 predicate 진단을 포함한다.

기존 M29Script도 신규 테스트에서 **fixture Dictionary만**으로 호출했다. 30 진입90·aimMax90이 잠금67.95에서 추적하지 않고 그보다 클 때만 추적, wind 종료는17, 다음 common 이동은42를 소비함을 확인했다. 39는 전조 없이30으로 진입하고 다음 common 이동에서기본5/st2=29. 실제 플레이어·맵 스윕/공용 실행 순서를 자연 부팅으로 검증한 것이 아니다.

| 실제 실행 label | 결과 | exit/raw ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-elements-final` | 30307/0단정 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_ch2_poison_zone_policy` | 18512/0단정 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_ch2_enemy_constructor_policy` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_enemy_mod_m29` | 143/0단정 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_m30_epicenter` | 4그룹/실패단정0 | 0/1/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_p1002f_dedicated_hurte` | 357/0단정 | 0/0/1 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |

신규 **30,307/0**, 회귀10종 실패단정0·SKIP/미완그룹0. 단정 수와 그룹 수를 합산하지 않는다. M29 ledger는143단정/14그룹 PASS·failures[]를 원문에서 읽어 exit만으로 판정하지 않았다. 첫 unit30092/0, 조준잠금2단정 보강 unit-final30094/0 후 소환굴 undefined/null12사례와 타입진단을 정정한 최종 전체unit을 재실행했다. source undefined를 누락오류로 잘못 취급했던 음성단정을 실제 양성 보존검사로 대체했으며 P0 강제/비교삭제/허용오차 확대0. 기존 제품/테스트 byte가 같음을 보호검사로 확인했다.

**M30 raw ERROR1은 음성검사의 의도된 출력이며0으로 숨기지 않는다.** test_m30_epicenter.gd:334–336이 존재하지 않는 필수 원본 텍스처로 configure를 거부시킨다. 결과 expected_missing_resource_rejections=1, passed4/failed_assertions0/incomplete_groups[]와 원문1건을 대조했다:

```text
ERROR: Required packaged original M30 texture is missing: res://assets/vfx/__missing_required_M30_original__.png
```

이 오류와 backtrace 전체는 err.log 그대로다. 가짜 대체 이미지/검사 삭제/ERROR suppress/제품 수정0. 다른10suite는 ERROR0이다. import exit0/ERROR0/WARNING0. 종료 경고는 실제 원문을 아래 별도로 보존하며 원인/선재 여부는 미확인이다.

- `test_native_element_projectiles`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``
- `test_p1002f_dedicated_hurte`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``
- `test_p3002_spawn_holes`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``

문서 전체 돌진/충격파/eChargeWind/전용timer/EC2-04 검색613일치행을 저장했다. 9_적AI패턴디자인.md:248–275의 동물형30=90/42×17/714+r·aim .755와 몬스터_공격시스템.md:138/144의 common 피해×30/전조는 원본과 일치한다. 이를39에 일괄 적용하지 않는다(그 문서 적용대상은22/30/43). 요청1.3/.8/1.5를 실제탄 계수로 읽는 해석은 원본 bean/P1.2와 다름을 위 표에 기록했다. 다른 담당 설계·WORK_BOARD 수정0, 신규 구현 상태와 미연결을 이 보고서/CHANGELOG에 동기화했다.

## 실제 연결에 필요한 공용 접점 — 이번0줄

순수 전용 trigger 정책은 공용 변경 없이 완료 가능하므로 BLOCKED가 아니다. 실제 전투 연결은 별도 배정/인수 전 구현하지 않는다.

| 위치 | 필요한 소비·근거 |
|---|---|
| enemy_factory.gd25–31/60–61 | 30/32/39 실제 actor/schema/필드 소유·admission 필요. CH1 exact gate 삭제/범용crawler fallback0 |
| enemy_mod_m29.gd172–272·type7 binding | 30 전용진입값을 기존 wind/charge에 공급할 actual actor adapter, hit/context/공용 clock이 필요. 38884의 선행 st2 감소와 진입 same-tick 소비를 중복시키지 않음. M29 modifier trigger/lock 자체를30전용 trigger로 바꾸지 않음 |
| 원본40550–40557·Player/World·normal field owner | 32/39 eSlamWind 종료의 radius70+r/직접ATK×2·아군KB/연출·recover50 실제 소비는 별도. M30 radius125/54tick 독립 장판으로 대체하지 않음 |
| native_element_projectile_emitter.gd89–108 및 World birth/warnings | source actor3/7/21 경계와 실제 eProjAt/bean/입오프셋/60f warning/정규화1회 소비 필요. 요청을 최종 packet으로 오인하거나 gate를 단순 확장하지 않음 |
| 39 actor prefix owner (source39255–39271) | roar clock·enrage·주변아군 강화 뒤 최신 atk/facing/state를 제공해야 함. State/ally writer를 이 pure 모듈에 새로 만들지 않음 |

다음 EC2-05 brood/spawn은 착수하지 않았다. 실제 type30/32/39 자연 도달·실창·PC·전역 RNG·동적geometry/sweep·Q/E 전체·실탄/보상/저장 연결은 **미확인**이다.

원로그 `~/exoduser-wt/_out/ec2-04/`: start/최신WORK_BOARD·원본·설계, source-oracle.cjs/json·source-request-examples.json, unit/회귀 out/err/engine/json, validation-summary.json, godot-count.log, 보호 해시/Git 감사/DONE. 제출은 자기6파일 정상 훅·자기브랜치push·원격SHA확인·DONE 기록 후 자기worktree 제거. main push/force push/add-A/훅우회0·R불변이다.
