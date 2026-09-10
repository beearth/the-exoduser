# 시작 타이틀 선명도 개선 — 2026-09-10

사용자가 제공한 초광폭 화면에서 애니메이션과 로고·작은 문구가 흐려지는 문제를 수정했다. `index.html` phase 2의 여성 캐릭터 타이틀 화면에 적용한다.

| 항목 | 현행 값·설계 |
|---|---|
| 원인 | SD 영상 1920×768 중 실제 그림 높이 616px를 1440px로 확대(약 2.34배). 로고·영문 문구가 영상에 구워져 함께 흐려짐. 기존 하단 안내는 15px 캔버스 글자·shadowBlur 8·불투명도 0.2~0.9 |
| HD 에셋 | `video/title_motion_hd.mp4`, 3840×1536, H.264 yuv420p, 24fps, 90프레임, 3.75초, 무음, 7,612,715바이트 |
| 제작 | `python tools/build_title_clarity.py`; imageio_ffmpeg 제공 FFmpeg. `scale=3840:1536:flags=lanczos,unsharp=5:5:0.4:3:3:0,setsar=1`, libx264 threads 4, preset slow, CRF 16, GOP 24, faststart |
| 보정 한계 | 기존 승인된 루프의 확대·약한 휘도 선명도 보정. 네이티브 4K 제작/손실 디테일 복원으로 표기하지 않음. 프레임 수·속도·구도·캐릭터 애니메이션 유지 |
| 미디어 대체 | HD 오류 → `dataset.sdFallback=1` 설정 후 SD 1회 → SD 오류 시 `img/title_art_1.png`. SD 원본 1920×768·2,241,229바이트 보존. 최초 로딩은 정지 아트, 정상 영상 이후 일시 buffering은 마지막 프레임 유지 |
| 캐시 | HD `v=20260910-clarity1`, SD `v=20260908-loop2` |
| 로고 요소 | `#splashTitleBrand` SVG viewBox `0 0 1983 793`, role=img 및 전체 브랜드 aria-label. EXODUSER / HELL LORD / THE WORLD WILL FALL. THE EXODUS WILL RISE. |
| 로고 타이포 | Georgia → Times New Roman → serif. EX x224/y404/46px/weight600/textLength89, DUSER x407/y404/46px/weight600/textLength270. 기본색 #f1eee6. HELL LORD x450/y447/18px/자간8/#c44232. 태그라인 x450/y474/11.5px/textLength375/자간2 |
| 붉은 O·장식 | O 중심365,388/반지름17/선3/#b52e25, 십자 선1.6. 가로선 x207~693/y422/1.4, gradientUnits=userSpaceOnUse. 하단 별 x432~468/y486~516/선1.2/#af392d |
| 로고 배경 | `img/title_clean_plate_20260910.png`, 1983×793. 원본 정지 아트에서 문자만 지운 배경. 전체 영상을 대체하지 않고 왼쪽 문자 영역만 마스크 합성 |
| 배경 마스크 | `titlePlateMask`: userSpaceOnUse x140/y290/w610/h300. 흰 rect x178/y332/w535/h203, Gaussian stdDeviation12. 필터 영역 x−20%/y−30%/w140%/h160%. 배경 이미지 로딩 실패 시 SVG 숨김·기존 영상 로고 유지 |
| SVG 배치 | 영상/정지 아트와 같은 dx, width=dw. top=`−80/636*h`, height=`dw*793/1983`. opacity=`min(1,elapsed/1000)`. 그림 구도와 함께 크롭 |
| 그림 배치 | HD sy156/sh1232, SD sy78/sh616, 정지 아트 sy80/sh636. `dh=h`, `dw=dh*titleWidth/sh`, `dx=max((w−dw)/2,−dw*.1)`. 기존 상하 채움·비율·왼쪽 로고 보호 유지 |
| 하단 안내 | `#splashTitlePrompt` 리프 노드에 `_TL('아무 키나 눌러 계속')`. left50%/top92%/translate(−50%,−50%), z-index2, pointer-events:none. elapsed>1200ms 표시 |
| 안내 스타일 | Noto Sans KR/sans-serif, weight500, `clamp(17px,1.2vw,26px)`, line-height1.4, 자간.06em, #f1e9dc. 그림자 `0 1px 2px #000,0 2px 5px #000`. opacity=`fadeIn*(.8+sin(elapsed*.0018)*.15)` (페이드 후 .65~.95) |
| 캔버스 | 기존 devicePixelRatio 백버퍼 유지, imageSmoothingEnabled=true/imageSmoothingQuality=high. elapsed>1000ms 후 floor(video.currentTime*24)·CSS 폭·높이 모두 같으면 영상 재그리기 생략. 네이티브 안내 opacity는 RAF 갱신 |
| 종료 | nextPhase에서 SVG·안내 숨김. 기존 영상 pause/src 제거/load 및 visibilitychange 정리 유지. 입력 대기·클릭/키/패드·로비 스킵 계약 유지 |
| 패키징 | 기존 `build-nwjs.mjs`가 img/video 디렉터리 포함. 이번 작업은 로컬 소스·에셋 반영이며 Steam 배포 빌드는 별도 |

## 배경 편집 기록

내장 `image_gen` 편집 모드, 참조 `img/title_art_1.png`. 결과 `img/title_clean_plate_20260910.png`. 생성 원본은 `C:/Users/심도진/.codex/generated_images/01a08547-ddbf-7361-8075-7d92a7c96cd0/exec-d74b3177-24df-4f6d-837e-8906299b781e.png`. 생성 결과에서 캐릭터 영역은 런타임에 사용하지 않는다.

정확한 요청 프롬프트:

```text
Edit target: the attached very wide dark fantasy title illustration. Precise object removal ONLY. Remove ALL typography and red logo/decorative marks in the LEFT section: EXODUSER, HELL LORD, THE WORLD WILL FALL. THE EXODUS WILL RISE., the red horizontal rule and the small red ornament below. Reconstruct the dark ruined towers, haze and rocky environment behind these letters so that this left area becomes a natural seamless EMPTY background. Keep that area dark, low contrast, and unobtrusive. Preserve absolutely the exact image framing, aspect ratio, black top and bottom letterbox bands, woman, face, hair, clothes, sword, clouds, all other objects and positions. Do not add any text, logo, symbol, character, or change art style. This is a clean background plate for compositing crisp native UI lettering over the original animation; do not redesign the scene. Output same very wide 1983x793 composition, highest available detail.
```

## 검증

| 검증 | 결과·증거 |
|---|---|
| 변경 전 | `tools/verify_title_clarity.py --baseline`: 5120×1440 DPR1 / 1920×1080 DPR2 기존 화면 캡처. 새 네이티브 문자 요구 검증은 변경 전 실패 |
| 미디어 | FFmpeg 전체 디코딩 PASS. 실제 메타데이터 3840×1536/h264/yuv420p/24fps/3.75초, count_frames_and_secs=90/3.75 |
| 실제 Chromium | `python tools/verify_title_clarity.py`: 초광폭·DPR2 반복 영상, 전체 영상 실패→정지 아트, 배경 PNG 실패→원래 로고, HD 실패→SD 영상, `?lobby=1` 스킵 총 6경우. 실제 해상도·DOM 문자·입력 종료·미디어 해제·pageerror 확인 |
| 회귀 | worldIntroPlayer/worldIntroHandoff/lobbyCharacterSelectionInfo/lobbyStageInfo 21테스트 PASS. index inline script 4개 구문 파싱 PASS |
| 증거 | `captures/title_clarity_20260910/before.json`, `report.json`, before/after PNG. 초광폭·고밀도 최종 캡처 직접 검수: 글자 획 선명도 개선·하단 안내 가독성·인물 구도 확인 |
| 범위 | Chromium 로컬 검증. 실물 게임패드·Steam 설치본·다른 GPU 재생 성능은 이번 검증 범위 밖 |
