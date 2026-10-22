extends RefCounted
## BC2-04: vortex switch packets AFTER the shared BC05 clock checkpoint.
## No actual player KB, hurtP, particles, RNG singleton, clock or Main connection.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossVortexWind","bossVortex"]
const _OWNER = "BC2-04/vortex/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[40907,40943],"states":STATES.duplicate(),"clock":"BC05 already decremented st2",
		"live_combat_connected":false,"damage_execution_verified":false,"full_tick_complete":false}

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, options: Dictionary = {}) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not STATES.has(enemy.get("s")): return Common._fail("unsupported_vortex_state")
	if not _actor(enemy) or not _player(player) or not Common._num(sp): return Common._fail("state_snapshot_unsupported")
	if enemy["s"]=="bossVortex" and not Common._numbers(options,["now_msec","shake"]): return Common._fail("clock_or_option_reader_missing")
	var token: Dictionary = {"version":1,"owner":_OWNER,"si":si,"kind":enemy["s"],"enemy":enemy.duplicate(true),
		"player":player.duplicate(true),"options":options.duplicate(true),"sp":sp,"step":"entry","pending":"","index":0}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

## A damage request requires COMPLETE enemy/player readback from its owner.
## Cached pd is retained for the source tick; explosion distance is recomputed.
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not STATES.has(token.get("kind")) \
		or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("step") is String or not token.get("pending") is String \
		or not Common._num(token.get("sp")) or not token.get("options") is Dictionary:
		return Common._fail("vortex_continuation_required")
	var resolved: Dictionary = Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary = token.duplicate(true)
	var e: Dictionary = state["enemy"]
	var p: Dictionary = state["player"]
	var events: Array = []
	var ledger: Array = []
	var pending: String = state["pending"]
	if pending!="":
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		if pending in ["move_xy","move_x","move_y"]:
			if not response.get("value") is bool: return Common._fail("collision_result_missing")
			if response["value"]:
				if pending=="move_xy": Common._write(e,{"x":state["move_x"],"y":state["move_y"]},40915,events)
				elif pending=="move_x": Common._write(e,{"x":e["x"]+state["dx"]},40916,events)
				else: Common._write(e,{"y":e["y"]+state["dy"]},40916,events)
			else:
				if pending=="move_xy": state["step"]="collision_x"
				elif pending=="move_x": state["step"]="collision_y"
		elif pending in ["damage_tick","damage_explosion"]:
			if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
				or not _actor(response["enemy_after"]) or not _player(response["player_after"]):
				return Common._fail("protected_damage_owner_readback_missing")
			state["enemy"]=response["enemy_after"].duplicate(true)
			state["player"]=response["player_after"].duplicate(true)
			e=state["enemy"]
			p=state["player"]
		elif pending!="ack": return Common._fail("pending_kind_unsupported")
		state["pending"]=""
	if not _actor(e) or not _player(p): return Common._fail("state_snapshot_unsupported")
	if state["kind"]=="bossVortex" and not Common._options(state,["now_msec","shake"]): return Common._fail("clock_or_option_reader_missing")
	while state["step"]!="done":
		match state["step"]:
			"entry":
				if state["kind"]=="bossVortexWind": state["step"]="wind_rng"
				else:
					var angle: float = Common._aim(e,p)
					var speed: float = e["speed"]*0.4*state["sp"]
					state["dx"]=cos(angle)*speed
					state["dy"]=sin(angle)*speed
					state["move_x"]=e["x"]+state["dx"]
					state["move_y"]=e["y"]+state["dy"]
					state["step"]="collision_xy"
			"wind_rng":
				state["step"]="wind_end"
				var gate: Dictionary = Common._draw(rng,"vortex_wind_gate",40908,events,ledger)
				if not gate["ok"]: return Common._fail(gate["reason"],ledger)
				if gate["unit"]>0.5:
					var units: Array = []
					for tag: String in ["vortex_wind_x","vortex_wind_y","vortex_wind_vx","vortex_wind_vy"]:
						var draw: Dictionary = Common._draw(rng,tag,40908,events,ledger)
						if not draw["ok"]: return Common._fail(draw["reason"],ledger)
						units.append(draw["unit"])
					return Common._command(state,"poolPart",40908,[e["x"]+(units[0]-0.5)*30,e["y"]+(units[1]-0.5)*30,
						(e["x"]-(e["x"]+(units[2]-0.5)*30))*0.1,(e["y"]-(e["y"]+(units[3]-0.5)*30))*0.1,"#6644ff",2,10],events,ledger)
			"wind_end":
				state["step"]="done"
				if e["st2"]<=0:
					Common._write(e,{"s":"bossVortex","st2":80},40909,events)
					return Common._command(state,"SFX.charge",40909,[],events,ledger)
			"collision_xy", "collision_x", "collision_y":
				var step: String = state["step"]
				state["step"]="post_move"
				var x: float = state["move_x"] if step=="collision_xy" else (e["x"]+state["dx"] if step=="collision_x" else e["x"])
				var y: float = state["move_y"] if step=="collision_xy" else (e["y"]+state["dy"] if step=="collision_y" else e["y"])
				return Common._command(state,"canMv",40915 if step=="collision_xy" else 40916,[x,y,e["r"]],events,ledger,step.replace("collision_","move_"))
			"post_move":
				state["pd"]=Common._distance(e,p)
				if state["pd"]<180+state["si"]*5 and state["pd"]>15:
					var pull: float = 3+e["_bossPhase"]*1.5
					var angle: float = atan2(e["y"]-p["y"],e["x"]-p["x"])
					_kb(p,cos(angle)*pull*state["sp"]*0.1,sin(angle)*pull*state["sp"]*0.1,40923,events)
				state["step"]="tick_gate"
			"tick_gate":
				state["step"]="particles_begin"
				if state["pd"]<40 and p["iframes"]<=0 and p["s"]!="charge" and fmod(e["st2"],30)<state["sp"]:
					state["step"]="tick_text"
					return Common._command(state,"resolve_vortex_damage",40927,[_damage("tick",e)],events,ledger,"damage_tick")
			"tick_text":
				state["step"]="particles_begin"
				return Common._command(state,"addTxt",40927,[p["x"],p["y"]-15,"🌀","#6644ff",15],events,ledger)
			"particles_begin":
				state["particle_angle"]=state["options"]["now_msec"]/200.0+e["st2"]*0.1
				state["index"]=0
				state["step"]="particles"
			"particles":
				if state["index"]>=3:
					state["step"]="explosion_gate"
					continue
				var angle: float = state["particle_angle"]+PI*2*state["index"]/3.0
				state["index"]+=1
				var radius: float = 20+e["st2"]*0.5
				var draw: Dictionary = Common._draw(rng,"vortex_active_size",40932,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				return Common._command(state,"poolPart",40932,[e["x"]+cos(angle)*radius,e["y"]+sin(angle)*radius,-cos(angle)*2,-sin(angle)*2,"#6644ff",2+draw["unit"]*2,8],events,ledger)
			"explosion_gate":
				state["step"]="done"
				if e["st2"]<=0:
					state["step"]="explosion_parts"
					if Common._distance(e,p)<100+state["si"]*5 and p["iframes"]<=0 and p["s"]!="charge":
						state["step"]="explosion_kb"
						return Common._command(state,"resolve_vortex_damage",40937,[_damage("explosion",e)],events,ledger,"damage_explosion")
			"explosion_kb":
				var angle: float = Common._aim(e,p)
				_kb(p,cos(angle)*15,sin(angle)*15,40938,events)
				state["step"]="explosion_parts"
			"explosion_parts":
				state["step"]="explosion_sound"
				return Common._command(state,"addParts",40940,[e["x"],e["y"],"#6644ff",30],events,ledger)
			"explosion_sound":
				Common._global("shake",12*state["options"]["shake"]/100.0,40940,events)
				state["step"]="explosion_end"
				return Common._command(state,"SFX.groggy",40940,[],events,ledger)
			"explosion_end":
				Common._write(e,{"s":"recover","st2":65},40941,events)
				state["step"]="done"
			_: return Common._fail("unknown_vortex_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _damage(family: String,e: Dictionary) -> Dictionary:
	var result: Dictionary = {"family":"vortex_"+family,"actor_ref":"boss",
		"hurtP_formula":{"atk":e["atk"],"multiplier":0.6 if family=="tick" else 2,"element":e["el"],
			"elemental_provider":"elMul(e.el,ar().el)","rounding":"ToInt32_after_elemental"},
		"options_omitted":family!="tick","requires":["elMul","ar","hurtP","complete_enemy_player_readback"],"combat_verified":false}
	if family=="tick": result["options"]={"dtype":"magic"}
	return result
static func _kb(p: Dictionary,x: float,y: float,line: int,events: Array) -> void:
	var writes: Array = []
	Common._write(p["kb"],{"x":p["kb"]["x"]+x,"y":p["kb"]["y"]+y},line,writes)
	for event: Dictionary in writes:
		event["kind"]="player_write"
		event["field"]="kb."+event["field"]
		events.append(event)
static func _actor(e: Dictionary) -> bool: return Common._actor(e) and Common._numbers(e,["speed","_bossPhase"])
static func _player(p: Dictionary) -> bool: return Common._player(p) and p.get("kb") is Dictionary and Common._numbers(p["kb"],["x","y"])
