# 웹↔Godot 동일성 차이 목록 — 2026-10-22

## 0. 새 완료 기준 (사용자 결정 2026-10-22)

> **완료 판정 = 웹 게임과 같게 보이고 같게 플레이되는가. 테스트 PASS는 필요조건일 뿐이다.**

사용자는 PC에서 Godot 통합본(INTEG-10)을 직접 플레이한 뒤 "전체 게임이 다른 게임"이라고 판정했다. 신규 작업은 모두 멈췄다. 이 문서는 같은 장면을 웹과 Godot에서 나란히 캡처해 눈으로 비교한 차이 목록이다. 코드·에셋은 수정하지 않았다.

| 항목 | 값 |
|---|---|
| 웹 기준 | G:/exoduser main 작업 사본(HEAD 07bdb8d8e). game.html은 godot/source_snapshot/game.html과 바이트 동일. **index.html에는 커밋되지 않은 타 세션 변경 23줄이 있는 상태로 캡처했다.** |
| 웹 실행 | `PORT=3399 EXODUSER_SAVE_DIR=_out/parity/websave node server.cjs`. 서버 저장은 격리 폴더, 브라우저는 Playwright 헤드리스 Chrome(채널 chrome, H.264 영상 재생용)·음소거·격리 프로필. 1920×1080. 진입 URL은 `index.html?test=1`(데모 빌드 오프라인 경로, NW/Steam판과 같은 `_testMode`) |
| Godot 기준 | INTEG-10 `9133e2782`. 캡처용 detached worktree `G:/exoduser-wt/parity-capture`(.godot은 integ10-play에서 복사, import 안 함). Godot 4.7.2 창 모드(1920×1080, `--audio-driver Dummy`), 캡처 스크립트는 SceneTree 하니스 |
| Godot 격리 user dir | 기본 `EXODUSER-parity-capture-Isolated-20261022`. **로비 저장소가 `EXODUSER-demo11-` 접두사를 강제하므로**(아래 L-03) 로비 경로 1회만 `EXODUSER-demo11-parity-capture-Isolated-20261022`를 썼다. 실사용 폴더 `EXODUSER-Godot-Native-First`는 쓰지 않았다 |
| 사용자 창 | integ10-play의 사용자 게임 창(integ10.log)은 건드리지 않았다. 캡처 시점에는 해당 프로세스가 목록에 없었다 |
| 산출물 | `G:/exoduser-wt/_out/parity/` — `<번호>_<장면>_web.png` / `_godot.png` / `_compare.png`(왼쪽 웹·오른쪽 Godot, 0.5배 축소. HUD 05번만 1x 크롭) |

### 0-1. 캡처 방식과 한계 (정직 기록)

- **웹**: 로비→시네마틱→캐릭터 생성→스토리→game.html 인트로→가이드→필드는 실제 입력(키·클릭)으로 진행했다. 다음은 콘솔로 상태를 맞췄다.
  - 레슨 건너뛰기: `_parryLesson.skipAll()`
  - 적 5마리 링 소환: `mkEn`
  - 무적: `P.iframes`, 보스전에서는 `P.hp=P.mhp` 반복
  - 앵글러·중앙 위치 순간이동: `P.x/P.y`
  - 보스 진입 플래그: `G._fbDone/_bossUnlocked/_bossLoadPhase`
  - 보스 처치: `hurtE` 반복
  - 출구 이동, 사망(`P.hp=0`)
  - 첫 전투 캡처(07b·07c) 시점에 웹 플레이어는 이미 fallen(HP 0, 부활력 카운트다운) 상태였다. 무적값이 피해를 막지 못했다. 데미지 숫자 비교에는 07e(지옥강타)를 쓴다.
- **Godot**: SceneTree 하니스는 일반 실행과 다음 두 가지가 다르다.
  - 스토리 인트로가 자동으로 켜지지 않는다. 그래서 `native_story_boot` 메타로 켰다. 로비 진입 경로에서는 제품 코드가 직접 설치했다.
  - 컷 시점은 `story.advance(ms)`로 맞췄다.
  - 다음은 제품 메서드를 직접 호출했다(테스트 하니스와 같은 방식).
    - 가이드: `advance_native_guide`/`finish_native_guide`
    - 레슨: `skip_all`
    - 스킬: `dispatch_native_skill_slot`
    - 공격: `request_attack`
    - 사망: `receive_damage` 반복
    - 클리어: `native_demo_boss_defeated.emit(0)` 계약 신호(자연 보스 처치 경로가 없어서)
  - 이동 스킬은 `Input.parse_input_event`로 실제 키 이벤트를 넣었다.
- **같은 순간의 정밀 일치는 아니다.** 두 게임의 흐름 자체가 다르다(예: 로비 시네마틱이 Godot에서는 게임 인트로 I로 옮겨져 있음). 그래서 "같은 서사·같은 기능 지점"끼리 짝지었다.
- **사용자 실제 실행 방식 미확인**: 사용자 로그(`_out/playtest/integ10.log`)는 main.tscn 직접 실행(로비 없음)이다. `--fdg-native-perspective-first` 인자를 붙이는 `run.cmd`로 실행했는지는 로그로 알 수 없다. 그래서 두 경우를 모두 캡처했다(04b, 04c).

---

## 1. 장면별 차이 표

- 차이 종류: 누락 / 다른 구현 / 신규 제작 / 버그 / 성능
- 심각도: **P0** 플레이 불가 · **P1** 즉시 눈에 띔 · **P2** 세부
- 담당 추정: **PC 로직** / **Mac 표시**

비교 격자 경로 접두: `G:/exoduser-wt/_out/parity/`

### 1-1. 로비·시네마틱·캐릭터 선택 (장면 1·2)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| L-01 | 부팅 경로 (01b) | index.html: FDG 로고 → 타이틀 → 시네마틱 → 데모 입장 → 로비 → 캐릭터 생성 → 스토리 → game.html | 기본 main_scene=main.tscn이 곧바로 필드를 만든다. 5슬롯 로비 `demo_lobby.tscn`은 어디서도 참조하지 않아 일반 실행으로는 도달할 수 없다 | 누락 | P0 | godot/project.godot:6, scripts/main.gd `_ready`. demo_lobby.tscn을 참조하는 곳 없음 | PC 로직 |
| L-02 | 스플래시·타이틀 (01a) | FDG 로고 영상 `video/fdg_intro.mp4`(3.2초) → 타이틀 모션 `video/title_motion_hd_20260929.mp4` 반복 + SVG 로고 + "아무 키나" (index.html:577-600, 4494-4726) | 없음. 영상 재생 노드(VideoStreamPlayer)와 영상 파일이 0개 | 누락 | P1 | Godot에 영상 파이프라인 없음 | Mac 표시 |
| L-03 | 로비 저장소 (01c) | 격리 프로필에서도 정상 | 이름이 `EXODUSER-demo11-`로 시작하지 않는 user dir이면 5슬롯이 모두 "저장소를 열 수 없습니다"이고 상태줄에 `요청 실패 · demo_namespace_required`가 뜬다. 제품 기본 user dir `EXODUSER-Godot-Native-First`도 이 조건에 걸린다 | 버그 | P0 | port_modules/save_adapter/demo_local_storage.gd:22-35 namespace 규칙과 project.godot:9 기본 user dir 이름의 충돌 | PC 로직 |
| L-04 | 로비 본화면 (01b) | 배경 영상 `assets/lobby/lobby_varkan_crypt_loop_v2.mp4`(묘왕 바르칸)가 전면을 채우고, 오른쪽에 세로 고딕 패널(언어·로고·새 캐릭터·위시리스트·ENTER·시네마틱) | 정지 카드형: 왼쪽에 EXODUSER 로고와 바르칸 정지 이미지 카드("선대의 기억"), 오른쪽에 "전사의 기록" 5슬롯 목록과 이어하기/삭제 버튼. 레이아웃·구성 요소가 전혀 다르다 | 다른 구현 | P1 | scripts/native_demo_lobby_screen.gd:108-158. 웹 index.html:736-790 | Mac 표시 |
| L-05 | 로비 시네마틱 (01d, 01e) | ENTER → `video/intro.mp4`(문 열림, 8초) → `video/world_intro_v17_blood_en.mp4`(113초, 영상+자막 "어딘가에선 우주가 태어나고,") | 로비에는 시네마틱이 없다. 대신 게임 시작 후 "세계의 기록 I"에서 **레거시 정지 이미지** `assets/cutscene/prologue/p01~p17.jpg`를 액자 안 슬라이드로 보여준다. 자막도 웹이 더 이상 쓰지 않는 구 문구("끝없는 시대, 끝없는 메타우주") | 다른 구현 | P1 | godot/data/native_story_intro.json segment0. 웹은 index.html `CIN_LINES` p01~p17을 레거시로 두고 영상으로 대체(index.html:2333, world-intro-player.js) | Mac 표시 |
| L-06 | 캐릭터 선택 (02a) | 전면 장면(`assets/charselect/bg_scene1.png`+루프 영상), 이중 금선 프레임, 왼쪽 클래스 정보, 가운데 대형 초상, 오른쪽 "플레이 방식" 3특성, 하단 원형 클래스 아이콘 5개(잠금 4) + 취소/생성. 이름은 다음 모달에서 입력 | 왼쪽 전사 일러스트 + 하단 로고, 오른쪽 "새 전사의 이름" 폼(사각 초상 5칸, 잠금 4, 이름 입력, 새로하기/취소). 특성 패널·장면 배경·불씨 연출 없음 | 다른 구현 | P1 | scripts/native_demo_lobby_screen.gd. 웹 index.html:1074-1110 `#charVisualPop` | Mac 표시 |
| L-07 | 캐릭터 스토리 (02b) | 생성 직후 전체 화면 영상 `video/warrior_story_v23_clean.mp4`(96초, 하단 자막) | "세계의 기록 II"에서 `assets/cutscene/warintro/*.jpg` 정지 이미지를 액자 슬라이드로 보여준다. 이미지가 없는 빈 검은 컷이 5개 섞여 있다(c12·c15·c24·c29·c33) | 다른 구현 | P1 | data/native_story_intro.json segment1 | Mac 표시 |
| L-08 | 로비 복귀 (11e) | 저장 후 index.html 로비로 돌아온다. 만든 캐릭터 슬롯("패리티 Lv.3 · 1장 썩은 숲 1층")이 보인다 | 작은 패널 `demo11_lobby.tscn`("DEMO LOBBY 지옥의 길", 위시리스트/데모 다시 시작)으로 간다. 5슬롯 로비가 아니다 | 다른 구현 | P1 | scripts/native_demo_lobby.gd, main.gd:3259-3263 | PC 로직 + Mac 표시 |

### 1-2. 게임 인트로·프롤로그 (장면 3)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| I-01 | 인트로 구성 (03a) | 새 게임 첫 진입은 네메시스 INTRO(`INTRO_CUTSCENE_LINES`, 00~20.png, 약 82초) 하나다. 전쟁 서사 PRO는 `?cutscene=1`일 때만 | 3구간을 연속 재생한다(I 세계 68.8초 + II 전사 104.5초 + III 네메시스 84초 = 약 257초). 웹에서는 로비·캐릭터 생성 영상에 있던 내용이 게임 인트로 하나로 합쳐졌다 | 다른 구현 | P1 | data/native_story_intro.json, scripts/native_story_intro.gd | Mac 표시 |
| I-02 | 화면 틀 (03a) | 전체 화면 캔버스(z9999). 16:9 밖에만 레터박스. 이미지가 화면 전체를 채운다 | "액자": 상단 108px·하단 238px 띠(α0.93)와 금색 1px 선을 덮는다. 상단에 "세계의 기록 / III", 좌하단에 "3 / 3", 우하단에 건너뛰기 버튼. 이미지 세로가 약 3분의 2로 잘린다 | 다른 구현 | P1 | native_story_intro.gd:46-58 | Mac 표시 |
| I-03 | 컷 전환 (03b) | 컷마다 `fade.type`(cross/cut/black)으로 크로스페이드하고, Ken Burns 줌·팬(zs→ze, px/py, ease)을 쓴다 | 텍스처를 즉시 교체한다. 페이드·줌·팬이 없다 | 누락 | P1 | native_story_intro.gd:84-88 `_select_cue`. 웹 game.html:63047-63085 | Mac 표시 |
| I-04 | 색보정·비네트 | 컷별 `vfx.grade`(purple/purple_blood/blue multiply), 방사형 비네트, 흔들림·글로우 | 없음 | 누락 | P2 | 웹 game.html:62898-62906, 63047-63085 | Mac 표시 |
| I-05 | 화자 대사 (03c, 03a) | 하단 22% 그라디언트 박스. 왼쪽 정렬된 화자 이름(네메시아 보라 `#c084fc`, 디로이·헥터 색) + 밑줄 + 한 글자씩 타이핑 + ▼ 깜빡임. 다 나오면 Enter로 넘긴다 | 하단 띠 안에 가운데 정렬된 한 줄 자막(나눔명조 34px, 뼈색). 화자 이름·화자 색·타이핑·입력 대기가 없고 시간이 되면 자동으로 넘어간다 | 다른 구현 | P1 | native_story_intro.gd `_subtitle`. 웹 game.html:63125-63187 | Mac 표시 |
| I-06 | 로고 컷 | 타이틀 컷은 `img/logo_exoduser.png`를 원래 비율로 보여준다 | 로고(835×348)도 COVERED로 화면 폭까지 확대되어 양끝이 잘린다(03c_s0_c18) | 버그 | P2 | native_story_intro.gd:46 STRETCH_KEEP_ASPECT_COVERED | Mac 표시 |
| I-07 | '눈을 떠' 가이드 (03d) | 4컷 패널 뒤에 금빛 소환진(모닥불 링)이 보인다 | 패널 문구·배치는 거의 같다. 금빛 소환진이 없다 | 누락 | P2 | native_intro_key_guide_panel.gd. 웹 `#introKeys` + G._bonfire 링 | Mac 표시 |
| I-08 | 커튼 (03e) | 0.8초 CSS 커튼이 열리면 곧바로 HUD·레슨 패널·헥터 대사가 함께 보인다 | 커튼이 열리는 중 상하 검은 띠 사이로 필드 띠만 보이고, HUD는 아직 어둡다. 구역 제목 위치가 다르다 | 다른 구현 | P2 | native_intro_curtain_sequence.gd:217-254 | Mac 표시 |

### 1-3. 1-1 첫 필드·맵 (장면 4)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| M-01 | 맵 바닥 전체 인상 (04b, 04d) | 어두운 흙·뿌리 질감의 구운 청크 8×8(`assets/map/ch1/production_finish/chunk_*.png`). 전체가 매우 어둡고, 플레이어 주변만 따뜻한 원형 조명이 비추며 비네트가 깔린다. 숲 경계(이빨 달린 나무, 눈알 덩굴)는 화면 가장자리에 있다 | 밝은 보라·회색 톤의 페인팅 판(MAP11 product)이 깔리고, 거대한 고목 기둥들이 화면 양옆과 상단을 채운다. 조명 대비가 약하고 화면 전체가 고르게 밝다. "컨셉 이미지를 깔아 놓은 판"이라는 사용자 판정과 일치한다 | 신규 제작(웹과 다른 맵) | P1 | godot/scripts/maps/map11/product_scene.gd, assets/maps/map11/*. 웹 game.html:11612-11762, 51922 | Mac 표시 |
| M-02 | 원근 실행 (04c) | 탑다운 2D | `run.cmd`가 항상 붙이는 `--fdg-native-perspective-first`로 실행하면 거대한 뿌리·고목 텍스처가 화면 전체로 늘어나 찌그러지고, 오른쪽에 직선 경계로 잘린 초록 잔디 판이 드러난다. "경계가 직선으로 잘리고 화면이 찌그러짐"이라는 지적과 일치한다(사용자가 이 인자로 실행했는지는 미확인) | 버그 | P0 | godot/run.cmd 마지막 줄, scripts/native_perspective_view.gd(레거시 지면 셰이더를 3D로 미러링). MAP11 위에 레거시 지면이 겹친다 | Mac 표시 + PC 로직 |
| M-03 | 카메라 줌 (04b) | `G._camZoom`=1.0, 오프셋 없음. 화면 중심이 플레이어 | zoom 0.70, offset (0,-180). 같은 화면에 훨씬 넓은 영역이 보이고 플레이어가 화면 중앙보다 아래에 있다 | 다른 구현 | P1 | maps/map11/product_scene.gd:62-63. 웹 game.html:35736-35739 | Mac 표시 |
| M-04 | 플레이어 크기 (04d) | 96×96px(`_pScale=2`) | zoom 0.7 탓에 화면에서 웹보다 확연히 작다(약 0.7배로 추정, 실측 미확인) | 다른 구현 | P1 | player.gd:61, 1179·1246(scale 2.0) × 카메라 0.7 | Mac 표시 |
| M-05 | 조명·안개 | 절반 해상도 동적 조명(앰비언트 `[6,16,9,.38]` + 광원 구멍), PP 그레이딩(multiply 0.18, 상단 screen 0.10), 비네트 0.55, FBM 안개, 하단·상단 안개 그라디언트 | 조명 대비·비네트가 약하고 안개층이 보이지 않는다 | 누락 | P1 | product_scene.gd의 fog/lighting 노드. 웹 game.html:51681-51723, 4693-4715, 9000-9046 | Mac 표시 |
| M-06 | 시작 지점 | 시작 방 (100,185) 타일, 주변에 바닥 디테일·잔해·시체 꽃 | 시작 좌표 (0,3700). 구성이 다르다(고목 회랑) | 신규 제작 | P1 | world.gd/map11 provider | Mac 표시 |
| M-07 | 맵 오브젝트 | `_MAP_COMPOSE[0].handProps` 손배치(썩은 고목 8, 시체나무 `m_c1tree`, 고치·야영지·제단·늪·독구덩이) + y정렬 + 깊이 슬라이스(가리면 투명화·고스트) | 필드보스 마커 근처에 해골 더미 2개, 붉은 균열 장식. 다른 오브젝트 세트이고 가림 처리는 미확인 | 신규 제작 | P1 | assets/map/map11/props/tour_25d/*. 웹 game.html:18118-18172, 18501-18574 | Mac 표시 |

### 1-4. HUD 1x 크롭 (장면 5)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| H-01 | HP 구슬 (05a) | 붉은 액체 + 파란 conic 링(보호막) + 해골 붉은 눈 글로우. 숫자 "516 / 516"(Cinzel) | 링·붉은 눈 글로우 없음. 구슬 안에 "생명력 / 533 / 533" 3줄 텍스트 | 다른 구현 | P1 | scripts/hud.gd `_resource_orb` :399-444. 웹 game.html:2615-2662, 143-290 | Mac 표시 |
| H-02 | 오른쪽 구슬 (05a) | 왼쪽 반 MP 391 / 오른쪽 반 **SP** 306. 노란 사슬 게이지 링 + 눈금 | 왼쪽 반 MP 265 / 오른쪽 반 **ST** 280. 게이지 링 없음 | 다른 구현 | P1 | hud.gd. 웹 `.globe-ring-wrap` | Mac 표시 |
| H-03 | 수치 불일치 (05a·05b·05c) | 새 전사 Lv1: HP 516, MP 391, SP 306, 전투력 ◇1,769, 지역 처치 분모 32 | HP 533, MP 265, ST 280, 전투력 ◇1,605, 지역 처치 분모 8 | 버그 | P1 | 스탯/자원 초기화 공식 또는 장비 지급 차이(원인 미확인). source_parameters, native_regions.gd | PC 로직 |
| H-04 | 미니맵 (05c) | 좌상단 `#mmWrap` 166px 액자 + 맵 실루엣·적 점 | 없음(MAP11에서 숨기고 대체 미니맵 없음) | 누락 | P1 | main.gd:357-359, hud.gd:944-972 | Mac 표시 |
| H-05 | 우상단 정보 (05b) | 금빛 테두리 패널: 레벨 1 / 경험치 0/15 / 지역 처치 0/32 / 악의 1,000 | 같은 항목, 더 작고 테두리가 흐리다. 분모 0/8 | 다른 구현 | P2 | hud.gd 목표 패널 :835-837 | Mac 표시 |
| H-06 | 대화·자막 (05d) | 펫 대화창이 불투명 흑철 판 + 장식 테두리라 글자가 또렷하다 | 판이 반투명이라 맵이 비쳐 글자 가독성이 떨어진다 | 다른 구현 | P2 | scripts/native_pets.gd 자막 루트 | Mac 표시 |
| H-07 | 스킬 토스트 (07e) | 없음 | 스킬을 쓰면 스킬바 위에 "Space · 지옥강타 1 · 29.9s" 같은 디버그풍 띠가 뜬다 | 신규 제작 | P2 | native_skill_slots.gd 또는 HUD 상태 표시 | Mac 표시 |
| H-08 | 스킬바 (05a) | `img/ui_bar_only.png` 13칸, 아이콘 `img/skillskin_upscaled/*` | 형태는 거의 같고 아이콘 세트도 같다. 배치 차이는 경미 | 다른 구현(경미) | P2 | hud.gd :344-351 | Mac 표시 |

### 1-5. 인벤토리·스킬창·옵션 (장면 6)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| U-01 | 인벤토리 Tab (06a) | 전체 화면 창(장비 인형 16슬롯, 가방 10/300, 현재 전투 구성, 장착 목록, 상단 탭 설정/인벤토리/대장간/스킬/능력치) | Tab을 눌러도 아무것도 열리지 않는다. 인벤토리 패널은 `--demo11-storage=on`/메타가 있을 때만 생성된다(로비 진입 경로에서도 `source_inventory_ui` 없음) | 누락 | P0 | main.gd:498-514 `demo11_enabled` 조건 | PC 로직 |
| U-02 | 스킬창 K (06b) | SkillForge 3D 창(스킬 원판, 학습/강화 +, 합성 로드맵) | 없음. K는 키 안내 문구에만 있다 | 누락 | P1 | 서비스 `request_native_skill_management`만 있고 UI가 없다 | Mac 표시 + PC 로직 |
| U-03 | Esc 동작 (06d) | Esc를 누르면 설정 창(탭 통합 창)이 바로 열린다 | Esc를 누르면 "일시정지" 메뉴(조작 안내 + 플레이 재개/설정)가 먼저 뜬다 | 다른 구현 | P1 | native_demo_pause_menu.gd, main.gd:1908 | Mac 표시 |
| U-04 | 설정 창 (06c) | 상단 탭 바(설정/인벤토리/대장간/스킬/능력치) + 게임·화면·사운드·조작 탭, 프리셋 저장, 전체화면, 캐릭터 선택 카드, 게임 리셋/종료 | 단일 패널: 시스템/화면/사운드/조작 탭, 언어·안내 글자 크기·화면 맞추기·흔들림 4항목, 뒤로 | 다른 구현 | P1 | native_settings_panel.gd | Mac 표시 |
| U-05 | 성장 J | 웹 캡처에서 J 창이 열리지 않았다(미확인) | 성장 패널이 열린다(스탯 트리). 단 `demo_growth_glyphs.svg`/`demo_growth_body.svg` 로더 ERROR가 매 실행 나온다 | 버그 | P2 | native_growth_panel.gd:65, 201(SVG 리소스 import 없음) | Mac 표시 |

### 1-6. 전투 (장면 7)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| C-01 | 데미지 숫자 (07e, 07c) | Pirata One 비트맵 아틀라스(흰/크리티컬 크림슨/보호막 하늘), 탄성 바운스 후 상승, 크고 굵다("392", "117") | 작은 파란 숫자("816", "1469", "350"). 크기·폰트·애니메이션이 다르다 | 다른 구현 | P1 | native_floating_text_adapter.gd. 웹 game.html:43944-43990, 54829-54848 | Mac 표시 |
| C-02 | 지옥강타 Space (07e) | 화면 3분의 1을 덮는 바위 파편 + 화염 폭발 | 0.4초 시점에는 작은 붉은 원형 폭발, 0.8초쯤 큰 화염 폭발. 규모가 작고 타이밍이 늦다 | 다른 구현 | P1 | native_skill_slots.gd, assets/vfx/inferno_slam_impact_sheet.png | Mac 표시 |
| C-03 | 회복의 영역 F (07f) | 녹색 성역 장판(원+문양) | 녹색 장판이 보이지 않는다. F 입력 0.4초 뒤 화면에는 앞선 지옥강타의 화염 폭발만 있다 | 누락(추정) | P1 | native_skill_slots.gd 존 파티클 | Mac 표시 |
| C-04 | 얼음보주 Ctrl (07g) | 시안 결정 파편 폭발 | 파란 구체 하나(구체 형태는 비슷하고 폭발 파편은 약하다) | 다른 구현 | P2 | assets/vfx/vfx_ice_orb.png | Mac 표시 |
| C-05 | 기본 공격 (07b) | 웹 쪽은 fallen 상태여서 비교 불가(캡처 한계) | 초승달 베기 이펙트와 숫자가 보인다 | 미확인 | — | — | — |
| C-06 | 적 피격·사망 | 피격 가산 플래시, 고어 `assets/gore/*` | 피격 시 붉은 혈흔이 바닥에 남는다. 플래시·고어 동일 여부는 미확인 | 미확인 | P2 | — | Mac 표시 |

### 1-7. 이동 스킬 (장면 8)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| V-01 | 방향+Space 전격이동 (08b) | A를 누른 채 Space: 110ms 안에 x −126~−130px 이동(실측 2회). "충전 중..." 게이지 표시 | 실제 키 이벤트(A+Space)를 넣어도 이동 0px(−0.12px). Space는 Player가 `space_rage_slot_not_connected`로 먼저 소비한다 | 누락 | P0 | 액션·핸들러 없음. player.gd:522-525, main.gd:1969·1998, native_parry_lesson_flow.gd:39-47(`lightning_dash_unported`) | PC 로직 |
| V-02 | Shift 사슬 이동 (08a) | 입력하면 게이지·ST가 줄고 발동한다(헤드리스 실측 이동 +34~37px. 원래 사거리 동작인지는 육안 미확인) | Shift 홀드 0.7초 → 릴리즈해도 0px. InputMap에 Shift/charge 액션이 없다 | 누락 | P0 | main.gd:1966-1985 `_register_inputs`, 레슨 정지 사유 `chain_movement_unported` | PC 로직 |
| V-01 | 방향+Space 전격이동 (08b) | A를 누른 채 Space: **6틱 동안 41.67px씩 250px**(웹 1틱 스텝 실측 C_f0~f5), MP 7·기동 게이지 31.5 소비, 무적 15→착지 15, 착지 전류장판·번개 기둥. ※ 이전 기록 "−126~−130px"는 하네스가 `_harpGauge=5`로 둬 발동이 안 된 채 A 보행만 잰 값이었다 | **[PC-MOVE-SKILLS 브랜치 f02ed5b0f·f7a97ad4a·a684e4434, main 미병합]** 같은 입력으로 6틱 250px, 무적 14…10→15, 게이지 193.59(+회복)까지 프레임마다 웹과 같다. Space는 방향+Space면 전격이동이 먼저 소비, 단독이면 슬롯 owner로 전달 | 이식(브랜치) | ~~P0~~ 브랜치 해결 | 남은 차이: 전류장판 피해 틱·방어감소 NOT_READY(hurtE `_shockDR` 분기 미이식), showPH 토스트·HUD 기동 링(H-02)은 Mac. 비교 `_out/pc-move-skills-v2/compare_C0*.png` | PC 로직(완료) · Mac 표시 |
| V-02 | Shift 사슬 이동 (08a) | 탭: 사슬 63px/틱 비행 4틱 → 5틱째 꽂힘과 같은 틱에 끌림 시작, 끌림 7틱 → 릴리즈 후 11틱째 **300px** 착지. 2단(6틱 이상 홀드) 비행 7틱+끌림 11틱 → 18틱째 500px, 3단 12틱 홀드 자동 700px. 게이지 45/98/150·ST mst×1%×단계. ※ 이전 "+34~37px"는 하네스가 `_harpGauge=5`로 둔 결과(700×7.25/150=33.8)였다 | **[PC-MOVE-SKILLS 브랜치 f02ed5b0f·f7a97ad4a·a684e4434, main 미병합]** InputMap `charge`=왼쪽 Shift. 1단 300px·2단 500px, 프레임별 위치·무적(끌림 1, 착지 47)·게이지가 웹과 같다. 홀드 링·예측선·단계, 사슬 수리검, 머리 위 게이지, dash_start/fly/land 포즈, land_fire | 이식(브랜치) | ~~P0~~ 브랜치 해결 | 남은 차이: 합체·유니크 분기 미보유(NOT_READY), 레슨 step 4/5 연습은 step 0~3 정지로 도달 불가. 비교 `_out/pc-move-skills-v2/compare_A0*.png`·`compare_B0*.png` | PC 로직(완료) · Mac 표시 |

### 1-8. 적·필드보스·보스 (장면 9·10)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| E-01 | 필드보스 앵글러 (09a) | 마커 (58,158) 근처에서 "심연의 앵글러"(파란 발광 아귀, 이름+HP바)가 깨어나 있다 | 마커 0 근처에서 6초 대기해도 출현하지 않는다(births 0, provider_bound true, pc_bound false). 해골 더미만 보인다 | 누락 | P0 | native_demo11_anglers.gd `_advance_phase`(레슨 가드·serial 조건). 필드보스를 잡을 수 없으므로 보스문 조건 `_fbDone`도 성립하지 않는다 | PC 로직 |
| E-02 | 일반 적 종류 (09b) | 1-1 중앙: etype 16,4,28,7,1,21,26,23,3,0,10,8,25,14,6 등 15종 관측("화마귀" 등) | 관측 etype은 0,1,4 세 종류뿐 | 누락 | P1 | MAP11 natural scheduler/etype 그룹 이식 범위 | PC 로직 |
| E-03 | 적 외형 (07a) | 커튼 링 etype0 "눈알 육괴" 5마리 | 같은 5마리 링(배치 일치). 스프라이트 크기는 zoom 탓에 작다 | 다른 구현 | P2 | M-03과 같은 원인 | Mac 표시 |
| B-01 | 보스방 진입 (10a) | 페이드 → "다크드루이드" 이름 카드 + 보스 HP바 → 아레나, 씨앗 폭탄이 즉시 쏟아진다 | 자연 진입 `encounter.enter`가 NOT_READY(`integer_input_required:difficulty_index`). `difficulty_index:0`을 넣어도 `integer_input_required:room`. 정적 아레나로만 전환하면 화면이 거의 완전히 검다 | 누락 | P0 | native_demo11_encounter.gd:49-72 → main.spawn_native_demo_boss가 스폰 계약 정수 입력(difficulty_index, room …)을 받지 못한다. `bind_native_demo_arena_provider` 호출처 없음 | PC 로직 |
| B-02 | 보스 외형·패턴 (10b) | 사슴뿔 드루이드 스프라이트, 녹색 덩굴 원형 장판, 씨앗 투사체 폭우(bossBeanStorm), 2페이즈(부활) | 보스가 스폰되지 않아 비교 불가. 기존 보스 시각은 BOSS11 하니스의 정지 구성(1600×900, 패턴 미실행)뿐이다 | 누락 | P0 | native_demo11_boss_actor.gd:127-160 `source_updateE_prefix` 오너가 바인딩되지 않아 WAITING_OWNER | PC 로직 |
| E-01 | 필드보스 앵글러 (09a) | 마커 (58,158) 근처에서 "심연의 앵글러"(파란 발광 아귀, 이름+HP바)가 깨어나 있다 | 마커 0 근처에서 6초 대기해도 출현하지 않는다(births 0, provider_bound true, pc_bound false). 해골 더미만 보인다 | 누락 | P0 | native_demo11_anglers.gd `_advance_phase`(레슨 가드·serial 조건). 필드보스를 잡을 수 없으므로 보스문 조건 `_fbDone`도 성립하지 않는다 **→ 상태(2026-10-22 pc-boss-parity): PC 로직 해결. 원인은 레슨 가드가 아니라 앵글러 몸 충돌·착지 강타의 PC interaction 미바인딩(근접하면 개체 정지)과 근접 무기→앵글러 경로(37646) 부재. 출생·깨어남은 INTEG-10 에서도 동작했다(parity 09a Godot 화면 왼쪽 중간에 작게 보임 — 줌 0.7 탓. births 는 에너지탄 수라 깨어난 뒤 약 300틱 전에는 0). 4마리 처치→`_fbDone` 실측. 앵글러 이름·HP 바 표시는 Mac 뷰 미구현** | PC 로직 |
| E-02 | 일반 적 종류 (09b) | 1-1 중앙: etype 16,4,28,7,1,21,26,23,3,0,10,8,25,14,6 등 15종 관측("화마귀" 등) | 관측 etype은 0,1,4 세 종류뿐 | 누락 | P1 | MAP11 natural scheduler/etype 그룹 이식 범위 | PC 로직 |
| E-03 | 적 외형 (07a) | 커튼 링 etype0 "눈알 육괴" 5마리 | 같은 5마리 링(배치 일치). 스프라이트 크기는 zoom 탓에 작다 | 다른 구현 | P2 | M-03과 같은 원인 | Mac 표시 |
| B-01 | 보스방 진입 (10a) | 페이드 → "다크드루이드" 이름 카드 + 보스 HP바 → 아레나, 씨앗 폭탄이 즉시 쏟아진다 | 자연 진입 `encounter.enter`가 NOT_READY(`integer_input_required:difficulty_index`). `difficulty_index:0`을 넣어도 `integer_input_required:room`. 정적 아레나로만 전환하면 화면이 거의 완전히 검다 | 누락 | P0 | native_demo11_encounter.gd:49-72 → main.spawn_native_demo_boss가 스폰 계약 정수 입력(difficulty_index, room …)을 받지 못한다. `bind_native_demo_arena_provider` 호출처 없음 **→ 상태(2026-10-22 pc-boss-parity): PC 로직 해결. 자연 경로(MAP11 문 transport)는 원래 OPT.diff·_stageDiffOff·room 0을 넣고 있었고, NOT_READY 는 하니스가 encounter.enter 를 빈 인자로 직접 부른 결과. 빠져 있던 것은 원본 로딩 상태 머신(페이드 50→네임카드 130→페이드인 50→입장 100)·문 30호출 cadence·진입 부수효과 — 이식, 네임카드 오버레이 원본 수치. 아레나 화면(맵·조명)은 Mac** | PC 로직 |
| B-02 | 보스 외형·패턴 (10b) | 사슴뿔 드루이드 스프라이트, 녹색 덩굴 원형 장판, 씨앗 투사체 폭우(bossBeanStorm), 2페이즈(부활) | 보스가 스폰되지 않아 비교 불가. 기존 보스 시각은 BOSS11 하니스의 정지 구성(1600×900, 패턴 미실행)뿐이다 | 누락 | P0 | native_demo11_boss_actor.gd:127-160 `source_updateE_prefix` 오너가 바인딩되지 않아 WAITING_OWNER **→ 상태(2026-10-22 pc-boss-parity): 보스 스폰·이동·패턴·피해·부활·사망 동작. 패턴이 거의 안 나오던 원인(보스 몸통 충돌 34349 미이식 → 겹침 d<20) 해결. 외형(8방향 정지 시트 vs 웹 애니)·텔레그래프 색(주황 vs 녹색 덩굴)·씨앗 투사체 크기·부활 이름 표기·HP 바 양식 차이는 Mac 표시. 소환 mkEn NOT_READY** | PC 로직 |

### 1-9. 사망·클리어 (장면 11)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| D-01 | 쓰러짐 (11a) | 화면 붉은 비네트, 플레이어 위 "부활력 11.4%" 카운트다운, HUD 유지 | 화면 가운데 모달 "쓰러졌습니다 / 운명이 결정될 때까지 5". 화면이 어두워진다 | 다른 구현 | P1 | native_demo11_life.gd:35-53 | Mac 표시 |
| D-02 | 사망 화면 (11b) | 전면 일러스트 `img/cin_remember_wide.png`(달빛 여신·감옥), "빛이 꺼졌다"(Cinzel), 피해 요약, 버튼 3개(다시 일어서라/리플레이/로비), 헥터·디로이 대사 | 작은 모달 "다시 일어서라 / EXP -0 / 재시작(비활성) / 로비로 돌아가기". 일러스트·펫 대사 없음 | 다른 구현 | P1 | native_demo11_life.gd:80-109. 웹 game.html:646-660, 3101 | Mac 표시 |
| D-03 | 재시작 버튼 | 다시 일어서라 = 즉시 재시작 | 재시작 버튼이 항상 비활성(`bind_stage_restore` 호출처 없음). 사망하면 로비로 나가는 것 말고 할 수 있는 게 없다 | 버그 | P0 | native_demo11_life.gd:108-118 | PC 로직 |
| K-01 | 스테이지 클리어 (11c) | 보스 처치 → 출구 → 게임 화면 위 "구역 클리어!" + S 랭크 결과 카드(클리어 타임 0:29, 점수 6,835, 처치·보너스 표) + 데모 종료 버튼. 디로이 축하 대사 | 검은 화면 위 "ZONE CLEARED 구역 클리어! 썩은 숲을 정복했습니다 / 데모 종료" 단독 패널. 랭크·점수는 계산만 되고 표시되지 않는다 | 다른 구현 | P1 | native_demo_end_flow.gd, native_demo11_clear_result.gd(소비자는 펫뿐) | Mac 표시 + PC 로직 |
| K-02 | 클리어 진입 | 보스 처치 → 출구 타일 밟기로 자연 진입 | 자연 경로 없음(B-01). 계약 신호 `native_demo_boss_defeated.emit(0)`로만 진입 | 누락 | P0 | B-01과 같은 원인 | PC 로직 |
| K-02 | 클리어 진입 | 보스 처치 → 출구 타일 밟기로 자연 진입 | 자연 경로 없음(B-01). 계약 신호 `native_demo_boss_defeated.emit(0)`로만 진입 | 누락 | P0 | B-01과 같은 원인 **→ 상태(2026-10-22 pc-boss-parity): 자연 경로 동작: 보스 처치→출구 문 30호출 cadence→encounter.leave→클리어 신호(계약 신호 직접 발행 불필요). 결과 카드 양식(K-01)은 Mac** | PC 로직 |

### 1-10. 집계

| 심각도 | 개수 | 행 |
|---|---:|---|
| P0 | 11 | L-01, L-03, M-02, U-01, V-01, V-02, E-01, B-01, B-02, D-03, K-02 |
| P1 | 30 | L-02, L-04~L-08, I-01~I-03, I-05, M-01, M-03~M-07, H-01~H-04, U-02~U-04, C-01~C-03, E-02, D-01, D-02, K-01 |
| P2 | 12 | I-04, I-06~I-08, H-05~H-08, U-05, C-04, C-06, E-03 |
| 미확인 | 1 | C-05(웹 쪽 캡처 한계) |

> M-02는 `run.cmd`(원근 인자)로 실행했을 때만 P0이다.

---

## 2. 그대로 옮기려면 무엇이 필요한가

### 2-1. 맵 (1-1 썩은 숲)

웹 1-1은 타일 렌더가 아니다. **미리 구운 페인팅 청크 + 폴리곤 충돌 + 손배치 오브젝트 + 다층 후처리** 구조다. Godot MAP11은 이와 별개로 새로 그린 판이라 "다른 맵"으로 보인다. 같은 화면이 되려면 웹 에셋과 레이어를 그대로 가져와야 한다.

**웹 코드 위치**
- 청크 그리기: game.html:11612-11615, 11754-11762, 51922
- 1-1 맵 복제: `_cloneField11` 30042-30050
- 충돌 폴리곤: `assets/map/ch1/production_finish/layout.js` `CH1_1_PRODUCTION.buildRLE`
- 오브젝트 배치: `_MAP_COMPOSE[0].handProps` 18118-18172
- 오브젝트 메타: 17547-17640
- 경로 규칙: 18470-18486
- 깊이 슬라이스: 16651-16656, 18501-18574
- 카메라: 35722-35741, `_clampCamToMap` 11903-11908
- 후처리: 51681-51723(그레이딩), 4693-4715·55199(동적 조명), 9000-9046(FBM 안개), 52652-52699(ATMOS 안개), 55335-55413(스모그·비네트·CSS 필터)

**에셋 목록**
- 바닥: `assets/map/ch1/production_finish/chunk_{0-7}_{0-7}.png` 64장. 각 1026×1026(1024 + 블리드 1px)이고 월드 1000px를 덮는다.
- 배치 정보: `layout.js`, `composition.json`
- 오브젝트 `assets/map/ch1/collision/`:
  - 썩은 숲 나무: `rotforest_tree_01~07,11.png`
  - 소품: `prop_corpsetree.png`(sz1450), `prop_camp/altar/pool/cocoon.png`
  - 바닥 패치: `prop_g_root/toxic/edge.png`, `prop_s_bone/root/pod.png`
  - 기타: `bone_arch.png`, `pit_poison.png`
- 바닥 오브젝트: `assets/map/ch1/floor_objects/frozen_bones.png`, `glow_flower_yellow.png`, `corpse.png`
- 경계 전경: `assets/map/ch1/production_finish/outer90_sources/rotforest_mass_0*.png`
- 경계 처리 스크립트: `ch1-forest-sway.js`, `ch1-boundary-edge.js`, `ch1-border-foreground.js`

**레이어 구조 (아래→위)**
1. 검정 클리어
2. 청크 8×8
3. 숲 흔들림 → 얼굴 생명 → 썩은 나무 36그루 → 언덕 → 제단 해자 → 경계 전경(뒤쪽 패스) → 경계 접지 → 생체 디테일 그림자
4. 포인트 라이트(640px 따뜻한 방사형) → 데코 → 출구·포탈
5. MAP_OBJS 뒤쪽 패스(y정렬)
6. 바닥 아이템
7. ATMOS 안개
8. 적(그림자 → 몸 → 피격 플래시 → HP바)
9. 투사체·스킬 VFX
10. 플레이어
11. 깊이 슬라이스 앞쪽 패스 → 경계 전경 앞쪽
12. 파티클
13. 플로팅 텍스트
14. PP 그레이딩
15. 피격·저HP 화면 효과
16. 동적 조명
17. 블룸
18. 스모그·안개·Three FBM 안개
19. 환경광 → 비네트 → CSS 필터
20. 레터박스·지역 화살표·미니맵

**Godot에 필요한 것**
1. MAP11 product 판 대신 웹 청크 64장을 `Sprite2D` 격자로 깐다(1000px 간격, 텍스처 필터 on).
2. layout.js 53점 폴리곤을 그대로 충돌로 옮긴다(`CollisionPolygon2D` 또는 걷기 마스크). 북쪽 게이트·출구 절개도 같은 좌표로 맞춘다.
3. handProps 좌표·scale을 그대로 배치한다. `footY = y + sz*scale*footYF`를 기준으로 y정렬하고, 깊이 슬라이스(가림 알파 0.62, 고스트 0.55)는 셰이더로 만든다.
4. 경계 3종(흔들림·AO/어둠·전경 수관)을 별도 레이어로 옮긴다. 화면 가장자리가 직선으로 잘리지 않게 하는 핵심이다.
5. 카메라 zoom 1.0, offset 0, 추적 계수(평소 0.92·회피 0.85·공격 0.95, look-ahead v*25), 보스전 0.80, 맵 경계 클램프를 맞춘다.
6. 후처리 체인을 CanvasLayer 전체 화면 셰이더 2~3개로 원래 수치 그대로 옮긴다: 앰비언트+광원 구멍 / multiply·screen 그레이딩+비네트 / FBM 안개.
7. `--fdg-native-perspective-first`(run.cmd 기본 인자)는 탑다운 원본과 맞지 않는다. 원본 기본 플레이에서는 원근이 꺼져 있으므로(game.html:65674-65690) run.cmd에서 이 인자를 빼는 것을 결정해야 한다(사용자 결정 사항).

### 2-2. 인트로·시네마틱

웹은 세 곳에 나뉘어 있다.
- 로비 시네마틱(영상)
- 캐릭터 생성 스토리(영상)
- 게임 첫 진입 INTRO(캔버스 컷신)

Godot는 이것을 "세계의 기록 I/II/III" 정지 이미지 액자 슬라이드 하나로 합쳤다.

**웹 코드 위치**
- index.html 로비 시네마틱: `playCinematic` 2364, `startWorldIntro` 2538, 컷 경계 `world-intro-player.js:4`
- 캐릭터 스토리: `character-story-player.js`
- game.html INTRO: `INTRO_CUTSCENE_LINES` 62746, `_startIntroCutscene` 62910, `_renderIntroCutscene` 62967, 연출 63047-63085, 대사 63089-63187, 스킵 62868·63190-63203
- PRO(옵션): `PROLOGUE_LINES` 62598

**에셋 목록**
- 영상: `video/fdg_intro.mp4`, `video/title_motion_hd_20260929.mp4`, `video/intro.mp4`, `video/world_intro_v17_blood_en.mp4`(+ 자막 vtt), `video/warrior_story_v23_clean.mp4`
- 컷 이미지: `assets/cutscene/images/00~20.png`, `assets/cutscene/warintro/*.jpg`(PRO 전용)
- BGM: `bgm/공통/네메시아의 강림 V3.mp3`(INTRO), `bgm/cutscene/prologue_theme*.mp3` + `bgm/공통/intro_voice.mp3`(PRO)

**INTRO 레이어 구조 (아래→위)**
1. 검정
2. 레터박스 클립
3. 컷 이미지(Ken Burns + 페이드 알파)
4. 색보정 multiply
5. 비네트
6. 나레이션 오버레이와 텍스트 / 로고
7. 대사 그라디언트 박스 → 화자 이름 → 본문(타이핑) → ▼
8. 스킵 힌트·게이지
9. exit 페이드아웃

**Godot에 필요한 것**
1. 영상 재생(VideoStreamPlayer). Godot 기본 지원은 Ogg Theora뿐이므로 mp4를 .ogv로 변환할지, 영상 플러그인을 쓸지 결정해야 한다. 이것으로 L-02·L-05·L-07을 해결한다.
2. INTRO 컷 데이터(`INTRO_CUTSCENE_LINES`)를 cam(zs, ze, px, py, ease) · vfx(vig, grade, shake) · fade(type, in, out) 필드까지 그대로 옮긴다. 전체 화면 렌더러(액자 띠 제거)를 만든다.
3. 화자 대사 박스(화자 색, 타이핑 속도, 입력 대기), 나레이션 오버레이(검정 0.35, 하단 88%)를 원본 수치로 만든다.
4. 흐름을 웹과 같게 나눈다: 로비 시네마틱은 로비에, 스토리는 캐릭터 생성 직후에, INTRO는 게임 첫 진입에.
5. 레거시 `p01~p17` 프롤로그와 구 자막은 웹에서 더 이상 쓰지 않으므로 Godot 데이터에서 빼야 한다(I 구간 전체).

### 2-3. HUD

웹 HUD는 전부 DOM + CSS이고 1920×1080 기준 `--ui-scale`을 쓴다. Godot `canvas_items` 스트레치 Control로 1:1로 옮길 수 있다.

**웹 코드 위치**
- 폰트 변수: game.html:103-118
- 구슬: 2615-2662(DOM), 143-290(CSS)
- 스킬바 `#skBar`: 310, 2589-2608, 711-724
- 우상단 `#mmLvl`: 2575-2584, 372-381
- 미니맵 `#mmWrap`: 2585, 382-385, 60173-60230
- 좌측 `#hudCorner`: 327, 2664-2667
- 시계 `#stageClock`: 325
- 펫 자막 `#petSubtitle`: 2587, 9366-9390
- 데미지 숫자 아틀라스: 43944-43990

**에셋 목록**
- 구슬: `img/ui_globe_hp.png`, `img/ui_globe_mp.png`
- 스킬바: `img/ui_bar_only.png`, `img/skillskin_upscaled/{id}.png`
- 미니맵: `img/mm_frame.png`
- 펫 초상: `img/crow/portrait.png`, `img/cat_pet/portrait.png`
- 폰트: Nanum Myeongjo, Cinzel Decorative, Pirata One(데미지)

**구슬 레이어 (아래→위)**
1. `.globe-liquid-wrap` z5 원형 클립 `#080808`
2. 액체(HP 방사형 `#6B1020→#1E050A`, MP/SP 세로 그라디언트, 채우기 translateY 0.5~0.6초)
3. `.globe-glass` z30 프레임 PNG(inset −44px, brightness 0.6)
4. `.globe-ring-wrap` z33 conic 링(HP 보호막 `#3399ff`, MP 사슬 게이지 `#ffcc33` + 54° 눈금)
5. `.globe-val` z35 숫자
6. `.skull-eye` z50 붉은 눈 글로우

크기 `--globe-size:175px`, 위치는 스킬바 중심 ±490px × 배율 × 0.9.

**Godot에 필요한 것**
1. hud.gd `_resource_orb`를 위 6층 구조로 다시 만든다. 링·붉은 눈 추가, "생명력" 라벨 제거, 오른쪽 반은 ST가 아니라 SP.
2. 미니맵(`#mm` 130×130 + 프레임, 20프레임 갱신)을 MAP11에서도 표시한다.
3. 펫 대화판을 불투명 흑철 판으로 바꾼다.
4. 스킬 사용 토스트를 제거하거나 웹에 해당 UI가 있는지 확인한다.
5. 데미지 숫자 비트맵 아틀라스(48×56 셀, 10자리 × 3색, Pirata One 900 44px, 원형 외곽선 3px + 그라디언트 + 글로우 12)와 바운스 애니메이션을 원본 수치로 옮긴다.
6. HUD 수치 불일치(H-03)는 표시 문제가 아니라 스탯 공식 문제이므로 PC 로직에서 먼저 원인을 확인해야 한다.

---

## 3-0. 항목 상태 갱신 (2026-10-22 pc-boss-parity, PC Claude)

| No. | 상태 | 근거 |
|---|---|---|
| E-01 | PC 로직 완료 · 표시 차이 남음(Mac) | test_pc_boss_parity 37/0, 비교 격자 `G:/exoduser-wt/_out/pc-boss-parity/compare_09a_fieldboss.png` |
| B-01 | PC 로직 완료 · 표시 차이 남음(Mac) | 로딩 단계 실측 50/130/50/100틱, `compare_10a_entry_namecard.png`·`compare_10a_namecard_1x.png` |
| B-02 | 동작 완료(소환 NOT_READY) · 외형/텔레그래프 차이(Mac) | `compare_10d_boss_close.png`, `compare_10e_*.png`, `compare_10g_revive_*.png` |
| K-02 | 자연 경로 완료 | `compare_11d_clear.png` |

상세·원본 행: [PC_BOSS_CORE_CONTRACT_20261022 §9](PC_BOSS_CORE_CONTRACT_20261022.md), [pc-boss-parity 보고서](orders/reports/pc-boss-parity_REPORT.md).

## 3. 미확인 항목

- 사용자가 Godot를 `run.cmd`(원근 인자)로 실행했는지, main.tscn을 직접 실행했는지.
- 웹 Shift 사슬 이동의 실제 사거리. 헤드리스 키 입력 기준으로 +34~37px만 관측했고, 정상 동작인지 육안으로 확인하지 못했다.
- ~~웹 Shift 사슬 이동의 실제 사거리.~~ → 2026-10-22 PC-MOVE-SKILLS에서 확인: 하네스가 `_harpGauge=5`로 둔 탓이었다. 정상 게이지(225)에서 1단 300px·2단 500px·전격이동 250px(웹 1틱 스텝, [계약](PC_MOVE_SKILLS_CONTRACT_20261022.md)).
- 웹 기본 공격 장면(07b·07c): 웹 플레이어가 fallen 상태여서 비교하지 못했다.
- 웹 J 성장창(열리지 않음, 원인 미조사).
- Godot 맵의 깊이 정렬·가림 처리, 적 피격 플래시와 고어의 동일 여부.
- Godot 보스 외형과 패턴(스폰 불가로 비교 불가).
- 사운드·BGM: 양쪽 모두 음소거로 캡처해 비교하지 않았다.
- 성능(FPS): 측정하지 않았다.
- Mac 실행본: PC에서만 캡처했다. Mac 화면과 같은지 미확인이다.
- 웹 index.html은 미커밋 타 세션 변경이 섞인 작업 사본 기준이다.

---

## 4. PARITY-MAP-01 브랜치 검수 상태 — 2026-10-22 Mac

아래는 위 PC 원문을 보존한 추가 상태다. 구현/회귀 PASS와 동일성 인수를 구분한다. 상세 원본 행·에셋·폐기 참조·검수는 [PARITY_MAP_01_20261022.md](PARITY_MAP_01_20261022.md), 개별 항목 수치는 [원본 대응 manifest](PARITY_MAP_01_SOURCE_MANIFEST_20261022.json)를 따른다.

| No. | 이 브랜치 상태 | 근거·남은 차이 |
|---|---|---|
| M-01 | 부분 이식 / RETOUCH | 웹 청크 64장 바이트 동일·1000px/bleed crop 복귀, 컨셉 바닥 연결 해제. Ch1LivingDetail·군락 얼굴·제단/해자 미이식으로 화면 전체 동일성 미완료 |
| M-02 | 실행 인자 수정 완료 / 자연 전체 경로 미검수 | run.cmd/run.command의 강제 원근 인자 제거, 제품 기본 2D. 사용자 기존 창이 갱신되었다는 주장은 없음 |
| M-03 | 필드 원본 카메라 이식 / 보스 특례 미완료 | zoom1·offset0·원본 damping/look-ahead·맵 clamp, 4좌표 1x 캡처. nominal boss .80만, finale framing 미이식 |
| M-04 | 줌 원인 수정 / 외형 전체 동일성 미완료 | 카메라 .70 제거. 플레이어 스프라이트 원래 scale2 보존. 장비/포즈/HP 등 PC·별도 시각 차이 유지 |
| M-05 | 부분 이식 / RETOUCH | 원본 native_screen_lighting 재사용·640px warm stamp. PP 계수 .18/.10/.55 보존하되 원본 51487 기본 스위치0 유지. half-res/합성/시간 차이 남음 |
| M-06 | 맵 공급 계약 복귀 / 시작 장면 RETOUCH | 시작 (4020,7420), 원본 타일/물리·14소환굴·168분모·지역 [23,60,53,32]. 소환진·생체 디테일 등 전체 시작 표시 미완료 |
| M-07 | 손배치/가림 부분 이식 / RETOUCH | 원본 36개 위치/종류/scale·깊이 .62/.55·경계 나무/그늘 복귀. 늪/독구덩이/시체나무 변형과 전경 ON 경로 등 남음 |

**전체 판정: 웹↔Godot 동일성 인수 미완료.** 테스트 결과만으로 위 M-xx를 닫지 않는다. 비교는 `~/exoduser-wt/_out/PARITY-MAP-01/captures/{1..4}_compare_1x.png`(왼쪽 웹/오른쪽 Godot, 1x) 및 `_crop_1x.png`를 사용한다. 웹은 헤드리스 자동 B preset 때문에 처음 조명/안개가 꺼졌으므로 최종 비교에 원본 S preset 유효 옵션을 명시했고 PP 기본 스위치는 바꾸지 않았다. PC 실행/동기화는 미확인이다.

### PARITY-MAP-01 2차 — 사용자 기준 정정(2026-10-22)

PC 원문/위 후보 기록을 보존한다. 사용자 최신 원문은 “맵 같은 건 업그레이드해도 / UI나 게임 시스템은 그대로 옮기라고”. 구조/플레이 시스템은 동일, 비주얼은 웹 이상이 현행 기준이다.

| No. | 구조·시스템 상태 | 비주얼 상태/근거 |
|---|---|---|
| M-01 | 정적 구조 검수 PASS: 실 웹40,000타일·손배치36·소환굴14 일치; 실제 canMv10,000 불일치0. 게이트누락7점 수정 | 원본64청크 유지; 동맥/재질5곳/접지20/언덕·해자 추가. 전체 시각 인수는 RETOUCH |
| M-02 | 원근 인자 제거 유지; 줌1/offset0/웹 추적 수식 | 새 컨셉/원근 판 없음 |
| M-03 | 원본 손배치/발 위치·y/가림 계약 유지 | 웹 군락 얼굴·유기 소품 국소 변형 일부 미이식, RETOUCH |
| M-04 | 원본 숲53점·3층/가림 기본값 유지 | 전경 ON 경로 미검수; 기본 OFF 보존 |
| M-05 | 스폰·게이트·지역 분모 웹 값; natural E2E 완주 NOT_READY | PC 보스/전투 담당 의존성을 맵 시각 PASS로 대신하지 않음 |
| M-06 | 카메라 시스템1.0·추적 원본, x2.5/보스S=.4 없음 | finale 특수 카메라는 미이식/PC 의존 |
| M-07 | 원본 조명 계수·PP debug0 유지 | 엔진 색/안개/반해상도 합성 차이 RETOUCH. 비교 격자 revision2/captures 참조 |

2차 상세 원본 대응·검수 범위는 [PARITY_MAP_01_20261022.md](PARITY_MAP_01_20261022.md)의 마지막 절을 따른다. 구조 PASS를 “똑같이 플레이됨” 전체 완료로 확대하지 않는다.

### PARITY-MAP-02 — 최신 맵 상태(2026-10-22)

No.는 위 **원문 1-3의 M-01…M-07 뜻**으로 대응한다. MAP-01 2차 표의 재분류는 당시 이력으로 보존한다. 최신 근거는 [PARITY_MAP_02_20261022.md](PARITY_MAP_02_20261022.md)다. 아래는 최종 단회 검수 결과다. 기본 필드/지정4카메라의 구조·비주얼 PASS와 전체게임/자연완주/성능을 구분한다.

| No. | 이번 변경·보존 | 판정 범위 |
|---|---|---|
| M-01 | 원본64청크/1000px world 배치 유지. 원본 생체/접지/제단 레이어에61군락얼굴·유기소품 동작 추가; x4plus64장 core1334/1000world·색/알파보존·bleed224/224 | 정적 구조 PASS / 지정4카메라 VISUAL PASS |
| M-02 | 제품 기본2D·강제원근 인자 제거 유지 | 원근 판 추가0 |
| M-03 | zoom1/offset0·기존 웹 추적 수식 변경0 | 네 좌표 zoom1/offset0 실제 캡처 PASS; 보스finale는별도 |
| M-04 | 기존 플레이어 크기·시스템 변경0 | 배우 외형/장비/HP는 범위 밖 |
| M-05 | 실제 half viewport·원본정적12광원·원본point·2D clock/FBM render clock·DOM fog 합성 교정. S preset/PP기본0 | 원본 수치·half960×540·render clock·DOM 순서 회귀 PASS; 시각 PASS, 미세픽셀 차이/웹proxy tone 차이는 기록 |
| M-06 | 시작(4020,7420)·스폰/게이트/지역 분모 변경0 | 소환진/지역명은 인트로·HUD 담당, 비교에 노출 |
| M-07 | 손배치36/가림 유지. 시체나무 root8pose/매듭5·손3관절·늪/독구덩이/pool bubbles·변형 추가 | 브라우저 실제 drawImage 행렬/원점/크기 대조 PASS; 지정4장면 VISUAL PASS |

최종 증거: `~/exoduser-wt/_out/PARITY-MAP-02/captures/{1..4}_compare_1x.png`·`_crop_1x.png`·`_structure_1x.png`. 회귀19,978/0, alpha64/64·bleed224/224. E2E1회는주입0/HP0/처치0으로NOT_READY. GUI1회는60초포커스실패로성능/VRAM미측정. UI/인트로/PC범위는닫지않음.
## 4. PARITY-UI-01 Mac 상태 열 (2026-10-22)

위 §0–§3은 `d79ee3e67`의 PC 원문을 보존했다. 아래는 별도 Mac 인수 상태이며 PC 원문의 과거 관측을 덮어쓰지 않는다.

| No. | PARITY-UI-01 상태 | 근거 / 남은 차이 |
|---|---|---|
| L-03 | 접근 조건 수정·외형 미완료 | 제품 namespace 순수 검사, 격리 슬롯 테스트. L-04 로비 외형과 구분 |
| U-01 | 진입 수정·동일성 FAIL | storage 플래그 없이 Control 생성, 기본 영속화 활성. 레이아웃/필터/비교/툴팁 전면 이식은 남음 |
| U-02 / K | 미구현 | 현행 SkillForge 실제 웹 캡처·DOM 확보. 새 레이아웃 초안을 제품에 남기지 않음 |
| D-03 | 일반 필드 연결·완료 미판정 | 기존 PC respawn API 사용, 저장 후 scene reload. 보스방 복원 미인수. 실제 결과는 DONE 참조 |

상세: [PARITY_UI_01_20261022.md](PARITY_UI_01_20261022.md). **전체 작업 완료/시각 PASS 아님.**


## Mac 후속 상태 — PARITY-UI-02 (2026-10-22)

PC 원문 및 PARITY-UI-01 이력은 보존한다. **전체 완료/visual PASS 아님.**

| No. | 상태 | 원본 대응·미완료 |
|---|---|---|
| U-01 | 부분 이식 / VISUAL FAIL | 전면 프레임·기사 컷아웃·EQ_POS16칸·필터·상세/2열 비교 표시. 별도 유골함 제단/도감·유물/소켓·CP delta·원본 숫자/미세 외형 미완료 |
| D-02 | 부분 이식 / VISUAL FAIL | 전체 illustration·펫 초상/원본 대사 pool·세 버튼·rolling replay. 피해 로그/상황선택·replay bars/game-only frame·폰트/자간 차이 남음 |
| D-03 | 일반 필드 재시작 연결 / VISUAL FAIL | 사망 장면2.5초 fade·원본 황금 결계 표시. 보스방 복원은 기존 PC 보스 코어 의존으로 NOT_READY 유지 |

상세 원본 행·에셋·Godot 위치·1x 비교: [PARITY_UI_02_20261022.md](PARITY_UI_02_20261022.md). 테스트 통과를 화면 동일성으로 대체하지 않는다.

## Mac 후속 상태 — PARITY-UI-03 (2026-10-22)

PC 원문과 UI-01/02의 관측은 보존한다. **전체 완료/시각 PASS 아님.**

| No. | 상태 | 근거·잔여 |
|---|---|---|
| U-01 | 유골함/회수·비교 펼침 추가 / RETOUCH | 원본 제단·선대 초상·r/t/itemLv0 회수/저장. 기본39필드 비교. CP/DPS/어픽스·소켓·필터·재질·글자 잔여 |
| U-02 | K·13슬롯·CSS2D·장착 writer 부분 이식 / RETOUCH | 기존 관리 API·원본 카탈로그·fused 아이콘·설명·제단/트레이/로드맵 caller. 웹 r186 모듈 부재로 원본 CSS 폴백만 캡처. 3D 재질·애니메이션/합성 전체/일괄·추천 버튼 완료 아님 |
| D-02 | 줄바꿈 폭·상황/페이드·game-only replay bars 추가 / RETOUCH | 원본306/190폭·14.72px, 기존 대사. 480×270 World2D 전용 캡처·HP/ST/MP/SH. glyph/로그/마지막 합성 차이 남음 |
| D-03 | 기존 일반 필드 retry 유지 | 보스방·보호장/로드 후 iframes 전체 동일성은 종전 미인수 유지 |
| E2E 관측 | PASS13 / NOT_READY5 / FAIL0 | UI-02 전투/물약 코드 차이 없음. 무작위 장비/접촉과 하니스 장시간 정지 대기 문제. 실제 근접 입력·쿨다운 대기 이동 보완; 판정/주입/PC 경계 그대로. UI 후속 표시 구현 전1회 측정 |

원본 행·Godot 위치·테스트·1x 비교·제약: [PARITY_UI_03_20261022.md](PARITY_UI_03_20261022.md). 최종 인수는 사용자 동일 장면 눈검수를 따른다.

### PARITY-HUD-01 — 표시 이식 검수(2026-10-22)

원문 H-xx 뜻과 PC 계산 담당을 보존한다. 상세 원본 대응은 [PARITY_HUD_01_20261022.md](PARITY_HUD_01_20261022.md). **전체 VISUAL VERDICT: RETOUCH — 동일성 인수 미완료.**

| No. | 이번 표시 상태 | 비교·남은 차이 |
|---|---|---|
| H-01 | 부분 이식 / RETOUCH | 원본PNG·구슬位置·HP 현재/max·파란shield링·포이즈 눈. CSS frame glow/액체·AA 세부 남음 |
| H-02 | 부분 이식 / PC 값 의존 | ST→SP·MP/SP 분할 숫자·눈/54°노란눈금. `_harpGauge` 소유 값 미공급, 노란 수위 임의 생성0. chargeStocks 대용 계산0 |
| H-03 | PC 계산 유지 | HP/MP/SP·전투력·지역분모 계산 변경0. source 초기 스킬배치 차이도 별도PC 상태 |
| H-04 | 표시 복귀 / RETOUCH | MAP11 미니맵 hide 제거·원본166/130/.85·frame1.05. 경계/marker 픽셀 세부 남음 |
| H-05 | 후행CSS 치수 이식 / RETOUCH | 원본216×153.4·timer170×37/.9·자원108×58/.94. 패널/타이포 세부 비교 필요 |
| H-06 | 원본값 보존 | 원문 불투명판 요구보다 실제 웹9348 `_PET_OP_MAX=.6`이 근거. Godot도.6, 임의1.0 변경0. 대사/시점차이 유지 |
| H-07 | 비원본 띠 숨김 | 선택/실패 toast 표시 제거. 기존 boss/관측 보존 |
| H-08 | 원본 배치 복귀 / RETOUCH | (591,931.2),738×163.8·13칸·실제쿨다운. 아이콘배치/할당 상태차이는PC; 셀 세부 남음 |
| 데미지 숫자 | 원본canvas atlas·pool 이식 | 원본 `_buildNumAtlas`480×168/Pirata One/3색을 직접공급.40pool시작할당·바운스·궤적 원본유지. 비교는 표시fixture, 자연전투 PASS 아님 |
| 방향·시계 | 부분 이식 / RETOUCH | 원본 region_arrow PNG96·거리64px/m·라벨14/12. 원본HUD 회피·목표세부조건 미완료 |

증거: `~/exoduser-wt/_out/PARITY-HUD-01/captures/{1,2,3}_compare_1x.png` 및 `_hud_crop_1x.png`·`_minimap_crop_1x.png`·`_top_crop_1x.png`. 1920×1080 원본과1x크롭, 숫자는명시적표시fixture. 관련회귀17/0. 최신 E2E 결과·오류수·commit SHA는 같은 `_out/DONE.txt`에서확인한다. 테스트PASS를시각PASS로바꾸지않는다.

## Mac 후속 상태 — PARITY-UI-04 (2026-10-22)

기준6c389948, 상세는 `PARITY_UI_04_20261022.md`. PC 원문과 과거 판정은 보존한다.

| 항목 | 후속 상태 | 완료 판정의 제한 |
|---|---|---|
| 쓰러짐·HUD | 원본 G58907 표시 이식 / 300tick PC 판정 유지 | 초기 소환진은 기존 intro 수명 내 같은 프레임으로 비교. 전투/부활 수치 수정 없음 |
| L-04·L-08 | 묘왕 배경 t0 및 우측 기록 목록 / 사망 후 같은 캐릭터 로비 | 영상·영체 애니메이션 HOLD, 세부 CSS/저장 카드 정보·버튼 배선 잔여. 완전 PASS 아님 |
| intro guide | HUD 입력 선전달·physical key fallback | 원본2초 홀드. 최종 strict E2E 결과는 외부 DONE에 기록 |
| inventory 잔여 | power reader 숫자 / CP 헤더 / 원본✕ | glyph·서체·필터 픽셀 동일성 잔여 |
| SkillForge 잔여 | 선택 링·core glow·레벨 해금·버튼색·장착/재료·선택칩·하단 버튼 표시 | batch/recommend PC writer 미제공으로 기능 HOLD. 기존3D·합성잔여 PASS로 바꾸지 않음 |
| 로비 전환 SCRIPT ERROR | potion/feel deferred null-tree guard | 최종 GUI·E2E 로그 분리. 전체 PC 제품 안정성 완료 아님 |

UI-04 strict E2E1회: 주입0, storage=on, intro_phase=done, 실제 필드 진입/이동 확인, SCRIPT ERROR0. 보스부터 로비까지 전체는 NOT_READY. 스킬105/0; 인벤토리212/2는 잘못 전달한 Node 경로로 oracle transport 실패2건이며 재실행하지 않았다. 상세한 한계는 UI-04 보고와 외부 DONE을 따른다.

## PARITY-HUD-02 표시 소비자 (2026-10-22)

이전 표는 당시 검수 이력이다. 아래는 UI-04 `e867f9b370778fa1f621bcf94a1e5f840d4541a8` 위 후속 결과이며 수치 공식 변경은 없다.

| ID | 현재 상태 | 변경과 잔여 |
|---|---|---|
| H-01 | RETOUCH | 원본 PNG 파란 shield frame glow·그림자(테두리 stroke 제거)·HP CSS ellipse/0.6초 easing·눈을 숫자 위로 복구. Gaussian kernel과 Chromium/FreeType AA 세부는 1x 차이 유지 |
| H-02 / PMS-M1 | owner 연결 / RETOUCH | `read_native_move_gauge()`의 pct·cell_deg 소비. max225이면72°이며54° 고정/chargeStocks 대용 계산 없음. 노란색은 기동 링, SP 액체는 원본 초록색. MP/SP 수치는 PC 계산 |
| H-08 / PMS-M2 | 표시 연결 / RETOUCH | skSlot0 바 bottom0/height3×.9px, pct와 원본3색 소비. 폭.1초 ease/하단 radius4px×.9 표시; CSS raster 세부 차이 남음 |
| PMS-M3 | 표시 연결 / RETOUCH | 원본 이동 거부/전격이동 지점 신호만 추가, 판정 변경0. bottom180px, 28.8px 반올림29, letter spacing .2em 근사6, 기본500ms·fade100ms. Gaussian/폰트 subpixel 세부 차이 남음 |

1x 좌웹/우Godot 격자 및 로그: `~/exoduser-wt/_out/PARITY-HUD-02/`. 상세 원본 행·검수 범위는 `PARITY_HUD_02_20261022.md`.
