extends SceneTree
## P2-007a — UI 마감 3건 회귀(실제 Main 부팅, 격리 userdir).
## A 폰트: 원본 :root 토큰(game.html 115~118)·요소별 font-family(327·364·623·631·2587, parry-lesson.css 12·23)
##   스택 순서 그대로 Godot 체인(base_font→fallbacks)인지 + @import 로드 굵기(103~104) 매칭.
## B 검기: 실버 시트(16753)·색 변환 폐지(16743/16744)·잉크 층(16745~16751, 19210~19215)·명중 잉크(19370~)·
##   VFX 풀 알파(54584)·차지 미리보기(19246) — 상수·노드·셰이더 값.
## C 키 가이드 4컷: 63209/63295~63329 문구 조립·레이아웃(웹 Chromium 1920×1080 실측값)·Enter/클릭/Tab/Space 홀드·스킵.
const USERDIR = "EXODUSER-P2007A-Isolated-20261020"
const GROUPS = ["font_stacks_match_source_css", "hud_lesson_pet_fonts", "ki_slash_silver_ink",
	"guide_panel_steps_and_layout", "guide_tab_enter_skip_and_click"]
const FONTS := preload("res://scripts/native_ui_fonts.gd")
const GUIDE := preload("res://scripts/native_intro_key_guide_panel.gd")
const HIT := preload("res://scripts/hit_effect.gd")

# 웹 실측(Chromium, P2-007a 대조 캡처): 패널 높이·패널 기준 요소 top
const WEB_PANEL_H := [452.92, 496.23, 539.55, 490.92]
const WEB_ROW_TOPS_STEP0 := [207.0, 250.31, 293.63]
const EXPECTED := [
	{"progress": "1 / 4", "line": "눈을 떠", "title": "이동과 공격", "note": "", "next": "다음",
		"rows": [["W / S / A / D", "이동"], ["좌클릭", "무기 공격"], ["우클릭", "마법 (탭=투사체, 홀드=빔)"]]},
	{"progress": "2 / 4", "line": "정신 차려", "title": "패링과 이동", "note": "", "next": "다음",
		"rows": [["Q", "마법 패링 · 보호막"], ["E", "칼등 처내기"], ["L-SHIFT", "사슬 이동"],
			["방향키 더블탭 / Space+방향키", "전격이동"]]},
	{"progress": "3 / 4", "line": "이제 진짜 지옥이야", "title": "스킬", "note": "", "next": "다음",
		"rows": [["SPACE", "지옥강타 · 분노 폭발"], ["1", "가시덫"], ["F", "회복의 영역"],
			["CTRL", "CT 스킬 (뇌전걸음 / 얼음보주)"], ["T", "석궁 자동발사"]]},
	{"progress": "4 / 4", "line": "야! 몬스터다!!!", "title": "살아남아", "note": "물약은 설정한 HP% 이하 시 자동 사용",
		"next": "시작", "rows": [["R", "아이템 줍기"], ["TAB", "인벤토리"], ["ESC", "설정"]]}]
const HINT := "클릭 / Enter / Space · 다음 Space 길게 / ESC · 건너뛰기"

var active_main: Node
var assertions = 0
var failures = 0
var skipped: Array = []
var current_group = ""
var rows: Array = []
var observations: Dictionary = {}

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var isolated: bool = ProjectSettings.get_setting("application/config/use_custom_user_dir", false) == true \
		and ProjectSettings.get_setting("application/config/custom_user_dir_name", "") == USERDIR
	for group in GROUPS:
		current_group = group
		if not isolated:
			skipped.append(group)
			print("P2007A_SKIP ", group, " (isolated userdir ", USERDIR, " required)")
			continue
		var before_checks = assertions
		var before_failures = failures
		await call("_test_" + group)
		var row = {"group": group, "assertions": assertions - before_checks, "failures": failures - before_failures}
		rows.append(row)
		print("P2007A_GROUP ", JSON.stringify(row))
	_free_main()
	# QA-004: Main 해제 후 AudioServer mix/main-thread 종료 정리 기회(QA-003 방식).
	for _frame in range(12):
		await process_frame
	var _qa004_exit_after_ms: int = Time.get_ticks_msec() + 200
	while Time.get_ticks_msec() < _qa004_exit_after_ms:
		await process_frame
	print("P2007A_RESULT ", JSON.stringify({"groups": rows, "assertions": assertions,
		"failures": failures, "skipped": skipped, "observations": observations, "fallback_paths_used": false}))
	quit(1 if (failures > 0 or (skipped.size() < GROUPS.size() and assertions == 0)) else 0)

func _check(condition: bool, label: String) -> void:
	assertions += 1
	if not condition:
		failures += 1
		print("P2007A_FAIL ", current_group, " ", label)

func _free_main() -> void:
	if is_instance_valid(active_main):
		if active_main.get_parent() != null:
			active_main.get_parent().remove_child(active_main)
		active_main.free()
	active_main = null

func _boot(intro: bool) -> bool:
	_free_main()
	var packed: Variant = load("res://scenes/main.tscn")
	if not packed is PackedScene:
		_check(false, "actual Main PackedScene loads")
		return false
	active_main = packed.instantiate()
	if intro:
		active_main.set_meta("native_intro_boot", "intro")
	root.add_child(active_main)
	for i in range(10):
		await physics_frame
	var ready: bool = active_main.get("world").get("ready_for_player") == true
	_check(ready, "actual World ready_for_player")
	return ready

func _wait_ms(ms: int) -> void:
	var until := Time.get_ticks_msec() + ms
	while Time.get_ticks_msec() < until:
		await process_frame

func _key(keycode: Key, pressed: bool) -> void:
	var event := InputEventKey.new()
	event.keycode = keycode
	event.physical_keycode = keycode
	event.pressed = pressed
	Input.parse_input_event(event)

## 클릭: 실 디스플레이면 실제 GUI 라우팅(Input.parse_input_event), 헤드리스면 GUI가 마우스를 라우팅하지 않으므로
## (P2-007a 실측: headless hover=null·push_input 미도달, xvfb는 도달) 같은 이벤트를 패널 핸들러에 직접 전달하고 기록한다.
func _click(at: Vector2, panel: Control, target: String) -> void:
	var headless := DisplayServer.get_name() == "headless"
	observations["click_route"] = "handler_direct(headless GUI 미라우팅)" if headless else "gui(Input.parse_input_event)"
	for pressed in [true, false]:
		var event := InputEventMouseButton.new()
		event.button_index = MOUSE_BUTTON_LEFT
		event.pressed = pressed
		event.position = at
		event.global_position = at
		if not headless:
			Input.parse_input_event(event)
		elif target == "root":
			panel.call("_on_root_input", event)
		else:
			panel.call("_on_button_input", event, target)

func _chain(font: Font) -> Array:
	return FONTS.chain_families(font)

## game.html 115 --font:'Noto Sans KR','Apple SD Gothic Neo','Malgun Gothic',sans-serif — 번들 Noto Sans KR 뒤에
## 시스템에 Malgun Gothic이 실제로 있으면(Windows) CSS 순서대로 3순위로 붙는다. Linux/Mac 헤드리스는 없음.
func _body_font_chain() -> Array:
	return ["Noto Sans KR", "Malgun Gothic"] if FONTS.system_family_present("Malgun Gothic") else ["Noto Sans KR"]

func _label_chain(node: Variant) -> Array:
	return _chain((node as Label).get_theme_font("font")) if node is Label else []

# ── A-1: 원본 CSS 토큰과 스택 순서 ──
func _css_family_list(css_value: String) -> Array:
	var out: Array = []
	for part in css_value.split(","):
		out.append(part.strip_edges().trim_prefix("'").trim_suffix("'").trim_prefix("\"").trim_suffix("\""))
	return out

func _test_font_stacks_match_source_css() -> void:
	var html_path := ProjectSettings.globalize_path("res://").path_join("../game.html")
	var html := FileAccess.get_file_as_string(html_path)
	_check(not html.is_empty(), "원본 game.html 판독(" + html_path + ")")
	var tokens := {}
	for token in ["--font", "--font-hell", "--font-hell-title"]:
		var at := html.find("  " + token + ":")
		if at >= 0:
			var end := html.find(";", at)
			tokens[token] = _css_family_list(html.substr(at + token.length() + 3, end - at - token.length() - 3))
	observations["css_tokens"] = tokens
	_check(tokens.get("--font") == FONTS.STACKS["font"], "--font 스택 순서 = game.html 115")
	_check(tokens.get("--font-hell") == FONTS.STACKS["hell"], "--font-hell 스택 순서 = game.html 117")
	_check(tokens.get("--font-hell-title") == FONTS.STACKS["hell_title"], "--font-hell-title 스택 순서 = game.html 118")
	_check(html.contains("#stageClock{") and html.contains("font-family:'Cinzel',var(--font-hell)"), "'Cinzel',var(--font-hell) 원문 존재(364/327)")
	_check(FONTS.STACKS["cinzel_hell"] == ["Cinzel"] + FONTS.STACKS["hell"], "cinzel_hell = 'Cinzel' + --font-hell")
	_check(html.contains("#ikProgress{font:12px 'Cinzel',serif"), "'Cinzel',serif 원문(631)")
	_check(html.contains("font-family:'Malgun Gothic',sans-serif"), "#petSubtitle 'Malgun Gothic',sans-serif 원문(2587)")
	_check(html.contains("Cinzel:wght@700;900") and html.contains("Cinzel+Decorative:wght@700;900")
		and html.contains("Nanum+Myeongjo:wght@400;700;800") and html.contains("Noto+Serif+KR:wght@400;600;700;900"),
		"@import 로드 굵기(104) 원문")
	_check(FONTS.FAMILIES["Cinzel"]["weights"] == [700, 900] and FONTS.FAMILIES["Cinzel Decorative"]["weights"] == [700, 900]
		and FONTS.FAMILIES["Nanum Myeongjo"]["weights"] == [400, 700, 800], "공급자 굵기 집합 = @import 104")
	# CSS Fonts 4 §5.2 매칭
	_check(FONTS.match_weight(400, [700, 900]) == 700, "Cinzel 400 요청 → 700 face")
	_check(FONTS.match_weight(900, [400, 700, 800]) == 800, "Nanum 900 요청 → 800 face")
	_check(FONTS.match_weight(600, [400, 700, 800]) == 700, "Nanum 600 요청 → 700 face")
	_check(FONTS.match_weight(500, [400, 600, 700, 900]) == 400, "Noto Serif 500 요청 → 400 face")
	# 번들 파일·라이선스
	for path in ["ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf", "ofl/nanummyeongjo/NanumMyeongjo-Bold.ttf",
			"ofl/nanummyeongjo/NanumMyeongjo-ExtraBold.ttf", "ofl/cinzel/Cinzel-VariableFont_wght.ttf",
			"ofl/cinzeldecorative/CinzelDecorative-Bold.ttf", "ofl/cinzeldecorative/CinzelDecorative-Black.ttf"]:
		_check(ResourceLoader.exists("res://assets/fonts/" + path), "번들 글꼴 " + path)
	for folder in ["nanummyeongjo", "cinzel", "cinzeldecorative"]:
		_check(FileAccess.file_exists("res://assets/fonts/ofl/%s/OFL.txt" % folder), "OFL 라이선스 " + folder)
	# 체인 순서(보유분)
	_check(_chain(FONTS.stack("hell", 400)) == ["Nanum Myeongjo", "Noto Serif KR"], "hell 체인 Nanum→Noto Serif KR")
	_check(_chain(FONTS.stack("hell_title", 700)) == ["Cinzel Decorative", "Nanum Myeongjo", "Noto Serif KR"], "hell_title 체인")
	_check(_chain(FONTS.stack("cinzel_hell", 400)) == ["Cinzel", "Nanum Myeongjo", "Noto Serif KR"], "cinzel_hell 체인")
	_check(_chain(FONTS.stack("font", 900)) == _body_font_chain(), "--font 체인(Noto Sans KR 보유분 + 시스템 Malgun Gothic 있으면 3순위)")
	var cinzel_face: Font = FONTS.face("Cinzel", 400)
	_check(cinzel_face is FontVariation and int((cinzel_face as FontVariation).variation_opentype.values()[0]) == 700, "Cinzel 400 face = wght 700")
	var nanum_bold: Font = FONTS.face("Nanum Myeongjo", 700)
	_check(nanum_bold is FontVariation and str((nanum_bold as FontVariation).base_font.resource_path).ends_with("NanumMyeongjo-Bold.ttf"), "Nanum 700 = Bold 파일")
	var metrics: Dictionary = FONTS.css_line_metrics("hell_title", 28.0)
	_check(metrics["normal"] == 37.0 and metrics["family"] == "Cinzel Decorative", "line-height normal CD 28px = 37 (웹 실측)")
	_check(FONTS.css_line_metrics("hell", 13.6)["normal"] == 17.0 and FONTS.css_line_metrics("font", 16.0)["normal"] == 24.0
		and FONTS.css_line_metrics("cinzel_serif", 12.0)["normal"] == 16.0, "normal 줄높이 Nanum13.6=17·NotoSans16=24·Cinzel12=16 (웹 실측)")

# ── A-2: 실제 UI 노드 폰트 ──
func _test_hud_lesson_pet_fonts() -> void:
	if not await _boot(true):
		return
	var hud: Node = active_main.get("hud")
	var objective: Dictionary = hud.get("_objective_values")
	for key in ["lv", "exp", "kill", "malice"]:
		_check(_label_chain(objective.get(key)) == ["Nanum Myeongjo", "Noto Serif KR"], "#mmLvl %s = --font-hell" % key)
	var lv_meta: Dictionary = (objective["lv"] as Label).get_theme_font("font").get_meta("css_stack")
	_check(int(lv_meta["requested_weight"]) == 700 and str(lv_meta["chain"][0]["path"]).ends_with("Bold.ttf"), "레벨 값 700 → Nanum Bold")
	_check(_label_chain(hud.get("_stage_timer_label")) == ["Cinzel", "Nanum Myeongjo", "Noto Serif KR"], "#stageClock 'Cinzel',var(--font-hell)")
	_check(_label_chain(hud.get("_sp_label")) == ["Cinzel", "Nanum Myeongjo", "Noto Serif KR"]
		and _label_chain(hud.get("_cp_label")) == ["Cinzel", "Nanum Myeongjo", "Noto Serif KR"], "#hudCorner ✦/◇ 'Cinzel',var(--font-hell)")
	var sweep_labels: Dictionary = hud.get("_slot_sweep_labels")
	var sweep: Variant = sweep_labels.values()[0] if not sweep_labels.is_empty() else null
	_check(_label_chain(sweep) == _body_font_chain() and int((sweep as Label).get_theme_font("font").get_meta("css_stack")["requested_weight"]) == 900,
		"쿨다운 초 = body --font 900(_skCdSweep 44147)")
	_check(hud.get_native_first_fight_hud_snapshot().get("serif_font_loaded") == true, "Noto Serif KR(2순위) 유지")
	# 펫 자막
	var pets: Node = active_main.get("world").get_node_or_null("NativePets")
	var bubble: Variant = pets.get("_bubble_label") if pets != null else null
	var pet_meta: Dictionary = (bubble as Label).get_theme_font("font").get_meta("css_stack") if bubble is Label else {}
	var malgun: bool = FONTS.system_family_present("Malgun Gothic")
	_check(not pet_meta.is_empty() and pet_meta["families"] == ["Malgun Gothic", "sans-serif"] and int(pet_meta["requested_weight"]) == 700,
		"#petSubtitle 'Malgun Gothic',sans-serif 700")
	_check(_label_chain(bubble) == (["Malgun Gothic", "Noto Sans KR"] if malgun else ["Noto Sans KR"]), "펫 자막 체인(시스템 Malgun 유무: %s — 있으면 Malgun→sans-serif 대리)" % malgun)
	observations["malgun_gothic_present"] = malgun
	# 키 가이드 패널(표시 중) 요소별 체인
	var sequence: Node = active_main.get("source_intro_sequence")
	var fonts: Dictionary = sequence.get_snapshot().get("guide_panel", {}).get("fonts", {})
	observations["guide_fonts"] = fonts
	_check(fonts.get("progress") == ["Cinzel", "Noto Serif KR"], "#ikProgress 'Cinzel',serif (serif 대리 Noto Serif KR)")
	_check(fonts.get("line") == ["Cinzel Decorative", "Nanum Myeongjo", "Noto Serif KR"]
		and fonts.get("title") == ["Cinzel Decorative", "Nanum Myeongjo", "Noto Serif KR"], "#introTextKr·#ikTitle --font-hell-title")
	_check(fonts.get("row_key") == ["Cinzel", "Nanum Myeongjo", "Noto Serif KR"], "#ikBody span 'Cinzel',var(--font-hell)")
	_check(fonts.get("row_desc") == ["Nanum Myeongjo", "Noto Serif KR"] and fonts.get("hint") == ["Nanum Myeongjo", "Noto Serif KR"], "#ikBody·#ikHint --font-hell")
	_check(fonts.get("note") == _body_font_chain() and fonts.get("button") == _body_font_chain(), "#ikNote·버튼 body --font")
	# 레슨 패널(커튼 오픈 후 시작)
	sequence.finish_native_guide()
	var flow: Node = sequence.get("lesson_flow")
	var waited := 0
	while waited < 6000 and is_instance_valid(flow) and flow.get("_ui").is_empty():
		await _wait_ms(200)
		waited += 200
	var ui: Dictionary = flow.get("_ui") if is_instance_valid(flow) else {}
	_check(not ui.is_empty(), "레슨 패널 생성(커튼 후)")
	if not ui.is_empty():
		_check(flow.get("_font") != null and str((flow.get("_font") as Font).resource_path).ends_with("NanumMyeongjo-Regular.ttf"), "레슨 FONT_PATH = Nanum Myeongjo")
		_check(_label_chain(ui.get("title")) == ["Nanum Myeongjo", "Noto Serif KR"], "레슨 제목 --font-hell(parry-lesson.css 12)")
		_check(_label_chain(ui.get("keycap")) == ["Cinzel", "Noto Serif KR"], "레슨 키캡 'Cinzel',serif(parry-lesson.css 23)")
		_check(int((ui["keycap"] as Label).get_theme_font("font").get_meta("css_stack")["requested_weight"]) == 400, "키캡 CSS 굵기 400(로드분 700 face)")

# ── B: 검기 은빛 + 잉크 ──
func _test_ki_slash_silver_ink() -> void:
	if not await _boot(false):
		return
	var player: Node2D = active_main.get("player")
	var before := get_nodes_in_group("crescents").size()
	player.emit_signal("crescent_requested", 3, 120.0, Vector2.RIGHT)
	for i in range(3):
		await physics_frame
	var crescents: Array = get_nodes_in_group("crescents")
	_check(crescents.size() > before, "실제 디스패치로 기검참 생성(main crescent_requested)")
	if crescents.is_empty():
		return
	var shot: Node = crescents.back()
	_check(str((shot.get_script().get_script_constant_map()["SHEET"] as Resource).resource_path) == "res://assets/vfx/ki_slash_silver_sheet.png", "칼날 시트 = 원본 ki_slash_silver_sheet.png(16753)")
	_check(int(shot.get("_palette")) == 0, "3타 풀차지도 팔레트 0(_kiSlashPalette 16743)")
	var hues: Array = []
	for sprite in shot.get("_sprites"):
		hues.append(float((sprite.material as ShaderMaterial).get_shader_parameter("hue_degrees")))
		_check((sprite.material as ShaderMaterial).shader.resource_path == "res://assets/vfx/radiant.gdshader", "칼날 가산 셰이더 유지")
	_check(hues == [0.0, 0.0, 0.0, 0.0], "칼날 4층 hue 0(색 변환 폐지 16744)")
	var ink: AnimatedSprite2D = shot.get("_ink")
	_check(is_instance_valid(ink) and ink.get_index() < (shot.get("_sprites")[0] as Node).get_index(), "잉크 층이 칼날보다 먼저(아래) — 19210")
	if is_instance_valid(ink):
		_check((ink.material as ShaderMaterial).shader.resource_path == "res://assets/vfx/ki_slash_ink.gdshader", "잉크 셰이더")
		var width: float = float(shot.get("_width"))
		_check(is_equal_approx(ink.scale.x, width * 1.14 / 418.0), "잉크 1.14배(19213)")
		var main_sprite: AnimatedSprite2D = shot.get("_sprites")[3]
		_check(is_equal_approx(ink.modulate.a, main_sprite.modulate.a * 0.9), "잉크 alpha = 칼날 alpha×.9(19213)")
		_check(ink.frame == main_sprite.frame, "잉크 프레임 = 칼날 프레임")
	var ink_code: String = load("res://assets/vfx/ki_slash_ink.gdshader").code
	_check(ink_code.contains("blend_mix") and ink_code.contains("vec3(5.0, 4.0, 6.0) / 255.0") and ink_code.contains("ink_l * 2.4")
		and ink_code.contains("uniform float blur_px = 5.0"), "잉크 셰이더 상수(일반 합성·rgb(5,4,6)·l×2.4·blur 5=round(1254/260))")
	var radiant_code: String = load("res://assets/vfx/radiant.gdshader").code
	_check(radiant_code.contains("blend_add"), "칼날 가산(lighter / GL ONE,ONE — 프록시 lighter no-op은 _setBlend(true)로 같은 가산)")
	# 명중광
	var hit: Node2D = HIT.new()
	root.add_child(hit)
	hit.configure(Vector2(100, 100), Vector2.RIGHT, 184.0 * 2.2, 2, 3.0, true)
	_check(str(HIT.SHEET.resource_path) == "res://assets/vfx/ki_slash_hit_silver_sheet.png", "명중 시트 = 원본 ki_slash_hit_silver_sheet.png(19366)")
	var hit_sprite: AnimatedSprite2D = hit.get("_sprite")
	_check(float((hit_sprite.material as ShaderMaterial).get_shader_parameter("hue_degrees")) == 0.0, "명중 hue 0(palette 인자 무시)")
	var hit_ink: AnimatedSprite2D = hit.get("_ink")
	_check(hit_ink.visible and is_equal_approx(hit_ink.modulate.a, 0.85), "명중 잉크 표시·alpha .85(19375, fr0)")
	hit.set("_age_frames", 6.5)
	hit.call("_process", 0.0)
	_check(hit_sprite.frame == 2 and is_equal_approx(hit_sprite.modulate.a, 1.0 - 2.0 / 4.0 * 0.3), "명중 VFX alpha 1−(f/4)·.3 (54584)")
	_check(is_equal_approx(hit_ink.modulate.a, 0.85 * (1.0 - 2.0 * 0.18)), "명중 잉크 alpha .85×(1−fr×.18)")
	hit.free()
	var flash: Node2D = HIT.new()
	root.add_child(flash)
	flash.configure(Vector2(100, 100), Vector2.RIGHT, 627.0 * 0.26, 2, 2.0)
	_check(not (flash.get("_ink") as CanvasItem).visible, "풀차지 섬광(16846)에는 잉크 없음")
	flash.free()
	# 차지 미리보기(19246 surfaces[2] = 동일 실버)
	var charge: Array = player.get("_charge_sprites")
	_check(not charge.is_empty() and str((charge[0] as AnimatedSprite2D).sprite_frames.get_frame_texture("charge", 0).atlas.resource_path) == "res://assets/vfx/ki_slash_silver_sheet.png"
		and float(((charge[0] as AnimatedSprite2D).material as ShaderMaterial).get_shader_parameter("hue_degrees")) == 0.0, "차지 미리보기 실버·hue 0")
	# 원근 뷰 미러(기본 실행 --fdg-native-perspective-first)
	if active_main.has_method("mount_native_perspective_view"):
		var mounted: Dictionary = active_main.mount_native_perspective_view()
		player.emit_signal("crescent_requested", 1, 0.0, Vector2.RIGHT)
		for i in range(3):
			await physics_frame
		for i in range(2):
			await process_frame
		var view: Node = active_main.get("native_perspective_view")
		var mirrors: Dictionary = view.get("_mirrors") if is_instance_valid(view) else {}
		var ink_priorities: Array = []
		for shot_node in get_nodes_in_group("crescents"):
			var ink_node: Node = shot_node.get("_ink")
			if is_instance_valid(ink_node) and mirrors.has(ink_node.get_instance_id()):
				var material: Variant = (mirrors[ink_node.get_instance_id()] as Sprite3D).material_override
				ink_priorities.append(material.render_priority if material is ShaderMaterial else 999)
		observations["perspective_ink_priorities"] = ink_priorities
		_check(mounted.get("ready") == true and not ink_priorities.is_empty() and ink_priorities.all(func(p: int) -> bool: return p == -1),
			"원근 뷰: 잉크 층 지면 미러(일반 합성, render_priority −1 = 칼날 아래)")

# ── C-1: 4컷 문구·레이아웃·진행 ──
func _guide_snap() -> Dictionary:
	return active_main.get("source_intro_sequence").get_snapshot().get("guide_panel", {})

func _check_step_content(index: int) -> void:
	var rendered: Dictionary = _guide_snap().get("rendered", {})
	var expected: Dictionary = EXPECTED[index]
	_check(rendered.get("progress") == expected["progress"] and rendered.get("line") == expected["line"]
		and rendered.get("title") == expected["title"], "%d컷 진행·대사·제목(63209/63295~/63315)" % (index + 1))
	var row_pairs: Array = []
	for row in rendered.get("rows", []):
		row_pairs.append([row["key"], row["desc"]])
	_check(row_pairs == expected["rows"], "%d컷 키 행(BINDS 6188 + keyName 6279 + _introGuideKeys 63310)" % (index + 1))
	_check(rendered.get("note") == expected["note"] and rendered.get("hint") == HINT
		and rendered.get("next") == expected["next"] and rendered.get("skip") == "건너뛰기", "%d컷 노트·힌트(공백 접힘)·버튼" % (index + 1))
	var layout: Dictionary = _guide_snap().get("layout", {})
	var panel: Rect2 = layout.get("panel", Rect2())
	_check(absf(panel.size.y - float(WEB_PANEL_H[index])) <= 1.0 and is_equal_approx(panel.size.x, 720.0),
		"%d컷 패널 720×%.2f ≈ 웹 %.2f(±1)" % [index + 1, panel.size.y, WEB_PANEL_H[index]])
	observations["panel_h_step%d" % (index + 1)] = panel.size.y

func _test_guide_panel_steps_and_layout() -> void:
	if not await _boot(true):
		return
	var sequence: Node = active_main.get("source_intro_sequence")
	var panel: Control = sequence.get("guide_panel")
	_check(is_instance_valid(panel) and panel.get_parent() == active_main.get_native_intro_curtain_view().get_parent()
		and panel.get_index() > active_main.get_native_intro_curtain_view().get_index(), "패널이 커튼 위(z50>45) 같은 HUD 부모")
	await _wait_ms(450)
	var snap: Dictionary = _guide_snap()
	_check(snap.get("shown") == true and snap.get("alpha") >= 0.99 and snap.get("mouse_filter") == Control.MOUSE_FILTER_STOP,
		"표시·opacity 1(.4s 페이드 후)·pointer-events all(63380)")
	_check(snap.get("focus") == "next" and snap.get("focus_visible") == true, "초기 포커스 = 다음(63381 focus(), 웹 실측 focus-visible)")
	observations["voice"] = snap.get("voice")
	_check(str(snap.get("voice")) == "played", "voice_wakeup 재생(63403, 원본 sfx/voice/voice_wakeup.mp3)")
	_check_step_content(0)
	var row_rects: Array = snap.get("layout", {}).get("rows", [])
	var tops: Array = []
	for rect in row_rects:
		tops.append((rect as Rect2).position.y)
	_check(tops.size() == 3 and absf(tops[0] - WEB_ROW_TOPS_STEP0[0]) <= 1.0 and absf(tops[1] - WEB_ROW_TOPS_STEP0[1]) <= 1.0
		and absf(tops[2] - WEB_ROW_TOPS_STEP0[2]) <= 1.0 and absf((row_rects[0] as Rect2).size.y - 34.32) < 0.01, "1컷 행 top·높이 34.32 = 웹 실측")
	var sizes: Array = snap.get("layout", {}).get("button_sizes", [])
	_check(sizes.size() == 2 and absf((sizes[0] as Vector2).x - 120.0) < 0.5 and absf((sizes[0] as Vector2).y - 46.0) < 0.5,
		"버튼 120×46(min-width 120, 웹 실측)")
	# 클릭 = 진행(63385)
	var panel_rect: Rect2 = snap.get("layout", {}).get("panel", Rect2())
	_click(Vector2(panel_rect.position.x + 360, panel_rect.position.y + 200), panel, "root")
	for i in range(4):
		await process_frame
	_check(int(sequence.get("guide_step")) == 1, "패널 클릭 → 다음 컷(63385)")
	_check_step_content(1)
	await _wait_ms(300)
	_key(KEY_ENTER, true)
	_key(KEY_ENTER, false)
	for i in range(4):
		await process_frame
	_check(int(sequence.get("guide_step")) == 2, "Enter → 다음 컷")
	_check_step_content(2)
	await _wait_ms(300)
	# Space: 진행 + 홀드 시작(63362) → 2초 유지 = 건너뛰기(63390)
	_key(KEY_SPACE, true)
	for i in range(4):
		await process_frame
	_check(int(sequence.get("guide_step")) == 3, "Space → 마지막 컷")
	_check_step_content(3)
	var held_at: int = int(sequence.get("_space_held_at_ms")) # 63362 spaceHeldAt(입력 처리 시각)
	_check(held_at >= 0, "Space keydown이 홀드 시작 기록")
	await _wait_ms(maxi(0, held_at + 1000 - Time.get_ticks_msec()))
	var hold: float = float(_guide_snap().get("hold_ratio", -1.0))
	var expected_hold: float = float(Time.get_ticks_msec() - held_at) / 2000.0
	observations["hold_ratio_at_1s"] = [hold, expected_hold]
	_check(absf(hold - expected_hold) < 0.12 and hold < 1.0 and sequence.get("phase") == "guide",
		"Space 홀드 진행 = 경과/2000ms(63390)·아직 가이드")
	await _wait_ms(maxi(0, held_at + 2300 - Time.get_ticks_msec()))
	_check(sequence.get("phase") == "opening", "Space 2초 홀드 → 건너뛰기(커튼 오픈)")
	_key(KEY_SPACE, false)
	await _wait_ms(500)
	var after: Dictionary = _guide_snap()
	_check(after.get("shown") == false and after.get("mouse_filter") == Control.MOUSE_FILTER_IGNORE and float(after.get("alpha")) < 0.05,
		"종료 시 opacity 0·pointer-events none(63345)")

# ── C-2: Tab→Enter(건너뛰기 포커스)=스킵 / Space 떼면 홀드 취소 / 건너뛰기 버튼 클릭 ──
func _test_guide_tab_enter_skip_and_click() -> void:
	if not await _boot(true):
		return
	var sequence: Node = active_main.get("source_intro_sequence")
	await _wait_ms(450)
	_key(KEY_SPACE, true)
	for i in range(4):
		await process_frame
	_key(KEY_SPACE, false)
	for i in range(4):
		await process_frame
	_check(int(sequence.get("guide_step")) == 1 and float(_guide_snap().get("hold_ratio")) < 0.0, "Space 탭 = 진행, 떼면 홀드 취소(63377)")
	_key(KEY_TAB, true)
	_key(KEY_TAB, false)
	for i in range(3):
		await process_frame
	_check(_guide_snap().get("focus") == "skip", "Tab → 건너뛰기 포커스(63366)")
	_key(KEY_TAB, true)
	_key(KEY_TAB, false)
	for i in range(3):
		await process_frame
	_check(_guide_snap().get("focus") == "next", "Tab 재입력 → 다음 포커스")
	_key(KEY_TAB, true)
	_key(KEY_TAB, false)
	await _wait_ms(300)
	_key(KEY_ENTER, true)
	_key(KEY_ENTER, false)
	for i in range(4):
		await process_frame
	_check(sequence.get("phase") == "opening" and int(sequence.get("guide_step")) == 1, "건너뛰기 포커스에서 Enter = 스킵(63371)")
	# 건너뛰기 버튼 클릭(63387) — 독립 패널 인스턴스로 신호 확인
	var panel: Control = GUIDE.new()
	var host := CanvasLayer.new() # 레슨 패널 등 다른 UI 층 위(실 GUI 라우팅 시 가림 방지)
	host.layer = 128
	root.add_child(host)
	panel.bind(host, null)
	var counts := {"advance": 0, "skip": 0}
	panel.advance_requested.connect(func() -> void: counts["advance"] += 1)
	panel.skip_requested.connect(func() -> void: counts["skip"] += 1)
	panel.show_step(0)
	for i in range(3):
		await process_frame
	var skip_box: Control = panel.get("_nodes")["skip"]
	_click(skip_box.get_global_rect().get_center(), panel, "skip")
	for i in range(4):
		await process_frame
	_check(counts["skip"] == 1 and counts["advance"] == 0, "건너뛰기 버튼 클릭 = 스킵만(stopPropagation 63387)")
	var next_box: Control = panel.get("_nodes")["next"]
	_click(next_box.get_global_rect().get_center(), panel, "next")
	for i in range(4):
		await process_frame
	_check(counts["advance"] == 1 and counts["skip"] == 1, "다음 버튼 클릭 = 진행 1회(63386)")
	_check(str(panel.get("voice_status")) == "pending:audio_owner_unbound", "main 없이 음성 재생 시도 안 함(가짜 재생 금지)")
	host.queue_free()
