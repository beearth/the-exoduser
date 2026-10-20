extends SceneTree
const USERDIR := "EXODUSER-demo11-31-Isolated-20261021"
const MODEL=preload("res://scripts/native_demo11_angler_model.gd")
const BASE=preload("res://tests/test_demo11_boss_projectiles.gd")
const ACTOR=preload("res://scripts/native_demo11_boss_actor.gd")
const SERVICE=preload("res://scripts/native_demo11_boss_projectiles.gd")
const FAMILY=preload("res://scripts/native_demo11_anglers.gd")
var assertions:=0
var failures:=0
var draws:=0
var scope: Node2D
var family: Node2D
var service: Node
var markers: Array=[]
class Holder extends Node:
 var g: Dictionary={"stage":0,"on":true,"_fbDone":false,"_fbSpawned":false,"_fieldBosses":null}
 var p: Dictionary={"lv":1,"r":20,"iframes":0,"s":"idle","sp":0}
 func read_current_g() -> Dictionary:return g
 func read_current_p() -> Dictionary:return p
class Scope extends BASE.Scope:
 var native_demo_anglers: Node2D
 var native_demo_boss_projectiles: Node
 var source_state: Node
 func read_native_normal_enemy_lesson_status() -> Dictionary:return {"ready":true,"active":false}
class Target extends BASE.Target:
 var radius:=20.0
 var iframes:=0.0
 var state: String="idle"
class PC extends Node:
 signal health(index: int,hp: float,final_death: bool,serial: int)
 var target: Node2D
 var requests: Array=[]
 var bad_readback:=false
 func interact(request: Dictionary) -> Dictionary:
  requests.append(request.duplicate(true))
  # Explicit mock displacement only, no damage/parry implementation or PASS claim.
  target.global_position=Vector2(140,0)
  return {"ack":true,"player":{"x":-999 if bad_readback else target.global_position.x,"y":target.global_position.y,"r":target.radius,"iframes":target.iframes,"s":target.state}}
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO31_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func argument(key: String) -> String:
 for a in OS.get_cmdline_user_args():
  if a.begins_with(key+"="):return a.substr(key.length()+1)
 return ""
func _rng() -> float:draws+=1;return 0.5
func normalized(value: Variant) -> Variant:return JSON.parse_string(JSON.stringify(value))
func setup_registry() -> void:
 scope=Scope.new();root.add_child(scope)
 scope.world=BASE.Arena.new();scope.add_child(scope.world)
 scope.player=Target.new();scope.player.position=Vector2(0,400);scope.add_child(scope.player)
 scope.source_state=Holder.new();scope.add_child(scope.source_state)
 scope.native_demo_boss_actor=ACTOR.install_native_boot(scope)
 service=SERVICE.install_native_boot(scope);service.set_physics_process(false);scope.native_demo_boss_projectiles=service
 family=FAMILY.install_native_boot(scope);scope.native_demo_anglers=family
 var provider:=Node2D.new();scope.world.add_child(provider)
 markers=[]
 for i in 4:
  var marker:=Marker2D.new();provider.add_child(marker);markers.append(marker)
 check(family.bind_provider(provider,markers),"four actual unique Marker fixture provider")
func native_frame(serial: int,sp: float=1.0) -> void:
 scope.world.set("_native_clock_updates",serial)
 family.advance_phase(sp,serial*sp,[])
 family.advance_warnings(sp,serial*sp,[])
func energy() -> Dictionary:
 return {"x":0.0,"y":0.0,"vx":10.0,"vy":0.0,"dmg":75,"el":2,"friendly":false,"life":320,"ml":320,"col":"#3388ff","sz":48,"r":20,"elemBall":true,"_typed":true,"_commit":true,"fbEnergy":true}
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var output: Array=[]
 var exit_code: int=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_31_oracle.mjs"),"--source-game="+argument("--source-game")]),output,true)
 var joined: String=""
 for chunk in output:joined+=str(chunk)
 var oracle: Variant=JSON.parse_string(joined)
 check(exit_code==0 and oracle is Dictionary,"original stream oracle "+joined.left(100))
 if oracle is Dictionary:
  for fixture in oracle.fixtures:
   if fixture.kind=="make":check(normalized(MODEL.make(Vector2.ZERO,fixture.level,int(fixture.el)))==fixture.fb,"original HP/ATK/full spawn "+str(fixture.level));continue
   var fb: Dictionary=fixture.fb.duplicate(true);draws=0
   var result: Dictionary=MODEL.tick(fb,fixture.p,fixture.can,_rng)
   check(result.ready and normalized(fb)==fixture.after,"original full tick state "+str(fixture.fb.t))
   check(draws==fixture.draws,"shared RNG count/order "+str(fixture.fb.t))
   var shots: Array=[]
   for event in result.events:
    if event.kind in ["energy","warning"]:shots.append(event)
   check(normalized(shots)==fixture.shots,"original raw energy/warning payload "+str(fixture.fb.t))
 var blocked: Dictionary=MODEL.make(Vector2.ZERO,1,2);blocked.asleep=0;blocked.hid=0
 var copy: Dictionary=blocked.duplicate(true)
 check(not MODEL.tick(blocked,{"x":0,"y":0,"r":20,"iframes":0,"s":"idle"},true,_rng).ready and blocked==copy,"unbound PC body collision fail closed before prefix")
 setup_registry();native_frame(1)
 var frame: Dictionary=family.read_projectile_frame()
 check(frame.ready and scope.source_state.g._fieldBosses.size()==4,"actual native family spawn in same G")
 var shot: Variant=service.birth_field_projectile(family,energy(),frame)
 check(shot is Dictionary and shot.ack and service.snapshot().live==1,"energy actual registry node not mock ack")
 check(shot.projectile_result.vx==18 and shot.projectile_result.sz==96 and shot.projectile_result.r==26 and shot.projectile_result.dmg==150,"source16971–16980 post-birth scaling preserved")
 var node: Node=service.get("_entries").values()[0].node
 check(node.get_parent()==scope.world and node.raw.fbEnergy and node.raw.elemBall and node.raw.parryClass=="magic" and not node.is_in_group("enemy_projectiles"),"special energy retained; no ordinary/Q admission disguise")
 check(service.advance_source_frame(frame) and is_equal_approx(node.global_position.x,18.0) and is_equal_approx(node.raw.life,319.333),"energy actual straight movement/source life")
 check(not service.advance_source_frame(frame),"one registry tick per native serial")
 scope.world.wall_x=130.0
 native_frame(2);service.advance_source_frame(family.read_projectile_frame())
 check(service.snapshot().live==0 and service.snapshot().last_retired.reason=="field_energy_wall" and service.snapshot().last_retired.raw.x==27.0,"post-birth radius96 sweep retires before center wall")
 scope.world.wall_x=INF
 var forbidden: Node2D=Node2D.new();scope.world.add_child(forbidden)
 check(service.birth_field_projectile(forbidden,energy(),frame)==null,"unbound external projectile producer rejected")
 forbidden.free()
 for i in range(3,432):native_frame(i);service.advance_source_frame(family.read_projectile_frame())
 check(family.snapshot().births>=4 and service.snapshot().born>=5 and family.snapshot().warnings==0,"actual energy births; source default charge does not invent blood shots")
 # Explicit branch fixture: source default180/180 recharge can starve burst.
 var fb: Dictionary=scope.source_state.g._fieldBosses[0]
 fb.enChg=0;fb.shotCd=1000;fb.burst=3;fb.burstGap=0
 for i in range(432,550):native_frame(i);service.advance_source_frame(family.read_projectile_frame())
 var eyes:=0
 for row in service.snapshot().shots:
  if row.raw.get("titanEye",false):
   eyes+=1
   check(row.raw.parryClass=="physical" and row.raw.redBean and row.raw.el==1,"blood original type/normalized birth")
 check(eyes==3 and service.snapshot().dropped==0 and family.snapshot().warnings==0,"three actual delayed blood births, source titanEye drop exemption")
 fb.burst=1;fb.burstGap=0
 native_frame(550)
 var pending_births: int=family.snapshot().births
 var pc_fixture:=PC.new();scope.world.add_child(pc_fixture)
 check(family.bind_pc_source(pc_fixture,&"health"),"independent final source binding")
 pc_fixture.health.emit(0,0,true,1)
 native_frame(551)
 check(family.snapshot().cancelled==1 and family.snapshot().births==pending_births,"dead-owner warning cancelled before real birth")
 check(scope.player.forbidden_calls==0,"protected Player damage/Q calls remain unclaimed")
 scope.source_state.g["_bossArena"]=true
 native_frame(552)
 check(service.snapshot().live==0 and scope.source_state.g._fieldBosses==null and not family.read_projectile_frame().ready,"arena handoff retires actual field shots and leaves actor clock unclaimed")
 scope.free()
 # Actual Main installs owner/phase and follows PC final slots -> P3 -> DEMO11-37 gate.
 var main: Node=preload("res://scripts/main.gd").new();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var g: Dictionary=main.source_state.read_current_g()
 var owner: Node=main.native_demo_anglers
 check(is_instance_valid(owner) and owner.snapshot().provider_bound,"actual Main uses production MAP11 Marker provider")
 var production_markers: Array=main.read_native_map11_provider().fieldboss_markers()
 var provider:=Node2D.new();main.world.add_child(provider)
 var actual: Array=[]
 for i in 4:
  var marker:=Marker2D.new();provider.add_child(marker);marker.global_position=main.player.global_position+Vector2(600+i*20,0);actual.append(marker)
 check(not main.bind_native_demo_anglers(provider,[actual[0],actual[0],actual[2],actual[3]]),"duplicate/missing Marker rejected")
 check(not main.bind_native_demo_anglers(provider,actual),"Main rejects replacing admitted production Marker provider")
 g.on=true
 for i in 3:await physics_frame
 check(g.get("_fieldBosses") is Array and g._fieldBosses.size()==4 and owner.snapshot().serial>=0,"existing World naturally invokes field family phase")
 check(g._fieldBosses[0].homeX==production_markers[0].global_position.x and g._fieldBosses[0].homeY==production_markers[0].global_position.y,"provider coordinate identity, no source site copy")
 var pc:=PC.new();main.world.add_child(pc)
 check(owner.bind_pc_source(pc,&"health") and not owner.bind_pc_source(pc,&"health"),"PC health/final source admission once")
 var old_hp: float=g._fieldBosses[0].hp
 pc.health.emit(-1,0,true,0);pc.health.emit(0,old_hp+1,false,0);pc.health.emit(0,old_hp,true,0)
 check(g._fieldBosses[0].hp==old_hp and not g.get("_fbDone",false),"invalid PC readbacks cannot finish family")
 pc.health.emit(0,old_hp/2,false,1)
 check(g._fieldBosses[0].hp==old_hp/2,"PC HP readback used without damage math")
 pc.health.emit(0,0,true,2);pc.health.emit(0,0,true,2)
 check(g._fieldBosses.size()==4 and g._fieldBosses[0]==null and not g._fbDone,"null slot preserved / no early fbDone")
 for i in range(1,4):pc.health.emit(i,0,true,1)
 check(g._fbDone and g._fieldBosses==[null,null,null,null],"four actual PC final receipts finish family once")
 var regions: Node=main.get_node("NativeRegions")
 var kills_before: int=regions.snapshot().kill_calls
 for region in g._regions:region.kills=ceil(region.total*0.8)
 main.world.set("_native_clock_updates",450);regions.set("_last_frame",-1.0);g.bossAlive=true;regions._physics_process(0)
 check(g._bossUnlocked and main.native_demo_encounter.snapshot().phase=="gate","actual P3 live gate -> DEMO11-37")
 check(regions.snapshot().kill_calls==kills_before and main.source_state.read_native_drop_records().is_empty(),"field death never invents normal region kill/XP/drop reward")
 main.free()
 print("DEMO31_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"pc_final_fixture":true,"natural_damage_parry_verified":false}))
 quit(1 if failures else 0)
