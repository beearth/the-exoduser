extends Node2D
## Static diffuse chunks; textures are resolved once during setup, never in updates.
var chunks: Array[Dictionary]=[]
func mount(view: Node2D) -> bool:
 const PATH="res://assets/maps/map11/target32b/"
 if not FileAccess.file_exists(PATH+"ground.json"):return false
 var recipe: Dictionary=JSON.parse_string(FileAccess.get_file_as_string(PATH+"ground.json"))
 for row in recipe.tiles:
  var sprite:=Sprite2D.new();sprite.name="FieldStaticGround";sprite.centered=false
  sprite.texture=load(PATH+row.file)
  sprite.region_enabled=true;sprite.region_rect=Rect2(2,2,2048,2048)
  sprite.region_filter_clip_enabled=false
  sprite.position=Vector2(row.position[0],row.position[1]);sprite.z_index=-3000
  add_child(sprite);chunks.append({"sprite":sprite,"rect":Rect2(sprite.position,Vector2(2048,2048))})
 view.add_child(self)
 view._surface.hide()
 # The baked surface owns these static instances; release their draw objects.
 view._surface.queue_free();view._decal_rows.clear()
 return true
func update_view(view: Rect2) -> void:
 for row in chunks:row.sprite.visible=view.intersects(row.rect)
