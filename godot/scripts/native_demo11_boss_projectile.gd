extends "res://scripts/enemy_projectile_physical.gd"
## Ordinary motion/expiry kernel; protected legacy _physics_process is never called.
const POISON=preload("res://assets/boss_parity/poison.png")
signal retired(id: int, reason: String)
var registry_id := 0
var raw: Dictionary = {}
var motion_calls := 0
var draw_calls := 0
var _trail_view: Node2D
func configure_source(id: int, source: Dictionary, profile: Dictionary, target: Node2D, owner_world: Node2D) -> void:
	registry_id = id
	raw = source
	configure(owner_world.to_local(Vector2(raw.x,raw.y)),Vector2(raw.vx,raw.vy),profile,target,owner_world)
	_trail_view=preload("res://scripts/boss11_projectile_trail.gd").new()
	add_child(_trail_view);_trail_view.configure(raw,global_position)
	native_homing_enabled = (raw.get("homing",false) or raw.get("blackBean",false)) and not raw.get("_druidStraight",false)
func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	set_physics_process(false)
	add_to_group("demo11_boss_projectiles")
	collision_layer = 8
	collision_mask = 0
	z_as_relative = false
func _physics_process(_delta: float) -> void:
	# Registry is the sole source-clock driver, including the birth tick.
	pass
func advance_source_motion(sp: float) -> bool:
	motion_calls += 1
	var alive := advance_native_projectile_motion(sp/60.0)
	raw.x = global_position.x
	raw.y = global_position.y
	raw.vx = heading.x*speed/60.0
	raw.vy = heading.y*speed/60.0
	raw.life = life_ticks
	raw.dist = distance_travelled
	if is_instance_valid(_trail_view):_trail_view.sample(global_position)
	return alive
func _end(reason: String) -> void:
	if _ended: return
	_ended = true
	retired.emit(registry_id,reason)
	queue_free()
func _draw() -> void:
	# Existing-asset rendering/semantic silhouettes belong to the render unit.
	# This bounded fallback never changes raw element/class/bean identity.
	draw_calls += 1
	if raw.get("_druidPoison",false) and not raw.get("friendly",false):
		var cell: Vector2=POISON.get_size()/Vector2(4,4);var frame: int=int(Time.get_ticks_msec()/70)%16
		var size_: float=240.0 if raw.get("_druidMine",false) or raw.get("elemBall",false) else clampf(float(raw.get("sz",4))*24,96,180)
		# Source _physicalProjectileMultiplier(p,2): ordinary physical projectile scale.
		size_*=2.0 if raw.get("parryClass","")=="physical" else 1.0
		var h: float=size_*cell.y/cell.x
		draw_texture_rect_region(POISON,Rect2(-size_/2,-h/2,size_,h),Rect2(Vector2(frame%4,frame/4)*cell,cell))
		return
	draw_circle(Vector2.ZERO,maxf(1.0,float(raw.get("sz",1))),Color.from_string(str(raw.get("col","")),Color.WHITE))
