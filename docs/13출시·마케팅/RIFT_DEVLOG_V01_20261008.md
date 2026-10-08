# 지옥의 틈 개발 기록 v0.1 — 2026-10-08

## 2026-10-08 현재 품질 수정 상태 — 이전 6편 공개 기록 정정

**현재 상태는 이 안내가 아래 최초 배포 기록보다 우선한다.** 사용자가 네메시아 자막 배경의 화면 가림과 메인 트레일러의 편집 완성도를 지적했다. 기존 기술·표본 검사 PASS는 사용자 편집·예술 검수 승인을 의미하지 않는다. 기존 메인 트레일러는 **USER REJECTED / 편집 품질 FAIL**, 새 메인은 실제 데모 녹화 회수·재제작 중인 **DRAFT / 최종 승인 대기**다.

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


사용자 최신 지시: 개발 단계가 보기 불편할 정도로 나쁘면 기다렸다 다시 촬영하되, **v0.1·개발 중으로 표시해 지금부터 공개하고 다음 버전을 또 올려도 된다. 영상 물량을 늘려도 괜찮으며, 지나치게 낮은 품질만 피한다.** 이에 따라 완성 거점 홍보의 인수 기준과 개발일지 게시 기준을 구분한다.

| 항목 | 현재 계약·상태 |
|---|---|
| 영상 이름 | 지옥의 틈 개발 기록 v0.1 · 개발 중 / RIFT DEVLOG v0.1 · WORK IN PROGRESS |
| 버전의 의미 | **영상 개발 기록 시리즈 v0.1**. 실제 게임 빌드·Steam 배포 버전 0.1이라고 단정하지 않음 |
| 공개 내용 | 현재 개발 모습·남은 개선점·후속 v0.2의 변화. 미완성 기능을 완성품으로 소개하지 않음 |
| 사용 입력 | 기존 10/5 콘셉트와 10/6 개발 녹화. 10/8 신규 인게임 녹화 아님. 이전 자동 주민 대화 QA 이동 소스의 제한을 보존 |
| 선별 기준 | 캐릭터 소실·화면 크기 변경·심한 끊김 제외. 선택한 짧은 컷의 실제 움직임을 검수. 사람의 자연 플레이 신규 촬영이라고 설명하지 않음. 안전한 실제 영상이 없으면 콘셉트 중심 구성과 이동 재촬영 예정을 표시 |
| 기존 FAIL 출력 | 이전 가로34초·세로20초·Discord720p20초는 모션 QA FAIL·게시 제외 이력 유지. 사용자 개발일지 허용을 기존 파일의 모션 PASS로 바꾸지 않음 |
| 새 제작 | 가로 **15초/450프레임**,1920×1080/30fps H264/AAC48kHz stereo native 편집 완성. 원화2초+QA화면8초+개선점3초+CTA2초. **사용자 기준 WIP 게시 적합 PASS**, 자연인 플레이·완성품 모션 PASS로 표현하지 않음 |
| 음악·미디어 | 기존 원화·녹화·프로젝트 음악만 사용. 새로운 AI 그림·음악·보이스 생성 0 |
| 배포 사실 | 지옥의 틈은 개발 프리뷰이며 Steam 공개 데모 반영 미확인. CTA는 별도 공개 Windows Steam 데모로 연결 |
| 연속 기록 | v0.1 이후 실제 개선을 v0.2 등 다음 영상에 기록. 컷씬·서로 다른 전투·스킬·업데이트도 개별 게시 허용. 같은 파일·문안의 중복 게시와 구분 |
| 운영 연결 | 기존 heartbeat **fdg / ACTIVE / 화·금 11:00 KST**의 프롬프트를 위 사용자 품질·빈도 기준으로 갱신. 일정·대상 스레드·알림 설정 유지, 새 자동화 0 |
| 실제 게시 | **총6편 모두 업로드·공개 완료**. 새 틈 v0.1 [공개 영상](https://youtu.be/i7ouSzivg4U). 최신 사용자 배포 지시로 공개 승인 확인 후 실행. [6편 공개 URL·최종 검수](CINEMATIC_YOUTUBE_DELIVERY_20261008.md) |

게임 코드·서버·사용자 게임 화면·세이브는 이번 편집 작업에서 변경하지 않는다. 현재 게임의 캐릭터 소실·떨림 원인을 영상 편집만으로 고쳤다고 보고하지 않는다.


읽기 전용 런타임 조사: [소실·떨림 후보와 적용 경로](../../marketing/trailers/rift-v01-20261008/RIFT_RUNTIME_READONLY_20261008.md). 전경 가림·막혀도 지속되는 보행 포즈·추가 관절 흔들림 등 후보를 확인했으나 현재 사용자 실행 소스·직접 원인은 미확정이다. 자연플레이 홍보 녹화의 8~12초 연속 보행 기준은 향후 재촬영에 적용하며, 이번 출처 표시 개발일지의 게시 차단 조건으로 삼지 않는다.


## 최종 편집·검수

| 컷 | 출력 구간·분량 | 입력 구간 | 공개 의미 |
|---|---|---|---|
| concept | 0–2초·60f | 2026-10-05 원화 | 콘셉트·플레이 화면 아님 |
| residents | 2–4초·60f | QA원본15.2–17.2초 | 주민 주변 배치 점검 |
| path | 4–7초·90f | QA원본19.3–22.3초 | 통로 점검 |
| stairs | 7–10초·90f | QA원본27.4–30.4초 | 계단·깊이 점검 |
| next | 10–13초·90f | 기존 콘셉트+개선 예정 문구 | 이동·화면 안정성과 주민·공간 연출은 후속 기록 |
| CTA | 13–15초·60f | 게임명·별도 공개Windows Steam데모 안내 | 틈의 Steam반영 미확인 유지 |

| 검수 | 실제 근거·한계 |
|---|---|
| 출력 파일 | [EXODUSER_RIFT_DEVLOG_V01_20261008.mp4](../../marketing/trailers/rift-v01-20261008/EXODUSER_RIFT_DEVLOG_V01_20261008.mp4), **12,000,463B**, SHA256 `8cdb4113b3bd1f299eaef55cd1f9b59249d1471e5c60b041cdf6cd3a3af38c74` |
| 연속 표본 | 전체화면12시점·출력2.0–9.9초0.1초간격80개 캐릭터 표본 검수. 소실·뷰포트변경·화면붕괴 없음. 자동QA의 일부 방향 전환은 남으며 출처와 WIP로 표시 |
| 픽셀·시간 대응 | 출력2.3/3.3/4.3/5.3/6.3/7.3/8.3/9.3초 ↔ 원본15.5/16.5/19.6/20.6/21.6/27.7/28.7/29.7초. 8/8 대응, 오차0f, MSE2.26–3.30 |
| decode·음향 | 전체450f decode 오류0. AAC48kHz stereo mean−21.9dB/peak−7.4dB. 전체 주관적 청취 미수행 |
| native 소스 | [JSX](../../tools/marketing_rift_v01_edit_20261008.jsx), [4개원본shot·시간manifest](../../marketing/trailers/rift-v01-20261008/manifest.json), [원본출처](../../marketing/trailers/rift-v01-20261008/provenance.json), [소스 프레임 간격](../../marketing/trailers/rift-v01-20261008/selected-source-timing.json) |
| 화면 계약 | 캔버스1920×1080, 헤더132px, 원본 표시영역x0/y140/1270×828 contain. 우측패널x1296/y140/582×828. 푸터y984/높이96. EN DM Sans, KO NotoSansKR wght600/script Hang. 헤더 EN32px·KO27px, 컷 KO45px·EN27px, 보조 KO22px, 푸터20/21px |
| 표본 개요 | [출력12시점 contact](../../marketing/trailers/rift-v01-20261008/overview.jpg). root도 실제 export의 제목·화면·날짜·WIP·CTA 배치를 직접 확인 |

기존 원본은 marketing/captures/rift-20261008의 resident-walk.webm·concept-20261005.png·prologue_theme.mp3로 보존돼 있다. 새 입력·편집ZIP의 중복 자산을 별도 새게임 자산으로 세지 않는다.


## 편집본 보존·인수

| 항목 | 검증·상태 |
|---|---|
| 편집 ZIP | [EXODUSER_RIFT_DEVLOG_V01_EDITABLE_20261008.zip](../../marketing/trailers/rift-v01-20261008/EXODUSER_RIFT_DEVLOG_V01_EDITABLE_20261008.zip), **39,655,708B**, SHA256 `fa4d0768c063c721374627bebedea3e25051dad243976959928cc58e38ade241` |
| 재편집 가능성 | ZIP 45개 항목·CRC PASS, 체크섬44개·native 자산8개 일치. 입력·선별클립·프로젝트·폰트/라이선스·JSX·재현용 prepare.py 포함. [사용 안내](../../marketing/trailers/rift-v01-20261008/ARCHIVE_README.txt)는 ZIP을 푼 폴더를 기준으로 함 |
| 편집 코드 일치 | 작업본 JSX·ZIP edit.jsx·native edit.jsx 바이트 일치, SHA256 `9a579301d71171fbe396cf5f7ed265749aeb09a7aee34fc010851ea959aee037` |
| 검수 기록 | [QA.json](../../marketing/trailers/rift-v01-20261008/QA.json), SHA256 `01ce80daef5fdf56499973da7785d9aa06a655455c8269ed06a2660fe14cda6f`; [archive-review.json](../../marketing/trailers/rift-v01-20261008/archive-review.json)에서 자산·CRC·체크섬 검증 |
| 시각 근거 | [캐릭터0.1초 간격80표본](../../marketing/trailers/rift-v01-20261008/actor-100ms.jpg), [컷 경계](../../marketing/trailers/rift-v01-20261008/cut-boundaries.jpg), [픽셀 시간 대응](../../marketing/trailers/rift-v01-20261008/pixel-correspondence.json) |
| 클라우드 인수 | [delivery.json](../../marketing/trailers/rift-v01-20261008/delivery.json)의 MP4·ZIP·QA·overview CDN 보존·업로드 confirmed. 서명 PUT URL·인증정보는 보존하지 않음 |
| 플랫폼 게시 상태 | **YouTube 6편 모두 PUBLISHED·공개 확인 완료**. 전사 EN·KO 선택 자막 각22큐 게시 확인. [6편 공개 URL·최종 검수](CINEMATIC_YOUTUBE_DELIVERY_20261008.md)에 실제 게시 근거·최종 폴더·RELEASE_READY QA 연결. 영어·Gaming·AI 사용 Yes 적용, 설명 링크 클릭 제한으로 프로필 Steam 링크도 안내. 기존 검수 해시 재사용·주관적 전체 청취 미수행 유지. Steam item1369319는 메타데이터만 저장, 파일 미전송·미공개 |
