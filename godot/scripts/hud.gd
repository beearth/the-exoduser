extends CanvasLayer
const UI = preload("res://scripts/native_demo_ui_i18n.gd")

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
var _mp_text: Label
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

# ── P2-002a 원본 첫 전투 HUD: #mmLvl(2575~2584)·#stageClock(2691)·스킬 슬롯 아이콘
# (updateSkSlot 44879~44931, _skIcon 44134) + 개발 오버레이 기본 숨김/토글 ──
var _source_state: Node
var _objective_values: Dictionary = {}
var _exp_fill: Control
var _exp_fill_full_width := 0.0
var _stage_clock: Control
var _stage_timer_label: Label
var _stage_progress_fill: Control
var _slot_icons: Dictionary = {}
var _slot_icon_files: Dictionary = {}
var _skill_icon_textures: Dictionary = {}
var _slot_sweeps: Dictionary = {}
var _slot_sweep_labels: Dictionary = {}
var _skill_cooldowns: Callable = Callable()
var _debug_overlay_nodes: Array = []
var _debug_overlay_visible := false
var _pulse_values: Dictionary = {}
# P2-002b — 미니맵(#mmWrap 2585·drawMM 60177~60234)·hudCorner 화폐(2666~2669·60325)
var _minimap_canvas: Control
var _minimap_cache: ImageTexture
var _minimap_cache_ready := false
var _minimap_sc := 0.0
var _minimap_origin := Vector2.ZERO
var _minimap_last_frame := -1000.0
var _minimap_enemy_frame := -1000.0
var _minimap_enemy_points: Array = []
var _minimap_portrait: Texture2D
var _sp_label: Label
var _cp_label: Label


# P2-001i — 인트로 커튼 전 HUD 숨김/오픈 시 표시. 원본 63283(G.on=false 구간) 동안
# HUD 미표시 → 63414 .on 토글(hud/hudTop/hudCorner/mmWrap/skBar/mmLvl/globeHP/globeMP).
# 이 포트의 해당 요소들은 전부 PublicHUD 루트(_root) 아래라 루트 가시성이 같은 의미
# (63287 부트 로딩 숨김 포함). 커튼 뷰는 _root의 형제라 영향 없음.
func set_native_intro_hud_visible(value: bool) -> bool:
	if not is_instance_valid(_root):
		return false
	_root.visible = value
	return true

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 10
	_build_ui()
	var mobility_ui := preload("res://scripts/parity_hud_mobility.gd").new()
	mobility_ui.hud = self
	_root.add_child(mobility_ui)
	_refresh()


func bind(player: Node, world: Node) -> void:
	_player = player
	_world = world
	if player.has_signal("stats_changed") and not player.is_connected("stats_changed", _refresh):
		player.connect("stats_changed", _refresh)
	if is_node_ready():
		_refresh()


func bind_native_source_state(state: Node) -> bool:
	# HUD는 표시 전용 소비자 — 값은 state owner getter(read_current_p/read_current_g)로만 읽는다.
	if not is_instance_valid(state) or not state.has_method("read_current_p") 			or not state.has_method("read_current_g"):
		return false
	_source_state = state
	if is_node_ready():
		_refresh_native_first_fight_hud()
	return true


func set_pause_state(paused: bool) -> void:
	_paused = paused
	if is_instance_valid(_pause_button):
		_pause_button.text = UI.text("플레이 재개  Esc") if paused else UI.text("일시정지  Esc")
		_status_text.text = UI.text("일시정지 · 측정에서 제외") if paused else UI.text("정상 플레이 · 실제 입력")

func show_native_input_status(message: String) -> void:
	var status: Label = _root.get_node_or_null("NativeInputStatus") if is_instance_valid(_root) else null
	if is_instance_valid(status): status.text=UI.text(message)


func set_status(message: String) -> void:
	if is_instance_valid(_status_text):
		_status_text.text = UI.text(message)


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
		_telemetry_text.text = UI.text("1080p · 목표 240FPS  |  정상 플레이 표본 대기\nGPU 완료시간 미측정")
		return
	_telemetry_text.text = UI.text("프레임 간격 %.2fms  |  CPU %.2f / 물리 %.2fms\n적탄 최대 %d · 표본 %d  |  GPU 완료시간 미측정") % [
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
		_q_control_text.text=(UI.text("Q MP %.1f / %.1f · 다크볼 패링 / Space 미완") % [q.mana,q.max_mana]) if q.get("ready")==true else UI.text("Q 실제 소유자 연결 대기")
	if is_instance_valid(_player) and is_instance_valid(_e_control_text):
		var e: Dictionary = _player.get_native_e_control_snapshot()
		_e_control_text.text=(UI.text("E %s · ST비용 %.1f · 합체파동 연결 · 전체 E 미완") % [e.state,e.cost]) if e.get("ready")==true else UI.text("E 캐릭터 선택/실제 소유자 대기")
	if not is_instance_valid(_hp_text) or not is_instance_valid(_player):
		return
	var snapshot: Dictionary = _player.call("get_snapshot")
	var hp := float(snapshot.get("hp", 0.0))
	var max_hp := float(snapshot.get("max_hp", 350.0))
	var stamina := float(snapshot.get("stamina", 0.0))
	var max_stamina := float(snapshot.get("max_stamina", 200.0))
	_hp_text.text = "%d\n/ %d" % [roundi(hp), roundi(max_hp)]
	_stamina_text.text = "SP\n%d\n/%d" % [int(stamina), int(max_stamina)]
	# Actual MP owner, source60244/60300-60305. No invented value/development label.
	var current: Variant=_source_state.read_current_p() if is_instance_valid(_source_state) else null
	var mp_ready: bool=current is Dictionary and (current.get("mp") is int or current.get("mp") is float) and (current.get("mmp") is int or current.get("mmp") is float) and is_finite(float(current.mp)) and is_finite(float(current.mmp)) and current.mmp>0
	_hp_text.hide();_stamina_text.hide()
	_mp_text.visible=false
	_mp_text.text="MP\n%d\n/%d" % [int(current.mp),int(current.mmp)] if mp_ready else ""
	var state := str(snapshot.get("state", "idle"))
	var frames := float(snapshot.get("charge_frames", 0.0))
	var combo := int(snapshot.get("combo_step", 0))
	var displayed_step := 3 if state == "windup" else clampi(combo, 0, 3)
	_combo_text.text = UI.text("연속 공격  %d / 3") % displayed_step
	_charge_bar.value = clampf(frames, 0.0, 120.0)
	var level := 0
	if frames >= 120.0:
		level = 3
	elif frames >= 80.0:
		level = 2
	elif frames >= 40.0:
		level = 1
	if state == "dead":
		_charge_text.text = UI.text("쓰러졌습니다 · 새 씬 재시작")
	elif state == "windup":
		_charge_text.text = UI.text("3타 충전  %d단계 · %.0f / 120F") % [level, frames]
	elif frames > 0.0:
		_charge_text.text = UI.text("충전  %d단계 · %.0f / 120F") % [level, frames]
	else:
		_charge_text.text = UI.text("3타 홀드 · 40F / 80F / 120F")
	var alive := 0
	if is_instance_valid(_world) and _world.has_method("get_enemies"):
		for enemy in _world._enemies:
			if is_instance_valid(enemy) and not enemy.is_queued_for_deletion() and float(enemy.get("hp")) > 0.0:
				alive += 1
	_objective_text.text = UI.text("남쪽 입구 → 북쪽 출구  ·  남은 적 %d") % alive
	_refresh_native_first_fight_hud()
	_refresh_native_minimap_and_corner()


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
	_root.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
	var title_panel := _panel(Vector2(24, 20), Vector2(710, 84))
	_debug_overlay_nodes.append(title_panel)
	_label(title_panel, UI.text("지옥의 길"), Vector2(16, 9), 26, INK)
	_label(title_panel, "GODOT  ·  NATIVE FIRST PLAY", Vector2(176, 17), 15, DIM_INK)
	_objective_text = _label(title_panel, UI.text("남쪽 입구 → 북쪽 출구"), Vector2(16, 47), 17, DIM_INK)
	var action_box := HBoxContainer.new()
	action_box.name = "PublicActions"
	_root.add_child(action_box)
	action_box.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	_set_anchor_offsets(action_box, Vector2(-418, 25), Vector2(378, 44))
	action_box.add_theme_constant_override("separation", 10)
	_pause_button = _button(UI.text("일시정지  Esc"))
	_pause_button.name = "PauseResume"
	_pause_button.pressed.connect(func() -> void: pause_requested.emit())
	action_box.add_child(_pause_button)
	var restart := _button(UI.text("새 씬 재시작"))
	restart.name = "RestartGodotScene"
	restart.pressed.connect(func() -> void: restart_requested.emit())
	action_box.add_child(restart)
	_debug_overlay_nodes.append(action_box)
	var hp_orb := _resource_orb(false)
	_hp_text = _label(hp_orb, "350\n/ 350", Vector2(0, 59.85), 20, Color.WHITE)
	_hp_text.size.x = ORB_SIZE
	_hp_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_hp_text.add_theme_font_override("font",NATIVE_UI_FONTS.stack("hell_title",900))
	var stamina_orb := _resource_orb(true)
	_stamina_text = _label(stamina_orb, "SP\n0\n/0", Vector2(ORB_SIZE / 2, 56), 14, Color("88dd88"))
	_stamina_text.size.x = ORB_SIZE / 2
	_stamina_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	_stamina_text.add_theme_font_override("font",NATIVE_UI_FONTS.stack("hell_title",900))
	_mp_text = _label(stamina_orb, "", Vector2(0,56),14,Color("88bbff"))
	_mp_text.add_theme_font_override("font",NATIVE_UI_FONTS.stack("hell_title",900))
	_mp_text.size.x=ORB_SIZE/2
	_mp_text.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
	_mp_text.visible=false
	var meters := Control.new()
	meters.name = "NativeSkillBar"
	_root.add_child(meters)
	meters.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	_set_anchor_offsets(meters, Vector2(-369, -148.8), Vector2(738, 163.8))
	meters.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_texture(meters, "res://assets/ui/ui_bar_only.png", Vector2.ZERO, meters.size, Color(0.8, 0.8, 0.8))
	_combo_text = _label(meters, UI.text("연속 공격  0 / 3"), Vector2(190, 53), 19, Color("c9965a"))
	_charge_text = _label(meters, UI.text("3타 홀드 · 40F / 80F / 120F"), Vector2(190, 85), 16, INK)
	_charge_bar = _bar(meters, Vector2(190, 117), Vector2(358, 8), Color("b5985b"), 120)
	var telemetry := _panel(Vector2(-560, 86), Vector2(536, 92), false, true)
	_debug_overlay_nodes.append(telemetry)
	_status_text = _label(telemetry, UI.text("정상 플레이 · 실제 입력"), Vector2(14, 8), 16, INK)
	_telemetry_text = _label(telemetry, UI.text("1080p · 목표 240FPS  |  정상 플레이 표본 대기\nGPU 완료시간 미측정"), Vector2(14, 34), 14, DIM_INK)
	var controls := _label(_root, UI.text("WASD 이동  ·  마우스 조준  ·  좌클릭 홀드/해제: 공격·3타 충전  ·  E 탭/홀드: 처내기/차징  ·  Esc 정지"), Vector2(24, 116), 15, DIM_INK)
	controls.name = "PublicInputHelp"
	_debug_overlay_nodes.append(controls)
	var status := _label(_root, UI.text("Q 보호막·E 처내기·Space 분노 슬롯: 연결 대기  ·  원본 저장 키 설정 복원 미지원"), Vector2(24, 143), 14, DIM_INK)
	status.name="NativeInputStatus"
	_debug_overlay_nodes.append(status)
	_q_control_text=_label(_root,UI.text("Q 실제 소유자 연결 대기"),Vector2(24,166),14,DIM_INK)
	_q_control_text.name="QControlManaStatus"
	_e_control_text=_label(_root,UI.text("E 실제 소유자 대기"),Vector2(24,189),14,DIM_INK)
	_e_control_text.name="EControlStatus"
	_debug_overlay_nodes.append(_q_control_text)
	_debug_overlay_nodes.append(_e_control_text)
	# 스킬바 위 포트 개발 표기(연속 공격/3타 홀드/충전 바)도 원본 화면엔 없음 — 오버레이로.
	_debug_overlay_nodes.append(_combo_text)
	_debug_overlay_nodes.append(_charge_text)
	_debug_overlay_nodes.append(_charge_bar)
	_build_native_first_fight_hud()
	_build_native_minimap()
	var direction:=preload("res://scripts/parity_hud_direction.gd").new()
	direction.hud=self;direction.name="WebRegionDirection";_root.add_child(direction)
	_build_native_hud_corner()
	set_native_debug_overlay_visible(false)
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
	# Source fixed bottom inset10px, ornament extends39.6px beyond circle (viewport clips it).
	_set_anchor_offsets(orb, Vector2((ORB_CENTER_OFFSET if stamina else -ORB_CENTER_OFFSET) - ORB_SIZE / 2.0, -ORB_SIZE - 10.0), Vector2(ORB_SIZE, ORB_SIZE))
	orb.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var liquid := ColorRect.new()
	liquid.size = orb.size
	liquid.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var shader := Shader.new()
	shader.code = """shader_type canvas_item;
uniform float fill_ratio : hint_range(0.0, 1.0) = 1.0;
uniform bool stamina = false;
uniform float mp_ratio : hint_range(0.0, 1.0) = 0.0;
void fragment() {
    float circle = 1.0 - smoothstep(0.49, 0.5, length(UV - vec2(0.5)));
    vec3 liquid_color;
    if (stamina) {
        bool mp = UV.x < 0.5;
        float ratio = mp ? mp_ratio : fill_ratio;
        float q = clamp(2.0 - ratio - UV.y,0.0,1.0);
        vec3 bottom = mp ? vec3(12.,34.,68.)/255. : vec3(12.,51.,34.)/255.;
        vec3 mid = mp ? vec3(26.,68.,136.)/255. : vec3(26.,85.,51.)/255.;
        vec3 top = mp ? vec3(51.,136.,204.)/255. : vec3(42.,136.,68.)/255.;
        liquid_color = q < .3 ? mix(bottom,mid,q/.3) : mix(mid,top,clamp((q-.3)/.4,0.,1.));
        float alpha = q < .7 ? 1. : (q < .9 ? mix(1.,.3,(q-.7)/.2) : mix(.3,0.,(q-.9)/.1));
        float filled = step(1.0-ratio,UV.y);
        COLOR=vec4(mix(vec3(6.,6.,8.)/255.,liquid_color,filled*alpha),circle);
    } else {
        float offset_y = 1.0 - fill_ratio;
        float d = clamp(length(vec2((UV.x-.5)/1.41421356, (UV.y-offset_y-.4)/.84852814)), 0., 1.);
        liquid_color = d < 0.5 ? mix(vec3(0.420, 0.063, 0.125), vec3(0.239, 0.039, 0.071), d * 2.0) : mix(vec3(0.239, 0.039, 0.071), vec3(0.118, 0.020, 0.039), (d - 0.5) * 2.0);
        float filled = step(1.0 - fill_ratio, UV.y);
        COLOR = vec4(mix(vec3(0.024), liquid_color, filled), circle);
    }
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
	_texture(orb, "res://assets/ui/ui_globe_mp.png" if stamina else "res://assets/ui/ui_globe_hp.png", Vector2(-43.2, -39.6), Vector2(236.7, 236.7), Color.WHITE)
	var trim := preload("res://scripts/parity_hud_orb_trim.gd").new()
	trim.name="WebOrbTrim";trim.stamina=stamina;trim.hud=self
	orb.add_child(trim)
	return orb


func _texture(parent: Node, path: String, position_value: Vector2, size_value: Vector2, tint: Color) -> void:
	if not ResourceLoader.exists(path):
		return
	var image := TextureRect.new()
	image.name = path.get_file().get_basename()
	image.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	image.texture = load(path)
	if path.ends_with("ui_globe_hp.png") or path.ends_with("ui_globe_mp.png"):
		var glow := ShaderMaterial.new()
		glow.shader = preload("res://shaders/parity_orb_frame.gdshader")
		image.material = glow
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
	UI.bind(leaf,message)
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
	UI.bind(button,message)
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

# ═══════════════════ P2-002a 원본 첫 전투 HUD (표시 전용 소비자) ═══════════════════
# 원본 근거: #mmLvl 2575~2584 + CSS 372~381 / #stageClock 2691 + CSS 364~368 /
# 갱신 60310~60336 / 슬롯 geometry CSS 712~725(.qs 37×45 top70) + .qs 스킨 974~980 /
# 아이콘 _skIcon 44134 (img/skillskin_upscaled/{id}.png·SKILL_ICONS 44118) /
# 슬롯별 스킬 매핑 updateSkSlot~updateTSlot 44879~44931, LMB 44902, Q 44908.
# 폰트(P2-007a): 원본 CSS 스택 순서 그대로 — NATIVE_UI_FONTS(scripts/native_ui_fonts.gd).
# #mmLvl 372 var(--font-hell)=Nanum Myeongjo→Noto Serif KR / #stageClock 364·#hudCorner 327
# 'Cinzel',var(--font-hell) / 쿨다운 초(_skCdSweep 44147) 상속 body var(--font)=Noto Sans KR 900.
const SERIF_FONT_PATH := "res://assets/fonts/NotoSerifKR-VF.ttf" # --font-hell 2순위(스택 내 폴백)
const NATIVE_UI_FONTS := preload("res://scripts/native_ui_fonts.gd")
const SKILL_ICON_DIR := "res://assets/ui/skill_icons/"
# SKILL_ICONS(44118) 부분집합 — 첫 전투 노출 가능분. 값=파일명(원본 alias 그대로).
const NATIVE_SKILL_ICON_FILES := {"kiSlash": "kiSlash", "maliceSwipe": "maliceSwipe",
	"whirlwind": "whirlwind", "charge": "chargeBoost", "chargeBoost": "chargeBoost",
	"fireball": "fireball", "parry": "peaceShield", "peaceShield": "peaceShield",
	"ghostWalk": "ghostWalk", "iceOrb": "iceOrb", "spikeTrap": "spikeTrap",
	"giantSlam": "giantSlam", "holyDome": "holyDome", "shieldFuse": "shieldThrow",
	"shieldThrow": "shieldThrow"}
# CSS 712~725: skBar(820×182) 기준 슬롯 left px — meters 노드는 0.9 스케일(738×164).
const NATIVE_SLOT_LEFTS := {"qs0": 128, "qs1": 173, "qs2": 217, "qs3": 261,
	"qs5": 303, "ultSlot": 347, "skSlotLMB": 392, "qsE": 436, "skSlot0": 479,
	"skSlotRMB": 522, "qsQ": 566, "skSlotCT": 610, "skSlot1": 654}
const NATIVE_SLOT_SCALE := 0.9      # #skBar transform scale(.9) — meters 노드와 동일
const NATIVE_SLOT_TOP := 70.0       # .qs top:70px
const NATIVE_SLOT_SIZE := Vector2(37, 45)

func _native_hud_label(parent: Control, text: String, pos: Vector2, size_px: int,
		color: Color, weight: float = 400.0, font_stack: String = "hell") -> Label:
	var label := Label.new()
	parent.add_child(label)
	UI.bind(label,text)
	label.position = pos
	label.add_theme_font_override("font", NATIVE_UI_FONTS.stack(font_stack, int(weight)))
	label.add_theme_font_size_override("font_size", size_px)
	label.add_theme_color_override("font_color", color)
	# text-shadow 0 1px 3px rgba(0,0,0,.95) — Label 그림자(블러 미지원은 근사 기록)
	label.add_theme_color_override("font_shadow_color", Color(0, 0, 0, 0.95))
	label.add_theme_constant_override("shadow_offset_x", 0)
	label.add_theme_constant_override("shadow_offset_y", 1)
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return label


static func _native_gradient_rect(parent: Control, pos: Vector2, size: Vector2,
		top: Color, bottom: Color) -> TextureRect:
	var rect := TextureRect.new()
	parent.add_child(rect)
	rect.position = pos
	rect.size = size
	var gradient := Gradient.new()
	gradient.colors = PackedColorArray([top, bottom])
	gradient.offsets = PackedFloat32Array([0.0, 1.0])
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.fill_from = Vector2(0, 0)
	texture.fill_to = Vector2(0, 1)
	rect.texture = texture
	rect.stretch_mode = TextureRect.STRETCH_SCALE
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	return rect


static func _native_comma(value: int) -> String:
	# _hudReadableNumber(60239) — Intl 그룹 구분(1,000 단위 콤마), 음수 하한 0.
	var n := maxi(0, value)
	var raw := str(n)
	var out := ""
	var count := 0
	for index in range(raw.length() - 1, -1, -1):
		out = raw[index] + out
		count += 1
		if count % 3 == 0 and index > 0:
			out = "," + out
	return out


func _build_native_first_fight_hud() -> void:
	# Boot-only texture loading. Slot refresh only reads the retained table.
	for file in NATIVE_SKILL_ICON_FILES.values():
		if _skill_icon_textures.has(file):continue
		var path: String=SKILL_ICON_DIR+str(file)+".png"
		_skill_icon_textures[file]=load(path) if ResourceLoader.exists(path) else null
	# ── #mmLvl (우상 목표 패널) — CSS 372: top6/right10, min-width200, pad 10 12,
	#    border rgba(145,119,76,.45), bg 180deg rgba(12,13,15,.88)→rgba(9,10,12,.76) ──
	var panel := Control.new()
	panel.name = "NativeObjectivePanel"
	_root.add_child(panel)
	var panel_size := Vector2(216, 153.4)
	panel.set_anchors_and_offsets_preset(Control.PRESET_TOP_RIGHT)
	panel.offset_left = -panel_size.x - 20
	panel.offset_right = -20
	panel.offset_top = 16
	panel.offset_bottom = 16 + panel_size.y
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_native_gradient_rect(panel, Vector2.ZERO, panel_size,
		Color(38.0 / 255,31.0 / 255,27.0 / 255,.96),Color(9.0 / 255,10.0 / 255,13.0 / 255,.93))
	var border := Panel.new()
	panel.add_child(border)
	border.size = panel_size
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var border_style := StyleBoxFlat.new()
	border_style.draw_center = false
	border_style.border_color = Color(156.0/255,122.0/255,75.0/255,.68)
	border_style.set_border_width_all(1)
	border.add_theme_stylebox_override("panel", border_style)
	var label_color := Color("cbbd9f")
	var row_value_color := Color("eee4d4")
	_native_hud_label(panel, UI.text("레벨"), Vector2(15, 15.8), 12, label_color)               # hudLevelLabel
	var lv_label := _native_hud_label(panel, "1", Vector2(15, 13), 16, Color("f2e6cb"), 700.0)
	lv_label.size.x = panel_size.x - 30
	lv_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_native_hud_label(panel, UI.text("경험치"), Vector2(15, 39), 12, label_color)             # hudExpLabel
	var exp_label := _native_hud_label(panel, "0 / 0", Vector2(15, 39), 12, Color("dfcfaa"))
	exp_label.size.x = panel_size.x - 30
	exp_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	# .objective-frame: border-top rgba(145,119,76,.3) + exp바(2px, bg rgba(0,0,0,.5))
	var divider := ColorRect.new()
	panel.add_child(divider)
	divider.position = Vector2(15, 68)
	divider.size = Vector2(panel_size.x - 30, 1)
	divider.color = Color(145.0 / 255, 119.0 / 255, 76.0 / 255, 0.3)
	var exp_bg := ColorRect.new()
	panel.add_child(exp_bg)
	exp_bg.position = Vector2(15, 78.4)
	exp_bg.size = Vector2(panel_size.x - 30, 2)
	exp_bg.color = Color(0, 0, 0, 0.5)
	_exp_fill_full_width = panel_size.x - 30
	_exp_fill = _native_gradient_rect(exp_bg, Vector2.ZERO, Vector2(0, 2),
		Color(122.0 / 255, 101.0 / 255, 72.0 / 255, 0.55), Color(196.0 / 255, 171.0 / 255, 124.0 / 255, 0.85))
	(_exp_fill as TextureRect).texture.fill_to = Vector2(1, 0)  # 90deg 가로 그라디언트
	_native_hud_label(panel, UI.text("지역 처치"), Vector2(15, 91.55), 12, label_color)          # hudKillLabel
	var kill_label := _native_hud_label(panel, "0 / 0", Vector2(15, 91.55), 12, row_value_color)
	kill_label.size.x = panel_size.x - 30
	kill_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_native_hud_label(panel, UI.text("악의"), Vector2(15, 116.55), 12, label_color)               # hudMaliceLabel
	var malice_label := _native_hud_label(panel, "0", Vector2(15, 116.55), 12, row_value_color)
	malice_label.size.x = panel_size.x - 30
	malice_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	_objective_values = {"lv": lv_label, "exp": exp_label, "kill": kill_label, "malice": malice_label}
	# ── #stageClock (상단 중앙 타이머) — CSS 364: top7, width170, 'Cinzel' 폴백
	#    'Cinzel',var(--font-hell) 400(로드분 700 face), opacity .57 ──
	_stage_clock = Control.new()
	_stage_clock.name = "NativeStageClock"
	_root.add_child(_stage_clock)
	_stage_clock.set_anchors_and_offsets_preset(Control.PRESET_CENTER_TOP)
	_stage_clock.offset_left = -85
	_stage_clock.offset_right = 85
	_stage_clock.offset_top = 17
	_stage_clock.offset_bottom = 54
	_stage_clock.modulate = Color(1, 1, 1, 0.9)
	_native_gradient_rect(_stage_clock,Vector2.ZERO,Vector2(170,37),Color(12.0/255,13.0/255,16.0/255,.72),Color(12.0/255,13.0/255,16.0/255,0))
	_stage_clock.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_stage_timer_label = _native_hud_label(_stage_clock, "00:00", Vector2(0, 6), 12,
		Color(215.0 / 255, 207.0 / 255, 189.0 / 255, 0.78), 400.0, "cinzel_hell") # 366: weight 미지정=400
	_stage_timer_label.size.x = 170
	_stage_timer_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	var progress_bg := ColorRect.new()
	_stage_clock.add_child(progress_bg)
	progress_bg.position = Vector2(12, 27)
	progress_bg.size = Vector2(146, 2)
	progress_bg.color = Color(0, 0, 0, 0.45)
	_stage_progress_fill = _native_gradient_rect(progress_bg, Vector2.ZERO, Vector2(0, 2),
		Color(183.0 / 255, 166.0 / 255, 129.0 / 255, 0.8), Color(183.0 / 255, 166.0 / 255, 129.0 / 255, 0.8))
	# ── 스킬 슬롯 아이콘 — meters(NativeSkillBar, 0.9 스케일) 위 .qs 셀 + qs-icon ──
	var meters: Control = _root.get_node("NativeSkillBar")
	for slot_id in NATIVE_SLOT_LEFTS:
		var cell := Panel.new()
		cell.name = "NativeSlot_" + slot_id
		meters.add_child(cell)
		cell.position = Vector2(float(NATIVE_SLOT_LEFTS[slot_id]) * NATIVE_SLOT_SCALE,
			NATIVE_SLOT_TOP * NATIVE_SLOT_SCALE)
		cell.size = NATIVE_SLOT_SIZE * NATIVE_SLOT_SCALE
		cell.mouse_filter = Control.MOUSE_FILTER_IGNORE
		var cell_style := StyleBoxFlat.new()
		# .qs(974): border rgba(145,64,46,.88)/radius11, bg 180deg rgba(28,12,13,.84)→
		# rgba(10,6,7,.94) — StyleBoxFlat은 단색이라 중간색 평면 근사(기록).
		cell_style.bg_color = Color(19.0 / 255, 9.0 / 255, 10.0 / 255, 0.89)
		cell_style.border_color = Color(145.0 / 255, 64.0 / 255, 46.0 / 255, 0.88)
		cell_style.set_border_width_all(1)
		cell_style.set_corner_radius_all(int(11 * NATIVE_SLOT_SCALE))
		cell.add_theme_stylebox_override("panel", cell_style)
		var icon := TextureRect.new()
		icon.name = "Icon"
		cell.add_child(icon)
		# .qs-icon(740): inset 3px, object-fit contain
		icon.position = Vector2(4, 4) * NATIVE_SLOT_SCALE
		icon.size = cell.size - Vector2(8, 8) * NATIVE_SLOT_SCALE
		icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		icon.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
		icon.mouse_filter = Control.MOUSE_FILTER_IGNORE
		_slot_icons[slot_id] = icon
		_slot_icon_files[slot_id] = ""
		# P2-005b 쿨다운 sweep(_skCdSweep 44136): conic rgba(0,0,0,.55) + 중앙 노랑 초
		var sweep := Control.new()
		sweep.name = "Sweep"
		cell.add_child(sweep)
		sweep.size = cell.size
		sweep.mouse_filter = Control.MOUSE_FILTER_IGNORE
		sweep.set_meta("pct", 0.0)
		sweep.draw.connect(func() -> void:
			var pct: float = float(sweep.get_meta("pct", 0.0))
			if pct <= 0.0:
				return
			var deg: int = int(pct * 360.0) # ~~(pct*360)
			var points := PackedVector2Array([sweep.size / 2.0])
			for step in range(deg + 1):
				var rad: float = deg_to_rad(float(step) - 90.0)
				points.append(sweep.size / 2.0 + Vector2(cos(rad), sin(rad)) * sweep.size.length())
			if points.size() >= 3:
				sweep.draw_colored_polygon(points, Color(0, 0, 0, 0.55)))
		sweep.clip_contents = true
		var sweep_label := _native_hud_label(cell, "", Vector2(0, cell.size.y / 2.0 - 8.0), 12, Color("ffee66"), 900.0, "font") # 44147 weight 900·body --font
		sweep_label.size.x = cell.size.x
		sweep_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		_slot_sweeps[slot_id] = sweep
		_slot_sweep_labels[slot_id] = sweep_label


func _native_slot_skill_id(slot_id: String, p: Dictionary) -> String:
	# DEMO11-42: same selected owner as dispatcher; protected fixed keys below stay unchanged.
	var dispatch = preload("res://scripts/native_skill_dispatch.gd")
	for key in dispatch.HUD_SLOTS:
		if dispatch.HUD_SLOTS[key] == slot_id:
			var selected: Dictionary = dispatch.RULES.slot_value(key,p,p.get("skillSlots"),p.get("ultSlot"))
			return str(selected.value) if selected.get("status") == "READY" and selected.get("value") != null and int(p.get("skills",{}).get(selected.value,0)) > 0 else ""
	var skills: Dictionary = p.get("skills") if p.get("skills") is Dictionary else {}
	var fused: Dictionary = p.get("_fused") if p.get("_fused") is Dictionary else {}
	var slots: Array = p.get("skillSlots") if p.get("skillSlots") is Array else []
	match slot_id:
		"qs0", "qs1", "qs2", "qs3", "qs5":
			# updateQS: SKILL_SLOTS[i] 습득 시 아이콘 — 포트는 숫자 슬롯 배정 미이식(빈 칸).
			var index := int(slot_id.trim_prefix("qs"))
			var sid: String = str(slots[index]) if index < slots.size() and slots[index] != null else ""
			return sid if not sid.is_empty() and int(skills.get(sid, 0)) >= 1 else ""
		"ultSlot":
			return str(p.get("ultSlot", "")) if p.get("ultSlot") != null else ""  # 신규 null(27682)
		"skSlotLMB":
			# 44902: 합체(slamStorm/whirlDet)·회전참 습득 시 whirlwind, 아니면 activeLMBSk
			if fused.get("slamStorm") == true or fused.get("whirlDet") == true or int(skills.get("whirlwind", 0)) >= 1:
				return "whirlwind"
			return str(p.get("activeLMBSk", "kiSlash"))
		"skSlotRMB":
			# 44915: 고정 maliceSwipe + _skFuseIcon: shieldFuse 합체 시 shieldFuse 아이콘
			return "shieldFuse" if fused.get("shieldFuse") == true else "maliceSwipe"
		"skSlot0":
			return str(p.get("activeChargeSk", "charge"))
		"qsE":
			return str(p.get("activeMagicSk", "fireball"))
		"qsQ":
			# 44908: peaceShield만 holyDome 아이콘, 그 외 자기 id(parry→alias peaceShield)
			var q := str(p.get("activeQSk", "parry"))
			return "holyDome" if q == "peaceShield" else q
		"skSlotCT":
			return str(p.get("activeCtSk", "ghostWalk"))
		"skSlot1":
			var sid4: String = str(slots[4]) if slots.size() > 4 and slots[4] != null else ""
			return sid4 if not sid4.is_empty() and int(skills.get(sid4, 0)) >= 1 else ""
	return ""


func _native_pulse(key: String, value: Variant, label: Label) -> void:
	# _hudPulse(60240) + hudCountPulse(381): translateY 1→-1→0, opacity .5→1,
	# 45% 지점 색 #d8c49d — .34s ease-out.
	if _pulse_values.get(key) == value:
		return
	var had_previous := _pulse_values.has(key)
	_pulse_values[key] = value
	if not had_previous:
		return
	var base_y := label.position.y
	label.position.y = base_y + 1
	label.modulate = Color(1, 1, 1, 0.5)
	var tween := create_tween()
	tween.tween_property(label, "position:y", base_y - 1, 0.34 * 0.45)
	tween.parallel().tween_property(label, "modulate", Color("d8c49d"), 0.34 * 0.45)
	tween.tween_property(label, "position:y", base_y, 0.34 * 0.55)
	tween.parallel().tween_property(label, "modulate", Color(1, 1, 1, 1), 0.34 * 0.55)


func _refresh_native_first_fight_hud() -> void:
	if not is_instance_valid(_source_state) or _objective_values.is_empty():
		return
	var p: Variant = _source_state.read_current_p()
	var g: Variant = _source_state.read_current_g()
	if not p is Dictionary or not g is Dictionary:
		return
	# 60325 lvLbl / 60310~60312 expF·expTxt / 60322 killCnt / 60323 matCnt
	var lv := int(_hud_num(p.get("lv")))
	_native_pulse("lv", lv, _objective_values["lv"])
	_objective_values["lv"].text = _native_comma(lv)
	var exp_value := int(_hud_num(p.get("exp")))
	var max_exp := int(_hud_num(p.get("maxExp")))
	_objective_values["exp"].text = _native_comma(exp_value) + " / " + _native_comma(max_exp)
	if is_instance_valid(_exp_fill):
		_exp_fill.size.x = _exp_fill_full_width * clampf(
			(float(exp_value) / float(max_exp)) if max_exp > 0 else 0.0, 0.0, 1.0)
	# 60322: _regCur(지역 시스템 미이식) 폴백 = G._stageKills / (G._totalSpawned||0)
	var stage_kills := int(_hud_num(g.get("_stageKills")))
	var kill_total := int(_hud_num(g.get("_totalSpawned")))
	var regions: Variant=g.get("_regions")
	var region_current: int=int(_hud_num(g.get("_regCurIdx"))) if regions is Array else -1
	if regions is Array and region_current>=0 and region_current<regions.size():
		stage_kills=int(regions[region_current].kills)
		kill_total=int(regions[region_current].total)
	var kill_shown := mini(stage_kills,kill_total) if regions is Array or kill_total>0 else stage_kills
	_native_pulse("kill",kill_shown,_objective_values["kill"])
	_objective_values["kill"].text = _native_comma(kill_shown) + " / " + _native_comma(kill_total)
	var mats := int(_hud_num(g.get("mats")))
	_native_pulse("malice", mats, _objective_values["malice"])
	_objective_values["malice"].text = _native_comma(mats)
	# 60336: stageTimerHud = ~~(G.stageTime/60) → mm:ss / 진행바 = 처치/총 스폰(지역 미이식)
	if is_instance_valid(_stage_timer_label):
		var seconds := int(_hud_num(g.get("stageTime")) / 60.0)
		_stage_timer_label.text = "%02d:%02d" % [seconds / 60, seconds % 60]
		if is_instance_valid(_stage_progress_fill):
			var ratio := clampf(float(stage_kills) / float(kill_total), 0.0, 1.0) if kill_total > 0 else 0.0
			if regions is Array:
				var count:=0
				for region in regions:
					if region.cleared:count+=1
				ratio=float(count)/4.0
			_stage_progress_fill.size.x = 146.0 * ratio
	# 슬롯 아이콘 — 변경분만 텍스처 로드
	for slot_id in _slot_icons:
		var skill_id := _native_slot_skill_id(slot_id, p)
		var file := str(NATIVE_SKILL_ICON_FILES.get(skill_id, "")) if not skill_id.is_empty() else ""
		if _slot_icon_files[slot_id] == file:
			continue
		_slot_icon_files[slot_id] = file
		var icon: TextureRect = _slot_icons[slot_id]
		if file.is_empty():
			icon.texture = null
			continue
		icon.texture = _skill_icon_textures.get(file)
	# P2-005b — 쿨다운 sweep 갱신 (소유자: 스킬 슬롯 어댑터)
	if _skill_cooldowns.is_valid():
		var cds: Variant = _skill_cooldowns.call()
		if cds is Dictionary:
			for slot_id in _slot_sweeps:
				var entry: Variant = (cds as Dictionary).get(slot_id)
				var sweep: Control = _slot_sweeps[slot_id]
				var pct: float = float((entry as Dictionary).get("pct", 0.0)) if entry is Dictionary else 0.0
				if float(sweep.get_meta("pct", 0.0)) != pct:
					sweep.set_meta("pct", pct)
					sweep.queue_redraw()
				(_slot_sweep_labels[slot_id] as Label).text = str((entry as Dictionary).get("text", "")) if entry is Dictionary else ""


static func _hud_num(value: Variant) -> float:
	return float(value) if (value is int or value is float) and is_finite(float(value)) else 0.0


# ── 개발 오버레이: 원본 화면에 없음 — 기본 숨김, F3/공개 API 토글 (노드·시그널 유지) ──
func bind_native_skill_cooldowns(provider: Callable) -> bool:
	# P2-005b — 슬롯 쿨다운 공급자(44136 _skCdSweep 소유자) 바인딩.
	if not provider.is_valid():
		return false
	_skill_cooldowns = provider
	return true


func set_native_debug_overlay_visible(visible_now: bool) -> void:
	_debug_overlay_visible = visible_now
	for node in _debug_overlay_nodes:
		if is_instance_valid(node):
			node.visible = visible_now


func is_native_debug_overlay_visible() -> bool:
	return _debug_overlay_visible


func _unhandled_key_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and (event as InputEventKey).keycode == KEY_F3:
		set_native_debug_overlay_visible(not _debug_overlay_visible)


func get_native_first_fight_hud_snapshot() -> Dictionary:
	var icon_files := {}
	for slot_id in _slot_icon_files:
		icon_files[slot_id] = _slot_icon_files[slot_id]
	return {"ready": is_instance_valid(_source_state) and not _objective_values.is_empty(),
		"lv_text": _objective_values["lv"].text if _objective_values.has("lv") else "",
		"exp_text": _objective_values["exp"].text if _objective_values.has("exp") else "",
		"kill_text": _objective_values["kill"].text if _objective_values.has("kill") else "",
		"malice_text": _objective_values["malice"].text if _objective_values.has("malice") else "",
		"timer_text": _stage_timer_label.text if is_instance_valid(_stage_timer_label) else "",
		"exp_fill_px": _exp_fill.size.x if is_instance_valid(_exp_fill) else -1.0,
		"slot_icon_files": icon_files,
		"debug_overlay_visible": _debug_overlay_visible,
		"serif_font_loaded": ResourceLoader.exists(SERIF_FONT_PATH),
		"unported": ["미니맵(mmWrap)", "hudCorner 화폐(✦ SP/◇ CP)", "지역(_regCur) 분모·진행바 4지역",
			"쿨다운 sweep(쿨다운 소유자 미이식)",
			"숫자/F/Z 슬롯 스킬(시작 스킬 지급 EXTERNAL 미이식)",
			"타이머 전진(G.on 점등 미이식 — 초기화·커튼 계약이 pre-stage on=false 유지 명시: 타이머 UI는 G.stageTime 소비만)"]}

# ═══════════════════ P2-002b 미니맵 + hudCorner 화폐 (표시 전용 소비자) ═══════════════════
# 원본 근거: #mmWrap 2585(캔버스 130×130 + img/mm_frame.png 166×166) + CSS 382~385
# (top8/left8·scale .85)·952(#mmWrap.on opacity .94 — 재정의 최신값)·953(frame 필터) /
# drawMM 60177~60234: 캐시(타일 1=벽 스킵, 2=#887766, 4=#443355, 그 외 #665544;
# mmW130·pad4·sc=min) + 20프레임 주기, 바닥 rgba(0,0,0,.45), 플레이어 초상 마커
# (_mmDrawPlayerMarker 60142: 14px 원형 초상+방향 삼각형+흑백 이중 링,
# img/ui/minimap_warrior.png), 소환굴(SPAWN_HOLE.col #aa4444), 적 2×2 ELC색(30프레임
# 갱신·60캡), 출구 ▲는 !G.bossAlive일 때만(60109 — 신규 bossAlive=true라 비노출) /
# hudCorner 2666~2669 + CSS 327~329(top178/left16·'Cinzel' 폴백·.62rem·opacity .48·
# 색 rgba(196,187,168,.72)), 값 60325: spCnt `✦ P.sp( +P.ap)`·cpHud `◇ calcCP().total`
# (≥1e5 compact 60237 / 그 외 en-US 콤마) — ✦(U+2726)·◇(U+25C7)는 텍스트 글리프(이모지 아님).
# calcCP 49487~49509 전문 포트(statStr=1 27993, pDefAdd=_altDef*30 28019).
const MINIMAP_ELC := ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"] # ELC 14338
const MINIMAP_SPAWN_HOLE_COLOR := "#aa4444" # SPAWN_HOLE.col 31029
const MINIMAP_W := 130.0
const MINIMAP_PAD := 4.0
const MINIMAP_TILE_SIZE := 40.0 # T


func _build_native_minimap() -> void:
	var wrap := Control.new()
	wrap.name = "NativeMinimap"
	_root.add_child(wrap)
	wrap.position = Vector2(8, 8)        # CSS 382 top8/left8
	wrap.size = Vector2(166, 166)
	wrap.scale = Vector2(0.85, 0.85)     # scale(var(--ui-scale)*.85)
	wrap.modulate = Color(1, 1, 1, 0.94) # 952 #mmWrap.on
	wrap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_minimap_canvas = Control.new()
	_minimap_canvas.name = "MinimapCanvas"
	wrap.add_child(_minimap_canvas)
	_minimap_canvas.position = Vector2(18, 18) # #mm CSS 386 top18/left18
	_minimap_canvas.size = Vector2(MINIMAP_W, MINIMAP_W)
	_minimap_canvas.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_minimap_canvas.draw.connect(_draw_native_minimap)
	var frame := TextureRect.new()
	frame.name = "MinimapFrame"
	wrap.add_child(frame)
	frame.size = Vector2(166, 166)
	frame.self_modulate=Color(1.05,1.05,1.05)
	if ResourceLoader.exists("res://assets/ui/mm_frame.png"):
		frame.texture = load("res://assets/ui/mm_frame.png")
	frame.stretch_mode = TextureRect.STRETCH_SCALE
	frame.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	frame.mouse_filter = Control.MOUSE_FILTER_IGNORE
	if ResourceLoader.exists("res://assets/ui/minimap_warrior.png"):
		_minimap_portrait = load("res://assets/ui/minimap_warrior.png")


func _native_minimap_build_cache() -> bool:
	# drawMM 캐시(60103~60131·_mmTickBuild 60082): 원본은 분산 빌드(카메라 주변 우선·
	# 프레임당 10행) — 포트는 고정 맵 1회 빌드로 같은 오프스크린 캐시를 생성(방식 근사 기록).
	if _minimap_cache_ready:
		return true
	if not is_instance_valid(_world):
		return false
	var map_data: Variant = _world.get("map_data")
	if not map_data is Dictionary or not (map_data as Dictionary).has("tiles"):
		return false
	var mw: int = int(map_data.get("width", 0))
	var mh: int = int(map_data.get("height", 0))
	if mw <= 0 or mh <= 0:
		return false
	var sc: float = minf((MINIMAP_W - MINIMAP_PAD * 2) / mw, (MINIMAP_W - MINIMAP_PAD * 2) / mh)
	var map_px_w := int(mw * sc)
	var map_px_h := int(mh * sc)
	var image := Image.create(map_px_w, map_px_h, false, Image.FORMAT_RGBA8)
	var tiles: Array = map_data["tiles"]
	var color_2 := Color("887766")
	var color_4 := Color("443355")
	var color_floor := Color("665544")
	for ty in range(mh):
		for tx in range(mw):
			var tv: int = int(tiles[ty * mw + tx])
			if tv == 1:
				continue # 벽=투명(바닥 rgba(0,0,0,.45) 노출) — 60090
			var color: Color = color_2 if tv == 2 else (color_4 if tv == 4 else color_floor)
			var px := int(tx * sc)
			var py := int(ty * sc)
			if px < map_px_w and py < map_px_h:
				image.set_pixel(px, py, color)
	_minimap_cache = ImageTexture.create_from_image(image)
	_minimap_sc = sc
	_minimap_origin = Vector2(int((MINIMAP_W - map_px_w) / 2.0), int((MINIMAP_W - map_px_h) / 2.0))
	_minimap_cache_ready = true
	return true


func _draw_native_minimap() -> void:
	if not _minimap_cache_ready:
		return
	var canvas := _minimap_canvas
	# MX.fillStyle rgba(0,0,0,.45) 바닥 (60195)
	canvas.draw_rect(Rect2(Vector2.ZERO, Vector2(MINIMAP_W, MINIMAP_W)), Color(0, 0, 0, 0.45))
	canvas.draw_texture(_minimap_cache, _minimap_origin)
	var regions: Node=get_parent().get_node_or_null("NativeRegions")
	if is_instance_valid(regions):regions.draw_minimap(canvas,_minimap_cache,_minimap_origin,_minimap_sc)
	var g: Variant = _source_state.read_current_g() if is_instance_valid(_source_state) else null
	# 소환굴 (60216~60222) — 신규 G.spawnHoles=[] (64395 계열)
	if g is Dictionary and (g as Dictionary).get("spawnHoles") is Array:
		for hole in (g as Dictionary)["spawnHoles"]:
			if not hole is Dictionary:
				continue
			var hx: float = _minimap_origin.x + float(hole.get("x", 0)) / MINIMAP_TILE_SIZE * _minimap_sc
			var hy: float = _minimap_origin.y + float(hole.get("y", 0)) / MINIMAP_TILE_SIZE * _minimap_sc
			var hole_r: float = 1.5 + float(hole.get("size", 0)) * 1.5
			canvas.draw_circle(Vector2(hx, hy), hole_r, Color(MINIMAP_SPAWN_HOLE_COLOR, 0.85))
			canvas.draw_arc(Vector2(hx, hy), hole_r, 0, TAU, 16, Color.BLACK, 0.5)
	# 적 2×2 (60224~60233 — 버퍼는 _refresh에서 30프레임 주기 갱신·60캡)
	for point in _minimap_enemy_points:
		canvas.draw_rect(Rect2(point["pos"] - Vector2(1, 1), Vector2(2, 2)), point["color"])
	# 플레이어 초상 마커 (_mmDrawPlayerMarker 60142~60166)
	if is_instance_valid(_player):
		var pp: Vector2 = _minimap_origin + Vector2(_player.global_position) / MINIMAP_TILE_SIZE * _minimap_sc
		var radius := 7.0 # D=14
		var facing: Variant = _player.get("facing")
		if facing is Vector2 and (facing as Vector2).length_squared() > 0.0:
			var angle: float = (facing as Vector2).angle()
			var tip := pp + Vector2(radius + 5.5, 0).rotated(angle)
			var base_a := pp + Vector2(radius + 0.5, -3.4).rotated(angle)
			var base_b := pp + Vector2(radius + 0.5, 3.4).rotated(angle)
			canvas.draw_colored_polygon(PackedVector2Array([tip, base_a, base_b]), Color.WHITE)
			canvas.draw_polyline(PackedVector2Array([tip, base_a, base_b, tip]), Color.BLACK, 1.0)
		if _minimap_portrait != null:
			canvas.draw_texture_rect(_minimap_portrait, Rect2(pp - Vector2(radius, radius), Vector2(14, 14)), false)
		else:
			canvas.draw_circle(pp, radius, Color("e8e2d0")) # 최종 폴백(60160)
		canvas.draw_arc(pp, radius + 0.5, 0, TAU, 24, Color.BLACK, 2.0)
		canvas.draw_arc(pp, radius - 0.5, 0, TAU, 24, Color.WHITE, 1.0)


func _build_native_hud_corner() -> void:
	# 실제 화면은 ui-refinement.css 1319~1322 재정의가 결정 — 웹 런타임 getComputedStyle
	# 실측(web_hud_measure.json): rect(16,188) 108×58.3, bg 115deg rgba(21,19,18,.9)→
	# rgba(13,15,17,.84), border-top 1px rgba(178,140,86,.4)·border-left 2px
	# rgba(184,141,81,.64), padding 7 10 8, opacity .94, 글자 rgba(238,222,194,.93)
	# 11.2px·min-width 86, 행 구분선 border-top 1px rgba(164,127,82,.2)+pad-top 4.
	# box-shadow(0 5px 20px)·inset 하이라이트는 근사 생략 기록.
	var corner := Control.new()
	corner.name = "NativeHudCorner"
	_root.add_child(corner)
	corner.position = Vector2(16, 188)   # 실측 rect.top 188 (CSS 327 top178 + inset)
	corner.size = Vector2(108, 58)
	corner.modulate = Color(1, 1, 1, 0.94) # ui-refinement 1320 #hudCorner.on
	corner.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_native_gradient_rect(corner, Vector2.ZERO, corner.size,
		Color(21.0 / 255, 19.0 / 255, 18.0 / 255, 0.9), Color(13.0 / 255, 15.0 / 255, 17.0 / 255, 0.84))
	var corner_bg: TextureRect = corner.get_child(0)
	(corner_bg.texture as GradientTexture2D).fill_from = Vector2(0.0, 0.0)
	(corner_bg.texture as GradientTexture2D).fill_to = Vector2(0.91, 0.42) # 115deg
	var top_line := ColorRect.new()
	corner.add_child(top_line)
	top_line.size = Vector2(corner.size.x, 1)
	top_line.color = Color(178.0 / 255, 140.0 / 255, 86.0 / 255, 0.4)
	var left_line := ColorRect.new()
	corner.add_child(left_line)
	left_line.size = Vector2(2, corner.size.y)
	left_line.color = Color(184.0 / 255, 141.0 / 255, 81.0 / 255, 0.64)
	var ink := Color(238.0 / 255, 222.0 / 255, 194.0 / 255, 0.93) # 1321
	_sp_label = _native_hud_label(corner, "✦ 0", Vector2(12, 8), 11, ink, 400.0, "cinzel_hell")   # 실측 x28-16=12, y196-188=8
	var row_divider := ColorRect.new()
	corner.add_child(row_divider)
	row_divider.position = Vector2(12, 28)
	row_divider.size = Vector2(86, 1) # .hud-resource+.hud-resource border-top (1322)
	row_divider.color = Color(164.0 / 255, 127.0 / 255, 82.0 / 255, 0.2)
	_cp_label = _native_hud_label(corner, "◇ 0", Vector2(12, 33), 11, ink, 400.0, "cinzel_hell")  # pad-top 4 + 행


## calcCP(49487~49509) 전문 — 표시 전용 계산(소유자 getter 입력만).
func _native_calc_cp(p: Dictionary, stats: Dictionary, passives: Dictionary, equipped: Dictionary) -> int:
	var atk: float = _hud_num(p.get("baseAtk")) * 2.0 * 1.0 # statStr()=1 (27993)
	var def_value: float = (_hud_num(p.get("baseDef")) + _hud_num(p.get("_altDef")) * 30.0) * 3.0 # pDefAdd 28019
	var extra: float = _hud_num(p.get("lv")) * 10.0 + _hud_num(p.get("mhp")) * 0.5 \
		+ _hud_num(p.get("mst")) * 0.3 + _hud_num(p.get("mmp")) * 0.3
	extra += (_hud_num(stats.get("str")) + _hud_num(stats.get("dex")) + _hud_num(stats.get("int")) \
		+ _hud_num(stats.get("lck"))) * 2.0
	var passive_sum := 0.0
	for key in passives:
		passive_sum += _hud_num(passives[key])
	extra += passive_sum * 15.0
	for slot in equipped:
		var it: Variant = equipped[slot]
		if not it is Dictionary:
			continue
		atk += _hud_num(it.get("atk")) * 2.0
		def_value += _hud_num(it.get("def")) * 3.0
		extra += _hud_num(it.get("spd")) * 40.0
		extra += _hud_num(it.get("wStagger")) * 1.5 + _hud_num(it.get("wRange")) * 0.4
		extra += _hud_num(it.get("bowRange")) * 0.3 + _hud_num(it.get("bowSpd")) * 30.0
		extra += _hud_num(it.get("charge")) * 1.0 + _hud_num(it.get("chargeDist")) * 0.5 \
			+ _hud_num(it.get("bonusChargeDist")) * 5.0 + _hud_num(it.get("chargeW")) * 1.0 \
			+ _hud_num(it.get("chargeAoE")) * 1.5
		extra += _hud_num(it.get("stagger")) * 1.5
		extra += _hud_num(it.get("bonusSt")) * 1.5
		extra += _hud_num(it.get("stRegen")) * 200.0 + _hud_num(it.get("mpRegen")) * 500.0
		extra += _hud_num(it.get("splashR")) * 1.0 + _hud_num(it.get("splashMul")) * 80.0 \
			+ _hud_num(it.get("magicPen")) * 30.0 + _hud_num(it.get("bonusRange")) * 8.0
		if it.get("elements") is Array:
			for em in it["elements"]:
				if em is Dictionary:
					extra += _hud_num(em.get("dmg")) * 0.8
	return int(atk + def_value + extra)


static func _native_compact(n: float) -> String:
	# _hudCompactNumber 60237
	if n >= 1e9:
		return "%.2fB" % (n / 1e9)
	if n >= 1e6:
		return "%.2fM" % (n / 1e6)
	if n >= 1e3:
		return "%.1fK" % (n / 1e3)
	return str(int(n))


func _refresh_native_minimap_and_corner() -> void:
	if not is_instance_valid(_source_state):
		return
	# hudCorner 값 (60325)
	var p: Variant = _source_state.read_current_p()
	if p is Dictionary and is_instance_valid(_sp_label):
		var sp := int(_hud_num((p as Dictionary).get("sp")))
		var ap := int(_hud_num((p as Dictionary).get("ap")))
		_sp_label.text = ("✦ %d +%d" % [sp, ap]) if ap > 0 else ("✦ %d" % sp)
		var stats: Variant = _source_state.read_current_stats()
		var passives: Variant = _source_state.read_current_passives()
		var inventory: Variant = _source_state.read_current_inventory()
		if stats is Dictionary and passives is Dictionary and inventory is Dictionary:
			var cp: int = _native_calc_cp(p, stats, passives, (inventory as Dictionary).get("equipped", {}))
			_cp_label.text = "◇ " + (_native_compact(cp) if cp >= 100000 else _native_comma(cp))
	# 미니맵 — 20프레임 주기 리드로(60180), 적 버퍼 30프레임 주기(60226)
	if not is_instance_valid(_minimap_canvas):
		return
	if not _native_minimap_build_cache():
		return
	var frame: float = float(_world.get_native_frame()) if _world.has_method("get_native_frame") else 0.0
	if frame - _minimap_enemy_frame >= 30.0 or _minimap_enemy_frame < 0.0:
		_minimap_enemy_frame = frame
		_minimap_enemy_points = []
		if _world.has_method("get_enemies"):
			for enemy in _world._enemies:
				if _minimap_enemy_points.size() >= 60:
					break
				if not is_instance_valid(enemy) or enemy.get("alive") != true:
					continue
				var data: Variant = enemy.get("data")
				var el: int = int((data as Dictionary).get("element_id", 0)) if data is Dictionary else 0
				_minimap_enemy_points.append({
					"pos": _minimap_origin + Vector2(enemy.global_position) / MINIMAP_TILE_SIZE * _minimap_sc,
					"color": Color(MINIMAP_ELC[clampi(el, 0, MINIMAP_ELC.size() - 1)])})
	if frame - _minimap_last_frame >= 20.0 or _minimap_last_frame < 0.0:
		_minimap_last_frame = frame
		_minimap_canvas.queue_redraw()


func get_native_minimap_corner_snapshot() -> Dictionary:
	return {"minimap_cache_ready": _minimap_cache_ready,
		"minimap_sc": _minimap_sc, "minimap_origin": [_minimap_origin.x, _minimap_origin.y],
		"minimap_enemy_points": _minimap_enemy_points.size(),
		"minimap_portrait_loaded": _minimap_portrait != null,
		"sp_text": _sp_label.text if is_instance_valid(_sp_label) else "",
		"cp_text": _cp_label.text if is_instance_valid(_cp_label) else "",
		"unported": ["필드보스 전투·게이트 연출·정화 SFX 미연결(P3-003 잔여)",
			"출구 ▲(!bossAlive 조건 — 신규 true)", "분산 빌드(_mmTickBuild — 고정 맵 1회 빌드 근사)",
			"맵 오브젝트 마커(bonfire/trap/altar — 1장 데이터에 없음)", "frame drop-shadow·brightness 필터(953)",
			"hudCorner box-shadow·inset 하이라이트 근사 생략",
			"spCnt 클릭(J 능력치 패널 미이식)",
			"적 점 색 데이터 차(규칙 ELC[e.el] 동일 — 웹 el0 회백 vs 포트 encounter element_id 3 보라: 데이터 소유 wt-p2g)"]}


func _notification(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and is_instance_valid(_root):call_deferred("_refresh")
