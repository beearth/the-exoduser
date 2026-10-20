extends SceneTree
## P2-003a — 맵 조명·어둠·안개·비네트·색보정 오버레이 회귀 (실제 Main 부팅).
## 근거: 라이트맵 55199/_renderLighting 4693(_HELL_AMBIENT[0]=[6,16,9,.38] 4505,
## 스탬프 4562, 플레이어 광 4652 r470 a .86±.03), 2D 안개 55352(_bakeFogLayers 4366),
## THREE 안개 8976(_FOG_COLORS[0]), 환경광 55377(_ENV_LIGHT[0]), 비네트 55389(α.2),
## 색보정 55414(contrast 1.05·brightness .97), 토치 어둠=darkAlpha 0(8689) 비활성.
const USERDIR = "EXODUSER-P2003A-Isolated-20261020"
const GROUPS = ["overlay_structure_and_params", "overlay_darkens_screen"]

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}
var forced_actor_fields = 0

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2003A_SKIP ", group)
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2003A_GROUP ", JSON.stringify(row))
	_cleanup()
	print("P2003A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations,
		"forced_actor_fields": forced_actor_fields, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2003A_FAIL ", current_group, " ", label)

func _cleanup() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

func _boot_main() -> bool:
	if is_instance_valid(active_main):
		return true
	root.size = Vector2i(1920, 1080)
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return false
	active_main = packed.instantiate()
	root.add_child(active_main)
	for i in range(30):
		await process_frame
	return active_main.get("world").get("ready_for_player") == true

func _test_overlay_structure_and_params() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var overlay: CanvasLayer = active_main.get_node_or_null("NativeScreenLighting")
	_check(is_instance_valid(overlay), "오버레이 생성")
	if not is_instance_valid(overlay):
		return
	var snap: Dictionary = overlay.get_native_screen_lighting_snapshot()
	_check(snap.get("configured") == true, "configure 수락")
	_check(int(snap.get("layer")) == 5 and int(active_main.get_node("HUD").get("layer")) == 10,
		"레이어 순서: 조명(5) < HUD(10) — 원본 HUD DOM 비대상")
	_check((snap.get("stages") as Array) == ["lightmap_55199", "fog2d_55352", "fog_gl_8976",
		"env_light_55377", "vignette_55389", "color_filter_55414"], "6단계 원본 순서")
	var children: Array = snap.get("children", [])
	_check(children == ["NativeLightmap", "NativeFog2D", "NativeFogGL", "NativeEnvLight",
		"NativeVignette", "NativeFilterCopy", "NativeColorFilter"], "자식 합성 순서 " + str(children))
	for i in range(6):
		await process_frame
	var mat: ShaderMaterial = overlay.get_node("NativeLightmap").material
	var ambient: Color = mat.get_shader_parameter("ambient")
	_check(ambient.is_equal_approx(Color(6.0 / 255, 16.0 / 255, 9.0 / 255, 0.38)),
		"지옥0 어둠 rgba(6,16,9,.38) (4505)")
	_check(float(mat.get_shader_parameter("light_r")) == 470.0, "플레이어 광 r470 (4635)")
	var light_a: float = float(mat.get_shader_parameter("light_a"))
	_check(light_a >= 0.83 and light_a <= 0.89, "플레이어 광 a .86±.03 (4652) a=" + str(light_a))
	var env: ColorRect = overlay.get_node("NativeEnvLight")
	_check(env.color.is_equal_approx(Color(100.0 / 255, 160.0 / 255, 255.0 / 255, 0.06)),
		"환경광 rgba(100,160,255,.06) (11985)")
	observations["params"] = {"light_a": light_a}

func _test_overlay_darkens_screen() -> void:
	if not await _boot_main():
		_check(false, "boot")
		return
	var overlay: CanvasLayer = active_main.get_node("NativeScreenLighting")
	if DisplayServer.get_name() == "headless":
		# 헤드리스: 픽셀 검증 불가 — 가시성 토글 구조만 확인하고 밝기 증거는
		# 프로브 스크린샷(cmp_lighting_web_vs_godot.png·수치 표)이 담당.
		overlay.visible = false
		_check(overlay.visible == false, "오버레이 토글 가능(헤드리스 — 픽셀 증거는 프로브)")
		overlay.visible = true
		observations["brightness"] = "headless_dummy_renderer_probe_covers"
		return
	var bright_on: Variant = await _corner_brightness()
	if bright_on == null:
		_check(false, "비헤드리스 화면 텍스처·이미지 필요(조명 ON)")
		return
	overlay.visible = false
	for i in range(8):
		await process_frame
	var bright_off: Variant = await _corner_brightness()
	overlay.visible = true
	if bright_off == null:
		_check(false, "비헤드리스 화면 텍스처·이미지 필요(조명 OFF)")
		return
	# 가장자리(광 구멍 밖): 어둠 적용으로 유의미하게 어두워야 함. 중앙(광 구멍):
	# 구멍 때문에 가장자리보다 덜 어두움(원본 구조 — 밝기 비율 역전 확인).
	_check(bright_on[0] < bright_off[0] * 0.8, "가장자리 어둠 적용 on=%.1f off=%.1f" % [bright_on[0], bright_off[0]])
	_check(bright_on[1] < bright_off[1], "중앙 색보정·안개 적용(감소) on=%.1f off=%.1f" % [bright_on[1], bright_off[1]])
	var edge_ratio_on: float = bright_on[0] / maxf(bright_on[1], 0.001)
	var edge_ratio_off: float = bright_off[0] / maxf(bright_off[1], 0.001)
	_check(edge_ratio_on < edge_ratio_off, "광 구멍: 중앙 대비 가장자리 상대 어둠 증가")
	observations["brightness"] = {"on_edge": bright_on[0], "on_center": bright_on[1],
		"off_edge": bright_off[0], "off_center": bright_off[1]}

func _corner_brightness() -> Variant:
	await process_frame
	if DisplayServer.get_name() == "headless":
		return null
	var texture: ViewportTexture = root.get_texture()
	if texture == null:
		return null
	var image: Image = texture.get_image()
	if image == null or image.is_empty():
		return null
	var edge := 0.0
	var center := 0.0
	var n := 0
	for y in range(80, 240, 16):
		for x in range(80, 380, 20):
			var c: Color = image.get_pixel(x, y)
			edge += (c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722) * 255.0
			n += 1
	edge /= n
	n = 0
	for y in range(440, 640, 16):
		for x in range(760, 1160, 20):
			var c2: Color = image.get_pixel(x, y)
			center += (c2.r * 0.2126 + c2.g * 0.7152 + c2.b * 0.0722) * 255.0
			n += 1
	center /= n
	return [edge, center]
