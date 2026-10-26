# Unity 생성창 취소 후 생성 카드 초점 복귀 — 2026-10-26

| 항목 | 웹 정본 | Unity 후보 |
|---|---|---|
| 화신·이름창 취소 | `index.html`은 생성 카드로 초점 복귀 | 생성 1·2단계 취소 때 1회 복귀 예약 |
| 로비 카드 | 새 캐릭터 버튼이 재진입 대상 | `DrawLobby`의 버튼에 `character-create-card` 이름을 지정하고 유효한 Repaint에서만 1회 초점 |
| 키 재진입 | 생성 카드의 Enter·Space 활성화 | 카드가 초점일 때 Enter·KeypadEnter·Space로 생성창 열기. 기존 입력 fence 유지 |

관련 웹·docs는 `docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md`의 취소 초점 복귀·이름창 취소 절과 `docs/engine/UNITY_PORT_MASTER_20261026.md` A04다. `docs` 전체에서 생성 카드·초점 복귀·캐릭터 생성 키워드를 검색했다. 성공 생성 뒤 복귀 예약은 지우고 이야기 진행을 유지한다. 삭제 단계는 복귀 예약을 하지 않는다. 5슬롯·쓰기 불가·언어 메뉴·종료 확인 때 초점 강탈을 피한다. 이전 화신 선택 유지 및 이름 오류 문구 변경은 그대로다.

I: `ui-simple/NativeLobby.Characters.snapshot-after-focus.cs`(SHA-256 `de0b8b8f76554c50c71a39f54495a9570ad79fa9b4b238f6cd17bd47424168b4`)와 `NativeLobby.snapshot-after-focus.cs`(SHA-256 `c3bc6793c64d7ada58734db455cb55d447aea4fa579c09d1c8fb672d7036e778`)의 고정 후보만 인수했다. 각 `before-focus` 파일 및 독립 patch와 대조했고 해당 두 파일 외 제품 변경은 포함하지 않았다. **정적 diff만 확인했으며 컴파일·Player 실화면·실키보드 동작은 미검증**이다. 검수 기준은 빈 슬롯에서 선택창/이름창 각각 취소→카드 초점→키를 놓고 Enter/Space 재진입, 잠긴 화신 상태 보존, 비활성 카드의 초점 비강탈이다.
