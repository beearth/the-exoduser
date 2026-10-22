extends SceneTree
const USERDIR="EXODUSER-demo11-42-Isolated-20261021"
var checks:=0
var failures:=0
var main: Node
var capture_dir:=""
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1;printerr("DEMO11_42_FAIL ",label)
func _initialize() -> void:
	preload("res://tests/mac_harness_safety.gd").arm(self, 120.0)
	call_deferred("run")
func run() -> void:
	# Legacy map contract: own dormant/provider/intro fixture, no MAP11 product binding.
	if "--map11=off" not in OS.get_cmdline_user_args():push_error("legacy contract requires --map11=off");quit(2);return
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolated_user_dir")
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--captures="): capture_dir=arg.trim_prefix("--captures=")
	root.size=Vector2i(1920,1080)
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 12: await physics_frame
	var hud: Node=main.hud
	var view: Node=hud.get_node_or_null("PublicHUD/Demo11OwnerHUD")
	check(is_instance_valid(view),"production_installs_owner_view")
	if not is_instance_valid(view): finish();return
	check(view.mouse_filter==Control.MOUSE_FILTER_IGNORE,"HUD_input_passthrough")
	check(view.snapshot().ready and not view.snapshot().boss_visible,"dormant_actor_hidden")
	var state: Node=main.source_state
	var adapter: Node=main.world.get_node("NativeSkillSlots")
	var intro: Node=main.source_intro_sequence
	check(intro.begin_native_intro().get("applied",false),"actual_intro_begins")
	check(intro.finish_native_guide().get("applied",false),"actual_stage_opens")
	# Fixture assignment uses only the existing actual P seam; no production writer added.
	var p: Dictionary=state.read_current_p()
	p.skillSlots[0]=null;p.skillSlots[2]="spikeTrap"
	main.dispatch_native_skill_slot("1")
	check(view.snapshot().selected_key=="1" and view.snapshot().selected_skill=="" and view.snapshot().failure_reason=="unassigned_or_unlearned","Main_failure_reaches_HUD")
	check(view.snapshot().failure_text=="" and not view._failure.visible,"localized_failure")
	var mats: float=state.read_current_g().mats
	var result: Dictionary=main.dispatch_native_skill_slot("3")
	check(result.accepted and view.snapshot().selected_skill=="spikeTrap" and view.snapshot().failure_text=="","successful_dispatch_selects_and_clears_failure")
	check(mats-state.read_current_g().mats==5,"one_original_cost_only")
	check(view.snapshot().cooldown.pct==1 and view.snapshot().cooldown.text=="10.0s","same_timer_authority")
	check(hud._native_slot_skill_id("qs2",p)=="spikeTrap" and hud._native_slot_skill_id("qs0",p)=="","icon_follows_owner_assignment")
	var press:=InputEventKey.new();press.physical_keycode=KEY_3;press.pressed=true
	adapter._unhandled_input(press)
	check(view.snapshot().failure_reason=="cast_gate_refused" and view.snapshot().failure_text=="" and not view._failure.visible,"real_keyboard_failure_observed")
	p.ultSlot="blackStar";p.skills["blackStar"]=1
	main.dispatch_native_skill_slot("Z")
	check(view.snapshot().selected_skill=="blackStar" and view.snapshot().failure_reason=="executor_interface_required","ULT_HOLD_visible_without_fake_execute")
	check(view.snapshot().selection_text.ends_with("사용 불가"),"unsupported_ULT_not_ready")
	var spawned: Dictionary=main.spawn_native_demo_boss({"si":0,"room":0,"x":4020.0,"y":7200.0,"difficulty_index":5,"stage_diff_offset":0})
	check(spawned.status=="READY","real_DEMO34_spawn")
	# Resource fixture commits before pause through the unchanged production gate.
	check(state.commit_native_skill_dispatch_cost(main,17,23,0).accepted,"resource_fixture_uses_existing_cost_owner")
	get_tree_pause(true)
	var actor: Node=main.native_demo_boss_actor
	# Fixture-only HP readback states, never a hurtE/damage path claim.
	var enemy: Dictionary=actor.get("_enemy")
	enemy.hp=enemy.mhp*.625
	view.refresh_native_owners()
	var got: Dictionary=view.snapshot()
	check(got.boss_visible and got.boss_hp==enemy.hp and got.boss_max_hp==enemy.mhp and got.boss_ratio==.625 and got.boss_fill_px==311.25,"actual_actor_partial_HP_exact "+JSON.stringify(got))
	var before_p: Dictionary=state.read_current_p().duplicate(true)
	var before_g: Dictionary=state.read_current_g().duplicate(true)
	var before_actor: Dictionary=actor.snapshot()
	var before_cd: Dictionary=adapter.read_native_slot_cooldowns()
	for i in 20: view.refresh_native_owners()
	check(state.read_current_p()==before_p and state.read_current_g()==before_g,"HUD_resources_readonly")
	check(actor.snapshot()==before_actor and adapter.read_native_slot_cooldowns()==before_cd,"HUD_never_advances_boss_or_cooldown")
	check(got.resources.st==before_p.st and got.resources.mp==before_p.mp and got.resources.sp==before_p.sp and got.resources.mats==before_g.mats,"resource_single_owner_values")
	# RETOUCH: real cost owner produces independent partial MP/ST; HUD remains a reader.
	hud._refresh();view.refresh_native_owners()
	var resources: Dictionary=state.read_current_p()
	# game.html:2639-2662,60300-60305: MP/SP split values, CSS .5s transition.
	# Render owner is WebOrbTrim; the previous multirow Label stays hidden.
	var trim: Node=hud.get_node("PublicHUD/NativeSPGlobe/WebOrbTrim")
	check(trim.stamina and trim.hud==hud and not hud._stamina_text.visible,"SP_trim_reads_same_owner")
	check(not hud._mp_text.visible and hud._mp_text.text=="MP\n%d\n/%d" % [int(resources.mp),int(resources.mmp)],"MP_values_same_owner_legacy_label_hidden")
	var mobility: Node=hud.get_node("PublicHUD/WebMobilityHUD")
	# UI-only samples while paused: advance actual display transition, never gameplay.
	for i in 12:mobility._process(.05)
	check(is_equal_approx(hud._stamina_fill.get_shader_parameter("mp_ratio"),float(int(resources.mp))/float(int(resources.mmp))),"left_blue_MP_independent_fill")
	check(is_equal_approx(hud._stamina_fill.get_shader_parameter("fill_ratio"),float(resources.st)/float(resources.mst)),"right_green_SP_independent_fill")
	var bound_state: Node=hud._source_state
	var before_fill: float=hud._stamina_fill.get_shader_parameter("mp_ratio")
	hud._source_state=null;hud._refresh();mobility._process(.05)
	check(not hud._mp_text.visible and hud._mp_text.text=="" and hud._stamina_fill.get_shader_parameter("mp_ratio")==before_fill,"unbound_owner_no_invented_value")
	hud._source_state=bound_state;hud._refresh()
	check(not hud._mp_text.visible and not hud._mp_text.text.is_empty() and trim.hud._source_state==bound_state,"MP_trim_restores_same_owner")
	view._selection_seconds=0;view.refresh_native_owners()
	check(not view._strip.visible,"idle_has_no_permanent_debug_strip")
	var saved: float=enemy.hp
	enemy.hp=NAN;view.refresh_native_owners();check(not view.snapshot().boss_visible,"invalid_HP_hides_stale_bar")
	enemy.hp=0;view.refresh_native_owners();check(not view.snapshot().boss_visible,"dead_HP_hides_bar")
	enemy.hp=enemy.mhp*2;view.refresh_native_owners();check(view.snapshot().boss_fill_px==498,"overmax_visual_clamp_only")
	enemy.hp=saved
	# Screens use real HUD with explicit fixture receipts; no arena/combat completion claim.
	view._observe("3",{"accepted":true})
	hud.set_native_intro_hud_visible(true)
	hud._refresh()
	view.refresh_native_owners()
	if not capture_dir.is_empty() and preload("res://tests/mac_harness_safety.gd").can_capture():
		check(DirAccess.make_dir_recursive_absolute(capture_dir)==OK,"capture_directory_ready")
		await create_timer(1.1,true).timeout # existing real-time curtain owner finishes; no forced hide
		check(not main.get_native_intro_curtain_view().visible,"source_curtain_finished_before_capture")
		await capture("01-owner-ready")
		view._observe("3",{"accepted":false,"reason":"cast_gate_refused"})
		await capture("02-owner-failure")
		view._observe("Z",{"accepted":false,"reason":"executor_interface_required"})
		await capture("03-ultimate-hold")
		check(FileAccess.file_exists(capture_dir.path_join("01-owner-ready.png")),"GPU_capture_written")
	for label: Label in [hud._mp_text,hud._stamina_text,view._selection,view._failure]:
		check(not label.text.contains("미이식") and not label.text.contains("미구현") and not label.text.contains("연결 대기"),"player_facing_text_has_no_development_words")
	var parent: Node=actor.get_parent();parent.remove_child(actor)
	view.refresh_native_owners();check(not view.snapshot().boss_visible,"detached_actor_not_displayed")
	parent.add_child(actor)
	view._failure_seconds=0;view.refresh_native_owners();check(view.snapshot().failure_text=="","failure_expires_without_timer_mutation")
	get_tree_pause(false)
	root.remove_child(main);main.free();main=null
	for i in 8: await process_frame
	finish()
func get_tree_pause(value: bool) -> void: paused=value
func capture(label: String) -> void:
	if not preload("res://tests/mac_harness_safety.gd").can_capture():return
	for i in 3: await process_frame
	await RenderingServer.frame_post_draw
	var image: Image=root.get_texture().get_image()
	check(image.get_size()==Vector2i(1920,1080),"1920x1080_"+label)
	check(image.save_png(capture_dir.path_join(label+".png"))==OK,"capture_"+label)
	image.get_region(Rect2i(670,10,580,110)).save_png(capture_dir.path_join(label+"-boss-1x.png"))
	image.get_region(Rect2i(580,815,760,265)).save_png(capture_dir.path_join(label+"-skills-1x.png"))
	image.get_region(Rect2i(1260,815,300,265)).save_png(capture_dir.path_join(label+"-resources-1x.png"))
func finish() -> void:
	print("DEMO11_42_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"capture_skipped_headless":not capture_dir.is_empty() and not preload("res://tests/mac_harness_safety.gd").can_capture(),"damage_or_shield_writes":0}))
	quit(0 if failures==0 else 1)
