extends SceneTree
const USERDIR="EXODUSER-map11-10-Isolated-20261021"
var checks: int=0
var failures: int=0
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok: failures+=1; printerr("SEAM_FAIL ",label)
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not OS.get_user_data_dir().contains(USERDIR): quit(2); return
 print("ISOLATION ",OS.get_user_data_dir())
 var scene=load("res://scenes/maps/map11/field_seam_preview.tscn").instantiate(); root.add_child(scene); await physics_frame
 scene.set_physics_process(false)
 check(scene.adapter.runtime_ready(),"geometry ready")
 check(scene.shoulder_count>40 and scene.shoulder_count<100,"bounded shoulders")
 check(scene.fissure_count==30,"disconnected fissure stamps")
 check(scene.forest_instances==152,"G2 forest retained")
 check(scene._surface.polygon==scene.recipe.outer,"decal clipping is approved outer")
 check(scene._surface.clip_children==CanvasItem.CLIP_CHILDREN_AND_DRAW,"no exterior decal bleed")
 check(scene._surface.material.get_shader_parameter("ground").resource_path==scene.GROUND_PATH,"original ground reused")
 var angles: Dictionary={}; var sizes: Dictionary={}; var finite_: bool=true
 for row in scene._decal_rows:
  angles[row.angle]=true; sizes[row.size]=true
  if not row.node.position.is_finite() or not row.node.scale.is_finite(): finite_=false
 check(angles.size()>10 and sizes.size()>8 and finite_,"bounded irregular static transforms")
 check(scene._root_material!=scene._crack_material,"crack mask distinct from shoulder color")
 check(scene._crack_material.get_shader_parameter("fissure")==true,"existing alpha fissure shader")
 check(scene.provider.can_move(Vector2(0,1300),1600),"combat clearing unchanged")
 check(scene.provider.can_move(Vector2(0,-3750),96),"gate unchanged")
 check(not scene.provider.line_of_sight(Vector2(-2800,-550),Vector2(-800,-550)),"LOS mass retained")
 check(scene.receipt().new_images==0,"no generated assets")
 print("SEAM_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"receipt":scene.receipt()}))
 scene.free(); quit(0 if failures==0 else 1)
