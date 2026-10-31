# 웹 초광폭 월드 — 2026-10-31

## 목표와 원인

사용자/CTO 브리프의 3840×1080 HUD 원본을 직접 확인했다. 중앙 약 2200px 지형의 직선 절단과 오른쪽 생체나무가 결함이다. 실제 본편은 이미 VW/VH 전체 폭으로 가로 시야를 넓히며 세로 시야·타일 크기를 유지한다. 원인은 16:9 카메라 제한이 아니라, `stage=0`이 과거 55×31 원화 테스트맵을 선택하고 200×200 본편 레이어를 동시에 그리던 경로였다.

제작 방법은 원화 확대·복제나 새 지형 생성 대신 진입 경로와 월드 좌표 계약을 고치는 것이다. 목표 장면은 실제 본편 1-1 시작/중앙 전투/북문 접근에서 외곽 숲이 양쪽 화면 끝까지 이어지고 중앙 전투 바닥·HUD가 읽히는 모습이다. 원본/최종 1920×1080의 같은 정지 월드 픽셀 차이 0, 4해상도 12장, 페이지 오류·로컬 404·지정 HUD 겹침 0을 기술 합격선으로 삼는다. 실제 화면에 평평한 검정 판·잘못 겹친 나무가 남으면 시각 FAIL이다. 전체 맵의 기존 RETOUCH를 이번 수정으로 PASS로 올리지 않는다.

## 현행 런타임 계약

| 항목/id | 현행 값/동작 | 적용 위치 |
|---|---|---|
| stage=0 | 본편 200×200, 1타일 40px, 월드 8000×8000. 창 폭에 따라 가로 시야 확대; 세로 시야·원화·충돌·루트 불변 | game.html / _wantPlateTest·genFromTemplate |
| 원화 테스트 opt-in | mapTest=1 또는 mapTest=v4; stage=0&plate=prod / fieldone / v1. classic=1은 기존처럼 원화 테스트를 끔 | _wantPlateTest |
| 작은 원화 판 | prod 55×31·fieldone 36×27은 보존한 과거 제작 도구. 본편 검수·게임 맵으로 사용 금지 | _buildKitFieldTest |
| production 청크/나무 | 원화 판에는 _ch1StartOuterEnabled=false, Ch1RotTrees ground pass도 같은 gate. 8000px 좌표 나무를 2200px 판 옆에 그리지 않음 | _ch1StartOuterEnabled·draw |
| 논리/백킹 뷰 | VW=창 폭×resScale/100, VH=창 높이×resScale/100(짝수). 기존 _ssaa=1. GPU/CSS/컬링·청크 범위는 기존 전체 뷰 계약 유지 | rz·draw |
| 화면 밖 판정 | z=max(.3,G._camZoom 또는 1); abs(x-cam.x)>VW/(2z)+margin 또는 abs(y-cam.y)>VH/(2z)+margin | _outsideWorldView |
| 리시 재배치 | 기존 비보스/alerted·2500px 초과 조건,800~1200px 랜덤링 유지. 후보가 현재 카메라 가시영역+적 반경+100px 밖이고 canMv일 때만 이동. 보이는 후보면 그 회차 이동 생략 | update / leash |
| 투사체 원거리 정리 | 기존 거리제곱 6250000 초과 조건에 가시영역+100px 밖 조건 추가. 즉시 정리와 일반탄 수명 연장 종료 양쪽 동일. 지뢰/장판·빨콩 폭발·-900 강제 만료·충돌·피해·사거리 설계 불변 | update / projs |
| 핫패스 | helper는 스칼라 산술만. 새 배열/객체/캔버스/텍스처/순회/정렬 없음 | _outsideWorldView |

사거리·어그로·공격 주기·스폰 예산·T1~T4 빈도·리시 거리 수치는 바꾸지 않는다. 지정 해상도에서 이미 화면 안에 들어온 적은 기존 VW/VH 컬링 대상이다. 보스 줌아웃 때도 원거리 탄 정리는 화면 밖에서만 수행한다. 공격/탄 수명 자체로 예정된 폭발·지뢰 종료는 별도 게임 규칙이다.

## 검수와 증거

- tools/check-world-ultrawide.mjs: headless·무음, 분리 server.cjs, EXODUSER_SAVE_DIR 격리 및 save API 차단. 실게임 렌더/네이티브 적 fixture 사용. 자연 플레이/완주 증거와 구분.
- 해상도 1920×1080·2560×1080·3840×1080·2560×1600, 시작(4020,7420)·전투(4020,4820)·북문 앞(4020,620).
- 실제 1920 픽셀 비교는 같은 월드/캐시/카메라에서 수정 전/후 draw·coverage 함수를 교체하고 RNG/렌더 시각을 고정한다. 스스로 두 번 그린 픽셀도 비교하여 잔여 애니메이션의 오판을 검출한다. UI 원본 PLATE 캡처와 본편의 차이를 1920 회귀로 혼용하지 않는다.
- 검수 산출물: G:/exoduser/tmp/design-review/20261031_world_wide/REPORT.md·results.json·원본PNG·qa.log. source SHA와 HTTP/디스크해시·원격 포함 확인은 최종 보고서에 기록한다.
- 신규 test/worldUltrawide.test.js 3건 RED→GREEN. 기존 레이어 wiring 검사는 production gate를 명시하도록 갱신. 기존 회귀 실패 27건은 원본 3f19b0bd1의 동일 game byte로도 재현한 별도 이력이며 이번 수정의 PASS로 숨기지 않는다.

전체 아트 상태·세부MAP PRODUCTION REPORT와 실측FPS는 최종REPORT를 따른다. Unity에는 별도 ui-ultrawide-brief.md로 같은 사용자 지시를 인계하며, Unity 구현/Player검수는 이 웹 변경으로 완료 처리하지 않는다.

## 최종 결과

| 검수 | 결과 |
|---|---|
| 4해상도 × 시작/전투/보스 앞 | 12장. 실제 본편 200×200, 좌우 평평한 검정 판과 좌표가 어긋난 나무 혼입 없음. 원본 배율 좌우 크롭도 직접 확인 |
| 1920×1080 같은 정지 월드 | 시작/중앙/보스 앞 각각 변경 픽셀0, 자기 비교도0 |
| 런타임·UI | 페이지 오류0·로컬404 0·지정HUD텍스트/컴포넌트 겹침0. 최종 stage=0 진입도200×200 확인 |
| 관련 회귀 | 235검사:234PASS·1기존SKIP·0FAIL. 확대 회귀의 기존27실패는 원본byte로 동일 재현, 별도 미해결 이력 |
| 정적/guard | project-check105/105·guard PASS. game 줄수65996(기존65990+6) |
| 실제 GPU FPS | Radeon RX9070XT·D3D11·headless·적32·4초:1920×1080=191.66,3840×1080=229.92. 단기 표본이며 FPS 향상률·장시간 안정성을 주장하지 않음 |
| 소프트웨어 참고 | SwiftShader·동일표본:1920×1080=12.09,3840×1080=6.43. 실제 GPU와 분리 |

초광폭 경로·레이어 범위 시각PASS. 전체 맵 아트의 기존RETOUCH·자연 완주·NW.js·Unity Player 상태는 이 결과로 승격하지 않는다. 커밋/원격 SHA 및 MAP PRODUCTION REPORT는 외부 최종 REPORT에 기록한다.
