# 웹 전투 손맛 인계 — 2026-10-31

- 담당 작업본 G:/exoduser-wt/codex-web-feel, 브랜치 codex/web-combat-feel-20261031. 표현 후보0206fb14d, 최신3D 원격929169caa를 보존한 병합 f1ba81fec6a051c98262bab2633ec058089d2c89. main 원격 SHA 대조 완료. 사용자 메인 작업본은 갱신/재시작하지 않았다.
- 구현: feel=0 OFF / feel=1 또는 생략 ON. 접점2틱 유지·총8틱·최대8·64/72px, 비DOT 피격 가장자리6px/HP원형140ms, 동시 일반 처치음2보이스. Q/E/사슬·HP·데미지·쿨다운 불변. 설정/OS 움직임 줄이기 및 화면흔들림0 적용. 전체 상수는 VFX_구현가이드 표.
- 확인 서버: http://127.0.0.1:3347/game.html?feel=0 / ?feel=1 ; PID28412·root 위 작업본·저장 I:/EXODUSER-Storage/combat-feel/20261031/saves. 브리프 요구로 서버만 유지, 테스트 브라우저/캡처 프로세스는 종료.
- 증거: I:/EXODUSER-Storage/combat-feel/20261031/REPORT.md, MEASUREMENTS.md, FINAL-SUMMARY.json, OFF-ON-30s.mp4(좌OFF/우ON·각1600×900·총30초), 슬로3편, 3840×1080/2560×1080/1920×1080 설정·인게임 PNG. 요청 보고서 G:/exoduser/tmp/design-review/20261031_combat_feel/REPORT.md.
- 계측: 동일 초기 Lv1·HP610/빈저장·시드·입력순서, 무적/자원/분노/적 보충 fixture. 평균FPS58.81/58.78, p95간격20.0/19.4ms, 첫LMB5.8/6.2ms. 같은 장면 draw p95 3.3/3.3ms, 추가 접점p95.1ms. 자연 플레이는 별도18처치 후 사망 관측이며 완주 아님.
- 검수: 병합 후 표현/피격/3D계약29 PASS·guard10script PASS·실게임 스모크 pageerror0. 이전 관련125 PASS와 기존 Ki 홀드 fixture4 FAIL은 분리. _uEq/_eqAffix 누락으로2회 후 해당 단위 중단·원본 테스트 byte 보존. 전체 회귀 PASS나 실청취/재미 PASS를 선언하지 않음.
- 공개 PoE2/Diablo IV/Hades 영상 직접 비교는 REFERENCE.md·REFERENCE-COMPARISON.jpg, 원본 외부 자산 반입0·유료 지출0. 남은 일: 사용자 직접 재미/소리 판정, 기존 Ki VM 검수환경 보완은 별도 담당 단위.
