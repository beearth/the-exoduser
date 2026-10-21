extends RefCounted
## BC09 independent producer/birth packets. No actor, Main, live spawn, Q/E or
## damage owner is installed. Actual class/pool/global readers remain authority.
const Start = preload("res://scripts/native_ch1_boss_pattern_start.gd")
const COLORS = ["#bbbbbb","#ff5522","#3388ff","#9933cc","#ffee00","#ff88cc","#88aa44"]
const STATES = ["bossBurstWind","bossFanWind","bossBeanStormWind","bossBeanStorm"]
const MODES = ["state","idle","generic_tick","generic_fire","rhythm","orbs","start_request"]
const BAND_EXCLUSIONS = ["titanEye","web","mine","trap","bomb","swordWave","elemBall","_coralSpike","phantomSword","pierce","poisonZone","iceZone","blizzard","dimRift"]
const PHYSICAL_EXCLUSIONS = ["blackBean","gbBean","blueBean","waterBean","fireMagic","web","mine","trap","bomb","swordWave","elemBall","_coralSpike","phantomSword","pierce","poisonZone","iceZone","blizzard","dimRift"]

static func source_receipt() -> Dictionary:
	return {"source_main":"26c050a99a711e793a6c2413395acda09b0c1614","game_sha256":preload("res://source_snapshot/snapshot.gd").SHA256,
		"dependency":"BC08 1b901f124bc4d1f2eaf55cb615a216abce69c634","pool_ranges":[[16858,16884]],
		"ranges":[[16938,16995],[17043,17046],[20121,20155],[37080,37127],[38357,38371],[40562,40569],[40646,40662],[41185,41205]],
		"start_cases_owned_by_BC06":[[37769,37791],[38212,38230]],"live_spawn_connected":false,"class_or_QE_execution_verified":false,"full_tick_complete":false}

## si0..3 ordinary CH1 only. globals is the actual source slice, not a new clock.
## Producer spawn requests require actual global drop-counter readback in source
## order. A fixture receipt is protocol evidence, never a real accepted projectile.
static func begin_pattern(si: int,mode: String,enemy: Dictionary,player: Dictionary,sp: float,context: Dictionary={},globals: Dictionary={}) -> Dictionary:
	if si<0 or si>3 or mode not in MODES: return _fail("unsupported_stage_or_mode")
	if not _numbers(player,["x","y","r","iframes"]) or not player.get("s") is String or not _num(sp): return _fail("player_or_clock_missing")
	if not enemy.is_empty() and not _actor(enemy): return _fail("ordinary_boss_snapshot_missing")
	if mode not in ["rhythm","orbs"] and enemy.is_empty(): return _fail("boss_snapshot_missing")
	if mode=="state" and enemy.get("s") not in STATES: return _fail("unsupported_projectile_state")
	return {"status":"READY","continuation":{"version":1,"mode":mode,"si":si,"enemy":enemy.duplicate(true),"player":player.duplicate(true),"sp":sp,
		"context":context.duplicate(true),"globals":globals.duplicate(true),"step":"entry","pending":"","i":0,"drop_counter":context.get("drop_counter"),"birth_receipts":[]},"full_tick_complete":false}

static func next_pattern(token: Dictionary,response: Variant=null,rng: Callable=Callable()) -> Dictionary:
	if token.get("version")!=1 or not token.get("enemy") is Dictionary or not token.get("player") is Dictionary or not token.get("context") is Dictionary \
		or not token.get("globals") is Dictionary or token.get("mode") not in MODES or not token.get("step") is String or not token.get("pending") is String \
		or not token.get("si") is int or token["si"]<0 or token["si"]>3 or not _num(token.get("sp")): return _fail("continuation_unsupported")
	var t: Dictionary=token.duplicate(true)
	var e: Dictionary=t["enemy"]
	var p: Dictionary=t["player"]
	var g: Dictionary=t["globals"]
	var c: Dictionary=t["context"]
	var events: Array=[]
	var ledger: Array=[]
	if t["pending"]!="":
		if not response is Dictionary or response.get("ack")!=true: return _fail("actual_owner_ack_missing")
		match t["pending"]:
			"spawn":
				if not response.has("projectile_result") or (response["projectile_result"]!=null and (not response["projectile_result"] is Dictionary or not _birth_snapshot(response["projectile_result"]))) \
					or not _counter(response.get("drop_before")) or not _counter(response.get("drop_after")) or response["drop_before"]!=t["drop_counter"]: return _fail("actual_spawn_or_drop_readback_missing")
				t["drop_counter"]=response["drop_after"]
				t["birth_receipts"].append(response.duplicate(true))
			"translate":
				if not response.get("value") is String: return _fail("translation_reader_missing")
				t["label"]=response["value"]
			"orb_contact":
				if not response.get("orb_after") is Dictionary or not _orb(response["orb_after"]) or not _keys(response["orb_after"],t["orb"]) \
					or not response.get("player_after") is Dictionary or not _keys(response["player_after"],p) \
					or not _numbers(response["player_after"],["x","y","r","iframes"]) or not response["player_after"].get("s") is String: return _fail("protected_orb_readback_missing")
				if not e.is_empty():
					if not response.get("enemy_after") is Dictionary or not _actor(response["enemy_after"]) or not _keys(response["enemy_after"],e): return _fail("protected_boss_AOE_readback_missing")
					t["enemy"]=response["enemy_after"].duplicate(true)
					e=t["enemy"]
				t["orb"]=response["orb_after"].duplicate(true)
				t["player"]=response["player_after"].duplicate(true)
				p=t["player"]
				t["orb_deleted"]=true
			"ack": pass
			_: return _fail("pending_unsupported")
		t["pending"]=""
	while t["step"]!="done":
		match t["step"]:
			"entry":
				if t["mode"]=="state":
					if e["s"]=="bossBeanStormWind":
						_write(e,{"facing":_aim(e,p)},41186,events)
						t["step"]="bean_wind_end"
						var u: Variant=_draw(rng,"bean_wind_gate",41187,events,ledger)
						if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
						if u>0.5:
							var ux: Variant=_draw(rng,"bean_wind_vx",41187,events,ledger)
							var uy: Variant=_draw(rng,"bean_wind_vy",41187,events,ledger) if _unit(ux) else null
							if not _unit(ux) or not _unit(uy): return _fail("rng_missing_or_invalid",ledger)
							return _cmd(t,"poolPart",41187,[e["x"],e["y"],(ux-0.5)*4,(uy-0.5)*4,"#cc1100",3,6],events,ledger)
					elif e["s"]=="bossFanWind":
						if not c.get("thorn_first") is bool: return _fail("thorn_reader_missing")
						if c["thorn_first"] and t["si"] in [0,3] and e["_bossPhase"]<=1: _write(e,{"facing":_aim(e,p)},40647,events)
						if e["st2"]>0: t["step"]="done"
						else:
							t["family"]="fan"
							t["normal_druid"]=t["si"] in [0,3]
							t["thorn"]=c["thorn_first"] and t["normal_druid"] and e["_bossPhase"]<=1
							t["count"]=12 if t["thorn"] else _i32(maxf(12 if t["normal_druid"] else 10,4+minf(t["si"],5))*(1+(e["_bossPhase"]-1)*0.12))
							t["aim"]=_aim(e,p) if t["thorn"] else e["facing"]
							t["spread"]=PI*(0.7+e["_bossPhase"]*0.06)
							t["step"]="volley"
					elif e["st2"]>0: t["step"]="done"
					elif e["s"]=="bossBurstWind":
						t["family"]="burst"
						t["count"]=_i32(maxf(10,6+minf(t["si"],6))*(1+(e["_bossPhase"]-1)*0.12))
						t["step"]="volley"
					else:
						t["family"]="bean"
						t["count"]=5+minf(_i32(t["si"]*0.3),4)+e["_bossPhase"]
						t["aim"]=_aim(e,p)
						t["spread"]=PI*(0.5+e["_bossPhase"]*0.1)
						t["step"]="volley"
				elif t["mode"]=="idle":
					if not _num(c.get("distance")): return _fail("cached_distance_missing")
					var timer: Variant=_or(e.get("_idleRBT"),0)
					if timer==null: return _fail("idle_clock_unsupported")
					_write(e,{"_idleRBT":timer+t["sp"]},38359,events)
					t["step"]="done"
					if e["_idleRBT"]>=maxf(18,40-e["_bossPhase"]*5) and c["distance"]<1200:
						_write(e,{"_idleRBT":0},38362,events)
						t["family"]="idle"
						t["count"]=1+_i32(e["_bossPhase"]*0.5)
						t["aim"]=_aim(e,p)
						t["step"]="volley"
				elif t["mode"] in ["generic_tick","generic_fire"]:
					t["step"]="generic_fire"
					if t["mode"]=="generic_tick":
						var timer: Variant=_or(e.get("_projChargeT"),0)
						if timer==null: return _fail("charge_clock_unsupported")
						if timer>0:
							_write(e,{"_projChargeT":timer-t["sp"]},20154,events)
							if e["_projChargeT"]>0: t["step"]="done"
						else: t["step"]="done"
				elif t["mode"]=="start_request":
					var request: Variant=c.get("start_command")
					if not request is Dictionary or request.get("command")!="_spawnBossProjectile" or request.get("executed")!=false \
						or request.get("source_line") not in [37779,38221] or not request.get("args") is Array or request["args"].size()!=1 or not request["args"][0] is Dictionary: return _fail("BC06_elem_rapid_request_required")
					t["step"]="done"
					return _spawn(t,request["args"][0],int(request["source_line"]),false,events,ledger)
				elif t["mode"]=="rhythm":
					if not g.get("bossAlive") is bool: return _fail("boss_alive_reader_missing")
					t["step"]="done"
					if t["si"] in [0,3] and g["bossAlive"] and not e.is_empty() and e.get("alive")==true:
						var old: Variant=_or(g.get("_druidParryT"),0)
						if old==null or not _num(g.get("frame")): return _fail("rhythm_clock_reader_missing")
						t["interval"]=90-int(e["_bossPhase"])*6
						_gwrite(g,{"_druidParryT":old+t["sp"]},37085,events)
						t["step"]="rhythm_gate"
						if g["_druidParryT"]>=t["interval"]-20 and g["_druidParryT"]<t["interval"] and fmod(g["frame"],4)==0:
							var ux: Variant=_draw(rng,"rhythm_warning_vx",37087,events,ledger)
							var uy: Variant=_draw(rng,"rhythm_warning_vy",37087,events,ledger) if _unit(ux) else null
							if not _unit(ux) or not _unit(uy): return _fail("rng_missing_or_invalid",ledger)
							return _cmd(t,"poolPart",37087,[e["x"],e["y"]-36,(ux-0.5)*2,(uy-0.5)*2,"#66dd22",3,10],events,ledger)
				else:
					if not g.get("bossAlive") is bool: return _fail("boss_alive_reader_missing")
					t["step"]="done"
					if t["si"] in [0,3] and g["bossAlive"]:
						if g.get("_druidOrbs")==null: _gwrite(g,{"_druidOrbs":[]},37108,events)
						if not g["_druidOrbs"] is Array: return _fail("orb_queue_unsupported")
						for orb: Variant in g["_druidOrbs"]:
							if not orb is Dictionary or not _orb(orb): return _fail("orb_snapshot_missing")
						var old: Variant=_or(g.get("_druidOrbT"),0)
						if old==null: return _fail("orb_clock_unsupported")
						_gwrite(g,{"_druidOrbT":old+t["sp"]},37109,events)
						t["step"]="orb_spawn"
						if not e.is_empty() and e.get("alive")==true and g["_druidOrbT"]>=90 and g["_druidOrbT"]<110:
							t["step"]="orb_warning"
							t["i"]=0
			"bean_wind_end":
				t["step"]="done"
				if e["st2"]<=0: _write(e,{"s":"bossBeanStorm","st2":8,"_bsWave":0},41188,events)
			"rhythm_gate":
				t["step"]="done"
				if g["_druidParryT"]>=t["interval"]:
					_gwrite(g,{"_druidParryT":g["_druidParryT"]-t["interval"]},37090,events)
					t["family"]="rhythm"
					t["count"]=5+int(e["_bossPhase"])
					t["aim"]=_aim(e,p)
					t["spread"]=PI*(0.42+e["_bossPhase"]*0.03)
					t["step"]="volley"
			"volley":
				if t["i"]>=t["count"]:
					t["step"]="finish_volley"
					continue
				var i: int=t["i"]
				t["i"]+=1
				var family: String=t["family"]
				var angle: float=PI*2*i/t["count"] if family=="burst" else (t["aim"] if family=="idle" else t["aim"]-t["spread"]/2.0+t["spread"]*i/(t["count"]-1))
				var raw: Dictionary={"x":e["x"],"y":e["y"],"friendly":false}
				var line: int=40567
				if family=="fan" and t["normal_druid"]:
					var physical: bool=i%3!=2 if t["thorn"] else (float(i)/(t["count"]-1)<0.28 or float(i)/(t["count"]-1)>0.72)
					var black: bool=e["_bossPhase"]>=2 and i%4==1
					raw.merge({"vx":cos(angle)*4.4,"vy":sin(angle)*4.4,"dmg":_i32(e["atk"]*(1.5 if black else 1.3)),"el":0 if physical and not black else e["el"],"life":400,"ml":400,"col":"#00aa00" if black else ("#8a5a2a" if physical else e["col"]),"sz":2 if black else 1.2,"blackBean":black,"parryClass":"physical" if physical and not black else "magic","homing":false,"_druidStraight":true,"_druidThornVolley":t["thorn"],"_druidThornLane":i if t["thorn"] else -1})
					line=40656
				elif family=="rhythm":
					raw.merge({"x":e["x"]+cos(angle)*e["r"],"y":e["y"]-36+sin(angle)*e["r"],"vx":cos(angle)*6,"vy":sin(angle)*6,"dmg":_i32(_or(e["atk"],100)*0.35),"el":1,"life":240,"ml":240,"col":"#66dd22","sz":2,"r":10,"fireMagic":true,"_typed":true,"_druidParryVolley":true},true)
					line=37095
				else:
					var speed: float=4.4
					var black: bool=false
					var mult: float=1.5
					var life: int=400
					if family in ["idle","bean"]:
						line=38366 if family=="idle" else 41196
						var ua: Variant=_draw(rng,family+"_angle",38366 if family=="idle" else 41196,events,ledger)
						var us: Variant=_draw(rng,family+"_speed",38367 if family=="idle" else 41197,events,ledger) if _unit(ua) else null
						if not _unit(ua) or not _unit(us): return _fail("rng_missing_or_invalid",ledger)
						angle=t["aim"]+(ua-0.5)*0.5 if family=="idle" else angle+(ua-0.5)*0.15
						speed=2.5+us*1.5
					var u: Variant=_draw(rng,family+"_kind",40566 if family=="burst" else (40659 if family=="fan" else (38368 if family=="idle" else 41198)),events,ledger)
					if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
					black=u<0.5
					if black: speed=4.4
					elif family=="burst": speed=4.0
					elif family=="fan": speed=4.4
					mult=1.5 if black or family=="idle" else (2.5 if family=="burst" else (2.8 if family=="fan" else 2.0))
					if family=="idle": life=400 if black else 280
					elif family=="bean": life=400 if black else 350
					raw.merge({"vx":cos(angle)*speed,"vy":sin(angle)*speed,"dmg":_i32(e["atk"]*mult),"el":0 if black else e["el"],"life":life,"ml":life,"col":"#00aa00" if black else "#cc1100","sz":2.0 if black else (1.5 if family=="idle" else 1.8)})
					if black: raw["blackBean"]=true
					else: raw.merge({"redBean":true,"homing":true})
					line=40567 if family=="burst" else (40660 if family=="fan" else (38368 if family=="idle" else 41199))
				return _spawn(t,raw,line,false,events,ledger)
			"finish_volley":
				match t["family"]:
					"burst":
						t["step"]="burst_fx"
						return _cmd(t,"SFX.charge",40568,[],events,ledger)
					"fan":
						t["step"]="fan_parts"
						return _cmd(t,"SFX.magic",40661,[_sound_el(e["el"])],events,ledger)
					"bean":
						t["step"]="bean_sound"
						return _cmd(t,"addParts",41201,[e["x"],e["y"],"#cc1100",8],events,ledger)
					"idle":
						t["step"]="done"
						return _cmd(t,"addParts",38370,[e["x"],e["y"],"#cc1100",2],events,ledger)
					"rhythm":
						t["step"]="rhythm_sound"
						return _cmd(t,"addTxt",37100,[e["x"],e["y"]-60,"Q!","#66dd22",32],events,ledger)
			"burst_fx":
				t["step"]="burst_end"
				return _cmd(t,"deathFX",40568,[e["x"],e["y"],e["r"],e["col"],false,false,e["etype"]],events,ledger)
			"burst_end":
				if not _num(c.get("shake")): return _fail("shake_reader_missing")
				_gwrite(g,{"shake":8*c["shake"]/100.0,"_flashT":4,"_flashCol":"#ffffff"},40568,events)
				_write(e,{"s":"recover","st2":50},40569,events)
				t["step"]="done"
			"fan_parts":
				t["step"]="fan_end"
				return _cmd(t,"addParts",40661,[e["x"],e["y"],e["col"],12],events,ledger)
			"fan_end":
				_write(e,{"s":"recover","st2":45},40662,events)
				t["step"]="done"
			"bean_sound":
				t["step"]="bean_end"
				return _cmd(t,"SFX.magic",41201,[0],events,ledger)
			"bean_end":
				if not _numbers(e,["_bsWave","_bsMaxWave"]) or not _num(c.get("shake")): return _fail("bean_counter_or_option_missing")
				_gwrite(g,{"shake":4*c["shake"]/100.0},41201,events)
				_write(e,{"_bsWave":e["_bsWave"]+1},41202,events)
				if e["_bsWave"]>=e["_bsMaxWave"]: _write(e,{"s":"recover","st2":25},41203,events)
				else:
					var u: Variant=_draw(rng,"bean_repeat_timer",41204,events,ledger)
					if not _unit(u): return _fail("rng_missing_or_invalid",ledger)
					_write(e,{"st2":10+_i32(u*6)},41204,events)
				t["step"]="done"
			"rhythm_sound":
				t["step"]="rhythm_end"
				return _cmd(t,"SFX.magic",37101,[1],events,ledger)
			"rhythm_end":
				var old: Variant=_or(g.get("_druidParryVolley"),0)
				if old==null: return _fail("rhythm_volley_unsupported")
				_gwrite(g,{"_druidParryVolley":old+1},37102,events)
				t["step"]="done"
			"generic_fire":
				if not _num(c.get("etype_range")) or not e.get("_projChargeBean") is String: return _fail("generic_reader_missing")
				_write(e,{"facing":_aim(e,p)},20124,events)
				var bean: String=e["_projChargeBean"]
				var life: int=_i32(_or(c["etype_range"],600)*0.3)
				var speed: float=4.4 if bean=="black" else (2.8 if bean=="red" else (3.3 if bean=="dark" else (3.2 if bean in ["fire","water"] else 3.0)))
				var mult: float=1.5 if bean=="black" else (2.5 if bean=="red" else (1.0 if bean in ["dark","special"] else (1.2 if bean in ["fire","water"] else 0.8)))
				var el: float=0 if bean=="black" else (1 if bean in ["red","fire"] else (3 if bean=="dark" else (2 if bean=="water" else e["el"])))
				var color: String={"black":"#00aa00","red":"#cc1100","dark":"#a44cff","fire":"#ff2e22","water":"#317cec"}.get(bean,COLORS[int(e["el"])])
				var sz: float=2.0 if bean=="black" else (1.5 if bean=="red" else (1.6 if bean in ["dark","fire","water"] else (2.5 if bean=="special" else 1.5)))
				life=400 if bean=="black" else (maxi(200,life) if bean=="red" else life)
				var raw: Dictionary={"x":e["x"],"y":e["y"],"vx":cos(e["facing"])*speed,"vy":sin(e["facing"])*speed,"dmg":_i32(e["atk"]*mult),"el":el,"friendly":false,"life":life,"ml":life,"col":color,"sz":sz,"_commit":true}
				if bean=="black": raw["blackBean"]=true
				elif bean=="red": raw.merge({"redBean":true,"homing":true})
				elif bean=="dark": raw["gbBean"]=true
				elif bean=="fire": raw["fireMagic"]=true
				elif bean=="water": raw["waterBean"]=true
				t["bean"]=bean
				t["step"]="generic_parts"
				return _spawn(t,raw,{"black":20129,"red":20132,"dark":20135,"fire":20138,"water":20141,"special":20144}.get(bean,20147),true,events,ledger)
			"generic_parts":
				var bean: String=t["bean"]
				var color: String={"black":"#00aa00","red":"#cc1100","dark":"#a44cff","fire":"#ff2e22","water":"#317cec"}.get(bean,e["col"])
				t["step"]="generic_cancel"
				return _cmd(t,"addParts",{"black":20130,"red":20133,"dark":20136,"fire":20139,"water":20142,"special":20145}.get(bean,20148),[e["x"],e["y"],color,2 if bean not in ["black","red","dark","fire","water","special"] else 3],events,ledger)
			"generic_cancel":
				_write(e,{"_projChargeT":0,"_projChargeCol":null,"_projChargeBean":null,"_projChargeParryClass":null},20121,events)
				t["step"]="done"
			"orb_warning":
				if t["i"]>=2:
					t["step"]="orb_spawn"
					continue
				var radius: float=60*(1-(g["_druidOrbT"]-90)/20.0)
				var angle: float=g["_druidOrbT"]*0.5+t["i"]*3.14159
				t["i"]+=1
				return _cmd(t,"poolPart",37110,[e["x"]+cos(angle)*radius,e["y"]-40+sin(angle)*radius,-cos(angle)*1.5,-sin(angle)*1.5,"#66dd22",2,10],events,ledger)
			"orb_spawn":
				if not e.is_empty() and e.get("alive")==true and g["_druidOrbT"]>=110:
					_gwrite(g,{"_druidOrbT":0},37111,events)
					var a: float=_aim(e,p)
					for k in range(-1,2):
						var angle: float=a+k*0.14
						g["_druidOrbs"].append({"x":e["x"],"y":e["y"]-40,"vx":cos(angle)*6.8,"vy":sin(angle)*6.8,"t":0,"r":26,"dmg":_i32(_or(e["atk"],100)*0.6)})
				t["i"]=0
				t["kept"]=[]
				t["step"]="orb_loop"
			"orb_loop":
				if t["i"]>=g["_druidOrbs"].size():
					_gwrite(g,{"_druidOrbs":t["kept"]},37126,events)
					t["step"]="done"
					continue
				var orb: Dictionary=g["_druidOrbs"][t["i"]].duplicate(true)
				orb["t"]+=t["sp"]
				orb["x"]+=orb["vx"]*t["sp"]
				orb["y"]+=orb["vy"]*t["sp"]
				t["orb"]=orb
				t["orb_deleted"]=false
				t["step"]="orb_cleanup"
				if _distance(orb,p)<orb["r"]+p["r"]:
					return _cmd(t,"resolve_druid_orb_contact",37116,[{"source_lines":[37116,37123],"orb":orb.duplicate(true),"aoe_radius":90,"aoe_damage":maxi(40,_i32(_or(orb["dmg"],60)*1.2)),"source_isPWin_called":true,"combat_verified":false}],events,ledger,"orb_contact")
			"orb_cleanup":
				var orb: Dictionary=t["orb"]
				if not _numbers(g,["mw","mh"]): return _fail("orb_bounds_reader_missing")
				if orb["t"]>460 or orb["x"]< -40 or orb["y"]< -40 or orb["x"]>g["mw"]*40+40 or orb["y"]>g["mh"]*40+40: t["orb_deleted"]=true
				if not t["orb_deleted"]: t["kept"].append(orb)
				t["i"]+=1
				t["step"]="orb_loop"
			_: return _fail("unknown_producer_checkpoint")
	return {"status":"READY","done":true,"enemy":e,"player":p,"globals":g,"events":events,"rng_ledger":ledger,"continuation":null,"command":null,"birth_receipts":t["birth_receipts"],"drop_counter":t["drop_counter"],"live_spawn_verified":false,"full_tick_complete":false}

## Copy the SOURCE wrapper only. Never classify or reinterpret Q/E here.
static func prepare_boss_props(si: int,enemy: Dictionary,props: Dictionary,thorn_first: Variant) -> Dictionary:
	if si<0 or si>3 or enemy.get("ib")!=true or not thorn_first is bool: return _fail("boss_wrapper_reader_missing")
	var p: Dictionary=props.duplicate(true)
	p["_druidPoison"]=si in [0,3]
	p["_druidStraight"]=_truth(p.get("_druidStraight")) and si in [0,3]
	p["_druidThornVolley"]=_truth(p.get("_druidThornVolley")) and thorn_first and si in [0,3]
	return {"status":"READY","props":p}

static func _spawn(t: Dictionary,raw: Dictionary,line: int,direct: bool,events: Array,ledger: Array) -> Dictionary:
	if not _counter(t["drop_counter"]): return _fail("global_drop_reader_missing",ledger)
	var props: Dictionary=raw.duplicate(true)
	if not direct:
		var wrapped: Dictionary=prepare_boss_props(t["si"],t["enemy"],props,t["context"].get("thorn_first"))
		if wrapped["status"]!="READY": return _fail(wrapped["reason"],ledger)
		props=wrapped["props"]
	return _cmd(t,"spawnProj_owner",line,[props,{"route":"direct" if direct else "boss_wrapper","canonical_source_lines":[16947,16995],"executed":false}],events,ledger,"spawn")

## Birth NUMERIC packet only. Caller supplies a real fresh/reset source pool
## snapshot, global counter and resolved external readers. Class is requested
## from its unchanged authority; no local Q/E classifier or live scene birth.
static func begin_birth(props: Dictionary,context: Dictionary) -> Dictionary:
	if not context.get("lesson_active") is bool or not _counter(context.get("drop_counter")): return _fail("birth_global_reader_missing")
	if context["lesson_active"] and not _truth(props.get("_lessonShot")): return {"status":"READY","done":true,"projectile":null,"drop_counter":context["drop_counter"],"pool_action":"none","rng_ledger":[],"live_spawn_verified":false}
	var pool: Variant=context.get("pool_snapshot")
	if not pool is Dictionary or not _numbers(pool,["x","y","vx","vy","dmg","el","sz","r","life","ml"]) or not pool.get("friendly") is bool: return _fail("actual_pool_snapshot_missing")
	var p: Dictionary=pool.duplicate(true)
	p["_lessonShot"]=false
	p["_druidPoison"]=false
	p["_druidParryClass"]=null
	p.merge(props,true)
	if not _numbers(p,["x","y","vx","vy","dmg","el","sz","r","life","ml"]) or not p.get("friendly") is bool: return _fail("birth_props_unsupported")
	# Same non-QE dark-sphere scalar preparation, game.html:16934–16937.
	if _truth(p.get("gbBean")) and not p["friendly"]:
		p["el"]=3
		p["col"]="#a44cff"
		p["parryClass"]=""
	return {"status":"READY","done":false,"continuation":{"version":1,"projectile":p,"context":context.duplicate(true),"drop_counter":context["drop_counter"],"step":"class_before_poison","pending_class":false}}

static func next_birth(token: Dictionary,class_response: Variant=null,rng: Callable=Callable()) -> Dictionary:
	if token.get("version")!=1 or not token.get("projectile") is Dictionary or not token.get("context") is Dictionary or not token.get("step") is String: return _fail("birth_continuation_unsupported")
	var t: Dictionary=token.duplicate(true)
	var p: Dictionary=t["projectile"]
	var c: Dictionary=t["context"]
	var ledger: Array=[]
	if t.get("pending_class",false):
		if not class_response is Dictionary or class_response.get("ack")!=true or class_response.get("value") not in ["physical","magic","forbidden"]: return _fail("actual_class_authority_readback_missing")
		t["class"]=class_response["value"]
		t["pending_class"]=false
	while true:
		match t["step"]:
			"class_before_poison":
				t["step"]="poison_then_class"
				if _truth(p.get("_druidPoison")) and not p["friendly"]: return _class_request(t)
			"poison_then_class":
				if _truth(p.get("_druidPoison")) and not p["friendly"]:
					p["parryClass"]=t["class"]
					p["el"]=0
					p["col"]="#66dd22"
				p["rainbow"]=_truth(p.get("blackBean"))
				t["step"]="scale"
				return _class_request(t)
			"scale":
				p["parryClass"]=t["class"]
				if not _truth(p.get("ml")) and _truth(p.get("life")): p["ml"]=p["life"]
				if not p["friendly"]:
					var moving: bool=p["vx"]*p["vx"]+p["vy"]*p["vy"]>0
					var band: bool=moving and not _any(p,BAND_EXCLUSIONS)
					if band and t["class"]=="magic":
						if not c.get("qa_storage_active") is bool: return _fail("QA_storage_reader_missing")
						if not(c["qa_storage_active"] and _truth(p.get("_druidStraight"))): p["homing"]=true
					if moving and _truth(p.get("titanEye")):
						p["homing"]=true
						p["redBean"]=true
						if not _normalize(p,t["class"],rng,ledger): return _fail("speed_rng_missing_or_invalid",ledger)
					elif moving and p["el"]==0 and t["class"]=="physical" and not _any(p,PHYSICAL_EXCLUSIONS):
						p["homing"]=not _truth(p.get("_druidStraight"))
						if not _truth(p.get("redBean")):
							p["vx"]*=1.3
							p["vy"]*=1.3
							p["redBean"]=true
					if moving and not _truth(p.get("titanEye")):
						if not _truth(p.get("_commit")) and not _truth(p.get("_druidParryVolley")) and not _truth(p.get("_druidThornVolley")):
							t["drop_counter"]=(int(t["drop_counter"])+1)%3
							if t["drop_counter"]!=0: return _birth_done(t,null,"recycle_requested",ledger)
						p["sz"]*=2
						p["r"]*=1.3
						p["vx"]*=1.8
						p["vy"]*=1.8
						p["dmg"]=_i32(p["dmg"]*2.0)
						if _truth(p.get("redBean")):
							p["dmg"]=_i32(p["dmg"]*0.5)
							p["vx"]*=0.7
							p["vy"]*=0.7
					if band:
						if not _normalize(p,t["class"],rng,ledger): return _fail("speed_rng_missing_or_invalid",ledger)
					# Resolved left-hand source reader is mandatory even for blackBean:
					# the original evaluates the aggro disjunction before !blackBean.
					if not c.get("aggro_active") is bool: return _fail("actual_aggro_reader_missing",ledger)
					if c["aggro_active"] and not _truth(p.get("blackBean")) and not _truth(p.get("_druidThornVolley")):
						if not c.get("aggro_target") is Dictionary or not _numbers(c["aggro_target"],["x","y"]): return _fail("actual_aggro_target_missing",ledger)
						var speed: float=sqrt(p["vx"]*p["vx"]+p["vy"]*p["vy"])
						if speed>0:
							var a: float=atan2(c["aggro_target"]["y"]-p["y"],c["aggro_target"]["x"]-p["x"])
							p["vx"]=cos(a)*speed
							p["vy"]=sin(a)*speed
				return _birth_done(t,p,"append_requested",ledger)
			_: return _fail("unknown_birth_checkpoint")
	return _fail("unknown_birth_checkpoint")

static func _class_request(t: Dictionary) -> Dictionary:
	t["pending_class"]=true
	return {"status":"READY","done":false,"continuation":t,"command":{"command":"projectile_class_authority","source_lines":[16911,16921],"args":[t["projectile"].duplicate(true)],"executed":false},"rng_ledger":[],"live_spawn_verified":false}
static func _birth_done(t: Dictionary,p: Variant,action: String,ledger: Array) -> Dictionary:
	return {"status":"READY","done":true,"projectile":p,"drop_counter":t["drop_counter"],"pool_action":action,"rng_ledger":ledger,"continuation":null,"command":null,"live_spawn_verified":false}
static func _normalize(p: Dictionary,kind: String,rng: Callable,ledger: Array) -> bool:
	var speed: float=sqrt(p["vx"]*p["vx"]+p["vy"]*p["vy"])
	if speed<=0: return true
	if not rng.is_valid(): return false
	var line: int=16909 if _truth(p.get("blackBean")) else (16907 if kind=="physical" else 16908)
	var u: Variant=rng.call("source_bullet_speed")
	ledger.append({"field":"source_bullet_speed","source_line":line,"unit":u})
	if not _unit(u): return false
	var next: float=5.0+0*u if kind=="physical" and not _truth(p.get("blackBean")) else 500.0/60+(600.0/60-500.0/60)*u
	p["vx"]=p["vx"]/speed*next
	p["vy"]=p["vy"]/speed*next
	return true

static func _cmd(t: Dictionary,name: String,line: int,args: Array,events: Array,ledger: Array,pending: String="ack") -> Dictionary:
	t["pending"]=pending
	var command: Dictionary={"command":name,"source_line":line,"args":args,"executed":false}
	events.append({"kind":"command","value":command})
	return {"status":"READY","done":false,"enemy":t["enemy"].duplicate(true),"player":t["player"].duplicate(true),"globals":t["globals"].duplicate(true),"events":events,"rng_ledger":ledger,"command":command,"continuation":t,"full_tick_complete":false}
static func _write(e: Dictionary,fields: Dictionary,line: int,events: Array) -> void:
	for k in fields:
		e[k]=fields[k]
		events.append({"kind":"write","field":k,"value":fields[k],"source_line":line})
static func _gwrite(g: Dictionary,fields: Dictionary,line: int,events: Array) -> void:
	for k in fields:
		g[k]=fields[k]
		events.append({"kind":"global_write","field":k,"value":fields[k].duplicate(true) if fields[k] is Array or fields[k] is Dictionary else fields[k],"source_line":line})
static func _draw(rng: Callable,tag: String,line: int,events: Array,ledger: Array) -> Variant:
	if not rng.is_valid(): return null
	var u: Variant=rng.call(tag)
	var r: Dictionary={"field":tag,"source_line":line,"unit":u}
	ledger.append(r)
	events.append({"kind":"rng","value":r})
	return u
static func _actor(e: Dictionary) -> bool: return e.get("ib")==true and e.get("etype")==0 and e.get("s") is String and e.get("col") is String and _numbers(e,["x","y","r","atk","el","facing","st2","_bossPhase"]) and e["el"]>=0 and e["el"]<=6 and e["el"]==floor(float(e["el"])) and e["_bossPhase"]>=0 and e["_bossPhase"]<=4 and e["_bossPhase"]==floor(float(e["_bossPhase"]))
static func _orb(o: Dictionary) -> bool: return _numbers(o,["x","y","vx","vy","t","r","dmg"])
static func _birth_snapshot(p: Dictionary) -> bool:
	return _numbers(p,["x","y","vx","vy","dmg","el","sz","r","life","ml"]) and p.get("friendly") is bool and p.get("col") is String and p.get("parryClass") in ["physical","magic","forbidden"]
static func _counter(v: Variant) -> bool: return _num(v) and v>=0 and v<=2 and v==floor(float(v))
static func _numbers(d: Dictionary,keys: Array) -> bool:
	for k in keys:
		if not _num(d.get(k)): return false
	return true
static func _keys(after: Dictionary,before: Dictionary) -> bool:
	for k in before:
		if not after.has(k): return false
	return true
static func _num(v: Variant) -> bool: return (v is int or v is float) and is_finite(float(v))
static func _unit(v: Variant) -> bool: return _num(v) and v>=0 and v<1
static func _or(v: Variant,fallback: float) -> Variant: return fallback if v==null or v==0 else (v if _num(v) else null)
static func _truth(v: Variant) -> bool:
	if v==null: return false
	if v is bool: return v
	if v is int or v is float: return v!=0 and not is_nan(float(v))
	if v is String: return v!=""
	return true
static func _any(p: Dictionary,keys: Array) -> bool:
	for k in keys:
		if _truth(p.get(k)): return true
	return false
static func _sound_el(el: float) -> int: return int(el) if el in [1,2,4] else 0
static func _aim(e: Dictionary,p: Dictionary) -> float: return atan2(p["y"]-e["y"],p["x"]-e["x"])
static func _distance(e: Dictionary,p: Dictionary) -> float: return sqrt((p["x"]-e["x"])*(p["x"]-e["x"])+(p["y"]-e["y"])*(p["y"]-e["y"]))
static func _i32(v: float) -> int:
	if not is_finite(v) or v==0: return 0
	var n: float=fmod(floor(v) if v>=0 else ceil(v),4294967296.0)
	if n<0: n+=4294967296.0
	if n>=2147483648.0: n-=2147483648.0
	return int(n)
static func _fail(reason: String,ledger: Array=[]) -> Dictionary: return {"status":"NOT_READY","reason":reason,"enemy":null,"player":null,"projectile":null,"continuation":null,"command":null,"rng_ledger":ledger,"live_spawn_verified":false,"full_tick_complete":false}
