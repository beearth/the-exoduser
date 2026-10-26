# DEMO11 — `_DEMO_MODE`·`_BIC`·`_DEMO_LV_CAP` context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 16645–16650 | `_BIC=location.search.includes('bic')`; `_DEMO_MODE=(window.EXODUSER_BUILD_TARGET||'demo')==='demo'`; `_DEMO_LV_CAP=100`; last stage=0 및 banned affix/fuse gate. bic query만으로 full/demo target을 바꾸지 않는다. |
| 43137,43148 | XP cap100 clamp/break. |
| 43896 | stage0 clear 시 demoEnd을 열고 `G.on=false`, stage1을 만들지 않는다. |
| 44608–44629 | demo allowed fusion 22 key, 금지10. |
| 61935–62219,63884–63892 | demo test/new와 `_dLv500` 개발 branch; BIC도 정상 신규 Lv1/cinematic. |
| 63663,63681 | stage clear demo end 및 lobby return URL. |

정상 1-1은 char0/Lv1/stage0부터다. dev test, boss test, MAP_QA, 강제 cutscene, 개발 재화, Lv500은 데모 필수가 아니다.

## 호출 순서

`lobby build target/slot → demo new/restore → policy stage0 검증 → gameplay → XP/fuse/item gates → stage clear → demoEnd/lobby`다. local demo slot copy는 전체 save JSON opaque transport이며 온라인 계정/API를 필수로 추가하지 않는다.

## Godot origin/main 대응

`native_demo11_authority.gd`와 `main.gd:4,114–158,205–207`이 demo manifest/stage0 boot를 좁게 강제한다. gap D01은 실행 권위/1000 cap conflict 때문에 통합 결정 대기이며, lobby/slot/restore D02–D03도 미연결 또는 module-only다.

## 관련 docs

- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` §1, D01–D04, D32
- `docs/engine/FDG_SOURCE_TRACE_SKILLS_20261020.md` demo gate
- `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md` DEMO

## 주의

query, BIC, build target, dev test를 하나의 boolean으로 합치지 않는다. main에 있는 policy object를 실제 demo lobby/save/end-to-end completion으로 표시하지 않는다.
