extends RefCounted
## EC3-02: catalog10 + ONLY game.html 31263–31298's38 dedicated literal fields.
## Call at that literal site: AFTER _bossOrbitAng (31260), BEFORE _erraticAng
## (31300). The owner supplies the shared stream at this point. Not full mkEn.
## Reuse EC2-02's actual Draws implementation and projection result shape;
## never copy its CH2 fields/HP formula or bypass its stage/etype guards.
const Constructor = preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
# 30823–30920: catalog HP/ATK/rawSPD/R/POISE/SHIELD%/RANGE/COL, NOT actor stats.
const CATALOG = [
	[13,6,0.21,10,5,0,600,"#551133"], [64,18,0.24,12,28,70,400,"#442233"],
	[96,22,0.09,18,45,0,400,"#663344"], [32,14,0.54,10,12,0,200,"#882211"],
	[48,18,0.6,10,15,0,400,"#443322"], [19,22,0.3,10,5,0,600,"#553344"],
	[128,18,0.0,20,55,80,400,"#332222"], [48,14,0.36,12,18,0,400,"#221122"],
	[32,12,0.24,10,10,0,800,"#664422"], [192,30,0.24,25,60,0,1000,"#330011"]]
# Literal order. [field, matching etype (0=unconditional constant), base, Uscale,
# nonmatching value]. A matching zero Uscale is ALSO a constant, never a draw.
const FIELDS = [
	["_wraithPhaseT",40,120.0,60.0,9999], ["_wraithPhaseCd",40,240.0,80.0,9999],
	["_wraithPhasing",0,false,0,false],
	["_dkGuardCd",41,150.0,50.0,9999], ["_dkGuardT",41,80.0,40.0,9999],
	["_dkGuarding",0,false,0,false],
	["_dkSlashCd",41,100.0,40.0,9999], ["_dkSlashT",41,40.0,20.0,9999],
	["_fmAbsorbCd",42,180.0,60.0,9999], ["_fmSpitCd",42,200.0,80.0,9999], ["_fmSpitT",42,80.0,40.0,9999],
	["_ddLungeCd",43,80.0,30.0,9999], ["_ddLungeT",43,30.0,15.0,9999],
	["_torChainCd",44,100.0,40.0,9999], ["_torChainT",44,40.0,20.0,9999], ["_torBleed",44,0.4,0,0],
	["_wdSwoopCd",45,90.0,40.0,9999], ["_wdSwoopT",45,30.0,15.0,9999],
	["_wdSwoopOx",0,0,0,0], ["_wdSwoopOy",0,0,0,0],
	["_pillarRingCd",46,180.0,60.0,9999], ["_pillarRingT",46,60.0,30.0,9999],
	["_pillarAoeCd",46,300.0,80.0,9999], ["_pillarAoeT",46,80.0,40.0,9999],
	["_stCloneCd",47,200.0,60.0,9999], ["_stCloneT",47,80.0,40.0,9999], ["_stTpCd",47,120.0,40.0,9999],
	["_hpHealCd",48,200.0,80.0,9999], ["_hpHealT",48,80.0,40.0,9999],
	["_hpBuffCd",48,250.0,80.0,9999], ["_hpProjCd",48,120.0,50.0,9999],
	["_adPhase",49,0,0,-1], ["_adFireCd",49,150.0,50.0,9999], ["_adFireT",49,60.0,30.0,9999],
	["_adSummonCd",49,400.0,100.0,9999], ["_adChargeCd",49,200.0,60.0,9999],
	["_adSlamCd",49,250.0,80.0,9999], ["_adSlamT",49,80.0,40.0,9999]]

## Partial numeric projection: NO HP/ATK/level/speed/radius actor construction,
## collision admission, elite/mods/aura, surrounding literal draws or skin.
## Stage/etype context and status/fields/catalog/draws/complete_actor follow
## EC2-02. Extra caller context is read-only and not a substitute core provider.
func build(context: Dictionary, random_unit: Callable) -> Dictionary:
	var reason: String = _context_error(context)
	if not reason.is_empty():
		return _stop(reason,0)
	if not random_unit.is_valid():
		return _stop("invalid_random_callable",0)
	var draws := Constructor.Draws.new(random_unit)
	var fields: Dictionary = {}
	for field in FIELDS:
		if field[1] == 0:
			fields[field[0]] = field[2]
		elif int(context.etype) == field[1]:
			fields[field[0]] = float(field[2])+draws.sample()*float(field[3]) if field[3] != 0 else field[2]
			if not draws.error.is_empty():
				return _stop(draws.error,draws.count)
		else:
			fields[field[0]] = field[4]
	return {"status":"READY","fields":fields,"catalog":catalog_for(int(context.etype)),"draws":draws.count,"complete_actor":false}

func catalog_for(etype: int) -> Dictionary:
	if etype < 40 or etype > 49:
		return {}
	var row: Array = CATALOG[etype-40]
	# 30858 has a distinct ZERO branch, unlike EC2's all-nonzero catalog.
	return {"hp":row[0],"atk":row[1],"raw_speed":row[2],"speed":0.0 if row[2] == 0 else maxf(0.2,float(row[2])*1.3),
		"r":row[3],"poise":row[4],"shield":row[5],"range":row[6],"col":row[7]}

func _context_error(context: Dictionary) -> String:
	for key in ["stage","etype"]:
		var value: Variant = context.get(key)
		if (typeof(value) != TYPE_INT and typeof(value) != TYPE_FLOAT) or not is_finite(float(value)):
			return "missing_finite_context_"+key
		if float(value) != floor(float(value)):
			return "nonintegral_context_"+key
	if context.stage < 10 or context.stage > 13:
		return "unsupported_stage"
	if context.etype < 40 or context.etype > 49:
		return "unsupported_etype"
	return ""

func _stop(reason: String, draws: int) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"draws":draws,"complete_actor":false}
