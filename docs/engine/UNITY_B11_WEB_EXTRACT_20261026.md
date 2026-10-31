# B11 퀵슬롯·물약·자동 사용 — 웹 원본 추출표

> **맥북 총괄 검수 (2026-10-26)**: 작성 = 단순작업4(Sonnet, 읽기·문서만). 원본 대조로 확인한 줄 — 자동 발동 조건 35897(`autoPotCd<=0&&P.hp>0&&G.mats>0&&P.mhp-P.hp>=_apHealAmt`, `OPT.autoPotThr` 미사용), 자동 쿨 35904(`Math.max(6,~~(_potCdBase*(1-_glPotCd-_bltPotCd-_regenPotCd)))` — 수동 경로 28231에만 있는 `_potCdAffix` 빠짐), HUD `#hpPotCd` 60309-60311(수동 `qsCooldown`만 읽음). 표 E의 웹 결함 후보(벨트 쿨감 어픽스 자동 경로 미적용, `autoPotThr` 오펀, 능력치 패널 쿨 표기 300f·캡 없음)는 **이식 범위에서 웹 동작 그대로**이며 웹 수정 여부는 별도 판단. 수치 JSON: `docs/engine/unity_b11/b11_web_values.json`.

- 추출 시점 HEAD: `1770c2698d67a72b5b6febcf0ebeedb4fa5061f2` (`G:/exoduser`, game.html 65,694줄). 줄 번호는 이 시점의 `game.html` 기준.
- 주의: 추출 시점 `game.html`은 **작업 트리에 타 세션의 미커밋 수정(`git status`에 ` M game.html`)이 있었다**. 줄 번호와 값은 그 작업 트리 파일 기준이며 HEAD 커밋 내용과 다를 수 있다(이번 추출에서 HEAD와 대조하지는 않음).
- 기준 규칙: docs와 코드가 다르면 **코드가 기준**. 추정은 "추정", 확인 못 한 것은 "미확인".
- 읽은 것: `game.html`(정의·함수·HUD·저장), `docs/2_8 퀵슬롯+물약시스템/2_8 퀵슬롯+물약시스템.md`, Unity `origin/claude/unity-pc-inventory-u04-20261026`(`6c8ed9d91`)의 `unity/Assets/Exoduser/Runtime/` (git grep만, worktree 없음).

## 0. 가장 중요한 사실 (이식 범위를 좌우함)

1. **수동 물약 퀵슬롯은 폐지됨**(docs 2026-10-10). 현행 물약 = **자동 물약만**. B11의 실질 범위는 "악의오브(G.mats)를 소모하는 자동 회복 + 대장간 물약 강화 + 쿨다운 감소 장비/패시브 + 구세이브 `qslots` 호환"이다.
2. `QSLOTS`/`qsCooldown`/`qsAuto`/`useQuickslot`/`_qsSwapSel`은 **살아 있는 코드지만 게임플레이에 영향이 없는 잔재**: `useQuickslot` 본편 호출 0(L28204 정의 외 호출 없음), `updateQS`의 물약 분기는 `const s={type:null,count:0}`(L28271)로 도달 불가, HUD `#hpPotCd`는 영영 비어 있음(아래 표 D).
3. **자동 물약 쿨다운은 화면에 표시되지 않는다**(`autoPotCd`는 HUD 코드에서 읽히지 않음). 피드백은 SFX + 떠오르는 텍스트뿐.
4. 임계 `OPT.autoPotThr`는 **미배선 오펀**(설정 UI만 있고 런타임 소비 0). 실제 발동 조건은 "부족 HP ≥ 회복량".
5. 물약 자원은 `G.mats`("악의오브"). 메인 세이브에는 `mats:0`을 쓰고 별도 **공유 저장소**(localStorage `_SHARED_MATS_KEY` + 서버 `/api/mats`)로 영속화한다.

## 표 A. 정의·수치

| # | 이름 | 상수·변수 | 값 | game.html 줄 | 설명 |
|---|---|---|---|---|---|
| A1 | 물약 정의 | `const POT` | `{hp:{name:'악의오브 추출',emoji:'👿',col:'#33cc66',colG:'#66ff99',base:100,per:20,desc:'악의오브를 소모해 지옥의 힘으로 회복합니다 (+100 HP)'}}` — **hp 1종만** | 27679-27681 | `base`/`per`는 코드에서 읽는 곳 미확인(회복량은 `potHeal`이 계산). `st`/`mp`는 정의 없음 |
| A2 | 퀵슬롯 초기값 | `let QSLOTS` | `[{type:'hp',count:1},{type:null,count:0}×3]` (길이 4) | 27682 | 구세이브 호환·updateHUD 쿨 표시용 잔재. 게임 시작/리셋마다 같은 값으로 재대입(61946=count 5 데모, 62121, 62359, 62471, 63951, 64100) |
| A3 | 스킬 슬롯 | `SKILL_SLOTS` | `[null×6]` (1~4, SP, F) | 27683 | 숫자 1~4가 이제 스킬 전용. 물약과 무관하지만 같은 DOM(`#qs0~3,#qs5`)을 쓴다 |
| A4 | 필살기 슬롯 | `ULT_SLOT` | `null` (R키) | 27684 | `#ultSlot` |
| A5 | 슬롯별 쿨다운(수동) | `qsCooldown` | `[0,0,0,0]` (프레임) | 27685 | **쓰는 곳 = useQuickslot(호출 0)뿐**. 매 프레임 감소 루프만 살아 있음(35889) |
| A6 | 자동 물약 쿨다운 | `autoPotCd` | `0` (프레임) | 27686 | 주석은 "5s = 300f"이나 **실제 기준은 420f**(35900). 표시 안 됨 |
| A7 | 슬롯별 자동 토글 | `qsAuto` | `[true,true,true,true]` | 27687 | 폐지된 UI용. 현행 읽는 곳은 `updateQS`의 도달 불가 분기뿐. **저장 안 함** |
| A8 | 스왑 선택 | `_qsSwapSel` | `-1` | 27688 | 폐지 UI 잔재 |
| A9 | 물약 강화 레벨 | `let POT_LV` | `{hp:0}` (0~10) | 28073 | 저장 `potLv` |
| A10 | 회복량 공식 | `potHeal(type)` | `lv<=0?100 : lv===1?150 : lv*100` → 0강100,1강150,2강200,3강300,…,10강1000 | 28074 | 순수 함수 |
| A11 | 회복량 증폭 | `_eqAffix('potionPower')` | 어픽스 `potionPower` tiers `[.12,.20,.35,.55,.75]`, 슬롯 `pants`, group `pot`, weight 60 | 14468 | `_eqAffix`는 장착 장비 어픽스 값 합산 캐시(27971-27973) |
| A12 | 실제 회복량 | `~~(potHeal('hp')*(1+_eqAffix('potionPower')))` | 정수화(비트 NOT 2회) | 35896, 35905 (수동 28234) | 트리거 임계값(A15)과 실제 회복값에 같은 식 |
| A13 | 자동 쿨 기준 | `_potCdBase` | `420` 프레임(7초) | 35900 (수동 28226) | |
| A14 | 자동 쿨 감소 항 | `_glPotCd`, `_bltPotCd`, `_regenPotCd` | `min(+gl().potCd‖0, 0.2)`, `min(+blt().potCd‖0, 0.2)`, `min(PASSIVES.pRegen*0.03, 0.3)` | 35901-35903 | 장갑·벨트 각각 최대 20%, 회복력 최대 30%. `potionCdRed` 어픽스(A18)는 **자동 쿨에 적용 안 됨**(수동 28230에만) |
| A15 | 최종 쿨다운 | `autoPotCd=` | `Math.max(6, ~~(420*(1-_glPotCd-_bltPotCd-_regenPotCd)))` | 35904 | 최소 6f(0.1초). 이론 최대 감소 70% |
| A16 | 장갑 potCd 롤 | `item.potCd`(gloves) | `[.05,.10,.15,.20,.30][rarity] × (0.9~1.1 균등)`, 소수 3자리 | 16043-16044 | 사용 시 상한 0.2로 캡 |
| A17 | 벨트 potCd 롤 | `item.potCd`(belt) | `[.03,.06,.10,.15,.22][rarity] × (0.9~1.1)`, 소수 3자리 | 16052-16053 | 사용 시 상한 0.2로 캡 |
| A18 | 벨트 어픽스(쿨감) | `potionCdRed` | tiers `[-.04,-.07,-.11,-.16,-.22]`(음수 값), 슬롯 `belt`, group `ptCd`, weight 55 | 14680 | 값이 **음수**인데 수동 `Math.min(_eqAffix('potionCdRed'),.2)`에 쓰임(부호 처리 미확인) → 자동 경로 미사용이라 사실상 효과 없음(추정) |
| A19 | 회복력 패시브 | `PASSIVES.pRegen` | max 10, "물약쿨 -3%/lv (최대30%)" | 27708 | |
| A20 | 전설 벨트 버프 | `_lEq('_lBeltBuff')` | `val 0.15`: 물약 사용 시 5초(`P._lBeltT=300`f) 피해 +15% | 15056, 35910 | 타이머 감소 32732, 피해 적용 42228 |
| A21 | 트리거 조건 | 인라인 | `!window._parryLesson?.active && autoPotCd<=0 && P.hp>0 && G.mats>0 && P.mhp-P.hp >= _apHealAmt` | 35897 | HP% 임계 아님 |
| A22 | 소모 | 인라인 | `G.mats--` (악의오브 1) | 35899 | 회복량·강화와 무관하게 항상 1 |
| A23 | 강화 비용 | `_malCost((lv+1)*5)` | `Math.max(1,Math.ceil(n*0.5))`, `_MALICE_COST_MUL=0.5` → lv0→3, lv1→5, lv2→8, lv3→10, lv4→13, lv5→15, lv6→18, lv7→20, lv8→23, lv9→25 | 50698, 28082-28087 | **docs의 (lv+1)×5(5…50)와 다름**(표 E) |
| A24 | 강화 레벨 제한 | `reqLv=(lv+1)*100`, `lvOk=P.lv>=reqLv` | 1단 Lv100 … 10단 Lv1000, 최대 10단(`lv>=10` MAX) | 50697-50700 | |
| A25 | 강화 UI 대상 | 물약 탭 항목 | `[{type:'hp',n:'❤️‍🔥 HP 물약',col:'#cc2200'}]` | 50696 | |
| A26 | 설정(오펀) | `OPT.autoPotThr` | 기본 `0.99`, 슬라이더 `#optAutoPot` min30 max99 step1, 표시 `HP n% 이하` | 6311, 2818, 49041, 49340 | **런타임 소비 0** |
| A27 | 키(숫자 슬롯) | `Digit1~4` | 스킬 슬롯 디스패치만. 물약 동작 없음 | 13262-13267 | BINDS(6188~)에서 슬롯 키는 고정 키(Digit1~5 표기 6305), 게임패드 LT+ABXY→Digit1~4 매핑(28543-28548, 13964) |
| A28 | 패링 연습 중 차단 | `window._parryLesson?.active` | 활성이면 발동 안 함 | 35897 | |
| A29 | 시스템 튜토리얼 통지 | `window._systemLesson.recovered(before,{hp,mats,cooldown})` | 활성 시 before={hp,mats} 기록 후 회복 뒤 호출 | 35898, 35907 | 시스템 안내 연동 |
| A30 | 통계 | `G._pStats._hC++`, `G._sStats.potions++` | 사용 1회당 +1 | 35912 | 스테이지 클리어 요약 "물약 N회"로 노출(Unity에 같은 필드 있음, 표 F) |
| A31 | 악의오브 최대/저장 키 | `_SHARED_MATS_KEY`, `/api/mats` | localStorage + 서버 POST, 3초 디바운스(`_matsDirty`) | 48529-48538 | 값 정의(키 문자열)는 미확인 |
| A32 | 킬 드랍 | 인라인 | `Math.random()<(e.ib?1:1)` → 항상 `ptypes=['hp','st','mp']` 중 균등 1종, `cnt=e.ib?2:1` | 43094-43097 | hp면 악의오브 +cnt, st/mp는 `addPotion`이 false(받지 않음) → **킬당 악의오브 +cnt가 나올 확률 1/3** |
| A33 | 킬 보너스 | 인라인 | `e.ib && Math.random()<.5` → `addPotion('hp',1)` | 43099 | `ib`는 보스 계열 플래그(추정; 24394·24540에서 ib:true 생성) |
| A34 | 상자/파괴물 | 인라인 | breakable loot `'potion'`→ hp +1(32843), 보물상자 → hp +2(32878, 추가로 악의 `5+~~(stage*2)` 32877), 중형 이상 상자 40% → hp +1(32909, `_dt>=1`) | 32843, 32877-32878, 32909 | |
| A35 | 월드 물약 아이템 | `it.type==='potion'`, `it.potType`, `it.potCount` | 줍기 핸들러만 존재(32953, 32978, 펫 41466), 렌더 52564-52571(`POT[it.potType].col`) | | **생성(spawn) 지점은 grep으로 못 찾음 = 미확인**(docs는 "바닥 드랍 X"). 사실상 비어 있음(추정) |
| A36 | 월드 드랍 색 | `POT.hp.col`/`colG` | `#33cc66`/`#66ff99` | 27680 | docs: 전투 중 구별 위해 녹색 유지 |

## 표 B. 함수

| 함수 | 줄 | 입력 | 출력·부작용 | 호출하는 곳 |
|---|---|---|---|---|
| `potHeal(type)` | 28074 | `'hp'` | 회복량 정수(100/150/n×100) | 35896, 35905, 28234, 50701-50702 |
| `_eqAffix(id)` / `_eqAffixRebuild()` | 27973 / 27972 | 어픽스 id | 장착 장비 `affixes[].value` 합(캐시) | 35896, 35905, 28230, 28234, 51393계열 |
| `_malCost(v)` | 28083 | 비용 원값 | `max(1,ceil(v×0.5))`, `v<=0`이면 0 | 50698 등 다수 |
| `gl()` / `blt()` | 16506 / 16508 | — | `INV.equipped.gloves/belt` 또는 `{}` | 35901-35902, 28227-28228, 51393 |
| **update()** 내 자동 물약 블록 | update 32110~, 블록 35894-35913 | 프레임 시간 `sp` | `autoPotCd-=sp`; 조건 충족 시 `G.mats--`, 쿨다운 설정, `P.hp` 회복(상한 `P.mhp`), SFX, 텍스트 `👿 악의오브 추출: +v HP`(`#33ff33`, 40), 통계 +1, 벨트 버프, 튜토리얼 통지 | 매 프레임 update 루프(별도 호출 없음) |
| update() 내 퀵슬롯 쿨다운 감소 | 35888-35889 | `sp` | `qsCooldown[i]-=sp`, 0 이하면 0 + `updateQS()` | update 루프 (감소 대상이 항상 0이라 사실상 무동작) |
| `useQuickslot(idx)` | 28204-28245 | 0~3 | 폐지된 수동 마시기: 악의오브 소모/HP 회복/쿨다운 설정/플래시. HP 99% 이상이면 `showPH('HP 99% 이상!')` | **호출 0**(본편). 정의만 있음 |
| `addPotion(type,count)` | 28252-28268 | 종류, 수량(기본 1) | `'hp'`면 `G.mats+=count`, `SFX.pickup()`, 텍스트 `+count`(`#cc66ff`,25), true. `POT`에 없으면 false(조용히 버림). 그 외는 슬롯 적재 로직(도달 불가: POT에 hp뿐) | 킬 43097·43099, 상자 32878·32909, 파괴물 32843, 줍기 32953·32978, 펫 41466 |
| `_requestQSRefresh()` | 28247-28251 | — | rAF로 `updateQS()` 1회 합치기 | `addPotion` 슬롯 경로(도달 불가) |
| `updateQS()` | 28269-28360 | — | `#qs0~5` 갱신: 스킬 우선, 물약 분기 도달 불가(`s` 상수 빈 값), 이후 `_updateSkCdHud`, `_updateUltSlot`, `_updateActionKeys` | update 루프 35889/35892, 다수 |
| `renderForge()` 물약 탭 | 50692-50709 | `G.forgeTab==='potion'` | 강화 카드 1개(비용·레벨 게이트·회복량 현재→다음) | 대장간 열기·강화 후 |
| `_fgSelect(name,desc,cost,fn)` | 50463-50465 | | `_forgeSel` 저장 후 재렌더 | 50707 |
| `_fgCraft(e)` | 50466-50476~ | 클릭 이벤트 | **Shift/Ctrl이면 최대 10회 반복**; 각 회 `G.mats<cost`이면 중단, `fn()` 실행(= `POT_LV++; G.mats-=cost`). 비용·레벨 게이트는 **첫 선택 시점 값으로 고정되어 반복 중 재검사 안 함**(추정: 의도 여부 미확인). 종료 시 `dbSaveNow()` | 대장간 "강화" 버튼(위치 미확인) |
| `dbSave`(직렬화) | 3554, 3561 | | `qslots:QSLOTS`, `potLv:{...POT_LV}` 저장 | 세이브(3548 근처 함수; 데모/테스트 변형 62006, 62143, 63916, 64073) |
| `dbRestore`(복원) | 3717-3719, 3729, 3769 | 세이브 `d` | `QSLOTS=Array.from({length:Math.max(4,len)},…)`(원소: 객체면 `type`이 POT에 없을 때만 빈 칸, null/배열/원시는 빈 칸). `G.mats=_loadSharedMats()`, `POT_LV[k]=d.potLv[k]`(POT에 있는 키만) | 로드 |
| `_loadSharedMats/_saveSharedMats/_matsDirty` | 48529-48538 | | 악의오브 공유 저장(localStorage + 서버) | 로드/변경 시 |
| `updateHUD(slow)` 물약 CD 텍스트 | 60309-60311 | | `QSLOTS[0..3]` 중 `type==='hp'`이고 `qsCooldown[i]>0`이면 `'POT '+(cd/60).toFixed(1)+'s'` → `E.hpPotCd` | 매 HUD 갱신(35885-35886). **qsCooldown이 항상 0이라 빈 문자열** |

## 표 C. 상태 흐름

| 단계 | 현행 동작 | 근거 줄 |
|---|---|---|
| 1 획득 | 물약 획득 = `addPotion('hp',n)` → **즉시 악의오브 `G.mats += n`로 전환**(퀵슬롯 적재 없음). 킬 1/3 확률 +1(보스 +2), 보스 50% 추가 +1, 상자 +2/+1, 파괴물 +1. 줍기 가능 월드 아이템 spawn은 미확인 | 28252-28260, 43094-43099, 32843, 32878, 32909 |
| 2 슬롯 배정 | **없음**(폐지). `QSLOTS`는 `hp count 1`로 시작하지만 사용·표시되지 않음. 빈 칸 클릭 = 스킬 배정 팝업 | 27682, 28624-28627, docs 2_8 §2026-10-10 |
| 3a 수동 사용 | **없음**(`useQuickslot` 호출 0, Digit1~4는 스킬만) | 13264-13266 |
| 3b 자동 사용 | 매 프레임: `autoPotCd` 감소 → (패링 연습 아님 ∧ 쿨 0 ∧ HP>0 ∧ 악의오브>0 ∧ 부족HP ≥ 회복량)이면 악의오브 1 소모, HP 회복, 쿨다운 재설정 | 35894-35913 |
| 4 쿨다운 | `autoPotCd = max(6, ~~(420×(1−장갑−벨트−회복력)))`, 매 프레임 `sp`만큼 감소. 표시 없음 | 35895, 35904 |
| 5 HUD 갱신 | 사용 시점에만 떠오르는 텍스트 `👿 악의오브 추출: +v HP`(녹색), SFX.potion. 악의오브 수치는 HUD/인벤 `악의오브: N`에 표시. `#hpPotCd`는 비어 있음 | 35908-35911, 60310-60311, 50170 |
| 6 저장 | `qslots`(구호환), `potLv`는 메인 세이브. 악의는 메인 세이브에 0, **공유 저장소**로 별도. `qsAuto`·`qsCooldown`·`autoPotCd`는 저장 안 함(새 게임/리셋 시 0·초기값) | 3554-3561, 3729, 48529, 61947 |
| 강화 | 대장간 물약 탭: Lv.(lv+1)×100 필요, 악의오브 `_malCost((lv+1)*5)` 소모, `POT_LV++`, 최대 10 | 50692-50709 |

## 표 D. HUD·UI

| 요소 | DOM id | CSS·줄 | 표시 규칙 |
|---|---|---|---|
| 슬롯 행 | `#qsRow` (`.qs-row`) | HTML 2592-2598, CSS 321(절대 배치), 687 | 안에 `#qs0 #qs1 #qs2 #qs3 #qs5 #ultSlot` (각 `<span class="qs-cnt">`) |
| 슬롯 위치 | `#qs0` left128 / `#qs1` 173 / `#qs2` 217 / `#qs3` 261 / `#qs5` 303 / `#ultSlot` 347 (px, top70, 37×45) | 711-717 | 스킬바 통이미지 격자 위에 얹음. 슬롯 프레임 CSS는 로컬 장식(974-980, 2286-2300 반응형) |
| 슬롯 공통 | `.qs` | 688-703, 711, 974-980 | 투명 배경+붉은 테두리 11px 라운드(974-980) |
| 빈 슬롯 | `.qs.empty` | 770 | `opacity .3; filter:grayscale(1)` — 포션 폐지 후 스킬 없는 칸 표시 |
| 쿨다운 덮개 | `.qs.cd::before` | 771-777, 992 | `inset:0` 반투명 검정(최종 `rgba(8,7,8,.72)`). 스킬 쿨은 별도 `._skCd` 덮개(28326-28330) |
| 개수 숫자 | `.qs .qs-cnt` | 753-760, 988-991 | 우하단, `#ffd48a` 계열, 폰트 .9rem. 물약 개수 표시는 도달 불가(28352) |
| 자동 ON 테두리 | `.qs.auto-on` / `.qs .qs-auto` | 769 / 752, 761-768 | 폐지됨(`.qs-auto`는 `display:none`) |
| 사용 플래시 | `.qs-flash` + `@keyframes qsFlash` | 778-782 | `useQuickslot`에서만 부착(28243) → 현행 미사용 |
| 스왑 선택 | `.swap-sel` | (CSS 줄 미확인) | `_qsSwapSel` 폐지 잔재 |
| 드롭 호버 | `.qs.sk-drop-hover` | 796 | 스킬 드래그 앤 드롭용 |
| 물약 쿨 텍스트 | `#hpPotCd` | HTML 2630 (`top:-45px; font .9rem; color #ff8844`) | 갱신 60311 — **항상 빈 문자열** |
| 설정 슬라이더 | `#optAutoPot`, `#optAutoPotVal` | HTML 2818 | `HP n% 이하`, 오펀(동작 영향 없음) |
| 장비 툴팁 | — | 49791 | `potCd` 있으면 `물약속도: -N% 쿨다운` |
| 스탯 패널 | — | 51393 | `물약쿨: (max(6,~~(300×(1−장갑−벨트−회복력))))/60 초 | 회복+: potionPower` — **기준 300f, 캡·420과 불일치**(표 E) |
| 대장간 물약 탭 | `.fg-i`, `.fg-in`, `.fg-id`, `.fg-ic` | 50704-50707 | 이름 `Lv.N`, `회복량 cur → next`, `악의오브 cost`, `⚠ Lv.X 필요`, MAX면 "최대 강화" |

## 표 E. docs ↔ 코드 차이

| # | docs(2_8) | 코드(기준) | 중요도 |
|---|---|---|---|
| E1 | 강화 비용 `(lv+1)×5` (5,10,…,50) | `_malCost((lv+1)*5)` = **절반 올림**(3,5,8,10,13,15,18,20,23,25), `_MALICE_COST_MUL=0.5` (28082, 50698) | **높음** |
| E2 | 자동 쿨 기준 420f, 최종식 `max(6,~~(420(1-…)))` | 일치(35900-35904). 단 L27686 주석은 "5s=300f" 불일치 | 낮음(주석) |
| E3 | docs "쿨다운: 장갑/벨트/회복력 패시브로 감소" | 일치. 단 **벨트 `potionCdRed` 어픽스는 자동 쿨에 미적용**(수동 경로만) → 어픽스가 실질 무효(추정) | **높음**(어픽스 이식 시 판단 필요) |
| E4 | docs "스탯 패널" 언급 없음 | 51393은 쿨 기준 **300f**, 캡 없음, `1-(합)` → 표시값과 실제 쿨(420f, 캡 0.2/0.2/0.3)이 다름 | 중간(표시 버그) |
| E5 | `OPT.autoPotThr`는 오펀(미배선) | 코드도 동일(3곳만 참조). 슬라이더 max99/step1 정합은 반영됨 | 일치 |
| E6 | docs "드롭: HP 물약 = 즉시 악의오브 전환, st/mp는 addPotion이 받지 않음" | 일치(28254-28261). 킬 드랍은 3종 균등 → **2/3 확률로 아무것도 안 줌** | 중간(밸런스 영향 큼, 이식 시 유지) |
| E7 | docs 상단 표 "st/mp 미구현" | 코드 `POT`에 hp만. 그런데 킬 드랍 코드는 `['hp','st','mp']`를 뽑음(43095) | 중간 |
| E8 | docs "퀵슬롯 5개+필살기+고정 7개 / 좌클릭 사용 / 우클릭 자동 토글 / 드래그 스왑" | 이 절은 docs 스스로 "폐지 전 이력" 표기. 현행: 슬롯은 스킬 전용, 1~4 키는 스킬 디스패치 | 일치(이력) |
| E9 | docs "L팝업 해제 문구 슬롯 비우기" 등 UI 문구 | (이번 추출 범위 밖, 미확인) | — |
| E10 | docs "`useQuickslot` 시그니처·`QSLOTS` 구조·`POT` 객체는 수정 금지" | 코드는 그대로 유지(잔재). Unity 이식 시 이 잔재는 구세이브 호환 외에는 불필요 | 정책 |
| E11 | 자동 물약 발동은 패링 연습 중 비발동, 튜토리얼 통지 | 일치(35897, 35907) | 일치 |
| E12 | docs "물약 강화: 레벨 요구 (lv+1)×100, 회복량 100/150/200…" | 일치(50699, 28074) | 일치 |
| E13 | `_fgCraft` Shift/Ctrl 10회 반복은 docs에 없음 | 코드는 반복 구매 시 비용 고정·게이트 미재검사 | 중간(추정 버그 가능) |

## 표 F. Unity 현재 상태 (`origin/claude/unity-pc-inventory-u04-20261026` @ `6c8ed9d91`, 읽기 전용 git grep)

| 항목 | 상태 | 근거(파일:줄) |
|---|---|---|
| 악의오브 자원 | **있음**: `Simulation.Materials`(int). 킬 시 `+4`(웹은 몬스터별·스테이지별 다양, 단순화) | `Runtime/Core/Simulation.cs:23, 245`; 표시 `NativeGame.cs:267`, `NativeInventoryDock.cs:111-112`, `NativeForgePanel.cs:138` |
| 킬 물약 드랍 | **일부·불일치**: `PotionHp/PotionStamina/PotionMana` 카운터를 균등 1/3로 증가(`int potion=(int)(NextRandom()*3)`). **웹은 hp가 악의오브로 즉시 전환(+악의오브 cnt), st/mp는 버림** — Unity는 카운터에 적립만 하고 소비처 없음 | `Core/Simulation.cs:24, 246-248` |
| 자동 물약 사용 | **없음 = 미이식**: 회복 로직·`autoPotCd`·쿨다운·악의오브 소모 없음(`Player.Hp` 회복은 틱 리젠 97, 301의 `MaxHp*.2` 다른 용도뿐) | `Core/Simulation.cs:97, 301` |
| 물약 강화 레벨 `POT_LV`/`potHeal` | **없음 = 미이식**: 대장간 물약 탭은 형태만, 값은 "미이식" 문자열 | `NativeForgePanel.Tabs.cs:96-107`, `NativeForgePanel.cs:12-13, 209`, `NativeForgeData.cs:14` |
| 쿨다운 감소 장비(`potCd`) | **일부**: 장비 필드·비교 UI는 있음(`물약 쿨감`/`물약속도`). 실제 쿨 계산에 쓰는 곳 없음 | `Core/InventoryComparison.cs:51`, `Core/InventoryData.cs:11`, `NativeInventoryComparison.cs:115` |
| `potionPower`/`potionCdRed` 어픽스 | **미확인**(어픽스 정의 테이블 검색 안 함) | — |
| 스테이지 클리어 "물약 N회" | **있음(UI)**: 필드 `potions`. 값 공급원은 미확인(자동 물약 미이식이라 0일 가능성, 추정) | `NativeStageClearOverlay.cs:15, 22, 241, 254`, `...Capture.cs:41` |
| 튜토리얼 문구 | **있음·내용 불일치**: "물약은 설정한 HP% 이하 시 자동 사용" — 웹 실제 규칙은 "부족 HP ≥ 회복량"(웹도 이 UI 문구는 설정 슬라이더로 오해시키는 오펀) | `NativeLobby.StartupPresentation.cs:172` |
| `QSLOTS`/`qsAuto` 구세이브 호환 | **없음**(Unity 세이브가 웹 세이브를 읽는지는 별도 사안, 미확인) | — |
| HUD 슬롯 DOM 대응 | 이번 grep에서 `Quickslot/Qslot` 심볼 없음 = 미이식(스킬 슬롯은 별 파일, 미확인) | — |
| 시스템 튜토리얼 통지 | **없음**(웹 `_systemLesson.recovered` 대응 미발견) | — |

## 표 G. 이식 시 소유 추정

| 구분 | 내용 | 소유(추정) |
|---|---|---|
| **순수 상태(Core, PC 가능)** | `potHeal`(100/150/n×100), 회복량 증폭(`potionPower`), 쿨 계산식(420f, 장갑·벨트·회복력 캡), 자동 사용 조건(`!연습 ∧ 쿨0 ∧ HP>0 ∧ 악의오브>0 ∧ 부족HP≥회복량`), 악의오브 소모 1, HP 클램프, `POT_LV`(0~10)·강화 비용 `_malCost((lv+1)*5)`·레벨 게이트 `(lv+1)*100`, 킬/상자/파괴물 드랍 규칙(`addPotion('hp')`→악의오브), 벨트 버프 15%·5초(300f), 통계 `potions` 카운터, 세이브 `potLv`·`qslots`(구호환 파서) | PC(Core) |
| **HUD 표시(NativeHud = Codex, patch)** | 자동 물약 사용 시 떠오르는 텍스트 `👿 악의오브 추출: +v HP`(`#33ff33`)와 효과 파티클(`addParts` 8, `POT.hp.col`); 악의오브 수치 표시(이미 일부); `#hpPotCd`(웹은 항상 빈 문자열이므로 **이식 불필요, 결정 필요**); 스탯 패널 물약쿨 줄(웹은 300f 기준 불일치 — 이식 시 기준 결정 필요); 대장간 물약 탭의 값/버튼 활성화 | Codex(patch) |
| **입력(NativeGame = Codex, patch)** | 없음(수동 사용 폐지). 대장간 "강화" 클릭·Shift/Ctrl 10회 반복(`_fgCraft`)과 슬롯 클릭(스킬 배정)은 다른 단위 | Codex(patch, 대장간) |
| **결정 필요** | ① 어픽스 `potionCdRed`를 자동 쿨에 적용할지(웹은 미적용) ② 킬당 "1/3만 악의오브 지급" 규칙 유지 ③ 스탯 패널 쿨 표시 기준(300 vs 420) ④ `_fgCraft` 반복 시 비용 재검사 | 총괄 결정 |

## 이식 시 Codex patch가 필요한 지점 (요약)

1. 킬 시 물약 드랍: `Simulation.KillEnemy`가 `PotionHp/Stamina/Mana`를 올리는 대신 웹 규칙(hp→악의오브 +cnt, st/mp 폐기, 보스 cnt=2·+50% 추가)으로 교체.
2. 자동 물약 블록 신설(`Simulation.Tick`): 악의 `Materials`, `Player.Hp/MaxHp`, 쿨다운 상태 추가 + 시스템 튜토리얼 통지.
3. 대장간 물약 탭(`NativeForgePanel.Tabs.cs DrawPotion`): "미이식" 자리표시를 `POT_LV`·비용·레벨 게이트 값으로 교체하고 강화 실행 연결.
4. HUD: 자동 물약 사용 시 플로팅 텍스트·SFX(HUD 텍스트 시스템), 스테이지 클리어 `potions` 값 공급.
5. `NativeLobby.StartupPresentation.cs:172` 문구가 실제 규칙과 달라 문구 결정 필요.
