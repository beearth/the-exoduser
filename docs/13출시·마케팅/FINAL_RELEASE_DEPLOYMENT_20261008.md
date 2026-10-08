# FDG 최종 영상 배포·보존 기록 — 2026-10-08

## 2026-10-08 현재 품질 수정 상태 — 이전 6편 공개 기록 정정

**현재 상태는 이 안내가 아래 최초 배포 기록보다 우선한다.** 사용자가 네메시아 자막 배경의 화면 가림과 메인 트레일러의 편집 완성도를 지적했다. 기존 기술·표본 검사 PASS는 사용자 편집·예술 검수 승인을 의미하지 않는다. 기존 메인 트레일러는 **USER REJECTED / 편집 품질 FAIL**, 새 메인은 실제 데모 녹화 회수·재제작 중인 **DRAFT / 최종 승인 대기**다.

| 대상 | 이번 안내 갱신 시점의 실제 상태 |
|---|---|
| 기존 메인 37초 | [WTwXcdeTCFg](https://youtu.be/WTwXcdeTCFg) **PUBLIC → UNLISTED(일부 공개) 저장 완료**, 공식 재생목록 선택 해제·저장 완료. 삭제·새 영상 교체 완료로 보고하지 않는다 |
| 새 메인 트레일러 | 실제 자연 플레이 소재 회수·재제작 진행 중. 신규 최종 승인·추가 공개 완료 아님 |
| 기존 네메시아 | [p-21GwkF65s](https://youtu.be/p-21GwkF65s) **PUBLIC → UNLISTED(일부 공개) 저장 완료**, 공식 재생목록 선택 해제·저장 완료. 삭제·수정본 공개 교체 완료 아님 |
| 네메시아 글씨 전용 수정본 | [0ERvrpHccZQ](https://youtu.be/0ERvrpHccZQ) **UNLISTED(일부 공개) 검수용**. 새 공개 배포본으로 확정하지 않는다 |
| 수정본 선택 자막 | 영어 **27큐 PUBLISHED**. 한국어 자막 파일은 준비됐으나 임시 추가한 언어 행이 새로고침 후 사라짐. 한국어 파일 업로드·게시 **미완료** |
| 공개 재생목록 | [공식 목록](https://www.youtube.com/playlist?list=PLKmxsIw9Q0Hk)에서 기존 메인·기존 네메시아 **2편 선택 해제·저장 완료**. 나머지 4편 유지 예상은 개별 설정 근거의 추론이며 **공개 재생목록 총개수 독립 확인은 아직 미수행** |
| 신규 배포 | 새 메인과 네메시아 수정본은 검수용 DRAFT로 관리. 사용자 검수·승인 전 추가 공개하지 않는다 |

아래 본문의 **“6편 모두 공개”, “총6편 PUBLISHED”, “현재 실제 게시”, RELEASE_READY와 공개 URL 표는 품질 수정 전 최초 배포 시점의 역사적 기록**이다. 현재 6편이 모두 PUBLIC이라는 주장이나 새 수정본의 품질 승인·배포 근거로 재사용하지 않는다. 파일·decode·시간 대조·표본 화면 검사와 전구간 시청·청취·사용자 편집 승인을 각각 구분한다. 후속 실제 상태는 새로운 플랫폼 확인 근거로 갱신한다.

관련: [대표 트레일러 재제작·검수 계약](TRAILER_REBUILD_REVIEW_20261008.md), [네메시아 글씨 전용 수정 기록](NEMESIA_TEXT_ONLY_FIX_20261008.md).


사용자의 선행6편 공개 동의 요청 뒤 받은 「최종폴더 만들어서 검수후 다 배포하자」 지시로 승인 확인 후 실행했다. **YouTube 신규6편 업로드·공개 완료**, 전사 선택 자막 영어·한국어 **각22큐 게시 확인 완료**다. 다른 플랫폼은 아래 실제 단계로 관리한다.

## 정본·검수 범위

| 항목 | 근거·상태 |
|---|---|
| 최종 원본 폴더 | [FDG_FINAL_RELEASE_20261008](/Users/fordeargamers/the-exoduser/output/FDG_FINAL_RELEASE_20261008). 6개 MP4·전사 VTT2개·QA·출처·체크섬·게시 자료를 구분해 보존 |
| 저장소 보존본 | [marketing/releases/20261008](../../marketing/releases/20261008/README.md): 원본 publish-plan·final-QA·provenance·SHA256SUMS, deployment JSON5개·YouTube 게시 증거 JPG8개. 영상6개 268,089,391B는 재복사하지 않음 |
| 배포 전 QA | [final-QA.json](../../marketing/releases/20261008/final-QA.json) **RELEASE_READY**. 원본·복사본 SHA256 일치, 동일 해시 기존 full-decode PASS 재사용. 이번 패키징에서 전체 decode 반복0, 기술·시간·표본 시각 검사 범위 유지 |
| 청취·시청 한계 | **주관적 전체 청취 미수행**. 오디오 신호·decode 확인을 전체 청취/클리핑 승인으로 확대하지 않음. 전체 프레임 연속 주관 시청을 새로 수행했다는 주장 없음 |
| 원본 동결·체크섬 | 원본 패키지 payload는 **frozen**. [SHA256SUMS](../../marketing/releases/20261008/SHA256SUMS)는 원본 전체 payload의 체크섬 원문이며, 가변 게시 기록 **deployment/는 체크섬 대상 제외**. 부분 보존 폴더에서 전체 패키지 파일 존재를 주장하지 않음 |
| 최신 게시 근거 | [publication-results.json](../../marketing/releases/20261008/deployment/publication-results.json), [youtube-published.json](../../marketing/releases/20261008/deployment/youtube-published.json). 포장 당시 final-QA의 NOT_UPLOADED_BY_PACKAGING_AGENT는 당시 역할 기록이며 현재 게시 상태는 이 후속 기록으로 판단 |
| 적용 설정 | [applied-youtube-metadata.json](../../marketing/releases/20261008/deployment/applied-youtube-metadata.json): 6편 제목·설명·public·English·Gaming·AI 사용 Yes. 설명 외부 링크는 일회성 채널 인증 전 클릭 제한이 있어 **채널 프로필의 Steam 데모 링크도 안내** |

## 공개 영상·재생목록

공식 채널: [@fordeargamers](https://www.youtube.com/@fordeargamers), ID **UCOLkkQsaZ9ACuXdvPblhfiA**. 기존 공개3편 보존. 이번 묶음 [공개 재생목록](https://www.youtube.com/playlist?list=PLKmxsIw9Q0Hk)은 **PUBLIC·6편·Published oldest first**, 전투3편 → 전사 → 네메시아 → 틈 순서다.

| 영상 | 최종 파일 | 실제 공개 URL | 선택 자막 |
|---|---|---|---|
| 전투 37초 | `EXODUSER_STEAM_37S_1080P30.mp4` | [공개 영상](https://youtu.be/WTwXcdeTCFg) | — |
| Shorts A 16초 | `EXODUSER_SHORTS_A_16S_1080P30.mp4` | [공개 영상](https://youtube.com/shorts/50eBpMxlkP0?feature=share) | — |
| Shorts B 26초 | `EXODUSER_SHORTS_B_26S_1080P30.mp4` | [공개 영상](https://youtube.com/shorts/NBOcxJgM-pA?feature=share) | — |
| 전사 96.4초 | `EXODUSER_WARRIOR_STORY_V25_20261001.mp4` | [공개 영상](https://youtu.be/r_TTBUrA6p4) | EN·KO 각22큐 PUBLISHED |
| 네메시아 121.7초 | `EXODUSER_NEMESIA_CINEMATIC_KR_EN_20261008.mp4` | [공개 영상](https://youtu.be/p-21GwkF65s) | — |
| 틈 WIP v0.1 15초 | `EXODUSER_RIFT_DEVLOG_V01_20261008.mp4` | [공개 영상](https://youtu.be/i7ouSzivg4U) | — |

[재생목록 공개 화면](../../marketing/releases/20261008/deployment/youtube-playlist-public.jpg)·[전사 자막 게시 확인](../../marketing/releases/20261008/deployment/warrior-captions-published.jpg)·개별 게시 JPG는 같은 deployment 폴더에 보존한다.

전투는 화면에 표시한 staged 고레벨 스킬 시연이며 공개 Steam 데모와 동일 빌드라고 단정하지 않는다. 네메시아는 기존 원화·한국어 원문·현행 영어 번역·V3 음악의 재구성으로 게임 녹화가 아니다. 틈 v0.1은 **10/5 콘셉트+10/6 자동 개발 QA 녹화의 짧은 선별컷**, 신규 인간 플레이 촬영이 아니며 공개 데모 반영 미확인이다. 기존 AI 보조 제작 아트·음성·음악 출처 공개와 이번 새 AI 생성0을 유지한다. 이전 Rift34/20초·Discord FAIL 및 폐기 VP9 출력은 게시 대상에서 제외했다.

## 실제 채널 상태·인계

| 채널·작업 | 현재 상태·남은 동작 |
|---|---|
| YouTube | **신규6편 PUBLISHED**, 재생목록 PUBLIC6, 전사 EN/KO 각22큐 게시 확인. 같은6편 재업로드 금지 |
| Steam 개발 소식 | [한영 공지 초안](../../marketing/releases/20261008/deployment/steam-news-draft.json) 준비. **Community 로그인 대기**, 실제 공지 게시0. 개발 소식이며 배포된 패치로 소개하지 않음 |
| Steam 상점 영상 | Steamworks 로그인 확인·새 trailer item **1369319 메타데이터만 저장**, 파일 미전송·미공개. 총괄 직접 실행 보고 기준 **사용자에게 파일 드래그 요청1회 안내 완료**, 완료 확인 전 반복 요청하지 않음 |
| Discord | FDG 네이티브 앱 계정·서버 접속은 보였으나 입력 반영 미검증. **웹 로그인 대기·이번 게시 확인0** |
| itch.io | [EXODUSER 프로젝트](https://beearth.itch.io/exoduser) **로그인 대기**, 이번 개발일지 게시0 |
| Reddit | [공식 프로필](https://www.reddit.com/user/fordeargamers/) **사람 확인 대기**, 이번 게시0. 외부 subreddit·DM 발송 없음 |
| Instagram·Threads·Bluesky | 인증된 계정 확인 없음, 이번 게시 완료로 기록하지 않음 |

연계 채널 [공지 초안](../../marketing/releases/20261008/deployment/channel-post-drafts.json)은 실제 공개 재생목록·영상과 채널별 Steam UTM을 포함한다. 초안 작성·앱 접속·입력 시도를 게시 완료로 세지 않는다. 게시 상태가 바뀌면 총괄이 후속 근거로 동기화한다.

## 지속 운영·다음 소재

기존 heartbeat **fdg / ACTIVE**, **화·금11:00 KST** 일정·대상·알림은 유지했다. 총괄 직접 실행 보고에 따라 프롬프트에 **실제 업데이트마다 Steam에도 공지**, **적용 버전·주요 변경·알려진 문제·영상·데모 링크 포함**, **개발 소식과 배포 패치 구분**, **이미 공개한6편 중복 업로드 금지**를 추가 완료했다. 일정 등록을 새 게시 완료로 계산하지 않으며, 변화 없는 재검증·같은 로그인 요청 반복을 하지 않는다.

다음 소재는 **지옥의 틈 개발 기록 v0.2**다. 실제 이동·화면 안정성·공간 연출의 개선을 확인하고 바뀐 부분을 검수한 뒤 새 기록으로 제작한다. 기존 v0.1의 WIP 허용을 완성품 모션 PASS나 현재 런타임 버그 수정 완료로 바꾸지 않는다.

게시 URL·상태는 복사한 JSON·게시 증거를 근거로 하고, 사용자 드래그 요청1회와 heartbeat 갱신은 총괄의 직접 실행 보고를 근거로 구분했다. 게임 코드·서버·사용자 세이브 변경이나 추가 플랫폼 게시를 이번 보존 작업에서 수행하지 않았다.
