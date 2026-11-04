# Mac 세션 결과 — 2026-11-04 (브리프 `MAC_SESSION_BRIEF_20261104.md` 수행)

판정한 SHA 이후 브랜치 끝이 움직였다: unity/main `386be384e`, combo3 `856d4eaa5`, preview6 `6229288c0`. 아래 판정은 적힌 SHA에만 적용된다. 파일 전송 §1은 1차까지만 완료.

작성: Mac Claude 세션(맥북총괄). PC CTO 세션으로 직접 메시지 경로가 없어 이 문서와 커밋 메시지로 보고한다. 과정은 적지 않고 항목별 결과만 적는다.

## 0. 환경
- 빌드·실행: Mac Editor 6000.6.7f1, ARM64, worktree `~/exoduser-wt/UNITY-PERF-20261103`(detach), 산출물 `~/exoduser-wt/_out/MAC-JUDGE-20261104/`.
- 실행 공통: `--remodel3d --unity-mute --unity-fullrun-qa --unity-qa-sandbox <격리> -qa-locale ko -screen-width 1920 -screen-height 1080 -nosound`, 창은 화면에 띄움, 소리 0, 사용자 세이브 무변경.
- 10초 영상: `screencapture -V`가 화면 기록 권한 없음으로 파일 미생성 → **미확인**(사용자 권한 부여 요청함).

## 1. 파일 전송 (`claude/mac-transfer-20261104`)
| # | 항목 | 상태 | 근거 |
|---|---|---|---|
| 4 | 전사 LOCK v2 3면 | **완료** | `4d3d3b15f` transfer/20261104/lock/warrior_lock_v2_front_side_back.png 4,771,355B sha256 9834c64e… (3072×1024) |
| 5 | 메뉴 날개 8장 | **8/8, JPEG** | 전부 Tripo 업스케일 JPEG 4096×2272 `{right,left}/<id>.upscaled.jpeg`. 원본 PNG는 자산 화면에 없어 못 받았다. 11-05 `12c73bfed` |
| 1~3 | Tripo GLB 3 | **완료** | 11-05 `12c73bfed`. 실버테일 958,524B, 아이반 몸 987,892B, 아이반 머리 974,248B. glTF 2 헤더 정상. **세 파일 모두 텍스처 0·이미지 0·스킨 0, 재질 1개, 파츠 메시 16~20개다.** 필요한 것이 텍스처·리깅본이면 다시 받아야 한다. 크레딧 23,890 변동 없음. 몸 파일 해시는 페이지 Blob과 일치 |

## 2. 실게임 판정
### ① unity/main `ba56124ab` 1-1 한 판 (`--remodel3d`, 빌드 `-remodel-scenes 1`)
실행본 `build-main`(7,021,702,607B, level0+level1), 완주 QA `run-main-1920` 19:26:40~19:36:58. 캡처 183장 `run-main-1920/caps/`(로비·전투·보스진입·사망은 1920/2560/3840 세 폭).

| 항목 | 결과 | 근거 |
|---|---|---|
| 크래시·예외 | **PASS** — 크래시 0, player.log Exception/NullReference 0 | `run-main-1920/player.log` |
| 완주(드루이드 처치·클리어) | **FAIL** — 보스전 사망 6회·재시도 5회 뒤 `player-death` 종료, worldCleared=false. 보스 HP 148,786 중 최저 29,757(2회) | `fullrun.json` result·deaths·samples |
| 걸린 시간 | 총 612초. 로비→필드 16초, 필드→보스 진입 361초(처치 349·Lv12·지역 4/4), 보스 시도 5회 각 약 40초 | `fullrun.json` samples |
| 가장 긴 멈춤 | 캡처·해상도 변경 제외 **250ms**(t=361 아레나 로딩 loadPhase 2), 다음 175ms(t=22 첫 전투), 133ms×4(아레나 재진입 로딩). 캡처 포함 원값 586.7ms(전투 컷 2560/3840 리사이즈 순간) | `long-frames.jsonl` |
| 평균 FPS | 108.8(P95 15.97ms, P99 16.88ms, 64,838프레임). 사망 후 재진입 전환 샘플에서 7~9fps(로딩) | `fullrun.json` |
| 3D 필드 | **PASS** — 원근 카메라·전경 고목·다리·늪 정상. `RM-INT staying 2D` 없음 | `caps/combat.png` |
| 먼 적이 보이는지 | **PASS** — 전투 컷 우상단(1290,200 부근)·화면 중단에 먼 적 소형으로 보임 | `caps/combat.png`, `t00xxxx.png` |
| PC 결함 ① 처치·드랍 지점 흰 사각형 | **Mac 재현(형태 다름)** — 피격·처치 지점에 베이지 반투명 다각형 원판 + 흰 섬광이 뜸(2D 판·3D 판·보스전 모두). 텍스처/셰이더 폴백 의심 | `caps/drops.png`, `boss-pattern-bossSlam.png`, 2x 크롭 |
| PC 결함 ② 3840 타이틀 멈춤 | **부분 확인** — 3840×1080 창(`-qa-width 3840`, 52초 판)에서 로비·첫 연습·필드 진입 정상, 로비 구간 멈춤 없음. 캡처 제외 최장 359ms(t=43 필드 전투). 평균 80.6fps(P95 17.6ms). 타이틀(인트로 영상) 화면은 완주 QA가 로비부터 시작해 **미확인** | `run-main-3840/fullrun.json`, `caps/00-lobby.png`(3840) |
| PC 결함 ③ 로비 '새 캐릭터' 줄 끝 숫자 | **Mac 재현** — 줄 끝에 '1' 표시(PC는 '0'). 캐릭터 카드 아래 빈 슬롯은 테두리 네모만 있는 빈 판 | `caps/00-lobby.png` 2x 크롭 |
| 전경 고목 가림 | 관찰 — 화면 왼쪽 약 1/3을 고목 줄기가 덮음(플레이어는 안 가림). 11-03 perf 캡처에서는 플레이어를 가린 장면 있음 | `caps/combat.png`, `vis-u3/caps/t001019.png` |
| 10초 영상 | **미확인**(화면 기록 권한 없음) | — |

### ② 통합 후보 3차 `eb9d7d44c` (판정용, 병합 안 함)
실행본 `build-combo3`(7,044,405,364B, level0+level1, 96초 증분 빌드). 실행 묶음 `combo3/r1~r12`.

| 항목 | 결과 | 근거 |
|---|---|---|
| 크래시·예외 | **PASS** — 5분 완주 QA(필드, 처치 338·Lv12·지역 4/4, 보스 전 시간 제한) 크래시 0·예외 0, 평균 121.5fps, 캡처 제외 최장 426ms(t=22 첫 전투) | `combo3/r1-fullrun/fullrun.json` |
| 제품명 'EXODUSER: HELL LORD' | **PASS** — 빌드 receipt product·Info.plist CFBundleName 'EXODUSER: HELL LORD', 번들 ID `com.ForDearGamers.EXODUSER--HELL-LORD`, 로비 로고 EXODUSER / HELL LORD | `build-combo3-receipt.json`, `r2-second/caps/00-lobby.png` |
| 로비 0명 | **PASS(표시)** — 빈 격리 저장소에서 묘왕 바르칸 로비 영상·빈 슬롯 2칸·'새 캐릭터' 줄 정상. 줄 끝 '0' 잔존(D3, PC와 동일). 단 `--unity-lobby-smoke` 모드가 로비 영상 재개방(#4~#6)을 반복하며 55분간 종료되지 않아 강제 종료(QA 도구 결함, D6) | `r9-lobby0/out/unity-lobby-lobby.png`, `player.log` |
| 로비 2명 | **PASS** — 같은 격리 저장소 2회 진입 뒤 카드 2장(F755270 Lv.12, F632580 Lv.1) 정상 배치. '새 캐릭터' 줄 끝 숫자 '2' 잔존(D3) | `r2-second/caps/00-lobby.png` |
| 스테이지 클리어 위시리스트 | **PASS(demo 플레이버)** — 구역 클리어 패널에 '데모 종료' + '정식판 위시리스트에 추가' 버튼. flavor-capture 8/8 PASS(DemoEnd 변형·stage1은 zone 패널 유지) | `r6-flavor-demo/out/unity_flavor_demo_clear.png`, `flavor-capture.json` |
| 체험판 끝 화면 | **부분** — 끝 패널 변형(DemoEnd)과 로비 DEMO 표기(DEMO · v0.1.0 · 20261102 · OFFLINE · Lv.1 START · Stage 1-1 Only · Lv.100 Cap · 1~2h)는 확인. '데모 종료' 버튼 이후 화면은 캡처 모드가 없어 **미확인** | `r6-flavor-demo/out/unity_flavor_demo_lobby.png` |
| 설정 게임 탭 11행 | **PASS** — 게임 설정 11행(움직임 줄이기·자동 물약·최소 줍기 티어·유물 자동강화·버스트루프 당기기·보스 AI 디버그 / 난이도·최소 줍기 등급·유물 자동합성·석궁 자동발사·기동:칼날개 AUTO). ui-finish-settings PASS, 1920·1600, en·ja·de 변형 캡처 | `r7-settings/out/unity-settings-0-1920.png`, `ui-finish-settings.json` |
| BGM 실제 소리(hell1 → 3곡 회전) | **미확인(무음 규칙)** — 사운드 탭 BGM 선택 9값(자동·로비·1장 h0_explore·Ashes Under the Banner·Cathedral of Steel·Iron Oath Under Ash·보스·사망 랜덤·승리 랜덤)은 확인. 회전 자체는 로그 표식이 없어 소리로만 확인 가능 | `r7-settings/out/unity-settings-2-popup-1920.png` |
| 재시작 뒤 언어 복원 | **미확인(검증 경로 없음)** — QA 실행은 설정 IO를 하지 않고(`NativeSettingsStorageScope.IsQa`), 유일한 우회 `--unity-settings-persistence-smoke`는 'EXODUSER Settings QA' 제품 식별자 빌드(`-settingsQa true`)에서만 동작(`Settings fixture refuses normal product identity`). 언어 저장 트리거는 일시정지 메뉴 LanguagePicked → QueueSettingsSave 하나뿐이고 로비 언어 메뉴에는 저장 훅이 없음. 실행 검증은 사람 손조작 또는 settingsQa 빌드 필요 | `combo3/r13-lang/b/player.log` |
| 필드 진입 로딩 진행선 | **미확인** — 촬영 모드 `--unity-transition-loading-capture`가 Mac M5 Pro에서 조립 0.10초·전체 3.6초로 끝나 진행선 샘플(label)이 비어 passed=false(`missing samples: label`). 캡처된 c/d 시점은 로비 페이드와 우하단 붉은 인장만 보임 | `r5-loading/out/transition-loading.json`, `transition-lobby-game-seal.png` |
| Mac 세이브 경로 | **PASS(코드·빌드 기준)** — `NativeFlavorSavePaths.FullRoot`는 Mac Player에서 Application Support 아래 옛 번들 ID 폴더 `com.ForDearGamers.EXODUSER----Unity-----------------`를 full 전용 루트로 고정(새 번들 ID 폴더가 아님). 실제 실행 검증은 사용자 세이브 보호(쓰기 발생)로 하지 않음. QA 격리 루트에는 `EXODUSER-HELL-FULL/` 이름공간이 생김 | `NativeFlavorSavePaths.cs`, `r1-fullrun/sandbox/` |

### ③ 통합 미리보기 6차 `7f88dfd50`
실행본 `build-preview6`, 인자 `--remodel3d --enemy-render=rigpixel --boss-render=rigpixel`. **판정 FAIL.** 상세·스택은 `cloud-lanes/reports/mac_20261104.md`(브랜치 `claude/unity-mac-report-20261104`).

| 항목 | 결과 | 근거 |
|---|---|---|
| 크래시·예외 | **FAIL** — 크래시 0, `A2RSetup` NullReferenceException 2/2 재현 | `run-preview6-normal/player.log:43` |
| 화면 | **FAIL** — 카메라가 다리 앞에 고정, 필드·보스전에서 플레이어·적·보스 안 보임 | `run-preview6-normal/caps/combat.png`, `boss-pattern-bossSlash.png` |
| 가드 한 줄 시험(로컬) | 예외 0, 카메라 복구, 평균 35.1fps, 적 2D 대체 0 | `run-preview6-guard/` |
| `--a2r-off` | 예외 0, 카메라 정상, 클리어, 평균 44.4fps | `run-preview6-a2roff/` |
| 드루이드 P1~P3 각 1x | **미확인** — 정상 조건 판 없음 | — |

### 추가: 통합 후보 4차 `a8618d9bf`
**판정 RETOUCH.** 완주 1판 627초, 예외 0, 평균 207.4fps, 보스전 6사망 미클리어, 제품명 정상, 로비 줄 끝 숫자 사라짐(1명 로비), D2 잔존. `run-combo4-1920/`.

## 3. 결함 목록 (담당 표기)
| # | 결함 | 어디서 | 담당 | 근거 |
|---|---|---|---|---|
| D1 | 1-1 완주 QA가 드루이드전에서 6회 사망·미클리어(크래시 아님). 봇 기준 보스 난이도 또는 봇 패턴 대응 문제 | ① unity/main | 보스전 총괄(+QA 하니스) | run-main-1920/fullrun.json |
| D2 | 피격·처치 지점 베이지 반투명 원판+흰 섬광(PC '흰 사각형'과 동일 계열) | ① 필드·보스전 | 임펙트 총괄 | caps/drops.png, boss-pattern-bossSlam.png |
| D3 | 로비 '새 캐릭터' 줄 끝 잔여 숫자 '1', 빈 슬롯 판 미마감 | ① 로비 | 디자인·유니티 총괄 | caps/00-lobby.png |
| D4 | 아레나 진입·재진입 로딩 멈춤 133~250ms, 사망 후 재진입 샘플 7~9fps | ① 보스 진입 | 유니티 총괄(퍼포먼스) | long-frames.jsonl |
| D5 | 로딩 촬영 모드가 Mac에서 조립 0.1초라 진행선 샘플을 못 찍음(passed=false). 판정용으로는 느린 조립 재현 또는 강제 지연 옵션 필요 | ② 로딩 | 유니티 총괄(QA 도구) | r5-loading/transition-loading.json |
| D6 | `--unity-lobby-smoke`가 Mac에서 종료되지 않음(로비 영상 재개방 반복), `--unity-startup-capture`는 16 FAIL(구식 픽스처), `--unity-stageclear-presentation-capture`는 3D·2D 재실행 모두 진입 실패 | ② QA 모드 | 유니티 총괄(QA 도구) | r9/r3/r8 player.log |
| D7 | `A2RSetup` NRE → 카메라 고정 | ③ preview6 | 맵·A2R 담당 | run-preview6-normal/player.log |

## 4. 메모
- Mac 세이브 경로: `~/Library/Application Support/com.ForDearGamers.EXODUSER----Unity-----------------/` 존재, `character-roster-v1/characters.v1.json`·`characters.lock` 있음. 11-04 07:54에 하위 `qa/20261104-075459-2253`이 생겨 있음(다른 세션 QA 이름공간, 내용 미변경).
- 빌드 함정: `PortVerification.Build`는 `-remodel-scenes 1`이 없으면 RM1_Slice 씬을 넣지 않아 `--remodel3d`가 2D로 떨어진다(플레이어 로그 `[RM-INT] scene RM1_Slice is not in the build: staying 2D`). 한 판을 2D로 잘못 돌려 폐기했다. unity/main 11-04의 인트로 v23 영상은 작업본에서 `restore-lobby-media.cjs`를 다시 돌려야 빌드된다.
