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

## 5. 보스 무브셋 (`_BOSS_MOVESET`)

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

**바닥 클리핑 평면** (`_b3clipFloor`): 보스 중심+반지름(`bE.y+bE.r`) = 실제 발바닥 위치를 Three.js Y로 변환, 그 아래는 렌더 차단 → 팔/다리 땅속 함몰 방지

### 위치/스케일 계산 상세

```javascript
// 보스의 게임 좌표 → CSS 픽셀
cssX = bE.x/scale - camX + innerWidth/2
cssY = bE.y/scale - camY + innerHeight/2

// Three.js 좌표 (X: 좌우, Y: 상하 반전)
_b3pivot.position.x = cssX - W/2
_b3pivot.position.y = -(cssY - H/2) + tgtH * 0.5   // 발 위치 기준, 모델 중앙 올림

// 스케일
tgtH = (bE.r / scale) * 2.0 * (window._btScaleMul || 1)
_b3sc = Math.max(0.1, tgtH / _b3size.y)
_b3pivot.scale.setScalar(_b3sc)

// 회전 (X: -0.28rad ≈ -16° 세움, Y: 방향 facing)
_b3pivot.rotation.set(-0.28, -bE.facing + Math.PI/2, 0)
```

### Y 위치 공식 변경 이력

| 버전 | 공식 | 문제 |
|---|---|---|
| 초기 | `-(cssY-H/2) - 100` | 5x 스케일 시 모델이 땅속에 박힘 |
| v1.4 (2026-05-06) | `-(cssY-H/2) + tgtH*0.5` | 발 위치 기준으로 모델 중앙 올림 → 해결 |

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
| `window._btScaleMul` | `2.26` (전역), 테스트베드에서 `5.0` 설정 | Three.js + 2D 캔버스 보스 시각 배율 |
| `window._btRotX` | `0.28` (rad ≈ 16°) | 보스 3D X축 회전 — 모델 세움 효과 |
| `window._btOffsetY` | `50` (px) | 보스 3D Y 추가 오프셋 — 양수=위로 |
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

## 8. 보스 플래그 일람

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
