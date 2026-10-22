# PC-HUD-STATS — HUD 수치(H-03) 원인 추적·원본 이식 보고

2026-10-22 KST, PC Claude. 기준 `origin/claude/pc-move-skills-v2-20261022`(ca9c7c30e = INTEG-10 + 이동 스킬), 브랜치 `claude/pc-hud-stats-20261022`, worktree `G:\exoduser-wt\pc-hud-stats`. main 미병합.
원본 = 고정 스냅샷 `godot/source_snapshot/game.html`(SHA256 `4d911cdd…`, `G:/exoduser/game.html`·`origin/main:game.html`과 sha256 동일 확인).
로그·캡처: `G:/exoduser-wt/_out/pc-hud-stats/`.

**판정: 스탯 공식은 웹과 같다. 단 회귀 1건(fieldboss 130/3, §6-1)이 이 변경으로 생겨 main 병합은 보류를 권고한다.**

**세부: 스탯 공식은 웹과 같다. 같은 상태(웹 덤프 주입)에서 HP·MP·오른쪽 구슬(SP=ST)·전투력·쉴드 수치가 웹과 모두 같다. 차이의 원인은 ① 유골함 자동 지급 미이식(이식 완료), ② 시작 장비 랜덤 롤(양쪽 모두 무작위라 캡처마다 다름), ③ 지역 처치 분모는 MAP11 맵 provider(Mac PARITY-MAP-01 소관)였다. 구슬 표시 모양(“생명력” 3줄, “ST” 글자, 링)은 Mac 표시 행 H-01/H-02로 남는다.**

## 1. 같은 상태로 고정한 방법

| 쪽 | 방법 |
|---|---|
| 웹 | `G:/exoduser` main 작업 사본에서 `PORT=3398 EXODUSER_SAVE_DIR=G:/exoduser-wt/_out/pc-hud-stats/web_saves node server.cjs`(3399는 다른 세션 서버가 점유 중이어서 사용하지 않음). Playwright 헤드리스 Chrome·음소거·새 격리 프로필 1920×1080. `game.html?test=1&slot=demo&demo=1&story=warrior-v21` → `_startDemoNew` 신규 → `_cutsceneEnd()` → 레슨 `skipAll` → 3초 → `G.paused=true; updateHUD(true)` → 화면 캡처 + 상태 덤프(`P`, `STATS`, `PASSIVES`, `INV.equipped` 전체, `G._regions`, `G.spawnHoles`, HUD 텍스트, DOM rect). 도구 `_out/pc-hud-stats/tools/web_hud_capture.cjs`·`web_dump.cjs` |
| Godot | `godot/tests/capture_pc_hud_stats.gd`(창 모드 1개, `--audio-driver Dummy`, 격리 userdir `EXODUSER-pc-hud-stats-Isolated-20261022`). main.tscn 직접 부팅 → 가이드 → 커튼 → 레슨 skip → `natural` 덤프·캡처 → `--inject=<웹 덤프>`: 실제 State의 `equipped`/`STATS`/`PASSIVES`를 웹 값으로 교체 → 런타임 스탯 owner `recalc_st`→`apply_stats` → 웹 현재값 hp/mp/st/shield 주입 → World·Player 정지(회복 정지) → 덤프·캡처 |
| 고정 데이터 | 웹 덤프를 `godot/tests/pc_hud_stats_web_fixture_20261022.json`으로 저장(테스트 D·F가 사용) |

RNG 시드 공유는 쓰지 않았다. 웹 `Math.random`은 시드가 없고 웹·Godot의 난수 소비 순서가 시작 장비 전에도 달라서, 같은 시드로는 같은 장비가 나오지 않는다. 그래서 웹 상태 덤프 주입으로 고정했다.

## 2. 항목별 원인 (원본 행)

| 항목 | 웹 값의 출처 | Godot 차이 원인 | 조치 |
|---|---|---|---|
| 최대 HP | applyStats G27920·27940·27956: `~~((stageHp+s.str×5+s.vit×3+ΣbonusHp+…)×(1+…))+결정+pHuman×100+근성`. Lv1 신규는 STATS 0·근성 0이라 `300 + ΣbonusHp(방어구 6칸, 각 10~49 랜덤)`과 헬멧 implicit 등 | 공식 같음. 웹 516/512, Godot 533/630 차이는 defaultItems 15개의 bonusHp 랜덤 롤 | 없음(주입 시 567=567) |
| 최대 MP | G27931·27947: `~~(100+s.int×2+ΣbonusMp+maxMPFlat+강화MP)+결정+pHuman×100+근성` | **유골함 bonusMp 150 누락.** 원본 `draw()` G51733이 G.on 첫 렌더 프레임에 `_grantOssuaryIfNeeded()`(G45880) 1회 → `mkItem('ossuary',0,EL.P,5)` 고정 유니크(eDef 60·bonusMp 150, G16155-16165) 장착 → `recalcSt()`·`applyStats()`(G45888-45889). Godot에는 이 경로가 없었다 | **이식**(§3) |
| HUD MP 현재값 | updateHUD G60302 `~~P.mp`. `_startDemoNew` G62197에서 `P.mp=P.mmp`로 채운 **뒤** 유골함이 붙어 최대치만 +150, 현재값은 clamp만(충전 없음) → 회복으로 차오른다 | 웹 “MP 391/411”은 회복 중 현재값. Godot “265”는 유골함이 없어 이미 최대 | 이식 후 Godot도 시작 직후 최대보다 150 낮게 시작해 회복(자연 시작 캡처 307/457) |
| 오른쪽 구슬 오른쪽 반 | HTML G2658-2660 라벨 글자 **“SP”**, 값 G60304-60305 `~~P.st` / `~~P.mst`(스태미나). recalcSt G16431 `~~(100+STATS.dex×2+ΣbonusSt+…)+…` | 값의 출처는 같다(P.st/P.mst). 라벨 글자만 Godot “ST” | 데이터 변경 없음. 표시 글자는 **Mac 요청 HS-M1** |
| 전투력 | updateHUD G60325 `calcCP().total`, calcCP G49487 | Godot hud.gd `_native_calc_cp`는 원본 식과 같음(oracle 확인). 차이 = 유골함 mmp 150×0.3 = **45** + 장비 랜덤 롤 | 유골함 이식으로 해소 |
| 지역 처치 분모 | G60321-60322: 현재 지역 `G._regions[_regCurIdx].total` = 그 사분면 소환굴의 `Σ_spawnHoleCount(size,0)`(S=8, M/L=15, G31030). 웹 1-1 소환굴 14개 → 지역별 23/60/53/32, 시작 (4020,7420) 남동 = **32** | Godot MAP11 provider의 소환굴이 지역마다 S 1개(=8)이고 시작 지역도 다름(남서). 계산 함수(native_regions·spawn_hole_count)는 원본과 같다: 웹 1-1 `data/map.json`에 `build_native_placement` → 웹 G.spawnHoles 14개와 좌표·크기 동일, 사분면 합 23/60/53/32·시작 남동 32(테스트 F) | MAP11 맵 구조 = Mac PARITY-MAP-01(`field_runtime.gd`가 웹 map.json·`build_native_placement`로 교체 중) 소관. **Mac 요청 HS-M4** |

부수 발견(원본과 다름, **보류**):
- **시작 장비 홈**: 현 원본 mkItem G16148-16151은 “신규 장비 전부 닫힌 0홈(socketCount 0, crystals [], socketQ [])”(2026-10-10). Godot `starter_item_factory_source`는 구 행 기준 1~4홈 롤(아이템당 RNG 1회)이 남아 있다. HUD 수치와는 무관하다(인벤토리 홈 표시·RNG 소비에 영향). 원본대로 고쳐 보았으나 RNG 소비가 25회 줄면서 `seed(20261021)` 고정 데이터를 쓰는 Mac 래퍼 `test_pc_combat_pack_b_mac.gd`의 시나리오가 바뀌어(관통 처치 증가 → 남은 적 0 → `_enemies_alive()[0]` SCRIPT ERROR, 396→269) 이 브랜치에서는 되돌렸다(원복 상태에서 같은 테스트 396/0 확인). 고정 데이터 조정과 함께 별도 단위로 처리해야 한다 → **Mac 요청 HS-M5**.

원본 사실 기록(웹 동작 그대로, 의도 여부 미확인):
- 유골함 오버라이드는 `legendarySpecial`/`uniqueSpecial` 객체만 null로 바꾸고, 롤 단계에서 붙은 원시 키 `_l*`·`_u*`(예: `_lHammerShock 1.2`, `_uMaceExplode 0.3`)는 지우지 않는다. `_uEq`(G16512)는 원시 키를 읽으므로 `_u*` 효과가 살아 있다. Godot 포트도 원본 그대로 남긴다. 2_7 문서에 기록.

## 3. 수정 내용

| 파일 | 내용 | 원본 |
|---|---|---|
| `godot/scripts/main.gd` | `_process` 선두에서 세션당 1회 `_native_ossuary_grant_check()`: `G.on==true` 첫 렌더 프레임에 State 진입점 호출, 지급되면 런타임 스탯 owner `recalc_st` → `apply_stats`. owner 비현재(일시정지 등) 프레임은 다음 프레임에 재검사. 영수증 `native_ossuary_grant_receipt` | G51733, G61887-61903(draw는 G.on일 때만), G45888-45889 |
| `godot/scripts/native_source_new_run_state.gd` | `apply_native_ossuary_grant_if_needed(owner, random_unit, now_ms, demo_mode)`: 장착/가방 보유 가드 → 기존 원본 포트 `drop_item_source.mk_item("ossuary",0,0,5)`를 실제 공유 World RNG로 실행(데모 금지 어픽스 풀 포함) → `id = Date.now()+Math.random()` → `INV.equipped.ossuary` 장착 | G45880-45884, G15962 |
| `godot/port_modules/kill_reward/drop_item_source.gd` | mkItem 끝의 유골함 고정 오버라이드(앞 롤의 RNG 소비는 그대로, 필드만 덮어씀·잔여 `_l*`/`_u*` 키 유지) | G16155-16165 |
| `godot/tests/test_pc_hud_stats.gd` + `pc_hud_stats_oracle.mjs` + `pc_hud_stats_web_fixture_20261022.json` | 신규 테스트(§5) | — |
| `godot/tests/capture_pc_hud_stats.gd` | 나란히 캡처 하니스(제품 코드 아님) | — |

새 수식·수치·표시는 없다. notify 토스트(G45885)·머리 위 아이템 이름 addTxt(G45886)는 표시라 영수증 `unported`로 남기고 Mac 요청(HS-M3)으로 넘긴다. 세이브 형식 변경 없음(유골함은 기존 `INV.equipped.ossuary` 키). docs/2_3 수정 없음. Mac 소유 파일 수정 없음(hud.gd·world_drops·map11 미변경).

## 4. 나란히 비교 (1x, 웹 왼쪽 · Godot 오른쪽)

| 격자 | 장면 | 판정 |
|---|---|---|
| `G:/exoduser-wt/_out/pc-hud-stats/compare_fixed_state.png` (+ `_hp_orb`·`_mp_sp_orb`·`_corner_cp`·`_top_right`) | 웹 덤프 주입 고정 상태 | **수치 같음**: HP 567/567=567/567, MP 267/416=267/416, SP(웹)·ST(Godot) 262/263=262/263, ◇1,676=◇1,676. **다름**: 지역 처치 0/32 vs 0/8(Mac 맵), 구슬 표시 모양(“생명력” 3줄·“ST” 글자·파란/노란 링 없음·글꼴 크기, H-01/H-02 Mac) |
| `G:/exoduser-wt/_out/pc-hud-stats/compare_natural_start.png` | 각자 신규 시작(유골함 이식 후) | 구조 같음: 양쪽 다 시작 직후 MP 현재값이 최대보다 낮고(웹 267/416, Godot 307/457) 회복 중. 숫자 자체는 장비 랜덤 롤이라 다름(정상) |

이식 전 Godot 자연 시작(cap0): MP 295/295·◇1,656·유골함 없음. 이식 후(cap1/cap2): 유골함 장착, MP 현재 < 최대(+150), 지급 RNG 43회.

## 5. 신규 테스트 `test_pc_hud_stats.gd` (헤드리스, 실제 Main)

| 그룹 | 내용 |
|---|---|
| A | G.on 이전 지급 없음 → 커튼 오픈 후 첫 프레임 지급, recalc_st·apply_stats committed, mmp +150, mhp·mst 불변, 현재 MP 충전 없음, HP 유지, 세션당 1회 |
| B | 같은 State 진입점을 스크립트 RNG 3세트(데모 2·비데모 1)로 실행 = 원본 `_grantOssuaryIfNeeded`/`mkItem`/`rollAffixes` VM 실행: 아이템 전 필드·RNG 소비 횟수 일치, 원본 호출 순서 notify→addTxt→recalcSt→applyStats |
| C | 지급 후 P = 원본 applyStats(기존 `pc_runtime_stat_refresh_oracle.mjs`) 13필드, 전투력 = 원본 calcCP(지급 전/후) |
| D | 웹 덤프 주입 → mhp·mmp·mst·mshield·baseAtk·baseDef·CP와 HUD 텍스트(HP/MP/오른쪽 구슬/◇)가 웹 화면 값과 같음 |
| E | 시작 장비 25개 홈 상태 관찰 기록만(보류 항목, 판정 제외) |
| F | 웹 1-1 map.json 소환굴 = 웹 G.spawnHoles 14개, 지역 분모 23/60/53/32·시작 32(현 MAP11 provider 값은 정보 기록만) |
| 가드 | 이미 장착·가방 보유·외부 owner 거절, RNG 소비 0 |

## 6. 회귀 (각 1회)

최종 코드(시작 장비 홈 변경 되돌린 상태)로 각 1회. 로그 `G:/exoduser-wt/_out/pc-hud-stats/logs/`. 기준 비교는 같은 커밋 ca9c7c30e 분리 worktree `G:/exoduser-wt/pc-hud-stats-base`(logs/base-*).

| 테스트 | 결과 | ERROR / SCRIPT ERROR | 비고 |
|---|---|---|---|
| test_pc_hud_stats (신규) | 68/0 | 0/0 | applyStats 13필드·grant 3세트 원본 일치 |
| test_pc_move_skills | 256/0 | 0/0 | |
| test_pc_recalc_st | 49/0 | 0/0 | |
| test_pc_runtime_stat_refresh | 290/0 | 0/0 | 단언 수는 시작 장비 홈 수(랜덤)만큼 변한다(이전 286) — 테스트 코드 변경 없음 |
| test_pc_pet_portrait_cache | 23/0 | 0/0 | |
| test_pc_player_life | 101/0 | 0/0 | |
| test_pc_combat_pack_b | 378/0 | 1/0 → 재실행 0/0 | 1회차 ERROR 1건은 dummy 렌더러 `texture_2d_initialize: Parameter "t" is null`(player.gd:933 프레임) — 재실행에서 재현 안 됨, 기준도 0 |
| test_pc_combat_pack_b_mac | 396/0 | 0/0 | 시작 장비 홈 변경 시 269+SCRIPT ERROR → 되돌림(§2) |
| test_pc_m29_parry | 101/0 | 0/0 | |
| test_pc_final_death | 61/0 | 0/0 | |
| test_pc_enemy_revive | 51/0 | 0/0 | |
| test_native_qe_binding | 155/0 | 0/0 | |
| p1002e / f / g | 94/0 · 358/0 · 221/0 | 0/0 | |
| **test_pc_followups_fieldboss** | **130/3 (2회 동일)** | 0/0 | **기준 167/0. 이 변경으로 생긴 실패 — §6-1** |
| test_pcib_mac_calls | 31/0 | 0/0 | |
| test_native_main_source_starter_state (추가) | 148/0 | 0/0 | |
| test_p2001c_kill_rewards (추가) | 25/1 | 0/0 | 기준도 25/1 동일(`live_kill_rewards eye_mass_01 available`) — 기존 실패 |
| test_demo11_29_workshop (추가) | 94/2 | 0/0 | 기준 97/2 동일 원인(oracle의 ESM `acorn` import — worktree에 node_modules 없음, junction 금지) — 기존 실패 |
| test_map11_chest / test_demo11_22r_equipment (추가) | 26/0 · 442/0 | 0/0 | |
| E2E `--demo11-storage=on` | PASS 11 / NR 7 / FAIL 0 | 0/0 | 같은 날 기준 worktree도 PASS 11 / NR 7(전투 처치·자동 물약 단계 NR). 지시서 기준 PASS13/NR5는 이번 환경에서 기준 커밋도 재현하지 못했다 |

### 6-1. 새 실패: 유골함 잔여 유니크 키가 미이식 hurtE 분기를 켬 (병합 보류 권고)

- 원본 mkItem은 유골함 롤 단계에서 붙은 `item[_us.stat]`(39종 중 무작위 1개)를 지우지 않고, `_uEq`(G16512)는 그 키를 그대로 읽는다(§2 원본 사실). 포트도 원본대로 남긴다.
- fieldboss 테스트는 `seed(20261021)` 고정이라 매번 같은 키 `_uMaceExplode`(처치 시 폭발, G42658)가 뽑힌다. PC hurtE는 이 분기가 미이식이라 fail-closed로 정지한다(`native_normal_enemy_hurte.gd:603-606` `unported_branch_active:_uMaceExplode`) → 자동 석궁이 적을 끝내 처치하지 못해 3건 실패.
- 실제 플레이에서도 같은 일이 무작위로 생긴다. PC 코드에서 이 경로로 정지하는 유니크 키: `_uMaceExplode`(처치마다), `_uAxeLeech`(출혈 적), `_uPoiseOrbFracture`(그로기), `_uBowPoisonRicochet`(화살), `_uDemonRekindle`(플레이어 생명) — 39종 중 5종(약 13%). 그 밖의 이동 스킬 등 미이식 거절 키는 전수 확인하지 않았다(미확인).
- 2_7 문서의 설계는 “전설/유니크 특수: 없음(null 고정)”이라, 원시 키가 남는 것은 웹 버그일 가능성이 높다(의도 여부 미확인).
- **권고**: 이 브랜치는 main 병합 보류(HOLD). 선택지 — (가) 웹 `mkItem` 유골함 오버라이드에서 잔여 `_l*`/`_u*` 키를 지우는 웹 수정(사용자 승인 필요) 후 포트도 같은 줄을 따른다, (나) 정지하는 유니크 분기 5종을 먼저 이식한다. 포트에서 원본에 없는 키 삭제는 하지 않았다.

## 7. Mac 요청

| ID | 내용 | 근거 |
|---|---|---|
| HS-M1 | 오른쪽 구슬 오른쪽 반 라벨 글자 “ST” → **“SP”**(값은 지금처럼 `P.st`/`P.mst` 유지). 웹 G2658 라벨 `SP`(#88dd88 .5rem), 값 G60304-60305 | hud.gd `_stamina_text` |
| HS-M2 | HP 구슬 “생명력 / 567 / / 567” 3줄 → 웹 `567` + `/ 567` 2줄(H-01 기존 행) | G2626-2628, G60271-60272 |
| HS-M3 | 유골함 지급 표시: `main.native_ossuary_grant_receipt.granted==true`일 때 notify `⚱️ 유니크 [전대의 유골함] 획득! 자동 장착!`(G45885, 문구는 원본 그대로 `_rarName(5)`·`_T`) + 플레이어 머리 위 addTxt `⚱️ 전대의 유골함` `#ff4466` 80f(G45886). PC는 데이터만 지급 | G45885-45886 |
| HS-M5 | 시작 장비 닫힌 0홈(G16148-16151) 이식 시 `test_pc_combat_pack_b_mac.gd`의 seeded MAP11 적 고정 데이터가 RNG 소비 위치(시작 장비 25회 감소)에 의존하는 문제를 함께 조정해 주거나, 조정 방식 승인. PC는 원본 수정 코드를 준비해 두었다(이 보고서 §2) | G16148-16151 |
| HS-M4 | PARITY-MAP-01 병합 후 MAP11 provider 소환굴이 웹 G.spawnHoles 14개(`build_native_placement(map.json)`)·시작 (4020,7420)와 같아 지역 처치 분모가 32인지 확인. 계산 함수는 PC 테스트 F로 일치 확인됨 | G60697-60718, G31030 |

## 8. 미확인 / 범위 밖

- 지역 처치 분모 32가 Mac 맵 브랜치 병합 후 실제 HUD에 뜨는지는 미검증(Mac 브랜치를 실행하지 않았다).
- 데모 저장 로드 경로(유골함 없는 구세이브)에서의 지급은 같은 훅을 타지만 로드 시나리오로 직접 실행해 보지는 않았다(E2E storage=on에 포함되는 범위만 확인).
- 웹 “MP 391” 캡처와 같은 경과 시간 비교는 하지 않았다(회복 속도 비교는 범위 밖).
- 실행 중인 사용자 창(integ10-play)은 건드리지 않았고, Git 반영만으로 열린 실행본이 바뀌지 않는다.
