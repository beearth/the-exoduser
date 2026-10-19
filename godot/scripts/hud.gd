extends CanvasLayer

signal pause_requested
signal restart_requested

const FONT_PATH := "res://assets/fonts/NotoSansKR.ttf"
const INK := Color("ded6c2")
const DIM_INK := Color("9eaaad")
const PANEL := Color(0.065, 0.043, 0.031, 0.90)
const ORB_SIZE := 157.5
const ORB_CENTER_OFFSET := 441.0
const NATIVE_BOOT_LOADING_SCHEMA := "exoduser.godot.native-hud-boot-loading.v1"
const BOOT_LOADING_MAX_PERCENT := 100.0

var _player: Node
var _world: Node
var _root: Control
var _hp_text: Label
var _hp_fill: ShaderMaterial
var _stamina_text: Label
var _q_control_text: Label
var _e_control_text: Label
var _stamina_fill: ShaderMaterial
var _combo_text: Label
var _charge_text: Label
var _charge_bar: ProgressBar
var _objective_text: Label
var _status_text: Label
var _telemetry_text: Label
var _pause_button: Button
var _paused := false
var _refresh_elapsed := 0.0
var _boot_loading_panel: Panel
var _boot_loading_message: Label
var _boot_loading_progress: ProgressBar
var _boot_loading_node_ids: Dictionary = {}
var _boot_loading_set_calls: int = 0
var _boot_loading_hide_calls: int = 0


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 10
	_build_ui()
	_refresh()


func bind(player: Node, world: Node) -> void:
	_player = player
	_world = world
	if player.has_signal("stats_changed") and not player.is_connected("stats_changed", _refresh):
		player.connect("stats_changed", _refresh)
	if is_node_ready():
		_refresh()


func set_pause_state(paused: bool) -> void:
	_paused = paused
	if is_instance_valid(_pause_button):
		_pause_button.text = "플레이 재개  Esc" if paused else "일시정지  Esc"
		_status_text.text = "일시정지 · 측정에서 제외" if paused else "정상 플레이 · 실제 입력"

func show_native_input_status(message: String) -> void:
	var status: Label = _root.get_node_or_null("NativeInputStatus") if is_instance_valid(_root) else null
	if is_instance_valid(status): status.text=message


func set_status(message: String) -> void:
	if is_instance_valid(_status_text):
		_status_text.text = message


## Native UI writer only. Main supplies already localized text; original
## showBootLoading/perf/warm-head/_T and source active/killed flags stay unbound.
func set_native_boot_loading(pct: Variant, text: Variant) -> Dictionary:
	var reason: String = _native_boot_loading_error()
	if not reason.is_empty():
		return _native_boot_loading_not_ready(reason)
	if not (pct is int or pct is float) or not is_finite(float(pct)):
		return _native_boot_loading_not_ready("invalid_loading_percent")
	if not (text is String):
		return _native_boot_loading_not_ready("invalid_loading_text")
	var percent: float = clampf(float(pct), 0.0, BOOT_LOADING_MAX_PERCENT)
	# Original name&&msg leaves its message unchanged for an empty string.
	var message: String = text if not text.is_empty() else _boot_loading_message.text
	_boot_loading_progress.value = percent
	if not text.is_empty():
		_boot_loading_message.text = text
	# Native display seam: a partial write shows this existing HUD child;
	# source pct>=100 hides it. This is not the original showBootLoading body.
	_boot_loading_panel.visible = float(pct) < BOOT_LOADING_MAX_PERCENT
	var snapshot: Dictionary = get_native_boot_loading_snapshot()
	if snapshot.get("status") != "READY" or snapshot.get("percent") != percent \
			or snapshot.get("text") != message \
			or snapshot.get("visible") != (float(pct) < BOOT_LOADING_MAX_PERCENT):
		return _native_boot_loading_not_ready("loading_write_readback_rejected")
	_boot_loading_set_calls += 1
	return {"status": "APPLIED", "ready": true, "scope": "native_boot_loading_ui",
		"source": "game.html:64026-64032 setBootLoading UI subset",
		"full_source_completion": false, "auto_hidden": float(pct) >= BOOT_LOADING_MAX_PERCENT,
		"snapshot": get_native_boot_loading_snapshot()}


func hide_native_boot_loading() -> Dictionary:
	var reason: String = _native_boot_loading_error()
	if not reason.is_empty():
		return _native_boot_loading_not_ready(reason)
	_boot_loading_panel.visible = false
	var snapshot: Dictionary = get_native_boot_loading_snapshot()
	if snapshot.get("status") != "READY" or snapshot.get("visible") != false:
		return _native_boot_loading_not_ready("loading_hide_readback_rejected")
	_boot_loading_hide_calls += 1
	return {"status": "APPLIED", "ready": true, "scope": "native_boot_loading_ui",
		"source": "game.html:64033-64040 hideBootLoading UI subset",
		"full_source_completion": false, "snapshot": get_native_boot_loading_snapshot()}


func get_native_boot_loading_snapshot() -> Dictionary:
	var reason: String = _native_boot_loading_error()
	return {"schema": NATIVE_BOOT_LOADING_SCHEMA, "status": "READY" if reason.is_empty() else "NOT_READY",
		"ready": reason.is_empty(), "reason": reason, "scope": "native_boot_loading_ui",
		"hud_instance_id": get_instance_id(), "node_ids": _boot_loading_node_ids.duplicate(true),
		"percent": _boot_loading_progress.value if reason.is_empty() else null,
		"text": _boot_loading_message.text if reason.is_empty() else null,
		"visible": _boot_loading_panel.visible if reason.is_empty() else null,
		"visible_in_tree": _boot_loading_panel.is_visible_in_tree() if reason.is_empty() else null,
		"set_calls": _boot_loading_set_calls, "hide_calls": _boot_loading_hide_calls,
		"full_source_completion": false, "gpu_render": "NOT_PROVEN",
		"unbound_source_effects": ["showBootLoading", "_bootPerfMark", "_bootPerfReport",
			"_warmHeadCapture2d", "_T", "_bootLoadActive", "_bootLoadKilled"]}


func _native_boot_loading_not_ready(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "ready": false, "reason": reason,
		"scope": "native_boot_loading_ui", "full_source_completion": false}


func _native_boot_loading_error() -> String:
	var script: Script = get_script()
	if is_queued_for_deletion() or not is_inside_tree() or not is_node_ready() \
			or script == null or script.resource_path != "res://scripts/hud.gd":
		return "actual_hud_not_live"
	if _boot_loading_node_ids.is_empty():
		return "loading_nodes_not_created"
	var nodes: Dictionary = {"hud": self, "root": _root, "panel": _boot_loading_panel,
		"message": _boot_loading_message, "progress": _boot_loading_progress}
	for key in nodes:
		var node: Variant = nodes[key]
		if typeof(node) != TYPE_OBJECT or not is_instance_valid(node) \
				or node.is_queued_for_deletion() or not node.is_inside_tree() or not node.is_node_ready():
			return "loading_node_not_live:" + str(key)
		if node.get_tree() != get_tree() or node.get_instance_id() != _boot_loading_node_ids.get(key):
			return "loading_node_identity_changed:" + str(key)
	if _root.get_parent() != self or _boot_loading_panel.get_parent() != _root \
			or _boot_loading_message.get_parent() != _boot_loading_panel \
			or _boot_loading_progress.get_parent() != _boot_loading_panel:
		return "loading_node_parent_changed"
	if get_node_or_null("PublicHUD/NativeBootLoading/NativeBootMessage") != _boot_loading_message \
			or get_node_or_null("PublicHUD/NativeBootLoading/NativeBootProgress") != _boot_loading_progress:
		return "loading_node_path_changed"
	if _boot_loading_message.get_child_count() != 0 or _boot_loading_progress.get_child_count() != 0:
		return "loading_leaf_has_children"
	if _boot_loading_progress.min_value != 0.0 or _boot_loading_progress.max_value != BOOT_LOADING_MAX_PERCENT \
			or _boot_loading_progress.step != 0.0:
		return "loading_range_contract_changed"
	return ""


func set_telemetry(metrics: Dictionary) -> void:
	if not is_instance_valid(_telemetry_text):
		return
	if int(metrics.get("sample_count", 0)) == 0:
		_telemetry_text.text = "1080p · 목표 240FPS  |  정상 플레이 표본 대기\nGPU 완료시간 미측정"
		return
	_telemetry_text.text = "프레임 간격 %.2fms  |  CPU %.2f / 물리 %.2fms\n적탄 최대 %d · 표본 %d  |  GPU 완료시간 미측정" % [
		float(metrics.get("frame_ms", 0.0)),
		float(metrics.get("cpu_process_ms", 0.0)),
		float(metrics.get("cpu_physics_ms", 0.0)),
		int(metrics.get("enemy_projectile_max", 0)),
		int(metrics.get("sample_count", 0)),
	]


func _process(delta: float) -> void:
	_refresh_elapsed += delta
	if _refresh_elapsed >= 1.0 / 30.0:
		_refresh_elapsed = 0.0
		_refresh()


func _refresh() -> void:
	if is_instance_valid(_player) and is_instance_valid(_q_control_text):
		var q: Dictionary = _player.get_native_q_control_snapshot()
		_q_control_text.text=("Q MP %.1f / %.1f · 다크볼 패링 / Space 미완" % [q.mana,q.max_mana]) if q.get("ready")==true else "Q 실제 소유자 연결 대기"
	if is_instance_valid(_player) and is_instance_valid(_e_control_text):
		var e: Dictionary = _player.get_native_e_control_snapshot()
		_e_control_text.text=("E %s · ST비용 %.1f · 합체파동 연결 · 전체 E 미완" % [e.state,e.cost]) if e.get("ready")==true else "E 캐릭터 선택/실제 소유자 대기"
	if not is_instance_valid(_hp_text) or not is_instance_valid(_player):
		return
	var snapshot: Dictionary = _player.call("get_snapshot")
	var hp := float(snapshot.get("hp", 0.0))
	var max_hp := float(snapshot.get("max_hp", 350.0))
	var stamina := float(snapshot.get("stamina", 0.0))
	var max_stamina := float(snapshot.get("max_stamina", 200.0))
	_hp_text.text = "생명력\n%d\n/ %d" % [roundi(hp), roundi(max_hp)]
	_hp_fill.set_shader_parameter("fill_ratio", hp / max_hp if max_hp > 0.0 else 0.0)
	_stamina_text.text = "SP\n%d\n/ %d" % [roundi(stamina), roundi(max_stamina)]
	_stamina_fill.set_shader_parameter("fill_ratio", stamina / max_stamina if max_stamina > 0.0 else 0.0)
	var state := str(snapshot.get("state", "idle"))
	var frames := float(snapshot.get("charge_frames", 0.0))
	var combo := int(snapshot.get("combo_step", 0))
	var displayed_step := 3 if state == "windup" else clampi(combo, 0, 3)
	_combo_text.text = "연속 공격  %d / 3" % displayed_step
	_charge_bar.value = clampf(frames, 0.0, 120.0)
	var level := 0
	if frames >= 120.0:
		level = 3
	elif frames >= 80.0:
		level = 2
	elif frames >= 40.0:
		level = 1
	if state == "dead":
		_charge_text.text = "쓰러졌습니다 · 새 씬 재시작"
	elif state == "windup":
		_charge_text.text = "3타 충전  %d단계 · %.0f / 120F" % [level, frames]
	elif frames > 0.0:
		_charge_text.text = "충전  %d단계 · %.0f / 120F" % [level, frames]
	else:
		_charge_text.text = "3타 홀드 · 40F / 80F / 120F"
	var alive := 0
	if is_instance_valid(_world) and _world.has_method("get_enemies"):
		for enemy in _world.call("get_enemies"):
			if is_instance_valid(enemy) and not enemy.is_queued_for_deletion() and float(enemy.get("hp")) > 0.0:
				alive += 1
	_objective_text.text = "남쪽 입구 → 북쪽 출구  ·  남은 적 %d" % alive


func _build_ui() -> void:
	_root = Control.new()
	_root.name = "PublicHUD"
	_root.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(_root)
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var theme := Theme.new()
	if ResourceLoader.exists(FONT_PATH):
		theme.default_font = load(FONT_PATH)
	theme.default_font_size = 18
	_root.theme = theme
	var title_panel := _panel(Vector2(24, 20), Vector2(710, 84))
	_label(title_panel, "지옥의 길", Vector2(16, 9), 26, INK)
	_label(title_panel, "GODOT  ·  NATIVE FIRST PLAY", Vector2(176, 17), 15, DIM_INK)
	_objective_text = _label(title_panel, "남쪽 입구 → 북쪽 출구", Vector2(16, 47), 17, DIM_INK)
	var action_box := HBoxContainer.new()
	action_box.name = "PublicActions"
	_root.add_child(action_box)
	action_box.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	_set_anchor_offsets(action_box, Vector2(-418, 25), Vector2(378, 44))
	action_box.add_theme_constant_override("separation", 10)
	_pause_button = _button("일시정지  Esc")
	_pause_button.name = "PauseResume"
	_pause_button.pressed.connect(func() -> void: pause_requested.emit())
	action_box.add_child(_pause_button)
	var restart := _button("새 씬 재시작")
	restart.name = "RestartGodotScene"
	restart.pressed.connect(func() -> void: restart_requested.emit())
	action_box.add_child(restart)
	var hp_orb := _resource_orb(false)
	_hp_text = _label(hp_orb, "생명력\n350\n/ 350", Vector2(0, 43), 20, Color.WHITE)
	_hp_text.size.x = ORB_SIZE
	_hp_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var stamina_orb := _resource_orb(true)
	_stamina_text = _label(stamina_orb, "SP\n200\n/ 200", Vector2(ORB_SIZE / 2, 44), 17, Color("88dd88"))
	_stamina_text.size.x = ORB_SIZE / 2
	_stamina_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var mp_scope := _label(stamina_orb, "MP\n미이식", Vector2(0, 54), 14, Color("88bbff"))
	mp_scope.size.x = ORB_SIZE / 2
	mp_scope.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var meters := Control.new()
	meters.name = "NativeSkillBar"
	_root.add_child(meters)
	meters.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	_set_anchor_offsets(meters, Vector2(-369, -182), Vector2(738, 164))
	meters.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_texture(meters, "res://assets/ui/ui_bar_only.png", Vector2.ZERO, meters.size, Color(0.8, 0.8, 0.8))
	_combo_text = _label(meters, "연속 공격  0 / 3", Vector2(190, 53), 19, Color("c9965a"))
	_charge_text = _label(meters, "3타 홀드 · 40F / 80F / 120F", Vector2(190, 85), 16, INK)
	_charge_bar = _bar(meters, Vector2(190, 117), Vector2(358, 8), Color("b5985b"), 120)
	var telemetry := _panel(Vector2(-560, 86), Vector2(536, 92), false, true)
	_status_text = _label(telemetry, "정상 플레이 · 실제 입력", Vector2(14, 8), 16, INK)
	_telemetry_text = _label(telemetry, "1080p · 목표 240FPS  |  정상 플레이 표본 대기\nGPU 완료시간 미측정", Vector2(14, 34), 14, DIM_INK)
	var controls := _label(_root, "WASD 이동  ·  마우스 조준  ·  좌클릭 홀드/해제: 공격·3타 충전  ·  E 탭/홀드: 처내기/차징  ·  Esc 정지", Vector2(24, 116), 15, DIM_INK)
	controls.name = "PublicInputHelp"
	var status := _label(_root, "Q 보호막·E 처내기·Space 분노 슬롯: 연결 대기  ·  원본 저장 키 설정 복원 미지원", Vector2(24, 143), 14, DIM_INK)
	status.name="NativeInputStatus"
	_q_control_text=_label(_root,"Q 실제 소유자 연결 대기",Vector2(24,166),14,DIM_INK)
	_q_control_text.name="QControlManaStatus"
	_e_control_text=_label(_root,"E 실제 소유자 대기",Vector2(24,189),14,DIM_INK)
	_e_control_text.name="EControlStatus"
	_build_native_boot_loading_ui()


func _build_native_boot_loading_ui() -> void:
	# One small display on the already existing PublicHUD; no new scene/body.
	_boot_loading_panel = _panel(Vector2(-250, 200), Vector2(500, 64))
	_boot_loading_panel.name = "NativeBootLoading"
	_boot_loading_panel.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	_set_anchor_offsets(_boot_loading_panel, Vector2(-250, 200), Vector2(500, 64))
	_boot_loading_panel.visible = false
	_boot_loading_message = _label(_boot_loading_panel, "", Vector2(14, 9), 16, INK)
	_boot_loading_message.name = "NativeBootMessage"
	_boot_loading_message.size.x = 472.0
	_boot_loading_progress = _bar(_boot_loading_panel, Vector2(14, 42), Vector2(472, 8), Color("b5985b"), BOOT_LOADING_MAX_PERCENT)
	_boot_loading_progress.name = "NativeBootProgress"
	_boot_loading_progress.step = 0.0
	_boot_loading_progress.value = 0.0
	_boot_loading_node_ids = {"hud": get_instance_id(), "root": _root.get_instance_id(),
		"panel": _boot_loading_panel.get_instance_id(), "message": _boot_loading_message.get_instance_id(),
		"progress": _boot_loading_progress.get_instance_id()}


func _resource_orb(stamina: bool) -> Control:
	var orb := Control.new()
	orb.name = "NativeSPGlobe" if stamina else "NativeHPGlobe"
	_root.add_child(orb)
	orb.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	# Source ornament extends39.6px below the175×.9px liquid circle.
	# Reserve54px below the circle so the complete original frame stays visible.
	_set_anchor_offsets(orb, Vector2((ORB_CENTER_OFFSET if stamina else -ORB_CENTER_OFFSET) - ORB_SIZE / 2.0, -ORB_SIZE - 54.0), Vector2(ORB_SIZE, ORB_SIZE))
	orb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var liquid := ColorRect.new()
	liquid.size = orb.size
	liquid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader := Shader.new()
	shader.code = """shader_type canvas_item;
uniform float fill_ratio : hint_range(0.0, 1.0) = 1.0;
uniform bool stamina = false;
void fragment() {
    float circle = 1.0 - smoothstep(0.49, 0.5, length(UV - vec2(0.5)));
    vec3 liquid_color;
    if (stamina) {
        liquid_color = mix(vec3(0.047, 0.2, 0.133), vec3(0.165, 0.533, 0.267), clamp((1.0 - UV.y) / 0.7, 0.0, 1.0));
    } else {
        float d = clamp(length((UV - vec2(0.5, 0.4)) * vec2(1.0, 1.3)) * 2.0, 0.0, 1.0);
        liquid_color = d < 0.5 ? mix(vec3(0.420, 0.063, 0.125), vec3(0.239, 0.039, 0.071), d * 2.0) : mix(vec3(0.239, 0.039, 0.071), vec3(0.118, 0.020, 0.039), (d - 0.5) * 2.0);
    }
    float filled = step(1.0 - fill_ratio, UV.y);
    if (stamina) { filled *= step(0.5, UV.x); }
    COLOR = vec4(mix(vec3(0.024), liquid_color, filled), circle);
}"""
	var material := ShaderMaterial.new()
	material.shader = shader
	material.set_shader_parameter("stamina", stamina)
	liquid.material = material
	orb.add_child(liquid)
	if stamina:
		_stamina_fill = material
	else:
		_hp_fill = material
	_texture(orb, "res://assets/ui/ui_globe_mp.png" if stamina else "res://assets/ui/ui_globe_hp.png", Vector2(-43.2, -39.6), Vector2(236.7, 236.7), Color(0.6, 0.6, 0.6))
	return orb


func _texture(parent: Node, path: String, position_value: Vector2, size_value: Vector2, tint: Color) -> void:
	if not ResourceLoader.exists(path):
		return
	var image := TextureRect.new()
	image.name = path.get_file().get_basename()
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.texture = load(path)
	image.position = position_value
	image.size = size_value
	image.stretch_mode = TextureRect.STRETCH_SCALE
	image.modulate = tint
	image.mouse_filter = Control.MOUSE_FILTER_IGNORE
	parent.add_child(image)


func _set_anchor_offsets(control: Control, position_value: Vector2, size_value: Vector2) -> void:
	control.offset_left = position_value.x
	control.offset_top = position_value.y
	control.offset_right = position_value.x + size_value.x
	control.offset_bottom = position_value.y + size_value.y


func _panel(position_value: Vector2, size_value: Vector2, bottom: bool = false, right: bool = false) -> Panel:
	var panel := Panel.new()
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_root.add_child(panel)
	if bottom:
		panel.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_RIGHT if right else Control.PRESET_BOTTOM_LEFT)
	elif right:
		panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	_set_anchor_offsets(panel, position_value, size_value)
	var style := StyleBoxFlat.new()
	style.bg_color = PANEL
	style.border_color = Color(0.37, 0.43, 0.42, 0.7)
	style.set_border_width_all(1)
	style.set_corner_radius_all(5)
	panel.add_theme_stylebox_override("panel", style)
	return panel


func _label(parent: Node, message: String, position_value: Vector2, font_size: int, color: Color) -> Label:
	var leaf := Label.new()
	leaf.text = message
	leaf.position = position_value
	leaf.mouse_filter = Control.MOUSE_FILTER_IGNORE
	leaf.add_theme_color_override("font_color", color)
	leaf.add_theme_font_size_override("font_size", font_size)
	parent.add_child(leaf)
	return leaf


func _bar(parent: Node, position_value: Vector2, size_value: Vector2, color: Color, maximum: float) -> ProgressBar:
	var bar := ProgressBar.new()
	bar.position = position_value
	bar.size = size_value
	bar.max_value = maximum
	bar.show_percentage = false
	bar.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var background := StyleBoxFlat.new()
	background.bg_color = Color("19272b")
	background.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("background", background)
	var fill := StyleBoxFlat.new()
	fill.bg_color = color
	fill.set_corner_radius_all(3)
	bar.add_theme_stylebox_override("fill", fill)
	parent.add_child(bar)
	return bar


func _button(message: String) -> Button:
	var button := Button.new()
	button.text = message
	button.custom_minimum_size = Vector2(184, 44)
	button.focus_mode = Control.FOCUS_NONE
	var normal := StyleBoxFlat.new()
	normal.bg_color = Color("14232a")
	normal.border_color = Color("677d80")
	normal.set_border_width_all(1)
	normal.set_corner_radius_all(5)
	button.add_theme_stylebox_override("normal", normal)
	var hover := normal.duplicate() as StyleBoxFlat
	hover.bg_color = Color("293d44")
	button.add_theme_stylebox_override("hover", hover)
	button.add_theme_stylebox_override("pressed", hover)
	button.add_theme_color_override("font_color", INK)
	return button
