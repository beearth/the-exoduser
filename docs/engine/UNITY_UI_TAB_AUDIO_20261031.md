# 승인 ui_tab r3c — Runtime 연결 단위

PC 04:27 KST 당시 상태: **순수 입력 Unity 컴파일0오류·새 GPU Player 74/74·동일 새 빌드 M1 23/23 통과. 지정 통합 인계 준비 완료. 사용자 청음 미검증·공통/Desktop 반영 대기.** 3D 무대 FAIL2/NOT_MERGE는 유지하며 이 오디오 단위에 포함하지 않는다. 아래 Mac 후속이 공통 반영 이후의 상태를 갱신한다.

| 항목 | 현재 계약·구현 |
|---|---|
| 승인 | 사용자 r3c, sound d9edf9bd8de0ff12b23ea7d0c7448ff161cde75c의 AD2 인계와 manifest. 원본·선택·manifest 읽기 전용 |
| 입력 | I:/exoduser-wt/codex-sound/sound-delivery/night8h-20261031/ui_tab.mp3, 3386bytes, SHA256 3a693839af04190e6255f3098c92528d95812fa5b4a84e4be1a01a5bf66a1a4b |
| 런타임 자산 | Resources/Audio/UI/ui_tab.mp3, 동일 byte. GUID cbec5901a15776289d15be9e8110292b, 폴더 GUID 1677d5bb0fe8352e3993b204afa34f11. PCM·원본sampleRate·원본채널 유지(forceToMono0)·동기preload, normalize0·3D0. 재가공/생성0 |
| 로더 | NativeFeedbackAudio의 Audio/SFX·Audio/RM1에 Audio/UI 추가 |
| 분류 | ui_tab을 UI·2D(spatialBlend0)로 명시. PriSkill10 사용하여 EnemyHit 기본값/저우선 피격3voice 제한으로 잘못 분류하지 않음. 전역 voice48 정책은 유지 |
| 재생 | PlayUiTab → 기존 Make/Play 경로 즉시1회. raw gain.22·pitch1·loopfalse·Master/SFX/UI. 전투Tick/Flush를 기다리지 않음 |
| 설정 | 기존 rawVolume×SFX% source gain 및 SfxVol bus 동작 유지. 0/60/100%의 source volume0/.132/.22, UIbus. 사용자 설정값 변경0 |
| 전환 판정 | OnPanelRequested에서 기존 guard 뒤 전환 전 열린 패널/대상상태를 기록, 기존 switch를 실행한 뒤 대상이 실제 열린 경우에만1회. Requested에 무조건 재생 구독0 |
| 무음 | 활성탭·죽음·firstPractice·null Simulation·미지원/null id·실패한열기·최초단축키열기·로비가림·Layout/Repaint0 |
| 기존 동작 | 같은 활성 능력치/대장간 단축키의 기존 닫기 동작을 그대로 유지하며 소리만0. 선택·키바인딩·Core·저장·기타UI 변경0, NativePanelTabBar 변경0 |
| 독립 회귀 | behavior.cjs: 생산 NativeGame 전환/Set본문 및 NativeFeedbackAudio/NativeAudioMixer 전체 C# 실행. Unity 장치·패널 대체. RED1176case/99실패→GREEN1176case/2364검사/0실패, 전환음96회·기존 상태 차이0. 실제Player PASS 아님 |
| 실제 검수 도구 | 자기 Runtime/Tools/UiTabAudioCheck.cs. 명시적 --unity-ui-tab-audio-check -output 절대경로 + --unity-qa-sandbox 필수. 무음·Requested 확정/실제InputSystem F10/clip디코드/실제Source 설정/후속Flush/입력·선택state 검사. 가상 장치 이벤트를 다음 정상 프레임의 NativeGame.Update가 소비하는 F10 경로와 자기 PID·UnityWndClass로 한정한 숨은 Player 창 WM 마우스 클릭을 검사. 마우스 GUI 수신·활성탭 무음·열림/Running/fence·실제 SetSfxPercent 설정 콜백·SFX버스 dB·0/60/100%·Layout/Repaint를 기록. 사용자 손조작·청음과 구분. 실제 d4c880b6에서 74/74 통과 |
| 순수 입력 | pure-input.cjs가 별도 임시 Git INDEX에서 최신 공통+이번 audio commit의 정확 경로만 합친 tree를 만들고 Git C# blob을 I:보관물로 독립컴파일. checkout/branch/공유INDEX/3D hook·자산 변경0. 이 입력은 Unity프로젝트 작업본이 아님 |
| 통합 의존성 | 현재 UI branch는 중단3D 이력이 있으므로 전체branch merge금지. 지정 unity-integrator가 공통expected·단일 audio diff·순수tree를 대조하여 기존 자기 작업본에서 정상 검증입력을 확보해야 정식빌드 가능. 확보 전 예약/READY/제품전달0 |
| 보호/출력 | 시작 HEAD857995b0b·원격expected018ce33f2·INDEX0·대상WORK0. 기존WIP/중단무대/씬656파일32947018bytes 실물 I:복사·SHA대조. 산출 I:/EXODUSER-Storage/demo-art/unity-ui/ui-tab-audio-20261031/ |

## 완료 게이트

| 게이트 | 상태 |
|---|---|
| 승인원본 SHA·별도audio diff | 준비 |
| 생산본문 독립행동 | 부분증거 PASS, native장치/패널은 대체 |
| 최신공통+audio만 독립컴파일 | 기존 동일 277파일·오류0·1176case/2364검사/0fail 영수증 재사용 |
| 실제순수입력 Unity6000.6.7f1 / 공식Player / 동일새빌드M1 | 38114e2b 오류0 / d4c880b6 74/74 / 41a87de7 23/23 |
| 야간 청음 / 사용자 청음 | 야간시도0 / 사용자미검증 |
| 제품·unity/main·Desktop | 반영0 |

기존3D 실패2는 해제하지 않는다. 이 단위도 실제 같은 실패2이면 중단한다. TDD의 계획된 RED 누락 재현과 실제 Unity/Player 실패 카운터를 섞지 않는다. 자세한 SHA/실행/의존성은 I:REPORT에 기록한다.

## 2026-10-31 야간 승인 순수 실행 호스트

기존 MCP NTFS 작업본을 단위 검증 호스트로 재사용한다. expected `018ce33f20987648f661a6ca26d54b18ba05ca5d` 위 승인 오디오 12경로만 적용한 후보 `4dfafe42e711906739952293a6ee3d14b1988386`의 실제 tree가 `c18fd725a8b41b0b558502684d732ec8e45c0ef1`와 동일하다. 원본 부모의 중단3D는 인수하지 않았다. 추가 변경은 이 문서와 Runtime/Tools/UiTabAudioCheck.cs의 입력 증거 보강뿐이며 제품 NativeGame/NativeFeedbackAudio는 승인 blob 그대로다. 기존 1176case/2364검사/0fail은 재실행하지 않는다.

FirstPlayable 포함 실제 입력3240파일1891758208bytes를 I:실물 복사·SHA대조했다. 검수 hook 변경도 빌드 전 별도 byte백업한다. 당시 순번 대기 전 준비 기록이며 아래 최종 검수를 따른다. 청음 PASS는 선언하지 않는다. 증거: `I:/EXODUSER-Storage/demo-art/unity-ui/ui-tab-audio-20261031/mcp-verification/`.

### 첫 정식 컴파일 실패 보존

61b5c45d는 검수 Tools의 NativeSettingsState 한정 이름 누락(CS0246)으로 빌드 전 컴파일 실패했다. 실제 선언은 Exoduser.UnityPort.Core이므로 검수 타입만 Core.NativeSettingsState로 지정한다. 제품 전환/오디오 본문은 불변이며 세이브 변경0·Unity 종료 확인·FirstPlayable 변경0이다. 실제 단위 실패1을 유지하고 원인 수정 뒤 1회만 재실행한다. 로그와 실패카운터는 mcp-verification에 보존한다.

## 최종 실제 검수 — 2026-10-31 04:27 KST

| 항목 | 결과 |
|---|---|
| 실제 빌드 소스 | 5ed0e298b87a24a8fde01934d0da196e24fc0cbd. 순수 12경로 위 추가 변화는 검수 Tools/관련 docs뿐. NativeGame·NativeFeedbackAudio의 제품 blob은 원본6526b57f5와 동일 |
| 정식 빌드 | 38114e2b, 6000.6.7f1 Win64, 컴파일오류0·BuildReport errors0 |
| 같은 Player | d4c880b6, RX9070XT·D3D11 hidden, 74검사/0실패. F10 정상프레임·자기 PID/UnityWndClass의 실제 WM 클릭3쌍 |
| 전환·무음 | 성공한 다른 패널1회, 활성/죽음/firstPractice/미지원/null/거부열기/최초열기/로비0. mouseDown3/mouseUp3·Layout156/Repaint150, 추가 재생0·Flush중복0 |
| 설정·voice | 실제 SetSfxPercent 0/60/100%, source0/.132/.22, SfxVol -80/-4.436975/0dB. raw .22·pitch1·UI·2D0·loopfalse. 실제 clip 9216samples/1channel/44100Hz 디코드. AudioListener.volume0/pause=true |
| 동일 빌드 M1 | 41a87de7, 23/23, firstBlocked 없음. 새 EXE·Runtime/Core SHA를 Player와 연결 |
| 안전 | 두 Player 정상exit0, 사용자 데스크톱 창0·잔여0·desktopClosed=true·USER_SAVE0. 시작 대비 실제 사용자13파일 size/mtime/SHA변경0. 자기 예약 정상반환 |
| 보존 | 빌드 자동519경로를 변경byte까지 I:백업 후 실제 빌드전byte로 복구. FirstPlayable SHA3381d54a14c91700e64a6f7350b1b890284635632ae14cb2c28e5e6ee1f1b8c0 일치. 새 자동56파일은 SHA보존 후 자기 생성 사본만 정리. 기존 미추적 Assets19파일 유지 |
| 실패·한계 | 첫 컴파일61b5c45d 실패1 유지, 검수 타입 한정 1회 수정 뒤 통과. 기존3D FAIL2/종료FAIL4·2/영웅보존FAIL 유지. 청음·사용자 손조작·제품 전체아트는 미검증. 원본부모 중단3D 인수0 |

M1은 기존 실제 NativeGame/API·Simulation.Tick 범위다. actual 입력은 별도 d4c880b6에서 검증했다. 캡처 마우스_설정에서인벤.png와 1600-settings.png를 직접 보고 활성탭/열림 상태를 확인했으며 전체 UI 디자인 PASS로 확대하지 않는다. 공통 자동병합·Desktop 변경은 담당 검수의 권한 밖이며 기존 지정 통합에게 영수증 한 건만 인계한다.

## Mac 무창 Player 검수 Tools 이식성 — 2026-10-31

공통 `b9491cf58bf47277b40f3497d684e46deee1c59c`/Unity tree `ae7c0d6cdec3d4013bc880399893c07031a7af98`의 Mac 첫 검수는 실제 `UiTabAudioCheck.MouseClick→OwnWindow→kernel32.GetCurrentProcessId`에서 `EntryPointNotFoundException`으로 24/25·exit2였다. 제품 `NativeGame`/`NativeFeedbackAudio`의 실패가 아니라 검수 Tools의 Windows 전용 P/Invoke다. `UiTabAudioCheck.cs`만 Mac 컴파일 분기에서 Windows WM 클릭3쌍과 창 없는 GUI/1600×900 캡처를 `unsupported`로 기록하고, 나머지 실제 Source·버스·설정 검사는 계속 실행하도록 수정했다. `supportedPassed=true`라도 `unsupported`가 있으면 전체 `passed=false`, `status=partial-unsupported`, 의도적 exit4다. Windows 검사 본문은 유지된다.

새 Mac ARM64 Settings QA 빌드 `5cc64bf3afa747709a011676c40142a8f6fd31913c2c94ba04a4a4385e40e376`(실행 파일 SHA), Runtime DLL `301bb40880c049c0533fb607937bf46593ed94929b341f49f434292bb7528bd9`에서 실제 무음·격리 Player는 **지원 46/46 통과, 미지원 2항목, 전체 PASS 아님**. 영수증 `_out/UNITY-MAC-UI-TAB-PORT-20261031-0634/ui-tab/Player_오디오_회귀.json` SHA `116dfff9eff3ed7516df235cc073b4e77d188f9a303978762728bbd552d5bd36`. 클립 9216samples/1ch/44100Hz 디코드, 가상 InputSystem F10 다음 정상 Update의 전환1회, 최초/활성/거부0, 실제 `SetSfxPercent` 0/60/100%, SfxVol −80/−4.436975/0dB, `AudioSource` UI버스·2D0·loopfalse·pitch1·raw gain .22·source volume 0/.132/.22, Flush 중복0이 통과했다. 같은 앱 M1은 23/23·Metal·exit0이다. `LayoutRepaint추가0`라는 기존 check id는 Mac에서 **4프레임 무입력 중 추가 사운드0**만 증명한다. 실제 Layout/Repaint 발생은 0회라 미지원이며 마우스 이벤트/1600×900 GUI PNG/사용자 손입력/청음 PASS는 아니다. 제품 코드·샘플 byte·소리 계약은 변경0이다.


## 2026-10-31 ENTER·UI 웹 일치 후속

[현재 동작·음원·볼륨·검수 계약](UNITY_UI_SOUND_MATCH_20261031.md)을 따른다. 기존 ui_tab 단일 범위의 고정 pitch 1은 웹 전역 .92~1.08로 갱신하며 최초열기/닫기는 별도 open/close 소리를 추가한다. 과거 영수증을 이 확대 단위의 검수로 재사용하지 않는다. 기존 ui_tab 검수 Tools는 탭 이벤트만 세고 30ms gate를 넘긴 별도 동작을 검사한다. 전체 ENTER/버튼/패널/레벨업/획득 검수는 새 출력버퍼·영상 영수증을 따른다.
