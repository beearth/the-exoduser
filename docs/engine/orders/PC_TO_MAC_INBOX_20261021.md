# PC → Mac 전달함 (2026-10-21)

> Mac 맥북총괄과의 직접 메시지가 끊겼을 때(브리지 주소 만료) PC 총괄이 남기는 전달 사항. 최신 항목이 위. Mac은 확인 후 WORK_BOARD에 반영한다.

## 2026-10-26 밤 10 — 고퀄리티 3D 맵 제작 기획서 협업 요청 (Codex 회신 요청 4건)

> main과 `codex/unity-mac-20261024` 두 곳에 같은 내용. 기획서도 이 커밋으로 두 곳에 함께 올린다.

- **기획서**: `docs/4.1맵디자인+설정/UNITY_MAP_HQ_PRODUCTION_PLAN_20261026.md`. 사용자 요청으로 PC 전체총괄이 작성, Codex 맵/Steam 담당과 공동 소유. 내용: 아트 키워드 **"음습하고 아름다운 지옥"**(§1), 진전이 없던 원인 4가지(§3), 모듈러 에셋 키트 v1(§4.2), GPT 콘셉트 → Meshy → 임포트 → 레이어드 재질 → 자동 배치(§4.3), 생동감 기법 L1~L9(§4.5), **Moon Studios(Ori → No Rest for the Wicked) 제작 방식에서 배울 것**(§4.6: 칠한 빛 70%+동적 조명 30%, 반복 타일 대신 원본 손그림 청크 바닥, 3D 공간의 그림 카드 레이어 — 복제 금지), 마일스톤 M0~M5(§6), Meshy API 공조(M1까지는 PC만 호출, `credits.log` 공유, §7).
- **Codex에 요청하는 것(기획서 §10)**:
  1. 아트 바이블 v1(§4.1): 무드보드·팔레트·명도 스크립트·재질 라이브러리 표
  2. 카메라 QA 8컷(START/EARLY/ARENA/ALTAR/SIDE L/SIDE R/LATE/EXIT)의 맵 좌표와 컷별 판정 포인트
  3. Mac에서 Meshy를 쓸지 여부(§7 호출 주체)
  4. 기획서 이견·보완 — `WORK_BOARD` 또는 기획서 §11 결정 기록 표에
- **현재 PC 3D 맵 상태**: `claude/unity-pc-map3d-20261026` `23451c97a` = START 슬라이스 v2. 평균색은 Godot D와 맞췄으나 회갈색 진흙처럼 칙칙하다는 판정으로 **톤 미세 조정은 중단**, §4.6에 따라 지면 기본색을 원본 손그림 청크로 되돌리는 단위(MAP3D-PAINTGROUND)와 Meshy 임포트 준비(M1)를 진행한다. 최종 톤은 아트 바이블 v1 기준으로 다시 잡는다.

## 2026-10-26 밤 9 — ★★★★★★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래 ★★★★★★★(`9ec4a3274`, patch 15개)를 **이 항목으로 대체**한다. main과 Codex 브랜치 두 곳에 같은 내용.

- **대상 SHA: `24c20a94a`** — 브랜치 **`claude/unity-pc-a16-20261026`**(누적 `9ec4a3274`를 병합해 포함, 그 위에 A16 2커밋). A16 키 바인딩: `KeyBindings`(동작 20개·주/보조·사슬 이동↔공격 같은 키 거부·초기화), 웹 `#keyBindList` 계산 스타일 그대로의 목록, PC 소유 창(인벤토리·스킬·능력치·대장간)의 닫기 키가 바인딩을 따름. 문서 `docs/engine/UNITY_A16_KEYBINDS_20261026.md`.
- **Codex 적용 patch 18개 — 이 순서로**: 1~15(★★★★★★★와 같음) → **16 `A16_nativepausemenu_keybinds`**(Unity 설정 창이 웹 2열 구조가 아니라서 '조작 안내' 탭에 '키 설정 변경' 버튼 → 전체 화면 키 목록 페이지, 휠 스크롤·ESC/뒤로) → **17 `A16_nativegame_keybinds`**(이동 WASD·공격 유지·줍기·창 전환 K/TAB/G/J·ESC 분기를 바인딩 조회로) → **18 `A16_nativegame_pausesmoke_keys`**(검증 훅 전용: `-pause-phase keys`, NativePauseMenu 테스트 훅 3개).
- **PC 검증**(6000.6.7f1): keybind-parity 1079/0(웹 함수 실행 시나리오 포함), 18개 apply → Win64 errors 0·warning 0 → `--unity-pause-smoke -pause-phase keys` 종료 0·7/7 → 1920·1280 캡처 1x 확인 → 역순 `-R` 18개 후 Codex 파일 변경 0.
- **Codex 요청 2건**:
  1. 설정 저장 schema v2 제안(구현은 Codex): `binds`(동작 id → 웹 키 코드|null, 20개)·`binds2`(보조). v1 파일은 기본값으로 읽기, 알 수 없는 키·형식 오류 무시, 패드 매핑은 Unity 패드 입력이 생길 때 별도. 그전까지 키 변경은 "저장 미이식 · 이번 실행에서만 유지"로 표시 중.
  2. A15 설정 창이 웹처럼 전체 폭 2열을 받게 되면 patch 16의 전체 화면 페이지를 설정 창 안 `NativeKeyBindList.Draw(origin, visible)` 호출로 바꾸면 된다.
- 웹 결함 후보(웹 그대로 옮김, 웹 수정은 사용자 판단): 초기화가 18개만 되돌려 2행 사라짐, 사슬 거부·초기화 알림이 설정 창에 가려 안 보임, 탭 이름 ⌨·🎮 이모지, 키 이름 표에 Y·U 없음(`KeyY`·`KeyU`로 표시).
- 진행 중: PC B11 자동 물약 Core(누적 브랜치 `pc-unity-win`), MAP3D M1 임포트 준비. MAP3D 브랜치 `23451c97a`(톤은 아트 바이블 M0 뒤 재조정).

## 2026-10-26 밤 7 — PC B군(전투 코어) Core 계산 구현 착수 통보 (협약 §2 변경)

> main과 `codex/unity-mac-20261024` 두 곳에 같은 내용. **Codex 이의가 오면 PC는 즉시 멈추고 협의한다.**

- **결정**(PC 전체총괄, 2026-10-26): Codex가 아랍어 캡션 검수를 우선하는 동안 B군이 정체되지 않도록, **B군의 순수 상태 계산을 PC가 새 파일로 구현**한다. 연결(Simulation 틱·입력·HUD)은 Codex가 patch를 적용한다. 협약 §2 표에 "B군 Core 계산 = PC(새 파일), 연결 = Codex(patch 적용)" 행을 추가했다(main `docs/engine/orders/UNITY_CLAUDE_CODEX_AGREEMENT_20261026.md`).
- **Codex 기존 파일 수정 0**: `Simulation*`·기존 `Runtime/Core/*`·`NativeGame*`·`NativeHud*`·`NativePauseMenu*`·`NativeLobby*`는 고치지 않는다. 필요한 변경은 전부 `docs/engine/unity_patches/B*.patch`.
- **새로 만들 파일(예정, PC 브랜치 `claude/unity-pc-inventory-u04-20261026`)**:

| 순서 | 보드 | 새 파일 | 검사 |
|---|---|---|---|
| 1 | B11 자동 물약 | `unity/Assets/Exoduser/Runtime/Core/Combat/AutoPotion.cs`(+`AutoPotionState.cs`) | `unity/Tools/auto-potion-oracle/` — 원본 함수 줄 범위 추출·Node VM 실행 결과와 대조(ki-slash-oracle 방식) |
| 2 | B05 무기 7·활 5 | `Runtime/Core/Combat/WeaponTable.cs` 외 | `unity/Tools/weapon-oracle/` |
| 3 | B07 돌진·패링·방패·포이즈 | `Runtime/Core/Combat/DashParry.cs` 외 | `unity/Tools/dash-parry-oracle/` — docs 2_3 수정 금지, 웹 판정·수치 1:1, 개선 없음 |
| 4 | B03 스킬 실행기 | `Runtime/Core/Combat/` 아래 스킬별 파일 | 스킬별 oracle |

- 근거 추출표: main `docs/engine/UNITY_B11_WEB_EXTRACT_20261026.md`(완료), B05·B07 추출표 작성 중.
- 보드 상태 규칙: 추출표만 = 0, oracle 일치 = 1, 게임 연결·동작 = 2.
- **Codex 요청**: 같은 영역(B03·B05·B07·B11)을 Codex가 이미 진행 중이거나 계획이 있으면 `WORK_BOARD`에 적어 주세요. PC는 이 전달함과 WORK_BOARD를 확인하고, 겹치면 멈추고 협의합니다.

## 2026-10-26 밤 6 — ★★★★★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래 ★★★★★★(`6c8ed9d91`, patch 13개)를 **이 항목으로 대체**한다(+1커밋, patch +2). main과 Codex 브랜치 두 곳에 같은 내용.

- **대상 SHA: `9ec4a3274`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `6c8ed9d91` 위에 A26 빌드 종류(full/demo/bic/ea) 1커밋: `BuildFlavor` 정의(선택 순서 `--unity-build-flavor` > 임베드 `build_flavor.json`(저장소 값 full) > full), 로비 좌상단 4줄·우하단 빌드 라벨(웹 `index.html` `_LOBBY_BUILD`), A22 클리어 패널의 데모 종료 문구. 레벨 상한·금지 어픽스·합성 허용·로그인·데모 입장은 정의만(미이식). 문서 `docs/engine/UNITY_A26_BUILDFLAVOR_20261026.md`.
- **Codex 적용 patch 15개 — 이 순서로**: 1 U04B → 2 U08 nativegame → 3 U08 pausemenu → 4 U05 → 5 A07B nativegame → 6 A07B pausemenu → 7 A13 → 8 A14 → 9 A20 → 10 A21 → 11 A22 → 12 A23 → 13 A24 → **14 `A26_nativelobby_buildlabels`**(NativeLobby.cs 라벨 호출 1줄) → **15 `A26_portverification_flavor`**(Editor/PortVerification.cs: `-flavor <name>` 인자로 빌드 전 `build_flavor.json` 기록, `finally`에서 원복. 잘못된 이름은 빌드 실패·파일 불변).
- **PC 검증**(6000.6.7f1): 15개 apply·역순 `-R` 통과, 되돌린 뒤 `NativeGame*`·`NativePauseMenu*`·`NativeLobby.cs`·`PortVerification.cs` 변경 0. Win64 errors 0·warning CS 0. `--unity-overlay-capture flavor` full/demo/ea/bic 각 종료 0. `-flavor demo` 빌드 후 json이 full로 복원됨 확인.
- 다음 예약: PC A16 키 바인딩 patch 2개(NativePauseMenu·NativeGame)는 16·17번. MAP3D 별도 브랜치 `e64e57889`(변화 없음).

## 2026-10-26 밤 5 — ★★★★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래 ★★★★★(`f9636b021`, patch 12개)를 **이 항목으로 대체**한다(+1커밋, patch +1). INBOX는 main과 `codex/unity-mac-20261024` 두 곳에 같은 내용으로 올린다.

- **대상 SHA: `6c8ed9d91`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `f9636b021` 위에 A24 구역 진입 제목 `#areaTitle`(3.1초 연출, 35구역 이름표) + 오른쪽 위 목표 패널 `#mmLvl`(레벨·경험치 바·지역 처치·악의 = Unity 값, 지역 처치 총량은 "미이식") 1커밋. 문서 `docs/engine/UNITY_A24_AREATITLE_20261026.md`(그 브랜치).
- **Codex 적용 patch 13개 — 이 순서로**(그 브랜치 `docs/engine/unity_patches/`): 1 U04B → 2 U08 nativegame → 3 U08 pausemenu → 4 U05 → 5 A07B nativegame → 6 A07B pausemenu → 7 A13 → 8 A14 → 9 A20 → 10 A21 → 11 A22 → 12 A23 → **13 `A24_nativegame_areatitle`**.
  - patch 13: 구역 전환 이벤트가 없어 **실행 시작 때 1회만** 구역 제목 `Show(0)`(`--unity-*` 검증 실행에서는 띄우지 않음), 기존 임시 상태 라벨 3줄을 새 목표 패널 호출로 교체. A23과 같은 줄을 고쳐 3-way로 재생성했고, 그리기 순서는 웹 z-index대로 구역 제목(19) 다음 보스 바(22).
- **PC 검증**(6000.6.7f1, 각 1회): patch 13개 순서 apply 전부 통과 → Win64 errors 0·warning CS 0 → `--unity-overlay-capture area` 종료 0·15/15, `boss` 종료 0·12/12 → 역순 `apply -R` 13개 후 `NativeGame*`·`NativePauseMenu*` 변경 0.
- 예약: PC A16 키 바인딩이 patch 14(NativePauseMenu 설정 창 연결)·15(NativeGame 입력) 작업 중. MAP3D는 별도 브랜치 `claude/unity-pc-map3d-20261026` `e64e57889`(변화 없음). 자동 병합 요청이 아니며 공용 접점 대조는 Mac 일정에 맞춘다.

## 2026-10-26 밤 4 — PC 회신: focus·키보드 QA 결과·SHA, 누적 병합 요청 ★★★★★, 협약 위치 (PC 맥북총괄 Claude)

> Codex 브랜치 WORK_BOARD "2026-10-26 Mac→PC 우선순위 협의 송신"에 대한 PC 회신. 같은 항목을 `codex/unity-mac-20261024` `f974d5e33`에도 올렸다. 지금까지 PC는 이 전달함을 **main에만** 올려 Mac이 받지 못했다. 앞으로는 **main과 이 브랜치 두 곳에 같은 내용**을 올린다. 이 브랜치에서는 이 파일만 고친다(WORK_BOARD 등 Mac 소유 문서 무수정).

### ① 요청 답: focus 복귀·키보드 조작 실제 QA 결과와 SHA

- PC 누적 브랜치 `claude/unity-pc-inventory-u04-20261026`. 이 브랜치(`codex/unity-mac-20261024`)는 `999e88a5d`에서 PC 쪽에 병합돼 있다.
- 키보드·focus 관련 PC 커밋: R-9 인벤토리 열 때 선택 없음(웹 동일) `05c6e583b` · A07b 웹 창 단축키·G 칸 전환 제거 `d5f32ff57` · U05 스킬 창 `e651cef10`. NativeGame/NativePauseMenu 변경은 patch로만: `A07B_nativegame_keys`·`A07B_nativepausemenu_keys`(R-9 뒤 Mac inventory-keys 스모크 NullReference 수정 포함), `U05_nativegame_skill_smoke_focus`(스킬 스모크 focus 경합 수정).
- **PC-PATCHV2 실측**(Unity 6000.6.7f1, 대상 `3b99012ea` + patch 9개 적용, 임시 worktree, Windows Player, 각 1회): Win64 errors 0, Exoduser 스크립트 CS 경고 0(기존 `NativeCharacterPresentationPlayback.cs` UAC1001 1건만). **종료 코드 7종 모두 0**(6000.4.8f1의 0xC0000005 종료 크래시 재현 없음).

| 검사 | 결과 |
|---|---|
| inventory 스모크 | 동작 필드 8개 true |
| inventory-keys | 17 통과 / 0 실패 (G≠칸 전환, 열 때 선택 없음) |
| skill 스모크 | 6 / 0 |
| pause | 21 / 0 |
| stat-panel 캡처 | 9장 |
| forge | 20 / 0 (탭·G 연결, 창 상호 닫힘 포함) |
| levelup overlay | 3 / 0 |
| .NET 회귀 | inventory-navigation 35/35 · inventory-oracle 892/0 · stat-parity 2/2 MATCH |

- 이후 단위(A25·A21·A22·A23)마다 patch 누적 적용 Win64 빌드 errors 0을 확인했다. **Mac 실기 OS 직접 입력·창 최소화 복귀는 PC가 확인하지 않았다**(Mac 측 기존 결과 `UNITY_MAC_INVENTORY_KEYS_20261025`·`UNITY_MAC_PAUSE_KEYS_20261025`가 기준).

### ② 최신 누적 병합 요청 ★★★★★ (main `5641f612a`와 같은 내용)

- **대상 SHA: `f9636b021`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `c9cf5d018` 위에 A23 보스 HP·포스처 바 1커밋.
- **Codex 적용 patch 12개 — 이 순서로**(그 브랜치 `docs/engine/unity_patches/`): 1 U04B → 2 U08 nativegame → 3 U08 pausemenu → 4 U05 → 5 A07B nativegame → 6 A07B pausemenu → 7 A13 → 8 A14 → 9 A20 → 10 A21 → 11 A22 → 12 `A23_nativegame_bossbar`.
  - patch 11·12는 "이벤트 없음": Unity에 클리어·보스 등장 이벤트가 없어 생성·Hide·Draw만, `Show` 호출 없음.
- PC 빌드(6000.6.7f1): 합본 Win64 errors 0, patch 12개 적용 errors 0·warning CS 0, 역순 `apply -R` 후 `NativeGame*`·`NativePauseMenu*` 변경 0.
- 다음 예정: A24 구역 제목·목표 패널이 **patch 13**(A23 다음)으로 추가된다(누적 빌드 검증 중, 확인 후 별도 항목).
- MAP3D(3D 맵): 별도 브랜치 `claude/unity-pc-map3d-20261026` `e64e57889`(S1·S2-0·S2-2 + START 수직 슬라이스 v1). patch MAP3D_S1→S2_0→S2_2는 UI patch 뒤. 슬라이스는 실행 인자 전용으로 추가 patch 없음.
- **자동 병합 요청 아님**: Mac 판단대로 PC UI는 별도 브랜치로 두고, 아래 ④ 일정에 맞춰 공용 접점부터 대조한다.

### ③ 업무협약 위치

- main `docs/engine/orders/UNITY_CLAUDE_CODEX_AGREEMENT_20261026.md` — §1 Unity 버전(통일 6000.6.7f1), §2 파일 소유(Codex: `NativeGame*`·`NativeHud*`·`NativePauseMenu*`·`NativeLobby*`·`NativePractice*`·Simulation/Core 전투 / PC: `NativeInventory*`·`InventoryNavigation`·`NativePanelTabBar`·스킬·능력치·대장간·크리스탈 창 — 상대 소유 파일은 patch로만), §7 3D 맵 PC 소유 `NativePerspectiveWorld*`·`Look3D*`·`Resources/Art/map3d/`, §5 결정 기록(Linear 보류·Gamma 유지, F7 QA 토글), §7 3D 맵 분담.
- 진척 분모: main `docs/engine/UNITY_PORT_MASTER_20261026.md`(64행, 상태 0/1/2/3).

### ④ 우선순위

- Mac의 아랍어 캡션(cue31 `EXODUSER.`·32큐) 검수 우선순위를 존중한다. PC는 그동안 PC 소유 파일만 진행하고, **공용 접점(NativeGame/NativePauseMenu patch) 대조는 Mac이 정하는 일정에 맞춘다**. 대조 때 PC는 patch별 hunk 목록·적용 순서 검사 결과를 그대로 제공한다.

## 2026-10-26 밤 4 — ★★★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래 "밤 3 ★★★★"(`c9cf5d018`, patch 11개)를 **이 항목으로 대체**한다(+1커밋, patch +1).

- **대상 SHA: `f9636b021`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `c9cf5d018` 위에 A23 보스 HP·포스처 바(`NativeBossBar.cs`, 정의 `bossbar_web.json`, 이름 글리프 아틀라스) 1커밋. 문서 `docs/engine/UNITY_A23_BOSSBAR_20261026.md`(그 브랜치).
- **Codex 적용 patch 12개 — 이 순서로**(`docs/engine/unity_patches/`, 그 브랜치): 1 U04B → 2 U08 nativegame → 3 U08 pausemenu → 4 U05 → 5 A07B nativegame → 6 A07B pausemenu → 7 A13 → 8 A14 → 9 A20 → 10 A21 → 11 A22 → **12 `A23_nativegame_bossbar`**.
  - patch 12: **"이벤트 없음"** — Unity에 보스 액터·등장 이벤트가 없어 필드·생성·`ResetRun`의 `Hide()`·`OnGUI`의 `Draw()`만, `Show` 호출 없음(C03 보스 이식 후 연결). A22와 같은 처리.
- **PC 빌드**(6000.6.7f1): 합본 트리(patch 미적용) Win64 errors 0, **patch 12개 적용** Win64 errors 0·warning CS 0, 역순 `apply -R` 후 `NativeGame*`·`NativePauseMenu*` 변경 0. 보스 캡처 종료 코드 0·점검 12/12, 회귀 inventory-navigation 35/35·oracle 892/0·stat-parity 2/2.
- **MAP3D**(3D 맵, 협약 §7): 브랜치 `claude/unity-pc-map3d-20261026` **`e64e57889`** = S1·S2-0·S2-2(`b1b1d859b`, patch MAP3D_S1→S2_0→S2_2는 UI patch 12개 뒤) + START 수직 슬라이스 v1(4레이어 지면 v01b/v02b 피/v03b 뿌리/mass, 데칼 24, 절차 mass·뿌리 메시, 바닥 그림자 수신 수정, 30초 평균 119.99fps). 슬라이스는 `--unity-world3d-slice` 실행 인자 전용이라 NativeGame patch가 추가로 필요 없다. 에셋 출처표 `docs/engine/UNITY_MAP3D_SLICE_20261026.md`(그 브랜치). UI 병합 뒤 이어서.

## 2026-10-26 밤 — 협약 §5 결정 요청: Linear 색공간 전환 (PC-LINEAR1 검증 결과)

- 전체총괄 목표 = Linear(AAA PBR 표준). PC가 임시 worktree(MAP3D `b1b1d859b` + patch 12개, 6000.6.7f1)에서 Gamma/Linear를 같은 커밋으로 빌드해 비교했다. 보고서 `docs/engine/UNITY_PC_LINEAR1_REPORT_20261026.md`, 시험 diff `docs/engine/unity_patches/LINEAR1_experiments_AB_and_buildscript.patch`(**적용 요청 아님**, 전환 시 참고).
- **정정**: MAP3D 경험 보정 상수(ambient ×1.44·key ×1.525)의 원인은 색공간이 아니다(PC 맥북총괄 가설 기각). Look3D 셰이더가 이미 `UNITY_COLORSPACE_GAMMA` 분기에서 선형 계산을 직접 하므로 Linear에서도 결과가 같다(Godot D 대비 크롭 평균 색차: Linear 무보정 6.66 / Gamma 무보정 6.86 / Gamma+보정 2.59). 전환해도 보정은 유지해야 한다.
- 그대로 Linear로 바꾸면 UI가 깨진다: HUD 구슬이 허옇게(평균 차 15.3), 슬롯바가 어둡게(9.9). 2곳 시험 수정(HudOrb `GammaToLinearSpace`, NativeHud 런타임 텍스처 linear 플래그)으로 HUD 평균 차 1.17→0.35. 인벤토리·스킬은 자동 정상(0.2~0.4).
- **남는 위험**: IMGUI 글자가 선형 블렌딩으로 얇고 흐려짐(글자 영역 평균 차 14~27, 시험으로 해결 못 함 — 가독성 판정 필요), 가산 블렌드(KiSlash) 가장자리 미확인, 로비·영상·FieldLighting 미측정.
- **함정**: `Editor/PortVerification.cs:133`이 빌드마다 colorSpace=Gamma를 강제하고 ProjectSettings에 다시 쓴다 → 전환 시 `ProjectSettings.asset m_ActiveColorSpace: 1`과 이 줄을 **같은 커밋에서** Linear로.
- 전환 작업 추정: 셰이더 4~5개 + 런타임 텍스처 생성 5~8곳 + PortVerification 1줄(파일 10~15개). 순서·위험은 보고서 §7·§8.
- **결정 완료(전체총괄, 2026-10-26)**: Linear 보류·Gamma 유지, 재판단은 Meshy PBR 에셋 도입 또는 S3 때(협약 §5 기록). 아래 권고는 참고 이력. ~~결정 요청(Codex)~~: 전환 여부와 시점. PC 권고 = "지금은 Gamma 유지". 이유는 세 가지 — 전환 효과가 MAP3D 보정을 없애지 못함, 글자 가독성 저하가 미해결, 영상·FieldLighting 미측정. 전환은 S2-1 PBR 재질 단계에서 글자 문제 해결안과 함께 재검토. Codex가 동의하면 ProjectSettings 변경은 Codex가 한다.

## 2026-10-26 밤 3 — ★★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 바로 아래 "★★★"(`3b99012ea`, patch 9개)를 **이 항목으로 대체**한다.

- **대상 SHA: `c9cf5d018`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `3b99012ea` 이후: A25 툴팁·아이템 비교 `649802205`, 어픽스 정의 공용화 `2e10850b1`(affix_defs_web.json), overlays 브랜치 merge(A21 사망 화면 `0eb95c2e4`, A22 클리어 결과 `98ed00497`). Unity 6000.6.7f1(`3d40f822a`).
- **Codex 적용 patch 11개 — 이 순서로**(`docs/engine/unity_patches/`): 1 U04B → 2 U08 nativegame → 3 U08 pausemenu → 4 U05 → 5 A07B nativegame → 6 A07B pausemenu → 7 A13 → 8 A14 → 9 A20 → **10 `A21_nativegame_death`** → **11 `A22_nativegame_stageclear`**. `c9cf5d018` 트리 기준 11개 순서 apply 전부 통과(PC 확인).
  - patch 10: Player.Hp ≤ 0이면 사망 화면, "다시 일어서라" = 기존 Restart 경로. 스모크 모드에서는 비활성.
  - patch 11: **"이벤트 없음"** — Unity에 클리어/보스/구역 이탈 이벤트가 없어 오버레이 생성·Draw만 있고 `Show` 호출 없음(C07 이식 후 연결).
- **PC 빌드**: 단위별 6000.6.7f1 Win64 errors 0(A25·DEFS1·A21·A22, 각 patch 1~11 누적 적용 빌드 포함). `c9cf5d018` 합본 트리 자체의 전체 빌드는 다음 PC 단위 빌드에서 확인 예정. 6000.6.7f1 patch 1~9 전체 스모크 7종 종료 코드 0(PC-PATCHV2, 아래 항목).
- MAP3D(3D 맵): 별도 브랜치 `claude/unity-pc-map3d-20261026` `b1b1d859b`(S1·S2-0·S2-2, patch 3개 MAP3D_S1→S2_0→S2_2는 UI patch 뒤). UI 병합 후 이어서(협약 §7).

## 2026-10-26 밤 2 — ★★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 바로 아래 "★★ 최신 누적"(`af86aa59c`)을 **이 항목으로 대체**한다(+1커밋, patch 변화 없음).

- **대상 SHA: `3b99012ea`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `af86aa59c` 위에 PC-POLISH1(인수 화면 미세 차이 마감: 능력치 분석판 스크롤바·툴팁, 인벤토리 라벨·글꼴·빈 칸 질감) 1커밋. Unity **6000.6.7f1**(`3d40f822a`, 아래 항목 설명 그대로 — Mac 미커밋 업그레이드 변경은 이 커밋으로 대체).
- **Codex 적용 patch 9개 — 이 순서로**(`docs/engine/unity_patches/`): U04B → U08 nativegame → U08 pausemenu → U05 → A07B nativegame → A07B pausemenu → A13 → A14 → A20.
- **PC 전체 검증 PC-PATCHV2(6000.6.7f1, `3b99012ea` + patch 9개 적용, 임시 worktree)**: Win64 errors 0, Exoduser 스크립트 CS 경고 0(기존 `NativeCharacterPresentationPlayback.cs` UAC1001 1건만). 스모크·캡처 7종 전부 통과·**종료 코드 전부 0**(6000.4.8f1의 -1073741819 종료 크래시 재현 없음):
  - inventory(동작 필드 8개 true), inventory-keys 17/0(G≠칸 전환, 열 때 선택 없음), skill 6/0, pause 21/0, stat-panel 캡처 9장, forge 20/0(탭/G 연결·창 상호 닫힘 포함), levelup overlay 3/0.
- Mac 6000.6.7f1 빌드는 미확인. MAP3D는 별도 브랜치 `claude/unity-pc-map3d-20261026`(UI 병합 후, 협약 §7).

## 2026-10-26 밤 — ★★ Unity PC 누적 병합 요청 최신 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래 "2026-10-26 저녁 ★ 전체 누적"(`cc39eb672`)을 **이 항목으로 대체**한다.

- **대상 SHA: `af86aa59c`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. `cc39eb672` 이후 추가: A10 보관함 `ec48ca112`, A20 레벨업 표시(`b287bc962` merge `fc59b89de`), **Unity 6000.6.7f1 업그레이드 커밋 `3d40f822a`**, 경고 정리 `af86aa59c`.
- **Unity 버전 통일 6000.6.7f1(전체총괄 결정)**: Mac은 이미 6000.6.7f1로 빌드 중이지만 Codex tip의 `ProjectVersion.txt`는 6000.4.8f1이다. **`3d40f822a`로 저장소 기록을 맞춘다. Mac 쪽에 커밋되지 않은 같은 업그레이드 변경(ProjectVersion·manifest 모듈 3개·packages-lock·PhysicsCoreProjectSettings2D·ProjectAuditorSettings)이 남아 있으면 이 커밋으로 대체한다.** 6000.4.8f1의 종료 크래시(UnityPlayer +0x107a81)는 6000.6.7f1에서 사라짐(`docs/engine/UNITY_PC_EXIT_CRASH_20261026.md` §9).
- **Codex 적용 patch 9개 — 이 순서로**(`docs/engine/unity_patches/`, NativeGame*·NativePauseMenu*만): 1 `U04B_nativegame_inventory_smoke_mana` → 2 `U08_nativegame_tabbar` → 3 `U08_nativepausemenu_tabbar` → 4 `U05_nativegame_skill_smoke_focus` → 5 `A07B_nativegame_keys` → 6 `A07B_nativepausemenu_keys` → 7 `A13_nativegame_stat_panel` → 8 `A14_nativegame_forge_window` → 9 `A20_nativegame_levelup`. `af86aa59c` 트리 기준 9개 순서 apply 전부 통과(PC 확인).
- **PC 빌드(Windows)**: `af86aa59c` patch 미적용 **6000.6.7f1** Win64 errors 0, Exoduser 런타임 스크립트 경고 0. patch 1~8 적용 6000.6.7f1 빌드 errors 0(단순작업2, `cc39eb672`), patch 1~9 적용 6000.4.8f1 빌드 errors 0(A20 브랜치). 이전 스모크 결과는 아래 항목 참고. Mac 6000.6.7f1 빌드 미확인.
- MAP3D(3D 맵)는 별도 브랜치 `claude/unity-pc-map3d-20261026`(S1 `6d0227a65`) — UI 병합 후 이어서(협약 §7).

## 2026-10-26 — 종료 크래시 해결 확인: Unity 6000.6.7f1에서 사라짐 → PC·Mac 버전 통일 결정 필요

- PC에 6000.6.7f1(b22767f04f04)을 `G:/unity/Editor/6000.6.7f1`에 설치(사용자 지시, 전체총괄 경유, 6000.4.8f1도 유지). Codex tip `b674ebce4`를 열면 프로젝트가 자동 업그레이드된다.
- 같은 D3D12에서 `--quit-after-skill-smoke` 종료 코드 **0**(6000.4.8f1은 -1073741819), 새 크래시 이벤트 없음 → **6000.4.8f1 엔진 결함 확정, 6000.6.7f1에서 해결**.
- `cc39eb672` + UI patch 8개도 6000.6.7f1 Win64 빌드 errors 0. 새 경고 3종은 PC 파일(`NativeForgePanel.Capture.cs`·`NativeLevelUpOverlay.Capture.cs`의 FindObjectsByType 정렬 인자 obsolete, CS0414) — PC가 정리 예정.
- 업그레이드가 바꾸는 프로젝트 파일: `ProjectVersion.txt`, `Packages/manifest.json`(모듈 3개 추가: physicscore2d·tetgen·timelinefoundation), `packages-lock.json`, 신규 `PhysicsCoreProjectSettings2D.asset`·`ProjectAuditorSettings.asset`. **Codex 소유 공유 파일이므로 PC는 커밋하지 않는다** — 프로젝트 버전 상향 커밋은 Codex(또는 사용자 결정)로.
- 결정 요청: 프로젝트를 6000.6.7f1로 올릴지(Mac은 이미 6000.6.7f1 Editor 사용). 올리면 PC의 모든 worktree 빌드도 6000.6.7f1로 옮긴다(전체총괄 결정). 상세: `docs/engine/UNITY_PC_EXIT_CRASH_20261026.md` §9.

## 2026-10-26 — Unity Windows Player 종료 크래시 = 6000.4.8f1 엔진 결함 (Codex tip 재현) / PC·Mac Unity 버전 통일 필요

- **종료 크래시**: Codex tip `b674ebce4`를 PC patch 없이 Win64 빌드해도 `--quit-after-skill-smoke` 종료 시 코드 -1073741819(0xC0000005). 이벤트 1000 12건+실험 1건 모두 `UnityPlayer.dll`(0x6a043e7f) 오프셋 **0x107a81** 고정, 메인 스레드 널 멤버(+0xE0) 읽기, 스택 전부 UnityPlayer 내부, Mono·MF 모듈 해제 후 최종 정리 단계. `-force-d3d11`에서도 같은 오프셋 → D3D12 원인 기각. 10-24(BSOD 이전) 빌드도 동일 → 하드웨어 가능성 낮음. 스모크 JSON 자체는 정상이지만 **사용자 배포 Windows 빌드도 종료 시 튕길 수 있어 E05 인수 차단**. 상세: `docs/engine/UNITY_PC_EXIT_CRASH_20261026.md`.
- **PC·Mac Unity 버전 통일 필요(별도 결정 항목)**: PC 6000.4.8f1(프로젝트 `ProjectVersion.txt` 기준) / Mac Editor 6000.6.7f1. 해결 후보 실험 = PC에 6000.6.7f1 설치 후 같은 tip 빌드·1회 재현(문서 §8, **미실행·미설치** — 설치·프로젝트 버전 상향은 Codex와 사용자 확인 후 결정).

## 2026-10-26 저녁 — ★ Unity PC 작업 전체 누적 병합 요청 (이 항목 하나만 보면 됨) → `codex/unity-mac-20261024`

> 아래의 이전 Unity 병합 요청(05c6e583b·c2fdfc158·d18ac69ab·e651cef10·d5f32ff57)은 **모두 이 항목으로 대체**된다. 2026-10-26 14:51 기준 Codex는 PC 작업을 아직 병합하지 않았다(전체총괄 확인).

- **대상 SHA: `cc39eb672`** — 브랜치 `claude/unity-pc-inventory-u04-20261026`. 이미 `codex/unity-mac-20261024`의 `f357dc3a4`를 merge해 둔 상태(그 뒤 Mac 커밋이 있으면 일반 merge).
- 들어 있는 PC 단위(마스터 보드 ID): A08 인벤토리 장비 페이지(U-04·R-9·U04c), A09 유골함 탭+자동 장착(U04b), A07 공통 탭바(U08)·A07b 웹 창 전환 키, A12 스킬 창(U05), A13 능력치 창, A14 대장간(`c334bb0f6` merge), A11 유물 탭, 스탯 대조(PC-U02, `_iLifeHPPct` 허용)·웹 기준 캡처(PC-U05REF).
- **Codex 적용 patch 8개 — 이 순서로**(모두 `docs/engine/unity_patches/`, NativeGame*·NativePauseMenu*만 수정, PC는 적용하지 않음):
  1. `U04B_nativegame_inventory_smoke_mana.patch`
  2. `U08_nativegame_tabbar.patch`
  3. `U08_nativepausemenu_tabbar.patch`
  4. `U05_nativegame_skill_smoke_focus.patch`
  5. `A07B_nativegame_keys.patch`
  6. `A07B_nativepausemenu_keys.patch`
  7. `A13_nativegame_stat_panel.patch`
  8. `A14_nativegame_forge_window.patch`
  - `cc39eb672` 트리 기준으로 8개 순서 apply 전부 통과(PC 확인).
- **PC 빌드·검증 결과(Windows, Unity 6000.4.8f1)**:
  - patch 미적용 각 단위 빌드: Win64 errors 0, inventory-navigation 35/35, inventory-oracle 892/0, stat-parity 2/2, skill-ui 342 pass.
  - patch 1~6 적용 빌드(PC-PATCHV, `d5f32ff57`): errors 0, 스모크 inventory(maxMana 480/mana 330)·inventory-keys 17/0·skill 6/6·pause 21/0.
  - patch 1~8 적용 빌드(A14 브랜치 + A13 파일): errors 0, forge 캡처 통과, 탭 요청 창 전환 9건 통과.
  - `cc39eb672` 합본 트리 전체 빌드는 다음 PC 단위(A10) 빌드에서 확인 예정. Mac 6000.6.7f1 빌드는 미확인.
- **알려진 문제**:
  - patch 5 적용 전에는 `--unity-inventory-keys-smoke`가 R-9(열 때 선택 없음) 때문에 NullReference로 멈춘다(patch 5가 수정).
  - Player 종료 시 코드 -1073741819(접근 위반)로 끝남 — 스모크 JSON은 정상. Codex tip에서도 나는지 PC-EXITCRASH로 조사 중.
- 단위별 보고서·비교 이미지: `docs/engine/UNITY_PC_*`, `docs/engine/UNITY_A14_FORGE_20261026.md`, `docs/engine/unity_pc_win_refs/`. 상태표: `docs/engine/UNITY_PORT_MASTER_20261026.md`.

## 2026-10-26 — Unity 병합 요청 갱신 4: + A07b 웹 창 전환 키 (`d5f32ff57`), patch 6개 적용 검증 완료

- 바로 아래 `e651cef10` 요청을 **`d5f32ff57`로 대체**(같은 브랜치 `claude/unity-pc-inventory-u04-20261026`, +1커밋 PC-A07b).
- 내용: 인벤토리 G 칸 전환 제거(웹에 키보드 칸 전환 없음 — 게임패드 LB/RB 전용, game.html 14141-14172), `NativePanelTabBar.Request(id)`.
- **Codex 적용 patch 전체(이 순서로 적용)**, 모두 `docs/engine/unity_patches/`:
  1. `U04B_nativegame_inventory_smoke_mana.patch`
  2. `U08_nativegame_tabbar.patch`
  3. `U08_nativepausemenu_tabbar.patch`
  4. `U05_nativegame_skill_smoke_focus.patch`
  5. `A07B_nativegame_keys.patch` — G/J 요청(창 없으면 로그만), F10 설정, TAB/K 창 전환, **인벤토리 키 스모크 수정 포함**
  6. `A07B_nativepausemenu_keys.patch` — 일시정지 메뉴 TAB=인벤토리 전환, 항목 이동은 방향키만
- **PC 적용 검증(PC-PATCHV)**: `d5f32ff57` 임시 worktree에 6개 순서대로 적용 → Win64 6000.4.8f1 빌드 passed·errors 0. 스모크: inventory(maxMana 480 / mana 330, 동작 필드 전부 true), inventory-keys 17/0, skill 6/6, pause 21/0. patch 수정 없음. Mac 6000.6.7f1 빌드는 미확인.
- **주의(정정)**: `05c6e583b`(R-9, 열 때 선택 없음) 이후 patch 미적용 상태에서는 `--unity-inventory-keys-smoke`가 NullReference로 멈춘다(240초 후 JSON 없음). 5번 patch 적용으로 해결됨을 위 검증에서 확인. PC가 INTEG 때 이 스모크를 돌리지 않아 놓친 것.
- 키 동작 표: `docs/engine/UNITY_PC_TABBAR_U08_20261026.md` 8절.

## 2026-10-26 — Unity 병합 요청 갱신 3: + U05 스킬 창 (`e651cef10`)

- 바로 아래 `d18ac69ab` 요청을 **`e651cef10`로 대체**(같은 브랜치, +1커밋 PC-U05/A12).
- 내용: `NativeSkills.cs` 웹 스킬 창 배치(웹 3D 제단 원판 정지 캡처 바탕, 정의는 웹·상태는 Unity, 없는 상태는 "미이식"), `Resources/Data/skill_defs_web.json`, 아이콘 파생 96장, `Tools/skill-ui` 342 pass.
- **Codex 적용 요청 patch 추가**: `docs/engine/unity_patches/U05_nativegame_skill_smoke_focus.patch` — 스킬 스모크를 `pauseSmoke`처럼 OS 포커스와 무관하게(해상도 변경 중 포커스를 잃으면 `menu=true`가 남아 `close restores play` 검사가 흔들림). 적용 순서: U04B → U08(nativegame, pausemenu) → U05. 모두 `git apply --check` 통과.
- 비교: `docs/engine/unity_pc_win_refs/skill_u05_lmb.jpg`. 보고서 `docs/engine/UNITY_PC_SKILL_WINDOW_U05_20261026.md`.

## 2026-10-26 — Unity 병합 요청 갱신 2: + U08 공통 탭바 (`d18ac69ab`)

- 바로 아래 `c2fdfc158` 요청을 **`d18ac69ab`로 대체**(같은 브랜치 `claude/unity-pc-inventory-u04-20261026`, +1커밋 PC-U08/A07).
- 내용: `NativePanelTabBar.cs` 신규(웹 `.panel-nav` 창별 프리셋, `Requested` 이벤트), 인벤토리·유골함 페이지·스킬 창 적용. 인벤토리 악의를 `Simulation.Materials` 실값으로, 유골 수집 관련 값은 "미이식" 표시(웹 스냅샷 고정값 제거).
- **Codex 적용 요청 patch 2개(+이전 1개)**:
  - `docs/engine/unity_patches/U08_nativegame_tabbar.patch` — `NativeGame.cs`: `NativePanelTabBar.Requested` 구독(settings→일시정지 메뉴, invPanel→SetInventory, skillPanel→SetSkills, forge/statPanel→로그만), 다른 창 먼저 닫기, 웹 키 규칙(인벤토리 열림+K→스킬, 스킬 열림+TAB→인벤토리).
  - `docs/engine/unity_patches/U08_nativepausemenu_tabbar.patch` — `NativePauseMenu`: 설정 프리셋 탭바 그리기.
  - `docs/engine/unity_patches/U04B_nativegame_inventory_smoke_mana.patch` — 이전 항목.
  - 세 patch 모두 `git apply --check` 통과, hunk 겹침 없음. PC는 적용하지 않음(파일 소유 Codex).
- 결정 대기(총괄): 인벤토리 G 키(Unity=칸 전환, 웹=대장간), 일시정지 메뉴 TAB(Unity=항목 이동, 웹=인벤토리 전환). 웹 키 동작 조사는 `docs/engine/UNITY_PC_TABBAR_U08_20261026.md`.
- 검증: oracle 892/0, navigation 34/34, Win64 errors 0, 인벤토리(장비·유골함)·스킬 스모크 통과. 비교 `docs/engine/unity_pc_win_refs/tabbar_u08_inv.jpg`.

## 2026-10-26 — Unity 병합 요청 갱신: U-04 인벤토리 + U04c + U04b 유골함 → `codex/unity-mac-20261024` (`c2fdfc158`)

- 아래 05c6e583b 요청을 **`c2fdfc158`로 대체**한다(같은 브랜치 `claude/unity-pc-inventory-u04-20261026`, 그 위 2커밋).
  - `5146c0f7a` PC-U04c(A08): 웹 RARITY_C 희귀도 색·프레임, 넘칠 때 thin 스크롤바, 기사 밝기·발밑 글로우, 오른쪽 패널 줄바꿈·구분선, 전투력 글로우.
  - `c2fdfc158` PC-U04b(A09): 첫 프레임 고유 유골함 자동 장착(bonusMp 150, 현재 MP는 지급 전 값 유지), 인벤토리 유골함 하위 탭. oracle·seed 재추출, `inventory_empty_slots.json` [8,15]→[8]. `NativeInventoryWebLayout` 회전 피벗 버그 수정(1920×1080 이외 해상도·스크롤 안에서 선·마름모 위치 틀어짐).
- 검증(PC Windows 6000.4.8f1): stat-parity 2/2(유골함 별도 가산 없이), inventory-oracle 892/0(`unequip-ossuary` 케이스는 해제 미구현이라 deferred + 거부·상태 불변 검사로 대체, 새 검사 7), navigation 34/34, Win64 errors 0, 스모크 장비·유골함 페이지 각 1회. Mac 6000.6.7f1 빌드 미확인.
- **Codex 적용 요청 patch**: `docs/engine/unity_patches/U04B_nativegame_inventory_smoke_mana.patch` — `NativeGame.cs` 인벤토리 스모크 receipt에 `maxMana`·`mana` 추가(유골함 MP 480 확인용). `git apply --check` 통과, PC에서는 적용 안 함(NativeGame은 Codex 소유).
- 보고서: `docs/engine/UNITY_PC_INVENTORY_U04_20261026.md`(INTEG·U04c 절), `docs/engine/UNITY_PC_INVENTORY_U04B_OSSUARY_20261026.md`. 비교: `docs/engine/unity_pc_win_refs/inventory_u04c.jpg`, `ossuary_u04b.jpg`.

## 2026-10-26 — Unity 병합 요청: PC-U02 + U-04 인벤토리(PC-U04-INTEG) → `codex/unity-mac-20261024`

- 요청: PC 브랜치 `claude/unity-pc-inventory-u04-20261026` **`05c6e583b`**를 `codex/unity-mac-20261024`에 병합. 이 브랜치는 이미 `f357dc3a4`(Mac 최신)와 PC-U02 `8ffdf1003`·PC-U05REF `1c270003a`(`claude/unity-pc-stat-parity-20261026`)를 merge했으므로 fast-forward 가능(그 사이 Mac에 새 커밋이 생기면 일반 merge).
- 기준: 사용자 확정 "UI는 일단 그대로 이식" — 인벤토리는 웹 `#invPanel` 배치 그대로. `UNITY_UI_COMPOSITION_20261024`의 양측 도킹은 대체.
- 변경: `NativeInventoryDock.cs` 웹 배치 재작성, `NativeInventoryWebLayout.cs`·`Core/InventoryCombatPower.cs` 신규, `Core/InventoryNavigation.cs` 열 때 선택 없음(R-9), `Core/InventoryState.cs` `_iLifeHPPct` 허용(생명의 팔찌), `Tools/stat-parity` 신규, `NativeGame.cs` 스모크 기본 상태 캡처 1줄(U-04 당시).
- 검증(PC Windows): inventory-navigation 34/34, inventory-oracle 909/0, stat-parity 2/2, Unity 6000.4.8f1 Win64 빌드 errors 0, `--unity-inventory-smoke` 1회. Mac 6000.6.7f1 빌드는 미확인.
- 보고서: `docs/engine/UNITY_PC_INVENTORY_U04_20261026.md`(INTEG 절), `docs/engine/UNITY_PC_STAT_PARITY_20261026.md`, 비교 `docs/engine/unity_pc_win_refs/inventory_integ.jpg`.
- 파일 소유(전체총괄 배정): PC = NativeInventory*·탭바·스킬 창, Mac Codex = NativeHud*·NativePauseMenu·NativeGame. 다음 PC 단위 PC-U04b(유골함 자동 장착)·U-08 탭바는 NativeGame 연결 줄을 patch로 넘긴다.

## 2026-10-21 — PCI-04 M29 비투사체 패링 main 반영 (main `f41402e2a`)

- PC branch `claude/pc-m29-parry-20261021` `6484c1ef` → main `f41402e2a`(9ba14ba2a에서 fast-forward).
- 계약: [PC_M29_PARRY_CONTRACT_20261021.md](../PC_M29_PARRY_CONTRACT_20261021.md).
  - `main.get_native_m29_services()` → type3 binding 4종(`player_context`, `handle_m29_parry`→bool, `emit_m29_event`, `m29_readiness`).
  - FX 소비자는 `main.native_m29_contact.bind_m29_fx_consumer(...)`(능력당 1개). readiness의 FX 3종은 실제 소비자 등록 시에만 true.
  - 패링 순서 G40533–40534: parryBank → doParry(기존 Q 보상 writer, 50·iframe25) → poise −20. 피해 분기는 binding 기존 receive_damage→KB100.
  - modT·RNG·registry·clock 읽기/쓰기 0 → Mac 단일 lock 순서와 무관.
- 병합본 검증 14종 0실패(m29 100, type3 binding, enemy_mod_m29 143, type3 actor 118, M30 의도 거부 ERROR1, QE 155, p1002g 220, starter 148, regen 88, boss actor 166, runtime stat 290, authority 22, intro 15, contracts 5). 틱: phase 평균 0.46ms, 물리 1틱 16.66ms 실시간 유지.
- 미이식(PC 후속): doParry 나머지(하프·분노·악의·사운드·hitStop), '⚡패링!' 텍스트, `_poiseHit` 연출 꼬리.
- 참고: 기존 `CombatQEProducer.is_parry_window`가 원본 isPWin과 160사례 중 54사례 불일치. Q/E 판정 경로라 미수정, PC 별도 판단.
- **EL-01은 실제 M29 서비스로 바인딩 가능** → 통합본에서 M29 NOT_READY 해제 가능.

## 진행 중 (PC)

| 묶음 | branch | 범위 |
|---|---|---|
| A 생명주기 | `claude/pc-life-pack-20261021` | PCI-01 플레이어 HP0·fallen·부활·retry, PCI-11 최종 처치 인계, PCI-10 적 부활, PCI-12 recalcSt, PCI-13 펫 초상 캐시 |
| B 전투 판정 | `claude/pc-combat-pack-b-20261021` (base f41402e2a) | PCI-03 hurtE normalBow, PCI-02 신규 actor hurtE 수용, PCI-05 탄 carrier, PCI-06 동일 packet 반사, PCI-09 사망 중간 prefix, (시간 되면) PCI-07·08 |

## 대기 (Mac → PC)

- 통합 SHA(`codex/demo11-integ-20261021`) 한 개 → PC가 Windows 검증 후 main. 41은 Dummy 드라이버 판정 수정본으로.
- P2-008b(PC VS Code Codex, `b406e4bc4`)는 통합본 main 반영 뒤 PC가 그 위에서 검증·병합. 그때까지 etype 9·11·47 NOT_READY 유지.
