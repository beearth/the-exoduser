extends Node
## Existing World clock, after managed owner phase. No delta clock.
var world: Node2D
var actors: Array[WeakRef]=[]
var _frame:=-1.0
func _ready() -> void:process_physics_priority=1
func _physics_process(_delta: float) -> void:
	if not is_instance_valid(world):return
	var f: float=world.get_native_frame()
	if f<=_frame:return
	_frame=f
	var sp: float=world.get_native_projectile_fx_context().dt_sp
	for ref in actors:
		var a: Node=ref.get_ref()
		if not is_instance_valid(a):continue
		var next: Array=[]
		for warning in a.a_warnings:
			if not a.alive or a._stun_ticks>0 or float(a.data.native_final.get("_frozen",0))>0:continue
			warning.t-=sp
			if warning.t>0:next.append(warning);continue
			var profile: Dictionary=a.data.projectile.duplicate(true)
			profile.life_ticks=60.0
			profile.base_damage=a.attack*2;profile.contact_damage=a.attack*2
			preload("res://scripts/native_demo11_etype_a_projectiles.gd").fire(a,warning.point+a.global_position-warning.origin,profile)
		a.a_warnings=next
