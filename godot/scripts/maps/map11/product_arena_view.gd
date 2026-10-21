extends "res://scripts/maps/map11/arena_legacy_view.gd"
## MAP11-30: one scene decomposed from the approved target. No geometry/actor writes.
const TargetLook=preload("res://scripts/maps/map11/target30_look.gd")
const SURFACE=preload("res://scripts/maps/map11/target30_surface.gdshader")
var _target_rows: Array[Dictionary]=[]
var _foreground: Sprite2D
var _target_camera: Camera2D
var _target_origin:=Vector2.ZERO
func _ready() -> void:
 super._ready()
 # Retain baseline identifiers/collision, suppress incompatible visual pieces only.
 for child in get_children():
  if child is CanvasItem:child.hide()
 _ritual.hide()
 for row in _rim_sprites:
  row.sprite.set_meta("finale_retired",true)
 _mount_target()
func _mount_target() -> void:
 var surface:=ShaderMaterial.new();surface.shader=SURFACE
 surface.set_shader_parameter("ground",true)
 surface.set_shader_parameter("legacy_curve",TargetLook.LEGACY_CURVE)
 surface.set_shader_parameter("pulse_mask",TargetLook.VEINS)
 surface.set_shader_parameter("pulse_strength",TargetLook.VEIN_STRENGTH)
 surface.set_shader_parameter("pulse_hz",TargetLook.PULSE_HZ)
 surface.set_shader_parameter("glow_color",TargetLook.GLOW)
 var floor_:=Sprite2D.new();floor_.name="Target30Floor";floor_.texture=TargetLook.FLOOR
 floor_.scale=Vector2.ONE*TargetLook.FLOOR_EXTENT/4096.0;floor_.z_index=-449;floor_.material=surface;add_child(floor_)
 var pods:=ShaderMaterial.new();pods.shader=SURFACE
 pods.set_shader_parameter("legacy_curve",TargetLook.LEGACY_CURVE)
 pods.set_shader_parameter("pod_scale",TargetLook.POD_SCALE);pods.set_shader_parameter("pod_glow",TargetLook.POD_GLOW)
 pods.set_shader_parameter("pulse_hz",TargetLook.PULSE_HZ);pods.set_shader_parameter("glow_color",TargetLook.GLOW)
 var unlit:=CanvasItemMaterial.new();unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 var back:=Sprite2D.new();back.name="Target30BackMass";back.texture=TargetLook.BACKMASS
 back.scale=Vector2.ONE*2.9;back.offset=Vector2(0,12.5);back.z_index=-451;back.material=unlit;back.modulate=Color(.70,.70,.74,1);add_child(back)
 var rows: Array=TargetLook.SPLIT.data.regions
 for i in range(rows.size()):
  var row: Dictionary=rows[i];var foot:=Vector2(row.foot[0],row.foot[1])
  var offset_:=Vector2(row.offset[0],row.offset[1])
  var sprite:=Sprite2D.new();sprite.name="Target30_"+row.id;sprite.texture=TargetLook.TEXTURES[i][0]
  sprite.centered=false;sprite.offset=offset_;sprite.scale=Vector2.ONE*row.scale;sprite.position=foot
  sprite.material=pods;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  GroundContact.depth(sprite,global_position+foot);add_child(sprite)
  var rect:=Rect2(foot+offset_*row.scale,sprite.texture.get_size()*row.scale)
  _target_rows.append({"sprite":sprite,"rect":rect})
  for part in [1,2]:
   var apron:=Sprite2D.new();apron.name=("Target30Root_" if part==1 else "Target30Contact_")+row.id
   apron.texture=TargetLook.TEXTURES[i][part];apron.centered=false;apron.offset=offset_
   apron.scale=sprite.scale;apron.position=foot;apron.z_index=-447 if part==1 else -448;apron.material=unlit
   add_child(apron)
 var mist:=Polygon2D.new();mist.name="Target30PerimeterMist";mist.polygon=_circle_points(Vector2.ZERO,2820,128)
 var uv:=PackedVector2Array()
 for p in mist.polygon:uv.append((p+Vector2.ONE*2820)/5640)
 mist.uv=uv;mist.texture=TargetLook.FOG_TEXTURE;mist.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED;mist.z_index=700
 var fog_mat:=ShaderMaterial.new();fog_mat.shader=preload("res://scripts/maps/map11/target30_atmosphere.gdshader")
 fog_mat.set_shader_parameter("fog_color",TargetLook.FOG);fog_mat.set_shader_parameter("fog_alpha",TargetLook.FOG_ALPHA);fog_mat.set_shader_parameter("fog_radii",TargetLook.FOG_RADII)
 mist.material=fog_mat;add_child(mist)
 _foreground=Sprite2D.new();_foreground.name="Target30ParallaxBranches";_foreground.texture=TargetLook.FOREGROUND
 _foreground.centered=false;_foreground.offset=Vector2(-1000,0);_foreground.scale=Vector2.ONE*2.8
 _foreground.position=Vector2(0,1180);_foreground.material=unlit;_foreground.z_as_relative=false;_foreground.z_index=3490;add_child(_foreground)
func retire_legacy_finale() -> void:
 # Called once after its collision bodies are mounted. Their byte-level recipe stays.
 for row in _rim_sprites:
  row.sprite.hide();row.sprite.set_meta("finale_retired",true)
 for child in get_children():
  if child.has_meta("contact_source"):child.hide()
func update_product_occlusion(point: Vector2,delta: float) -> void:
 if not is_instance_valid(_target_camera):
  _target_camera=get_viewport().get_camera_2d()
  _target_origin=_target_camera.get_screen_center_position()-global_position
 var view:=_camera_rect()
 for row in _target_rows:
  var sprite: Sprite2D=row.sprite
  sprite.visible=view.intersects(row.rect)
  if not sprite.visible:continue
  var fade: float=.25 if row.rect.has_point(point) and sprite.position.y>point.y else 1.0
  sprite.modulate.a=move_toward(sprite.modulate.a,fade,delta*8.0)
 _foreground.position=Vector2(0,1180)-(_target_camera.get_screen_center_position()-global_position-_target_origin)*TargetLook.PARALLAX
