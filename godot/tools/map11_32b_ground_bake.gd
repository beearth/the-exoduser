extends SceneTree
## Offline diffuse ground/decal composition. Runtime lighting remains the owner.
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MAP11-32b-Isolated":quit(2);return
 var source:=Node2D.new()
 source.set_script(preload("res://scripts/maps/map11/product_field_view.gd"))
 source.recipe=preload("res://scripts/maps/map11/field_recipe.tres")
 source._build_ground();source._build_mass()
 for row in source._decal_rows:
  if preload("res://scripts/maps/map11/target32_layout.gd").in_region(row.position):row.node.hide()
 source._surface.material.set_shader_parameter("ground",preload("res://assets/maps/map11/field_ground_filtered.png"))
 source._surface.material.shader=preload("res://scripts/maps/map11/product_surface.gdshader")
 var rows: Array=[]
 for iy in range(5):
  for ix in range(5):
   var origin:=Vector2(-5120+ix*2048,-5120+iy*2048)
   var viewport:=SubViewport.new();viewport.size=Vector2i(2052,2052);viewport.transparent_bg=true
   viewport.render_target_update_mode=SubViewport.UPDATE_ALWAYS;root.add_child(viewport)
   var surface: Node2D=source._surface.duplicate();surface.position=-origin+Vector2(2,2);viewport.add_child(surface)
   # Shader coordinates stay in original world space after moving into the tile.
   surface.material=surface.material.duplicate();surface.material.set_shader_parameter("surface_origin",Vector2.ZERO)
   for i in range(3):await process_frame
   await RenderingServer.frame_post_draw
   var image:=viewport.get_texture().get_image()
   var used:=image.get_used_rect()
   if used.has_area():
    var file: String="ground_%d_%d.png"%[ix,iy]
    image.save_png("res://assets/maps/map11/target32b/"+file)
    rows.append({"file":file,"position":[origin.x,origin.y],"size":[2048,2048]})
   viewport.queue_free()
   for i in range(2):await process_frame
 var f:=FileAccess.open("res://assets/maps/map11/target32b/ground.json",FileAccess.WRITE);f.store_string(JSON.stringify({"tiles":rows,"tile_core":2048,"bleed":2,"source":"product_surface + static roots/AO/fissures"},"  "));f.close()
 source.free();quit()
