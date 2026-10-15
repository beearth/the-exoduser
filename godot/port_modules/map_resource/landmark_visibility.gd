extends RefCounted
## Isolated CH1-1 landmark CAMERA-CULLING consumer (MAP port, R7).
## Three sub-units: (1) compute the landmark's world visual bounds preserving the
## locked descriptor's real size/pivot/rotation; (2) intersect with a READ-ONLY
## owner camera/viewport snapshot (source frustum); (3) update the landmark Node's
## visibility / terminate. It changes no geometry/nav/collision/camera-position/
## START/EXIT/main/world placement, reads no central World camera (owner supplies
## the snapshot), and adds NO new culling margin. Source landmark rotation = 0 (no
## rotation field in _MAP_COMPOSE[0].handProps for m_c1tree) -> axis-aligned bounds,
## ported as-is. zones_mask/SVG/zone_weights unit is HELD, untouched.
##
## NOTE: a null texture is NOT "ready" — the product canonical is missing (R5/R6
## gap). Without the real texture the bounds use the descriptor's nominal native_sz
## (keepAR); the texture-exact bounds are recomputed when the real texture binds.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-map-landmark-visibility-r7-20261013"

## World AABB of the landmark. rotation (radians) from the descriptor if present
## (source m_c1tree = 0). Without a texture, size = native_sz * display_scale (keepAR
## nominal); with a texture, size = texture dims * display_scale (exact).
func compute_bounds(desc: Dictionary, texture: Texture2D = null) -> Rect2:
	var pos := Vector2(float(desc["world_pos"][0]), float(desc["world_pos"][1]))
	var scale := float(desc["display_scale"])
	var pivot_y := float(desc["pivot_y"])
	var rot := float(desc.get("rotation", 0.0))
	var w: float
	var h: float
	if texture != null:
		w = float(texture.get_width())
		h = float(texture.get_height())
	else:
		w = float(desc["native_sz"])
		h = float(desc["native_sz"])
	w *= scale
	h *= scale
	# corners relative to the foot anchor (offset: -w/2 horizontally, -h*pivot_y vertically)
	var corners := [
		Vector2(-w * 0.5, -h * pivot_y),
		Vector2(w * 0.5, -h * pivot_y),
		Vector2(w * 0.5, h * (1.0 - pivot_y)),
		Vector2(-w * 0.5, h * (1.0 - pivot_y)),
	]
	var minv := Vector2(INF, INF)
	var maxv := Vector2(-INF, -INF)
	for c in corners:
		var rc: Vector2 = c.rotated(rot) + pos
		minv.x = min(minv.x, rc.x); minv.y = min(minv.y, rc.y)
		maxv.x = max(maxv.x, rc.x); maxv.y = max(maxv.y, rc.y)
	return Rect2(minv, maxv - minv)

## World-visible rect from a READ-ONLY owner camera snapshot.
## cam = {"center":[x,y], "zoom":float, "viewport":[w,h]} (Camera2D: world = viewport/zoom).
func camera_visible_rect(cam: Dictionary) -> Rect2:
	var center := Vector2(float(cam["center"][0]), float(cam["center"][1]))
	var zoom := float(cam["zoom"])
	if zoom <= 0.0:
		zoom = 1.0
	var vp := Vector2(float(cam["viewport"][0]), float(cam["viewport"][1]))
	var world_size := vp / zoom
	return Rect2(center - world_size * 0.5, world_size)

## Pure cull test: bounds ∩ camera rect (no added margin).
func is_visible(desc: Dictionary, cam: Dictionary, texture: Texture2D = null) -> bool:
	return compute_bounds(desc, texture).intersects(camera_visible_rect(cam))

## Sub-unit 3: update the landmark view Node's visibility from the owner camera.
func update_landmark_visibility(landmark, cam: Dictionary, texture: Texture2D = null) -> Dictionary:
	var desc: Dictionary = landmark.descriptor()
	var bounds := compute_bounds(desc, texture)
	var cam_rect := camera_visible_rect(cam)
	var vis := bounds.intersects(cam_rect)
	var node: Node = landmark.get_node_or_null("LandmarkCorpseTree")
	if node != null:
		node.visible = vis
	return {
		"visible": vis,
		"node_updated": node != null,
		"texture_exact": texture != null,
		"ready": texture != null,   # null texture is NOT ready (product canonical-missing)
		"bounds": bounds,
		"camera_rect": cam_rect,
		"rotation_source": float(desc.get("rotation", 0.0)),
		"cull_margin": 0.0,         # source has no extra cull margin -> none added
	}

## Stateless consumer: nothing owned to free, but provided for owner symmetry.
func terminate() -> void:
	pass

## What the owner camera snapshot must provide (read-only). If the real source
## exposes a different frustum/cull-margin contract, this names the needed API.
func required_camera_api() -> Dictionary:
	return {
		"center": "world [x,y] (read-only owner Camera2D global position)",
		"zoom": "float (Camera2D zoom; world visible = viewport/zoom)",
		"viewport": "pixel [w,h]",
		"cull_margin": "NOT in confirmed source descriptor -> none added; exact margin API deferred to ENGINE if the native policy carries one",
	}
