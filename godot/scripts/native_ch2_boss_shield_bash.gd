extends RefCounted
## BC2-07: post-BC05-clock shieldBash2 packets; no live combat/Main execution.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossSBashWind","bossSBash"]
const _OWNER = "BC2-07/shield-bash/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[41337,41351],"states":STATES.duplicate(),"clock":"BC05 already decremented st2",
		"live_combat_connected":false,"full_tick_complete":false,"damage_or_parry_execution_verified":false}

static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not STATES.has(enemy.get("s")): return Common._fail("unsupported_shield_bash_state")
	if not _actor(enemy) or not _player(player) or not Common._num(sp): return Common._fail("state_snapshot_unsupported")
	var token: Dictionary={"version":1,"owner":_OWNER,"si":si,"kind":enemy["s"],"enemy":enemy.duplicate(true),
		"player":player.duplicate(true),"sp":sp,"step":"entry","pending":""}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

## canMv is a single XY query (no axis fallback). Contact needs full owner readback.
## Contact includes isPWin BEFORE charge exclusion, protected KB and stunRes ownership.
static func next_tick(token: Dictionary, response: Variant = null) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not STATES.has(token.get("kind")) or not token.get("enemy") is Dictionary \
		or not token.get("player") is Dictionary or not token.get("step") is String or not token.get("pending") is String \
		or not Common._num(token.get("sp")): return Common._fail("shield_bash_continuation_required")
	var resolved: Dictionary=Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary=token.duplicate(true)
	var events: Array=[]
	var ledger: Array=[]
	if state["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		match state["pending"]:
			"move":
				if not response.get("value") is bool: return Common._fail("collision_result_missing")
				if response["value"]:
					Common._write(state["enemy"],{"x":state["enemy"]["x"]+state["dx"],"y":state["enemy"]["y"]+state["dy"]},41342,events)
			"contact":
				if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
					or not _actor(response["enemy_after"]) or not _player(response["player_after"]): return Common._fail("protected_contact_readback_missing")
				state["enemy"]=response["enemy_after"].duplicate(true)
				state["player"]=response["player_after"].duplicate(true)
			"ack": pass
			_: return Common._fail("pending_kind_unsupported")
		state["pending"]=""
	var e: Dictionary=state["enemy"]
	var p: Dictionary=state["player"]
	if not _actor(e) or not _player(p): return Common._fail("state_snapshot_unsupported")
	while state["step"]!="done":
		match state["step"]:
			"entry":
				if state["kind"]=="bossSBashWind":
					Common._write(e,{"facing":Common._aim(e,p)},41338,events)
					state["step"]="done"
					if e["st2"]<=0:
						Common._write(e,{"s":"bossSBash","st2":18},41339,events)
						return Common._command(state,"SFX.block",41339,[],events,ledger)
				else:
					state["dx"]=cos(e["_sbAng"])*9*state["sp"]
					state["dy"]=sin(e["_sbAng"])*9*state["sp"]
					state["step"]="contact_gate"
					return Common._command(state,"canMv",41342,[e["x"]+state["dx"],e["y"]+state["dy"],e["r"]],events,ledger,"move")
			"contact_gate":
				state["step"]="timeout"
				if Common._distance(e,p)<p["r"]+e["r"]+20 and p["iframes"]<=0:
					state["step"]="contact_end"
					var d: Dictionary=Common._contact("sweep",e)
					d["family"]="shield_bash_2"
					d["source_lines"]=[41344,41348]
					d["parry_formula"]["angle"]=e["_sbAng"]+PI
					d["parry_formula"]["poise"]=25
					d["charge_rule"]="isPWin first; otherwise charge skips damage/KB/stun but contact recovers30"
					d["stun_formula"]={"base":45,"resistance_cap":0.5,"resistance_provider":"_eqAffix('stunRes')",
						"formula":"max(P.stunned||0,ToInt32(45*(1-min(.5,_eqAffix('stunRes')))))"}
					return Common._command(state,"resolve_shield_bash_contact",41344,[d],events,ledger,"contact")
			"contact_end":
				Common._write(e,{"s":"recover","st2":30},41349,events)
				state["step"]="done"
			"timeout":
				if e["st2"]<=0: Common._write(e,{"s":"recover","st2":25},41350,events)
				state["step"]="done"
			_: return Common._fail("unknown_shield_bash_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _actor(e: Dictionary) -> bool:
	return Common._actor(e) and Common._numbers(e,["_sbAng"])
static func _player(p: Dictionary) -> bool:
	return Common._player(p) and p.get("kb") is Dictionary and Common._numbers(p["kb"],["x","y"]) and Common._or_num(p.get("stunned"),0)!=null
