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
| H-05 | 우상단 정보 (05b) | 금빛 테두리 패널: 레벨 1 / 경험치 0/15 / 지역 처치 0/32 / 악의오브 1,000 | 같은 항목, 더 작고 테두리가 흐리다. 분모 0/8 | 다른 구현 | P2 | hud.gd 목표 패널 :835-837 | Mac 표시 |
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

### 1-8. 적·필드보스·보스 (장면 9·10)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| E-01 | 필드보스 앵글러 (09a) | 마커 (58,158) 근처에서 "심연의 앵글러"(파란 발광 아귀, 이름+HP바)가 깨어나 있다 | 마커 0 근처에서 6초 대기해도 출현하지 않는다(births 0, provider_bound true, pc_bound false). 해골 더미만 보인다 | 누락 | P0 | native_demo11_anglers.gd `_advance_phase`(레슨 가드·serial 조건). 필드보스를 잡을 수 없으므로 보스문 조건 `_fbDone`도 성립하지 않는다 | PC 로직 |
| E-02 | 일반 적 종류 (09b) | 1-1 중앙: etype 16,4,28,7,1,21,26,23,3,0,10,8,25,14,6 등 15종 관측("화마귀" 등) | 관측 etype은 0,1,4 세 종류뿐 | 누락 | P1 | MAP11 natural scheduler/etype 그룹 이식 범위 | PC 로직 |
| E-03 | 적 외형 (07a) | 커튼 링 etype0 "눈알 육괴" 5마리 | 같은 5마리 링(배치 일치). 스프라이트 크기는 zoom 탓에 작다 | 다른 구현 | P2 | M-03과 같은 원인 | Mac 표시 |
| B-01 | 보스방 진입 (10a) | 페이드 → "다크드루이드" 이름 카드 + 보스 HP바 → 아레나, 씨앗 폭탄이 즉시 쏟아진다 | 자연 진입 `encounter.enter`가 NOT_READY(`integer_input_required:difficulty_index`). `difficulty_index:0`을 넣어도 `integer_input_required:room`. 정적 아레나로만 전환하면 화면이 거의 완전히 검다 | 누락 | P0 | native_demo11_encounter.gd:49-72 → main.spawn_native_demo_boss가 스폰 계약 정수 입력(difficulty_index, room …)을 받지 못한다. `bind_native_demo_arena_provider` 호출처 없음 | PC 로직 |
| B-02 | 보스 외형·패턴 (10b) | 사슴뿔 드루이드 스프라이트, 녹색 덩굴 원형 장판, 씨앗 투사체 폭우(bossBeanStorm), 2페이즈(부활) | 보스가 스폰되지 않아 비교 불가. 기존 보스 시각은 BOSS11 하니스의 정지 구성(1600×900, 패턴 미실행)뿐이다 | 누락 | P0 | native_demo11_boss_actor.gd:127-160 `source_updateE_prefix` 오너가 바인딩되지 않아 WAITING_OWNER | PC 로직 |

### 1-9. 사망·클리어 (장면 11)

| No. | 장면 (격자) | 웹 | Godot | 종류 | 심각도 | 원인 추정 | 담당 |
|---|---|---|---|---|---|---|---|
| D-01 | 쓰러짐 (11a) | 화면 붉은 비네트, 플레이어 위 "부활력 11.4%" 카운트다운, HUD 유지 | 화면 가운데 모달 "쓰러졌습니다 / 운명이 결정될 때까지 5". 화면이 어두워진다 | 다른 구현 | P1 | native_demo11_life.gd:35-53 | Mac 표시 |
| D-02 | 사망 화면 (11b) | 전면 일러스트 `img/cin_remember_wide.png`(달빛 여신·감옥), "빛이 꺼졌다"(Cinzel), 피해 요약, 버튼 3개(다시 일어서라/리플레이/로비), 헥터·디로이 대사 | 작은 모달 "다시 일어서라 / EXP -0 / 재시작(비활성) / 로비로 돌아가기". 일러스트·펫 대사 없음 | 다른 구현 | P1 | native_demo11_life.gd:80-109. 웹 game.html:646-660, 3101 | Mac 표시 |
| D-03 | 재시작 버튼 | 다시 일어서라 = 즉시 재시작 | 재시작 버튼이 항상 비활성(`bind_stage_restore` 호출처 없음). 사망하면 로비로 나가는 것 말고 할 수 있는 게 없다 | 버그 | P0 | native_demo11_life.gd:108-118 | PC 로직 |
| K-01 | 스테이지 클리어 (11c) | 보스 처치 → 출구 → 게임 화면 위 "구역 클리어!" + S 랭크 결과 카드(클리어 타임 0:29, 점수 6,835, 처치·보너스 표) + 데모 종료 버튼. 디로이 축하 대사 | 검은 화면 위 "ZONE CLEARED 구역 클리어! 썩은 숲을 정복했습니다 / 데모 종료" 단독 패널. 랭크·점수는 계산만 되고 표시되지 않는다 | 다른 구현 | P1 | native_demo_end_flow.gd, native_demo11_clear_result.gd(소비자는 펫뿐) | Mac 표시 + PC 로직 |
| K-02 | 클리어 진입 | 보스 처치 → 출구 타일 밟기로 자연 진입 | 자연 경로 없음(B-01). 계약 신호 `native_demo_boss_defeated.emit(0)`로만 진입 | 누락 | P0 | B-01과 같은 원인 | PC 로직 |

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

## 3. 미확인 항목

- 사용자가 Godot를 `run.cmd`(원근 인자)로 실행했는지, main.tscn을 직접 실행했는지.
- 웹 Shift 사슬 이동의 실제 사거리. 헤드리스 키 입력 기준으로 +34~37px만 관측했고, 정상 동작인지 육안으로 확인하지 못했다.
- 웹 기본 공격 장면(07b·07c): 웹 플레이어가 fallen 상태여서 비교하지 못했다.
- 웹 J 성장창(열리지 않음, 원인 미조사).
- Godot 맵의 깊이 정렬·가림 처리, 적 피격 플래시와 고어의 동일 여부.
- Godot 보스 외형과 패턴(스폰 불가로 비교 불가).
- 사운드·BGM: 양쪽 모두 음소거로 캡처해 비교하지 않았다.
- 성능(FPS): 측정하지 않았다.
- Mac 실행본: PC에서만 캡처했다. Mac 화면과 같은지 미확인이다.
- 웹 index.html은 미커밋 타 세션 변경이 섞인 작업 사본 기준이다.
