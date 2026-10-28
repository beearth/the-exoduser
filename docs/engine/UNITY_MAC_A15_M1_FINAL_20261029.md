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
