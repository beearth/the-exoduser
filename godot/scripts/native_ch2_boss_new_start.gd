extends RefCounted
## BC2-03: ten CH2-only start cases, using BC06's command/ack/RNG helpers.
## These are snapshot calculations, never actor writes or real queue/SFX calls.
const Common = preload("res://scripts/native_ch1_boss_pattern_start.gd")
const Catalog = preload("res://scripts/native_ch2_boss_catalog_bridge.gd")
const Context = preload("res://scripts/native_boss_catalog_context.gd")
const IDS = ["vortex","beanRain","fanWave","spiralBullet","wallPush","shieldBash2","fireRain","shockGrid","donutSlam","crossWipe"]
const _OWNER = "BC2-03/new-start/v1"

static func source_receipt() -> Dictionary:
	return {"ready":Context.resolve(Catalog)["ready"],
		"source_game_sha256":Catalog.source_receipt()["source_game_sha256"],
		"start_ids":IDS.duplicate(),"state_cases":4,"queue_cases":6,
		"source_ranges":[[37734,37734],[37758,37759],[37834,37847],[38005,38014],
			[38050,38055],[38120,38162],[38180,38193]],
		"live_combat_connected":false,"save_io":false,"full_tick_complete":false}

## As in BC06, the raw start does not repeat the selector's Set/phase gates.
## phase controls tele/bean duration; enemy._bossPhase controls queue payloads.
static func begin_start(si: int, id: String, enemy: Dictionary, distance: float,
		phase: int, extra_delay: float = 0.0, context: Dictionary = {}) -> Dictionary:
	if not Context.resolve(Catalog)["ready"]: return Common._fail("chapter_dependency_unready")
	if not Catalog.boss_for_stage(si).get("supported",false): return Common._fail("unsupported_chapter_stage")
	if not IDS.has(id): return Common._fail("new_ch2_start_required")
	var move: Dictionary = Catalog.move_by_id(id)
	var ph: Dictionary = Catalog.phase_by_index(phase)
	if move.is_empty() or ph.is_empty() or not Common._num(distance) or not Common._num(extra_delay):
		return Common._fail("phase_or_distance_unsupported")
	if not Common._numbers(enemy,["x","y"]): return Common._fail("actor_position_missing")
	if enemy.has("ib") and not enemy["ib"] is bool: return Common._fail("boss_flag_unsupported")
	var ep: Variant = enemy.get("_bossPhase",0)
	if ep==null: ep=0
	if not Common._num(ep) or ep<0 or ep>4: return Common._fail("actor_phase_unsupported")
	if id in ["fanWave","spiralBullet","wallPush","shieldBash2"] and not Common._numbers(context,["player_x","player_y"]):
		return Common._fail("player_position_reader_missing")
	if id in ["spiralBullet","wallPush","fireRain","shockGrid","donutSlam","crossWipe"] and not Common._numbers(enemy,["atk","el"]):
		return Common._fail("attack_element_snapshot_missing")
	if id=="spiralBullet" and not enemy.get("col") is String: return Common._fail("fallback_color_missing")
	if id=="donutSlam" and not Common._numbers(enemy,["r"]): return Common._fail("actor_radius_missing")
	if id in ["fireRain","shockGrid","donutSlam","crossWipe"]:
		for key: String in ["map_width","map_height"]:
			if context.has(key) and context[key]!=null and not Common._num(context[key]): return Common._fail("map_dimension_unsupported")
	var tele: float = Common._i32(move["tele"]*ph["teleM"])+extra_delay
	var e: Dictionary = enemy.duplicate(true)
	var program: Array = []
	Common._write(program,{"_atkParryable":Common.source_receipt()["parryable_ids"].has(id)},37705)
	match id:
		"vortex":
			Common._write(program,{"s":"bossVortexWind","st2":tele if tele!=0 else 30},37734)
			Common._text(program,e,30,"🌀 흡인!","#6644ff",45,37734)
			Common._call(program,"SFX.magic",[3],37734)
		"beanRain":
			Common._write(program,{"s":"bossBeanRainWind","st2":tele if tele!=0 else 35,"_brT":0,"_brDur":80+phase*20},37758)
			Common._text(program,e,30,"🔴🔴 콩 비!","#ff2200",55,37758)
			Common._call(program,"SFX.magic",[0],37758)
		"fanWave":
			var angle: float = Common._aim(e,context)
			Common._write(program,{"s":"bossFanWaveAim","st2":90,"facing":angle,"_fwAng":angle,"_fwR":500},37759)
			Common._text(program,e,30,"🌊 부채꼴 충격파!","#ff6600",55,37759)
			Common._call(program,"SFX.charge",[],37759)
		"shieldBash2":
			Common._write(program,{"_sbAng":Common._aim(e,context)},38052)
			Common._write(program,{"s":"bossSBashWind","st2":tele if tele!=0 else 20},38053)
			Common._text(program,e,30,"🛡 방패돌진!","#ff4400",50,38054)
			Common._call(program,"SFX.block",[],38054)
		"spiralBullet":
			var angle: float = Common._aim(e,context)
			var windup: int = 60 if e["el"]==0 else 0
			Common._write(program,{"facing":angle},37836)
			program.append({"op":"spiral_rng"})
			Common._ensure(program,"_spiralBullets",37840)
			program.append({"op":"spiral_append","payload":{"x":e["x"],"y":e["y"],"t":0,"windup":windup,"maxT":180+windup,
				"arms":3+minf(ep,2),"baseAng":angle,"dmg":Common._i32(e["atk"]*1.2),"el":e["el"],"col":Common._color(e,e["col"]),
				"src":{"actor_ref":"boss"},"interval":6,"nextShot":windup}})
			Common._text(program,e,30,"🌀 나선탄!","#ff44ff",55,37845)
			Common._call(program,"SFX.magic",[0],37845)
			Common._write(program,{"s":"recover","st2":45},37846)
		"wallPush":
			Common._ensure(program,"_wallPushes",38007)
			Common._append(program,"_wallPushes",{"x":e["x"],"y":e["y"],"ang":Common._aim(e,context),"t":0,"maxT":60,
				"dist":0,"maxDist":2000,"w":1300,"spd":35,"dmg":Common._i32(e["atk"]*1.2),"el":e["el"],"src":{"actor_ref":"boss"},"hit":false},38009)
			Common._text(program,e,30,"🔨 벽밀기!","#ff8844",55,38012)
			Common._call(program,"SFX.block",[],38012)
			Common._write(program,{"s":"recover","st2":30},38013)
		"fireRain":
			Common._ensure(program,"_fireRains",38122)
			program.append({"op":"fire_loop","n":int(ceil(12+ep*4)),"index":0})
			Common._text(program,e,30,"🌧🌧 화염 폭격!","#ff6600",70,38133)
			Common._call(program,"SFX.magic",[0],38133)
			Common._call(program,"shake",[10],38133)
			Common._write(program,{"s":"recover","st2":40},38134)
		"shockGrid":
			Common._ensure(program,"_shockGrids",38138)
			var arms: float = 6+ep
			var length: int = Common._i32(maxf(Common._map(context,"map_width",50),Common._map(context,"map_height",42))*40*0.6)
			for i in range(int(ceil(arms))):
				Common._append(program,"_shockGrids",{"x":e["x"],"y":e["y"],"ang":PI*2*i/arms,"t":0,"warnT":60,"maxT":210,
					"len":length,"w":250+ep*25,"dmg":Common._i32(e["atk"]*1.8),"el":e["el"],"tickT":0},38144)
			Common._text(program,e,30,"⚡⚡ 전격 장막!","#44ccff",70,38148)
			Common._call(program,"SFX.charge",[],38148)
			Common._call(program,"shake",[12],38148)
			Common._write(program,{"s":"recover","st2":35},38149)
		"donutSlam":
			Common._ensure(program,"_donutSlams",38153)
			Common._append(program,"_donutSlams",{"x":e["x"],"y":e["y"],"innerR":80+e["r"],
				"outerR":Common._i32(maxf(Common._map(context,"map_width",50),Common._map(context,"map_height",42))*40*0.5),
				"t":0,"warnT":90,"maxT":120,"dmg":Common._i32(e["atk"]*2.5),"el":e["el"],"hit":false},38157)
			Common._text(program,e,30,"💀 내 곁으로!","#ff0044",80,38160)
			Common._call(program,"SFX.charge",[],38160)
			Common._call(program,"shake",[8],38160)
			Common._write(program,{"s":"recover","st2":50},38161)
		"crossWipe":
			Common._ensure(program,"_crossWipes",38182)
			Common._append(program,"_crossWipes",{"x":e["x"],"y":e["y"],
				"len":Common._i32(maxf(Common._map(context,"map_width",50),Common._map(context,"map_height",42))*40*0.55),
				"w":350+ep*50,"t":0,"maxT":300,"rotSpd":0,"phase":0,"warnT":60,
				"dmg":Common._i32(e["atk"]*2),"el":e["el"],"tickT":0,"waves":2+Common._i32(ep/2)},38186)
			Common._text(program,e,30,"⚡ 쐐기 소멸!","#ff44ff",70,38191)
			Common._call(program,"SFX.charge",[],38191)
			Common._call(program,"shake",[8],38191)
			Common._write(program,{"s":"recover","st2":45},38192)
	var token: Dictionary = {"version":1,"owner":_OWNER,"si":si,"id":id,"enemy":e,"context":context.duplicate(true),"program":program,"pc":0,"pending":""}
	Context.bind(token,Catalog)
	return {"status":"READY","continuation":token,"full_tick_complete":false}

## One owner request per step; no implicit ack or internal RNG state.
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
	if token["pending"]!="":
		if token["pending"]!="ack": return Common._fail("pending_kind_unsupported")
		if not response is Dictionary or response.get("ack")!=true: return Common._fail("owner_ack_missing")
	var state: Dictionary = token.duplicate(true)
	state["pending"]=""
	var e: Dictionary = state["enemy"]
	var context: Dictionary = state["context"]
	var events: Array = []
	var ledger: Array = []
	while state["pc"]<state["program"].size():
		var op: Dictionary = state["program"][state["pc"]]
		state["pc"]+=1
		match op.get("op"):
			"write": Common._apply(e,op["fields"],op["line"],events)
			"call": return Common._packet(state,op,events,ledger)
			"spiral_rng":
				var draw: Dictionary = Common._draw(rng,"spiral_direction",37839,events,ledger)
				if not draw["ok"]: return Common._fail(draw["reason"],ledger)
				state["spiral_direction"]=1 if draw["unit"]>0.5 else -1
			"spiral_append":
				if not state.has("spiral_direction"): return Common._fail("spiral_rng_not_resolved")
				var payload: Dictionary = op["payload"]
				payload["dir"]=state["spiral_direction"]
				return Common._packet(state,{"command":"append_global_queue","args":["_spiralBullets",payload],"line":37842},events,ledger)
			"fire_loop":
				if op["index"]<op["n"]:
					var x: Dictionary = Common._draw(rng,"fire_rain_x",38128,events,ledger)
					if not x["ok"]: return Common._fail(x["reason"],ledger)
					var y: Dictionary = Common._draw(rng,"fire_rain_y",38129,events,ledger)
					if not y["ok"]: return Common._fail(y["reason"],ledger)
					var radius: Dictionary = Common._draw(rng,"fire_rain_radius",38130,events,ledger)
					if not radius["ok"]: return Common._fail(radius["reason"],ledger)
					var width: float = Common._map(context,"map_width",50)*40
					var height: float = Common._map(context,"map_height",42)*40
					var payload: Dictionary = {"x":width/2+(x["unit"]-0.5)*(width*0.7),"y":height/2+(y["unit"]-0.5)*(height*0.7),
						"t":0,"delay":30+op["index"]*6,"r":400+radius["unit"]*200,"dmg":Common._i32(e["atk"]*1.5),"el":e["el"],"hit":false}
					op["index"]+=1
					state["pc"]-=1
					return Common._packet(state,{"command":"append_global_queue","args":["_fireRains",payload],"line":38128},events,ledger)
			_: return Common._fail("new_start_operation_unsupported")
	return {"status":"READY","done":true,"enemy":e,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}
