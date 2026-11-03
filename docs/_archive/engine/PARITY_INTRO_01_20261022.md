# PARITY-INTRO-01 — 웹 인트로 표시 복원

기준 `origin/codex/parity-hud-02-20261022` = `bf5382592a903c5bfd7ffe08d44dfed77bc29489`. 차이 기준은 main `d79ee3e67`, 캡처 도구 원본은 main `fae057f7f`다. 보스·아레나·맵·PC 수치·저장 writer 변경은 없다. 기존 PID 81277은 보존한다.

## 현행 제품 경로

| 구간 | 웹 원본 | 원본 에셋 | Godot 위치/계약 |
|---|---|---|---|
| 로비 시네마틱 | index.html:2354 이후 playCinematic,2509–2550; world-intro-player.js:4 CUTS | video/intro.mp4 → video/world_intro_v15_clean_en.mp4, world-intro-subtitles-data.js 29언어 | project.godot 기본 demo_lobby.tscn; native_demo_lobby_screen._play_cinematic → parity_video_intro, gate/world 분리; ESC 5000ms, Space/Enter 다음 컷 |
| 생성 직후 전사 이야기 | index.html:3421, character-story-player.js:3–29, CUES | video/warrior_story_v23_clean.mp4; video/subtitles/warrior_story_v23_{lang}.vtt | 새 캐릭터 성공 후 _launch_entry에서 warrior를 기다린 다음 Main 입장; Space/Esc 1200ms |
| 첫 진입 INTRO | game.html:62746–62857 전체 언어 literal;62910–62944;63000–63203 renderer | assets/cutscene/images/00~20.png, 네메시아의 강림 V3.mp3 | native_story_intro + parity_intro_canvas; 기본은 INTRO 한 구간. 전체 화면·카메라·색보정·원형 비네트·흔들림·타이핑·화자·입력대기·2000ms Space |
| 금빛 소환진 | game.html:55323–55333,63433 | sprites/bonfire_barrier.png (동일 원본 기존 Godot 사본) | native_intro_curtain_sequence._BarrierDrawer: 카메라 배율 밖 screen px, r280, t300, alpha min(1,t/120)*.9, 3% pulse. 재시작 life 소환진은 시작 위치 고정 |
| 구역 제목 | game.html:333–339,60241 | 기존 hell_title/cinzel_hell 글꼴 | native_regions._show_area_title: 제1구역 · 썩은 숲 1구역 / THE ROTTEN FOREST; 18% y,760폭,3.1초,.13/.69 opacity keyframes, CSS ease-in-out와 y -15→0→7, 양쪽21% 선 |
| inventory oracle | 기존 PC inventory tests 그대로 | 승인된 Mac Node 실행 파일 | tests/mac_harness.py: --node-bin 따옴표 제거·실행 가능 파일 확인·잘못된 PC 경로는 EXODUSER_NODE_BIN/PATH의 Mac Node로 해소·절대 경로·--version 사전 검증 |

`native_story_intro.json` 및 prologue/warintro 원본 파일은 보존하되 현행 제품 인트로에서는 읽지 않는다. 세계의 기록 I/II/III, 액자 띠, 구 자막, 자동 대사 진행을 제품 경로에서 제거했다. 첫 진입 컷의 t는 메타로 보존하지만 대사 컷은 웹처럼 입력까지 기다린다. 카메라 ease는 원본 quadratic, 이른바 cross fade도 웹 renderer가 실제 계산하는 black 위 fadeAlpha를 따른다.

## 영상 HOLD

PC ffmpeg/Theora 변환 승인 대기는 그대로다. 재인코딩·생성·대체 원화는 없다. Chrome 디코더로 원본 movie의 각 CUTS/CUES 시작+50ms를 PNG로 추출했다. gate2/world17/warrior23 =42장(원본 mvhd 길이8.021/113.292/96.4초), `assets/intro_video_stills/` 및 `data/parity_video_source.json`에 원본 시각·경로·29언어 자막을 기록한다. **영상 움직임/영상 mux VO/음악 동등성은 HOLD**다. 개발 상태 문구는 게임 UI에 표시하지 않는다. still 전환이 영화 완성을 뜻하지 않는다.

## 번역

신규 문구를 창작하지 않았다. INTRO는 원본 KO 메타+localization-data.js의 stories.{lang}.intro/speakers를 ID로 합친 29언어이며 원본 다국어 자막은 그대로 보존했다. 기존 `SPACE 길게 눌러 건너뛰기` 번역 키를 사용한다. 번역대상_전체목록.md는 원본 문자열 재사용이므로 번호 신규 발급 없이 byte/CRLF를 보존했다. 외부 source-manifest.json에 해시/개행 수를 기록한다.

## 검수와 제한

산출물: `~/exoduser-wt/_out/PARITY-INTRO-01/`. 각 캡처는1920×1080, compare_1x는3840×1110(30px 라벨 포함), crop_1x는원본 픽셀 보존 좌우 결합이다. 캡처 하니스의 고정 cue/시계/죽음 표시 fixture는 **비교만**을 위한 것이며 입력 E2E와 구분한다. 웹 INTRO reference는 source_snapshot의 실제 renderer 함수를 독립 canvas에 올렸고, 영상 reference는 실제 video/WebVTT다. 필드는 실제 game.html이다. 게임 전체 상태가 같은 E2E 양방향 캡처를 주장하지 않는다.

테스트/E2E와 최종 시각 판정은 외부 DONE.txt 및 아래 차이 목록에 기록한다. 테스트 통과로 영상 HOLD나 맵/HUD 차이를 PASS로 바꾸지 않는다. 과거 합본 설명은 DEMO11-08 이력이며 현행 계약은 본 문서가 우선한다.

최종 정적 검토: 첫 진입의 줄바꿈·타이핑 prefix와 skip 번역은 _ready에서 사전 계산한다. 프레임 draw/process에서 새 목록 생성 API·ResourceLoader 호출·이미지 로드는 없다. 영상 caption 배열은 준비된 참조를 순회한다. 캡처에서는 원본 양쪽 모두 레슨을 건너뛴 뒤 barrier active/t150 및 제목1.55초를 고정하며, 1500ms wall-clock으로 커튼 종료를 확인한다.

남은 로비 세부 차이: gate 초기 ENTER 엠블럼/입력대기·세계관 재생/음량 mixer UI는 영화 재생과 함께 동일성 미완료다. 정지 fallback의 전체 흐름 검수와 영화 기능 완성은 구분한다. 첫 진입 SFX/voice key 메타는 보존했으나 원본 sample asset 매핑/청음은 검증하지 않았다.


2026-10-22 PARITY-INTRO-01b: 이전 Mac PC 이동 회귀 실패는 저장 namespace와 실행 인자의 불일치였다. 인트로 분기 변경은 확인되지 않았다. Mac 공통 하니스는 PC fixture에 storage 인자가 없을 때 `--demo11-storage=off`를 명시하며 제품/E2E `on` 경로는 유지한다. [원인·계약·검증](PARITY_INTRO_01b_20261022.md).


## 2026-10-22 INTEG-12b 하니스 후속

47h 하니스는 초기 로비 ESC5150ms → 생성 직후 warrior Space1350ms → 첫 진입 INTRO Space2150ms의 실제 press/release 순서를 사용한다. finish/skip signal 폴백은 제거했다. [정확한 계약·단회 검수·제약](INTEG12B_HARNESS_REGRESSION_20261022.md).


2026-10-22 INTEG-12c 후속: 영화 단일 pause 소유·해제 State/렌더 대기 경계의 리플레이 캡처 보호·intro/E2E fresh namespace 계약은 [현행 안전 수정](INTEG12C_BOOT_REPLAY_20261022.md)을 따른다. 본문의 이전 검수 결과는 당시 이력으로 보존한다.


### PARITY-UI-05 현행 재대조 — 2026-10-22

현재 HS-01 parent 기준 UI·연출 재대조/변경은 [PARITY_UI_05_20261022.md](PARITY_UI_05_20261022.md)를 따른다. 기존 스킬 원판·지역 배너·화살표는 이미 존재함을 확인했다. 가이드 검정 커튼, Esc 직접 설정, 설정 원본 탭/배치, 필드 위 clear 카드, 선택→이름 모달, detonate Q art 누락을 다룬다. 컷02 1.8배 차이는 현행 같은 clock에서 미재현. 설정 전체 기능/영상/픽셀 세부는 RETOUCH이며 과거 수치·검증 이력을 완료로 승격하지 않는다.
