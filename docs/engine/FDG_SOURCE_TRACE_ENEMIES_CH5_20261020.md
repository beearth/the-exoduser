# 5장 지옥의 군단 5에리어 적 — 원본 추적·이식 설계

작업 `trace-enemies-ch5` · 브랜치 `codex/trace-enemies-ch5-20261020`. **정적 원본 추적·후속 구현 지시서이며 제품 구현 완료가 아니다.** 제출은 이 문서와 CHANGELOG_SYNC 최상단 자기 절뿐이다. 코드·테스트·공용·기존 설계·저장 변경0, Godot 실행/import0. 실행 증거가 없는 것은 **미확인**이다. 파일·브랜치의 날짜는 배정 ID를 유지하며 마감은 2026-10-21 KST다.

## 0. 기준·선행 의존·분모

G=`0105159934d0c2a8b167bd51518dca1e0fafe50a:game.html`, I=`동일 SHA:index.html`. fetch한 최신 origin/main에서 직접 분기했다. 모든 원본 행은 이 고정점의 1-based다. game은65,692행/4,195,551byte/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index는4,742행/353,568byte/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`다. CH4 추적 당시와 원문 byte가 같아 행이 유지된다. 원격 제출은 읽기만 했고 병합·복사하지 않았다. 타 worktree/WIP 조사0.

보존할 주 체크아웃은 `R0=/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 아래 선택 분류 **R**과 구분한다. 착수 R0 HEAD=`dd49171c5b88e211575a41f185395d6c0a14b184`, branch=`codex/mac-live-play-time-main-20261017`, tracked INDEX/WORK clean. 작업본은 `~/exoduser-wt/trace-enemies-ch5`에 `worktree add --no-checkout` 후 non-cone sparse-checkout으로 필요한 godot/docs/tools·원문·규칙만 받았다. R0에서 설치·파일 수정·branch 전환0.

| 먼저 읽은 근거 | 재사용·경계 |
|---|---|
| main [ENEMIES_CH4](FDG_SOURCE_TRACE_ENEMIES_CH4_20261020.md) 전체 | §0–5·부록A/B/C의 형식·깊이, caller/RNG/field 전수 색인, 첫 leaf의 파일 oracle 지시를 재사용. **그 문서의 main 포함 표는 당시 snapshot**이므로 아래에서 재판정 |
| main [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §0–2·공통 색인 | 초기16개체/exact 지원과 전체 etype actor 지원을 구분. CH1 당시6지원은 현재 main exact9/16과 구분. 공통0..19/47의 전체 지원을 뜻하지 않음 |
| main [ENEMIES_CH2](FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md) §0–1·공통 경계 | 생성 caller별 원소 부재·등록·후대입, 네임드/공통 FSM·탄·저장/별도 곰치 경로 참조. 30..39 정책을60..69 actor로 바꾸지 않음 |
| 원격 [ENEMIES_CH3](https://github.com/beearth/the-exoduser/blob/20b2139a7f140f13dc37deb082e471c494d6fa77/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md) / CH4가 참조한 정책 | 추적 문서 자체는 기준 main에 없음. CH3 selector/catalog/phase는 현재 main에 있음. 47의 clone40은 기존 의존, 이 문서에서 중복 구현하지 않음 |
| main [ELITES](FDG_SOURCE_TRACE_ELITES_20261020.md) §0–1·색인 | 전체31mods+4auras=35의 원문 권위. CH5 해금27mods/4auras·caller 후대입만 기록하며 공통 구현을 새로 소유하지 않음 |
| main [WORK_BOARD](orders/WORK_BOARD.md)·[FEATURE_INVENTORY](FDG_FEATURE_INVENTORY_20261020.md) | P2-008a/FIX·b=PC factory/CH1, P3-002=굴/동적등록, P3-003=지역. 데이터 EN-60..69나 render case 존재는 실actor 지원 증거가 아님. 기존 보드·담당 파일0줄 |

| EC2~4 제출 / SHA | 기준 main 포함 | 실제 파일·재사용 범위 |
|---|:---:|---|
|EC2-01 `c7e02549bec082cc31a86e606a61ec78f28dfb27`|예|`native_ch2_enemy_spawn_policy.gd`: pick_etype/pick_element·주입 RNG·NOT_READY. guard4..9; CH5 지원 아님 |
|EC2-02 `a10924eb0ee725b993ab7bd1ea019d99180d4e1c`|예|`native_ch2_enemy_constructor_policy.gd`: 숫자 projection/provider·**Constructor.Draws 실제 재사용**. guard4..9/30..39. HP 권위 복제·guard 확장0 |
|EC2-03 `557eaff4deda2bd2dcac157a46615ee40fc433f9`|아니오|`native_ch2_poison_zone_policy.gd`: clock→fresh emission/명령 형식. 34/38 gas 전용이며66산호/60수역과 tick·확률·탄 플래그가 다름 |
|EC2-04 `5a389578b9549b25538c665580e0d8bd906f9dbc`|아니오|`native_ch2_charge_slam_policy.gd`: outer idle/clock·독립 trigger 형식. 30/32/39 guard이며61/67/68 direct charge 소비자 아님 |
|EC2-05 `699f2a56f1b517f9c015c56366e044a860395475`|아니오|`native_ch2_brood_spawn_policy.gd`: 동기 constructor 사이에 다음 좌표 RNG를 두는 continuation 형식. **33·2~3개·40px·null skip·el\|\|P·_ri**를69에 복제하면 틀림 |
|EC2-06 `c842acd1be41145af2fde40facc91665a9194102`|아니오|`native_ch2_beast_predator_policy.gd`: fresh P/HP·predicate/명령 부품 참조. 35/36/37 guard이며 실제 Player/World writer 없음 |
|EC3-01 `e710442907e0cbc0fba09520388195faa596a3c0`|예|`native_ch3_enemy_spawn_policy.gd`: 장별 selector·UTF-8 파일/binary64 oracle. guard10..13 |
|EC3-02 `fb8e80d03dfb7fa073ed9aaf1820bb86306b2c75`|예|`native_ch3_enemy_catalog_policy.gd`: catalog/초기 literal slice, Draws 재사용, complete_actor=false. guard10..13/40..49 |
|EC3-03 `01d036d43234f25a2bad28df5362ad4bb5781de9`|예|`native_ch3_enemy_phase_policy.gd`: cached d와현재위치 구분·같은tick 진입/해제·predicate 형식. 40 phase 전용. 65잠복에 무적을 가져오지 않음 |
|EC3-04 `113eb78d12f0ed88c8d24808d165fea1d0e419dc`|아니오|`native_ch3_enemy_guard_policy.gd`: 41 guard/slash·hurt 후 읽기 ref/JS int32 형식. 63의.3/non-DOT/정확위치는 별도, .5/42156 재사용0 |
|EC4-01 `61f3ad9cd862ade599a4dbf41f0a3c79ca604ce7`|예|`native_ch4_enemy_spawn_policy.gd`: EC5-01의 가장 가까운 main 템플릿. guard14..20/F1/총165/R36을21..25/D3/총151/R23과 구분 |
|EC4-02 `5134227018158de128567feb5abe47b9b3bc1726`|예|`native_ch4_enemy_catalog_policy.gd`: 23필드 segment·원literal순서·Draws/slice API를 실제 참조. CH5는 **6장 segment 뒤의30필드**, CH4의무조건angle을slice에 중복 삽입0 |

위 SHA는 git ancestry와 원격 ref로 대조했다. EC2-03→04→05→06은 미병합 체인이다. 원격 PC P2-008b 끝=`b406e4bc4c104ff42144c3222f7356858959873e`는 main 미포함이며, exact47/21 등의 검수·자연 admission은 PC 인수 대상이다. main factory의 현 상태를 그 원격 후보로 승격하지 않는다. EC3/4 후속 순서안·착수 merge만으로 구현 제출이 있다고 간주하지 않으며 표 밖 후속 구현은 **미확인**이다. 이번 문서는 미병합 제품에 런타임 의존하지 않는다. 향후 실제 preload/소비가 필요할 때 그때의 main 포함 여부를 다시 확인하고 승인된 선행 끝에서 분기/의존을 기록한다.

**분모:** CH5 일반 풀 **31종=0..19+60..69+47**, 총가중치151. CH1~4 기존 의존 **21종=0..19+47**, 신규 조사 **10종=60..69**. 20..46/48..59는 이 일반 풀에 없다. 47이 생성하는40, 69의64자식, 방 caller의64추가7~11, 조건부90..99, `ib=true/etype0` 아레나 보스와 별도 `_fb/_wm`은 서로 다른 축이다. 68/69의 “미니보스/스테이지보스” 명칭이 `ib`나24배HP를 설정하지 않는다. 이 분모는 모든 원소/정예/skin의 자연 스폰·실actor 지원률이 아니다.

## 1. 원본 행 전수 추적

### 1.1 5에리어·일반 유형/원소 선택

G16633–16712: hell4/startSi21/stages5. STG.monLv500은 표시 테이블이며 실제 생성 레벨은 G31125 플레이어/난이도/stage offset 식이다. demo 기본은si0 뒤 종료(G16645–16648/43896)하므로 정식5에리어 자연 도달·실행창 source 일치는 **미확인**이다.

|에리어|si / hellFloor|STG 표시 / 아레나 보스 이름|
|---|---|---|
|5-1|21/0|지옥 군단1구역 / 전쟁의 잔해|
|5-2|22/1|지옥 군단2구역 / 뼈산의 왕|
|5-3|23/2|지옥 군단3구역 / 악마 사령관|
|5-4|24/3|지옥 군단4구역 / 철벽 기사단장|
|5-5|25/4|지옥 군단5구역 / 군단 지휘관(isHellBoss=true)|

theme/boss 원소 D3. arena는G30782 `mkEn(...,0,true,STG[si].be,0)`이며69가 아니다. ib 보스 moveset/부활/arena/맵 좌표·굴 분모·RLE·클리어/다음장 전환은 기존 보스·맵·지역 소유자에 의존한다. 아래 R은G30991의 **선택 분류**이며 공통 후방 이동이나 근접 접촉 목록과 같지 않다.

|etype|가중치|R|기존 의존 / 전용 조사|
|---|---:|:---:|---|
|0|4||CH1 crawler exact·전체원소 admission 별도|
|1|2|R|CH1 hive·공통 탄|
|2|10||공통 근접·비활성 돌진 복원0|
|3|4||기존 type3 recipe/actor/binding|
|4|3||CH1 eye/spine/ice exact·다른원소 별도|
|5|6||공통 windup/탄·사망|
|6|3||공통 방패·호위·피격|
|7|7|R|기존 TP/type3 소환·M30|
|8|2|R|공통 공격·사망|
|9|1|R|공통 의식/부활|
|10|3||공통 은신|
|11|2||공통 소환·후방 유지, 선택R 아님|
|12|6||공통 광폭|
|13|2|R|공통 web|
|14|10||공통 비행·급강하|
|15|3||공통 사망분열|
|16|6|R|공통 trap|
|17|1|R|공통 etype13 소환|
|18|3||공통 흡혈·접촉|
|19|2||공통 slam|
|60|10||잡기/수역탄·사망수역|
|61|10||미끼flag→direct charge20|
|62|4||마비/전조 단일조준탄, 후방 이동에는 포함|
|63|8||방어70%/해제찍기·별도찍기|
|64|8||잡기·방추가group·69자식|
|65|10||잠복 무검사이동/출현잡기/이탈|
|66|2|R|고정형 가시3·전조파편3·사망8탄|
|67|6||노래/charge15/도주flag|
|68|2||charge25/꼬리/기생충3·사망6탄|
|69|1||HPphase/촉수/삼지창/흡입/64소환/해일·문지기|
|47|10||**기존 CH1/PC·CH2/3 의존**, clone40/TP 재구현0|

G30978–30979 원래31쌍 순서다. R 교집합=`[1,7,8,9,13,16,17,66]` **8종/가중치23**, 비R23종/128. G30993–31016: 첫U<.5면 R풀의 다음U×23/strict `<` 가중합, 아니면 전체151의float64 CDF를 최대12회 추첨해R기각, 전부실패시etype2. 소비2..13회. CDF는원래순서로각 weight/151을더한다. integer누적재정규화/균등31종/최종출현확률=표가중치로대체0. stage0 특수필터는CH5에서실행하지 않는다.

G30985/31017–31022: 첫U<.45면D3, 아니면 다음U×6 trunc로 `[P,F,I,D,L,H]`. 이상적 독립U 기준 **D=13/24(약54.1667%), 다른5원소 각11/120(약9.1667%), E=0**. EL은P0/F1/I2/D3/L4/H5/E6(G14333–14344); ETYPE_ERES는120×7 모두0. 심해명칭/파랑색 때문에 전투원소를 I로 고정하거나 D저항을 만들지 않는다. **굴은undefined, 문지기/호위는D, 69자식은e.el직접, 전용수역/해일은I, 산호/기생충/삼지창은P**다. caller를하나의분포로합치지 않는다.

### 1.2 catalog·HP식·생성 순서와 전용 필드

G30823–30920 literal. HP/ATK/poise/shield%는 **catalog**, 실제 actor수치가아니다. rawSPD는0이면0, 그외max(.2,raw×1.3) 후 생성jitter가붙는다.

|etype / 이름|HP/ATK|raw SPD|r/poise/shield%|range|색|
|---|---|---:|---|---:|---|
|60 심해 보행자|48/12|.18|10/18/0|400|#223344|
|61 아귀 악마|58/24|.09|15/25/70|400|#334455|
|62 해파리 사도|19/10|.24|10/8/0|800|#5566aa|
|63 갑각 괴물|80/18|.21|15/35/0|400|#445533|
|64 익사자 떼|10/2|.15|10/3/0|200|#2a3a4a|
|65 장어 사도|26/14|.54|10/10/0|600|#99bb88|
|66 산호 괴물|96/12|0|20/45/80|600|#885566|
|67 인어 사도|32/18|.45|10/12/0|800|#446655|
|68 심해 거대어|160/24|.24|25/50/0|1000|#112233|
|69 심연의 대사도|256/36|.21|30/70/0|1000|#0a1122|

G31119–31364 공통constructor는CH1/CH2 추적·EC2-02 provider 경계를 참조한다. finite좌표→canMv/safePt→레벨→elite/mods→speed/r RNG→수치→원래object literal순서→skin→return다. 원연산은다음과같다.

- `L=max(1,(P.lv||1)+(DIFF_LV_OFF[OPT.diff]||0)+(G._stageDiffOff||0))`.
- `B=(L<=500?.4*L*L*L+199*L+100:50000000*pow(1.0014,L-500))*2.925`; `pacing=1/(1+min(9,max(0,L-1))/18)`.
- non-ib `HP=floor(floor(B*pacing*dm*tier.hpMul)*(1+si*.02))`; `ATK=floor((50+L*1.95)*.6*dm*tier.atkMul)`. dm/offset표는G9272–9277. catalogHP48/256나STG500를식에대입하지않고, 68/69명칭만으로ib의24배를적용하지않는다.
- `speed=(mappedSPD+U*.08)*1.5`→M02이면×1.5. `r=(catalogR+U*2)*2*tier.scaleMul`. **66도jitter0..(.12미만)**가있다. poise/maxPoise/eShield/eShieldMax는생성HP(G31164/31184)이며61/66의catalog70/80%가아니다.

원문식산술관측L1/dm1/tier0: si21 HP1242/ATK31, si25 HP1312/ATK31. 동일식24표본(L1/500/501×si21/25×4tier)은L/source-selection-goldens.json. 전체constructor/난이도/실제전투 검증은아니다.

**60..69는모두 `_noProjEtypes`에없다**(G31154–31160). 공통projCd240, M02면trunc×.85=204 후tier1/2/3이면trunc×.8/.7/.6. M02없을때192/168/144, 있을때163/142/122. 초기projT=180+120U, 전용Cd와별개다. CH4 9999제외표를CH5까지늘리면원문과달라진다. 전용AI가common idle을벗어나면그tick common자동탄분기는건너뛸수있다.

G31326–31335의 **30필드 segment**. 원literal은CH3→CH4→**6장**→**5장**→7장순서다. EC5-02는 `_dragonMeteorCd`(31323) 뒤의다음segment만 projection하고, `_ppRushCd`(31337)부터는호출자소유다. 그전에있는무조건 `_bossOrbitAng`·`_erraticAng`와facing/aura/projT RNG를slice앞으로당기거나삭제/중복소비하지않는다.

|etype / G행|전용 초기 상태·timer(각U는별도, tick)|
|---|---|
|60·64 /31326|모든type `_seaGrabT=0`; 두type `_seaGrabCd=120+40U`, 나머지9999. GrabT는이후읽기0 |
|60 /31327|`_seaSpitCd=180+60U` |
|61 /31328|`_anglerLure=true`(그외false), 모든type `_anglerCharging=false`, `_anglerLureCd=200+80U`. Lure는이후읽기0 |
|62 /31329|`_jellyParaCd=100+40U`→`_jellyZapCd=180+60U` |
|63 /31330|모든type `_crabGuard=false`→`_crabGuardT=0`; `_crabGuardCd=80+30U`→`_crabSlamCd=150+50U` |
|65 /31331|모든type `_eelBurrowed=false`; `_eelBurrowCd=100+40U`; 모든type `_eelBurrowT=0`→`_eelGrabT=0` |
|66 /31332|`_coralSpikeCd=120+40U`→`_coralProjCd=200+60U` |
|67 /31333|`_sirenSongCd=150+50U`→`_sirenDashCd=100+40U`; 모든type `_sirenFlee=false` |
|68 /31334|`_levChargeCd=180+60U`→`_levTailCd=250+80U`→`_levParaCd=300+80U` |
|69 /31335|`_abyssPhase=0`(그외−1)→`_abyssTentCd=120+40U`→`_abyssTridCd=200+60U`→`_abyssWhirlCd=300+80U`→`_abyssSumCd=400+100U`→`_abyssTideCd=500+100U` |

해당type가아닌전용Cd는9999다. slice내소비수는60..69순서 **2/1/2/2/1/1/2/2/3/5**. 별도Player필드 `_seaGrabbed/_seaParalyzed/_trapSlowT`, pooled projectile `_seaSlow/_coralSpike`는이30필드에포함하지않는다. `room`/`_ri`, 부재undefined/명시null/원소P0를자동대체하지않는다.

### 1.3 5장 전용 AI — 47/0..19는 기존 의존

공통prefix(G38584–38884)의벽밀기/KB·피격경직/스턴/빙결return·거리/추적·ATKreset/mods·projCharge·st2감소뒤전용block이다. **각outer `etype && s==='idle'`는한번**판정하며내부독립if는state가바뀌어도계속실행한다. cached `d`는원문이명시해다시계산한곳외에는갱신하지않는다. 이후common switch는최종현재state를소비한다. 전용block관측은전체updateE의실효이동/피해검증이아니다.

|etype / G행|정확한전용분기·후속소비|
|---|---|
|60 /39812–39825|양Cd는>0일때만−sp. d<30+r·grabCd≤0·P.iframes≤0·P.s≠charge면 **P._seaGrabbed=120 직접대입**, Cd=120+40U→hurtP(trunc(atk*.5))→표시/음. 기존200도120으로줄수있다. 독립spitCd≤0·30<d<150이면Cd=180+60U/eShootWind60/chargeElI. callback현재P각→중심좌표속도2.5/rawtrunc(atk*.3)/I/life=ml120/#446688/sz3/_seaSlow=true요청. 부채꼴/전용지속DOT가아닌단일조준탄이며잡기와같은tick실행가능 |
|61 /39827–39841|lureCd>0만−sp. !charging·Cd≤0·60<d<1200이면charging=true/Cd=200+80U/빛text. **뒤독립charging분기**에서d<80이면directeCharge20·현재facing벡터/charging=false. 따라서60<d<80은진입tick즉시돌진. `_anglerLure`읽기/미끼실물/전용감속접근/삼키기피해없음. _chgSpd/Dur/Len/AimMax새쓰기없음 |
|62 /39843–39857|두Cd>0만−sp. d<40+r·paraCd≤0·iframes≤0·P.s≠charge면P._seaParalyzed=60 직접대입/Cd=100+40U/표시·groggy, 직접hurt없음. 뒤독립zapCd≤0·d<100이면Cd=180+60U/eShootWind60/chargeEl=e.el. callback현재P각eProjAt(4,.8,e.el,60,#aabbff,2) **1요청**+방전표시/8입자. 원형범위8hit가아님 |
|63 /39859–39879|guardCd/slamCd>0만−sp, guardT>0만−sp가**진입검사보다먼저**. !guard·guardCd≤0·d<120이면guard=true/T90/Cd=80+30U. 뒤guard·T≤0이면false, d<50+r이면hurtP(trunc(atk*1.5))후**현재P각**KB10/표시. 뒤독립!guard·slamCd≤0·같은거리면Cd=150+50U/hurtP(trunc(atk*1.2))/표시. **두hurt요청가능**, outer iframe/charge검사없음. 첫hurt가iframes를써도둘째요청은생략안함. 실제거절/재진입은Player권위 |
|64 /39881–39887|grabCd>0만−sp. d<25+r·Cd≤0·iframes≤0·P.s≠charge면P._seaGrabbed=max(기존\|\|0,90)/Cd=120+40U/hurtP(trunc(atk*.3))/표시. 60의직접120대입과구분. block자체group생성없음 |
|65 /39889–39910|burrowCd/grabT>0만−sp. !burrowed·Cd≤0·60<d<1200이면true/T80/표시. **같은tick**burrowed분기T−sp→현재P각으로2.5sp **canMv없이직접xy이동**. T≤0또는이동후dst<30이면false/Cd=100+40U, 이동후dst<35+P.r이면grabT60/P.grab=max(기존\|\|0,60)/hurtP(trunc(atk))/표시. 뒤독립0<grabT<10이면현재P반대3sp/canMv이동. **숨음면역hurtEreturn없음**, common추적/이동전체를중지하지않음. 별도 `_worms` 곰치와다름 |
|66 /39912–39927|두Cd>0만−sp. spikeCd≤0이면**거리조건없이**Cd=120+40U→3회각τ*i/3+.5U/거리30+40U→중심주변정지P/rawtrunc(atk*.4)/life=ml360/#885566/sz2/_coralSpike=true. 각spawn호출의내부부작용뒤다음각/거리RNG. 독립projCd≤0·d<1200이면Cd=200+60U/eShootWind60/P. callback현재P각−.3/0/+.3 eProjAt(3,.6,P,200,#aa6677,1.5). 전용damagezone관측과commonprefix이동은별도 |
|67 /39929–39949|song/dashCd>0만−sp. song≤0·d<1200이면Cd=150+50U/P._trapSlowT=max(기존\|\|0,trunc(180*(1-min(.5,slowRes))))/표시. 별도dash≤0·30<d<120이면directcharge15/현재facing/다음Cd=100+40U/소리/flee=true. 뒤**같은tick**flee·d<100이면현재P반대speed×2×sp/canMv이동. 안쪽 d>180의 false 대입은 같은 cached d에서 도달 불가능하다. 해제조건을밖으로옮기거나후속거리재계산0 |
|68 /39951–39973|3Cd>0만−sp. charge≤0·60<d<1200이면directcharge25/facing/Cd=180+60U. 독립tail≤0·d<80이면Cd=250+80U, iframes≤0일때hurtP(trunc(atk*1.2))뒤현재P각KB15. 꼬리표시/흔들림/10입자는iframe무관. 후방부채꼴angle검사없음. 독립para≤0·d<1200이면Cd=300+80U/**상태를eShootWind60/P로덮음**. callback현재P각−.25/0/+.25 eProjAt(2.5,.6,P,250,#556677,2). 조건동시충족시실charge없이전조가남을수있음 |
|69 /39975–40022|5Cd>0만−sp. hp<mhp*.6·phase0→1, 뒤hp<mhp*.3·phase1→2이므로한tick0→2가능. 촉수→삼지창→소용돌이→소환→해일순서; **phase별택1이아님**. 상세는아래표. “스테이지보스”주석과달리일반선택/문지기는ib=false |

|69의순서 / G행|정확조건·원연산|
|---|---|
|39979–39981 phase|strict .6/.3, 각각text/groggy(현재dst<800)/shake12·15. threshold를넘은현재phase를 `_aP`에1회고정 |
|39983–39992 촉수|tentCd≤0·cached d<80이면Cd=120+40U−20phase. hits=3+phase, τ*i/hits의중심거리50점마다현재P와dst<40·**그때현재iframes≤0**일때hurtP(trunc(atk*.4)). 각hurt/입자뒤다음점계산. full3~5hit확정아님, 같은tick동기Player readback필수 |
|39994–39998 삼지창|tridCd≤0·d<1200이면Cd=200+60U−30phase/eShootWind60/P. callback현재P각/중심속도5/rawtrunc(atk*2)/P/life=ml150/#889999/sz3/**pierce=true**. 물리입E분류, 속도band제외를일반빨콩과구분 |
|40000–40006 소용돌이|phase≥1·whirlCd≤0·d<1200이면Cd=300+80U−40phase/표시소리, d>30이면그시점P→actor각KB+=12. **iframes/charge제외없음**, 12입자. 지속힘/거리재평가tick을새로만들지않음 |
|40008–40015 소환|phase≥1·sumCd≤0·**ens.length<200 1회**; Cd=400+100U−60phase를먼저추첨. count=2+phase(3또는4), 매회현재e.xy+(U−.5)*80의x/y→canMv(...,6)→참이면 `ens.push(mkEn(...,G.stage,64,false,e.el,e.room))`. null검사없음/HP축소·mods제거없음/거리조건없음. 199에서4등록시203가능. constructor와등록뒤다음xy RNG, 마지막연출 |
|40017–40021 해일|phase≥2·tideCd≤0이면**거리조건없이**Cd=500+100U/eShootWind60/I/`_swFire`재대입. 앞삼지창예약을덮고뒤에1개callback만남음. callback현재P각+(i−6)*.12, i0..11(**−.72..+.60 비대칭**) eProjAt(2,1.5,I,250,#223355,4), text/소리/흔들림 |

콜백은 예약 당시 P/ATK를 고정하지 않고 실행 시 현재 값을 읽는다. 60/62/66/68/69의 callback 실행/취소·생존 수명은 공통 상태 소유자에 의존한다. Timer는non-idle에서전용감소0이며pause/stun/큰sp의벽시계동등성은미확인이다. 위표의 `hurtP`는**요청지점**, 실제Player가피해를받았다는뜻이아니다. hurtP는반사/가시등으로hurtE에재진입할수있으므로63/68의hurt뒤KB각도·69의다음hit조건/소환context를미리동결하지않는다.

### 1.4 탄·공통 FSM·Player 상태·피격·표시

|G행 / 경로|CH5에필요한공통계약·기존의존|
|---|---|
|38584–38884,40456–40518|range기반alerted prefix이동→전용AI→commonidle이동/분리력순서. 62는common후방유지,66은commonidle추격만예외. **66의raw0도jitter/prefix후퇴/분리력까지정지보증아님**. 60..69는_meleeET에전부없음. 별도.8접촉피해추가0. 전용AI중65이동/67도주뒤common추적이겹칠수있음 |
|31725–31741|화톳불 안전거리 helper는65의몸체clearance를r×1.6으로계산하고 minD=bf.r+clearance 밖으로투영/안쪽KB성분제거. 65전용잠복이동의canMv부재와별개인공통안전권위이며다른곰치의고정75px를복제하지않음 |
|40519–40538,40559|61/67/68directeCharge는20/15/25로진입하고기존_chgSpd\|\|5사용, 90전조42px/f동물형22/30/43으로대체0. commoncanMv/스윕/iframes→패링또는비charge hurtP(trunc(atk×30×elMul))/eModHitP·KB100/recover30. eShootWind종료시현재callback1개실행→null/chargeElnull/idle. 공통clock·피해writer중복0 |
|32158,33007,33019–33041,33127,33749,34114,34336–34343|Playergrab>0이면−sp/KB×.1, paralysis>0이면−sp/KB×.05. 일반보행구간`_seaMul=(grab>0또는para>0)?0:(hell4?.7:1)`, web/trap/freezeslow는별도 .5곱. grab은해당보행0이며모든스킬차단증거아님; para는일반행동chain/여러bladeDash소비도차단. **grab지속피해/연타탈출 literal경로없음**, 모든PlayerFSM상태의실효차단은미확인 |
|16858–16886,16911–16921,16940–17003|pooled `_seaSlow/_coralSpike`초기화/재사용reset. 이동 `_spawnBossProjectile`는non-ib warning/commit 경유, 정지는 spawnProj 직행. coralSpike는forbidden패링/속도band제외. pierce도속도band·자동P빨콩변환제외지만P입은physical/E. 이동탄size×2/r×1.3·damage×2/후속red반감·속도정규화는기존owner한번처리 |
|20049–20094,20119|eProjAt life×1.5 trunc/입offset `ang\|\|facing`보존. 전조안62/66/68/69해일은bean변환우회로요청계수그대로·요청life60→90,200→300,250→375. 사망eProjAt는밖에서P/I bean의dmgM1.2등을거침. 사망 당시 s가여전히eShootWind이면그상태분기가적용되므로항상bean변환된다고단정하지않음. 현재상태/원소일치전조끝이면commit, 그밖이동탄은60tickwarning/사망좌표고정·world교체취소. rawpacket을최종피해로읽지않음 |
|20122–20155,40505–40518|공통자동탄은60tick차징끝현재P재조준/facing갱신, life=trunc(ETYPE_RANGE*.3). CH5자연분기는D dark(3.3,rawatk×1)/F fire(3.2,×1.2)/I water(3.2,×1.2)/나머지normal(3,×.8,e.el), 모두 _commit. black/red/special분기정의가있어도이자동선택의자연값은dark/fire/water/normal이다. 60..69전용공격과별도이며최종속도·피해·분류는공통spawnProj소유 |
|34655–34667,34710–34712|정지coralSpike는일반거리소멸예외. `_seaSlow`는현재Player거리<25·iframes≤0일때trapSlowT=max(기존\|\|0,3), 매접촉갱신·후속일반루프계속. coralSpike는거리<20·iframes≤0·U<.1sp일때_hurtProjectilePlayer(p,p.dmg)/표시. 고정tickRate/매frame확정hit로대체0, charge를outer가제외하지않음 |
|42130–42203,42500–43118|63guard·!isDot이면**42175의위치에서**dmg=trunc(dmg*.3). phase/curlreturn·bluebean최소10%뒤, 저항뒤/정예M14·aura·shield/HP앞. DOT는이.3을안거침. 65burrow의전용무적return없음. 공통hit/death/revive/poise/shieldwriter우회0 |
|42945–42961|공통non-ib/non-decoy·el≠P·(elite≥1또는U<.2) 원소deathzone: rawtrunc(atk*.25)/tier≥2 size10/life360 그외7/240. D/F/L poisonZone tickRate40/35/30, I는dmg0 iceZone, H/undefined는gate RNG를써도해당zone없음. 60수역/66산호고유death와둘다실행가능 |
|21382–21391,53859–53864,53975–54019|proceduralbody10case,62광/63guard링/65잠복표시/66radius35링/68·69오라. 65에별도alpha원표시가있다는것과hurt면역은다름. rendercase는nativeactor지원증거아님. 실아틀라스/애니·VFX가독성미확인 |
|23292–23308,24724–24790,32079–32091|non-ibskin은장과무관한 `_mobCh=1`/40스킨·etype/homeX seed. 206스킨순환아님. 사망분류60/65/67=HUMANOID,61/62/68=ARMOR,63/64=BEAST,66=GHOST,69=MAGIC. 60..69는_UNDEAD_ET없음. 군단/익사자명칭으로언데드신성력rule추가0 |

전체공통탄/피격/이동본문은CH1/CH2/CH3/CH4 추적·ELITES에위임한다. 위 접점만으로공통소비자를재구현하지않는다. G38577–38579 atkTicketRequest는항상true인기존경로이며티켓제한재도입0. Q/E·blackBean Q전용magic·blue반사/기존공격보호계약은불변이다.

### 1.5 생성 caller·64 추가/소환·전용 사망·지역 연동

|G행|caller·CH5차이·등록경계|
|---|---|
|31366–31386|formation:6 1~2+[1,7,8] 2~3/동일el. CH5에고유64group을자동부착하지않음 |
|31389–31455|spawnRoomEns는rollEl→formation판정→rollEtype→99 .005(스테이지1회)→else .05의90..98교체→본체mkEn/null검사등록. **etype64이면그뒤**추가 count=7+trunc(5U), 각현재 ex/ey±20의 xy→canMv(...,6)true시 ens.push(mkEn(...,64,false,el,ri)). 추가childnull검사없음, 본체실패해도추가 loop존재. 8~12는시도상한이며실출현보증아님 |
|31458–31515,31575–31607|tileRLE/복도caller에는64추가group없음. initStage는RLE면room/corridor/최소80채움을건너뜀. **각CH5맵의실제RLE선택/초기named자연도달은미확인**, 함수정의만으로8~12떼가자연생성됐다고단정0 |
|31612–31655|조건부문지기=[29,39,49,59,**69**,79,89][hell4],D3/ib=false. tile0후보통과시 mkEn→HP/mhp×4,atk/baseAtk×2,rtrunc×1.4,poise/max80,elite3,dropTier4/_isGateGuard. mods/aura/shield/projCd재계산없음. 호위4~6은rollEtype/D뒤elite1·HP×2.5만; 외곽8~12는rollEtype/rollEl. 5맵모두실문지기존재는미확인 |
|31029–31030,35636–35693|굴S50/M100/L100,si0할인없음. frame120후거리<2000trigger→90delay→간격/곡선·살아있는700cap대기→좌표최대30시도/나선/중심fallback→`mkEn(rollEtype(si),false,undefined,h.room)`. 실패도_spawned증가, 성공reviveIframes15/등록. rollEl/rare교체/64group삽입0 |
|35702–35717|riftPool=[0,2,4,6,10,12,14,19]/el미지정. 후대입elite3(si21..25),HP×(2+.05si),ATK×1.5,speedmin(×1.2,1.5),rmin(×1.15,24)/등록. 등급을다시추첨하거나69를pool에넣지않음 |
|40008–40015|69→64는§1.3의phase에따른3/4개·**사전lengthcap2001회/거리무관/범위±40/room/e.el직접/null그대로push**. 방추가7~11과다르고, EC2-05의33/nullskip/_ri나CH4의50을가져오지않음. 동기mkEn·등록·그부작용뒤다음xy추첨. 실null전파/실registry는미확인 |
|42919–42923|60death:τ*i/3 3점/중심 거리12의 정지I/rawdmg0/life=ml300/#334466/sz2.5/_seaSlow. 정지이므로60tick이동탄warning경로아님. text/parts8뒤 , 공통원소deathzone계속 |
|42925–42929|66death:τ*i/8의 8요청eProjAt(3,.5,P,120,#aa6677,1.5)/text/parts15/shake5. 고유coralSpikeflag없음, 생존가시3과다름 |
|42931–42936|68death:τ*i/6의 6요청eProjAt(2.5,.4,P,200,#556677,1.5). hitStop max(trunc10×OPT/100), _noHitStopT>0이면생략, shake10/parts20. 자식64생성없음 |
|42938–42944|69death:τ*i/12의 12요청eProjAt(2,.6,I,200,#223355,3). hitStop15조건동일, shake15/flash8 #223355/chroma6/parts25+20. 생존해일12의각도·계수·life와같지않음. 실arena보스완료/부활계약을이명칭에붙이지않음 |
|38920–39048,39408–39429,40777–40814|공통7/11→3,17→13,ib소환[0,2,3,3,3], 47clone40은e.el\|\|D/e._ri/HP30%·shield0/ATK50%이며push없음. 기존CH1~3담당의존, 69→64의room/null/등록을통일0 |
|38778–38797,38842–38870,43050–43054|M06/M08/type3, M16동일etype, type15deathsplit은정예/공통권위. CH5신규해금M28의미끼·별도구울/정예부활도고유64소환과구분 |
|60688–60793,41868–41957,43896|지역분모=사분면굴예산, kill=_homeX/Y우선·ib제외(G60728–60731), gate10%/4지역clear→unlock. CH5fbIdx=-1. 64동적childkill과고정total관계는P3-003/맵후속인수, child수를분모에임의가산0. 다음stage26전환은Main/보스/맵권위 |

G42702의일반최종death/kill·region→공통시체/전염/문지기→고유CH5death→공통원소zone순서다. 61/62/63/64/65/67의별도CH5death if는검색되지않았다. 다른직접kill경로까지항상같은death후처리를호출한다고단정0. 별도 `_fbTick/_hmTick` stage0밖clear와 `_wmTick`(G32145,61203–61327)은기존추적참조만하며65장어와중복구현0.

### 1.6 정예·네임드·표시의 5장 차이

|G행|hell4계약 / 기존ELITES의존|
|---|---|
|31033–31070|일반69%/매직18%/레어10%/챔피언3%. U1회strict<.03→3, <.03+.10→2, <.03+.10+.18→1, 나머지0. ib/named90..99는tier0·등급RNG생략 |
|31044–31081|**27mods=M01..20+M26+M27+M28+M29..32**. CH4대비신규M17/18/19/20/28, M21정의없음. M17전격반사피격동작은G42178비활성, 정의/해금을작동중반사로오인0. tier1/2공격mod1개, tier3공격mod2개먼저후비공격slot. M28은G38842–38870의미끼공통경로 |
|31083–31097,34394–34411|tier≥2의warCry/healing/haste/guardian4개, CH4대비신규오라0. 실ATK/방어·정예동작은ELITES소유 |
|31389–31515,40250–40448,42962–43043|조건부named90..99, tier2“레어”와별개. etype61아귀≠별도필드앵글러, 65장어≠_worms, 69일반/문지기≠ib아레나. 자연도달/별도AI·보상은기존추적 |
|53975–54019|정예불꽃/이름/오라표시와전용guard/잠복표시를기존renderer가소비. 27+4해금을전체31mods/실화면지원완료로세지않음 |

### 1.7 index·저장·수명 경계

I1–4742에는etype/HELL_SPAWN/위30필드/_seaGrabbed/_seaParalyzed/_seaSlow/_coralSpike literal참조0(L/index-census.json). 이는로비에서이필드를직접다루지않는정적관측이며간접연계전체부재증명은아니다. G30149–30215zone복원은etype로mkEn재생성후일부수치만복원, G61993–62163/63892–64093은기존SAVEwhitelist다. 전용Cd/phase/grab/pooledflags를새저장키로추가하지않는다. 31567/63456의기존reset열을확장하지않고, stage재시작/zone전환/Player사망후해당수명은실제owner검수전**미확인**으로남긴다.

## 2. docs 불일치 표

`docs/8.0몬스터디자인/`와`docs/9적ai패턴디자인/`전체를검색하고총관리/공격/분배/사운드/탄막/팀마스터/AI파이프라인의관련구간을대조했다. 기존설계문서는이번0줄, 옛설계목표·내부주석과현재실행식을구분한다.

|docs위치|기록|최신G근거 / 판정|
|---|---|---|
|몬스터_총관리.md:156,448–458,751 대1000–1047|정정/정의는5장60..69, 상세제목“6장사도의마굴”|G16638/30979는hell4/si21..25. **상세제목잔존**, etype/장재배정0 |
|스테이지_몹분배.md:17,32,42|206군단/언데드/악마풀, 스킨순차전부등장|G30979논리31풀, G23292–23308ch1/40스킨seed. **시각/논리분모분리**. G24729_UNDEAD_ET에60..69없음 |
|같은문서:56|5_1~5_5보스미배치|G16691/16700–16712의5이름/STG, 30782arena생성존재. **옛배치표**, 실보스이식은별도 |
|총관리:1038–1047/공격:393–402|catalogHP/ATK/rawSPD/range|catalog대부분일치, G31125–31184생성curve/poise·shieldHP와구분. **64r은docs8 대G30859–30868의10**, speed최소.2/jitter·크기×2가추가됨 |
|총관리:449,1038/공격:393|60잡기2초고정·물뿜기, 주석39814지속데미지/39819부채꼴|G39815–39824는grab120직접대입·그때1회hurt와 단일I탄. G33019–33041에전용grabDOT/연타탈출없음. **보행차단과모든행동차단구분**, 120tick=실벽시계2초보장아님 |
|총관리:450,1039/공격:394|61미끼유인+삼키기|G39829–39839는 flag/text→directcharge20, 동tick가능. **미끼실물/접근감속·별도삼키기피해근거없음**, commoncharge소비 |
|총관리:451,1040/공격:395|62부유/1초마비/전기방전|G39846의 para60와 G33041차단은있음, 39854는 1조준탄+8입자. **광역8hit아님**, 부유실애니미확인 |
|총관리:452,1041/공격:396|63집게방어70%·찍기|G42175는 **non-DOT만.3**, G39867–39877는 해제1.5요청뒤독립1.2요청가능. **전체피해일률70%아님/한번공격으로합치지않음** |
|총관리:453,1042/공격:397|64 8~12마리|G31446–31452의 room추가7~11시도는일치, 굴/RLE/69소환에는없음. **모든caller떼보장으로읽으면불일치** |
|총관리:454,1043/공격:398|65잠복/출현|G39895–39901은canMv없는2.5sp접근→freshdst잡기, hurtE전용면역없음. **잠복=무적/모든이동정지로확장근거없음** |
|총관리:455,1044/공격:399|66고정+가시지대|G30858/31138jitter, 38690–38704prefix/40500분리력존재. **완전고정주장불가**. G39917 3정지packet·34712확률.1sp, 고정tick장판과다름 |
|총관리:456,1045/공격:400|67감속50%·할퀴기/도주|G39934기간은slowRes반영, 33022의.5는slow강도. G39944의 d<100안39947d>180은**같은cachedd에서불가능**. 해제수리/거리재계산0 |
|총관리:457–458,1046–1047/공격:401–402|68/69미니보스, 주석68꼬리후방부채꼴/69보스|G39959는d<80만/후방각조건없음. 68charge가 후속para로 덮임, 69threshold둘/삼지창→해일덮기. **ib/24배/단일patternphase아님** |
|사운드:524–533|60/65/67 HUMANOID 등과die_human/death_heavy키|G24724–24790집합분류는일치, 현행key는human=death_humanoid풀, BEAST=death_beast풀. **구카탈로그key를실재생이름으로단정0**, 실청취미확인 |
|공격:493–494,516,629/탄막:786,830|60/62/66/68/69전조, P삼지창E, pierce/coral속도제외|해당선언은G16917–16968/20065/40559와일치. **불일치로부풀리지않음**. 전조원소P/I와 actor.e.el은구분 |
|9_적AI패턴디자인.md:202–215,269–276|티켓최대3, 동물형90전조3종|G38577–38579항상true. 90전조는22/30/43만이며61/67/68은direct20/15/25. **티켓복원/CH5전조확장0** |

정적일치가실외형/animation/VFX/음질·가독성인수를대신하지않는다. 원문잠재결함/부정확주석을원본과다른“정상설계”로수정하지않았다.

## 3. Godot 의존과 빠진 것

|현재실제파일·의존|이미있는것|CH5에서빠진것 / 소유경계|
|---|---|---|
|enemy_factory.gd:25–26/60–61/638, test_encounter_factory.gd:16|CH1stage0/time0/schema/known29types·exact9/16profile|60..69는KNOWN_ETYPES없음, CH5admission/전용actor없음. 0..19/47도모든원소·skin·정예지원아님. PC미병합후보로지원숫자승격0 |
|main EC2-01/02·EC3-01/02·EC4-01/02|장별selector/catalog, Draws·수치provider 검증|CH5stage/31풀/D3/30필드없음. 기존guard풀기/HPauthority복제0, 신규 장별 leaf만 |
|main EC3-03, 미병합EC3-04|phase/guard 순수 명령·cachedd/현재xy/후속read, JSint32형식|65에는phase면역없고63은guard90/.3/non-DOT/다른순서. 한개체전체hurtE/일반actor소비자없음 |
|미병합EC2-03..06|emission·clock/trigger 분리, constructor동기재개, freshcallback/Pread|CH5grab/paralysis/seaSlow/coralSpike/3~4child와hurt후조건의실writer없음. API형식만참조, 미병합파일무단반입0 |
|enemy_mod_m29.gd / native_m30_modifier.gd|기존charge/전조/ownerlock부품|61/67/68directstate20/15/25·동tick덮기/67도주동시소비admission없음. 42속도/90전조를임의설정0 |
|native_normal_enemy_hurte.gd:20 / native_source_normal_enemy_fields.gd / native_dedicated_enemy_hurte_owner.gd|엄격한sourcefield/HP·poise/shield권위, **63은SPECIAL_HIT_ETYPES의정지대상**|63guard분기단순data존재는지원아님. 60..69전용death/revive/보상consumer없음, 직접NodeHPsetter우회0 |
|native_element_projectile_emitter.gd / enemy_projectile*.gd / warningowner|기존P/F/I/D/L/H부품·common발사|60seaSlow/Ipacket·66stationarycoral/확률hit·69pierce/E/해일덮기·사망warning/정규화의CH5동등성없음. 6원소부품존재≠완성 |
|type3_spawn_recipe.gd / type3_summoned_actor.gd / type3_native_binding.gd·47의기존owner|공통3자식/원소/일부TP|69child는64, room/직접el/nullpush·동기constructor/registry권위필요. type3/33으로대체0. 47clone40은기존의존 |
|native_spawn_hole_system.gd:37/62/65/476 / native_regions.gd|stage0굴·CH1풀/동적등록, 지역kill/분모|RANGED전역에66이있어도CH5풀/admission이아님. 5맵굴/문지기69/64동적kill와 고정분모/undefined원소소비인수없음 |
|player.gd / world.gd / main.gd / State·saveadapter|실RNG/공간query/이동/피해/입력·영속권위|grab/para/TRAPslow·hell4보행.7, hurt뒤 currentP/iframereadback, 69동기birth·callback수명/구역전환연결은별도배정. 순수leaf를실연결완료로보고0 |

기준main에서CH5전용enemy policy/actor파일은발견하지못했다. 순수정책완성뒤에도actoradmission/등록·RNG흐름·메타/저장·5에리어자연플레이는별도인수다.

## 4. 작은 이식 단위 순서안

공용0줄의새계산leaf부터시작하고실연결은마지막별도통합배정으로분리한다. 아래는이번제품구현승인이아닌후속배정안이다. 실RNG/HP/피해/입력/registry의새owner를만들지않는다.

### 4.1 1번 EC5-01 — 5장 유형·원소 선택 순수 정책 (구현 지시서)

**산출범위:** 새 `godot/scripts/native_ch5_enemy_spawn_policy.gd`·`godot/tests/test_ch5_enemy_spawn_policy.gd`와각자UID2, `docs/engine/orders/reports/ec5-01_REPORT.md`·CHANGELOG_SYNC자기절. 기존selector/공용/타담당/원본/저장0줄. main **EC4-01의API/진단/원연산/파일oracle을기준**으로EC3-01/EC2-01과같은장별leaf를쓴다. selector범용추출/기존stageguard확장은공용변경이므로하지않는다.

1. RefCounted `pick_etype(stage:int,random_unit:Callable)->Dictionary` / `pick_element(stage:int,random_unit:Callable)->Dictionary`. **stage21..25만**허용. 그외0draw NOT_READY(unsupported_stage), 유효Callable없으면0draw NOT_READY(invalid_random_callable). guard순서는stage→callable→sample. 자체randf/seed/실RNG/State/actorowner없음.
2. §1.1의POOL31쌍을**원순서그대로**, R8/가중합23, 전체151/비R128로보관/검사. G30969–31022의 HELL_SPAWN[4]/_RANGED_ET/_HELL_CDF/rollEtype/rollEl **현재원문으로golden생성**. GDS기대상수끼리만대조0.
3. 첫U<.5→R의다음U×23/strict누적, 첫U≥.5→원래float64CDF/reject최대12→fallback2/13draw. **integer누적CDF로교체금지**. 모든거절draw를소비수에포함, 실패후rewind0. 전역R분류중pool밖type을잘못끌어오지않음.
4. 원소첫U<.45→D3/1draw, 아니면둘째U×6 trunc→P0/F1/I2/D3/L4/H5/2draw. EC4의F1을남기지않음. 굴undefined/GateD/전용I·Ppacket/child직접el은caller계약이며selector에넣지않는다.
5. READY=`status,value:int,draws:int`, NOT_READY=`status,reason,draws`/value없음. sample bool/null/string/Array/Dictionary/NaN/±Inf/음수/1이상은보정·재추첨없이현재잘못읽은1회를포함해NOT_READY(invalid_random_sample). int0정상. 이미소비한정상앞부분을되감거나다음sentinel을읽지않음.
6. 전체gameSHA와roll함수/풀/pin을현재main에서확인. Node실행파일절대경로는필수인자 **`--node-bin`**, source경로도명시인자. Node가새임시파일에UTF-8 JSON을써Godot가읽고삭제. OS.execute출력은**join한진단만**사용, output[0]/콘솔decode/oraclestdout파싱의존0. binary64/base64운반과nextafter경계를mainEC4검사형식대로사용. acorn는 lockfile에맞춰자기worktree/승인된readonlydependency로준비, R0설치변경0.
7. 새격리명 **`EXODUSER-ec5-01-Isolated-20261020`**, 기존회귀는각파일상수의격리명. override.cfg는실행마다설정하고종료시0byte. 모든Godot전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2이상이면30초씩대기/재조회. 이번추적작업은Godot0이며이는미래구현자검증지시다.

|기본golden (각si21..25, 총45표본)|원문결과 / 소비|
|---|---|
|type [0,0] / [0,2/23] / [0,.999999]|1/2, 7/2, 66/2|
|type [.5,0] / [.5,4.5/151을12번]|0/2, fallback2/13|
|element [.449999] / [.45,0] / [.45,1/6] / [.45,.999999]|D3/1, P0/2, F1/2, H5/2|

**검증범위:** R정수누적8경계·원CDF31경계의직전/동일/직후binary64, 0/.5/1직전, .45strict, 0..11회R기각후비R성공·12연속R→2/13draw. stage20/21/25/26, invalidcallable/각위치invalidsample, 입력불변/실제소비열/뒤sentinel과다음호출까지원문VM과대조. 평균확률/허용오차만으로경계검사를대체0. 각실패case를삭제하거나가짜PASS로보고0.

**회귀:** main `test_ch4_enemy_spawn_policy`/`test_ch4_enemy_catalog_policy`, `test_ch3_enemy_spawn_policy`/`test_ch3_enemy_catalog_policy`/`test_ch3_enemy_phase_policy`, `test_ch2_enemy_spawn_policy`/`test_ch2_enemy_constructor_policy`, `test_encounter_factory`, `test_contracts`. 착수 시인수main에추가된selector도 회귀, 미병합코드전체임의혼입0. 기존test/API0줄, RESULT/skip/완료그룹/exit와ERROR/WARNING원문을별도보고. 이문서의과거수치를이번실행PASS로전용0.

**완료조건:** 실제원문대조/guard·경계·소비검사통과, 기존분모불변, 새selector/test만, 제품등록/HP/AI/맵/저장실연결0, 공용0줄, 보고서/원로그/정상hook·자기branch push/원격SHA/DONE뒤자기sparseworktree제거. factory/World/State/기존selector수정이필요하면정확한접점·행근거만보고하고 **BLOCKED**, 임의확장0.

### 4.2 후속 순서 — 공통 부품·같은 etype 중복 구현0

|단위|작은산출범위|의존·정확경계|
|---|---|---|
|EC5-02|`native_ch5_enemy_catalog_policy.gd`/자기test:catalog10·G31326–31335의30필드slice|mainEC4-02/EC3-02 API형식·EC2-02 Constructor.Draws실제재사용. stage21..25/60..69, slice소비2/1/2/2/1/1/2/2/3/5, 초기false/0/−1/9999구분. 6장segment뒤의원cursor, 앞erraticAng중복0. HP/elite/mods/aura복제0, 전체constructor요구시HOLD |
|EC5-03|60/64잡기·60deferred수역요청/고유death정책·자기test|direct120대max90, strict거리/iframes/charge·hurt뒤 fresh값. callback현재P/ATK·I/seaSlow, 생존1이동packet대death3정지packet. 실Playergrab/slowwriter·전용DOT추가0 |
|EC5-04|61미끼flag→directcharge20 trigger/test|60<d<80동tick진입/소비, Cd>0만감소, _anglerLure읽기0/속도쓰기0. 기존M29/commonchargeowner읽기참조, 90전조추가0 |
|EC5-05|62마비/deferred1발정책/test|para60직접대입, iframestate경계, zap동tick/현재aim·e.el부재유지. Player전체행동/FX부유는별도owner, 8입자를8hit로변경0 |
|EC5-06|63guard/해제·별도찍기·hurtDamageprojection/test|T감소→진입90→해제→둘째hurt순서, 두요청/첫hurt뒤freshP각, 통합시동기재개. EC3-04형식참조만, .3/non-DOT/42175정확site, HP/poisewriter0 |
|EC5-07|65잠복/출현grab/이탈정책/test|EC3-03의cachedd/현재xy구분, 진입tickT감소, 2.5sp무canMv와후퇴3sp/canMv별도, freshdst30/35+P.r·grabT(0,10). 무적추가0/별도곰치재구현0 |
|EC5-08|66가시3packet·deferred3발·death8요청/test|거리없는spike, resetU→각/거리각U와spawn동기순서, coralSpike정지P계수.4/life360. callback현재aim/전조P·life200, death은coralflag없음. 실위험물소비/발사owner별도 |
|EC5-09|67song/directcharge15/flee정책/test|slowRes상한.5/trunc180, 현재trapSlowmax, 같은tick도주/상태변화뒤독립if, d<100안d>180불가능그대로. 실Player입력/보행.7연결은공용배정전HOLD |
|EC5-10|68charge25/tail/deferredparasite·death6요청/test|charge→tail→para overwrite, tail후방angle필터0/iframes분기·hurt뒤 KB15, 현재aim±.25/P/life250. deathP6·계수.4/life200별도, ib부여0 |
|EC5-11|69clock/HPphase·촉수·삼지창/흡입/해일계획/test|strict60%/30%같은tick0→2, cachedphase, 3~5hit currentiframes·hurt뒤 재개, orderedKB12, 삼지창→해일callback덮기, 12각−.72..+.60. 공통피해/탄커널0. 리뷰크면phase/촉수·deferred를소단위분리 |
|EC5-12|69→64동기birth continuation·death12계획/test|EC5-02/03·EC2-05의형식참조. caplength200사전1회/3·4개/거리무관, resetU먼저/각xy±40→canMv6→mkEn/push→다음xy, 현재stage/e.room/e.el직접, nullpush그대로/후대입없음. 실64actor/registry없으면계획까지만HOLD, deathI12/life200별도 |
|EC5-13|기존0..19/47 exact의존과새10종의actor별좁은consumer인수|CH1/PC·EC2/3/4소유자검수. 각원소/정예/skin·모든필드/피격·death/revive·warning/registry/home를개체별확인, factoryfallback/guard삭제0. 공용actual통합배정전BLOCKED |
|EC5-14|5맵굴/문지기69·지역/arena/Player환경·보상통합검수|맵/굴P3-002·지역P3-003·보스/탄/Player·메타/저장owner선행. room64group와RLE/굴 차이, 고정분모/동적64kill, hell4일반보행.7, grab/para수명/재시작/zone, stage26전환. 공용접점별승인전구현0 |

같은행의idle/death계획도리뷰범위가크면따로배정한다. 순수snapshot계산이동기hurt/mkEn중간read/RNG를건너뛰는가짜sink가되지않도록continuation/현재 view 계약을 먼저 확정한다. 전용30필드·명령 계획과 실제로움직이고피격·등록·저장·클리어하는제품 인수는 별도다.

## 5. 공용 접점·미확인·제출

|공용·다른담당위치 (이번0줄)|실제연결에필요한근거/권위|
|---|---|
|enemy_factory.gd:25–26/60–61/consume/admission|G31120–31364/각caller의schema/전체필드·부재el·skin/provenance. CH5stage60..69등록을PC/factory담당과별도인수, CH1exactgate완화0 |
|world.gd의RNG/canMv/ens/birth/시간|G39896의 canMv 없는 이동과 39908의 canMv 이동, G31446/40008nullpush, 동기constructor/FX 뒤 다음 좌표 draw. 순수명령leaf가실제registry/RNGowner가되지않음 |
|native_spawn_hole_system.gd·맵sourceowner|G35675 CH5풀/undefined, 각맵굴예산/후보tile0문지기69, 방64group유무, 5맵RLE/자연스폰. HELL0통째로교체0 |
|native_regions.gd·Main지역호출|G60728home우선kill/ib제외·굴고정total·gate10%/4지역clear, 64동적소환과 고정분모의관계. child분모임의가산0 |
|normalhurtE/sourcefields·player.gd|G42175guard.3의 정확site·non-DOT, G39816/39847/39884/39900grab/para, G33019–33041보행/입력, G39934/34710slow. 첫hurt후현재P·반사재진입/HP·iframe단일writer |
|M29/M30·projectile/warning·HUD/SFX/VFX|directcharge와현재_swFire덮기·callback수명, seaSlow/coral/piercepoolreset·E/Q/commit/정규화한번처리, 고유death와공통zone 공존. 실owner를소비하고가짜PASS0 |
|main.gd/State/메타·saveadapter|실boot/arena/kill·XP/mats/drop/장전환·재시작/zone·저장whitelist. 전용30필드/Playerstatus를새영속키로추가0 |

**미확인:** PC최신실창source일치·5에리어자연스폰/같은seed첫N개체·실제RLE/문지기tile0·전용10actor의모든원소/skin/정예admission·undefined탄/표시consumer전체·64nullpush의실패전파/registry수명·69hurt뒤 currentread/소환constructorRNG·65벽통과뒤common보정의실효위치·67도주flag의실제장기수명·grab/para의 전체 PlayerFSM/큰sp·pause/stun·재시작/zone후해제·deferred취소/죽음warning·모든death/부활/구울/메타·아틀라스/animation/VFX/소리/가독성/성능·영구저장. 이문서만으로완료율을올리지않는다.

원로그 L=`~/exoduser-wt/_out/trace-enemies-ch5/`. static-source.json/numbered-source.txt, references.json/remote-refs.txt/readonly정책사본, design-search.txt, source-selection-goldens.json, source-ai-observations.json은정적발췌/명시fixture관측이다. **게임/DOM/서버/World/실Player/Godot부팅0**, 기존PASS전용0. 기존3,220파일중CHANGELOG한개만허용된prepend로변경, 원본/제품/테스트byte불변·R0branch/HEAD/INDEX/WORK별도대조. 문서2경로만 정상hook뒤자기branchpush/remoteSHA/DONE→자기sparseworktree제거, branch/log보존. 최종수치/SHA/cleanup은L/DONE.txt·submission.json참조.

정적 문서 감사는 353항목/0실패다. 원본 SHA·31쌍 순서/가중치·10유형 직접비교 색인·34필드 색인·30필드 slice/소비수·표 열 수·EC5-01~14·의존 ancestry·보호 파일/R0를 대조했다. 이 숫자는 제품 테스트 수가 아니다. 최초 감사 helper는 porcelain 출력의 선행 공백을 strip해 경로를 잘못 파싱하여 실패했다. 경로 파싱만 보완한 뒤 같은 소유 경계 검사를 통과했으며 최초 stderr도 static-audit-first.err.log에 보존했다. Git의 기존 promisor remote 경로 경고는 원문 로그에 남기고 설정을 바꾸지 않았다.

## 부록 A. 60..69 직접 비교·case 전수 행 색인

“전수”는G의직접 `etype===/==/!==/!=숫자`·`case숫자:`literal검색, 부록B전용필드전literal, §1배열/Set계산index·함수/caller 범위를합친뜻이다. 외부동적주입·별칭/자연도달성전체증명은아니다. rendercase를actor지원으로세지않는다.

|etype|직접비교/case원본행|
|---|---|
|60|21382,31326,31327,39812,42919|
|61|21383,31328,39827|
|62|21384,31329,39843,40462,53859|
|63|21385,31330,39859,42175,53860|
|64|21386,31326,31446,39881|
|65|21387,31331,31728,39889,53861|
|66|21388,31332,39912,40460,42925,53862|
|67|21389,31333,39929|
|68|21390,31334,39951,42931,53863|
|69|21391,31335,39975,42938,53864|

## 부록 B. 전용30 constructor 필드·상태/탄 플래그 literal 전수

`_seaGrabT`/`_anglerLure`는 선언만 존재한다. 공유s/st2/_swFire/_swChargeEl/echDx/echDy·Playerkb/_trapSlowT는기존공용소유이며§1.3–1.4에서추적했다.

|필드|모든literal사용행|
|---|---|
|_seaGrabT|31326|
|_seaGrabCd|31326,39813,39815,39816,39882,39883,39884|
|_seaSpitCd|31327,39813,39820,39821|
|_anglerLure|31328|
|_anglerCharging|31328,39829,39831,39834,39838|
|_anglerLureCd|31328,39828,39829,39831|
|_jellyParaCd|31329,39844,39846,39847|
|_jellyZapCd|31329,39844,39851,39852|
|_crabGuard|31330,39863,39864,39867,39868,39875,42175,53860|
|_crabGuardT|31330,39861,39864,39867|
|_crabGuardCd|31330,39860,39863,39864|
|_crabSlamCd|31330,39860,39875,39876|
|_eelBurrowed|31331,39891,39892,39894,39898,53861|
|_eelBurrowCd|31331,39890,39891,39898|
|_eelBurrowT|31331,39892,39895,39897|
|_eelGrabT|31331,39890,39900,39906|
|_coralSpikeCd|31332,39913,39915,39916|
|_coralProjCd|31332,39913,39922,39923|
|_sirenSongCd|31333,39930,39932,39933|
|_sirenDashCd|31333,39930,39938,39940|
|_sirenFlee|31333,39941,39944,39947|
|_levChargeCd|31334,39952,39954,39956|
|_levTailCd|31334,39952,39959,39960|
|_levParaCd|31334,39952,39968,39969|
|_abyssPhase|31335,39979,39980,39981|
|_abyssTentCd|31335,39976,39983,39984|
|_abyssTridCd|31335,39976,39994,39995|
|_abyssWhirlCd|31335,39977,40000,40001|
|_abyssSumCd|31335,39977,40008,40009|
|_abyssTideCd|31335,39977,40017,40018|
|Player._seaGrabbed|33019,33023,39816,39884,39900,40098(7장84의기존공유caller)|
|Player._seaParalyzed|32158,33020,33023,33034,33041,33127,33749,34114,34336,34343,39847|
|projectile._seaSlow|16863,16878,34710,39823,42921|
|projectile._coralSpike|16863,16878,16917,16963,16968,34655,34667,34712,39918|

## 부록 C. 공통 범위·정적 관측 기록

|범위|G행 / 검토경계|
|---|---|
|난이도/원소/장|9272–9277,14333–14344,16633–16712|
|catalog/선택/정예|30823–31118; 전체35는ELITES참조|
|전체constructor/literal|31119–31364; CH5 30필드31326–31335, 앞6장뒤7장순서|
|CH5전용AI10block|39812–40022; 전체updateE/실actor아님|
|생성/caller|31366–31664,35636–35719,40008–40015; mkEn정의/호출40행은L/static-source.json|
|공통AI/발사|38577–38884,40444–40559,41232–41240|
|Playergrab/para/slow|32158,33007–33041,33127,33749,34114,34336–34343,34710–34712|
|피격/죽음/보상|42130–42203,42500–43118; CH5death42919–42944뒤공통원소zone|
|탄pool/요청/예고/정규화|16858–17003,20049–20155,34600–35140; 기존공통owner|
|몸체/스킨/소리/overlay|21382–21391,23292–23330,24724–24790,32079–32091,53859–54019|
|지역/문/전환|60688–60793,41868–41957,43896; 맵/지역/보스별도|
|zone/저장/로비|30149–30215,61993–62163,63892–64093,I1–4742; 기존whitelist|

|원문발췌관측|확인한표본 / 한계|
|---|---|
|선택45개·CDF31구간자료|각stage21..25 §4.1 golden9개를원함수VM실행, U열/소비수보존. CDF31쌍정적추출, 전경계테스트완료주장0 |
|catalog10·초기literal10개·HP24개|catalog8배열slice, 30필드원segment를 etype별U.5로평가. HP는L1/500/501×si21/25×4tier/dm1/non-ib의 식만 관측. 전체mkEn/skin/elite/provider실행0 |
|60 2개|grab/spit같은tick2draw·callback현재P=(300,400)/ATK101에서 I/dmg30요청, 기존grab200→120직접대입. 실제 Player 피해/시간진행0 |
|61/62|61d70/Cd0는 lure진입뒤 즉charge20/1draw. 62d35에서 para60와 deferred1발, 실제마비입력/발사0 |
|63 2개|기존guard/T1→해제/150요청→fixture가iframes30을써도120요청/KB10. 새guard진입은T90유지, 같은tick해제없음. hurtP본체미실행 |
|64/65 3개|64기존grab200유지/30요청. 65진입tickx2.5/T79/canMv0호출, 출현fixture현재거리에서 grab60/100요청. 실벽보정/common추격미실행 |
|66|spike3정지packet/후속callback3요청, explicit8draw(초기reset1+3×2+projreset1). spawnProj/FX의내부RNG는fixture밖 |
|67 2개|d70/song/dash같은tick2draw, slowRes.25→135, charge15와canMv후퇴2동시. d200에서flee=true그대로. 실commoncharge/Player속도없음 |
|68|d70/전체Cd0에서 charge→tail120요청/KB15→eShootWind60/3draw, callback3요청. 실스윕/피해/탄birth0 |
|69 2개|hp20/100→phase2같은tick, 촉수/삼지창예약/흡입/64child4후tide가덮음, 최종callback12해일요청. 별도fixture d2000/ens199에서도 4null push→203, 사전cap1회. 실constructor/skin/RNG/registry0 |
|death4개|60정지I3packet/raw0, 66P8·68P6·69I12의eProjAt요청. warning/commit/bean/normalize/실제최종피해·탄수0 |

AI/전용death관측은총 **19개명시fixture**다. 원본if전체를AST로발췌하고canMv/mkEn/hurtP/FX/SFX/발사는읽기predicate/반환fixture/요청수집으로대체, callback은현재값변경뒤수동실행했다. 실World/Player/physics/fullconstructor·FX전역RNG는 범위밖이며**제품테스트PASS/실전증거합산0**. 첫관측은segment끝주석뒤개행이없어SyntaxError로 실패, 원문무수정으로fixture닫는괄호앞개행만보충했다. 최초stderr는observe-first.err.log, 최종observe는exit0/stderr0. 실패를숨기거나게임테스트통과로표현하지않는다.

선택함수SHA256: rollEtype=`b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71`, rollEl=`84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6`. 전체원본/표현식/AIblock의 행·SHA는L의JSON에보존했다. 미래구현자는자기착수시latestmain/gamebyte와행을다시대조한다.
