# PC → Mac 전달함 (2026-10-21)

> Mac 맥북총괄과의 직접 메시지가 끊겼을 때(브리지 주소 만료) PC 총괄이 남기는 전달 사항. 최신 항목이 위. Mac은 확인 후 WORK_BOARD에 반영한다.

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
