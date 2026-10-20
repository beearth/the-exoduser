extends "res://scripts/enemy_tank_physical_spine_beast.gd"
## Group-A registration bridge. Original actor/kernel is unchanged.
var _a_last_frame := -1.0
var a_phase_calls := 0
var a_measure:=false
var a_cpu_usec:=0
var a_pending: Dictionary = {}
var a_bash_owner: Callable
func is_native_registry_ready() -> bool:
	return data.get("etype")==4 and data.get("a_constructor")=="source_mkEn_stage0_normal_v1" and is_instance_valid(world)
func _ready() -> void:
	super._ready()
	set_physics_process(false)
func _physics_process(_delta: float) -> void:pass
func advance_native_phase(sp: float,frame: float,_enemies: Array) -> void:
	if not alive or frame<=_a_last_frame or not is_finite(sp) or sp<0:return
	_a_last_frame=frame;a_phase_calls+=1
	var started: int=Time.get_ticks_usec() if a_measure else 0
	data.native_final.reviveIframes=maxf(0.0,float(data.native_final.get("reviveIframes",0.0))-sp)
	super._physics_process(sp/float(data.native_tick_rate))
	if a_measure:a_cpu_usec+=Time.get_ticks_usec()-started
func _fire_projectile() -> void:
	preload("res://scripts/native_demo11_etype_a_projectiles.gd").fire(self,global_position,data.projectile)
