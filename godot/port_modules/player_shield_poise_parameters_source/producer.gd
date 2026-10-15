extends RefCounted
##
## player_shield_poise_parameters_source/producer.gd — 원 applyStats 의 포이즈 초기화(@28584-28586) 와
## 에너지 쉴드 상한/현재값(@28622-28623) 을 서로 분리된 두 production stage 로 plan + 단일 sink dispatch.
## TASK GODOT-PORT-PLAYER-SHIELD-POISE-PARAMETERS-SOURCE-FIRST-20261013
##
## 원 applyStats 는 HP(@28582)/DEF(@28583)/poise(@28584-86)/ATK·speed/ST·HP·MP 리젠/결정/HP·MP 상한/패시브/shield(@28622-23)
## 순으로 다른 owner 대입과 교차한다 → 이 모듈은 두 stage 를 따로 호출 가능하게만 제공하고, 연속 결합(전체 applyStats)
## 이나 recalcSt 호출을 하지 않는다. 전체 stage 순서/공유 Player 는 central(ENGINE) 소유.
##
## 자체 clock/_process/_physics_process 없음. 상태는 매 호출 provider 에서 현재값으로 읽는다(캐시/스냅샷 없음).
## Player/World/P/INV 직접 쓰기 0 — 결과는 오직 sink(packet) 로만 나간다.
## provider/필드 누락 → NOT_READY + packet null + dispatch 0. 중립 4/0/100 보충 0.
##
## 원값(R canonical game.html, 읽기전용):
##   @28566-28569 s.int=STATS.int+_eqInt+_lb+~~_eqAffix('intFlat')
##                → player_resource_parameters_source.plan_apply_stats().values.s_int 재사용(재계산 0)
##   @28577-28581 _totalBonusShield=0; _allDefSlots 14종: if(_dit){…_totalBonusShield+=(+_dit.bonusShield||0)…}
##                → 이 모듈의 shield 전용 14슬롯 합(resource plan 은 bonusShield 를 노출하지 않음)
##   @28584 P.maxPoise=4;
##   @28585 if(P.poise===undefined||P.poise>4)P.poise=4;
##   @28586 if(P.poiseR===undefined)P.poiseR=0;
##   @28622 P.mshield=~~(100+s.int*5+_totalBonusShield+_eqAffix('shieldFlat'));
##   @28623 P.shield=Math.min(P.shield,P.mshield);
##   @28624 recalcSt()  — 이 모듈 범위 밖(player_resource_parameters_source.run_recalc_st)
##
## 원에 자동 player poise 리젠 getter/writer 없음 → 이 모듈도 poise 리젠/현재값 clamp 정책/필드 0.
## 제외(타 owner): HP/DEF/ATK/speed/MP/ST 파생, 쉴드 리젠 tick/shieldRegenT, hurtP 흡수, poise 소모/기절/패링 회복,
##   Q/E, status clock, attack ticket, active cap, 무적, 난이도 보정, 저장/복원, UI/렌더.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const CombatStatFormula := preload("res://port_modules/combat_stat_formula/producer.gd")
const SourceParameters := preload("res://port_modules/player_resource_parameters_source/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"   # 원 Math.min 결과 NaN/±Inf — 값 공급 0 (진단 packet 만)
const SINK_REJECTED := "SINK_REJECTED"           # PORT BINDING: sink ack=false (원에는 ack/게이트 없음)

## 필수 provider 키 → 원 표현식
const PROVIDER_PLAYER := "player"                # () -> 현재 P Dictionary
const PROVIDER_INVENTORY := "inventory"          # () -> 현재 INV Dictionary ({equipped:{slot:item}})
const PROVIDER_EQ_AFFIX := "eq_affix"            # (id) -> {status,value} = equipment_affix_reader.eq_affix (원 _eqAffix + 캐시)
const PROVIDER_RESOURCE_PLAN := "resource_plan"  # () -> 새 READY player_resource_parameters_source.plan_apply_stats() 결과
const POISE_INIT_REQUIRED: Array[String] = [PROVIDER_PLAYER]
const SHIELD_REQUIRED: Array[String] = [PROVIDER_PLAYER, PROVIDER_INVENTORY, PROVIDER_EQ_AFFIX, PROVIDER_RESOURCE_PLAN]

const STAGE_POISE_INIT := "poise_init"
const STAGE_SHIELD := "shield"
const KIND_POISE_INIT := "apply_stats_poise_init"
const KIND_SHIELD := "apply_stats_shield"

const MAX_POISE := 4.0          # @28584 P.maxPoise=4
const POISE_RESET := 4.0        # @28585 P.poise=4
const POISE_R_INIT := 0.0       # @28586 P.poiseR=0
const SHIELD_BASE := 100.0      # @28622 100+
const SHIELD_INT_MUL := 5.0     # @28622 s.int*5

const CURRENT_FIELDS: Array[String] = ["shield", "mshield", "maxPoise", "poise", "poiseR"]

## sink ack 계약은 원에 없는 포트 바인딩이다(원 대입은 실패하지 않음). 새 gameplay 게이트 아님.
const SINK_ACK_CONTRACT := "PORT_BINDING: sink(packet)->bool true; false=SINK_REJECTED, 원 gameplay 게이트 아님"

## production 에 현재 authority/provider 가 없는 입력 (외부 주입 필요).
const MISSING_UPSTREAM := {
	"current_P": "native Player 에 shield/mshield/maxPoise/poise/poiseR source projection 없음 — ENGINE",
	"current_INV": "현재 INV authority (equipped 14 def slots bonusShield) — ITEM/ENGINE",
	"resource_plan": "central 이 공통 plan_apply_stats() 를 1회 계산해 공급하는 provider (STATS/PASSIVES/grit 등 그 upstream 포함) — ENGINE",
	"install_sink": "poise_init/shield packet 을 공유 P 에 적용하는 sink 설치 + 원 applyStats stage 순서 orchestration — ENGINE",
}

var _providers: Dictionary = {}
var _sink: Callable = Callable()
var _owners: Array[Object] = []  # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 재사용 (inventory reader 미바인딩 — 계산 전용)
var _fail: String = ""
var _dispatch_count: int = 0
var _resource_plan_calls: int = 0
var _last: Dictionary = {}


# ───────────────────────── configure / readiness ─────────────────────────

## providers: SHIELD_REQUIRED(⊇ POISE_INIT_REQUIRED) → Callable, sink: Callable(packet)->bool
func configure(providers: Dictionary, sink: Callable) -> Dictionary:
	_providers = providers.duplicate()
	_sink = sink
	_owners.clear()
	_retain(sink)
	for key: Variant in _providers:
		var v: Variant = _providers[key]
		if v is Callable:
			_retain(v)
	_configured = true
	return readiness()


func clear() -> void:
	_providers = {}
	_sink = Callable()
	_owners.clear()
	_configured = false


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


func dispatch_count() -> int:
	return _dispatch_count


## resource_plan provider 실제 호출 횟수 (stage 당 1회, 두 번째 plan 자동 호출 0 확인용).
func resource_plan_calls() -> int:
	return _resource_plan_calls


func last_result() -> Dictionary:
	return _last.duplicate(true)


func _provider(key: String) -> Callable:
	var v: Variant = _providers.get(key, null)
	if v is Callable:
		var c: Callable = v
		if c.is_valid():
			return c
	return Callable()


func _missing_for(required: Array[String]) -> Array[String]:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	for key in required:
		if not _provider(key).is_valid():
			missing.append("provider:" + key)
	return missing


## 바인딩 준비도(값 호출 없음). stage 별 필요 provider 가 다르다.
func readiness() -> Dictionary:
	var poise_missing := _missing_for(POISE_INIT_REQUIRED)
	var shield_missing := _missing_for(SHIELD_REQUIRED)
	if not _sink.is_valid():
		poise_missing.append("sink")
		shield_missing.append("sink")
	var all_ready: bool = poise_missing.is_empty() and shield_missing.is_empty()
	return {
		"ready": all_ready,
		"status": READY if all_ready else NOT_READY,
		"stages": {
			STAGE_POISE_INIT: { "ready": poise_missing.is_empty(), "missing": poise_missing },
			STAGE_SHIELD: { "ready": shield_missing.is_empty(), "missing": shield_missing },
		},
		"sink_ack_contract": SINK_ACK_CONTRACT,
		"missing_upstream": MISSING_UPSTREAM.duplicate(),
	}


static func _not_ready(reason: String) -> Dictionary:
	return { "status": NOT_READY, "ready": false, "reason": reason, "packet": null }


# ───────────────────────── JS helpers (공용 helper 위임) ─────────────────────────

func _set_fail(reason: String) -> void:
	if _fail == "":
		_fail = reason


static func _prop_has(o: Variant, key: String) -> bool:
	if o is Dictionary:
		var d: Dictionary = o
		return d.has(key)
	return false


static func _prop_val(o: Variant, key: String) -> Variant:
	if o is Dictionary:
		var d: Dictionary = o
		return d.get(key, null)
	return null   # primitive/배열의 명명 프로퍼티 = undefined


## +o.key (absent → undefined → NaN). Godot Object 값은 원 JSON 상태에 없는 shape → NOT_READY.
func _to_num(o: Variant, key: String, label: String) -> float:
	var v: Variant = _prop_val(o, key)
	if v is Object:
		_set_fail("unsupported_shape:" + label)
		return 0.0
	return _coerce.js_to_number(v, _prop_has(o, key))


## (+o.key||0)
func _plus_or0(o: Variant, key: String, label: String) -> float:
	var n: float = _to_num(o, key, label)
	if not AffixReader.js_truthy(n):
		return 0.0
	return n


## Math.min(a,b) — NaN 전파. (-0/+0 구분 미재현)
static func _js_min(a: float, b: float) -> float:
	if is_nan(a) or is_nan(b):
		return NAN
	return minf(a, b)


func _read_container(key: String) -> Dictionary:
	var c := _provider(key)
	if not c.is_valid():
		_set_fail("provider_missing:" + key)
		return {}
	var v: Variant = c.call()
	if v == null:
		_set_fail("source_throw:" + key + "_null")
		return {}
	if not (v is Dictionary):
		_set_fail("unsupported_shape:" + key)
		return {}
	return v


func _equipped(inv: Dictionary) -> Dictionary:
	if not inv.has("equipped") or inv["equipped"] == null:
		_set_fail("source_throw:INV.equipped")
		return {}
	var e: Variant = inv["equipped"]
	if not (e is Dictionary):
		_set_fail("unsupported_shape:INV.equipped")
		return {}
	return e


## 원 _eqAffix(id) — equipment_affix_reader.eq_affix 계약({status,value}) 그대로 소비. READY 만 값.
func _eq_affix(id: String) -> float:
	var c := _provider(PROVIDER_EQ_AFFIX)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_EQ_AFFIX)
		return 0.0
	var r: Variant = c.call(id)
	if not (r is Dictionary):
		_set_fail("eq_affix_bad_result:" + id)
		return 0.0
	var d: Dictionary = r
	if str(d.get("status", "")) != READY:
		_set_fail("eq_affix_not_ready:" + id + ":" + str(d.get("status", "")) + ":" + str(d.get("reason", "")))
		return 0.0
	var v: Variant = d.get("value", null)
	if not (v is int or v is float):
		_set_fail("eq_affix_not_number:" + id)
		return 0.0
	return float(v)


## 원 s.int — 새 READY plan_apply_stats() 결과의 values.s_int 만 받는다.
## SOURCE_BOOT/NOT_READY/SOURCE_NON_FINITE/형식 불일치 → NOT_READY (boot/현재값을 파생으로 위장 금지).
## 호출당 provider 1회. 두 번째 plan/recalcSt 자동 호출 0.
func _resource_s_int() -> float:
	var c := _provider(PROVIDER_RESOURCE_PLAN)
	if not c.is_valid():
		_set_fail("provider_missing:" + PROVIDER_RESOURCE_PLAN)
		return 0.0
	_resource_plan_calls += 1
	var r: Variant = c.call()
	if not (r is Dictionary):
		_set_fail("resource_plan_bad_result")
		return 0.0
	var d: Dictionary = r
	var status: String = str(d.get("status", ""))
	if status != SourceParameters.READY:
		_set_fail("resource_plan_not_ready:" + status + ":" + str(d.get("reason", "")))
		return 0.0
	var packet_v: Variant = d.get("packet", null)
	if not (packet_v is Dictionary):
		_set_fail("resource_plan_not_apply_stats")
		return 0.0
	var packet: Dictionary = packet_v
	if str(packet.get("kind", "")) != SourceParameters.KIND_APPLY_STATS:
		_set_fail("resource_plan_not_apply_stats")
		return 0.0
	var values_v: Variant = d.get("values", null)
	if not (values_v is Dictionary):
		_set_fail("resource_plan_missing:s_int")
		return 0.0
	var values: Dictionary = values_v
	if not values.has("s_int"):
		_set_fail("resource_plan_missing:s_int")
		return 0.0
	var s_int: Variant = values["s_int"]
	if not (s_int is int or s_int is float):
		_set_fail("resource_plan_s_int_not_number")
		return 0.0
	return float(s_int)


static func _w(field: String, value: Variant, source: String, expr: String) -> Dictionary:
	return { "field": field, "value": value, "source": source, "expr": expr }


static func _non_finite_fields(writes: Array[Dictionary]) -> Array[String]:
	var bad: Array[String] = []
	for w in writes:
		var v: Variant = w["value"]
		if v is float:
			var f: float = v
			if is_nan(f) or is_inf(f):
				var field: String = w["field"]
				if not bad.has(field):
					bad.append(field)
	return bad


func _finish_plan(kind: String, source: String, writes: Array[Dictionary], values: Dictionary) -> Dictionary:
	var packet := { "kind": kind, "source": source, "writes": writes }
	var bad := _non_finite_fields(writes)
	if not bad.is_empty():
		return {
			"status": SOURCE_NON_FINITE, "ready": false, "reason": "computed_non_finite:" + ",".join(PackedStringArray(bad)),
			"packet": null, "diagnostic_packet": packet, "values": values,
		}
	return { "status": READY, "ready": true, "reason": "", "packet": packet, "values": values }


# ───────────────────────── stage: poise 초기화 @28584-28586 ─────────────────────────

## 순수 계획. undefined(=키 부재) 만 원 `===undefined`. null/false/NaN/음수/0/정확히 4 는 보존(쓰기 0).
## `P.poise>4` 는 관계 비교 ToNumber ("5"→5 true, {}→NaN false).
func plan_poise_init() -> Dictionary:
	_fail = ""
	var missing := _missing_for(POISE_INIT_REQUIRED)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return _not_ready(_fail)

	var writes: Array[Dictionary] = []
	writes.append(_w("maxPoise", MAX_POISE, "game.html:28584", "P.maxPoise=4"))
	var poise_present: bool = p.has("poise")
	var poise_reset: bool = not poise_present
	if poise_present:
		poise_reset = _to_num(p, "poise", "P.poise") > 4.0   # NaN > 4 = false
	if _fail != "":
		return _not_ready(_fail)
	if poise_reset:
		writes.append(_w("poise", POISE_RESET, "game.html:28585", "if(P.poise===undefined||P.poise>4)P.poise=4"))
	var poise_r_init: bool = not p.has("poiseR")
	if poise_r_init:
		writes.append(_w("poiseR", POISE_R_INIT, "game.html:28586", "if(P.poiseR===undefined)P.poiseR=0"))
	var values := {
		"maxPoise": MAX_POISE,
		"poise_written": poise_reset,
		"poise_preserved_present": poise_present and not poise_reset,
		"poiseR_written": poise_r_init,
	}
	return _finish_plan(KIND_POISE_INIT, "game.html:28584-28586", writes, values)


# ───────────────────────── stage: 에너지 쉴드 @28622-28623 ─────────────────────────

## 순수 계획(공유 상태 쓰기/sink 0). resource_plan provider 1회 호출 → s.int, 14슬롯 bonusShield 합,
## _eqAffix('shieldFlat') → ~~(…) → Math.min(P.shield, P.mshield).
## P.shield 부재(undefined)/NaN → Math.min NaN → SOURCE_NON_FINITE (0 보충 0).
func plan_shield() -> Dictionary:
	_fail = ""
	var missing := _missing_for(SHIELD_REQUIRED)
	if not missing.is_empty():
		return _not_ready("not_ready:" + ",".join(PackedStringArray(missing)))
	var p := _read_container(PROVIDER_PLAYER)
	var inv := _read_container(PROVIDER_INVENTORY)
	if _fail != "":
		return _not_ready(_fail)
	var eq := _equipped(inv)
	if _fail != "":
		return _not_ready(_fail)

	# @28569 s.int (resource plan 재사용)
	var s_int: float = _resource_s_int()
	if _fail != "":
		return _not_ready(_fail)
	# @28577-28581 _totalBonusShield (원 14슬롯 순서로 누적)
	var total_bonus_shield: float = 0.0
	var contributing: Array[String] = []
	for sl in SourceParameters.DEF_SLOTS:
		var dit: Variant = eq.get(sl, null)
		if dit is Object:
			_set_fail("unsupported_item_shape:" + sl)
			break
		if AffixReader.js_truthy(dit):
			var add: float = _plus_or0(dit, "bonusShield", "INV.equipped." + sl + ".bonusShield")
			total_bonus_shield += add
			if add != 0.0:
				contributing.append(sl)
	if _fail != "":
		return _not_ready(_fail)
	# @28622
	var shield_flat: float = _eq_affix("shieldFlat")
	if _fail != "":
		return _not_ready(_fail)
	var raw: float = SHIELD_BASE + s_int * SHIELD_INT_MUL + total_bonus_shield + shield_flat
	var mshield: float = float(CombatStatFormula.js_to_int32(raw))
	# @28623 (P.shield 은 이번 applyStats 에서 앞서 바뀌지 않음 — 현재 P 그대로)
	var shield_present: bool = p.has("shield")
	var cur_shield: float = _to_num(p, "shield", "P.shield")
	if _fail != "":
		return _not_ready(_fail)
	var shield: float = _js_min(cur_shield, mshield)

	var writes: Array[Dictionary] = [
		_w("mshield", mshield, "game.html:28622", "P.mshield=~~(100+s.int*5+_totalBonusShield+_eqAffix('shieldFlat'))"),
		_w("shield", shield, "game.html:28623", "P.shield=Math.min(P.shield,P.mshield)"),
	]
	var values := {
		"s_int": s_int, "total_bonus_shield": total_bonus_shield, "bonus_slots": contributing,
		"shield_flat": shield_flat, "mshield_raw": raw, "mshield": mshield,
		"shield_before_present": shield_present, "shield_before": cur_shield, "shield": shield,
	}
	return _finish_plan(KIND_SHIELD, "game.html:28622-28623", writes, values)


# ───────────────────────── dispatch (stage 별 단독) ─────────────────────────

func _dispatch(packet: Dictionary) -> bool:
	var ack: Variant = _sink.call(packet.duplicate(true))
	_dispatch_count += 1
	return ack is bool and bool(ack)


func _run(stage: String, kind: String, plan: Dictionary) -> Dictionary:
	var dispatched: Array[String] = []
	var out := { "stage": stage, "dispatched": dispatched, "plan": plan }
	if str(plan["status"]) != READY:
		out.merge({ "status": plan["status"], "ready": false, "reason": plan["reason"] }, true)
		_last = out.duplicate(true)
		return out
	var packet: Dictionary = plan["packet"]
	dispatched.append(kind)
	if not _dispatch(packet):
		out.merge({ "status": SINK_REJECTED, "ready": false, "reason": "sink_rejected:" + kind }, true)
	else:
		out.merge({ "status": READY, "ready": true, "reason": "" }, true)
	_last = out.duplicate(true)
	return out


func _sink_missing(stage: String) -> Dictionary:
	var dispatched: Array[String] = []
	var out := { "stage": stage, "dispatched": dispatched, "plan": null }
	out.merge(_not_ready("sink_missing"), true)
	_last = out.duplicate(true)
	return out


## 원 @28584-28586 만. central 이 @28583(DEF) 후 / @28588(ATK) 전 위치에서 호출.
func run_poise_init_stage() -> Dictionary:
	if not _sink.is_valid():
		return _sink_missing(STAGE_POISE_INIT)
	return _run(STAGE_POISE_INIT, KIND_POISE_INIT, plan_poise_init())


## 원 @28622-28623 만. central 이 @28620(pArmor) 후 / @28624 recalcSt(=KIND_INVALIDATE) 전 위치에서 호출.
## recalcSt/캐시 무효화는 호출하지 않는다.
func run_shield_stage() -> Dictionary:
	if not _sink.is_valid():
		return _sink_missing(STAGE_SHIELD)
	return _run(STAGE_SHIELD, KIND_SHIELD, plan_shield())


# ───────────────────────── 현재 P 읽기 (현재값 — 파생 아님) ─────────────────────────

## 필수 player provider 가 돌려주는 현재 shield/mshield/maxPoise/poise/poiseR 원값 그대로.
## 키 부재/provider 부재 → NOT_READY + missing (값 보충 0). 존재하지만 유한 number 가 아닌 값은
## 원이 보존할 수 있는 상태(poise null 등)이므로 그대로 두고 non_finite_number 로 진단만 한다.
func read_current() -> Dictionary:
	_fail = ""
	var p := _read_container(PROVIDER_PLAYER)
	if _fail != "":
		return { "status": NOT_READY, "reason": _fail, "origin": "current_P_reader", "values": {}, "missing": [], "non_finite_number": [] }
	var values := {}
	var missing: Array[String] = []
	var non_finite: Array[String] = []
	for f in CURRENT_FIELDS:
		if not p.has(f):
			missing.append(f)
			continue
		var v: Variant = p[f]
		values[f] = v
		var finite_number: bool = (v is int) or (v is float and not is_nan(float(v)) and not is_inf(float(v)))
		if not finite_number:
			non_finite.append(f)
	return {
		"status": READY if missing.is_empty() else NOT_READY,
		"reason": "" if missing.is_empty() else "fields:" + ",".join(PackedStringArray(missing)),
		"origin": "current_P_reader", "values": values, "missing": missing, "non_finite_number": non_finite,
	}
