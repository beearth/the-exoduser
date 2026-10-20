extends SceneTree
const USERDIR: String="EXODUSER-demo11-33-Isolated-20261021"
const MODEL=preload("res://scripts/native_demo11_worm_model.gd")
const BASE=preload("res://tests/test_demo11_anglers.gd")
const WM=preload("res://scripts/native_demo11_worms.gd")
var assertions:=0
var failures:=0
var draws:=0
var fixture_wall:=false
var scope: Node2D
var service: Node
var worms: Node2D
var pc: Node
class Scope extends BASE.Scope:
 var native_demo_worms: Node2D
class Bridge extends Node:
 var main: Node
 var target: Node2D
 var contact_calls:=0
 var aggro_calls:=0
 var active:=false
 func aggro(_at: Vector2) -> Dictionary:
  aggro_calls+=1
  return {"ready":true,"active":active,"target":target}
 func contact(request: Dictionary) -> Dictionary:
  contact_calls+=1
  var p: Node=main.player
  # Test bridge invokes only the existing PC Player interface. Never edits HP.
  if p.hp>0 and p.iframes<=0 and p.state!="charge":p.receive_damage(request.damage,"phys",Vector2.ZERO,0.0)
  return {"ack":true,"committed":true,"player_after":snapshot_player()}
 func snapshot_player() -> Dictionary:
  return {"x":main.player.global_position.x,"y":main.player.global_position.y,"r":main.player.radius,"hp":main.player.hp,"iframes":main.player.iframes,"s":main.player.state}
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO33_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func argument(key: String) -> String:
 for a in OS.get_cmdline_user_args():
  if a.begins_with(key+"="):return a.substr(key.length()+1)
 return ""
func normalized(value: Variant) -> Variant:return JSON.parse_string(JSON.stringify(value))
func _rng() -> float:draws+=1;return 0.5
func _wall(_at: Vector2) -> bool:return fixture_wall
func setup_registry() -> void:
 scope=Scope.new();root.add_child(scope)
 scope.world=BASE.BASE.Arena.new();scope.world.map_data={"fixture_open_wall_provider":true};scope.add_child(scope.world)
 scope.player=BASE.Target.new();scope.player.position=Vector2(0,400);scope.add_child(scope.player)
 scope.source_state=BASE.Holder.new();scope.source_state.p.hp=220;scope.add_child(scope.source_state)
 scope.native_demo_boss_actor=BASE.ACTOR.install_native_boot(scope)
 service=BASE.SERVICE.install_native_boot(scope);service.set_physics_process(false);scope.native_demo_boss_projectiles=service
 scope.native_demo_anglers=BASE.FAMILY.install_native_boot(scope)
 worms=WM.install_native_boot(scope);scope.native_demo_worms=worms
 var provider:=Node2D.new();scope.world.add_child(provider)
 var markers: Array=[]
 for i in 4:
  var marker:=Marker2D.new();provider.add_child(marker);markers.append(marker)
 check(worms.bind_provider(provider,markers),"Marker fixture provider4")
 pc=Bridge.new();scope.world.add_child(pc)
 check(worms.bind_hit_owner(pc),"actual hit owner bind")
 pc.target=Node2D.new();pc.target.position=Vector2(400,0);scope.world.add_child(pc.target)
 check(worms.bind_aggro_reader(pc,pc.aggro),"real target resolver boundary bound")
func native_frame(id: int,sp: float=1.0) -> void:
 scope.world.set("_native_clock_updates",id)
 worms.advance_phase(sp,id*sp,[])
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var output: Array=[]
 var code: int=OS.execute(argument("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_33_oracle.mjs"),"--source-game="+argument("--source-game")]),output,true)
 var joined: String=""
 for chunk in output:joined+=str(chunk)
 var oracle: Variant=JSON.parse_string(joined)
 check(code==0 and oracle is Dictionary,"source oracle "+joined.left(140))
 if oracle is Dictionary:
  for f in oracle.fixtures:
   if f.kind=="initial":check(normalized(MODEL.initial(Vector2.ZERO,f.level,f.asleep))==normalized(f.w),"exact source initial "+str(f.level));continue
   var w: Dictionary=f.before.duplicate(true)
   if f.kind=="hit":
    check(MODEL.apply_hit(w,f.damage)==f.accepted and normalized(w)==normalized(f.after),"source real HP/CD damage "+str(f.damage));continue
   draws=0;fixture_wall=f.wall
   var result: Dictionary=MODEL.advance(w,f.p,{"can_shoot":f.can,"bonfire":f.bonfire},_rng,_wall)
   check(result.ready and normalized(w)==normalized(f.after),"source tick phase "+str(f.before.phase)+"/"+str(f.before.ft))
   check(draws==f.draws,"source lockdest RNG/28 retry")
   var shots: Array=[]
   for event in result.get("events",[]):
    if event.kind=="shot":shots.append(event.props)
   check(normalized(shots)==normalized(f.shots),"source immediate blood payload; no warning")
 setup_registry();native_frame(1)
 check(scope.source_state.g._worms.size()==4,"same G worms four slots")
 var records: Array=scope.source_state.g._worms
 pc.active=true
 var raw: Dictionary=MODEL.fire(records[0],{"x":0,"y":400})
 var born: Variant=service.birth_field_projectile(worms,raw,worms.read_projectile_frame())
 check(born is Dictionary and born.ack and service.snapshot().live==1,"actual shared registry birth")
 var node: Node=service.get("_entries").values()[0].node
 check(node.raw.titanEye and node.raw.parryClass=="physical" and is_equal_approx(Vector2(node.raw.vx,node.raw.vy).length(),5.0),"original titanEye profile300/drop exempt")
 check(Vector2(node.raw.vx,node.raw.vy).normalized().is_equal_approx((pc.target.global_position-node.global_position).normalized()),"PC actual target redirects birth from actual mouth origin")
 var before_vy: float=node.raw.vy
 pc.target.position=Vector2(400,400)
 check(service.advance_source_frame(worms.read_projectile_frame()) and node.player==pc.target and node.raw.vy>before_vy,"actual per-projectile live aggro homing target changes")
 check(pc.aggro_calls>=2 and scope.player.forbidden_calls==0,"aggro is real node reader; no fake Player hurt/parry")
 # Geometry/hitSet and hidden/peek/CD8/overkill death, no normal reward or fbDone.
 check(not worms.apply_hit(root,0,10).accepted,"foreign hit owner rejected")
 records[0].phase="hide";records[0].hideT=55
 check(not worms.apply_hit(pc,0,1).accepted,"deep hide immune")
 records[0].hideT=54
 check(worms.apply_hit(pc,0,1.9).accepted and records[0].hp==194 and records[0].hitCd==8,"peek receives source ToInt32 damage and CD8")
 var hit_set: Dictionary={}
 check(worms.hurt_at(pc,Vector2.ZERO,1,2,hit_set,true)==4 and hit_set.size()==4,"hitSet before CD rejection and parry counted FX only")
 check(worms.hurt_at(pc,Vector2.ZERO,1,2,hit_set,true)==0,"same source attack hitSet not retried")
 records[0].hitCd=0
 check(worms.apply_hit(pc,0,10000).dead and scope.source_state.g._worms[0]==null and scope.source_state.g._worms.size()==4,"actual HP terminal null slot, not compacted")
 for i in range(1,4):records[i].hitCd=0;worms.apply_hit(pc,i,10000)
 check(scope.source_state.g._worms==[null,null,null,null] and not scope.source_state.g._fbDone,"worm deaths never finish Angler family")
 native_frame(2)
 check(scope.source_state.g._worms==[null,null,null,null],"truthy exhausted array never respawns")
 scope.source_state.g._bossArena=true;native_frame(3)
 check(service.snapshot().live==0 and scope.source_state.g._worms.is_empty(),"arena clears only this family and real shots")
 scope.free()
 var main: Node=preload("res://scripts/main.gd").new();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var actor: Node=main.native_demo_worms
 check(is_instance_valid(actor) and not actor.snapshot().provider_bound,"actual Main installs provider-dormant family")
 var provider:=Node2D.new();main.world.add_child(provider)
 var markers: Array=[]
 for i in 4:
  var m:=Marker2D.new();provider.add_child(m);m.global_position=main.player.global_position+Vector2(600+i*20,0);markers.append(m)
 check(main.bind_native_demo_worms(provider,markers) and not main.bind_native_demo_worms(provider,markers),"actual Main Marker-only placement once")
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._bonfire=null
 for i in 3:await physics_frame
 check(g.get("_worms") is Array and g._worms.size()==4 and actor.snapshot().serial>=0,"real World invokes WM tick")
 check(g._worms[0].homeX==markers[0].global_position.x,"provider home identity")
 var bridge:=Bridge.new();bridge.main=main;main.world.add_child(bridge)
 check(actor.bind_hit_owner(bridge) and actor.bind_protected_contact(bridge,bridge.contact),"PC interface owner binds")
 var w: Dictionary=g._worms[0]
 w.x=main.player.global_position.x+90;w.y=main.player.global_position.y;w.asleep=0;w.phase="emerge";w.frame=3;w.ft=6;w.popHit=0
 var hp: float=main.player.hp
 main.player.iframes=0;main.world.set("_native_clock_updates",1000)
 actor.advance_phase(1,1000,[])
 check(main.player.hp<hp and bridge.contact_calls==1 and g._worms[0].contactCd==60,"actual bite handoff calls existing PC receive_damage and HP changes")
 main.player.iframes=0;w.x=main.player.global_position.x+20
 main.world.set("_native_clock_updates",1001);actor.advance_phase(1,1001,[])
 check(bridge.contact_calls==1,"shared60 contact cooldown prevents duplicate real damage")
 check(actor.apply_hit(bridge,0,10000).dead and g._worms[0]==null,"actual Main WM HP/death integration")
 main.free()
 print("DEMO33_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"real_player_damage_interface_fixture":true,"natural_combat_verified":false}))
 quit(1 if failures else 0)
