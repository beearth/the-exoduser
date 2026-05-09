# 보스 배틀 세팅 바이블

> 최종 업데이트: 2026-05-06  
> 담당 코드: `game.html` — `genBossArena()`, `_enterBossArena()`, `_b3animate()`, `_poiseReset()`, 보스 테스트베드

---

## 1. 아레나 생성 (`genBossArena`)

### 맵 크기

| 항목 | 값 |
|---|---|
| 맵 너비 | `mw = 128` (타일) |
| 맵 높이 | `mh = 108` (타일) |
| 유효 영역 | `il=2, it=2, ir=126, ib=106` |
| 중심 | `cx = 64, cy = 54` |

### 아레나 타입 — 챕터별

| 챕터(hell) | 스테이지(si) | 타입 | 형태 |
|---|---|---|---|
| 0 (썩은 숲) | 0~3 | `0` | 원형 투기장 (기둥 없음) |
| 1 (벌레굴) | 4~9 | `1` | 대성당 (직사각형 전체) |
| 2 (얼음굴) | 10~13 | `2` | 십자형 (armW=30%, armH=30%) |
| 3 (화염지대) | 14~20 | `3` | 팔각형 |
| 4 (군단) | 21~25 | `4` | 타원형 |
| 5 (사도의 마굴) | 26~31 | `0` | 원형 (재사용) |
| 6 (지옥성) | 32~34 | `1` | 대성당 (재사용) |

### 주요 좌표

| 위치 | 계산식 |
|---|---|
| 플레이어 진입 | `entY = ib-3 = 103` (하단 중앙) |
| 보스 스폰 | `(cx, cy) = (64, 54)` (아레나 정중앙) |
| 출구 | `exitX = cx`, `exitY = it` 부근 (보스 사망 시 개방) |
| 경계 룬 타일 | `tile=5` (바닥 중 벽 인접 셀) |

---

## 2. 보스 진입 흐름 (`_enterBossArena`)

```
보스 게이트 접촉
  → G._bossLoadPhase=1 (페이드 아웃 50f)
  → G._bossLoadPhase=2 (보스 네임카드 130f)
  → _enterBossArena() 호출
    1. _preArenaBackup 저장 (사망 시 복원용)
    2. genBossArena(si) 로 새 맵 생성
    3. ens/projs/worldItems/G 상태 전체 초기화
    4. 플레이어를 entryX, entryY로 이동
    5. mkEn() 으로 보스 스폰 (ib=true, _isLargeBoss=true when si===0)
    6. G._bossArena=true, G.bossSealed=true 설정
    7. 봉인 파티클 32개 + 보스 포효 SFX
```

---

## 3. HP / ATK 배율

| 구분 | HP 배율 | ATK 배율 |
|---|---|---|
| 일반 보스 | `BOSS_HP_MULT = 8` | `BOSS_ATK_MULT = 3` |
| 최종 보스 | `FINALBOSS_HP_MULT = 15` | `FINALBOSS_ATK_MULT = 5` |

기본 몬스터 기준 `MON_BASE_HP = 60`, `MON_BASE_ATK = 8`.

---

## 4. 포이즈(Poise) / 그로기 시스템

### 핵심 함수

| 함수 | 역할 |
|---|---|
| `_doPoise(e, amt, stunT, label)` | 포이즈 데미지 적용 |
| `_poiseReset(e)` | 그로기 종료 후 포이즈 100% 회복 |

### 포이즈 데미지 흐름

```
_doPoise(e, amt) 호출
  → e.ib && e._pImmune > 0 → 면역: return false (적용 안 함)
  → e.poise -= amt
  → e.poise <= 0 → 그로기 발동:
      e.stunned = stunT
      e._maxStunned = stunT
      e.ib → e._pImmune = 300 (5초, 60fps 기준)
      SFX.groggy() + addTxt('💥 그로기!')
```

### 그로기 종료 → 포이즈 재충전

```javascript
// game.html line ~24408
if(e.stunned<=0 && e._maxStunned){
  e._maxStunned=0;
  if(e.ib){
    _poiseReset(e);           // poise = maxPoise
    e._pImmune = Math.max(e._pImmune||0, 300); // 면역 300f 보장
    e.s='idle'; e.st2=30; e._teleDropY=0;
  }
}
```

### 포이즈 HUD 표시 로직

| 상태 | 색상 | 표시 |
|---|---|---|
| 그로기 중 (`stunned > 0`) | `#ff8800` 주황 | 게이지 0% |
| 면역 충전 중 (`_pImmune > 0`) | `#4455cc→#8899ff` 파란 그라데이션 | 0→100% (300f 동안 채워짐) |
| 정상 | `#cc3300→#ff6600` 빨간 | 현재 poise / maxPoise % |

---

## 5. 페이즈 전환 시스템 (`_bossPhaseCheck`)

### HP 임계값 / BOSS_PHASES 테이블

| 페이즈 | HP 범위 | spdM | teleM | cdM | label |
|---|---|---|---|---|---|
| 0 | 80~100% | 1.15 | 0.75 | 0.50 | PHASE 1 |
| 1 | 60~80% | 1.25 | 0.65 | 0.40 | ⚠ PHASE 2 |
| 2 | 40~60% | 1.40 | 0.50 | 0.35 | ⚠ PHASE 3 |
| 3 | 20~40% | 1.55 | 0.40 | 0.25 | 🔥 PHASE 4 |
| 4 | 0~20%  | 1.75 | 0.25 | 0.15 | 💀 광폭화! |

### 전환 로직 (`_bossPhaseCheck` 호출 위치: 매 프레임 보스 업데이트)

전환 조건: `hpR <= 임계값 && _bp > e._bossPhase`

### 전환 시 처리 순서

| 순서 | 내용 |
|---|---|
| 1 | HP 회복 — 페이즈 상한까지 (`e.mhp × ph.hp[1]`) |
| 2 | 무적 3초 (`reviveIframes = 180`) |
| 3 | 스탯 강화 — atk×1.3, speed×1.15, maxPoise×1.2 |
| 4 | 상태 초기화 — stunned=0, s='recover', 콤보/딜레이 리셋 |
| 5 | 텔레포트 — 플레이어 등 뒤 (거리 `80+_bp*25`) + 파티클 VFX |
| 6 | 충격파 — 반경 `100+_bp*30`, 데미지 `atk*(0.4+_bp*0.1)` |
| 7 | 분노 탄막 방사 — `8+_bp*4`발 (빨콩 50% + 무지개 50% 교대) |
| 8 | 연출 — 텍스트, `_reviveVFX()`, HitStop, SlowMo, **셰이크, 포효** |

### 연출 수치 (8번 — 2026-05-08 업데이트)

```javascript
G.hitStop = ~~((_HS.bossPhase + _bp*3) * OPT.hitStop/100)
G.slowMo  = Math.max(G.slowMo, 60 + _bp*15)  // 페이즈별 75~120f
shake(14 + _bp*4)                              // 페이즈별 18~30
// 포효: 즉시 SFX.groggy() + 120ms 딜레이 후 _bossSfx().howl
```

| 페이즈 | slowMo(f) | shake |
|---|---|---|
| 1→2 | 75 | 18 |
| 2→3 | 90 | 22 |
| 3→4 | 105 | 26 |
| 4→광폭 | 120 | 30 |

---

## 6. 보스 무브셋 (`_BOSS_MOVESET`)

스테이지(si) → 허용 기술 Set. `null` = 전체 49종 사용.

| si | 챕터 | 보스명 | 특이 기술 추가 |
|---|---|---|---|
| 0 | 1장 썩은 숲 | 숲의 감시자 | 기본 18종 (no summon) |
| 1 | 1장 | 독버섯 거인 | + `summon, mine` |
| 2 | 1장 | 사냥꾼 | + `cageTrap` |
| 3 | 1장 | 기생수 | + `seekerMines` |
| 4~9 | 2장 벌레굴 | 벌레 수호자~여왕 구더기 | 점진 해금: `fanWave→wallPush→shieldBash2→spiralBullet` |
| 10~13 | 3장 얼음굴 | 얼음 망령~봉인 괴물 | + `laser, safeCorner, teleStrike, delaySlash, perilThrust, gravityWell` |
| 14~20 | 4장 화염지대 | 화염 악마~화염 감옥지기 | + `meteor, radialLaser, swordWave, pillars, burstCounter, chainLightning` |
| 21~25 | 5장 군단 | 전쟁의 잔해~군단 지휘관 | + `mirrorGuard, rewindStrike, orbWeave, mirrorClone` |
| 26~31 | 6장 사도의 마굴 | 살점의 수호자~대사도 | + `itemSteal` |
| 32~34 | 7장 지옥성 | 전체 49종 해금 | `null` (필터 없음) |

전체 기술 49종 목록은 `9적ai패턴디자인/` 참조.

### 보스 mine 액션 사거리 수정 (2026-05-09)
- `mine` 액션 range: `[0, 999]` → `[0, 220]`
- 이유: 원거리에서 지뢰 설치 방지 — 보스가 플레이어 근처에 있을 때만 사용

---

## 6. Three.js 3D 보스 오버레이

### 개요

| 항목 | 값 |
|---|---|
| 캔버스 | `<canvas id="boss3dCvs">` |
| z-index | `50` (2D 게임 캔버스 위) |
| 렌더러 | `THREE.WebGLRenderer` (alpha:true) |
| 2D 보스 숨김 방법 | `window._b3Active=true` + `bE._spawnT=999` 이중 보호 — 3D 활성 시 2D 렌더 완전 차단 |
| 메쉬 컬링 | `THREE.DoubleSide` — 이동 중 facing 회전 시 텍스처 소실 방지 |

### 위치/스케일 계산 (`_b3animate`)

> **수정 (2026-05-07 v1.5)**: `_btOffsetY`가 피벗 Y에만 반영되고 클리핑 평면에 미반영돼 50px 어긋나던 버그 수정. `_footY = _b3floorY + _b3yOff`로 피벗과 클리핑 동기화.
>
> **수정 (2026-05-07 v1.6)**: 클리핑 평면(`_b3clipFloor`) 완전 제거. 발좌표 `window._b3footScreenX/Y` 전역 노출.
>
> **수정 (2026-05-08 v1.7)**: xRot 발 기준 회전 구조 변경. `_b3anchor` 그룹 추가 — anchor=발 위치, pivot=회전만. 모델 origin을 bounding box 중심→발 하단으로 이동 (`_b3model.position.y += _modelSz.y * 0.5`).

### 씬 그래프 구조 (v1.7~)

```
_b3s (Scene)
  └─ _b3anchor (Group) ← position.x/y만 (발 위치 = _footY)
       └─ _b3pivot (Group) ← rotation.set(xRot, facing, 0) + scale + 스턴 흔들림
            └─ _b3model (gltf.scene) ← position.y = +_modelSz.y*0.5 (발→중앙 오프셋)
```

- 이전 구조: `_b3pivot`이 위치·회전 동시 담당 → xRot 시 허리 기준 회전으로 머리가 땅에 박힘
- 신규 구조: anchor(위치) / pivot(회전) 분리 → xRot이 발 기준으로 회전

### 위치/스케일 계산 상세

```javascript
// 보스의 게임 좌표 → CSS 픽셀
cssX = bE.x/scale - camX + innerWidth/2
cssY = bE.y/scale - camY + innerHeight/2

// 발 위치 (Three.js Y: 위가 양수, physY 기반)
_b3floorY = -((physY/scale + bossRcss) - H/2)
_b3yOff   = window._btOffsetY || 0
_footY    = _b3floorY + _b3yOff

// anchor = 발 위치
_b3anchor.position.x = cssX - W/2
_b3anchor.position.y = _footY          // tgtH*0.5 불필요 — 모델 origin이 발 기준

// 발좌표 전역 노출 (blob shadow 등 외부 활용)
window._b3footScreenX = cssX
window._b3footScreenY = cssY + bossRcss

// 스케일 (pivot에 적용)
tgtH = (bE.r / scale) * 2.0 * (window._btScaleMul || 1)
_b3sc = Math.max(0.1, tgtH / _b3size.y)
_b3pivot.scale.setScalar(_b3sc)

// 회전 (pivot에 적용 — 발 기준)
_b3pivot.rotation.set(window._btRotX || 0, -bE.facing + Math.PI/2, 0)

// 스턴 흔들림 (pivot 로컬 오프셋)
if(bE.stunned>0){ _b3pivot.position.x+=sin(...); _b3pivot.position.y+=cos(...) }
```

### Y 위치 공식 변경 이력

| 버전 | 공식 | 문제 |
|---|---|---|
| 초기 | `-(cssY-H/2) - 100` | 5x 스케일 시 모델이 땅속에 박힘 |
| v1.4 (2026-05-06) | `-(cssY-H/2) + tgtH*0.5` | 발 위치 기준으로 모델 중앙 올림 → 해결 |
| v1.5 (2026-05-07) | `_footY + tgtH*0.5` (`_footY=_b3floorY+_b3yOff`) | `_btOffsetY`를 클리핑 평면에도 반영 — 피벗/클리핑 50px 어긋남 수정 |
| v1.6 (2026-05-07) | 동일 (`_footY + tgtH*0.5`) | 클리핑 평면 완전 제거 — `clippingPlanes=[]`, 발좌표 `window._b3footScreenX/Y` 전역 노출 |
| v1.7 (2026-05-08) | `_b3anchor.position.y = _footY` (tgtH*0.5 제거) | anchor/pivot 분리 — 발 기준 xRot 회전. 모델 origin 발 하단으로 이동 |

### X 회전 이력

| 버전 | rotation.x | 효과 |
|---|---|---|
| 초기 | `0` | 기본 (누워있는 느낌) |
| v1.4 (2026-05-06) | `-0.28` (~-16°) | 모델을 약간 세워 정면 강조 |

---

## 7. 보스 테스트베드 (`?bosstest=N`)

### 실행

```
http://localhost:3333/game.html?bosstest=0
```

`N` = 스테이지 인덱스 (0~34). 지정 스테이지 보스 즉시 소환.

### 기능

| 기능 | 설명 |
|---|---|
| 보스 동결 (`_btFrozen`) | 보스 AI 정지 (`bossPatT=99999`) |
| 스케일 슬라이더 | `window._btScaleMul` 조절 (기본 5x) |
| 슬로우 모션 | `_btSlowToggle()` — RAF를 격 프레임 처리로 50% 속도 |
| 갓 모드 | 플레이어 무적 + 스킬 프로필 MAX |
| 보스 재소환 | `_enterBossArena()` 재호출 후 500ms 대기로 `_btBoss` 갱신 |

### 주요 전역 변수

| 변수 | 기본값 | 역할 |
|---|---|---|
| `window._btScaleMul` | `3.7` (전역), 테스트베드에서 `5.0` 설정 | Three.js + 2D 캔버스 보스 시각 배율 |
| `window._btRotX` | `0.0` (rad) | 보스 3D X축 회전 |
| `window._btOffsetY` | `-50` (px) | 보스 3D Y 오프셋 — 피벗 Y에 반영. 양수=위로 이동 |
| `window._b3footScreenX` | `cssX` | 보스 발 스크린 X 좌표 (blob shadow 등 외부 활용) |
| `window._b3footScreenY` | `cssY + bossRcss` | 보스 발 스크린 Y 좌표 (blob shadow 등 외부 활용) |
| ~~`_b3clipFloor`~~ | ~~`Plane(0,1,0)`~~ | **제거됨 (v1.6)** — `clippingPlanes=[]`, 클리핑 비활성화 |
| `window._b3Active` | `true/false` | 3D 오버레이 활성 여부 — true면 2D 보스 렌더 완전 차단 |
| `_btBoss` | `ens.find(e=>e.ib)` | 테스트베드 보스 참조 |
| `_btGod` | `true` | 플레이어 무적 |
| `_btPaused` | `false` | 게임 루프 일시정지 |
| `_btSlow` | `false` | 슬로우모션 활성 |

### `_btScaleMul` 적용 위치

| 위치 | 적용 방식 |
|---|---|
| Three.js 3D 모델 (`_b3animate`) | `tgtH *= _btScaleMul` → `_b3pivot.scale` |
| 2D 캔버스 (`_drawBossWalk`) | `_largeMul = _btScaleMul` |
| 2D 캔버스 (ext atlas, int atlas) | `_eLargeMul / _bLM = _btScaleMul` |
| 2D 캔버스 렌더 래퍼 | `X.scale(_bScMul, _bScMul)` (컨텍스트 전체 스케일) |

---

## 8. 카메라 시스템 (보스 아레나)

### 보스 아레나 카메라 동작

| 동작 | 평상시 | 보스 아레나 |
|---|---|---|
| 추적 대상 | 플레이어 (`P.x/y + look-ahead`) | 플레이어+보스 중간점 (`.5+.5` 믹스) |
| 룩어헤드 반영 | 100% (`G._camLkX/Y`) | 30%만 반영 |
| 줌 (`G._camZoom`) | `1.0` | `0.80` (줌아웃) |

### 카메라 코드 (`game.html` — 업데이트 루프)

```javascript
// look-ahead
const _lkX=(P.vx||0)*25, _lkY=(P.vy||0)*25;
G._camLkX += (_lkX - G._camLkX) * _lkSmooth;
G._camLkY += (_lkY - G._camLkY) * _lkSmooth;

// 추적 타겟
let targetX = P.x + G._camLkX, targetY = P.y + G._camLkY;
if(G._bossRef && G._bossRef.alive){
  targetX = (P.x + G._bossRef.x) * .5 + G._camLkX * .3;
  targetY = (P.y + G._bossRef.y) * .5 + G._camLkY * .3;
}
G.cam.x += (targetX - G.cam.x) * camSpd;
G.cam.y += (targetY - G.cam.y) * camSpd;

// 줌아웃
const _czTgt = (G._bossRef && G._bossRef.alive) ? 0.80 : 1.0;
if(!G._camZoom) G._camZoom = 1.0;
G._camZoom += (_czTgt - G._camZoom) * (1 - Math.pow(0.94, _dtSp));
```

### 렌더 적용 (`draw()`)

```javascript
const _cz = (!_EDITOR_MODE) ? (G._camZoom || 1) : 1; // 보스 줌아웃
const _tzoom = _ez * _cz;
if(_tzoom !== 1){
  X.translate(C.width/2, C.height/2);
  X.scale(_tzoom, _tzoom);
  X.translate(-C.width/2, -C.height/2);
}
X.translate(Math.round(C.width/2 - G.cam.x + sx), Math.round(C.height/2 - G.cam.y + sy));
```

- 줌은 화면 중앙 기준으로 적용 → 카메라 타겟(플레이어+보스 중간점)이 항상 화면 중심에 유지
- 에디터 모드(`_EDITOR_MODE`)에서는 `_cz=1` 고정, 에디터 줌(`_ez`)만 사용

---

## 9. 보스 플래그 일람

| 플래그 | 타입 | 설명 |
|---|---|---|
| `e.ib` | bool | 보스 여부 (isBoss 약자) — 핵심 식별자 |
| `e._isLargeBoss` | bool | si===0 (숲의 감시자)만 true |
| `e._pImmune` | int | 포이즈 면역 남은 프레임 (300 = 5초) |
| `e.poise` | float | 현재 포이즈 |
| `e.maxPoise` | float | 포이즈 최대값 |
| `e.stunned` | int | 그로기 남은 프레임 |
| `e._maxStunned` | int | 그로기 최대값 (애니메이션용) |
| `e.bossPatT` | int | 패턴 타이머 (99999 = AI 동결) |
| `e._spawnT` | int | 2D 드로우 타이머 (999 = 2D 숨김, Three.js만 표시) |
| `e._btFrozen` | bool | 테스트베드 동결 플래그 |
