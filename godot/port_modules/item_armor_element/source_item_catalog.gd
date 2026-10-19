extends RefCounted
## Source-owned lookup tables; no item generation, stat application or save I/O.
const SLOT_NAMES: Array = ["weapon","shield","boots","armor","helmet","bow","gloves","pants","belt","necklace","ring1","ring2","cape","bracelet","headband","ossuary","headband2"]
const SLOT_EMOJI: Array = ["⚔️","🛡️","👢","🦺","⛑️","🏹","🧤","👖","🪢","📿","💍","💍","🧣","⭕","🎀","⚱️","🎀"]
const RARITY_MUL: Array = [1.0,1.2,1.5,1.8,2.2,2.5]
const WTYPES: Dictionary = {
	"sword":{"name":"검","emoji":"⚔️","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"dagger":{"name":"단검","emoji":"🗡️","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"hammer":{"name":"해머","emoji":"🔨","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"mace":{"name":"메이스","emoji":"⚔️","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"club":{"name":"곤봉","emoji":"⚔️","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"axe":{"name":"도끼","emoji":"🪓","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8},
	"spear":{"name":"창","emoji":"⚔️","atkMul":1.0,"stCost":5,"spdMul":0.45,"arcW":0.95,"range":50,"stagger":8}
}
const BOWTYPES: Dictionary = {
	"crossbow":{"name":"석궁","emoji":"⚙️","atkMul":1.0,"stCost":5,"spdMul":1.0,"range":800,"projSpd":22},
	"repeater":{"name":"연사석궁","emoji":"⚡","atkMul":0.65,"stCost":5,"spdMul":1.5,"range":700,"projSpd":22},
	"arcane":{"name":"마력석궁","emoji":"✨","atkMul":1.4,"stCost":5,"spdMul":0.8,"range":840,"projSpd":22}
}
const WP_MOD: Dictionary = {
	"0":["녹슨","강철","흑요석","심판의","천벌의"],
	"1":["불꽃","화염","염화","지옥불","멸화의"],
	"2":["냉기","빙결","빙하","서리의","영겁빙"],
	"3":["그림자","암흑","심연","나락의","무간의"],
	"4":["전기","낙뢰","암전","뇌신의","만뢰의"]
}

var _language_reader: Callable
var _translator: Callable
var last_status: String = "ready"

func configure_language(language_reader: Callable, translator: Callable = Callable()) -> bool:
	if not language_reader.is_valid():
		return false
	_language_reader = language_reader
	_translator = translator
	return true

func get_slot_names() -> Array:
	return SLOT_NAMES.duplicate()

func get_slot_emoji() -> Array:
	return SLOT_EMOJI.duplicate()

func weapon_exists(key: Variant) -> bool:
	return key is String and WTYPES.has(key)

func bow_exists(key: Variant) -> bool:
	return key is String and BOWTYPES.has(key)

func weapon_definition(key: Variant) -> Variant:
	return WTYPES[key].duplicate(true) if weapon_exists(key) else null

func bow_definition(key: Variant) -> Variant:
	return BOWTYPES[key].duplicate(true) if bow_exists(key) else null

func _property_key(value: Variant) -> String:
	if value is String:
		return value
	if (value is int or value is float) and is_finite(float(value)) and float(value) == floor(float(value)):
		return str(int(value))
	return ""

func rarity_mul(key: Variant) -> Variant:
	var property: String = _property_key(key)
	for index in range(RARITY_MUL.size()):
		if property == str(index):
			return RARITY_MUL[index]
	return null # Source missing indexed value; BUILD keeps its own ||1 fallback.

func weapon_name(key: Variant, element: Variant, tier: Variant) -> Variant:
	if not weapon_exists(key):
		return _unknown_weapon_name()
	var modifiers: Array = WP_MOD.get(_property_key(element), WP_MOD["0"])
	var number: float = 0.0
	if tier is int or tier is float:
		number = float(tier)
	elif tier is String:
		number = tier.to_float() if tier.is_valid_float() else NAN
	elif tier is bool:
		number = 1.0 if tier else 0.0
	elif tier != null:
		last_status = "unsupported_tier_shape"
		return null
	var limited: float = minf(number, 4.0)
	var index: int = int(limited) if is_finite(limited) and limited >= 0.0 and limited == floor(limited) else 0
	last_status = "ready"
	return str(modifiers[index]) + " " + str(WTYPES[key].name)

func _unknown_weapon_name() -> Variant:
	if not _language_reader.is_valid():
		last_status = "missing_language_reader"
		return null
	var language: Variant = _language_reader.call()
	if not language is String:
		last_status = "invalid_language_reader"
		return null
	if language == "ko":
		last_status = "ready"
		return "무기"
	if not _translator.is_valid():
		last_status = "missing_translation_reader"
		return null
	var translated: Variant = _translator.call("무기")
	if not translated is String:
		last_status = "invalid_translation_reader"
		return null
	last_status = "ready"
	return "Weapon" if translated == "무기" else translated

func restore_providers(storage_items: Array) -> Dictionary:
	return {"slot_names":get_slot_names(),"slot_emoji":get_slot_emoji(),"storage_items":storage_items,"bow_exists":bow_exists,"rarity_mul":rarity_mul,"weapon_exists":weapon_exists,"weapon_name":weapon_name}
