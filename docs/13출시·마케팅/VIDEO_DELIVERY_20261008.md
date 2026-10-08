# 2026-10-08 인게임 홍보 영상 납품·동기화

**영상 제작 완료, 플랫폼 게시 대기.** 최신 개발 게임을 직접 실행해 녹화한 정상 CH1 맵의 staged 고레벨 스킬 시연이다. Steam 배포 Windows 데모와 바이너리·에셋 전체 동일성은 검증하지 않았다. 게임 밸런스·맵·에셋 코드는 변경하지 않았다.

| 납품 | GitHub 브랜치 내 파일 | 길이 | 화면·프레임 | 크기 |
|---|---|---:|---|---:|
| Steam / YouTube 가로 | [EXODUSER_STEAM_37S_1080P30.mp4](../../marketing/trailers/20261008/EXODUSER_STEAM_37S_1080P30.mp4) | 37초 | 1920×1080 / 30fps / 1,110f | 84,605,641 B |
| Shorts A — 패링·강타 | [EXODUSER_SHORTS_A_16S_1080P30.mp4](../../marketing/trailers/20261008/EXODUSER_SHORTS_A_16S_1080P30.mp4) | 16초 | 1080×1920 / 30fps / 480f | 18,747,491 B |
| Shorts B — 불꽃·얼음·블랙홀 | [EXODUSER_SHORTS_B_26S_1080P30.mp4](../../marketing/trailers/20261008/EXODUSER_SHORTS_B_26S_1080P30.mp4) | 26초 | 1080×1920 / 30fps / 780f | 34,523,684 B |
| Discord 전송용 A | [EXODUSER_DISCORD_SHORT_A_720P30.mp4](../../marketing/trailers/20261008/EXODUSER_DISCORD_SHORT_A_720P30.mp4) | 16초 | 720×1280 / 30fps | 3,792,631 B |

3개 마스터는 H.264 / AAC stereo 48kHz. Discord 파일은 A 완성본의 720p 축소본이다. 원본 게임 오디오를 유지하고 마지막 4초 CTA는 무음이다. 새 AI 영상·목소리·음악을 추가하지 않았다. 게임 자체의 AI 보조 아트·음향 사용 공개는 유지한다.

## 검수와 출처

| 항목 | 실제 결과 |
|---|---|
| 촬영 소스 | origin/main `2f5aa0e88e32ff2d82a93f9c6098643d8d1f6427`, game.html SHA256 `bf38f6668d93cdc3bffa909250656d56675b734b27971a5103b3730edb3d1b3e` |
| 원본 백업 | [marketing/captures/20261008](../../marketing/captures/20261008). 5종 WebM·감사 JSON·로고·SHA256 보존 |
| 편집 | [편집 계약](VIDEO_EDIT_PLAN_20261008.md), [준비 도구](../../tools/marketing_prepare_20261008.py), [native JSX](../../tools/marketing_edit_20261008.jsx). Prepared CFR30 H.264 입력과 native single-window 렌더 |
| native 검사 | 3개 프로젝트 check clean, DM Sans 400/700 설치·폰트 검사, fallback 없음 |
| 기술 검사 | 마스터 3개 전체 decode 오류 없음, 정확한 프레임 수·길이·H264/AAC·48kHz 확인 |
| 시간 검사 A/Steam | MP4 n=9/39/69/99 → 원본 parry 5.233333/6.233333/7.233333/8.233333초. 30Hz 해상도 오차 0초. 픽셀 MAE A 1.69–1.98, Steam 1.23–1.53 / 255 |
| 시간 검사 B | 같은 MP4 프레임 → 원본 fire 2.3/3.3/4.3/5.3초. 30Hz 오차 0초. MAE 1.74–1.84 / 255 |
| 육안 검사 | 샘플 패링 폭발·피해 숫자, 강타, 불꽃, 얼음보주, 블랙홀, CTA·staged 표시 확인. [검수 이미지](../../marketing/trailers/20261008/EXODUSER_FINAL_REVIEW.jpg) |
| 오디오 범위 | 게임 구간 신호 있음, 마지막 CTA 구간 max −91dB, AAC decode 정상. 주관적인 전체 청취 검수는 수행하지 않음 |
| 폐기본 | 직접 VP9/다중 window 초기 export에서 발견한 시간 지연·점프 버전은 납품·게시에서 제외. 수정된 CFR/single-window 파일만 본 표와 SHA256에 수록 |
| SHA256 | [최종 4개 파일 해시](../../marketing/trailers/20261008/sha256.json), [마스터 QA](../../marketing/trailers/20261008/EXODUSER_FINAL_QA.json) |

## 실제 게시 상태

| 채널 | 상태와 다음 동작 |
|---|---|
| Steam | 기존 스토리/게임플레이 영상 유지. 새 37초 업로드·첫 순서 배치는 **미완료**. Steamworks 로그인은 Steam 모바일 승인 대기 |
| YouTube | 37초 + 16/26초 파일·[문안/UTM](SOCIAL_VIDEO_COPY_20261008.md) 준비. 후속 확인: **@fordeargamers 공식 관리 채널 로그인 완료**, 한영 소개·Steam 프로필 링크 공개 반영. 새 3편은 **업로드 약관 제출 승인 대기**, 실제 업로드·공개 미완료. [채널 운영 기록](YOUTUBE_CHANNEL_OPERATIONS_20261008.md) |
| Discord | 기존 FDG 서버·첫 데모 공지는 공개 유지. Mac 잠금은 후속 해제 확인. 새 16초 announcements 게시는 **미완료**, 이번 제출은 하지 않음 |
| Threads / Instagram / Bluesky | [채널 조건·14일 실험](EXPOSURE_CHANNELS_20261008.md), 영상·문안 준비. 신규 계정 또는 이번 영상 게시 완료로 표시하지 않음 |
| Reddit / itch.io | [기존 실제 공개 결과](DEMO_MARKETING_LAUNCH_20261008.md). 이번 영상 추가 게시는 미완료 |

## GitHub와 메인 PC

동기화 브랜치: **codex/marketing-gameplay-20261008**. 기존 작업 브랜치나 origin/main을 덮어쓰지 않고 별도 브랜치에 원본·편집 코드·문서·완성 MP4를 보존한다. 메인 PC의 기존 체크아웃을 바꾸지 않고 받을 수 있다.

```powershell
git fetch origin codex/marketing-gameplay-20261008
git worktree add ..\exoduser-marketing-20261008 origin/codex/marketing-gameplay-20261008
```

받은 폴더의 `marketing\trailers\20261008\`에 완성 영상, `marketing\captures\20261008\`에 녹화 원본이 있다. 위 예시 worktree 폴더가 이미 있으면 다른 새 경로를 사용한다. 기존 파일을 reset/checkout으로 되돌리지 않는다.

클라우드 편집 패키지·검수 결과의 공개 링크는 [delivery_urls.json](../../marketing/trailers/20261008/delivery_urls.json)에 기록한다. 네이티브 프로젝트 3개와 import된 미디어·폰트가 들어 있는 ZIP은 Git 대용량 파일로 추가하지 않는다. ZIP CRC와 3개 프로젝트의 모든 asset URI 존재 검증 PASS. ZIP SHA256: `132d1ceb72f886ed8947f4b0fb33717bab0604687354d560d72ed4e891da28ac`.
