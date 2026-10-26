# A04 시각 선택 화면 언어 라벨, 2026-10-27

## 출처와 구현

웹 기준 `origin/main` 고정 커밋 `d209075ec471176ca5224d4c21c4912a3e72ed0a`: `index.html` blob `31225ee77b9cd300fc96a8414bd73f6a43db43a4`, `lobby_i18n.js` blob `cf9abdba9487e1787948137e79b97df7dd19b724`, `localization-data.js` blob `f2a5ed4edf1d65a826706c050d25c8bb843d9c62`. `extract_visual_select_runtime.cjs`는 각 인라인 `_LOBBY_*` 객체를 실제 JavaScript 객체로 읽고, `_LOBBY_TABLES` 지정 → `_LOBBY_I18N` 병합 → `ms=lobbyMs` → `ui` 덮어쓰기 → 영어/원문 폴백 순서로 `_TL` 표시값을 계산했다. JA/ES의 인라인 객체 종료가 같은 줄에 있어도 균형 괄호로 추출하므로 앞 A04 오류를 반복하지 않는다.

웹 현행 `CHAR_VISUALS` 5개와 화면 제목·설명·플레이 방식·잠금 표시에서 문구 49키를 수집했다. Unity `NativeLobby.CharacterPresentation.cs`에 실제 존재하고 웹과 같은 한국어 키 42개만 `visual_select_labels.json`에 담았다. 29언어 × 42키 = **1,218개 표시값**이 원본 실행 순서와 정적 일치한다. 화면 제목/설명, 직업/이름/설명, 특성 제목·본문, 레일, 잠금 표시에서 `VisualSelectionLabel`을 사용하며 언어 전환 시 현재 언어의 42키를 한 번 캐시한다. 원본 한국어는 기존 문구를 유지하고 자산 누락 시 기존 한·영 폴백을 사용한다. 신규 번역 0건.

| 분류 | 결과 |
| --- | --- |
| 원본 일치 표시 키 | 42개 × 29언어, 1,218값. `a04-visual-select-static-qa.json` 정적 대조 |
| Unity에만 있는 키 | 6개. 해당 필드는 기존 한·영 표시 폴백 유지. `visual_select_content_diff.json` 참조 |
| 원본 콘텐츠 차이 | 헬거너 직업·설명·특성 2곳, 변성술사 직업·설명·특성 1곳, 합계 7곳. 원문 배열/캐릭터 내용 변경 0건 |
| 성능·스탯·슬롯·이름검증·세이브 | 변경 0건. 기존 `CharacterRoster` SHA-256 `9092D2DF1624A9EEE02E66FE667C5C3094E98106C24F83D09DE26B230914460F` |
| 이야기/캐릭터 선택 미디어 | 선택 조건·초기화·재생 경로 변경 0건. 캐릭터 설명 배열·특성 배열도 불변 |

현재 후보 파일 SHA-256: `NativeLobby.CharacterPresentation.cs` `A7F5F3548FE58A184A18F65E0F7BD998B31FBF6636738024B80E11E2D68462C5`, `visual_select_labels.json` `4383FE4CFBF4D612167FCA41BE710A46DD6C1C13A22C59734D8E4EDCB786AE3F`, `.meta` `8FD6D5D4F30E23078FAD889ECE152AAB20BD04E1B482E3EDA0BC60BD1B1E4072`. QA의 이전 삭제창 컴파일 종료·lease 해제 뒤 입력 SHA를 재확인해 이 두 파일만 E: 격리 후보에 적용했다.

이번 입력으로 Unity Editor 컴파일·Player 화면·29언어 줄넘침·글꼴·아랍어 방향·실입력을 아직 확인하지 않았다. 시각 판정 **HOLD**. 생성·삭제 대화상자와 제품/배포 완료의 근거로 사용하지 않는다.

`G:/exoduser/docs` 관련 키워드 검색을 수행했다. 공용 checkout의 타 팀 WIP와 docs 소유를 보존하기 위해 이 문서는 Unity 이식 문서 반영용 I: 초안으로 둔다.
