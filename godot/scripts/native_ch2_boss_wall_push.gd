extends RefCounted
## BC2-09: G37077 snapshots only. No G queue, collision or damage owner connection.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const _OWNER = "BC2-09/wall-push/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[37077,37077],"initializer_owner":"BC2-03/G38003-38012","live_connected":false,"full_tick_complete":false}

static func begin_tick(si: int, queue: Variant, sp: float, player: Dictionary) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not Common._num(sp) or not _queue(queue) or not _player(player): return Common._fail("snapshot_unsupported")
	var state: Dictionary={"version":1,"owner":_OWNER,"si":si,"queue":queue.duplicate(true) if queue is Dictionary else null,
		"sp":sp,"player":player.duplicate(true),"enemy":{},"step":"entry","pending":"","index":0,"write_index":0}
	Context.bind(state,Catalog)
	return {"status":"READY","continuation":state,"full_tick_complete":false}

static func next_tick(token: Dictionary, response: Variant = null) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or not token.get("_chapter_catalog") is Script or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not token.get("step") is String or not token.get("pending") is String \
		or not token.get("index") is int or not token.get("write_index") is int or token.get("enemy")!={} \
		or not Common._num(token.get("sp")) or not token.has("queue") or not _queue(token["queue"]) \
		or not token.get("player") is Dictionary or not _player(token["player"]): return Common._fail("wall_push_continuation_required")
	if token["index"]<0 or token["write_index"]<0 or token["write_index"]>token["index"] \
		or (token["queue"]!=null and token["index"]>token["queue"]["ids"].size()): return Common._fail("queue_cursor_invalid")
	var resolved: Dictionary=Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary=token.duplicate(true)
	var events: Array=[]
	if state["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		if state["pending"]=="damage":
			if not response.get("entry_after") is Dictionary or not _entry(response["entry_after"]) \
				or not response.get("player_after") is Dictionary or not _player(response["player_after"]): return Common._fail("protected_damage_readback_missing")
			state["queue"]["entries"][state["id"]]=response["entry_after"].duplicate(true)
			state["player"]=response["player_after"].duplicate(true)
		elif state["pending"]!="ack": return Common._fail("pending_kind_unsupported")
		state["pending"]=""
	var p: Dictionary=state["player"]
	while state["step"]!="done":
		match state["step"]:
			"entry": state["step"]="done" if state["queue"]==null or state["queue"]["ids"].is_empty() else "read"
			"read":
				var ids: Array=state["queue"]["ids"]
				if state["index"]>=ids.size():
					ids.resize(state["write_index"])
					events.append({"kind":"queue_length_write","value":state["write_index"],"source_line":37077})
					state["step"]="done"
					continue
				state["id"]=ids[state["index"]]
				var wp: Dictionary=state["queue"]["entries"][state["id"]]
				_write(wp,state["id"],"t",wp["t"]+state["sp"],events)
				_write(wp,state["id"],"dist",wp["dist"]+wp["spd"]*state["sp"],events)
				var cx: float=wp["x"]+cos(wp["ang"])*wp["dist"]
				var cy: float=wp["y"]+sin(wp["ang"])*wp["dist"]
				var perpendicular: float=wp["ang"]+PI/2
				var px: float=p["x"]-cx
				var py: float=p["y"]-cy
				var parallel_distance: float=cos(wp["ang"])*px+sin(wp["ang"])*py
				var perpendicular_distance: float=absf(cos(perpendicular)*px+sin(perpendicular)*py)
				state["step"]="keep"
				if not wp["hit"] and p["iframes"]<=0 and absf(parallel_distance)<25 and perpendicular_distance<wp["w"]/2:
					_write(wp,state["id"],"hit",true,events)
					state["step"]="knockback"
					return _request(state,"resolve_wall_push_damage",[{"raw_damage":wp["dmg"],"element":wp["el"],
						"elemental_provider":"elMul(wp2.el,ar().el)","rounding":"ToInt32_after_elemental","options_omitted":true,
						"charge_excluded":false,"combat_verified":false}],events,"damage")
			"knockback":
				var wp: Dictionary=state["queue"]["entries"][state["id"]]
				for axis: String in ["x","y"]:
					p["kb"][axis]+=(cos(wp["ang"]) if axis=="x" else sin(wp["ang"]))*12
					events.append({"kind":"player_write","field":"kb."+axis,"value":p["kb"][axis],"source_line":37077})
				state["step"]="shake"
				return _request(state,"SFX.block",[],events)
			"shake":
				state["step"]="keep"
				return _request(state,"shake",[10],events)
			"keep":
				var wp: Dictionary=state["queue"]["entries"][state["id"]]
				if not (wp["dist"]>=wp["maxDist"] or wp["t"]>=wp["maxT"]):
					state["queue"]["ids"][state["write_index"]]=state["id"]
					events.append({"kind":"queue_index_write","index":state["write_index"],"id":state["id"],"source_line":37077})
					state["write_index"]+=1
				state["index"]+=1
				state["step"]="read"
			_: return Common._fail("unknown_wall_push_checkpoint")
	return {"status":"READY","done":true,"queue":state["queue"],"player":p,"events":events,"rng_ledger":[],"command":null,"continuation":null,"full_tick_complete":false}

static func _request(state: Dictionary, name: String, args: Array, events: Array, pending: String="ack") -> Dictionary:
	var result: Dictionary=Common._command(state,name,37077,args,events,[],pending)
	result.erase("enemy")
	result["queue"]=state["queue"].duplicate(true)
	return result
static func _write(entry: Dictionary,id: String,field: String,value: Variant,events: Array) -> void:
	entry[field]=value
	events.append({"kind":"entry_write","id":id,"field":field,"value":value,"source_line":37077})
static func _player(p: Dictionary) -> bool:
	return Common._player(p) and p.get("kb") is Dictionary and Common._numbers(p["kb"],["x","y"])
static func _entry(wp: Dictionary) -> bool:
	return Common._numbers(wp,["x","y","ang","t","maxT","dist","maxDist","w","spd","dmg","el"]) and wp.get("hit") is bool
static func _queue(queue: Variant) -> bool:
	if queue==null: return true
	if not queue is Dictionary or not queue.get("ids") is Array or not queue.get("entries") is Dictionary: return false
	for id in queue["ids"]:
		if not id is String or not queue["entries"].get(id) is Dictionary or not _entry(queue["entries"][id]): return false
	return true
