# P2-001h — 인트로 커튼 오픈 시퀀스 런타임 이식 (2026-10-20)

## 원본 추적 (현 리포 game.html 행)

체인: 인트로 컷신 종료 → `_startIntro`(63277~63293) → 키 가이드 4컷(`_startIntroGuide`
63357~, `_INTRO_KEY_STEPS` 4개, Enter/Space 진행·Esc/Space 2s홀드 스킵, 250ms 쓰로틀
63352) → `_finishIntroGuide`(63342~63348) → `_openIntroCurtain`(63411~63441).

| 행 | 원문 | 이식 |
|---|---|---|
| 63279~63283 | ens 전부 제거·(비tileRLE) spawnHoles 비움·bonfire.t=0·G._intro=true·G.on=false·P.iframes=9999 | begin_native_intro — ens 제거는 설치 제거 API 부재로 잔여(스냅샷 unported), G 쓰기는 state owner API |
| 63289~63291 | 커튼 보이기+닫힌 상태 | view.show_closed() (기존 R25 뷰) |
| 63358 | 인트로가 OPT.diff=5(일반) 강제 | dm=1·lvOff=0 고정의 근거 (설정 저장은 잔여) |
| 63413 | **G.on=true**·P.iframes=600 | finish — state `apply_native_intro_curtain_g_writes("open")`. stage0 흐름의 G.on 점등 소유가 이것: update clock(P1-002.D) `phase_g_on`(32580 `if(!G.on)return`)과 G.stageTime 진행이 이때 열린다 |
| 63417~63420 | tileRLE(1-1)는 room/corridor 리스폰 생략 | 게이트 그대로(생략) |
| 63422~63423 | 시작 500px 내 몹 제거 | 후보 계수(현 설치본 최근접 888px=상시 0건). 실제 제거는 소비자 제거 API 부재 — 가짜 제거 금지, 후보>0이면 스냅샷 노출 |
| 63425~63432 | **반경 `_iR=580` 오각 링(각 `2πi/5−π/2`) `mkEn(x,y,0,0,false,EL.P,-1)` 5마리** | `_spawn_ring_enemy` ×5 — 아래 mkEn 미러 |
| 63433 | `G._bonfire={x,y,t:300,r:280}` | 모듈 소유 bonfire 상태 |
| 63434~63440 | 커튼 CSS 0.8s 열림·+900ms 요소 숨김·G._intro=null | view.open() + 900ms 후 hide_now·state "dispose" |

### mkEn(31120~) etype0 미러 — live RNG 소비 순서 그대로 (공유 샘플러)
(1) rollElite(31063, ELITE_PROB[0]=[.03,0,0] → 매직 3%만) → (2) 매직일 때만
rollMods(31072: pool hell≤0 ∩ M29..M32 = [M29,M30]에서 1개) → (3) spd(31138,
(ETYPE_SPD[0]=0.39+u×.08)×1.5) → (4) r(31140, (ETYPE_R[0]=10+u×2)×2×scaleMul) →
(5) st2(30+u×50) → (6) facing(u×2π) → (7) projT(180+u×120) → (8) bossPatT(30+u×20).
aura는 elite≥2 전용(미발생), etype 게이트 타이머들은 조건부 평가라 원본도 etype0에서
무소비. HP v14(31146~31148, lv1→875·매직 1751=875×2)·ATK(31153~31154, 31/매직 40)·
projCd(31159~31160, 240/매직 192)·poise=eShield=hp(31167/31177)·스킨 시드(23788,
etype·x 결정적). P2-001d가 본 "5마리 중 1마리 2×체력(1751)"은 보장 규칙이 아니라 이
3% 매직 롤의 표본.

### bonfire(화톳불 결계)의 원본 동작
- 피해/회복 없음. t 300틱 동안(34413 `t-=sp`) **비보스 적을 경계(r 280+clearance,
  etype0은 r)로 밀어내기만** 한다(34424 `_pushOutsideBonfire` 31732~). kb 내향 성분
  소거(31740~31741)는 적 내부 kb 비공개라 잔여(이 시나리오 kb=0).
- 시각 = **금빛 마법진**(웹 cmp1 중앙): `sprites/bonfire_barrier.png`(18977) 원본 에셋
  그대로 복사, 55323~55334 렌더 공식(alpha=min(1,t/120)×.9, pulse=1+sin(now/300ms)×.03,
  size=r×pulse×2, 일반 블렌드).

## Godot 구현 (고정 캡처·factory 가드 불변 — 총괄 결정)
- `godot/scripts/native_intro_curtain_sequence.gd` 신규 — 시퀀스 owner(begin/advance/
  finish API + Enter/Space/Esc 최소 입력), mkEn 미러 스폰(FLESH_SCRIPT + 리터럴 템플릿
  `data/etype0_physical_flesh_crawler.json` runtime 복제·RNG 필드만 치환, 스폰 journal에
  draw 전량 기록), bonfire 상태·push-out·결계 드로어(z4003).
- `godot/scripts/world.gd` — `register_native_curtain_ring_enemy`(install형 동적 등록,
  encounters.json·factory 레코드 가드 비소비). 등록된 적은 자체 AI + P1-002 hurtE owner
  경로 그대로.
- `godot/scripts/native_source_new_run_state.gd` — `apply_native_intro_curtain_g_writes`
  (begin: _intro=true/on=false · open: **on=true** · dispose: _intro=null). **G.on 점등
  소유자 공백 해소**: update clock g_on 단계·stageTime이 커튼 오픈부터 진행(원본 순서).
  파일 초기값 on=false(bootstrap)와 "pre-stage on=false" 초기화 계약, 인트로 커튼
  테스트의 "표시 콜백은 소스 게임을 활성화하지 않음" 계약은 **그대로 유효** — 원본도
  G.on을 켜는 것은 CSS 전환(뷰)이 아니라 `_openIntroCurtain`(시퀀스 owner)이다.
- 부트 자동 기동은 미배선(기존 source_startup_activation producer의
  intro_curtain_completion 계약과 같은 ENGINE 통합 단계 — 테스트/하니스는 API로 기동).

## 선재 결함 2건 처리
1. `test_native_main_intro_curtain` FAIL(기준 코드 선재) — 원인: 헤드리스 부트 직후
   첫 프레임 delta가 부트 시간만큼 부풀어 `create_timer(1.05,true)`가 **벽시계 1.05s
   전에 조기 반환**(실측: 부트 직후 0.5s 타이머가 벽시계 244ms에 반환; 스펀지 타이머
   후에는 뷰가 벽시계 900ms에 정상 완료·콜백 1회). 뷰는 원본(setTimeout 900ms 벽시계)
   충실 — 동봉 재시도 테스트(_timeout_failed_only)가 이미 같은 원인을 기록하고 벽시계
   데드라인으로 대기한다. 본 테스트도 벽시계 데드라인 대기로 정정 → **PASS**(재시도
   테스트도 PASS 유지).
2. `test_native_main_source_player_initialization` 2실패(movement_damage_preserves_
   source_speed) — **병합 main a41587404에서 내 변경 유무와 무관하게 재현**(공유 파일
   원복 후 동일). 이 트랙 소관 아님 — HUD/이동 트랙 보고 대상.

## 검증 (원로그 G:\exoduser-wt\_out\p2-001h\logs_final\)
- 신규 test_p2001h_curtain_spawn **122/0** (격리 EXODUSER-P2001H-Isolated-20261020):
  begin(커튼 CLOSED·iframes9999·bonfire0·state G _intro/on), 250ms 쓰로틀, finish 후
  5마리(반경 580·각 72°·etype0·flesh crawler 스크립트·레지스트리 +5), RNG 소비 순서/
  횟수(5×7+매직)와 필드 유도 전수 일치, 매직 경로(hp1751·atk40·projCd192·scale1.08),
  state G.on=true 점등, bonfire 300/280·감쇠 1/틱·push-out 경계 유지, 커튼
  OPENING→+900ms 정리(_intro=null), 스폰 적 hurtE owner 피격.
- 회귀: p1002e 69/0 · p1002f 269/0 · p1002g 168/0 · p2001a 31/0 · p2001b 37/0 ·
  p2001c 40/0 · p2002a(HUD) 38/0 · update_clock_play_time 30/0 · contracts 5/0 ·
  intro_curtain PASS(정정 후) · intro_curtain_timeout_failed_only PASS ·
  encounter_factory 실패 3=기준선 · etype0_flesh_crawler 실패 1=기준선 ·
  initialization 2실패=병합 main 선재(상기).
- 화면(1920×1080 실창, fps 195): `G:\exoduser-wt\_out\p2-001h\cmp_p2h_boot_sequence.png`
  — 커튼 닫힘 / 오픈+850ms(금빛 결계+5링 화면 내 가시) / +4.8s(접근·결계 경계 유지,
  푸시 162회). 웹 cmp1(w1_boot)과 같은 구도로 정합.

## 잔여 (목록)
1. 부트 자동 기동 배선(startup_activation intro_curtain_completion ENGINE 통합 — 총괄).
2. begin의 ens 전부 제거(63279)·OPT.diff=5 강제 저장(63358)·HUD .on 토글(63414).
3. 키 가이드 4컷 패널 UI·voice_wakeup·Space 2s홀드/Tab/게임패드/클릭(63357~63407).
4. bonfire kb 내향 소거(31740~41)·etype36/65/75 clearance 변형(해당 적 미존재).
5. initialization 테스트 2실패(병합 main 선재 — HUD/이동 트랙).
6. 매직 엘리트 mods(M29/M30)의 AI 소비는 적 스크립트 측 기존 범위(M29/M30 모듈 존재).
