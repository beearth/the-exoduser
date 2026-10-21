extends SceneTree
const USERDIR="EXODUSER-demo11-44-Isolated-20261021"
var assertions:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 assertions+=1
 if not ok:failures+=1;print("DEMO44_AVG_FAIL ",label)
func _initialize() -> void:
 preload("res://tests/mac_harness_safety.gd").arm(self, 120.0)
 call_deferred("_run")
func _run() -> void:
 # Current product MAP11 owns geometry and provider binding.
 if "--map11=off" in OS.get_cmdline_user_args():push_error("MAP11 product contract requires default on");quit(2);return
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
 var main: Node=preload("res://scripts/main.gd").new();root.add_child(main)
 if not main.is_node_ready():await main.ready
 var pets: Node=main.world.get_node("NativePets");pets.set_physics_process(false)
 var provider: Node2D=main.read_native_map11_provider()
 check(is_instance_valid(provider) and main.native_demo_encounter.snapshot().provider_bound and not main.bind_native_demo_arena_provider(provider),"actual product Marker provider bound once")
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._fbDone=true;g.bossAlive=true
 for region in g._regions:region.cleared=true
 var regions: Node=main.get_node("NativeRegions");regions.set("_last_frame",-1.0);regions._physics_process(0)
 check(main.enter_native_demo_arena(provider,{"room":0,"difficulty_index":5,"stage_diff_offset":0}).status=="READY","actual arena owner")
 main.player.global_position=provider.get_node("Markers/Boss").global_position
 var hp: float=main.player.hp
 var attack: float=main.read_native_demo_boss().enemy.atk
 pets.set("_tick",60.0);pets.call("_check_pet_dialogue")
 check(float(pets.get("_pet_enemy_avg_atk"))==attack and attack>0,"separate native boss contributes exact source ens attack average")
 check(main.player.hp==hp,"read-only pet phase preserves HP")
 main.free()
 print("DEMO44_AVG_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"explicit_gate_fixture":true,"damage_verified":false}))
 quit(1 if failures else 0)
