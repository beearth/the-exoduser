extends RefCounted
## G16213-16246, G16434-16488, G50278-50285. No inventory authority.
const Layout=preload("res://scripts/native_inventory_layout.gd")
const Drop=preload("res://port_modules/kill_reward/drop_item_source.gd")
const Coerce=preload("res://port_modules/equipment_affix_reader/producer.gd")
const Crystal=preload("res://port_modules/player_crystal_resource_source/producer.gd")
const Quality=preload("res://port_modules/item_quality_source/producer.gd")
const WEIGHTS={"enh":80,"itemLv":3,"def":5,"eDef":3,"bonusHp":2,"bonusSt":1.5,"spd":30,"wStagger":2,"wRange":3,"bonusRange":8,"bowRange":2,"bowPierce":150,"stagger":2,"charge":1,"chargeDist":1,"chargeW":0.5,"chargeAoE":2,"bonusChargeDist":8,"chargeCharge":60,"critRate":20,"critDmg":120,"atkSpd":200,"potCd":80,"beamDmg":15,"splashR":3,"splashMul":60,"magicPen":25,"stRegen":150,"mpRegen":400,"bStr":3,"bDex":3,"bInt":3}
static var _affixes: Dictionary={}
static func number(v: Variant) -> float:
	if not Coerce.js_truthy(v): return 0.0
	return float(v) if v is int or v is float or v is bool else Coerce.new().js_to_number(v,true)
static func array_value(item: Dictionary,key: String) -> Array:
	return item[key] if item.get(key) is Array else []
static func supported(item: Dictionary) -> bool:
	for key in WEIGHTS.keys()+["atk","bowSpd","_implicitVal"]:
		var v: Variant=item.get(key)
		if not (v==null or v is int or v is float or v is bool or v is String) or not is_finite(number(v)): return false
	for key in ["affixes","elements","crystals"]:
		if item.get(key)!=null and not item[key] is Array: return false
	for a in array_value(item,"affixes"):
		if not a is Dictionary or not is_finite(number(a.get("value"))) or not is_finite(number(a.get("tier"))): return false
	for e in array_value(item,"elements"):
		if not e is Dictionary or not is_finite(number(e.get("dmg"))): return false
	return true
static func power(item: Dictionary) -> int:
	var n: Callable=func(key): return number(item.get(key))
	if not supported(item): return 0
	var p: float=n.call("enh")*80
	p+=n.call("itemLv")*3
	var speed: float=n.call("spd") if item.get("slot")=="weapon" else (n.call("bowSpd") if item.get("slot")=="bow" else 0.0)
	p+=n.call("atk")*speed*6 if speed>0 else n.call("atk")*6
	p+=n.call("def")*5+n.call("eDef")*3+n.call("bonusHp")*2+n.call("bonusSt")*1.5
	p+=n.call("spd")*30
	p+=n.call("wStagger")*2+n.call("wRange")*3+n.call("bonusRange")*8
	p+=n.call("bowRange")*2+n.call("bowPierce")*150
	p+=n.call("stagger")*2
	p+=n.call("charge")+n.call("chargeDist")+n.call("chargeW")*0.5+n.call("chargeAoE")*2
	p+=n.call("bonusChargeDist")*8+n.call("chargeCharge")*60
	p+=n.call("critRate")*20+n.call("critDmg")*120
	p+=n.call("atkSpd")*200+n.call("potCd")*80
	p+=n.call("beamDmg")*15+n.call("splashR")*3+n.call("splashMul")*60+n.call("magicPen")*25
	for el in array_value(item,"elements"): p+=number(el.get("dmg"))*0.6
	p+=n.call("stRegen")*150+n.call("mpRegen")*400
	p+=n.call("bStr")*3+n.call("bDex")*3+n.call("bInt")*3
	var implicit: float=absf(number(item.get("_implicitVal")))
	p+=implicit*(2 if implicit>1 else 80)
	if _affixes.is_empty():
		for a in Drop.load_tables().AFFIX_POOL: _affixes[a.id]=a
	for a in array_value(item,"affixes"):
		var unit: String=str(_affixes.get(a.get("id"),{}).get("unit","val"))
		p+=absf(number(a.get("value")))*(150 if unit in ["pct","prob"] else (1.5 if unit in ["val","dmg","dps"] else 3.0))+number(a.get("tier"))*15
	if Coerce.js_truthy(item.get("legendarySpecial")): p+=120
	if Coerce.js_truthy(item.get("uniqueSpecial")): p+=200
	var crystal=Crystal.new(); var quality=Quality.new()
	var sockets: Array=array_value(item,"crystals")
	for i in sockets.size():
		if not Coerce.js_truthy(sockets[i]): continue
		var effects: Dictionary=crystal.crystal_effects(sockets[i]); var multiplier: Dictionary=quality.socket(item,i)
		if effects.get("effects") is Array and multiplier.get("ready",false):
			var total: float=0
			for effect in effects.effects: total+=float(effect.value)
			p+=total*2*float(multiplier.multiplier)
	# JS ~~ signed int32, not a CP/damage calculation.
	var integer: int=int(p); var word: int=integer&0xffffffff
	return word-4294967296 if word>=2147483648 else word
static func filtered_indices(bag: Array, filter: Dictionary, category: String="equipment") -> Array:
	var out: Array=[]
	for i in bag.size():
		var it: Variant=bag[i]
		if not it is Dictionary: continue
		if category!="all" and Layout.source_item_category(it)!=category: continue
		if filter.get("slot")!=null and it.get("slot")!=filter.slot and not (filter.slot=="headband" and it.get("slot")=="headband2"): continue
		if filter.get("rarity")!=null and it.get("rarity")!=filter.rarity: continue
		if filter.get("el")!=null and it.get("el")!=filter.el: continue
		out.append(i)
	return out
static func sorted_indices(bag: Array) -> Array:
	var rows: Array=[]
	for i in bag.size(): rows.append({"index":i,"item":bag[i],"power":power(bag[i])})
	rows.sort_custom(func(a,b):
		for key in ["fav","junk"]:
			var av: bool=Coerce.js_truthy(a.item.get(key)); var bv: bool=Coerce.js_truthy(b.item.get(key))
			if av!=bv: return av if key=="fav" else not av
		for key in ["rarity","power","itemLv","enh"]:
			var av: float=a.power if key=="power" else number(a.item.get(key))
			var bv: float=b.power if key=="power" else number(b.item.get(key))
			if av!=bv: return av>bv
		return a.index<b.index)
	return rows.map(func(row): return row.index)
static func arrange(bag: Array, capacity: int) -> void:
	var sorted: Array=[]
	for i in sorted_indices(bag): sorted.append(bag[i])
	bag.assign(sorted)
	for it in bag: it._gx=null; it._gy=null
	var categories: Dictionary={"equipment":{"x":0,"y":0,"h":1},"ossuary":{"x":0,"y":0,"h":1}}
	for it in bag:
		var size: Array=Layout.source_item_size(it); var at: Dictionary=categories[Layout.source_item_category(it)]
		if at.x+size[0]>10: at.y+=at.h; at.x=0; at.h=1
		if at.y+size[1]>Layout.source_inventory_rows(capacity):
			var space: Variant=Layout.find_space(bag,size[0],size[1],-1,it,capacity)
			if space!=null: it._gx=space.x; it._gy=space.y
			continue
		it._gx=at.x; it._gy=at.y; at.h=maxi(at.h,size[1]); at.x+=size[0]
