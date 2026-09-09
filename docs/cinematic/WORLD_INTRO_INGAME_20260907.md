# 세계관 인트로 v13 — 인게임 적용 / BGM 확인

> 최신 자막·언어 계약: [v6 전체 28언어 자막](WORLD_INTRO_V6_SUBTITLES_20260907.md). 무자막 영어 마스터 + 언어당 32큐, 영화 중 언어 변경 지원. 아래 v3/v4/v5 시점 검수 기록은 보존 이력이다.

> 최신 타이틀: [v7 EXODUSER 단독](WORLD_INTRO_V7_EXODUSER_ONLY_20260907.md). HELL ROAD 부제를 제거하고 기존 원본 로고만 마지막 4초 중앙에 표시. 지옥문·대사·자막·BGM 연속성 유지.

> 최신 편집: [v13 Exodus 대사 적용](WORLD_INTRO_V13_EXODUS_20260907.md). v12 전체 영상·마지막 연속 호명은 보존하며 Escape 한 단어를 Exodus로 재녹음하고 한영 큐29만 변경했다. 전체 113.291667초, 로고 109.291667초, BGM 연속 재생 유지.

2026-09-07 사용자 요청: “인게임에 넣어봐 BGM이랑 확인하자”. 로컬 런타임 적용 완료. 후속 요청으로 [v8 마지막 문장](WORLD_INTRO_V8_FINAL_LINE_20260907.md)을 재녹음하고 [v10 전통 판타지 마법](B04_V4_TRADITIONAL_MAGIC_20260907.md)을 반영했다. 이전 원본 파일을 보존하며 커밋·배포는 하지 않았다.

## 재생 계약

| 항목 | 현행 값 / 적용 위치 |
|---|---|
| 위치 | `index.html` 세계관 시네마틱. `game.html` 전쟁 복수 서사는 변경 없음 |
| 흐름 | 기존 ENTER → `video/intro.mp4` 문 열림 → `startWorldIntro()` → v13 전체 영상 → 기존 로그인/로비 라우팅 |
| 게임 에셋 | `video/world_intro_v13_exodus_en.mp4`, 32,381,760바이트 |
| 보존 원본 | `output/cinematic/world_intro_auto_v3_en_ko.mp4` 및 `video/world_intro_v3_en_ko.mp4` 유지. v4·v5는 별도 파일 |
| 규격 | H.264 + AAC, 1280×720, 24fps, 2719프레임, 컨테이너 113.292초 / 브라우저 비디오 duration 113.291667초 |
| 음성·자막 | ElevenLabs 영어 음성 193단어, 28언어 × 32큐 네이티브 선택형 자막. 기존 `introVoice` 별도 재생 금지 |
| 타이틀 | 109.291667~113.291667초, 기존 img/logo_exoduser.png 단독 중앙 배치, HELL ROAD 없음. 109.6~111.1초는 마지막 자막과 동시 표시, 이후 자막 없이 로고만 유지. 0.75초 등장·3.6초부터 0.4초 소멸 |
| 화면 | `#worldIntroVideo`, contain, z-index 21, preload none. 기존 정지 이미지 자막·레터박스·불씨는 숨김. cinLang은 표시, 네이티브 TextTrack으로 선택 언어만 표시 |
| 이전 구현 | `CIN_LINES`, 정지 이미지 DOM·원본은 보존. 문 이후 `showLine(0)` 호출 및 사용하지 않는 18장 지연 프리로드는 중지 |
| 번역 범위 | 이 영상은 EN 보이스 고정 / 28언어 선택형 자막. 기존 28언어 CIN_LINES는 보존 자료이며 영상의 실시간 번역/자막으로 사용하지 않음. 로비·게임 번역은 유지 |
| 플레이어 | `world-intro-player.js`, `WorldIntroPlayer.create`, `start/stop/next/toggle/setVolumes` |
| Steam 음성 디코딩 (2026-09-09) | 기본 NW.js 0.111.2에서 AAC 무음 재현. 같은 버전 `vendor/nwjs-ffmpeg/0.111.2/ffmpeg.dll`을 빌드에 포함하여 복구, 영상/보이스 원본 변경 없음. 실제 AAC 디코딩·WebAudio 신호 검증과 배포 상태는 [Steam 기록](../13출시·마케팅/STEAM_LATEST_DEPLOY_20260909.md) 참조 |
| 백업 | `output/cinematic/index_before_world_intro_v3_20260907.html` |

## BGM / 조작

| 항목 | 수치·동작 |
|---|---|
| 기존 트랙 풀 | `bgm/cutscene/prologue_theme.mp3`, `prologue_theme_abyssal_fracture.mp3`, `prologue_theme_rebirth_gate_1.mp3`, `prologue_theme_rebirth_gate_2.mp3` 중 1곡 랜덤 |
| 문 열림 | 기존 ENTER 제스처에서 BGM 시작, 기존 gain 0.6 유지 |
| 본편 믹스 초기값 | 영상/내레이션 gain 1.0(100%). BGM은 문 열림의 재생 위치·gain 0.6을 그대로 인계하고, 본편 첫 playing에서 1000ms 동안 gain 0.22(22%)로 선형 감소(50ms 간격, Date.now 경과시간 기준). 최종 믹스 승인 아님 |
| 믹서 | `?cinematic=1`에서 VOICE/BGM 각각 0~100, step 1. 컨트롤러 gain은 유한수만 0~1 clamp. 재진입 시 100/22로 초기화, 저장 없음 |
| 연속 재생 | 문 열림 때 시작한 같은 Audio 객체·곡·currentTime을 유지. 본편 start에서 pause/seek/재시작 금지. 영상 초기 로딩·waiting·seeking 및 컷 넘김에도 BGM은 계속 진행 |
| 루프·시계 | music.loop=true, 음악은 독립 시계·속도로 재생. 영상 시각으로 음악을 되감거나 건너뛰지 않음. 기존 0초 초기화·modulo 시각 동기화·0.25초 오차 보정은 제거 |
| 사용자 정지·재개 | 영상 pause(일시정지 버튼 포함)는 BGM도 pause. playing/seeked 및 재시도에서 음악이 paused일 때만 play, 기존 음악 위치 보존 |
| 페이드 수명 | `fadeTimer`/`mixStarted`로 시작 페이드 1회. 사용자 BGM 조절 시 페이드를 취소하고 선택값 즉시 적용. stop/이탈에서도 타이머 해제. 초기 UI 라벨 갱신은 setVolumes를 호출하지 않음 |
| 컷 넘기기 | 화면 클릭 / Enter / Space / 패드 A·X·Y → 아래 CUTS의 다음 시작점. 마지막 컷에서 다음 입력은 종료. 키 반복·입력 컨트롤 조작은 컷 넘김 제외 |
| 전체 스킵 | 기존 ESC/Space 또는 패드 B/Start 5000ms 홀드 유지 |
| 완료·이탈 | 자연 종료, 전체 스킵, 재진입, 로그인/로비 전환에서 영상·BGM pause 및 이벤트 정리. 로비 BGM과 동시 재생하지 않음 |
| 실패 | 영상 실패/음악 자동재생 차단 메시지 + 재생/재시도 버튼. 미디어 오류 시 load 재시도, 음악 차단은 재생 중인 영화 시각을 유지해 재시도 |
| 일반 감상 | 믹서 기본 숨김. 오류/일시정지 시 재생 버튼만 표시. 미리보기에서만 믹서 상시 표시 |
| 미리보기 | `http://127.0.0.1:3333/?cinematic=1`; 스플래시·로그인·이미 봄 게이트를 우회하여 ENTER 표시. 계정/로컬 시청 완료 플래그를 기록하지 않음 |
| 정상 진입 | 기존 `_cinSeenChk()` 및 `_cinSeenSet()` 계정 시청 기록 유지. 미리보기 외 게임 저장 구조 변경 없음 |

## 컷 경계 — 초

| 컷 | 시작 |
|---|---:|
| A01 | 0 |
| A02 | 4.041667 |
| A02 지옥문 — “잔혹하게도” | 12.75 |
| A03 | 17.291667 |
| A04 | 27.791667 |
| A05 | 46.291667 |
| A06 | 56.291667 |
| A07 | 69.291667 |
| B01 v2 | 76.291667 |
| B02 | 78.041667 |
| B03 v2 | 80.291667 |
| B04 v4 11A — 초능력자 대 악마 | 84.791667 |
| B04 v4 11B — 대마법사 대 악마 | 87.791667 |
| C12 | 90.791667 |
| C13 | 95.791667 |
| C14 | 102.791667 |
| EXODUSER 단독 타이틀 | 109.291667 |

`next()`는 현재 시각 + 0.05초보다 큰 첫 경계로 이동한다. B01/B02는 “지옥은 시대를 묻지 않는다” 음성과 자막이 이어지는 v3 편집 그대로다. 이전 117.292초 합본·폐기 컷은 런타임에 넣지 않는다.

## 검증

### 종료 후 로고 재등장 진단 (2026-09-07)

사용자 질문 “왜 끝나고 로고가 두번나오냐”로 원인을 재현했고, 후속 “저것도 정리하고”에 따라 로그인 전환을 수정했다. 영상 파일은 변경하지 않았다.

| 항목 | 확인 결과 |
|---|---|
| 첫 로고 | MP4 마지막 109.291667~113.291667초 EXODUSER 타이틀 |
| 종료 경로 | WorldIntroPlayer ended → finishCin 또는 홀드 스킵 skipToGate → 비로그인 및 demo/test 로그인 분기는 _goLogin({fromCinematic:true}) → loginSection 표시. 계정/오프라인 로비 분기는 _goLobby({fromCinematic:true}) |
| 원인 이력 | index.html loginSection 내부 img/logo_exoduser.png가 다시 나타났음. 영화 재재생이 아니라 로그인 UI의 같은 로고 |
| 수정 | _goLogin({fromCinematic=false}={})가 mainWrap의 cinematic-handoff 클래스를 toggle. true일 때만 #mainWrap.cinematic-handoff #loginSection .login-brand {display:none} 적용. 로고 부모에 login-brand 클래스만 추가하며 DOM 제거 없음 |
| 일반 진입 | 인수 없는 _goLogin은 false로 복원해 기존 로그인 로고 표시. _goCinematic은 show/cinematic-handoff 클래스를 함께 제거. 홀드 스킵도 자연 종료와 동일하게 fromCinematic:true 전달 (2026-09-08) |
| 재현 이력 | 수정 전 tmp/probe_world_intro_logo_handoff.py: ended 1회, 이후 movieHidden=true / chapterGate display=none / loginSection display=flex / 보이는 로고 이미지 1개 |
| 증빙 | output/cinematic/diag_logo_movie.png / diag_logo_after_movie.png. 이전 검수는 종료·미디어 정리까지만 검사해 로그인 로고와의 시각적 반복을 놓침 |
| 유지 | 영상 마지막 장면·4초 로고·로그인 프레임·Google/오프라인 입장 버튼·언어 선택·계정 처리 유지. 원본 영상·BGM 파일 수정 없음 |
| 회귀 | test/worldIntroHandoff.test.js의 2개 RED 확인 후 GREEN. tmp/probe_world_intro_logo_handoff.py PASS: ended 1회, 영화 숨김, 로그인 표시, chapterGate 없음, 노출 로고 0개. 일반 _goLogin() 로고 복원·Google/오프라인 버튼 표시 확인 |
| 수정 증빙 | output/cinematic/verified_logo_movie.png / verified_login_after_movie.png. 후자는 로그인 프레임과 입장 버튼만 표시하며 로고 없음, 직접 화면 확인 |

### 온라인 로비 로딩 로고 중복 수정 (2026-09-08)

| 항목 | 현행 동작 |
|---|---|
| 추가 원인 | 로그인 상태의 finishCin → _goLobby → showLobby → showLoading에서 #chapterGate의 전체 화면 img/logo_exoduser.png를 다시 표시. 기존 로그인 화면 로고 숨김만으로는 이 경로를 해결하지 못했음 |
| 전환 인수 | _goLobby({fromCinematic=false}={}) → showLobby({fromCinematic=false}={})로 fromCinematic 전달. finishCin·skipToGate의 로비 분기는 true |
| 인트로 직후 | showLobby의 fromCinematic=true이면 showLoading 호출 생략. 로비를 즉시 표시하고 loadCharacters의 기존 목록 내 불러오는 중 문구로 대기. 영상 마지막 4초 로고 이후 전체 화면 로고 재등장 없음 |
| 일반 로딩 | fromCinematic 기본값 false. 일반 로그인·로비 진입·게임 입장의 showLoading 로고 유지. 로비 헤더의 작은 브랜드 이미지는 유지 |
| 홀드 스킵 | skipToGate의 로그인 분기에도 fromCinematic:true를 전달해 .login-brand 재등장 방지 |
| 브라우저 회귀 | test/worldIntroSingleLogo.browser.py PASS. 별도 Chromium·가상 계정·지연된 캐릭터 응답으로 자연 종료 중 로고 중복 RED 확인 후 수정 GREEN. 온라인/로그인 스킵, 일반 로그인·로딩 로고 보존 PASS, pageerror 0. 실제 계정/저장 데이터 접근 없음 |
| 증빙 | output/cinematic/single_logo_lobby_handoff_20260908.png |

| 검사 | 결과 |
|---|---|
| 단위 테스트 | 플레이어12 + 자막10 + 캐릭터자막2 + 로그인전환2 = 26 PASS. BGM 연속·종료·믹스, v13 영상·컷 경계, 자막 스타일·언어·시각, 중복 로고 제어 검사 |
| 구문 | 2026-09-08 index.html 비어 있지 않은 인라인 스크립트 4개 파싱 PASS |
| 로컬 서비스 | Node `server.cjs` 3333, MP4 `video/world_intro_v13_exodus_en.mp4`, 32,381,760바이트 |
| 실제 브라우저 | `tmp/verify_world_intro_ingame.py`: 별도 headless Chromium의 실제 영상/음악 디코딩·재생, 기본 믹스, 정지/재개, 슬라이더, B01/B02 넘기기, 로고, 자연 종료, 재진입, ESC 스킵, 미리보기 시청 플래그 미기록 PASS. pageerror 0 |
| 연속 BGM 회귀 검증 | v12 동일 스크립트 재검증 PASS. 문 열림부터 본편 1.3초까지 같은 Audio 유지, BGM pause 0회 / seeking 0회 / 음악 시각 역행 0회, 0.6~0.22 중간 볼륨 표본 확인. 본편 1.327481초에서 음악 9.427483초로 문 열림분을 유지. B01/B02·B04 컷 넘김에도 BGM pause/seeking 0회. pageerror 0 |
| 표본 | output/cinematic/world_intro_v12_we_call_ingame.png / world_intro_v12_final_line_ingame.png / world_intro_v12_title_ingame.png / world_intro_v12_mage_fire_ingame.png |
| 한계 | 연결 브라우저 백엔드가 없어 별도 테스트 브라우저로 검증. 실제 스피커 전 구간 청취·음악 선곡/밸런스 최종 승인은 사용자가 확인 |

오디오 시스템 스킬을 따라 영상 내 내레이션과 기존 BGM을 분리하고 종료 수명주기를 함께 관리한다. 후속 사용자 요청 “문이열리면서 BGM 나오고 이어져야지 왜 또 끈키냐”에 따라 BGM은 영화 시계가 아닌 전체 시네마틱의 연속 배경음으로 정정했다. 자동 정지·0초 재시작·컷 seek에 따른 음악 점프를 제거하고 본편 진입은 볼륨만 부드럽게 낮춘다. 현재 스크립트 캐시 키는 `20260907-v12-fullscene-newvoice`이며 연속 BGM 수정도 포함한다. 헤드리스 테스트는 사용자 계정·세이브에 접근하지 않는다.
