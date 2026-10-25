# UNITY-LOBBY-01 — 실행 첫 화면·인트로·로비

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
