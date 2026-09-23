# 남전사 캐릭터 선택 영상 선명도 수정 — 2026-09-13

사용자 22:25 스크린샷은 PNG 배경이 아니라 `CHAR_VISUALS[0].idleVid` 영상이다. 초기 로비 이미지 검수는 점묘 여부만 확인해 영상의 원본 디테일 부족을 놓쳤다. 기존 1080p 영상 첫 프레임부터 얼굴·갑옷이 흐리고, 사용자 화면 너비 2503px에서는 기본 cover가 약 1.304배 확대한다. CSS blur 추가가 원인은 아니다.

## 적용 계약

| 항목 | 값 / 위치 |
|---|---|
| 기존 생성 | Seedance 2.5 job `88756648-e041-43b7-b645-e697e6e4a57e`, 1920×1080, 24fps, 145프레임 |
| 복원 | Higgsfield Topaz `2160p`, `16:9`, job `1fe88d22-767a-4085-ad97-d1202296bf31` |
| 복원 원본 | HEVC 3840×2160, 24fps, 145프레임, 16,892,889 bytes |
| 최종 영상 | `assets/charselect/idle_warrior_higgsfield_4k.mp4?v=20260913-detail1`, H.264 3840×2160, 24fps, 133프레임, 11,222,864 bytes |
| 포스터 | `assets/charselect/poster_idle_warrior_higgsfield_4k.jpg?v=20260913-detail1`, 3840×2160, 572,270 bytes, 최종 첫 프레임, JPEG q:v=2 |
| 연결 | `index.html`의 `CHAR_VISUALS[0].idleVid/poster`; `#csIdleVid` 선택 화면과 `#lobbyCharPreview` 로비가 공유 |
| 반복 마감 | 기존 `tools/build_warrior_higgsfield_loop.py` 그대로. 정방향 본문 121프레임 + 끝/처음 12프레임 smoothstep 혼합 |
| 인코딩 | libx264, preset slow, CRF18, yuv420p, GOP24, faststart, 오디오 없음 |
| 속도 | `idleRate=0.75`, 파일 133/24초, 실제 반복 133/24/0.75 ≈ 7.388889초 |
| 확대 | 검수 뷰포트 2548×1255: 기존 1080p cover 배율 약 1.3271 → 4K 약 0.6635. 기본 cover와 21:9 contain/상단/scale(1.15) scaleX(1.1) 규칙 유지 |
| 원본 보존 | 기존 `idle_warrior_higgsfield.mp4`, `poster_idle_warrior_higgsfield.jpg`; UI 연결만 새 파일로 전환 |

## 검수와 한계

| 검수 | 결과 |
|---|---|
| 같은 프레임 비교 | 실제 선택 UI 2548×1255, 영상 시간 0.5초 고정. `output/charselect_quality_20260913/before-still.png`, `after-still.png` |
| 육안 개선 | 얼굴 윤곽·머리카락·갑옷 판 경계와 망토 섬유의 번짐 감소. 기존 인물·칼·구도·관절 동작 유지 |
| 연속 재생 | 5회 경계 간격 약 41.6 / 62.6 / 50.1 / 58.4 / 66.7ms, 페이지 오류 0, 3840×2160 디코딩과 0.75배속 확인 |
| 최종 재생 통계 | 적용 경로로 879프레임 재생 중 dropped 0 / corrupted 0, 경계 6회 약 50.0~58.4ms, 페이지 오류 0. `output/charselect_quality_20260913/playback.json` |
| 실제 UI | 로비 슬롯 선택 및 새 캐릭터 선택 화면 양쪽 3840×2160, 0.75배속 재생과 새 포스터 경로 확인. 저장/생성 작업 없음. `output/charselect_quality_20260913/verification.json` |
| 코드 검사 | `index.html` inline script 4개 Acorn 구문 검사 통과, 새 영상/포스터 파일 및 캐시 경로 존재 확인 |
| 아트 제한 | 1080p 생성본의 AI 복원이다. 네이티브 4K 원화/영상 재제작이 아니며, 기존 칼 표면의 거친 무늬와 일부 재질의 불규칙성은 남아 있다. 디자인 재제작 완료로 판정하지 않는다 |
| 용량 영향 | MP4 2,286,721 → 11,222,864 bytes. 실행 시 추가 AI 처리나 캔버스 필터 없음; 4K 영상 디코딩 비용 증가 |
| 범위 | 이번 교체는 남전사 선택/로비 아이들 영상. 기존 인트로 PNG 검수 완료를 이 영상의 원본 품질 보증으로 해석하지 않는다 |

시각 판정: **선명도 개선 채택**. 칼과 갑옷의 디자인 정합성까지 모두 해결됐다는 판정은 아니다. 재제작 시 선명한 재질과 직선 칼날을 원화 단계에서 확정하고, 실제 움직이는 프레임의 동일성까지 다시 검수해야 한다.
