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

## Meshy AI API (3D 모델 생성)

| 항목 | 값 |
|------|-----|
| Base URL | `https://api.meshy.ai/openapi/v2` |
| 인증 | `Authorization: Bearer {MESHY_API_KEY}` |
| AI 모델 | `meshy-6` (최신) |
| 출력 포맷 | GLB, FBX, OBJ, USDZ, Blend, STL |
| 아트 스타일 | `realistic`, `sculpt`, `pbr` 등 |

### 워크플로우 (2단계)

1. **프리뷰** — 빠른 형태 생성 (텍스처 없음, ~2분)
   - `POST /text-to-3d` — `mode: "preview"`
2. **리파인** — 고퀄 텍스처 입힘 (~2분)
   - `POST /text-to-3d` — `mode: "refine"`, `preview_task_id` 필요

### 상태 확인
- `GET /text-to-3d/{task_id}`
- status: `PENDING` → `IN_PROGRESS` → `SUCCEEDED` / `FAILED`
- 완료 시 `model_urls.glb`에 다운로드 URL (pre-signed, auth 불필요)

### 스크립트 사용법
```bash
# 프리뷰 생성 + 대기 + 다운로드
node meshy_generate.cjs "dark gothic treasure chest, diablo style" --poll

# 리파인 (고퀄 텍스처)
node meshy_generate.cjs --refine PREVIEW_TASK_ID --poll

# 상태만 확인
node meshy_generate.cjs --status TASK_ID

# 다운로드만
node meshy_generate.cjs --download TASK_ID
```

### 파일 위치
- 스크립트: `meshy_generate.cjs`
- 결과물: `assets/3d/` 폴더에 GLB 저장
- 게임 적용: `game.html` chest3d 섹션에서 `GLTFLoader`로 로드

### 게임 내 3D 에셋 현황

| 에셋 | 파일 | Task ID | 상태 |
|------|------|---------|------|
| 보물상자 (리파인) | `assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a38.glb` | `019e0a38-4794-7f6a-b8ff-42a5fac41b59` | game.html 적용 완료 |
| 보물상자 (프리뷰) | `assets/3d/dark_gothic_medieval_treasure_chest__iro_019e0a30.glb` | `019e0a30-9563-7d95-bfc5-3f8469f7f90e` | 프리뷰 (사용 안함) |

### 비용
- 프리뷰: 10 크레딧/건
- 리파인: 별도 크레딧
- Pro 플랜 이상 필요
