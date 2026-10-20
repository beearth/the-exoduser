extends SceneTree
const USERDIR="EXODUSER-demo11-44-Isolated-20261021"
var assertions:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO44_AVG_FAIL ",label)
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var main: Node=preload("res://scripts/main.gd").new();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var pets: Node=main.world.get_node("NativePets");pets.set_physics_process(false)
 var provider:=Node2D.new();main.world.add_child(provider)
 var markers:=Node2D.new();markers.name="Markers";provider.add_child(markers)
 for key in ["Entry","Boss","Exit","Return"]:
  var marker:=Marker2D.new();marker.name=key;marker.position=Vector2(4020,7200);markers.add_child(marker)
 check(main.bind_native_demo_arena_provider(provider),"actual Marker provider")
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._fbDone=true;g.bossAlive=true
 for region in g._regions:region.cleared=true
 var regions: Node=main.get_node("NativeRegions");regions.set("_last_frame",-1.0);regions._physics_process(0)
 check(main.enter_native_demo_arena(provider,{"room":0,"difficulty_index":5,"stage_diff_offset":0}).status=="READY","actual arena owner")
 var hp: float=main.player.hp
 var attack: float=main.read_native_demo_boss().enemy.atk
 pets.set("_tick",60.0);pets.call("_check_pet_dialogue")
 check(float(pets.get("_pet_enemy_avg_atk"))==attack and attack>0,"separate native boss contributes exact source ens attack average")
 check(main.player.hp==hp,"read-only pet phase preserves HP")
 main.free()
 print("DEMO44_AVG_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"explicit_gate_fixture":true,"damage_verified":false}))
 quit(1 if failures else 0)
