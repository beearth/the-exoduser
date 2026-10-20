# DEMO11 — 이동·대시·사슬 context pack

## 원본 계약

| R `game.html` 행 | 핵심 |
|---|---|
| 6254 이후, 12028 이후 | 입력→플레이어 이동/일반 충돌/기본 공격 수명. `Player`의 Godot 이동은 이 좁은 기본 경로만 연결됨. |
| 12881 이후 | 사슬·돌진·전격이동의 전투/레슨 조건. 단순 Space `giantSlam`과 원본 사슬/이동기를 같은 기능으로 취급하지 않는다. |
| 32108–32132, 32730 | update 전반 early gate 및 전투 timer 순서. 이동기 비용/취소를 임의로 process 끝에 붙이지 않는다. |
| 45418 이후 | 분노/이동 스킬의 후속 발동군. |

원본은 입력 lock, 상태, 자원, 충돌, 피해/레슨을 한 tick 안에 얽는다. 대시는 별도 애니메이션만이 아니라 취소·무적·자원·현재 state를 소비하므로 “속도 증가”로 축약 금지다.

## 호출 순서

`입력 snapshot → lesson/상태 gate → 이동/충돌 → 공격·스킬 요청 → update timer/자원 → HUD/효과` 순이다. 사슬과 전격이동은 레슨 D09에서 halt될 수 있고, 성공한 스킬만 숙련/쿨다운 단계로 넘긴다.

## Godot origin/main 대응

`godot/scripts/player.gd`의 `_physics_process` 계열 이동·공격과 `main.gd:1456–1510` 기본 전투는 연결되어 있다. 그러나 `main.gd:1689` 입력 snapshot은 사슬/돌진/전격이동을 제공하지 않고, gap D11은 **미착수**다. `native_parry_lesson_flow.gd`는 step0/8만 실제 연결이며 D09 전체 레슨은 통합 대기다.

## 관련 docs

- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D09–D11
- `docs/engine/FDG_SOURCE_TRACE_SKILLS_20261020.md` §1, §4 SK-S08
- `docs/2_3 돌진+패링+방패시스템/` (보호)

## 주의

PC 담당 전투 핵심 및 2_3의 Q/E·돌진 소비/판정은 수정·재해석하지 않는다. Godot의 Space 거대강타가 존재해도 사슬/대시 이식 완료 증거가 아니다.
