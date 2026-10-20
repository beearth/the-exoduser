extends RefCounted
## 원 _autoBowSpec()의 순수 계산만 공급한다. caller는 이미 bw()의 effective
## 현재 장비 Dictionary와 현재 PASSIVES를 확보해야 한다. INV 권위 획득/쓰기,
## 발사/물리/자원/clock/RNG/입력/Q/E/저장 연결은 이 모듈 밖이다.
##
## 기준: c3cf8ce6b0cc1a5c381240260e03dff71c68af8d game.html
##   _autoBowSpec @17451–17457, pBowRange @28044,
##   BOWTYPES @15886–15890 (기존 source_item_catalog.bow_definition 재사용).
## raw 결과는 원본처럼 유지한다. READY도 다음 발사 consumer의 준비를 뜻하지 않는다.

const AffixReader := preload("res://port_modules/equipment_affix_reader/producer.gd")

const READY := "READY"
const NOT_READY := "NOT_READY"
const SOURCE_NON_FINITE := "SOURCE_NON_FINITE"
const SOURCE_RAW_SPEED := "SOURCE_RAW_SPEED"
const SOURCE_UNSUPPORTED := "SOURCE_UNSUPPORTED"

const SOURCE := {
	"base_sha": "c3cf8ce6b0cc1a5c381240260e03dff71c68af8d",
	"file": "game.html",
	"function": "_autoBowSpec",
	"lines": [17451, 17457],
	"passive_function": "pBowRange",
	"passive_line": 28044,
	"catalog_lines": [15886, 15890],
	"catalog_provider": "godot/port_modules/item_armor_element/source_item_catalog.gd::bow_definition",
	"coercion_provider": "godot/port_modules/equipment_affix_reader/producer.gd",
}

## JS Object.prototype 상속 조회를 ordinary unknown으로 위장하지 않는다.
const UNSUPPORTED_PROTOTYPE_KEYS: Array[String] = [
	"__proto__", "constructor", "__defineGetter__", "__defineSetter__",
	"hasOwnProperty", "__lookupGetter__", "__lookupSetter__", "isPrototypeOf",
	"propertyIsEnumerable", "toString", "valueOf", "toLocaleString",
]

var _coerce: AffixReader = AffixReader.new() # 숫자 변환만 사용. INV reader/어픽스 캐시 바인딩 0.

## receipt 기본키: status/range/spd/catalog_key/catalog_fallback/input_presence/source/reason.
## range/raw_range는 최종 원 숫자 결과, spd/raw_spd는 OR가 선택한 원 Variant다.
## SOURCE_UNSUPPORTED/NOT_READY는 계산 결과를 날조하지 않아 네 값 모두 null이다.
func evaluate(bow: Dictionary, passives: Dictionary, catalog: RefCounted) -> Dictionary:
	var presence := {
		"btype": bow.has("btype"),
		"bowRange": bow.has("bowRange"),
		"bonusRange": bow.has("bonusRange"),
		"bowProjSpd": bow.has("bowProjSpd"),
		"pBow": passives.has("pBow"),
	}
	var raw := {
		"btype": bow.get("btype"),
		"bowRange": bow.get("bowRange"),
		"bonusRange": bow.get("bonusRange"),
		"bowProjSpd": bow.get("bowProjSpd"),
		"pBow": passives.get("pBow"),
	}
	var r := {
		"status": NOT_READY,
		"reason": "",
		"range": null,
		"spd": null,
		"raw_range": null,
		"raw_spd": null,
		"catalog_key": null,
		"catalog_fallback": false,
		"btype_fallback": false,
		"selected_btype": null,
		"requested_catalog_key": null,
		"input_presence": presence,
		"raw_input": raw,
		"source": SOURCE.duplicate(true),
		"calculation": {},
		"non_finite_fields": [],
	}
	if catalog == null:
		return _finish(r, NOT_READY, "catalog_null")
	if not catalog.has_method("bow_definition"):
		return _finish(r, NOT_READY, "catalog_bow_definition_missing")

	# b.btype || 'crossbow'를 먼저 선택하고 그 결과의 JS property key를 구한다.
	r.btype_fallback = not AffixReader.js_truthy(raw.btype)
	var selected_btype: Variant = "crossbow" if r.btype_fallback else raw.btype
	r.selected_btype = selected_btype
	var key: Variant = AffixReader.js_property_key(selected_btype, true)
	if key == null:
		return _finish(r, SOURCE_UNSUPPORTED, "unsupported_btype_property_key")
	r.requested_catalog_key = key
	if key in UNSUPPORTED_PROTOTYPE_KEYS:
		return _finish(r, SOURCE_UNSUPPORTED, "unsupported_btype_prototype_key:" + key)

	# canonical provider는 unknown key에만 null을 반환한다. 비Dictionary는 계약 오류다.
	var definition: Variant = catalog.call("bow_definition", key)
	if definition == null:
		r.catalog_fallback = true
		key = "crossbow"
		definition = catalog.call("bow_definition", key)
	if not definition is Dictionary:
		return _finish(r, NOT_READY, "catalog_definition_not_dictionary:" + String(key))
	r.catalog_key = key
	var brd: Dictionary = definition

	# JS ||의 선택과 ToNumber를 분리한다. []/{}는 빈 값이어도 truthy다.
	var bow_range_raw: Variant = _js_or(raw.bowRange, 0)
	var catalog_range_raw: Variant = _js_or(brd.get("range"), 1000)
	var bonus_range_raw: Variant = _js_or(raw.bonusRange, 0)
	for entry in [
		["bowRange", bow_range_raw], ["catalog.range", catalog_range_raw],
		["bonusRange", bonus_range_raw], ["pBow", raw.pBow],
	]:
		if not _numeric_carrier_supported(entry[1]):
			return _finish(r, SOURCE_UNSUPPORTED, "unsupported_numeric_carrier:" + entry[0])

	var bow_range: float = _coerce.js_to_number(bow_range_raw, true)
	var catalog_range: float = _coerce.js_to_number(catalog_range_raw, true)
	var bonus_range: float = _coerce.js_to_number(bonus_range_raw, true)
	var p_bow: float = _coerce.js_to_number(raw.pBow, presence.pBow)
	var base_range: float = _js_math_max(bow_range, catalog_range)
	var p_bow_range: float = 1.0 + p_bow * 0.08
	var before_minimum: float = (base_range + bonus_range * 12.0) * p_bow_range
	var source_range: float = _js_math_max(220.0, before_minimum)
	var source_spd: Variant = _js_or(raw.bowProjSpd, _js_or(brd.get("projSpd"), 13))
	r.range = source_range
	r.spd = source_spd
	r.raw_range = source_range
	r.raw_spd = source_spd
	r.calculation = {
		"bow_range_or": bow_range_raw,
		"catalog_range_or": catalog_range_raw,
		"bonus_range_or": bonus_range_raw,
		"bow_range_number": bow_range,
		"catalog_range_number": catalog_range,
		"bonus_range_number": bonus_range,
		"p_bow_number": p_bow,
		"base_range": base_range,
		"p_bow_range": p_bow_range,
		"range_before_minimum": before_minimum,
	}
	if not is_finite(source_range):
		r.non_finite_fields.append("range")
	var numeric_speed: bool = source_spd is int or source_spd is float
	if numeric_speed and not is_finite(float(source_spd)):
		r.non_finite_fields.append("spd")
	# 비숫자 speed는 원 Variant를 보존한다. range도 비유한이면 배열에 별도 기록한다.
	if not numeric_speed:
		return _finish(r, SOURCE_RAW_SPEED, "spd_not_number")
	if not r.non_finite_fields.is_empty():
		return _finish(r, SOURCE_NON_FINITE, "source_non_finite_number")
	return _finish(r, READY, "")

static func _js_or(lhs: Variant, rhs: Variant) -> Variant:
	return lhs if AffixReader.js_truthy(lhs) else rhs

## Math.max는 인수 어느 쪽이 NaN이어도 NaN이다. maxf의 NaN 처리에 의존하지 않는다.
static func _js_math_max(lhs: float, rhs: float) -> float:
	if is_nan(lhs) or is_nan(rhs):
		return NAN
	return maxf(lhs, rhs)

## 기존 js_to_number의 plain JSON carrier 범위만 사용한다. 사용자 converter를 가진
## 객체와 Godot 전용 carrier는 JS 동등성을 단정하지 않는다. raw speed에는 숫자화가 없다.
static func _numeric_carrier_supported(value: Variant) -> bool:
	return _numeric_carrier_supported_path(value, [])

static func _numeric_carrier_supported_path(value: Variant, visited: Array) -> bool:
	if value == null or value is bool or value is int or value is float \
		or value is String or value is StringName:
		return true
	if value is Dictionary:
		return not value.has("valueOf") and not value.has("toString") and not value.has("__proto__")
	if value is Array:
		# helper가 ToNumber를 재귀 호출하는 singleton 경로만 검사한다.
		# 순환 Array는 plain JSON 밖이며 helper 재귀에 전달하면 stack 오류가 난다.
		if value.size() != 1:
			return true
		for previous in visited:
			if is_same(value, previous):
				return false
		visited.append(value)
		return _numeric_carrier_supported_path(value[0], visited)
	return false

static func _finish(receipt: Dictionary, status: String, reason: String) -> Dictionary:
	receipt.status = status
	receipt.reason = reason
	return receipt
