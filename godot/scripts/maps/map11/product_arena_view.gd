extends "res://scripts/maps/map11/arena_preview.gd"
## Original arena floor/props only. Product Main owns actual actors and camera.
func _ready() -> void:
 _build_floor();_build_props();set_process(false);set_physics_process(false)

 set_process_input(false);set_process_unhandled_input(false);set_process_unhandled_key_input(false)
