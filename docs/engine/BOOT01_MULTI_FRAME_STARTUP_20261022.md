# BOOT-01 — 필드 진입 다중 프레임화 + Esc 일시정지 키 상태 (PC, 2026-10-22)

기준 `bdc8ba4a1`(claude/pc-input-parity-20261022), 브랜치 `claude/pc-boot01-20261022`, worktree `G:/exoduser-wt/pc-skill-writers`(재사용).
로그·도구·캡처: `G:/exoduser-wt/_out/pc-boot01/`(tools/boot_probe.gd·run_probe.sh·keypost.ps1·analyze_iter.py, logs/, probe/, web/).
원본 기준 = `godot/source_snapshot/game.html`(웹 줄 번호는 이 파일 기준, `G:/exoduser/game.html`과 해당 구간 동일).

## 1. 결론

| 항목 | 전(bdc8ba4a1) | 후 |
|---|---|---|
| 진입 경로 최대 엔진 반복(펌프~펌프) | **7,593 ms**(무입력) / **8,025 ms**(Space 홀드) | **217~280 ms**(무입력 3회 256.0·217.3·224.8, 홀드 3회 279.8·266.1·276.4) |
| 진입 중 500 ms 넘는 반복 | 4~5개 | 0개(진입 구간). 앱 시작 첫 프레임 1.27~1.32 s는 별도(§6) |
| 영상 건너뛰기 → Main 화면 전환 | 12.8 s(무입력) / 15.5 s(홀드) | 3.75~4.25 s(무입력) / 4.30~4.60 s(홀드) |
| Space 홀드 진입 키 버퍼 넘침 | 0회(이번 측정 1회; 반복 332개로 512 아래, 여유 작음) | **0회 ×3** |
| 진입 화면 | 검은 화면 | 웹과 같은 부트 로딩 화면(랜덤 로딩 이미지·문구·막대·팁) |
| Esc 일시정지 중 D 누른 채 → 누른 채 해제 | 0 px(멈춤) | 155.6 px/1 s(계속 걸음, 웹과 같음) |

측정 단위: 엔진 반복 = `frame_post_draw` 뒤 첫 `physics_frame`/`process_frame`부터 다음 같은 지점까지(사이에 OS 이벤트 펌프 1회). 키 버퍼 넘침은 이 간격으로 결정된다.
이 PC는 연산이 불안정해 같은 판도 회마다 ±30% 흔들렸다(예: world 로드 1.5~4.5 s, 같은 수정판 최대 반복 217~280 ms). 그래서 모든 판을 3회 이상 재고 범위로 적었다.

## 2. 계측 (전)

도구: `tools/instrument.py`가 지정 함수의 최상위 문장마다 `Time.get_ticks_usec()` 표식을 끼운 임시 사본(커밋 안 함, 측정 뒤 원복)을 만들고 `boot_probe.gd`가 로비 → 새 캐릭터 → 전사 이야기 → 진입을 실제 경로로 돈다.

### 2-1. 한 반복에 몰린 일 (전)

| 순위 | 함수(문장) | 시간 | 성격 |
|---|---|---|---|
| 1 | 첫 메시지 큐 비우기의 원본 이미지 onload(`world._native_source_object_onload` 4,470 / `_native_source_extra_onload` 2,286) | **6,734 ms**(1회 최대 729 ms) | GDScript 픽셀 루프. 사용자 말 "첫 `_process` 5.8 s"가 이것 |
| 2 | `add_child(world)` → `world._ready`(MAP11 장면: 나무·소품 텍스처 load, 아레나 뷰, 사망 연출 configure) | 2,270~5,650 ms | 리소스 동기 load |
| 3 | `_bind_native_startup_services`(`register_native_source_object_images` 1,830~2,923 / extra 328~513) | 2,254~3,444 ms | 리소스 동기 load |
| 4 | `native_world_drops.configure`(`_mask_black` 2프레임) | 581~804 ms | 픽셀 루프 |
| 5 | `request_native_lobby_entry` → `native_story_intro.begin`(컷 이미지 21장 디코드) | 599~742 ms | 파일 디코드 |
| 6 | `_install_native_map11_combat_owners` | 478 ms | 리소스 load |
| 7 | `hud._ready` | 258~406 ms | 리소스·노드 |
| 8 | `native_pets.configure` | 282 ms | 리소스 |
| 9 | `web_field_view` 나무 375 / 소품 304 | (2에 포함) | 리소스 |
| 10 | `entry.prepare`(저장 쓰기) | 76~96 ms | 디스크 |

- 진입 한 반복 = launch(8.5 s, `frame_post_draw` 안) + 펌프 + 다음 반복 첫 물리 단계(onload 6.7 s). 측정 로그 `logs/base_prof1~4.log`, 분석 `probe/base_prof*/bt_profile.txt`.
- `--verbose`로 진입 중 메인 스레드가 동기로 끝낸 리소스 읽기 980개(png 800·청크 res 170 등)를 셌다(`logs/boot_main_thread_loads.txt`).
- 로비 "만들기 → 전사 영상 시작"도 0.93~1.25 s(영상 프레임 23장 동기 load).

## 3. 분할·이동 내용 (초기화 순서·계약 불변)

### 3-1. 예열 — `godot/scripts/native_boot_prewarm.gd`(신규, PC)
로비 `_ready`에서 시작(입력-패리티의 main.tscn 백그라운드 읽기와 같은 자리). 로비·영상·로딩 화면 동안 돈다.
1. 리소스: 우선 목록(전사 영상 프레임 23장) → `data/native_boot_prewarm_manifest.json`(980개)을 `ResourceLoader.load_threaded_request`로 동시 4개씩 읽고 진입 뒤 30초까지 참조를 붙잡는다. 진입 중의 같은 `load()`는 캐시를 받는다(같은 리소스 객체).
   - 동시 4개: 백그라운드에서 읽힌 텍스처의 GPU 업로드는 다음 그리기에 몰린다. 12개일 때 그리기 501 ms 반복이 생겨 4로 낮췄다.
   - 목록은 성능 힌트다. 빠지거나 낡으면 그 항목만 예전처럼 진입 중 동기로 읽힌다. 재생성: `godot/tools/boot01_gen_prewarm_manifest.py <--verbose 로그> godot/data/native_boot_prewarm_manifest.json`(로그 창 = `PROBE after_create`~`PROBE main_scene_current_ms`).
2. 이미지 처리: 모듈마다 정적 함수 `native_boot_prewarm_jobs(context)`/`native_boot_prewarm_kernel(image, job)`(멤버 접근 없음)를 두고 워커 스레드에서 미리 돌린다. 결과는 키로 보관, 모듈은 `read_result(key)`로 받아 쓰고 없으면 예전처럼 그 자리에서 계산한다.

| 모듈 | 미리 하는 일 | 같은 결과 근거 |
|---|---|---|
| world.gd(Mac) | 원본 onload 픽셀 처리(hard_alpha·key_magenta·luma_key·edge_erase, 보스 문 white_bg 7회 → 1종) | 루프를 정적 `native_source_onload_rgba`로 **옮기기만** 함. 진입 중 경로·예열 모두 이 함수. 입력 = 같은 경로 텍스처 `get_image`→RGBA8→`get_data` |
| native_world_drops.gd(Mac) | 드랍 빔 2프레임 RGBA8 + `_mask_black` | `_mask_black`을 정적 함수로(본문 불변) |
| native_story_intro.gd(Mac) | 인트로 컷 이미지 21장 `Image.load_from_file` → `ImageTexture` | begin과 같은 경로 규칙(모든 언어 합집합 21장) |
| 로딩 화면 | 이번 세션 로딩 이미지 1장 | §5 |

`tests/test_pc_boot01_prewarm.gd`가 world 작업표 전 항목·드랍 2장의 예열 결과 바이트 = 기존 동기 경로 바이트를 단정한다.

### 3-2. Main `_ready` 단계화 — `main.gd`(Mac) + `native_demo_lobby_entry.gd`(Mac) + `native_boot_frame.gd`(신규, PC)
- `_ready` 본문을 `_native_ready_body()`로 이름만 옮기고 `_ready`가 부른다. 본문 순서·판정·조기 return은 한 줄도 바꾸지 않았다.
- 단계 지점(`await _native_boot_stage("…")`, 본문 줄 앞에 끼움): world 생성 앞 / player 생성 앞 / `source_system_affixes.rebuild` 앞 / camera 앞 / 조명 앞 / 펫 앞 / 회복 바인딩 앞 / `hud.pause_requested.connect` 앞 / `_bind_native_intro_curtain_view` 앞 / 보스 액터 설치 앞. 그리고 entry가 `request_native_lobby_entry` 직전 1회.
- `native_boot_staged` 메타가 있을 때만 양보한다. 메타는 `entry.launch_staged`(로비 실제 진입)만 준다. 메타가 없으면(`entry.launch`, 하니스·테스트의 main.tscn 직접 부팅) `_native_boot_stage`는 즉시 돌아오고 `_ready`는 예전처럼 한 번에 끝난다.
- 양보 = `NativeBootFrame.next()` 두 번: 그려지는 창은 `frame_post_draw` 직후에 돌아온다(단계 일이 반복 맨 끝에 놓이고 바로 펌프). 첫 번째 프레임은 앞 단계에서 붙은 노드의 첫 그리기(셰이더·글리프·업로드)만 하게 비워 둔다. 헤드리스·최소화 창은 `process_frame`으로 돌아온다(기다리는 중 최소화돼도 멈추지 않음).
- `entry.launch_staged` = `launch`를 `_launch_begin`/`_launch_finish`로 나눈 것과 같은 순서: prepare → load → instantiate → 메타 → `add_child` → (본문 끝 대기 → 1프레임) → `request_native_lobby_entry` → current_scene·로비 해제. `launch`는 그대로 동기(두 함수를 이어 부름).

### 3-3. 게이트(진입 끝나기 전 틱·입력 차단)
단계 사이 프레임에서만:
- 트리 일시정지 → world·player·적·카메라(PAUSABLE) 정지. 단계 본문은 원래와 같은 비정지 상태에서 돈다(원본 계약: `native_source_player_initialization._ownership_error`가 world 정지 시 거절 — 처음엔 전 구간 정지로 해 이 거절이 났고, 단계 사이만 정지로 바꿨다).
- Main 하위 전 노드의 `_process`·`_physics_process`·내부 처리·`_input`·`_unhandled_input`·`_unhandled_key_input`·`_shortcut_input` 플래그를 기록 후 끄고, 다음 단계 시작 때 기록값 그대로 복원(ALWAYS 노드 HUD·메뉴 등도 멈춤).
- 일시정지 중 이동키 눌림·뗌은 PC-INPUT-PARITY의 `player._track_held_input_while_paused`가 기록한다(웹 KH가 부팅 중에도 갱신되는 것과 같음).
- 본문 끝 뒤에도 게이트를 유지하다가 `request_native_lobby_entry` 바로 앞에서 푼다 — 동기 부팅에서 `_ready`와 진입 사이에 틱이 없던 것과 같다.
- 단계 사이 프레임에 메시지 큐(call_deferred)는 비워진다. 이것이 "프레임을 넣는 것"의 유일한 순서 차이다(작업 지시가 허용한 call_deferred·await 단계화 범위). 같은 시드 상태 비교(§4-3)에서 차이 없음.

### 3-4. 진입 로딩 화면 — `godot/scripts/native_boot_loading_screen.gd`(신규, PC), 로비가 띄움
§5.

## 4. 검증

### 4-1. 최대 반복(비계측 실행, 창 모드 1920×1080, `run_probe.sh`)
| 실행 | 진입 구간 최대 | 500 ms 초과(전 구간) | 영상 건너뛰기→Main |
|---|---|---|---|
| 전 base_t1 | 7,592.6 ms | 4 | 12,785 ms |
| 전 hold_base1(Space 홀드) | 8,025.2 ms | 5 | 15,491 ms |
| 후 fix_t1 | 256.0 | 2(앱 시작 1,270 / 만들기→영상 529) | 4,060 |
| 후 fix_t2 | 217.3 | 1(앱 시작 1,320) | 4,246 |
| 후 fix_t3 | 224.8 | 1(앱 시작 1,313) | 3,750 |
| 후 hold_fix1/2/3 | 279.8 / 266.1 / 276.4 | 1 / 1 / 1(앱 시작) | 4,600 / 4,299 / 4,363 |
| 최종 코드(경합 방지·헤드리스 예열 끔 반영) final_t1 / final_t2 | 274.2 / 170.1 | 1 / 1(앱 시작 1,467 / 1,375) | 4,952 / 2,960 |
| 최종 final_hold1(Space 홀드) | 171.5 | 1(앱 시작 1,322) | 2,956 |

- fix_t1의 만들기→영상 529 ms는 프로브의 로비 체류가 약 5초로 짧아 전사 영상 프레임 예열이 끝나기 전에 만들기를 누른 경우다(1/3회). 실제 사용은 이름 입력 등으로 더 길다. 미해소 위험으로 남긴다(§6).
- 후 단계 로그 예(fix_prof8_2): world 0 → player 204 → … → body_done 1,197 → complete 1,235 ms(각 단계 사이 2프레임).

### 4-2. Space 홀드 키 버퍼 넘침
keypost.ps1(SendNotifyMessage, 자기 창 HWND에만, 마지막 키만 자동반복)로 영상 Space 홀드 건너뛰기 → 진입 내내 누름 유지.
| 판 | 넘침(`key_event_pos >= KEY_EVENT_BUFFER_SIZE`) | 받은 반복 |
|---|---|---|
| 전 hold_base1 | 0 | 332(최대 반복 8.0 s — 512 아래지만 여유 작음) |
| 후 hold_fix1/2/3 | **0 / 0 / 0** | 181 / 174 / 175 |
| 최종 final_hold1 | **0** | 146 |

### 4-3. 진입 뒤 게임 상태(같은 시드)
프로브가 영상 건너뛰기 직전 `seed(20261022)`. 로딩 화면 난수는 전역 `randi()`를 건드리지 않게 별도 RandomNumberGenerator를 쓴다.
| 지점 | 전 vs 후 |
|---|---|
| 진입 직후(위치 4020,7420·HP/MP/ST·스테이지·인트로 phase) | 동일 |
| 인트로 넘긴 뒤 | 동일 |
| 레슨 시작·+2 s(lesson_active true) | 동일. 2회차에 mp 소수점 0.0125 차이(회복 틱 타이밍) — 전판끼리도 같은 크기로 달라 측정 잡음 |
| 레슨 넘김 +4 s 적 스폰 | 적 5마리, 종류·좌표 동일(이동 중 소수점 ±0.3 px), 앵글러 1 |
상세 `logs/state_base_s1·s2`, `state_fix_s1·s2`.

### 4-4. 회귀 — 표는 [보고서](orders/reports/pc-boot01_REPORT.md) §4

### 4-5. 수정 중 발견·처리한 문제
- 처음 판은 단계 부팅 전체를 트리 일시정지로 감쌌다 → 초기화 디스패처가 "world 정지"로 거절(진입 실패). 단계 사이 프레임만 정지로 바꿨다.
- 창 모드 07 로비 테스트처럼 로비 직후 바로 진입하면 main.tscn 백그라운드 읽기와 예열이 같은 리소스를 동시에 읽는다. 예열은 main.tscn 읽기가 끝날 때까지 우선 항목(전사 영상 프레임)만 요청하도록 했다. (07 테스트 자체의 preload 실패 23건은 기준판에서도 같은 수로 난다 — 보고서 §4.)
- 헤드리스(더미 렌더러)에서 백그라운드 텍스처 생성이 "Initializing already initialized RID"를 냈다 → 헤드리스에서는 예열을 끈다(동작은 예전 동기 경로).

## 5. 진입 로딩 화면 = 웹 그대로
웹 캡처(`_out/pc-boot01/web/`, 헤드리스·음소거, 격리 저장 서버 3397): 전사 이야기 건너뛰기 → game.html → 약 9초간 `#stageTransition` 부트 로딩(랜덤 `img/lording/N.png`, "에셋 로딩 중..." → "몬스터 스킨 로딩..." → "시작 화면 준비 중..." , 막대, 팁) → 인트로 컷신.
| 요소 | 웹(실측 DOM, 1920×1080) | Godot |
|---|---|---|
| 배경 이미지 | `img/lording/1~19.png` 세션당 1장(63546, `_bootRdPicked`), object-fit:cover, `saturate(1.1) brightness(1.05)` | 같은 파일(원본 경로 = 인트로와 같은 source root), KEEP_ASPECT_COVERED, CSS saturate 행렬+밝기 셰이더. 같은 이미지 평균색 3구역 차이 ≤0.3/255 |
| 문구 | y928 h56, 흰색 Noto Sans KR 700 38.4px, 자간 11.52px, 그림자 0 0 15px .85 | 같은 위치·글꼴 스택 700·38px·자간 12px. 그림자 흐림은 Godot Label에 없어 옅은 넓은 외곽(α.22)으로 근사 |
| 막대 | x840 y996 240×4, rgba(255,255,255,.25), 채움 #ff8a43, 너비 전환 .2s | 같은 값, 직접 그리기(반지름 2) |
| 팁 | y1006 h20, #888 13.6px 자간 2.04px, 16개 중 랜덤 시작·3초마다 .3s 바꿈, '게임 시작!'에서 회전 멈춤 | 같은 16개(63699~63716), 같은 주기·멈춤. 💡는 시스템 글꼴로 그려짐 |
| 표시/숨김 | opacity .3s | 같은 .3s, 레이어 101(인트로 위에서 사라짐 = 웹 DOM이 캔버스 위) |
| 단계 문구 | `_boot` 8~78 '에셋 로딩 중...'→80→85→92→98 '게임 시작!' / `_startDemoNew` 'DEMO 로딩...'→20 '캐릭터 초기화...'→50 '몬스터 스킨 로딩...'→75 '맵과 몬스터 생성 중...'→98 '시작 화면 준비 중...'→99 '맵과 움직임 준비 중...'→100 '완료' | 앞 묶음 = 예열 진행률(8+완료/전체×70은 원본 `_preloadAssets` 식), 뒤 묶음 = Main 단계 이름 대응(`STAGE_STEPS`) |
문구 번역: `_L` 쌍은 원본 영어 그대로, 나머지는 기존 catalog(`demo11_ui_i18n.json`) `UI.text` — 없는 키는 원문(원본 `_T` 폴백과 같음). 새 번역 키 추가 없음.
비교 캡처: §REPORT.

## 6. 남은 것·위험
- 앱 시작 첫 프레임 1.27~1.32 s(전 1.15~1.61 s): 엔진 부팅 직후 로비 `_ready` + 로비 시네마틱 프레임 19장 동기 load. 이번 add_child 범위 밖, 변경 없음.
- 만들기→전사 영상 시작: 예열 전에 누르면 영상 프레임 23장 동기 load(전 0.93~1.25 s, 후 1/3회 529 ms).
- 로딩 이미지·인트로 컷은 원본 source root(`res://../`)에서 읽는다(기존 인트로와 같은 방식). 내보내기 빌드에서 이 경로가 없으면 이미지 없이 검은 바탕 + 문구·막대만 보인다 — 인트로 컷과 같은 미해결 항목.
- 예열 목록은 Main 쪽 리소스가 바뀌면 낡는다(동작은 같고 진입이 그만큼 다시 무거워짐). 큰 리소스 변경 뒤 재생성 권장.
- 예열은 로비에 들어가는 즉시 시작해 진입 전 최대 수백 MB(텍스처)를 미리 잡는다. 진입하지 않고 로비에 머물러도 유지된다.

## 7. Esc 일시정지 키 상태(S-03)
원본: keydown 13184 Esc → `togglePanel('settings')` → `G.paused=true`, `K['Escape']=false`만. KH(눌림)는 지우지 않는다. keydown 13214 `K/KH=true`·keyup 13330 `K/KH=false`·mouseup 13412 `MB=false`는 G.paused와 무관. 무기 차지는 틱에서 `!isHeld('weapon')`이면 발사(16852).
Godot 전: `main._toggle_pause`가 일시정지 들어갈 때 `player.clear_native_input_states()` → 누른 채 멈췄다 누른 채 풀면 멈춤.
수정:
- `main._toggle_pause`의 지우기 호출 제거(포커스 상실 시 지우기 = 웹 blur 13381은 player가 그대로 함).
- `player._track_held_input_while_paused` 확장: 일시정지 중 이동 4방향 누름·뗌(기존) + 패링·무기(LMB)·실드·마법의 **뗌만** 기록(누름은 기록하지 않음 — 메뉴 클릭이 공격으로 남지 않게). 차지 중 무기를 뗐으면 해제 직후 첫 물리 틱에 `release_attack()`(원본 틱 판정과 같음).
| 경우(keypost 실키 모사, 자기 창) | 전 | 후 | 웹 |
|---|---|---|---|
| D 누른 채 Esc → 정지 중 D 뗌 → Esc 해제 | 0 px | 0 px | 멈춤 |
| D 누른 채 Esc → 누른 채 → 누른 채 Esc 해제 | **0 px** | **155.6 px/1 s** | 계속 걸음 |
| 정지 중 D 누름 → 누른 채 해제 | 164.8 px | 155.6 px | 걸음 |
| 다 뗀 뒤 | 0 | 0 | 멈춤 |
웹 열은 원본 코드 대조(위 줄 번호)이며 웹 실행 측정은 하지 않았다. 로그 `logs/pause_base1.log`, `logs/pause_fix1.log`.

## 8. Mac 파일 변경 목록
main.gd · world.gd · native_demo_lobby_entry.gd · native_demo_lobby_screen.gd · native_world_drops.gd · native_story_intro.gd · parity_video_intro.gd(정적 `frame_assets` 추가만). PC 파일: player.gd, 신규 native_boot_prewarm.gd·native_boot_frame.gd·native_boot_loading_screen.gd·data/native_boot_prewarm_manifest.json·tools/boot01_gen_prewarm_manifest.py·tests/test_pc_boot01_prewarm.gd.
