extends RefCounted
## BC2-05: post-BC05-clock beanRain switch packets, no live projectile/Main link.
## Projectile props are RAW. Source-undefined own fields travel as command metadata.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossBeanRainWind","bossBeanRain"]
const _OWNER = "BC2-05/bean-rain/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[41207,41231],"states":STATES.duplicate(),"clock":"BC05 already decremented st2",
		"projectile_props":"raw; restore source_undefined_fields before owner execution",
		"live_combat_connected":false,"projectile_or_parry_execution_verified":false,"full_tick_complete":false}

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, options: Dictionary = {}) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not STATES.has(enemy.get("s")): return Common._fail("unsupported_bean_rain_state")
	if not _actor(enemy) or not Common._player(player) or not Common._num(sp): return Common._fail("state_snapshot_unsupported")
	if enemy["s"]=="bossBeanRain" and not Common._numbers(options,["shake"]): return Common._fail("option_reader_missing")
	var token: Dictionary = {"version":1,"owner":_OWNER,"si":si,"kind":enemy["s"],"enemy":enemy.duplicate(true),
		"player":player.duplicate(true),"options":options.duplicate(true),"sp":sp,"step":"entry","pending":"","index":0}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

## Every helper request waits for ack. Owner-internal RNG consumption is caller supplied.
## No automatic projectile spawn, density/speed/damage postprocessing, parry or hurtP.
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not STATES.has(token.get("kind")) \
		or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("step") is String or not token.get("pending") is String \
		or not token.get("options") is Dictionary or not token.get("index") is int \
		or not Common._num(token.get("sp")): return Common._fail("bean_rain_continuation_required")
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
		if pending=="move":
			if not response.get("value") is bool: return Common._fail("collision_result_missing")
			if response["value"]: Common._write(e,{"x":e["x"]+state["dx"],"y":e["y"]+state["dy"]},41230,events)
		elif pending!="ack": return Common._fail("pending_kind_unsupported")
		state["pending"]=""
	if not _actor(e) or not Common._player(p): return Common._fail("state_snapshot_unsupported")
	if state["kind"]=="bossBeanRain" and not Common._options(state,["shake"]): return Common._fail("option_reader_missing")
	while state["step"]!="done":
		match state["step"]:
			"entry":
				if state["kind"]=="bossBeanRainWind":
					Common._write(e,{"facing":Common._aim(e,p)},41208,events)
					state["step"]="wind_rng"
				else:
					Common._write(e,{"_brT":e["_brT"]+state["sp"]},41212,events)
					Common._write(e,{"facing":Common._aim(e,p)},41213,events)
					state["step"]="move"
					if fmod(float(Common._i32(e["_brT"])),5)<state["sp"]:
						state["count"]=1+Common._i32(e["_bossPhase"]*0.3)
						state["index"]=0
						state["step"]="shots"
			"wind_rng":
				state["step"]="wind_end"
				var gate: Dictionary = Common._draw(rng,"bean_rain_wind_gate",41209,events,ledger)
				if not gate["ok"]: return Common._fail(gate["reason"],ledger)
				if gate["unit"]>0.4:
					var x: Dictionary = Common._draw(rng,"bean_rain_wind_x",41209,events,ledger)
					if not x["ok"]: return Common._fail(x["reason"],ledger)
					var y: Dictionary = Common._draw(rng,"bean_rain_wind_y",41209,events,ledger)
					if not y["ok"]: return Common._fail(y["reason"],ledger)
					return Common._command(state,"poolPart",41209,[e["x"]+(x["unit"]-0.5)*20,e["y"]+(y["unit"]-0.5)*20,0,-2,"#ff2200",2,8],events,ledger)
			"wind_end":
				state["step"]="done"
				if e["st2"]<=0:
					Common._write(e,{"s":"bossBeanRain","st2":e["_brDur"]},41210,events)
					return Common._command(state,"SFX.charge",41210,[],events,ledger)
			"shots":
				if state["index"]>=state["count"]:
					state["step"]="puff"
					continue
				var units: Array = []
				for site: Array in [["bean_rain_angle",41218],["bean_rain_speed",41219],["bean_rain_coin",41220],["bean_rain_x",41221],["bean_rain_y",41221]]:
					var draw: Dictionary = Common._draw(rng,site[0],site[1],events,ledger)
					if not draw["ok"]: return Common._fail(draw["reason"],ledger)
					units.append(draw["unit"])
				var angle: float = e["facing"]+(units[0]-0.5)*1.2
				var sampled_speed: float = 2.2+units[1]*2 # Consumed even for black.
				var black: bool = units[2]<0.5
				var speed: float = 4.0 if black else sampled_speed
				var shot: Dictionary = {"x":e["x"]+(units[3]-0.5)*15,"y":e["y"]+(units[4]-0.5)*15,
					"vx":cos(angle)*speed,"vy":sin(angle)*speed,"dmg":Common._i32(e["atk"]*(1.5 if black else 1.8)),
					"el":0 if black else e["el"],"friendly":false,"life":400 if black else 300,"ml":400 if black else 300,
					"col":"#00aa00" if black else "#cc1100","sz":2.0 if black else 1.5}
				if black: shot["blackBean"]=true
				else: shot.merge({"redBean":true,"homing":true})
				state["index"]+=1
				var packet: Dictionary = Common._command(state,"_spawnBossProjectile",41221,[shot],events,ledger)
				packet["command"]["actor_ref"]="boss"
				packet["command"]["source_undefined_fields"]=["redBean","homing"] if black else ["blackBean"]
				return packet
			"puff":
				state["step"]="move"
				var draw: Dictionary = Common._draw(rng,"bean_rain_puff_gate",41223,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				if draw["unit"]<0.3: return Common._command(state,"addParts",41223,[e["x"],e["y"],"#ff2200",3],events,ledger)
			"move":
				var speed: float = e["speed"]*0.5*state["sp"]
				var side: float = sin(e["_brT"]*0.03)*0.8
				state["dx"]=cos(e["facing"]+PI/2)*speed*side
				state["dy"]=sin(e["facing"]+PI/2)*speed*side
				state["step"]="active_end"
				return Common._command(state,"canMv",41230,[e["x"]+state["dx"],e["y"]+state["dy"],e["r"]],events,ledger,"move")
			"active_end":
				state["step"]="done"
				if e["st2"]<=0:
					Common._write(e,{"s":"recover","st2":30},41231,events)
					Common._global("shake",3*state["options"]["shake"]/100.0,41231,events)
			_: return Common._fail("unknown_bean_rain_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _actor(e: Dictionary) -> bool:
	return Common._actor(e) and Common._numbers(e,["speed","_bossPhase","_brT","_brDur"]) \
		and e["_bossPhase"]>=0 and e["_bossPhase"]<=4 and e.get("col") is String
