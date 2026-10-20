# 2장 벌레굴 6에리어 적 — 원본 추적·이식 설계

작업 `trace-enemies-ch2` · 브랜치 `codex/trace-enemies-ch2-20261020` · **문서 검수 대기**. 제품 코드·테스트 작성/변경0, Godot 실행/import0. 아래 CH2E-*는 후속 배정용 순서안이다.

## 0. 기준·분모·소유 경계

| 항목 | 이번 확인 |
|---|---|
| 기준 | fetch 최신 `origin/main=e556b617190c325ca39f5add04357f5dea5ca87e`. 아래 game/index 행은 이 SHA의1-based. game.html 65,692행/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; index.html 4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 선행 CH1 | main [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §0–6·부록을 먼저 읽었다. 그 문서의 초기16/당시6지원은 과거 snapshot. 현재 `test_encounter_factory.gd:15–23`는 exact9개 order를 선언 |
| 정예 문서 | **origin/main에는 FDG_SOURCE_TRACE_ELITES_20261020.md 없음**. 원격 `codex/trace-elites-20261020` SHA `48681a1207f3f5864b6a04798b7f0d6b29588ef1`의 [ELITES 제출본](https://github.com/beearth/the-exoduser/blob/48681a1207f3f5864b6a04798b7f0d6b29588ef1/docs/engine/FDG_SOURCE_TRACE_ELITES_20261020.md) §0–5·부록을 읽고 참조만 했다. 미병합 문서를 main 문서로 승격/복사하지 않음 |
| 작업판 | main [WORK_BOARD](orders/WORK_BOARD.md)의 P2-008a/b는 **PC 담당**. a는 exact etype20 order4/10/12, b는 order11 etype47·order9 후보. 보드의 미검수·미병합 표현과 실제 main 지원을 구분. 이번 actor/factory/CH1 코드·보드 수정0 |
| 2장 맵 추적 | 착수 시 원격 미발견, **마감 조회에서18070adfaa99da8e31c5dfcc8264b5d9b0982107 확인**. [MAPS_CH2 제출본](https://github.com/beearth/the-exoduser/blob/18070adfaa99da8e31c5dfcc8264b5d9b0982107/docs/engine/FDG_SOURCE_TRACE_MAPS_CH2_20261020.md) §0–1.4·3.2·4·5를 읽었다. geometry/좌표/각에리어굴분모는그문서참조만,미공개WIP/타worktree접근0. 두문서모두같은main/gameSHA기준이며이쪽은적선택/행동caller만추적 |
| 분모 | 일반 풀 **31 etype=0..19+30..39+47**, room/tile 함수의 조건부 전역 네임드 후보90..99(현재RLE필드 자연출현확정0), 보스는 별도 `ib=true/etype0`. 소환 자식·정예 전파·균열은 생성 경로별로 구분. type47이 생성만 하고 등록하지 않는40은 별도 부수효과로 기록. 이 숫자는 실제 한 에리어에 모두 생성됐다는 실측/진행률이 아님 |
| 보호 | 공용6파일·다른 담당 파일·Q/E/blackBean Q전용 magic·세이브 형식·docs2_3 수정0. 어택 티켓 제한 추가금지. 1장과 같은 etype의 actor는 기존 CH1/PC 소유 의존이며 2장 이름으로 중복 구현하지 않음 |
| 범위·검수 | 로컬 원본/문서/Godot 정의의 정적 조사. 게임/서버/실창/PC 실행·Godot 테스트0. 아래 수치는 원본 literal/함수 추출 검산이며 자연 스폰·전투·시각 인수는 **미확인** |

R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`, 착수 tracked INDEX/WORK clean. 새 worktree는 `--no-checkout` 후 sparse `/AGENTS.md /godot/ /docs/ /engine/ /tools/ /.githooks/ /game.html /index.html /package.json`만 초기화했다. main push·force push·git add -A·R checkout/reset0. 제출은 이 문서+CHANGELOG_SYNC 상단 절2개뿐이다.

## 1. 원본 행 전수 추적

### 1.1 6에리어와 스폰 집합

원본 `game.html:16633–16712`: 2장=hell1/startSi4/stages6, STG.monLv는 모두200, theme/boss 기본 원소P. **실제 mkEn.monLv는 STG200 고정이 아니라 `max(1,(P.lv||1)+DIFF_LV_OFF[diff]+G._stageDiffOff)`**(`31125`). 현재 demo 기본 target은 `16645`, `43896` nextStage는 stage0에서 종료하므로 정상 demo를 통한2장 도달 실측은 없다. 개발 stage 진입과 정식 흐름은 별도다.

| 에리어 | si / hellFloor | 일반 선택·정예 규칙 | 보스 이름 / ib 기본원소 | 보스 허용 move 수 |
|---|---|---|---|---:|
| 2-1 | 4 / 0 | 아래31풀·HELL_EL[1]·ELITE_PROB[1] | 벌레 수호자 / P | 27 |
| 2-2 | 5 / 1 | 동일 | 점액 괴수 / P | 28 |
| 2-3 | 6 / 2 | 동일 | 기생충 모체 / P | 29 |
| 2-4 | 7 / 3 | 동일 | 거대 알주머니 / P | 30 |
| 2-5 | 8 / 4 | 동일 | 살벽의 군주 / P | 31 |
| 2-6 | 9 / 5 | 동일 | 여왕 구더기 / P, isHellBoss=true | 32 |

보스 이름은 `16689–16690`, 허용 move는 `9968–9975` 뒤 **10008–10010의 cageTrap 삭제**까지 적용한 수다. 맵 좌표·굴 분모는 MAPS_CH2 §1.2, 후보 문지기 tile은 §1.4 F04를 참조한다. 그 수치는 맵 담당의 고정 seed 발췌 VM 관측이며 이 작업의 독립 맵 재추출/실제 actor 생성은0, natural 실행은 **미확인**이다.

일반 가중치 literal은 `30972–30973` HELL_SPAWN[1]이며 합178. 아래 R은 **선택 분류**다. 행동의 원거리/근접 판단과 같은 집합이 아니다.

| etype | 가중치 | 선택 R 여부 / 기존 의존 |
|---|---:|---|
| 0 | 6 | CH1 crawler exact 기반 의존, CH2 admission은 별도 |
| 1 | 5 | R / CH1 hive exact 및 공통 탄 의존 |
| 2 | 10 | 공통 CH1 후속, 돌진 제거 원본 유지 |
| 3 | 15 | type3 생성/실행 부품 의존, 일반 CH2 소비 별도 |
| 4 | 5 | CH1 eye/spine exact 기반, 임의 원소/스킨 일반화 금지 |
| 5 | 8 | 공통 windup→탄, 자폭 복원 금지 |
| 6 | 4 | 방패/호위·CH1 후속 담당 |
| 7 | 7 | R / 기존 type7 조립·TP·type3 의존 |
| 8 | 3 | R / 공통 CH1 후속 |
| 9 | 2 | R / 부활·공통 CH1 후속 |
| 10 | 3 | 은신·공통 CH1 후속 |
| 11 | 6 | 소환·공통 CH1 후속 |
| 12 | 8 | 광폭·공통 CH1 후속 |
| 13 | 7 | R / web·공통 CH1 후속 |
| 14 | 4 | 비행·공통 CH1 후속 |
| 15 | 3 | 사망분열·공통 CH1 후속 |
| 16 | 6 | R / trap·공통 CH1 후속 |
| 17 | 3 | R / etype13 소환·공통 CH1 후속 |
| 18 | 2 | 공통 CH1 후속, 접촉 목록 포함 |
| 19 | 1 | slam·공통 CH1 후속 |
| 30 | 14 | CH2 전용 |
| 31 | 6 | **R 아님**, idle 후방 유지에는 포함 |
| 32 | 4 | CH2 전용 |
| 33 | 10 | CH2 전용 |
| 34 | 3 | R / CH2 전용 |
| 35 | 6 | CH2 전용 |
| 36 | 6 | CH2 전용 |
| 37 | 3 | CH2 전용 |
| 38 | 2 | R / CH2 전용 |
| 39 | 2 | CH2 전용·문지기와 일반 개체를 구분 |
| 47 | 14 | CH1 P2-008b 담당 의존, 중복 clone/TP actor 금지 |

`_RANGED_ET:30991`과 교집합은 `[1,7,8,9,13,16,17,34,38]`, 가중치38, 나머지140. `rollEtype:30993–31016`은 stage0 전용 분기와 달리 첫 U<.5이면 R풀에서 다음 U로 가중 선택한다. 아니면 **전체178 CDF에서 최대12번 재시도**하여 R이 아닌 것을 고르고 전부R이면 **etype2**로 반환한다. 단순한 전체풀 가중 선택이나 두 풀 무조건50:50 구현으로 바꾸지 않는다. 선택 RNG는2~13회이며 엄격 `<` 경계다. fallback 때문에 비R 분포에는 아주 작은 type2 추가 질량이 있다.

`rollEl:31017–31021`: 첫 U<.4면P, 아니면 다음 U×6 절삭으로 `[P,F,I,D,L,H]`. 독립 이상적 U 기준 P=.5, 나머지 각.1, E는 여기서0. themeP라고 물리만 나오지 않는다. **소환굴은 이 함수를 호출하지 않는다**(§1.2).

### 1.2 생성 caller·그룹·동적 소환 전수

| 원본 행 | 경로 | etype/원소/후처리·분모 경계 |
|---|---|---|
| 31366–31386 | spawnFormation | 쉴드6 1~2 + 원거리 `[1,7,8]` 2~3, 같은el. room 루프의 i>0/i%7==0/U<.15에서 대체 실행. 좌표 canMv 실패 슬롯은 감소 |
| 31389–31455 | spawnRoomEns | start/boss 방 제외, cnt=max(10,trunc((area+si×3+8)×DIFF_MOB)). rollEl→formation 분기→rollEtype→rare 교체→mkEn. etype33이면 본체 뒤 **추가4~7**(총5~8은 성공 시 명목값),97이면추가1. 이 부가 그룹을 모든33 생성에 적용하지 않음 |
| 31458–31480 | spawnTileRLEEns | 바닥 기반20~80+si 제한의 별도 함수가 존재. **현재 initStage:31575–31578은 tileRLE일 때 room/corridor 자동 생성을 호출하지 않음**. 이 함수 정의만 보고 현재6에리어 초기 스폰 수를 확정하지 않음 |
| 31482–31511 | corridor | 게이트 앞20~29, 복도3타일 셀55%에서2~4, rollEtype/rollEl. room 경로와 달리 별도rare 교체 없음 |
| 31580–31607 | init 후처리 | 시작점500px 안전반경 제거, 벽 끼임 safePt/실패제거, non-tileRLE 최소80 채움. 이 채움도 rollEtype/rollEl이며 room 부가33 그룹/rare 교체가 없음 |
| 31612–31645 이후 | gate39 | hell1 문지기etype39/P/ib=false. mkEn 뒤 HP×4·ATK×2·r×1.4 절삭·poise/max80·elite3/dropTier3·_isGateGuard. mods/aura/eShield 재추첨/재계산 없음. 동반4~6은 rollEtype/P 후 elite1·HP×2.5만, 외곽8~12는 일반풀. 정예 후대입을 자연 tier3 생성으로 합치지 않음 |
| 31029–31030,35587–35693 | 소환굴 | S50/M100/L100, si4..9는 CH1 si0의 중첩축소 제외. 시작120frame 차단→거리<2000 trigger→다음 갱신90tick 전조→총량초기화/`trunc(900/total)` 간격→생존700이면30대기→1개씩. 좌표30회+나선/중심 fallback. **mkEn(...,rollEtype(si),false,undefined,h.room)**, 실패도_spawned 증가. reviveIframes15, 간격curve 보정. rare 교체/33 부가그룹 없음. 각 에리어의 배치수/분모는 MAPS_CH2 §1.2 참조 |
| 35704–35716 | kill-chain 균열 | hell1 풀 `[0,2,4,6]`, mkEn에el 미지정. 후대입 elite2, HP×(2+si×.05), ATK×1.5, speed min(×1.2,1.5), r min(×1.15,24). 기존mods/aura와 후대입 등급을 구분 |
| 38920–38940,40777–40798 | type7/eSummon | 기존 CH1 type7·type3 조립 의존. type11도 eSummon 진입35tick, 주변200 query<6/실패60 재시도(`38973–38983`). source eSummon의 자식 생성/RNG/후처리를 공유하되 현재 exact actor admission 범위 별도 |
| 39031–39048 | type17 | 주변200 query<8이면 **etype13 2~3**, 동일el·room, canMv6 검사. 실패 시motherT60. type3로 대체 금지 |
| 39237–39252 | type38 | §1.4. 33 2~3개 단일 batch이며 room caller의 추가4~7 재호출 없음 |
| 38778–38781,43050–43054 | M06/M08 | type3 각각2개. mkEn 먼저 수행 후 HP/elite/mods/shield 등 caller별 후처리. ELITES 추적의 원 RNG/부수효과 순서 재사용 |
| 39408–39428,38793–38797 | type47/M16 | **47은etype40을mkEn으로만든뒤 HP30%/shield0/atk50%를쓰지만ens.push가없음**. 생성/RNG부수효과와실제등록을구분한다. M16은동일etype복제·등록. clone/TP경계는CH1/ELITES소유이며P2-008b를중복구현하지않음 |
| 42790–42801 | type15 사망 | 동일etype15 2개, HP35%·shield0·r max5/parent×.6·speed×1.3·_splitDone=true. 소환 시점 mkEn 값과 후대입을 구분 |
| 40412–40417 | rare98 | rollEtype(stage) 1개+rollEl(stage), total ens.length<200. 해당caller만의 동적 일반풀 소환, rare 재교체 없음 |
| 40798–40816 | bossSummon | count3+trunc(stage×.5), type `[0,2,3,3,3]`/6원소 U선택, mkEn 뒤 HP50%·shield0. 2장 일반 pool33 산란과 별도 |

`mkEn:31120–31364`는 invalid좌표/null·canMv/safePt admission→레벨→elite/mods→spd/r→literal/aura→_assignMobSkin 순서다. 호출부가 null을 검사하는지까지 부록 생성 census에 보존했다. type38의room 인자는 **e._ri**(`39244`)이며 constructor의room을 임의로 대신 넣지 않는다. 추가 capacity 검사·alive 필터·전역 batch 원자화도 원본 없이 추가하지 않는다.

**현재 RLE 경로의 한계:** MAPS_CH2 §1.1–1.4는 기본 selector의6맵 모두RLE임을 추적했다. 따라서 위 room/corridor/최소80/별도 spawnTileRLEEns 함수를 모두 현재 실행됐다고 합산하지 않는다. 소환굴은31풀에서직접선택하고rare교체를하지않으므로, room/tileRLE 함수에 있는 네임드90..99는 **조건부 전역 후보**이며 이6맵 자연필드 출현으로확정하지않는다. 같은 제출본 F04의 문지기 후보는 si4 tile0, si5..9 tile4여서 후자는 생성조건(tile===0) 거절이다. 이는 맵 담당의 발췌 VM 관측이며 여기서는 실제 mkEn을 실행하지 않았다. 여기서설명한39문지기규칙은조건부이며6맵전부문지기가살아있다는뜻이아니다. 맵 tile/게이트를 바꾸어 생성시키지 않는다.

**el=undefined 보존:** mkEn의 el 저장은 `31163` 그대로이며 rollEl로 대체하지 않는다. e.el 비교 기반 charge 표시와 실제 탄 `_projectileParryClass:16911–16920`의 `(p.el??P)` fallback은 별도다. hole actor의속성을P로 새로 지정하거나 표시의magic 힌트를 최종 탄 분류로 고정하면 다르다. 실제 소비/표시 전체 일치는 **미확인**.

### 1.3 기본 수치·constructor 상태

아래 HP/ATK/poise/shield/r는 **카탈로그 literal**이다(`30823–30920`). 실제 생성 HP/ATK를 이 값으로 대입하지 않는다. raw speed→`max(.2,raw×1.3)`(`30858`)→생성 `(mapped+U×.08)×1.5`→M02×1.5. 실제 r=`(catalogR+U×2)×2×tier.scaleMul`. 생성 poise/maxPoise 및eShield/eShieldMax는 모두 **생성HP**(`31164,31184`), poise catalog/ETYPE_SHIELD는 이 생성 대입을 대체하지 않는다.

| etype / 이름 | catalog HP/ATK | raw→mapped SPD | catalog r/poise/shield% | range | 색 |
|---|---|---|---|---:|---|
| 30 사냥개 사도 | 22/14 | .6→.78 | 10/10/0 | 400 | #884422 |
| 31 가시 사도II | 32/16 | .3→.39 | 10/12/0 | 600 | #aa5533 |
| 32 거암 사도 | 96/18 | .12→.2 | 15/40/60 | 400 | #776655 |
| 33 소형 요마 떼 | 6/4 | .54→.702 | **10**/3/0 | 200 | #dd6644 |
| 34 부식 사도 | 16/6 | .36→.468 | 10/8/0 | 600 | #556633 |
| 35 수인 사도 | 48/18 | .39→.507 | 12/20/0 | 400 | #993311 |
| 36 사행 사도 | 38/12 | .45→.585 | 10/12/0 | 400 | #447733 |
| 37 포식 사도 | 58/22 | .6→.78 | 15/25/0 | 600 | #553322 |
| 38 산란 사도 | 112/6 | .09→.2 | 20/50/0 | 800 | #774433 |
| 39 야생 상급사도 | 160/30 | .3→.39 | 25/55/0 | 1000 | #441100 |

`31125–31151`: L=monLv, B=(L≤500?.4L³+199L+100:50,000,000×1.0014^(L−500))×2.925; pacing=`1/(1+min(9,max(0,L−1))/18)`; HP=`floor(floor(B×pacing×(ib?24:1)×dm×tier.hpMul)×(1+si×.02))`; ATK=`floor(((ib?75:50)+L×(ib?2.9:1.95))×.6×dm×tier.atkMul)`. catalog HP/ATK 로컬 변수는 여기 최종HP/ATK를 계산하지 않는다. 예: L1/dm1/tier0에서 si4 HP945·ATK31·poise945·shield945. raw data와 실제 값을 혼합한 밸런스 보정 금지.

모든30..39는 `_noProjEtypes:31154`에 없으므로 기본 projCd240, 초기projT180+120U. M02는trunc×.85 후 tier1/2/3별trunc×.8/.7/.6. idle st2=30+50U·facing=Uτ·spawnT20, facing 이후 aura 추첨 등 RNG순서 보존(`31165–31168,31360`). 일반타입이라도 실제근접 접촉 목록(`40499`)에는 **30..39 전부 없음**.

| etype | 초기 T / Cd (tick, 각 U는 별도 호출) | 추가 상태 |
|---|---|---|
| 30 | wildCharge 30+20U / 60+30U | charge 진입 시 aim90/dur17/spd42/len714+r |
| 31 | 전용 timer 없음 | 공통proj/후방 유지 |
| 32 | boulderSlam 80+40U / 200+60U | eSlamWind50 |
| 33 | 전용 timer 없음 | 그룹 증식은 room caller 전용 |
| 34 | poisonZone 60+30U / 150+50U | poisonZone tickRate30 |
| 35 | beastCombo50+30U/120+40U; beastRoar120+60U/300+80U | setTimeout 콜백0/250/500ms |
| 36 | serpentZig40+20U / 80+30U | 시간_now를 쓰는 횡변위 |
| 37 | predStealth80+40U / 200+60U | predCorpseHeal=.3, _predAtkBoost는lazy |
| 38 | broodSpawn60+30U/180+60U; broodGas100+40U/250+80U | gas tickRate25 |
| 39 | elderRoar100+40U/250+80U; elderCharge60+30U/150+50U; elderSlam120+60U/300+80U | _elderEnraged는lazy |

위 timer 원본 `31235–31259`; 해당etype가 아니면9999. 초기/주기 값을 UI의초 단위로 반올림해 바꾸지 않는다.

### 1.4 30..39 AI·탄·공통상태

모든 전용 분기는 outer `idle` 조건을 **진입 때 한 번** 검사한다. 안에서 s가 바뀌어도 뒤 독립 if는 실행될 수 있으므로 elif/첫 동작 하나 선택으로 변환하지 않는다.

| etype / 원본 | 실행 계약·빠뜨리기 쉬운 차이 |
|---|---|
| 30 / 39143–39149 | wildT−sp, ≤0·40<d<1200·_chgPathClear(714+r)일 때 현재P 각도 세팅→eChargeWind90, aimMax90/dur17/spd42/len714+r·timer reset. 공통 eChargeWind의 st2>90×.755에서만 재조준, 뒤 방향고정. “물기” 별도 접촉 공격 추가0 |
| 31 / 39150–39151,40462 | 전용 할퀴기 분기 없음. 일반 projT/charge 사용, idle후방 유지(80 미만 후퇴.6배/200 초과 접근1.2배). 선택_RANGED_ET에31이 없는 점과 분리 |
| 32 / 39153–39163 | T−sp, ≤0·d<100→eSlamWind50, 원위치4방향 π/4오프셋 eProjAt(P,2.5,요청계수1.3,life200,sz3). d<80 추가조준1발(P,4,요청.8,life60,sz2). eProjAt의 P beanRoll은 계수를1.2로 덮으므로 요청값을 그대로 실피해로 쓰지 않음. 이후slam50 종료 직접 AoE는 별도 |
| 33 / 39165,40458–40519 | 전용 전투 분기 없이 공통 추적/분리/proj(range200). 단순 추적이라고 탄을 제거하거나 crawler접촉.8을 붙이지 않음 |
| 34 / 39167–39173 | T−sp, ≤0·d<300에 본체위치 정지 D poisonZone: rawDmg=trunc(atk×.4), life/ml300,sz8,tickCd0,tickRate30·cd reset. warning 이동탄이 아닌 직접 stationary birth. idle후방 유지 포함 |
| 35 / 39175–39197 | 두T 감소. combo≤0·d<40이면0/250/500ms 콜백3개 등록, 각각 !dead/hp>0/!stunned·실행시d<60일 때 hurtP(trunc(atk×(.7+i×.15))). **실행 시 현재atk** 읽음, 계수.7/.85/1.0. 이어 telegraph20/windup15. 별도 roar≤0이면200 내 자기제외/!dead 아군 _aSpdM×1.3·atktrunc×1.3. 콤보+포효 동시 가능. 타이머를임의 native15tick 스케줄로 바꿀 때 pause/owner 소멸/실시간 콜백 의미의 동등성은 별도 인수 필요 |
| 36 / 39199–39214 | zigT−sp, ≤0·d<1200이면facing+sin(_now×4)×.8 방향, speed×2×(_aSpdM||1)×sp×10 변위/canMv 후좌표·cd reset. d<50에서 독3(U<.1sp)와 꼬리hurtP(trunc(atk×.6),U<.05sp)를 **별도 RNG 두 번** 검사. 공통flow/idle 이동을 대체하지 않음 |
| 37 / 39216–39235 | T감소→!cloaked·T≤0·d<1200이면cloaked=true/cd reset, 바로 다음 if에서P.facing+π/거리30 뒤좌표 canMv 시 이동. 실패해도cloaked=false/telegraph20/windup12·첫회atk×1.5/_predAtkBoost=true. teleportE의착지강타를 추가하지 않음. U<.01sp일 때60 내 첫dead 시체로mhp30% 회복 후시체좌표−9999. 실제 “장시간 은신 후 도약” 상태가 아님 |
| 38 / 39237–39252 | spawnT/gasT 감소. spawn≤0·ens.length<200이면cd reset→2~3 etype33, 좌표 각U×40, el=e.el||P, room=e._ri. batch 전에만capacity 검사(199에서3추가 가능), mkEn null만걸러push. gas≤0·d<1200이면 D poisonZone rawtrunc(atk×.5)/life400/sz12/tickRate25. 두동작 같은tick 가능 |
| 39 / 39255–39286 | 세T감소. hp<50% 첫회speed×1.3/atk×1.3, roar는250 내아군 _aSpdM×1.2/atk×1.2. charge≤0·100<d<1200→**eCharge직행30**/현재facing/cd reset, 30과같은90tick 전조를새로붙이지 않음. slam≤0·d<120→eSlamWind55, P8방향 eProjAt(3,요청1.5,life250,sz3),d<100 추가e.el조준(4,1.2,life60,sz2). 100<d<120에서 charge후slam이 s를 덮고 두cd는소비될수있음 |

**일시 ATK 쓰기·소유 순서:** 전역 `34394–34412`는 매 갱신_aAtkM/_aSpdM/_aDefM을1로 reset 후 오라 적용, `38770`은 매 updateE에서atk=baseAtk(드루이드예외)를 수행한다. 35/39 포효나37 첫기습을 영구 baseAtk 증가·지속시간 버프로 고치지 않는다. 39의speed×1.3와 atk 쓰기도 같은 지속성으로 합치지 않는다. 아군의 업데이트 전후 순서까지 포함한 실효 지속성은 **미확인**이며 새 버프 TTL을 설계하지 않는다.

공통 상태/clock 원본:

| 행 | 계약 |
|---|---|
| 34387–34495 | 공간해시/시체pool·오라→항상감소timer→뷰포트/거리 tier. T1 보스/피격/<150/charge 매회, T2<350 2회중1·sp×2, T3<700 4회중1·sp×4, T4는어그로유무별flow/update. charge는컬링·tier정지예외. tick표기를벽시계쿨다운보증으로해석하지않음 |
| 38584–38665 | kb/벽충돌·hitStun/stunned/frozen guard, charge 취소·poise 일반회복200tick 뒤15%. 포이즈0은원본19973–20001·일반stun180, 기존owner 재사용 |
| 38681–38705 | LOS<800 어그로, range≤400 밀착flow, 큰range .65~.85 거리유지. 그뒤 idle전용이동/분리도 별도로 수행 |
| 40458–40519 | idle 후방유지31/34/38, 기타1.6배추적, 분리cd3. `_meleeET`는0/2/4/5/6/10/12/18/19뿐. projCd복구/차징은모든비제외etype에적용 |
| 40521–40547 | eChargeWind→eCharge: sweep선분충돌, 벽이면recover30. 피해trunc(atk×30×elMul),KB100·eModHitP; 패링/무적분기는보호. type39 default speed5, type30 override42. 임의피해/KB완화금지 |
| 40550–40559 | eSlamWind 종료 radius70+r 직접trunc(atk×2×elMul)/KB10, 주변다른alive적KB6, recover50 |
| 41232–41241,41376–41385 | windup→attack8(etype3만5), 공격창 통과시 **근거리 탄**1발(_spawnBossProjectile,atk×1,e.el,life60,sz2), recover35→idle15+15U. 35의별도3콜백과중복범위를구분,37의windup도이경로 |
| 38577–38581 | atkTicketRequest는**항상true**. 옛maxAtkTickets3/공전 코드·문서가 있어도3마리제한을새로이식하지 않음 |

### 1.5 투사체·독·사망·보상

`EL:14333–14344`는 P0/F1/I2/D3/L4/H5/E6, ETYPE_ERES는120개0배열. 같은비P속성 .5, F↔I/D↔L/D↔H/E↔L는2, 나머지1. source에 없는2장면역/냉기금지를추가하지않음.

| 원본 행 | 탄/접촉/사망 계약 |
|---|---|
| 40504–40518,20122–20156 | 공통projT가거리<ETYPE_RANGE에서0이면cd reset+charge60. charge종류 D→dark/I→water/F→fire/나머지normal, 완료시 **현재P를조준**. life=trunc(range×.3). 기본normal rawatk×.8/속도3/size1.5, D×1/3.3/gbBean, F/I×1.2/3.2/fireMagic 또는waterBean. L/H도normal분기이며새6원소별별도패턴을발명하지않음 |
| 20049–20055,20119 | eProjAt는life×1.5절삭. eShootWind일때외에는beanRoll: P는요청dmgMult 대신1.2·spd×1.3/redBean, D는1·spd×1.1, F/I는1.2·spd×1.05. L/H/E만요청계수보존. common charged와 special eProjAt를같은정상화입력으로만들지않음 |
| 16940–16945,20065–20093 | 비보스 **이동탄**은_emitEnemyShot의60tick warning, 같은owner/frame/world/el/class lane묶음. 정상owner는현재이동량을release위치에반영; death warning은사망위치. 이미eShootWind완료동일속성은직접birth. stationary poisonZone은즉시spawnProj |
| 16947–16992 | moving적탄은일반3발중1드랍(단_commit은드랍면제),size×2/r×1.3/속도×1.8/dmg×2, redBean dmg×.5 및최종speed정규화. eProjAt의_commit packet에는배율을적용하되다시드랍하지않음. 물리탄300px/s·일반마법500~600, blackBean/Q전용분류는기존보호. 순수요청packet과최종birth를중복증폭하지않음 |
| 16911–16920 | poisonZone은parry forbidden, blackBean은EL.P여도magic(Q). 표면색/속성과Q/Eclass를합치지않음 |
| 34725–34735 | poisonZone은vx/vy0, tickCd>0이면−sp; ≤0·거리<sz×5·iframes≤0·P.s≠charge일때Cd=rate(default30), hurtProjectilePlayer(trunc(dmg×elMul),magic), P.poison+2. 34는반경40/30tick,38은60/25tick. 수명만료시recycle. 보호된공통접촉/반사루프전체를신규장판에복제하지않음 |
| 33013,32745 | P.poison은−sp×.02와독DOT기존sink를소비, statusClean 별도. type36의독3·zone독2를곧바로고정초/고정체력피해로치환하지않음 |
| 42944–42963 | 공통비보스 non-decoy 비P 사망장판: elite≥1 또는U<.2. dmgtrunc(atk×.25),tier≥2 sz10/life360 그외7/240. D/F/L poisonZone rate40/35/30; I는iceZone dmg0. H/undefined도외곽조건에들수있지만해당생성분기없음. 30..39 전용사망branch는직접etype검색에서없음. 15분열/rare death/M07/M08 등의별도효과는중첩가능 |
| 42680–42710,43047–43113 | alive→dead·지역kill·보상·접사death·드랍/악의/XP는기존hurtE/정예/메타/리바이브소유. 실제연결권위없이강화적보상·부활·저장조건을새설계하지않음 |

정지장판의life/size/damage는이동탄전역배율을받지않는다는조건을보존한다. poisonZone 전용tick 이후의전체공통투사체루프/렌더까지동등한실게임결과는 **미확인**이다. 렌더정의 `54194`와사운드 `_ETYPE_SFX/_BEAST_ET:24730–24790`도별도consumer다.

### 1.6 정예·네임드·보스의 2장 차이

정예전체modifier/오라몸체는 ELITES 제출본을 의존으로만 참조한다. 이 문서의 2장 지역조건은 다음과 같다.

| 집합 / 행 | 2장 계약 |
|---|---|
| ELITE_PROB / 31033–31080 | 자연 일반90%/매직8%/레어2%/챔피언0. RNG1회 strict누적비교. 보스/etype90..99는elite0으로등급roll생략. tier0/1/2/3 hp×1/2/3/5,atk×1/1.3/1.6/2,mods0/1/2/3,scale1/1.08/1.2/1.35 |
| 해금mods / 31044–31061 | **12종** M01–08,M26,M29,M30,M31. 공격pool=M29/30/31; 매직·레어는공격1 우선,레어남은1은일반M01–08/M26,챔피언선택호출시공격최대2. M32는hell2이므로2장자연pool에없음. M21등록삭제 |
| aura / 31083–31097,34394–34412 | tier≥2에서warCry/healing 중1·RNG1회. warCry range150/ATKmax1.25/SPDmax1.15; healing120/hp+trunc(max(1,mhp×.0003)×sp). 태생챔피언0%와gate 후elite3은별도 |
| 후대입 | 문지기/호위/균열/소환의등급덮어쓰기는mods/aura를자동재롤하지않음(§1.2). M31실행과잠금우선순위는ELITES의기존owner범위 |
| named90..99 / 31389–31480 | room/tileRLE 함수만별도죽음99 .005(stage1회플래그),else 다음U<.05에서90..98 균등. death플래그가이미있어도첫Math.random 호출은남음. 기본31풀·정예레어tier2와다른집합. 모든caller가이를수행하는것은아님 |

네임드10종은전역기존적이며CH2전용actor를중복만들지않는다. 아래행은2장발생시필요한기존계약의색인이고전체네임드완료판정이아니다.

| etype | AI/피격/사망 원본 | 의존 |
|---|---|---|
| 90 | 40253–40266,41378–41384,42970–42977 | 3연combo·회피·개별사망 보상 |
| 91 | 40268–40282,42978–42986 | 도주/피격누적반격·악의보상 |
| 92 | 31351,42138–42146 | 물리반사는주석상비활성. atkEl>0 비DOT흡수/가득차면되쏘기; Q/E/hurtE 보호 |
| 93 | 40284–40312,42988–42992 | 상점/도주·악의/아이템거래는인벤·메타/저장경계 |
| 94 | 40314–40323,42993–42999 | HP단계·사슬연계/사망폭발 |
| 95 | 40325–40357,43001–43007 | localhistory·TP전조120·슬로우·되감기1회 |
| 96 | 40359–40370,43009–43013 | mats10%절도·성장·반환, State writer보호 |
| 97 | 40372–40392,43015–43023 | phase전환300·짝사망/부활, room추가1생성과별도 |
| 98 | 40394–40418,43025–43031 | TP/차원장판/일반풀소환 |
| 99 | 40420–40448,43033–43043 | 제한시간·낫/광역·죽음보상, stage1회선택조건 |

보스생성은 `30782 mkEn(...,0,true,STG[si].be,0)`, stage4..9의각기다른새etype가아니다. `_ch2Base`28개중cageTrap삭제 후27개는 slashCombo/slam/sweep/charge/jump/burst/shock/fan/spin/grab/multiDash/poisonTrail/summon/mine/vortex/chaseAoe/elemBall/beanStorm/beanRain/groundFissure/tideWave/lavaPools/fireRain/shockGrid/donutSlam/crossWipe/rapidMissile. si5에seekerMines,6 fanWave,7 wallPush,8 shieldBash2,9 spiralBullet를누적추가한다.

공통보스정의 `9820–9960`, score/start `37650–38234`,phase `38235–38314`, AI `38373–38513`, 상태 `40560–41375`가실제움직임근거다. _bossAI는idle/stun·d20..500·moveCD/허용set·콤보/score를거친다. HP비율80/60/40/20%에phase0..4, phase전환부활무적90·speed×1.15 상한·maxPoise×1.2 **현재poise회복0** 등을공유한다. 이름만으로벌레고유패턴을추가하지않는다. 1장드루이드특수AI/데모피날레는2장정본이아니며2장각보스전체행동의Godot실행은 **미확인**이다.

별도 필드위협 _fb/화마귀는 `61053/61651`의 stage!==0 clear로 2장에 추가하지 않는다. **곰치 `_wmTick:61261–61327`은 stage0 밖에도 실행 경로가 있다**(update의caller32145). stage변경 시 `_worms=null`→4개 생성, 비stage0은 P주변 `_wmLockDest`로 각 위치를 정한다. etype/ens 풀과 별도 권위라31+10 분모에 가산하지 않는다.

| 곰치 원본 | 2장에서도 필요한 기존 전역 의존 |
|---|---|
| 61203–61212 | 위치 후보28회, P주변48+40U/거리>36/isW 거절, 실패시P좌표·bonfire 투영. 실제6에리어좌표는미확인 |
| 61214–61242 | 화면내중심일때titanEye탄(F,rawtrunc(atk×1.5),life240,sz6.4,r12), body r56/HPtrunc(150+P.lv×45)/ATKtrunc((16+P.lv×2.5)×1.2). titanEye는속성과별도physical 이동/패링분류이며정상화는기존탄owner 의존 |
| 61220–61237,61286–61312 | hide108(54대기+54엿보기)→emerge→shoot→retreat, emerge/retreat frame7tick·shoot36tick, 두발후퇴. clock은sp가아닌해당함수호출별--/++를쓰므로임의delta 정규화금지 |
| 61244–61259,61314–61327 | 개별contactCd60·P상태/iframe guard. 출현d<r+Pr+28에atk×.45,활성본체d<r+18에atk×.5; 벽관통없는4px단계밀기/KB28. HP≤0은G._worms슬롯null. 기존필드위협/피해소유자와인수,새CH2일반actor로합치지않음 |

`_FDG_RUINED_FOREST_FIRST`/레슨/맵·게임상태 guard로 실제 실행이 달라지므로 4개 실스폰·피격 관측은 **미확인**이다.

### 1.6.1 공통0..19·47의 재사용 경계

아래는 2장 풀에 다시 등장하는 기존 유형의 source 색인이다. PC CH1 담당·기존 부품을 의존으로 두며 새 CH2 actor를 같은 행동으로 복제하지 않는다.

| 유형 | 원본 AI/사망 핵심과 의존 |
|---|---|
| 0/2/4 | 40499–40503의접촉atk×.8·쿨40+trunc(20U),공통flow/proj. 2의돌진발동은38885–38886에서제거. 4의CH1시작중형예외는31518–31531의si0 한정 |
| 1/8 | 40462의후방유지·공통proj. constructor의8 bombT필드만보고폭탄AI를추가하지않음. 1의현재Godot hive/L exact를모든스킨/속성consumer로일반화하지않음 |
| 3 | 공통FSM,attackduration5(`41232`),기존type3recipe/binding·6원소부품을의존. CH2일반admission은별도 |
| 5/6 | 38888 windup20,6의38891–38917 호위/쉴드각·쉴드소진돌격. CH1 trace에서상세참조 |
| 7/11 | 38920–38940/38973–38983→eSummon40777–40796: 7은type3 1..2개,11은2..3개,각6원소추첨·HP50%/shield0·recover50. type7원본TP전조/경고탄이동은기존의존 |
| 9 | 38944–38958: deadPool150 내첫비보스/비9/미흡수시체를alive=true·HP50%·shield0·recover60·stunned0·poise복구,없으면timer60. 시체/리바이브권위인수필수 |
| 10/12 | 38960–38970 뒤35px직접이동·windup10,38985–38988 HP40%미만speed×2.2/baseAtk×1.5. 12는baseAtk를바꾸므로37의일시atk×1.5와다름 |
| 13/14 | 38991–39014 web projectile/회전궤도·swoop. web의Q/E분류·이동sink는기존공용이며포트추가시범위확정 |
| 15/16/17 | 42790–42801 사망분열;39017–39029 trap/50cap;39031–39048 type13소환. 중복소환목록을type3로통일하지않음 |
| 18/19 | 18은40499접촉목록/공통FSM,19는39050의slam입구→40550공통slam. 이름의“흡혈/대형”만으로새수치/공격추가금지 |
| 47→40 | 39408–39428은40생성후미등록·전용TP. CH1 PC b/source추적의동일결함/한계를참조. 40의위상AI39302인접을2장자연등록됐다고세지않음 |

### 1.7 스킨·표시·영속화

`_assignMobSkin:23292–23303`은**모든비보스 `_mobCh=1`/40종·8열**이며 seed=`((etype||0)*7+trunc((_homeX||x)*31))&0x7fffffff`,col/row즉시결정. `23305` 이하의순차_applyMobSkin정의와현재즉시할당을혼동하지않는다. 2장이므로atlas_ch2/184스킨을새선택하지않는다. procedural etype30..39 draw `21393` 인접·신규atlas `22922` 인접·스킨렌더 `20200–20269`는겹치는폴백계층이며실창최종우선순위/모든자산존재는 **미확인**이다. Godot에는CH1공유body자산과exactcrop소비자가있지만2장profile/frame전체인수는없다.

원본enemy스냅샷/zone/lifecycle는기존SAVE추적문서의11필드경계를참조한다. rawconstructor의전용timer/mods/aura를새저장필드로추가하지않는다. `index.html` 전체etype/mkEn/rollEtype/rollEl/poisonZone literal검색은적생산자없음; 로비route/캐릭터payload운반을전투AI로세지않는다. 저장복원/현재PC실행은 **미확인**.

## 2. docs 불일치·누락 표

기준설계는 `docs/8.0몬스터디자인/` 전19파일과 `docs/9적ai패턴디자인/`4파일을검색했다. 원문검색기록은원로그 design-doc-search.json. 기존설계는수정하지않고이추적표에현행원본을남긴다.

| 항목 / 설계 위치 | 문서 표현 | 최신 원본 | 판정·이식 지침 |
|---|---|---|---|
| 몬스터_총관리.md:932–942 | HP/ATK/SPD/r표,33 r5 | ETYPE_R[33]=10, speed변환·r×2/RNG, HP/ATK최종curve | **r불일치 + catalog/런타임구분누락**. 표수치를actor최종수치로대입금지 |
| 같은표35/37 | 포효주변버프30%,은신→도약/시체흡수 | 35의ATK/aSpd쓰기뒤전역reset,37은즉시뒤좌표·실패해도windup | **행동구체화누락**. 영구ATK버프/장시간은신/teleportE착지공격발명금지 |
| 같은표30/31 | 돌진+물기,가시+할퀴기 | 30..39가_meleeET에없음,31전용할퀴기AI없음 | **서술/실행불일치**. common projectile·명시된직접피해만유지 |
| 스테이지_몹분배.md:분배/풀크기 | CH2 184스킨풀·순차스킨·모두등장보장 | _assignMobSkin은ch1/40·etype+좌표seed | **스킨할당불일치**. visualcatalog수와AIetype31풀을분리 |
| 같은문서 보스배치 | 2_1~2_6 미배치 | HELL_BOSSES[1]6이름·각move set | **낡은표**. 6새etype로치환금지 |
| 같은문서 금지조합 | CH2 얼음금지(색감기준) | rollEl은I도가능,현재스킨ch1공유 | **범위구분**. 색감지침을I면역/출현금지로해석하지않음 |
| 같은문서 CH2-1런타임 | S4+M5+L2=11,900예산 | count함수는50/100/100,배치/geometry는맵자료필요 | **수식일치/맵제출본의고정seed값참조**. 900을모든6에리어고정몹수로확대하지않으며실제spawn은미확인 |
| 9_적AI패턴디자인.md:202–215 | 어택티켓최대3등이전설계 | atkTicketRequest항상true | **비활성옛설계**. 신규공격제한추가금지 |
| 같은문서:233–306 | 근접접촉/돌진/텔포설명 | 동물30전조90은일치,39는직행,37은직접좌표 | **전용분기구분누락**. 공용연출/피해를일괄적용하지않음 |
| 같은문서:350–394 | 2장정예8/2/0·M31/오라 | 원본31033–31097과일치 | **일치**. 그러나원소rare90..99와등급레어혼합금지 |
| constructor/AI 주석 | 33소형,소환굴5초/300간격,35·39버프 | 실제r10,간격900/total·curve,ATK매tickreset | **원본내주석/실행차이**. 코드값을근거로하고임의보정0 |
| 기존Godot완료문단 | 당시support5/11·6/10패키지수치 | 최신main exact9/7·소환굴type0별도 | **과거snapshot**. 이번2장진행률/전체etype완료로재사용금지 |
| 탄막시스템_총정리/몬스터_공격시스템 | 일반탄/6원소/TP/장판의부분설계·이식기록 | source charge/eProjAt/emitWarning/spawnProj경로가서로다름 | **부품과완전consumer구분**. 기존6원소클래스로30..39전부지원한다고판정하지않음 |

`ETYPE_HP/ATK/SPD/R`의2장catalog대부분은몬스터_총관리표와일치한다. 불일치건수로전부세지않는다. 원본 오류처럼 보이는 e._ri/undefined/ATK reset/거리 분류와 type47의40 생성 후 미등록도 수정하지 않았다.

## 3. Godot 의존과 빠진 것

아래는**main파일/테스트본문정적검토**다. 과거PASS를재실행결과로쓰지않는다. 경로는godot/상대다.

| 의존·파일·행 | 존재하는 것 | 2장에 필요한 것/한계 |
|---|---|---|
| scripts/enemy_factory.gd:23–30,60–61,151–185 | CH1 stage0/time0 schema·exacttarget/crop/order등록 | stage4..9 genericconsumer없음. 이guard삭제로6에리어admission확대금지. tests/test_encounter_factory.gd:15 exactorders9는2장지원개수가아님 |
| data/encounters.json:1 | frozenCH1초기16 snapshot | 2장자연seed/개체/배치/소환receipt미추출. 이름을ch2로바꾼복제JSON금지 |
| scripts/enemy_melee_flesh_crawler.gd:408–466 | type0 exact필드/poiseowner | 현재main413은etype!=0거부. 새type30..39상속후이검사삭제/무시금지. 이전P2-008a-FIX 사용자인수와현재main통합은별개이며이문서는고치지않음 |
| scripts/enemy_melee_ch1_ice_warrior.gd + P2-008a정본 | CH1 exacttype20 | CH2일반풀에20없음. PC영역의범용후속/etype47또한별도인수. CH2새이름으로CH1AI복제0 |
| scripts/enemy_type7_physical_flesh_crawler.gd/native_type7_runtime.gd/native_type7_teleport.gd | type7 exact·TP·Worldphase·M29/M30 의존 | type7모든원소·스킨/CH2profile·소환metadata인수는별도. type47의다른TP를type7으로단순별칭화금지 |
| scripts/type3_spawn_recipe.gd:40–50 및type3_summoned_actor/type3_native_binding | 콜백주입sourceconstructor·6원소/skin부품 | context/collision/RNG/birth연결필요. type33산란을type3actor로대체못함. 기본외부oraclefixture가없으면NOT_READY/미확인유지 |
| scripts/native_element_projectile_emitter.gd:89–145,248–282 | supports sourceactor3/6원소·7/P·21/D, normalized21 별도 | **30..39미지원**, generic6원소원자원존재와actoradmission분리. 새warning/공통charge/정상화1회consumer필요 |
| enemy_projectile_{physical,fire,ice,dark,lightning,holy}.gd 및black/blue port_modules | 탄부품/생존/피해·반사부분 | poisonZone34/38의동일규칙·지역deathzone·새 actor packet caller없음/미확인. Q/E공용변경금지 |
| scripts/native_spawn_hole_system.gd:26–40,518인접 | STAGE0/HELL0_POOL·undefined원소·etype0실제등록,다른타입정직unported journal | 2장31풀·holebudget실제맵연결·30..39동적actor없음. P3-002담당의분모/World등록과구분 |
| scripts/native_regions.gd:50–118 | source지역rule·4분할·kill 기록,실제G사용 | 2장맵영역/6area진행·확정spawn분모는맵/P3담당. 해당모듈은totalSpawned소유자가아님 |
| scripts/native_normal_enemy_hurte.gd 및전용hurtE owner | 공용피격/poise/kill/보상/지역sink | 각2장actor의실제필드call소유계약·death/summon/정예branch검증필요. halt를숨기거나타적fallback금지 |
| scripts/world.gd 실제RNG/birth/공간/시체/등록 | source권위와type7 birth phase존재 | CH2 child33/rare/boss의registry/room/element/기존 RNG 순서 연결은 미인수. 새가짜World/RNGowner금지 |
| scripts/player.gd/status/resource authority | 기존피해/속성/독/슬로우일부sink | poisonZone tick·35실시간콜백·36독·39charge의실제생산→접촉일치미확인 |
| 보스BOSS_CH1추적·기존 보스 부품 | 1장특수계약/공통기반 | CH2 각 si allowedset/phase/score/패턴상태consumer전수인수없음. 1장드루이드정본을2장보스로승격금지 |

`rg godot/scripts godot/tests`의30..39필드검색에는가이드/metadata/맵장식명등도걸린다. 그것을실행actor로세지않았다. 지원판정은script존재+factory/admission+producer→sink+실제테스트를분리해야한다. PC실행창/원격b후속의현재상태는 **미확인**.

## 4. 작은 이식 단위 순서안

### 4.1 1번 CH2E-01 — 2장 유형·원소 선택 정책, 구현 지시서

**공용0줄 목표, 신규2파일+자기Godot UID만.** 제안 파일 `godot/scripts/native_ch2_enemy_spawn_policy.gd`, `godot/tests/test_ch2_enemy_spawn_policy.gd`; 보고/CHANGELOG는후속배정관례. 이번파일/테스트는미생성이다.

| 항목 | 구현 계약 |
|---|---|
| 경계 | RefCounted 계산정책. stage4..9의31가중치·R집합교집합·rollEtype/rollEl만. 좌표/실제spawn/actor/정예 선택/맵budget/RNGowner/World/Main/State/저장연결0. stage0전용선택을바꾸지않음 |
| API 제안 | `pick_etype(stage:int, random_unit:Callable)->Dictionary`, `pick_element(stage:int, random_unit:Callable)->Dictionary`. READY결과는value와실제 소비 draw 수,지원밖stage/무효Callable은NOT_READY(샘플0). 구조상진단을추가하더라도원본값/분포/분기 순서를바꾸지않음 |
| 원본 | main game.html30969–31021. pool 원래 순서31쌍/합178·R가중치38/비R140. CDF는각weight/total을누적한**원본부동소수순서**. 원거리 분기의 가중치 비교와 CDF 분기를 같은 정수 추첨으로 바꾸지 않음 |
| RNG | 호출자 주입Callable만,default0/고정성공/독립randf시드/초기샘플링0. 원본의분기별2..13회(type)/1..2회(element) 그대로. unit의scripted RNG는검증입력이며제품provider로붙이지않음. 샘플 실패 시 이미 소비한RNG를가짜로되감지않음 |
| 보존 | stage4..9 pool동일·type31 R제외·type47 포함·12회Rrejection후2·U=.5는비R 분기·strict `<`. rollEl U=.4는보조 6원소 분기, 그 분기에도P가있음·E자동추가0 |
| 핵심golden | 각stage4..9: type U=[0,0]→1(2draw),[0,5/38]→7(2),[0,.999999]→38(2),[.5,0]→0(2),[.5,12회6.5/178]→2(13). el [.399999]→P(1),[.4,0]→P(2),[.4,2/6]→I(2),[.4,.999999]→H(2) |
| 추가 단정 | pool 31쌍의 값/순서/합178, R9종/합38, type30..39 선택 가능·20..29 혼입0·입력 불변·실제 draw 소비 순서/횟수. 경계 ±ε, stage4/9, 무효 Callable/지원 밖 stage 진단. 원본 함수를 독립 oracle로 실행해 결과와 소비열을 비교하고 GDScript 계산을 다시 쓴 기대값으로 대체하지 않음 |
| 검증·격리 | 새 테스트 격리명 `EXODUSER-EnemiesCh2-SpawnPolicy-Isolated-20261020`. 기존 회귀는 각 파일 상수 격리명: test_contracts/test_encounter_factory/test_p3002_spawn_holes/test_native_element_projectiles 등 필요한 의존만 실행. Godot 실행 전 pgrep2이상이면30초씩 대기, override 매회 설정/종료 후0byte. 실제 실행 수>0·failures/SKIP/stderr/exit를 구분 기록 |
| 인수 한계 | READY정책결과는CH2 actor등록/전투/지역/저장완료가아님. source함수와맞아도원본맵에서같은seed·같은개체 수를 재현한 증거가아님. 공용연결이필요해지면필요위치/근거만보고중단 |

지시서golden9종×6stage=54는이번에원본rollEtype/rollEl **함수만추출**해VM의주입Math.random으로분기와draw수를정적검산했다(`source-pick-goldens.json`). 게임을부팅하거나Godot테스트를한것은아니다. 이54를Godot PASS/실플레이검사수로보고하지않는다.

### 4.2 후속 단위 — 공통 owner 인수 후 한 건씩

| 순서 | 작은 산출물(예정, scripts/tests 아래) | 핵심 검증/선행·충돌 |
|---|---|---|
| CH2E-02 | `native_ch2_enemy_constructor_policy.gd` / test | 현재mkEn식·30..39전용초기timer/RNG literal순서·base/실효수치만. 실제actor/State writer0. 기존normal source registry/type3producer를먼저대조,중복authority금지 |
| CH2E-03 | `native_ch2_poison_zone_policy.gd` / test | type34/38의입력packet·tick30/25·반경40/60·마지막life/조건·독2. 먼저순수명령/상태계산만,실제Player피해/Worldbirth는별도소비배정 |
| CH2E-04 | `native_ch2_charge_slam_policy.gd` / test | 30의90/17/42와39직행30/default5,32/39독립if·cooldown/overwrites·Pbean 요청/실효차이. 기존M29/type7/공통sweep를재구현하지않고경계먼저분리 |
| CH2E-05 | `native_ch2_brood_spawn_policy.gd` / test | 38의 33 batch 2..3·batch 전 cap 판정·room `_ri`·el||P·mkEn 순서. 33constructor/실actor/공간등록writer인수전연결HOLD |
| CH2E-06 | `native_ch2_beast_predator_policy.gd` / test | 35콜백0/250/500ms·현재atk·조건,36독/꼬리 별도 RNG·_now,37뒤좌표/실패windup/시체이동. clock·실제시체owner·pause계약없으면생산자연결HOLD. ATKreset순서보존 |
| CH2E-07 | type31/33의전용actor소비자(이름은owner협의후) | “별특수AI없음”을기존crawler의공격/포이즈동작무조건복제로풀지않음. 원본 common FSM/charge·공유body검수·sourcefieldgate선행. factory공용은별도배정 |
| CH2E-08 | 남은30/32/34..39 actor별좁은소비 | CH2E-02~06·기존피해/탄/정예 부품·RNG/World phase선행. PC common0..19/47동시수정금지 |
| CH2E-09 | stage4..9 encounter/hole 실제연결 인수 | TRACE-MAPS-CH2 확정map/배치/예산·P3-002 등록/totalSpawned·P3-003 regions·PC공통actor인수필수. 기존CH1factoryschema/gate를단순삭제하지않음 |
| CH2E-10 | CH2 보스 allowedset/공통무브 검수단위 | 6si set27..32·phase/score·summon/mine/tideWave등실제sink분리. BOSS_CH1은공통기반참조만. 보스전투/리바이브/보상writer exactscope없으면HOLD |
| CH2E-11 | 네임드/정예·공통death zone 소비 인수 | ELITES·PC공통/rare·리바이브/인벤/메타 선행. 장판Q/E·저장 형식0줄원칙,31개 접사와 4개 오라를 CH2에서 중복 구현하지 않음 |

## 5. 공용 접점·미확인·제출

| 공용/다른 소유 위치 | 필요한 후속 소비·이번0줄 |
|---|---|
| enemy_factory.gd:60–61·admission/consume | 2장전용source/schema/실제actor등록은PC P2-008a/b·factory소유와협의. 기존exact유형validator완화0 |
| world.gd 기존 type7 등록/particle→warning→birth→post/RNG·collision/shQuery/deadpool | 신규2장spawn명령을실제권위가받아야함. native_spawn_hole_system의STAGE0/HELL0 제한과 map 생성/예산 변경은 P3·맵 소유자 별도 배정 |
| main.gd 부팅/씬·연결 | CH2map/actor/탄·UI연결은별도exactscope. 새연결을테스트fixture에서만조립하고제품완료로주장하지않음 |
| native_normal_enemy_hurte.gd/source field owner | type30..39의실제필드·poise·KB/kill/death와기존보상sink연결. 검사삭제/halt숨김/범용crawler fallback금지 |
| player.gd + status/resource authority | 독zone·36독·35콜백피해·charge/slam직접피해,기존armor원소·Q/E 유지. 임시HP setter로consumer완료대체0 |
| native_regions.gd/P3-002·003 | child/gate/elite생성→totalSpawned·지역등록·처치분모·문지기죽음게이트. geometry/분모를적담당이중복소유하지않음 |
| HUD/SFX/VFX/몸체리소스 | 위험표시60·독범위·elite오라·현재mobCh1/crop·body크기/사운드실창인수는별도. 소스색값표시만으로품질PASS금지 |
| native_source_new_run_state.gd/세이브어댑터 | XP/mats/보상·로드/적zone상태는기존권위. 새저장key/형식·공유지갑repository를이단위에서설계/구현하지않음 |

**미확인:** 맵제출본의발췌좌표/분모를실제부팅으로검증한결과·첫N마리seed/RNG전체동등성·일반/정식2장자연도달·PC후속branch실행·2장모든body/공격애니메이션·35setTimeout의pause/씬전환후실효·시체pool수명/37식사·후대입정예의모든접사/보상·모든탄분류/충돌실화면·영구저장. 제품코드와기존설계문서를수정하지않았다.

원로그 `~/exoduser-wt/_out/trace-enemies-ch2/`: source-basis/static-data/source-pick-goldens/design-doc-search/per-etype-direct-lines 및chapter/etype/fields/spawn/projectiles/common census, 번호있는원본발췌, ELITES/MAPS_CH2 원격본문,보호해시·Git 제출 검증. 정적 literal 추출/관계검토를게임테스트PASS로집계하지않는다. 원본게임/원래테스트를약화한것없음. 제출후자기브랜치push·원격SHA일치·DONE.txt기록→자기worktree제거, R불변검증을마친다.

## 부록 A. 직접 etype·전용필드 전체 검색 행 색인

이 부록의“전수”는현재game.html의직접etype비교/case 및전용field식별자의literal일치전부다. 배열/계산접근은§1의원데이터정의범위와함께읽는다. 동적외부주입·현재실행창의실제도달성은 **미확인**이다. 문자열행/렌더case를실제AI분기로승격하지않는다.

| etype | 직접 비교/case 일치 원본 행 |
|---|---|
| 30 | 21394, 31235, 31236, 39143 |
| 31 | 21412, 40462 |
| 32 | 21424, 31237, 31238, 39153 |
| 33 | 21438, 31433 |
| 34 | 21452, 31239, 31240, 39166, 40462 |
| 35 | 21465, 31241, 31242, 31243, 31244, 39175 |
| 36 | 21482, 31245, 31246, 31727, 39199 |
| 37 | 21498, 31247, 31248, 31249, 39214 |
| 38 | 21516, 31250, 31251, 31252, 31253, 39237, 40462 |
| 39 | 21532, 31254, 31255, 31256, 31257, 31258, 31259, 39255 |

| 전용 필드 | literal 전체 일치 행 |
|---|---|
| _wildChargeCd | 31235, 39147 |
| _wildChargeT | 31236, 39144, 39145, 39147 |
| _boulderSlamCd | 31237, 39156 |
| _boulderSlamT | 31238, 39154, 39155, 39156 |
| _poisonZoneCd | 31239, 39169 |
| _poisonZoneT | 31240, 39167, 39168, 39169 |
| _beastComboCd | 31241, 39178 |
| _beastComboT | 31242, 39176, 39177, 39178 |
| _beastRoarCd | 31243, 39188 |
| _beastRoarT | 31244, 39176, 39187, 39188 |
| _serpentZigCd | 31245, 39202 |
| _serpentZigT | 31246, 39200, 39201, 39202 |
| _predStealthCd | 31247, 39217 |
| _predStealthT | 31248, 39215, 39216, 39217 |
| _predCorpseHeal | 31249, 39226, 39229 |
| _predAtkBoost | 39224 |
| _predBaseAtk | 39224 |
| _broodSpawnCd | 31250, 39240 |
| _broodSpawnT | 31251, 39238, 39239, 39240 |
| _broodGasCd | 31252, 39249 |
| _broodGasT | 31253, 39238, 39248, 39249 |
| _elderRoarCd | 31254, 39263 |
| _elderRoarT | 31255, 39256, 39262, 39263 |
| _elderChargeCd | 31256, 39273 |
| _elderChargeT | 31257, 39256, 39272, 39273 |
| _elderSlamCd | 31258, 39278 |
| _elderSlamT | 31259, 39256, 39277, 39278 |
| _elderEnraged | 39257, 39258 |

## 부록 B. 생성·공통 행 색인과 정적 확인

| 구조/함수 | 원본 정의·전수 검색 범위 |
|---|---|
| CHAPTER_STAGES/STG/SI_TO_HELL/HELL_BOSSES | 16633–16712 |
| ETYPE_ERES/EL/elMul | 14333–14344 |
| ETYPE_HP/ATK/SPD/R/RANGE/POISE/SHIELD/COL | 30823–30920 |
| HELL_SPAWN/HELL_EL/CDF/선택 | 30969–31021 |
| 정예/mods/aura/접촉 | 31033–31118; ELITES 전수 색인 의존 |
| mkEn/초기 skin | 31120–31364; 전체 mkEn 호출행은 원로그 spawn-census.json |
| room/formation/tile/corridor/init/gate | 31366–31664 |
| hole·균열 | 35587–35719 |
| updateE/공통상태 | 38584–41415 |
| 30..39 전용AI | 39141–39287 |
| 90..99 AI / 전체death/kill | 40250–40448 / 42500–43118 |
| eProjAt/beanRoll/emit/warning/charge | 20049–20156 |
| birth/정상화/분류·접촉/zone렌더 | 16857–17010 / 34600–35140 / 54194 인접 |
| 보스 등록/score/phase/상태 | 9820–10010 / 37650–38513 / 40560–41375 |
| body/skin/표시 | 20200–20269,21393 인접,22922 인접,23292–23330,53975–54019 |
| UI/로비·저장 | index.html 전체4,742행 직접 적심벌검색; game serializer/zone는SAVE추적 의존 |

기계 추출은원본literal배열을읽어pool31/총178/R9/38·비R140 및30..39표를대조했고,원본선택함수의명시RNG열54건을정적검산했다. malformed게임실행/DOM대체/실World생성은없다. 설계검색에는255개일치행이있으며,각검색행이하나의결함/지원기능이라는뜻은아니다. 문서의표/행범위/참조파일과선행소유권을마감에재확인하며실행되지않은검사를PASS로기록하지않는다.

## 부록 C. 공통·네임드 직접 etype 비교 전수 색인

카탈로그·generic분기는§1/부록B와함께읽는다. 다음직접비교는렌더/피격/사망도포함하며어느하나가CH2자연등록의증거라는뜻은아니다. 40은47의미등록constructor부수효과행과함께별도표시했다.

| etype | game.html 직접 비교 전체 일치 행 |
|---|---|
| 0 | 40499 |
| 1 | 38895, 40462 |
| 2 | 31169, 40499 |
| 3 | 41232 |
| 4 | 40499 |
| 5 | 38888, 40499, 53758 |
| 6 | 31183, 31188, 31189, 38891, 38911, 40458, 40499, 42167 |
| 7 | 31190, 31191, 31192, 31193, 38895, 38920, 40462, 53786 |
| 8 | 31195, 31196, 38895, 40462, 42784, 53792 |
| 9 | 31197, 31198, 38944, 38948, 40462, 53797 |
| 10 | 31200, 38960, 40499, 53803 |
| 11 | 31202, 38973, 40462, 40779, 40783, 40784, 40794, 53809 |
| 12 | 38985, 40499, 53811 |
| 13 | 31206, 38991, 53817 |
| 14 | 31208, 39000, 40460, 53819 |
| 15 | 42792, 53823 |
| 16 | 31214, 39017, 40462, 53827 |
| 17 | 31216, 39031, 40462, 53829 |
| 18 | 31218, 40499, 53831 |
| 19 | 31221, 39050, 40499, 53834 |
| 40 | 31263, 31264, 39289, 42154 |
| 47 | 31285, 31286, 31287, 39408 |
| 90 | 40253, 41378, 41381, 42970 |
| 91 | 40268, 42147, 42978 |
| 92 | 31351, 42138, 53902 |
| 93 | 40284, 42149, 42988 |
| 94 | 31353, 40314, 42993, 53905 |
| 95 | 31354, 40325, 43001, 53908 |
| 96 | 40359, 43009, 53910 |
| 97 | 31356, 31441, 40372, 43015, 43016 |
| 98 | 31357, 40394, 43025, 53912 |
| 99 | 9755, 31358, 40420, 42136, 43033, 53915, 53921 |
