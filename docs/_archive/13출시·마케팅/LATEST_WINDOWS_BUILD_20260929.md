# 최신 Windows 실행 빌드 — 2026-09-29

## 대지가르기 시각 재검수 패치

| 항목 | 결과 |
|---|---|
| 수정 파일 | package.nw/game.html, package.nw/game-easy-test.html, package.nw/img/vfx/chain_earth_rubble.png |
| 효과 | 균열 폭 halfW*(중앙10.2/좌우8.8), 42개 불규칙 암석 파편의 상승·착지. 상세 수식은 [대지가르기 SSOT](../5.1임펙트디자인/CHAIN_SLAM_FORWARD_CLEAVE_20260929.md) |
| 반영 방식 | 기존 실행본에 해당 렌더러·로더·신규 PNG만 반영. build-manifest.json의 해당 파일 SHA256 갱신 및 재검증 |
| 검증 | 개발 서버 WebGL 실제 Shift→좌클릭: 675px/t10/42개 파편, 웨이브 정리0개, 페이지 오류0개. 관련 Node 테스트17 PASS |
| 실행본 한계 | 이 패치 후 NW 네이티브 플레이 검수는 미실시. 이미 열린 게임은 HTML 재로드 또는 다시 실행해야 새 효과 적용 |
| 시각 판정 | RETOUCH: 사용자 확인 대기 |
| 배포 범위 | 위 로컬 실행 폴더 반영. Steam 업로드와 별개 |


| 항목 | 결과 |
|---|---|
| 출력 | `G:/exoduser/out/EXODUSER-latest-20260929-215218` |
| 실행 | 출력 폴더의 `START_EXODUSER.cmd` 또는 `EXODUSER.exe`; 폴더 전체 필요 |
| 소스 | 현재 작업본 스냅샷, 미커밋 맵·UI 변경 포함. 기준 커밋 `7b481592656ba165cfaf5d99eb1581e8d8abce3d` |
| 포함 | 세 갈래 대지가르기 API VFX, 기동불꽃 광량/잔광 조정, 최신 로비·인벤토리·맵 파일 |
| 엔진 | NW.js 0.111.2 normal, Windows x64, 검증된 H.264/AAC 코덱 |
| 범위 | 공개 데모: Lv100 상한, CH1-1 종료 |
| 진입점 | `http://localhost:3338/index.html?demo=1`; 사본의 node-main 서버와 node-remote도3338 |
| 창/저장 | 원본 전체화면 설정 유지, 프로필 `./userdata`; 서버 슬롯 `%APPDATA%/EXODUSER-HELL/saves` 기존 계약 유지. 기존 사용자 데이터 복사 없음 |
| 크기 | 6596개 파일, 7240389921bytes (manifest 제외); 대지가르기 재검수 패치 반영 |
| 복사 검증 | 각 파일 복사 전후 원본 해시 및 출력 SHA256 일치. game/index/easy-test/균열 PNG 원본 최신 해시 대조 통과 |
| 구문 | 출력 game/index 실행 inline script10개 Acorn 통과 |
| 실제 실행 | 출력 EXODUSER.exe 시작 및 해당 엔진이 제공하는 game.html 해시 일치 확인 |
| 브라우저 | 내장 서버3338의 로비→입장→데모 초기 대화 확인, HP441 및 균열 이미지2688px 로드 확인 |
| 검수 한계 | 초기 대화 중 G.on=false를 로딩 지연으로 판단한 첫 대기 실패 후 재검수. NW 네이티브 게임 창의 직접 조작·보스 완주·장시간 플레이는 이번 패키징에서 재검수하지 않음 |
| 검수 정리 | QA 프로필/AppData는 tmp 격리, 검수용 창 설정 복원 및 manifest SHA256 일치 |
| 선택적 누락 | 기존 빌더 선택 파일 credits.html 및 output/imagegen/forge-tabs-v3가 원본에 없어 제외; 런타임 신규 의존성은 HTML 참조 보완 복사 |
| 배포 | 로컬 실행 폴더 생성. Steam/웹/외부 업로드 없음 |

출력의 `build-manifest.json`에 전체 파일별 SHA256을 보관한다. 검수 결과는 `tmp/latest-build/qa/runtime.json`, `restored.json`에 기록했다.
