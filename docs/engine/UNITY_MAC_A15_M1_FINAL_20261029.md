# Mac A15 1% 정합·M1 최종 격리 검증 — 2026-10-29

## 소스·계약

Mac 기준은 `unity/main:e4fc056ae17fc6479b8c0676e840ec041f6d0592`, PC A15 원본은 `claude/unity-pc-a15-rangestep-20261028:2ac5793190dde04551b6e76cc7b67be78b018c54`다. PC commit을 정상 merge하고 `PortVerification.VerifyA15Settings`의 회귀 검사만 보강했다. 웹 `game.html`의 `optSfx`/`optBgm` range에는 `step` 속성이 없으므로 웹 `_gpUIStep`의 기본값은 1이다. Unity `OptionDef.Step`도 두 항목에서 1이다. 앞선 5% 진단 후보·빌드와 구분한다.

| ID·한글명 | 값·입력 계약 | 적용 위치 | Editor 관찰 |
|---|---|---|---|
| `optSfx`·효과음 | 좌/우 1%씩, 0–100 clamp, 값이 바뀔 때 callback 1회 | `NativePauseMenu.A15Web.A15RowKey` → `SetVal` → SFX callback | 60→61 및 0→1 각각 callback 1회와 전달값 일치; 0에서 Left, 100에서 Right는 추가 callback 0 |
| `optBgm`·배경음악 | 좌/우 1%씩, 0–100 clamp | 같은 range 경로 → BGM callback | 60→61, callback 1회와 전달값 61 |
| 다른 `K.Range` | `d.Step>1`이면 그 정수 단계, 아니면 1; `dir=0`이면 변경 없음 | 같은 range 경로 | A15 회귀는 위 음량 두 항목만 직접 검증 |

제품 변경은 PC 원본의 `NativePauseMenu.A15Web.cs` 한 줄이다. Mac 추가 변경은 Editor 회귀 검사에 callback 값, 양끝 clamp, BGM 1%를 확인하는 내용이다. Core·save 형식·미디어·입력 포트·설정 기본값은 바꾸지 않았다.

## 실행 영수증

| Gate | 결과 | 증거·범위 |
|---|---|---|
| Unity 6000.6.7f1 Mac Editor `PortVerification.Verify` 1회 | exit 0, receipt `passed:true`, `UNITY_A15_SETTINGS_NAV_SFX_CAPTURE_PASS`, `UNITY_HUD_GPU_RESOURCE_MASK_PASS`, `UNITY_VERIFY_PASS` | `_out/UNITY-MAC-M1-20261029/final1/editor/verify-receipt.json`, `verify.log`; 실제 Metal Editor, C# 오류 0 |
| ARM64 Settings QA `PortVerification.Build` 1회 | `Succeeded`, `passed:true`, 오류 0, 2,656,593,089 bytes | `_out/UNITY-MAC-M1-20261029/final1/build-receipt.json`; 앱 `final1/build/EXODUSER-Unity.app`, product `EXODUSER Settings QA`, identifier `com.fordeargamers.exoduser.settingsqa` |
| 격리 M1 Player `--unity-m1-check` 1회 | exit 0, 전 stage `ok`, `firstBlocked:""`; 32 capture, pause 중 capture 0 | `_out/UNITY-MAC-M1-20261029/final1/m1-output/m1-check.json`, `player.log`, `caps/`; 별도 `-output`·`--unity-qa-sandbox`, QA marker 아래 roster/combat save 생성 |

Player 앱의 `warrior_story_v23_clean.mp4` SHA256은 `8b8248424b63d808dc225576fda44e39d459709963f97923ffaa38a51dba28ab`로 입력과 일치한다. 실행 binary SHA256은 `311b38c735760d8048e5df035e60ca67d33946622ff25af80ca1b9c60df0ad0b`다. 기존 사용자 앱 PID 38141/48476/52157은 조작하지 않았다. Unity import가 재작성한 tracked 434개와 새 9개는 사전 백업 바이트로 복원했다.

M1 영수증의 01은 로비 API로 캐릭터를 만든 뒤 story/page를 스킵해 1-1에 진입한다. 02의 연습 종료는 script, 03–14 전투·진행은 `Simulation.Tick` 입력과 harness 조작을 사용한다. 필드 소환, 지역 Hell Gate 4/4, 보스 AI/처치, 1-1 클리어와 저장·재개는 이 격리 시나리오에서 PASS다. `captureMode=headless-rendertexture-1600x900`, `guiRepaints=0`, `guiBridged=0`이므로 capture를 실제 OS 조작·로비→1-1 자연 UI·A15 설정 실창·시각 품질 인수로 계산하지 않는다. 일반 앱의 실제 SFX/BGM 키 조작과 저장·재시작, 물리 입력/청음, Windows Player, PC 실제 checkout은 별도 확인이 필요하다.

## 동기화 상태

Mac 병합 commit `79907fac226c7dff65ce6d44c1aa8ef046877654`는 PC 후보 `2ac579319…`를 조상으로 두고 GitHub `unity/main`에 비강제 push됐다. PC 실제 통합 checkout `E:/exoduser-wt/codex-unity-integrator`도 clean 상태에서 `6d920689d→79907fac`로 fast-forward됐고 핵심 두 파일 raw bytes가 Mac/Git과 일치한다. PC 실행 앱 교체·실기 검증은 별도다.

## 같은 최종 앱의 일반 실창 OS 키 후속

제품 코드·빌드·자동 검사를 재실행하지 않았다. 위 ARM64 앱의 binary SHA256 `311b38c735760d8048e5df035e60ca67d33946622ff25af80ca1b9c60df0ad0b`를 고정했다. 새 루트 `/Users/fordeargamers/exoduser-wt/_out/UNITY-MAC-A05-IO-A15-1PCT-20261029`에 정확한 `qa-output.marker` 값 `EXODUSER_MAC_A05_IO_V1`과 끝 개행을 만들었다. 실행 인자는 `--unity-cinematic-persistence-review -output <루트> --unity-qa-sandbox <루트>/qa-sandbox -logFile <루트>/player.log -screen-width 1280 -screen-height 720`이며 재시작은 `player-read.log`만 바꿨다. `NativeSettingsStorageScope.TryResolveCinematicReview`는 QA 제품·identifier, `_out` 직계 `UNITY-MAC-A05-IO-*`, marker를 확인하며 `NativeQaSandbox`는 개인 저장 fallback을 거부한다. 첫 shell background PID49894는 실창을 열기 전에 종료되어 결과로 계산하지 않았다. 실제 GUI PID는 49910, 재시작은 50137이다.

| 구간 | 실제 UI·OS 입력 관찰 | 증거·판정 |
|---|---|---|
| 일반 동선 | 타이틀 Return→문 Return→세계관 Esc 길게 스킵→로비 N→전사 외형·이름 `A15Mac29` 생성→전사 이야기 Esc 길게 스킵→네메시스 Esc→안내 Esc→1-1 첫 연습 HUD | QA 직접진입·seed 없이 정상 UI를 걸었다. `01-field.png`, `02-w-move.png`. W 700ms 입력 뒤 연습 화면을 보았으나 화면 전환도 겹쳐 이동 거리 독립 판정은 하지 않았다. 영상 자연 완주는 미실시. |
| 실창 A15 | Esc 설정→Tab 두 번/Return으로 사운드→OS Right 한 번씩 SFX `60→61`, BGM `60→61`; 탭은 사운드 유지 | `03-audio-60.png`, `04-sfx-61.png`, `05-both-61.png`. 키 단계 실창 PASS. callback 횟수는 Editor 영수증 범위이며 실창에서 계측하지 않았다. |
| 격리 저장·복원 | `native-settings-v1/settings.v1.json` v2 revision3에 SFX/BGM `61/61`, `cinSeen:true`; roster v1 revision1 이름 `A15Mac29` | 같은 앱·루트 PID50137 재시작 시 세계관 대신 로비에서 전사를 선택하고 네메시스·안내 지원 스킵 뒤 사운드 `61/61` 확인. `06-restart-both-61.png`. 지원 UI 저장·재시작 PASS. |
| 자동 M1과 구분 | 이번 일반 GUI에는 `--unity-m1-check`를 사용하지 않았다. | 보스·전투·클리어·save 진행은 위의 별도 headless M1 receipt 범위. 실제 마우스 hitbox, 영상 자연 완주, 연습 완료·실전투, 청음·물리 pad·Windows Player는 이번 실창 범위 밖이다. |

원본 PNG 여섯 개는 위 격리 루트에 있다. GUI PID49910/50137은 종료했고 사용자 앱 PID38141/48476/52157은 계속 실행 중이었다. PC·GitHub·Mac 소스 체크포인트는 `79907fac`이며, 다음 동기화 경계는 PC 실행 앱의 실제 source 버전이다.

## 2026-10-31 Mac R5 소스 인수·Metal M1·전사 실제 프레임

Mac 실제 작업본 `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`의 기존 `codex/unity-mac-sync-20261028`은 clean `13c23929e`에서 GitHub `unity/main:a861d03037ead23aa022b9be4ae7f9d83156d09c`로 fast-forward했다. 별도 private `codex/mac-patchnotes-button-20261029:7229e26874ab5d1d618571b17f8ef3ae59c76722`의 미수락 UI·HOLD는 포함하지 않았다. 아래 두 앱은 **같은 R5 소스**에서 새로 만든 ARM64 Settings QA 제품(`com.fordeargamers.exoduser.settingsqa`)이다. 기존 사용자 실행 앱과 PC Player가 이 소스로 자동 갱신됐다는 뜻이 아니다.

| 경계 | 실제 Mac 근거 |
|---|---|
| 컴파일·기본 M1 앱 | Unity 6000.6.7f1 `PortVerification.Build`, `_out/UNITY-MAC-R5-20261031/build-receipt.json`: ARM64/`Succeeded`/오류0/2,935,308,374 bytes. 실행 파일 SHA-256 `acd32b767a164156d5b6f6dcfba1a26e5a8a81c47c124f3ea5f877203363b7b7`. 첫 Editor 시도는 잘못 지정한 메서드 이름을 에셋 가져오기 중 발견해 해당 자체 PID만 종료했고 제품 빌드는 없었다. 올바른 `PortVerification.Build`로 위 영수증을 생성했다. |
| 격리 무음 M1 | 같은 기본 앱을 `-batchmode --unity-mute --unity-m1-check -output .../m1 --unity-qa-sandbox .../qa-sandbox`로 1회 실행. `m1/m1-check.json` SHA-256 `189d8c07c4add9e820d7970f66d4096023d29fe2c1e39e5aac655836241f6f54`, Apple M5 Pro/Metal, 23/23 `ok`, `firstBlocked:""`, 정상 exit0, 32캡처. 로비 API 캐릭터 생성·이야기 스킵·연습 script 종료 후 `Simulation.Tick` 입력/하네스 조작으로 1-1 이동·전투·드랍/장착·레벨업·지역 4/4·드루이드·클리어·저장/재개를 검사했다. 직접 상태 주입·표적·체력/무적 보정이 섞인 QA이므로 일반 플레이·OS 입력으로 확대하지 않는다. `captureMode=headless-rendertexture-1600x900`, `guiRepaints=0`, `guiBridged=0`이라 캡처에 HUD는 없다. |
| 3D 필드 포함 앱 | 같은 소스의 `-remodel-scenes 1` 빌드 `_out/UNITY-MAC-R5-20261031/build-remodel-receipt.json`: ARM64/`Succeeded`/오류0/3,070,537,884 bytes. 실행 파일 SHA-256 `3c2590912c64c46bb304a468a0ae1d5f88e14979296c02d506601a4e307d6960`. |
| 실제 1600×900 연속 프레임 | 3D 앱을 `--unity-hero-review --remodel3d --unity-mute -output .../hero --unity-qa-sandbox .../hero-sandbox`로 1회 실행. `hero/hero-review.json` SHA-256 `fc7afbb4995b8d2dfb5b24a797a23d026fcda47bbf27ce22156e91c3639f33b4`: Apple M5 Pro/3D 필드/30검사 전부 통과/579 PNG/정상 exit0. 첫 강타 입력 tick827에 표적 HP 461 감소·파동1, 소켓 칼 방향 내적 −0.7779413, 실제 메시 칼끝 바닥 평면 높이 0.01018899m를 같은 프레임에서 확인했다. 스킨 높이 9.3855%. 이 하네스는 격리 표적·상태 fixture와 직접 `StepInput`을 쓰며 OS 손조작·청음은 아니다. |
| 시각 증거·판정 | `hero/frames/hero-0015.png`(대기), `hero-0412.png`→`hero-0415.png`(강타 첫 접점 연속), `hero-0420.png`(효과 확장), `hero-0555.png`(사망)를 원본 1600×900에서 직접 보았다. 무확대 1x 픽셀 크롭 `hero/hero-0015-1x.png`(420×340), `hero/hero-0413-1x.png`(500×400), `hero/hero-0413-objective-1x.png`(280×210)도 확인했다. 하향 칼·앞 체중·지면 그림자는 읽히지만 어두운 판금/작은 발밑 대비·큰 강타 효과의 신체/파지 가림이 남아 **전사 전체 VISUAL VERDICT: RETOUCH**다. 수치 30/30은 전체 시각 PASS가 아니다. |

**현재 UI 결함 1건:** `hero-0413-objective-1x.png`에서 우상단 `앵글러 · 불 / 32M` 유도 화살표·라벨이 레벨/경험치/지역 처치/악의 목표 패널을 덮는다. 1600×900 화면의 목표 패널은 설계 좌표 `(1684,16,216,153.39)`를 5/6로 표시한 약 `(1403,13,180,128)`이며, 캡처의 화살표·문구가 그 영역에 실제 교차한다. `NativeGame.RegionHud.cs:RegionHudSafeZone`은 목표 패널 Rect를 전달하지만 `NativeRegionHud.DrawArrow`는 화살표 **기준점만** 블록 밖으로 밀고 최종 clamp를 다시 적용한다. 96px 회전 이미지·글로우·68px 뒤 라벨의 표시 범위는 검사하지 않는다. 채택 웹 `game.html:_raMeasureSafe/_drawRegionArrow`도 기준점만 회피하는 구조다. 웹의 동일 화면에서 실제 겹침이 재현됐는지는 미검증이며, Mac caller의 블록 수치만 늘리면 최종 clamp·회전/글자 범위를 보장할 수 없다. 공용 HUD renderer와 웹 계약의 표시 bounds 회피를 함께 다룰 소유자에게 이 원본 1600×900·1x, 정확한 Rect, 재현 프레임을 넘기는 것이 다음 산출물이다. 이번에는 PC 소유 UI 구현·Core·모델·VFX를 변경하지 않았다. 무음 캡처의 실제 청각, 자연 영상 완주, 장시간 플레이, 물리 마우스·패드, 1-1 전체 카메라 판정은 미검증이다.

### MAP PRODUCTION REPORT — R5 Mac CH1-1 카메라/전투 관찰 범위

| 항목 | 이번 실제 판정 |
|---|---|
| STAGE / MASTER | CH1-1(`si0/stage0`). 현행 stage LOCK의 6시 START→12시 EXIT·8구역·200×200 타일은 변경0. 전체 실루엣/side spaces 재제작·전수 판정은 이번 범위 밖. |
| OUTER MASS / LARGE / MEDIUM / GROUND | LEFT/RIGHT/TOP/SOUTH·큰 hole·composite/반복·연결·그림자/오염/접합은 기존 SSOT 유지, 변경0. 시작 3D 프레임에서 바닥 질감·지면 그림자만 관찰; 전체 외곽 GATE 2~4 시각 PASS는 주장하지 않음. |
| PLAYABLE / LANDMARK | M1 하네스에서 이동·전투·지역4/4·보스 진입·클리어는 기술 PASS. 3D 시작 전사의 발밑 대비 부족, 강타 효과의 신체 가림 잔여. 주요 arena·travel/breathing/threat 공간의 자연 플레이 전수 미검증. 기존 랜드마크 배치 변경0. |
| CAMERA QA | START=`hero-0015.png`, 전투 접점=`hero-0413.png`와 1x, 2D 보스 arena=`m1/caps/11a-druid-volley.png` 확인. EARLY/SIDE L/SIDE R/LANDMARK/LATE/EXIT의 동일 3D 카메라 보드 전수는 미실시. 보스 M1 이미지는 HUD 없는 headless 월드 렌더라 UI 가림 판정에 사용하지 않음. |
| TECH QA | `m1-check.json` 23/23·Metal·정상 exit0, 강타 30/30·정상 exit0, 컴파일/빌드 오류0. route/AI/loot/save는 하네스 범위. collision·seam·loading·성능·장시간 안정성의 맵 전수 PASS는 미주장. pageerror/404는 네이티브 실행에 해당하지 않음. |
| FILES / GIT | 맵 geometry/아트/배치/코드 수정0. Unity Editor가 만든 520개 tracked import 변경과 56개 새 메타/설정 파일은 `_out/UNITY-MAC-R5-20261031/editor-generated-final-*`에 복구 패치·목록·tar로 보존했고 정확히 해당 생성분만 원래 작업본 상태로 되돌렸다. private UI 브랜치 보존. docs의 이 검수 기록 외 제품 수정0. |

**VISUAL VERDICT: RETOUCH** — 검수한 전사 3D 시작/강타 장면의 가림·발밑 대비와 목표 패널 UI 겹침이 남는다. 기존 CH1-1 맵 전체 시각 등급을 새 PASS로 갱신하지 않는다. **NEXT PASS:** 공용 지역 유도 화살표/라벨의 회전 후 표시 범위와 목표 패널 Rect 회피를 웹·Unity 소유자와 정합해 수정하고, 같은 1600×900 장면과 1x에서 겹침 제거를 확인한다.

### 우상단 SafeZone 호출부 재확인 — 제품 수정 0

`NativeGame.OnGUI`는 `hudScale=min(Screen.width/1920, Screen.height/1080)`, `hudWidth=Screen.width/hudScale`을 `NativeObjectivePanel.Draw(hudWidth)`와 `NativeFieldHud.Draw(hudWidth)` 양쪽에 전달한다. 이번 1600×900은 `hudScale=5/6`, `hudWidth=1920`이다. 따라서 실제 목표 패널의 `Draw` Rect `(hudWidth−216−20,16,216,153.39)=(1684,16,216,153.39)`와 `RegionHudSafeZone()`이 공급한 Rect는 **정확히 일치**한다. 시계도 실제 `NativeFieldHud.DrawClock`의 `(hudWidth/2−85,17,170,37)`과 공급값 `(875,17,170,37)`이 일치하며, 미니맵 프레임은 양쪽 모두 `(8,8,141.1,141.1)`이다. `NativeHudDockLayout.Create(1920,1080)`의 하단 제한도 이번 화면의 HUD 설계 크기와 같다. 따라서 이번 겹침은 Mac caller의 목표 패널 위치 계산 오류가 아니다.

`NativeRegionHud.DrawArrow`는 목표 패널에 12px을 더한 `(1672,4)..(1912,181.39)` 안에 **기준점**이 들어오면 가장 가까운 한 변으로 옮긴 뒤, 다시 허용 화면 Rect로 clamp한다. 이 화면에서 허용 x의 최댓값은 `1896`이므로 오른쪽 변 `1912`로 밀어도 다시 목표 패널 내부가 된다. 시계 회피로 허용 y의 최솟값이 `66`이므로 위쪽 변 `4`로 밀어도 다시 내부가 된다. 설령 기준점이 블록 밖에 남더라도 회전 화살표 96px·글로우·68px 뒤 라벨의 실제 표시 bounds는 검사하지 않는다. `hero-0413-objective-1x.png`의 겹침은 이 경로와 일치한다. 블록을 임의로 크게 하거나 문구를 숨기고 줄이는 caller 수리는 정확한 예약 영역을 훼손하며 다른 방향/화면에서 무겹침을 보장하지 못한다.

**공용 renderer 수정 제안:** `DrawArrow`의 자연 후보 위치와 화면 제한을 계산한 뒤, 회전 화살표·글로우와 두 줄 라벨의 실제 표시 bounds를 하나의 후보 footprint로 평가한다. 시계/미니맵/목표 패널/하단 HUD와 교차하지 않는 화면 내 후보를 선택하고, 마지막 clamp 후에도 동일한 교차 검사를 수행한다. 1600×900의 목표 방향과 다른 8방향/화면비를 확인하고, 웹 `_drawRegionArrow`와 동작을 맞춘다. 이 제안은 PC 공용 renderer 소유 범위이며 이번 Mac checkpoint의 제품 코드는 변경하지 않았다.

## 2026-10-31 06:15 고정 공통 입력 Mac 인수·무창 검수

소유 작업본 `/Users/fordeargamers/exoduser-wt/UNITY-MAC-20261024`의 clean `202b32c85df19ce0b2a11db118e313298948a416`을 원격 expected `unity/main:b9491cf58bf47277b40f3497d684e46deee1c59c`로 정상 fast-forward했다. 새 Unity tree는 `ae7c0d6cdec3d4013bc880399893c07031a7af98`. private `codex/mac-patchnotes-button-20261029:7229e26874ab5d1d618571b17f8ef3ae59c76722`는 인수하지 않았다. 변경 전 기존 80파일의 byte/SHA와 INDEX SHA `59f9f573f387cd1fde118c32d0cdada45d75806f3f71f7b88982a891dc9aed13`는 `_out/UNITY-MAC-CURRENT-20261031-0615/pre-ff-*`에, 빌드 전 1,638개 메타/씬/설정 파일의 byte/SHA는 같은 루트의 `pre-build-mutable-*`에 보존했다. 오디오 원본 `Resources/Audio/UI/ui_tab.mp3`는 3,386bytes/SHA-256 `3a693839af04190e6255f3098c92528d95812fa5b4a84e4be1a01a5bf66a1a4b`와 일치한다.

| 게이트 | 이번 Mac 실제 결과 |
|---|---|
| 단일 새 ARM64 앱 | Unity 6000.6.7f1 `PortVerification.Build -remodel-scenes 1 -settingsQa true`, `build-receipt.json`: `Succeeded`/오류0/3,071,311,781bytes, `com.fordeargamers.exoduser.settingsqa`. 실행 파일 SHA-256 `42bf7e9cecff82c3bb7f152eca819d818d70847677e4b64385d098bbee214791`; 같은 앱의 `Exoduser.Runtime.dll` `5ee524cda8a6c7b823cfdd223a565e08b7c800e3af068f99cf116efe42248b25`, `Exoduser.Core.dll` `152409d6784c0ac2c9a723c4bb6144dc42724e091a69dd236a98d30d72fc85d6`. |
| 같은 바이너리 M1 | `-batchmode --unity-mute --unity-m1-check`와 절대 `-output`/`--unity-qa-sandbox`에서 exit0, Apple M5 Pro/Metal, 23/23 `ok`, `firstBlocked:""`, 32 월드 캡처. `m1/m1-check.json` SHA `189d8c07c4add9e820d7970f66d4096023d29fe2c1e39e5aac655836241f6f54`는 결정적 영수증이라 이전 R5의 같은 해시가 나왔지만 이번 `m1-player.log`와 위 **새 바이너리**로 별도 실행했다. `guiRepaints=0`, `guiBridged=0`이므로 HUD 근거 아님. |
| 승인 `ui_tab` 최소 실제 동작 | 같은 앱의 `--unity-ui-tab-audio-check`는 무음·격리에서 24검사 통과: 클립 로드/실제 디코드, 최초/활성/거부 전환 0, 다른 패널 전환 1회, 가상 InputSystem F10 정상 프레임 전환 1회와 입력 fence. 이후 검수 도구의 Windows 전용 `GetCurrentProcessId` P/Invoke가 Mac에서 `EntryPointNotFoundException`을 내어 exit2, 전체 영수증 **FAIL(24/25)**. `ui-tab/Player_오디오_회귀.json` SHA `e7bc2f85624bf9ac8e86b6f6a5b88c1948e6cf94dbc963da8ca152ba5a7b78ab`. 마우스 GUI·실제 AudioSource/UI bus·설정0/60/100%·최종 screenshot은 도달하지 못해 Mac PASS로 선언하지 않는다. 정적 계약은 raw gain .22/pitch1/2D0/loopfalse/성공 전환당 1회이며 청음은 하지 않았다. 동일 Windows 전용 실패 경로 재시도0. |
| 전사/중심 앵커 | 같은 앱의 `--unity-hero-review --unity-hero-anchor-check --remodel3d --unity-mute -batchmode`는 exit0, `hero-review.json` `passed:true`/world3D/30/30·579 프레임 **수치 행**/첫 강타 tick827·피해461·파동1. 그러나 무창 Player의 `ScreenCapture.CaptureScreenshot`가 전 579장에서 실패하여 PNG 0, `anchor/고정표본.json`도 생성되지 않았다. 30/30을 새 중심 앵커 GPU/시각 PASS로 확대하지 않는다. 현재 소스의 오프라인 중심식 14/14는 `anchor-static/영수증.json`에 별도 보존. |
| HUD 화면 경계 | 창 없는 `--unity-region-hud-capture`는 exit0·세계 렌더 PNG 5개를 만들었으나 `NativeGuiCapture.RepaintFrames=0`, arrow `Shown=false`여서 현재 UI/겹침 증거가 아니다. 요청된 현재 1600×900 GUI와 1x 시각 판정은 **미확보**다. 이전 R5 `hero-0413-objective-1x.png`의 패널 겹침은 미해소 HOLD이며 이번 새 바이너리의 동일 화면 재현 여부는 미검증. 물리 마우스/CUA 실패 경로 재시도0. |
| 종료·보존 | Editor/자기 Player는 종료. 기존 사용자 Player PID38141/48476/52157은 유지. 모든 Player에 절대 격리 세이브를 지정했다. Editor import의 tracked 520개 변경은 빌드 전 바이트/SHA로 복원했고 새 56개는 byte/SHA 목록·tar 보존 후 `_out/.../editor-generated-untracked-files`로 옮겼다. 생성 diff SHA `149f376ca46eb9658957094037d897e8962fea13ac4eb7673c642bc889dd98b0`; 작업본은 이 문서 작성 전 clean이었다. 제품 코드 수정0. |

### MAP PRODUCTION REPORT — 이번 고정입력 범위

MASTER/OUTER MASS/LARGE/MEDIUM/GROUND/LANDMARK와 맵 geometry·collision·route는 변경0·시각 전수 미검증이다. PLAYABLE은 M1 하네스의 1-1·지역4/4·보스·클리어 기술 PASS에 한정한다. CAMERA QA의 현재 3D START/ARENA/SIDE/EXIT GUI 프레임은 무창 캡처 실패로 인수 불가하다. TECH QA는 ARM64 빌드·Metal M1 통과, 오디오 도구 Mac P/Invoke 실패, 실제 UI repaint 0이며 pageerror/404는 네이티브 실행에 해당하지 않는다. FILES/GIT은 위 백업·정확 복원과 이 문서만 별도 커밋 대상이다. **VISUAL VERDICT: RETOUCH** — 이전 R5의 가림/발밑 대비/목표 패널 겹침 HOLD가 있고 새 입력의 현재 화면 PASS는 증명되지 않았다. **NEXT PASS:** Mac에서 실제 GUI를 캡처할 수 있는 승인된 무창 경로와 Windows P/Invoke 없는 오디오 검수 경로가 확보되면 같은 새 바이너리 기준 1600×900·1x 및 Source 설정을 다시 확인한다. 자연 플레이·청음·사용자 OS 조작·55스킬 완료는 이번 결과가 아니다.
