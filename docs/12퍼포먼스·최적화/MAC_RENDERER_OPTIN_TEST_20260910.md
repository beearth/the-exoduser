> **후속 로컬 변경:** 사용자 20FPS 재제보와 M5 Pro 실측에 따라 Mac의 쿼리 미지정 진입은 WebGPU 우선으로 수정했다. 명시적 webgpu=0은 계속 WebGL2를 강제한다. 아래는 이전 선택 비교의 이력이다. [현재 정책·검증](MAC_DEFAULT_WEBGPU_FPS_20260910.md).

# Mac 금색 세로 띠 — 렌더러 선택 비교 테스트

> **실제 서비스 정정:** 사용자 주소는 **the-exoduser.vercel.app**. 아래 hell-smoky 검증은 다른 프로젝트의 결과이며 사용자 Mac이 해당 수정본을 실행했다는 증거가 아니다. [정정 기록](../13출시·마케팅/PRODUCTION_TARGET_CORRECTION_20260910.md).

**상태: 테스트 버전 구현·Production 재배포·배포 원문 대조·Windows 시작 로그 검증 완료. 사용자는 Mac에서 동일 증상과 화면 고정 띠를 다시 보고했다. 실제 Mac 백엔드 로그·FPS 비교는 PENDING이며 해결되지 않았다. [광선 단독 비교](MAC_FIXED_RAY_ISOLATION_20260910.md).**

| 항목 | 근거·현행 값 |
|---|---|
| 사용자 제보 | MacBook Chrome·Safari 모두 게임 배경에 굵은 금색 세로 띠 반복. HUD 정상 |
| 배포본 비교 | 기존 hell-smoky.vercel.app/game.html 다운로드에서 Mac 자동 OR 조건 확인. 재배포 후 공개 game/index SHA256이 bb67f07 고정 배포물과 정확히 일치. [배포 기록](../13출시·마케팅/WEB_RENDERER_REDEPLOY_20260910.md) |
| 확인한 결함 | `URL webgpu=1 OR Mac+gpu존재` 때문에 Mac에서 webgpu=0·파라미터 없음·webgpu=true도 WebGPU 초기화. 이는 선택 조건의 결함이며 세로 띠 원인 확정과 구분 |
| 단일 실험 | Mac 자동 선택 OR 조건 제거. `const _useWebGPU=(!IS_ELECTRON)&&new URLSearchParams(location.search).get('webgpu')==='1';` |
| 기본·webgpu=0 | WebGL2 먼저 초기화, WebGL2 불가 시 기존 Canvas2D 폴백. WebGL2 시작 여부는 실제 컨텍스트·로그로 확인 |
| webgpu=1 | 비 Electron에서만 WebGPU 시도. 미지원·초기화 실패 시 기존 WebGL2 → Canvas2D 폴백. 명시적 선택도 실제 성공을 보장하지 않음 |
| Electron | 기존 WebGPU 제외 조건 유지 |
| 시작 로그 | 기존 실제 백엔드·어댑터 로그에 `policy=url-opt-in-20260910` 및 URL `webgpu` 값 추가. 파라미터 없음은 null, 0이면 0. `[GPU] WebGL2 ready`와 `[GPU] WebGL2 \| … \| policy=url-opt-in-20260910` 확인. skipped 로그만으로 WebGL2 성공 판정 금지 |
| 변경 범위 | `_bootRenderer()` 선택식·주석·요약 로그. DPR·해상도·텍스처 업로드·셰이더·블룸·금색 색상·맵·전투 수치 변경 없음 |
| 안개 제어 | 기존 `_fogGLInit` 진입의 Mac+navigator.gpu 차단은 그대로다. 실제 백엔드 플래그와 무관하게 해당 조건이면 양쪽 비교에서 차단됨. 이 별도 조건을 함께 수정하면 실험 변수가 늘어나므로 유지 |
| 기존 기록 | M5 Pro NW.js/Graphite에서 WebGL2 3~10fps였던 과거 측정은 보존. 과거 WebGPU 유지 지침은 이번 사용자 지정 선택식 실험에 한해 최신 지시로 대체. 현재 Chrome/Safari 성능으로 재해석 금지 |
| 백업 | `tmp/game.before_renderer_optin_20260910.html` |
| 로컬 테스트 | `http://localhost:3333/game.html` / `?webgpu=0` / `?webgpu=1`. 기존 쿼리가 있으면 `&webgpu=…` 사용하고 중복 webgpu 키는 제거 |

## 실행한 검증

| 검증 | 결과 |
|---|---|
| 변경 전 재현 | `test/rendererOptIn.test.js`: Mac 기본·0·true 3개가 예상 WebGL2 대신 WebGPU로 실패. 초기 테스트의 ESM import 문제를 고친 뒤 선택 결함 실패를 확인 |
| 변경 후 | 선택·실패 폴백·Electron 유지·실제 백엔드 요약 11개 PASS |
| 인접 회귀 | lightingTextureFreshness 6개 + textureWarmupActualGpu 3개 PASS. 합계20 PASS |
| 실제 Windows Chrome | `python tools/verify_renderer_optin.py`: 기본·webgpu=0 두 경우 `_useGL=true`, `_useGPU=false`, GL.VERSION=`WebGL 2.0 (OpenGL ES 3.0 Chromium)`, 수정 정책 로그 확인, pageerror0 |
| 실제 어댑터 | Windows/HeadlessChrome153, ANGLE AMD Radeon RX9070XT D3D11. navigator.gpu 존재. Mac 장치·Metal·Safari 증거가 아님 |
| 증거 파일 | `captures/renderer_optin_20260910/boot-report.json` |
| Production 검증 | https://hell-smoky.vercel.app/game.html 기본·webgpu=0에서 Windows Chrome153 실제 WebGL2 컨텍스트, _useGL=true/_useGPU=false, policy=url-opt-in-20260910 로그 확인, pageerror0. `captures/renderer_optin_20260910/production-boot-report.json`. Mac 실기 증거 아님 |
| 실기 결과 | 사용자 Mac 재확인: 증상 동일, 띠는 화면에 고정. 해당 실행의 백엔드 로그·브라우저별 FPS는 미수신. 세로 띠 소멸·이동·전투·FPS 개선을 주장하지 않음 |

## Mac 실기 비교 절차

1. 동일 MacBook에서 OS·칩·Chrome/Safari 버전, 같은 캐릭터/세이브/스테이지/장면과 창 크기·DPR·그래픽 품질·resScale·FPS 제한을 기록한다. 원본 세이브를 보존한 테스트 슬롯을 쓴다.
2. 문제 배포본에서 같은 장면을 촬영하고 실제 GPU 시작 로그를 보관한다. 테스트 버전에서는 `policy=url-opt-in-20260910`이 보여야 한다. 네트워크의 game.html 응답에 새 선택식이 있는지도 확인한다.
3. 각 브라우저에서 기본 URL, webgpu=0, webgpu=1을 각각 새로 열어 실제 백엔드 로그를 기록한다. GPU 초기화 실패로 webgpu=1도 WebGL2면 그 실행은 WebGPU 대조군으로 인정하지 않는다.
4. 게임 설정의 FPS 표시를 켜고 같은 위치 정지 30초 → 같은 경로 이동 30초 → 같은 적·기술 전투 30초를 녹화한다. 각 구간 FPS 범위·급락/멈춤, 배경의 금색 띠, 스크롤/캐릭터 이동, 기술 발동/HUD 정상 여부를 기록한다. 프레임 수치를 Windows 결과로 대체하지 않는다.
5. 두 브라우저의 실제 WebGL2 실행에서 세로 띠와 이동·전투가 정상인지, 과거 swizzle 계열 성능 저하가 다시 생기는지 함께 판정한다. 하나라도 미확인/악화면 해결 완료로 닫지 않는다.

| Mac 브라우저 | URL | 실제 백엔드 | 세로 띠 | 이동 | 전투 | 정지/이동/전투 FPS | 판정 |
|---|---|---|---|---|---|---|---|
| Chrome | 기본 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
| Chrome | webgpu=0 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
| Chrome | webgpu=1 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
| Safari | 기본 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
| Safari | webgpu=0 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
| Safari | webgpu=1 | 미측정 | 미확인 | 미확인 | 미확인 | 미측정 | PENDING |
