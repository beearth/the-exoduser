# 웹 전용 미디어 경량 파생 후보 — 2026-11-01

## 범위와 결과

원본은 Git `58956eec7d35873d229d94d5244cb73f665ef49e` / tree `1ba1c6ca9ee1fd5239f209b659dd7dfa54c79b37`로 고정했다. `tools/web-runtime-manifest.mjs`의 `selectWebRuntimeFiles`와 같은 커밋 `build-nwjs.mjs`의 `FILES`를 실행해 **3,095개 / 4,629,181,769바이트** 선택 목록을 재현했다. Mac의 부분 복제에는 940개 블롭 크기가 `BAD`로 표시되어, 동일 tree SHA의 GitHub tree API 크기 메타데이터를 사용했다. 미디어 원본 내용은 Git 블롭에서 추출하고 각 파일의 Git blob SHA와 SHA-256을 검증했다.

| 종류 | 파일 | 원본 바이트 | 후보 바이트 | 절감 바이트 | 검증 |
|---|---:|---:|---:|---:|---|
| WAV → FLAC | 17 | 869,094,764 | 411,904,884 | 457,189,880 | 디코딩 16-bit PCM SHA-256, 48kHz/2채널/샘플 프레임 수 동일 |
| PNG → 무손실 WebP | 55 | 436,489,833 | 252,571,256 | 183,918,577 | 크기·디코딩 RGBA SHA-256·ICC 바이트 동일 |
| MP4 → 웹 H.264 | 1 | 102,204,634 | 75,253,813 | 26,950,821 | 1920×1080/30fps/3410프레임, AAC 패킷 5331개·ADTS SHA-256 동일 |
| **합계** | **73** | **1,407,789,231** | **739,729,953** | **668,059,278** | 후보 파일별 SHA-256·Git 원본 블롭 재대조 |

선택 총량에 이 73개 매핑을 적용하면 **3,961,122,491바이트**로 4,000,000,000바이트 한도 아래 **38,877,509바이트**가 남는다. 적용 후 최대 파일은 변경하지 않은 `video/warrior_story_v23_clean.mp4` 94,795,327바이트다. `audit_mapping.py`가 모든 3,095개 파일과 73개 매핑의 원본·후보 해시, 총량, 파일당 100,000,000바이트를 검증했다.

## 품질 확인

- FLAC 17개는 전부 원본 WAV와 디코딩 PCM 해시가 같다. 원본과 후보 모두 48,000Hz, 스테레오, 16-bit이며 각 파일의 샘플 프레임 수가 같다. `bgm-flac-manifest.json`에 파일별 수치와 해시가 있다.
- PNG 55개는 픽셀 크기를 줄이거나 자르지 않았다. 원본과 후보를 RGBA로 디코딩한 해시 및 ICC 바이트를 파일마다 대조했다. 로딩 원본 PNG 34개가 포함된다. 승인 로딩 원본 전체는 35개이며 나머지 한 파일은 이 PNG 변환 대상이 아니다. 로딩 21:9·32:9 WebP **105개**와 전체화면 21:9·32:9 WebP **128개**는 선택 목록에 있고 원본 그대로 유지했다. 전체화면 원본 64개도 공식 매니페스트에서 확인했다.
- 인트로 영상은 원본과 후보 모두 113.701초, H.264 High, 1920×1080, 30fps, 3410프레임이다. AAC는 `-c:a copy`로 복사했고 추출 ADTS SHA-256이 양쪽 모두 `12a99a49ea61618dc4c8c23aa921cf984ae9f0f7219bea1df50fe1411aed9435`다. 전체 프레임 비교 SSIM `0.991173`, 평균 PSNR `48.662197dB`, 최저 `42.731570dB`다. 사전 기준은 전체 SSIM 0.98 이상, 평균 PSNR 40dB 이상과 실제 1배율 표본에서 눈에 띄는 손상 없음이었다. 5·45·90초의 원본/후보 1배율 PNG를 직접 비교해 이 세 표본을 PASS로 판정했다. 이는 전 프레임 시각 PASS 주장이 아니다. `review/silent-preview-87-93.mp4`는 소리 없는 6초 미리보기다.
- 기존 16:9 영상은 1920×1080으로 유지했고 가로로 늘이거나 3840으로 업스케일하지 않았다. 기존 21:9·32:9 배경 합성/영상 레이어 계약을 적용한 실제 웹 16:9·21:9·32:9 재생, 메뉴/로딩 UI 잘림, 색 관리 검수는 **PENDING**이다.

브라우저 형식 선택 근거: [MDN WebP](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types), [MDN FLAC](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Audio_codecs), [MDN MP4/H.264/AAC](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Video_codecs). 실제 이 게임의 브라우저 소비 검수는 아직 필요하다.

## 배포 연결 경계

`web-derivative-routing-proposal.json`은 73개 원래 요청 URL → 후보 파일·MIME·해시의 **제안**이다. 게임의 `.wav`/`.png` 요청을 새 `.flac`/`.webp`로 연결하고 `audio/flac`/`image/webp` 및 `video/mp4`를 정확히 내보내는 패키징/서버 작업이 필요하다. 확장자만 변경한 배포는 검증되지 않았다. 현재 프로젝트 소스·분기·커밋·배포는 변경하지 않았다.

두 선택 경로 `assets/map/ch1/다운로드 (15).png`와 분해형 한글 경로는 같은 Git 블롭이며 Mac 파일시스템에서 같은 물리 파일로 정규화된다. 제안 매니페스트에는 두 원래 URL을 모두 기록하고 한 후보 물리 파일을 가리키게 했다. 전송 총량은 두 논리 경로의 후보 바이트를 각각 세어 보수적으로 계산했다.

처음 시험한 제작용 맵 원본 7개는 공식 선택기에서 제외됨을 확인해 `review/authoring-only/`에 격리하고 절감량에서 제외했다. 원본 Git 블롭은 변경하지 않았다.

## 재현 파일

- `make_selection.mjs`: 고정 tree 메타데이터와 고정 선택기/FILES로 3,095개 목록 재현.
- `build_derivatives.py`: WAV 17개 → FLAC, 원본 Git 블롭·PCM·프레임 수 검증.
- `build_runtime_images.py`: 공식 선택 목록의 PNG → 무손실 WebP, 픽셀·ICC 검증. 로딩 원본을 먼저 처리하고 절감 목표에 도달하면 멈춤.
- `rebuild_video.sh`: 고정 영상 블롭에서 H.264/AAC 복사 후보 재생성.
- `audit_mapping.py`: 후보 73개와 선택 총량·100MB 파일 한도 검증.
- `web-closure-selection.json`, `bgm-flac-manifest.json`, `runtime-image-webp-manifest.json`, `video-candidate-manifest.json`, `web-derivative-routing-proposal.json`: 파일별 근거.

사용한 인코더는 기존 로컬 `ffmpeg 4.4` 및 기존 Pillow 11.3.0 환경이다. 새 설치·유료 API·원본 수정·외부 배포는 없었다.
