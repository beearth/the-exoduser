# A03 로비 패치노트 패널 — Unity 이식 문서 초안

2026-10-26. 기준 웹 정본은 원격 `main` SHA `83a99ba5c7d7c2a68d88bf809d8f32770d4f7884`의 `index.html`, `patch-notes.js`, `release-version.json`이다. 공유 `G:/exoduser` 체크아웃의 `index.html`과 `patch-notes.js`는 별도의 dirty/WIP 상태이며 본 후보의 콘텐츠 출처가 아니다. 원격 release version은 `0.7.5`/`2026-10-20`이고, 원격 패치노트 데이터는 `0.7.5`, `0.7.0` 2개 항목이다. 현재 공유 작업본의 `0.7.7`은 섞지 않았다.

| 항목 | 웹 정본 계약 | Unity 후보 |
|---|---|
| 열기 | `#lobbyVerOverlay` 클릭, 초점 상태 Enter/Space | 좌상단 버전 표시의 클릭, 초점 상태 Enter/Space |
| 본문 | `window.EXODUSER_PATCH_NOTES` 정적 배열, KO는 KO·그 외 언어는 EN | 동일 배열을 손대지 않고 `Resources/Data/patch_notes.json`의 `notes`에 감싸 로드, 같은 언어 폴백 |
| 표시 | 최신 버전 우선, `v버전 · YYYYMMDD`, 섹션·항목, 스크롤 | 동일 순서와 항목, 스크롤 뷰 |
| 닫기 | 버튼, 배경, Esc, 이전 초점 복귀 | 버튼, 패널 밖, Esc, 이전 초점 복귀 예약 |
| 모달 | 열릴 때 닫기 초점, 뒤의 로비 조작 차단 | 닫기 초점, 뒤의 로비 GUI 조작 차단 |
| 빈 데이터 | 현지화된 빈 상태 | KO/EN 빈 상태 |

원격 `patch-notes.js` 추출본은 `patch-notes.remote-main.js`에 보관했고, JSON 본문은 문자 단위로 동일함을 확인했다. 웹 CSS의 흑철 반투명·금빛 테두리·뼈색 본문·붉은 섹션 위계를 IMGUI 색상과 간격으로 옮겼다. CSS 폰트나 새 폰트는 생성하지 않았다. Unity 후보는 독립 오프라인 로비이므로 실제 온라인/데모 패키지 상태를 주장하는 표시는 추가하지 않았다.

`G:/exoduser/docs` 전체에서 `patch.?notes|패치.?노트` 검색. 관련 정본은 `docs/13출시·마케팅/STEAM_UPDATE_RULES.md` §7.2, `docs/16번역·로컬라이제이션/번역대상_전체목록.md` 4010행대, `docs/engine/FDG_SOURCE_TRACE_LOBBY_20261020.md`, `docs/engine/UNITY_PORT_MASTER_20261026.md` A03이다. 공유 docs와 금지 소유 파일은 수정하지 않았다. 통합 시 A03 행에 패치노트 패널 이식 후보·QA 단계·원격 출처를 구별해 반영한다.

QA 인계: Unity Editor 스크립트 컴파일, 실제 Player에서 버전 표시 클릭·Enter/Space, 긴 항목 스크롤, KO/EN 폴백, 닫기 버튼·바깥 클릭·Esc, 닫힌 뒤 이전 초점과 로비 단축키, 작은 화면 스케일을 확인해야 한다. 이 세션에서는 Editor/Player를 실행하지 않아 컴파일·실입력·시각 품질 판정은 미확인이다. 기존 화신 키보드 후보의 별도 컴파일 영수증은 이 패널의 증거가 아니다.

보관물: 수정 전 `NativeLobby.before-patchnotes.cs`, 수정 후 `NativeLobby.snapshot-after-patchnotes.cs`, 신규 `NativeLobby.PatchNotes.snapshot.cs`, `patch_notes.snapshot.json`, `NativeLobby.patchnotes.patch`, `NativeLobby.PatchNotes.new.patch`, `patch_notes.new.patch`. 수정 전 `NativeLobby.cs` SHA-256 `C3BC6793C64D7ADA58734DB455CB55D447AEA4FA579C09D1C8FB672D7036E778`; 수정 후 `5276DDEA831B001EB6DBF79D896207AC36E89E7CB5EC814358B0FE2DF2BA929E`; 신규 partial `B0D51076F85FAD08D3C42856C44C28460F21283A5B3E94BBD8117F9BF7BF8690`; 데이터 `E4EAC388FEE4D9030B5A7731B74C0BB14E5075256570FC35ED3E9B52EA1D8962`. 기존 Characters와 CharacterPresentation 해시는 앞 후보 영수증과 동일하다. `git diff --no-index --check`는 수정 파일과 신규 partial에서 공백 경고 없이 통과했다.
