# Tripo 직접 API 연결 — 2026-11-02

사용자가 직접 API 연결·CTO 보고·작업 진행을 요청했다. 공식 v3 API의 `GET /account/balance`가 HTTP200/code0을 반환해 현재 PC에서 인증을 확인했다. 이전 Tripo Studio 웹/직접 API 미검증 기록과 별개의 후속 증거다. Higgsfield 경유와 Studio 웹 구독·직접 API 잔액은 서로 다른 예산으로 취급한다.

| 항목 | 실제 범위 |
|---|---|
| 키 저장 | 사용자 프로필 아래 로컬 통합 디렉터리, Windows DPAPI CurrentUser 암호화·사용자 ACL 제한. 키·평문·인증값은 Git/공개 문서/보고문에 미포함 |
| 인증 | 2026-11-02 15:13 KST 직접 API v3 HTTP200/code0 확인 |
| 실제 생성 | API 잔액 부족으로 업로드/유료 생성0건. 인증 성공을 생성 성공으로 확대하지 않음 |
| 생성 준비 | 이미지→모델 v3.1-20260211, 기존 얼굴을 유지한 현대 복식 비교 원화 준비 |
| 검증 | 암호화 복원·평문 미저장, 잔액0일 때 업로드 전 차단, 불명확한 유료 POST 자동 재시도 금지의3검사 통과 |
| CTO 전달 | 기존 CTO 채팅 직접 전송1회는 active writer 잠금으로 실패. 잠금을 우회하거나 중복 실행하지 않고 내부 보고 파일에 보존. 채팅 수신/인수는 미확인 |

계정 잔액·원시 응답·내부 전달 상태는 비공개 로컬 원장에만 둔다. 공식 근거: https://developers.tripo3d.ai/en/docs/account, https://developers.tripo3d.ai/en/docs/generation-image-to-model/standard, https://developers.tripo3d.ai/en/pricing. 새 복식 원화는 [v23/v24](MULTIVERSE_MODERN_COSTUME_V23_V24_20261102.md).
