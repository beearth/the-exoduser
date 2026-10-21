# DEMO11 — 드랍·줍기·인벤토리·장착·affix context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 14364–15330 | `_AFSLOT`, `AFFIX_POOL`, `rollAffixes`; max `[0,2,3,5,6,7]`, prefix/suffix 교대, group 중복 금지. socketMul=`1+(clamp(q,1,100)-1)/99×(동일 grade?2:1)`. |
| 15894–16166 | `mkItem`; `itemLv=min(900,floor(P.lv/10)*10)`, `reqLv=max(0,itemLv-10)`, 새 장비 0홈. |
| 16174–16432 | INV 17 slot/BAG_MAX300, equip/unequip/pickup·stats refresh. `pickupItem`은 자동 장착하지 않는다. |
| 32002–32079 | `rollDrop` 및 몬스터 등급/레벨별 보상 RNG. |
| 49467–50340 | 비교·페이퍼돌·필터·가방 UI. |

장착은 old 좌표 전달→old bag push→equipped 치환→새 item bag 제거→stats→`dbSaveForce`; 해제/줍기도 실패 시 객체·bag을 원복한다. affix가 생성됐다고 모든 전투 consumer가 구현된 것은 아니다.

## 호출 순서

`적 death → rollDrop/journal → 바닥 record/render → 거리·입력·중복 gate → pickupItem → bag 좌표/음/안내 → save`다. 장착/해제는 선택 UI→유효성→INV mutation→캐시 무효화/applyStats→저장이다.

## Godot origin/main 대응

`native_normal_enemy_hurte.gd:691–760`, `kill_reward/drop_item_source.gd`, State drop bags가 생성/기록을 연결(D26). `native_world_drops` 및 Main/State 자연 INV 연결은 CHANGELOG DEMO11-21에 기록됐지만 gap snapshot의 D27과 충돌할 수 있으므로 현재 main caller를 재확인한다. `native_inventory_contract.gd`, layout, item/table/affix/currentINV reader는 있으나 일반 장착 transaction/UI는 D28 **미연결**이다.

## 관련 docs

- `docs/2_7 인벤토리+장비시스템/`, `docs/7아이템디자인/`
- `docs/engine/FDG_SOURCE_TRACE_INVENTORY_20261020.md`
- `docs/engine/FDG_SOURCE_TRACE_ITEMS_20261020.md`
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D26–D28

## 주의

INV/저장과 전투 stat consumer는 별 owner다. 17 slot 명칭, `shield` 문자열, item 전체 JSON, Q/E 비용/장비 효과를 임의 변경하지 않는다.
