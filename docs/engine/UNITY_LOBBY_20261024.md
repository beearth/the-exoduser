# UNITY-LOBBY-01 — 실행 첫 화면·인트로·로비

> **2026-10-25 사용자 지정으로 기준 확정:** 최신 세계관 시네마틱은 `I:/EXODUSER-Storage/SteamUpload/world_intro_v22b_steam.mp4`, 102,204,634 bytes, SHA256 `3b99d59bca9d84a37bb6b49067148e1ed69fefb478ff206221b59c8c952d0b0f`다. 사용자가 파일을 직접 첨부하고 최신본으로 지정한 지시를 확인했다. 아래 ‘최신 승인 미확인’/‘Steam용이라 인게임 제외’는 이전 판단이며 현재 기준이 아니다. [정본 적용 상태](UNITY_WORLD_INTRO_CANONICAL_20261025.md)를 따른다.


> 2026-10-24 원본 기준 정정: 이 문서의 “최신 v22b / 사용자 최신 override”는 승인 근거 미확인으로 철회한다. v22b 복사/재생 검사는 해당 후보의 결과만 뜻한다. [원본 대조](UNITY_SOURCE_BASELINE_20261024.md).


사용자 최신 지시 “일단 게임 로비부터 인트로 시네마틱같은것들만 잘 옴겨”가 최우선이다. 드랍·전투 확장·새 맵/모션/이펙트는 이번 단위가 아니다. Godot본·웹·사용자 저장·공유 main/INDEX480과 열린 사용자 앱은 보존한다.

| 항목 | 원본과 구현 |
|---|---|
| SSOT | 현재 G:/exoduser/index.html SHA256 `8bff9fd683b274fc538df531e7b007ec7c5e60e7317744948ffc2e5b4f088621`. E:의 이전 index SHA95c7d29.../v15 영상과 다르므로 최신 G: 참조. source12파일 SHA256·원문을 I: source-snapshot에 보존 |
| 실행 경로 | FDG 로고 영상→여캐 타이틀 영상/브랜드→지옥문 첫 프레임/ENTER→문 열림→세계관 v22b→로비. 원본 phase0 경고문은 제거 상태여서 다시 추가하지 않음 |
| FDG | 원본3.2초, 재생 시각 진행이12초 없으면 엠블럼 폴백3.2초 후 전환. 준비된 영상의 정지도 감지. 클릭/키 같은 프레임이 다음 화면까지 관통하지 않음 |
| 타이틀 | title_motion_hd_20260929.mp4 무음 loop, 실패 시 SD, 실패 시 원본 plate. 원본 splashTitleBrand SVG를1983×793으로 raster·clean plate 임베드/Georgia font, 원본 crop 수식 사용. 폰트 raster 완전 동등성 미검증 |
| 지옥문 | intro.mp4 첫 프레임 pause/무음, ENTER로 실제 재생·음량.6. BGM4곡 중1곡.6 시작, 문 끝/3초 진입 정지/15초 hard timeout/오류 시 세계관으로 전환 |
| 세계관 | 원본 world_intro_v22b_paint_en.mp4 byte exact98,177,870bytes. 영어 voice1, 연속 BGM을1초에.6→.22 duck. 원본17 next-cut 시각과5초 ESC/SPACE 전체 스킵, replay/오류 재시도/일시정지. 컷 넘기기는 음악 시계를 seek하지 않음 |
| 자막 | 원본29언어×32큐·timings/문장을 typed Resources JSON으로 복사. 영상 time으로 현재 cue 표시. NanumMyeongjo와 기존 Noto폰트 사용, 전체29폰트/아랍어 shaping/RTL/현지화는 미검증 |
| 로비 | 원본 crypt 영상 loop/포스터, 바르칸 v3 atlas3072×7488/8×12/96frames/24fps·384×624cell·원본 baseline/foot배치, 원본 로고/입장 artwork. lobby.mp3 .65 loop |
| 수명 | Native VideoPlayer URL+RenderTexture+AudioSource, frame0/끝/오류 콜백. generation으로 오래된 prepare 무효화. 포커스 허용과 재생 의도 분리해 준비 중 창 전환에도 백그라운드 재생 차단, 음악 복귀 상태도 독립. 영상 오류 시 음악 pause/실제 playing 후 resume |
| 렌더 | 1920×1080 uniform fit/letterbox로 영상 왜곡 방지. 원본 title/ENTER 아트 matte alpha를 source cin-logo-art.js의 round(255×clamp((maxRGB−8)/24))로 변환. 원본은 G:와 I: source-art에 보존 |
| 미디어 | 실행 미디어30개206,351,741bytes. 원본 video6/audio5/이미지와 derived matte2·WebP→PNG·SVG→PNG·문 frame0 PNG, 각각 source/목적지 SHA256 명세 Tools/Fixtures/lobby-assets.json. splash_brand는 Chromium SVG canvas로 원본 textLength/lengthAdjust/letter-spacing을 보존한다. librsvg의 잘못된 글자 간격을 교정했다. 새 이미지 생성0. 세계관·FDG·문·타이틀 MP4는 byte exact. 로비 영상만 Windows 지원 프로파일의 실행 파생본 |
| 기준 타깃 | Unity의 full/offline 프런트엔드 표본. 웹 reference는 원본 지원 flag EXODUSER_BUILD_TARGET=full, test=1, 독립 browser context/빈 슬롯, POST 등 전송 차단. 웹 기본 demo welcome/auth 페이지를 full/offline 로비로 가장하지 않음 |
| 저장 경계 | 로비는 빈 캐릭터 목록으로 시작, 생성/기존 저장 불러오기는 미구현 표시/비활성화. 기존 사용자의 슬롯/계정에 접속하거나 임의 저장하지 않음. ‘Unity 전투 검수(임시 캐릭터)’만 격리 시작장비 전투로 연결 |
| 게임 차단 | 프런트엔드 표시 중 NativeGame Tick/입력/기존 HUD/메뉴 차단·world cullingMask0. 임시 전투 선택 후 실행. 전투 메뉴의 로비 복귀 연결. 기존 combat/HUD/inventory CLI QA는 명시 플래그에서 프런트엔드를 건너뜀 |

## 검수 단계

| 단계 | 실제 근거 |
|---|---|
| 모델 | Core65검사 및 실제 NativeLobbyVideo adapter의 좁은 Unity boundary doubles15검사. FDG 준비 후 stall/async blur autoplay 수정 전 행동RED·수정 후GREEN. [소스/테스트 경계](UNITY_LOBBY_CORE_20261024.md) |
| Player gate RED | 기존 inventory combat Player에 새 frontend gate를 실행: 프런트엔드 receipt/영상decode/화면/자막/자연끝/전환16검사 FAIL, 기존 무예외 검사1개만PASS. 단순 파일 존재/컴파일 성공을 실제 재생으로 세지 않음 |
| 정적 컴파일 | 설치된 Unity assemblies 대상으로0오류. 실제 Editor/decoder/출력과 별도 |
| 실제 Editor | 최종 lobby-build-2026-10-24T11-57-19-733Z: source33cbaddec, Build Succeeded/오류0, 1,427,059,089B. 30미디어·29×32자막·17컷·atlas·정적400/600/700폰트 검증 |
| 실제 Windows/Player | 5526d220의 실제113초 자연끝 전체20/20PASS. 이후 로비타이포만 수정한33cbaddec의 별도짧은UI probe12/12PASS. 상세증거와재생코드동일성은 아래 표 및 INTRO-PASS.json |

실행한 Player fixture는 실제 decoder의 프레임 진행·GPU nonblack·음성/음악 출력·세계관 자연 종료 원인·원본 그림/자막·replay/5초 skip·게임 차단/명시 임시 진입을 검사하고 화면을 저장한다. 이 플래그에서만 포커스를 유지하므로 OS 포커스 직접 입력 인수와 구분한다. 사람의 직접 클릭·모든 해상도·모든 글꼴·전체 CSS/hover/fade·게임패드·캐릭터 생성/저장/계정·캐릭터별 서사/완전 게임 로비는 남아 있다.

**VISUAL VERDICT: RETOUCH.** 원본 브라우저와 실제 Unity 화면을 비교해 계속 보정하며, 모델 통과로 전체 로비/시네마틱 이식 완료를 주장하지 않는다.

영상 음성 probe는 AudioSource.isPlaying(clip 제어 상태)을 신호 유무의 전제 조건으로 사용하지 않고 GetOutputData 버퍼를 직접 측정한다. 타이틀 캡처는 재생1.5초 이후 prompt까지 포함한다. 각 영상 단계의 실제 frame/time/nonblack을 Player 로그에 남긴다. 중복 Play 방어는13개 adapter검사로 확인했으나 기존 NativeLobby 동일 focus guard가 있으므로 기존 overflow의 원인 해결로 단정하지 않는다.

## 사용자 실제 피드백 반영 — v22b·끊김·방화벽

| 항목 | 현재 값 / 근거 |
|---|---|
| 최신 영상 | 사용자 구버전 지적에 따라 v22b 제작 원본으로 교체. G: 웹 index의 v17 연결은 최신 제작본이라는 뜻이 아니었다. G: 웹/원본은 변경하지 않았다 |
| v22b | output/cinematic/a04_demonic_remaster_20261016/world_intro_v22b_paint_en.mp4, 98,177,870B, SHA256 cd9fa7486fd1cf18952605408f5b1bae416a97b2307806476bc329498413199e |
| 음성·시간 | v17/v22b 모두 1920×1080·24fps·113.291667초, decoded audio MD5 fa7ab6dee0e30134bc8a47bcc2f762f7 동일. 원본29×32자막·17cut time 유지. oracle.json의 worldVideo는 웹 source provenance v17이며 실제 NativeLobby는 사용자 최신 v22b override |
| 파일 검수 | latest-media-receipt.json: v22b 전체 ffmpeg decode 오류0. 6.5/34.5/44.5/93초 프레임 보존. 이 결과는 Unity 재생 PASS가 아니다 |
| 이전 실행 실패 | lobby-player-2026-10-24T11-20-43-200Z: AudioSampleProvider buffer 경고236건, 정상 완주 receipt 없음. 사용자도 끊김 보고. 정상 완료로 취급하지 않는다 |
| 진단 | --unity-video-clock-game / --unity-video-no-drop / --unity-video-direct, 기본값 보존. 한 번에 한 변수만 비교. Direct는 AudioSource 출력 계측을 우회하므로 해당 voicePeak로 완주PASS를 만들지 않음 |
| 실행 검수 | 동일 stage/player의 frameReady로 프레임 변화·loopwrap을 기록. FDG 끝 뒤 다른 영상을 캡처하지 않음. 5초마다 lobby-progress.json. world ended event·duration113.291667·wall 오차5%+2초·최대 정체.75초·speed1·분리voice/music/listener 신호·overflow0 필수. probe는 10초 진단만이며 완주PASS와 별도 |
| 방화벽 | 사용자 확인: Codex 승인이 아니라 Windows 방화벽 창. BuildOptions.Development를 None으로 변경해 검수에 불필요한 PlayerConnection 개발 연결 제거. 고정 실제 실행 경로 E:/EXODUSER-Unity-Play. 방화벽 전역 설정/규칙은 변경하지 않음. 현재 Player30496 실측 UDP/TCP 모두0, PlayerConnection로그0 |
| 로비 시각 | 원본 DOM 좌표/폰트/색·hell_gothic frame48px 22% slice·inset22 문양/철판·원본 Steam 배너·grayscale1 brightness.45 비활성 ENTER. panel560×1080 PNG는 원본CSS Chromium 렌더이며 새 아트 생성 아님. 시각 판정 RETOUCH 유지 |
| 복구 | 큰 v22b 원본은 GitHub 도구 IPC64MiB 한도 때문에 4개 작은 Git blob으로 보관. runtime MP4는 무손실 조립으로 완전히 동일 bytes. [복구 절차](UNITY_LOBBY_MEDIA_RECOVERY_20261024.md). 기존 v17 Unity 사본만 I: superseded-runtime으로 SHA대조 보존 후 제거, G: 원본/Godot 불변 |

## 끊김 원인 A/B 및 정식 재생 정책

| 동일 실제 실행본 / 960×540 / 동일 미디어 | 결과 |
|---|---|
| 기존 skipOnDrop=true | video-probe-baseline-2026-10-24T11-35-04-930Z: AudioSampleProvider 폐기757건. FDG3.1초 동안 frameChanges2, splash7.1667초 동안1, world 영상시각0에서9.968초 정체 |
| skipOnDrop=false만 변경 | video-probe-nodrop-2026-10-24T11-34-18-744Z: 폐기0, FDG21frame/.7s, splash36frame/1.5s, world288frame/12.0202wall초/영상12초. 최대 frame gap.0460603초·정체.0418148초. world voice.53659/BGM.19625/listener.54956 |
| 정식 기본값 | skipOnDrop=false. --unity-video-allow-drop은 기존 문제 재현 전용, --unity-video-no-drop은 끄기 우선. adapter15검사, 기본/옵션4조합60PASS. 이12초 진단만으로113초 자연완주를 주장하지 않음 |
| 로비 호환 | 원본profile High4:4:4 Predictive를 Windows decoder가 거부. 원본 실제pix_fmt는yuv420p로 chroma444라고 오인하지 않음. 새 runtime lobby_varkan_crypt_loop_v2_unity.mp4: High/yuv420p/B0/BT7093태그·1920×1088·24fps·290frames·12.083333s, 2,336,515B, SHA26252471c7ef248cd7b04b8f0e6d7709858d5d9de8aaffe1285a11027b482616. 원본/runtime전체decode오류0, 전체SSIM.996279. 원본G/I보존 |
| 방화벽 실측 | 새 BuildOptions.None 실행본은 PlayerConnection 로그 없음, 정확한Player PID의 UDP/TCP목록 모두빈값. 규칙/전역방화벽은 변경하지 않음 |

## 자동 완주 검수의 입력 분리

최초 수정 실행 live-player-2026-10-24T11-40-47-179Z는20검사 중18PASS,5종영상decode/음성/자막/로비/skip/replay/게임차단/무예외/폐기0은통과했다. 그러나 world 시각110초가wall72.1845초에끝나고 실제endedEvent=false여서 자연완주2검사는FAIL이다. 일반키/마우스의cut/hold-skip이fixture에섞일수있던경로를분리했다. 명시--unity-lobby-smoke가실행중일때만NativeLobby.AutomatedInput=true로키·마우스이벤트와normalInput읽기를차단하고fixtureAPI는유지한다. 종료뒤false로원복하므로일반실행과검수후로비의조작은유지한다. 기존실패receipt는수정하지않고새실행에서전체자연끝을검수한다.

## 실제113초 완주와 로비 글자 보정

| 단계 | 실제 결과 |
|---|---|
| 자연 완주 | live-player-2026-10-24T11-47-24-787Z, production5526d220 / remote12dde22a7. 실제world ended event true,113.2507256wall초/영상마지막113.25초·2718frame변화·speed1. 최대frame gap.0536982초/정체.0419167초, audioProbe27094회, voice.53659/music.19340/listener.51078 |
| 전체 Player gate |20/20PASS, FDG·타이틀·문·v22b·호환로비 실제decoder/GPU/PNG·분리음성/음악·자막·원본아트·replay/holdskip·게임차단/명시진입·무예외·폐기0. INTRO-PASS.json에 코드/방법 SHA와 원문receipt 보존. 일반OS 입력 인수와 구분 |
| 글자 RED | 이전 실제UnityPNG의 선대caption/detail ROI에서 유효행 각각1, 원본브라우저 같은ROI11. source폰트fvar wght/default 및OS2 모두100/Thin. 12px 폰트hhea높이17.376px보다16.8px drawRect가작고wordWrap/padding상속으로잘림 |
| 로비 폰트 | 기존Noto source SHA194018e6b2b293a7964f037b25c0249ce1418bc9ab3c971060a03aa57861e252 불변. fontTools4.67.0으로400/600/700고정, 각각24964glyph·fvar없음·OS2weight대조, 고유EXODUSER Lobby Sans KR이름과원본OFL동봉. 공용HUD/인벤폰트는교체하지않음 |
| 자간 라벨 | 로비전용padding/margin0·nowrap·Overflow, glyph CalcSize.y/lineHeight이상높이를기존CSSlinebox중심에배치. caption13px serif, detail12px. missingdropdown glyph는두선chevron으로대체 |
| 폰트 bytes | Regular6225052 / SemiBold6221184 / Bold6222884 / OFL4387. 실행미디어 총30개206,351,741B. font source/목적SHA는lobby-assets.json 및I:lobby-fonts.json |
| 재검수 경계 | 영상20/20은5526빌드에서확정했다. 이후변경은로비타이포와probe의로비캡처만. NativeLobbyVideo/CoreLobbyFlow/NativeGame전체 및NativeLobby Update/OpenForPage/FinishIntro/ReplayIntro는실제완주코드와SHA동일. 새33cbaddec빌드의30초probe는12/12PASS, caption/detail유효행11/10으로잘림교정, 직접PNG·독립검토에서이결함의수정PASS를확인했다. 이probe를113초자연완주로위장하지않음 |
| 제작 재현 | Tools/export-lobby-fonts.py 및assetexporter, Python312 + fontTools4.67.0은 I:runtime에설치. 재export에는EXODUSER_FONTTOOLS_PATH 사용, 실제게임에는Python/fontTools불필요 |

## 최종 실행·검수 보존 — 2026-10-24

| 항목 | 확정 근거 / 한계 |
|---|---|
| 실행 | E:/EXODUSER-Unity-Play/EXODUSER-Unity.exe. 고정 경로·일반 빌드, 최신 UI 실행본152파일을 I: 보관 빌드와 전 파일SHA256 대조. 기존 사용자 Editor/Player 보존 |
| UI 실제 검수 | live-ui-2026-10-24T12-00-46-301Z/ui-gate.json:12/12PASS. 5영상실제decode/GPU/PNG, 음성·음악 분리, 폐기0, 예외/decoder오류0, 개발연결0, 완주코드SHA동일. 30초 진단으로113초 완주를 대신하지 않음 |
| 글자 | text-gate.json caption11행/detail10행(이전각1행), 원본대조·실제PNG·independent-typography-review.md에서 이번잘림수정PASS. 모든문자/전체시각품질PASS는아님 |
| 증거 위치 | I:/EXODUSER-Storage/qa/unity-lobby-20261024. INTRO-PASS.json은5526실제완주, ui-gate.json은33cb UI수정, SAVED.json은최종로컬/원격tree·실행해시·I:증분bundle을기록 |
| 남은 범위 | 일반OS입력/포커스, 모든해상도·29언어/RTL·전체CSS전환, 캐릭터생성/저장/계정/완전게임진입. 전체 VISUAL VERDICT: RETOUCH. Godot/웹원본/사용자저장/공용INDEX보존 |


## 2026-10-25 Mac 후속

Mac 일반앱의 첫Metal표시대기실패를 보존했으며, 렌더링옵션비교와 기본옵션재검수 모두 실제20/20PASS·113초자연끝을 확인했다. 최신영상승인/OS입력/pause·focus/전체디자인은별도미확인. 런타임·미디어변경0. [Mac별도영수증과다음단위](UNITY_MAC_LOBBY_20261025.md).


2026-10-25 후속: 세계관재생중일시정지버튼노출을보완했다. 실제Player 제어API pause/resume·focus9/9PASS, OS입력과구분. 기존영상/음향/자막자산무교체. [조작검수](UNITY_MAC_LOBBY_CONTROLS_20261025.md).


2026-10-25 로비 표시 후속: 좌상단 개발 문구/UNITY footer를 제거하고 기존 미리보기를 우측 하단으로 옮겼다. 생성·저장 미지원과 preview 저장 불가 안내를 명시했다. 새 소스 전용 QA 빌드0오류 및 CUA 실제로비 화면 확인. [범위·검수](UNITY_MAC_LOBBY_COPY_20261025.md).


2026-10-25 언어 후속: 로비 29자막 선택·메뉴 ko/en 구분과 원본 locale alias/unknown→en을 연결. 순수536/536·NativeLobby42/42, 실제 선택 렌더는 OS 직접 클릭과 구분. 자국어명/폰트/RTL 미완료. [Mac 통합 검수](UNITY_MAC_LOBBY_LANGUAGE_20261025.md).


2026-10-25 팝업 후속: L/방향키/Enter/Esc·Tab순환과 바깥 클릭 닫기를 실제 Mac 키 입력으로 확인. 종료 확인도 하위 버튼 입력을 차단. 작은 마우스 selector 직접 입력은 미확인. [검수와 경계](UNITY_MAC_LOBBY_POPUP_20261025.md).


2026-10-25 언어 이름 후속: 29개 목록을2열 이름+코드로 변경. 기존폰트23원문 이름 지원, 나머지6개 ko/en 대체 이름. 실제 한/영 목록과2열 키보드 이동 확인, build0오류. 전체자막/RTL과 구분. [근거](UNITY_MAC_LANGUAGE_NAMES_20261025.md).


2026-10-25 시네마틱 후속: 로비와29개 이름/2열 키보드 목록을 공유. 실제 EN 자막 선택, 목록 Esc6초의 skip 차단, 키 해제 후 정상 skip·KO 로비복귀 확인. 일반 build errors0. 전체29자막 글꼴/RTL·정밀 마우스와 구분. [검수](UNITY_MAC_CINEMATIC_LANGUAGE_20261025.md).


2026-10-25 Mac 캐릭터 후속: 생성/선택의 세션 UI와 native preview 이름 전달을 연결했다. 원본 전사만 생성·최대5슬롯·이름 규칙 유지. 영속 저장/기존 슬롯/계정은 미연결. 최신 범위와 검수는 [UNITY_MAC_CHARACTER_UI_20261025](UNITY_MAC_CHARACTER_UI_20261025.md)를 따른다.

## 2026-10-29 Mac A04 5슬롯 로비 글자 가독성 후속

기준은 웹 `index.html`의 로비 CSS와 보존된 1920×1080 웹 캡처다. 브라우저의 로컬 파일 URL은 보안 정책으로 거절되어 웹 동일 5슬롯 상태의 실시간 화면 대조는 수행하지 못했다. 이번 수정은 Unity 로비 글자와 패치노트 실행 버튼의 중복 문구에 한정한다. 로스터·프레임·캐릭터 위치·미디어·텍스트 내용은 변경하지 않았다.

| 표시 위치 | Unity 코드·수치 | 1280×720에서 의도한 물리 글자 | 적용 근거 |
|---|---|---|---|
| 좌상단 빌드 라벨 | `NativeLobbyBuildLabels.Draw`; 웹 정본 12px·행간19.2px·자간1.8px을 `fit=min(width/1920,height/1080)`의 역수로 보정. 웹 현행 `rgba(131,134,134,.5)`/limits `rgba(132,135,135,.5)`를 `buildflavor_web.json`에 동기화 | 12px, 행간19.2px | 좌상단 버전·OFFLINE·limits의 물리 크기와 웹 색상 일치 |
| 우측 자막·메뉴·선택 안내 | `NativeLobby.UpdateLobbyTextScale`; `lobbyMicro=round(12/fit)` | 12px | 웹 보조 텍스트 12px 수준. 1920에서는 기존 12px 유지 |
| 우측 OFFLINE·Steam 안내 | `lobbyMode=max(11,round(11.5/fit))`, `lobbyPromo=max(14,round(12/fit))`, `lobbyPromoDetail=max(11,round(12/fit))` | 약 12px | 3줄 Steam 문구의 행 높이를 57→67, 아래 보조 y653→660, 배너 y674→686으로 옮겨 겹침 방지 |
| 슬롯 문구·전사 요약 | `lobbyText=max(15,round(12/fit))`, `characterSmall=max(20,round(16/fit))` | 각각 최소 12px·16px | 5/5 용량·직업/로컬 저장 캡션 읽기 |
| 패치 노트 버튼 | `DrawPatchNotesLauncher`의 기존 14,12,370×102 hit area, 별도 버전·OFFLINE 텍스트 제거 | 중복 라벨 0 | 웹식 빌드 라벨 단일 caller와 패치 노트 접근 유지. hit area는 아래 후속에서 수정 |

최종 Settings QA ARM64 Player의 실제 1280×720 및 1600×900 창, 전체/1x 화면과 `build-receipt-final.json`은 `_out/UNITY-MAC-LOBBY-READABILITY-20261029/`에 보존한다. 실행 파일 SHA-256 `2122a3706cebb29367200ec16d0f9ce8f0bb9a1ff165b8ce19ee1b9697efdc56`, 빌드 `Succeeded`/오류0. 최종 전체 캡처는 `final-canonical-1280-full.jpg`/`final-canonical-1600-full.jpg`, 각 해상도의 `top-left-1x`/`right-1x`가 실제 픽셀 크롭이다. 타이틀 막대가 64px 추가되므로 이미지 외곽 크기는 1280×784, 1600×964이다. 동일 격리 roster 파일 SHA-256 `67fa35976c91adaa5cce4fac107f4f1035f5c483bbf36abf8ccc6dde607dcf5a`로 A04 종료값과 같다.

**VISUAL VERDICT: RETOUCH (Mac 로비 글자 가독성 범위).** 5/5 슬롯·우측 언어/안내/Steam 문구는 두 크기의 실제 창에서 물리 글자가 커지고 겹침이 없음을 확인했다. 좌상단의 패치노트 별도 문구를 제거해 버전/OFFLINE 이중 출력도 해소했다. 최신 웹 CSS 색을 그대로 적용한 좌상단 50% 회색 메타는 석재 배경 위에서 1x 판독 대비가 여전히 약하다. 다음 산출물은 로비 UI 디자인 담당이 웹 `#lobbyVerOverlay`의 명도 대비 토큰을 실제 5슬롯 화면에서 확정하고, Mac 담당이 같은 값을 정의 JSON에 동기화한 1280/1600 전체·1x 재검수본이다. 현재 웹 DOM 동일 5슬롯 실시간 대조는 브라우저 보안 정책 때문에 미검증이다. 전체 로비 아트·모든 언어·기타 해상도·hover/마우스 전환의 디자인 PASS는 주장하지 않는다.

### 2026-10-29 표시·패치노트 hit/focus 범위 정합

`NativeLobbyBuildLabels.OverlayBounds(offline)`가 좌상단 표시와 클릭·포커스 테두리의 공통 Rect를 계산한다. `fit=min(Screen.width/1920,Screen.height/1080)`, `unit=1/max(.1,fit)`, `size=round(12×unit)`, `letterSpacing=1.8×unit`이다. x/y는 웹 기준 (14,12)×unit, 너비는 현재 라벨·버전·OFFLINE/ONLINE·한도 문자열의 실제 glyph 폭 최대값+4×unit, 높이는 표시 행 수(3/4)×19.2×unit이다. 글자는 이 Rect의 x와 y+unit에서 각 행에 그린다. 버튼·키보드 초점 테두리는 같은 Rect를 사용하고 다른 UI/배경으로 확장하지 않는다. `NativeLobby.PatchNotes.cs`의 별도 라벨은 계속 0이다.

첫 1280 실창에서 Tab은 좌상단 포커스를 잡지 못하고 Return이 선택 캐릭터 입장으로 갔다. `HandlePatchNotesKeys`에 다른 모달/언어창이 없고 초점 이름이 빈 경우 첫 Tab을 `patch-notes-open`에 지정하는 경로를 추가했다. 최종 Settings QA ARM64 Player는 `build-receipt-v2.json`의 `Succeeded`/오류0, 실행 파일 SHA-256 `723461b3a6199019e8720b2c56f48018a070266f4f4bc78809b29ecc960693e9`이다.

| 실제 화면·입력 | 결과 |
|---|---|
| 1280×720 전체/1x | `1280-focus-restored.jpg`/`1280-focus-1x.jpg`: 첫 Tab으로 좌상단 네 줄을 감싼 테두리, 기존 370×102 고정 폭 없음. Return은 v0.7.9 패치 노트 모달을 열었고 `1280-modal-open.jpg`에 본문 표시. 모달에서 N은 뒤 캐릭터 창을 열지 않았고 Esc로 닫은 뒤 같은 좌상단 포커스 테두리 복귀. |
| 1600×900 전체/1x | `1600-focus-v2.jpg`/`1600-focus-1x.jpg`: 첫 Tab의 테두리가 같은 물리 글자 범위에 맞고 하단 limits 줄 잘림·이중 글자 없음. |
| 상태 보존 | 격리 로스터 `characters.v1.json` SHA-256 `67fa35976c91adaa5cce4fac107f4f1035f5c483bbf36abf8ccc6dde607dcf5a`로 이전 A04 값과 동일. |
| 미검증 | CUA 좌표 클릭은 첫 후보에서 포인터만 이동하고 모달을 열지 않아 최종 버튼의 실제 마우스 hit는 확인하지 못했다. 동일 클릭 반복 없이 보류한다. 1600에서 모달 열기·Esc 경로는 별도 실행하지 않았다. |

**VISUAL VERDICT: RETOUCH.** 표시와 포커스 범위 정합 및 1280 키보드 경로는 실제 화면에서 확인했다. 현재 웹 CSS와 같은 좌상단 50% 회색 메타 대비는 여전히 약하고, 마우스 열기는 미검증이다. 다음 Mac 미완료 1건은 로비 UI 담당의 웹 메타 대비 확정값을 Unity 정의에 동기화해 실제 마우스 hit까지 확인한 1280/1600 전체·1x 검수본이다.

### 2026-10-29 좌상단 메타 대비 후보 — Mac 범위

원격 웹 `main:7e0113fe4a1ee5081e9fad166238fce0507f9119`의 `#lobbyVerOverlay` 일반색은 `rgba(131,134,134,.5)`, 제한 줄은 `rgba(132,135,135,.5)`이다. 위 이전 검수는 이 웹값을 그대로 표시한 역사 결과다. 1280·1600의 실제 1x에서 석재 위 네 줄의 판독 대비가 낮아 Mac `Resources/Data/buildflavor_web.json`의 **두 alpha만 0.5→0.9**로 올렸다. RGB·12px 글자·19.2px 행간·1.8px 자간·위치·클릭/포커스 Rect·우측 UI·미디어는 바꾸지 않았다. 웹 `main` 파일은 Mac 담당 범위에서 수정하지 않았다. 웹 담당이 동기화할 정확한 값은 일반 `rgba(131,134,134,.9)`, 제한 `rgba(132,135,135,.9)`이며, `#lobbyVerOverlay` 인라인 스타일과 로비 재표시 때 한도 줄을 채우는 두 `innerHTML` 경로가 대상이다.

| 확인 항목 | Mac 실제 결과 / 경계 |
|---|---|
| 빌드 | Unity 6000.6.7f1 ARM64 Settings QA `build-receipt.json`: Succeeded, 오류0. 실행 파일 SHA-256 `60fc40fa9ed2cacec72abf912f493e6533ea596227bc3309183092ed53ee1bef`. |
| 화면 | `_out/UNITY-MAC-META-CONTRAST-20261029/1280-full.jpg`, `1600-full.jpg`와 각 `overlay-1x.jpg`: 현재 5/5·A04QA4 선택 상태에서 글자 네 줄 판독 개선, 테두리/다른 장면과 겹침 없음. 우측 슬롯·Steam 정보 위계와 캐릭터 위치는 유지. |
| 키보드·모달 | 같은 1280 후보에서 Tab 포커스 Rect·Return 패치 노트 열기·Esc 닫기와 초점 복귀 확인(`1280-focus.jpg`, `1280-modal.jpg`). 1600 첫 Tab 테두리도 `1600-focus.jpg` 확인. 격리 로스터 SHA-256 `67fa35976c91adaa5cce4fac107f4f1035f5c483bbf36abf8ccc6dde607dcf5a` 불변. |
| 마우스 | 직전 동일 입력 코드 후보에서 CUA 400ms 좌상단 클릭은 포인터가 Rect 내부로 움직였으나 모달이 열리지 않았다. 짧은 클릭과 다른 길이로도 결과가 같아 재시도하지 않았다. CUA→Unity IMGUI의 MouseUp 전달 여부는 확인되지 않아 실제 물리 마우스 hit는 HOLD. |

**VISUAL VERDICT: RETOUCH (전체 로비).** Mac 좌상단 대비·글자/포커스 정합은 실제 1280/1600 화면에서 개선 확인. 웹 정본의 `.5`가 아직 `.9`로 바뀌지 않았고, 물리 마우스 열기·동일 상태 웹 실창 대조는 미검증이다. 다음 담당 산출물은 웹 UI 담당의 위 세 위치 alpha 동기화와 실제 마우스 패치 노트 열기/닫기 증거다. 그 전에는 웹·Mac 완전 동등이나 전체 로비 디자인 PASS를 선언하지 않는다.

### 2026-10-29 최신 Mac 검토 실행기 인수

최신 대비 후보의 사용자 검토 실행기는 `_out/UNITY-MAC-META-CONTRAST-20261029/launch-current-mac-review.command`다. 같은 폴더의 `review-manifest.json`이 소스 커밋 `9ed30495b050ac877e62b3989d775b41663fe95d`, 관련 6개 소스 blob, 위 ARM64 앱, 영수증 SHA-256 `73ad4323f660692ddbdbab6cda81168039d7216a260bc5a6d81aa88b3f85d6a2`, 실행 파일 SHA-256 `60fc40fa9ed2cacec72abf912f493e6533ea596227bc3309183092ed53ee1bef`를 고정한다. 실행기는 앱·영수증·manifest hash와 Settings QA 신원을 검사하고, 새 marker가 있는 `_out/UNITY-MAC-A05-IO-LOBBY-META-HUMAN-20261029/qa-sandbox`에만 I/O를 연결한다. 기존 실습 실행기와 저장 root는 그대로 둔다.

`zsh -n`과 실행 권한·manifest 경로를 확인했다. 실제 첫 실행의 단일 PID `67045` argv에서 앱·`-output`·`--unity-qa-sandbox`·1280×720을 확인했고, 첫 화면은 새 빈 profile의 제목 화면이었다. 실행 중 두 번째 호출은 종료 코드 3으로 거절됐고, 첫 PID만 정상 종료했다. 이 실행기 smoke는 기존 1280/1600 로비 화면·키보드 증거를 대체하지 않는다. **기술 실행 PASS / 전체 로비 VISUAL VERDICT: RETOUCH / 물리 마우스 hit: HOLD.** 다음 Mac 미완료는 웹 메타 대비 정본 확정 후 동기화와 실제 마우스 열기/닫기 확인이다.
