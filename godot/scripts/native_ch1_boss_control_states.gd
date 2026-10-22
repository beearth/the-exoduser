extends RefCounted
## BC10: ordinary CH1 grab/burrow switch packets AFTER BC05's clock.
## No scene, player writer, hurtP/hurtE, parry, projectile or Main execution.
## Every command is unexecuted. Protected/writer calls require COMPLETE readback.
## Caller must consume ordered events; returned snapshots are proposals only.
const STATES = ["bossGrabWind", "bossGrab", "bossDruidDive", "bossDruidUnder", "bossDruidErupt"]

static func source_receipt() -> Dictionary:
	return {"source_main":"6d987cb8a31d0aadd2b6a8cf1e9a781d1fb76d4d",
		"game_sha256":preload("res://source_snapshot/snapshot.gd").SHA256,
		"source_ranges":[[40839,40869],[41049,41074]],
		"live_combat_connected":false,"damage_or_parry_execution_verified":false,
		"forced_player_writer_verified":false,"iframe_immunity_verified":false,"full_tick_complete":false}

## context.druid_finale is the actual external predicate read, not an si guess.
## Finale is deliberately outside this ordinary-CH1 module. No clock decrement.
static func begin_tick(si: int, enemy: Dictionary, sp: float, player: Dictionary, context: Dictionary = {}) -> Dictionary:
	if si<0 or si>3: return _fail("unsupported_stage")
	if not STATES.has(enemy.get("s")): return _fail("unsupported_control_state")
	if not _actor(enemy) or not _player(player) or not _num(sp): return _fail("snapshot_unsupported")
	var kind: String=enemy["s"]
	if kind.begins_with("bossDruid"):
		if si not in [0,3]: return _fail("burrow_not_in_stage_moveset")
		if not context.get("druid_finale") is bool: return _fail("finale_reader_missing")
		if context["druid_finale"]: return _fail("finale_out_of_scope")
		if not context.get("vfx_available") is bool: return _fail("vfx_reader_missing")
	if not _state_fields(kind,enemy): return _fail("control_fields_missing")
	return {"status":"READY","continuation":{"version":1,"si":si,"kind":kind,
		"enemy":enemy.duplicate(true),"player":player.duplicate(true),"sp":sp,
		"context":context.duplicate(true),"step":"entry","pending":""},"full_tick_complete":false}

static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if token.get("version")!=1 or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("context") is Dictionary or not STATES.has(token.get("kind")) \
		or not token.get("si") is int or token["si"]<0 or token["si"]>3 \
		or not _num(token.get("sp")) or not token.get("step") is String or not token.get("pending") is String:
		return _fail("continuation_shape_unsupported")
	var t: Dictionary=token.duplicate(true)
	var e: Dictionary=t["enemy"]
	var p: Dictionary=t["player"]
	var events: Array=[]
	var ledger: Array=[]
	if t["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return _fail("owner_ack_missing")
		match t["pending"]:
			"move":
				if not response.get("value") is bool: return _fail("collision_result_missing")
				if response["value"]:
					var fields: Dictionary={}
					if t["axis"]!="y": fields["x"]=t["mx_target"]
					if t["axis"]!="x": fields["y"]=t["my_target"]
					_write(e,fields,t["move_line"],events)
					t["step"]="wind_rng"
			"owner":
				if not _complete(response.get("enemy_after"),e,false) or not _complete(response.get("player_after"),p,true):
					return _fail("complete_owner_readback_missing")
				t["enemy"]=response["enemy_after"].duplicate(true)
				t["player"]=response["player_after"].duplicate(true)
				e=t["enemy"];p=t["player"]
			"translate":
				if not response.get("value") is String: return _fail("translation_result_missing")
				t["label"]=response["value"]
			"ack": pass
			_: return _fail("pending_kind_unsupported")
		t["pending"]=""
	elif response!=null: return _fail("unexpected_response")
	if not _actor(e) or not _player(p) or not _state_fields(t["kind"],e): return _fail("snapshot_unsupported")
	var c: Dictionary=t["context"]
	var kind: String=t["kind"]
	if kind.begins_with("bossDruid") and (t["si"] not in [0,3] or c.get("druid_finale")!=false or not c.get("vfx_available") is bool):
		return _fail("ordinary_burrow_reader_missing")
	while t["step"]!="done":
		match t["step"]:
			"entry":
				if kind=="bossGrabWind":
					var a: float=atan2(p["y"]-e["y"],p["x"]-e["x"])
					_write(e,{"_grabAng":a},40841,events)
					var speed: float=e["speed"]*1.5*t["sp"]
					t["ga"]=a;t["dx"]=cos(a)*speed;t["dy"]=sin(a)*speed
					t["step"]="move_x"
					return _move(t,e["x"]+t["dx"],e["y"]+t["dy"],40843,"xy",events,ledger)
				elif kind=="bossGrab":
					t["step"]="grab_tick"
					return _control(t,[{"path":"x","value":e["x"]+cos(e["_grabAng"])*25},
						{"path":"y","value":e["y"]+sin(e["_grabAng"])*25},
						{"path":"kb.x","value":0},{"path":"kb.y","value":0}],40856,40857,events,ledger)
				elif kind=="bossDruidDive":
					_write(e,{"facing":atan2(p["y"]-e["y"],p["x"]-e["x"])},41050,events)
					t["step"]="dive_vfx"
					var gate: Variant=_draw(rng,"dive_gate",41051,events,ledger)
					if not _unit(gate): return _fail("rng_missing_or_invalid",ledger)
					if gate<0.5:
						var u: Variant=_draw(rng,"dive_angle",41051,events,ledger)
						var size: Variant=_draw(rng,"dive_size",41051,events,ledger)
						if not _unit(u) or not _unit(size): return _fail("rng_missing_or_invalid",ledger)
						var a: float=u*PI*2
						return _cmd(t,"poolPart",41051,[e["x"]+cos(a)*e["r"]*1.2,e["y"]+sin(a)*e["r"]*1.2,-cos(a)*1.5,-sin(a)*1.5,"#66dd22",2+size*2,10],events,ledger)
				elif kind=="bossDruidUnder":
					_write(e,{"_diveTx":e["_diveTx"]+(p["x"]-e["_diveTx"])*0.06*t["sp"],
						"_diveTy":e["_diveTy"]+(p["y"]-e["_diveTy"])*0.06*t["sp"]},41055,events)
					var prog: float=1-e["st2"]/_or_num(e.get("_underMax"),45)
					_write(e,{"x":e["_teleOx"]+(e["_diveTx"]-e["_teleOx"])*prog,
						"y":e["_teleOy"]+(e["_diveTy"]-e["_teleOy"])*prog},41057,events)
					_write(e,{"iframes":maxf(_or_num(e.get("iframes"),0),5)},41058,events)
					t["step"]="under_vfx" if e["st2"]<=0 else "done"
					if e["st2"]<=0: _write(e,{"x":e["_diveTx"],"y":e["_diveTy"]},41060,events)
				else:
					t["step"]="erupt_end"
					if not e.get("_eruptHit",false) and e["st2"]<=e["_eruptMax"]-8:
						_write(e,{"_eruptHit":true},41063,events)
						t["er"]=e["r"]+120;t["er_dmg"]=_i32(e["atk"]*2.2);t["ex"]=e["x"];t["ey"]=e["y"]
						t["step"]="erupt_vfx_hit"
						return _cmd(t,"_addBlastLight",41066,[t["ex"],t["ey"],t["er"]*1.2,14,120,220,90],events,ledger)
			"move_x":
				t["step"]="move_y"
				return _move(t,e["x"]+t["dx"],e["y"],40844,"x",events,ledger)
			"move_y":
				t["step"]="wind_rng"
				return _move(t,e["x"],e["y"]+t["dy"],40844,"y",events,ledger)
			"wind_rng":
				t["step"]="wind_end"
				var gate: Variant=_draw(rng,"grab_gate",40845,events,ledger)
				if not _unit(gate): return _fail("rng_missing_or_invalid",ledger)
				if gate>0.6:
					var u: Variant=_draw(rng,"grab_vx",40845,events,ledger)
					if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
					return _cmd(t,"poolPart",40845,[e["x"]+cos(t["ga"])*e["r"],e["y"]+sin(t["ga"])*e["r"],(u-0.5)*2,-1.5,"#ff2266",3,10],events,ledger)
			"wind_end":
				t["step"]="done"
				if e["st2"]<=0:
					if _distance(p,e["x"],e["y"])<e["r"]+p["r"]+200 and p["iframes"]<=0 and p["s"]!="charge":
						_write(e,{"s":"bossGrab","st2":60},40850,events)
						t["step"]="grab_caught_label"
						return _cmd(t,"_T",40851,["⚠ 잡혔다!"],events,ledger,"translate")
					_write(e,{"s":"recover","st2":40},40852,events)
					return _cmd(t,"addParts",40852,[e["x"],e["y"],"#ff2266",8],events,ledger)
			"grab_caught_label":
				t["step"]="grab_caught_shake"
				return _cmd(t,"addTxt",40851,[p["x"],p["y"]-25,t["label"],"#cc00ff",50],events,ledger)
			"grab_caught_shake":
				if not _num(c.get("shake")): return _fail("shake_reader_missing")
				_global("shake",10*c["shake"]/100.0,40851,events);t["step"]="done"
			"grab_tick":
				t["step"]="grab_throw"
				if fmod(e["st2"],10)==0 and p["iframes"]<=0:
					t["step"]="grab_tick_parts"
					return _damage(t,0.4,{"dtype":"grab"},40859,events,ledger)
			"grab_tick_parts":
				t["step"]="grab_throw"
				return _cmd(t,"addParts",40860,[p["x"],p["y"],"#ff2266",3],events,ledger)
			"grab_throw":
				t["step"]="done"
				if e["st2"]<=0:
					t["step"]="grab_release"
					return _damage(t,1.8,null,40864,events,ledger)
			"grab_release":
				t["step"]="grab_throw_translate"
				return _control(t,[{"path":"kb.x","value":cos(e["_grabAng"])*18},
					{"path":"kb.y","value":sin(e["_grabAng"])*18},{"path":"iframes","value":30}],40865,40866,events,ledger)
			"grab_throw_translate":
				t["step"]="grab_throw_label"
				return _cmd(t,"_T",40866,["💥 내던지기!"],events,ledger,"translate")
			"grab_throw_label":
				t["step"]="grab_throw_shake"
				return _cmd(t,"addTxt",40866,[p["x"],p["y"]-30,t["label"],"#ff4400",50],events,ledger)
			"grab_throw_shake":
				if not _num(c.get("shake")): return _fail("shake_reader_missing")
				_global("shake",15*c["shake"]/100.0,40867,events);t["step"]="grab_throw_parts"
				return _cmd(t,"SFX.groggy",40867,[],events,ledger)
			"grab_throw_parts":
				t["step"]="grab_recover"
				return _cmd(t,"addParts",40867,[p["x"],p["y"],"#ff4400",15],events,ledger)
			"grab_recover":
				_write(e,{"s":"recover","st2":70},40868,events);t["step"]="done"
			"dive_vfx":
				t["step"]="done"
				if e["st2"]<=0:
					t["step"]="dive_enter"
					if c["vfx_available"]: return _cmd(t,"playVFXAng",41052,["druid_dust",e["x"],e["y"],e["r"]*2/256.0,7,0,false],events,ledger)
			"dive_enter":
				_write(e,{"_diveTx":p["x"],"_diveTy":p["y"],"s":"bossDruidUnder","st2":45,"_underMax":45,"iframes":maxf(_or_num(e.get("iframes"),0),50)},41052,events)
				t["step"]="done"
				return _cmd(t,"SFX.groggy",41052,[],events,ledger)
			"under_vfx":
				t["step"]="under_enter"
				if c["vfx_available"]: return _cmd(t,"playVFXAng",41060,["druid_dust",e["x"],e["y"],e["r"]*2*1.3/256.0,7,0,false],events,ledger)
			"under_enter":
				_write(e,{"s":"bossDruidErupt","st2":40,"_eruptMax":40,"_eruptHit":false},41060,events)
				t["step"]="under_sfx"
				# Four arguments in the original: preserve the absent colour/duration.
				return _cmd(t,"addTxt",41060,[e["x"],e["y"]-40,"🌿💥",60],events,ledger)
			"under_sfx":
				t["step"]="under_shake"
				return _cmd(t,"SFX.detonate",41060,[],events,ledger)
			"under_shake":
				t["step"]="done"
				return _cmd(t,"shake",41060,[12],events,ledger)
			"erupt_vfx_hit":
				t["step"]="erupt_vfx_roots"
				if c["vfx_available"]: return _cmd(t,"playVFXAng",41067,["druid_hit",t["ex"],t["ey"],0.72,7,0,false],events,ledger)
			"erupt_vfx_roots":
				t["step"]="erupt_contact"
				if c["vfx_available"]: return _cmd(t,"playVFXAng",41068,["druid_roots",t["ex"],t["ey"],t["er"]*2/256.0,7,0,false],events,ledger)
			"erupt_contact":
				t["step"]="erupt_end"
				if _distance(p,t["ex"],t["ey"])<t["er"] and p["iframes"]<=0 and p["s"]!="charge":
					return _cmd(t,"resolve_boss_erupt_contact",41070,[{"source_lines":[41070,41071],
						"raw_damage":t["er_dmg"],"rounding":"ToInt32(atk*2.2), then ToInt32(raw*elMul(e.el,ar().el))",
						"center":[t["ex"],t["ey"]],"element":e["el"],"parry_multiplier":4,"stunned":60,"poise":20,
						"poison_add":4,"web_slow_min":90,"knockback_add":14,
						"requires":["isPWin","hurtP","boss_hurtE","doParry","poise_owner","player_status_writer"],
						"combat_verified":false}],events,ledger,"owner")
			"erupt_end":
				if e["st2"]<=0: _write(e,{"s":"recover","st2":30},41074,events)
				t["step"]="done"
			_: return _fail("unknown_control_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,
		"command":null,"continuation":null,"full_tick_complete":false}

static func _damage(t: Dictionary, multiplier: float, options: Variant, line: int, events: Array, ledger: Array) -> Dictionary:
	return _cmd(t,"resolve_boss_grab_damage",line,[{"atk":t["enemy"]["atk"],"multiplier":multiplier,
		"element":t["enemy"]["el"],"rounding":"ToInt32(atk*multiplier*elMul(e.el,ar().el))",
		"options":options,"requires":["hurtP","elMul","ar"],"combat_verified":false}],events,ledger,"owner")

static func _control(t: Dictionary, assignments: Array, first_line: int, last_line: int, events: Array, ledger: Array) -> Dictionary:
	# Do not silently mutate P or accept ack-only as proof of a real player write.
	return _cmd(t,"apply_boss_player_control",first_line,[{"assignments":assignments,
		"source_lines":[first_line,last_line],"writer_verified":false}],events,ledger,"owner")

static func _move(t: Dictionary, x: float, y: float, line: int, axis: String, events: Array, ledger: Array) -> Dictionary:
	t["mx_target"]=x;t["my_target"]=y;t["move_line"]=line;t["axis"]=axis
	return _cmd(t,"canMv",line,[x,y,t["enemy"]["r"]],events,ledger,"move")

static func _cmd(t: Dictionary, name: String, line: int, args: Array, events: Array, ledger: Array, pending: String="ack") -> Dictionary:
	t["pending"]=pending
	var cmd: Dictionary={"command":name,"source_line":line,"args":args,"executed":false}
	events.append({"kind":"command","value":cmd})
	return {"status":"READY","done":false,"enemy":t["enemy"].duplicate(true),"player":t["player"].duplicate(true),
		"events":events,"rng_ledger":ledger,"command":cmd,"continuation":t,"full_tick_complete":false}

static func _write(e: Dictionary, fields: Dictionary, line: int, events: Array) -> void:
	for key in fields:
		e[key]=fields[key];events.append({"kind":"write","field":key,"value":fields[key],"source_line":line})
static func _global(field: String, value: float, line: int, events: Array) -> void:
	events.append({"kind":"global_write","field":field,"value":value,"source_line":line})
static func _draw(rng: Callable, tag: String, line: int, events: Array, ledger: Array) -> Variant:
	if not rng.is_valid(): return null
	var unit: Variant=rng.call(tag)
	var row: Dictionary={"field":tag,"source_line":line,"unit":unit}
	events.append({"kind":"rng","value":row});ledger.append(row)
	return unit
static func _distance(p: Dictionary, x: float, y: float) -> float:
	return sqrt((p["x"]-x)*(p["x"]-x)+(p["y"]-y)*(p["y"]-y))
static func _complete(v: Variant, before: Dictionary, player: bool) -> bool:
	if not v is Dictionary or not (_player(v) if player else _actor(v)): return false
	return _readback_keys(v,before)
static func _readback_keys(v: Dictionary, before: Dictionary) -> bool:
	for key in before:
		if not v.has(key): return false
		if before[key] is Dictionary and (not v[key] is Dictionary or not _readback_keys(v[key],before[key])): return false
	return true
static func _state_fields(kind: String, e: Dictionary) -> bool:
	if kind=="bossGrabWind": return _numbers(e,["speed"])
	if kind=="bossGrab": return _numbers(e,["_grabAng"])
	if kind=="bossDruidUnder":
		return _numbers(e,["_diveTx","_diveTy","_teleOx","_teleOy"]) and _optional_numbers(e,["_underMax","iframes"])
	if kind=="bossDruidErupt": return _numbers(e,["_eruptMax"]) and (not e.has("_eruptHit") or e["_eruptHit"] is bool)
	return _optional_numbers(e,["iframes"])
static func _actor(e: Dictionary) -> bool: return _numbers(e,["x","y","r","st2","facing","atk","el"]) and e.get("s") is String
static func _player(p: Dictionary) -> bool:
	return _numbers(p,["x","y","r","iframes"]) and p.get("s") is String and p.get("kb") is Dictionary and _numbers(p["kb"],["x","y"])
static func _num(v: Variant) -> bool: return (v is int or v is float) and is_finite(float(v))
static func _unit(v: Variant) -> bool: return _num(v) and v>=0 and v<1
static func _numbers(v: Dictionary, keys: Array) -> bool:
	for key in keys:
		if not _num(v.get(key)): return false
	return true
static func _optional_numbers(v: Dictionary, keys: Array) -> bool:
	for key in keys:
		if v.get(key)!=null and not _num(v[key]): return false
	return true
static func _or_num(v: Variant, fallback: float) -> float: return fallback if v==null or v==0 else float(v)
static func _i32(v: float) -> int:
	var n: float=fmod(floor(v) if v>=0 else ceil(v),4294967296.0)
	if n<0: n+=4294967296.0
	if n>=2147483648.0: n-=4294967296.0
	return int(n)
static func _fail(reason: String, ledger: Array=[]) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"enemy":null,"player":null,"continuation":null,
		"command":null,"rng_ledger":ledger,"full_tick_complete":false}
