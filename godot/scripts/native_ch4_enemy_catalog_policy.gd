extends RefCounted
## EC4-02: ONLY catalog10 (G30823–30920) and 23 literal fields (G31300–31309).
## Invoke after _adSlamT (G31298), before _lavaBurn (G31311), using the owner's
## shared RNG cursor. EC3-02 slice API; actual EC2-02 Draws, no full mkEn/HP core.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
# HP/ATK/rawSPD/R/POISE/SHIELD%/RANGE/COL; catalog, NOT generated actor stats.
const CATALOG = [
	[32,12,0.36,10,12,0,400,"#554433"], [96,16,0.12,20,40,65,400,"#665544"],
	[80,24,0.09,18,35,0,400,"#774433"], [26,18,0.18,12,10,0,800,"#887766"],
	[22,2,0.54,10,3,0,600,"#443333"], [38,16,0.39,10,12,0,400,"#ddccaa"],
	[48,12,0.0,20,45,75,400,"#cc5544"], [128,18,0.45,10,12,0,1000,"#998877"],
	[128,24,0.15,25,40,0,600,"#aaaaaa"], [224,30,0.18,30,65,0,1000,"#332211"]]
# Literal insertion order: [name, matching etype (0=unconditional), base,
# Uscale, nonmatching value]. Special angle/array handled at their literal sites.
const FIELDS = [
	["_erraticT",50,30.0,30.0,9999], # G31300
	["_erraticAng",0,0,0,0],
	["_amalgCleave",51,true,0,false], ["_amalgSplit",0,false,0,false], # G31301
	["_tongueCd",52,160.0,60.0,9999], ["_tongueT",52,60.0,30.0,9999], # G31302
	["_gazeCd",53,180.0,60.0,9999], ["_gazeT",53,80.0,40.0,9999], ["_gazeAng",0,0,0,0], # G31303
	["_hangCd",54,200.0,60.0,9999], ["_hangT",54,80.0,40.0,9999], ["_hanging",54,true,0,false], # G31304
	["_boneChargeCd",55,120.0,50.0,9999], ["_boneChargeT",55,50.0,30.0,9999], ["_boneDeath",55,true,0,false], # G31305
	["_bloodCd",56,100.0,40.0,9999], ["_bloodT",56,40.0,20.0,9999], # G31306
	["_curled",57,true,0,false], ["_curlTimer",57,300.0,120.0,0], # G31307
	["_mirrorBuf",58,null,0,null], ["_mirrorDelay",0,60,0,60], # G31308
	["_overlordPhase",59,0,0,-1], ["_overlordCd",59,120,0,9999]] # G31309

## Partial projection, like EC3-02: no actor stats, surrounding literal fields,
## collision, elite/mods/aura, skin, AI ticking, World/factory registration.
func build(context: Dictionary, random_unit: Callable) -> Dictionary:
	var reason: String = _context_error(context)
	if not reason.is_empty():
		return _stop(reason,0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable",0)
	var draws := Constructor.Draws.new(random_unit)
	var fields: Dictionary = {}
	for field in FIELDS:
		if field[0] == "_erraticAng":
			# G31300: unconditional, including non-50; preserve U * PI * 2.
			fields[field[0]] = draws.sample()*PI*2.0
		elif field[0] == "_mirrorBuf":
			# G31308: a NEW mutable buffer for 58, explicit null otherwise.
			fields[field[0]] = [] if int(context.etype) == 58 else null
		elif field[1] == 0:
			fields[field[0]] = field[2]
		elif int(context.etype) == field[1]:
			fields[field[0]] = float(field[2])+draws.sample()*float(field[3]) if field[3] != 0 else field[2]
		else:
			fields[field[0]] = field[4]
		if not draws.error.is_empty():
			return _stop(draws.error,draws.count)
	return {"status":"READY","fields":fields,"catalog":catalog_for(int(context.etype)),"draws":draws.count,"complete_actor":false}

func catalog_for(etype: int) -> Dictionary:
	if etype < 50 or etype > 59:
		return {}
	var row: Array = CATALOG[etype-50]
	# G30858: preserve zero for 56; other types max(.2, raw*1.3).
	return {"hp":row[0],"atk":row[1],"raw_speed":row[2],"speed":0.0 if row[2] == 0 else maxf(0.2,float(row[2])*1.3),
		"r":row[3],"poise":row[4],"shield":row[5],"range":row[6],"col":row[7]}

func _context_error(context: Dictionary) -> String:
	for key in ["stage","etype"]:
		var value: Variant = context.get(key)
		if (typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT) or not is_finite(float(value)):
			return "missing_finite_context_"+key
		if float(value) != floor(float(value)):
			return "nonintegral_context_"+key
	if context.stage < 14 or context.stage > 20:
		return "unsupported_stage"
	if context.etype < 50 or context.etype > 59:
		return "unsupported_etype"
	return ""

func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"draws":draws,"complete_actor":false}
