extends RefCounted
## BC3-04: laser packets AFTER the shared st2 clock checkpoint.
## World, effects, protected contacts and _r are owner requests/readbacks only.
const Common=preload("res://scripts/native_ch1_boss_melee_states.gd")
const Catalog=preload("res://scripts/native_ch3_boss_catalog.gd")
const Context=preload("res://scripts/native_boss_catalog_context.gd")
const STATES=["bossLaserWind","bossLaser"]
const OWNER="BC3-04/laser/v1"
const STEPS=["entry","wind_lock","wind_parts","wind_sound","wall","geometry","window","poise","parry_text","death_sample","sample","hit_kb","particles","finish","done"]

static func source_receipt() -> Dictionary:
 return {"ready":Context.resolve(Catalog)["ready"],"source_game_sha256":Catalog.GAME_SHA256,
  "source_range":[40710,40747],"states":STATES.duplicate(),"clock":"shared st2 already decremented; sp readback only",
  "live_combat_connected":false,"damage_execution_verified":false,"parry_execution_verified":false,"full_tick_complete":false,"save_io":false}

static func begin_tick(si: int,enemy: Dictionary,sp: float,player: Dictionary,options: Dictionary={}) -> Dictionary:
 if not Context.resolve(Catalog)["ready"]:return Common._fail("chapter_dependency_unready")
 if not Catalog.boss_for_stage(si).get("supported",false):return Common._fail("unsupported_chapter_stage")
 if not STATES.has(enemy.get("s")):return Common._fail("unsupported_laser_state")
 if not _actor(enemy) or not _player(player) or not Common._num(sp):return Common._fail("state_snapshot_unsupported")
 if enemy["s"]=="bossLaserWind" and not _options(options):return Common._fail("global_option_reader_missing")
 var token: Dictionary={"version":1,"owner":OWNER,"si":si,"kind":enemy["s"],"enemy":enemy.duplicate(true),
  "player":player.duplicate(true),"sp":sp,"options":options.duplicate(true),"step":"entry","pending":""}
 Context.bind(token,Catalog)
 return {"status":"READY","continuation":token,"full_tick_complete":false}

static func next_tick(token: Dictionary,response: Variant=null,rng: Callable=Callable()) -> Dictionary:
 if token.get("version")!=1 or token.get("owner")!=OWNER or token.get("_chapter_catalog")!=Catalog \
  or not token.get("si") is int or not STATES.has(token.get("kind")) or not token.get("enemy") is Dictionary \
  or not token.get("player") is Dictionary or not token.get("options") is Dictionary \
  or not Common._num(token.get("sp")) or not STEPS.has(token.get("step")) or not token.get("pending") is String:
  return Common._fail("laser_continuation_required")
 var resolved: Dictionary=Context.from_token(token)
 if not resolved["ready"]:return Common._fail(resolved["reason"])
 if not Catalog.boss_for_stage(token["si"]).get("supported",false):return Common._fail("unsupported_chapter_stage")
 var state: Dictionary=token.duplicate(true)
 var pending: String=state["pending"]
 if pending!="":
  if not response is Dictionary or response.get("ack")!=true:return Common._fail("owner_ack_missing")
  match pending:
   "wall":
    if not response.get("value") is bool:return Common._fail("wall_reader_missing")
    if response["value"]:state["actual_len"]=state["wall_t"];state["step"]="geometry"
    else:state["wall_t"]+=10
   "window":
    if not response.get("value") is bool:return Common._fail("parry_window_reader_missing")
    state["parry_window"]=response["value"]
   "contact":
    if not response.get("enemy_after") is Dictionary or not response.get("player_after") is Dictionary \
     or not _actor(response["enemy_after"]) or not _player(response["player_after"]):
     return Common._fail("protected_contact_readback_missing")
    state["enemy"]=response["enemy_after"].duplicate(true);state["player"]=response["player_after"].duplicate(true)
   "pitch":
    if not Common._num(response.get("value")):return Common._fail("pitch_reader_missing")
    state["pitch_value"]=response["value"]
   "ack":pass
   _:return Common._fail("unknown_laser_pending")
 state["pending"]=""
 var e: Dictionary=state["enemy"];var p: Dictionary=state["player"]
 if not _actor(e) or not _player(p):return Common._fail("state_snapshot_unsupported")
 if state["kind"]=="bossLaserWind" and not _options(state["options"]):return Common._fail("global_option_reader_missing")
 if not _checkpoint(state):return Common._fail("laser_checkpoint_fields_missing")
 var events: Array=[];var ledger: Array=[]
 while state["step"]!="done":
  match state["step"]:
   "entry":
    if state["kind"]=="bossLaserWind":
     var diff: float=Common._aim(e,p)-e["laserAng"]
     while diff>PI:diff-=PI*2
     while diff< -PI:diff+=PI*2
     Common._write(e,{"laserAng":e["laserAng"]+diff*0.04*state["sp"]},40714,events)
     state["step"]="wind_lock" if e["st2"]<=0 else "done"
    else:
     if e.get("_laserLockAng")==null:Common._write(e,{"_laserLockAng":e["laserAng"]},40722,events)
     Common._write(e,{"_laserSweepT":_or(e.get("_laserSweepT"),0)+state["sp"]},40723,events)
     Common._write(e,{"laserAng":e["_laserLockAng"]+_or(e.get("_laserSweepDir"),1)*0.0065*e["_laserSweepT"]},40724,events)
     state["lx"]=cos(e["laserAng"]);state["ly"]=sin(e["laserAng"])
     state["actual_len"]=e["laserLen"];state["wall_t"]=10;state["step"]="wall"
   "wind_lock":
    Common._write(e,{"_laserLockAng":e["laserAng"]},40716,events)
    var draw: Dictionary=Common._draw(rng,"laser_direction",40716,events,ledger)
    if not draw["ok"]:return Common._fail(draw["reason"],ledger)
    Common._write(e,{"_laserSweepDir":-1 if draw["unit"]<0.5 else 1,"_laserSweepT":0},40716,events)
    Common._write(e,{"s":"bossLaser","st2":80,"laserLen":1400+state["si"]*60},40717,events)
    Common._global("_flashT",maxf(_or(state["options"]["flash_t"],0),3),40718,events)
    Common._global("_flashCol",e["col"] if not e["col"].is_empty() else "#ff3355",40718,events)
    Common._global("shake",maxf(_or(state["options"]["global_shake"],0),8*state["options"]["shake"]/100.0),40718,events)
    state["step"]="wind_parts"
   "wind_parts":
    state["step"]="wind_sound"
    return Common._command(state,"addParts",40718,[e["x"],e["y"],e["col"],14],events,ledger)
   "wind_sound":
    state["step"]="done"
    return Common._command(state,"SFX.charge",40718,[],events,ledger)
   "wall":
    if state["wall_t"]<e["laserLen"]:
     return Common._command(state,"isW",40728,[e["x"]+state["lx"]*state["wall_t"],e["y"]+state["ly"]*state["wall_t"]],events,ledger,"wall")
    state["step"]="geometry"
   "geometry":
    Common._write(e,{"_laserActLen":state["actual_len"]},40729,events)
    state["dx"]=p["x"]-e["x"];state["dy"]=p["y"]-e["y"]
    var proj: float=state["dx"]*state["lx"]+state["dy"]*state["ly"]
    state["step"]="particles"
    if proj>0 and proj<state["actual_len"] and absf(state["dx"]*state["ly"]-state["dy"]*state["lx"])<p["r"]+80 and p["iframes"]<=0:
     state["step"]="window"
     return Common._command(state,"isPWin",40736,[],events,ledger,"window")
   "window":
    if state["parry_window"]:
     _player_write(p,{"parryBank":_or(p.get("parryBank"),0)+Common._i32(e["atk"]*1.6)},40736,events)
     state["step"]="poise"
     return Common._command(state,"doParry",40736,[e["atk"],e["x"],e["y"],false,e["el"]],events,ledger,"contact")
    state["step"]="particles"
    if p["s"]!="charge":
     state["step"]="death_sample"
     return Common._command(state,"hurtP",40737,[Common._i32(p["mhp"]*0.01),{"dtype":"magic"}],events,ledger,"contact")
   "poise":
    state["step"]="parry_text"
    return Common._command(state,"_poiseHit",40736,[{"actor_ref":"boss"},20],events,ledger,"contact")
   "parry_text":
    state["step"]="particles"
    return Common._command(state,"addTxt",40736,[p["x"],p["y"]-25,{"call":"_T","args":["⚡패링!"]},"#ffdd00",50],events,ledger)
   "death_sample":
    var draw: Dictionary=Common._draw(rng,"laser_death_sample",40738,events,ledger)
    if not draw["ok"]:return Common._fail(draw["reason"],ledger)
    state["sample_name"]=["fire_death","fire_death2","fire_death3"][Common._i32(draw["unit"]*3)]
    state["step"]="sample"
    return Common._command(state,"_r",40738,[1.2,0.15],events,ledger,"pitch")
   "sample":
    state["step"]="hit_kb"
    return Common._command(state,"playSample",40738,[state["sample_name"],0.5,state["pitch_value"]],events,ledger)
   "hit_kb":
    _player_write(p,{"iframes":maxf(p["iframes"],60)},40739,events)
    var angle: float=e["laserAng"]+PI/2*(1 if state["dx"]*state["ly"]-state["dy"]*state["lx"]>0 else -1)
    _kb(p,p["kb"]["x"]+cos(angle)*6,p["kb"]["y"]+sin(angle)*6,40741,events)
    state["step"]="particles"
   "particles":
    state["step"]="finish"
    var gate: Dictionary=Common._draw(rng,"laser_particle_gate",40745,events,ledger)
    if not gate["ok"]:return Common._fail(gate["reason"],ledger)
    if gate["unit"]>0.5:
     var units: Array=[]
     for i in 6:
      var draw: Dictionary=Common._draw(rng,["laser_particle_distance","laser_particle_x","laser_particle_y","laser_particle_vx","laser_particle_vy","laser_particle_size"][i],40745 if i==0 else 40746,events,ledger)
      if not draw["ok"]:return Common._fail(draw["reason"],ledger)
      units.append(draw["unit"])
     var distance: float=units[0]*state["actual_len"]
     return Common._command(state,"poolPart",40746,[e["x"]+state["lx"]*distance+(units[1]-0.5)*8,e["y"]+state["ly"]*distance+(units[2]-0.5)*8,
      (units[3]-0.5)*2,(units[4]-0.5)*2,e["col"],2+units[5]*2,6],events,ledger)
   "finish":
    state["step"]="done"
    if e["st2"]<=0:
     Common._write(e,{"s":"recover","st2":60},40747,events)
     return Common._command(state,"SFX.beamStop",40747,[],events,ledger)
   _:return Common._fail("unknown_laser_checkpoint")
 return {"status":"READY","done":true,"enemy":e,"player":p,"events":events,"rng_ledger":ledger,"command":null,"continuation":null,"full_tick_complete":false}

static func _or(value: Variant,fallback: float) -> float:return fallback if value==null or value==0 else float(value)
static func _options(o: Dictionary) -> bool:
 return o.has("flash_t") and o.has("global_shake") and Common._num(o.get("shake")) \
  and (o["flash_t"]==null or Common._num(o["flash_t"])) and (o["global_shake"]==null or Common._num(o["global_shake"]))
static func _actor(e: Dictionary) -> bool:
 if not Common._actor(e) or not Common._numbers(e,["laserAng","laserLen"]) or not e.get("col") is String:return false
 for key in ["_laserLockAng","_laserSweepDir","_laserSweepT"]:
  if e.has(key) and e[key]!=null and not Common._num(e[key]):return false
 return true
static func _player(p: Dictionary) -> bool:
 return Common._player(p) and Common._num(p.get("mhp")) and p.get("kb") is Dictionary and Common._numbers(p["kb"],["x","y"]) \
  and (p.get("parryBank")==null or Common._num(p["parryBank"]))
static func _player_write(p: Dictionary,fields: Dictionary,line: int,events: Array) -> void:
 var writes: Array=[];Common._write(p,fields,line,writes)
 for event: Dictionary in writes:event["kind"]="player_write";events.append(event)
static func _kb(p: Dictionary,x: float,y: float,line: int,events: Array) -> void:
 var writes: Array=[];Common._write(p["kb"],{"x":x,"y":y},line,writes)
 for event: Dictionary in writes:event["kind"]="player_write";event["field"]="kb."+event["field"];events.append(event)

static func _checkpoint(state: Dictionary) -> bool:
 var step: String=state["step"]
 if state["kind"]=="bossLaserWind":return step in ["entry","wind_lock","wind_parts","wind_sound","done"]
 if step in ["wind_lock","wind_parts","wind_sound"]:return false
 if step!="entry" and not Common._numbers(state,["lx","ly","actual_len","wall_t"]):return false
 if step in ["window","poise","parry_text","death_sample","sample","hit_kb","particles","finish","done"] and not Common._numbers(state,["dx","dy"]):return false
 if step=="window" and not state.get("parry_window") is bool:return false
 if step=="sample" and (not state.get("sample_name") is String or not Common._num(state.get("pitch_value"))):return false
 return true
