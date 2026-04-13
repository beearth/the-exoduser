# 사망 VFX 변경 로그

## 2026-04-12 — 큰 몬스터 사망 이펙트 추가

### 변경 요약
- 공용 적 사망 처리 루틴에 `큰 몬스터 전용 사망 VFX`를 추가.
- 대상은 `보스` 또는 `큰 몬스터(반지름/체력 기준)`이며, 기존 `deathFX`/`시체`/`gib` 처리와 병행됨.
- 적용 파일: `game.html`, `game_current.html`, `Electron/game.html` (동일 로직).

### 수치/공식 테이블

| id | 한글명 | 조건/공식 | 수치 | 적용 위치 |
|---|---|---|---|---|
| `largeDeathFxTarget` | 큰 몬스터 판정 | `e.ib || e.r >= 18 || e.mhp >= 220` | 보스 또는 대형몹 | `_spawnLargeMonsterDeathFx(e, ang)` |
| `largeDeathFxBoomR` | 사망 폭발 반경 | `clamp(e.r * 2.8, 36, 120)` | 최소 36, 최대 120 | `_addBoom(e.x, e.y, _boomR, ...)` |
| `largeDeathFxBoomDur` | 사망 폭발 지속 | 보스/일반 분기 | 보스 36f, 일반 28f | `_addBoom(..., dur, ...)` |
| `largeDeathFxBurstN` | 방사 파티클 수 | 보스/일반 분기 | 보스 26, 일반 16 | `for` 루프 방사 파티클 |
| `largeDeathFxVel` | 방사 속도 | 보스/일반 분기 + 랜덤 | 보스 `4.6 + rand*3.2`, 일반 `3.2 + rand*2.0` | `poolPart` |
| `largeDeathFxSize` | 파티클 크기 | 고정+랜덤 | `2.4 + rand*2.8` | `poolPart` |
| `largeDeathFxLife` | 파티클 수명 | 고정+랜덤 | `14 + rand*10` | `poolPart` |
| `largeDeathFxShake` | 카메라 흔들림 | 보스/대형 분기 | 보스 8, `e.r>=22` 일반 4 | `shake(...)` |
| `largeDeathFxColor` | 색상 세트 | 보스/일반 분기 | 보스 `#ff5577/#ffccdd`, 일반 `#ffaa66/#ffd9aa` | `_addBoom`, `poolPart`, `addParts` |

### 사망 루틴 연결점

| id | 한글명 | 처리 순서 | 적용 위치 |
|---|---|---|---|
| `killAngShared` | 킬 각도 공용화 | `_killAng = ang ?? atan2(e.y-P.y, e.x-P.x)` 생성 후 재사용 | 공용 적 사망 블록 |
| `largeDeathFxHook` | 큰 몬스터 사망 VFX 호출 | `_isWhirlKill`이 아닐 때 `_spawnLargeMonsterDeathFx(e, _killAng)` | 공용 적 사망 블록 |
| `corpseReuseKillAng` | 시체 생성 각도 일치 | `_addCorpse(e, _killAng, _cp)`로 통일 | 공용 적 사망 블록 |

### 비고
- 기존 화염 사망(`_isBurnDeath`) 분기, gib 분기, 부활/보스 판정 로직은 유지.
- 2026-04-13: 회전참(`P.s==='whirlwind'`, 비기폭 처치) 킬에서는 `deathFX`만 유지하고 `largeDeathFx`는 호출하지 않음.
- 이번 변경은 연출 추가이며 기존 데미지 판정/사망 판정 공식은 변경하지 않음.
