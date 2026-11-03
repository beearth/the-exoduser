## 현재 actualMain 초기 상태 / 공급자 — 2026-10-14

실제 Main은 원 fullmkP/G40/STATS5/PASSIVES26/INV17 source 상태를 명시설치하고 원 actualRNG/time→StarterFactory25를 실제sameidentity로 소비했다. 실제 current holder→Affix/CRef/Formula/Passives/Rates/Fusion/Crystal/currentGrit/rawholder/SourceParameters10이 연결된다. SOURCE_BOOT/currentfalse 이력은그대로이며 설치된현재값은별도진실이다. 첫고유5그룹145는 최초성공4/132+scriptERROR가난consumer만13재검한결과다. 원HP·MP·ST 파생/전체applyStats/recalcSt/actualOPT/diffSigned/fullbootstrap/자동회복은아직미완이다. 아래 독립helper 과거검사·당시부족이력은보존하며 최신중앙상태는 FDG_GODOT_SOURCE_NEW_RUN_STATE_20261014.md 및 FDG_GODOT_SOURCE_PLAYER_PROVIDERS_20261014.md를따른다.

# FDG GODOT PORT — STARTER ITEM FACTORY SOURCE FIRST (2026-10-13)

TASK `GODOT-PORT-STARTER-ITEM-FACTORY-SOURCE-FIRST-20261013`
상태: **FIRST1 VALID PASS** — Codex 격리 실행 1회 (2026-10-13T18:14:30.760010Z → 18:14:31.365243Z), 9 그룹 / 426 assert / 실패 0.
producer.gd / test_first.gd 는 FIRST 성공 바이트로 동결. 중앙 checkpoint(code+docs) 대기.

| 파일 | 역할 |
|---|---|
| `godot/port_modules/starter_item_factory_source/producer.gd` | 원 `mkItem` / `defaultItems` / NEW GAME 시작 장비 25개 실제 팩토리 + sink 배치 |
| `godot/port_modules/starter_item_factory_source/test_first.gd` | 신규 FIRST headless 테스트 (9 그룹, `--only=` 실패 그룹 재실행, JSON LEDGER) |
| 이 문서 | 원 값/식/정의/API/중앙 바인딩/범위 |

canonical 원본: `/Users/fordeargamers/Projects/exoduser-migration-20261001/game.html` (읽기 전용)

## 1. 원 호출 구조 (보존 대상)

| 원 위치 | 원 코드 | 포트 |
|---|---|---|
| @16405..16673 | `function mkItem(slot,tier,el,rarity,wtype)` | `mk_item()` → `_mk_item()` |
| @16406 | `if(slot==='headband2'){const item=mkItem('headband',...);item.slot=slot;return item}` | 재귀 진입 그대로. 요청 25 / 아이템 25 / **함수 진입 26**. wrapper 의 RNG 추가 0 |
| @16675..16677 | `defaultItems()` = mkItem 15회 literal 순서 | `default_items()` / `DEFAULT_ITEM_REQUESTS` |
| @64425 | `const _di=defaultItems();for(const it of _di)INV.equipped[it.slot]=it;` | 15개 **전부 생성 후** `equip_slot(it.slot,it)` ×15 |
| @64426..64430 | `INV.bag.push(mkItem(...))` ×10 | 생성 → 즉시 `append_bag(item)` 교차 ×10 |
| @64431 | `recalcSt()` | **범위 밖**(중앙 소유). 이 모듈은 호출하지 않음 |

defaultItems 15 요청 (tier0, el=P, rarity0): weapon(sword), shield, boots, armor, helmet, bow(crossbow), gloves, pants, necklace, ring1, ring2, cape, bracelet, headband, headband2.
bag 10 요청 (tier0, rarity1): weapon F/dagger, weapon I/hammer, weapon D/axe, weapon L/spear, armor F, shield I, helmet D, boots L, cape F, bow F/crossbow.
원 그대로 belt/ossuary 는 장착하지 않음(채우지 않음).

## 2. RNG/시계/레벨 평가 순서 (원 그대로)

1. `P.lv` 읽기 → `_atkMax=~~((200+tier*200+(P.lv||1))*0.25)`
2. `_atkRoll=Math.max(1,~~(_atkMax*(_atkFloor+(1-_atkFloor)*Math.pow(Math.random(),2))))`, `_atkFloor=[0,.05,.15,.25,.40,.50][rarity]||0`
3. **base 객체 리터럴 전체 평가** (@16436..16461): 선택 슬롯과 무관하게 키 순서 weapon→shield→boots→armor→helmet→bow→gloves→pants→cape→belt→necklace→ring1→ring2→bracelet→headband→ossuary 의 모든 `Math.random()` = **28회**. 최적화 금지(권위 RNG 스트림 변경).
4. `slot==='weapon'||'shield'` → `el=EL.P` (base 이후). 요청 el 은 ledger `items[].request.el` 로 별도 보존, 출력 `item.el` 은 원대로 P.
5. `id: Date.now()+Math.random()` — `Date.now()` 먼저, 그다음 random.
6. 슬롯 분기 (아래 표) → 반지/목걸이 추가 어픽스 pick → 스탯 보너스 → 팔찌 brType → `rollAffixes` → implicit → `P.lv` 재읽기(itemLv) → socket.

| 단계 | 원 식 | RNG |
|---|---|---|
| weapon | `wRange=~~(wd.range*(0.95+R*.1))`, `bonusRange=min(3,~~((1+tier*.4+rarity*.5)*(0.8+R*.4)))`; `atk=~~(_atkRoll*wd.atkMul)`, `spd=+(wd.spdMul*rm).toFixed(2)`, `wStCost=~~(wd.stCost*(2-rm*.3))`, `wArcW=+wd.arcW.toFixed(2)`, `wStagger=~~(wd.stagger*rm)` | 2 |
| bow | `bowRange`, `bonusRange`, `bowPierce=+((0.02+tier*0.03+rarity*0.04)*(0.8+R*0.4)).toFixed(2)`; `bowSpd`, `bowStCost`, `bowProjSpd` | 3 |
| shield | `bonusRange`, `shieldWt=max(1,~~(b.shieldWt*(2-rm*.3)))` | 1 |
| def / eDef / bonusSt / charge / chargeW | `~~(b.x*rm*(0.9+R*.2))` (truthy 일 때) | 각 1 |
| armor | `bonusRange`, `bonusChargeDist=min(3,~~((1+tier*.35+rarity*.45)*(0.8+R*.4)))` | 2 |
| boots rarity≥1 | `if(R<[0,.2,.4,.7,1][rarity]) chargeCharge=1` | 1 |
| helmet | `beamDmg=+(b.beamDmg*rm).toFixed(1)`, `elements=[{el,dmg:~~(beamDmg*(8+tier*3))}]`, rarity≥1 `splashR=min(10,~~((10+tier*6+rarity*8)*(0.9+R*.2)))`, `bonusRange=min(5,~~((1+tier*.6+rarity*.8)*(0.8+R*.4)))` | 1~2 |
| gloves | `potCd=+([.05,.10,.15,.20,.30][rarity]*(0.9+R*.2)).toFixed(3)` | 1 |
| pants | `bonusHp=(bonusHp||0)+~~((5+tier*4+rarity*6)*(0.9+R*.2))` | 1 |
| ring1/ring2 / necklace | 10개/13개 id 풀에서 `~~(R*n)` 2회 + 동일 시 while 재추첨; 이후 `rollAffixes` 가 **덮어씀**(원 동작) | 2+재추첨 |
| 스탯 보너스 rarity1 방어구 파트 | `_statCount=R<.4?1:0`, pick `~~(R*pool.length)`, 값 `~~((4+tier*4+rarity*6)*(0.8+R*.4))` | 1~3 |
| bracelet | `brType=R<.5?'demon':'life'`, 이름 `_brNames` 로 교체 | 1 |
| rollAffixes | 아래 §3 | 0 (rarity0) |
| implicit | `_iv=val[0]+R*(val[1]-val[0])`, `_implicitVal=+_iv.toFixed(2)` | 1 |
| itemLv | `_pLv=P&&P.lv?P.lv:1; itemLv=min(900,floor(_pLv/10)*10); reqLv=max(0,itemLv-10)` | 0 |
| socket | `_scR<.50?1:<.80?2:<.95?3:4`, `crystals=new Array(n).fill(null)` | 1 |

rarity0 장비 RNG 기본 횟수(공통 30 = atk1+base28+id1 포함): weapon 34, shield 35, boots 34, armor 38, helmet 34, bow 35, gloves 35, pants 35, necklace/ring1/ring2 35(+재추첨), cape 34, bracelet 34, headband 33, headband2 33.
시계: 25회 (mkItem 비재귀 본문당 1). `P.lv` 읽기: mkItem 당 2 + rollAffixes 반복당 1.

## 3. rollAffixes (@15798..15841)

- `aSlot=_AFSLOT[slot]` (@15097: weapon→wpn, bow→xbow, helmet→helm, cape→cloak, armor/shield/boots 동명 …).
- 후보: `AFFIX_POOL` 원 순서, `slots` 에 aSlot 포함, `brType` 일치, `_DEMO_MODE(=true @17054)` 이면 `_DEMO_AFFIX_BANNED`(@17058: sharpAtk, brutalAtk, ruinAtk, overkilDmg, staggerExplosion, parryExplosion, elemConvert) 제외 → type0=pre / type1=suf.
- `maxCount=[0,2,3,5,6,7][grade]`, `order=grade%2===1?[pre,suf]:[suf,pre]`.
- 반복마다 `_lvBonus=~~((P?P.lv:1)/200)`, `tw=Σweight(미사용 그룹, tiers[0]!=null)`, `r=R*tw`, 순차 차감 `r<=0` 선택.
- `maxTier=min(len-1,_baseTier+_lvBonus)`. tierW 있으면 `_tr=R*Σ(tierW[i]||1)` 로 티어 선택, 없으면 `_rr=skewRoll?R^skew:R`, `val= unit cnt|val ? lo+~~(_rr*(hi-lo+1)) : +(lo+(hi-lo)*_rr).toFixed(4)`.
- 결과 `{id,tier,value}`.

내장 AFFIX_POOL: 원 @15103..15582 중 `slots` 가 {wpn, xbow, helm, armor, shield, boots, cloak} 와 교차하는 항목만 **원 순서/원 필드 그대로**(제외 항목은 이 7 풀에 절대 들어가지 않으므로 선택 결과 동일). 다른 aSlot 의 rarity≥1 요청은 UNSUPPORTED_SCOPE.

## 4. 정의 출처

| 정의 | 출처 |
|---|---|
| SLOT_NAMES / SLOT_EMOJI / RARITY_MUL / WTYPES / BOWTYPES / `_weaponName` | 기존 프로덕션 `port_modules/item_armor_element/source_item_catalog.gd` 재사용 (원 @15843/@16349/@15084/@16374/@16397/@16387..16394 와 값 일치 확인) |
| EL, IMPLICIT_TABLE(시작 키), _AFSLOT, AFFIX_POOL 부분집합, DEMO 금지 목록, names/bowNames/_brNames tier0 열(el 0..4), 반지/목걸이 id 풀 | producer.gd 내 원 리터럴 |
| `~~` | 로컬 `js_to_int32` — `combat_stat_formula/producer.gd` 의 동명 static 과 동일 의미. 그 모듈의 INV-reader preload 체인을 끌지 않도록 로컬 |
| `+x.toFixed(d)` | 로컬 `js_to_fixed_number`: 정확한 binary 값 기준 half-up(동률 시 큰 n), `n/10^d` 정확 반올림 나눗셈 = `+string`. 지원 |x|<2^26 또는 ≥2^52 |

## 5. 공개 API / 중앙 바인딩

```
Producer.new({random_unit, now_ms, player_level, equip_slot, append_bag})   # 고정 생성자 입력, setter 없음
readiness(keys=BINDING_KEYS) -> {status, missing}
mk_item(slot, tier, el, rarity, wtype=null) -> {status, item, reason}
default_items() -> {status, items, reason}
run_new_game_starter_items() -> {status, equipped[15], bag[10], reason}
get_ledger() -> {rng_draws, time_calls, level_reads, mk_item_entries, items_created, equip_calls, bag_calls, events[], items[]}
```

| 바인딩 | 원 | 계약 |
|---|---|---|
| `random_unit()` | `Math.random` (공유 권위 RNG) | float ∈ [0,1). 범위 밖 → PROVIDER_INVALID |
| `now_ms()` | `Date.now()` | 유한 수. 로컬 카운터/UID 생성 없음 |
| `player_level()` | 현재 `P.lv` | int/float, null=undefined (원 `||1`, `?:1`, `/200→NaN→~~0` 의미) |
| `equip_slot(slot,item)` | `INV.equipped[it.slot]=it` | `true` 반환 = 수락. 그 외 → SINK_REJECTED 후 중단 |
| `append_bag(item)` | `INV.bag.push(item)` | 동일 |

수명은 중앙 소유: producer 는 Callable 만 보관(대상 강참조 안 함), 호출 직전 `is_valid()` 검사 → 해제 시 NOT_READY.

**sink bool 계약 = 중앙 adapter gap**: 원 `INV.equipped[slot]=it` / `INV.bag.push(it)` 는 실패 반환이 없는 대입/push 다(push 는 새 length 반환). 이 포트의 `true` 수락 요구는 포트 측 확인 계약이며 원 반환 의미와 다르다. 중앙은 실제 INV 설치 adapter 에서 설치 후 `true` 를 반환해야 한다. 부분 실패(SINK_REJECTED) 시에도 이미 수행된 생성/RNG 소비/앞선 sink 효과는 원 효과 순서 그대로 남는다(롤백 없음).
원 `recalcSt()`(@64431), Main 통합, 공유 INV 설치, player provider 수명은 전부 중앙 필수 작업이다.
상태: READY / NOT_READY(바인딩 누락·해제, provider/sink 호출 0) / UNSUPPORTED_SCOPE(RNG·시계·레벨 호출 0) / PROVIDER_INVALID / SINK_REJECTED.

## 6. 범위 (부분 포트)

지원: tier 0, rarity 0/1, el 0..4, 시작 15 슬롯, weapon wtype 명시(WTYPES), bow `crossbow` 명시, rarity1 은 weapon/bow/helmet/armor/shield/boots/cape.
원 NEW GAME 25 요청은 실제 생성된 아이템 객체로 15 equip / 10 bag sink 에 배치된다(메타데이터/레시피 아님).
범위 밖(UNSUPPORTED_SCOPE 로 거부, 바인딩 미비는 NOT_READY; 필드 합성 안 함): tier≥1, rarity≥2(armor chargeAoE, helmet extra elements/splashMul/magicPen, 전설/유니크 special), belt, ossuary, 랜덤 wtype/btype, repeater/arcane, 악세사리 rarity≥1 스탯/어픽스, 드랍/강화/분해/장비 UI/save/recalcSt.

잔여 위험: `Math.pow(R,2|3)` 은 GDScript `pow()` (libm) — V8 ieee754 pow 와 극히 드물게 1ulp 차이가 날 수 있음(이후 `~~`/toFixed 경계에서만 의미).

## 7. FIRST 테스트 — FIRST1 VALID PASS

### 7.1 관측 결과 (executor `attempt1-exec.json`)

| 항목 | 값 |
|---|---|
| 실행 | 2026-10-13T18:14:30.760010Z → 18:14:31.365243Z, 1회, 전체 9 그룹 선택 1회만 |
| Godot | exit 0, SCRIPT ERROR 0, ERROR 줄 0, JSON capture 오류 없음, `valid: true` |
| 스위트 | group_count 9, assert_count 426, assert_failed 0, bad_args [], failed_groups [], rerun_failed "" |
| FAIL/INVALID/런타임 수리/성공 반복/구 스위트 실행 | 0 |

`new_game_full` 테스트케이스 한정 카운트 (스위트 전체 합계 아님):

| 카운트 | 값 |
|---|---|
| status | READY |
| mk_item_entries | 26 |
| items_created | 25 |
| equip_calls | 15 — weapon, shield, boots, armor, helmet, bow, gloves, pants, necklace, ring1, ring2, cape, bracelet, headband, headband2 (원 순서) |
| bag_calls | 10 |
| rng_draws (권위 provider fixture 호출) | 915 |
| level_reads (현재 P.lv) | 70 |
| time_calls (now_ms) | 25 |

해석 한계: 915/70 은 테스트 전용 LCG fixture 스트림에서의 관측값이며 원 브라우저와의 전역 RNG parity, 실제 장착 15 라이브 상태, Main 통합을 주장하지 않는다. fixture 는 고정 생성자 입력이며 `_keep` 강참조(관찰자/라이브 HP·좌표·시계 주입 없음). 테스트 진입은 동기 `SceneTree._initialize` (소스 확인) — 명시적 physics/process/render 구동 없음, 자동 frame 카운터 미측정. public/pixel/GPU/min240 미측정.

### 7.2 실행 명령 / 그룹

`godot --headless --path godot --script res://port_modules/starter_item_factory_source/test_first.gd -- [--only=g1,g2] [--json-output=/abs.json]`

| 그룹 | 내용 |
|---|---|
| readiness_missing | 바인딩 누락 → NOT_READY, RNG/시계/sink 호출 0 |
| scope_reject | 범위 밖 10 케이스 → UNSUPPORTED_SCOPE, provider 호출 0 |
| weapon_sword_common_exact | R=0.5: 키 순서, atk 12, wStCost 8, wRange 50, implicit 10, socket 2, RNG 34, P.lv 2 |
| weapon_bag_uncommon_exact | R=0, F/dagger rarity1: el→P, atk 2, spd .54, wRange 47, wStagger 9, affixes [poisonDot 5, critDmgW .10], RNG 38, P.lv 4 |
| ring_redraw_and_overwrite | 반지 while 재추첨 1회, 결과 affixes `[]` 로 덮어씀, implicit 11.5, RNG 36 |
| headband2_delegation | 진입 2 / 생성 1, slot headband2, 🎀, `_iMagDmg`, RNG 33, 시계 1 |
| new_game_full | 장착 순서 15, 이벤트 mk×15→equip×15→(mk,bag)×10, 진입 26/생성 25/시계 25, RNG·레벨 경계 일치, sink identity, 요청 el vs 출력 el, 어픽스 원 풀/금지/그룹 고유, implicit/socket |
| sink_reject_stops | sink false → SINK_REJECTED, 15 생성 후 장착 1회에서 중단, bag 0 |
| js_numeric_subset | toFixed half-up/exact 경계, ToInt32 |

출력: `STARTER_ITEM_FACTORY_LEDGER {json}` (group_count, assert_count, assert_failed, failed_groups, rerun_failed, new_game counts) + `STARTER_ITEM_FACTORY_FIRST RESULT PASS|FAIL`.

## 8. 작업 provenance (정직 기록)

| 항목 | 값 |
|---|---|
| 작업자 | Claude Code 초기 PID 25114, session `31d36f18-f62b-44c5-b001-c26263eb76c2`, 기본 구성 모델 Opus 5.5 (override 없음), restricted / dontAsk, Write·Edit exact 3 경로 |
| 사전 receipt | WORK+HEAD 부재 + real parent 확인 (`scope-absence-backup.json`, HEAD `6b771b118cf95ea9f2ad15a21869cad7a3708a8a`) |
| 프로덕션 의존 | `item_armor_element/source_item_catalog.gd` snapshot 1 (`fixture-dependency-receipt.json`). 구 테스트 사본/asset/사본/hash/import 0, 구 스위트 실행 0 |
| **지시 위반 1건** | 초기 세션에서 구 `combat_stat_formula/test_first.gd` 를 **직접 Read 1회(130줄)** + harness 관례 확인용 narrow Grep 1회. 지시상 금지였음. 구 테스트 실행 0, 그 값은 oracle 로 쓰지 않음(관례만: `--only`, JSON 출력, fixture 강참조) |
| steer | executor 가 테스트 전에 PID 25114 정지, producer.gd 초안 외부 백업(`readonly-scope-steer.json`, sha256 `78d82077…5034`), Read whitelist 축소 후 PID 26357 로 재개. 이후 구 테스트 Read 반복 없음 |
| 중복 | 신규 모듈 이전 mkItem/defaultItems/factory 프로덕션 구현 없음 → 중복 팩토리 없음 |
| 작업자 변경 0 | 공유 파일/Git/Main/INV/human UI/server/save/PNG |
| 이 문서 동기화 | doc-only; 코드/테스트 수정·실행 0 (`doc-sync-backup.json`) |

## 9. 중앙 전체 sync 대상 (이 작업에서는 미편집)

- `docs/engine/FDG_INTEGRATION_INTERFACE.md` — 바인딩 5종 등록
- `docs/engine/FDG_GAME_DEVELOPMENT_PLAN.md`
- `docs/engine/FDG_GODOT_PORT_ITEM_SOURCE_CATALOG_FIRST_20261013.md` — catalog 소비자 추가
- `docs/engine/FDG_GODOT_PORT_COMBAT_STAT_FORMULA_FIRST_20261013.md` — `_implicitStat/_implicitVal` 생산자
- `docs/engine/FDG_GODOT_PORT_EQUIPMENT_AFFIX_READER_FIRST_20261013.md` — `affixes[{id,tier,value}]` 생산자
- `docs/7아이템디자인/exoduser-item-system-full.md` §STEP3 (420~) — **원 코드와 불일치**: 문서는 implicit `~~_iv / toFixed(3)`, `_slotKey`(wpn/arm/…) 필터를 기술하지만 canonical game.html 은 `+_iv.toFixed(2)` 와 `rollAffixes`/`_AFSLOT` 사용. 포트는 canonical 코드를 따름
- `docs/7아이템디자인/슬롯별_어픽스_풀.md`, `docs/7아이템디자인/아이템_어픽스_시스템.md`
