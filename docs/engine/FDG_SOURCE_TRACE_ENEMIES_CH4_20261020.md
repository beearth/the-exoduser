# 4장 고통의 화염지대 7에리어 적 — 원본 추적·이식 설계

작업 `trace-enemies-ch4` · 브랜치 `codex/trace-enemies-ch4-20261020`. **정적 원본 추적·후속 구현 지시서이며 제품 구현 완료가 아니다.** 이번 제출은 이 문서와 CHANGELOG_SYNC 최상단 절뿐이다. 코드·테스트·공용·기존 설계·저장 변경0, Godot 실행/import0. 실행 증거가 없는 것은 **미확인**이다.

## 0. 기준·선행 의존·분모

G=`2c3c211ff3c9e2be4e2754d608f9f0ea963588b2:game.html`, I=`동일 SHA:index.html`; 모든 원본 행은 fetch한 origin/main의 1-based다. game은65,692행/4,195,551byte/SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`, index는4,742행/353,568byte/SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12`다. CH3 문서 기준과 game/index byte가 같아 행이 유지된다. 아래 원격 제출은 읽기만 했고 병합·복사하지 않았다. 타 worktree/WIP는 조사하지 않았다.

보존할 주 체크아웃은 `R0=/Users/fordeargamers/Projects/exoduser-migration-20261001`이다. 이 문서의 원거리 선택 분류 **R**과 구분한다. R0의 branch/HEAD/추적 INDEX·WORK를 시작·종료에 따로 대조하며 R0에서 설치·파일 수정·branch 전환을 하지 않는다.

| 먼저 읽은 근거 | 재사용·경계 |
|---|---|
| main [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §0–6·색인 | 고정16개체와 전체 etype/actor 지원을 구분한다. 공통0..19·47의 AI·소환·탄·죽음은 기존 담당 의존. 과거6지원/10미지원 수는 현재 main exact9/7과 구분 |
| main [ENEMIES_CH2](FDG_SOURCE_TRACE_ENEMIES_CH2_20261020.md) §0–5·부록 | 생성 caller별 원소 부재·등록·후대입, 공통 FSM·네임드·zone/저장·곰치의 기존 권위 참조. CH2 30..39 전용 정책을 CH4 actor로 위장하지 않음 |
| 원격 [ENEMIES_CH3 제출본](https://github.com/beearth/the-exoduser/blob/20b2139a7f140f13dc37deb082e471c494d6fa77/docs/engine/FDG_SOURCE_TRACE_ENEMIES_CH3_20261020.md) 전체 | 요청한 형식·깊이와 §4.1 선택 leaf/API/원문 oracle·부록 전수 색인 재사용. **기준 main에는 이 문서 없음**. CH3 40..49 중 CH4 풀에도 있는47만 기존 actor 의존이며, 40은47의 clone 생성 부수효과로만 남음 |
| main [ELITES](FDG_SOURCE_TRACE_ELITES_20261020.md) §0–7·부록 | 전체31mods+4auras=35의 구현은 재설계하지 않는다. CH4 해금22mods/4auras·확률·9999 후 보정·caller 후대입만 기록 |
| main [WORK_BOARD](orders/WORK_BOARD.md)·[FEATURE_INVENTORY](FDG_FEATURE_INVENTORY_20261020.md) | PC P2-008a/FIX·b=CH1 actor/factory, P3-002=굴/동적등록, P3-003=지역 소유. inventory의 EN-00~99 데이터 분모는 구현 진척이 아님. 작업판·기존 담당 파일0줄 |

| EC2·EC3 원격 제출 / SHA | 기준 main 포함 | 읽은 모듈·실제 재사용 범위 |
|---|:---:|---|
| EC2-01 `c7e02549bec082cc31a86e606a61ec78f28dfb27` | 예 | `native_ch2_enemy_spawn_policy.gd`: pick_etype/pick_element·주입 RNG·NOT_READY 형식. guard는si4..9이며 CH4 지원 아님 |
| EC2-02 `a10924eb0ee725b993ab7bd1ea019d99180d4e1c` | 예 | `native_ch2_enemy_constructor_policy.gd`: 숫자 projection/provider/literal RNG 순서. guard는si4..9·etype30..39. 이 함수에50을 넣거나 HP 권위를 새 복제하지 않음 |
| EC2-03 `557eaff4deda2bd2dcac157a46615ee40fc433f9` | 아니오 | `native_ch2_poison_zone_policy.gd`: emitter clock→후속 fresh view/명령·hurt 뒤 재개 형식. type34/38 gas 전용; CH4 공통 사망 zone은별도 tickRate/조건 |
| EC2-04 `5a389578b9549b25538c665580e0d8bd906f9dbc` | 아니오 | `native_ch2_charge_slam_policy.gd`: outer idle 1회·clock/trigger 분리·독립 if·기존 charge/slam 소비 경계. guard30/32/39라55/57/59의 완성 모듈 아님 |
| EC2-05 `699f2a56f1b517f9c015c56366e044a860395475` | 아니오 | `native_ch2_brood_spawn_policy.gd`: constructor 동기 호출/재개·실제 RNG 사이에 다음 child 좌표를 추첨하는 형식. CH2 batch cap200·null skip·33·el\|\|P·_ri를51/59에 복제하면 틀림 |
| EC2-06 `c842acd1be41145af2fde40facc91665a9194102` | 아니오 | `native_ch2_beast_predator_policy.gd`: 현재 시점 callback/HP·이동 predicate·원배열 순서·명령 사본·JS int32 부품 참조. type35/36/37 전용이며 CH4 beam/buffer consumer 없음 |
| EC3-01 `e710442907e0cbc0fba09520388195faa596a3c0` | 아니오 | `native_ch3_enemy_spawn_policy.gd`: CH3 전용 selector·UTF-8 파일 oracle/binary64 검증 형식, guard10..13. EC4-01의 읽기 템플릿이고 런타임 선행 필수는 아님 |
| EC3-02 `fb8e80d03dfb7fa073ed9aaf1820bb86306b2c75` | 아니오 | 마감 원격 조회에 새로 나타나 본문/보고서를 읽음. `native_ch3_enemy_catalog_policy.gd`: catalog10행/31263–31298의38필드 slice만, mainEC2-02의 **Constructor.Draws를 실제 preload 재사용**. guard10..13/40..49, HP/전체actor/실연결 없음. CH4 catalog/23필드 지시의 참조 모델 |
| EC3-03 이후 | 미확인 | 마감 원격ref에 EC3-01/02만 확인. CH3 문서의 후속 순서안은 구현 존재 증거가 아니며 40..49 AI/actor가 이미 있다고 가정하지 않음 |

EC2-03→04→05→06은 각 앞 단위 끝에서 분기한 미병합 체인이고, EC3-01과EC3-02는 각각main6d987cb8에서 독립 분기했다. EC3-02는EC3-01 selector를 소비하지 않는다. ancestry를 기준 main2c3c211f와 대조했다. 이 문서는 **main2c3c211f에서 직접 분기**하며 위 미병합 제품을 포함하지 않는다. 이후 해당 정책을 실제 호출해야 하는 단위는 그때의 main 포함 여부를 다시 확인하고 선행 끝 분기/의존을 기록한다. 이미 main에 든 EC2-01/02의 기존 검증 수치도 이번 실행 PASS가 아니다.

**분모:** CH4 일반 선택 풀은 **31종=0..19+50..59+47**, 총가중치165. 기존 CH1~3 의존은 **21종=0..19+47**, CH4 전용 조사 대상은 **10종=50..59**다. 20..46/48/49는 이 풀에 없다. 47이 부수 생성하는40, 51/59의50 자식, 조건부90..99, `ib=true/etype0` 아레나 보스, 별도 `_fb/_wm`은 서로 다른 축이다. 31종 전부의 자연 스폰·실전 지원률을 뜻하지 않는다. 57/59의 “미니보스” 명칭과 `ib` 판정도 구분한다.

## 1. 원본 행 전수 추적

### 1.1 7에리어·일반 유형/원소 선택

G16633–16712: hell3/startSi14/stages7. STG.monLv400은 표시용 테이블이며 실제 생성 레벨은 G31125의 플레이어/난이도/stage offset 식이다. demo 기본은si0 뒤 종료(G16645–16648,43896)하므로 정식7에리어 자연 도달·실창 소스 일치는 **미확인**이다.

| 에리어 | si / hellFloor | STG 표시 / 아레나 보스 이름 |
|---|---|---|
|4-1|14/0|화염지대1구역 / 화염 악마|
|4-2|15/1|화염지대2구역 / 불기둥 수호자|
|4-3|16/2|화염지대3구역 / 용암의 심장|
|4-4|17/3|화염지대4구역 / 화염 전사|
|4-5|18/4|화염지대5구역 / 화염 쌍두|
|4-6|19/5|화염지대6구역 / 불벌레 군주|
|4-7|20/6|화염지대7구역 / 화염 감옥지기(isHellBoss=true)|

보스 원소는STG.be=F1, 생성은G30782 `mkEn(...,0,true,STG[si].be,0)`. 실제 ib 보스 패턴·moveset(G9983–9990/10008–10010)·부활/arena는 보스 담당 의존이며50..59 actor로 대체하지 않는다. 맵 좌표·굴 개수/예산·RLE 선택·사이트 실도달성은 별도 맵 추적/소유자의 인수 대상이며 여기서 새 배치를 만들지 않는다.

다음은G30976–30977의 **원래 순서**다. R은G30991의 선택 분류이며 공통 근접 접촉/후방 이동 목록이 아니다.

| etype | 가중치 | R | 기존 의존 / 전용 조사 |
|---|---:|:---:|---|
|0|5||CH1 crawler exact profile 의존|
|1|2|R|CH1 hive·공통 탄 의존|
|2|10||공통 근접·비활성 돌진 복원 금지|
|3|5||기존 type3 recipe/actor/binding 의존|
|4|5||CH1 spine/ice exact profile, 다른원소 별도|
|5|4||공통 windup/탄·사망 의존|
|6|5||공통 방패·호위·피격 의존|
|7|8|R|기존 TP/type3 소환·M30 의존|
|8|2|R|공통 공격·사망 의존|
|9|5|R|공통 의식/부활 의존|
|10|14||공통 은신 의존|
|11|5||공통 소환·후방 유지, 선택R 아님|
|12|8||공통 광폭 의존|
|13|2|R|공통 web 의존|
|14|6||공통 비행·급강하 의존|
|15|3||공통 사망분열 의존|
|16|6|R|공통 trap 의존|
|17|4|R|공통 etype13 소환 의존|
|18|6||공통 흡혈·접촉 의존|
|19|3||공통 slam 의존|
|50|8||불규칙 이동/무작위 windup, 51/59 자식|
|51|4||근거리 windup·사망50 둘 분리|
|52|6||Player KB 당김·근거리 windup|
|53|3|R|전조 후 beam 플래그 이동탄·아군 baseAtk 강화|
|54|4|R|hanging→뒤 이동/짧은 windup|
|55|10||direct charge22·사망8방향탄|
|56|5||전조 후 핏방울3방향 요청|
|57|2||curl 피격 return·slam·사망 근거리 피해|
|58|4||60개 위치 기록·공격 상태 모방|
|59|1||4phase 순환·50 소환·6방향탄·감속·사망탄|
|47|10||**기존 CH1/PC·CH2/CH3 의존**, clone40/TP 재구현0|

R 교집합은 `[1,7,8,9,13,16,17,53,54]` **9종/가중치36**, 비R22종/129다. G30993–31016: 첫U<.5면 R풀의 다음U×36/strict `<` 가중합, 나머지는 전체165 float64 CDF를 최대12회 추첨하여 R 기각, 모두 실패하면etype2. type RNG는2..13회. 표의 가중치는 두 분기·R 기각을 적용하기 전 값이며 최종 출현확률이 아니다. CDF는각 weight/165를 순서대로 더한다. 전체 풀1회·정수 재매핑·무조건 균등31종으로 바꾸지 않는다.

G30985/31017–31022: 첫U<.45면F, 아니면 다음U×6 trunc로 `[P,F,I,D,L,H]`. 이상적 독립 U 기준 **F=13/24(약54.1667%), 다른5원소 각11/120(약9.1667%), E=0**다. “화염지대=전부화염/얼음금지”가 아니다. EL은P0/F1/I2/D3/L4/H5/E6(G14333–14344), ETYPE_ERES는120×7 모두0. 불 면역/얼음 약점을 발명하지 않는다. 소환굴은 **rollEl 없이undefined**, 문지기/호위는F 고정, 51/59 자식은 **e.el 그대로**이며 P0도P0 유지(§1.5). caller를 한 분포로 합치지 않는다.

### 1.2 catalog·HP식·생성 순서와 전용 필드

G30823–30920 literal. 아래 HP/ATK/poise/shield%는 **catalog**이며 실제 actor HP/ATK/방어가 아니다. rawSPD는0이면0, 그외max(.2,raw×1.3) 후 생성 jitter를 더한다. 반올림 표기를 exact golden으로 쓰지 않는다.

| etype / 이름 | HP/ATK | raw SPD | r/poise/shield% | range | 색 |
|---|---|---:|---|---:|---|
|50 기형 보행자|32/12|.36|10/12/0|400|#554433|
|51 융합체|96/16|.12|20/40/65|400|#665544|
|52 입 괴물|80/24|.09|18/35/0|400|#774433|
|53 눈알 괴물|26/18|.18|12/10/0|800|#887766|
|54 거꾸로 매달린 자|22/2|.54|10/3/0|600|#443333|
|55 뼈 짐승|38/16|.39|10/12/0|400|#ddccaa|
|56 살가죽 없는 자|48/12|0|20/45/75|400|#cc5544|
|57 태아 거인|128/18|.45|10/12/0|1000|#998877|
|58 거울 괴물|128/24|.15|25/40/0|600|#aaaaaa|
|59 괴물길 지배자|224/30|.18|30/65/0|1000|#332211|

G31120–31363 생성 공통은 CH1/CH2 추적 및EC2-02의 provider 경계를 재사용한다. finite좌표→canMv/safePt→레벨→elite/mods→speed/r RNG→수치→원래 object literal 순서→skin→return. 실제 수치는 다음 원연산 순서다.

- `L=max(1,(P.lv||1)+(DIFF_LV_OFF[OPT.diff]||0)+(G._stageDiffOff||0))`.
- `B=(L<=500?.4*L*L*L+199*L+100:50000000*pow(1.0014,L-500))*2.925`; `pacing=1/(1+min(9,max(0,L-1))/18)`.
- non-ib `HP=floor(floor(B*pacing*dm*tier.hpMul)*(1+si*.02))`; `ATK=floor((50+L*1.95)*.6*dm*tier.atkMul)`. dm 표/offset은G9272–9277. 보스24배는50..59의일반actor에적용하지않는다.
- `speed=(mappedSPD+U*.08)*1.5`→M02이면×1.5, `r=(catalogR+U*2)*2*tier.scaleMul`. 56도jitter가남아M02전speed0..(.12미만). poise/maxPoise/eShield/eShieldMax는**생성HP**(G31164/31184), catalog shield65/75%가아니다.

예: L1/dm1/tier0의 si14는 HP1120/ATK31/poise1120/shield1120, si20은HP1225/ATK31다. 원문식24산술표본(L1/500/501×si14/20×4tier)은L/source-selection-goldens.json; 전체 플레이/레벨 동등성 검증은 아니다.

**50..59 모두 `_noProjEtypes`에 포함**(G31154). 기본projCd9999이지만 M02×.85 trunc→tier1/.8·2/.7·3/.6 trunc도 적용된다. 자연tier0=9999, tier1=7999/2=6999/3=5999, M02 동반tier1=6799/2=5949/3=5099. 따라서 정예는 common `projCd<9000`에 들어갈 수 있다(G40505–40518). `_noProj`라는 이름만 보고 모든 변종을 영구 발사금지로 고치지 않는다. 초기projT는모두180+120U이고 전용 AI의cooldown과 별개다. tier0+M02 후대입 같은 비자연 입력도 원문 순서를 보존한다.

G31165–31359의 literal은 st2→facing→tier≥2 aura→projT→bossPatT→타etype 전용timer→항상 `_bossOrbitAng`→CH3 timer→아래23필드→후속 장/rare 필드 순서다. **`_erraticAng`는50이 아니어도 항상 U를 소비한다**. 공통/타장 초기화의 RNG를 이 표 앞으로 당기거나 삭제하지 않는다.

| etype / G 행 | 전용 초기 상태·timer (각 U 별도, tick) |
|---|---|
|50 /31300|_erraticT=30+30U(타etype9999), _erraticAng=Uτ(모든etype)|
|51 /31301|_amalgCleave=true(타etypefalse), _amalgSplit=false. Cleave는이후읽기없음|
|52 /31302|_tongueCd=160+60U → _tongueT=60+30U|
|53 /31303|_gazeCd=180+60U → _gazeT=80+40U → _gazeAng=0|
|54 /31304|_hangCd=200+60U → _hangT=80+40U → _hanging=true|
|55 /31305|_boneChargeCd=120+50U → _boneChargeT=50+30U → _boneDeath=true|
|56 /31306|_bloodCd=100+40U → _bloodT=40+20U|
|57 /31307|_curled=true → _curlTimer=300+120U(타etype0)|
|58 /31308|`_mirrorBuf=[]` (타etype null) → _mirrorDelay=60(모든etype)|
|59 /31309|_overlordPhase=0(타etype−1) → _overlordCd=120(타etype9999)|

해당etype가 아닌 전용Cd/T는9999이고 `_hanging/_boneDeath/_curled`는false다. `_eyeBuff`는constructor에 없고53이 아군에 처음 쓰는24번째 추적필드다. `room`과`_ri`를 자동 대체하지 않는다. 47의constructor/clone/TP는기존CH1~3 의존만 가리킨다.

### 1.3 4장 전용 AI — 47/0..19는 기존 의존

공통prefix(G38584–38884)의피격/경직/거리/ATKreset·projCharge·st2 감소 후 전용 블록이다. 각 블록은처음 `etype && s==='idle'`를1회 검사한다. 내부 독립if는state가바뀌어도 뒤조건을계속 평가하고, 마지막common switch는**변경된현재state**를소비한다. 전용block만으로전체updateE/실효이동/실피해를완성했다고하지않는다.

| etype / G 행 | 정확한 전용 분기·후속 소비 |
|---|---|
|50 /39510–39518|erraticT−sp, ≤0이면**angle=Uτ 먼저**, T=30+30U. d<250에서d<50이면erraticAng, 아니면facing+sin(_now*.005)*.5로speed×(_aSpdM\|\|1)×sp/canMv 이동. 별도d<30+r에서만확률U<.03sp, 성공시telegraph20/windup/st2=10+trunc(20U). probability clamp/재시도없음. 뒤common추격과겹칠수있음|
|51 /39521–39523|idle·d<35+r이면telegraph20/windup20. `_amalgCleave`를읽는전방위전용피해없음. G41232–41240의공통windup→attack→조준탄1발을소비. 사망분리는§1.5|
|52 /39525–39537|tongueT−sp, T≤0·40<d<1200이면현재P→actor각. P.s가**charging도dodge도아닐때** P.kb+=방향×4/연출. 차단돼도T=Cd·혀text/SFX 실행. 뒤독립d<25+r이면telegraph20/windup15. d42/r18에서당김과windup동시가능. `charge`와`charging`을동일시하지않음. 삼키기/직접hurtP/광역이빨피해없음|
|53 /39539–39555|gazeT−sp, T≤0·30<d<1200이면T=Cd/eShootWind60/chargeEl=e.el. callback **실행시현재P 조준**·_gazeAng갱신·_spawnBossProjectile(중심좌표,속도4,rawtrunc(atk*.8),e.el,life/ml120,#ff6600,size2,beam=true). 뒤독립U<.005sp이면shQuery(x,y,250)의원순서에서자기제외·alive·!ib·!_eyeBuff 전부에flag=true/baseAtk=trunc(baseAtk*1.3)/atk=baseAtk. **TTL/정확도버프아님**. 별도d<120 후퇴도실행. query결과에추가dst필터를발명하지않음|
|54 /39557–39569|hanging이면d<150에서현재P.facing+π 뒤30px/canMv. 실패해도hanging=false/telegraph20/windup8/낙하연출. 아닌경우에만hangT−sp 후T≤0·d>300이면hanging=true/T=Cd. 진입한hanging쪽에서같은tick재은신없음. hanging은표시와이분기flag이며피격return/공통이동중지근거없음|
|55 /39571–39577|boneChargeT−sp, ≤0·40<d<1200이면T=Cd/**eCharge직행22**/현재facing방향. _chgSpd/Dur/Len/AimMax를새로쓰지않아이전값또는common `\|\|5` 사용. 22/30/43의동물90전조로대체금지. common sweep/피해/KB/벽은기존owner|
|56 /39579–39586|bloodT−sp, ≤0·30<d<1200이면T=Cd/eShootWind60/chargeEl=e.el. callback현재P각 기준−.3/0/+.3의3발 eProjAt(3,.6,e.el,120,#880022,1.5)요청. eShootWind여서bean변환우회/요청life는180으로확대. 별도광폭근접/추가enrage분기없음|
|57 /39588–39601,42158|curled면curlTimer−sp, ≤0이면false/일어남연출(현재거리<800일때만groggy, shake6은거리와무관). **그tick else의slam/RNG는실행안함**. 원래uncurled쪽이면d<100에서eSlamWind45, 뒤독립U<.003sp이면curled=true/Timer=200+100U; 따라서slam+재curl동시가능. hurtE는curled면return. “웅크리면정지”이동guard없음. 사망근거리피해§1.5|
|58 /39603–39617|_mirrorBuf가truthy이면idle호출마다현재P xy1개append. length>delay60이면shift한old좌표향해min(speed×(_aSpdM\|\|1)×sp,거리)만큼/canMv이동. **60개기록의지연**, 초단위/30f아님. 별도P.s=attack·d<40+r이면telegraph20/windup12; buffer가60개쌓이기전에도공격. nullbuf는둘다실행안함. 직접P공격기술복사없음|
|59 /39619–39646|overlordCd−sp, ≤0이면**Phase=(Phase+1)%4 먼저**. 초기0이므로첫실행1:50둘소환. phase2=eProjAt6방향(3.5,1,e.el,200,#ddccaa,4), phase3=d<200일때만P._freezeSlow=max(기존\|\|0,60)/Player위text/parts, actor위비명text·shake5는거리무관, groggy만현재거리<800. phase0=d<120이면eSlamWind45. 각phase후Cd=120+60U. HP절반phase/촉수/별도ib보스AI아님. 멀어서phase0공격안해도phase진행/Cd재추첨. 소환·사망탄§1.5|

53/56 callback은현재P/actor ATK/el을사용하므로예약시점값으로고정하지않는다. `_swFire`는실행때state가eShootWind인지/중단됐는지에따라전달과정이달라진다. lazy `_eyeBuff`로바뀐baseAtk는매updateE의atk=baseAtk reset후에도남으며CH3사제의현재atk일회쓰기와구분한다. 여기서영구는해당actor메모리수명에TTL/해제코드가없다는뜻이며저장영속성은미확인이다.

### 1.4 탄·공통 FSM·피격/사망·표시

| G 행 / 경로 | CH4에 필요한 공통 계약·기존 의존 |
|---|---|
|40456–40518|50..59는keep-distance/비행이동예외와_meleeET에전부없음. 공통idle추격×1.6·분리력은50/53/58전용이동과겹칠수있고54hanging/57curled도자동제외아님. 선택R을공통후방이동으로해석0. 근접접촉.8을이유없이추가하지않음. 정예projCd<9000이면range안projT→차징60, 일반9999는시작안함|
|41232–41240|windup소진→attack/st2=8(type3만5); st2≤5 그리고st2+sp>5인순간1회현재P조준입좌표에서일반탄1발. non-ib속도4/life60/size2/rawtrunc(atk), 이후recover35. 51의전방위피해/52의삼키기/58의플레이어스킬복사로바꾸지않음|
|40519–40538,40549–40559|55는direct22/기존chgSpd\|\|5. common charge는canMv·스윕·iframes·패링/charge상태→trunc(atk×30×elMul)/eModHitP·KB100·recover30. 57/59 slam종료는반경70+r·damage×2/elMul·PlayerKB10/주변aliveKB6·recover50. eShootWind끝에callback후null/chargeElnull/idle. 단일clock/피해writer소유를인수해야함|
|20049–20094,20119|eProjAt는life×1.5 trunc/입offset을적용. eShootWind안56은bean변환을우회해요청계수.6유지; 밖59의P는속도×1.3/계수1.2·D는×1.1/계수1·F/I는×1.05/계수1.2, L/H/undefined는요청계수유지. 각도0의입offset은ang\|\|facing도보존. 일반비보스이동탄은60tick warning, eShootWind끝·같은el이면즉시commit. 사망탄은dead warning으로사망좌표유지, world교체는취소|
|16911–16921,16940–17003|53의beam=true도moving packet을_spawnBossProjectile로요청하며연속bossLaser line피해가아님. 기존normalize/size×2/r×1.3/speed×1.8/dmg×2·density/_commit·후속속도정규화는공통탄owner의한번처리. 55/59blackBean은EL.P여도**Q전용magic**,redBean+P는physical/E. 색/이름으로Q/E변경0. 실제원소undefined의모든표시/탄분류동등성은미확인|
|42130–42173,42500–43118|57curl의return은bluebean최소10%/방패/HP감산앞. 54hanging의동일return없음. 일반피격·시체·정예부활·구울·보상과§1.5전용death는같은hurtE권위에서순서보존. 먼저alive=false/kill/region(G42702)→공통시체/연출/문지기/전염→CH4전용death→일반원소death-zone. 다른kill직접분기까지항상전용death를호출한다고단정0|
|42945–42961|공통non-ib/non-decoy·el≠P·(elite≥1또는U<.2) 원소death-zone: rawtrunc(atk*.25),tier≥2 size10/life360 그외7/240. D/F/L poisonZone tickRate40/35/30, I는dmg0 iceZone, H/undefined는gate RNG를쓸수있어도해당zone없음. CH4가화염이라는이유로전부F장판생성0; EC2-03의34/38생존gas와분리|
|21181–21373,53865–53895,53975–54019|50..59 procedural body case10개, hanging alpha·curl몸체/보호링·53gazeAng300px선·58최근10기록을3개간격잔상·59오라. render case는native actor지원증거아님. 정예이름/불꽃/guardian오라와고유장식은별도. 실아틀라스/화면·디코딩/가독성미확인|
|23292–23308,24724–24733,32079–32091|현재non-ib skin은장과무관하게_mobCh1/40스킨·etype/homeX seed, CH4스킨160순환아님. 50/51/52/53/56/57/58=FLESH,54/55=HUMANOID,59=MAGIC 사망소리분류;50..59는UNDEAD/BEAST집합에없음. 이름뼈짐승으로신성력/동물rule을추가하지않음. 공격voice/실재생은사운드담당의존|

위공통범위의전체본문은CH1_ENEMIES §2·ENEMIES_CH2 §1.4–1.7·ENEMIES_CH3 §1.4·ELITES에위임한다. 단일탄/실반사·commonhurtE·이동커널을이문서의후속leaf에서다시구현하지않는다. G38577–38579의atkTicketRequest는항상true인기존경로이며공격제한재도입금지.

### 1.5 생성 caller·50 소환·전용 사망·지역 연동

| G 행 | caller·CH4 차이·등록 경계 |
|---|---|
|31366–31386,31389–31515,31575–31607|formation은6 1~2와[1,7,8] 2~3/동일el. room/tile 함수는rollEl/rollEtype 뒤99 .005(스테이지1회)→else .05의90..98교체,33/64/97특수추가group은해당타입의caller분기만. initStage는RLE면room/corridor/최소80채움을건너뜀. **각CH4맵의실제RLE선택/초기named자연도달은미확인**이며함수정의만으로존재를확정하지않음|
|31612–31655|조건부문지기=[29,39,49,**59**,69,79,89][hell3], F1/ib=false. tile0후보조건통과시에만mkEn→HP/mhp×4, atk/baseAtk×2, rtrunc×1.4, poise/max80, elite3, dropTier4/_isGateGuard. mods/aura/shield/projCd재추첨/재계산없음. 호위4~6은rollEtype/F후elite1·HP/mhp×2.5만, 외곽8~12는rollEtype/rollEl. 후대입elite만보고전체constructor를챔피언으로재실행하지않음. 7맵에항상실제문지기존재는미확인|
|31029–31030,35636–35693|굴S50/M100/L100, si0할인없음. frame120후거리<2000trigger→다음갱신90delay→trunc(900/total)간격/생존700이상30대기→30좌표시도/나선/중심fallback→**mkEn(rollEtype(si),false,undefined,h.room)**. 실패도_spawned증가,성공reviveIframes15/ens등록. rollEl/rare교체/부가group을삽입하지않음. 맵별예산/좌표는맵담당 |
|35702–35717|riftPool은3장부터[0,2,4,6,10,12,14,19], el미지정. mkEn뒤elite=min(3,2+trunc(si/15))라**si14는2, si15~20은3**. HP/mhp×(2+.05si), atk/baseAtk×1.5, speed min(×1.2,1.5), r min(×1.15,24), 보라색/등록. mods/aura/projCd등급을후대입tier로재계산하지않음 |
|39624–39630|59 phase1: **거리/cap조건없음**. i0/1마다a=τ*i/2+U→현재부모xy+방향40→canMv(...,8)true일때만mkEn(stage,50,false,e.el,e.room)→**null확인없이ens.push(ne)**. 자식HP축소/elite제거없음. 각constructor/연출의RNG를다음angle과resetU보다먼저소비한다. EC2-05의cap200/nullskip/33을가져오지않음 |
|42827–42835|51최종death·!_amalgSplit이면2회. a=π*i+U→sd=18+8U→mkEn(stage,50,false,e.el,e.room), canMv사전검사없음. ne.hp=trunc(ne.hp*.35)/mhp동일, shield/max0, r=max(5,trunc(**부모r**×.6)), speed×1.3, child._amalgSplit=true→push/parts. **null이면후대입에서실패할수있고체크없음**. poise/max/baseSpd/elite/mods/aura를함께축소하지않음. 실null자연재현미확인 |
|42837–42842|55·_boneDeath이면8방향. 각U<.5black그외red/homing, **보통탄분기확률0**. black속도4.4/rawtrunc(atk*1.5)/P0/life400/size2, red속도3/rawtrunc(atk*1.2)/P0/life150/size1.5. _spawnBossProjectile요청뒤뼈파편연출. 주석의“30%”를golden으로쓰지않음 |
|42844–42848|57death:현재거리<80·P.iframes≤0이면hurtP(trunc(atk*.5)). **outer P.s!='charge' 조건없음**. 실hurtP내부거절은Player권위. parts15/shake8/groggy/text후속이피해성공에종속되지않음 |
|42851–42856|59death8방향/각U<.5black그외red. black4.4/×1.5/P0/life400/size2, red2.5/×1/**e.el**/life180/size1.5. hitStop max(trunc12×OPT/100), shake12/flash6/#ff4400등. 55와원소/계수를통일하지않는다. 60tick사망warning/commit은공통owner |
|38920–39048,39408–39429,40777–40814|공통7/11→type3, 17→13, ib보스소환은[0,2,3,3,3]/6원소/HP50%·shield0. 47의clone40은e.el\|\|D/e._ri/HP30%·shield0/atk50%이고**push없음**. 기존CH1~3담당의존, 51/59→50과등록/null/room/수치계약합치지않음 |
|38778–38797,38842–38870,42792–42801,43050–43054|M06/type3, M16동일etype, M08/type3, type15사망분열은기존정예/공통caller. CH4에서M16최초해금, M28은아직미해금이지만외부전파/수동입력은다른축. 고유51분리와M08을하나로중복제거하지않음 |
|60688–60793,41868–41921|지역분모는사분면굴예산, kill은_homeX/Y우선·ib제외(G60728–60731), gate10%/4지역clear→unlock. CH4 fbIdx=-1/CH1앵글러조건해당없음. 51/59동적50의kill권위와고정total의관계는P3-003/맵후속이인수, 분모에임의로자식수를더하지않음. death→아레나→다음stage21전환은별도Main/맵/보스owner |

전역 `_fbTick/_hmTick`의stage0밖clear와 `_wmTick`의stage0밖실행경로(G32145,61203–61327)는CH2/CH3추적참조만한다. 별도곰치/필드보스를31종에더하거나CH4전용으로재구현하지않는다. 59null push·51null dereference는원본잠재결함경로로보고할뿐이번보정0이다.

### 1.6 정예·네임드·표시의 4장 차이

| G 행 | hell3 계약 / 기존 ELITES 의존 |
|---|---|
|31033–31070|자연일반75%/매직15%/레어8%/챔피언2%. U1회strict<.02→3, <.02+.08→2, <.02+.08+.15→1, 그외0. ib/named90..99는tier0·등급RNG생략. tier배율/scale/드랍bonus는ELITES원문유지 |
|31044–31081|**22mods**=M01..16+M26+M27+M29..32. CH3대비새해금M13/14/15/16/27, M21없음. 공격M29..32에서tier1/2는1개, tier3는2개중복없이먼저선택, 나머지slot은공격외해금pool. 정예와유형별charge/slam은단일lock/clock소유 유지 |
|31083–31096,34394–34411|tier≥2는warCry/healing/haste/**guardian**4개중1개. guardian이CH4최초해금, range130/방어multiplier/min합성은ELITES §1.3 원문계약참조. `_eyeBuff`의baseAtk 영구변경과aurareset/leader수명을합치지않음 |
|31389–31515,40250–40448,42962–43043|named90..99는조건부교체의별도집합. etype58거울괴물≠92거울사도, 59일반/문지기≠99죽음, tier2“레어”≠named. 자연도달성·별도AI/보상은CH2/공통추적참조 |
|53975–54019|정예불꽃/표시이름/선택aura·curl면역상태표시를기존owner가소비. 해금22+4를전체35종지원완료/CH4실화면인수로세지않음 |

### 1.7 index·저장·수명 경계

I1–4742에는etype/위23필드/_eyeBuff/HELL_SPAWN literal참조0(원로그index-census.json). 이는런타임변경0의근거이며간접연계전체부재증명은아니다. G30149–30215의zone복원은저장된etype로mkEn재생성후일부수치만복원하고, G61993–62163/63892–64093의세이브/로드는기존whitelist소유다. _mirrorBuf/_eyeBuff/전용Cd를새영속키로추가하지않는다. stage재시작·zone복원·pause·큰sp·stun/freeze·deferred callback취소/죽음뒤경고·새자식registry수명은실제owner별인수전**미확인**이다.

## 2. docs 불일치 표

`docs/8.0몬스터디자인/`·`docs/9적ai패턴디자인/`와그하위총관리/공격/스킨/사운드/탄막/파이프라인을검색했다. 기존설계문서는수정하지않으며옛설계목표·내부주석과현재원문실행을구분한다.

| docs 위치 | 기록 | 최신 G 근거 / 판정 |
|---|---|---|
|몬스터_총관리.md:156,437–447,750대973–996|정정/정의는4장50..59, 상세제목은“5장 지옥의 군단”|G16637/30976–30977은hell3/si14..20. **상세제목잔존**, 장/etype재배정0|
|스테이지_몹분배.md:15–17,30,41|CH4 160풀/얼음제외, 스킨순차전부등장|G30977 논리31풀, rollEl에I포함, G23292–23308은ch1/40스킨seed. **시각/논리분모·전투원소/색감구분**|
|같은문서:55|4_1~4_7보스미배치|G16690/16700–16712의7이름/STG, arena생성30782가있음. **옛배치표**. 상세보스이식은별도담당|
|총관리:987–996/공격:376–388|catalog HP/ATK/SPD/r 표|catalog10행자체는대체로일치. G31125–31184는레벨curve·speed보정/jitter·HP=poise/shield. **카탈로그를실수치로읽으면불일치**, 56의0SPD도생성/실이동0보증아님|
|총관리:439,988|51전방위공격|G39521 windup20, _amalgCleave읽기0, G41233조준탄1발. **전방위damage분기근거없음**, 사망분리2개는일치|
|총관리:440,989/공격:381|52삼키기·이빨광역|G39525–39537은KB당김/일반windup15. **삼키기/별도광역판정없음**, charging/dodge만당김쓰기제외|
|총관리:441/공격:382|53응시직선빔·몹정확도버프|G39544 moving beam=true packet/ATK.8, 39550은baseAtk×1.3/flag. **정확도아님/continuous laser아님**|
|총관리:442,991/공격:383|54천장매달림→낙하|G39557–39569는P뒤30px이동시도/실패해도windup8. **천장물리/정지·면역증거없음**, render투명표시와분리|
|총관리:443,992/9_AI:269–276|55돌진+물기, 동물형90전조3종|G39571–39577 direct22, 90전조표는22/30/43만. **55를90전조로확장금지**, 공통charge외별도물기근거없음|
|총관리:444,993/공격:385|56광폭근접+핏방울|G39579–39586는전조60/3발, 고유광폭/근접if없음. **광폭서술과실행분리**|
|총관리:445,994/공격:386|57미니보스·웅크림무적|G42158무적return은일치. G39588은idle timer/45slam, pool/constructor는ib=false. **보스24배/부활/정지부여근거없음**|
|총관리:446,995|58모방0.5초딜레이|G31308delay60, 39606–39608은idle호출당1위치, 60초과shift. **60기록지연**, 공격모방은buffer대기없음|
|총관리:447,996|59촉수/미니보스멀티패턴|G39619–39646 phase증가후1→2→3→0, 소환/6탄/감속/slam. **촉수/HPphase근거없음**, 일반과문지기후대입별도|
|ENEMY_AI_TEAM_MASTER.md:49대총관리:710/공격:293/FIELD_PROJECTILE_CADENCE:15|50..59 projCd9999“발사안함”, 다른문서는M02/정예보정유지라고명시|G31154–31160의보정후tier1이7999, G40508의<9000통과. **모든변종발사금지로읽는설명은불완전**, 이미보정예외를기록한문서는일치|
|9_적AI패턴디자인.md:202–215|어택티켓최대3설계|G38577–38579는항상true. CH1/CH3기존불일치참조, **공격제한재도입0**|
|원본주석G42836/42850|55/59사망탄“30%무지개탄”|실제각U<.5black/≥.5red, 보통분기확률0. **원본내부주석/본문차이**, 주석을30%golden으로채택0|

카탈로그/현행탄막cadence/사운드분류중일치한부분을새불일치수로부풀리지않는다. 실외형·animation·VFX/사운드품질은정적표로인수할수없고미확인이다.

## 3. Godot 의존과 빠진 것

| 현재 실제 파일·의존 | 이미 있는 것 | CH4에서 빠진 것 / 소유 경계 |
|---|---|---|
|enemy_factory.gd:25–31/60–61, test_encounter_factory.gd:16|CH1 stage0/time0/schema/known29types·exact9/16 profiles. 전용etype0/1/4/20와eye actor등|50..59는KNOWN_ETYPES에없고CH4admission/actor모두0. 데이터/주석검색만으로지원상향0. 공통0..19/47도모든원소·skin·정예지원이아님|
|main EC2-01/02|주입RNG selector, constructor numeric projection|guard4..9/30..39. CH4를지원하게가드만풀거나별도HPauthority복제0. CH423초기필드/해금/공통RNG연결은별도인수|
|미병합EC2-03..06/EC3-01·02|§0의순수정책·콜백/constructor재개/명령계획형식, 동기fresh view검증|CH4전용유형·beam/KB/버프/위치buffer·death child/탄field가없음. guard/domain수정없이형식재사용, 실제호출의존은merge상태재확인|
|enemy_mod_m29.gd / native_m30_modifier.gd|기존charge/경고/owner-local lock·M30부품|55direct22와57/59slam/CH4전체mods·4auras조립은미완료. _chgSpd잔존/default5, 같은tick순서·lock한번감소인수|
|native_normal_enemy_hurte.gd / native_source_normal_enemy_fields.gd / native_dedicated_enemy_hurte_owner.gd|엄격한sourcefield/HP·poise·shield기존권위|57curlreturn·54비면역·53allybaseAtk쓰기와새10유형전체피격/죽음/부활consumer없음. 직접NodeHPsetter우회0|
|native_element_projectile_emitter.gd / enemy_projectile*.gd|P/F/I/D/L/H부품, 기존M29/TP탄소비|53beam packet/56deferred3발/59eProjAt/55·59deathblack-red와warningworld/lifecycle/정규화동일성의CH4통합증거없음. 원소6개부품존재≠전체탄완료|
|type3_spawn_recipe.gd / type3_summoned_actor.gd / type3_native_binding.gd / type7 runtime·teleport|공통3자식/6원소·7의부분TP/소환부품|51/59자식은50, 47clone은40. type3로대체하거나47등록누락자동보정0. 50실actor·동기constructor/registry권위없음|
|native_spawn_hole_system.gd:37/62/476 / native_regions.gd|STAGE0/HELL0선택/동적등록일부, 지역계산/killowner|CH4 31풀/undefined/7맵·문지기59·동적50분모/지역/전환admission없음. 이파일들을새단위로수정하지않음|
|world.gd / main.gd / player.gd / State·saveadapter|기존실RNG/이동/공간query/피해/영속권위|CH4부팅/등록·현재P/공간query결과순서·동기KB/hurt후재개·전체save는미확인. 순수leaf를실연결완료로보고하지않는다|

main에새CH4전용enemy policy/actor파일은발견하지못했다. 후속정책이완성돼도실행/actoradmission/등록/메타·저장/7맵자연플레이는별도인수다.

## 4. 작은 이식 단위 순서안

공용0줄의새계산leaf부터시작하고실연결을마지막별도통합배정으로분리한다. 원문이모순처럼보여도“수정된설계”로바꾸지않는다. 아래단위는이번구현승인이아닌후속배정안이다.

### 4.1 1번 EC4-01 — 4장 유형·원소 선택 순수 정책 (구현 지시서)

**산출 범위:** 새 `godot/scripts/native_ch4_enemy_spawn_policy.gd`·`godot/tests/test_ch4_enemy_spawn_policy.gd`와자기UID2, `docs/engine/orders/reports/ec4-01_REPORT.md`·CHANGELOG_SYNC자기절. 기존selector/공용/다른담당/원본/저장0줄. mainEC2-01의API/진단/원연산형식을재사용하고, 원격EC3-01의장별leaf/파일oracle을참조한다. selector범용추출/기존stageguard확장은공용변경이므로이번단위에서하지않는다.

1. RefCounted `pick_etype(stage:int,random_unit:Callable)->Dictionary` / `pick_element(stage:int,random_unit:Callable)->Dictionary`. stage14..20만허용, 다른stage는0draw NOT_READY(unsupported_stage). 유효Callable없으면0draw NOT_READY(invalid_random_callable). 가드순서는stage→callable→sample이다. 자체randf/seed/실RNG/State/actorowner없음.
2. §1.1의POOL31쌍을**원순서그대로**보관, R9개/가중합36, 전체165/비R129를검사. `HELL_SPAWN[3]`/`_RANGED_ET`/`_HELL_CDF`/rollEtype/rollEl의현재원문으로golden을생성한다. 31종과가중치를GDScript기대값만으로검사하지않음.
3. 첫U<.5의R가중합→첫U≥.5의원float64CDF/reject최대12→fallback2/13draw, 엄격< 경계보존. **weight를정수누적으로바꾼정규화CDF금지**. 반복Rdraw도소비수에포함하며실패후rewind0.
4. 원소첫U<.45→F1/1draw, 아니면두번째U×6 trunc→0..5/2draw. P/I/D/L/H도허용, E6제외. 소환굴undefined/GateF/child직접e.el은caller계약이며selector에통합하지않는다.
5. READY=`status,value:int,draws:int`, NOT_READY=`status,reason,draws`/value없음. 샘플bool/null/string/Array/Dictionary/NaN/±Inf/음수/1이상은보정·재추첨없이지금잘못읽은1회를포함해NOT_READY(invalid_random_sample)로진단. int0은정상샘플. 기존EC2/3API와같은정확오류/소비계약.
6. 원문발췌/전체gameSHA와roll함수pin검사. Node24실행경로는인자(예 `--node-bin`), JSON은Node가UTF-8새임시파일에쓰고Godot가읽기/삭제. OS.execute콘솔은진단만, output[0]/콘솔decode에의존0. 기존EC3-01처럼test에원문추출JS를내장해격리userdir에임시.cjs를생성/정리할수있으며별도tools커밋파일을필수로하지않는다. acorn은lockfile에맞는node_modules를작업worktree에준비, 주체크아웃 R0에서설치변경0.
7. 새격리명 `EXODUSER-ec4-01-Isolated-20261020`, 기존회귀는각파일상수격리명. 모든Godot실행전 `pgrep -f "Godot.app/Contents/MacOS/Godot" | wc -l`, 2이상이면30초대기/재조회. 이추적작업은Godot를실행하지않았으며이는미래구현자의검증지시다.

| 기본 golden (각si14..20, 총63표본) | 원문 결과 / 소비 |
|---|---|
|type [0,0] / [0,2/36] / [0,.999999]|1/2, 7/2, 54/2|
|type [.5,0] / [.5,6/165를12번]|0/2, fallback2/13|
|element [.449999] / [.45,0] / [.45,1/6] / [.45,.999999]|F1/1, P0/2, F1/2, H5/2|

**검증 범위:** 각R정수누적경계·각전체CDF경계의직전/동일/직후binary64값, 0/.5/1직전, firstU .5/.45엄격경계, 0..11회R기각후비R성공, 12연속R이면fallback2/총13draw 및뒤sentinel미소비, stage13/14/20/21, 부적절샘플이첫/뒤k번째에오는경우. 값·실제소비열·draw수·입력불변을원문VM과비교, 허용오차/평균확률검사만으로대체0. 별도의후속draw까지대조해RNG흐름확인. 범위밖error도단정하며실패case삭제/가짜PASS금지.

**회귀:** main의 `test_ch2_enemy_spawn_policy`/`test_ch2_enemy_constructor_policy`, `test_encounter_factory`, `test_contracts` 및기존실행가능selector회귀. EC3-01이인수된기준이면그selector도회귀하되미병합코드전체를임의로끼우지않고의존을기록. 기존선재실패/ERROR/WARNING을원문보고, RESULT/skip/완료그룹을확인한다. test/API0행변경목표.

**완료 조건:** 새selector/검사만의실제원문대조·가드/경계/소비검사통과, 기존분모불변, 제품등록/HP/피해/AI/맵/저장실연결0, 공용0줄, 보고서·원로그·정상훅/자기branch push·원격SHA·DONE뒤worktree제거. factory/World/State/기존selector수정이필요해지면정확한접점과근거만보고하고BLOCKED, 임의확장하지않는다.

### 4.2 후속 순서 — 같은 etype/공통 부품을 중복 구현하지 않음

| 단위 | 작은 산출 범위 | 의존·정확 경계 |
|---|---|---|
|EC4-02|`native_ch4_enemy_catalog_policy.gd`/자기test:catalog10행·G31300–31309의23필드segment초기화|EC3-02의slice경계/API 형식과 mainEC2-02의 Constructor.Draws를 실제읽기재사용. 필요시기존JS int32부품사용. 공통HPauthority/elite/mods/aura를복제하지않음. 호출자는원래literal의이segment도달시공유RNG를공급, _erraticAng모든etype draw/부재·null유지. 전체constructor가필요하면공용지원분리배정전HOLD|
|EC4-03|50불규칙이동/무작위windup 순수정책/test|erraticT/angle→timer RNG순서, d50/250·30+r, .03sp/추가U, canMv, raw_now. 공통이동/공격writer·RNGowner복제0|
|EC4-04|51근거리trigger 및death50생성/후대입계획/test|EC4-02/03·동기constructor재개형식EC2-05참조. windup20/전방위추가0, 2child원순서/부모r·HP35%/shield0/speed1.3, null후대입실패경계. 실mkEn가없으면계획/HOLD만|
|EC4-05|52KB당김/근거리windup 정책/test|charging/dodge와charge구분, 40/1200·25+r엄격경계, 당김차단돼도timerreset/FX, 동tickwindup. 실Player KB는별도owner, 삼키기0|
|EC4-06|53clock/beamcallback/allybaseAtk 정책/test|EC2-06fresh callback형식. 현재aim/ATK/el, beamflag/60wind, .005sp, query250원순서·alive/!ib/!_eyeBuff·baseAtk30%/영구flag, 후퇴별도. 실query/fieldwriter/탄birthowner없으면연결HOLD|
|EC4-07|54hanging/뒤이동 정책/test|EC2-06ambush/read-onlypredicate형식, 150/300경계/실패도windup8, hangclockelse에서만. 공통이동/면역을새로가정하지않음|
|EC4-08|55directcharge trigger 및death8탄계획/test|EC2-04형식/기존M29-common FSM읽기재사용, direct22/40..1200, 기존chg필드불변. deathU8/50:50/항상P/red-black·사망warningowner. 동물90전조/중복탄커널0|
|EC4-09|56deferred3발요청 정책/test|현재P/ATK/el callback, 각−.3/0/+.3/요청.6·life120→180, eShootWind bean우회. 실callback수명·projectileowner별도|
|EC4-10|57curl/45slam/피격return요청·death근접명령/test|초기curl300..420/재curl200..300, else진입·slam후독립재curl, hurtEreturn위치, death80/iframe만, hurt후연출. 공용피해·무적·slam커널0|
|EC4-11|58위치buffer/공격모방 정책/test|append→>60shift/클립이동·sp0/.5/큰sp에도호출당1기록, 공격은60대기없음, nullbuf/입력사본/잔상자료. 임의초타이머/새저장키0|
|EC4-12|59clock/phase·50birth continuation·6탄/감속/slam·death계획/test|첫phase1/멀어도순환·Cd U마지막, 2child각도/constructor/다음각도RNG순서·cap0/nullunchecked, e.room/e.el직접. EC2-05형식만참조하고source계약은별도. common탄/실Playerwriter·full50actor없으면계획까지만/HOLD|
|EC4-13|기존0..19/47 exact 의존과새10종의actor별좁은consumer인수|CH1/PC·EC2/EC3선행소유자검수. 원소/정예/skin·모든필드/피격·death/revive·warning/registry/home를etype별확인. factoryfallback/guard삭제0, 공용actual통합배정전BLOCKED|
|EC4-14|7맵굴/문지기59·지역·arena·보상통합검수|MAPS_CH4/맵후속·P3-002/P3-003·보스/탄/메타/저장owner선행. hole고정분모/동적50kill·tile0guard/RLE/zone분기·stage21전환을실제권위로인수. 공용수정은별도배정|

같은표행의idle/death계획도리뷰범위가크면별도소단위로배정한다. 이목록은전체10actor동시구현승인이아니다. 23필드catalog/순수명령과실제움직임·피격·소환등록·게임완료를구분한다.

## 5. 공용 접점·미확인·제출

| 공용·다른 담당 위치 (이번0줄) | 실제 연결에 필요한 근거/권위 |
|---|---|
|enemy_factory.gd:25–31/60–61 및consume/admission|G31120–31363/각caller의schema·원소부재·skin·full actor/provenance, CH4stage와50..59등록을PC/factory담당과별도인수. 기존CH1 exact gate완화0|
|world.gd의RNG/collision/shQuery/ens/birth|G39550 query순서·canMv실패, G39629 null push대G42831 null dereference, constructorRNG/skin/FX사이에다음좌표draw. 명령leaf가실제registry/시간권위가되지않음|
|native_spawn_hole_system.gd:37/62/476·맵sourceowner|G35675 CH4풀/undefined, holebudget/7맵선택·tile0문지기, rift14→15후대입tier. HELL0를통째로교체하는접근0|
|native_regions.gd·Main지역호출|G60728 home우선kill/ib제외·굴고정분모·문지기10%/4지역clear. 51/59자식이더해져도total을임의가산하지않고실제owner가의도/원문대조|
|normal hurtE/sourcefields·player.gd|G42158 curlreturn위치, G39531 KB×4/39639 freezeSlow, 53baseAtk/eyeBuff, 57death후속, HP/poise/shield/실드랍·revive의단일writer. Q/E·blackBean magic/Q·blue반사불변|
|M29/M30·projectile/warning·HUD/SFX/VFX|G40519/40549 common charge/slam, G20065–20094 warningworld/dead/commit, beam/rawpacket정규화1회, callback실행시현재값. 기존자원/Clockowner를실소비하고가짜sink PASS0|
|main.gd/State/메타·saveadapter|실boot/arena/kill·XP/mats/drop/다음장·재시작, zone재생성/저장whitelist는각기존권위. buffer/flag/새savekey추가0|

**미확인:** PC최신실창source일치·7에리어자연스폰/같은seed첫N개체·각맵실제RLE/문지기tile0·전용10actor의모든원소/skin/정예admission·undefined의모든탄/표시consumer·51/59의실null실패전파/공간registry수명·53query결과/동기갱신순서·58pause/stun/큰sp실buffer동작·curl/hanging공통이동전체실효·모든death/부활/구울/메타·아틀라스/animation/VFX/소리/가독성/성능·영구저장. 이문서만으로완료율을올리지않는다.

원로그 L=`~/exoduser-wt/_out/trace-enemies-ch4/`. static-source.json/번호원문, references.json/고정원격본문·design-search.txt, source-selection-goldens.json, source-ai-observations.json은정적발췌/명시fixture관측이다. **게임/DOM/서버/World/실Player/Godot부팅0**, 기존PASS전용0. 주체크아웃 R0의branch/HEAD/INDEX/WORK를시작·종료시따로대조한다. main push/force/reset/add -A없음, 문서2경로만정상hook뒤자기branch push/remote SHA/DONE기록→자기sparse worktree제거, branch/log보존. 최종수치·SHA/cleanup은L/DONE.txt·submission.json참조.

## 부록 A. 50..59 직접 비교·case 전수 행 색인

“전수”는 G의 직접 `etype===/==/!==/!=숫자`·`case 숫자:` literal 검색, 부록B의 전용필드 전체 literal 사용, §1의 배열/Set 계산index·함수·공통caller 범위를 합친 뜻이다. 외부 동적 주입·별칭·자연 도달성 전체를 증명하는 용어가 아니다. 59의 `case 0..3`은 해당 전용블록 안에서 §1.3에 추적했다. render case는 actor 지원으로 세지 않는다.

| etype | 직접 비교/case 원본 행 |
|---|---|
|50|21181, 31300, 39510|
|51|21198, 31301, 39521, 42827, 53867|
|52|21218, 31302, 39525, 53869|
|53|21236, 31303, 39539, 53871|
|54|21254, 31304, 39557, 53874|
|55|21272, 31305, 39571, 42837|
|56|21295, 31306, 39579, 53879|
|57|21318, 31307, 39588, 42158, 42844, 53882|
|58|21340, 31308, 39603, 53886|
|59|21355, 31309, 39619, 42851, 53892|

## 부록 B. 전용23 constructor 필드·추가1 target 필드의 원본 행 전수

`_amalgCleave`는 선언만 있고 읽기0, `_eyeBuff`는53이 아군에 lazy 생성한다. `_mirrorDelay`·`_erraticAng`는 타etype 초기화에도 남는다. 공유 `s/st2/_swFire/_swChargeEl/_telegraphT/echDx/echDy` 등은 기존 공통 소유이며 §1.3–1.4 범위로 추적한다.

| 필드 | 모든 literal 사용 행 |
|---|---|
|_amalgCleave|31301|
|_amalgSplit|31301, 42827, 42831|
|_bloodCd|31306, 39582|
|_bloodT|31306, 39580, 39581, 39582|
|_boneChargeCd|31305, 39575|
|_boneChargeT|31305, 39572, 39573, 39575|
|_boneDeath|31305, 42837|
|_curlTimer|31307, 39590, 39591, 39599|
|_curled|21320, 31307, 39589, 39592, 39599, 42158, 53882, 53984|
|_erraticAng|31300, 39512, 39514|
|_erraticT|31300, 39511, 39512|
|_gazeAng|31303, 39544, 53872|
|_gazeCd|31303, 39542|
|_gazeT|31303, 39540, 39541, 39542, 53871|
|_hangCd|31304, 39567|
|_hangT|31304, 39566, 39567|
|_hanging|21256, 31304, 39558, 39563, 39567, 53875|
|_mirrorBuf|31308, 39605, 39606, 39607, 39608, 53886, 53888, 53889|
|_mirrorDelay|31308, 39607|
|_overlordCd|31309, 39620, 39621, 39644|
|_overlordPhase|31309, 39622, 39623|
|_tongueCd|31302, 39533|
|_tongueT|31302, 39526, 39527, 39533|
|_eyeBuff|39550|

## 부록 C. 공통 범위·정적 관측 기록

| 범위 | G 행 / 검토 경계 |
|---|---|
|난이도/원소/장|9272–9277, 14333–14344, 16633–16712|
|catalog/선택/정예|30823–31118; 전체35는ELITES 참조|
|전체constructor/literal|31119–31364; 순서와동기source provider 경계, 새23필드31300–31309|
|CH4 AI 전용10블록|39508–39647; 공통prefix/FSM을합친전체actor실행아님|
|생성/caller|31366–31664, 35636–35719, 39624–39630, 42827–42835; mkEn literal 정의/호출 총40행 원문은L/static-source.json|
|공통AI/발사|38584–38884, 40444–40559, 41232–41240|
|피격/죽음/보상|42130–42173, 42500–43118; 새전용death42825–42857 이후 공통원소zone|
|탄요청/예고/정규화|16911–17003, 20049–20155, 34600–35140; 기존공통owner|
|몸체/스킨/소리/오버레이|21181–21373, 23292–23330, 24724–24790, 32079–32091, 53865–54019|
|지역/문/전환|60688–60793, 41868–41957, 43896; 맵/지역/보스후속소유|
|zone/저장/로비|30149–30215, 61993–62163, 63892–64093, I1–4742; 기존SAVE whitelist|

| 원문 발췌 관측 | 확인한 표본 / 한계 |
|---|---|
|선택63개+CDF구간31개|각stage14..20의§4.1 golden9개. 원래함수/선언만VM실행·실제U열/소비수/binary64 운반. CDF31구간은첫후보선택/기각후0 fallback 표본이며모든경계검증완료주장0|
|HP식24개|L1/500/501×si14/20×4tier, dm1/non-ib. source표현식만산술관측, 전체constructor/다른난이도/실제부팅0|
|50/51|50 timer소진에angle→timer→공격확률→windup U4회, windup20. 51 전용if는windup20만. 전용block 뒤공통이동/공격은관측0|
|52 2개|d42/r20에서charge상태는KB−4, charging상태는KB쓰기없음. 둘다Cdreset/windup15. 실제collision/hurtP/상태전이는fixture밖|
|53|전조후callback에서P=(300,400)/ATK101로바꾸니그현재값의beam요청. 살아있는non-ib아군baseAtk10→13/_eyeBuff, alive=false제외. query/packet은수집fixture, 실제query순서/피해/탄birth0|
|54/55/56|54 canMv=false도hanging해제/windup8. 55 direct22·기존_chgSpd32유지. 56 callback현재ATK101의3요청. 실제commoncharge/emitter미실행|
|57|uncurled/d90에서slam45뒤독립U성공으로curled=true/Timer250. 전용죽음if도P.s=charge·d79에서hurtP5요청. 실제Player가받았다는뜻아님|
|58 2개|buffer0개도P.attack이면windup12. 60개buffer에서sp.5인1호출은append1/shift1/60개유지. common추격을합친최종위치·실시간지연미관측|
|59 2개|초기phase0/Cd0은phase1·constructor요청2/등록배열증가2, 명시null반환fixture도push됨. 다음phase2는eProjAt요청6. 실제constructor/ens/spatial등록/RNG수는미검증|
|51death|constructorfixture HP1000→350/shield0/부모r20→12/speed1→1.3, poise1000/baseSpd1유지. child2개. 실제mkEn/skin/elite/collision없음|
|55/59death|각U8개·.49/.5교대에서black4/red4 요청. warning/spawnProj/normalize/실제탄밀도·접촉미실행|

AI/전용death 관측은 총17개 명시fixture다. 원본의 해당if 전체를발췌하고canMv/shQuery/mkEn/hurtP/FX/SFX/발사는읽기predicate/반환fixture/요청수집으로대체했다. 53/56 callback만수동으로현재값변경뒤실행했다. FX의전역RNG/실clock·physics·fullconstructor는관측범위밖이며 **제품 테스트 PASS/실전 증거로 합산0**이다. 최초관측오류가나면원문을보존하고수치/분기를고치지않는방식으로fixture만검토한다.

선택함수 SHA256: rollEtype `b816226c2ae3db962ca2d82dc4730ab8817e6cbc314a42509dea6ee791f23d71`, rollEl `84f0a33ae64d8d6a47eaaa8d46dd0084c315c3ac4b999a549593b6f6d55efbd6`. 선언/표현식의행·SHA는L/source-selection-goldens.json의pins에보존했다. 미래구현자는자기착수시latest main/game byte와행을다시대조한다.
