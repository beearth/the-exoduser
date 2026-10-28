# 홍보 실행 초안 묶음 — 2026-10-20

> **상태: 초안 / 게시·발송 0건.** 실행은 사용자 확인 후 Mac 로그인 브라우저에서 한다(클라우드 세션은 Steam·Reddit·Discord·itch.io 접속이 네트워크 정책으로 차단됨). 운영 기록·우선순위: [홍보팀 운영 대장](../../docs/13출시·마케팅/PROMOTION_TEAM_MASTER.md). 공통 사실·문안 근거: [프레스킷 초안](../presskit/EXODUSER_HELL_LORD_PRESS_KIT.md).

## 0. 실행 전 공통 확인

| 확인 | 필요한 이유 | 현재 |
|---|---|---|
| Windows에서 공개 Steam 데모 설치·첫 실행·조작 확인 | r/playmygame 모집·크리에이터 전달의 전제(해외 홍보팀 §5 시작 조건) | **미확인** (T06) |
| Discord 영구 초대 | 10-08 초대 `b3STKJwA`는 7일짜리, 약 10-15 만료 | **재발급 필요** |
| 발신 계정·업무 이메일 | 크리에이터 메일·프레스킷 연락처 | **미확정** |
| 각 커뮤니티 현재 규칙·AI 규정 | 10-08 이후 바뀌었을 수 있음 | 게시 직전 재확인, 확인일 기록 |
| 패링 문구 | 무지개탄(blackBean)은 Q만 패링 가능 | “모든 공격 반사”, “E로 무지개탄 반사” 표현 금지 |
| 데모와 개발 빌드 구분 | 데모 App 5337590은 별도 지시 때만 갱신 | 개발 빌드 변경을 “데모에 추가됨”으로 쓰지 않음 |

## 1. UTM 링크 — 이번 묶음

캠페인은 기존 `foreign_pilot_202610`을 유지한다. 신규 `utm_content`만 추가한다.

| 대상 | source / medium / content |
|---|---|
| r/playmygame 체험 모집 | `reddit` / `community` / `playmygame_demo01` |
| r/IndieDev 개발 피드백 | `reddit` / `community` / `indiedev_parry01` |
| itch.io Devlog | `itchio` / `devlog` / `itch_devlog01` |
| Discord 개발 소식 2호 | `discord` / `community` / `discord_update02` |
| 크리에이터 메일 | `creator` / `outreach` / `creator_<후보ID>` 예: `creator_rhykker` |

```text
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=reddit&utm_medium=community&utm_campaign=foreign_pilot_202610&utm_content=playmygame_demo01
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=reddit&utm_medium=community&utm_campaign=foreign_pilot_202610&utm_content=indiedev_parry01
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=itchio&utm_medium=devlog&utm_campaign=foreign_pilot_202610&utm_content=itch_devlog01
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=discord&utm_medium=community&utm_campaign=foreign_pilot_202610&utm_content=discord_update02
https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/?utm_source=creator&utm_medium=outreach&utm_campaign=foreign_pilot_202610&utm_content=creator_rhykker
```

## 2. Discord

### 2.1 영구 초대 재발급 — 사용자 화면 조작

1. 서버 **EXODUSER: HELL LORD | FDG** → 서버 이름 메뉴 → **Invite People**.
2. **Edit invite link** → *Expire After* **Never**, *Max Number of Uses* **No limit**, 임시 멤버 OFF → **Generate a New Link**. 도착 채널은 `#start-here`.
3. 로그아웃 브라우저에서 초대 화면의 서버 이름을 확인한다.
4. 새 링크를 운영 대장 §2와 프레스킷 Discord 칸, itch.io 외부 링크에 반영한다. 만료된 7일 링크를 다시 배포하지 않는다.

### 2.2 `#announcements` 개발 소식 2호 — 초안

```text
Development update — what we're working on

Thank you to everyone who has tried the free EXODUSER: HELL LORD demo on Steam.

Our current development build (not yet in the demo) includes:
• Gem quality (1–100) and Socket Stones — open up to 5 sockets on gear
• 19 Legendary and 25 Unique items with exclusive looks, plus new affixes
• Afterimage trails for movement skills (Dash, Ghost Walk)
• A living Chapter 1 forest and a depth pass for its terrain
• A guide text size setting and a "Fit settings window to screen" option

The demo stays as it is for now. We will announce here when new content reaches it.

Played the demo? Tell us in #feedback:
• Could you read enemy attacks during crowded fights?
• Could you tell when a parry succeeded?

Steam: <discord_update02 UTM 링크>
```

근거: [v0.7.0 패치노트](../../docs/13출시·마케팅/patch_notes/v0.7.0.md)의 확정(final) 플레이어용 항목. 본편 빌드 Set Live·Steam 패치노트 게시는 별도 사용자 확인 대상이며 이 공지가 그것을 대신하지 않는다.

## 3. Reddit

계정 **u/fordeargamers**는 2026-10-08 생성으로 10-20 기준 12일차다. 자체 프로필 공지는 타 subreddit 게시로 세지 않는다. 계정 조건을 채우려는 무의미한 댓글·상호 업보트는 하지 않는다.

### 3.1 r/playmygame — 체험 모집 (`RDT-PMG-01`)

- 조건: 무료 플레이 가능, 직접 링크, 개발 참여 역할 명시, 같은 게임 월 1회. 호러 테마 NSFW·Windows flair 여부는 게시 직전 sidebar로 확인.
- 아래 1인칭 문장은 **개발자 본인 명의**다. 사용자가 읽고 승인한 뒤 게시한다.

**Title:** `[PC] EXODUSER: HELL LORD — a free dark fantasy ARPG demo built around projectile parries`

```text
Hi! I'm the solo developer of EXODUSER: HELL LORD, a story-focused dark fantasy action RPG built around loot, skill combinations, and active combat.

You fight hordes of enemies, experiment with your build, and turn incoming projectiles against them with well-timed parries.

Free Steam demo (Windows): <playmygame_demo01 UTM 링크>
On the store page, select "Download EXODUSER: HELL LORD Demo." The full game is still Coming Soon.

What I'd love to hear:
1. Was it clear what to do in the first fight?
2. Could you tell when a parry succeeded or failed?

Known issues: <확인된 데모 알려진 문제 — 없으면 이 줄 삭제>

Content note: fantasy violence, blood, and dark horror themes.
AI disclosure: the game uses AI-assisted pre-produced visual assets, sound effects, and music, reviewed and edited by me. No AI generation runs during gameplay.
```

### 3.2 r/IndieDev — 개발 피드백 (`RDT-IDV-01`)

- 조건: 계정 7일 충족(12일차). comment karma 20은 **미확인**. AI 콘텐츠 적합성은 게시 직전 확인.
- 전제: **15–25초 실제 전투 클립**(패링→반사→군집). 현재 승인된 클립 없음 → 촬영·승인 후 게시.

**Title:** `Making parries readable during swarm combat — where does it get hard to follow?`

```text
I'm the solo dev of EXODUSER: HELL LORD, a dark fantasy ARPG where you parry incoming projectiles in the middle of large fights.

This clip is from the current build. My problem: when the screen is crowded, enemy attacks and reflected projectiles can blend together.

At what point in the clip is it hard to tell enemy attacks from reflected projectiles? If you'd change one visual cue first, which one?

Steam page: <indiedev_parry01 UTM 링크>
(AI disclosure: AI-assisted pre-produced visuals/SFX/music, reviewed and edited by me; no runtime generation.)
```

개발자 커뮤니티 반응은 구매 의향 지표와 분리해 기록한다.

## 4. itch.io Devlog (`ITCH-DEV-01`)

**Title:** `The free EXODUSER: HELL LORD Steam demo is live`

```text
The free demo of EXODUSER: HELL LORD is now available on Steam.

EXODUSER: HELL LORD is a story-focused dark fantasy action RPG built around loot, skill combinations, and active combat. Battle swarms of enemies, experiment with your build, and turn incoming projectiles against them with well-timed parries.

PLAY THE FREE STEAM DEMO — WINDOWS
<itch_devlog01 UTM 링크>
On the store page, select "Download EXODUSER: HELL LORD Demo." The full game is still Coming Soon. No downloadable build is hosted on this itch.io page.

HELP US IMPROVE THE DEMO
• Could you read enemy attacks clearly during crowded fights?
• Could you tell when a parry succeeded and what happened to the projectile?
For bugs, please include your game version, Windows version, steps, and expected versus actual result.

CONTENT NOTE: Fantasy violence, blood, corpses, and dark horror themes.
AI DISCLOSURE: The game uses AI-assisted pre-produced visual assets, sound effects, and music, reviewed and edited by the developer. No AI generation runs during gameplay. This post was prepared with AI assistance.
```

게시 시 Steam 공개 스크린샷 1장(`output/marketing_launch_20261008/steam_screenshot_01.jpg`)을 첨부할 수 있다. 영문 UI 스크린샷이 확보되면 교체한다.

## 5. Steam 공지 — 데모 공개 소식 (`STM-EVT-01`)

Steamworks → 이벤트 및 공지에서 작성한다. 유형은 게시 화면에서 현재 선택지를 확인한다. **외부 공개 게시이므로 사용자 확인 후** 게시한다.

**Title:** `The free EXODUSER: HELL LORD demo is live — tell us how the parry feels`

```text
The free demo of EXODUSER: HELL LORD is available now. Select "Download EXODUSER: HELL LORD Demo" on this page to play.

Fight hordes of enemies, experiment with skills and equipment, and turn incoming projectiles against them with well-timed parries. The demo features the Greatsword Warrior.

We would love your feedback:
• Could you read enemy attacks during crowded fights?
• Could you tell when a parry succeeded or failed?

Share your thoughts in the Steam Community discussions or on our Discord: <영구 초대 링크>

Thank you for playing — and for adding EXODUSER: HELL LORD to your wishlist if you enjoyed it.
```

## 6. 해외 크리에이터 연락 (`PR-OUT-01`)

### 6.1 후보별 검증 — 발송 전 필수

2026-10-20 클라우드 웹 검색으로는 우선 후보의 공식 연락처를 새로 확인하지 못했다(검색 결과에 해당 페이지 미노출, 직접 열람은 네트워크 차단). 아래 항목은 Mac 로그인 브라우저에서 후보마다 채운다.

| 확인 항목 | 기준 |
|---|---|
| 공식 업무 연락 | YouTube 채널 정보의 업무 이메일, 또는 본인 공식 사이트. 제3자 사본·과거 영상 설명은 공식 확인으로 세지 않음 |
| 활동성 | 최근 30일 내 업로드, 최근 90일 내 ARPG·인디 관련 영상 |
| AI 정책 | 채널 정보·고정 게시물·공식 사이트에 AI 보조 게임 거절 안내가 있으면 제외 |
| 제안 방식 | 무료 제안 접수 여부, 키 배포 서비스(Keymailer·Woovit·Lurkit 등) 사용 여부. 유료 광고 경로는 집행하지 않음 |
| 기록 | 확인일·URL·결과를 운영 대장 §6 표에 기록 |

### 6.2 우선 5개 — 검증 대기

| 순위 | 후보 | 장르 근거(10-08 조사) | 연락 경로 상태 |
|---|---|---|---|
| 1 | Rhykker | ARPG 비교 영상 | 10-08 공식 문의 페이지 `business@rhykker.com` 확인. 현재 조건 재확인 |
| 2 | ZiggyD | 루팅 ARPG 영상 | 10-08 공식 사이트 `business@ziggyd.tv` 확인. 현재 조건 재확인 |
| 3 | Splattercatgaming | The Slormancer 영상, 인디 중심 | 미확인 |
| 4 | Mortismal Gaming | Grim Dawn 영상 | 미확인 |
| 5 | Raxxanterax | The Slormancer 영상, ARPG 중심 | 미확인 |

제외·보류: I Dream of Indie(문의가 광고 목적, 유료 집행 안 함), Wanderbots·Retromation(제3자 사본의 AI 거절 안내, 공식 확인 전 접촉 안 함).

### 6.3 개인화 메일 초안

- `[verified game]`에는 그 채널에 **실제로 있는 영상의 게임명**만 넣는다. 영상을 보지 않았다면 “I watched your video”라고 쓰지 않는다.
- 발신자 이름·이메일은 사용자가 확정한다. 프레스킷 링크는 공유 버전 공개 후 넣는다.

**Subject:** `EXODUSER: HELL LORD — free demo of a dark fantasy ARPG with projectile parrying`

```text
Hi [creator name],

I'm [sender name], the solo developer of EXODUSER: HELL LORD at FOR DEAR GAMERS. I'm reaching out because your channel covers action RPGs such as [verified game].

EXODUSER: HELL LORD is a dark fantasy action RPG built around loot, skill combinations, and projectile parrying in large-scale fights. A free demo is available on Steam now:
[creator_<id> UTM 링크]

Press kit (facts, screenshots, logo): [press kit link]

The game uses AI-assisted pre-produced visual assets, sound effects, and music, reviewed and edited by me; no AI generation runs during gameplay. I'm mentioning it up front in case it matters for your coverage.

There is no obligation to cover it. If you'd like more information, just reply to this e-mail.

[sender name] — FOR DEAR GAMERS
[business e-mail] · https://store.steampowered.com/app/4749590/EXODUSER_HELL_LORD/
```

후속 연락은 응답이 없을 때 **최대 1회**, 첫 메일 10일 뒤에 짧게 보낸다. 대량 일괄 발송·자동 반복 발송은 하지 않는다.
