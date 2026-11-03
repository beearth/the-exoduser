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


## 다섯 번째 통합 패키지 — 검수기 IO 수정 실제 회귀 통과

| 범위 | 실제 증거·판정 |
|---|---|
| 입력소스/정식 | 164aea8648 캡처IO수정 후 공통d00cfd6f4 타격표현/도구59파일을정상병합한23e7227af553c149e7ad1b663c6323ddfbd6c1cf. 공식5375be9e/Succeeded/errors0/6,610,798,332bytes/USER_SAVE0 |
| 같은패키지M1 | c29a222c 공식slots3 exit0/windows0/leftovers0/USER_SAVE0. 실제23/23 ok/firstBlocked빈값/32PNG. 다음1-2는아직미이식 |
| 실제홀드1920 | b9bf0c9b/132/132,812PNG·대기열포화시190캡처생략을명시. Space/ESC/B/Start×세계관/캐릭터·부분/해제/전투틱정지·매경계준비 |
| 실제홀드3840 | bee559d8/132/132,608PNG·183생략. 이전7ab8dd8e의3실패지점모두통과. 파일IO는별도워커,새검수도검사/플레이성능60fps로확대하지않음 |
| 실제전환 | 3f2799811920/61bdc35e3840 각각36/36. 완전검정PNG17+17표본/3점배경오염0,Repaint다음프레임교체·실제decoder·준비/복귀·일반/감소계약통과 |
| 실제DLL | Runtime d9b413e1e688971b67a36f05accf501ef98ac632a16b37342dd9d25e6f25b32a / Core9efc2ba7c876b8e9e19f698265dd1f89cf40383f87e29283602cdb4d7cfe338a. 양해상도입력/전환4실행모두동일패키지 |
| 직접1x | 전환1920 frame167/3840 frame80,홀드1920 frames00066/00514·3840 frames00369를원본직접열람. batch5-comparison.html에웹8994ce65와같은크기배치. 인장위치/검정/붉은맥동근접. 전체RETOUCH: ENTER CSS12px blur·전체폰트획·아직미검증인전경계/실제전환오디오출력은후속 |
| 영상한계 | 세계관완료로비,캐릭터영상완료는Nemesis시작페이지까지기록. 같은사례의최종1-1도착으로세지않으며M1의별도1-1진입과구분. 프레임+실제시간jsonl보존,새Space무음VFR2클립/해상도조립은다른Player측정이끝난뒤실행대기. 기존첫묶음각9클립은유지 |
| 보존/실행기 | 자기생성857파일전부SHA백업/정확HEAD원본복원/해시검증,guard기존WIP보존. 공용실행기slots3업데이트때옛자기slots2대기PID67616/parent66480·자식0·자기Player미실행을확인후대기프로세스만재접속. 타프로세스/예약변경0,자기Editor/Player예약반납,Desktop직접교체0 |

전체5차는진행중이다. 이번영수증은전환기술·홀드회귀묶음이며55스킬/32합체/추천전체·조건부패시브·살아있는화면·요약drawer·진짜1-2·글꼴/구슬/핵/광택/리셋전체완료가아니다. I:스킬준비본은제품채택0,복구스냅샷106521b84f31e6d396660340ce7cf2356b61c532(287파일·Gitblob전부/원격ref대조)은미채택자료로만보존한다. 이후준비본의상태수학130곳·사냥꾼72조건·소리196조건교정은별도I후속이며이번패키지내용과혼합하지않는다.

## 11-03 05:10 CTO P0 — UI 겹침 회귀 우선 처리 (검수 중)

| 항목 | 수정 후보 계약 | 현재 증거 |
|---|---|---|
| 우선순위 | 147건→0 확인 후 unity/main 비강제 반영, 그 다음 5차 잔여 | 이전 09192f7의 1395장/147건 원본 보존. 새 후보 전체 검수 전 PASS 금지 |
| 스킬 이름 | 슬롯·제단 이름/레벨은 웹 CSS nowrap/overflow:hidden/text-overflow:ellipsis와 같은 지정 폭·행 높이 안에서 표시 | 웹3333 ko/de/fr ×1920/2560×1600 실물12장. 첫 browser7fdc5e0c는 오류0/창감지1 운영 FAIL, 재검수 중 |
| 스크롤 판 | 제품의 기존 논리 그룹/GUI.matrix는 유지하고 계측의 그룹 원점만 화면 배율로 보정 | 물리 그룹 후보는 중복 배율 시각 FAIL로 철회. 부모 화면원점−새 그룹 API원점 차이를 중첩 스택으로 기록. 새 Player 전 미검증, 분석기 제외/임계 완화0 |
| 제작 비용/확률 | 비용 y447.4/h20.4, 확률 y471.8/h20.4; 기존 h15/14,y465.4 수정. 그리드 y505.4 보존 | 실제 한 줄 높이+4px 간격. 금액·확률·동작 변경0 |
| 공용 실행기 | I:/EXODUSER-Storage/unity-jobs/bin/exo-unity.ps1만 실행. checkout 사본 위임, ui-overlap/check.ps1 절대 공용 경로 | 자기 evening/third 직접 호출39개 백업·SHA 후 치환. CTO45개와 수 차이는 정확 경로 재검색 필요 |

P0 산출 fifth/p0-overlap. Core/Runtime 독립 컴파일0, 정식 빌드/M1/전체0건/같은 언어1x/원격 반영은 아직 미검증. 바탕화면 직접 교체0.

### 05:35 KST 실행 경로 장애 — P0 완료 아님

- G: 소스/로컬 Git 조회 및 C: powershell.exe 바이너리 읽기는 정상. 메모리 여유 약16GiB/63.76GiB.
- I: 루트 stat·공용 bin/기존 작은 파일 읽기가 응답하지 않는다. PowerShell -NoProfile Get-Date/Console 조회, CMD type I:/.../COMMON_RULES.md와 Node fs가 각각 대기 상태다. CMD fsutil은 I: 고정 드라이브의 존재까지만 반환한다. 원인(장치/파일시스템/다른 I/O)은 미확정이다.
- browser7fdc5e0c는 웹3333 ko/de/fr 12PNG·페이지 오류0이나 창 감지1로 운영 FAIL. disable-software-rasterizer를 추가한 재검수8887, Editor 예약73798는 완료 응답 미확인. 정식 새 빌드 시작/슬롯 취득을 주장하지 않는다.
- 사용자의 I: 장치/복사 작업 여부를 비동기로 확인 요청. 다른 owner 예약·프로세스, 사용자 앱/세이브, 디스크 연결·복구 설정 변경0.
- 현재 후보는 Core/Runtime 독립 컴파일 exit0까지만 확인했다. P0 전체0건·정식 빌드/M1·unity/main 반영은 미완료. 5차 잔여로 우선순위를 넘기지 않는다.
- 외부 WIP tools/guard.baseline.json SHA256 9414ce48870885726bd4bd6db7df52d6d3ad8aa63edcb7f67c6cb3f63c4bb8ca를 보존하고 커밋 제외한다.

### 05:41 KST 복구 지점과 대기 작업 정리

| 구분 | 확인된 상태 |
|---|---|
| 로컬 P0 후보 | 0a864885b06043150de93ab2aa7185fc4b235e54, 코드/관련 문서 7파일만 커밋. guard WIP는 커밋 전후 SHA256 동일 |
| GitHub 복구본 | codex/backup-unity-parity-p0-20261103의 8a896bf32ce3993c881d2d658da292bbeac5913b. 연결된 GitHub 도구로 7개 Git blob 전부 일치, 전체 tree ab364963cd9d5c1456831b35cbe90d6fb1afd1c2 일치, 생성 ref 재조회 확인. 미검증 후보이며 통합/인도 PASS 아님 |
| 공통 원격 | 05:41 GitHub 직접 조회 unity/main=c741c11c27a76ae891cad7294adc24f28243314e. P0 후보 미반영 |
| 지연 지속 | I: 파일 읽기는 PowerShell/CMD/Node에서 대기. C:·G: 로컬 Git은 정상. 원인 확정/디스크 복구 조작0 |
| 자기 대기 정리 | WMI로 PID·부모·생성 시각·명령을 대조한 자기 fetch/push·PowerShell 진단·P0 예약 요청만 종료. Unity/Player 자식 없음 확인. 다른 owner/사용자 앱 종료0, 시스템 updater 보존 |
| 남은 확인 | 자기 browser-bdf5cd91의 node9984/Chrome55356·68364·59056/cmd60272 종료 요청은 WMI 반환2로 거부. 추가 권한 우회0, 종료/잔여0 주장 금지. I: 응답 복구 후 공용 bin에서 자기 P0 예약 취득 여부·브라우저 잔여를 먼저 조회해야 함 |
| 다음 게이트 | 공용 bin 정식 새 빌드→같은 패키지 M1→ko/de/fr/5해상도 전 화면 겹침0 및 3333 나란히1x→최신 unity/main 정상 merge·비강제 push·REPORT 갱신→5차 나머지. 현재는 전체 미완료 |

I:의 REPORT를 현재 갱신할 수 없어 이 문서에 실제 중단 지점을 남긴다. 바탕화면 직접 교체0, 세이브 변경0. 복구본은 이전 I: 스킬 준비물의 인수나 5차 잔여 완료를 뜻하지 않는다.


## 09시 재개 P0 첫 패키지와 전환 fixture 교정

I:·PowerShell이 정상 응답해 fetch/소유/공용slots3 상태를 재확인했다. 입력02cae3be32의 정식3afaeebb는errors0/6,610,799,356B, M1 6829c139는23/23·창0·잔여0·USER_SAVE0. Core9efc2ba7…/Runtimeffc22ee5…는 실제Compiler DLL과 바이트동일, Runtime소스356개 변경0. 웹3333 browser726ace84는5해상도×ko/de/fr×3상태45PNG·오류0·창0·잔여0·USER_SAVE0이며 긴 이름의 실제줄바꿈과 비용/확률을직접1x확인. 폴더 evening/third의호출39개전수검색에서비공용0. 빌드자동857개 SHA보관·원HEAD바이트복원/해시확인,guard WIP보존.

첫 전체 UI 8db8dd46은12장 후 실제 마우스 이름입력검사 FAIL(exit2)이다. 잠긴직업 차단true/이름열림false였으나 같은프레임의확인음·전환callback이뒤따라 fixture가새전환완료보다앞서검사했음을확인했다. UiWideClick에OnGUI프레임끝→실제전환Busy종료(최대15s) 대기를추가하고제품전환실패/기존좌표·차단assert는유지한다. 이는검수시계교정이며제품timeout완화나147건검사제외가아니다. 새정식패키지/M1/1395전체재검수전이며P0완료아님. 상세계약은UNITY_UI_OVERLAP_20261030.md 최신절.

검수기소스전수확인에서신규입장도즉시Loading가정이남아있음을발견했다. 실제제품은onBlack의loadingAlreadyShown=true로Nemesis에진입하므로, 비동기실제입장callback까지기다리고Preparing의실제완전검정Repaint를로딩으로수집한뒤fade완료/Nemesis를assert하도록같은수정에포함했다. 1395페이지조건/분석기·입력격리검사유지, 제품화면전환변경0.


## P0 두 번째 패키지 — 부분0건이어도 시각FAIL, 방식 변경

입력91b3550464의 정식3a16d065·M1 d56318d4(23/23·창0·잔여0·USER_SAVE0)는통과했다. 실제마우스2560×1600의잠긴직업차단/nameOpened가모두true이고,로딩JSON의R4192×192영역(x2296,y1336)·alphaReaderVerified도확인했다. 첫3문제프레임을기존분석기로재분석하면0건/경고0이다. 그러나 원본PNG직접열람에서스킬정보와대장간내용물이배경판밖으로밀려나시각FAIL로판정했다. 물리그룹의원점을기존GUI.matrix가다시확대하는제작오류이며0건을합격으로쓰지않는다.

제품의GUI.BeginGroup/GUI.matrix동작을원래대로복원한다. NativeUiAudit에만부모그룹화면원점과새그룹API원점의차이를쌓아ScreenRect/quad/실제clip좌표를보정하고그룹끝/프레임시작때복원한다. 이름말줄임/행높이·비용확률간격·실제전환검수교정은유지한다. 새방식의원본1x·PNG실제글자경계와JSON좌표·전체검사전까지미검증이다.

실패bfb10503은447PNG까지보존하고정확실행경로/명령/생성시각/부모57996/자기슬롯을대조해자기Player56436만중단했다. 타인/사용자프로세스종료0. 공용실행기는강제종료의uint32 4294967295→Int32변환에서예외를기록했고finally로자기예약/슬롯을반환했다. 이실패를정상종료·전체0건·잔여0로승격하지않는다. stop근거 resume-0912/r3/stopped-invalid-ui.json.


## P0 R3 실픽셀 대조 및 로딩 커버리지 후속

정식15a8d294/errors0, M1 bf2bc125 23/23·32PNG·창0/잔여0/USER_SAVE0. 첫2560×1600ko 문제3장 원분석기각0/경고0. 실제제목잉크x215/y498/120×38/1484픽셀은이전정상그리기와동일하고새계측상자안포함, 실패R2와구수집기는음성대조불일치. ko/de/fr 9쌍을웹3333와원래픽셀로직접열람했다. 전체UX의한국어고정·폰트/전체크기차이는RETOUCH.

로딩커버리지의실제Preparing검정은가시문자0으로기존분석기관측조건을못채운다. 검정은별도신규입장검정으로보존하고, 기존승인첫이미지1의실제스테이지로딩을필수로딩페이지로추가한다. 77×5×3+17×5×3=1410장,입력격리/틱정지1410·팁255·키30·미디어120. 분석기/임계/기존페이지/제품시간변경0. 같은R3표본으로검정false/실제스테이지로딩true 음양대조,새후보정식/M1/1410은미검증. 상세는UNITY_UI_OVERLAP_20261030.md 최신절.


### 2026-11-03 P0 잔여18건 — 로드맵 칸 폭 교정 후보

| 항목 | 실제 결과 / 수정 계약 | 상태 |
|---|---|---|
| R3 전체 | 1395PNG·입력격리/틱정지각1395, 겹침18/로딩관측누락15. Player65df27ef 정상exit0/창0/잔여0/USER_SAVE0 | 전체 FAIL 보존. 147→18이며0건아님 |
| 18건 원인 | 슬롯04·09,1920×1080/1600×900/2560×1600×ko/de/fr. 안내의 마지막 ]와합성로드맵첫합실제겹침 | 실제1920원본에서확인. 분석기문자/소스제외없음 |
| 웹 실제 칸 | 1920에서제단끝1587,격자간격12,로드맵바깥1599/270. 제목시작1622/폭224/오른끝1846 | 웹3333실제E모체로드맵DOM와PNG수집. 기존Native1562/284/끝1846가왼쪽60침범 |
| 최소 수정 | DrawRoad의영역/제목/구분선/본문만x1622·폭224. 오른쪽끝1846·기존y/서체·제단안내·나머지배치유지 | 새정식/M1/1410장·실제1x전미검증 |
| 실행 구분 | R4정식38489478/errors0. M1은23단계·32PNG결과후종료지연,새완료PASS로세지않음 | 정상종료/정리결과별도확인. R3/R4/R5증거혼용금지 |


## 2026-11-03 재개 체크포인트 — 매뉴얼 v4 / 동일 패키지 인수

| 항목 | 실제 확인과 경계 |
|---|---|
| 공통/소유 | 재fetch 공통c741c11c27, 자기소스fc3b03a445. 외부guard WIP보존·INDEX0. 요청한0a864885b/91b355046/289a047f7 뒤 로딩추가8095269d8·잔여18건교정fc3b03a445를 포함 |
| 매뉴얼 | origin/main253ad0b1dce92379257cd398ccfb9a3496b45e22의WORK_MANUAL_20261029.md v4전체확인. 하루한번이상자기브랜치정상commit/push,공용bin만사용·Desktop직접교체0 |
| 정식 입력 인수 | 완료된3bc29cde/errors0/6,610,800,380B 보존. 소스356개0불일치·Core/Runtime중단전해시일치 |
| 실제 실행 패키지 | I정식보관본↔G활성런타임213파일전부SHA256일치. G:/exoduser-wt/codex-unity-parity-1102/unity/Temp/ParityP0Player-20261103-r5. 보관·캡처·로그는I |
| 빌드 생성물 | 정확857경로전부백업검증/원HEAD입력복원검증. 외부guard·기존미추적보존 |
| 남은 P0 | 같은패키지M1정상종료→1410UI중단0/겹침0/누락0→5해상도lockedBlocked/nameOpened실제마우스검증→최신공통정상병합/비강제push→REPORT상단SHA |

R3 전체1395/18건/로딩관측누락15는FAIL그대로다. 새검수전0건이나사용자실행본반영으로세지않는다. 전체5차잔여는P0공통반영뒤이어간다.
