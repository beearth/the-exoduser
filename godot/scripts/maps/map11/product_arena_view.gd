extends Node2D
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
var _rim_sprites: Array[Dictionary]=[]
## MAP11-30: one scene decomposed from the approved target. No geometry/actor writes.
const TargetLook=preload("res://scripts/maps/map11/target30_look.gd")
const SURFACE=preload("res://scripts/maps/map11/target30_surface.gdshader")
var _floor_tiles: Array[Dictionary]=[]
var _target_rows: Array[Dictionary]=[]
var _foreground: Node2D
var _target_camera: Camera2D
var _target_origin:=Vector2.ZERO
func _ready() -> void:
 # The provider owns collision; legacy art was built only to be hidden here.
 # Keep the accepted scene API/arrays; omit the retired visual setup.
 set_process(false);set_physics_process(false)
 set_process_input(false);set_process_unhandled_input(false);set_process_unhandled_key_input(false)
 _mount_target()
func _mount_target() -> void:
 _floor_tiles=preload("res://scripts/maps/map11/upscale01_tiles.gd").mount(self,"arena",TargetLook.SCREEN_CENTER,TargetLook.SOURCE_SCALE,-449)
 var pods:=ShaderMaterial.new();pods.shader=SURFACE
 pods.set_shader_parameter("legacy_curve",TargetLook.LEGACY_CURVE)
 pods.set_shader_parameter("pod_scale",TargetLook.POD_SCALE);pods.set_shader_parameter("pod_glow",TargetLook.POD_GLOW)
 pods.set_shader_parameter("pulse_hz",TargetLook.PULSE_HZ);pods.set_shader_parameter("glow_color",TargetLook.GLOW)
 var unlit:=CanvasItemMaterial.new();unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 var rows: Array=TargetLook.SPLIT.data.regions
 for i in range(rows.size()):
  var row: Dictionary=rows[i];var foot:=Vector2(row.foot[0],row.foot[1])
  var offset_:=Vector2(row.offset[0],row.offset[1])
  var sprite:=Sprite2D.new();sprite.name="Target30_"+row.id;sprite.texture=TargetLook.TEXTURES[i][0]
  sprite.centered=false;sprite.offset=offset_*2.0;sprite.scale=Vector2.ONE*row.scale/2.0;sprite.position=foot
  var local_mat: ShaderMaterial=pods.duplicate()
  local_mat.set_shader_parameter("source_box",Vector4(row.box[0],row.box[1],row.box[2]-row.box[0],row.box[3]-row.box[1]))
  # Preserve all tissue ellipses intersecting each crop, including the west feather overlap.
  var pod_regions: Array[Vector4]=[Vector4(215,298,65,85),Vector4.ZERO,Vector4.ZERO,Vector4(1268,78,55,70),Vector4(1820,502,70,80),Vector4(215,298,65,85),Vector4.ZERO]
  var mouth_regions: Array[Vector4]=[Vector4(310,215,70,95),Vector4.ZERO,Vector4.ZERO,Vector4.ZERO,Vector4(1785,363,110,85),Vector4.ZERO,Vector4.ZERO]
  local_mat.set_shader_parameter("pod_region",pod_regions[i])
  local_mat.set_shader_parameter("mouth_region",mouth_regions[i])
  sprite.material=local_mat;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  GroundContact.depth(sprite,global_position+foot);add_child(sprite)
  var rect:=Rect2(foot+offset_*row.scale,sprite.texture.get_size()*row.scale/2.0)
  _target_rows.append({"sprite":sprite,"rect":rect})
 var mist:=Polygon2D.new();mist.name="Target30PerimeterMist";mist.polygon=_circle_points(Vector2.ZERO,2820,128)
 # The inner disc has exactly zero fog alpha. Omit it rather than shading it.
 var ring:=mist.polygon
 ring.append_array(_circle_points(Vector2.ZERO,1450,128))
 mist.polygon=ring
 var faces: Array[PackedInt32Array]=[]
 for i in range(128):
  var next: int=(i+1)%128
  faces.append(PackedInt32Array([i,next,next+128,i+128]))
 mist.polygons=faces
 var uv:=PackedVector2Array()
 for p in mist.polygon:uv.append((p+Vector2.ONE*2820)/5640)
 mist.uv=uv;mist.texture=TargetLook.FOG_TEXTURE;mist.texture_repeat=CanvasItem.TEXTURE_REPEAT_ENABLED;mist.z_index=700
 var fog_mat:=ShaderMaterial.new();fog_mat.shader=preload("res://scripts/maps/map11/target30_atmosphere.gdshader")
 fog_mat.set_shader_parameter("fog_color",TargetLook.FOG);fog_mat.set_shader_parameter("fog_alpha",TargetLook.FOG_ALPHA);fog_mat.set_shader_parameter("fog_radii",TargetLook.FOG_RADII)
 mist.material=fog_mat;add_child(mist)
 _foreground=Node2D.new();_foreground.name="Target30ParallaxBranches"
 _foreground.position=Vector2(0,(820-562.5)*TargetLook.SOURCE_SCALE+120);add_child(_foreground)
 var fg_textures=[preload("res://assets/maps/map11/upscale01/target30/foreground_0.png"),preload("res://assets/maps/map11/upscale01/target30/foreground_1.png")]
 for i in range(2):
  var fg:=Sprite2D.new();fg.texture=fg_textures[i];fg.centered=false
  fg.position=Vector2((-1000+i*1000)*TargetLook.SOURCE_SCALE,0);fg.scale=Vector2.ONE*TargetLook.SOURCE_SCALE/2.0
  fg.material=unlit;fg.z_as_relative=false;fg.z_index=3490;_foreground.add_child(fg)

func retire_legacy_finale() -> void:
 # Replace hidden legacy foot circles with this scene's unprojected ground feet.
 var feet: StaticBody2D=get_node("FinaleExteriorFootCircles")
 for child in feet.get_children():
  feet.remove_child(child);child.queue_free()
 for row in TargetLook.SPLIT.data.regions:
  var collision:=CollisionShape2D.new();var shape:=CircleShape2D.new();shape.radius=90
  collision.shape=shape;collision.position=Vector2(row.collision_foot[0],row.collision_foot[1])
  assert(collision.position.length()-shape.radius>1700)
  feet.add_child(collision)
 for row in _rim_sprites:
  row.sprite.hide();row.sprite.set_meta("finale_retired",true)
 for child in get_children():
  if child.has_meta("contact_source"):child.hide()
func update_product_occlusion(point: Vector2,delta: float) -> void:
 if not is_instance_valid(_target_camera):
  _target_camera=get_viewport().get_camera_2d()
  _target_origin=_target_camera.get_screen_center_position()-global_position
 var view:=_camera_rect()
 for tile in _floor_tiles:tile.node.visible=view.intersects(tile.rect)
 for row in _target_rows:
  var sprite: Sprite2D=row.sprite
  sprite.visible=view.intersects(row.rect)
  if not sprite.visible:continue
  var fade: float=.25 if row.rect.has_point(point) and sprite.position.y>point.y else 1.0
  sprite.modulate.a=move_toward(sprite.modulate.a,fade,delta*8.0)
 _foreground.position=Vector2(0,(820-562.5)*TargetLook.SOURCE_SCALE+120)-(_target_camera.get_screen_center_position()-global_position-_target_origin)*TargetLook.PARALLAX

# Same presentation helpers, with no legacy renderer/preload dependency.
func _circle_points(center: Vector2,radius: float,count: int=128) -> PackedVector2Array:
 var points:=PackedVector2Array()
 for i in range(count):points.append(center+Vector2.from_angle(TAU*float(i)/count)*radius)
 return points
func _camera_rect() -> Rect2:
 var inverse:=get_global_transform_with_canvas().affine_inverse()
 var size_: Vector2=get_viewport_rect().size
 return Rect2(inverse*Vector2.ZERO,size_/get_viewport().get_camera_2d().zoom).grow(100)
