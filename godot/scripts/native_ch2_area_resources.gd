extends RefCounted
## CH2-02 readonly manifest/asset admission, no Main or current state ownership.
const Contract=preload("res://port_modules/ch2_map_source/stage4_contract.gd")
const Scalars=preload("res://port_modules/ch1_map_source/stage1_contract.gd")
const SOURCE := "res://data/ch2_map_source/si4.json"
const RESOURCES := "res://data/ch2_map_source/si4_resources.json"
const RESOURCE_SHA := "4bf1a8cab02f1ad2b3d199d0b05a155e51bbb59a9ff4911a6cb8c657fd4d0279"

func _same(value: Variant, expected: Variant) -> bool:
 if expected==null:return value==null
 if expected is Dictionary:
  if not value is Dictionary or value.size()!=expected.size():return false
  for key in expected:
   if not value.has(key) or not _same(value[key],expected[key]):return false
  return true
 if expected is Array:
  if not value is Array or value.size()!=expected.size():return false
  for i in expected.size():
   if not _same(value[i],expected[i]):return false
  return true
 return Scalars.literal(value,expected)

func read_resources(raw: Variant=null, bundle: Variant=null) -> Dictionary:
 if raw==null:raw=JSON.parse_string(FileAccess.get_file_as_string(SOURCE))
 var check: Dictionary=Contract.read_area(raw)
 if check.status!="READY":return {"ready":false,"errors":["source_contract:"+str(check.reason)]}
 if FileAccess.get_sha256(RESOURCES)!=RESOURCE_SHA:return {"ready":false,"errors":["resource_manifest_pin"]}
 var reference: Variant=JSON.parse_string(FileAccess.get_file_as_string(RESOURCES))
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
  "scope":"si4_standalone_only","main_bound":false,"full_stage_ready":false}
