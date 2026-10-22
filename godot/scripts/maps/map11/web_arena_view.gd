extends Node2D
## Original browser _buildStreamChunk export. No concept artwork or straight overlay bands.
var _main: Node
var _chunks: Array[Sprite2D]=[]
var _portal: Sprite2D
var _portal_core: Sprite2D
var visual_clock_ms: float=-1
var _point: Sprite2D
var _grade_layer: CanvasLayer
var _screen: Node
const EMPTY: Dictionary={}
func _ready() -> void:
 var data: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://assets/boss_parity/arena.json"))
 var step: int=data.chunk*40
 for y in range(int(ceil(108.0/data.chunk))):
  for x in range(int(ceil(128.0/data.chunk))):
   var tile:=Sprite2D.new();tile.texture=load("res://assets/boss_parity/arena_%d_%d.png"%[x,y]);tile.centered=false;tile.position=Vector2(x*step,y*step)-Vector2(2580,2180);tile.z_index=-3000;tile.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(tile);_chunks.append(tile)
 _portal=Sprite2D.new();_portal.texture=preload("res://assets/map/web_parity/portal.png");_portal.position=Vector2(0,-2120);_portal.z_index=-2599;_portal.modulate.a=.9;_portal.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_portal)
 _portal_core=Sprite2D.new();_portal_core.texture=_portal.texture;_portal_core.position=_portal.position;_portal_core.z_index=-2598;_portal_core.modulate.a=.45;_portal_core.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(_portal_core)
 _point=Sprite2D.new();_point.physics_interpolation_mode=Node.PHYSICS_INTERPOLATION_MODE_OFF;_point.texture=preload("res://assets/map/web_parity/detail02/point.png");_point.z_index=-2700;add_child(_point)
func configure(main: Node) -> void:
 _main=main
 _screen=main.get_node("NativeScreenLighting")
 _grade_layer=CanvasLayer.new();_grade_layer.layer=4;add_child(_grade_layer)
 var rect:=ColorRect.new();rect.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);rect.mouse_filter=Control.MOUSE_FILTER_IGNORE
 var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_grade.gdshader");mat.set_shader_parameter("grade_enabled",0.0);mat.set_shader_parameter("lift_enabled",0.0);mat.set_shader_parameter("vignette_enabled",0.0) # Source live _ATMDBG grade/lift/vig are all 0; constants do not enable gates.
 rect.material=mat;_grade_layer.add_child(rect)
func _process(_delta: float) -> void:
 if is_instance_valid(_screen):
  var e: Dictionary=_main.native_demo_boss_actor.get("_enemy")
  _screen.set_arena_source_fog_disabled(is_visible_in_tree())
  _screen.observe_arena_boss_light(e if is_visible_in_tree() and _main.source_state.read_current_g().get("bossAlive",false) and not e.is_empty() else EMPTY)
 if is_instance_valid(_grade_layer):_grade_layer.visible=is_visible_in_tree()
 if not is_visible_in_tree() or not is_instance_valid(_main):return
 var g: Dictionary=_main.source_state.read_current_g()
 _portal.visible=not g.get("bossAlive",true);_portal_core.visible=_portal.visible
 render_at(visual_clock_ms if visual_clock_ms>=0 else float(Time.get_ticks_msec()))
 _point.global_position=_main.player.global_position
 var center: Vector2=_main.camera.global_position-global_position
 for chunk in _chunks:chunk.visible=Rect2(chunk.position,chunk.texture.get_size()).grow(1400).has_point(center)

# Snapshot 18299–18313 / 52019–52023: cleared exit uses the ORIGINAL portal,
# not the blue-tinted field gate (18351–18364 / 52042). T=40, exit sz=T*3.
func render_at(now: float) -> void:
 var pulse:=120+sin(now/400)*120*.12
 _portal.scale=Vector2.ONE*pulse/_portal.texture.get_width()
 _portal_core.scale=_portal.scale*.55
 _portal.rotation=now/2000
 _portal_core.rotation=now/2000-now/800
