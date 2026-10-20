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
 provider=Runtime.new();provider.name="Map11Provider";add_child(provider)
 if not provider.runtime_ready():return
 sites=provider.transition_sites()
 for row in provider.anchors("player_start"):start_marker=row.marker
 field_view=preload("res://scripts/maps/map11/product_field_view.gd").new();add_child(field_view)
 arena_view=preload("res://scripts/maps/map11/product_arena_view.gd").new()
 arena_view.position=Runtime.ARENA_OFFSET;arena_view.z_index=-2500;add_child(arena_view);arena_view.hide()
func current() -> bool:
 return is_instance_valid(provider) and provider.runtime_ready() and is_instance_valid(start_marker)
func activate_space(space: String) -> bool:
 if not current() or space not in ["field","arena"]:return false
 if space!=active_space:_transition_fade()
 active_space=space;field_view.visible=space=="field";arena_view.visible=space=="arena";return true
func can_move(point: Vector2,radius: float) -> bool:
 return current() and provider.can_move(point,radius,active_space)
func line_of_sight(a: Vector2,b: Vector2) -> bool:
 return current() and provider.line_of_sight(a,b,active_space)

var _fade: ColorRect
var _fade_tween: Tween
var _actor: Node2D
var _fog_pass: Node
var lighting_look: Node2D
func _physics_process(delta: float) -> void:
 # Resolve the product actor once after Main setup, then use cached references.
 if not is_instance_valid(_actor):
  _actor=get_parent().get_parent().get("player")
  if is_instance_valid(_actor):
   _fog_pass=preload("res://scripts/maps/map11/fog_pass.gd").new();add_child(_fog_pass)
   _fog_pass.configure(get_parent().get_parent())
   lighting_look=preload("res://scripts/maps/map11/product_lighting.gd").new()
   add_child(lighting_look)
   lighting_look.configure_product(self,get_parent().get_parent())
   var detail:=preload("res://scripts/maps/map11/product_detail.gd").new();detail.name="MAP11Detail";add_child(detail)
   detail.configure(self,get_parent().get_parent())
   get_parent().get_parent().camera.zoom=Vector2.ONE*.70
   get_parent().get_parent().camera.offset=Vector2(0,-180)
 if not is_instance_valid(_actor):return
 if active_space=="field":field_view.update_product(field_view.to_local(_actor.global_position),delta)
 else:arena_view.update_product_occlusion(arena_view.to_local(_actor.global_position),delta)
func _transition_fade() -> void:
 if not is_instance_valid(_fade):
  var layer:=CanvasLayer.new();layer.layer=90;add_child(layer)
  _fade=ColorRect.new();_fade.color=Color(0,0,0,0);_fade.mouse_filter=Control.MOUSE_FILTER_IGNORE;_fade.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);layer.add_child(_fade)
 if _fade_tween!=null:_fade_tween.kill()
 _fade.color.a=.75
 _fade_tween=create_tween();_fade_tween.tween_property(_fade,"color:a",0.0,.22)
