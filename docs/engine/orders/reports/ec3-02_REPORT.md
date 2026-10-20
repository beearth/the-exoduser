# EC3-02 — 3장 catalog·전용 초기 literal projection

작업ID `ec3-02` · 브랜치 `codex/ec3-02-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·충돌·정확한 완료 범위

| 항목 | 확인 결과 |
|---|---|
| 기준·의존 | fetch 후 최신 `origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d`. EC2-02 `a10924eb0ee725b993ab7bd1ea019d99180d4e1c`가 main에 포함됨을 ancestry로 확인하여 **main에서 직접 분기**. EC3-01 e7104429는 아직 main에 없지만 이번 catalog는 selector를 소비하지 않으므로 반입하지 않음. 다른 담당 WIP·미인수 Mac 체인 병합0 |
| 지시서 | 원격 `codex/trace-enemies-ch3-20261020=20b2139a7f140f13dc37deb082e471c494d6fa77`의 [EC3-02 행·§1.2](https://github.com/beearth/the-exoduser/blob/20b2139a7f140f13dc37deb082e471c494d6fa77/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md). catalog10행/38초기필드·literal원순서만, 전체 actor/HP 권위 별도라는 경계를 적용 |
| WORK_BOARD | 최신 main의 P2-008a/FIX 병합·P2-008b=CH1 order11/9·47 actor/factory 진행, TRACE-ELITES 문서 등을 읽음. 신규 catalog projection/test와 소유 파일 교집합0. 47의3필드도 source 자료 projection뿐이며 PC actor/clone/TP/등록은0줄 |
| 재사용 | 실제 `native_ch2_enemy_constructor_policy.gd::Draws`(33–50행)를 preload해 provider검증/실제count/error를 직접 사용. EC2-02의 context/READY fields·catalog·draws·complete_actor=false/NOT_READY 형식 재사용. **CH2 52필드·HP/레벨/방어/공격 생성식을 복제하지 않음** |
| 변경6파일 | 신규 `godot/scripts/native_ch3_enemy_catalog_policy.gd`·`godot/tests/test_ch3_enemy_catalog_policy.gd`·각UID, 이 보고서, CHANGELOG_SYNC 최상단 자기 절 |
| 보호 | 공용 Main/State/world/factory·다른담당·EC2·기존테스트·원본·저장 형식0줄. 기존 source/scripts/tests/data/scene 374파일 byte 동일. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`/branch `codex/mac-live-play-time-main-20261017`/tracked INDEX·WORK 불변 |

이번 READY는 **부분 catalog/초기값 계산**이다. Godot의 CH3 HP/ATK/speed/radius/elite/mods/aura·collision·skin·실 actor를 만들지 않는다. EC2-02의 전체 `build()`는 stage4..9/etype30..39 guard를 그대로 유지하며 CH3 context에 NOT_READY인 것도 검사했다. 이를type33/stage4로 속여 호출하거나 guard를 넓히지 않았다. 전체 공통 constructor 지원은 아래 통합요청에서 **HOLD**다.

## 최신 main 원본·catalog

game.html은 최신 main과 checkout byte 동일, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`. 원본30823–30920의 catalog 값이며 생성된 적의 HP/ATK/방어값과 구분한다.

| etype | HP/ATK | rawSPD | R/poise/shield% | range | col |
|---|---|---:|---|---:|---|
|40|13/6|.21|10/5/0|600|#551133|
|41|64/18|.24|12/28/70|400|#442233|
|42|96/22|.09|18/45/0|400|#663344|
|43|32/14|.54|10/12/0|200|#882211|
|44|48/18|.6|10/15/0|400|#443322|
|45|19/22|.3|10/5/0|600|#553344|
|46|128/18|0|20/55/80|400|#332222|
|47|48/14|.36|12/18/0|400|#221122|
|48|32/12|.24|10/10/0|800|#664422|
|49|192/30|.24|25/60/0|1000|#330011|

`catalog_for(etype)`는 EC2-02 catalog와 같은 키 hp/atk/raw_speed/speed/r/poise/shield/range/col을 반환한다. 30858의 **rawSPD==0 ? 0 : max(.2,raw×1.3)**를 보존하여46의 mapped speed는0이다. 그뒤31138의 U×.08·×1.5/M02가 실제 생성 speed에 영향을 주는 것은 기존 core의 권위다. source JS fixture에서46의 양수 jitter도 관측했지만 이 모듈이 생성 speed를 구현한 증거가 아니다. catalog41/46 shield70/80%를 생성HP 기반 eShield에 덮어쓰지 않았다(31164/31184).

## 38필드와 실제 literal 위치

`build(context,random_unit)`의 context는 stage10..13/etype40..49만 필요하다. 다른 core context는 읽거나 계산하지 않는다. API 반환은 EC2-02 형식의 status/fields/catalog/draws/complete_actor=false, 실패에는 reason과 실제draws만 있고 fields가 없다. **호출 지점은31263 직전**, 즉31260의 `_bossOrbitAng` 소비 뒤이며31300 `_erraticAng`보다 앞이다. 새 모듈이 앞뒤 RNG나 CH2 필드를 먼저 소비하지 않는다.

| etype / source | 초기화 원래 순서 (U는 각기 별도) | 전용draw |
|---|---|---:|
|40 /31263–31265|_wraithPhaseT120+60U → PhaseCd240+80U → Phasing=false|2|
|41 /31266–31270|_dkGuardCd150+50U → GuardT80+40U → Guarding=false → SlashCd100+40U → SlashT40+20U|4|
|42 /31271–31273|_fmAbsorbCd180+60U → SpitCd200+80U → SpitT80+40U|3|
|43 /31274–31275|_ddLungeCd80+30U → LungeT30+15U|2|
|44 /31276–31278|_torChainCd100+40U → ChainT40+20U → Bleed=.4|2|
|45 /31279–31280|_wdSwoopCd90+40U → SwoopT30+15U → Ox0/Oy0|2|
|46 /31281–31284|_pillarRingCd180+60U → RingT60+30U → AoeCd300+80U → AoeT80+40U|4|
|47 /31285–31287|_stCloneCd200+60U → CloneT80+40U → TpCd120+40U|3|
|48 /31288–31291|_hpHealCd200+80U → HealT80+40U → BuffCd250+80U → ProjCd120+50U|4|
|49 /31292–31298|_adPhase0 → FireCd150+50U → FireT60+30U → SummonCd400+100U → ChargeCd200+60U → SlamCd250+80U → SlamT80+40U|6|

모든 type에서38키를 원래 순서로 반환한다. 대응하지 않는 timer는9999, _torBleed는0, _adPhase는−1이다. Phasing/Guarding=false와 Ox/Oy0은 모든type 공통이며 추가draw0. _fmAbsorbCd나48의Buff/ProjCd를새T필드로이름바꾸지않는다. 초기literal만계산하며 AIclock 감소/재추첨/Phase전환은구현하지않았다.

이 초기slice에는~~연산이 없어 새ToInt32나HP식을만들지않았다. bitwise변환이필요한후속consumer는기존 `combat_stat_formula::js_to_int32`(228행)를재사용하는경계를유지하며공통부품0줄. 공통HP식의현재구현은EC2-02에유지하며CH3전체생성소비는HOLD다.

## 원문 oracle·실행 검증

Node24.15.0 내장fs/vm/crypto만사용한다. `--node-bin`필수인자, helper/결과JSON은격리userdir UTF-8임시파일, OS.execute출력은진단join만사용한다. 사용후제거하며기존파일덮어쓰기0. 전체source SHA·catalog선언SHA `2dbfc1df07aa9d46f52e8336d8c2a9b240bfaf10844cd5b52ef7dc024b3a5e41`·38field sliceSHA `31221a11f3cdd18e3e5cc9db723685e663e207b69faa136fa24f3f28a55d680a`를pin하고 double은little-endian binary64/base64로복원하여실제소비bit열까지대조했다(허용오차0).

원본mkEn함수와catalog선언/level·elite/mod/aura정의를발췌해VM에서실행하고,38field시작과erratic직전에 **RNG를소비하지않는관측mark만** 삽입했다. canMv=true/safePt미사용/GPUoff/skin빈함수는명시fixture다. 자연tier와강제tier0/1/2/3시험이며실제collision/skin/게임전체constructor검사가아니다.

Godot측은관측prefix를fixture로소비→본policy의38field projection→suffix를fixture로소비했다. prefix/suffix재생에도기존EC2-02 Draws를썼다. 전체literal사이에정확한38slice만삽입했을때순서/값/소비를검사했으며 **Godot CH3 공통HP/constructor구현·검증증거가아니다**.

최종 **1,000사례**: 4stage×10type×자연/강제4tier×U0/.5/1직하/ramp/seeded stream. catalog모든값·38field값/키순서·앞뒤numeric fixture소비bit열·대응draw2..6/입력불변을비교했다. 잘못된stage/type/context/Callable, 각type모든matching draw위치에서null/bool/string/음수/1/NaN/±Inf의실패count를확인했다. 중간실패를수정/되감기/READY로대체하지않는다.

| 최종 채택 실행 label | 결과 | exit/raw ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-final` | 12602/0단정 | 0/0/0 | `EXODUSER-ec3-02-Isolated-20261020` |
| `test_ch2_enemy_constructor_policy` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts-retry` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec3-02-Isolated-20261020` |
| `test_encounter_factory-retry` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec3-02-Isolated-20261020` |
| `test_p3002_spawn_holes-retry` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |
| `test_native_element_projectiles-retry` | 4그룹/실패단정0 | 0/0/1 | `EXODUSER-ec3-02-Isolated-20261020` |

신규 **12,602/0**, 회귀6종 실패단정0·최종 ERROR0·SKIP/미완그룹0. 단정·그룹수를합산하지않음. EC3-01은 main에없고 catalog의 런타임 의존이아니므로 반입/재실행0. 최초unit-01도12602/0이었고, 반지름44의docs불일치라벨을8로정정한 최종unit을 전체재실행했다. 정책 계산/단정/기대값 변경0.

### 최초 import crash·회귀 실패도 보존

첫 `--editor --import --quit`는 **exit−11(SIGSEGV), stderr ERROR0/WARNING0**로 중단됐다. 마지막 import항목은 NotoSerifKR-VF.ttf였으며 macOS crash report는EXC_BAD_ACCESS/KERN_INVALID_ADDRESS(0x10)를기록한다. **근본원인/새모듈과의인과는미확인**이다. 성공으로집계하지않았다.

그 상태에서 실행된 아래4회귀는 `.godot/imported/ki_slash_silver_sheet...ctex` 등 import캐시 누락 ERROR를 기록했다. contracts는 exit0/실패단정0이어도 ERROR14라 채택하지 않았다.

| 최초 label | exit | 실패단정 | raw ERROR |
|---|---:|---:|---:|
| `test_contracts` | 0 | 0 | 14 |
| `test_encounter_factory` | 1 | 5 | 11 |
| `test_p3002_spawn_holes` | 1 | 1 | 11 |
| `test_native_element_projectiles` | 1 | 4 | 14 |

보호source를수정하지않고 같은import명령을재실행한 `import-retry`는exit0/ERROR0/WARNING0으로완료했다. 뒤에해당4회귀를 `-retry`로재실행하여위최종표의PASS를확인했다. 캐시/리소스 dummy대체·오류suppress·테스트약화0. 최초raw ERROR50/실패단정10 및crash는별도원문으로보존하며최종ERROR0에숨기지않는다. Godot실행14회(2import+12test시도)와채택7suite를구분한다.

최종 종료경고(원인/선재 여부 미확인):

- `test_p3002_spawn_holes-retry`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.`` / ``WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).``
- `test_native_element_projectiles-retry`: ``WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.``

Godot4.7.2.stable.official.ed1daf0bf. 매실행전정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`을기록하고2이상이면30초대기(총1회). 새 `EXODUSER-ec3-02-Isolated-20261020`, 기존각상수, 상수없는fixture는작업격리명. override매회설정/finally0byte. --no-checkout+non-cone sparse로필요scripts/tests/docs/회귀리소스만받았다. 다른세션/프로세스종료0.

## docs 대조·통합 요청(HOLD)

| 위치·근거 | 대조/필요한 후속 권위 |
|---|---|
| docs 전체검색231행 | catalog/_wraithPhase/_dkGuard/_fmAbsorb/31263/EC3-02 검색원문보존. 원격CH3 §1.2/§2와대조. 총관리.md960–969의HP/ATK/rawSPD는일치. **총관리964의44반지름8은최신원본10과불일치**라기록하고원본10사용. 46고정형표기는rawSPD0과구분하며생성jitter를0으로바꾸지않음. 기존설계문서0줄, 이보고서/CHANGELOG에정확경계보충 |
| EC2-02 build57–139/catalog142–146/guard148–164 | 전체공통HP/수치생성을CH3에서소비하려면별도catalog/provider·literal hook의정확scope가필요. 현재136orbit/137erratic은인접하므로CH3 38필드가**그사이에**와야한다. 기존guard를단순확장하거나CH2필드를복제해해결하지않음. 공용core분리/API통합배정전 **HOLD** |
| 원본31120–31363/31260/31263–31298/31300 | collision→elite/mods→stats→literal→skin의실authority와공유stream이이번partialprojection을정확사이트에서소비해야함. 새모듈은그권위를가지지않음. ToInt32/레벨/HP/방어공식을새로복제하는통합안0 |
| factory.gd25–31/60–61·실actor/World/Main | source/domain/스킨/피격필드/admission과실공간등록을별도인수해야함. CH3catalog자료/47초기값이실actor지원증거가아님. factory exactguard 삭제·범용crawler 대체0 |
| State·Player·regions·save | 실제HP/피해/poise/쉴드·죽음/처치·보상/저장은기존권위. 새Statewriter/저장키0. 실제연결은별도HOLD |

catalog10/초기38필드의순수단위만완료했으며실HP/전체constructor·actor·공용분리·4에리어자연도달·PC/실창·전체RNG/skin동등성·저장/전투완료는 **미확인**이다. 다음EC3-03은착수하지않았다.

원로그 `~/exoduser-wt/_out/ec3-02/`: start/최신WORK_BOARD·AGENTS·원본/원격지시서ref, source-oracle.cjs/json·test-body.gd, 최초import/CrashIPS/summary·초기회귀오류·retry/최종out/err/engine/json, initial-validation/validation-summary·godot-count·보호hash·Git감사·DONE. 정상훅·자기branch push·원격SHA일치·DONE 후자기worktree제거. R불변·mainpush/force/reset/add-A/훅우회0.
