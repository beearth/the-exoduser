# Steam 상점 페이지 최신화 — 홍보팀 문구·소재 규격 인계

작성: 2026-10-20 KST. 사용자 지시: **“지금 스팀페이지 최신으로 업데이트해 구버전 올라가있네”** → **“지금 VS코드에서 세션하나가 하고있으니까 같이해”**.

## 0. 역할 분담

| 담당 | 범위 |
|---|---|
| **VS Code 세션** (Steamworks 접근 가능) | Steamworks 로그인 작업, 최신 빌드 스크린샷 촬영·업로드, 문구 입력·저장·미리보기, 공개 확인 |
| **홍보팀(이 클라우드 세션)** | 바꿀 항목 정리, 영문·한국어 문구 교체안, 스크린샷 규격·촬영 목록. Steam·Steamworks 접속은 네트워크 정책으로 불가 |

이 클라우드 세션에서는 VS Code 세션이 원격 제어에 연결돼 있지 않아 직접 메시지를 보낼 수 없다. 이 문서를 인계 창구로 쓴다. VS Code 세션은 실행 결과를 §6에 기록한다.

**2026-10-20 23:5x KST 후속:** 사용자 지시 “너가 알아서 수정해”. 홍보팀 세션은 Steamworks·Mac Chrome에 접근할 수 없으므로, 원격 연결된 **맥북총괄** 세션에 이 문서 기준 실행(다른 창과의 중복 확인, 재내보내기 후 교체 파일 재생성, 스크린샷 촬영·교체, 게시, §6 기록)을 요청했다. 게시 전 사용자 확인 여부와 Steamworks 로그인은 CLAUDE.md 규칙대로 맥북총괄이 판단·요청한다. 맥북총괄 접수 기록상 사용자 결정은 **“준비 후 게시 전 확인”** — 저장·미리보기까지 준비하고 게시는 사용자 확인 뒤에 한다. 맥북총괄 세션에는 홍보팀 세션으로 회신할 도구가 없으므로 결과는 이 문서 §6에 커밋하거나 맥북총괄 기록에 남긴다.

**10-21 08:23 KST 상태 — 차단:** 맥북총괄 기록(10-21 00:15 KST)상 인계 문서 확인은 끝났으나 Claude in Chrome에 Mac Chrome “Browser 2”가 연결돼 있지 않아(Windows “Browser 1”만 연결) Steamworks 작업을 시작하지 못했다. 사용자에게 Mac Chrome 연결을 요청한 상태. 맥북총괄은 10-21 05:20 KST에 보관됐고 후속 “맥북총괄 (fork)” 세션이 작업을 이어받았다.

**10-21 17:41 KST 상태:** fork 세션 기록상 06:05 KST에 Mac Chrome(Claude 확장)이 연결돼 차단은 풀렸다. 다만 Steam 작업 재개 기록이 없어 홍보팀이 fork 세션에 재개 알림(인계 경로·게시 전 사용자 확인·결과 기록 위치)을 보냈다.

상점 저장·공개는 외부 공개 작업이므로 사용자 확인 후 진행한다. 본편 빌드 Set Live·패치노트 게시는 이 문서의 범위가 아니며 [Steam 업데이트 규칙](STEAM_UPDATE_RULES.md)을 따른다.

## 1. 현재 상점에서 구버전·오류로 확인된 항목

근거는 [2026-09-09 Steamworks 감사](STEAM_DASHBOARD_AUDIT_20260909.md)와 [상점 30언어 현지화 기록](STEAM_STORE_LOCALIZATION_20260909.md)이다. 이후 수정 기록은 docs에서 찾지 못했다. 10-20 현재 상태는 VS Code 세션이 Steamworks에서 다시 확인한다.

| ID | 위치 | 문제 | 교체안 |
|---|---|---|---|
| R01 | 스크린샷 5장 전체 | 9월 이전 빌드. 한국어 HUD·대사가 그대로 찍혀 영어 상점에도 노출 | 최신 빌드·영문 UI로 재촬영(§4) |
| R02 | 스크린샷 4번 (감사 A03) | 오른쪽 아래에 Windows 정품 인증 워터마크 | 삭제 후 교체 |
| R03 | 스크린샷 5번 (감사 A10) | 원본 1960×1183, 16:9 아님 → 상점에서 좌우 검은 여백 | 1920×1080 촬영본으로 교체 |
| R04 | 영어 About (감사 A07) | 한국어 원문에 없는 약속·수치: 35+ 보스, 6 archetypes, 5 rarity tiers, 21+ fusion combinations, **Live service**, 35 stages / 35+ stages 혼용 | 한국어 원문 구조와 같은 영문으로 교체(§2) |
| R05 | 최소·권장 사양 메모 (감사 A18) | `nline activation required via Steam.` — 첫 글자 O 누락 | §3 |
| R06 | 한국어 About 첫 문단 | 이미지 바로 뒤에 `짧은 설명`이라는 라벨 문구가 본문에 그대로 보임(다른 언어도 같은 구조로 번역됨) | 라벨만 삭제, 요약 문단은 유지 |
| R07 | 트레일러 2개 | 2026-09-02 촬영 기준. 현재 승인된 새 트레일러 없음 | 교체 대기. 10-09 아트 티저는 사용자 검토 후보(PROMO-014) |

헤더·캡슐·라이브러리 자산은 9-09 감사에서 최신 규격(헤더 920×430, 소형 462×174, 메인 1232×706, 수직 748×896, 라이브러리 600×900·920×430·3840×1240·1280×720) 등록이 확인됐다. 이번 교체 대상이 아니다.

## 2. About This Game 교체안

### 2.1 영어 — 한국어 원문 구조와 같은 내용

다른 28개 언어는 한국어 원문 구조로 번역돼 있다. 영어만 다른 내용(과장 수치·라이브 서비스 약속)이었으므로, 영어를 한국어 원문과 같은 내용으로 맞춘다. 새 약속·수치를 추가하지 않는다.

```text
[p][img src="{STEAM_APP_IMAGE}/extras/library_hero_3840x1240"][/img][/p][p]Cut down hundreds of demons, parry bullet patterns with the key that matches their color, and drive your chain into the walls to cross the battlefield. Upgrade and fuse skills to build your own playstyle in this dark fantasy hack-and-slash action RPG.[/p][h2]About the Game[/h2][p][b]EXODUSER: HELL LORD[/b] is a single-player dark fantasy hack-and-slash action RPG in which you start at the bottom of hell and fight your way out.[/p][p]Sweep through swarming demons with your greatsword and a range of skills, and grow your character with the gear you find. Combat is more than repeating attacks: read enemy bullet patterns, respond to them, and use your chain to cross the battlefield at speed.[/p][h2]Read the Bullets and Strike Back[/h2][p]Enemy attacks come in different colors and patterns. Dodge incoming bullets, or answer them with the right input to turn the fight around.[/p][p]Even in large-scale hack-and-slash battles, split-second judgment and direct control matter.[/p][h2]Cross the Battlefield with Your Chain[/h2][p]Drive your chain into a wall to be pulled across at speed, escaping danger or punching straight through enemy lines.[/p][p]Link movement and attacks to dive into enemy packs, break back out, and take control of your position in every fight.[/p][h2]Upgrade and Fuse Your Skills[/h2][p]Unlock and upgrade skills through combat. Certain skills combine into new, more powerful forms.[/p][p]The skills you choose and how you combine them change how you fight and how your build comes together.[/p][h2]Farm Gear and Complete Your Build[/h2][p]Weapons and gear carry a variety of abilities and affixes.[/p][p]Find stronger equipment, swap it in, and combine skill and item effects to build your own combat style.[/p][h2]Break Through Hell[/h2][p]Pass through hell's different environments and enemies, and face ever stronger foes and bosses.[/p][p]Fight through a dark, foul world of massive enemy hordes and intense skill effects on your way back to the surface.[/p][p][b]Key Features[/b][/p][list][*][p]Real-time hack-and-slash combat against large enemy hordes[/p][/*][*][p]Bullet parrying: read colors and patterns, then respond[/p][/*][*][p]Chain mobility that uses walls to cross the battlefield fast[/p][/*][*][p]A variety of active skills and skill fusion[/p][/*][*][p]Gear farming and build crafting[/p][/*][*][p]A single-player campaign set in a dark fantasy world[/p][/*][/list]
```

### 2.2 한국어 — R06 라벨만 삭제

기존 한국어 원문에서 첫 문단의 `짧은 설명` 라벨만 지운다. 나머지 본문은 그대로 둔다.

```text
변경 전: [p][img src="{STEAM_APP_IMAGE}/extras/library_hero_3840x1240"][/img]짧은 설명[/p][p]수백 마리의 악마를 베어 넘기고, …
변경 후: [p][img src="{STEAM_APP_IMAGE}/extras/library_hero_3840x1240"][/img][/p][p]수백 마리의 악마를 베어 넘기고, …
```

나머지 28개 언어도 같은 위치에 각 언어로 번역된 `짧은 설명` 라벨이 있다. 같은 방식으로 라벨만 지운다. 언어별 라벨 원문은 `output/steam_localization_20260909/final_reexport_all.json`의 각 언어 `app[content][about]` 첫 문단에서 확인한다.

### 2.2.1 30개 언어 교체 파일

§2.1·§2.2를 30개 언어에 적용한 Steamworks 현지화 JSON을 만들어 두었다. 수작업으로 29개 언어 라벨을 지우는 실수를 줄이기 위한 것이다.

| 파일 | 내용 |
|---|---|
| `marketing/steam-store-refresh-20261020/store_about_refresh_upload.json` | itemid 1189321, 30개 언어 About + 한국어 짧은 설명(마침표). 다른 필드는 넣지 않음 |
| `marketing/steam-store-refresh-20261020/build_refresh.py` | 생성 스크립트. 29개 언어는 라벨만 지우고 태그 순서·나머지 문자 불변을 검사. 영어는 한국어와 태그 구조 일치, 한글 0자, 과장 문구 0건을 검사 |
| `marketing/steam-store-refresh-20261020/refresh_report.json` | 언어별 삭제한 라벨, 원본 SHA-256 |
| `marketing/steam-store-refresh-20261020/english_about.txt` | §2.1 영문 원문 |

생성 기준은 9-09 최종 재내보내기본(`output/steam_localization_20260909/final_reexport_all.json`, SHA-256 `b2a1f9a5…13fb`)이다. **업로드 직전에 Steamworks에서 현재 값을 다시 내보내** `python3 build_refresh.py <새 내보내기.json>`으로 다시 만든다. 9-09 이후 상점 문구가 바뀌었으면 그 값을 기준으로 처리된다. 9-09 작업 기록대로 먼저 1개 언어만 올려 저장·재내보내기 일치를 확인한 뒤 나머지를 진행한다. 짧은 설명은 일괄 붙여넣기가 저장되지 않은 이력이 있으므로 저장 후 재내보내기로 확인한다.

### 2.3 선택 — 최신 장비 기능 한 줄 추가

현재 개발 빌드(v0.7.0 패치노트 확정본)의 장비 기능을 “장비를 파밍하고 빌드를 완성하라” 절에 넣을 수 있다. **30개 언어 모두에 번역해 넣을 때만** 적용한다. 영어·한국어에만 넣으면 언어별 내용이 다시 달라진다.

| 언어 | 추가 문장 |
|---|---|
| 영어 | `[p]Socket gems of varying quality into up to five sockets, and hunt legendary and unique items with their own distinct looks.[/p]` |
| 한국어 | `[p]최대 5개의 홈에 품질이 다른 보석을 박고, 고유한 외형을 지닌 전설·유니크 아이템을 찾아보세요.[/p]` |

근거: [v0.7.0 패치노트](patch_notes/v0.7.0.md) — 보석 품질(1~100)·소켓석·최대 5홈, 전설 19종·유니크 25종 전용 외관. 데모 App 5337590에 들어갔다는 뜻은 아니다.

### 2.4 짧은 설명

| 언어 | 판단 |
|---|---|
| 영어 | 현행 유지. 과장 수치 없음(`seven layers of hell`은 배경 설정) |
| 한국어 | 현행 유지. 끝에 마침표만 추가 |

## 3. 시스템 요구 사항 메모 (R05)

최소·권장 모두 `nline activation required via Steam.`을 고친다. 실제로 Steam 온라인 활성화가 필요한지 VS Code 세션이 빌드 설정으로 확인한 뒤 둘 중 하나를 넣는다.

| 확인 결과 | 입력 |
|---|---|
| Steam 온라인 활성화 필요 | `Online activation required via Steam.` |
| 확인 불가 또는 불필요 | `Requires the Steam client.` |

## 4. 스크린샷 규격·촬영 목록 (R01~R03)

| 항목 | 규격 |
|---|---|
| 크기 | **1920×1080, 16:9**. 리사이즈·잘라내기 없는 원본 캡처 |
| 개수 | 6–8장(Steam 최소 5장) |
| 빌드 | 현재 main 최신 게임. 촬영 커밋 SHA를 §6에 기록 |
| 언어 | 게임 언어를 **English**로 설정. 한국어 대사·HUD가 보이면 다시 찍음 |
| 화면 정리 | OS 워터마크·작업 표시줄·브라우저 UI·성능 오버레이·테스트/디버그 표시 없음 |
| 내용 | 실제 게임 화면만. 홍보 문구를 덧씌우지 않음 |
| 전체 이용가 체크 | 장면마다 확인. 피·시체가 보이는 장면은 “모든 연령에 적합” 체크를 해제 |
| 순서 | 첫 장은 가장 강한 전투 장면. 첫 장에 메뉴·로딩 화면을 두지 않음 |

| 순서 | 장면 | 보여 줄 것 |
|---|---|---|
| 1 | 대검 군집 전투 | 화면을 채운 적 무리, 대검 공격 |
| 2 | 패링 순간 | 받아친 탄이 적에게 돌아가는 장면. 무지개탄은 Q 패링 장면만 사용 |
| 3 | 스킬 합체 | 합체 스킬 이펙트 |
| 4 | 보스전 | 보스 전신이 보이는 구도(예: 다크드루이드) |
| 5 | 장비·인벤토리 | 전설·유니크 아이템, 보석 소켓 툴팁(영문) |
| 6 | 1장 환경 | 살아 움직이는 숲·지형 입체감(v0.7.0) |
| 7 | 이동 | 사슬 기동 또는 잔상 이동 |
| 8 | 세계관 | 디로이·헥터가 나오는 스토리 장면(영문 자막) |

연출을 위해 몹 배치·테스트 캐릭터를 썼다면 §6에 그 사실을 기록한다. 일반 플레이 화면이라고 쓰지 않는다.

## 5. 저장·공개 순서

1. Steamworks 상점 페이지 편집에서 현재 상태를 먼저 내보내기·백업한다.
2. 스크린샷을 올리고 R02·R03 기존 장을 삭제한다. 순서를 §4 표대로 맞춘다.
3. 영어 About(§2.1), 한국어 라벨 삭제(§2.2), 사양 메모(§3)를 입력한다. BBCode 원문 모드로 붙여 넣는다.
4. 미리보기에서 영어·한국어 본문과 이미지, 갤러리 순서를 확인한다.
5. 사용자 확인 후 저장·게시한다. 재내보내기로 저장값이 입력본과 같은지 확인한다.
6. 결과를 §6에 기록한다.

## 6. 실행 기록 — VS Code 세션 작성

| 항목 | 결과 |
|---|---|
| 촬영 빌드 커밋 SHA | |
| 업로드한 스크린샷 수·파일 | |
| 삭제한 기존 스크린샷 | |
| 영어 About 교체 | |
| 28개 언어 라벨 삭제 | |
| 사양 메모 수정 | |
| 미리보기·재내보내기 확인 | |
| 사용자 확인·게시 시각 | |
| 미해결 | |
