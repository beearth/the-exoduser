# DEMO11 — 플레이어 사망·부활 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 29022 | P `shield,mshield,shieldRegenT` 초기 0. |
| 27902–27963, 28768 | `mshield=~~(100+s.int*5+bonusShield합+eqAffix(shieldFlat))`; 14 slot bonusShield 합산. |
| 31180–31185 | 적 death/revive iframe·eShield/revive point 초기. |
| 43721–43865 | player fallen/확률 부활/사망 UI와 재시작/로비 흐름. |
| 63453–63530 | retry: EXP30% 차감→stage/boss 분기→idle/iframe300→applyStats→HP/MP/ST/shield refill→save. |

부활 장비는 `reviveOnce` armor 값>0, `revivePow/reviveCd` demon bracelet/passive 등과 연결되지만 데이터 선언만으로 max shield/흡수 식에 모든 ID를 더하지 않는다.

## 호출 순서

`hurt → shield/HP/poise 처리 → HP0 → fallen/revive eligibility·chance → 성공 회복/iframe 또는 death UI → retry/lobby → stage init/resource refill/save`다. 전투 중 enemy revive와 player revive는 다른 state/수명이다.

## Godot origin/main 대응

`player.gd:1031–1045`는 HP0 terminal dead만 소비하며 주석상 full fallen/revival은 부재다. `native_death_fx_adapter.gd`는 `world.gd:945–951`의 시각 adapter일 뿐 lifecycle writer가 아니다. gap D31은 **통합 대기**다.

## 관련 docs

- `docs/2_5 부활+에너지쉴드시스템/`
- `docs/engine/FDG_SOURCE_TRACE_REVIVE_SHIELD_20261020.md` §1, §3–4
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D31

## 주의

저장 형식·Q/E·실드 소비는 보호다. terminal dead, death FX, derived shield reader의 존재를 부활 완료로 확대하지 말고, 새 전투 상태를 저장 payload에 넣지 않는다.
