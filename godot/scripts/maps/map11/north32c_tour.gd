extends RefCounted
## Authored low silhouettes; setup only, existing approved PNGs, no authority.
const Contact=preload("res://scripts/maps/map11/ground_contact.gd")
const ROOT=preload("res://assets/map/props/prop_g_root.png")
const POOL=preload("res://assets/map/props/prop_pool.png")
const BLOOD=preload("res://assets/map/map11/patches/patch_bloodpool_roots.png")
const BONES=[preload("res://assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_0_diffuse.png"),preload("res://assets/map/map11/props/tour_25d/skull_pyramid/skull_pyramid_2_diffuse.png")]
static func mount(view: Node2D,unlit: Material) -> void:
 var soil:=ShaderMaterial.new();soil.shader=preload("res://scripts/maps/map11/north32c_ground.gdshader")
 var contact:=ShaderMaterial.new();contact.shader=soil.shader;contact.set_shader_parameter("contact",true)
 _ground(view,"NorthRootOssuary",ROOT,Vector2(-1280,2310),Vector2(980,330),soil,contact)
 _bones(view,"NorthOssuary",0,Vector2(-1300,2260),310,unlit)
 _ground(view,"NorthMossBasin",POOL,Vector2(420,1880),Vector2(830,310),soil,contact)
 _bones(view,"NorthWashedBones",1,Vector2(640,1820),225,unlit)
 _ground(view,"NorthVeinWound",BLOOD,Vector2(-280,2050),Vector2(610,235),soil,contact)
static func _ground(view: Node2D,id: String,texture_: Texture2D,foot: Vector2,size_: Vector2,material_: Material,unlit: Material) -> void:
 var s:=Sprite2D.new();s.name=id;s.texture=texture_;s.scale=size_/texture_.get_size()
 s.position=foot;s.material=material_;s.z_index=-2977;view.add_child(s)
 var bounds: Rect2
 if texture_!=ROOT:
  var used: Rect2i=texture_.get_image().get_used_rect()
  s.centered=false;s.offset=Vector2(-used.get_center().x,-used.end.y)
  bounds=Rect2((Vector2(used.position)+s.offset)*s.scale,Vector2(used.size)*s.scale)
 else:bounds=Contact.align(s)
 var ao:=Sprite2D.new();ao.name=id+"Contact";ao.texture=texture_;ao.centered=false
 ao.offset=s.offset;ao.scale=s.scale*Vector2(1.025,1.035);ao.position=foot+Vector2(0,3)
 ao.modulate=Color(1,1,1,.12);ao.material=unlit;ao.z_index=-2978;view.add_child(ao)
 view.layers.append({"node":ao,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
 view.layers.append({"node":s,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
static func _bones(view: Node2D,id: String,variant: int,foot: Vector2,height_: float,unlit: Material) -> void:
 var s:=Sprite2D.new();s.name=id;s.texture=BONES[variant]
 s.scale=Vector2.ONE*height_/s.texture.get_height();s.position=foot;s.material=unlit
 s.modulate=Color(.62,.63,.66);view.add_child(s)
 var bounds: Rect2=Contact.align(s);Contact.depth(s,foot)
 var ao: Sprite2D=Contact.shadow(view,s,foot,-2976,.72,unlit)
 view.layers.append({"node":ao,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
 view.rows.append({"sprite":s,"foot":foot,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
