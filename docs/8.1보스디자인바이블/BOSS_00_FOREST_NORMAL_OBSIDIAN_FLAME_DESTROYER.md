# BOSS_00_FOREST_NORMAL_OBSIDIAN_FLAME_DESTROYER - 통합 기획서 v1.0

작성일: 2026-05-09
런타임 대상: `si 0`, 1장 썩은 숲 1구역 보스
코드 위치: `game.html`
테스트: `test/stage1CodexBoss.test.js`

## 1. 보스 정체성

| 항목 | 값 |
|---|---|
| id | `stage1_codex_lava_warbringer` |
| 한글명 | 흑요염 파괴자 |
| 영문명 | Obsidian Flame Destroyer |
| 적용 위치 | `HELL_BOSSES[0][0]`, `STG[0].bn` |
| 장/구역 | 1장 썩은 숲 / 1구역 |
| 역할 | 첫 보스, 다크소울1식 전조 학습 보스 |
| 원소 | `EL.F` |
| 충돌 반지름 | 기존 si0 보스 공식을 유지 (`mkEn`, 보스 r 값) |
| 렌더 에셋 | `assets/sprites/boss/stage1_codex_lava_warbringer.png` |
| 원본 생성물 | `C:\Users\심도진\.codex\generated_images\019e0c65-7073-7eb3-a76e-4195cde3d7f3\ig_0dd5f8cf89d2f2740169ff34be60e88191beb6f7fbe2e1f961.png` |

## 2. 도입 의도

첫 보스는 복잡한 탄막보다 보스전의 기본 문법을 가르친다. 목표 품질은 다크소울 1 보스전 감각이다.

| 축 | 설계 |
|---|---|
| 읽기성 | 공격 전조를 길게 보여주고, 공격 방향을 명확히 고정 |
| 리스크 | 공격 중 방향 전환을 과하게 하지 않음 |
| 보상 | 강공격 후 후딜을 크게 남겨 플레이어가 반격 가능 |
| 압박 | 체력 저하 시 발광과 모션 강도를 높여 긴장감 증가 |
| 난이도 | 1스테이지 기준이므로 무브셋은 기존 `_BOSS_MOVESET[0]` 범위 안에서 유지 |

## 3. 무브셋

`_BOSS_MOVESET[0]` 값은 새 보스도 그대로 사용한다. 새 보스 추가를 위해 `BOSS_MOVES`, `BOSS_COMBOS`, `BOSS_PHASES`의 id 순서는 바꾸지 않는다.

| id | 용도 | 체감 |
|---|---|---|
| `slashCombo` | 기본 근접 연속 베기 | 검/손톱 위협 |
| `slam` | 느린 강타 | 후딜 반격 창 핵심 |
| `sweep` | 횡베기 | 근접 욕심 견제 |
| `charge`, `multiDash` | 직선 돌진 | 거리 유지 견제 |
| `jump` | 점프 압박 | 회피 타이밍 학습 |
| `lavaPools` | 화염 장판 | 신규 비주얼과 원소 정체성 연결 |
| `burst`, `shock`, `fan`, `elemBall`, `beanStorm` | 중거리 압박 | 탄막은 보조 역할 |
| `grab`, `spin`, `tideWave`, `groundFissure`, `poisonTrail`, `chaseAoe`, `rapidMissile` | 기존 공용 패턴 | 난이도 상승용 보조 패턴 |

## 4. 렌더/모션

정지 컨셉 PNG를 바로 게임에 넣기 위해 전용 2.5D 렌더러를 둔다.

| 코드 상수/함수 | 값/역할 |
|---|---|
| `STAGE1_CODEX_BOSS_SKIN` | `assets/sprites/boss/stage1_codex_lava_warbringer.png` |
| `_loadStage1CodexBoss()` | 전용 이미지 로더 |
| `_stage1CodexBossMotionKey(e)` | 보스 상태값을 모션 키로 변환 |
| `_drawStage1CodexBoss(X,e,sa,tdY)` | PNG 클립, 글로우, 스케일, 회전, 흔들림 렌더 |
| 렌더 우선순위 | `G.stage===0`일 때 외부 보스 아틀라스보다 먼저 그림 |

### 모션 테이블

| key | sx | sy | y | rot | glow | 사용 상태 |
|---|---:|---:|---:|---:|---:|---|
| `idle` | 1.00 | 1.00 | -6 | 0.00 | 0.25 | 대기, 호흡 |
| `walk` | 1.03 | 0.98 | -10 | 0.03 | 0.30 | 추적/접근 |
| `windup` | 1.08 | 0.94 | -18 | -0.08 | 0.45 | 전조, 조준, 홀드 |
| `slash` | 1.14 | 0.90 | -8 | 0.10 | 0.60 | 베기, 휩쓸기, 돌진 |
| `slam` | 1.18 | 0.86 | 12 | 0.06 | 0.75 | 내려찍기, 점프, 메테오류 |
| `hit` | 0.96 | 1.04 | -4 | -0.12 | 0.50 | 피격, 그로기 |
| `death` | 1.05 | 0.75 | 28 | 0.18 | 0.85 | 사망 |

## 5. 수치 동기화

| 항목 | 현재 코드값 |
|---|---|
| `HELL_BOSSES[0][0]` | `흑요염 파괴자` |
| `_EN['흑요염 파괴자']` | `Obsidian Flame Destroyer` |
| `STG[0].be` | `EL.F` |
| `_BOSS_MOVESET[0]` | 기존 si0 Set 유지 |
| `_BOSS_SFX[0]` | `boss_howl/0.7`, `death_boss/0.7`, `boss_hit/0.7`, `monster_hurt/0.7` |

## 6. 후속 제작 계획

| 단계 | 목표 |
|---|---|
| P0 | 현재 구현: 정지 컨셉 PNG + 절차적 2.5D 모션 |
| P1 | PixelLab 또는 스켈레탈 파이프라인으로 8방향 idle/walk/attack/hit/death 생성 |
| P2 | `atlas_bosses.png/json`에 `boss_0` 정식 편입 |
| P3 | 전용 SFX: 용암 갑주 발소리, 검 마찰, 내려찍기 충격음 추가 |

