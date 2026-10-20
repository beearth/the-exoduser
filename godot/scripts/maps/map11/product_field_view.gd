extends "res://scripts/maps/map11/field_preview.gd"
## Same authored visuals; no preview Player, UI, camera, colliders or input.
func _ready() -> void:
 recipe=load("res://scripts/maps/map11/field_recipe.tres")
 _build_ground();_build_mass();set_process(false);set_physics_process(false)

 set_process_input(false);set_process_unhandled_input(false);set_process_unhandled_key_input(false)
