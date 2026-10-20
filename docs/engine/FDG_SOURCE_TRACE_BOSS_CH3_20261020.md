# 3장 보스 원본 추적·작은 이식 단위 지시서 — 2026-10-20

## 0. 기준과 작업 경계

| 항목 | 확인 내용 |
|---|---|
| 작업 / branch | trace-boss-ch3 / codex/trace-boss-ch3-20261020 |
| 기준 | git fetch 후 최신 origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d. 이 main에서 --no-checkout worktree + non-cone sparse-checkout으로 필요한 docs/Godot 텍스트/game/index만 받음 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 빈 상태·파일 보존 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. index.html 4,742행, SHA256 36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12 |
| 참조 버전 | CH1 추적은 위 main. CH2 추적은 main에 없어서 원격 codex/trace-boss-ch2-20261020의 ddf0549597e645b507cac672cba29df2639712c3를 명시 fetch해 읽음. 일반화 BC 모듈은 요청한 원격 codex/bc2-02-20261020 a3b5391c54bb62b9f784bf2acac12bfbd2747192를 읽기만 함 |
| 커밋 범위 | 이 문서 1개와 CHANGELOG_SYNC 최상단 절만. 코드·테스트·설계 원문·작업판·공용6파일·타 담당·저장 형식·바이너리 변경0 |
| 실행·증거 | **Godot 실행0, import0, 게임/서버/브라우저/실창/실저장 접근0**. Node VM에서 원본 정적 등록 선언과 HP 산술 구문만 평가. 이는 데이터 조사이며 실제 전투·테스트 PASS가 아님 |
| 외부 기록 | ~/exoduser-wt/_out/trace-boss-ch3/. 자기 branch push → 원격 SHA 일치 → DONE.txt → 자기 worktree 제거. 미확인은 추정으로 채우지 않음 |

si는 전역 stage, hell은 0기준 장, phase는 HP 페이즈0~4, idx는 명시 기술ID, ordinal은 원본 배열순서다. f는 원본 tick이며 벽시계 초로 환산하지 않는다. Math.floor와 ~~(JS ToInt32), phase 전환과 HP0 부활을 구분한다. 아래 단위는 후속 설계이며 이번 구현·검수 완료가 아니다.

### 0.1 먼저 읽은 자료와 중복 방지

| 자료 | 재사용·경계 |
|---|---|
| [CH1 추적](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §1~7 | 공통 HP·난도·score·selector·5phase·시계·21공통기술 상세 정의의 정본. 같은 공식을 3장 전용 코드로 복제하지 않음 |
| [CH2 추적, ddf05495](https://github.com/beearth/the-exoduser/blob/ddf0549597e645b507cac672cba29df2639712c3/docs/engine/FDG_SOURCE_TRACE_BOSS_CH2_20261020.md) §2~7 | 같은 데이터→동작→docs차이→Godot→단위→접점→전수부록 형식. 공유30기술·36콤보의 원본 필드는 참조만. 옛 CH2 조사 시점의 main 결손/HOLD와 현재 a3b5391c의 일반화를 구분 |
| [BC2-02 보고서, a3b5391c](https://github.com/beearth/the-exoduser/blob/a3b5391c54bb62b9f784bf2acac12bfbd2747192/docs/engine/orders/reports/bc2-02_REPORT.md) 및 해당6공통모듈/context/bridge | chapter_catalog 마지막 인자·null CH1기본·continuation 문맥·실제 ack/readback 재사용. 이 원격은 본 문서 기준 main에 미병합. 보고 수치는 이번 재실행 PASS가 아님 |
| [REVIVE_SHIELD](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1.3 B01~B09·§1.5·§2~5 | 즉시/180f 폴백/포인트/실드/최종 종료의 기존 소유. CH3 부활 시스템을 별도 증설하지 않음 |
| [BOSS_BATTLE_SETTINGS](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md), 같은 폴더 나머지7문서 | 공통전투·laser 최신절 우선. 나머지는 CH1/드루이드 자료이며 CH3 독립 외형·피날레 규칙으로 확장하지 않음 |
| [부활 설계](../2_5%20부활+에너지쉴드시스템/2_5%20부활+에너지쉴드시스템.md), 같은 폴더 RESPAWN·피해수치 표시 | HP0 보스 부활과 플레이어 재시작 완충·추가HP 실드를 구분. Q/E·돌진·패링·방패·세이브 형식 **보호** |
| WORK_BOARD·FEATURE_INVENTORY·SAVE·SOUND | 작업판 병합 문구만으로 현재 파일 존재/실제 전투를 선언하지 않음. 장보스·필드보스·보상·저장·음향 각 owner 유지 |

## 1. 데이터·생성·수치 전수 추적

### 1.1 네 슬롯과 최종 집합

| si / 장내 위치 | STG.bn | 최종 기술 수 | 앞 슬롯 대비 추가 | 초기 부활력 | isHellBoss |
|---|---|---:|---|---:|---|
| 10 / 3-1 | 얼음 망령 | 32 | 기본 Set, 부록 A | 259 | false |
| 11 / 3-2 | 서리의 기사 | 34 | teleStrike, delaySlash | 265 | false |
| 12 / 3-3 | 얼어붙은 감시자 | 36 | perilThrust, spiralBullet | 271 | false |
| 13 / 3-4 | 얼음 속 봉인 괴물 | 37 | gravityWell | 276 | true |

근거 G9976–9981/10009–10010/16633–16712/30782/31181. hell2/startSi10/stages4, chapter2/hellFloor0~3/monLv300. 모두 etype0/ib=true/el=EL.I=2, col=ELC[2]=#3388ff(G14333–14342/31163). HELL WINTER/지옥의 겨울, w#20262b/f#080b0e/ac#7a201b. 네 이름이 네 etype나 네 전용 AI/모델이라는 근거는 없다. monLv300을 실제 생성 level로 고정하지 않는다.

- 최종 union37=CH2공통30+새7. CH2 union32의 poisonTrail·wallPush는 CH3에서 제외된다. CH1 union과 공통은21. laser/safeCorner/tidalWipe는 si10부터, teleStrike/delaySlash는11부터, perilThrust/spiralBullet은12부터, gravityWell은13부터다.
- 최초 _ch3Base에는 cageTrap이 있지만 마지막 전역 삭제로 전 슬롯 제외된다. score -1(G37651), 강제 시작 recover25(G38020–38023). Set 추가 순서와 BOSS_MOVES 평가 ordinal은 다르다.
- 전역59기술·68콤보·5phase를 유지한다. CH3 유효 콤보 union44=CH2공통36+새8. 최대 활성 idx56이며 idx59/60 문제를 CH3 도달 결함으로 확대하지 않는다.
- 기본 빌드의 _DEMO_MODE fallback은 demo, _DEMO_LAST_STAGE=0(G16644–16648). CH3 등록은 기본 데모의 정상 도달 증거가 아니다. full 빌드·bosstest·실제 stage 진행은 이번 **미확인**.
- _isNormalDruidBoss는 si0/3, _isDruidFinale는 stage3 조건이므로 CH3에서 false(G16938/17054–17055). CH3에 드루이드 독탄·피날레 HP·막순서·저항 부활을 적용하지 않는다.

### 1.2 공통 등록·생성의 CH3 적용

| G 행 | 읽거나 적용할 것 | 보존·참조 |
|---|---|---|
| 9820–9880 /9881–9950 /9951–9957 | moves59/combos68/phases5 | CH1 §1·부록A/B의 공통 manifest. CH3 데이터 전수는 이 문서 부록A/B |
| 9976–9981 /10009–10010 | CH3 4Set + cage 최종삭제 | 아래 기본32 뒤 11에2개/12에2개/13에1개 append |
| 9272–9278 /31119–31152 | 난도·level·HP/ATK | CH1 §1.2/BC02 공통 계산. 실제 원본 산술 구문을 평가한 표본은 아래. dead 배율8/3/15/5(G14355–14356) 사용0 |
| 30697–30747 | arena | 128×108, T40, hell2 type2 **십자형**. 중앙(64,54)→(2580,2180), entry(64,103), exit(64,1). 맵 제작은 별도 owner, CH2 직사각형 arena를 그대로 복사하지 않음 |
| 30749–30814 /31540–31541 | 진입·bosstest | 백업/배열·G reset→현재 STG.be로 mkEn→boss flags·봉인연출. bosstest는 P를 보스 남쪽3T, 카메라를 P.y−2T. retry 분기와 일반진입 구분 |
| 31120–31140 | spawn gate/몸 | 먼저 finite 좌표·canMv/safePt 반경22. 실제 몸 r44, speed/baseSpd .5, elite0/mods[]/배율1. 실패 null을 정상 actor로 바꾸지 않음 |
| 31162–31185 /31260/31300 | 초기 packet | hp=mhp=poise=maxPoise=eShield=eShieldMax=H, atk=baseAtk=A, phase0, CD배열59칸. 6개 draw와 호출순서는 BC02. dropTier=min(hell+1,4)=3. _revPts=maxPts는 위4값 |
| 31359–31363 /23149–23152 | body/skin | _assignMobSkin 및 공통 body producer 의존. _assignBossSkin은 no-op이며 atlas 별도 소비. 수치 packet만으로 실제 actor·skin 연결 완료 아님 |

기본32의 Set 삽입순서(원본 최종값):
slashCombo, slam, sweep, charge, jump, burst, shock, fan, spin, grab, multiDash, summon, mine, vortex, chaseAoe, elemBall, beanStorm, beanRain, fanWave, laser, tideWave, groundFissure, seekerMines, shieldBash2, lavaPools, fireRain, shockGrid, donutSlam, crossWipe, safeCorner, tidalWipe, rapidMissile.

공통식은 CH1 §1.2를 따른다. L=max(1,(P.lv||1)+(DIFF_LV_OFF[OPT.diff]||0)+(G._stageDiffOff||0)), dm=DIFF_MUL[OPT.diff]||1. H0=floor(C*pacing*24*dm), H=floor(H0*(1+si*.02)); A=floor((75+L*2.9)*.6*dm). C와 pacing은 공통 원문·BC02를 재사용한다. 아래는 원문 G31119/31145–31147/31151–31152 구문을 별도 VM에서 평가한 dm1·et배율1의 **정적 표본**이다.

| L | H si10 | si11 | si12 | si13 | A |
|---:|---:|---:|---:|---:|---:|
| 1 | 25,220 | 25,640 | 26,061 | 26,481 | 46 |
| 10 | 139,838 | 142,169 | 144,499 | 146,830 | 62 |
| 100 | 23,587,200 | 23,980,320 | 24,373,440 | 24,766,560 | 219 |
| 300 | 609,886,366 | 620,051,139 | 630,215,912 | 640,380,685 | 567 |
| 500 | 2,813,593,536 | 2,860,486,761 | 2,907,379,987 | 2,954,273,212 | 915 |
| 501 | 2,811,931,200 | 2,858,796,720 | 2,905,662,240 | 2,952,527,760 | 916 |

500→501 불연속과 2^31 초과 HP를 임의 보정하지 않는다. 생성의 floor 두 번과 phase/부활 내부 ~~는 서로 다른 계약이다.

## 2. 패턴·진행·연출·부활의 원본 추적

### 2.1 공통 흐름과 CH3 차이

| G 행 | 단계 | CH3에서 유지할 것 / 기존 정본 |
|---|---|---|
| 38584–38635 /38637–38705 | updateE 상위 gate | 레슨·벽·KB·hitstun/stunned/freeze return 뒤 처리. phase도 상위 return을 통과해야 한다. CH1 §2.1 순서 |
| 38771/38874–38884 /40444–40454 | ATK/시계/dispatch | baseAtk 재계산→aura→projectile charge→st2감산→phase→idle move/AI→feint→같은tick state switch. st2를 각 새 모듈에서 중복 감산 금지 |
| 37650–37699 /38373–38441 | score/selector | CH1 BC03/04의 동일 계산·ordinal·상위6가중추첨·조건부 RNG 재사용. si2 얼굴가점/si0·3 streak배율은 false. cooldown은 원래 idle 호출에서만 감산 |
| 38235–38314 | phase | .8/.6/.4/.2의 strict 경계와 한 번 jump, 상한 HP회복/iframe90/강화·상태reset·텔레포트·파동·탄·VFX 순서. CH1 BC05 재사용. 즉시 ATK×1.3을 영구 baseAtk 강화로 바꾸지 않음 |
| 38315–38372 /40483–40517 | idle/generic 후속 | orbit/flow/자동탄/generic idle×1.6·접촉·차징 경로까지 존재. 이름에‘얼음’이 있다는 이유로 새 추적 AI를 만들지 않음 |
| 37701–37710 /41375–41383 | start/recovery | tele=~~(mv.tele*phase.teleM)+extraDelay; si2×1.4/피날레최소tele 비적용. metadata.rec와 실제 recovery 상태/일반recover20 clamp·bossRec 구분 |
| 16938–16996 /37769–37791 /37971 /40891–40904 | 탄 원소 | 보스 기본 el2·col#3388ff지만 모든 위험물이 얼음은 아님. mine/seeker는 EL.D, black/red/elemBall 각각 원문 props 유지. raw 요청→밀도·배율·유도·반사 분류는 기존 owner |
| 20122–20155 /40507–40517 /35074–35082 | generic 얼음탄·감속 | el2의 차징 profile은water이며 waterBean/EL.I/raw~~atk1.2/속도3.2/_commit으로spawnProj직접요청. 단순EL.I 모든탄에freeze를추가하지않음: 기존iceZone/blizzard 플래그분기에서만해당빙결효과를판정. 보호반사/피격은기존owner |
| 37832–37845 /37057 | 공유 spiralBullet의 **속성 차이** | CH3는 비물리라 windup0/maxT180/nextShot0. 첫 양의 sp tick에서 발사 가능. CH2 물리의60/240/60을 복사하지 않음. arms3+min(actorPhase,2),dir난수·interval6·회전t*.04·_commit·직접spawnProj는 공통 |
| 40798–40815 /40869–40890 /41111–41143 | stage 산술 | summon=3+~~(si*.5)→[8,8,9,9]; spin R500+si15→650..695; slam R1000+si30+phase80→phase0 1300..1390. 소환 child type[0,2,3,3,3]·속성추첨·HP절반/실드0·배치/등록은 공통 owner |
| 37931–37978 /38085–38117 /38118–38160 /38178–38191 | 공통지연큐 | CH1/CH2의 fissure/tide/seeker/lava/fireRain/grid/donut/cross producer·consumer를 참조. donut OR조건, grid/cross의 서로 다른 tick reset도 그대로. CH3 이름으로 피해/범위 수정0 |

### 2.2 새4상태 계열 — 9state

보호 Q/E·패링·피해 분기는 **관측·의존 표기만** 한다. 독립 모듈은 request/실제 owner readback 규약을 사용하고 합성 ack를 실제 명중 성공으로 세지 않는다. 아래 수치는 raw이며 원소/탄 후처리를 생략한 최종 피해가 아니다.

| 계열 / G 시작→소비 | 정확 상태·판정·종료 |
|---|---|
| laser /37720–37721→40710–40748 | 초기 laserAng=facing/len0, wind tele\|\|50. wind 중 angle diff를 ±π로 정규화 후 *.04*sp 추적. 끝에 lockAng·방향coin±1·sweepT0, active80/len1400+si60→[2000,2060,2120,2180]. flash3/maxshake8·parts14. active는 재조준/이동 없이 sweepT+=sp, lock+(dir\|\|1)*.0065*T. isW를10단위로 검사하며 첫 벽에서 actualLen 절단. proj>0 && proj<actualLen, perp<Pr+80, iframe<=0. 패링은 원래 bank/poise20 의존. 비charge 피격은 **~~(P.mhp*.01), dtype magic**, 무적 max60·옆KB6·death sample/내부 RNG. 매tick 입자 RNG도 보존. 종료 recover60/SFX.beamStop |
| teleStrike /37738–37749→40979–41046 | 시작 P뒤 각π+(U−.5)*.4/거리40+U20, canMv 실패 시 뒤80 safePt→실패하면 제자리. warn좌표/origin/prepMax 저장, prep tele\|\|40. prep facing추적·VFX RNG, **si0/3 지중보간은 CH3 false**. 종료 시 원위치VFX→지정목표이동→flash8/연기→TeleWarn60/dropY−80→TeleDrop30. dropY+=(0−dropY)*.15*sp. 착지 R80+er(초기124), strict거리/iframe<=0/**not charge를 패링보다 먼저**. 패링은 ×3/parry/체간20·스턴60 의존, 일반피격 ~~(atk*1.8*elMul). focus는 피해 후 pStun만 막음; 그 외 P.s=pStun/st2=300·groggy/hitStop/slow. 끝 **bossRec35**. e.iframes 무적을 새로 만들지 않음 |
| delaySlash /37846–37853→41242–41268 | 시작 facing=P각, hold=30+~~(U90), _dsMaxT저장. metadata.tele/rec로 대체 금지. hold 추적 최대 .02*sp rad, 종료 Swing10/weaponAng−1. active progress=1−st2/10, weaponAng=−1+progress2.5, 전진4sp/XY canMv만. strict .2<progress<.8, dist<er+Pr+40, iframe<=0, angleDiff<1.3. 패링 ×3.5/스턴70/체간20 의존; 비charge 피해 ~~atk2*elMul/KB10. 독립 hit latch 없음. 종료 recover30 |
| perilThrust /37854–37859→41269–41285 | Wind tele\|\|25 동안 facing 추적, 끝 Thrust30/echD lock. 매tick 50sp의 XY canMv; 막히면 recover40으로 즉시 break. dist<Pr+er+12/iframe<=0이면 원패링 ×5/스턴120/체간60 또는 비charge 피해 ~~atk2.5*elMul/KB14. **접촉 outer gate 통과 시 charge여서 피해가 없어도 recover40**, timeout recover35. axis fallback 없음 |

### 2.3 새3지연큐

| id / 생산→소비 G 행 | 생성·시간·조건·제거 |
|---|---|
| safeCorner /38161–38177→37137 | W=(mw\|\|50)*40,H=(mh\|\|42)*40,중심W/2,H/2. Q=~~(U4), safeX=cx±W*.22/safeY=cy±H*.22, safeR650/fullR=W*.5. t0/warn120/max150/dmg~~atk3/el/hitfalse. t+=sp, t>=warn이면 **먼저hit=true**·SFX/shake30. dist(P,safe)>650/iframe<=0/notcharge에서 피해·중심기준KB15. fullR은 피해 바깥반경 gate가 아님. 입자40과 RNG, t<max만 유지 |
| tidalWipe /38192–38211→37141 | 방향Q=~~(U4), 각[π/2,π,1.5π,0], 맵 가장자리 시작. warn80/max180/spd12+actorPhase2/w=수직방향W·수평H/thick300+phase50/dist0/dmg~~atk2.5/el/hitfalse. warn 도달 후 dist+=spd*sp→중심계산, abs(parD)<thick/perpD<w/2/iframe<=0/notcharge/!hit일 때만 hit=true·피해/방향KB18. **hit1회**, 경고중 이동0, t<180만유지. reset·순서·폭/두께를 wallPush와 통일하지 않음 |
| gravityWell /37992–38002→37075 | P방향·거리의 .4 지점, t0/max180/r900/pull9. **dmg/el/src 필드 없음**. 매tick t+=sp 후 dist<r이면 힘9*(1−dist/r)를 P.kb에 방향*sp로 누적. iframe/charge 제외 gate·피해 호출 없음. **수명검사 전 pull**이므로 종료tick 동작도 원문대로; t<max만유지. 무적/아군판정/직접피해를 새로 추가하지 않음 |

3큐는 actor가 recover인 동안도 G측에서 진행한다. 같은 update에서의 생산/소비 위치·안정 압축·배열 reference·입자 RNG와 실제 P.kb writer가 필요하다. 보스 죽음 시 임의 일괄 삭제하지 않는다. reset은 G30763–30770/31555–31558/63486–63489/64282–64286을 참조한다.

### 2.4 HP0·부활·최종 종료

정본은 REVIVE_SHIELD §1.3 B01~B09와 CH2 §2.5다. CH3는 hell2이므로 H7/피날레 예외 false, _maxGuar=3은 선언만 있고 보장횟수 판정에 사용되지 않는다(G42519). 새 CH3 부활 모듈은 설계하지 않는다.

| G 행 | CH3 적용·의존 |
|---|---|
| 42515–42538 | deaths++→antiRevive/holyPrison 억제→**판정 전 cost차감**. 초기points259/265/271/276. 즉시chance=max(0,2+si*.05−(deaths−1)*.15−sup); 첫deaths/sup0은[2.50,2.55,2.60,2.65], 상한1clamp 없음 |
| 42547–42622 | 성공: HP100%/실드0/phase0/iframe90/reset, maxPoise~~×1.5·현재25%, atk~~×1.5(다음base reset과 구분), speed cap1.6/patCd floor60. origR·최소r10/정수절삭·축소전VFX·뒤텔포·spawn55·grand40. CH2/REVIVE 공통 순서/동반부활 참조 |
| 42640–42649 /34493–34535 | 즉시실패 후 timer180에 사망 순간 chance/roll 저장. chance=max(0,1.5+si*.05−deaths*.25−sup),points0은chance0/roll1. 폴백성공 추가10points·HP~~(mhp*.5)/실드0/recover60·iframe90, 즉시강화/phase reset을 재실행하지 않음 |
| 41554–41578 /19629 | grandVFX는 공통 flash14/3ring/광원/impact/hitstop16/slow90/shake30/chroma18. boss_revive_boom 등록은 파일 미존재 주석인데 호출은 남음. 실제 포탈 재생 성공은 **미확인** |
| 42945–42962 | 속성사망장판은!e.ib gate. 얼음보스최종사망에일반몹iceZone을자동추가하지않음. 소환된일반child는그owner의별도경로 |
| 41816–41863 /52281 /41921–42009 | 매30frame checkRooms: alive 또는 ib&&timer>0이면 종료아님. 확정 후 bossAlive=false/clearTime/상자·출구·victory, 출구접촉 뒤 stageCleared/진행. si13은 hellCleared[2] 대상. 상자 보상은 NW/TI/ITEMS 소유, 저장 호출/형식은 SAVE 소유 |

### 2.5 몸체·전조·HUD·사운드·index.html

| G 행 / 파일 | CH3 실제 경로·한계 |
|---|---|
| 10982–11014 /23499–23540 /53554–53584 | 외부 atlas_bosses의 boss_10..13, _getBossAnimState와 상태 fallback, 250ms frame/팔레트·r기준 scale. 같은 아틀라스 등록이 4종 3D모델/자연전투 완성의 근거는 아님. JSON 상태별 개수는 부록D |
| 53145–53181 | laser wind 표시길이280+si15=[430,445,460,475], 실제 beam은 _laserActLen\|\|laserLen으로4겹 렌더. 표시폭2..28과 피해 perp<Pr+80은 동일하지 않음. 전조 progress는 st2/50 고정이며 tele실제시간과 구분 |
| 53182–53187 /53369–53430 | teleStrike 옛목적지/체공 원형 표시 코드는 폐기 주석. delay hold 표시 300+progress200/각.8·떨림, swing무기; peril 경고 C최대치1.5/분모25·폭40+progress30, 이동궤적. 표시를 실제 hit 범위로 대입하지 않음 |
| 57637–57654 /57677–57699 /57950–57963 | safeCorner 안전원·전멸 경고, tidal 이동벽·진행, gravityWell fade/소용돌이. 공통렌더의 시간·난수도 전투 draw 순서에 영향. 실창 판정은 이번 없음 |
| 26486–26501 /53614이후 | hell2 푸른 바닥/룬·phase aura·체간·spawn/무적 공통 표시. CH3 전용 아트 제작 지시로 확대하지 않음 |
| 64947–64982 /65093이후 /65148–65192 | _B3_MODELS는 hell0만 등록. **hell2는 _B3_DEFAULT Meshy_AI_1**의13state/5GLB fallback. ready 3D가 활성일 때 _spawnT=999 등 2D 억제. CH3 네이티브 3D/얼음 전용 모델 연결은 미확인 |
| 24758–24764 /30812 /38308 /41808 | _BOSS_SFX는si0~3만, CH3는null이라 공통 howl/hit/death fallback. 4전용 pitch pack/대사 근거 없음. 부활·완전사망 SFX는 기존 owner |
| 2701 /35827–35885 /55415–55424 | STG.bn·부활횟수 suffix, HP intro90/시네마180·poise상태바·**bossShieldF폭0**. 데이터 eShield=HP를 실제 파란bossbar 표시로 읽지 않음 |
| 10381 /35867–35885 | BGM_MAP[2]의 h2 파일 등록과 실제 bKey 별개. isHellBoss로 si10~12 boss, si13 finalboss, 기존 BGM 전환/믹서 owner 재사용 |
| index.html 1–4742 | 네 CH3 이름과 핵심61식별자의 직접 일치0(부록C). 전투 로직이 로비에 있다는 근거 없음. 서버/동적외부코드 절대 부재로 확대하지 않음 |

PNG/GLB는 픽셀·모델·애니메이션을 열어 검수하지 않았다. atlas PNG blob4546568b3c877d0c76f8006dcb9673a89fa072ba, JSON blob3f2591aef1ae542321ab5e335b2f3b6cc7586d5a를 확인했으며 **Git blob ID는 SHA256이 아니다**. 바이너리 복사0.

## 3. docs와 현행 원본의 대조

지정 보스8문서·부활3문서의 파일범위/관련절과 기존 추적을 대조했다. 4종 고유 HP/무브/연출 별도 설계서는 이 범위에서 미발견이다. 공통 불일치는 CH1 §3·CH2 §3·REVIVE §2를 참조하고 원문을 수정하지 않는다.

| ID | docs·행 | 원본 근거 / 판정·후속 지침 |
|---|---|---|
| C301 | BOSS_BATTLE_SETTINGS:229의 +laser/safeCorner/teleStrike/delaySlash/perilThrust/gravityWell | G9976–9981. 요약에 **tidalWipe와 si12 spiralBullet 재해금·stage별 조건**이 생략됨. 모두si10부터 해금한 것으로 만들지 않음 |
| C302 | 같은229의 앞장에‘추가’라는 누적 해석 | CH2에 있는 poisonTrail/wallPush가 CH3에는 없음. CH2 전체32+새7=39로 만들지 않음. 실제공통30+새7=37 |
| C303 | 같은220/233/235의49종/null전체,37최신cage금지와237–257옛다른보스사용 | G9820–9880/10009–10010. 실제59·CH3 32/34/36/37·cage전체제외. CH1 D03/D04·CH2 C201/C203과 동일한 공통 이력차이, 재설계 없음 |
| C304 | 같은569–585의laser 예고lock/sweep·80f·len식·재조준없음 | G40710–40748과 **일치**. 실제피해는P.mhp1%/magic, metadata ATK/rec나피해표시폭으로추정하지않음 |
| C305 | 같은193/197의강화·빨콩50%+무지개50% | CH1 D09/D18·CH2 C204/C205 참조. G38771 base reset과G38295 일반HSL탄/blackBean 없음. CH3의 영구ATK강화/무지개분류로 확대금지 |
| C306 | 같은101–111의현행HP/ATK정정 | G31119/31145–31152와 **수식일치**, 문서296xx행은현재311xx로이동. CH3 last si13에도dead FINAL15/5배율추가금지 |
| C307 | 같은297–327의미등록장3D fallback·hell0전용hit 설명 | G64947–64982. hell2 fallback 자체는일치. Vinebound의hit교체규칙을기본Meshy/CH3네모델채택으로확장하지않음 |
| C308 | 부활설계30/34–42/49·보스 불사·포탈3f·반경/SPD/쿨요약 | REVIVE X07~X10·CH2 C208~C211 참조. G42515–42649의선차감·실패/폴백/최종사망·5f포탈·minr10/cap/floor 포함. _maxGuar3으로정확3회부활보장정책을신설하지않음 |
| C309 | 부활설계235의boss바와실드표시동일구조 | G35843 bossShieldF0, REVIVE X15·CH2 C212와같음. 별도3장실드바를추가하지않음 |
| C310 | 3장 safeCorner/tidalWipe/gravityWell 상세계약 공백 | G37137/37141/37075. 안전fullR은피해gate아님·tidal1hit·gravity무피해/무iframegate. 패턴명이나다른게임참고로정상적인원형/피해영역을추정해교정하지않음 |
| C311 | 3장 네이름별아트·SFX 전용설계 공백 | G16691/24758/64947/atlasJSON. 이름은있으나4독립AI/GLB/포효pack완성근거없음. 실제품질·채택상태 미확인 |

## 4. Godot 의존과 빠진 것

### 4.1 기준 main과 원격 정본의 버전 구분

| 위치 / 버전 | 정적 확인 | CH3 재사용·결손 |
|---|---|---|
| main의 native_ch1_boss_catalog.gd:160–207 | BC01 존재, CH1 stage0~3/union24/global59manifest | 공통21·phase5의 정본. CH3 stage로 직접호출하면unsupported. 메서드 이름만보고37전체getter라고하지않음 |
| main의 native_ch1_boss_spawn_contract.gd:33 /utility.gd:21 | BC02/03 존재하나마지막chapter인자없는CH1판 | 이 main의코드를CH3 wrapper에바로연결불가. a3b5391c 인수의존을명시 |
| main의 selector/phase/start/melee/context/CH2 catalog·bridge·reuse | **파일없음**. WORK_BOARD의BC04~07병합문구와 tree가불일치 | 원격존재와main인수를구분. 이번복사/병합0 |
| a3b5391c의 native_boss_catalog_context.gd:6–40 | GDScript provider의메서드5개·sourcehash/global59/68/manifest확인, null은CH1. token에provider/path/hash결합 | CH3catalog를공개마지막인자로전달가능한설계. token위조·si10→si0위장·전역provider설정금지 |
| 같은 BC02:35–146,BC03:23,BC04 select_tick,BC05 phase/clock/effects,BC06 begin_start/next_start,BC07 begin_tick/next_tick | 여섯공통모듈장catalog인자화·후속token문맥. field/command/readback 계산은재사용 | BC2-02검수범위는물리CH2다. CH3얼음출력/실행이자동검증됐다고하지않음 |
| **a3b5391c BC02:110** | el은boss.element_id지만 **col은#bbbbbb고정** | 원본G31163+14338의CH3 #3388ff와불일치. 공통spawn owner가색상공급접점을수정/인수해야함. CH3가생성식복제·packet사후색상덮어쓰기로숨기지않음. 첫catalog는독립진행가능,spawn재사용완료는HOLD |
| 같은 BC06:47–48 | 명시provider의move가CH1union밖이면 pattern_start_owner_required | CH3에서공유시작21만후보. CH2고유9+CH3새7=16은현버전미지원. CH2후속의소유/인수SHA는재확인필요,완료가정금지 |
| 같은 native_ch2_boss_catalog.gd /bridge.gd /reuse.gd:53–55 | catalog는30공통move·36공통combo 공급원,bridge는globalmanifest결합. CH2reuse continuation은provider=CH2/si4~9만 | CH3catalog는공개읽기API참조. **CH2reuse를CH3실행 façade로호출하지않음**. 장별얇은진입점은다음단위의자기파일만,공통수식0복제 |
| 원격 BC08 1b901f12의 movement_states.gd:17–35 | begin/next 모두si0~3 guard,chapter인자없음 | charge/jump/multiDash/idle은 a3b의일반화범위밖. 기존owner의인자화/연속token인수전HOLD,새CH3이동계산병렬구현금지 |
| main enemy.gd:484 /native_normal_enemy_hurte.gd:151 | ib는boss_hurtE_not_adopted /unported_branch_active:boss_hurtE | 실제보스피해·부활은닫혀있음. 일반몹으로위장/guard삭제금지 |
| main factory/world/init_stage | 한정profile·동적일반몹, init_stage:422는unowned_boss_branch | 장보스actor/소환0·2·3/arena/맵epoch·현재배열권위없음. privatepacket≠liveowner |
| main State·Main·regions·HUD | G/P reader·일반시계·지역표시·fieldboss_combat=false | 9state/3queue·actual executor·HP0/최종종료·3장bossHUD/영상/사운드실행미연결. fieldboss는별개 |

이번에는 위 원격 코드를 인수·설치·실행하지 않았다. CH2 추적의 옛 B2C02 ‘catalog 접점미정’은 a3b5391c에서 **BC02~07 범위만** 해결된 것으로 갱신해 읽는다. BC08·얼음색·실전 연결까지 해결됐다는 뜻이 아니다.

## 5. 작은 이식 단위 순서안

### 5.1 1번 BC3-01 — 3장 읽기 전용 catalog, 구현 지시서

| 항목 | 후속 구현 지시 |
|---|---|
| 목표 / 끝조건 | 4slot·최종Set·union37·유효combo44·공통5phase의읽기전용제공. actor/실제RNG/시계/G/입력/피해/저장/화면연결0, 공용0줄 |
| 기준 / 의존 | 후속 fetch의최신main에서인수여부재확인. 필요한 CH2catalog/bridge는요청원격a3b5391c(BC2-01 6e6f2f58포함)를명시의존. main미병합이면승인된그끝에서분기/의존기록. 부재·미인수WIP를몰래복사하지않음. 이문서branch는설계일뿐그원격을merge하지않음 |
| 자기파일 | 신규 godot/scripts/native_ch3_boss_catalog.gd, 신규 godot/tests/test_boss_ch3_bc3_01_catalog.gd, 필요시자기원본발췌oracle/UID·작업REPORT·허용CHANGELOG. 기존CH1/CH2모듈·State·main·world·player등0줄 |
| API | source_receipt(), boss_for_stage(si), moves_for_stage(si), move_by_id(id), phase_by_index(phase), combos_for_stage(si,phase). 기존정적int/String계약을따르되si10~13/phase0~4범위밖은unsupported또는빈조회. stage미지원과의존NOT_READY를구분 |
| boss packet | supported/si/hell2/name_ko/element_id2/element_color #3388ff/ibtrue/etype0/move_ids. element_color는G14338/31163의읽기metadata이며현재BC02고정col을자동수정하지않음 |
| receipt | 이번gameSHA·기준main·의존SHA/원본행·global59/68/phase5·stages10..13·union37/common30/new7/combo44/common36/new8/maxidx56·live_combat_connected=false/save_io=false/rng_draws0. Context가검사하는move_manifest는Shared원본globalmanifest를그대로전달 |
| 공유30move | CH2 bridge.move_by_id의공개읽기API로조회하고필수11필드·idx/ordinal/행/동일sourcehash검증. 깊은복사. common식·기존30literal 재전사0. CH3에없는poisonTrail/wallPush/tailSwipe/burrowStrike/cageTrap조회는빈결과 |
| 새7move | 부록A2의원본11필드+source_ordinal/source_line만소유. idx와ordinal을동일하게계산하지않음. metadata.combo에swordWave/wallPush처럼CH3Set밖ID가있어도원본값그대로보존 |
| Set / phase | §1.2기본32순서뒤stage별append. moves_for_stage는반대로BOSS_MOVES globalordinal순서. phase는Shared.phase_by_index5×8필드를위임,배율/HP경계표복제0 |
| 콤보 | Shared.combos_for_stage(si4..9,phase0..4)를조회해부록B의공유36 ordinal만수집. **같은ordinal의중복조회만제거**, seq문자열중복제거금지. 새8레코드추가. globalordinal정렬후모든seq가해당Set에있고phase가맞는것만반환. 4×5 후보수는부록B |
| 실패 | Shared파일미인수/부재는착수BLOCKED. 존재하지만receipt/hash/globalmanifest/필수move/combo누락이면명시NOT_READY/ready=false. 유효한빈catalog처럼숨기지않음. 호출자가반환nested값을수정해도다음호출·타stage·Shared에영향0 |
| 독립원본검사 | 최신main game을입력으로전체hash·고유마커·구간hash고정, 원문등록선언VM을별도oracle로실행. 기대값을제품에서생성하지않음. 4Set의모든id/순서·37move의11필드/idx/ordinal/행·44combo seq/phase/ordinal/행·5phase8필드전부대조 |
| 경계·불변 검사 | 수32/34/36/37·union37=30+7·combo44=36+8·4×5후보수·외부si9/14·phase−1/5·알수없는ID·금지cage·공유 의존불일치·같은seq다른ordinal보존·반환변경/다른stage별칭·공유RNG/씬/IO0. registered≠실제선택가능/actor인수 |
| 하니스 | 후속격리명 EXODUSER-bc3-01-Isolated-20261020 제안. node-bin/source-game은명시인자, OS.execute전체join또는UTF-8임시파일. JSON숫자는원본binary64 bit와정수프로토콜을보존하고epsilon으로완화하지않음. Godot는별도구현지시후pgrep2이상이면30초대기/매run override설정후0byte |
| 중단선 | 첫단위에BC02색상수정·BC08인자화·main연결을끼우지않음. 이접점이필요한다음단위는정확파일/행/원본근거로통합요청. 가짜READY·소유우회·검사축소/skip 없음 |
| 제출 | 명시파일add·정상hook·자기branch만push·remoteSHA/DONE후자기worktree제거. 이문서의정적조사와후속Godot실행수치를구분 |

### 5.2 후속 작은 단위와 연결 중단선

| 순 / 후보 | 자기 신규 범위·원본·검증 축 | 선행 / 중단 |
|---|---|---|
| 1 BC3-01 | 위 catalog+원본대조 | 공통계산수정없음 |
| 2 BC3-02 | CH3catalog를공통BC02~07의마지막인자로명시전달하는얇은독립진입점·원문fixture. 실제si10..13/EL.I/미래token provider검사 | BC3-01/a3b. **BC02:110 col고정은owner수정/인수필요**, 공용0불가능하면필요위치보고HOLD. packet사후덮어쓰기·si위장·공통식복제금지 |
| 3 BC3-03 | 새7시작case만command/ack계획, §2.2/2.3 RNG·좌표·queue/시각호출순서·recover/bossRec검사 | BC06프로토콜+catalog. 기존공유21·CH2고유9는해당owner재사용/인수, 미지원case를완료로세지않음 |
| 4 BC3-04 | laser wind/active2state: .04추적→lock/80/sweep·10단위벽절단·HP1%·iframe60·입자RNG | 원시계/벽reader/효과·보호contact readback; 실제피해·패링연결0 |
| 5 BC3-05 | tele prep/warn/drop3state: 목표fallback·60/30·dropY·124경계/focus/pStun·bossRec35 | owner ack·충돌/P위치·피해·상태권위. 모듈내새무적/입력판정0 |
| 6 BC3-06 | delay hold/swing2state: U=0/1직전30/119·.2/.8/1.3strict·XY전진/반격readback | 기존시계/contact, hit latch추가0 |
| 7 BC3-07 | peril wind/thrust2state: 50sp·벽즉시break·접촉charge라도recover40·timeout35 | 기존충돌/보호판정, 축별이동fallback추가0 |
| 8 BC3-08 | safeCorner1queue: 네Q좌표·warn120/max150·650strict·fullR밖·선hit·입자draw | map dimensions/Statequeue/P피해owner. 실제writer0 |
| 9 BC3-09 | tidalWipe1queue: 네방향좌표/폭·80후이동·단발hit·180종료 | 공통queueclock/안정압축/피해owner. wallPush복제없음 |
| 10 BC3-10 | gravityWell1queue: .4좌표·거리0/900·선pull후trim·iframe/charge영향없음·무피해 | P.kb실제owner,새피해/면역규칙0 |
| 11 BC3-11 | 공유30기술의실제si/얼음fixture: spiral0/180/0,waterBean/감속flag,elemBall속성,mines암흑,소환[8,8,9,9],stage반경·고유9미지원대조 | CH2후속확정SHA/기존BC08의장인수필요. BC08guard수정은공통owner통합요청,기존계산재작성0 |
| 12 BC3-12 | CH3포인트·HP0→즉시/180f폴백→최종문gate의원문fixture | **REVIVE B1/B2 기존단위참조**. 새CH3부활모듈없음, boss_hurtE닫힘을우회하지않음 |
| 13 BC3-13 | boss_10..13·laser/새3queue전조·3Dfallback·HUD/음향의읽기소비사양·시각후속검수 | 원본assets/renderer/SOUND/HUD owner; 실제1x화면은별도지시,새이미지제작0 |
| 14 BC3-14 | 실제arena/actor/입력·시계/피해·부활/상자·출구/si13완료합류 | Main/World/State/factory/hurtE/HUD 공유접점통합결정전 **BLOCKED**. 저장형식·Q/E보호유지 |

## 6. 공용 접점·통합 결정 목록 — 이번 모두0줄

| 접점 | 현재 파일·위치 / G 근거 | 필요한 인수·최소 변경 판단 |
|---|---|---|
| 장 data/context | a3b context:6–40,CH3catalog예정 /9976–9981/16691 | 기존globalmanifest를가진명시provider. null CH1 기본/기존token보존. 첫catalog는공용0 |
| 생성 색상 | a3b native_ch1_boss_spawn_contract.gd:110 /14338/31163 | #bbbbbb상수1대입을올바른원소색공급으로일반화할owner결정. 원소색표/색상reader의공개계약은미확인,실제수정줄수미확인 |
| 공유이동 | 원격BC08 movement_states.gd:17–35 /38315–38372/40664–40709/40942–40978 | si guard 및 begin/next continuation의장문맥인자화필요. 실제diff줄수/수정소유권은미확인 |
| 실제stage/arena/배열 | Main render/clock입력:898–935·physics1004,World reader996이후·physics2986 /30697–30814 | currentstage/map epoch/십자collision/actor등록/유효수명,역순·stale snapshot·queue reset authority. 정확새삽입위치/줄수미확인,공용router를임의만들지않음 |
| 상태·3queue executor | State G/P reader175/581,Main/World /§2.2/2.3 | request순서대로실제owner효과→ack/readback,동일sp/입자draw·안정 압축. snapshot배열을실권위로직접쓰기금지 |
| 피해·부활 | normal_enemy_hurte:151,enemy:484 /42515–42649/34493–34535 | 정식boss_hurtE/REVIVE owner 필요. ib거부삭제/일반mob위장/QE판정변경0 |
| player 강제효과 | Player상태/KB/피해기존권위 /41015–41046/41273–41285/37075 | grab와별개tele착지pStun·laser iframe·중력KB의실sink. 보호focus/charge/parry 분류owner수용전HOLD |
| 투사체/음향/표시 | 기존projectile·SOUND·HUD owner /16938–16996/24758/35827/53554 | raw요청과실탄후처리/반사·색·렌더를분리. body색문제를탄색강제교체로숨기지않음 |
| 완료/보상/저장 | regions/factory/State·SAVE/NW/TI /41816–42009 | pending부활문닫힘·si13 hellCleared2·상자/출구·진행. actorHP/phase/queues의새저장필드0 |

위 원본 statement/기존 위치는 확인한 근거이며 수정 승인이나 실제 예상 diff가 아니다. BC3-14로 바로 뛰거나 미확인 owner를 대신 만드는 작업은 하지 않는다.

## 7. 전수 부록·정적 확인

부록은 §1~6의 참조가 빠지지 않도록 식별자·원본행을 고정한다. common literal은 CH1/CH2 정본을 참조만 하며 중복 전사하지 않는다.

### 부록 A. CH3 기술37개와 새7개의 전체 필드

공통30의 11필드 literal은 CH2 부록A(같은 game SHA) 및 BC2-01의 공개 조회를 참조한다. 아래 전수표는 모든37기술의 원본 ordinal/idx/선언행/start/state·queue를 연결한다. 새7의 literal만 A2에 전사했다.

| ordinal / idx | id | 선언 G | data 정본 | 시작 G | 상태·지연 소비 G |
|---|---|---:|---|---|---|
| 0 / 0 | burst | 9821 | CH2 A 공통 | 37713–37713 | bossBurstWind 40562–40570 |
| 1 / 1 | fan | 9822 | CH2 A 공통 | 37714–37714 | bossFanWind 40646–40663 |
| 2 / 2 | charge | 9823 | CH2 A 공통 | 37715–37715 | bossChargeWind/Charge/Shock 40664–40689,40752–40759 |
| 3 / 3 | jump | 9824 | CH2 A 공통 | 37716–37719 | bossJumpWind/Jump/Shock 40690–40709,40752–40759 |
| 4 / 4 | laser | 9825 | A2 신규 | 37720–37721 | bossLaserWind/Laser 40710–40748 |
| 5 / 5 | shock | 9826 | CH2 A 공통 | 37722–37722 | bossShockWind/Shock 40749–40759 |
| 6 / 6 | summon | 9827 | CH2 A 공통 | 37723–37723 | bossSummonWind 40798–40815 |
| 8 / 8 | grab | 9829 | CH2 A 공통 | 37728–37729 | bossGrabWind/Grab 40837–40868; d>=120는charge |
| 9 / 9 | spin | 9830 | CH2 A 공통 | 37730–37730 | bossSpinWind/Spin 40869–40890 |
| 10 / 10 | mine | 9831 | CH2 A 공통 | 37731–37731 | bossMineWind 40891–40904 |
| 11 / 11 | vortex | 9832 | CH2 A 공통 | 37732–37732 | bossVortexWind/Vortex 40905–40941 |
| 12 / 12 | multiDash | 9833 | CH2 A 공통 | 37733–37733 | bossMultiDashWind/MultiDash 40942–40978 |
| 13 / 13 | slashCombo | 9834 | CH2 A 공통 | 37734–37734 | bossSlashWind/Slash 41074–41110 |
| 14 / 14 | slam | 9835 | CH2 A 공통 | 37735–37735 | bossSlamWind/Slam 41111–41143 |
| 15 / 15 | sweep | 9836 | CH2 A 공통 | 37736–37736 | bossSweepWind/Sweep 41144–41184 |
| 16 / 16 | teleStrike | 9837 | A2 신규 | 37738–37749 | bossTelePrep/Warn/Drop 40979–41046 |
| 18 / 17 | beanStorm | 9839 | CH2 A 공통 | 37755–37755 | bossBeanStormWind/Storm 41185–41206 |
| 19 / 18 | beanRain | 9840 | CH2 A 공통 | 37756–37756 | bossBeanRainWind/Rain 41207–41231 |
| 20 / 19 | fanWave | 9841 | CH2 A 공통 | 37757–37757 | bossFanWaveAim 40571–40606 |
| 22 / 21 | chaseAoe | 9843 | CH2 A 공통 | 37759–37768 | _chaseAoes 37015–37052 + charge/shock |
| 23 / 22 | elemBall | 9844 | CH2 A 공통 | 37769–37791 | 즉시 _spawnBossProjectile→16947–16996 |
| 26 / 25 | spiralBullet | 9847 | CH2 A 공통 | 37832–37845 | _spiralBullets 37057 |
| 27 / 26 | delaySlash | 9848 | A2 신규 | 37846–37853 | bossDelaySlashHold/Swing 41242–41268 |
| 28 / 27 | perilThrust | 9849 | A2 신규 | 37854–37859 | bossPerilWind/Thrust 41269–41285 |
| 35 / 34 | groundFissure | 9856 | CH2 A 공통 | 37931–37948 | _fissures 37067 |
| 36 / 35 | tideWave | 9857 | CH2 A 공통 | 37949–37963 | _tideWaves 37069 |
| 37 / 36 | seekerMines | 9858 | CH2 A 공통 | 37964–37978 | _seekerMines 37071 |
| 39 / 38 | gravityWell | 9860 | A2 신규 | 37992–38002 | _gravityWells 37075 |
| 45 / 44 | shieldBash2 | 9866 | CH2 A 공통 | 38048–38053 | bossSBashWind/SBash 41337–41351 |
| 50 / 49 | lavaPools | 9871 | CH2 A 공통 | 38085–38117 | _lavaPools 37129 |
| 51 / 50 | fireRain | 9872 | CH2 A 공통 | 38118–38133 | _fireRains 37131 |
| 52 / 51 | shockGrid | 9873 | CH2 A 공통 | 38134–38148 | _shockGrids 37133 |
| 53 / 52 | donutSlam | 9874 | CH2 A 공통 | 38149–38160 | _donutSlams 37135 |
| 54 / 53 | safeCorner | 9875 | A2 신규 | 38161–38177 | _safeCorners 37137 |
| 55 / 54 | crossWipe | 9876 | CH2 A 공통 | 38178–38191 | _crossWipes 37139 |
| 56 / 55 | tidalWipe | 9877 | A2 신규 | 38192–38211 | _tidalWipes 37141 |
| 57 / 56 | rapidMissile | 9878 | CH2 A 공통 | 38212–38234 | 즉시 _spawnBossProjectile→16947–16996 |

#### A2. CH2에 없는7기술의 11필드

| id | idx | tele | rec | feint | delay | range | phase | combo | tags | cd |
|---|---:|---:|---:|---|---:|---|---|---|---|---:|
| laser | 4 | 40 | 50 | false | 0.4 | [60,400] | [1,2,3,4] | [fan,vortex,charge] | [ranged,sustained] | 180 |
| teleStrike | 16 | 60 | 35 | true | 0.4 | [60,400] | [1,2,3,4] | [slashCombo,sweep,grab] | [gap-close,melee] | 160 |
| delaySlash | 26 | 20 | 60 | false | 0 | [30,120] | [0,1,2,3,4] | [swordWave,charge,sweep] | [melee,frontal] | 100 |
| perilThrust | 27 | 25 | 35 | false | 0 | [40,300] | [0,1,2,3,4] | [delaySlash,slashCombo,charge] | [melee,gap-close] | 120 |
| gravityWell | 38 | 25 | 35 | false | 0 | [0,999] | [2,3,4] | [spiralBullet,elemBall,charge] | [cc,zone,utility] | 200 |
| safeCorner | 53 | 60 | 60 | false | 0 | [0,999] | [2,3,4] | [charge,lavaPools,fireRain] | [zone,aoe,wipe] | 360 |
| tidalWipe | 55 | 60 | 50 | false | 0 | [0,999] | [2,3,4] | [charge,wallPush,fireRain] | [zone,aoe,cc] | 320 |

#### A3. 신규9state의 필드 접근 전수

범위는 위7 start case와9 state body만이다. 공통30/생성/HP0의 모든필드는 CH1/CH2/REVIVE의 각 필드 색인을 참조한다. literal에 생성되는 queue 필드는 §2.3에 전부 나열했다. 이28필드 표를 전체 game.html 모든적 필드의 전수라고 확대하지 않는다.

| e 필드 | 위 범위 내 G 행 |
|---|---|
| _bossPhase | 38195 |
| _dsMaxT | 37851 |
| _laserActLen | 40729 |
| _laserLockAng | 40716, 40722, 40724 |
| _laserSweepDir | 40716, 40724 |
| _laserSweepT | 40716, 40723–40724 |
| _teleDropY | 41001, 41017, 41022 |
| _teleOx | 37745, 40981 |
| _teleOy | 37745, 40981 |
| _telePrepMax | 37746, 40981, 40983 |
| _teleWarnX | 37744, 40981, 40997, 41002 |
| _teleWarnY | 37744, 40981, 40997, 41002 |
| _tpFlashT | 40999 |
| _weaponAng | 41249, 41254 |
| atk | 38172, 38205, 40736, 41034, 41036, 41262–41263, 41279, 41281 |
| col | 40718, 40746 |
| echDx | 41272, 41275 |
| echDy | 41272, 41275 |
| el | 38172, 38205, 40736, 41034, 41036, 41262–41263, 41279, 41281 |
| facing | 37720, 37848, 37856, 40980, 40998, 41034, 41245–41246, 41255, 41259, 41262, 41270, 41272, 41279 |
| laserAng | 37720, 40713–40714, 40716, 40722, 40724, 40726, 40740 |
| laserLen | 37720, 40717, 40727–40728 |
| r | 37743, 40985, 40990, 41023, 41256–41257, 41276–41277 |
| s | 37721, 37747, 37849, 37857, 38001, 38176, 38210, 40717, 40747, 41001, 41011, 41044, 41249, 41267, 41271, 41276, 41283–41284 |
| st2 | 37721, 37747, 37850–37851, 37857, 38001, 38176, 38210, 40715, 40717, 40747, 40981, 40983, 40988, 41001, 41009, 41011, 41020, 41044, 41247, 41249, 41253, 41267, 41271, 41276, 41283–41284 |
| stunned | 41034, 41262, 41279 |
| x | 37721, 37740, 37743, 37745, 37748, 37848, 37852, 37856, 37858, 37994–37995, 37997, 38000, 38175, 38208, 40712, 40718, 40728, 40731, 40736, 40746, 40980–40981, 40986, 40990, 40995, 40997–40999, 41008, 41012, 41019, 41026–41027, 41029–41030, 41032, 41034, 41244, 41256–41258, 41262, 41264, 41270, 41275–41277, 41279, 41282 |
| y | 37721, 37740, 37743, 37745, 37748, 37848, 37852, 37856, 37858, 37994–37995, 37997, 38000, 38175, 38208, 40712, 40718, 40728, 40731, 40736, 40746, 40980–40981, 40986, 40990, 40995, 40997–40999, 41008, 41012, 41019, 41026–41027, 41029–41030, 41032, 41034, 41244, 41256–41258, 41262, 41264, 41270, 41275–41277, 41279, 41282 |

### 부록 B. 44콤보의 전수 대응

동일 seq라도 다른 ordinal은 별도 추첨 후보다. 공통36은 CH2 부록B의 같은 ordinal/seq/phase/행 레코드를 참조한다. 그 전수 ordinal은 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 17, 18, 19, 20, 21, 23, 25, 26, 27, 28, 29, 39, 42, 43, 45, 51, 57, 58, 59, 60, 61, 62, 64, 66. CH2의47(wallPush)·48(poisonTrail)는 CH3에 없다. 나머지 신규8은 아래와 같다.

| ordinal | G 행 | seq | phase |
|---:|---:|---|---|
| 16 | 9898 | [summon,laser,vortex] | [2,3,4] |
| 22 | 9904 | [teleStrike,slashCombo,slam] | [1,2,3,4] |
| 24 | 9906 | [teleStrike,sweep] | [1,2,3,4] |
| 34 | 9916 | [delaySlash,perilThrust] | [0,1,2,3,4] |
| 44 | 9926 | [gravityWell,spiralBullet] | [2,3,4] |
| 63 | 9945 | [safeCorner,charge,multiDash] | [2,3,4] |
| 65 | 9947 | [tidalWipe,charge,slam] | [2,3,4] |
| 67 | 9949 | [fireRain,safeCorner] | [3,4] |

stage/phase별 **모든 seq가 Set 안이고 phase 일치인 후보 수**(정적 집합계산; 자연 AI 선택 횟수가 아님):

| si | phase0 | phase1 | phase2 | phase3 | phase4 |
|---:|---:|---:|---:|---:|---:|
| 10 | 15 | 27 | 35 | 38 | 38 |
| 11 | 15 | 29 | 37 | 40 | 40 |
| 12 | 16 | 30 | 40 | 43 | 43 |
| 13 | 16 | 30 | 41 | 44 | 44 |

공통 BOSS_PHASES5×8필드/hp구간·label은 CH1 부록A의 동일정본을 재사용한다. CH3 전용 HP phase표를 새로 만들지 않는다.

### 부록 C. 핵심 식별자의 파일 전체 행 색인

정확한 식별자 경계로 game.html과 index.html 전체를 검색했다. 이름의 substring 검색은 아래 별도4행이다. 함수명 선언뿐 아니라 호출·테스트베드·reset·렌더 참조도 모두 포함한다. 문자열·주석 일치가 실제 실행을 뜻하지 않는다.

| 식별자 | game.html 전체 행 | index.html 전체 행 |
|---|---|---|
| _bossScore | 37650, 38407 | — |
| _bossStartPattern | 17181, 37702, 38401, 38441, 64258 | — |
| _bossAI | 38373, 40450 | — |
| _bossPhaseCheck | 38236, 40447 | — |
| _bossIdleMove | 38315, 40450 | — |
| _spawnBossProjectile | 16940, 17157, 37095, 37779, 37802, 38221, 38297, 38368, 38995, 39021, 39081, 39090, 39170, 39250, 39544, 39659, 39778, 39804, 39823, 39918, 39997, 40064, 40148, 40187, 40192, 40409, 40567, 40656, 40660, 40878, 40898, 41179, 41199, 41221, 41238, 42142, 42600, 42806, 42819, 42839, 42853, 42862, 42875, 42921, 42949, 42952, 42955, 42958 | — |
| spawnProj | 16945, 16947, 20068, 20089, 20129, 20132, 20135, 20138, 20141, 20144, 20147, 37057, 37061, 46895, 61026, 61217, 61502, 61712, 64837, 64884 | — |
| _hurtProjectilePlayer | 16996, 34682, 34697, 34712, 34719, 34730, 34741, 34828, 34832, 34903, 34914, 34920, 34968, 34977, 35009, 35025, 35034, 35067, 35073, 35080, 35086, 35089 | — |
| _enemyHpPacing | 31119, 31143, 31147 | — |
| mkEn | 30184, 30782, 31120, 31375, 31384, 31431, 31437, 31443, 31450, 31476, 31497, 31512, 31523, 31601, 31620, 31635, 31647, 32133, 35675, 35707, 38780, 38796, 38845, 39040, 39244, 39414, 39487, 39630, 40012, 40105, 40244, 40415, 40789, 40807, 42611, 42795, 42830, 43052, 62289, 63428, 64753 | — |
| genBossArena | 30697, 30756 | — |
| _enterBossArena | 17084, 30749, 31544, 41789, 64209, 64289, 64764 | — |
| checkRooms | 35635, 41768, 43115 | — |
| _BOSS_MOVESET | 9960, 9962–9967, 9970–9975, 9978–9981, 9984–9990, 9993–9997, 10000–10005, 10009–10010, 37653, 38392, 38433, 64322, 64656 | — |
| BOSS_MOVES | 9820, 10009, 17181, 31176, 38259, 38377, 38391, 38406–38408, 38413, 60430, 60442, 60450, 64252, 64323–64324, 64558, 64584, 64591, 64657, 65662 | — |
| BOSS_COMBOS | 9881, 38434, 64525, 64527 | — |
| BOSS_PHASES | 9951, 37704, 37729, 37765, 38242, 38317, 38375, 60434 | — |
| _gravityWells | 30765, 31557, 37075, 37996–37997, 37999, 57950–57952, 60069, 63488, 64284 | — |
| _safeCorners | 30770, 31558, 37137, 38163, 38170, 38173, 57637–57639, 63489, 64286 | — |
| _tidalWipes | 30770, 31558, 37141, 38194, 38201, 38206, 57677–57679, 63489, 64286 | — |
| _laserLockAng | 40716, 40722, 40724 | — |
| _laserSweepDir | 40716, 40724 | — |
| _laserSweepT | 40716, 40723–40724 | — |
| _laserActLen | 40727–40729, 40733, 40745, 53159 | — |
| laserAng | 31180, 37720, 40713–40714, 40716, 40722, 40724, 40726, 40740, 41618, 41694, 52940, 52947, 52949, 52956–52957, 53147, 53158 | — |
| laserLen | 31180, 37720, 40717, 40727–40728, 41618, 41694, 53159 | — |
| _telePrepMax | 10947, 37746, 40981, 40983 | — |
| _teleWarnX | 37744, 40981, 40997, 41002 | — |
| _teleWarnY | 37744, 40981, 40997, 41002 | — |
| _teleOx | 37745, 37751, 40981, 41055 | — |
| _teleOy | 37745, 37751, 40981, 41055 | — |
| _teleDropY | 34454, 38632, 41001, 41017, 41022, 53540, 65642 | — |
| _tpFlashT | 20040, 38281, 38772, 40340, 40999 | — |
| _dsMaxT | 37851, 53371 | — |
| _weaponAng | 22838, 24382, 24466, 24537, 37734–37737, 37901, 41076, 41078, 41082, 41099, 41106, 41108, 41113, 41121, 41124, 41146, 41152, 41167, 41173, 41249, 41254, 41305, 41323, 53442 | — |
| echDx | 5409, 38802, 38917, 39004, 39066, 39100, 39137, 39146, 39274, 39362, 39382, 39494, 39574, 39671, 39837, 39939, 39955, 40030, 40522, 40524–40525, 40528, 40537, 40541, 40666, 40670, 40673, 40687, 40763, 40774, 40946, 40951, 40953, 40956, 40971, 41272, 41275, 52978, 53280, 53422–53423, 53425, 53937, 53941 | — |
| echDy | 5409, 38802, 38917, 39004, 39066, 39100, 39137, 39146, 39274, 39362, 39382, 39494, 39574, 39671, 39837, 39939, 39955, 40030, 40522, 40524–40525, 40528, 40537, 40541, 40666, 40670, 40674, 40687, 40763, 40774, 40946, 40951, 40954, 40956, 40971, 41272, 41275, 52978, 53280, 53422–53423, 53425, 53937, 53941 | — |
| _revPts | 17064, 17068, 31181, 34505, 34513, 34518, 34531, 42530–42531, 42537, 42541, 42543, 42562, 42647 | — |
| _maxRevPts | 31181, 34513, 34518, 42541, 42543, 42562 | — |
| _bossRevJudged | 17071, 34508, 42553, 42641–42642, 42734 | — |
| _bossRevived | 17071, 34529, 42649, 52736 | — |
| _reviveTimer | 17071, 17124, 34363, 34365, 34383, 34493–34494, 34498–34499, 34529, 35732, 35881, 41771, 41824, 42634, 42642, 52281, 52704, 52710, 52726, 62243 | — |
| _bossReviveVFXPending | 17074, 34448, 34524, 42584, 42621 | — |
| _spawnT | 5249, 17074, 17172, 31359, 34446, 34524, 42584, 52882, 65174, 65176 | — |
| boss_revive_boom | 19629, 34522, 42571, 42579 | — |
| _bossReviveGrandVFX | 34448, 41554 | — |
| _bossCine | 9164, 17087, 17125, 35827–35828, 35840, 55416, 55420–55421, 60869 | — |
| _B3_MODELS | 64947, 65096 | — |
| _B3_DEFAULT | 64967, 64983, 65096 | — |
| _b3animate | 65147–65148, 65229 | — |
| _bossSfx | 24764, 24818, 30812, 38308, 41808 | — |
| BGM_MAP | 10380–10381, 10397, 10399 | — |
| bossLaserWind | 23419, 23517, 37721, 40710, 52937, 53145, 64991 | — |
| bossLaser | 23428, 23507, 40717, 40720, 53156, 64995 | — |
| bossTelePrep | 10912, 10947, 10949, 23426, 23524, 37747, 40979, 53089 | — |
| bossTeleWarn | 10912, 23426, 23524, 41001, 41006, 53089 | — |
| bossTeleDrop | 23430, 23509, 41011, 41015, 53089 | — |
| bossDelaySlashHold | 23424, 23522, 37849, 41242, 53370, 64994 | — |
| bossDelaySlashSwing | 23432, 23511, 41249, 41252, 53390 | — |
| bossPerilWind | 23424, 23522, 37857, 41269, 53399, 64995 | — |
| bossPerilThrust | 23432, 23511, 41271, 41273, 53419 | — |
| 얼음 망령(이름 substring) | 9976, 16691 | — |
| 서리의 기사(이름 substring) | 16691 | — |
| 얼어붙은 감시자(이름 substring) | 16691 | — |
| 얼음 속 봉인 괴물(이름 substring) | 16691 | — |

### 부록 D. atlas_bosses.json의 CH3 등록

JSON을 Git blob에서 읽어 상태별 Array 길이를 셌다. 픽셀/모션을 렌더 검수한 수치가 아니다.

| key | idle | breath | walk | attack | rage_attack | windup | rage_windup | stagger | death | rage |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| boss_10 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 4 |
| boss_11 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 8 |
| boss_12 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 1 | 4 |
| boss_13 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 8 |

### 부록 E. 확인 기록·미확인

| 검사 | 근거·한계 |
|---|---|
| 원본 | 두 파일의 위 행수/SHA·main blob과 체크아웃 byte 일치. 원본 수정0 |
| 집합 | Node VM 정적선언:59move/68combo/5phase, CH3 Set32/34/36/37·union37·CH2공통30/신규7·combo44/공통36/신규8·maxidx56 대조 |
| HP | 원문 산술 구문6level×4stage의24표본·공통ATK 대조. 실제 mkEn actor 생성/전투가 아님 |
| 전수색인 | 37 start/state 대응·새7 literal·신규9state범위28필드·핵심61식별자와4이름의전체파일참조. 원문 기대값을Godot로생성하지않음 |
| docs | 보스8/부활3파일의관련절·CH1/원격CH2/REVIVE·작업판/기능목록을확인. 관련 tracked docs 전체검색77행은 docs-search.txt |
| Godot | 실행0/import0/신규테스트0. 모듈·테스트본문/guard를읽었을뿐,원격보고의PASS를이번검수로합산0 |
| 결손 | a3b spawn col고정·BC08 CH1 guard·16 start owner필요·actual boss_hurtE/array/executor/arena/HUD/음향등은§4/6. 코드수정0 |
| 미확인 | 실제full빌드도달·자연AI·피격/패링/부활·2D/3D우선순위의실화면·GLB동작·음악·PC/Mac동등성·실저장·성능·공용수정권한/실제diff줄수 |
| 후속 첫단위 | BC3-01 catalog+원본대조만. spawn색/BC08/main연결은통합결정전구현하지않음 |

정상 hook·자기 branch 비강제 push·원격SHA 확인 뒤 DONE.txt를 작성하고 자기 worktree를 제거한다. 최종 SHA/원격검증/정리 결과는 순환 참조를 피하려고 외부 DONE.txt/submission.json/cleanup-verification.json에 남긴다.
