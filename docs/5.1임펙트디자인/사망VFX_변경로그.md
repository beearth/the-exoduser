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
