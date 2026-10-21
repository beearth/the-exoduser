extends RefCounted
## BC07: six switch states for slash/slam/sweep+tail, after BC05 st2 decrement.
## Contact is an UNEXECUTED protected-owner request, never local Q/E/damage logic.
const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CatalogContext = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossSlashWind","bossSlash","bossSlamWind","bossSlam","bossSweepWind","bossSweep"]

static func source_receipt() -> Dictionary:
	return {"source_main":"e556b617190c325ca39f5add04357f5dea5ca87e",
		"game_sha256":preload("res://source_snapshot/snapshot.gd").SHA256,
		"dependency":"BC06 1110eec6c2deacd43c6c20dd52affff33d4e4d47",
		"source_ranges":[[41074,41109],[41111,41142],[41144,41183]],"states":STATES.duplicate(),
		"live_combat_connected":false,"damage_or_parry_execution_verified":false,"new_hit_latch":false}

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, options: Dictionary = {}, chapter_catalog: Variant = null) -> Dictionary:
	var resolved: Dictionary = CatalogContext.resolve(chapter_catalog)
	if not resolved["ready"]: return _fail(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	if not data_catalog.boss_for_stage(si).get("supported",false): return _fail("unsupported_chapter_stage")
	if not STATES.has(enemy.get("s")): return _fail("unsupported_melee_state")
	if not _actor(enemy) or not _player(player) or not _num(sp): return _fail("state_snapshot_unsupported")
	var result: Dictionary = {"status":"READY","continuation":{"version":1,"si":si,"kind":enemy["s"],"enemy":enemy.duplicate(true),
		"player":player.duplicate(true),"options":options.duplicate(true),"sp":sp,"step":"entry","pending":"","index":0},"full_tick_complete":false}
	CatalogContext.bind(result["continuation"],chapter_catalog)
	return result

## The previous owner must acknowledge each call. Contact additionally requires
## its actual COMPLETE actor/player readback; neither ack nor fixture snapshots
## establish a real hit, parry, immunity, HP change or boss_hurtE adoption.
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("step") is String or not token.get("pending") is String or not STATES.has(token.get("kind")) \
		or not token.get("si") is int: return _fail("continuation_shape_unsupported")
	var resolved: Dictionary = CatalogContext.from_token(token)
	if not resolved["ready"]: return _fail(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	if not data_catalog.boss_for_stage(token["si"]).get("supported",false): return _fail("continuation_shape_unsupported")
	var state: Dictionary = token.duplicate(true)
	var e: Dictionary = state["enemy"]
	var p: Dictionary = state["player"]
	var events: Array = []
	var ledger: Array = []
	var pending: String = state["pending"]
	if pending!="":
		if not response is Dictionary or response.get("ack")!=true: return _fail("owner_ack_missing")
		if pending=="move":
			if not response.get("value") is bool: return _fail("collision_result_missing")
			if response["value"]: _write(e,{"x":state["move_x"],"y":state["move_y"]},state["move_line"],events)
		elif pending=="contact":
			if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
				or not _actor(response["enemy_after"]) or not _player(response["player_after"]): return _fail("protected_contact_owner_readback_missing")
			state["enemy"]=response["enemy_after"].duplicate(true)
			state["player"]=response["player_after"].duplicate(true)
			e=state["enemy"]
			p=state["player"]
		elif pending!="ack": return _fail("pending_kind_unsupported")
		state["pending"]=""
	if not _actor(e) or not _player(p): return _fail("state_snapshot_unsupported")
	var kind: String = state["kind"]
	while state["step"]!="done":
		match state["step"]:
			"entry":
				if kind.ends_with("Wind"):
					var line: int = 41075 if kind=="bossSlashWind" else (41112 if kind=="bossSlamWind" else 41145)
					_write(e,{"facing":_aim(e,p)},line,events)
					if kind=="bossSlashWind": _write(e,{"_weaponAng":-0.8+sin(e["st2"]*0.3)*0.3},41076,events)
					elif kind=="bossSlamWind": _write(e,{"_weaponAng":-1.2+sin(e["st2"]*0.15)*0.2},41113,events)
					else:
						var dir: Variant = _or_num(e.get("_sweepDir"),1)
						if dir==null: return _fail("sweep_direction_unsupported")
						_write(e,{"_weaponAng":dir*-1.2},41146,events)
					state["step"]="slam_approach" if kind=="bossSlamWind" else "wind_rng"
				elif kind=="bossSlash":
					state["progress"]=1-e["st2"]/10.0
					_write(e,{"_weaponAng":-0.8+state["progress"]*2.0},41082,events)
					state["step"]="slash_move"
				elif kind=="bossSlam":
					_write(e,{"_weaponAng":-1.2+(1-e["st2"]/8.0)*2.4},41121,events)
					if e["st2"]>0: state["step"]="done"
					else:
						_write(e,{"_weaponAng":0},41124,events)
						var phase: Variant = _or_num(e.get("_bossPhase"),0)
						if phase==null: return _fail("actor_phase_unsupported")
						state["slam_radius"]=1000+state["si"]*30+phase*80
						state["step"]="slam_contact"
				else:
					state["progress"]=1-e["st2"]/14.0
					var dir: Variant = _or_num(e.get("_sweepDir"),1)
					if dir==null: return _fail("sweep_direction_unsupported")
					_write(e,{"_weaponAng":dir*(-1.2+state["progress"]*2.8)},41152,events)
					state["step"]="sweep_contact"
			"slam_approach", "slash_move":
				var slash: bool = state["step"]=="slash_move"
				state["step"]="slash_contact" if slash else "wind_rng"
				if slash or _distance(e,p)>50:
					var speed: float = 2.5 if slash else 1.5
					state["move_x"]=e["x"]+cos(e["facing"])*speed*state["sp"]
					state["move_y"]=e["y"]+sin(e["facing"])*speed*state["sp"]
					state["move_line"]=41085 if slash else 41116
					return _command(state,"canMv",state["move_line"],[state["move_x"],state["move_y"],e["r"]],events,ledger,"move")
			"wind_rng":
				state["step"]="wind_end"
				var line: int = 41077 if kind=="bossSlashWind" else (41117 if kind=="bossSlamWind" else 41147)
				var gate: Dictionary = _draw(rng,"wind_particle_gate",line,events,ledger)
				if not gate["ok"]: return _fail(gate["reason"],ledger)
				var threshold: float = 0.5 if kind=="bossSlashWind" else (0.6 if kind=="bossSlamWind" else 0.7)
				if gate["unit"]>threshold:
					var ux: Dictionary = _draw(rng,"wind_particle_vx",line,events,ledger)
					if not ux["ok"]: return _fail(ux["reason"],ledger)
					var uy: Dictionary = _draw(rng,"wind_particle_vy",line,events,ledger)
					if not uy["ok"]: return _fail(uy["reason"],ledger)
					var slam: bool = kind=="bossSlamWind"
					return _command(state,"poolPart",line,[e["x"],e["y"],(ux["unit"]-0.5)*(4 if slam else 3),-uy["unit"]*4 if slam else (uy["unit"]-0.5)*3,
						"#ff4400" if slam else ("#ff8844" if kind=="bossSlashWind" else "#ffaa00"),3 if slam else 2,8 if slam else (6 if kind=="bossSlashWind" else 5)],events,ledger)
			"wind_end":
				state["step"]="done"
				if e["st2"]<=0:
					var line: int = 41078 if kind=="bossSlashWind" else (41118 if kind=="bossSlamWind" else 41148)
					var fields: Dictionary = {"s":"bossSlash" if kind=="bossSlashWind" else ("bossSlam" if kind=="bossSlamWind" else "bossSweep"),"st2":10 if kind=="bossSlashWind" else (8 if kind=="bossSlamWind" else 14)}
					if kind=="bossSlashWind": fields["_weaponAng"]=-0.8
					_write(e,fields,line,events)
					return _command(state,"SFX.groggy" if kind=="bossSlamWind" else "SFX.swing",line,[],events,ledger)
			"slash_contact", "slam_contact", "sweep_contact":
				var family: String = state["step"].trim_suffix("_contact")
				state["step"]="slash_particles" if family=="slash" else ("slam_shock" if family=="slam" else "sweep_trail1")
				var hit: bool = false
				if family=="slam": hit=_distance(e,p)<state["slam_radius"] and p["iframes"]<=0
				else:
					var prog: float = state["progress"]
					var lo: float = 0.3 if family=="slash" else 0.15
					var hi: float = 0.7 if family=="slash" else 0.85
					var radius: float = e["r"]+p["r"]+(300 if family=="slash" else 400)
					hit=prog>lo and prog<hi and _distance(e,p)<radius and p["iframes"]<=0
					if hit: hit=_angle_diff(_aim(e,p),e["facing"])<(1.2 if family=="slash" else 1.7)
				if hit:
					var descriptor: Dictionary = _contact(family,e)
					return _command(state,"resolve_boss_melee_contact",descriptor["source_lines"][0],[descriptor],events,ledger,"contact")
			"slash_particles":
				state["step"]="slash_end"
				if state["progress"]>0.2 and state["progress"]<0.8:
					if not _num(e.get("_weaponAng")): return _fail("post_contact_weapon_angle_missing")
					var angle: float = e["facing"]+e["_weaponAng"]
					return _command(state,"poolPart",41100,[e["x"]+cos(angle)*25,e["y"]+sin(angle)*25,cos(angle)*5,sin(angle)*5,"#ffaa44",3,6],events,ledger)
			"slash_end":
				state["step"]="done"
				if e["st2"]<=0:
					if not _numbers(e,["_slashIdx","_slashCnt"]) or not _options(state,["shake"]): return _fail("slash_counter_or_option_missing")
					_write(e,{"_slashIdx":e["_slashIdx"]+1},41103,events)
					if e["_slashIdx"]<e["_slashCnt"]:
						_write(e,{"facing":_aim(e,p)},41105,events)
						_write(e,{"s":"bossSlash"},41106,events)
						var draw: Dictionary = _draw(rng,"slash_repeat_timer",41106,events,ledger)
						if not draw["ok"]: return _fail(draw["reason"],ledger)
						_write(e,{"st2":8+_i32(draw["unit"]*4),"_weaponAng":-0.8},41106,events)
						_global("shake",3*state["options"]["shake"]/100.0,41107,events)
						return _command(state,"SFX.swing",41107,[],events,ledger)
					_write(e,{"s":"recover","st2":25,"_weaponAng":0},41108,events)
					_global("shake",5*state["options"]["shake"]/100.0,41108,events)
			"slam_shock":
				if not _options(state,["shake","hit_stop"]): return _fail("slam_option_reader_missing")
				_write(e,{"shockR":0,"shockMax":state["slam_radius"]},41134,events)
				_global("shake",14*state["options"]["shake"]/100.0,41135,events)
				_global("hitStop",_i32(8*state["options"]["hit_stop"]/100.0),41135,events)
				state["index"]=0
				state["step"]="slam_ring"
			"slam_ring":
				var i: int = state["index"]
				if i>=16:
					state["index"]=0
					state["step"]="slam_dust"
					continue
				state["index"]+=1
				var angle: float = PI*2*i/16.0
				var draw: Dictionary = _draw(rng,"slam_ring_size",41138,events,ledger)
				if not draw["ok"]: return _fail(draw["reason"],ledger)
				return _command(state,"poolPart",41138,[e["x"]+cos(angle)*15,e["y"]+sin(angle)*15,cos(angle)*6,sin(angle)*6,"#996633",4+draw["unit"]*3,14],events,ledger)
			"slam_dust":
				if state["index"]>=10:
					state["step"]="slam_vfx"
					continue
				state["index"]+=1
				var units: Array = []
				for tag: String in ["slam_dust_x","slam_dust_y","slam_dust_vx","slam_dust_vy","slam_dust_size"]:
					var draw: Dictionary = _draw(rng,tag,41139,events,ledger)
					if not draw["ok"]: return _fail(draw["reason"],ledger)
					units.append(draw["unit"])
				return _command(state,"poolPart",41139,[e["x"]+(units[0]-0.5)*40,e["y"]+(units[1]-0.5)*40,(units[2]-0.5)*3,-units[3]*5-2,"#ff6600",2+units[4]*2,10],events,ledger)
			"slam_vfx":
				state["step"]="slam_end"
				return _command(state,"playVFXAng",41140,["boss_meteor_hit",e["x"],e["y"],150.0/768,2,0,false],events,ledger)
			"slam_end":
				_write(e,{"s":"recover","st2":40},41141,events)
				state["step"]="done"
			"sweep_trail1", "sweep_trail2":
				var first: bool = state["step"]=="sweep_trail1"
				state["step"]="sweep_trail2" if first else "sweep_end"
				if state["progress"]>0.1:
					if not _num(e.get("_weaponAng")): return _fail("post_contact_weapon_angle_missing")
					var angle: float = e["facing"]+e["_weaponAng"]
					var radius: float = e["r"]*1.8+6
					if not first: radius*=0.7
					return _command(state,"poolPart",41169 if first else 41170,[e["x"]+cos(angle)*radius,e["y"]+sin(angle)*radius,cos(angle)*(4 if first else 2),sin(angle)*(4 if first else 2),"#ffcc44" if first else "#ff8800",4 if first else 2,8 if first else 5],events,ledger)
			"sweep_end":
				if e["st2"]>0:
					state["step"]="done"
					continue
				_write(e,{"_weaponAng":0},41173,events)
				var phase: Variant = _or_num(e.get("_bossPhase"),0)
				if phase==null: return _fail("actor_phase_unsupported")
				state["step"]="sweep_shots" if phase>=2 else "sweep_recover"
				state["index"]=-2
			"sweep_shots":
				if state["index"]>2:
					state["step"]="sweep_recover"
					return _command(state,"addTxt",41180,[e["x"],e["y"]-20,"wind!","#ffcc00",20],events,ledger)
				var angle: float = e["facing"]+state["index"]*0.25
				state["index"]+=1
				return _command(state,"_spawnBossProjectile",41179,[{"x":e["x"]+cos(angle)*20,"y":e["y"]+sin(angle)*20,"vx":cos(angle)*4,"vy":sin(angle)*4,
					"dmg":_i32(e["atk"]*0.8),"el":e["el"],"friendly":false,"life":200,"ml":200,"col":"#ffaa00","sz":2}],events,ledger)
			"sweep_recover":
				if not _options(state,["shake"]): return _fail("sweep_option_reader_missing")
				_write(e,{"s":"recover","st2":30},41182,events)
				_global("shake",6*state["options"]["shake"]/100.0,41182,events)
				state["step"]="done"
			_: return _fail("unknown_melee_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _contact(family: String, e: Dictionary) -> Dictionary:
	return {"family":family,"source_lines":[41091,41094] if family=="slash" else ([41128,41131] if family=="slam" else [41159,41162]),"actor_ref":"boss",
		"hurtP_formula":{"atk":e["atk"],"multiplier":1.5 if family=="slash" else (2.2 if family=="slam" else 1.8),"element":e["el"],"elemental_provider":"elMul(e.el,ar().el)","rounding":"ToInt32_after_elemental"},
		"parry_formula":{"multiplier":4 if family=="slam" else 3,"stunned":80 if family=="slam" else 60,"poise":20,"angle":e["facing"]+PI,
			"formula":"ToInt32((P.baseAtk+(wp().atk||0)+enhMulAtk(wp().enh||0))*multiplier*pParryDmg())"},
		"knockback":7 if family=="slash" else (14 if family=="slam" else 10),
		"requires":["isPWin","hurtP","boss_hurtE","doParry","poise_owner"],"combat_verified":false}

static func _command(state: Dictionary, name: String, line: int, args: Array, events: Array, ledger: Array, pending: String="ack") -> Dictionary:
	state["pending"]=pending
	var command: Dictionary = {"command":name,"source_line":line,"args":args,"executed":false}
	events.append({"kind":"command","value":command})
	return {"status":"READY","done":false,"enemy":state["enemy"].duplicate(true),"player":state["player"].duplicate(true),"events":events,"rng_ledger":ledger,"command":command,"continuation":state,"full_tick_complete":false}

static func _write(e: Dictionary, fields: Dictionary, line: int, events: Array) -> void:
	for key in fields:
		e[key]=fields[key]
		events.append({"kind":"write","field":key,"value":fields[key],"source_line":line})

static func _global(key: String, value: Variant, line: int, events: Array) -> void:
	events.append({"kind":"global_write","field":key,"value":value,"source_line":line})

static func _draw(rng: Callable, tag: String, line: int, events: Array, ledger: Array) -> Dictionary:
	if not rng.is_valid(): return {"ok":false,"reason":"rng_provider_missing"}
	var unit: Variant = rng.call(tag)
	var row: Dictionary = {"field":tag,"source_line":line,"unit":unit}
	events.append({"kind":"rng","value":row})
	ledger.append(row)
	if not _num(unit) or unit<0 or unit>=1: return {"ok":false,"reason":"rng_unit_invalid"}
	return {"ok":true,"unit":unit}

static func _distance(e: Dictionary,p: Dictionary) -> float:
	return sqrt((p["x"]-e["x"])*(p["x"]-e["x"])+(p["y"]-e["y"])*(p["y"]-e["y"]))
static func _aim(e: Dictionary,p: Dictionary) -> float: return atan2(p["y"]-e["y"],p["x"]-e["x"])
static func _angle_diff(a: float,b: float) -> float: return absf(fmod(fmod(a-b,PI*2)+PI*3,PI*2)-PI)
static func _options(state: Dictionary,keys: Array) -> bool: return state.get("options") is Dictionary and _numbers(state["options"],keys)
static func _actor(e: Dictionary) -> bool: return _numbers(e,["x","y","r","facing","st2","atk","el"]) and e.get("s") is String
static func _player(p: Dictionary) -> bool: return _numbers(p,["x","y","r","iframes"]) and p.get("s") is String
static func _or_num(value: Variant, fallback: float) -> Variant: return fallback if value==null or value==0 else (value if _num(value) else null)
static func _num(value: Variant) -> bool: return (value is int or value is float) and is_finite(float(value))
static func _numbers(object: Dictionary,keys: Array) -> bool:
	for key: String in keys:
		if not _num(object.get(key)): return false
	return true
static func _i32(value: float) -> int:
	if not is_finite(value) or value==0: return 0
	var wrapped: float=fmod(floor(value) if value>=0 else ceil(value),4294967296.0)
	if wrapped<0: wrapped+=4294967296.0
	if wrapped>=2147483648.0: wrapped-=4294967296.0
	return int(wrapped)
static func _fail(reason: String,ledger: Array=[]) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"enemy":null,"player":null,"continuation":null,"command":null,"rng_ledger":ledger,"full_tick_complete":false}
