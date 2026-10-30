# 승인 ui_tab r3c — Runtime 연결 단위

현재 상태: **소스 연결·독립 행동회귀 통과 / 순수 입력 정식 Unity·Player·동일 M1·사용자 청음 미검증. NOT_READY.** 3D 무대 FAIL2/NOT_MERGE는 유지하며 이 오디오 단위에 포함하지 않는다.

| 항목 | 현재 계약·구현 |
|---|---|
| 승인 | 사용자 r3c, sound d9edf9bd8de0ff12b23ea7d0c7448ff161cde75c의 AD2 인계와 manifest. 원본·선택·manifest 읽기 전용 |
| 입력 | I:/exoduser-wt/codex-sound/sound-delivery/night8h-20261031/ui_tab.mp3, 3386bytes, SHA256 3a693839af04190e6255f3098c92528d95812fa5b4a84e4be1a01a5bf66a1a4b |
| 런타임 자산 | Resources/Audio/UI/ui_tab.mp3, 동일 byte. GUID cbec5901a15776289d15be9e8110292b, 폴더 GUID 1677d5bb0fe8352e3993b204afa34f11. PCM·원본sampleRate·stereo·동기preload, normalize0·3D0. 재가공/생성0 |
| 로더 | NativeFeedbackAudio의 Audio/SFX·Audio/RM1에 Audio/UI 추가 |
| 분류 | ui_tab을 UI·2D(spatialBlend0)로 명시. PriSkill10 사용하여 EnemyHit 기본값/저우선 피격3voice 제한으로 잘못 분류하지 않음. 전역 voice48 정책은 유지 |
| 재생 | PlayUiTab → 기존 Make/Play 경로 즉시1회. raw gain.22·pitch1·loopfalse·Master/SFX/UI. 전투Tick/Flush를 기다리지 않음 |
| 설정 | 기존 rawVolume×SFX% source gain 및 SfxVol bus 동작 유지. 0/60/100%의 source volume0/.132/.22, UIbus. 사용자 설정값 변경0 |
| 전환 판정 | OnPanelRequested에서 기존 guard 뒤 전환 전 열린 패널/대상상태를 기록, 기존 switch를 실행한 뒤 대상이 실제 열린 경우에만1회. Requested에 무조건 재생 구독0 |
| 무음 | 활성탭·죽음·firstPractice·null Simulation·미지원/null id·실패한열기·최초단축키열기·로비가림·Layout/Repaint0 |
| 기존 동작 | 같은 활성 능력치/대장간 단축키의 기존 닫기 동작을 그대로 유지하며 소리만0. 선택·키바인딩·Core·저장·기타UI 변경0, NativePanelTabBar 변경0 |
| 독립 회귀 | behavior.cjs: 생산 NativeGame 전환/Set본문 및 NativeFeedbackAudio/NativeAudioMixer 전체 C# 실행. Unity 장치·패널 대체. RED1176case/99실패→GREEN1176case/2364검사/0실패, 전환음96회·기존 상태 차이0. 실제Player PASS 아님 |
| 실제 검수 도구 | 자기 Runtime/Tools/UiTabAudioCheck.cs. 명시적 --unity-ui-tab-audio-check -output 절대경로 + --unity-qa-sandbox 필수. 무음·Requested 확정/실제InputSystem F10/clip디코드/실제Source 설정/후속Flush/입력·선택state 검사. OS마우스·청음과 구분. 현재 도구 실행 미검증 |
| 순수 입력 | pure-input.cjs가 별도 임시 Git INDEX에서 최신 공통+이번 audio commit의 정확 경로만 합친 tree를 만들고 Git C# blob을 I:보관물로 독립컴파일. checkout/branch/공유INDEX/3D hook·자산 변경0. 이 입력은 Unity프로젝트 작업본이 아님 |
| 통합 의존성 | 현재 UI branch는 중단3D 이력이 있으므로 전체branch merge금지. 지정 unity-integrator가 공통expected·단일 audio diff·순수tree를 대조하여 기존 자기 작업본에서 정상 검증입력을 확보해야 정식빌드 가능. 확보 전 예약/READY/제품전달0 |
| 보호/출력 | 시작 HEAD857995b0b·원격expected018ce33f2·INDEX0·대상WORK0. 기존WIP/중단무대/씬656파일32947018bytes 실물 I:복사·SHA대조. 산출 I:/EXODUSER-Storage/demo-art/unity-ui/ui-tab-audio-20261031/ |

## 완료 게이트

| 게이트 | 상태 |
|---|---|
| 승인원본 SHA·별도audio diff | 준비 |
| 생산본문 독립행동 | 부분증거 PASS, native장치/패널은 대체 |
| 최신공통+audio만 독립컴파일 | Core114/Runtime163(총277 C#) 오류0. tree c18fd725a8b41b0b558502684d732ec8e45c0ef1 |
| 실제순수입력 Unity6000.6.7f1 / 공식Player / 동일새빌드M1 | 미검증 |
| 야간 청음 / 사용자 청음 | 야간시도0 / 사용자미검증 |
| 제품·unity/main·Desktop | 반영0 |

기존3D 실패2는 해제하지 않는다. 이 단위도 실제 같은 실패2이면 중단한다. TDD의 계획된 RED 누락 재현과 실제 Unity/Player 실패 카운터를 섞지 않는다. 자세한 SHA/실행/의존성은 I:REPORT에 기록한다.

## 순수 실행 입력 인수 의존성 — 03:50 KST

오디오 단일커밋6526b57f56de4ba0fe86fb49dddd7f150acadff6(부모857995b0b)·patch SHA5ae9db6737616abe0583b327ff4a213424a5633280d3bb6ce295344aa064d0b9를 원격보존했다. 지정통합담당도 공통018ce33f2+patch12경로를 독립임시INDEX에서 대조하여 순수tree c18fd725a8b41b0b558502684d732ec8e45c0ef1 및 모든blob byte 일치를 확인했다. 새commit/실제실행checkout 확보를 뜻하지 않는다.

통합담당의 기존작업본은 HEAD11d0fc5d0570992d37f97a35645bdff3e583443d·INDEX0·trackedWORK451이므로 겹쳐반영하지않았다. 현재 UI작업본은중단3D를포함한다. 사용자 새작업본0 조건을 지켜 추가materialize·예약·Unity/Player/M1·공통/Desktop반영0으로 **NOT_READY 인계**한다. 원본/manifest/선택·기존WIP654파일·중단무대보고/실패카운터 동일SHA를 확인했다. integrator-input-proof.json이 독립근거다. 중앙 직접메시지는active writer로거절돼 수신미확인, MERGE_QUEUE에정확의존성을기록한다. 새로운야간단위/자동재개0.
