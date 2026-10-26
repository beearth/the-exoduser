# A03 로고 변경 이력 — A01 화면 역할 정정 필요

**정정(2026-10-26):** 이 초안은 Unity `DrawGate`를 웹 `#chGateImg`와 대응시켰으나, 실제 대응은 입장 전 `#cinClickPrompt .cin-title-art`다. `logo=Art("brand_logo")` 후보는 로비/챕터 게이트 정본 이미지를 입장 전 타이틀에 사용하므로 시각 parity 후보로 채택하지 않는다. 독립 보정 계획과 소스 근거는 `lobby-logo-handoff.md`를 따른다. 아래 내용은 당시 변경 영수증으로만 보존한다.

2026-10-26. 최초 조사한 원격 `main` SHA는 `8ae26f7fb2d67e476c6b1d37b99f8b3e4b4cafce`이고, 완료 직전 재조회한 최신 ref는 `acbee169192bfd9bcaa18baf2f9525351501b713`이다. 두 커밋의 `img/logo_exoduser.png` blob은 모두 `fa70eec989a79cec36a0d1ef38994d3d202b5505f`이다. 최신 `index.html`은 최초 시네마틱 타이틀에 별도 `output/imagegen/exoduser-hell-lord-logo-api-v1.png`를 사용하고, 챕터 게이트·일반 타이틀·로비 구분선에는 `img/logo_exoduser.png`를 사용한다. G:의 dirty `index.html`은 이 판단에서 제외했다.

Unity `NativeLobby.Initialize`의 게이트 `logo` 로드 경로를 `Art/lobby/title_logo`에서 기존 `Art/lobby/brand_logo`로 변경했다. `DrawGate`는 이 `logo`만 사용하며, 로비 우측 `brand`는 이미 같은 `brand_logo`를 사용하고 있었다. `splashTitle`, `splashBrand` 등 인트로 자산·그리기·영상 코드는 그대로다. 기존 십자·HELL LORD 그림인 `title_logo.png`와 meta는 삭제하지 않았다. 새 이미지·PNG 변환·리소스 파일 수정은 없다.

`brand_logo.png`와 원격 웹 `img/logo_exoduser.png`는 SHA-256 `DFFAD452CFFA7AAF074FF80D2FBB9258858FDEF11CBDE750E8B07F3F3B264EFBD`로 바이트 동일하다. 835×348, PNG 8비트 RGBA(color type 6)이고 원본 비율 835:348을 `DrawGate`가 유지한다. Native 1920×1080 설계 좌표의 로고 직사각형은 폭 약 962.74·높이 401.24이다. 웹의 전체 화면 `#chGateImg` `contain` 배치와 크기는 다르므로 전체 게이트 레이아웃 parity나 Player 시각 PASS로 간주하지 않는다.

작업 순서: 앞 패치노트 후보 QA `patchnotes-compile.json`에서 입력 해시 일치, Editor exit 0, 컴파일 오류 0, leaseReleased=true를 확인한 뒤 로고 1행을 수정했다. 따라서 패치노트 컴파일 결과는 이 로고 후보의 컴파일 증거가 아니다. QA 인계: 로고 후보 해시로 별도 Editor 컴파일, 실제 Player 게이트/로비 화면에서 정본 로고 표시·원본 비율·투명도·배치·Enter 버튼과 간섭 여부를 검수한다.

`G:/exoduser/docs` 전체에서 `logo_exoduser|title_logo|brand_logo|로비.*로고|게이트.*로고`를 검색했다. 관련 문서는 `docs/3.1 ui hud 디자인/lobby_full_patch.md`, `UI_COMPOSITION_20260925.md`, `docs/engine/FDG_SOURCE_TRACE_LOBBY_20261020.md`, `PARITY_DIFF_LIST_20261022.md`, 시네마틱 타이틀 문서다. 공유 G: docs는 타 팀 dirty 작업과 분리하여 통합 단계에서 갱신한다.

I: 독립 보관물은 `NativeLobby.before-lobby-logo.cs`, `NativeLobby.snapshot-after-lobby-logo.cs`, `NativeLobby.lobby-logo-only.patch`, `brand_logo.web-main-byte-identical.png`, `lobby-logo-manifest.json`, 이 초안이다. 로고 변경 전 SHA-256 `5276DDEA831B001EB6DBF79D896207AC36E89E7CB5EC814358B0FE2DF2BA929E`, 이후 `0DCBD192DC3C1CB03E0E1C596BD4880DF75CA6E1B8E28495216065D8F0ACB4AD`. 독립 diff는 1행 교체이며 공백 검사 통과. 패치노트 partial/data와 화신 후보 파일은 수정하지 않았다.
