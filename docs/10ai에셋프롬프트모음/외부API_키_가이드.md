# 외부 AI API 키 가이드

## xAI (Grok) API

| 항목 | 값 |
|------|-----|
| 엔드포인트 | `https://api.x.ai/v1/images/generations` |
| 인증 | `Authorization: Bearer {XAI_API_KEY}` |
| 이미지 생성 모델 | `grok-imagine-image` (일반), `grok-imagine-image-pro` (고품질) |
| 비디오 생성 모델 | `grok-imagine-video` |
| 텍스트 모델 | `grok-3`, `grok-3-mini`, `grok-4-0709` 등 |
| 응답 형식 | URL 반환 (`data[0].url`) — 임시 URL이므로 즉시 다운로드 |

### 키 관리
- **키는 세션마다 갱신될 수 있음** — 매 작업 시작 시 유효성 확인 필요
- 환경변수: `XAI_API_KEY`
- 키가 안 먹히면 사용자에게 새 키 요청

### 사용 예시 (bash)
```bash
export XAI_API_KEY="xai-..."
curl -s https://api.x.ai/v1/images/generations \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"grok-imagine-image","prompt":"...","n":1}'
```

### 사용 가능 모델 목록 조회
```bash
curl -s https://api.x.ai/v1/models -H "Authorization: Bearer $XAI_API_KEY"
```

### 주의사항
- `size` 파라미터 미지원 (400 에러)
- 응답이 URL이면 즉시 curl로 다운로드 (임시 URL 만료됨)
- b64_json 반환 시 Buffer.from(b64,'base64')로 직접 저장

## PixelLab API
- MCP 서버 연결 방식 (Blender MCP처럼)
- 연결 끊기면 재시작 필요
- 32x32 오브젝트 생성, 64프레임 리뷰 → select

## Ludo AI API
- MCP 서버 연결 방식
- API 키 필요 (현재 미설정 — 403)
- createImage, editImage, animateSprite 등
