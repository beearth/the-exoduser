# A01 입장 전 타이틀의 웹 알파 변환과 Unity 자산 대응 — 2026-10-26

## 현재 구현 계약

| 항목 | 웹 기준 | Unity 최종 고정 후보 |
|---|---|---|
| 화면 역할 | `index.html`의 입장 전 `#cinClickPrompt .cin-title-art`·`.cin-enter-art`; `#chapterGate #chGateImg`와 별개 | `NativeLobby.DrawGate()` / `LobbyPage.Title`. 로비 우측은 별도 `brand` |
| 타이틀 픽셀 | `output/imagegen/exoduser-hell-lord-logo-api-v1.png` 원본 SHA-256 `185ABB93942EA45A21DCC2D80564E44E1895AFA14127D4EAC110FAEB979A85BA`. `cin-logo-art.js`가 RGB의 최대 채널값 `light`로 `alpha=round(255×clamp((light−8)/24,0,1))`을 계산한 뒤 화면에 표시 | `logo=Art("title_logo")` → `Resources/Art/lobby/title_logo.png` SHA-256 `92CA6EEA0C1840BF6E0EB8E30BDD7E9EB96052796101F2E121488FED587D81541`. 웹 변환 뒤 RGBA 전체 픽셀 비교 0차이 |
| ENTER 픽셀 | `output/imagegen/enter-gothic-api-v1.png` 원본 SHA-256 `BE2C63ADA445A92BD99E16EF412C496C4C8F6747097417B545D4F4F91876C0E7`, 같은 스크립트 변환 | `enterArt=Art("enter_art")` → `enter_art.png` SHA-256 `2EB185DA4D4987381F313D969239AF380CBF9E245645AEA3D7701A35C7B99F37`. 웹 변환 뒤 RGBA 전체 픽셀 비교 0차이 |
| 로비/후속 챕터 로고 | `img/logo_exoduser.png` SHA-256 `DFFAD452CFFA7AAF074FF80D2FBB9258858FDEF1CBDE750E8B07F3F3B264EFBD` | `brand=Art("brand_logo")`; 입장 전 타이틀의 `logo`에 사용하지 않음 |
| 코드 수정 | 웹 원격 `main` 기준 `b3d19fc581732defb52bad0480520add2b9e64d8`의 `index.html`·`cin-logo-art.js` 읽기 | 부모 후보 `47f911dea53ab3ffb49c3443e9d7e80c8ebfaeef`의 `NativeLobby.cs`에서 `logo=Art("cin_title_logo")`를 `logo=Art("title_logo")`로 1행 교정. 최종 파일 SHA-256 `5276DDEA831B001EB6DBF79D896207AC36E89E7CB5EC814358B0FE2DF2BA929E` |

웹 두 원본 PNG는 검은 배경을 포함한 불투명 파일이다. 웹 페이지는 `cin-logo-art.js`로 이를 Canvas에서 변환한 이미지를 표시한다. 따라서 원본 PNG byte 동일성은 실제 표시 픽셀 동일성을 증명하지 않는다. I: `ui-simple/gate-matte-compare.json`의 전체 RGBA 대조가 기존 Unity `title_logo.png`와 `enter_art.png`를 각각 0픽셀 차이로 확인했다. 배치의 중심·크기·비율은 `ui-simple/a01-web-matte-parity-correction.md`에서 정적으로 확인했고 실제 Player hover·애니메이션·포커스·입력은 별도 검수다.

`433aee215…`의 `brand_logo` 후보와 `47f911dea…`의 불투명 `cin_title_logo` 후보는 이 역할/알파 검토로 채택하지 않는다. `47f911dea…`는 Windows x64 QA Player **빌드 성공/errors 0** (`I:/EXODUSER-Storage/qa/unity-ui-resume-20261026/build-a01-a03-corrected.json`)이나 다른 게임 창이 겹쳐 EXODUSER 실제 화면·Enter 입력은 **미검증**이다. 이 빌드가 최종 1행 교정을 포함한다는 주장은 하지 않는다. 최종 소스 SHA `5276DDEA…`는 앞 패치노트 후보의 별도 Editor 컴파일 입력과 byte 같지만, 이 최종 체크포인트의 새 빌드·Player QA는 아직 없다.

이전 불투명 `cin_title_logo.png`와 `.meta`는 부모 브랜치에 남고 이번 커밋은 삭제하지 않는다. 최종 코드에서는 이 새 리소스를 참조하지 않는다. 런타임/SSD 정리는 참조·소유권 검증 후 별도 작업이다. 영상·사운드·ENTER 자산·게이트 배치·세이브는 이번 1행 교정 대상이 아니다.

관련 문서 검색: `docs/engine`, `docs/3.1 ui hud 디자인`, `docs/cinematic`에서 `cin_title_logo|title_logo|enter_art|cin-logo-art`를 조회했고 I: `ui-simple/final-matte-docs-search.txt`에 전체 48행 영수증이 있다. `UNITY_LOBBY_LOGO_20261026.md`와 `UNITY_GATE_TITLE_SOURCE_20261026.md`는 이전 두 후보의 이력이며, 현재 선택 로드 경로와 실제 표시 픽셀 계약은 이 문서가 설명한다. UI의 입력 freeze는 I: `ui-simple/a01-final-web-matte-freeze.md`에 있다.
