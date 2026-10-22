extends "res://scripts/enemy_melee_flesh_crawler.gd"
## 실제 etype0 actor/HP owner 재사용. 포이즈는 공용 코어가 처리한다.
## Exact initial v3 domain stays false.
var _natural_owner: WeakRef
var _source_frame := -1.0
func bind_natural_owner(owner: Node) -> void:
	_natural_owner=weakref(owner)
	_rng=owner.shared_random
func _ready() -> void:
	super._ready()
	set_physics_process(false)
func _physics_process(_delta: float) -> void:
	pass # World phase owns all natural AI; never a second automatic delta clock.
func is_native_registry_ready() -> bool:
	return _natural_owner!=null and is_instance_valid(_natural_owner.get_ref()) and etype==0 and el==-1 and elite==0 and mods.is_empty()
func advance_native_phase(sp: float,frame: float,_enemies: Array) -> void:
	var owner: Node=_natural_owner.get_ref() if _natural_owner!=null else null
	if not is_instance_valid(owner) or not owner.frame_ready(frame) or frame<=_source_frame or not alive:return
	_source_frame=frame
	# 34456 before updateE, no duplicate P3 actor bookkeeping list.
	var native: Dictionary=data.native_final
	if float(native.get("reviveIframes",0))>0:
		apply_native_normal_enemy_bookkeeping({"reviveIframes":maxf(0,float(native.reviveIframes)-sp)})
	super._physics_process(sp/60.0)
func _fire_projectile() -> void:
	var owner: Node=_natural_owner.get_ref()
	if not alive or not is_instance_valid(owner):return
	# _fireChargedProj normal branch G20148-20149. -1 carries JS undefined EL.
	facing=(player.global_position-global_position).angle()
	var v:=Vector2.from_angle(facing)*3.0
	var life:=int(float(data.projectile_range)*0.3)
	var props: Dictionary={"x":global_position.x,"y":global_position.y,"vx":v.x,"vy":v.y,
		"dmg":int(attack*0.8),"el":el,"friendly":false,"life":life,"ml":life,
		"col":str(data.native_final.col),"sz":1.5,"_commit":true}
	var receipt: Dictionary=owner.emit_projectile(self,props)
	telemetry_event.emit("natural_projectile_receipt",receipt)
	if receipt.get("ready",false):world.emit_native_parts(global_position,props.col,2)
