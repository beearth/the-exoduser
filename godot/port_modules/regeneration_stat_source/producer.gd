extends RefCounted
##
## regeneration_stat_source/producer.gd — 원 pRegenMul/pMRegenMul + 원 12슬롯 장비 stRegen/mpRegen 직접합 provider.
## TASK GODOT-PORT-REGENERATION-STAT-SOURCE-FIRST-20261013
##
## 원 R(canonical game.html, 읽기전용):
##   wp sh bt ar hm bw gl pt nc rg1 rg2 cp (){return INV.equipped.<slot>||{}}        (game.html:17020-17032; blt@17028 미사용)
##   pRegenMul(){return 1+PASSIVES.pRegen*.03}                                       (game.html:28703)
##   pMRegenMul(){return 1+PASSIVES.pMRegen*.03}                                     (game.html:28704)
##   _mpr=(P.mpR+(wp().mpRegen||0)+…+(cp().mpRegen||0))*pMRegenMul()*_hdMul          (game.html:33353)
##   _str=(P.stR+(wp().stRegen||0)+…+(cp().stRegen||0))*pRegenMul()*_hdMul           (game.html:33354)
##
## 자체 clock/_process 없음, 캐시 없음 — 매 호출 passives/player/inventory reader 를 새로 읽는다.
## 공유 상태(PASSIVES/INV/P) 쓰기 0. 어픽스 캐시(_eqAffix) 미사용 — 아이템 직접 프로퍼티만 읽는다.
## _hdMul(holyDome) 은 이 모듈 밖: natural_providers() 는 in_holy_dome 을 공급하지 않는다(중앙이 외부 바인딩).
##
## float 묶음 경계:
##   원은 P 기저부터 좌→우 누적 ((P.mpR+t1)+t2)+…+t12. read_equip_*_regen() 은 0 부터 t1..t12 만 누적하므로
##   완료된 resource_regeneration_source 의 (P.mpR + Σ) 묶음과 결합하면 마지막 ulp/overflow 가 다를 수 있다.
##   원 순서 그대로의 pre-holy 값은 read_source_rates() 가 제공한다(중앙이 _hdMul 만 외부에서 곱함).

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const NaturalRegen := preload("res://port_modules/resource_regeneration_source/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"   # 원식이 NaN/±Infinity 를 산출 — 값 공급 0

## 원 _mpr/_str 항 순서 (game.html:33353-33354). SLOT_NAMES(17) 아님.
const SOURCE_SLOTS: Array[String] = [
	"weapon", "shield", "boots", "armor", "helmet", "bow", "gloves", "pants", "necklace", "ring1", "ring2", "cape",
]
const SOURCE_GETTERS: Array[String] = ["wp", "sh", "bt", "ar", "hm", "bw", "gl", "pt", "nc", "rg1", "rg2", "cp"]
## 장착 가능하지만 원 리젠 합에 없는 슬롯 — 읽지 않는다.
const EXCLUDED_SLOTS: Array[String] = ["belt", "bracelet", "headband", "ossuary", "headband2"]

const PASSIVE_COEF: float = 0.03   # *.03
const KEY_P_REGEN := "pRegen"
const KEY_P_MREGEN := "pMRegen"
const PROP_ST_REGEN := "stRegen"
const PROP_MP_REGEN := "mpRegen"
const FIELD_ST_R := "stR"
const FIELD_MP_R := "mpR"

const API_REGEN_MUL := "regen_mul"
const API_MREGEN_MUL := "mregen_mul"
const API_EQUIP_ST_REGEN := "equip_st_regen"
const API_EQUIP_MP_REGEN := "equip_mp_regen"
const API_SOURCE_RATES := "source_rates"

## 이 모듈이 공급하지 않는 완료 natural provider 키 — 중앙이 외부 holyDome provider 로 채운다.
const HOLY_DOME_EXTERNAL_KEY := NaturalRegen.PROVIDER_IN_HOLY_DOME

const REQUIRES := {
	API_REGEN_MUL: ["passives_reader"],
	API_MREGEN_MUL: ["passives_reader"],
	API_EQUIP_ST_REGEN: ["inventory_reader"],
	API_EQUIP_MP_REGEN: ["inventory_reader"],
	API_SOURCE_RATES: ["passives_reader", "player_reader", "inventory_reader"],
}

var _passives_reader: Callable = Callable()   # ()->현재 PASSIVES Dictionary|null (player_passives_source.read_current_passives)
var _player_reader: Callable = Callable()     # ()->현재 P Dictionary
var _inventory_reader: Callable = Callable()  # ()->현재 INV Dictionary (equipment_affix_reader 와 같은 reader)
var _owners: Array[Object] = []  # 메서드 Callable 은 ObjectID 만 보유 → RefCounted owner 강하게 유지
var _configured: bool = false
var _last: Dictionary = {}
var _coerce: AffixReader = AffixReader.new()  # JS ToNumber 전용(인벤토리 미바인딩, 캐시 사용 0)


# ───────────────────────── configure ─────────────────────────

func configure(passives_reader: Callable, player_reader: Callable, inventory_reader: Callable) -> Dictionary:
	_passives_reader = passives_reader
	_player_reader = player_reader
	_inventory_reader = inventory_reader
	_owners.clear()
	_retain(passives_reader)
	_retain(player_reader)
	_retain(inventory_reader)
	_configured = true
	_last = {}
	return readiness()


func clear() -> void:
	_passives_reader = Callable()
	_player_reader = Callable()
	_inventory_reader = Callable()
	_owners.clear()
	_configured = false
	_last = {}


func _retain(c: Callable) -> void:
	if not c.is_valid():
		return
	var o: Object = c.get_object()
	if o != null and o is RefCounted and not _owners.has(o):
		_owners.append(o)


## 바인딩 준비도(값 호출 없음). 값 단위 판정은 각 read_* 호출에서 매번.
func readiness() -> Dictionary:
	var missing: Array[String] = []
	if not _configured:
		missing.append("not_configured")
	if not _passives_reader.is_valid():
		missing.append("passives_reader")
	if not _player_reader.is_valid():
		missing.append("player_reader")
	if not _inventory_reader.is_valid():
		missing.append("inventory_reader")
	return {
		"ready": missing.is_empty(), "status": READY if missing.is_empty() else NOT_READY,
		"missing": missing, "requires": REQUIRES.duplicate(true),
	}


## api 별 마지막 결과(복사). api="" → 전체.
func last_result(api: String = "") -> Dictionary:
	if api.is_empty():
		return _last.duplicate(true)
	var r: Dictionary = _last.get(api, {})
	return r.duplicate(true)


# ───────────────────────── 공용 helper ─────────────────────────

static func _result(status: String, reason: String, value: Variant, extra: Dictionary = {}) -> Dictionary:
	var r := { "ready": status == READY, "status": status, "reason": reason, "value": value }
	r.merge(extra)
	return r


func _store(api: String, r: Dictionary) -> Dictionary:
	_last[api] = r.duplicate(true)
	return r


static func _fail(reason: String) -> Dictionary:
	return { "ok": false, "reason": reason }


static func _safe_int(v: int) -> bool:
	return v <= AffixReader.JS_SAFE_INTEGER_MAX and v >= -AffixReader.JS_SAFE_INTEGER_MAX


static func _call_reader(c: Callable, name: String) -> Dictionary:
	if c.is_null():
		return _fail(name + "_unbound")
	if not c.is_valid():
		return _fail(name + "_target_invalid")
	return { "ok": true, "value": c.call() }


# ───────────────────────── PASSIVES → pRegenMul / pMRegenMul ─────────────────────────

func _read_passives() -> Dictionary:
	var rc := _call_reader(_passives_reader, "passives_reader")
	if not bool(rc.ok):
		return rc
	var v: Variant = rc.value
	if v == null:
		return _fail("PASSIVES_null (exact 사유: player_passives_source.current_status())")
	if not (v is Dictionary):
		return _fail("PASSIVES_unsupported_shape:" + type_string(typeof(v)))
	return { "ok": true, "value": v }


## PASSIVES.<key> 의 곱셈 ToNumber. undefined→NaN, null/false/''→0, true→1, 숫자 문자열→StringToNumber.
func _passive_number(raw: Variant, present: bool, key: String) -> Dictionary:
	if not present:
		return { "ok": true, "n": NAN }
	if raw is int:
		if not _safe_int(raw):
			return _fail("PASSIVES.%s_unsafe_integer" % key)
		return { "ok": true, "n": float(raw) }
	if raw == null or raw is bool or raw is float or raw is String or raw is StringName:
		return { "ok": true, "n": _coerce.js_to_number(raw, true) }
	return _fail("PASSIVES.%s_unsupported_shape:%s" % [key, type_string(typeof(raw))])


func _passive_mul(key: String, src_name: String) -> Dictionary:
	var extra := { "source": src_name, "passive_key": key }
	var pr := _read_passives()
	if not bool(pr.ok):
		return _result(NOT_READY, String(pr.reason), null, extra)
	var passives: Dictionary = pr.value
	var present: bool = passives.has(key)
	var raw: Variant = passives[key] if present else null
	var cn := _passive_number(raw, present, key)
	if not bool(cn.ok):
		return _result(NOT_READY, String(cn.reason), null, extra)
	var n: float = cn.n
	var v: float = 1.0 + n * PASSIVE_COEF   # 원 1+PASSIVES.<key>*.03
	extra["passive_present"] = present
	extra["passive_number"] = n
	if not is_finite(v):
		extra["source_value"] = v
		var why: String = ("PASSIVES.%s undefined" % key) if not present else ("PASSIVES.%s→%s" % [key, str(n)])
		return _result(SOURCE_NON_FINITE, "%s=%s (%s)" % [src_name, str(v), why], null, extra)
	return _result(READY, "", v, extra)


# ───────────────────────── INV.equipped → 12 getter 항 ─────────────────────────

func _read_equipped() -> Dictionary:
	var rc := _call_reader(_inventory_reader, "inventory_reader")
	if not bool(rc.ok):
		return rc
	var inv: Variant = rc.value
	if inv == null:
		return _fail("INV_null")
	if not (inv is Dictionary):
		return _fail("INV_unsupported_shape:" + type_string(typeof(inv)))
	var invd: Dictionary = inv
	if not invd.has("equipped"):
		return _fail("INV.equipped_undefined (원 TypeError)")
	var eq: Variant = invd["equipped"]
	if eq == null:
		return _fail("INV.equipped_null (원 TypeError)")
	if not (eq is Dictionary):
		return _fail("INV.equipped_unsupported_shape:" + type_string(typeof(eq)))
	return { "ok": true, "equipped": eq }


## (x().<prop>||0) 의 가산항. 문자열/객체 truthy 는 원에서 문자열 연결/ToPrimitive → 미지원 NOT_READY.
static func _equip_term(v: Variant, label: String) -> Dictionary:
	if not AffixReader.js_truthy(v):
		return { "ok": true, "n": 0.0, "origin": "falsy||0" }
	if v is bool:
		return { "ok": true, "n": 1.0, "origin": "true(+1)" }
	if v is int:
		if not _safe_int(v):
			return _fail(label + "_unsafe_integer")
		return { "ok": true, "n": float(v), "origin": "number" }
	if v is float:
		return { "ok": true, "n": float(v), "origin": "number" }
	if v is String or v is StringName:
		return _fail(label + "_string_concatenation_unsupported")
	return _fail(label + "_object_addition_unsupported:" + type_string(typeof(v)))


## 원 12 getter 순서대로 항 목록. INV 를 이 호출에서 새로 읽는다(캐시 없음).
func _equip_terms(prop: String) -> Dictionary:
	var er := _read_equipped()
	if not bool(er.ok):
		return er
	var equipped: Dictionary = er.equipped
	var terms: Array[float] = []
	var detail: Array = []
	for i in SOURCE_SLOTS.size():
		var slot: String = SOURCE_SLOTS[i]
		var getter: String = SOURCE_GETTERS[i]
		var label := "%s().%s" % [getter, prop]
		var item: Variant = equipped[slot] if equipped.has(slot) else null
		var term: float = 0.0
		var origin: String
		if not AffixReader.js_truthy(item):
			origin = "slot_falsy||{}"
		elif item is Dictionary:
			var itd: Dictionary = item
			if not itd.has(prop):
				origin = "undefined||0"
			else:
				var tr := _equip_term(itd[prop], label)
				if not bool(tr.ok):
					return tr
				term = tr.n
				origin = String(tr.origin)
		elif item is bool or item is int or item is float or item is String or item is StringName or item is Array:
			origin = "non_object_slot.prop=undefined||0"   # 원 primitive/배열의 .stRegen = undefined
		else:
			return _fail("%s()_unsupported_slot_shape:%s" % [getter, type_string(typeof(item))])
		terms.append(term)
		detail.append({ "slot": slot, "getter": getter, "term": term, "origin": origin })
	return { "ok": true, "terms": terms, "detail": detail }


## 0 부터 12항 좌→우 합 (P 기저 미포함 — 완료 natural provider 계약).
func _equip_sum(prop: String) -> Dictionary:
	var src := "Σ12 (x().%s||0)" % prop
	var et := _equip_terms(prop)
	if not bool(et.ok):
		return _result(NOT_READY, String(et.reason), null, { "source": src })
	var acc: float = 0.0
	for t in et.terms:
		acc += t
	var extra := { "source": src, "grouping": "0+t1+…+t12", "terms": et.detail }
	if not is_finite(acc):
		extra["source_value"] = acc
		return _result(SOURCE_NON_FINITE, "%s=%s" % [src, str(acc)], null, extra)
	return _result(READY, "", acc, extra)


# ───────────────────────── 원 순서 pre-holy 율 ─────────────────────────

## (P.<field> + t1 + … + t12) * <mul>()  — 원 좌→우 그대로, _hdMul 미포함.
func _source_rate(field: String, prop: String, key: String, mul_name: String) -> Dictionary:
	var pr := _call_reader(_player_reader, "player_reader")
	if not bool(pr.ok):
		return _result(NOT_READY, String(pr.reason), null)
	var p: Variant = pr.value
	if p == null:
		return _result(NOT_READY, "P_null", null)
	if not (p is Dictionary):
		return _result(NOT_READY, "P_unsupported_shape:" + type_string(typeof(p)), null)
	var pd: Dictionary = p
	if not pd.has(field):
		return _result(NOT_READY, "P.%s_missing" % field, null)
	var b: Variant = pd[field]
	var base: float
	if b is int:
		if not _safe_int(b):
			return _result(NOT_READY, "P.%s_unsafe_integer" % field, null)
		base = float(b)
	elif b is float:
		base = b
	else:
		return _result(NOT_READY, "P.%s_unsupported_type:%s" % [field, type_string(typeof(b))], null)
	var et := _equip_terms(prop)
	if not bool(et.ok):
		return _result(NOT_READY, String(et.reason), null)
	var acc: float = base
	for t in et.terms:
		acc += t
	var m := _passive_mul(key, mul_name)
	if String(m.status) == NOT_READY:
		return _result(NOT_READY, String(m.reason), null)
	# SOURCE_NON_FINITE 배율도 원은 그대로 곱한다 → 결과 비유한으로 귀결
	var mul: float = float(m.value) if bool(m.ready) else float(m.source_value)
	var rate: float = acc * mul
	var extra := { "base": base, "sum_pre_mul": acc, "mul": mul, "mul_status": m.status, "terms": et.detail }
	if not is_finite(rate):
		extra["source_value"] = rate
		var why: String = String(m.reason) if not bool(m.ready) else "sum=%s mul=%s" % [str(acc), str(mul)]
		return _result(SOURCE_NON_FINITE, "pre_holy=%s (%s)" % [str(rate), why], null, extra)
	return _result(READY, "", rate, extra)


# ───────────────────────── public API ─────────────────────────

## 원 pRegenMul(). value float | null.
func read_regen_mul() -> Dictionary:
	return _store(API_REGEN_MUL, _passive_mul(KEY_P_REGEN, "pRegenMul()"))


## 원 pMRegenMul(). value float | null.
func read_mregen_mul() -> Dictionary:
	return _store(API_MREGEN_MUL, _passive_mul(KEY_P_MREGEN, "pMRegenMul()"))


## 원 12항 (x().stRegen||0) 합 (0 시작).
func read_equip_st_regen() -> Dictionary:
	return _store(API_EQUIP_ST_REGEN, _equip_sum(PROP_ST_REGEN))


## 원 12항 (x().mpRegen||0) 합 (0 시작).
func read_equip_mp_regen() -> Dictionary:
	return _store(API_EQUIP_MP_REGEN, _equip_sum(PROP_MP_REGEN))


## 원 순서(_mpr → _str) pre-holy 율. value {"_mpr_pre_holy", "_str_pre_holy"} | null.
## 중앙: _mpr = value._mpr_pre_holy * _hdMul, _str = value._str_pre_holy * _hdMul (원 좌→우 곱과 동일 순서).
## _mpr 가 NOT_READY 면 _str 은 평가하지 않는다(원에서 33353 TypeError 시 33354 미도달).
func read_source_rates() -> Dictionary:
	var mp := _source_rate(FIELD_MP_R, PROP_MP_REGEN, KEY_P_MREGEN, "pMRegenMul()")
	if String(mp.status) == NOT_READY:
		return _store(API_SOURCE_RATES, _result(NOT_READY, "_mpr:" + String(mp.reason), null,
			{ "mp": mp, "st": null, "holy_dome": "external" }))
	var st := _source_rate(FIELD_ST_R, PROP_ST_REGEN, KEY_P_REGEN, "pRegenMul()")
	var status: String = READY
	var reason: String = ""
	if String(mp.status) != READY:
		status = String(mp.status)
		reason = "_mpr:" + String(mp.reason)
	elif String(st.status) != READY:
		status = String(st.status)
		reason = "_str:" + String(st.reason)
	var value: Variant = null
	if status == READY:
		value = { "_mpr_pre_holy": mp.value, "_str_pre_holy": st.value }
	return _store(API_SOURCE_RATES, _result(status, reason, value, { "mp": mp, "st": st, "holy_dome": "external" }))


# ───────────────────────── 완료 natural 용 scalar wrapper ─────────────────────────
## READY → 유한 float, 그 외 → NAN. 완료 resource_regeneration_source 의 _num 유한 가드가
## NAN 을 provider_not_finite_number 로 거부 → dispatch 0. 사유는 last_result(api).

static func _scalar(r: Dictionary) -> float:
	return float(r.value) if String(r.status) == READY else NAN


func regen_mul() -> float:
	return _scalar(read_regen_mul())


func mregen_mul() -> float:
	return _scalar(read_mregen_mul())


func equip_st_regen() -> float:
	return _scalar(read_equip_st_regen())


func equip_mp_regen() -> float:
	return _scalar(read_equip_mp_regen())


## 완료 resource_regeneration_source.configure 의 providers 중 4키. in_holy_dome 은 호출자가 외부 provider 로 추가.
func natural_providers() -> Dictionary:
	return {
		NaturalRegen.PROVIDER_REGEN_MUL: Callable(self, "regen_mul"),
		NaturalRegen.PROVIDER_MREGEN_MUL: Callable(self, "mregen_mul"),
		NaturalRegen.PROVIDER_EQUIP_ST_REGEN: Callable(self, "equip_st_regen"),
		NaturalRegen.PROVIDER_EQUIP_MP_REGEN: Callable(self, "equip_mp_regen"),
	}
