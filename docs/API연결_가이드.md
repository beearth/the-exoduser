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
| GET | `/api/slots` | 개발 저장 슬롯 목록 `{ok:true,slots,development:true}`. 로컬 비데모 로비에서만 개발자 표시·슬롯 무제한. 출하 `node-main.js`는 development 표시 없음 |
| POST | `/api/save` | 게임 저장 `{slot, data}` |
| GET | `/api/load/:slot` | 세이브 로드 |
| DELETE | `/api/save/:slot` | 세이브 삭제 |
| GET | `/api/mats` | 악의(mats) 공유 풀 조회 |
| POST | `/api/mats` | 악의 공유 풀 업데이트 `{mats}` |
| POST | `/api/gpt-image` | OpenAI 이미지 생성 프록시 |


---

## 5. 에셋 생성 워크플로우

### 몬스터 스프라이트 (PixelLab)
```
1. docs/10ai에셋프롬프트모음/pixellab_monster_prompts.md에서 프롬프트 선택
2. tools/pixellab_request.mjs로 호출
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


### 2026-10-02 NW.js 공유 악의 실패 응답 생산 보강

| 대상·경로 | 현재 실패 응답 | 상태·검증 |
|---|---|---|
| node-main.js / POST /api/mats | readBody·JSON·clamp·직접 write 실패는 HTTP500 JSON `{ok:false,error:"Internal Server Error"}`를 headers/end 각1회로 마감. 성공은 기존 `{ok:true,mats}`이며 catch 밖에서 응답 | 생산 반영; 기존 test/nodeMainMats.test.js 4PASS(정상·malformed JSON·stream rejection·실제 ENOENT) |
| server.cjs / POST /api/mats | 기존 외부 catch의 HTTP500 text/plain 유지 | 파일 변경0. NW.js JSON과 wire 형식 차이를 보존 |

직접 write·clamp·정상 저장 계약과 세이브 슬롯 형식은 유지한다. 원자쓰기 후보·close/unlink cleanup 정책 미채택. 실제 HTTP/NW.js·성공 디스크 저장·재시작·Windows·fsync/crash/concurrency는 미검수이며 실물 앱 재빌드0이다. [저장 현행 계약](15%20세이브+데이터구조/15%20세이브+데이터구조.md).

## 2026-10-02 NW.js POST /api/save 실패 응답 계약

위 §4는 개발 `server.cjs` API이며 이번 변경은 NW.js `node-main.js`의 POST 슬롯 저장 분기다. 개발 outer catch/atomicSaveJSON 및 기존 mats 응답 형식은 변경하지 않는다. NW.js 기존 save의 request/JSON/쓰기 예외는 handler rejection·응답0이었고, 이번 catch에서 신규500 JSON을 시도한다.

| id / 입력·접점 | 현재 NW.js `node-main.js` 계약 | 검수·한계 |
|---|---|---|
| POST `/api/save` / catch 범위 | `await readBody`·JSON 해석·`sanitizeSlot`·truthy `body.data` 검사·직접 write를 catch; 실패는500 JSON `{ok:false,error:'Internal Server Error'}` | 응답 가능한 대역에서 writeHead/end 각1; 내부 code/path/message를 응답에 넣지 않음 |
| malformed JSON / request error / null body / sanitize 실패 | 위500; 쓰기0·성공200 ACK0 | 실제 소스·합성 요청/응답/메모리 파일 경계. JSON 본문 null은500, `{data:null}`은400 |
| JSON 해석·body 접근·sanitizeSlot 성공 + !body.data |400 JSON `{ok:false,error:'No data'}`, 쓰기0 | data missing/null/false/0/빈 문자열5입력, 이전 정규화 trace 동등 |
| 정상 저장 | `sanitizeSlot(body.slot||'default')`; data만 `JSON.stringify(body.data,null,2)` UTF-8 직접쓰기 완료 뒤200 `{ok:true,slot}` | 정상3입력의 slot/pretty bytes/write-before200·응답 전체 trace 동등; 저장 bytes에 끝개행 추가0 |
| 파일쓰기 예외 | 쓰기 시도1 뒤500, 성공200 ACK0; rollback 추가0 | 변경 전 메모리 오류는 이전 슬롯 유지, 부분 변경 뒤 오류는11문자 prefix 잔존. 실제 OS 부분쓰기 안전성 UNKNOWN |
| 400/200 응답 전송 | catch 밖; writeHead/end throw는 같은 Error로 거부,500 재시도0 | head1/end0 또는1 대역; 정상200 전송 throw는 이미 쓰기 시도1 |
| catch의500 전송 / 닫힌 response |500 전송 throw도 한 번의 시도 뒤 거부. closed 대역은 head1/end1이지만 delivered0 | 실제 wire 전달·response error event·프로세스 생존 UNKNOWN |
| 공통 `readBody` | data/end/error 구현 그대로 | aborted/close-only/timeout/리스너 cleanup 정책 변경0, 이번 실행0 |
| 개발 서버·저장 정책 | `server.cjs` outer500 및 atomicSaveJSON 경계 불변; NW.js 직접 write 유지 | 공용 atomic 후보·crash/fsync/동시 writer/실앱·실디스크 인수0 |

`sendJSON`은 기존 application/json·CORS `*` 헤더를 쓴다. `No data`400과 정상200의 전송을 catch 밖에 두어 응답 전송 자체의 throw를500으로 재시도하지 않는다. 실패500 전송 자체도 추가 catch/재시도를 하지 않는다. 따라서 head/end 호출1은 실제 수신1 보장이 아니다. 원자쓰기·공통 readBody abort/close 정책을 채택한 변경도 아니다.

새 actual-source 검수12/12 PASS, 생산 전 같은12그룹의4 PASS/8 FAIL은 별도 이력이다. `node --check node-main.js` 1회 exit0(모듈 실행0). 정상3+No data5 총8 trace는 실제 prepatch baseline 및 현재 AST로 복원한 메모리 control과 동등하다. 이8관측·내부 반례를12그룹에 추가 합산하지 않는다. 전문팀 기존4비교·mats 및 다른 검사 재실행0; 문서 담당 새·기존 test 실행0.

최종 소스 영수증: `tmp/mac-migration-runtime/continued-review-20261002/save-body-error-backup/receipt.json`, SHA-256 `c6e907a82876162eb06007cef854a1963380e5419965edfd4e70f666487c2e75`. [정확한 소스·전달/저장 한계](15%20세이브+데이터구조/SAVE_BODY_ERROR_RESPONSE_20261002.md). 슬롯50자·pretty UTF-8·끝개행0·직접 write-before200·저장 schema는 유지한다. 실HTTP/native앱·실파일 성공/부분실패·재시작·패키지 검수0이다.
