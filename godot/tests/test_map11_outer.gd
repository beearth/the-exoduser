extends SceneTree
const USERDIR="EXODUSER-map11-09-Isolated-20261021"
var checks: int=0
var failures: int=0
func _initialize() -> void: call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok: failures+=1; printerr("OUTER_FAIL ",label)
func run() -> void:
 if ProjectSettings.get_setting("application/config/custom_user_dir_name","")!=USERDIR or not OS.get_user_data_dir().contains(USERDIR): quit(2); return
 print("ISOLATION ",OS.get_user_data_dir())
 var scene=load("res://scenes/maps/map11/field_outer_preview.tscn").instantiate(); root.add_child(scene)
 await physics_frame
 scene.set_physics_process(false)
 check(scene.adapter.runtime_ready(),"compiled geometry ready")
 check(scene.recipe.anchors.size()==14 and scene.recipe.routes.size()==15,"G1 anchors and routes")
 check(scene.forest_instances>100 and scene.forest_instances<250,"bounded large mass assembly")
 for layer in scene.forest_layers: check(scene.forest_layers[layer]>20,"layer populated "+layer)
 for side in scene.forest_sides: check(scene.forest_sides[side]>5,"side populated "+side)
 check(scene._textures.size()==8,"existing eight variants")
 for texture in scene._textures: check(texture.get_image().detect_alpha()!=Image.ALPHA_NONE,"real alpha texture "+texture.resource_path)
 var sorted_: bool=true; var missing: bool=false
 for row in scene._forest_rows:
  if row.node.z_index!=int(row.foot.y*.35): sorted_=false
  if not row.node.get_child(0) is Sprite2D: missing=true
 check(sorted_ and not missing,"all feet drive y sorting")
 var probe: Dictionary={}
 for row in scene._forest_rows:
  var point: Vector2=row.foot-Vector2(0,row.rect.size.y*.5)
  if row.layer=="FRONT" and scene.provider.can_move(point,15):
   probe=row; scene.player.position=point; break
 check(not probe.is_empty(),"legal wall-side occlusion probe exists")
 if not probe.is_empty():
  scene.update_occlusion(1)
  check(probe.node.modulate.a<.151 and scene.player.z_index<probe.node.z_index,"foreground fades with feet order")
  scene.player.position=Vector2.ZERO; scene.update_occlusion(1)
  check(probe.node.modulate.a==1,"forest alpha restores")
 check(scene.provider.can_move(Vector2(0,1300),1600),"main combat clearing unchanged")
 check(scene.provider.can_move(Vector2(0,-3750),96),"gate corridor unchanged")
 check(not scene.provider.line_of_sight(Vector2(-2800,-550),Vector2(-800,-550)),"static LOS unchanged")
 print("OUTER_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"receipt":scene.receipt()}))
 scene.free(); quit(0 if failures==0 else 1)
