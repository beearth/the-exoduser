extends Node2D
## Closes the two facets R25 (intro_curtain_view.gd) left open, consuming R25's public view only:
##  (1) box-shadow: inset 0 0 80px rgba(0,0,0,.95)  (game.html CSS L628; *{box-sizing:border-box})
##      Inset shadow = blur(complement of the padding box) clipped to the padding box. Blur 80px ->
##      Gaussian sigma 40px. Separable for a rectangle: alpha(x,y) = .95 * (1 - Fx(x)*Fy(y)),
##      F(t) = Phi(t/sigma) - Phi((t-L)/sigma). Padding box = R25 panel rect minus its 1px border row
##      (border-box: border is inside the 50% height and is painted above the shadow).
##      Paint order (CSS): background < inset shadow < border < ::after hairline. This child draws after
##      R25's whole panel, so the border row (outside the padding box) and R25's hairline row are left
##      uncovered; the hairline pixel then misses the shadow under it (|error| <= bg 18/255 * .45 * .43 ~ .014).
##  (2) z-index:45. Source neighbours: #death/#victory z40 below; #deathReplay z45; #introText/#introKeys/
##      #introDiff z50 above. No central source-z -> Godot canvas contract exists in the port (HUD is one
##      CanvasLayer layer=10, no z mapping). apply_source_z(contract) applies a caller/central contract to
##      the R25 view node only; without it the facet stays NOT_READY. Parent and other UI are never touched.
## Read-only on R25 state (phase/progress/panel_rects/visibility). No clock/controller/callback/G/P writes.

const SOURCE_Z := 45
const SHADOW_ALPHA := 0.95
const SHADOW_BLUR := 80.0
const SIGMA := SHADOW_BLUR * 0.5
const BORDER_PX := 1.0
const R25_HAIRLINE_INSET := 8.0          # R25 draws its hairline at end.y-9 (top) / position.y+8 (bottom)
const NODE_DISTANCES := [0.0, 2.0, 4.0, 6.0, 8.0, 10.0, 12.0, 16.0, 20.0, 24.0, 28.0, 32.0, 40.0, 48.0, 56.0, 64.0, 72.0, 80.0, 96.0, 112.0, 128.0, 144.0, 160.0]
const Z_NEIGHBOURS := {"below": ["#death z40", "#victory z40"], "same": ["#deathReplay z45"], "above": ["#introText z50", "#introKeys z50", "#introDiff z50"]}

var view: Control
var status := {}
var z_status := {"ready": false, "reason": "no central source-z contract provided", "neighbours": Z_NEIGHBOURS}
var draw_count := 0
var last_drawn_origins: Array = []
var _meshes := {}                        # "top"/"bot" -> {size, points, colors, indices}
var _last_rects: Array = []

## view: an R25 intro_curtain_view instance already bound to its UI parent.
func bind(r25_view: Node) -> bool:
	if r25_view == null or not r25_view.has_method("panel_rects") or not ("phase" in r25_view) or not r25_view.is_inside_tree():
		status = {"ready": false, "reason": "R25 view not provided / not bound"}
		return false
	view = r25_view
	process_mode = Node.PROCESS_MODE_ALWAYS          # follows R25's wall-clock frames (setTimeout/CSS)
	view.add_child(self)                             # drawn after R25's panel body, inherits visibility
	status = {"ready": true}
	queue_redraw()
	return true

## contract: {"owner": String, "canvas_z_for": Callable(source_z:int)->int} from the central UI layer.
func apply_source_z(contract: Dictionary) -> bool:
	var f = contract.get("canvas_z_for")
	if view == null or not (f is Callable) or not (f as Callable).is_valid() or str(contract.get("owner", "")) == "":
		z_status = {"ready": false, "reason": "no central source-z contract provided", "neighbours": Z_NEIGHBOURS}
		return false
	var z: int = int((f as Callable).call(SOURCE_Z))
	view.z_as_relative = true
	view.z_index = z
	z_status = {"ready": true, "owner": contract["owner"], "source_z": SOURCE_Z, "canvas_z": z}
	return true

func _process(_delta: float) -> void:
	if view == null or not is_instance_valid(view):
		return
	var rects: Array = view.panel_rects()
	if rects != _last_rects:
		_last_rects = rects
		queue_redraw()

static func erf(x: float) -> float:            # Abramowitz-Stegun 7.1.26 (|err| < 1.5e-7)
	var s := signf(x)
	var a := absf(x)
	var t := 1.0 / (1.0 + 0.3275911 * a)
	var y := 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * exp(-a * a)
	return s * y

static func phi(z: float) -> float:
	return 0.5 * (1.0 + erf(z / sqrt(2.0)))

static func coverage(t: float, length: float) -> float:
	return phi(t / SIGMA) - phi((t - length) / SIGMA)

## Source alpha at (x,y) inside a padding box of size (w,h).
static func shadow_alpha(x: float, y: float, w: float, h: float) -> float:
	return SHADOW_ALPHA * (1.0 - coverage(x, w) * coverage(y, h))

## Padding box + R25 hairline row of a panel, in panel-local coordinates.
static func panel_geometry(size: Vector2, top: bool) -> Dictionary:
	var pad := Rect2(0.0, 0.0, size.x, size.y - BORDER_PX) if top else Rect2(0.0, BORDER_PX, size.x, size.y - BORDER_PX)
	var hair_y := size.y - R25_HAIRLINE_INSET - 1.0 if top else R25_HAIRLINE_INSET
	return {"pad": pad, "hair": Vector2(hair_y, hair_y + 1.0)}

static func _axis_nodes(length: float, extra: Array) -> Array:
	var nodes := {}
	for d in NODE_DISTANCES:
		if d <= length * 0.5:
			nodes[d] = true
			nodes[length - d] = true
	nodes[length * 0.5] = true
	for e in extra:
		nodes[clampf(e, 0.0, length)] = true
	var out := nodes.keys()
	out.sort()
	return out

func mesh_for(size: Vector2, top: bool) -> Dictionary:
	var key := "top" if top else "bot"
	if _meshes.has(key) and _meshes[key]["size"] == size:
		return _meshes[key]
	var g := panel_geometry(size, top)
	var pad: Rect2 = g["pad"]
	var hair: Vector2 = g["hair"]
	var xs := _axis_nodes(pad.size.x, [])
	var ys := _axis_nodes(pad.size.y, [hair.x - pad.position.y, hair.y - pad.position.y])
	var points := PackedVector2Array()
	var colors := PackedColorArray()
	for yv in ys:
		for xv in xs:
			points.append(Vector2(xv, pad.position.y + yv))
			colors.append(Color(0, 0, 0, shadow_alpha(xv, yv, pad.size.x, pad.size.y)))
	var indices := PackedInt32Array()
	var nx := xs.size()
	var skipped := 0
	for j in ys.size() - 1:
		var y0: float = pad.position.y + ys[j]
		if is_equal_approx(y0, hair.x) and is_equal_approx(pad.position.y + ys[j + 1], hair.y):
			skipped += 1
			continue                              # R25 hairline row stays uncovered
		for i in nx - 1:
			var a := j * nx + i
			indices.append_array([a, a + 1, a + nx + 1, a, a + nx + 1, a + nx])
	var m := {"size": size, "points": points, "colors": colors, "indices": indices, "pad": pad, "hair": hair, "skipped_rows": skipped, "xs": xs.size(), "ys": ys.size()}
	_meshes[key] = m
	return m

func _draw() -> void:
	if view == null or not is_instance_valid(view):
		return
	draw_count += 1
	last_drawn_origins = []
	var rects: Array = view.panel_rects()
	for k in 2:
		var r: Rect2 = rects[k]
		var m := mesh_for(r.size, k == 0)
		draw_set_transform(r.position)
		RenderingServer.canvas_item_add_triangle_array(get_canvas_item(), m["indices"], m["points"], m["colors"])
		last_drawn_origins.append(r.position)
	draw_set_transform(Vector2.ZERO)
