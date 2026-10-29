# VARCO 3D 공급자 시험 — 2026-10-30

상태: **잔액 부족으로 차단, 시험 미완료.** 데모 v0용 소품·드루이드·전사 각 1회 시험 브리프를 인수했다. 모델 생성·Unity 화면·Meshy 우열 판정은 아직 완료되지 않았다.

| 항목 | 확인된 결과 |
|---|---|
| 실제 소유 작업 경로 | `G:/exoduser-wt/codex-varco`, 시작 HEAD `c122746b9858a2ccb50d97dccf276140c155383f`, INDEX/WORK 깨끗함. 이전 `codex-unity-visual`의 기존 WIP는 수정하지 않음 |
| 공식 API | `OPENAPI_KEY`, `POST https://openapi.ai.nc.com/3d/varco/v1/image-to-3d`, `GET /inference/result/{requestId}`. 문서를 headless·무음 Chromium으로 렌더해 확인 |
| 실제 요청 | 2026-10-29T17:53:48.655Z 소품 첫 요청 1건 |
| 응답 | HTTP 402, `No available credits to process the request`. 작업 ID·접수 성공·결과물 0 |
| 후속 처리 | 보스·전사 생성과 품질 재시도 0. 결제·업그레이드·키 변경·MCP OAuth·Unity 실행·에셋 교체·배포 0 |
| 비용·잔액 | 완료·접수 생성 0건. 실제 차감 장부와 숫자 잔액 미확인. API는 사용 가능 크레딧이 없다고 응답. 텍스처 포함 공식 $0.30/건, 최초 3건 공시 합계 $0.90. 최소 충전액·환산·세금은 미확인 |
| 입력 | `darkPillar.png`, 기존 Meshy 드루이드 `meshy_in_front.png`, 전사 `warrior_body_front.png`의 동일 바이트 사본·SHA-256 준비. 직접 열람 |
| 비교 제약 | VARCO는 정면 단일 PNG, 기존 Meshy는 정면·측면·뒤 다중 입력. 완전 통제 비교 아님. 같은 소품 입력의 기존 Meshy 결과는 이번 확인 범위에서 미확보 |
| 라이선스 | 웹은 Public(CC BY 4.0)/Private을 안내하지만 REST v1 명세에는 선택 필드가 없음. API에 같은 조건이 적용된다고 확정하지 않았고 임의 필드를 보내지 않음. 상업 이용·공개 상태 확인 전 제품 채택 보류 |

기존 Meshy GLB는 Blender 5.1.0 무창 모드에서 직접 임포트했다. 본체/리그 각각 드루이드 61,063/61,143 삼각형, 전사 61,981/62,061 삼각형이다. 모두 삼각 토폴로지이며 사각·엔곤 0, 메시당 UV 1개, 텍스처 3장(각 2048×2048), 본체 본 0·리그 본 24다. 상세 정점·메시·액션 수는 `meshy-baseline.json`에 있다. 원시 glTF 정점과 Blender 임포트 정점은 UV 경계 분할 등으로 다를 수 있다. 이 통계는 변형·접지·게임 품질 PASS가 아니다.

드루이드 입력은 브리프 지정 LOCK v0.3 `59f4b03ab`의 공급자 비교용이다. 최신 `DARK_DRUID_DESIGN_LOCK.md` v0.4 §16에서 기존 S1·Meshy 체형은 FAIL로 철회됐다. 이 시험으로 과거 디자인 PASS를 되살리거나 현행 런타임에 채택하지 않는다.

**데모 v0에 쓸 만한가: 미검증 / 손볼 점: 지불자·크레딧과 REST 라이선스 확인 후 생성·검수 / Meshy보다 나은가: 결과가 없어 판정 불가.**

VISUAL VERDICT: 미검증. VARCO 모델의 Blender 검사, Unity 1-1 조명 1920×1080 캡처, 같은 크기 원화/Meshy/VARCO 비교, 리그·동작 검수가 남아 있다. 크레딧 부족을 품질 실패나 도구 품질 판정으로 해석하지 않는다.

전체 한국어 보고서·입력·해시·API 장부·공식 문서 원문 증거·검사 스크립트: `I:/EXODUSER-Storage/demo-art/varco-trial/`. 재개 절차는 `REPORT.md`. `requests.json`을 삭제하고 재실행하지 않는다. 기존 실행 스크립트는 장부 존재 시 중복 생성을 거부한다. 충전이 필요할 경우 사용자 금액 승인이 필요하며 `I:/EXODUSER-Storage/codex-takeover/USER_CONFIRM.md` 끝에 차단 사항을 추가했다.

근거: [공식 생성·조회 명세](https://platform.nc-ai.com/en/reference/3d-image-to-3d), [402 설명](https://platform.nc-ai.com/en/docs/quickstart), [가격](https://platform.nc-ai.com/en/docs/pricing), [웹 라이선스 안내](https://3d.varco.ai/docs/release-notes/2026-10-12-choose-a-license-when-you-generate).
