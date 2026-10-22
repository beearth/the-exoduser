extends Node2D
## Original browser _buildStreamChunk export. No concept artwork or straight overlay bands.
var _main: Node
var _chunks: Array[Sprite2D]=[]
var _portal: Sprite2D
var _grade_layer: CanvasLayer
func _ready() -> void:
 var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://assets/boss_parity/arena.json"))
 var step: int=data.chunk*40
 for y in range(int(ceil(108.0/data.chunk))):
  for x in range(int(ceil(128.0/data.chunk))):
   var tile:=Sprite2D.new();tile.texture=load("res://assets/boss_parity/arena_%d_%d.png"%[x,y]);tile.centered=false;tile.position=Vector2(x*step,y*step)-Vector2(2580,2180);tile.z_index=-3000;tile.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(tile);_chunks.append(tile)
 _portal=Sprite2D.new();_portal.texture=preload("res://assets/map/web_parity/portal_blue.png");_portal.position=Vector2(0,-2100);_portal.z_index=-2599;_portal.scale=Vector2.ONE*.6;add_child(_portal)
func configure(main: Node) -> void:
 _main=main
 _grade_layer=CanvasLayer.new();_grade_layer.layer=4;add_child(_grade_layer)
 var rect:=ColorRect.new();rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);rect.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_grade.gdshader");mat.set_shader_parameter("grade_enabled",1.0);mat.set_shader_parameter("lift_enabled",1.0);mat.set_shader_parameter("vignette_enabled",1.0)
 rect.material=mat;_grade_layer.add_child(rect)
func _process(_delta: float) -> void:
 if is_instance_valid(_grade_layer):_grade_layer.visible=is_visible_in_tree()
 if not is_visible_in_tree() or not is_instance_valid(_main):return
 var g: Dictionary=_main.source_state.read_current_g()
 _portal.visible=not g.get("bossAlive",true)
 var center: Vector2=_main.camera.global_position-global_position
 for chunk in _chunks:chunk.visible=Rect2(chunk.position,chunk.texture.get_size()).grow(1400).has_point(center)
