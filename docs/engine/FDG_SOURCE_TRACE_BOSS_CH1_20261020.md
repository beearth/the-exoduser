# 1장 보스 원본 추적·작은 이식 단위 지시서 — 2026-10-20

## 0. 기준과 작업 경계

| 항목 | 확인 내용 |
|---|---|
| 작업 | `trace-boss-ch1` / `codex/trace-boss-ch1-20261020` |
| 시작 기준 | `git fetch origin` 성공 후 최신 `origin/main=19a713578e478fce5e4e7231140c6ed9f8883e98`에서 새 worktree 생성. 요청 하한 `ad6ac68a2` 이후 main |
| 작업 위치 | `/Users/fordeargamers/exoduser-wt/trace-boss-ch1` |
| 기준 체크아웃 R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; 시작 branch=`codex/mac-live-play-time-main-20261017`, HEAD=`dd49171c5b88e211575a41f185395d6c0a14b184`; tracked INDEX/WORK 각각 변경 없음. R에 브랜치 전환·파일 수정·커밋 없음 |
| 원본 행 기준 | 위 main의 `game.html` 65,692행, SHA256=`4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; `index.html` 4,742행, SHA256=`36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 이번 변경 | 이 새 추적 Markdown 1개만 작성. 게임·Godot 코드·테스트·설계 docs·작업판·계획 문서 변경 0. 별도 보고서도 만들지 않음 |
| 보호 | `docs/2_3 돌진+패링+방패시스템/`, Q/E 판정·입력·자원 계약, 세이브 형식은 **보호**. 관측과 의존 표기만 하며 변경안을 제안하지 않음 |
| 증거 수준 | 파일·기존 테스트 본문을 정적으로 확인. JS 정적 선언과 독립 score 함수만 별도 VM에서 평가해 집합/개수·수식 표본 4개 대조. 게임 실행·Godot import·기존/신규 테스트 실행·화면·PC 실행 검수 없음. 후속 테스트는 계획이며 PASS가 아님 |

본 문서에서 `si`는 전역 스테이지 번호, `phase`는 HP 페이즈 0~4, `idx`는 기술의 원본 명시 ID, `ordinal`은 배열 내 0기준 순서다. 서로 바꾸지 않는다. `f`는 원본 native tick 단위이며 실제 벽시계 초와 동일하다고 단정하지 않는다. `~~`는 JS ToInt32, `Math.floor`는 내림으로 구분한다. 큰 HP를 Int32로 일괄 변환하면 원본이 달라진다.

### 0.1 먼저 읽은 공통 문서와 중복 방지

| 근거 | 확인·경계 |
|---|---|
| [WORK_BOARD](orders/WORK_BOARD.md) 진행 중·공용 연결 요청 | TRACE-BOSS-CH1은 새 문서 단독 소유. TRACE-CH1-ENEMIES·TRACE-SOUND·TRACE-META·TRACE-WEAPONS·TRACE-SKILLS·TRACE-ITEMS와 분리. QS-01/SETTINGS-S01/SV-CONTRACT 신규 모듈을 선점하지 않음 |
| [개발 계획](FDG_GAME_DEVELOPMENT_PLAN.md) §단계별 실행·인수 표 / 실행 작업표 | 보스 데이터·AI·전투는 P3, HUD/다음 진행 연결은 P4 의존. P4 전체 완료나 배정 확정으로 보고하지 않음. P3-002는 작업판과 실제 병합 파일 기준으로 이미 존재; 계획의 옛 미병합 문구만으로 결손 판정하지 않음 |
| [FEATURE-INVENTORY](FDG_FEATURE_INVENTORY_20261020.md) 기준·보스 슬롯/무브 행 | 원 snapshot HEAD=`2845f96e97d4803e4fb8ab4f3d5c0ff8e80d4353`, 이 조사와 game.html SHA256은 같음. Godot 진행 판정은 이 worktree 실제 파일로 다시 구분. 35슬롯/59기술 등록과 옛 19보스/49기술 요약을 구분 |
| [부활·실드 추적](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1.3·§1.5·§3~5 | 보스 즉시 부활·180f 폴백·신성력·실드·최종 죽음 소유는 이 기존 추적에 둠. 아래 순서는 이중 보스 부활 모듈을 새로 설계하지 않음 |
| [SAVE](FDG_SOURCE_TRACE_SAVE_20261020.md), [SETTINGS](FDG_SOURCE_TRACE_SETTINGS_20261020.md), [INVENTORY](FDG_SOURCE_TRACE_INVENTORY_20261020.md), [QUICKSLOT](FDG_SOURCE_TRACE_QUICKSLOT_20261020.md) | 저장 5개 생산자·설정·장비·퀵슬롯 소유는 기존 추적을 유지. 이 문서는 보스에서 읽거나 넘기는 접점만 열거 |
| 작업판 갱신/보고서 일반 규칙과 이번 지시 | 사용자의 ‘새 추적 문서 1개만’이 우선. 공용 작업판·별도 REPORT를 수정하지 않고 제출 SHA와 외부 DONE으로 인계 |

### 0.2 네 슬롯과 현재 도달성

| si / 장 내 위치 | `HELL_BOSSES[0]` 이름 | 실생성 식별·속성 | 최종 허용 기술 수 | 현재 일반 분기 |
|---|---|---|---:|---|
| 0 / 1-1 | 다크드루이드 | `mkEn(...,0,0,true,EL.P,0)` | 23 | `_isNormalDruidBoss=true` |
| 1 / 1-2 | 독버섯 거인 | `etype=0,ib=true,el=EL.P` | 21 | 일반 공통 보스 |
| 2 / 1-3 | 지옥기형 | `etype=0,ib=true,el=EL.P` | 10 | 얼굴 6기술 score+2, 전조×1.4 |
| 3 / 1-4 | 다크드루이드 | `etype=0,ib=true,el=EL.P` | 23 | `_isNormalDruidBoss=true` |

원본 근거: `game.html:16633–16712`, `16938`, `30782`, `31120–31134`. 네 슬롯은 서로 다른 전투이며 이름 중복을 제거해 3개 전투로 축소하지 않는다. `STG.monLv=100`은 메타데이터이고 실제 보스 레벨은 `mkEn`에서 플레이어 레벨·난이도로 계산한다.

**도달성 확정:** `game.html:16644–16648`의 `_DEMO_LAST_STAGE=0`과 `17054–17055`의 `_isDruidFinale(e)`가 요구하는 `G.stage===_DEMO_LAST_STAGE && G.stage===3`은 동시에 참일 수 없다. 현재 원본의 일반 실행에서 전용 si3 피날레는 도달 불가다. `_BIC`나 `?demo`만으로 이 논리 모순이 해소되지 않는다. 피날레 함수·연출은 남아 있으므로 §2.7에서 전수 추적하되 활성화 변경을 제안하지 않는다. 별도 하니스의 소스 치환/옛 실행 결과를 현재 본편 도달 증거로 삼지 않는다. 실제 빌드별 소스 치환 여부는 **미확인**이다.

## 1. 데이터·상수 등록 전수표

### 1.1 테이블·생성·유효 무브셋

| 원본 행(game.html) | 구조/상수 | 현재 값·적용 순서 |
|---|---|---|
| 3467 | `_bossTestReq` | `bosstest` 없으면 -1, 있으면 0 이상 정수. 테스트 진입은 일반 진행의 도달성 증거와 분리 |
| 6311 / 9272–9278 | `OPT.diff/bossDebug`, 난이도 | 기본 diff5·bossDebug=false. 레벨 offset `[-500,-400,-300,-200,-100,0,100,200,300,400,500]`; HP/ATK 배율 `[.45,.55,.65,.76,.88,1,1.12,1.25,1.40,1.58,1.78]` |
| 9164 | `_bossCine` | active=false,t0,maxT180,name빈값,phase0,lastBossId=null |
| 9820–9880 | `BOSS_MOVES` | 실제 59레코드. 필드=`id,idx,tele,rec,canFeint,canDelay,range,phase,combo,tags,cd`. 전체 순서/idx와 1장 24기술 모든 필드는 부록 A |
| 9881–9950 | `BOSS_COMBOS` | 실제 68개. `seq,phase`; 같은 seq를 중복 제거하면 추첨 가중치가 달라질 수 있으므로 원본 ordinal 보존. 1장 전체 조건 후보 27개는 부록 B |
| 9951–9957 | `BOSS_PHASES` | 5개, 8필드(`hp` 포함). 부록 A의 정확한 상수표; phase0도 spd1.15/tele.75/cd.5 적용 |
| 9960–9967 | `_BOSS_MOVESET[0..3]` | 9962의 초기 si0 Set을 최종으로 쓰지 않음. si3에서 cageTrap 제거(9966) → si0을 `new Set(si3)`로 복사(9967). 최종 si0/3 동일 23, si1=21, si2=10 |
| 10009–10010 / 37651 / 38020–38023 | cageTrap 금지 | 모든 35슬롯에서 삭제·score -1·강제 실행 recover25로 종료. idx41 등록은 예약. 1장 후보에 포함하지 않음 |
| 14355–14356 | `BOSS_HP_MULT=8`, `BOSS_ATK_MULT=3`, `FINALBOSS_HP_MULT=15`, `FINALBOSS_ATK_MULT=5` | 정의는 존재하나 현재 `mkEn` HP/ATK 계산의 피연산자가 아님. 옛 배율을 실제 HP로 이식하지 않음 |
| 16633–16648 / 16680 | `CHAPTER_STAGES`, 빌드 gate, `HELL_THEMES[0]` | 1장 startSi0/stages4/hell0; be=EL.P; demo 기본값·laststage0은 §0.2 |
| 16688–16712 | `HELL_BOSSES`, `STG`, `TOTAL_STAGES` | 7장·35슬롯, 1장 이름은 §0.2. STG 필드 `n,kr,w,f,ac,bn,be,monLv,hell,hellFloor,isHellBoss,chapter` 해당 생성식 보존; si3가 장 마지막 |
| 16714–16722 | `G` 초기 보스·stage 상태 | bossAlive=true, rooms/map/exits, stageCleared=false,_stageDiffOff0; 동적 필드는 이후 생성 |
| 16938–16945 | NORMAL 드루이드·탄 wrapper | si0/3·ib·!finale; `_druidPoison` 주입, straight/thorn 개별 gate; 보스 탄은 비보스 경고 emitter를 우회하고 spawnProj로 직행 |
| 31033–31037 / 31119–31162 | 엘리트·실제 보스 스탯 | ib이면 elite0/mods빈배열, hpMul/atkMul/scaleMul=1; 공식을 §1.2에 고정 |
| 31162–31362 | mkEn 반환 레코드 | 일반 etype 필드도 함께 초기화하나 보스 식별은 ib. 보스 전용·공통 소비 필드는 §1.3. `_assignMobSkin(_e)` 후 반환 |
| 37699 / 37701–37705 | 얼굴 기술·분류·전조 | 얼굴집합=`jump,charge,slashCombo,sweep,tailSwipe,beanStorm`; `_PARRYABLE_ATK`는 **보호된 분류 접점**이며 변경 대상 아님; tele=`~~(mv.tele*teleM)+extraDelay`, si2 추가 `~~(tele*1.4)` |

최종 Set의 **삽입 순서까지** 아래와 같다. AI의 평가 순서는 이 Set 순서가 아니라 `BOSS_MOVES` 원본 ordinal 순서다.

| si | 최종 기술 ID(원본 Set 순서) |
|---|---|
| 0,3 | slashCombo, slam, sweep, charge, jump, burst, shock, fan, groundFissure, poisonTrail, spin, grab, multiDash, tideWave, chaseAoe, elemBall, beanStorm, summon, mine, seekerMines, lavaPools, rapidMissile, burrowStrike |
| 1 | slashCombo, slam, sweep, charge, jump, burst, shock, fan, groundFissure, poisonTrail, spin, grab, multiDash, tideWave, chaseAoe, elemBall, beanStorm, summon, mine, lavaPools, rapidMissile |
| 2 | jump, charge, slashCombo, sweep, tailSwipe, spin, slam, beanStorm, fan, multiDash |

`teleStrike`는 최초 si0 선언에는 있으나 최종 si0/3에는 없다. `_bossStartPattern`에 case가 남아 있다는 이유로 1장 자연 AI 기술에 추가하지 않는다. `tailSwipe`는 si2만, `burrowStrike/seekerMines`는 si0/3만이다.

### 1.2 HP·ATK·초기값 공식

| 항목 | 원본 행 | 이식할 실제 공식·관측 경계 |
|---|---|---|
| 레벨 | 31125–31126 | `L=max(1,(P.lv\|\|1)+(DIFF_LV_OFF[OPT.diff]\|\|0)+(G._stageDiffOff\|\|0))`; dm=`DIFF_MUL[OPT.diff]\|\|1` |
| 생성 좌표 | 31120–31124 | 유한 좌표 검사 후 canMv/safePt의 보스 검사 반경은22. 생성된 실제 몸의 r44와 다름. 막힌 좌표에서 safePt도 실패하면 null 반환. 이 차이를 임의 보정하지 않음 |
| HP 기본 커브 | 31145 | `C=(L<=500 ? .4*L³+199*L+100 : 50000000*1.0014^(L-500))*2.925` |
| pacing | 31119 | `p=1/(1+min(9,max(0,L-1))/18)`; Lv1=1, Lv10이상=2/3 |
| 최종 HP | 31146–31149 | 일반 보스 `H0=floor(C*p*24*dm*1)`, `H=floor(H0*(1+si*.02))`. floor 두 번 보존; finale override는 현재 도달 불가 |
| ATK | 31151–31152 | `floor((75+L*2.9)*.6*dm*1)`; `hp=400/atk=22`, lvScale, atkScale, _plvMul, _bossLvMul은 현재 결과 공식에 쓰이지 않는 local |
| 몸·이동 | 31137–31140 | speed/baseSpd=.5, r=`22*2*1=44`; local po=105 대신 실제 poise/maxPoise=H |
| 방어·부활력 접점 | 31164 / 31180–31185 | poise/maxPoise=H; eShield/max=H,regenT0; revPts/max=200+round(si*5.882) → [200,206,212,218]. 별도 부활·실드 추적 소유 |
| 초기 타이머/RNG | 31165–31178 / 31260–31261 | st2=30+u*50,facing=u*2π,projT=70+u*50,projCd50,bossPatCd35,bossPatT30+u*20; _bossOrbitAng=u*2π,_bossStrafeCd0. 각 난수의 호출 순서는 보스 조건 평가를 포함해 생성자 전체 순서로 별도 검증 |
| 레벨별 기준값 | 위 식을 별도 계산한 정적 oracle | dm1·elite0: Lv1 HP si0..3=[21017,21437,21857,22278], ATK46; Lv10=[116532,118862,121193,123523],ATK62; Lv100 si0=19656000,ATK219; Lv500 si0=2344661280,ATK915; Lv501 si0=2343276000,ATK916. 500→501 커브 불연속도 임의 보정하지 않음 |

### 1.3 상태 필드·생산자/소비자

| 필드 집합 | 생산·변경 원본 행 | 주요 소비·주의 |
|---|---|---|
| x,y,r,hp,mhp,atk,baseAtk,speed,baseSpd,el,col,alive,ib,etype,room,lv | 31162–31166; 이동·패턴·hurtE | body/UI/hit/collision 공통; si는 별도 개체 필드가 아니라 대부분 G.stage로 읽음 |
| stunned,_maxStunned,_pImmune,kb,poise,maxPoise,poiseR,reviveIframes | 31163–31164/31180; 38589–38635; 38247–38254; `_poiseHit/_poiseReset` | 보스 피해/체간·실드 이식 소유자 의존. **Q/E 보호**, 시각 바만 독립 소비 가능 |
| s,st2,facing,_moveAng,_isMoving,_prevX/_prevY,_moveHold | 31165; 38637–38642; 38884; 40444–41383 | 한 tick 내 AI가 s를 바꾸면 같은 tick switch가 실행됨. drawEnBody도 facing을 쓸 수 있음(20213–20216); 렌더를 무조건 읽기 전용으로 가정하지 않음 |
| bossPatCd,bossPatT,_bossPhase,_combatSt | 31171–31174; 38236–38441 | phase/check→idle move→AI 순. CD 감산은 _bossAI 호출 중에만 발생하므로 공격 상태에서 자동 매 tick 감산으로 바꾸지 않음 |
| _comboSeq,_comboIdx,_moveCDs,_lastMoves,_meleeStreak,_feinting,_delaying,_dbgScores | 31175–31179; 37650–38441; 40452–40454 | _moveCDs 초기 길이59이나 명시 idx를 쓴다. history 최대5. _meleeStreak는 lazy0, ranged일 때만 리셋. _delaying은 초기화/리셋 흔적, 실제 delay는 extraDelay로 전조에 합산 |
| _bossOrbitAng,_bossStrafeCd,_strafeDir,_idleRBT,_aSpdM,_aAtkM | 31260–31261; 38315–38372; 38874–38875 | orbit 각 .015, 방향 전환 RNG .005, cooldown60; aura는 보스 elite0이어도 외부 버프 가능성 별도 의존 |
| projCd,projT,_projChargeT/_Bean/_Col/_ParryClass | 31155–31168; 40507–40517; 20122–20155; 38878 | 보스도 generic idle 차징60 경로를 탈 수 있음. `_fireChargedProj`는 _spawnBossProjectile 대신 spawnProj를 직접 부르므로 자동으로 독 wrapper가 붙지 않음 |
| jumpX,jumpY,jumpOx,jumpOy,echDx,echDy,chargeT,shockR,shockMax,_spinAng | 31169/31172/31180; 37715–37731; 40664–40889 | 이동/원형 판정 상태; 모든 tele·range 메타값을 직접 이동 거리로 쓰지 않음 |
| _dashCnt/_dashIdx,_slashCnt/_slashIdx,_weaponAng,_sweepDir,_isTail,_bsWave/_bsMaxWave | 37733–37737/37755; 40942–40977/41074–41205 | multi-hit 횟수·재조준·간격과 P.iframes gate를 분리. slash/sweep에 독립 hit latch는 없음. `_isTail`은 공유 sweep의 이름/연출 분기 |
| _diveMax,_teleOx/_teleOy,_diveTx/_diveTy,_underMax,_eruptMax,_eruptHit,iframes | 37750–37754; 41047–41072 | iframes는 이 상태에서 쓰지만 hurtE의 일반 무적 gate는 reviveIframes다. ‘잠행 무적 완료’로 확대하지 않음 |
| _ptAng/_ptT,_grabAng/_grabWindMax,_spinAng,_atkParryable,_druidFanWindMax,_telegraphT/_R,_tpFlashT,_teleDropY | 37703/37714/38013–38019; 38586; 38772; 41327–41335 | 패턴 경고·독 흔적·telegraph용. 실제 이름별 전체 참조는 부록 C; 보호된 parry 분류값은 변경하지 않음 |
| deaths,_revPts,_maxRevPts,_reviveTimer,_bossRevJudged,_bossRevived,_bossReviveVFXPending,eShield/eShieldMax/eShieldRegenT | 31180–31184; 42412–42630; 38589 | 사망/부활의 다른 소유자. [기존 추적 §1.3](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md#13-보스-즉시-부활폴백피날레) 및 이번 §2.6 참조 |
| _spawnT,_bossSkinPending,_boss8dir 등 스킨 상태 | 31359–31361; 23150 이후; 20199; 53553 | body fallback·fade·skin 준비 상태를 실제 에셋과 확인해야 함. 보스 actor 이식 확인과 단순 에셋 파일 존재를 구분 |
| G._bossRef,bossAlive,_bossArena,_bossArenaEntry/_Exit,_bossLoadPhase/_T/_Fade,bossGate/bossGateOpen/bossSealed,_bfxT/_Bolt | 30749–30814; 19967; 41784–41926 | arena/session 소유. 전역 _preArenaBackup도 함께 소비(30752–30755). 필드보스 지역 모듈의 boss 문자열과 장 보스 actor는 별개 |
| G._pStats | 32685–32701 + 각 행동 증가 지점 | 60f창 parryRate=pH/pA,dash=min(1,dC/10),heal=min(1,hC/5),aggro=min(1,atkC/30),kite=min(1,kiteC/max(1,atkC)); 카운터 .8감쇠. 원 입력/QE writer는 **보호** |

## 2. 함수·무브 실행·UI·저장 추적

### 2.1 매 tick 순서와 Utility/콤보

| 원본 행 | 함수·분기 | 정확한 소비 순서·공식 |
|---|---|---|
| 38584–38635 | updateE 초반 gate | 레슨 skip→telegraph감소→벽 pushout→reviveIframes 자연감소→KB/벽피해→hitstun return→stunned return. 주석의 ‘상태 무관 phase check’도 이 상위 return을 통과한 경우만 실행 |
| 38637–38705 | 이동·상태·공통 어그로 | 이전 위치/_moveHold로 이동 표시→freeze면 return→상태 타이머→일반몹만 poise 자연회복. reviveChase와 LOS800 어그로, NORMAL드루이드 charge 중/준비 잔여18+sp의 공통 facing lock. alerted idle/recover는 etype0 사거리 기준 flow추적×2 등 공통 이동을 **보스 idle 이동 전에** 수행하고 d를 재계산. 이 경로도 떼어내지 않음 |
| 38771 / 38874–38884 | ATK/charge/시계 | normal atk=baseAtk로 매 tick reset→aura적용→`_tickProjCharge`→st2-=sp. phase ATK×1.3은 이후 phase tick에서 쓰이고 다음 reset으로 영구 누적되지 않음 |
| 40444–40454 | 보스 dispatcher | frozen idle return→phaseCheck→finaleUpdate(현재 false)→idle인 경우 idleMove 후 bossAI→끝난 Wind feint취소 recover25→같은 tick 상태 switch |
| 37650–37668 | `_bossScore` gate·거리·반복 | cage/phase/Set 탈락 -1, CD>0이면0, **이 단계까지 RNG0**. mid=(min+max)/2,span=max(1,(max-min)/2),D=exp(-((d-mid)/span)²). 같은 기술의 history 모든 등장에 age0 .15/age1 .28/age2 .45/나머지 .70을 누적 곱 |
| 37669–37692 | score 보정 | parryRate>.4 & canFeint +.5; dash>.5 & aoe +.3; heal>.3 & gap-close +.4; kite>.3 & gap-close +.5/cc +.4; aggro>.5 & punish+.5/aoe+.3. retreat gap+.6 / approach ranged+.4 / engage melee 또는 aoe+.3; d<130 slash/slam/sweep+.8, d<80 slash+.6. combo target +2.4; phase>=3 aoe+.3/multi-hit+.2, phase<=1 utility+.2; lastMoves에 없으면 novelty+.35 |
| 37693–37696 | 최종 score | `(D+repeat*.6+counter*.7+combo*1.2+phasePref*.5+novelty)*(.85+u*.3)`→si2 얼굴 +2→si0/3 meleeStreak>=3이고 ranged 또는 ambush이면×3.0. 주석의 계수1.0과 실행값3.0 구분 |
| 38315–38355 | `_bossIdleMove` | speed×phase.spdM×aSpdM×sp; d>200 flow 접근 boost=min(2.5,1+d/300), 50<d<=200 orbit R=max(80,150-phase18)/속도×.7, d<=50 뒤로+.4rad 회피. XY→X→Y fallback은 각 분기 원 순서 보존 |
| 38357–38371 | idle 자동탄 | _idleRBT+=sp, interval=max(18,40-phase5), d<1200; count1+~~(phase*.5), 각 aim jitter .5, speed2.5+u1.5, rawblack/red atk1.5. spawn 후 밀도·피해 배율은 §2.4 |
| 38373–38387 | `_bossAI` 시작 | 실제 호출은 idle에서만. 명시 idx 배열의 0..58만 CD감산→stun/idle검사→engDist180-phase20→d>engDist+30 approach/d<50retreat/elseengage→patT-=sp→patT>0 또는 d>500 또는 d<20이면 return; avgDist=.95old+.05d |
| 38389–38402 | 진행 중 콤보 | 다음 id의 phase/Set/CD 검사→idx++→CD=mv.cd*cdM→patT=~~(6+u6)→history/streak→조건부feint draw→조건부delay draw→start/return. 실패하면 seq=null,idx0 |
| 38404–38424 | 새 기술 선택 | 전체59 ordinal 순 score계산, 양수만 후보. 후보>1이면 점수 내림차순 **상위6개 가중 추첨**. max(.001,score)합×u에서 순서대로 빼며 <=0 선택. 최대점수 한 개로 고정하는 AI가 아님; 동점 순서는 원 배열 안정 순서 |
| 38425–38441 | 선택 이후 RNG | debug기록→history최대5/streak→명시idx CD→patT=(patCd+u15)*cdM→u<comboC면 firstid/phase/전체Set 필터 후 후보 존재시에만 추가u 추첨→canFeint 조건부u→canDelay>0 조건부u와 성공시 ~~(mv.tele*canDelay)→start |
| 40483 / 40498–40517 | generic idle 후속 경로 | _bossIdleMove 뒤에도 s가 idle로 남으면 일반 idle의 전진 speed×1.6이 적용될 수 있음. etype0 접촉은 d<r+Pr+8, st2<=0, iframe<=0에서 atk*.8, st2=40+~~u20. projCd50의 generic차징60도 존재. 보스 전용 이동만 떼어내면 이 중첩을 잃음 |
| 41375–41383 | bossRec/recover | recover는 ib일 때 st2>20을20으로 제한; <=0이면 idle, st2=3+u5. bossRec은 클램프 없이 종료. 개별 metadata rec는 이 switch의 실행시간과 같지 않음 |

### 2.2 HP 페이즈 전환

| 원본 행 | 전환 처리 |
|---|---|
| 38236–38245 | hp/mhp가 >.8/.6/.4/.2일 때 phase0/1/2/3, 나머지4. 경계 정확히 .8은1. 새 phase가 기존보다 클 때만 진행, 건너뛴 phase를 여러 번 순환하지 않음. hp=max(hp,~~(mhp*ph.hp[1])) |
| 38247–38259 | iframe90; normal atk=~~(atk1.3),speed=min(speed1.15,1.8+phase.1),maxPoise=~~(maxPoise1.2),현재poise 유지; patCd=max(20,~~(patCd*(.9-phase.05))); stunned0,recover45,patT10,combo/feint/delay/resetCD. 이후 recover20상한과 다음tick atk reset을 함께 이식해야 함 |
| 38271–38283 | P.facing+π+(u-.5)*.8,거리80+phase25로 등뒤이동; canMv 실패시 P뒤50 safePt; 출발/도착 입자·플래시8·연기·충격·볼트 |
| 38284–38314 | 충격반경100+phase30,피해~~(atk*(.4+phase*.1))를 `hurtP(...,{dtype:'magic'})`에 전달(elMul 선곱 없음),KB10. 8+phase4발 방사,짝수 redBean/홀수 일반탄에색상HSL을지정하며 **blackBean flag 없음**. spawn 후처리·텍스트·_reviveVFX·hitStop·slowMo max60+phase15·shake14+phase4·120ms후포효. 부활 자체와는 다른 HP phase transition |

### 2.3 1장 24개 기술의 start→state→종료

아래 피해는 별도 표시가 없으면 **spawn 전 raw ATK 배수**다. 실제 hurtP의 방어/원소/무적·탄 후처리는 별도 의존이며 **Q/E 보호**다. 각 전조 기본값은 부록 A의 tele×phase와 extraDelay를 먼저 적용하며, `tele||fallback` 순서를 유지한다.

| ID | start 행 | 실행/종료 행 | 원본 실행 계약 |
|---|---|---|---|
| burst | 37713 | 40562–40569 | Wind→전방위 `~~(max(10,6+min(si,6))*(1+(phase-1)*.12))`발. phase0=8발로 ‘최소10’ 주석과 다름. black/red 50/50, rawatk1.5/2.5,life400;recover50→20상한 |
| fan | 37714 | 40646–40662 | NORMALdruid 기본12, 타보스10에 phase식. 각 phase 기본 요청10/12/13/14/16(드루이드). 폭π(.7+phase.06),외곽lane<.28/>.72 physical,중앙magic,phase>=2 i%4==1black; rawatk1.3/black1.5,life400. QA opt-in만12발·8물리/4마법·준비중aim추적. recover45→20 |
| charge | 37715 | 40664–40688 | NORMAL 드루이드 마지막18f 방향고정; 실행50f,speed35*sp, canMv XY/X/Y. 벽막힘 일반shockMax800/t20; 접촉 r+Pr+80,atk2·KB12,recover40→20. generic eCharge의 속도/피해×30 규칙과 다른 상태 |
| jump | 37716–37721 | 40690–40708 | 시작에 목표/원위치 저장·전조→40f비행(전반.3/후반.7 보간)→착지shockMax800+si50/t25,거리300에atk1.8/KB15 |
| shock | 37722 | 40749–40758 | max1000+si50,t30,R+=4.5sp,반경차<18일 때atk1.4/KB8;max 또는t종료recover55→20 |
| summon | 37723–37727 | 40798–40814 | 3+~~(si*.5)명,방사거리50+u30,etype `[0,2,3,3,3]` 추첨·6원소; mkEn child hp/mhp×.5,shield/max0;recover70→20. generic spawn-hole와 다른 생산자 |
| grab | 37728–37729 | 40837–40867 | d<120이면grabWind,아니면chargeWind;준비 접근speed×1.5;포획거리r+Pr+200;성공60f,강제P위치/KB0,st2%10===0마다atk.4,끝throwatk1.8/KB18/iframe30;recover70→20. 손상 계약은 보호 접점 |
| spin | 37730 | 40869–40889 | active50,angle+=.35sp,R500+si15,매8간격raw탄atk.8,매12간격근접atk1.2/KB6;recover55→20. %모듈로 조건은 sp분수에서 매정수tick과 다름 |
| mine | 37731–37732 | 40891–40903 | 3+~~phase+~~(si*.3)개,거리60+u80,rawatk1.6,EL.D,life180,sz5,정지 mine;recover50→20 |
| multiDash | 37733 | 40942–40977 | 횟수4+~~(phase1.5),첫active12,후속10+~~u5;speed9sp,재조준jitter.4,거리r+Pr+10에atk1.3/KB8;recover25→20 |
| slashCombo | 37734 | 41074–41109 | 횟수3+~~(phase1.5),첫slash10,후속8+~~u4;진행.3.. .7/각차<1.2/거리r+Pr+300,전진2.5sp,각타atk1.5/KB7;recover25→20 |
| slam | 37735 | 41111–41142 | wind중 d>50 접근1.5sp→active8→R1000+si30+phase80에atk2.2/KB14;recover40→20. shockR/max 기록만으로 추가 shock 상태를 생성하지 않음 |
| sweep | 37736 | 41144–41183 | active14,진행.15.. .85/각차<1.7/거리r+Pr+400,atk1.8/KB10;phase2+ 5발 wind탄atk.8;recover30→20 |
| tailSwipe | 37737 | 41144–41183 | si2 전용idx57. sweep 실행을 재사용하고 _isTail=true,문구/시각 꼬리 분기. 별도 actor 무브를 발명하지 않음 |
| burrowStrike | 37750–37754 | 41047–41072 | si0/3;Dive→Under45→Erupt40;일반잠행 목표 .06sp추적,원위치→목표 보간;분출8f후1회 R=r+120/atk2.2/poison+4/webSlow>=90/KB14;recover30→20. e.iframes50/5가 곧 hurtE 무적은 아님 |
| beanStorm | 37755–37758 | 41185–41205 | 3+~~phase웨이브,첫8/간격10+~~u6,발수5+min(~~(si*.3),4)+phase,spreadπ(.5+phase.1),jitter.15,black입력speed4.4/red2.5+u1.5;blackatk1.5/redatk2,life400/350;recover25→20 |
| chaseAoe | 37759–37768 | 37015–37052 | 추적AOE queue 생성 후charge로 연계. 10개,간격60,delay90,R450,atk2;폭발후15f잔상. src가 죽었다고 자동으로 queue를 즉시 삭제하는 코드로 가정하지 않음 |
| elemBall | 37769–37791 | spawnProj/투사체 tick | 10+~~(phase1.5)발,폭π*.55,speed6,r16,rawatk3,life400. NORMALdruid magic·straight wrapper,일반 경로와 분리. 입력 homing과 최종instance값은 후처리까지 확인 |
| groundFissure | 37931–37948 | 37067; 57819–57871 | 개수 phase0=1/phase1~2=2/phase3~4=3, maxLen=`~~(Math.max((G.mw\|\|50),(G.mh\|\|42))*T*.45)`,spd20,w140,maxT140,atk2,explR=min(750,maxLen*.3). 머리 P추적·최대길이 도달1회 폭발/KB10 |
| tideWave | 37949–37963 | 37069; 57872–57913 | 2+min(phase,2)개,초기R20+ti8,maxR1750,spd15,maxT120,gapAng랜덤,gapSize.8,w60,atk1.5,hitT10간격. 보호된 기존 패링 분기 의존 |
| seekerMines | 37964–37978 | 37071; 57914–57944 | 3+min(phase,2)개,spawn반경20,초기단위vx/vy,spd1,arm60,max360,r60,atk2,EL.D,hp1. arm이후가속.02sp/속도상한1.5. 드루이드면 피해EL.P/poison표지;보호된 반사 분기 존재 |
| poisonTrail | 38013–38019 | 41327–41335; poisonPools tick/render | bossPoisonDash50,전진5sp,8간격 poolR175/maxT240/rawatk.3. _poisonPools는 37079에서 tickT60마다 raw*.5 원소 피해, si0/3이면 poison+2/webSlow>=60; 57990–57999에서 표시 |
| lavaPools | 38085–38117 | 17248–17251; 37129; 57521 이후 | 드루이드3점=P+진행축120,양옆±360;R150,warn55/73/91,max300,rawatk.9,recover25. si1 일반은8+phase3회시도/safeN3-~~(phase/3),safe반경180회피,R600+u300,warn90,max420,rawatk1.2,recover35. 실제tick피해는lp.dmg*.4,30f간격 |
| rapidMissile | 38212–38230 | spawnProj/투사체 tick | 3+min(phase,3)발,spread.15,speed14+phase2,rawatk2,life300,homing=true,sz3;recover30→20 |

### 2.4 투사체·장판·생산자 이후 의존

| 원본 행 | 함수/배열·데이터 | 추가로 보존할 동작 |
|---|---|---|
| 16947–16995 | spawnProj / pool | reset→props복사→dark 준비→독 원 class보존/EL.P/green→분류→life. 적 이동탄 밀도1/3(global _eProjDropCnt),sz×2/r×1.3/speed×1.8/dmg~~×2,red 피해~~×.5/speed×.7,프로필 속도정규화. _commit/_druidParryVolley/thorn은 drop만 면제. 정지 mine은 이동배율 미적용 |
| 16996 / 17253–17260 | hurt wrapper·homing | druidPoison·projectileHitSfx·mouthProjectile 전달. black turn=.0058125,elemBall=.007275,physical=.00109083,기타.00655 등. **분류/QE 보호** |
| 20122–20155 / 40507–40517 | generic charge shot | 일반탄 차징60을 모든 boss에도 배제하는 guard 없음; _commit로밀도면제·spawnProj직접·발사후차징취소. _spawnBossProjectile로 일괄 치환하면 독속성/분류가 바뀜 |
| 17043–17046 / 37080–37104 | 독립 드루이드 리듬탄 | si0/3·bossAlive·살아있는 bossRef·!finale. AI의 idle 여부와 별개로 G._druidParryT+=sp; interval=90-phase*6, count=5+phase. interval-20부터 경고, interval 도달시 타이머에서 interval을 빼고 폭π*(.42+phase*.03)으로 rawatk*.35/speed6/life240/sz2/r10/fireMagic/_typed/_druidParryVolley 탄 생성. drop만 면제, 다른 spawn 후처리는 적용. **Q/E 분류·판정 보호** |
| 37106–37126 | 독립 드루이드 ORB | si0/3·bossAlive, G._druidOrbT 증가; 살아있는 !finale bossRef가 있을 때 90~110f 집광,110f에 timer0/3발,각도±.14/속도6.8/r26/rawatk*.6. 별도 G._druidOrbs `{x,y,vx,vy,t,r,dmg}` 이동·t>460/맵밖40 제거. 접촉시 R90 적 AOE=max(40,~~((dmg 또는60)*1.2)),VFX; 실제 isPWin 분기가 있어 주석 ‘미체크’와 다름. 실패·P iframe<=0이면 player 피해/poison3/webSlow80. **Q/E 보호**, 성공 규칙 변경 제안 없음 |
| 19972–20005 | _poiseHit/_poiseReset | 보스 _pImmune>0이면 체간 감소 거절; poise-=amt,0이하면 max로 stun90/_maxStunned90·immune300·FX. reset은poise=maxPoise/poiseR0. 공통 입력/피해 소유자 의존이며 **보호** |
| 37015–37052 | G._chaseAoes | 부모 `{src,cnt,maxCnt,t,interval,r,delay,dmg,el,druid,zones}`;자식 `{x,y,r,t,delay,dmg,el,hit,explT,explMax,druid}`. 원 위치추적·폭발·잔상제거 순서 |
| 37067 / 37069 / 37071 | G._fissures/_tideWaves/_seekerMines | 각 push 구조는 §2.3 start행. update/render 배열압축 순서,폭발/반복타격/arm/소멸조건을 별개 계약으로 추출 |
| 37129 | G._lavaPools | `{x,y,t,warnT,maxT,r,dmg,el,tickT}`; t>=warnT일 때tickT증가,플레이어가 범위안·iframe<=0·tickT>=30이면tickT0/hurtP(~~(dmg*.4*elMul));밖에서는 누적tickT를매번0으로바꾸지 않음 |
| 41327–41335 / 37079 / 57990–57999 | G._poisonPools | poisonDash가 만드는 `{x,y,r,t,maxT,dmg,el,tickT}`와 별도 tick·render;동일 이름의 플레이어 독장판 생성자와 보스 생산자를 구분 |
| 30764–30770 / 31556–31558 / 63487–63489 / 64283–64285 | 배열 reset | arena 진입·initStage·로드·테스트베드 진입에서 잔류 배열 정리. 한 번의 arena 초기화로 모든 lifecycle을 대체하지 않음 |

### 2.5 몸체·전조·음향·HUD·카메라

| 원본 행 | UI/함수/자산 | 추적 내용 |
|---|---|---|
| 10739–10761 | `_CODEX_BOSS`·로더 | si1 mushroom PNG dw6.6/dh8.6,si2 aberrantPNG dw7/dh8.4,si3 druid_f0 dw9.3/dh14.1/use2D/anim. si0은si3와동일spec. 잔여 stage1 legacy loader의 _codexBossImg[0]쓰기와 비동기로딩fallback 실제우선순위는 화면 **미확인** |
| 10763–10803 / 10891–10977 | motion·druid sprite | death/hurt/slam/slash/wind/walk/idle모션선택. idle8dir v3 PNG1656×1240/sha256 ceb3843fc1d612601b63dcb33035298da9b92d4ae39e88d986805ec4216e1549;dirMap[6,7,0,1,2,3,4,5]. base8 4×2;walk/attack4×8,floor(now/150)%4;dive/emerge4×2,transform8×1,beast4×2. source rect 반올림·aspect·발밑anchor·nameTopOff·breath·lighter·btScale역보정 포함 |
| 10809–10897 / 19398–19608 | clip·VFX | pool/orb JSON+PNG clip/sampleAtlasClip 및 hit/roots/dust/shockring 로더·준비 gate·fallback. 본체4frame의now/150과 VFX clip24FPS를 동일시하지 않음 |
| 10906–10977 / 10980 이후 | draw/fallback | 잠행시 몸체숨김/흙더미,분출·형태전환·beast분기. _BOSS_GLOW=false. _btScaleMul=4는 테스트계통값으로 실제 r=44와혼동금지. use2D보스와three overlay 별도 |
| 20196–20217 / 23150 이후 / 53553 | skin/body caller | pending boss skin 재시도→drawEnBody facing write→보스 본체 선택에서 _drawCodexBoss. 파일이 있다는 이유로 Godot sprite 소비가 있다고 판단하지 않음 |
| 52911 / 53078–53090 / 53221 이후 / 53462–53474 | 보스 전조·phase aura | slam R1000+si30+phase80,fan기본 tell 폭π.6와실제발사π(.7+phase.06)는 다름;thornopt-in만폭/실제windMax연동. grab경계r+Pr+200. phase aura강도[0,.2,.35,.5,.7]/phase4강조. 나머지선/원/범위필드는 부록 C·start/state행으로연결 |
| 54073–54093 / 61507–61613 | 독탄 렌더/히트 | 드루이드 독탄 일반 glow제외→_drawDruidPoisonShot;fly4×4/floor(now/70)%16,마스킹·실패fallback;ownQA thorn 별도procedural renderer. VFX clip hit loader/render 분리 |
| 54591–54602 / 57107 / 57481–57549 / 57819–57999 | 지면/clip render | druid hit/roots/dust/shockring clip 우선/fallback,AOE ring,독늪clip,균열/해일/추적지뢰/poisonpool. visual PASS는 현재 없음 |
| 24758–24764 / 24818 / 30812 / 38308–38312 / 41808–41809 | `_BOSS_SFX` | si0 howl/die/hit/hurt pitch .7/.7/.7/.7,si1 1.3/1.2/1.3/1.2,si2 howl1·1.1/1.0/1.1/1.1,si3 .55/.55/.6/.55. 실제 helper소비는 입장/phase howl과사망die에서확인. hit/hurt 프로필 정의를 실제호출인수로확대하지않음. 사망은 _playSampleNow로 큐우회/vol .75*sfxVol/pitch±.15. 표주석옛이름은이름권위아님 |
| 4001 / 4208–4211 / 10383–10400 / 64224 | BGM | 공통boss/finalboss와hell별boss경로가공존. stageKey(si)=hellN;테스트베드 `{hell:SI_TO_HELL[si],boss:true}`. 단순히stageKey를boss곡으로바꾸지않음. 전용피날레3막선택은도달불가함수종속. 사운드 전체카탈로그는TRACE-SOUND소유 |
| 35877–35881 | 보스 BGM 실선택 | 살아있는 일반 bossRef면 STG.isHellBoss에 따라 si0/1/2=`boss`,si3=`finalboss`;현재 death 음악이면 덮어쓰지 않음. boss 없음이면 boss/finalboss에서 stageKey로 복귀. 피날레부활중예외는 현재 도달 불가 gate에 종속 |
| 380–399 / 2701 / 35827–35885 | bossBar·상태HUD | DOM bossName,bossHpF,bossShieldF,bossPoiseF,bossPoiseLbl,bossStatus. 새보스참조시cine180/introFill0,HP90f채움;일반이름+deaths문구. **shield폭은항상0%**. poise정상남은비율/그로기stunned/max/immune300바;상태아이콘6f주기 |
| 35721–35747 / 부록 C | 카메라·포인터 | 일반 보스 중점 .5/.5+lookahead .3, zoom target .8과 피날레 frame/inversePointer를 구분. activeQA외부camera제약의실제소비는해당모듈확인필요. 수치·화면검수는 **미확인** 범위를남김 |
| 41784–41814 / 55415–55424 | 입장·이름카드 | arena load phase1 fade50→phase2 name130→phase3 fade50→phase4입장100. 첫입장stun90/iframe110·32입자·광원·포효. 별도cine180은slowMo일때.35시계,상하blackbar/30f후이름fade. 옛‘7초단일시퀀스’와구분 |
| 60420–60455 / 64233–64274 | debug/testbed | bossDebug score행·PS rates·forcedPattern/phase/scale UI. 강제선택성공을자연AI선택성공으로세지않음. 설정저장은 **보호** |
| 65613–65671 / 65675–65688 | 외부 engine JS 연결 | explicit legacyRig/revision gate의dark-druid-slam-bridge,ownQA의druid-encounter-qa,parry-contact/native-perspective QA. getState/getBossBounds/getProjectileBounds/forcePattern/setPhase/saveNativeSettings callbacks. 기본본편Godot포팅으로간주금지;외부JS전체내부추적은 **미확인** |

### 2.6 사망·클리어·세이브·index.html — 보호 경계

| 파일·행 | 필드/함수 | 확인 결과 |
|---|---|---|
| game.html:42412–42630 | hurtE 보스 전용 죽음·즉시 부활·180f timer·폴백 | 기존 부활 추적 §1.3 소유. deaths,revPts,reviveIframes,atk/speed/poise등과combo/phase reset을소비. 이문서에별도중복구현단위없음 |
| game.html:42515–42538/42547–42622 | 즉시 부활 상세 참조 | 원확률=max(0,2+si*.05-(deaths-1)*.15-suppress),points 먼저 차감. 성공 HP100%/shield0/phase0/iframe90/몸축소·이동·공격/VFX. 원baseAtk와현재atk의수명도기존추적·38771reset과함께확인. 신규이중구현없음 |
| game.html:42640–42649 / 34493–34535 | 폴백 예약/resolve | timer180·원좌표/chance/roll보관→종료시에저장판정소비;일반성공 추가10points/HP50%/shield0/iframe90,recover60. 실패후문열림판정은다음30poll. 기존추적소유 |
| game.html:34348–34349 | 보스 몸통 겹침 | alive ib와플레이어의r합안이면 radialpush,canMv(P.r) 성공시에P좌표변경. P charge/bladeDash 제외는 **보호된 이동 접점** |
| game.html:19967 / 41816–41838 | findBoss·클리어poll | alive ib cache;30프레임마다arena에서살아있는보스검색,없어도 `_reviveTimer>0`이면유예. 최종없으면bossAlive=false,clearT=floor(stageTime/60),_killedBosses에etype기록,chest생성. 모든네보스etype0이라이기록을고유si목록으로오인하지않음 |
| game.html:41840–41926 / 43896 | 출구·nextStage | arena exit열림/진입gate·stageclear·chapter이동·demoEnd. 현재demo는laststage0에서종료;자연demo로si1~3도달을완료검수로주장하지않음 |
| game.html:42020–42067 | G._clearRecords[si] | `{t,s,r}`best기록merge와clearT스냅샷. **세이브 형식 보호**,새필드제안없음 |
| game.html:41921–41985 | 보상·장클리어 필드 | 출구진입 stageCleared/SP+10,조건부taRecords·장마지막hellCleared[hellIdx]=true. 보상·메타진행전체는TRACE-META소유;저장형식 **보호** |
| game.html:3543–3557 / 3612 | 기본직렬화/복원 | player.apBossCleared/goddessGift,game.stage/kills/taRecords/clearRecords/comboMax/playTime/cutsceneDone,hellCleared. 보스개체HP/phase/Set/history/CD/queue는이저장객체에없음. apBossCleared의보스보상실쓰기전체경로는 **미확인**,형식은보호 |
| game.html:62005–62006 / 62135–62145 / 63908–63916 / 64065–64073 | 나머지저장생산자 | producer별필드차이존재;기본생산자를근거로5개모두동일하다고가정하지않음. 모든형식은SAVE추적소유·**보호** |
| game.html:30150–30203 | zone save/runtime restore | alive ens의x/y/hp/mhp/etype/el/r/atk/baseAtk/ib/lv 일부만내부스냅샷. 디스크세이브형식이나완전bossresume가아님. bossAlive/_bossRef/_bossArena/_bossLoadPhase 재설정 |
| game.html:6311 / 48876 / 49075 / 49379 | bossDebug설정 | 원settings구조내bossDebug,체크박스저장/복원. SETTINGS추적·**보호** |
| index.html 전체1–4742 | 직접boss실장검색 | `boss,druid,보스,다크드루이드,hellCleared,apBoss` 대소문자무시검색의직접일치0. BOSS_MOVES/HP/AI/보스HUD/개체저장생산자없음 |
| index.html:3092–3095 / 3144–3149 / 3545 / 3585 | 로비간접진행표시 | 슬롯의game.stage/플레이어lv 읽어카드라벨·진행표시. 보스별개체상태소비없음. 해당슬롯형식 **보호** |
| index.html:4348 / 4732 | game진입 | demo/test/char/slot URL생성및게임전환. URL진입이피날레gate활성화증거는아님 |

### 2.7 남아 있는 피날레 전용 함수·상수 — 현재 도달 불가

| 원본 행 | 정의/역할 | 남아 있는 계약 |
|---|---|---|
| 17043–17064 | parryVolleySpec/ROUNDS/ATK/isFinale/Hp/Atk/ReviveChance | phase별웨이브규격;3막순서 `[druidVolley,charge,slashCombo,lavaPools]` / `[lavaPools,charge,burrowStrike,druidVolley,slashCombo]` / `[druidVolley,charge,burrowStrike,lavaPools,slashCombo]`;ATK[1,1.12,1.25,1.4,1.6];HP=max(1,floor(22278*(1+.055n+.0015n²)*dm)),n=max(0,L-1) |
| 17066–17088 | revive/retry/intro | 35% HP/points0/phase3/lastStand/ATK1.6/rest90, 잔류 적대 독탄 정리; retry enterArena(true), intro60. 현재 일반 경로에서 도달 불가하므로 normal si3 HP를 이 값으로 대체하지 않음 |
| 17089–17141 | actcard/frame/mouse/finish/victory | card120, zoom .3.. .8, 거리1100 gate, pointer 역변환, 승리 플래그·잔류 공격 정리·문구. 현재 화면 검수 없음 |
| 17142–17204 | Act/NextMove/Volley/TrackBurrow/AI/Update | phase0/1→act0,2/3→1,4→2;원거리 slash를 volley로 대체;wind48,life90,rawatk.35,1/2/3waves;burrow 잔여22에서 목표 고정;AI 거리650,rest48 또는96,phase rest90 |
| 17205–17246 | finaleRing/Tell/Pool | 전용ring·돌진/잠행표적tell·투명독늪. 일반NORMAL의전조·장판renderer와분리 |
| 31148–31149 / 37706–37710 / 38249–38269 / 38374 / 40448 | 연결호출 | 모두 `_isDruidFinale`종속. caller가있음과실제로실행가능함을구분 |

피날레 수치의 세부 부활·신성력 판정은 기존 REVIVE_SHIELD 추적 소유다. 후속 단위는 이 gate를 바꾸거나 피날레를 기본 모드로 켜지 않는다.

## 3. 설계 문서 ↔ 원본 불일치 표

불일치는 **표로만 보고**한다. 설계 파일의 과거 본문·최신 override·실제 구현·옛 QA 결과를 구분하며, 아래 행은 수정 요청이 아니다.

| ID | 문서·행 | 문서 내용 | 현재 원본 근거·차이 | 판정 |
|---|---|---|---|---|
| D01 | `8.1/BOSS_BATTLE_SETTINGS.md:31–39`, `DARK_DRUID_FINALE_PACING_v04.md:3–33`, `DARK_DRUID_DEMO_FINALE_DESIGN.md:3–58`, `DARK_DRUID_FINALE_QA_20260909.md:3–5` | demo/bic마지막si3피날레활성·3막·전용식 | 16646의lastStage0과17055의stage3동시조건불가. 함수·전용식은존재하나현재도달불가 | 실행gate불일치. 옛QA합격은현재도달증거아님 |
| D02 | `BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md:8–11/34`, `BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER.md:8/20이후`, `BOSS_BATTLE_SETTINGS.md:39/224–227` | 최신header드루이드우선이나옛본문흑요염/사냥꾼/기생수잔류 | 16689 names=[드루이드,독버섯거인,지옥기형,드루이드],9967si0=si3. 최신override와코드는일치 | 이력/본문내충돌. 구이름으로신규actor제작금지 |
| D03 | `BOSS_BATTLE_SETTINGS.md:220/224–234` | 전체49종,si0기본18/no summon,si2cageTrap | 9820–9880 59등록,최종23/21/10/23,si0summon포함,모든Setcage제거. 37행override는금지일치 | 옛집계/표잔류,override우선 |
| D04 | `BOSS_BATTLE_SETTINGS.md:240이후` | 드루이드만cage금지/다른보스기존유지라는옛단락 | 10009–10010/37651/38020은전보스금지;37행최신문구는일치 | 문서내신구불일치,1장금지동일 |
| D05 | `BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md:46/746` | 충돌r22 | 31139r=(22)*2*1=44;BATTLE_SETTINGS240드루이드r44문구일치 | 이전스케일기록과현행구분 |
| D06 | `BOSS_00_FOREST_NORMAL_EYE_SENTINEL.md:451–490/604–611` | 등장7초시퀀스 | 41784–41814 50/130/50/100loadphase,별도cine180·slowMo시계(55416). 단일7초가아님 | 설계/구현차이·현재화면미검수 |
| D07 | `BOSS_02_FOREST_NORMAL_HELL_ABERRANT.md:13`, `DARK_DRUID_FINALE_PACING_v04.md:30` | bosstest보스남쪽10타일 | 30793–30795보스남쪽3*T=120px,카메라P.y-2*T. retry는별도safePt500 | 테스트배치불일치 |
| D08 | `BOSS_01_FOREST_NORMAL_POISON_MUSHROOM_GIANT.md:7` | 영문Poison Mushroom Giant | game.html번역등록은Toxic Mushroom Giant(부록 C). 한글·PNG·dw/dh는일치 | 영문표기불일치 |
| D09 | `BOSS_BATTLE_SETTINGS.md:193`, `ENEMY_AI_TEAM_MASTER.md:87` | phase ATK×1.3을강화로기록 | 38252의현재atk×1.3실행은존재,38771다음update에서baseAtk로reset. 영구누적강화로읽으면다름 | 적용수명차이. 값을고치지않음 |
| D10 | `BOSS_BATTLE_SETTINGS.md:101–111`, `ENEMY_AI_TEAM_MASTER.md:231–233` | 옛전역×8/3대신실제HP×24/pacing/ATK식정정 | 현재31119/31145–31152와공식일치. 참조옛행296xx는현재311xx로이동 | 수치불일치없음,행번호만시점차이 |
| D11 | `ENEMY_AI_TEAM_MASTER.md:87` | 보스근접사거리50+Pr+18≈68~70 | 현재genericidle접촉은r44+Pr+8(40500),패턴별r+Pr+300등별도. 메타range와접촉을혼동하면다름 | 범위명세불일치 |
| D12 | `BOSS_BATTLE_SETTINGS.md:29`, `9_적AI패턴디자인.md:112` | NORMAL fan직선·phase별요청/charge18f고정 | 40646–40662/40664–40688정의일치. 16964강제homing쓰기와별도후속straight추적제외를함께봐야함. 요청발수와밀도통과발수는다름 | 대조일치/후처리의존,새불일치로오인금지 |
| D13 | `BOSS_BATTLE_SETTINGS.md:6–25`, `9_적AI패턴디자인.md:451–477` | first옵트인12가시/Q미시험/자연fan미관측 | 16939ownQA+query/37714/40647–40657/65618이후gate일치. 현재일반본편기본12발보장기능이아님 | 조건·검수한계보존,전체완료아님 |
| D14 | `BOSS_02_FOREST_NORMAL_HELL_ABERRANT.md:11/15–28` | tele×1.4,face+2,tailidx57/sweep공유 | 37705/37694/37699/37737/41144일치;최종Set10개 | 일치. 신규독립꼬리동작제작근거없음 |
| D15 | `DARK_DRUID_DEMO_FINALE_DESIGN.md:52` | 옛 잠행 무적 설명을 실제 피격 면역으로 보지 말라는 주의 | 41050/41054는e.iframes,실제hurtE무적은reviveIframes(42120–42121). 주의문과 현재 코드 일치 | 옛 설명과 구현 차이·주의문은 일치. 부활 추적 중복 경계 |
| D16 | `exoduser-ai-first-pipeline-v3.1.md:314`, `참고_영문레퍼런스_AI디자인패턴.md:308–314` | HP50%rage/참고작cleave·groundwave예시 | 실제5phase(9951–9957/38238),24기술실행표와상이 | 제작pipeline/외부참고예시이며현행보스수치SSOT로채택하지않음 |
| D17 | `BOSS_BATTLE_SETTINGS.md:131–146` | `_doPoise(e,amt,stunT,label)`로 체간 적용, 외부 stunT를 설명 | 현재 정의는 `_poiseHit(e,amt,label)`(19972–19998),보스 기본stun90/일반180을 내부 선택. `_doPoise` 직접 일치0 | 함수 이름·인자·기본시간 명세 차이. **Q/E 보호**, 변경 제안 없음 |
| D18 | `BOSS_BATTLE_SETTINGS.md:197` | phase 방사탄이 빨콩50%+무지개50% 교대 | 38295–38299는redBean/일반HSL색탄교대,blackBean없음;16957에서rainbow는blackBean전용. 입력색과실제탄종을구분 | 등록/실행 분류 차이 보고만. **Q/E 보호**, 판정 변경 제안 없음 |

위 표의 `8.1/` 약칭은 `docs/8.1보스디자인바이블/`, AI 문서 4개는 `docs/9적ai패턴디자인/`다. 두 폴더의 12개 파일 모두 대조 대상에 포함했다. 독립 참고 문서는 구현 완료 증거로 사용하지 않았다. 모호한 과거 작성 의도·옛 QA와 현재 브라우저 환경의 동일성은 **미확인**이다.

## 4. 실제 Godot 의존과 결손

### 4.1 파일 근거

| 상태 | 실제 파일·행 | 이 범위에서 확인되는 것 / 부족한 것 |
|---|---|---|
| 이식된 제한 factory | `godot/scripts/enemy_factory.gd:140–171` | 고정16레코드 중6개 exact profile허용. etype0 flesh도고정id/order/좌표를검사;ib보스생성허용이아님 |
| 동적일반몹생산자 존재 | `godot/scripts/native_spawn_hole_system.gd:21–24/70–87/659–693`; `world.gd:2920` | mkEn난수/초기값과동적등록기반. ordinary스폰용이며boss24배/패턴/si identity소유아님. summon의etype2/3/원소/childshield0를자동지원한다고볼수없음 |
| 피해 공통기반 존재·보스명시거부 | `native_normal_enemy_hurte.gd:133–151`; `enemy.gd:484` | reviveIframes기본gate있으나ib이면`unported_branch_active:boss_hurtE`;Ewave도`boss_hurtE_not_adopted`. 보스actor를일반mob로위장해우회하지않음 |
| 부분투사체기반 존재 | `port_modules/black_bean_projectile/producer.gd:29/704/822–826`; `port_modules/parry_blue_projectile/producer.gd:593/642–643`; `enemy_projectile_physical.gd:96` | 독표지·플레이어피해wrapper·일부black/blue이식. 드루이드적대renderer미이식주석존재. boss-emitter/밀도후처리전체/24기술생산자는없음. **Q/E 보호** |
| 원소·피해공식기반 존재 | `port_modules/combat_stat_formula/producer.gd`; `main.gd:2758` | 기존element authority와hurtP수식소비자. boss HP팩토리·전용phase강화는별도. 실제boss경로검수미확인 |
| stage/newrun상태부분이식 | `port_modules/source_init_stage_entry_owner/producer.gd:19–21/232/399–422`; `port_modules/native_new_run_bootstrap_source/producer.gd:89–104/281–288`; `native_source_new_run_state.gd:1–15` | druid키null/bossAlive/reset값존재. boss-test요청이면`unowned_boss_branch`로중단. bossArena진입본문·AI·승리는아님 |
| 지역/문 gate 부분이식 | `native_regions.gd:128/158–160/285` | arena에서는지역tick제외,fieldboss combat=false. 장보스전/필드보스전/지역문해제를서로대체하지않음 |
| 기존 Main/World 시계·화면 존재 | `main.gd:106/207–213/265/1002`; `world.gd:905/984/2920/2986`; `hud.gd:803이후` | Camera2D/native tick/적등록/HUD 기반. 현재장보스생성·AI·bossHUD·장보스clearadapter는찾지못함. Main연결을완료라보고하지않음 |
| 미이식 보스 내용 | `godot/`의 scripts/port_modules/tests를실제검색 | BOSS_MOVES/COMBOS/PHASES와동일한1장catalog·score·selector·24상태·보스전용actor·드루이드본체/장판render의제품소비자없음. 이름에boss/druid가든fixture경로·일반몹필드로완료판정금지 |
| 부활/실드 의존 미완 | 기존REVIVE_SHIELD추적 §3 + 위ib거부 | 일반피해의shieldabsorb검사는있지만보스즉시부활/180f재판정·최종승리와연결된장보스소유자는없음. 별도추적의후속단위소유로둠 |

### 4.2 실제 기존 테스트가 검증하는 범위(본문 확인, 이번 실행 0회)

| 테스트 파일·행 | 실제 핵심 단정 | 보스에 대해 증명하지 않는 것 |
|---|---|---|
| `godot/tests/test_encounter_factory.gd:13–24/99–118/192–193` | initial16/supported6/unsupported10,exactorders[0,1,8,13,14,15] | 보스팩토리·모든etype0/전체16실행·장보스전투 |
| `test_p3002_spawn_holes.gd:1–28/101/211/334/367–401` | 14굴/168분모,일정211…968,ordinarymkEn난수,etype0actor/hurtE·bossOrbit/erratic필드기록 | 필드굴과boss summon동일성,보스생성·HP24배·무브AI |
| `test_p1002e_melee_hurte.gd:1–13/215–266/320–330` | 실제일반적shield875흡수/overflow,기록된부활추첨순서 | boss_hurtE허용·부활실체·보스UI |
| `test_p1002f_dedicated_hurte.gd:456–457`, `test_p1002g_kislash_hurte.gd:361–367/430–440` | dedicated일반적흡수/overflow,원부활roll기록 | 보스공격및죽음파이프라인 |
| `test_p3003_regions.gd:31–33/50/75` | ib는지역kill제외,arena중지역tick제외,unspawnedfieldboss미완료 | 장보스kill→출구·chest·demoEnd |
| `test_p2002a_hud.gd` 및 현재hud.gd | 기존player HUD소비검사 | bossBar HP/poise/cine/부활명표·실드시각 |

테스트 파일이 존재한다는 것은 이번 세션의 PASS가 아니다. 기존 주석/보고서의 PASS도 실행 시점·scope를 그대로 유지하며 이번 보스 전투 인수로 합산하지 않는다.

## 5. 작은 이식 단위 순서안

이 절은 **다음 작업의 구현 지시서**다. 현재 코드 변경 권한으로 확장하지 않는다. 신규 경로는 예정이며 아직 존재하지 않는다. 공용 수정 줄 수는 **최소 접속 예산 추정(미확인)**이며 실제 허용 구역/충돌을 다음 fetch·작업판에서 재확인해야 한다. 추정 줄 수를 맞추기 위해 기존 코드를 압축하지 않는다. 각 테스트의 `SKIP/NOT_READY`는 PASS가 아니다.

### BC01 — 1장 보스 읽기 전용 catalog (즉시 착수 가능한 1번)

| 항목 | 구현 지시 |
|---|---|
| 목적/끝 조건 | 원본 최종 등록 집합과 정적 수치를 RefCounted 데이터 모듈로 옮긴다. 제품 씬·actor·시계·RNG·파일 I/O와 연결하지 않는다. 완료 범위는 catalog이며 보스 전투 인수와 구분한다 |
| 만들 파일 | `godot/scripts/native_ch1_boss_catalog.gd`, `godot/tests/test_boss_ch1_bc01_catalog.gd`. `.uid`는 Godot가 실제 생성한 경우 자기 파일의 것만 포함. 후속 docs 동기화는 이 문서의 BC01 상태·실행 근거를 구체화하며 보호 설계 수정 없음 |
| 수정 파일 | 기존 코드·테스트 수정 0. main.gd/hud.gd/world.gd/player.gd/native_normal_enemy_hurte.gd/native_source_new_run_state.gd **모두 0줄**. project.godot/autoload/씬/기존 tests 등록 목록도 0줄 |
| 원본 범위 | game.html:9820–9967,10009–10010,16633–16712,37699. 부록A의1장24기술·전체59 id/idx/ordinal표,phase5개,부록B의1장유효combo27개,최종 Set 4개를 전사. 초기 si0 선언을 최종값으로 사용하지 않음 |
| 데이터 형식 | 각 move의 원필드 11개를 보존하고 별도 `source_ordinal/source_line` metadata를 붙인다. range/phase/combo/tags는 순서가 있는 Array. 전체 59개 manifest는 id/idx/ordinal/line만 보유(타장 35기술의 실행 미소유). combo는 원 ordinal+seq+phase/line, 허용 27개만 보유하며 globalcombo_count=68도 기록 |
| 공개API(예정) | 아래 여섯 함수 모두 static: `source_receipt() -> Dictionary`, `boss_for_stage(si:int) -> Dictionary`, `moves_for_stage(si:int) -> Array`, `move_by_id(id:String) -> Dictionary`, `phase_by_index(phase:int) -> Dictionary`, `combos_for_stage(si:int,phase:int) -> Array`. 읽기 전용 스냅샷 반환·중첩 배열도 duplicate(true). actor 참조·RNG provider·save를 받지 않음 |
| receipt | source_main19a71357전체SHA/gameSHA256,global_move_count59/global_combo_count68/ch1_union_count24/max_source_idx60,구분설명. 부록Amanifest전체59에는idx30/59없음. 24개만재번호부여하지않음 |
| boss_for_stage | si0..3만`{supported:true,si,hell:0,name_ko,element_id:0,ib:true,etype:0,move_ids:[최종Set삽입순서]}`. si4/-1등은`{supported:false,reason:"unsupported_chapter_stage",si}`. `null=전체기술허용`의전역fallback을이좁은API에노출하지않음 |
| move/phase 오류 | 알수없는id는빈Dictionary,phase0..4밖은빈Dictionary. move_by_id는union24개만노출;teleStrike/cageTrap없음. 분류/QE규칙을새로평가하는API는만들지않음 |
| moves_for_stage | 각Set에들어가는move를 **원BOSS_MOVES ordinal오름차순** 반환. Set삽입순서가필요한호출자는boss_for_stage.move_ids를사용. 동일si0/3결과라도독립복사 |
| combos_for_stage | 부록B 27개중seq전체가최종Set에포함되고원phase가해당phase를포함하는것만원ordinal순반환. source mv.combo(다음기술보너스metadata)와BOSS_COMBOS의seq를서로합치지않음 |
| 옮길 상수/공식 | 정적필드정확전사만;별도HP·utility·delay·가중추첨공식은BC02~04. phase상수는전사하되phase계산은안함. Set복사/제거의 **최종결과**만고정 |
| 테스트1(개수/대응) | Set크기[23,21,10,23],union24,global59/68/idx60,si0와si3값일치·참조분리. tailSwipe si2만/idx57,burrowStrike si0/3만/idx58,si1 seeker제외,si0 teleStrike제외,cage전부제외. 근거9963–9967/10009–10010 |
| 테스트2(원값) | 부록 A의 24개 **모든 필드**를 테스트 내 독립 literal 기대표와 대조. 최소 앵커 burst idx0/tele45/rec40/cd140/range[0,999], fan idx1/tele25, phase0 spd1.15/tele.75/cd.5/feint.08, phase4 spd1.75/tele.25/cd.15/label 정확 문자. 기대값을 제품 API에서 복제해 만들지 않음 |
| 테스트3(콤보/순서) | phase별후보수si0=[14,23,25,25,25],si1=[14,22,24,24,24],si2=[9,13,14,14,14],si3=si0. phase조건제외한전체후보25/24/14/25. 예시charge→tailSwipe는si2만;seq/phase/ordinal전수대조·순서보존 |
| 테스트4(비변경/오류) | 반환move.range/phase/tags·boss.move_ids·combo.seq를수정한후다시읽어원값유지;다른si결과유지. invalidstage/phase/unknownid가명시거절/빈값. 테스트중Main생성0·RandomNumberGenerator/random호출0·사용자save/settings접근0 |
| 격리/실행 | USERDIR=`EXODUSER-BossCh1-BC01-Isolated-20261020`. 시작 때 ProjectSettings의 use_custom_user_dir=true 및 custom_user_dir_name 일치 검사. 불일치면 명시 실패·비성공 종료. 아래의 최소 임시 프로젝트를 자기 `_out`에 구성하며 저장소 project.godot 수정 없음. 실행 파일 실제 위치는 **미확인** |
| 실행결과 기록 | 성공assert수/실패수/skip수/exit/ERROR와로그경로·사용버전·원본SHA를남김. parse/import오류면실패로보고하고전역설정/다른WT/사용자자료를우회수정하지않음 |
| 선행/충돌 | 이문서와고정원본만필요. 신규2경로는작업판기준다른담당소유없음. 외부부활·스킬·사운드·지역모듈미완이어도이데이터단위는독립가능. 다음fetch에서동일경로가먼저생겼으면덮어쓰지말고BLOCKED/소유조정 |

BC01의 격리 검증 프로젝트는 `~/exoduser-wt/_out/trace-boss-ch1/BC01/project/`에 다음 구조로 만든다. 다음 구현 때 만드는 자기 신규 모듈·테스트 두 파일만 각각 `scripts/`, `tests/` 아래 동일 이름으로 복사하고 원 파일과 SHA256이 같은지 확인한다. 전체 Godot 프로젝트·Main·assets를 복사하지 않는다. 테스트가 참조하는 제품 모듈 경로는 `res://scripts/native_ch1_boss_catalog.gd`다.

임시 `project.godot`의 필수 내용:

```ini
config_version=5
[application]
config/name="EXODUSER BC01 catalog verification"
config/use_custom_user_dir=true
config/custom_user_dir_name="EXODUSER-BossCh1-BC01-Isolated-20261020"
```

확인한 실제 Godot 실행 파일을 `GODOT_BIN`에 지정한 뒤 실행할 명령 틀은 아래와 같다. 해당 변수는 자리표시자이며 이번에 실행한 명령이 아니다.

```sh
"$GODOT_BIN" --headless \
  --path "$HOME/exoduser-wt/_out/trace-boss-ch1/BC01/project" \
  --script res://tests/test_boss_ch1_bc01_catalog.gd
```

이 테스트는 SceneTree 스크립트로 결과 JSON의 assertions/failures/skipped와 exit를 내며, 실패·SKIP·assertion0을 성공으로 세지 않는다. 실제 실행 파일이 없거나 parse/import가 막히면 우회하지 않고 BLOCKED다. BC01은 게임을 띄우지 않는 데이터 계약 검사이므로 Main 회귀·대량 리소스 import를 이 단위의 필수 작업으로 추가하지 않는다.

### BC02~BC17 — 후속 단위별 파일·원본·검증·선행

각 단위의 신규 테스트는 표에 적은 USERDIR을 강제한다. ‘공용0’은 모듈/fixture 독립 검증까지의 범위이며 제품 Main 연결은 BC17이다. 모든 파일명은 **예정**이며 실제 소유 확정은 다음 배정 시 작업판으로 한다.

| 순서·범위 | 만들/수정 파일·공용 최소 구역 | 옮길 원본·상수/공식 | 새 테스트·핵심 독립 단정·격리 폴더 | 선행/충돌 |
|---|---|---|---|---|
| BC02 일반보스 생성 수치 packet | 신규 `scripts/native_ch1_boss_spawn_contract.gd`;기존수정0/공용0 | 9272/9276,31033–31037,31119–31184,31260–31261;§1.2의두floor/24배/.5속도/r44/points정확값. RNG는주입수열과source순서ledger,불필요ordinary난수소비0 | `tests/test_boss_ch1_bc02_spawn.gd`;Lv1HP네값/ATK46,Lv5002344661280,Lv5012343276000·ATK916,단계 보정, points200/206/212/218. `EXODUSER-BossCh1-BC02-Isolated-20261020` | BC01. enemy_factory/P3-002수정금지,spawn-hole의비보스소비수를boss로전용하지않음 |
| BC03 utility score 순수함수 | 신규 `scripts/native_ch1_boss_utility.gd`;공용0 | 37650–37699;§2.1전체식·gate RNG0·반복모든등장곱·얼굴+2·streak×3 | `tests/test_boss_ch1_bc03_utility.gd`;burst d499.5/phase0/history[]/combat빈값/ps없음/u.5→1.95;last[burst]→1.09;si2burst=-1/RNG0;같은표본si0streak3→5.85(실수 허용오차1e-12). `EXODUSER-BossCh1-BC03-Isolated-20261020` | BC01. ps는입력snapshot만;player/QE카운터writer보호 |
| BC04 선택기·콤보·RNG 순서 | 신규 `scripts/native_ch1_boss_selector.gd`;공용0 | 38373–38441;idle-call CD감소/거리20..500/상위6가중/조건부draw/last5/streak/명시idxCD | `tests/test_boss_ch1_bc04_selector.gd`;d19/501선택0,patT>0선택0,combo진행patT6(u0),cd=mv.cd*.5,history최대5;동점ordinal안정·끝점r0/top6외미선택·조건부draw개수sourceoracle대조. `EXODUSER-BossCh1-BC04-Isolated-20261020` | BC01/03. 기존전역RNG/normalAI를대체하지않음 |
| BC05 phase·시계 전이packet | 신규 `scripts/native_ch1_boss_phase.gd`;공용0 | 38236–38314,38584–38635,38771,38884,40444–40454,41375–41383;경계.8/.6/.4/.2·한번점프·HPfloor·90iframe·patCd/poise/ATKreset순서 | `tests/test_boss_ch1_bc05_phase.gd`;mhp1000/hp800→phase1/hp800/iframe90/patCd35→29/currentpoise불변;hp199→phase4/hp200한회전이;recover45다음분기20,다음tick atk=base. `EXODUSER-BossCh1-BC05-Isolated-20261020` | BC01/02. 피해·신성력·부활소유자와중복없음;실제무적집행은별도의존 |
| BC06 패턴시작 command packet | 신규 `scripts/native_ch1_boss_pattern_start.gd`;공용0 | §2.3의24startcase만,37702–37710전조식. callback부작용을순서있는command로분리;타장case추가0 | `tests/test_boss_ch1_bc06_start.gd`;fan phase0tele18/si2floor(18*1.4)=25,grab d119grab/d120charge,tailSwipe_isTail,burrowmax값;24개 case 출력·명령 순서를 독립 원본 literal 기대값과 대조. `EXODUSER-BossCh1-BC06-Isolated-20261020` | BC01/04/05. _PARRYABLE 값의 읽기 접점은 **보호**; 분류 규칙 변경 없음 |
| BC07 근접4기술 상태 | 신규 `scripts/native_ch1_boss_melee_states.gd`;공용0 | slash41074–41109/slam41111–41142/sweep/tail41144–41183;횟수3+floor(phase1.5), 각/거리/P.iframes gate/전진/rec | `tests/test_boss_ch1_bc07_melee.gd`;phase0slash3회/phase4=9회,slam si0phase0R1000/phase4R1320,tail/sweep동일판정+이름차이·창밖 피해0·P.iframes>0일 때 추가피해0(새 hit latch 추가 없음). `EXODUSER-BossCh1-BC07-Isolated-20261020` | BC05/06+hurtP공식provider. hit packet까지만;보호QE의성공판정을mock성공으로간주금지 |
| BC08 이동3기술·idle 공통후속 | 신규 `scripts/native_ch1_boss_movement_states.gd`;공용0 | 38315–38355,40483–40517,40664–40708,40942–40977;35/50charge·40jump·9dash·XY/X/Y·마지막18lock·genericidle×1.6/접촉/차징예약 | `tests/test_boss_ch1_bc08_movement.gd`;18f경계방향고정,charge50tick/막힘복구,jump착지한회,phase4dash10회,sp.5/1/2native시계·idle중첩정확순서. `EXODUSER-BossCh1-BC08-Isolated-20261020` | BC05/06. 기존mapcollision/flowprovider와계약필수;맵수정0·원eCharge공용상태재사용금지 |
| BC09 탄생산 burst/fan/bean/elem/rapid/idle | 신규 `scripts/native_ch1_boss_projectile_patterns.gd`;공용0 | 16938–16996/17253–17260,38357–38371,37080–37126,40562–40569,40646–40662,41185–41205,37769–37791,38212–38230 + generic20122–20155 | `tests/test_boss_ch1_bc09_projectiles.gd`;드루이드 fan요청[10,12,13,14,16]/burstphase0요청8·실잔존globaldrop순서,atk46fan raw59→physical59/magic118,stationary불변,generic차징직접spawn은독표지주입0; 리듬탄phase0 interval90/count5/life240/raw16(atk46),ORB110f/3발/raw27/AOE40; AI idle과 별도 시계. `EXODUSER-BossCh1-BC09-Isolated-20261020` | BC01/06+기존투사체owner의정상class/피해/EL/후처리권위. QE수정금지;부족provider면NOT_READY |
| BC10 grab·잠행 상태 | 신규 `scripts/native_ch1_boss_control_states.gd`;공용0 | 40837–40867,41047–41072;grab60/10주기/throw1.8,under45/erupt40/8후1hit/Rr+120/poison4/webSlow90 | `tests/test_boss_ch1_bc10_control.gd`;grab실패/성공·종료해제,Pposcommand순서;잠행target.06sp·45→40전환·폭발1회;iframes필드기록을hurtE무적성공으로세지않음. `EXODUSER-BossCh1-BC10-Isolated-20261020` | BC05/06/08+player강제위치/KB실소유확정. player파일0은packet검증까지,제품연결BC17 |
| BC11 chaseAOE·3점독늪 | 신규 `scripts/native_ch1_boss_ground_zones.gd`;공용0 | 17248–17251,37759–37768,38085–38117,37015–37052,37129;queue10/60/90/R450/15fade와pool55/73/91/300/r150/30tick×.4 | `tests/test_boss_ch1_bc11_zones.gd`;P(100,0),B(0,0)→(220,0)/(220,360)/(220,-360);첫chase생성60·폭발원업데이트순서·마지막잔상제거;poolrawfloor(atk.9)/tickfloor(raw.4*el). `EXODUSER-BossCh1-BC11-Isolated-20261020` | BC06/08·hurtPprovider. 드루이드와si1generic pool동일화금지;fieldfirezone소유와분리 |
| BC12 fissure·tide·seeker queue | 신규 `scripts/native_ch1_boss_hazard_queues.gd`;공용0 | 37931–37978/37067–37071;fissure20/140/140/min750,tide15/1750/120/gap.8/hit10,seeker60/360/r60/acc.02/cap1.5 | `tests/test_boss_ch1_bc12_hazards.gd`;arena128×108/T40→maxLen2304/explR691.2;phase0/4tide2/4,seeker3/5;arm strict>60·t>=360제거·hitT주기·queue압축순서. `EXODUSER-BossCh1-BC12-Isolated-20261020` | BC06/11. 원Q/E반사성공집행은보호된기존owner필수;새대체분류없음 |
| BC13 shock·spin·mine·poison trail | 신규 `scripts/native_ch1_boss_area_states.gd`;공용0 | 40749–40758,40869–40903,41327–41335 + poisonPools전체참조;shock4.5/반경차18,spin50/.35/8/12,mine180/EL.D,trail8/r175/240 | `tests/test_boss_ch1_bc13_area.gd`;si0shockMax1000/si3=1150,phase4si3mine7개,정지탄postdamage배율0,sp분수모듈로발사차이원본보존·trail8간격. `EXODUSER-BossCh1-BC13-Isolated-20261020` | BC05/06/09/11;기존fireZones·적탄피해owner동일성필수 |
| BC14 summon·독립 boss actor 연결 준비 | 신규 `scripts/native_ch1_boss_actor.gd`, `scripts/native_ch1_boss_summon.gd`;기존수정0/공용0 | 30782/31120–31362,40798–40814;ibtrue/etype0/si4슬롯,3+floor(si*.5)child/HP.5/shield0/6elements. si0의 etype2는 31121 opening 제외 규칙으로 etype0으로 remap. 24state dispatch실제순서 | `tests/test_boss_ch1_bc14_actor.gd`;si0child3/si3child4,parent와childib차이·HPshield정확값·미지원etype의허위ordinaryactor0·fixturetick선택→state실소비. `EXODUSER-BossCh1-BC14-Isolated-20261020` | BC02~13;boss_hurtE+부활추적owner·동적etype2/3/원소/skin미완이면막힘. TRACE-CH1-ENEMIES/P2-008a소유파일수정금지. ‘일반타입대체’우회금지 |
| BC15 몸체·전조·장판 시각 | 신규 `scripts/native_ch1_boss_renderer.gd`;필요원본asset동일byte복사경로는실해시확인후확정(미확인). 기존수정0/공용0 | §2.5body/clip/tell/render행. r44에9.3/14.1등원spec/dirMap/rect/anchor/150msframe·소스cliptiming;외부QA모듈은기본미포함 | `tests/test_boss_ch1_bc15_render.gd`;idle8방향원rect·4motionframe/atlas해시일치·잠행body0·실패fallback·geometrybounds. `EXODUSER-BossCh1-BC15-Isolated-20261020`;별도실창1x전조/피격/실루엣시각판정필수,자동검사로대체0 | BC14+실원본assets. 신규이미지제작0. 맵/카메라QA실행시맵가이드전체선행. 이전fixture절대경로재사용0 |
| BC16 HUD·cine·음향 읽기 전용 view | 신규 `scripts/native_ch1_boss_view.gd`;공용은BC17까지0 | 2701,35827–35885,55415–55424,24758–24764,41784–41814;HP90fill/poise3모드/shield0/180cine/입장50·130·50·100/SFX4profile | `tests/test_boss_ch1_bc16_view.gd`;HP500/1000→50%,shield0,poise25%,stun90/180→50%,immune150→50%,si0howl.7/si3.55,cineclockslow.35. `EXODUSER-BossCh1-BC16-Isolated-20261020`;시각/음향실인수별도 | BC14/15+HUD현재소유·TRACE-SOUND음향계약. playerHUD/설정구조·세이브변경0 |
| BC17 arena·Main 최소배선/클리어 통합 | 신규 `scripts/native_ch1_boss_encounter.gd`, `tests/test_boss_ch1_bc17_encounter.gd`;기존6공용파일은§6구역만(최소합약27~46줄,미확인). 필요arena생성모듈별도소유확정전구현금지 | 30697–30814,41784–41926,19967,43896;arena backup/reset/entry, 30f poll, revive pending 유예, chest/exit/clearT/demo0 종료. 세이브 형식 **보호** | 실제Main→출구→진입→boss생성→자연AI→공격·HPphase→부활대기→최종kill→chest/exit,네슬롯별검사;gate미완이면명시실패/보류. `EXODUSER-BossCh1-BC17-Isolated-20261020`;같은seed원본명령순서/수치비교·실창1x인수 | BC14~16+기존REVIVE_SHIELD보스죽음·최종판정/P3-003지역gate/arena충돌·맵소유확정필수. 현재 미완 의존 다수;바로BC17로점프금지 |

BC11/12/13도 각각 큐·상태별 독립 테스트 그룹으로 나눠 한 그룹이 막혀도 다른 그룹의 완료를 정확히 기록한다. 전체 모듈이 비슷한 이름이라는 이유로 다른 담당의 일반 몹·플레이어 장판 모듈을 가져와 덮어쓰지 않는다. 피날레 전용 모듈 생성/게이트 변경·보호 규칙 변경은 이 순서안에 없다.

## 6. 공용 파일 접점 — 이번 변경 모두 0줄

| 공용 파일·현재 위치 | 향후 필요한 최소 접속(예상 줄 수 **미확인**) | 선행·충돌·보호 |
|---|---|---|
| `godot/scripts/main.gd` `_ready:106` / camera207–213 / `_physics_process:1002` | BC17에서 encounter설치/bind 약3~5줄,허용된native시계adapter호출약2~3줄,장면종료disconnect약1~2줄. 상세로직은신규모듈로유지 | 레슨·부트·시계/QE서비스공용. 현재P2-001l/배선소유재확인. 새시계를중복tick하지않음 |
| `godot/scripts/hud.gd` bind88–103 / `_refresh:241` / build290 / nativeHUD803이후 | bossview독립Controlbind 약2~3줄/갱신약1~2줄. 기존playerHUD수치·보호입력0수정 | P2-007a글꼴/UI마감충돌가능. exactboss노드새이름소유확정;shield표현임의추가0 |
| `godot/scripts/world.gd` `_ready:905` / get_enemies984 / 동적등록2920 / physics2986 | arena전환서비스약4~8줄,boss별도등록·수거3~5줄. 고정encounters.json/factory exactprofile을늘리지않음 | P3-002동적등록/P3-003지역문·맵소유와충돌. 아레나geometry는원본/맵가이드선행없으면BLOCKED |
| `godot/scripts/player.gd` 기존damage/이동소유API·보호입력주변 | grab강제위치/종료KBsink 약2~4줄,arenaentry위치/iframe공개소유전달2~3줄. 실제함수위치는후속owner확정필요(미확인) | Q/E·입력바인딩·피해계산·세이브형식은**보호**. 기존sink로충족되면0줄을우선 |
| `godot/scripts/native_normal_enemy_hurte.gd` ib guard149–151 | 기존guard의분기결과를정식보스피해owner에위임하는약3~5줄예상. 기존일반적수식은그대로. 거부를단순제거하는구현금지 | 기존REVIVE_SHIELD후속소유자선행. 지역킬배선공용요청/P1피해작업과충돌. boss/hurt/부활원권위미완이면NOT_READY |
| `godot/scripts/native_source_new_run_state.gd` G/P단독소유·기존stagewriter접점 | bossArena/bossRef/phaseofload등G필드의owner명령전달약4~6줄. 기존초기화/복원/직렬화형식수정0 | SV-CONTRACT/신규state/region/spawn-holewriter소유공유. 실제필드명/등록거부계약은후속확정(미확인) |

최소 추정 합계 27~46줄은 각 행의 범위를 더한 값이며 실제 diff 크기나 승인된 공용 소유권이 아니다. BC01~13의 순수 계약/packet 검증은 위 파일을 전혀 수정하지 않아도 진행할 수 있다. BC14 이후의 제품 연결은 선행 소유자가 미완이면 BLOCKED로 보고한다.

## 7. 전수 참조 부록 및 정적 검토

부록의 선언 표는 고정 main 원본의 **정적 데이터 선언만** 평가하여 생성했다. 별도로 순수 score 함수 표본 4개를 대조했으며 DOM·게임 루프는 실행하지 않았다. 게임 전체 실행·브라우저 주입·환경 설정 변경은 하지 않았다. 아래 원본 행은 모두 §0 SHA의 파일 기준이다.


### 부록 A. 1장 기술 모든 필드·페이즈·전체 기술 ID 대응

`rec`는 등록 메타데이터이며 실행 recover와 다르다. `combo`는 기술별 metadata 배열이며 BOSS_COMBOS.seq와 별개다. 아래 모든 배열의 순서도 원본 그대로다.

| id | 원본 행 | ordinal / idx | tele / rec / cd | canFeint / canDelay | range | phase | combo | tags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| burst | 9821 | 0 / 0 | 45 / 40 / 140 | false / 0 | [0,999] | [0,1,2,3,4] | ["fan","shock","charge"] | ["aoe","ranged"] |
| fan | 9822 | 1 / 1 | 25 / 35 / 100 | false / 0.3 | [60,300] | [0,1,2,3,4] | ["charge","mine","multiDash"] | ["ranged","frontal"] |
| charge | 9823 | 2 / 2 | 40 / 60 / 100 | true / 0.5 | [40,400] | [0,1,2,3,4] | ["spin","grab","shock","multiDash"] | ["gap-close","melee"] |
| jump | 9824 | 3 / 3 | 34 / 30 / 150 | false / 0 | [80,500] | [0,1,2,3,4] | ["shock","burst","spin"] | ["gap-close","aoe"] |
| shock | 9826 | 5 / 5 | 35 / 40 / 120 | false / 0 | [0,180] | [0,1,2,3,4] | ["summon","mine","charge"] | ["aoe","melee"] |
| summon | 9827 | 6 / 6 | 45 / 60 / 300 | false / 0 | [0,999] | [1,2,3,4] | ["charge","burst"] | ["utility"] |
| grab | 9829 | 8 / 8 | 60 / 50 / 180 | true / 0.5 | [0,150] | [0,1,2,3,4] | ["charge","spin"] | ["melee","punish"] |
| spin | 9830 | 9 / 9 | 28 / 40 / 120 | false / 0.3 | [0,100] | [0,1,2,3,4] | ["burst","fan","multiDash"] | ["melee","aoe"] |
| mine | 9831 | 10 / 10 | 25 / 40 / 180 | false / 0 | [0,220] | [1,2,3,4] | ["charge","multiDash","vortex"] | ["utility","zone"] |
| multiDash | 9833 | 12 / 12 | 20 / 35 / 120 | true / 0.3 | [30,350] | [0,1,2,3,4] | ["spin","grab","charge"] | ["gap-close","multi-hit"] |
| slashCombo | 9834 | 13 / 13 | 20 / 25 / 90 | true / 0.3 | [0,100] | [0,1,2,3,4] | ["slam","sweep","charge"] | ["melee","multi-hit"] |
| slam | 9835 | 14 / 14 | 35 / 40 / 140 | false / 0.4 | [0,140] | [0,1,2,3,4] | ["slashCombo","sweep","shock"] | ["melee","aoe"] |
| sweep | 9836 | 15 / 15 | 25 / 60 / 100 | false / 0.2 | [0,120] | [0,1,2,3,4] | ["slashCombo","charge","slam"] | ["melee","frontal"] |
| burrowStrike | 9838 | 17 / 58 | 50 / 40 / 200 | false / 0 | [150,600] | [0,1,2,3,4] | ["slashCombo","fan","burst"] | ["gap-close","melee","ambush"] |
| beanStorm | 9839 | 18 / 17 | 20 / 25 / 80 | false / 0 | [0,999] | [0,1,2,3,4] | ["burst","fan","charge"] | ["ranged","aoe","redbean"] |
| chaseAoe | 9843 | 22 / 21 | 20 / 60 / 180 | false / 0 | [0,999] | [0,1,2,3,4] | ["charge","multiDash","slam"] | ["aoe","zone","utility"] |
| elemBall | 9844 | 23 / 22 | 60 / 35 / 100 | false / 0.3 | [60,500] | [0,1,2,3,4] | ["charge","fan","burst"] | ["ranged","frontal"] |
| groundFissure | 9856 | 35 / 34 | 25 / 35 / 140 | false / 0 | [60,400] | [0,1,2,3,4] | ["charge","slam","pillars"] | ["aoe","zone","ranged"] |
| tideWave | 9857 | 36 / 35 | 60 / 40 / 160 | false / 0 | [0,999] | [0,1,2,3,4] | ["charge","fan","burst"] | ["aoe","ranged"] |
| seekerMines | 9858 | 37 / 36 | 25 / 60 / 180 | false / 0 | [0,999] | [1,2,3,4] | ["charge","multiDash","elemBall"] | ["ranged","zone","utility"] |
| poisonTrail | 9862 | 41 / 40 | 20 / 60 / 160 | false / 0 | [0,999] | [1,2,3,4] | ["charge","multiDash","fan"] | ["zone","utility","sustained"] |
| lavaPools | 9871 | 50 / 49 | 35 / 40 / 200 | false / 0 | [0,999] | [0,1,2,3,4] | ["charge","fan","groundFissure"] | ["zone","aoe","sustained"] |
| rapidMissile | 9878 | 57 / 56 | 30 / 40 / 100 | false / 0 | [250,999] | [0,1,2,3,4] | ["charge","fan","burst"] | ["ranged","multi-hit","gap-punish"] |
| tailSwipe | 9879 | 58 / 57 | 40 / 50 / 110 | false / 0.2 | [0,160] | [0,1,2,3,4] | ["charge","slam","jump"] | ["melee","frontal","aoe"] |

| phase / 원본 행 | hp | spdM | teleM | cdM | comboC | feintC | delayC | label |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 / 9952 | [0.8,1] | 1.15 | 0.75 | 0.5 | 0.4 | 0.08 | 0.1 | PHASE 1 |
| 1 / 9953 | [0.6,0.8] | 1.25 | 0.65 | 0.4 | 0.55 | 0.15 | 0.2 | ⚠ PHASE 2 |
| 2 / 9954 | [0.4,0.6] | 1.4 | 0.5 | 0.35 | 0.65 | 0.2 | 0.25 | ⚠ PHASE 3 |
| 3 / 9955 | [0.2,0.4] | 1.55 | 0.4 | 0.25 | 0.8 | 0.3 | 0.35 | 🔥 PHASE 4 |
| 4 / 9956 | [0,0.2] | 1.75 | 0.25 | 0.15 | 0.9 | 0.4 | 0.4 | 💀 광폭화! |

전체 59레코드 manifest. 명시 idx30/59는 없고 idx60은 존재한다. 1장 24개만 뽑아서 0..23으로 다시 번호를 붙이지 않는다. `—`는 1장 자연 AI 후보 밖이다.

| ordinal | idx | id | 선언 행 | 1장 si |
| --- | --- | --- | --- | --- |
| 0 | 0 | burst | 9821 | 0,1,3 |
| 1 | 1 | fan | 9822 | 0,1,2,3 |
| 2 | 2 | charge | 9823 | 0,1,2,3 |
| 3 | 3 | jump | 9824 | 0,1,2,3 |
| 4 | 4 | laser | 9825 | — |
| 5 | 5 | shock | 9826 | 0,1,3 |
| 6 | 6 | summon | 9827 | 0,1,3 |
| 7 | 7 | meteor | 9828 | — |
| 8 | 8 | grab | 9829 | 0,1,3 |
| 9 | 9 | spin | 9830 | 0,1,2,3 |
| 10 | 10 | mine | 9831 | 0,1,3 |
| 11 | 11 | vortex | 9832 | — |
| 12 | 12 | multiDash | 9833 | 0,1,2,3 |
| 13 | 13 | slashCombo | 9834 | 0,1,2,3 |
| 14 | 14 | slam | 9835 | 0,1,2,3 |
| 15 | 15 | sweep | 9836 | 0,1,2,3 |
| 16 | 16 | teleStrike | 9837 | — |
| 17 | 58 | burrowStrike | 9838 | 0,3 |
| 18 | 17 | beanStorm | 9839 | 0,1,2,3 |
| 19 | 18 | beanRain | 9840 | — |
| 20 | 19 | fanWave | 9841 | — |
| 21 | 20 | radialLaser | 9842 | — |
| 22 | 21 | chaseAoe | 9843 | 0,1,3 |
| 23 | 22 | elemBall | 9844 | 0,1,3 |
| 24 | 23 | swordWave | 9845 | — |
| 25 | 24 | judgeCut | 9846 | — |
| 26 | 25 | spiralBullet | 9847 | — |
| 27 | 26 | delaySlash | 9848 | — |
| 28 | 27 | perilThrust | 9849 | — |
| 29 | 28 | pillars | 9850 | — |
| 30 | 29 | phantomSwords | 9851 | — |
| 31 | 60 | burstCounter | 9852 | — |
| 32 | 31 | crescendoCombo | 9853 | — |
| 33 | 32 | darkZone | 9854 | — |
| 34 | 33 | mirrorClone | 9855 | — |
| 35 | 34 | groundFissure | 9856 | 0,1,3 |
| 36 | 35 | tideWave | 9857 | 0,1,3 |
| 37 | 36 | seekerMines | 9858 | 0,3 |
| 38 | 37 | rewindStrike | 9859 | — |
| 39 | 38 | gravityWell | 9860 | — |
| 40 | 39 | wallPush | 9861 | — |
| 41 | 40 | poisonTrail | 9862 | 0,1,3 |
| 42 | 41 | cageTrap | 9863 | — |
| 43 | 42 | chainLightning | 9864 | — |
| 44 | 43 | orbWeave | 9865 | — |
| 45 | 44 | shieldBash2 | 9866 | — |
| 46 | 45 | mirrorGuard | 9867 | — |
| 47 | 46 | soulAnchor | 9868 | — |
| 48 | 47 | doppelganger | 9869 | — |
| 49 | 48 | itemSteal | 9870 | — |
| 50 | 49 | lavaPools | 9871 | 0,1,3 |
| 51 | 50 | fireRain | 9872 | — |
| 52 | 51 | shockGrid | 9873 | — |
| 53 | 52 | donutSlam | 9874 | — |
| 54 | 53 | safeCorner | 9875 | — |
| 55 | 54 | crossWipe | 9876 | — |
| 56 | 55 | tidalWipe | 9877 | — |
| 57 | 56 | rapidMissile | 9878 | 0,1,3 |
| 58 | 57 | tailSwipe | 9879 | 2 |

### 부록 B. BOSS_COMBOS 68개 전수 대조

`si`는 seq 전체가 최종 Set에 포함되는 슬롯이다. phase 필터는 그 다음에 적용한다. 1장 유효 union은 27개이며 빈 si의 41개를 BC01 제품 데이터로 추가할 필요는 없다. ordinal은 현재 배열 내 순서다.

| ordinal | 원본 행 | seq | phase | 1장 허용 si |
| --- | --- | --- | --- | --- |
| 0 | 9882 | jump → slam → sweep | [0,1,2,3,4] | 0,1,2,3 |
| 1 | 9883 | charge → tailSwipe | [0,1,2,3,4] | 2 |
| 2 | 9884 | slashCombo → tailSwipe → beanStorm | [1,2,3,4] | 2 |
| 3 | 9885 | charge → spin → burst | [0,1,2,3,4] | 0,1,3 |
| 4 | 9886 | jump → shock → fan | [0,1,2,3,4] | 0,1,3 |
| 5 | 9887 | charge → grab | [0,1,2,3,4] | 0,1,3 |
| 6 | 9888 | charge → multiDash | [0,1,2,3,4] | 0,1,2,3 |
| 7 | 9889 | multiDash → spin | [0,1,2,3,4] | 0,1,2,3 |
| 8 | 9890 | multiDash → grab → charge | [1,2,3,4] | 0,1,3 |
| 9 | 9891 | multiDash → spin → shock | [1,2,3,4] | 0,1,3 |
| 10 | 9892 | charge → spin → multiDash | [1,2,3,4] | 0,1,2,3 |
| 11 | 9893 | fan → charge → spin | [0,1,2,3,4] | 0,1,2,3 |
| 12 | 9894 | mine → vortex → burst | [2,3,4] | — |
| 13 | 9895 | meteor → fan → charge | [1,2,3,4] | — |
| 14 | 9896 | meteor → multiDash → burst | [2,3,4] | — |
| 15 | 9897 | mine → charge → spin | [2,3,4] | 0,1,3 |
| 16 | 9898 | summon → laser → vortex | [2,3,4] | — |
| 17 | 9899 | jump → multiDash → shock | [1,2,3,4] | 0,1,3 |
| 18 | 9900 | burst → charge → multiDash | [1,2,3,4] | 0,1,3 |
| 19 | 9901 | slashCombo → slam | [0,1,2,3,4] | 0,1,2,3 |
| 20 | 9902 | slashCombo → sweep → charge | [0,1,2,3,4] | 0,1,2,3 |
| 21 | 9903 | slam → sweep → slashCombo | [1,2,3,4] | 0,1,2,3 |
| 22 | 9904 | teleStrike → slashCombo → slam | [1,2,3,4] | — |
| 23 | 9905 | charge → slashCombo | [0,1,2,3,4] | 0,1,2,3 |
| 24 | 9906 | teleStrike → sweep | [1,2,3,4] | — |
| 25 | 9907 | sweep → multiDash → slam | [2,3,4] | 0,1,2,3 |
| 26 | 9908 | beanStorm → fan → beanStorm | [1,2,3,4] | 0,1,2,3 |
| 27 | 9909 | beanStorm → charge → beanStorm | [0,1,2,3,4] | 0,1,2,3 |
| 28 | 9910 | beanRain → beanStorm → burst | [2,3,4] | — |
| 29 | 9911 | vortex → beanRain → beanStorm | [3,4] | — |
| 30 | 9912 | swordWave → charge → slashCombo | [0,1,2,3,4] | — |
| 31 | 9913 | teleStrike → swordWave → sweep | [1,2,3,4] | — |
| 32 | 9914 | swordWave → swordWave → charge | [2,3,4] | — |
| 33 | 9915 | judgeCut → swordWave → charge | [1,2,3,4] | — |
| 34 | 9916 | delaySlash → perilThrust | [0,1,2,3,4] | — |
| 35 | 9917 | pillars → charge → elemBall | [1,2,3,4] | — |
| 36 | 9918 | phantomSwords → judgeCut | [2,3,4] | — |
| 37 | 9919 | burstCounter → crescendoCombo | [2,3,4] | — |
| 38 | 9920 | darkZone → judgeCut → charge | [3,4] | — |
| 39 | 9921 | spiralBullet → charge → slam | [2,3,4] | — |
| 40 | 9922 | crescendoCombo → sweep → slam | [2,3,4] | — |
| 41 | 9923 | mirrorClone → slashCombo → sweep | [2,3,4] | — |
| 42 | 9924 | groundFissure → charge → slam | [0,1,2,3,4] | 0,1,3 |
| 43 | 9925 | tideWave → charge → fan | [0,1,2,3,4] | 0,1,3 |
| 44 | 9926 | gravityWell → spiralBullet | [2,3,4] | — |
| 45 | 9927 | seekerMines → charge → multiDash | [1,2,3,4] | 0,3 |
| 46 | 9928 | rewindStrike → judgeCut | [2,3,4] | — |
| 47 | 9929 | wallPush → charge → slam | [2,3,4] | — |
| 48 | 9930 | poisonTrail → fan → charge | [1,2,3,4] | 0,1,3 |
| 49 | 9931 | chainLightning → charge → sweep | [1,2,3,4] | — |
| 50 | 9932 | orbWeave → darkZone | [3,4] | — |
| 51 | 9933 | shieldBash2 → slashCombo → sweep | [0,1,2,3,4] | — |
| 52 | 9934 | mirrorGuard → crescendoCombo | [2,3,4] | — |
| 53 | 9935 | soulAnchor → spiralBullet → fan | [3,4] | — |
| 54 | 9936 | doppelganger → charge → multiDash | [3,4] | — |
| 55 | 9937 | itemSteal → charge → slashCombo | [2,3,4] | — |
| 56 | 9938 | wallPush → gravityWell | [3,4] | — |
| 57 | 9939 | lavaPools → charge → groundFissure | [0,1,2,3,4] | 0,1,3 |
| 58 | 9940 | fireRain → charge → fan | [1,2,3,4] | — |
| 59 | 9941 | shockGrid → charge → multiDash | [1,2,3,4] | — |
| 60 | 9942 | lavaPools → fireRain | [2,3,4] | — |
| 61 | 9943 | shockGrid → spiralBullet | [2,3,4] | — |
| 62 | 9944 | donutSlam → charge → slam | [1,2,3,4] | — |
| 63 | 9945 | safeCorner → charge → multiDash | [2,3,4] | — |
| 64 | 9946 | crossWipe → charge → fan | [1,2,3,4] | — |
| 65 | 9947 | tidalWipe → charge → slam | [2,3,4] | — |
| 66 | 9948 | donutSlam → crossWipe | [3,4] | — |
| 67 | 9949 | fireRain → safeCorner | [3,4] | — |

| si | phase 미필터 전체 | phase0 | phase1 | phase2 | phase3 | phase4 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | 25 | 14 | 23 | 25 | 25 | 25 |
| 1 | 24 | 14 | 22 | 24 | 24 | 24 |
| 2 | 14 | 9 | 13 | 14 | 14 | 14 |
| 3 | 25 | 14 | 23 | 25 | 25 | 25 |

### 부록 C. 함수·공유 상태 전체 파일 행 색인

아래는 정확한 식별자 경계를 이용한 **game.html 전체** 참조 행이다. 정의·호출·render/debug·주석을 함께 포함하므로 존재만으로 도달/이식을 판정하지 않는다. `e`/`p` 등 같은 필드명이 다른 개체에 쓰이는 경우는 본문에서 소유자를 구분했다.

| 식별자 | 원본 전체 참조 행 |
| --- | --- |
| BOSS_MOVES | 9820, 10009, 17181, 31176, 38259, 38377, 38391, 38406–38408, 38413, 60430, 60442, 60450, 64252, 64323–64324, 64558, 64584, 64591, 64657, 65662 |
| BOSS_COMBOS | 9881, 38434, 64525, 64527 |
| BOSS_PHASES | 9951, 37704, 37729, 37765, 38242, 38317, 38375, 60434 |
| _BOSS_MOVESET | 9960, 9962–9967, 9970–9975, 9978–9981, 9984–9990, 9993–9997, 10000–10005, 10009–10010, 37653, 38392, 38433, 64322, 64656 |
| _HELL_ABERRANT_FACE | 37694, 37699 |
| _PARRYABLE_ATK | 37701, 37703 |
| _bossScore | 37650, 38407 |
| _bossStartPattern | 17181, 37702, 38401, 38441, 64258 |
| _bossPhaseCheck | 38236, 40447 |
| _bossIdleMove | 38315, 40450 |
| _bossAI | 38373, 40450 |
| _isNormalDruidBoss | 16938, 16942–16943, 37714, 37771, 38684, 40647, 40649, 40665, 53078 |
| _FDG_DRUID_THORN_FIRST | 16939, 16943, 37714, 40647, 40650, 53078, 57071, 65612, 65620, 65623, 65638, 65667 |
| _spawnBossProjectile | 16940, 17157, 37095, 37779, 37802, 38221, 38297, 38368, 38995, 39021, 39081, 39090, 39170, 39250, 39544, 39659, 39778, 39804, 39823, 39918, 39997, 40064, 40148, 40187, 40192, 40409, 40567, 40656, 40660, 40878, 40898, 41179, 41199, 41221, 41238, 42142, 42600, 42806, 42819, 42839, 42853, 42862, 42875, 42921, 42949, 42952, 42955, 42958 |
| _enemyHpPacing | 31119, 31143, 31147 |
| _CODEX_BOSS | 4663–4664, 10740, 10747, 10750–10751, 10775, 17098, 30775, 53553, 65163, 65640 |
| _drawCodexBoss | 10773, 10799, 53553 |
| _drawDruidBoss | 10782, 10906, 10980 |
| _druidV3Source | 10803, 10805, 10975 |
| _DRUID_DIRMAP | 10898, 10904 |
| _druidDir | 10899, 10909 |
| _stage1CodexBossMotionKey | 10763, 10777, 10908 |
| _assignBossSkin | 20199, 23150, 23295 |
| _BOSS_SFX | 24758, 24764 |
| _bossSfx | 24764, 24818, 30812, 38308, 41808 |
| _bossCine | 9164, 17087, 17125, 35827–35828, 35840, 55416, 55420–55421, 60869 |
| _enterBossArena | 17084, 30749, 31544, 41789, 64209, 64289, 64764 |
| genBossArena | 30697, 30756 |
| findBoss | 19967, 35810, 41798, 41822, 41831, 60422, 65155 |
| _bossTestReq | 3467, 30793, 31540–31541, 62513, 62519, 62911, 64021, 64027, 64044, 64142, 64148, 64159 |
| _bossLoadPhase | 30203, 30788, 31569, 41784, 41787, 41789–41790, 41792–41793, 41795–41796, 41812, 41893, 41913, 43420, 43896, 52090, 52095, 52097, 60780, 60868, 61246, 61951, 62126, 62280, 62364, 62476, 63495, 63956, 64105 |
| _bossLoadT | 30788, 41786, 41788–41789, 41792, 41794–41795, 41797, 41812, 41913, 52097 |
| _bossLoadFade | 30788, 31569, 41788–41789, 41791, 41794–41795, 41812, 41913, 43896, 52092, 61951, 62126, 62280, 62364, 62476, 63495, 63956, 64105 |
| _bossArena | 4651, 9390, 11295, 11624, 16656, 17083, 17120, 18262, 26822, 27198, 27662, 30203, 30775, 31569, 41407, 41821, 41841, 41869, 41898, 43876, 43896, 46579, 51937, 51996, 52028, 52129, 55400, 60212, 60780, 60868, 61051, 61265, 61649, 61951, 62126, 62280, 62364, 62476, 63481, 63495, 63956, 64105, 64191, 64207, 65156 |
| _bossRef | 4660–4662, 4664–4665, 9390, 9539, 9545–9546, 9592–9593, 9673–9674, 9693, 17075, 19967, 30203, 30797, 32689, 33072, 34510, 35729–35731, 35737, 35750, 35756, 35809–35811, 37082, 37109, 41831, 43799, 43896, 55246, 55402, 57526, 61951, 62126, 62280, 62364, 62476, 63496, 63956, 64105 |
| _preArenaBackup | 30748, 30752, 63481–63482 |
| _bossArenaEntry | 30777, 51937–51938 |
| _bossArenaExit | 30775, 41841–41842 |
| _killedBosses | 30797, 41830–41831, 42604–42605 |
| _bossClearT | 41828, 42058, 60699 |
| _pStats | 13347, 28213, 32179, 32212, 32533, 32686–32687, 32691–32693, 33053, 33562, 35910, 38387, 38407, 38470, 43438, 44876, 60444 |
| _chaseAoes | 30770, 31558, 37015–37017, 37051–37052, 37761–37762, 57481–57483, 60069, 61924, 63489, 64285 |
| _fissures | 30764, 31556, 37067, 37936, 37941, 37943, 57819–57821, 60069, 63487, 64283 |
| _tideWaves | 30764, 31556, 37069, 37953, 37956, 37959, 57872–57874, 63487, 64283 |
| _seekerMines | 30764, 31556, 37071, 37968, 37971, 37974, 57914–57916, 63487, 64283 |
| _lavaPools | 17077, 17127, 30770, 31558, 37129, 38087, 38091, 38111, 38113, 57521–57523, 60069, 63489, 64285 |
| _poisonPools | 30765, 31557, 37079, 38015, 41332–41333, 57990–57992, 60069, 63488, 64284 |
| _druidOrbs | 17077, 17127, 30766, 37108, 37112–37113, 37126, 57981, 57983 |
| _drawDruidPoolClip | 10830, 17234, 57529, 57995 |
| _drawDruidOrbClip | 10867, 57984 |
| _drawDruidGroundRing | 10879, 17235, 57488, 57495, 57532, 57847, 57997 |
| _drawDruidPoisonShot | 54093, 57917, 61592 |
| _drawDruidThornShot | 61574, 61593 |
| _drawDruidPoisonImpact | 57107, 61533 |
| _drawDruidPoisonHitClip | 61526, 61547 |
| _drawDruidRootsClip | 19547, 54591 |
| _drawDruidHitClip | 19421, 54594 |
| _drawDruidDustClip | 19589, 54597 |
| _drawDruidShockringClip | 19506, 54600 |
| _druidPoisonPoolTargets | 17248, 38089 |
| _druidParryVolleySpec | 17043, 17153, 37084 |
| _DRUID_FINALE_ROUNDS | 17048, 17148 |
| _DRUID_FINALE_ATK | 17053, 17061 |
| _isDruidFinale | 9390, 16938, 17054, 17083, 17087, 17090, 17097, 17124, 17133, 17185, 17215, 30769, 31148, 34503, 34509, 35730, 35734, 35750, 35837, 35877, 35881, 37083, 37110–37111, 37706, 38249, 38260, 38358, 38374, 38684, 38771, 40665, 40670–40671, 40677, 41052, 41063, 42517, 42537–42538, 42544, 42551, 42648, 43876, 57526, 65620 |
| _druidFinaleHp | 17057, 31149 |
| _druidFinaleAtk | 17060, 38251, 38771 |
| _druidFinaleReviveChance | 17063, 42538, 42648 |
| _reviveDruidFinale | 17066, 34503 |
| _retryDruidFinale | 17082, 63479 |
| _druidFinaleIntro | 17086, 35828 |
| _drawDruidFinaleAct | 17089, 55424 |
| _druidFinaleFrame | 17096, 35732 |
| _syncDruidFinaleMouse | 12890, 17112, 35747, 51730 |
| _finishDruidFinale | 17123, 41832 |
| _drawDruidFinaleVictory | 17132, 55423 |
| _druidFinaleAct | 17142, 17146, 17178, 35837, 35877, 38262 |
| _druidFinaleNextMove | 17145, 17174 |
| _druidFinaleVolley | 17152, 17197 |
| _druidFinaleTrackBurrow | 17164, 41052 |
| _druidFinaleAI | 17171, 38374 |
| _druidFinaleUpdate | 17184, 40448 |
| _drawDruidFinaleRing | 17205, 17224–17225, 17243–17244 |
| _drawDruidFinaleTell | 10907, 17214, 65620 |
| _drawDruidFinalePool | 17232, 57526 |
| _tickProjCharge | 20152, 38878, 40512 |
| _fireChargedProj | 20122, 20155 |
| _poiseHit | 19972, 36525, 37625, 38660, 40534, 40544, 40587, 40628, 40684, 40736, 40767, 40829, 40883, 41034, 41068, 41092, 41129, 41160, 41262, 41279, 41313, 41345, 41364, 42490, 43354, 46328, 46543 |
| _poiseReset | 20000, 34454, 38628, 38660 |
| _druidParryT | 30766, 37085–37086, 37089–37090 |
| _druidParryVolley | 16867, 16882, 16974, 17160, 30766, 37084, 37098, 37102 |
| _druidOrbT | 30766, 37109–37111 |
| _ffMoveE | 31907, 34469, 34486, 38678, 38691, 38697, 40080, 40136, 40163 |
| _pushOutWall | 31722, 38589, 41407 |

### 부록 D. 보스 개체 필드 접근 색인(핵심 범위 내 전수)

§1.3의 필드 그룹을 구현자가 원본에서 찾기 위한 보조표다. 범위는 드루이드 몸체10906–10977, 피날레17043–17251, 보스 생성 초기값31162–31187/31260–31261, §2.3의 24개 start/state, 공통score/phase/idle/selector/recover이다. **다른 장 기술 case는 제외**했다. 이 범위에서 `e.<field>` 접근을 모두 열거했으며 전체 game.html 모든 적의 필드 존재 검사를 대신하지 않는다. 객체 literal에만 초기화된 필드는 §1.3의 생성 행을 별도로 따른다.

| e 필드 | 선택한 핵심 범위 안 접근 행 |
| --- | --- |
| _aSpdM | 38318 |
| _atkParryable | 37703 |
| _bossOrbitAng | 38332, 38335–38336 |
| _bossPhase | 17061, 17068, 17143, 17153, 17181, 37714, 37775, 37934, 37951, 37966, 38094, 38215, 38239, 38241, 38317, 38331, 38360, 38363, 38375, 38381, 38393, 38401, 38407, 38434, 38441, 40564, 40647, 40650–40651, 40655, 40894, 41125, 41175, 41192, 41194 |
| _bossRevJudged | 17071 |
| _bossReviveVFXPending | 17074 |
| _bossRevived | 17071 |
| _bossStrafeCd | 38333–38334 |
| _bsMaxWave | 37755, 41203 |
| _bsWave | 37755, 41188, 41202–41203 |
| _combatSt | 37679–37681, 38382 |
| _comboIdx | 17073, 17175, 37687, 38258, 38389–38390, 38394, 38402, 38435 |
| _comboSeq | 17073, 17175, 37687, 38258, 38389–38390, 38402, 38435 |
| _dashCnt | 37733, 40968 |
| _dashIdx | 37733, 40967–40968 |
| _dbgScores | 38425 |
| _delaying | 17073, 17175, 38258 |
| _diveMax | 10941, 37752 |
| _diveTx | 17103, 17167, 17169, 17221, 41050, 41053, 41055, 41058, 41063 |
| _diveTy | 17104, 17167, 17169, 17221, 41050, 41053, 41055, 41058, 41063 |
| _druidAct | 17072, 17147, 38264 |
| _druidBaseAtk | 17061, 17069, 38250 |
| _druidChargeLeft | 17227, 37709, 40671 |
| _druidDefeated | 17124–17125 |
| _druidFanWindMax | 37714 |
| _druidLastStand | 17061, 17068 |
| _druidRest | 17072, 17178, 17187, 17199, 37708, 38261 |
| _druidRetry | 17087 |
| _druidStep | 17072, 17147, 17149, 38264 |
| _druidTargetLocked | 17072, 17102, 17165, 17168, 17216, 37709, 38261 |
| _druidWaves | 17178, 17197–17198 |
| _eruptHit | 17216, 41058, 41060–41061 |
| _eruptMax | 10943, 17222, 41058, 41060 |
| _feinting | 17073, 17175, 37710, 38258, 38399, 38438 |
| _grabAng | 37728, 40839, 40854, 40863 |
| _grabWindMax | 37728 |
| _idleRBT | 38359, 38361–38362 |
| _isTail | 37737 |
| _lastMoves | 17176, 37658–37659, 37661, 37692, 38397, 38427 |
| _meleeStreak | 37696, 38398, 38428 |
| _moveCDs | 37654, 38259, 38377, 38393, 38395, 38429 |
| _nameTopOff | 10938, 10966 |
| _ptAng | 38016, 41328 |
| _ptT | 38016, 41330–41331 |
| _revPts | 17064, 17068 |
| _reviveTimer | 17071, 17124 |
| _rkCombo | 41378–41379, 41381 |
| _slashCnt | 37734, 41104 |
| _slashIdx | 37734, 41103–41104 |
| _spawnT | 17074, 17172 |
| _spinAng | 37730, 40871, 40873, 40877, 40888 |
| _strafeDir | 38332, 38334, 38345, 38350–38351 |
| _sweepDir | 37736–37737, 41146, 41151 |
| _teleOx | 37751, 41055 |
| _teleOy | 37751, 41055 |
| _telePrepMax | 10947 |
| _telegraphR | 37719 |
| _telegraphT | 37719, 41379 |
| _tpFlashT | 38281 |
| _tpWarnT | 17074 |
| _underMax | 41050, 41054 |
| _weaponAng | 37734–37737, 41076, 41078, 41082, 41099, 41106, 41108, 41113, 41121, 41124, 41146, 41152, 41167, 41173 |
| alive | 17067, 17124 |
| atk | 17061, 17069, 17158, 37762, 37774, 37942, 37958, 37973, 38091, 38112, 38223, 38250–38252, 38286, 38297, 38368, 40567, 40656, 40660, 40684–40685, 40706, 40756, 40857, 40862, 40879, 40883–40884, 40898, 40960, 40962, 41062, 41068, 41092–41093, 41129–41130, 41160–41161, 41179, 41199, 41333 |
| baseAtk | 17061, 38250 |
| bossPatCd | 38255, 38430 |
| bossPatT | 17173, 17175, 17190, 38257, 38384–38385, 38396, 38410, 38430 |
| col | 37782, 37788, 38368, 40567–40568, 40656, 40660–40661, 40667, 40687, 40703, 40751, 40879, 40888, 41199 |
| deaths | 17064 |
| eShield | 17067 |
| eShieldMax | 17067 |
| echDx | 40666, 40670, 40673, 40687, 40946, 40951, 40953, 40956, 40971 |
| echDy | 40666, 40670, 40674, 40687, 40946, 40951, 40954, 40956, 40971 |
| el | 37762, 37781–37782, 37786–37788, 37942, 37946, 37958, 37961, 38091, 38112, 38115, 38223, 38297, 38368, 40567, 40656, 40660–40661, 40684–40685, 40706, 40756, 40857, 40862, 40879, 40883–40884, 40960, 40962, 41068–41069, 41092–41093, 41129–41130, 41160–41161, 41179, 41199, 41333 |
| etype | 40568, 40703, 41378, 41381 |
| facing | 17194, 17227, 37714, 37728, 37751, 37766, 37772, 37778, 37933, 37939, 37970, 38214, 38219, 40647, 40652, 40665–40666, 40669, 40683, 40692, 40943, 40946, 40950, 40960, 40970–40971, 41048, 41068, 41075, 41084, 41089, 41092, 41099, 41105, 41112, 41115, 41129, 41145, 41157, 41160, 41167, 41176, 41186 |
| hp | 17067, 38237, 38245 |
| ib | 17055, 37762–37763, 37942, 37946, 37958, 37961, 37971, 41375–41376, 41382 |
| iframes | 41050, 41056 |
| jumpOx | 37718, 40695–40696 |
| jumpOy | 37718, 40695–40696 |
| jumpX | 37718, 40695–40696 |
| jumpY | 37718, 40695–40696 |
| kb | 17070, 40683 |
| maxPoise | 38254 |
| mhp | 17067, 38237, 38245 |
| r | 10919, 10938, 10962, 10964, 17079, 17098–17099, 17101, 17103, 17128, 17157, 17167, 17221, 17227, 37717, 37719, 38221, 38267, 38272, 38278–38279, 38327–38328, 38340–38341, 38348, 38352–38354, 40568, 40669, 40672–40674, 40680, 40692, 40698, 40703, 40751, 40841–40843, 40846, 40950, 40952–40954, 40956, 40958, 41049–41050, 41058, 41062, 41085, 41087, 41116, 41154, 41168, 41329 |
| reviveIframes | 17070, 17172, 17187, 38247 |
| room | 40807 |
| s | 10912–10916, 10941–10942, 10947, 10949, 10954, 17070, 17102, 17172, 17178, 17186–17187, 17189–17190, 17193, 17198–17199, 17216–17217, 17222, 37713–37715, 37719, 37722–37723, 37728–37731, 37733–37737, 37752, 37755, 37765, 37790, 37947, 37962, 37977, 38017, 38092, 38116, 38230, 38257, 38261, 38379, 40569, 40662, 40666, 40671, 40677–40678, 40686, 40688, 40690, 40701, 40750, 40758, 40813, 40848, 40850, 40866, 40871, 40889, 40902, 40947, 40975, 41050, 41058, 41072, 41078, 41106, 41108, 41118, 41141, 41148, 41182, 41188, 41203, 41335, 41375, 41379, 41382 |
| shockMax | 40678, 40700, 40750, 40758, 41134 |
| shockR | 40678, 40700, 40750, 40753, 40755, 40758, 41134 |
| speed | 38253, 38318, 40840 |
| st2 | 10941, 10943, 10948, 10952, 17070, 17166, 17178, 17187, 17190, 17196, 17198–17199, 17222, 37713–37715, 37719, 37722–37723, 37728–37731, 37733–37737, 37752, 37755, 37765, 37790, 37947, 37962, 37977, 38017, 38092, 38116, 38230, 38257, 38261, 40563, 40569, 40648, 40662, 40665–40666, 40671, 40677–40678, 40686, 40688, 40690, 40693, 40699, 40701, 40750, 40758, 40800, 40813, 40844, 40848, 40850, 40856, 40860, 40866, 40871, 40876, 40882, 40889, 40893, 40902, 40945, 40947, 40966, 40972, 40975, 41050, 41054, 41058, 41060, 41072, 41076, 41078, 41081, 41102, 41106, 41108, 41113, 41118, 41120, 41122, 41141, 41148, 41150, 41172, 41182, 41188, 41190, 41203–41204, 41335, 41375–41376, 41379, 41382 |
| stunned | 17070, 17172, 38257, 38316, 38379, 40682–40683, 40960, 41068, 41092, 41129, 41160 |
| x | 10918, 10966, 17079, 17097, 17100, 17128–17129, 17154, 17157, 17162, 17167, 17179, 17194–17195, 17218, 17221, 37713–37715, 37717–37719, 37722–37723, 37728–37731, 37733–37737, 37751, 37753, 37755, 37763, 37766–37767, 37772, 37779, 37786, 37788, 37933, 37941, 37946, 37956, 37961, 37971, 37976, 38016, 38018, 38089, 38092, 38102, 38115, 38214, 38221, 38228–38229, 38266–38267, 38272, 38278–38283, 38287, 38289, 38297, 38301–38302, 38322, 38325–38328, 38337, 38339–38341, 38344, 38347–38348, 38352–38354, 38364, 38368, 38370, 40567–40568, 40647, 40652, 40656, 40660–40661, 40665, 40667, 40669–40670, 40672–40674, 40679–40680, 40684–40685, 40687, 40690, 40692, 40698, 40703, 40705, 40707, 40751, 40755, 40757, 40799, 40804, 40812, 40839–40843, 40846, 40850, 40854, 40870, 40878, 40882–40883, 40885, 40888, 40892, 40897, 40901, 40943–40944, 40950–40954, 40956, 40958, 40960, 40963, 40970, 41048–41050, 41055, 41058, 41063, 41068, 41075, 41077, 41085, 41087–41088, 41092, 41094, 41100, 41105, 41112, 41116–41117, 41126, 41129, 41131, 41138–41140, 41145, 41147, 41155–41156, 41160, 41162, 41169–41170, 41179–41180, 41186–41187, 41193, 41199, 41201, 41329, 41333 |
| y | 10918, 10966, 17079, 17097, 17099, 17101, 17128–17129, 17154, 17157, 17162, 17167, 17179, 17194–17195, 17218, 17221, 37713–37715, 37717–37719, 37722–37723, 37728–37731, 37733–37737, 37751, 37753, 37755, 37763, 37766–37767, 37772, 37779, 37786, 37788, 37933, 37941, 37946, 37956, 37961, 37971, 37976, 38016, 38018, 38089, 38092, 38102, 38115, 38214, 38221, 38228–38229, 38266–38267, 38272, 38278–38283, 38287, 38289, 38297, 38301–38302, 38322, 38325–38328, 38337, 38339–38341, 38344, 38347–38348, 38352–38354, 38364, 38368, 38370, 40567–40568, 40647, 40652, 40656, 40660–40661, 40665, 40667, 40669–40670, 40672–40674, 40679–40680, 40684–40685, 40687, 40690, 40692, 40698, 40703, 40705, 40707, 40751, 40755, 40757, 40799, 40804, 40812, 40839–40843, 40846, 40850, 40854, 40870, 40878, 40882–40883, 40885, 40888, 40892, 40897, 40901, 40943–40944, 40950–40954, 40956, 40958, 40960, 40963, 40970, 41048–41050, 41055, 41058, 41063, 41068, 41075, 41077, 41085, 41087–41088, 41092, 41094, 41100, 41105, 41112, 41116–41117, 41126, 41129, 41131, 41138–41140, 41145, 41147, 41155–41156, 41160, 41162, 41169–41170, 41179–41180, 41186–41187, 41193, 41199, 41201, 41329, 41333 |

### 정적 검토·미확인 항목

| 검사 | 결과/한계 |
|---|---|
| 원본 byte/행 | §0의 main 원본과 조사 worktree game.html·index.html 동일 byte; 변경 없음 |
| 순수 score 대조 | 원본 함수의 고정 u=.5에서 1.9500000000000002 / 1.09 / 5.8500000000000005 / -1 확인. BC03 독립 기대값 근거이며 Godot 검수 아님 |
| 제외한 untracked | 최종 상태 조회에서 docs_backup_before_normalize_20260726 아래 한글 이름 파일 1개도 untracked로 관측. 생성 주체·정규화 차이 원인은 미확인. 읽기·수정·삭제·스테이징하지 않고 보존. 자기 신규 추적 문서만 경로 지정 스테이징 |
| 등록집합 | 정적 선언 59 move/68 combo/5 phase, 최종 Set [23,21,10,23], union24, combo union27 대조. game 실행 아님 |
| 문서 범위 | 요청 두 설계 폴더 12파일, 공통 작업판·계획·기능 목록·기존 추적 5종을 먼저 확인. 불일치는 §3 표만 작성 |
| Godot | 실제 scripts/port_modules/tests 본문과 ib 거부·정확 factory 제한을 대조. 테스트 실행 0회; 새 테스트 파일 생성 0개 |
| 보호 | docs/2_3/Q/E/세이브 형식은 보호 표기만. 새로운 분류·입력·필드·마이그레이션 제안 없음 |
| 실행 인수 | 일반/QA/옛 피날레의 실제 도달·화면·사운드·자연 AI 전투·PC/Mac 동기 실행은 이번 조사에서 미확인 |
| 후속 첫 단위 | BC01 신규 catalog+test만, 공용0줄. 다음 배정에서 원본 SHA/소유/격리 실행 도구를 다시 확인 후 구현 |

DEMO11-34(2026-10-21)는 기존 BC01~10을 변경하지 않고 stage0 Node2D actor·요청 assembler를 Main에 설치한다. 원본 clock/prefix/실제 owner가 미공급인 경계는 정지하며, 자연 arena/피해·패링·HP/poise·부활·실제 탄 registry/렌더 인수로 확대하지 않는다. 새 공개 API와 Main 변경 줄·PC36/49 인계는 [DEMO11-34 보고서](orders/reports/demo11-34_REPORT.md)를 따른다.
