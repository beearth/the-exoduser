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
