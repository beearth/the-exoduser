# DEMO11 — 1-1 다크드루이드 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 9820–9967, 16633–16712 | CH1 boss catalog/기술·phase 데이터의 최종 등록 집합. |
| 30749–30790 | arena/start anchor와 보스 전투 진입. |
| 37701–38442 | AI 선택/start, 근접/control의 시작 경계. |
| 40445–41183 | 상태 tick·phase·피해/사망 쪽 consumer. |
| 41921–42022, 43896 | clear/result와 demo 종료. |

대상은 si0 일반 다크드루이드다. si3 finale, 1-2 이후 보스, next chapter loader는 1-1 demo 범위 밖이다. phase ATK×1.3은 한 update에 쓰인 뒤 baseAtk로 reset되는 수명이므로 영구 누적으로 읽지 않는다.

## 호출 순서

`arena trigger → boss select/spawn → start/phase → AI score/telegraph → movement/melee/projectile/control → player hurt/parry → HP/poise/death → arena complete/clear → demoEnd`다. producer, actor 등록, projectile queue, 실제 damage, clear writer는 분리되어 있다.

## Godot origin/main 대응

`native_ch1_boss_{catalog,spawn_contract,utility,selector,phase,pattern_start,melee_states,control_states}.gd`는 존재(D23)하며 `main.gd:115–139`가 policy/actor snapshot/spawn seam을 제공한다. BC08/09 movement/projectile packet은 수락 branch에 있으나 main 미통합(D24), 실제 actor·피해·패링·death/arena clear는 D25 **통합 대기**다.

## 관련 docs

- `docs/8.1보스디자인바이블/`
- `docs/engine/FDG_SOURCE_TRACE_BOSS_CH1_20261020.md` §1, §4–5
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D23–D25

## 주의

전투 핵심·Q/E 보호 owner와 협의 없는 실제 damage writer 추가 금지. catalog/unit test 통과는 보스 실전/시각 PASS가 아니다. 새 맵 좌표는 원본 고정 site를 이식하지 않는다.
