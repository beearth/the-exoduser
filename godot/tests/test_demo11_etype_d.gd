extends SceneTree
const USERDIR="EXODUSER-demo11-etype-d-Isolated-20261021"
const BASE=preload("res://tests/test_demo11_43_stage_spawn_adapter.gd")
const FACTORY=preload("res://scripts/enemy_factory.gd")
const HURTE=preload("res://scripts/native_normal_enemy_hurte.gd")
const ETYPES=[18,19,23,24,25]
var checks:=0
var failures:=0
var rows: Array=[]
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("ETYPE_D_FAIL ",label)
func arg(key: String) -> String:
 for a in OS.get_cmdline_user_args():
  if a.begins_with(key+"="):return a.substr(key.length()+1)
 return ""
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"isolated user directory")
 var chunks: Array=[]
 var code: int=OS.execute(arg("--node-bin"),PackedStringArray([ProjectSettings.globalize_path("res://tests/demo11_etype_d_oracle.mjs"),"--source-game="+arg("--source-game")]),chunks,true)
 var text: String=""
 for chunk in chunks:text+=str(chunk)
 var oracle: Variant=JSON.parse_string(text)
 check(code==0 and oracle is Dictionary and oracle.get("failures")==0,"actual web branch oracle "+text.left(160))
 var main=load("res://scenes/main.tscn").instantiate();root.add_child(main);await physics_frame
 var g: Dictionary=main.source_state.read_current_g()
 var provider=BASE.Provider.new();main.world.add_child(provider)
 for i in ETYPES.size():
  var m:=Marker2D.new();provider.add_child(m);m.position=Vector2(500+i*100,600)
  provider.rows.append({"id":"D-hole-"+str(i),"marker":m,"region_id":i%4,"room":-1,"size":0.3})
  provider.groups.append({"hole_id":"D-hole-"+str(i),"spawn_group_id":"D-group-"+str(i),"region_id":i%4,"total":8})
 check(main.bind_native_spawn_stage_provider(provider).ready,"real MAP adapter accepts live Marker provider")
 var adapter: RefCounted=main.native_stage_spawn_adapter
 var count: int=main.world.get_enemies().size()
 var denominator: int=g._totalSpawned
 var factory=FACTORY.new()
 var existing: Node=main.world.get_enemies()[0]
 var hp_before: float=existing.hp
 for i in ETYPES.size():
  var etype: int=ETYPES[i]
  var request: Dictionary={"etype":etype,"radius":20.0}
  var site: Dictionary=adapter.request_spawn("D-group-"+str(i),request)
  check(site.get("ready",false),"Marker site candidate type"+str(etype))
  check(site.get("position")==provider.rows[i].marker.global_position+Vector2(20,0),"provider-owned position type"+str(etype))
  check(not request.has("hole_id"),"request not changed type"+str(etype))
  var reason: String=factory.unsupported_reason({"etype":etype})
  check(reason=="native_type_ai_not_ported","existing factory refuses actual D identity "+str(etype))
  # Probe only the existing entry's option admission, before any fields/HP/RNG.
  # This existing actor never impersonates a D actor and is not a combat PASS.
  var refusal: Dictionary=HURTE.new().execute(main,main.world,existing,1,0,0,{"D_unported_option":true})
  check(refusal.get("ok")==false and str(refusal.get("reason")).contains("hurte_opts_unsupported"),"PC hurtE option refusal remains local "+str(etype))
  rows.append({"etype":etype,"status":"NOT_READY","site_ready":site.ready,"factory_reason":reason,"actor_registered":false,"damage_verified":false})
 check(provider.query_count==5 and rows.size()==5,"one refusal never skips remaining types")
 check(main.world.get_enemies().size()==count and existing.hp==hp_before,"no fake actor or HP mutation")
 check(g._totalSpawned==denominator and denominator==40,"planned Marker denominator never claims actual spawns")
 var spawn: Node=main.world.get_node("NativeSpawnHoleSystem")
 check(not spawn.active and not spawn.is_physics_processing(),"legacy scheduler stays deferred, no type0 fallback")
 check(adapter.snapshot().origins==0,"no candidate counted as actor origin")
 check(main.player.has_method("apply_native_freeze_slow"),"existing PC freeze API available for future type24, not missing")
 main.free()
 print("ETYPE_D_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"source_oracle":oracle,"rows":rows,"implementation_status":"BLOCKED","actual_D_actors":0,"five_type_benchmark":"NOT_RUN_NO_ACTORS"}))
 quit(1 if failures else 0)
