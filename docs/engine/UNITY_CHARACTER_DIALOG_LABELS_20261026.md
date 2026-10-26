# A04 캐릭터 생성 대화상자 원본 다국어 라벨 후보 — 2026-10-26

## 소스와 변경 범위

웹 원격 `main` 고정 SHA `d209075ec471176ca5224d4c21c4912a3e72ed0a`의 `index.html`(`31225ee77b9cd300fc96a8414bd73f6a43db43a4`), `lobby_i18n.js`(`cf9abdba9487e1787948137e79b97df7dd19b724`), `localization-data.js`(`f2a5ed4edf1d65a826706c050d25c8bb843d9c62`)에서 로비 문구를 추출했다. 인라인 로비 테이블→추가 언어 병합→`ms` 테이블→`ui` 덮어쓰기→영어 폴백을 적용했다. 29언어×14키=406개 표시값을 대상으로 한 최초 후보 검토는 정적 일치로 기록했으나, QA가 실제 웹 병합 경로에서 독립 추출한 기준표와 비교한 결과 **402개 일치·4개 차이**다. `ja`의 `취소`/`확인`은 웹에서 `キャンセル`/`確認`, `es`는 `Cancelar`/`Confirmar`로 표시되지만 이 Unity JSON에는 모두 영어 `Cancel`/`Confirm`이 들어 있다. 이 네 값의 후보 수정·재검수 전까지 다국어 원문 parity는 HOLD다.

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

I: `ui-simple/a04-character-dialog-static-qa.json`에서 위 네 파일과 메인 `NativeLobby.cs` SHA `5276DDEA…`, `NativeLobby.CharacterDelete.cs` SHA `8780F3D7…`, `CharacterRoster.cs` SHA `9092D2DF…` 불변을 확인했다. A03 Editor lease 해제 후 두 C# 및 JSON/meta만 E: 격리 프로젝트에 적용했다. 이 A04 후보는 아래 QA 영수증으로 Unity import·컴파일 오류 0을 확인했다. **제품 Player 빌드, 실제 생성 화면·언어 전환·입력·시각 품질은 미검증/HOLD**다. 특히 아랍어 방향과 글꼴, 긴 라벨의 358px 제목/라벨 영역 넘침은 실화면 QA가 필요하다.

관련 `docs/engine` 및 `docs/3.1 ui hud 디자인`에서 캐릭터 생성·삭제·이름·슬롯 키워드를 검색했다. 더 상세한 웹·Unity 차이와 삭제 확인창 보류는 I: `ui-simple/a04-character-dialog-readonly.md`, QA 입력 해시는 `ui-simple/a04-character-dialog-qa-handoff.md`에 있다. 공유 G:의 타 팀 WIP·INDEX·세이브는 수정하지 않는다.

## 2026-10-27 A04 독립 QA 정정·컴파일 영수증

- I: `qa-contract/a04-dialog-label-comparison.json`: 고정 웹 `d209075ec…`의 실제 언어 병합/폴백 경로와 JSON SHA-256 `8B37800F…`를 비교했다. 29언어×14키=406값 중 402개 일치, 4개 차이(`ja.cancel`, `ja.confirm`, `es.cancel`, `es.confirm`). 최초 후보의 406개 일치 표기는 이 독립 결과로 정정한다.
- I: `qa-contract/a04-dialog-compile.json` 및 `a04-dialog-compile-editor.log`: 원격 후보 `a1541cdd5…`의 두 C#·JSON/meta 입력 해시를 전후 대조했다. Unity 6000.6.7f1 배치 import·컴파일 종료 코드 0, 컴파일 오류 0, JSON `TextScriptImporter` 확인, Runtime C# 77개 실행 중 변경 0이다. 이 검수는 네 라벨 차이를 해소하지 않는다.
- Editor lease 해제는 QA 담당 보고 기준이다. Player 빌드·실GUI/실입력·시각 검수는 0이며 삭제 확인창은 별도 범위다.

## 2026-10-27 삭제 확인창 표시·4개 라벨 교정 후보

| 항목 | 웹 기준·이번 후보 | 변경 경계 |
|---|---|---|
| 삭제 질문 | 선택한 이름 + `deleteSuffix`를 한 문장으로 표시 | `NativeLobby.CharacterDelete.cs` 표시 |
| 버튼 | 왼쪽 `confirm`/오른쪽 `cancel`, 기본 초점 취소 | 기존 최종 삭제·닫기 함수 연결, Tab/좌우 선택 |
| 중앙 창 | 기존 780×420 초상화·설명 행에서 466×230 질문·두 버튼으로 변경 | 시각 검수 전 후보 |
| `ja` 라벨 | `cancel=キャンセル`, `confirm=確認` | JSON 두 값만 웹 현행값으로 교정 |
| `es` 라벨 | `cancel=Cancelar`, `confirm=Confirmar` | JSON 두 값만 웹 현행값으로 교정 |

고정 웹 소스 `d209075ec…`의 실제 병합/폴백 경로에 대해 UI 담당 재추출 결과 29언어×14키=406/406값 일치다(`I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/ui-simple/a04-character-delete-static-qa.json`). 앞선 독립 QA 402/406은 **수정 전** JSON SHA `8B37800F…`의 결과이고, 이번 JSON SHA `423A5689…`는 수정 후 별도 입력이다. 삭제창 C# SHA `0EAE97E9…`; `RequestCharacterDelete`·`ConfirmCharacterDelete`의 대상 슬롯/이름 검증과 `TryRemove`/`CommitCharacters` 본문은 불변. 생성 C#·roster·저장 경로도 이번 후보에서 불변이다. 웹의 비동기 중복 방지·온라인 삭제 응답·이전 DOM 초점 복귀는 이 Unity 표시 수정의 동등 구현 판정에 넣지 않는다.

이번 고정 입력의 **Editor import·컴파일 0회, Player 빌드/실GUI/실입력 0회**, 시각 판정 HOLD다. 이전 A04 배치 컴파일 0오류는 수정 전 JSON·삭제창 C#에만 적용한다. 다음 QA는 두 새 입력의 해시 대조 후 단독 import·컴파일 및 안전한 격리 데이터에서 실제 취소/확인·키보드/마우스·29언어 긴 문구/아랍어 배치를 검수한다.
