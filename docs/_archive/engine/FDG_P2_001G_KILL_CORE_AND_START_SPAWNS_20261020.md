# P2-001g — 처치 중심 과노출 코어(결함 A)·시작 적 배치(결함 ④/B) (2026-10-20)

## A. 처치 중심 주황/노랑 코어 — 원인 2건, 수정 완료

cmp_p2f_1에서 Godot 처치 중심이 주황·노랑으로 과노출된 실원인(레이어 특정 — 분석+실측):

| # | 레이어 | 원본(웹) 실동작 | Godot(수정 전) | 수정 |
|---|---|---|---|---|
| 1 | 히트 임팩트(_impacts) 시트 | `_impactSpriteFor`(18871): 비보스 el0 'slash'는 **impact_el0_sheet.png(회백 성광, 765×85 9f)**. impact_basic(황금)은 "로드 실패만" 폴백(18870 주석, 로더 18862~18869) | impact_basic(황금 1152×128)로 102~180px 황금 성광 — **노랑 코어 주범** | el0 시트 복사·사용(폴백=basic 유지) |
| 2 | 홀리 버스트(_hitVfx) 블렌드 | renderHitVFX(19184) `'lighter'`는 GPU/GL 프록시 X에서 **no-op**(6028) → 호출 시점 54772(마지막 `_setBlend(false)` 53689 이후)의 실블렌드 = **normal** | additive 캔버스에서 황금 51px 가산 → 코어 가중 | normal 드로어로 이동(시트·scale .4·α.45·회전 유지) |
| — | 히트 임팩트 블렌드 | `_queueVfxGL`(54757)→`_flushVfxGL`(5211) SRC_ALPHA,ONE = **additive** | additive ✓ | 유지 |
| — | 대형 사망 버스트 16발(#ffaa66/#ffd9aa, 25401~25409)·addParts | poolRender(19869, 54498 호출)는 마지막 _setBlend(false) 이후 = normal, 식 동일 | normal ✓ 식 동일 | 무변경 |

실측(처치 중심 R<80, blood frame4 위상 동기, 원로그 G:\exoduser-wt\_out\p2-001g\):
| | warm(황/주황 px) | bright(합>480 px) | mean R |
|---|---|---|---|
| 웹 k0 | 364 | 109 | 56.0 (바닥 25.5) |
| Godot 수정 전(p2-001f 캡처) | 1038 | **1411** | 112.8 (바닥 52.9) |
| Godot 수정 후 | 838 | **306** | 102.8 |

bright 1411→306(웹 109). 잔여 차이의 주성분은 **바닥 자체 밝기**(웹 25.5 vs Godot 52.9 —
맵 렌더 톤, 맵 담당 SSOT 소관)와 저fps 하니스의 파티클 위상 차이. FX 식·시트·블렌드는
원본 행 단위로 일치.

### 변경 파일
- `godot/scripts/native_death_fx_adapter.gd` — `_impact_el0_sheet` 로드(폴백 basic),
  _impacts 렌더 시트 교체, 홀리 버스트를 normal 드로어(_draw_air 말미)로 이동, 스냅샷에
  impact_el0_sheet 노출. 수치·공식 불변.
- `godot/assets/vfx/impact_el0_sheet.png`(+.import) — 원본 파일 그대로 복사.
- `godot/tests/visual_p2001g_capture.gd` — 검수 하니스(출력 G:\exoduser-wt\_out\p2-001g\).

### 검증
- test_p2001b_death_fx **44/0** · test_p1002f **317/0** · test_p1002e **91/0** ·
  test_contracts **5/0** · test_encounter_factory **실패 3 = 기준선 유지(증가 없음)**.
- 화면: `G:\exoduser-wt\_out\p2-001g\cmp_p2g_A_bloodframe4.png` (같은 배율 1x, blood f4
  위상 동기, 대상 좌표 크롭·가시 확인) — 황금 성광 코어 소멸, 중심 구성 웹과 동질.

## B. 시작 적 배치(웹 대조 결함 ④) — 원본 규칙 문서화 + 경계 보고 (코드 무변경)

### 원본 규칙 (행 근거 + 실측)
1. **인트로 커튼 5마리 링** — `_openIntroCurtain()` 63411~63441:
   - 63417~63420: tileRLE 맵(1-1)은 room/corridor 자동 스폰 안 함("소환굴만").
   - 63422~63423: 시작점 500px 내 몹 제거.
   - 63425~63432: **반경 `_iR=580`, 각 `2πi/5 − π/2`(위에서 시작, 72° 간격) 오각 링에
     `mkEn(ex,ey,0,0,false,EL.P,-1)` — etype 0(눈알 육괴)·물리 5마리**.
   - 63433: `G._bonfire={t:300,r:280}` 재설정.
   - 실측(Playwright, 레슨 스킵 직후): 5마리 d 410~513·각도 −90/−19/52/125/199° — 링에서
     스폰 후 즉시 플레이어 쪽 보행(5초에 d≈6~40까지 접근). 원로그
     scratchpad\p2-001f\probe_spawn2 출력.
2. **2× 체력 개체** — 결정 규칙이 아니라 `mkEn`(31120~)의 `rollElite`(31063, live
   Math.random) 결과. hell0 확률 `ELITE_PROB[0]=[.03,0,0]` → 3% 매직(tier1):
   `ELITE_TIERS`(31033) hpMul 2·atkMul 1.3·scaleMul 1.08. P2-001d의 1751=875×2 매직 엘리트
   (r 24.6=기본×1.08 부합). 5마리 중 1마리 보장 규칙은 **없음**(순수 확률).
3. **다안 육괴 2마리** — `_spawnCh1StartMediumEyeMasses`(31517~31531): 시작점 타일
   (±13,−18/−21), etype 4, EL.D — d 888/988px. **이미 Godot encounters.json에 캡처됨**
   (ch1_start_eye_mass_01/02 — "최근접 888px"의 정체).
4. 소환굴 **14개**(고정 좌표, d 1224~ — P3-002 원본 initStage 실측으로 정정, 구 표기 12)는 2000px 접근 트리거로 후속 스폰 — [P3-002](FDG_P3_002_SPAWN_HOLES_20261020.md)에서 이식.

### 경계 (구현 보류 사유)
- Godot encounter 파이프라인은 **리터럴 레코드 단위 승인**: encounters.json은 원본을
  고정 시드(map 20261013/encounter 477069883, 214 draws)로 캡처한 산출물이고, factory는
  레코드 전필드·sha·rng_begin/end를 검증한다. `test_etype0_physical_flesh_crawler`가
  "다른 spawn_position도 거부"를 명시 가드(121~126) — 광역 etype0 스폰 확장은 설계상 금지.
- 커튼 5링은 원본에서 **initStage가 아니라 커튼 오픈 시점의 live RNG**로 생성되므로,
  기존 캡처 체인(rng 0~214)에 "원본 값 그대로"를 이어 붙이려면 **원 캡처 도구**(소스:
  /Users/fordeargamers/Projects/exoduser-migration-20261001, encounters.json source 메타)로
  재캡처하거나, 총괄 승인 하에 intro-curtain-five 섹션 규약(별도 rng 구간)을 신설해야 함.
- 따라서 P2-001g에서는 규칙 문서화 + 현상 증거까지:
  `G:\exoduser-wt\_out\p2-001g\cmp_p2g_B_boot.png` — 웹 부팅엔 적 가시(링 접근 중),
  Godot 부팅엔 화면 내 적 0(최근접 (−520,−720)→화면 y−180 밖).
