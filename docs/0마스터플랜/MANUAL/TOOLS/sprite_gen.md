# TOOLS — sprite-gen(aldegad): 시트 조립·영상 프레임/루프·배경 분리 유틸 (2026-11-05, 클라우드 조사)

출처(CTO 11-05 전달): 사용자 공유 "오늘코딩" Shorts ③. 저장소 확인: `github.com/aldegad/sprite-gen` **[열림]**. 스타 수 "3.2k"는 발췌만(다른 집계 415~450) `[미검증]`.

## ① 목적 · 단계
- **중요 정정:** 이 도구의 핵심 경로(A 아틀라스, B video→loop)는 **AI 생성**(codex/OpenAI 이미지 생성, Grok Imagine 영상 생성)이다. 생성 메시·생성 스프라이트는 폐기(11-05 09:30)·스크립트 키 애니 금지와 같은 선상이므로 **생성 경로는 쓰지 않는다.**
- 쓸 수 있는 것 = **결정론 유틸 C·D·E만**: `video-frames`(레퍼런스 영상 프레임 추출), `video-loop`(주기 검출·루프 절단), `cutout`/`slice-sheet`(크로마·흰 배경 분리), `compose-atlas`(시트 조립 + `manifest.json.frame_layout`), `recolor-palette`/`recolor`(팔레트 변주), `export-aseprite`, `inspect-motion`(접지·발 접점 측정). CTO 사전 판단 "레퍼런스 영상 키프레임 추출 보조"와 일치.
- 적합 판단: **보조 도구로 조건부 적합.** 우리 영상 레퍼런스(노레위 등 공개 영상)에서 동작 타이밍·접점 프레임을 뽑아 G1 "동작 출처·타이밍 표"를 채우는 데 쓴다. 레퍼런스 영상의 프레임을 자산으로 반입하는 것은 금지(4.1 "레퍼런스 에셋 반입 금지").

## ② 입력 형식
- mp4(레퍼런스 클립, 로컬 파일), PNG 프레임 폴더, 기존 시트 PNG(마젠타/그린 크로마 또는 흰 배경), `recolor.spec.json`, 팔레트 JSON.

## ③ 옵션 전수표
라이선스 **Apache-2.0** · 최근 커밋 **2026-11-01**(PR #166 "retire(game-making)…", PR #165 "rife-425-default") **[열림]** · 의존: **Python 3.11+(CI는 3.14만)**, venv 필수, Pillow·NumPy, `ffmpeg`·`img2webp`(영상), RIFE 선택(`sprite-gen rife install`; 없으면 walk/run 루프는 "cut as filmed" 경고) · 생성 경로 자격증명(codex 로그인·`XAI_API_KEY`·`OPENAI_API_KEY`·`ANTHROPIC_API_KEY`)은 **우리는 쓰지 않음**.

| 명령·옵션 | 무엇을 바꾸나 | 우리 설정값 | 근거 |
|---|---|---|---|
| `video-frames <clip.mp4>` | 영상 → 프레임 PNG(ffmpeg) | 레퍼런스 클립 1개 → 프레임 폴더(자산 반입 금지, 타이밍 측정용) | README **[열림]**(플래그 미표기 → `--help`로 확인 `[미검증]`) |
| `video-loop <clip.mp4>` | 주기 검출 후 루프 절단(RIFE 있으면 이음 보정) → GIF/WebP/strip | idle·walk 레퍼런스의 **주기 프레임 수** 측정에만 | 〃 |
| `cutout <img.png> [--white-check]` | 흰/아이보리는 매트, 마젠타/그린은 크로마 엔진으로 배경 분리 | 우리 캡처 배경 마젠타 → `cutout` | 〃 |
| `slice-sheet --sheet sheet.png --chroma-key magenta --grid 3x2` | 다중 피규어 시트 → 셀별 컷아웃 | 우리 Blender 오프스크린 시트 분해 | 〃 |
| `unpack-atlas --atlas sheet.png` / `--pngs-dir folder/` | 기존 아틀라스 → 큐레이션 런 | 〃 | 〃 |
| `compose-atlas --run-dir <run>` | 프레임 폴더 → `sprite-sheet-alpha.png` + `manifest.json`(`frame_layout` 절대 rect, state별 fps·loop) | 우리 픽셀 렌더 프레임 시트 조립 후보(자체 스크립트와 비교) | 〃 |
| `recolor-palette --base sheet.png --out palette.draft.json` → `recolor --run-dir --spec recolor.spec.json` | 팔레트 추출·결정론 색 변주 | 등급 색 변주(C4) 실험용; 실버 헬 토큰으로 spec 작성 | 〃 |
| `export-aseprite --run-dir <run>` | Aseprite JSON(Phaser/Flame) | Unity Aseprite 임포터 경로 실험 | 〃 |
| `inspect-motion --source walk.strip.json --out motion.json [--contacts 0:4 --foot-box x,y,w,h --out stance.json]` | 동작 측정(접지·발 접점) | 레퍼런스 접점 프레임 표 | 〃(`--foot-box` 값 순서 미정의 `[미검증]`) |
| `--chroma-key magenta|green`, `--grid RxC`, `--white-check`, `--period`, `--overlap`, `--formats png,mp4` | 공통 옵션 | 마젠타, 기본 | README **[열림]** |
| **생성 경로**: `prepare/gen/gen-set/extract`, `video-canvas/video/video-set`, `--provider codex|grok|openai`, `--facing`, `--facing-fix`, `--handed`, `--states`, `scene-render` | AI 이미지·영상 생성 | **사용 금지**(생성 자산 폐기·유료 API) | 〃; DIRECTION_RESET 09:30 |
| 스킬 설치(`skill-installer --repo aldegad/sprite-gen`) | 에이전트 스킬 | 설치 안 함(CLI만, venv) | 〃 |

## ④ 절차 (Mac 실습용 — ①②만 필수라 여기서는 참고 절차)
1. venv(Python 3.11+) → `pip install -e .`(저장소 clone) → `ffmpeg`·`img2webp` 확인.
2. 레퍼런스 클립 `ref_walk.mp4` → `sprite-gen video-frames ref_walk.mp4` → 프레임 수·접점 프레임 기록 → `inspect-motion`으로 접점 표 → G1 타이밍 표에 기입. 프레임 이미지는 저장소·자산에 넣지 않음.
3. 우리 렌더 시트: Blender 오프스크린 시트(마젠타) → `slice-sheet --chroma-key magenta --grid 8x1` → `compose-atlas` → `manifest.json` 확인.

## ⑤ 출력 형식 · 네이밍
- `sprite-sheet-alpha.png` + `manifest.json`(frame_layout). 우리 규격 변환 전까지 `I:/EXODUSER-Storage/tm/spritegen/` 아래에만 둔다.

## ⑥ 검수 방법
- 조립 시트 프레임 rect가 입력 프레임과 1px 오차 없이 일치, 알파 가장자리 마젠타 번짐 0(3x 크롭).
- 루프 주기 측정값 vs 수동 계수 일치.

## ⑦ 금지 · 흔한 실패
- 생성 경로(gen/video) 실행 금지 — 유료·생성 자산 폐기 결정 위반.
- 레퍼런스 영상 프레임을 자산 폴더·저장소에 넣기 금지.
- Python 3.10 이하 미지원, 시스템 파이썬 사용 금지(venv만).
- RIFE 없이 walk/run 루프 결과를 "루프 완성"으로 보고하지 않는다(경고 상태).

## ⑧ 실습 기록
- Mac 실습 대기(선택). 기록: 버전·커밋, 명령, 측정값(주기·접점), SHA.
