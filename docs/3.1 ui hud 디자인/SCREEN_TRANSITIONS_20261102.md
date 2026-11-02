# 화면 전환·로딩 연출 — 2026-11-02 현행 계약

담당 codex-transitions. 승인 브리프 transitions-brief.md와 11-02 22:20 반려와 23:40 3차 CTO 가독성 재작업을 적용한다. 게이트·시작 메뉴 원화와 기존 인장을 재사용한다. 신규 아트·번역 원문·유료 생성은 없다. 기존 ‘불러오는 중...’ 28언어 번역을 긴 대기에 재사용한다. 아래 값이 과거 1200ms 입장 타이머·5000ms 스테이지 대기를 대체한다.

| 항목 / id | 현행 값·순서 |
|---|---|
| 모듈 | screen-transition.js / screen-transition.css. 두 HTML head의 동일 인라인 critical CSS·bootstrap이 #screenTransition·#screenLoadingSigil·#screenLoadingLabel을 documentElement에 먼저 생성. 외부 모듈보다 먼저 표시 가능. tools/build-screen-transition-inline.cjs로 동시 재생성. Steam FILES 등록 유지 |
| 검정 경계 | fixed inset:0, z-index2147483647, #000. html/body 첫 인라인 CSS도 #000. 원래 화면을 남겨 둔 채 fadeOut 완료→화면 교체·준비→두 rAF→fadeIn |
| 기본 시간 | fadeOut500ms / fadeIn600ms, ease-in-out. withLoading(work 또는 promise)는 중복 실행을 하나로 합치고 finally에서 입력·로딩을 복구. navigate는 페이지 교체까지 검정을 유지 |
| 기다림 표시 | fadeOut 시작부터 fadeIn 종료까지 같은 시계. 300ms 후 인장, 1000ms 후 작은 ‘불러오는 중...’. CSS 지연 애니메이션으로 JS 준비 중에도 노출하고 JS 상태 타이머 병행. 빠른 경계는 종료 시 취소. 준비 완료 시 인장을 먼저 끄지 않음. game 첫 그림 디코딩 후 keepLoading:true로 로딩 그림 위에도 유지 |
| 인장 원화 | 승인 JPG2560×1440의 x520..2039/y0..1439를 추출한 img/ui/silver_hell/gate_sigil_loading.png(1520×1520 RGBA), y40 중앙. 원본 JPG byte 보존. alpha는 원본 최대RGB3 이하0·3..12 smoothstep·12 이상255, 테두리0. RGB 공통 배율 pow(maxRGB/255,.65)×255/maxRGB로 색조·채도 유지하며 명도 상승. 기존 사슬·가시·철 relief의 ±3px 명도차8 초과 부분만 최대.14 뼈색(#dfd6c2) 하이라이트, 원본 붉은 부위는 제외. tools/build-loading-sigil.cjs로 재현. 12vh 정사각형·contain·우/아래 max(48px,4.5vh). 본체 opacity1 고정, brightness/contrast/screen 없음. embers는 원본 R-max(G,B)-3 양수 균열/눈만, 2초 opacity.12→.75→.12·붉은 shadow2px. 후광은 인장 뒤 1.4배 지름(inset -20%) radial gradient·2초 opacity.25→.4→.25. 첫HTML에 두 레이어256² lossless WebP 내장. 회전·바 없음 |
| 긴 대기 문구 | 기존 ‘불러오는 중...’ 원문·KO+28언어 번역을 첫 HTML에 함께 내장. 1000ms 지연, 뼈색 #dfd6c2·12px var(--font-hell,'Nanum Myeongjo',serif), 우측 max(48px,4.5vh)·하단 max(24px,2vh)·opacity.8. 기존 언어 저장값 hellLang 및 이후 _TL/_T 사용. 새 원문 ID 없음 |
| 움직임 줄이기 | prefers-reduced-motion:reduce, 기존 저장 opt.reduceMotion, 메뉴 exoduser_menu_reduce_motion=1 또는 ScreenTransition.reduceMotion=true는 페이드80ms·인장 본체 opacity1·균열/후광 animation:none/opacity.3. 별도 새 설정을 만들지 않음 |
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

제작 전 직접 확인: 승인 gate_sigil 원본2560×1440 대조, 실제1920 게이트·시작 메뉴·세계관·캐릭터 선택·게임 로딩. 목표 차이는 원본 화면 제거가 페이드보다 먼저 일어나는 컷과 페이지 간 공백이다. 제작법은 원본을 검정 뒤에서 교체하는 단일 최상단 레이어다. 조기 판정은 실제 모듈의80ms/500ms 준비·중복·reject 복구 및 실제 생성 영상 흐름이며, 틈·흰 프레임·검정 고착·중복 저장/경험치 차감이면 FAIL이다.

최신 23:40 인장 재검수는 I:/EXODUSER-Storage/codex-takeover/transitions/r4/REVIEW.html·measurement.json·before-after-1x.png·result-3x.png 및 REPORT.md를 따른다. r3 인장 PASS는 3차 CTO의 어두움 지적으로 철회했다. 이전 기능 측정은 r2/영상_측정표.md에 보존한다. 기존 after 영상은 CTO 반려 전 기준으로 보존한다. headless --mute-audio, 격리 서버3462·전용 saves, 게임 음량0. 끝부분 seek·사망/클리어 상태 fixture는 행별 표시한다. 무음 영상·gain 검사와 실제 청취는 별도이며 Unity는 unity-parity-1102-brief.md 인계 대상이다.

## 이전 제작자 검수 범위 — 22:20 CTO 반려로 인장 판정 철회

- 최종 실제 Chromium 계약13/13: 짧은/긴 대기, 중복1회, reject 복구, 늦은 이동 취소, 실제 입력 복구, 감소 모션·정지 인장,1920/2560/3840 전체 cover, 기존 오디오 gain0→1.
- 실제 영상4/4: 세계관 자연 끝과 이야기 자연 끝에서 제거 시 opacity1, 실제 Space 홀드, 이야기 파일 오류 후 생성 슬롯 game 진입. pageerror0.
-1920/3840의10경계 전후 녹화와 실제 재시작에서 각각HP577/577·544/544, G.on=true·death=false·복귀 busy=false. 스테이지/사망은 fixture이며 자연 전 구간 완주로 확대하지 않는다.
- 프로젝트113/113·오디오/공통 모듈18/18·guard PASS. 중간 VM 회귀는148/154였으며 남은6의환경 호환을 수정한 뒤 같은 명령 반복 대신 실제 브라우저 방법으로 검수했다. 전체154/154 최종 PASS나 실제 청취 PASS를 주장하지 않는다.
- 최신 main의 대기 원화·웹3D 개선은 정상 병합했다. 실제 검수4384d564b0와 병합본의 stage/boot/retry/lobby 전환5함수는 byte 동일하다(merged-transition-equivalence.json). 기존 원화의 전체 품질 판정과 이번 전환 경계 판정을 구분한다.
- 이전 공통 전환 경계·전체 cover·재시작 복구 PASS를 인장 가시성 PASS로 확대하지 않는다. 22:20 CTO는 이야기→게임1.2초·복귀1.1초·스테이지0.6초 검정에서 인장 밝기0을 확인해 FAIL 판정했다. 최신 결과는 r2 영상 화소 측정으로 교체한다. 실제 청취·NW.js 설치본·물리32:9모니터·Unity Player는 미검증이다.

## 11-02 CTO 반려 수정 재검수

실제1920/3840 각10종, 전후40편×10초를 raw 영상의 실제 프레임에 맞춰 추출했다. 검정300ms 초과 20구간에서 인장 237/237 검정 표본 노출(100ms 간격), 수정20/20 PASS·흰 전체 화면 표본0. DOM flag 대신 왼쪽70% 배경과 우하단66×66 인장 화소를 측정했다. 이야기→게임 검정1600/2000ms, 게임→로비1400/1500ms에도 모든 검정 표본에서 인장이 보인다. 긴 구간의 시간 감소를 주장하지 않으며 1000ms 이후 작은 기존28언어 로딩 문구로 대기를 알린다. r2/영상_측정표.md·measurement.json·clips-aligned/·comparison.png가 근거다. 두 해상도 녹화의 런타임4파일 SHA256은 후보5eb0034d20과 동일하다. 브라우저 계약13·가시성/외부파일 차단 회귀·미디어4·관련회귀26·프로젝트113·guard PASS. 인장 원본 대비 우하단1x 비교는 제작자가 직접 확인하며 독립 CTO 판정·청취·NW.js·물리32:9·Unity Player는 별도다.

## 23시 CTO 인장 RETOUCH 재작업

기존 6vh JPG·brightness4·전체 opacity 호흡을 폐기하고 승인 흑철 원색의 투명 PNG·붉은 균열 전용 호흡으로 교체했다. 검정→알파만 처리하며 원본 JPG는 byte 그대로 보존한다. 조기 실물 판정은 실제1920 화면의 인장3x·원본동일크기 비교다. 사슬·가시·눈 유실, 사각형 경계 또는 잔점이면 FAIL이다. 전체 인장/사슬/눈/가시3x 크롭은 외부r3 폴더에 보존한다. 첫HTML의 loading 상태에는 지연 애니메이션 대신 즉시 opacity1을 적용해 페이지 경계의 첫 프레임을 보장한다. 감소모션에서는 본체.65·균열.3 정지다. 기존300/1000ms·500/600ms·번역29종·오디오 계약은 보존한다.

23시 재작업 검수:1920/3840 각10종20편·22검정구간·244/244표본 인장 노출,흰 전체화면 표본0(100ms표본,60fps 전수검사 아님). 실제 첫HTML 외부JS/CSS차단·브라우저 계약13·프로젝트113·guard PASS,빠른 경계191.7ms 인장 미노출. 원본1520²RGBA 테두리alpha0, 실제1x/3x 사슬·가시·눈·균열 확인·사각경계/잔점 관찰0. 기본webm 압축잡티는 runtime PNG와 구분하며 별도PNG→VP9 lossless 4:4:4 호흡영상2편(대기상태 fixture·6fps)을 병기한다. 당시 제작자 인장 PASS는 23:40 CTO 반려로 철회. 독립CTO·Unity Player·실청취·설치본/물리32:9·자연 전구간 완주는 미검증. main/3333/DEMO·EA 최종 전달·전편재생은 외부REPORT.md 영수증을 따른다.

23:40 3차 검수:1920/3840 각10종20편·검정24구간 인장204/204표본·전체 흰 화면 표본0(100ms 표본). 실제1920 1x에서 사슬·눈·가시·붉은 기운 확인,3x 인장 범위 잔점·사각 경계 관찰0. 같은130px 파생PNG 평균 최대RGB7.86→16.27,밝기40 이상 화소1023→3048. 외부JS/CSS차단 첫HTML·계약13·프로젝트113·guard PASS. 빠른 경계189.7ms 인장 미노출. PNG 실측시각 복원 무음VP9 lossless4:4:4 호흡영상2편 별도. 제작자 가독성 VISUAL PASS,독립CTO·실청취·Unity Player·NW.js·물리32:9·자연 완주는 미검증. 최종 반영/재생/실행본 영수증은 외부r4/REPORT.md.
