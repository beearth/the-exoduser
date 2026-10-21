extends RefCounted
## Setup-only grounding. Authored foot stays fixed; opaque silhouette moves to it.
const DATA=preload("res://scripts/maps/map11/ground_contact_data.gd")
static func align(sprite: Sprite2D,key: String="") -> Rect2:
 if key.is_empty():key=sprite.texture.resource_path
 assert(DATA.SHAPES.has(key),"MAP11 opaque contact hull missing: "+key)
 var hull: Array=DATA.SHAPES[key]
 var width: float=sprite.region_rect.size.x if sprite.region_enabled else sprite.texture.get_width()
 var bounds:=Rect2()
 for i in range(hull.size()):
  var point: Vector2=hull[i]
  if sprite.flip_h:point.x=width-point.x
  point=sprite.transform.basis_xform(point)
  bounds=Rect2(point,Vector2.ZERO) if i==0 else bounds.expand(point)
 var shift:=Vector2(-bounds.get_center().x,-bounds.end.y)
 sprite.centered=false
 sprite.offset=sprite.transform.affine_inverse().basis_xform(shift)
 var grounded:=Rect2(bounds.position+shift,bounds.size)
 sprite.set_meta("opaque_ground_bounds",grounded)
 sprite.set_meta("opaque_ground_key",key)
 return grounded
static func depth(item: Node2D,world_foot: Vector2) -> void:
 item.z_as_relative=false;item.z_index=clampi(int(world_foot.y/4.0),-4096,4095)

const MASKS=preload("res://scripts/maps/map11/ground_contact_masks.gd")
static func shadow(parent: Node2D,source: Sprite2D,foot: Vector2,z: int,alpha: float,unlit: Material) -> Sprite2D:
 var key: String=source.get_meta("opaque_ground_key")
 var spec: Dictionary=MASKS.MASKS[key]
 var ao:=Sprite2D.new();ao.name="OpaqueFootContact";ao.texture=spec.texture
 ao.centered=false;ao.flip_h=source.flip_h
 # The image's crop transform preserves the source foot; no translated shadow.
 var ratio: Vector2=(spec.size as Vector2)/ao.texture.get_size()
 ao.scale=source.scale*ratio;ao.rotation=source.rotation
 ao.offset=(source.offset+(spec.offset as Vector2))/ratio
 ao.position=foot;ao.z_index=z;ao.modulate=Color(0,0,0,alpha);ao.material=unlit
 ao.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
 ao.set_meta("contact_source",source);ao.set_meta("contact_foot",foot);ao.set_meta("ground_contact_kind","ao")
 parent.add_child(ao);return ao
