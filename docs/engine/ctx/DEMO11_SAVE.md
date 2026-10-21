# DEMO11 — 저장·불러오기 context pack

## 원본 계약

| R 행 | 핵심 |
|---|---|
| 16714–16719, 29016–29031 | G/P 런타임 생성; 월드/적/탄/바닥 drop은 payload가 아니다. |
| 3533–3977 | DB collect/restore, `dbSaveNow` 500ms debounce, `dbSaveForce`도 최소5초 gate/pending. 이름이 즉시 write를 뜻하지 않는다. |
| 3603–3938 | player, skills/fused/active*, INV, progression 복원/legacy migration. |
| 61941–62213, 63884–64104 | demo test/new, local/web boot 분기. `_startDemoNew`는 restore 뒤에만 미로드 start 지급. |

P 좌표/행동/iframe/cooldown과 적·탄·zone runtime은 저장 whitelist 밖이다. INV는 item 고정 whitelist가 아니라 own enumerable 전체 JSON이며 `selected`는 복원 null이다. Q/E 필드·legacy migration·shared storage는 보호다.

## 호출 순서

`boot/slot identity → restore payload 검증/legacy migrate → P/G/INV/skills 적용 → initStage/자원 상태 → autosave 시작`이다. mutation caller는 debounce/force gate를 지나며, demo active-slot 교환은 index 쪽 전체 JSON opaque copy다.

## Godot origin/main 대응

`port_modules/save_adapter` 9개와 `source_save_lifecycle_owner`, slot reader/collector/restore primitive는 존재하나 gap D03/D30은 Main 자연 호출·제품 IO가 없다고 판정한다. `main.gd`는 fresh new-run 경계이며 QA session 파일을 제품 save로 취급하지 않는다.

## 관련 docs

- `docs/15 세이브+데이터구조/`
- `docs/engine/FDG_SOURCE_TRACE_SAVE_20261020.md`
- `docs/engine/FDG_SOURCE_TRACE_INVENTORY_20261020.md` S01–S10
- `docs/engine/DEMO11_COMPLETION_GAP_20261021.md` D02–D04, D30

## 주의

새 필드/형식/온라인 IO를 발명하지 않는다. PC/Mac 별 실제 실행·세이브 검증은 이 pack 범위 밖이며, 원본 restore primitive 존재를 1-1 이어하기 완료라고 보고하지 않는다.
