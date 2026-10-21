extends Node
## Presentation only: no gate/clear/actor state writes.
const ARENA_ZOOM=0.36
const TRANSITION_SECONDS=1.0
const ARENA_CENTER_WEIGHT=0.85
var camera: Camera2D
var player: Node2D
var center:=Vector2.ZERO
var original_zoom:=Vector2.ONE
var blend:=0.0
var _from:=0.0
var _target:=0.0
var _elapsed:=1.0
func configure(view: Camera2D,actor: Node2D,arena_center: Vector2) -> void:
 camera=view;player=actor;center=arena_center
 original_zoom=camera.zoom
 process_physics_priority=100
func set_arena(enabled: bool) -> void:
 var next:=1.0 if enabled else 0.0
 if next==_target:return
 _from=blend;_target=next;_elapsed=0
func _physics_process(delta: float) -> void:
 if not is_instance_valid(camera) or not is_instance_valid(player):return
 _elapsed=minf(TRANSITION_SECONDS,_elapsed+delta)
 var t:=_elapsed/TRANSITION_SECONDS
 blend=lerpf(_from,_target,t*t*(3.0-2.0*t))
 camera.zoom=original_zoom.lerp(Vector2.ONE*ARENA_ZOOM,blend)
 camera.global_position=player.global_position.lerp(center,blend*ARENA_CENTER_WEIGHT)
