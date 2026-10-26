# A04 신규 외형 전사 이야기 분기 후보 — 2026-10-27

## 소스와 범위

- 웹 정본: `origin/main` `a7b4dcf9657f75723e5b85a35ea51ce89e5632f0`, `index.html` blob `31225ee77b9cd300fc96a8414bd73f6a43db43a4`. `_afterCharacterCreated(name,visualIdx)`는 외형 0만 이야기를 재생해 입장하고, 1–4는 목록을 다시 읽고 로비에 남는다.
- 디자인 확인: `G:/exoduser/docs/11내러티브·로어디자인/NEW_HEROES_DESIGN_LOCK.md` SHA256 `CA87D0FADD96472473AD105A39292CC234A1B19E6594EA85105005F70725BB3C`; 신규 총기 스토리/캐릭터 ID/외형 채택은 확정되지 않았다. 전사 영상의 대상은 `docs/cinematic/WARINTRO_CREATION_RUNTIME_20260910.md` SHA256 `E1F113727642C18AF87B65AA7325FAD42071FC1B510D0F4481AC22D46503EBFC`.
- 소유 변경: E: `unity/Assets/Exoduser/Runtime/NativeLobby.Characters.cs`의 `CreateCharacter()` 이야기 호출 조건 한 곳. 수정 전 SHA256 `AC46FAFC5A48B5123B0DBAFA5E560249AE42B8AF714E0AF291C6D708EB2DA7D6`, 수정 후 `2A614EA20FBE3302BFA6479B1CA589D2D4124EB6D9AE04953D74E316ADD8BD22`. 수정 전 동일 바이트 사본 `NativeLobby.Characters.before.cs`, 정확한 1줄 diff `NativeLobby.Characters.patch` SHA256 `6BAF95B110C8EB09E9AFB3D18788E1A051150B6424D1291890CC370392DC5F23`.
- E: `NativeLobby.CharacterStory.cs`, `Core/CharacterRoster.cs`, 저장·로그인·캐릭터 배열·미디어·Resources와 다른 Runtime 파일은 변경하지 않았다. G: 공용 WIP는 읽기만 했다. E: Runtime/Resources는 이 후보 뒤 동결한다.

## 성공 후 분기표

| 외형 인덱스 | 웹 성공 후 | E: 후보 성공 후 | 현재 일반 UI 도달성 |
| --- | --- | --- | --- |
| 0 전사 | 전사 이야기 → 캐릭터 gate | 전사 이야기 → 기존 `BeginCharacterEntry(true)` | 허용 |
| 1 실버테일 | 캐릭터 목록 재조회 → 로비 | 모달 닫기 → 로비, 자동 이야기·입장 0 | `ConfirmCharacterVisual`와 `CharacterRoster.Validate`에서 잠김 |
| 2 헬거너 | 위와 같음 | 위와 같음 | 잠김 |
| 3 트랜스뮤터 | 위와 같음 | 위와 같음 | 잠김 |
| 4 창마법사 | 위와 같음 | 위와 같음 | 잠김 |

E:는 로컬 `CommitCharacters`가 이미 로스터를 갱신하므로 웹의 목록 API 재조회와 동일 동작이라고 주장하지 않는다. 잠금 해제, 새 이야기, 웹 온라인 경로, 실제 GUI 검수는 이 후보 범위가 아니다.

## 검수와 checkpoint 인계

- `story-route-check.cjs`는 **E: 실제 `CreateCharacter()` 메서드**를 `ExtractedCreate.cs`에 추출한다. 독립 .NET harness는 성공 시 외형 0 이야기/입장 1회, 외형 1–4 이야기/입장 0회와 로비 유지, 실패 시 이야기/입장 0회를 검사한다. 성공 가능한 비전사 로스터 stub을 사용해 미래 잠금 해제 시 호출 분기를 검증한다. 현재 제품의 `CharacterRoster`는 1–4를 거절하므로 그 경로가 실기에서 통과했다고 주장하지 않는다.
- 수정 전 RED: 외형 0 PASS, 외형 1에서 story/entry 1/1로 실패. 수정 후 GREEN: 외형 0–4 및 실패 생성 6/6 PASS. Unity Editor 컴파일/Player 시각·키·마우스 검수는 0회.
- **checkpoint 요청 원문:** `E:/exoduser-runtime/codex-ui-resume-20261026/unity/Assets/Exoduser/Runtime/NativeLobby.Characters.cs`의 SHA256 `2A614EA20FBE3302BFA6479B1CA589D2D4124EB6D9AE04953D74E316ADD8BD22`를 A04 이야기 분기 후보로 경로 한정 checkpoint해 주세요. `NativeLobby.Characters.patch`의 한 줄만 인수하고, 외형 0 정상 이야기 유지·외형 1–4 오재생/자동입장 0·생성 후 로비 경로를 독립 컴파일/GUI에서 확인해 주세요. 신규 외형 잠금, 로그인/API, 배열, save, 영상, 다른 Runtime/Resources는 변경하지 마세요. 이 후보를 전체 프런트 parity 또는 Player PASS로 보고하지 마세요.`

관련 읽기 전용 인수표는 I: `ui-simple/frontend-screen-role-contract.md`의 표 3이다. 이번 체크포인트의 제품 후보는 이 소스 한 줄과 본 문서뿐이다. 코드 변경 관련 docs 검색은 `rg -l 'warrior_story|전사 이야기|캐릭터 스토리|대검전사 생성' G:/exoduser/docs -g '*.md'`로 수행했으며 공용 G: 문서는 타 작업 WIP 보호 때문에 직접 수정하지 않았다.
