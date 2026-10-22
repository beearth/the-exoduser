extends Node2D
## Composition preserves the exact existing World script identity for PC frames.
const Runtime=preload("res://scripts/maps/map11/field_runtime.gd")
var provider: Node2D
var sites: Dictionary={}
var start_marker: Marker2D
var field_view: Node2D
var arena_view: Node2D
var active_space: String="field"
func _ready() -> void:
 process_physics_priority=4
 provider=Runtime.new();provider.name="Map11Provider";add_child(provider)
 if not provider.runtime_ready():return
 sites=provider.transition_sites()
 for row in provider.anchors("player_start"):start_marker=row.marker
 field_view=preload("res://scripts/maps/map11/web_field_view.gd").new();add_child(field_view)
 arena_view=Node2D.new();arena_view.position=Runtime.ARENA_OFFSET;add_child(arena_view);arena_view.hide()
func current() -> bool:
 return is_instance_valid(provider) and provider.runtime_ready() and is_instance_valid(start_marker)
func activate_space(space: String) -> bool:
 if not current() or space not in ["field","arena"]:return false
 if space!=active_space:
  _frame_arrival(space)
 active_space=space;field_view.visible=space=="field";arena_view.visible=space=="arena";return true
var boss_visual: Node2D
var boss_camera: Node
var _arrival_tween: Tween
var _arrival_camera: Camera2D
func _frame_arrival(space: String) -> void:
 if _arrival_tween!=null:_arrival_tween.kill()
 _finish_arrival()
 if is_instance_valid(boss_camera):boss_camera.set_arena(space=="arena")
func _finish_arrival() -> void:
 if is_instance_valid(_arrival_camera):
  get_parent().get_parent().camera.make_current()
  _arrival_camera.queue_free();_arrival_camera=null
func can_move(point: Vector2,radius: float) -> bool:
 # Provider queries perform the complete runtime_ready check themselves.
 return is_instance_valid(provider) and is_instance_valid(start_marker) and provider.can_move(point,radius,active_space)
func line_of_sight(a: Vector2,b: Vector2) -> bool:
 return is_instance_valid(provider) and is_instance_valid(start_marker) and provider.line_of_sight(a,b,active_space)

var _fade: ColorRect
var _fade_tween: Tween
var _actor: Node2D
var _fog_pass: Node
var lighting_look: Node2D
func _physics_process(delta: float) -> void:
 if not is_instance_valid(_actor):
  _actor=get_parent().get_parent().get("player")
  if is_instance_valid(_actor):
   field_view.configure(get_parent().get_parent())
   # Preserve the existing PC boss-state visual reader; it owns no concept-map resources.
   boss_visual=preload("res://scripts/boss11_visual_reader.gd").new();boss_visual.z_index=349;add_child(boss_visual);boss_visual.configure(get_parent().get_parent())
 if not is_instance_valid(_actor):return
 if is_instance_valid(boss_visual):boss_visual.visible=active_space=="arena"
 if active_space=="field":field_view.update_product(_actor.global_position,delta)
 else:
  # Source 35722-35739 nominal boss camera. No concept zoom/offset or actor scaling.
  var main: Node=get_parent().get_parent()
  var enemy: Dictionary=main.native_demo_boss_actor.get("_enemy") if is_instance_valid(main.native_demo_boss_actor) else {}
  var target: Vector2=_actor.global_position
  var alive: bool=enemy.get("alive",false)
  if alive:target=(target+Vector2(enemy.get("x",target.x),enemy.get("y",target.y)))*.5
  var ticks: float=delta*60
  main.camera.global_position=main.camera.global_position.lerp(target,1-pow(.92,ticks))
  main.camera.zoom=main.camera.zoom.lerp(Vector2.ONE*(.80 if alive else 1.0),1-pow(.94,ticks))
func _transition_fade() -> void:
 if not is_instance_valid(_fade):
  var layer:=CanvasLayer.new();layer.layer=90;add_child(layer)
  _fade=ColorRect.new();_fade.color=Color(0,0,0,0);_fade.mouse_filter=Control.MOUSE_FILTER_IGNORE;_fade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);layer.add_child(_fade)
 if _fade_tween!=null:_fade_tween.kill()
 _fade.color.a=.75
 _fade_tween=create_tween();_fade_tween.tween_property(_fade,"color:a",0.0,.22)
