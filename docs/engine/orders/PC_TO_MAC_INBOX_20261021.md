# PC → Mac 전달함 (2026-10-21)

> Mac 맥북총괄과의 직접 메시지가 끊겼을 때(브리지 주소 만료) PC 총괄이 남기는 전달 사항. 최신 항목이 위. Mac은 확인 후 WORK_BOARD에 반영한다.

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

> WORK_BOARD "2026-10-26 Mac→PC 우선순위 협의 송신"에 대한 PC 회신. 지금까지 PC는 이 전달함을 **main에만** 올려 Mac이 받지 못했다. 앞으로는 **main과 이 브랜치 두 곳에 같은 내용**을 올린다. 이 브랜치에서는 이 파일만 고친다(WORK_BOARD 등 Mac 소유 문서 무수정).

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

## 2026-10-26 — 사용자 무음 정정·실제 Claude 협동 회수

사용자가 Claude 협동을 명시 승인하고 FDG→인트로·실버테일 해당 구간은 원래 무음이었다고 정정했다. Codex는 실제 Claude 앱의 기존 `맥북총괄 (fork)` 세션 `b021ef9d-55d5-4b33-b78c-393bfe87cc35`에 읽기 전용 대조를 요청했다. Opus5.5 중간 표시·실제 착수/도구 실행·완료 응답을 확인했고, Claude가 Unity 파일/INDEX/commit 변경0 및 기존 수정 소유 없음으로 회신했다. MD 작성만으로 협업을 간주한 기록이 아니다. CLI2.1.304 설치도 확인했으나 새 CLI 작업·과금 API·모델 하향은 실행하지 않았다.

회수 계약: source index.html605 FDG muted,580/4599 타이틀 muted,629 게이트 대기 muted,2273–2275 초반 로비 BGM 진입 차단. 실버테일은 원본 스플래시 문서80행의 `title_motion_hd_20260929.mp4` 키아트 반복이며 캐릭터선택 idle 영상은 이번 구간 밖이다. Gate ENTER에서 입장 효과음(1×2), intro.mp4 mute 해제/0.6, 프롤로그 BGM0.6이 시작되고 이후 WorldIntro voice/음악0.22·로비 BGM0.65는 유지한다. 현재 NativeLobby.Begin만 FDG muted=false로 여는 설정 차이를 확인했다. Claude의 파일 트랙 확인은 런타임 청음 PASS가 아니다.

Claude는 원본 readonly 대조, Codex 기존 구현자는 Native 영상/오디오 최소 접점과 격리 fixture, ROOT는 실제 baseline→fix→직후 복귀 빌드를 소유한다. 전역 AudioListener/mixer·음량 설정/저장·영상 bytes/자막/offset·기존 Godot/Steam/PC WIP·자동화 변경0. WORK_BOARD의 현재 오더에 반영했다.

추가 마감: 실제 baseline FDG 출력 결함과 Mac native intro audioTrackCount0을 각각 확인해 muted 호출 및 원본 MP3 조건부 fallback만 보정했다. final31/31, normal b4560e63 ARM64 오류0, 기존 저장 hash 동일이다. actual Claude의 파형/수명 crossreview를 회수했고 조명 d3a4a9a3b의 다음 별도 runtime 검수를 위해 Unity/GPU 해제를 전달했다. GPT API 키 부재로 이미지 요청·생성0이며 다른 사이트 잔액을 단정하지 않았다. [최종 인수](../UNITY_MAC_INTRO_SILENCE_20261026.md).

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
