# EXODUSER: HELL LORD 게임 홍보팀 운영 대장 (PROMO)

작성: 2026-10-20 KST. 사용자 지시: **“게임 홍보 담당팀”** → **“기존게임홍보 담당팀 문서들 열람해서 작업 계속해”**.

이 Claude 클라우드 세션이 기존 [해외 홍보팀](FOREIGN_PROMOTION_TEAM_20261003.md)(2026-10-03 구성, Codex 팀장)의 운영을 이어받아 홍보 실무를 계속한다. 상위 설계·규칙은 해외 홍보팀 문서, 10-08 실제 계정·게시 이력은 [데모 공개·마케팅 착수 기록](DEMO_MARKETING_LAUNCH_20261008.md)이 정본이다. 이 문서는 10-20 이후의 상태·백로그·일정을 관리한다.

## 1. 문서 체계

| 문서 | 역할 |
|---|---|
| [Steam 상점 최신화 인계](STEAM_STORE_REFRESH_20261020.md) | **2026-10-20 신규.** 구버전·오류 항목 R01~R07, 영어 About 교체안, 30개 언어 교체 파일, 스크린샷 규격·촬영 목록. 실행은 VS Code 세션 |
| [출시 전 홍보 기획](PROMOTION_PLAN_20261020.md) | **2026-10-20 신규.** 캠페인 DEFY THE FALL — 경쟁작 일정, 메시지, 채널, 단계별 일정(~2027-03), 성과 측정, 결정 D1~D5 |
| [해외 홍보팀 구성·채널 설계](FOREIGN_PROMOTION_TEAM_20261003.md) | 담당 구조, 커뮤니티 판정, 14일 실험 설계, 측정 규칙 |
| [데모 공개·마케팅 착수 기록](DEMO_MARKETING_LAUNCH_20261008.md) | Reddit·Discord·itch.io 실제 상태, UTM, 크리에이터 17개 조사 |
| [대표 트레일러 홍보팀 검토](HERO_TRAILER_PROMOTION_REVIEW_20261008.md) · [30초 1차 편집](HERO_TRAILER_PRODUCTION_20261008.md) · [아트 티저](TRAILER_ART_REFRESH_20261009.md) | 영상 소재 상태. 10-08 편집본은 사용자 거절·원본 버전 불일치로 배포 제외, 10-09 아트 티저는 검토 후보·미게시 |
| [INDIE Live Expo 신청 기록](INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md) | 사용자 검토를 거친 영문 소개 원문(프레스킷 문안 근거) |
| [프레스킷 초안](../../marketing/presskit/EXODUSER_HELL_LORD_PRESS_KIT.md) | **이번 세션 신규.** 영문 팩트시트·소개·기능·AI 공개·미디어 목록 |
| [실행 초안 묶음](../../marketing/promotion/OUTREACH_AND_POSTS_20261020.md) | **이번 세션 신규.** Discord·Reddit·itch Devlog·Steam 공지·크리에이터 메일 초안, 신규 UTM |

## 2. 2026-10-20 상태 점검

**확인 범위:** 이번 세션은 클라우드 컨테이너다. `store.steampowered.com`, `discord.com`, `reddit.com`, `beearth.itch.io`, `youtube.com`, `fordeargamers.com` 연결이 환경 네트워크 정책에 거부됐다(curl 프록시 403, WebFetch DNS 실패). 아래 공개 페이지 상태는 **10-08 기록 기준**이며 오늘 재확인하지 못했다. 웹 검색 도구만 사용할 수 있었다.

| 항목 | 최종 확인 근거 | 10-20 판단 | 다음 행동 |
|---|---|---|---|
| Steam 본편 4749590 | 10-08 공개 상점 Coming Soon | 본편 빌드는 `setlive ""` 업로드 절차이며 [업데이트 규칙](STEAM_UPDATE_RULES.md) §6 기록표에 Set Live 완료 기록 없음 | 출시 시점은 §7 Next Fest 결정과 함께 |
| Steam 데모 5337590 | 10-08 다운로드 버튼·설치 링크 | Windows 실제 설치·실행 **미확인**(T06) | PROMO-002 |
| Discord 초대 `b3STKJwA` | 10-08 발급, 7일 | 약 10-15 만료 예정 → **만료로 간주**(직접 확인 불가). 프레스킷·게시물에 쓸 유효 초대 없음 | PROMO-001 영구 초대 |
| Reddit u/fordeargamers | 10-08 생성, 자체 프로필 공지 1건 | 12일차. r/IndieDev 계정 7일 조건 충족, comment karma 20 미확인. 타 subreddit 게시 0건 | PROMO-005·010 |
| itch.io beearth/exoduser | 10-08 공개, 파일 없음 | Devlog 미게시, 스크린샷 업로드 대기, 검색 노출 조건 미충족 | PROMO-006 |
| 크리에이터 PR | 17개 조사, 발송 0건 | 발신 계정·프레스킷 링크 미확정. 10-20 웹 검색으로 공식 연락처 추가 확인 실패 | PROMO-003·008 |
| Steamworks 성과 | 기준값 미열람 | 미기록 | PROMO-013 |
| 외부 검색 노출 | — | 10-20 웹 검색 3회(정식명+Steam demo, 정식명+개발사, 계정명 조합) 결과에 이 게임 0건, 비슷한 이름(Hell is Us, HellSlave 등)만 나옴. 도구 색인 한계로 확정 수치는 아님. **외부 기사·목록 등재 신호 없음** | 프레스킷·크리에이터·Steam 공지 우선 |

## 3. 팀 구성 — 승계

| ID | 담당 | 범위 | 실행 주체 |
|---|---|---|---|
| LEAD | 홍보팀장 — 이 Claude 세션 | 우선순위, 공통 사실 대조, 초안·프레스킷, 일정, docs 기록 | 클라우드: 문서·초안·조사 |
| REDDIT | 기존 `reddit_marketing` 역할 | 커뮤니티 규칙 확인, 게시안, 댓글 대응 | 게시는 사용자 확인 후 로그인 브라우저 |
| DISCORD | 기존 `discord_community` 역할 | 서버 운영, 공지, FAQ·피드백 정리 | 초대·공지는 로그인 브라우저 |
| PR | 기존 `overseas_indie_pr` 역할 + 프레스킷 | 크리에이터 검증·개인화, 미디어 패키지 | 발송은 확정 발신 계정 |
| 소재 | 트레일러 제작 담당·촬영 담당 | 영문 UI 스크린샷, 실제 전투 클립, 트레일러 | 게임 실행 가능한 PC/Mac |

[원격 브라우저 작업 규칙](../../CLAUDE.md)에 따라 로그인 작업은 Mac Chrome “Browser 2”에서 한다. 로그인이 풀려 있으면 사용자가 직접 로그인한다(대리 로그인 금지).

## 4. 실행 경계 — 승계 규칙 요약

1. 게시·발송·초대 재발급·Steam 공지는 **사용자 확인 후** 실행하고 실제 URL·날짜를 기록한다. 초안 작성을 게시·발송 완료로 세지 않는다.
2. AI 공개 문구는 Steam 설명과 같게 유지한다: 사전 제작 시각 자산·SFX·음악의 AI 보조 사용, 개발자 검수·편집, 런타임 AI 생성 없음.
3. 데모와 개발 빌드를 구분한다. 데모 App은 별도 지시 때만 갱신되므로 개발 빌드 변경을 “데모에 추가됨”으로 쓰지 않는다.
4. 패링 계약: 무지개탄 blackBean은 Q만 패링 가능하다. “모든 공격 반사”, “E로 무지개탄 반사” 표현을 쓰지 않는다.
5. 출시일·가격·콘텐츠 수·신규 캐릭터 플레이 가능 여부를 확정 사실처럼 쓰지 않는다. 개발 목표는 개발 목표로 표기한다.
6. 유료 광고·유료 PR 없음. 봇 계정·대량 초대·상호 업보트·자동 반복 발송 없음.
7. 영상을 보지 않았다면 크리에이터 메일에 “I watched your video”라고 쓰지 않는다.

## 5. 14일 파일럿 일정 점검

| 기준 | 날짜 | 상태 |
|---|---|---|
| 활동 1일차 | 2026-10-08 | 자체 Reddit 공지·Discord 공지·itch.io 공개 |
| 7일차 중간 검토 | 2026-10-14 | **기록 없음** |
| 14일차 운영 검토 | 2026-10-21 | 예정 |
| 18일차 최종 집계 가능 | 2026-10-25 | Steam UTM 확정 시점(방문 4일 뒤) |

10-08 이후 실제 외부 확산 활동(r/playmygame 모집, 크리에이터 발송)이 0건이므로 10-25 집계는 **채널별 기준값**으로만 쓴다. 성과 판정용 14일 실험은 PROMO-001·002 해소 후 첫 외부 게시일을 새 활동 1일차로 다시 시작할 것을 제안한다.

10-25 이후 사용자가 Steamworks UTM 화면에서 채울 측정표:

| utm_source / content | 기간 | Total / Trusted / Tracked Visits | UTM Wishlist | 전환율(÷Tracked) | 비고 |
|---|---|---|---|---|---|
| reddit / profile_launch01 | 10-08~10-21 | | | | |
| discord / demo_launch01 | 10-08~10-21 | | | | |
| itchio / demo_launch01 | 10-08~10-21 | | | | |

분모가 0이거나 임계치로 미표시면 `자료 부족`으로 적고 0으로 단정하지 않는다([측정 규칙](FOREIGN_PROMOTION_TEAM_20261003.md#6-측정과-계속수정-판단)).

## 6. 크리에이터 후보 검증 — 우선 5개

17개 전체 근거는 [착수 기록 §7](DEMO_MARKETING_LAUNCH_20261008.md#7-해외-크리에이터-후보-조사--발송-전-단계). 발송 전 [검증 기준](../../marketing/promotion/OUTREACH_AND_POSTS_20261020.md#61-후보별-검증--발송-전-필수)을 후보마다 채운다.

| 순위 | 후보 | 확인일 | 공식 연락 | 최근 활동 | AI 정책 | 판정 |
|---|---|---|---|---|---|---|
| 1 | Rhykker | 10-08 | 공식 문의 페이지 확인(10-08) | 미확인 | 미확인 | 재확인 대기 |
| 2 | ZiggyD | 10-08 | 공식 사이트 확인(10-08) | 미확인 | 미확인 | 재확인 대기 |
| 3 | Splattercatgaming | 10-20 | 검색으로 확인 실패 | 미확인 | 미확인 | 검증 대기 |
| 4 | Mortismal Gaming | 10-20 | 검색으로 확인 실패 | 미확인 | 미확인 | 검증 대기 |
| 5 | Raxxanterax | 10-20 | 검색으로 확인 실패. 제3자 집계상 ARPG 관련 스폰서 이력 있음(공식 확인 아님) | 미확인 | 미확인 | 검증 대기 |

제외·보류는 착수 기록 판정을 유지한다: I Dream of Indie(광고 목적 문의), Wanderbots·Retromation(AI 관련 거절 안내 확인 전 접촉 안 함).

## 7. 행사·일정

| 날짜 (현지 기준 명시) | 항목 | 상태 / 조치 |
|---|---|---|
| 2026-10-19 ~ 10-26 (검색 요약) | Steam Next Fest 10월 회차 | 진행 중. 데모 공개가 등록 마감 이후라 **미참가** |
| 2026-10-25 | 파일럿 18일차 | §5 측정표 작성 |
| 2026-12-01 JST | INDIE Live Expo | 09-28 신청 접수. 10-20 검색 기준 출품 라인업 미발표. 선정 여부는 주최 측 메일 확인 필요 |
| 2026-12 초 (추정) | Diablo IV 시즌 15 종료 | 제3자 추정. [홍보 기획 §1](PROMOTION_PLAN_20261020.md#1-경쟁작-일정과-진입-창) |
| 2026-12-06 | 대형 ARPG 크리에이터 연락 마감(기획안) | PoE2 1.0 전에 끝냄 |
| 2026-12-11 | **Path of Exile 2 1.0 정식 출시·무료화** | 12월 중순~1월 ARPG 관심 집중 → 외부 연락 대신 제작·Next Fest 등록 |
| 2027-01-10 23:59 PST | **Steam Next Fest 2월 회차 등록 마감** | 참가 여부 결정 필요(PROMO-011) |
| 2027-01-25 | 프레스 프리뷰 시작부터 데모를 노출하기 위한 데모 빌드·상점 페이지 제출 기한 | 참가 시 |
| 2027-02-08 | 필수 항목 심사 제출 기한 | 참가 시 |
| 2027-02-11 | 프레스 프리뷰 시작(제3자 요약) | 크리에이터·언론 연락 집중 시점 |
| 2027-02-22 10:00 PST ~ 03-01 10:00 PST | Steam Next Fest 2월 회차 | — |

Next Fest 참가 조건(웹 검색 요약 기준, Steamworks 직접 열람은 이번 환경에서 불가): Coming Soon 상점, 페스티벌 시작 시 공개 플레이 데모, **게임·데모당 1회만 참가**, 출시는 페스티벌 종료 후, 기존 출시 콘텐츠의 데모판 제외. 등록 전 Steamworks 해당 회차 페이지에서 원문을 다시 확인한다.

**사용자 결정 필요:** 본편(Early Access 포함) 출시를 2027-03-01 이후로 두고 2월 Next Fest를 주요 찜 확보 행사로 삼을지 여부. 참가하면 10~12월은 커뮤니티·소재·프레스킷·크리에이터 관계를 쌓고, 1월 등록·데모 갱신, 2월 프레스 프리뷰 연락으로 이어가는 일정을 제안한다.

## 8. 백로그

| ID | 우선 | 작업 | 담당 / 선행 조건 | 상태 |
|---|---|---|---|---|
| PROMO-001 | P0 | Discord 영구 초대 재발급·로그아웃 화면 확인·링크 반영 | 사용자 로그인 브라우저 | 대기 |
| PROMO-002 | P0 | 공개 Steam 데모 Windows 설치·첫 실행·조작 확인, 배포 버전 기록(T06) | PC 또는 사용자 | 대기 |
| PROMO-003 | P0 | 발신 계정·업무 이메일·프레스킷 `[CONFIRM]` 항목(연락처, 영상 정책, 크레딧, 로고 사용) 확정 | 사용자 | 대기 |
| PROMO-004 | P1 | 공개 데모 빌드 기준 영문 UI 스크린샷 5장 + 30–60초 실제 전투 클립 | 촬영 담당. 일반 플레이와 연출 촬영 구분 표기 | 미착수 |
| PROMO-005 | P1 | r/playmygame 체험 모집 게시(`RDT-PMG-01`) | 001·002 후, 사용자 문안 승인 | 초안 완료 |
| PROMO-006 | P1 | itch.io Devlog 게시(`ITCH-DEV-01`) | 사용자 확인 | 초안 완료 |
| PROMO-007 | P1 | Steam 데모 공개 공지(`STM-EVT-01`) | 001 후(초대 링크), 사용자 확인 | 초안 완료 |
| PROMO-008 | P1 | 크리에이터 우선 5개 검증 → 개인화 → 발송 | 003, 프레스킷 공유본 | 메일 초안 완료 |
| PROMO-009 | P1 | 프레스킷 공유 버전 — 웹 페이지, Hell Gothic 디자인 토큰, 1x 화면 검수 | 003·004, 호스팅 위치(공식 홈페이지 등) 결정 | 텍스트 초안 완료 |
| PROMO-010 | P2 | r/IndieDev 개발 피드백(`RDT-IDV-01`) | 004 클립, karma 조건 | 초안 완료 |
| PROMO-011 | P1 | Next Fest 2월 회차 참가 결정·등록 | 사용자 결정, 마감 2027-01-10 PST | 결정 대기 |
| PROMO-012 | P2 | INDIE Live Expo 선정 결과 확인 | 사용자 메일 | 대기 |
| PROMO-013 | P1 | Steamworks UTM 기준값 기록(§5 측정표) | 사용자 Steamworks, 10-25 이후 | 대기 |
| PROMO-014 | P2 | 공개용 트레일러 승인(10-09 아트 티저 검토 후보) | 사용자 승인 | 대기 |
| PROMO-015 | P2 | Discord 개발 소식 2호 게시 | 001 후, 사용자 확인 | 초안 완료 |
| PROMO-016 | P1 | 주간 핵심 클립 촬영 체계 — 영문 UI, 일반 플레이 녹화, 15–30초 편집 | 촬영 담당 | 미착수 |
| PROMO-017 | P1 | Steam 이벤트 격주 발행, 커버 800×450 템플릿 | 사용자 확인 | 미착수 |
| PROMO-018 | P2 | 숏폼 채널 운영 — YouTube Shorts 주 1편부터 | 기획 D2 결정 | 결정 대기 |
| PROMO-019 | P1 | Next Fest 전 데모 갱신 범위 결정 | 기획 D5, 12월 | 결정 대기 |
| PROMO-020 | P1 | Next Fest 보도자료 영·한 | 기획 Phase 3 | 미착수 |
| PROMO-021 | P2 | Next Fest 라이브 방송 계획 | 기획 Phase 3 | 미착수 |
| PROMO-022 | P1 | 중형 인디 ARPG 크리에이터 2차 후보 10곳 조사 | 기획 W3(11-09~15) | 미착수 |
| PROMO-023 | P2 | r/ARPG 등 추가 커뮤니티 홍보 규칙 확인 | 로그인 브라우저 | 미착수 |
| PROMO-024 | P2 | 국내 홍보 범위 결정 | 기획 D3 | 결정 대기 |
| PROMO-025 | P2 | 본편 출시 캠페인 기획서 | Next Fest 후 | 미착수 |
| PROMO-026 | P0 | Steam 상점 최신화 — 스크린샷 교체, 영어 About 교체, 29개 언어 라벨 삭제, 사양 메모 오타 | 맥북총괄 세션(Mac Chrome·Steamworks). 10-20 사용자 “너가 알아서 수정해” | 홍보팀 문구·규격·교체 파일 완료. 10-20 23:5x KST 맥북총괄에 실행 요청. 맥북총괄 접수 기록: 사용자 결정 “준비 후 게시 전 확인”. **10-21 00:15 KST 차단:** 맥북총괄이 인계 문서(4adabfd9) 확인 후, Claude in Chrome에 Mac Chrome Browser 2가 연결돼 있지 않아(Windows Browser 1만 연결) 사용자에게 Mac Chrome 연결 요청. 맥북총괄은 10-21 05:20 KST 보관, 후속 “맥북총괄 (fork)” 세션이 이어받음. fork 기록상 06:05 KST Mac Chrome(Claude 확장) 연결 → 차단 해소. 17:41 KST 기준 Steam 재개 기록 없어 fork 세션에 재개 알림 전달(사용자 기기 세션 메시지 허용 후). 맥북총괄은 회신 수단이 없어 브랜치 §6·세션 기록으로 확인 |

## 9. 2026-10-20 세션 기록

| 항목 | 내용 |
|---|---|
| 열람 | 해외 홍보팀(10-03), 데모 공개·착수 기록(10-08), 트레일러 검토·제작·아트 티저(10-08~09), 촬영 manifest, INDIE Live Expo 신청, FDG 회사 자료 안내, 홈페이지 캐릭터 갤러리, Steam 업데이트 규칙, v0.7.0 패치노트, 총괄 마스터·팀 시작 규칙 |
| 신규 | `marketing/presskit/EXODUSER_HELL_LORD_PRESS_KIT.md`, `marketing/promotion/OUTREACH_AND_POSTS_20261020.md`, 이 문서, 후속 지시 “앞으로 홍보기획해볼까”에 따른 [출시 전 홍보 기획](PROMOTION_PLAN_20261020.md) |
| 갱신 | [총괄 팀 등록부](../0마스터플랜/PROJECT_MANAGEMENT_MASTER.md#3-팀-등록부) PROMO 행, 해외 홍보팀·착수 기록 상단에 이 문서 안내 |
| 웹 조사 | Next Fest 2월 회차 일정·참가 조건, INDIE Live Expo 12월 라인업, 우선 후보 연락처, 게임명 검색 노출(§2·§6·§7) |
| 외부 실행 | 로그인·게시·발송·초대·Steam 공지 **0건** |
| 변경 없음 | 게임 코드·수치·맵·세이브·런타임 에셋·확정된 돌진/패링/방패 설계 |

## 10. 출처 — 2026-10-20 웹 검색

| 출처 | 확인한 내용 |
|---|---|
| [Steamworks Next Fest 2027년 2월](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/feb_2027) | 회차 기간·등록 마감·제출 기한(검색 요약) |
| [Steamworks Next Fest 안내](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest) · [2026년 6월 회차](https://partner.steamgames.com/doc/marketing/upcoming_events/nextfest/2026june) | 참가 조건·1회 참가 제한(검색 요약) |
| [Steam Page Analyzer — 2027년 2월](https://www.steampageanalyzer.com/blog/steam-next-fest-february-2027) | 프레스 프리뷰 시작일(제3자) |
| [Final Weapon — INDIE Live Expo 12월](https://finalweapon.net/2026/07/20/indie-live-expo-returns-on-december-1-2026-with-major-showcase/) | 12-01 개최, 라인업 추후 발표 |
| [SponsorRadar — Raxxanterax](https://sponsorradar.com/channels/raxxanterax) | 제3자 추정 스폰서 이력(공식 확인 아님) |
| [Bugnet — 스트리머 키 전달](https://bugnet.io/blog/how-to-send-steam-keys-to-streamers-safely) | 공개 업무 연락처 대조·키 배포 서비스 후보 |
