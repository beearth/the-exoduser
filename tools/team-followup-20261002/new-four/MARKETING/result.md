# MARKETING 초기 채널·Steam 인수 및 문안 초안 1판

- 작업 ID: `MARKETING-INITIAL-CHANNEL-STEAM-20261002`
- 실행 담당: Codex / EXODUSER 유튜브 스팀 페이지팀 / `01a0fae0-cff3-78f0-aa73-32b08c6d6055`
- 실제 checkout: `/Users/fordeargamers/Projects/exoduser-migration-20261001`
- 착수 HEAD: `4cd0cb4906daee2b7953af7284f9ecc3ef96dd49`. TASK 작성 기준 `8fd5b7ecf7bb9caebf4a1c2cadb844e0986f8c82`와 구분한다. 이번 Git 쓰기 0.
- 운영: 총괄 1 + 전문 15 = 16역할, Claude 8 / Codex 8.
- 상태: **초기 인수·문안/일정 제안 제출**. 공개 전 Gate는 미통과이며 게시 승인·게임 출시·데모 제공 완료가 아니다.
- 작성 근거 관측: 2026-10-02 04:34:53 UTC / 13:34:53 KST 이후. 명령·시각·SHA·Changes는 같은 폴더 evidence.json에 보존한다.

## 1. 플랫폼·계정·공식 URL 식별표

웹 조회 시각은 도구가 제공한 개별 응답 시각이 없어 직전/직후 clock 사이의 범위로 기록했다. UTC에 9시간을 더한 KST이며 정확한 단일 조회 초를 만들어 넣지 않는다. 공개 페이지 내용은 익명 텍스트 추출 관측이다.

| id | 플랫폼·계정·공식 URL | docs 파일·행 | 조회 UTC / KST | 현재 공개 상태·조회 근거 | source·빌드 근거 | 역사 기록과 차이 | UNKNOWN·필요 정보 | 후속 Gate |
|---|---|---|---|---|---|---|---|---|
| M-01 | Steam 본편 / EXODUSER: HELL LORD / AppID4749590 / [공식 상점](https://store.steampowered.com/app/4749590/) | [데모 연결 기록](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_REVIEW_20260926.md:11), [행사 신청 AppID](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md:317) | 04:34:53–04:36:09 UTC / 13:34:53–13:36:09 KST | 익명 조회 성공. 게임명·개발/배급 FDG와 출시 예정 표시 관측. 상점 공개와 게임 출시를 구분 | 본편 source는 데모 고정. 최신 BUILD 보고는 기존 앱과 HTML 차이를 유지하며 runtimeAccepted=false | 9/30 기록의 미공개 대상은 데모 관리 상태. 본편 공개 페이지 존재를 데모 승인/출시로 확대하지 않음 | 로그인 관리 계정·권한과 최신 검토/빌드/지표는 UNKNOWN. 가격·출시일 확정 없음 | BUILD·QA 제품 인수, 문안 승인, 게시 범위 승인 |
| M-02 | Steam 연결 체험판 / EXODUSER: HELL LORD Demo / AppID5337590. 본편 데모 버튼 경로는 기록상 확인; 별도 공개 URL 추정 안 함 | [9/30 상태](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_REVIEW_20260926.md:7), [9/27 제출](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_REVIEW_20260926.md:26) | 본편에서 Demo 검색: 04:36:09–04:37:05 UTC / 13:36:09–13:37:05 KST | 본편 익명 추출 텍스트의 Demo 검색에 일치 없음. 다운로드 버튼이 이번 텍스트에서 관측되지 않았다는 범위만 확정 | 9/27 제출 Build25550483은 당시 기록. 현재 배포 빌드 직접 확인 없음 | 9/30 검토 대기·패키지 비공개는 이력이며 현재 미공개 확정으로 재사용하지 않음 | 최신 승인/반려·출시·버튼·다운로드 상태 UNKNOWN. 지역/세션/동적 표시 미검증 | 총괄의 승인된 Steamworks 상태 인수 + 실제 다운로드·설치·저장 재실행 검수 |
| M-03 | YouTube / 관리 대상 채널명·URL·handle·소유자 모두 UNKNOWN | [대시보드 감사](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_DASHBOARD_AUDIT_20260909.md:56)은 URL 입력 존재만 기록. docs 전체 URL 검색 0건 | 로컬 검색 2026-10-02, 착수~완료 관측 구간 | 사용자 채널을 특정할 근거 미확보. 동명이인·검색 결과를 사용자 계정으로 채택하지 않음 | 기존 영상 용도 승인과 행사 자료는 있음. YouTube 게시 URL·공개 상태 근거 없음 | 9/9 URL 입력 존재는 채널 URL/소유 증거가 아니다. 행사 승인도 신규 채널 게시 승인과 구분 | 채널 URL 또는 handle, 관리 채널명/소유 확인, 기존 영상 URL·공개 범위, 초안 언어, 승인 담당 필요 | 채널 식별→기존 게시물/권한 인수→문안 승인→별도 게시 배정 |
| M-04 | Steam 언어 표시 / 본편 공식 상점 | [지역 언어 정정](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_REVIEW_20260926.md:51), [구 업로드 기록](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_LANGUAGE_UPLOAD_20260923.md:34), [설명 저장 범위](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/STEAM_STORE_LOCALIZATION_20260909.md:11) | M-01과 동일 | 공개 표에 인터페이스·자막 29개, 전체 음성 표시 없음. 공개 선언의 관측이며 현행 출하 빌드 전 언어 QA를 의미하지 않음 | 9/23 언어 검수/업로드는 당시 패키지 근거 | 9/9 설명 저장 30언어와 9/23 당시 지원 31지역 항목은 서로 다른 작업. 9/26 정정 및 현 공개 표 29를 별도 기록 | 이번 한국어 URL 조회는 도구 Internal Error로 미확인. 각 언어 현재 공개 문안·번역 품질·현재 빌드 반영 UNKNOWN | 문안 승인 뒤 언어별 저장본/미리보기/게시 대조, 출하 언어 QA |

Steam 공개 표에 콘텐츠 규모·직업/합체 수·지속 운영과 온라인 관련 표시가 있지만, 이번 인수는 이를 제품 검수 근거로 사용하지 않는다. 공개 페이지 접근이 관리 계정 접근이나 위시리스트 수 확인을 의미하지 않는다. [공개 상점](https://store.steampowered.com/app/4749590/)에서 읽은 현재 표시와 소스 근거의 차이는 아래 표로 인계한다.

## 2. 현행 소스와 공개 문안의 경계

| id / 항목 | 실제 읽은 파일·행·식별자 | 이번 확정 범위 | 광고/출시 Gate |
|---|---|---|---|
| SRC-01 / 로비·진입 | [index.html](/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html:1140) `_LOBBY_BUILD='demo'`; [package.json](/Users/fordeargamers/Projects/exoduser-migration-20261001/package.json:6) main은 3333/index.html?demo=1 | 개발 설정은 데모 진입. 실제 Mac 앱의 격리 포트·프로필은 BUILD 파생 계약 | 이 package.json을 현재 Steam 출하 패키지나 Mac 지원 승인으로 표시하지 않음 |
| SRC-02 / 본편 진행 | [game.html](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:15826) `_DEMO_MODE=true`, Lv cap100, 마지막 stage0; [nextStage](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:42415) 종료 분기 | 본편 source는 1-1 클리어 뒤 데모 종료를 정의. 이번 완주 검수 0 | 전체 챕터 플레이 가능·정식 완성·무한 엔드게임 약속 제외 |
| SRC-03 / 쉬운판 | [game-easy-test.html](/Users/fordeargamers/Projects/exoduser-migration-20261001/game-easy-test.html:14943) `_DEMO_MODE=_BIC||location.search.includes('demo')`, 마지막 stage3 | 본편과 별도 모드/진행 제한. main의 범위를 쉬운판으로 대체하지 않음 | 정식 출시 범위는 총괄이 실제 출하 대상과 함께 고정 |
| SRC-04 / 캐릭터 | [로비 외형 목록](/Users/fordeargamers/Projects/exoduser-migration-20261001/index.html:3076) 전사, 나머지4개 `comingSoon:true`; [게임 CHAR_LIST](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:10125) 전사·실버테일 데이터 | 데이터/영상 준비와 정상 선택 가능한 캐릭터를 구분. 추가4종 플레이 가능 근거 없음 | 홍보는 대검전사 중심. 새 직업 수·공개일 제외; 명칭 헬거너/헬 헌터·창법사/아케인 랜서는 STORY/SKILL 정합성 인수 필요 |
| SRC-05 / 스킬 합체 | [합체쌍](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:42972) `_FUSE_PAIRS`; [허용집합](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:15829); [게이트](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:43127) `_canFuse` | 선언상 전체32쌍, 데모 허용22키. 실제 습득/허용 게이트와 전체 기능 완성을 구분. 구 문서의20/30은 역사 범위 | 초안에는 수량 없이 ‘스킬 합체’. 동작·툴팁·소모·저장 검수 후 수량 채택 |
| SRC-06 / 패링·기동 | [Q 마법 패링](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:33668), `_bkQParry`; `_sBlockChargeRadius`13818; `_sBashFire`37103; `_chainSlamRayHit`44795 | 패링·기동 관련 실제 source 경로 있음. 보호 계약 blackBean은 Q만, E 불가 | ‘모든 탄환을 아무 입력으로 반사’ 문구 금지. 보호2_3 문서 수정0. 플레이/시각/음향은 별도 |
| SRC-07 / 루팅·장비 | [rollAffixes](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:14570), [renderInv](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:48527) | 어픽스·인벤토리 경로 존재 | 구현 경로 확인을 드롭 확률·경제 완성·고유아이템22종 적용으로 계산하지 않음 |
| SRC-08 / 월드 데이터 | [TOTAL_STAGES](/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html:15822)=35; `_DUNGEON_SPEC`15850의11/16/33은ready:false | 정의 수와 제작/연속 진행 완성을 구분. 이번 맵 QA 0 | 전체35구역·35+보스 완성 주장 제외. 맵/보스 품질은 원담당 인수 |
| SRC-09 / 온라인·성능·OS | 이번 열람으로 협동/온라인 채팅/Remote Play Together 제품 인수 근거 확보 못함 | UNKNOWN이며 구현 전체 부재를 단정하지 않음. Mac 앱 존재와 Steam Mac 지원은 별개 | 온라인·다중플레이·확정 성능·Steam Deck/Mac 지원·지속 서비스 약속 제외 |

[BUILD 최신 보고](/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/codex-half/BUILD/result.md:24)는 현 source와 기존 앱 HTML 차이, runtime/visual 미인수를 기록한다. [QA 최신 보고](/Users/fordeargamers/Projects/exoduser-migration-20261001/tools/team-followup-20261002/claude-native-6/QA/result.md:48)는 source fixture와 실제 host Gate를 분리한다. MARKETING은 이 팀 보고를 열람 인수했으며 검사 재실행·실앱 검수·기능 승인 0이다.

## 3. Steam 한국어·영어 문안 초안

**문안 제안이며 저장/게시하지 않았다.** 실제 공개 전에 BUILD/QA가 아래 기능을 출하 빌드에서 인수해야 한다. 공개 본편의 개발 방향 소개와 현재 데모 범위 설명을 별도 단락으로 유지한다.

### 짧은 설명

한국어(109자, 공백·문장부호 포함):

> 지옥의 군세를 베어내고, 전리품으로 나만의 빌드를 만드세요. EXODUSER: HELL LORD는 거대검 전투, 탄막 패링, 사슬 기동과 스킬 합체를 결합한 다크 판타지 핵앤슬래시 ARPG입니다.

영어(202자, 공백·문장부호 포함):

> Cut through demonic hordes and turn loot into your own build. EXODUSER: HELL LORD is a dark fantasy hack-and-slash ARPG combining greatsword combat, projectile parries, chain mobility, and skill fusion.

길이는 초안 문자열의 Unicode code point 수다. 과거 설명 작업의300자 기준 안에서 작성했으며 실제 Steam 입력/저장/미리보기 검수는 0이다.

### 상세 설명 한국어 구조·문안

**추락에 대항하는 자들, 엑소듀서.**

EXODUSER: HELL LORD는 지옥에서 탈출하는 여정을 그리는 다크 판타지 핵앤슬래시 ARPG입니다. 거대검으로 몰려드는 적을 베어내고, 적의 탄막에 대응하며, 전리품과 스킬 조합으로 자신만의 전투 방식을 만들어 가세요.

**전투의 흐름을 바꾸는 패링과 기동**  
공격을 읽고 되받아치는 패링, 사슬을 활용한 이동과 거리 조절을 연결하세요. 전진과 회피, 반격의 타이밍이 군세를 상대하는 전투에 변화를 줍니다.

**전리품에서 시작하는 빌드**  
장비와 어픽스를 살펴보고 전투에 맞는 구성을 선택하세요. 스킬을 익히고 강화하며, 조건을 갖춘 스킬을 합체해 다른 공격 조합을 시도하세요.

**개발 중인 게임**  
전투 가독성, 반응성, 진행과 저장 안정성을 다듬고 있습니다. 현재 제공되는 빌드의 플레이 범위는 별도로 안내합니다.

**현재 데모 범위 — 공개 시 BUILD/QA 확인 후 사용할 별도 안내**  
대검전사로 1-1을 체험하고 해당 구역을 클리어하면 데모가 종료됩니다. 이 문장은 현행 본편 source의 제한을 설명하며 현재 Steam 데모 다운로드 제공을 뜻하지 않습니다. 실제 출하 제한이 달라지면 해당 빌드 인수 후 문안을 갱신합니다.

### Detailed description English structure and copy

**THOSE WHO DEFY THE FALL. EXODUSER.**

EXODUSER: HELL LORD is a dark fantasy hack-and-slash ARPG about escaping hell. Cut through approaching enemies with a greatsword, respond to projectile attacks, and shape your approach through loot and skill combinations.

**Parry, reposition, counterattack**  
Read incoming attacks and answer with a parry. Use chain mobility to adjust your distance, then move between pressure, evasion, and retaliation.

**Build through loot and skill fusion**  
Choose equipment and affixes that suit your approach. Learn and upgrade skills, then combine compatible skills to explore different attack combinations.

**In development**  
We are refining combat readability, responsiveness, progression, and save stability. The playable scope of each available build will be stated separately.

**Current demo scope — separate notice, subject to BUILD/QA acceptance before publication**  
Play the Greatsword Warrior in area 1-1; the demo ends when that area is cleared. This describes the current main source limit and does not announce a Steam demo download. Update this notice after the actual shipping build is accepted.

가격/출시일/신규 직업 수·업데이트 주기·온라인 기능·콘텐츠 규모·언어 품질 수량을 이 문안에 추가하지 않았다. 사전 제작 AI 사용 공개문은 현재 Steam 고지와 ART/SOUND/STORY 자산 인수를 바탕으로 총괄이 유지·대조한다.

## 4. 기존 승인 소재 인수와 트레일러 구성 제안

| 소재 ID | 문서상 용도/근거 | 이번 로컬 확인 | 사용 제안과 남은 Gate |
|---|---|---|---|
| ASSET-01 | 행사15초·30초 전투 영상, 이미지4장. [규격](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md:149), [편집 구성](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md:180), [슬로건](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md:263) | 문서에 적힌 checkout의 output/.../submission/6파일 모두 없음 | 최초30초 안내 영상의 우선 후보. 원담당이 기존 승인 파일·SHA·사용권을 인계한 뒤 현행 빌드와 대조. Drive 공유는9/28 이력이며 이번 현재 접근/다운로드0 |
| ASSET-02 | V22 스킬 트레일러98초 / 사용자 용도 승인. [계약·출력](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/GAMEPLAY_TRAILER_V22_20260909.md:7) | 지정 captures 경로의MP4 없음 | 자료 라이브러리 후보. Lv500/체력·자원 조정·실버테일 testchar 촬영을 현재 정상 데모/현재 선택 직업 소개로 사용하지 않음 |
| ASSET-03 | 9/2 Steam 보스 가시성 수정본60.8초. [SSOT](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/13출시·마케팅.md:391) | 지정 captures 경로의MP4 없음 | 역사 마스터 후보. 후반 맵/보스 및 최신 수치·자산 차이를 확인하기 전 첫 안내 영상에 채택하지 않음 |
| ASSET-04 | 9/8 트레일러 구성과9/9 70초 검토본. [가안/완료 기록 구분](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/GAMEPLAY_TRAILER_20260908_PLAN.md:5) | 문서만 열람 | 촬영 계획 참고. 현재 캡처/완성본으로 보고하지 않음 |

위8파일의 부재는 **확인한 정확 경로**의 결과다. 전체 디스크·PC·Drive에서 파일이 유실됐다는 판정은 하지 않는다. 신규 생성·편집·인코딩·복사·이동·삭제·업로드0이다. 행사 승인 [접수 기록](/Users/fordeargamers/Projects/exoduser-migration-20261001/docs/13출시·마케팅/INDIE_LIVE_EXPO_20261201_SUBMISSION_20260928.md:316)은 신규 Steam/YouTube 게시 승인으로 확대하지 않는다.

**30초 트레일러 구성 제안:** 기존 행사30초 편집을 기본으로 인수하며 아래는 향후 승인된 편집/문안 단계의 계획이다.

| 타임라인 | 기존 소재 | 화면으로 보여줄 내용 | 문구 제안 / 인수 조건 |
|---|---|---|---|
| 00:00–00:07 | current-parry | 탄막 대응→반격 | KO ‘패링으로 되받아쳐라’ / EN ‘Parry. Counterattack.’. 정확 입력·탄종 계약 대조 |
| 00:07–00:14 | current-slam | 대검·지옥강타 군집 타격 | KO ‘군세를 베어내라’ / EN ‘Break through the horde.’. 영상 출력fps를 게임 성능으로 광고하지 않음 |
| 00:14–00:21 | current-ice | 얼음보주와 전투 거리 조절 | KO ‘전투 방식을 바꿔라’ / EN ‘Shape your combat.’. 구 영상·현행 자원/효과 차이 대조 |
| 00:21–00:24 | 기존ss2 인벤토리 | 전리품·장비 선택 | KO ‘전리품으로 만드는 빌드’ / EN ‘Build through loot.’. 현행UI 대조 |
| 00:24–00:27 | 기존ss3 스킬/합체 | 조합 선택 | KO ‘스킬을 합체하라’ / EN ‘Fuse your skills.’. 수량 약속 없음 |
| 00:27–00:30 | 기존main 타이틀/로고 | 확정 슬로건·Steam CTA | ‘Steam 위시리스트에 추가하세요’ / ‘Wishlist on Steam’. 현재 파일에 CTA가 들어 있다고 주장하지 않음. 문안/편집 승인 후 반영 |

최초 구성에는 준비 중 캐릭터 소개·후반 챕터 완성·정식 출시일을 넣지 않는다. 9/28 촬영은 체력 보호·스킬 접근·적 배치 조정과 색보정이 기록된 인엔진 영상이다. ‘무편집 일반 플레이’라는 표현은 제외하고 개발 중 영상으로 안내한다. 최종 청취·영상 재생·권리·자산품질은 SOUND/ART/STORY 인수 대상이다.

## 5. YouTube 제목·설명·CTA 초안

| 언어 | 제목 제안 |
|---|---|
| 한국어 | EXODUSER: HELL LORD — 패링으로 되받아치는 지옥의 전투 · 개발 중 |
| 영어 | EXODUSER: HELL LORD — Parry, Loot, Build · Gameplay Preview |

한국어 설명:

> 추락에 대항하는 자들, 엑소듀서.  
> 거대검 전투, 탄막 패링, 전리품과 스킬 합체를 소개하는 개발 중 영상입니다. 촬영용 조건을 조정한 인엔진 장면이 포함되며, 현재 데모에서 플레이할 수 있는 범위는 별도 안내합니다.  
> Steam에서 EXODUSER: HELL LORD를 위시리스트에 추가하세요: https://store.steampowered.com/app/4749590/  
> 전투와 빌드에서 어떤 장면이 가장 궁금한가요?

English description:

> THOSE WHO DEFY THE FALL. EXODUSER.  
> A preview of greatsword combat, projectile parries, loot, and skill fusion in EXODUSER: HELL LORD. This is footage from a game in development and includes in-engine scenes with adjusted capture conditions. The playable scope of any available demo will be stated separately.  
> Wishlist EXODUSER: HELL LORD on Steam: https://store.steampowered.com/app/4749590/  
> Which part of combat or build creation would you like to see next?

설명 본문의 URL은 docs로 확인한 본편 URL만 사용한다. 채널·소셜 링크·데모 다운로드 링크·예약 구매·할인·가격은 넣지 않는다. 채널의 기존 언어 운영과 담당자 승인 후 한 언어를 본문으로, 다른 언어를 번역 필드/자막으로 쓰는 방식을 결정한다. 태그 제안은 EXODUSER, ARPG, HackAndSlash, DarkFantasy이며 실제 입력 0이다.

## 6. 게시 일정 제안 — 날짜 확정 없음

**D = 채널 소유 식별 + 정확 소재 인수 + 현행 빌드/플레이 검수 + 문안/권리 승인 + 별도 게시 배정이 모두 충족된 날.** D 자체가 UNKNOWN이다. 아래 D+N은 제안이며 예약·자동화·출시일 설정0이다.

| 제안 시점 | 산출/행동 | 사용 후보 | 선행 조건·측정 |
|---|---|---|---|
| D+0 | KO/EN Steam 설명·30초 영상 게시 후보 최종 패키지 인수 | 위 초안 + 기존 행사30초 | 문안·버전·파일SHA·현재출하범위 고정. Steam 실제 수정은 별도 승인 담당 |
| D+1 | YouTube30초 첫 소개 영상 게시 제안 | 기존30초 승인본, 추가편집이 필요하면 별도 배정 | 채널/언어·공개범위 승인. 공개URL·게시시각과 링크 클릭 결과 기록 |
| D+4 | 패링 집중 짧은 영상 제안 | 기존15초/패링 원본 중 채택분 | 세로 변환/자막 작업은 향후 별도 배정. 현재 파일의 존재·권리 인수 전 게시 불가 |
| D+8 | 루팅·스킬 합체 소개 또는 개발 근황 제안 | 승인된ss2/ss3와 기존전투컷 | 최신 UI/기능 대조. 미검수 소재면 일정 보류 |
| D+10 | 첫 공개 결과 검토 제안 | 게시물·Steam 공식 지표 | 권한 있는 담당의 실제 관측. 노출/시청지속/링크유입/위시리스트 변화를 구분하고 임의 목표·인과 관계를 만들지 않음 |

시즌 공백 홍보는 시장전략 가설이며 이번 일정은 특정 게임의 시즌 날짜를 근거로 확정하지 않았다. 도달·조회·위시리스트·판매 수는 UNKNOWN이다.

## 7. 필요한 정보와 공개 전 Gate

| Gate | 담당/필요 정보 | 현재 |
|---|---|---|
| G-CHANNEL | 채널 URL/handle, 관리 대상 채널명·소유 확인, 기존 영상URL/공개 상태 | UNKNOWN. 비밀번호·토큰·로그인 제출 요구0 |
| G-LANGUAGE | 초안/채널 언어와 최종 승인 담당·게시 권한 담당 | UNKNOWN |
| G-STEAM | 최신 데모 검토·공개/다운로드 상태, 실제 출하BuildID와 플레이 범위 | UNKNOWN. 로그인을 하지 않음 |
| G-MATERIAL | 기존 승인 소재의 실제 파일·SHA·버전·상업/2차 이용권, 영상/음향 검수 근거 | 이번 로컬8경로 부재. 원담당 인계 필요 |
| G-BUILD | 현 source/패키지 차이 해소·정확 출하 입력·저장/종료/재실행·영상·음향 | BUILD 보고의runtime/visual 미인수 유지 |
| G-QA | 정상 진입→전투→처치→획득→장비/합체→설정→저장→재실행 | source fixture PASS를 제품 PASS로 사용하지 않음 |
| G-STORY/ART/SOUND | 슬로건·용어·이미지·영상·권리·음악/효과음 | 기존 승인 기록만 인수. 현행 소재 검수 미실행 |
| G-COPY | KO/EN 설명과 수량/온라인/지원OS 표기 정합성 | 초안 제출. 게시 승인 대기 |
| G-PUBLISH | 특정 채널/상점·문안·파일·공개범위에 대한 별도 작업 배정 | 미배정. 업로드/게시/상점 수정0 |

## 8. docs 전체 검색과 총괄 보충 문안

| 검색 | 실제 결과 | 해석 |
|---|---|---|
| `rg -l -i 'YouTube\|youtu\\.be\|유튜브\|Steam\|스팀\|위시리스트\|트레일러' docs/` | exit0,133파일. 정확 전체 목록은evidence.docsSearch.keywordFiles | 광범위 키워드 검색이며133개 문서를 전부 내용 열람한 것은 아님 |
| `rg -n -i --max-columns 200 --max-columns-preview 'youtube\|youtu\\.be\|유튜브' docs/` | exit0,16매칭 행. 경영계획·행사·관리채팅·과거URL입력 기록 | 회사 연락처를evidence에 복제하지 않고 파일/행만 기록 |
| `rg -n -i -o '(https?://)?([A-Za-z0-9.-]+\\.)?(youtube\\.com\|youtu\\.be)/[^[:space:]<>)]*' docs/` | exit1,0매칭 | rg가 검색한docs 텍스트 범위에서 채널/영상URL 미확보. binary·무시파일·외부계정은 조사하지 않음 |
| 초기 `https?://...youtube.../youtu.be...` 검색(md/txt) | exit1,0매칭 | 이후docs 전체 도메인 검색으로 범위를 넓혀 같은 결과 |
 
공유 docs는 읽기 전용이라 직접 반영0이다. 아래 **정확 추가 문안**을 총괄이 인수 후 해당문서에 추가한다. 과거 기록은 덮어쓰지 않는다.

**총괄 관리/시장·마케팅 최신상태 절에 추가할 문안:**

> 2026-10-02 MARKETING-INITIAL-CHANNEL-STEAM-20261002: 사용자 소유 본편은 AppID4749590/EXODUSER: HELL LORD이며 공식 공개 URL은 https://store.steampowered.com/app/4749590/ 이다. 익명 공개 텍스트에서 상점 접근과 출시 예정, 인터페이스·자막29지역 항목/전체음성표시없음을 관측했다. 데모AppID5337590은 기록상 본편 데모 버튼 경로이며 별도 공개URL을 추정하지 않는다. 이번 본편 추출텍스트에서Demo 버튼을 관측하지 못했고 최신 검토·승인·출시·다운로드 상태는UNKNOWN이다. 9/30 검토대기·데모비공개는 당시 이력으로 보존한다. YouTube URL/handle·소유확인·기존영상URL/공개여부·운영언어·승인담당은미확보이며docs 전체YouTube도메인 검색0건이다. KO/EN Steam 설명·기존소재30초 트레일러 구성·YouTube 문안·D+N 일정은제안만 완료했다. 소재8개 정확로컬경로에서파일없음; 전체디스크/Drive유실 판정아님. source/빌드/플레이/권리/채널/문안/게시 Gate를 인수한 뒤에만 공개를 배정한다. 업로드·게시·로그인·신규영상/이미지생성·실게임·빌드0.

**13출시·마케팅.md의 구 버전 빌드 정의 다음에 추가할 현재 source 대조표:**

| 현재 source 항목 | 2026-10-02 읽기 전용 확인값 | 의미/제한 |
|---|---|---|
| game.html | _DEMO_MODE=true / _DEMO_LV_CAP=100 / _DEMO_LAST_STAGE=0 | 본편source의1-1종료 정의. 실제Steam출하BuildID/현재데모공개는별도 |
| game-easy-test.html | _DEMO_MODE=_BIC\|\|location.search.includes('demo') / _DEMO_LAST_STAGE=3 | 본편과다른쉬운판. 본편홍보범위를대체하지않음 |
| index.html / package.json | _LOBBY_BUILD='demo' / main=http://localhost:3333/index.html?demo=1 | 로비·개발package 진입. Mac앱의포트/프로필은BUILD파생계약 |
| 합체 선언 | _FUSE_PAIRS32쌍 / _DEMO_FUSE_ALLOWED22키 / _canFuse허용·구성스킬게이트 | 과거20/30표는구버전이력. 실제플레이/기능완성수량광고로사용하지않음 |
| 캐릭터·콘텐츠 | 로비추가4종comingSoon=true; TOTAL_STAGES35정의; _DUNGEON_SPEC11/16/33ready=false | 직업4종플레이가능·35구역완성·35+보스완성주장근거아님 |

**STEAM_STORE_LOCALIZATION_20260909.md/STEAM_LANGUAGE_UPLOAD_20260923.md 말미에 추가할 문안:**

> MARKETING 2026-10-02 후속 인수: 본문30설명언어 저장과9/23당시31지원지역항목은역사 기록으로 유지한다. 9/26스페인/포르투갈지역 정정 이후현재공개상점은인터페이스·자막29지역항목이며전체음성표시없음을익명텍스트로관측했다. 설명저장언어·지원체크박스·게임내부언어·실제출하언어QA를별도관리한다. 이번현지화입력/저장/게시/빌드검수0. 신규KO/EN문안은MARKETING소유result.md의미게시제안이다.

트레일러 문서에는 신규 영상 제작 완료를 추가하지 않는다. 승인된 행사/스킬 영상의 역사 용도·촬영 조정·현행 소재 인계 필요사항을 위초안 참조로만 연결한다. 보호2_3 문서 수정0이다.

## 9. 보존·완료 범위

쓰기 소유는 이 폴더의 result.md/evidence.json 2파일뿐이다. TASK·공유 docs·production·타팀 WIP·세이브·공용 인덱스에 쓰지 않았다. 핵심 source 6파일과 열람 SSOT의 착수/완료 SHA는 evidence에 기록한다. 테스트/검사 재실행·checks/new tests 생성 0이며 읽기/SHA/HEAD/status와 공식 공개 URL 조회만 수행했다. Changes 착수 53, 중간 58, 보고 작성 전 59이며 공유 동시 변경을 보존했다. 실제 최종 Changes는 evidence.changes.completion을 따른다. 80 이상 총괄 checkpoint/100 전 새 산출 중단 기준을 유지하며 Git 쓰기 0이다.

다음 일을 독자 생성하지 않는다. 총괄은 채널/소재/출하 범위의 UNKNOWN과 문안을 인수하고 후속 한 건을 배정한다.
