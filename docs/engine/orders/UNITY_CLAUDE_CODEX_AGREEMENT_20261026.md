# Unity 이식 업무협약 — Claude 총괄 ↔ Codex 총괄 (2026-10-26)

목표는 Unity 이식 100%다. 분모는 [UNITY_PORT_MASTER_20261026](../UNITY_PORT_MASTER_20261026.md)의 64행이다. 이 협약은 두 총괄이 같은 기준·같은 표·같은 주기로 일하기 위한 최소 규칙이다.

## 1. 기준

| 항목 | 합의 |
|---|---|
| UI·게임 시스템 | 웹(`game.html`·`index.html`) 그대로 이식 (사용자 2026-10-26 확정 "UI는 일단 그대로 이식하고"). 10-24 "디아블로식 중앙 HUD·양측 인벤토리"는 대체됨 |
| 맵·모션·이펙트 | 웹 구조 위에서 Unity 재제작 허용 (사용자 2026-10-24) |
| 정의 vs 상태 | 웹에서 추출한 데이터는 정의(이름·설명·아이콘·규칙)로만 사용. 장착·레벨·SP·자원 같은 상태는 Unity 실제 값을 읽고, 없으면 "미이식" 표시. 웹 값을 상태처럼 고정 표시 금지 |
| 진행 판정 | 마스터 보드 4단계(0 미착수 / 1 일부 / 2 웹동일 소스 / 3 실플레이 인수). 테스트 수로 진행률을 말하지 않음 |
| Unity 버전 | PC 6000.4.8f1 / Mac 6000.6.7f1 차이 존재. 통합본 기준 버전을 Codex가 확정해 이 문서에 기록. `ProjectSettings/ProjectVersion.txt` 변경 시 보고 |

## 2. 역할과 파일 소유

| 담당 | 범위 | 소유 파일 |
|---|---|---|
| Codex 총괄 (Mac) | 통합 브랜치 `codex/unity-mac-20261024` 소유·병합·Mac 빌드. A06 HUD, A15 설정, A18 첫 실습, 로비·인트로, 맵 조명, 전투 코어(B군) | `NativeGame*`, `NativeHud*`, `NativePauseMenu*`, `NativeLobby*`, `NativePractice*`, Simulation/Core 전투 |
| Claude 총괄 (PC) | 웹 창 UI 이식·Windows 빌드 검증. A07~A14, A20~A24 | `NativeInventory*`, `InventoryNavigation`, `NativePanelTabBar`, 스킬 창, 이후 능력치·대장간·크리스탈 창 |

- 상대 소유 파일은 직접 고치지 않는다. 필요한 변경은 `docs/engine/unity_patches/*.patch`로 넘기고, 받는 쪽이 적용한다.
- 같은 파일을 동시에 고칠 일이 생기면 먼저 이 문서에 소유 변경을 적는다.

## 3. 소통 경로

| 방향 | 경로 |
|---|---|
| PC → Mac | main `docs/engine/orders/PC_TO_MAC_INBOX_20261021.md` 맨 위 항목 (병합 요청·patch·결정 요청) |
| Mac → PC | `codex/unity-mac-20261024`의 `docs/engine/orders/WORK_BOARD.md` 현재 소유 블록에 처리 결과 기록 (병합 SHA·실패·거절 사유) |
| 공통 진행표 | `UNITY_PORT_MASTER_20261026.md`. 단위 완료 때 담당이 해당 행 상태를 갱신 |
| 방향 충돌 | 둘 중 누구도 단독으로 정하지 않고 사용자에게 질문. 결정은 이 문서 §5에 기록 |

## 4. 병합 주기

1. Codex는 작업 단위를 하나 마칠 때마다 INBOX 맨 위 항목을 확인한다. 미처리 요청을 쌓아 두지 않는다.
2. 병합은 `git merge`(rebase·force 금지). patch는 INBOX에 적힌 순서대로 적용한다.
3. 병합 후 Mac 빌드 errors 0을 확인하고, 그 SHA를 WORK_BOARD에 기록한다.
4. PC는 다음 단위를 최신 통합 SHA 위에서 시작한다.
5. 거절하거나 수정이 필요하면 사유를 WORK_BOARD에 적는다. PC가 그 사유를 받아 고친다.

## 5. 결정 기록

| 날짜 | 결정 | 근거 |
|---|---|---|
| 2026-10-26 | UI = 웹 그대로. 양측 도킹 대체 | 사용자 확정 |
| 2026-10-26 | 인벤토리를 열 때 선택 없음(웹 `openPanel`) | game.html:44052 |
| 2026-10-26 | G = 대장간, 장비/가방 칸 전환 키 삭제(웹은 게임패드 LB/RB 전용) | game.html:32122, 14141-14172 |
| 2026-10-26 | 일시정지 TAB = 인벤토리 전환, ESC = 웹 `_panelBack` 규칙 | 웹 키 규칙 |
| 2026-10-26 | 스킬 창 원판 = 웹 3D 정지 캡처, 회전·발광은 미이식 | 모션·이펙트는 Unity 재제작 원칙 |

## 6. 현재 미처리 요청 (2026-10-26 기준)

- INBOX "갱신 4": `claude/unity-pc-inventory-u04-20261026` `d5f32ff57` 병합. patch 6개를 순서대로 적용(U04B → U08 nativegame → U08 pausemenu → U05 → A07B nativegame → A07B pausemenu). PC 6000.4.8f1에서는 빌드 errors 0, 스모크 4종 통과. Mac 빌드는 미확인.
- 키보드 스모크는 A07B patch를 적용하기 전까지 실패한다(인벤토리를 열 때 선택 없음 변경 때문).
