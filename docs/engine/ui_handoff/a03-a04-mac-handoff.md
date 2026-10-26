# PC Unity A03/A04 → Mac 최소 인수, 2026-10-27

> 저장소 배포본. `qa-contract/`와 `.patch` 이름은 PC 보관 영수증의 정확한 파일명이며 이 네 문서 커밋에는 로그·패치 원본을 포함하지 않는다. 저장소 내 기존 문서는 상대경로로 표시한다.


## 기준과 범위

- PC 검수 기준: `origin/codex/ui-resume-player-20261026` = `97227ceb7c4a33becd2fe55d4ab1712dc8013182` (`git ls-remote` 확인). 아래 인수 대상 12개와 제외 대상 `cin_title_logo.png`의 PC 격리 byte가 모두 이 커밋의 Git blob과 같다. 따라서 새 제품 코드나 중복 패키지는 만들지 않았다.
- Mac 현재 작업 트리의 실제 HEAD·INDEX·WORK와 사용자 작업 소유권을 먼저 확인한다. 이 문서는 **선별 이송 지침**이며 전체 브랜치 병합, 파일 전체 덮어쓰기, Player 검수 완료 선언이 아니다. Mac의 ar/ATG 언어 overlay, 누적 19패치, v2, build label, 우크라이나어 자막 글꼴 작업을 보존한다.
- 경로 기준: `unity/Assets/Exoduser/` 아래 상대 경로. 원본 delta는 PC 보관 영수증에 있으며 이 저장소 문서 커밋에는 포함하지 않는다. Delta 헤더는 제작 당시 절대 경로이므로 `git apply` 일괄 실행용으로 사용하지 말고 해당 함수/구역을 3-way 검토한다. Unity `.meta`는 필요한 신규 파일에 한해 GUID를 개별 확인한다. 기존 파일의 `.meta`를 교체하지 않는다. 특히 기존 아트 `title_logo.png.meta`, `enter_art.png.meta`, `brand_logo.png.meta`는 PC 격리 소스/원격 사이에도 **GUID 동일·byte 상이**하므로 Mac의 importer 설정을 보존한다([독립 감사](./a03-a04-mac-handoff-audit.md)).

## 실제 적용 순서

| 순서 | 적용 구역과 기존 delta | 신규 파일/주의 |
| --- | --- | --- |
| 1 A01 타이틀 | `NativeLobby.cs`: `NativeLobby.gate-source-correction.patch` 뒤 `NativeLobby.applied-web-matte-correction.patch`의 게이트 텍스처 선택과 alpha 처리 구역만 이송. 로비에는 `brand_logo`, 시작 게이트에는 matte 보정된 `title_logo`/`enter_art`. | `Resources/Art/lobby/title_logo.png`, `enter_art.png`, `brand_logo.png` 중 Mac에 없는 byte만 이송. **기존 아트 `.meta` 3개는 교체 제외**; Mac GUID/importer 설정을 먼저 확인. 미사용·불투명한 `cin_title_logo.png`와 구형 `NativeLobby.lobby-logo-only.patch` 제외. |
| 2 A03 패치노트 | `NativeLobby.cs`의 `NativeLobby.patchnotes.patch` 관련 최소 연결; 신규 `NativeLobby.PatchNotes.cs`는 `NativeLobby.PatchNotes.new.patch`를 참조하고 Mac 동명 파일 유무 확인. 이후 `NativeLobby.PatchNotes.localized-labels.patch`의 29언어 제목/버튼 구역만 반영. | `Resources/Data/patch_notes.json` (0.7.5/0.7.0 본문), `patch_notes_labels.json` 및 신규 파일 `.meta`. Mac의 누적 19패치·build label 표시/분기와 release 정보 소스가 겹칠 수 있으므로 웹 본문 버전과 Mac 표시 조건을 별도 확인. |
| 3 A04 생성 | `NativeLobby.Characters.a04.patch`의 생성 대화상자 로컬라이즈/포커스 구역만 이송. Mac `NativeLobby.cs`의 ar overlay/언어 갱신 함수는 보존. | `Resources/Data/character_dialog_labels.json`과 `.meta` (29언어 × 14키 = 406). |
| 4 A04 삭제 | `NativeLobby.CharacterDelete.a04.patch`의 삭제 확인 레이아웃/언어/기본 취소/방향키 구역만 이송. `RequestCharacterDelete` 및 `ConfirmCharacterDelete` 저장 처리 본문은 현행 Mac 소스를 유지. | 3번의 공통 `character_dialog_labels.json` 재사용, 중복 복사 없음. |
| 5 A04 시각 선택 | `NativeLobby.CharacterPresentation.a04.patch` 뒤 `NativeLobby.CharacterPresentation.visual-locale.patch`의 UI 표시와 42키 로컬라이즈 구역만 이송. Mac ar overlay·v2·ATG/19패치가 이 파일의 표시 문구·분기를 바꿨을 수 있으므로 함수 단위 수동 대조. 기존 시각 선택 키보드 패치가 Mac에 없다면 `NativeLobby.CharacterPresentation.visual-keyboard.patch`와 `NativeLobby.Characters.visual-keyboard.patch`의 실제 필요 부분만 선행 확인. | `Resources/Data/visual_select_labels.json`과 `.meta` (29언어 × 42키 = 1,218). |

`NativeLobby.cs`, `NativeLobby.CharacterPresentation.cs`는 특히 충돌 접점이다. A01/A03 연결만 추출해 Mac의 현재 파일에 이식하고, Mac의 Arabic overlay/ATG·누적 19패치·build label 조건을 읽은 뒤 컴파일한다. 최신 Mac GUI 또는 빌드가 PC 체크포인트와 동일하다는 근거는 없다.

## 원격 기준 모듈·리소스 해시

SHA-256은 PC 격리 후보의 실제 파일, Git blob 동일성은 `97227ceb`의 대응 경로를 `git hash-object`/`git rev-parse`로 대조했다. Mac에 이미 동일 blob이 있으면 재적용하지 않는다.

| 파일 (`Runtime/` 또는 `Resources/`) | SHA-256 |
| --- | --- |
| `Runtime/NativeLobby.cs` | `5276DDEA831B001EB6DBF79D896207AC36E89E7CB5EC814358B0FE2DF2BA929E` |
| `Runtime/NativeLobby.Characters.cs` | `AC46FAFC5A48B5123B0DBAFA5E560249AE42B8AF714E0AF291C6D708EB2DA7D6` |
| `Runtime/NativeLobby.CharacterPresentation.cs` | `A7F5F3548FE58A184A18F65E0F7BD998B31FBF6636738024B80E11E2D68462C5` |
| `Runtime/NativeLobby.CharacterDelete.cs` | `0EAE97E9E56D1C8342D79FD50792C92BA8E8B4BDDDF9E27C6B0B00D5D7E138B6` |
| `Runtime/NativeLobby.PatchNotes.cs` | `3148635121EA37F2BA973A8DC699C6F95512C7CF4C15E73DF6FA5D4E3C6485AC` |
| `Resources/Data/patch_notes.json` | `E4EAC388FEE4D9030B5A7731B74C0BB14E5075256570FC35ED3E9B52EA1D8962` |
| `Resources/Data/patch_notes_labels.json` | `BBEA905B33655A42FDA06BEFC572A55122BD25C8FCBC826AD2110C2CDCB41E85` |
| `Resources/Data/character_dialog_labels.json` | `423A56890251E126FE73E8E167FC1DCE72EBCDC73FB973DC97702F31E217A9D8` |
| `Resources/Data/visual_select_labels.json` | `4383FE4CFBF4D612167FCA41BE710A46DD6C1C13A22C59734D8E4EDCB786AE3F` |
| `Resources/Art/lobby/title_logo.png` | `92CA6EEA0C1840BF6E0EB8E30BD7E9EB96052796101F2E121488FED587D81541` |
| `Resources/Art/lobby/enter_art.png` | `2EB185DA4D4987381F313D969239AF380CBF9E245645AEA3D7701A35C7B99F37` |
| `Resources/Art/lobby/brand_logo.png` | `DFFAD452CFFA7AAF074FF80D2FBB9258858FDEF1CBDE750E8B07F3F3B264EFBD` |

`cin_title_logo.png`는 원격에 있지만 인수 목록에서 제외한다. 위 전체 파일 SHA는 선별 이식 후 Mac 파일의 동일 SHA 목표가 아니다. Mac 고유 변경을 보존한 결과 파일은 별도 SHA로 기록한다.

## 콘텐츠 7곳 예외: 적용 보류

웹 고정 원본은 `main`의 `d209075ec471176ca5224d4c21c4912a3e72ed0a`, `index.html` 3199–3237행 `CHAR_VISUALS`. 9월 [선택 화면 초안](<../../3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md>)보다 최신인 2026-10-24 사용자 캐릭터 디자인 지시를 우선한다. 그 원문을 담은 PC untracked WIP 문서는 이 인수 커밋에 포함하지 않는다. Mac에서는 사용자 지시의 원문과 소유권을 별도로 확인해야 한다. 상세 화면 출처와 49키 후보 검증은 같은 PC 보관 폴더의 `a04-content-parity-hold.md/json`에 있다.

| 예외 | 웹 9월 표시 → Unity 현행 | 최신 근거 |
| --- | --- | --- |
| 헬거너 직업 | 창포수 → 혈월 사수 | 디자인 lock 33, 86–87행: 성인 여성 사수·리볼버형 라이플 |
| 헬거너 설명 | 혈월의 창포수 → 혈월의 사수 | 디자인 lock 87행 설명문 |
| 헬거너 특성 제목 | 관통 창격 → 관통 사격 | 디자인 lock 33, 86행 라이플 코어 |
| 헬거너 특성 본문 | 창포로 꿰뚫음 → 리볼버형 라이플로 꿰뚫음 | 디자인 lock 33, 86행 라이플 코어 |
| 변성술사 직업 | 사신 → 변성술사 | 디자인 lock 98–99행, 기본 활/다형태 |
| 변성술사 설명 | 청염의 낫 → 활·낫·창·검 변성 | 디자인 lock 98–99행 설명문 |
| 변성술사 특성 본문 | 낫 강화 → 청염 무기 강화 | 디자인 lock 98행 낫 대표 무기 금지 |

따라서 `NativeLobby.CharacterPresentation.content-parity.HOLD.patch`, `visual_select_labels.content-parity.HOLD.patch`와 후보 전체 파일은 **적용하지 않는다**. 새 번역은 작성하지 않았다. 현행 42키의 원문/번역과 7곳 콘텐츠 정본화는 별도 웹·Unity 소유 조정이 필요하다.

## 검수 경계와 Mac 완료 조건

- PC: 최종 A03 29×3 라벨은 `qa-contract/patchnote-label-comparison.json`의 87/87, 해당 입력 Unity Editor import·컴파일 exit 0/errors 0은 **`qa-contract/a03-labels-compile.json`**. 기존 `patchnotes-compile.json`은 이전 모듈 SHA `B0D51076…`의 영수증이므로 최종 다국어 모듈에 사용하지 않는다.
- PC: 교정 완료 A04 생성·삭제 29×14 라벨은 `qa-contract/a04-dialog-label-comparison.json`의 406/406, 해당 입력 import·컴파일 exit 0/errors 0은 **`qa-contract/a04-delete-compile.json`**. 시각 선택 29×42 라벨은 `qa-contract/a04-visual-label-comparison.json`의 1,218/1,218, 해당 입력 import·컴파일 exit 0/errors 0은 **`qa-contract/a04-visual-compile.json`**. 최초 A04 후보의 영수증을 교정·시각 선택에 전용하지 않는다. 원격 관련 문서: [A03 패치노트](../UNITY_LOBBY_PATCH_NOTES_LABELS_20261026.md), [A04 대화상자](../UNITY_CHARACTER_DIALOG_LABELS_20261026.md), [A04 시각 선택](../UNITY_VISUAL_SELECT_LABELS_20261027.md) 및 `97227ceb` QA 기록. A01 matte는 `gate-matte-compare.json`의 웹 표시 RGBA 대조.
- PC 실제 Unity Player 화면·입력·저장 IO는 검수되지 않았다. Mac에도 컴파일 PASS를 GUI/Player PASS로 승격하지 않는다.
- Mac 이식자는 각 단계에서 HEAD/INDEX/WORK와 소유권을 확인하고, 기존 구역과 겹치면 최소 hunk 통합 → 신규 `.meta` GUID 확인 → 29언어·버전/빌드 label 원문 확인 → Unity C#9/Roslyn 컴파일 → 실제 Editor/Player 화면·입력·삭제 저장 흐름 QA를 각각 기록한다. 관련 docs 전체 검색·동기화와 자신의 변경만 commit/push/원격 SHA 검증한다.

## PC 인수 문서 freeze

2026-10-27: QA 독립 감사 `qa-contract/a03-a04-mac-handoff-audit.md/json`의 12개 본문 파일·3개 기존 아트 `.meta` 분류와 최종 입력별 컴파일 영수증 정정을 반영했다. 이 PC 보관 인수 문서는 **문서 인계 기준으로 freeze**한다. 제품/source 변경 0, 공유 PC 체크아웃/원격 main 통합 0, Mac 적용 0. 다음 지원은 Mac 담당이 현행 소스를 대조하면서 제기하는 **필요한 최소 hunk 질문**에 한정한다. 새 코드·콘텐츠 후보를 이 문서 freeze에 끼워 넣지 않는다.
