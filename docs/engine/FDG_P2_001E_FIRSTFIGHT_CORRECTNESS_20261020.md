# P2-001e — 웹 대조 결함 ①②⑤ 조사·수정 (2026-10-20)

P2-001d 대조표의 결함 추정 3건을 원본 행 단위로 재조사. **①②는 결함이 아니라 원본 일치로
판명(판정 정정)**, ⑤만 실결함으로 수정.

## ① 좌클릭 1요청 = 검기+평타 이중 히트 → **원본 동작 (수정 없음, 판정 정정)**
| 근거 행 | 내용 |
|---|---|
| 33053~33056 | `isAct('weapon')` → `P.s='wSwing'` 진입 + `activeLMBSk==='kiSlash'`면 `_fireKiSlashCrescent` **추가** 발사 |
| 33356~33363 | `wSwing` 상태 st2≤3 교차 시 `hitArc(...)` **무조건** 호출 — activeLMBSk 분기 없음 |
- P2-001d 웹 봇에서 평타가 안 보인 건: 봇 정지 거리 ~90px > 평타 판정 `wRange(51)+e.r(≈23)=74px` —
  **평타가 빗나간 것**. 당시 hp −108 이벤트는 유령불꽃(이리스) 펫 피해(사전 관측 108과 동일값)로 재귀속.
- E/F/G가 못 잡은 이유: activeLMBSk를 'weapon'/'kiSlash'로 **강제**해 단일 경로만 검증 — 자연
  기본값(mkP 29028 `activeLMBSk:'kiSlash'`) 경로 테스트를 신설(아래).

## ② 검기 피해 "웹 940 고정 vs Godot 1359~2234 변동" → **동일 공식·시작 무기 atk 롤 차 (수정 없음)**
- 웹 런타임 실측(web_inputs.json — 격리 프로필·저장차단·서버 무접촉):
  `meleeRef()=wp.atk+baseAtk15` (28770, 신규 STR/flat/lvB 0), `statStr()=1` (27993),
  `pAtkMul()=0.7` (28017 — 패시브 전부 0에서 0.7), `_skMul('kiSlash')=12.0` (44556 b),
  시작 무기 '녹슨 검' **atk=랜덤 롤** `max(1,~~(50·r²))` (15920~15922, tier0·rarity0·skew r²).
- 통합 검증 — 양판 모두 `~~((atk+15)×7×1×0.7×12)` 정확 일치:

| 판 | wp.atk | 검기 실측 | 공식값 | 평타 실측 | 평타 공식 `~~(~~((15+atk+15)×6)×0.7)+_atkBon` |
|---|---|---|---|---|---|
| 웹 (P2-001d r2/r3) | 1 | 940 | 940 | (빗나감) | — |
| 웹 (본 작업 실측) | 42 | 공식 3351 | 3351 | — | — |
| Godot (P2-001d r4) | 14 | 1705 | 1705 | 199 | 199 (_atkBon=15, kiSlash ST비용 10 — 31985) |
| Godot (P2-001d r3) | 23 | 2234 | 2234 | — | — |
| Godot (weapon 강제 r1) | 1/22/24 | — | — | 137/229\*/233 | 137(130+7)/…/233 — _atkBon=7(비용 5×1.5) |
| Godot (본 테스트) | 3 | 1058 | 1058 | 153 | 153 |

  \* r1 역산. P2-001d의 "웹 940 고정"은 웹 2회가 우연히 atk=1(확률 20%/회)을 뽑은 표본 편향.
- DR 없음도 양판 일치: 적용치=원시 공식값(웹 940=875흡수+65hp 전액, Godot journal
  absorbed+dmg_to_hp=base_damage). 눈알 육괴 계약(hp875·eShield875·attack31) 동일.

## ⑤ 시작 HP 미충전·악의구슬 0 → **실결함, 수정**
| 원본 | 내용 | 수정 |
|---|---|---|
| 63956 | 로컬 새 게임 `G.mats=_loadSharedMats()||1000` — 공유 저장소(48527, localStorage)는 미이식 → `0‖1000=1000` 경로 | `native_source_new_run_state.initialize_new_run`에서 `_g["mats"]=1000` |
| 64025→31567 | 새 게임은 `initStage(0)` 진입: `P.hp=P.mhp; P.st=P.mst; P.mp=P.mmp; P.shield=P.mshield` | authority `commit_native_stage_entry_refill`(hp/st=플레이어 노드·mp=_owned — level_up_heal 동일 소유 경로) + state `apply_native_stage_entry_refill`(쉴드=P dict, _p 미러) + main.gd 부팅 시퀀스에서 바인딩 직후 호출(거부=부팅 중단) |
- 31567의 나머지(상태 리셋·iframes 360 등)는 신규 부팅에선 초기값과 동일 — 스테이지 '전환' 시
  재호출 소비자는 미이식 목록. 세이브 형식 무변경.

## 변경 파일
`godot/scripts/native_source_resource_authority.gd`(+commit_native_stage_entry_refill) /
`godot/scripts/native_source_new_run_state.gd`(mats 1000, +apply_native_stage_entry_refill) /
`godot/scripts/main.gd`(부팅 refill 호출) / `godot/tests/test_p2001e_natural_lmb.gd`(신규).

## 검증 (원로그 scratchpad\p2-001e\logs\)
- 신규 test_p2001e_natural_lmb **18/0 PASS ×2회**: ① 자연 기본값 kiSlash/maliceSwipe·
  hp=mhp·st=mst·mp=mmp·shield=mshield·mats=1000 ② 1요청=kiSlash+weapon 정확 2히트,
  base_damage가 원본 공식과 정수 일치(atk3 → 검기 1058·평타 153). 검기 즉사 롤이면
  평타가 시체에 안 들어가므로 atk≤14 롤까지 재부팅 표본(≤8회, 실패확률 ~0.3%).
- 회귀 전부 PASS: p1002e/f/g·p2001a/b/c·contracts (기존 테스트 수정 불필요 —
  mats/hp 단정은 상대값이라 영향 없음).
- 웹 재대조: 위 통합 표 — 같은 시드 재현은 불가(RNG 엔진 상이)하나 공식 레벨에서
  정수 일치 확인. 웹 실측은 기존 Playwright 방식(서버 무접촉·격리 프로필·저장 차단).

## 추가 회귀 정합 (총괄 지적 — 초기화 계열 3종 기대값 정정)
- 원본 새 게임 실제 순서(행 근거): 로컬 경로 63956(G 할당) → 63987(defaultItems 장착) →
  64019 `applyStats()` → 64025 `initStage(G.stage)` → **31567 풀충전** — 즉 부팅 완료
  시점의 hp/mp/shield/st는 '초기화 마지막 소스 쓰기'가 아니라 31567 충전값이 원본.
  제품(refill)은 이 순서와 일치 → 테스트 기대값만 정정(약화 없음).
- test_native_main_source_player_initialization: readback 루프에서 hp/mp/shield를
  'cap(mhp/mmp/mshield) 일치 + 마지막 쓰기 ≤ cap'으로 — st 제외와 동일 논리,
  소유자 readback(같은 ref·같은 값 경로) 검증은 유지. **117/5 → 117/2(기준선, movement 2건 선재)**.
- test_native_main_source_starter_state: 고정 350 기준(hp==250/mp==160/st<200) →
  mhp−100/mmp/mst 상대 기대(의도: 공격=ST만 소모·MP 발명 없음·피해 100 정확 차감).
  **145/3 → 145/2(기준선 — base 7e892c7d4 실측으로 선재 2건 동일성 확인: _fireZones/hpR·resource_sink)**.
- test_native_source_player_regeneration_phase(fractional): 고정 '−2' 기대는 피해 하한
  `~~(max_hp×0.005)`(제품 기존 규칙)가 mhp≥600 롤에서 3이 되는 롤 의존 — 풀충전으로
  hp가 mhp 근처가 되며 상시 노출됐다. 기대 피해를 같은 하한 규칙으로 계산 + 소수 보존
  단정 추가. **88/1 → 88/0(기준선)**. lesson 30/0 유지.

