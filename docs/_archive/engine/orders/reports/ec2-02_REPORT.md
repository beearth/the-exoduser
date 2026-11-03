# EC2-02 — 2장 etype30..39 constructor 수치·초기 타이머 정책

작업ID `ec2-02` · 브랜치 `codex/ec2-02-20261020` · **REVIEW_PENDING** · 2026-10-20 KST.

## 기준·의존·소유권

| 항목 | 정확 상태 |
|---|---|
| 최신 main | fetch 후 `origin/main=299e48ac4dfbb7cedd313e791173c0d8ff20cb0a`. game.html SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` |
| 분기 의존 | EC2-01 c7e02549가 main에 없어 사용자 지시대로 `c7e02549bec082cc31a86e606a61ec78f28dfb27`에서 분기. 최신 main game.html과 이 기반의 원본 byte 동일 확인. 최신 main의 나머지 통합 코드를 병합했다고 주장하지 않음 |
| 승인 설계 | [trace-enemies-ch2 cf57f721 §4.2 CH2E-02](https://github.com/beearth/the-exoduser/blob/cf57f721041869f0b7a2c18383cafe7f4ef003dc/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md): 현재mkEn식·30..39전용초기timer/RNG literal순서·base/실효수치만, actor/State writer0 |
| 착수 전 중복 검사 | 최신 main WORK_BOARD: P2-008a=CH1 etype20·factory, P2-008a-FIX=빙결전사/crawler(이번 보드는main병합 표시), P2-008b=CH1 order11/9·factory(진행 중). P3-002 소환굴/World, P3-003 지역, 정예/CH1/보스 작업은 기존 담당 영역. 이번 신규2파일·자기UID만으로 소유 경로 교집합0. 보드 자체0줄, 보고서/DONE으로 인계 |
| 기존 authority 확인 | enemy_factory.gd:25–31/60–61의 CH1 known registry·time0 gate, native_source_normal_enemy_fields.gd의 actual actor/World 현재 호출 검증, type3_spawn_recipe.gd:40–114/149–154의 stage0 전용 builder, native_spawn_hole_system.gd:518–634의 CH1 선택/constructor/등록을 읽음. 이름만 바꿔 기존 type3/CH1 actor로 대체하지 않음 |
| 변경6파일 | 신규 `godot/scripts/native_ch2_enemy_constructor_policy.gd`, `godot/tests/test_ch2_enemy_constructor_policy.gd`, 자기UID2개, 이 보고서, CHANGELOG_SYNC 최상단 자기 절. 상속된 EC2-01 파일은 기존 의존이며 이번 수정0 |
| 보호 | 공용·다른 담당·factory·World·State·기존 테스트·원본·저장 형식0줄. R HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, tracked INDEX/WORK 불변 확인 |

## API·원본 근거

RefCounted `build(context:Dictionary, random_unit:Callable, sources:Dictionary)`는 **숫자 projection**이다. context는 stage4..9/etype30..39/difficulty0..10/player_level/stage_difficulty_offset의 명시 입력이다. 위치 충돌 검사를 이미 통과한 비보스의 계산 구간만 다루며, x/y/room/원소/스킨/전체 actor 객체를 만들지 않는다. 결과는 `status=READY`, `fields`52개, `catalog`9개, 실제 `draws`, `complete_actor=false`다. 잘못된 입력/연결/샘플은 NOT_READY·reason·실제소비 수를 반환하고 fields를 만들어 성공으로 가장하지 않는다. 지원 밖 context/무효Callable/누락 callback은 샘플0, 중도 오류는 소비를 되감거나 가짜값으로 보충하지 않는다.

sources의 필수 콜백은 `elite(stage,random_unit)->int`, `mods(tier,stage,random_unit)->Array[String]`, `aura(tier,stage,random_unit)->String|null`. 실제 common 선택 권한은 호출자가 제공한다. 정책에 rollElite/rollMods/rollAura 추첨 알고리즘·정예확률·접사 pool·오라 pool을 복제하지 않았다. shared RNG도 매번 호출자에게 주입받고 로컬 호출 카운터만 둔다. source provider의 draw는 같은 wrapper를 통해 전체 소비에 포함한다. 누락 시 정상등급/빈mods/오라없음으로 대체하지 않는다.

| game.html 원본 행 | 보존한 계약 |
|---|---|
| 9272,9276 | DIFF_LV_OFF -500..500 11단계, DIFF_MUL .45/.55/.65/.76/.88/1/1.12/1.25/1.40/1.58/1.78 |
| 30823–30920 | 30..39 catalog HP/ATK/rawSPD/r/poise/shield%/range/col. SPD는 max(.2,raw×1.3). 33 catalog r=10, 32 shield catalog60과 실제 생성 shield=HP는 별도 |
| 31125,31131–31140 | L=max(1,(P.lv||1)+난이도off+stageOff); rollElite→elite>0이면rollMods→speed RNG→radius RNG. speed=(mappedSPD+U×.08)×1.5→M02이면×1.5. r=(catalogR+U×2)×2×tier.scaleMul |
| 31033–31037 | 등급별 수치 배율만 소비: hp 1/2/3/5, atk 1/1.3/1.6/2, scale1/1.08/1.2/1.35. 등급 선택 authority와 구분 |
| 31119,31144–31151 | B=(L≤500?.4L³+199L+100:50,000,000×1.0014^(L−500))×2.925; pacing=1/(1+min(9,max(0,L−1))/18). HP=floor(floor(B×pacing×dm×hpMul)×(1+si×.02)); ATK=floor((50+L×1.95)×.6×dm×atkMul). 두 HP floor·연산 순서 유지 |
| 31155–31160 | 30..39 projCd240→M02이면trunc×.85→tier1/.8·tier2/.7·tier3/.6 trunc. 전체곱을 한 번만절삭하지 않음 |
| 31164–31171,31184 | poise/maxPoise/eShield/eShieldMax=최종 HP. st2=30+U×50→facing=U×PI×2→tier≥2일 때만 aura callback→projT=180+U×120→bossPatT=30+U×20 |
| 31235–31259 | 아래 타이머 표 literal 순서대로 해당etype만 샘플, 나머지9999. 37 corpseHeal .3/다른0 |
| 31260,31300 | 특수 AI가 없는31/33도 _bossOrbitAng와 _erraticAng 두 무조건 RNG를 소비. source대로 U×PI×2 |

| etype | 전용 초기 Cd/T (base+U×span), 모두 별도 U |
|---|---|
| 30 | wildCharge 60+U×30 / 30+U×20 |
| 31,33 | 해당 타이머 draw0, 전용24타이머 모두9999 |
| 32 | boulderSlam 200+U×60 / 80+U×40 |
| 34 | poisonZone 150+U×50 / 60+U×30 |
| 35 | beastCombo120+U×40 / 50+U×30 → beastRoar300+U×80 / 120+U×60 |
| 36 | serpentZig80+U×30 / 40+U×20 |
| 37 | predStealth200+U×60 / 80+U×40, corpseHeal .3 |
| 38 | broodSpawn180+U×60 / 60+U×30 → broodGas250+U×80 / 100+U×40 |
| 39 | elderRoar250+U×80 / 100+U×40 → elderCharge150+U×50 / 60+U×30 → elderSlam300+U×80 / 120+U×60 |

자연 일반 tier0에서는 전체 소비=기본9(rollElite1 포함)+전용0/2/4/6. 예: si4/L1/일반/etype32는 catalog96/18/poise40/shield60과 달리 생성 HP945/ATK31/poise945/shield945. 문지기의 mkEn 뒤 HP×4·ATK×2·elite3/poise80 같은 후대입은 여기 재계산하지 않는다.

## 실제 검증

Godot4.7.2.stable.official.ed1daf0bf. 신규 테스트는 지정 `EXODUSER-ec2-02-Isolated-20261020`, EC2-01/p1002f/소환굴은 자기 테스트 상수, 상수 없는 contracts/factory는 ec2-02 작업 격리를 사용했다. 실행 전 정확한 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l` 기록·2이상30초 대기(unit에서1회·소환굴에서3회 대기, 모든 표본은 godot-count.log에 보존), override 매회 설정·finally0byte. 필요한 회귀 리소스를 sparse에 넣고 실행했으며 기존 테스트/제품 수치 수정0.

테스트는 최신 main과 동일 byte의 game.html에서 literal·현재 mkEn·pacing·정예 선택 함수를 읽어 Node VM에서 실행한다. 원본 숫자는 binary64 원시바이트로 전달하며 Godot의 JSON decimal 재파싱 오차를 허용오차로 덮지 않는다. RNG stream을 주입하고 원본 함수의 provider 호출 위치/인자/소비 prefix를 추출한다. GDScript fixture callback은 그 원본 반환값과 소비만 재생하며 공통 정예 알고리즘을 구현하지 않는다. 원본과 정책의 **52필드·9catalog값·RNG열/횟수·callback순서·입력불변을 정확 비교**, float 허용오차0.

원본 oracle **2,708사례** = 기본 matrix2,340(stage6×type10×[난이도11×레벨3 + 추가입력6]) + 일반/매직/레어/rare-M02/정예경계 각60 + synthetic-champion60 + HP경계8. L=0/falsy·음수 clamp·fractional offset·L500 전후·고레벨, M02·모든type/stage를 포함. synthetic-champion은 hell1 자연발생 증거가 아니라 등급3 수치/원본mods 호출 검증을 위해 rollElite를3으로 공급하는 명시 fixture다. 실제 hell1 champion 확률은0이며 다른 값으로 바꾸지 않았다.

oracle 경계 fixture: canMv=true, GPU=false, skin callback은 no-op, theme/boss 문자열은 더미다. 원본 CHAPTER_STAGES/SI_TO_HELL/STG builder의 monLv 계산은 실행한다. 이 fixture는 collision/safePt/GPU/skin 표시를 검증하지 않는다. full source object를 실제 actor·World에 등록한 결과도 아니다.

| 실행 label(원로그 이름) | 결과 | exit/ERROR/WARNING | 격리 |
|---|---|---|---|
| `unit-final` | 159902/0단정 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_ch2_enemy_spawn_policy` | 7483/0단정 | 0/0/0 | `EXODUSER-ec2-01-Isolated-20261020` |
| `test_contracts` | 5그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_encounter_factory` | 3그룹/실패단정0 | 0/0/0 | `EXODUSER-ec2-02-Isolated-20261020` |
| `test_p1002f_dedicated_hurte` | 357/0단정 | 0/0/2 | `EXODUSER-P1002F-Isolated-20261020` |
| `test_p3002_spawn_holes` | 298/0단정 | 0/0/2 | `EXODUSER-P3002-Isolated-20261020` |

전체 그룹·SKIP0. 단정 수와 그룹 수를 합산하지 않는다. 원본 JS만 따로 돌린 것을 Godot PASS로 세지 않았다. 첫 unit-01도159,887/0·ERROR0이었고 이후 원본 mapping/STG 추출과 공급자 오류/늦은 RNG 실패/사본 불변 검사를 보완한 최종 unit은159,902/0이다. import exit0/ERROR0/WARNING0. 실패/오류 로그를 지우거나 검사를 약화한 이력 없음. 기존 회귀 fixture의 HP/actor필드 쓰기·정지 시뮬레이션은 각 테스트가 표시한 한계 그대로다.

경고 원문은 각 err.log에 보존하며 종료 ObjectDB 누수의 원인/선재 여부는 미확인이다. ERROR0과 별개로 아래 기록한다:

- `test_p1002f_dedicated_hurte`: `WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.` / `WARNING: 4 ObjectDB instances were leaked at exit (run with `--verbose` for details).`
- `test_p3002_spawn_holes`: `WARNING: Camera2D overridden to physics process mode due to use of physics interpolation.` / `WARNING: 8 ObjectDB instances were leaked at exit (run with `--verbose` for details).`

## 공용 접점·범위 밖·제출

이 단계의 projection 계산에는 공용 수정이 필요하지 않아 BLOCKED가 아니다. 실제 소비 연결은 별도 배정 전0줄:

| 기존 위치 | 필요한 후속 인수·원본 근거 |
|---|---|
| enemy_factory.gd:25–31/60–61 | 기존 known_etypes/CH1 schema gate 삭제 대신 신규 CH2 source/admission 및 실제 actor 소유자 인수. source31120–31124의 좌표검사·원본30969–31022 선택·52개 밖 전체필드를 포함한 생성계약 필요 |
| type3_spawn_recipe.gd:149–154 / native_spawn_hole_system.gd:26–40/518인접 | stage0 전용 경계를 CH2로 단순 확장하지 않음. CH2 etype33산란은 type3로 대체0. 원본31235–31259와39237–39252의 별도 생성·RNG/room 순서 필요 |
| World/Main·공통 정예 authority | 실제 공유 RNG·충돌/좌표·skin·실제 rollElite/rollMods/rollAura supplier 및 지역/총스폰 등록은 owner가 연결해야 함. callback 테스트만으로 이 sink가 제품에 붙었다고 주장하지 않음 |
| source normal field owner/hurtE·State/save | 실제 30..39필드 소유/poise/피격·death·보상·저장 미연결. 기존 halt/source gate를 삭제하거나 숨기지 않음 |

다음 CH2E-03 독장판 계산도 이 제출에서 착수하지 않았고 제품 Player/World 피해·탄 birth와 혼합하지 않았다. 실창·PC·자연 CH2 actor/전투/모든 seed·전역 RNG stream·저장/게임플레이 동등성은 **미확인**.

코드 뒤 docs 전체 rg 검색(233개 일치행, docs-keyword-search.log)을 수행했다. 기존 몬스터 수치가 바뀐 것이 아니라 catalog와 최종생성값을 분리한 신규 읽기/계산 경계다. 해당 구현 상태·정확 수치·미연결을 이 보고서와 CHANGELOG_SYNC에 동기화하고 기존 설계/다른 담당 추적/WORK_BOARD는0줄이다.

원로그 `~/exoduser-wt/_out/ec2-02/`: source-game.html/source-oracle.cjs/json, 기준·WORK_BOARD·design 사본, unit/회귀 out/err/engine/json, validation-summary.json, godot-count.log, 보호 해시/Git 감사/DONE. 신규 worktree는 --no-checkout/non-cone sparse로 만들었고 push·원격일치·DONE 후 제거한다. main push/force/add-A/훅 우회0, 커밋은 자기6파일만이다.
