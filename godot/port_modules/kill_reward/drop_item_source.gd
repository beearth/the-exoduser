extends RefCounted
## P2-001c — 처치 드랍/아이템 생성 원본 포트 (game.html 기준 행 주석).
##   rollDrop(32002~32077) / mkItem(15894~16166) / rollAffixes(15131~15174) /
##   mkSocketStone·_stoneTierRoll(15336~15346) / mkBonePart(45788~) / _qRoll(15304).
## 원칙:
##  - RNG는 주입된 Callable(rng)로만 소비 — 호출 순서·횟수는 원본 문장 순서 그대로.
##    (mkItem의 base 테이블(15930~)은 JS 객체 리터럴이라 "모든 슬롯"의 랜덤 필드가
##    프로퍼티 순서대로 평가된다 — 그 순서를 그대로 재현한다.)
##  - 테이블(AFFIX_POOL 409종 등)은 node로 원본 리터럴을 평가해 추출한
##    res://data/item_generation_tables.json — 수기 전사 없음.
##  - 바닥 드랍 표시는 범위 밖: 레코드(worldItems 상당)만 생성해 돌려준다.
##  - rarity 5(유니크, 가중치 0.01/100.04)는 외관/특수효과 테이블까지 포함해 이식.
## rng.call(tag)가 null을 돌려주면 즉시 중단(null 반환) — 폴백 없음.

const TABLES_PATH := "res://data/item_generation_tables.json"
const EL_P := 0

static var _tables: Dictionary = {}

static func load_tables() -> Dictionary:
	if _tables.is_empty():
		var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string(TABLES_PATH))
		if parsed is Dictionary:
			_tables = parsed
	return _tables

var rng: Callable
var aborted := false
# DEMO11-29 opt-in only; existing full-build callers unchanged. G15137/16650.
var demo_mode := false
const DEMO_BANNED=["sharpAtk","brutalAtk","ruinAtk","overkilDmg","staggerExplosion","parryExplosion","elemConvert"]

func _init(random_source: Callable) -> void:
	rng = random_source

func _r(tag: String) -> float:
	if aborted:
		return 0.0
	var value: Variant = rng.call(tag)
	if not (value is int or value is float):
		aborted = true
		return 0.0
	return float(value)

static func _i32(v: float) -> int: # JS ~~
	return int(v)

static func _fixed(v: float, digits: int) -> float: # JS toFixed
	var scale: float = pow(10.0, digits)
	return floor(v * scale + 0.5) / scale

# ── rollAffixes(grade, slot, brType) — 15131~15174 ──
func roll_affixes(grade: int, slot: String, br_type: Variant, plv: int) -> Array:
	var t: Dictionary = load_tables()
	var a_slot: Variant = (t["_AFSLOT"] as Dictionary).get(slot)
	if a_slot == null:
		return []
	var pre: Array = []
	var suf: Array = []
	for a in (t["AFFIX_POOL"] as Array):
		if (a["slots"] as Array).find(a_slot) < 0:
			continue
		if a.has("brType") and a["brType"] != br_type:
			continue
		if demo_mode and DEMO_BANNED.has(a.get("id")):continue
		# Existing full-build callers retain the default false.
		if int(a.get("type", 1)) == 0:
			pre.append(a)
		else:
			suf.append(a)
	var max_count: int = [0, 2, 3, 5, 6, 7][grade] if grade >= 0 and grade <= 5 else 0
	var result: Array = []
	var used_group: Dictionary = {}
	var order: Array = [pre, suf] if grade % 2 == 1 else [suf, pre]
	for i in range(max_count):
		var pool: Array = order[i % 2]
		var base_tier: int = 2 if grade >= 4 else (1 if grade >= 3 else 0)
		var lv_bonus: int = _i32(plv / 200.0)
		var total_weight: float = 0.0
		for a in pool:
			if not used_group.has(a["group"]) and (a["tiers"] as Array)[0] != null \
					and not (float(a.get("minGrade", -1)) > grade):
				total_weight += float(a["weight"])
		if total_weight <= 0.0:
			continue
		var roll: float = _r("affix_weight") * total_weight
		if aborted: return []
		for a in pool:
			if used_group.has(a["group"]) or (a["tiers"] as Array)[0] == null \
					or float(a.get("minGrade", -1)) > grade:
				continue
			roll -= float(a["weight"])
			if roll <= 0.0:
				var tiers: Array = a["tiers"]
				var max_tier: int = mini(tiers.size() - 1, base_tier + lv_bonus)
				var value: Variant
				var tier_index: int
				if a.has("tierW"):
					var tw_sum: float = 0.0
					for ti in range(max_tier + 1):
						tw_sum += float((a["tierW"] as Array)[ti]) if ti < (a["tierW"] as Array).size() and (a["tierW"] as Array)[ti] != null else 1.0
					var tr: float = _r("affix_tierW") * tw_sum
					if aborted: return []
					tier_index = 0
					for ti in range(max_tier + 1):
						tr -= float((a["tierW"] as Array)[ti]) if ti < (a["tierW"] as Array).size() and (a["tierW"] as Array)[ti] != null else 1.0
						if tr <= 0.0:
							tier_index = ti
							break
					value = tiers[tier_index]
				else:
					var lo: float = float(tiers[0])
					var hi: float = float(tiers[max_tier])
					var rr: float
					if a.has("skewRoll"):
						rr = pow(_r("affix_skew"), float(a["skewRoll"]))
					else:
						rr = _r("affix_value")
					if aborted: return []
					if str(a.get("unit", "")) in ["cnt", "val"]:
						value = _i32(lo + rr * (hi - lo + 1.0))
					else:
						value = _fixed(lo + (hi - lo) * rr, 4)
					var t2: int = mini(2, max_tier)
					var t1: int = mini(1, max_tier)
					tier_index = max_tier if float(value) >= float(tiers[t2]) else (t1 if float(value) >= float(tiers[t1]) else 0)
				result.append({"id": a["id"], "tier": tier_index, "value": value})
				used_group[a["group"]] = 1
				break
	return result

# ── mkItem(slot,tier,el,rarity,wtype) — 15894~16166 ──
func mk_item(slot: String, tier: int, el: int, rarity: int, wtype: Variant, plv: int) -> Variant:
	var t: Dictionary = load_tables()
	if slot == "headband2": # 15895
		var sub: Variant = mk_item("headband", tier, el, rarity, wtype, plv)
		if sub is Dictionary:
			sub["slot"] = "headband2"
		return sub
	var rm: float = float((t["RARITY_MUL"] as Array)[rarity])
	# 15921~15923 디아블로식 ATK 롤
	var atk_max: int = _i32((200.0 + tier * 200.0 + plv) * 0.25)
	var atk_floor: float = [0.0, 0.05, 0.15, 0.25, 0.40, 0.50][rarity]
	var atk_roll: int = maxi(1, _i32(atk_max * (atk_floor + (1.0 - atk_floor) * pow(_r("atk_skew"), 2.0))))
	# 15924~15958 base 테이블 — JS 리터럴 평가 순서 그대로 RNG 소비.
	var base := {}
	base["weapon"] = {"atk": atk_roll, "spd": 1, "antiRevive": _fixed(0.01 + 0.19 * pow(_r("base_weapon_antirevive"), 3.0), 2)}
	base["shield"] = {"def": 20 + tier * 20, "stagger": 15 + tier * 8, "shieldWt": 10 - tier,
		"bonusHp": _i32(tier * 50 + 10 + _r("base_shield_hp") * 40.0),
		"bonusSt": _i32(tier * 50 + 10 + _r("base_shield_st") * 40.0),
		"antiRevive": _fixed(0.01 + 0.19 * pow(_r("base_shield_antirevive"), 3.0), 2)}
	base["boots"] = {"def": 20 + tier * 20, "spd": tier * 0.08,
		"bonusSt": _i32(tier * 50 + 10 + _r("base_boots_st") * 40.0), "chargeDist": 14 + tier * 3,
		"bonusHp": _i32(tier * 50 + 10 + _r("base_boots_hp") * 40.0)}
	base["armor"] = {"def": 20 + tier * 20, "charge": 8 + tier * 5, "chargeDist": 22 + tier * 4,
		"chargeW": 12 + tier * 5, "chargeAoE": 0,
		"bonusSt": _i32(tier * 50 + 10 + _r("base_armor_st") * 40.0),
		"bonusHp": _i32(tier * 50 + 10 + _r("base_armor_hp") * 40.0)}
	base["helmet"] = {"atk": atk_roll, "beamDmg": 1.5 + tier * 1.2, "def": 20 + tier * 20}
	base["bow"] = {"atk": atk_roll, "spd": 1, "antiRevive": _fixed(0.01 + 0.19 * pow(_r("base_bow_antirevive"), 3.0), 2)}
	base["gloves"] = {"def": 20 + tier * 20, "spd": tier * 0.04,
		"bonusHp": _i32(tier * 50 + 10 + _r("base_gloves_hp") * 40.0),
		"bonusSt": _i32(tier * 50 + 10 + _r("base_gloves_st") * 40.0)}
	base["pants"] = {"def": 20 + tier * 20,
		"bonusSt": _i32(tier * 50 + 10 + _r("base_pants_st") * 40.0),
		"bonusHp": _i32(tier * 50 + 10 + _r("base_pants_hp") * 40.0)}
	base["cape"] = {"def": 20 + tier * 20, "spd": tier * 0.03,
		"bonusHp": _i32(tier * 50 + 10 + _r("base_cape_hp") * 40.0),
		"bonusSt": _i32(tier * 50 + 10 + _r("base_cape_st") * 40.0)}
	base["belt"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10, "bonusSt": 4 + tier * 3,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_belt_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_belt_mp") * 40.0)}
	base["necklace"] = {"eDef": 20 + tier * 20, "critRate": 10, "dmgBonus": 20 + tier * 20,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_necklace_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_necklace_mp") * 40.0)}
	base["ring1"] = {"eDef": 20 + tier * 20, "critRate": 5, "dmgBonus": 10 + tier * 10,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_ring1_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_ring1_mp") * 40.0)}
	base["ring2"] = {"eDef": 20 + tier * 20, "critRate": 5, "dmgBonus": 10 + tier * 10,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_ring2_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_ring2_mp") * 40.0)}
	base["bracelet"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_bracelet_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_bracelet_mp") * 40.0)}
	base["headband"] = {"eDef": 20 + tier * 20, "dmgBonus": 10 + tier * 10, "mpRegen": (1 + tier) * 2,
		"bonusShield": _i32(tier * 50 + 10 + _r("base_headband_shield") * 40.0),
		"bonusMp": _i32(tier * 50 + 10 + _r("base_headband_mp") * 40.0)}
	base["ossuary"] = {"eDef": 20 + tier * 20, "bonusMp": _i32(tier * 50 + 10 + _r("base_ossuary_mp") * 40.0)}
	if aborted: return null
	var b: Variant = base.get(slot)
	if b == null: # 15960 — DROP_SLOT_POOL 밖 슬롯은 도달 불가(방어 분기, RNG 소비 없음으로 기록)
		return {"id": 0, "slot": slot, "el": el, "rarity": rarity, "tier": tier, "name": "???", "emoji": "❓", "_fallback_branch": true}
	if slot == "weapon" or slot == "shield": # 15961
		el = EL_P
	var slot_names: Dictionary = t["names_mkitem"]
	var item: Dictionary = {"id": _r("item_id"), "slot": slot, "el": el, "rarity": rarity, "tier": tier,
		"emoji": (t["SLOT_EMOJI"] as Array)[(t["SLOT_NAMES"] as Array).find(slot)]}
	if slot == "weapon" or slot == "bow":
		item["name"] = ""
	elif slot == "ring2":
		item["name"] = ((slot_names["ring1"] as Dictionary)[str(el)] as Array)[mini(tier, 4)]
	elif slot_names.get(slot) is Dictionary:
		item["name"] = ((slot_names[slot] as Dictionary)[str(el)] as Array)[mini(tier, 4)]
	else:
		item["name"] = ""
	# 15966~15979 무기 타입
	if slot == "weapon":
		var wtype_keys: Array = (t["WTYPES"] as Dictionary).keys()
		var wt: String = str(wtype) if wtype != null else str(wtype_keys[_i32(_r("weapon_type") * wtype_keys.size())])
		var wd: Dictionary = (t["WTYPES"] as Dictionary)[wt]
		item["wtype"] = wt
		var wp_mod: Array = (t["_WP_MOD"] as Dictionary).get(str(el), (t["_WP_MOD"] as Dictionary)["0"])
		item["name"] = str(wp_mod[mini(tier, 4)]) + " " + str(wd["name"]) # _weaponName 15883
		item["emoji"] = wd.get("emoji", "⚔️")
		item["atk"] = _i32(atk_roll * float(wd["atkMul"]))
		item["spd"] = _fixed(float(wd["spdMul"]) * rm, 2)
		item["wStCost"] = _i32(float(wd["stCost"]) * (2.0 - rm * 0.3))
		item["wArcW"] = _fixed(float(wd["arcW"]), 2)
		item["wRange"] = _i32(float(wd["range"]) * (0.95 + _r("weapon_range") * 0.1))
		item["wStagger"] = _i32(float(wd["stagger"]) * rm)
		item["bonusRange"] = mini(3, _i32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _r("weapon_bonus_range") * 0.4)))
	# 15981~15992 활 타입
	if slot == "bow":
		var btype_keys: Array = (t["BOWTYPES"] as Dictionary).keys()
		var bt2: String = str(wtype) if wtype != null else str(btype_keys[_i32(_r("bow_type") * btype_keys.size())])
		var bd: Dictionary = (t["BOWTYPES"] as Dictionary).get(bt2, {})
		if bd.is_empty():
			return item
		item["btype"] = bt2
		var bow_names: Dictionary = t["bowNames_mkitem"]
		item["name"] = ((bow_names.get(bt2, {}) as Dictionary).get(str(el), []) as Array)[mini(tier, 4)] if (bow_names.get(bt2, {}) as Dictionary).has(str(el)) else str(bd.get("name", "석궁"))
		item["emoji"] = bd.get("emoji", "🏹")
		item["atk"] = _i32(atk_roll * float(bd["atkMul"]))
		item["bowSpd"] = _fixed(float(bd["spdMul"]) * rm, 2)
		item["bowStCost"] = _i32(float(bd["stCost"]) * (2.0 - rm * 0.3))
		item["bowRange"] = _i32(float(bd["range"]) * (0.95 + _r("bow_range") * 0.1))
		item["bowProjSpd"] = bd.get("projSpd")
		item["bonusRange"] = mini(3, _i32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _r("bow_bonus_range") * 0.4)))
		item["bowPierce"] = _fixed((0.02 + tier * 0.03 + rarity * 0.04) * (0.8 + _r("bow_pierce") * 0.4), 2)
	if slot == "shield": # 15994~15996
		item["bonusRange"] = mini(3, _i32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _r("shield_bonus_range") * 0.4)))
		item["shieldWt"] = maxi(1, _i32(float(b["shieldWt"]) * (2.0 - rm * 0.3)))
	# 15998~16005 공통 수치 롤 (b 필드 존재 시만 — 원문 if(b.x) 순서)
	if slot != "weapon" and slot != "bow" and b.has("atk"):
		item["atk"] = b["atk"] if slot == "helmet" else _i32(float(b["atk"]) * rm * (0.9 + _r("stat_atk") * 0.2))
	if b.has("def"):
		item["def"] = _i32(float(b["def"]) * rm * (0.9 + _r("stat_def") * 0.2))
	if b.has("eDef"):
		item["eDef"] = _i32(float(b["eDef"]) * rm * (0.9 + _r("stat_edef") * 0.2))
	if slot != "weapon" and slot != "bow" and b.has("spd"):
		item["spd"] = _fixed(float(b["spd"]) * rm, 2)
	if b.has("bonusSt") and float(b["bonusSt"]) != 0.0:
		item["bonusSt"] = _i32(float(b["bonusSt"]) * rm * (0.9 + _r("stat_bonus_st") * 0.2))
	if b.has("charge") and float(b["charge"]) != 0.0:
		item["charge"] = _i32(float(b["charge"]) * rm * (0.9 + _r("stat_charge") * 0.2))
	if b.has("chargeDist") and float(b["chargeDist"]) != 0.0:
		item["chargeDist"] = _i32(float(b["chargeDist"]) * rm)
	if b.has("chargeW") and float(b["chargeW"]) != 0.0:
		item["chargeW"] = _i32(float(b["chargeW"]) * rm * (0.9 + _r("stat_charge_w") * 0.2))
	if slot == "armor": # 16007~16009
		item["bonusRange"] = mini(3, _i32((1.0 + tier * 0.4 + rarity * 0.5) * (0.8 + _r("armor_bonus_range") * 0.4)))
		item["bonusChargeDist"] = mini(3, _i32((1.0 + tier * 0.35 + rarity * 0.45) * (0.8 + _r("armor_bonus_charge") * 0.4)))
	if slot == "armor" and rarity >= 3: # 16011~16014
		var ao_base: float = (40.0 + tier * 12.0) if rarity == 4 else (25.0 + tier * 8.0)
		item["chargeAoE"] = _i32(ao_base * (0.9 + _r("armor_charge_aoe") * 0.2))
	if b.has("stagger"):
		item["stagger"] = _i32(float(b["stagger"]) * rm)
	if b.has("range"):
		item["range"] = _i32(float(b["range"]) * rm * (0.9 + _r("stat_range") * 0.2))
	if b.has("bonusHp") and float(b["bonusHp"]) != 0.0:
		item["bonusHp"] = b["bonusHp"]
	if b.has("bonusShield") and float(b["bonusShield"]) != 0.0:
		item["bonusShield"] = b["bonusShield"]
	if b.has("bonusMp") and float(b["bonusMp"]) != 0.0:
		item["bonusMp"] = b["bonusMp"]
	if slot == "boots" and rarity >= 1: # 16021~16024 돌진 충전
		var cc_chance: float = [0.0, 0.2, 0.4, 0.7, 1.0][rarity] if rarity <= 4 else 1.0
		if _r("boots_charge_charge") < cc_chance:
			item["chargeCharge"] = (1 + _i32(_r("boots_charge_count") * 2.0)) if rarity >= 3 else 1
	if slot == "helmet": # 16027~16046
		item["beamDmg"] = _fixed(float(b["beamDmg"]) * rm, 1)
		item["elements"] = [{"el": el, "dmg": _i32(float(item["beamDmg"]) * (8.0 + tier * 3.0))}]
		var extra_els: Array = [1, 2, 3, 4, 5].filter(func(e): return e != el)
		var extra_count: int = 3 if rarity >= 4 else (2 if rarity >= 3 else (1 if rarity >= 2 else 0))
		var used: Array = [el]
		for i in range(extra_count):
			var pool: Array = extra_els.filter(func(e): return not used.has(e))
			if pool.is_empty():
				break
			var ee: int = pool[_i32(_r("helmet_extra_el") * pool.size())]
			used.append(ee)
			(item["elements"] as Array).append({"el": ee, "dmg": _i32(float(item["beamDmg"]) * (4.0 + tier * 2.0) * (0.7 + _r("helmet_extra_dmg") * 0.3))})
		if rarity >= 4 and (item["elements"] as Array).size() >= 3:
			item["name"] = "혼돈의 왕관"
		if rarity >= 4 and (item["elements"] as Array).size() >= 4:
			item["name"] = "전지전능의 왕관"
		if rarity >= 1:
			item["splashR"] = mini(10, _i32((10.0 + tier * 6.0 + rarity * 8.0) * (0.9 + _r("helmet_splash_r") * 0.2)))
		if rarity >= 2:
			item["splashMul"] = _fixed((0.15 + rarity * 0.08 + tier * 0.03) * (0.9 + _r("helmet_splash_mul") * 0.2), 2)
		if rarity >= 3:
			item["magicPen"] = (2 + _i32(tier / 2.0)) if rarity >= 4 else 1
		item["bonusRange"] = mini(5, _i32((1.0 + tier * 0.6 + rarity * 0.8) * (0.8 + _r("helmet_bonus_range") * 0.4)))
	if slot == "gloves": # 16049~16051
		item["potCd"] = _fixed([0.05, 0.10, 0.15, 0.20, 0.30][rarity] * (0.9 + _r("gloves_pot_cd") * 0.2), 3)
		if rarity >= 1:
			item["atkSpd"] = _fixed((0.02 + rarity * 0.015 + tier * 0.005) * (0.9 + _r("gloves_atk_spd") * 0.2), 3)
	if slot == "pants": # 16054
		item["bonusHp"] = int(item.get("bonusHp", 0)) + _i32((5.0 + tier * 4.0 + rarity * 6.0) * (0.9 + _r("pants_bonus_hp") * 0.2))
	if slot == "belt": # 16057~16059
		item["potCd"] = _fixed([0.03, 0.06, 0.10, 0.15, 0.22][rarity] * (0.9 + _r("belt_pot_cd") * 0.2), 3)
		item["bonusHp"] = int(item.get("bonusHp", 0)) + _i32((3.0 + tier * 2.0 + rarity * 4.0) * (0.9 + _r("belt_bonus_hp") * 0.2))
	if slot == "ring1" or slot == "ring2": # 16062~16069 반지 전용 어픽스 2개
		var ring_pool: Array = ["fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "maxSTFlat", "maxMPFlat", "eDefFlat", "lckFlatR", "gritFlatR"]
		var r_aff1: String = ring_pool[_i32(_r("ring_affix1") * ring_pool.size())]
		var r_aff2: String = ring_pool[_i32(_r("ring_affix2") * ring_pool.size())]
		while r_aff2 == r_aff1 and not aborted:
			r_aff2 = ring_pool[_i32(_r("ring_affix2_redo") * ring_pool.size())]
		item["affixes"] = []
		for aff_id in [r_aff1, r_aff2]:
			var aff_def: Variant = _affix_def(aff_id)
			if aff_def is Dictionary:
				var at: int = mini(tier, (aff_def["tiers"] as Array).size() - 1)
				(item["affixes"] as Array).append({"id": aff_id, "val": (aff_def["tiers"] as Array)[at]})
	if slot == "necklace": # 16070~16080
		var neck_pool: Array = ["fireRes", "iceRes", "lightRes", "darkRes", "poisonRes", "allRes", "maxSTFlat", "maxMPFlat", "eDefFlat", "lckFlatN", "gritFlatN", "mpCostRed", "expBonus"]
		var n_aff1: String = neck_pool[_i32(_r("neck_affix1") * neck_pool.size())]
		var n_aff2: String = neck_pool[_i32(_r("neck_affix2") * neck_pool.size())]
		while n_aff2 == n_aff1 and not aborted:
			n_aff2 = neck_pool[_i32(_r("neck_affix2_redo") * neck_pool.size())]
		item["affixes"] = []
		for aff_id in [n_aff1, n_aff2]:
			var aff_def: Variant = _affix_def(aff_id)
			if aff_def is Dictionary:
				var at: int = mini(tier, (aff_def["tiers"] as Array).size() - 1)
				(item["affixes"] as Array).append({"id": aff_id, "val": (aff_def["tiers"] as Array)[at]})
	# 16082~16107 스탯 보너스 (3파트 룰)
	var is_weapon_part: bool = slot in ["weapon", "bow", "helmet"]
	var is_access: bool = slot in ["belt", "bracelet", "ring1", "ring2", "necklace", "headband", "ossuary"]
	if rarity >= 1 and not is_weapon_part:
		if is_access:
			item["bLck"] = _i32((4.0 + tier * 4.0 + rarity * 6.0) * (0.8 + _r("acc_lck") * 0.4))
			item["bGrit"] = _i32((4.0 + tier * 4.0 + rarity * 6.0) * (0.8 + _r("acc_grit") * 0.4))
			var extra: String = ["bStr", "bDex", "bInt"][_i32(_r("acc_stat_pick") * 3.0)]
			item[extra] = _i32((4.0 + tier * 4.0 + rarity * 6.0) * (0.8 + _r("acc_stat_value") * 0.4))
		else:
			var stat_pool: Array = ["bStr", "bDex", "bInt"]
			var stat_count: int
			if rarity >= 4:
				stat_count = 3
			elif rarity >= 3:
				stat_count = 2
			elif rarity >= 2:
				stat_count = 2 if _r("armor_stat_count_r2") < 0.6 else 1
			else:
				stat_count = 1 if _r("armor_stat_count_r1") < 0.4 else 0
			var picked: Array = []
			for i in range(stat_count):
				var pool2: Array = stat_pool.filter(func(s): return not picked.has(s))
				if pool2.is_empty():
					break
				picked.append(pool2[_i32(_r("armor_stat_pick") * pool2.size())])
			for stat_key in picked:
				item[stat_key] = _i32((4.0 + tier * 4.0 + rarity * 6.0) * (0.8 + _r("armor_stat_value") * 0.4))
	if slot == "bracelet": # 16109~16113
		item["brType"] = "demon" if _r("bracelet_type") < 0.5 else "life"
		var br_names: Dictionary = (t["brNames_mkitem"] as Dictionary).get(item["brType"], {})
		if br_names.has(str(el)):
			item["name"] = (br_names[str(el)] as Array)[mini(tier, 4)]
		else:
			item["name"] = "악마의 팔찌" if item["brType"] == "demon" else "생명의 팔찌"
	# 16117 어픽스 시스템
	item["affixes"] = roll_affixes(rarity, slot, item.get("brType"), plv)
	# 16119~16126 임플리싯
	var impl_key: String = ("bracelet_" + str(item.get("brType"))) if slot == "bracelet" else slot
	var impl: Variant = (t["IMPLICIT_TABLE"] as Dictionary).get(impl_key)
	if impl is Dictionary:
		var iv: float = float((impl["val"] as Array)[0]) + _r("implicit_value") * (float((impl["val"] as Array)[1]) - float((impl["val"] as Array)[0]))
		item["_implicitStat"] = impl["stat"]
		item["_implicitVal"] = _fixed(iv, 2)
		item["_implicitKo"] = impl.get("ko")
	# 16128~16134 전설 특수 (rarity>=4)
	item["legendarySpecial"] = null
	if rarity >= 4:
		var ls_pool: Array = (t["LEGENDARY_SPECIAL"] as Dictionary).values()
		var ls: Variant = ls_pool[_i32(_r("legendary_special") * ls_pool.size())]
		if ls is Dictionary:
			item["legendarySpecial"] = {"ko": ls.get("ko"), "stat": ls.get("stat"), "val": ls.get("val")}
			item[str(ls["stat"])] = ls["val"]
	# 16136~16146 유니크 특수 (rarity=5)
	item["uniqueSpecial"] = null
	if rarity >= 5:
		var us_pool: Array = (t["UNIQUE_SPECIAL"] as Dictionary).values()
		var us: Variant = us_pool[_i32(_r("unique_special") * us_pool.size())]
		var art_base: String = str(item.get("wtype", "")) if item.has("wtype") else ""
		if art_base == "":
			art_base = "crossbow" if (slot == "bow" or item.has("btype")) else slot
		art_base = {"ring1": "ring", "ring2": "ring", "headband": "earring", "headband2": "earring"}.get(art_base, art_base)
		var arts: Variant = (t["UNIQUE_ART"] as Dictionary).get(art_base) if slot != "ossuary" else null
		if arts is Array and not (arts as Array).is_empty():
			var ua: Dictionary = (arts as Array)[_i32(_r("unique_art") * (arts as Array).size())]
			item["uniqueArt"] = ua.get("id")
			item["name"] = ua.get("ko")
		if us is Dictionary:
			var uv: Variant = us.get("val")
			var usc: Variant = null
			var ud: Variant = null
			if us.has("roll"):
				ud = float((us["roll"] as Array)[0]) + _i32(_r("unique_roll") * (float((us["roll"] as Array)[1]) - float((us["roll"] as Array)[0]) + 1.0))
				uv = _fixed(float(ud) * float(us["scale"]), 4) if us.has("scale") else ud
				usc = str(_fixed(float(ud) / 60.0, 1))
			item["uniqueSpecial"] = {"ko": us.get("ko"), "stat": us.get("stat"), "val": uv, "secs": usc, "disp": ud}
			item[str(us["stat"])] = uv
	# 16143~16147 아이템 레벨/요구 레벨
	var item_lv: int = mini(900, int(floor(plv / 10.0)) * 10)
	item["itemLv"] = item_lv
	item["reqLv"] = maxi(0, item_lv - 10)
	# 16149~16151 홈: 신규 장비 전부 닫힘 (2026-10-10)
	item["socketCount"] = 0
	item["crystals"] = []
	item["socketQ"] = []
	# 16155~16165 유골함 고정 오버라이드 — DROP_SLOT_POOL 밖이라 드랍 경로 미도달.
	# (행 표기는 이전 스냅샷 e556b617 좌표. 91e2774b7 스냅샷에서는 16156 이후 +2: 이 분기 = 16155~16167)
	# PC-HUD-STATS: _grantOssuaryIfNeeded(45880 mkItem('ossuary',0,EL.P,5))가 이 분기에 도달한다.
	# 원문 그대로: 앞의 롤(RNG 소비)은 유지하고 필드만 덮어쓴다.
	if slot == "ossuary":
		# 91e2774b7 새 16156~16157(원본 같은 위치·순서): 앞의 전설/유니크 롤이 남긴 원시 효과 키
		# item[stat](16133·16145)부터 지운다 — _lEq/_uEq가 키를 직접 읽으므로 null 표기만으로는 효과가 남는다.
		if item.get("legendarySpecial") is Dictionary: item.erase(str(item["legendarySpecial"]["stat"]))
		if item.get("uniqueSpecial") is Dictionary: item.erase(str(item["uniqueSpecial"]["stat"]))
		item["rarity"] = 5; item["tier"] = 0; item["el"] = EL_P; item["unique"] = true
		item["name"] = "전대의 유골함"; item["emoji"] = "⚱️"; item["anc"] = "iron_warlord"
		item["eDef"] = 60; item["bonusMp"] = 150; item["ancPow"] = 0.25
		for key in ["bStr", "bDex", "bInt", "bLck", "bGrit"]:
			item.erase(key)
		item["affixes"] = [{"id": "ancHP", "tier": 3, "value": 0.9}]
		item["legendarySpecial"] = null; item["uniqueSpecial"] = null
		var oss_impl: Variant = (t["IMPLICIT_TABLE"] as Dictionary).get("ossuary")
		item["_implicitStat"] = "_iAncPow"; item["_implicitVal"] = 10
		item["_implicitKo"] = (oss_impl as Dictionary).get("ko") if oss_impl is Dictionary and (oss_impl as Dictionary).get("ko") else "전대 위력 +X%"
		item["reqLv"] = 0
		item["socketCount"] = 0; item["crystals"] = []; item["socketQ"] = []
	if aborted:
		return null
	return item

func _affix_def(id: String) -> Variant:
	for a in (load_tables()["AFFIX_POOL"] as Array):
		if str(a["id"]) == id:
			return a
	return null

# ── rollDrop(e) — 32002~32077 (첫 스테이지 일반몹 경로) ──
# ctx: {stage:int, drop_bonus:float, min_pick_rar:int, min_pick_lv_thr:int, plv:int,
#       crystal_bag_len:int, crystal_bag_max:int, stone_bag_len:int, stone_bag_max:int}
# enemy: {ib:bool, etype:int, elite:int, drop_tier:int, x:float, y:float}
func roll_drop(enemy: Dictionary, ctx: Dictionary) -> Variant:
	var t: Dictionary = load_tables()
	var result := {"world_items": [], "crystal": null, "stone": null, "bone": null, "texts": []}
	var drop_bonus: float = float(ctx["drop_bonus"]) # _curseMul=1 (P._greedCurse 부재)
	var is_boss: bool = enemy.get("ib") == true
	var is_mini: bool = not is_boss and int(enemy["etype"]) >= 90 and int(enemy["etype"]) <= 99
	var m_tier: String = "stageBoss" if is_boss else ("miniboss" if is_mini else ("elite" if int(enemy.get("elite", 0)) > 0 else "normal"))
	# (챕터보스 판별은 보스 전용 — 일반 경로 비활성, ib는 상위에서 정지)
	var weights := {"normal": [65.0, 22.0, 9.0, 3.0, 1.0, 0.01], "elite": [25.0, 35.0, 25.0, 12.0, 3.0, 0.03],
		"miniboss": [10.0, 25.0, 30.0, 25.0, 10.0, 0.1], "stageBoss": [0.0, 0.0, 30.0, 50.0, 20.0, 0.2]}
	var drop_count: int = {"normal": 1, "elite": 1, "miniboss": 2, "stageBoss": 3}.get(m_tier, 1)
	var base_chance: float = {"normal": 0.45, "elite": 1.0, "miniboss": 1.0, "stageBoss": 1.0}.get(m_tier, 0.45) * drop_bonus
	# 32018: `_mTier==='normal' && Math.random()>baseChance` — && 단락: normal일 때만 롤 평가.
	var gate_skip := false
	if m_tier == "normal":
		var gate: float = _r("drop_gate")
		if aborted: return null
		gate_skip = gate > base_chance
	if not gate_skip:
		var rw: Array = weights.get(m_tier, weights["normal"])
		var rw_total: float = 0.0
		for w in rw:
			rw_total += float(w)
		var slot_pool: Array = (t["SLOT_NAMES"] as Array).filter(func(s): return s != "ossuary") # 15178
		for di in range(drop_count):
			var rarity := 0
			var roll: float = _r("drop_rarity") * rw_total # 32025
			if aborted: return null
			var acc := 0.0
			for ri in range(6):
				acc += float(rw[ri])
				if roll < acc:
					rarity = ri
					break
			if rarity < int(ctx["min_pick_rar"]): # 32026 (기본 0)
				continue
			var slot: String = slot_pool[_i32(_r("drop_slot") * slot_pool.size())] # 32027
			var el: int = [0, 1, 2, 3, 4, 5][_i32(_r("drop_element") * 6.0)] # 32028
			var item: Variant = mk_item(slot, int(enemy.get("drop_tier", 0)), el, rarity, null, int(ctx["plv"])) # 32030
			if aborted: return null
			if item == null:
				continue
			if int((item as Dictionary).get("reqLv", 0)) < int(ctx["min_pick_lv_thr"]): # 32032: reqLv<thr → 버림 (기본 thr=-1 → 비해당)
				continue
			(result["world_items"] as Array).append({"x": float(enemy["x"]) + (_r("drop_jitter_x") - 0.5) * 30.0,
				"y": float(enemy["y"]) + (_r("drop_jitter_y") - 0.5) * 30.0, "type": "item", "item": item, "picked": false})
			if aborted: return null
	# 32036~32045 유골 부위 (normal 0.02×dropBonus)
	var bone_chance: float = {"stageBoss": 0.40, "miniboss": 0.20, "elite": 0.06}.get(m_tier, 0.02) * drop_bonus
	if _r("bone_gate") < bone_chance:
		var anc_index: int = _i32(_r("bone_anc") * (t["ANC_ROSTER"] as Array).size())
		var part: String = (t["_BONE_PARTS"] as Array)[_i32(_r("bone_part") * (t["_BONE_PARTS"] as Array).size())]
		var rw2: Array = weights.get(m_tier, weights["normal"])
		var rw_total2: float = 0.0
		for w in rw2:
			rw_total2 += float(w)
		var bone_rarity := 0
		var r2: float = _r("bone_rarity") * rw_total2
		var a2 := 0.0
		for ri in range(6):
			a2 += float(rw2[ri])
			if r2 < a2:
				bone_rarity = ri
				break
		# mkBonePart(45788): id 랜덤 1회 외 RNG 없음.
		var roster: Dictionary = (t["ANC_ROSTER"] as Array)[anc_index]
		var bone_item := {"id": _r("bone_item_id"), "slot": "bonePart", "anc": roster["id"], "part": part,
			"el": 0, "rarity": bone_rarity, "tier": clampi(int(enemy.get("drop_tier", 0)), 0, 4),
			"name": str(roster["ko"]) + "의 " + {"skull": "두개골", "torso": "몸통", "arms": "팔", "legs": "다리"}.get(part, part),
			"emoji": "🦴", "itemLv": mini(900, int(floor(int(ctx["plv"]) / 10.0)) * 10), "reqLv": 0, "affixes": []}
		result["bone"] = bone_item
		(result["world_items"] as Array).append({"x": float(enemy["x"]) + (_r("bone_jitter_x") - 0.5) * 30.0,
			"y": float(enemy["y"]) + (_r("bone_jitter_y") - 0.5) * 30.0, "type": "item", "item": bone_item, "picked": false})
	if aborted: return null
	# 32047~32066 결정 드롭
	if int(ctx["crystal_bag_len"]) < int(ctx["crystal_bag_max"]):
		var crystal_chance: float = 0.80 if is_boss else 0.15 * drop_bonus
		if _r("crystal_gate") < crystal_chance:
			var crystal_ids: Array = (t["CRYSTAL_DEFS"] as Dictionary).keys()
			var crystal_id: String = crystal_ids[_i32(_r("crystal_id") * crystal_ids.size())]
			var star: int
			if int(enemy.get("elite", 0)) > 0:
				star = 1 if _r("crystal_star") < 0.5 else 0
			else:
				star = 0 if _r("crystal_star") < 0.8 else 1 # 32059 일반
			var quality: int = 1 + _i32(_r("crystal_quality") * 100.0) # _qRoll 15304
			result["crystal"] = {"id": crystal_id, "star": star, "enh": 0, "q": quality}
			var star_def: Dictionary = (t["CRYSTAL_STAR"] as Array)[star]
			var crystal_def: Dictionary = (t["CRYSTAL_DEFS"] as Dictionary)[crystal_id]
			(result["texts"] as Array).append({"x": float(enemy["x"]), "y": float(enemy["y"]) - 40.0,
				"text": str(star_def.get("name", "")) + " " + str(crystal_def.get("ko", crystal_id)) + " 획득!",
				"color": str(star_def.get("color", "#ffffff")), "life": 50})
			# _crAutoProcess(15350): OPT.crAutoFuse/-Enh 기본 -1 → 즉시 반환 (RNG 없음)
	if aborted: return null
	# 32068~32076 소켓석 드롭
	if int(ctx["stone_bag_len"]) < int(ctx["stone_bag_max"]):
		var stone_chance: float = {"stageBoss": 0.25, "miniboss": 0.12, "elite": 0.06}.get(m_tier, 0.015) * drop_bonus
		if _r("stone_gate") < stone_chance:
			# _stoneTierRoll(15336): hi=SI_TO_HELL[0]=0 → B=0.42, 가중치 t10..1.
			var b_value: float = minf(0.78, 0.42 + 0.06 * 0.0)
			var total := 0.0
			var tier_weights: Array = []
			for tier_value in range(10, 0, -1):
				var x: float = pow(b_value, 10.0 - tier_value)
				tier_weights.append([tier_value, x])
				total += x
			var stone_roll: float = _r("stone_tier") * total
			var stone_tier := 10
			for pair in tier_weights:
				stone_roll -= float(pair[1])
				if stone_roll < 0.0:
					stone_tier = int(pair[0])
					break
			var stone_q: int = (10 - stone_tier) * 10 + 1 + _i32(_r("stone_quality") * 10.0) # 15346
			result["stone"] = {"q": stone_q}
			var grade: Dictionary = {}
			for g in (t["Q_GRADES"] as Array):
				if stone_q >= int(g.get("min", 0)):
					grade = g
			(result["texts"] as Array).append({"x": float(enemy["x"]), "y": float(enemy["y"]) - 55.0,
				"text": str(grade.get("ko", "")) + " 소켓석 획득!", "color": str(grade.get("col", "#ffffff")), "life": 50})
	if aborted:
		return null
	return result
