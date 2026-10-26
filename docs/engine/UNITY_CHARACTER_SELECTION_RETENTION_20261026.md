# Unity 캐릭터 생성 재진입 선택 유지 — 2026-10-26

| 항목 | 웹 정본 | Unity 변경 |
|---|---|---|
| 첫 선택 | `index.html`의 `_pendingVisualIdx=0` | `characterVisual` 기본값 0 |
| 선택·취소·재진입 | 마지막 선택 화신 유지 | `OpenCharacterCreation`에서 `characterVisual=0;` 제거. `ChooseCharacterVisual`과 `CloseCharacterCreation`은 유지 |
| 잠긴 화신 | 생성 비활성 | 1~4 선택 시 생성 차단 유지 |

검수 시나리오: 새 캐릭터 → 실버테일(1) 선택 → 취소 → 새 캐릭터 → 선택과 생성 비활성 상태 확인 → 전사(0) 선택 → 생성 활성 확인. 이름 2~8자·5슬롯·기존 저장 계약은 변경하지 않았다.

원본 `NativeLobby.Characters.before.cs` SHA-256 `6fa52ef1a03e9bc875ae1c09a128eec5a483393c3a9f932cd6c1e565c9e9e938`, 수정본 SHA-256 `d3c28d07091beb2e6673ce82f52f14536c27570081a8dd02ef9b183824112c59`. 원본·패치 영수증은 `I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/ui-simple`에 있다. 정적 diff에서 지정한 한 문장 제거만 확인했다. Editor·Player 실제 화면, OS 입력, 저장 쓰기, 시각 품질은 미검증이다. 이 한 항목으로 마스터 보드 A04 전체 상태를 올리지 않는다.
