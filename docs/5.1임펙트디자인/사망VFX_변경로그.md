# 사망 VFX 변경 로그

## 2026-08-29 — 몬스터 반지름 비례 사망 혈흔 폭발

### 변경 요약
- 일반 몬스터 반지름이 주로 `8~18`인데 기존 데드 임팩트가 `clamp(r×2.2, 40, 120)`의 최솟값 40에 묶여 대부분 같은 크기로 보이던 문제를 수정.
- `blood_impact_2/3/4` 데드 임팩트와 `death_blood` 시트 애니메이션을 모두 몬스터 원본 반지름 `r`에 따른 연속 공식으로 통일했다. 보스 여부는 재생 속도에만 남고 크기를 강제로 고정하지 않는다.
- 독립 필드몹 `_fmDeathFx`도 축소 반지름 `min(32,r×0.28)` 대신 원본 `r`을 `_addDeathImpact`에 전달한다.

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 예시 수치 | 적용 위치 |
|---|---|---|---|---|
| `deathBloodScale` | 사망 피 애니메이션 배율 | `clamp(0.35+r×0.075, 0.8, 4.8)` | r 8/12/18/30/56/120 → 0.95/1.25/1.70/2.60/4.55/4.80 | `_deathBloodScale` → `deathFX` |
| `deathImpactSize` | 혈흔 폭발 최대 크기 | `clamp(r×3, 24, 240)` | r 8/12/18/30/56/120 → 24/36/54/90/168/240px | `_deathImpactSize` → `_addDeathImpact` |
| `deathImpactRadiusSource` | 크기 기준 반지름 | 사망한 몬스터의 원본 `r` | 일반몹·챕터보스·앵글러·뱀장어 동일 | 공용 사망 블록 / `_fmDeathFx` |
| `deathImpactAssets` | 랜덤 혈흔 시트 | `blood_impact_2/3/4` | 3종 랜덤, 공식은 공통 | `_DI_NAMES` |
| `deathImpactCap` | 동시 슬롯 상한 | `_DI_MAX=12`, LRU 교체 | 최대 12개 | `_diPool` |

### 회귀
- `test/deathFxSizeScaling.test.js`: r 8→120에서 두 크기 함수가 연속 증가하고 상한을 지키는지, `deathFX`/`_addDeathImpact`/`_fmDeathFx` 연결이 원본 반지름을 쓰는지 검증.

## 2026-08-23 — 머리 조각(대가리) 날림 부활 (중형+/보스 한정)

### 배경
- 유저 리포트: "시체 날아가는 연출 아예 없어졌나?" → 조사 결과 통짜 시체(`_addCorpse`)는 살아있으나 속도 max 5·마찰 0.85로 ~33px만 미끄러져 사라진 듯 보임. 부위 조각(`_addGibs`)은 성능이 아니라 **"고어 대체" 명목으로 호출부 주석 처리**되어 비활성(이 문서 아래 "필드몹 사망 gib" §, `_addGibs`는 공용 사망에서도 미사용).
- 유저 요청: "다른 부위는 다 빼도 **대가리 정도는 날아가는** 게 좋겠다." → 적용 범위 = **중형+/보스만** (유저 선택).

### 변경 요약
- 신규 `_addHeadGib(e,killAng,power)` — 스프라이트 상단-중앙부 1조각(머리)을 처치 방향으로 **포물선 비행**시킴. 목 절단면 붉은 피 + 절단부 피 파티클 6개 분사.
- **gib 풀(`_gibs`) 재사용** → 중력(`vy+=.15`)·감속·스핀 물리 공유, 별도 렌더 경로 없음. `_fOverBudget` 가드 + 뷰포트 컬 + 프레임당 10개 렌더 캡을 그대로 상속.
- **정규 진입점 `_addCorpse` 끝에서 1회 호출** → 모든 사망 지점(공용 death 블록, 소환굴 킬, etype 강제사망 등) 자동 커버. `_isLarge` 게이트는 `_addHeadGib` 내부.
- 통짜 시체(`_addCorpse`)와 **병행** — 시체는 스프라이트 전체(머리 포함), 머리 조각은 별도로 튀어나감(고어 연출상 허용).
- 성능: 프레임당 `_headGibThrottle` 최대 3, `!OPT.deathFx` 시 비활성(품질 '최저'/tier C 자동 OFF).

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `headGibGate` | 발동 대상 | `e.ib \|\| e.r>=18 \|\| e.mhp>=220` | 중형+/보스만 | `_addHeadGib` 초입 |
| `headGibThrottle` | 프레임당 상한 | `_headGibThrottle>2 → return` | 최대 3 | 프레임말 `=0` 리셋 |
| `headGibCrop` | 머리 크롭 | 48px 캡처 중 `x[10..38] y[2..30]` → 24×24 확대 | 상단-중앙 | `g.ctx.drawImage(_gibC,...)` |
| `headGibSpd` | 비행 속도 | `(3.8+min(3,power*.5))×(ib?1.25:1)` | power=사망배율 | `_addHeadGib` |
| `headGibVx` | 수평 속도 | `cos(a)×spd×0.9 ±0.6` | 처치방향 우세 | `g.vx` |
| `headGibVy` | 수직 초속 | `sin(a)×spd×0.4 − (2.8~4.6)` | 위로 튀어 포물선 | `g.vy` |
| `headGibSz` | 렌더 크기 | `clamp(e.r×(ib?0.58:0.85), 15, 30)` | gib 렌더 `gs*2*sc` | `g.sz` |
| `headGibLife` | 수명 | `200~270` 프레임 | 아크 후 페이드 | `g.life/g.ml` |

### 비고
- `_addGibs`(부위 다분할 폭발)는 여전히 비활성 유지 — 이번 변경은 "머리 1조각"만 부활.
- 캡처 디스패치는 `_addCorpse`/`_addGibs`와 동일(필드몹 `_fmDrawSpriteTo` / 보스 `_bossDirAtlas`·`_bossWalkAtlas` / 일반 `_ch8Atlas` 8dir / 폴백 원).
- gib 풀은 바닥 안착 물리가 없어 아크 후 계속 하강 → `life` 200~270으로 짧게 잡아 화면 밖 질주 전에 페이드.

## 2026-08-23 — 핏자국 복원 (과한 장판만 금지, 자국 자체는 전원)

### 변경 요약
- 거대 `scarlet_splat_2` 웅덩이가 과하다고 해서 **잡몹 핏자국을 통째로 지우고** 대형도 9~17px α0.18로 사실상 안 보이게 한 과보정 수정.
- **모든 사망이 핏자국.** `_leaveFloorTrace=!!e`. `_addStain`의 `if(!large)return` 제거.
- 과한 건 반경: 잡몹 `clamp(r×1.4, 14, 36)`, 보스/앵글러 `clamp(r×0.5, 36, 56)`. 구 ib `r×1.5`(앵글러 180) 장판 금지. `scarlet_splat_2` 스프라이트 웅덩이는 그대로 없음.
- 알파 외곽 **0.42** / 속 **0.30**. 슬롯 **30**. persist 맵 전환까지.
- 바닥 살점 1개는 대형만(`ib`/`_fmKind`/`r>=40`). 핏자국과 분리.

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `leaveFloorTrace` | 바닥 잔류 대상 | 모든 사망 | `_leaveFloorTrace=!!e` | `_addFloorTrace` / `_addCorpse` |
| `stainRNormal` | 잡몹·뱀장어 핏자국 | `clamp(r×1.4, 14, 36)` | r=12 → **16.8**, 뱀장어 r=56 → **36** | `_stainRadius` |
| `stainRBoss` | 보스·앵글러 핏자국 | `clamp(r×0.5, 36, 56)` | 앵글러 r=120 → **56**. 구 180 장판 금지 | `_stainRadius` |
| `stainLife` | 수명 | persist | 맵 전환까지 | `_addStain` `s.persist` |
| `stainAlpha` | 불투명 | 외곽 0.42 / 속 0.30 | 구 과보정 0.26/0.18은 안 보임 | 렌더 |
| `stainCap` | 슬롯 | `_STAIN_MAX=30` | LRU | `_addStain` |
| `floorGoreN` | 살조각 | 대형만 1 | `ib \|\| _fmKind \|\| r>=40`. flesh만 | `_addFloorTrace` |

### 비고
- `scarlet_splat_2` / `_poolSplatImg` 장판 렌더는 복원하지 않음.
- 회귀: `test/fieldMobDeathFx.test.js` — 전원 핏자국, 반경 캡, `!large` 가드 없음.

## 2026-08-23 — 대형몹 바닥 잔류 (작은 핏자국+살조각, 맵 전환까지)

> **같은 날 후속 수정으로 대체됨.** 이 항목의 "소형몹은 자국 없음 / 반경 9~17"은 과보정. 현재값은 위 섹션.

### 변경 요약
- 큰 `scarlet_splat_2` 웅덩이(반경 100~336, alpha 0.8)가 1-1 같은 작은 맵을 온통 붉게 덮었다. 일반몹 `r>=18`/`mhp>=220`까지 웅덩이를 남겨 학살 후 바닥이 더러워졌다.
- (당시) 소형몹 자국 제거, 대형만 9~17px. **과보정 — 후속 섹션에서 전원 복원.**
- 남기는 것: 아주 작은 핏자국 + 살점 1개. 시체 팬케이크·눈알·blood_splat 장판 없음.
- **맵을 나갈 때까지 유지.** 15~60초에 사라지면 누가 치운 것처럼 보임. `_clearDeathDecals`는 스테이지 전환·아레나 입장만.

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `leaveFloorTrace` | 바닥 잔류 대상 | `ib \|\| _fmKind \|\| r>=40` | 앵글러·뱀장어·챕터보스. 일반잡몹 제외 | `_leaveFloorTrace` |
| `stainRLarge` | 대형 핏자국 | (당시) `clamp(r*0.16, 9, 14)` | 뱀장어 **9**. 현재 36 | `_stainRadius` |
| `stainRBoss` | 보스 핏자국 | (당시) `clamp(r*0.14, 12, 18)` | 앵글러 **17**. 현재 56 | `_stainRadius` |
| `stainLife` | 수명 | persist | 맵 전환까지 | `_addStain` `s.persist` |
| `stainAlpha` | 불투명 | (당시) 외곽 0.26 / 속 0.18 | 현재 0.42/0.30 | 렌더 |
| `stainCap` | 슬롯 | (당시) `_STAIN_MAX=16` | 현재 30 | `_addStain` |
| `floorGoreN` | 살조각 | 1 | flesh만. blood_splat은 장판처럼 보여 제외 | `_addFloorTrace` |
| `fmCorpseSz` | 필드 시체 | fb `clamp(r*.55,52,72)` / wm `clamp(r*.75,32,48)` | 앵글러 **66**, 뱀장어 **42**. 수명 220f. 눈알 오버레이 없음 | `_addCorpse` `_fmKind` |
| `deathImpactCap` | 혈흔 폭발 상한 | (당시) `clamp(r*2.2, 40, 120)` | 현재 `clamp(r×3,24,240)` | `_addDeathImpact` |
| `floorGoreLife` | 살조각 수명 | persist, 납작 `scale(1,.52)` | 맵 전환까지 | gore `g.ground` |
| `stainClear` | 제거 | `initStage`, 보스 아레나 입장 | 자국+시체+바닥고어 | `_clearDeathDecals` |

### 호출
| 경로 | 동작 |
|---|---|
| `_addCorpse` | `_addFloorTrace(e)` — (당시) 대형만. 현재는 전원 |
| `_fmDeathFx` | `_addCorpse` 경유. fake에 `_fmKind` |
| 기동불꽃 일괄폭발 사망 | `_addFloorTrace(e)` |

### 비고
- `_isLargeMob`(r>=18 / mhp>=220)는 사망 파티클용. 바닥 잔류와 분리.
- `scarlet_splat_2` 웅덩이 렌더 제거.
- 맵 함정 `pit_blood_a/b`와 별개(함정은 비활성).
- `OPT.deathFx=false`면 잔류 없음.

## 2026-08-23 — 독립 필드몹(앵글러/뱀장어) 시체+고어 사망 키트

### 변경 요약
- 심연의 앵글러·지상뱀장어는 `ens`/`hurtE` 밖이라 처치 시 `_spawnLargeMonsterDeathFx` 파티클만 나왔다.
- 공용 사망 키트(`deathFX` + `_addCorpse` + `_addGorePiece` + `_addDeathImpact` + 대형 파티클)를 `_fmDeathFx`로 묶었다.
- 시체 이미지는 보스/8dir 아틀라스가 아니라 `_fbSheet`(셀300)·`_wmSheet`(셀150) 현재 프레임을 128×128에 캡처. `_addCorpse`가 `e._fmKind`를 보스 아틀라스보다 먼저 본다 (ib 폴백이 스테이지 보스를 그리는 사고 방지).
- `_deathFxDone` 가드로 `_fmApply`와 `_fbTick`/`_wmTick` 백업이 이중 발동하지 않음.

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `fmDeathFx` | 필드몹 사망 키트 | HP≤0, `_deathFxDone` 1회 | 앵글러·뱀장어 | `_fmDeathFx(m,isFb,dmg)` |
| `fmCorpseSrc` | 시체 스프라이트 캡처 | `e._fmKind==='fb'\|'wm'` | fb 300px 셀 / wm 150px 셀 | `_addCorpse` → `_fmDrawSpriteTo` |
| `fmCorpseSzFb` | 앵글러 시체 크기 | `max(80, r*2.5)` | r=120 → **300** | `_addCorpse` `c.sz` |
| `fmCorpseSzWm` | 뱀장어 시체 크기 | `min(200, r*2.2)` | r=56 → **123** | `_addCorpse` `c.sz` |
| `fmCorpsePower` | 시체 비행 파워 | `min(8, max(isFb?5:2, dmg/mhp*20))` | 앵글러 최소 5 → spd 5 | `_addCorpse` `spd=min(5,1.5+power*.8)` |
| `fmCorpseLife` | 시체 수명 | ib?600:420 | 앵글러 600 / 뱀장어 420 | `_addCorpse` `c.mt` |
| `fmStainR` | 바닥 잔류 | 핏자국 + 대형만 살점 1 | 앵글러 자국 **56** / 뱀장어 **36**. 맵 전환까지. 거대 시체팬케이크·눈알 없음 | `_addFloorTrace` |
| `fmGoreN` | 고어 파편 수 | 공통 2 + 앵글러 추가 3 | 앵글러 **5**, 뱀장어 **2** | `_addGorePiece` |
| `fmGoreFling` | 카메라 플링 | 기존 30%, 프레임당 최대 5 | 30% | `_addGorePiece` |
| `fmDeathImpact` | 혈흔 폭발 | (당시) `maxSz=r*4` | 현재 앵글러 **240** / 뱀장어 **168** | `_addDeathImpact` |
| `fmDeathBlood` | death_blood 스케일 | (당시) `isBoss?3.6:(r>20?2.1:…)` | 현재 앵글러 **4.8** / 뱀장어 **4.55** | `deathFX` → `playVFXAng('death_blood')` |
| `fmDeathShake` | 사망 셰이크 | 체급 분기 | 앵글러 18 / 뱀장어 8 | `shake` |
| `fmDeathFlash` | 앵글러 플래시 | 필드보스만 | `_flashT=4` `#66ddff`, `_chromaT=3` | `_fmDeathFx` |

### 호출 경로
| 경로 | 조건 | 비고 |
|---|---|---|
| `_fmApply` | `_hurtFieldMobs` 실피격 HP≤0 | 주 경로. 앵글러는 이어서 배너+`G._fbDone` |
| `_fbTick` | `fb.hp<=0` 백업 | `_deathFxDone`면 VFX 스킵. `G._fbDone`면 배너 스킵 |
| `_wmTick` | `w.hp<=0` 백업 | `_deathFxDone`면 VFX 스킵 후 슬롯 null |

### 비고
- `_addGibs`는 공용 사망에서도 고어로 대체된 상태(주석 처리)라 필드몹에도 쓰지 않음.
- 시체 캡처 실패(시트 미로드) 시 `_addCorpse` 폴백 원(`e.col`) + 고어/혈흔은 그대로 재생.
- 데미지/HP 공식 변경 없음. 순수 연출.
- 회귀: `test/fieldMobDeathFx.test.js` — 키트 호출, `_fmKind` 캡처가 보스 아틀라스보다 앞, `_fmApply`/`_fbTick`/`_wmTick` 공유, 대형 피웅덩이 반경/수명/스프라이트.

## 2026-04-12 — 큰 몬스터 사망 이펙트 추가

### 변경 요약
- 공용 적 사망 처리 루틴에 `큰 몬스터 전용 사망 VFX`를 추가.
- 대상은 `보스` 또는 `큰 몬스터(반지름/체력 기준)`이며, 기존 `deathFX`/`시체`/`gib` 처리와 병행됨.
- 적용 파일: `game.html`, `game_current.html`, `Electron/game.html` (동일 로직).

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `largeDeathFxTarget` | 큰 몬스터 판정 | `e.ib || e.r >= 18 || e.mhp >= 220` | 보스 또는 대형몹 | `_spawnLargeMonsterDeathFx(e, ang)` |
| `largeDeathFxBoomR` | 사망 폭발 반경 | 미사용 (2026-04-13 제거) | 0 | 미호출 |
| `largeDeathFxBoomDur` | 사망 폭발 지속 | 미사용 (2026-04-13 제거) | 0f | 미호출 |
| `largeDeathFxBurstN` | 방사 파티클 수 | 보스/일반 분기 | 보스 26, 일반 16 | `for` 루프 방사 파티클 |
| `largeDeathFxVel` | 방사 속도 | 보스/일반 분기 + 랜덤 | 보스 `4.6 + rand*3.2`, 일반 `3.2 + rand*2.0` | `poolPart` |
| `largeDeathFxSize` | 파티클 크기 | 고정+랜덤 | `2.4 + rand*2.8` | `poolPart` |
| `largeDeathFxLife` | 파티클 수명 | 고정+랜덤 | `14 + rand*10` | `poolPart` |
| `largeDeathFxShake` | 카메라 흔들림 | 미사용 (2026-04-13 제거) | 0 | 미호출 |
| `largeDeathFxColor` | 색상 세트 | 보스/일반 분기 | 보스 `#ff5577/#ffccdd`, 일반 `#ffaa66/#ffd9aa` | `poolPart`, `addParts` |
| `largeCorpseGibSpawn` | 큰 몬스터 기본 시체 파편 | `e.ib || e.r >= 18 || e.mhp >= 220` AND `!_isBurnDeath` | 참이면 기본 gib 1회 생성 | 공용 적 사망 블록 (`_addGibs(e,e.x,e.y,max(70,e.r*3))`) |
| `largeCorpseGibSize` | 큰 몬스터 파편 렌더 크기 | `clamp(e.r*0.7, 14, 24)` | 최소 14, 최대 24 | `_addGibs`에서 `g.sz` 지정 후 gib 렌더 반영 |
| `corpseGibSplit` | 시체 파편 분할 수 | `e.ib ? 4 : (isLarge ? 3 : 2)` | 보스 4x4=16, 대형 3x3=9, 일반 2x2=4 | `_addGibs` 조각 생성 루프 |

### 사망 루틴 연결점

| id | 한글명 | 처리 순서 | 적용 위치 |
|---|---|---|---|
| `killAngShared` | 킬 각도 공용화 | `_killAng = ang ?? atan2(e.y-P.y, e.x-P.x)` 생성 후 재사용 | 공용 적 사망 블록 |
| `largeDeathFxHook` | 큰 몬스터 사망 VFX 호출 | `_isWhirlKill`이 아닐 때 `_spawnLargeMonsterDeathFx(e, _killAng)` | 공용 적 사망 블록 |
| `corpseReuseKillAng` | 시체 생성 각도 일치 | `_addCorpse(e, _killAng, _cp)`로 통일 | 공용 적 사망 블록 |

### 비고
- 기존 화염 사망(`_isBurnDeath`) 분기, gib 분기, 부활/보스 판정 로직은 유지.
- 2026-04-13: 회전참(`P.s==='whirlwind'`, 비기폭 처치) 킬에서는 `deathFX`만 유지하고 `largeDeathFx`는 호출하지 않음.
- 2026-04-13: `largeDeathFx`에서 폭발형 연출(`_addBoom`)과 사망 셰이크를 제거해, 큰 몬스터 사망이 폭발 임팩트처럼 보이지 않도록 조정.
- 2026-04-13: 큰 몬스터는 폭발 여부와 무관하게(화염 사망 제외) 기본적으로 큰 시체 파편(gib)을 생성하도록 변경. 기존 폭발/포이즈 기반 gib 분기와는 중복 생성되지 않게 `_didGib` 가드 적용.
- 2026-04-13: gib 분할 그리드를 보스/대형/일반으로 분리(4x4/3x3/2x2)하여 체급별 파편 개수를 명확히 차등화.
- 이번 변경은 연출 추가이며 기존 데미지 판정/사망 판정 공식은 변경하지 않음.

## 2026-04-25 — 화염 사망 VFX 스프라이트 시트 추가

### 변경 요약
- 화염/빔 사망(`_isBurnDeath`) 시 기존 프로시저럴 불타는 시체 이펙트에 추가로 **전용 VFX 스프라이트 시트 애니메이션**을 재생.
- Grok(xAI) 이미지 생성 API로 8프레임 불타죽는 시퀀스 생성 → 후처리(배경 제거, 바닥 타일 제거, 정사각형 프레임 정렬).

### 수치/공식 테이블

| id | 한글명 | 수치 | 적용 위치 |
|---|---|---|---|
| `burn_death` | 화염 사망 VFX | `registerVFX('burn_death', 'img/vfx_burn_death.png', 211, 211, 8, 8)` | VFX 시트 등록 |
| `burn_death_scale` | 스케일 공식 | `Math.max(0.15, e.r * 2.2 / 211)` — 몬스터 반지름 비례 | `playVFXAng` 호출 |
| `burn_death_speed` | 프레임 속도 | `4` (프레임당 4틱) | `playVFXAng` 호출 |
| `burn_death_offset` | Y 오프셋 | `e.y - e.r * 0.3` (몬스터 중심에서 약간 위) | `playVFXAng` 호출 |
| `burn_death_trigger` | 발동 조건 | `atkEl === EL.F` (화염 속성) 또는 `opts.beam` (빔) | `_isBurnDeath` 판정 |

### 에셋

| 파일 | 설명 |
|---|---|
| `img/vfx_burn_death.png` | 8프레임 가로 스트립 (2528×316 → 후처리 1688×211), 투명 배경 |
| `img/grok_gen/burn_death_sheet.png` | Grok 원본 이미지 (1408×768) |

### 비고
- 기존 `_addBurnCorpse` (프로시저럴 타들어감 + 재/불꽃 파티클)와 병행 재생됨.
- VFX는 `lighter` 합성 모드로 렌더되어 불꽃이 additive blend됨.
- 데미지/사망 판정 공식 변경 없음, 순수 연출 추가.
