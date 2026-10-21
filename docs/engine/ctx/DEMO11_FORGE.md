# DEMO11 — 대장간·분해·소켓 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 16381–16397 | `dropItem`은 바닥 투기가 아니라 단건 분해: 1초 gate, fav 거절, salvage 검증→mats→splice→`dbSaveNow`. |
| 15286–15330, 15775–15827 | crystal/stone bag, attach/detach, 최대5홈 open, 높은 q만 upgrade; crystal은 보존하고 `socketQ`만 교체. |
| 28080–28085, 50690–50707 | 물약 강화: reqLv=`(lv+1)*100`, 비용 `3,5,8,10,13,15,18,20,23,25`, max10. |
| 43508 이후, 49760 이후 | 장비 강화/전승/비교는 경제·표시·실제 commit을 분리해 읽는다. |

새 장비 자연 socket은 rarity와 무관하게 0이며, 자연 1–4홈 roll로 되돌리지 않는다. `socketMul`의 같은 **grade** 판정과 공명 raw `q>1` 판정도 다르다.

## 호출 순서

forge UI 선택→비용/레벨/소유 gate→정확한 bag entry 소비 또는 mutation→applyStats→저장→재렌더/SFX다. 분해는 `dropItem`의 이름만 보고 floor-drop flow와 합치지 않는다.

## Godot origin/main 대응

`main.gd:18,88`의 `native_forge_panel.gd`는 존재하나 gap/TRACE META에서 장비 강화·전승·분해 경제 전부의 제품 연결을 미이식으로 본다. inventory의 stone mutation/UI도 일반 장착과 마찬가지로 owner 미연결이다.

## 관련 docs

- `docs/2_7 인벤토리+장비시스템/`, `docs/7아이템디자인/`
- `docs/engine/FDG_SOURCE_TRACE_INVENTORY_20261020.md` C08, C23–C25
- `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` §1, §3
- `docs/engine/FDG_SOURCE_TRACE_QUICKSLOT_20261020.md` QS-06

## 주의

경제와 저장은 보호다. forge panel이 preload됐다는 사실로 결제/RNG/저장까지 완료라 하지 말고, 전투 stat/QE 공식도 강화 UI에서 바꾸지 않는다.
