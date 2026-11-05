# 캐릭터 동작 파이프라인 (2026-11-05)

브리프: `docs/0마스터플랜/worklog/cloud-lanes/BRIEF_MOTION_PIPELINE_20261105.md`. 현재는 Mac이 §1 기준과 §3 현재 값만 채웠고, 나머지 절은 클라우드 MO 세션 조사와 Mac 실습 뒤에 채운다.

## §1 현황·채점

[MO_BASELINE_20261105.md](MO_BASELINE/MO_BASELINE_20261105.md): 스프라이트·rigpixel 두 경로의 영상과 채점.

## §3 타이밍 표 (현재 Core 값, `unity/main` `a1ee5666c`)

60틱 = 1초. 기본 공격은 프리뷰 진입 상태에서 측정했고, 새 캐릭터 경로의 무기 값은 확인하지 않았다.

| 동작 | 구간 | 틱 | 시간 | 출처 |
|---|---|---|---|---|
| 기본 공격 1타 | 예비 (`wWindup`) | **0** | 0ms | 기본 공격은 이 상태를 거치지 않음. `wWindup`은 기검 충전 경로뿐 (`Simulation.cs:112`, `:121`) |
| | 휘두름 (`wSwing`) | **5** | 83ms | `Simulation.cs:116`, `:130` |
| | 접점 (`HitArc`) | `StateTicks`가 3을 지날 때 | | `Simulation.cs:136` |
| | 검기 생성 (`SpawnKiSlash`) | 휘두름 시작 때 | | `Simulation.cs:131` |
| | 회복 (`wRecover`) | **34** (측정) | 567ms | `(int)(16/(WeaponSpeed × AttackSpeedMultiplier))`, `Simulation.cs:139` |
| | 합계 | **39** | 650ms | `motion-log.csv` 5회 반복 동일 |
| 이동 | 속도 | 2.72px/틱 (측정) | 163px/초 | `motion-log.csv`. 첫 틱부터 전속력 |
| 이동 | 루트 이동 | 공격 중 0 | | `motion-log.csv` (x 4200.00 고정) |

구르기, 피격, 사망은 재지 않았다.

## D-MO-2 Core 제안 — 사용자 결정 대기

기본 공격 1타에 `wWindup` N틱을 추가한다. Core 수치 변경이라 결정 전에는 적용하지 않고, 채점표 예비동작은 "Core 제약"으로 표기한다.

| N | 입력→휘두름 지연 | 총 길이 유지 시 회복 | 총 길이 안 맞출 때 합계 |
|---|---|---|---|
| 4 | 67ms | 30틱 | 43틱 (717ms) |
| 6 | 100ms | 28틱 | 45틱 (750ms) |
| 8 | 133ms | 26틱 | 47틱 (783ms) |

위 표의 회복·합계는 현재 측정값 34틱과 5틱에서 계산했다. 공격 판정 시점이 늦어지므로 전투 손맛과 밸런스가 달라진다. 이 영향은 측정하지 않았다.
