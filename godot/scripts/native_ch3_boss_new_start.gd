extends RefCounted
## BC3-03: only the seven CH3-owned source start cases; BC06 command/ack helpers.
## Snapshot writes/queue/text recipes only, no actual actor/effect/clock/IO/RNG.
const Common = preload("res://scripts/native_ch1_boss_pattern_start.gd")
const Catalog = preload("res://scripts/native_ch3_boss_catalog.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const IDS = ["laser","teleStrike","delaySlash","perilThrust","safeCorner","tidalWipe","gravityWell"]
const _OWNER = "BC3-03/new-start/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"], "source_game_sha256":Catalog.GAME_SHA256,
		"start_ids":IDS.duplicate(), "state_cases":4, "queue_cases":3,
		"source_ranges":[[37720,37721],[37738,37749],[37846,37859],[37992,38002],[38161,38177],[38192,38211]],
		"common_owner":"BC06 explicit chapter_catalog", "ch2_owner":"BC2-03 (CH3 adoption separate)",
		"live_combat_connected":false,"save_io":false,"full_tick_complete":false}

## Like BC06, raw start does not repeat the selector's Set/move.phase gates.
static func begin_start(si: int, id: String, enemy: Dictionary, distance: float,
		phase: int, extra_delay: float = 0.0, context: Dictionary = {}) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not IDS.has(id): return Common._fail("new_ch3_start_required")
	var move: Dictionary = Catalog.move_by_id(id)
	var ph: Dictionary = Catalog.phase_by_index(phase)
	if move.is_empty() or ph.is_empty() or not Common._num(distance) or not Common._num(extra_delay):
		return Common._fail("phase_or_distance_unsupported")
	if not Common._numbers(enemy,["x","y"]): return Common._fail("actor_position_missing")
	if enemy.has("ib") and not enemy["ib"] is bool: return Common._fail("boss_flag_unsupported")
	var ep: Variant = enemy.get("_bossPhase",0)
	if ep==null: ep=0
	if not Common._num(ep) or ep<0 or ep>4: return Common._fail("actor_phase_unsupported")
	if id in ["teleStrike","delaySlash","perilThrust","gravityWell"] and not Common._numbers(context,["player_x","player_y"]):
		return Common._fail("player_position_reader_missing")
	if id=="laser" and not Common._numbers(enemy,["facing"]): return Common._fail("actor_facing_missing")
	if id=="teleStrike" and not Common._numbers(enemy,["r"]): return Common._fail("actor_radius_missing")
	if id in ["safeCorner","tidalWipe"]:
		if not Common._numbers(enemy,["atk","el"]): return Common._fail("attack_element_snapshot_missing")
		for key: String in ["map_width","map_height"]:
			if context.has(key) and context[key]!=null and not Common._num(context[key]): return Common._fail("map_dimension_unsupported")
	var tele: float = Common._i32(move["tele"]*ph["teleM"])+extra_delay
	var e: Dictionary = enemy.duplicate(true)
	var program: Array = []
	Common._write(program,{"_atkParryable":Common.source_receipt()["parryable_ids"].has(id)},37703)
	match id:
		"laser":
			Common._write(program,{"laserAng":e["facing"],"laserLen":0},37720)
			Common._write(program,{"s":"bossLaserWind","st2":tele if tele!=0 else 50},37721)
			Common._text(program,e,30,"⚡ 레이저!","#ff00ff",50,37721)
			Common._call(program,"SFX.magic",[0],37721)
		"teleStrike":
			program.append({"op":"tele_rng"})
			program.append({"op":"tele_finish","duration":tele if tele!=0 else 40})
			Common._text(program,e,30,"⚡ 순간이동 준비!","#aa00ff",50,37748)
			Common._call(program,"SFX.charge",[],37748)
		"delaySlash":
			Common._write(program,{"facing":Common._aim(e,context)},37848)
			Common._write(program,{"s":"bossDelaySlashHold"},37849)
			program.append({"op":"delay_rng"})
			# The original warning is raw text, not _T.
			Common._call(program,"addTxt",[e["x"],e["y"]-30,"⚠ ...!","#ff4400",60],37852)
			Common._call(program,"SFX.charge",[],37852)
		"perilThrust":
			Common._write(program,{"facing":Common._aim(e,context)},37856)
			Common._write(program,{"s":"bossPerilWind","st2":tele if tele!=0 else 25},37857)
			Common._text(program,e,30,"⚠ 찌르기!","#ff0000",50,37858)
			Common._call(program,"SFX.charge",[],37858)
		"gravityWell":
			var angle: float = Common._aim(e,context)
			var dx: float = context["player_x"]-e["x"]
			var dy: float = context["player_y"]-e["y"]
			var distance_to: float = sqrt(dx*dx+dy*dy)*0.4
			Common._ensure(program,"_gravityWells",37996)
			Common._append(program,"_gravityWells",{"x":e["x"]+cos(angle)*distance_to,"y":e["y"]+sin(angle)*distance_to,
				"t":0,"maxT":180,"r":900,"pull":9},37997)
			Common._text(program,e,30,"🌀 중력장!","#6644ff",55,38000)
			Common._call(program,"SFX.magic",[3],38000)
			Common._write(program,{"s":"recover","st2":25},38001)
		"safeCorner":
			Common._ensure(program,"_safeCorners",38163)
			program.append({"op":"safe_rng"})
			Common._text(program,e,30,"💀💀 전멸 폭발!","#ff0000",80,38175)
			Common._call(program,"SFX.magic",[0],38175)
			Common._call(program,"shake",[10],38175)
			Common._write(program,{"s":"recover","st2":60},38176)
		"tidalWipe":
			Common._ensure(program,"_tidalWipes",38194)
			program.append({"op":"tidal_rng","actor_phase":ep})
			Common._call(program,"SFX.magic",[2],38209)
			Common._call(program,"shake",[10],38209)
			Common._write(program,{"s":"recover","st2":50},38210)
	var token: Dictionary = {"version":1,"owner":_OWNER,"si":si,"id":id,"enemy":e,
		"context":context.duplicate(true),"program":program,"pc":0,"pending":""}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

static func next_start(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or token.get("owner")!=_OWNER or not IDS.has(token.get("id")) \
		or token.get("_chapter_catalog")!=Catalog or not token.get("si") is int \
		or not token.get("enemy") is Dictionary or not token.get("context") is Dictionary \
		or not token.get("program") is Array or not token.get("pc") is int \
		or not token.get("pending") is String or token["pc"]<0 or token["pc"]>token["program"].size():
		return Common._fail("new_start_continuation_required")
	var resolved: Dictionary = Context.from_token(token)
	if not resolved["ready"]: return Common._fail(resolved["reason"])
	if not Catalog.boss_for_stage(token["si"]).get("supported",false): return Common._fail("unsupported_chapter_stage")
	var state: Dictionary = token.duplicate(true)
	var e: Dictionary = state["enemy"]
	var context: Dictionary = state["context"]
	var pending: String = state["pending"]
	if pending!="":
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
		if pending=="tele_collision":
			if not response.get("value") is bool: return Common._fail("collision_result_missing")
			if not response["value"]:
				state["program"].insert(state["pc"],{"op":"call","command":"safePt",
					"args":[context["player_x"]+cos(state["tele_angle"])*80,context["player_y"]+sin(state["tele_angle"])*80,e["r"]],
					"line":37743,"pending":"tele_safe"})
		elif pending=="tele_safe":
			if not response.has("value"): return Common._fail("safe_point_result_missing")
			if response["value"]==null: state["tele_target"]={"x":e["x"],"y":e["y"]}
			elif response["value"] is Dictionary and Common._numbers(response["value"],["x","y"]): state["tele_target"]=response["value"].duplicate(true)
			else: return Common._fail("safe_point_shape_unsupported")
		elif pending!="ack": return Common._fail("pending_kind_unsupported")
	state["pending"]=""
	var events: Array = []
	var ledger: Array = []
	while state["pc"]<state["program"].size():
		var op: Dictionary = state["program"][state["pc"]]
		state["pc"]+=1
		match op.get("op"):
			"write": Common._apply(e,op["fields"],op["line"],events)
			"call": return Common._packet(state,op,events,ledger)
			"tele_rng":
				var angle_draw: Dictionary = Common._draw(rng,"tele_angle",37740,events,ledger)
				if not angle_draw["ok"]: return Common._fail(angle_draw["reason"],ledger)
				var distance_draw: Dictionary = Common._draw(rng,"tele_distance",37741,events,ledger)
				if not distance_draw["ok"]: return Common._fail(distance_draw["reason"],ledger)
				var angle: float = Common._aim(e,context)+PI+(angle_draw["unit"]-0.5)*0.4
				state["tele_angle"]=angle
				state["tele_target"]={"x":context["player_x"]+cos(angle)*(40+distance_draw["unit"]*20),
					"y":context["player_y"]+sin(angle)*(40+distance_draw["unit"]*20)}
				return Common._packet(state,{"command":"canMv","args":[state["tele_target"]["x"],state["tele_target"]["y"],e["r"]],
					"line":37743,"pending":"tele_collision"},events,ledger)
			"tele_finish":
				if not state.get("tele_target") is Dictionary: return Common._fail("tele_target_not_resolved")
				Common._apply(e,{"_teleWarnX":state["tele_target"]["x"],"_teleWarnY":state["tele_target"]["y"]},37744,events)
				Common._apply(e,{"_teleOx":e["x"],"_teleOy":e["y"]},37745,events)
				Common._apply(e,{"_telePrepMax":op["duration"]},37746,events)
				Common._apply(e,{"s":"bossTelePrep","st2":op["duration"]},37747,events)
			"delay_rng":
				var draw: Dictionary = Common._draw(rng,"delay_hold",37850,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				Common._apply(e,{"st2":30+Common._i32(draw["unit"]*90)},37850,events)
				Common._apply(e,{"_dsMaxT":e["st2"]},37851,events)
			"safe_rng":
				var draw: Dictionary = Common._draw(rng,"safe_quadrant",38167,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				var q: int = Common._i32(draw["unit"]*4)
				var width: float = Common._map(context,"map_width",50)*40
				var height: float = Common._map(context,"map_height",42)*40
				var sx: float = width/2+(-1 if q%2==0 else 1)*(width*0.22)
				var sy: float = height/2+(-1 if q<2 else 1)*(height*0.22)
				state["program"].insert(state["pc"],{"op":"call","command":"addTxt",
					"args":[sx,sy-30,{"call":"_T","args":["⭕ 안전!"]},"#44ff44",100],"line":38174})
				return Common._packet(state,{"command":"append_global_queue","args":["_safeCorners",{"cx":width/2,"cy":height/2,"fullR":width*0.5,
					"safeX":sx,"safeY":sy,"safeR":650,"t":0,"warnT":120,"maxT":150,"dmg":Common._i32(e["atk"]*3),"el":e["el"],"hit":false}],"line":38170},events,ledger)
			"tidal_rng":
				var draw: Dictionary = Common._draw(rng,"tidal_direction",38196,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				var q: int = Common._i32(draw["unit"]*4)
				var width: float = Common._map(context,"map_width",50)*40
				var height: float = Common._map(context,"map_height",42)*40
				var names: Array = [["위→아래","Top→Bottom"],["오른→왼","Right→Left"],["아래→위","Bottom→Top"],["왼→오른","Left→Right"]]
				var text: Dictionary = {"concat":["🌊 ",{"call":"_L","args":names[q]}," ",{"call":"_T","args":["파도!"]}]}
				state["program"].insert(state["pc"],{"op":"call","command":"addTxt","args":[e["x"],e["y"]-30,text,"#4488ff",70],"line":38208})
				return Common._packet(state,{"command":"append_global_queue","args":["_tidalWipes",{"x":width if q==1 else (0 if q==3 else width/2),
					"y":0 if q==0 else (height if q==2 else height/2),"ang":[PI/2,PI,PI*1.5,0][q],"t":0,"warnT":80,"maxT":180,
					"spd":12+op["actor_phase"]*2,"w":width if q%2==0 else height,"thick":300+op["actor_phase"]*50,
					"dist":0,"dmg":Common._i32(e["atk"]*2.5),"el":e["el"],"hit":false}],"line":38201},events,ledger)
			_: return Common._fail("new_start_operation_unsupported")
	return {"status":"READY","done":true,"enemy":e,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}
