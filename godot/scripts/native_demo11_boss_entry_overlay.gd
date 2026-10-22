extends CanvasLayer
## PC-BOSS-PARITY (2026-10-22) — 보스 아레나 로딩 오버레이(원본 렌더 game.html 52089–52122 그대로).
## G._bossLoadPhase/_bossLoadT/_bossLoadFade 만 읽는다(쓰기 0). 원본은 캔버스(게임 화면) 위·DOM HUD 아래에
## 그리므로 HUD(10)·펫 자막(9) 아래 layer 8 에 둔다. 좌표는 1920×1080 캔버스 픽셀(C.width/C.height).
const UI_FONTS = preload("res://scripts/native_ui_fonts.gd")

var main: Node
var _canvas: Node2D
var _font_bold: Font
var _font: Font

func configure(owner_main: Node) -> void:
	main = owner_main
	layer = 0
	_canvas = Node2D.new()
	_canvas.name = "BossLoadOverlay"
	_canvas.z_as_relative=false
	_canvas.z_index=-2000
	main.world.add_child(_canvas)
	_canvas.draw.connect(_draw_overlay)
	_font_bold = UI_FONTS.face("Noto Sans KR", 700)
	_font = UI_FONTS.face("Noto Sans KR", 400)

func _process(_delta: float) -> void:
	if is_instance_valid(_canvas):
		_canvas.queue_redraw()

static func _n(v: Variant) -> float:
	return float(v) if (v is int or v is float) and is_finite(float(v)) else 0.0

func _draw_overlay() -> void:
	if not is_instance_valid(main) or not is_instance_valid(main.get("source_state")):
		return
	var screen_transform: Transform2D=_canvas.get_global_transform_with_canvas().affine_inverse()
	_canvas.draw_set_transform_matrix(screen_transform)
	var g: Variant = main.source_state.read_current_g()
	if not g is Dictionary:
		return
	var phase: int = int(_n(g.get("_bossLoadPhase")))
	if phase <= 0:
		return
	var size: Vector2 = _canvas.get_viewport_rect().size
	var cw: float = size.x
	var ch: float = size.y
	var bl_f: float = _n(g.get("_bossLoadFade"))
	# 52094 검은 배경
	_canvas.draw_rect(Rect2(0, 0, cw, ch), Color(0, 0, 0, bl_f))
	# G52089 precedes enemies/player; normal screen lighting applies afterwards.
	if phase < 2 or bl_f <= 0.5:
		return
	var nt: float = minf(1.0, _n(g.get("_bossLoadT")) / 35.0) if phase == 2 else 1.0
	# 52099–52103 보라 안개 2층(globalAlpha nt*.15 × fillStyle alpha)
	_canvas.draw_circle(Vector2(cw / 2, ch / 2), cw * 0.25, Color(80 / 255.0, 20 / 255.0, 140 / 255.0, 0.15 * nt * 0.15))
	_canvas.draw_circle(Vector2(cw / 2, ch / 2), cw * 0.4, Color(80 / 255.0, 20 / 255.0, 140 / 255.0, 0.06 * nt * 0.15))
	# 52105–52107 가로 장식선(#886633, lineWidth 1, alpha .35*nt)
	var line_col := Color("#886633")
	line_col.a = 0.35 * nt
	_canvas.draw_line(Vector2(cw * 0.15, ch * 0.46), Vector2(cw * 0.85, ch * 0.46), line_col, 1.0)
	_canvas.draw_line(Vector2(cw * 0.15, ch * 0.60), Vector2(cw * 0.85, ch * 0.60), line_col, 1.0)
	# 52109–52111 장식 다이아몬드(#aa7744, 8×8 45°, alpha .25*nt)
	var dm_col := Color("#aa7744")
	dm_col.a = 0.25 * nt
	for yy in [ch * 0.46, ch * 0.60]:
		_canvas.draw_set_transform_matrix(screen_transform*Transform2D(PI/4,Vector2(cw/2,yy)))
		_canvas.draw_rect(Rect2(-4, -4, 8, 8), dm_col)
	_canvas.draw_set_transform_matrix(screen_transform)
	# 52113–52116 보스 이름: bold 40px Noto Sans KR, #ddaa55, alpha nt, center/middle @ ch*.53
	var name_col := Color("#ddaa55")
	name_col.a = nt
	_center_text(_font_bold, _tr("다크드루이드"), 40, Vector2(cw / 2, ch * 0.53), name_col)
	# 52119–52120 부제: 15px, #887766, alpha nt*.5 @ ch*.64 — ko: STG.kr, 그 외 _L(kr, n)
	var sub_col := Color("#887766")
	sub_col.a = nt * 0.5
	_center_text(_font, _subtitle(), 15, Vector2(cw / 2, ch * 0.64), sub_col)

func _center_text(font: Font, text: String, px: int, at: Vector2, col: Color) -> void:
	if font == null or text.is_empty():
		return
	var w: float = font.get_string_size(text, HORIZONTAL_ALIGNMENT_LEFT, -1, px).x
	# textBaseline='middle': 글자 em 상자의 가운데가 at.y
	var baseline: float = at.y + (font.get_ascent(px) - font.get_descent(px)) / 2.0
	_canvas.draw_string(font, Vector2(at.x - w / 2.0, baseline), text, HORIZONTAL_ALIGNMENT_LEFT, -1, px, col)

func _subtitle() -> String:
	# STG[0].kr = HELL_THEMES[0][0].kr+' 1구역' = '썩은 숲 1구역', n = 'ROTTEN FOREST' (16680, 16704)
	var snap: Dictionary = main.get_native_startup_language_snapshot() if main.has_method("get_native_startup_language_snapshot") else {}
	if str(snap.get("language", "ko")) == "ko":
		return "썩은 숲 1구역"
	return "ROTTEN FOREST"

func _tr(text: String) -> String:
	if main.has_method("translate_native_boot_label"):
		var t: Variant = main.translate_native_boot_label(text)
		if t is String: return t
	return text

func _exit_tree() -> void:
	if is_instance_valid(_canvas):_canvas.queue_free()
