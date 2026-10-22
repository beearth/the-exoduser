extends RefCounted
## BC2-06: fanWave after the shared BC05 clock. Requests only, no live combat.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossFanWaveAim"]
const _OWNER = "BC2-06/fan-wave/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[40573,40607],"states":STATES.duplicate(),"clock":"BC05 already decremented st2",
		"live_combat_connected":false,"full_tick_complete":false,"damage_or_parry_execution_verified":false}

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not STATES.has(enemy.get("s")): return Common._fail("unsupported_fan_wave_state")
	if not _actor(enemy) or not _player(player) or not Common._num(sp): return Common._fail("state_snapshot_unsupported")
	var token: Dictionary={"version":1,"owner":_OWNER,"si":si,"enemy":enemy.duplicate(true),"player":player.duplicate(true),
		"sp":sp,"step":"entry","pending":"","index":0,"query_ids":[],"query_entities":{}}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

## Contact includes protected parry/hurtP/player-KB ownership, never executed here.
## Complete owner readbacks are required; query ids preserve order and aliases.
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("step") is String or not token.get("pending") is String or not token.get("index") is int \
		or not token.get("query_ids") is Array or not token.get("query_entities") is Dictionary or not Common._num(token.get("sp")):
		return Common._fail("fan_wave_continuation_required")
	var resolved: Dictionary=Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary=token.duplicate(true)
	var events: Array=[]
	var ledger: Array=[]
	if state["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		match state["pending"]:
			"contact":
				if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
					or not _actor(response["enemy_after"]) or not _player(response["player_after"]): return Common._fail("protected_contact_readback_missing")
				state["enemy"]=response["enemy_after"].duplicate(true)
				state["player"]=response["player_after"].duplicate(true)
			"query":
				if not _query(response.get("ids"),response.get("entities")): return Common._fail("ordered_query_snapshot_missing")
				state["query_ids"]=response["ids"].duplicate(true)
				state["query_entities"]=response["entities"].duplicate(true)
			"ack": pass
			_: return Common._fail("pending_kind_unsupported")
		state["pending"]=""
	var e: Dictionary=state["enemy"]
	var p: Dictionary=state["player"]
	if not _actor(e) or not _player(p): return Common._fail("state_snapshot_unsupported")
	while state["step"]!="done":
		match state["step"]:
			"entry":
				state["step"]="wind_end"
				var gate: Dictionary=Common._draw(rng,"fan_wave_wind_gate",40575,events,ledger)
				if not gate["ok"]: return Common._fail(gate["reason"],ledger)
				if gate["unit"]>0.7:
					var x: Dictionary=Common._draw(rng,"fan_wave_wind_vx",40575,events,ledger)
					if not x["ok"]: return Common._fail(x["reason"],ledger)
					var y: Dictionary=Common._draw(rng,"fan_wave_wind_vy",40575,events,ledger)
					if not y["ok"]: return Common._fail(y["reason"],ledger)
					return Common._command(state,"poolPart",40575,[e["x"]+cos(e["_fwAng"])*30,e["y"]+sin(e["_fwAng"])*30,(x["unit"]-0.5)*2,(y["unit"]-0.5)*2,"#ff6600",2,6],events,ledger)
			"wind_end":
				if e["st2"]>0:
					state["step"]="done"
					continue
				state["width"]=PI*0.5
				state["radius"]=Common._or_num(e.get("_fwR"),500)
				state["damage"]=Common._i32(e["atk"]*2.5)
				state["step"]="shake"
				return Common._command(state,"SFX.detonate",40581,[],events,ledger)
			"shake":
				state["step"]="player"
				return Common._command(state,"shake",40581,[15],events,ledger)
			"player":
				state["step"]="query"
				if Common._distance(e,p)<state["radius"] and p["iframes"]<=0 and p["s"]!="charge" \
					and absf(_difference(Common._aim(e,p),e["_fwAng"]))<state["width"]/2:
					var descriptor: Dictionary={"source_lines":[40588,40591],"actor_ref":"boss",
						"hurtP_formula":{"raw_damage":state["damage"],"element":e["el"],"elemental_provider":"elMul(e.el,ar().el)","rounding":"ToInt32_before_and_after_elemental"},
						"parry_formula":Common._contact("slash",e)["parry_formula"],"knockback":15,
						"requires":["isPWin","hurtP","boss_hurtE","doParry","poise_owner"],"combat_verified":false}
					return Common._command(state,"resolve_fan_wave_contact",40588,[descriptor],events,ledger,"contact")
			"query":
				state["step"]="push"
				state["index"]=0
				return Common._command(state,"shQuery",40595,[e["x"],e["y"],state["radius"]],events,ledger,"query")
			"push":
				for id: String in state["query_ids"]:
					var fe: Dictionary=state["query_entities"][id]
					if not fe["alive"] or fe["ib"]: continue
					var angle: float=Common._aim(e,fe)
					if absf(_difference(angle,e["_fwAng"]))<state["width"]/2 and Common._distance(e,fe)<state["radius"]:
						for axis: String in ["x","y"]:
							fe["kb"][axis]+=(cos(angle) if axis=="x" else sin(angle))*12
							events.append({"kind":"query_write","id":id,"field":"kb."+axis,"value":fe["kb"][axis],"source_line":40599})
				Common._write(e,{"_fwFx":{"ang":e["_fwAng"],"w":state["width"],"r":state["radius"],"t":0,"maxT":20}},40602,events)
				state["step"]="particles"
				state["index"]=0
			"particles":
				var i: int=state["index"]
				if i>=25:
					Common._write(e,{"s":"bossRec","st2":40},40606,events)
					state["step"]="done"
					continue
				var angle: float=e["_fwAng"]-state["width"]/2+state["width"]*i/24.0
				var units: Array=[]
				for site: Array in [["fan_wave_speed",40604],["fan_wave_size",40605],["fan_wave_life",40605]]:
					var draw: Dictionary=Common._draw(rng,site[0],site[1],events,ledger)
					if not draw["ok"]: return Common._fail(draw["reason"],ledger)
					units.append(draw["unit"])
				var speed: float=8+units[0]*6
				state["index"]+=1
				return Common._command(state,"poolPart",40605,[e["x"]+cos(angle)*30,e["y"]+sin(angle)*30,cos(angle)*speed,sin(angle)*speed,"#ff8844" if i%2==0 else "#ffcc44",3+units[1]*4,12+units[2]*10],events,ledger)
			_: return Common._fail("unknown_fan_wave_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"query_entities":state["query_entities"],"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _difference(a: float,b: float) -> float:
	var value: float=a-b
	while value>PI: value-=PI*2
	while value< -PI: value+=PI*2
	return value
static func _actor(e: Dictionary) -> bool:
	return Common._actor(e) and Common._numbers(e,["_fwAng"]) and absf(e["_fwAng"])<=PI*128 and Common._or_num(e.get("_fwR"),500)!=null
static func _player(p: Dictionary) -> bool:
	return Common._player(p) and p.get("kb") is Dictionary and Common._numbers(p["kb"],["x","y"])
static func _query(ids: Variant,entities: Variant) -> bool:
	if not ids is Array or not entities is Dictionary: return false
	for id in ids:
		if not id is String or not entities.get(id) is Dictionary: return false
		var fe: Dictionary=entities[id]
		if not fe.get("alive") is bool or not fe.get("ib") is bool or not Common._numbers(fe,["x","y"]) \
			or not fe.get("kb") is Dictionary or not Common._numbers(fe["kb"],["x","y"]): return false
	return true
