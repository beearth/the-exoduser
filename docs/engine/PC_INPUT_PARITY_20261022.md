# PC-INPUT-PARITY — 입력 씹힘(키 버퍼 넘침·일시정지 중 키 뗌 유실) 2026-10-22

기준 `bea45970`(INTEG-15b + TEST-FIX-01), 브랜치 `claude/pc-input-parity-20261022`.

## 1. 증상
- 사용자 실플레이 로그 `_out/play15b/play3.log`에 `Condition "key_event_pos >= KEY_EVENT_BUFFER_SIZE" is true. Breaking.`(display_server_windows.cpp:6801)가 74회 찍혔다. 74개 키 메시지가 버려졌다.
- 74회 모두 `GODOT_FIRST_PLAYABLE_READY`(필드 진입) 직후 한 덩어리로 나왔다.

## 2. 원인 1 — 필드 진입 20초 한 프레임 정지 + Godot Windows 키 버퍼 512
### Godot 소스 동작 (4.7.2-stable)
- `WndProc`는 WM_KEYDOWN/WM_KEYUP/WM_CHAR를 고정 배열 `key_event_buffer[KEY_EVENT_BUFFER_SIZE=512]`에 쌓는다.
- 가득 차면 `ERR_BREAK`로 그 메시지를 버린다. 버려지는 것은 **나중에 온 메시지**다. 키를 뗀 메시지(KEYUP)도 포함된다.
- 버퍼는 `process_events()` 끝의 `_process_key_events()`에서만 0으로 돌아간다. `OS_Windows::run`은 메인 루프 한 바퀴마다 `process_events()`를 1번 부른다.
- 메인 스레드가 한 프레임에 오래 멈추면, 그동안 Windows 입력 큐에 쌓인 메시지가 다음 펌프 한 번에 몰려 들어온다.
  - 키를 누르고 있으면 자동반복 약 30회/초 × (KEYDOWN + WM_CHAR) = 약 60개/초가 쌓인다.
  - 512 ÷ 60 ≈ 8.5초를 넘게 멈추면 넘친다.

### 게임 쪽 원인
- 전사 이야기 영상을 Space/Esc로 넘기면, `parity_video_intro._input` → `finish` → `_launch_entry` → `entry.launch`가 **입력 콜백 안에서 동기로** 실행됐다. 이 경로에서 `load(main.tscn)`, `add_child(main)`(_ready), 첫 프레임 처리가 모두 한 프레임에 몰렸다.
- 측정값(PC, 창 모드, `_out/pc-input-parity/logs/prof3.log`)

| 구간 | 시간 |
|---|---|
| `load("res://scenes/main.tscn")` | 5,417 ms |
| `add_child(main)` → `main._ready` | 6,791 ms |
| (그중 `add_child(world)`) | 2,544 ms |
| (그중 `_bind_native_startup_services`) | 2,519 ms |
| `request_native_lobby_entry` | 724 ms |
| 같은 프레임의 첫 `_process`·그리기 | 약 6,237 ms |
| **한 프레임 정지 합계** | **19.2~21.3 초** |

### 재현
- 도구: `_out/pc-input-parity/tools/input_probe.gd`, `keypost.ps1`, `run_probe.sh`
- 자기 worktree Godot 창의 HWND에만 `SendNotifyMessage`로 실키보드와 같은 순서(KEYDOWN→WM_CHAR, 자동반복은 마지막 키만)를 넣는다. 포커스는 빼앗지 않는다.
- 영상 Space 홀드 건너뛰기 → 필드 진입 내내 Space를 누른 상태(HOLD_THROUGH=1)

| 판 | 진입 정지 | 버퍼 오류 |
|---|---|---|
| 수정 전(bea45970) | 20,166 ms 한 프레임 | **348회** |
| 수정 후 | 13,377 ms (펌프 사이에 나뉨) | **0회** |

## 3. 수정 1 — `godot/scripts/native_demo_lobby_screen.gd` (Mac 소유 파일, 진입 순서 훅만)
- 로비 `_ready`에서 `ResourceLoader.load_threaded_request("res://scenes/main.tscn")`로 같은 리소스를 백그라운드로 미리 읽는다. `entry.launch`의 `load()`는 캐시를 받는다.
- 영상이 끝나면 영상 패널과 같은 검은 바탕(CanvasLayer 100)을 덮는다. 웹 index.html → game.html 이동 때의 검은 화면에 해당한다. 로비가 한 프레임도 비치지 않는다.
- 로드가 끝날 때까지 프레임마다 기다린다. 이 사이 이벤트 펌프가 돈다.
- `RenderingServer.frame_post_draw` 뒤에 `entry.launch`를 부른다. 입력 콜백 밖에서 실행되고, Main의 첫 `_process`는 다음 프레임(펌프 뒤)으로 넘어간다.
- 진입 계약(prepare/launch/rollback/request_native_lobby_entry 순서·판정)은 바꾸지 않았다.

### 남은 위험
- `add_child(main)`(_ready 약 6.8초 + 진입 0.7초)는 여전히 한 프레임이다. → **BOOT-01에서 다중 프레임화**(진입 최대 반복 217~280 ms): [BOOT01](BOOT01_MULTI_FRAME_STARTUP_20261022.md). 이 PC에서는 Space를 계속 누른 경우 약 450개로 512 아래지만 여유가 작다. 느린 PC에서는 다시 넘칠 수 있다.
- 근본 해결은 `world` 로드·`_bind_native_startup_services`(원본 이미지 onload 대기 모사)를 여러 프레임으로 나누는 것이다. world·main 소유(Mac) 작업으로 넘긴다.

## 4. 원인 2 — 일시정지 중 뗀 이동키가 남음(계속 걷기)
- 원본 keydown/keyup(game.html G13214 `K[e.code]=true;KH[e.code]=true` / G13330 `KH[e.code]=false`)은 `G.paused`와 무관하게 눌림 상태를 갱신한다.
- Godot Player는 `PROCESS_MODE_PAUSABLE`이라 일시정지 동안 `_unhandled_input`을 받지 못한다. 인벤토리·성장창 등 일시정지 패널은 Esc 일시정지와 달리 입력 상태를 지우지 않는다.
- 그래서 W를 누른 채 인벤토리를 열고, 연 상태에서 W를 떼고, 닫으면 계속 걸었다.

| 경우 | 수정 전 | 수정 후 | 웹 |
|---|---|---|---|
| W 누른 채 인벤토리 열기 → 연 동안 뗌 → 닫기 | 닫은 뒤 1초에 161px 계속 걸음 | 0px | 멈춤 |
| A 누른 채 성장창 → 연 동안 뗌 → 닫기 | 153px 계속 걸음 | 0px | 멈춤 |
| 패널 연 동안 누름 → 누른 채 닫기 | 걸음 | 걸음 | 걸음 |

## 5. 수정 2 — `godot/scripts/player.gd` (PC 소유)
- `_track_held_input_while_paused`: Window `window_input` 신호에 연결한다. 트리가 일시정지일 때만 이동 4방향의 누름(반복 포함)·뗌과 패링 뗌을 `_native_input_held`에 기록한다.
- 발동(공격·패링 시작·스킬)은 하지 않는다. 일시정지가 아닐 때는 아무것도 하지 않는다(기존 경로 그대로).

## 6. 남은 차이(이번 범위 밖, 기록)
- Esc 일시정지는 `main._toggle_pause`가 `player.clear_native_input_states()`로 눌림을 지운다. 웹은 지우지 않는다. 그래서 D를 누른 채 Esc로 멈췄다가 누른 채 풀면 웹은 계속 걷고 Godot은 멈춘다(다시 눌러야 함). main.gd(Mac 병합 파일) 판단 대상이다. → **2026-10-22 BOOT-01에서 원본대로 수정**(지우기 제거 + 일시정지 중 뗌 기록 확장): [BOOT01 §7](BOOT01_MULTI_FRAME_STARTUP_20261022.md).
- 마우스(LMB 차지) 홀드 중 일시정지 패널에서 뗀 경우는 이번 수정에 넣지 않았다.
- 시험 인공물: PostMessage로 키를 넣으면 느린 프레임에서 KEYDOWN 뒤에 WM_CHAR가 밀려 가짜 누름이 생긴다. 실키보드(입력 큐)에서는 생기지 않는다. 그래서 SendNotifyMessage로 바꿔 측정했다.
- Shift 뗌은 Godot이 WM_INPUT(raw)으로만 받아 메시지 주입으로는 시험할 수 없다.
