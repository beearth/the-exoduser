# Unity 캐릭터 생성 이름 오류 문구 동기화 — 2026-10-26

| 오류 | 웹·번역 정본 | Unity 이번 인수 |
|---|---|---|
| 이름 길이 | `이름은 2~8자여야 합니다.` / `Name must be 2-8 characters.` | `CharacterError.NameLength`의 영어 문구만 일치시킴 |
| 금지 문자 | `특수문자는 사용할 수 없습니다.` / `Special characters cannot be used.` | `CharacterError.Forbidden`의 한·영 문구를 일치시킴 |

정본은 `index.html`의 생성창 번역과 `docs/16번역·로컬라이제이션/번역대상_전체목록.md` 1639~1640·1949~1950행이다. `docs` 전체에서 두 한글 문구를 검색해 기존 표의 값과 대조했다. 기존 화신 선택 유지 수정과 이름 2~8자 검사, 금지 문자 집합, 중복·슬롯·저장 계약은 변경하지 않았다. 웹 화면의 입력 허용만으로 서버 저장 규칙을 바꾸지 않는다.

I: 고정 스냅샷 `ui-simple/NativeLobby.Characters.snapshot-after-three-edits.cs` SHA-256 `8bdea8cf1adb52fb872caed95cdb673ef5d83984381e1419b17580df0068e90c`를 인수했다. 원격 직전 코드와의 차이는 위 문구 두 줄뿐이다. 이후 E: focus 관련 WIP는 이 커밋 범위가 아니다. UI 문구 자체는 정적 대조만 했으며 Editor·Player에서 두 오류를 띄워 보지 않았다. 기존 QA Player의 OS 입력 확인은 언어 선택, 창 밖 클릭, Esc, 생성 비주얼→이름→취소·재진입까지이고 이름 오류 2개나 캐릭터 저장 확인이 아니다. 원본 OS 입력 영수증은 `I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/os-input-player-review.md`에 있다.
