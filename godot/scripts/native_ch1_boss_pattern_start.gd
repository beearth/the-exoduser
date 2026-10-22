extends RefCounted
## BC06: 24 CH1-union _bossStartPattern cases, source start commands only.
## Every helper/queue request waits for an owner acknowledgment before continuing.
## No actor, queue, projectile, sound, UI, protected Q/E or Main is connected here.

const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CatalogContext = preload("res://scripts/native_boss_catalog_context.gd")
# Read-only copies of game.html:37703 / 14338 / 16631. No classification change.
const _PARRYABLE = ["charge", "slashCombo", "slam", "sweep", "tailSwipe", "spin", "multiDash", "teleStrike", "swordWave", "jump", "judgeCut", "delaySlash", "perilThrust", "phantomSwords", "crescendoCombo", "tideWave", "rewindStrike", "mirrorClone", "shieldBash2", "mirrorGuard", "chainLightning", "cageTrap", "doppelganger"]
const _COLORS = ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"]
const _TILE = 40
# state / tele fallback / text / color / life / SFX / args / source line.
const _WINDS = {
	"burst": ["bossBurstWind",55,"⚠ 광역 발사!","#ff6600",50,"charge",[],37715],
	"fan": ["bossFanWind",30,"🔥 확산!","#ff4444",35,"charge",[],37716],
	"charge": ["bossChargeWind",55,"⚠ 돌진!","#ffaa00",50,"charge",[],37717],
	"shock": ["bossShockWind",45,"🌊 충격파!","#44aaff",40,"charge",[],37724],
	"summon": ["bossSummonWind",55,"👹 소환!","#aa00ff",50,"magic",[3],37725],
	"spin": ["bossSpinWind",35,"🌀 회전참!","#ff6644",45,"swing",[],37732],
	"mine": ["bossMineWind",30,"💣 지뢰!","#5e10a8",40,"magic",[0],37733],
	"multiDash": ["bossMultiDashWind",20,"⚡ 연격!","#ff4488",45,"",[],37735],
	"slashCombo": ["bossSlashWind",20,"⚔ 난타!","#ff8844",45,"",[],37736],
	"slam": ["bossSlamWind",35,"💥 강타!","#ff4400",50,"",[],37737],
	"sweep": ["bossSweepWind",25,"🌀 휘두르기!","#ffaa00",40,"",[],37738],
	"tailSwipe": ["bossSweepWind",40,"🦴 꼬리치기!","#cc8844",50,"swing",[],37739],
	"beanStorm": ["bossBeanStormWind",25,"🔴 빨간콩 폭풍!","#cc1100",50,"charge",[],37757],
}

static func source_receipt() -> Dictionary:
	return {"source_main":"e556b617190c325ca39f5add04357f5dea5ca87e",
		"game_sha256":preload("res://source_snapshot/snapshot.gd").SHA256,
		"dependency":"BC05 e1850171849de176ad7d5df61e2cd296705ad7b7",
		"function_range":[37704,38235], "header_range":[37703,37712], "ch1_cases":24,
		"protected_parry_read_only":true, "parryable_ids":_PARRYABLE.duplicate(),
		"live_start_connected":false, "combat_execution_verified":false}


## Accepts the same id/phase/distance/extra_delay as BC04's start_pattern request.
## The original start function does not recheck the selector's Set/phase gates.
static func begin_start(si: int, id: String, enemy: Dictionary, distance: float,
		phase: int, extra_delay: float = 0.0, context: Dictionary = {}, chapter_catalog: Variant = null) -> Dictionary:
	var resolved: Dictionary = CatalogContext.resolve(chapter_catalog)
	if not resolved["ready"]: return _fail(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	if not data_catalog.boss_for_stage(si).get("supported",false): return _fail("unsupported_chapter_stage")
	var move: Dictionary = data_catalog.move_by_id(id)
	if move.is_empty(): return _fail("unsupported_ch1_union_move")
	if chapter_catalog!=null and Catalog.move_by_id(id).is_empty(): return _fail("pattern_start_owner_required")
	var ph: Dictionary = data_catalog.phase_by_index(phase)
	if ph.is_empty() or not _num(distance) or not _num(extra_delay): return _fail("phase_or_distance_unsupported")
	if not _numbers(enemy,["x","y"]): return _fail("actor_position_missing")
	if enemy.has("ib") and not enemy["ib"] is bool: return _fail("boss_flag_unsupported")
	var field_phase: Variant = enemy.get("_bossPhase",0)
	if field_phase == null: field_phase = 0
	if not _num(field_phase): return _fail("actor_phase_unsupported")
	var ep: float = field_phase
	var druid: bool = enemy.get("ib",false) and si in [0,3] # Current finale gate is impossible.
	var needs_player: bool = id in ["jump","burrowStrike","chaseAoe","elemBall","groundFissure","poisonTrail","rapidMissile"] or (id=="lavaPools" and si in [0,3])
	if id=="fan":
		if not context.get("thorn_first") is bool: return _fail("thorn_optin_reader_missing")
		needs_player = context["thorn_first"] and druid and ep<=1
	if needs_player and not _numbers(context,["player_x","player_y"]): return _fail("player_position_reader_missing")
	if id in ["jump","rapidMissile"] and not _numbers(enemy,["r"]): return _fail("actor_radius_missing")
	if id in ["elemBall","groundFissure","tideWave","seekerMines","lavaPools","rapidMissile","chaseAoe"] and not _numbers(enemy,["atk","el"]): return _fail("attack_element_snapshot_missing")
	if id in ["groundFissure","lavaPools"]:
		for key: String in ["map_width","map_height"]:
			if context.has(key) and context[key]!=null and not _num(context[key]): return _fail("map_dimension_unsupported")
	if id=="seekerMines" or (id=="grab" and distance<120):
		if not _numbers(enemy,["facing"]): return _fail("actor_facing_missing")
	if id in ["elemBall","groundFissure","lavaPools"] and not enemy.get("col") is String: return _fail("fallback_color_missing")
	var tele: float = _i32(move["tele"]*ph["teleM"])+extra_delay
	if si==2: tele = _i32(tele*1.4)
	var e: Dictionary = enemy.duplicate(true)
	var program: Array = []
	_write(program,{"_atkParryable":_PARRYABLE.has(id)},37705)
	if _WINDS.has(id):
		var row: Array = _WINDS[id]
		var line: int = row[7]
		var duration: float = tele if tele!=0 else row[1]
		_write(program,{"s":row[0],"st2":duration},line)
		match id:
			"fan":
				if context["thorn_first"] and druid and ep<=1:
					_write(program,{"_druidFanWindMax":duration,"facing":_aim(e,context)},line)
			"spin": _write(program,{"_spinAng":0},line)
			"multiDash": _write(program,{"_dashCnt":4+_i32(phase*1.5),"_dashIdx":0},line)
			"slashCombo": _write(program,{"_slashCnt":3+_i32(phase*1.5),"_slashIdx":0,"_weaponAng":0},line)
			"slam": _write(program,{"_weaponAng":-1.2},line)
			"sweep":
				_write(program,{"_weaponAng":-0.8},line)
				program.append({"op":"sweep_rng","line":line})
			"tailSwipe": _write(program,{"_weaponAng":-1.15,"_sweepDir":1,"_isTail":true},line)
			"beanStorm": _write(program,{"_bsWave":0,"_bsMaxWave":3+_i32(phase)},line)
		_text(program,e,30,row[2],row[3],row[4],line)
		if row[5]!="": _call(program,"SFX."+row[5],row[6],line)
	else:
		match id:
			"grab":
				if distance<120:
					var duration: float = tele if tele!=0 else 40
					_write(program,{"s":"bossGrabWind","st2":duration,"_grabWindMax":duration,"_grabAng":e["facing"]},37730)
					_text(program,e,30,"🖐 잡기!","#cc00ff",45,37730)
					_call(program,"SFX.charge",[],37730)
				else:
					var duration: float = _i32(55*ph["teleM"])+extra_delay # No stage2 1.4 here.
					_write(program,{"s":"bossChargeWind","st2":duration if duration!=0 else 55},37731)
					_text(program,e,30,"⚠ 돌진!","#ffaa00",50,37731)
					_call(program,"SFX.charge",[],37731)
			"jump":
				program.append({"op":"call","command":"canMv","args":[context["player_x"],context["player_y"],e["r"]],"line":37719,"pending":"jump_collision"})
				program.append({"op":"jump_finish","tele":tele})
				_text(program,e,30,"🦅 도약 준비!","#cc66ff",40,37721)
				_call(program,"SFX.charge",[],37721)
			"burrowStrike":
				_write(program,{"_teleOx":e["x"],"_teleOy":e["y"],"facing":_aim(e,context)},37753)
				_write(program,{"s":"bossDruidDive","st2":tele if tele!=0 else 50,"_diveMax":tele if tele!=0 else 50},37754)
				_call(program,"addTxt",[e["x"],e["y"]-30,"🌿⚠",60],37755) # Original four-argument call.
				_call(program,"SFX.charge",[],37755)
			"poisonTrail":
				_ensure(program,"_poisonPools",38017)
				_write(program,{"_ptAng":_aim(e,context),"_ptT":0},38018)
				_write(program,{"s":"bossPoisonDash","st2":50},38019)
				_text(program,e,30,"☠ 독안개!","#44cc00",55,38020)
				_call(program,"SFX.magic",[4],38020)
			"chaseAoe":
				_ensure(program,"_chaseAoes",37763)
				_append(program,"_chaseAoes",{"src":{"actor_ref":"boss"},"cnt":0,"maxCnt":10,"t":0,"interval":60,"r":450,"delay":90,"dmg":_i32(e["atk"]*2),"el":e["el"],"druid":druid},37764)
				_text(program,e,30,"🔴 추적 장판!","#a9cc63" if druid else "#ff2200",55,37765,["🔴","🌿"] if druid else [])
				_call(program,"SFX.magic",[0],37765)
				var duration: float = _i32(40*ph["teleM"])+extra_delay
				_write(program,{"s":"bossChargeWind","st2":duration if duration!=0 else 40},37767)
				_write(program,{"facing":_aim(e,context)},37768)
				_text(program,e,45,"⚠ 돌진!","#ffaa00",40,37769)
			"elemBall", "rapidMissile":
				var elem: bool = id=="elemBall"
				var facing: float = _aim(e,context)
				_write(program,{"facing":facing},37774 if elem else 38216)
				var authored_count: float = 10+_i32(ep*1.5) if elem else 3+minf(ep,3)
				var count: int = int(ceil(authored_count))
				for i in range(count):
					var angle: float = facing-PI*0.55/2+PI*0.55*i/(authored_count-1) if elem else facing+(i-(authored_count-1)/2.0)*0.15
					var speed: float = 6 if elem else 14+ep*2
					var radius: float = 30 if elem else e["r"]
					var shot: Dictionary = {"x":e["x"]+cos(angle)*radius,"y":e["y"]+sin(angle)*radius,"vx":cos(angle)*speed,"vy":sin(angle)*speed,
						"dmg":_i32(e["atk"]*(3 if elem else 2)),"el":e["el"],"friendly":false,"life":400 if elem else 300,"ml":400 if elem else 300}
					if elem:
						shot.merge({"col":_color(e,e["col"]),"sz":16,"elemBall":true,"homing":not druid,"parryClass":"magic" if druid else "","_druidStraight":druid,"r":16})
					else: shot.merge({"col":"#ff4444","sz":3,"homing":true,"_missileTrail":true})
					_call(program,"_spawnBossProjectile",[shot],37781 if elem else 38223)
				if elem:
					_text(program,e,30,"💥 속성탄!",_color(e,"#ff8844"),45,37788)
					_call(program,"SFX.magic",[1 if e["el"]==1 else (2 if e["el"]==2 else (4 if e["el"]==4 else 0))],37789)
					_call(program,"addParts",[e["x"],e["y"],_color(e,e["col"]),15],37790)
					_call(program,"shake",[8],37791)
				else:
					_call(program,"SFX.charge",[],38229)
					_call(program,"shake",[8],38229)
					_text(program,e,30,"🚀 미사일!","#ff2200",55,38230)
					_call(program,"addParts",[e["x"],e["y"],"#ff4444",12],38231)
				_write(program,{"s":"recover","st2":30},37792 if elem else 38232)
			"groundFissure":
				var facing: float = _aim(e,context)
				_write(program,{"facing":facing},37935)
				_ensure(program,"_fissures",37938)
				var count: int = 3 if ep>=3 else (2 if ep>=1 else 1)
				var max_len: int = _i32(maxf(_map(context,"map_width",50),_map(context,"map_height",42))*_TILE*0.45)
				for i in range(count):
					_append(program,"_fissures",{"x":e["x"],"y":e["y"],"ang":facing+(i-(count-1)/2.0)*0.3,"spd":20,"len":0,"maxLen":max_len,
						"t":0,"maxT":140,"w":140,"dmg":_i32(e["atk"]*2),"el":e["el"],"exploded":false,"explR":minf(750,max_len*0.3),"druid":druid},37943)
				_call(program,"SFX.detonate",[],37947)
				_call(program,"shake",[10],37947)
				_text(program,e,30,"🌋 균열!","#a9cc63" if druid else _color(e,"#ff4400"),50,37948)
				_write(program,{"s":"recover","st2":30},37949)
			"tideWave":
				_ensure(program,"_tideWaves",37955)
				var count: int = int(ceil(2+minf(ep,2)))
				for i in range(count):
					program.append({"op":"tide_rng","payload":{"x":e["x"],"y":e["y"],"r":20+i*8,"maxR":1750,"spd":15,"t":0,"maxT":120,"gapSize":0.8,"w":60,
						"dmg":_i32(e["atk"]*1.5),"el":e["el"],"hitT":0,"druid":druid}})
				_call(program,"SFX.magic",[0],37963)
				_text(program,e,30,"🌊 파동!","#a9cc63" if druid else _color(e,"#4488ff"),50,37963)
				_write(program,{"s":"recover","st2":35},37964)
			"seekerMines":
				_ensure(program,"_seekerMines",37970)
				var n: float = 3+minf(ep,2)
				for i in range(int(ceil(n))):
					var angle: float = e["facing"]+PI*2*i/n
					_append(program,"_seekerMines",{"_druidMine":druid,"x":e["x"]+cos(angle)*20,"y":e["y"]+sin(angle)*20,"vx":cos(angle),"vy":sin(angle),"spd":1,
						"t":0,"armT":60,"maxT":360,"r":60,"dmg":_i32(e["atk"]*2),"el":3,"hp":1},37973)
				_call(program,"SFX.charge",[],37978)
				_text(program,e,30,"💣 추적지뢰!","#5e10a8",50,37978)
				_write(program,{"s":"recover","st2":25},37979)
			"lavaPools":
				_ensure(program,"_lavaPools",38089)
				if si in [0,3]: # Source branch depends on stage, not ib.
					var angle: float = _aim(e,context)
					var cx: float = context["player_x"]+cos(angle)*120
					var cy: float = context["player_y"]+sin(angle)*120
					for i in range(3):
						var offset: int = 0 if i==0 else (1 if i==1 else -1)
						_append(program,"_lavaPools",{"x":cx-sin(angle)*360*offset,"y":cy+cos(angle)*360*offset,"t":0,"warnT":55+i*18,"maxT":300,"r":150,"dmg":_i32(e["atk"]*0.9),"el":e["el"],"tickT":0},38093)
					_text(program,e,30,"☠ 독 늪!","#66dd22",60,38094)
					_call(program,"SFX.magic",[3],38094)
					_write(program,{"s":"recover","st2":25},38094)
				else:
					program.append({"op":"lava_safe","n":3-_i32(ep/3),"index":0})
					program.append({"op":"lava_fill","n":8+ep*3,"index":0})
					_text(program,e,30,"🔥🔥 용암 지대!",_color(e,"#ff4400"),70,38117)
					_call(program,"SFX.detonate",[],38117)
					_call(program,"shake",[15],38117)
					_write(program,{"s":"recover","st2":35},38118)
	var result: Dictionary = {"status":"READY","continuation":{"version":1,"si":si,"id":id,"enemy":e,"context":context.duplicate(true),"program":program,"pc":0,"pending":"","safes":[]},"full_tick_complete":false}
	CatalogContext.bind(result["continuation"],chapter_catalog)
	return result


## rng(tag)->[0,1); response={ack:true,value:...} for the previous request.
static func next_start(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or not token.get("enemy") is Dictionary or not token.get("context") is Dictionary or not token.get("program") is Array \
		or not token.get("pc") is int or not token.get("pending") is String or token["pc"]<0 or token["pc"]>token["program"].size(): return _fail("continuation_shape_unsupported")
	var resolved: Dictionary = CatalogContext.from_token(token)
	if not resolved["ready"]: return _fail(resolved["reason"])
	if not token.has("_chapter_catalog") and token.get("si") is int and token["si"]>=4: return _fail("chapter_context_missing")
	if token.has("_chapter_catalog"):
		var data_catalog: Variant = resolved["catalog"]
		if not data_catalog.boss_for_stage(token.get("si",-1)).get("supported",false): return _fail("unsupported_chapter_stage")
		if Catalog.move_by_id(token.get("id","")).is_empty(): return _fail("pattern_start_owner_required")
	var state: Dictionary = token.duplicate(true)
	var e: Dictionary = state["enemy"]
	var context: Dictionary = state["context"]
	var pending: String = state["pending"]
	if pending!="":
		if not response is Dictionary or response.get("ack")!=true: return _fail("owner_ack_missing")
		if pending=="jump_collision":
			if not response.get("value") is bool: return _fail("collision_result_missing")
			if response["value"]: state["jump_target"]={"x":context["player_x"],"y":context["player_y"]}
			else: state["program"].insert(state["pc"],{"op":"call","command":"safePt","args":[context["player_x"],context["player_y"],e["r"]],"line":37719,"pending":"jump_safe"})
		elif pending=="jump_safe":
			if not response.has("value"): return _fail("safe_point_result_missing")
			if response["value"]==null: state["jump_target"]={"x":e["x"],"y":e["y"]}
			elif response["value"] is Dictionary and _numbers(response["value"],["x","y"]): state["jump_target"]=response["value"].duplicate(true)
			else: return _fail("safe_point_shape_unsupported")
		elif pending!="ack": return _fail("pending_kind_unsupported")
		state["pending"]=""
	var events: Array = []
	var ledger: Array = []
	while state["pc"]<state["program"].size():
		var op: Dictionary = state["program"][state["pc"]]
		state["pc"]+=1
		match op["op"]:
			"write": _apply(e,op["fields"],op["line"],events)
			"call": return _packet(state,op,events,ledger)
			"jump_finish":
				if not state.get("jump_target") is Dictionary: return _fail("jump_target_not_resolved")
				_apply(e,{"jumpX":state["jump_target"]["x"],"jumpY":state["jump_target"]["y"],"jumpOx":e["x"],"jumpOy":e["y"]},37720,events)
				var duration: float = op["tele"] if op["tele"]!=0 else 34
				_apply(e,{"s":"bossJumpWind","st2":duration,"_telegraphT":duration,"_telegraphR":e["r"]+30},37721,events)
			"sweep_rng":
				var draw: Dictionary = _draw(rng,"sweep_direction",37738,events,ledger)
				if not draw["ok"]: return _fail(draw["reason"],ledger)
				_apply(e,{"_sweepDir":1 if draw["unit"]>0.5 else -1},37738,events)
			"tide_rng":
				var draw: Dictionary = _draw(rng,"tide_gap",37957,events,ledger)
				if not draw["ok"]: return _fail(draw["reason"],ledger)
				var payload: Dictionary = op["payload"]
				payload["gapAng"]=draw["unit"]*PI*2
				return _packet(state,{"command":"append_global_queue","args":["_tideWaves",payload],"line":37958},events,ledger)
			"lava_safe":
				for i in range(op["n"]):
					var x: Dictionary = _draw(rng,"lava_safe_x",38104,events,ledger)
					if not x["ok"]: return _fail(x["reason"],ledger)
					var y: Dictionary = _draw(rng,"lava_safe_y",38104,events,ledger)
					if not y["ok"]: return _fail(y["reason"],ledger)
					state["safes"].append({"x":e["x"]+(x["unit"]-0.5)*400,"y":e["y"]+(y["unit"]-0.5)*400})
			"lava_fill":
				while op["index"]<op["n"]:
					op["index"]+=1
					var x: Dictionary = _draw(rng,"lava_pool_x",38107,events,ledger)
					if not x["ok"]: return _fail(x["reason"],ledger)
					var y: Dictionary = _draw(rng,"lava_pool_y",38108,events,ledger)
					if not y["ok"]: return _fail(y["reason"],ledger)
					var lx: float = _map(context,"map_width",50)*_TILE/2+(x["unit"]-0.5)*(_map(context,"map_width",50)*_TILE*0.7)
					var ly: float = _map(context,"map_height",42)*_TILE/2+(y["unit"]-0.5)*(_map(context,"map_height",42)*_TILE*0.7)
					var safe: bool = false
					for point: Dictionary in state["safes"]:
						if sqrt((lx-point["x"])*(lx-point["x"])+(ly-point["y"])*(ly-point["y"]))<180:
							safe=true
							break
					if safe: continue
					var r: Dictionary = _draw(rng,"lava_pool_radius",38114,events,ledger)
					if not r["ok"]: return _fail(r["reason"],ledger)
					state["pc"]-=1
					return _packet(state,{"command":"append_global_queue","args":["_lavaPools",{"x":lx,"y":ly,"t":0,"warnT":90,"maxT":420,"r":600+r["unit"]*300,"dmg":_i32(e["atk"]*1.2),"el":e["el"],"tickT":0}],"line":38113},events,ledger)
	return {"status":"READY","done":true,"enemy":e,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _packet(state: Dictionary, op: Dictionary, events: Array, ledger: Array) -> Dictionary:
	state["pending"]=op.get("pending","ack")
	var command: Dictionary = {"command":op["command"],"source_line":op["line"],"args":op["args"],"executed":false}
	events.append({"kind":"command","value":command})
	return {"status":"READY","done":false,"enemy":state["enemy"].duplicate(true),"events":events,"rng_ledger":ledger,"command":command,"continuation":state,"full_tick_complete":false}

static func _draw(rng: Callable, tag: String, line: int, events: Array, ledger: Array) -> Dictionary:
	if not rng.is_valid(): return {"ok":false,"reason":"rng_provider_missing"}
	var unit: Variant = rng.call(tag)
	var row: Dictionary = {"field":tag,"source_line":line,"unit":unit}
	ledger.append(row)
	events.append({"kind":"rng","value":row})
	if not _num(unit) or unit<0 or unit>=1: return {"ok":false,"reason":"rng_unit_invalid"}
	return {"ok":true,"unit":unit}

static func _apply(e: Dictionary, fields: Dictionary, line: int, events: Array) -> void:
	for key in fields:
		e[key]=fields[key]
		events.append({"kind":"write","field":key,"value":fields[key],"source_line":line})

static func _write(program: Array, fields: Dictionary, line: int) -> void:
	program.append({"op":"write","fields":fields,"line":line})

static func _call(program: Array, command: String, args: Array, line: int) -> void:
	program.append({"op":"call","command":command,"args":args,"line":line})

static func _ensure(program: Array, queue: String, line: int) -> void:
	_call(program,"ensure_global_queue",[queue],line)

static func _append(program: Array, queue: String, value: Dictionary, line: int) -> void:
	_call(program,"append_global_queue",[queue,value],line)

static func _text(program: Array, e: Dictionary, offset: float, text: String, color: String, life: int, line: int, replace: Array = []) -> void:
	var recipe: Dictionary = {"call":"_T","args":[text]}
	if not replace.is_empty(): recipe["replace_first"]=replace
	_call(program,"addTxt",[e["x"],e["y"]-offset,recipe,color,life],line)

static func _aim(e: Dictionary, context: Dictionary) -> float:
	return atan2(context["player_y"]-e["y"],context["player_x"]-e["x"])

static func _color(e: Dictionary, fallback: String) -> String:
	var index: float = e["el"]
	return _COLORS[int(index)] if index>=0 and index<_COLORS.size() and floor(index)==index else fallback

static func _map(context: Dictionary, key: String, fallback: float) -> float:
	var value: Variant = context.get(key)
	return fallback if value==null or value==0 else float(value)

static func _i32(value: float) -> int:
	if not is_finite(value) or value==0: return 0
	var wrapped: float = fmod(floor(value) if value>=0 else ceil(value),4294967296.0)
	if wrapped<0: wrapped+=4294967296.0
	if wrapped>=2147483648.0: wrapped-=4294967296.0
	return int(wrapped)

static func _num(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

static func _numbers(object: Dictionary, keys: Array) -> bool:
	for key: String in keys:
		if not _num(object.get(key)): return false
	return true

static func _fail(reason: String, ledger: Array = []) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"enemy":null,"continuation":null,"command":null,"rng_ledger":ledger,"full_tick_complete":false}
