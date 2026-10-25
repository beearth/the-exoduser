# UNITY-LOBBY-01 — 원본 로비·세계관 영상의 Unity 네이티브 이식

| 항목 | 구현 계약 |
|---|---|
| 최신 원본 | `G:/exoduser/index.html` SHA256 `8bff9fd683b274fc538df531e7b007ec7c5e60e7317744948ffc2e5b4f088621`; 작업 체크아웃의 구 index를 사용하지 않음 |
| 시작 순서 | FDG → 여캐 타이틀 → 지옥문 정지 타이틀 → ENTER 문 열림 → 세계관 v22b(사용자 최신 지정, 웹 참조는 v17) → 로비 |
| 경고문 | 원본 `phase=1 // 0=경고문(제거)`이므로 새 경고 단계를 추가하지 않음 |
| FDG | `fdg_intro.mp4`, 실제 영상 시각 3.2초 또는 ended, 읽기 실패 시 엠블럼 폴백; 마지막 실제 영상시각 변경부터 무진행 12초(준비 완료 후 stall도 포함) 또는 에러 시 영상 정지+엠블럼 3.2초 후 안전 전환. 클릭/아무 키로 다음 화면 |
| 타이틀 | `title_motion_hd_20260929.mp4` 무음 반복, 실패 시 SD `title_motion_20260929.mp4`, 정지 `title_clean_plate_20260929.png` 폴백. 영상 세로 crop 78/768~694/768, 정지 crop 80/793~716/793. 아무 키/클릭으로 문 타이틀 |
| 지옥문 | `intro.mp4` 첫 프레임 정지. 원본 로고+ENTER 아트 사용. ENTER 키/Space/버튼으로 실제 영상 재생, 오디오 .6 |
| 문 실패 복구 | 경과 3초 초과+영상시각 .2초 미만, 영상 에러, 경과 15초 초과, ended 또는 duration−.05초에서 세계관 영상으로 전환 |
| 세계관 | 사용자 최신 지정 `world_intro_v22b_paint_en.mp4`, 영어 VO, 자막 시각은 실제 VideoPlayer.time. 구 웹 원본 v17과 디코딩 음성·시각 동일 확인 |
| 자막 데이터 | `world-intro-subtitles-data.js` 원본 29언어 × 32큐. 데이터 전송과 실제 글꼴/RTL 완전 검수는 별도이며 KO/EN을 우선 시각 검수 |
| 부분 스킵 | 클릭/Enter/Space/오른쪽 화살표 → `world-intro-player.js` CUTS 17개에서 현재 시각+.05보다 큰 첫 시각. 마지막 컷 이후 로비 |
| 전체 스킵 | Space/ESC 5초 홀드, 놓으면 누적 0. 원본 완료계정/저장 플래그를 쓰지 않는 세션 전용 |
| 세계관 믹스 | VO 1, BGM .22. 원본 주제가 4곡 중 한 곡 .6으로 문 진입부터 연속 반복, 세계관 재생 시작 후 1초간 .22로 duck. 부분 스킵은 BGM 시각을 변경하지 않음. 볼륨 변경 API; 제작 검수 API가 일반 재생 UI를 덮지 않음 |
| 영상 정지/재시도 | 버튼 pause/resume과 BGM 함께 정지/재개. 에러 상태 재시도 또는 홀드 종료 가능. focus loss 시 정지 후 재개 |
| 로비 미디어 | 원본 crypt 무음 반복 영상 + poster. 원본 바르칸 atlas 384×624, 8열×12행, 96프레임/24fps 및 첫 프레임 폴백. 원본 `lobby-ancestor-sprite.js` 발/심장 기준 배치 공식 적용 |
| 로비 UI | 원본 우측35%/최대560px의 1920×1080 구도, 원본 logo/입장 버튼, 바르칸 이름/선대 소환체 설명, KO/EN UI, 세계관 재시청 |
| 로비 BGM | 원본 `bgm/공통/lobby.mp3` .65 loop, 세계관과 겹치지 않도록 각 페이지 변경 시 이전 곡 stop |
| 저장·계정 경계 | 새 캐릭터/기존 저장 불러오기 미이식으로 비활성. 기존 세이브/API/계정은 접근/수정하지 않음. 별도 `Unity 전투 검수 (임시 캐릭터)`만 기존 Unity 전투에 연결 |
| 다른 화면 비율 | 1920×1080 디자인을 균등 배율로 맞추고 남는 영역에 검은 띠. 원본 가변 레이아웃의 모든 비율 패리티는 미검수 |
| 네이티브 경계 | C# 상태/GUI/VideoPlayer/AudioSource. WebView/runtime JS 없음. 영상마다 기존 decoder stop, RT release, generation 취소로 지연 준비 콜백 차단 |

## 검증과 남은 범위

`unity/Tools/lobby-oracle` 버전 관리 oracle은 현재 원본 4파일 해시와 CUTS/자막을 보존한다. 올바른 project 경로에서 미구현 RED(CS2001)를 확인한 뒤 Core 상태 및 FDG watchdog 65개 assertion GREEN. 설치된 Unity managed assemblies 정적 compile 오류0을 확인했다. 추가 FDG 회귀는 수정 전 NativeLobby의 실제 FDG 제어 블록을 추출해 준비 완료·시각 .1초 고정 상태 16초를 실행했고 진행하지 못하는 행동 RED를 확인했다(`fdg-stall-red.json`). 수정 후 no-progress/새 progress에 의한 watchdog 갱신/에러/ended의 13개 검사가 GREEN이다. 초기 CS2001 확인은 소스 존재 확인이며 행동 검증으로 간주하지 않는다. 추가 비동기 준비/focus 회귀는 실제 `NativeLobbyVideo.cs`를 Unity 경계 double과 함께 컴파일해 준비 중 blur 이후 prepare callback의 자동재생 행동 RED를 재현했다. 수정 후 11개 intent/permission/수동정지/타이틀 정지/에러 검사가 GREEN(`video-intent-green.json`)이다. 이는 실제 코덱 검증이 아니다. 자연 종료는 `WorldEndedNaturally`가 Update의 실제 movie.Ended 분기에서만 true가 되며 Begin/Replay/새 세계관 재생에서 false로 초기화한다. 강제 Finish/스킵은 이 값을 true로 만들지 않는다. 실제 Editor import/Windows Player 영상·자막·오디오·화면 검수는 부모 QA 결과에 따르며 이 문서의 정적 검증만으로 완료를 선언하지 않는다.

원본 로그인/OAuth, 기존 저장 목록·생성·삭제, 캐릭터 선택/캐릭터별 이야기, 패드 조작·진동, 접근성·전체 해상도, 모든 언어 글꼴/RTL, CSS 블러·발광·정확한 fade timing은 미완료다. 맵·모션·이펙트 신규 제작이나 Godot 변경을 포함하지 않는다. `VISUAL VERDICT: RETOUCH` — 원본 구성·매체 연결과 전체 픽셀/상호작용 패리티는 별도다.

## 2026-10-24 Windows Player 오디오 overflow 조사와 재생 호출 방어

- 관측: 첫 Windows Player 로그에 `AudioSampleProvider buffer overflow`가 FDG와 세계관 영상에서 발생했고 최종 receipt가 없었다. 프로세스는 정상 shutdown 로그를 남겼으며 종료 주체는 미확인이다. 이를 게임 검수 PASS로 처리하지 않는다.
- 확인: `NativeLobby.SetPlaybackFocus`는 동일 focus 상태 early return을 이미 갖고 있었다. 따라서 매 프레임 검수 fixture 호출이 실제 반복 `VideoPlayer.Play`의 원인이라는 근거는 없다.
- 방어 수정: 실제 `NativeLobbyVideo` 어댑터를 실행하는 boundary-double 테스트에 동일 true permission 100회 반복과 이미 재생 중인 명시적 Play를 추가했다. 수정 전 compile 성공 후 첫 반복 호출 assertion이 행동 RED였다. 재생 중 `TryStartPlayback`은 `!player.isPlaying` 조건으로 native Play를 다시 호출하지 않는다. 수정 후 기존 focus 11개 + 반복 2개 = 13개 PASS (`video-repeated-play-green.json`). 준비 callback도 같은 start 경로를 사용한다.
- 오디오 API: Unity 공식 [Video Player component manual](https://docs.unity3d.com/6000.4/Documentation/Manual/class-VideoPlayer.html)은 AudioSource의 `Play On Awake`/`Play()`가 영상 오디오 트랙의 재생 제어에 적용되지 않는다고 명시한다. 따라서 음성 AudioSource.Play를 추측으로 추가하지 않았다. VideoPlayer의 AudioSource routing·샘플 출력과 aggregate AudioListener 출력은 실제 새 Player에서 따로 확인해야 한다.
- 한계: 이 방어 수정/13개 회귀 PASS만으로 실제 overflow 원인이나 해결을 확정하지 않는다. 새 Player에서 로그·voice 샘플·BGM 샘플·실제 영상 자연 종료를 재검수한다.

### 실제 재생 비교용 명령행 옵션

정상 실행의 clock 설정·AudioSource 경로는 유지하고, 아래 실제 A/B 근거에 따라 `skipOnDrop=false`를 기본값으로 확정했다. 아래 옵션은 실행 프로세스의 명령행에서만 읽으며 한 번에 하나씩 비교한다. 전체 영상 자연 종료·최종 청각 검수는 별도다.

| 옵션 | 변경되는 경계 | 검수 시 주의 |
|---|---|---|
| `--unity-video-clock-game` | `VideoPlayer.timeUpdateMode=VideoTimeUpdateMode.GameTime` | 준비 후 실제 `timeUpdateMode`와 `canSetTimeUpdateMode`를 확인. 벽시계 대비 영상시각을 측정 |
| `--unity-video-no-drop` | `VideoPlayer.skipOnDrop=false` 강제 | 기본값과 같으며 allow-drop도 함께 있으면 no-drop이 우선 |
| `--unity-video-allow-drop` | `VideoPlayer.skipOnDrop=true` 재현 | 기존 오류 경로를 비교할 때만 명시. 정상 실행에는 사용하지 않음 |
| `--unity-video-direct` | `VideoAudioOutputMode.Direct`, AudioSource 연결 생략 | 준비 전 mute/gain 요청을 저장해 prepare callback에서 적용. 이후 Volume/Mute도 Direct API로 전달. 플랫폼 `canSetDirectAudioVolume`이 false이면 gain 적용은 미지원 |

Direct는 `AudioSource.GetOutputData` 및 Unity AudioListener 믹서를 우회할 수 있다. 따라서 기존 `Voice` 샘플 peak=0은 Direct 오디오 무음의 증거가 아니다. OS 루프백 녹음/청취 등 실제 출력 검수가 필요하며 BGM의 기존 AudioSource 경로는 유지한다. Direct 첫 영상의 gain은 1로 초기화하고 각 페이지의 실제 Volume 요청(.6/1 등)을 준비 이후에도 보존한다. 새 영상은 `Open`의 muted 값으로 초기화한다.

설치된 Unity `6000.4.8f1` managed API reflection으로 enum `DSPTime/GameTime/UnscaledGameTime`과 Direct volume/mute 함수를 확인했다. 실제 Unity DLL을 참조한 어댑터 정적 compile은 경고0/오류0. 기본값·각 옵션·세 옵션 조합의 boundary-double 검사는 총 32개 PASS, 기존 intent 회귀 13개 PASS다. no-drop 구현 전 동일 실행은 `no-drop flag/default` assertion에서 행동 RED였다. 자료는 `I:/EXODUSER-Storage/qa/unity-lobby-20261024/video-diagnostics`에 보존하며 코덱/GPU/청각 검증을 대체하지 않는다.

### 실제 단일 변수 A/B와 기본값 확정

같은 Release 고정 실행 파일·960×540에서 명령행 no-drop 유무만 바꿨다. 실제 clock은 두 실행 모두 `UnscaledGameTime`, 오디오는 `AudioSource`였다. 이 환경의 끊김/overflow를 유발한 프레임 생략 경로를 재현·격리했으며 Unity 전체 코덱/드라이버의 일반 결함으로 확대하지 않는다.

| 실행 자료 (`I:/EXODUSER-Storage/qa/unity-lobby-20261024/`) | frame dropping | 관측 |
|---|---|---|
| `video-probe-baseline-2026-10-24T11-35-04-930Z` | true | player.log의 AudioSampleProvider overflow 757회. FDG 관측 벽시계 3.6339148초/영상시각 3.1초에 frame change 2회, splash 7.2859303초/영상시각 7.1666667초에 1회. 세계관 9.9680167초 stall·관측 frame change 0회 |
| `video-probe-nodrop-2026-10-24T11-34-18-744Z` | false | player.log overflow 0회. FDG 관측 벽시계 1.2310099초/영상시각 .7초에 21회, splash 1.6176341초/영상시각 1.5초에 36회. 세계관 12.0202034초에 288회, 영상시각 12초. 최대 frame gap .0460603초/무진행 .0418148초. VO·BGM·AudioListener peak 모두 0 초과 |

정식 어댑터는 `diagnosticAllowDrop && !diagnosticNoDrop`으로 drop을 설정한다. 실제 production 어댑터를 실행하는 버전 관리 `VideoIntentProgram`에 첫 영상/다음 영상의 기본 false와 명령행 정책을 검사하는 두 assertion을 추가했다. 수정 전 compile 성공 후 정책 assertion에서 RED, 수정 후 기본 실행 15개 PASS다. allow-drop 단독/no-drop 단독/둘 동시도 각 15개 PASS(총60개)다. 기록은 `video-drop-default-{red,green}.log`, `video-drop-variants.json`이다.

이 결과는 12초 probe다. 세계관 duration 113.291667초 전체 자연 종료, 재시청·5초 홀드·최종 실제 청취/화면 검수는 아직 남아 있다. probe receipt의 `worldCompletedNaturally=false`를 완료로 바꾸거나 전체 플레이 PASS로 해석하지 않는다.

## 2026-10-24 사용자 최신 지시 — v22b와 원본 로비 장식 보강

| 항목 | 적용 |
|---|---|
| 최신 영상 | 사용자 확인 지시로 원본 웹 v17 대신 `output/cinematic/a04_demonic_remaster_20261016/world_intro_v22b_paint_en.mp4`를 Unity `StreamingAssets/Lobby/world_intro_v22b_paint_en.mp4`로 byte-exact 복사. 구 웹 SSOT와 최신 제작본 활성화를 구분 |
| 자막·부분 스킵 | 부모 ffprobe/디코딩 검수에서 v22b 113.291667초/24fps, AAC48kHz2ch113.291초이며 v17과 디코딩 오디오 MD5 동일 확인. 기존 29언어32큐/17컷 시각 유지. 원본 oracle의 v17 표기는 source provenance로 보존 |
| 시각 기준 | 실제 full/offline 빈 슬롯 웹 캡처 `reference-full-2026-10-24T11-18-42-602Z/reference-lobby.png`를 직접 보고, 별도 비영구 Chromium context에서 실제 DOM 좌표/폰트/색을 읽어 `lobby-source-layout.json`에 보존. API는 빈 슬롯 GET stub, 실제 저장 접근/쓰기 없음 |
| 우측 프레임 | 로비의 `--ui-frame`은 root의 `img/ui/hell_gothic/frame.png`다. blackiron/frame은 다른 패널 한정 변수라 로비에 적용하지 않음. 원본 border-image22% slice/48px, inset22px 배경의 sigil/iron/gradient를 Chromium560×1080 PNG로 내보내 `Art/lobby/lobby_panel` 사용 |
| 원본 보존 | frame/sigil/iron 원본은 I: QA source-art에 byte-exact 보존. 원본 CSS/그림 해시는 export manifest sources에 포함. 런타임에는 실제 참조하는 합성 PNG 사용. 기존 splash-brand Chromium SVG raster 코드는 보존 |
| 실제 UI 배치 | 1920×1080 기준 우측 x1360/w560. 언어 x1388/y151.5/w140/h27; logo x1388/y195/w488/h104; 빈 카드 x1392/y315·409/w470/h84; 새 캐릭터 x1392/y503/w480/h64 |
| Steam 배너 | 원본 3행14px 문구 y591/h57, 부문구12px y653, 기존 원본 banner x1532/y674/w200/h44. 버튼 클릭은 원본 공식 Steam URL을 연다 |
| 입장·하단 | 구분선 y740, 원본 ENTER x1392/y751/w496/h132. 미구현 상태는 원본 CSS grayscale(1)brightness(.45)를 Chromium에서 정확히 변환한 `lobby_enter_disabled.png`로 표시. 재시청 x1388/y897, 종료 확인 x1856/y895/36px |
| 바르칸 문자 | 원본 13px/44.8px/12px 계층과 y935.6/957.8/1030.8을 반영. 제목은 기존 한글 명조 글꼴 45px+자간11.2px 근사. 모든 글꼴·CSS glow의 완전 픽셀 패리티는 미검수 |
| 임시 전투 | 원본 패널을 덮지 않도록 왼쪽 x14/y112 개발 검수 영역으로 이동. 새 캐릭터/ENTER는 비활성, 기존 저장이나 실제 캐릭터가 생성됐다고 표시하지 않음 |

이 보강의 exporter 구문 검사와 통합 C# 정적 compile 오류0을 확인했다. 실제 export/새 meta/Editor/Windows Player 시각 검수는 부모 작업으로 분리한다. 미디어/폰트/합성의 최종 화면이 검수되기 전 `VISUAL VERDICT: RETOUCH`를 유지한다.

## 2026-10-24 로비 영상 Windows 코덱 호환 사본

실제 Windows Release Player에서 원본 로비 영상에 `Ignoring unsupported High 4:4:4` 및 `Could not find supported video track`가 기록돼 기계적 호환 변환을 추가했다. 원본 ffprobe는 H.264 **High 4:4:4 Predictive 프로파일**이지만 실제 픽셀 형식은 yuv420p다. 프로파일 명과 실제 크로마 형식을 혼동하지 않는다.

| 항목 | 검증 값 |
|---|---|
| 원본 | `assets/lobby/lobby_varkan_crypt_loop_v2.mp4`, 4,577,193bytes, SHA256 `53dae74bda02d0b1abe10f1da467868515ff470a910adb02c6aece55b9340a5c` |
| 보존 | I: QA `lobby-compatibility/53dae74.../source.mp4` 전 파일 SHA 일치. G: 원본 변경 없음 |
| 런타임 | `StreamingAssets/Lobby/lobby_varkan_crypt_loop_v2_unity.mp4`, H.264 High/yuv420p/Bframes0, 2,336,515bytes |
| 런타임 SHA256 | `26252471c7ef248cd7b04b8f0e6d7709858d5d9de8aaffe1285a11027b482616` |
| 크기·시각 | 양쪽 1920×1088, 평균·명목24/1fps, 290프레임, 비디오 duration12.083333초 동일. 리사이즈·프레임레이트 변경 없음 |
| 변환 | ffmpeg libx264 CRF14/presetmedium/yuv420p/bf0/faststart/noaudio. BT709 primaries/trc/matrix CLI 및 frame setparams/x264 VUI 태그를 모두 명시해 ffprobe 3개 BT709 확인 |
| 전체 디코드 | 원본·런타임 양쪽 ffmpeg 전체 프레임 decode 종료0, 오류 로그0 |
| 수치 비교 | 원본을 yuv420p 기준으로 둔 전체 SSIM All=0.996279. 이는 실제 Unity 시각 검수/전체 화질 동등 선언을 대체하지 않음 |
| 전체 exporter | 26개 asset, 합187,678,234bytes. `Tools/Fixtures/lobby-assets.json`에 원본·런타임 SHA/metadata/SSIM/transform 포함 |
| 영수증 | I: QA `lobby-compatibility/53dae74.../receipt.json`, encode/probe/full-decode/SSIM 로그. 최초 색 태그 미완비 후보도 같은 I: 경로에 별도 보존 |

`NativeLobby`는 `_unity.mp4`를 참조한다. 이전 런타임 원본 사본 정리/meta/Git복구/새 Player 검수는 부모 작업이며, 본 작업은 기존 원본/아카이브/Godot/세이브를 삭제하거나 수정하지 않는다. 현재 판정은 새 Windows Player에서 실제 영상 재생을 확인할 때까지 `RETOUCH`다.

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


2026-10-25 Mac: Core/Video변경없이세계관일시정지버튼진입을보완. 별도controls 실제Player9검사로pause/resume·focus상태를확인했고기존자연완주fixture강제focus복구와분리했다. OS직접입력인수는아니다. [증거](UNITY_MAC_LOBBY_CONTROLS_20261025.md).
