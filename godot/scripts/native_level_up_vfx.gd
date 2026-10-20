extends Node2D

const DURATION := 3.5
const VFX_DURATION := 3.0
var active := false
var age := 0.0
var strength := 1.0
var demonic := false
var label := ""
var _main: Node
var _player: Node2D
var _owner: Dictionary
var _stage := -1
var _last_frame := 0.0
var _back: Array[ColorRect] = []
var _front: Array[ColorRect] = []
var _label: Label

func configure(owner: Node) -> void:
	_main = owner
	_player = owner.get("player")
	_last_frame = float(owner.get("world").get_native_frame())
	for front in [false, true]:
		var pool: Array[ColorRect] = _front if front else _back
		for index in range(21 if front else 6):
			var stamp := ColorRect.new()
			stamp.mouse_filter = Control.MOUSE_FILTER_IGNORE
			stamp.material = ShaderMaterial.new()
			(stamp.material as ShaderMaterial).shader = preload("res://shaders/source_level_up.gdshader")
			stamp.z_as_relative = false
			stamp.z_index = 11 if front else 9
			stamp.visible = false
			add_child(stamp)
			pool.append(stamp)
	_label = Label.new()
	_label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_label.add_theme_font_override("font", owner.get("hud")._native_serif(400.0))
	_label.add_theme_font_size_override("font_size", 24)
	_label.add_theme_constant_override("outline_size", 1)
	_label.z_as_relative = false
	_label.z_index = 4001
	_label.visible = false
	add_child(_label)

func trigger(levels: int, is_demonic: bool) -> void:
	if float(_player.get("hp")) <= 0.0:
		return
	var p: Dictionary = _main.get("source_state").read_current_p()
	var stage: int = int(_main.get("source_state").read_current_g().get("stage", 0))
	var merge: bool = active and is_same(_owner, p) and _stage == stage and age < 0.24
	_owner = p
	_stage = stage
	strength = minf(1.12, 1.0 + maxf(0.0, float(levels - 1)) * 0.03)
	label = "Lv. %d" % int(p.get("lv", 1))
	demonic = is_demonic
	if not merge:
		age = 0.0
	active = true

func advance(seconds: float) -> void:
	if not active:
		return
	var state: Node = _main.get("source_state")
	if not is_same(_owner, state.read_current_p()) or int(state.read_current_g().get("stage", 0)) != _stage or float(_player.get("hp")) <= 0.0 or str(_player.get("state")) in ["dead", "fallen"]:
		active = false
		return
	if is_finite(seconds) and seconds > 0.0:
		age += seconds
	if age >= DURATION:
		active = false

func build_plan(front: bool, reduced: bool) -> Array:
	var plan: Array = []
	if not active or age >= VFX_DURATION:
		return plan
	var time: float = age * 1.45 / VFX_DURATION
	var rise: float = minf(1.0, time / 0.065)
	var tail: float = maxf(0.0, 1.0 - age / VFX_DURATION)
	var end_fade: float = minf(1.0, (VFX_DURATION - age) / 0.5)
	if not front:
		var phase: float = minf(1.0, time / 0.9)
		var radius: float = 65.0 + 170.0 * (1.0 - pow(1.0 - phase, 3.0))
		_stamp(plan, 2, 0.0, 18.0, radius * strength, radius * 0.5 * strength, rise * pow(1.0 - phase, 1.15) * 0.95)
		var phase2: float = clampf((time - 0.1) / 1.0, 0.0, 1.0)
		if time > 0.1 and not reduced:
			_stamp(plan, 2, 0.0, 18.0, 60.0 + 145.0 * phase2, (60.0 + 145.0 * phase2) * 0.5, (1.0 - phase2) * 0.38 * minf(1.0, (time - 0.1) / 0.06))
		_stamp(plan, 1, 0.0, -12.0, 150.0, 210.0, rise * exp(-maxf(0.0, time - 0.3) * 2.8) * 0.7 * end_fade)
		var beam: float = rise * exp(-maxf(0.0, time - 0.35) * 3.0) * end_fade
		_stamp(plan, 0, 0.0, -110.0, 118.0 * strength, 280.0, beam * 0.9)
		if not reduced:
			_stamp(plan, 0, -26.0, -64.0, 29.0, 192.0, beam * 0.5)
			_stamp(plan, 0, 26.0, -64.0, 29.0, 192.0, beam * 0.5)
	else:
		var flash: float = rise * exp(-maxf(0.0, time - 0.065) * 13.0)
		_stamp(plan, 4, 0.0, -15.0, 108.0, 108.0, flash * 0.65)
		_stamp(plan, 1, 0.0, -14.0, 66.0, 98.0, flash * 0.34)
		for index in range(10 if reduced else 18):
			var particle_time: float = time - float(index % 5) * 0.025
			if particle_time <= 0.0 or particle_time > 1.18:
				continue
			var seed: float = fposmod(float(index) * 0.61803398875, 1.0)
			var angle: float = float(index) * 2.39996323
			var spread: float = (24.0 + seed * 36.0) * (1.0 - exp(-particle_time * 8.0))
			var point := Vector2(cos(angle) * spread * (1.0 - particle_time * 0.3), 8.0 - sin(seed * PI) * 10.0 - particle_time * (48.0 + seed * 60.0))
			var alpha: float = minf(1.0, particle_time / 0.08) * pow(maxf(0.0, 1.0 - particle_time / 1.18), 1.2) * 0.88
			var size: float = 8.0 + seed * 7.0
			_stamp(plan, 3, point.x, point.y, size, size * (1.1 + seed * 0.7), alpha)
		_stamp(plan, 1, 0.0, 18.0, 110.0, 36.0, rise * tail * tail * 0.25)
	return plan

func _stamp(plan: Array, cell: int, center_x: float, center_y: float, width: float, height: float, alpha: float) -> void:
	if alpha > 0.002 and width > 0.0 and height > 0.0:
		plan.append({"cell": cell, "x": center_x, "y": center_y, "w": width, "h": height, "alpha": minf(1.0, alpha)})

func _process(_delta: float) -> void:
	var frame: float = float(_main.get("world").get_native_frame())
	advance(maxf(0.0, frame - _last_frame) / 60.0)
	_last_frame = frame
	var options: Variant = _main.get("source_initialization_services").read_current_options()
	var reduced: bool = options is Dictionary and options.get("quality") == "low"
	for front in [false, true]:
		var pool: Array[ColorRect] = _front if front else _back
		var plan: Array = build_plan(front, reduced)
		for index in range(pool.size()):
			var stamp: ColorRect = pool[index]
			stamp.visible = index < plan.size()
			if not stamp.visible:
				continue
			var entry: Dictionary = plan[index]
			stamp.size = Vector2(entry.w, entry.h)
			stamp.position = to_local(_player.global_position) + Vector2(entry.x, entry.y) - stamp.size * 0.5
			stamp.color = Color(1, 1, 1, entry.alpha)
			(stamp.material as ShaderMaterial).set_shader_parameter("cell", entry.cell)
			(stamp.material as ShaderMaterial).set_shader_parameter("demonic", demonic)
	_label.visible = active
	if active:
		_label.text = label
		_label.reset_size()
		_label.position = to_local(_player.global_position) + Vector2(-_label.size.x * 0.5, -70.0 - 18.0 * minf(1.0, age / DURATION) - _label.size.y * 0.5)
		_label.modulate.a = minf(1.0, age / 0.08) * minf(1.0, maxf(0.0, (DURATION - age) / 0.6))
		_label.add_theme_color_override("font_color", Color("#e5b4ff" if demonic else "#ffe6a3"))
		_label.add_theme_color_override("font_outline_color", Color("#1d092b" if demonic else "#241707"))

func snapshot() -> Dictionary:
	return {"active": active, "age": age, "strength": strength, "label": label, "demonic": demonic, "stage": _stage}
