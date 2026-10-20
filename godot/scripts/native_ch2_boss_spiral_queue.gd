extends RefCounted
## BC2-08: source G37057 queue-consumer snapshots. No G writes or live spawn.
const Common = preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const _OWNER = "BC2-08/spiral-queue/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"source_range":[37057,37057],"draw_source_range":[20107,20107],"initializer_owner":"BC2-03/G37832-37845","props":"raw spawnProj; _commit bypasses density drop only",
		"live_queue_connected":false,"projectile_execution_verified":false,"full_tick_complete":false}

## null means no queue action. ids preserve order/aliases; entries are owned snapshots.
static func begin_tick(si: int, queue: Variant, sp: float) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not Common._num(sp) or not _queue(queue): return Common._fail("queue_snapshot_unsupported")
	var state: Dictionary={"version":1,"owner":_OWNER,"si":si,"queue":queue.duplicate(true) if queue is Dictionary else null,
		"sp":sp,"step":"entry","pending":"","index":0,"write_index":0,"arm":0,
		"enemy":{},"player":{}} # Empty contexts solely for the shared packet helper; no actor authority.
	Context.bind(state,Catalog)
	return {"status":"READY","continuation":state,"full_tick_complete":false}

static func next_tick(token: Dictionary, response: Variant = null) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or token.get("_chapter_catalog")!=Catalog \
		or not token.get("si") is int or not token.get("step") is String or not token.get("pending") is String \
		or not Common._num(token.get("sp")) or not token.get("index") is int or not token.get("write_index") is int \
		or not token.get("arm") is int or token.get("enemy")!={} or token.get("player")!={} \
		or not token.has("queue") or not _queue(token["queue"]): return Common._fail("spiral_queue_continuation_required")
	if token["index"]<0 or token["write_index"]<0 or token["write_index"]>token["index"] or token["arm"]<0:
		return Common._fail("spiral_queue_cursor_invalid")
	if token["queue"]!=null and token["index"]>token["queue"]["ids"].size(): return Common._fail("spiral_queue_cursor_invalid")
	if token["step"] in ["shots","keep"]:
		if token["queue"]==null or not token.get("id") is String or not token["queue"]["entries"].has(token["id"]): return Common._fail("spiral_queue_entry_missing")
		if token["step"]=="shots" and not Common._num(token.get("rotation")): return Common._fail("spiral_queue_rotation_missing")
	var resolved: Dictionary=Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary=token.duplicate(true)
	if state["pending"]!="":
		if state["pending"]!="ack": return Common._fail("pending_kind_unsupported")
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		state["pending"]=""
	var events: Array=[]
	while state["step"]!="done":
		match state["step"]:
			"entry":
				state["step"]="done" if state["queue"]==null or state["queue"]["ids"].is_empty() else "read"
			"read":
				var ids: Array=state["queue"]["ids"]
				if state["index"]>=ids.size():
					ids.resize(state["write_index"])
					events.append({"kind":"queue_length_write","value":state["write_index"],"source_line":37057})
					state["step"]="done"
					continue
				state["id"]=ids[state["index"]]
				var sb: Dictionary=state["queue"]["entries"][state["id"]]
				var windup: float=Common._or_num(sb.get("windup"),0)
				_write(sb,state["id"],"t",sb["t"]+state["sp"],events)
				if sb["t"]>=windup: _write(sb,state["id"],"nextShot",sb["nextShot"]-state["sp"],events)
				state["step"]="keep"
				if sb["nextShot"]<=0 and sb["t"]>=windup and sb["t"]<sb["maxT"]:
					_write(sb,state["id"],"nextShot",sb["interval"],events)
					state["rotation"]=sb["t"]*0.04*sb["dir"]
					state["arm"]=0
					state["step"]="shots"
			"shots":
				var sb: Dictionary=state["queue"]["entries"][state["id"]]
				if state["arm"]>=sb["arms"]:
					state["step"]="keep"
					continue
				var angle: float=sb["baseAng"]+PI*2*state["arm"]/sb["arms"]+state["rotation"]
				state["arm"]+=1
				var props: Dictionary={"x":sb["x"]+cos(angle)*15,"y":sb["y"]+sin(angle)*15,"vx":cos(angle)*3.5,"vy":sin(angle)*3.5,
					"dmg":sb["dmg"],"el":sb["el"],"friendly":false,"life":200,"ml":200,"col":sb["col"],"sz":1.5,"r":4,"_commit":true}
				var packet: Dictionary=Common._command(state,"spawnProj",37057,[props],events,[],"ack")
				packet.erase("enemy");packet.erase("player")
				packet["queue"]=state["queue"].duplicate(true)
				return packet
			"keep":
				var sb: Dictionary=state["queue"]["entries"][state["id"]]
				if sb["t"]<sb["maxT"]:
					state["queue"]["ids"][state["write_index"]]=state["id"]
					events.append({"kind":"queue_index_write","index":state["write_index"],"id":state["id"],"source_line":37057})
					state["write_index"]+=1
				state["index"]+=1
				state["step"]="read"
			_: return Common._fail("unknown_spiral_queue_checkpoint")
	return {"status":"READY","done":true,"queue":state["queue"],"events":events,"rng_ledger":[],"command":null,"continuation":null,"full_tick_complete":false}

static func _write(sb: Dictionary, id: String, field: String, value: Variant, events: Array) -> void:
	sb[field]=value
	events.append({"kind":"entry_write","id":id,"field":field,"value":value,"source_line":37057})
static func _queue(queue: Variant) -> bool:
	if queue==null: return true
	if not queue is Dictionary or not queue.get("ids") is Array or not queue.get("entries") is Dictionary: return false
	for id in queue["ids"]:
		if not id is String or not queue["entries"].get(id) is Dictionary: return false
		var sb: Dictionary=queue["entries"][id]
		if not Common._numbers(sb,["x","y","t","maxT","nextShot","interval","arms","dir","baseAng","dmg","el"]) \
			or Common._or_num(sb.get("windup"),0)==null or not sb.get("col") is String or absf(sb["arms"])>64: return false
	return true

## G20107 render reads: label is supplied by the existing localization owner.
## No tick, nextShot, compaction, RNG, draw execution or caller snapshot mutation.
static func draw_requests(si: int, queue: Variant, label: Variant = null) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not _queue(queue): return Common._fail("queue_snapshot_unsupported")
	var commands: Array=[]
	if queue!=null:
		for id: String in queue["ids"]:
			var sb: Dictionary=queue["entries"][id]
			var windup: float=Common._or_num(sb.get("windup"),0)
			if sb["el"]==0 and windup>0 and sb["t"]<windup:
				if not label is String: return Common._fail("localized_label_reader_missing")
				var source: Variant=sb.get("src")
				var radius: Variant=Common._or_num(source.get("r") if source is Dictionary else null,12)
				if radius==null: return Common._fail("source_radius_snapshot_unsupported")
				commands.append({"command":"_drawShootCharge","source_line":20107,"args":[sb["x"],sb["y"],radius,sb["t"]/windup,"#ffffff",1,true],"executed":false})
				commands.append({"command":"_drawProjectileChargeLabel","source_line":20107,"args":[sb["x"],sb["y"],radius,label],"executed":false})
	return {"status":"READY","commands":commands,"rng_ledger":[],"full_tick_complete":false}
