extends Control
## Intro curtain display owner (#introCurtainTop / #introCurtainBot). Display only.
## Source (game.html, read-only):
##   CSS L628-630   two fixed panels, left/right 0, height 50%, z-index 45, pointer-events none,
##                  transition: transform .8s cubic-bezier(.4,0,.2,1); background linear-gradient(90deg,
##                  #030303, rgba(18,14,11,.94) 50%, #030303); inner border 1px rgba(133,111,79,.33);
##                  ::after hairline 1px gradient(transparent, rgba(184,157,110,.55), transparent) 8px
##                  inside the inner edge; box-shadow inset 0 0 80px rgba(0,0,0,.95).
##   L63685-63686   show closed: display='' ; translateY(0)                     -> show_closed()
##   L63829-63830   open: top translateY(-100%), bottom translateY(100%)         -> open(on_done)
##   L63832-63836   setTimeout(900): display='none' both; G._intro=null          -> hidden + on_done once
##   L62422         if(!G._intro) and still visible: hide both                   -> hide_now()
## Clock: CSS transition + setTimeout are wall-clock ms (not _gameTime, not native60, not G.paused).
##   Here: Time.get_ticks_msec(), processed with PROCESS_MODE_ALWAYS. The 900 ms end wait is NOT the
##   600 in L63808 (P.iframes=600 native frames, owned by source_startup_activation INTRO_600).
## Not owned here: G.on / P.iframes / G._intro / HUD .on / spawns / bonfire / guide (L63807-63828).
##   on_done is the caller's hook to run its own G._intro=null at the source moment.
## Not rendered (exact gap): box-shadow inset 80px; z-index 45 ordering belongs to the caller's parent.

const TRANSITION_MS := 800.0
const END_TIMEOUT_MS := 900
const BEZIER := [0.4, 0.0, 0.2, 1.0]
const EDGE := Color(3.0 / 255.0, 3.0 / 255.0, 3.0 / 255.0, 1.0)            # #030303
const MID := Color(18.0 / 255.0, 14.0 / 255.0, 11.0 / 255.0, 0.94)          # rgba(18,14,11,.94)
const BORDER := Color(133.0 / 255.0, 111.0 / 255.0, 79.0 / 255.0, 0.33)
const HAIRLINE := Color(184.0 / 255.0, 157.0 / 255.0, 110.0 / 255.0, 0.55)
const HAIRLINE_INSET := 8.0
const NOT_RENDERED := ["box-shadow inset 0 0 80px rgba(0,0,0,.95)"]

enum Phase { UNBOUND, HIDDEN, CLOSED, OPENING, DONE, TERMINATED }

var phase := Phase.UNBOUND
var status := {}
var _t0 := -1
var _on_done := Callable()
var done_calls := 0
var draw_count := 0

## parent: the existing UI CanvasItem the caller provides (Control or CanvasLayer). Required.
func bind(parent: Node) -> bool:
	if parent == null or not (parent is CanvasItem or parent is CanvasLayer) or not parent.is_inside_tree():
		status = {"ready": false, "reason": "UI parent not provided (CanvasItem/CanvasLayer in tree)"}
		return false
	mouse_filter = Control.MOUSE_FILTER_IGNORE               # pointer-events:none
	process_mode = Node.PROCESS_MODE_ALWAYS                  # setTimeout/CSS ignore G.paused
	visible = false                                          # display:none
	set_process(false)
	parent.add_child(self)
	set_anchors_preset(Control.PRESET_FULL_RECT)
	phase = Phase.HIDDEN
	status = {"ready": true, "not_rendered": NOT_RENDERED}
	return true

## L63685-63686
func show_closed() -> bool:
	if phase == Phase.UNBOUND or phase == Phase.TERMINATED:
		return false
	_t0 = -1
	_on_done = Callable()
	visible = true
	phase = Phase.CLOSED
	queue_redraw()
	return true

## L63829-63836. on_done(info) fires once when the source 900 ms timeout elapses.
func open(on_done: Callable = Callable()) -> bool:
	if phase != Phase.CLOSED:
		return false
	_on_done = on_done
	_t0 = Time.get_ticks_msec()
	phase = Phase.OPENING
	set_process(true)
	queue_redraw()
	return true

## L62422 safety hide (caller decides: !G._intro while still visible). No callback.
func hide_now() -> void:
	if phase == Phase.UNBOUND or phase == Phase.TERMINATED:
		return
	visible = false
	set_process(false)
	_on_done = Callable()
	phase = Phase.HIDDEN

func elapsed_ms() -> int:
	return Time.get_ticks_msec() - _t0 if _t0 >= 0 else 0

## CSS transform progress 0..1 (top y = -p*h/2, bottom y = h/2 + p*h/2).
func progress() -> float:
	if phase == Phase.OPENING or phase == Phase.DONE:
		return cubic_bezier(clampf(float(elapsed_ms()) / TRANSITION_MS, 0.0, 1.0))
	return 0.0

func panel_rects() -> Array:
	var vs := get_viewport_rect().size
	var h := vs.y * 0.5
	var p := progress()
	return [Rect2(0.0, -p * h, vs.x, h), Rect2(0.0, h + p * h, vs.x, h)]

func _process(_delta: float) -> void:
	if phase != Phase.OPENING:
		set_process(false)
		return
	queue_redraw()
	var el := elapsed_ms()
	if el >= END_TIMEOUT_MS:
		visible = false
		set_process(false)
		phase = Phase.DONE
		var cb := _on_done
		_on_done = Callable()
		if cb.is_valid():
			done_calls += 1
			cb.call({"elapsed_ms": el, "transition_done": el >= int(TRANSITION_MS)})

func terminate() -> void:
	if phase == Phase.TERMINATED:
		return
	phase = Phase.TERMINATED
	_on_done = Callable()
	set_process(false)
	visible = false
	queue_free()

## CSS cubic-bezier(x1,y1,x2,y2) timing: solve x(s)=t, return y(s).
static func cubic_bezier(t: float) -> float:
	if t <= 0.0:
		return 0.0
	if t >= 1.0:
		return 1.0
	var lo := 0.0
	var hi := 1.0
	var s := t
	for i in 40:
		s = (lo + hi) * 0.5
		if _bez(s, BEZIER[0], BEZIER[2]) < t:
			lo = s
		else:
			hi = s
	return _bez(s, BEZIER[1], BEZIER[3])

static func _bez(s: float, a: float, b: float) -> float:
	var u := 1.0 - s
	return 3.0 * u * u * s * a + 3.0 * u * s * s * b + s * s * s

func _draw() -> void:
	draw_count += 1
	var rects := panel_rects()
	_panel(rects[0], true)
	_panel(rects[1], false)

func _panel(r: Rect2, top: bool) -> void:
	_hgrad(r, EDGE, MID)
	var edge_y := r.end.y - 1.0 if top else r.position.y        # border-bottom / border-top 1px
	draw_rect(Rect2(r.position.x, edge_y, r.size.x, 1.0), BORDER)
	var line_y := r.end.y - HAIRLINE_INSET - 1.0 if top else r.position.y + HAIRLINE_INSET
	var clear := Color(HAIRLINE, 0.0)
	_hgrad(Rect2(r.position.x, line_y, r.size.x, 1.0), clear, HAIRLINE)

## 3-stop horizontal gradient: a -> b (50%) -> a.
func _hgrad(r: Rect2, a: Color, b: Color) -> void:
	var mx := r.position.x + r.size.x * 0.5
	var y0 := r.position.y
	var y1 := r.end.y
	draw_polygon(PackedVector2Array([Vector2(r.position.x, y0), Vector2(mx, y0), Vector2(mx, y1), Vector2(r.position.x, y1)]), PackedColorArray([a, b, b, a]))
	draw_polygon(PackedVector2Array([Vector2(mx, y0), Vector2(r.end.x, y0), Vector2(r.end.x, y1), Vector2(mx, y1)]), PackedColorArray([b, a, a, b]))
