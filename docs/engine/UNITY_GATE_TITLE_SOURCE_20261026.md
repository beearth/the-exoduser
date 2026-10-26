# A01 원본 PNG 연결 후보 이력 — 웹 matte 정정 필요

**정정(2026-10-26):** 아래 후보는 웹 `cin-logo-art.js`의 런타임 알파 변환을 놓쳤다. 기존 Unity `title_logo.png`와 `enter_art.png`가 그 변환 결과의 모든 RGBA 픽셀과 일치한다. 새 불투명 `cin_title_logo.png`를 연결한 후보는 parity 정본으로 채택하지 않는다. `a01-web-matte-parity-correction.md`를 현재 판정으로 사용한다. 아래는 변경 이력이다.

2026-10-26. 웹 원격 main `6987ff6c46f2a712d5a5f762bdf532080a5ccfb0`의 `index.html`에서 입장 전 화면은 `#cinClickPrompt .cin-hell-frame`이고, 타이틀 이미지는 `output/imagegen/exoduser-hell-lord-logo-api-v1.png`다. 캐릭터 선택 뒤 `#chapterGate #chGateImg`와 로비 구분선은 별도 `img/logo_exoduser.png`다. Unity `LobbyPage.Title`의 `DrawGate`는 앞의 입장 전 화면에 대응한다. A03에서 임시 연결한 `brand_logo`는 뒤의 화면 자산이므로 A01에서 정정했다.

| 항목 | 웹 정본 1920×1080 | Unity A01 후보 |
|---|---|---|
| 프레임 | `.cin-hell-frame` 중앙, 1851.43×1080 | 기존 `Rect(34.2857,0,1851.4286,1080)` 유지 |
| 타이틀 | 중심 프레임 x=53.3%, y=37%; 폭 프레임의 52% | 기존 `DrawGate` 폭 962.74, 중심 x≈1021.05·y=399.6 유지 |
| 타이틀 비율 | PNG 1536:1024, 렌더 높이 641.83 | 기존 폭×`logo.height/logo.width`; 같은 641.83 |
| ENTER | 중심 프레임 x=53.3%, y=80%; CSS 240×160 | 기존 `DrawGate` Rect 240×160 유지 |
| 타이틀 픽셀 | 원격 blob `99a206db1e59286fe51e6ca9624a55eeea40e4a5`, SHA-256 `185ABB93942EA45A21DCC2D80564E44E1895AFA14127D4EAC110FAEB979A85BA` | 신규 `Resources/Art/lobby/cin_title_logo.png`, 동일 파일 바이트 |

기존 Unity `title_logo.png`는 같은 1536×1024 구도지만 원격 이미지와 알파 포함 1,283,247픽셀이 달라(원격 PNG는 알파 255 고정, 기존 Unity PNG는 투명 배경) 정본 byte source로 사용할 수 없다. 기존 파일/meta는 보존한다. 새 자산은 생성·재디자인·변환한 것이 아니라 G: 파일의 Git blob이 원격 main과 동일함을 확인한 뒤 byte 그대로 복사한 실제 런타임 리소스다. `brand_logo.png`는 로비 우측 패널 경로로 유지한다. 인트로 영상·소리·타이틀 전환 코드는 변경하지 않았다.

이전 로고 후보 QA `lobby-logo-first-compile.json`은 SHA-256 `0DCBD192...`의 Editor 컴파일 exit 0/errors 0/leaseReleased=true만 입증한다. 이번 A01 수정 후 `NativeLobby.cs` SHA-256은 `E83D9F7A29C36C932984F22394C760A7BDCF1445B318C80E553CCD0B1250C0AF`이다. 이번 후보의 Unity 컴파일·Player 화면·클릭/Enter·화질·색/알파는 아직 미검증이다. `DrawGate` 수학적 배치가 웹 CSS와 같아도 렌더 시각 PASS로 확장하지 않는다.

docs 전체 검색 결과는 `gate-source-docs-search.txt`(46개 행)에 보관했다. 관련: `docs/engine/UNITY_PORT_MASTER_20261026.md` A01/A03, `FDG_SOURCE_TRACE_LOBBY_20261020.md`, `PARITY_DIFF_LIST_20261022.md`, `docs/3.1 ui hud 디자인/lobby_full_patch.md`, `UI_COMPOSITION_20260925.md`, 시네마틱 타이틀 자료. 공유 G:의 다른 팀 WIP를 수정하지 않았다. 문서 통합 시 입장 전 HELL LORD와 로비/챕터 EXODUSER를 구분하고, 앞 로고 후보의 역할 오인을 정정한다.

독립 백업/검수물: `NativeLobby.before-gate-source-correction.cs`, `NativeLobby.snapshot-after-gate-source-correction.cs`, `NativeLobby.gate-source-correction.patch`, `cin-title-logo.remote-main.png`, `cin_title_logo.png.meta.snapshot`, `gate-source-manifest.json`. 소스 독립 diff는 1행 교체이고 `git diff --no-index --check`에 공백 경고가 없었다. QA는 수정 후 SHA 입력으로 별도 Editor 컴파일을 수행해야 한다.
