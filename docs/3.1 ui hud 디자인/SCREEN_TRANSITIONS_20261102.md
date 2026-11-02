# 화면 전환·로딩 연출 — 2026-11-02 현행 계약

담당 codex-transitions. 승인 브리프 transitions-brief.md와 11-02 22:20 CTO 반려를 적용한다. 게이트·시작 메뉴 원화와 기존 인장을 재사용한다. 신규 아트·번역 원문·유료 생성은 없다. 기존 ‘불러오는 중...’ 28언어 번역을 긴 대기에 재사용한다. 아래 값이 과거 1200ms 입장 타이머·5000ms 스테이지 대기를 대체한다.

| 항목 / id | 현행 값·순서 |
|---|---|
| 모듈 | screen-transition.js / screen-transition.css. 두 HTML head의 동일 인라인 critical CSS·bootstrap이 #screenTransition·#screenLoadingSigil·#screenLoadingLabel을 documentElement에 먼저 생성. 외부 모듈보다 먼저 표시 가능. tools/build-screen-transition-inline.cjs로 동시 재생성. Steam FILES 등록 유지 |
| 검정 경계 | fixed inset:0, z-index2147483647, #000. html/body 첫 인라인 CSS도 #000. 원래 화면을 남겨 둔 채 fadeOut 완료→화면 교체·준비→두 rAF→fadeIn |
| 기본 시간 | fadeOut500ms / fadeIn600ms, ease-in-out. withLoading(work 또는 promise)는 중복 실행을 하나로 합치고 finally에서 입력·로딩을 복구. navigate는 페이지 교체까지 검정을 유지 |
| 기다림 표시 | fadeOut 시작부터 fadeIn 종료까지 같은 시계. 300ms 후 인장, 1000ms 후 작은 ‘불러오는 중...’. CSS 지연 애니메이션으로 JS 준비 중에도 노출하고 JS 상태 타이머 병행. 빠른 경계는 종료 시 취소. 준비 완료 시 인장을 먼저 끄지 않음. game 첫 그림 디코딩 후 keepLoading:true로 로딩 그림 위에도 유지 |
| 인장 원화 | img/ui/silver_hell/gate_sigil_20261028.jpg를 높이128px WebP lossless 축소해 첫 HTML data URL에 내장(외부 이미지 요청 불필요). 6vh 정사각형, center/auto 100%, 오른쪽·아래 max(48px,4.5vh), 2초 opacity.35→.9→.35, brightness(4)·붉은 drop-shadow(0 0 5px rgba(145,22,15,.28)), screen 합성. 원본의 어두운 문양을 crush하던 contrast(1.5) 제거. 새 그림·회전·바 없음 |
| 긴 대기 문구 | 기존 ‘불러오는 중...’ 원문·KO+28언어 번역을 첫 HTML에 함께 내장. 1000ms 지연, 뼈색 #dfd6c2·12px var(--font-hell,'Nanum Myeongjo',serif), 우측 max(48px,4.5vh)·하단 max(24px,2vh)·opacity.8. 기존 언어 저장값 hellLang 및 이후 _TL/_T 사용. 새 원문 ID 없음 |
| 움직임 줄이기 | prefers-reduced-motion:reduce, 기존 저장 opt.reduceMotion, 메뉴 exoduser_menu_reduce_motion=1 또는 ScreenTransition.reduceMotion=true는 페이드80ms·인장 animation:none/opacity.65. 별도 새 설정을 만들지 않음 |
| 페이지 인계 | navigate가 sessionStorage exoduser:screen-transfer:v1에 fadeOut부터 유지한 시각을 기록. 다음 HTML head bootstrap이 body·외부 CSS/JS 이전에 검정·같은 위치 인장·남은300/1000ms 지연을 복원. 15000ms 초과·미래 마커 폐기, BFCache pageshow 복귀 시 해제 |
| 영상 시작 | videoReady는 loadeddata/readyState≥2와 가능한 requestVideoFrameCallback을 기다림. 12000ms 디코딩 실패는 기존 재시도·스킵 UI로 복귀. 원본 영상·자막·cue·홀드 시간은 보존 |
| 영상 종료 | 끝.6초 이내에서 fadeOut 시작. 스킵도 같은500ms 검정 경계를 거친 뒤 video.pause/src 해제·DOM 제거. 이야기 자체 opacity 페이드는600ms, 기존 오디오 첫450ms 상승은 보존 |
| 오디오 | DecisionSound의 기존 media gain에 transitionGain×decisionGain을 적용. fadeOut→0/fadeIn→1을 같은 시간으로 ramp, 결정음 −6dB duck과 곱하며 duck 복귀가 진행 중 전환 envelope를 덮어쓰지 않음. 로비·세계관BGM·영상·기존 게임BGM, game 앰비언스 기존 gain 노드 사용. 새 AudioContext/재생 경로 없음 |
| 중복·취소 | whenIdle은 이야기 완료/실패 뒤 남아 있는 첫-frame 전환을 기다림. 전환 Promise 동안 click/pointerdown/keydown을 흡수, 평소 입력 지연·가로막는 레이어 없음. showCharGate는 기존 _characterLoadSeq를 시작과 실제 이동 직전 모두 대조. 취소 시 검정 해제, 중복 이동·중복 EXP 손실 방지 |
| 스테이지 | 승인 랜덤 로딩 원화 선택→decode→표시→기존 nextStage 콜백→두 rAF→검정 아래 원화 숨김. 고정5000ms·900ms 타이머 제거. 기존35장/와이드 선택·진행 선은 보존 |
| 부트 | 기존 에셋/맵 준비를 유지하고 stRndImg가 준비될 때 검정→로딩 그림, 기존100%/hideBootLoading에서 로딩 그림→게임을 같은 모듈로 처리 |
| 소환굴·균열 | 현행 웹은 같은 맵의 적 생성 구조(소환굴 근접·균열 spawn). 별도 입장·퇴장 페이지/화면 없음. 새로운 게임 규칙·이동 화면을 만들지 않음 |

| 전환 | 연결점 |
|---|---|
| 시작 메뉴→게이트 | endSplash가 원래 TitleSignboard를 검정 완료 뒤 해제 |
| 게이트→세계관 | startWorldIntro / WorldIntroPlayer. 기존 ENTER 결정음1100ms 선행 유지 |
| 세계관 끝·스킵→시작 경로 | finishCin에서 검정 완료 뒤 정리, _goLogin/_goLobby가 기존 빌드·계정 분기를 유지 |
| 메뉴→로비→선택·이름 | _goLogin/_goLobby/_goCinematic/openVisualSelect/_visualConfirm/선택취소. 초기 splash 아래의 상태 준비는 중복 전환 없이 유지 |
| 생성→이야기→게임 | 생성 성공 후 기존 ExoduserCharacterStory.play, story 결과 후 같은 캐릭터 showCharGate. 기존 실제 경로는 이야기를 마친 뒤 게임 진입이며 새로 로비를 강제 삽입하지 않음 |
| 로비→게임 / 게임→로비 | showCharGate / goToLobby와 기존 이동 대입 세 곳. 기존 slot/char/demo/story/ddung query 보존 |
| 스테이지·클리어 다음 / 사망재시작 | showStageTransition / retryBtn. 전투·보상·저장 본문은 기존 함수 유지 |

제작 전 직접 확인: 승인 gate_sigil 원본512×512 대조, 실제1920 게이트·시작 메뉴·세계관·캐릭터 선택·게임 로딩. 목표 차이는 원본 화면 제거가 페이드보다 먼저 일어나는 컷과 페이지 간 공백이다. 제작법은 원본을 검정 뒤에서 교체하는 단일 최상단 레이어다. 조기 판정은 실제 모듈의80ms/500ms 준비·중복·reject 복구 및 실제 생성 영상 흐름이며, 틈·흰 프레임·검정 고착·중복 저장/경험치 차감이면 FAIL이다.

최신 재검수는 I:/EXODUSER-Storage/codex-takeover/transitions/r2/영상_측정표.md·measurement.json·clips/ 및 REPORT.md를 따른다. 기존 after 영상은 CTO 반려 전 기준으로 보존한다. headless --mute-audio, 격리 서버3462·전용 saves, 게임 음량0. 끝부분 seek·사망/클리어 상태 fixture는 행별 표시한다. 무음 영상·gain 검사와 실제 청취는 별도이며 Unity는 unity-parity-1102-brief.md 인계 대상이다.

## 이전 제작자 검수 범위 — 22:20 CTO 반려로 인장 판정 철회

- 최종 실제 Chromium 계약13/13: 짧은/긴 대기, 중복1회, reject 복구, 늦은 이동 취소, 실제 입력 복구, 감소 모션·정지 인장,1920/2560/3840 전체 cover, 기존 오디오 gain0→1.
- 실제 영상4/4: 세계관 자연 끝과 이야기 자연 끝에서 제거 시 opacity1, 실제 Space 홀드, 이야기 파일 오류 후 생성 슬롯 game 진입. pageerror0.
-1920/3840의10경계 전후 녹화와 실제 재시작에서 각각HP577/577·544/544, G.on=true·death=false·복귀 busy=false. 스테이지/사망은 fixture이며 자연 전 구간 완주로 확대하지 않는다.
- 프로젝트113/113·오디오/공통 모듈18/18·guard PASS. 중간 VM 회귀는148/154였으며 남은6의환경 호환을 수정한 뒤 같은 명령 반복 대신 실제 브라우저 방법으로 검수했다. 전체154/154 최종 PASS나 실제 청취 PASS를 주장하지 않는다.
- 최신 main의 대기 원화·웹3D 개선은 정상 병합했다. 실제 검수4384d564b0와 병합본의 stage/boot/retry/lobby 전환5함수는 byte 동일하다(merged-transition-equivalence.json). 기존 원화의 전체 품질 판정과 이번 전환 경계 판정을 구분한다.
- 이전 공통 전환 경계·전체 cover·재시작 복구 PASS를 인장 가시성 PASS로 확대하지 않는다. 22:20 CTO는 이야기→게임1.2초·복귀1.1초·스테이지0.6초 검정에서 인장 밝기0을 확인해 FAIL 판정했다. 최신 결과는 r2 영상 화소 측정으로 교체한다. 실제 청취·NW.js 설치본·물리32:9모니터·Unity Player는 미검증이다.
