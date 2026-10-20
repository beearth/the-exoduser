# 정예·접사·팩 오라 35종 — 원본 추적과 이식 단위 참고

작업ID `trace-elites` · 브랜치 `codex/trace-elites-20261020` · 2026-10-20 KST. **추적/설계 문서이며 제품 구현이 아니다.** Git 제출은 이 새 추적 문서 1개와 사용자 허용 `docs/CHANGELOG_SYNC.md` 최상단 절뿐이다. 중단 전 별도 보고서는 기존 WIP로 보존하고 제출에서 제외한다. 코드·테스트·설계 docs·공용 파일·작업판 변경0. 새 테스트 파일도 만들지 않았다. §5의 신규 파일명과 테스트는 후속 배정용 제안이다.

## 0. 원본 고정·소유권·검증 경계

| 항목 | 이번 확인 |
|---|---|
| 재개 / 최신 기준 | 기존 WT·브랜치·미커밋 문서를 이어서 작업. 재개 fetch 후 `origin/main=284d7faf49295b2f5061937a47ce96038032ed3c` 고정. 재개 시작 HEAD/base는 `c3cf8ce6b0cc1a5c381240260e03dff71c68af8d`이며, 최신 main blob을 Git 밖 `~/exoduser-wt/_out/trace-elites/resume/main-read/`로 읽어 대조했다. 두 HTML은 구 기준과 byte 동일하여 본문 원본 행 번호는 **최신 main 기준으로 재검증**됐다. main 병합·rebase·reset 없음 |
| R | `/Users/fordeargamers/Projects/exoduser-migration-20261001`, branch `codex/mac-live-play-time-main-20261017`, HEAD `dd49171c5b88e211575a41f185395d6c0a14b184`, 시작 tracked INDEX/WORK clean. R 파일/branch/INDEX를 쓰지 않음 |
| 원본행 | 아래 `game:`/원본행은 최신main의 `game.html` 1-based. 원본 hash/줄수는 부록A. index.html도 동일 식별자를 전수검색하되 로비와 전투코드를 혼동하지 않음 |
| 먼저 확인 | 최신 main의 `orders/WORK_BOARD.md:28~33,70~84,91`, `FDG_FEATURE_INVENTORY_20261020.md:329~368`, 기존 추적 문서 12개의 범위·겹치는 계약 확인. 선행 추적은 §0.1의 링크로만 참조하며 과거 분모를 현재 지원 개수로 전용하지 않음 |
| P2-008a / b | 최신 main의 P2-008a는 지원9/미지원7, etype20 exact order4/10/12 담당. 보드는 P2-008b `2a05d13f7`의 order11 etype47·order9 후보를 미검수·미병합으로 기록(지원9→11은 **미확인**). fetch에서 읽힌 원격 a=`46409ee4eabcd4760f0c420d6d6a15beaf9e3b28`, b=`f48c94eb6c4067646e3ee7c977266d397c700e08`이므로 보드와 실제 ref의 관측을 구분. PC 실행·작업폴더의 현재 상태는 **미확인** |
| 중복금지 | 1장 개체/etype20·47 및 후속 actor·clone·TP·World 문맥은 P2-008a/b 소유로 참조만. 기존 M29/M30/type3 kernel을 재구현하지 않음. 정예 선택 규칙·접사 caller·팩 오라에 한정한 분리 부품만 순서안 제안 |
| 보호 | `docs/2_3` 수정금지, Q/E 입력·판정·blackBean Q전용magic·블루콩반사, 세이브형식 보호. 정예가쓴다는이유로보호전투/저장을다시설계하지않음. 전역어택티켓추가금지 |
| 실행 | **이번 재개에서 Godot 실행·import·테스트 실행 0회**. 정적 source/문서 대조만 수행. 중단 전 c3cf8ce6 실행 로그는 §6에 과거 증거로 분리하며 최신 main PASS로 승격하지 않음 |

**분모31 mods + 4 auras = 35.** M01~M32 중 **M21은삭제되어등록되지않는다**. elite4등급은35개접사/오라에더해세지않는다. `RARE_ETYPE`90~99의네임드10종은등급2(레어)와다른집합이다. `FDG_FEATURE_INVENTORY`의 M29/M30 “일부”와나머지“없음”은작성snapshot의기능판정이며, 아래현코드의부분consumer/정직halt를별도기록한다.


### 0.1 선행 추적과 중복 경계

아래는 최신 main에서 먼저 확인한 기존 문서다. 각 문서의 오래된 snapshot·완료 판정은 해당 문서의 기준 SHA에만 귀속된다.

| 기존 추적 문서 | 이 작업에서 참조만 할 범위 |
|---|---|
| [CH1_ENEMIES](FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md) §1~6·부록B | 초기16·actor별 수치/소환/TP·native 필드. 문서의 과거6/10을 최신 factory의9/7로 혼합하지 않음 |
| [BOSS_CH1](FDG_SOURCE_TRACE_BOSS_CH1_20261020.md) §0.2·1.2·2.7 | 보스 HP·ATK·드루이드 피날레. 현재 `_DEMO_LAST_STAGE=0`과 si3 조건이 양립 불가하므로 전용 피날레는 일반 실행 도달 불가. 정예 수치 예외로 코드만 기록 |
| [ITEMS](FDG_SOURCE_TRACE_ITEMS_20261020.md) §1~5 | 아이템/어픽스·드롭. eliteSlayer/vsEliteDmg의 `mods.length` 조건만 접점으로 추적 |
| [META](FDG_SOURCE_TRACE_META_20261020.md) §2~4·8~9 | 정예 악의·XP·초월·State. 보상 producer 자체를 중복 이식하지 않음 |
| [REVIVE_SHIELD](FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md) §1~5 | 일반 부활 예약·구울 크기·실드. M21 삭제와 일반 부활을 구분 |
| [SAVE](FDG_SOURCE_TRACE_SAVE_20261020.md) 원본 payload·zone/lifecycle 절 | 적11필드 zone 스냅샷·로드 mkEn 재추첨. 정예 mods/aura를 새 저장필드로 추가하지 않음 |
| [SKILLS](FDG_SOURCE_TRACE_SKILLS_20261020.md) 합체표·whirlDet 색인 | M01/M18 강제기폭·회전 합체 caller. Q/E·합체 시스템은 기존 담당 영역 |
| [WEAPONS](FDG_SOURCE_TRACE_WEAPONS_20261020.md) §2~5 | EL·상성·투사체·패링 분류. 정예 ATK 배율과 보호 Q/E를 구분 |
| [SOUND](FDG_SOURCE_TRACE_SOUND_20261020.md) SFX 색인·이식 순서 | M28/킬체인의 groggy, M29 warning/impact/audio capability. 새 sound owner를 만들지 않음 |
| [INVENTORY](FDG_SOURCE_TRACE_INVENTORY_20261020.md) §0·획득/직렬화 경계 | 드롭 이후 장비 반입·장착 효과·저장, 정예 기능으로 재구현하지 않음 |
| [QUICKSLOT](FDG_SOURCE_TRACE_QUICKSLOT_20261020.md) §0·이식 단위 | 회복/피해/자원 sink와 분리. QS-01 물약 모듈을 정예 regen으로 대체 사용하지 않음 |
| [SETTINGS](FDG_SOURCE_TRACE_SETTINGS_20261020.md) §0·OPT 소비 접점 | 난이도·hitStop·표시 옵션. 옵션 owner/키 입력·설정 저장은 기존 담당 영역 |

`f`와 `sp`는 원본 tick 단위다. 표의 ‘초’는 60 tick 환산이며 거리 tier·pause·guard가 걸린 실제 벽시계 주기를 보증하지 않는다. `trunc/~~`는 JS ToInt32, HP 생성의 `floor`와 구분한다. 동적 접근·외부 스크립트의 전체 실행 도달성, 현재 실행창·PC 소스 일치는 **미확인**이다.

## 1. 원본 데이터·생성·상태의 전수 추적

### 1.1 등급·확률·선택 규칙

| 원본행 | 항목 | 원본 계약 |
|---|---|---|
| 16633~16666 | CHAPTER_STAGES/SI_TO_HELL | stage0~3→hell0, 4~9→1, 10~13→2, 14~20→3, 21~25→4, 26~31→5, 32~34→6. 35 stage를7행확률표에연결 |
| 31033~31037 | ELITE_TIERS | 아래정확표. count/HP/ATK/dropBonus/scaleMul의원배열순서보존 |
| 31041~31043 | ELITE_PROB | 각행은[magic,rare,champion], 일반확률은1−합. 표의레어와챔피언은누적비교범위로배타선택 |
| 31063~31070 | rollElite(si) | row=ELITE_PROB[max(0,min(length−1,SI_TO_HELL[si] OR0))] OR첫행. RNG1회후strict `< champion`, `< champion+rare`, `< champion+rare+magic`, 아니면0. 확률이0이어도이함수는RNG1회 |
| 31071~31080 | rollMods(tier,si) | 해금pool을원등록순서로filter. count0/pool없으면RNG0/[]; 공격M29~32부터tier3은최대2개/그외최대1개선택, 각선택U×남은length를trunc해splice. 그뒤M29미만일반pool에서남은슬롯을중복없이채움. 선택마다공유RNG1회. 일반접사에임의가중치/보장순환을넣지않음 |
| 31083~31097 | AURA_DEFS/maps/rollAura | tier<2는null/RNG0. 그외현재hell해금오라pool에서trunc(U×length)로1개/RNG1회. _AURA_MAP/_MOD_MAP은id→원객체참조. 이름이없는id를다른접사로대체하지않음 |
| 31120~31166 | mkEn | collision admission→monLv→`ib 또는 isRareEtype`이면elite0/등급RNG생략→elite>0일때mods선택→spd/r/HP/ATK→literal. aura는literal에서elite≥2일때선택하므로**등급롤직후가아닌facing뒤**. RNG순서를선택함수3개를묶는다는이유로앞당기지않음 |
| 31138/31158~31159 | M02·정예공격속도 | M02 speed×1.5, projCdtrunc×.85. 그뒤elite3/2/1이면projCdtrunc×.6/.7/.8. 원baseSpeed=(ETYPE_SPD+U×.08)×1.5와구분 |
| 31140~31151/31164 | 크기·전투수치 | radius=(baseR+U×2)×2×tier.scaleMul. HP=floor(floor(baseCurve×pacing×(ib?24:1)×dm×tier.hpMul)×(1+si×.02)), baseCurve=(lv≤500?.4lv³+199lv+100:50000000×1.0014^(lv−500))×2.925; pacing=1/(1+min(9,max(0,lv−1))/18). ATK=floor(((ib?75:50)+lv×(ib?2.9:1.95))×.6×dm×tier.atkMul). si3 드루이드 피날레 _dfSpawn이면31148의 _druidFinaleHp로 HP를 덮는 예외는 별도 보스/피날레 담당. poise/maxPoise와eShield/max는생성HP |
| 31166~31167 | actor상태 | elite/mods/aura, modT의regen/summon/tp/chaos/vortex/lightning/twarp/cloned/revived/split/sentry/sentryAng/sentryOn/illusioned/stealthT/eliteBusy/eliteCharge/eliteRing/eliteBolt/eliteMortar 초기0/false. 후행 `_inherit`, `_eliteZones`, `_eliteBoltWarn/Aim`, `_modNStr`는조건부생성 |
| 31527/31625/31636 | 초기후처리 | 시작육괴elite0/mods[]/aura null로후대입. 문지기elite3만후대입/HP×4·ATK×2·r×1.4·poise80, 호위elite1/HP×2.5만후대입. 새등급이라고mods/aura/shield/poise를재계산하지않음. **P2-008a/b 담당actor영역** |
| 35709 | 리프트후처리 | mkEn뒤tier=min(3,2+trunc(rf.si/15)) 대입. 후대입elite의수치와실제mods는구분. 생성접점전체일치는부록색인 |
| 38778~38797/38842~38870/43050~43054 | 자식/전파 | M06/M16/M08은mkEn의원RNG·부작용후HP/elite/mods를후처리. aura/shield/poise를전부지우는정규화없음. M28은자기elite/색/r·baseAtk를다시덮고미끼표시. 전파는받는자의mods에추가만하며elite를자동승격하지않음 |

| tier / 이름 / 색 | mods수 | hpMul | atkMul | dropBonus | scaleMul |
|---|---|---|---|---|---|
| 0 / 일반 / #ffffff | 0 | 1 | 1 | 0 | 1 |
| 1 / 매직 / #4488ff | 1 | 2 | 1.3 | 0.5 | 1.08 |
| 2 / 레어 / #ffaa00 | 2 | 3 | 1.6 | 1.5 | 1.2 |
| 3 / 챔피언 / #ff4444 | 3 | 5 | 2 | 3 | 1.35 |

| hell / stage 범위 | magic / rare / champion 확률 | 일반 확률 | 해금 mods / aura |
|---|---|---|---|
| 0 / 0~3 | 0.03 / 0 / 0 | 0.97 | 6 / 1 |
| 1 / 4~9 | 0.08 / 0.02 / 0 | 0.9 | 12 / 2 |
| 2 / 10~13 | 0.12 / 0.05 / 0.01 | 0.82 | 17 / 3 |
| 3 / 14~20 | 0.15 / 0.08 / 0.02 | 0.75 | 22 / 4 |
| 4 / 21~25 | 0.18 / 0.1 / 0.03 | 0.69 | 27 / 4 |
| 5 / 26~31 | 0.2 / 0.12 / 0.04 | 0.64 | 29 / 4 |
| 6 / 32~34 | 0.22 / 0.15 / 0.06 | 0.57 | 31 / 4 |

**해금과 자연 획득은 구분한다.** 모든 장에서 공격 pool이 있으므로 매직의 접사1개는 M29~M32 중 하나다. M01~M28의 해금 목록이 곧 매직에서의 선택 가능 목록은 아니다. 오라는 tier≥2만 추첨하므로 hell0의 함성 정의가 있어도 그 장의 일반 확률 롤에서는 레어/챔피언이0%여서 자연 팩 리더가 생기지 않는다. 후대입 등급은 자동 오라 재추첨이 없다.

### 1.2 접사31종 전수 — 정의·실효·원본행·Godot 경계

아래의 “정의만”은미구현효과를새로설계하라는뜻이아니다. 원본에서효과분기가없으면그부재를보존한다. M17은명시적비활성, M21은등록삭제다. 원본식별자각각의**전체일치행**은부록B, 공통effect실행순서는§2다.

| id / 이름 / 색 / 해금hell | 효과 행 | 원본의 실행 계약 | Godot / 이식 경계 |
|---|---|---|---|
| M01 / 빙결 / #88ccff / 0 | 31101~31103 | eModHitP: U<.1이고P.s가charge/sBlock아니면stagger60/문구30/parts8; RNG는상태검사보다앞. 회전기폭 조건부 소비 | 일반효과미연결; detonate_blast에호출부가드부품만있음 |
| M02 / 초속 / #66ff66 / 0 | 31138,31158 | mkEn speed×1.5, projCdtrunc×.85 후tier쿨배율. 매tick속도재곱아님 | 일반접사미연결; sourceconstructor/고정snapshot수치부분과구분 |
| M03 / 강타 / #ff8844 / 0 | 31105 | eModHitP에서현재P.kb.x/y각×2, 뒤caller독립KB는별도 | 일반효과미연결 |
| M04 / 재생 / #44ff88 / 0 | 38776 | modT.regen+=sp; >=120이면0reset/hl=trunc(mhp×.05)/hp cap, d<300이면text. 큰sp도1회만 | 미이식; 주석180f와다름 |
| M05 / 맹독 / #88ff00 / 1 | 31107 | iframe≤0이면max(1,trunc(atk×.3))를magic/dot:true로hurtP후text | 일반효과미연결 |
| M06 / 소환 / #aa44ff / 1 | 38778~38781 | d<1200에서timer1200/0reset; type3자식2개, 원mkEn뒤hp/mhp×.4·elite0·mods[]/ens.push/FX. shield·poise·aura별도 | type3생성부품은존재, M06caller/후처리는미이식 |
| M07 / 기생 / #ff44aa / 1 | 43047~43048 | 사망시query120 자기제외/strict거리<120 이웃hp+=trunc(mhp×.3) cap. 원분기alive명시필터없음 | 일반death소비미이식 |
| M08 / 분열 / #ffaa44 / 1 | 43050~43054 | death&&!modT.split이면type3자식2, hp/mhp×.3/shield0/r=max(4,parent.r×.6)/elite0/mods[]/splittrue/ens.push | type3부품재사용가능, M08deathcaller미이식 |
| M09 / 용암자취 / #ff4400 / 2 | 31050 | 용암자취로등록만존재. 이ID를검사하는effect분기는전수검색0 | 원본정의만; 새용암지속피해발명금지 |
| M10 / 사망폭발 / #ff0000 / 2 | 43057~43059 | death거리<80/iframe≤0/비charge에서trunc(atk×3) magic, 이후parts30/shake12/문구40 | 일반death소비미이식 |
| M11 / 화염사슬 / #ff6622 / 2 | 31051 | 화염사슬로등록만존재. 이ID를검사하는effect분기는전수검색0 | 원본정의만; 연결beam/틱피해발명금지 |
| M12 / 광전 / #cc0000 / 2 | 38771,38783,38875 | 매update atk=baseAtk→hpR=max(.01,hp/mhp),atk=trunc(baseAtk×(2−hpR))→마지막aAtkM. 최대계수1.99 | 일반효과미이식 |
| M13 / 텔레포트 / #aa00ff / 3 | 38785~38789 | idle/d<600에서600축적→P뒤50/유효면warning120/실패tp540. warning완료teleportE성공시만text+eProjAt요청, 그뒤tp0 | TP renderer/kernel부분은있으나M13timer/caller미연결 |
| M14 / 보호막 / #4466ff / 3 | 42185 | 피격dmg=trunc(dmg×.5), 수호/M22보다앞 | Godot hurtE활성시정직halt:mod_M14 |
| M15 / 소용돌이 / #6644ff / 3 | 38791~38792 | 10<d<1200에서vortex+=sp/>=480→0, P→적방향KB각축+5 | 미이식 |
| M16 / 환영 / #cc88ff / 3 | 38794~38797 | HP<.5mhp&&!cloned→1회type동일분신2, 원constructor뒤hp/mhp×.3/elite0/mods[]; shield/poise자동0아님 | spawn부품존재가전체M16완료아님 |
| M17 / 전격반사 / #ffff00 / 4 | 42183 | 등록은있지만전격반사명시적비활성. damageeffect없음 | 원본비활성보존; 반사신규구현대상아님 |
| M18 / 감전 / #ffee44 / 4 | 31109~31111 | U<.15/비charge·비sBlock→stagger30/문구25/parts6. RNG가상태검사보다앞 | 일반효과미연결; 합체기폭은스킬보호접점 |
| M19 / 낙뢰 / #eeff00 / 4 | 38800,38809 | d<1200에서360축적/claim54/r105·dur54·kindburst·색#eeff00. expiry max(1,trunc(atk×.65))magic,거리≤r | M30공통표현부품일부재사용가능, M19caller미이식 |
| M20 / 연쇄전격 / #ffdd00 / 4 | 43061~43062 | death query150/자기제외·strict거리<150 이웃baseAtktrunc×1.5/atk=baseAtk | 일반death소비미이식 |
| M22 / 동료불사 / #ff66aa / 5 | 42189 | 피격자mods존재&&!ib에서다른M22이웃query120→dmgtrunc×.67/문구,첫1개break. 피격자본인의M22필수아님 | hurtE에피해부분구현있음; 자연spawn/aura입장전체아님 |
| M23 / 영혼포식 / #880044 / 5 | 38811~38813 | _deadPool순서대로거리<100/자기제외/!absorbed 첫시체를흡수표시; HP+mhp.2 cap/baseAtktrunc×1.2/atk재대입/1회break | 미이식 |
| M24 / 시간왜곡 / #8888ff / 6 | 38815~38816 | d<100에서twarp60/0reset. iframe≤0일때max(1,trunc(atk×.05))magic dot, 문구는그gate밖 | 미이식 |
| M25 / 혼돈변이 / #ff00ff / 6 | 38818~38819 | chaos600/0reset→[P,F,I,D,L,H]중U1회→el/col쓰기→parts8 | 미이식; eRes/스킨/기본수치를자동재생성하지않음 |
| M26 / 복수자 / #cc2200 / 1 | 42764~42766 | 다른적사망시query200내M26받는자의baseAtk×1.2/atk동기화/speed×1.15 cap2/r×1.1 cap30 | Godot M26이웃강화에서정직halt |
| M27 / 마법보초 / #6600cc / 3 | 38821~38840,54028~54034 | sentry=(sentry OR0)+sp/angle+.03sp/phase%300<120활성; trunc(sentry)%10<sp·d<130·angle차<.25/iframe≤0/비charge면max(2,trunc(atk×.3))magic. 표시길이120 | 일반tick/beam표시미이식 |
| M28 / 환영술사 / #bb66ff / 4 | 38842~38850 | HP<.4mhp/1회illusioned=true·stealthT300; 자식2의HP=trunc(parent.mhp×.2),ATK=trunc(parent.baseAtk×.5),부모elite/색/r·_isDecoy=true. 동일update후stealthT감소 | 미이식; 자식모든mods를부모와동일배열로복사하는식아님 |
| M29 / 돌진 / #ff5533 / 0 | 38802,40520~40538 | idle/140<d<520/540축적·claim78→windup60/aimMax60/dur18/speed32/len640+r. genericcharge피해×30/KB100/sweep·패링경계 | 독립enemy_mod_m29커널+type3binding있음; 전체정예조합/자연GO아님 |
| M30 / 진원 충격파 / #ff8844 / 0 | 38804,38809 | d<800/480축적·claim54→현재P고정r125/t=dur54/색#ff2438; 생성후같은update t−sp,expiry거리≤125/magic max1trunc(atk×.65)/lava | native_m30_modifier+descriptor/원PNG/기술검사있음. 일반factory미완 |
| M31 / 번개 연사 / #ffee44 / 1 | 38806,5389~5407 | warning없을때d<850에서360축적/claim45/고정aim. warning>0은거리와별개감소,끝3발a±.24·3/.72/L/life260/sz3.5,추가shotwarning60 | 기존6원소emitter는임의M31caller허용아님; caller·표시미이식 |
| M32 / 지옥 포격 / #ff3322 / 2 | 38808~38809 | d<1100/600축적·claim126→플레이어기준수직offset−92/0/92의3zone/r68/dur78/102/126/mortar색#ff3322. expirymax1trunc(atk×.8)/lava | M30원VFX일부재사용, mortar동작·일반caller미이식 |

### 1.3 팩 오라4종 전수

| id / 이름 / 색 / hell / range | 원본 효과 | 합성·범위·표시·Godot |
|---|---|---|
| warCry / 함성 / #ff4444 / 0 / 150 | 34407: _aAtkM=max(기존,1.25), _aSpdM=max(기존,1.15) | 동일오라중첩곱0. 선행webSlow .5도max1.15로올라갈수있음. 일반오라effect생산자미발견 |
| healing / 치유 / #44ff88 / 1 / 120 | 34408: hp=min(mhp,hp+trunc(max(1,mhp×.0003)×sp)) | 원초단위비율로치환하지않음. 여러리더의치유는각각순차적용. 정수화는sp곱뒤. 일반오라effect생산자미발견 |
| haste / 신속 / #ffdd00 / 2 / 150 | 34409: _aSpdM=max(기존,1.3) | 함성과겹쳐도속도최대값. 이동분기의 `(e._aSpdM OR1)`소비와연결되어야실효. 생산자미발견 |
| guardian / 수호 / #4488ff / 3 / 130 | 34410: _aDefM=min(기존,.75); 42187: truthy이고<1일때dmg=trunc(dmg×_aDefM) | M14×.5뒤수호감산, 중간trunc순서유지. Godot hurtE는현재활성수호에서정직halt, 소비완료아님 |

공통source `34394~34411`: alive적전원에 _aAtkM/_aSpdM/_aDefM=1, _auraL=null→web/다리/가시둔화적용→alive+유효aura리더순회→shQuery(range)→자기/죽은대상/거리²>range²제외→**범위경계포함**, 실제oe._auraL=e참조기록→오라종별효과. 리더자신은자기오라를받지않는다. 같은대상에여러오라가있으면**효과는각규칙대로누적하고표시리더참조는마지막리더**다. id만같은대체객체로참조를바꾸지않음. 공간query의실제등록/순서와전체scheduler이식은아직별개다.

## 2. 원본 실행·피격·사망·표시·저장 접점

| 원본행 | 전체계약·이식시지킬순서 |
|---|---|
| 18580~18627 / 34390 | shQuery는 SHASH_CELL=128, trunc((x±r)/128)·trunc((y±r)/128)의 셀 직사각형을 cy→cx→버킷 순서로 수집하며 원형 거리 필터가 없다. rebuild는 2 update마다 alive 목록을 갱신하고 swap 제거로 버킷 순서가 바뀔 수 있다. M22/전파는 후속 원형 거리 검사 없음; 팩 오라·M07/M20·M26은 별도 거리 검사를 하는 계약을 구분. query 반환 참조/재사용 버퍼·순서를 새 정렬로 바꾸지 않음 |
| 38577~38582 | atkTicketRequest는항상true. 아래eliteBusy는**한적의강공격잠금**이며전역동시공격제한과다름 |
| 38584~38770 | updateE벽/KB/무적/status/DOT/stun/freeze early return 뒤접사틱에진입. 원본main거리tier가sp/2sp/4sp/8sp를넘김(34458~34488). 별도실시간timer로바꾸지않음 |
| 38771~38875 | atk=(_isDruidFinale(e)?_druidFinaleAtk(e):baseAtk)→M04/M06/M12/M13/M15/M16→**eliteBusy감소1회**→M19→M29→M30→M31→M32→zone역순감소/만료→M23/M24/M25/M27/M28→stealthT감소→전파→마지막aAtkM배율. 원순서를보존해야같은frame우선선점·ATK참조가같음 |
| 31038~31039 | busy=max(0,(busy OR0)−sp). claim은e/modT없음또는busy>0에서false, 아니면frames기록/true. M19/M30=54, M29=78, M31=45, M32=126. 생성된zone은같은update후행loop에서곧바로sp감소(M30 sp1출생끝t53) |
| 38853~38870 | elite≥2+mods.length>0에서inherit+=sp, ≥1200이면0reset→자기mods중1개RNG→query150→자기/죽음/boss/elite>0/decoy/이미같은mod대상제외→원형 거리 재검사 없는 첫대상 mods.push·없으면부분modT생성(공격계수 필드는 이 생성식에 없음)→text/parts→break. 주석30초와식1200f(60Hz20초)가다름. `_modNStr`무효화writer는이분기에서없음 |
| 31098~31116 | eModHitP는mods없음/빈배열즉시return. M01 RNG→M03KB→M05DOT→M18 RNG→iceOnHit→lava순. 원hurtP내부수락여부와부수효과를임의로묶지않음. M01/M18의회전기폭합체상호작용은스킬·Q/E보호접점 |
| 20006~20157/16940~16985 | TP착지와eProjAt/공통발사·전조·정규화. M13/M31은추가60f shot warning을거칠수있다. M31의45f자체조준과이큐를합쳐하나로생략하지않음. life260→trunc×1.5=390, L탄rawtrunc(atk×.72)→commit dmg×2/sz×2/r×1.3,속도정규화500~600. Qmagic분류보호 |
| 42183~42189 | M17반사비활성→M14trunc×.5→수호trunc×.75→다른M22소유이웃있으면trunc×.67/문구/1회break. M22는**피격자의M22소유검사아님**, ownmods존재/!boss조건아래query120. 단계별trunc를한곱으로합치지않음 |
| 42259~42260 / 42500~42505 | 공격자 eliteSlayer/vsEliteDmg 조건은 elite 숫자 대신 mods.length>0/!boss, mobSlayer는 mods 없음. 전파로 tier0인 적도 조건이 달라질 수 있다. M28 미끼 사망은 alive=false/킬·지역·펫 기록/보라FX 뒤 early return, 일반 부활·드롭·death접사에 진입하지 않음 |
| 42625~42642 | M21삭제주석과일반부활판단별개. elite1 revPow.5/elite≥2 .6 및lv100당+.1등의일반부활경로는TRACE-REVIVE-SHIELD범위/보호 |
| 42748~42767 | 정예잔해확률tier1/2/3=.08/.15/.25, tier0확률0. M26강화는사망자가M26인지와무관하게query200의**받는이웃이M26소유**일때발동. baseAtktrunc×1.2/atk재대입/speed=min(speed×1.15,2)/r=min(r×1.1,30) |
| 42946~42963 | 비boss/비decoy/비물리사망이면elite≥1은원소장판확정, 일반은20%RNG. 크기/수명은 **elite≥2일 때만** sz10/life360, elite1과 일반은 sz7/life240, damage=trunc(atk×.25). 전체속성장판/표시소비완료와데이터기록을분리 |
| 43044~43066 | mods있는경우M07아군힐→M08분열→M10폭발→M20이웃ATK강화→elite>0처치문구/옵션hitStop. 각이웃query의범위/필터를전역일괄alive필터로새로고치지않음 |
| 43078~43115/42748~54 | tier.dropBonus는악의·경험치·장비등급보상접점. 정예악의trunc((12+stage×3)×12×(1+dropBonus))후goldBonus/_maliceMul, 추가악의RNG/콤보·난이도보너스/EXP/rollDrop. 보상담당범위를복제하지않음 |
| 5348~5358 | 등급색장식함수: elite>0 **또는etype≥90**, _saReady/_SA_IMG.complete조건. tier=e.elite OR2, frame=floor(now/140)%2, pulse=.92+.08sin(now/105+(etype OR0)), size=r×(tier3?6.4:tier2?5.8:5)×pulse. lighter/filter/1차alpha=min(1,sa×pulse×1.4)/shadowBlur12+4tier/1.12크기,2차alpha=sa×pulse×.6/그림자0/기본크기. **팩오라효과아님** |
| 18978~18991 / 8712 | 정예 장식의 원시트 `assets/vfx/vfx_shield_aura.png`: 5열×4행/20프레임/셀480×480. `_SA_IMG_R` 파생색 변환 R=min(255,B+40), G=trunc(G×.4), B=trunc(R×.3); 두 이미지 load 뒤 `_saReady=true`. pentagram은 `img/vfx_pentagram_red.png`. Q 보호막과 자원만 공유하며 Q 로직은 보호 |
| 5359~5388 | _drawEliteZoneTelegraph: q=clamp(1−t/dur), head=max(1.5,r×q),pulse=.5+.5sin(now×.018),spin=now×.0008. 고정반경외곽+20눈금/확장진행12눈금/중앙다이아. mortar·M30은원pentagram, mortar십자길이r(.38+.17q). 이미M30구현있으므로새일반kernel과중복writer주의 |
| 5389~5407 | _drawEliteBoltTelegraph: aim회전,3레인850/폭중앙10·양옆5/side간20/점선18,13/offset−now×.28. 지그재그24분할/phasefloor(now/42)/2패스7·2.2와보조아크. 단순한줄로대체하고원본화면동등이라하지않음 |
| 53482~53502 | pack리더: range기준외곽12분할/내곽8분할(.85r)/확산파/회전마커6개,색AURA_DEFS. 영향대상: 살아있는아직aura있는_auraL의색으로r+3/1.2rad호3개. **등급장식시트와별도** |
| 5248~5250 / 52881~52883 / 53571~53576 | M28 modT.stealthT>0 또는 _cloaked면 sa=_spAlpha×(.08+.05sin(now/300)); 정예별 특정 스프라이트 가지는 source-atop/색tier.col/alpha(tier≥3?.25:.15) tint. 이 가지의 적용 범위를 모든 렌더에 확대하지 않음 |
| 53963~54034 | HP/쉴드바·호버의elite/mod/aura표시, gate이름은일반elite명보다우선. mods이름중점연결을`_modNStr`에캐시,리더오라이름〔〕,접사별4×3색점/6간격. M27활성시길이120/폭4,8/끝발광빔. 캐시갱신추정수리금지 |
| 64386~64387 / 64544 | 보스 테스트 UI의 “엘리트+”는 현재elite+1 대입만/리셋은0, debug 상태창도 elite를 출력. 일반 mkEn의 확률/수치 재생성·카탈로그 정합성을 보장하는 UI 아님. 제품용 정예 조절 기능으로 이식하지 않음 |
| 30150~30186/3533~3585/63892~64160 | zone런타임보관은적11필드뿐(mods/aura/timer미포함), 로드mkEn재호출후hp/mhp/lv만덮음. 일반세이브payload의정예전체직렬화소비자는발견되지않음. 저장형식추가금지/기존TRACE-SAVE참조 |
| index:1~4742 | 관련식별자 전체 검색은 부록B. rollElite/rollMods/rollAura/MOD_DEFS/AURA_DEFS 및 35개 카탈로그 ID의 전투 생산자는 미발견. `aura` 일반 문자열은 로비 표현에도 존재하므로 전투 팩 오라로 세지 않음. 로비의출발/캐릭터/slot라우팅과이전투상태의producer를혼동하지않음. 외부JS/동적접근완전성은미확인 |

## 3. docs 설계 폴더와 원본의 불일치·누락 표

폴더의최신정정과옛checkpoint를구분했다. 이표는수치수정지시가아니며기존설계문서는0수정이다.

| ID | 문서/서술 | 원본관측·판정 |
|---|---|---|
| D01 | `9_적AI패턴디자인.md:386`, `몬스터_공격시스템.md:202` M31 “45f후발사/속도3/ATK×.72” | 자체조준끝의eProjAt요청값. 원본38806→20119→20065의추가60f shot queue/속도정규화/피해×2는이서술에생략. 45f를실제탄출생까지의전체대기로옮기면불일치 |
| D02 | AI:377 정예시트alpha “1.4×pulse+0.6×pulse” | 5354첫패스`min(1,sa×pulse×1.4)`,둘째sa×pulse×.6. 1차clamp와두번draw/크기1.12차이를구분해야함 |
| D03 | AI:391/공격:202 “잠금중계수계속누적” | 38800~08은각distance/idle조건이참일때계수증가. M31이미warning중은else누적0. 조건없이전부매tick증가시키라는해석은원본과다름 |
| D04 | AI:372 “스폰시등급·접사·오라유지” | reset하지않는설명은맞지만38853의접사전파·38842의미끼후처리/생성부작용이생략됨. runtime mods가항상출생배열불변이라는해석은불일치 |
| D05 | 세근거폴더의정예표는이름/일부M29~32/등급중심 | M01~28중실제활성분기·M09/M11정의만·M17비활성·M22피격조건·M26받는자조건의전수효과표는이번keyword검색에서발견못함. 새설계를발명하지않고§1.2에실코드계약보충 |
| D06 | `8.2레어몹디자인.md:3~22` 네임드90~99/기본5%·7장10% | 이것은등급2의확률표아님. mkEn은isRareEtype일때rollElite생략. 정예rare행3~15%를네임드5%로대체금지. 상충이아닌집합구분누락위험 |
| D07 | M30상단현재표와옛creation표의“consumer없음” | `FDG_GODOT_M30_EPICENTER_20261013.md`와기존몬스터/AI상단에는후속kernel구현기록존재. 오래된부재표를현재부재로보고하면오류. 일반적자연입장/전체35종완료로반대승격도금지 |
| D08 | 원본38775주석 “M04 3초/180f” | 실제38776은>=120/reset0/HP5%. 원본내주석·실행식불일치이며2초(60Hz)식으로추적. 설계폴더에같은M04수치의명시표는이번검색미발견 |
| D09 | 원본38852/38855주석 “전파30초” | 실제>=1200f=20초, 거리150/한대상. 원본내주석오류를그대로게임계수로사용하지않음 |
| D10 | 원본38782주석 M12 “최대+100%” | hpR=max(.01,hp/mhp)라양수/0HP구간의계수상한1.99, 2.0아님. trunc및조건순서보존. 문서에새cap2.0기재금지 |

## 4. 실제 Godot 의존·누락·소유자

| 의존 | 실제경로/범위 | 이미있는부분 / 빠진부분 |
|---|---|---|
| M29 kernel | `godot/scripts/enemy_mod_m29.gd`, `tests/test_enemy_mod_m29.gd` | owner별lock/trigger/aim/charge/충돌/요청·FX계약존재. 전역factory/모든조합의자연소비아님. 원본_game frame전체를새로구현하지않음 |
| M30 kernel | `scripts/native_m30_modifier.gd:23~86,128~167,169~229`, `data/m30_burst.json`, `tests/test_m30_epicenter.gd` | 거리800/480축적/54잠금/zone125/dmg.65/원pentagram·lava부분존재. 부수text/particle전체·globalVFX pool/일반fullscheduler미완. ownerbusy를다른kernel이중감소시키면안됨 |
| type3/M29/M30 조립 | `scripts/type3_spawn_recipe.gd:55~97`, `type3_summoned_actor.gd`, `type3_native_binding.gd:68~90,209~243`; 기존binding테스트 | stage0 매직3%/M29또는M30/생성HP·ATK·r/cd부품. stage1~34풀·레어/챔피언·다중mod/aura범용선택은미이식. 기존stage0코드재작성아님 |
| 초기·소환굴생성 | `scripts/native_intro_curtain_sequence.gd:70`, `native_spawn_hole_system.gd:94,538~549,602~692` | hell0확률/공격목록부분중복존재. data의 elite/mods는 쓰지만 native_final에 elite/mods/aura를 갱신하는 write는 이 생성부에서 미발견(§4.1). 새공통rules가있다고기존caller자동교체금지/P3-002와조율 |
| type7 조립 | `scripts/enemy_type7_physical_flesh_crawler.gd`, `native_type7_runtime.gd`, `native_type7_teleport.gd`; `tests/test_native_type7_runtime.gd` | exact004/M30서비스·TP·소환조립존재. M29공개Q/E/warning/impact/audio 4cap실공급필수. 일반정예주입아님. 중단 전 기존테스트2단정실패는§6에 과거 원문으로 보존 |
| M22피해 | `scripts/native_normal_enemy_hurte.gd:168~180` | 실제다른적M22검사/alive·거리≤120/피해trunc×.67/문구/1회break **부분구현있음**. 원본 shQuery에는 이 분기의 alive/원형 거리 재검사가 없으므로 완전 동등 아님(§4.1). inventory의“없음”은고정snapshot과구분 |
| M14/수호 | `native_normal_enemy_hurte.gd:162~167` | 활성분기에서`unported_branch_active:mod_M14`/`guardian_aura`로halt. provider/read필드존재는실피해소비완료아님 |
| M26/사망 | `native_normal_enemy_hurte.gd:640~659` | 이웃M26강화는정직halt, 정예원소death장판은UNPORTED진단기록. 일부kill rewards/elitehitstun4f·dropBonus reader가있어도전체정예death효과미완 |
| 오라필드읽기 | `scripts/enemy.gd:321`, `native_dedicated_enemy_hurte_owner.gd:49`, `native_source_normal_enemy_fields.gd` | _aDefM등snapshot/피해provider존재. 일반팩리더query/reset/효과producer/리더참조renderer는미발견. player개인fireAura스킬과혼동금지 |
| 표시에셋 | 원본_SA_IMG/Q보호막시트·pentagram·lava, 기존M30실자원 | 기존이미지재사용. 정예색장식/팩리더12+8링/영향3호/이름·mod색점/일반M31M32렌더의현재일반actor연결은미확인·미이식. Q기능수정없음 |
| 보상·세이브 | 기존kill_reward/drop_item_source·EXP/악의state·TRACE-SAVE/REVIVE | 생성풀·dropBonus일부소비는기존담당소유. M07/M08/M10/M20·전파·모든오라·M01/M03/M05/M18일반상호작용의완전제품경로는미완 |
| actor입장 | P2-008a의etype20·P2-008b의47및후속미지원개체 | **해당담당**. 신규엘리트규칙이곧9/7→10/6입장증거아님. 이번브랜치의factory/world/TP/actor변경0 |

§4의상대경로는godot/아래다. 소스에존재하는등록문자열/affix생성테이블과executable효과를분리했다. 미발견은이기준의추적범위에서의결과이며타브랜치미병합구현까지부재라는주장이아니다.

### 4.1 기존 Godot와 원본의 정적 차이 — 코드 수정 없이 보고

| ID | 근거 | 관측·이식 시 경계 |
|---|---|---|
| G01 | game42189 ↔ `native_normal_enemy_hurte.gd:168~180` | 원본은 shQuery의 셀 후보에서 자기·mods/M22만 검사. Godot는 world 전체목록에 alive·유효instance·거리≤120을 더한다. 후보/순서/범위 차이가 있어 ‘M22 피해 일부’까지만 인정. 동일 후보 목록을 공급해도 원형 밖 원본 셀 후보가 탈락할 수 있음 |
| G02 | game31166/35674 ↔ `native_spawn_hole_system.gd:626~692`, `enemy_melee_flesh_crawler.gd:96~97` | 생성부는 data.elite/mods를 갱신하고 actor는 그 값을 읽음. native_final 갱신 목록에는 elite/mods/aura가 없음. 두 층 전체가 동기화됐다는 주장은 **미확인**. 자연 M29/M30 행동 consumer까지 연결됐다는 증거로 세지 않음 |
| G03 | game31038/38798 ↔ `enemy_mod_m29.gd`, `native_m30_modifier.gd`, `enemy_type7_physical_flesh_crawler.gd:169` | M29·M30 부품 각각 owner lock을 구동할 수 있음. 기존 type7은 exact M30만 구동하도록 주석·분기가 존재. 다중접사 연결 시 두 kernel을 그대로 차례 호출하면 busy를 두 번 줄일 위험. EL-03에서 원본 단일 writer를 보장하기 전 범용 완료 판정 금지 |
| G04 | `FDG_FEATURE_INVENTORY:354`, `native_normal_enemy_hurte.gd:168~180` | inventory의 M22 ‘없음’은 자연 접사 소비 기준 snapshot이고 실제 피해식 부분 consumer는 존재. inventory 수정 없이 이 문서에서 부분 의존만 명시. 전체 정예/오라 자연 입장 인수는 **미확인** |


## 5. 작은 이식 단위 순서안

이번에는구현하지않는다. 이후같은창의구체배정이있을때만해당신규경로를만든다. 첫단위는공용0줄의**선택규칙kernel**이며아직없는일반런타임/actor를거짓등록하지않는다.

### 5.1 EL-01 — 등급·접사·오라 선택 규칙, 공용0줄 지시서

| 항목 | 후속 구현 지시 |
|---|---|
| 새제품파일 | `godot/port_modules/elite_spawn_rules_source/producer.gd`, RefCounted. tables는동일파일에원순서/원숫자로보관. 별도JSON·에셋·Node·clock·private RNG·자동physics없음 |
| 새테스트 | `godot/tests/test_trace_elites_spawn_rules.gd`, SceneTree. 새테스트격리이름 **EXODUSER-trace-elites-Isolated-20261020**. source-oracle.json을검수근거로쓰되현재output을기대값으로재생성하지않음 |
| 원본범위 | game16633~16641/16658~16666의stage→hell, 31033~31037/31041~31043/31045~31061/31063~31097의카탈로그·선택식. eliteBusy/eModHitP/mkEn·기존모듈은옮기지않음 |
| API안 | `configure(random_unit:Callable)->bool`, `roll_elite(stage:int)->Dictionary`, `roll_mods(tier:int,stage:int)->Dictionary`, `roll_aura(tier:int,stage:int)->Dictionary`, `read_catalog()->Dictionary`. configure는1회/같은공유Callable유지. 반환은READY/value/draws 또는NOT_READY/reason. value=[]/null은정상원결과이며실패값으로위조하지않음 |
| 지원경계 | stage0..34 정수/tier0..3 정수/finite U∈[0,1)만이번native API지원. 잘못된입력은RNG/변경0거절. 원JS의undefined/프로토타입/동적registry변조/비정수si전체동등성은범위밖으로명시,0fallback으로위장하지않음 |
| 원순서 | roll_elite는정상입력마다항상U1회/strict경계. roll_mods는tier0이면U0/[]; 그외원poolfilter→공격pool선택/splice→일반pool선택/splice. 누적가중치/셔플전체선소비금지. roll_aura는tier<2 U0/null, 그외U1. 각함수독립호출이며3함수를합쳐mkEn의facing앞으로aura RNG를이동하지않음 |
| tables/소유 | 4tiers/7확률행/35stage/31mods/4auras, M21없음. read_catalog는외부변경으로원tables가바뀌지않는읽기뷰/사본. 원본mutable globals전체동등성은주장하지않음. 살아있는actor/modT/World/원기록에write0 |
| 풀·선택단정 | hell0..6 unlocked mods6/12/17/22/27/29/31, aura1/2/3/4/4/4/4. tier1/2/3의mods길이1/2/3, 공격 우선 선택 수(현재 각 hell에 공격 pool이 충분함)1/1/2, 중복0·해금밖0·후속선택pool의순서와RNG소비정확히1/2/3회 |
| 경계단정 | stage경계3→4/9→10/13→14/20→21/25→26/31→32; champ/rare/magic누적threshold의바로아래/같음/위. tier0일때rollMods/RollAura공유streamcursor불변. .999999999999로마지막선택,0으로첫선택. tier3의M29/M30고정pool은2번splice뒤정확일반pool첫값 |
| 거절단정 | configure무효/재configure·stage−1/35·tier−1/4·provider결손은결과NOT_READY/원상태불변. RNG가실행중부적합값을반환하면그시점소비사실과이전draw prefix를반환하고retry/rollback/0.5보정금지 |
| 격리실행 | 새파일test는Main부팅0. 별도격리runner project기본customuserdir를위이름으로설정하고test시작에실제OS.get_user_data_dir()/ProjectSettings이름확인. Main통합검사를나중에실행할때만override.cfg사용, finally빈파일. 기존회귀는각test상수격리이름 |
| 검증·docs | Node최신원본발췌oracle의catalog/106선택사례·RNG순서를독립대조. 그후Godot새테스트·test_contracts/M29/M30관련필요검사,기존실패는원문기록·기대값완화금지. 코드변경뒤docs전체keyword검색/본추적문서결과·허용CHANGELOG·보고서포함 |
| 선행/충돌 | 신규 경로 부재와 새 main 배정 확인이 필요. 기존type3/native_spawn_holes/intro의hell0롤은이번단위에서교체하지않음. P2-008a/b·공용main/hud/world/player/hurtE/new_run_state **0줄**. M29/M30커널재작성0 |
| 완료경계 | 선택결과/소비RNG계약까지. 일반정예actor생성·다중접사공격·오라효과·표시·보상·저장·플레이완성은미완. 새선택API가원래그자리에호출됐다는연결증거전까지집계승격0 |

### 5.2 후속 순서·파일·테스트·선행/충돌

경로는godot/상대, 전부미구현제안이다. 새테스트는위격리이름을사용하되각Main실행때만override/끝나면비움. 기존회귀는원파일상수우선. 유효한독립단위만선행하고공용소유권이필요하면구현전총괄조정한다.

| 단위 | 신규파일/원본범위·옮길식 | 새테스트·핵심단정 | 선행·공용·충돌 |
|---|---|---|---|
| EL-02 | `port_modules/elite_aura_effects_source/producer.gd`;34394~34411/31083~87. reset1/둔화→pack순서/4effect/max-min/trunc·참조 | `test_trace_elites_aura_effects.gd`; 자기·dead·정확range경계/중복max·힐순차합산/마지막실제leader ref/웹둔화max덮음 | EL-01카탈로그만읽음. 제공된ens/query/참조를쓰는수동kernel로공용0줄. 실제공간query/AI배선은EL-09 |
| EL-03 | `port_modules/elite_owner_attack_order/producer.gd`;31038~39/38798~38809. busy1회/우선19→29→30→31→32/생성updatezone감소 | `test_trace_elites_attack_order.gd`;동시due/서로다른owner독립/M30의54/출생53/M29의78·busy중distancegate별누적 | 기존M29/M30의자체lock감소와공유owner조정은설계검수후. 둘다그대로매tick불러이중감소금지. 새adapter만우선/공용0 |
| EL-04 | `port_modules/elite_tick_effects_source/producer.gd`;38771~38797/38810~38840. M04>=120힐.05/M12상한1.99/M15거리10~1200·480/KB5/M23흡수/M24DOT/M25원소/M27빔 | `test_trace_elites_tick_effects.gd`;timer reset0/no while/초기ATK복원·오라후곱/원RNG순서·첫시체흡수·range strict/원loop순서 | EL-02/03, 하나의mod씩부분파일/후속커밋분할가능. 다중효과를한번에제품GO로하지않음. sourceprovider 부족은NOT_READY·기존owner직접쓰기금지 |
| EL-04a | `port_modules/elite_summon_clone_source/producer.gd`;38778~81/38794~97/38842~50. M06 timer1200·자식2 HP.4, M16 HP<.5·HP.3, M28 HP<.4·미끼2 HP.2/ATK.5/stealth300 | `test_trace_elites_summon_clone.gd`;원 constructor/RNG 선행·종별 후대입 차이·aura/shield/poise 보존·M28 출생tick stealth감소 | 원 mkEn provider가 선행. type3/동일etype actor 자체는 **P2-008a/b 담당**이며 재구현0. 신규 명령 부품만 공용0 |
| EL-04b | `port_modules/elite_teleport_caller_source/producer.gd`;38785~89/20006~20157. M13 idle·d600·timer600/뒤50/유효warning120/실패540/성공시 eProjAt | `test_trace_elites_teleport_caller.gd`;invalid 위치0커밋·retry540·착지 성공시에만 발사요청·공유RNG 순서 | TP kernel·색·World context는 **P2-008b 담당**. 그 구현을 참조하고 새 M13 timer/caller만 분리. 기존 TP 파일 수정0 |
| EL-04c | `port_modules/elite_lightning_mortar_source/producer.gd`;38800/38806/38808~09. M19 360/54/r105/.65, M31 360/45/3발±.24/.72/L, M32 600/126/3zone/r68/.8 | `test_trace_elites_lightning_mortar.gd`;M31 warning 중 거리독립·추가60f queue 생략0·zone 역순만료·원 거리와 피해경계 | EL-03과 공통발사/장판 provider 필요. M19→M31→M32 각각 분할 커밋. 기존 M30 재작성0·공용0인 요청 kernel까지만 |
| EL-05 | `port_modules/elite_on_hit_effects_source/producer.gd`;31098~31116. M01/M03/M05/M18 순서, 빈modsreturn | `test_trace_elites_on_hit.gd`;RNG선행단락/P상태제외/KB×2/poison max1trunc.3/빈mods뒤ice/lava0 | 스킬회전기폭/Player상태·Q/E보호접점. 순수명령까지공용0. 강제기폭실소비는TRACE-SKILLS담당조정 |
| EL-06 | `port_modules/elite_defense_source/producer.gd`;42183~89. M14.5→guardian.75→M22.67 단계trunc | `test_trace_elites_defense.gd`;소수중간값·피격자M22소유아님·자기제외/이웃1회break·원 shQuery 후보에 거리 필터 추가0·boss분리 | 기존hurtE M22부분재구현중복금지, pure계산oracle먼저. 공용native_normal_enemy_hurte반영은EL-09/별도소유확정. M17반사활성화금지 |
| EL-07 | `port_modules/elite_death_inherit_source/producer.gd`;42764~67/43044~66/38853~70. M07힐.3/M08분열2/M10거리80·ATK3/M20이웃1.5/M26받는자강화·cap/전파1200 | `test_trace_elites_death_inherit.gd`;실death도달전0/M08원constructor후처리·shield0/원공유RNG·query 순서의 한 대상 전파/원형 거리 재검사 추가0·_modNStr임의수리0 | 부활/보상담당·원dynamicfactory계약선행. 생성대상type3/타etype를P2-008b와중복구현하지않음. 우선원명령단위/공용0 |
| EL-08 | `scripts/native_elite_pack_display.gd`;5348~5407/53482~53502/54014~34. 원시트/등급색·팩링·참조/텍스트·색점/M31·32표시 | `test_trace_elites_pack_display.gd`;시트frame/2passalpha·크기/리더·받는자다름/동일카메라1x원본대조는별도시각검수 | 기존M30렌더는재사용. 원본assetbyte와fallback이필수, 새AI아트0. HUD/적공용renderhook은총괄소유조정, 맵geometry변경0 |
| EL-09 | **공용연결후보** main/world/actor/Services/hurtE/new_run_state의정확caller구역을별도작업으로확정;31120~67/34394~34411/38771~38875/42183~89/사망branch | 개별연결마다`test_trace_elites_<mod_or_aura>_integration.gd`;실제생성→상태→피해·표시·죽음·보상경계와FAIL중단 | P2-008a/b actor·등록은**담당자참조만**. EL-01~08(EL-04a~c 포함)을 일괄 등록 금지, 실제Mainclock/RNG/phase1writer/guard·세이브보호. 본추적범위공용0줄 |

## 6. 이번 재개 정적 검증과 중단 전 증거

이번 재개에서는 Godot를 실행하지 않았다. 최신 main `284d7faf49295b2f5061937a47ce96038032ed3c`의 두 HTML hash/행수, 접사31+오라4, 부록B의 식별자 전체 일치행, 근거 설계 폴더 24문서, 선행 추적12문서, §4 실제 의존의 최신 blob을 정적으로 대조했다. 제품 코드·테스트·설계 docs·작업판·R 변경 0. 문서의 후속 테스트와 API 이름은 제안이며 현재 구현/실행 결과가 아니다.

### 6.1 중단 전 로그 — 과거 c3cf8ce6 기준, 이번 재실행 없음

기존 `~/exoduser-wt/_out/trace-elites/baseline.json`은 기준 SHA를 `c3cf8ce6b0cc1a5c381240260e03dff71c68af8d`로 기록한다. 아래는 남아 있는 stdout/stderr/meta를 회수한 **과거 실행 증거**다. 최신 main의 테스트는 QA-002 등으로 일부 변경되어 이 결과를 현재 회귀 통과로 전용할 수 없다. 과거 집계는 7종 중 6종 통과·1종 실패(단정2)이며 전체 PASS가 아니다.

| 기존 테스트 | 종료값 / 결과 | 격리 이름 / 관측 |
|---|---|---|
| test_contracts.gd | 0 / 5그룹, 실패단정0 | 테스트 상수 없음 → EXODUSER-trace-elites-Isolated-20261020 |
| test_enemy_mod_m29.gd | 0 / 143 checks·14그룹, 실패0 | 상수 없음 → 동일 격리 기본값 |
| test_m30_epicenter.gd | 0 / 4그룹, 실패단정0·미완료그룹0 | 상수 없음 → 동일 기본값. 의도된 missing-resource 거절 ERROR 1건을 별도 보존 |
| test_native_type7_runtime.gd | **1 / 2그룹 중 1그룹 실패, 실패단정2** | 상수 없음 → 동일 기본값. Camera2D 경고1 |
| test_type3_native_binding.gd | 0 / 4그룹, 실패단정0 | 상수 없음 → 동일 기본값 |
| test_encounter_factory.gd | 0 / 3그룹, 실패단정0 | 상수 없음 → 동일 기본값 |
| test_p1002f_dedicated_hurte.gd | 0 / 381단정·실패0·skipped[]·51 swings | 소스 USERDIR 그대로 **EXODUSER-P1002F-Isolated-20261020**, Main 부팅1. 강제 actor field 180건을 사용하는 fixture이며 public_play_evidence=false. Camera2D 경고1 |


과거 type7 실패 원문:

```text
ASSERT_FAIL [exact_source_actual_assembly] fresh actual source default remains6/10 before explicit fixture installation
ASSERT_FAIL [exact_source_actual_assembly] private fixture's explicit consumer overlay changes6/10 to7/9
```

당시 factory는 지원9/미7, 테스트는6/10→7/9를 기대했다. `m29_unavailable_atomicity` 그룹은 당시 통과. 테스트·제품을 수정해 실패를 숨기지 않았다. M30의 과거 stderr에는 의도된 missing-resource 거절1건이 있으며 다음 원문을 보존한다.

```text
ERROR: Required packaged original M30 texture is missing: res://assets/vfx/__missing_required_M30_original__.png
```

원로그는 같은 디렉터리의 `results.json`, `summary.json`, 각 `<test>.stdout.log/.stderr.log/.meta.json`이다. 당시 Godot 버전은4.7.2, runner는 `_out/trace-elites/runner/godot`, 218개 gd byte 동일·격리 userdir·override 최종0bytes라는 기록이 남아 있다. 이번 재개에서 import/override/전역 editor 설정을 다시 쓰거나 새 실행으로 검증하지 않았다.

`source-oracle.json`의 과거 원본 발췌 VM 기록은106 선택 사례·252단정·실패0이다. 두 HTML의 byte가 현재도 같은 것은 확인했지만 **이번에 그 실행을 반복하지 않았고 Godot 이식 PASS도 아니다**. 현재 전체 정예 조합·일반 actor 입장·시각·청감·성능·자연 스폰·PC/Mac 실플레이는 **미확인**이다.

최신 작업판 `P2-008a-FIX`는 p1002g의 빙결전사 포이즈 경로 정지를 미해결로 기록한다. 알려진 실패를 이 문서의 결함 수정 범위로 편입하지 않으며 이번 실행0·수정0이다. 이번 정적 검증과 Git 제출 결과는 `_out/trace-elites/resume/` 및 지정 `DONE.txt`로 인계한다.

## 7. 공용 파일 접점

| 보호/공용 | 접점·반영 전 조건 |
|---|---|
| main.gd | 실제Main/Services/G/P/INV/clock/RNG공급. EL-01부품때변경0. 부품객체생성만으로자연호출완료주장0 |
| world.gd | ens identity/등록/query/phase·경고/탄birth/renderer. P3-002·P2-008b변경영역존중, 타이머·RNG새owner추가금지 |
| player.gd | eModHitP의KB/DOT/상태/스킬강제기폭. 현재공개API수락bool과원sideeffect순서를분리. Q/E변경0 |
| native_normal_enemy_hurte.gd | M14·수호halt/기존M22/사망M26halt/상태·보상. 원식이있다고통째replace하지않음, 각branch소유승인·rawprefix/NOT_READY보존 |
| native_source_new_run_state.gd·Services | HP/악의/EXP·원현재상태와동일RNG/clock. 새필드저장/기본값주입/복제state금지 |
| hud.gd | 정예·오라표시와HP/shield현재값. sourcebody장식과HUD를구분, leaf/부모DOM안전·원문캐시문제는관측만 |
| P2-008a/b actor·factory·TP | exact정예후처리/소환계약은그담당참고. 이문서단위로같은개체/고정profile/테스트를만들지않음 |
| docs/2_3·세이브 | 보호표시만. Q/E·blackBeanmagic/자원·반사조건·직렬화형식변경0 |

## 부록 A. 최신 main 원본·고정근거 hash

| 파일 / 기준 | 행수 / SHA-256 |
|---|---|
| game.html @ 284d7faf | 65692 / 4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4 |
| index.html @ 284d7faf | 4742 / 36008f72723dbcbf1ae7b6af6b08dfe6299962e2445261139b6237082a24cf12 |
| godot/data/encounters.json @ 284d7faf | 1 / 91fd1a88b394152cd8b0de653f1bde5139b7829f331787581616f7ef3c0724fa |
| docs/engine/FDG_FEATURE_INVENTORY_20261020.md @ 284d7faf | 1304 / ba08777073cc06f7d6671f452fa8ab9c1dd08a31c54eed18b06937e5629a6d64 |
| docs/engine/orders/WORK_BOARD.md @ 284d7faf | 111 / f367df8d6379f2b2e6d7f74993a03006a4caac88e98f97aaceb9ff9f306265b9 |

## 부록 B. 35식별자·구조·함수의 원본 전체 일치행

최신 main의 두 HTML에서 JS 식별자 경계 `(?<![\w$])ID(?![\w$])`(ASCII)로 검색한 **104개 식별자의 전체 일치행**이다. 주석 포함·같은 행 중복1회·연속행 범위 압축. 동적 별명·외부JS 전체 실행 완전성은 **미확인**. SVG path의 M숫자, guardian 스킬, aura 로비 표현 등 같은 철자는 전투 접사 consumer로 세지 않는다. `regen/split/tp` 같은 일반 키도 다른 시스템의 매치를 포함한다. 효과 판정은 §1~2의 실제 분기를 따른다.

| 식별자 | game.html 전체 일치행 | index.html 전체 일치행 |
|---|---|---|
| `M01` | 31046, 31100~31101 | — |
| `M02` | 31046, 31138, 31158 | — |
| `M03` | 31047, 31104~31105 | — |
| `M04` | 31047, 38775~38776 | — |
| `M05` | 31048, 31106~31107 | — |
| `M06` | 31048, 38777~38778 | — |
| `M07` | 31049, 43046~43047 | — |
| `M08` | 31049, 43049~43050 | — |
| `M09` | 31050 | — |
| `M10` | 27742, 27760, 27781, 31050, 43056~43057 | — |
| `M11` | 27752, 27766, 31051 | — |
| `M12` | 27733, 27737, 27740~27741, 27743, 27750, 27754~27760, 27762~27763, 27767~27772, 27774, 27776~27777, 27779~27780, 27783, 31051, 38771, 38782~38783, 38874 | 719, 723, 837 |
| `M13` | 27732, 27738, 27745, 27749, 27761, 31052, 38784~38785 | — |
| `M14` | 27746, 31052, 42184~42185 | — |
| `M15` | 27746, 27773, 31053, 38790~38791 | — |
| `M16` | 31053, 38793~38794 | — |
| `M17` | 31054, 42183 | — |
| `M18` | 27774, 31054, 31108~31109 | — |
| `M19` | 27745, 31055, 38799~38800 | — |
| `M20` | 27778, 31055, 43060~43061 | — |
| `M22` | 31056, 42188~42189 | 719 |
| `M23` | 31057, 38810~38811 | — |
| `M24` | 31058, 38814~38815 | 3209 |
| `M25` | 31058, 38817~38818 | — |
| `M26` | 31059, 42763~42764 | — |
| `M27` | 31060, 38820~38821, 54027~54028 | — |
| `M28` | 31061, 38841~38842 | — |
| `M29` | 31061, 31074, 31078, 38801~38802 | — |
| `M30` | 31061, 38803~38804 | — |
| `M31` | 31061, 38805~38806 | 3201 |
| `M32` | 31061, 31074, 38807~38808 | — |
| `warCry` | 31084, 34407 | — |
| `healing` | 31085, 34408 | — |
| `haste` | 31086, 34409, 62779 | — |
| `guardian` | 31087, 34410, 36770~36771, 36776, 42186, 44099, 44118, 44175, 44336, 44342~44343, 44463, 44471~44472, 44618, 45101, 47676, 47697, 47978, 59706~59707, 61959, 62371 | — |
| `M21` | 27732, 42625 | — |
| `ELITE_TIERS` | 31033, 31072, 31134, 43064, 43078, 43111, 53574, 53977, 54004, 54016, 54019 | — |
| `ELITE_PROB` | 31041, 31064 | — |
| `MOD_DEFS` | 31045, 31073, 31089, 38866 | — |
| `AURA_DEFS` | 31083, 31088, 31093 | — |
| `SI_TO_HELL` | 4209, 4698, 9054, 9512, 11519, 11971, 15337, 16658, 16663, 18262, 25646, 25670, 25682, 25723, 25750, 26668, 26673, 26970, 27538, 29552, 30689, 30699, 30775, 30802, 31001, 31018, 31064, 31072, 31092, 31170, 31426, 31472, 31551, 31614, 31626, 32007, 32052, 32747, 33023, 35705, 35789, 40303, 42001, 43028, 43035, 43797, 43868, 43896, 51120, 51461, 51474, 51581, 51602, 51660, 51697, 51776, 51938, 51980, 52021, 52033, 52131, 53617, 55212, 55237, 55336, 55354, 55376, 55391, 60494, 63551, 63663, 64224, 64242, 65171 | — |
| `rollElite` | 31063, 31132 | — |
| `rollMods` | 31071, 31133 | — |
| `rollAura` | 31090, 31166 | — |
| `eModHitP` | 20020, 31098, 40535, 40545, 40768 | — |
| `_tickEliteAttackLock` | 31038, 38798 | — |
| `_claimEliteAttack` | 31039, 38800, 38802, 38804, 38806, 38808 | — |
| `elite` | 5349~5350, 8235, 31132~31134, 31159, 31166, 31527, 31625, 31636, 32010, 32013~32015, 32036, 32056, 32070, 35709, 38780, 38796, 38847, 38853, 38861, 41596, 41599, 41603, 41613, 41689, 42414, 42628, 42634, 42748, 42750, 42946~42947, 43053, 43064, 43078, 43105, 43111, 43113, 52709, 53571, 53573~53574, 53977, 54004, 54016, 54019, 64386~64387, 64544 | — |
| `mods` | 31034~31037, 31072, 31099, 31101, 31105, 31107, 31109, 31133, 31138, 31158, 31166, 31527, 38774, 38776, 38778, 38780, 38783, 38785, 38791, 38794, 38796, 38800, 38802, 38804, 38806, 38808, 38811, 38815, 38818, 38821, 38842, 38853, 38857, 38862~38864, 41613, 41689, 42185, 42189, 42259~42260, 42764, 43045, 43047, 43050, 43053, 43057, 43061, 53978, 54018, 54024~54025, 54028 | — |
| `aura` | 23160, 31166, 31527, 34401~34402, 34407~34410, 41613, 41689, 53483, 53499, 53988, 54021, 55487, 55491, 59652, 59680 | 1045, 1047, 1073, 3200, 3207, 3216, 3223, 3230, 3316 |
| `modT` | 5248, 31038~31039, 31167, 38776, 38778, 38787~38789, 38791, 38794, 38800, 38802, 38804, 38806, 38808, 38815, 38818, 38822~38823, 38826~38827, 38829, 38831, 38833, 38839, 38842~38843, 38851, 38854~38856, 38865, 41614, 41690, 43050, 43053, 52881, 54028~54029 | — |
| `_aAtkM` | 34395, 34407, 38875 | — |
| `_aSpdM` | 31916, 34395~34398, 34407, 34409, 38318, 38904, 38956, 38981, 39012, 39027, 39046, 39111, 39192, 39204, 39267, 39299, 39312, 39387, 39448, 39462, 39515, 39553, 39610, 39763, 40076, 40463~40464, 40473, 40483, 41394 | — |
| `_aDefM` | 34395, 34410, 42187 | — |
| `_auraL` | 34395, 34406, 53499 | — |
| `_eliteZones` | 38800, 38804, 38808~38809, 53480 | — |
| `_eliteBoltWarn` | 38806, 53481 | — |
| `_eliteBoltAim` | 5392, 38806 | — |
| `_modNStr` | 54018~54019 | — |
| `_drawEliteAuraTelegraph` | 5271, 5348, 53478 | — |
| `_drawEliteZoneTelegraph` | 5359, 53480 | — |
| `_drawEliteBoltTelegraph` | 5389, 53481 | — |
| `_MOD_MAP` | 31089, 53978, 54018, 54024 | — |
| `_AURA_MAP` | 31088, 34402, 53483, 53499, 54021 | — |
| `_SA_IMG` | 5349, 5355~5356, 18978, 18983~18986, 23173, 59660, 59662 | — |
| `_saReady` | 5349, 18980, 18991, 23171, 23178, 23238, 59645, 59681 | — |
| `_pentaRed` | 5364, 5366, 8712, 57436, 57572, 57574 | — |
| `regen` | 7692, 8125, 15207~15208, 15253~15255, 15403, 27691~27693, 27706, 27710, 27718~27719, 27778, 31167, 38776, 38865, 41614, 41690, 44196, 44207 | — |
| `summon` | 9826~9827, 9869, 9898, 9963, 9965, 9969, 9977, 9983, 9992, 9999, 31167, 37723, 38778, 38865, 41614, 41690, 44090, 44114, 44175, 44180, 44218~44220, 48155, 50122 | — |
| `tp` | 8693, 19799~19800, 19804, 19818, 19893, 19898, 19959, 19961, 24832~24833, 24836, 24841, 24843, 31167, 35781, 38787~38789, 38865, 41614, 41690, 52058, 52066 | — |
| `chaos` | 31167, 38818, 38865, 41614, 41690 | — |
| `vortex` | 4790, 6426, 9825, 9828, 9831~9832, 9840, 9894, 9898, 9911, 9969, 9977, 9983, 9992, 9999, 24622, 24626, 31167, 36816, 36830, 36846, 37300, 37732, 38791, 38865, 41614, 41690, 44179, 45264, 48155, 56130, 56173, 56179, 57220, 63778 | — |
| `lightning` | 8796, 13208, 14378, 15219, 17314, 17336, 18841~18842, 31167, 35274, 35308, 35328, 35473, 35475, 35521, 35598, 36632, 38800, 38865, 41614, 41690, 42386, 42396, 44097, 44164, 44178, 44223, 44298, 45243, 57069, 57088, 57096, 57155, 61015, 65425, 65496, 65499, 65501, 65525 | — |
| `twarp` | 31167, 38815, 38865, 41614, 41690 | — |
| `cloned` | 31167, 38794, 38865, 41614, 41690 | — |
| `revived` | 31167, 38865, 41614, 41690 | — |
| `split` | 1860, 2039~2040, 2713, 2941, 7397, 10692, 10818, 17323, 17346, 29688, 31167, 34604, 38865, 41614, 41690, 43050, 43053, 47010, 49224, 49241, 50588, 54559, 63309 | 2444, 4610 |
| `sentry` | 31167, 38823, 38826, 38831, 38865, 41614, 41690 | — |
| `sentryAng` | 31167, 38822, 38827, 38833, 38865, 41614, 41690, 54029 | — |
| `sentryOn` | 31167, 38829, 38839, 38865, 41614, 41690, 54028 | — |
| `illusioned` | 31167, 38842~38843, 38865, 41614, 41690 | — |
| `stealthT` | 5248, 31167, 31200, 38843, 38851, 38865, 38961~38963, 41614, 41690, 52881 | — |
| `eliteBusy` | 31038~31039, 31167 | — |
| `eliteCharge` | 31167, 38802 | — |
| `eliteRing` | 31167, 38804 | — |
| `eliteBolt` | 31167, 38806 | — |
| `eliteMortar` | 31167, 38808 | — |
| `_inherit` | 38854~38856 | — |
| `_isDecoy` | 34382, 38847, 38861, 42502, 42946 | — |
| `_tpWarnT` | 17074, 31194, 34523, 38786~38787, 38789, 38923~38925, 38932, 39419~39421, 39426, 40330~40332, 40342, 40348, 40397~40399, 40404, 42583 | — |
| `_tpWarnMax` | 31194, 38789, 38932, 39426, 40348, 40404 | — |
| `_tpWarnX` | 31194, 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — |
| `_tpWarnY` | 31194, 34523, 38786, 38789, 38925, 38932, 39421, 39426, 40333, 40337, 40348, 40399, 40404, 42583 | — |
| `_tpWarnCol` | 31194, 38789, 38932, 39426, 40348, 40404 | — |
| `mkEn` | 30184, 30782, 31120, 31375, 31384, 31431, 31437, 31443, 31450, 31476, 31497, 31512, 31523, 31601, 31620, 31635, 31647, 32133, 35675, 35707, 38780, 38796, 38845, 39040, 39244, 39414, 39487, 39630, 40012, 40105, 40244, 40415, 40789, 40807, 42611, 42795, 42830, 43052, 62289, 63428, 64753 | — |
| `shQuery` | 16540, 16591, 17407, 17412, 18617, 18757~18758, 18766, 19784, 19831, 24585, 24603, 24614, 24631, 24642, 24657, 28809~28810, 28845, 32136, 32267, 32270~32271, 32305, 32427, 32500, 32607, 32657, 33235, 33388, 33421, 33454, 33466, 33488, 33787, 33995, 34031, 34174, 34240, 34278, 34313, 34400, 34404, 34740, 34759, 34783, 34794, 34828, 34832, 34990, 35073, 35100, 35107, 35118, 35146, 35168, 35188, 35224, 35250, 35261, 35282, 35301, 35387, 35438, 35463, 35479, 35503, 35525, 35591, 35619, 36114, 36126, 36166, 36174, 36266, 36285, 36524, 36537, 36545, 36610, 36869, 36893, 36939, 36995, 37117, 37218, 37243, 37266, 37304, 37359, 37383, 37419, 38545, 38858, 38895, 38937, 38976, 39034, 39548, 40487, 40555, 40593, 42115, 42189, 42331, 42438, 42442, 42492, 42495, 42662, 42677, 42764, 42772, 42786, 43047, 43061, 43118, 43236, 43340, 43600, 43602, 43604, 44854, 45053, 45121, 45438, 45612, 45641, 45924, 45967, 46058, 46138~46139, 46323, 46530~46531 | — |
| `shRebuild` | 18585, 34391 | — |
| `rebuildDeadPool` | 18771, 34391 | — |
| `_deadPool` | 18770~18771, 38811, 38948 | — |
| `teleportE` | 20006, 38786, 38925, 39421, 40399, 53183 | — |
| `eProjAt` | 20119, 38787, 38806, 38927, 39104, 39131, 39160~39161, 39282~39283, 39306, 39354, 39398, 39404, 39458, 39479, 39503~39504, 39584, 39635, 39854, 39925, 39971, 40020, 40153, 40167, 40218, 40227, 40236, 40341, 40379, 42901, 42908, 42927, 42933, 42940 | — |
| `_spawnGhoul` | 34538, 41602 | — |
| `_spawnMatSlime` | 41641, 41674 | — |
| `rollDrop` | 32002, 34442, 43110 | — |

## 부록 C. 최신 근거 설계 폴더 검색·검토 범위

`docs/8.0몬스터디자인/`, `docs/8.2레어몹디자인/`, `docs/9적ai패턴디자인/`의 Markdown **24문서** 전부에서 `정예|오라|M[0123][0-9]|접사|elite|aura|ELITE|MOD_DEFS`를 검색했다. 9문서/157일치행. ‘—’는 이 패턴의 일치행0이며 관련 구현 전체 부재 증거가 아니다. 정예 직접 절·참조 계약은 §3/§4, 중복 문서는 §0.1로 귀속한다. 불일치는 표로만 보고하고 기존 문서를 수정하지 않았다.

| 경로 | 최신 main 일치행 |
|---|---|
| docs/8.0몬스터디자인/1장_썩은숲_보스_애니메이션_작업기준.md | — |
| docs/8.0몬스터디자인/CH1_1_START_다안육괴_중형몬스터.md | 24 |
| docs/8.0몬스터디자인/FIELD_MINIBOSS_VISIBILITY_20260912.md | — |
| docs/8.0몬스터디자인/FIELD_PROJECTILE_CADENCE_20260910.md | 15, 22~26, 34 |
| docs/8.0몬스터디자인/KRAKEN_WATER_ENERGY_20260913.md | — |
| docs/8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md | — |
| docs/8.0몬스터디자인/PHYSICAL_PROJECTILE_BITE_20260916.md | — |
| docs/8.0몬스터디자인/PHYSICAL_PROJECTILE_SCALE_REWARD_20260910.md | — |
| docs/8.0몬스터디자인/PHYSICAL_PROJECTILE_VISIBILITY_20260914.md | 73 |
| docs/8.0몬스터디자인/code_etype20_29_얼음몹_애니메이션_공격모션_정리.md | — |
| docs/8.0몬스터디자인/pixellab_몬스터_완성도리스트.md | — |
| docs/8.0몬스터디자인/pixellab_종류분류.md | — |
| docs/8.0몬스터디자인/거대에너지탄_피격넉백_2026-09-04.md | — |
| docs/8.0몬스터디자인/몬스터_공격시스템.md | 8, 11~13, 15, 28, 41, 45~46, 50, 54, 62, 73~75, 78, 82, 95, 162, 193, 195, 202, 215, 249, 251, 292~293, 470~472, 474, 756, 774, 818, 891, 897 |
| docs/8.0몬스터디자인/몬스터_사운드설계.md | — |
| docs/8.0몬스터디자인/몬스터_스킨_렌더링_파이프라인.md | 6, 9~11, 13, 27, 33, 40, 44, 48, 51, 53, 61, 72~74, 77, 94 |
| docs/8.0몬스터디자인/몬스터_총관리.md | 23, 26~28, 30, 43, 45, 52, 56~57, 61, 63, 71, 82~84, 87, 91~92, 105, 407, 547, 710~712, 871, 1178, 1360, 1362, 1364 |
| docs/8.0몬스터디자인/스테이지_몹분배.md | — |
| docs/8.0몬스터디자인/탄막시스템_총정리.md | 10, 13~15, 17, 30, 43, 47~48, 52, 54, 62, 73~75, 78, 96, 229, 276, 689 |
| docs/8.2레어몹디자인/8.2레어몹디자인.md | — |
| docs/9적ai패턴디자인/9_적AI패턴디자인.md | 12, 15~17, 19, 32, 42, 46~47, 51, 53, 55, 63, 74~76, 79, 83~84, 97, 274, 294~295, 372, 377, 380, 382, 384~387, 389, 391 |
| docs/9적ai패턴디자인/ENEMY_AI_TEAM_MASTER.md | — |
| docs/9적ai패턴디자인/exoduser-ai-first-pipeline-v3.1.md | — |
| docs/9적ai패턴디자인/참고_영문레퍼런스_AI디자인패턴.md | 29, 36, 40, 42, 128, 160, 171, 365~368 |


## 2026-10-21 DEMO11-30 연결 전 감사 — BLOCKED

main `ac3764bfe5476b56e2f2388b1f2d9baeff731885`에서 §5.1 EL-01 제품 경로와 EL-03 owner 경로는 부재다. type3/type7 constructor 테스트의 all-ready 서비스를 실제 Q/E 준비 증거로 사용할 수 없다. Main은 부분 Q_CONTROL만 연결하고, 기존 QE contact API는 투사체 전용이므로 M29의 원본 G40533–40534 비투사체 패링을 대체하지 못한다. PC 전투 소유권을 지키기 위해 자연 actor 등록을 보류했다. 단일 lock·hell0 제한·G31614–31638 forced 후대입 보존 및 재개 인터페이스는 [DEMO11-30 보고서](orders/reports/demo11-30_REPORT.md)에 기록했다. 제품·테스트 변경0, Godot 실행0, 완료 승격0.


## 2026-10-21 EL-01 — Mac hell0 배정 결과

사용자/PC 결정에 따라 EL-01 중 **hell0 stage0..3 선택기**를 구현했다. §5.1의 전체35stage 카탈로그 이식은 이번 범위가 아니다. type3 recipe·인트로 링·소환굴에서 원래 constructor prefix에 선택기를 재사용하고 speed/radius/facing 뒤 aura 위치를 바꾸지 않는다. G38798–38809의 단일 lock owner 진입점·M30 standalone 호환·G31620–31636 forced 후처리 API도 구현했다. DEMO11-30의 ‘EL-01 부재’는 이 단위로 해소하되, 실제 PC 비투사체 패링 미인수 시 type3/type7 M29 binding NOT_READY와 문지기 실제 actor caller 후행은 유지한다. [EL-01 보고서](orders/reports/el-01_REPORT.md)에 실제 원격 의존·검수·잔여를 구분한다.
