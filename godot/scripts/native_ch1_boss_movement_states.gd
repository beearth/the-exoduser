extends RefCounted
## BC08: ordinary CH1 movement packets, NOT a connected updateE/combat owner.
## idle_move ends before BC09 idle projectiles/BC04 AI. idle_switch is a separate
## checkpoint after their actual execution and BC05 feint. Never decrement st2 here.
const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const CatalogContext = preload("res://scripts/native_boss_catalog_context.gd")
const STATES = ["bossChargeWind","bossCharge","bossJumpWind","bossJump","bossMultiDashWind","bossMultiDash"]

static func source_receipt() -> Dictionary:
	return {"source_main":"a00893ad9b93750d7ce70b90f5bd501b578daccb",
		"game_sha256":preload("res://source_snapshot/snapshot.gd").SHA256,
		"dependency":"BC07 edcbc480491a2b9c55abbb99fcda3dc47073583c",
		"ranges":[[38315,38355],[40483,40517],[40664,40708],[40942,40977]],
		"live_combat_connected":false,"damage_or_parry_execution_verified":false,"full_tick_complete":false}

## checkpoint: state / idle_move / idle_switch. context.distance is the ORIGINAL
## cached d, not recomputed after idle movement. frame/vfx_available are real reads.
## Optional read-only catalog follows BC02~07; null keeps CH1 packet bytes.
## Real si is never remapped: source druid gates remain exactly si 0/3.
static func begin_tick(si: int, checkpoint: String, enemy: Dictionary, sp: float, player: Dictionary, context: Dictionary = {}, chapter_catalog: Variant = null) -> Dictionary:
	var resolved: Dictionary = CatalogContext.resolve(chapter_catalog)
	if not resolved["ready"]: return _fail(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	if not data_catalog.boss_for_stage(si).get("supported",false): return _fail("unsupported_stage")
	if not _actor(enemy) or not _player(player) or not _num(sp): return _fail("snapshot_unsupported")
	if checkpoint not in ["state","idle_move","idle_switch"]: return _fail("unknown_checkpoint")
	if checkpoint=="state" and not STATES.has(enemy["s"]): return _fail("unsupported_state")
	if checkpoint!="state" and enemy["s"]!="idle": return _fail("idle_snapshot_required")
	if checkpoint!="state" and not _num(context.get("distance")): return _fail("cached_distance_missing")
	var result: Dictionary = {"status":"READY","continuation":{"version":1,"si":si,"checkpoint":checkpoint,"kind":enemy["s"],
		"enemy":enemy.duplicate(true),"player":player.duplicate(true),"sp":sp,"context":context.duplicate(true),"step":"entry","pending":""},"full_tick_complete":false}
	CatalogContext.bind(result["continuation"],chapter_catalog)
	return result

## Requests never execute helpers. Collision and flow require typed results;
## protected contact requires complete ACTUAL actor/player readback. Fixture
## acknowledgments validate protocol only and never prove damage/parry success.
static func next_tick(token: Dictionary, response: Variant = null, rng: Callable = Callable()) -> Dictionary:
	if not token.get("version")==1 or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary \
		or not token.get("context") is Dictionary or not token.get("step") is String or not token.get("pending") is String \
		or not token.get("si") is int or not _num(token.get("sp")) \
		or token.get("checkpoint") not in ["state","idle_move","idle_switch"]: return _fail("continuation_unsupported")
	var resolved: Dictionary = CatalogContext.from_token(token)
	if not resolved["ready"]: return _fail(resolved["reason"])
	var data_catalog: Variant = resolved["catalog"]
	if not data_catalog.boss_for_stage(token["si"]).get("supported",false): return _fail("continuation_unsupported")
	var t: Dictionary=token.duplicate(true)
	var e: Dictionary=t["enemy"]
	var p: Dictionary=t["player"]
	var c: Dictionary=t["context"]
	var events: Array=[]
	var ledger: Array=[]
	if not _actor(e) or not _player(p): return _fail("snapshot_unsupported")
	if t["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return _fail("owner_ack_missing")
		match t["pending"]:
			"collision":
				if not response.get("value") is bool: return _fail("collision_result_missing")
				if response["value"]:
					_write(e,t["move_fields"],t["move_line"],events)
					t["step"]=t["move_success"]
			"flow":
				if not response.has("value") or (response["value"]!=null and (not response["value"] is Dictionary or not _numbers(response["value"],["x","y"]))): return _fail("flow_result_missing")
				t["flow"]=response["value"]
			"contact":
				if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
					or not _actor(response["enemy_after"]) or not _player(response["player_after"]) \
					or not _contains_keys(response["enemy_after"],e) or not _contains_keys(response["player_after"],p): return _fail("protected_owner_readback_missing")
				t["enemy"]=response["enemy_after"].duplicate(true)
				t["player"]=response["player_after"].duplicate(true)
				e=t["enemy"]
				p=t["player"]
			"translate":
				if not response.get("value") is String: return _fail("translation_result_missing")
				t["label"]=response["value"]
			"ack": pass
			_: return _fail("pending_unsupported")
		t["pending"]=""
	var kind: String=t.get("kind","")
	while t["step"]!="done":
		match t["step"]:
			"entry":
				if t["checkpoint"]=="idle_move":
					if not _num(e.get("stunned")): return _fail("stun_reader_missing")
					if e["stunned"]>0:
						t["idle_stun_return"]=true
						t["step"]="done"
					else:
						if not _numbers(e,["speed","_bossPhase"]) or data_catalog.phase_by_index(int(e["_bossPhase"])).is_empty(): return _fail("idle_phase_missing")
						var aura: Variant=_or(e.get("_aSpdM"),1)
						if aura==null: return _fail("aura_shape_unsupported")
						t["speed"]=e["speed"]*data_catalog.phase_by_index(int(e["_bossPhase"]))["spdM"]*aura*t["sp"]
						if c["distance"]>200:
							t["step"]="approach"
							return _cmd(t,"_ffDir",38322,[e["x"],e["y"]],events,ledger,"flow")
						t["step"]="orbit" if c["distance"]>50 else "retreat"
				elif t["checkpoint"]=="idle_switch":
					if not _numbers(e,["speed","projCd","projT"]): return _fail("idle_stats_missing")
					var aura: Variant=_or(e.get("_aSpdM"),1)
					if aura==null: return _fail("aura_shape_unsupported")
					var speed: float=e["speed"]*1.6*aura
					t["step"]="idle_sep"
					return _move(t,e["x"]+cos(e["facing"])*speed*t["sp"],e["y"]+sin(e["facing"])*speed*t["sp"],"xy",40483,"idle_sep",events,ledger)
				elif kind=="bossChargeWind":
					if t["si"] not in [0,3] or e["st2"]>18: _write(e,{"facing":_aim(e,p)},40665,events)
					t["step"]="done"
					if e["st2"]<=0:
						_write(e,{"s":"bossCharge","st2":50,"echDx":cos(e["facing"]),"echDy":sin(e["facing"])},40666,events)
						t["step"]="charge_parts"
						return _cmd(t,"SFX.charge",40667,[],events,ledger)
				elif kind=="bossJumpWind":
					t["step"]="done"
					if e["st2"]<=0:
						_write(e,{"s":"bossJump","st2":40},40690,events)
						t["step"]="jump_label"
						return _cmd(t,"_T",40690,["🦅 도약!"],events,ledger,"translate")
				elif kind=="bossMultiDashWind":
					_write(e,{"facing":_aim(e,p)},40943,events)
					t["step"]="dash_wind_end"
					var gate: Variant=_draw(rng,"dash_wind_gate",40944,events,ledger)
					if not _unit(gate): return _fail("rng_missing_or_invalid",ledger)
					if gate>0.6:
						var ux: Variant=_draw(rng,"dash_wind_vx",40944,events,ledger)
						if not _unit(ux): return _fail("rng_missing_or_invalid",ledger)
						var uy: Variant=_draw(rng,"dash_wind_vy",40944,events,ledger)
						if not _unit(uy): return _fail("rng_missing_or_invalid",ledger)
						var color: String="#ff4488"
						if t["si"] in [0,3]:
							var uc: Variant=_draw(rng,"dash_wind_color",40944,events,ledger)
							if not _unit(uc): return _fail("rng_missing_or_invalid",ledger)
							color="#66dd22" if uc<0.5 else "#33aa22"
						return _cmd(t,"poolPart",40944,[e["x"],e["y"],(ux-0.5)*3,(uy-0.5)*3,color,2,6],events,ledger)
				elif kind in ["bossCharge","bossJump","bossMultiDash"]:
					if not _num(c.get("frame")) or not c.get("vfx_available") is bool: return _fail("trail_global_reader_missing")
					t["step"]="active_move"
					if t["si"] in [0,3] and fmod(c["frame"],6)==0 and c["vfx_available"]:
						return _cmd(t,"playVFXAng",40669 if kind=="bossCharge" else (40692 if kind=="bossJump" else 40950),["druid_trail",e["x"],e["y"],e["r"]*2/256.0,3,e["facing"],false],events,ledger)
				else: return _fail("unsupported_state")
			"approach":
				var speed: float=t["speed"]
				var boost: float=minf(2.5,1+c["distance"]/300.0)
				var flow: Variant=t["flow"]
				var a: float=_aim(e,p)
				t["mx"]=(flow["x"] if flow!=null else cos(a))*speed*boost
				t["my"]=(flow["y"] if flow!=null else sin(a))*speed*boost
				t["xy_line"]=38327
				t["fallback_line"]=38328
				t["step"]="fallback_xy"
			"orbit":
				if not _numbers(e,["_bossOrbitAng","_bossStrafeCd"]): return _fail("orbit_snapshot_missing")
				var dir: Variant=_or(e.get("_strafeDir"),1)
				if dir==null: return _fail("direction_shape_unsupported")
				_write(e,{"_bossOrbitAng":e["_bossOrbitAng"]+0.015*t["sp"]*dir},38332,events)
				if e["_bossStrafeCd"]>0: _write(e,{"_bossStrafeCd":e["_bossStrafeCd"]-t["sp"]},38333,events)
				else:
					var u: Variant=_draw(rng,"orbit_reverse",38334,events,ledger)
					if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
					if u<0.005: _write(e,{"_strafeDir":dir*-1,"_bossStrafeCd":60},38334,events)
				var radius: float=maxf(80,150-e["_bossPhase"]*18)
				var angle: float=atan2(p["y"]+sin(e["_bossOrbitAng"])*radius-e["y"],p["x"]+cos(e["_bossOrbitAng"])*radius-e["x"])
				t["mx"]=cos(angle)*t["speed"]*0.7
				t["my"]=sin(angle)*t["speed"]*0.7
				t["xy_line"]=38340
				t["fallback_line"]=38341
				t["step"]="fallback_xy"
			"retreat":
				var dir: Variant=_or(e.get("_strafeDir"),1)
				if dir==null: return _fail("direction_shape_unsupported")
				t["away"]=atan2(e["y"]-p["y"],e["x"]-p["x"])
				var angle: float=t["away"]+dir*0.4
				t["step"]="retreat_side"
				return _move(t,e["x"]+cos(angle)*t["speed"],e["y"]+sin(angle)*t["speed"],"xy",38348,"done",events,ledger)
			"retreat_side":
				var angle: float=t["away"]+PI/2*_or(e.get("_strafeDir"),1)
				t["mx"]=cos(angle)*t["speed"]
				t["my"]=sin(angle)*t["speed"]
				t["xy_line"]=38352
				t["fallback_line"]=38353
				t["retreat"]=true
				t["step"]="fallback_xy"
			"fallback_xy":
				t["step"]="fallback_x"
				return _move(t,e["x"]+t["mx"],e["y"]+t["my"],"xy",t["xy_line"],t.get("after_move","done"),events,ledger)
			"fallback_x":
				t["step"]="fallback_y"
				return _move(t,e["x"]+t["mx"],e["y"],"x",t["fallback_line"],t.get("fallback_success",t.get("after_move","done")),events,ledger)
			"fallback_y":
				t["step"]=t.get("after_move","done")
				return _move(t,e["x"],e["y"]+t["my"],"y",t["fallback_line"]+(1 if t.get("retreat",false) or t["checkpoint"]=="state" else 0),t.get("fallback_success",t["step"]),events,ledger)
			"charge_parts":
				t["step"]="done"
				return _cmd(t,"addParts",40667,[e["x"],e["y"],e["col"],8],events,ledger)
			"jump_label":
				t["step"]="jump_sfx"
				return _cmd(t,"addTxt",40690,[e["x"],e["y"]-30,t["label"],"#cc66ff",30],events,ledger)
			"jump_sfx":
				t["step"]="done"
				return _cmd(t,"SFX.slam",40690,[],events,ledger)
			"dash_wind_end":
				t["step"]="done"
				if e["st2"]<=0:
					_write(e,{"echDx":cos(e["facing"]),"echDy":sin(e["facing"])},40946,events)
					_write(e,{"s":"bossMultiDash","st2":12},40947,events)
					return _cmd(t,"SFX.charge",40947,[],events,ledger)
			"active_move":
				if kind=="bossJump":
					if not _numbers(e,["jumpOx","jumpOy","jumpX","jumpY"]): return _fail("jump_snapshot_missing")
					var prog: float=1-e["st2"]/40.0
					var ratio: float=prog*2*0.3 if prog<0.5 else 0.3+(prog-0.5)*2*0.7
					# Keep the source multiplication grouping in the first half.
					var x: float=e["jumpOx"]+(e["jumpX"]-e["jumpOx"])*ratio
					var y: float=e["jumpOy"]+(e["jumpY"]-e["jumpOy"])*ratio
					if prog<0.5:
						x=e["jumpOx"]+(e["jumpX"]-e["jumpOx"])*(prog*2)*0.3
						y=e["jumpOy"]+(e["jumpY"]-e["jumpOy"])*(prog*2)*0.3
					t["step"]="jump_land"
					return _move(t,x,y,"xy",40698,"jump_land",events,ledger)
				if not _numbers(e,["echDx","echDy"]): return _fail("dash_vector_missing")
				var speed: float=(35 if kind=="bossCharge" else 9)*t["sp"]
				t["mx"]=e["echDx"]*speed
				t["my"]=e["echDy"]*speed
				t["xy_line"]=40672 if kind=="bossCharge" else 40952
				t["fallback_line"]=t["xy_line"]+1
				t["after_move"]="charge_blocked" if kind=="bossCharge" else "dash_trail"
				t["fallback_success"]="charge_contact" if kind=="bossCharge" else "dash_trail"
				t["step"]="fallback_x"
				return _move(t,e["x"]+t["mx"],e["y"]+t["my"],"xy",t["xy_line"],"charge_contact" if kind=="bossCharge" else "dash_trail",events,ledger)
			"charge_blocked":
				if not _num(c.get("shake")): return _fail("shake_reader_missing")
				_write(e,{"shockR":0,"shockMax":800,"s":"bossShock","st2":20},40678,events)
				_global("shake",25*c["shake"]/100.0,40679,events)
				t["step"]="charge_impact"
				return _cmd(t,"SFX.groggy",40679,[],events,ledger)
			"charge_impact":
				t["step"]="done"
				return _cmd(t,"playVFXAng",40679,["boss_meteor_hit",e["x"],e["y"],150.0/768,2,0,false],events,ledger)
			"charge_contact":
				t["step"]="charge_rng"
				if _distance(e,p)<p["r"]+e["r"]+80 and p["iframes"]<=0:
					t["step"]="charge_recover"
					return _cmd(t,"resolve_boss_movement_contact",40681,[_contact("charge",e)],events,ledger,"contact")
			"charge_recover":
				_write(e,{"s":"recover","st2":40},40686,events)
				t["step"]="done"
			"charge_rng":
				t["step"]="charge_end"
				var u: Variant=_draw(rng,"charge_particle_gate",40687,events,ledger)
				if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
				if u>0.3:
					var units: Array=[]
					for tag: String in ["charge_particle_x","charge_particle_y","charge_particle_size"]:
						var v: Variant=_draw(rng,tag,40687,events,ledger)
						if not _unit(v): return _fail("rng_missing_or_invalid",ledger)
						units.append(v)
					return _cmd(t,"poolPart",40687,[e["x"]+(units[0]-0.5)*10,e["y"]+(units[1]-0.5)*10,-e["echDx"]*3,-e["echDy"]*3,e["col"],4+units[2]*3,10],events,ledger)
			"charge_end":
				if e["st2"]<=0: _write(e,{"s":"recover","st2":40},40688,events)
				t["step"]="done"
			"jump_land":
				t["step"]="done"
				if e["st2"]<=0:
					if not _num(c.get("shake")): return _fail("shake_reader_missing")
					_write(e,{"shockR":0,"shockMax":800+t["si"]*50},40700,events)
					_write(e,{"s":"bossShock","st2":25},40701,events)
					_global("shake",25*c["shake"]/100.0,40702,events)
					t["step"]="jump_flash"
					return _cmd(t,"SFX.groggy",40702,[],events,ledger)
			"jump_flash":
				_global("_flashT",5,40702,events)
				_global("_flashCol","#ffaa00",40702,events)
				t["step"]="jump_contact"
				return _cmd(t,"deathFX",40703,[e["x"],e["y"],e["r"],e["col"],false,false,e["etype"],"boss_meteor_hit"],events,ledger)
			"jump_contact":
				t["step"]="done"
				if _distance(e,p)<300 and p["iframes"]<=0 and p["s"]!="charge":
					return _cmd(t,"resolve_boss_movement_contact",40706,[_contact("jump",e)],events,ledger,"contact")
			"dash_trail":
				t["step"]="dash_contact"
				if t["si"]!=3: return _cmd(t,"poolPart",40956,[e["x"],e["y"],-e["echDx"]*2,-e["echDy"]*2,"#ff4488",e["r"]*0.8,8],events,ledger)
			"dash_contact":
				t["step"]="dash_end"
				if _distance(e,p)<p["r"]+e["r"]+10 and p["iframes"]<=0:
					return _cmd(t,"resolve_boss_movement_contact",40959,[_contact("dash",e)],events,ledger,"contact")
			"dash_end":
				t["step"]="done"
				if e["st2"]<=0:
					if not _numbers(e,["_dashIdx","_dashCnt"]) or not _num(c.get("shake")): return _fail("dash_counter_or_option_missing")
					_write(e,{"_dashIdx":e["_dashIdx"]+1},40967,events)
					if e["_dashIdx"]<e["_dashCnt"]:
						var u: Variant=_draw(rng,"dash_repeat_angle",40970,events,ledger)
						if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
						_write(e,{"facing":_aim(e,p)+(u-0.5)*0.4},40970,events)
						_write(e,{"echDx":cos(e["facing"]),"echDy":sin(e["facing"])},40971,events)
						u=_draw(rng,"dash_repeat_timer",40972,events,ledger)
						if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
						_write(e,{"st2":10+_i32(u*5)},40972,events)
						_global("shake",4*c["shake"]/100.0,40973,events)
					else:
						_write(e,{"s":"recover","st2":25},40975,events)
						_global("shake",8*c["shake"]/100.0,40975,events)
			"idle_sep":
				var sep: Variant=_or(e.get("_sepCd"),0)
				if sep==null: return _fail("separation_clock_shape_unsupported")
				if sep>0: _write(e,{"_sepCd":sep-t["sp"]},40497,events)
				t["step"]="idle_charge"
				if c["distance"]<e["r"]+p["r"]+8 and p["iframes"]<=0 and e["st2"]<=0:
					t["step"]="idle_parts"
					return _cmd(t,"resolve_boss_movement_contact",40501,[_contact("idle",e)],events,ledger,"contact")
			"idle_parts":
				t["step"]="idle_cooldown"
				return _cmd(t,"addParts",40501,[p["x"],p["y"],e["col"],4],events,ledger)
			"idle_cooldown":
				var u: Variant=_draw(rng,"idle_contact_cooldown",40502,events,ledger)
				if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
				_write(e,{"st2":40+_i32(u*20)},40502,events)
				t["step"]="idle_charge"
			"idle_charge":
				t["step"]="done"
				var charge: Variant=_or(e.get("_projChargeT"),0)
				if charge==null: return _fail("projectile_charge_shape_unsupported")
				if e["projCd"]<9000 and not charge>0:
					_write(e,{"projT":e["projT"]-t["sp"]},40509,events)
					if not _num(c.get("etype_range")): return _fail("range_reader_missing")
					if e["projT"]<=0 and c["distance"]<_or(c["etype_range"],700):
						_write(e,{"projT":e["projCd"]},40511,events)
						var bean: String="dark" if e["el"]==3 else ("water" if e["el"]==2 else ("fire" if e["el"]==1 else "normal"))
						_write(e,{"_projChargeBean":bean},40513,events)
						var color: Variant="#a44cff" if bean=="dark" else ("#317cec" if bean=="water" else ("#ff2e22" if bean=="fire" else c.get("element_color")))
						if color==null or not color is String: return _fail("element_color_reader_missing")
						_write(e,{"_projChargeCol":e["col"] if color=="" else color},40514,events)
						_write(e,{"_projChargeParryClass":"physical" if e["el"]==0 else "magic"},40515,events)
						_write(e,{"_projChargeT":60},40516,events)
			_: return _fail("unknown_movement_step")
	return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,
		"next_boundary":("AI_then_feint_then_actual_state_switch" if t.get("idle_stun_return",false) else "idle_projectiles_then_AI_then_feint_then_actual_state_switch") if t["checkpoint"]=="idle_move" else "end_current_switch_case","full_tick_complete":false}

static func _contact(family: String,e: Dictionary) -> Dictionary:
	return {"family":family,"source_lines":{"charge":[40681,40685],"jump":[40706,40707],"dash":[40959,40964],"idle":[40501,40501]}[family],
		"atk":e["atk"],"element":e["el"],"hurtP_multiplier":{"charge":2,"jump":1.8,"dash":1.3,"idle":0.8}[family],
		"elemental_provider":"none" if family=="idle" else "elMul(e.el,ar().el)","rounding":"ToInt32_after_atk_multiplier" if family=="idle" else "ToInt32_after_elemental",
		"knockback":{"charge":12,"jump":15,"dash":8,"idle":0}[family],
		"protected_parry_source": [40681,40684] if family=="charge" else ([40959,40960] if family=="dash" else []),
		"requires":["actual_hurtP_owner","actual_QE_and_boss_hurtE_owner_if_source_calls","complete_actor_player_readback"],"combat_verified":false}

static func _move(t: Dictionary,x: float,y: float,axes: String,line: int,success: String,events: Array,ledger: Array) -> Dictionary:
	t["move_fields"]={}
	if axes.contains("x"): t["move_fields"]["x"]=x
	if axes.contains("y"): t["move_fields"]["y"]=y
	t["move_line"]=line
	t["move_success"]=success
	return _cmd(t,"canMv",line,[x,y,t["enemy"]["r"]],events,ledger,"collision")
static func _cmd(t: Dictionary,name: String,line: int,args: Array,events: Array,ledger: Array,pending: String="ack") -> Dictionary:
	t["pending"]=pending
	var command: Dictionary={"command":name,"source_line":line,"args":args,"executed":false}
	events.append({"kind":"command","value":command})
	return {"status":"READY","done":false,"enemy":t["enemy"].duplicate(true),"player":t["player"].duplicate(true),"events":events,"rng_ledger":ledger,"command":command,"continuation":t,"full_tick_complete":false}
static func _write(e: Dictionary,fields: Dictionary,line: int,events: Array) -> void:
	for k in fields:
		e[k]=fields[k]
		events.append({"kind":"write","field":k,"value":fields[k],"source_line":line})
static func _global(key: String,value: Variant,line: int,events: Array) -> void: events.append({"kind":"global_write","field":key,"value":value,"source_line":line})
static func _draw(rng: Callable,tag: String,line: int,events: Array,ledger: Array) -> Variant:
	if not rng.is_valid(): return null
	var value: Variant=rng.call(tag)
	var row: Dictionary={"field":tag,"source_line":line,"unit":value}
	ledger.append(row)
	events.append({"kind":"rng","value":row})
	return value
static func _unit(v: Variant) -> bool: return _num(v) and v>=0 and v<1
static func _or(v: Variant,fallback: float) -> Variant: return fallback if v==null or v==0 else (v if _num(v) else null)
static func _num(v: Variant) -> bool: return (v is int or v is float) and is_finite(float(v))
static func _numbers(d: Dictionary,keys: Array) -> bool:
	for k in keys:
		if not _num(d.get(k)): return false
	return true
static func _contains_keys(after: Dictionary,before: Dictionary) -> bool:
	for key in before:
		if not after.has(key): return false
	return true
static func _actor(e: Dictionary) -> bool: return e.get("ib")==true and e.get("etype")==0 and e.get("s") is String and e.get("col") is String and _numbers(e,["x","y","r","st2","facing","atk","el"])
static func _player(p: Dictionary) -> bool: return p.get("s") is String and _numbers(p,["x","y","r","iframes"])
static func _aim(e: Dictionary,p: Dictionary) -> float: return atan2(p["y"]-e["y"],p["x"]-e["x"])
static func _distance(e: Dictionary,p: Dictionary) -> float: return sqrt((p["x"]-e["x"])*(p["x"]-e["x"])+(p["y"]-e["y"])*(p["y"]-e["y"]))
static func _i32(value: float) -> int:
	if not is_finite(value) or value==0: return 0
	var v: float=fmod(floor(value) if value>=0 else ceil(value),4294967296.0)
	if v<0: v+=4294967296.0
	if v>=2147483648.0: v-=4294967296.0
	return int(v)
static func _fail(reason: String,ledger: Array=[]) -> Dictionary:
	return {"status":"NOT_READY","reason":reason,"enemy":null,"player":null,"continuation":null,"command":null,"rng_ledger":ledger,"full_tick_complete":false}
