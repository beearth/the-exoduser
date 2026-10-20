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
 var heights: Dictionary={}; var widths: Dictionary={}; var tones: Dictionary={}; var rotations: Dictionary={}
 var bounds_ok: bool=true; var depth_ok: bool=true; var regional_ok: bool=true
 for row in scene._forest_rows:
  var sprite: Sprite2D=row.node.get_child(0)
  heights[row.height_factor]=true; widths[row.width_factor]=true; tones[row.brightness]=true; rotations[sprite.rotation]=true
  var size_: Vector2=sprite.texture.get_size()
  for corner in [Vector2.ZERO,Vector2(size_.x,0),size_,Vector2(0,size_.y)]:
   if not row.rect.has_point(row.foot+sprite.transform*(sprite.offset+corner)): bounds_ok=false
  var material_: ShaderMaterial=sprite.material
  if not is_equal_approx(material_.get_shader_parameter("fog"),.48 if row.layer=="BACK" else (.13 if row.layer=="MID" else .0)): depth_ok=false
  if material_.get_shader_parameter("west")!=(1.0 if row.side=="LEFT" else .0) or material_.get_shader_parameter("east")!=(1.0 if row.side=="RIGHT" else .0): regional_ok=false
 check(heights.size()==7 and widths.size()==5 and tones.size()==6 and rotations.size()==6,"setup diversity")
 check(bounds_ok,"rotated sprite cached occlusion AABB")
 check(depth_ok,"BACK fog attenuation distinct from MID FRONT")
 check(regional_ok,"west dry east muted reflection lower forest")
 check(scene.receipt().new_images==0,"no generated assets")
 print("SEAM_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"receipt":scene.receipt()}))
 scene.free(); quit(0 if failures==0 else 1)
