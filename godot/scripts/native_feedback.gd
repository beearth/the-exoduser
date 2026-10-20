extends Node

const SOURCE_TEXT_IDS := {"MP 부족!": "0338", "ST 부족!": "0339", "악의 부족!": "0340", "얼음보주 안에선 사용 불가!": "1044", "악의 부족! (10)": "1049", "악의 부족! (5)": "1523+5"}
const PH_BLUR_RADIUS := 25.0
var _main: Node
var _state: Node
var _player: Node2D
var _notice: Label
var _glow_label: Label
var _glow: TextureRect
var _blur_source: SubViewport
var _blur_horizontal: SubViewport
var _horizontal: TextureRect
var _deadline := 0
var _notice_data: Dictionary = {}
var _serial := 0
var _levels := 0
var _pickups := 0
var vfx: Node2D
var audio: Node

static func install(owner: Node) -> Node:
	var consumer := preload("res://scripts/native_feedback.gd").new()
	consumer.name = "NativeFeedback"
	owner.add_child(consumer)
	if not consumer.configure(owner):
		push_error("Native feedback owners unavailable; presentation not installed.")
	return consumer

func configure(owner: Node) -> bool:
	_main = owner
	_state = owner.get("source_state")
	_player = owner.get("player")
	var hud: Node = owner.get("hud")
	if not is_instance_valid(_state) or not is_instance_valid(_player) or not is_instance_valid(hud):
		return false
	process_mode = Node.PROCESS_MODE_ALWAYS
	_notice = Label.new()
	_notice.name = "SourcePH"
	_notice.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var font: FontVariation = hud._native_serif(900.0).duplicate()
	font.spacing_glyph = 6
	_notice.add_theme_font_override("font", font)
	_notice.add_theme_font_size_override("font_size", 29)
	_notice.visible = false
	_notice.modulate.a = 0.0
	_blur_source = SubViewport.new()
	_blur_source.transparent_bg = true
	_blur_source.disable_3d = true
	_blur_source.render_target_update_mode = SubViewport.UPDATE_DISABLED
	add_child(_blur_source)
	_glow_label = Label.new()
	_glow_label.add_theme_font_override("font", font)
	_glow_label.add_theme_font_size_override("font_size", 29)
	_blur_source.add_child(_glow_label)
	_blur_horizontal = SubViewport.new()
	_blur_horizontal.transparent_bg = true
	_blur_horizontal.disable_3d = true
	_blur_horizontal.render_target_update_mode = SubViewport.UPDATE_DISABLED
	add_child(_blur_horizontal)
	_horizontal = _blur_rect(_blur_source.get_texture(), Vector2.RIGHT)
	_blur_horizontal.add_child(_horizontal)
	_glow = _blur_rect(_blur_horizontal.get_texture(), Vector2.DOWN)
	_glow.visible = false
	hud.add_child(_glow)
	hud.add_child(_notice)
	audio = preload("res://scripts/native_feedback_audio.gd").new()
	audio.name = "SourceFeedbackAudio"
	add_child(audio)
	audio.configure(_main)
	vfx = preload("res://scripts/native_level_up_vfx.gd").new()
	vfx.name = "SourceLevelUpVfx"
	_main.get("world").add_child(vfx)
	vfx.configure(_main)
	_state.presentation_requested.connect(_on_reward)
	return true

func _blur_rect(texture: Texture2D, axis: Vector2) -> TextureRect:
	var rect := TextureRect.new()
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	rect.texture = texture
	var shader := ShaderMaterial.new()
	shader.shader = preload("res://shaders/source_ph_glow.gdshader")
	shader.set_shader_parameter("axis", axis)
	shader.set_shader_parameter("blur_radius", PH_BLUR_RADIUS)
	rect.material = shader
	return rect

func show_ph(text: String, color: String, duration_ms: int = 500) -> void:
	_serial += 1
	_deadline = Time.get_ticks_msec() + duration_ms
	_notice_data = {"text": text, "color": color, "duration_ms": duration_ms, "visible": true, "source_translation_id": SOURCE_TEXT_IDS.get(text, "source_literal"), "blur_radius": PH_BLUR_RADIUS}
	_notice.text = _main.get("world").localize_native_text(text)
	_notice.add_theme_color_override("font_color", Color(color))
	_notice.visible = true
	_glow_label.text = _notice.text
	_glow_label.add_theme_color_override("font_color", Color(color))
	_glow_label.reset_size()
	var padding: int = int(ceil(PH_BLUR_RADIUS * 3.0 / 2.0))
	_glow_label.position = Vector2(padding, padding)
	var size: Vector2i = Vector2i(_glow_label.size.ceil()) + Vector2i.ONE * padding * 2
	_blur_source.size = size
	_blur_horizontal.size = size
	_horizontal.size = size
	_glow.size = size
	_blur_source.render_target_update_mode = SubViewport.UPDATE_ONCE
	_blur_horizontal.render_target_update_mode = SubViewport.UPDATE_ONCE
	var profile: Dictionary = _player.get_native_character_profile_snapshot()
	if profile.get("index") == 1 and (text.begins_with("MP 부족!") or text.begins_with("ST 부족!") or text.begins_with("HP 부족!") or text.begins_with("악의 부족!")):
		audio.play_resource_voice()

func _on_reward(kind: String, data: Dictionary) -> void:
	if kind == "levelup":
		_levels += 1
		var passives: Variant = _main.get("source_providers").get_provider_bundle().current_passives.call()
		if not passives is Dictionary:
			push_error("Level presentation stopped: PASSIVES reader unavailable.")
			return
		var demonic: bool = float(passives.get("pDemon", 0)) > float(passives.get("pHuman", 0))
		for text in data.get("texts", []):
			text["color"] = "#d38aff" if demonic else "#ffdd00"
		show_ph("TRANSCEND!" if int(data.lv) > 1000 else "LEVEL UP!", "#d38aff" if demonic else "#ffdd00", 2500)
		audio.play_source("levelup")
		vfx.trigger(int(data.levels), demonic)
	elif kind == "pickup":
		_pickups += 1
		audio.play_source("pickup")

func _process(delta: float) -> void:
	if not is_instance_valid(_notice) or _notice_data.is_empty():
		return
	var remaining: int = _deadline - Time.get_ticks_msec()
	var target: float = 1.0 if remaining > 0 else 0.0
	_notice.modulate.a = move_toward(_notice.modulate.a, target, delta / 0.1)
	_notice.visible = remaining > 0 or _notice.modulate.a > 0.0
	_notice_data["visible"] = _notice.visible
	_notice.reset_size()
	_notice.position = Vector2((_notice.get_viewport_rect().size.x - _notice.size.x) / 2.0, _notice.get_viewport_rect().size.y - 180.0 - _notice.size.y)
	_glow.visible = _notice.visible
	_glow.modulate.a = _notice.modulate.a
	_glow.position = _notice.position - _glow_label.position

func snapshot() -> Dictionary:
	return {"ready": is_instance_valid(_notice) and is_instance_valid(vfx), "notice": _notice_data.duplicate(true),
		"notice_serial": _serial, "level_events": _levels, "pickup_events": _pickups,
		"vfx": vfx.snapshot() if is_instance_valid(vfx) else {}, "audio": audio.snapshot() if is_instance_valid(audio) else {},
		"pickup_owner": "P2-006a_native_world_drops", "locale_scope": "existing_World_ko_identity"}

func _exit_tree() -> void:
	if is_instance_valid(_notice):
		_notice.queue_free()
	if is_instance_valid(_glow):
		_glow.queue_free()
	if is_instance_valid(vfx):
		vfx.queue_free()
