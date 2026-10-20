# 2장 보스 원본 추적·작은 이식 단위 지시서 — 2026-10-20

## 0. 기준과 작업 경계

| 항목 | 확인 내용 |
|---|---|
| 작업 / 브랜치 | `trace-boss-ch2` / `codex/trace-boss-ch2-20261020` |
| 시작 기준 | fetch 후 `origin/main=299e48ac4dfbb7cedd313e791173c0d8ff20cb0a`. 원격 BC01~BC07은 읽기 참조만 했으며 cherry-pick·코드 이송 없음 |
| 작업 방식 | `~/exoduser-wt/trace-boss-ch2`를 `worktree add --no-checkout` 후 non-cone sparse-checkout. 웹 대용량 에셋은 체크아웃하지 않고 필요한 JSON·blob 목록만 외부 로그로 읽음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`; 시작 HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, branch `codex/mac-live-play-time-main-20261017`. R의 브랜치·tracked INDEX/WORK·파일 변경 없음 |
| 원본 행 기준 | `game.html` 65,692행, SHA256 `4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4`; `index.html` 4,742행, SHA256 `36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12` |
| 커밋 범위 | 이 문서 1개 + 허용된 `docs/CHANGELOG_SYNC.md` 맨 위 절. 코드·테스트·설계 원문·공용 파일·타 담당 파일·세이브 형식·바이너리 변경 0 |
| 실행·증거 | **Godot 실행 0**. 게임·서버·화면·실저장 접근도 0. JS 정적 선언만 별도 VM에서 평가해 집합을 셈; HP 표는 전사한 산술식의 표본이며 실제 전투 검수 아님. BC 보고서 수치는 원격 기록 인용이고 이번 재실행 PASS 아님 |
| 원로그 / 종료 | `~/exoduser-wt/_out/trace-boss-ch2/`. push 후 원격 SHA 일치 확인 → 외부 DONE.txt 작성 → 자기 worktree 제거. 브랜치와 원로그 보존 |

`si`=전역 스테이지 번호, `hell`=0기준 장, `phase`=HP 페이즈 0~4, `idx`=원본 명시 기술 ID, `ordinal`=배열 내 0기준 순서. `f`는 원본 tick 단위이며 벽시계 초로 환산하지 않는다. `Math.floor`와 `~~`(JS ToInt32)는 구분한다. **미확인**은 실행·파일·권한 근거가 확보되지 않은 항목이며, 의도나 기능 완성으로 보충하지 않는다.

### 0.1 먼저 읽은 공통 자료와 소유권

| 자료 | 이번 적용 |
|---|---|
| [1장 보스 추적](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §0~7 | 같은 데이터→런타임→docs 차이→Godot→작은 단위→접점→전수 부록 형식. 공통 HP·score·selector·phase·22기술·투사체 후처리의 상세 정의는 이 문서를 참조하며 별도 공통 구현을 만들지 않음 |
| [부활·실드 추적](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1.3 B01~B09·§1.5·§2~5 | HP 페이즈, HP0 즉시 부활, 180f 폴백, 포인트·반경·실드·최종 종료의 기존 소유 유지. 아래 §2.5는 2장 적용값과 분기 차이만 연결 |
| [BOSS_BATTLE_SETTINGS](../8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md) | 아레나·페이즈·무브셋·2D/3D·bossRec. 같은 폴더의 나머지 7문서는 1장/드루이드 전용이며 2장 고유 설계로 확장하지 않음 |
| [부활 설계](../2_5%20부활+에너지쉴드시스템/2_5%20부활+에너지쉴드시스템.md), [RESPAWN](../2_5%20부활+에너지쉴드시스템/RESPAWN_RESOURCE_RESET.md), [피해수치 표시](../2_5%20부활+에너지쉴드시스템/에너지쉴드_피해수치_표시_20260928.md) | 전투 중 보스 부활과 플레이어 재시작·리소스 완충을 구분. 보호된 Q/E·추가 HP 실드 계약 변경안 없음 |
| [SAVE](FDG_SOURCE_TRACE_SAVE_20261020.md), [SOUND](FDG_SOURCE_TRACE_SOUND_20261020.md) | 세이브·음향 공통 소유를 참조만 함. 보스 전투 레코드를 새 저장 형식으로 만들지 않음 |
| AGENTS / CLAUDE 퀄리티 절 | 근거·미확인·후속 계획을 분리. 이번은 문서 추적이며 외형 채택·화면 품질 완료를 주장하지 않음. 작업판·별도 REPORT는 사용자 지정 2파일 커밋 범위에 따라 변경하지 않음 |

### 0.2 원격 BC01~BC07 확인 결과

아래 SHA는 fetch한 원격 ref 끝이다. BC01~BC07의 해당 `.gd`는 **기준 main에는 없음**. 원격 보고·구현 존재와 본편 통합·승인은 별개이며 이번 문서가 승인하지 않는다. 보고서 검사 수는 재실행하지 않았다.

| 단위 / 원격 `codex/…-20261020` | 원격 SHA | 확보한 모듈 / 보고 수치 | 2장에 필요한 판단 |
|---|---|---|---|
| bc01 | `e4396da5e7541562542ab65053d8ecac0bf16e52` | `native_ch1_boss_catalog.gd`; 681/0 | 59기술 manifest·공통 22기술·5페이즈·공통 25콤보를 읽기 재사용 가능. boss/moves/combos의 stage API는 si0~3만 허용 |
| bc02 | `3d510c2b400f26342dcf5e9899a38034fd1e7c0a` | `native_ch1_boss_spawn_contract.gd`; 5,257/0 | `build_spawn_packet`이 CH1 catalog로 stage 검증. 2장 HP·포인트·6 draw의 공통 계산을 복제하지 말고 chapter data 접점 결정 필요 |
| bc03 | `349ec241c12e403499a4b063a94e692fdd396543` | `native_ch1_boss_utility.gd`; 31,976/0 | `evaluate_move`도 CH1 stage guard. 2장은 si2 얼굴 가점/전조×1.4와 si0/3 melee 가점 대상 아님 |
| bc04 | `818e9b2027afa37fadbf13a6b79b885abdb95f6b` | `native_ch1_boss_selector.gd`; 21,899/0 | tip은 보고서 후속 변경, 같은 브랜치 선행 커밋의 코드 확인. `select_tick` stage guard; `pick_top_six`는 공통 계산 후보 |
| bc05 | `e1850171849de176ad7d5df61e2cd296705ad7b7` | `native_ch1_boss_phase.gd`; 18,424/0 | `phase_transition/clock_step/begin_phase_effects/phase_effect_step` 참조. 실제 actor·G·피해 연결 없음, CH2 stage 인수 계약 필요 |
| bc06 | `1110eec6c2deacd43c6c20dd52affff33d4e4d47` | `native_ch1_boss_pattern_start.gd`; 14,099/0 | 24기술 시작 command/ack 프로토콜. CH2 공통22+신규10. `begin_start`는 stage0~3/CH1 union만 허용, `next_start` 위조 continuation으로 우회 금지 |
| bc07 | `edcbc480491a2b9c55abbb99fcda3dc47073583c` | `native_ch1_boss_melee_states.gd`; 최종652표본/14,531단정/0실패(원격보고) | 근접4기술/6state packet·보호contact readback. CH2공통slashCombo/slam/sweep 3기술은재사용후보,tailSwipe는CH2제외. begin_tick/next_tick 모두si0~3guard여서실CH2연결HOLD |

초기 wildcard조회에서는 BC07이 없었으나 제출 전 재조회에서 위 ref를 확인해 fetch하고 코드·보고서를 읽었다. BC07 `begin_tick:13`/`next_tick:23`은 보호접촉을 실행하지 않고 실제 enemy_after/player_after readback을 요구하며, full_tick_complete=false다. 원격 존재를 실제전투 인수로 확대하지 않는다.

BC01 보고서의 p1002g 기존 220검사/1실패와 후속 보고서의 로비 선재 실패 등은 각 원문 소유다. 이를 이 문서의 신규 실패나 통과로 바꾸지 않는다.

## 1. 데이터·생성·수치 전수 추적

### 1.1 여섯 슬롯과 도달성

| si / 장내 위치 | `HELL_BOSSES[1]` / `STG.bn` | 최종 기술 수 | 누적 추가 | 초기 `_revPts/_maxRevPts` | `isHellBoss` |
|---|---|---:|---|---:|---|
| 4 / 2-1 | 벌레 수호자 | 27 | 기본 집합(부록 A) | 224 | false |
| 5 / 2-2 | 점액 괴수 | 28 | +seekerMines | 229 | false |
| 6 / 2-3 | 기생충 모체 | 29 | +fanWave | 235 | false |
| 7 / 2-4 | 거대 알주머니 | 30 | +wallPush | 241 | false |
| 8 / 2-5 | 살벽의 군주 | 31 | +shieldBash2 | 247 | false |
| 9 / 2-6 | 여왕 구더기 | 32 | +spiralBullet | 253 | true |

근거 `game.html:9968–9975,10009–10010,16633–16648,16680–16712,30782,31119–31183`.

- `CHAPTER_STAGES`: hell1/startSi4/stages6. `STG`: chapter1, hell1, hellFloor0~5, monLv200. `HELL_THEMES[1]`: WORM NEST/벌레굴, w `#2e3018`, f `#0e1008`, ac `#aacc44`, be=`EL.P=0`(**물리**, 독 속성 아님; 14333–14342).
- 모두 아레나에서 `mkEn(..., G.stage, 0, true, STG[G.stage].be, 0)`로 생성되는 **etype0/ib=true**다. 이름 6개가 서로 다른 etype6개·개별 AI·개별 모델이라는 근거는 없다.
- `_BOSS_MOVESET`의 최초 기본에는 cageTrap이 있지만 최종 10009–10010에서 전 스테이지 삭제한다. idx41 예약은 남고 score -1(37651), 강제 시작은 recover25뿐(38020–38023). 2장 활성 기술이 아님.
- 현재 기본 빌드 식은 `(window.EXODUSER_BUILD_TARGET||'demo')==='demo'`, `_DEMO_LAST_STAGE=0`(16644–16648). 데이터 등록만으로 기본 데모에서 2장 정상 진행을 검증했다고 하지 않는다. bosstest 요청(3467/31540–31541/30793–30795)과 일반 진행은 별개. 이번 실제 빌드 target·도달 실행은 **미확인**.
- `_isNormalDruidBoss`(16938)는 si0/3, `_isDruidFinale`(17054–17055)는 stage3 조건을 요구해 si4~9에서는 모두 false. 2장에 드루이드 피날레 HP·독탄·전조 잠금·추가 AI를 이식하지 않는다.

### 1.2 등록과 생성식

| 원본 행(game.html) | 데이터·소비 | 정확 경계 |
|---|---|---|
| 9820–9880 / 9881–9950 / 9951–9957 | BOSS_MOVES / COMBOS / PHASES | 전체59기술·68콤보·5페이즈. 2장 union32, 1장 공통22/추가10. union 기술의 11필드 전부 부록 A; 적용 콤보38개 전부 부록 B |
| 9968–9975 / 10009–10010 | 2장 Set 누적·최종 삭제 | Set 순서와 BOSS_MOVES 배열 순서는 다름. score 후보는 배열 순서, Set은 허용 여부만. 최대 활성 idx56(rapidMissile), idx59/60 CD 문제를 CH2 도달 결함으로 확대하지 않음 |
| 6311 / 9272–9278 | 난이도 | 기본 diff5; 레벨 offset `[-500,-400,-300,-200,-100,0,100,200,300,400,500]`, dm `[.45,.55,.65,.76,.88,1,1.12,1.25,1.40,1.58,1.78]`. 잘못된 인덱스의 `\|\|` fallback도 보존 |
| 14355–14356 | BOSS_HP_MULT8/ATK3, FINAL15/5 | 정의는 있으나 아래 현행 HP/ATK 식의 피연산자가 아님. si9도 이름/last라는 이유로 FINAL15/5 배율을 쓰지 않음 |
| 30697–30814 | `genBossArena/_enterBossArena` / 구조·초기화·생성 | hell1 직사각형128×108, T40; entry(64,103), 중심(64,54), 출구(64,1). 중심 월드(2580,2180). G 상태·배열 정리 후 1보스 생성/등록·스폰·음향. 맵 제작 이식은 별도 소유 |
| 31119–31134 | `_enemyHpPacing`, mkEn guard | 비유한 좌표 null; 충돌 먼저 ib반경22로 canMv→safePt 없으면 null. 생성 몸반경은44. ib이면 elite0/mods[]이며 et.hpMul/atkMul/scaleMul=1 |
| 31125–31152 | 레벨·HP·ATK | 아래 식. monLv200 메타데이터를 플레이어 현재레벨 대신 대입하지 않음. 중간 `_plvMul/lvScale/atkScale` 변수는 현행 보스 최종식에 사용되지 않음 |
| 31162–31183 / 31362 | 반환 레코드·skin | HP=mhp=poise=maxPoise=eShield=eShieldMax=H, atk=baseAtk=A, speed=baseSpd=.5, r44; s=idle, st2=30+u50, facing=u2π, projCd50, bossPatCd35, bossPatT30+u20, phase0/combo null/idx0/moveCDs59×0/lastMoves[]/reviveIframes0. projT·orbit·erratic RNG까지 BC02의 six-draw 계약 참조. `_assignMobSkin` 포함 공통 초기화 미소유를 생략해 실제 생성 완료로 보고하지 않음 |

`L=max(1,(P.lv||1)+(DIFF_LV_OFF[OPT.diff]||0)+(G._stageDiffOff||0))`, `dm=DIFF_MUL[OPT.diff]||1`, `p=1/(1+min(9,max(0,L-1))/18)`.

`C=(L<=500 ? .4*L*L*L+199*L+100 : 50000000*1.0014^(L-500))*2.925`.

`H0=floor(C*p*24*dm)`, **`H=floor(H0*(1+si*.02))`**, `A=floor((75+L*2.9)*.6*dm)`. 위 `^`는 거듭제곱 표기이며 JS XOR 구현이 아니다. 초기 HP에는 `~~`를 쓰지 않는다.

아래는 dm1·위 식을 전사한 산술 표본이며 게임 또는 Godot 실측값이 아니다.

| L | H(si4) | si5 | si6 | si7 | si8 | si9 | 全si共通A |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 1 | 22,698 | 23,118 | 23,539 | 23,959 | 24,379 | 24,800 | 46 |
| 10 | 125,854 | 128,185 | 130,515 | 132,846 | 135,177 | 137,507 | 62 |
| 100 | 21,228,480 | 21,621,600 | 22,014,720 | 22,407,840 | 22,800,960 | 23,194,080 | 219 |
| 500 | 2,532,234,182 | 2,579,127,408 | 2,626,020,633 | 2,672,913,859 | 2,719,800,684 | 2,766,700,310 | 915 |
| 501 | 2,530,738,080 | 2,577,603,600 | 2,624,469,120 | 2,671,334,640 | 2,718,200,160 | 2,765,065,680 | 916 |

L500/501에서 곡선이 연속이라고 가정하지 않으며, 2³¹을 넘는 HP를 Int32로 통일하면 달라진다. 원래 phase 회복·50% 부활의 `~~`는 그 위치에서 별도로 유지한다. 공식 평활화·정수 넘침 수정은 이번 제안이 아니다.

## 2. 패턴·진행·연출·부활의 원본 추적

### 2.1 공통 시계·선택·페이즈와 2장 분기

| 원본 행(game.html) | 함수·단계 | 적용 내용 / 기존 공통 참조 |
|---|---|---|
| 37650–37699 | `_bossScore` | cage/phase/Set/CD gate 뒤 거리Gaussian·이력·P상태/이동·counter·combo·phase/novelty·마지막난수. 상세식/순서는CH1 §2.1/BC03. si2전용얼굴+2,si0/3전용melee×3은CH2에서false. metadata.combo의meteor등이Set밖이어도등록값보존 |
| 37701–37710 | `_bossStartPattern` | 보호 `_PARRYABLE_ATK`읽기,tele=`~~(mv.tele*BOSS_PHASES[phase].teleM)+extraDelay`;si2×1.4/finale최소tele는CH2비적용. tele\|\|fallback과case고정값구분. start함수자체는selector의phase/Set gate재검증없음 |
| 38315–38372 | `_bossIdleMove` / combat state | 공통engage/retreat/orbit등,canMv XY/X/Y순서·P상태·난수는CH1계산재사용. 고유‘벌레’AI는확인되지않음 |
| 38373–38441 | `_bossAI` | idle중만CD감산0~58,bossPatT/거리20~500·combo지속·상위6가중추첨·이력5건. 38combo는모든seq가Set내부+phase일치로추림. seq중복병합금지. 순서·draw수·실패시소비를BC04로재사용할chapter데이터계약필요 |
| 34444–34457 / 38584–38644 / 38771 / 38874–38884 | updateE 접두·return 순서 | lesson/telegraph/wall/무적·KB·hitstun/stun/freeze gate먼저. 매tick baseAtk계열재계산이있어phase/즉시부활ATK강화가영구base강화가아님. aura·일반탄charge·facing·st2-=sp는boss state switch보다먼저 |
| 40444–40454 | phase→idle이동→AI→Wind feint→switch | alive보스의phase체크후선택한새state를같은tick소비가능. 별도1tick지연AI/공격중CD감산으로바꾸지않음. freeze중idle조기return보존 |
| 38235–38314 | `_bossPhaseCheck` / aura | HP비율>.80/.60/.40/.20에서0~4,최고해당phase로바로상승. 증가시만HP=max(current,~~(mhp*ph.hp[1])),iframe90,atk~~×1.3(다음tick재계산),speed=min(×1.15,1.8+phase*.1),maxPoise~~×1.2/현재poise유지,patCd=max(20,~~(cd*(.9-phase*.05))). recover45/patT10/combo reset/CD첫59개0 |
| 38266–38314 | 일반 phase 효과 | P뒤80+phase25로난수각/충돌safePt. 충격R100+phase30,damage~~atk*(.4+phase*.1),KB10,8+phase4발의redBean과HSL일반탄교대. hitStop/slow60+phase15/shake14+phase4/groggy+120ms뒤fallback포효. HP+30%문자와실제회복식구분 |
| 41375–41386 | 공통 종료 | recover는ib일때st2>20을20으로clamp,idle대기3+u5. bossRec는clamp를거치지않아fanWave40f유지. 부활recover90/60도같은clamp대상. 임의교체금지 |

CH1 §2.1~2.3의 공통 소비·투사체 후처리·보호 Q/E·hurtP/hurtE 권위를 참조한다. CH2는 모두ib/type0/물리이므로 일반etype0 잡몹으로factory에 통과시키는 대안은 성립하지 않는다.

### 2.2 32기술의 시작→상태→지연 소비

다음 표는 최종Set union32 전체를 원본 선언순으로 열거한다. 행은game.html,상태범위는case부터다음case직전(주석포함),공통끝recover/bossRec는§2.1이다. 공통22는CH1 §2.3의동일ID본문을재사용하며 아래도달행으로대응한다. 추가10은§2.3~2.4에서계산과부작용을추적한다. 비활성분기나전체59기술을2장유효32에섞지않는다.

| id / 재사용 | 시작 case 행 | 상태 소비 행 | 별도 소비 |
|---|---|---|---|
| `burst` / 공통 | 37713–37713 | `bossBurstWind` 40562–40570 | 상태 안에서 판정/발사 |
| `fan` / 공통 | 37714–37714 | `bossFanWind` 40646–40663 | 상태 안에서 판정/발사 |
| `charge` / 공통 | 37715–37715 | `bossChargeWind` 40664–40667; `bossCharge` 40668–40689; `bossShock` 40752–40759 | 상태 안에서 판정/발사 |
| `jump` / 공통 | 37716–37719 | `bossJumpWind` 40690–40690; `bossJump` 40691–40709; `bossShock` 40752–40759 | 상태 안에서 판정/발사 |
| `shock` / 공통 | 37722–37722 | `bossShockWind` 40749–40751; `bossShock` 40752–40759 | 상태 안에서 판정/발사 |
| `summon` / 공통 | 37723–37723 | `bossSummonWind` 40798–40815 | 상태 안에서 판정/발사 |
| `grab` / 공통 | 37728–37729 | `bossGrabWind` 40837–40851; `bossChargeWind` 40664–40667; `bossGrab` 40852–40868; `bossCharge` 40668–40689; `bossShock` 40752–40759 | 상태 안에서 판정/발사 |
| `spin` / 공통 | 37730–37730 | `bossSpinWind` 40869–40871; `bossSpin` 40872–40890 | 상태 안에서 판정/발사 |
| `mine` / 공통 | 37731–37731 | `bossMineWind` 40891–40904 | 상태 안에서 판정/발사 |
| `vortex` / **추가** | 37732–37732 | `bossVortexWind` 40905–40907; `bossVortex` 40908–40941 | 상태 안에서 판정/발사 |
| `multiDash` / 공통 | 37733–37733 | `bossMultiDashWind` 40942–40948; `bossMultiDash` 40949–40978 | 상태 안에서 판정/발사 |
| `slashCombo` / 공통 | 37734–37734 | `bossSlashWind` 41074–41078; `bossSlash` 41079–41110 | 상태 안에서 판정/발사 |
| `slam` / 공통 | 37735–37735 | `bossSlamWind` 41111–41118; `bossSlam` 41119–41143 | 상태 안에서 판정/발사 |
| `sweep` / 공통 | 37736–37736 | `bossSweepWind` 41144–41148; `bossSweep` 41149–41184 | 상태 안에서 판정/발사 |
| `beanStorm` / 공통 | 37755–37755 | `bossBeanStormWind` 41185–41188; `bossBeanStorm` 41189–41206 | 상태 안에서 판정/발사 |
| `beanRain` / **추가** | 37756–37756 | `bossBeanRainWind` 41207–41210; `bossBeanRain` 41211–41231 | 상태 안에서 판정/발사 |
| `fanWave` / **추가** | 37757–37757 | `bossFanWaveAim` 40571–40606 | 상태 안에서 판정/발사 |
| `chaseAoe` / 공통 | 37759–37768 | `bossChargeWind` 40664–40667; `bossCharge` 40668–40689; `bossShock` 40752–40759 | _chaseAoes:37015–37052 |
| `elemBall` / 공통 | 37769–37791 | 시작 후 recover | 시작 즉시 wrapper→spawnProj |
| `spiralBullet` / **추가** | 37832–37845 | 시작 후 recover | _spiralBullets:37057 |
| `groundFissure` / 공통 | 37931–37948 | 시작 후 recover | _fissures:37067 |
| `tideWave` / 공통 | 37949–37963 | 시작 후 recover | _tideWaves:37069 |
| `seekerMines` / 공통 | 37964–37978 | 시작 후 recover | _seekerMines:37071 |
| `wallPush` / **추가** | 38003–38012 | 시작 후 recover | _wallPushes:37077 |
| `poisonTrail` / 공통 | 38013–38019 | `bossPoisonDash` 41327–41336 | _poisonPools:37079 |
| `shieldBash2` / **추가** | 38048–38053 | `bossSBashWind` 41337–41339; `bossSBash` 41340–41351 | 상태 안에서 판정/발사 |
| `lavaPools` / 공통 | 38085–38117 | 시작 후 recover | _lavaPools:37129 |
| `fireRain` / **추가** | 38118–38133 | 시작 후 recover | _fireRains:37131 |
| `shockGrid` / **추가** | 38134–38148 | 시작 후 recover | _shockGrids:37133 |
| `donutSlam` / **추가** | 38149–38160 | 시작 후 recover | _donutSlams:37135 |
| `crossWipe` / **추가** | 38178–38191 | 시작 후 recover | _crossWipes:37139 |
| `rapidMissile` / 공통 | 38212–38234 | 시작 후 recover | 시작 즉시 wrapper→spawnProj |

2장 공통22의 장별 차이도 빠뜨리지 않는다.

| 원본 행(game.html) | CH2 적용 차이 / 참조할 공통 내용 |
|---|---|
| 16938–16957 / 37769–37791 / 40646–40688 | fan/elemBall은 드루이드 thorn/straight/poison 분기가 아님. 일반 fan 요청 수는 `~~(max(10,4+min(stage,5))*(1+(phase-1)*.12))`, raw black×1.5/red×2.8 등 공통 원문 유지. charge는 wind 내내 P 방향 추적(드루이드 마지막18f 고정 제외), speed35/duration50·충돌XY/X/Y fallback·막힘 shock 등 CH1의 일반 분기 재사용 |
| 40798–40815 | summon 수=`3+~~(stage*.5)`→si4~9 `[5,5,6,6,7,7]`. child type 추첨 `[0,2,3,3,3]`, 속성 추첨·canMv/safePt·HP절반/실드0·ens push 순서 보존. Godot etype0 소환굴 지원만으로 이 전체 분기를 지원했다고 하지 않음 |
| 40869–40890 / 41111–41143 | spin R=`500+stage*15`→560~635, slam 기본 R=`1000+stage*30+phase*80`→phase0 1120~1270. 장 이름으로 사거리 축소나 공격식 재설계 없음 |
| 37759–37768 / 37015–37052 | chaseAoe의 `druid`는false; src 참조 유지/10발·interval60/r450/delay90/atk×2와 즉시 charge 시작을 분리. 큐만 갱신하고 보스 상태를 누락하지 않음 |
| 37931–37978 / 38013–38019 / 38085–38117 / 38212–38233 | groundFissure/tideWave/seekerMines/poisonTrail/lavaPools/rapidMissile도 원래 공통 구현을 참조. stage·actor phase와 함수 phase는 원래 읽는 위치로 전달. CH1의 normalDruid 색·탄 옵션을 CH2에 무조건 주입하지 않음 |
| 19973–20001 / 20107 / 20196–20217 / 16947 이후 spawnProj 계열 | 공통 poise·projectile charge·몸 방향·투사체 후처리는 별도 소유. 여기의 탄 수·속도·피해는 **요청(raw)** 값이며, 밀도 제한/속성·black/redBean 후처리 후 잔존/피해를 의미하지 않음. 상세 실제 소비 행은 CH1 §2.5 및 기존 투사체 모듈 참조 |

### 2.3 1장 union에 없는 4개 상태 계열

아래의 `phase`는 actor의 `_bossPhase`를 뜻하는 곳과 시작 인수 phase를 구분했다. 시각 효과 RNG도 원본에서는 같은 Math.random을 소비하므로 단순 게임플레이 RNG로 대체하지 않는다. Q/E 분기식은 관측만 하며 **보호**다.

| id / 원본 행(game.html) | 시작·계속·종료의 정확 계약 |
|---|---|
| vortex / 37732,40905–40941 | 시작 `bossVortexWind`, st2=tele\|\|30. wind 끝 `bossVortex`80. 매 tick speed*.4*sp로 P쪽 접근, canMv XY→X→Y. R=180+stage5→200~225, 15<pd<R면 pull=3+actorPhase1.5를 P.kb에×sp*.1 누적. pd<40/iframe<=0/not charge/st2%30<sp면 magic damage~~(atk*.6*elMul). 종료 폭발 R100+stage5→120~145, 같은 무적/charge gate, ~~atk2*elMul/KB15. 입자·shake12·groggy 후 recover65→다음 공통처리20clamp |
| beanRain / 37756,41207–41231 | 시작 wind tele\|\|35, `_brT=0,_brDur=80+시작phase*20`. wind는 P facing 추적. active st2=_brDur, `_brT+=sp`, facing 매 tick 추적. `~~_brT%5<sp`일 때 cnt=`1+~~(actorPhase*.3)`→phase1~3 1발/phase4 2발(강제phase0도1). 각 탄 angle±.6, spd2.2+u2(black도 이 draw 소비), black/red coin50%; black속도4/raw피해~~atk1.5/life400, red속도spd/raw피해~~atk1.8/life300/homing. spawn좌표±7.5 draw·wrapper 요청. sideways speed*.5*sp*sin(brT*.03)*.8, XY canMv만. 끝 recover30/작은shake. 주석의 ‘2~4개’보다 실제 cnt식 우선 |
| fanWave / 37757,40571–40606,41375 | **metadata.tele60이지만 고정 st2=90**, `_fwAng=현재P각` lock, `_fwR=500`. 전조 중 particle RNG, 발사 시 90도(±π/4)·pd<500/iframe<=0/not charge gate. raw `~~(atk*2.5)` 후 ~~(*elMul); isPWin 분기의 기존 반격×3·stunned60/poise20/은행·doParry 유지. 일반 피격 KB15. shQuery 안 살아있는 비보스만 동일 부채꼴에서 KB12. `_fwFx={ang,w:π/2,r,t0,maxT20}`·입자25·detonate/shake15. **bossRec40**을 사용하므로 recover의20clamp를 적용하면 달라짐 |
| shieldBash2 / 38048–38053,41337–41351 | 시작 `_sbAng=P각` lock, wind tele\|\|20; wind의 e.facing은 P 추적하지만 dash는 저장 _sbAng. active18,9*sp 이동, canMv XY만(축별fallback 없음). 거리<Pr+er+20/iframe<=0이면 기존 parry×3/stunned60/poise25 또는 not charge일 때 ~~atk1.8*elMul/KB10/P stun=max(기존,~~(45*(1-min(.5,stunRes)))). 접촉 outer gate를 통과하면 P가 charge라 피해를 안 받아도 recover30; 시간 끝 recover25. 일반 etype6 shieldBash와 별도 상태 |

추가 상태 소유 필드: `_brT,_brDur,_fwAng,_fwR,_fwFx,_sbAng` 및 s/st2/facing/speed/x/y. P.kb·P.stunned·shQuery 비보스 KB·hurtP/hurtE·SFX·VFX·RNG가 실제 부작용 접점이다. 독립 계산 단계에서는 command를 반환하고 실제 소유자 ack 없이 실행됐다고 표시하지 않는다.

### 2.4 1장 union에 없는 6개 지연 큐

| id / 생산→소비 행(game.html) | 생성값·시간·판정·종료 |
|---|---|
| spiralBullet / 37832–37845 → 37057 | `_spiralBullets`: x/y는 시작점, baseAng=P각, actorPhase로 arms=3+min(ph,2), dir coin±1; raw~~atk1.2/EL.P/col. **CH2 전원 물리라 windup60, maxT240, nextShot60**, interval6, src=e. 시작 recover45. 소비는 t+=sp 후 t>=windup일 때부터 nextShot-=sp; nextShot<=0/t>=windup/t<maxT 때 reset interval, rot=t*.04*dir, 각 arm 속도3.5/life200/sz1.5/r4/_commit:true로 **spawnProj 직접** 요청. 따라서 ‘전조60 끝 즉시발사’로 단순화하면 다름. _commit은 해당 밀도 제한 회피 근거이며 나머지 후처리 전체 회피를 뜻하지 않음. t<maxT만 유지 |
| wallPush / 38003–38012 → 37077 | `_wallPushes`: 시작 P각, t0/maxT60/dist0/maxDist2000/w1300/spd35/raw~~atk1.2/el/src/hitfalse; recover30. t+=sp,dist+=35sp, 이동중심 계산 후 !hit/iframe<=0/abs(parD)<25/perpD<w/2이면 hit=true→~~dmg*elMul/KB12/block/shake10. **charge 제외 gate 없음**. 충돌 검사 뒤 dist>=2000 또는 t>=60 제거 |
| fireRain / 38118–38133 → 37131 | `_fireRains`: actorPhase N=12+ph4, 맵 중앙70%영역에 x/y draw와 r400+u200; 각 delay30+i6,raw~~atk1.5,el,hitfalse(src 필드 없음). recover40. t>=delay 때 hit=true를 먼저 써서 1회 폭발·lava_erupt·shake4. pd<r+Pr/iframe<=0/not charge이면 ~~dmg*elMul/KB6; 입자8. hit 뒤 fadeT+=sp/20도달 제거; 미hit의 t>delay+30 fallback 제거도 원문 보존 |
| shockGrid / 38134–38148 → 37133 | `_shockGrids`: arms6+actorPhase,각2πi/arms, len=~~(max(mw\|\|50,mh\|\|42)*40*.6), w250+ph25,warn60,max210,tick0,raw~~atk1.8; recover35. t>=warn 때 tick+=sp, tick>=25/iframe<=0이고 parD>0<len/perpD<w일 때만 tick0·~~dmg*.3*elMul. 범위 밖에선 tick을 리셋하지 않음. charge 제외 없음. t<maxT만 유지 |
| donutSlam / 38149–38160 → 37135 | `_donutSlams`: inner80+er(초기124), outer=~~(max맵치수*40*.5),warn90,max120,raw~~atk2.5,hitfalse; recover50. t>=warn에서 hit=true를 먼저 기록. 실제 판정은 **`(pd>innerR\|\|pd>outerR)`**와 iframe<=0/not charge. 정상 outer>inner면 inner밖 전체이며 outer밖도 포함; ring 내부 AND로 ‘수정’하지 않음. ~~dmg*elMul/KB12·detonate/shake25/입자30. t<maxT만 유지 |
| crossWipe / 38178–38191 → 37139 | `_crossWipes`: len=~~(max맵치수*40*.55),w350+actorPhase50,t0/max300,rotSpd0/phase0/warn60,raw~~atk2,tick0,waves2+~~(ph/2);recover45. waveLen=~~(maxT/waves),wave=~~(t/waveLen),local=t-wave*waveLen,angle0=waveπ/4. t>=warn부터tick누적. tick>=20/iframe<=0/local>=30이면 **범위검사보다먼저tick0**,4방향parD>0<len/perpD<w의첫명중에~~dmg*.4*elMul. charge제외없음. t<maxT만유지 |

새6큐는 보스recover중에도G측에서진행한다. src유무·actor참조·배열안정압축·hit기록순서·iframe/charge차이·draw순서를획일화하지않는다. CH1공통큐 `_chaseAoes,_fissures,_tideWaves,_seekerMines,_poisonPools,_lavaPools`는§2.2소비행/CH1 §2.3참조. 큐를각각timer노드로분산해원본tick순서를바꾸는설계는미승인이다.

### 2.5 HP0·부활·최종 종료

공통정본은 [REVIVE_SHIELD](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1.3 B01~B09다. CH2전용부활시스템을추가하지않는다. 2장은hell1이라H7배증/드루이드lastStand분기는false다.

| 원본 행(game.html) | CH2 적용값·전이 |
|---|---|
| 42124이후/42515–42545 | hurtE보스경로·HP0:deaths++,sup=antiRevive+처음포함된holyPrison의 `.15+((lv\|\|1)-1)*(.15/9)`. cost10+sup>0일때~~min(5,sup10+2)+zone3+P풀HP2를 **판정전** points에서소모,하한0 |
| 42519 / 42533–42538 | `_maxGuar=hell+1=2`는선언만있고판정에는미사용. 즉시chance=max(0,2+stage*.05-(deaths-1)*.15-sup),**상한1clamp없음**. 초회/억제0은2.20~2.45,points>0이면u∈[0,1)비교통과지만‘정확2회보장’으로해석하지않음 |
| 42547–42622 | 즉시성공:hp=mhp,shield/max0,phase0,alive/recover90/stun0,judged=true,combo/feint/delay reset,maxPoise~~×1.5/poise~~새max*.25,iframe90,atk~~×1.5(다음tick base재계산),speed=min(×1.25,1.6),patCd=max(60,cd-30). 초기35→60이라항상단축은아님 |
| 42561–42583 / 34444–34450 | origR보존,r=max(10,~~(origR*max(.4,pts/max(1,maxPts\|\|150)))). 구위치VFX는축소전r,P뒤80+deaths20로난수각·canMv/safePt,구/신boss_revive_boom **5f/frame**,spawn55,grand pending40. spawn은원본--,pending은sp감산이라동일시간원으로간주금지 |
| 42585–42610 | 충격R100+deaths30/dmg~~atk*(.5+deaths*.15)/magic/KB12,2차이후ring8+deaths4발,10%동반부활. `_killedBosses`는etype저장/현재etype제외라전원etype0인6개별부활이력을도출할수없음. 호출 `mkEn(...,stage,0,true,_cet,0)` 인수위치도원문대로기록,etype/속성을추측수정하지않음 |
| 41554–41578 | 공통grandVFX: flash14/흰색,입자3링(16+ring10,속도10+ring5),blast light r×14/9/5,impact r×8/5,hitStop최소16/slow최소90/shake30/chroma최소18. pending40소진때호출하며새CH2연출함수를만들지않음 |
| 42640–42649 | 즉시실패/!judged일때judged=true/timer180/구좌표. points0이면chance0/roll1,그외chance=max(0,1.5+stage*.05-deaths*.25-sup)와roll을그때저장. `_bossRevived=true`는timer활성표시이며성공확정이아님 |
| 34493–34535 | dead측timer-=sp,기한에저장roll<chance판정. 성공시points추가-10/hp=~~(mhp*.5)/shield0/alive/구위치/recover60/stun0/kb0/iframe90/judged=false,G.bossAlive/ref갱신,반경축소/5f portal/spawn55/grand40. 이분기자체에는phase0/즉시측강화·combo reset없음. 실패timer0/revivedfalse,G.bossAlive는30framecheck까지유지 |
| 41816–41863 / 52281 | `checkRooms`의 보스 종료 체크는 매30실frame(`_crT+1`). alive boss또는ib&&timer>0이면출구닫힘. 완전종료후bossAlive=false,clearTime,etype기록,victory/상자/출구생성. 즉시HP0때승리확정금지 |
| 41921–42009 | 출구접촉뒤stageCleared/SP10/clear record등. si9는hellCleared[1]대상. 진행·보상·저장호출은기존소유,저장에actorHP/phase/queue추가제안0 |

에너지실드는생성때H,부활때0이다. bossShieldF강제표시는원본과동일하지않다(§2.6). 플레이어쓰러짐/재기·재도전리소스완충은기존REVIVE/RESPAWN참조이며보스180f자동부활과구분한다.

### 2.6 연출·HUD·시청각 자산 경로

| 원본 행(game.html) / 자료 | CH2의 실제 선택·소비 |
|---|---|
| 9164 / 30782–30814 / 41784–41814 | `_bossCine` max180과 spawn/entry 연출. 입장 phase 50/130/50/100과 별도 cine·slowMo .35는 서로 다른 타이머. 입장phase4 시작에 stunned90/reviveIframes110·flash10/chroma12/slow최소60·입자32/빛2층을 적용(41798–41810). 스폰·입장 포효는 기존 fallback, 새 ‘벌레’ 연출/보이스 정의를 추정하지 않음 |
| 10740–10744 / 10986–10998 / 23149–23152 | CODEX 보스 정의는 si0~3만. `_assignBossSkin`은 atlas boss0~34를 쓰라는 빈 no-op. 외부 `atlas_bosses.png?v=3`/JSON?v3 로더가 실제 2D 경로 후보. 6이름으로 6개 CODEX override가 있다고 하지 않음 |
| 23499–23530 / 53553–53614 | CODEX가 없고 외부 atlas ready면 `boss_<G.stage>`와 `_getBossAnimState`로 선택. frame floor(now/250)%길이·palette·r 기반 scale·facing flip. rage는 hp/mhp<=.5의 애니메이션 선택이며 AI phase 0~4와 별개. 외부 atlas 불가 시 bossWalk/내부 atlas/UV/procedural body 등 fallback. 실제 로딩 성공·선택 화면은 **미확인** |
| 20107 / 52999–53031 / 53265–53273 | 물리 나선탄 charge, fanWave 고정90 진행과 부채꼴, vortex R200~225 표시. `_fwFx.t+=_dtSp`가 **draw 안에서 실행**되고 끝에null이므로 읽기 전용 render라 가정하지 않음. vortex wind 진행 분모30은 실제 tele와 다른 표시식 |
| 57560–57586 / 57587–57615 / 57616–57635 / 57655–57676 / 57964–57979 | fireRain 경고원→폭발fade20/lava_erupt, shockGrid 점선→전격, donut inner 안전원/outer ring, crossWipe 파동별 45도 회전/30f 진입, wallPush 이동벽의 원본 렌더. 렌더 폭 sg.w/cw.w와 피해의 perp<w가 같은 전체폭인지 추정해 고치지 않음 |
| 26486–26501 / 53614 이후 | hell별 발밑 fog/공통 phase aura·포이즈·상태·무적·spawn fade. 2장 독자 아트셋 완성의 증거가 아니라 공통 테마 적용 경로 |
| 64947–64982 / 65093 이후 / 65148–65192 | 3D `_B3_MODELS`는 hell0만 등록. **hell1은 `_B3_DEFAULT` Meshy_AI_1**(Alert/Walking/Monster_Walk/Running/Unsteady_Walk 등 공통13state→5파일). 6종 전용 모델 근거 없음. alive arena 보스를 찾아 ready 모델이 활성일 때 `_spawnT=999` 등 2D 억제. 2D와3D가 항상 동시에 보이는 것으로 해석하지 않음. 세대별 load guard/병렬cap·Three 내부 구현은 기존 소유이며 실행 미확인 |
| 24758–24764 / 30812 / 38308–38314 / 41808 | `_BOSS_SFX`는 si0~3만, CH2 `_bossSfx`는null. 생성/입장/phase는 공통 boss_howl·boss_howl1 fallback. 부활 boss_revive/완전사망 boss_final_death는§2.5의 호출 시점. 6개별 pitch pack·전용 대사 미확인 |
| 2701 / 35827–35885 | HUD 이름은STG.bn, deaths suffix·HP/poise·상태 표시. **bossShieldF 폭0**; 실제 eShieldMax가 있다고 파란 boss 실드바 표시를 가정하지 않음. bKey는isHellBoss로 결정해 si4~8=`boss`,si9=`finalboss`. hell별 파일 등록표만 보고 실제 BGM 소비키를 바꾸지 않음 |
| 30763–30770 / 31555–31558 / 63486–63489 / 64282–64286 | arena/stage/retry/testbed 공통 큐 초기화. 새6 큐 각각 초기화와 생존기간이 있으므로 보스 죽음에 일괄 소멸한다고 추가하지 않음. 60069의 AI hazard 목록은 전체 큐 목록이 아님 |

텍스트 자산 목록 확인: `atlas_bosses.json`의 boss4~9 상태별 프레임 수는 부록 D. PNG/GLB는 Git blob 존재·크기만 확인했고 픽셀·모델·모션 품질을 열어 검수하지 않았다. `atlas_bosses.png` blob `4546568b3c877d0c76f8006dcb9673a89fa072ba`(1,356,155byte), JSON blob `3f2591aef1ae542321ab5e335b2f3b6cc7586d5a`(196,464byte), default Alert GLB blob `38e35bb2df4ef7858c139cb04a0af237217253af`(5,642,724byte). **blob ID는 SHA256이 아님**. 에셋을 Godot에 복사하거나 새 바이너리를 만들지 않았다.

`index.html` 전체에서 `BOSS_MOVES`, `_bossStartPattern`, `벌레 수호자`, `여왕 구더기` 직접 문자열은 각각0. 슬롯·진행의 로비 경로와 전투 로직을 혼동하지 않으며, 로비/서버/저장 추적은 기존 SAVE 소유다. 이 음성·그림·3D 자산의 실제 화면 우선순위/실재 로딩은 정적 호출 경로 이상의 증거가 없어 **미확인**이다.

## 3. docs와 현행 원본의 대조

지정 두 폴더는 보스 문서8개·부활 문서3개를 확인했다. 2장6이름의 독립 무브셋·HP·연출 설계서는 이 범위에서 발견되지 않았다. 아래 ‘공백’은 원본이 없는 뜻이 아니라 docs에 독립 계약이 없는 뜻이다. 원문 수정·밸런스 정정은 하지 않는다.

| ID | docs 행 / 문구 | 최신 main game.html 근거 | 판정·이식 지침 |
|---|---|---|---|
| C201 | BOSS_BATTLE_SETTINGS220/233/235, 전체49종·null전체 해금 | 9820–9880/9968–9975/10009–10010 | 실제 전체59, CH2 최종27~32/union32. 옛49 요약으로 카탈로그를 잘라 만들지 않음 |
| C202 | 같은 문서228, fanWave→wallPush→shieldBash2→spiralBullet 점진 해금 | 9969–9975 | 요약에서 si5 seekerMines 누락. si4부터 vortex/beanRain/fireRain/shockGrid/donutSlam/crossWipe 포함. 단계별 Set 전부 부록 A 기준 |
| C203 | 같은 문서37 최신 전체cage금지 vs226/237–257 옛 타보스 사용 계약 | 10009–10010/37651/38020–38023 | 최신37과 원본 일치. 옛 섹션은 이력, 2장 cage 활성화 금지. CH1의 같은 결론 참조 |
| C204 | 같은 문서193, ATK×1.3 강화 | 38249–38254/38771 | 강화 대입은 있으나 공통 tick에서 base 재계산. 영구 baseATK 강화로 확대 금지. CH1 §3 동일 항목 참조 |
| C205 | 같은 문서197, 빨콩50%+무지개50% | 38292–38297/16938–16957 | HSL 일반 탄을 생성하는 경로이며 rainbow 플래그를 세팅한 전용 탄과 같다고 할 수 없음. 보호된 black/red/일반 후처리 분류 유지(CH1 공통 차이) |
| C206 | 같은 문서550–556, fanWave bossRec40 | 40571–40606/41375–41376 | **일치**. 일반recover20 clamp와 구분. 메타데이터tele60은 실행고정90을 대신할 수 없음(37757) |
| C207 | 같은 문서297–327, 미등록 장 Meshy_AI_1 fallback | 64947–64982 | **일치**. 2장6전용 GLB라는 근거 없음. 6전용 atlas 키는 별도 경로(§2.6) |
| C208 | 부활 설계36/39, portal 3f/frame | 42572/42580/34520 | 실제5f/frame. 기존 REVIVE_SHIELD §2 X07과 같은 차이, 새 규격/모듈 작성 없이 참조 |
| C209 | 부활 설계34/42, SPD×1.25/쿨-30/반경식 요약 | 42557–42565 | speed cap1.6,cd최소60,r최소10+~~가 필요. 초기cd35→60 가능. 기존 REVIVE X08/X10 참조 |
| C210 | 부활 설계30 ‘보스 절대 사망 안 함’ | 42538/42640–42649/34493–34535 | 즉시성공 시return만 뜻함. points/확률 실패 후 폴백·최종사망이 있으므로 불사 actor로 구현하지 않음 |
| C211 | 부활 설계32 및 원본42519의 장별 ‘보장’ 주석 | 42519/42533–42538 | points식 자체 일치, `_maxGuar=2`는 사용되지 않음. 실제 확률>1을 그대로 비교하며 정확2회 보장 정책을 새로 만들지 않음 |
| C212 | 부활 설계235, 실드파랑 오버레이 ‘보스바와 동일 구조’ | 35827–35885 | bossShieldF 폭0. 데이터 실드·enemy표시·boss HUD 혼동 금지. REVIVE X15 참조 |
| C213 | beanRain 주석 ‘5f마다2~4개’(별도 docs 상세공백) | 41215–41220 | 실제cnt1+~~phase*.3=1~2. 주석을 공식 대신 이식하지 않음 |
| C214 | spiralBullet 상세 발사시각 docs공백 | 37838–37842/37057 | windup60와nextShot60을 별도로 유지. 시작60f에 즉시 발사하도록 단순화 금지 |
| C215 | donutSlam 정식 판정 docs공백 | 37135/57616–57635 | 표시ring과 실제 `(pd>innerR\|\|pd>outerR)` 차이 기록. 원본 OR를 AND로 바꾸는 것은 이식 범위 아님 |
| C216 | 별도2장 보스별 수치·고유 AI·부활·연출 docs공백 | 16690/30782/31119–31183/§2 | 6이름·누적Set·공통보스의 현행 근거만 채택. 의도한 벌레 고유6종 미술/특수AI·스토리·부활횟수는 **미확인** |
| C217 | 드루이드 피날레·재시작 리소스 문서 | 16938/17054–17055/si4~9 조건 | 예외 대상이 달라 불일치로 오판하지 않음. CH2에는일반 boss 부활, 플레이어재시작은RESPAWN 기존소유 |

## 4. Godot 의존과 빠진 것

### 4.1 기준 main의 실제 경계

| 확인 경로·행 | 존재하는 것 | CH2 결손 / 판단 |
|---|---|---|
| `scripts/native_ch1_boss_*.gd` 7개 / 원격§0.2 | 원격BC01~07 개별 모듈·테스트·보고서 확보 | 기준main에7파일 모두 없음. 이번main기준 문서에 통합됐다고 적지 않음. BC07은 제출 전 재조회에서 확인 |
| `scripts/enemy_factory.gd:151–171` 및 target별 guard | 기존 한정 일반몹 record/AI profile·정확script 지원 | CH2 ib/type0 생성권한 아님. 6보스 데이터/actor/factory/arena의 정식 owner 없음 |
| `scripts/enemy.gd:484` / `native_normal_enemy_hurte.gd:150–151` | 일반몹hurtE 소유·의도적 거절 | ib이면 `boss_hurtE_not_adopted` / `unported_branch_active:boss_hurtE`. 즉시/폴백 부활·보스특수피격 연결을 기존일반몹으로 우회 금지 |
| `port_modules/source_init_stage_entry_owner/producer.gd:399–423` | boss_test_req 서비스 읽기/gate | 값>=0이면 `unowned_boss_branch`. 파일 주석의 옛 원본행32204는 현재game31540 전후와 분리. 실제 bosstest arena branch 연결 HOLD |
| `scripts/world.gd:2920–2938` | P3 소환굴 동적 등록 | 정확`enemy_melee_flesh_crawler.gd`만허용. boss summon이 뽑는0/2/3 전체·CH2boss 등록 API로 사용불가 |
| `scripts/native_source_new_run_state.gd:115,175,581`, `main.gd:106,137,1004` | 실제 G/P holder/newrun·메인시계 | 새 boss queues/actor/currentstage/bossRef/phase·effect executor 소유·통합 미확인. public read만 보고 새 G 배열을 직접쓰기 금지 |
| `scripts/native_regions.gd:106,285` | 지역·필드보스 지점과`full_fieldboss_combat:false` | 필드보스표시가 챕터 아레나보스 AI완성의 증거 아님 |
| `port_modules/black_bean_projectile`, `parry_blue_projectile`, 기존projectile birth/hit FX | 보호된 기존 투사체·반격단위 | 원본 요청 raw→후처리/충돌의 소비자 후보. 새6queue/spawnProj/밀도/element/owner ack를 자동지원한다고 하지 않음 |
| `scripts/hud.gd` boss 언급 / 기존화면 | minimap 출구조건 등의 부분참조 | 원본bossBar·시네마·상태·입장·반경축소·2D/3D frame경로를 모두 재현한 bossHUD로 인정하지 않음. 화면검수0 |

경로는 `godot/` 아래 기준. 각 모듈의 존재는 실제 실행 연결의 근거가 아니다. 본 작업은 결손을 기록하며 **공용0줄**을 유지한다.

### 4.2 재사용 계약과 HOLD

| 재사용할 정본 | 후속 소비 방식 | 아직 필요한 결정 |
|---|---|---|
| BC01 `source_receipt:160 / move_by_id:182 / phase_by_index:189 / combos_for_stage:195` | CH2 독립 catalog가 22기술·5페이즈·25공통combo를 읽기 조회. 반환복사·ordinal·sourcehash 검증 | 원격 인수·전달 브랜치 확인, main에 없는 의존을 작업지시서에 명시 |
| BC02 `build_spawn_packet:33` | stage와 metadata를 분리한 공통 생성 계산 재사용 목표 | Catalog.boss_for_stage(si0~3) guard를 CH2 소유 파일에서 우회 불가. 공통 owner의 chapter 데이터 접점 결정 **HOLD** |
| BC03 `evaluate_move:21` / BC04 `select_tick:20,pick_top_six:128` | 일반 score/상위6 추첨/이력/시계 재사용 | stage guard와 catalog 공급을 owner가 정의할 때까지 **HOLD**. si4를 si0으로 바꿔 호출하지 않음 |
| BC05 `phase_transition:26,clock_step:70,begin_phase_effects:193,phase_effect_step:209` | CH2도 같은 일반 phase. 새 페이즈 배율표·공통식 복제 없음 | chapter 데이터 수용과 실제 G/P·actor 적용 실행기 결정 **HOLD** |
| BC06 `begin_start:39,next_start:211` | command/source_line/expectedstate/continuation/ack 규약을 재사용. 공유22case·신규10case로 구분 | 공개 진입점은 CH1 guard. 임의 token을 만들어 next_start로 우회하지 않음. 공통22case의 stage 대응도 owner 결정 **HOLD** |
| BC07 `begin_tick:13,next_tick:23` / 후속 CH1·REVIVE_SHIELD | slashCombo/slam/sweep의6state와contact요청/실제readback규약 재사용. 새hit latch없음·st2중복감산없음 | 두 API모두si0~3guard. B2C02 통합결정에 BC07 stage수용도포함. 나머지공통state·projectile·boss hurtE/부활/roomclear는후속owner범위,전체22state완료로확대금지 |

## 5. 작은 이식 단위 순서안

이번 산출물은 설계이며 아래 작업을 실행·배정·완료한 것이 아니다. 모든 단위는 자체 파일·격리 fixture에서 계산부터 검수하고 실제 State/Main/World·전투·HUD 연결은 총괄의 별도 통합 결정 뒤에 한다. 공통 계산을 새 CH2 파일로 복제해 공용0줄을 형식적으로 맞추지 않는다.

### 5.1 1번 B2C01 — 2장 읽기 전용 카탈로그(구현 지시서)

| 항목 | 후속 구현 지시 |
|---|---|
| 목표 | 최종6 Set/6이름/물리속성/union32의11필드/유효combo38를 원본 순서대로 읽기 전용 제공. actor 생성·시계·RNG·파일쓰기·실저장·서버·State/Main 연결0 |
| 선행 | 인수된 BC01 e4396da5…의 `native_ch1_boss_catalog.gd`를 읽기 의존. 기준 main에는 없음. 후속 작업 fetch 시 main 포함 여부를 재확인하고 미포함이면 승인된 선행 끝을 기준으로 분기/의존 기록. 다른 원격 WIP를 합치지 않음. BC07은 참조이며 첫 catalog 단위의 코드 의존으로 끌어오지 않음 |
| 자기 소유 제안 | 새 `godot/scripts/native_ch2_boss_catalog.gd`, 새 `godot/tests/test_boss_ch2_b2c01_catalog.gd` 및 Godot가 부여하는 해당uid·작업보고서·허용CHANGELOG. **이번 문서에서는 생성0**. BC01·공용6파일·다른 담당 파일0줄 |
| receipt | 위 main/game SHA256·원본행·선행BC01SHA·global59/combo68/phase5·ch2union32/common22/new10/si4~9·maxCH2idx56·범위·미연결상태. BC01 receipt의 동일 gamehash와 globalmanifest를 대조, 다르면 실패로 닫음 |
| API 제안 | BC01 형식의 `source_receipt()`, `boss_for_stage(si)`, `moves_for_stage(si)`, `move_by_id(id)`, `phase_by_index(phase)`, `combos_for_stage(si,phase)`. boss packet에 si/hell1/name_ko/element_id0/ibtrue/etype0/move_ids를 포함. 아직 실행 가능한 actor라는 표시를 붙이지 않음 |
| stage / 순서 | si4~9만 지원;3/10 등은unsupported_chapter_stage 또는 빈배열. moves는 BOSS_MOVES **source_ordinal** 순서, move_ids는 최종 Set 삽입순서. idx/ordinal 혼동 금지. phase0~4 외는 빈결과. 잘못된 입력 검증은 기존 정적 API 계약과 일치 |
| 공통 기술 | common22는 BC01.move_by_id의 깊은 복사 반환을 참조. 새10은 부록A의 원본11필드+source_ordinal/source_line만 소유. move_by_id는 CH2union32만 반환,tailSwipe/burrowStrike/cageTrap 등 제외. metadata.combo에 Set외ID가 있어도 원본값 보존 |
| phase 재사용 | BC01.phase_by_index를 그대로 읽기 위임. 동일5×8필드를 다시 하드코딩하거나 CH2별 배율을 만들지 않음 |
| combo 재사용 | BC01의 실제si0~3×phase0~4 API에서 얻는 레코드를 **source_ordinal을 키로** 모아 CH2 유효 공통25만 사용. seq 문자열로 중복제거하지 않음. 같은 ordinal의 중복 조회만 제거. 신규13레코드를 원본행에서 추가하고, 모든seq가 해당 CH2Set 안이고 phase가 일치하는 항목을 global ordinal순으로 반환. 부록B 참조 |
| 실패 / 변경 보호 | 의존누락·receipt불일치·필요한 공통 move/combo 누락을 성공한 빈데이터로 감추지 않음. 명시적인 not ready/error, 가짜PASS 금지. 읽은 결과를 변경해도 다음 호출·BC01 원본·다른stage에 영향 없는 깊은 복사 |
| 독립 기대값 | fixture 기대값은 본문/원본에서 별도로 고정하고 제품 모듈에서 생성하지 않음. Set 전체id·순서,32×11 모든 필드+ordinal/idx/행,5phase의8필드,38combo의seq/phase/ordinal/행을 비교. 단순 getter 동형 검사에 그치지 않음 |
| 경계 검사 | 6Set수27/28/29/30/31/32,32union=22+10,stage외/phase외/알수없는ID/cageTrap제외. 6×5 후보수는부록B. 공통 읽기 미지원·receipt차이·반환값변경뒤재조회·별stage별칭·동일seq/다른ordinal 보존 검사. RNG/I/O/actor참조0도 정적검사·접근차단fixture로 근거 확보 |
| 후속 실행 규칙 | 격리명 제안 `EXODUSER-BossCh2-B2C01-Isolated-20261020`. Godot 실행을 별도 지시받은 후 매번pgrep,2이상이면30초대기,override는 매번 격리 후 끝나면 비움. 이번 Godot0과 혼동하지 않음. 실제 저장 `EXODUSER-Godot-Native-First` 사용금지 |
| 제출 조건 | 정확한 파일 지정add·정상hook·자기branch만push·remoteSHA일치·외부원로그/DONE후worktree제거. 게임화면·성능·실전완성 주장 없음. BC01 의존이 미인수면 해당 사항을HOLD로 남기고 무단복사하지 않음 |

### 5.2 후속 최소 단위와 합류점

| 순 / 후보 | 소유 범위·검사 축 | 선행 / 실제 연결 HOLD |
|---|---|---|
| 1 B2C01 | 위 읽기 전용 catalog,6slots/32moves/38combos/5phases | BC01의 확정 의존만,공용0 |
| 2 B2C02 | **통합 결정 단위**: BC02~07에서 chapter 데이터를 받을 접점·인수형식/guard/snapshot/ack 정의 | BC 각owner/총괄. 기존 공통모듈 수정이 필요하면 본 담당은HOLD,필요한 위치만 제시. 공통식 병렬복제 금지 |
| 3 B2C03 | 새10 시작case를 순수command계산으로 한정.4state/6queue로 형식 명시한 요청,RNG순서·src참조·raw수치·recover/bossRec 차이 검사 | B2C01/02,BC06규약 인수. 실제G queue push/SFX/피해 실행 없음 |
| 4 B2C04 | vortex wind/active,pull/KB·magic tick/폭발·canMv순서 | BC 공통시계/state owner. 실제P.kb/hurtP 미연결 |
| 5 B2C05 | beanRain wind/active,cnt경계·black/red draw순서·duration/옆이동 | 공통projectile owner/시계,보호Q/E 변경0 |
| 6 B2C06 | fanWave90→bossRec40/_fwFx,고정각·sector·shQuery 명령 | BC공통state/기존hurtP·parry 소유자. draw시계 적용위치도 별도ack |
| 7 B2C07 | shieldBash2 wind/고정dash,접촉charge/parry/timeout,stunRes | BC공통시계/충돌,보호Q/E 참조만 |
| 8 B2C08 | spiralBullet queue계산,물리60+nextShot·arms·_commit요청 | 기존spawnProj·밀도/탄owner. 무소비tick/draw경계 fixture |
| 9 B2C09 | wallPush queue계산,이동→hit→trim순서/onehit/charge차이 | 충돌/피해owner,실제G/배열미연결 |
| 10 B2C10 | fireRain queue계산,난수배치·복수delay·선hit/fade | 입자/VFX/피해owner의ack. 독립fixture만 |
| 11 B2C11 | shockGrid queue계산,tick누적/범위밖/iframe/반폭차이 | 위와 같음. crossWipe와tick reset위치를 합치지 않음 |
| 12 B2C12 | donutSlam queue계산,OR경계·선hit·warn/trim | 위와 같음. 판정수정/화면안전구역변경 제안 없음 |
| 13 B2C13 | crossWipe queue계산,2~4wave/45도/30f/선tick reset | 위와 같음. rotSpd0/phase0도 원본데이터로 보존 |
| 14 B2C14 | 공유22기술의 CH2적용차이·통합fixture.소환type0/2/3,일반fan/charge,stage반경 등 | BC07 근접3공통기술은재사용,그외후속원격결과와실제owner재확인. 공유22state/queue 이중구현 없음 |
| 15 B2C15 | boss HP0/points/instant/fallback/roomclear의 CH2값fixture | **REVIVE_SHIELD의 기존 단위/담당 참조**. CH2부활모듈증설 없음,실제hurtE/State변경 통합HOLD |
| 16 B2C16 | atlas boss4~9·기존3Dfallback·HUD/음향의 소비사양/원본fixture | 기존assets/render/sound/HUD owner,에셋품질과Godot표시는 별도검사. 이번 실행0 |
| 17 B2C17 | 정식arena encounter합류·6slot진행·죽음→부활→상자/출구/si9clear | Main/World/State/factory/hurtE/HUD 통합결정 후. 공용변경은 담당인계,실제저장·형식보호유지 |

순서는 의존 제안이며 BC 후속 미확인 항목이나 담당 예약을 완료로 취급하지 않는다. B2C03~13은 입력 계약이 확보된 계산부터 독립fixture로 진행할 수 있지만 공개 API의 chapter guard 문제를 우선 인수된 설계로 해결해야 한다. 필요한 공용 수정을 본 담당이 임의 수행하라는 지시가 아니다.

## 6. 공용 접점·통합 결정 목록

| 접점 | 원본 위치 / Godot 후보 | 필요한 owner 계약·처리 |
|---|---|---|
| chapter 데이터 | 9968–9975/16690,BC01catalog | 6slot metadata/32move/38combo를 읽기 공급. 기존CH1 si범위/반환값 무단확장 금지 |
| currentstage/arena/actor | 30697–30814/31540,Main/World/factory/init_stage | 등록순서·null가능mkEn·bossRef·충돌/현재source 소유자 필요,**HOLD** |
| RNG/시계 | 31162이후/38373–38441/38584이후,BC02~06 | 동일draw열·조기return·st2선행감산·실frame/시간원 보존. fixture는 공급·소비순서 기록,실제공유RNG 임의접근 금지 |
| 공통score/selector/phase/start | 37650–38441,BC03~07 | chapter데이터 주입의 공개계약 결정필요,**HOLD**. si위장·guard삭제·continuationtoken위조 금지 |
| 공유22state / 신규4state | §2.2/2.3,BC07/후속 | 동일actor/state 소유자ack. BC07은공통3기술의6state packet만,나머지처리완료가정금지 |
| G 지연queue | §2.4/30763–30770/31555–31558 | 시작명령→같은tick소비→안정압축→reset 적용owner. State holder배열 직접추가 **HOLD** |
| 이동·명중·저항·poise | updateE/hurtP/hurtE/shQuery/canMv,normal_enemy_hurte거절 | 보호Q/E·고유stun/KB·directmagic/element분류 보존. 일반몹ib거절 우회금지 |
| projectile | 16938–16957/37057/공통spawnProj,black/parry_blue등 | raw요청과후처리·실탄생성 분리,동일owner 실행ack 필요. 공유22/신규10 이중적용금지 |
| HP0·부활·승리 | 42515–42649/34493–34535/41816–42009 | REVIVE_SHIELD기존owner. judged/timer/points/chance/bossAlive순서·30framepoll보존. 새save필드0 |
| 표시·음향 | §2.6,HUD/renderer/음향module | 표시후보와실제active경로 구분. render내fwFx시계·3DspawnT쓰기도owner통합. 화면품질은 후속실화면 별도검수 |
| 저장·player 재기 | SAVE/REVIVE/RESPAWN | 기존호출위치/형식보호. SV-LIFECYCLE등 통합결정 선점금지,실제저장연결 **HOLD** |

## 7. 전수 부록·확인 기록

### A. CH2 최종32기술의 전체11필드

공통22는 BC01을 읽기 참조,신규10만 CH2catalog의 추가 소유 후보. 아래는 문서의 원본 전사이며 제품 데이터 이중 정의가 아니다. `ord/idx/행`은 서로 다른 열이다. metadata.rec는 실제recover시간과 다를 수 있다(§2). 전체5phase×8필드는 CH1 §7 부록A/BC01을 공통 정본으로 참조하며 중복 소유하지 않는다.

| ord / idx / 원본행 | id / 소유 | tele / rec | canFeint / canDelay | range | phase | combo | tags | cd |
|---|---|---|---|---|---|---|---|---|
| 0 / 0 / 9821 | `burst` / 공통 | 45 / 40 | false / 0 | [0,999] | [0,1,2,3,4] | fan, shock, charge | aoe, ranged | 140 |
| 1 / 1 / 9822 | `fan` / 공통 | 25 / 35 | false / 0.3 | [60,300] | [0,1,2,3,4] | charge, mine, multiDash | ranged, frontal | 100 |
| 2 / 2 / 9823 | `charge` / 공통 | 40 / 60 | true / 0.5 | [40,400] | [0,1,2,3,4] | spin, grab, shock, multiDash | gap-close, melee | 100 |
| 3 / 3 / 9824 | `jump` / 공통 | 34 / 30 | false / 0 | [80,500] | [0,1,2,3,4] | shock, burst, spin | gap-close, aoe | 150 |
| 5 / 5 / 9826 | `shock` / 공통 | 35 / 40 | false / 0 | [0,180] | [0,1,2,3,4] | summon, mine, charge | aoe, melee | 120 |
| 6 / 6 / 9827 | `summon` / 공통 | 45 / 60 | false / 0 | [0,999] | [1,2,3,4] | charge, burst | utility | 300 |
| 8 / 8 / 9829 | `grab` / 공통 | 60 / 50 | true / 0.5 | [0,150] | [0,1,2,3,4] | charge, spin | melee, punish | 180 |
| 9 / 9 / 9830 | `spin` / 공통 | 28 / 40 | false / 0.3 | [0,100] | [0,1,2,3,4] | burst, fan, multiDash | melee, aoe | 120 |
| 10 / 10 / 9831 | `mine` / 공통 | 25 / 40 | false / 0 | [0,220] | [1,2,3,4] | charge, multiDash, vortex | utility, zone | 180 |
| 11 / 11 / 9832 | `vortex` / **신규** | 25 / 50 | false / 0 | [0,250] | [1,2,3,4] | burst, meteor, charge | aoe, cc | 220 |
| 12 / 12 / 9833 | `multiDash` / 공통 | 20 / 35 | true / 0.3 | [30,350] | [0,1,2,3,4] | spin, grab, charge | gap-close, multi-hit | 120 |
| 13 / 13 / 9834 | `slashCombo` / 공통 | 20 / 25 | true / 0.3 | [0,100] | [0,1,2,3,4] | slam, sweep, charge | melee, multi-hit | 90 |
| 14 / 14 / 9835 | `slam` / 공통 | 35 / 40 | false / 0.4 | [0,140] | [0,1,2,3,4] | slashCombo, sweep, shock | melee, aoe | 140 |
| 15 / 15 / 9836 | `sweep` / 공통 | 25 / 60 | false / 0.2 | [0,120] | [0,1,2,3,4] | slashCombo, charge, slam | melee, frontal | 100 |
| 18 / 17 / 9839 | `beanStorm` / 공통 | 20 / 25 | false / 0 | [0,999] | [0,1,2,3,4] | burst, fan, charge | ranged, aoe, redbean | 80 |
| 19 / 18 / 9840 | `beanRain` / **신규** | 60 / 60 | false / 0 | [60,400] | [1,2,3,4] | beanStorm, charge, vortex | ranged, sustained, redbean | 120 |
| 20 / 19 / 9841 | `fanWave` / **신규** | 60 / 40 | false / 0 | [60,500] | [0,1,2,3,4] | charge, fan, slam | ranged, frontal, aoe | 160 |
| 22 / 21 / 9843 | `chaseAoe` / 공통 | 20 / 60 | false / 0 | [0,999] | [0,1,2,3,4] | charge, multiDash, slam | aoe, zone, utility | 180 |
| 23 / 22 / 9844 | `elemBall` / 공통 | 60 / 35 | false / 0.3 | [60,500] | [0,1,2,3,4] | charge, fan, burst | ranged, frontal | 100 |
| 26 / 25 / 9847 | `spiralBullet` / **신규** | 35 / 50 | false / 0 | [0,999] | [1,2,3,4] | charge, fan, burst | aoe, ranged, sustained | 200 |
| 35 / 34 / 9856 | `groundFissure` / 공통 | 25 / 35 | false / 0 | [60,400] | [0,1,2,3,4] | charge, slam, pillars | aoe, zone, ranged | 140 |
| 36 / 35 / 9857 | `tideWave` / 공통 | 60 / 40 | false / 0 | [0,999] | [0,1,2,3,4] | charge, fan, burst | aoe, ranged | 160 |
| 37 / 36 / 9858 | `seekerMines` / 공통 | 25 / 60 | false / 0 | [0,999] | [1,2,3,4] | charge, multiDash, elemBall | ranged, zone, utility | 180 |
| 40 / 39 / 9861 | `wallPush` / **신규** | 60 / 40 | false / 0 | [0,999] | [2,3,4] | charge, elemBall, spiralBullet | zone, utility, cc | 240 |
| 41 / 40 / 9862 | `poisonTrail` / 공통 | 20 / 60 | false / 0 | [0,999] | [1,2,3,4] | charge, multiDash, fan | zone, utility, sustained | 160 |
| 45 / 44 / 9866 | `shieldBash2` / **신규** | 20 / 60 | false / 0.2 | [40,200] | [0,1,2,3,4] | slashCombo, sweep, charge | melee, gap-close | 120 |
| 50 / 49 / 9871 | `lavaPools` / 공통 | 35 / 40 | false / 0 | [0,999] | [0,1,2,3,4] | charge, fan, groundFissure | zone, aoe, sustained | 200 |
| 51 / 50 / 9872 | `fireRain` / **신규** | 60 / 50 | false / 0 | [0,999] | [1,2,3,4] | charge, chaseAoe, elemBall | zone, aoe, ranged | 220 |
| 52 / 51 / 9873 | `shockGrid` / **신규** | 40 / 45 | false / 0 | [0,999] | [1,2,3,4] | charge, fan, spiralBullet | zone, aoe, cc | 240 |
| 53 / 52 / 9874 | `donutSlam` / **신규** | 60 / 50 | false / 0 | [0,999] | [1,2,3,4] | charge, burst, shockGrid | zone, aoe, punish | 300 |
| 55 / 54 / 9876 | `crossWipe` / **신규** | 50 / 50 | false / 0 | [0,999] | [1,2,3,4] | charge, shockGrid, fan | zone, aoe, sustained | 280 |
| 57 / 56 / 9878 | `rapidMissile` / 공통 | 30 / 40 | false / 0 | [250,999] | [0,1,2,3,4] | charge, fan, burst | ranged, multi-hit, gap-punish | 100 |

최종 si4 Set 삽입순서(원본9969와 전역cage삭제 적용):

`slashCombo, slam, sweep, charge, jump, burst, shock, fan, spin, grab, multiDash, poisonTrail, summon, mine, vortex, chaseAoe, elemBall, beanStorm, beanRain, groundFissure, tideWave, lavaPools, fireRain, shockGrid, donutSlam, crossWipe, rapidMissile`

si5는위Set에seekerMines,si6는fanWave,si7은wallPush,si8은shieldBash2,si9는spiralBullet을순서대로누적한다. Set 크기만맞추고id나순서를바꾸지않는다.

### B. CH2 유효 콤보38개 전수

전체68개 중 적어도한CH2 Set에모든seq가포함되는38개다. 단계별phase조건은아래그대로추가적용한다. 동일seq라도별ordinal이면원본의별레코드로보존. 공통25는BC01이이미소유,신규13만추가소유후보다.

| ordinal / 원본행 | seq | phase | 유효si | 소유 |
|---|---|---|---|---|
| 0 / 9882 | jump → slam → sweep | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 3 / 9885 | charge → spin → burst | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 4 / 9886 | jump → shock → fan | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 5 / 9887 | charge → grab | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 6 / 9888 | charge → multiDash | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 7 / 9889 | multiDash → spin | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 8 / 9890 | multiDash → grab → charge | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 9 / 9891 | multiDash → spin → shock | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 10 / 9892 | charge → spin → multiDash | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 11 / 9893 | fan → charge → spin | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 12 / 9894 | mine → vortex → burst | [2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 15 / 9897 | mine → charge → spin | [2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 17 / 9899 | jump → multiDash → shock | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 18 / 9900 | burst → charge → multiDash | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 19 / 9901 | slashCombo → slam | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 20 / 9902 | slashCombo → sweep → charge | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 21 / 9903 | slam → sweep → slashCombo | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 23 / 9905 | charge → slashCombo | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 25 / 9907 | sweep → multiDash → slam | [2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 26 / 9908 | beanStorm → fan → beanStorm | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 27 / 9909 | beanStorm → charge → beanStorm | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 28 / 9910 | beanRain → beanStorm → burst | [2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 29 / 9911 | vortex → beanRain → beanStorm | [3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 39 / 9921 | spiralBullet → charge → slam | [2,3,4] | 9 | **CH2추가** |
| 42 / 9924 | groundFissure → charge → slam | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 43 / 9925 | tideWave → charge → fan | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 45 / 9927 | seekerMines → charge → multiDash | [1,2,3,4] | 5,6,7,8,9 | BC01참조 |
| 47 / 9929 | wallPush → charge → slam | [2,3,4] | 7,8,9 | **CH2추가** |
| 48 / 9930 | poisonTrail → fan → charge | [1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 51 / 9933 | shieldBash2 → slashCombo → sweep | [0,1,2,3,4] | 8,9 | **CH2추가** |
| 57 / 9939 | lavaPools → charge → groundFissure | [0,1,2,3,4] | 4,5,6,7,8,9 | BC01참조 |
| 58 / 9940 | fireRain → charge → fan | [1,2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 59 / 9941 | shockGrid → charge → multiDash | [1,2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 60 / 9942 | lavaPools → fireRain | [2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 61 / 9943 | shockGrid → spiralBullet | [2,3,4] | 9 | **CH2추가** |
| 62 / 9944 | donutSlam → charge → slam | [1,2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 64 / 9946 | crossWipe → charge → fan | [1,2,3,4] | 4,5,6,7,8,9 | **CH2추가** |
| 66 / 9948 | donutSlam → crossWipe | [3,4] | 4,5,6,7,8,9 | **CH2추가** |

| si | 최종Set수 | phase0 | phase1 | phase2 | phase3 | phase4 | 전체phase합집합combo수 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 4 | 27 | 14 | 26 | 31 | 33 | 33 | 33 |
| 5 | 28 | 14 | 27 | 32 | 34 | 34 | 34 |
| 6 | 29 | 14 | 27 | 32 | 34 | 34 | 34 |
| 7 | 30 | 14 | 27 | 33 | 35 | 35 | 35 |
| 8 | 31 | 15 | 28 | 34 | 36 | 36 | 36 |
| 9 | 32 | 15 | 28 | 36 | 38 | 38 | 38 |

공통25 ordinal=`0,3,4,5,6,7,8,9,10,11,15,17,18,19,20,21,23,25,26,27,42,43,45,48,57`;신규13 ordinal=`12,28,29,39,47,51,58,59,60,61,62,64,66`. 이는combo조회/API결과를정렬할기준이며시작기술의metadata.combo와서로다른테이블이다.

### C. 관련 식별자·필드의 파일 전체 행 색인

정의/생산/소비/reset/render/주석을포함한 **정확식별자검색의모든일치행**이다. 표의존재만으로모든행이CH2에서실행된다는뜻은아니다. 실제CH2분기는§1~2와최종Set표를우선한다. 공통필드상세소유는CH1 §1.3/§7과REVIVE §1.3참조,신규고유필드의쓰기/읽기는아래에도포함한다.

| 식별자 / 상태·필드 | game.html 전체 일치행 |
|---|---|
| `BOSS_MOVES` | 9820,10009,17181,31176,38259,38377,38391,38406,38407,38408,38413,60430,60442,60450,64252,64323,64324,64558,64584,64591,64657,65662 |
| `BOSS_COMBOS` | 9881,38434,64525,64527 |
| `BOSS_PHASES` | 9951,37704,37729,37765,38242,38317,38375,60434 |
| `_BOSS_MOVESET` | 9960,9962,9963,9964,9965,9966,9967,9970,9971,9972,9973,9974,9975,9978,9979,9980,9981,9984,9985,9986,9987,9988,9989,9990,9993,9994,9995,9996,9997,10000,10001,10002,10003,10004,10005,10009,10010,37653,38392,38433,64322,64656 |
| `CHAPTER_STAGES` | 16633,16660,16669,16698,32007,32052,43896,63555,63877 |
| `HELL_BOSSES` | 16688,16706,64242 |
| `_enterBossArena` | 17084,30749,31544,41789,64209,64289,64764 |
| `mkEn` | 30184,30782,31120,31375,31384,31431,31437,31443,31450,31476,31497,31512,31523,31601,31620,31635,31647,32133,35675,35707,38780,38796,38845,39040,39244,39414,39487,39630,40012,40105,40244,40415,40789,40807,42611,42795,42830,43052,62289,63428,64753 |
| `_bossScore` | 37650,38407 |
| `_bossStartPattern` | 17181,37702,38401,38441,64258 |
| `_bossPhaseCheck` | 38236,40447 |
| `_bossIdleMove` | 38315,40450 |
| `_bossAI` | 38373,40450 |
| `_getBossAnimState` | 22729,22745,22755,23499,23534,53559 |
| `_assignBossSkin` | 20199,23150,23295 |
| `_B3_MODELS` | 64947,65096 |
| `_B3_DEFAULT` | 64967,64983,65096 |
| `_BOSS_ATHEME` | 26485,27164,30803 |
| `_bossSfx` | 24764,24818,30812,38308,41808 |
| `_bossReviveGrandVFX` | 34448,41554 |
| `checkRooms` | 35635,41768,43115 |
| `_spiralBullets` | 20107,30763,31555,37057,37838,37840,61924,63486,64282 |
| `_wallPushes` | 30765,31557,37077,38005,38007,38009,57964,57965,57966,63488,64284 |
| `_fireRains` | 30770,31558,37131,38120,38126,38129,57561,57562,57563,60069,63489,64286 |
| `_shockGrids` | 30770,31558,37133,38136,38142,38144,57588,57589,57590,60069,63489,64286 |
| `_donutSlams` | 30770,31558,37135,38151,38155,38157,57617,57618,57619,60069,63489,64286 |
| `_crossWipes` | 30770,31558,37139,38180,38184,38188,57656,57657,57658,63489,64286 |
| `bossVortexWind` | 9548,23421,23519,37732,40905,53265,64993 |
| `bossVortex` | 23429,23508,40907,40908,53265,53266,64997 |
| `bossBeanRainWind` | 23423,23521,37756,41207,64994 |
| `bossBeanRain` | 23431,23510,41210,41211 |
| `bossFanWaveAim` | 23423,23521,37757,40571,53000,64994 |
| `bossSBashWind` | 23425,23523,38051,41337 |
| `bossSBash` | 23433,23512,41339,41340 |
| `bossRec` | 10770,17186,23416,23503,40604,40642,41044,41373,41375,64999 |
| `_brT` | 37756,41212,41215,41227 |
| `_brDur` | 37756,41210 |
| `_fwAng` | 37757,40573,40584,40596,40600,40602,53004,53007,53010,53011,53015,53017 |
| `_fwR` | 37757,40577,40582,40593,40597,40600,53002 |
| `_fwFx` | 40600,53022,53023,53024,53025,53027,53029,53031 |
| `_sbAng` | 38050,41341,41345 |
| `_bossPhase` | 17061,17068,17143,17153,17181,22848,22868,24382,24392,24466,24536,31173,37084,37092,37111,37714,37775,37796,37817,37835,37862,37881,37899,37916,37934,37951,37966,37982,38040,38094,38121,38137,38152,38181,38195,38215,38239,38241,38317,38331,38360,38363,38375,38381,38393,38401,38407,38434,38441,40564,40647,40650,40651,40655,40894,40919,41125,41175,41192,41194,41216,41617,41693,42550,52911,53078,53080,53260,53462,53464,53465,53467,53468,53470,60434,60436,64241,64257,64269 |
| `_bossRevJudged` | 17071,34508,42553,42641,42642,42734 |
| `_bossRevived` | 17071,34529,42649,52736 |
| `_bossRevChance` | 34502,42647,42648,52731 |
| `_bossRevRoll` | 34502,42647,42648 |
| `_reviveTimer` | 17071,17124,34363,34365,34383,34493,34494,34498,34499,34529,35732,35881,41771,41824,42634,42642,52281,52704,52710,52726,62243 |
| `_reviveX` | 34497,34506,34530,34531,34538,34541,42634,42642,52704,52705 |
| `_reviveY` | 34497,34506,34530,34531,34538,34541,42634,42642,52705 |
| `_revPts` | 17064,17068,31181,34505,34513,34518,34531,42530,42531,42537,42541,42543,42562,42647 |
| `_maxRevPts` | 31181,34513,34518,42541,42543,42562 |
| `_origR` | 34448,34512,34515,42561,42564 |
| `_spawnT` | 5249,17074,17172,31359,34446,34524,42584,52882,65174,65176 |
| `_bossReviveVFXPending` | 17074,34448,34524,42584,42621 |
| `reviveIframes` | 5247,17070,17172,17187,30787,31180,34456,34508,35677,38247,38590,38950,41618,41694,41800,42120,42121,42556,52880,53982 |
| `_killedBosses` | 30797,41830,41831,42604,42605 |
| `_maxGuar` | 42519 |
| `bossShieldF` | 2701,35831 |
| `_bossCine` | 9164,17087,17125,35827,35828,35840,55416,55420,55421,60869 |
| `_bossLoadPhase` | 30203,30788,31569,41784,41787,41789,41790,41792,41793,41795,41796,41812,41893,41913,43420,43896,52090,52095,52097,60780,60868,61246,61951,62126,62280,62364,62476,63495,63956,64105 |
| `_bossLoadFade` | 30788,31569,41788,41789,41791,41794,41795,41812,41913,43896,52092,61951,62126,62280,62364,62476,63495,63956,64105 |
| `_bossRef` | 4660,4661,4662,4664,4665,9390,9539,9545,9546,9592,9593,9673,9674,9693,17075,19967,30203,30797,32689,33072,34510,35729,35730,35731,35737,35750,35756,35809,35810,35811,37082,37109,41831,43799,43896,55246,55402,57526,61951,62126,62280,62364,62476,63496,63956,64105 |
| `_moveCDs` | 31176,37654,38259,38377,38393,38395,38429,60442 |
| `_lastMoves` | 17176,31177,37658,37659,37661,37692,38397,38427 |
| `_comboSeq` | 17073,17175,31175,37687,38258,38389,38390,38402,38435,41617,41693,42554,60440 |
| `_comboIdx` | 17073,17175,31175,37687,38258,38389,38390,38394,38402,38435,41617,41693,42554,60440 |
| `_feinting` | 17073,17175,31178,37710,38258,38399,38438,40452,40453,42554,60439,64255 |
| `_delaying` | 17073,17175,31178,38258,42554,64255 |
| `bossPatCd` | 31171,38255,38430,41616,41692,42559 |
| `bossPatT` | 17173,17175,17190,31171,38257,38384,38385,38396,38410,38430,41616,41692,64646,64647 |

### D. 외부 atlas boss4~9의 등록 프레임 수

기준main JSON blob의배열길이만확인했다. 실제이미지크롭/외형/애니메이션/3D선택실행검수는없다. frame좌표원본은atlas_bosses.json 해당키이며외부로그boss-atlas-ch2.json에6키전체를보존했다.

| key | idle | breath | walk | attack | rage_attack | windup | rage_windup | stagger | rage | death |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| boss_4 | 8 | 8 | 6 | 6 | 7 | 6 | 7 | 6 | 8 | 8 |
| boss_5 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 7 |
| boss_6 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 4 | 7 |
| boss_7 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 8 |
| boss_8 | 1 | 4 | 4 | 6 | 7 | 6 | 7 | 6 | 4 | 7 |
| boss_9 | 8 | 8 | 4 | 6 | 7 | 6 | 7 | 6 | 8 | 7 |

### E. 이번 정적 검토와 미확인

- 원본 SHA256·행수,6slot 최종Set/32기술 전체11필드/38combo·6×5후보수를정적선언에서추출했다. 패턴32개시작case와상태소비·큐소비를각각대응하고추가10을상세추적했다. 공통22는기존추적·모듈참조로소유를유지했다.
- 원격BC01~07의모듈/API·보고서와기준main미포함을대조했다. BC07의실제전투인수·현재2장실도달·모델/atlas실로딩·실제화면/전투/성능·PC동기화는 **미확인**이다.
- Godot/import/게임/서버/신규·회귀테스트실행0. 테스트통과·화면품질·이식기능완료로보고하지않는다. 보호Q/E·실저장·마이그레이션·공용코드0줄.
- 외부로그:baseline.json,bc-remote-inventory.json,bc01~07보고서복사,static-catalog.json,pattern-source-map.json,identifier-lines.json,boss-atlas-ch2.json,asset-git-blobs.txt,정적검토원로그. 최종branch/SHA·문서수/변경범위·remote일치·정리는DONE.txt에기록한다.
