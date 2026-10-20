# P2-001f — 처치 피 폭발·핏자국 대조 결함(P2-001d ③) 원인·수정 (2026-10-20)

## 결론 (원인 2건, 모두 수정)

P2-001d가 본 "Godot 피 폭발이 웹보다 1.5~2배 크고 밝다 / 1초 후 핏자국 형태가 다르다"의
실원인은 **스프라이트·수식 차이가 아니라 클록·블렌드 소스 차이** 2건이다.

### 원인 1 — death_blood 프레임 클록 (주원인)
| 항목 | 원본(웹) | Godot(수정 전) | Godot(수정 후) |
|---|---|---|---|
| 전진 위치 | 렌더 루프 54581~54582 `v.t+=_dtSp` | `_physics_process`(60Hz) `t+=sp` | `_process`(렌더 프레임) `t+=1.0` |
| _dtSp 값 | **렌더 프레임당 상시 1** (61849; 히트스톱 0.04는 32585 비활성) | 60Hz 틱당 1 | 렌더 프레임당 1 |
| 실측 16프레임 완주 | **≈0.34s** (~186fps 렌더, kill+86ms에 frame 4) | 1.07s (3.1× 느림) | 렌더 fps 종속 — 원본과 동일 규칙 |

- 웹 실측(이 PC, Playwright Chrome, WebGL2): kill+86ms frame4 / kill+798ms 애님 종료.
  같은 프레임에 스테인 t 534→343(60/s), DI life 0.92→0.36(0.8/s) — **스테인·시체·고어·DI는
  60Hz 고정 클록, _vfxAnims(death_blood)만 렌더 프레임 클록**임을 실측으로 분리 확인.
- 결함 기전: 60Hz로 3.1× 느리게 재생 → 처치 순간엔 아직 초반 고밀도 프레임(크고 밝고 채도
  높게 보임), +1s엔 웹에선 이미 사라진 애님의 후반 잔가지 프레임(Blood_FBF f12~15)이 남아
  "불규칙 얼룩 3~4개"로 보였다(P2-001d ③의 두 증상 모두 이 한 원인).

### 원인 2 — 데드 임팩트(blood_impact_2/3/4) 블렌드
| 항목 | 원본(웹) 실동작 | Godot(수정 전) | Godot(수정 후) |
|---|---|---|---|
| 코드 표기 | 54567 `globalCompositeOperation='lighter'` | BLEND_MODE_ADD 캔버스 | 일반(normal) 캔버스 |
| 실제 블렌드 | **normal** — GPU/GL 프록시 X의 setter는 no-op(6028), 실블렌드는 `_setBlend`로만 바뀌며 이 구간은 마지막 `_setBlend(false)`(53689) 이후 | additive | normal |
| 체감 | 어두운 핏빛이 서서히(알파 0→1) 배어드는 얼룩 | 밝은 적색 글로우 | 웹과 동일 |

### 오해 정리 (P2-001b 문서 정정 포함)
- `death_blood` 등록(19679)의 blend는 `'source-over'`지만, 실전 경로는 **VFX GL 인스턴싱**
  (5193 `_queueVfxGL`/5211 `_flushVfxGL`, blendFunc SRC_ALPHA,ONE = additive)이다.
  셰이더가 rgb·a 모두에 vAlpha를 곱하고 알파는 **[0,1] 클램프**(5202) → baseAlpha 1.5는
  전 프레임에서 사실상 1.0. 기여식 = tex.rgb×tex.a — Godot ADD(=src.rgb×src.a×mod.a,
  mod.a=1)와 **동형**이라 blood 애님의 additive 캔버스는 유지(변경 없음).
- 히트 임팩트(54736)·wwSlash도 `_queueVfxGL` additive → Godot additive 유지가 맞다.
- P2-001d 웹 캡처의 "+1s 대형 원형 반투명 데칼 ~300px"은 **사망 연출 소속이 아님**:
  단독 처치 실측(hurtE 직접 트리거) 결과 +1s에 남는 것은 스테인(sz≈30)+시체(63px)뿐이고
  300px급 데칼을 그리는 사망 시스템이 없다(DI maxSz=r×3=65px). 당시 전투의 비사망 요소
  (그로기 직후 무기 프록 '진월 충격파' 등 crescent 계열로 추정 — wt-p2e 소유)로 판단.

## 변경 파일
- `godot/scripts/native_death_fx_adapter.gd` — ① `_blood_anims` 전진을 `_physics_process`
  에서 `_process`(렌더 프레임당 +1.0)로 이동 ② DI 렌더를 additive 드로어에서 normal
  드로어(`_draw_air` 말미, 웹 순서 54562 고어→54568 DI 유지)로 이동 ③ 근거 주석 갱신.
  수치·공식·색·수명은 전부 불변.
- `godot/tests/visual_p2001f_capture.gd` — 시각 검수 하니스(실창 1920×1080, 격리 userdir,
  blood 프레임 위상 동기 캡처). 판정용 도구, 게임 코드 아님.

## 검증 (원로그 scratchpad\p2-001f\)
- test_p2001b_death_fx 40/0 · test_p1002f_dedicated_hurte 317/0 · test_contracts 5/0
  (격리 userdir 각각, logs_final\).
- 웹 실측: webkill\dump.json(백엔드 useGL/vfxGLMode true·프레임/수명 타임라인),
  probe_backend.mjs(등록 blend 'source-over'·_deathBloodScale(22.6)=2.045).
- 화면 대조(같은 배율 1x, 500px 크롭, 대상 가시 확인): cmp_p2f_1_bloodframe4.png
  (blood f4, 웹 r21.7 vs Godot r22.1 — 크기·형상 정합), cmp_p2f_2_blooddone_di.png
  (애님 종료+DI 0.36 — 어두운 얼룩 정합), cmp_p2f_3_stain_corpse.png(스테인+시체만).
- 하니스 환경 주의: 캡처 PC의 Godot 실창 fps≈32라 wall-clock 대신 **위상(blood frame)
  동기**로 대조함. 렌더 프레임 클록 자체가 원본 규칙이므로 fps가 같으면 시간도 같다.

## 잔여
1. 처치 순간 중심 백색/적색 코어의 체감 밝기 미세 차이 — 바닥 밝기(맵 렌더)·주변
   요소 차이 영향, blood 자체는 프레임 단위 정합. 필요시 맵 톤 트랙에서 재평가.
2. 홀리 버스트(19178 renderHitVFX)의 'lighter'도 프록시 no-op이라 웹 실블렌드가 호출
   시점의 _setBlend 상태에 종속 — 백색 α0.45 저임팩트라 Godot additive 유지, 미세 차이
   가능(목록만).
3. P2-001d의 "+1s 대형 원형 데칼" 재현·귀속은 crescent/그로기 트랙(wt-p2e 소유)에서.
