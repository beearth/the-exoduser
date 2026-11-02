# 5차 웹·Unity UX 동기화 — 진행 중

착수 Unity9694e3451c, 현재 고정 웹740722e1ac3a5f4b0143f55b6088b01b8517be0f.사용자 최신 지시로 origin/unity/main fetch 성공. 바탕화면 직접 교체0, 기존 guard.baseline WIP 보존. 공식 예약 unity-parity-1102-fifth, 앞 담당 순번 보존.

| 항목 | 현재 계약·검수 |
|---|---|
| 세계관 홀드 | 웹과 동일5초·Space/ESC, 패드B/Start 추가. FrontendPadPhase.WorldIntro=3, 진입/포커스/언어창 뒤 모든패드키 해제 fence. A는 다음cue |
| 캐릭터 영상 홀드 | 웹과 동일1.2초. 키보드/검수주입을 LobbyKeys 공용 경로로 읽고, 기존패드/포인터의 독립held-source 보존. 원본warrior_story.controls29언어를 읽어13px·자간.06em·우하단3%·gap22·진행2px/#ccb789, 힌트3초뒤.4초숨김 |
| 링 | 웹120×100·오른쪽/아래30px·반경34/두께3, 진행색#e4e1db·B홀드중Ⓑ |
| 호버 | 일반호버 두 경계35ms, 확인80ms·마지막항목지연/이탈취소·결정중복억제 보존 |
| UX표 | main 18f7a41a6의33화면×5구분165행 대조표. 전체 화면 동일 판정은 아직 없음 |
| 테스트 | 실제패드정책6PASS/4FAIL→10/0, 실제NativeUiSounds35.1ms실패→17/0. 경계double·순수C#이며 Player/청음 완료가 아님 |
| Player검수 | CinematicInputCheck는 명시적CLI+공식sandbox에서만 실행. InputSystem 가상키보드/패드→실제Update, Space/ESC/B/Start·부분홀드/해제/정상홀드·전투틱정지·PNG/영상 기록. OS입력/자연플레이와 구분. 2cb2a854 같은 공식 패키지에서1920/3840 각44검사 통과. 사용자 OS 입력과 구분 |

세부 영수증: I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/fifth。2~3항목마다 빌드(-remodel-scenes1)→같은패키지M1→1920/3840캡처→직접1x→정상merge/비강제push/원격ref확인. 未검수 결과를 PASS로 올리지 않는다.

전환 후속 기준 정정: 브리프 말미23:40 R4/웹740722e1a는 갱신PNG(gamma.65·얇은뼈색윤곽),12vh·기존우하단위치·후광1.4배/.25~.4/2초,감소 본체1/균열·후광.3정지다. 이전9.5vh R3는 현행값이 아니다. 후보pure flow20/0는 I:준비본이며 아직 런타임미반영.

입력 검수의 성공 영상은 frames.jsonl의 실제 캡처 시각·단계·페이지·진행률로 조립한다. 검수 장치만 매Update current로 고정하며 사용자 OS 키/포인터를 주입하거나 바꾸지 않는다.

Player 어셈블리 증거는 실제 로드 경로를 우선 사용하고, Unity 스트림 로드로 Location이 비면 같은 실행 패키지 Data/Managed의 같은 이름 DLL을 SHA-256으로 읽는다. 파일이 없으면 검수를 실패시키며 예전 산출물로 대체하지 않는다.

홀드 영상은 다음 fixture 페이지를 준비하기 전에 실제 완료 목적지를 기록한다. 세계관은 로비0.65초, 이야기는 기존1.2초 게이트가 스스로 진행하도록1.5초를 녹화하며, 검수기의 ShowLobby 호출로 성공 목적지를 대신하지 않는다.


## 2026-11-03 패키지 어셈블리 식별 보강

| 범위 | 실행 계약 | 검증 상태 |
|---|---|---|
| CinematicInputCheck·UiSoundCapture·Lobby 캡처 | Assembly.Location이 비면 실제 Player의 Application.dataPath/Managed/{assemblyName}.dll에서 SHA-256 계산. 파일이 없으면 예외로 실패하며 과거 DLL/빈 해시를 쓰지 않음 | 2cb2a854 같은 정식 패키지에서 실제 홀드88·일반UI소리477·로비소리425검사 통과 |
| 정식 빌드 | 첫 묶음 acd55c48 공식 빌드 성공. 공용 실행기를 사용하며 사용자 앱·타인 예약 종료0 | M1·양해상도 입력·UI/오디오 검수 완료, 후속 전체범위는 진행 중 |

## 2026-11-03 첫 공식 검수 묶음

| 단계 | 동일 패키지 증거·판정 |
|---|---|
| 소스·빌드 | 검수 입력2cb2a854015cff7335a27659fd74ca382342070b, run acd55c48, Unity6000.6.7f1/Win64/remodel-scenes1, Build Succeeded/errors0, USER_SAVE0. Editor 라이선스 토큰 갱신 진단은 있었으나 공식 빌드 성공과 구분 |
| M1 | run9d4d20b1,23/23 ok,firstBlocked빈값,32캡처. 이동·공격·구르기·패링·처치·보스·클리어·샌드박스 저장/이어하기. 다음1-2 미이식은 그대로 남음 |
| 실제 홀드 | e5ec2f48(1920×1080)/e36603d0(3840×1080), 각44/44. Space/Esc/B/Start×세계관/캐릭터, 부분홀드·해제0·전투틱정지·정상홀드. 세계관약5초/이야기1.2초 기준. 직접본 프레임00024/00029/00160/00163(1920),00028(3840). 세계관 완료 로비, 캐릭터 완료는 기존 startupLoading 경계까지 기록하며 같은 사례의최종1-1 도착으로 과장하지 않음 |
| 패키지 동일성 | 실제 Player가 읽은 Runtime51e441849b491b69c48245c5a18a8bab4ab796c4d927118ab467d249d903e6e7 / Corecf2b6cb6caee3ab29811d0c5b222622c76d572657f0771a1bceb42364906af7c, 실제 Data/Managed 파일 SHA와 일치 |
| UI | run21cdde43,1920/2560/3840×1080,76PNG,기능결과문자열14개·명시FAIL0. 미니스토리1920전사/3840실버테일 직접열람. KO외전언어·전5캐릭터전체의시각동일완료는 아님 |
| UI 소리 | d4ea0ca0 일반477/477·출력사건10, e41a455d 로비425/425·사건14, 같은 Runtime SHA. AudioRenderer 출력버퍼 WAV로 검사하며 사용자에게 소리 재생0 |
| 영상 | 실제 PNG+frames.jsonl 시각으로 무음 VP9 lossless/VFR 조립,1920은전체+8사례9clips. 원본보존. 캡처 IO가 포함된 VFR이며60fps 성능/자연손조작 증거가 아님 |
| 원본 보존 | 자기 공식 빌드 생성855파일은 전파일 SHA백업·HEAD입력 archive·원본변경없음 재확인 뒤 정확한855경로만복구·SHA대조. guard.baseline WIP와소유경계메모보존, 인덱스별도확인 |

증거 루트: I:/EXODUSER-Storage/codex-takeover/unity-parity-1102/fifth/{batch1-official-build-receipt.json,batch1-m1,batch1-cinematic-1920,batch1-cinematic-3840,batch1-ui,batch1-audio-ui,batch1-audio-lobby,batch1-video-1920,batch1-video-3840,batch1-generated-recovery}. 전체 시각/UX는 RETOUCH 유지. 화면전환·55스킬/32합체·패시브·요약drawer·살아있는화면·진짜1-2·세부획/광택이 남아 있다. I:후속 준비본은 실행 소스에 인수하지 않았다. 바탕화면 직접교체0, 자기 Editor/Player예약 반환.

추가 1x 대조: fifth/batch1-comparison.html(원본같은크기). 실제웹604d10bf는1920/3840의5캐릭터미니스토리10화면·오류/누락0. lore12.5px/1.7,분리선rgba(164,147,115,.5),문구일치 확인. 글꼴획·일부테두리차이는RETOUCH. 세계관 링의 영상 프레임은다른시점으로,전체영상품질동일판정이아님. first merge424afc4f79는origin09192f7bbc의검증된지면투영/실행기변경을정상병합했고통합Core/Runtime컴파일0;공식Player검수자체는2cb2a854패키지다.


## 2026-11-03 화면 전환 인수 — Player 검수 전

| 계약 | 현재 구현·한계 |
|---|---|
| 검정 경계 | fade-out500ms/fade-in600ms, CSS ease-in-out(.42,0,.58,1). 완전 검정 OnGUI Repaint를 기록한 다음 프레임에만 onBlack 실행. 준비 완료 연속2프레임 뒤 reveal, 준비 timeout12초/실패 시 해제 |
| 로딩 원화 | 웹740722e1ac의 gamma.65·뼈색 윤곽1520² RGBA 본체/붉은 균열 PNG 동일 byte. 300ms 뒤12vh, 우하단max(48px,4.5vh), 후광1.4배/.25~.4, 균열.12~.75,2초 왕복.1000ms 기존29언어 문구 |
| 감소 모션 | 저장 옵션/Windows SPI_CLIENTAREAANIMATION/CLI. fade각80ms, 본체1·균열/후광.3 정지. Mac OS 설정 연동은 미검증 |
| 오디오 | 원래 음악·영상·결정·앰비언스 gain에 경계 gain 곱, 원래 볼륨을 경계 종료 뒤 복원. 실제 출력 검수 대기 |
| ENTER | 기존 ENTER 원음 먼저 재생,1100ms 뒤 경계 시작. 인장·로고1.4초 ease 소멸, ENTER1.1초 ease 소멸/상단5.6px 이동. 감소에서는 ENTER 즉시 숨김. CSS12px blur는 아직 미반영 RETOUCH |
| 준비 중 진행 | StartupEntry.Tick은 black 중에도 계속 실행하고 사용자 입력만 차단. lobby-game/story-game은 Loading을 벗어나야 reveal |
| 검수 경계 | ScreenTransitionCheck는 CLI+샌드박스 전용 실제 Player 호스트·실제 영상 decoder 준비 검사. CinematicInputCheck는 모든 로비 경계를 기다린 뒤 기존 홀드 회귀. 컴파일은0이나 정식 빌드·M1·양해상도 캡처·시각/청음은 아직 대기 |

I:준비 중인 전체 스킬/패시브/대장간 소스는 이번 인수에 포함하지 않았다. 소유23코드와새원화/메타/문구만 정확한경로로복사,원본은transition-prep/adoption-backup에 SHA 백업했다. guard.baseline과기존미추적파일은보존한다.


## 두 번째 패키지 첫 검수 실패와 수정 — 재빌드 전

| 증거 | 원인·현재 조치 |
|---|---|
| build9922028a | Succeeded/errors0,6,610,053,276bytes,USER_SAVE0. 라이선스토큰갱신진단2는빌드결과와구분. M1은37d9427c의firstBlocked01,실패인데기존하네스가exit0반환했으므로미통과 |
| M1진입 | 기존M1이ShowLobby(.6초)→Open/Choose/Confirm을동일프레임에호출해500/600ms비동기경계를기다리지못함. 생성API별경계해제/실패를기다리고,firstBlocked가있으면이제exit2.전환을우회하지않음 |
| 실제전환4b4102f2 |34검사중타이밍2실패.첫요청이전unscaledDeltaTime까지합산하여실제fade-out.426초. 요청시각부터realtime차이로교체.감소준비검사는initial FDG splash-menu가끼어들어다른요청의.475초를측정했음.초기로비안정화후요청id로검사 |
| 직접캡처결함 | frame108은opacity1인데FDG화면이검정덮개위로그려짐. GUI.depth는현재GUIBehaviour정렬속성이라finally에서0으로돌리면덮개우선순위가사라짐.전환컴포넌트는-1000000을유지하고행렬/색/활성만복원.새QA는완전검정일때실제PNG중앙/상단3점RGB≤.02를검사해상태값만통과시키지않음 |
| 추가회귀 | 실제인수GateEnterDelay.cs를직접링크한v2테스트10/0. 오래된이웃Core를읽던원래하네스실패와구분. Core/Runtime수정본재컴파일/정식재빌드/새M1·양해상도Player는대기 |

Unity GUI.depth 계약: [공식API](https://docs.unity3d.com/ja/current/ScriptReference/GUI-depth.html). 첫실패영수증과이미지는삭제하거나성공으로대체하지않는다.


## 세 번째 패키지 실제 전환 통과·M1 검수 구조 후속

| 범위 | 근거·현재 상태 |
|---|---|
| 빌드3 | bfc14478/Succeeded/errors0/6,610,055,836bytes/USER_SAVE0. 입력757e572d6c |
| 전환 실제Player | c1caa235(1920)·26032854(3840) 각각36/36, 실제 완전검정 PNG19+25표본의3점RGB≤.02,결함0.검정Repaint→다음프레임교체·실제decoder·일반/감소·실제로비복귀검사. 첫1x169/51원본직접열람 |
| M1 | e26fd960은23단계중22ok. 초기신규진입/전투/클리어는진행하나14이어하기의ShowLobby(.3초)→Begin이비동기경계를기다리지못함. 두실패를보존하고하네스전체로비API를감사해이어하기도실제해제/복원까지대기하도록변경. M1통과로집계하지않음 |
| 종료코드 | NativeVideoQuitHelper가3프레임후Application.Quit()로0을다시요청하여실패코드를덮음. DeferredQuitIntent가비0실패를0으로지우지않게보존, M1·CinematicInputCheck·ScreenTransitionCheck는RequestQuit(code)사용. 정책0/1FAIL→4/0. 실제decoder활성상태에서의도적exit2를요청하는CLI검사추가;정상코드외전통합은대기 |
| 실제웹비교 | 8994ce65,고정740722e1·동일R4두PNG강제원문·1920/3840×일반/감소4화면,오류/누락0. body129.59375²/right48.59375/bottom48.59375. Native같은위치1x근접;폰트획전체판정은RETOUCH |
| R4시각후속 | 실제CSS data-screen-loading의animation-delay0에서원래pending시계맥동이이어짐.NativeElapsed-.3위상차를실측1.338265초/균열.599625/후광.364197로재현(2FAIL)→Elapsed기준2/0. 300ms는표시만지연.빠진drop-shadow(0 0 2px rgba143,19,12,.35)를물리픽셀기준캐시로구현,균열원본만CPU읽기가능.새Player검수대기 |
| 상태회귀 | 현재실제ScreenTransitionFlow.cs직접링크22/0,GateEnterDelay10/0,DeferredQuitIntent4/0,웹맥동2/0.정식새빌드4와같은패키지M1/양해상도캡처전 |

명시적QA인자: --unity-transition-exit-code-check는샌드박스·절대출력경로에서만실행하며decoder준비성공뒤기대exit2,준비실패는exit3이다. 일반게임경로에서실행되지않는다.

세번째패키지홀드추가: 1edf337b(1920)·bd8554c9(3840) 각각132/132·797/782프레임. Space/ESC/B/Start×2영상·부분/해제/홀드·매경계대기·실제준비/전투틱정지. 전환대기검사가추가되어첫44/44와검사수가다르며중복합산으로기능수를늘리지않는다.


## 네 번째 패키지 검수와 외장 디스크 캡처 정지 분리

| 범위 | 실제 근거·판정 |
|---|---|
| 정식/M1 | ac84527e 입력895e7dd8 Succeeded/errors0/6,610,058,572bytes/USER_SAVE0. cf4de8b2 M1 23/23·32PNG·firstBlocked빈값 |
| 실제전환 | d6b683e4(1920)·94be67a9(3840),각36/36.실제완전검정18+19표본/오염0. Runtime2e00dc29b99d05ad6ece5623ebef96d8128cfab1c3a6da066c1869bf414f9f53/Core9efc2ba7c876b8e9e19f698265dd1f89cf40383f87e29283602cdb4d7cfe338a 동일. 원본1x batch4-comparison.html·Native169/108열람. 전체RETOUCH 유지 |
| 실제홀드 | 9ebfa9bb1920 132/132·837프레임.7ab8dd8e3840은132중3FAIL·770프레임·exit2. worldSpace완료후다음ShowLobby준비16초검사초과/실패,worldEsc진행률1이나8초제한안에로비미도착. 실패를보존하며전체홀드재통과로세지않음 |
| 시간근거 | frames.jsonl 실제연속시각43.04367→59.84716,캡처간격16.80349초. ESC진행.973285(4.849s)→1(7.819s)에서2.969초간격. 동기PNG/파일쓰기경로가검사루프에서실행되어외장IO정지를기능타임아웃과혼합. 제품12초준비timeout/입력홀드수치는완화하지않음 |
| 검수기수정 | NativeQaCaptureWriter는워커한개·대기PNG최대4개·초과캡처skippedFrames기록,PNG성공후timeline순서기록,receipt최신값병합.모든UnityAPI/PNG인코딩은메인스레드,파일IO만워커.완료/예외때최대120초flush·IO오류는실패. 느린저장소fixture에서생산자비차단·순서3·최신100병합·오류전달통과. 실제Player새빌드대기 |
| 종료코드진단 | 6e24448a 실제decoderPrepared=true에서의도적expectedExit2,공식실제exit2/windows0/leftovers0/USER_SAVE0. runner ok=false는의도진단이며정상게임검수통과로세지않음. 실패코드를0으로덮지않음확인 |
| 보존 | 생성857정확경로모두SHA백업·원HEAD입력복원/해시검증,guard기존WIP보존. Desktop직접교체0. 원격d00cfd6f4 타격표현·도구변경을정상병합한뒤통합정식빌드재검수예정 |

NativeScreenTransition은준비timeout실패를빈error대신 prepare-timeout (12s)로기록한다. 유효한앞선단일범위검사는유지하되네번째패키지전체성공으로승격하지않는다.
