extends RefCounted
## Authored low silhouettes; setup only, existing approved PNGs, no authority.
const Contact=preload("res://scripts/maps/map11/ground_contact.gd")
const ROOT=preload("res://assets/maps/map11/upscale01/north/root.png")
const POOL=preload("res://assets/maps/map11/upscale01/north/moss.png")
const BLOOD=preload("res://assets/maps/map11/upscale01/north/blood.png")
const BONES=[preload("res://assets/maps/map11/upscale01/north/bones0.png"),preload("res://assets/maps/map11/upscale01/north/bones2.png")]
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
 var used: Rect2i=texture_.get_image().get_used_rect()
 s.centered=false;s.offset=Vector2(-used.get_center().x,-used.end.y)
 var bounds:=Rect2((Vector2(used.position)+s.offset)*s.scale,Vector2(used.size)*s.scale)
 view.layers.append({"node":s,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
static func _bones(view: Node2D,id: String,variant: int,foot: Vector2,height_: float,unlit: Material) -> void:
 var s:=Sprite2D.new();s.name=id;s.texture=BONES[variant]
 s.scale=Vector2.ONE*height_/s.texture.get_height();s.position=foot;s.material=unlit
 s.modulate=Color(.62,.63,.66);view.add_child(s)
 var used: Rect2i=s.texture.get_image().get_used_rect()
 s.centered=false;s.offset=Vector2(-used.get_center().x,-used.end.y)
 var bounds:=Rect2((Vector2(used.position)+s.offset)*s.scale,Vector2(used.size)*s.scale)
 Contact.depth(s,foot)
 var ao:=Sprite2D.new();ao.name=id+"ShortFootContact"
 ao.texture=preload("res://assets/maps/map11/target30/actor_contact.png")
 ao.position=foot+Vector2(0,-3);ao.scale=Vector2(bounds.size.x*.64,16)/ao.texture.get_size()
 ao.modulate=Color(0,0,0,.38);ao.material=unlit;ao.z_index=-2976;view.add_child(ao)
 view.layers.append({"node":ao,"rect":Rect2(foot-Vector2(bounds.size.x*.4,16),Vector2(bounds.size.x*.8,32))})
 view.rows.append({"sprite":s,"foot":foot,"rect":Rect2(foot+bounds.position,bounds.size).grow(40)})
