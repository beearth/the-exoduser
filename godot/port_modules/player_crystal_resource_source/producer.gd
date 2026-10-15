extends RefCounted
##
## player_crystal_resource_source/producer.gd — 원 crystalEffects(cr) (CRYSTAL_DEFS/CRYSTAL_STAR) 정확 포트 +
## player_resource_parameters_source.PROVIDER_CRYSTAL_EFFECTS 조건부 adapter.
## TASK GODOT-PORT-PLAYER-CRYSTAL-RESOURCE-SOURCE-FIRST-20261013
##
## 원 R(canonical game.html, 읽기전용):
##   CRYSTAL_DEFS (@15857-15876): 18 relic. opts=[[stat,base],...] — 작성 순서 = effect 순서 (Object.keys 순 = CRYSTAL_IDS @15926)
##   CRYSTAL_STAR (@15938-15944): [조각 1.0, 파편 2.0, 결정 3.5, 순수결정 6.0, 완전결정 10.0] .mul
##   crystalEffects(cr) (@15951-15956):
##     const d=cr&&CRYSTAL_DEFS[cr.id],s=cr&&CRYSTAL_STAR[cr.star];
##     if(!d||!s)return [];
##     const mul=s.mul*(1+(cr.enh||0)*0.1);
##     return d.opts.map(([stat,base])=>({stat,value:base*mul}));
##   현재 장착 caller applyStats (@28596-28600): SLOT_NAMES 순 INV.equipped[sl].crystals[ci] (truthy) → crystalEffects(c)
##     → _cr[stat]+=value; P._crystalStats=_cr. 순회/합산/sink 는 player_resource_parameters_source 소유 — 재구현 0.
##   자원 소비: mpR @28606, stR @28607, mp @28608 (~~), st recalcSt @16939 (~~)
##   비자원 소비(타 owner, 미설치): hp @28601, atk @28602, def @28603, spd @28604, hpR @28605, crit @28658,
##     cdmg @28659, drop @28660, eDef @44033/@51761, fire/ice/dark/light/holy
##   legacy id 이전 _CR_LEGACY_IDS (@15878, restore @4142 _migrateCr) — restore owner. 미이전 legacy id 는 원처럼 [].
##
## 자체 clock/_process 없음. INV/P/CRYSTAL_BAG 읽기·쓰기 0 — 현재 장착 결정은 SourceParameters 가 현재 INV provider 에서
## 읽어 결정 1개씩 이 adapter 로 넘긴다(authority 준비도 확인 지점 = SourceParameters._read_container/_equipped).
## 원이 [] 를 반환하는 입력은 READY_ORIGINAL_EMPTY + exact reason 으로 구분한다(가짜 [] 아님).
## 원 TypeError / 미지원 JS coercion / 비유한 결과 → provider 는 null → SourceParameters NOT_READY (sink 0).

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")
const SourceParameters := preload("res://port_modules/player_resource_parameters_source/producer.gd")

const READY := "READY"
const READY_ORIGINAL_EMPTY := "READY_ORIGINAL_EMPTY"   # 원 `if(!d||!s)return []` — 유효한 빈 결과
const NOT_READY := "NOT_READY"                          # 미지원 shape/JS coercion — 값 공급 0
const SOURCE_THROW := "SOURCE_THROW"                    # 원 TypeError (d.opts undefined)
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"          # 원식 NaN/±Inf — 엄격 subset 은 공급 0
const SOURCE_TABLE := "SOURCE_TABLE"                    # 원 상수 provenance (현재 장착/인벤토리 아님)

const SOURCE_FN := "game.html:15951-15956 crystalEffects(cr)"

## 원 Object.keys(CRYSTAL_DEFS) 순서 (@15926 CRYSTAL_IDS)
const CRYSTAL_IDS: Array[String] = [
	"cr_blood_oath", "cr_hunter_eye", "cr_ruin_heart", "cr_cinder_crown", "cr_frost_fang", "cr_night_seed",
	"cr_storm_nerve", "cr_dawn_relic", "cr_martyr_tear", "cr_iron_vow", "cr_ward_stone", "cr_ash_wing",
	"cr_living_root", "cr_grave_lantern", "cr_last_breath", "cr_deep_well", "cr_pulse_reed", "cr_oracle_pupil",
]

## 원 CRYSTAL_DEFS 중 crystalEffects 가 읽는 필드(opts) + 분류 cat. 이름/색/slots/sigil/svg/craft 는 이 계산에 쓰이지 않아 미포함.
const CRYSTAL_DEFS := {
	"cr_blood_oath": { "cat": "atk", "opts": [["atk", 1.0], ["crit", 0.06], ["hp", 2.0]] },          # @15858
	"cr_hunter_eye": { "cat": "atk", "opts": [["crit", 0.23], ["cdmg", 0.04], ["drop", 0.04]] },     # @15859
	"cr_ruin_heart": { "cat": "atk", "opts": [["cdmg", 0.1], ["atk", 0.2]] },                        # @15860
	"cr_cinder_crown": { "cat": "atk", "opts": [["fire", 1.2], ["atk", 0.25], ["crit", 0.04]] },     # @15861
	"cr_frost_fang": { "cat": "atk", "opts": [["ice", 1.0], ["stR", 0.03]] },                        # @15862
	"cr_night_seed": { "cat": "atk", "opts": [["dark", 1.2], ["mpR", 0.03]] },                       # @15863
	"cr_storm_nerve": { "cat": "atk", "opts": [["light", 1.5], ["spd", 0.03], ["st", 1.0]] },        # @15864
	"cr_dawn_relic": { "cat": "atk", "opts": [["holy", 1.0], ["hpR", 0.04], ["mp", 1.0]] },          # @15865
	"cr_martyr_tear": { "cat": "def", "opts": [["hp", 8.0], ["hpR", 0.04]] },                        # @15866
	"cr_iron_vow": { "cat": "def", "opts": [["def", 1.0], ["hp", 2.0]] },                            # @15867
	"cr_ward_stone": { "cat": "def", "opts": [["eDef", 0.5], ["def", 0.2], ["mp", 1.0]] },           # @15868
	"cr_ash_wing": { "cat": "def", "opts": [["spd", 0.08], ["st", 1.0]] },                           # @15869
	"cr_living_root": { "cat": "def", "opts": [["hpR", 0.15], ["hp", 3.0], ["def", 0.15]] },         # @15870
	"cr_grave_lantern": { "cat": "def", "opts": [["drop", 0.15], ["eDef", 0.1]] },                   # @15871
	"cr_last_breath": { "cat": "acc", "opts": [["st", 5.0], ["stR", 0.03]] },                        # @15872
	"cr_deep_well": { "cat": "acc", "opts": [["mp", 5.0], ["mpR", 0.03]] },                          # @15873
	"cr_pulse_reed": { "cat": "acc", "opts": [["stR", 0.08], ["st", 1.0], ["spd", 0.02]] },          # @15874
	"cr_oracle_pupil": { "cat": "acc", "opts": [["mpR", 0.08], ["mp", 1.0], ["crit", 0.02]] },       # @15875
}

## 원 CRYSTAL_STAR[i].mul (@15939-15943). index = cr.star
const CRYSTAL_STAR_MUL: Array[float] = [1.0, 2.0, 3.5, 6.0, 10.0]
const ENH_STEP := 0.1   # (1+(cr.enh||0)*0.1)

## SourceParameters 자원 계산이 _crystalStats 에서 읽는 키 → 원 소비식
const RESOURCE_STATS: Array[String] = ["st", "mp", "stR", "mpR"]
const RESOURCE_CONSUMERS := {
	"mpR": "game.html:28606 P.mpR+=_cr.mpR/60",
	"stR": "game.html:28607 P.stR+=_cr.stR/60",
	"mp": "game.html:28608 P.mmp=~~(P.mmp+~~_cr.mp)+...",
	"st": "game.html:16939 P.mst=~~(...+~~(P._crystalStats?P._crystalStats.st:0)+...)",
}

## CRYSTAL_DEFS 는 plain object literal → 없는 키는 Object.prototype 로 올라간다(spec + Annex B 전체).
## 이 키들은 truthy(함수/객체) → s 가 truthy 면 d.opts.map 에서 원 TypeError.
const OBJECT_PROTOTYPE_KEYS: Array[String] = [
	"constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString",
	"valueOf", "__proto__", "__defineGetter__", "__defineSetter__", "__lookupGetter__", "__lookupSetter__",
]
## Array.prototype 에 없음이 확실한 비-index 키 (js_property_key 결과). 그 밖의 비-index 문자열 star 는
## Array.prototype 프로퍼티("length","map"…)일 수 있어 원 결과(NaN mul 등)를 확정할 수 없다 → NOT_READY.
const STAR_NON_PROPERTY_KEYS: Array[String] = ["undefined", "null", "true", "false", "NaN", "Infinity", "-Infinity"]

## 이 모듈이 채우지 않는 실제 authority / 소비자
const MISSING_UPSTREAM := {
	"current_INV": "현재 INV.equipped[*].crystals authority — ITEM/ENGINE (SourceParameters inventory provider 가 확인)",
	"install_sink": "SourceParameters resource_sink 설치 + applyStats/recalcSt 원 call-site 연결 — ENGINE",
	"nonresource_consumers": "_crystalStats hp/atk/def/spd/hpR/crit/cdmg/drop/eDef/fire/ice/dark/light/holy 소비 — 타 owner",
	"legacy_id_migration": "_CR_LEGACY_IDS 이전(@4142) — restore owner. 미이전 legacy id 는 원처럼 []",
}

const CALL_LOG_MAX := 64

var _coerce: AffixReader = AffixReader.new()   # JS ToNumber 재사용 (inventory 미바인딩 — 계산 전용)
var _call_count: int = 0
var _call_log: Array[Dictionary] = []
var _last: Dictionary = {}


# ───────────────────────── provenance / support readiness ─────────────────────────

## 원 상수 provenance. 현재 장착/인벤토리/bag 준비도가 아니다.
static func source_tables() -> Dictionary:
	return {
		"status": SOURCE_TABLE, "current": false,
		"source": { "defs": "game.html:15857-15876", "ids": "game.html:15926", "star": "game.html:15938-15944", "fn": SOURCE_FN },
		"ids": CRYSTAL_IDS.duplicate(), "defs": CRYSTAL_DEFS.duplicate(true), "star_mul": CRYSTAL_STAR_MUL.duplicate(),
	}


## 포트된 원 테이블의 정합성(값 호출 없음). 모든 opts stat 이 SourceParameters _cr 초기 키여야 원 합산(undefined+value 아님)과 같다.
static func support_readiness() -> Dictionary:
	var missing: Array[String] = []
	if CRYSTAL_IDS.size() != 18 or CRYSTAL_DEFS.size() != 18:
		missing.append("crystal_defs_count")
	var keys: Array = CRYSTAL_DEFS.keys()
	for i in CRYSTAL_IDS.size():
		if i >= keys.size() or str(keys[i]) != CRYSTAL_IDS[i]:
			missing.append("crystal_ids_order:" + CRYSTAL_IDS[i])
			continue
		var def: Dictionary = CRYSTAL_DEFS[CRYSTAL_IDS[i]]
		var opts: Array = def.get("opts", [])
		if opts.is_empty():
			missing.append("opts_empty:" + CRYSTAL_IDS[i])
		for o: Variant in opts:
			var pair: Array = o
			if pair.size() != 2 or not (pair[0] is String) or not (pair[1] is float):
				missing.append("opt_shape:" + CRYSTAL_IDS[i])
			elif not SourceParameters.CR_INIT_KEYS.has(str(pair[0])):
				missing.append("opt_stat_not_in_cr_init:" + CRYSTAL_IDS[i] + "." + str(pair[0]))
	if CRYSTAL_STAR_MUL.size() != 5:
		missing.append("crystal_star_count")
	return {
		"ready": missing.is_empty(), "status": READY if missing.is_empty() else NOT_READY,
		"missing": missing, "missing_upstream": MISSING_UPSTREAM.duplicate(),
	}


# ───────────────────────── JS lookup helpers ─────────────────────────

static func _prop_has(o: Variant, key: String) -> bool:
	if o is Dictionary:
		var d: Dictionary = o
		return d.has(key)
	return false   # primitive/배열의 .id/.star/.enh = undefined


static func _prop_val(o: Variant, key: String) -> Variant:
	if o is Dictionary:
		var d: Dictionary = o
		return d.get(key, null)
	return null


## CRYSTAL_DEFS[cr.id] → {state: own|proto|undefined|unsupported, key}
static func _def_lookup(v: Variant, present: bool) -> Dictionary:
	var key: Variant = AffixReader.js_property_key(v, present)
	if not (key is String):
		if v is int or v is float:
			return { "state": "undefined", "key": str(v) }   # 비정수/2^53 초과 숫자 키: 자체·prototype 키 아님
		return { "state": "unsupported", "key": type_string(typeof(v)) }
	var k: String = key
	if CRYSTAL_DEFS.has(k):
		return { "state": "own", "key": k }
	if OBJECT_PROTOTYPE_KEYS.has(k):
		return { "state": "proto", "key": k }
	return { "state": "undefined", "key": k }


static func _is_digits(s: String) -> bool:
	if s.is_empty():
		return false
	for i in s.length():
		var c: int = s.unicode_at(i)
		if c < 0x30 or c > 0x39:
			return false
	return true


## CRYSTAL_STAR[cr.star] → {state: own|undefined|unsupported, key, index}
static func _star_lookup(v: Variant, present: bool) -> Dictionary:
	var key: Variant = AffixReader.js_property_key(v, present)
	if not (key is String):
		if v is int or v is float:
			return { "state": "undefined", "key": str(v), "index": -1 }   # 비정수 숫자 키 → 배열 index/prototype 아님
		return { "state": "unsupported", "key": type_string(typeof(v)), "index": -1 }
	var k: String = key
	if _is_digits(k) and (k.length() == 1 or k.unicode_at(0) != 0x30):   # canonical array index
		if k.length() == 1 and k.to_int() < CRYSTAL_STAR_MUL.size():
			return { "state": "own", "key": k, "index": k.to_int() }
		return { "state": "undefined", "key": k, "index": -1 }
	if STAR_NON_PROPERTY_KEYS.has(k) or (k.begins_with("-") and _is_digits(k.substr(1))):
		return { "state": "undefined", "key": k, "index": -1 }
	return { "state": "unsupported", "key": k, "index": -1 }


func _result(status: String, reason: String, effects: Variant, extra: Dictionary) -> Dictionary:
	var out := {
		"status": status, "ready": status == READY or status == READY_ORIGINAL_EMPTY,
		"reason": reason, "effects": effects, "source": SOURCE_FN,
	}
	out.merge(extra, true)
	return out


static func _split_effects(effects: Array) -> Dictionary:
	var res: Array = []
	var non: Array = []
	for e: Variant in effects:
		var ed: Dictionary = e
		if RESOURCE_STATS.has(str(ed["stat"])):
			res.append(ed.duplicate())
		else:
			non.append(ed.duplicate())
	return { "resource_effects": res, "nonresource_effects": non }


# ───────────────────────── 원 crystalEffects(cr) ─────────────────────────

## 순수 계산. 반환 {status, ready, reason, effects, id, star, enh, star_mul, mul, resource_effects, nonresource_effects}.
##   READY                : 원 d.opts.map 결과 (전 stat, 원 순서) — effects Array
##   READY_ORIGINAL_EMPTY : 원 [] (cr falsy / id 미등록 / star 미등록) — effects [] + reason
##   SOURCE_THROW         : id 가 Object.prototype 키 + star 유효 → 원 TypeError — effects null
##   NOT_READY            : 원 결과를 확정할 수 없는 JS coercion shape — effects null
##   SOURCE_NON_FINITE    : 원 값 NaN/±Inf (예 enh "abc") — effects null, diagnostic_effects 만
func crystal_effects(cr: Variant) -> Dictionary:
	if not AffixReader.js_truthy(cr):
		return _result(READY_ORIGINAL_EMPTY, "cr_falsy", [], {})
	if cr is Object:
		return _result(NOT_READY, "unsupported_cr_shape:Object", null, {})
	var d: Dictionary = _def_lookup(_prop_val(cr, "id"), _prop_has(cr, "id"))
	var s: Dictionary = _star_lookup(_prop_val(cr, "star"), _prop_has(cr, "star"))
	var keys := { "id": d["key"], "star": s["key"] }
	# if(!d||!s)return [] — 한쪽이라도 확정 undefined 면 다른 쪽 shape 과 무관하게 []
	if str(d["state"]) == "undefined":
		return _result(READY_ORIGINAL_EMPTY, "id_not_in_CRYSTAL_DEFS:" + str(d["key"]), [], keys)
	if str(s["state"]) == "undefined":
		return _result(READY_ORIGINAL_EMPTY, "star_not_in_CRYSTAL_STAR:" + str(s["key"]), [], keys)
	if str(d["state"]) == "unsupported":
		return _result(NOT_READY, "unsupported_id_key:" + str(d["key"]), null, keys)
	if str(s["state"]) == "unsupported":
		return _result(NOT_READY, "unsupported_star_key:" + str(s["key"]), null, keys)
	if str(d["state"]) == "proto":
		return _result(SOURCE_THROW, "TypeError: Cannot read properties of undefined (reading 'map') @CRYSTAL_DEFS['%s'].opts" % str(d["key"]), null, keys)
	# const mul=s.mul*(1+(cr.enh||0)*0.1)
	var enh_raw: Variant = _prop_val(cr, "enh")
	var enh_n: float = 0.0
	if AffixReader.js_truthy(enh_raw):
		if enh_raw is Object:
			return _result(NOT_READY, "unsupported_enh_shape:Object", null, keys)
		enh_n = _coerce.js_to_number(enh_raw, true)
	var star_mul: float = CRYSTAL_STAR_MUL[int(s["index"])]
	var mul: float = star_mul * (1.0 + enh_n * ENH_STEP)
	# d.opts.map(([stat,base])=>({stat,value:base*mul}))
	var def: Dictionary = CRYSTAL_DEFS[str(d["key"])]
	var opts: Array = def["opts"]
	var effects: Array = []
	var non_finite: bool = false
	for o: Variant in opts:
		var pair: Array = o
		var base: float = pair[1]
		var value: float = base * mul
		if is_nan(value) or is_inf(value):
			non_finite = true
		effects.append({ "stat": str(pair[0]), "value": value })
	var extra := { "id": d["key"], "star": s["key"], "enh": enh_n, "star_mul": star_mul, "mul": mul, "cat": def["cat"] }
	if non_finite:
		extra["diagnostic_effects"] = effects
		return _result(SOURCE_NON_FINITE, "computed_non_finite:mul=" + str(mul), null, extra)
	extra.merge(_split_effects(effects), true)
	return _result(READY, "", effects, extra)


# ───────────────────────── SourceParameters PROVIDER_CRYSTAL_EFFECTS adapter ─────────────────────────

## (crystal) -> Array[{stat,value}] | null. READY/READY_ORIGINAL_EMPTY 만 Array (원 전체 effect, 필터 0).
## 그 밖은 null → SourceParameters `crystal_effects_not_array` NOT_READY (packet null, sink 0).
func provide_crystal_effects(cr: Variant) -> Variant:
	var r: Dictionary = crystal_effects(cr)
	_call_count += 1
	_last = r
	_call_log.append({
		"status": r["status"], "reason": r["reason"], "id": r.get("id", null), "star": r.get("star", null),
		"effects": (r["effects"] as Array).duplicate(true) if r["effects"] is Array else null,
	})
	if _call_log.size() > CALL_LOG_MAX:
		_call_log.pop_front()
	if bool(r["ready"]):
		var effs: Array = r["effects"]
		return effs.duplicate(true)
	return null


## 지원 테이블 READY 일 때만 Callable, 아니면 null (SourceParameters 에 넣지 말 것 → conditional NOT_READY).
func crystal_effects_provider() -> Variant:
	if not bool(support_readiness()["ready"]):
		return null
	return Callable(self, "provide_crystal_effects")


## 호출자 providers 복사본에 PROVIDER_CRYSTAL_EFFECTS 만 추가(원본 수정 0). 기존 provider 덮어쓰기 거부.
func with_crystal_effects_provider(providers: Dictionary) -> Dictionary:
	if providers.has(SourceParameters.PROVIDER_CRYSTAL_EFFECTS):
		return { "ok": false, "reason": "crystal_effects_provider_already_bound", "providers": providers.duplicate() }
	var p: Variant = crystal_effects_provider()
	if not (p is Callable):
		return { "ok": false, "reason": "crystal_support_not_ready", "providers": providers.duplicate() }
	var out: Dictionary = providers.duplicate()
	out[SourceParameters.PROVIDER_CRYSTAL_EFFECTS] = p
	return { "ok": true, "reason": "", "providers": out }


func call_count() -> int:
	return _call_count


## 최근 CALL_LOG_MAX 개 호출 (SourceParameters 가 넘긴 현재 장착 결정 순서 = 원 SLOT_NAMES/ci 순서).
func call_log() -> Array[Dictionary]:
	return _call_log.duplicate(true)


func clear_call_log() -> void:
	_call_log.clear()
	_call_count = 0
	_last = {}


func last_result() -> Dictionary:
	return _last.duplicate(true)
