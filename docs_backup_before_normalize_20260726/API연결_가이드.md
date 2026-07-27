# API 연결 가이드

프로젝트에서 사용 중인 외부 API 전체 목록, 연결 방식, 활용 방법을 정리한 문서.

---

## 1. 전체 API 현황

| # | API | 제공자 | 용도 | 키 변수 | 상태 |
|---|------|--------|------|---------|------|
| 1 | **PixelLab** | pixellab.ai | 픽셀아트 스프라이트 생성 | `PIXELLAB_API_KEY` | 활성 |
| 2 | **OpenAI (DALL-E)** | openai.com | 이미지 생성 (UI, 에셋) | `OPENAI_API_KEY` | 활성 |
| 3 | **ElevenLabs** | elevenlabs.io | TTS 음성 생성 | `ELEVENLABS_API_KEY` | 활성 |
| 4 | **xAI (Grok)** | x.ai | 이미지 생성 (보스, VFX) | `XAI_API_KEY` | 활성 |
| 5 | **Supabase** | supabase.co | DB/인증 (랭킹 등) | `SUPABASE_KEY` | 설정됨 |
| 6 | **Ludo AI** | each::sense | 이미지/음악/3D/스프라이트 | MCP 연결 | 활성 |
| 7 | **Google Fonts** | fonts.googleapis.com | 웹폰트 로딩 | 없음 (공개) | 활성 |
| 8 | **Vercel** | vercel.com | 배포/CI | `VERCEL_OIDC_TOKEN` | 설정됨 |

---

## 2. API 키 관리

### 파일 위치
```
G:\hell\.env              ← 메인 키 파일 (5개)
G:\hell\.env.local         ← Vercel 배포용 토큰
```

### .env 구조
```env
PIXELLAB_API_KEY=xxx
PIXELLAB_BASE_URL=https://api.pixellab.ai
OPENAI_API_KEY=sk-proj-xxx
ELEVENLABS_API_KEY=sk_xxx
XAI_API_KEY=xai-xxx
```

> **주의**: `.env`는 `.gitignore`에 포함. 커밋 금지.

---

## 3. 각 API 상세

---

### 3-1. PixelLab API (픽셀아트 스프라이트)

**용도**: 몬스터/보스 스프라이트 자동 생성 (8방향, 걷기 애니메이션)

**연결 방식**:
- Electron: `Electron/main.js`에서 `/api/pixellab/proxy` 프록시 엔드포인트
- CLI: `tools/pixellab_request.mjs` 스크립트
- MCP: Claude Code에서 블렌더 MCP 또는 직접 호출

**호출 예시** (curl):
```bash
curl -X POST https://api.pixellab.ai/v1/generate \
  -H "Authorization: Bearer $PIXELLAB_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "top-down dark fantasy skeleton warrior",
    "size": 64,
    "n_directions": 8,
    "outline": "single color black outline",
    "shading": "detailed shading"
  }'
```

**출력 위치**: `img/all_assets/pixellab_all/`, `img/all_assets/monsters/`

**주요 파라미터**:
| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| `size` | 스프라이트 크기 | 64 (일반), 128 (보스) |
| `n_directions` | 방향 수 | 8 |
| `body_type` | 체형 | humanoid, quadruped 등 |
| `ai_freedom` | AI 자유도 | 600 |
| `detail` | 디테일 수준 | high detail |

**프롬프트 레퍼런스**: `docs/10ai에셋프롬프트모음/pixellab_monster_prompts.md`
- BODY 10종 × TRAIT 15종 × ATTACK 10종 × COLOR 5종 = 7,500+ 조합

---

### 3-2. OpenAI API (DALL-E 이미지 생성)

**용도**: UI 아이콘, 배경, 프레임, 기타 에셋 생성

**연결 방식**: `server.cjs`에서 `/api/gpt-image` POST 엔드포인트

**서버 엔드포인트**:
```
POST http://localhost:3333/api/gpt-image
Content-Type: application/json

{
  "prompt": "pixel art fire icon, dark fantasy style, 64x64",
  "model": "gpt-image-1",
  "size": "1024x1024",
  "quality": "auto",
  "n": 1
}
```

**내부 동작**:
1. `server.cjs`가 OpenAI `/v1/images/generations`로 프록시
2. base64 응답을 `img/gpt_gen/gpt_{timestamp}_{idx}.png`로 자동 저장
3. URL 방식 응답은 URL만 반환

**출력 위치**: `img/gpt_gen/`

**프롬프트 레퍼런스**:
- `docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md` — 스탯/패널/원소 아이콘
- `docs/10ai에셋프롬프트모음/UI_프레임_배경_생성프롬프트.md` — UI 프레임/배경

---

### 3-3. ElevenLabs TTS API (음성 생성)

**용도**: 게임 보이스오버, NPC 대사, 시네마틱 음성

**연결 방식**: `tools/elevenlabs_tts.mjs` CLI 도구 + `src/elevenlabsProxy.js`

**호출 예시** (curl):
```bash
curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}" \
  -H "xi-api-key: $ELEVENLABS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "너는... 살아남지 못할 것이다.",
    "model_id": "eleven_multilingual_v2",
    "voice_settings": {
      "stability": 0.5,
      "similarity_boost": 0.75
    }
  }'
```

**출력 위치**: `sfx/voice/`
**포맷**: MP3 (44.1kHz, 128kbps)

**주요 파라미터**:
| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| `model_id` | TTS 모델 | `eleven_multilingual_v2` |
| `output_format` | 출력 포맷 | `mp3_44100_128` |
| `stability` | 음성 안정도 | 0.5 |
| `similarity_boost` | 유사도 강화 | 0.75 |

---

### 3-4. xAI / Grok API (이미지 생성)

**용도**: 보스 스프라이트, VFX 스프라이트 시트, 컨셉아트

**연결 방식**: Claude Code에서 직접 curl 호출 (서버 프록시 없음)

**호출 예시** (curl):
```bash
curl -X POST "https://api.x.ai/v1/images/generations" \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "grok-imagine-image",
    "prompt": "pixel art sprite sheet, 8 frames...",
    "n": 1
  }'
```

**사용 가능 모델** (2026-04 기준):
| 모델 | 용도 |
|------|------|
| `grok-imagine-image` | 이미지 생성 (기본) |
| `grok-imagine-image-pro` | 이미지 생성 (고품질) |
| `grok-imagine-video` | 비디오 생성 |
| `grok-3` / `grok-4-*` | 텍스트 (이미지 아님) |

**출력 위치**: `img/grok_gen/`
- 결과 이미지 + JSON 메타데이터 함께 저장
- 비용: 약 $0.07/이미지 (700M USD ticks)

**생성 이력**:
| 파일 | 용도 | 날짜 |
|------|------|------|
| `boss_north/south/east/west.png` | 보스 4방향 스프라이트 | — |
| `grok_boss_sprite.png` | 보스 스프라이트 | — |
| `grok_attack_motion.png` | 공격 모션 | — |
| `grok_tele_effect.png` | 텔레포트 이펙트 | — |
| `burn_death_sheet.png` | 불타죽는 사망 VFX 8프레임 | 2026-04-25 |

**후처리 파이프라인** (Python):
1. Grok으로 원본 생성 (1024+ px)
2. PIL/numpy로 배경 제거 (검정→투명)
3. 프레임 분할 + 정사각형 정렬
4. 최종 스프라이트 시트 → `img/` 폴더에 배치

---

### 3-5. Supabase (DB/인증)

**용도**: 서버 세이브, 랭킹, 인증 (구성됨)

**연결 방식**: `game.html`에서 CDN으로 SDK 로드 + 직접 연결
```javascript
const SUPABASE_URL = 'https://tevlznuhjqcnzgewlswx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_chAwadci1zVQNEKPC__s_w_7K3Oz_WP';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
```

**참조 파일**: `game.html` (2852행), `index.html` (267행)

---

### 3-6. Ludo AI (MCP 연결)

**용도**: AI 이미지/음악/3D모델/스프라이트 생성 (Claude Code MCP 경유)

**MCP 도구 목록**:
| 도구 | 기능 |
|------|------|
| `createImage` | 이미지 생성 |
| `editImage` | 이미지 편집 |
| `removeBackground` | 배경 제거 |
| `animateSprite` | 스프라이트 애니메이션 |
| `createMusic` | 음악 생성 |
| `createSoundEffect` | 효과음 생성 |
| `createSpeech` | 음성 생성 |
| `create3DModel` | 3D 모델 생성 |
| `generateWithStyle` | 스타일 기반 생성 |

**호출 방식**: Claude Code 대화에서 MCP 도구로 직접 호출

---

## 4. 로컬 서버 API (server.cjs)

`node server.cjs` → 포트 3333

| 메서드 | 엔드포인트 | 기능 |
|--------|-----------|------|
| GET | `/api/slots` | 세이브 슬롯 목록 |
| POST | `/api/save` | 게임 저장 `{slot, data}` |
| GET | `/api/load/:slot` | 세이브 로드 |
| DELETE | `/api/save/:slot` | 세이브 삭제 |
| GET | `/api/mats` | 악의(mats) 공유 풀 조회 |
| POST | `/api/mats` | 악의 공유 풀 업데이트 `{mats}` |
| POST | `/api/gpt-image` | OpenAI 이미지 생성 프록시 |

**Electron 추가 엔드포인트**:
| 메서드 | 엔드포인트 | 기능 |
|--------|-----------|------|
| POST | `/api/pixellab/proxy` | PixelLab API 프록시 |
| GET | `/api/pixellab/status` | PixelLab 설정 확인 |

---

## 5. 에셋 생성 워크플로우

### 몬스터 스프라이트 (PixelLab)
```
1. docs/10ai에셋프롬프트모음/pixellab_monster_prompts.md에서 프롬프트 선택
2. tools/pixellab_request.mjs 또는 Electron 프록시로 호출
3. img/all_assets/pixellab_all/에 저장
4. tools/sync_ch1_monster_atlas_sources.mjs로 아틀라스 통합
```

### VFX 스프라이트 시트 (Grok)
```
1. Grok API로 스프라이트 시트 생성 (grok-imagine-image)
2. Python으로 후처리 (배경 제거, 프레임 분할)
3. img/vfx_*.png로 저장
4. game.html에서 registerVFX()로 등록
5. playVFXAng()으로 재생
```

### UI 아이콘 (OpenAI DALL-E)
```
1. docs/10ai에셋프롬프트모음/UI_아이콘_GPT_생성프롬프트팩.md에서 프롬프트 선택
2. POST /api/gpt-image로 호출
3. img/gpt_gen/에 자동 저장
4. 필요한 위치로 복사/리네임
```

### 음성 (ElevenLabs)
```
1. tools/elevenlabs_tts.mjs로 호출
2. sfx/voice/에 저장
3. game.html에서 playSample()로 재생
```

---

## 6. 비용 참고

| API | 단가 (대략) | 비고 |
|-----|------------|------|
| PixelLab | 크레딧 기반 | 월 한도 있음 |
| OpenAI DALL-E | ~$0.04/이미지 (1024×1024) | gpt-image-1 기준 |
| ElevenLabs | ~$0.30/1000자 | eleven_multilingual_v2 |
| Grok | ~$0.07/이미지 | grok-imagine-image |
| Supabase | Free tier | 500MB DB, 1GB 스토리지 |
