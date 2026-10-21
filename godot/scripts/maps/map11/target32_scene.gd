extends Node2D
## One field region, setup preloads and cached references only during updates.
const Look=preload("res://scripts/maps/map11/target32_layout.gd")
const TEXTURES=[preload("res://assets/maps/map11/finish33/left_near.png"),preload("res://assets/maps/map11/finish33/left_mid.png"),preload("res://assets/maps/map11/finish33/right_mid.png"),preload("res://assets/maps/map11/finish33/right_near.png"),preload("res://assets/maps/map11/finish33/white_tree.png")]
var rows: Array[Dictionary]=[]
var foreground: Array[Dictionary]=[]
var layers: Array[Dictionary]=[]
var _camera: Camera2D
var _unlit: CanvasItemMaterial
func _ready() -> void:
 _unlit=CanvasItemMaterial.new();_unlit.light_mode=CanvasItemMaterial.LIGHT_MODE_UNSHADED
 for layer in preload("res://scripts/maps/map11/upscale01_tiles.gd").mount(self,"field",Look.CENTER,Look.SCALE,-2980):layers.append(layer)
 for i in range(TEXTURES.size()):
  var row: Dictionary=Look.SPLIT.data.regions[i]
  var s:=Sprite2D.new();s.name="Target32_"+row.id;s.texture=TEXTURES[i]
  s.position=Look.foot(Vector2(row.source_foot[0],row.source_foot[1]));s.scale=Vector2.ONE*Look.SCALE/1.5
  s.centered=false;s.offset=Vector2(row.offset[0],row.offset[1])*1.5;s.z_as_relative=false;s.z_index=int(s.position.y/4.0)
  var sway:=ShaderMaterial.new();sway.shader=preload("res://scripts/maps/map11/target32_tree.gdshader")
  sway.set_shader_parameter("white_tree",i==4);s.material=sway if i==4 else _unlit;add_child(s)
  rows.append({"sprite":s,"foot":s.position,"rect":Rect2(s.position+s.offset*s.scale,s.texture.get_size()*s.scale)})
 var fragments: Array=preload("res://assets/maps/map11/target32/bake_32b.json").data.foreground
 var fg_textures=[preload("res://assets/maps/map11/finish33/foreground_0.png"),preload("res://assets/maps/map11/upscale01/target32/foreground_32b_1.png")]
 for i in range(fragments.size()):
  var box: Array=fragments[i].source_box
  var fg:=Sprite2D.new();fg.name="Target32Parallax%d"%i;fg.texture=fg_textures[i]
  var center: Vector2=Look.CENTER+(Vector2((box[0]+box[2])*.5,(box[1]+box[3])*.5)-Vector2(1000,562.5))*Look.SCALE
  fg.position=center;fg.scale=Vector2.ONE*Look.SCALE/1.5;fg.z_as_relative=false;fg.z_index=3490;fg.material=_unlit;add_child(fg)
  foreground.append({"sprite":fg,"center":center})
 var fog:=Sprite2D.new();fog.name="Target32LowMist";fog.texture=preload("res://assets/maps/map11/target32/fog.png")
 fog.position=Look.CENTER+Vector2(0,-170);fog.scale=Vector2(5.8,2.2);fog.z_as_relative=false;fog.z_index=1400
 var mist:=ShaderMaterial.new();mist.shader=preload("res://scripts/maps/map11/target32_fog.gdshader")
 mist.set_shader_parameter("fog_color",Look.FOG);mist.set_shader_parameter("opacity",Look.FOG_ALPHA);fog.material=mist;add_child(fog)
 layers.append({"node":fog,"rect":Rect2(fog.position-fog.texture.get_size()*fog.scale*.5,fog.texture.get_size()*fog.scale)})
 preload("res://scripts/maps/map11/north32c_tour.gd").mount(self,_unlit)
 set_process(false);set_physics_process(false)
func update_view(point: Vector2,delta: float) -> void:
 if not is_instance_valid(_camera):_camera=get_viewport().get_camera_2d()
 var size_: Vector2=get_viewport_rect().size/_camera.zoom
 var view:=Rect2(_camera.get_screen_center_position()-size_*.5,size_).grow(80)
 for layer in layers:layer.node.visible=view.intersects(layer.rect)
 for fg in foreground:
  fg.sprite.position=fg.center+(_camera.get_screen_center_position()-Look.CENTER)*-Look.PARALLAX
  fg.sprite.visible=view.intersects(Rect2(fg.sprite.position-fg.sprite.texture.get_size()*Look.SCALE/1.5*.5,fg.sprite.texture.get_size()*Look.SCALE/1.5))
 for row in rows:
  row.sprite.visible=view.intersects(row.rect)
  if not row.sprite.visible:continue
  var front: bool=row.foot.y>point.y and row.rect.has_point(point-Vector2(0,45))
  row.sprite.modulate.a=move_toward(row.sprite.modulate.a,.20 if front else 1.0,delta*8)
