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
