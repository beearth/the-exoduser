extends SceneTree
## Capture clocks may be fixed here; never used by input-only E2E.
var out: String
func _initialize() -> void:call_deferred("run")
func shot(name: String) -> void:
 await RenderingServer.frame_post_draw
 var image:=root.get_texture().get_image();image.save_png(out.path_join(name+"_godot.png"))
func run() -> void:
 for a in OS.get_cmdline_user_args():
  if a.begins_with("--out="):out=a.trim_prefix("--out=")
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-INTRO-01-") or out.is_empty():quit(2);return
 root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080)
 for item in [["lobby_start","lobby","world",1.0],["lobby_middle","lobby","world",56.34],["character","warrior","warrior",5.55]]:
  var movie:=preload("res://scripts/parity_video_intro.gd").new();root.add_child(movie);movie.begin(item[1],"ko");movie.set_process(false);movie.group=item[2];movie.elapsed=item[3];movie._process(0)
  await shot(item[0]);movie.finish();await process_frame
 var main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_story_boot",true);root.add_child(main)
 for i in 6:await process_frame
 var story: Node=main.native_story_intro;story.set_process(false)
 for item in [["entry_start",0,1200.0],["entry_goddess",2,1800.0],["entry_diroy",10,1800.0]]:
  story.cue_index=item[1];story.elapsed_ms=item[2];story._wait=false;story._view.queue_redraw();await shot(item[0])
 story.finish("capture");paused=false
 var seq: Node=main.source_intro_sequence
 seq.finish_native_guide()
 var curtain_until: int=Time.get_ticks_msec()+1500
 while Time.get_ticks_msec()<curtain_until:await process_frame
 print("PARITY_CURTAIN ",main.source_intro_curtain.phase," visible=",main.source_intro_curtain.visible," elapsed=",main.source_intro_curtain.elapsed_ms())
 if is_instance_valid(seq.lesson_flow):seq.lesson_flow.skip_all()
 # Pause to capture t=150 source ring and p=.5 banner without gameplay drift.
 paused=true;seq.bonfire.active=true;seq.bonfire.t=150.0;seq._barrier.show();seq._barrier.queue_redraw()
 print("PARITY_BARRIER ",JSON.stringify(seq.bonfire)," canvas=",main.world.get_viewport_transform()," ready=",seq._barrier_texture!=null)
 main.get_node("NativeRegions")._show_area_title();main.get_node("NativeRegions")._area_left=1.55;main.get_node("NativeRegions")._process(0)
 await shot("summon_area")
 # Render source fallen presentation via the existing life owner, capture-only.
 var life: Node=main.get("native_demo_life")
 if life==null:
  for child in main.get_children():
   if child.get_script()!=null and str(child.get_script().resource_path).ends_with("native_demo11_life.gd"):life=child;break
 if is_instance_valid(life):
  life.roll={"chance":11.4,"can_revive":true};life.remaining=150;life._fallen.show();life._view.show();life._screen.hide();life._update_count()
  main.get_node("NativeRegions")._area.hide();await shot("fallen_summon")
 paused=false;main.queue_free()
 for i in 6:await process_frame
 print("PARITY_INTRO_CAPTURE_RESULT ",JSON.stringify({"failures":0,"capture_clock_fixed":true,"e2e":false}))
 quit()
