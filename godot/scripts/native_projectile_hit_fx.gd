class_name ExoduserNativeProjectileHitFx
extends Node2D

signal telemetry_event(kind: String, data: Dictionary)

# One source pool for the new native Fx scope. The world owns its shared RNG,
# current FPS flags and explicit normal-clock context; no private seed or OPT guess.
const CONTEXT_SCHEMA = "exoduser.godot.native-projectile-fx-context.v1"
const SHEETS = {
	"fire": ["res://assets/vfx/Fire_FBF_4x4.png"],
	"holy": ["res://assets/vfx/Light_ImpactLight_Sheet.png"],
	"dark": ["res://assets/vfx/Dark_MediumImpact.png", "res://assets/vfx/Dark_DarkSmoke_FBF_4x4.png"]
}
const COLORS = {"fire": Color("#ff5522"), "holy": Color("#ff88cc"), "dark": Color("#9933cc")}
const ELEMENT_IDS = {"fire": 1, "holy": 5, "dark": 3}
const FONT_PATH = "res://assets/fonts/NotoSansKR.ttf"
var world: Node2D
var _configured = false
var _error = "not_configured"
var _textures: Dictionary = {}
var _font: Font
var _booms: Array = []
var _particles: Array = []
var _texts: Array = []
var _blast_lights: Array = []
var _part_evict = 0
var _part_spawn_count = 0
var _particle_odd = 0
var _vfx_live_count = 0
var _reset_epoch = -1
var _text_next = 0
var _text_sink = Callable()
var _text_advance = Callable()
var _text_snapshot = Callable()
var _text_sink_bound = false
var _shake = 0.0
var _flash_alpha = 0.0
var _flash_color = Color.WHITE
var _flash: ColorRect
var _camera: Camera2D
var _camera_base_offset = Vector2.ZERO
var _vibration_last_ms = 0
var _metrics = {"hits": 0, "boom_calls": 0, "particle_requests": 0, "particles_born": 0, "particle_soft_drops": 0,
	"particle_step_drops": 0, "particle_fps_drops": 0, "blast_light_calls": 0, "dark_texts": 0, "shake_calls": 0,
	"flash_calls": 0, "rng_calls": 0, "particle_pre_steps": 0, "boom_post_steps": 0, "literal_particle_requests": 0,
	"text_sink_emits": 0, "text_sink_rejections": 0, "text_sink_clock_calls": 0, "text_sink_clock_rejections": 0}

func configure(owner_world: Node2D) -> bool:
	if _configured or not is_instance_valid(owner_world) or not owner_world.has_method("sample_native_random_unit") or not owner_world.has_method("get_native_projectile_fx_context"):
		return _reject("missing_shared_rng_or_native_fx_context")
	world = owner_world
	if not _context_valid(world.get_native_projectile_fx_context()):
		return _reject("unsupported_native_fx_context")
	for element in SHEETS:
		for path in SHEETS[element]:
			if not ResourceLoader.exists(path, "Texture2D"):
				return _reject("missing_original_hit_texture:" + path)
			var original = ResourceLoader.load(path, "Texture2D") as Texture2D
			if original == null:
				return _reject("unreadable_original_hit_texture:" + path)
			_textures[path] = original
	if not ResourceLoader.exists(FONT_PATH, "FontFile"):
		return _reject("missing_existing_native_font")
	_font = ResourceLoader.load(FONT_PATH, "FontFile") as Font
	if _font == null:
		return _reject("unreadable_existing_native_font")
	for index in range(12):
		_booms.append({"active": false, "age": 0.0, "duration": 66.0, "sprites": [], "arms": []})
	_configured = true
	_error = ""
	return true

func bind_native_floating_text_sink(add_txt: Callable, advance: Callable, snapshot: Callable) -> bool:
	if not _configured or _text_sink_bound or not _texts.is_empty() \
			or not add_txt.is_valid() or not advance.is_valid() or not snapshot.is_valid() \
			or not is_instance_valid(world) or not world.has_method("get_native_frame") \
			or not world.has_method("get_native_world_identity"):
		return _reject("native_text_sink_binding_invalid")
	var status: Variant = snapshot.call()
	if not status is Dictionary or not status.get("ready") is bool or status["ready"] != true:
		return _reject("native_text_sink_not_ready")
	_text_sink = add_txt
	_text_advance = advance
	_text_snapshot = snapshot
	_text_sink_bound = true
	_error = ""
	return true

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_PAUSABLE
	process_physics_priority = 2
	z_as_relative = false
	z_index = 4001
	var screen = CanvasLayer.new()
	screen.name = "NativeHitFlash"
	screen.layer = 1
	add_child(screen)
	_flash = ColorRect.new()
	_flash.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_flash.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_flash.color = Color(1.0, 1.0, 1.0, 0.0)
	screen.add_child(_flash)

func supports(element: String, dark_ball: bool = false) -> bool:
	return _configured and is_instance_valid(world) and _context_valid(world.get_native_projectile_fx_context()) \
		and SHEETS.has(element) and dark_ball == (element == "dark")

func emit(request: Dictionary) -> void:
	var element = str(request.get("element", ""))
	var dark_ball = request.get("dark_ball", false) == true
	if not supports(element, dark_ball) or request.get("element_id") != ELEMENT_IDS.get(element) or request.get("redBean", false) != false:
		push_error("Rejected unsupported native projectile hit Fx request")
		return
	if not request.get("position") is Vector2 or not request.get("target_position") is Vector2:
		push_error("Native projectile hit Fx requires exact world positions")
		return
	var origin: Vector2 = request["position"]
	var target_position: Vector2 = request["target_position"]
	if not origin.is_finite() or not target_position.is_finite():
		return
	_metrics.hits += 1
	# Literal _projHitFx order: boom -> parts (and blastlight) -> shake -> flash.
	_add_boom(origin, 60.0, 48.0, element)
	emit_parts(origin, COLORS[element], 12)
	emit_shake(6.0)
	emit_hit_flash(COLORS[element], 0.15)
	if dark_ball:
		_add_dark_text(target_position + Vector2(0.0, -20.0))
		emit_parts(origin, Color("#a44cff"), 6)
		emit_parts(origin, Color("#6d21ad"), 6)
	telemetry_event.emit("native_projectile_hit_fx", {"element": element, "dark_ball": dark_ball,
		"position": [origin.x, origin.y], "boom_radius": 60.0, "requested_boom_ticks": 48.0,
		"actual_boom_ticks": 66.0, "parts_requested": 12, "shake": 6.0, "flash_strength": 0.15})

func emit_parts(origin: Vector2, color: Color, requested_count: int) -> void:
	if not _configured or not origin.is_finite() or requested_count < 0:
		return
	var context = _context()
	if context.is_empty():
		return
	_metrics.particle_requests += requested_count
	var count = int(requested_count * 0.6)
	for index in range(count):
		if _particles.size() >= 1000:
			break
		# These four argument draws precede poolPart's caps/high-FPS rejection.
		var vx = (_unit() - 0.5) * 7.0
		var vy = (_unit() - 0.5) * 7.0
		var size = 2.0 + _unit() * 4.0
		var life = 12.0 + _unit() * 12.0
		_pool_part(origin, Vector2(vx, vy), color, size, life, context)
	if requested_count >= 10:
		_add_blast_light(origin, 80.0 + requested_count * 4.0, 15.0 + requested_count * 0.5, color)

func emit_source_particle(request: Dictionary) -> bool:
	# A literal poolPart caller: do not replace its supplied motion/life by burst RNG.
	if not _configured or not (request.get("position") is Vector2) or not (request.get("velocity") is Vector2) or not (request.get("color") is Color):
		return false
	var origin: Vector2 = request["position"]
	var movement: Vector2 = request["velocity"]
	var color: Color = request["color"]
	if not origin.is_finite() or not movement.is_finite() or not _number(request.get("size")) or not _number(request.get("life_ticks")):
		return false
	var size = float(request["size"])
	var life = float(request["life_ticks"])
	var kind: Variant = request.get("type", 0)
	var rotation: Variant = request.get("rotation", 0.0)
	var gravity: Variant = request.get("gravity", 0.0)
	var is_skill: Variant = request.get("is_skill", false)
	if size <= 0.0 or life <= 0.0 or not (kind is int) or kind < 0 or kind > 3 or not _number(rotation) or not _number(gravity) or not (is_skill is bool):
		return false
	if not is_finite(color.r) or not is_finite(color.g) or not is_finite(color.b) or not is_finite(color.a):
		return false
	var context = _context()
	if context.is_empty():
		return false
	_metrics.literal_particle_requests += 1
	return _pool_part(origin, movement, color, size, life, context, kind, float(rotation), float(gravity), is_skill, str(request.get("render_owner","")))

# P2-001b — hurtE 42399~42411: 피격 피 파티클 + 피 스플래시 (수치·색 원문 그대로).
# 호출측(main)이 OPT.parts(기본 80)와 _overBudget 게이트를 공급한다 (42396 _quiet는
# weapon/kiSlash opts에 해당 키 없음 → false 고정, 42398 게이트는 state 카운터 소유).
const HURTE_BLOOD_COLORS: Array[String] = ["#aa0000", "#880000", "#cc1111", "#660000"] # 42403
func emit_native_hurte_hit_blood(origin: Vector2, enemy_color: Color, dmg: int,
		has_ang: bool, ang: float, parts_percent: float) -> void:
	if not _configured or not origin.is_finite() or not is_finite(parts_percent):
		return
	var context = _context()
	if context.is_empty():
		return
	# 42399 addParts(e.x,e.y,e.col, min(~~(dmg/3×OPT.parts/100), 8)) — addParts 내부 ×0.6/RNG는 emit_parts.
	emit_parts(origin, enemy_color, mini(int(float(dmg) / 3.0 * parts_percent / 100.0), 8))
	# 42401~42411 피 스플래시 — ang 있을 때만, _bN=min(12, ~~(2+dmg×0.04)×parts/100).
	if not has_ang:
		return
	var splash_count: int = mini(12, int((2.0 + float(dmg) * 0.04) * parts_percent / 100.0))
	for i in range(splash_count):
		var ba: float = ang + (_unit() - 0.5) * 0.8
		var bs: float = 1.5 + _unit() * 3.0 + float(dmg) * 0.02
		_pool_part(origin + Vector2((_unit() - 0.5) * 6.0, (_unit() - 0.5) * 6.0),
			Vector2(cos(ba) * bs, sin(ba) * bs - _unit() * 1.5),
			Color(HURTE_BLOOD_COLORS[clampi(int(_unit() * 4.0), 0, 3)]),
			1.5 + _unit() * 2.5, 12.0 + _unit() * 10.0, context, 0, 0.0, 0.12, false,
			"hurte_blood_splash")

# P2-001b — 51752 셰이크 소비자 단일화: G.shake(원본 owner, P2-001a) 공급자를 받아
# 이 어댑터의 스코프 셰이크와 max 합성해 카메라 오프셋 1곳에서만 쓴다
# (이전에는 main._process와 이 어댑터가 서로 offset을 덮어썼음 — P2-001a 결함 수정).
var _world_shake_supplier: Callable = Callable()
func set_native_world_shake_supplier(supplier: Callable) -> void:
	_world_shake_supplier = supplier

func emit_shake(amount: float) -> void:
	var context = _context()
	if context.is_empty() or not is_finite(amount) or amount < 0.0:
		return
	_metrics.shake_calls += 1
	_shake = maxf(_shake, amount * float(context["shake_percent"]) / 100.0)
	if amount >= 4.0 and bool(context["vibration_enabled"]):
		_vibrate(amount)

func emit_hit_flash(color: Color, strength: float) -> void:
	if not _configured or not is_finite(strength) or strength < 0.0:
		return
	_metrics.flash_calls += 1
	_flash_alpha = minf(0.5, _flash_alpha + strength * 0.5)
	_flash_color = color

func _pool_part(origin: Vector2, movement: Vector2, color: Color, size: float, life: float, context: Dictionary, kind: int = 0, rotation: float = 0.0, gravity: float = 0.0, is_skill: bool = false, render_owner: String = "") -> bool:
	var soft_cap = 60 if bool(context["is_mobile"]) else 150
	if _vfx_live_count + int(context["external_vfx_live_count"]) >= soft_cap and not is_skill:
		_metrics.particle_soft_drops += 1
		return false
	if _part_spawn_count >= (15 if bool(context["is_mobile"]) else 50) and not is_skill:
		_metrics.particle_step_drops += 1
		return false
	_part_spawn_count += 1
	if bool(context["hi_fps"]) and _unit() > float(context["dt_sp"]):
		_metrics.particle_fps_drops += 1
		return false
	var particle = {"position": origin, "velocity": movement, "color": color, "size": size, "life": life, "maximum_life": life, "type": kind, "rotation": rotation, "gravity": gravity, "render_owner":render_owner}
	if _particles.size() >= int(context["dynamic_particle_limit"]):
		if _part_evict >= _particles.size():
			_part_evict = 0
		_particles[_part_evict] = particle
		_part_evict += 1
	else:
		_particles.append(particle)
	# Preserve the original increment on overwrite; removal decrements only expired entries.
	_vfx_live_count += 1
	_metrics.particles_born += 1
	return true

func _add_boom(origin: Vector2, radius: float, requested_ticks: float, element: String) -> void:
	_metrics.boom_calls += 1
	var slot = 0
	for index in range(_booms.size()):
		if not bool(_booms[index]["active"]):
			slot = index
			break
	# Original full-pool oldest scan starts ratio at999; active ratios never exceed
	# it, hence full capacity replaces slot0. Do not silently fix that source rule.
	var boom: Dictionary = _booms[slot]
	for previous in boom["sprites"]:
		previous.visible = false
		previous.queue_free()
	boom.clear()
	boom.merge({"active": true, "age": 0.0, "duration": maxf(66.0, requested_ticks), "radius": radius,
		"position": origin, "element": element, "sprites": [], "arms": []})
	var arms = 8 + int(radius / 25.0)
	for index in range(arms):
		boom["arms"].append({"angle": TAU * index / arms + (_unit() - 0.5) * 0.4,
			"length": 0.5 + _unit() * 0.6, "width": 5.0 + _unit() * 7.0, "speed": 0.7 + _unit() * 0.5})
	for path in SHEETS[element]:
		var sprite = Sprite2D.new()
		sprite.texture = _textures[path]
		sprite.region_enabled = true
		sprite.centered = true
		sprite.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
		sprite.z_as_relative = false
		# Original boom/particle passes are late world Fx, after actor/projectile bodies.
		sprite.z_index = 4001
		add_child(sprite)
		boom["sprites"].append(sprite)
	_update_boom(boom)

func _update_boom(boom: Dictionary) -> void:
	var progress = float(boom["age"]) / float(boom["duration"])
	for layer in range(boom["sprites"].size()):
		var sprite: Sprite2D = boom["sprites"][layer]
		var texture: Texture2D = sprite.texture
		var layer_progress = minf(1.0, maxf(0.0, progress - layer * 0.04) / maxf(0.01, 1.0 - layer * 0.04))
		var frame = mini(15, int(layer_progress * 16.0))
		var cell_width = floor(float(texture.get_width()) / 4.0)
		var cell_height = floor(float(texture.get_height()) / 4.0)
		var size = float(boom["radius"]) * (3.0 + layer * 0.4) * sqrt(minf(1.0, layer_progress * 3.0))
		sprite.region_rect = Rect2((frame % 4) * cell_width, floor(float(frame) / 4.0) * cell_height, cell_width, cell_height)
		sprite.position = to_local(boom["position"])
		sprite.scale = Vector2(size / cell_width, size / cell_height)
		sprite.modulate.a = maxf(0.0, 1.0 - progress * 0.5) * (1.0 - layer * 0.2)

func _add_blast_light(origin: Vector2, radius: float, life: float, color: Color) -> void:
	_metrics.blast_light_calls += 1
	var light = {"position": origin, "radius": radius, "life": life, "maximum_life": life,
		"rgb": [255 if color.r == 0.0 else int(color.r * 255.0), 200 if color.g == 0.0 else int(color.g * 255.0), 100 if color.b == 0.0 else int(color.b * 255.0)]}
	if _blast_lights.size() >= 16:
		var oldest = 0
		for index in range(1, _blast_lights.size()):
			if float(_blast_lights[index]["life"]) < float(_blast_lights[oldest]["life"]):
				oldest = index
		_blast_lights[oldest] = light
	else:
		_blast_lights.append(light)
	# The source pool's _hasGlow triggers its separate full-screen bloom backend.
	# Keep its producer/lifetime data; that legacy backend is outside this scope.

func _add_dark_text(origin: Vector2) -> void:
	var context = _context()
	if context.is_empty():
		return
	_metrics.dark_texts += 1
	if _text_sink_bound:
		# One source event enters the shared ring. Never allocate or age a second
		# legacy Label for a delegated text, even if the sink rejects admission.
		if _text_sink.is_valid() and _text_sink.call(origin.x, origin.y, "💜다크볼!", "#cc44ff", 30, 22, null) == true:
			_metrics.text_sink_emits += 1
		else:
			_metrics.text_sink_rejections += 1
		return
	var label = Label.new()
	label.text = "💜다크볼!"
	label.add_theme_font_override("font", _font)
	label.add_theme_font_size_override("font_size", 22)
	# addTxt stores #cc44ff, but the actual ordinary text pass paints white fill.
	label.add_theme_color_override("font_color", Color.WHITE)
	label.add_theme_color_override("font_outline_color", Color.BLACK)
	label.add_theme_constant_override("outline_size", 2)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	label.z_as_relative = false
	label.z_index = 4002
	add_child(label)
	var item = {"label": label, "position": origin, "life": 30.0, "maximum_life": 30.0}
	_update_text(item)
	if _texts.size() >= int(context["text_pool_limit"]):
		_texts[_text_next]["label"].visible = false
		_texts[_text_next]["label"].queue_free()
		_texts[_text_next] = item
		_text_next = (_text_next + 1) % int(context["text_pool_limit"])
	else:
		_texts.append(item)

func _update_text(item: Dictionary) -> void:
	var ratio = float(item["life"]) / float(item["maximum_life"])
	var age = 1.0 - ratio
	var progress = minf(1.0, age * 5.0)
	var bounce = 1.0 + 0.5 * pow(1.0 - progress, 2.0) * cos(progress * TAU) if progress < 1.0 else 1.0
	var font_size = int(22.0 * bounce)
	var label: Label = item["label"]
	label.add_theme_font_size_override("font_size", font_size)
	label.add_theme_constant_override("outline_size", maxi(1, int(font_size * 0.06)))
	label.modulate.a = 1.0 if ratio > 0.2 else maxf(0.0, ratio * 5.0)
	label.position = to_local(item["position"]) - label.get_minimum_size() * 0.5
	label.visible = ratio > 0.0 and _dark_text_visible(_context(), item["position"])

func _dark_text_visible(context: Dictionary, point: Vector2) -> bool:
	# The normal source whitelist excludes dark-ball text. Still keep its pool life.
	if context.is_empty() or not bool(context["float_text_enabled"]) or not bool(context["battle_test_active"]):
		return false
	var camera = get_viewport().get_camera_2d()
	if camera == null:
		return false
	var pad = 120.0 if bool(context["hi_fps"]) else 200.0
	var half = get_viewport_rect().size / camera.zoom * 0.5 + Vector2.ONE * pad
	var center = camera.get_screen_center_position()
	return absf(point.x - center.x) <= half.x and absf(point.y - center.y) <= half.y

func advance_particle_pre_projectile(ticks: float) -> bool:
	# The world calls exactly once after managed owner AI and before queued shots.
	# Source owner-born particles age now; later projectile-contact births wait.
	if not _configured or not is_finite(ticks) or ticks <= 0.0:
		return false
	var context = _context()
	if context.is_empty():
		return false
	_metrics.particle_pre_steps += 1
	_particle_odd = (_particle_odd + 1) & 1
	var skip_physics = bool(context["hi_fps"]) and _particle_odd == 1
	var survivors: Array = []
	for particle in _particles:
		particle["life"] -= ticks
		if float(particle["life"]) > 0.0:
			if not skip_physics:
				particle["position"] += particle["velocity"] * ticks
				var movement: Vector2 = particle["velocity"]
				movement.y += float(particle["gravity"]) * ticks
				particle["velocity"] = movement
				particle["velocity"] *= pow(0.9, ticks)
			survivors.append(particle)
	_vfx_live_count = maxi(0, _vfx_live_count - (_particles.size() - survivors.size()))
	_particles = survivors
	_part_evict = 0
	queue_redraw()
	return true

func _physics_process(delta: float) -> void:
	if not _configured:
		return
	_metrics.boom_post_steps += 1
	var ticks = delta * 60.0
	for text in _texts:
		text["life"] -= ticks
		if float(text["life"]) > 0.0:
			var text_position: Vector2 = text["position"]
			text_position.y -= 0.6 * ticks
			text["position"] = text_position
			_update_text(text)
		else:
			text["label"].visible = false
	if _shake > 0.0:
		_shake *= pow(0.86, ticks)
		if _shake < 0.3:
			_shake = 0.0
	for boom in _booms:
		if not bool(boom["active"]):
			continue
		boom["age"] += ticks
		if float(boom["age"]) >= float(boom["duration"]):
			boom["active"] = false
			for sprite in boom["sprites"]:
				sprite.visible = false
		else:
			_update_boom(boom)
	var surviving_lights: Array = []
	for light in _blast_lights:
		light["life"] -= ticks
		if float(light["life"]) > 0.0:
			surviving_lights.append(light)
	_blast_lights = surviving_lights
	if _text_sink_bound:
		var context = _context()
		if not context.is_empty() and _text_advance.is_valid() \
				and _text_advance.call(float(context["dt_sp"]), world.get_native_frame(), world.get_native_world_identity()) == true:
			_metrics.text_sink_clock_calls += 1
		else:
			_metrics.text_sink_clock_rejections += 1

func _process(_delta: float) -> void:
	if not _configured:
		return
	var context = _context()
	if context.is_empty():
		return
	var current_camera = get_viewport().get_camera_2d()
	if current_camera != _camera:
		_camera = current_camera
		if is_instance_valid(_camera):
			_camera_base_offset = _camera.offset
	if is_instance_valid(_camera):
		# P2-001b: G.shake(51752 소비자)와 스코프 셰이크를 max 합성 — 카메라 오프셋 단일 작성자.
		var world_shake: float = 0.0
		if _world_shake_supplier.is_valid():
			var supplied: Variant = _world_shake_supplier.call()
			if (supplied is int or supplied is float) and is_finite(float(supplied)) and float(supplied) > 0.0:
				world_shake = float(supplied)
		var effective: float = maxf(_shake, world_shake)
		var offset = Vector2.ZERO
		if effective > 0.0:
			offset = Vector2((_unit() - 0.5) * effective * 2.0, (_unit() - 0.5) * effective * 2.0)
		_camera.offset = _camera_base_offset + offset
	if is_instance_valid(_flash):
		_flash.size = get_viewport_rect().size
		_flash.color = Color(_flash_color.r, _flash_color.g, _flash_color.b, _flash_alpha)
		_flash_alpha = maxf(0.0, _flash_alpha - 0.08 * float(context["dt_sp"]))
	for text in _texts:
		text["label"].visible = float(text["life"]) > 0.0 and _dark_text_visible(context, text["position"])
	queue_redraw()

func _draw() -> void:
	if not _configured:
		return
	var context = _context()
	if context.is_empty() or not is_instance_valid(_camera):
		return
	# poolRender consumes the same expanded _vl.._vb as visible-shot collection.
	var pad = 120.0 if bool(context["hi_fps"]) else 200.0
	var half = get_viewport_rect().size / _camera.zoom * 0.5 + Vector2.ONE * pad
	var bounds = Rect2(_camera.get_screen_center_position() - half, half * 2.0)
	var grid: Dictionary = {}
	var rendered = 0
	var maximum = 35 if bool(context["is_mobile"]) else 80
	for particle in _particles:
		if rendered >= maximum:
			break
		var point: Vector2 = particle["position"]
		if not bounds.has_point(point):
			continue
		var cell = Vector2i(int((point.x - bounds.position.x) / 32.0), int((point.y - bounds.position.y) / 32.0))
		if cell.x >= 0 and cell.y >= 0 and cell.x < 64 and cell.y < 64:
			if int(grid.get(cell, 0)) >= (2 if bool(context["hi_fps"]) else 3):
				continue
			grid[cell] = int(grid.get(cell, 0)) + 1
		var alpha = minf(1.0, float(particle["life"]) / float(particle["maximum_life"]) * 1.5)
		if alpha < 0.15 and rendered > 50:
			continue
		rendered += 1
		var size = float(particle["size"]) * (0.7 if bool(context["hi_fps"]) else 1.0)
		var color: Color = particle["color"]
		color.a = minf(1.0, alpha * 1.4)
		var local = to_local(point)
		match int(particle["type"]):
			2:
				var direction = Vector2.from_angle(float(particle["rotation"])) * size * 1.5
				draw_line(local - direction, local + direction, color, 1.0, true)
			3:
				var radius = size * (1.0 + (1.0 - float(particle["life"]) / float(particle["maximum_life"])) * 2.0)
				draw_rect(Rect2(local - Vector2.ONE * radius, Vector2.ONE * radius * 2.0), color, false, 1.0)
			_:
				# Source's active GPU/GL particle pass uses a quad for both tp0 and tp1.
				draw_rect(Rect2(local - Vector2.ONE * size * 0.5, Vector2.ONE * size), color)

func _context() -> Dictionary:
	if not is_instance_valid(world):
		return {}
	var context: Variant = world.get_native_projectile_fx_context()
	if not _context_valid(context):
		_error = "native_fx_context_lost"
		return {}
	var epoch = int(context["frame_reset_epoch"])
	if epoch != _reset_epoch:
		_reset_epoch = epoch
		_part_spawn_count = 0
	return context

static func _context_valid(context: Variant) -> bool:
	if not context is Dictionary or context.get("schema") != CONTEXT_SCHEMA or context.get("budget_scope") != "new_native_hit_fx_only" or context.get("clock_mode") != "godot_delta_native60":
		return false
	for key in ["is_mobile", "hi_fps", "vibration_enabled", "float_text_enabled", "battle_test_active"]:
		if not context.get(key) is bool:
			return false
	for key in ["dt_sp", "frame_reset_epoch", "dynamic_particle_limit", "external_vfx_live_count", "shake_percent", "text_pool_limit"]:
		if not _number(context.get(key)):
			return false
	for key in ["frame_reset_epoch", "dynamic_particle_limit", "external_vfx_live_count", "text_pool_limit"]:
		if float(context[key]) != floor(float(context[key])):
			return false
	return float(context["dt_sp"]) > 0.0 and int(context["frame_reset_epoch"]) >= 0 \
		and int(context["dynamic_particle_limit"]) >= 1 and int(context["dynamic_particle_limit"]) <= 1000 \
		and float(context["external_vfx_live_count"]) >= 0.0 and float(context["shake_percent"]) >= 0.0 \
		and float(context["shake_percent"]) <= 100.0 and int(context["text_pool_limit"]) in [40, 120]

func _unit() -> float:
	var value: Variant = world.sample_native_random_unit()
	assert(_number(value) and float(value) >= 0.0 and float(value) < 1.0, "source shared RNG must return a finite unit in [0,1)")
	_metrics.rng_calls += 1
	return float(value)

func _vibrate(amount: float) -> void:
	var devices = Input.get_connected_joypads()
	if devices.is_empty():
		return
	var now = Time.get_ticks_msec()
	if now - _vibration_last_ms < 60:
		return
	_vibration_last_ms = now
	var strength = minf(amount / 30.0, 1.0)
	Input.start_joy_vibration(devices[0], minf(1.0, strength * 0.7), strength, maxf(80.0, minf(800.0, amount * 12.0)) / 1000.0)

func _reject(reason: String) -> bool:
	_error = reason
	return false

func get_last_error() -> String:
	return _error

func get_snapshot() -> Dictionary:
	var booms: Array = []
	for boom in _booms:
		if bool(boom["active"]):
			booms.append({"element": boom["element"], "age": boom["age"], "duration": boom["duration"], "radius": boom["radius"], "arms": boom["arms"].duplicate(true), "layers": boom["sprites"].size()})
	var text_status: Dictionary = {}
	if _text_snapshot.is_valid():
		var status: Variant = _text_snapshot.call()
		if status is Dictionary:
			text_status = status
	return {"configured": _configured, "error": _error, "metrics": _metrics.duplicate(true), "booms": booms,
		"particles": _particles.duplicate(true), "blast_lights": _blast_lights.duplicate(true), "texts": _texts.size(),
		"floating_text_sink_bound": _text_sink_bound,
		"floating_text_sink_ready": _text_sink.is_valid() and _text_advance.is_valid() and _text_snapshot.is_valid() \
			and text_status.get("ready") is bool and text_status["ready"] == true,
		"floating_text_live_count": int(text_status.get("live_count", 0)),
		"vfx_live_count": _vfx_live_count, "part_spawn_count": _part_spawn_count, "shake": _shake, "flash_alpha": _flash_alpha,
		"budget_scope": "new_native_hit_fx_only", "old_kernel_global_budget_parity_verified": false,
		"javascript_boot_rng_parity_claimed": false, "legacy_bloom_backend_ported": false,
		"source_particle_shape_branch": "canonical_gpu_gl"}

static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

# Borrow current source particles. Rendering adds no clock, RNG, or second pool.
func get_native_e_wave_draw_rows() -> Array:
	var rows: Array=[]
	if not _configured or not is_instance_valid(_camera):return rows
	var context: Dictionary=_context()
	if context.is_empty():return rows
	var pad: float=120.0 if context.hi_fps else 200.0
	var half: Vector2=get_viewport_rect().size/_camera.zoom*0.5+Vector2.ONE*pad
	var bounds: Rect2=Rect2(_camera.get_screen_center_position()-half,half*2.0)
	var grid: Dictionary={}
	var maximum: int=35 if context.is_mobile else 80
	var rendered: int=0
	for particle in _particles:
		if rendered>=maximum:break
		var point: Vector2=particle.position
		if not bounds.has_point(point):continue
		var cell: Vector2i=Vector2i(int((point.x-bounds.position.x)/32.0),int((point.y-bounds.position.y)/32.0))
		if cell.x>=0 and cell.y>=0 and cell.x<64 and cell.y<64:
			if int(grid.get(cell,0))>=(2 if context.hi_fps else 3):continue
			grid[cell]=int(grid.get(cell,0))+1
		var alpha: float=minf(1.0,float(particle.life)/float(particle.maximum_life)*1.5)
		if alpha<0.15 and rendered>50:continue
		rendered+=1
		if particle.get("render_owner")!="native_e_wave":continue
		var color: Color=particle.color
		color.a=minf(1.0,alpha*1.4)
		rows.append({"position":point,"size":float(particle.size)*(0.7 if context.hi_fps else 1.0),"color":color})
	return rows
