# DEMO11 — 분노 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 29016–29031 | `mkP()`에 `rage:0`을 가진 신규 플레이어 생성. |
| 43103–43174 | 처치 XP·보상과 레벨업 순서; rage의 수입/소비는 개별 전투 caller도 재확인한다. |
| 44230–44274 | 슬롯 분류: 일반 0–3, rage 4, tech 5, ULT 별도. |
| 45418 이후 | 분노 발동군과 레슨 조건. |

분노는 일반 슬롯 4칸이나 Space 거대강타와 동치가 아니다. slot 4는 전용 분류이고, 실제 보유·선택·비용·상태 성공 후에만 효과/숙련으로 이어진다.

## 호출 순서

`전투/처치 등 공급자 → P.rage 갱신 → 입력/레슨 gate → 선택된 rage skill의 비용·상태 검사 → 성공 발동 → 쿨다운·HUD·SFX`다. 레슨의 분노1..7은 D09 halt에 묶일 수 있다.

## Godot origin/main 대응

`player.gd:479–523`은 `rage_slot` action을 알고 있으나 `space_rage_slot_not_connected`로 거절한다. (2026-10-22 PC-MOVE-SKILLS 브랜치: 이동 owner가 결합되면 방향+Space는 전격이동이 먼저 소비하고, Space 단독은 거절 대신 슬롯 owner `NativeSkillSlots`로 넘긴다 — 원본 G13284 순서. 분노 발동 자체는 여전히 미이식.) `main.gd:1689`도 자연 input consumer가 없다. gap D11은 미착수, 스킬 관리 D15는 Main/HUD 호출 0의 통합 대기다.

## 관련 docs

- `docs/engine/FDG_SOURCE_TRACE_SKILLS_20261020.md` §1.1, SK-S04/SK-S08
- `docs/engine/FDG_SOURCE_TRACE_META_20261020.md` §2–3
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D09, D11, D15

## 주의

전투 핵심/입력은 PC 담당이다. rage 공급량이나 slot 의미를 HUD 편의를 위해 새로 정의하지 않으며, 보호 Q/E와 active writer를 함께 바꾸지 않는다.
