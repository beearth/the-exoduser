extends "res://scripts/native_ch2_area_resources.gd"
## CH2-05: reuse readonly CH2 admission, with its own stage7 contract and pin.
const Stage7Contract=preload("res://port_modules/ch2_map_source/stage7_contract.gd")
const SOURCE7 := "res://data/ch2_map_source/si7.json"
const RESOURCES7 := "res://data/ch2_map_source/si7_resources.json"
const RESOURCE_SHA7 := "042def098d26d9fd596b24b2c57f97118ad383113ea3b8863a62880f95612027"

func read_resources(raw: Variant=null, bundle: Variant=null) -> Dictionary:
 if raw==null:raw=JSON.parse_string(FileAccess.get_file_as_string(SOURCE7))
 var check: Dictionary=Stage7Contract.read_area(raw)
 if check.status!="READY":return {"ready":false,"errors":["source_contract:"+str(check.reason)]}
 if FileAccess.get_sha256(RESOURCES7)!=RESOURCE_SHA7:return {"ready":false,"errors":["resource_manifest_pin"]}
 var reference: Variant=JSON.parse_string(FileAccess.get_file_as_string(RESOURCES7))
 if not reference is Dictionary:return {"ready":false,"errors":["resource_manifest_invalid"]}
 if bundle==null:bundle=reference
 if not _same(bundle,reference):return {"ready":false,"errors":["resource_manifest_changed"]}
 if bundle.source.game_sha256!=raw.source.game_sha256 or bundle.source.source_snapshot_tile_sha256!=raw.runtime_tile_sha256:
  return {"ready":false,"errors":["source_resource_mismatch"]}
 var textures: Dictionary={}
 var errors: Array=[]
 for entry in bundle.assets:
  var file: String=entry.texture
  if not file.begins_with("res://assets/map/ch2/") or file.contains(".."):
   errors.append("asset_scope:"+file)
   continue
  if not FileAccess.file_exists(file) or FileAccess.get_sha256(file)!=entry.sha256:
   errors.append("asset_bytes_missing_or_changed:"+file)
   continue
  var texture:=load(file) as Texture2D
  if texture==null or texture.get_width()!=int(entry.size[0]) or texture.get_height()!=int(entry.size[1]):
   errors.append("texture_missing_or_size:"+file)
  else:textures[file]=texture
 return {"ready":errors.is_empty(),"errors":errors,"raw":raw,"bundle":bundle,"textures":textures,
  "scope":"si7_standalone_only","main_bound":false,"full_stage_ready":false}
