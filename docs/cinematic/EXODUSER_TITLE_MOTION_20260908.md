# 시작 화면 원본 이미지 미세 움직임 영상 (2026-09-08)

사용자 요청: 기존 시작 화면 그림의 구도를 유지하면서 움직임만 추가한 영상을 제작한다. 후속 요청에 따라 `index.html`의 FDG 다음 타이틀 단계에 연결했다.

| 항목 | 결과 |
|---|---|
| 원본 | `C:/Users/심도진/Downloads/ChatGPT Image 2026년 7월 26일 오후 09_32_10.png`, PNG RGB, 1983×793 |
| 입력 정규화 | 1920×768로 축소 후 위·아래 156px 검정 여백을 추가한 1920×1080 JPEG |
| 생성 | Higgsfield `kling3_0_turbo`, 시작 이미지 1장, 1080p, 5초 요청 |
| 생성 작업 ID | `62db9d80-e483-4bff-9346-7858d6c48a2a` |
| 원본 생성물 | `output/cinematic/exoduser_title_motion_raw_20260908.mp4`, 1920×1080, 24fps, 121프레임, 5.042초, AAC 오디오 포함 |
| 최초 제작 영상 | `output/cinematic/exoduser_title_motion_20260908.mp4`, 원본 보관 |
| 최초 제작 사양 | MP4/H.264, 1920×768, 24fps, 120프레임, 정확히 5초, 무음, 2,513,548바이트 |
| 최종 루프 영상 | `output/cinematic/exoduser_title_smooth_loop_20260908.mp4` → `video/title_motion.mp4`, 1920×768, 24fps, 90프레임, 3.75초, 무음, 2,241,229바이트 |
| 후처리 | 생성물에서 `crop=1920:768:0:156`, `setsar=1`, 5초로 트림, 오디오 제거, CRF 18, yuv420p, faststart |
| 연출 | 고정 구도에서 은발 끝·옷자락의 작은 흔들림, 느린 안개와 미세한 불티를 요청 |
| 시각 확인 | 1초 간격 프레임 시트에서 전체 구도·인물 위치·메인 로고 유지 및 머리카락·옷자락 변화 확인. 작은 문구의 픽셀 단위 일치와 반복 경계의 무봉합은 보증하지 않음 |
| 검수 이미지 | `output/cinematic/exoduser_title_motion_contact_20260908.jpg` |
| 기술 검증 | ffprobe로 크기·길이·프레임 수·무음 확인, FFmpeg 전체 디코딩 오류 없음, 로컬 저장 크기 일치 |
| 생성 비용 | 성공 요청 10크레딧. 앞선 Seedance 2.5의 45크레딧 및 Kling 3.0의 8.75크레딧은 거래 내역에서 각각 전액 환불 확인 |
| 실패 원인 | 앞선 두 요청은 상세 오류 없이 실패. 정규화와 단일 시작 프레임 및 Turbo 모델로 변경 후 성공했으나 정확한 원인은 확정하지 않음 |
| 적용 상태 | `video/title_motion.mp4?v=20260908-loop2`로 배포. `index.html` phase 2에서 무음 native loop → `splashCanvas` contain-fit. 최초 로딩/오류 시 기존 이미지, 재생 후 seek/buffering 동안 직전 프레임 유지, 시작 화면 종료 시 미디어 해제. 원본 끝/시작 30프레임을 smoothstep으로 사전 혼합 |
| 루프 보정 | `tools/build_title_motion_loop.py`: 원본 30~89번 + smoothstep 혼합(90~119번, 0~29번). 마지막 29번에서 첫 30번으로 정상 인접 연결. 상세 공식·측정값은 스플래시 문서 참조 |
| 런타임 계약 | `docs/3.1 ui hud 디자인/스플래시_인트로_시퀀스.md`의 타이틀 영상 연결 계약 참조 |
| 최초 연결 검수 | 초기 5초 버전에서 1920×1080·1280×720 Chromium 캡처, 무음 재생/Enter 종료/실패 폴백 클릭 종료/로비 복귀 스킵 PASS. `output/cinematic/title_motion_ingame_20260908.json`, 관련 테스트 8개 PASS |
| 최종 루프 검수 | 3.75초 보정 영상으로 Chromium 3회 연속 루프 PASS. 정지 원본 삽입 0회, 경계 draw 간격 33.7/33.0/33.9ms, pageerror 0, Enter 종료 PASS. `output/cinematic/title_smooth_loop_runtime_20260908.json`. 관련 회귀 테스트 8개 재실행 PASS |

## 성공 요청 프롬프트

```text
A subtle living game title illustration. Completely locked camera. Preserve the original artwork and all lettering. The woman stays still in her original pose. Only her silver hair tips and torn cloth gently flutter in a light breeze, ground mist drifts very slowly, a few faint red embers float. Very small smooth motion, stable face and armor, unchanged background structures. No camera movement, no zoom, no cuts, no new objects. Keep the black letterbox bars and logo perfectly stationary.
```
