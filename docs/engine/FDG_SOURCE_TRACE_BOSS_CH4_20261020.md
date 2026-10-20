# 4장 보스 원본 추적·작은 이식 단위 지시서 — 2026-10-20

## 0. 기준과 작업 경계

| 항목 | 확인 내용 |
|---|---|
| 작업 / branch | trace-boss-ch4 / codex/trace-boss-ch4-20261020 |
| 기준 | git fetch 후 최신 origin/main=6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d. 해당 main에서 --no-checkout worktree + non-cone sparse-checkout으로 필요한 원본·docs·기존 Godot 텍스트·훅 도구만 수신 |
| R | /Users/fordeargamers/Projects/exoduser-migration-20261001, HEAD dd49171c5b88e211575a41f185395d6c0a14b184, branch codex/mac-live-play-time-main-20261017. tracked INDEX/WORK 빈 상태 보존 |
| 원본 | game.html 65,692행, SHA256 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4. index.html 4,742행, SHA256 36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12 |
| 읽기 참조 | CH1 추적은 main. CH2 추적 ddf0549597e645b507cac672cba29df2639712c3, BC2-02 a3b5391c54bb62b9f784bf2acac12bfbd2747192, CH3 추적 7a3080a46863ac34f0a3e7864a003e5a7ff0f55c, BC3-01 차단 보고 56353bdb0d4f9306607e48ef7456a3b725535a37. 모두 이 main의 ancestor 아님. 병합·복사·그 끝에서의 분기0 |
| 변경 범위 | 이 문서 1개와 docs/CHANGELOG_SYNC.md 최상단 절만. 코드·테스트·기존 설계 원문·작업판·공용 Main/State/hurtE·저장 변경0 |
| 증거 수준 | **Godot 실행0/import0/테스트 실행0**, 게임·서버·브라우저·실창·실저장 접근0. Node VM에서 원문 정적 선언·HP 산술만 평가. 정적 확인을 실제 전투 PASS로 보고하지 않음 |
| 외부 기록 | ~/exoduser-wt/_out/trace-boss-ch4/. 자기 branch push·원격 SHA 일치·DONE.txt 후 자기 worktree 제거. 미확인을 추정으로 보충하지 않음 |

si는 전역 stage, hell은 0기준 장, phase는 HP 페이즈0~4, idx는 명시 기술ID, ordinal은 원본 배열 내 순서다. f는 원본 tick이며 벽시계 초로 환산하지 않는다. Math.floor·JS ~~(ToInt32)·binary64 곱셈을 구분한다. 아래 단위는 후속 지시서이며 이번 구현·자연 전투 검증이 아니다.

### 0.1 공통 정본과 읽기 순서

| 자료 | 재사용·경계 |
|---|---|
| [CH1 추적](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §1~7·부록 | HP/ATK·생성·score·selector·5phase·공통 전투 순서의 정본. CH4 이름으로 공통 계산을 복제하지 않음 |
| [CH2 추적 ddf05495](https://github.com/beearth/the-exoduser/blob/ddf0549597e645b507cac672cba29df2639712c3/docs/engine/FDG_SOURCE_TRACE_BOSS_CH2_20261020.md) §2~7 | 공유32기술·38콤보·poisonTrail/wallPush 소비 계약. 당시 결손과 이후 a3b의 일반화를 구분 |
| [CH3 추적 7a3080a4](https://github.com/beearth/the-exoduser/blob/7a3080a46863ac34f0a3e7864a003e5a7ff0f55c/docs/engine/FDG_SOURCE_TRACE_BOSS_CH3_20261020.md) §1~7 | 같은 형식·깊이. 공유37기술·44콤보·laser/tele/delay/peril·3queue 정본. 이번에는 원소·stage·신규6·재조합 콤보·idx60 차이만 추가 |
| [BC2-02 a3b5391c](https://github.com/beearth/the-exoduser/blob/a3b5391c54bb62b9f784bf2acac12bfbd2747192/docs/engine/orders/reports/bc2-02_REPORT.md) /[BC3-01 차단](https://github.com/beearth/the-exoduser/blob/56353bdb0d4f9306607e48ef7456a3b725535a37/docs/engine/orders/reports/bc3-01_REPORT.md) | chapter_catalog 명시 인자/context/token 재사용. **main에는 CH2 provider가 없고 BC3-01은 BLOCKED·미구현**. 설계 문서가 CH3 provider 구현을 대신하지 않음 |
| [REVIVE_SHIELD](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1.3 B01~B09·§1.5·§2~5 | HP0 즉시/180f 폴백·포인트·실드·최종 종료 기존 소유. 별도 CH4 부활 시스템을 만들지 않음 |
| [BOSS_BATTLE_SETTINGS](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md) 및 같은 폴더 나머지7문서 | 4장 요약·아레나·공통 전투·bossRec·미등록장 3D fallback 대조. CH1 흑요염과 4장 화염 악마를 같은 보스로 취급하지 않음 |
| [부활 설계](../2_5%20부활+에너지쉴드시스템/2_5%20부활+에너지쉴드시스템.md)·RESPAWN_RESOURCE_RESET·에너지쉴드_피해수치_표시 | 보스 HP0와 플레이어 재시작·실드 완충은 별개. Q/E·돌진·패링·방패·저장 보호 유지 |
| WORK_BOARD·FEATURE_INVENTORY·SAVE·SOUND | 병합 문구와 실제 main tree를 따로 확인. 35전투 슬롯·59기술 등록이 Godot actor·장보스 전투 완료라는 뜻은 아님 |

## 1. 데이터·생성·수치 전수 추적

### 1.1 일곱 슬롯의 최종 Set과 신원

| si / 장내 위치 | STG.bn | 기술 수 | 앞 슬롯 대비 추가 | 초기 부활력 | isHellBoss |
|---|---|---:|---|---:|---|
| 14 / 4-1 | 화염 악마 | 39 | 기본39, 아래 목록 | 282 | false |
| 15 / 4-2 | 불기둥 수호자 | 40 | swordWave | 288 | false |
| 16 / 4-3 | 용암의 심장 | 41 | pillars | 294 | false |
| 17 / 4-4 | 화염 전사 | 42 | burstCounter | 300 | false |
| 18 / 4-5 | 화염 쌍두 | 43 | wallPush | 306 | false |
| 19 / 4-6 | 불벌레 군주 | 44 | gravityWell | 312 | false |
| 20 / 4-7 | 화염 감옥지기 | 45 | chainLightning | 318 | true |

근거 G9982–9990/10009–10010/16633–16712/30782/31181. hell3/startSi14/stages7, chapter3/hellFloor0~6/monLv400. 모두 etype0/ib=true/el=EL.F=1, body col=ELC[1]=#ff5522(G14333–14342/31163). FLAME OF AGONY/화염지대, w#3e1c22/f#180a0c/ac#ff8844. STG.monLv400은 표시 메타데이터이며 실제 생성 level 고정값이 아니다. 일곱 이름으로 일곱 독립 AI/etype/3D 모델이 확인된 것은 아니다.

기본39의 **최종 Set 삽입 순서**(G9983–9984, 마지막 cage 삭제 적용):

slashCombo, slam, sweep, charge, jump, burst, shock, fan, spin, grab, multiDash, summon, mine, vortex, chaseAoe, elemBall, beanStorm, beanRain, fanWave, laser, tideWave, groundFissure, seekerMines, shieldBash2, teleStrike, delaySlash, perilThrust, meteor, radialLaser, spiralBullet, poisonTrail, lavaPools, fireRain, shockGrid, donutSlam, crossWipe, safeCorner, tidalWipe, rapidMissile.

- si15부터 swordWave,16 pillars,17 burstCounter,18 wallPush,19 gravityWell,20 chainLightning을 위 순서 뒤 누적한다. wallPush·gravityWell은 앞 장의 기존 기술을 이 장 후반에 다시 해금하는 것이다. 기본39에 신규6이 전부 들어가는 것이 아니다.
- 최종 union45=CH1~3 기존39+신규6. CH3 union37은 전부 포함되며 CH2의 poisonTrail/wallPush를 더해 공유39다. CH1 union24 중 공통22, tailSwipe·burrowStrike는 CH4에 없다. CH2 union32는 전부 포함된다(G9963–9990).
- 처음 _ch4Base의 cageTrap은 마지막 전역삭제(G10009–10010)로 일곱 Set에서 전부 빠진다. score=-1(G37651), 강제 시작은 recover25(G38020–38023)뿐이다.
- 전역59기술/68콤보/5phase 유지. CH4 유효 콤보 union54=이전 CH2·CH3 제공46+처음 유효해지는8. CH3 44+CH2 전용 ordinal47·48을 읽기 재사용한다. 신규8 중 ordinal56=[wallPush,gravityWell]은 **새 기술 없이 처음 성립하는 조합**이다(부록B).
- _DEMO_MODE 기본 fallback demo와 _DEMO_LAST_STAGE=0(G16644–16648) 아래 등록만으로 CH4 정상 도달을 주장하지 않는다. full 빌드/자연 stage 진행은 이번 **미확인**. _DUNGEON_SPEC[16].ready=false(G16672)도 보스 arena 활성화 검증과 별개다.
- _isNormalDruidBoss는 si0/3, _isDruidFinale는 stage3 조건(G16938/17054–17055)이라 CH4에서 false. CH1 흑요염·드루이드의 독탄·독늪3점·피날레 HP/저항 부활을 이식하지 않는다.

### 1.2 생성·아레나·원소의 CH4 적용

| G 행 | 읽거나 적용할 것 | 보존·참조 |
|---|---|---|
| 9820–9880 /9881–9950 /9951–9957 | 59move/68combo/5phase | 공통 manifest는 CH1, 공유 literal은 CH2/CH3 정본. CH4 모든45개 start/state 대응은 부록A |
| 9982–9990 /10009–10010 | CH4 7Set·cage 삭제 | 위 기본39 뒤 stage별 append. Set 순서를 AI globalordinal 평가 순서와 바꾸지 않음 |
| 9272–9278 /31119–31152 | 실제 level/난도/HP/ATK | CH1 공통식·BC02 재사용. 별도 FINALBOSS15/5 dead상수(G14355–14356)를 si20에 곱하지 않음 |
| 30697–30747 | arena hell3→type3 **팔각형** | mw128/mh108,T40,cx64/cy54,il2/it2/ir126/ib106,hw62/hh52/cut19. 바닥조건 dx<=62,dy<=52,dx+dy<=95. entry(64,103),boss(64,54)→(2580,2180),exit(64,1). arena 기둥 없음과 공격 _pillars는 별개 |
| 30749–30814 /31540–31541 | 진입·bosstest | 백업/맵/ens/projs/G reset→STG.be를 mkEn에 전달→boss flags/봉인연출. retry와 일반진입·테스트베드 구분. 보스 남쪽3T/player·cam−2T |
| 31120–31140 | spawn gate/몸 | finite/canMv/safePt gate,실패null. ib의r44,speed/baseSpd .5,elite0/mods[]/배율1. 외형 이름으로 추가 스케일/방어를 추정하지 않음 |
| 31162–31185 /31260/31300 | 초기 packet | HP=mhp=poise=maxPoise=eShield=eShieldMax=H,ATK=baseAtk=A,phase0/CD59칸0. BC02 six-draw 계약·호출 순서 유지. dropTier=min(hell+1,4)=4,초기 revPts는 위7값 |
| 31359–31363 /23149–23152 | skin/body | _assignMobSkin 공통 생산자, _assignBossSkin no-op·atlas 소비 별도. 수치 packet과 실제 actor 채택을 구분 |
| 20122–20155 /40507–40517 | generic 자동탄 | fire profile의 fireMagic/EL.F/raw~~atk1.2/속도3.2/_commit. 보스 몸체 색과 일반탄·광역 원소/패링 분류는 각각 원문을 따름 |

공통식은 CH1 §1.2 참조. L=max(1,(P.lv\|\|1)+(DIFF_LV_OFF[OPT.diff]\|\|0)+(G._stageDiffOff\|\|0)), dm=DIFF_MUL[OPT.diff]\|\|1. C=(L<=500?.4L³+199L+100:5e7*1.0014^(L−500))*2.925, pacing=1/(1+min(9,max(0,L−1))/18). H=floor(floor(C*pacing*24*dm)*(1+si*.02)), A=floor((75+L*2.9)*.6*dm). ib의 et 배율1. 이 수식 참조는 독립 CH4 코드 복제 허가가 아니다.

아래는 G31119/31145–31147/31151–31152 원문을 별도 VM에서 평가한 dm1/et 배율1의 **정적 표본**이다. 실제 actor 생성이 아니다.

| L | H si14 | si15 | si16 | si17 | si18 | si19 | si20 | A |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 26,901 | 27,322 | 27,742 | 28,162 | 28,583 | 29,003 | 29,423 | 46 |
| 10 | 149,160 | 151,491 | 153,822 | 156,152 | 158,483 | 160,814 | 163,144 | 62 |
| 100 | 25,159,680 | 25,552,800 | 25,945,920 | 26,339,040 | 26,732,159 | 27,125,279 | 27,518,400 | 219 |
| 400 | 1,538,316,748 | 1,562,352,948 | 1,586,389,147 | 1,610,425,346 | 1,634,461,545 | 1,658,497,744 | 1,682,533,944 | 741 |
| 500 | 3,001,166,438 | 3,048,059,664 | 3,094,952,889 | 3,141,846,115 | 3,188,739,340 | 3,235,632,566 | 3,282,525,792 | 915 |
| 501 | 2,999,393,280 | 3,046,258,800 | 3,093,124,320 | 3,139,989,840 | 3,186,855,359 | 3,233,720,879 | 3,280,586,400 | 916 |

원문의 곱셈 순서·binary64를 보존한다. 예: L100/si18=26,732,159이며 십진수 대수 정리로 1을 더하지 않는다. L500→501 불연속·2^31 초과 HP도 임의 보정하지 않는다. 생성 floor와 phase/부활의 ~~는 다른 계약이다.

## 2. 패턴·콤보·phase·연출·부활 추적

### 2.1 공통 시계와 CH4 차이

| G 행 | 단계 | CH4 적용·기존 정본 |
|---|---|---|
| 38584–38705 /38771/38874–38884 /40444–40454 | updateE 상위 gate→시계→dispatch | 레슨·벽·KB·피격/스턴/빙결 return 뒤 ATK재계산/탄차징/st2감산/phase/idle AI/feint/동일tick switch. 각 모듈에서 sp나CD를 중복 감산하지 않음 |
| 37650–37699 /38373–38441 | score/selector | CH1 BC03/04 공통계산·globalordinal·top6가중·조건부draw·history5·콤보 필터 재사용. si2 얼굴가점/si0·3 streak배율 false. idx60 특이점은 §2.2 |
| 38235–38314 | phase | hp/mhp>.8/.6/.4/.2의 strict 비교, 최고해당phase로 한 번 상승. HP=max(current,~~(mhp*상한)),iframe90,speed cap1.8+phase*.1,maxPoise~~×1.2/현재유지,patCd floor20. recover45/patT10/combo reset/**CD0..58만0**. 텔포→충격파→탄→VFX 순서. 즉시 ATK~~×1.3을 영구 baseAtk 강화로 바꾸지 않음 |
| 38315–38372 /40483–40517 | idle/generic | orbit/flow/auto탄/generic idle×1.6·접촉·차징 경로. 4장 화염이라는 이름으로 새 추적 AI·모든 공격 화염화를 추가하지 않음 |
| 37701–37710 /41375–41383 | start/recovery | tele=~~(mv.tele*teleM)+extraDelay. si2×1.4/드루이드최소전조 false. metadata.tele/rec와 case 고정시간/일반recover20 clamp/**bossRec**를 구분 |
| 37832–37845 /37057 | spiralBullet 원소 차이 | CH2 물리60/240/60과 달리 CH4는 비물리 windup0/maxT180/nextShot0. CH3와 같은 계약, EL.F/색·raw는 원문을 따름 |
| 40798–40815 /40869–40890 /41111–41143 | stage 산술 | summon=3+~~(si*.5)→[10,10,11,11,12,12,13]. spin R500+si15→710..800,slam phase0 R1000+si30→1420..1600,laser len1400+si60→2240..2600. 소환 type[0,2,3,3,3]·배열등록은 공통 owner |
| 37720–37721/40710–40748 /37738–37749/40979–41046 /37846–37859/41242–41285 | CH3 공유4계열9state | laser HP1%/magic,tele착지focus/pStun,bossRec35,delay랜덤30..119,perilcharge 접촉recover40 등 CH3 §2.2 그대로. stage 길이만 원식 적용 |
| 37992–38018 /38161–38211 /37075/37077/37137/37141 | CH3·CH2 공유큐 | safe/tidal 기본부터,wallPush si18+,gravityWell si19+. wall에는charge 제외 gate가 없고gravity에는피해·el이 없음. CH3 safeCorner/fullR·tidal1hit와 CH2 wall/poison 계약을 서로 통일하지 않음 |

### 2.2 idx60·콤보의 원본 특이점

| 원본 G 행 | 정적 확인 | 이식 경계 |
|---|---|---|
| 9852 /9864 /31176 | **burstCounter idx60/ordinal31**, chainLightning idx42/ordinal43. 최초 _moveCDs는길이59·0..58 | idx와ordinal 재번호부여0. idx59 기술은 manifest에 없으며 idx60은 CH4 si17부터 활성 |
| 37654 /38393 | 미존재 arr[60]은undefined: >0은false, <=0도false | 최초 score 후보는 가능,미존재 CD를0으로정규화하면 콤보검사 의미가 바뀜. 현재54콤보에 burstCounter는없지만 공통계약 보존 |
| 38429 /38377 /38259 | 최초 선택시 arr[60]=cd*cdM으로길이61로늘어남/59hole. 감산·phase reset은BOSS_MOVES.length=59까지만 | 양수idx60이남아 이후score0. phase전환도이를지우지않는 정적경로. fresh actor·강제 시작과구분;정상전투빈도는미확인. resize61로시작하거나모든칸감산하는‘정리’금지 |
| 9881–9950 /38431–38434 | combo의phase+모든seq가현재Set에있고첫id가선택된기술인후보에서추첨 | 부록B 후보수는앞의두필터만센상한;move.phase/CD/score/top6/첫id/RNG를통과한실제발동횟수가아님 |
| 9938 | [wallPush,gravityWell],phase[3,4]는둘다기존기술이지만같은CH2/CH3 Set에서만난적없음 | si19부터첫유효. CH2·CH3 **합집합된ID만**보고‘기존47콤보제공’이라하면provider에없는1개를누락함. 공유46+신규8로설계 |

이것은 원본 결함·특이 동작 관측이며 수정 승인이 아니다. a3b5391c BC03:40–43/BC04:40–43,191–193은 이미 hole/범위밖 CD·59한정 감산을 고려한다. CH4 별도 선택기·CD보정기를 만들지 않고 그 정본을 재사용하며 후속 fixture로 확인한다.

### 2.3 신규 meteor·radialLaser·burstCounter — 4state와 피격 접점

보호 Q/E·패링·hurtE/hurtP는 관측·의존 표기만 한다. 독립 계산 모듈은 command/실owner ack/readback을 사용한다. 합성 ack를 실제 피해/패링 성공으로 세지 않는다.

| 계열 / 시작→소비 G | 정확 시작·분기·종료 |
|---|---|
| meteor /37724–37727→40816–40836 | mc=~~((6+~~(G.stage*.8))*(1+(phase−1)*.3)). 맵W=(G.mw\|\|50)*T,H=(G.mh\|\|42)*T,중심±(U−.5)*폭*.65에mc개,x/y2draw씩,{x,y,t:50}. **canMv/벽보정 없음**. Wind=tele\|\|50 중 보스는P반대방향 speed*.5*sp,XY실패→X→Y fallback. 끝 Meteor20,그끝에모든mt동시착탄. strict거리<45/**Pr미포함**/iframe<=0/notcharge 후 패링은행~~atk1.5·체간20 또는피해~~atk1.5*elMul/KB8. 각mt입자15/VFX90/768/2f/shake대입6,전체끝groggy/배열[]/recover60. mt.t는상태에서감산·개별착탄시계로소비하지않음 |
| radialLaser /37758→40607–40645 | metadata tele35지만시작 **Aim60**,R500 고정. _rlWave는시작에무조건0대입하지않고 Aim의if(!wave)만0. st2<=0마다36줄기각2π*i/36+wave*π/36,벽을6px씩검사→길이절단. 0<dot<len/perp<Pr+8/iframe<=0/notcharge 후 원패링×3/스턴60/체간20 또는 ~~(~~atk3*elMul)/KB10. 한줄기마다실제피해readback·iframe갱신을순서대로반영. 발사SFX/셰이크6/HitStop~~8/slow<=0이면15, Fx{t0,max25,r500,cnt36,off},입자40×3draw. wave++<2면Aim48(5도회전),아니면wave0/bossRec50/beamStop. 첫발·2차발을동일tick두번발사하지않음 |
| burstCounter /37890–37895→41286–41301,피격42115–42133 | Counter60/_bcActive=true/chargeSFX. **timeout**:active=false,strict거리<100/iframe<=0/notcharge에~~atk2*elMul/KB12;패링분기없음,입자16/폭발음/shake14/recover35. **hurtE 내부**:reviveIframes비DOTreturn(42120–42121)뒤ib/active/state조건에서~~atk1.5*elMul→문자/shake12/flash.25/P.iframes=15→return. 이분기에는거리·charge·isDot제외·isPWin검사가없고active해제/상태종료/적HP차감도없음. hurtP자체의보호판정은기존owner권위. mirrorGuard처럼1회반격후종료로바꾸지않음 |

meteor 개수는 원문 산술의 stage×phase 정적 값이다. phase0은 metadata.phase 밖이라 자연선택 불가지만 직접 강제 시작 경계 표본으로 보존한다.

| si | phase0(강제) | phase1 | phase2 | phase3 | phase4 |
|---:|---:|---:|---:|---:|---:|
| 14 | 11 | 17 | 22 | 27 | 32 |
| 15 | 12 | 18 | 23 | 28 | 34 |
| 16 | 12 | 18 | 23 | 28 | 34 |
| 17 | 13 | 19 | 24 | 30 | 36 |
| 18 | 14 | 20 | 26 | 32 | 38 |
| 19 | 14 | 21 | 27 | 33 | 39 |
| 20 | 15 | 22 | 28 | 35 | 41 |

### 2.4 신규 swordWave·pillars·chainLightning — 탄 요청·2queue

| id / 생산→소비 G | 생성·시계·조건·종료 |
|---|---|
| swordWave /37792–37813→16940–16996/탄공통업데이트/54218–54225 | facing=P각,raw~~atk2.5,속도4.5,발수phase0..4=[5,7,10,12,12],fan폭π*(.4+phase*.05)→[72,81,90,99,108]도. 각순서정규분할·입구28,life/ml300,col#cc1100,sz1.5,redBean=true/swordWave=true/homing=true/_swAng. _spawnBossProjectile로요청→공통density/원소/분류/반사owner. 별도검기state/metadata전조대기없음. slashSFX/parts12/shake10/recover25. 모든탄을redBean한분류로고정해후처리생략금지 |
| pillars /37860–37877→37059 | 개수8+phase*4=[8,12,16,20,24]. 맵중심±폭*.65에x/y2draw,delay40+~~(U20)→40..59,r275+U100→[275,375),**1개당4draw**. {x,y,t0,delay,maxT240,r,dmg~~atk1.5,el=e.el,hitfalse},src없음. SFX/shake15/문자/recover40. t+=sp;!hit && t>=delay && t<delay+sp+2이면먼저hit=true,거리<r+Pr/iframe<=0/notcharge에피해;폭발음/입자8. 같은tick에별도지속조건 t>delay && t<210 && ~~t%30<sp도검사,~~(pl.dmg*.3*elMul). tick누적형으로바꾸지않음. 생존t<240,안정압축/배열identity유지. 설치좌표canMv없음,기둥collision생성아님 |
| chainLightning /38024–38036→37145 | 초기P방향,a0;D=min(dist,400),4점 frac1/4..1,각x/y에(U−.5)*60→총8draw. pts각hitfalse,queue{pts,t0,maxT50,r175,dmg~~atk1.1,**el4**,src:e,idx0,jumpT0}. 본체EL.F여도이큐는EL.L. magic4SFX/recover25. t+=sp/jumpT+=sp;>=10 && idx<4에서**최대1점만**검사. !hit/거리<175/iframe<=0에hit=true후원패링(doParry/체간15)또는피해/SFX/shake6. charge제외gate없음. 빗나가도jumpT=0/idx++이며재시도없음,while catchup·잔여시간보존없음. 제거는 idx>=4 && t>=50의AND;sp10이라면40에도남고50제거,작은sp로50이돼도점미완료면존속 |

2queue는 actor recover·사망과 별도로 G측에서 진행한다. _pillars는 G의 공통 배열이다. G57738에 _pillarSpike 시각 분기가 있지만, 원본 전체 검색에서 이 배열의 push는 G37870 보스 case뿐이다. 플레이어 기둥은 _dpQueue/_fireZones(G36468/46282–46300)이며 같은 배열 사용이라고 추정하지 않는다. CH4 독립 모듈이 G의 reset/전체삭제 권위를 새로 소유하지 않는다. 초기화는 G30763/30770/31555/31558/63486/63489/64282/64285. _bcActive를아레나reset으로직접고치는것도이번범위밖이다.

### 2.5 HP0·부활·최종 종료

정본은 REVIVE_SHIELD §1.3 B01~B09·CH2 §2.5·CH3 §2.4. CH4는 hell3이므로 H7/드루이드 피날레 예외 false. _maxGuar=4(G42519)는 선언만 있고 보장회수 판정에 쓰이지 않는다. ‘4장=정확4회 부활’을 신설하지 않는다.

| G 행 | CH4 적용·의존 |
|---|---|
| 42515–42538 | deaths++→신성력·holyPrison 억제→**판정 전 cost차감**. points[282,288,294,300,306,312,318]. chance=max(0,2+si*.05−(deaths−1)*.15−sup),첫사망/sup0은[2.70,2.75,2.80,2.85,2.90,2.95,3.00]. 상한1clamp 없음 |
| 42547–42622 | 즉시성공HP100%/실드0/phase0,iframe90,maxPoise~~×1.5/현재25%,ATK~~×1.5,speed cap1.6,patCd floor60. 이전r기준포탈5f→뒤텔포→spawn55/pending40. 기존body·실제배열·부활owner순서유지 |
| 42640–42649 /34493–34535 | 실패시timer180,사망순간chance=max(0,1.5+si*.05−deaths*.25−sup)/roll저장. 첫사망/sup0은[1.95,2.00,2.05,2.10,2.15,2.20,2.25]. 종료시저장값비교,성공후기본10차감/HP~~(mhp*.5)/실드0,실패최종사망. timeout에서현재sup재평가아님 |
| 41816–41845 /41980–42009 | checkRooms30호출단위gate에서alive뿐아니라_reviveTimer>0도생존취급. 최종사망후상자·3폭출구/장완료. si20은hellCleared[3]·다음장버튼. HP0만으로미리문열기금지 |
| 42598–42612 | 동반부활: G._killedBosses의etype pool과현재etype0제외. 7개의이름을저장된7개etype로바꾸거나소환확정으로계산하지않음 |

phase 상한 회복/‘HP +30%’ 텍스트와 HP0 부활은 별개다. 저장 형식·revive 확률·반사/피해·패링 입력 owner에 대한 변경은 **HOLD**다.

### 2.6 몸체·전조·HUD·사운드·index.html

| G 행 / 파일 | CH4 경로·한계 |
|---|---|
| 10982–11014 /23499–23540 /53554–53584 | atlas_bosses.json의boss_14..20·공통anim fallback/250ms·r기준scale. 7개key의상태배열은부록D,픽셀/애니메이션완성검수아님 |
| 53033–53077 /53211–53220 | radial 전조·Fx벽샘플40px vs피해6px,전조분모60(2차48과다름),Fx.t는 renderer _dtSp로 진행/25·3겹빛. meteor원20+p25,wind분모50 vs실tele·Meteor20. 그린선/원반경을실제피해gate로대입하지않음 |
| 53428–53438 /53987 | counter60진행원·‘반격대기’표시. 본체상태/active와실제hurtE반격둘다owner없으면시각만으로연결완료아님 |
| 57735–57759 /58040–58059 /54218–54225 | pillars전조경계선제거·지속기둥,chain지그재그/렌더RNG,비physical검기의작은원표시. raw빨간요청색과렌더ELC를동일하게만들지않음 |
| 26486–26501 /53614이후 | hell3적갈바닥/룬·phase aura·체간·spawn 공통. CH1 흑요염 에셋을4장전용으로채택한근거없음 |
| 64947–64982 /65093이후 /65148–65192 | _B3_MODELS는hell0만. hell3은**_B3_DEFAULT Meshy_AI_1**13state/5GLB fallback. ready3D활성시_spawnT=999 등2D억제. 7독립화염모델의native채택/실화면은미확인 |
| 24758–24764 /30812 /38308 /41808 | _BOSS_SFX는si0~3만,CH4는null→공통howl/hit/death fallback. 전용7voicepack근거없음 |
| 2701 /35827–35885 /55415–55424 | STG.bn·부활suffix/intro90·시네마180·poise·**bossShieldF폭0**. eShield=HP와파란bossbar실표시를구분 |
| 10381–10389 /35867–35885 | BGM_MAP[3] h3파일등록과실bKey분리. si14~19 boss,si20 finalboss분기. 실제믹서·크로스페이드SOUND owner재사용 |
| index.html 1–4742 | 부록C의55핵심식별자/일곱이름직접일치0. 로비에동일전투로직이있다는근거없음. 동적외부코드/네트워크의절대부재로확대하지않음 |

atlas PNG blob4546568b3c877d0c76f8006dcb9673a89fa072ba,JSON blob3f2591aef1ae542321ab5e335b2f3b6cc7586d5a. Git blob ID는 SHA256이 아니다. 바이너리 복사·이미지/GLB 열기·실창 검수0.

## 3. docs/8.1보스디자인바이블 대조·불일치 표

지정 폴더8문서와 부활3문서의 관련절, CH1~3/REVIVE 정본을 대조했다. 이 범위에서 CH4 일곱 이름별 독립 전투 지시서는 미발견이다. 원문 문서를 고치지 않고 차이를 이 표로 남긴다.

| ID | docs·행 | 원본 근거 / 판정·후속 지침 |
|---|---|---|
| C401 | BOSS_BATTLE_SETTINGS:230의4장 +6기술 | G9983–9990. **ID목록일치**,stage조건생략:meteor/radial은14부터,sword15/pillars16/counter17/chain20. wall18/gravity19재해금도명시필요. 7보스전원45개로구현금지 |
| C402 | 같은220/233/235의‘49종/null’·237–257옛cage타보스허용 | G9820–9880/10009–10010. 실제59·Set형태·CH4최종39..45·cage전체제외. CH1 D03/D04·CH3 C303과같은공통이력차이 |
| C403 | 같은193/197의ATK강화·빨콩50%+무지개50% | G38771 baseAtk재계산/G38295–38297일반HSL탄·blackBean없음. CH1 D09/D18·CH3 C305참조. 색을Q전용무지개분류로변경금지 |
| C404 | 같은101–111의HP/ATK감사정정 | G31119/31145–31152와수식일치,296xx행은현재311xx. si20에도FINAL15/5별도배율없음. BigHP/이중floor/binary64유지 |
| C405 | 같은65의hell3팔각형 | G30697–30747과**일치**. arena의‘기둥없음’은공격_pillars금지나collision기둥생성지시가아님 |
| C406 | 같은551/555의radial2차뒤bossRec50 | G40639–40643/41375–41377과**일치**. 일반recover20clamp로바꾸면후딜손실. 전조metadata35와실제60/48차이는별도원문 |
| C407 | 같은297–327의미등록장3D fallback | G64947–64982/65096과**일치**. CH1 Vinebound hit규칙·전용scale를hell3에이식하거나일곱모델완료로보고금지 |
| C408 | BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER:12–28/81–89 | 문서자체가si0의옛흑요염이고9행에서현배정제외. G16692의화염악마·EL.F와이름/원소유사만으로동일actor/PNG/SFX채택금지. CH4대응은미확인 |
| C409 | 부활설계30/34–42/49의불사·속도/반경·포탈3f요약 | G42515–42649/34493–34535. 선차감·실패/폴백·최종사망·minr10/cap1.6/floor60·포탈5f. REVIVE X07~X10·CH3 C308참조. _maxGuar4를보장4회정책으로만들지않음 |
| C410 | 부활설계235의boss바와실드동일표시 | G35843 bossShieldF0. REVIVE X15·CH3 C309와동일;CH4별도파란bar를임의추가하지않음 |
| C411 | CH4 기술상세/콤보54·idx60 설명 공백 | G9852/31176/38377/38429. burstCounter60은59CD배열밖·선택후미감산. 배열전체순회로보정하지않음. G9938기존wall+gravity신규조합을누락하지않음 |
| C412 | meteor/radial/pillars/chain/burstCounter 상세판정공백 | G37724–38036/37059/37145/40607–40645/40816–40836/41286–41301/42130–42133. meteorPr미포함/6vs40샘플/기둥2조건/chain의 charge gate 부재/반격 후 활성 유지를‘정상적’기대값으로재설계금지 |

## 4. Godot 의존과 빠진 것

### 4.1 main·미병합 참조·미구현을 구분

| 위치 / 버전 | 정적 확인 | CH4 재사용·결손 |
|---|---|---|
| main native_ch1_boss_catalog.gd:160–207 | CH1 stage0~3/union24/global59manifest·5phase | CH4공통22는읽을수있지만45전체getter아님. CH2/3provider부재를globalmanifest로대체불가 |
| main spawn_contract.gd:33 /utility.gd:21 | BC02/03 CH1판,chapter인자없음 | CH4 wrapper즉시연결불가. 공통식재작성아닌일반화판정식인수필요 |
| main CH2 catalog/bridge·CH3 catalog·context·selector/phase/start/melee/movement | Git tree에**파일없음** | WORK_BOARD:73–76의BC04~07병합문구와실제tree차이. sparse누락아닌git object검사. 코드이송·합병0 |
| 원격a3b BC2-01 catalog/BC2-02 bridge/context | CH2공유32·38콤보/manifest결합·provider5method/hash/global59/68검사 | CH4는CH2중poison/wall2개와콤보47/48재사용. a3b는main미인수,BC3-01도같은이유로BLOCKED |
| CH3 7a3080a4 /BC3-01 56353bdb | 전자는설계문서,후자는차단보고만 | **실제CH3provider없음**. CH4공유37·44콤보읽기재사용은BC3-01정식구현/인수후가능. 문서에서코드가있다고가정금지 |
| a3b context:6–40 /BC02~07 공개API | 마지막chapter_catalog명시인자/nullCH1기본/token provider·path·hash연결 | 장계산·continuation재사용. CH2 reuse:53–55는providerCH2/si4..9제한이라CH4 façade로호출하지않음 |
| **a3b BC02:110** | element_id는provider,body col은 #bbbbbb 고정 | G14338/31163의CH4 #ff5522와차이. 공통spawn owner가색상reader/metadata계약을정식인수해야함. 사후packet덮어쓰기·생성식복제로우회금지 |
| a3b BC03:40–43 /BC04:40–43,191–193 | 원문idx60 hole·59한정CD처리를고려 | §2.2를이모듈로재사용. 정확CH4fixture실행은미확인,독립CH4selector신설0 |
| a3b BC06:47–48 | CH1union밖명시provider기술은pattern_start_owner_required | CH4공유시작22만후보,CH2고유10+CH3고유7+CH4신규6=23개는이판본미지원. CH2/3후속모듈인수SHA는미확인 |
| 원격BC08 1b901f12 movement_states.gd:17–35 | begin/next si0..3 guard,chapter인자없음 | CH4charge/jump/multiDash/idle도기존owner일반화필요. wrapper에서si위장/계산복제금지 |
| main enemy.gd:484(receive_native_e_wave) /native_normal_enemy_hurte.gd:151 | boss_hurtE_not_adopted/unported_branch_active:boss_hurtE | counter피격/HP0/실부활모두정식owner없음. 일반 적 위장·ib거부삭제·HOLD파일수정금지 |
| main factory/World/State/Main/init_stage producer:422 | 한정일반actor·G/P reader·일반시계·stage의unowned_boss_branch | arena팔각/맵epoch/실actor배열/2queue·stateexecutor/실contact·HUD·음향·최종문등미연결. fieldboss_combat=false와장보스는다른기능 |

원격 PASS 수치를 이번 검수로 합산하지 않는다. BC02색·BC08guard·실제hurtE/큐권위는 별도 통합 사안이다. 첫 catalog도 CH2·CH3 읽기 provider 인수 없이는 착수할 수 없다.

## 5. 작은 이식 단위 순서안

### 5.1 1번 BC4-01 — 4장 읽기 전용 catalog 구현 지시서

**현재 착수 상태: BLOCKED.** BC3-01(56353bdb)이 미구현이고 CH2 catalog·bridge도 main에 없다. 아래는 의존 해소 후 별도 배정에서 사용할 구현 지시서다. main 기준 불가능하면 이유를 보고하고 멈춘다. 미병합 끝 분기·merge/cherry-pick·소스복사·대체provider·빈stub로 우회하지 않는다.

| 항목 | 후속 구현 지시 |
|---|---|
| 목표 / 끝조건 | 7슬롯, Set39..45, union45, 유효 combo54, 공통5phase를 읽기 전용으로 제공. actor·실제 RNG·시계·G·입력·피해·저장·화면 연결0, 공용0줄 |
| 기준·필수 의존 | 새 fetch의 최신 main 기준. CH2catalog/bridge는참조a3b5391c(BC2-01포함)의**정식main인수**가필요. CH3 catalog는 BC3-01의 정식 구현·main 인수 SHA가 필요(현재 없음). API/hash/manifest를 실물 확인. CH3 지시 문서7a3080a4는 구현 의존 SHA가 아님 |
| 자기파일 | 신규 godot/scripts/native_ch4_boss_catalog.gd,신규 godot/tests/test_boss_ch4_bc4_01_catalog.gd,필요시자기원본oracle/UID·작업REPORT·허용CHANGELOG만. CH1~3모듈/Main/State/hurtE/저장등0줄 |
| API | source_receipt(),boss_for_stage(si),moves_for_stage(si),move_by_id(id),phase_by_index(phase),combos_for_stage(si,phase). 정적 int/String 계약을 유지. si14..20/phase0..4 밖은 unsupported 또는 빈 조회. 미지원 stage와 의존 NOT_READY를 구분 |
| boss packet | supported/si/hell3/name_ko/element_id1/element_color#ff5522/ibtrue/etype0/최종Set삽입순서move_ids. 색상은G14338/31163metadata이며BC02색상수정은이단위에포함0 |
| receipt | 이번gameSHA·기준main·채택CH2/CH3실제SHA·원본행·global59/68/phase5·stages14..20·union45/common39/new6·combo54/common46/new8·max_source_idx60/active_idx60=true·live_combat_connected=false/save_io=false/rng_draws0. Global move_manifest는CH2bridge/정식CH3provider의동일원문manifest그대로전달 |
| 공유39 move | CH3.move_by_id의37개 + CH2bridge.move_by_id(poisonTrail/wallPush)2개를 조회. 11원필드+source_ordinal/line 및 같은 source hash를 검증하고 깊은 복사. 두provider공통30도동일조회값임을교차검증하고불일치NOT_READY. 공유 literal·계산식 재전사0 |
| 신규6 move | 부록A2의전체11필드와ordinal/line만자기소유. burstCounter idx60/ordinal31그대로,chainLightning idx42/ordinal43. id/idx/ordinal재번호화0. 기술metadata.combo에CH4Set밖ID가있어도원본보존 |
| Set / phase | §1.1기본39순서와6append/cage삭제. moves_for_stage는globalordinal순서. phase5×8필드는정식공유provider로위임,CH4배율/HP경계표복제0. tailSwipe/burrowStrike/cageTrap/그밖의CH4밖move조회빈결과 |
| 공유46 combo | CH3.combos_for_stage(si10..13,phase0..4)에서44ordinal+CH2bridge의si4..9에서ordinal47/48만수집. 두provider의중복ordinal은 같은 내용인지 확인 후1개만 수집. 동일 seq라도 다른 ordinal은 보존. provider의 전체 combo를 임의 합집합하거나 공유47개라고 가정하지 않음 |
| 신규8 combo | 부록B ordinal13/14/30/31/32/35/49/56의원문seq/phase/line소유. 56은 새 move가 없어도 반드시 포함. 전체 54globalordinal정렬→모든seq가 현재Set안이고 phase일치필터. 7×5후보수부록B와전부대조 |
| 실패 / 불변 | 필수 파일 부재·미인수면 착수 BLOCKED. 파일존재하지만receipt/hash/manifest/필드/필수move/공유combo누락이면명시ready=false/NOT_READY,정상인 빈 catalog로 위장하지 않음. 반환 nested 값 변경이 다음 호출·타 stage·CH2·CH3 값에 주는 영향0 |
| 독립원본 검사 | 최신 main game을 명시 입력. 전체 SHA·구간 SHA·고유 marker·개수를 고정. 원문 등록 선언만 별도 Node VM에서 평가해 expected 생성. 제품에서 expected를 역생성하지 않음. 7Set의전id/순서·45move의 11필드/idx/ordinal/line·54combo의 seq/phase/ordinal/line·5phase8필드전부대조 |
| 경계검사 | Set39..45/union45/39+6/54=46+8/7×5count/외si13·21/phase−1·5/알 수 없는ID/cage/si17counter·si20chain/si19combo56/idx60≠31·42≠43/동일seq다른ordinal/반환별칭/공유의존손상·hash 불일치. 변조 fixture의 ready를 위장하지 않음 |
| 하니스 | 이추적작업지정격리명 EXODUSER-trace-boss-ch4-Isolated-20261020은이번미사용. 후속BC4-01은별도배정의고유userdir확정후사용,기존회귀는각파일상수. OS.execute 출력은 전체 join 또는 UTF-8 임시 파일 사용. node는 --node-bin, game은 --source-game 명시 인자. binary64·정수 carrier 유지, epsilon 완화0 |
| Godot / 회귀 | 이번실행0. 후속구현검증은매run `pgrep -f "Godot.app/Contents/MacOS/Godot" \| wc -l` 확인,2이상이면30초씩대기. override를 매 run 설정하고 끝나면0byte. test_contracts와실제채택된BC01/CH2/CH3catalog·관련회귀,검사 수 유지. 실행 없는 PASS 금지 |
| 중단선 / 제출 | 첫단위에BC02색/BC08인자화/idx60원본수정/counter피격/실Main배선을끼우지않음. 공용 변경이 필요하면 파일·행·근거만 통합 요청하고 HOLD. 정상hook·경로지정add·자기branch push·remoteSHA/DONE후자기worktree제거 |

### 5.2 후속 작은 단위와 연결 중단선

| 순 / 후보 | 자기 신규 범위·원본·검증 축 | 선행 / 중단 |
|---|---|---|
| 1 BC4-01 | 위읽기catalog+원본대조 | **CH2/CH3정식provider확보전BLOCKED**,공용0 |
| 2 BC4-02 | CH4catalog를공통BC02~07의마지막인자로전달하는얇은독립진입점/실si14..20/EL.F·token fixture | BC4-01/일반화BC정식인수. BC02col#bbbbbb는owner수정필요,HOLD면보고후멈춤. 사후색상덮어쓰기0 |
| 3 BC4-03 | 신규6start command/ack계획,원문 draw/좌표/큐·시각효과순서/고정st2검사 | BC06프로토콜+catalog,기존39start는CH1~3owner재사용. 공통pattern복제/미지원성공처리0 |
| 4 BC4-04 | meteor Wind/Meteor2state:mc표·XY/X/Y후퇴·20뒤일괄착탄·45strict·원피격readback | 원문 clock/map·collision·effectsowner. Pr추가/벽수정/mt.t별도시계0 |
| 5 BC4-05 | radial Aim단일state의 60/48·36line·6px 벽/Pr+8·_rlWave중단후재진입/Fx25·bossRec50 | 실제벽reader·원contact·iframe 갱신 순서/rendererowner. CH3laser로통일0 |
| 6 BC4-06 | swordWave raw요청:5/7/10/12/12·fan72..108·homing/빨간콩·표시후처리fixture | 기존투사체·반사/속성owner. 최종 탄수·Q/E실성공은raw요청만으로PASS아님 |
| 7 BC4-07 | pillars1queue:4draw/개·40..59·r[275,375)·초기hit구간/별도 지속조건·210/240/공유배열압축 | map/Statequeue/원문 hurtPreadback. 실queuewriter/collision기둥추가0 |
| 8 BC4-08 | counterstate timeout계산60/R100/active해제와피격read 의존 사양 | timeout모듈은독립command만. hurtE42130–42133의실반격은보호owner통합결정전**HOLD**,counter면역/1회전환대체0 |
| 9 BC4-09 | chain1queue:4점8draw/EL.L/10tick최대1점/외부 gate/빗나감순번소비/ANDtrim | 원문 queue clock/피해·패링owner. charge제외·whilecatchup·피해재시도추가0 |
| 10 BC4-10 | 공유39기술CH4fixture:불색/자동fireMagic·spiral0/180/0·summon10..13·stage반경/idx60hole·미감산 | CH2/CH3후속실제인수SHA·BC08일반화의존. 공통selector보정/계산재작성0 |
| 11 BC4-11 | 7point/HP0→즉시·180f폴백→최종문fixture | REVIVE B1/B2기존단위참조. 새CH4부활모듈0,actualboss_hurtE차단우회금지 |
| 12 BC4-12 | boss_14..20/meteor·radial·pillars·counter·chain전조/3Dfallback/HUD·SOUND읽기소비사양 | assets/renderer/HUD/SOUNDowner. 별도지시후실1x화면검수,이번아트제작0 |
| 13 BC4-13 | 실제팔각arena/actor/clock·피해·counter/부활/상자·출구/si20완료통합 | Main/World/State/factory/hurtE/저장공유 접점결정전**BLOCKED**. Q/E·저장HOLD유지 |

## 6. 공용 접점·통합 결정 목록 — 이번 모두0줄

| 접점 | 현재 파일·위치 / 원본 G | 필요한 인수·판단 |
|---|---|---|
| 장 data/context | main catalog:160–207,a3b context:6–40,CH2/미구현CH3provider /9982–9990 | CH2/CH3읽기provider정식main인수후BC4catalog. 문서나미병합WIP를실제dependency로위장하지않음 |
| 생성 색상 | a3b spawn_contract:110 /14338/31163 | #bbbbbb대입1곳을정식원소색공급으로일반화할owner결정. CH4는#ff5522metadata전달만,실diff줄수/reader계약미확인 |
| 공유이동 | 원격BC08 movement_states:17–35 /38315–38372/40664–40709/40942–40978 | begin/next의si guard/장token인자화기존owner인수. 후속단위에서공용필요하면위치보고하고멈춤 |
| 실제arena/배열·clock | main Main:898–935/1004,World:996이후/2986,init_stage producer:422,State reader /30697–30814 | 팔각collision/map epoch/실actor등록·수명/원sp·draw·동일 tick 실행. 정확삽입행/수정줄수미확인,공용router임의신설0 |
| 4state·2queue executor | Main/World/State /§2.3/2.4 | request순서→실owner실행→ack/readback, 안정압축/기존 _pillars 배열 identity·선행 항목 유지. 스냅샷배열을실권위로직접쓰기0 |
| counter 피격 | main enemy:484/normal_enemy_hurte:151 /42115–42133 | 정식boss_hurtE가reviveiframe선행 gate·반격return·반복활성·P.iframes15를권위있게실행해야함. 보호파일수정·normalmob위장0 |
| HP0·부활·진행 | 동일hurtE/REVIVE·State/regions /42515–42649/34493–34535/41816–42009 | 즉시/폴백·points·실드·살아있음·문gating·hellCleared3정식owner. 별도counter통합과전체HP0결손구분 |
| 투사체/Player/표시·음향 | 기존projectile/Player/HUD/SOUND /16938–16996/37059/37145/24758/35827/53554 | raw빨간콩·chainEL.L/접촉·KB·iframe·원분류실행, 보호Q/E와dtype판정기존권위. 색상·시각완료만으로전투인수아님 |
| 완료/보상/저장 | State/regions·SAVE/NW/TI /41816–42009 | 부활대기문닫힘·si20장완료·상자/3폭출구. 보스phase/queue/active·CD60를새세이브필드로추가0 |

위 원문 statement·기존 코드 위치는 근거이며 수정 승인이 아니다. 필요한 통합 owner·실제 diff 줄 수·공용 연결 권한은 **미확인**이다. 통합 결정 전 Main/State/hurtE·저장을 건드리지 않는다.

## 7. 전수 부록·정적 확인

공통 literal은 기존 CH1~3 정본을 참조하고, 모든45개의 선언/start/state·queue 대응과 신규6 필드·신규8콤보를 아래에 고정한다.

### 부록 A. CH4 기술45개 전수 대응

공유39의 11필드는 CH3 부록A의37개와 CH2 부록A의poisonTrail/wallPush2개를 참조한다. CH1공통22는 기존정본과 같은 값이다. 다음 표는 모든45개의 globalordinal/명시idx/선언/start/state·queue와 최초 허용si를 고정한다. stage의 Set 허용과 move.phase/실제 selector 발동은 별개다.

| ordinal / idx | id | 선언 G | data 정본 | 최초 si | 시작 G | 상태·지연 소비 G |
|---|---|---:|---|---:|---|---|
| 0 / 0 | burst | 9821 | CH3 A 공유 | 14 | 37713–37713 | bossBurstWind 40562–40570 |
| 1 / 1 | fan | 9822 | CH3 A 공유 | 14 | 37714–37714 | bossFanWind 40646–40663 |
| 2 / 2 | charge | 9823 | CH3 A 공유 | 14 | 37715–37715 | bossChargeWind/Charge/Shock 40664–40689,40752–40759 |
| 3 / 3 | jump | 9824 | CH3 A 공유 | 14 | 37716–37719 | bossJumpWind/Jump/Shock 40690–40709,40752–40759 |
| 4 / 4 | laser | 9825 | CH3 A 공유 | 14 | 37720–37721 | bossLaserWind/Laser 40710–40748 |
| 5 / 5 | shock | 9826 | CH3 A 공유 | 14 | 37722–37722 | bossShockWind/Shock 40749–40759 |
| 6 / 6 | summon | 9827 | CH3 A 공유 | 14 | 37723–37723 | bossSummonWind 40798–40815 |
| 7 / 7 | meteor | 9828 | A2 신규 | 14 | 37724–37727 | bossMeteorWind/Meteor 40816–40836 |
| 8 / 8 | grab | 9829 | CH3 A 공유 | 14 | 37728–37729 | bossGrabWind/Grab 40837–40868; d>=120는charge |
| 9 / 9 | spin | 9830 | CH3 A 공유 | 14 | 37730–37730 | bossSpinWind/Spin 40869–40890 |
| 10 / 10 | mine | 9831 | CH3 A 공유 | 14 | 37731–37731 | bossMineWind 40891–40904 |
| 11 / 11 | vortex | 9832 | CH3 A 공유 | 14 | 37732–37732 | bossVortexWind/Vortex 40905–40941 |
| 12 / 12 | multiDash | 9833 | CH3 A 공유 | 14 | 37733–37733 | bossMultiDashWind/MultiDash 40942–40978 |
| 13 / 13 | slashCombo | 9834 | CH3 A 공유 | 14 | 37734–37734 | bossSlashWind/Slash 41074–41110 |
| 14 / 14 | slam | 9835 | CH3 A 공유 | 14 | 37735–37735 | bossSlamWind/Slam 41111–41143 |
| 15 / 15 | sweep | 9836 | CH3 A 공유 | 14 | 37736–37736 | bossSweepWind/Sweep 41144–41184 |
| 16 / 16 | teleStrike | 9837 | CH3 A 공유 | 14 | 37738–37749 | bossTelePrep/Warn/Drop 40979–41046 |
| 18 / 17 | beanStorm | 9839 | CH3 A 공유 | 14 | 37755–37755 | bossBeanStormWind/Storm 41185–41206 |
| 19 / 18 | beanRain | 9840 | CH3 A 공유 | 14 | 37756–37756 | bossBeanRainWind/Rain 41207–41231 |
| 20 / 19 | fanWave | 9841 | CH3 A 공유 | 14 | 37757–37757 | bossFanWaveAim 40571–40606 |
| 21 / 20 | radialLaser | 9842 | A2 신규 | 14 | 37758–37758 | bossRadialAim 40607–40645 |
| 22 / 21 | chaseAoe | 9843 | CH3 A 공유 | 14 | 37759–37768 | _chaseAoes 37015–37052 + charge/shock |
| 23 / 22 | elemBall | 9844 | CH3 A 공유 | 14 | 37769–37791 | 즉시 _spawnBossProjectile→16947–16996 |
| 24 / 23 | swordWave | 9845 | A2 신규 | 15 | 37792–37813 | 즉시 _spawnBossProjectile→16940–16996,탄owner/54218–54225 |
| 26 / 25 | spiralBullet | 9847 | CH3 A 공유 | 14 | 37832–37845 | _spiralBullets 37057 |
| 27 / 26 | delaySlash | 9848 | CH3 A 공유 | 14 | 37846–37853 | bossDelaySlashHold/Swing 41242–41268 |
| 28 / 27 | perilThrust | 9849 | CH3 A 공유 | 14 | 37854–37859 | bossPerilWind/Thrust 41269–41285 |
| 29 / 28 | pillars | 9850 | A2 신규 | 16 | 37860–37877 | _pillars 37059 |
| 31 / 60 | burstCounter | 9852 | A2 신규 | 17 | 37890–37895 | bossBurstCounter 41286–41301; hurtE 42130–42133 |
| 35 / 34 | groundFissure | 9856 | CH3 A 공유 | 14 | 37931–37948 | _fissures 37067 |
| 36 / 35 | tideWave | 9857 | CH3 A 공유 | 14 | 37949–37963 | _tideWaves 37069 |
| 37 / 36 | seekerMines | 9858 | CH3 A 공유 | 14 | 37964–37978 | _seekerMines 37071 |
| 39 / 38 | gravityWell | 9860 | CH3 A 공유 | 19 | 37992–38002 | _gravityWells 37075 |
| 40 / 39 | wallPush | 9861 | CH2 A 재해금 | 18 | 38003–38012 | _wallPushes 37077 |
| 41 / 40 | poisonTrail | 9862 | CH2 A 재해금 | 14 | 38013–38019 | bossPoisonDash 41327–41336→_poisonPools 37079 |
| 43 / 42 | chainLightning | 9864 | A2 신규 | 20 | 38024–38036 | _chainLights 37145 |
| 45 / 44 | shieldBash2 | 9866 | CH3 A 공유 | 14 | 38048–38053 | bossSBashWind/SBash 41337–41351 |
| 50 / 49 | lavaPools | 9871 | CH3 A 공유 | 14 | 38085–38117 | _lavaPools 37129 |
| 51 / 50 | fireRain | 9872 | CH3 A 공유 | 14 | 38118–38133 | _fireRains 37131 |
| 52 / 51 | shockGrid | 9873 | CH3 A 공유 | 14 | 38134–38148 | _shockGrids 37133 |
| 53 / 52 | donutSlam | 9874 | CH3 A 공유 | 14 | 38149–38160 | _donutSlams 37135 |
| 54 / 53 | safeCorner | 9875 | CH3 A 공유 | 14 | 38161–38177 | _safeCorners 37137 |
| 55 / 54 | crossWipe | 9876 | CH3 A 공유 | 14 | 38178–38191 | _crossWipes 37139 |
| 56 / 55 | tidalWipe | 9877 | CH3 A 공유 | 14 | 38192–38211 | _tidalWipes 37141 |
| 57 / 56 | rapidMissile | 9878 | CH3 A 공유 | 14 | 38212–38234 | 즉시 _spawnBossProjectile→16947–16996 |

#### A2. 앞 장에 없는 신규6기술의 원필드11개

| id | idx | tele | rec | canFeint | canDelay | range | phase | combo | tags | cd |
|---|---:|---:|---:|---|---:|---|---|---|---|---:|
| meteor | 7 | 40 | 50 | false | 0 | [80,500] | [1,2,3,4] | [vortex,charge,multiDash] | [aoe,ranged] | 220 |
| radialLaser | 20 | 35 | 50 | false | 0 | [0,999] | [1,2,3,4] | [charge,fan,burst] | [aoe,ranged,sustained] | 240 |
| swordWave | 23 | 25 | 60 | true | 0.3 | [40,350] | [0,1,2,3,4] | [charge,slashCombo,sweep,teleStrike] | [ranged,frontal,redbean] | 120 |
| pillars | 28 | 35 | 45 | false | 0 | [0,999] | [1,2,3,4] | [charge,fan,elemBall] | [aoe,zone,utility] | 200 |
| burstCounter | 60 | 20 | 60 | false | 0 | [0,150] | [1,2,3,4] | [slashCombo,sweep,charge] | [aoe,melee,punish] | 160 |
| chainLightning | 42 | 25 | 35 | false | 0 | [60,400] | [1,2,3,4] | [fan,burst,charge] | [ranged,multi-hit] | 140 |

#### A3. 신규6 start와4 state body의 적 필드 접근 전수

아래17필드의 범위는 위6 start case와4 state body뿐이다. hurtE 반격은 §2.3의 e.ib/_bcActive/s/atk와 기존 피해 정본을 참조한다. 새2queue의 literal 필드는 §2.4에 전부 나열했다. 전체 game.html의 모든 적 필드 전수라는 뜻은 아니다.

| e 필드 | 위 범위 내 G 행 |
|---|---|
| _bcActive | 37893, 41290 |
| _bossPhase | 37796, 37862 |
| _rlFx | 40634 |
| _rlR | 37758, 40612 |
| _rlWave | 40609, 40615, 40637–40638, 40642 |
| atk | 37795, 37871, 38032, 40613, 40628, 40829–40830, 41293 |
| col | 40832 |
| el | 37804, 37871, 37875, 40628–40629, 40829–40830, 41293 |
| facing | 37794, 37801 |
| meteors | 37724, 37726, 40827, 40834 |
| r | 40821–40822 |
| s | 37727, 37758, 37812, 37876, 37892, 38035, 40640, 40642, 40823, 40834, 41300 |
| speed | 40819 |
| st2 | 37727, 37758, 37812, 37876, 37892, 38035, 40610, 40640, 40642, 40823, 40825, 40834, 41289, 41300 |
| stunned | 40628 |
| x | 37727, 37758, 37794, 37802, 37808, 37810, 37875, 37894, 38027–38028, 38030, 38034, 40621–40622, 40628, 40630, 40636, 40818, 40820–40822, 40829, 41292, 41294–41295, 41298–41299 |
| y | 37727, 37758, 37794, 37802, 37808, 37810, 37875, 37894, 38027–38028, 38031, 38034, 40621–40622, 40628, 40630, 40636, 40818, 40820–40822, 40829, 41292, 41294–41295, 41298–41299 |

### 부록 B. 54콤보와 stage·phase 전수

공유46 ordinal은 0, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 34, 39, 42, 43, 44, 45, 47, 48, 51, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67. CH3 정본의44개와 CH2의47/48을 합친 값이다. 동일 seq라도 다른 ordinal은 별도 후보다. 13/14/30/31/32/35/49는 신규 기술이 들어간 콤보,56은 기존 wallPush+gravityWell의 최초 장내 조합이다. CH2·CH3 union ID를 합쳐 만든 가상 장에서의47개와 실제 provider 제공46개를 혼동하지 않는다.

| ordinal | 선언 G | seq / 공유 정본 | phase | 최초 si (이후 누적) |
|---:|---:|---|---|---:|
| 0 | 9882 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 3 | 9885 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 4 | 9886 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 5 | 9887 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 6 | 9888 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 7 | 9889 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 8 | 9890 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 9 | 9891 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 10 | 9892 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 11 | 9893 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 12 | 9894 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 13 | 9895 | [meteor,fan,charge] | [1,2,3,4] | 14 |
| 14 | 9896 | [meteor,multiDash,burst] | [2,3,4] | 14 |
| 15 | 9897 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 16 | 9898 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 17 | 9899 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 18 | 9900 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 19 | 9901 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 20 | 9902 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 21 | 9903 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 22 | 9904 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 23 | 9905 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 24 | 9906 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 25 | 9907 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 26 | 9908 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 27 | 9909 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 28 | 9910 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 29 | 9911 | CH3 B 같은 ordinal | [3,4] | 14 |
| 30 | 9912 | [swordWave,charge,slashCombo] | [0,1,2,3,4] | 15 |
| 31 | 9913 | [teleStrike,swordWave,sweep] | [1,2,3,4] | 15 |
| 32 | 9914 | [swordWave,swordWave,charge] | [2,3,4] | 15 |
| 34 | 9916 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 35 | 9917 | [pillars,charge,elemBall] | [1,2,3,4] | 16 |
| 39 | 9921 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 42 | 9924 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 43 | 9925 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 44 | 9926 | CH3 B 같은 ordinal | [2,3,4] | 19 |
| 45 | 9927 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 47 | 9929 | CH2 B 같은 ordinal | [2,3,4] | 18 |
| 48 | 9930 | CH2 B 같은 ordinal | [1,2,3,4] | 14 |
| 49 | 9931 | [chainLightning,charge,sweep] | [1,2,3,4] | 20 |
| 51 | 9933 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 56 | 9938 | [wallPush,gravityWell] | [3,4] | 19 |
| 57 | 9939 | CH3 B 같은 ordinal | [0,1,2,3,4] | 14 |
| 58 | 9940 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 59 | 9941 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 60 | 9942 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 61 | 9943 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 62 | 9944 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 63 | 9945 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 64 | 9946 | CH3 B 같은 ordinal | [1,2,3,4] | 14 |
| 65 | 9947 | CH3 B 같은 ordinal | [2,3,4] | 14 |
| 66 | 9948 | CH3 B 같은 ordinal | [3,4] | 14 |
| 67 | 9949 | CH3 B 같은 ordinal | [3,4] | 14 |

아래는 **모든 seq가 해당 최종Set에 있고 combo.phase가 일치하는 정적 후보 수**다. 첫id·개별 move.phase/CD·score·RNG까지 통과한 자연 발동 수가 아니다(G38431–38434).

| si | phase0 | phase1 | phase2 | phase3 | phase4 |
|---:|---:|---:|---:|---:|---:|
| 14 | 16 | 32 | 43 | 46 | 46 |
| 15 | 17 | 34 | 46 | 49 | 49 |
| 16 | 17 | 35 | 47 | 50 | 50 |
| 17 | 17 | 35 | 47 | 50 | 50 |
| 18 | 17 | 35 | 48 | 51 | 51 |
| 19 | 17 | 35 | 49 | 53 | 53 |
| 20 | 17 | 36 | 50 | 54 | 54 |

공통 BOSS_PHASES5×8필드의 hp구간/spdM/teleM/cdM/comboC/feintC/delayC/label은 G9951–9957 및 CH1 부록A 정본을 재사용한다. 모든7보스에 같은 phase표가 적용되며 개별 phase 해금 차이는 A2와 B의 stage/phase 필터다. HP 경계에서 phase가 직접 jump할 수 있으므로 0→1→2→3→4를 매번 강제하지 않는다.

### 부록 C. 핵심 식별자의 두 파일 전체 행 색인

55개 식별자는 정확한 식별자 경계로 game.html/index.html 전체를 검색했다. 함수 선언·호출뿐 아니라 reset·렌더·테스트베드·문자열/주석도 포함한다. 일치가 실제 실행을 뜻하지 않는다. 이름은 별도7행 substring 검색이다. 화염 악마의 G16109 일치는 **화염 악마팔찌 아이템명**이므로 보스 참조로 세지 않는다.

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
| _pillars | 30763, 31555, 37059, 37866, 37870, 37872, 57735–57737, 60069, 63486, 64282 | — |
| _chainLights | 30770, 31558, 37145, 38026, 38032, 58040–58042, 63489, 64285 | — |
| meteors | 31180, 37724, 37726, 40827, 40834, 41618, 41694, 53211, 53213 | — |
| _rlR | 37758, 40612, 40620–40621, 40634, 53036, 58568, 58571–58572, 58574–58575, 58579–58580 | — |
| _rlWave | 40609, 40615, 40637–40638, 40642, 53037 | — |
| _rlFx | 40634, 53057–53062, 53064–53065, 53076 | — |
| _bcActive | 37893, 41290, 42130, 53987 | — |
| swordWave | 9845–9846, 9848, 9851, 9859, 9912–9915, 9985–9990, 9992, 9999, 16861, 16876, 16963, 16968, 17041, 37701, 37792, 37805, 54218 | — |
| redBean | 9285, 9571, 16859, 16874, 16910, 16967, 16970, 16978–16979, 17041, 17259, 20051, 20118–20119, 20132, 24223, 33385, 33393, 33463, 33472, 33485, 33493, 33827, 33830, 33832–33833, 33836, 34674, 34676, 34745, 34747, 34828, 34832, 34854, 34914, 34918, 34920, 34932, 34939, 35036, 35069, 35073, 35089, 35091, 35100, 35104, 36805, 37061, 37793, 37805, 38297, 38368, 40567, 40660, 41199, 41221, 42600, 42819, 42839, 42853, 43441, 43449, 43473, 46885, 46895, 54074–54076, 54090, 54214, 64803–64805 | — |
| _bossLvMul | 31142 | — |
| _moveCDs | 31176, 37654, 38259, 38377, 38393, 38395, 38429, 60442 | — |
| hurtE | 3326, 5309, 10240–10241, 10244, 14442, 16598, 19837, 24593, 24605, 24616, 24633, 24647, 28012, 28060, 28809, 28817, 28852, 28980, 32283, 32292, 32316, 32432, 32505, 32624, 32670, 33226, 33242, 33456, 33793, 33981, 33999, 34037, 34084, 34235, 34245, 34275, 34284, 34310, 34322, 34740, 34760, 34828, 34832, 34994, 35073, 35111, 35122, 35228, 35265, 35294, 35308, 35344–35345, 35347, 35355, 35379, 35389, 35407, 35420, 35442, 35467, 35483, 35507, 35530, 35621, 36130, 36178, 36245, 36291, 36528, 36539, 36547, 36615, 36740, 36872, 36896, 36962, 36998, 37117, 37172, 37319, 37329, 37364, 37399, 37421, 37441, 37446, 37450, 37454, 37458, 37462, 37468, 37475, 37479, 37483, 37617, 38545, 38599, 38608, 38729, 38738, 38747, 38759, 38767, 39335, 40587, 40628, 40683, 40960, 41034, 41068, 41092, 41129, 41160, 41262, 41279, 41287, 41313, 41345, 41351, 42110, 42320–42321, 42332, 42393, 42438, 42442, 42460, 42476, 42492, 42496, 42662, 42776, 42786, 43241, 43348, 43600, 43602, 43604, 44864, 45058, 45620, 45927, 46138, 46150, 46328–46329, 46530, 46539, 46791, 46919 | — |
| hurtP | 3327, 16996, 20020, 24759–24762, 31107, 33009, 33013, 33015, 33017, 33738, 33830, 35820, 37037, 37055, 37059, 37065, 37067, 37069, 37071, 37073, 37077, 37079, 37122, 37129, 37131, 37133, 37135, 37137, 37139, 37141, 37143, 37145, 37147, 37149, 37151, 38288, 38809, 38816, 38835, 39059, 39182, 39210, 39330, 39371, 39676, 39694, 39713, 39730, 39792, 39817, 39870, 39877, 39885, 39901, 39962, 39988, 40035, 40052, 40082, 40099, 40115, 40209, 40428, 40437, 40501, 40535, 40545, 40553, 40588, 40629, 40685, 40706, 40737, 40756, 40768, 40830, 40857, 40862, 40884, 40925, 40935, 40962, 41036, 41069, 41093, 41130, 41161, 41263, 41281, 41293, 41314, 41346, 41370, 42125, 42131, 42590, 42787, 42846, 42868, 42883, 43058, 43415, 61086, 61120, 61250, 61681, 61697 | — |
| _PARRYABLE_ATK | 37701, 37703 | — |
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
| bossMeteorWind | 9548, 23420, 23518, 37727, 40816, 53211, 64992 | — |
| bossMeteor | 23429, 23508, 40823–40824, 53211–53212, 64996 | — |
| bossRadialAim | 23424, 23522, 37758, 40607, 40640, 53034, 64994 | — |
| bossBurstCounter | 23433, 23512, 37892, 41286, 42130, 53428 | — |
| meteor | 9828, 9832, 9895–9896, 9983, 9992, 9999, 19453, 37724 | — |
| radialLaser | 9842, 9983, 9992, 9999, 37758, 40606, 41373 | — |
| pillars | 9850, 9856, 9917, 9986–9990, 9992, 9999, 29599, 29642, 29715, 29726, 29787–29789, 29896, 30240, 30302, 30338, 30341, 37860, 44192, 44195, 48155 | — |
| burstCounter | 9852, 9919, 9987–9990, 9992, 9999, 37890 | — |
| chainLightning | 9864, 9931, 9990, 9992, 9999, 37701, 38024 | — |
| 화염 악마(이름 substring) | 9982, 16109, 16692 | — |
| 불기둥 수호자(이름 substring) | 16692 | — |
| 용암의 심장(이름 substring) | 16692 | — |
| 화염 전사(이름 substring) | 16692 | — |
| 화염 쌍두(이름 substring) | 16692 | — |
| 불벌레 군주(이름 substring) | 16692 | — |
| 화염 감옥지기(이름 substring) | 9982, 16692 | — |

### 부록 D. atlas_bosses.json의 CH4 등록

main Git blob JSON에서 각 Array의 길이만 셌다. 픽셀·모션·품질·실제 렌더 우선순위 검수 수치가 아니다.

| key | idle | breath | walk | attack | rage_attack | windup | rage_windup | stagger | death | rage |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| boss_14 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 4 |
| boss_15 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 4 |
| boss_16 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 8 |
| boss_17 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 8 |
| boss_18 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 8 |
| boss_19 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 8 |
| boss_20 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 7 | 4 |

### 부록 E. 확인 기록·미확인

| 검사 | 근거·한계 |
|---|---|
| 원본 | 두 파일의 행수/SHA와 main blob·체크아웃 byte 일치. 원본 변경0 |
| 집합 | Node VM 정적선언59move/68combo/5phase. Set39..45/union45=공유39+새6,콤보54=공유46+새8,si별5phase의35후보수 대조 |
| HP·stage 산술 | 원문6level×7stage=42 HP 표본/공통ATK·7부활point·7×5 meteor개수 확인. idx60은 원문score+59한정loop 산술의 별도 정적 probe로 관측,실제 mkEn/자연AI/전투 아님 |
| 전수 색인 | 45start/state 대응,새6×11원필드·4state범위17필드,54콤보대응,55식별자/7이름의두파일전체행. 문자열 false positive를 별도 분리 |
| docs | 보스8/부활3파일의관련절·CH1/CH2/CH3/REVIVE·WORK_BOARD/FEATURE_INVENTORY 확인. main tracked docs 관련 검색131행은 외부 docs-search.txt |
| 의존 | main tree에CH2/CH3catalog/context등부재,참조5commit 모두main미병합. BC3-01은구현아닌BLOCKED 보고. 원격읽기참조·정식인수를구분 |
| 실행·범위 | Godot0/import0/새테스트0/게임·서버·실창·실저장0. pgrep gate/override·새격리userdir미사용. 코드·공용·테스트·저장변경0 |
| 미확인 | full빌드도달·자연AI/idx60선택빈도·실피격/패링/counter/부활·2D/3D실화면·GLB·음악·PC/Mac동등성·실저장·성능·공용권한/실diff줄수 |
| 후속 첫단위 | BC4-01은CH2/CH3정식읽기provider확보전BLOCKED. 이후catalog+원본대조만. 색/BC08/hurtE/Main연결은통합결정전HOLD |

정상 hook·경로 지정 staging·자기 branch 비강제 push·원격 SHA 확인 후 DONE.txt를 작성하고 자기 worktree를 제거한다. 최종 SHA·원격·R 보존·정리 기록은 순환 참조를 피하려고 외부 DONE.txt/submission.json/cleanup-verification.json에 남긴다.
