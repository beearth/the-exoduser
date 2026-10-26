# Unity 화신 선택창 키보드 후보 — 2026-10-26

| 입력 | 웹 정본 | Unity 이번 후보 |
|---|---|---|
| 첫 초점 | 마지막 선택 화신 아이콘 | 생성창 첫 유효 Repaint에서 선택 아이콘으로 초점 |
| Tab·Shift+Tab | 정보 좌·우→아이콘 0~4→취소→활성 생성 순환 | 같은 이름의 컨트롤을 순환하고 잠긴 화신의 생성은 제외 |
| Enter·Space | 아이콘은 선택·미리보기, 취소는 닫기, 활성 생성은 이름 단계 | 초점 컨트롤에 따라 같은 분기 |
| 방향·Home·End | 아이콘 초점에서만 선택·초점 이동 | 아이콘 초점에서만 이동 |

웹 근거는 `index.html` 화신 선택 키 처리와 `docs/3.1 ui hud 디자인/캐릭터선택_리모델링_기획서.md`의 Tab·정보 영역·외형 아이콘 계약이다. `docs` 전체에서 화신·Tab/Space·초점 키워드를 검색했다. 이전 생성 카드 focus 복귀, ESC·IME 조합 차단·입력 fence, 1~4 잠금·전사만 생성, 이름 2~8자·5슬롯·저장·스토리와 마우스 버튼 경로를 유지한다. RTL 좌우 반전은 이 후보 범위가 아니다.

I: 고정 스냅샷 `ui-simple/NativeLobby.Characters.snapshot-after-visual-keyboard.cs` SHA-256 `c09330cfe409567f61ad961f3e4df157666fd8106e4e3437425c626240150b5f`, `NativeLobby.CharacterPresentation.snapshot-after-visual-keyboard.cs` SHA-256 `ae7674d960b34c76d4c0429d8db9f0561527b2bd942b6ea722e6ddb5083460c2`만 인수했다. 각 before 파일은 원격 직전 코드와 byte 동일하며 독립 patch로 범위를 확인했다. `NativeLobby.cs`와 타 제품 파일은 이번 커밋 대상이 아니다. **컴파일·Editor·Player·실키보드 검증은 아직 없으며 구현 후보의 PASS를 주장하지 않는다.** QA는 Tab/Shift+Tab 순서, 잠금 때 생성 제외, 아이콘 Enter/Space의 미리보기 전용, 생성/취소, 화신 유지, 키 홀드 fence를 별도 빌드에서 확인해야 한다.
