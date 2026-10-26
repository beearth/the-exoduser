# A04 캐릭터 생성 대화상자 원본 다국어 라벨 후보 — 2026-10-26

## 소스와 변경 범위

웹 원격 `main` 고정 SHA `d209075ec471176ca5224d4c21c4912a3e72ed0a`의 `index.html`(`31225ee77b9cd300fc96a8414bd73f6a43db43a4`), `lobby_i18n.js`(`cf9abdba9487e1787948137e79b97df7dd19b724`), `localization-data.js`(`f2a5ed4edf1d65a826706c050d25c8bb843d9c62`)에서 로비 문구를 추출했다. 인라인 로비 테이블→추가 언어 병합→`ms` 테이블→`ui` 덮어쓰기→영어 폴백을 적용했다. 29언어×14키=**406개 원본 표시값**과 Unity 후보 JSON이 정적으로 일치한다. `ja`/`es`의 `취소`·`확인`은 웹 원본의 영어 폴백이며 새 번역을 만들지 않았다.

| 경계 | Unity 후보 | 적용·보류 |
|---|---|---|
| 이름 대화상자 제목·설명·이름 라벨, 취소·생성, 비주얼 잠금 문구 | `NativeLobby.CharacterPresentation.cs`와 `Resources/Data/character_dialog_labels.json` | 해당 UI 라벨을 현재 언어 원본값으로 조회. 이름 placeholder는 웹 `#charName`에 없어 추가하지 않음 |
| 이름 길이·금지문자·중복·5슬롯 오류 | `NativeLobby.Characters.cs`의 `CharacterError` 라벨 조회 | 검증 순서·조건·`CharacterRoster`·저장 경로는 불변. 웹 demo 경로와 중복→포화 우선순위 정적 일치 |
| 삭제 질문·확인/취소 | 새 JSON에는 원본 데이터 준비 | `NativeLobby.CharacterDelete.cs`는 이번 소유 범위 밖으로 **미수정**. 웹은 이름+질문 한 문장, Unity는 이름 별도 행이며 현재 `삭제`/`취소 · ESC` 문구라 삭제 동작 parity 미완료 |

## 고정 입력과 검수

| 경로 | SHA-256 |
|---|---|
| `unity/Assets/Exoduser/Runtime/NativeLobby.Characters.cs` | `AC46FAFC5A48B5123B0DBAFA5E560249AE42B8AF714E0AF291C6D708EB2DA7D6` |
| `unity/Assets/Exoduser/Runtime/NativeLobby.CharacterPresentation.cs` | `0FB90A57EECE13EE0FE4F189C7798D3366BE90180FAB9109491F09FEFF712B1E` |
| `unity/Assets/Exoduser/Resources/Data/character_dialog_labels.json` | `8B37800F0CC9F235FE72920A5619FD6176806B092F1F713D9E6AA52AD6BCACA1` |
| `unity/Assets/Exoduser/Resources/Data/character_dialog_labels.json.meta` | `8A07ADBA72CAD700877415D41E95A81909B3AE37948D9525C137A5C427D03F3F` |

I: `ui-simple/a04-character-dialog-static-qa.json`에서 위 네 파일과 메인 `NativeLobby.cs` SHA `5276DDEA…`, `NativeLobby.CharacterDelete.cs` SHA `8780F3D7…`, `CharacterRoster.cs` SHA `9092D2DF…` 불변을 확인했다. A03 Editor lease 해제 후 두 C# 및 JSON/meta만 E: 격리 프로젝트에 적용했다. 이 A04 후보의 **Unity import·컴파일, 제품 Player 빌드, 실제 생성 화면·언어 전환·입력·시각 품질은 미검증/HOLD**다. 특히 아랍어 방향과 글꼴, 긴 라벨의 358px 제목/라벨 영역 넘침은 실화면 QA가 필요하다.

관련 `docs/engine` 및 `docs/3.1 ui hud 디자인`에서 캐릭터 생성·삭제·이름·슬롯 키워드를 검색했다. 더 상세한 웹·Unity 차이와 삭제 확인창 보류는 I: `ui-simple/a04-character-dialog-readonly.md`, QA 입력 해시는 `ui-simple/a04-character-dialog-qa-handoff.md`에 있다. 공유 G:의 타 팀 WIP·INDEX·세이브는 수정하지 않는다.
