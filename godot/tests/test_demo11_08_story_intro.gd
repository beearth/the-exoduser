extends SceneTree
const USERDIR="EXODUSER-demo11-08-Isolated-20261021"
var assertions:=0
var failures:=0
var out_dir:=""
func _initialize() -> void:call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;printerr("DEMO11_08_FAIL ",label)
func shot(name: String) -> void:
	if out_dir.is_empty():return
	await RenderingServer.frame_post_draw
	var image: Image=root.get_texture().get_image()
	check(image.get_size()==Vector2i(1920,1080),"viewport capture 1920x1080 "+name)
	check(image.save_png(out_dir.path_join(name+".png"))==OK,"capture saved "+name)
	image.get_region(Rect2i(150,850,1620,145)).save_png(out_dir.path_join(name+"-subtitle-1x.png"))
	image.get_region(Rect2i(1450,975,450,90)).save_png(out_dir.path_join(name+"-skip-1x.png"))
func _run() -> void:
	var source:=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-root="):source=arg.trim_prefix("--source-root=")
		if arg.begins_with("--out="):out_dir=arg.trim_prefix("--out=")
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated dir")
	if not out_dir.is_empty():DirAccess.make_dir_recursive_absolute(out_dir)
	check(not source.is_empty(),"explicit source root")
	if failures:quit(1);return
	var before:=AudioServer.bus_count
	var main=load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_story_boot",true);main.set_meta("native_story_source_root",source);main.set_meta("native_audio_source_root",source)
	root.add_child(main)
	for i in range(6):await process_frame
	var story: CanvasLayer=main.native_story_intro
	story.set_process(false)
	check(story.phase=="playing" and paused,"story owns gameplay pause")
	check(main.source_intro_sequence==null,"waking not installed early")
	check(story.segments.size()==3,"world warrior intro")
	check(story._image.texture!=null,"actual original world art")
	check(main._music_lifecycle.snapshot().scene=="intro","BGM lifecycle intro")
	check(not main._music_lifecycle.media.suspended,"cinematic pause does not suspend BGM")
	check(main._music_lifecycle.life.snapshot_state().cur.playing(),"actual BGM plays")
	await shot("01-world")
	story.advance(float(story.segments[0].duration)-story.elapsed_ms+3200)
	check(story.segment==1 and story.cue_index==1,"warrior source t2500 subtitle")
	check(story._subtitle.text=="전쟁에서 살아 돌아온 한 남자.","original warrior caption")
	await shot("02-warrior")
	story.advance(float(story.segments[1].duration)-story.elapsed_ms+5000)
	check(story.segment==2 and story.cue_index==2,"INTRO goddess t4000")
	await shot("03-intro")
	story.advance(float(story.segments[2].duration))
	check(story.phase=="done" and story.handoff_count==1,"natural completion once")
	check(not paused and is_instance_valid(main.source_intro_sequence),"pause restored existing P2 owner installed")
	var sequence: Node=main.source_intro_sequence
	check(sequence.phase=="guide" and is_instance_valid(sequence.guide_panel),"existing P2007A four-cut panel")
	story.finish("skip");main._native_story_handoff("duplicate")
	check(story.handoff_count==1 and main.source_intro_sequence==sequence,"duplicate finish no duplicate owner")
	await create_timer(0.9).timeout # capture after existing panel fade-in, not its initial black frame
	await shot("04-waking-handoff")
	var extra=load("res://scripts/native_story_intro.gd").new();main.add_child(extra);extra.begin(main);extra.set_process(false)
	extra._hold_at=Time.get_ticks_msec()-1900;extra._last_tick=Time.get_ticks_msec();extra._process(0)
	check(extra.phase=="playing","short hold does not skip")
	extra._hold_at=Time.get_ticks_msec()-2100;extra._process(0)
	check(extra.phase=="done" and extra.handoff_count==1,"2 second hold skip")
	extra.free()
	extra=load("res://scripts/native_story_intro.gd").new();main.add_child(extra);extra.begin(main);extra.set_process(false)
	extra.source_root="/nonexistent-DEMO11-08-fixture";extra._asset="";extra.cue_index=-2;extra._select_cue()
	check(extra.phase=="error" and extra._retry.visible,"missing asset error UI")
	await shot("05-error")
	extra.source_root=source;extra.retry()
	check(extra.phase=="playing" and extra._image.texture!=null,"retry recovers")
	extra.finish("skip");check(extra.handoff_count==1,"error retry skip one boundary");extra.free()
	paused=true
	main.set_meta("native_story_locale","en")
	extra=load("res://scripts/native_story_intro.gd").new();main.add_child(extra);extra.begin(main);extra.set_process(false)
	check(extra.locale=="en" and extra._subtitle.text=="There are countless worlds","English source subtitle")
	await shot("06-english")
	extra.cancel()
	check(paused and extra.handoff_count==0 and extra.phase=="cancelled","cancellation restores earlier pause no handoff")
	extra.free();paused=false
	main.queue_free()
	for i in range(8):await process_frame
	check(AudioServer.bus_count==before,"all audio buses released")
	print("DEMO11_08_RESULT assertions=",assertions," failures=",failures)
	quit(1 if failures else 0)
