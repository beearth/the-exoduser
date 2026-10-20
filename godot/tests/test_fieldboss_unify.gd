extends SceneTree
const DIR="EXODUSER-fieldboss-unify-Isolated-20261021"
const MAIN=preload("res://scripts/main.gd")
const COMMON=preload("res://scripts/native_fieldboss_common.gd")
var checks:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("FIELDBOSS_UNIFY_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check(OS.get_user_data_dir().get_file()==DIR,"isolated actual Main")
 var main: Node=MAIN.new();root.add_child(main)
 main.set_process(false);main.world.set_physics_process(false);main.player.set_physics_process(false)
 var registry: Node=main.native_demo_boss_projectiles;registry.set_physics_process(false)
 var angler: Node=main.native_demo_anglers
 var fire: Node=main.native_demo_fire_devils;fire.set_physics_process(false)
 var worm: Node=main.native_demo_worms
 check(is_instance_valid(angler) and is_instance_valid(fire) and is_instance_valid(worm),"three merged boot services coexist")
 var provider:=Node2D.new();main.world.add_child(provider)
 var folder:=Node2D.new();folder.name="Markers";provider.add_child(folder)
 var arrays: Array=[]
 for names in [["AnglerSW","AnglerSE","AnglerNW","AnglerNE"],["FireDevil1","FireDevil2","FireDevil3","FireDevil4"],["Worm1","Worm2","Worm3","Worm4"]]:
  for i in names.size():
   var marker:=Marker2D.new();marker.name=names[i];folder.add_child(marker)
   marker.global_position=main.player.global_position+Vector2(700+i*30,0)
  arrays.append(COMMON.named_markers(provider,names))
 check(not main.bind_native_demo_anglers(provider,[arrays[0][0],arrays[0][0],arrays[0][2],arrays[0][3]]),"duplicate Marker rejected without consuming bind")
 check(main.bind_native_demo_anglers(provider,arrays[0]),"angler name-order contract")
 check(main.bind_native_fire_devil_map(provider),"existing fire name contract")
 check(main.bind_native_demo_worms(provider,arrays[2]),"worm name-order contract")
 var g: Dictionary=main.source_state.read_current_g();g.on=true;g._bonfire=null
 main.world.set("_native_clock_updates",999)
 angler.advance_phase(1,999,[]);worm.advance_phase(1,999,[])
 check(g._fieldBosses.size()==4 and g._fireDevils.size()==4 and g._worms.size()==4,"three distinct four-slot collections")
 check(not is_same(g._fieldBosses,g._fireDevils) and not is_same(g._fireDevils,g._worms),"shared helper never aliases family records")
 check(is_same(g._fireDevils,fire._records) and is_same(g._worms,worm._records),"actual State collection identity")
 check(g._fieldBosses[0].homeX==arrays[0][0].global_position.x and g._worms[0].homeX==arrays[2][0].global_position.x,"actual Marker initialization, no source coordinates")
 check(angler._serial==999 and worm._serial==999 and fire._serial==-1,"native and unpublished FD clocks remain distinct")
 check(registry._field_owner==angler and registry._field_aux.has(worm),"one actual registry preserves primary and auxiliary owners")
 check(not main.bind_native_demo_anglers(provider,arrays[0]) and not main.bind_native_fire_devil_map(provider) and not main.bind_native_demo_worms(provider,arrays[2]),"all single-bind guards retained")
 provider.free()
 var a: int=angler._serial;var b: int=worm._serial
 main.world.set("_native_clock_updates",1000)
 angler.advance_phase(1,1000,[]);worm.advance_phase(1,1000,[])
 check(angler._serial==a and worm._serial==b and fire.snapshot().status=="DORMANT","provider loss stops all families")
 main.free()
 print("FIELDBOSS_UNIFY_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actual_Main":true,"fixture_Marker_provider":true,"product_MAP11_verified":false,"collections":3,"slots":12}))
 quit(1 if failures else 0)
