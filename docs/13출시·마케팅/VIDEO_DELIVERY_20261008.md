# 2026-10-08 인게임 홍보 영상 납품·동기화

## 2026-10-09 최신 지시 — 보스전 리디자인 완료 후 제작

사용자 「지금 보스전 총괄이 리디자인하고있으니까 경과보고 끝나면 만들어」에 따라 **신규 촬영·트레일러 제작은 총괄의 보스전 리디자인 완료까지 대기**한다. 기존18초V3는 검수 이력으로 보존하며 리디자인 완료 영상으로 재사용·공개하지 않는다.

기존 fdg를 **매시간 경과 확인**으로 일시 변경했고, 기존 총괄 chat에 새 촬영 순서를 전달했다. 2026-10-09 14:48 KST compact snapshot은 **idle / 최근 턴 completed**이며, 보고 내용은 드루이드 사선 원화 제작·45° 방향 불명확으로 본편 적용 보류다. **보스전 전체 리디자인 완료 보고는 미확인**이다. 단일 수정 커밋·테스트베드 RETOUCH를 전체 완료로 보지 않는다. 총괄의 전체 완료 보고와 정상 본편의 실제 전투 촬영 가능 상태를 확인하면 완료 버전으로 녹화·원음 기반 대표 트레일러를 제작하고 검수본부터 인도한다. 변화 없는 경과는 반복 보고하지 않는다. 제작 인도 후 원래 화·금11:00 KST 채널 운영 일정으로 복귀한다.

다음 점검은 [보스전 대기 상태](../../marketing/operations/boss-redesign-watch-20261009.json)의 thread/host/afterCursor를 사용한다. **다음 소재 한 건은 리디자인 완료 버전의 실제 보스전 대표 트레일러**이며, 아래 드루이드 후보·과거 영상은 이 대기 조건보다 우선하지 않는다. 게임·서버·사용자 탭·세이브 변경 및 새 제작/게시0이다.

## 2026-10-09 최신 운영 상태 — 이 절이 아래 과거 기록보다 우선

| 항목 | 실제 확인·운영 결과 |
|---|---|
| 최신 인도본 | **18초 V3 전투 티저 검수본**, `output/trailer-production-20261009/FINAL_REVIEW/EXODUSER_NewVersion_CombatTeaser_20261009_REVIEW_V3.mp4`, SHA256 `c02056b2ab3675dbc8ccd0ca2f75667cfa9afc0e44ecaa9297a225eea1dc5e82`. 출처는 촬영 당시 현행 개발 checkout의 c34da0ec 계열 및 정확한 두 working-file snapshot이며 새12c29afee 촬영본이 아님 |
| 검수·공개 | NORMAL_TUTORIAL/초반 실제 입력 촬영, 구 staged 소재 없음. 짧은 티저 시각 PASS, 실제 청취 UNHEARD, 대표 메인트레일러 충분성 미충족, 사용자 공개 승인 없음. **이번 YouTube/Steam/연계채널 신규 게시0**. 파생 Shorts/Reels도 자동 공개 금지 |
| 과거 본 | 26.3초 R1과 구37초는 역사적 검수/거절 이력. 최신 인도본으로 재사용하지 않음. 공개4편·구메인/구네메시아 일부공개·수정네메시아 일부공개 및 KO 미게시 상태는 기존 플랫폼 증거를 유지하며 재확인·재게시하지 않음 |
| 새 개발 변경1건 | `/Users/fordeargamers/Projects/exoduser-migration-20261001` commit `12c29afeeb9a1ae079e4d99bbdfdc81ba872e585` — 다크드루이드 **보스** 변신24포즈·야수 정지8방향 및 전투 안내. 신규 플레이어 선택 캐릭터가 아님. 기존 선택·저장 스키마 변경을 소개하지 않음 |
| 실제 장면 상태 | 개발 증거 `druid-transform-guide-consumer-20261009`는 본편 테스트베드 GOD/보스크기22/시각배율4/프레임STEP 화면, **RETOUCH**. MP4/WebM/MOV0개. raw atlas GIF는 인게임 녹화가 아님. 정상 연속 플레이·원음·청취·정상 저장 검수 미인수 |
| 다음 소재 한 건 | **다크드루이드 보스 변신·전투 안내 개발 기록**. 정상 플레이에서 행동과 결과가 이어지는 실제 영상·원음을 확보·검수한 뒤 제작. 현재 신규 촬영·영상 제작·공개 없음, Steam 데모 적용 미확인 |
| 운영 설정 | fdg의 기존 일정·대상·ACTIVE를 유지하고 최신 V3 검수 상태·드루이드 보스 소재와 미인수 범위를 프롬프트에 반영 완료. 같은 로그인/약관 요청을 반복하지 않음 |

출처·실물·제한된 판정: [신버전 제작 기록](NEW_VERSION_TRAILER_PRODUCTION_20261009.md), [V3 독립 검수](../../marketing/trailers/new-version-20261009/final-render-independent-review.md). 드루이드 근거: 개발 정본 `docs/8.1보스디자인바이블/BOSS_BATTLE_SETTINGS.md` 및 `/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/druid-transform-guide-consumer-20261009/completion.json`. 게임·서버·사용자 탭·세이브를 변경하거나 재시작하지 않았다.

## 2026-10-08 현재 품질 수정 상태 — 이전 6편 공개 기록 정정

**이 2026-10-08 안내는 당시 품질 수정 기록이며, 위 2026-10-09 최신 운영 상태가 우선한다.** 사용자가 네메시아 자막 배경의 화면 가림과 메인 트레일러의 편집 완성도를 지적했다. 기존 기술·표본 검사 PASS는 사용자 편집·예술 검수 승인을 의미하지 않는다. 기존 메인 트레일러는 **USER REJECTED / 편집 품질 FAIL**, 새 메인은 실제 데모 녹화 회수·재제작 중인 **DRAFT / 최종 승인 대기**다.

| 대상 | 이번 안내 갱신 시점의 실제 상태 |
|---|---|
| 기존 메인 37초 | [WTwXcdeTCFg](https://youtu.be/WTwXcdeTCFg) **PUBLIC → UNLISTED(일부 공개) 저장 완료**, 공식 재생목록 선택 해제·저장 완료. 삭제·새 영상 교체 완료로 보고하지 않는다 |
| 새 메인 트레일러 | 실제 플레이16.3초+staged시연10초의 **26.3초 R1 검수본 인도**. 로컬 MP4·editable ZIP·QA 제공, 사용자 승인 대기·YouTube/Steam 신규 공개 없음 |
| 기존 네메시아 | [p-21GwkF65s](https://youtu.be/p-21GwkF65s) **PUBLIC → UNLISTED(일부 공개) 저장 완료**, 공식 재생목록 선택 해제·저장 완료. 삭제·수정본 공개 교체 완료 아님 |
| 네메시아 글씨 전용 수정본 | [0ERvrpHccZQ](https://youtu.be/0ERvrpHccZQ) **UNLISTED(일부 공개) 검수용**. 새 공개 배포본으로 확정하지 않는다 |
| 수정본 선택 자막 | 영어 **27큐 PUBLISHED**. 한국어 자막 파일은 준비됐으나 임시 추가한 언어 행이 새로고침 후 사라짐. 한국어 파일 업로드·게시 **미완료** |
| 공개 재생목록 | [공식 목록](https://www.youtube.com/playlist?list=PLKmxsIw9Q0Hk) 공개 화면에서 **공개 동영상 4개 직접 확인 완료**. 순서: Shorts A → Shorts B → 전사 → 틈. 기존 메인·기존 네메시아는 목록에 없음을 확인했다. 근거: `quality-revision/playlist-four-public.png` |
| 신규 배포 | 새 메인과 네메시아 수정본은 검수용 DRAFT로 관리. 사용자 검수·승인 전 추가 공개하지 않는다 |

아래 본문의 **“6편 모두 공개”, “총6편 PUBLISHED”, “현재 실제 게시”, RELEASE_READY와 공개 URL 표는 품질 수정 전 최초 배포 시점의 역사적 기록**이다. 현재 6편이 모두 PUBLIC이라는 주장이나 새 수정본의 품질 승인·배포 근거로 재사용하지 않는다. 파일·decode·시간 대조·표본 화면 검사와 전구간 시청·청취·사용자 편집 승인을 각각 구분한다. 후속 실제 상태는 새로운 플랫폼 확인 근거로 갱신한다.

관련: [대표 트레일러 재제작·검수 계약](TRAILER_REBUILD_REVIEW_20261008.md), [네메시아 글씨 전용 수정 기록](NEMESIA_TEXT_ONLY_FIX_20261008.md).


**영상 제작·YouTube 전투3편 공개 완료. Steam 상점 영상 파일 전송·공개 대기.** 최신 개발 게임을 직접 실행해 녹화한 정상 CH1 맵의 staged 고레벨 스킬 시연이다. Steam 배포 Windows 데모와 바이너리·에셋 전체 동일성은 검증하지 않았다. 게임 밸런스·맵·에셋 코드는 변경하지 않았다.

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
| Steam | 기존 스토리/게임플레이 영상2개 유지. Steamworks 로그인 완료 확인. 새37초 metadata 항목1369319 생성, 파일 미전송·첫 순서 배치·공개 **미완료**. [후속 실제 단계](STEAM_TRAILER_UPDATE_20261008.md) |
| YouTube | 37초 + 16/26초 파일·[문안/UTM](SOCIAL_VIDEO_COPY_20261008.md) 준비. 후속 확인: **@fordeargamers 공식 관리 채널 로그인 완료**, 한영 소개·Steam 프로필 링크 공개 반영. 본 문서의 전투3편은 후속 컷씬2편·틈v0.1까지 **총6편 업로드·공개 확인 완료**. 최신 사용자 배포 지시로 승인 확인 후 실행. [6편 공개 URL·최종 검수](CINEMATIC_YOUTUBE_DELIVERY_20261008.md)에 실제 URL·최종 폴더 RELEASE_READY·동일 해시 기존 QA 재사용 근거 연결. 전사 EN·KO 각22큐 게시 확인, English·Gaming·AI 사용 Yes 적용. 설명 링크 클릭 제한으로 프로필 Steam 링크도 안내. 주관적 전체 청취 미수행 유지. [채널 운영 기록](YOUTUBE_CHANNEL_OPERATIONS_20261008.md) |
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

후속 별도 소재: [지옥의 틈 개발 기록01](RIFT_DEVLOG_DELIVERY_20261008.md) 가로34초·세로20초·Discord720p20초 이력 보존. 후속 모션 QA FAIL로 게시 제외·재촬영 필요. 위 전투37/16/26초와 출처·음원을 구분한다.
