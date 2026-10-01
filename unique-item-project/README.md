# EXODUSER 고유아이템 모델·어픽스 밸런싱

22종 보라색 고유아이템의 원화, 고유 어픽스, 전투 밸런스를 한 흐름에서 검토하는 프로젝트다. 현재는 **설계·원화 비교 단계**이며 게임의 드롭·장착·효과는 구현되지 않았다.

| 문서·도구 | 역할 |
|---|---|
| [프로젝트 장부](../docs/7아이템디자인/고유아이템_모델_어픽스_밸런싱_프로젝트_20260930.md) | 품질 게이트, 22종 상태, TOP 8 계산, 조합 위험, 원화 판정 |
| [아이템 카탈로그](../docs/7아이템디자인/보라색_고유아이템_카탈로그_20260930.md) | 이름·형태·기존 원화와 Seedream 시안 이력 |
| [어픽스 설계 D절](../docs/7아이템디자인/유니크_어픽스_리스트.md) | 효과·롤 수치·저장 단위·코드 훅의 단일 원천 |
| [어픽스 공방](../affix-mini-project/) | 문서 기반 롤·행동 루프 설명용. 본게임 검증 아님. |
| [원화 후보](../assets/unique-items/) | `ui-xx.png` 기존안과 `ui-xx-seedream-candidate.png` 비교안 |
| [ITEM 팀 대장](../docs/7아이템디자인/ITEM_TEAM_MASTER.md) | 본인 작업 탭·22개 MagicLight ID·회수 결과·승인 백로그 |
| [게임 적용 계약](../docs/7아이템디자인/UNIQUE_ITEM_GAME_INTEGRATION_CONTRACT_20261001.md) | 원화 파생본 규격, `uniqueId`·드롭·세이브·UI 연결 경계 |
| [TOP 8 훅 검토](../docs/7아이템디자인/UNIQUE_TOP8_HOOK_REVIEW_20261001.md) | 현행 전투 코드의 출처·생명주기·중첩 위험과 실전 검수 조건 |
| [원화 비교 화면](review.html) / [파일 감사](audit-art.mjs) | 기존안·Seedream 후보의 64/160px 비교, 다운로드 SHA-256·규격·누락 검사 |

작업 순서: **형태/64px 검수 → 효과 계약·교차 조합 검토 → 동일 조건 실전 측정 → 드롭·세이브·번역 구현 → 실제 게임과 패키지 검수**. 한 게이트의 산출물만으로 다음 게이트 완료를 선언하지 않는다.

2026-10-01 기준: Seedream 비교 시안 UI-01~22 **전종 저장**. [추가 18종 생성 이력](../docs/7아이템디자인/SEEDREAM_UNIQUE_ART_BATCH_20261001.md)에 모델·작업 id·프롬프트를 기록했다. 모두 본게임/갤러리에는 미채택이며 최종 시각 판정 대기 중이다. `affix-mini-project`의 문서·계산 테스트 7개 통과; 실전 밸런스 검증은 아직 없다.

원화 회수 감사에서는 22개 MagicLight 작업 ID와 22개 다운로드 PNG의 SHA-256이 프로젝트 후보 파일과 모두 일치했다. 후보는 1920×1920 RGB이며 투명 배경이 없어 런타임용으로 바로 연결할 수 없다. 비교 화면에서 44장을 두 크기로 확인했고, 후보 전반의 64px 저조도와 UI-07·20·21의 형태 가독성 위험을 기록했다. 원화 채택은 0/22이며 22종 전용 외관·효과는 아직 게임에 연결되지 않았다.


## 고유아이템 정의 감사

`definitions.mjs`는 계약§3의22종 제안 데이터를 제공하며 기존 원화 감사에서도 사용한다. 게임 등록은 전종 비활성이다.

- `node unique-item-project/audit-definitions.mjs`: 정의·원문 대응 검증. 구조가 맞으면 exit0이며, 결과의 runtimeReady=false/activeDefinitions=0 및 차단 사유를 함께 확인한다.
- `node unique-item-project/audit-definitions.mjs --require-ready`: 실제 활성 준비가 안 되었으면 exit1. 현재22종 모두 미준비다.
- `node --test test/uniqueDefinitions.test.js test/uniqueDefinitionAudit.test.js`: 조회·기존 폴백·부정 등록·원문 변경 검출23검사.

이 검사는 실게임 플레이·아트 채택·효과 구현의 완료 판정이 아니다. 미등록 ID/기존 UNIQUE_SPECIAL/유골함은 활성 정의 조회에서 null로 반환되어 기존 경로를 유지한다.
