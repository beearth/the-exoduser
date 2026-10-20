# EC2-06 — 수인·사행·포식 전용 계산 정책

작업ID `ec2-06` · 브랜치 `codex/ec2-06-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·소유권·변경 범위

| 항목 | 확인 결과 |
|---|---|
| fetch 기준 | 최신 `origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d` = 최소6d987cb8a. EC2-05가 main에 없으므로 허용 예외대로 `699f2a56f1b517f9c015c56366e044a860395475` 끝에서 분기. EC2-03/04/05 미병합 의존 포함. 최신 main 전체 통합 코드로 검증했다는 뜻이 아님 |
| 원본 | 최신 main game.html과 checkout byte 동일. SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 아래 원본 행은 이 최신 main 기준 |
| 승인 순서안 | [cf57f721 §4.2 CH2E-06](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md): 35콜백0/250/500ms·현재atk·조건,36별도RNG/_now,37뒤좌표/실패windup/시체이동. clock/실시체owner/pause 계약 없는 제품연결HOLD 유지 |
| WORK_BOARD | 최신 main의 P2-008a/FIX=CH1 ice/crawler병합, P2-008b=CH1order11/9·factory진행, TRACE-CH1-ENEMIES/ELITES=문서진행, P3-002=소환굴/동적등록병합을 확인. 신규35/36/37 계산 파일과 진행 소유 경로 교집합0. 보드/기존actor/factory/world 수정0 |
| 변경6파일 | 신규 `godot/scripts/native_ch2_beast_predator_policy.gd`·`godot/tests/test_ch2_beast_predator_policy.gd`·각UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | 공용·다른담당·기존테스트·원본·저장 형식0줄. 기존 source/scripts/tests/data/scene 248파일 byte 불변. 기존JSint32부품 재사용·최신 main과 동일 확인. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`/branch `codex/mac-live-play-time-main-20261017`/trackedINDEX·WORK 불변 |

## 원본 전수 계약·전용 API

RefCounted의 반환은 사본/순서 있는 요청이며 `product_connected=false`이다. 실제 clock·등록·HP/ATK/poison·시체·World에 쓰지 않는다. `advance_clocks`로 최초idle 여부를 한 번 보존하고 각 전용 사이트를 순서대로 호출한다. 뒤에서 s가windup/recover로 바뀌어도 최초idle guard를 재검사하지 않는다. 기존 공통windup/attack FSM·hurtP·geometry·scheduler는 이식하지 않았다.

| 최신 main game.html | 이번 보존 계약·API |
|---|---|
| 39175–39185 | 35 idle 두T−sp. comboT≤0/d&lt;40→T=Cd→0/250/500ms index0/1/2 지연요청→telegraph20/windup/st2=15/text 연타!(y−15,#993311,25). `plan_combo`는 요청만 만들며 **0ms도 즉시 실행하지 않는다** |
| 39180–39183 | 실제 콜백 때 !dead·hp&gt;0·!stunned, 현재Math.hypot&lt;60일 때 현재atk×(.7+index×.15)를~~한 hurtP. idle/alive/Player무적 조건 추가0. `plan_combo_hit`에 fresh actor/current distance/index를 공급. ATK·P위치를 예약 시 캡처하지 않음 |
| 39182 | hurtP **이후** 현재 P좌표/e.col로 parts4→text 연타!(P.y−10+index×12,#993311,20). `finish_combo_hit`는 fresh actor/Player를 요구하며 hurtP가 거절되거나 actor가 죽은 뒤에도 source대로 후속 연출을 계산. 피해 자체는 외부 owner |
| 39187–39195 | combo뒤 독립roar if: roarT≤0→Cdreset→text(y−20,#ff4400,35)→현재dst&lt;800이면groggy→shake4→ens 현재순서/길이. !ally.dead·identity≠parent·현재Math.hypot&lt;200일 때(_aSpdM\|\|1)×1.3/atk~~×1.3→text 강화!(y−10,#ff8800,25)→parts4. `plan_roar`/`plan_roar_ally`는 사본만, alive필터/baseAtk/TTL 추가0 |
| 39199–39206 | 36 idle zigT−sp. ≤0/d&lt;1200→Cdreset→angle=facing+sin(_now×4)×.8, speed=e.speed×2×(_aSpdM\|\|1), xy+=cos/sin(angle)×speed×sp×10. `plan_zig`가 읽기 can_move(x,y,r)결과true일 때만 사본 이동. 실패해도 Cdreset은 유지. 벽/안전좌표/결계 로직 복제0 |
| 39208–39210 | d&lt;50이면 독/꼬리는 **서로 다른 순차 RNG**: U&lt;.1sp→(P.poison\|\|0)+3/text 독!, 다음U&lt;.05sp→hurtP(~~(현재atk×.6))→현재actor좌표text 꼬리!→현재P좌표parts6. `plan_serpent_poison`→요청소비→`plan_serpent_tail`→hurtP소비→`finish_tail_hit`. 독성공으로tail draw를 건너뛰거나 한U를 재사용하지 않음 |
| 39214–39218 | 37 idle stealthT−sp. !cloaked·T≤0·d&lt;1200이면cloaked/T=Cd/text 은신...(y−15,#cc8855,25). `plan_stealth` 사본 |
| 39219–39224 | 그뒤 cloaked/d&lt;1200이면 현재P.facing+PI 뒤30px/canMv. 이동실패해도 **cloaked=false/telegraph20/windup12** 및현재위치기습text→charge. !_predAtkBoost 최초만 flag/base snapshot/현재atk~~×1.5, baseAtk변경0. `plan_ambush`는 읽기predicate 필요. 실패를동작취소/재시도로바꾸지않음 |
| 39226–39231 | rate&gt;0에서만 별도U&lt;.01sp→ens순서 첫 dead/현재거리&lt;60 시hp=min(mhp,hp+~~(mhp×rate)), 시체x/y=-9999, parent parts6, **break**. `plan_corpse_scan`→`plan_corpse_candidate`가 matching/사본을 반환. fullHP여도 첫시체소비, 보스/자기/추가alive 필터·배열삭제/새corpse소유자0 |
| 34394–34412 /38770 | 공통 aura pass가 _aAtkM/_aSpdM/_aDefM을reset, 각 updateE는 atk=baseAtk reset 뒤 modifier/전용AI. 포효·첫기습의현재atk쓰기를영구buff/새baseAtk/TTL로확장하지않음. 이 정책은 **reset후 실제owner가 준 최신 atk**를 읽으며 공용reset 자체를 수행하지 않음 |
| 60461 /61876–61885 | _now는기존gameTime/update/renderphase에서공급. 정책은 raw now를sin(now×4)에그대로 사용. 새 시간원/초변환/시간 authority 없음. setTimeout의pause/씬전환/사망뒤수명은별도인수전미확인 |

Math.hypot/dst 사이트의 **현재 거리 scalar는 외부 입력**이다. 신규 모듈은 Math.hypot/geometry를 다시 구현하지 않는다. 하니스는 원본이 실제 읽은좌표차/거리순서를 기록하고 각 API에 넘기기 전 fresh좌표 인자까지 정확 대조했다. 해당 distance 값의Godot계산/실World 연결이 끝났다는 뜻이 아니다. 36/37 이동 사이트에 도달하면 collision Callable이 필요하며, 누락/비bool 반환은 NOT_READY다. 잘못된type/context/clock/미연결RNG도진단하며검사삭제나대체true0이다.

## 검증

신규 하니스는 **필수 `--node-bin=...` 인자**, 격리 userdir의 임시 helper/결과JSON UTF-8 파일을 사용한다. OS.execute 첫덩어리나stdout JSON에 의존하지 않으며 진단만 join한다. 실행기는 실제 Node24.15.0 경로를 인자로 공급, 테스트에고정설치경로/PATH기본값0. helper/JSON실행후제거·덮어쓰기방지·원본SHA검사·binary64운반/정확비교(허용오차0).

원본35/36/37 전용if 전체를 발췌해 VM에서 실행했다. setTimeout은 함수참조/지연값을수집하고 **수동으로콜백본문을실행**했다. canMv는true/false 읽기fixture, hurtP는수신기록/명시fresh상태변이fixture, addParts/SFX는명령과외부RNG소비fixture다. 실제Player피해/실시간경과/실시체/공용부팅/연출결과PASS가아니다.

일반 878사례: timer/sp/idle-recover,40/50/1200 strict경계, roar800/ally200 strict경계·self/dead/alive=false, .1sp/.05sp 독립확률·sp0/10/20·_aSpdM0/null/부재/.5, now0/.125/.25/1, canMv성공/실패, cloak/boost선행flag, healrate−1/0/.3·hp0/99/100·firstcorpse거리60를대조했다. actor/Player/ally/corpse사본,command/RNG/현재거리사이트순서,원래입력불변을비교했다. near경계나노수준·sin/cos계산도선택표본에서binary64정확일치했다. 모든finite입력/모든플랫폼trig동등성을증명한것은아니다.

콜백 240사례: index0/1/2, 현재dead/hp0/stunned/recover, ATK10/101/−31/2147483648, 거리59.999999/60, hurt후좌표/ATK/색/dead/stunned변이. **예약 당시ATK31이아닌현재ATK**와post-hurt새위치/색이소비됨을원본콜백과비교했다. JSint32는기존combat_stat_formula 부품을호출했으며 공통피해공식/새타이머를중복구현하지않았다.

| 실제 실행 label | 결과 | exit/raw ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-01` | 12158/0단정 | 0/0/0 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_ch2_brood_spawn_policy` | 33875/0단정 | 0/0/0 | `EXODUSER-ec2-05-Isolated-20261020` |
| `test_ch2_charge_slam_policy` | 30307/0단정 | 0/0/0 | `EXODUSER-ec2-04-Isolated-20261020` |
| `test_ch2_poison_zone_policy` | 18512/0단정 | 0/0/0 | `EXODUSER-ec2-03-Isolated-20261020` |
| `test_ch2_enemy_constructor_policy` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_enemy_mod_m29` | 143/0단정 | 0/0/0 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_m30_epicenter` | 4그룹/실패단정0 | 0/1/0 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_native_element_projectiles` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec2-06-Isolated-20261020` |
| `test_p1002f_dedicated_hurte` | 357/0단정 | 0/0/2 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |

신규 **12,158/0**, 회귀12종실패단정0·SKIP/미완그룹0. 단정수/그룹수합산0. M29 ledger143checks/14group PASS/failures[]를읽어exit만으로PASS처리하지않음. import exit0/ERROR0/WARNING0. 신규실행실패/재실행0.

M30 raw ERROR1은기존음성검사(test_m30_epicenter.gd334–336)의의도된출력이다. expected_missing_resource_rejections=1/4그룹실패0/미완0과원문을대조했고ERROR0으로숨기지않았다. 다른12suite ERROR0.

```text
ERROR: Required packaged original M30 texture is missing: res://assets/vfx/__missing_required_M30_original__.png
```

종료경고는아래원문/err.log로보존. 원인·선재여부는미확인이다.

- `test_native_element_projectiles`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``
- `test_p1002f_dedicated_hurte`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 2 ObjectDB instances were leaked at exit (run with `--verbose` for details).``
- `test_p3002_spawn_holes`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``

Godot4.7.2.stable.official.ed1daf0bf. 실행전정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을기록하고2이상이면30초대기(총2회). 새 `EXODUSER-ec2-06-Isolated-20261020`, 기존각상수격리명, 상수없는fixture는작업격리명. override는매회설정/finally0byte. worktree는--no-checkout+non-cone sparse로필요scripts/tests/docs/회귀리소스만받았다.

## docs 대조·후속 공용 접점(이번0줄)

| 위치·근거 | 대조/미연결 |
|---|---|
| docs 전체키워드457일치행 | 수인/사행/포식/beast/serpent/predStealth/predCorpse 검색원문보존. 몬스터_총관리.md421–423/938–940의3연타·주변30%/독+꼬리/시체흡수와원본일치. 몬스터_공격시스템.md356–358의공통사거리400/400/600은전용발동40/50/1200의대체조건이아님. 상세수치/순서/미연결을이보고서·CHANGELOG에보충. 다른담당설계문서0줄 |
| enemy_factory.gd25–31/60–61 | CH1schema·stage0/time0 gate불변. 35/36/37 실제actor・sourcefield/hurtE계약/admission은미인수. 기존crawler/factorygate를완화해실행시키지않음 |
| 신규35actor scheduler 부재 /원본39180–39183 | 요청을실제owner참조로예약·사망/씬/일시정지때콜백수명·0ms비동기순서를정해야함. 현재API는현재view입력으로계산만, 실제타이머연결HOLD |
| world.gd3219 can_move /원본39206·39221 | double좌표/radius와실제collision/bonfire/phase를읽기binding해야함. fixturetrue/false는제품판정근거아님. 공용geometry추가수정0 |
| player.gd866/909 및기존Player상태owner /원본39182·39209–39210 | hurtP/poison실제집행·반환후freshP/actor조회필요. private HP setter/가짜타격을실제피해로세지않음. 이API는공용피해owner완료증거아님 |
| ens/시체 실제owner 부재 /원본39227–39231 | 현재배열순서/정확identity/dead/HP/시체xy이동을같은권위에연결해야함. corpsepool/delete/revive/지역등록을이전용계산이소유하지않음. 실제writer인수전HOLD |
| 공통aura·updateE·State /원본34396/38770 | 최신ATK/_aSpdM과reset/오라/포효/기습의순서를전달해야함. 전역시간·버프영속/저장key·actual State쓰기0. 새baseAtk/TTL0 |
| 기존연출/RNGowner /원본43927·39193·39223 | addParts/SFX의실제pool/공유RNG소비를원래사이트에서끝낸뒤다음입력/roll을읽어야함. fixture의0/2draw는실제연출RNG재현이아니라경계순서검사 |

이번순수계산단위는공용수정없이완료가능하며, 위실제연결은구현하지않았다. 실actor/World/factory 연결·PC/실창·실시간pause/씬전환·실시체수명·전체RNGstream·독/타격/보상/저장/전투품질은 **미확인**이다. 다음EC2-07은착수하지않았다.

원로그 `~/exoduser-wt/_out/ec2-06/`: start/최신WORK_BOARD·AGENTS·원본/승인설계, source-oracle.cjs/json·test-body.gd, unit/import/회귀out/err/engine/json, validation-summary/godot-count/보호hash/Git감사/DONE. 정상훅·자기브랜치push·원격SHA대조・DONE 후 자기worktree 제거. R불변·mainpush/force/add-A/훅우회0.
