extends "res://scripts/native_ch2_area_resources.gd"
## CH3-04 readonly admission; reuses CH2 strict JSON comparison, no shared owner.
const CH3Contract=preload("res://port_modules/ch3_map_source/stage12_contract.gd")
const CH3_SOURCE := "res://data/ch3_map_source/si12.json"
const CH3_MANIFEST := "res://data/ch3_map_source/si12_resources.json"
const MANIFEST_SHA := "012986b08485e088ceb8f02e8749e6359d6d25524b4121c1b328daa404fa372d"

func read_resources(raw: Variant=null,bundle: Variant=null) -> Dictionary:
 if raw==null:raw=JSON.parse_string(FileAccess.get_file_as_string(CH3_SOURCE))
 var check: Dictionary=CH3Contract.read_area(raw)
 if check.status!="READY":return {"ready":false,"errors":["source_contract:"+str(check.reason)]}
 if FileAccess.get_sha256(CH3_MANIFEST)!=MANIFEST_SHA:return {"ready":false,"errors":["resource_manifest_pin"]}
 var reference: Variant=JSON.parse_string(FileAccess.get_file_as_string(CH3_MANIFEST))
 if not reference is Dictionary:return {"ready":false,"errors":["resource_manifest_invalid"]}
 if bundle==null:bundle=reference
 if not _same(bundle,reference):return {"ready":false,"errors":["resource_manifest_changed"]}
 if bundle.source.game_sha256!=raw.source.game_sha256 or bundle.source.source_snapshot_tile_sha256!=raw.runtime_tile_sha256:
  return {"ready":false,"errors":["source_resource_mismatch"]}
 var admitted: Dictionary={}
 var errors: Array=[]
 for entry in bundle.assets:
  var file: String=entry.texture
  if (not file.begins_with("res://assets/map/ch3/") and not file.begins_with("res://assets/map/ch1/")) or file.contains(".."):
   errors.append("asset_scope:"+file)
   continue
  if not FileAccess.file_exists(file) or FileAccess.get_sha256(file)!=entry.sha256:
   errors.append("asset_bytes_missing_or_changed:"+file)
   continue
  var texture:=load(file) as Texture2D
  if texture==null or texture.get_width()!=int(entry.size[0]) or texture.get_height()!=int(entry.size[1]):
   errors.append("texture_missing_or_size:"+file)
  else:admitted[file]=texture
 return {"ready":errors.is_empty(),"errors":errors,"raw":raw,"bundle":bundle,"textures":admitted,
  "scope":"si12_standalone_only","main_bound":false,"full_stage_ready":false,"visual_source_pixel_identity":false}
