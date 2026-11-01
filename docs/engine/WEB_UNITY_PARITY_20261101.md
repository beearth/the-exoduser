# 웹·Unity 현행 화면 정렬 조사 — 2026-11-01

## 범위와 기준

웹은 H5의 2.5D 전투·UI 흐름을, Unity는 별도 3D 게임을 유지한다. 이번 단위는 웹 실행 경로와 최신 승인 화면 자료의 연결을 확인했다. 전투·저장·맵·Unity 소스, 사용자 실행본, 공개 배포는 변경하지 않았다. 웹 소스 기준은 `origin/main` `108980fb5fafc7bebe2c16ae6f0d420e80d6a36f`, Unity 비교 기준은 `origin/unity/main` `f60d89b5cea8d35599c91c85c20bcdd6d2e593aa`다.

| 대상 | 실제 확인 | 판정 |
|---|---|---|
| 웹 최신 소스 | `I:/exoduser-wt/codex-design`의 위 main 기준 `index.html` SHA-256 `71a0eb4fd642ff829533e5afb787cffd76574006389a02a1dcf1de79963592b4`; `game.html` 및 `loading-art.js/css` 포함 | 승인 로고와 35장 로딩 참조가 이미 연결됨 |
| 기존 로컬 웹 | `http://127.0.0.1:3333/index.html` 응답 SHA-256 `17b76e074c4b0df9fdc5e9550b721148ff32b27a7a6b7d9c1072f9a2c8557c88`, 353,509바이트. `G:/exoduser/index.html`과 byte 동일. `game.html`도 양쪽 4,209,609바이트. Node PID 40532는 `server.cjs` 실행 중 | G:의 오래된 작업본을 서빙하며 새 로고·35장 로딩 캐시 참조 없음. 실행 중 서버는 보존 |
| 승인 로고 | `img/logo_exoduser_solid.png` Git blob `af6501bd78ebd8d3e5c5fde3c10e12b07d01b492`, SHA-256 `167e8465a0aec6fa5e8cd90131f203a86a27dccca2aa913a317cffe93c7d413d`. 승인 커밋 `7dc96cd`와 현행 main의 blob 동일. `index.html` 10곳, `game.html` 1곳 참조 | 누락 아님. G: 작업본에는 이 파일이 없음 |
| 로딩·타이틀 | 현행 `index.html`이 `loading-art.js/css?v=20261031-final35` 참조. [35장 로딩 정본](../1전체그래픽세팅/LOADING_ULTRAWIDE_20261031.md)의 웹 반영·패키지 검수 인수. 현행 타이틀은 붉은 태양 배경·승인 로고·메뉴 | 웹 소스 반영 확인. 전체 자연 플레이·Unity 적용과 별개 |
| NW.js 전체/데모 | `package.json`의 현재 버전 0.7.9. `node-main.js`는 target별 `release-config.json`과 자체 포트 3350/3351을 사용하고 `nw-boot.html`에서 해당 서버의 `index.html`로 이동. `build-nwjs.mjs`는 로딩 JS/CSS를 포함 | 이 조사에서 새 패키지 생성·사용자 설치본 교체 없음. 3333과 별도 실행 경로 |
| 공개 웹 | `https://the-exoduser.vercel.app/index.html` 조회는 HTTP 402. 과거 [웹 배포 문서](../13출시·마케팅/LATEST_WEB_RELEASE_20260910.md)의 2026-09-23 시점 배포 기록은 현행 공개 페이지의 소스 증거가 아님 | 공개 버전 확인·갱신 미완료 |
| Unity | Unity main의 `title_logo.png` blob `8fb6f41b4549ce0baffb37dc9664c0e240d3ab71`, `loading_logo.png` blob `fa70eec989a79cec36a0d1ef38994d3d202b5505`는 웹 승인 PNG와 byte가 다름 | 별도 렌더링·가공 에셋이다. 동일 화면/최신 35장 적용으로 판정하지 않음 |

## 격리 검수

기존 3333 서버와 사용자 세이브를 건드리지 않고 I: 소스의 `server.cjs`를 포트 3448, 별도 `EXODUSER_SAVE_DIR`로 잠시 실행한 뒤 종료했다. `index.html`, `game.html`, 승인 PNG, 로딩 JS/CSS, `img/lording/wide/manifest.json`은 모두 HTTP 200이었다. 무창·무음 Chromium 1600×900에서 기존 3333은 회색 구 타이틀, I: 소스는 붉은 태양·흑철 승인 로고·메뉴로 나타났다. 기존/최신 화면은 각각 `I:/EXODUSER-Storage/design/web-unity-parity-20261101/stale-title-1600x900.png`와 `current-title-1600x900.png`, HTTP·DOM 기록은 같은 폴더의 `title-receipt.json`이다. 이 1개 해상도 캡처는 전체 UI·로딩35장·자연 플레이의 시각 판정이 아니다.

## 다음 반영 경계

웹 소스 자체에는 이번 범위의 로고/로딩 누락이 없으므로 중복 수정하지 않는다. 사용자가 실제로 여는 웹을 최신화하려면 **해당 실행 경로**를 최신 main에서 안전하게 다시 만들고 동일 바이너리/정적 산출물의 화면·저장 격리·배포 해시를 검수해야 한다. G: 사용자 서버 자동 재시작, DEMO/EA 사본 덮어쓰기, Steam·공개 웹 배포, Unity 후보를 웹에 일괄 이식하는 작업은 이번 조사에서 수행하지 않았다. Unity의 별도 로딩·HUD 후보는 해당 owner의 인수/1x/Player 검수 뒤 비교한다.
