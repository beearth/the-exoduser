extends Node2D
## One field region, setup preloads and cached references only during updates.
const Look=preload("res://scripts/maps/map11/target32_layout.gd")
const TEXTURES=[preload("res://assets/maps/map11/target32/left_near.png"),preload("res://assets/maps/map11/target32/left_mid.png"),preload("res://assets/maps/map11/target32/right_mid.png"),preload("res://assets/maps/map11/target32/right_near.png"),preload("res://assets/maps/map11/target32/white_tree.png")]
var rows: Array[Dictionary]=[]
var foreground: Sprite2D
var _camera: Camera2D
var _unlit: CanvasItemMaterial
func _ready() -> void:
 _unlit=CanvasItemMaterial.new();_unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 var floor_:=Sprite2D.new();floor_.name="Target32GroundAndRootAO"
 floor_.texture=preload("res://assets/maps/map11/target32/floor.png")
 floor_.position=Look.CENTER;floor_.scale=Vector2.ONE*Look.SCALE;floor_.z_index=-2980
 var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/target32_ground.gdshader")
 mat.set_shader_parameter("veins",preload("res://assets/maps/map11/target32/veins.png"))
 mat.set_shader_parameter("pulse_strength",Look.PULSE_STRENGTH);mat.set_shader_parameter("pulse_hz",Look.PULSE_HZ)
 floor_.material=mat;add_child(floor_)
 for i in range(TEXTURES.size()):
  var row: Dictionary=Look.SPLIT.data.regions[i]
  var s:=Sprite2D.new();s.name="Target32_"+row.id;s.texture=TEXTURES[i]
  s.position=Look.foot(Vector2(row.source_foot[0],row.source_foot[1]));s.scale=Vector2.ONE*Look.SCALE
  s.centered=false;s.offset=Vector2(row.offset[0],row.offset[1]);s.z_as_relative=false;s.z_index=int(s.position.y/4.0)
  var sway:=ShaderMaterial.new();sway.shader=preload("res://scripts/maps/map11/target32_tree.gdshader")
  sway.set_shader_parameter("white_tree",i==4);s.material=sway;add_child(s)
  rows.append({"sprite":s,"foot":s.position,"rect":Rect2(s.position+s.offset*s.scale,s.texture.get_size()*s.scale)})
 foreground=Sprite2D.new();foreground.name="Target32Parallax";foreground.texture=preload("res://assets/maps/map11/target32/foreground.png")
 foreground.position=Look.CENTER;foreground.scale=Vector2.ONE*Look.SCALE;foreground.z_as_relative=false;foreground.z_index=3490;foreground.material=_unlit;add_child(foreground)
 var fog:=Sprite2D.new();fog.name="Target32LowMist";fog.texture=preload("res://assets/maps/map11/target32/fog.png")
 fog.position=Look.CENTER+Vector2(0,-170);fog.scale=Vector2(5.8,2.2);fog.z_as_relative=false;fog.z_index=1400
 var mist:=ShaderMaterial.new();mist.shader=preload("res://scripts/maps/map11/target32_fog.gdshader")
 mist.set_shader_parameter("fog_color",Look.FOG);mist.set_shader_parameter("opacity",Look.FOG_ALPHA);fog.material=mist;add_child(fog)
 set_process(false);set_physics_process(false)
func update_view(point: Vector2,delta: float) -> void:
 if not is_instance_valid(_camera):_camera=get_viewport().get_camera_2d()
 foreground.position=Look.CENTER+(_camera.get_screen_center_position()-Look.CENTER)*-Look.PARALLAX
 for row in rows:
  var front: bool=row.foot.y>point.y and row.rect.has_point(point-Vector2(0,45))
  row.sprite.modulate.a=move_toward(row.sprite.modulate.a,.20 if front else 1.0,delta*8)
