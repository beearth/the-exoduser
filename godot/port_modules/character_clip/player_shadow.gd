extends Node2D
## Player ground shadow, drawn before the body like native drawP.
## Source: game.html drawP (`_pR=P.r*_pScale`, `shW=isCharge?_pR+6:_pR+2`, depth-slice blob or flat
## ellipse), _dsEnabled (L17064), _DS_DEFAULT/_dsFlag (L17062-17063), _dsBlobStamp/_dsBlob (L18935-18949).
## The shadow is unconditional (alive, dead, airborne alike) and ignores body lift / death drop.
## Read-only snapshot input; no driver, no hit tint, no iframe flicker.

const PLAYER_SCALE = 2.0
const CENTER_DROP = 12.0 # _py + _pR + 12
const WIDTH_PAD = 2.0
const CHARGE_WIDTH_PAD = 6.0
const HEIGHT_RATIO = 0.35
const FLAT_ALPHA = 0.25 # rgba(0,0,0,.25) ellipse
const BLOB_ALPHA = 0.38 # _dsBlob alpha
const BLOB_SIZE = 128
const BLOB_INNER = 4.0
const BLOB_OUTER = 62.0
const BLOB_STOPS = [[0.0, 1.0], [0.55, 0.62], [1.0, 0.0]]
const BLOB_SPAN = 2.3
const BLOB_SHIFT = Vector2(0.12, 0.18) # NW key light -> centre nudged SE
const ELLIPSE_SEGMENTS = 64

static var _blob: ImageTexture

var _geometry := {}

## _dsEnabled: (G._depthSlice ?? _dsFlag) && G.stage===0 && !G._bossArena. depth_slice null = default flag.
static func depth_slice_enabled(depth_slice: Variant, stage: int, boss_arena: bool, ds_flag: bool = true) -> bool:
	var on: bool = ds_flag if depth_slice == null else bool(depth_slice)
	return on and stage == 0 and not boss_arena

## Shadow geometry relative to P in world px.
static func geometry(snapshot: Dictionary) -> Dictionary:
	var scaled := float(snapshot.get("radius", 0.0)) * PLAYER_SCALE
	var width := scaled + (CHARGE_WIDTH_PAD if String(snapshot.get("state", "")) == "charge" else WIDTH_PAD)
	var height := scaled * HEIGHT_RATIO
	var center := Vector2(0.0, scaled + CENTER_DROP)
	var blob := depth_slice_enabled(snapshot.get("depth_slice", null), int(snapshot.get("stage", 0)), bool(snapshot.get("boss_arena", false)), bool(snapshot.get("ds_flag", true)))
	var result := {"mode": "blob" if blob else "ellipse", "center": center, "radius_x": width, "radius_y": height, "alpha": BLOB_ALPHA if blob else FLAT_ALPHA}
	if blob:
		result["rect"] = Rect2(center.x - width * 1.15 + width * BLOB_SHIFT.x, center.y - height * 1.15 + height * BLOB_SHIFT.y, width * BLOB_SPAN, height * BLOB_SPAN)
	return result

## _dsBlobStamp: radial gradient (r 4 -> 62) black, alpha stops 1 / .62@.55 / 0, clipped to arc r=62.
static func blob_alpha_at(distance: float) -> float:
	if distance > BLOB_OUTER:
		return 0.0
	var t := clampf((distance - BLOB_INNER) / (BLOB_OUTER - BLOB_INNER), 0.0, 1.0)
	for index in range(1, BLOB_STOPS.size()):
		var a: Array = BLOB_STOPS[index - 1]
		var b: Array = BLOB_STOPS[index]
		if t <= b[0]:
			return lerpf(a[1], b[1], (t - a[0]) / (b[0] - a[0]))
	return 0.0

static func blob_texture() -> ImageTexture:
	if _blob == null:
		var image := Image.create(BLOB_SIZE, BLOB_SIZE, false, Image.FORMAT_RGBA8)
		var centre := BLOB_SIZE * 0.5
		for y in BLOB_SIZE:
			for x in BLOB_SIZE:
				var d := Vector2(x + 0.5 - centre, y + 0.5 - centre).length()
				image.set_pixel(x, y, Color(0, 0, 0, blob_alpha_at(d)))
		_blob = ImageTexture.create_from_image(image)
	return _blob

static func ellipse_points(center: Vector2, rx: float, ry: float) -> PackedVector2Array:
	var points := PackedVector2Array()
	points.resize(ELLIPSE_SEGMENTS)
	for i in ELLIPSE_SEGMENTS:
		var a := TAU * i / ELLIPSE_SEGMENTS
		points[i] = center + Vector2(cos(a) * rx, sin(a) * ry)
	return points

## snapshot: radius (P.r), state, depth_slice, stage, boss_arena, ds_flag. Node sits at P (same parent
## space as the body); add it before the body sibling so it draws first.
func show_snapshot(snapshot: Dictionary) -> void:
	_geometry = geometry(snapshot)
	queue_redraw()

func _draw() -> void:
	if _geometry.is_empty():
		return
	if _geometry["mode"] == "blob":
		draw_texture_rect(blob_texture(), _geometry["rect"], false, Color(1, 1, 1, _geometry["alpha"]))
	else:
		draw_colored_polygon(ellipse_points(_geometry["center"], _geometry["radius_x"], _geometry["radius_y"]), Color(0, 0, 0, _geometry["alpha"]))

## Owner composition: shadow then body under one parent at P, matching native draw order.
static func compose(parent: Node2D, shadow: Node2D, body: Node2D) -> void:
	if shadow.get_parent() != parent:
		parent.add_child(shadow)
	if body.get_parent() != parent:
		parent.add_child(body)
	if shadow.get_index() > body.get_index():
		parent.move_child(shadow, body.get_index())
