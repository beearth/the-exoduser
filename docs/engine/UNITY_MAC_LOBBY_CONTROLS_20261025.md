# Mac 시네마틱 일시정지·포커스 복귀 — 2026-10-25

세계관 재생 중 왼쪽 위에 일시정지 버튼을 표시했다. 정지하면 같은 버튼이 재생으로 바뀌고, 오류 상태는 기존 재생/재시도를 유지한다. 기존 TogglePlayback 경로를 사용하므로 영상과 BGM이 함께 정지·재개된다. 영상·자막·음원·Core·Video adapter는 교체하지 않았다.

ROOT index.html의 worldIntroToggle은 재생/정지 동작이 있지만 worldIntroMix CSS가 일반 재생 상태에서 전체 컨트롤을 숨긴다. 이번 변경은 원본 일시정지 기능을 요청된 Unity 조작 UI에서 접근 가능하게 하는 보완이다. ROOT selector는 v15이고 현재 PC 승인본은 미확정이므로 이 파일을 최신 영상 승인 근거로 삼지 않는다. 컨트롤 좌표는1920×1080 기준(28,26),240×48이고 기존 화면 맞춤 변환을 사용한다.

## 실제 검수

| 항목 | 결과·한계 |
|---|---|
| 최초 controls 검사 | 실제 Player8/9. 수동pause/resume은통과했으나 focus loss 중 영상이0.7916667초진행. 기존 자연완주fixture가매Update SetPlaybackFocus(true)를호출하는검사간섭 확인 |
| 검사 분리 | 명시 `--unity-lobby-controls-smoke`만 별도플래그를사용해 매프레임강제focus복구를제외. 기본클라이언트와기존자연완주fixture의동작은유지 |
| 최종 검사 | 일반ARM64 Player, 추가렌더링옵션없음,22초/9개모두PASS. gate준비/세계관재생/pause시영상+BGM정지/수동pause후focus왕복에도정지유지/resume/focus상실정지/focus복귀재생/게임진행차단/decoder오류없음 |
| 정지 실측 | 수동pause 0.8초관찰의영상시각변화0; focus상실0.8초관찰도0. 각각재개0.8초후영상시각0.3초초과진행과music.isPlaying 확인 |
| 빌드 | Unity6000.6.7f1/StandaloneOSX/ARM64/BuildOptions.None/Succeeded/errors0/1,406,122,391B. build-controls-focus/EXODUSER-Unity.app |
| 화면 | 1920×1080 PNG에서재생중‘일시정지’,정지중‘재생’라벨과한글자막을직접확인. 최초진단UiInputTrace 소스/meta는외부diagnostics폴더로보존해이번빌드에포함하지않음 |
| 로그 | runtime exception/shader error/입력trace없음. 기존AVFoundation color primaries 경고는남음 |
| 구분 | native Player 제어API검사이며실제OS창전환/마우스클릭검사가아님. 113초자연완주/20검사통과는직전df80b8f2f 문서의별도실행이고이번짧은검사로재집계하지않음 |
| 남은 범위 | 직접마우스/OSfocus, 720p·초광폭의새컨트롤시각,29언어/RTL전체표시,최신미디어승인,전체디자인인수,첫Metal표시대기원인 |

[재생 중 실제 화면](previews/lobby-controls-20261025/playing.png) · [정지 중 실제 화면](previews/lobby-controls-20261025/paused.png) · [실패/수정 후 영수증](UNITY_MAC_LOBBY_CONTROLS_20261025.json)

## 이어갈 작업

시네마틱 중심 로비의 불필요한 개발 문구와 조작 안내를 정리하고, 중앙HUD·좌우인벤구도는보존한다. 다른Mac지원채팅은PC실행selector/최신승인근거/자막원본대조만읽기로담당하며이브랜치코드소유는기존Mac담당에유지한다. 지원채팅의928cue동일성보고는원문receipt회수전까지별도보고이며전체29언어화면PASS가아니다.

중단후재개시기존Mac `unity/automation.toml`이사라졌고view는카드만반환했다. 현재ACTIVE/실제예약wake는재확인되지않았으며중복자동화를만들지않았다. 이전설정확인을현재자동실행완료로확대하지않는다.
