extends RefCounted
## CH1-04 standalone resource reader. Product map, resource owners and Main are untouched.
const Contract = preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const SOURCE := "res://data/ch1_map_source/si1.json"
const RESOURCES := "res://data/ch1_map_source/si1_resources.json"

func read_resources(raw: Dictionary = {}, bundle: Dictionary = {}) -> Dictionary:
 if raw.is_empty():
  raw = JSON.parse_string(FileAccess.get_file_as_string(SOURCE))
 if bundle.is_empty():
  bundle = JSON.parse_string(FileAccess.get_file_as_string(RESOURCES))
 var errors: Array = []
 var source_check: Dictionary = Contract.new().validate_area(raw)
 if source_check.status != "READY":
  return {"ready":false,"errors":["source_contract:"+str(source_check.reason)]}
 if bundle.get("schema") != "exoduser.ch1-area-resources.v1" or bundle.get("stage") != 1:
  return {"ready":false,"errors":["unsupported_resource_schema_or_stage"]}
 if bundle.get("source",{}).get("game_sha256") != raw.source.game_sha256 or bundle.get("source",{}).get("source_snapshot_tile_sha256") != raw.runtime_tile_sha256:
  return {"ready":false,"errors":["source_resource_mismatch"]}
 if not bundle.get("assets") is Array or bundle.assets.size() != 10:
  return {"ready":false,"errors":["asset_manifest_missing"]}
 var textures: Dictionary = {}
 for a in bundle.assets:
  var texture_path: String = a.get("texture","")
  if not texture_path.begins_with("res://assets/map/ch1_si1/") or texture_path.contains(".."):
   errors.append("asset_scope:"+texture_path)
   continue
  if not FileAccess.file_exists(texture_path) or FileAccess.get_sha256(texture_path) != a.get("sha256"):
   errors.append("asset_bytes_missing_or_changed:"+texture_path)
   continue
  var texture := load(texture_path) as Texture2D
  if texture == null:
   errors.append("texture_missing:"+texture_path)
  else:
   textures[texture_path] = texture
 if not bundle.get("props") is Array or bundle.props.size() != 13 or not bundle.get("colliders") is Array or bundle.colliders.size() != 5:
  errors.append("objects_or_collider_count")
 if not bundle.get("wall_rects") is Array or bundle.wall_rects.size() != 313:
  errors.append("wall_rectangle_count")
 var floor_data: Dictionary = bundle.get("floor",{})
 if not floor_data.get("alpha") is Array or floor_data.alpha.size() != 40000:
  errors.append("floor_mask_missing")
 else:
  var alpha := PackedByteArray(floor_data.alpha)
  var ctx := HashingContext.new()
  ctx.start(HashingContext.HASH_SHA256)
  ctx.update(alpha)
  if ctx.finish().hex_encode() != floor_data.get("alpha_sha256"):
   errors.append("floor_mask_hash")
 return {"ready":errors.is_empty(),"errors":errors,"raw":raw,"bundle":bundle,"textures":textures,
  "scope":"si1_standalone_only","main_bound":false,"full_stage_ready":false}
