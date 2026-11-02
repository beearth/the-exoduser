# Mac 승인 불투명 흑철 로고 인수 — 2026-11-01 KST

웹 승인 원본은 main `7dc96cd4360c382f3fa1b5b58da9aafd72b523f6`의 `docs/3.1 ui hud 디자인/LOGO_SOLID_20261031.md`와 `img/logo_exoduser_solid.png`다. PC 후보 `0a60cbcee273e1150ba7df8909acb77dd9f18edc`에 있던 동일 PNG와 Unity `.meta`를 Mac Resources에 정확한 바이트로 인수했다. PNG SHA-256은 `167e8465a0aec6fa5e8cd90131f203a86a27dccca2aa913a317cffe93c7d413d`, 1506×719 RGBA, 955189 bytes다. 새 이미지 생성이나 원본 PNG 덮어쓰기는 없다.

| Mac 소비처 | 이전 리소스 | 현재 리소스 | 배치 |
|---|---|---|---|
| 타이틀 splash 메뉴 | `NativeLobby.TitleMenu.cs`의 `Art/lobby/logo_exoduser` | `Art/lobby/logo_exoduser_solid` | x96,y96,폭520, 기존 그림자 y+10 유지 |
| 인장·로비 | `NativeLobby.SilverHell.cs`의 `gateLogo=Art("logo_exoduser")` | `gateLogo=Art("logo_exoduser_solid")` | 인장 폭57.3%·좌23.86%·위26.2%, 로비 카드 310×148 유지 |
| 기본 게이트·시네마틱 | `NativeLobby.cs`의 `logo=Art("title_logo")` | `logo=Art("logo_exoduser_solid")` | 기존 52% 폭·중심/높이 계산 유지 |
| UI 자산 QA | `NativeUiAssetsCapture.cs`의 구 로고 리소스 | 새 리소스 | 기존 310×148 샘플 영역 유지 |

기존 `title_logo.png`, `brand_logo.png`, `logo_exoduser.png`, 영상에 합성된 로고 및 FDG 인트로는 건드리지 않는다. 기본 시작 로딩의 `Art/Startup/loading_logo`도 별도 장면 자산이다. 타이틀·인장·로비 배치 계산과 애니메이션·입력·저장·Core·씬·URP는 그대로다.

검수는 새 후보 커밋의 공식 ARM64 Settings QA 앱에서 실제 타이틀/splash/인장 1x PNG, 원본 SHA와 실행 앱 SHA, 같은 앱 M1, 무음 Listener 출력, Direct VideoPlayer 0, 일반 저장 11항목 전후 동일, 정상 media drain 및 종료를 각각 기록한다. 로딩 원화 116표본은 선행 후보의 별도 통과 결과이며 로고 수정 후 전수 중복 실행하지 않는다.

첫 로고 후보 `b29522969df6774c888bfc7502d95d2f5cb3f73f`의 공식 ARM64 빌드는 Succeeded/오류0, M1 23단계/차단0, UI 자산 캡처 30/30·종료0이다. 타이틀·인장·로비 1920×1080 원본 PNG를 육안 확인했고, 인장 고리의 글자 내부 관통0·기존 위치/폭 유지로 판정했다. 일반 저장 11항목 전후 동일. 이 UI 캡처 영수증에는 Listener 출력 peak/Direct 개수 항목이 없어 그 계측만 QA 코드에 추가한 후속 앱에서 검증한다.

### 최종 계측 앱 결과

코드 커밋 `04c9f9744588837b3b4690cb5901a1598f0a49b0`에서 새 소스 QA 복제본과 이전 자기 Library 캐시를 사용했다. 제품 소스·승인 PNG/메타·주요 설정 28항목은 후보와 byte 일치했다. Unity 6000.6.7f1 공식 Settings QA ARM64 빌드 `Succeeded`/errors0, 실행 파일 SHA-256 `9802ffee0d403a9897c3c559fce52c441cba801b79e1e29b20dfbdddf59c0dd8`. 같은 앱 M1 23/23·차단0·exit0; UI 자산 캡처 31/31·exit0·정상 `QA_MEDIA_DRAIN_COMPLETE UI`. 영수증의 Listener pause=true, volume=0, outputPeak=0, Direct VideoPlayer=0. 일반 사용자 저장 11항목은 사전·M1 후·GUI 후 존재/크기/SHA-256이 모두 같다. 종료 후 잔여 Unity/Settings QA Player 0.

실제 1920×1080 1x 원본은 `/Users/fordeargamers/exoduser-wt/_out/mac-loading-art-overlay-20261101/gui-logo-final/Unity_타이틀_1920.png`, `Unity_인장_1920.png`, `Unity_로비_1920.png`다. 타이틀·인장·로비에서 승인 흑철 글자 내부로 배경/인장 고리 관통0, 기존 배치·크기 보존. **로고 영역 VISUAL VERDICT: PASS.** 이 판정은 MP4 내 합성 로고나 FDG 인트로의 변경을 뜻하지 않는다.

일반 제품 앱 빌드·공통 반영 상태와 Preferences 게이트의 한계는 [로딩 원화 문서의 공통 반영 절](UNITY_MAC_LOADING_ART_OVERLAY_20261101.md#공통-반영과-일반-제품-앱--2026-11-01)을 따른다. 로고 시각 PASS는 앞 절의 Settings QA 앱 실제 PNG에 귀속하며, 일반 제품 앱의 GUI PASS로 확대하지 않는다.
