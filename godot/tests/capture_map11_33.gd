extends "res://tests/capture_upscale01.gd"
## MAP11-33 QA only. Cache inspection occurs once per capture, never in product ticks.
func _scene_info(scene: Node) -> Dictionary:
 var info: Dictionary=super._scene_info(scene)
 var candidates: Array=JSON.parse_string(FileAccess.get_file_as_string("res://tests/map11_33_candidates.json"))
 var inventory: Array=[]
 for relative in candidates:
  var path: String="res://"+relative
  if not ResourceLoader.has_cached(path):continue
  var resource: Resource=ResourceLoader.get_cached_ref(path)
  if not resource is Texture2D:continue
  var image_: Image=resource.get_image()
  if image_==null:continue
  inventory.append({"path":path,"width":image_.get_width(),"height":image_.get_height(),"format":image_.get_format(),"mipmaps":image_.has_mipmaps(),"data_bytes":image_.get_data_size()})
 var owner_paths: Array=[]
 _owner_paths(scene.field_view,owner_paths)
 _owner_paths(scene.arena_view,owner_paths)
 info["owner_paths"]=owner_paths
 info["map_texture_inventory"]=inventory
 return info

func _texture_path(texture_: Texture2D,paths: Array) -> void:
 if texture_==null:return
 if texture_ is CanvasTexture:
  _texture_path(texture_.diffuse_texture,paths);_texture_path(texture_.normal_texture,paths);return
 if texture_ is AtlasTexture:_texture_path(texture_.atlas,paths);return
 if not paths.has(texture_.resource_path):paths.append(texture_.resource_path)
func _owner_paths(node: Node,paths: Array) -> void:
 if node is Sprite2D:_texture_path(node.texture,paths)
 if node is Polygon2D:_texture_path(node.texture,paths)
 if node is MeshInstance2D:_texture_path(node.texture,paths)
 if node is CanvasItem and node.material is ShaderMaterial:
  for uniform_ in node.material.shader.get_shader_uniform_list():
   var value: Variant=node.material.get_shader_parameter(uniform_.name)
   if value is Texture2D:_texture_path(value,paths)
 for child in node.get_children():_owner_paths(child,paths)
