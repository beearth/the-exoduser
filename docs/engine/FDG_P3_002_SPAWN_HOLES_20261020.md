# P3-002 — 1-1 소환굴(SPAWN_HOLE) 시스템·후속 스폰 Godot 이식 (2026-10-20)

담당: 클라우드 Claude 세션(브랜치 `claude/p3-002-spawn-holes`) · 검수/통합: PC 총괄 — **main 미통합**.
1차 레퍼런스: [2_6 소환굴+리프트시스템](../2_6%20소환굴+리프트시스템/2_6%20소환굴+리프트시스템.md) (이번에 1-1 수량 표기 정정·실측 배치 절 추가).
원본 실측 근거(Playwright, 현 리포 game.html + server.cjs): [evidence/p3-002/](evidence/p3-002/) — 프로브 스크립트 3종과 출력.

## 1. 원본 추적표

### 1-1 배치 (initStage → genFromTemplate §9)

| 단계 | 원본 행 | 내용 | Godot |
|---|---|---|---|
| 템플릿 | maps_data.js 41~51 / 9~22 / 36~39 | FIXED_MAPS[0] spawnHoles 9(S/M/L → size .3/.5/.8), rooms.spawns 7(size .3+grade×.25, room 1), corridorSpawns 2(size .3, room −1). objs는 player_start뿐(hole_* 0) | `TEMPLATE_*` 상수 |
| 1-1 보정 | game.html 30050 | `_cloneField11` si0: (70,170)→(74,168) | `CH1_SOUTHWEST_FIX` |
| tileRLE 배치 | 30486~30522 | 순서: tmpl.spawnHoles → objs hole_* → rooms.spawns → corridorSpawns, 각 500px(250000 제곱) 미만 거부. 캡 50(뒤에서 room −1 우선 제거) | `build_native_placement` |
| 최소 6 보장 | 30574~30582 | 6 미만이면 전투방 랜덤 보충(맵 생성 RNG) — **1-1은 14개라 미발동** | 미발동 확인, 발생 시 정직 정지(`min_holes_fill_requires_map_generation_rng`) |
| 유효성 검증 | 30583~30599 | 벽/범위 밖 → 나선(1..14) 바닥 이동, 실패 제거 / 주변 11×11 바닥(0) <30 제거 | 동일 포트(1-1: 이동·제거 0건) |
| path 보충 | 30600~30623 | `_pathImgTerrain`(si0 false 실측) | 미발동 |
| 분모 | 30625 | `G._totalSpawned = Σ _spawnHoleCount(size,si)` | state G 기록 |
| 등록 | 30681 | `G.spawnHoles = spawnHoles` | state G 기록(같은 배열) |
| timer 필드 | 30495 등 | `600+Math.random()*60` — 맵 생성 RNG(encounters.json 캡처 시작 이전 구간), **갱신 루프가 읽지 않음** | `null` 기록(재현 불가·소비자 없음) |

**실측 결과(원본 = Godot 일치)**: 14개, G._totalSpawned **168**, 시작점(4020,7420) 최근접 (3780,6220) d 1223.76.
맵 격자: Godot `data/map.json` tiles 해시 3930185914 = 원본 G.map 해시(동일 공식) — 배치 입력 동일.

| # | x | y | size | room | 소환 수 |
|---|---|---|---|---|---|
| 0 | 2980 | 6740 | .5 | 1 | 15 |
| 1 | 5620 | 6420 | .3 | 1 | 8 |
| 2 | 2220 | 5620 | .5 | 1 | 15 |
| 3 | 5620 | 5220 | .3 | 1 | 8 |
| 4 | 3220 | 4220 | .5 | 1 | 15 |
| 5 | 5220 | 3220 | .5 | 1 | 15 |
| 6 | 2420 | 2420 | .3 | 1 | 8 |
| 7 | 5620 | 1820 | .5 | 1 | 15 |
| 8 | 4020 | 1020 | .8 | 1 | 15 |
| 9 | 3780 | 6220 | .3 | 1 | 8 |
| 10 | 3060 | 3420 | .55 | 1 | 15 |
| 11 | 4820 | 1900 | .8 | 1 | 15 |
| 12 | 4020 | 5540 | .3 | −1 | 8 |
| 13 | 4020 | 4140 | .3 | −1 | 8 |

### 수량 함수 (31029~31030)

| 항목 | 값 |
|---|---|
| `SPAWN_HOLE` | name '소환굴', col `#aa4444`, cnt S50/M100/L100 |
| `_spawnHoleCount(size,si)` | size≤.3 S, ≤.5 M, 그 외 L / si0: `ceil(ceil(base×.5)×.3)` → **S8 / M15 / L15** / 그 외 base |

> 2_6 문서의 기존 1-1 표기(S25/M50/L50)는 ×.3 추가 이전 값이라 이번에 현행 코드로 정정했다.

### 갱신 루프 (update() 35636~35693)

| 단계 | 원본 행 | 규칙 |
|---|---|---|
| 게이트 | 32112 / 32113 / 32131 / 32137 | `if(!G.on)return` → 패링 레슨 tick 진행 중 return → `if(G.paused)return` → `_gameFrame++` |
| 시작 차단 | 35637 | `_gameFrame<120` 동안 트리거 차단 |
| 순회 | 35638 | `G.spawnHoles` 역순 |
| 트리거 | 35641~35650 | 미트리거 & d²>2000² → 스킵 / d²<2000² → `_triggered=true` 후 continue |
| 연출 | 35652~35653 | `_spawnDelay=90` → `-=sp`(0 초과 동안 continue) |
| 총량·간격 | 35656 | `_spawnTotal=_spawnHoleCount`, `_spawnInterval=~~(900/총량)` (S 112, M/L 60) |
| 대기 | 35657~35658 | `_spawnCD>0` 감소 / `G._aliveEns>=700` → `_spawnCD=30` (G._aliveEns: 34357 프레임 앞 집계) |
| 위치 | 35661~35673 | do-while 최대 30회: 각 `2π·u`, 반경 `120+u·300+size·150`, `isW(x,y,true)` / 실패 시 G.map 0 나선(1..19, 경계 1칸 제외) / 최종 중심 강제 |
| 생성 | 35674~35678 | `mkEn(x,y,G.stage,rollEtype(G.stage),false,undefined,h.room)` → null이면 `_spawned++;continue`(커브·완료 판정 생략) → `reviveIframes=15` → ens push → `_spawned++` |
| 간격 커브 | 35681~35685 | prog<.3: .6+prog·2.67 / <.7: 1.4−(prog−.3)·1.5 / 그 외 .8−(prog−.7)·1.67 → `_spawnCD=max(1,~~(interval·max(.2,curve)))` |
| 완료 | 35687~35692 | `addParts(h,col,15)` · `addTxt(h.x,h.y−20,'⚔ 소환굴!',col,50)` · `shake(5+~~(size·9))` · splice |
| 렌더 | 52616~52644 | `_gameFrame>120`일 때 void_black 시트(19350, 768² 9프레임 3열) 크기 150+size·150, 프레임 `~~((now+hi·500)/(180−~~(size·60)))%9`, α .7+sin(now/250+hi)·.15, 트리거 후 글로(α glow·.5, 크기×(1+glow·.4)), 'bold 10px monospace' 라벨 #aa4444 α.7 / 시트 미로드면 검은 원 α.4 |
| 미니맵 | 60216~60223 | `#aa4444` α.85, r=1.5+size·1.5, 검은 0.5 외곽선 (P2-002b hud.gd가 이미 G.spawnHoles를 읽음) |
| 사문 | 42733 | `e._fromHole` 감산 — 기록처 없음(사문). h.alive 0 유지 |

**원본 런타임 실측**(소환굴 (3780,6220) 단독, sp=1): 트리거 `_gameFrame` 120 → 소환 211/316/458/603/727/830/911/968 → 968 완료·제거.

### RNG 소비 순서 (공유 스트림)

소환 1마리당: 위치(각·반경)×시도 → rollEtype(30993: `ranged=u<.5`, `roll=u·total`) → mkEn(31120~):
rollElite(31063) → [매직이면 rollMods(31071) 1] → spd(31138) → r(31140) → 객체 리터럴:
st2 → facing → projT → bossPatT → [6: shieldAng·shieldBashCd·shieldBashT] → [7: summonCd·summonT·teleportCd·teleportT]
→ [8 bomb×2] → [9 revive×2] → [10 stealth×2] → [11 womb×2] → [13 web×2] → [14 swoop×2] → [16 trap×2] → [17 mother×2]
→ [19 slam×2] → [27 _iceSwoop×2] → [25 _iceSlime×2] → [28/29 _iceSlam×2] → [26 _iceBlizz×2] → **_bossOrbitAng(31260)**
→ [47: _stCloneCd·_stCloneT·_stTpCd] → **_erraticAng(31300)**.

원본 실측(고정 수열 Math.random 치환, etype 29종): 기본 9회, etype6 12·7 13·47 12·8/9/10/11/13/14/16/17/19/25/26/27/28/29 11, 매직 +1.
값 디코딩 대조 **0 불일치**(필드 위치까지 일치). rollEtype 고정 수열 7종 결과 일치. 요약: [evidence/p3-002/web_mken_rng_summary.json](evidence/p3-002/web_mken_rng_summary.json).

### 소환 적의 속성·소비자

| 항목 | 원본 | Godot |
|---|---|---|
| el | `undefined`(mkEn 인자) — elMul(a,undefined)=1, 탄 parry class 'magic'(40515), 색 ETYPE_COL | etype0: element "" · element_id −1 · el −1 (hurtE elMul 1 동치) |
| etype 분포 | 원거리 50%: 1,7,8,9,13,16,17,25,26 / 근접 50%: 0,3,4,5,6,10,11,12,14,15,18,19,20,21,23,24,27,28,29,47 | etype0만 전용 소비자(flesh crawler — 커튼 5링과 같은 스크립트) |
| etype≠0 (28종) | 각 전용 AI | **정직 정지**: RNG·`_spawned`는 원본대로 소비, 액터 없음, journal `unported_etype` |

etype0 확률 = .5 × 12/128 ≈ 4.7% → 1-1 전체 168 중 기대 ≈ 8마리만 실제 적. 나머지는 해당 etype 전용 스크립트 이식 대기.

## 2. 변경

| 파일 | 내용 |
|---|---|
| `godot/scripts/native_spawn_hole_system.gd` (신규) | 배치(정적 `build_native_placement`)·G 기록·갱신 루프(`advance_native`)·위치/rollEtype/mkEn RNG·etype0 실제 등록·reviveIframes 15 + 34456 감소(hurtE 북키핑 API)·완료(addParts 포트·addTxt·shake)·월드 렌더(void_black)·스냅샷. 하니스 부팅은 배치·G 기록만, 갱신 휴면(커튼 선례, `main.set_meta("native_spawn_holes","active")`로 가동) |
| `godot/scripts/world.gd` | `register_native_spawn_hole_enemy` 추가(커튼 등록과 같은 동적 경로 — encounters.json·factory 가드 무변경) |
| `godot/scripts/native_source_new_run_state.gd` | `apply_native_spawn_hole_g_writes`(owner 스크립트 경로 게이트: spawnHoles·_totalSpawned·shake만) |
| `godot/scripts/main.gd` | 부팅 1줄: 인트로 설치 직전 `install_native_boot` (원본 initStage 배치 → 인트로 순서) |
| `godot/scripts/hud.gd` | unported 문구 2개 제거(G._totalSpawned·G.spawnHoles 이제 기록됨) — 동작 무변경 |
| `godot/scripts/native_intro_curtain_sequence.gd` | **P2-001h RNG 정정**: 비보스 mkEn 무조건 소비 `_bossOrbitAng`·`_erraticAng` 2회 누락 → 추가(5링 7→9회/마리, 원본 실측 9) |
| `godot/tests/test_p2001h_curtain_spawn.gd` | 위 정정에 맞춰 기대 순서·횟수(5×9+매직) 갱신 |
| `godot/assets/vfx/vfx_void_black.png`(+.import) | 원본 `assets/vfx/boss/vfx_void_black.png` 바이트 복사(sha256 5c5ecaf9…a328 동일) |
| `godot/tests/test_p3002_spawn_holes.gd` (신규, `git add -f`) | 6그룹 296 검사 |
| `godot/tests/visual_p3002_capture.gd` (신규) | 실창(Xvfb) 캡처 하니스 — 출력 경로 환경변수 `P3002_OUT` |
| `docs/2_6 …/2_6 소환굴+리프트시스템.md` | 1-1 수량 정정(S8/M15/L15), 실측 배치 절 |
| `docs/engine/evidence/p3-002/` | 원본 프로브 3종 + 출력 |

## 3. 테스트 (Godot 4.7.2 공식 Linux 빌드, SHA512 대조 일치, `--headless`)

`godot/override.cfg`는 테스트별 격리 userdir로 쓰고 실행 후 비움(커밋 안 함).

| 테스트 | 결과 | 비고 |
|---|---|---|
| test_p3002_spawn_holes (신규) | **296 / 0** | placement 40 · dormant 3 · schedule_and_rng 211 · alive_cap 5 · full_run 22 · etype0_hurte 15 |
| test_p2001h_curtain_spawn | 124 / 0 | rng_calls 45 = 5×9 (정정 반영) |
| test_p2001i_boot_intro | 18 / 0 | |
| test_p1002f_dedicated_hurte | 381 / 0 | |
| test_p2002a_hud | 36 / 0 | 부팅 처치 표기 `0 / 168` |
| test_p2002b_minimap_corner | 16 / 0 | |
| test_p2001j_lesson_clock | 21 / 0 | |
| test_p2001k_lesson_practice | 32 / 0 | |
| test_contracts | 5 / 0 | |
| test_encounter_factory | 실패 3 (기준선과 동일) | 내 변경을 stash한 기준선에서도 같은 3건·같은 라벨(source count/only two real actors/registry only admitted) — 증가 없음 |

신규 테스트 관측(seed 20261020): 전체 168 소환 = 실제 etype0 액터 10 + unported 158, mkEn null 0, 나선/중심 폴백 0, 완료 14, 총 2454 draws.
S 소환굴 일정 211/316/458/603/727/830/911/968 = 원본 실측 일치, M 일정 211/258/316/385/464/545/620/690/753/811/863/908/946/978/1003(원문 공식 — 같은 공식이 S 실측을 재현).
etype0 소환 적이 플레이어 근접 공격으로 hurtE owner 경로(applied·ok, 쉴드/HP 감소) 피격 확인.
HUD 처치 표기 부팅 직후 `0 / 168`.

## 4. 남은 것 (정직 기록)

1. **etype≠0 소환 적 28종 액터** — 전용 스크립트 미이식. 지금은 RNG·카운트만 원본대로(정지 기록). 1-1 풀 상위 가중치: 47(16)·4(14)·6/0(12)·12(10)·20/24(8)·7(7).
   etype4/1/7은 Godot 스크립트가 있으나 원소·레코드 고정(ice/physical/lightning, type7 레코드 게이트)이라 el undefined 소환에 그대로 쓰면 원본과 달라 재사용하지 않았다.
2. etype0 소환 적의 **탄 parry class**: 원본 'magic'(el undefined, 40515) vs 전용 스크립트 physical 고정 — 적 스크립트 owner 소관.
3. etype0 스킨: `_assignMobSkin` 결과(_mob8Col/Row)는 기록하나 스크립트가 템플릿 base_rect 고정(커튼 5링과 같은 잔여).
4. reviveIframes 감소: 34456 1차만. 38590 updateE 2차 감소(화면 내 AI 갱신 적)는 미이식.
5. 렌더 순서: 원본은 MAP_OBJS 위·적 아래(52616) — Godot는 소품·적이 같은 y정렬 z대역이라 지면층 z −2001에 둠(나무 소품 아래로 가려질 수 있음). 라벨 글꼴은 원본대로 monospace bold 10px(SystemFont).
6. 갱신 순서: 원본은 적 루프·checkRooms 뒤 — Godot는 노드 물리 순서(소환 시스템이 World 자식으로 먼저 처리).
7. `_gameFrame`: Godot 쪽은 소환 시스템이 G.on·레슨·일시정지 게이트 통과 횟수로 자체 계수(원본 전역 카운터의 다른 소비자는 미연결).
8. 지역 시스템(`G._regions`, 60700~ 4지역 분모·필드보스) — Mac 작업 5 소관. HUD는 60322 폴백(_stageKills/_totalSpawned) 그대로.
9. **화면 검수(클라우드 1차)** — Xvfb 실창(gl_compatibility, 1920×1080)으로 Godot 캡처, 같은 장면(소환굴 (3780,6220), 플레이어 (3780,6560))을 원본 웹(Playwright 1920×1080)에서도 캡처해 나란히 대조:
   [cmp_hole_web_left_godot_right_2x.png](evidence/p3-002/cmp_hole_web_left_godot_right_2x.png) · 미니맵 [godot_minimap_holes_3x.png](evidence/p3-002/godot_minimap_holes_3x.png).
   시트·크기·라벨 위치(화면 y≈92)·글꼴 느낌 일치, 미니맵 #aa4444 점·검은 외곽선·L 크게 일치. **Godot가 전체적으로 어둡다**(구멍 평균 RGB 웹 82/49/117 vs Godot 46/33/68, 바닥 웹 52/49/56 vs 33/35/39) —
   바닥도 같은 비율로 어두워 P2-001g/P2-003a에 기록된 전역 톤 차(맵 렌더·조명 소관)와 같은 원인으로 판단, 소환굴 고유 차이는 아님. 웹 HUD는 지역 시스템이 있어 `0 / 53`(지역 분모), Godot는 폴백 `0 / 168`(지역 시스템 미이식, 8번).
   PC 실기(Forward+) 1x 최종 화면 검수는 총괄 몫.
10. P2-001g 문서의 "소환굴 12개"는 현 원본 실측 14개(HUD P2-002b 웹 실측 14건과 일치)로 이번에 정정했다.
