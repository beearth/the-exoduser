# TOOLS — PixelOE: 픽셀 아트 정제(아웃라인 확장 → 대비 다운스케일 → 팔레트 양자화) (2026-11-05, 클라우드 조사)

출처(CTO 11-05 전달): 사용자 공유 "오늘코딩" Shorts "AI 게임 리소스 제작 오픈소스 8가지 1편"의 ①. 저장소는 이 세션에서 찾아 확인했다.

## ① 목적 · 우리 파이프라인의 단계
- **리그 3D → 저해상도 픽셀 렌더(PixelActorPass)의 후처리 후보 1순위**(CTO 사전 판단). 실시간 저해상 렌더 프레임(또는 캡처 시트)을 "그리드가 정확하고, 윤곽이 살고, 팔레트가 제한된 픽셀"로 정제한다. AI·신경망 없음(고전 영상처리)이라 결정론적이고 무료다.
- 적합 판단: **적합(조건부).** 윤곽 확장(outline expansion)은 작은 캐릭터(24~48px급)에서 눈·장신구·문양이 사라지는 문제를 직접 겨냥한다. 단 **디더링은 끈다**(점 금지 4.2-7). 팔레트는 실버 헬 토큰에서 뽑은 고정 팔레트로 양자화(k-means 자동 팔레트는 톤이 흔들림 → 고정 팔레트 지정 가능 여부는 실습에서 확인).
- 실시간 적용 여부: 라이브러리는 Python(torch/Slang)이라 **Unity 런타임이 아니라 오프라인(스프라이트 시트·검수 비교판·레퍼런스 생성)**에 먼저 쓴다. 실시간 셰이더 이식은 알고리즘(대비 기반 패치 선택 + 아웃라인 가중 erosion/dilation)을 참고해 별도 결정.

## ② 입력 형식
- RGB(A) 이미지(PNG/WebP), 해상도 임의. 우리 입력 = PixelActorPass 결과 캡처(예 1920×1080 중 캐릭터 크롭 256~512px) 또는 Blender 오프스크린 렌더 프레임 시퀀스. 알파 채널 처리는 README에 없음 → 배경 마젠타 크로마 후 cutout `[미검증]`.

## ③ 옵션 전수표
저장소 `github.com/KohakuBlueleaf/PixelOE` **[열림]** · 라이선스 **Apache-2.0** · 최근 커밋 **2026-09-28 "bump version to 1.0.1"** **[열림]** · PyPI `pixeloe` · 의존: Python, torch(CPU 가능), OpenCV/NumPy(legacy), `slangpy`(Slang 백엔드: Windows x64·Linux x64/arm64·**macOS 26+ Apple Silicon**), CUDA 선택.

| 옵션(torch/Slang `pixelize()`) | 무엇을 바꾸나 | 우리 설정값 | 근거 |
|---|---|---|---|
| `pixel_size=6` | 출력 1픽셀이 입력 몇 px인가(블록 크기). 입력을 배수로 패딩 | 캐릭터 크롭 256px → 캐릭터 높이 48px 목표면 **5~6**; 1-1 저해상 패스 배율과 일치시킴 | src/pixeloe/torch/pixelize.py **[열림]** |
| `thickness=3` | 아웃라인 확장 두께(0 = 끔) | **2**(얇은 문양·장신구 보존, 3은 뭉침 위험 → 비교판) | 〃 |
| `mode="contrast"` | 다운스케일 방식: `contrast`(대비 기반) / `k_centroid` / `lanczos` / 기타 interpolate 모드(`nearest`·`bicubic`) | `contrast`(기본) vs `k_centroid` 비교판 2열 | 〃; README **[열림]** |
| `sharpen_mode=None`, `sharpen_factor=0.5` | 확장 뒤 선예화 `unsharp`/`laplacian` | None(선예화는 점·잡티 유발) | 〃 |
| `do_color_match=True` | 결과 색을 원본에 재매칭 | True | 〃 |
| `do_quant=False`, `num_colors=32`, `quant_mode="kmeans"`(`weighted-`/`repeat-` 접두) | 팔레트 양자화·색 수·알고리즘 | **True, 16~24색**, `repeat-kmeans`; 실버 헬 고정 팔레트 주입 가능 여부 `[미검증]`(없으면 후단에서 팔레트 매핑) | 〃 |
| `dither_mode="ordered"` | 양자화 디더(ordered / error-diffusion) | **디더 끔** — 점 금지. 끄는 값(`None`/`"none"`) 유효 여부 `[미검증]` → 불가하면 do_quant 끄고 외부 팔레트 매핑 | 〃; CLAUDE.md 4.2-7 |
| `no_post_upscale=False` | True면 다운스케일 해상도 그대로 출력 | **True**(시트는 원 크기 저장, 확대는 엔진) | 〃 |
| `weight_mapping="current"`, `weight_normalize="global"` | 아웃라인 가중치 매핑·정규화 | 기본 | 〃 |
| `local_stats="lattice"` / `"sliding"`, `stat_padding="zero"/"replicate"` (Slang) | 통계 창 방식·가장자리 | sliding(정확), replicate | src/pixeloe/slang/pixelize.py **[열림]** |
| `colorfix_blur="exact"`, `blur_impl`, `blur_rank=1` (Slang) | 색 매칭 블러 구현 | 기본 | 〃 |
| `backend` = auto / torch / cuda / vulkan / d3d12 / cpu, 환경변수 `PIXELOE_BACKEND` | 연산 백엔드 | Mac: auto(Slang macOS 26+) 아니면 torch cpu | README **[열림]** |
| legacy CLI `pixeloe.pixelize in -O out -M mode -S target_size -P patch_size -T thickness --contrast --saturation --colors --no_color_matching --no_upscale --no_downscale` | 구 API(폐기 예정) | 쓰지 않음(torch API로 스크립트 파일 실행) | README **[열림]** |
| Slang CLI `pixeloe.slang in out --backend --target-size --pixel-size` | 간단 실행 | 1차 비교판에 사용 | README **[열림]** |
| ComfyUI 노드 PixelOE / OutlineExpansion / PreResize · Gradio 데모 | GUI | 쓰지 않음(무창 원칙) | README **[열림]** |

## ④ 절차 (Mac 실습용: 입력 파일 · 명령 · 기대 출력)
1. 입력: `I:/EXODUSER-Storage/tm/pixeloe/in/hero_idle_0000.png`(PixelActorPass 캡처, 캐릭터 크롭 256×256, 배경 마젠타 #FF00FF) 10프레임.
2. 설치(Mac venv): `python -m pip install pixeloe` (torch 포함 여부 확인; Slang은 macOS 26+에서 자동).
3. 스크립트 파일 `tools/tm/pixeloe_run.py`(stdin 금지)로 실행:
   ```
   from pixeloe.torch.pixelize import pixelize  # 경로는 설치본 확인
   # img → tensor [1,3,H,W] 0..1 ; pixelize(img, pixel_size=5, thickness=2, mode="contrast",
   #   do_quant=True, num_colors=20, quant_mode="repeat-kmeans", dither_mode=<끔>, no_post_upscale=True)
   ```
   비교 열: A `thickness=0`(아웃라인 없음) / B `thickness=2` / C `thickness=3` / D `mode=k_centroid`.
4. 기대 출력: `out/hero_idle_0000_{A..D}.png`(51×51 등 1/5 해상도), 3x 확대 비교판 1장 `MANUAL/img/tools-pixeloe-board.png`(원본 저해상 렌더 ↔ A~D).
5. 판정: 눈·얼굴 문양·장신구 식별 여부(LOCK 대조표), 3x 크롭 점 0, 팔레트가 실버 헬 톤 안.

## ⑤ 출력 형식 · 네이밍
- PNG(RGBA), 원 저해상 크기(no_post_upscale). `CH_<영웅>_<동작>_<프레임>_poe.png`. 시트 조립은 pixel_fx/sprite_gen 도구가 아니라 우리 시트 스크립트(미정).

## ⑥ 검수 방법
- 같은 프레임 전·후(PixelActorPass 원본 ↔ PixelOE) 1x·3x, 10초 무음 영상 1개(깜빡임·프레임 간 팔레트 흔들림 확인 — k-means가 프레임마다 다른 팔레트를 뽑으면 FAIL → 고정 팔레트 필요).
- 점 0(디더 끔 확인), 윤곽 뭉침 0, LOCK 요소 식별.

## ⑦ 금지 · 흔한 실패
- 디더 켬(ordered/error-diffusion) 금지 — 잔점으로 FAIL.
- 프레임별 독립 k-means → 애니에서 색 떨림. 팔레트는 1회 뽑아 고정.
- `--upscale`로 키운 결과를 엔진에 넣지 않는다(엔진에서 Point 필터 확대).
- legacy CLI 의존 금지(폐기 예정).
- 이것은 "픽셀 아트 생성기"가 아니다. 입력 품질(리그·조명·실루엣)이 나쁘면 정제로 못 살린다.

## ⑧ 실습 기록
- Mac 실습 대기. 기록: pixeloe 버전, 백엔드, A~D 설정, 비교판 경로, 점 수, 팔레트 고정 방법, SHA.
