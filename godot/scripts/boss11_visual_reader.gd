extends Node2D
## Read-only view of cached source objects. No owner requests, RNG, combat writes,
## list/path APIs or ResourceLoader in either process path.
const EMPTY: Dictionary={}
const Marks=preload("res://scripts/boss11_telegraph.gd")
var marks: Node2D
var main: Node
var actor: Node
var ground: Node2D
var _last_state: String=""
var _duration:=1.0
var _slam_wind_duration:=0.0
var _last_remaining:=0.0
var _flash_left:=0.0
func _ready() -> void:
 marks=Marks.new();add_child(marks)
 ground=preload("res://scripts/boss11_source_ground.gd").new();add_child(ground)
func configure(owner_main: Node) -> void:
 main=owner_main
 actor=main.native_demo_boss_actor
 marks.bind_player(main.player)
func _process(delta: float) -> void:
 if not is_visible_in_tree() or not is_instance_valid(actor) or not is_instance_valid(main):
  marks.begin();marks.finish();ground.observe_enemy(EMPTY);ground.refresh(EMPTY,false);return
 var enemy: Dictionary=actor.get("_enemy")
 if enemy.is_empty():
  _flash_left=0;marks.begin();marks.finish();ground.observe_enemy(EMPTY);ground.refresh(EMPTY,false);return
 if not enemy.get("alive",false):
  _flash_left=0;marks.begin();marks.finish();ground.observe_enemy(EMPTY)
  # Windup dies with its boss. Source G hazard queues retain their own maxT;
  # never make an authoritative damaging pool invisible before it expires.
  ground.refresh(main.source_state.read_current_g(),true);return
 ground.observe_enemy(enemy)
 var state: String=enemy.get("s","")
 # Snapshot 10905–10976: the green vine silhouette is the source attack/transform
 # frame. The former orange pooled UI warning is not source artwork.
 if main.source_state.read_current_g().get("stage")==0:
  ground.refresh(main.source_state.read_current_g(),true)
  marks.begin();marks.finish();return
 # A short purely visual flash when an observed windup/strike ends.
 if state=="recover" and _last_state in ["bossSlam","bossSlash","bossSweep"]:
  _flash_left=0.10
  _last_state=state
 if _flash_left>0:
  _flash_left-=delta
  for i in range(marks.used):marks.marks[i].set_instance_shader_parameter("progress",1.001+(0.10-_flash_left)*1.19)
  if _flash_left>0:return
 var g: Dictionary=main.source_state.read_current_g()
 render_source(enemy,g,main.player.radius)
func render_source(e: Dictionary,g: Dictionary,player_radius: float) -> void:
 marks.begin()
 var state: String=e.get("s","")
 var remaining: float=e.get("st2",0)
 if state!=_last_state or remaining>_last_remaining:
  # Latch the first published actual countdown, including authored delay.
  _duration=maxf(1.0,remaining)
 _last_state=state;_last_remaining=remaining
 var p:=clampf(1.0-remaining/_duration,0,1)
 var at:=Vector2(e.get("x",0),e.get("y",0))
 var phase: float=e.get("_bossPhase",0)
 var radius: float=e.get("r",44)
 var facing: float=e.get("facing",0)
 match state:
  "bossSlamWind":
   _slam_wind_duration=_duration
   marks.circle(at,1000+phase*80,1.0-(remaining+8.0)/(_duration+8.0))
  "bossSlam":marks.circle(at,1000+phase*80,1.0-remaining/(_slam_wind_duration+8.0))
  "bossSlashWind":marks.sector(at,radius+player_radius+300,facing,2.4,p)
  "bossSweepWind":marks.sector(at,radius+player_radius+400,facing,3.4,p)
  "bossSpinWind","bossSpin":marks.circle(at,500,p if state.ends_with("Wind") else 1.12)
  "bossGrabWind":marks.circle(at,radius+player_radius+200,clampf(1.0-remaining/maxf(1.0,e.get("_grabWindMax",_duration)),0,1))
  "bossDruidUnder":
   if e.has("_diveTx") and e.has("_diveTy"):
    marks.circle(Vector2(e._diveTx,e._diveTy),radius+120,clampf(1.0-remaining/maxf(1.0,e.get("_underMax",_duration)),0,1))
  "bossDruidErupt":marks.circle(at,radius+120,1.12)
  "bossJumpWind","bossJump":
   if e.has("jumpX") and e.has("jumpY"):marks.circle(Vector2(e.jumpX,e.jumpY),300,p)
  # Dynamic charge endpoints, random mines/summon locations and projectile lanes
  # have no authoritative precomputed geometry. Do not fabricate safe zones.
 for pool in g.get("_lavaPools",[]):
  if pool is Dictionary and pool.get("warnT",0)>0:
   marks.circle(Vector2(pool.x,pool.y),pool.r,minf(1.12,float(pool.t)/pool.warnT))
 for chase in g.get("_chaseAoes",[]):
  for zone in chase.get("zones",[]):
   if not zone.get("hit",false) and zone.get("delay",0)>0:
    marks.circle(Vector2(zone.x,zone.y),zone.r,minf(1.0,float(zone.t)/zone.delay))
 for wave in g.get("_tideWaves",[]):
  if wave.get("r",0)>0:
   # Source condition abs(distance-r)<w; gapSize is a HALF angle.
   marks.ring(Vector2(wave.x,wave.y),wave.r+wave.w,wave.w*2,wave.gapAng,wave.gapSize*2,1.12)
 for fissure in g.get("_fissures",[]):
  var origin:=Vector2(fissure.x,fissure.y)
  var tip: Vector2=origin+Vector2.from_angle(fissure.ang)*fissure.len
  marks.strip(origin,tip,fissure.w,1.12,true)
  if not fissure.get("exploded",false):
   marks.circle(tip,fissure.explR,minf(1.0,float(fissure.len)/maxf(1.0,fissure.maxLen)))
 for pool in g.get("_poisonPools",[]):
  if pool is Dictionary and pool.has("r"):marks.circle(Vector2(pool.x,pool.y),pool.r,1.12)
 for mine in g.get("_seekerMines",[]):
  if mine is Dictionary and mine.get("armT",0)>0:
   marks.circle(Vector2(mine.x,mine.y),mine.r,minf(1.12,float(mine.t)/mine.armT))
 marks.finish()
