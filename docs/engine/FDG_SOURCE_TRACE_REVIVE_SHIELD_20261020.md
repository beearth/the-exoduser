# 부활·에너지쉴드 원본 추적 및 이식 단위안 — 2026-10-20

## 0. 작업 경계와 판정

| 항목 | 확인 결과 |
|---|---|
| 작업 | `trace-revive-shield` / `codex/trace-revive-shield-20261020` |
| 소유 | 이 추적 문서 1개만. 코드·테스트·기존 설계 문서·작업판 변경 없음 |
| 체크아웃 | `~/exoduser-wt/trace-revive-shield` — fetch 뒤 최신 `origin/main`에서 생성 |
| 기준 체크아웃 R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, 브랜치 `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`. 시작 tracked INDEX/WORK diff 각각 없음. 브랜치 전환·수정·커밋 없음 |
| 사전 확인 | `orders/WORK_BOARD.md` 전체, `FDG_GAME_DEVELOPMENT_PLAN.md` 단계표·작업표(29–88행), 근거 폴더 3문서 전체 |
| 중복 경계 | P2-001l 레슨·공용 입력, P3-002 소환굴·동적 등록, P2-006a 드랍, P2-004b 펫 대사, QA-002 테스트 및 STARTER-REGIONS 담당과 구현을 중복하지 않음. 해당 경로는 아래 연결 요구 목록만 기록 |
| P4 위치 | 계획 35행 P4=HUD·설정·저장·메타진행 연결, 83행 P4-001=허용 범위 확정·미배정. 이 문서는 조사 산출물이며 P4 구현 완료/착수 승인이 아님 |
| 보호 | **docs/2_3·Q/E·세이브 형식: 보호.** 현 계약을 표시·추적할 뿐 변경을 제안하지 않음. 공격 티켓 신규 구현 없음 |
| 증거 한계 | 원본 및 실제 Godot 파일·기존 테스트의 assertion을 정적으로 대조. 이번 작업에서 Godot/브라우저/게임/테스트 실행·import·빌드·화면 검수 없음. 아래 ‘이식됨’은 명시된 소스 경로 존재를 뜻하며 실플레이 PASS가 아님. PC 실행·동기화는 미확인 |
| 제출 방식 | 자기 브랜치 정상 커밋·push만. main 병합/갱신은 총괄 검수 대상. 작업판의 행 추가·별도 REPORT 요구보다 이번 사용자 지시 ‘새 문서 1개’가 우선하여 그 파일들은 수정하지 않음 |

행 번호는 아래 동결 SHA의 파일에 대한 1-based 번호다. 기존 Godot 주석의 과거 원본 행(예: 28622)은 현재 원본 27961과 다르므로 현재 행을 따로 적었다. `game.html:L…`는 특별한 언급이 없으면 아래 표의 동결 원본을 뜻한다. R의 오래된 HEAD를 원본 최신본으로 혼용하지 않았다.

기준 source commit: `788ba758f9f5c92564abacb2f2fce88a42af2c1a`.

| 파일 | SHA-256 | 행 수 |
|---|---|---|
| `game.html` | `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4` | 65692 |
| `index.html` | `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` | 4742 |

## 1. 원본 데이터·상수·함수·호출 순서

### 1.1 생성·장비·파생 상태

| ID | 현재 원본 행 | 데이터 / 함수 | 실제 계약·사용처 |
|---|---|---|---|
| D01 | game.html:29022 | `mkP`의 `shield,mshield,shieldRegenT` | 모두 0으로 생성. `P.shield/mshield`와 적 `e.eShield/eShieldMax`는 서로 다른 필드 |
| D02 | 31180–31185 | `mkEn` | `deaths:0,reviveIframes:0`; 일반/보스 모두 `eShield:_hp,eShieldMax:_hp,eShieldRegenT:0`. `_hp`는 최종 스케일 HP. `_revPts/_maxRevPts`는 피날레20, 일반 보스 `200+round(si*5.882)`, 비보스0 |
| D03 | 14464,14502–14503,15030 | 부활 장비 데이터 | `reviveOnce` 갑옷 T3 .20/T4 .35(발동은 값>0), `revivePow` 악마 팔찌 [.06,.10,.18,.28,.40], `reviveCd` [-.06,-.10,-.18,-.28,-.40], implicit `bracelet_demon`→`_iRevPow` [5,12] |
| D04 | 14499–14500 | `antiRevive` 어픽스 | neck/bracelet [.04,.08,.12,.16,.20], ring [.02,.04,.08,.12,.16]. weight40, tierW [50,30,15,4,1] |
| D05 | 15926,15932,15937;27970–27971 | 장비 기본 `antiRevive` / `_eqAffix` | weapon/shield/bow 기본값은 `+(0.01+0.19*rand()^3).toFixed(2)`. 하지만 `_eqAffixRebuild`는 `it.affixes`의 `a.id/a.value`만 합산한다. 기본 필드를 그대로 추가 합산한다고 해석하면 안 됨 |
| D06 | 14451;14639–14641,14580,14818 | 실드 장비 선언 | `shieldFlat` [120,200,400,600,840], slots armor/shield/gloves/pants/boots/cloak. `shieldPct`, `shieldRegenPct`, `shieldBypass`, `arcMageShield`는 데이터/명칭 선언이 있음. 현재 원본의 실드 최대치·흡수·리젠 식에 이 ID들을 추가 소비한다고 추정하지 않음(부록 참조) |
| D07 | 15895,15942–15949 | 장비 `bonusShield` | belt/necklace/ring1/ring2/bracelet/headband에 `~~(tier*50+10+rand()*40)`. ossuary는 이 선언에서 bonusMp만. 15895에서 headband2는 mkItem(headband)를 호출한 뒤 slot만 headband2로 바꿔 같은 bonusShield 생성식을 사용 |
| D08 | 27902–27919,27961–27963;28768 | `applyStats`, `_lvB` | `s.int=STATS.int+장비bInt+~~(lv*.5)+~~eqAffix(intFlat)`; bonusShield 합산 대상은 `shield,armor,boots,gloves,pants,belt,necklace,ring1,ring2,cape,bracelet,headband,ossuary,headband2` 14슬롯. `mshield=~~(100+s.int*5+합산bonusShield+eqAffix(shieldFlat))`; 현재 shield는 min으로만 제한 |
| D09 | 27724–27725,28006,27920–27947 | `PASSIVES.pHuman/pDemon` | 둘 다 max10. pHuman은 부활력 -10/Lv, 통합 피해 +.05/Lv, HP/MP/ST +100/Lv. pDemon은 부활확률 +2/Lv·기본 쿨 -1800/Lv. 과거 `skills.humanity/demonRevive`→PASSIVES 변환은 3709–3712(**세이브 보호**) |
| D10 | 28056,28059 | `pMRegenMul/pShieldCdMul` | `1+pMRegen*.03`, `1-min(.3,pMRegen*.03)` |
| D11 | 31567,32831,16288–16291 | 초기/특수 재충전·장비 교체 | initStage는 HP/MP/ST/실드 완충·상태 초기화. 32831도 완충 쓰기 존재. 장비 교체는 기존 자원을 보존 후 새 최대치로 min. 사망 후 retry(§1.5)와 전투 중 부활을 구분 |

### 1.2 일반 적 부활·구울·추가 HP 실드

| ID | 현재 원본 행 | 진입 / 데이터 | 계약과 후속 효과 |
|---|---|---|---|
| E01 | 42110–42121 | `hurtE`, `isDot`, `reviveIframes` | 부활 무적을90으로 cap; >0 비DOT는1 감소 후 return. DOT는 이 조기 반환을 통과 |
| E02 | 24729,42208–42209 | `_UNDEAD_ET`, `_isGhoul` | Set [4,10,12,14,23,40,47,82,83,85] 또는 구울이고 !ib이면 antiRevive>0 시 `~~(dmg*(1+antiRevive))`. 보스 제외 |
| E03 | 42336–42351 | 실드 흡수 | 최종 공격 배율·스턴/빙결 1.5배 뒤 `(!isDot\|\|opts.shieldHit)&&eShieldMax>0&&eShield>0`; 흡수=min(shield,dmg), 실드=max(0,shield-dmg), dmg=max(0,dmg-흡수). 완전 흡수면 `_shBlocked=true`. DOT+shieldHit는 실드 우선, 순수 DOT는 통과 |
| E04 | 42350,42354–42358 | 숫자 / HP 소비 | 비DOT 흡수량>0→addTxt(x,y-70,String(흡수),'#66ddff',45,48,String(흡수)); dmg>0일 때만 HP 처리 블록·피크 트래커. HP 최종 차감은 42383의 `e.hp-=dmg` |
| E05 | 42627–42638 | 일반 부활 예약 | 조건 !ib&&!_revived&&!_isGhoul. 기본 .5(엘리트>=2는 .6)+`~~((lv\|\|1)/100)*.10`; 억제=_eqAffix(antiRevive)+처음 포함된 holyPrison의 `.15+(lv-1)*(.15/9)`; max(0,pow-suppress). 확률 상한 clamp 없음. 성공이면 `_revived=true`, timer=엘리트120/일반90, 좌표 저장, 별도 rand<.5→`_reviveAsGhoul` |
| E06 | 42702–42733,43103–43114 | 사망 확정과 보상 | 예약 뒤에도 alive=false·kills/_stageKills/_regKill·펫·시체·소환굴alive 감소·보상 경로가 실행. 즉시 부활 성공 보스의 return과 다름. 부활 대기라고 이 단계 보상을 임의 지연/취소하면 원본과 달라짐 |
| E07 | 34362–34383 | 적 배열 보존·정리 | 보스/부활 대기 우선 보존, 별도 정리에서 죽은 부활대기 최대20개 보존. 타이머가 있는 시체를 일괄 free하면 동작 손실 |
| E08 | 34419–34422,34493–34545 | 대기 타이머 소비 | 적 update 루프 alive 분기 밖에서 timer-=sp; 비보스도 루프 타임버짓의 영향 가능. timer<=0→0, ghoul이면 새 객체 생성; 본모습이면 **기존 객체** alive=true·예약 좌표·hp=mhp·recover60·stunned0·kb0·poise=maxPoise·추적/alert. 본모습 분기에는 실드 재충전 대입이 없음 |
| E09 | 41591–41600 | `GHOUL_DEFS`, `_ghoulType` | 원 반경<=24→100, >=40→102, 사이101; elite>=2이면 최대102까지 한 단계 상승. 100: r16/spd.55/색#667744/VFX50/part8·4/shake3, 101:r26/.4/#556633/80/14·3/5, 102:r42/.28/#445522/120/20·2/8 |
| E10 | 41602–41627 | `_spawnGhoul` 전체 레코드 | HP=mhp=`origE.mhp*2`, ATK=baseAtk=`origE.baseAtk*2`(정의표 hpMul/atkMul 미소비), speed=gd.spd+rand*.08, EL.D, poise/maxPoise=~~(HP*.4), room=origE.room\|\|G.curRoom, lv=origE.lv\|\|((stage+1)*100), idle/st2=30+rand*20, facing=플레이어 방향. elite0/mods[]/aura null, 주요 공격/보스 타이머9999, eShield/eShieldMax=새 HP, DOT 풀 초기0, exp=origE.exp\|\|5, matDrop=~~((origE.matDrop\|\|1)*.5), `_isGhoul=true,_revived=true,_reviveChase=true,_alerted=true`, ens.push |
| E11 | 38676–38679;34425–34442;38589–38590 | 추적·구출·무적 감소 | 추적은 d>200 & idle/recover에서 `_ffMoveE(e,sp,2)`, 이동 후 d<=200이면 false. 일반 벽 구출5링 실패 시 사망·드랍·EXP, 보스만 확장6~12링→canMv(P) fallback. 무적 감소는 상위34456과 updateE38590 두 위치(실제 경로별 호출 횟수 동등성은 미확인) |
| E12 | 38890;38943–38954;39738–39747;40381–40388;42506–42509 | 인접 부활 경로 | 적 실드 리젠은 삭제 주석. 주술사: 시체 HP50%·실드0, 화염사제: HP40%·실드0, 쌍둥이 복구, etype87 도플갱어1회 HP50%·실드0도 존재. 일반 `_revived` 타이머와 별도이며 이번 첫 이식 단위에 묶지 않음 |
| E13 | 41629–41743(부록 `_spawnMatSlime` 참조) | 악의구슬 슬라임 인접 시스템 | 부활 VFX/새 실드·생성 경로를 공유. 별도 객체 목록·합체·성장 시스템이므로 일반 구울 구현 완료로 슬라임까지 완료 처리하지 않음 |

### 1.3 보스 즉시 부활·폴백·피날레

| ID | 현재 원본 행 | 구간 / 필드 | 실제 순서·상수 |
|---|---|---|---|
| B01 | 42515–42538 | HP<=0의 보스 판정 | deaths++ → hell/H7 판정 → antiRevive+holyPrison 억제 → **판정 전에** revPts 차감. cost=10+억제>0일 때 ~~min(5,suppress*10+2)+holyPrison3+플레이어풀피2. 0 floor. 일반 즉시 확률=max(0,2+stage*.05-(deaths-1)*.15-suppress); points>0 && rand<chance. >1 확률값은 그대로이며 ‘보장횟수’ 변수 `_maxGuar`는 선언만 |
| B02 | 42547–42566 | 즉시 성공 | hp=mhp, eShield/eShieldMax=0, phase0, alive=true/recover90/stunned0; `_bossRevJudged=true`; combo/feint/delay 초기화. maxPoise=~~(×1.5), poise=~~(새max*.25); iframe90; atk=~~(×H7?2:1.5), speed=min(×1.25,H7?2:1.6), patCd=max(H7?20:60,cd-30). origR 최초 저장; r=max(10,~~(origR*max(.4,pts/max(1,maxPts\|\|150)))) |
| B03 | 42567–42585,34446–34448 | 순간이동·재소환 | 플레이어 뒤 facing+π+rand오차 .8, 거리80+deaths20, canMv→safePt(뒤50) fallback. 구/신 위치 VFX scale=축소 전 r*7/64, **5f/frame**; spawnT55는 update에서 --, grand 대기40은 -=sp. tpWarn0. 보스 부활 SFX |
| B04 | 42586–42622 | 성공 꼬리 | 충격파 R=100+deaths30, dmg=~~(강화atk*(.5+deaths*.15)), 플레이어 조건 충족 시 피해+KB12. deaths>=2이면 8+deaths4 발 전방위 탄. 과거 처치 보스 있으면10% 동반부활(자기 etype 제외), 새 보스 HP=현재 보스mhp*.4/ATK*.5/deaths0. **return**으로 kills/드랍 경로 미실행. Q/E와 탄 패링 규칙은 **보호**, 이식 변경안 제외 |
| B05 | 42640–42649 | 폴백 예약 | !`_bossRevJudged`이면 judged=true, timer180·사망좌표. pts<=0→chance0/roll1; 아니면 일반 chance=max(0,1.5+stage*.05-deaths*.25-suppress), roll=rand. `_bossRevived=true`는 성공 표시가 아닌 타이머 활성 필드. 판정값은 사망 순간 저장 |
| B06 | 34493–34535 | 폴백 resolve | timer 종료 시 저장 roll<chance로 분기. 일반 성공에서 **추가10pts** 차감(0 floor), alive=true·HP=~~mhp*.5·실드둘0·recover60·stunned0·kb0·iframe90·judged=false·G.bossAlive=true/G._bossRef 갱신, 반경 축소/포탈5f/spawn55/grand40. 즉시성공의 ATK/SPD/포이즈 강화 블록을 재실행하지 않음. 실패는 revived=false/timer0·완전사망 안내·SFX; G.bossAlive를 직접 false로 하지 않음 |
| B07 | 17054–17080,31181,42537,42648,34503 | 데모/bic si3 피날레 예외 | _isDruidFinale는 demo && stage==last==3 && ib. HP=max(1,floor(22278*(1+.055n+.0015n²)*dm)). 시작 pts20. 즉시부활 제외; 첫 deaths==1 && pts>0에서 clamp(1-suppress,0,1)로 폴백. 성공 HP35%, shield0, pts0, phase3/lastStand true, baseATK*1.6, bossDruidRest90/iframe90, spawn/grand0. 일반 보스 슬라이스와 별도 |
| B08 | 38235–38308 | `_bossPhaseCheck` | HP비율 .8/.6/.4/.2 경계에서 페이즈 상승, 해당 ph.hp 상한 회복·무적90·강화·텔레포트/VFX. **HP0 사망 부활과 별도**이며 `deaths` 기반 판정으로 치환 불가 |
| B09 | 41816–41832,52281 | 종료/문 열림 | 30프레임마다 bossAlive+arena 체크. 살아있는 보스가 없어도 ib&&reviveTimer>0이면 문 안 열림. 완전 종료 뒤 bossAlive=false·clearTime·killedBosses 기록·보상. 일반 ready 판정도 alive\|\|reviveTimer>0 사용 |

### 1.4 플레이어 추가 HP 실드·쓰러짐·부활

| ID | 현재 원본 행 | 함수 / 상태 | 동작 |
|---|---|---|---|
| P01 | 43496–43540 | `hurtP` 방어 접두 | 기존 행동/보호막 규칙(**Q/E 보호**) 이후 dtype phys/magic/grab/parry, energy=magic/parry. 물리·에너지 DEF 및 강화/어픽스→DR cap .75. charge 분기·한방cap ~~(mhp*.33) → DR → barrier → 조건 DR(최대 .50, burnDR 포함) → 최소 max(1,~~mhp*.005). 새 이중 실드 방어식을 넣을 근거 없음 |
| P02 | 43542–43573 | shield 선흡수 | mshield>0&&shield>0일 때만 regenT180. a>=shield면 overflow=a-shield, shield0; 미만이면 shield-=a,a0,_shFullBlock=true. 이후 분노 전환 등 기존 꼬리→hp-=a. 딱 맞게 깨지는 경우도 overflow0이며 HP 추가 최소피해를 다시 넣지 않음 |
| P03 | 43549–43554,15122–15123 | 유니크 연동 | `_uShieldBreakBank`: 양수→0 에지, 내부쿨1200/유효180, max(1,min(~~mshield*value,a)) 저장. 다음 Q 소비는 **보호**, 변경안 없음. `_uDemonRekindle` 성공 부활 분노20~40는 43859–43861 |
| P04 | 32723,32756–32759 | 쿨·재생 tick | demonRevCd>0이면 -=sp. mshield>0일 때 regenT>0이면 `-=sp*((1/pShieldCdMul())\|\|1)`; else shield=min(max,shield+`(.3+(STATS.int+_lvB())*.003)*pMRegenMul()*sp`). 최대치의 유효INT와 달리 이 식은 장비bInt/intFlat을 직접 읽지 않음 |
| P05 | 43721–43737 | `die()` | 중복 fallen/dead 거절. 먼저 reviveOnce>0&&!used→used=true·HP/MP/ST 풀·iframe120·음성/텍스트 후 return(실드 충전 대입 없음). 아니면 hp0/fallen/st2=300/iframe9999/쓰러짐각/슬로모·효과 정리. 전투 중 부활과 retry 완충 구분 |
| P06 | 43738–43751 | 쓰러짐 순간 판정 저장 | weakRev 첫 포함 존 보너스 `.10+(lv-1)*.01`; bonus=revivePow+_iRevPow*.01+zone. 자연=min(100,~~lv*.03), skill=pDemon*2, chance=min(100,max(0,자연+skill+bonus*100-pHuman*10)); cd=~~(max(6000,36000-pDemon*1800)*(1+reviveCd)). canRevive=chance>0 && demonCd<=0; roll=rand*100 미리 저장 |
| P07 | 32982–32994 | update fallen | HP0 safety→die; fallen에서 st2-=sp, slowMo>=2·혈흔 파티클, st2<=0→_fallenResolve. dead는 break. 행동 차단 진입부12908/13095 등 존재(**Q/E 진입 조건 보호**) |
| P08 | 43847–43865 | `_fallenResolve` 성공 | 저장 can/roll/chance만 사용. demonCd=저장cd·HP/MP/ST 풀·idle/st2=0/iframe120; flash12/slowMo30/shake·음성·텍스트·유니크 분노·펫·파티클. 실드/기동/소모품을 같이 완충하는 쓰기는 이 성공 분기에 없음 |
| P09 | 43867–43894 | 실패 | dead/iframe0, G.on=false·전투 오브젝트 정리·HUD 숨김·EXP 손실 표시30%·피해로그·리플레이버튼 disabled=버퍼없음·death 표시·펫대사 시작. EXP 실제 차감은 retry63476–63477 |
| P10 | 43618–43719;63466–63469 | 리플레이 | 버퍼 캡처/재생 함수는 부록 `_dr*` 전수 참조. 성공 부활은 사망 화면으로 가지 않음. 완전사망 시 자동재생하지 않고 버튼으로 재생 |
| P11 | 46572–46610 | 시간왜곡 shield snapshot | `_twBuf`에 shield 포함, 되감기에서 P.shield=snap.shield. 사망 부활이나 영구저장과 다른 메모리 snapshot |

### 1.5 UI와 저장 경계

| ID | 원본 파일·행 | 표시 / 저장 필드 | 범위 판정 |
|---|---|---|---|
| U01 | game.html:2617,2628,60244,60271–60280 | 플레이어 `shieldRing/hpShield` | 실드 수치는 숨김. HP구슬 테두리 conic-gradient 비율·알파·푸른 glow. 데이터상 ‘추가 HP’가 별도 두 번째 빨간 바를 뜻하지 않음 |
| U02 | 2701,35830–35864 | bossBar/name/hp/shield/poise | deaths 이름 꼬리·피날레 막/lastStand·HP 채움. **bossShieldF는 매 갱신 width0%**. 일반 적의 파란 overlay와 동일 화면이라고 간주 불가. 보스 포이즈/그로기/충전 표시 존재 |
| U03 | 52701–52744 | 죽은 적 부활 대기 렌더 | hit flash 잔상 정리, void VFX, 보스 카운트다운 초/확률/진행바. actual _reviveTimer/_bossRevChance/_bossRevived 소비 |
| U04 | 52746–52799;53961–53969 | 구울·일반 적 HP | 구울 이미지 readiness 실패 시 8dir/절차적 대체 경로. HP 손상 또는 shieldMax>0&&shield<max 때만 빨강4px + 파랑#44aaff overlay. bw=2r+6, by=nameTopOff 또는 -r-16. 그로기3px·빙결 별도 조건 |
| U05 | 53763–53780;54502–54516 | 에너지 방패 장식·부활 burst | eDecor 조건의 eShield>0 효과. `_reviveBursts` void_black 렌더. 업데이트34594–34599에서 sp 누적·frame>=9 제거 |
| U06 | 19629;23081–23087;10247,10299–10314;24752–24769 | 에셋·SFX | boss_revive_boom 등록은 **파일 미존재로 주석 처리**, 원본 호출은 남음. 구울 4방향 ready=false 선언, 구울 크기별 death variation, boss_revive/final_death SFX 호출. 실제 원본 렌더/음향 성공은 이번 미확인 |
| U07 | 58665,58820,58907–58944 | fallen 시각 | 몸체 tilt π/2·크기1.2/.6; 전체화면 암혈·맥박·비네트; 패널280×88, 부활력14px/카운트52px, 진행바 min(300,width*.38)×8, 1초 이하 빨강 |
| U08 | 3101;13158–13174(부록 `_handleDeathMenuKeyboard`);43876–43894 | death DOM·입력 | retry→replay→lobby, dInfo/dDmgLog/펫 초상. 키보드 소유권 helper는 부록, 게임패드 리플레이 종료는43660–43662, 사망 메뉴 버튼 목록은 아래 U10 참조. DOM 존재와 유효 포커스 계약은 기존 그대로 |
| U09 | 51374,51402–51404 | 능력치 패널 | shield 현재/최대·리젠 분해, reviveOnce·신성력 어픽스 합·악마력 표시. 51374의 표기 분해식/유효INT는 실제27961/32759식과 별도 대조 필요(불일치표) |
| U10 | 13916–13927,13626–13639;63673–63684 | 패드·로비 종료 경유 | 패드 overlay 탐색에 deathReplay/death 포함→기존 _gpUINav의 유효 버튼 수집. 로비 버튼은 goToLobby: 사망이면 HP/MP/ST/shield 복원 후 dbSave→lobby 쿼리 이동. **세이브 형식 보호**. 실제 패드/로비 왕복은 미실행 |
| S01 | 3543–3555,3562;3623;3709–3712 | 온라인 save/load | **보호**: player.shield/mshield, stats, passives(pHuman/pDemon/pMRegen), inv.equipped/bag(affixes/bonusShield/implicit 포함), skills. load shield/mshield는 `pd.*\|\|0`; legacy skill migration 존재 |
| S02 | 61993–62007;62128–62145;63911;64068 | 로컬/테스트 저장자 | **보호**: 각 player literal에도 shield/mshield, passives·stats·inv 포함. 이 변형들이 동일 serialization writer라고 가정하지 않음 |
| S03 | 3543–3575,61996–62017,62131–62164;부록 임시필드 | 저장 안 되는 전투 상태 | 위 명시 save literal에 shieldRegenT, demonCd/fallen 판정/used, enemy reviveTimer/points/ghoul, ens 목록은 없음. 중간 계산치/스폰 상태를 새 필드로 저장하는 제안 없음. 로더 이후 initStage의 재초기화와 구분 |
| S04 | 63453–63464,63471–63530 | 사망 retry | **저장 형식 보호**, 실행 흐름 추적만: EXP30% 차감→피날레/보스게이트/일반 initStage 분기→idle/iframe300→applyStats→_refillRespawnResources. HP/MP/ST/shield 최대·DOT/둔화clear·기동/stock 완충 후 dbSave. 세부 Q/E·기동 규칙은 **보호**, 변경안 없음 |
| I01 | index.html:3026–3041,3522–3549,4340–4349 | 로비 경유 | 온라인 characters 또는 `/api/slots`·localStorage 슬롯 목록; local 표시는 name/lv/stage/charIdx만 읽음. demo 슬롯 전환 뒤 game.html?test/slot/demo 또는 char 쿼리로 이동. 부활·실드 전투 계산/전용 UI 없음(§7 검색 근거) |

## 2. 설계 폴더 ↔ 현재 원본 불일치 표

여기서는 **기존 문서·코드 모두 고치지 않는다**. A=`docs/2_5 부활+에너지쉴드시스템/2_5 부활+에너지쉴드시스템.md`, B=`RESPAWN_RESOURCE_RESET.md`, C=`에너지쉴드_피해수치_표시_20260928.md`(같은 폴더). ‘보완 필요’는 관측 차이이며 새 설계 확정이 아니다.

| ID | 설계 근거 행·표현 | 원본 코드 행·관측 | 차이 / 판정 |
|---|---|---|---|
| X01 | A58: 일반은 구울로 변환, 본모습 아님 | 42635,34536–34544: 별도 rand<.5 구울, 아니면 기존 객체 본모습 풀HP | **명백 불일치**: 두 분기 전부 이식 대상 추적 |
| X02 | A60: Lv1000 150%, 확정+2회부활 가능성 | 42627,42634,41623: _revived/_isGhoul 가드·성공 시 _revived=true | 확률>1이어도 재부활 횟수 증가는 없음. ‘2회 가능’과 불일치 |
| X03 | A61: 소형r<=10/중11~18/대>=19 | 41598–41599: <=24/25~39/>=40, elite>=2 한 단계 상향 | 구울 분류 좌표/임계값 불일치 |
| X04 | A62: 벽 구출 실패 시 플레이어로 강제이동 | 34433–34442: 보스만 확장링/플레이어이동, 일반은 사망+보상 | 일반몹 설명과 불일치. _pushOutWall31722는 별도 탐색 helper |
| X05 | A65–68: 목걸이10~30/무기10~30/반지0~20, 합산max100% | 14499–14500: neck/bracelet4~20·ring2~16%;27970–27971 단순 어픽스 합, clamp100% 없음 | 슬롯·등급 수치·합산 상한 불일치. 원본 소비자 max(0,pow-suppress)만 있음 |
| X06 | A54: 무기3종 기본1~20%, 합산60% | 15926/15932/15937에는 기본 속성, 27970–27971 소비자는 affixes만 | 기본 필드 존재는 일치, 이를 신성력 합계에 실제 가산한다는 근거 없음. 별도 기본→affix 변환/런타임 효과는 **미확인** |
| X07 | A36,39: boss_revive_boom 3f/frame·등록 자산 | 42571/42579/34522는5f/frame;19629 등록 주석 ‘파일 미존재’ | 속도 및 자산 연결 상태 불일치. 새 에셋 생성/등록 변경 제안 없음 |
| X08 | A42: r=origR×max(.4,ratio) | 42564/34515: `max(10,~~(origR*scale))` | 정수 절삭·최소반경10 조건 누락. 예시 역시 기본10 외 추가비용이 있으면 달라짐 |
| X09 | A32–34,46–50: 성공마다 포인트 소모로 읽힐 수 있음 | 42526–42531: 최초 판정 전 비용 차감, 실패 후 폴백 성공34505에 추가10 | 상태 순서 명시 부족. ‘실패는 포인트 무소모’로 이식하면 원본과 불일치 |
| X10 | A34: SPD×1.25·쿨-30 | 42558–42559: speed cap1.6/H7 2.0, cd floor60/H7 20 | cap/floor 및 즉시 성공 한정 범위 누락(폴백은 강화블록 미실행) |
| X11 | A158–162: INT=STATS+eqInt+floor(lv*.5), shieldFlat 장신구전용 | 27907 intFlat도 포함;14451 shieldFlat 방어구6분류;27916 bonusShield 합은14슬롯 | 스탯 구성·어픽스 슬롯·합산 대상 설명 불일치/누락 |
| X12 | A190: `(0.3+INT*.003)*pMRegenMul` | 32759: `(STATS.int+_lvB())` 사용 | INT를 유효INT(s.int)로 읽으면 장비/flat이 잘못 포함됨. 코드상 최대치/리젠 입력이 다름 |
| X13 | A94–101: 최소100초 쿨 표 | 43747: max6000 적용 **후** `(1+reviveCd)` 배율·절삭 | 표는 장비 배율0의 기본값. reviveCd<0이면 최종6000 미만 가능. 무조건 최종 최소100초라는 해석 불일치 |
| X14 | A90: 영역 +10%+Lv당1% | 43740: `.10+(lv-1)*.01` | 실제 Lv1=10%, Lv10=19%; ‘10%+현재Lv%’로 계산하는 해석과 불일치. 표현 보완 대상으로만 기록 |
| X15 | A235: 보스바와 동일 파랑overlay 구조 | 35843: bossShieldF width 항상0%; 일반53963은 실제 파랑overlay | 일반·보스 표시 동일성 불일치. 추가 HP 실드의 데이터 동작과 UI 표시를 분리 |
| X16 | A175: 최소피해 `a=max(1,~~mhp*.005)`로 요약 | 43539–43540: minDmg=max(1,~~mhp*.005), `if(a<minDmg)a=minDmg` | 기존 큰 a를 최소값으로 덮어쓰는 대입이 아님. 요약을 literal 이식하면 큰 피해 손실 |
| X17 | A253: 신성력/실드/부활 유니크 연동 | 43549–43554,43859–43861 실제 호출 있음 | 이 항목은 **일치**. Q 소비 경로는 **보호**, 새 변경안 없음 |
| X18 | B9–17,30,38: applyStats 뒤 리스폰 완충·DOT/둔화clear | 63453–63464,63525–63526 | **일치**. 전투 부활43853에는 실드 충전이 없으며 B17도 범위 제외. 저장/Q/E/기동은 **보호** |
| X19 | C3,7–12: 비DOT 파란 숫자·overflow 분리 | 42345–42351·44482 이후 숫자 아틀라스 | 핵심 분배/호출 **일치**. 실제 화면 재검수는 미확인 |
| X20 | A273–281: 폴백 음향 두 wrapper | 34525,34534 두 try/catch | **일치**. 즉시 부활42585가 같은 예외보호를 가진 것으로 확대하지 않음 |
| X21 | A 본문에 별도 수치패널 불일치 항목 없음 | 51374 표기 분해 base150/Lv/INT, 리젠 유효INT vs 실제27961/32759 | **원본 내부 표시↔계산 차이**. 설계 폴더의 정확한 식과 UI 표기 동등성을 단정하지 않음. 교정안은 이번 범위 밖 |

A3/B3의 피날레35%/points20/1회와 17063–17080은 별도 예외로 일치하며 일반 보스 수치로 합치지 않았다. A117–119의 선택지/인간 HP+30%/영구분기 저장 미구현은 현 원본 부활 함수에서 해당 분기를 확인하지 못했으므로 ‘구현됨’으로 승격하지 않는다(**세이브 보호**).

## 3. Godot 실제 의존 경로와 검증 경계

### 3.1 존재하는 모듈·연결과 결손

| ID | 실제 godot/ 경로·행 | 확인된 구현 | 아직 없는 부분 / 의존성 |
|---|---|---|---|
| G01 | `port_modules/player_shield_poise_parameters_source/producer.gd:371–424,470–473`; `scripts/native_source_player_initialization.gd:9,34–36,228–229` | source shield plan/14슬롯합·현재shield min, 초기화 dispatcher→State 쓰기 | producer 주석의 ‘현재P 부재’는 과거 이력. 실제 dispatcher 존재를 우선. 런타임 피격/실드 리젠은 이 producer의 소유 아님 |
| G02 | `scripts/native_source_new_run_state.gd:105–106,421–433`; `scripts/native_source_resource_authority.gd:184` | P dict에 shield/mshield/regenT 존재, stage-entry refill에서 shield=mshield; HP/MP/ST authority와 분리 | Player 실제 피격과 shield dict를 같은 현재값으로 소비하는 runtime sink·사망 retry 재호출 미연결 |
| G03 | `port_modules/equipment_affix_reader/producer.gd:150–170,214`; `scripts/native_source_player_initialization_services.gd:626–641`; `port_modules/player_passives_source/producer.gd:45,215–230` | 어픽스/패시브 실제 reader·12 provider의 eq_affix, pHuman/pDemon migration plan. 시작 장비 기본 antiRevive도 `starter_item_factory_source/producer.gd:756–764`에 존재 | 기본 antiRevive 속성 합산을 새로 넣을 근거 없음. pDemon 값 존재만으로 die/fallen 구현 완료 아님. 저장 migration은 **보호** |
| G04 | `scripts/native_normal_enemy_hurte.gd:141–151,203–208,364–377` | 부활무적 early return, 언데드 antiRevive 보너스, DOT/shieldHit 판정·실드 선흡수·파란 숫자 | ib=true는151행 `unported_branch_active:boss_hurtE` halt. 보스 부활/피날레 본체 없음 |
| G05 | 같은 파일:532–554 | 일반몹 확률/RNG→_revived/timer90/좌표/ghoul 플래그 예약 기록 | 코드가 `resurrection:UNPORTED` 명시. elite>=2 .6/120f 경로·holyPrison 억제 스캔 없음. G._fireZones는 현재 존재하지만 이 부분 주석은 과거 ‘부트G 부재’로 남아 있어 실효 스캔과 구분 |
| G06 | `scripts/enemy.gd:62–63,99–100,310–320,329–336,388–422`; `scripts/native_dedicated_enemy_hurte_owner.gd:30–48,61–64,91–104,155–170` | generic+전용4종 실드 실제 필드 owner·native_final 부활 bookkeeping whitelist. death에서 alivefalse/state dead/collision0/body숨김 | 살리려면 단순 HP 대입만으로 부족: collision/body/상태·공간목록 재등록 필요. 현재 owner에 원본 timer resolve·revive 쓰기 API 없음 |
| G07 | `scripts/enemy.gd:138–140`; `scripts/world.gd:3314–3335` | 죽은 적 physics 즉시 return, spatial index는 alive=false를 제외 | dead 타이머를 actor physics에만 붙이면 진행 안 됨. World가 죽은 예약 actor의 수명·원본 sp·정리 순서를 담당할 연결점 필요 |
| G08 | `scripts/enemy_factory.gd:140–171,547–587`; `scripts/world.gd:2850–2855` | 현재 초기 supported profile generic+전용4종, 동적등록 경로 존재 | 구울100/101/102 및 보스 프로필 신규 생성 경로 없음. 기존 factory는 exact id/position/skin guard이므로 임의 구울 record 주입은 지원 경로가 아님. P3-002 동적등록 담당과 조정 필요 |
| G09 | `scripts/native_enemy_bar_layout.gd:20–41`; `scripts/enemy.gd:544`; 전용 적 `_draw` | 일반 적 빨간HP/파란shield overlay·그로기 배치. `native_normal_enemy_hurte.gd:373–374`→기존 floating text | 구울 전용 렌더·부활 포탈·보스 timer/points HUD·보스바·플레이어 shield ring은 해당 경로에 없음. 프리즌바 helper 주석은 미이식 표시 |
| G10 | `scripts/player.gd:890–927,1011–1030`; `scripts/hud.gd:250–273` | direct 피해/화상DOT는 계산 후 HP 직접 감소·dead 전이. HUD는 HP/ST·dead 안내. burn은 dead에서 보존/동결 | Player shield 선흡수·regenT 쓰기, reviveOnce/쓰러짐300/저장 roll/resolve·death replay/retry UI 없음. fallen 문자열 가드만으로 부활 구현이라고 볼 수 없음 |
| G11 | `scripts/main.gd:253–262,761–782`; `scripts/native_source_player_regeneration_phase.gd`; `port_modules/source_update_clock_prefix/producer.gd` | HP/MP/ST 자연 리젠 부팅 배선·source clock 인계 존재 | 현재 회복 단계는32705–32721 범위. 실드 자동 리젠32757–32759·demonCd32723의 전용 생산/쓰기/자연 호출은 없음. 기존 `shield_burst_visual`은 Q 연출(**보호**)이며 에너지실드 리젠이 아님 |
| G12 | `scripts/native_skill_slots.gd:469–481`; `port_modules/fusion_star_source/producer.gd:58–63` | 가시덫 dot+shieldHit, holyDome 등 현재 스킬과 fusion 이름 데이터 존재 | holyPrison/weakRev는 fusion 이름 매칭만 발견. 실제 존 생성·억제/부활력 effect consumer 없음. holyDome 회복을 holyPrison 억제로 오인 금지 |
| G13 | `scripts/native_normal_enemy_hurte.gd:575–603`의 처치·`scripts/native_regions.gd:118` | region kill 연결은 존재. 드랍/EXP와 death FX도 이미 이어짐 | 부활 시 kills/지역 카운트/드랍 역산을 새로 넣지 않음. pending 보스 종료 gate는 별도 신규 owner가 필요하며 지도 변경은 별도 승인/담당 범위 |

‘없음’은 동결 tree의 실제 스크립트/port_modules/tests 검색과 위 실행 경로를 대조한 결과다. 별도 외부 WIP·다른 worktree·다른 origin 브랜치 구현은 이 판정 대상이 아니며 미확인이다. 파일의 과거 주석과 실제 호출이 충돌하면 후자를 적었다.

### 3.2 실제 기존 테스트가 검사하는 범위

이번 작업에서는 **테스트 파일을 읽었으며 실행하지 않았다**. 아래는 테스트 존재·assertion 근거이고 새 PASS 보고가 아니다.

| 실제 테스트·행 | 읽어 확인한 assertion | 부활·실드 전체 검증으로 확대할 수 없는 이유 |
|---|---|---|
| `godot/tests/test_p1002e_melee_hurte.gd:228–265,313–335` | shield min/overflow·HP불변·crit RNG, 처치 normal_revive→조건부ghoul RNG·bookkeeping | 문구가 `resurrection UNPORTED`. timer90 뒤 복구/새 구울을 기다리지 않음 |
| `test_p1002f_dedicated_hurte.gd:378–388,417–447` | 전용4종 실드/HP·RNG 접두·_revived 기록 | dead 유지와 예약만 검사. 실제 생환·elite/보스/존 억제는 대상 아님 |
| `test_p1002g_kislash_hurte.gd:356–367,430–446` | 검기 실드overflow·부활롤·ghoul 조건부 소비 | 역시 `resurrection UNPORTED`. 구울 actor/보스에 대한 테스트가 아님 |
| `test_p2001a_hit_feedback.gd:60–92` | 풀HP/풀실드 숨김, shield500/875 파랑 rect, 실드0·그로기 레이아웃 | 일반 적 bar 순수 계산. 플레이어 ring·보스bar·부활 화면은 검사 안 함 |
| `test_p2005c_spike_holy.gd:139–146` | dot+shieldHit 적 실드 감소·감속·DOT 스턴없음 | 순수DOT 실드우회·보스·holyPrison 억제 검증은 아님 |
| `test_native_main_source_player_initialization.gd:127–131` | 초기 stage refill에 hp/mp/shield→각 max 대응 반영 | 초기 생성 값만 확인. 실드 피격/리젠·사망 retry 왕복 아님 |
| `test_etype0_physical_burn.gd:217–222,265` | DOT 사망 dead·burn목록 보존, HP만 감소 | 테스트 자체가 현재 terminal-death 소비를 검사. 원본 fallen→부활에 대한 근거 아님 |
| `test_native_source_player_regeneration_phase.gd`·`test_p2005d_regen_wiring.gd` | 기존 HP/MP/ST 단계와 배선 테스트 존재 | shield mshield/regenT 소비 테스트는 아님. 파일 검색에서 실드 리젠 assertion은 발견되지 않음 |

`rg --files` 기본 검색은 ignore 규칙 때문에 일부 test_ 파일을 생략하므로, 테스트 대조는 `rg --no-ignore` 및 직접 파일 읽기로 수행했다. 테스트가 없다고 기본 rg 결과만으로 판단하지 않았다. 기존 MAC-VERIFY 보고서의 타 SHA 실행 결과는 이번 SHA 실행 증거로 재사용하지 않는다.

## 4. 작게 나눈 후속 이식 순서안

다음은 **구현 배정안**이며 이번에 파일을 만들거나 수정하지 않았다. 소유 예정 파일명은 아직 확정되지 않은 제안이다. 공용 파일 연결은 총괄의 소유권 조정 후 해당 담당이 수행한다. 모든 단위는 원본 수치·RNG/쓰기 순서를 유지하며 값 조정이 아니다.

| 순서 / 작은 단위 | 원본 행 근거 | 소유 예정 파일(신규 제안) | 검증 테스트 아이디어 | 선행 조건 / 완료 경계 |
|---|---|---|---|---|
| R1 일반 예약 계약 보완 | 42627–42635 | `godot/scripts/native_enemy_revival_source.gd` | lv99/100/500/1000, elite0/1/2, suppression0/=.chance/>chance, roll 경계, 2번째ghoul롤의 조건부 호출·RNG 개수, revived/ghoul 재예약없음 | 현 hurtE normal branch 재사용·중복롤 금지. holyPrison 미연결은 별도 명시. timer90/120/좌표 예약까지만 |
| R2 일반 본모습 타이머·수명 | 34362–34383,34493–34545 | `native_enemy_revival_runtime.gd` | 89→90/119→120 틱, pause·레슨detach·죽은 객체·삭제/ownerloss, 동일 actor identity·HP풀/poise풀/kb0/recover60/실드미충전, body/collision·spatial 복구 | R1 및 World phase/sp·수명 소유 합의. G07 dead 조기반환 해결 필요. 맵/충돌 형상 변경을 제안하는 단위가 아님 |
| R3 구울 데이터·생성 | 41591–41627 | `native_ghoul_source.gd`, `native_ghoul_actor.gd` | r24/25/39/40·elite2 크기승격, mhp/baseAtk×2, 실드=새HP, gd.hpMul 미소비, RNG(speed·idle·VFX) 순서·원객체/신객체 구분·_revived 재부활차단 | R2, factory/동적등록 API·P3-002 담당 조정. 초기16 record를 임의 수정하지 않음 |
| R4 일반 부활 시각·읽기 표시 | 52701–52799,54502–54516,41579–41588,10299–10314 | `native_enemy_revival_presentation.gd` | pending/본모습/구울 전환·fallback·text·VFX수명9frame, 1x 실제카메라에서 몸체/실드bar/시체 공존 확인 | R2/R3 실제 호출과 기존 byte 에셋 인수. 생성/모델교체 없음. 시각 PASS는 화면 검수 후만 |
| S1 플레이어 에너지실드 흡수 | 43504–43573 | `native_player_energy_shield.gd` | **기존 방어 결과** 입력에서 shield>dmg/=dmg/<dmg/0, HP최소피해 재적용0, regenT 쓰기조건, raw/overflow/실드숫자, DOT 동일 추가HP분배 | State P dict와 Player HP authority 경계 확정. 기존 Q/E·2_3 접두는 **보호**; 이를 바꾸는 테스트/설계 제안 제외 |
| S2 실드 리젠·HUD ring | 32757–32759,28056/28059,60273–60280 | `native_player_energy_shield_regeneration.gd`, `native_energy_shield_ring.gd` | regenT180 경계·pMRegen0/10·timer 양수→0 프레임에는 regen안함, baseINT+lv와 장비INT 분리;0/부분/풀 실드 ring·alpha 및 1x 화면 | S1, 단일 clock+현재P 쓰기·중복리젠 방지. 기존 HP/MP/ST regen 단위를 그대로 유지 |
| P1 플레이어 부활 판정 데이터 | 43726–43751,32723 | `native_player_revival_source.gd` | reviveOnce priority/used, lv 자연 cap·pHuman clamp·weakRev 영역 경계·pDemon CD·reviveCd 배율 순서, 사망 순간 저장roll·재판정없음 | 장비/passive/implicit reader 인수. weakRev 실효 consumer 없으면 미연결. **저장 형식 보호**, 런타임 상태만 |
| P2 fallen→resolve 실제 흐름 | 32982–32994,43847–43894,58907–58944 | `native_player_revival_runtime.gd`, `native_fallen_presentation.gd` | 중복die 억제·300sp/pause·성공120iframe·HP/MP/ST만풀(실드강제충전0)·demonCd·실패dead·G.on false·유니크성공한정, 1x 카운트다운/실패 UI | P1/S1/S2, HP authority 및 Main 단계 합의. Q/E 입력은 **보호**; 소비자가 기존 상태 조건을 존중하는지만 관측 |
| B1 일반 보스 즉시부활 데이터 | 31181,42515–42622 | `native_boss_revival_source.gd` | 선차감cost10/억제+2~5/zone+3/풀피+2, pts0/roll경계·H7 상한/하한·r절삭/min10, 성공return으로 보상0·RNG 순서 | **보스 actor/hurtE/phase owner가 선행**. 현재 boss_hurtE halt를 가짜 READY로 바꾸지 않음. 탄·Q/E 규칙 **보호** |
| B2 보스 폴백·완전사망 읽기 gate | 42640–42649,34493–34535,41816–41832 | `native_boss_revival_runtime.gd`, `native_boss_revival_status.gd` | 판정 snapshot이180sp 뒤 그대로, 추가10소모·HP50/실드0·즉시강화 재실행0·pending문닫힘/최종문열림1회·SFX wrapper 오류후순서 | B1 및 보스 아레나/종료 owner 준비. 지도 내용 수정은 소유 확정 전 보류. 일반 timer와 상태값 혼용 금지 |
| B3 피날레 예외·보스 시각 | 17054–17080,35830–35864,41554–41577 | `native_druid_finale_revival.gd`, `native_boss_revival_presentation.gd` | demo stage3만, 첫deaths/pts·chance clamp,35%HP·baseATK1.6/pts0·2번째부활없음, 기본보스100/50과분리; bossShieldF0·timer/points1x | B2, 실제 피날레/보스 패턴·기존 VFX/음향 인수. 원본 없는 boss_revive_boom을 존재한다고 가정 금지 |

사망 화면 retry/리플레이·로비는 원본 흐름으로 추적했지만, 기존 저장 형식을 손대는 새 단위는 제안하지 않는다. 저장/로드는 **보호** 상태로 후속 범위 인수가 필요하다. 인수 전에는 현 상태의 읽기 대조만 한다. 약화/보스 특수 부활·악의슬라임은 별도 원본 단위이며 위 첫 일반몹 단위 완료에 묶지 않는다.

## 5. 공용 파일 연결 필요 지점 — 이번 변경 0

| 공용 파일 | 현재 행·접점 | 후속에 필요한 최소 연결 / 조정 | 보호·타 작업 경계 |
|---|---|---|---|
| `godot/scripts/main.gd` | 253–263 시작/regen/HUD bind;761–782 regen 바인딩, source clock 호출 | revival/energyShield 신규 owner 설치·기존 단일 phase/clock 전달·죽음/부활 HUD 읽기 연결. 기존 실행 order에서 원본 timer 위치를 확정 | 레슨 flow 설치/시계·P2-001l 담당과 조정. Q/E provider·입력 함수 **보호**. 재부팅·실창 자동교체 없음 |
| `hud.gd` | 241–273 refresh,250–258 HP/ST read | 새 에너지실드 ring과 fallen/death 표시 owner를 읽기 연결; 일반 적 bar와 플레이어 ring 별개. 보스 points/timer도 실제 owner 후 별도 표시 | 슬롯·미니맵 담당 소유 유지. 기존 입력/저장 변경 제안 없음 |
| `world.gd` | 2850–2855 동적등록,2857–2876 레슨 detach/restore,3314–3335 spatial alive filter | 죽은 예약 actor 타이머 phase·수명 보존, 본모습 alive 복구 시 spatial 갱신, 신규 구울 동적등록. pending보스 종료 판단 데이터 연결 | P3-002 동적 스폰·레슨saved ens와 충돌 금지. geometry/맵 생성·충돌값 변경안 없음 |
| `player.gd` | 890–927 direct damage,1011–1030 burn damage,죽음 signal | 기존 최종 방어 피해의 실드→HP 분배 및 현재 State/authority 일치, 죽음 entry→revive owner, 성공한 회복/iframes/state만 owner 경유 | Q/E와 2_3 접두 및 입력 처리 **보호**. 현재 direct/화상 두 경로를 각각 확인해야 하며 한쪽만 연결한 상태를 완료로 보고하지 않음 |
| `native_normal_enemy_hurte.gd` | 203–208 신성력,364–377실드,532–554예약,579–599처치 | 일반 예약 정책의 원본 elite/zone 적용·기존 RNG 위치 유지, 신규 timer owner로 예약 전달. 보스 branch는 선행 구현 인수 후 별도 범위 | `_regKill`/보상/death FX 소유 유지. 기존처치 카운트를 부활때 되돌리는 제안 없음. Q/E·parryBlueBean **보호** |
| `native_source_new_run_state.gd` | 105–106 mkP P;421–433 stage refill;548–574 read_current_p | shield/regenT·fallen snapshot/CD의 런타임 owner/쓰기권한, 실제 Player 자원 snapshot과 같은 P identity 유지. stage-entry와 death-retry의 scope를 구분 | **세이브 형식 보호**, 새 저장 key/마이그레이션 제안 없음. P/G shared owner 변경은 다른 작업과 최소 구간 합의 후 |

이 6파일 외 `enemy.gd`·전용 적 owner·factory는 body/collision/새 actor 지원 때문에 R2/R3의 별도 소유 경로로 필요하다. 공용 6파일만 수정하면 생환이 완성된다는 뜻이 아니다.

## 6. 보조 경로·전수 참조 색인

### 6.1 본편 밖 동일 필드 사용처

| 원본 행 | 분류 | 분리할 이유 |
|---|---|---|
| game.html:24382–24538 | 아틀라스/상태 미리보기 적 literal의 eShield/eShieldMax | 본편 mkEn 초기값이 아닌 preview fixture |
| 62243–62273 | 원본 QA snapshot의 shield/alive/state/isGhoul | 관측 출력이지 실드/부활 writer가 아님 |
| 64198,64467,64736,64793 | 보스/캐릭터 테스트용 완충·god loop | 테스트·디버그 보조. 64467은 maxShield라는 다른 필드까지 읽으므로 본편 mshield 식으로 채택 금지 |
| 5246–5247,52880 | instanced draw의 ghoul 제외·부활 무적 렌더 분기 | 구울 전용 draw로 넘어가는 조건과 본체 효과를 분리 |
| 42325 | onCritShield가 P.eShield/P.eShieldMax를 참조 | 플레이어 본래 shield/mshield와 이름이 다름. 조건부 실행 효과는 미확인, 이름을 임의 교정하지 않음 |

### 6.2 핵심 식별자 전체 행 색인

각 행의 번호는 해당 **식별자의 전체 파일 일치 행**이다. 여러 번 등장한 동일 행은 1번만 싣는다. 범위는 연속 행만 압축했다. 주석/문자열/디버그 호출도 포함하므로 실제 동작은 §1 역할표로 구분한다. `—`는 해당 파일에서 정확 토큰 일치0이다. Q/E 식별자가 연관된 행은 **보호**이며 변경 대상이 아니다.


**생성·장비·수치**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `mkP` | 29016, 61940, 62115, 62338, 62353, 62465, 62467, 63869, 63947, 64096 | — |
| `mkEn` | 30184, 30782, 31120, 31375, 31384, 31431, 31437, 31443, 31450, 31476, 31497, 31512, 31523, 31601, 31620, 31635, 31647, 32133, 35675, 35707, 38780, 38796, 38845, 39040, 39244, 39414, 39487, 39630, 40012, 40105, 40244, 40415, 40789, 40807, 42611, 42795, 42830, 43052, 62289, 63428, 64753 | — |
| `applyStats` | 15378, 15786, 15793, 15826, 16290, 27902, 27983, 27988, 28148, 45888, 49038, 49482, 50836, 50912, 50948, 50998, 51017, 51176, 51215, 51232, 51249, 51267, 51274, 62057, 62196, 62340, 62407, 62511, 63525, 64019, 64140 | — |
| `_eqAffix` | 14308, 16431, 16826, 17348, 24572, 27890, 27897, 27907, 27913, 27927–27928, 27930–27931, 27942, 27961, 27971, 27977, 27994, 27996–27999, 28008, 28035–28036, 28041, 28050, 28053, 28065, 28228, 28232, 28696, 31983, 32291, 32713, 32745, 32785, 32789, 32950, 32975, 33050, 33364–33365, 33550, 33581, 33652, 33802, 33979, 34699, 34858–34859, 34982, 35894, 35903, 38481, 38545, 39934, 41348, 41463, 42209, 42211, 42214, 42218–42219, 42222, 42238–42241, 42243–42245, 42248–42249, 42251–42256, 42258–42260, 42276–42281, 42295, 42307, 42310–42313, 42315, 42320–42325, 42361, 42363–42365, 42371–42378, 42424, 42438, 42440, 42442, 42489, 42492, 42522, 42629, 42644, 42652, 42654–42658, 43081, 43143, 43432, 43463, 43488, 43512, 43514, 43526, 43530–43534, 43536, 43585, 43600, 43602, 43604, 43606, 43727, 43741, 43747, 44557, 44961, 45114, 45172, 45190, 45223, 45816, 45820, 46466, 51298, 51312, 51315–51318, 51322, 51348, 51373–51374, 51379, 51381, 51393, 58625, 58630, 58648, 63463 | — |
| `_eqAffixRebuild` | 27970–27971, 51307 | — |
| `_eqImplicit` | 27913, 27927, 27992, 27994, 28008, 43741, 45816, 51373, 51404 | — |
| `_lvB` | 27897, 27906, 27994, 27996, 28768, 28770–28772, 32759, 43432, 51327 | — |
| `pMRegenMul` | 28056, 32710, 32759, 51374, 51378, 51380 | — |
| `pShieldCdMul` | 28059, 32758 | — |
| `antiRevive` | 14499–14500, 14870, 14965, 15926, 15932, 15937, 42208–42209, 42522, 42629, 42644, 51403 | — |
| `reviveOnce` | 14464, 14868, 14963, 43726–43727, 51402 | — |
| `revivePow` | 14502, 14871, 14966, 43741, 51404 | — |
| `reviveCd` | 14503, 14871, 14966, 31197, 38953, 43747 | — |
| `_iRevPow` | 15030, 43741, 51404 | — |
| `bonusShield` | 15935, 15941–15947, 16013, 27919, 27960, 49791, 51374 | — |
| `shieldFlat` | 14451, 14863, 14957, 27961, 51374 | — |
| `shieldPct` | 14639, 14904, 14986 | — |
| `shieldRegenPct` | 14640, 14904, 14986 | — |
| `shieldBypass` | 14580, 14894, 14976 | — |
| `arcMageShield` | 14818, 14937 | — |
| `pHuman` | 3709, 3711, 16431, 27724, 27884, 27940, 27947, 28006, 43160, 43745, 44184, 51404 | — |
| `pDemon` | 3709, 3712, 27725, 27884, 43160, 43742, 44184, 51404 | — |
| `pMRegen` | 27710, 27884, 28056, 28059 | — |
| `_UNDEAD_ET` | 24729, 42209 | — |

**플레이어 상태**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `shield` | 259, 3549, 3623, 3630, 3647, 4789, 6190, 6200, 6238, 6256, 6268, 6327–6328, 6341, 6352, 6432, 6607, 6615, 7124, 7176–7177, 8097, 8676, 9337, 9339, 12040, 12100, 12128, 13216–13217, 13430, 14362, 14364, 14367, 14447, 14449–14451, 14455–14456, 14461, 14471–14472, 14475, 14477, 14479, 14600, 14604–14606, 14638, 14640–14641, 14651, 14658, 14694, 14746–14748, 14825–14826, 15019, 15046, 15069, 15092, 15176, 15182, 15185, 15200–15201, 15382, 15830, 15843, 15905, 15932, 15953, 15988, 16085, 16170, 16176, 16288, 16291, 16499, 22896, 23160, 27741, 27786, 27792, 27884, 27916, 27962, 28552, 28559, 29022, 31567, 31961, 31983, 31986, 31991, 32562, 32759, 32831, 33047, 33058, 33555, 33582, 33668, 33671, 33730, 35870, 37609, 37617, 37622, 37631, 38450, 38452, 38464, 42657, 43507, 43510, 43545, 43547–43548, 43560, 43637, 44207, 44310, 44312, 46182, 46184, 46572, 46593, 46610, 48155, 48752–48753, 49424–49425, 49760–49761, 50159, 50524, 50534, 50548–50549, 50587–50588, 50610, 50736, 51085–51087, 51121–51122, 51373–51374, 51403, 59501, 59904, 60026–60027, 60035, 60276–60277, 60342, 61942, 61986, 62001, 62117, 62138, 62182, 62245, 62355, 62400, 62468, 63297, 63454, 63521, 63678, 63911, 63948, 63989, 64068, 64097, 64125, 64198, 64467, 64736, 64793 | — |
| `mshield` | 3549, 3623, 16291, 27961–27962, 29022, 31567, 32757, 32759, 32831, 42657, 43545, 43553, 43637, 51314, 51374, 60276–60277, 62001, 62138, 63454, 63521, 63678, 63911, 64068, 64198, 64736, 64793 | — |
| `shieldRegenT` | 29022, 32758, 43546 | — |
| `_shFullBlock` | 43544, 43562 | — |
| `_minDmg` | 43539–43540 | — |
| `_demonRevCd` | 32723, 43750, 43851 | — |
| `_fallenAng` | 43732, 58820 | — |
| `_fallenRevChance` | 43748, 43849, 43858, 58930 | — |
| `_fallenRevCdFrames` | 43749, 43851 | — |
| `_fallenCanRevive` | 43750, 43849, 58930 | — |
| `_fallenRevRoll` | 43751, 43849 | — |
| `_reviveOnceUsed` | 31567, 43727 | — |
| `_fallenVg` | 58916–58918, 58920 | — |
| `_fallenVgW` | 58916, 58918 | — |

**부활 판정·함수**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `hurtP` | 3327, 16996, 20020, 24759–24762, 31107, 33009, 33013, 33015, 33017, 33738, 33830, 35820, 37037, 37055, 37059, 37065, 37067, 37069, 37071, 37073, 37077, 37079, 37122, 37129, 37131, 37133, 37135, 37137, 37139, 37141, 37143, 37145, 37147, 37149, 37151, 38288, 38809, 38816, 38835, 39059, 39182, 39210, 39330, 39371, 39676, 39694, 39713, 39730, 39792, 39817, 39870, 39877, 39885, 39901, 39962, 39988, 40035, 40052, 40082, 40099, 40115, 40209, 40428, 40437, 40501, 40535, 40545, 40553, 40588, 40629, 40685, 40706, 40737, 40756, 40768, 40830, 40857, 40862, 40884, 40925, 40935, 40962, 41036, 41069, 41093, 41130, 41161, 41263, 41281, 41293, 41314, 41346, 41370, 42125, 42131, 42590, 42787, 42846, 42868, 42883, 43058, 43415, 61086, 61120, 61250, 61681, 61697 | — |
| `hurtE` | 3326, 5309, 10240–10241, 10244, 14442, 16598, 19837, 24593, 24605, 24616, 24633, 24647, 28012, 28060, 28809, 28817, 28852, 28980, 32283, 32292, 32316, 32432, 32505, 32624, 32670, 33226, 33242, 33456, 33793, 33981, 33999, 34037, 34084, 34235, 34245, 34275, 34284, 34310, 34322, 34740, 34760, 34828, 34832, 34994, 35073, 35111, 35122, 35228, 35265, 35294, 35308, 35344–35345, 35347, 35355, 35379, 35389, 35407, 35420, 35442, 35467, 35483, 35507, 35530, 35621, 36130, 36178, 36245, 36291, 36528, 36539, 36547, 36615, 36740, 36872, 36896, 36962, 36998, 37117, 37172, 37319, 37329, 37364, 37399, 37421, 37441, 37446, 37450, 37454, 37458, 37462, 37468, 37475, 37479, 37483, 37617, 38545, 38599, 38608, 38729, 38738, 38747, 38759, 38767, 39335, 40587, 40628, 40683, 40960, 41034, 41068, 41092, 41129, 41160, 41262, 41279, 41287, 41313, 41345, 41351, 42110, 42320–42321, 42332, 42393, 42438, 42442, 42460, 42476, 42492, 42496, 42662, 42776, 42786, 43241, 43348, 43600, 43602, 43604, 44864, 45058, 45620, 45927, 46138, 46150, 46328–46329, 46530, 46539, 46791, 46919 | — |
| `die` | 6322, 6373, 6612, 8041, 8079, 8099, 8215, 8294, 10366, 10462, 10570, 12738, 15216, 24759–24762, 24818, 27734, 27883, 32983, 33459, 43607, 43721, 43871, 58592 | 1703, 2328, 2338 |
| `_fallenResolve` | 32992, 43847 | — |
| `_refillRespawnResources` | 63453, 63526 | — |
| `_revZoneBonus` | 43739–43741 | — |
| `_revPowBonus` | 43741, 43746 | — |
| `_drLv` | 43742, 43744, 43747 | — |
| `_natPow` | 43743, 43746 | — |
| `_skPow` | 43744, 43746 | — |
| `_humLv` | 43745–43746 | — |
| `_demonPow` | 43746, 43748, 43750 | — |
| `_revCdFrames` | 43747, 43749 | — |

**일반 적·구울**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `eShield` | 9596, 9600, 17067, 24382, 24392, 24467, 24538, 31184, 34507, 35843, 38890, 38893, 38917, 38950, 39415, 39746, 40790, 40808, 41619, 41695, 42325, 42345–42347, 42508, 42549, 42797, 42831, 43053, 46148–46149, 52797, 52844, 52876, 53764, 53766, 53780, 53963, 53979, 62245 | — |
| `eShieldMax` | 17067, 24382, 24392, 24467, 24538, 31184, 34507, 38950, 39415, 39746, 40790, 40808, 41619, 41695, 42325, 42345, 42508, 42549, 42797, 42831, 43053, 52797, 52844, 52876, 53763, 53766, 53963 | — |
| `eShieldRegenT` | 31184, 41619, 41695 | — |
| `_shBlocked` | 42171, 42263, 42351 | — |
| `_shAbs` | 42346, 42348, 42350 | — |
| `reviveIframes` | 5247, 17070, 17172, 17187, 30787, 31180, 34456, 34508, 35677, 38247, 38590, 38950, 41618, 41694, 41800, 42120–42121, 42556, 52880, 53982 | — |
| `_revived` | 41623, 42627, 42634 | — |
| `_isGhoul` | 5246, 41623, 42208–42209, 42627, 52747, 62273 | — |
| `_ghoulT` | 41623 | — |
| `_reviveTimer` | 17071, 17124, 34363, 34365, 34383, 34493–34494, 34498–34499, 34529, 35732, 35881, 41771, 41824, 42634, 42642, 52281, 52704, 52710, 52726, 62243 | — |
| `_reviveX` | 34497, 34506, 34530–34531, 34538, 34541, 42634, 42642, 52704–52705 | — |
| `_reviveY` | 34497, 34506, 34530–34531, 34538, 34541, 42634, 42642, 52705 | — |
| `_reviveAsGhoul` | 34536, 42635 | — |
| `_reviveChase` | 34543, 38677, 38679, 41624 | — |
| `_reviveTutDone` | 34545 | — |
| `_revPow` | 42628, 42632 | — |
| `_suppress` | 42629, 42631–42632, 42636 | — |
| `_finalRev` | 42632–42633 | — |
| `_spawnGhoul` | 34538, 41602 | — |
| `_ghoulType` | 41596, 41603 | — |
| `GHOUL_DEFS` | 41591, 41604, 52748 | — |
| `_ghoulImgs` | 23082, 23257, 52760 | — |
| `_ghoulReady` | 23083, 23257, 52758 | — |
| `_ghoulDir` | 23084, 52759 | — |

**보스·피날레**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `_revPts` | 17064, 17068, 31181, 34505, 34513, 34518, 34531, 42530–42531, 42537, 42541, 42543, 42562, 42647 | — |
| `_maxRevPts` | 31181, 34513, 34518, 42541, 42543, 42562 | — |
| `deaths` | 17064, 31180, 31569, 35835, 41618, 41694, 41950, 41967, 42031, 42034, 42038, 42043, 42063–42064, 42513, 42516, 42535, 42540, 42574, 42587–42588, 42596–42597, 42612, 42617, 42648, 43870, 62282 | — |
| `_origR` | 34448, 34512, 34515, 42561, 42564 | — |
| `_bossRevJudged` | 17071, 34508, 42553, 42641–42642, 42734 | — |
| `_bossRevChance` | 34502, 42647–42648, 52731 | — |
| `_bossRevRoll` | 34502, 42647–42648 | — |
| `_bossRevived` | 17071, 34529, 42649, 52736 | — |
| `_bossReviveVFXPending` | 17074, 34448, 34524, 42584, 42621 | — |
| `_spawnT` | 5249, 17074, 17172, 31359, 34446, 34524, 42584, 52882, 65174, 65176 | — |
| `_tpWarnT` | 17074, 31194, 34523, 38786–38787, 38789, 38923–38925, 38932, 39419–39421, 39426, 40330–40332, 40342, 40348, 40397–40399, 40404, 42583 | — |
| `_bSuppress` | 42522, 42524, 42527, 42535, 42538, 42542, 42545 | — |
| `_hpZone` | 42523–42524, 42528, 42542 | — |
| `_revCost` | 42526–42530, 42541 | — |
| `_revBase` | 42534–42535 | — |
| `_revCh` | 42535, 42537–42538 | — |
| `_doRevive` | 42533, 42537, 42539, 42547 | — |
| `_rv2Base` | 42643, 42648 | — |
| `_rv2Sup` | 42644–42645, 42648 | — |
| `_rvScale` | 34513, 34515–34516, 42562, 42564–42565 | — |
| `_bHell` | 42518–42520 | — |
| `_isH7` | 42520, 42557–42559, 42594, 42617–42618, 42620 | — |
| `_maxGuar` | 42519 | — |
| `_killedBosses` | 30797, 41830–41831, 42604–42605 | — |
| `bossAlive` | 4496, 4660, 9390, 9592, 9595, 9630, 9651, 9664, 9680–9681, 9684, 9690, 9692–9693, 9700, 9705, 16715, 17075, 29540, 30203, 30274, 30677, 30797, 34510, 34528, 34532, 35810, 37081, 37107, 41821, 41827, 41869, 41898, 41920, 43896, 51996, 52016, 52028, 52129, 55201, 55248, 60109, 60212, 61951, 62126, 62364, 62476, 63496, 63956, 64105, 64776 | — |
| `_bossRef` | 4660–4662, 4664–4665, 9390, 9539, 9545–9546, 9592–9593, 9673–9674, 9693, 17075, 19967, 30203, 30797, 32689, 33072, 34510, 35729–35731, 35737, 35750, 35756, 35809–35811, 37082, 37109, 41831, 43799, 43896, 55246, 55402, 57526, 61951, 62126, 62280, 62364, 62476, 63496, 63956, 64105 | — |
| `_bossPhaseCheck` | 38236, 40447 | — |
| `_druidFinaleReviveChance` | 17063, 42538, 42648 | — |
| `_reviveDruidFinale` | 17066, 34503 | — |
| `_isDruidFinale` | 9390, 16938, 17054, 17083, 17087, 17090, 17097, 17124, 17133, 17185, 17215, 30769, 31148, 34503, 34509, 35730, 35734, 35750, 35837, 35877, 35881, 37083, 37110–37111, 37706, 38249, 38260, 38358, 38374, 38684, 38771, 40665, 40670–40671, 40677, 41052, 41063, 42517, 42537–42538, 42544, 42551, 42648, 43876, 57526, 65620 | — |
| `_druidFinaleHp` | 17057, 31149 | — |
| `_druidFinaleAtk` | 17060, 38251, 38771 | — |
| `_druidLastStand` | 17061, 17068, 35837, 35877 | — |
| `_druidBaseAtk` | 17061, 17069, 31182, 38250 | — |
| `_DRUID_FINALE_ATK` | 17053, 17061 | — |
| `_retryDruidFinale` | 17082, 63479 | — |

**연출·상호작용**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `_reviveVFX` | 34544, 38302, 38951, 39747, 40388, 41544, 41579, 41627, 41702, 42509 | — |
| `_bossReviveGrandVFX` | 34448, 41554 | — |
| `_reviveBursts` | 34595–34596, 34598, 41552, 41588, 54504–54505 | — |
| `boss_revive_boom` | 19629, 34522, 42571, 42579 | — |
| `boss_revive` | 10247, 17080, 34525, 42585 | — |
| `boss_final_death` | 10261, 34534 | — |
| `_uShieldBreakBank` | 15122, 43550 | — |
| `_uDemonRekindle` | 15123, 43860 | — |
| `shieldBankCd` | 16516, 16522, 16563, 43551–43552 | — |
| `shieldBankT` | 16516, 16522, 16562, 38534, 38537, 43552 | — |
| `shieldBankAmt` | 16516, 16522, 38534–38537, 43553 | — |
| `_twBuf` | 46572, 46593, 46608 | — |
| `_twRecord` | 32147, 46590 | — |
| `mergeMatItems` | 32163, 41632 | — |
| `_spawnMatSlime` | 41641, 41674 | — |
| `_updateSlimes` | 32164, 41706 | — |
| `_dgRevived` | 31344, 42507–42508 | — |
| `_twReviveT` | 31356, 40382–40385, 40387, 43018 | — |
| `_twPartnerDead` | 40385–40387, 40389, 43019 | — |
| `_pushOutWall` | 31722, 38589, 41407 | — |

**UI·저장보호**

| 식별자 | game.html 행 | index.html 행 |
|---|---|---|
| `shieldRing` | 2617, 60244, 60278 | — |
| `hpShield` | 2628, 60244, 60273 | — |
| `bossBar` | 387–391, 954–958, 2469, 2701, 35829, 35831 | — |
| `bossName` | 2701, 35831 | — |
| `bossHpF` | 2701, 35831 | — |
| `bossShieldF` | 2701, 35831 | — |
| `bossPoiseF` | 2701, 35831 | — |
| `bossPoiseLbl` | 2701, 35831, 48963 | — |
| `bossStatus` | 2701, 35831 | — |
| `deathReplayBtn` | 3101, 13162–13163, 43892, 49008, 63466 | — |
| `retryBtn` | 3101, 13162–13163, 43876, 49007, 63471 | — |
| `toLobbyBtn` | 3101, 13162–13163, 49009, 63683 | — |
| `deathReplay` | 650–652, 3100, 13161, 13920, 43646 | — |
| `dInfo` | 660, 3101, 43890 | — |
| `dDmgLog` | 3101, 43891 | — |
| `deathPetDlg` | 3101, 43820, 43846 | — |
| `_handleDeathMenuKeyboard` | 13158, 13211, 13366 | — |
| `_drCapture` | 43621, 61912 | — |
| `_drPlay` | 43644, 63469 | — |
| `_drReset` | 43719, 62335, 63474 | — |
| `_drBuf` | 43619, 43630–43631, 43638–43639, 43647, 43676 | — |
| `_drIdx` | 43619, 43631, 43639–43640, 43652, 43719 | — |
| `_drLen` | 43619, 43641, 43645, 43652–43653, 43719, 43892, 63467 | — |
| `_drCaptT` | 43619, 43719, 61912 | — |
| `_DR_FPS` | 43618, 43708, 61912 | — |
| `_DR_SEC` | 43618, 43709 | — |
| `_DR_MAX` | 43618, 43630, 43638, 43640–43641, 43652, 43675, 43709 | — |
| `dbSave` | 3533, 3584, 3938, 3952, 3955, 3958, 3964–3965, 3976, 42005, 48552, 61993, 62092, 62128, 62213, 62223, 63530, 63656, 63679, 63691, 63898–63899, 63940, 63943, 64042, 64056, 64092, 64158 | — |
| `dbLoad` | 3588, 62462 | — |
| `showCharGate` | — | 3423, 3820, 4340 |
| `loadLocalCharacters` | — | 2885, 3408, 3522, 3602, 3607 |
| `loadCharacters` | — | 3021, 3026, 3167, 3408, 3411 |
| `_demoActivateSlot` | — | 3512, 3557, 4347 |
| `_demoSyncActiveSave` | — | 3490, 3513, 3523 |

### 6.3 같은 이름의 객체별 참조

위 단순 토큰 `shield`에는 장비 슬롯·Q 관련 이름도 포함된다. 아래는 플레이어/적의 명시적 property 접근만 별도로 모은다. 다른 별칭 객체 접근은 위 eShield 토큰 표를 따른다.

| 정확 접근 | game.html 행 | index.html 행 |
|---|---|---|
| `P.shield` | 3549, 3623, 16288, 16291, 27962, 31567, 32759, 32831, 42657, 43545, 43547–43548, 43560, 43637, 46593, 46610, 51374, 60276–60277, 62001, 62138, 63454, 63521, 63678, 63911, 64068, 64198, 64467, 64736, 64793 | — |
| `P.mshield` | 3549, 3623, 16291, 27961–27962, 31567, 32757, 32759, 32831, 42657, 43545, 43553, 43637, 51314, 51374, 60276–60277, 62001, 62138, 63454, 63521, 63678, 63911, 64068, 64198, 64736, 64793 | — |
| `P.shieldRegenT` | 32758, 43546 | — |
| `P.eShield` | 42325 | — |
| `P.eShieldMax` | 42325 | — |
| `P._demonRevCd` | 32723, 43750, 43851 | — |
| `e.eShield` | 17067, 34507, 38893, 38917, 42345–42347, 42508, 42549, 46149, 52797, 52844, 52876, 53764, 53766, 53963, 53979, 62245 | — |
| `e.eShieldMax` | 17067, 34507, 42345, 42508, 42549, 52797, 52844, 52876, 53763, 53766, 53963 | — |
| `e.reviveIframes` | 5247, 17070, 17172, 17187, 30787, 34456, 34508, 38247, 38590, 42120–42121, 42556, 52880, 53982 | — |
| `e._reviveTimer` | 17071, 17124, 34363, 34365, 34493–34494, 34498–34499, 34529, 41771, 42634, 42642, 52281, 52704, 52710, 52726, 62243 | — |
| `e._revPts` | 17064, 17068, 34505, 34513, 34518, 34531, 42530–42531, 42537, 42541, 42543, 42562, 42647 | — |
| `e._bossRevJudged` | 17071, 34508, 42553, 42641–42642, 42734 | — |
| `e._isGhoul` | 5246, 42208–42209, 42627, 52747, 62273 | — |

## 7. 조사·인수 메모

- 시작 fetch 성공(기존 Git promisor remote 설정 warning은 있었으나 exit0). source는 위 SHA에 고정했다. 조사 도중 원격 main이 진행해도 다른 작업을 자동 병합하지 않는다.
- 설계 폴더 3개 문서를 모두 읽었다. 관련 docs 전체 검색은 `rg --no-ignore -l 'eShield|부활|antiRevive|mshield' docs`로 166경로를 찾았다. 이 166개를 전부 설계 정본으로 채택하거나 전부 읽었다는 뜻은 아니다. 이번 계약 기준은 지정 폴더3문서와 최신 원본·작업표다.
- `index.html` 전체에 `revive|shield|fallen|ghoul|divine|trueform|본모습|신성력|구울|부활`(대소문자 무시) 및 `쉴드` 검색은 일치0이었다. 그러나 로비 슬롯·데모 복사/진입의 간접 저장 경로는 §1.5에 따로 추적했다.
- ‘전수’는 §6의 핵심 식별자/관련 UI 토큰을 두 원본의 전체 행에 대조한 **정적 참조 전수**다. 문자열/주석의 일치도 포함한다. 각 일치를 실행 호출·쓰기로 오인하지 않도록 본문의 역할 표와 함께 읽는다. 동적 property alias·외부 JS 효과·실행 시 호출횟수/화면/음향은 미확인이다.
- 작성 중 공유 remote-tracking `origin/main`이 다른 작업으로 `b933b2da55e9bc7a29a41cd7d7093d437ce334cf`로 이동한 것을 관측했다. worktree HEAD/조사 원본은 시작 시 fetch된 `788ba758f9f5c92564abacb2f2fce88a42af2c1a` 그대로 보존하며 rebase/병합하지 않았다. 제출 diff는 움직이는 ref가 아닌 이 동결 base와 비교한다.
- 이번 검증은 원본 행/식별자·파일 존재·기존 test assertion·변경 범위 확인이다. 테스트 실행 PASS/부활 실동작/시각 PASS/PC·Mac 동기화 완료를 보고하지 않는다.
- 보호 범위는 모두 **보호** 표기만 했다. main/공용 파일/설계 폴더 변경 및 다른 Codex worktree 접근 없음. 후속 담당은 현재 origin/main 작업표를 다시 읽고 새 소유권을 확정해야 한다.

### 제출 전 정적 확인

| 확인 | 결과 / 한계 |
|---|---|
| game.html/index.html | 작업 파일 bytes가 동결 base의 git blob과 동일 |
| 핵심 식별자 | §6.2의 165토큰과 §6.3의 명시적 property13개를 두 원본 전체 행에서 대조. 모두 적어도 한 파일에서 일치하며 ‘—’는 다른 파일의 일치0 |
| 표·파일 참조 | Markdown 표의 열 수·코드 안 논리 OR의 이스케이프 확인. 기존 Godot 파일 참조는 실제 경로 존재 확인; §4 신규 예정 경로는 제안으로 분리 |
| 변경 범위 | base 이후 코드/테스트/설계/작업판 변경0. 스테이징은 이 문서 정확1경로만 허용 |
| 실행 | 테스트/게임/화면 미실행. 실행 PASS 또는 완성도 판정 없음 |
| 검수 상태 | 문서 검수 대기. 최종 branch/SHA·원격 보존 결과는 Git ref와 `~/exoduser-wt/_out/trace-revive-shield/DONE.txt` 참조 |
