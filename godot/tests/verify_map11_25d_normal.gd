extends SceneTree
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-25D-Isolated-20261021":quit(2);return
 root.size=Vector2i(128,128)
 var image:=Image.create(32,32,false,Image.FORMAT_RGBA8);image.fill(Color(1,1,1,1))
 var normals:=Image.create(32,32,false,Image.FORMAT_RGBA8);normals.fill(Color(.5,.9,.8,1))
 var canvas:=CanvasTexture.new();canvas.diffuse_texture=ImageTexture.create_from_image(image);canvas.normal_texture=ImageTexture.create_from_image(normals)
 var sprite:=Sprite2D.new();sprite.texture=canvas;sprite.position=Vector2(64,64);root.add_child(sprite)
 var ambient:=CanvasModulate.new();ambient.color=Color.BLACK;root.add_child(ambient)
 var light:=PointLight2D.new();light.texture=ImageTexture.create_from_image(image);light.texture_scale=8.0;light.height=24;light.energy=1.0;root.add_child(light)
 var values: Array=[]
 for y in [32,96]:
  light.position=Vector2(64,y)
  for i in range(6):await process_frame
  await RenderingServer.frame_post_draw
  var shot: Image=root.get_texture().get_image()
  values.append(shot.get_pixel(64,64).r)
 var row: Dictionary={"normal_rgb":[.5,.9,.8],"above_luminance":values[0],"below_luminance":values[1],"positive_green_faces_up":values[0]>values[1]+.1}
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):
   var f:=FileAccess.open(arg.trim_prefix("--output="),FileAccess.WRITE);f.store_string(JSON.stringify(row,"  "))
 quit(0 if row.positive_green_faces_up else 1)
