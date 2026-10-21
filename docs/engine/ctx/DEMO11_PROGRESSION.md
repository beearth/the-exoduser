# DEMO11 — 레벨·XP·스탯 투자 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 29016–29031 | 신규 P: Lv1, EXP0, maxExp15, SP0/AP0. |
| 43103–43174 | 처치 XP → demo cap 검사 → level loop. 레벨마다 SP+3, 짝수 레벨 AP+1, 자원 20% 회복, 예약 패시브·저장. |
| 43137, 43148 | demo에서 `P.lv>=100`이면 `P.exp=min(P.exp,P.maxExp-1)`; loop도 같은 상한에서 break. |
| 51219–51260 | AP 투자/예약 패시브와 성장 UI 경계. |

XP가 cap 경계에 닿을 때와 이미 Lv100인 경우를 분리한다. 데모 cap을 Godot의 기존 Lv1000 gate로 대체하면 안 된다.

## 호출 순서

`적 사망 → kill reward/XP 계산(보너스 포함) → exp add → cap gate → while level-up → SP/AP·20% 자원 회복 → passive queue/연출 → 저장·HUD`다. 투자 UI는 받은 AP만 소비하며 스킬 SP와 섞이지 않는다.

## Godot origin/main 대응

`native_normal_enemy_hurte.gd`→`native_source_new_run_state.gd:523–557`, resource level-heal 및 HUD가 좁은 처치 XP/레벨업을 연결(gap D16)한다. `native_meta_exp_gate_policy.gd:7,28–49`와 point/passive queue는 있으나 State가 1000만 검사하며 cap100, AP 투자, queue, level SFX/save는 D17 **통합 대기**다.

## 관련 docs

- `docs/3.2메타·진행시스템/`
- `docs/14밸런스+수치테이블/`
- `docs/engine/FDG_SOURCE_TRACE_META_20261020.md` §2, §6–8
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D16–D17

## 주의

저장 형식과 실제 SP/AP writer는 보호 owner가 맡는다. cap/보상/회복을 새 정책으로 “개선”하지 말며, 전투·Q/E 자원과의 결합 변경은 PC 담당 범위다.
