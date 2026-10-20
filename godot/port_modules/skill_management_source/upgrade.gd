extends RefCounted
## SK-S05b: exact source context and copy-only upgrades.
const S = preload("res://port_modules/skill_management_source/core_support.gd")

static func _flags(skill_id: String, p: Dictionary) -> Dictionary:
	var _dimFuse: bool = S.flag(p, "dimBreach")
	var _dimSlamF: bool = S.lv(p, "chargeBoost")>=1 and S.lv(p, "magicBlink")>=1 and S.lv(p, "chainAssault")>=1 and S.flag(p, "dimSlam")
	var _dimThunderF: bool = _dimSlamF and S.lv(p, "chainSlam")>=1 and S.flag(p, "dimThunder")
	var _dimRushF: bool = _dimThunderF and S.lv(p, "chainSlash")>=1 and S.flag(p, "dimRush")
	var _dimBlastF: bool = _dimRushF and S.lv(p, "giantSlam")>=1 and S.flag(p, "dimBlast")
	var _isDimBlast: bool = skill_id=='chargeBoost' and _dimBlastF
	var _isDimRush: bool = skill_id=='chargeBoost' and _dimRushF and not _dimBlastF
	var _isDimThunder: bool = skill_id=='chargeBoost' and _dimThunderF and not _dimRushF and not _dimBlastF
	var _isDimSlam: bool = skill_id=='chargeBoost' and _dimSlamF and not _dimThunderF and not _dimRushF and not _dimBlastF
	var _isDimFuse: bool = skill_id=='chargeBoost' and _dimFuse and not _dimSlamF and not _dimThunderF and not _dimRushF and not _dimBlastF
	var _stormBeamF: bool = S.flag(p, "stormBeam")
	var _slamStormF: bool = S.lv(p, "whirlwind")>=1 and S.lv(p, "detonate")>=1 and S.lv(p, "giantSlam")>=1 and S.flag(p, "slamStorm")
	var _synth: bool = S.lv(p, "whirlwind")>=1 and S.lv(p, "detonate")>=1 and S.flag(p, "whirlDet")
	var _isStormBeam: bool = skill_id=='whirlwind' and _stormBeamF
	var _isSlamStorm: bool = skill_id=='whirlwind' and _slamStormF and not _stormBeamF
	var _isSynth: bool = skill_id=='whirlwind' and _synth and not _slamStormF and not _stormBeamF
	var _bladeFuse: bool = S.lv(p, "maliceHunt")>=1 and S.lv(p, "guardian")>=1 and S.flag(p, "bladeFuse")
	var _isBladeFuse: bool = skill_id=='maliceHunt' and _bladeFuse and not (S.lv(p, "plagueBurst")>=1 and S.flag(p, "plagueFuse"))
	var _iceMortarFuse: bool = S.lv(p, "maliceMortar")>=1 and S.lv(p, "iceOrb")>=1 and S.flag(p, "iceMortar")
	var _isIceFuse: bool = skill_id=='maliceMortar' and _iceMortarFuse
	var _elemFuseF: bool = S.lv(p, "fanShot")>=1 and S.lv(p, "omniBeam")>=1 and S.lv(p, "elemMissile")>=1 and S.flag(p, "elemFuse")
	var _sixFuse: bool = S.lv(p, "fanShot")>=1 and S.lv(p, "omniBeam")>=1 and S.flag(p, "sixFuse")
	var _isElemFuse: bool = skill_id=='omniBeam' and _elemFuseF and not _stormBeamF
	var _isSixFuse: bool = skill_id=='fanShot' and _sixFuse and not _elemFuseF and not _stormBeamF
	var _elecRepentF: bool = S.lv(p, "maliceStorm")>=1 and S.lv(p, "hellRay")>=1 and S.flag(p, "elecRepent")
	var _boneStormF: bool = S.lv(p, "maliceStorm")>=1 and S.lv(p, "boneWall")>=1 and S.flag(p, "boneStorm") and not _elecRepentF
	var _isElecRepent: bool = skill_id=='maliceStorm' and _elecRepentF
	var _isBoneStorm: bool = skill_id=='maliceStorm' and _boneStormF and not _elecRepentF
	var _shieldFuseF: bool = S.lv(p, "maliceSwipe")>=1 and S.lv(p, "shieldThrow")>=1 and S.flag(p, "shieldFuse")
	var _isShieldFuse: bool = skill_id=='maliceSwipe' and _shieldFuseF
	var _plagueFuseF: bool = S.lv(p, "maliceHunt")>=1 and S.lv(p, "plagueBurst")>=1 and S.flag(p, "plagueFuse")
	var _plagueVenomF: bool = S.lv(p, "maliceHunt")>=1 and S.lv(p, "venomBlade")>=1 and S.flag(p, "plagueVenom")
	var _isPlagueVenom: bool = skill_id=='maliceHunt' and S.lv(p, "venomBlade")>=1 and S.flag(p, "plagueVenom")
	var _isPlagueFuse: bool = skill_id=='maliceHunt' and _plagueFuseF and not _isPlagueVenom
	var _holyW4F: bool = S.flag(p, "holyWeak4") and S.lv(p, "holyDome")>=1 and S.lv(p, "weakRev")>=1
	var _holyW3F: bool = not _holyW4F and S.flag(p, "holyWeak3") and S.lv(p, "holyDome")>=1 and S.lv(p, "weakPj")>=1
	var _holyW2F: bool = not _holyW4F and not _holyW3F and S.flag(p, "holyWeak2") and S.lv(p, "holyDome")>=1 and S.lv(p, "weakMag")>=1
	var _holyW1F: bool = not _holyW4F and not _holyW3F and not _holyW2F and S.flag(p, "holyWeak1") and S.lv(p, "holyDome")>=1 and S.lv(p, "weakPhys")>=1
	var _holyIceF: bool = not _holyW4F and not _holyW3F and not _holyW2F and not _holyW1F and S.lv(p, "holyDome")>=1 and S.lv(p, "holyPrison")>=1 and S.lv(p, "iceStorm")>=1 and S.flag(p, "holyIce")
	var _holyFuseF: bool = not _holyW4F and not _holyW3F and not _holyW2F and not _holyW1F and not _holyIceF and (S.lv(p, "holyDome")>=1 and S.lv(p, "holyPrison")>=1 and S.flag(p, "holyFuse"))
	var _isHolyW4: bool = skill_id=='holyDome' and _holyW4F
	var _isHolyW3: bool = skill_id=='holyDome' and _holyW3F
	var _isHolyW2: bool = skill_id=='holyDome' and _holyW2F
	var _isHolyW1: bool = skill_id=='holyDome' and _holyW1F
	var _isHolyIce: bool = skill_id=='holyDome' and _holyIceF
	var _isHolyFuse: bool = skill_id=='holyDome' and _holyFuseF
	var _pillarSlamF: bool = S.lv(p, "giantSlam2")>=1 and S.lv(p, "darkPillar")>=1 and S.flag(p, "pillarSlam")
	var _pillarSpikeF: bool = S.lv(p, "darkPillar")>=1 and S.lv(p, "spikeTrap")>=1 and S.flag(p, "pillarSpike") and not _pillarSlamF
	var _isPillarSlam: bool = skill_id=='giantSlam2' and _pillarSlamF
	var _isPillarSpike: bool = skill_id=='darkPillar' and _pillarSpikeF
	var _infernoSlamF: bool = S.lv(p, "giantSlam2")>=1 and S.lv(p, "fireAura")>=1 and S.flag(p, "infernoSlam") and not _pillarSlamF
	var _isInfernoSlam: bool = skill_id=='giantSlam2' and _infernoSlamF
	var _siegeGhostF: bool = S.lv(p, "ghostXbowTurret")>=1 and S.lv(p, "voidScarecrow")>=1 and S.flag(p, "siegeGhost")
	var _isSiegeGhost: bool = skill_id=='ghostXbowTurret' and _siegeGhostF
	var _dualScarecrowF: bool = S.lv(p, "voidScarecrow")>=1 and S.lv(p, "explodeScarecrow")>=1 and S.flag(p, "dualScarecrow")
	var _isDualScarecrow: bool = skill_id=='voidScarecrow' and _dualScarecrowF
	var _thunderGhostF: bool = S.lv(p, "bladeDash")>=1 and S.lv(p, "thunderStake")>=1 and S.flag(p, "thunderGhost")
	var _isThunderGhost: bool = skill_id=='bladeDash' and _thunderGhostF
	var _timeStepF: bool = S.lv(p, "timeWarp")>=1 and S.lv(p, "ghostWalk")>=1 and S.flag(p, "timeStep")
	var _isTimeStep: bool = skill_id=='timeWarp' and _timeStepF
	var _stormBurstF: bool = _stormBeamF and S.lv(p, "burstLoop")>=1 and S.flag(p, "stormBurst")
	var _isStormBurst: bool = skill_id=='whirlwind' and _stormBurstF
	return {"_dimFuse":_dimFuse, "_dimSlamF":_dimSlamF, "_dimThunderF":_dimThunderF, "_dimRushF":_dimRushF, "_dimBlastF":_dimBlastF, "_isDimBlast":_isDimBlast, "_isDimRush":_isDimRush, "_isDimThunder":_isDimThunder, "_isDimSlam":_isDimSlam, "_isDimFuse":_isDimFuse, "_stormBeamF":_stormBeamF, "_slamStormF":_slamStormF, "_synth":_synth, "_isStormBeam":_isStormBeam, "_isSlamStorm":_isSlamStorm, "_isSynth":_isSynth, "_bladeFuse":_bladeFuse, "_isBladeFuse":_isBladeFuse, "_iceMortarFuse":_iceMortarFuse, "_isIceFuse":_isIceFuse, "_elemFuseF":_elemFuseF, "_sixFuse":_sixFuse, "_isElemFuse":_isElemFuse, "_isSixFuse":_isSixFuse, "_elecRepentF":_elecRepentF, "_boneStormF":_boneStormF, "_isElecRepent":_isElecRepent, "_isBoneStorm":_isBoneStorm, "_shieldFuseF":_shieldFuseF, "_isShieldFuse":_isShieldFuse, "_plagueFuseF":_plagueFuseF, "_plagueVenomF":_plagueVenomF, "_isPlagueVenom":_isPlagueVenom, "_isPlagueFuse":_isPlagueFuse, "_holyW4F":_holyW4F, "_holyW3F":_holyW3F, "_holyW2F":_holyW2F, "_holyW1F":_holyW1F, "_holyIceF":_holyIceF, "_holyFuseF":_holyFuseF, "_isHolyW4":_isHolyW4, "_isHolyW3":_isHolyW3, "_isHolyW2":_isHolyW2, "_isHolyW1":_isHolyW1, "_isHolyIce":_isHolyIce, "_isHolyFuse":_isHolyFuse, "_pillarSlamF":_pillarSlamF, "_pillarSpikeF":_pillarSpikeF, "_isPillarSlam":_isPillarSlam, "_isPillarSpike":_isPillarSpike, "_infernoSlamF":_infernoSlamF, "_isInfernoSlam":_isInfernoSlam, "_siegeGhostF":_siegeGhostF, "_isSiegeGhost":_isSiegeGhost, "_dualScarecrowF":_dualScarecrowF, "_isDualScarecrow":_isDualScarecrow, "_thunderGhostF":_thunderGhostF, "_isThunderGhost":_isThunderGhost, "_timeStepF":_timeStepF, "_isTimeStep":_isTimeStep, "_stormBurstF":_stormBurstF, "_isStormBurst":_isStormBurst}

static func _key(flags: Dictionary) -> Variant:
	if not (flags["_isStormBurst"] or flags["_isStormBeam"] or flags["_isDimBlast"] or flags["_isDimRush"] or flags["_isDimFuse"] or flags["_isDimSlam"] or flags["_isDimThunder"] or flags["_isSlamStorm"] or flags["_isSynth"] or flags["_isElemFuse"] or flags["_isSixFuse"] or flags["_isBladeFuse"] or flags["_isIceFuse"] or flags["_isBoneStorm"] or flags["_isElecRepent"] or flags["_isShieldFuse"] or flags["_isPlagueFuse"] or flags["_isPlagueVenom"] or flags["_isHolyFuse"] or flags["_isHolyIce"] or flags["_isHolyW1"] or flags["_isHolyW2"] or flags["_isHolyW3"] or flags["_isHolyW4"] or flags["_isPillarSlam"] or flags["_isPillarSpike"] or flags["_isInfernoSlam"] or flags["_isSiegeGhost"] or flags["_isDualScarecrow"] or flags["_isThunderGhost"] or flags["_isTimeStep"]): return null
	if flags["_isStormBurst"]: return "stormBurst"
	if flags["_isStormBeam"]: return "stormBeam"
	if flags["_isDimBlast"]: return "dimBlast"
	if flags["_isDimRush"]: return "dimRush"
	if flags["_isDimThunder"]: return "dimThunder"
	if flags["_isDimSlam"]: return "dimSlam"
	if flags["_isDimFuse"]: return "dimBreach"
	if flags["_isSlamStorm"]: return "slamStorm"
	if flags["_isSynth"]: return "whirlDet"
	if flags["_isElemFuse"]: return "elemFuse"
	if flags["_isSixFuse"]: return "sixFuse"
	if flags["_isBladeFuse"]: return "bladeFuse"
	if flags["_isBoneStorm"]: return "boneStorm"
	if flags["_isElecRepent"]: return "elecRepent"
	if flags["_isShieldFuse"]: return "shieldFuse"
	if flags["_isPlagueVenom"]: return "plagueVenom"
	if flags["_isPlagueFuse"]: return "plagueFuse"
	if flags["_isPillarSlam"]: return "pillarSlam"
	if flags["_isPillarSpike"]: return "pillarSpike"
	if flags["_isInfernoSlam"]: return "infernoSlam"
	if flags["_isSiegeGhost"]: return "siegeGhost"
	if flags["_isDualScarecrow"]: return "dualScarecrow"
	if flags["_isThunderGhost"]: return "thunderGhost"
	if flags["_isTimeStep"]: return "timeStep"
	if flags["_isHolyW4"]: return "holyWeak4"
	if flags["_isHolyW3"]: return "holyWeak3"
	if flags["_isHolyW2"]: return "holyWeak2"
	if flags["_isHolyW1"]: return "holyWeak1"
	if flags["_isHolyIce"]: return "holyIce"
	if flags["_isHolyFuse"]: return "holyFuse"
	return "iceMortar"

static func context(skill_id: Variant, fixture: Variant) -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var sk := S.definition(skill_id)
	if sk.status != "READY": return sk
	var p: Dictionary = fixture.p
	var level := S.lv(p, skill_id)
	var key: Variant = _key(_flags(skill_id, p))
	var display_cost := 0
	var fuse_can_up := false
	if key != null:
		var fuse_level := S.min_level(p, S.members(key))
		display_cost = S.fuse_cost(fuse_level, S.star(key))
		fuse_can_up = fuse_level < 20 and p.sp >= display_cost
	var single_cost := S.up_cost(level)
	var locked := S.lock_level(p)
	var can_up: bool = (level >= 1 and sk.value.get("up", false) and level < 20 and level < locked
		and p.sp >= single_cost and fixture.g.mats >= S.mal_cost(sk.value.get("upMat", 0)) and key == null) or (fuse_can_up and level < locked)
	return S.ready({"level":level,"learned":level >= 1,"lock":locked,"fusion_key":key,
		"fuse_display_cost":display_cost,"fuse_can_up":fuse_can_up,"single_cost":single_cost,"can_up":can_up})

static func preview(skill_id: Variant, fixture: Variant, mode: String = "ui") -> Dictionary:
	var checked := S.prepare(fixture)
	if checked.status != "READY": return checked
	var ctx := context(skill_id, fixture)
	if ctx.status != "READY": return ctx
	if not mode in ["ui","direct"]: return S.nr("unsupported_upgrade_mode")
	var f: Dictionary = checked.value
	var c: Dictionary = ctx.value
	if not c.learned: return S.nr("handler_enters_learning_not_upgrade")
	if mode == "ui" and (not c.can_up or not S.card_visible(S.definition(skill_id).value,fixture.p)): return S.finish(fixture,f,false,"ui_gate",c)
	if c.fusion_key != null:
		var ids := S.members(c.fusion_key)
		var level := S.min_level(f.p, ids)
		if level >= 20: return S.finish(fixture,f,false,"max_level",c)
		# Source direct fused handler checks max/SP, but not player-level lock/minLv.
		var actual := S.fuse_cost(level, ids.size())
		c["actual_cost"] = actual
		if f.p.sp < actual: return S.finish(fixture,f,false,"resources",c)
		for id in ids: f.p.skills[id] = maxi(S.lv(f.p,id,1), level + 1)
		f.p.sp -= actual
		return S.finish(fixture,f,true,"fusion_upgraded",c)
	if c.level >= 20 or c.level >= c.lock: return S.finish(fixture,f,false,"level_lock",c)
	var sk: Dictionary = S.definition(skill_id).value
	var material := S.mal_cost(sk.get("upMat", 0))
	if f.p.sp < c.single_cost or f.g.mats < material: return S.finish(fixture,f,false,"resources",c)
	f.p.skills[skill_id] += 1
	f.p.sp -= c.single_cost
	f.g.mats -= material
	return S.finish(fixture,f,true,"single_upgraded",c)
