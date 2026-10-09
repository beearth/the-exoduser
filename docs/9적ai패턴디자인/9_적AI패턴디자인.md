> 2026-09-10 비보스 공통 탄막: projCd=240f, 초기 projT=180+Math.random()*120f, 차징60f 유지, 첫 교전 추가탄 제거. [필드 탄막 SSOT](../8.0몬스터디자인/FIELD_PROJECTILE_CADENCE_20260910.md). 전용 AI 패턴은 유지한다.

# 적 AI 패턴 디자인 — 구현 기준 문서

> 레퍼런스: compass_artifact 문서 (FromSoftware/HollowKnight/Diablo 참고)
> 실제 구현: game.html 기준 (2026-03-30 동기화)

---

## 1. 상태머신 (FSM)

모든 적은 `e.s` (state) + `e.st2` (타이머) 기반 FSM으로 동작한다.

### 기본 상태 흐름
```
idle → (거리 조건) → windup → attack → recover → idle
                  ↘ eCircle (어택티켓 대기, 공전)
```

### 상태 목록

| 상태 | 설명 | 전환 조건 |
|------|------|-----------|
| `idle` | 대기, 이동 | st2 소진 시 windup 또는 eCircle |
| `windup` | 공격 텔레그래프 | st2 소진 → attack |
| `attack` | 공격 판정 | st2 소진 → recover |
| `recover` | 공격 후 경직 | st2 소진 → idle |
| `eCircle` | 어택티켓 대기 공전 | 티켓 획득 시 → idle/windup |
| `eChargeWind` | **돌진 예고** (START 균열 + 반투명 BODY + END 창촉, 90f≈1.5초, 앞 24.5% 추적 후 방향 고정) | st2 소진 → 텔레그래프 즉시 제거 + eCharge (2026-06-27 신규, 2026-09-02 3파트 VFX 교체) |
| `eCharge` | 돌진 공격 | 벽/거리 초과 → recover |
| ~~`eSelfDestruct`~~ | ~~자폭~~ | 삭제됨 — etype 5는 탄막몹(windup→발사)으로 전환 |
| `eShieldBash` | 방패 돌진 | 벽/거리 → recover |
| `eShootWind` | 탄막 발사 준비 (최소 1초) | st2 소진 → `_swFire()` 실행 → `_swChargeEl=null` → idle. 물리 특수탄(66/68/69)은 `_swChargeEl=EL.P`로 흰색 `#f4f4f4` 속성 예고 라운드 |

---

## 2. 핵심 수치 (일반 vs 보스)

| 항목 | 일반몹 | 보스 |
|------|--------|------|
| **idle 대기** | 15~30f (0.25~0.5초) | 3~8f |
| **windup** | 진입 경로별 `st2`; 소진 → attack(일반 8f / etype3 5f) | 패턴별 가변 |
| **attack st2** | 8f | 8f |
| **attack 판정** | st2≤5 && st2+sp>5 시점 | 동일 |
| **recover** | 35f (0.58초) | 35f (max 20으로 클램프) |
| **근접 사거리** | d < 30+P.r+18 ≈ 48~50px | d < 50+P.r+18 ≈ 68~70px |
| **텔레그래프** | _telegraphT=20f | 20f |
| **시야 어그로** | d<800 && hasLOS(벽 뒤 무시) 시 자동 알림 | 동일 |
| **추적 해제** | 없음 — 어그로 잡히면 d≤30까지 밀착 추적 (해제 없음) | 동일 |
| **방향 추적 (facing)** | **이동 중**: facing=이동방향(_moveAng, atan2(dy,dx)) / **정지 중**: d<800에서 facing=플레이어 방향. (2026-04-16: 이동 시 이동방향 우선 — walk 애니/스프라이트가 진행방향 표시) | 보스 포함 |
| **근접 어그로** | d<100 && d>50 && idle/recover → 즉시 _alerted=true (이동 없음) | 보스 제외 |
| **밀어내기** | 제거됨 (pushStr 블록 삭제, 플레이어-몬스터 겹침 허용) | — |
| **피격 즉시 반격** | hurtE 시 _alerted=true + recover→idle(st2=0) + idle대기→5프레임 단축 — DOT 제외 | 보스 제외 |
| **근접 접촉공격** | etype 0,2,4,5,6,10,12,18,19 밀착 시 atk×0.8 타격, 쿨 40~60f (2026-04-07 복원) | 동일 |
| **순찰 배회** | 제거됨 (2026-04-14) — 비어그로+d>400이면 대기만 | — |

---

## 2.5 추적 시스템 — 플로우필드 + LOS

### 시야(LOS) 어그로
- **hasLOS** 함수로 레이캐스트 (16px 간격, isW 체크 — 타일벽 + MAP_OBJS + 본월 모두 포함)
- d<800 && hasLOS 통과 시에만 `_alerted=true` — **벽 뒤 몬스터는 어그로 안 잡힘**
- 피격 시에는 LOS 무관 즉시 어그로 (`hurtE` 내부에서 `_alerted=true`)
- 방향 추적(facing)도 `_alerted` 상태일 때만 작동

### 플로우필드 (BFS 경로탐색)
- 0.25초마다 플레이어 위치 기준 BFS 재계산 (Web Worker 오프로드, 폴백: 메인스레드)
- 셀 크기: T=40px (타일 크기 동일)
- **벽 판정**: 타일벽(map[][]=1)만 사용 (MAP_OBJS는 canMv에서 실시간 체크)
- 8방향 탐색 (대각선 포함, 대각 코너컷 방지)

### Stuck 복구 (3단계)
| 단계 | 조건 | 행동 |
|------|------|------|
| 1 | 즉시 | 8방향(45° 간격) 우회 시도, 0.8배속 |
| 2 | 0.5초+ stuck | 충돌반경 축소 + 16방향(22.5° 간격) |
| 3 | 1.5초+ stuck | 플레이어 방향으로 2~6배 거리 강제 텔레포트 |

### 벽 끼임 최종 처리 (메인 적 루프, `game.html:32700~`) — 2026-10-01 보스 예외 추가
중심+4코너가 벽(`_eWallStuck`)이면 5링×8방향 구조 시도 → 실패 시:
- **비보스:** 정리 킬(`e.hp=0; rollDrop; addExp; G.kills++; G._stageKills++; _regKill`). 도달 불가 몹이 진행을 막는 소프트락 방지 목적. (기존 계약 유지)
- **보스(`e.ib`) — 즉사 금지:** 넓은 링(6~12타일) 재배치 → 실패 시 `canMv(P.x,P.y)` 플레이어 위치 → 그래도 실패면 제자리 유지(다음 프레임 재시도). **보스는 어떤 경우에도 이 경로로 죽지 않는다.** (이전: `e.ib` 예외 없이 보스도 즉사 → 전리품·킬 크레딧과 함께 무료 소멸·킬카운터 desync 사고. 회귀 `test/enemyWallStuckBossKill.test.js`)

---

## 3. 어택 티켓 시스템

> 핵슬 장르 특성상 **현재 무제한(항상 true)**으로 설정됨.

```
G.maxAtkTickets = 3   // 정의만 존재
atkTicketRequest(e) → return true  // 항상 허용
atkTicketRelease(e) → 티켓 반환
```

- 티켓 풀 상태에서 일반몹은 `eCircle`(공전)로 전환하지만, 현재 항상 true이므로 eCircle 진입 빈도 낮음
- 보스는 eCircle 즉시 idle 복귀

---

## 4. eCircle (공전) 로직

플레이어 주변을 원형으로 공전하며 공격 기회를 노림.

| 항목 | 값 |
|------|-----|
| 궤도 반경 | 90 + e.r (≈100~110px) |
| 각속도 | 0.018 rad/frame (≈1°/f) |
| 이동속도 | 기본 × 75% |
| 공격 재시도 | 30~60f마다 티켓 요청 |
| 근접 전환 | d < e.r+30 → 즉시 windup(st2=35) |

---

## 5. etype별 특수 패턴

### 근접형

| etype | 이름 | 특수 행동 | 핵심 수치 |
|-------|------|-----------|-----------|
| 2 | 돌진사도 | **돌진 제거 (2026-06-28)** — 일반 근접만 (`_meleeET`, 밀착 시 atk×0.8) | 휴머노이드 돌진 폐지, 동물형(22/30/43)만 돌진 |
| 3 | 요마 | windup 짧음 | windup st2=5 (다른몹 8) |
| 5 | 태아형악마 | 탄막 (자폭 제거) | d<35+P.r → windup st2=20, 이후 탄막 발사 |
| 6 | 철갑사도 | 방패돌진 | d<150, d>30, 속도 4.5px/f, 쉴드 파괴 후만 |
| 8 | 부풀은사도 | 근접 기습 | d<40 |
| 51 | 융합체 | 근접 | d<35+e.r, windup st2=20 |
| 52 | 입 괴물 | 이빨 닫기 | d<25+e.r, windup st2=15 |
| 90 | 방랑기사 | 3연 콤보 자동연계 | 1타 st2=18, 2타=12, 3타=10. recover 후 d<60이면 자동 다음타 (콤보 3회까지) |

### 돌진형

> **돌진 예고 텔레그래프 (eChargeWind) — 2026-06-27 신규, 2026-06-28 개편, 2026-09-02 START/BODY/END VFX 교체**
> `idle → eCharge` 직행 대신 `idle → eChargeWind → eCharge`. 현재 전조는 몬스터 중심의 검붉은 균열 START, 실제 위험구간의 어두운 안개 BODY, 도착점의 별도 악마성 창촉 END로 구성한다. END가 진행 방향을 표시하고 `eCharge` 전환 틱에 전체를 즉시 제거한다.
> - **진입 시**: 플레이어 방향으로 `echDx/echDy` 조준 + `e.facing` 설정
> - **예고 시간**: `e.st2 = _chgAimMax = 90f (1.5초)` 동안 정지하며 3파트 레인 표시 (2026-06-28: 1초→1.5초)
> - **유도(팔로잉)**: 예고 **앞 ~24.5%** 동안만 플레이어 재조준(추적), 이후 **75.5%는 방향 고정**. 락 임계값 `_chgLock = _chgAimMax × 0.755`, `e.st2 > _chgLock`인 동안 추적. (2026-06-28: 팔로잉 30% 추가 감소 — 기존 0.65→0.755). 추적 중 `_chgVisLen` 매프레임 재계산, 락 후 캐시
> - **장애물 감지**: 발동 전 `_chgPathClear(e,len)` 검사 — 돌진 경로(`e.r`~거리, 12px 간격)에 벽/오브젝트(`isW`) 있으면 **돌진 시작 안 함** (2026-06-28 신규). `_chgVisLen`은 벽에 막히면 레인을 그만큼 짧게 표시
> - **논타겟 커밋**: 예고/돌진(`eChargeWind`/`eCharge`) 진입 후에는 사거리 이탈·디어그로·작살 스턴에도 멈추지 않고 끝까지 진행. 컬링/AI 거리 티어링 무시하고 매프레임 갱신(T1 강제), 작살 스턴 면제 (2026-06-28 신규)
> - **렌더**: `A=(e.x,e.y)`, `B=A+(_chgVisLen×echDx,_chgVisLen×echDy)`, `angle=atan2(echDy,echDx)`. START는 `A`, END는 `B`에 원본 비율로 고정하고 BODY만 X축으로 `_chgVisLen`까지 stretch한다. BODY 폭은 기존 판정 가이드와 동일한 `e.r×1.7`. 면 opacity `0.27`, 균열선 `0.62±3.5%`, 중앙 에너지 `0.11`, START `0.56`, END `0.70`; 모두 30f(0.5초) fade-in. **GL 경로(`_prepEnemyInstanced`, 일반 아틀라스·8방향 WebGL 스프라이트 모두)와 2D 폴백 경로(`!_ensGLQueued`)에서 동일하게 렌더**
> - **소진 시**: `e.s='eCharge'; e.st2=_chgDur` — 돌진 속도 `e._chgSpd||5` px/f
> - **적중 데미지**: `atk×30` (2026-06-28: ×1.5→×15→×30) + `fire_medium` 임팩트(`_addBoom 80,48`) + 넉백(100) + `bigImpact(불)` + `shake(10)` + `SFX.detonate`
> - **회피법**: 예고선 보고 옆으로 사이드스텝. 앞 24.5%는 따라오므로 락 이후 타이밍에 회피
> - **필드**: `_chgAimMax`(예고길이=90), `_chgDur`(돌진 지속), `_chgSpd`(속도=42), `_chgLen`(레인 픽셀길이=spd×dur), `_chgVisLen`(벽 클리핑된 표시 길이)
>
> | VFX ID | 한글명 | 에셋/수치 | 적용 위치 | 공식·동작 |
> |---|---|---|---|---|
> | `chargeStartRift` | 시작 균열 | `charge_start_rift.png`, 550×512 RGBA, `clamp(e.r×2.1,35,50)px`, alpha `0.56` | `_getChargeTeleLayout` → `_drawChargeTele` | 몬스터 중심 A, 원본 비율 유지 |
> | `chargeBodyMist` | 위험구간 안개 | `charge_body_mist.png`, 1024×128 RGBA, 폭 `e.r×1.7`, alpha `0.27`, 중앙 `0.11` | `_getChargeTeleLayout` → `_drawChargeTele` | A→B, BODY만 `_chgVisLen`으로 X축 stretch |
> | `chargeBodyEdge` | 양쪽 균열선 | `#a52b22`, 1.25px, alpha `0.62±3.5%` | `_drawChargeTele` | BODY 외곽만 미세 pulse |
> | `chargeEndSpear` | 도착 창촉 | `charge_end_spear.png`, 776×512 RGBA, `clamp(e.r×2.5,45,65)px`, alpha `0.70` | `_getChargeTeleLayout` → `_drawChargeTele` | 도착점 B, START와 별개 형상, 원본 비율 유지 |
> | `chargeFade` | 예고 fade-in/제거 | `fade=clamp((90-st2)/30,0,1)` | `eChargeWind → eCharge` | 0.5초 fade-in, 발동 틱에 전체 즉시 제거. 피해·속도·거리·히트박스 불변 |
>
> **적용 대상 (동물형 3종)**: etype 22(서리늑대), 30(사냥개사도), 43(악마견)
> **etype 2(돌진사도) 제거 (2026-06-28)** — 휴머노이드 돌진 폐지, 동물형만 돌진. 미적용(추후 확장): 23·45 급강하/원거리, 55 파편 돌진, 41 장로전사

| etype | 이름 | 예고 st2 | 돌진 속도/지속 | 돌진거리=레인 len | 비고 |
|-------|------|------|------|------|------|
| 22 | 서리늑대 | 90(1.5s) | 42px/f × 19f | 798+r | 🐺 감속오라 |
| 30 | 사냥개사도 | 90(1.5s) | 42px/f × 17f | 714+r | wildCharge |
| 43 | 악마견 | 90(1.5s) | 42px/f × 15f | 630+r | ddLunge |
| 2 | 돌진사도 | — | — | — | **돌진 제거 (근접만)** |

> 2026-06-28 정리: 예고 1초→1.5초, 팔로잉 30% 감소(락 0.755), 장애물 감지+논타겟 커밋 추가, 돌진뎀 ×30, fire_medium 임팩트. 속도 42px/f 공용, 거리는 dur로 조절(`_chgLen=_chgSpd×_chgDur` 불변식 유지).

> **순간이동 예고 텔레그래프 (`_tpWarn`) — 2026-06-28 개편, 2026-06-29 2차 강화, 2026-09-01 원 렌더 폐기**
> 기존 "0.5초 본체 깜박임 + 도착지 흐린 원" → 2초 타이머 전조. **원 오버레이는 2026-09-01 전부 폐기**(본체 충전원·도착지 점선원·착지 확장원). 타이머·착지강타는 유지.
> **2026-06-29 2차**: 전조 전 텔포 몹 **2초(120f)로 통일**, 도착 충격범위 2배, 착지 강타 데미지 추가.
> - **공용 필드**: `_tpWarnT`(남은 프레임, 감소), `_tpWarnMax`(시작값=진행률 분모), `_tpWarnX/_tpWarnY`(도착지), `_tpWarnCol`(색, 렌더 미사용). 엔티티 init 기본 `_tpWarnMax:30`(런타임에 120으로 덮어씀)
> - **렌더**: 없음. 스프라이트 VFX(`teleportE` 연기·번개)만
> - **발동 후**: `teleportE()` 실행, 도착 직후 탄막 1발
> - **착지 강타**: 도착 시 조준 범위 `(r+10)*2` 내 플레이어 `e.atk*10.5`(돌진 `e.atk*30`의 35%) 타격. 비보스 한정, iframes/돌진 무적 회피
> - **회피법**: 2초 전조 동안 거리 벌리기. 조준 원은 안 그림

| 사용 몬스터 | 전조 길이 | 색 | 도착지 | 발동 후 |
|---|---|---|---|---|
| etype 7 리치 | `_tpWarnT`=120f(2s) | `#8833cc` | 플레이어 주변 150~200px 랜덤 | 탄막 1발+착지강타 |
| etype 47 그림자쌍둥이 | 120f(2s) | `#cc44ff` | 플레이어 주변 60~100px 랜덤 | 착지강타(+분신 별도) |
| M13 텔레포트 모드 | 120f(2s) | `#aa00ff` | 플레이어 뒤 50px | 탄막 1발+착지강타 |
| 시간정지형(시간 되감기) | 120f(2s) | `#aabb99` | 플레이어 뒤 35px | 감속오라+탄막 |
| etype 98 차원균열체 | 120f(2s) | `#bb44ff` | 자기 주변 80~200px 랜덤 | 균열 설치 연계 |

### 원거리/캐스터형

| etype | 이름 | 행동 | 수치 |
|-------|------|------|------|
| 7 | 리치 | d<100 후진, 텔레포트 뒤습 (2초 전조 타이머 + 착지강타 e.atk*10.5. 원 오버레이 없음) | 후진 조건 d<100, 전조 `_tpWarnT`=120f |
| 26 | 눈보라마법사 | 눈보라 시전 | d<1200 |
| 14 | 날개사도 | 원거리 이동 | d<1200 |

### 특수

| etype | 이름 | 행동 | 비고 |
|-------|------|------|------|
| 13 | 거미사도 | 공격 모방 | d<40 |
| 20 | 빙결전사 | 근접+빙결 | d<30+e.r |
| 24 | 동상좀비 | 접촉 빙결 | d<e.r+P.r+8 |
| 25 | 빙판슬라임 | 추적 | d<1200 |
| 28 | 빙하골렘 | 빙결파 | d<100 |

---

## 6. 보스 전용 패턴

보스는 `e.ib=true`이며 별도 상태를 사용.

### 보스 상태 목록

| 상태 | 설명 |
|------|------|
| `bossDelaySlashHold/Swing` | 지연참 (홀드→스윙) |
| `bossPerilWind/Thrust` | 위험 찌르기 (thrust st2=8) |
| `bossBurstCounter` | 폭발 반격 |
| `bossCrescendo` | 점층 연격 |
| `bossPoisonDash` | 독안개 대시 (recover 25f) |
| `bossSBashWind/SBash` | 방패 돌진 (bash st2=18, recover 25~30f) |
| `bossMirrorGuard` | 거울 방어 (recover 20f) |
| `bossItemStealWind/Steal` | 아이템 탈취 |
| `bossMeteorWind` | 유성우 (tele/50f) |
| `bossGrabWind` | 잡기 (tele/40f) |
| `bossChargeWind` | 돌진 (tele/55f) |
| `bossShock` | 충격파 |
| `bossSummonWind` | 소환 (55f) |
| `bossBurstWind` | 폭발 (55f) |

### 보스 수치 특성
- recover → idle: st2 max 20으로 클램프
- idle 대기: 3~8f (거의 즉시 재행동)
- 근접 사거리: 50+P.r+18 ≈ 68~70px

---

## 7. 엘리트 시스템

### 등급

| 등급 | 색상 | HP배율 | ATK배율 | 모디파이어 | 드롭보너스 | 크기배율 |
|------|------|--------|---------|-----------|-----------|
| 일반 | 흰색 | ×1 | ×1 | 0 | 0 | ×1.00 |
| 매직 | 파랑 | ×2 | ×1.3 | 1 | +50% | ×1.08 |
| 레어 | 주황 | ×3 | ×1.6 | 2 | +150% | ×1.20 |
| 챔피언 | 빨강 | ×5 | ×2 | 3 | +300% | ×1.35 |

### 출현 확률 (장별)

| 장 | 매직 | 레어 | 챔피언 |
|----|------|------|--------|
| 1장 | 3% | 0% | 0% |
| 2장 | 8% | 2% | 0% |
| 3장 | 12% | 5% | 1% |
| 4장 | 15% | 8% | 2% |
| 5장 | 18% | 10% | 3% |
| 6장 | 20% | 12% | 4% |
| 7장 | 22% | 15% | 6% |

> **현재 적용**: 일반 필드몹만 등급 판정. 보스와 etype 90~99 레어몹은 이 롤에서 제외. 확률은 장별 표를 따르며, 레어/챔피언은 확률 합산 구간으로 판정한다.
> 런타임 보존: 적 상태 갱신 루프는 elite/mods/aura를 초기화하지 않는다. 등급·접사·오라는 스폰 시 부여되어 전투 중 지속된다.
> 가독성 VFX: 매직/레어/챔피언은 플레이어 Q 홀드 보호막과 같은 에너지 불꽃 스프라이트를 사용한다. 등급별 색은 파랑/금/빨강이며, 몸을 두르는 선형 링은 그리지 않는다. 레어 몬스터(etype 90~99)는 개별 네임드 이름을 금색 상시 이름표로 표시한다. 장판은 피해반경 고정 외곽선+20개 경계 눈금+중앙에서 커지는 발광 전선12개로 표시한다. 포격은 반경의 38~55% 십자 조준 표식, 번개는 850px 점선 3레인과 지그재그 중심 아크를 사용한다. 자세한 렌더 수치는 VFX 구현 가이드의 2026-09-23 항목을 따른다.

| 렌더 요소 | 반경 | 물리탄 차징 링과의 간격 | 목적 |
|---|---:|---:|---|
| 정예 에너지 오오라 | Q 보호막 시트 5×4 중 0~1프레임을 약 140ms마다 교차; 매직 e.r×5, 레어 e.r×5.8, 챔피언 e.r×6.4에 pulse=.92+.08×sin(now/105+etype) | 물리탄 차징 표시 및 공격 예고와 분리 | 파랑/금/빨강 틴트의 에너지 불꽃이며 외곽 원형 링은 없음; Q와 같은 가산 합성/알파 1.4×pulse+0.6×pulse 2패스, 플레이어 Q 보호막 에셋 재사용 (2026-09-24) |


### 엘리트 전투 접사 (M29~M32)

| ID | 접사 | 해금 장 | 패턴 | 전조/대응 |
|---|---|---:|---|---|
| M29 | 돌진 | 1장 | 9초마다 140~520px 거리에서 돌진, 속도 32, 지속 18f | 붉은 직선 레인 60f 예고 후 옆으로 회피 |
| M30 | 진원 충격파 | 1장 | 8초마다 플레이어 위치에 반경 125px 폭발 | 원형 위험 표시가 중심에서 54f 동안 가장자리로 확장, 표시 밖으로 이탈 |
| M31 | 번개 연사 | 2장 | 6초마다 조준 부채꼴 번개탄 3발, 속도 3, 피해 ATK×0.72 | 조준선 45f 예고, 시작 후 사거리 이탈과 무관하게 발사 완료, 마법탄은 Q 패링 또는 회피 |
| M32 | 지옥 포격 | 3장 | 10초마다 플레이어 주변 3지점 순차 포격, 반경 68px, 피해 ATK×0.8 | 각 원 78/102/126f 예고 후 폭발, 표식 밖으로 이탈 |

기존 M19 낙뢰는 6초마다 플레이어 위치를 표적화하며 반경 105px로 확장되는 원형 전조 54f 후 폭발한다(피해 ATK×0.65).

등급은 매직/레어/챔피언 순으로 모디파이어 1/2/3개를 보유한다. 매직·레어는 해금된 M29~M32 공격 접사를 최대 1개, 챔피언은 최대 2개 우선 부여한다(해당 장에서 해금된 공격 종류가 부족하면 가능한 수만 부여). 남은 슬롯은 중복 없는 해금 일반 모디파이어에서 뽑는다. 레어부터 팩 오라를 추가한다. 강한 공격 개시는 적별 공유 eliteBusy 잠금으로 직렬화한다: M19/M30=54f, M29=78f(60f 예고+18f 돌진), M31=45f, M32=126f. 잠금 중 다른 강공격 시작은 보류하고 각 재사용 계수는 계속 누적한다. 동시에 준비된 경우 M19→M29→M30→M31→M32 순으로 선점한다.

---

## 8. 레어 몬스터 (etype 90~99)

| etype | 이름 | HP | ATK | SPD | 포이즈 | 특수 |
|-------|------|----|-----|-----|--------|------|
| 90 | 방랑 기사 | 96 | 24 | 0.36 | 36 | 3연 콤보 |
| 91 | 보물 악마 | 32 | 18 | 0.75 | 10 | 빠른 이동 |
| 92 | 거울의 사도 | 64 | 12 | 0.30 | 24 | 반사 |
| 93 | 상인 악마 | 16 | 0 | 0.60 | 5 | 비전투 |
| 94 | 사슬의 죄수 | 128 | 10 | 0.15 | 50 | 고HP/고포이즈 |
| 95 | 시간의 사도 | 64 | 18 | 0.15 | 18 | — |
| 96 | 탐욕의 사도 | 80 | 12 | 0.24 | 60 | 골드 탈취·성장 |
| 97 | 저주받은 쌍둥이 | 64 | 18 | 0.39 | 22 | 물리/마법 전환·부활 |
| 98 | 차원 균열체 | 48 | 18 | 0.30 | 18 | — |
| 99 | 죽음 그 자체 | 1600 | 60 | 0.24 | 999 | 최고 HP/포이즈 |

> **수치 SSOT = `game.html` `RARE_ETYPE`(`29441`).** 위 표는 2026-10-01 코드값과 동기화(base 템플릿, r 컬럼 제외). 이전 95~99 값(40/8/.45·56/14/.30·80/16/.36·48/16/.42·160/18/.30/60)은 stale였음. 90~94는 코드와 일치.

---

## 설계 원칙 (레퍼런스 요약)

1. **Anticipation → Attack → Recovery** 사이클 필수
2. 텔레그래프는 최소 15f(반응), 쾌적 20f+
3. 난이도 = 동시 위협 수 × 개별 위협 명확도. 혼란이 아닌 중첩으로 어렵게
4. 거리별 행동: 원거리→접근, 중거리→공전, 근거리→공격
5. 엘리트는 같은 FSM + 파라미터 변경으로 차별화

### 2026-09-07 공격링 누락 보정

| 경로/필드 | 현재 계약 |
|---|---|
| eShootWind 공격링 | 장식용 _eDecor(600px·히트스톱) 제한 없이 표시, alpha=1. 기존60f 대기 유지 |
| eProjAt / radialProjs | _emitEnemyShot(e,props) 경유. eShootWind 완료(st2≤0), _swChargeEl===props.el, 비무지개가 모두 맞을 때만 즉시 발사. 불일치는 실제 탄색으로60f 추가 예고 |
| _spawnBossProjectile | 일반/특수몹(!ib)의 적 이동탄(vx 또는 vy)은 같은 전조 경유. 보스 전용 패턴·정지 장판·friendly는 기존 경로 유지 |
| G._shotWarnings / e._shotWarning | 소유자·world(ens)·_gameFrame·el·blackBean이 모두 같은 탄만 링1개에 묶음. props 복사 후 대기. 다른 속성은 별도 링: r=(e.r 또는12)+동일 소유자/월드 기존 대기 링 수×8 |
| _tickEnemyShotWarnings(sp) | 투사체 업데이트 직전 감소. 60f 완료 시 shot._commit=true 후 원래 탄속·피해·탄종·방향으로 방출. 살아 있는 소유자 이동만큼 발사점 보정 |
| 예고 완료 생성 보장 | _emitEnemyShot의 일치한 eShootWind 즉시 방출도 props._commit=true. 즉시/대기 완료 모두 밀도1/3 드랍 면제, 기존 spawnProj 속도/피해 배율 유지 |
| 거리 이탈 | etype62 방전·86 폭발은 시작 d<100, 준비60f 유지. 완료 시 80+P.r 재검사 제거: 현재 플레이어 방향으로 각1발. 발사 전 스턴/빙결/사망 취소 규칙은 그대로 |
| 취소 | 살아 있던 소유자 사망·stunned>0·_frozen>0 또는 ens 참조 변경(스테이지 변경) 시 예약 제거 |
| 사망탄 | 요청 시 이미 죽은 소유자는 사망 위치에 링60f 후 방출. 원래 사망탄 효과 유지 |
| _drawEnemyShotWarnings | 적 본체 렌더 뒤, 탄막 렌더 앞에 프레임당 1회. 살아 있는 적의 _projChargeT 및 eShootWind와 대기 발사 큐를 함께 표시. 구울/슬라임 전용 렌더의 continue 및 장식 거리 제한과 독립, 본체 은신 투명도와 무관하게 alpha=1 |
| 일반 차징 색/진행 | normal+EL.P=#f4f4f4, black=_BEAN_RAINBOW[(_gameFrame>>2)%7], fire=#ff2e22, 그 외 _projChargeCol; 진행=1-_projChargeT/60 |
| 특수/큐 색/진행 | eShootWind: _swChargeEl===EL.P이면 #f4f4f4, 그 외 ELC[_swChargeEl??e.el] 또는 #f4f4f4; 진행=1-st2/60. 큐: 물리 비무지개=#f4f4f4, 무지개=_BEAN_RAINBOW[(_gameFrame>>2)%7], 나머지 요청 탄색 또는 #ff6644; 진행=1-w.t/60 |
| 특수 발사 속성 고정 | eShootWind의 eProjAt은 _beanRoll 재추첨 없이 요청 el/spd/sz/dmgMult를 사용하고 col=ELC[el] 또는 요청색. dmg=정수(e.atk×dmgMult), life=정수(요청 life×1.5), _commit=true. 글로벌 spawnProj 배율은 기존대로. 일반 발사 _beanRoll은 유지 |
| 2차 누락 원인/회귀 | 본체 전용 렌더 조기 continue가 기존 인라인 차징 링을 건너뜀. 인라인 중복 코드를 제거하고 공통 패스로 이동. enemyWarningOverlay.test.js에서 전용 본체·은신·사망·단일 호출 4건 검증; 기존 전조 포함 총17건 |
| 미변경 | 보스 전용 예고/연사 타이밍, 기존 idle60f, 패링, 탄막 외형, 피해, 속도, spawnProj 밀도 계약 |

검증: enemyShotWarning.test.js(일제사격60f, 완료 전조 중복 지연 없음, 취소, 사망탄, 장식 제한 분리), tmp/verify_enemy_shot_warning.py(실제 eProjAt 경로). 이 보정은 모든 보스 패턴의 별도 시각 QA 완료를 의미하지 않는다.


## 2026-09-16 거미줄탄 가시성 보완

| 대상 | 현행 표시 / 판정 |
|---|---|
| `etype13` / `web:true` | `EL.P` 흰 링 `#f4f4f4` 60틱 후 기존 원본 적갈색 뱀형 `_drawPhysMouth` 표시. 반투명 점/실 렌더 제거. 입력sz1.2→최종sz2.4, 표시 셀122.2452×61.1226px |
| 전투 규칙 | 패링 `forbidden`, 둔화90틱(1.5초), 속도·피해·충돌·수명 불변. 물리탄 부착 연출 대상 아님 |
| 상세 | [누락 원인·크기 공식·검증 범위](../8.0몬스터디자인/PHYSICAL_PROJECTILE_AUDIT_20260916.md#2026-09-16-흰-링-거미줄-점탄-누락-수정) |


## 2026-10-03 source8 특수 탄막 스턴·빙결 취소

| 경계 | 현재 처리 | 적용 위치 |
|---|---|---|
| 스턴·빙결 취소 분기 도달 | 일반 `_cancelProjCharge(e)` 뒤 `e.s==='eShootWind'`일 때 `_swFire=null`, `_swChargeEl=null`, `e.s='idle'`, `e.st2=0` | 양판 `updateE`의 기존2분기 |
| 정상·다른 상태 | 기존60f 특수 발사 완료/일반 차징 helper/피해·패링 유지; 다른 상태의 특수 필드를 새로 변경0 | [정확 변수·수치·검수 계약](SPECIAL_SHOT_CANCELLATION_20261003.md) |

앞선 `_hitStun>0` return은 기존 AI 스킵을 유지한다. 모든 피격경직에서 즉시 예약 취소된다고 확대하지 않는다. 해제 후 이전 특수 예약을 재개하지 않고 기존 idle AI가 새 행동을 결정한다.

## 2026-10-03 source9 생산 동기화 — windup 시각 계약·보스 소환 예외 회복

현재 핵심 수치 표의 `windup 8f (etype3:5f)`는 attack 전환 타이머를 windup 수치로 잘못 분류한 표현이어서 해당 행을 정정했다. 실제 상태 전환은 `case'windup': if(e.st2<=0){e.s='attack';e.st2=e.etype===3?5:8}`이며 일반 attack8f / etype3 attack5f를 설정한다. windup은 진입 경로별 `st2`이고 etype5=20f, etype10=10f 등 다른 etype·난수·phase 경로마다 다르다. `_telegraphT=20f`는 별도 타이머다. 이 정정은 문서 오류 동기화이며 타이머·피해·사거리·판정 코드 수치 변경이 아니다.

| 함수/상태 | 현재 정확 계약 | 구현 위치·예외 |
|---|---|---|
| `_enemyWindupRemaining` | `!e.ib`, alive, `s==='windup'`, 스턴·빙결·피격경직 제외; 유한 `st2`의 `max(0,st2)` 또는 0 | main18982 / easy18073. 읽기 전용 helper |
| ❗ 시각 판정 | `_enemyWindupRemaining(e)>0` | main52041 / easy50530. 기존 렌더 글꼴16·alpha0.9·`y-r-8`와 guard 유지 |
| `bossSummonWind` 전조 | 기존 55f | 기존 보스 상태표의 수치 유지 |
| `bossSummonWind` 회복 | 기존 `recover/70f`를 `finally`에서 보장 | main39450 / easy38252. 동일 예외 전파·부분 삽입 prefix 유지; 새 재시도/rollback 없음 |
| 전체 변경 | 양판 각각 +246B(시각 helper187B + 소환59B) | source8 함수 변경 밖 원문 완전 일치, inverse2exact·교환 결합 exact |

원 literal helper의 보스 표시 확대는 미채택했다. helper가 `!e.ib`를 보장하며 renderer의 기존 `_b3Active` continue를 전체 보스 guard로 설명하지 않는다. 공식 공동 검수46/46과 inline12JS+2JSON syntax PASS는 synthetic 의미·구문 범위이고 자연 보스·전체 AI/draw·픽셀·native/visual 검수 완료가 아니다. source9 앱 빌드·실행0. [생산 pin과 영수증](../CHANGELOG_SYNC.md)을 참조한다.


## 2026-10-03 source23 — 보스 착지·탄막 전조 범위 동기화

| 상태 / 적용 위치 | 현재 표시값 | 실제 판정·보존 경계 |
|---|---|---|
| `bossJump` 바닥 fill/stroke | `e.jumpX,e.jumpY` 중심 반경300px 고정. 이전30~60px 및 후보300×진행도는 미사용 | 착지 즉시 피해 `dst(P,e)<300`·atk×1.8·무적/돌진 예외 유지. 충돌 없는 경로에서 목표=실착지 중심. 벽막힘 시 실제 `e.x/e.y`와 목표의 기존 괴리는 미해결 |
| `bossFanWind` arc·오브 각도 | `π×(.7+e._bossPhase×.06)`, 페이즈0~4에서126/136.8/147.6/158.4/169.2도 | 실제 발사 `fanW`와 동일식. 방향 표시 길이 `120+stage×3`은 사거리 표시가 아님. 탄 수·RNG·피해·수명·유도 불변 |
| 검수 / 적용 | 양판 각각 draw3접점만 수정, 역치환 source22 byte-exact. 신규8 PASS(원본4 PASS/4 FAIL); 실제 분기·기존 회귀 포함12 PASS | canvas는 호출 기록 대역이며 native·화면·GPU·시각 최종 인수 아님. source23 앱3398 포장·타이틀·HTTP 확인; source22/3397 앱은 기존 코드 보존 |

상세 수치·실제 분기·한계·§23 보고는 [source23 전조 계약](../5.1임펙트디자인/CH1_BOSS_LANDING_FAN_TELEGRAPH_20261003.md)을 따른다. 피해·패링·타이밍·맵 geometry·카메라·기존 앱/세이브는 변경하지 않았다.


## 2026-10-03 source28 — 복귀 후 적 지속 피해 수명

| 상태 / 소비자 | 현재 계약 |
|---|---|
| `P.poison`, `_rbPoison`, `_rbBurn` / 일반 arena 및 열린 CH1 field retry | field 복원 분기의 기존 `_fieldRetry` 블록 뒤 세 상태만0/[] 정리. 본편/Easy 각44B. 이전 전투의 DOT가 iframes300 이후 다시 피해를 주는 경계 해소 |
| 정상 적 공격 | poison 감소sp*.02·mhp*.008 피해, rb t600f/tick30f/총량÷20/최대10중첩 유지. hurtP·producer·CC값·패링/QE·포이즈 코드 변경0 |
| 검증 | 실제 전체 retry/hurtP·DOT3분기·iframes 감소, 신규18(재도전12/현재 생애6control), 관련 생산89PASS. 전체 update/native 아님 |
| 보존 | arena 버프/1회부활 사용 상태와 나머지 디버프 보존. field46·적/시체·문·지역·loot·저장 스키마 불변 |

정확 분기·제외·대역과 원본 실패는 `docs/4.1맵디자인+설정/CH1-1_BOSS_RESPAWN_PROGRESS_20261002.md`의 source28 표를 따른다. ENEMY0452는 정적 원문 연동 인계였으며, 원총괄의 실제 함수 실행 근거와 구분한다.

기존 상태표 및 source9의 고정55f는 이전 표현이다. 현재 전조 metadata45f와 tele||55 fallback을 분리하고 기존 회복70f는 유지한다.

## 2026-10-08 bossSummonWind 실제 소환수 반경 위치 소비

작업 ID: `ROOT-DRUID-SUMMON-SAFE-POSITION-CONSUMER-20261008`. 본편 `game.html` 공통 소환 상태의 현재 계약이다. CH1 또는 URL opt-in 한정 기능으로 해석하지 않으며, easy판·다른 스폰 소비자 수정/검수를 뜻하지 않는다. 원 source9 및 기존 검수 원문은 해당 epoch의 이력으로 보존하고 아래 현재 계약을 우선한다.

| id / 적용 위치 | 현재 계약 | 보존·미인수 경계 |
|---|---|---|
| `bossSummonWind` 위치 보정 | mkEn이 반환한 실제 소환수 `ne.r`로 안전 위치를 검증하고 성공한 결과만 `ne.x/ne.y`에 반영 | 보스 자신의 반경으로 소환수 footprint를 대신하지 않음 |
| 검색 null | 좌표를 새로 대입하지 않고 mkEn 반환 좌표 보존 | 보스 좌표로 강제 fallback 없음. null에서도 안전 배치가 보장된다는 뜻은 아님 |
| FX | 기존 `ens.push` 뒤 최종 `ne.x/ne.y`를 사용 | 기존 삽입/효과 순서 유지 |
| 수량·전투 | 기존 `3+trunc(stage×.5)`, HP 절반·shield0 유지 | RNG/생성 인자·전투식·저장 변경0 |
| 예외·회복 | 기존 `finally`의 recover70f 유지 | mkEn null의 기존 `ne.hp` 예외와 부분 삽입 prefix·원 예외 전파를 새 rollback/retry로 변경하지 않음 |
| 전조 시간 | 기존 `tele || 55` fallback, 소환 metadata `tele=45` 구분 | 기존 문서의 고정55f는 이전 표현이며 모든 실제 소환 전조가55f라는 뜻으로 사용하지 않음. 타이머 수치 변경0 |
| 맵 권한 | 기존 map/isW/canMv/safePt/nav 소비 유지 | geometry·stageLOCK·scene·원PNG·collision/route 설계 변경0 |

| 근거 | 상태 |
|---|---|
| working game.html | 4114570B / `2639d248b63b748a2bdc2f33dbabe6c22afe353a599e7bdba80d9a1db589a050` |
| owned game.html | 4114385B / `9466d5bccc5b3799f71adee0af0f6f6240cacaf0ac88043f621b299797c6d19e` |
| 변경 | 2hunk/+110B. ROOT implementation receipt의 working/owned inverse exact; foreign185B 미채택 |
| CPU | 첫 Node는 하네스 G04의 닫는 괄호 누락으로 module parse 실패/제품 조건0·20미도달. 해당1문자만 새 파일에 보정한 최초 제품 suite1은 Node1/newFunction2/fixture32/VM0, 6그룹20PASS(동적18·정적2), FAIL/setup/미도달0·exit0. before 벽겹침 반례1은 별도이며21clean으로 합산하지 않음. 물리Node총2. 실mkEn/전체update/실맵/native/음향/save 검수 아님. |
| native/시각 | whole-map native NOT_RUN/미인수. 실제 보스 자연 도달·벽 인접 소환 화면·전체 route·GPU·청취·저장 인수 없음 |
| 판정 | 최소 본편 구현·통제 CPU 한정 검수 완료이며 이번 화면 NOT_ASSESSED / 전체 VISUAL RETOUCH. 옛 source9 검사와 합산하지 않음 |
| Git | ROOT 최종 completion 및 remote-preservation 영수증에서 소유 code/docs 정상 보존 여부를 확인한다 |

외부 근거: `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/ch1-druid-summon-safe-position-20261008/implementation-receipt.json`, `docs-search.json`, `docs-disposition.json`, `docs-sync-plan.json`. CPU 수치는 ROOT의 cpu-corrected-execution-receipt.json 기준이며 native/시각·청취·durable save로 승격하지 않는다.


## 2026-10-10 — 보스 유성 착탄24 본편 표시

bossMeteor의 기존 동작·전투값을 유지하며 착탄 표시 boss_meteor_hit(24장)을 새로 연결했다. [실제 producer·리소스·폴백·검수 정본](../5.1임펙트디자인/BOSS_METEOR_IMPACT24_ENGINE_20261010.md). 실제 전체 보스전·동시 성능 미인수, VISUAL RETOUCH.
