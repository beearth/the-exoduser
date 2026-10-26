## 2026-10-26 Mac Unity 현재 소유 블록

이 블록이 현재 Mac Unity 작업 상태다. 아래10/25 NEXT/ACTIVE는 완료 당시의 이력이므로 현재 할 일로 재사용하지 않는다.

| 상태 | 현재 단위 / 담당 / 실제 범위 |
|---|---|
| COMPLETE | 첫2실습·world-blend HUD 인수 유지. 지원 SFX/BGM·FPS·fullscreen 저장/복원: 모델61+별도write3/read2, 실제 격리 Player6회63/63·성공/오류 설정창 확인. source9d587ca15, 정상 ARM64 errors0. [설정 인수](../UNITY_MAC_SETTINGS_PERSISTENCE_20261026.md) / [최신 실행본](../UNITY_MAC_PLAYABLE_20261025.md) |
| COMPLETE | 720p 착용 안내 문장만 짧게 정리. source837636a26·Player8/8·720/1080 두 PNG 직접 인수·정상 ARM64 errors0. 글꼴/viewport/스크롤바/장비 동작 보존. [인수](../UNITY_MAC_INVENTORY_HINT_20261026.md) |
| COMPLETE | 같은 language_pointer가 다음 자막 범위를 읽기 전용으로 확정: 실제 caption=NanumMyeongjo-Regular, 우크라이나어 ї/є/і의 cmap 매핑 없음. 메뉴 Noto 검사와 구분·제품/다운로드/GPU/저장 변경0. [근거](../UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md) |
| COMPLETE | 원본 초반 무음·Gate original soundtrack 복구. FDG 호출 muted=true, native intro track0일 때만 원본 MP3 packet fallback. 실제 Player31/31·normal b4560e63 ARM64 errors0, 정상 저장 hash 동일·기존 사용자 앱 유지. [인수](../UNITY_MAC_INTRO_SILENCE_20261026.md) |
| ACTIVE | 실제 Claude 기존 조명 담당 UNITY-MAP-LIGHT-01의 d3a4a9a3b 코드 제출 회수. Unity/GPU 해제를 전달했으며 별도 빌드·화면·조명 전후 성능 검수로 진행. 공용 NativeGame 두 줄은 별도 patch 대조, 자동 병합/시각 PASS 아직 없음 |
| PENDING | GPT API 이미지1개는 OPENAI_API_KEY 부재로 요청0·생성0. 안전한 로컬 인증 후 필요한 자산만 진행. 다른 제공자 잔액 소진 주장은 하지 않음. 자막3문자 후속은 보존 |

### 2026-10-26 Mac→PC 우선순위 협의 송신 — Mac 소유 기록
1. Mac `codex/unity-mac-20261024`의 `eaa1c0bff`는 `--unity-arabic-caption-preview` 전용 ATG 후보이며 일반 실행 채택은 0이다. cue20 720/1080과 `ar→ko`만 실제 확인했다.
2. Mac 우선순위는 같은 HEAD 재빌드 1회 후 cue32(0-based index31) `EXODUSER.`와 아랍어 32큐의 원문·시간·결합·문장부호·줄바꿈을 순서대로 확인하는 것이다. 실패 큐는 RETOUCH로 남긴다.
3. PC UI는 별도 브랜치·소유 범위로 유지해 Mac ATG 검수와 자동 병합하지 않는다. 현재 PC focus·키보드 QA 결과는 Mac 측에서 수신·인수한 증거가 없어 완료라고 표시하지 않는다.
4. PC 담당에게 요청할 협의 순서는 focus 복귀·키보드 조작의 실제 QA 결과와 SHA를 먼저 공유하고, 그 뒤 원본 UI 차이 중 공용 접점만 소유자끼리 대조하는 것이다.
5. 이 블록은 Mac 측 송신 기록이다. 상대의 열람·답신·합의는 아직 확인되지 않았으며, 확인 전에는 수신/합의 완료로 승격하지 않는다.

Mac 후속 실제 상태: 같은 HEAD `763667931` ARM64 빌드에서 cue32 `.EXODUSER` RETOUCH를 발견해 `a249c4eb4`에서 문장별 RTL/LTR을 고쳤다. `cdc50a1e6`는 기존 QA 플래그 시작 언어만 ar로 지정한다. 최종 ARM64 오류0 Player의 플래그 실행에서 720p 32/32 가시 문구·결합·문장부호·한 줄/잘림·순서와 cue32 `EXODUSER.` 및 ar→ko 복귀 PASS. [32큐 인수표](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md). 일반 실행 채택0. 이 기록 당시 PC 회신은 미수신이었고, 이후 수신은 아래에 기록했다.

Mac 배경폭 후속: `9cc2759c1` ARM64 오류0 빌드에서 720p 웹 동일 cue22·긴 cue21·짧은 cue29·라틴 cue32 및 1080p 긴 cue21·cue28/메뉴·짧은 cue26·ar→ko를 격리 Player로 확인했다. 배경은 내용 폭을 따른다. 이번 빌드 32큐 전수 재확인과 일반 실행 채택은 하지 않았다. QA는 `--unity-frontend-review --unity-arabic-caption-preview -output 새절대경로` 세 조건 모두 사용하며 preview 플래그만으로 저장 격리되지 않는다. 추가 화면 수집 중 CUA가 플래그 없는 PID1571을 자동 실행해 즉시 종료·증거 제외했고, 이 앱의 일반 프로필 읽기 가능성은 [QA 기록](../UNITY_MAC_ARABIC_CAPTION_PREVIEW_20261026.md)에 남겼다. 위 Mac→PC 협의의 송신은 `763667931`의 `docs/engine/orders/WORK_BOARD.md`다. PC/Claude의 실제 회신은 `f974d5e33`의 [PC_TO_MAC_INBOX_20261021.md](PC_TO_MAC_INBOX_20261021.md) §2026-10-26 밤4에 있다. 회신은 Mac 자막 우선과 PC 별도 소유, 공용 접점 대조 일정의 Mac 결정을 수락했다. 최신 PC UI 누적 patch 15개 요청은 같은 전달함 §밤6에 접수됐지만 자동 적용·병합·Mac 실기 검수는 하지 않았다.

일반 사용자 앱38141/48476/52157는 종료하지 않았다. 앞선 격리 검수의 별도 product/id 기록과 구분해, 이번 유효 ATG Player는 제품 ID가 같지만 `--unity-frontend-review`로 설정 I/O를 끄고 새 절대 `-output`으로 캐릭터 저장을 분리했다. 다만 위 플래그 없는 PID1571은 일반 프로필을 읽었을 수 있어 원래 prefs·캐릭터 파일 무접근/무변경은 입증하지 않는다. 첫부팅FPS120/기본값60·60·0/고정60Hz 유지. 웹/Godot/전투save IO·새설정·새팀·자동화·유료생성·PC재가동0.

## 2026-10-25 Unity web language-menu parity COMPLETE

Bounded menu/input unit; existing storage preserved. [Contract](../UNITY_MAC_LANGUAGE_MENU_PARITY_20261025.md).

# 공동 작업판 (Claude 총괄 ↔ Codex 총괄) — 단일 기준

## 2026-10-25 사용자 지정 세계관 정본 적용·웹 표시 수정 완료

최신 정본은 사용자가 직접 첨부한 world_intro_v22b_steam.mp4/102,204,634B/SHA3b99d59b...다. 기존 최신본미확정 판단 종료. 같은 Mac 구현 담당이 정확 파일 적용·재생·전환을 우선하고, 기존 지원 담당은 파일 인수만 담당한다. [정본과 실제 적용 상태](../UNITY_WORLD_INTRO_CANONICAL_20261025.md). 정본+표시 source d789dd1ae 원격 보존, ARM64 errors0, 정본12/12 자연완주·7PNG 확인. 일반 실행도 열었으며 사용자 전사 이야기 진행 중 보존. 다음은 언어 메뉴 입력 확정과 기존 웹 시각/저장 흐름 차이 제거. 신규 업데이트는 이식/비교검수 이후다.

## 2026-10-25 Mac 누적 실행본·소지품 키보드 완료

정상 한국어 로비 PID35707을 열어 사용자 조작 가능한 누적본을 확인했다. [실행 경로·포함 범위·대표 캡처](../UNITY_MAC_PLAYABLE_20261025.md). 같은 담당이 소지품 방향키/G/C/Enter·상세 스크롤·포커스 차단을 연결했다. 모델33/33·Player17/17·8PNG·실제 최소화/복원 후 해제·키보드 PASS. ARM64 errors0, 직접 실행과 macOS 앱 실행의 포커스 차이를 기록했다. [검수 완료](../UNITY_MAC_INVENTORY_KEYS_20261025.md).

## 2026-10-25 Mac 일시정지·설정 키보드 완료

원본 UI 우선 후속: 선택·값 조절·뒤로/재개·종료와 창 포커스 복귀 차단 완료. 모델33/33·Player21/21·실제 키보드/창 최소화복귀 PASS, 표시 잘림 수정 후8PNG·최종 ARM64 errors0. NEXT: 소지품 키보드 선택·비교/상세·장착/해제. 이번 코드·빌드·검수 마감. [범위와 결과](../UNITY_MAC_PAUSE_KEYS_20261025.md). 기존 담당만 NativeGame/NativePauseMenu·빌드·공유 docs 소유.

## 2026-10-25 Mac 신규 전사 이야기·생성 진입 완료

원본 영상·29×22자막,22cut/1.2초hold/1.2초gate 연결. 모델41/41·실제 skip15/실패7/자연완주8=30/30, ARM64 오류0. CUA 격리 저장으로 생성 Enter1.6초·짧은Esc/긴Esc·같은이름의실제플레이진입 확인, 저장revision1회증가·검수앱종료. [인수 기록](../UNITY_MAC_WARRIOR_STORY_20261025.md). 전투진행save/패드/전체다국어font·RTL은별도. **NEXT:** 남은 일시정지/설정 키보드 조작·메뉴 focus 복귀.

## 2026-10-25 Mac 캐릭터 삭제·목록 저장 완료

삭제 모델58·복원13·디스크53·삭제 Player9·새 프로세스4회 저장16/16 통과. 최종 ARM64 오류0, 한/영2해상도 표시·CUA 기본취소/확인삭제·긴Enter 입력 차단과 정상 부팅 확인. 캐릭터 이름·선택만 새 Unity 파일에 저장하며 전투 진행/기존 save는 별도. [인수 기록](../UNITY_MAC_CHARACTER_SLOTS_20261025.md). 다음 원본 신규 전사 story(22cue/1200ms 스킵)→미리보기 진입을 착수했다. 지원은 원본 추출/독립 계약, 기존 담당은 NativeLobby/Flow·GPU·공용 docs 소유 유지.

## 2026-10-25 Mac 세션 캐릭터 생성·선택 검수 완료

기존 스킬 마감 후 대기 상태를 확인하고 동일 담당이 구현했다. 원본 이름/5슬롯/전사만 생성 제한·세션 목록→선택 이름의 실제 preview 진입 연결. 새 모델41/41·Player행동16/16·CUA 일반 키/한글붙여넣기/중복/선택 진입 확인, 최종 ARM64 build 오류0·표시9장 확인. 영속 저장·IME 직접 조합·자동 마우스·전체화면은 미인수. [범위와 영수증](../UNITY_MAC_CHARACTER_UI_20261025.md). 검수 CLI 종료, 새 팀·자동화·PC 재가동 없음. **NEXT:** 원본 캐릭터 삭제 확인/취소·선택 갱신을 세션 목록에 연결하는 남은 메뉴 단위. 전체 이식 완료나 상시 자동 실행을 의미하지 않는다.

## 2026-10-25 Mac 스킬 상세·슬롯 UI 검수 완료

K 창·원본13슬롯 선택·기검참 상태/충전 HUD 연결. 모델34/34, 최종 Player6/6, ARM64 빌드 오류0, 720p/1080p 화면 확인. CUA K/숫자/End/ESC 조작과 최종 제목 잘림 수정을 검수했다. 전체 스킬 실행기·포지·저장은 미이식. [범위와 근거](../UNITY_MAC_SKILL_UI_20261025.md). **NEXT:** 캐릭터 생성·선택과 슬롯 세션/저장 경계. 원본 이름2~8자·금지문자·중복·최대5슬롯을 확인했으며 캐릭터 코드는 아직 변경하지 않았다.

## 2026-10-25 Mac 장비 비교·일시정지 설정 통합

**이번 단위 완료:** 장비 비교156·지원 설정66·실제 Player15검사 통과, ARM64 build 오류0·화면8장 확인. OS 직접 메뉴 입력과 전체화면 전환은 미검수. **NEXT:** 스킬·퀵슬롯 → 캐릭터 생성·슬롯 → 남은 메뉴. 기존 담당이 원본/기존 기능 범위부터 연결하며 새 자동화·신규 팀을 만들지 않는다. [통합 범위](../UNITY_MAC_INVENTORY_SETTINGS_20261025.md). 언어 해상도 진단은 [근거 보존](../UNITY_MAC_LANGUAGE_DIAGNOSTICS_20261025.md) 후 마감, 자동 마우스/본문 글꼴·RTL은 미완료. 영상·offset·저장·PC·자동화 변경0.


## 2026-10-25 Mac 로비·시네마틱 언어 선택 연결 완료

동일29개 이름 목록/2열 키보드, 실제 EN자막 변경·Esc6초 목록취소의 skip차단·키해제 후 정상skip·KO로비복귀 확인. 일반build 오류0. [최종 입력 검수](../UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md). 검수 앱은 한국어 로비로 열어뒀다. **NEXT:** 29개 자막 본문 글꼴/RTL과 새 목록 해상도·정밀 마우스 입력의 미완료 범위를 실제 근거로 좁힌다. 영상/offset/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 언어 이름 완료 → 시네마틱 선택 통일

23원문 이름·6개 ko/en 대체 이름으로29목록 가독성 개선. 실제 한/영 화면과2열 키 입력 확인, 일반 build 오류0. [검수](../UNITY_MAC_LANGUAGE_NAMES_20261025.md). **NEXT/ACTIVE:** 같은 담당이 시네마틱 언어 선택의 이름/키보드/닫기 규칙을 연결하고 장면넘김 입력 누출을 차단한다. 전체29자막 폰트/RTL은 별도. 영상/offset/저장/전투/자동화 변경0.


## 2026-10-25 Mac 로비 팝업 조작 검수 → 언어 목록 가독성

일반 Mac 빌드 오류0. CUA 실제 L 열기·FR 선택·Esc 취소·마지막 AR 경계·Tab KO 순환·바깥 클릭 닫기를 확인했다. 작은 selector 마우스 입력은 미확인, Unity 실행 차단 아님. [결과](../UNITY_MAC_LOBBY_POPUP_20261025.md). **NEXT/ACTIVE:** 같은 담당이 언어 목록의 자국어명 가독성·기존 폰트 지원 범위를 조사한다. 기존20/9·536/42 반복0, 영상/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 자막 선택 완료 → 팝업 조작 진행

로비29선택·메뉴 ko/en 구분, 원본 locale alias/unknown→en 연결. 순수536/536·Native42/42, 원본 목록 순서 수정 후 ARM64 일반 빌드 오류0. 정상 CUA 기본 표시와 probe의 KO/FR/PTBR 렌더를 구분했으며 OS selector 클릭은 미인수. [근거](../UNITY_MAC_LOBBY_LANGUAGE_20261025.md). **NEXT/ACTIVE:** 같은 Mac 담당 NativeLobby 팝업 Esc/바깥 클릭 닫기·키보드 선택·입력 누출 방지. 자국어명/RTL 전체 현지화 미완료. 기존20/9 재검·영상/저장/전투/PC/자동화 변경0.


## 2026-10-25 Mac 로비 표시 완료 → 언어 선택 연결 진행

로비 개발 오버레이 제거/우측 preview·저장 불가 안내 구현, 소스 전용 새 Mac QA에서 build errors0 및 CUA 실제 로비 화면 확인. 기존20/9 suite 재검0. 중복 소스/TypeDB 캐시 실패도 보존. [이번 결과](../UNITY_MAC_LOBBY_COPY_20261025.md). **NEXT/ACTIVE:** 같은 Mac 담당이 NativeLobby 언어 표시/29자막·ko/en메뉴 구분을 연결한다. 지원 담당은 별도 산출물 경로의 순수 locale alias resolver만 소유하며 공유 INDEX/GPU/빌드는 수정하지 않는다. 영상/offset/전투/저장/자동화 변경0.


## 2026-10-25 Mac 시네마틱 조작 — 최신

재생중일시정지버튼을연결하고 별도controls fixture에서 pause/resume·focus복귀9/9PASS. 최초8/9실패는기존fixture강제focus복구간섭으로분리수정했으며기본클라이언트재생코드는보존. Mac일반build0오류/실제라벨2PNG확인. OS직접입력/최신영상승인/전체디자인미인수. 다음은로비개발문구·조작안내정리. unity자동화현재상태는TOML부재로재확인불가,중복생성0. [변경·실측·경계](../UNITY_MAC_LOBBY_CONTROLS_20261025.md).


## 2026-10-25 Mac 로비·인트로 실제 재생 — 현행

동일 일반앱의 첫 실행은 Metal 표시 대기/101초 무진행으로 실패 기록했다. 단일스레드 비교와 기본옵션 재검수는 각각20/20PASS,113초 자연끝·2718frame·5영상/자막/음성/BGM/로비전환·replay/holdskip 모델경로 확인. 기본옵션도 성공해렌더링설정 영구변경0, 최초멈춤원인 미확정. 런타임/영상교체0. 다음단위는 pause/resume·focus 복귀와 조작UI 원본대조/짧은실제검수. [결과·경계·다음행동](../UNITY_MAC_LOBBY_20261025.md).


## 2026-10-24 Mac 원본 재감사·중앙 HUD 재설계 — 현행

후속결과: Mac6000.6.7f1격리 compile/verify 및ARM64일반build오류0. HUD3×6·인벤3×10자동검사PASS,실제18PNG/3해상도. 마지막HUD키보정도재빌드·실화면확인. CUA직접mouse좌표불일치로클릭/드래그인수미완료,전체디자인승인미완료. [화면·검수](../UNITY_UI_COMPOSITION_20261024.md#실제-mac-검수-결과).

v22b 최신 승인 주장을 철회하고 원본 비교를 마쳤다. ROOT v15/main v17/Unity v22b selector 차이,30개 복사본 SHA 일치,27개 source ROOT/main blob 일치를 확인했으나 최신 승인본은 미확인이다. 영상 교체0. 사용자 최신 디아블로식 방향에 따라 중앙 약1040px HUD,640px 장비/600px 가방·상세와 중앙시야를 설계·구현 중이다. 이전 도킹 PASS는 당시 좁은 범위의 이력이다. [원본 감사](../UNITY_SOURCE_BASELINE_20261024.md), [현행 설계·검수](../UNITY_UI_COMPOSITION_20261024.md). PC 개발/세이브/맵/전투 확장0.

Hub는 사용자가 로그인하고6000.6.7f1 설치를 시작한 화면을 확인했다. 기존6000.4.8f1 프로젝트 버전은 보존하며 Editor 설치 완료 후 별도 검수본에서 확인한다. 이전 약관 대기 기록을 현재 미해결 상태로 반복하지 않는다.

## 2026-10-24 Mac Unity 인수 — 최신

사용자 “이제 맥에서 다 해라”의 PC 인계를 받아 Mac Codex가 `codex/unity-mac-20261024` / `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`에서 인수했다. 원격 `ffa85d62`/tree6068a62 대조, v22b byte-exact 복구 완료. 현재 소유 변경은 Editor 빌드 타깃·출력과 관련 docs뿐이며 기존 런타임은 그대로다. Hub 약관 확인·로그인/라이선스가 선행조건이고 Mac Editor/Player 인수는 미완료다. PC 개발·과거 팀 재가동0. 아래 ACTIVE 표기는 과거 PC 이력이며 최신 인계의 PC heartbeat PAUSED가 우선한다. [실제 인수·다음 행동](../UNITY_MAC_TAKEOVER_20261024.md).

## 2026-10-24 UNITY-LOBBY-01 — 로비·인트로 최우선

사용자 최신 “일단 게임 로비부터 인트로 시네마틱같은것들만 잘 옴겨”. PC Codex가 기존 소유 Unity 브랜치에서 NativeLobby/Video/CoreLobbyFlow·NativeGame 진입/차단·원본 미디어·자기 Tools/docs 소유. G:index 흐름 + 사용자 최신 v22b override 기준 FDG→타이틀→ENTER문→세계관→로비 연결, Core65/영상adapter13·정적0오류/실제Editor 미디어29×32검사PASS. Windows/Player 영상·음향·화면 검수는 진행 중. 계정/캐릭터 생성/기존 저장은 미이식 표시, Godot/원본/공유main INDEX480·세이브·기존창 보존. 자동 heartbeat도 로비/인트로 우선으로 갱신했다. [현황·근거·미완료](../UNITY_LOBBY_20261024.md).

## 2026-10-24 최신 우선순위 — UI/UX 이식 후 Unity 재제작

사용자가 UI/UX와 재사용할 기존 아트·데이터를 먼저 제대로 이식하고, 이후 Unity에서 맵·모션·이펙트 등을 대부분 새로 제작할 방향을 확정했다. 직전 자동 진행의 드랍 생성/획득 최우선은 교체한다. 다음 단위는 원본↔Unity UI/UX 미완료 현황표와 가장 중요한 미이식 화면/상호작용이며, UI 실제 동작에 필요한 최소 기반만 함께 연결한다. 기존 전투·표현·Godot본은 보존한다. 기존 heartbeat exoduser-unity도 새 방향으로 갱신했으며 ACTIVE/10분 간격을 유지한다. [현재 작업 범위](../UNITY_UI_FIRST_REBUILD_20261024.md)가 아래 과거 전체 이식/비교 기록에 우선한다.

## 2026-10-24 UNITY-INVENTORY-01 — 시작 장비·가방 화면

PC Codex / codex/unity-port-20261024 / 새 Inventory core·NativeInventory·Simulation adapter·원본 이미지 복사·자기 Tools/docs 소유. 원본 장착15/마법가방10/20어픽스 보존,909검사 및 기존93/7/26/130/36회귀 통과. 화면/Tab/장착·해제·정리/drag/no-heal 연결. 실제Editor JSON null 오류 수정 후PASS, Windows build0오류·Player inventory10/10·전투6/6(4처치/8소리) 및 PNG3장/release확인. tracked18파일복구909/909와core compile0도확인. VISUAL RETOUCH/수동입력·조건부 전투효과·저장·드랍생성/전체이식 미완료. Godot/웹/공유main INDEX480·사용자 세이브 보존. [상태와 한계](../UNITY_INVENTORY_20261024.md).

## 2026-10-24 UNITY-HUD-01 — 원본 자원 표시

PC Codex / codex/unity-port-20261024 / NativeHud·HudValues·shader·원본 아이콘/폰트 복사·자기 Tools/docs 소유. Model130/130·기존93/7/26·기본맵36/36·정적0오류. I: 독립 실제Editor/GPU3상태·Windows build0오류·HUD Player6/6·전투회귀6/6(4처치/소리8회),PNG3상태+release 픽셀검토까지 확인했다. Git tracked20파일만 복원한HUD130/130도통과했다. VISUAL RETOUCH 유지. CSS 전체 filter/전체 HUD·미구현 스킬을 추가한 것으로 확대하지 않는다. Godot/웹/공용main/INDEX480·기존창 보존. [상태·검수](../UNITY_HUD_20261024.md).

## 2026-10-24 UNITY-FEEDBACK-01 — 기검참 명중광·원음

PC Codex / codex/unity-port-20261024 / unity Runtime·Editor·Tools·원본 미디어 복사·관련 docs만 소유. Core26/26·기존93/7/36·정적 컴파일0오류 및 실제 Editor/import/frame sequence·Windows build(errors0)를 통과했다. I: 독립 복사본의 실제 Player에서4처치·음향8회재생/출력peak.30688885·명중광4/완충광1·PNG5종을 확인했다. 전체 시각은 RETOUCH, 수동 플레이·EQ/compressor·고FPS clock·전체 이식은 남아 있다. Godot와 열린 Editor·공용 main INDEX480경로는 보존한다. [상태·미완료·검수](../UNITY_FEEDBACK_20261024.md).

## 2026-10-24 사용자 지시 — UNITY-PORT-01

최우선 방향 정정: “고도는 남겨두고 유니티도 해보는거야 뭐가 더 쉽나”. Godot를 유지하고 Unity도 시험해 같은 범위의 구현·수정/회귀·원본 재현·실행 안정성을 비교한다. 최종 엔진은 미확정이다. 이 아래 초기 ‘Unity 전환’ 표현은 확정 결정으로 읽지 않는다.

최신 실행 경계: 초기 license 종료198은 해소됐다. 실제 Editor 검사와 Windows build(Succeeded/errors0)를 통과했고 실제 Player 자동이동 X4020→4101.58496·120f차지/해제·4처치·PNG4종을 확인했다. VISUAL RETOUCH(시작구간). 현재 새 시작 메뉴 창을 열어두었다. 첫 Cubemap오인 import는 Texture2D 명시/GetVersion1로 수정했다. 아래 초기 “license 차단” 문장은 이전 기록이다. 전체 게임/수동 플레이 인수는 별도다.

추가 지시 “고도본도 저장해두고 유니티도 한번 해봐”: Godot4,979파일/2,071,696,605bytes를 I: 별도 보존본으로 복사하고 전 파일 SHA256 및 증분 Git 번들을 검증했다. Unity 기본 스킬을 기검참으로 연결하고1·2타/3타 홀드·40/80/120f 차지·검기 관통/벽/LOS·적 포이즈 및 원본 실버 시트/잉크/잔상 표현을 추가했다. 초기 라이선스 차단 뒤 실제 Editor/build/Player를 확인했으며, 초기 기본 무기 검증과 기검참 대조 기록은 [현재 보고서](../UNITY_PORT_20261024.md)에서 구분한다. 후속 명중광·차지 섬광·원음5개는 UNITY-FEEDBACK-01로 연결한다. 원본 hitstop은 소비 직전0으로 비활성화한다.

Unity 비교 시험 담당은 PC Codex / `codex/unity-port-20261024` / 기존 소유 worktree의 `unity/`와 관련 docs다. Godot 원격 `7d67c4182`·공용 main/INDEX/WIP·사용자 세이브를 보존한다. 초기 독립 모델 검사와 license 종료198 뒤 실제 Editor/Windows Player 검사까지 진행한 경계는 [현재 상태·범위·다음 검수](../UNITY_PORT_20261024.md)를 따른다. 이전 Godot 통계는 Unity 진척률이나 난이도 비교 결과가 아니다.

## 2026-10-23 PC Codex 인수 — PORT-TAKEOVER-01

2026-10-24 후속 `PORT-TAKEOVER-03`: 같은 PC Codex가 G17 모체 산란의 `SFX.magic(3)` 중 원본 `fire_magic1` 샘플 레이어를 연결했다. Main의 G 전용 sample 진입·G sfx 분기·기존 runtime 검사·원본 MP3 1개·관련 docs 범위. **격리 기술 검수 후보**: WASAPI 집중122/0·G204/0(실제 모체 caller2회)·sound45/0·ERROR0. 돌진/그로기·마법 합성 DSP는 실제 출력 adapter 부재로 미이식 유지하며 다른 소리로 대체하지 않는다. 원본 모체 AI/자식 생성·피해·Q/E·저장·맵 및 공용 main 무수정. [보고서](reports/PORT-TAKEOVER-03_REPORT.md), 최종 SHA/근거 `I:/EXODUSER-Storage/qa/port-magic-20261024/DONE.json`.

2026-10-24 사용자 지시 "이식작업 여기서 계속하자"로 같은 인수 브랜치에서 재개했다. `PORT-TAKEOVER-02`는 G 이동음 7원본 MP3, Main의 공용 sample queue 진입 함수, G `play_sample`, 기존 G runtime 검사 및 sound40의 AUDIO-01 기대 경로 정정과 관련 docs만 소유한다. **격리 구현·기술 검수 후보**: G190/0·sound45/0·shield166/0·kill47/0, WASAPI 이동음107/0·실제 노드5·ERROR0. 연속47h는11PASS/7NOT_READY이며 전체 이식/자연 보스 완료가 아니다. 기존 actor/전투/맵/저장 owner와 타 팀 WIP는 보존한다. [검수·실패·미완료](reports/PORT-TAKEOVER-02_REPORT.md), 최종 원격 SHA 등 외부 근거 `I:/EXODUSER-Storage/qa/port-resume-20261024/DONE.json`.

사용자 직접 지시: "이식작업 니가 이어받아서 계속해 토큰세이브 MD나 다 보고". PC Codex가 이전 PC Claude의 중단 작업을 인수한다. 기존 PC/Mac 작업자를 자동 재가동하지 않고, 공용 main의 INDEX/WORK와 원 작업자의 WIP는 보존한다.

| 작업ID | 담당 / 브랜치 | 소유 범위 | 상태 |
|---|---|---|---|
| PORT-TAKEOVER-01 / PC-ENEMY-ACTORS | PC Codex / `codex/port-takeover-20261023` / `E:/exoduser-wt/codex-port-takeover-20261023` | G actor/kernel/spawn/decor 신규 4파일, 원 PC WIP의 factory/Main/E spawn/death FX/natural base/stage adapter/Player의 명시 7구역, G 전용 테스트·오라클, 자기 보고서와 현재 인계 문맥 | **격리 기술 검수·백업 후보 / VISUAL RETOUCH**. 최신 Mac 코드 `9734e2e79` 위에 보존 WIP를 3way 적용, 충돌0. 최종 GUI148/0·직접 회귀4종0실패·ERROR0. 원 폴더 무수정. 자연 플레이·웹1x·사운드 미완료 및 최종 제출 SHA는 [보고서](reports/PORT-TAKEOVER-01_REPORT.md)/외부 DONE.json 참조 |

기존 context pack 15종을 모두 읽었으며, 그 안의 10월20~21일 구현 현황은 당시 snapshot이다. 최신 계보는 17d → ENEMY-VIS → SWEEP-B2/B3 → E2E-TAIL-02 → G04-02이다. SWEEP-B4 문서-only 보류를 구현 완료로 올리지 않는다. 코드 main 병합·기존 사용자 실행판 교체·Steam 배포는 이번 후보 검수와 별개다.

> 이 문서가 **지금 누가 무엇을 하는지의 유일한 기준**이다. 새 작업을 시작하거나 끝낼 때 양쪽 총괄 모두 이 표를 먼저 읽고 갱신한다(경로 지정 커밋, 문서만 main 직접 push 허용).
> 상위 계획: [FDG_GAME_DEVELOPMENT_PLAN.md](../FDG_GAME_DEVELOPMENT_PLAN.md) · 사용자용 현황: [FDG_GODOT_PORT_STATUS.md](../FDG_GODOT_PORT_STATUS.md) · Mac 지시서: [MAC_ORDERS_20261020.md](MAC_ORDERS_20261020.md)

> **2026-10-20 저녁 사용자 지시로 역할 전환**: "자동작업은 이제 맥북만 24시간 켜둘꺼니까 거기서 하는거야", "너는 가끔 PC에서 잘 구동돼나 테스트정도만 하면됄듯".
> - 작업 배정·검수·**main 병합 = 맥북총괄(Mac Claude)**. 아래 공통 규칙 1의 "Claude 총괄"은 이제 맥북총괄을 뜻한다. 병합 전 검수 기준은 그대로다(원본 행 대조, 병합본 위 독립 재실행, 회귀 목록, 정확한 경로 스테이징, force 금지).
> - PC Claude = **PC(Windows) 구동 테스트 담당**. 가끔 main을 PC Godot 4.7.2로 돌려 회귀와 실창 동작을 확인하고, 결함은 이 표에 행으로 올린다. PC에서는 새 자동 작업을 배정하지 않는다.
> - PC VS Code Codex에서 이미 돌고 있던 P2-006b·P2-008b(+P2-008a-FIX 우선)·P2-009a는 PC가 켜져 있는 동안 계속 진행한다. 결과 브랜치는 맥북총괄이 검수한다. PC가 꺼져 멈추면 Mac이 인수한다.

> **2026-10-20 사용자 운영 원칙(확정)**: "PC는 수동작업 전용이고 맥은 자동전용", "총괄은 클로드 코딩작업은 코덱스". → 자동으로 도는 구현·추적은 Mac Codex, 배정·검수는 Claude(Mac 맥북총괄 = 자동 트랙, PC Claude = 사용자가 직접 시키는 수동 작업). PC Codex 신규 자동 배정 없음.

> **2026-10-20 사용자 지시 "대기 중인 검수 건은 PC에서 병합해. 병합본 테스트 재실행 후 main에 넣어."** → PC Claude가 11+1건 병합(3f73456fa~2826b6738). 최종 main 기본 회귀 18종 중 17 PASS, p1002g 1실패(P2-008a-FIX 대기).

## DEMO11-24b · 2026-10-21 Mac 후속

- 동일 브랜치 인수5a3af410에서 이어감. 306id 분류=게임14/PC50/드랍0인id0/소비 미확인242. 기존 게임 시스템 owner13id를 값 캐시로 연결, 신규131/0·원문13사례 일치·직접 회귀6종 각1회4167/0·최종ERROR/누수/잔류0. 실제 intro 뒤 회복 identity 인계는1회·owner/clock guard 유지. Main+23/-3/State0/보호·저장0. 수동 퀵슬롯 potionCdRed1id 및 원본 소비 미확인242개는 미완료로 남기고 PC50+기존72/혼합 부분은 pc-iface-pack 인계. [후속 보고서](reports/demo11-24b_REPORT.md) 및 `_out/demo11-24b/`.

## DEMO11-24 · 2026-10-21 Mac 단위

- 담당: 이 Mac Codex 창. main0138c5bb + 22r d276e02e 정상merge 기준. 데모 affix 후보398레코드/396id 전수·원본 롤 빈도 표 작성, 기존 PC 재계산 소비18id 실제 Main 검증639/0·원문18사례360필드 불일치0. hurtE72id·기타306id 및 native 데모금지필터 차이는 미완료 인계. Main/State/보호/저장0줄, 장착 receipt 관찰 +1줄. 직접 회귀2종 각1회735/0·ERROR/누수/잔류0. 제출은 [보고서](reports/demo11-24_REPORT.md) 및 `_out/demo11-24/`에 기록한다.

## DEMO11-22r · 2026-10-21 Mac 단위

- 담당: 이 Mac Codex 창. 최종 main `0138c5bb` 정상merge `da098350`, PC runtime `a28117c1`/드랍 종료수정`72e602d1` 포함. 실제 INV17슬롯 장착/해제·PC equipment refresh·rollback·DEMO11-27 이전 continuation 기능 검증 완료: 신규442/0·직접회귀2614/0·ERROR/누수/잔류0. 전투 핵심/피해식/저장/UI owner 변경 없음. 제출 근거는 [단위 보고서](reports/demo11-22r_REPORT.md)와 외부 `_out/demo11-22r/`.

## DEMO11-23 · Mac BLOCKED

- main0138c5bb+22r d276e02e. SV-SHARED는 계산 전용이며 actual STORAGE owner/입출고 부재. 제품0줄·계산회귀149486/0·실제 UI/IO 미검수. [필요 인수](reports/demo11-23_REPORT.md).

## DEMO11-23b · 실제 공유창고/가방 UI 검수 대기

- 기존06c State/IO·22r 장착을 단일 owner로 재사용. main0138+완료06c93f 정상merge fb76706(미병합 의존 명시). 신규1286/0·집중10/0·직접회귀150073/0·3캡처 준비, 전투0/번역CRLF 보존. [보고서](reports/demo11-23b_REPORT.md).

## 역할 (2026-10-20 사용자 지시 기준)
| 역할 | 누구 | 하는 일 |
|---|---|---|
| Claude 총괄 | PC Claude 세션 "Godot PC/Mac 이식 작업 지침" | 작업 배정·검수(원본 행·테스트 독립 재실행·화면 1x 확인)·main 병합·계획/현황 문서 |
| Codex 총괄 | Mac Codex(ROOT/ENGINE) | Mac 쪽 Codex 작업 배정·진행 관측·Mac 실행 인수, 이 표 갱신 |
| 맥북총괄 | Mac Claude 세션 | Mac 검증(실창 플레이·녹화), Codex 터미널 진행 관측·SHA 보고 |
| 실행 원칙 | 사용자 | "맥북으로 거의다", "단순업무는 코덱스", "토큰도 다 쓰고 환경도 다 쓰고" |

## 공통 규칙
1. **main 병합은 Claude 총괄만**(검수 후). 다른 모두는 자기 브랜치(`codex/…`, `claude/…`)에 커밋·push만.
2. 작업 시작 전 아래 "진행 중" 표에 행 추가 + **소유 파일** 기재. 다른 행의 소유 파일은 수정 금지(필요하면 그 담당에게 요청 또는 보고서에 기재).
3. 작업 끝 = 보고서(`docs/engine/orders/reports/<작업ID>_REPORT.md`, 자기 브랜치) + 이 표의 상태를 "검수 대기"로 + 브랜치명·SHA 기재.
4. 원본 행 근거·수치 무조정·가짜 PASS 금지·원본 에셋 바이트 복사·격리 사용자 폴더·2_3/Q·E/세이브 불변 — 계획 문서 규칙 그대로.
5. 같은 일을 두 곳에서 하지 않는다. 비어 보이면 표를 먼저 확인.

## 진행 중 (2026-10-20 갱신: Claude 총괄)

DEMO11-44: Mac Codex / `codex/demo11-44-20261021` / NativePets·catalog/generator·Main357 추가1줄·자기 tests/docs. 기존9 ID 추가69/102, 신규75/0·Node10/0. 제품 피해·회복/State writer 변경0, 자연 전투·시각 미확인. [보고서](reports/demo11-44_REPORT.md).

| 작업ID | 내용 | 담당·환경 | 브랜치 | 소유 파일(다른 담당 수정 금지) | 상태 |
|---|---|---|---|---|---|
| DEMO11-32 | 화마귀 family tick·탄·사망·aggro 소비자 | Mac Codex | codex/demo11-32-20261021 | 신규 FD전용2파일·Main342/3058–3064·State1589–1594·자기 테스트/docs | **부분 구현·통합 BLOCKED** — source18사례/초기8·실제35 작은탄 검증. 큰탄 specialized/PC contact·hit/실제clock·MAP11 Marker 미인수, 31과 통합 후보 기록. 신규906/0·예산2/0·기존51/0(총959/0), 최종 수치는 [보고서](reports/demo11-32_REPORT.md), 보호/35/맵0줄 |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |

| DEMO11-38 | stageClear 다음→demoEnd·위시리스트/데모 로비 | Mac Codex | codex/demo11-38-20261021 | Main/State 종료 접점·native_demo_end_*·native_demo_lobby·새 scene/test·자기 docs | **시각 PASS·반송 merge 검수 대기** — 최초183/0·반송38/17/PC refresh439/0, 예상 거부ERROR1 외0. stage1 생성0/중복 clear 거부·실제 Tree pause/구 Main 해제. 1920×1080+1x crop, DEMO11-37 신호 직접 주입(사망 연동未). Main+20/State+15, 최종SHA는 _out/demo11-38/DONE.txt |


| DEMO11-09 | 데모 일시정지·입력 프로필·설정 인계 | Mac Codex | codex/demo11-09-20261021 | Main pause 접점·native_demo_pause_menu·신규 test·자기 docs | **일부 화면 자료 준비 / 설정 BLOCKED** — pause·back·resume/기존 BINDS 안내153/0 각1회. S01 missing3/S10 부재·설정writer미인수, Main+10/-0·State/전투0. 전체완료아님, 캡처 _out/demo11-09/captures/, 최종SHA는DONE |


| DEMO11-19ui | 성장 별자리·투자/환불 계획·예약 UI | Mac Codex | codex/demo11-19ui-20261021 | native_growth_panel·추출 data/SVG/tool·신규 test·Main 설치6줄·자기 docs | **검수 대기** — 19r0c136318 merge·기능/관련709/0·최종 렌더12/0·전체2장/1x4장, 사용자 눈 검수 대기. 보고서 demo11-19ui_REPORT.md |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-19r | 실제 성장 투자/리셋/예약→PC refresh·XP 순서 | Mac Codex | codex/demo11-19r-20261021 | State 성장/XP 접점·Main event API·native_demo_growth_owner·신규test/oracle·자기docs | **기술 검수 대기** — 신규383/0(원문24)+기존6suite2827/0=3210/0. 실제PC거부복구2·XP순서, main에PC a28117c1 포함. HUD최소표시/full UI·저장IO未, 최종SHA는 _out/demo11-19r/DONE |

| DEMO11-09 | 데모 일시정지·입력 프로필·설정 인계 | Mac Codex | codex/demo11-09-20261021 | Main pause 접점·native_demo_pause_menu·신규 test·자기 docs | **일부 화면 자료 준비 / 설정 BLOCKED** — pause·back·resume/기존 BINDS 안내153/0 각1회. S01 missing3/S10 부재·설정writer미인수, Main+10/-0·State/전투0. 전체완료아님, 캡처 _out/demo11-09/captures/, 최종SHA는DONE |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| DEMO11-perf-enemy | 30/60 적 fixed-tick·상위10 profile·Mac 최적화 | Mac Codex | codex/demo11-perf-enemy-20261021 | World3206–3241 기하 질의·Flesh249–256 분리·신규test/tools/docs | 진단 제출: 동치+관련8825/0, native CPU 평균9.58%/10.31% 감소. 전체30개체 최대18.975/20.652ms로8.333ms 목표 미달, PC권위 OLD/NEW·동시Godot 한계 기록. [보고서](reports/demo11-perf-enemy_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |

| MAP11-PROD / DEMO11-45 | Main 실제 MAP11 provider·gate·상자 소비 | Mac Codex | codex/map11-prod-20261021 | Main/World map-only 접점·State transport/상자·신규 어댑터/테스트·자기 docs | **검수 대기 / 상자 PC 완료 대기** — Main37/0·상자26/0·관련170/0·map계약1case, 실제 provider/Marker 연결. [보고서](reports/map11-prod_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-20 | 실제 State addExp META-06 cap100·회복/표시/저장 인계 | Mac Codex | codex/demo11-20-20261021 | native_source_new_run_state.gd의 addExp 구역·신규 테스트/oracle·자기 docs | **검수 대기** — State cap100 실제연결·회복/표시/저장 인계, 신규214/0+관련1099/0=1313/0 각1회. State+62/−8·피해/Main/맵0줄, 저장IO未·collectorHOLD. 후속 aa1eaea5a merge·목록API0·자기코드추가수정0·관련4suite 각1회1313/0. 최종SHA는 원로그 DONE.txt |




| DEMO11-33 | 곰치4개체·Marker/실tick/물기/HP사망·aggro 인계 | Mac Codex | codex/demo11-33-20261021 | native_demo11_worm*·Main 설치/API·31 registry 보조field접점·새 tests/원본시트·자기 docs | **구현·검증 완료/통합 인수 대기** — main0138c5bb9+31/76bcae8d merge50f31d37. 기능9,339/0·벤치265/0 max2.460ms. MAP Marker/PC producer·자연전투 후행,32/보호경로0·helper 통합 제안만. [보고](reports/demo11-33_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |
| DEMO11-31 | 1-1 앵글러 family·Marker/기상/실탄/PC처치→지역 gate | Mac Codex | codex/demo11-31-20261021 | native_demo11_angler*·field energy carrier·35 registry field 접점·Main 설치/API·새 tests/원문asset·자기 docs | **검수 대기** — main45be76e4+37/05f41cc7 merge8992ef35. 기능1613/0+bench263/0 cleanPASS(max4.649ms), Main+6·registry+31/−4, State/World/PC 피해/패링·지형0. 실제Marker/PC producer·전용연출 후행. 최종SHA는 _out/demo11-31/DONE.txt |

| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | Main3069–3076·신규selected0 consumer·자기 테스트/docs | **부분 구현·통합 BLOCKED** —43 9b763da9 ff merge, selected0 기존 P3→실제World→43 origin. 1/4 자연등록·5/6 AI·PC 보호owner·source scheduler 미완, 5종벤치0(미충족). 신규48/0+관련338/0, P3 ObjectDB8 경고보존. [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-etype-d | 자연 D18/19/23/24/25 실제 등록·전투 경계 | Mac Codex | codex/demo11-etype-d-20261021 | factory EOF18·Main EOF7·registry D추가30·native_demo11_etype_d_*·신규tests·자기docs | **재개 검수 대기** — 기존9627cf75 위5종실등록,신규158/0·관련83/0+factory3그룹/0·최종벤치14/0 max4.252ms.25death/PC이동탄contact·자동29종selector후행,보호0·A/B/C통합후보. [보고](reports/demo11-etype-d_REPORT.md) |
| DEMO11-etype-a | 51/52/54/55/56 자연 etype0·1·4·5·6 | Mac Codex | codex/demo11-etype-a-20261021 | factory680–688 append9·기존Main3069–3076·자기consumer/test/docs | 승인 재개: 실제5종 등록/phase/탄/PC접촉/사망1952/0·경계48/0. source scheduler/PC type6 보호owner 미완, 120Hz240틱 벽시계5.312초(지속120fps 미달). [보고서](reports/demo11-etype-a_REPORT.md) |
| DEMO11-21fix | pending draw의 Main/State 해제 수명 보호 | Mac Codex | codex/demo11-21-20261021 | native_world_drops·신규 수명 테스트·자기 docs | **검수 대기** — mainac3764bfe 정상merge, 수명9/0·starter148/0·관련드랍60/0. ERROR/ObjectDB/resource0, Main/State/전투0줄. [보고서](reports/demo11-21fix_REPORT.md) |
| DEMO11-21 | P2-006a/b 기존 제품 journal→실제 INV 자연 연결 | Mac Codex | codex/demo11-21-20261021 | Main252–257·State432/565–566/584–659 기존 추가분, 새 통합 테스트 | **검수 대기** — P2 수락 원격48f0d8e7/e69fe444 정상 merge·표시 byte 재사용, 신규24/0·관련회귀36/0. 보호 전투·맵·저장0. [보고서](reports/demo11-21_REPORT.md) |

| DEMO11-37 | P3 지역/앵글러 gate→Marker arena→PC 최종 사망→보상/기록/종료 인계 | Mac Codex | codex/demo11-37-20261021 | native_demo11_encounter/clear_result·Main 설치/API·State progression/reward·새 tests·자기 docs | **검수 대기** — mainac3764bf+35/38 정상merge=e7d855b6. 기능410/0+bench1회260/0 cleanPASS(max1.512ms), Main+14/State新32+既1줄수정. PC 사망/전투·맵0줄, provider접촉/PC最終producer 후행. 최종SHA는 _out/demo11-37/DONE.txt |
| DEMO11-20 | 실제 State addExp META-06 cap100·회복/표시/저장 인계 | Mac Codex | codex/demo11-20-20261021 | native_source_new_run_state.gd의 addExp 구역·신규 테스트/oracle·자기 docs | **검수 대기** — State cap100 실제연결·회복/표시/저장 인계, 신규214/0+관련1099/0=1313/0 각1회. State+62/−8·피해/Main/맵0줄, 저장IO未·collectorHOLD. 후속 aa1eaea5a merge·목록API0·자기코드추가수정0·관련4suite 각1회1313/0. 최종SHA는 원로그 DONE.txt |
| DEMO11-38 | stageClear 다음→demoEnd·위시리스트/데모 로비 | Mac Codex | codex/demo11-38-20261021 | Main/State 종료 접점·native_demo_end_*·native_demo_lobby·새 scene/test·자기 docs | **화면 비교 자료 준비·검수 대기** — 183/0, 예상 거부ERROR1 외0. stage1 생성0/중복 clear 거부·실제 Tree pause/구 Main 해제. 1920×1080+1x crop, DEMO11-37 신호 직접 주입(사망 연동未). Main+20/State+15, 최종SHA는 _out/demo11-38/DONE.txt |
| p2001i-diag | p2001i 종료 ERROR·ObjectDB/리소스 수명 진단 | Mac Codex | codex/p2001i-diag-20261020 | 자기 보고서·CHANGELOG·작업판 자기 행만(제품/기존 테스트0) | **검수 대기** — main6d987cb8 원문6종377/0·종료 ERROR/누수0, I 원문3회18/0. 외부 대기제거 대조에서 음성 MP3/Playback2객체·리소스1 ID일치 재현, 하니스 조기quit 판정. 보고서·최종SHA는 원로그 DONE.txt |
| DOC-SYNC | 오늘 통합분 원본 수치·설계 docs 동기화 감사 | PC Codex | codex/doc-sync-pc-20261020 | DOC-SYNC_REPORT.md 및 설계 문서10개 정정 구역(2_3 제외) | **검수 완료·main 병합(Claude 총괄)** — 설계 문서 10종 원본 기준 정정, 코드 무변경. 2_4는 P2-004b와 충돌 → 상세 문장 유지+정정 주석 |
| P2-001l | 패링 연습 단계 0~7·입력 제한(allows) | PC heavy 담당 | claude/p2-001l-lesson-steps-20261020 | native_parry_lesson_flow.gd 등 레슨 파일, player.gd·main.gd 입력 처리 함수 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 병합본 독립 재실행 9종 0실패(L·K·H·J·QE·5c·HUD·지역·시작스킬), 화면 RETOUCH·step1~7·챕터2 미이식 |
| P2-006a | 드랍 바닥 표시·줍기·인벤 반입 | PC heavy 담당 — **Claude 사용 한도로 중단**(작업 폴더 G:\exoduser-wt\p2-002a-hud에 진행분 보존) | claude/p2-006a-drop-pickup-20261020 | 드랍 렌더·줍기 신규 스크립트 | **기능 완료·main 병합 / 디자인 미검수(RETOUCH)** — 총괄 독립: world_drops 18/0·pickup_contract 17/0·HUD 36/0·시작 스킬 27/0. 원본 에셋 189개 해시 일치(Codex). 처치 직후 캡처에서 드랍이 피 효과에 가려 판독 불가 → P2-006b 화면 마감 | |
| TRACE-META | 3.2 메타·진행·14 밸런스 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-15cb(MAC-LIVE에서 전환) | codex/trace-meta-20261020 | FDG_SOURCE_TRACE_META_20261020.md | 검수 대기 — 30191be0d (맥북총괄 검수) |
| P2-006b | 드랍 화면 마감(피 효과 후 판독 캡처·라벨/빔 1x)·캡처의 LMB 슬롯 빈 칸 원인 확인 | PC VS Code Codex 4(P2-001l 후) | codex/p2-006b-pc-20261020 (`2c7342646`) | native_world_drops.gd 표시부·전용 검수 하니스 | 검수 대기 / RETOUCH — b933b2da5의 A 코드 누락을 이 브랜치에만 승인 제출본으로 보완. LMB는 A 하니스 weapon 강제 지정 원인(6/0), nearest 누락 RED1/1→GREEN1/0. 효과 카운트0 후 실제 좌표 1x·6등급 비교 완료, 밝기/그림자·OS 창 검수 미완. 상세 P2-006b_REPORT.md |
| P3-002 | 소환굴 시스템·후속 스폰·지역 처치 분모 | 클라우드 세션 cloud-spawnholes | claude/p3-002-spawn-holes | 소환굴 신규 스크립트, world 동적 등록 호출부 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 지역 초기화 순서 원본 31655 정정, 298/0·회귀 10종 0실패 |
| P2-007a | UI 마감: 원본 글꼴(나눔명조·Cinzel)·검기 색·인트로 가이드 패널 | 클라우드 세션 cloud-ui-polish | claude/p2-007a-ui-polish | assets/fonts, crescent.gd 색, 인트로 가이드 패널 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — PC(Windows) 병합본 p2007a 115/0(Malgun Gothic 실존 시 원본 CSS 3순위 체인으로 테스트 기대값 정정, 제품 무변경)·회귀 13종 0실패. p1002g 실패 1건은 main 선재(P2-008a 빙결전사 포이즈 경로)로 별도. 종료 resources 17 잔류 경고 |
| MAC-VERIFY | 최근 통합분 Mac 헤드리스 테스트 | Mac VS Code Codex 01a1586e-c1b7 | codex/mac-verify-20261020 (394c01388) | 없음 | **검수 완료·보고서 main 반영(Claude 총괄)** — 17종 실패 0, p1002e 검사 수 변동은 시작 장비 RNG(기지), stderr ERROR 3종은 QA-002 |
| QA-002 | 테스트 결정성(시작 장비 시드, 테스트 한정)·p2005b/c 종료 누수·p2003a dummy 텍스처 ERROR | Mac VS Code Codex 01a1586e-c1b7(맥북총괄 배정) | codex/qa-002-20261020 | 해당 테스트·(제품 결함 시 수정안만) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — 병합본 10종+contracts 재실행: 10종 0실패·stderr ERROR 0(p2005c/p2003a 누수 해소 확인), p1002g 1실패는 main 선재 P2-008a 포이즈 결함(동일 라벨) |
| P5-001a | Mac 실행판·macOS export 점검 | Mac VS Code Codex 01a1586f-09bf | codex/p5-001a-mac-20261020 (67d625aaa) | 없음 | **검수 완료·보고서 main 반영** — Mac 네이티브 실행 CONFIRMED, 화면 관찰은 Godot 앱 제어 권한 미승인으로 BLOCKED, macOS 프리셋·4.7.2 export 템플릿 없음 |
| MAC-LIVE | Mac 실창 첫 전투 녹화 | Mac Codex(trace-meta로 전환) | codex/mac-live-20261020 (8b727b15b) | 없음 | BLOCKED — Godot 앱 제어 미승인으로 게임 창 녹화 불가. 부팅 렌더(Movie Maker 30초) 정상, 엔진 FPS 평균 138·최저 45(36표본) |
| MAC-TESTSWEEP | MAC-VERIFY 외 godot/tests 32종 Mac 헤드리스 | Mac VS Code Codex 01a1586f-2389 | codex/mac-testsweep-20261020 (cd6055eed) | 없음 | **검수 완료·보고서 main 반영** — 29 통과·3 미통과: starter_state 148/1(P3-003 병합 회귀, PC 재현 — STARTER-REGIONS 수정 배정), type3_spawn_recipe(외부 oracle 누락), windows_native_package(Windows export 전제) |
| STARTER-REGIONS | starter_state G 필드 수 기대값을 원본 지역 초기화 기준으로 정정(또는 제품 결함 보고) | Mac VS Code Codex 01a1586f-2389 | codex/starter-regions-fix-20261020 | test_native_main_source_starter_state.gd, STARTER-REGIONS_REPORT.md, 이 행만 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — P3-002 `_totalSpawned`(30625) 키 1개 추가 반영, 148/0 |
| TRACE-INVENTORY | 2_7 인벤토리·장비 원본 전수 추적·이식 설계(문서만) | Mac VS Code Codex 01a1586f-09bf(18:32 착수) | codex/trace-inventory-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| TRACE-QUICKSLOT | 2_8 퀵슬롯·물약 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-5597(18:32 착수) | codex/trace-quickslot-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, 이식 단위 7개 |
| TRACE-SAVE | 15 세이브·데이터 원본 추적·이식 설계(세이브 형식은 보호 범위 표시만) | Mac VS Code Codex 01a158a5-5a79(18:32 착수) | codex/trace-save-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, SV-CONTRACT부터 이식 |
| TRACE-SETTINGS | 3.3 키바인딩·설정 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6274(18:32 착수) | codex/trace-settings-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만, S01~S10 이식 순서안 |
| TRACE-REVIVE-SHIELD | 2_5 부활·에너지쉴드 원본 추적·이식 설계(문서만) | Mac VS Code Codex 01a158a5-6b36(18:32 착수) | codex/trace-revive-shield-20261020 | docs/engine/FDG_SOURCE_TRACE_<시스템>_20261020.md 1개 | **main 병합(Claude 총괄 2026-10-20)** — 문서만 |
| QA-001 | 기존 실패 테스트 7종 원인 진단 | PC Codex(codex exec) | codex/qa-001-pc-20261020 | 지정 테스트 7종 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 실패 18건+스크립트 오류 1건 해소, 제품 코드 0줄, 총괄 독립 재실행 7종 0실패 |
| P3-001 | 맵 pit_poison 타원 충돌 계약 | PC Codex(codex exec) | codex/p3-001-pc-20261020 | engine/fdg/map-source-adapter.js, godot/data/map.json, 맵 계약 테스트 | **검수 완료·main 병합(Claude 총괄 대리 커밋 3081760c5)** — Godot 195/195·Node 10, 실창 미검증 |
| P2-004b | 펫 대사 카테고리 160여 종 | **PC Codex**(codex exec) | codex/p2-004b-pc-20261020 | native_pets.gd 대사 테이블 | **검수 완료·main 병합(Claude 총괄)** — 원문 171/0, 대사 822/0, 런타임 10/0, 펫 회귀 20/0, Node 1/1(총괄 독립). 선언 연결 60·데이터 전용 111, 자연 발화 전체·실화면 미검증 | |
| P3-003 | 지역 시스템 | Mac Codex ENGINE(채택) + PC 총괄 통합 | codex/p3-003-20261020 → main | native_regions.gd 등 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 42702 _regKill 연결 포함 |
| FEATURE-INVENTORY | 전체 기능 분모 표·이식 상태 판정 | **PC VS Code Codex 1**(P3-003 중복 배정을 중단하고 전환 — P3-003은 Mac ENGINE 단독) | codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md | **main 병합(Claude 총괄 2026-10-20)** — 1,061행 분모, 완료(격리) 6·실플레이 0 |
| SV-CONTRACT | 세이브 5경로 key set 계약 테스트(제품 무변경) | Mac Codex 창6 01a158a5-5a79 | codex/sv-contract-20261020 | tests/test_native_save_contract.gd(신규) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC Windows 병합본 3,023/0(실행 시 `-- --node-bin=C:/nvm4w/nodejs/node.exe` 필요: 기본 node shim 깨짐)·contracts·starter 0실패 |
| QS-01 | 퀵슬롯 1번 단위: 신규 계산 모듈+테스트(공용 0줄) | Mac Codex 창5 01a158a5-5597 | codex/qs-01-20261020 | 신규 모듈·테스트만 | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC 병합본 318/0, 원본 28072·35894 대조 일치, 재생 바인딩·p2005d 재생·contracts 0실패. 자동 물약 런타임 연결은 다음 단위 |
| SETTINGS-S01 | 설정 원본 default 읽기 전용 view(source_options_state.gd 무수정) | Mac Codex 창7 01a158a5-6274 | codex/settings-s01-20261020 | native_settings_read_view.gd·test(신규) | **main 병합(PC Claude 2026-10-20, 사용자 지시)** — PC 병합본 unit 112/0·actual_main 12/0(`-- --only=unit|actual_main` 필수), starter·HUD·contracts 0실패. OPT actual 35/누락 3(textScale·panelFit·diffV2) NOT_READY 유지 |
| TRACE-WEAPONS | 2_2 무기·활·속성 원본 추적(문서만) | Mac Codex 창4 01a1586f-2389 | codex/trace-weapons-20261020 | FDG_SOURCE_TRACE_WEAPONS 문서 | 진행 중 |
| TRACE-BOSS-CH1 | 8.1 1장 보스 무브셋·HP·패턴 추적(문서만) | Mac Codex 창8 01a158a5-6b36 | codex/trace-boss-ch1-20261020 | FDG_SOURCE_TRACE_BOSS_CH1 문서 | 진행 중 |
| TRACE-SKILLS | 2_1 스킬·합체 원본 추적(문서만) | Mac Codex 01a1589e-e914 | codex/trace-skills-20261020 | 추적 문서 1개 | 검수 대기 — 17255c3e9 (맥북총괄 검수) |
| TRACE-ITEMS | 7 아이템·어픽스 원본 추적(문서만) | Mac Codex 01a1589e-f8d5 | codex/trace-items-20261020 | 추적 문서 1개 | 검수 대기 — 33486451a (맥북총괄 검수) |
| P2-008a | 1-1 초기 미지원 적: etype20 빙결전사 exact 3개체(order4/10/12) | PC VS Code Codex | codex/p2-008a-ch1-enemies-pc-20261020 → main | enemy_melee_ch1_ice_warrior.gd·etype20 json·factory 등록 | **검수 완료·main 병합(Claude 총괄 2026-10-20)** — 원본 39057~39060 빈 근접 분기·40499 _meleeET 제외·31154 _noProjEtypes[20] 확인(무공격 = 원본 동작), 병합본 14종 0실패, 지원 9/미지원 7, 화면·실플레이 미 |
| TRACE-CH1-ENEMIES | 1장 미이식 적 원본 추적(문서만) — PC P2-008a 구현과 겹치지 않게 P2-008a 범위는 참고만 | Mac Codex 01a1589f-0218 | codex/trace-ch1-enemies-20261020 | 추적 문서 1개 | 진행 중 |
| QA-005 | Mac Codex 구현 단위 | Mac Codex | codex/qa-005-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| QA-006 | Mac Codex 구현 단위 | Mac Codex | codex/qa-006-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| META-04 | Mac Codex 구현 단위 | Mac Codex | codex/meta-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| META-05 | Mac Codex 구현 단위 | Mac Codex | codex/meta-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| DEMO11-35 | BC09 실제 탄 출생·registry·tick/expiry | Mac Codex | codex/demo11-35-20261021 | [보고서](reports/demo11-35_REPORT.md) | 일반 탄 연결 제출(main 미병합). 신규53/0·BC09 56664/0·기존일반탄4그룹/0. bench1회 tick최대1.049ms이나 draw오류256으로 전체PASS제외→색fallback draw6/0, 재벤치0. PC 접촉/특수 owner·자연clock 대기 |
| DEMO11-34 | stage0 보스 actor·AI assembler | Mac Codex | codex/demo11-34-20261021 | [보고서](reports/demo11-34_REPORT.md) | 구현·격리 검증 제출(main 미병합). 신규195/0·BC01~10 354093/0·권위22/0·intro18/0. Main +17/-0; 실제 자연전투는 source clock/prefix 및 PC 보호 owner 대기. PC 피해·패링·HP/poise·부활 소유자 및 source clock/prefix 명시 ack 필요  성능 후속 main8dbbf2b0(aa1eaea5a 포함) 정상merge·13파일 목록API0·자체제품변경0; 관련8종654/0 각1회, main 미병합 |
| DEMO11-01 | 1-1 데모 실행 권위 | Mac Codex | codex/demo11-01-20261021 | [보고서](reports/demo11-01_REPORT.md) | **main 병합(PC Claude 2026-10-21)** — 병합본 신규 22/0(의도된 거부 ERROR 1)·부팅 경로 회귀 11종 0실패 |
| META-06 | Mac Codex 구현 단위 | Mac Codex | codex/meta-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| IT-05 | Mac Codex 구현 단위 | Mac Codex | codex/it-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SK-S04 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SK-S05 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC04 | Mac Codex 구현 단위 | Mac Codex | codex/bc04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC05 | Mac Codex 구현 단위 | Mac Codex | codex/bc05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC06 | Mac Codex 구현 단위 | Mac Codex | codex/bc06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| BC07 | Mac Codex 구현 단위 | Mac Codex | codex/bc07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-05 | Mac Codex 구현 단위 | Mac Codex | codex/snd-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-06 | Mac Codex 구현 단위 | Mac Codex | codex/snd-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-07 | Mac Codex 구현 단위 | Mac Codex | codex/snd-07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SND-08 | Mac Codex 구현 단위 | Mac Codex | codex/snd-08-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-TRANSPORT-READ | Mac Codex 구현 단위 | Mac Codex | codex/sv-transport-read-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-PLAYER | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-player-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-ITEMS | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-items-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-SHARED-READ | Mac Codex 구현 단위 | Mac Codex | codex/sv-shared-read-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-RESTORE-FLOW | Mac Codex 구현 단위 | Mac Codex | codex/sv-restore-flow-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| SV-SAVE-PRIMITIVE | Mac Codex 구현 단위 | Mac Codex | codex/sv-save-primitive-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH1-03 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH1-04 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH2-01 | Mac Codex 구현 단위 | Mac Codex | codex/ch2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| CH2-02 | Mac Codex 구현 단위 | Mac Codex | codex/ch2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-01 | Mac Codex 구현 단위 | Mac Codex | codex/nw-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-02 | Mac Codex 구현 단위 | Mac Codex | codex/nw-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| NW-03 | Mac Codex 구현 단위 | Mac Codex | codex/nw-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| EC2-01 | Mac Codex 구현 단위 | Mac Codex | codex/ec2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| EC2-02 | Mac Codex 구현 단위 | Mac Codex | codex/ec2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 2차 일괄)** — 통합본 기본 회귀 20종 0실패, 신규 Godot 30종 중 21종 PC 통과. PC(Windows) 실패는 테스트 하니스 이식성 문제로 판정(QA-007): OS.execute 출력 첫 덩어리만 읽음(output[0]) · NW-02 node 경로 고정 · Node 심볼릭링크 전제 · Godot Windows 출력 인코딩 추정. 제품 코드 공용 변경 0 |
| QA-007 | 신규 테스트 Windows 이식성: OS.execute 출력 전체 결합·UTF-8 디코드(임시 파일 경유 권장), node 경로 인자 일관(NW-02 "node" 고정 제거), 심볼릭링크 검사 Windows 분기, slot_reader JSON.x·ch2_02 resource_manifest_pin 원인 확인 | Mac Codex(배정 요청) | codex/qa-007-20261020 | 해당 테스트만, 제품 0 | **main 병합(PC Claude 2026-10-20) — 부분 개선**: PC Windows에서 NW-01/02/03 통과로 전환(이전 209/137/283실패), 전송 검증 63/0, 이식성 Node 3/4. 잔여는 QA-007b. 제품 코드 0 |
| QA-007b | QA-007 Windows 잔여: ① SV 테스트 4종(inventory/player restore·shared_store_read·slot_reader)도 NW처럼 UTF-8 임시 파일 경유 — Windows OS.execute가 한글을 "???"로 깨뜨려 JSON 해석 실패 ② Node: Windows junction 경로가 심볼릭 거부보다 먼저 "Output inside source root" 검사에 걸림(qa007Portability·fdgCh1AreaSource 2·fdgCh2Stage4Source) — 거부 순서/메시지 기대값을 Windows에서 같은 의미로 ③ fdgCh1Stage1Source CLI 종료코드 1≠0 ④ fdgCh1Stage1World hand12·ch2_02 resource_manifest_pin(Mac 1실패 보존분과 동일 여부) | Mac Codex(배정 요청) | codex/qa-007b-20261020 | 테스트·도구만, 제품 0 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| BC2-03 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| BC2-04 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 4차)** — PC Windows: SV 4종·junction·Ch1Stage1Source·이식성 Node 11/0·전송 2종 통과로 전환, BC2-01~04 0실패, 기본 회귀 0실패. 잔여 2건(fdgCh1Stage1World "12 hands" 객체 불일치·ch2_02 resource_manifest_pin)은 Mac에서도 보존된 선재 결함 → CH-MAP-PIN으로 분리 |
| CH-MAP-PIN | 선재 결함 2건: fdgCh1Stage1World "latest main original full initMapObjects … 12 hands"(Node) · test_ch2_02 standalone_scene_ready resource_manifest_pin(Godot). Mac·PC 공통 재현. CH1-06이 보고한 "기존 맵 실패 9건"과 같은 뿌리인지 확인 후 수정 | Mac Codex(배정 요청) | codex/ch-map-pin-20261020 | 맵 소스 도구·테스트 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| CH-MAP-PIN-2 | fdgMapResourceProvenance(신규) PC 병합본 1/3: 기대 main 출처 SHA b25a018ac·manifest SHA를 git 이력에서 읽어 비교 → 병합 커밋 구성이 달라지면 다른 커밋(8524bbbb4)이 잡혀 실패. 병합 후에도 성립하는 출처 판정으로(커밋 SHA 대신 기록된 provenance JSON·원본 바이트 기준) | Mac Codex(배정 요청) | codex/ch-map-pin-2-20261020 | 테스트·도구만 | 배정 요청 — PC 원로그 G:/exoduser-wt/_out/merge-batch8/ |
| BC2-07 | Mac Codex 단위 | Mac Codex | codex/bc2-07-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| BC2-06 | Mac Codex 단위 | Mac Codex | codex/bc2-06-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| EC4-02 | Mac Codex 단위 | Mac Codex | codex/ec4-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 8차)** — 통합본 2장 보스 BC2-01~07·4장 적 2종·ch2_02(0실패로 복구)·Ch1Stage1World Node 5/0(복구)·기본 회귀 0실패 |
| BC3-01r | Mac Codex 단위 | Mac Codex | codex/bc3-01r-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC3-03 | Mac Codex 단위 | Mac Codex | codex/ec3-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC4-01 | Mac Codex 단위 | Mac Codex | codex/ec4-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 6차)** — 통합본 3장 보스 catalog·3장 적 3종·4장 적·2장 보스 5종·기본 회귀 4종 0실패, 경고 0 |
| EC3-02 | Mac Codex 단위 | Mac Codex | codex/ec3-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| BC2-05 | Mac Codex 단위 | Mac Codex | codex/bc2-05-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-BOSS-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-boss-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-MAPS-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-maps-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| TRACE-ENEMIES-CH4 | Mac Codex 단위 | Mac Codex | codex/trace-enemies-ch4-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| P2001I-DIAG | Mac Codex 단위 | Mac Codex | codex/p2001i-diag-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 5차)** — 통합본 3장 적 2종·2장 보스 BC2-01~05·기본 회귀 4종 0실패 |
| BC2-01 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC2-02 | Mac Codex 구현 단위 | Mac Codex | codex/bc2-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC-CHAIN-M | BC08→BC09→BC-INTEG-01→BC3-02 정상 merge·원본/회귀 | Mac Codex | codex/bc-integ-01-20261020 | 기존 보스 모듈 통합·bc-chain-m_REPORT.md | 03-bc-integ-01 검증 완료, 단계별 정상 push·원격 SHA는 DONE 참조 |
| BC-INTEG-01 | BC02 원본 ELC 색·BC08 장 catalog 일반화, CH1 기본 byte 보존 | Mac Codex(맥북총괄 직접 배정) | codex/bc-integ-01-20261020 | native_ch1_boss_spawn_contract.gd·native_ch1_boss_movement_states.gd, 신규 bc_integ_01 테스트/오라클·자기 보고서 | **검수 대기** — 신규 73394/0·BC01~10 354093/0·CH2 119182/0·contracts5/0, 기존 회귀 무수정·Main/State/저장0. SHA는 자기 보고서 원로그 DONE.txt |
| BC08 | Mac Codex 구현 단위 | Mac Codex | codex/bc08-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC09 | Mac Codex 구현 단위 | Mac Codex | codex/bc09-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| BC10 | Mac Codex 구현 단위 | Mac Codex | codex/bc10-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| EC3-01 | Mac Codex 구현 단위 | Mac Codex | codex/ec3-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| TRACE-BOSS-CH3 | Mac Codex 구현 단위 | Mac Codex | codex/trace-boss-ch3-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 3차)** — 통합본 보스 ch1/ch2 테스트·적 정책 3종·기본 회귀 9종 모두 0실패. 공용 변경 0 |
| LOOK-001 | Godot 룩 4안 비교 | Mac Codex | codex/look-001-20261020 | look001/ | **병합됨(MAP-LOOK 기반으로 8524bbbb4에 포함)** — 제품 경로는 MAP-LOOK이 대체 |
| QA-004 | Mac Codex 구현 단위 | Mac Codex | codex/qa-004-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| QA-003 | Mac Codex 구현 단위 | Mac Codex | codex/qa-003-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-01 | Mac Codex 구현 단위 | Mac Codex | codex/meta-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-02 | Mac Codex 구현 단위 | Mac Codex | codex/meta-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| META-03 | Mac Codex 구현 단위 | Mac Codex | codex/meta-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-02 | Mac Codex 구현 단위 | Mac Codex | codex/it-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-03 | Mac Codex 구현 단위 | Mac Codex | codex/it-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-04 | Mac Codex 구현 단위 | Mac Codex | codex/it-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SK-S02 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SK-S03 | Mac Codex 구현 단위 | Mac Codex | codex/sk-s03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| BC02 | Mac Codex 구현 단위 | Mac Codex | codex/bc02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| BC03 | Mac Codex 구현 단위 | Mac Codex | codex/bc03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-02 | Mac Codex 구현 단위 | Mac Codex | codex/snd-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-03 | Mac Codex 구현 단위 | Mac Codex | codex/snd-03-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-04 | Mac Codex 구현 단위 | Mac Codex | codex/snd-04-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TI-00 | Mac Codex 구현 단위 | Mac Codex | codex/ti-00-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TI-01 | Mac Codex 구현 단위 | Mac Codex | codex/ti-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| CH1-01 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-01-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| CH1-02 | Mac Codex 구현 단위 | Mac Codex | codex/ch1-02-20261020 | 보고서 참조 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| MAP-LOOK | 맵 표현 강화 1·2차(부분 광원·요철·접지 그림자·근경 원근·흔들림·빛줄기·지역 환경광·번개) — PoE2·No Rest 레퍼런스 | PC Claude 직접 | claude/map-look-20261020 → main | native_map_look.gd·map_look_*.gdshader·data/map_look_ch1.json | **main 병합(PC Claude 2026-10-20)** — test_map_look 16/0·회귀 13종 0실패(p1002g는 P2-008a-FIX 대기). 실게임 기본 ON·하니스 OFF. [문서](../../4.1맵디자인+설정/MAP_LOOK_GODOT_PASS1_20261020.md) |
| MAPLOOK-HOLE | 소환굴 공허 연출 모듈 | PC VS Code Codex | codex/maplook-hole-pc-20261020 | scripts/maplook/spawn_hole_fx.gd | **main 병합(MAP-LOOK과 함께)** 67/0 |
| MAPLOOK-TOXIC / SHADOW / MIST | 독액 수면 / 캐릭터 접지 그림자 / 월드 바닥 안개 모듈 | PC VS Code Codex | codex/maplook-{toxic,shadow,mist}-pc-20261020 | scripts/maplook/ 각 1파일 | 큐 대기(아직 착수 전) |
| BC01 | 1장 보스 1번 단위 구현(공용 0줄) | Mac Codex ttys009 | codex/bc01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SV-COLLECT | 세이브 수집 어댑터(port_modules/save_adapter) | Mac Codex ttys007 | codex/sv-collect-20261020 | 신규 모듈·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TRACE-ELITES | 정예 modifier·오라 원본 추적(문서만) | Mac Codex ttys004 | codex/trace-elites-20261020 | 추적 문서 | 진행 중 |
| W01 | 무기 1번 단위 구현(공용 0줄) | Mac Codex(무기 스레드) | codex/w01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| P2-008a-FIX | P2-008a 빙결전사 포이즈 경로 정지 결함 수정(crawler 413 etype≠0 거부 → hurtE 42490 halt, p1002g 1실패) | PC VS Code Codex(P2-008a 작성자, P2-008b 스레드에 최우선 큐) | codex/p2-008b-ch1-enemies-pc-20261020 | enemy_melee_ch1_ice_warrior.gd 등 | **main 병합(PC Claude 2026-10-20)** — Mac 49528efdb: 빙결전사 3프로필 정확 도메인(crawler 413 일반화)·p1002g 집계 정정(halts==0·_verify_kill 유지 diff 확인). PC 병합본 p1002g·p1002f·factory·etype20·crawler·fix_poise·contracts 0실패 |
| P2-008b | 1-1 미지원 적 다음 개체(order11 etype47 우선) | PC VS Code Codex | codex/p2-008b-ch1-enemies-pc-20261020 | enemy_factory.gd·신규 적 스크립트 | 진행 중 — 2a05d13f7: order11 etype47·order9 등록(지원 9→11 추정). 미검수·미병합. 빙결전사와 같은 crawler 상속이면 포이즈 halt 확장 여부 확인 필요 |
| P2-009a | 피드백 UI | PC VS Code Codex | codex/p2-009a-feedback-ui 계열 | native_skill_slots.gd 등 | 진행 중 |
| SK-S01 | 스킬 1번 단위 구현 | Mac Codex | codex/sk-s01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| SND-01 | 사운드 1번 단위 구현 | Mac Codex | codex/snd-01-20261020 | 신규 파일 2·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| IT-01 | 아이템 1번 단위 구현 | Mac Codex | codex/it-01-20261020 | 신규 파일·테스트 | **main 병합(PC Claude 2026-10-20 통합 일괄)** — 통합본 45종 0실패(신규 29+기본 16). bc02/bc03은 `-- --source-game=<game.html>`, save_collector는 `-- --node-bin=` 인자 필요 |
| TRACE-MAPS-CH1 | 1장 맵 원본 추적 | Mac Codex | codex/trace-maps-ch1-20261020 | 추적 문서 | 진행 중 |
| TRACE-LOBBY | 로비·캐릭터 선택 원본 추적 | Mac Codex | codex/trace-lobby-20261020 | 추적 문서 | 진행 중 |
| TRACE-SOUND | 6 사운드 원본 추적(문서만) | Mac Codex 01a1589f-0bf8 | codex/trace-sound-20261020 | 추적 문서 1개 | 검수 대기 — 16a198403 (맥북총괄 검수) |

## 공용(누구도 단독 소유 아님 — 수정 시 최소 줄·보고 필수)

### FEATURE-INVENTORY PC 배정 (2026-10-20 사용자 최신 지시)

| 작업ID | 담당·브랜치 | 소유 파일 | 상태 |
|---|---|---|---|
| FEATURE-INVENTORY | PC Codex · codex/feature-inventory-pc-20261020 | docs/engine/FDG_FEATURE_INVENTORY_20261020.md, docs/engine/orders/reports/FEATURE-INVENTORY_REPORT.md; 관련 계획 문서에 snapshot 링크만 추가 | 검수 대기 · 1,061행, 원본/근거3389참조·등록집합 대조. 정적 첫22통과/1서식실패 후 해당1검사만 수정·통과. 게임 실행/실플레이 인수 아님. P3-003은 Mac ENGINE 소유로 무수정. 커밋 SHA는 보고서 마감 단락/원격 ref에서 확인 |

FEATURE-INVENTORY 문서 체크포인트: `32492e498a3e5f53471c85eb6a6f752755b53000` / 브랜치 `codex/feature-inventory-pc-20261020`. 최종 판정 없음387·일부665·격리완료6·실플레이0·미확인3. 의미 검토의 보수화25행/집계 영향만 별도2검사군 통과(`classification-03.json`). 원본 HEAD 고정 snapshot이며 최신 main 전체 진행률로 사용하지 않는다.

`godot/scripts/main.gd`, `hud.gd`, `world.gd`, `player.gd`, `native_normal_enemy_hurte.gd`(공용 피해 집행자), `native_source_new_run_state.gd`(G/P 소유자)

## 검수·병합 완료 기록 (최근)
P1-002.C~H, P2-001a~k, P2-002a/b, P2-003a, P2-004a, P2-005a~d — main ad7f15777까지. 상세는 계획 문서 작업표.

## 보존된 미완 작업 (현재 배정과 별도)

- Mac Codex ENGINE의 이전 `GODOT-INTEGRATE-DEATH-CORPSE-ONE-ENEMY-20261020`은 구 worktree(`codex/p1-002-audio-live-queue-20261018`, HEAD `3c5023a4`)에서 보존 마감했습니다. `world.gd`·`enemy_melee_flesh_crawler.gd`·신규 `native_normal_enemy_corpses.gd` WIP만 해당 구 worktree에 남아 있으며, 최신 main 파일의 소유권을 주장하지 않습니다. 담당 보고는 compile 통과, 실제 경로는 imported ctex 누락 실패이며 화면·양성 사망 인수 및 관련 docs 동기화는 미완료입니다. 신규 SHA·main 반영 없음. 원로그/변경 보존: Mac ENGINE의 `death-runtime-resume-20261020/PRESERVED-HANDOFF-20261020.json`. P3-003에는 섞지 않습니다.

## 공용 연결 요청 (미수정·총괄 조정)

- **P3-003 → PC Claude 총괄:** `native_normal_enemy_hurte.gd::_kill_pipeline`의 원본 42702 `stageKills` write 직후 실제 적을 `NativeRegions.record_actor_kill(_enemy)`의 원본 `_regKill` 대응 경로에 전달하는 약4줄이 필요합니다. MAC 지시서의 ‘공용 피해 집행자 — 수정 필요하면 보고서에만’에 따라 ENGINE는 이 파일을 수정하지 않습니다. PC 총괄이 삽입 또는 정확한 수정 범위를 확정해 주세요. 피해 계산·드랍·입력 변경은 요청하지 않습니다.
- **P3-003 ↔ P3-002:** 소환굴 확정 후 `NativeRegions.initialize_stage()`를 호출하는 연결 지점은 P3-002 담당·PC 총괄이 조정합니다. P3-003은 `_totalSpawned`·World 동적 등록에 쓰지 않으며, 실제 소환굴 분모가 없으면 미연결 상태를 그대로 보고합니다.

- **P3-003 환경 검증 기록:** 원앱 Godot 4.7.2의 첫 import에서 WT asset reimport·editor layout 완료 후 `~/Library/Application Support/Godot/editor_settings-4.7.tres` 저장 ERROR로 중단(exit −15). clean import PASS가 아닙니다. 원로그 `~/exoduser-wt/_out/P3-003/import-01.*` 보존, 추가 import·전역 설정 권한 확대 없이 생성된 자기 WT 캐시와 고유 격리 userdir로 실Main A/B 첫 검수 9assert/0fail·exit0·ERROR0을 확인했습니다(`actual-01.*`). Main HUD-bind 직후 배선 정정 후 `actual-order-02`(PID1015)도 9assert/0fail·exit0·ERROR0으로 보고됐습니다. override는 비웠고 editor_settings는 사전 사본과 exact hash 동일입니다. 실제 화면·전체 지역 전투 인수는 아직 없습니다.
- **P3-003 중복 방지:** 이 판의 담당은 기존 Mac ENGINE 단독입니다. PC 총괄의 FEATURE-INVENTORY 행에서 다른 P3 중복 배정 중단·전환을 확인했습니다. ROOT는 맥북총괄 관할 터미널에 별도 지시하거나 같은 지역 작업을 중복 배정하지 않습니다.

## P3-003 원격 제출 · PC Claude 총괄 검수 요청

- 브랜치 `codex/p3-003-20261020`, 원격 검수 SHA [`919f6a28ab4e64e8a07cd403551777d8dbc77e6a`](https://github.com/beearth/the-exoduser/commit/919f6a28ab4e64e8a07cd403551777d8dbc77e6a), [제출 보고서](https://github.com/beearth/the-exoduser/blob/919f6a28ab4e64e8a07cd403551777d8dbc77e6a/docs/engine/orders/reports/P3-003_REPORT.md).
- CLI push 최초 인증 실패는 원로그에 보존했습니다. ROOT가 공식 GitHub 연결로 등록된 8경로만 게시했으며 원격 branch ref·parent(base `efdbf76b`)·변경8경로를 확인했습니다. 로컬 최종 `8d7e67a66d5acb10e223191bec681692df080ab8`과 원격 전체 tree는 `ffb3443402e57613f238fbc36cbb25ede84eb223`로 동일합니다. 원격 API 커밋 SHA는 별도이며 로컬3커밋·INDEX/WORK는 변경하지 않았습니다. 강제 push·reset·main 코드 병합 없음.
- core27/0, 실제 Main 최초9/0 및 배선 정정9/0은 별개 검수입니다. 표시 최초6통과1실패·단일 기대값 수리1/0, import 종료 설정 저장 실패도 그대로 보존합니다. C 실제 처치·P3-002 확정 분모·필드보스 전투/효과·실창1x는 미완이므로 전체 지역 진행 완료가 아닙니다. 위 요청 연결점과 보고서를 PC 총괄이 검수·조정한 뒤 코드 main 병합을 결정합니다.

2026-10-24 사용자 실제 검수: 세계관 구버전/끊김 FAIL. v22b 최신 연결·로비 원본 장식 보강·개발 PlayerConnection 제거·고정 실행경로·1변수 영상 A/B 진단으로 재검수한다. 자동으로 다음 전투/맵에 넘어가지 않는다.

2026-10-24 재작업: 최신v22b113.2507초자연완주/2718frame·20/20PASS·오디오폐기0·일반빌드UDP/TCP0확인. 원본로비장식복원/High444프로파일호환파생본/폰트400·600·700과작은글자잘림보정후실제UI-probe12/12PASS·caption/detail11/10행·독립수정검토PASS. 고정E:실행본152파일SHA대조, I:검수보존. 캐릭터생성/저장/계정/전체UI인수는별도미완료로유지한다.

2026-10-24 사용자 추가 요청 UI-DOCK: PoE2 참고 화면처럼 화면경계에 붙는 일체감을 HUD/인벤토리/독립검토로 병렬 진행한다. 기존 EXODUSER 아트를 사용하고 NativeHud·NativeInventory·NativeGame OnGUI 소유를 분리한다. 원본 구슬/bar 알파 여백에 따른 하단 틈·잘림과 인벤 개별카드 구조를 교정한다. 인트로 소스·Godot·사용자저장·공유 INDEX 보존. [범위·배치·검수](../UNITY_UI_DOCK_20261024.md).

2026-10-24 UI-DOCK 검수: 실제3해상도×HUD/인벤6런PASS·18PNG실제크기대조, 독립시각이번도킹PASS(7PNG), build0오류. 고정E:실행본152파일SHA대조갱신, 이전본I:보존. 인트로/모델/세이브불변, OS직접입력·전체UI인수와구분. I:/EXODUSER-Storage/qa/unity-ui-dock-20261024/suite.json·LIVE.json·SAVED.json.


2026-10-25 공조후속: PC현재디스크index는v17이며UnitycapturedPC와SHA일치,실제실행창은미확인. Steam별도v22b/+0.400초를인게임에섞지않는다. 지원담당928cue/17컷데이터대조를인수했고최종영상승인은계속미확정. [경계·지원근거](../UNITY_SOURCE_BASELINE_20261024.md#2026-10-25-pcmac-공조-원본-대조-후속).
