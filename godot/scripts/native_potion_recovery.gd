extends RefCounted
## Main-owned auto HP runtime. No damage/Player/INV/save writes.
const Phase = preload("res://port_modules/potion_recovery_source/auto_phase.gd")
const Potion = preload("res://port_modules/potion_recovery_source/producer.gd")
const Affix = preload("res://port_modules/equipment_affix_reader/producer.gd")
var _phase = Phase.new()
var _math = Potion.new()
var _main: WeakRef
var _serial = -1
var _running = false
var _ticks = 0
var _uses = 0
var _last_use: Dictionary = {}
var _last: Dictionary = {"status":"NOT_READY","reason":"not_advanced"}

func advance_native(main: Node, sp: float = 1.0, tick_serial: int = -1) -> Dictionary:
	if _running: return {"status":"NOT_READY","reason":"reentrant_runtime"}
	if not is_instance_valid(main) or main.is_queued_for_deletion() or main.get_script() == null or main.get_script().resource_path != "res://scripts/main.gd" or main.get("source_potion") != self:
		return {"status":"NOT_READY","reason":"main_owner_mismatch"}
	if _main != null and _main.get_ref() != main: return {"status":"NOT_READY","reason":"main_owner_changed"}
	_main = weakref(main)
	if not main.is_inside_tree() or main.get_tree() == null: return {"status":"SKIP","reason":"main_tree_exited"}
	if main.get_tree().paused: return {"status":"SKIP","reason":"tree_paused"}
	var clock: Dictionary = main.get_native_source_clock_input_snapshot()
	var serial: int = Engine.get_physics_frames() if tick_serial < 0 else tick_serial
	if serial <= _serial or serial < 1: return {"status":"SKIP","reason":"no_new_physics_tick"}
	_serial = serial # consume once even if source gate/owner failed; no deferred replay
	var update: Dictionary = clock.get("update_clock_result", {})
	var last: Dictionary = update.get("last", {})
	if update.get("status") != "CONTINUE" or not last.has("sp"):
		_last = {"status":"SKIP","reason":"source_update_gate_or_prefix_not_ready"}
		return _last
	var state: Variant = main.get("source_state")
	if not is_instance_valid(state) or not state.is_native_potion_owner_current(main):
		_last = {"status":"NOT_READY","reason":"state_owner_lost"}
		return _last
	var g: Variant = state.read_current_g()
	if not g is Dictionary or not Affix.js_truthy(g.get("on")) or Affix.js_truthy(g.get("paused")):
		_last = {"status":"SKIP","reason":"current_source_gate"}
		return _last
	_running = true
	_last = _phase.advance(sp, {"read":Callable(self,"_read"),"write":Callable(self,"_write")})
	_ticks += 1
	if _last.get("applied") == true:
		_uses += 1
		_last_use = _last.duplicate(true)
	_running = false
	return _last.duplicate(true)

func get_snapshot() -> Dictionary:
	return {"ticks":_ticks,"uses":_uses,"serial":_serial,"last":_last.duplicate(true),"last_use":_last_use.duplicate(true),
		"scope":"AUTO_HP_NATIVE_60HZ_DEFERRED_LATE_PHASE; NOT_FULL_SOURCE_UPDATE"}

func _read(key: String) -> Dictionary:
	var main: Variant = _main.get_ref()
	if not is_instance_valid(main) or not main.source_state.is_native_potion_owner_current(main): return {"status":"NOT_READY"}
	var state: Node = main.source_state
	match key:
		"cd": return _ready(state.read_native_potion_runtime().cd)
		"heal":
			# G35894/35903: level then affix, invoked twice only on actual use.
			var level: Variant = state.read_native_potion_runtime().level
			var affix: Dictionary = main.read_native_system_equipment_affix("potionPower")
			if affix.get("status") != "READY": return affix
			return _math.enhanced_heal(level, affix.value)
		"lesson":
			var lesson: Dictionary = main.read_native_normal_enemy_lesson_status()
			return _ready(lesson.active) if lesson.get("ready") == true else {"status":"NOT_READY"}
		"p": return _ready(state.read_current_p())
		"g": return _ready(state.read_current_g())
		"system_before":
			# No native systemLesson owner exists; absence is not an active tutorial.
			return _ready(null)
		"gloves", "belt":
			var inv: Variant = state.read_current_inventory()
			if not inv is Dictionary or not inv.get("equipped") is Dictionary: return {"status":"NOT_READY"}
			var item: Variant = inv.equipped.get(key)
			if not Affix.js_truthy(item): item = {} # source gl()/blt(): slot||{}
			if not item is Dictionary: return {"status":"NOT_READY"}
			return _ready({"raw":item.get("potCd"),"present":item.has("potCd")})
		"regen":
			var passives: Variant = state.read_current_passives()
			if not passives is Dictionary: return {"status":"NOT_READY"}
			return _ready({"raw":passives.get("pRegen"),"present":passives.has("pRegen")})
		"potion_cd_affix":
			# G28228-28231: same cached _eqAffix source and Math.min cap as the
			# retired manual quickslot; the native owner is the live auto-potion.
			return main.read_native_system_equipment_affix("potionCdRed")
	return {"status":"NOT_READY"}

func _write(key: String, value: Variant) -> Dictionary:
	var main: Variant = _main.get_ref()
	if not is_instance_valid(main) or not main.source_state.is_native_potion_owner_current(main): return {"accepted":false}
	if key in ["cd","mats","hp","stats"]: return main.source_state.commit_native_auto_potion(main,key,value)
	if key == "sound": return {"accepted":true,"implemented":false,"reason":"SFX.potion not connected"}
	if key == "belt_effect":
		var result: Dictionary = main.source_initialization_services.read_normal_enemy_legendary_equipment("_lBeltBuff")
		if result.get("status") != "READY": return {"accepted":false}
		if float(result.value) > 0.0:
			# Damage consumer is PC-owned. Never create a misleading damage-buff timer.
			return {"accepted":true,"implemented":false,"reason":"legendary belt timer/damage consumer HOLD; _lBeltT unchanged"}
		return {"accepted":true}
	if key == "text":
		var text: Variant = main.world.get_node_or_null("NativeFloatingText")
		if not is_instance_valid(text): return {"accepted":true,"implemented":false,"reason":"potion floating text unavailable"}
		var emitted: bool = text.emit_native_text(main.player.global_position.x,main.player.global_position.y-25.0,"👿 악의 추출: +"+str(value)+" HP","#33ff33",40)
		return {"accepted":true,"implemented":emitted,"reason":"potion text admission rejected"}
	return {"accepted":false}

static func _ready(value: Variant) -> Dictionary:
	return {"status":"READY","value":value}
