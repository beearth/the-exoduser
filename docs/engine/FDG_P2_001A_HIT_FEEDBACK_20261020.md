# P2-001a — 첫 전투 타격 피드백 1차 (2026-10-20)

H 인수에서 넘어온 화면 결함 4건 중 1~3을 원본 그대로 이식. 사망 연출(4)은 범위 밖 — §잔여.

## 1) 체력 피해 숫자 — 원본 추적

| 행 | 문장 | 구현 |
|---|---|---|
| 42386~42390 | hurtE dmg>0: `_quiet2`/비DOT/비회전참 게이트 → `G._dmgPeakShow={x:e.x,y:e.y,dmg,crit}` (dmg=쉴드 흡수 후 잔여, 기존 기록보다 클 때만) | 기존(P1-002.E) 실행자 G 쓰기 그대로 |
| 61848 | frame(): `_dtSp=1;_impPerFrame=0;_txtPerFrame=0` | state `apply_native_damage_peak_text_pump` 선두에서 카운터 리셋 |
| 61851~61868 | 단발뎀 텍스트: 화면 최대 1개(G._dmgTxts 게이트, 더 크면 교체·아니면 무시), `_life=50`, `addTxt(x, y-40, (crit?'💀':'⚔')+dmg, crit?'#dd2200':'#ffcc33', crit?70:50, crit?72:56, String(dmg))`, peakShow=null | 같은 메서드 — emit 요청 1건 반환, main이 기존 NativeFloatingText로 방출 |
| 61869 | `G._dmgTxts[i].t--` 수명·압축 | 같은 메서드 말미 |
| 44520(분기)·55309 | sz≥28+numStr → 숫자 아틀라스만 렌더(접두 글리프 미표시), 색 행: #dd2200→크림슨, #66ddff→파랑, 그 외(#ffcc33 포함)→화이트 | 기존 floating_text/number_atlas 포트 그대로 — **일반 피해 숫자는 원본에서도 화이트 행** |
- 펌프 호출 지점: main `_physics_process` 선두(이 tick 전투 전) — 원본 frame() 펌프→update() 순서와 동일 위상. 쉴드 흡수 숫자(42350, #66ddff)와 공존 방식 변화 없음.

### 「붉은 숫자 위쪽 잘림」 원인 (H 인수 지적)
숫자 아틀라스 bake(원본 44482~44502)는 48×56 셀에 44px 글리프를 top+6에 그리며
글로우(shadowBlur 12)·외곽선(±3)이 **셀 경계 밖으로 번지고, 원본에 per-cell clip이 없다**
(포트 number_atlas/producer.gd 헤더에 동일 사실 명시). 크림슨 행(row1)의 아래 번짐이
파랑 행(row2) 셀 상단 밴드에 남고, 쉴드 숫자(파랑)를 샘플링하면 그 밴드가 함께 그려져
**"윗부분 잘린 빨간 숫자"처럼 보이는 띠**가 숫자 위에 나타난다. 이는 **원본 웹판과 동일한
소스 산물**(drawNumStr도 같은 48×56 셀 샘플)이며 포트 결함이 아니다 — 개선(셀 클립/패딩
샘플)은 원본 수정과 함께가 아니면 하지 않음(§잔여).

## 2) 적 체력/쉴드 바 — 원본 추적

drawEn 53961~53969 (일반 적 — `_nameTopOff`는 보스 드루이드 경로 10938/10966 전용이라
일반 적은 undefined → 폴백):
- `bw=e.r*2+6, bx=e.x-bw/2, by=e.y-e.r-16`
- 표시 조건: `e.hp<e.mhp || (e.eShieldMax||0)>0 && e.eShield<e.eShieldMax` (**풀피+풀쉴드는 숨김**)
- 배경 rgba(0,0,0,.6) 4px → HP `#cc0000`×(hp/mhp) → 쉴드 `#44aaff`×min(1,eShield/eShieldMax) 덮어그리기 → by-=5
- 그로기(53966): stunned>0 → 배경 rgba(0,0,0,.5) 3px, `#ff8800`×min(1,stunned/_grMax), `_grMax=e._maxStunned||(ib?180:90)`, by-=4
- 프리즌/빙결바(53968): `_frozen`/`_freezeGauge` 시스템 미이식 → 비활성(§잔여)

구현: `godot/scripts/native_enemy_bar_layout.gd`(순수 계산) + generic enemy.gd·전용 4종
_draw 교체. **이전 Godot 바(-48~+48 고정 96px, draw_height/2+14 오프셋, 상시 표시,
어두운 적갈 HP색)는 전부 원본식으로 대체** — H 지적 "바가 본체에서 멀리 떠 있음" 해소.
_maxStunned 읽기: flesh=자체 presence 필드, 그 외=native_final 북키핑(P1-002.G).

## 3) 히트스톱·셰이크 — 원본 추적

| 행 | 문장 | 구현 |
|---|---|---|
| **32585** | `G.hitStop=0; // 히트스톱 완전 비활성 (디아블로/POE 스타일)` — **원본이 update마다 무조건 0** | state `apply_native_update_feel_decay`가 32584~32586 그대로(= 히트스톱은 켜지 않는 것이 원본). source_update_clock_prefix(candidate)의 phase_hitstop과 동일 행 모델 — ENGINE 통합 시 이 펌프가 그 phase로 대체될 수 있음(비충돌) |
| 32584 | `G._noHitStopT>0 → hitStop=0;slowMo=0;_noHitStopT-=sp` | 〃 |
| 35751 | `G.shake*=.86**sp; <.3→0` | 〃 (sp=dt_sp, main이 tick마다 deferred 호출 — 원본 '타격 쓰기 후 감쇠' 순서) |
| 19924 | `shake(n): G.shake=max(G.shake, n*OPT.shake/100)` (OPT.shake 기본 80) | state 피드 쓰기 공통식 |
| 42397/42398/42416 | hurtE dmg>0: `_txtPerFrame++`, `_overBudget=_txtPerFrame>12`(25413), 비초과 시 `hitStop=max(,5)`(비활성 소비)·`shake(min(4,12-_impPerFrame))` — 임팩트 미이식이라 _impPerFrame=0 → shake(4)=3.2 | 실행자 → main `apply_native_hurte_hit_feel` → state. 42399~42411 피 파티클·42415 화면 플래시·42417~19 임팩트는 미이식 유지 |
| 19838~19840 | updateCrescents 적중마다: step3 → `hitStop=max(,6)`+`shake(8)`(=6.4), 그 외 `hitStop=max(,3)` | crescent → main `apply_native_crescent_hit_feel` |
| 51752 | 렌더: `sx/sy=(rand-.5)*G.shake*2` 카메라 오프셋 | main `_process` → camera.offset (시각 전용 RNG) |
| 37631 | hitArc `G.hitStop=~~(_HS.melee*OPT.hitStop/100)` — OPT.hitStop 기본 **0** → 항상 0 대입 | 효과 0 + 소비자 비활성 → 미이식 기록만 |

## 변경 파일
native_enemy_bar_layout.gd(신규) / enemy.gd·전용 4종(_draw 바 교체) /
native_source_new_run_state.gd(펌프·피드 owner 4종 + 프레임 카운터) /
main.gd(펌프·감쇠 배선, OPT.shake 읽기, 카메라 셰이크 소비자, 실행자·crescent용 피드 API) /
native_normal_enemy_hurte.gd(42397/42398/42416 피드 호출) / crescent.gd(19838 피드 호출) /
godot/tests/test_p2001a_hit_feedback.gd(신규).

## 검증 (2026-10-20, 원로그 scratchpad\p2-001a\)
- test_p2001a_hit_feedback (격리 EXODUSER-P2001A-Isolated-20261020): **31/0 PASS** —
  ① 바 레이아웃 순수 대조(숨김 조건·rect/색/폭/오프셋·그로기 폴백 90) ② 펌프 규칙
  owner 단위(일반/더 작음 무시/더 큰 크리 교체·인자 50/56/#ffcc33·70/72/#dd2200,
  crescent step3 6.4, 감쇠 ×0.86·0.3 스냅, hitStop 상시 0) ③ 실전 Main 부팅(기본 근접
  쉴드 파괴→HP 피해 숫자 어댑터 풀 검증·셰이크 (0,3.2]·무타격 60틱 후 0·바 전환).
  결정성: ①②는 RNG 무관 순수 계산, ③은 크리 여부를 실제 outcome에서 유도 — 1회로
  충분하나 2회 실행(초기 1회는 테스트 자체의 float32 비교 결함 수정 전) 모두 동일 결론.
- 회귀: p1002e 102/0 · p1002f 313/0 · p1002g 214/0 · contracts 5/0 — 전부 변경 전과 동일.
- 화면(1920×1080 실제 창, 대상 좌표 크롭·가시 확인): 풀피 바 숨김 → 피해 후 본체 바로
  위(-r-16) 바 표시(쉴드 파랑이 HP 빨강을 덮는 원본 구조), 화이트 피해 숫자 84(흡수
  파랑 137/53과 공존), 크림슨 72/화이트 56 합성 주입 비교, 그로기 주황 3px(연출 세팅 —
  스타터 수치에선 그로기=즉사라 라이브 포착 불가, 원본도 동일 산술).

## 잔여 (범위 밖 — 목록만)
1. 사망 연출(deathFX·시체·고어 시각) — P2-001 후속.
2. 화면 플래시(G._flashCol/_flashT, 42415)·피 파티클(42399~42411)·임팩트(_addImpact)·
   _impPerFrame 실카운트 — 임팩트 시스템 이식 시 함께.
3. 프리즌/빙결 바(53968) — _frozen 시스템 미이식.
4. 숫자 아틀라스 행간 글로우 번짐(위 §원인) — 원본 동일 산물, 개선은 원본과 동시 결정 필요.
5. 슬로모(G.slowMo) 소비자 — 미이식 유지(기록만).
