extends RefCounted
## Current normal auto-crossbow parameters, R game.html 17446/28703/35139.
## No item/default equipment creation, state mutation, RNG, clock or rendering.
const Formula = preload("res://port_modules/combat_stat_formula/producer.gd")
const BOW_TYPES := {
	"crossbow":{"range":800.0,"speed":22.0,"attack":1.0},
	"repeater":{"range":700.0,"speed":22.0,"attack":0.65},
	"arcane":{"range":840.0,"speed":22.0,"attack":1.4}}
var _bundle: Dictionary = {}

func configure(bundle: Dictionary) -> bool:
	if not _bundle.is_empty():return false
	for key in ["current_p","current_passives","current_inventory","current_g"]:
		if not bundle.get(key) is Callable or not bundle[key].is_valid():return false
	for key in ["reference","formula","affix"]:
		if not is_instance_valid(bundle.get(key)):return false
	_bundle=bundle
	return true

func read_parameters() -> Dictionary:
	if _bundle.is_empty():return _missing("current_source_bundle_unbound")
	for key in ["current_p","current_passives","current_inventory","current_g"]:
		if not _bundle[key].is_valid():return _missing("current_source_reader_lost:"+key)
	var p: Variant = _bundle.current_p.call()
	var passives: Variant = _bundle.current_passives.call()
	var inv: Variant = _bundle.current_inventory.call()
	var g: Variant = _bundle.current_g.call()
	if not p is Dictionary or not p.get("skills") is Dictionary or not passives is Dictionary or not inv is Dictionary or not inv.get("equipped") is Dictionary or not g is Dictionary:
		return _missing("current_source_domains_not_ready")
	# The source update requires an actual equipped bow, before bw() fallbacks.
	var bow: Variant=inv.equipped.get("bow")
	if not bow is Dictionary or bow.is_empty():return _missing("actual_equipped_bow_missing")
	var skill: Variant=p.get("activeBowSk")
	if not _truthy(skill):skill="normal"
	if skill not in ["normal","ghostXbowTurret"]:return _missing("non_normal_bow_skill")
	var pets: Variant=g.get("pets")
	if _truthy(pets) and (not pets is Dictionary or _truthy(pets.get("xbow"))):
		return _missing("pet_crossbow_origin_unported")
	# Extra legendary arrows and on-hit unique fragments need their own consumers.
	for item in inv.equipped.values():
		if not item is Dictionary:continue
		for key in ["_lBowCrit","_uBowPoisonRicochet"]:
			var value: float=_or_number(item.get(key),0.0)
			if not is_finite(value) or value>0.0:return _missing("special_bow_effect_unported:"+key)
	var ref: Dictionary=_bundle.reference.bow_ref()
	var bow_mul: Dictionary=_bundle.formula.pass_dmg_sum("bow")
	var xbow_mul: Dictionary=_bundle.formula.pass_dmg_sum("xbow")
	var discount: Dictionary=_bundle.affix.eq_affix("stCostRed")
	for value in [ref,bow_mul,xbow_mul,discount]:
		if value.get("status")!="READY" or not _number(value.get("value")) or not is_finite(float(value.value)):
			return _missing("current_bow_stats_not_ready")
	var kind: Variant=bow.get("btype")
	if not _truthy(kind):kind="crossbow"
	var type: Dictionary=BOW_TYPES.get(kind,BOW_TYPES.crossbow) if kind is String else BOW_TYPES.crossbow
	var range_base: float=maxf(_or_number(bow.get("bowRange"),0.0),float(type.range))
	var range_mul: float=1.0+_source_number(passives,"pBow")*0.08
	var distance: float=maxf(220.0,(range_base+_or_number(bow.get("bonusRange"),0.0)*12.0)*range_mul)
	var speed: float=_or_number(bow.get("bowProjSpd"),float(type.speed))
	var interval_speed: float=_or_number(bow.get("bowSpd"),1.0)*(1.0+_or_number(passives.get("pXbow"),0.0)*0.05)
	var cost: float=(1.5+_or_number(p.skills.get("fanShot"),0.0)*1.5)*maxf(0.60,1.0-_source_number(passives,"pBow")*0.04)*(1.0+minf(0.0,float(discount.value)))
	var raw_damage: float=float(ref.value)*float(bow_mul.value)*float(xbow_mul.value)*float(type.attack)+28.0
	var element: float=_or_number(bow.get("el"),0.0)
	for value in [range_base,range_mul,distance,speed,interval_speed,cost,raw_damage,element]:
		if not is_finite(value):return _missing("nonfinite_bow_scalar")
	if speed<=0.0 or interval_speed<=0.0 or element<0.0 or element>6.0 or element!=floor(element):
		return _missing("unsupported_bow_scalar_domain")
	return {"ready":true,"scope":"NORMAL_AUTO_CROSSBOW_PARAMETERS",
		"range":distance,"speed":speed,"interval":120.0/interval_speed,
		"damage":Formula.js_to_int32(raw_damage)*3,"element":int(element),
		"cost":cost,"radius":3.0,"spawn_offset":10.0,
		"pierce":0.0,"pierce_max":0,"normalBow":true,"ghostXbow":true}

func _truthy(value: Variant) -> bool:
	return _bundle.affix.js_truthy(value)

func _or_number(value: Variant, alternative: float) -> float:
	return _bundle.affix.js_to_number(value if _truthy(value) else alternative,true)

func _source_number(container: Dictionary,key: String) -> float:
	return _bundle.affix.js_to_number(container.get(key),container.has(key))

static func _number(value: Variant) -> bool:
	return value is int or value is float

static func _missing(reason: String) -> Dictionary:
	return {"ready":false,"scope":"NORMAL_AUTO_CROSSBOW_PARAMETERS","reason":reason}
