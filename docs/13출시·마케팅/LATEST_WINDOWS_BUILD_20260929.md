# 최신 Windows 실행 빌드 — 2026-09-29

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
| 크기 | 6595개 파일, 7235094274bytes (manifest 제외) |
| 복사 검증 | 각 파일 복사 전후 원본 해시 및 출력 SHA256 일치. game/index/easy-test/균열 PNG 원본 최신 해시 대조 통과 |
| 구문 | 출력 game/index 실행 inline script10개 Acorn 통과 |
| 실제 실행 | 출력 EXODUSER.exe 시작 및 해당 엔진이 제공하는 game.html 해시 일치 확인 |
| 브라우저 | 내장 서버3338의 로비→입장→데모 초기 대화 확인, HP441 및 균열 이미지2688px 로드 확인 |
| 검수 한계 | 초기 대화 중 G.on=false를 로딩 지연으로 판단한 첫 대기 실패 후 재검수. NW 네이티브 게임 창의 직접 조작·보스 완주·장시간 플레이는 이번 패키징에서 재검수하지 않음 |
| 검수 정리 | QA 프로필/AppData는 tmp 격리, 검수용 창 설정 복원 및 manifest SHA256 일치 |
| 선택적 누락 | 기존 빌더 선택 파일 credits.html 및 output/imagegen/forge-tabs-v3가 원본에 없어 제외; 런타임 신규 의존성은 HTML 참조 보완 복사 |
| 배포 | 로컬 실행 폴더 생성. Steam/웹/외부 업로드 없음 |

출력의 `build-manifest.json`에 전체 파일별 SHA256을 보관한다. 검수 결과는 `tmp/latest-build/qa/runtime.json`, `restored.json`에 기록했다.
