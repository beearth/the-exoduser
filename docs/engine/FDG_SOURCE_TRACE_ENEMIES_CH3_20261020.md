# 3장 지옥의 겨울 4에리어 적 — 원본 추적·이식 설계

작업 `trace-enemies-ch3` · 브랜치 `codex/trace-enemies-ch3-20261020`. **정적 원본 추적·후속 구현 지시서이며 제품 구현 완료가 아니다.** 이번 제출은 이 문서와 CHANGELOG_SYNC 최상단 절뿐이다. 코드·테스트·기존 설계 수정0, Godot 실행/import0. 추정·실행 증거가 없는 사항은 **미확인**으로 남긴다.

## 0. 기준·선행 의존·분모

G=`26c050a99a711e793a6c2413395acda09b0c1614:game.html`, I=`동일 SHA:index.html`; 모든 원본 행은 이 최신 fetch main의 1-based다. game은65,692행/4,195,551byte/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index는4,742행/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`다. 아래 선행 원격5개의 game byte도 G와 동일함을 확인했다. 타 worktree/WIP를 읽거나 병합하지 않았다.

| 먼저 읽은 근거 | 재사용·이번 조사와의 경계 |
|---|---|
| main [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §0–6·색인 | 원본/data/admission/실제 실행 구분과 표 형식. 공통0..19·47의 AI·탄·소환/죽음·TP는 기존 의존이다. 당시 지원6/미10은 과거 snapshot이며 현재 main exact9/미7과 혼합하지 않는다 |
| main [ENEMIES_CH2](FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md) §0–5·부록 | 소환굴 undefined 원소, caller별 등록/후대입, 공통 FSM·투사체·네임드·보스·곰치·저장 경계를 참조만 한다. 2장31풀/가중치178·30..39를 CH3에 복제하지 않는다 |
| main [ELITES](FDG_SOURCE_TRACE_ELITES_20261020.md) §0–5·부록 | 31 mods+4 auras=35 전체 구현을 이 문서에서 다시 설계하지 않는다. CH3 해금·확률·caller 차이만 §1.6에 기록. M21 삭제·정예등급과 named90..99 구분·M29/M30 owner lock 단일 감소 유지 |
| **main에는 MAPS_CH3 없음**; 원격 `2eafd158a5ba6f804aee6f0f891f8a00a44c0c0c` [MAPS_CH3 제출본](https://github.com/beearth/the-exoduser/blob/2eafd158a5ba6f804aee6f0f891f8a00a44c0c0c/docs/engine/FDG_SOURCE_TRACE_MAPS_CH3_20261020.md) §0–5·부록B/D | si10~13 selector·RLE·굴·문/지역·arena·전환은 맵 소유. 각 에리어 굴 좌표/예산·지역 분모는 그 문서 §1.2·부록B 참조만, 이 작업의 맵 재추출/실제 적 배치 관측0. 미병합 문서를 main에 있다고 표시하지 않는다 |
| main WORK_BOARD·FEATURE_INVENTORY | P2-008a/FIX·b=PC 초기 CH1 actor/factory, P3-002=굴/World등록, P3-003=지역. 기능 inventory와 예전 추적 문서의 시점별 완료 수를 최신 실행 증거로 쓰지 않는다. 작업판 자체는0줄 |

| EC2 원격 제출 / SHA | main 포함 / 실제 읽은 코드·재사용 한계 |
|---|---|
| EC2-01 `c7e02549bec082cc31a86e606a61ec78f28dfb27` | **포함**. `native_ch2_enemy_spawn_policy.gd`, 검사·보고서. pick_etype/pick_element·RNG 주입·진단·원문 oracle/binary64 검사 형식 재사용. guard는stage4..9이며 CH3 지원이 아니다 |
| EC2-02 `a10924eb0ee725b993ab7bd1ea019d99180d4e1c` | **포함**. `native_ch2_enemy_constructor_policy.gd`, 검사·보고서. 숫자 projection, elite/mods/aura 공급자·실제 draw 순서 경계 재사용. stage4..9/etype30..39의52필드는 전체 actor가 아니며 guard 완화0 |
| EC2-03 `557eaff4deda2bd2dcac157a46615ee40fc433f9` | **미포함 원격**. `native_ch2_poison_zone_policy.gd`, 검사·보고서. 순수 명령·hurt 이후 fresh view 재개·기존 `combat_stat_formula::js_to_int32` 사용 경계 참조. type34/38 전용이므로 CH3 death-zone의 type/색만 바꿔 사용하지 않음 |
| EC2-04 `5a389578b9549b25538c665580e0d8bd906f9dbc` | **미포함 원격**. `native_ch2_charge_slam_policy.gd`, 검사·보고서. clock/trigger 분리·outer idle 1회·독립if overwrite·path predicate 주입·원소 키 부재/null 보존 형식. type30/32/39 전용이며43/45/49 adapter 완성으로 세지 않음 |

위 보고서에 실린 과거 검증 수치는 이번 실행 결과가 아니다. EC2-03/04를 참조했다고 제품 의존이 main에 설치된 것으로 표시하거나 이번 브랜치에 병합하지 않았다.

**분모:** CH3 일반 선택 풀은 **30종=0..19+40..49**, 총가중치136. 같은 etype의 기존 의존은 **21종=0..19+47**, CH3에서 별도 추적할 유형은 **9종=40..46+48+49**다. CH1에서40이47의 clone constructor 인자로 등장하지만 실제40 actor가 인수됐다는 뜻은 아니다. 20..39는 이 풀에 없고,90..99는 조건부 별도 네임드 교체다. `ib=true/etype0`인 에리어 보스, `ib=false/etype49` 일반·문지기, 별도 `_fb` 필드보스는 서로 다른 축이다. 의존21종이 이미모든원소/스킨의actor로구현됐다는뜻은아니다. 미구현공통유형은기존CH1/CH2담당의후속의존이며CH3이중구현대상이아니다. 30종이 각 필드에서 모두 생성됐다는 실측이나 진행률은 **미확인**이다.

## 1. 원본 행 전수 추적

### 1.1 4에리어·일반 유형/원소 선택

G16633–16712에서 hell2/startSi10/stages4다. STG.monLv300은 표시용 테이블이며 실제 생성 레벨은 G31125의 플레이어/난이도/stage offset 식이다. demo 기본은si0에서 종료(G16645–16648,43896)하므로 정식4에리어 자연 도달·실창 소스 일치는 **미확인**이다.

| 에리어 | si / hellFloor | STG / 실제 생성 경계 | 보스 이름 / allowed move 수 |
|---|---|---|---|
| 3-1 |10/0| 지옥의 겨울1구역 / 아래 동일 일반풀 | 얼음 망령 /32 |
| 3-2 |11/1| 지옥의 겨울2구역 / 동일 | 서리의 기사 /34 |
| 3-3 |12/2| 지옥의 겨울3구역 / 동일 | 얼어붙은 감시자 /36 |
| 3-4 |13/3| 지옥의 겨울4구역 / 동일, isHellBoss=true | 얼음 속 봉인 괴물 /37 |

보스 원소는 STG.be=I2이며 생성은 G30782의 `mkEn(...,0,true,STG[si].be,0)`다. allowed 수는 G9976–9981의_ch3Base33종에서 G10008–10010의 cageTrap 삭제를 적용한 값이다. 보스 패턴/score/phase 공통은 CH1·CH2 추적 의존이고 새40..49 actor로 바꾸지 않는다. 상세 맵/굴 분모는 MAPS_CH3 §1.1–1.4 참조.

G30974–30975의 원래 순서이며 R은 G30991의 **선택 분류**다. 근접 접촉 여부·후방 이동 목록과 같은 집합이 아니다.

| etype | 가중치 | R | 기존 의존 / CH3 전용 조사 |
|---|---:|:---:|---|
|0|5||CH1/CH2 공통 crawler exact profile 의존|
|1|2|R|CH1 hive·공통 탄 의존|
|2|10||CH1/CH2 공통, 비활성 돌진 복원 금지|
|3|4||기존 type3 부품·builder/binding 의존|
|4|4||CH1 eye/spine exact, 원소·스킨 domain 별도|
|5|8||공통 windup/탄·death 의존|
|6|3||공통 방패·호위/피격 의존|
|7|6|R|기존 TP/type3 소환·M30 조립 의존|
|8|3|R|공통 공격·사망 의존|
|9|1|R|공통 의식/부활 의존|
|10|2||공통 은신 의존|
|11|2||선택 R 아님; 공통 소환·후방 유지 의존|
|12|10||공통 광폭 의존|
|13|1|R|공통 web 의존|
|14|4||공통 비행/급강하 의존|
|15|2||공통 사망분열 의존|
|16|5|R|공통 trap 의존|
|17|1|R|공통 etype13 자식 소환 의존|
|18|1||공통 흡혈·접촉 의존|
|19|1||공통 slam 의존|
|40|8||원령 위상/기습, CH1 clone 생성 인자와 관계만 참조|
|41|7||타락기사 guard/강타|
|42|2|R|살덩이 corpse 흡수/D 분비|
|43|14||악마견 90tick 전조 돌진|
|44|8||고문관 직접 피해/출혈|
|45|3|R|날개악마 direct charge|
|46|2|R|기둥악마 F링/D 투사체|
|47|14||**기존 CH1/P2-008b·CH2 의존**; 새 CH3 clone/TP 구현 금지|
|48|2|R|지옥사제 치유/버프/D탄|
|49|1||일반 대악마/조건부 문지기, 실제 ib 보스와 구분|

R 교집합은 `[1,7,8,9,13,16,17,42,45,46,48]` **11종/가중치28**, 비R19종/108이다. G30993–31016: 첫 U<.5면 R 가중합에서 다음 U로 strict `<` 추첨, 나머지는 전체136 CDF를 최대12회 재추첨하여 R을 기각하고 전부 실패하면etype2. type 선택 RNG는2..13회다. 전체 가중치 한 번만 추첨하거나 두 풀을 무조건 균등 50:50으로 바꾸지 않는다. CDF는 `cum+=weight/total`의 원본 float64 연산 순서다.

G30985,31017–31022: CH3는 첫 U<.45면I, 아니면 다음 U×6 trunc로 `[P,F,I,D,L,H]`. 이상적 독립 U 기준 **I=13/24(약54.1667%), 다른5원소 각11/120(약9.1667%), E=0**. 겨울 테마를 물리/얼음 전용 제한으로 해석하지 않는다. G14333–14344의 EL은P0/F1/I2/D3/L4/H5/E6이며 ETYPE_ERES는120×7 모두0이다. 얼음 면역/화염 약점 같은 고유 저항을 새로 부여하지 않는다(상성 함수는 기존 WEAPONS 의존). **소환굴은 rollEl을 호출하지 않아 el=undefined**이고, gate/호위는I 고정,49/47의 자식은 `e.el||D`여서P0도D로 바뀐다(§1.5). 모든 caller를 이 분포로 합치면 틀린다.

### 1.2 catalog·생성 수치와 초기 상태

G30823–30920 literal이다. 아래 HP/ATK/poise/shield%는 **catalog**이며 실제 생성 HP/ATK/방어가 아니다. rawSPD→0이면0/아니면max(.2,raw×1.3) 후 생성에서 RNG를 더한다. 소수 표기의 반올림 값을 exact golden으로 쓰지 않는다.

| etype / 이름 | HP/ATK | raw SPD | r/poise/shield% | range | 색 |
|---|---|---:|---|---:|---|
|40 하급 악령(원령)|13/6|.21|10/5/0|600|#551133|
|41 타락 기사|64/18|.24|12/28/70|400|#442233|
|42 살덩이|96/22|.09|18/45/0|400|#663344|
|43 악마 개(악마견)|32/14|.54|10/12/0|200|#882211|
|44 고문관(고문자)|48/18|.6|**10**/15/0|400|#443322|
|45 날개 악마|19/22|.3|10/5/0|600|#553344|
|46 기둥 악마|128/18|**0**|20/55/80|400|#332222|
|47 그림자 쌍둥이|48/14|.36|12/18/0|400|#221122|
|48 지옥 사제|32/12|.24|10/10/0|800|#664422|
|49 악마길 대사도(대악마)|192/30|.24|25/60/0|1000|#330011|

G31120–31363 생성 공통은 CH1/CH2 추적과 EC2-02의 provider 경계를 재사용한다. finite좌표→canMv/safePt→레벨→elite/mods→speed/r RNG→HP/ATK→원본 literal 순서→skin→return이다. L=max(1,(P.lv||1)+DIFF_LV_OFF[diff]+G._stageDiffOff); B=(L≤500?.4×L×L×L+199×L+100:50,000,000×1.0014^(L−500))×2.925, pacing=1/(1+min(9,max(0,L−1))/18). 비보스 HP=`floor(floor(B×pacing×dm×tier.hpMul)×(1+si×.02))`, ATK=`floor((50+L×1.95)×.6×dm×tier.atkMul)`다. 표시식 대신 원문 곱셈/절삭 순서를 golden으로 보존한다. 예: L1/dm1/tier0의 si10은 HP1050/ATK31/poise1050/shield1050이다.

speed=`(mappedSPD+U×.08)×1.5`→M02면×1.5, r=`(catalogR+U×2)×2×tier.scaleMul`. **46도 mappedSPD0 뒤에 RNG가 더해져 M02 적용 전 speed가0..(.12 미만)**이며 이후 common 이동에서 제외하는 etype46 분기는 없다. “고정형”이라는 설명으로 생성 jitter를0으로 바꾸지 않는다. poise/maxPoise/eShield/eShieldMax는 생성HP(G31164,31184)이며41/46의 catalog shield70/80%로 치환하지 않는다.

40..49 모두 `_noProjEtypes`에 없어서 기본projCd240/초기projT180+120U다(G31154–31171). M02×.85 trunc 뒤 tier1/.8·2/.7·3/.6 trunc를 별도로 수행한다. st2=30+50U→facing=Uτ→tier≥2면aura→projT→bossPatT→해당 전용 필드→_bossOrbitAng→나머지 전용 필드→_erraticAng의 원래 literal 순서를 유지한다. type별 timer만 뽑아 생성 앞에 옮기면 RNG가 달라진다.

| etype / G 행 | 초기 전용 상태·timer(각 U 별도, tick) |
|---|---|
|40 /31263–31265|PhaseT120+60U → PhaseCd240+80U, Phasing=false|
|41 /31266–31270|GuardCd150+50U → GuardT80+40U → Guarding=false → SlashCd100+40U → SlashT40+20U|
|42 /31271–31273|AbsorbCd180+60U(현재 남은 clock도 이 필드) → SpitCd200+80U → SpitT80+40U|
|43 /31274–31275|LungeCd80+30U → LungeT30+15U|
|44 /31276–31278|ChainCd100+40U → ChainT40+20U → Bleed=.4|
|45 /31279–31280|SwoopCd90+40U → SwoopT30+15U → Ox/Oy0|
|46 /31281–31284|RingCd180+60U → RingT60+30U → AoeCd300+80U → AoeT80+40U|
|47 /31285–31287|CloneCd/CloneT/TpCd는 CH1_ENEMIES §1.2·부록A 기존 의존, 이름 변경/별도 재구현0|
|48 /31288–31291|HealCd200+80U → HealT80+40U → BuffCd250+80U → ProjCd120+50U. Buff/Proj의 Cd 자체를 감소시킴|
|49 /31292–31298|Phase0 → FireCd150+50U → FireT60+30U → SummonCd400+100U → ChargeCd200+60U → SlamCd250+80U → SlamT80+40U|

해당etype가 아닌 전용timer는9999, boolean 초기값은 그대로다. 조립 시49의Fire/Slam은T를Cd로 리셋하지만Summon/Charge는Cd를 새 U로 재추첨하는 차이도 보존한다. room과e._ri는 서로 자동 대체하지 않는다.

### 1.3 3장 전용 AI — 47은 기존 의존

전용 블록은 `etype && s==='idle'`을 **진입 때1회** 검사한다. 블록 내부의 if는 독립적이며 state가 바뀌어도 뒤 if는 실행될 수 있다. 공통 prefix는 G38584–38884의 hitStun/stun/거리/ATKreset·projCharge·st2 감소를 먼저 처리한다. 아래 전용 블록은 updateE 전체가 아니며 뒤 common FSM도 소비해야 한다.

| etype / G 행 | 정확한 전용 분기·caller 계약 |
|---|---|
|40 /39289–39316|PhaseT−sp 후 !phasing·T≤0·d<1200이면phasing=true/T=60+30U. phasing이면 **다시T−sp**·현재P 방향speed×1.5×aSpdM×sp/canMv 이동, T<−60이면0, T≤0 또는d<30이면phase해제/T=Cd. 해제 시d<50이면eProjAt(속도5,요청1.5,e.el,life60,size2). 이어 !phasing·30<d<1200이면 일반speed 이동도 실행될 수 있음. 모든 이동은canMv를 사용하므로 벽 통과 아님. hurtE G42154는phase중 return, 표시G53983. 접촉 저주 생산자 없음|
|41 /39318–39334,42156|GuardT/SlashT−sp. GuardT≤0·d<1200·!guarding이면guard=true/T90+40U, guarding이면 **다시T−sp**·소진 시false/T=GuardCd. 별도 SlashT≤0·d<45면T=SlashCd→telegraph20/windup18→**즉시hurtP(trunc(atk×1.3))**·parts/text/shake. guard는hurtE에서dmgtrunc×.5이며 정면 각도 조건/반격2연참 없음. idle밖에서 guardclock을 임의 감소시키지 않음|
|42 /39337–39356|AbsorbCd/SpitT−sp. AbsorbCd≤0이면180+60U로 reset하고 ens 배열 첫 `dead && distance<80` 시체1개에서 HP=min(mhp,hp+trunc(mhp×.15)), 그 시체 x/y=−9999. 가장 가까운 시체 선택·배열 제거/부활 아님. SpitT≤0·60<d<1200이면T=SpitCd/eShootWind60/D charge; callback 실행 시 현재P 조준 eProjAt(2.5,.8,D,200,#dd4466,5). 사망 산성 전용 분기 없음|
|43 /39358–39365|LungeT−sp, ≤0·30<d<1200·_chgPathClear(630+r)이면T=Cd, 현재P 조준→eChargeWind90/aimMax90/dur15/spd42/len630+r. G40521은남은st2>67.95일 때만 재조준; 원 주석의35%를 실제 식으로 사용하지 않음. common charge의벽/sweep/피해/KB는 기존 owner. 별도3방향 물기 발명0|
|44 /39367–39375|ChainT−sp, ≤0·20<d<120이면T=Cd→hurtP(trunc(atk×.7))→FX→별도 U<.4면P.bleed=(bleed\|\|0)+4. 끌어당김/갈고리 이동탄·windup 없음. hurtP의 동기 피해/거절 의미는 Player owner에 맡기며 새 사전면역 판정 추가0|
|45 /39377–39390|SwoopT−sp, ≤0·50<d<1200이면T=Cd/OxOy현재좌표 저장→**eCharge 직행18**·현재facing 방향. _chgSpd/Dur/Len을 설정하지 않으므로 source\|\|5 또는 남아 있는 값 소비. Ox/Oy의 후속 읽기 없음. 별도d<60이면 후퇴 이동도 실행;50<d<60에서 진입+후퇴 동시 가능. type14의eSwoop·90tick 동물전조로 대체0|
|46 /39392–39406|RingT/AoeT−sp. Ring≤0·d<1200이면T=Cd/eShootWind60/F callback: 실행시_now×.001 각 offset의8방향 eProjAt(2,.6,F,300,#ff4466,3). **뒤 독립 Aoe≤0·d<1200이면callback/chargeEl을D로 덮음**: 현재거리<100일 때D(4,1.2,60,size2)1발+6방향D(1.5,.5,200,#dd4466,6). 같은tick 링+AoE를 모두 발사하는 queue로 바꾸지 않음. 이름AoE지만 직접hurtP/감속은 없고 투사체 요청+FX|
|47 /39408–39429|CH1_ENEMIES §1.2 및 ENEMIES_CH2 §1.2 의존만. 40 clone의mkEn 호출/후대입은 있지만 **ens.push 없음**,120tick TP는 기존 소유. CH3라고 clone을 자동 등록하거나 generic type7로 바꾸지 않음|
|48 /39431–39465|HealT/BuffCd/ProjCd−sp. Heal≤0이면T=HealCd, ens 순서의첫 !dead/자기제외/hp<mhp/거리<200 **1개만** HP+trunc(mhp×.2), clamp. Buff≤0이면250+80U로reset, 자기제외 !dead/거리<200 전부 aSpdM×1.2·atktrunc×1.15. Proj≤0·d<1200이면120+50U 재추첨/eShootWind60/D callback, 현재P 조준eProjAt(3,1,D,250,#ff4400,3). d<80 별도후퇴. 시체부활 없음. aSpdM은G34395 전역reset, atk는G38771 각actor reset이므로 영구버프/고정지속시간을 발명하지 않음; ens update 순서 보존|
|49 /39467–39506|FireT/SummonCd/ChargeCd/SlamT−sp. hp<.5mhp·Phase0에서한번Phase1/speed×1.3/atktrunc×1.3(**baseAtk불변**, 뒤갱신ATKreset). Fire≤0·d<1200→FireT=FireCd/eShootWind60/F callback; **발사시Phase**에따라6/10방향(2.5,.7,F,300,#ff2200,3). 다음Summon≤0·ens.length<200→400+100U reset→2+trunc(2U)마리40을 mkEn 후null아니면push(§1.5). 다음Charge≤0·80<d<1200→200+60U reset/**eCharge25**/현재facing, 새chg필드설정0. 다음Slam≤0·d<130→T=Cd/eSlamWind55/10방향F(3,1.3,280,size4), d<100이면현재P 조준e.el(5,1.5,60,size2) 추가. **80<d<130이면charge→slam overwrite**, Fire callback이남아있어도 state가바뀌면그tick eShootWind 소비로발사하지않음. 소환/쿨reset/방향쓰기는남는다. elif로단순화0|

표의 shot 인자는 **eProjAt 요청값**이다. 특히 eShootWind callback과 eSlamWind 안에서 같은F/D 인자를 줘도 bean 변환 경로가 다르다. 아래 §1.4를 함께 읽는다. 40/41/42/44/48의 효과를 별도 Node HP setter로 붙여 제품 소비 완료로 가장하지 않는다.

### 1.4 탄·공통 FSM·피격/사망·표시

| G 행 / 경로 | 3장 소비에 필요한 공통 계약·기존 의존 |
|---|---|
|40458–40518|40..49는_meleeET(40499)에 **전부 없음**. 공통접촉.8을 추가하지 않음. keep-distance 공통목록에도없어 일반idle 추격×1.6·분리력이 전용 이동과 겹칠 수 있음(45/48 후퇴 포함). 모든40..49는range 안에서projT 소진→60tick common charge. 선택R 집합을 공통 후방 이동/근접공격 목록으로 바꾸지 않음|
|20122–20155|common charge는현재P 재조준/actor중심 발사, life=trunc(ETYPE_RANGE×.3). D=dark/gbBean/rawtrunc(atk×1), F=fireMagic/rawtrunc(atk×1.2), I=waterBean/rawtrunc(atk×1.2), 나머지(P/L/H/undefined)의현재자연normal 경로는rawtrunc(atk×.8). 기본common charge에서black을무작위생성하지않음|
|20049–20057,20119|eProjAt life=trunc(요청life×1.5), 입offset=(r\|\|12)×.7·각도0일때ang\|\|facing도보존. **s=eShootWind면bean변환생략**, 요청계수·속도/ELC색 그대로. 그밖의P는속도×1.3/계수1.2, D는×1.1/계수1, I/F는×1.05/계수1.2로요청을덮음, L/H/undefined는요청계수 유지. 46의D .5/1.2가같은D라는이유로1로정상화되면틀림. 49의slam F1.3은반대로F1.2가됨|
|20065–20093,40558–40559|비보스 이동탄은60tick queued warning·동일owner/frame/world/el/parryClass lane 묶음. eShootWind 종료/동일el이면즉시birth. 일반warning은이동offset을release에반영·world 교체/stun/freeze/owner상태로취소. 콜백은fire시점현재P/_now/Phase/ATK를읽으며,trigger시점값으로고정하지않음|
|16911–16921,16939–16992|spawnProj의원소기본·class·commit정상화는기존탄owner. 이동탄size×2/r×1.3/speed×1.8/dmg×2,redBean의후속감산/속도정상화·실탄3중1drop과_commit면제구분. 같은packet을이미정상화한뒤다시증폭금지. blackBean은EL.P여도Q전용magic,poisonZone은패링불가. 소환굴의e.el=undefined는common charge표시에서magic 힌트지만최종탄의 `(p.el??P)` 분류와다를수있음. 원소부재를P/I로미리지정하지않으며표시/접촉전체일치는미확인. 색/스킨/겨울테마로Q/E를바꾸지않음|
|40519–40538,40549–40559|43은90전조→15/42,45/49는direct18/25·chgSpd기존값\|\|5. charge스윕·P상태/iframe/패링·피해trunc(atk×30×elMul)·KB100·recover30·wall거절을공통소비.49 slam완료는반경70+r·피해×2·PlayerKB10/주변살아있는적KB6·recover50. 신규정책은기존M29/common FSM과단일clock/단일피해writer를확정해야함|
|42153–42156,42500–43118|40 phase면hurtE return,41 guard면피해trunc×.5가쉴드/포이즈전단에존재. 공통피격·원소/방어·poise·HP→dead/kill/reward·revive는기존hurtE/메타/리바이브owner. CH3 새actor의실필드소비가검증되기전기존halt/strict field guard삭제0|
|42945–42961|40..49전용 사망branch는직접etype전수검색에서없음. 일반 non-ib/non-decoy·el≠P·(elite≥1 또는U<.2)에속성death-zone: rawtrunc(atk×.25),tier≥2 size10/life360 아니면7/240, D/F/L poisonZone tickRate40/35/30, I는dmg0 iceZone. H/undefined도조건부U를소비할수있지만해당zone생성분기없음.42의“사망산성”을항상발생하게추가하지않음|
|24724–24732,42776인접|_UNDEAD_ET에40/47, _BEAST_ET에43. 소리분류는41/44 humanoid,42 flesh,45/46 insect,40/47/48 ghost,49 armor. 실제gore/RNG·신성력bonus·부활/구울은공통의존. 이름악령/기사만보고집합을추가하지않음|
|23292–23308,21558–21761,53975–54019|현재non-ib skin은 **_mobCh1/40스킨,etype+homeX seed**, chapter3 전용117스킨순환아님.40..49 procedural body case도있지만실제아틀라스와fallback표현의도달범위·품질은미확인.40phase/41guard명은공통표시패스.정예오라·탄경고·사운드는ELITES/SOUND기존소비경계|

위 공통 범위의 전체 본문은 CH1_ENEMIES §2·ENEMIES_CH2 §1.4–1.7·ELITES에 위임한다. 공통탄/실제맞음/반사/눈보라·환경빙판을 이번 문서에서 중복 이식하지 않는다.

### 1.5 생성 caller·소환·지역 연동

| G 행 | caller·3장 차이·등록 경계 |
|---|---|
|31366–31386|formation은6 1~2 + `[1,7,8]` 2~3·같은el. 생성좌표거절/caller방식은CH2 §1.2 참조|
|31389–31515,31575–31607|room/tileRLE 함수에는rare99 .005(1회플래그)→else .05의90..98 교체가있지만 **기본4맵은RLE라initStage가room/corridor자동생성을호출하지않음**(MAPS_CH3 F03). 최소80채움도non-RLE전용. 함수정의만으로네임드자연출현확정금지.33추가4~7/64떼/97추가1은해당타입의roomcaller 분기이며현재30풀의모든생성에적용0|
|31553–31569,31612–31655|stage reset후 조건부문지기는hell2→49/I/ib=false. mkEn뒤HP×4·ATK/baseAtk×2·rtrunc×1.4·poise/max80·elite3·dropTier4/_isGateGuard. **mods/aura/shield 재추첨/재계산없음**. 호위4~6은rollEtype/I 후 elite1·HP×2.5만,외곽8~12는rollEtype/rollEl. gate후보tile0 조건이며MAPS_CH3가si11~13 tile4 입력을기록:실제4맵문지기생존은미확인,항상존재시킨코드제안0|
|31029–31030,35587–35693|굴count S50/M100/L100·si0할인없음. _gameFrame<120차단→거리<2000trigger→다음갱신90tick delay→interval trunc(900/total)·alive700이상30대기→좌표30회/나선/중심fallback→**mkEn(...,rollEtype(si),false,undefined,h.room)**. 실패도_spawned증가,성공reviveIframes15/ens등록,curve와굴제거. 각map굴/분모는MAPS_CH3만참조. 원소I·rollEl·rare교체·33부가그룹을삽입하지않음|
|35702–35717|3장부터riftPool=`[0,2,4,6,10,12,14,19]`로증가,el미지정. mkEn뒤elite=min(3,2+trunc(si/15))라si10~13은2,HP/mhp×(2+.05si),baseAtk/atk×1.5,speed min(×1.2,1.5),r min(×1.15,24),보라색·등록. 자연tier2재roll/mods/aura재구성으로바꾸지않음|
|39411–39417|47의40 clone: ens.length<200 1회검사→U좌표2→mkEn(40,false,e.el\|\|D,e._ri)→HP30%/shield0/atk50%. **등록없음**·null확인없음. 기존CH1/PC소유참조,자동push/null회복을정상동작으로발명0|
|39482–39489|49의40소환: batch 전 ens.length<200 cap 검사 1회,resetU→countU→각x/yU→mkEn→null아니면push→다음자식. **2~3개,HP/ATK 축소없음**,el\|\|D(0도D)·room=_ri,자식constructor의 RNG가다음좌표보다먼저소비. 배치 중 cap추가/미리전체좌표추첨/40을3으로대체0|
|38920–38983,39031–39048,40777–40814|공통7/11소환은type3/6원소·HP50%/shield0,17은13 2~3개,ib보스소환은`3+trunc(stage×.5)`/pool[0,2,3,3,3]·6원소·HP50%/shield0. CH1/CH2/type3기존의존.49전용40소환과같은정책으로합치지않음|
|38778–38797,38842–38870,42792–42801,43050–43054|M06/type3·M16동일etype·M28미끼·type15사망2분열·M08/type3는기존공통생성/후대입. 현재CH3해금에없는M16/M28도기존전파/외부공급조건에서는원본경로를보존하며자연출현이라단정0. type38의33는CH3기본풀에없어그분기를CH3자연소환으로승격0|
|40412–40417|rare98이존재한다면rollEtype(stage)자식1개+rollEl/ens.length<200. rare교체재호출없음. 기본RLE자연98의실행은미확인|
|30149–30215,64743–64757|zone복원은저장된etype로mkEn재생성후일부수치만복원. 실제기본CH3는zones=null(MAPS_CH3 F09),새저장형식제안0. charget debug는43등수동생성이며자연3장분모아님|
|60688–60793,41868–41921|지역분모/kill기록·문지기10%보너스·4지역clear→bossUnlock은P3-003/MAPS_CH3 의존. kill은home좌표우선/ib제외. CH3 fbIdx=-1로앵글러필수아님.49일반·자식40을등록하면어떤kill/totalSpawned권위가소비할지별도인수.고정굴분모에임의자식수를더하지않음|

전역 `_fbTick/_hmTick`은stage0밖clear 경로지만 **곰치_wmTick은stage0밖에도기존실행경로**가있다(G32145,61203–61327). 이는etype/ens풀과별도권위이며CH2 §1.6 참조만,30종에4개를더해세거나CH3전용으로재구현하지않는다.

### 1.6 정예·네임드·표시의 3장 차이

ELITES의35종 전체 로직을 의존으로 한다. 아래는hell2의입력/해금만이다.

| G 행 | CH3 계약 |
|---|---|
|31033–31070|자연 일반82%/매직12%/레어5%/챔피언1%. U1회,strict `< .01`→3,`< .01+.05`→2,`< .01+.05+.12`→1,else0. 부동소수누적식순서유지. ib 또는named90..99는tier0/등급RNG생략|
|31044–31081|**17mods**=M01..12+M26+M29..32. M32는CH3에서최초해금. 공격pool M29/30/31/32에서tier1·2는1개,tier3는2개중복없이먼저 선택;나머지slot은일반M01..12/M26. M21등록없음. M09화염자취/M10사망폭발/M11화염사슬이겨울이라고금지되지않음|
|31083–31096,34394–34411|tier≥2는warCry/healing/**haste**중하나·RNG1회. guardian은미해금. warCry150/ATKmax1.25/SPDmax1.15,healing120/HP+trunc(max(1,mhp×.0003)×sp),haste150/SPDmax1.3. reset→공간query/자기·alive·경계→max/min·heal순서/leader참조는기존ELITES계약|
|31038–31039,38798인접|M29/30/31/32 등 다중공격lock과RNG는단일source owner로소비. 43/45/49가같은charge필드를사용한다고기존M29제품커널을복제하거나lock을두번감소금지|
|31389–31480,40250–40448,42962–43043|named90..99는자연tier2와다른집합. 조건부교체·개별AI/사망/보상은ENEMIES_CH2 §1.6 표참조만. 기본4RLE에서named초기자연출현확정0. 문지기49의 elite3 후 대입도named99로바꾸지않음|
|53975–54019,23292–23308|정예불꽃/이름/상태표시와원소차징/위상·guard표시를분리. 해금17mods+3auras=전체35종완료나CH3실화면인수아님|

### 1.7 index·저장·수명 경계

I1–4742에서`etype/HELL_SPAWN/rollEtype/_wraith/_dkGuard/_pillarRing/_adSummon/3장/지옥의 겨울` 직접검색0. 로비의game.html라우팅과저장슬롯UI는기존SAVE/CH1추적참조만,외부script/동적문자열까지없다는추정은하지않는다.
G30184의zone복원은mkEn을다시호출해elite/mods/aura/timer/skin을재추첨할수있고일반save의game payload는전체ens상태snapshot이아니다. 신규3장timer/clone/guard키를save schema에추가하지않는다. stage/reset·arena전환·공간registry/시체pool·deferred callback소멸/일시정지·실시간_now는각기존owner다. 임의타이머/독립RNG/별도World를새권위로추가하지않는다.

## 2. docs 불일치 표

근거 폴더 `docs/8.0몬스터디자인/`, `docs/9적ai패턴디자인/`를 먼저 검색·대조했다. 아래 차이만 보고하고 기존 설계·제품을 수정하지 않았다. 설계 목표/과거 기록과 최신 원문 실행을 구분한다.

| docs 위치 | 기록 | 최신 G 근거 / 판정 |
|---|---|---|
| 몬스터_총관리.md:156,946–969 | 정정 메모는3장=겨울이나40..49 상세 제목은“4장 고통의 화염지대” | G16633–16640/30974–30975는hell2/si10~13. **상세 제목 잔존**; 장/etype를다시배정하지않음 |
| 같은문서:960 / 몬스터_공격시스템.md:365 |40 벽통과·접촉저주 |G39289–39316 모든이동canMv,42154위상무적. 접촉저주분기없음. **설계와행동차이** |
| 총관리:961,428 / 공격:366 |41 정면가드·반격·2연참 |G39318–39334 guardclock+즉시1.3강타,42156 각도없는50%경감. **행동차이**;기존type6 방패각이식0 |
| 총관리:962 / 공격:367 |42 굴러옴·사망산성/느린탱커 |G39337–39356 시체15%흡수·생존D분비,직접사망산성분기없음. 공통원소death-zone조건은별개. **서술불일치** |
| 총관리:963 / 공격:368 |43 세머리·3방향물기·떼 |G39358–39365 90전조·15/42 돌진,40499접촉목록제외. **추가물기근거없음**. 9_AI:269–276의43 돌진90/42×15/630+r은일치 |
| 총관리:964 / 배열:305,324인접 |44 표반지름8·갈고리끌기/연타 |G30862인접catalogR44=10, 39367–39375 직접.7피해+U<.4 출혈4, 끌기없음. **수치·행동불일치** |
| 총관리:965 / 공격:370 |45 공중선회→급강하 |G39377–39390 direct eCharge18+별도후퇴,저장Ox/Oy읽기없음. **선회/복귀근거미발견**;14의eSwoop를대체사용0 |
| 총관리:966 / 공격:371 |46 고정·광역휩쓸기·비명감속 |G31136 speed에U가더해짐,39392–39406 F8링/D6투사체·가까운D1발, 감속없음. 동시due시D callback덮음. **“고정/휩쓸기/감속”을새기능으로추가금지** |
| 총관리:967 / 공격:372 |47 분신·2초TP·착지강타35% |G39408–39429의40 constructor후등록없음,TP120은일치. 생성→등록누락차이는CH1추적기록참조. **자동push를보정하지않음**,착지/실공격은기존PC소유 |
| 총관리:968,435 / 공격:373 |48 죽은몹부활+암흑 |G39431–39465는살아있는손상아군첫1개20%치유+버프+D탄, 죽은몹부활없음. **행동불일치** |
| 총관리:969 / 공격:374 |49 미니보스 |일반pool에도있고gate도49지만ib=false, 실제arena보스는etype0/ib=true(G30782,31615–31626). **명칭과생성역할분리**;미니보스라는이름으로보스24배·보스AI를붙이지않음 |
| 스테이지_몹분배.md:15–17,36–45 |순차스킨·70종보장/CH3 117스킨 |G23292–23308은nonboss ch1/40·etype/homeX seed. **시각스킨과논리etype30풀구분**,순차재배정0 |
| 같은문서:29,59 |겨울화염금지(색감),3장옛보스이름 |G31017 rollEl은F가능·46/49의전용F탄·M09..11해금,HELL_BOSSES[2]는§1.1의4이름. **색감지침≠전투금지**,보스배치표는옛목록 |
| 9_적AI패턴디자인.md:202–215 |옛어택티켓 최대3 |G38577–38579 atkTicketRequest는항상true. **비활성설계**,공격제한재도입금지 |
| 같은문서:350–394 |정예배율·3장12/5/1·M32해금 |G31033–31096과일치. **일치항목**이며새불일치건수로세지않음. 영구전투연결/전체35종완료증거는별개 |
| 원본주석·기술명 |40“최대3초”,41“poise보정”,46“AoE”,49분노 |실제40/41의활성timer는1tick안에2번감소,41은hurtE피해경감, 46은투사체, 49 atk만1회변경후다음updateE reset. **원본안주석/실행차이**도보존. 원본버그처럼보여도이번보정0 |
| 기존trace의과거지원/EC2범위 |CH1 6/10,CH2당시정예미병합·선택31종 |현재main CH1 exact9/7, ELITES문서/EC2-01·02포함. **과거snapshot과현재통합상태차이**;CH3 actor지원으로전용금지 |

catalog의40..49 HP/ATK/rawSPD 대부분은총관리표와일치한다. 이것을실생성HP와같다고보고수치표를갱신하지않는다. VFX/탄막/사운드/animation 문서는원본효과의다른축이며실제Godot실화면·소리·아틀라스클로저검수는 **미확인**이다.

## 3. Godot 의존과 빠진 것

경로는godot/상대다. 다음은파일/함수/단정본문의 **정적 확인**이며Godot재실행은0회다.

| 기존 main / 고정 원격 | 있는 것·재사용할 공통 경계 | CH3에서 빠진 것·금지할 일반화 |
|---|---|---|
| scripts/native_ch2_enemy_spawn_policy.gd:5–9,56–75 |CH2 exact31풀·RNG주입/NOT_READY·draw수 |CH3 30풀/136/I bias.45는없음. stage4..9 guard완화로CH3를통과시키지않음. 새장별leaf는같은API/검사형식을사용|
| scripts/native_ch2_enemy_constructor_policy.gd:57–161 |numeric projection/elite·mods·aura callback·52fields/9catalog |stage4..9/type30..39만, 40..49전용38필드없음. 전체actor나registry아님. 기존HP/ATK 계산authority를중복생성하지않고후속범위검수|
| 원격EC2-03 /04(§0고정SHA) |순수명령/접촉후fresh view, clock→trigger분리, 독립if/요청packet exact·미연결진단 |main미포함, 타입34/38·30/32/39전용. CH3일반death-zone·43/45/49를이름만바꾸어지원했다고하지않음|
| port_modules/combat_stat_formula/producer.gd:228 |기존 `js_to_int32` read-only 숫자 primitive |새formula helper/독립수치보정불필요. HP의Math.floor를ToInt32로대체하지않음. 새consumer는기존함수정확scope를사용|
| scripts/enemy_mod_m29.gd:175–284 /native_m30_modifier.gd |파라미터화된common wind/charge/sweep·owner lock/기존type7조립 |M29 `trigger` 자체의60/18/32를43의90/15/42로사용금지. 필드주입후step_charge소비경계·실제소유권인수필요. 45/49의이전chg필드잔존을지우지않음|
| port_modules/common_charge_warning/producer.gd:1–28 |60tick common charge/queued warning을읽는실제Node2D표시부품, 자체clock없음 |eShootWind/TP/M29전조는이부품범위밖. 40위상·41guard/46각special전조·elite오라의완전소비증거없음|
| scripts/native_element_projectile_emitter.gd:89–145 |sourceactor3/6원소·7/P·21/D의좁은admission와일부탄birth |40..49미지원. 6원소탄클래스존재만으로새eProjAt/warning→정상화→접촉caller완료아님. RAW_KEYS/admission삭제0|
| scripts/enemy_factory.gd:23–31,60–61 /tests/test_encounter_factory.gd:15–23 |CH1 stage0/time0 schema·exact9orders,KNOWN_ETYPES |CH3 source/schema/등록/actor0. knownetypes에47이있어도해당exact CH1 actor를CH3에자동생성할수없음. 공용factory0줄|
| scripts/type3_spawn_recipe.gd·type3_summoned_actor/type3_native_binding·type7 runtime/teleport |공통3소환/6원소부품·CH1 exact7 phase/TP의존 |49의자식은40, 40은type3별칭아님. 47의미등록clone도기존PC소유. 각새actor소유필드/등록recipe/sourcecontext없음|
| scripts/native_spawn_hole_system.gd:26–40,62,518인접 |stage0/HELL0_POOL·undefined원소·etype0실등록/나머지정직unported journal |CH3풀/4맵budget·일반40..49등록없음. STAGE0를10으로교체해기존CH1경로를변경금지|
| scripts/native_regions.gd:59–118 |임의stage지역순수계산·CH1만fbIdx mapping·sourcekill. CH3 size분모/방위규칙을재사용가능 |실제CH3map/actor의 home좌표·totalSpawned·문지기/kill연결은미인수. policy READY는문개방이나actual kill이아님|
| scripts/native_source_normal_enemy_fields.gd:34–70 /native_normal_enemy_hurte.gd |actual actor/World현재호출·field prefix/피격·poise/killowner |40phase return/41guard 감산의정확위치·새actor실필드domain/막힌fieldwriter, 회복·시체이동·상태후속소비필요. halt숨김/범용crawlerfallback0|
| scripts/player.gd·world.gd·main.gd·State |기존상성/피해/출혈/KB·실제공유RNG·collision/ens/deadpool/birth·맵부팅권위 |44 bleed4·41즉시강타·43/45/49스윕·49소환생명주기/paused clock·4에리어부팅미연결. 가짜HP/임의성공World·별도RNG로인수대체0|
| main ch2_map_source/stage4_contract·native_ch2_area_world, 원격MAPS_CH3/CH3맵후속 |source-only/standalone preview와실게임구분형식 |맵계약과적소유경계만참조. CH2si4 preview에3장AI를붙여실게임완료로보고0. CH3맵구현최신인수는해당맵담당결과를별도확인|

native scripts의숫자40..49검색만으로actor지원을판정하지않았다. 공통수식/자료/주석의숫자는지원증거아니다. **같은etype의기존구현의존은현재 exact profile까지이며 CH3의모든원소/정예/좌표/맵/스킨까지승인된것은아니다.**

## 4. 작은 이식 단위 순서안

아래EC3-*는후속배정용이며이번코드/테스트는생성하지않았다. 맵팀CH3-01..과구분하기위해적팀접두어EC3을쓴다. 공용·타담당파일0줄이가능한순수단위를먼저실행하고, 실소비/공통authority변경이필요한시점에는위치·근거를보고해별도통합배정을받는다.

### 4.1 1번 EC3-01 — 3장 유형·원소 선택 순수 정책 (구현 지시서)

| 항목 | 구체 계약 |
|---|---|
| 새 경로·제출 | `godot/scripts/native_ch3_enemy_spawn_policy.gd` / `godot/tests/test_ch3_enemy_spawn_policy.gd`와자기UID. 추가원문oracle가필요하면자기작업명테스트하니스만사용. 보고서/CHANGELOG는배정관례. 기존EC2/helper/actor/factory/World/Main/State와공용테스트수정 **0줄** |
| API | EC2-01과같은RefCounted `pick_etype(stage:int, random_unit:Callable)->Dictionary`, `pick_element(stage:int, random_unit:Callable)->Dictionary`. READY=`{status:"READY",value:int,draws:int}`. 지원밖stage/무효Callable/잘못된샘플은NOT_READY/reason/실제draws, value없음. reason은각각 `unsupported_stage` / `invalid_random_callable` / `invalid_random_sample`. 앞두경우draws0, 호출자가k개정상값뒤잘못된값을반환하면그호출도소비하여draws=k+1. 콜백실행오류를READY로대체하지않음. stage10..13만, stage0/4..9fallback금지 |
| 정확 데이터 |G30969–31022·16633–16666. §1.1의30쌍**순서/가중치전부**, 총136/R11·28/비R108, HELL_EL[2]=[I2,.45], CDF 각weight/total순차누적. 20..39/rare90..99를혼입하지않음 |
| RNG·선택 |호출자Callable의수치[0,1)만사용. 첫U<.5→R가중합, ≥.5→전체CDF최대12번기각→fallback2, strict `<`. type2..13draws, el1..2draws. U=.45에서는2번째원소draw를소비, 보조원소에도I가있음. 지역seed/자체randf/RNG재시드/미리샘플추가/중도실패되감기0 |
| 재사용·차이 |EC2-01의API/NOT_READY·원문추출/stream대조·binary64전달형식재사용. 기존CH2파일은stage4..9·다른POOL을소유하므로그파일을수정/상속해guard무시하지않음. 현재main에범용chapter-selector API는확인되지않아새장별leaf만제안. 공통selector추출/기존provider호출위치변경은별도통합작업 |
| 기본 golden (각si10,11,12,13) |type U=[0,0]→1/2draws, [0,2/28]→7/2, [0,.999999]→48/2, [.5,0]→0/2, [.5,6/136×12개]→2/13. el [.449999]→I/1, [.45,0]→P/2, [.45,2/6]→I/2, [.45,.999999]→H/2. 총36개는이번원문함수발췌VM에서 관측했으며Godot PASS가아님 |
| 필수검사 |각stage/pool30/R11의원소·순서·합, 각유형선택가능, 모든CDF/R가중경계의 바로아래/동일/위, U=.5/.45 양쪽, 1..12연속기각/13소비, caller입력불변·소비열/횟수, 잘못된stage/Callable/bool/null/문자열/NaN/Inf/음수/1과늦은샘플실패진단. expected를GDScript수식복제로만들지말고최신main원문roll함수에주입한독립oracle와대조 |
| 수치·하니스 |Node실행은절대 `--node-bin`/환경을받아Windows shim을피하고, JSON은UTF-8외부새파일로수송. 원본pin/함수hash와기대값검사유지. double은little-endian binary64/base64 또는hex를복원, JSON decimal재파싱오차를허용오차확대로숨기지않음. acorn은새WT에서lockfile설치또는검증한동일저장소node_modules연결절차명시 |
| 격리·회귀 |신규격리 `EXODUSER-ec3-01-Isolated-20261020`. 기존test_ch2_enemy_spawn_policy·test_contracts와관련factory/굴/원소탄검사는각파일상수격리이름, 상수없으면명시된작업격리. Godot실행전정확한pgrep수2이상시30초씩대기, override는자기WT에서복원. 그룹/단정·exit/ERROR/WARNING/SKIP를나눠기록하며선재실패도원문보존 |
| 인수 한계 |순수선택결과까지만. constructor/정예선택/실제actor/스킨·맵budget/굴원소undefined/공간registry/지역kill·보상·저장연결없음. CH3지원게임완료나첫N마리seed동일증거로집계하지않음. 공용수정요구가나오면범위/필요위치보고후중지 |

후속 구현 검증에서 Godot를 실행하기 직전에는 다음 명령의 수가2미만인지 확인한다. 2이상이면30초 대기 후 같은 명령으로 재검사한다. **이번 추적 작업에서는 Godot를 실행하지 않았다.**

```sh
pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l
```

### 4.2 후속 순서 — 같은 etype/공통 부품을 중복 구현하지 않음

각단위는새순수leaf+자기검사/UID범위부터이며실연결과분리한다. 47과0..19는아래새전용AI목록에넣지않고CH1/PC/EC2의존으로인수한다.

| 순서 | 작은 산출물·원본 | 선행·필수 인수 경계 |
|---|---|---|
|EC3-02|`native_ch3_enemy_catalog_policy.gd` / test. §1.2의catalog10행/40..49전용38필드초기화, 전체literal원순서와 RNG투영. 전체actor생성/HP권위는별도 |EC2-02숫자projection/API·공통ToInt32재사용. 기존CH252필드/HP식을이름만바꿔새authority로복제하지않음. sharedconstructor지원이필요하면provider exactscope/공용분리배정전HOLD. 47의constructor정보는자료의존만 |
|EC3-03|40 phase 순수state/명령leaf / test, G39289–39316 |2회T감소/진입후같은tick감소/해제후추가이동/거리30·50/phase hurtE return요청. canMv는기존콜백, 실피격/이동writer별도 |
|EC3-04|41 guard/강타 leaf / test, G39318–39334·42156 |clock2회/guard와slash동시/idle밖동결/50%trunc위치/즉시Player피해명령. 정면방패·반격추가0, 기존hurtE연결별도 |
|EC3-05|42 시체흡수/분비 leaf / test, G39337–39356 |첫dead/80경계/시체좌표−9999/재조회순서, Spit60..1200·현재P조준callback. deadpool소유/registry삭제/Playerheal함수로대체0 |
|EC3-06|43 charge trigger adapter / test, G39358–39365 |원격EC2-04의clock/trigger형식, 기존M29/common step 재사용검수. 90/15/42/630+r/pathpredicate·67.95잠금경계. M29자체trigger60/18/32로대체0 |
|EC3-07|44 채찍/bleed, 45 direct charge를**별도소단위**로배정 |44의20/120엄격경계·RNG1회/hurt후bleed4, 45의18/facing/이전chg필드/50..60후퇴중첩. 표의한행이동시여러actor구현승인이아님 |
|EC3-08|46 deferred projectile 요청계획 / test, G39392–39406 |2clock·독립if/callback최종D overwrite, fire시_now, 6/8방향/근거리추가, eShootWind의bean우회. 기존shot/warning/birthowner필수, 실탄clone커널0 |
|EC3-09|48 아군치유/강화/D탄 leaf / test, G39431–39465 |ens원순서/첫손상·범위200엄격/자기dead제외·실제hp다시읽기, 순서있는buffwrites·다음framereset, 사망부활0. 실HP·FX·clockowner별도인수 |
|EC3-10|49 clock/trigger·40 birth-request phases / test, G39467–39506 |원격EC2-04형식/3장40constructor의존, Phase0→1/Fire6→10발사시읽기, charge→slam덮음, batch전cap1회, P0→D, child RNG전후순서. 신규fakeWorld없음, mkEn/ens authority가없으면동기요청/재개경계만계산 |
|EC3-11|0..19/47 기존exact의존과9새유형의actor별 좁은consumer 인수 |원소/정예/skin·full필드/피격·poise·deferred callback·death/revive·registry/home좌표를etype별확인. factoryguard삭제/타actorfallback0. 실factory/World/Main수정이필요하면통합배정전HOLD |
|EC3-12|4에리어굴/문지기·지역·arena·보상 통합검수 |MAPS_CH3·맵후속/EC2/P3-002/P3-003/보스·탄·메타·save owner가선행. 홀분모/자식40kill·문지기tile조건/4지역→unlock/4보스→si14전환을실제source권위로인수. 공용수정은이번순수단위와분리 |

CH3 정예17mods/3auras의전투consumer는ELITES 후속, named와곰치·common death-zone은CH2/공통후속의존이다. 겨울이므로새얼음전용공격세트를만들거나구현이편한자식type3를대체사용하지않는다.

## 5. 공용 접점·미확인·제출

| 공용·다른 담당 위치 (이번0줄) | 실제 연결 때 필요한 정확 근거/권위 |
|---|---|
|enemy_factory.gd:60–61 및actoradmission/consume|현재CH1 stage0/time0/frozenrecord exactguard. CH3source/schema/40..49 actor등록은PC/factory소유와별도인수. G31120–31363 생성전체필드/중간실패/원소부재·1·2장같은etype의기존profile 유지 |
|world.gd의actual RNG·collision/공간query·ens/deadpool·birth|G39414의미등록clone대G39487의실push, 동기constructor의RNG/부수효과, phase 안 canMv·첫시체/아군순서, warning world identity/lifecycle. 신규policy가실제RNGowner가되는것아님 |
|native_spawn_hole_system.gd:37·62·518인접 /맵sourceowner|G35675는CH3pool/undefined원소, 굴배치/분모는MAPS_CH3. 현STAGE0/HELL0_POOL를 통째로교체하지않고새consumer의소유권분리 |
|native_regions.gd:81–118 /Main의실지역사용|G60688–60793·41868–41921의home우선kill/ib제외·guard10%·4지역clear. 새소환자식40 때문에굴고정분모를멋대로늘리지않음. 모든문지기spawn을보장하지않음 |
|native_normal_enemy_hurte/source field owner·player.gd|G42154/42156의return/감산위치, 41·44직접hurtP와bleed, 43/45/49의스윕/상성/KB, 회복명령/HPclamp를기존동기owner가소비해야함. Q/E·blackBean magic/blue반사와poiseguard불변 |
|공통 M29/M30·projectile emitter·charge warning·HUD/SFX/VFX|한번만clock/lock감소, eShootWind callable현재값·warning/group/cancel/정상화1회·실접촉/시각경고. 기존부분Node/탄6원소를전체CH3완성으로승격0 |
|main.gd/State/메타·saveadapter|실부팅/arena/처치·XP/mats/drop/revive/전환은기존권위. G30184재생성/11필드zone저장과전체ens저장을혼동하지않으며신규savekey/형식변경0 |

**미확인:** PC의최신실행창과소스일치·4필드자연도달/실제같은seed첫N개체·원소undefined의모든표시/방어/탄consumer·source47null실패전파·40/41의전체hitStun/거리tier/pause 중 상태·39/48등버프update순서의실효·40시체/아군의실공간registry수명·9새유형의아틀라스/애니메이션/사운드/실전가독성·모든공통탄반사/정상화/부활/지역kill·영구저장. 이번이식설계만으로완료율을올리지않는다.

정적검산은원문literal/함수/분기발췌이고게임·DOM·server·Godot를실행하지않았다. 선택golden36개와AI블록10개관측은부록C/원로그에fixture범위를명시, 실제게임PASS/테스트PASS수에합산0. 처음관측harness는49용RNGfixture5개가부족해`unexpected RNG`로실패했다. 원문수정없이주입열8개로보완한최종관측과첫실패원문을함께보존했다.

R=`/Users/fordeargamers/Projects/exoduser-migration-20261001`의branch `codex/mac-live-play-time-main-20261017`/HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`/tracked INDEX·WORK를시작·끝에분리해대조한다. `worktree add --no-checkout`+non-cone sparse로필요경로만읽었고새웹에셋checkout/생성0. main push·force·git add -A·공용제품/기존테스트/보호docs2_3 변경0. 정상pre-commit후자기branch push·원격SHA일치·DONE기록→자기WT만제거, 브랜치/로그보존.

원로그 L=`~/exoduser-wt/_out/trace-enemies-ch3/`. `start/R-start/references/static-source/index-census.json`, 번호원문발췌, design-search, 고정remote본문/모듈, `source-pick-goldens.json/source-ai-observations.json`, 최초실패/최종관측·독자검토·문서검사·Git제출증거를보존한다. 최종branch/SHA/수치와cleanup/R대조는L/DONE.txt·submission.json·cleanup-verification.json에서확인한다.

## 부록 A. 40..49 직접 비교·case 전수 행 색인

“전수”는 G의직접 `etype===/==/!==/!=숫자` 및 `case 숫자:` literal 검색 전체, 아래38개 전용필드의 모든literal 사용, §1의정의/공통caller 범위를합친뜻이다. 동적외부주입·별칭·현재실행도달성전부를증명하는용어가아니다. catalog배열/Set의계산index는§1에서별도추적했다. render case를전투actor지원으로세지않는다.

| etype | 직접 비교/case 원본 행 |
|---|---|
|40|21559, 31263, 31264, 39289, 42154|
|41|21575, 31266, 31267, 31269, 31270, 39318, 42156|
|42|21597, 31271, 31272, 31273, 39337|
|43|21618, 31274, 31275, 39358|
|44|21641, 31276, 31277, 31278, 39367|
|45|21663, 31279, 31280, 39377|
|46|21685, 31281, 31282, 31283, 31284, 39392|
|47|21705, 31285, 31286, 31287, 39408|
|48|21725, 31288, 31289, 31290, 31291, 39431|
|49|21743, 31292, 31293, 31294, 31295, 31296, 31297, 31298, 39467|

## 부록 B. 전용38필드의 원본 행 전수

47의3필드는 기존CH1 actor/constructor의존을가리키는색인이며새구현지시가아니다. 그외실필드소유·초기화/쓰기/읽기를생략하지않기위해함께기록했다.

| 필드 | 모든 literal 사용 행 |
|---|---|
|_wraithPhaseT|31263, 39290, 39291, 39292, 39296, 39303, 39304, 39305|
|_wraithPhaseCd|31264, 39305|
|_wraithPhasing|31265, 39291, 39292, 39295, 39305, 39310, 42154, 53983|
|_dkGuardCd|31266, 39325|
|_dkGuardT|31267, 39319, 39320, 39321, 39324, 39325|
|_dkGuarding|21594, 31268, 39320, 39321, 39323, 39325, 42156, 53985|
|_dkSlashCd|31269, 39328|
|_dkSlashT|31270, 39319, 39327, 39328|
|_fmAbsorbCd|31271, 39338, 39340, 39341|
|_fmSpitCd|31272, 39352|
|_fmSpitT|31273, 39338, 39351, 39352|
|_ddLungeCd|31274, 39361|
|_ddLungeT|31275, 39359, 39360, 39361|
|_torChainCd|31276, 39370|
|_torChainT|31277, 39368, 39369, 39370|
|_torBleed|31278, 39373|
|_wdSwoopCd|31279, 39380|
|_wdSwoopT|31280, 39378, 39379, 39380|
|_wdSwoopOx|31280, 39381|
|_wdSwoopOy|31280, 39381|
|_pillarRingCd|31281, 39396|
|_pillarRingT|31282, 39393, 39395, 39396|
|_pillarAoeCd|31283, 39402|
|_pillarAoeT|31284, 39393, 39401, 39402|
|_stCloneCd|31285, 39412|
|_stCloneT|31286, 39409, 39411, 39412|
|_stTpCd|31287, 39409, 39421, 39423, 39427|
|_hpHealCd|31288, 39435|
|_hpHealT|31289, 39432, 39434, 39435|
|_hpBuffCd|31290, 39432, 39444, 39445|
|_hpProjCd|31291, 39432, 39455, 39456|
|_adPhase|31292, 39470, 39471, 39479|
|_adFireCd|31293, 39477|
|_adFireT|31294, 39468, 39476, 39477|
|_adSummonCd|31295, 39468, 39482, 39483|
|_adChargeCd|31296, 39468, 39492, 39493|
|_adSlamCd|31297, 39499|
|_adSlamT|31298, 39468, 39498, 39499|

## 부록 C. 공통 생성·소비 범위와 정적 관측 기록

| 범위 | 원본 행 / 검토 경계 |
|---|---|
|난이도/원소/레벨|9272–9277,14333–14344,16633–16712|
|카탈로그/선택/정예|30823–31118; 전체31mods/4auras는ELITES 참조|
|constructor·원본순서|31119–31364; 함수SHA256 `dd528111eb73314c22171a1bcae6ad16798b8dcdcb252e456a0b5cf25bfcedc8`|
|생성함수/caller|31366–31664,35587–35719; 소환굴/지역은MAPS_CH3/P3 소유|
|AI공통prefix·정예|38584–38884; 그외같은etype공통은CH1/CH2 의존|
|3장전용AI|39287–39506; 각outer idle와독립if 순서|
|공통이동/접촉/차징·FSM|40458–40559; common charge/slam실소비|
|소환/네임드/보스|38920–39048,40250–40448,40777–40814; 보스score/phase/상태9820–10010,37650–38513,40560–41375는기존추적참조|
|피격/죽음/처치/보상|42130–42173,42500–43118; 전체메타·revive·아이템이식완료주장0|
|탄요청·예고·commit|16857–17010,20049–20156,34600–35140; 새공용탄커널0|
|몸체/스킨/소리·표시|21558–21761,23292–23308,24724–24790,53975–54019; 실화면/디코딩/원본자원인수미실행|
|지역/문·전환|60688–60793,41868–41957,43896; MAPS_CH3의권위참조|
|zone/저장/로비|30149–30215,61993–62163,63892–64093,I1–4742; 기존SAVE whitelist 참조|

G의 `mkEn(` 정의/사용 literal은총40행이다. 그중정의1·일반caller·다른장전용/type64·80·50·CH1고정spawn·debug·보스추가생성을구분한전체행/원문을 L/static-source.json의mkEn_calls에보존했다. 이40행을CH3자연생성40경로라고세지않는다. CH3에적용되는caller는§1.5와공통의존을참조한다.

| 원문 발췌 관측 | 실제 확인한 값 / 한계 |
|---|---|
|선택함수36건|4stage×§4.1 golden9. 원문rollEtype/rollEl만VM에서실행·명시stream과draw수관측, 게임/DOM/World/Godot부팅0. 각입력binary64를source-pick-goldens.json에기록|
|40 phase|phase=true/T5/sp1에서T3. 전용블록만, common이동tail없음|
|41 guard|guard=true/T2/sp1에서false/T150(Cd). 전용블록만|
|42 corpse|가까운순아닌ens첫dead만좌표−9999/HP15%회복. fixture 배열만|
|43/44/45|43 wind90·15/42,44 direct.7/bleed4,45 direct18. 충돌predicate는true fixture, 실벽/Player hurt는미검증|
|46 overwrite|ring+aoe동시due/d100에서최종D callback의6방향요청만관측, ring8은덮음. 실eProjAt/실탄spawn아닌요청수집|
|47 clone|constructor요청1/등록증가0. fixture mkEn은반환객체만공급, 실생성RNG/실패는관측안함|
|48 heal|먼거리첫손상아군만20%치유, 더가까운뒤원소는그대로. fixture ens만|
|49 overwrite/child|d110/모든timer due에서최종eSlamWind55/F요청10,40 constructor2/등록증가2. 자식constructor는stub라부모블록의U7회만관측, 전체생성RNG수아님|

관측10개는 위38필드/모든분기의실행조합을망라한테스트가아니다. 조건/타이머/요청·부수효과순서의기본반례를원문으로확인한보조증거다. 전체전수의근거는행색인/함수정의/원본본문정적대조이며현재게임도달성은 **미확인**이다.
