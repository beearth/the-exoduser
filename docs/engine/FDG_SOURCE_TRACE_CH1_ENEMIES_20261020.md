# 1장 초기 미이식 적 10개체 — 고정 원본 추적·담당별 이식 참고

작업ID `trace-ch1-enemies` · 2026-10-20 KST · **문서 작성·검수 대기**. 아래 U01~U14는 최초 조사 당시의 구현 순서 참고안이며 위 최신 배정 정정이 우선한다. 이번과 이번 후속 모두 구현하지 않았다. 코드·테스트·기존 설계 docs·작업판 변경은 0이다.

## 최신 배정 정정 — P2-008a 범위는 담당자 참고용

**2026-10-20 맥북총괄 추가 지시 반영: 이 작업은 추적 문서만 관리하며 구현·테스트 파일을 만들지 않는다.** 아래 U단위는 배정표가 아닌 원본 계약 참고다. U03과 U14의 etype20 3개체 구현·검수·포이즈 수정은 **P2-008a 담당**이며 Mac 중복 구현을 제안하지 않는다. U01을 포함한 나머지 단위도 이 문서만으로 자동 착수하지 않는다.

| 재확인 근거 | 실제 확인·경계 |
|---|---|
| fetch | `git fetch origin` 후 원격 브랜치를 `ls-remote`로 식별, main과 P2-008a를 명시 refspec으로 추가 fetch. 기준main `f84e26ee0bbc929fb595b4c0af292b423588f325`, P2-008a 원격 `codex/p2-008a-ch1-enemies-pc-20261020` = `46409ee4eabcd4760f0c420d6d6a15beaf9e3b28` |
| 구현/보고서 | P2-008a 구현 `495e4941485dfd75aec22d9cdd7148ba66f8e928`, 후속보고 `46409ee4…`. 해당 브랜치 `docs/engine/orders/reports/P2-008a_REPORT.md`와 신규actor·factory 등록·테스트 목록을 읽음. 타브랜치 코드를 이WT로 가져오거나 병합하지 않음 |
| 최신 작업판 | 위main의 `docs/engine/orders/WORK_BOARD.md:59~62`. P2-008a는 etype20 exact order4/10/12 main병합, 지원9/미지원7. P2-008a-FIX 포이즈 경로 결함은 같은PC작성자 큐. P2-008b는order11 etype47 우선/그FIX뒤 진행 |
| 실제 main 정적 대조 | `godot/scripts/enemy_factory.gd:11~12,168~176,585~587`에 ice warrior script/config/exact3개체 등록 존재. `godot/tests/test_encounter_factory.gd:16`의 SUPPORTED_ORDERS=[0,1,4,8,10,12,13,14,15]. Godot 재실행·독립회귀 확인은 이번 **미실행** |
| 현재 소유 파일 | `godot/scripts/enemy_melee_ch1_ice_warrior.gd`, `godot/data/etype20_ch1_ice_warrior.json`, `godot/tests/test_etype20_ch1_ice_warrior.gd`, `test_etype20_ch1_hurte_bridge.gd`, `test_etype20_ch1_admission_boundaries.gd`, factory 및 기존 테스트의 해당구역은 **P2-008a 담당**. 이문서의 옛제안파일명으로 별도 작성하지 않음 |
| P2-008b 증거 한계 | 작업판 배정은 확인. 작업판의 정확 브랜치 `codex/p2-008b-ch1-enemies-pc-20261020` fetch는 remote ref없음으로 실패. 구현SHA/게시내용은 **미확인**이며 다른 경로로 우회하지 않음. 배정은 존중해 U10/U11/order11등록을 중복 제안하지 않음 |
| 원본·snapshot 유지 | 아래 ad6ac68a2 기준6/10·원미이식10개체·338필드 표는 최초 조사 snapshot으로 보존, 최신main의 현황으로 사용하지 않음. 새main game.html SHA는 최초고정원본과 같아 원본행 번호는 유지. 최신main Godot파일 행은 이추가표와 당시기준본문을 구분 |

## 0. 기준·소유권·판정 경계

| 항목 | 확인 결과 |
|---|---|
| 기준 | `git fetch origin main` 성공 후 `origin/main=ad6ac68a2e009c4d299fe1dd2264182355ee992c`; 요청한 `ad6ac68a2` 포함 확인. 아래 원본 행은 모두 이 commit의 `game.html`/`index.html` 기준, 1-based |
| 브랜치·작업 위치 | `codex/trace-ch1-enemies-20261020` / `/Users/fordeargamers/exoduser-wt/trace-ch1-enemies`; 위 main에서 정상 `git worktree add -b`로 생성 |
| R 불변 | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 시작 branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, tracked INDEX/WORK clean. R에서 파일 변경·branch 전환·commit·reset 없음 |
| 읽은 운영 근거 | `docs/engine/orders/WORK_BOARD.md` 진행표·공용·보존 WIP, `FDG_GAME_DEVELOPMENT_PLAN.md` 단계/작업표 및 source6/미10·배송5/미11 절, 병합된 `FDG_FEATURE_INVENTORY_20261020.md` 분모·EN-00~99 판정. 기존 `FDG_SOURCE_TRACE_QUICKSLOT/SAVE/SETTINGS_20261020.md`의 범위·원본/영속화·후속 단위 경계를 확인 |
| 다른 작업과 경계 | P3-002 소환굴/World 동적 등록, P3-003 지역, P2-006b 드랍 표시, P2-007a UI, TRACE-SKILLS/WEAPONS/REVIVE-SHIELD/INVENTORY/META, QA-002/STARTER-REGIONS와 중복 구현하지 않음. 현재 보드에 이 작업 행이 없으므로 이 문서·DONE으로 인계하며 보드는 수정하지 않음 |
| 사용자 최신 제한 우선 | 별도 REPORT/WORK_BOARD 갱신이라는 보드 일반 규칙 대신 **새 추적 문서 1개만** 작성. main push·merge·force·reset·`git add -A` 없음. 자기 브랜치에 이 경로만 commit/push |
| 보호 | **`docs/2_3` 수정 금지 / Q·E 판정·입력·반사 의미 / 세이브 형식 보호**. 관련 계약은 읽고 표시만 한다. 원본 오류로 보이는 부분도 임의 수정·보정하지 않음 |
| 실행 증거 | 실제 `godot/` 제품 파일과 기존 테스트 본문을 대조한 **정적 추적**. Godot 테스트 재실행·새 테스트 작성·import·빌드·게임/서버 재시작·실창 QA 없음. 기존 문서의 PASS를 이번 실행 PASS로 전용하지 않음. Mac/PC 실플레이·실행창의 현재 source 일치는 **미확인** |

원본 SHA-256: `game.html` 65,692행 / `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, `index.html` 4,742행 / `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`.

**분모는 1장 전체 etype나 모든 소환굴의 적이 아니라 인수된 초기 16개체다.** `godot/data/encounters.json`의 seed는 map `20261013`, encounter `477069883`, 초기 RNG 소비214회다. JSON의 원 추출 source hash `5212e3a3…`와 현재 game hash는 다르다. 이 문서는 고정 16개체의 미이식 계약을 최신 main 원본에 다시 위치시켰으며, 최신 game 전체 부팅/RNG를 재실행해 같은 16개체가 생성됐다고 주장하지 않는다. 현행 생성 순서의 정적 일치는 §2, 최신 재추출/자연 플레이 동등성은 **미확인**이다.

JSON SHA-256 `91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa`는 `test_encounter_factory.gd:23`의 `SOURCE_SHA`와 일치한다. 파일이 한 행이므로 JSON 근거는 모두 `:1` + record.order/id 경로로 식별한다.

## 1. 최초 고정 snapshot: 초기16·지원6·미이식10 전수 대조

이 절의 판정은 최초 ad6ac68a2 snapshot의 `enemy_factory.gd:140~172`의 실제 admission과 `:547~589` consume 경로, `test_encounter_factory.gd:15`의 `SUPPORTED_ORDERS=[0,1,8,13,14,15]`를 기준으로 한다. frozen JSON의 `support=false/runtime=null`만 세면 후속 전용 consumer 4개를 놓친다. 반대로 etype7 조립 API 존재만 세면 7/9로 잘못 승격한다. 지원된 6개도 모든 원소·스킨·정예·사망/부활까지 완성했다는 뜻이 아니다.

| order / id | etype / 원소 | 스킨 | 현재 factory | 다음 추적 |
|---|---|---|---|---|
| 0 / ch1_start_eye_mass_01 | 4 / D3 | 다안 육괴 전용 sheet | 지원 | 기존 enemy.gd |
| 1 / ch1_start_eye_mass_02 | 4 / D3 | 다안 육괴 전용 sheet | 지원 | 기존 enemy.gd |
| 2 / ch1_initial_003 | 29 / P0 | carapace_predator | 미이식 | 문지기·특수AI·사망탄·게이트 |
| 3 / ch1_initial_004 | 7 / P0 | flesh_crawler | 미이식 | M30/TP/type3 조립은 존재, 자연 admission 없음 |
| 4 / ch1_initial_005 | 20 / P0 | flesh_crawler | 미이식 | 탄/접촉 공격 부여 금지, 실제 공통 이동 |
| 5 / ch1_initial_006 | 25 / P0 | carapace_predator | 미이식 | 생존 D장판·사망 I장판·공통 P탄 |
| 6 / ch1_initial_007 | 6 / P0 | apostle_knight | 미이식 | 호위·방패각·쉴드 소진 후 돌격 |
| 7 / ch1_initial_008 | 7 / P0 | soul_flame | 미이식 | 004와 다른 스킨/HP/mods, exact gate 별개 |
| 8 / ch1_initial_009 | 4 / I2 | soul_flame | 지원 | 기존 ice_soul consumer |
| 9 / ch1_initial_010 | 21 / D3 | spine_beast | 미이식 | 후방 이동·D탄, emitter의 부분 API만 존재 |
| 10 / ch1_initial_011 | 20 / P0 | carapace_predator | 미이식 | 005와 같은 AI, 별도 raw record |
| 11 / ch1_initial_012 | 47 / P0 | flesh_crawler | 미이식 | clone 생성/등록 누락 관측·TP·공통 P탄 |
| 12 / ch1_initial_013 | 20 / L4 | spine_beast | 미이식 | lightning여도 projCd9999, 탄을 만들지 않음 |
| 13 / ch1_initial_014 | 4 / P0 | spine_beast | 지원 | 기존 spine consumer |
| 14 / ch1_initial_015 | 0 / P0 | flesh_crawler | 지원 | 기존 flesh consumer |
| 15 / ch1_initial_016 | 1 / L4 | hive_bloater | 지원 | 기존 hive consumer |

`FDG_FEATURE_INVENTORY_20261020.md:225~276`은 etype 상위 leaf의 없음/일부 판정이다. EN-03·EN-07 일부는 소환/standalone 지원이며 초기 factory 지원 개수와 다른 축이다. 레어90~99는 초기16에 0개다. elite1/3을 `RARE_ETYPE` 네임드로 바꾸지 않는다.

### 1.1 미이식 개체별 불변 수치

아래 표와 부록 A는 frozen `native_final`의 실제 값이다. escort의 elite 후대입으로 HP만 커지고 방어·공격·쿨은 따라 커지지 않는 점을 보존한다. 임의 난이도 정상화·동일 etype 합치기 금지.

| id / order | etype / el | elite / mods / aura | HP / ATK | shield / max / poise / max | r / speed | 위치 / skin cell |
|---|---|---|---|---|---|---|
| ch1_initial_003 / 2 | 29 / 0 | 3 / [] / null | 3500 / 62 | 875 / 875 / 80 / 80 | 57 / 0.7913562389630824 | [4020,340] / carapace_predator(7,0) |
| ch1_initial_004 / 3 | 7 / 0 | 1 / ["M30"] / null | 4377 / 40 | 1751 / 1751 / 1751 / 1751 | 22.73476334709674 / 0.39137590795755384 | [4075,340] / flesh_crawler(6,0) |
| ch1_initial_005 / 4 | 20 / 0 | 1 / [] / null | 2187 / 31 | 875 / 875 / 875 / 875 | 20.28180555999279 / 0.6098637344744058 | [4036.995934690622,392.3081083962334] / flesh_crawler(6,0) |
| ch1_initial_006 / 5 | 25 / 0 | 1 / [] / null | 2187 / 31 | 875 / 875 / 875 / 875 | 22.30737677309662 / 0.6269484242610635 | [3975.504065309378,372.328188876086] / carapace_predator(7,0) |
| ch1_initial_007 / 6 | 6 / 0 | 1 / [] / null | 2187 / 31 | 875 / 875 / 875 / 875 | 28.97044614702463 / 0.7508026934321969 | [3975.504065309378,307.671811123914] / apostle_knight(2,0) |
| ch1_initial_008 / 7 | 7 / 0 | 1 / [] / null | 2187 / 31 | 875 / 875 / 875 / 875 | 20.151121815666556 / 0.362181977564469 | [4036.995934690622,287.6918916037665] / soul_flame(3,0) |
| ch1_initial_010 / 9 | 21 / 3 | 0 / [] / null | 875 / 31 | 875 / 875 / 875 / 875 | 21.545625534839928 / 0.6989011177606881 | [4159.552543804879,441.39085796557566] / spine_beast(5,0) |
| ch1_initial_011 / 10 | 20 / 0 | 0 / [] / null | 875 / 31 | 875 / 875 / 875 / 875 | 21.945927370339632 / 0.5415485634338111 | [4071.338948165395,498.0050355845301] / carapace_predator(7,0) |
| ch1_initial_012 / 11 | 47 / 0 | 0 / [] / null | 875 / 31 | 875 / 875 / 875 / 875 | 26.665450139902532 / 0.7655834316909312 | [3969.716234383507,494.7575176250593] / flesh_crawler(6,0) |
| ch1_initial_013 / 12 | 20 / 4 | 0 / [] / null | 875 / 31 | 875 / 875 / 875 / 875 | 20.852594511583447 / 0.5635517939049751 | [3919.000584636192,413.38037056548455] / spine_beast(5,0) |

### 1.2 개체별 탄·AI·소환 계약

| id | 원본 지점 | 반드시 보존할 계약 / 미이식 의존 |
|---|---|---|
| 003 | 31612~31628, 39125~39140, 40526~40558, 42817~42824 | etype29이나 `ib=false`, elite는 생성 후3으로 덮고 mods는 빈 배열 그대로. slamT 감소, ≤0·d<120 → eSlamWind45/cd reset, I탄8방향(eProjAt는 추가60f warning), d<100 freeze120. 별도 d>150·d<1200·U<.008×sp면 eCharge25(별도90f windup을 새로 넣지 않음). body속도 `(e._chgSpd\|\|5)×sp`, 피해 trunc(atk×30×elMul), KB100; slam 반경70+r/피해×2/KB10/recover50. 사망8탄은 각 U<.5 black, 나머지 red, 30%라는 주석과 다름. atk62 기준 raw black=trunc(62×1.5)=93/P0/life400/sz2, red=trunc(62×1.2)=74/I2/life200/sz1.5. warning 완료의 commit 정규화에서 black186, red148→.5=74(상성·방어 전). gate 처치·10% 가중치·보상·부활 판단은 별개 보호 접점 |
| 004 | 38920~38940, 40777~40798, 38803~38804 | TP·소환 시계는 idle에서만 감소. TP 거리<100/목표P+polar(Uτ,150+50U), 유효하면120f전조, 무효timer30. 완료 시 teleportE 성공 여부와 무관하게 cd reset·eProjAt(P,3,.8,life200,sz2) 예약. 주변200 내 자신 제외 아군<4 → eSummon40; 아니면summonT60. 채널FX RNG→자식수1~2→각 좌표/원소/생성/FX 순서. M30 ring480/거리<800/lock54/r125/피해max(1,trunc(atk×.65))와 원 용암 후속 포함. 기존 조립 재사용, 새 type7 커널 중복 금지 |
| 005 | 31219~31223, 39058~39060, 40458~40519 | _iceOnHit=true/_iceFreeze=.35라는 필드가 있어도 빈 type20 조건 본문은 주석뿐. `_meleeET`에20 없음, `_noProjEtypes[20]`=1이라 projCd9999. 따라서 고정 개체에 임의 접촉피해·물리탄·빙결 공격을 추가하지 않음. 공통 어그로/flow/idle추격×1.6/분리·피격·사망 소비가 필요 |
| 006 | 39078~39084, 40462~40519, 42804~42808 | idle에서 slimeT−sp, ≤0 → 본체 위치 D3/zero velocity/dmg0/life480/ml480/col#5e10a8/sz2/iceZone true 생성→timer=cd→parts3. D장판 감속 없음. 사망은 3방향 반경15 I2/life360/sz2.5, parts10·문구 빙판. 공통탄은 P이므로 E 물리탄 계열, 정예1 표시지만 mods=[]/atk31/cd240 유지. 소환 없음 |
| 007 | 38891~38917, 40762~40775, 42167 인접 | 쉴드>0·idle이면150 내 etype1/7/8 중 가장 가까운 대상을 찾음. 살아 있음 필터를 source보다 임의 추가하지 않음. 목표 ally+(P−ally)×.6, 거리>10일 때speed×1.2×aSpdM×sp; 호위 중 idle 공통이동 생략. angle wrap 후 shieldAng+=diff×.08×sp. 쉴드≤0·bashT≤0·30<d<150에서 eShieldBash/st2=20·현재facing고정·cd reset. speed4.5·피해×1.3·KB10·경직40/벽recover20/종료recover25/명중recover30. 정면 입력피해 .3 감산도 추적. 소환 없음 |
| 008 | 38920~38940, 40777~40798 | 같은 type7 계약이나 M30 없음/atk31/다른TP·소환cd/스킨soul_flame. 004 전용 `project_actor_payload()`를 ID만 바꿔 사용하면 안 됨. 새 exact projection 또는 명시적 새 profile 필요. TP 기본 landing trunc(31×10.5×elMul)=325(배율1), independent KB120. no-mod eModHitP는 즉시 return |
| 010 | 39062 주석, 40462~40519, 20123~20147 | 이름 빙궁수와 무관하게 D3. 범위800, 초기cd240/charge60/수명trunc(800×.3)=240, gbBean/dark 원 packet raw31 → spawn normalization62 → dark 접촉trunc(62×1.3)=80(상성·방어 전). _iceOnHit=true여도 mods=[] 조기반환. 전용 소환/근접/추가 화살 burst 발명 금지. emitter의 `emit_normalized_type21`은 240 수명을 받지만 호출 actor는 없음 |
| 011 | 005와 동일 | type20/P0/일반 elite0/carapace 스킨. hp875/atk31. 005의 escort HP2187을 재사용하지 않음. 소환·탄 없음 |
| 012 | 31285~31287, 39408~39430 | idle cloneT와 tpCd 감소. cloneT≤0·ens.length<200면 cd reset→좌표 U2→mkEn(type40,false,e.el\|\|D,e._ri)→hp/mhp trunc×.3·shield0·atk trunc×.5→text/parts. **해당 블록에 ens.push(clone)이 없고 mkEn은 return만 한다.** 자동등록을 구현하면 원본과 달라짐. 원본 null 결과 처리도 없음; 실패 동등성은 미확인. TP120/거리60~100/cd120+40U/실패30, 착지×10.5+KB120. 공통 P탄 있음 |
| 013 | 005와 동일 | type20/L4/일반/스킨spine_beast지만 공통 투사체 제외형. lightning 탄 지원을 이 개체 탄 발사 근거로 쓰지 않음. 소환 없음 |

## 2. 최신 main 원본 데이터·함수·UI·저장 추적

### 2.1 데이터·생성·수식

| 위치 game.html | 구조·함수 | 코드 계약 / 이식 경계 |
|---|---|---|
| 9272~9277 | DIFF_LV_OFF/DIFF_MUL/DIFF_MOB | monLv=max(1,P.lv+offset+G._stageDiffOff). 고정 NORMAL은 diff5=1.0/offset0. 초기 JSON은 G 의존성 metadata와 원 property `_stageDiffOff`를 구분 |
| 14333~14338 | EL/ETYPE_ERES/ELC | P0/F1/I2/D3/L4/H5/E6, eRes는120개×7원소 모두0. 본 작업은 속성/방어 설계 변경 없음 |
| 30823~30920 | ETYPE_HP/ATK/SPD/R/RANGE/POISE/SHIELD/COL | SPD=raw가0이면0, 아니면max(.2,raw×1.3). HP/ATK/POISE 표 값은 현재 mkEn 최종 체력을 직접 결정하지 않음. ETYPE_SHIELD도 현 mkEn eShield=실HP100%와 구분 |
| 30955~31025 | RARE_ETYPE/isRareEtype/HELL_SPAWN/HELL_EL/_RANGED_ET/rollEtype/rollEl | stage0 rollEtype는 원거리50% 분기→해당 pool 가중추첨. opening 제외2/22/30/43, mkEn에서도0 치환. 초기 gate/escort/wave 직접 호출에는 spawnRoomEns의 별도 레어 치환 롤 없음. 원소는 theme P40% 또는6원소 균등 |
| 31032~31096 | ELITE_TIERS/PROB/MOD_DEFS/rollElite/rollMods/AURA_DEFS/rollAura | 일반1/매직2·1.3·scale1.08/레어3·1.6·1.2/챔피언5·2·1.35. stage0 정상 roll은 매직3%/레어0/챔피언0. 후처리 elite 대입을 새 roll로 치환하지 않음 |
| 31119~31363 | _enemyHpPacing/mkEn 전체 | collision admission(10 또는 boss22)→safePt→난이도/level→elite/mods→speed/r RNG→HP/ATK→상태 literal→skin→return. null 결과를 다른 적으로 대체하지 않음 |
| 31143~31151 | 실HP/ATK | baseHP=(lv≤500?.4lv³+199lv+100:50000000×1.0014^(lv−500))×2.925. pacing=1/(1+min(9,max(0,lv−1))/18). lvHp=floor(baseHP×pacing×(ib?24:1)×dm×et.hpMul), HP=floor(lvHp×(1+si×.02)). ATK=floor(((ib?75:50)+lv×(ib?2.9:1.95))×.6×dm×et.atkMul) |
| 31136~31140 | speed/r | speed=(ETYPE_SPD[et]+U×.08)×1.5(M02는 다시×1.5); r=(ETYPE_R[et]+U×2)×2×elite.scaleMul. rng_begin/end는 기록값이며 개체별 독립 재seed 지시가 아님 |
| 31152~31183 | proj/defense | _noProjEtypes={5,9,11,20,24,50..59}; 기본240, M02×.85, elite3/2/1이면×.6/.7/.8 후trunc. initial projT180+120U. 일반 적 shield=HP/poise=HP. 생성 후 escort elite1 대입에는 재계산하지 않음 |
| 31192~31206/31219~31233/31285~31287 | 특수timer | type6 bashCd120+60U/T60+40U; type7 summonCd200+100U/T100+60U, TPCd150+80U/T80+40U; type25 slimeCd120+40U/T40+20U; type29 slamCd250+80U/T80+40U; type47 cloneCd200+60U/T80+40U, tpCd120+40U. 전체 raw field와 eShield/poise 후처리 차이는 부록 참조 |
| 23292~23308 | _assignMobSkin | seed=((etype\|\|0)×7+trunc((_homeX\|\|x)×31))&0x7fffffff; idx%40→col%8/rowfloor÷8. 스킨과 논리AI는 별개. _assignMobSkin의 RNG 소비0 |
| 31517~31530 | _spawnCh1StartMediumEyeMasses | stage0만. 시작점 기준[-13,-18]/[13,-21] tiles의2체, type4/D3, elite/mods/aura를0/[]/null로 대입 |
| 31608~31651 | 초기gate/escort/wave | gate29/P0: HP×4/ATK×2/rtrunc×1.4/poise80/elite3. escort4~6후보 반경55, factory 후 elite1/HP×2.5만. wave8~12후보 반경100+80U. collision 탈락 후보는 분모에 추가하지 않음. 고정16은2+1+5+8 |

위 식은 원값이며 기존 고정JSON을 최신constructor로 다시 계산해 덮어쓰라는 지시가 아니다. 부동소수 값의 Vector2 조기 축소를 피하고 필요한 경계만 기존API에 투영한다. JS `~~`는ToInt32이며 `Math.floor`와 음수/거대값에서 같지 않다. 이번 고정 양수는 범위 안이지만 모든 입력의 동등성은 **미확인**이다.

### 2.2 AI·공격·사망·표시 호출 순서

| 원본 행 | 함수/consumer | 계약 |
|---|---|---|
| 34458~34488 | main 적 업데이트 scheduler | 거리tier별 sp/2sp/4sp/8sp, 원거리flow 부분 갱신. World60Hz 존재와 원본scheduler 전체 동등성은 별개. 단위kernel에 private clock/자동physics를 중복 구현하지 않음 |
| 38577~38582 | atkTicketRequest/Release | request는 항상true. **동시공격 제한 재도입 금지**. 옛ticket/orbit 분기를 일반AI 설계로 새로 구현하지 않음 |
| 38584~38663 | updateE prefix | 벽 밀어내기·KB→무적/면역/DOT/status→stun/freeze 등 early return. helper 도달 전 guard를 임의 생략하지 않음. poise 부족 시200tick마다 trunc(maxPoise×.15), timer0 reset |
| 38684~38707 / 38876~38884 | common alert/move | d<800+LOS로alert, facing갱신, range≤400은d>30 flow추적. 나머지 ideal .65/.85사거리, 가까우면speed×.5후퇴. common projectile charge tick은 비alert 원거리return보다 앞. st2−sp는 그 뒤 |
| 38891~39430 / 40456~40519 | 종류별→공통idle | 종류별timer/TP/소환/고유공격을 먼저 처리한 뒤 공통idle 이동/분리/접촉/사격. ranged[7,21,25]는d<80후퇴×.6/d>200전진×1.2. type20/29/47은 일반idle추적×1.6. 분리r×4.4/minDist r+other.r+4/force1.5/cd3. 첫 이동과 두 번째 이동을 한 번으로 합치지 않음 |
| 20006~20048 | teleportE | 착지canMv 재판정→출발FX→위치쓰기→비boss/iframe≤0/state≠charge/거리<(r+10)×2+P.r에서trunc(atk×10.5×elMul)→eModHitP→**피해수락bool과 별도로**KB120→도착FX. Q/E 상호작용 보호 |
| 20049~20119 | _beanRoll/eProjAt/_emitEnemyShot | P는dmgM1.2/redBean, D는1/gbBean, I/F는1.2. eProjAt life=trunc(input×1.5), mouth=r×.7, angle0은`ang\|\|facing\|\|0`. eShootWind 완료 발사 이외에는owner/world/frame/원소/parryClass별 warning60, death탄은 사망점 고정. warning을 추가해 다시60을 이중 가산하지 않음 |
| 20123~20157 / 40505~40519 | _fireChargedProj/_tickProjCharge | 공통P:trunc(atk×.8)/sz1.5, D:trunc(atk×1)/sz1.6. life=trunc(range×.3). charge60/방출 시currentP 조준/cancel 후property null. type20 제외. P/D/L 속성만 보고 같은consumer로 통과시키지 않음 |
| 16914~16985 | 패링분류/spawnProj | blackBean은elP여도magic. 일반commit 이동탄은 개수drop 면제지만dmg×2/sz×2/r×1.3 적용, red만dmg×.5 후적용. 물리300px/s, 마법500~600. static iceZone은 속도/dmg 정규화 제외. Q/E 변경 금지 |
| 35063~35094 / 33006~33022 | 플레이어접촉/status | iceZone D는효과없음/I는freezeSlow max60·30%문구RNG. waterBean도max60. freezeSlow는idle진입 후 먼저 감소, 잔여>0이면이동.5. 공격/비idle 중에는같이감소시키지않음 |
| 31098~31116 | eModHitP | 첫mods없음/빈배열return 보존. M01/M03/M05/M18 뒤_iceOnHit/U<.35/max90/FX, 마지막lava. 초기미이식10개체 중iceOnHit=true인6체는모두mods=[]라 이분기에 도달하지 않음. _iceFreeze=.35필드만으로자동발동하지않음 |
| 42110~43119 | hurtE 전체 | alert→레슨위임→장비/스킬/속성→type6정면감산→shield/HP→상태→사망/부활분기→사체/특수효과→드랍/보상. 공용executor 전체구현완료로판정하지않음. 2_5추적담당과계약하고 실제사망전부터type25/29사망효과를직접실행하지않음 |
| 42167~42171 | type6정면방어 | angle존재시toP=ang+π와차이wrap, diff<π/3면dmgtrunc×.3. eShield가남은경우만이라는새조건을추가하지않음 |
| 42628~42745 / 42804~42824 | 부활/문지기/고유사망 | 부활판단은특수death앞단. gate제거/bossGateOpen/cache갱신/지역10%가산은원본접점. type25/29효과는§1.2. 공용save/QE/지역/드랍에별도writer추가금지 |
| 20196~20275 / 23294~23304 / 53768~53861 | body/장식 | 실제8dir base/walk, type6방패/type7보라후광/20~29냉기장식/25바닥/29이중aura. 기존스킨assets재사용, type이름으로별도에셋생성금지 |
| 53963~54027 | bar/hover/labels | HP/shield바, 속성/etype명/Lv/HP/shield/면역상태/gate명과HP%/elite명/mod명/aura. 초기gate elite3 mods[]의빈접사명을임의로채우지않음 |
| 60173~60234 / 60321~60325 / 60725 | HUD/미니맵/지역 | alive ens를30표시갱신마다최대60개/el색점. 지역kill/total과gate+10%는P3-003접점. 새enemy는World등록과보상기록이일치해야HUD에표시 |

### 2.3 UI·저장·index.html 경계 — 보호

| 위치 | 필드/구조 | 관측 / 보호 범위 |
|---|---|---|
| game:30150~30157 | `_saveZoneState` | 런타임 `G._zoneState[zid]`에 alive ens의 **x,y,hp,mhp,etype,el,r,atk,baseAtk,ib,lv 11필드**를 보관(객체 키는11; 배열은 ens). items/spawnHoles/clearedRooms/kills도 별도. mods·aura·특수timer 전체 저장이 아님 |
| game:30180~30186 | `_loadZone` | saved ens마다 mkEn을 다시 호출하고 **hp/mhp/lv만 덮음**. 저장된r/atk/baseAtk조차 그대로 복원하는 코드가 아님. 재추첨 elite/skin/timer가 바뀔 수 있음. 관측만, 저장 수리 제안 없음 |
| game:3533~3585 / 63892~63941 / 64054~64093 | 기본/local/web dbSave | player/inv/stats/passives/game payload. 일반 saveData에 적 목록 ens·mods·TP timer가 들어가는 것으로 확인되지 않음. demo 저장은61993~62021/62128~62163 별도. 상세 whitelist/복원은 기존 TRACE-SAVE에 위임 |
| game:3555 / 62005 / 62142 / 63915 / 64072 | game 저장 필드 | stage/kills/mats, 경로별 irisSz/taRecords/clearRecords/comboMax/playTime/cutsceneDone. gateGuardKilled/actor 전체를 새 save field로 추가하지 않음 |
| game:31553~31569 / 43896 | stage/reset | ens/projs/parts 초기화, `_gateGuardKilled=false`/지역 등 초기화, nextStage도ens=[]. runtime lifecycle과 save schema를 혼동하지 않음 |
| index:1~4742 / 4348 | 로비·라우팅 | §부록 C의 적 식별자 literal 검색은0. 이 파일 안에서 mkEn/updateE/etype constants/적timer UI·직렬화 생산자는 발견하지 못함. 4348에서 game.html로slot/char/test 이동. 외부script/동적문자열까지 적 코드가 절대 없다는 증거는 **미확인** |

## 3. 설계 폴더와 원본 불일치 표 — 설계 문서는 수정하지 않음

이 표는 원본 동작을 바꾸라는 제안이 아니다. 명시적 구형 checkpoint는 당시 이력으로 남기고, 현행 일반 설명과 실제 조건의 차이를 구분한다.

| ID | 문서 위치/서술 | 최신 원본 | 판정 / 후속 처리 |
|---|---|---|---|
| D01 | `몬스터_총관리.md:865` type20 “공격 시 빙결1초”; `9_적AI패턴디자인.md:307` “근접+빙결 d<30+r” | 39058~60 빈본문, 40499 `_meleeET`에20 없음, 31113은빈mods조기return뒤/max90 | 현행 공격 구현 설명과 불일치. 빙결1초를이식하지않고실제경로보존 |
| D02 | `9_적AI패턴디자인.md:309` type25 “추적 d<1200” | 39078~84 idle timer는거리gate없음, 공통range600과keep-distance80/200 | 조건/이동설명불완전. 생존D장판=무감속이라는`몬스터_총관리.md:870`/`몬스터_공격시스템.md:342`와는일치 |
| D03 | `몬스터_총관리.md:406` 상세등록설명“이동경로감속지대” | 생존D/480과사망I/360 구분,35074~77에서I만감속 | 같은문서의후행정정표와도차이. 두장판을같은효과로통합금지 |
| D04 | `9_적AI패턴디자인.md:298` type7 “d<100후진” | 공통idle후진d<80, type7고유d<100은TP진입 | 후진/TP거리혼동. 첫공통range800의520/680도별도 |
| D05 | `9_적AI패턴디자인.md:282/288` TP“도착직후탄막1발” |38927 eProjAt→20065~20092 추가warning60후출생 | 방출요청과실제출생시점구분누락. 기존10/13 TP정본은이차이를이미기록 |
| D06 | `몬스터_총관리.md:430/963`, `몬스터_공격시스템.md:372`, AI:289 “분신생성+TP” |39413~16은mkEn(type40)만,31362는return만,ens.push없음 | 생성객체와활성registry등록이다름. 자연clone출현은미확인/소스상미연결. 자동push를수리겸이식하지않음 |
| D07 | `몬스터_총관리.md:865~874`HP/ATK/SPD/반지름표 |30823~97의기초table와대체로대응하나실mkEn은levelHP/ATK수식/속도1.3×1.5/radius2×elite | 표를최종전투수치로쓰면불일치. 고정10개체는§1.1실값사용 |
| D08 | `몬스터_총관리.md:792`/AI:236 type6방패/돌격요약 |38891호위150/60%지점,42167정면.3,40762붕괴후돌격 | 수치/선행쉴드/호위누락. 요약의부족이며새Q/E설계권한아님 |
| D09 | `몬스터_공격시스템.md:778~781` 일반부활력150%+stage×5%·부활무적90 |42628의일반적revPow는elite분기.5/.6+floor(lv/100)×.10 등 | 기존TRACE-REVIVE-SHIELD의보호대상. 이보고서에서는경계불일치만전달,수식수정/이식금지 |
| D10 | AI:127~134 기본FSM/eCircle어택티켓대기, AI-first pipeline의슬롯설계 |38577 request항상true, 사용자어택티켓금지 | 역사/기획설명을현행제한구현근거로사용금지 |
| D11 | `8.2레어몹디자인.md:19~22` 전stage기본5%/7장10% | 초기16 gate/escort/wave는rare치환caller없고`rollEtype(si0)`는pool만 | 문서의일반스폰규칙을이초기목록에잘못적용하지않음. 고정16내rare0과모순은아님 |
| D12 | 원본주석42816 “30%무지개탄” |42818 U<.5 black/그외red | 원본내주석/식불일치. 이식값은50%/50%,장식명칭이나Q/E분류보정금지 |
| D13 | 각설계문서상단pending표“actor/asset없음”과후속현재표 | type7actor/TP/M30/조립파일은존재하지만factory미등록 | 당시오래된creation기록은이력. 파일부재를현재사실로반복하지않음. 일반factory지원6/10은현재코드와일치 |

## 4. Godot 의존성 — 실제 파일·테스트 본문 대조

이번 확인은 파일 존재·소스/테스트 단정의 정적 확인이다. 아래 테스트의 실행 결과는 **이번 미실행**이며, 기존 PASS가 있더라도 자연 생성·전투 완료로 승격하지 않는다.

| 의존 | 제품 파일/행 | 테스트/핵심 단정 | 현재 판정 |
|---|---|---|---|
| 초기입장/스냅샷검증 | `scripts/enemy_factory.gd:23~28,140~172,547~589`; `data/encounters.json:1` | `tests/test_encounter_factory.gd:15~25` 지원orders6/정본hash, invalid source 거부와 원본immutable | 실제6만허용,10은타적fallback없음 |
| body/hurt/poise 바탕 | `scripts/enemy_melee_flesh_crawler.gd`, `enemy_tank_physical_spine_beast.gd`, `native_dedicated_enemy_hurte_owner.gd`, `native_normal_enemy_hurte.gd` | `test_etype0_physical_flesh_crawler.gd`, `test_etype4_physical_spine_beast.gd`, `test_p1002f_dedicated_hurte.gd` | 기존exact배우계약만재사용가능. 새type6/20/25/29/47 flag를넣었다고전용death/정면방어까지지원하는것아님 |
| 8dir자산 | `assets/enemy/atlas_ch1_8dir_{direction}.png`, `...walk_{direction}.png`16개 | 위전용actor테스트의bodyrect/방향/texture검사 | 40skin중관련body원본자산공유. 새actor별col/row/피벗/크기검수필요 |
| type7 004actor | `scripts/enemy_type7_physical_flesh_crawler.gd:31~63,118~,311~,360~`; `data/etype7_physical_flesh_crawler.json`pending | `test_native_type7_runtime.gd:244~` exact004/raw337/초기6/10/명시적설치분리 | actualstandaloneactor존재,자연Main등록0. 008은reject |
| type7조립/World phase | `scripts/native_type7_runtime.gd:36~85,274~314`; `world.gd:2920~2963,2966~3014` | `test_native_type7_runtime.gd:213~` M29 4capmissing→거부, `:244~`실World/명시prepare/install | 필요한Worldregistry·동일RNG·phase존재. M29capabilities를true더미로우회하지않음 |
| TP/landing | `scripts/native_type7_teleport.gd`, `data/type7_teleport.json`; emitter:92~96/149~ | `test_type7_teleport.gd` 위치·실패timer·착지/KB·queuedbirth | 004exactcontract용,47/008의다른반경/ATK/색/CD/거리로일반화된API인지미확인 |
| M30 | `scripts/native_m30_modifier.gd`, `data/m30_burst.json` | `test_m30_epicenter.gd` 원timer/lock/zone·피해 | 004의필수부품이미있음. 재구현대상아님. 자연parent등록증거아님 |
| type3생성/채널 | `scripts/type3_spawn_recipe.gd:1~`, `type3_summoned_actor.gd`, `type3_native_binding.gd` | `test_type3_spawn_recipe.gd:48~`는기본`res://native-type3-oracle.json`외부fixture요구; `test_type3_summoned_actor.gd`, `test_type3_native_binding.gd` | 동적소환부품존재. oracle기본파일부재로constructorparity재현은미확인,빠진fixture를임의기대값으로만들지않음 |
| 6원소탄 | `scripts/native_element_projectile_emitter.gd:89~142,248~282,329~342`; `enemy_projectile_{physical,fire,ice,dark,lightning,holy}.gd` | `test_native_element_projectiles.gd:11~14` type3raw24/37/37/31/24/24→normalized24/74/74/62/48/48; nativeFHD/FX/reject그룹 | rawactor3/7만,normalized21별도. 지원원소6≠임의etype지원. type6/25/29/47발사adapter는미연결 |
| type21 D 탄 | emitter:129~145/329~342, `enemy_projectile_dark.gd:54` life240caller허용 | `test_native_element_projectiles.gd`은type3constructorfixture중심; gd검색에서normalized21실actorcaller0 | 일부탄수명/출생API만있음. actor/원commoncharge/정상화1회caller필요 |
| black/blue·Q/E | `port_modules/black_bean_projectile/producer.gd`, `parry_blue_projectile/producer.gd`, `combat_qe/*` | 해당기존kernel테스트는각격리범위 | 보호접점. black은Q전용magic. type29death의새producer가곧모든공개반사연결완료라는증거아님 |
| freezeSlow/방어구속성 | `scripts/player.gd:762~770,983~994`, `get_native_element_multiplier`; `main.gd`원inventorybinding | `test_etype4_ice_soul_flame.gd:228` no-modfreeze발명금지및idle감속검사 | player max 연장/idle 감소는 존재. iceZonebirth/contact/렌더전용consumer는미발견 |
| iceZone/type25/20/6/29/47 | §부록C의gd검색 | 해당미지원10개체전용actor테스트미발견 | JSON의timer필드및blue/black의flag제외/렌더설명만있음. 생산→접촉까지type25장판제품경로는미이식 |
| 보상·지역 | `scripts/native_normal_enemy_hurte.gd`kill pipeline, `native_regions.gd` | `test_p2001c_kill_rewards.gd`, `test_p3003_regions.gd` | P3-002/003·드랍담당접점. 문지기죽음게이트/10%가중치소비완료는미확인 |

경로는 이 절에서 `godot/` 상대다. `enemy.json`/encounters의원본 수치가 있다는 사실과 executable actor 존재를 분리했다. `_stClone*`/`_iceSlime*`/`shieldBash*`가 JSON에 존재하는 것만으로 AI 구현이라 판정하지 않았다.

## 5. 작은 이식 단위 순서안

최초 순서안의 **1번은 U01**이나, 최신 지시에 따라 이 작업에서는 구현하지 않는다. 이식 순서안은 원본 계약 참고이며 새 배정/공용 파일 소유권이 아니다. **U03 및 etype20 등록/수정은 P2-008a 담당**, etype47 배정은 P2-008b 담당으로 분리한다. U01 후에도 source지원6/미10 유지. 실제actor+필수의존+정상admission+전투검수까지 닫혀야 개체 지원 수를 올린다. 표의 신규 파일명/API는 제안이며 현존 파일처럼 인용하지 않는다.

### 5.1 U01 — type25 장판 생성 계약 참고, 공용 파일 0줄 구조안

**목적:** `ch1_initial_006`의 idle 생존장판과 실제 death branch에서 요청하는 3개 장판을 원본과 같은 값·순서로 생산한다. 원본에 없는 공격/감속을 발명하지 않는 검증 가능한 부품이다. 전투 actor/factory에 연결하지 않는 caller-driven producer이며 다음 U02/U05가 소비한다.

| 계약 항목 | 미배정 원본 이식 참고 — 이번 실행 지시 아님 |
|---|---|
| 새 제품 파일 | `godot/port_modules/etype25_ice_zone_source/producer.gd` (`RefCounted`, 자체process/physics/clock/Node생성0). class_name은필수아님,테스트는path preload |
| 새 테스트 | `godot/tests/test_ch1_enemies_u01_type25_ice_zone.gd` (`SceneTree`). 새가짜World나전체Main preload없이원stateDictionary+기록callback으로구간계약만검증 |
| 수정 허용 파일 | 위신규2개+본추적문서의U01결과란만. `.uid`가도구에서자연생성되면본인신규sidecar로명시. 기존공용gd/data/설계docs/WORK_BOARD **0줄**. 다음사용자지시범위가다르면새scope를따름 |
| 원본 이동 범위 | `game.html:39078~39084` 생존branch, `42804~42808` 사망branch; `14333` D3/I2. ctor `31228~31229`는timer전달계약만,재roll하지않음. `35074~35077`은생존D에감속을넣지않는oracle |
| 제안 API | `tick_idle(actor:Dictionary,sp:float,spawn:Callable,parts:Callable)->Dictionary`, `emit_death(actor:Dictionary,spawn:Callable,text:Callable,parts:Callable)->Dictionary`. actor는live최소state같은reference를받음. 신규policy상지원입력은etype25/명시s/x/y/_iceSlimeT/_iceSlimeCd/finite sp≥0로한정,틀린입력은NOT_READY·쓰기/호출0. 이는JS전체입력에대한새동등성주장이아님 |
| tick정확순서 | 필요한입력/callback을먼저검증→etype25·s=idle일때만T−=sp→T≤0이면 `spawn(actor,raw_props)`→T=Cd→`parts(x,y,'#5e10a8',3)`. T>0이면spawn/parts0. 원sp가0이어도초기T≤0이면발생. cooldown overshoot를빼서남기거나while로여러번발생시키지않음 |
| 생존raw_props 전체12키 | `{x:actor.x,y:actor.y,vx:0,vy:0,dmg:0,el:3,friendly:false,life:480,ml:480,col:'#5e10a8',sz:2,iceZone:true}`. 원 `_spawnBossProjectile` 직전 명령. parryClass/r/homing/_commit/_druidPoison/최종VFX반경을 이 단계에서 추가하지 않음 |
| death 정확 순서 | 후속hurtE 실제death branch 소유자가 API호출1회를 보장. k=0,1,2에서a=τk/3, x=actor.x+cos(a)×15, y=actor.y+sin(a)×15→spawn각1회. props는생존과같은12키중el2/life360/ml360/col#77ddff/sz2.5로변경. 그뒤text(x,y−15,'빙판!','#77ddff',30)→parts(x,y,'#88ccff',10). timer변경0. producer에독자once플래그를만들지않음 |
| callback결과 | 원본호출은spawn반환값을검사하지않음. callback이null/false를반환해도timer reset/후속FX실행. source에없는APPLIED bool로retry/rollback하지않음. GDScript예외전체의JS throw동등성은**미확인**. 입력부족/callback무효사전거절과실행중failure를구분 |
| RNG/소유 | producer자체random0. parts구현내부RNG는caller가원공유stream을소비하므로선생성/seed/재정렬0. actor의HP/element/mods/elite/shield/poise/저장구조쓰기0. spawn props는매회별도Dictionary, actor/외부record를alias해수정하지않음 |
| 초기fixture | encounters order5 `native_final`을deepcopy하여사용, 원snapshot무수정. T=57.954802359454334, Cd=157.47992157936096, pos=[3975.504065309378,372.328188876086]. step57은T=.954802359454334로0발, 다음step1은1발/T=Cd. 고정기대값은원값/식직접사용, producer출력에서생성하지않음 |
| 핵심단정 | (1)비idle은timer/FX변경0 (2)T=sp경계1발 (3)T=0/sp=0은1발 (4)T<0/큰sp도1발·Cd exact reset (5)D생존12키/480과I사망3×360완전대조 (6)spawn→reset→parts/death3spawn→text→parts순서 (7)spawn null이어도후속유지 (8)source hash/record/native state의허용외property불변 (9)누락/무효callback거절시0write (10)freeze/hurt/P/RNG/World등록0 |
| 검증분리 | test는`--only=idle_boundaries`, `--only=death_packets`, `--only=input_refusal`의3그룹선택지원, 실패는exit비0/label출력. UI/실접촉/자연death를PASS로표시하지않음. Node원본발췌oracle을쓰면source범위/호출기록보존, 수동재구현두개끼리비교만하지않음 |
| 격리userdir | Mac 사용자 폴더 이름 `EXODUSER-Trace-CH1-Enemies-U01-20261020` (기존 제품 폴더 `EXODUSER-Godot-Native-First` 사용 금지). `_out/trace-ch1-enemies/u01-stage`에 격리 실행용 project 사본과 필요한 신규2경로만 연결하고, 그 stage의 `override.cfg`에 `application/config/use_custom_user_dir=true`, `application/config/custom_user_dir_name="EXODUSER-Trace-CH1-Enemies-U01-20261020"`를 설정. 테스트 첫 단정은 `OS.get_user_data_dir()`의 실제 경로/이름이 격리 폴더인지 확인, 다르면 즉시 실패. 로그는 `_out/trace-ch1-enemies/u01-user`에 보존. 원WT의 project/override파일은0수정, 엔진version확인·자기stage안의import만 허용 |
| 인수 | 신규2파일parse/필요3그룹검증통과후spawn/parts실renderer미연결을명시, 본문에code+docs결과기록. source6/10유지. 미확인접점을fallback/shared변경으로채우지않음 |
| 선행/충돌 | 원본범위·신규path부재확인만필요. P3-002의spawnHoles/World·TRACE-REVIVE저장·Q/E·맵·기존SKILL변경0으로병행충돌없음. 최신main동명path는다음착수전fetch로재확인 |

U01은 생성 명령 이식까지이며 화면에 장판을 표시하는 단위는 아니다. caller에서 분리한 producer 구조는 네이티브 구조 차이다. 단위 테스트를 본편 연결 증거로 바꾸지 않는다.

### 5.2 후속 단위 — 한 번에 한 단위, 공용 연결 분리

제품/테스트 경로는 `godot/` 상대이며 전부 **후속 제안**이다. 실행 로그 폴더는 `/Users/fordeargamers/exoduser-wt/_out/trace-ch1-enemies/<표의 userdir>`이며, 실제 Godot 사용자 폴더 이름은 `EXODUSER-Trace-CH1-Enemies-<표의 userdir>-20261020`이다. U01과 같은 별도 stage 설정·시작 경로 단정을 사용한다. 원본 보존·격리 실행·실제 실행/fixture 증거 구분·매 코드 변경 후 docs 전체 검색과 본 추적 문서 갱신은 모든 단위에 공통이다. 기존 설계 docs 변경은 이번 작업 범위를 확장하지 않는다.

| 순서 | 만들·수정할 파일 | 원본 행·옮길 상수/공식 | 새 테스트·핵심 단정·userdir | 선행·충돌·공용 경계 |
|---|---|---|---|---|
| U02 | 신규`port_modules/etype25_ice_zone_contact/producer.gd` | 16914~16985 정지물 제외, 35074~77 D무효/I max60, 33006~22 idle감소 | `test_ch1_enemies_u02_ice_zone_contact.gd`; D에서freeze/RNG0, I max60·문구U<.3, charge/iframe외부gate. `u02-user` | U01. 최초는 접촉leaf만/공용0. 전체hazard outer반경·소멸·near-camera연명은 **미확인**, 해당 원본346xx~350xx를 고정하기 전 전체런타임 GO 금지 |
| U03 — **P2-008a 담당** | 신규제안 철회. 실제담당파일: `scripts/enemy_melee_ch1_ice_warrior.gd`, `data/etype20_ch1_ice_warrior.json`, factory등록. 포이즈수정도P2-008a-FIX소유 | 38584~38884/40456~40519; order4/10/12의raw/스킨/무공격계약은담당자참고만 | 새테스트제안없음. 실제담당테스트 `test_etype20_ch1_ice_warrior.gd`, `test_etype20_ch1_hurte_bridge.gd`, `test_etype20_ch1_admission_boundaries.gd` 참조. 기존담당격리폴더는P2-008a보고서기준 | 최신main등록9/7확인. Mac중복구현·별도profile·기존테스트수정없음. 포이즈회귀는담당자수정·총괄검수대상 |
| U04 | 신규`scripts/enemy_type21_dark_spine.gd`, `data/ch1_type21_dark_spine.json` | 010 raw, 20123~57/38684~38884/40462~40519; range800/charge60/life240/raw31→62→접촉80/속도sample1회 | `test_ch1_enemies_u04_type21_dark_spine.gd`; normalized21올바른profile/D1.3이중0/두단계이동/snapshot불변. `u04-user` | 기존emitter129~재사용. raw emit은21거부하므로alias금지. 현D packet정규화순서oracle 추가검증. 단독actor/공용0 |
| U05 | 신규`scripts/enemy_type25_physical_carapace.gd`, `data/ch1_type25_physical_carapace.json` | 006 raw+39078~84/40462~40519/42804~08; range600/life180/rawtrunc(31×.8)=24/P공통탄과장판별도 | `test_ch1_enemies_u05_type25_actor.gd`; 생존D/사망I1회/idle후방유지/빙결중timer정지/P차징60. `u05-user` | U01/U02. raw emitter25미허용. 새전용adapter로표현가능한지확인, shared확대필요시별도경계로보고. 미연결을제품GO로승격금지 |
| U06 | 신규`port_modules/etype6_escort_source/producer.gd` | 38891~38917; query150/최단strict</type1·7·8/ally→P .6/이동1.2/각도.08/shield조건 | `test_ch1_enemies_u06_escort_source.gd`; 동거리/자기제외/150·10경계/±πwrap/shield0·비idle꺼짐. `u06-user` | World query존재. 원본에없는alive필터를추가하지않음. purehelper/공용0/공격티켓금지 |
| U07 | 신규`scripts/enemy_type6_physical_knight.gd`, `data/ch1_type6_physical_knight.json` | 007 raw/42167~71 정면diff<π/3·.3/40762~75 bash4.5/×1.3/KB10/stagger40 | `test_ch1_enemies_u07_type6_knight.gd`; shield존재시호위/붕괴뒤bash/각도π/3경계/벽20·종료25·명중30/P상태보호. `u07-user` | U06. 전용hurt정면분기누락을먼저확인. Q/E·강제기폭은보호/타담당접점, 단순화금지. 공용hurt연결은U14 |
| U08 | 기존004actor/TP/M30/recipe/binding재사용. 신규`scripts/ch1_type7_004_admission.gd`, 필요시`native_type7_runtime.gd`최소수정 | 38920~40/40777~98/38803~04; exact337/TP120/자식1~2/공유RNG/HP.5·shield0·poise미추종/M29 4cap | `test_ch1_enemies_u08_type7_004_admission.gd`; 실제service결손거부/실cap준비시만설치·자연소환·TP·phase1회/source불변. `u08-user` | 기존test fixture cap은공개Q/E·FX·audio증거아님. 실공급미확정은BLOCKED·true더미금지. P3-002동적등록/World조율, factory변경U14 |
| U09 | 신규`scripts/enemy_type7_physical_soul_flame.gd`, `data/ch1_type7_physical_soul_flame.json`; type7descriptor일반화필요시별도diff | 008 raw/38920~40/20006~48/40777~98; landing325(배율1)/KB120/skin col3/개별CD/M30없음 | `test_ch1_enemies_u09_type7_008.gd`; 004오허용0/008 M30생성0/실recipe RNG순서/TP반경·CD분리. `u09-user` | U08실공급과TP helper고정값계약조사. 004 exactvalidator삭제금지. 새profile명시분기/공용0우선 |
| U10 — **P2-008b 담당** | etype47분신producer 신규파일제안보류, PC담당원본추적참고만 | 39408~16/31285~87; ens<200/cloneTreset/좌표±30/type40/el OR D/hp.3/atk.5/shield0/push없음 | 새테스트파일제안없음. registry증가0/생성→FX RNG순서/ens200 경계는담당검수참고 | 작업판order11선점확인. 원격구현SHA미확인, Mac별도구현금지 |
| U11 — **P2-008b 담당** | etype47actor/profile 신규파일제안보류, P2-008a-FIX뒤 PC담당작업참고만 | 012 raw/39408~30/20006~48/40456~40519; TP120/60~100/CD120+40U/landing325+KB120/P공통life120 | 새테스트파일제안없음. clone미등록/TP·charge순서/착지실패callerCD는담당검수참고 | P2-008b담당. 이추적문서로별도Mac이식·중복배정하지않음 |
| U12 | 신규`port_modules/etype29_gate_attack_source/producer.gd`, `scripts/enemy_type29_gate_guard.gd`, `data/ch1_type29_gate_guard.json` | 003 raw/39125~40/40526~58; slam45/r70+r/×2, charge25/speed5/×30/KB100, I8방향eProjAt life300→450/warning60 | `test_ch1_enemies_u12_gate_attack.gd`; d120/100/150/1200 strict경계/.008sp RNG순서/다른AI의90f예고추가0/shield875·poise80보존. `u12-user` | type29 I탄adapter와Player공격/패링API실공급확인. 기존raw3/7 gate삭제금지. Q/E보호설계변경0 |
| U13 | 신규`port_modules/etype29_gate_death_source/producer.gd` | 42817~24/16940~85/20065~92; 8방향/black50%·red50%/death고정점60/blackelP·redelI/freeze150반경100 | `test_ch1_enemies_u13_gate_death.gd`; 8request/RNG8와후FX순서/blackmagic·blue반사보호/정규화1회/죽은owner warning계약. `u13-user` | U12. 실제death도달은hurtE/부활담당과조정. Q/E consumer재구현0. 공용death hook은U14 |
| U14 — 각개체별분할 | **담당자 참고용 공용접점**`enemy_factory.gd` exact gate/생성, `world.gd`registry/phase, `native_dedicated_enemy_hurte_owner.gd`/`native_normal_enemy_hurte.gd`필요분. `native_regions.gd`/HUD는기존API소비우선 | 31120~31363/31608~51/42737~45/60725; 개체별필수의존실공급/보상·death, gate10%/cache/진행연동 | 미배정개체의향후검수참고 `test_ch1_enemies_u14_<id>_admission.gd`; 기준6/10→그개체만+1/−1/타record불변·거부/실hit·death·보상·region분모. `u14-<id>-user` | **etype20(order4/10/12)은 P2-008a 담당**, 해당포이즈수정P2-008a-FIX도같은소유. **order11은P2-008b담당**. 나머지는별도배정시만검토. 10체일괄등록금지. P3-002/003·SKILL·REVIVE·드랍담당과공용행조율. 보호상호작용미달이면BLOCKED |

U03과 U14의005/011/013(type20)은 **P2-008a 담당**이며 이미main등록된3개체다. 옛단독actor/입장순서제안은대체됐고 Mac복구점·신규파일·검수재구현을만들지않는다. 최신지원9/7과포이즈미수정경계/실플레이미검수를분리한다. 동결배송5/11과최초source6/10기록은당시이력이다.

## 6. 공용 파일 접점·미확인 사항

| 공용파일/owner | 접점 | 구현 전 조건 / 이번 변경 |
|---|---|---|
| `godot/scripts/main.gd` | 부팅 source state/World/service공급 | U01변경0. 새별도clock/RNG/state/boolean cap주입금지. type7자연entry의정확행은다음최신main재확인후 |
| `world.gd` | source phase/초기·소환registry/query/collision | register_native_initial_consumer2920은명시install용, install_native_encounters3016은factory6체용. P3-002/003동적분모이중계상방지. 변경0 |
| `enemy_factory.gd` | exactidentity/skin/element/elite/mods/집계 | etype전체허용으로확장금지. 새profile은U14개체별. frozenJSON support변경0 |
| `native_element_projectile_emitter.gd` | raw3/7·normalized21·birth phase | type6/25/29/47을기존타입으로위장금지. supports_source_actor추가만으로packet/life/정규화/FX충족불가. 변경0 |
| `native_normal_enemy_hurte.gd`/`native_dedicated_enemy_hurte_owner.gd` | shield/HP/poise/레슨/사망·부활/특수효과/보상 | 새actor독자HP감산으로공용owner우회금지. type6정면/25·29death/문지기현재처리함수경계는다음구현에서재확인. 변경0 |
| `player.gd` | freezeSlow/속성배율/KB/damage/Q·E공개leaf | 기존API소비, private freezeTimer쓰기/이중회복/근사damage금지. Q/E의미변경0 |
| `native_source_new_run_state.gd`/Services | G/P/INV/공유RNG/clock | 독립seed/새save필드추가0. 실runtime서비스결손은NOT_READY/BLOCKED |
| `native_regions.gd`/HUD | killed actor위치/분자분모/gate10% | P3-003/002현재상태재확인. 일반kill추가만으로gate10%계약을충족하지못함. 변경0 |
| `docs/2_3`·save경로 | 보호 | 행참조만, 내용/입력의미/저장형식변경0. TRACE-SAVE/REVIVE-SHIELD담당범위를확장하지않음 |

미확인: 최신main 전체boot 초기16 재추출, 이WT의 Godot 테스트 재실행, U02 전체hazard outer gate/수명·근거리카메라 잔존 동등성, type40constructor null/throw/RNG 포함 전체clone계약, type7 본편M29 4cap 실제공급, 10개체 자연hurtE/death/revive/보상·화면·음성·PC/Mac동등성. 미확인 값을 PASS나 구현완료로 채우지 않는다. 구현에 필요한 증거·권한이 없으면 해당 단위는 **BLOCKED**로 보고한다.

추적·단위안 작성 완료는 미이식10개체의 제품완성·실플레이 인수가 아니다.

## 부록 A. 고정10개체의 전체 초기timer·자세

초기timer의 전체 raw 값은 부록 B에 포함한다. 다음은 개체별 실행에 직접 필요한 값과 ctor의 9999 아닌 특수timer다. 나머지 비활성 특수timer의 9999도 부록 B에서 누락하지 않는다.

| id | 초기timer·자세 | 활성 특수timer | RNG구간 |
|---|---|---|---|
| ch1_initial_003 | {"st2":32.57731593446806,"projT":233.30608122982085,"projCd":240,"chargeT":0,"_spawnT":20,"facing":2.338503439414784} | {"_iceSlamT":102.96457104384899,"_iceSlamCd":311.89024919644} | 18→29 / seed=707864501 |
| ch1_initial_004 | {"st2":38.56643340084702,"projT":292.3163157328963,"projCd":192,"chargeT":0,"_spawnT":20,"facing":0.547886661861489} | {"teleportT":111.58698863349855,"teleportCd":175.49626126885414,"summonT":157.41148072760552,"summonCd":250.14942525886} | 32→46 / seed=1627645019 |
| ch1_initial_005 | {"st2":46.800236131530255,"projT":294.2854274343699,"projCd":9999,"chargeT":0,"_spawnT":20,"facing":3.122772508009473} | {} | 48→57 / seed=2809863019 |
| ch1_initial_006 | {"st2":70.8438818063587,"projT":180.6872864998877,"projCd":240,"chargeT":0,"_spawnT":20,"facing":3.036930852359955} | {"_iceSlimeT":57.954802359454334,"_iceSlimeCd":157.47992157936096} | 59→70 / seed=3669344216 |
| ch1_initial_007 | {"st2":65.21435082657263,"projT":245.2865995746106,"projCd":240,"chargeT":0,"_spawnT":20,"facing":3.6584474070763107} | {"shieldAng":4.720881879610889,"shieldBashT":71.7094944883138,"shieldBashCd":174.16161571629345} | 72→84 / seed=1291027843 |
| ch1_initial_008 | {"st2":67.30617832625285,"projT":297.9937467444688,"projCd":240,"chargeT":0,"_spawnT":20,"facing":3.554008956864225} | {"teleportT":109.30341063067317,"teleportCd":170.0400953553617,"summonT":106.3739270158112,"summonCd":220.42954417411238} | 86→99 / seed=742364665 |
| ch1_initial_010 | {"st2":46.095641534775496,"projT":272.19979790970683,"projCd":240,"chargeT":0,"_spawnT":20,"facing":1.1974583558384342} | {} | 119→128 / seed=2378917284 |
| ch1_initial_011 | {"st2":51.25483084237203,"projT":288.038684790954,"projCd":9999,"chargeT":0,"_spawnT":20,"facing":1.1449594676090138} | {} | 132→141 / seed=1034978335 |
| ch1_initial_012 | {"st2":46.72991442028433,"projT":274.3530197069049,"projCd":240,"chargeT":0,"_spawnT":20,"facing":2.8404800980603606} | {"_stCloneT":82.6070635765791,"_stCloneCd":221.1318963347003,"_stTpCd":131.94252423010767} | 145→157 / seed=79774894 |
| ch1_initial_013 | {"st2":52.795816615689546,"projT":223.52788844145834,"projCd":9999,"chargeT":0,"_spawnT":20,"facing":2.3192027749846393} | {} | 162→171 / seed=3256703429 |

## 부록 B. native_final 전체키 선언·직접consumer 행 색인

미이식10개체의 키union을 전부 열거한다. constructor 범위31120~31363의property 선언, 최신game 전체의 `e.<key>` 직접소비, 생성별명 `_e/gg/_esc/ne/clone.<key>`를 검색했다. 연속행은range로압축, 행내중복은1회. 키존재와consumer실행을구분한다. 첨자/동적property·외부JS·실행시alias 전체의 완전성은 **미확인**이다. `—`는 지정검색0건이며 필드불필요 판정이 아니다. JSON에없는undefined등 원JSproperty까지 전수라는 주장은 하지 않는다.

검사 대상: 10개체, 최상위 union **338키**. 일반9체337키/문지기338키(추가 `_isGateGuard`)다. 값 열의 `전체=`는10개체동일값, 나머지는ID끝3자리별값이다. `누락`은키부재이며null/false로보정하지않았다. `modT`/`kb`는중첩객체를정확JSON으로표시한다.

| 키 | ctor선언행 | e. 직접소비 전체행 | 생성별명 접근행 | 개체별 raw 값 |
|---|---|---|---|---|
| `x` | 31162 | 5102, 5238, 5244, 5254, 5259, 5263, 5267, 5270, 5286, 5289~5290, 5297, 5302, 5355~5356, 5392, 5414, 10785, 10791, 10902, 10918, 10966, 13487, 16594, 16596, 16598, 17079, 17097, 17100, 17128~17129, 17154, 17157, 17162, 17167, 17179, 17194~17195, 17218, 17221, 17416, 18591, 18605, 18767, 19756, 19772~19773, 19834~19835, 19837, 19840, 19987, 19992, 19994, 20007, 20015, 20057, 20063, 20074, 20088, 20102~20103, 20105, 20114~20115, 20118, 20123, 20129~20130, 20132~20133, 20135~20136, 20138~20139, 20141~20142, 20144~20145, 20147~20148, 20169, 20177, 20214, 20216, 20228, 20249, 20272, 21573, 21886, 22647, 22763, 23298, 23462, 23479, 24576, 24587~24588, 24603, 24605, 24607~24608, 24614, 24616, 24618~24619, 24872, 24906~24907, 24974, 25088, 25108, 25123, 25129, 25169, 25177, 25348, 25385, 25407, 25409, 25687, 25689, 25918, 28814, 28818, 28849, 28854, 28975, 28977, 30152, 30785, 31714, 31722, 31733, 31735, 31739, 31831, 31908, 31913, 31917~31920, 31929~31932, 31939~31942, 31947, 31949~31950, 32033, 32044, 32064, 32074, 32275, 32277, 32285~32286, 32294~32295, 32311, 32314, 32319~32321, 32429~32430, 32434~32435, 32437, 32503~32504, 32507, 32620, 32622~32623, 32662, 32665, 32674~32675, 33466, 33488, 33790~33791, 33975, 33977, 33983, 33989, 33991, 33995, 33997~33998, 34004, 34034~34035, 34082~34083, 34085, 34243, 34246, 34276, 34281, 34285, 34310~34311, 34317, 34322, 34324, 34365, 34404~34405, 34427, 34430, 34432, 34438, 34440~34441, 34455, 34457, 34460, 34467, 34469, 34486, 34490, 34506, 34517~34519, 34522, 34541, 34544, 34740, 34760, 34783, 34794, 34828, 34832, 35073, 35100, 35148, 35171, 35194~35195, 35285, 35293, 35353, 35360, 35372, 35374, 35379~35380, 35397, 35428, 35438~35439, 35442, 35449, 35453~35455, 35472, 35476, 35496, 35515, 35525, 35527~35528, 35536, 35591, 35594, 35596, 35598, 35600~35601, 35613, 36128~36129, 36176~36177, 36239, 36244, 36252, 36266, 36288, 36290, 36294, 36526~36527, 36529, 36538~36539, 36546~36547, 36613~36614, 36647, 36651, 36740, 36756, 36759, 36763~36764, 36871, 36895, 36913~36914, 36916, 36941, 36962, 36978~36979, 36981, 36997, 37168, 37171, 37222, 37246~37248, 37270, 37281~37282, 37307~37308, 37310, 37317, 37319, 37326, 37329, 37362~37363, 37386, 37424, 37439, 37441, 37446, 37450, 37454, 37458, 37462, 37467~37468, 37470, 37475, 37479, 37483, 37611~37612, 37618, 37627, 37630, 37637, 37642, 37713~37715, 37717~37719, 37721~37723, 37727~37737, 37740, 37743, 37745, 37748, 37751, 37753, 37755~37758, 37763, 37766~37767, 37772, 37779, 37786, 37788, 37794, 37802, 37808, 37810, 37816, 37828~37829, 37834, 37840, 37843, 37848, 37852, 37856, 37858, 37875, 37880, 37884, 37887, 37894, 37898, 37902, 37906~37907, 37909, 37911, 37922, 37927~37928, 37933, 37941, 37946, 37956, 37961, 37971, 37976, 37989, 37994~37995, 37997, 38000, 38006~38007, 38010, 38016, 38018, 38027~38028, 38030, 38034, 38045, 38050, 38052, 38058, 38065, 38071~38072, 38076, 38081, 38083, 38089, 38092, 38102, 38115, 38131, 38142, 38146, 38155, 38158, 38175, 38184, 38189, 38208, 38214, 38221, 38228~38229, 38266~38267, 38272, 38278~38283, 38287, 38289, 38297, 38301~38302, 38322, 38325~38328, 38337, 38339~38341, 38344, 38347~38348, 38352~38354, 38364, 38368, 38370, 38589, 38593~38594, 38598, 38600, 38609, 38638, 38642, 38665, 38679, 38682, 38685, 38691, 38697, 38700, 38702~38703, 38729, 38738, 38747, 38760~38761, 38768, 38776, 38780~38781, 38786~38787, 38792, 38796~38797, 38802, 38806, 38808, 38811, 38819, 38832, 38845, 38849, 38858, 38884, 38895~38896, 38901~38902, 38905, 38913, 38917, 38927, 38937~38938, 38948, 38952, 38957, 38963, 38968, 38976, 38978, 38982, 38987, 38994~38996, 39003, 39005, 39009, 39011, 39013, 39021, 39025, 39028, 39034, 39039, 39042, 39047, 39053, 39066~39067, 39081~39082, 39091, 39099, 39101, 39108, 39110, 39112, 39119, 39128, 39133, 39138, 39146~39147, 39157, 39161, 39170~39171, 39181, 39185, 39188, 39191, 39205~39206, 39210, 39217, 39221, 39223, 39228, 39231, 39243, 39246, 39250~39251, 39259~39260, 39263, 39266, 39275, 39279, 39283, 39293, 39298, 39300~39301, 39306, 39311, 39313~39314, 39331, 39343, 39346, 39354, 39362~39363, 39372, 39381, 39383, 39386, 39388~39389, 39398, 39404, 39413, 39416, 39437, 39447, 39452, 39458, 39461, 39463~39464, 39472~39473, 39479, 39486, 39489, 39495, 39500, 39504, 39515~39516, 39529, 39532~39533, 39544, 39548, 39554, 39562~39563, 39567, 39575, 39584, 39592~39593, 39597, 39599, 39609~39612, 39625, 39629, 39631, 39636, 39640~39641, 39658~39660, 39665, 39675~39677, 39679, 39692, 39694, 39704, 39708~39710, 39712, 39714~39715, 39728, 39731, 39734~39735, 39745, 39756, 39763, 39774, 39778, 39780, 39783, 39787~39788, 39793, 39796~39797, 39806, 39823, 39832, 39838, 39854, 39870~39871, 39877, 39892, 39896~39897, 39899, 39901~39902, 39907~39908, 39918~39919, 39925, 39935, 39940, 39945~39946, 39956, 39962, 39964~39965, 39971, 39979~39980, 39987, 39991, 39997, 40002, 40004~40005, 40011, 40014, 40020, 40031, 40034~40037, 40046, 40049, 40064, 40069, 40076, 40092~40094, 40104, 40107, 40116~40117, 40121~40123, 40128, 40132, 40143, 40148, 40153, 40160, 40164, 40166, 40178, 40180, 40187, 40192, 40199~40200, 40208, 40212, 40218, 40220, 40223~40224, 40227, 40229, 40236, 40242, 40246, 40263~40264, 40271~40273, 40279, 40288~40290, 40294, 40304~40307, 40319~40320, 40334, 40337~40341, 40346, 40355, 40368, 40374, 40379, 40384, 40403, 40409~40410, 40415~40416, 40423, 40454, 40463~40464, 40471, 40474~40475, 40483, 40487, 40491, 40495, 40522, 40524~40525, 40528~40529, 40531, 40534~40535, 40537, 40541~40545, 40547, 40552, 40554~40556, 40567~40568, 40573, 40581, 40583, 40587, 40589, 40593, 40595, 40597, 40603, 40621~40622, 40628, 40630, 40636, 40647, 40652, 40656, 40660~40661, 40665, 40667, 40669~40670, 40672~40674, 40679~40680, 40684~40685, 40687, 40690, 40692, 40698, 40703, 40705, 40707, 40712, 40718, 40728, 40731, 40736, 40746, 40751, 40755, 40757, 40763~40765, 40767, 40769, 40774, 40780, 40787, 40793, 40799, 40804, 40812, 40818, 40820~40822, 40829, 40839~40843, 40846, 40850, 40854, 40870, 40878, 40882~40883, 40885, 40888, 40892, 40897, 40901, 40906, 40910, 40912~40914, 40916, 40920, 40930, 40934, 40936, 40938, 40943~40944, 40950~40954, 40956, 40958, 40960, 40963, 40970, 40980~40981, 40986, 40990, 40995, 40997~40999, 41008, 41012, 41019, 41026~41027, 41029~41030, 41032, 41034, 41048~41050, 41055, 41058, 41063, 41068, 41075, 41077, 41085, 41087~41088, 41092, 41094, 41100, 41105, 41112, 41116~41117, 41126, 41129, 41131, 41138~41140, 41145, 41147, 41155~41156, 41160, 41162, 41169~41170, 41179~41180, 41186~41187, 41193, 41199, 41201, 41208~41209, 41213, 41221, 41223, 41230, 41235, 41239, 41244, 41256~41258, 41262, 41264, 41270, 41275~41277, 41279, 41282, 41292, 41294~41295, 41298~41299, 41307~41309, 41313, 41315, 41321, 41329, 41333, 41338, 41342~41343, 41345, 41347, 41353, 41355, 41358, 41362~41364, 41387, 41393, 41395~41397, 41403, 41523, 41555, 41715, 41720, 41722, 41727, 41739, 41746, 42142~42143, 42151, 42169, 42180, 42189, 42202, 42227, 42247, 42318, 42320~42321, 42331~42333, 42350, 42389, 42395, 42399, 42407, 42419~42420, 42432, 42438, 42440, 42442, 42455~42456, 42475, 42477, 42481, 42483, 42492, 42495~42497, 42503, 42509, 42524, 42540~42546, 42566, 42568, 42576~42577, 42579~42581, 42589, 42591, 42594, 42601, 42609~42610, 42619~42620, 42631, 42634, 42637, 42642, 42645, 42662, 42670, 42677~42678, 42680~42681, 42685, 42692~42693, 42708, 42710, 42719, 42724, 42730~42732, 42734~42735, 42738, 42742, 42751~42752, 42759~42760, 42764, 42772, 42775~42776, 42780~42781, 42786~42788, 42795, 42800, 42806~42807, 42812~42814, 42819, 42821, 42823, 42830, 42834, 42839~42840, 42846~42848, 42853~42854, 42856, 42862~42863, 42868~42869, 42874, 42876, 42878, 42883~42884, 42888~42890, 42895~42896, 42902~42903, 42909, 42911, 42915, 42921~42922, 42928, 42934~42935, 42941, 42943, 42949~42950, 42952~42953, 42955~42956, 42958~42959, 42965, 42967, 42974~42975, 42980, 42984~42985, 42990, 42997~42998, 43005~43006, 43029~43030, 43036, 43038~43040, 43047, 43052, 43055, 43058~43059, 43061, 43064, 43068, 43072, 43074, 43083, 43085, 43087, 43095, 43097, 43238~43239, 43246~43247, 43343, 43345, 43359, 43401, 44859, 44862, 44864, 44868, 45056, 45058~45060, 45123, 45440, 45442, 45445, 45615, 45643, 45926~45927, 45971, 46059, 46143~46144, 46309, 46327, 46329, 46332, 46534, 46536, 46551, 46553, 46556, 46561, 46657, 46789~46790, 46838~46839, 46916~46917, 52743, 52752, 52755, 52759, 52764~52765, 52773, 52777~52778, 52783, 52793, 52796, 52804, 52808, 52811, 52816, 52822, 52826~52827, 52829~52830, 52835~52837, 52840, 52843, 52854, 52861, 52867, 52875, 52887, 52891, 52896~52897, 52901, 52907, 52912, 52914, 52918, 52920, 52924, 52926, 52929, 52931, 52934, 52936, 52947, 52955~52958, 52963, 52969~52972, 52975, 52977~52978, 52981, 52987, 52989, 52994~52995, 52997, 53004, 53007, 53010~53011, 53015, 53018, 53027, 53029, 53044, 53048, 53052~53053, 53065~53066, 53068, 53074, 53081~53083, 53087, 53095, 53097, 53099, 53106, 53110, 53113, 53120, 53122, 53126, 53129~53131, 53134, 53149, 53151, 53153, 53161, 53188~53189, 53191, 53194~53195, 53199~53200, 53208, 53225, 53227, 53229, 53233, 53238, 53243, 53245~53246, 53250, 53252, 53255, 53262, 53268, 53271, 53276, 53280, 53288, 53303, 53306, 53308, 53311, 53322, 53325, 53333, 53336, 53340, 53354, 53357, 53359, 53362, 53366, 53376, 53379, 53381, 53384~53385, 53388, 53394~53396, 53407~53410, 53414, 53417, 53422~53423, 53425, 53432, 53434, 53437, 53444, 53446, 53449, 53455, 53457, 53460, 53467~53468, 53471, 53473, 53487, 53490, 53493, 53496, 53501, 53505, 53510, 53520, 53536, 53545, 53547, 53551, 53567, 53592, 53605, 53623, 53636, 53643, 53651, 53653, 53661, 53676, 53679, 53694, 53699~53700, 53745, 53747, 53752, 53756, 53758, 53760~53761, 53769~53770, 53776, 53781~53782, 53787, 53789, 53793~53794, 53798, 53800, 53804~53805, 53809, 53812~53813, 53817, 53820~53821, 53824~53825, 53827, 53829, 53831~53832, 53834~53835, 53839, 53843, 53847, 53849, 53851, 53854~53855, 53859~53864, 53867, 53869, 53872, 53875~53876, 53879~53880, 53883~53884, 53892~53894, 53899~53900, 53903~53904, 53907, 53909, 53911, 53913~53914, 53916~53917, 53919, 53924, 53928~53930, 53932~53934, 53937, 53939, 53941, 53943, 53947, 53949~53950, 53955, 53961, 53971, 53974, 53998, 54000~54001, 54012, 54014, 54019, 54021, 54025, 54030~54032, 60109, 60232, 60730, 60806, 60808, 61161, 61502, 62245, 62273, 62293, 63422, 64545~64546, 65643, 65645 | 31580, 31583~31585, 33194, 38780, 38796, 38848, 42798, 42832, 43054 | `003=4020; 004=4075; 005=4036.995934690622; 006=3975.504065309378; 007=3975.504065309378; 008=4036.995934690622; 010=4159.552543804879; 011=4071.338948165395; 012=3969.716234383507; 013=3919.000584636192` |
| `y` | 31162 | 5102, 5238, 5244, 5259, 5263, 5267, 5270, 5286, 5289~5290, 5297, 5302, 5355~5356, 5392, 5414, 10785, 10791, 10902, 10918, 10966, 13487, 16594, 16596, 16598, 17079, 17097, 17099, 17101, 17128~17129, 17154, 17157, 17162, 17167, 17179, 17194~17195, 17218, 17221, 17416, 18591, 18605, 18767, 19757, 19834~19835, 19837, 19840, 19987, 19992, 19994, 20007, 20015, 20057, 20063, 20074, 20088, 20102~20103, 20105, 20114~20115, 20118, 20123, 20129~20130, 20132~20133, 20135~20136, 20138~20139, 20141~20142, 20144~20145, 20147~20148, 20169, 20177, 20214, 20216, 20228, 20249, 20272, 21573, 21886, 22647, 22763, 23462, 23479, 24576, 24587~24588, 24603, 24605, 24607~24608, 24614, 24616, 24618~24619, 24872, 24906~24907, 24974, 25088, 25108, 25123, 25129, 25169, 25177, 25348, 25385, 25407, 25409, 25687, 25689, 25918, 28814, 28818, 28849, 28854, 28975, 28977, 30152, 30785, 31714, 31722, 31733, 31735, 31739, 31831, 31908, 31913, 31917~31920, 31929~31932, 31939~31942, 31947, 31949~31950, 32033, 32044, 32064, 32074, 32275, 32277, 32285~32286, 32294~32295, 32311, 32314, 32319~32321, 32429~32430, 32434~32435, 32437, 32503~32504, 32507, 32620, 32622~32623, 32662, 32665, 32674~32675, 33466, 33488, 33790~33791, 33975, 33977, 33983, 33989, 33991, 33995, 33997~33998, 34004, 34034~34035, 34082~34083, 34085, 34243, 34246, 34276, 34281, 34285, 34310~34311, 34317, 34322, 34324, 34365, 34404~34405, 34427, 34430, 34432, 34438, 34440~34441, 34455, 34457, 34460, 34467, 34469, 34486, 34490, 34506, 34517~34519, 34522, 34541, 34544, 34740, 34760, 34783, 34794, 34828, 34832, 35073, 35100, 35148, 35171, 35194~35195, 35285, 35293, 35353, 35360, 35372, 35374, 35379~35380, 35397, 35428, 35438~35439, 35442, 35449, 35453~35455, 35472, 35476, 35496, 35515, 35525, 35527~35528, 35536, 35591, 35594, 35596, 35598, 35600~35601, 35613, 36128~36129, 36176~36177, 36239, 36244, 36252, 36266, 36288, 36290, 36294, 36526~36527, 36529, 36538~36539, 36546~36547, 36613~36614, 36647, 36651, 36740, 36756, 36759, 36763~36764, 36871, 36895, 36913~36914, 36916, 36941, 36962, 36978~36979, 36981, 36997, 37168, 37171, 37222, 37246~37248, 37270, 37281~37282, 37307~37308, 37310, 37317, 37319, 37326, 37329, 37362~37363, 37386, 37424, 37439, 37441, 37446, 37450, 37454, 37458, 37462, 37467~37468, 37470, 37475, 37479, 37483, 37611~37612, 37618, 37627, 37630, 37637, 37642, 37713~37715, 37717~37719, 37721~37723, 37727~37737, 37740, 37743, 37745, 37748, 37751, 37753, 37755~37758, 37763, 37766~37767, 37772, 37779, 37786, 37788, 37794, 37802, 37808, 37810, 37816, 37828~37829, 37834, 37840, 37843, 37848, 37852, 37856, 37858, 37875, 37880, 37884, 37887, 37894, 37898, 37902, 37906~37907, 37909, 37911, 37922, 37927~37928, 37933, 37941, 37946, 37956, 37961, 37971, 37976, 37989, 37994~37995, 37997, 38000, 38006~38007, 38010, 38016, 38018, 38027~38028, 38031, 38034, 38045, 38050, 38052, 38058, 38065, 38071~38072, 38076, 38081, 38083, 38089, 38092, 38102, 38115, 38131, 38142, 38146, 38155, 38158, 38175, 38184, 38189, 38208, 38214, 38221, 38228~38229, 38266~38267, 38272, 38278~38283, 38287, 38289, 38297, 38301~38302, 38322, 38325~38328, 38337, 38339~38341, 38344, 38347~38348, 38352~38354, 38364, 38368, 38370, 38589, 38593~38594, 38598, 38600, 38609, 38638, 38642, 38665, 38679, 38682, 38685, 38691, 38697, 38700, 38702~38703, 38729, 38738, 38747, 38760~38761, 38768, 38776, 38780~38781, 38786~38787, 38792, 38796~38797, 38802, 38806, 38808, 38811, 38819, 38832, 38845, 38849, 38858, 38884, 38895~38896, 38901~38902, 38905, 38913, 38917, 38927, 38937~38938, 38948, 38952, 38957, 38963, 38968, 38976, 38978, 38982, 38987, 38994~38996, 39003, 39005, 39009, 39011, 39013, 39021, 39025, 39028, 39034, 39039, 39042, 39047, 39053, 39066~39067, 39081~39082, 39091, 39099, 39101, 39108, 39110, 39112, 39119, 39128, 39133, 39138, 39146~39147, 39157, 39161, 39170~39171, 39181, 39185, 39188, 39191, 39205~39206, 39210, 39217, 39221, 39223, 39228, 39231, 39243, 39246, 39250~39251, 39259~39260, 39263, 39266, 39275, 39279, 39283, 39293, 39298, 39300~39301, 39306, 39311, 39313~39314, 39331, 39343, 39346, 39354, 39362~39363, 39372, 39381, 39383, 39386, 39388~39389, 39398, 39404, 39413, 39416, 39437, 39447, 39452, 39458, 39461, 39463~39464, 39472~39473, 39479, 39486, 39489, 39495, 39500, 39504, 39515~39516, 39529, 39532~39533, 39544, 39548, 39554, 39562~39563, 39567, 39575, 39584, 39592~39593, 39597, 39599, 39609~39612, 39625, 39629, 39631, 39636, 39640~39641, 39658~39660, 39665, 39675~39677, 39679, 39692, 39694, 39704, 39708~39710, 39712, 39714~39715, 39728, 39731, 39734~39735, 39745, 39756, 39763, 39774, 39778, 39780, 39783, 39787~39788, 39793, 39796~39797, 39806, 39823, 39832, 39838, 39854, 39870~39871, 39877, 39892, 39896~39897, 39899, 39901~39902, 39907~39908, 39918~39919, 39925, 39935, 39940, 39945~39946, 39956, 39962, 39964~39965, 39971, 39979~39980, 39987, 39991, 39997, 40002, 40004~40005, 40011, 40014, 40020, 40031, 40034~40037, 40046, 40049, 40064, 40069, 40076, 40092~40094, 40104, 40107, 40116~40117, 40121~40123, 40128, 40132, 40143, 40148, 40153, 40160, 40164, 40166, 40178, 40180, 40187, 40192, 40199~40200, 40208, 40212, 40218, 40220, 40223~40224, 40227, 40229, 40236, 40242, 40246, 40263~40264, 40271~40273, 40279, 40288~40290, 40294, 40304~40307, 40319~40320, 40334, 40337~40341, 40346, 40355, 40368, 40374, 40379, 40384, 40403, 40409~40410, 40415~40416, 40423, 40454, 40463~40464, 40471, 40474~40475, 40483, 40487, 40491, 40495, 40522, 40524~40525, 40528~40529, 40531, 40534~40535, 40537, 40541~40545, 40547, 40552, 40554~40556, 40567~40568, 40573, 40581, 40583, 40587, 40589, 40593, 40595, 40597, 40603, 40621~40622, 40628, 40630, 40636, 40647, 40652, 40656, 40660~40661, 40665, 40667, 40669~40670, 40672~40674, 40679~40680, 40684~40685, 40687, 40690, 40692, 40698, 40703, 40705, 40707, 40712, 40718, 40728, 40731, 40736, 40746, 40751, 40755, 40757, 40763~40765, 40767, 40769, 40774, 40780, 40787, 40793, 40799, 40804, 40812, 40818, 40820~40822, 40829, 40839~40843, 40846, 40850, 40854, 40870, 40878, 40882~40883, 40885, 40888, 40892, 40897, 40901, 40906, 40910, 40912~40914, 40916, 40920, 40930, 40934, 40936, 40938, 40943~40944, 40950~40954, 40956, 40958, 40960, 40963, 40970, 40980~40981, 40986, 40990, 40995, 40997~40999, 41008, 41012, 41019, 41026~41027, 41029~41030, 41032, 41034, 41048~41050, 41055, 41058, 41063, 41068, 41075, 41077, 41085, 41087~41088, 41092, 41094, 41100, 41105, 41112, 41116~41117, 41126, 41129, 41131, 41138~41140, 41145, 41147, 41155~41156, 41160, 41162, 41169~41170, 41179~41180, 41186~41187, 41193, 41199, 41201, 41208~41209, 41213, 41221, 41223, 41230, 41235, 41239, 41244, 41256~41258, 41262, 41264, 41270, 41275~41277, 41279, 41282, 41292, 41294~41295, 41298~41299, 41307~41309, 41313, 41315, 41321, 41329, 41333, 41338, 41342~41343, 41345, 41347, 41353, 41355, 41358, 41362~41364, 41387, 41393, 41395~41397, 41403, 41523, 41555, 41715, 41720, 41722, 41727, 41739, 41746, 42142~42143, 42151, 42169, 42180, 42189, 42202, 42227, 42247, 42318, 42320~42321, 42331~42333, 42350, 42389, 42395, 42399, 42407, 42419~42420, 42432, 42438, 42440, 42442, 42455~42456, 42475, 42477, 42481, 42483, 42492, 42495~42497, 42503, 42509, 42524, 42540~42546, 42566, 42568, 42576~42577, 42579~42581, 42589, 42591, 42594, 42601, 42609~42610, 42619~42620, 42631, 42634, 42637, 42642, 42645, 42662, 42670, 42677~42678, 42680~42681, 42685, 42692~42693, 42708, 42710, 42719, 42724, 42730~42732, 42734~42735, 42738, 42742, 42751~42752, 42759~42760, 42764, 42772, 42775~42776, 42780~42781, 42786~42788, 42795, 42800, 42806~42807, 42812~42814, 42819, 42821, 42823, 42830, 42834, 42839~42840, 42846~42848, 42853~42854, 42856, 42862~42863, 42868~42869, 42874, 42876, 42878, 42883~42884, 42888~42890, 42895~42896, 42902~42903, 42909, 42911, 42915, 42921~42922, 42928, 42934~42935, 42941, 42943, 42949~42950, 42952~42953, 42955~42956, 42958~42959, 42965, 42967, 42974~42975, 42980, 42984~42985, 42990, 42997~42998, 43005~43006, 43029~43030, 43036, 43038~43040, 43047, 43052, 43055, 43058~43059, 43061, 43064, 43068, 43072, 43074, 43083, 43085, 43087, 43095, 43097, 43238~43239, 43246~43247, 43343, 43345, 43359, 43401, 44859, 44862, 44864, 44868, 45056, 45058~45060, 45123, 45440, 45442, 45445, 45615, 45643, 45926~45927, 45971, 46059, 46143~46144, 46309, 46327, 46329, 46332, 46534, 46536, 46551, 46553, 46556, 46561, 46657, 46789~46790, 46838~46839, 46916~46917, 52743, 52752, 52755, 52759, 52765, 52777~52778, 52783, 52793, 52796, 52804, 52807, 52811, 52816, 52822, 52824, 52835~52837, 52840, 52843, 52861, 52867, 52875, 52887, 52891, 52896~52897, 52901, 52907, 52912, 52914, 52918, 52920, 52924, 52926, 52929, 52931, 52934, 52936, 52947, 52955~52958, 52963, 52969~52972, 52975, 52977~52978, 52981, 52987, 52989, 52994~52995, 52997, 53004, 53007, 53010~53011, 53015, 53018, 53027, 53029, 53044, 53048, 53052~53053, 53065~53066, 53068, 53074, 53081~53083, 53087, 53095, 53097, 53099, 53106, 53110, 53113, 53120, 53122, 53126, 53129~53131, 53134, 53149, 53151, 53153, 53161, 53188~53189, 53191, 53194~53195, 53199~53200, 53208, 53225, 53227, 53229, 53233, 53238, 53243, 53245~53246, 53250, 53252, 53255, 53262, 53268, 53271, 53276, 53280, 53288, 53303, 53306, 53308, 53311, 53322, 53325, 53333, 53336, 53340, 53354, 53357, 53359, 53362, 53366, 53376, 53379, 53384~53385, 53388, 53394~53396, 53407~53410, 53414, 53417, 53422~53423, 53425, 53432, 53434, 53437, 53444, 53446, 53449, 53455, 53457, 53460, 53467~53468, 53471, 53473, 53487, 53490, 53493, 53496, 53501, 53505, 53510, 53520, 53536, 53545, 53547, 53551, 53567, 53592, 53605, 53623, 53636, 53651, 53653, 53661, 53676, 53679, 53694, 53699~53700, 53745, 53747, 53749, 53756, 53758, 53760~53761, 53769~53770, 53776, 53781~53782, 53787, 53789, 53793~53794, 53798, 53800, 53804~53805, 53809, 53812~53813, 53817, 53820~53821, 53824~53825, 53827, 53829, 53831~53832, 53834~53835, 53839, 53843, 53847, 53849, 53851, 53854~53855, 53859~53864, 53867, 53869, 53872, 53875~53876, 53879~53880, 53883~53884, 53892~53894, 53899~53900, 53903~53904, 53907, 53909, 53911, 53913~53914, 53916~53917, 53919, 53924, 53928~53930, 53932~53934, 53937, 53939, 53941, 53943, 53947, 53949~53950, 53955, 53961, 53971, 53974, 53998, 54001, 54012, 54014, 54019, 54021, 54025, 54030~54032, 60109, 60232, 60730, 60806, 60808, 61161, 61502, 62245, 62273, 62293, 63422, 64545~64546, 65642 | 31580, 31583~31585, 33194, 38780, 38796, 38848, 42798, 42832, 43054 | `003=340; 004=340; 005=392.3081083962334; 006=372.328188876086; 007=307.671811123914; 008=287.6918916037665; 010=441.39085796557566; 011=498.0050355845301; 012=494.7575176250593; 013=413.38037056548455` |
| `r` | 31162 | 5262, 5270, 5285, 5289~5290, 5296, 5302, 5333~5335, 5352, 5416, 10779, 10919, 10938, 10962, 10964, 16596, 17079, 17098~17099, 17101, 17103, 17128, 17157, 17167, 17221, 17227, 17420, 19758, 19835, 20006~20007, 20057, 20074, 20102~20103, 20105, 20175, 20222, 20247, 20267, 22753, 23460, 23477, 24587, 24872, 24889, 24893~24894, 24907, 24975~24976, 25089, 25093, 25095, 25123, 25135, 25169, 25173, 25177, 25337, 25384, 25398, 25918, 28816, 28851, 28975, 30152, 31714, 31722, 31726, 31831, 31918~31920, 31930, 31932, 31936, 31950, 32275, 32429, 32503, 32622, 32668, 33975, 34083, 34427, 34441, 34448, 34467, 34512, 34514~34515, 35100, 35285, 36128, 36176, 36242, 36288, 36526, 36538, 36546, 36613, 36647, 36757, 36871, 36895, 36941, 36962, 36997, 37169, 37362, 37388, 37395, 37439, 37611, 37717, 37719, 37743, 37884, 37923, 38073, 38153, 38221, 38267, 38272, 38278~38279, 38327~38328, 38340~38341, 38348, 38352~38354, 38587, 38589, 38594, 38599, 38789, 38802, 38847, 38905, 38932, 38957, 38968, 38982, 39013, 39028, 39047, 39058, 39065~39066, 39074, 39112, 39145~39146, 39206, 39221, 39301, 39314, 39360, 39362, 39389, 39426, 39464, 39516, 39518, 39521, 39536, 39554, 39562, 39612, 39615, 39650, 39691, 39720, 39815, 39832, 39846, 39869, 39875, 39883, 39908, 39935, 39946, 40051, 40081, 40096, 40122, 40128, 40264, 40273, 40290, 40294, 40333~40334, 40362, 40366, 40404, 40463~40464, 40467, 40469, 40475, 40483, 40487, 40492, 40495, 40500, 40524~40525, 40529, 40532, 40542~40543, 40551, 40568, 40669, 40672~40674, 40680, 40692, 40698, 40703, 40751, 40764~40765, 40821~40822, 40841~40843, 40846, 40913~40914, 40950, 40952~40954, 40956, 40958, 40985, 40990, 41023, 41049~41050, 41058, 41062, 41085, 41087, 41116, 41154, 41168, 41230, 41256~41257, 41276~41277, 41307~41308, 41329, 41342~41343, 41362~41363, 41390, 41396, 41403, 41555, 41597, 41737, 41739, 42475, 42483, 42561, 42563~42564, 42568, 42576~42577, 42708, 42710, 42724, 42726, 42732, 42742, 42797, 42831, 43053, 43074, 43238, 43246~43247, 44862, 45056, 45442, 45617, 45643, 45971, 46311, 46535, 46539, 46789, 52711, 52752, 52762, 52780, 52793, 52796, 52804~52805, 52811, 52822, 52824, 52826~52827, 52829~52830, 52835~52837, 52840, 52843, 52850, 52887, 52889, 52891, 52896~52897, 52900, 52907, 52916, 52922, 52963, 52977~52978, 52981, 52987, 52989, 52994~52995, 52997, 53091, 53097, 53099, 53110, 53113, 53120, 53122, 53126, 53134, 53153, 53161, 53191, 53199~53200, 53223, 53233, 53238, 53276, 53280, 53287, 53297, 53325, 53349, 53383, 53388, 53392, 53417, 53423, 53425, 53432, 53434, 53437, 53442, 53446, 53449, 53455, 53457, 53460, 53467~53468, 53471, 53473, 53501, 53505, 53510, 53520, 53534, 53543, 53566, 53593, 53606, 53622~53623, 53652, 53679, 53694, 53698~53699, 53745, 53747, 53749, 53758, 53760~53761, 53769~53770, 53774, 53781~53782, 53787, 53793, 53798, 53804~53805, 53809, 53812~53813, 53817, 53820~53821, 53824~53825, 53827, 53829, 53831~53832, 53834~53835, 53839, 53842, 53847, 53849, 53851, 53854~53855, 53859~53864, 53867, 53869, 53875~53876, 53879~53880, 53883~53884, 53889, 53892~53894, 53899~53900, 53903~53904, 53907, 53909, 53911, 53913~53914, 53916~53917, 53919, 53924, 53927, 53937, 53939, 53941, 53943, 53947, 53949~53950, 53953, 53955, 53961, 53971, 53974, 53998, 54001, 54012, 54014, 54019, 54021, 54025, 64545, 65641 | 31583~31584, 31623, 35712, 38847, 42797, 42831, 43053 | `003=57; 004=22.73476334709674; 005=20.28180555999279; 006=22.30737677309662; 007=28.97044614702463; 008=20.151121815666556; 010=21.545625534839928; 011=21.945927370339632; 012=26.665450139902532; 013=20.852594511583447` |
| `hp` | 31162 | 5296, 10765, 13486, 17067, 20716, 21554, 21771, 23414, 23501, 23504, 28016, 28062, 30152, 34442, 34507, 34542, 37434, 37439, 38237, 38245, 38776, 38783, 38794, 38812, 38842, 38985, 39180, 39229, 39257, 39344, 39470, 39674~39675, 39770~39771, 39979~39980, 40033~40034, 40076, 40101, 40175, 40199~40200, 40315, 40328, 40353~40354, 40367, 41733~41734, 42113, 42238, 42243~42245, 42383, 42500, 42508, 42549, 52797, 52844, 52876, 53532, 53963, 53992, 54014, 62245, 62273 | 30184, 31621, 31636, 35710, 38780, 38796, 38846, 39415, 40790, 40808, 42797, 42831, 43053 | `003=3500; 004=4377; 005=2187; 006=2187; 007=2187; 008=2187; 010=875; 011=875; 012=875; 013=875` |
| `mhp` | 31162 | 5296, 17067, 20716, 21554, 21771, 23504, 24889, 25089, 25135, 25398, 28016, 28062, 30152, 34507, 34542, 35403, 37433, 38237, 38245, 38607, 38758, 38767, 38776, 38783, 38794, 38812, 38842, 38846, 38985, 39229, 39257, 39344, 39470, 39674, 39770~39771, 39979~39980, 40033, 40076, 40101, 40175, 40199~40200, 40315, 40353, 40367, 41733~41734, 42136, 42160, 42238, 42243~42245, 42340, 42434, 42508, 42549, 42612, 42620, 42662, 42722, 46146, 52797, 52844, 52876, 53532, 53963, 53992, 54014, 62245, 62273 | 30184, 31621, 31636, 35710, 38780, 38796, 38846, 39415, 40790, 40808, 42797, 42831, 43053 | `003=3500; 004=4377; 005=2187; 006=2187; 007=2187; 008=2187; 010=875; 011=875; 012=875; 013=875` |
| `atk` | 31162 | 17061, 17069, 17158, 20016, 20020, 20118~20119, 20129, 20132, 20135, 20138, 20141, 20144, 20147, 30152, 31107, 37762, 37774, 37795, 37825, 37841, 37871, 37886, 37924, 37942, 37958, 37973, 37986, 38008, 38032, 38043, 38064, 38073, 38091, 38112, 38128, 38143, 38156, 38172, 38186, 38205, 38223, 38250~38252, 38286, 38297, 38368, 38771, 38783, 38809, 38812, 38816, 38835, 38875, 38986, 38995, 39021, 39090, 39170, 39182, 39210, 39224, 39250, 39258, 39330, 39371, 39471, 39544, 39659, 39676, 39694, 39713, 39730, 39778, 39792, 39804, 39817, 39823, 39870, 39877, 39885, 39901, 39918, 39962, 39988, 39997, 40035, 40052, 40064, 40082, 40099, 40115, 40148, 40159, 40180, 40187, 40192, 40209, 40319~40320, 40367, 40409, 40501, 40533~40535, 40544~40545, 40553, 40567, 40578, 40587, 40613, 40628, 40656, 40660, 40684~40685, 40706, 40736, 40756, 40766~40768, 40829~40830, 40857, 40862, 40879, 40883~40884, 40898, 40925, 40935, 40960, 40962, 41034, 41036, 41062, 41068, 41092~41093, 41129~41130, 41160~41161, 41179, 41199, 41221, 41238, 41262~41263, 41279, 41281, 41293, 41313~41314, 41333, 41345~41346, 41364, 41370, 41738, 42124, 42131, 42557, 42588, 42600, 42612, 42786~42787, 42819, 42839, 42846, 42853, 42862, 42868, 42875, 42883, 42947, 43058, 45972 | 31622, 35711, 38846, 39415 | `003=62; 004=40; 005=31; 006=31; 007=31; 008=31; 010=31; 011=31; 012=31; 013=31` |
| `baseAtk` | 31162 | 17061, 30152, 38250, 38771, 38783, 38812, 38846, 38986, 40319~40320, 40367, 41738 | 31622, 35711, 38846 | `003=62; 004=40; 005=31; 006=31; 007=31; 008=31; 010=31; 011=31; 012=31; 013=31` |
| `speed` | 31163 | 31916, 38253, 38318, 38701, 38904, 38956, 38981, 38986, 39012, 39027, 39046, 39111, 39204, 39258, 39299, 39312, 39387, 39462, 39471, 39515, 39553, 39610, 39763, 39945, 40076, 40159, 40164, 40272, 40289, 40319~40320, 40463~40464, 40473, 40483, 40819, 40840, 40911, 41226, 41394, 41721, 42558, 64541 | 35712, 42797, 42831 | `003=0.7913562389630824; 004=0.39137590795755384; 005=0.6098637344744058; 006=0.6269484242610635; 007=0.7508026934321969; 008=0.362181977564469; 010=0.6989011177606881; 011=0.5415485634338111; 012=0.7655834316909312; 013=0.5635517939049751` |
| `baseSpd` | 31163 | 38756, 38763 | — | `003=0.7913562389630824; 004=0.39137590795755384; 005=0.6098637344744058; 006=0.6269484242610635; 007=0.7508026934321969; 008=0.362181977564469; 010=0.6989011177606881; 011=0.5415485634338111; 012=0.7655834316909312; 013=0.5635517939049751` |
| `el` | 31163 | 5279, 20020, 20100, 20105, 20144, 20147, 20267, 22646, 22753, 24588, 24921, 28817, 28852, 28978, 30152, 32431, 33977, 34083, 34245, 34275, 34284, 34309, 34321, 35398, 37614, 37762, 37781~37782, 37786~37788, 37804, 37825, 37839, 37841, 37871, 37875, 37886, 37924, 37942, 37946, 37958, 37961, 37986, 38008, 38043, 38074, 38091, 38112, 38115, 38128, 38143, 38156, 38172, 38186, 38205, 38223, 38297, 38368, 38780, 38787, 38796, 38819, 38845, 38927, 39021, 39040, 39244, 39283, 39306, 39414, 39487, 39504, 39543~39544, 39583~39584, 39630, 39635, 39853~39854, 40012, 40105, 40142, 40146, 40152~40153, 40167, 40244, 40341, 40513~40515, 40534~40535, 40544~40545, 40553, 40567, 40587~40588, 40628~40629, 40656, 40660~40661, 40684~40685, 40706, 40736, 40756, 40767~40768, 40829~40830, 40857, 40862, 40879, 40883~40884, 40925, 40935, 40960, 40962, 41034, 41036, 41068~41069, 41092~41093, 41129~41130, 41160~41161, 41179, 41199, 41221, 41238, 41262~41263, 41279, 41281, 41293, 41313~41314, 41333, 41345~41346, 41364, 41370, 42124, 42131, 42328, 42600, 42795, 42830, 42853, 42946, 42948, 42951, 42954, 42957, 43052, 43351, 46327, 46537, 49918, 52901, 52906, 53531, 53563, 53587, 53600, 53947, 60232, 60361 | — | `003=0; 004=0; 005=0; 006=0; 007=0; 008=0; 010=3; 011=0; 012=0; 013=4` |
| `col` | 31163 | 20144~20145, 20147~20148, 20267, 22753, 24872, 24881, 25030, 25086, 25155, 25319, 25376, 34544, 37439, 37782, 37788, 37841, 37923, 38368, 38819, 38847, 39182, 39330, 40153, 40501, 40514, 40537, 40547, 40556, 40567~40568, 40656, 40660~40661, 40667, 40687, 40703, 40718, 40746, 40751, 40832, 40879, 40888, 41199, 41221, 41238~41239, 42399, 42708, 42710, 42798, 42832, 42967, 43054, 52901, 52906, 52978, 52991, 53085, 53153, 53190, 53193, 53195, 53250, 53253, 53460, 53900, 53937 | 35713, 38847 | `003="#4455aa"; 004="#aa44ee"; 005="#88ccff"; 006="#77ddff"; 007="#4477dd"; 008="#aa44ee"; 010="#66aaee"; 011="#88ccff"; 012="#221122"; 013="#88ccff"` |
| `alive` | 31163 | 5238, 5243, 5270, 5288, 5293, 5316, 13486, 16542, 16592, 17067, 17124, 17414, 18590, 18601, 18767, 19834, 19967, 19973, 20074, 20084, 20098, 20120, 24586, 28813, 28848, 28974, 30152, 31831, 32274, 32309, 32428, 32502, 32618, 32661, 33466, 33488, 33789, 33972, 34033, 34081, 34242, 34272, 34280, 34305, 34316, 34363, 34365, 34394, 34401, 34422, 34442, 34506, 34541, 34740, 34760, 34783, 34794, 34828, 34832, 35073, 35100, 35147, 35170, 35191, 35283, 35617, 36127, 36175, 36238, 36266, 36287, 36526, 36538, 36546, 36612, 36644, 36733, 36755, 36870, 36894, 36912, 36940, 36961, 36977, 36996, 37166, 37221, 37244, 37269, 37306, 37316, 37361, 37385, 37423, 37439, 37611, 37618, 39675, 40034, 40423, 40447, 41407, 41522, 41709, 41771, 42112, 42477, 42503, 42508, 42552, 42702, 43237, 43240, 43245, 43344, 43401, 44858, 45056, 45123, 45439, 45614, 45643, 45926, 45970, 46059, 46142, 46325, 46533, 46540, 46788, 46837, 46915, 52281, 52700, 53504, 53530, 53616, 53743, 60231, 60805, 62243, 62245, 62273, 64545, 65685 | 33194 | `전체=true` |
| `stunned` | 31163 | 5247, 10766, 10778, 17070, 17172, 19981, 20084, 20120, 32507, 33988, 34449, 34454, 34463, 34507, 34542, 34760, 35472, 35583, 36529, 36617, 36873, 36897, 36917, 36941, 36999, 37176, 37626, 37630, 38257, 38316, 38379, 38617, 38620, 38622, 38625~38626, 38667, 39180, 40587, 40628, 40682~40683, 40960, 41034, 41068, 41092, 41129, 41160, 41262, 41279, 41313, 41345, 42202, 42251, 42336, 42377, 42508, 42552, 43358, 45647~45648, 46329, 46546, 46549, 46841, 46920, 52798, 52845, 52877, 52879, 53965, 64542 | — | `전체=0` |
| `kb` | 31163 | 17070, 31740, 32293, 32433, 32506, 33794, 33987, 34084, 34432, 34440~34441, 34467, 34507, 34542, 35458, 35460, 36132, 36180, 36248, 36293, 36618, 36872, 36896, 36998, 37175, 37249, 37624, 38593, 38596, 38601, 38605, 38610~38613, 39664, 40445, 40683, 42482, 43242, 43349, 46151, 46330, 46539, 46842 | — | `전체={"x":0,"y":0}` |
| `poise` | 31164 | 19976, 19978~19979, 20003, 34543, 36250, 38661, 38663, 42555, 43358, 46547, 46550, 64542 | 31624 | `003=80; 004=1751; 005=875; 006=875; 007=875; 008=875; 010=875; 011=875; 012=875; 013=875` |
| `maxPoise` | 31164 | 20003, 34543, 37623, 38254, 38661, 38663, 42555, 43354, 46328, 46543, 64542 | 31624 | `003=80; 004=1751; 005=875; 006=875; 007=875; 008=875; 010=875; 011=875; 012=875; 013=875` |
| `poiseR` | 31164 | 19977, 20004, 38662~38663 | — | `전체=0` |
| `ib` | 31165 | 5246, 16938, 16941, 16944, 17055, 19967, 19975, 19980, 19983, 20017, 20026, 20120, 23295, 23375, 24872~24873, 24889, 24893, 24905, 24976, 24988, 25089~25090, 25135, 25145, 25168, 25173, 25398, 25400~25402, 25405, 25409, 30152, 32008~32010, 32048, 32052, 32054, 32507, 34363, 34365, 34421, 34424, 34434, 34454, 34460, 34463, 34475, 34489, 34500, 35403, 35583, 36529, 37245, 37275, 37277, 37322, 37324, 37439, 37623, 37762~37763, 37942, 37946, 37958, 37961, 37971, 38629, 38647, 38661, 38691, 38697, 38701, 38880, 38882, 40445, 40447, 40450, 40452, 40469, 40479, 40486, 40505, 41237, 41240, 41375~41376, 41382, 41386, 41407, 42123, 42130, 42189, 42202, 42209, 42258~42260, 42340, 42382, 42414, 42419~42420, 42431, 42446, 42450, 42463, 42475, 42481, 42515, 42627, 42641, 42706, 42708, 42710, 42715, 42726, 42734~42735, 42747, 42757, 42946, 43078, 43092, 43094, 43097, 43105, 43113~43114, 43352, 45645~45646, 46328, 46542, 52709, 52711, 52722, 52725, 52798, 52845, 52877, 52889, 52891, 52897, 52904, 52910, 52915, 52921, 52927, 52932, 52937, 52964, 52980, 53089, 53283, 53295, 53316, 53327, 53343, 53370, 53390, 53399, 53419, 53428, 53440, 53452, 53460, 53526, 53673, 53756, 53947, 53949, 53953, 53955, 53965, 53967, 53971, 60729, 60805, 64228 | — | `전체=false` |
| `etype` | 31165 | 5254, 5281, 5293~5294, 5349, 5352, 5425, 5429, 9755, 20126, 20268, 23063, 23298, 23489, 24872, 24875~24878, 24920, 27892, 30152, 31727~31729, 32009, 34469, 34486, 37439, 38671, 38688, 38796, 38845, 38888, 38891, 38911, 38920, 38944, 38960, 38973, 38985, 38991, 39000, 39017, 39031, 39050, 39058, 39063, 39074, 39078, 39086, 39096, 39116, 39125, 39143, 39153, 39166, 39175, 39199, 39214, 39237, 39255, 39289, 39318, 39337, 39358, 39367, 39377, 39392, 39408, 39431, 39467, 39510, 39521, 39525, 39539, 39557, 39571, 39579, 39588, 39603, 39619, 39650, 39654, 39664, 39668, 39683, 39700, 39720, 39724, 39739, 39766, 39812, 39827, 39843, 39859, 39881, 39889, 39912, 39929, 39951, 39975, 40026, 40041, 40059, 40079, 40087, 40111, 40139, 40157, 40171, 40196, 40253, 40268, 40284, 40314, 40325, 40359, 40372, 40394, 40420, 40458, 40460, 40462, 40499, 40505, 40510, 40568, 40703, 40779, 40783~40784, 40794, 41232, 41378, 41381, 42136, 42138, 42147, 42149, 42154, 42156, 42158, 42167, 42175, 42177, 42179, 42193, 42209, 42507, 42605, 42706, 42708, 42710, 42747, 42784, 42792, 42804, 42810, 42817, 42827, 42837, 42844, 42851, 42866, 42873, 42882, 42887, 42894, 42899, 42906, 42914, 42919, 42925, 42931, 42938, 42964, 42970, 42978, 42988, 42993, 43001, 43009, 43015, 43025, 43033, 52748~52749, 52773, 52854, 53643, 53758, 53786, 53792, 53797, 53803, 53809, 53811, 53817, 53819, 53823, 53827, 53829, 53831, 53834, 53837, 53842, 53847, 53849, 53851, 53853, 53859~53864, 53867, 53869, 53871, 53874, 53879, 53882, 53886, 53892, 53897, 53902, 53905, 53908, 53910, 53912, 53915, 53921, 53976, 53991, 54016, 54019, 62245, 62273 | — | `003=29; 004=7; 005=20; 006=25; 007=6; 008=7; 010=21; 011=20; 012=47; 013=20` |
| `room` | 31165 | 38780, 38796, 38845, 39040, 39630, 40012, 40105, 40244, 40415, 40789, 40807, 42795, 42830, 43016, 43052 | — | `전체=-1` |
| `lv` | 31165 | 30152, 42628, 43111, 53971, 53992 | 30184 | `전체=1` |
| `s` | 31165 | 5272, 5305, 9545, 10764, 10901, 10912~10916, 10941~10942, 10947, 10949, 10954, 17070, 17102, 17172, 17178, 17186~17187, 17189~17190, 17193, 17198~17199, 17216~17217, 17222, 20068, 20105, 20119~20120, 20164, 20168, 20252, 20270, 21220, 22861, 23060, 23413, 23500, 30787, 33988, 34442, 34454, 34459, 34507, 34542, 36251, 37626, 37713~37715, 37719, 37721~37723, 37727~37737, 37747, 37752, 37755~37758, 37765, 37790, 37812, 37830, 37844, 37849, 37857, 37876, 37888, 37892, 37900, 37912, 37929, 37947, 37962, 37977, 37990, 38001, 38011, 38017, 38022, 38035, 38046, 38051, 38057, 38066, 38077, 38082, 38092, 38116, 38132, 38147, 38159, 38176, 38190, 38210, 38230, 38257, 38261, 38379, 38631, 38677, 38682, 38684, 38687, 38785, 38802, 38877, 38888, 38893, 38911, 38917, 38920, 38938, 38944, 38960, 38969, 38973, 38978, 38991, 39000, 39004, 39017, 39031, 39050, 39053, 39058, 39063, 39066, 39074, 39078, 39086, 39096, 39100, 39116, 39119, 39125, 39128, 39137, 39143, 39146, 39153, 39156, 39166, 39175, 39185, 39199, 39214, 39222, 39237, 39255, 39274, 39278, 39289, 39318, 39329, 39337, 39353, 39358, 39362, 39367, 39377, 39382, 39392, 39397, 39403, 39408, 39431, 39457, 39467, 39478, 39494, 39499, 39510, 39518, 39521~39522, 39525, 39536, 39539, 39543, 39557, 39563, 39571, 39574, 39579, 39583, 39588, 39597, 39603, 39615, 39619, 39625, 39650, 39654, 39664, 39668, 39671, 39683, 39700, 39720, 39724, 39727, 39739, 39766, 39812, 39822, 39827, 39837, 39843, 39853, 39859, 39881, 39889, 39912, 39924, 39929, 39939, 39951, 39955, 39970, 39975, 39996, 40019, 40026, 40030, 40041, 40059, 40063, 40079, 40087, 40111, 40139, 40147, 40152, 40157, 40171, 40186, 40191, 40196, 40217, 40235, 40251, 40258, 40278, 40322, 40375, 40378, 40445, 40450, 40452~40453, 40456, 40481, 40486, 40526, 40529, 40536, 40538, 40542, 40546, 40548, 40557, 40559, 40569, 40604, 40640, 40642, 40662, 40666, 40671, 40677~40678, 40686, 40688, 40690, 40701, 40717, 40747, 40750, 40758, 40760, 40764, 40773, 40775, 40795, 40813, 40823, 40834, 40848, 40850, 40866, 40871, 40889, 40902, 40907, 40939, 40947, 40975, 41001, 41011, 41044, 41050, 41058, 41072, 41078, 41106, 41108, 41118, 41141, 41148, 41182, 41188, 41203, 41210, 41231~41232, 41240, 41249, 41267, 41271, 41276, 41283~41284, 41300, 41324, 41335, 41339, 41349~41350, 41354, 41359, 41371~41372, 41375, 41379, 41382, 41386, 41401, 41403, 42123, 42127, 42130, 42382, 42414, 42508, 42552, 45644, 52766, 52896, 52904, 52910, 52915, 52921, 52927, 52932, 52937, 52964, 52978, 52984, 53000, 53034, 53078, 53089, 53117, 53136, 53145, 53156, 53186, 53192, 53197, 53203, 53211~53212, 53221, 53237, 53241, 53248, 53258, 53265~53266, 53274, 53278, 53283, 53295, 53316, 53327, 53343~53344, 53370, 53390, 53399, 53419, 53428, 53440, 53452, 53523, 53758, 53869, 53927, 53937, 53939, 53941, 53943, 54038, 62245, 62273, 64540 | — | `전체="idle"` |
| `st2` | 31165 | 5329, 10941, 10943, 10948, 10952, 17070, 17166, 17178, 17187, 17190, 17196, 17198~17199, 17222, 20068, 20105, 20120, 30787, 34454, 34507, 34542, 37626, 37713~37715, 37719, 37721~37723, 37727~37737, 37747, 37752, 37755~37758, 37765, 37790, 37812, 37830, 37844, 37850~37851, 37857, 37876, 37888, 37892, 37900, 37912, 37929, 37947, 37962, 37977, 37990, 38001, 38011, 38017, 38022, 38035, 38046, 38051, 38057, 38066, 38077, 38082, 38092, 38116, 38132, 38147, 38159, 38176, 38190, 38210, 38230, 38257, 38261, 38631, 38684, 38802, 38884, 38888, 38917, 38938, 38969, 38978, 39004, 39053, 39066, 39100, 39119, 39128, 39137, 39146, 39156, 39185, 39222, 39274, 39278, 39329, 39353, 39362, 39382, 39397, 39403, 39457, 39478, 39494, 39499, 39518, 39522, 39536, 39543, 39563, 39574, 39583, 39597, 39615, 39625, 39671, 39727, 39822, 39837, 39853, 39924, 39939, 39955, 39970, 39996, 40019, 40030, 40063, 40147, 40152, 40186, 40191, 40217, 40235, 40258, 40278, 40322, 40375, 40378, 40452~40453, 40500, 40502, 40522, 40526, 40529, 40536, 40538, 40542, 40546, 40548, 40550, 40557, 40559, 40563, 40569, 40574, 40604, 40610, 40640, 40642, 40648, 40662, 40665~40666, 40671, 40677~40678, 40686, 40688, 40690, 40693, 40699, 40701, 40715, 40717, 40747, 40750, 40758, 40760, 40764, 40773, 40775, 40781, 40795, 40800, 40813, 40823, 40825, 40834, 40844, 40848, 40850, 40856, 40860, 40866, 40871, 40876, 40882, 40889, 40893, 40902, 40907, 40924, 40928~40929, 40931, 40939, 40945, 40947, 40966, 40972, 40975, 40981, 40983, 40988, 41001, 41009, 41011, 41020, 41044, 41050, 41054, 41058, 41060, 41072, 41076, 41078, 41081, 41102, 41106, 41108, 41113, 41118, 41120, 41122, 41141, 41148, 41150, 41172, 41182, 41188, 41190, 41203~41204, 41210, 41231~41233, 41240, 41247, 41249, 41253, 41267, 41271, 41276, 41283~41284, 41289, 41300, 41303, 41318, 41322, 41324, 41335, 41339, 41349~41350, 41354, 41359, 41371~41372, 41375~41376, 41379, 41382, 41401, 41403, 42127, 42382, 42508, 42552, 52905, 52911, 52916, 52922, 52928, 52933, 52938, 52965, 52984, 53001, 53035, 53078, 53117, 53136, 53147, 53186, 53198, 53204, 53214, 53222, 53242, 53258, 53267, 53274, 53284, 53296, 53317, 53328, 53345, 53371, 53391, 53400, 53429, 53939, 64540 | — | `003=32.57731593446806; 004=38.56643340084702; 005=46.800236131530255; 006=70.8438818063587; 007=65.21435082657263; 008=67.30617832625285; 010=46.095641534775496; 011=51.25483084237203; 012=46.72991442028433; 013=52.795816615689546` |
| `facing` | 31165 | 5259~5260, 5286, 10785, 10791, 10900, 17194, 17227, 20057, 20118, 20124, 20129, 20132, 20135, 20138, 20141, 20144, 20147, 20169, 20215~20216, 20223, 20248, 20250, 20254, 20258, 20267, 21245, 22753, 23458, 23480, 31737, 34467, 37714, 37720, 37728, 37751, 37757, 37766, 37772, 37778, 37794, 37801, 37816, 37822, 37834, 37841, 37848, 37856, 37880, 37898, 37921, 37923, 37933, 37939, 37970, 38214, 38219, 38685, 38802, 38917, 38956, 38981, 39004, 39027, 39046, 39066, 39100, 39103, 39137, 39146, 39203, 39274, 39362, 39382, 39494, 39514, 39553, 39574, 39671, 39837, 39939, 39955, 40028, 40030, 40120, 40208, 40262, 40274, 40379, 40463~40464, 40483, 40522, 40587, 40647, 40652, 40665~40666, 40669, 40683, 40692, 40943, 40946, 40950, 40960, 40970~40971, 40980, 40998, 41034, 41048, 41068, 41075, 41084, 41089, 41092, 41099, 41105, 41112, 41115, 41129, 41145, 41157, 41160, 41167, 41176, 41186, 41208, 41213, 41218, 41228~41229, 41245~41246, 41255, 41259, 41262, 41270, 41272, 41279, 41306, 41310, 41313, 41321, 41338, 41353, 41358, 41397, 42142, 52759, 52777~52778, 52834, 52861~52862, 52869, 52899~52900, 52918, 52920, 52924, 52926, 52966, 52970~52971, 52975, 52980, 53081, 53125, 53130~53131, 53223, 53287, 53298, 53347~53348, 53376, 53379, 53385, 53392, 53396, 53405, 53408~53409, 53414, 53442, 53568, 53592, 53605, 53651, 53653, 53820~53821, 53949~53950, 64541 | — | `003=2.338503439414784; 004=0.547886661861489; 005=3.122772508009473; 006=3.036930852359955; 007=3.6584474070763107; 008=3.554008956864225; 010=1.1974583558384342; 011=1.1449594676090138; 012=2.8404800980603606; 013=2.3192027749846393` |
| `elite` | 31166 | 5349~5350, 32010, 32056, 38847, 38853, 42414, 42628, 42634, 42748, 42750, 42946~42947, 43064, 43078, 43105, 43111, 43113, 52709, 53571, 53573~53574, 53977, 54004, 54016, 54019, 64544 | 31625, 31636, 35709, 38780, 38796, 38847, 43053 | `003=3; 004=1; 005=1; 006=1; 007=1; 008=1; 010=0; 011=0; 012=0; 013=0` |
| `mods` | 31166 | 31099, 31101, 31105, 31107, 31109, 38774, 38776, 38778, 38783, 38785, 38791, 38794, 38800, 38802, 38804, 38806, 38808, 38811, 38815, 38818, 38821, 38842, 38853, 38857, 42185, 42189, 42259~42260, 43045, 43047, 43050, 43057, 43061, 53978, 54018, 54024~54025, 54028 | 38780, 38796, 43053 | `003=[]; 004=["M30"]; 005=[]; 006=[]; 007=[]; 008=[]; 010=[]; 011=[]; 012=[]; 013=[]` |
| `aura` | 31166 | 34401~34402, 34407~34410, 53483, 53988, 54021 | — | `전체=null` |
| `modT` | 31167 | 5248, 31038~31039, 38776, 38778, 38787~38789, 38791, 38794, 38800, 38802, 38804, 38806, 38808, 38815, 38818, 38822~38823, 38826~38827, 38829, 38831, 38833, 38839, 38842~38843, 38851, 38854~38856, 43050, 52881, 54028~54029 | 43053 | `전체={"regen":0,"summon":0,"tp":0,"chaos":0,"vortex":0,"lightning":0,"twarp":0,"cloned":false,"revived":false,"split":false,"sentry":0,"sentryAng":0,"sentryOn":false,"illusioned":false,"stealthT":0,"eliteBusy":0,"eliteCharge":0,"eliteRing":0,"eliteBolt":0,"eliteMortar":0}` |
| `projCd` | 31153, 31168 | 40505, 40507, 40511 | — | `003=240; 004=192; 005=9999; 006=240; 007=240; 008=240; 010=240; 011=9999; 012=240; 013=9999` |
| `projT` | 31168 | 40377, 40505, 40509, 40511 | — | `003=233.30608122982085; 004=292.3163157328963; 005=294.2854274343699; 006=180.6872864998877; 007=245.2865995746106; 008=297.9937467444688; 010=272.19979790970683; 011=288.038684790954; 012=274.3530197069049; 013=223.52788844145834` |
| `chargeT` | 31169 | — | — | `전체=0` |
| `chargeCd` | 31169 | — | — | `전체=9999` |
| `dropTier` | 31170 | 32029, 32043, 42973, 42983, 42996, 43004 | 31626 | `003=2; 004=0; 005=0; 006=0; 007=0; 008=0; 010=0; 011=0; 012=0; 013=0` |
| `bossPatCd` | 31171 | 38255, 38430, 42559 | — | `전체=9999` |
| `bossPatT` | 31171 | 17173, 17175, 17190, 38257, 38384~38385, 38396, 38410, 38430 | — | `003=32.19787071458995; 004=40.628909333609045; 005=33.23805855587125; 006=42.31489705387503; 007=37.580847572535276; 008=38.27133228071034; 010=39.49063525069505; 011=36.688303239643574; 012=48.0759654333815; 013=37.80602919869125` |
| `jumpX` | 31172 | 37718, 40695~40696, 53138~53139, 53141 | — | `전체=0` |
| `jumpY` | 31172 | 37718, 40695~40696, 53138~53139, 53141 | — | `전체=0` |
| `jumpOx` | 31172 | 37718, 40695~40696 | — | `전체=0` |
| `jumpOy` | 31172 | 37718, 40695~40696 | — | `전체=0` |
| `_bossPhase` | 31173 | 17061, 17068, 17143, 17153, 17181, 22848, 22868, 37714, 37775, 37796, 37817, 37835, 37862, 37881, 37899, 37916, 37934, 37951, 37966, 37982, 38040, 38094, 38121, 38137, 38152, 38181, 38195, 38215, 38239, 38241, 38317, 38331, 38360, 38363, 38375, 38381, 38393, 38401, 38407, 38434, 38441, 40564, 40647, 40650~40651, 40655, 40894, 40919, 41125, 41175, 41192, 41194, 41216, 42550, 52911, 53078, 53080, 53260, 53462, 53464~53465, 53467~53468, 53470 | — | `전체=0` |
| `_comboSeq` | 31175 | 17073, 17175, 37687, 38258, 38389~38390, 38402, 38435, 42554 | — | `전체=null` |
| `_comboIdx` | 31175 | 17073, 17175, 37687, 38258, 38389~38390, 38394, 38402, 38435, 42554 | — | `전체=0` |
| `_feinting` | 31178 | 17073, 17175, 37710, 38258, 38399, 38438, 40452~40453, 42554 | — | `전체=false` |
| `_delaying` | 31178 | 17073, 17175, 38258, 42554 | — | `전체=0` |
| `_dbgScores` | 31179 | 38425 | — | `전체=null` |
| `shockR` | 31180 | 40557, 40678, 40700, 40750, 40753, 40755, 40758, 41134, 53192~53195 | — | `전체=0` |
| `shockMax` | 31180 | 40557, 40678, 40700, 40750, 40758, 41134, 53193 | — | `전체=0` |
| `laserAng` | 31180 | 37720, 40713~40714, 40716, 40722, 40724, 40726, 40740, 52940, 52947, 52956~52957, 53147, 53158 | — | `전체=0` |
| `laserLen` | 31180 | 37720, 40717, 40727~40728, 53159 | — | `전체=0` |
| `deaths` | 31180 | 17064, 42516, 42535, 42540, 42574, 42587~42588, 42596~42597, 42617, 42648 | — | `전체=0` |
| `reviveIframes` | 31180 | 5247, 17070, 17172, 17187, 30787, 34456, 34508, 38247, 38590, 42120~42121, 42556, 52880, 53982 | 35677 | `전체=0` |
| `meteors` | 31180 | 37724, 37726, 40827, 40834, 53211, 53213 | — | `전체=[]` |
| `_revPts` | 31181 | 17064, 17068, 34505, 34513, 34518, 34531, 42530~42531, 42537, 42541, 42543, 42562, 42647 | — | `전체=0` |
| `_maxRevPts` | 31181 | 34513, 34518, 42541, 42543, 42562 | — | `전체=0` |
| `shieldAng` | 31183 | 38913~38914, 42168, 53769~53770, 53773, 53781~53782 | — | `003=0; 004=0; 005=0; 006=0; 007=4.720881879610889; 008=0; 010=0; 011=0; 012=0; 013=0` |
| `eShield` | 31184 | 17067, 34507, 38893, 38917, 42345~42347, 42508, 42549, 46149, 52797, 52844, 52876, 53764, 53766, 53963, 53979, 62245 | 39415, 40790, 40808, 42797, 42831, 43053 | `003=875; 004=1751; 005=875; 006=875; 007=875; 008=875; 010=875; 011=875; 012=875; 013=875` |
| `eShieldMax` | 31184 | 17067, 34507, 42345, 42508, 42549, 52797, 52844, 52876, 53763, 53766, 53963 | 39415, 40790, 40808, 42797, 42831, 43053 | `003=875; 004=1751; 005=875; 006=875; 007=875; 008=875; 010=875; 011=875; 012=875; 013=875` |
| `eShieldRegenT` | 31184 | — | — | `전체=0` |
| `eRes` | 31185 | 42173 | — | `전체=[0,0,0,0,0,0,0]` |
| `_firstShot` | 31186 | — | — | `전체=false` |
| `bleed` | 31187 | 32318, 35412, 35577, 37437, 37469, 38730, 42163, 42318, 42367, 42674, 44866 | — | `전체=0` |
| `bleedT` | 31187 | 32318, 35413, 35577, 37435, 37469, 38723~38725, 38730, 42163, 42318, 42367, 42376, 42674, 44865, 64543 | — | `전체=0` |
| `bleedStk` | 31187 | 32318, 35414~35415, 35577, 37435, 37469, 38728, 38730, 42163, 44865 | — | `전체=0` |
| `_bleedPool` | 31187 | 32318, 35415, 35577, 37435, 37469, 38726~38727, 38730, 42163, 44865 | — | `전체=0` |
| `poison` | 31187 | 24597, 35357, 37437, 37442, 38739, 42164, 42254, 42426 | — | `전체=0` |
| `poisonT` | 31187 | 24597, 35357, 37436, 37442, 38732~38734, 38739, 42164, 42375, 42426, 64543 | — | `전체=0` |
| `poisonStk` | 31187 | 24597, 24599~24600, 35358~35359, 35435~35436, 37436, 37442, 38737, 38739, 42164, 42426 | — | `전체=0` |
| `_poisonPool` | 31187 | 24597, 35359, 37436, 37442, 38735~38736, 38739, 42164, 42426 | — | `전체=0` |
| `burnT` | 31187 | 24595, 32284, 34038, 34246, 34276, 34285, 34311, 34323, 36131, 36179, 37366, 37476, 37480, 37484, 38741~38743, 38748, 42253, 42371, 42429, 43243, 64543 | — | `전체=0` |
| `burnStk` | 31187 | 24595, 32284, 34038, 34246, 34276, 34285, 34311, 34323, 36131, 36179, 37366~37367, 37476, 37480, 37484, 38746, 38748, 42429, 43243 | — | `전체=0` |
| `_burnPool` | 31187 | 24595, 34038, 34246, 34276, 34285, 34311, 34323, 36131, 36179, 37367, 37476, 37480, 37484, 38744~38745, 38748, 42429 | — | `전체=0` |
| `shieldBashCd` | 31188 | 38917 | — | `003=9999; 004=9999; 005=9999; 006=9999; 007=174.16161571629345; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `shieldBashT` | 31189 | 38915, 38917 | — | `003=9999; 004=9999; 005=9999; 006=9999; 007=71.7094944883138; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `summonCd` | 31190 | 40794 | — | `003=9999; 004=250.14942525886; 005=9999; 006=9999; 007=9999; 008=220.42954417411238; 010=9999; 011=9999; 012=9999; 013=9999` |
| `summonT` | 31191 | 38921, 38935, 38939, 40794 | — | `003=9999; 004=157.41148072760552; 005=9999; 006=9999; 007=9999; 008=106.3739270158112; 010=9999; 011=9999; 012=9999; 013=9999` |
| `teleportCd` | 31192 | 38925 | — | `003=9999; 004=175.49626126885414; 005=9999; 006=9999; 007=9999; 008=170.0400953553617; 010=9999; 011=9999; 012=9999; 013=9999` |
| `teleportT` | 31193 | 38921, 38925, 38929, 38933 | — | `003=9999; 004=111.58698863349855; 005=9999; 006=9999; 007=9999; 008=109.30341063067317; 010=9999; 011=9999; 012=9999; 013=9999` |
| `_tpWarnT` | 31194 | 17074, 34523, 38786~38787, 38789, 38923~38925, 38932, 39419~39421, 39426, 40330~40332, 40342, 40348, 40397~40399, 40404, 42583 | — | `전체=0` |
| `_tpWarnMax` | 31194 | 38789, 38932, 39426, 40348, 40404 | — | `전체=30` |
| `_tpWarnX` | 31194 | 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — | `전체=0` |
| `_tpWarnY` | 31194 | 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — | `전체=0` |
| `_tpWarnCol` | 31194 | 38789, 38932, 39426, 40348, 40404 | — | `전체="#aa00ff"` |
| `bombCd` | 31195 | — | — | `전체=9999` |
| `bombT` | 31196 | — | — | `전체=9999` |
| `reviveCd` | 31197 | 38953 | — | `전체=9999` |
| `reviveT` | 31198 | 38945~38946, 38953~38954 | — | `전체=9999` |
| `stealthCd` | 31200 | 38963 | — | `전체=9999` |
| `stealthT` | 31167, 31200 | 38961~38963 | — | `전체=9999` |
| `_cloaked` | 31200 | 5248, 21499, 38962~38963, 38965, 38969, 39216~39217, 39219, 39222, 52881, 53804 | — | `전체=false` |
| `wombCd` | 31202 | 40794 | — | `전체=9999` |
| `wombT` | 31202 | 38974~38975, 38979, 40794 | — | `전체=9999` |
| `_enraged` | 31204 | 38985~38986, 53812 | — | `전체=false` |
| `webCd` | 31206 | 38996 | — | `전체=9999` |
| `webT` | 31206 | 38992~38993, 38996 | — | `전체=9999` |
| `swoopCd` | 31208 | 39005 | — | `전체=9999` |
| `swoopT` | 31208 | 39001~39002, 39005 | — | `전체=9999` |
| `_swoopOx` | 31208 | 39003 | — | `전체=0` |
| `_swoopOy` | 31208 | 39003 | — | `전체=0` |
| `_homeX` | 31210 | 5254, 23298, 52773, 52854, 53643, 60675, 60730, 60806 | — | `003=4020; 004=4075; 005=4036.995934690622; 006=3975.504065309378; 007=3975.504065309378; 008=4036.995934690622; 010=4159.552543804879; 011=4071.338948165395; 012=3969.716234383507; 013=3919.000584636192` |
| `_homeY` | 31210 | 60730, 60806 | — | `003=340; 004=340; 005=392.3081083962334; 006=372.328188876086; 007=307.671811123914; 008=287.6918916037665; 010=441.39085796557566; 011=498.0050355845301; 012=494.7575176250593; 013=413.38037056548455` |
| `_patrolX` | 31211 | — | — | `전체=0` |
| `_patrolY` | 31211 | — | — | `전체=0` |
| `_patrolT` | 31211 | — | — | `전체=0` |
| `_splitDone` | 31212 | 42792 | 42797 | `전체=false` |
| `trapCd` | 31214 | 39025 | — | `전체=9999` |
| `trapT` | 31214 | 39018~39019, 39025 | — | `전체=9999` |
| `motherCd` | 31216 | 39043 | — | `전체=9999` |
| `motherT` | 31216 | 39032~39033, 39043~39044 | — | `전체=9999` |
| `drainHeal` | 31218 | — | — | `전체=0` |
| `_iceOnHit` | 31219 | 31113 | — | `003=true; 004=false; 005=true; 006=true; 007=false; 008=false; 010=true; 011=true; 012=false; 013=true` |
| `slamCd` | 31221 | 39053 | — | `전체=9999` |
| `slamT` | 31221 | 39051~39053 | — | `전체=9999` |
| `_iceFreeze` | 31223 | — | — | `003=0.35; 004=0; 005=0.35; 006=0.35; 007=0; 008=0; 010=0.35; 011=0.35; 012=0; 013=0.35` |
| `_iceChargeCd` | 31224 | 39067 | — | `전체=9999` |
| `_iceChargeT` | 31225 | 39064~39065, 39067 | — | `전체=9999` |
| `_iceSwoopCd` | 31226 | 39101 | — | `전체=9999` |
| `_iceSwoopT` | 31227 | 39097~39098, 39101 | — | `전체=9999` |
| `_iceSwoopOx` | 31227 | 39099 | — | `전체=0` |
| `_iceSwoopOy` | 31227 | 39099 | — | `전체=0` |
| `_iceSlimeCd` | 31228 | 39082 | — | `003=9999; 004=9999; 005=9999; 006=157.47992157936096; 007=9999; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `_iceSlimeT` | 31229 | 39079~39080, 39082 | — | `003=9999; 004=9999; 005=9999; 006=57.954802359454334; 007=9999; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `_iceSlamCd` | 31230 | 39119, 39128 | — | `003=311.89024919644; 004=9999; 005=9999; 006=9999; 007=9999; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `_iceSlamT` | 31231 | 39117~39119, 39126~39128 | — | `003=102.96457104384899; 004=9999; 005=9999; 006=9999; 007=9999; 008=9999; 010=9999; 011=9999; 012=9999; 013=9999` |
| `_iceBlizzCd` | 31232 | 39091 | — | `전체=9999` |
| `_iceBlizzT` | 31233 | 39087~39088, 39091 | — | `전체=9999` |
| `_wildChargeCd` | 31235 | 39147 | — | `전체=9999` |
| `_wildChargeT` | 31236 | 39144~39145, 39147 | — | `전체=9999` |
| `_boulderSlamCd` | 31237 | 39156 | — | `전체=9999` |
| `_boulderSlamT` | 31238 | 39154~39156 | — | `전체=9999` |
| `_poisonZoneCd` | 31239 | 39169 | — | `전체=9999` |
| `_poisonZoneT` | 31240 | 39167~39169 | — | `전체=9999` |
| `_beastComboCd` | 31241 | 39178 | — | `전체=9999` |
| `_beastComboT` | 31242 | 39176~39178 | — | `전체=9999` |
| `_beastRoarCd` | 31243 | 39188 | — | `전체=9999` |
| `_beastRoarT` | 31244 | 39176, 39187~39188 | — | `전체=9999` |
| `_serpentZigCd` | 31245 | 39202 | — | `전체=9999` |
| `_serpentZigT` | 31246 | 39200~39202 | — | `전체=9999` |
| `_predStealthCd` | 31247 | 39217 | — | `전체=9999` |
| `_predStealthT` | 31248 | 39215~39217 | — | `전체=9999` |
| `_predCorpseHeal` | 31249 | 39226, 39229 | — | `전체=0` |
| `_broodSpawnCd` | 31250 | 39240 | — | `전체=9999` |
| `_broodSpawnT` | 31251 | 39238~39240 | — | `전체=9999` |
| `_broodGasCd` | 31252 | 39249 | — | `전체=9999` |
| `_broodGasT` | 31253 | 39238, 39248~39249 | — | `전체=9999` |
| `_elderRoarCd` | 31254 | 39263 | — | `전체=9999` |
| `_elderRoarT` | 31255 | 39256, 39262~39263 | — | `전체=9999` |
| `_elderChargeCd` | 31256 | 39273 | — | `전체=9999` |
| `_elderChargeT` | 31257 | 39256, 39272~39273 | — | `전체=9999` |
| `_elderSlamCd` | 31258 | 39278 | — | `전체=9999` |
| `_elderSlamT` | 31259 | 39256, 39277~39278 | — | `전체=9999` |
| `_bossOrbitAng` | 31260 | 38332, 38335~38336 | — | `003=5.035891602447408; 004=3.4082970759966558; 005=4.441920172787503; 006=0.6656187174170255; 007=5.616520407304862; 008=4.5588813656049405; 010=1.3703698263638033; 011=3.980814836893715; 012=0.3406613623016939; 013=4.861084018929893` |
| `_bossStrafeCd` | 31261 | 38333~38334 | — | `전체=0` |
| `_wraithPhaseT` | 31263 | 39290~39292, 39296, 39303~39305 | — | `전체=9999` |
| `_wraithPhaseCd` | 31264 | 39305 | — | `전체=9999` |
| `_wraithPhasing` | 31265 | 39291~39292, 39295, 39305, 39310, 42154, 53983 | — | `전체=false` |
| `_dkGuardCd` | 31266 | 39325 | — | `전체=9999` |
| `_dkGuardT` | 31267 | 39319~39321, 39324~39325 | — | `전체=9999` |
| `_dkGuarding` | 31268 | 21594, 39320~39321, 39323, 39325, 42156, 53985 | — | `전체=false` |
| `_dkSlashCd` | 31269 | 39328 | — | `전체=9999` |
| `_dkSlashT` | 31270 | 39319, 39327~39328 | — | `전체=9999` |
| `_fmAbsorbCd` | 31271 | 39338, 39340~39341 | — | `전체=9999` |
| `_fmSpitCd` | 31272 | 39352 | — | `전체=9999` |
| `_fmSpitT` | 31273 | 39338, 39351~39352 | — | `전체=9999` |
| `_ddLungeCd` | 31274 | 39361 | — | `전체=9999` |
| `_ddLungeT` | 31275 | 39359~39361 | — | `전체=9999` |
| `_torChainCd` | 31276 | 39370 | — | `전체=9999` |
| `_torChainT` | 31277 | 39368~39370 | — | `전체=9999` |
| `_torBleed` | 31278 | 39373 | — | `전체=0` |
| `_wdSwoopCd` | 31279 | 39380 | — | `전체=9999` |
| `_wdSwoopT` | 31280 | 39378~39380 | — | `전체=9999` |
| `_wdSwoopOx` | 31280 | 39381 | — | `전체=0` |
| `_wdSwoopOy` | 31280 | 39381 | — | `전체=0` |
| `_pillarRingCd` | 31281 | 39396 | — | `전체=9999` |
| `_pillarRingT` | 31282 | 39393, 39395~39396 | — | `전체=9999` |
| `_pillarAoeCd` | 31283 | 39402 | — | `전체=9999` |
| `_pillarAoeT` | 31284 | 39393, 39401~39402 | — | `전체=9999` |
| `_stCloneCd` | 31285 | 39412 | — | `003=9999; 004=9999; 005=9999; 006=9999; 007=9999; 008=9999; 010=9999; 011=9999; 012=221.1318963347003; 013=9999` |
| `_stCloneT` | 31286 | 39409, 39411~39412 | — | `003=9999; 004=9999; 005=9999; 006=9999; 007=9999; 008=9999; 010=9999; 011=9999; 012=82.6070635765791; 013=9999` |
| `_stTpCd` | 31287 | 39409, 39421, 39423, 39427 | — | `003=9999; 004=9999; 005=9999; 006=9999; 007=9999; 008=9999; 010=9999; 011=9999; 012=131.94252423010767; 013=9999` |
| `_hpHealCd` | 31288 | 39435 | — | `전체=9999` |
| `_hpHealT` | 31289 | 39432, 39434~39435 | — | `전체=9999` |
| `_hpBuffCd` | 31290 | 39432, 39444~39445 | — | `전체=9999` |
| `_hpProjCd` | 31291 | 39432, 39455~39456 | — | `전체=9999` |
| `_adPhase` | 31292 | 39470~39471, 39479 | — | `전체=-1` |
| `_adFireCd` | 31293 | 39477 | — | `전체=9999` |
| `_adFireT` | 31294 | 39468, 39476~39477 | — | `전체=9999` |
| `_adSummonCd` | 31295 | 39468, 39482~39483 | — | `전체=9999` |
| `_adChargeCd` | 31296 | 39468, 39492~39493 | — | `전체=9999` |
| `_adSlamCd` | 31297 | 39499 | — | `전체=9999` |
| `_adSlamT` | 31298 | 39468, 39498~39499 | — | `전체=9999` |
| `_erraticT` | 31300 | 39511~39512 | — | `전체=9999` |
| `_erraticAng` | 31300 | 39512, 39514 | — | `003=2.8504408395480825; 004=2.345679481228587; 005=0.614126815681206; 006=1.2809111876867096; 007=0.7310811371724254; 008=0.9468583017974412; 010=0.14049508720145884; 011=1.7560967311976612; 012=6.218286109421786; 013=5.569061835081977` |
| `_amalgCleave` | 31301 | — | — | `전체=false` |
| `_amalgSplit` | 31301 | 42827 | 42831 | `전체=false` |
| `_tongueCd` | 31302 | 39533 | — | `전체=9999` |
| `_tongueT` | 31302 | 39526~39527, 39533 | — | `전체=9999` |
| `_gazeCd` | 31303 | 39542 | — | `전체=9999` |
| `_gazeT` | 31303 | 39540~39542, 53871 | — | `전체=9999` |
| `_gazeAng` | 31303 | 39544, 53872 | — | `전체=0` |
| `_hangCd` | 31304 | 39567 | — | `전체=9999` |
| `_hangT` | 31304 | 39566~39567 | — | `전체=9999` |
| `_hanging` | 31304 | 21256, 39558, 39563, 39567, 53875 | — | `전체=false` |
| `_boneChargeCd` | 31305 | 39575 | — | `전체=9999` |
| `_boneChargeT` | 31305 | 39572~39573, 39575 | — | `전체=9999` |
| `_boneDeath` | 31305 | 42837 | — | `전체=false` |
| `_bloodCd` | 31306 | 39582 | — | `전체=9999` |
| `_bloodT` | 31306 | 39580~39582 | — | `전체=9999` |
| `_curled` | 31307 | 21320, 39589, 39592, 39599, 42158, 53882, 53984 | — | `전체=false` |
| `_curlTimer` | 31307 | 39590~39591, 39599 | — | `전체=0` |
| `_mirrorBuf` | 31308 | 39605~39608, 53886, 53888~53889 | — | `전체=null` |
| `_mirrorDelay` | 31308 | 39607 | — | `전체=60` |
| `_overlordPhase` | 31309 | 39622~39623 | — | `전체=-1` |
| `_overlordCd` | 31309 | 39620~39621, 39644 | — | `전체=9999` |
| `_lavaBurn` | 31311 | 31115 | — | `전체=0` |
| `_lavaPoolDeath` | 31312 | 42860 | — | `전체=false` |
| `_volcBombCd` | 31313 | 39655~39657 | — | `전체=9999` |
| `_volcBombT` | 31313 | — | — | `전체=9999` |
| `_fireBatSuicide` | 31314 | 39674 | — | `전체=false` |
| `_fireBatSwoopCd` | 31315 | 39669~39670, 39672 | — | `전체=9999` |
| `_fireBatSwoopT` | 31315 | — | — | `전체=9999` |
| `_fireBatSwoopOx` | 31315 | — | — | `전체=0` |
| `_fireBatSwoopOy` | 31315 | — | — | `전체=0` |
| `_obsGuardCd` | 31316 | 39684, 39686~39687 | — | `전체=9999` |
| `_obsGuardT` | 31316 | 39685, 39687, 39689 | — | `전체=0` |
| `_obsGuarding` | 31316 | 22069, 39686~39687, 39689~39690, 42177 | — | `전체=false` |
| `_fsBurrowCd` | 31317 | 39701, 39703, 39711 | — | `전체=9999` |
| `_fsBurrowT` | 31317 | 39704, 39707, 39710 | — | `전체=0` |
| `_fsBurrowed` | 31317 | 22105, 39703~39704, 39706, 39711 | — | `전체=false` |
| `_fsGrabT` | 31317 | 39702, 39713 | — | `전체=0` |
| `_ashSwarmGrab` | 31318 | 39720 | — | `전체=false` |
| `_lavaGiantSlamCd` | 31319 | 39725~39727 | — | `전체=9999` |
| `_lavaGiantSlamT` | 31319 | — | — | `전체=9999` |
| `_flPriestRevCd` | 31320 | 39740, 39742, 39748 | — | `전체=9999` |
| `_flPriestRevT` | 31320 | — | — | `전체=9999` |
| `_flPriestBuffCd` | 31320 | 39741, 39752, 39761 | — | `전체=9999` |
| `_dragonPhase` | 31321 | 22239, 39770~39771, 39773, 39775, 39782, 39800 | — | `전체=-1` |
| `_dragonBreathCd` | 31322 | 39767, 39772~39773 | — | `전체=9999` |
| `_dragonBreathT` | 31322 | — | — | `전체=0` |
| `_dragonFlyCd` | 31323 | 39768, 39782, 39790 | — | `전체=9999` |
| `_dragonFlyT` | 31323 | 39783, 39786, 39789 | — | `전체=0` |
| `_dragonFlying` | 31323 | 39782~39783, 39785, 39790 | — | `전체=false` |
| `_dragonMeteorCd` | 31324 | 39769, 39800~39801 | — | `전체=9999` |
| `_seaGrabT` | 31326 | — | — | `전체=0` |
| `_seaGrabCd` | 31326 | 39813, 39815~39816, 39882~39884 | — | `전체=9999` |
| `_seaSpitCd` | 31327 | 39813, 39820~39821 | — | `전체=9999` |
| `_anglerLure` | 31328 | — | — | `전체=false` |
| `_anglerCharging` | 31328 | 39829, 39831, 39834, 39838 | — | `전체=false` |
| `_anglerLureCd` | 31328 | 39828~39829, 39831 | — | `전체=9999` |
| `_jellyParaCd` | 31329 | 39844, 39846~39847 | — | `전체=9999` |
| `_jellyZapCd` | 31329 | 39844, 39851~39852 | — | `전체=9999` |
| `_crabGuard` | 31330 | 39863~39864, 39867~39868, 39875, 42175, 53860 | — | `전체=false` |
| `_crabGuardT` | 31330 | 39861, 39864, 39867 | — | `전체=0` |
| `_crabGuardCd` | 31330 | 39860, 39863~39864 | — | `전체=9999` |
| `_crabSlamCd` | 31330 | 39860, 39875~39876 | — | `전체=9999` |
| `_eelBurrowed` | 31331 | 39891~39892, 39894, 39898, 53861 | — | `전체=false` |
| `_eelBurrowCd` | 31331 | 39890~39891, 39898 | — | `전체=9999` |
| `_eelBurrowT` | 31331 | 39892, 39895, 39897 | — | `전체=0` |
| `_eelGrabT` | 31331 | 39890, 39900, 39906 | — | `전체=0` |
| `_coralSpikeCd` | 31332 | 39913, 39915~39916 | — | `전체=9999` |
| `_coralProjCd` | 31332 | 39913, 39922~39923 | — | `전체=9999` |
| `_sirenSongCd` | 31333 | 39930, 39932~39933 | — | `전체=9999` |
| `_sirenDashCd` | 31333 | 39930, 39938, 39940 | — | `전체=9999` |
| `_sirenFlee` | 31333 | 39941, 39944, 39947 | — | `전체=false` |
| `_levChargeCd` | 31334 | 39952, 39954, 39956 | — | `전체=9999` |
| `_levTailCd` | 31334 | 39952, 39959~39960 | — | `전체=9999` |
| `_levParaCd` | 31334 | 39952, 39968~39969 | — | `전체=9999` |
| `_abyssPhase` | 31335 | 39979~39981 | — | `전체=-1` |
| `_abyssTentCd` | 31335 | 39976, 39983~39984 | — | `전체=9999` |
| `_abyssTridCd` | 31335 | 39976, 39994~39995 | — | `전체=9999` |
| `_abyssWhirlCd` | 31335 | 39977, 40000~40001 | — | `전체=9999` |
| `_abyssSumCd` | 31335 | 39977, 40008~40009 | — | `전체=9999` |
| `_abyssTideCd` | 31335 | 39977, 40017~40018 | — | `전체=9999` |
| `_ppRushCd` | 31337 | 40027, 40029, 40031 | — | `전체=9999` |
| `_ppSelfDestT` | 31337 | — | — | `전체=0` |
| `_tePullCd` | 31338 | 40042~40044 | — | `전체=9999` |
| `_teGrindT` | 31338 | — | — | `전체=0` |
| `_bpDrainCd` | 31339 | 40060~40062 | — | `전체=9999` |
| `_bpHealPool` | 31339 | 40064, 40066, 40070~40071 | — | `전체=0` |
| `_scPierce` | 31340 | — | — | `전체=false` |
| `_psCreamCd` | 31341 | 40088~40090 | — | `전체=9999` |
| `_psGrabCd` | 31341 | 40088, 40096~40097 | — | `전체=9999` |
| `_psSpawnCd` | 31341 | 40088, 40101~40102 | — | `전체=9999` |
| `_dkComboCd` | 31342 | 40112~40114 | — | `전체=9999` |
| `_dkDodgeCd` | 31342 | 40112, 40119, 40123 | — | `전체=9999` |
| `_dkParryCd` | 31342 | 40112, 40125, 40131 | — | `전체=9999` |
| `_iaElSwap` | 31343 | 22516, 40141~40142 | — | `전체=0` |
| `_iaSpearCd` | 31343 | 40140, 40144~40145 | — | `전체=9999` |
| `_iaBurstCd` | 31343 | 40140, 40150~40151 | — | `전체=9999` |
| `_dgCopied` | 31344 | 40158~40159 | — | `전체=false` |
| `_dgRevived` | 31344 | 42507~42508 | — | `전체=false` |
| `_jdScaleCd` | 31345 | 40172~40174 | — | `전체=9999` |
| `_jdPillarCd` | 31345 | 40172, 40184~40185 | — | `전체=9999` |
| `_jdExecCd` | 31345 | 40172, 40189~40190 | — | `전체=9999` |
| `_kaPhase` | 31346 | 22587, 40199~40200, 40203 | — | `전체=-1` |
| `_kaSwordCd` | 31346 | 40197, 40204~40205 | — | `전체=9999` |
| `_kaTentCd` | 31346 | 40197, 40214~40215 | — | `전체=9999` |
| `_kaFlyCd` | 31346 | 40198, 40220, 40226 | — | `전체=9999` |
| `_kaBeamCd` | 31346 | 40198, 40232~40233 | — | `전체=9999` |
| `_kaSumCd` | 31346 | 40198, 40238~40239 | — | `전체=9999` |
| `_kaFlyT` | 31346 | 40220, 40222, 40225 | — | `전체=0` |
| `_kaFlying` | 31346 | 40220~40221, 40226 | — | `전체=false` |
| `_isRare` | 31348 | 40251, 42963, 53896 | — | `전체=false` |
| `_rkCombo` | 31349 | 40258, 41378~41379, 41381 | — | `전체=0` |
| `_rkComboCd` | 31349 | 40254, 40257~40258 | — | `전체=0` |
| `_rkParryCd` | 31349 | — | — | `전체=0` |
| `_rkDodgeCd` | 31349 | 40255, 40261, 40264 | — | `전체=0` |
| `_tmFleeing` | 31350 | 40269~40270 | — | `전체=false` |
| `_tmHitCnt` | 31350 | 40277~40278, 42147 | — | `전체=0` |
| `_tmCounterCd` | 31350 | 40277~40278, 40281 | — | `전체=0` |
| `_mrAbsorb` | 31351 | 42140~42143, 53904 | — | `전체=0` |
| `_mrAbsorbMax` | 31351 | 42140~42141, 53904 | — | `전체=0` |
| `_mcShopUsed` | 31352 | 40291, 40297 | — | `전체=false` |
| `_mcFleeing` | 31352 | 40286~40287, 42149~42150 | — | `전체=false` |
| `_cpPhase` | 31353 | 21846, 40317~40318, 53906 | — | `전체=0` |
| `_tsTpCd` | 31354 | 40326, 40342, 40345 | — | `전체=9999` |
| `_tsSlowT` | 31354 | 40342, 40351 | — | `전체=0` |
| `_tsRewindHp` | 31354 | 40328, 40353~40354 | — | `전체=[]` |
| `_tsRewindUsed` | 31354 | 40328, 40353~40354 | — | `전체=false` |
| `_grGold` | 31355 | 40364~40365, 43010 | — | `전체=0` |
| `_grGrowth` | 31355 | 21882, 40365~40367 | — | `전체=1` |
| `_grAbsorbCd` | 31355 | 40360, 40362, 40368 | — | `전체=0` |
| `_twPhase` | 31356 | 21896, 40374~40376 | — | `전체=null` |
| `_twRotT` | 31356 | 40373~40374 | — | `전체=0` |
| `_twReviveT` | 31356 | 40382~40385 | — | `전체=0` |
| `_twDead` | 31356 | 40372 | — | `전체=false` |
| `_drTpCd` | 31357 | 40395, 40399, 40401, 40405 | — | `전체=9999` |
| `_drRiftCd` | 31357 | 40395, 40408, 40410 | — | `전체=9999` |
| `_drSumCd` | 31357 | 40395, 40413, 40416 | — | `전체=9999` |
| `_deathT` | 31358 | 40421, 40423, 53919 | — | `전체=0` |
| `_deathSent` | 31358 | 40432~40433, 40435~40436, 40440, 53921 | — | `전체=0` |
| `_deathScCd` | 31358 | 40425~40426, 40429 | — | `전체=9999` |
| `_spawnT` | 31359 | 5249, 17074, 17172, 34446, 34524, 42584, 52882 | — | `전체=20` |
| `_mobCh` | — | 5252, 5257, 5317, 20200~20201, 20209, 20219~20220, 20244~20245, 23296, 23306, 23375, 25019, 25152 | — | `전체=1` |
| `_mob8Col` | — | 5253, 5255, 5263~5264, 5267, 20206, 20227, 20230, 20233, 20237, 20240, 23300, 23315, 23381, 25022, 25024, 25080, 25082, 25153, 25312, 25314, 25369, 25371, 52772, 52774, 52781, 52784, 52786, 52853, 52856, 52865, 52868, 52870, 53642, 53645, 53659, 53663, 53665, 62295 | — | `003=7; 004=6; 005=6; 006=7; 007=2; 008=3; 010=5; 011=7; 012=6; 013=5` |
| `_mob8Row` | — | 5255, 5263~5264, 5267, 20206, 20230, 20233, 20237, 23301, 23315, 23381, 25024, 25082, 25153, 25314, 25371, 52774, 52781, 52784, 52786, 52856, 52865, 52868, 52870, 53646, 53659, 53663, 53665, 62295 | — | `전체=0` |
| `_mob8dir` | — | 5252, 5317, 20204, 20219, 23302, 23312, 23375, 23378 | — | `전체=true` |
| `_mobSkinPending` | — | 20200, 20207, 23303, 23316, 23327 | — | `전체=false` |
| `_isGateGuard` | — | 42737, 54010 | 31625 | `003=true; 004=누락; 005=누락; 006=누락; 007=누락; 008=누락; 010=누락; 011=누락; 012=누락; 013=누락` |

## 부록 C. 주요계약명 전체 literal행·검색근거

식별자경계 정규표현식으로 주석포함 game.html 전체65,692행/index.html 전체4,742행을 검색했다. 레코드ID는Godot추출식별자이며 원JS함수명이아니다.

| 식별자 | game.html 전체 일치행 | index.html 전체 일치행 |
|---|---|---|
| `EL` | 4672, 4677, 8796, 8798, 14333, 14344, 15877, 15953, 16025, 16156, 16170, 16549, 16598, 16680~16686, 16724, 16916, 16920, 16936, 16956, 16965, 16968, 17158, 17382, 18729, 20051~20054, 20105, 20107~20108, 20129, 20132, 20135, 20138, 20141, 23022, 23932, 23943, 24318, 28817, 28852, 28978, 28980, 30985, 31019, 31021, 31102, 31110, 31523, 32028, 32283, 32345, 32354, 32425, 32473, 32505, 32624, 32670, 32867, 32900, 33187, 33272, 33279, 33479, 33595, 33631, 33644, 33793, 34037, 34040, 34046, 34140, 34293, 34775, 34903, 34911, 34916, 35076, 35081, 35089, 35308, 35379, 35389, 35442, 35598, 35757, 35921, 36077, 36095, 36130, 36178, 36245, 36291, 36352, 36359, 36423, 36430~36431, 36435, 36443~36444, 36468, 36506~36507, 36528, 36539, 36547, 36597~36598, 36615, 36626, 36740, 36836, 36846, 36862, 36872, 36887, 36896, 36956, 36962, 36998, 37071, 37097, 37117, 37121~37122, 37172, 37319, 37329, 37364, 37441, 37446, 37450, 37454, 37458, 37462, 37468, 37475, 37479, 37483, 37513, 37839, 37973, 38368, 38553, 38747, 38759, 38767, 38806, 38819, 38995, 39081, 39090, 39104, 39131, 39160~39161, 39170, 39244, 39250, 39282, 39353~39354, 39397~39398, 39403~39404, 39414, 39457~39458, 39478~39479, 39487, 39503, 39659, 39778, 39804, 39822~39823, 39918, 39924~39925, 39970~39971, 39996~39997, 40019~40020, 40063~40064, 40142, 40148, 40153, 40186~40187, 40191~40192, 40217~40218, 40227, 40235~40236, 40303, 40378~40379, 40409, 40513, 40515, 40535, 40567, 40656, 40660, 40771, 40788, 40805, 40898, 41199, 41221, 41609, 41685, 42199, 42438, 42444, 42466, 42682, 42692, 42700, 42806, 42819, 42839, 42853, 42862, 42875, 42901, 42908, 42921, 42927, 42933, 42940, 42946, 42948~42949, 42951~42952, 42954~42955, 42957~42958, 42973, 42983, 42996, 43004, 43028, 43035, 43241, 44864, 44957, 45058~45059, 45129, 45138, 45155, 45176, 45204, 45211, 45239, 45248, 45266~45267, 45288, 45305, 45379, 45402~45403, 45517, 45620, 45883, 45927, 46150, 46175, 46282, 46300, 46519, 46782, 46791, 46919, 46953, 50233, 51168, 54075, 54172, 54189, 54191, 54234, 54267, 54282, 54299, 60360, 60977, 61011, 61013, 61015, 61025~61026, 61095, 61102, 61217, 61344, 61502, 61634, 61712, 61988, 62180, 62182~62184, 62289, 62402, 63428, 63987, 63989~63991, 64123, 64125~64127, 64803~64812 | — |
| `ELC` | 8798, 14338, 17381, 19956, 20055, 20105, 20119, 20144, 20147, 20267, 22753, 23699, 23718, 23800, 24269, 24275, 24390, 24534, 24715, 24831, 25427, 25430, 25447, 31163, 32435, 33502, 33833, 33989, 34236, 34246, 34285, 34324, 34828, 34832, 34892, 35036, 35125, 35216, 35255, 35472, 35531, 35954, 37059, 37067, 37630, 37782, 37786, 37788, 37841, 37875, 37886, 37946, 37961, 38115, 38572, 38819, 40514, 41238, 42333, 45908, 46556, 48564, 49803, 49920, 50233, 50304, 50306, 51354, 52901, 52906, 54054, 54075, 54089, 54096, 54219, 54274, 54277, 54289, 54292, 54299, 54733, 55485, 55530, 57737, 57821, 57874, 58352, 58444, 58949, 58964, 59065, 59104, 59123, 60207, 60210, 60234, 60346~60351, 60357~60358, 60361, 60363~60364, 60748, 60795, 60823, 60979, 61025, 61095 | — |
| `ETYPE_ERES` | 14334, 14336, 31185 | — |
| `ETYPE_HP` | 30823, 31136 | — |
| `ETYPE_ATK` | 30837, 31136 | — |
| `_ETYPE_SPD_RAW` | 30847, 30858 | — |
| `ETYPE_SPD` | 30858, 31137 | — |
| `ETYPE_R` | 5285, 24377, 24461, 30859, 31139 | — |
| `ETYPE_RANGE` | 20126, 30870, 34469, 34486, 38688, 40510 | — |
| `ETYPE_POISE` | 30887, 31140 | — |
| `ETYPE_SHIELD` | 30898, 30900 | — |
| `ETYPE_COL` | 24380, 24464, 30909, 31163 | — |
| `RARE_ETYPE` | 30955, 31135, 40366, 42964, 53897 | — |
| `isRareEtype` | 30967, 31132, 31135, 42747 | — |
| `HELL_SPAWN` | 30969, 30986, 30996, 31002, 31062 | — |
| `HELL_EL` | 30985, 31019 | — |
| `_RANGED_ET` | 30991, 30996, 31007, 31013 | — |
| `_CH1_OPENING_EXCLUDED_ET` | 30992, 30996, 31121 | — |
| `ELITE_TIERS` | 31033, 31072, 31134, 43064, 43078, 43111, 53574, 53977, 54004, 54016, 54019 | — |
| `ELITE_PROB` | 31041, 31064 | — |
| `MOD_DEFS` | 31045, 31073, 31089, 38866 | — |
| `AURA_DEFS` | 31083, 31088, 31093 | — |
| `rollEtype` | 30993, 31062, 31424, 31471, 31497, 31512, 31601, 31635, 31647, 35675, 40414 | — |
| `rollEl` | 31017, 31418, 31476, 31497, 31512, 31601, 31647, 40415, 64753 | — |
| `rollElite` | 31063, 31132 | — |
| `rollMods` | 31071, 31133 | — |
| `rollAura` | 31090, 31166 | — |
| `_enemyHpPacing` | 31119, 31143, 31147 | — |
| `mkEn` | 30184, 30782, 31120, 31375, 31384, 31431, 31437, 31443, 31450, 31476, 31497, 31512, 31523, 31601, 31620, 31635, 31647, 32133, 35675, 35707, 38780, 38796, 38845, 39040, 39244, 39414, 39487, 39630, 40012, 40105, 40244, 40415, 40789, 40807, 42611, 42795, 42830, 43052, 62289, 63428, 64753 | — |
| `_assignMobSkin` | 23294, 31361 | — |
| `_spawnCh1StartMediumEyeMasses` | 31519, 31608 | — |
| `_noProjEtypes` | 31154, 31156, 40505 | — |
| `updateE` | 3323, 34477, 34480, 34483, 34486, 38584 | — |
| `eModHitP` | 20020, 31098, 40535, 40545, 40768 | — |
| `teleportE` | 20006, 38786, 38925, 39421, 40399, 53183 | — |
| `_beanRoll` | 20049, 20118~20119 | — |
| `_eMouthXY` | 20057, 20118~20119, 41236, 42600 | — |
| `eProjAt` | 20119, 38787, 38806, 38927, 39104, 39131, 39160~39161, 39282~39283, 39306, 39354, 39398, 39404, 39458, 39479, 39503~39504, 39584, 39635, 39854, 39925, 39971, 40020, 40153, 40167, 40218, 40227, 40236, 40341, 40379, 42901, 42908, 42927, 42933, 42940 | — |
| `_emitEnemyShot` | 16944, 20065, 20118~20119, 61102 | — |
| `_tickEnemyShotWarnings` | 20079, 34647 | — |
| `_fireChargedProj` | 20122, 20155 | — |
| `_tickProjCharge` | 20152, 38878, 40512 | — |
| `_spawnBossProjectile` | 16940, 17157, 37095, 37779, 37802, 38221, 38297, 38368, 38995, 39021, 39081, 39090, 39170, 39250, 39544, 39659, 39778, 39804, 39823, 39918, 39997, 40064, 40148, 40187, 40192, 40409, 40567, 40656, 40660, 40878, 40898, 41179, 41199, 41221, 41238, 42142, 42600, 42806, 42819, 42839, 42853, 42862, 42875, 42921, 42949, 42952, 42955, 42958 | — |
| `spawnProj` | 16945, 16947, 20068, 20089, 20129, 20132, 20135, 20138, 20141, 20144, 20147, 37057, 37061, 46895, 61026, 61217, 61502, 61712, 64837, 64884 | — |
| `_projectileParryClass` | 16911, 16925, 16930, 16932~16933, 16956, 16958, 17007, 17041, 17259, 20070, 20100, 33379, 33438, 33814, 34745, 34880, 54074, 54218, 54242 | — |
| `_saveZoneState` | 30150, 30162 | — |
| `_loadZone` | 30159, 41863 | — |
| `_gateGuard` | 31612, 31627, 31653, 42743, 60713~60714 | — |
| `_gateGuardKilled` | 31569, 41884, 41908, 42743, 60725 | — |
| `_isGateGuard` | 31625, 42737, 54010 | — |
| `_iceOnHit` | 31113, 31219 | — |
| `_iceFreeze` | 31223 | — |
| `_iceSlimeCd` | 31228, 39082 | — |
| `_iceSlimeT` | 31229, 39079~39080, 39082 | — |
| `_iceSlamCd` | 31230, 39119, 39128 | — |
| `_iceSlamT` | 31231, 39117~39119, 39126~39128 | — |
| `_stCloneCd` | 31285, 39412 | — |
| `_stCloneT` | 31286, 39409, 39411~39412 | — |
| `_stTpCd` | 31287, 39409, 39421, 39423, 39427 | — |
| `_tpWarnT` | 17074, 31194, 34523, 38786~38787, 38789, 38923~38925, 38932, 39419~39421, 39426, 40330~40332, 40342, 40348, 40397~40399, 40404, 42583 | — |
| `_tpWarnMax` | 31194, 38789, 38932, 39426, 40348, 40404 | — |
| `_tpWarnX` | 31194, 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — |
| `_tpWarnY` | 31194, 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — |
| `_tpWarnCol` | 31194, 38789, 38932, 39426, 40348, 40404 | — |
| `shieldBashCd` | 31188, 38917, 41621, 41697 | — |
| `shieldBashT` | 31189, 38915, 38917, 41621, 41697 | — |
| `shieldAng` | 24382, 24392, 24467, 24538, 31183, 38913~38914, 41619, 41695, 42168, 53769~53770, 53773, 53781~53782 | — |
| `summonCd` | 31190, 40794, 41621, 41697 | — |
| `summonT` | 31191, 38921, 38935, 38939, 40794, 41621, 41697 | — |
| `teleportCd` | 31192, 38925, 41621, 41697 | — |
| `teleportT` | 31193, 38921, 38925, 38929, 38933 | — |
| `iceZone` | 16861, 16876, 16917, 16963, 16968, 34655, 34667, 35063, 35074, 39081, 42806, 42958, 54075, 54085, 54170 | — |
| `atkTicketRequest` | 38577, 38888, 38917, 41401, 41403 | — |

## 부록 D. 문서검색·정적검증 기록

| 검사 | 결과·한계 |
|---|---|
| docs 전체 keyword 검색 | Markdown 전체에서 위 etype/장판/지원집계/이름 관련 검색, 일치 60문서/332행. 수정0. 아래는 경로별 일치행 |
| 원본·정본 | game/index SHA 및 frozen JSON SHA를 직접 계산, JSON SHA는 기존factory test oracle과 일치 |
| 분모 정적 | 16 records, 지원orders6/미지원10, 미지원etype집합6·7·20·21·25·29·47; union 338키, 세부수치는JSON직접투영 |
| 원본JS 발췌 실행 | Node에서 원본39078~39084/42804~42808/31098~31116을 그대로 함수로 감싸 12단정/실패0. idle 경계·spawn null 반환 뒤 순서·death 3발/12키·빈mods6체 조기반환 확인. 제품/Godot 실행이나 새 테스트 파일 작성이 아님 |
| 정적 자체검사 | 초기16/지원6/미10·etype집합·338키누락/중복0·17개표의열수·현재Godot참조경로·고정source hash·INDEX/WORK를 검사, 실패0. 경로표의후속제안파일은현존파일검사에서별도분리 |
| 검증수준 | 새제품/테스트작성0, Godot실행0. 이 문서생성·행색인·참조경로·집계검증은정적이며제품PASS가아님 |
| 추적문서범위 | 기준main에병합된기존TRACE는QUICKSLOT/SAVE/SETTINGS3종. 미병합타브랜치추적은그소유문서로남기고가져오지않음 |

| 문서 | 일치행 |
|---|---|
| `docs/13출시·마케팅/VIDEO_EDIT_PLAN_20261008.md` | 116 |
| `docs/16번역·로컬라이제이션/번역대상_전체목록.md` | 1574, 2049 |
| `docs/2_2 무기+활+속성시스템/2_2 무기+활+속성시스템.md` | 22, 34, 54, 62, 64, 66, 70, 89, 96 |
| `docs/4.0케릭터스프라이트 디자인/캐릭터_몬스터_보스_최적화디자인_v1.md` | 84 |
| `docs/4.1맵디자인+설정/CH1_1_PRODUCTION_FINISH_20260916.md` | 692, 760, 825, 889, 954, 1019 |
| `docs/5.0애니메이션파이프라인/5.0애니메이션파이프라인.md` | 189 |
| `docs/5.0애니메이션파이프라인/ENGINE_ATLAS_CLIP_RUNTIME_20261009.md` | 91 |
| `docs/5.0애니메이션파이프라인/ENGINE_SPRITE_CLIP_RESOURCE_20261009.md` | 112 |
| `docs/5.0애니메이션파이프라인/몬스터_스킨_시스템.md` | 12, 24, 45, 55, 57, 59, 63, 81, 88 |
| `docs/5.1임펙트디자인/DRUID_SHOCKRING24_ENGINE_20261010.md` | 5 |
| `docs/5.1임펙트디자인/FIREDEVIL_ORB24_ENGINE_20261010.md` | 28 |
| `docs/5.1임펙트디자인/VFX_구현가이드.md` | 100, 111, 134, 148, 150, 152, 156, 175, 182, 604~605 |
| `docs/8.0몬스터디자인/1장_썩은숲_보스_애니메이션_작업기준.md` | 47 |
| `docs/8.0몬스터디자인/code_etype20_29_얼음몹_애니메이션_공격모션_정리.md` | 1, 3, 5, 9, 31, 35, 46, 50, 63, 68, 74, 77 |
| `docs/8.0몬스터디자인/pixellab_몬스터_완성도리스트.md` | 41, 80, 84, 97~98 |
| `docs/8.0몬스터디자인/pixellab_종류분류.md` | 43, 280~281, 312~313 |
| `docs/8.0몬스터디자인/몬스터_공격시스템.md` | 14, 25, 48, 58, 60, 62, 66, 84, 91, 148, 320, 334, 342, 346, 372, 756, 758, 764~765, 774 |
| `docs/8.0몬스터디자인/몬스터_사운드설계.md` | 3, 159, 163, 196, 220, 233, 336, 342, 378, 385, 444, 458, 467, 471, 499 |
| `docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md` | 12, 24, 45, 57, 59, 61, 65, 83, 90 |
| `docs/8.0몬스터디자인/몬스터_총관리.md` | 25, 36, 41, 55, 57, 63, 65, 67, 71, 90, 97, 153, 387, 400, 406, 410, 430, 627, 660, 793, 822, 824, 870, 874, 963 |
| `docs/8.0몬스터디자인/탄막시스템_총정리.md` | 16, 27, 50, 58, 60, 62, 66, 85, 92, 225, 275~278, 280~281, 706, 786 |
| `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` | 265 |
| `docs/9적ai패턴디자인/9_적AI패턴디자인.md` | 14, 25, 45, 55, 57, 59, 63, 82, 89, 288~289, 309 |
| `docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md` | 59, 67, 222, 224 |
| `docs/CHANGELOG_SYNC.md` | 1858, 1860, 1880, 1924, 2003, 2058, 2073, 2084, 2105, 2115, 2117, 2119, 2123, 2137, 2144, 5448, 5594 |
| `docs/engine/FDG_BENCHMARK.md` | 50, 62, 81, 94, 96, 98, 102, 120, 127 |
| `docs/engine/FDG_ENGINE.md` | 476, 517, 751, 767, 769, 789, 833, 912, 967, 982, 994, 1018, 1031, 1033, 1035, 1039, 1053, 1060 |
| `docs/engine/FDG_FEATURE_INVENTORY_20261020.md` | 235~236, 249~250, 254, 258, 276 |
| `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md` | 483, 485, 505, 549, 628, 683, 698, 710, 729, 731, 737, 739, 741, 745, 763, 770 |
| `docs/engine/FDG_GODOT_ENCOUNTER_FACTORY_20261013.md` | 25, 37, 42, 56, 58, 64, 66, 68, 72, 88, 91, 98, 146, 219, 285, 317~318, 430~431, 524 |
| `docs/engine/FDG_GODOT_ETYPE1_LIGHTNING_HIVE_BLOATER_20261013.md` | 5, 11, 122 |
| `docs/engine/FDG_GODOT_ETYPE4_ICE_SOUL_FLAME_20261013.md` | 311 |
| `docs/engine/FDG_GODOT_ETYPE4_PHYSICAL_SPINE_BEAST_20261013.md` | 256 |
| `docs/engine/FDG_GODOT_ETYPE7_PHYSICAL_FLESH_CRAWLER_20261013.md` | 12, 17, 24, 41, 48, 50, 61, 66, 68, 76, 85, 208 |
| `docs/engine/FDG_GODOT_FLOATING_TEXT_BINDING_20261013.md` | 11, 126 |
| `docs/engine/FDG_GODOT_GROUND_SURFACE_BINDING_20261013.md` | 87 |
| `docs/engine/FDG_GODOT_M29_FIRST_20261013.md` | 12, 28 |
| `docs/engine/FDG_GODOT_M30_EPICENTER_20261013.md` | 12, 21, 37, 125, 132 |
| `docs/engine/FDG_GODOT_NATIVE_FIRST_20261013.md` | 437 |
| `docs/engine/FDG_GODOT_NATIVE_MAIN_INTRO_SHADOW_FIRST_20261014.md` | 34 |
| `docs/engine/FDG_GODOT_NUMBER_ATLAS_BINDING_20261014.md` | 87 |
| `docs/engine/FDG_GODOT_PORT_COMMON_CHARGE_WARNING_FIRST_20261013.md` | 12 |
| `docs/engine/FDG_GODOT_PORT_FLOATING_TEXT_FIRST_20261013.md` | 9 |
| `docs/engine/FDG_GODOT_PORT_NUMBER_ATLAS_FIRST_20261013.md` | 11 |
| `docs/engine/FDG_GODOT_PORT_SOURCE_POST_STAGE_OWNER_FIRST_20261014.md` | 42 |
| `docs/engine/FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md` | 91 |
| `docs/engine/FDG_GODOT_TYPE3_ACTOR_FIRST_20261013.md` | 12, 27 |
| `docs/engine/FDG_GODOT_TYPE3_BINDING_20261013.md` | 3, 13, 86 |
| `docs/engine/FDG_GODOT_TYPE3_SPAWN_FIRST_20261013.md` | 12, 19 |
| `docs/engine/FDG_GODOT_TYPE7_INTEGRATION_20261013.md` | 9, 32, 41, 73 |
| `docs/engine/FDG_GODOT_TYPE7_TELEPORT_20261013.md` | 12, 21, 46 |
| `docs/engine/FDG_INTEGRATION_INTERFACE.md` | 389, 391, 411, 455, 534, 589, 604, 616, 647, 664, 666, 668, 672, 691, 698 |
| `docs/engine/FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_CALLBACK_20261017.md` | 17, 29 |
| `docs/engine/FDG_NATIVE_NORMAL_ENEMY_PLAYER_VIEW_MAIN_SYNC_20261017.md` | 12 |
| `docs/engine/FDG_NATIVE_PERSPECTIVE_20261012.md` | 114 |
| `docs/engine/FDG_P1_002E_MELEE_HURTE_TRACE_20261019.md` | 56, 153 |
| `docs/engine/FDG_P2_001H_INTRO_CURTAIN_SEQUENCE_20261020.md` | 89 |
| `docs/engine/FDG_PC_MAC_GIT_SYNC_20261016.md` | 1043 |
| `docs/engine/FDG_RUINED_FOREST_PLAYABLE_20261012.md` | 147 |
| `docs/engine/FDG_RUNTIME.md` | 47 |
