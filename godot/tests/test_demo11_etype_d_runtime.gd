extends SceneTree
const USERDIR="EXODUSER-demo11-etype-d-Isolated-20261021"
const OLD=preload("res://tests/test_demo11_43_stage_spawn_adapter.gd")
var checks:=0
var failures:=0
var main: Node
var owner: Node
var typed: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("D_RUNTIME_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func setup() -> void:
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 await physics_frame
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._bossArena=false
 var provider=OLD.Provider.new();main.world.add_child(provider)
 for i in 5:
  var marker:=Marker2D.new();provider.add_child(marker);marker.position=main.player.global_position+Vector2(100+i*50,0)
  provider.rows.append({"id":"D-runtime-hole-"+str(i),"marker":marker,"region_id":i%4,"room":-1,"size":0.3})
  provider.groups.append({"hole_id":"D-runtime-hole-"+str(i),"spawn_group_id":"D-runtime-"+str(i),"region_id":i%4,"total":8})
 check(main.bind_native_spawn_stage_provider(provider).ready,"actual MAP11 Marker adapter")
 seed(20261021) # Explicit nonelite/RNG fixture, production still shares World RNG.
 for i in 5:
  var etype: int=[18,19,23,24,25][i]
  var result: Dictionary=main.spawn_native_demo11_d("D-runtime-"+str(i),etype)
  # The test never retries/relabels a real elite refusal. Deterministic test World
  # uses its existing native RNG. A refusal is a failure, not a skip.
  check(result.get("ready",false),"real factory/World/origin D"+str(etype)+str(result.get("reason","")))
  if result.get("ready",false):typed.append(result.actor)
 owner=main.world.get_node_or_null("Demo11EtypeD")
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
 await setup()
 check(typed.size()==5 and main.native_stage_spawn_adapter.snapshot().origins==5,"five real types registered with immutable origins")
 if typed.size()!=5:main.free();quit(1);return
 for i in 20:await physics_frame
 for a in typed:
  check(main.world.get_enemies().has(a) and a.native_ticks>0,"actual World AI tick D"+str(a.etype))
  check(a.data.native_final.el==-1 and a.etype==a.data.native_final.etype,"natural undefined element identity D"+str(a.etype))
  a.data.native_final.reviveIframes=0
  var shield: float=a.eShield
  a.receive_damage(5,Vector2.RIGHT,"weapon",{})
  check(a.not_ready=="" and a.eShield<shield,"actual PC hurtE shield damage D"+str(a.etype)+a.not_ready)
 var vampire: Node=typed[0]
 vampire.global_position=main.player.global_position+Vector2(20,0);vampire._contact_ticks=0
 main.player.iframes=0
 var hp: float=main.player.hp
 vampire.advance_native_phase(1,0,[])
 # Above might be same serial: the real following physics update owns contact.
 await physics_frame
 check(main.player.hp<hp,"actual type18 melee calls PC Player damage")
 var zombie: Node=typed[3];zombie.global_position=main.player.global_position+Vector2(20,0)
 await physics_frame
 check(main.player.get_native_freeze_slow_ticks()>0,"actual type24 PC freeze API")
 var before: int=main.native_demo_boss_projectiles.snapshot().born
 for i in [0,1,2]:typed[i]._projectile_ticks=0;typed[i].charge_ticks=1
 await physics_frame;await physics_frame
 check(main.native_demo_boss_projectiles.snapshot().born>=before+3,"actual D charged registry carriers")
 var slime: Node=typed[4];slime.slime_t=0
 await physics_frame
 check(owner.zones.size()>0,"actual type25 purple zone registry")
 var independent: String=typed[0].not_ready
 typed[2].receive_damage(5,Vector2.RIGHT,"weapon",{"D_unported_option":true})
 check(typed[2].not_ready.contains("hurte_opts_unsupported") and typed[0].not_ready==independent,"option refusal isolates type23; no generic fallback")
 # Terminal slime admission must stop before pretending missing death prefix ran.
 var receipt: Dictionary=slime.apply_native_normal_enemy_death_write()
 check(not receipt.applied and slime.not_ready=="PC_hurtE_42804_death_prefix_required" and slime.alive,"type25 death remains locally NOT_READY")
 print("D_RUNTIME_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"actual_types":typed.size(),"source_full_update_verified":false,"type25_death":"NOT_READY_PC_prefix"}))
 main.free();quit(1 if failures else 0)

func verify_constructor() -> void:
 var fixtures: Array=[]
 for a in typed:
  var f: Dictionary=a.data.source_context.duplicate()
  var n: Dictionary=a.data.native_final.duplicate(true)
  n.speed=a.data.speed_pixels_per_tick
  f.merge({"x":a.spawn_position.x,"y":a.spawn_position.y,"etype":a.etype,"element":a.data.element_id,"draws":a.data.constructor_draws,"actual":n})
  fixtures.append(f)
 var fixture_path: String=OS.get_cache_dir()+"/demo11-D-ctor-"+str(OS.get_process_id())+".json"
 var file:=FileAccess.open(fixture_path,FileAccess.WRITE);file.store_string(JSON.stringify(fixtures,"",true,true));file.close()
 var args:=OS.get_cmdline_user_args();var node_bin: String="";var source: String=""
 for arg in args:
  if arg.begins_with("--node-bin="):node_bin=arg.substr(11)
  if arg.begins_with("--source-game="):source=arg.substr(14)
 var chunks: Array=[]
 var exit_code: int=OS.execute(node_bin,PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_etype_d_constructor.mjs"),"--source-game="+source,"--fixture-file="+fixture_path]),chunks,true)
 var text: String=""
 for chunk in chunks:text+=str(chunk)
 var oracle: Variant=JSON.parse_string(text)
 check(exit_code==0 and oracle is Dictionary and oracle.get("failures")==0,"actual mkEn constructor/RNG parity "+text.left(180))
 print("D_CONSTRUCTOR_ORACLE ",text)
 DirAccess.remove_absolute(fixture_path)
