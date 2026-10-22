extends Control
const UI = preload("res://scripts/native_demo_ui_i18n.gd")
## P2-007a — 인트로 시작 대사 + 키 안내 4컷 패널(#introKeys) 표시 소유자. 표시·클릭·음성만 소유하고
## 진행/스킵 판정(250ms 쓰로틀·Enter/Space/Esc·Space 2초 홀드·Tab)은 ExoduserNativeIntroCurtainSequence가 한다.
## 원본 근거(game.html, 읽기 전용):
##   HTML 3174~3190  #introKeys > .intro-key-panel > #ikProgress · #introTextPanel(#introTextKr/#introTextEn)
##                   · #ikTitle · #ikBody · #ikNote · #ikHint · .intro-key-actions(#ikSkip, #ikNext)
##   CSS  607~640    START GUIDE — black iron catechism (+ "Four-cut wake-up + controls" 재정의 627~640).
##                   ui-foundation/ui-refinement 등 뒤쪽 CSS에 #introKeys·#ik* 재정의 없음(전수 grep).
##   JS   63209      _INTRO_LINES 4대사 / 63295~63300 _INTRO_KEY_STEPS / 63308~63310 _introGuideKeys
##                   / 63311~63329 _renderIntroGuide / 63376 cancelHold 배경 복귀 / 63390 Space 홀드 배경
##                   / 63385~63387 클릭 진행·버튼 / 63403~63407 voice_wakeup(sfx/voice/voice_wakeup.mp3 10192).
##   키 이름: BINDS 기본값(6188~6196 — 포트 main._register_inputs도 동일 기본값 명시) + keyName(code,true) 6279~6306.
## 이미지: 원본 #introKeys에는 이미지 요소가 없다(텍스트·버튼·그라디언트만) — 가짜 이미지 추가 금지.

signal guide_key(event: InputEvent)
signal advance_requested
signal skip_requested

const NATIVE_UI_FONTS := preload("res://scripts/native_ui_fonts.gd")
const VOICE_PATH := "res://assets/sfx/voice/voice_wakeup.mp3" # 원본 sfx/voice/voice_wakeup.mp3 바이트 복사

const INTRO_LINES := [ # 63209
	{"ko": "눈을 떠", "en": "Open your eyes"}, {"ko": "정신 차려", "en": "Get a grip"},
	{"ko": "이제 진짜 지옥이야", "en": "This is real hell"}, {"ko": "야! 몬스터다!!!", "en": "Hey! Monsters!!!"}]
const KEY_STEPS := [ # 63295~63300 — 행 = [키(BINDS명/문자), 패드, 한국어, 영어]
	{"title": ["이동과 공격", "Move & attack"], "rows": [
		["up/down/left/right", "L 스틱", "이동", "Move"], ["weapon", "A", "무기 공격", "Weapon attack"],
		["beam", "R3", "마법 (탭=투사체, 홀드=빔)", "Magic (tap: projectile, hold: beam)"]]},
	{"title": ["패링과 이동", "Parry & movement"], "rows": [
		["parry", "Y", "마법 패링 · 보호막", "Magic parry / shield"], ["shield", "X", "칼등 처내기", "Weapon parry"],
		["charge", "LB", "사슬 이동", "Chain movement"],
		["방향키 더블탭 / Space+방향키", "LS 더블탭 / B+LS", "전격이동", "Flash Step"]]},
	{"title": ["스킬", "Skills"], "rows": [
		["bow", "B", "지옥강타 · 분노 폭발", "Hell Slam / rage burst"], ["1", "LT+A", "가시덫", "Spike Trap"],
		["F", "LT", "회복의 영역", "Healing Domain"],
		["CTRL", "RB", "CT 스킬 (뇌전걸음 / 얼음보주)", "CT skill (Ghost Walk / Ice Orb)"],
		["T", null, "석궁 자동발사", "Automatic crossbow"]]},
	{"title": ["살아남아", "Stay alive"], "rows": [
		["interact", "L3", "아이템 줍기", "Pick up items"], ["inventory", "D-pad →", "인벤토리", "Inventory"],
		["settings", "Start", "설정", "Settings"]],
		"note": ["물약은 설정한 HP% 이하 시 자동 사용", "Potions activate automatically below your configured HP%."]}]
const BINDS := {"up": "KeyW", "down": "KeyS", "left": "KeyA", "right": "KeyD", "weapon": "mouse0",
	"shield": "KeyE", "bow": "Space", "charge": "ShiftLeft", "parry": "KeyQ", "beam": "mouse2",
	"forge": "KeyG", "inventory": "Tab", "settings": "Escape", "interact": "KeyR", "storage": "KeyN",
	"stats": "KeyJ", "skill": "KeyK", "skillCycle": "KeyL", "irisToggle": "KeyY", "bladeToggle": "KeyU"} # 6188
const KEY_NAMES := {"Space": "SPACE", "ShiftLeft": "L-SHIFT", "ShiftRight": "R-SHIFT", "Tab": "TAB",
	"Escape": "ESC", "CapsLock": "CAPS", "ControlLeft": "L-CTRL", "ControlRight": "R-CTRL",
	"AltLeft": "L-ALT", "AltRight": "R-ALT"} # 6302~6305 (Key?/Digit? → 문자)
const HINT := ["클릭 / Enter / Space · 다음    Space 길게 / ESC · 건너뛰기",
	"Click / Enter / Space · Next    Hold Space / ESC · Skip"] # 63325
const PAD_HINT_NEXT := ["다음", "Next"]
const PAD_HINT_SKIP := ["건너뛰기", "Skip"]

# ── 1920×1080(포트 viewport, --ui-scale 1) 기준 CSS 계산값 ──
const PANEL_W := 720.0          # 628 width:min(720px, 100vw-96px)
const PANEL_PAD := Vector2(12, 20) # 628 padding:20px 12px (x=좌우, y=상하)
const PROGRESS := {"stack": "cinzel_serif", "weight": 400, "size": 12, "spacing": 0.25, "color": Color8(0x9d, 0x8e, 0x74)} # 631
const LINE := {"stack": "hell_title", "weight": 700, "size": 41.6, "spacing": 0.12, "line_height": 1.25,
	"color": Color(218 / 255.0, 210 / 255.0, 193 / 255.0, 0.94)} # 613 + 630 clamp(1.8rem,2.6vw,2.6rem)=41.6
const TEXT_PANEL_PAD := Vector2(12, 24) # 630 padding:12px 0 24px (y=상, x=하)
const TEXT_PANEL_MARGIN := 22.0  # 630 margin-bottom
const LINE_EN_MARGIN := 10.0     # 614 #introTextEn margin-top (빈 텍스트 — 높이 0, 여백만)
const TITLE := {"stack": "hell_title", "weight": 700, "size": 28.0, "spacing": 0.14,
	"color": Color(221 / 255.0, 211 / 255.0, 190 / 255.0, 0.91)} # 621 + 633 clamp(1.3rem,1.8vw,1.75rem)=28
const TITLE_MARGIN := 14.0       # 633
const BODY := {"stack": "hell", "weight": 400, "size": 20.8, "spacing": 0.04, "line_height": 1.65,
	"color": Color(198 / 255.0, 184 / 255.0, 158 / 255.0, 0.82)} # 622 + 634 clamp(1rem,1.35vw,1.3rem)=20.8
const KEY := {"stack": "cinzel_hell", "weight": 400, "size": 20.8 * 0.86, "spacing": 0.08, "line_height": 1.65,
	"color": Color(202 / 255.0, 169 / 255.0, 108 / 255.0, 0.86)} # 623 .86em
const ROW_MARGIN := 9.0          # 635 margin:9px 0
const ROW_GAP := 20.0            # 635 gap
const ROW_KEY_MIN := 160.0       # 635 minmax(160px,38%)
const ROW_KEY_RATIO := 0.38
const NOTE := {"stack": "font", "weight": 400, "size": 15.2, "spacing": 0.0, "color": Color8(0x9d, 0x8e, 0x74)} # 636 .95rem, 상속 body --font
const NOTE_MARGIN := 16.0
const HINT_STYLE := {"stack": "hell", "weight": 400, "size": 13.6, "spacing": 0.04, "color": Color8(0x9d, 0x8e, 0x74)} # 624 + 637
const HINT_MARGIN := 20.0
const ACTIONS_MARGIN := 22.0     # 638
const BUTTON := {"stack": "font", "weight": 400, "size": 16.0, "spacing": 0.0, "color": Color8(0xda, 0xce, 0xb8)} # 639 font:inherit(body 16px)
const BUTTON_MIN_W := 120.0
const BUTTON_PAD := Vector2(20, 10)
const BUTTON_BG := Color8(0x15, 0x11, 0x0d)
const BUTTON_BORDER := Color8(0x64, 0x56, 0x44)
const BUTTON_ACTIVE_BG := Color8(0x29, 0x20, 0x14)   # 640 :hover/:focus-visible
const BUTTON_OUTLINE := Color8(0xc5, 0xab, 0x7c)     # 640 outline 1px
const HOLD_FILL := Color(204 / 255.0, 183 / 255.0, 137 / 255.0, 0.4) # 63390
const HAIRLINE := Color(166 / 255.0, 143 / 255.0, 103 / 255.0, 0.62) # 611 ::after 64×1, bottom 6px
const SHADE_STOPS := [[0.0, Color(0, 0, 0, 0.9)], [0.46, Color(4 / 255.0, 3 / 255.0, 3 / 255.0, 0.68)], [1.0, Color(0, 0, 0, 0.82)]] # 626
const PANEL_TINT := Color(12 / 255.0, 9 / 255.0, 7 / 255.0, 0.2) # 609/619 linear-gradient(90deg, rgba(12,9,7,.2), transparent 82%)
const FADE_MS := 400.0           # 607 transition:opacity .4s (ease)
const NOT_RENDERED := ["#introKeys::before 105deg 1px 줄무늬(opacity .22×rgba(255,255,255,.018) — 8bit 1단계 미만)",
	"text-shadow 블러(8px/6px/3px)·#introTextKr 2번째 붉은 글로우 0 0 18px — 오프셋 그림자만(블러 미지원)",
	"소수 px 글자 크기(41.6/20.8/17.888/15.2/13.6) → 정수 px 반올림(Godot 글꼴 크기 정수)",
	"줄바꿈 판정 폭에는 letter-spacing 미포함(현 4컷 문구는 모두 한 줄 — 실측)"]

## CSS 인라인 텍스트 1블록 — 기준선을 정확히 제어하려고 Label 대신 TextParagraph로 그린다
## (Label은 첫 줄 상승값에 폴백 글꼴 메트릭을 섞어 CSS 기준선과 3~4px 어긋남 — P2-007a 실측).
## letter-spacing은 소수 px 그대로 글자(클러스터)마다 더한다(FontVariation 자간은 정수만 — 0.544→1 반올림 시
## 힌트 줄이 웹보다 30px 길어지는 것을 실측해 글리프 단위 그리기로 교정).
class CssText extends Control:
	var text := ""
	var font: Font
	var font_size := 16
	var letter_spacing := 0.0    # CSS letter-spacing(px, 소수 허용)
	var color := Color.WHITE
	var shadow_color := Color(0, 0, 0, 0)
	var shadow_offset := Vector2.ZERO
	var line_height := 16.0      # CSS 줄 상자 높이
	var baseline := 12.0         # 줄 상자 위에서 기준선까지
	var align := HORIZONTAL_ALIGNMENT_LEFT
	var css: Dictionary = {}
	var _para: TextParagraph

	func shape(width: float) -> int:
		_para = TextParagraph.new()
		if not text.is_empty() and font != null:
			_para.add_string(text, font, font_size)
		_para.width = width
		_para.break_flags = TextServer.BREAK_MANDATORY | TextServer.BREAK_WORD_BOUND | TextServer.BREAK_ADAPTIVE
		size = Vector2(width, line_height * line_count())
		queue_redraw()
		return line_count()

	func line_count() -> int:
		return 0 if text.is_empty() or _para == null else _para.get_line_count()

	## 줄 폭(글자마다 letter-spacing 포함 — CSS는 마지막 글자 뒤에도 더한다).
	func line_width(index: int) -> float:
		var ts := TextServerManager.get_primary_interface()
		var width := 0.0
		for glyph in ts.shaped_text_get_glyphs(_para.get_line_rid(index)):
			if int(glyph["flags"]) & TextServer.GRAPHEME_IS_VIRTUAL:
				continue # 줄바꿈 표식용 가상 글리프(폭 0) — 글자 아님
			width += float(glyph["advance"]) * int(glyph["repeat"])
			if int(glyph["count"]) > 0:
				width += letter_spacing
		return width

	func _draw() -> void:
		if _para == null or text.is_empty():
			return
		var ts := TextServerManager.get_primary_interface()
		for index in range(_para.get_line_count()):
			var x0 := 0.0
			if align == HORIZONTAL_ALIGNMENT_CENTER:
				x0 = floorf((size.x - line_width(index)) / 2.0)
			var y := index * line_height + baseline
			for pass_color in ([shadow_color, color] if shadow_color.a > 0.0 else [color]):
				var shift: Vector2 = shadow_offset if pass_color == shadow_color and shadow_color.a > 0.0 else Vector2.ZERO
				var x := x0
				var first := true
				for glyph in ts.shaped_text_get_glyphs(_para.get_line_rid(index)):
					if int(glyph["flags"]) & TextServer.GRAPHEME_IS_VIRTUAL:
						continue
					if int(glyph["count"]) > 0:
						if not first:
							x += letter_spacing
						first = false
					for r in range(int(glyph["repeat"])):
						var font_rid: RID = glyph["font_rid"]
						if font_rid.is_valid():
							ts.font_draw_glyph(font_rid, get_canvas_item(), int(glyph["font_size"]),
								Vector2(x, y) + shift + (glyph["offset"] as Vector2), int(glyph["index"]), pass_color)
						x += float(glyph["advance"])


var language := "ko"            # 포트 언어 설정 owner 부재 — _L 기본(한국어) 경로
var pad := false                # 게임패드 표기(63313 state.pad) — 패드 폴링 미이식이라 항상 false
var step := -1
var shown := false
var focus_target := "next"      # 63380 $('ikNext').focus()
var focus_visible := true       # 63380 스크립트 focus() — 문서 내 포인터 조작 전이면 :focus-visible(웹 실측 테두리 표시)
var hold_ratio := -1.0          # <0 = 홀드 아님(63376 cancelHold → background='')
var voice_status := "idle"
var _main: Node
var _fade_from := 0.0
var _fade_to := 0.0
var _fade_t0 := -1
var _hover := {"skip": false, "next": false}
var _nodes := {}
var _rows: Array = []
var _layout := {}


func bind(parent: Node, main: Node = null) -> bool:
	if parent == null or not parent.is_inside_tree():
		return false
	_main = main
	language=TranslationServer.get_locale()
	name = "NativeIntroKeyGuide"
	process_mode = Node.PROCESS_MODE_ALWAYS # CSS transition·rAF는 일시정지 무관
	mouse_filter = Control.MOUSE_FILTER_IGNORE # pointer-events:none (표시 전)
	modulate.a = 0.0                        # opacity:0
	visible = false
	parent.add_child(self) # 커튼(z45) 다음 자식 = 그 위(z50)
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	_build()
	return true


# ── 문자열 조립 (63308~63326 그대로) ──
func _l(pair: Array) -> String:
	return UI.text(str(pair[0]),language)


func _key_name(code: String) -> String:
	if code == "mouse0": return _l(["좌클릭", "LMB"])
	if code == "mouse1": return _l(["휠클릭", "MMB"])
	if code == "mouse2": return _l(["우클릭", "RMB"])
	if KEY_NAMES.has(code): return KEY_NAMES[code]
	if code.begins_with("Key") and code.length() == 4: return code.substr(3)
	if code.begins_with("Digit") and code.length() == 6: return code.substr(5)
	return code


func _guide_keys(key: String) -> String:
	if UI.catalog().messages.has(key):return UI.text(key,language)
	# 63310: key.split('/').map(k => BINDS[k] ? keyName(BINDS[k],true) : _T(k)).join(' / ')
	var parts: Array = []
	for k in key.split("/"):
		parts.append(_key_name(BINDS[k]) if BINDS.has(k) else k)
	return " / ".join(parts)


static func css_collapse(text: String) -> String:
	# white-space:normal — 연속 공백 1칸, 블록 앞뒤 공백 제거(textContent '    ' 등).
	var out := ""
	var space := false
	for ch in text:
		if ch == " " or ch == "\t" or ch == "\n":
			space = true
			continue
		if space and not out.is_empty():
			out += " "
		space = false
		out += ch
	return out


func compose_step(index: int) -> Dictionary:
	var data: Dictionary = KEY_STEPS[index]
	var rows: Array = []
	for row in data["rows"]:
		if pad and row[1] == null:
			continue
		rows.append({"key": css_collapse(UI.text(str(row[1]),language) if pad else _guide_keys(str(row[0]))),
			"desc": css_collapse(_l([row[2], row[3]]))})
	var hint := (("A · " + _l(PAD_HINT_NEXT) + " / Start · " + _l(PAD_HINT_SKIP)) if pad else _l(HINT))
	return {"progress": "%d / %d" % [index + 1, KEY_STEPS.size()],
		"line": _l([INTRO_LINES[index]["ko"], INTRO_LINES[index]["en"]]), "line_en": "",
		"title": _l(data["title"]), "rows": rows,
		"note": _l(data["note"]) if data.has("note") else "",
		"hint": css_collapse(hint),
		"next": _l(["시작", "Start"]) if index == 3 else _l(["다음", "Next"]), "skip": _l(["건너뛰기", "Skip"])}


# ── 노드 ──
func _font(style: Dictionary) -> Font:
	return NATIVE_UI_FONTS.stack(str(style["stack"]), int(style["weight"]))


func _text(parent: Control, style: Dictionary, node_name: String, shadow := Color(0, 0, 0, 0), shadow_y := 0.0) -> CssText:
	var label := CssText.new()
	label.name = node_name
	label.mouse_filter = Control.MOUSE_FILTER_IGNORE
	label.font = _font(style)
	label.font_size = int(round(float(style["size"])))
	label.letter_spacing = float(style["size"]) * float(style["spacing"])
	label.color = style["color"]
	label.shadow_color = shadow           # text-shadow 오프셋만(블러 미지원 — NOT_RENDERED 기록)
	label.shadow_offset = Vector2(0, shadow_y)
	label.css = style
	parent.add_child(label)
	return label


func _hgrad(parent: Control, stops: Array, node_name: String) -> TextureRect:
	var rect := TextureRect.new()
	rect.name = node_name
	rect.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var gradient := Gradient.new()
	var offsets := PackedFloat32Array()
	var colors := PackedColorArray()
	for stop in stops:
		offsets.append(float(stop[0]))
		colors.append(stop[1])
	gradient.offsets = offsets
	gradient.colors = colors
	var texture := GradientTexture2D.new()
	texture.gradient = gradient
	texture.width = 256
	texture.height = 1
	texture.fill_from = Vector2(0, 0)
	texture.fill_to = Vector2(1, 0)
	rect.texture = texture
	rect.stretch_mode = TextureRect.STRETCH_SCALE
	rect.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	parent.add_child(rect)
	return rect


func _button(parent: Control, node_name: String) -> Control:
	var box := Control.new()
	box.name = node_name
	box.mouse_filter = Control.MOUSE_FILTER_STOP
	box.mouse_default_cursor_shape = Control.CURSOR_POINTING_HAND # cursor:pointer
	parent.add_child(box)
	var outline := Panel.new() # outline 1px — 테두리 바깥(레이아웃 불변)
	outline.name = "Outline"
	outline.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var ring := StyleBoxFlat.new()
	ring.draw_center = false
	ring.border_color = BUTTON_OUTLINE
	ring.set_border_width_all(1)
	outline.add_theme_stylebox_override("panel", ring)
	box.add_child(outline)
	var face := Panel.new()
	face.name = "Face"
	face.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var style := StyleBoxFlat.new()
	style.bg_color = BUTTON_BG
	style.border_color = BUTTON_BORDER
	style.set_border_width_all(1)
	face.add_theme_stylebox_override("panel", style)
	box.add_child(face)
	var fill := ColorRect.new() # 63390 홀드 진행(배경 그라디언트 hard stop)
	fill.name = "HoldFill"
	fill.mouse_filter = Control.MOUSE_FILTER_IGNORE
	fill.color = HOLD_FILL
	box.add_child(fill)
	var border := Panel.new() # 테두리는 배경 위에 그려진다(border-box 배경 위 테두리)
	border.name = "Border"
	border.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var border_style := StyleBoxFlat.new()
	border_style.draw_center = false
	border_style.border_color = BUTTON_BORDER
	border_style.set_border_width_all(1)
	border.add_theme_stylebox_override("panel", border_style)
	box.add_child(border)
	var label := _text(box, BUTTON, "Text") # 버튼에는 text-shadow 없음
	label.align = HORIZONTAL_ALIGNMENT_CENTER
	box.mouse_entered.connect(func() -> void: _hover[node_name] = true; _refresh_buttons())
	box.mouse_exited.connect(func() -> void: _hover[node_name] = false; _refresh_buttons())
	box.gui_input.connect(_on_button_input.bind(node_name))
	return box


func _build() -> void:
	mouse_default_cursor_shape = Control.CURSOR_ARROW # 627 #introKeys{cursor:default}
	gui_input.connect(_on_root_input)
	_nodes["shade"] = _hgrad(self, SHADE_STOPS, "Shade")
	_nodes["shade"].set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	var panel := Control.new()
	panel.name = "Panel"
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(panel)
	_nodes["panel"] = panel
	var fade := PANEL_TINT
	fade.a = 0.0
	_nodes["panel_tint"] = _hgrad(panel, [[0.0, PANEL_TINT], [0.82, fade], [1.0, fade]], "PanelTint")
	_nodes["text_panel_tint"] = _hgrad(panel, [[0.0, PANEL_TINT], [0.82, fade], [1.0, fade]], "TextPanelTint")
	var hair_end := HAIRLINE
	hair_end.a = 0.0
	_nodes["hairline"] = _hgrad(panel, [[0.0, HAIRLINE], [1.0, hair_end]], "TextPanelHairline")
	_nodes["progress"] = _text(panel, PROGRESS, "ikProgress") # 631 text-shadow 없음
	_nodes["line"] = _text(panel, LINE, "introTextKr", Color(0, 0, 0, 0.95), 2.0) # 613 0 2px 8px rgba(0,0,0,.95)
	_nodes["title"] = _text(panel, TITLE, "ikTitle", Color(0, 0, 0, 1), 2.0)     # 621 0 2px 6px #000
	var body := Control.new()
	body.name = "ikBody"
	body.mouse_filter = Control.MOUSE_FILTER_IGNORE
	panel.add_child(body)
	_nodes["body"] = body
	_nodes["note"] = _text(panel, NOTE, "ikNote")                                # 636 text-shadow 없음
	_nodes["hint"] = _text(panel, HINT_STYLE, "ikHint")                          # 624 text-shadow 없음
	_nodes["skip"] = _button(panel, "skip")
	_nodes["next"] = _button(panel, "next")


func _place(label: CssText, top: float, width: float, line_height_ratio: float = -1.0) -> float:
	# CSS 줄 상자 재현: 줄높이 L(명시 배수 또는 normal=1순위 hhea), 기준선=(L−(A+D))/2+A.
	var css_px: float = float(label.css["size"])
	var m: Dictionary = NATIVE_UI_FONTS.css_line_metrics(str(label.css["stack"]), css_px)
	label.line_height = css_px * line_height_ratio if line_height_ratio > 0.0 else float(m["normal"])
	label.baseline = (label.line_height - (float(m["ascent"]) + float(m["descent"]))) / 2.0 + float(m["ascent"])
	label.position.y = top
	return label.line_height * label.shape(width)


func _layout_step(content: Dictionary) -> void:
	var viewport_size: Vector2 = get_viewport_rect().size if is_inside_tree() else Vector2(1920, 1080)
	var width: float = minf(PANEL_W, viewport_size.x - 96.0)
	var content_w: float = width - PANEL_PAD.x * 2.0
	var x0 := PANEL_PAD.x
	var y := PANEL_PAD.y
	var boxes := {} # 요소 상자 [top, height] — 웹 getBoundingClientRect 대조용(패널 기준)
	var progress: CssText = _nodes["progress"]
	progress.text = content["progress"]
	progress.position.x = x0
	boxes["progress"] = [y, _place(progress, y, content_w)]
	y += float(boxes["progress"][1])
	var text_panel_top := y
	y += TEXT_PANEL_PAD.x
	var line: CssText = _nodes["line"]
	line.text = content["line"]
	line.position.x = x0
	boxes["line"] = [y, _place(line, y, content_w, float(LINE["line_height"]))]
	y += float(boxes["line"][1])
	y += LINE_EN_MARGIN + TEXT_PANEL_PAD.y
	var text_panel_bottom := y
	(_nodes["text_panel_tint"] as Control).position = Vector2(x0, text_panel_top)
	(_nodes["text_panel_tint"] as Control).size = Vector2(content_w, text_panel_bottom - text_panel_top)
	(_nodes["hairline"] as Control).position = Vector2(x0, text_panel_bottom - 7.0)
	(_nodes["hairline"] as Control).size = Vector2(64, 1)
	y += TEXT_PANEL_MARGIN
	var title: CssText = _nodes["title"]
	title.text = content["title"]
	title.position.x = x0
	boxes["title"] = [y, _place(title, y, content_w)]
	y += float(boxes["title"][1])
	y += maxf(TITLE_MARGIN, ROW_MARGIN) # 행 margin-top 9가 제목 margin-bottom 14와 상쇄(겹침)
	for row in _rows:
		row["key"].queue_free()
		row["desc"].queue_free()
	_rows.clear()
	var key_w: float = maxf(ROW_KEY_MIN, content_w * ROW_KEY_RATIO)
	var desc_x: float = x0 + key_w + ROW_GAP
	var desc_w: float = content_w - key_w - ROW_GAP
	var body: Control = _nodes["body"]
	var row_rects: Array = []
	for index in range(content["rows"].size()):
		var row: Dictionary = content["rows"][index]
		if index > 0:
			y += ROW_MARGIN
		var key_label := _text(body, KEY, "Key%d" % index, Color(0, 0, 0, 1), 1.0) # 622 0 1px 3px #000(상속)
		key_label.text = row["key"]
		key_label.position.x = x0
		var desc_label := _text(body, BODY, "Desc%d" % index, Color(0, 0, 0, 1), 1.0)
		desc_label.text = row["desc"]
		desc_label.position.x = desc_x
		var key_h := _place(key_label, y, key_w, float(KEY["line_height"]))
		var desc_h := _place(desc_label, y, desc_w, float(BODY["line_height"]))
		var row_h := maxf(key_h, desc_h)
		row_rects.append(Rect2(x0, y, content_w, row_h))
		_rows.append({"key": key_label, "desc": desc_label})
		y += row_h
	var note: CssText = _nodes["note"]
	note.text = content["note"]
	note.position.x = x0
	if note.text.is_empty():
		# 빈 #ikNote는 여백이 통과 상쇄 — 마지막 행 9 / 노트 16 / 힌트 20 중 최대.
		y += maxf(ROW_MARGIN, maxf(NOTE_MARGIN, HINT_MARGIN))
		_place(note, y, content_w)
	else:
		y += maxf(ROW_MARGIN, NOTE_MARGIN)
		boxes["note"] = [y, _place(note, y, content_w)]
		y += float(boxes["note"][1])
		y += HINT_MARGIN
	var hint: CssText = _nodes["hint"]
	hint.text = content["hint"]
	hint.position.x = x0
	boxes["hint"] = [y, _place(hint, y, content_w)]
	y += float(boxes["hint"][1])
	y += ACTIONS_MARGIN
	var button_h := 0.0
	for key in ["skip", "next"]:
		var box: Control = _nodes[key]
		var label: CssText = box.get_node("Text")
		label.text = content[key]
		label.shape(10000.0)
		var text_w: float = label.line_width(0)
		var text_h: float = float(NATIVE_UI_FONTS.css_line_metrics(str(BUTTON["stack"]), float(BUTTON["size"]))["normal"])
		var size_px := Vector2(maxf(BUTTON_MIN_W, text_w + BUTTON_PAD.x * 2.0 + 2.0), text_h + BUTTON_PAD.y * 2.0 + 2.0)
		box.size = size_px
		button_h = maxf(button_h, size_px.y)
		for part in ["Face", "Border"]:
			(box.get_node(part) as Control).position = Vector2.ZERO
			(box.get_node(part) as Control).size = size_px
		var outline: Control = box.get_node("Outline")
		outline.position = Vector2(-1, -1)
		outline.size = size_px + Vector2(2, 2)
		label.position.x = 0
		_place(label, BUTTON_PAD.y + 1.0, size_px.x)
	(_nodes["skip"] as Control).position = Vector2(x0, y) # justify-content:space-between — 건너뛰기 좌
	(_nodes["next"] as Control).position = Vector2(x0 + content_w - (_nodes["next"] as Control).size.x, y)
	boxes["buttons"] = [y, button_h]
	y += button_h + PANEL_PAD.y
	var panel: Control = _nodes["panel"]
	panel.size = Vector2(width, y)
	panel.position = ((viewport_size - panel.size) / 2.0).floor() # flex 중앙 정렬
	(_nodes["panel_tint"] as Control).position = Vector2.ZERO
	(_nodes["panel_tint"] as Control).size = panel.size
	_layout = {"panel": Rect2(panel.position, panel.size), "rows": row_rects,
		"text_panel": Rect2(x0, text_panel_top, content_w, text_panel_bottom - text_panel_top),
		"key_col_w": key_w, "desc_x": desc_x, "desc_w": desc_w, "boxes": boxes,
		"button_sizes": [(_nodes["skip"] as Control).size, (_nodes["next"] as Control).size]}
	_refresh_buttons()


# ── 상태 ──
func show_step(index: int) -> void:
	step = clampi(index, 0, KEY_STEPS.size() - 1)
	_layout_step(compose_step(step))
	if not shown:
		shown = true
		visible = true
		mouse_filter = Control.MOUSE_FILTER_STOP # 63380 pointerEvents='all'
		focus_target = "next"
		focus_visible = true
		hold_ratio = -1.0
		_start_fade(1.0)
		_request_voice()


func hide_guide() -> void:
	# 63345: opacity 0·pointerEvents none — 커튼 열림과 함께 .4s 페이드.
	if not shown:
		return
	shown = false
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	hold_ratio = -1.0
	if voice_status.begins_with("pending"):
		voice_status = "dropped_guide_done" # 63403 play()는 가이드 진행 중에만
	_start_fade(0.0)
	_refresh_buttons()


func toggle_focus() -> void:
	# 63366~63368 Tab: ikNext ↔ ikSkip
	focus_target = "skip" if focus_target == "next" else "next"
	focus_visible = true
	_refresh_buttons()


func set_skip_hold(ratio: float) -> void:
	hold_ratio = ratio
	_refresh_buttons()


func _refresh_buttons() -> void:
	for key in ["skip", "next"]:
		var box: Control = _nodes.get(key)
		if box == null:
			continue
		var active: bool = bool(_hover.get(key, false)) or (focus_visible and focus_target == key)
		(box.get_node("Outline") as Control).visible = active
		var face_style: StyleBoxFlat = (box.get_node("Face") as Panel).get_theme_stylebox("panel")
		var holding: bool = key == "skip" and hold_ratio >= 0.0
		# 63390 인라인 background 단축 = 배경색 transparent + 진행 그라디언트(호버 규칙보다 우선)
		face_style.bg_color = Color(0, 0, 0, 0) if holding else (BUTTON_ACTIVE_BG if active else BUTTON_BG)
		var fill: ColorRect = box.get_node("HoldFill")
		fill.visible = holding
		fill.position = Vector2.ZERO
		fill.size = Vector2(box.size.x * clampf(hold_ratio, 0.0, 1.0), box.size.y)


func _start_fade(target: float) -> void:
	_fade_from = modulate.a
	_fade_to = target
	_fade_t0 = Time.get_ticks_msec()
	set_process(true)


static func css_ease(t: float) -> float:
	# CSS 'ease' = cubic-bezier(.25,.1,.25,1) — x(s)=t를 이분법으로 풀어 y(s).
	t = clampf(t, 0.0, 1.0)
	var lo := 0.0
	var hi := 1.0
	var s := t
	for i in range(24):
		s = (lo + hi) * 0.5
		var x := 3.0 * (1.0 - s) * (1.0 - s) * s * 0.25 + 3.0 * (1.0 - s) * s * s * 0.25 + s * s * s
		if x < t:
			lo = s
		else:
			hi = s
	return 3.0 * (1.0 - s) * (1.0 - s) * s * 0.1 + 3.0 * (1.0 - s) * s * s * 1.0 + s * s * s


func _process(_delta: float) -> void:
	if _fade_t0 >= 0:
		var t: float = (Time.get_ticks_msec() - _fade_t0) / FADE_MS
		modulate.a = lerpf(_fade_from, _fade_to, css_ease(t))
		if t >= 1.0:
			modulate.a = _fade_to
			_fade_t0 = -1
			if _fade_to <= 0.0:
				visible = false
	if voice_status.begins_with("pending"):
		_try_voice()


# ── 입력(클릭) — 키 입력은 시퀀스 owner ──
func _on_root_input(event: InputEvent) -> void:
	if shown and event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		accept_event()
		advance_requested.emit() # 63385 $('introKeys').onclick


func _on_button_input(event: InputEvent, key: String) -> void:
	if not shown or not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	(_nodes[key] as Control).accept_event() # 63386~63387 stopPropagation
	if key == "skip":
		skip_requested.emit()
	else:
		advance_requested.emit()


# ── voice_wakeup (63403~63407: 가이드 진행 중일 때만 playSample('voice_wakeup',1,1)) ──
func _request_voice() -> void:
	voice_status = "pending"
	_try_voice()


func _try_voice() -> void:
	if not shown:
		return
	if not ResourceLoader.exists(VOICE_PATH):
		voice_status = "missing_asset"
		return
	if not is_instance_valid(_main) or not _main.has_method("read_native_attack_audio_settings"):
		voice_status = "pending:audio_owner_unbound"
		return
	var settings: Dictionary = _main.read_native_attack_audio_settings()
	if settings.get("ready") != true:
		voice_status = "pending:" + str(settings.get("reason", "audio_not_ready"))
		return
	# DEMO11-41: lifecycle owns stop/resume and routes voice to SND08.
	if not _main.has_method("request_native_lifecycle_voice"):
		voice_status="pending:lifecycle_owner_unbound"
		return
	var reply: Dictionary=_main.request_native_lifecycle_voice(self,VOICE_PATH,1.0*(0.92+randf()*0.16))
	voice_status=("played" if reply.get("playing")==true else "queued") if reply.get("accepted")==true else "pending:lifecycle_not_ready"


func get_snapshot() -> Dictionary:
	var content: Dictionary = compose_step(step) if step >= 0 else {}
	var fonts := {}
	for key in ["progress", "line", "title", "note", "hint"]:
		fonts[key] = NATIVE_UI_FONTS.chain_families((_nodes[key] as CssText).font)
	if not _rows.is_empty():
		fonts["row_key"] = NATIVE_UI_FONTS.chain_families((_rows[0]["key"] as CssText).font)
		fonts["row_desc"] = NATIVE_UI_FONTS.chain_families((_rows[0]["desc"] as CssText).font)
	fonts["button"] = NATIVE_UI_FONTS.chain_families(((_nodes["next"] as Control).get_node("Text") as CssText).font)
	var row_texts: Array = []
	for row in _rows:
		row_texts.append({"key": (row["key"] as CssText).text, "desc": (row["desc"] as CssText).text})
	return {"shown": shown, "visible": visible, "alpha": modulate.a, "step": step, "content": content,
		"rendered": {"progress": (_nodes["progress"] as CssText).text, "line": (_nodes["line"] as CssText).text,
			"title": (_nodes["title"] as CssText).text, "rows": row_texts, "note": (_nodes["note"] as CssText).text,
			"hint": (_nodes["hint"] as CssText).text,
			"skip": ((_nodes["skip"] as Control).get_node("Text") as CssText).text,
			"next": ((_nodes["next"] as Control).get_node("Text") as CssText).text},
		"layout": _layout.duplicate(true), "fonts": fonts, "focus": focus_target, "focus_visible": focus_visible,
		"hold_ratio": hold_ratio, "voice": voice_status, "mouse_filter": mouse_filter,
		"not_rendered": NOT_RENDERED.duplicate(),
		"unported": ["게임패드 표기·A/Start 폴링(63394~63399 — 패드 입력 owner 미이식)",
			"언어 전환(_L 영어 경로 — 포트 언어 설정 owner 부재, 데이터는 보유)"]}

func _notification(what: int) -> void:
	if what==NOTIFICATION_TRANSLATION_CHANGED and not _nodes.is_empty() and step>=0:
		language=TranslationServer.get_locale()
		call_deferred("_layout_step",compose_step(step))

# Web window capture key listener: HUD guide precedes the lesson/game input funnel.
func _input(event: InputEvent) -> void:
	if visible and event is InputEventKey:guide_key.emit(event)
