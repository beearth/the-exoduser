# UNITY-LOBBY-01 — 원본 로비·세계관 영상의 Unity 네이티브 이식

| 항목 | 구현 계약 |
|---|---|
| 최신 원본 | `G:/exoduser/index.html` SHA256 `8bff9fd683b274fc538df531e7b007ec7c5e60e7317744948ffc2e5b4f088621`; 작업 체크아웃의 구 index를 사용하지 않음 |
| 시작 순서 | FDG → 여캐 타이틀 → 지옥문 정지 타이틀 → ENTER 문 열림 → 세계관 v17 → 로비 |
| 경고문 | 원본 `phase=1 // 0=경고문(제거)`이므로 새 경고 단계를 추가하지 않음 |
| FDG | `fdg_intro.mp4`, 실제 영상 시각 3.2초 또는 ended, 읽기 실패 시 엠블럼 폴백; 마지막 실제 영상시각 변경부터 무진행 12초(준비 완료 후 stall도 포함) 또는 에러 시 영상 정지+엠블럼 3.2초 후 안전 전환. 클릭/아무 키로 다음 화면 |
| 타이틀 | `title_motion_hd_20260929.mp4` 무음 반복, 실패 시 SD `title_motion_20260929.mp4`, 정지 `title_clean_plate_20260929.png` 폴백. 영상 세로 crop 78/768~694/768, 정지 crop 80/793~716/793. 아무 키/클릭으로 문 타이틀 |
| 지옥문 | `intro.mp4` 첫 프레임 정지. 원본 로고+ENTER 아트 사용. ENTER 키/Space/버튼으로 실제 영상 재생, 오디오 .6 |
| 문 실패 복구 | 경과 3초 초과+영상시각 .2초 미만, 영상 에러, 경과 15초 초과, ended 또는 duration−.05초에서 세계관 영상으로 전환 |
| 세계관 | `world_intro_v17_blood_en.mp4`, 영어 VO, 자막 시각은 실제 VideoPlayer.time |
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
