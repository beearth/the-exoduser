extends RefCounted
## Isolated CH1-1 generic-prop PIVOT/SIZE resolver (MAP port, R10).
## Three source-first bodies porting the real generic renderer (game.html:48092-48154
## + _drawMapObjectCrop game.html:15381-15387): (1) real draw size from texture dims /
## sourceSize + native `sz` × instance scale (keepAR fit, squareDraw); (2) source
## foot/pivot/offset → Sprite2D bounds; (3) feed the resolved scale/offset into the
## EXISTING catalog Sprite2D view (public update). It invents NO real size when the
## texture (and sourceSize) are absent (-> ready=false, canonical-missing gap), and
## OVERWRITES NO canon: the R6/docs pivotY 0.72 vs the real renderer's default center
## (0.5) and the handProps scale split stay per-consumer, recorded as a conflict.
## No geometry/nav/position-LOCK/camera/RootWorld placement; zones_mask/SVG/zoneblend
## HELD (no access). R6/R8/R9/ground success suites + PNGs/import are NOT re-run.
##
## Source rules (read-only, confirmed — not invented):
##   48092  sz = (_meta.sz||32) * (mo.scale||1)
##   48145  ss = _meta.sourceSize || [naturalW,naturalH]; ar = ss[0]/ss[1];
##          dw = squareDraw? sz : sz*(ar<1?ar:1);  dh = squareDraw? sz : sz*(ar>1?1/ar:1)
##   48147  pvx = pivotX===undefined?0.5:pivotX;  pvy = pivotY===undefined?0.5:pivotY
##   15383  (no srcRect) topLeft = (cx - dw*pvx, cy - (anchorBottom? dh : dh*pvy))
## The 3 R8 catalog props (m_c1tree sz1450 / m_c1altar sz330 / m_c1cocoon sz280) carry
## keepAR and NO pivotX/Y/anchorBottom/squareDraw/srcRect/sourceSize -> center (0.5,0.5),
## real dims require the real texture (absent -> canonical-missing).

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-pivot-resolver-r10-20261014"

## Read-only reference meta for the 3 currently-supported anchor props (source rows).
const REFERENCE_PROPS := {
	"m_c1tree":   {"sz": 1450, "keepAR": true},
	"m_c1altar":  {"sz": 330,  "keepAR": true},
	"m_c1cocoon": {"sz": 280,  "keepAR": true},
}

func reference_props() -> Dictionary:
	return REFERENCE_PROPS.duplicate(true)

## Body 1 — real draw size. dims come from meta.sourceSize, else the texture; if
## neither is present the real size is NOT invented (ready=false, canonical-missing).
func resolve_size(meta: Dictionary, texture: Texture2D, instance_scale: float = 1.0) -> Dictionary:
	var sz := float(meta.get("sz", 32)) * instance_scale
	var square := bool(meta.get("squareDraw", false))
	var sw := 0.0
	var sh := 0.0
	var src := ""
	if meta.has("sourceSize"):
		sw = float(meta["sourceSize"][0]); sh = float(meta["sourceSize"][1]); src = "sourceSize"
	elif texture != null:
		sw = float(texture.get_width()); sh = float(texture.get_height()); src = "texture"
	if sw <= 0.0 or sh <= 0.0:
		return {
			"ready": false, "sz": sz,
			"gap": {
				"kind": "prop_source_dimensions",
				"status": "canonical-missing (no sourceSize + texture absent) -> real size NOT invented; ready=false",
				"required": "the real prop Texture2D (R6/R8 res target) or a meta.sourceSize",
			},
		}
	var ar := sw / sh
	var dw := sz if square else sz * (ar if ar < 1.0 else 1.0)
	var dh := sz if square else sz * (1.0 / ar if ar > 1.0 else 1.0)
	return {
		"ready": true, "sz": sz, "ar": ar, "dw": dw, "dh": dh,
		"source_dims": [sw, sh], "dims_source": src,
		"sprite_scale": Vector2(dw / sw, dh / sh),   # Sprite2D draws tex at dims*scale
	}

## Body 2 — source pivot. Default center (0.5,0.5) unless pivotX/Y set; anchorBottom
## overrides the vertical anchor to the sprite foot.
func resolve_pivot(meta: Dictionary) -> Dictionary:
	var pvx := float(meta["pivotX"]) if meta.has("pivotX") else 0.5
	var pvy := float(meta["pivotY"]) if meta.has("pivotY") else 0.5
	return {"pivot": [pvx, pvy], "anchor_bottom": bool(meta.get("anchorBottom", false))}

## Sprite2D offset in TEXTURE pixels (unscaled): world top-left = pos + scale*offset,
## which reproduces the HTML topLeft = (cx - dw*pvx, cy - (anchorBottom? dh : dh*pvy)).
func sprite_offset(source_dims: Array, pvx: float, pvy: float, anchor_bottom: bool) -> Vector2:
	var sw := float(source_dims[0])
	var sh := float(source_dims[1])
	return Vector2(-sw * pvx, -(sh if anchor_bottom else sh * pvy))

## World draw bounds (Rect2) for the fitted sprite, matching the renderer's footprint.
func draw_bounds(pos: Vector2, dw: float, dh: float, pvx: float, pvy: float, anchor_bottom: bool) -> Rect2:
	var top_left := pos + Vector2(-dw * pvx, -(dh if anchor_bottom else dh * pvy))
	return Rect2(top_left, Vector2(dw, dh))

## Combined resolve: size + pivot + offset + world bounds (or ready=false + gap).
func resolve(meta: Dictionary, texture: Texture2D, pos: Vector2, instance_scale: float = 1.0) -> Dictionary:
	var sz := resolve_size(meta, texture, instance_scale)
	if not sz["ready"]:
		return {"ready": false, "gap": sz["gap"], "sz": sz["sz"]}
	var pv := resolve_pivot(meta)
	var pvx := float(pv["pivot"][0])
	var pvy := float(pv["pivot"][1])
	var ab := bool(pv["anchor_bottom"])
	return {
		"ready": true,
		"sz": sz["sz"], "dw": sz["dw"], "dh": sz["dh"], "ar": sz["ar"],
		"source_dims": sz["source_dims"], "dims_source": sz["dims_source"],
		"sprite_scale": sz["sprite_scale"],
		"pivot": pv["pivot"], "anchor_bottom": ab,
		"sprite_offset": sprite_offset(sz["source_dims"], pvx, pvy, ab),
		"world_bounds": draw_bounds(pos, sz["dw"], sz["dh"], pvx, pvy, ab),
	}

## Body 3 — public update of the EXISTING catalog Sprite2D view (no module duplicate).
## Applies centered=false + fit scale + texture-space offset + position + texture.
## Not ready (dims absent) -> applied=false + gap; no size invented, no texture minted.
func apply_to_view(sprite: Sprite2D, meta: Dictionary, texture: Texture2D, pos: Vector2, instance_scale: float = 1.0) -> Dictionary:
	var r := resolve(meta, texture, pos, instance_scale)
	r["applied"] = false
	if sprite == null or not r["ready"] or texture == null:
		return r   # canonical-missing or no view -> nothing re-seated (not invented)
	sprite.centered = false
	sprite.texture = texture
	sprite.scale = r["sprite_scale"]
	sprite.offset = r["sprite_offset"]
	sprite.position = pos
	r["applied"] = true
	return r

## Per-consumer conflict record — never overwrites any canon.
func conflict_note() -> Dictionary:
	return {
		"kind": "pivot/scale per-consumer split",
		"renderer_truth": "generic renderer default pivot = (0.5,0.5) CENTER for these props (no _OBJ_META pivotY/anchorBottom); size = sz × scale fitted by keepAR.",
		"doc_spec": "R6/docs 맵구성_1장.md:220 state m_c1tree display_scale 0.72 / pivotY 0.72 (a DISPLAY spec).",
		"handProps": "handProps carries only instance scale (m_c1tree none->1.0); R8 recorded a foot-anchor assumption.",
		"resolution": "R10 ports the renderer CODE truth (center). Each prior record is kept as-is; no canon overwritten (R6/R8/R9 files untouched).",
	}
