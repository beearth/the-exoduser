extends RefCounted
## IT-05 readonly text model. No UI, RNG, inventory authority or save writes.
## origin/main e556b617 game.html:16625-16626,49822-49847.
## Caller supplies the existing LEGENDARY_SPECIAL/UNIQUE_SPECIAL dictionaries.
const Presentation := preload("res://port_modules/item_presentation_source/producer.gd")
const Coerce := preload("res://port_modules/equipment_affix_reader/producer.gd")
const READY := "READY"
const NOT_READY := "NOT_READY"
const LABELS := ["하옵", "중옵", "상옵"]
const LABEL_COLORS := ["#9a8f80", "#dfd6c2", "#d8b878"]
const PROTOTYPE_KEYS := ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable",
	"toLocaleString", "toString", "valueOf", "__proto__", "__defineGetter__", "__defineSetter__",
	"__lookupGetter__", "__lookupSetter__"]

var _legend_index: Dictionary
var _unique_index: Dictionary
var _translate: Callable
var _format := Presentation.new()
var _coerce := Coerce.new()

func _init(legendary: Variant = null, unique: Variant = null, translate: Callable = Callable()) -> void:
	_legend_index = _index(legendary)
	_unique_index = _index(unique)
	_translate = translate

func legendary_text(special: Variant) -> Dictionary:
	if not Coerce.js_truthy(special):
		return {"status": READY, "ready": true, "text": "", "definition_present": false}
	if not special is Dictionary:
		return _fail("legendary_special_not_dictionary")
	var definition: Dictionary = _definition(special, _legend_index)
	if not definition.ready:
		return definition
	var ko: Variant = definition.record.ko if definition.found else special.get("ko")
	var translated: Dictionary = _text(ko)
	if not translated.ready:
		return translated
	return {"status": READY, "ready": true, "text": translated.value,
		"definition_present": definition.found}

func unique_view(special: Variant) -> Dictionary:
	if not Coerce.js_truthy(special):
		return _view("", "", "", "", false, false)
	if not special is Dictionary:
		return _fail("unique_special_not_dictionary")
	var definition: Dictionary = _definition(special, _unique_index)
	if not definition.ready:
		return definition
	var record: Dictionary = definition.record if definition.found else {}
	# An explicitly present disp (even null/0/false) takes precedence.
	var raw_present: bool = special.has("disp") or special.has("val")
	var raw: Variant = special.get("disp") if special.has("disp") else special.get("val")
	if not _format._scalar_supported(raw):
		return _fail("unsupported_raw_value")
	if not special.has("disp") and Coerce.js_truthy(record.get("scale")):
		var scale: Variant = record.scale
		if not (scale is int or scale is float) or not is_finite(float(scale)):
			return _fail("definition_scale_not_finite_number")
		raw = _format._js_round(_coerce.js_to_number(raw, special.has("val")) / float(scale))
		raw_present = true
	var raw_text: Dictionary = _string(raw, raw_present)
	if not raw_text.ready:
		return raw_text
	# Translate first, then substitute once per literal token, in source order.
	var translated: Dictionary = _text(special.get("ko"))
	if not translated.ready:
		return translated
	var seconds: Dictionary = _string(special.get("secs")) if special.has("secs") else {"ready": true, "value": ""}
	if not seconds.ready:
		return seconds
	var text: String = _replace_first(translated.value, "{s}", seconds.value)
	text = _replace_first(text, "{p}", raw_text.value)
	text = _replace_first(text, "{n}", raw_text.value)
	var label := ""
	var color := ""
	var label_present := false
	var roll: Variant = record.get("roll")
	if Coerce.js_truthy(roll):
		if not roll is Array or roll.size() != 2:
			return _fail("definition_roll_not_pair")
		for bound: Variant in roll:
			if not (bound is int or bound is float) or not is_finite(float(bound)):
				return _fail("definition_roll_bound_not_finite_number")
		if roll[1] > roll[0]:
			var position: float = (_coerce.js_to_number(raw, raw_present) - float(roll[0])) / (float(roll[1]) - float(roll[0]))
			var grade: int = 2 if position >= 2.0 / 3.0 else (1 if position >= 1.0 / 3.0 else 0)
			# JS eagerly evaluates all three _T calls before selecting the label.
			var labels: Array[String] = []
			for source_label: String in LABELS:
				var localized: Dictionary = _text(source_label)
				if not localized.ready:
					return localized
				labels.append(localized.value)
			label = labels[grade]
			color = LABEL_COLORS[grade]
			label_present = true
	return _view(text, raw_text.value, label, color, label_present, definition.found)

func _index(table: Variant) -> Dictionary:
	if not table is Dictionary:
		return _fail("source_special_table_not_dictionary")
	var entries := {}
	for value: Variant in table.values():
		if not value is Dictionary or not value.get("stat") is String or not value.get("ko") is String:
			return _fail("source_special_definition_shape")
		if value.stat in PROTOTYPE_KEYS:
			return _fail("prototype_stat_not_supported")
		entries[value.stat] = value # Source reverse indices are last-wins.
	return {"ready": true, "entries": entries}

func _definition(special: Dictionary, index: Dictionary) -> Dictionary:
	if not index.ready:
		return index.duplicate()
	var stat: Variant = special.get("stat")
	if stat == null:
		return {"ready": true, "found": false}
	if not stat is String:
		return _fail("special_stat_not_string")
	if stat in PROTOTYPE_KEYS:
		return _fail("prototype_stat_not_supported")
	return {"ready": true, "found": index.entries.has(stat), "record": index.entries.get(stat)}

func _text(value: Variant) -> Dictionary:
	if not value is String:
		return _fail("translate_argument_not_string")
	if not _translate.is_valid():
		return _fail("translate_callback_missing")
	var translated: Variant = _translate.call(value)
	return {"ready": true, "value": translated} if translated is String else _fail("translate_callback_non_string")

func _string(value: Variant, present: bool = true) -> Dictionary:
	return _format._scalar_text(value) if present else {"ready": true, "value": "undefined"}

func _replace_first(text: String, token: String, replacement: String) -> String:
	var at := text.find(token)
	if at < 0:
		return text
	var before := text.left(at)
	var after := text.substr(at + token.length())
	var expanded := ""
	var i := 0
	# String.replace's replacement-string substitutions, with no regex captures.
	while i < replacement.length():
		if replacement[i] == "$" and i + 1 < replacement.length():
			var next: String = replacement[i + 1]
			if next in ["$", "&", "`", "'"]:
				match next:
					"$": expanded += "$"
					"&": expanded += token
					"`": expanded += before
					"'": expanded += after
				i += 2
				continue
		expanded += replacement[i]
		i += 1
	return before + expanded + after

func _view(text: String, raw: String, label: String, color: String, labelled: bool, defined: bool) -> Dictionary:
	return {"status": READY, "ready": true, "text": text, "raw_text": raw,
		"label": label, "label_color": color, "label_present": labelled, "definition_present": defined}

func _fail(reason: String) -> Dictionary:
	return {"status": NOT_READY, "ready": false, "reason": reason}
