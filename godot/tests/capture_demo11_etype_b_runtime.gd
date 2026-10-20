extends "res://tests/test_demo11_etype_b_runtime.gd"
func run() -> void:
 root.size=Vector2i(1920,1080)
 await boot_b()
 for frame in range(40):
  for actor in b_actors: actor.advance_native_phase(0.5,float(frame)*0.5,b_main.world.get_enemies())
 for i in range(3): await process_frame
 await RenderingServer.frame_post_draw
 var image: Image=root.get_texture().get_image()
 check(image.get_width()==1920 and image.get_height()==1080,"internal viewport 1920x1080")
 var dir="/Users/fordeargamers/exoduser-wt/_out/demo11-etype-b/captures"
 DirAccess.make_dir_recursive_absolute(dir)
 check(image.save_png(dir+"/registered-five.png")==OK,"viewport PNG")
 if not b_actors.is_empty():
  var point: Vector2=b_actors[0].get_global_transform_with_canvas().origin
  var rect:=Rect2i(clampi(int(point.x)-128,0,1664),clampi(int(point.y)-128,0,824),256,256)
  image.get_region(rect).save_png(dir+"/actor-1x.png")
 print("ETYPE_B_CAPTURE_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"actors":b_actors.size(),"width":image.get_width(),"height":image.get_height(),"source":"Godot internal viewport","fixture_MAP11_provider":true}))
 b_main.free()
 await process_frame
 quit(0 if failures==0 else 1)
