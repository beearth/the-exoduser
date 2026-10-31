# P2-001c — 처치 보상 (경험치·물약·드랍·사망 사운드) (2026-10-20)

## 1) 경험치 — 원본 추적
| 행 | 문장 | 구현 |
|---|---|---|
| 43099~43101 | `_comboPct=⌊G.combo/100⌋×.05`, `_diffPct=max(0,_diffSigned())×.10`(9278: OPT.diff(5)−5=0), `_comboBonus=1+...` | 실행자 — diff는 기존 kill_reward/source_difficulty_signed 모듈(services 공개 래퍼 신설) |
| 43112~43114 | `eLv=e.lv||10; _expMul=1×_comboBonus; addExp(~~(max(5,~~(eLv×.4))×_expMul))` — lv1 → raw 5 | 실행자 |
| 43140~43144 | `v=~~(v/3)` → `nc().expBonus`(스타터 0) → `_eqAffix('expBonus')`(0) — lv1 처치 exp = **1** | 실행자(인벤·어픽스 provider) → state owner |
| 43146~43156 | `P.exp+=v; while(exp>=maxExp){lv++,exp-=maxExp,maxExp=_calcMaxExp(lv),sp+=3,짝수렙 ap+=1}` — _calcMaxExp(43128): `~~((15+lv·2.5+lv²·.05)×1.001^lv)` (lv<1000) | state `apply_native_add_exp` (P owner). lv≥1000 초월 게이트 활성 시 정지(미이식) |
| 43160 | 20% 회복: hp/st/mp `min(max, +~~(max×.2))` | 자원 authority `commit_native_level_up_heal` (q_parry_reward와 동일 소유 경로) |
| 43163~43166 | SFX.levelup·showPH('LEVEL UP!')·addTxt('SP +N [AP +M]',#ffdd00,60)·_levelUpVfx | **addTxt만 이식**(NativeFloatingText). SFX/showPH/VFX·악마화 색 분기(#d38aff — PASSIVES.pDemon 0) 미이식 목록 |
| 43169~43171 | lv300/700 스킬 해금 (blueShot/burstLoop/voidScarecrow) | state에서 P.skills 기록 (도달 시) |
| 43173 | dbSaveForce | **미이식 — 세이브 금지 지시** |
| 43157 | 패시브 예약 큐 자동 투자(51222) | 포트에 큐 시스템 부재 → 0 투자 (목록) |

## 2) 물약 — 원본 추적
- 43092~43096: 게이트 `rand<1`(항상)·종류 롤(기존 provider 소비 그대로) → `addPotion(pt,1)` 성공 시 `addTxt(e.x,e.y-8, POT[pt].name+' +1', POT[pt].col, 30)` — POT(27677)는 **hp('악의오브 추출', #33cc66)만 존재**.
- addPotion(28250~28263): `hp` → **G.mats+=count** + `addTxt(P.x,P.y-20,'+N','#cc66ff',25)` + SFX.pickup(사운드 미이식 목록) / st·mp → POT에 없어 **버림**(2026-10-10 퀵슬롯 폐지 원문). → QSLOTS owner 불필요(첫 전투 경로에서 도달 불가; HUD 연결 대상 없음 — 목록).
- state `apply_native_add_potion`이 G owner 쓰기·텍스트 사양 반환, 실행자가 방출.

## 3) 드랍 — 원본 추적·구현 경계
- **RNG 스트림 변경(중요)**: E 추적표가 "43110 rollDrop 미이식 — RNG 미소비"로 고정했던
  항목을 본 작업이 이식 — **처치 롤 꼬리에 `drop:*` 롤이 이어진다**(provider rand).
  고정 접두(크리→부활→고어→[장판]→물약2)는 불변, E/F/G/P2-001b 테스트는
  '접두 고정 + drop:* 꼬리(첫 롤 drop:drop_gate)' 검증으로 갱신.
- rollDrop(32002~32077) 전체 이식: dropBonus=statDropBonus(27999, lck·pDrop·dropRate어픽스·
  결정드랍, _greedCurse 부재=1), normal 게이트 .45×(32018, && 단락 — normal만 롤),
  5등급 가중치 [65,22,9,3,1,0.01](32013), 슬롯 풀=SLOT_NAMES−ossuary(15178), 원소 6종,
  위치 지터 ±15, 유골 부위(2%→ANC 1종·부위 4종·가중치 재사용·mkBonePart 45788),
  결정(15%→18종·성급 .8경계·품질 _qRoll 1~100·_crAutoProcess는 기본 OFF 즉시반환),
  소켓석(1.5%→_stoneTierRoll B=.42 기하 가중·10분위 품질) + 획득 텍스트 2종(원문 인자).
- **mkItem(15894~16166) 전체 이식**: base 테이블은 JS 객체 리터럴이라 **모든 슬롯의 랜덤
  필드가 프로퍼티 순서대로 평가**됨(mkItem 1회당 base만 28롤) — 그 순서 그대로.
  무기/활 타입·슬롯 전용 블록·3파트 스탯 룰·rollAffixes(15131, 추출 AFFIX_POOL 409종,
  접두/접미 교차·그룹 중복 금지·tierW/skewRoll)·임플리싯(16119)·전설 특수 19종(16128)·
  유니크 특수 39종+외관 20그룹(16136)·reqLv(16143)·홈 0 고정(16149).
  **부위 고정 없음 — 슬롯·어픽스·수치 전부 원본 무작위 규칙 그대로**(docs/7아이템디자인).
- 테이블은 node로 원본 리터럴을 평가해 추출(`data/item_generation_tables.json`) — 수기 전사 없음.
- **구현 경계(미이식)**: 바닥 아이템 렌더·줍기·playItemDropSfx(드랍은 state 레코드 owner
  `_native_drop_records`, _wiPush(16721)의 20개 축출 규칙 적용) / 인벤토리 반입 /
  결정·소켓석의 HUD·합성 소비자(최소 가방 owner만) / ossuary 슬롯(드랍 풀 제외 — 원문) /
  보스·챕터보스 드랍 경로(가중치는 구현, 비보스 hurtE 범위라 비도달).

## 4) 사망 사운드
- 24790~24830: 프레임 버스트(mark/N/throttled·cd5·비보스 6보이스), 레이어 볼륨
  1→.72−.16(n−1)(min .32)·피치 1→_r(1.05+n·.03,.06), `_deathSfxKey`(24762): etype4→
  death_bone 풀(12변형)·etype0/1→death_humanoid 풀(10변형), `_pickDeathVar`(24756) 변형
  랜덤(오디오 전용 RNG — 기존 공격음과 같은 스트림), 볼륨 .825(r<40 비ARMOR)·_r(v,.08)·
  _r(1,.12), n==0 15% death_grunt. r≥40 25% monster_die1은 첫 스테이지 비도달(파일 미복사).
- **에셋**: sfx/death/ACE 원본 21파일 복사(`godot/assets/sfx/death/`) — death_skull은
  `ACE/skull.mp3`(10298), death_grunt는 `death/death_grunt_01.mp3`(10254)를 레지스트리 키
  이름으로 복사(바이트 동일). 새 사운드 제작 없음.
- **미이식**: 좌우 팬(_layPan — 현 비위치 버스 경로 미지원), 보스/구울/ARMOR 변형,
  pickup·levelup·아이템 드랍 사운드.

## 변경 파일
port_modules/kill_reward/drop_item_source.gd(신규)·data/item_generation_tables.json(신규)/
native_source_new_run_state.gd(addPotion·addExp·드랍 레코드·결정/소켓석 가방 owner)/
native_source_resource_authority.gd(레벨업 20% 회복)/
native_source_player_initialization_services.gd(diff 공개 래퍼)/
main.gd(사망 사운드 디스패치+21샘플·OPT 드랍 필터 읽기)/
native_death_fx_adapter.gd(사운드 처리 플래그)/native_normal_enemy_hurte.gd(43092~43116 배선)/
assets/sfx/death 21파일/테스트 1신규+4갱신(E/F/G·P2-001b — drop 꼬리·사운드 디스패치).

## 검증 (원로그 scratchpad\p2-001c\logs\)
- test_p2001c_kill_rewards **39/0 PASS**: ① 모듈 순수 — 스크립트 RNG로 전미발동 4롤·
  무기 rarity0 **43롤 수계산 일치**·rarity1 어픽스 롤 증가·결정 분기 7롤/성급 경계/품질식
  ② addPotion hp→mats/st 버림·addExp 경계(20exp → lv2·exp5·maxExp20·SP3·AP1·20% 회복)·
  사망 사운드 29샘플 디코딩 ③ 실전 처치 — exp 증가식·mats(+4+포션)·drop 꼬리
  (drop:drop_gate 시작)·레코드/가방 일치·사운드 디스패치. 결정성: ①②는 완전 결정적,
  ③은 적응형 단정 — 1회 충분(문서 §결정성), 커밋 전 2회 실행 동일.
- 회귀: p1002e/f/g·p2001a/b·contracts (갱신된 drop-꼬리 단정 포함) — 결과는 보고서 표.
- 2회차 재실행(run2): 45/0 PASS — live 그룹은 실제 드랍 발생에 따라 단정 수가 적응적(15→21),
  실패 0 동일.

## 화면 검수 (scratchpad\p2-001c\shots\)
- 격리 userdir 프로브로 첫 스테이지 eye_mass 2마리 처치 장면 캡처, 대상 실제 좌표
  (target_screen 1047,537 / 1039,538) 크롭·1x 확대 직접 판정.
- 보이는 것: 막타 피해 숫자(137, _numStr 비트맵 경로)·사망 연출·혈흔 — 기존 P2-001a/b와 동일 톤.
- 보상 텍스트('악의 추출 +1'·'+1'·'결정 획득!')는 **화면에 나타나지 않음 — 원본과 동일 동작**:
  원본 L54835~54840 렌더 화이트리스트(['시전','그로기','무적','CRIT','사망','탈출','✟','🌋'],
  _btActive 아닐 때 _numStr 외 텍스트 전부 필터)가 보상 텍스트를 걸러낸다. 포트의
  floating_text/producer.gd build_draw_plan(SRC_WHITELIST, L55296 전사)도 동일 — 라이브 진단으로
  풀 admitted(live_count 1)·draw_plan 0 확인. 즉 admitted까지는 원문 인자 그대로 이식됐고
  표시 억제는 원본 렌더 규칙의 충실한 재현이다(결함 아님).
- 처치 보상의 가시 결과는 데이터로 검증: journal(add_exp/roll_drop/potion_applied)·
  P.exp/lv·G.mats·드랍 레코드/가방 — 프로브 출력 PROBE_P lv=1 exp=2 mats=8 drops=1.

## 잔여
바닥 드랍 표시·줍기·인벤 반입 / 레벨업·픽업 연출(사운드·showPH·VFX) / 초월(1000+) /
보스 드랍 경로 실사용 / HUD(경험치 바·악의오브 카운터 — 기존 HUD에 exp 표시 없음: 목록) /
팬 지원 / 유골 도감(ossCollect) 반입.
