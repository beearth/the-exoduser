extends RefCounted
## Isolated CH1-1 prop SOURCE TRANSFORM facet (MAP port, R16).
## Ports the renderer transform branches that R10 (pivot/size) left UNCONNECTED —
## rotation, flip, and srcRect crop — reading ONLY branches that exist in the real
## source and consuming their original values/defaults/units. R10's size/pivot/offset,
## the source coords, nav+SSOT and geometry are LEFT UNCHANGED (no re-derivation);
## where the same result-path already exists (R10's pivot/size) NO duplicate helper/
## wrapper is made — only the un-ported rotate/flip/crop branches.
##
## Source (read-only, game.html):
##   48146 keepAR: _moRot = ((mo.rot||0)%360+360)%360; rotate when _moRot||pivotX/Y set
##   48097 non-keepAR: else if(_meta.rot && rot!==180 && rot!==270) rotate by _meta.rot
##   48150/48098 flip: _meta.flip -> X.scale(-1,1) (horizontal mirror), pivot .5,.5
##   15381 _drawMapObjectCrop: srcRect r=[x,y,w,h]; ss=sourceSize||natural; tr=trimOffset||[0,0]
##          dx=cx-dw*pvx + dw*tr[0]/ss[0]; draw region r scaled to (dw*r[2]/ss[0], dh*r[3]/ss[1])
## Branch selection is mutually exclusive, reproduced verbatim:
##   keepAR    -> (rotate | pivot) ? rotate : (flip ? flip : plain)
##   non-keepAR-> flip ? flip : (rot&&!=180&&!=270 ? rotate : plain)
## Crop (srcRect) is orthogonal: it composes inside whichever branch draws.
## The 3 CH1 catalog props (m_c1tree/altar/cocoon) carry no rot/flip/srcRect -> identity.
## No new PNG/import/asset/generic-provider; an AtlasTexture only WRAPS a caller texture
## (no mint). No RootWorld/camera/collider/coord change. mask/blend/SVG/zone_weights DENIED.

const FIXTURE_ROOT := "/Users/fordeargamers/.codex/visualizations/rift-quality-next-20261007/fdg-dark-druid-first-slice-20261011/godot-native-first/team-port/map_resource/godot-port-prop-source-transform-r16-20261014"

var _applied: Array = []   # {sprite, orig_rot, orig_flip_h, orig_tex} for restore

## Body 1 — read the existing transform branches and return their original values.
## `mo` carries the instance (mo.rot); absent fields default (0 / false) per source.
func resolve_transform(meta: Dictionary, mo: Dictionary = {}) -> Dictionary:
	var keepar := bool(meta.get("keepAR", false))
	var has_pivot := meta.has("pivotX") or meta.has("pivotY")
	var flip := bool(meta.get("flip", false))
	var rot_deg := 0.0
	var flip_h := false
	var branch := "plain"
	var rot_source := ""

	if keepar:
		var mo_rot := fposmod(float(mo.get("rot", 0.0)), 360.0)   # ((mo.rot||0)%360+360)%360
		if mo_rot != 0.0 or has_pivot:
			rot_deg = mo_rot
			branch = "rotate"
			rot_source = "instance mo.rot (keepAR path)"
		elif flip:
			flip_h = true
			branch = "flip"
	else:
		if flip:
			flip_h = true
			branch = "flip"
		else:
			var mr := float(meta.get("rot", 0.0))
			if mr != 0.0 and mr != 180.0 and mr != 270.0:   # source excludes 180/270 here
				rot_deg = mr
				branch = "rotate"
				rot_source = "meta.rot (non-keepAR path, excl 180/270)"

	var out := {
		"branch": branch,
		"rotation_deg": rot_deg,
		"rotation_rad": deg_to_rad(rot_deg),
		"flip_h": flip_h,
		"rotation_source": rot_source,
		"has_crop": false,
	}
	# crop (srcRect) — orthogonal; composes inside the chosen branch's draw
	if meta.has("srcRect"):
		var r: Array = meta["srcRect"]
		var tr: Array = meta.get("trimOffset", [0, 0])
		out["has_crop"] = true
		var crop := {
			"region": Rect2(float(r[0]), float(r[1]), float(r[2]), float(r[3])),
			"trim_offset": [float(tr[0]), float(tr[1])],
		}
		if meta.has("sourceSize"):
			var ss: Array = meta["sourceSize"]
			crop["source_size"] = [float(ss[0]), float(ss[1])]
			crop["dest_scale"] = [float(r[2]) / float(ss[0]), float(r[3]) / float(ss[1])]   # dw*r[2]/ss[0] factor
		else:
			crop["source_size"] = null
			crop["dest_scale"] = null   # needs the real texture's natural dims (reported, not invented)
		out["crop"] = crop
	return out

## Body 2 — apply the un-ported transform onto an EXISTING R11 Sprite2D view. Only the
## transform (rotation + flip_h + optional crop region) is set; R10's scale/offset/
## position are NOT touched. Rotation/flip are pure (no texture needed); crop needs the
## caller texture to wrap an AtlasTexture (no mint) -> absent -> gap, texture untouched.
func apply_to_view(sprite: Sprite2D, meta: Dictionary, mo: Dictionary = {}, texture: Texture2D = null) -> Dictionary:
	var t := resolve_transform(meta, mo)
	if sprite == null:
		t["applied"] = false
		t["gap"] = {"facet": "view", "status": "no Sprite2D supplied -> transform not applied"}
		return t
	_applied.append({"sprite": sprite, "orig_rot": sprite.rotation, "orig_flip_h": sprite.flip_h, "orig_tex": sprite.texture})
	sprite.rotation = float(t["rotation_rad"])     # pure transform (no texture required)
	sprite.flip_h = bool(t["flip_h"])
	var crop_applied := false
	if bool(t["has_crop"]):
		if texture != null:
			var atlas := AtlasTexture.new()         # WRAPS the caller texture; nothing minted
			atlas.atlas = texture
			atlas.region = (t["crop"] as Dictionary)["region"]
			sprite.texture = atlas
			crop_applied = true
		else:
			t["gap_crop"] = {"facet": "crop texture", "status": "srcRect present but no caller texture -> crop NOT applied (no mint)"}
	t["applied"] = true
	t["crop_applied"] = crop_applied
	return t

## Body 3 — reset ONLY the transform this unit set on the sprites it touched (R11 keeps
## ownership; size/pivot/position untouched here and restored to the recorded transform).
func terminate() -> void:
	for a in _applied:
		var s = a["sprite"]
		if s != null and is_instance_valid(s):
			s.rotation = a["orig_rot"]
			s.flip_h = a["orig_flip_h"]
			s.texture = a["orig_tex"]
	_applied.clear()

func dispose() -> void:
	terminate()

func snapshot() -> Dictionary:
	return {"applied": _applied.size()}
