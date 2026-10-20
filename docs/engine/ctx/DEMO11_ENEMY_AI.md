# DEMO11 — 적 생성·AI tick·처치 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 30969–31025 | `HELL_SPAWN[0]` 31항목 중 opening 제외 4로 데모 normal pool 29 etype. chapter 이름으로 etype47 등을 제거하지 않는다. |
| 31033–31167 | hell0 natural magic3%/rare0/champion0, tier1 M29/M30 우선; 문지기/호위 강제 경로는 별도. |
| 31120 이후, 42110 이후 | 적 생성/피격/사망 consumer. |
| 31608–31655, 35648–35694 | spawn hole rollEtype, 지역 귀속·정화/분모/배너. |
| 32002–32079, 43103–43116 | death→drop/XP/보상 journal. |

초기 고정16은 검증 표본이지 1-1 적 분모가 아니다. 레어 90–99는 room/field 조건부 path이며 기본 hole에 무조건 넣지 않는다.

## 호출 순서

`map spawn anchor/region → hole rollEtype → factory/admission → AI tick/movement/attack → hurtE/hurtP → death once → drop·XP·kill/region count → HUD/clear gate`다. actor 등록 없는 pure catalog나 modifier를 full AI라 부르지 않는다.

## Godot origin/main 대응

`world.gd:3037–3057`→factory, `player.gd:1031–1045`가 일부 초기 profile/hurt를 연결(D18); `native_spawn_hole_system.gd`, `native_regions.gd`가 etype0 hole/region 좁은 경계를 연결(D20). P2-008b의 11 candidate는 미검수·미병합이고 D19은 통합 대기다. M29/M30 modules도 natural pipeline 미연결(D21)이다.

## 관련 docs

- `docs/8.0몬스터디자인/`, `docs/9적ai패턴디자인/`
- `docs/engine/FDG_SOURCE_TRACE_CH1_ENEMIES_20261020.md`
- `docs/engine/FDG_SOURCE_TRACE_ELITES_20261020.md`
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D18–D21

## 주의

새 맵의 anchor/flow/region interface만 요청한다. 전투 core, Q/E, map 디자인·배치 및 conditional rare admission은 PC/맵 owner 협의 없이 확대하지 않는다.
