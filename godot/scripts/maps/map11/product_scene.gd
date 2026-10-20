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
 active_space=space;field_view.visible=space=="field";arena_view.visible=space=="arena";return true
func can_move(point: Vector2,radius: float) -> bool:
 return current() and provider.can_move(point,radius,active_space)
func line_of_sight(a: Vector2,b: Vector2) -> bool:
 return current() and provider.line_of_sight(a,b,active_space)
