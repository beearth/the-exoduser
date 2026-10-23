extends SceneTree
const USERDIR="EXODUSER-demo11-50-Isolated-20261021-SWEEP-B3-20261023-01"
const Store=preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Options=preload("res://port_modules/npc_interaction/source_options_state.gd")
var checks:=0
var failures:=0
var main: Node
var captures:=""
func check(ok: bool,label: String) -> void:
	checks+=1
	if not ok: failures+=1;printerr("DEMO11_50_FAIL ",label)
func _initialize() -> void:call_deferred("capture_only" if "--captures-only" in OS.get_cmdline_user_args() else "run")
func boot() -> void:
	main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
	for i in 8:await physics_frame
func dispose() -> void:
	paused=false;root.remove_child(main);main.free();main=null
	for i in 8:await process_frame
func run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolation")
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--captures="):captures=arg.trim_prefix("--captures=")
	var folder:=OS.get_user_data_dir().path_join("demo_local_storage")
	if DirAccess.dir_exists_absolute(folder):check(DirAccess.rename_absolute(folder,folder+"-preserved-"+str(Time.get_ticks_usec()))==OK,"preserve_prior_isolated_evidence")
	root.size=Vector2i(1920,1080)
	await boot()
	var menu: Node=main.native_demo_pause_menu
	var bridge: RefCounted=menu.settings_bridge
	var opt: Dictionary=main.source_initialization_services.read_current_options()
	check(opt.size()==38 and opt.textScale==100 and opt.panelFit==true and opt.diffV2==1,"actual_source38_initialized")
	check(menu.read_settings().status=="READY" and is_same(menu.read_settings().options,opt),"S01_ready_same_owner")
	var original: Dictionary=opt.duplicate(true)
	var input: Dictionary=main.read_native_input_bindings()
	var qe: Object=main.player.get("_native_combat_qe")
	var hz:=Engine.physics_ticks_per_second
	for bad in [{"sfxVol":NAN},{"lang":"xx","bgmVol":20},{"diffV2":1},{"textScale":111},{"fpsCap":240},{"panelFit":1}]:
		check(not menu.request_settings(bad).applied and opt==original,"invalid_transaction_atomic_"+str(bad.keys()))
	check(not main.source_initialization_services.get_source_options_state().commit_settings_fields({"sfxVol":999}).applied,"owner_rejects_bypass")
	main._toggle_pause()
	check(paused and menu.is_menu_visible(),"pause_owner")
	# SWEEP-B(2026-10-23): 웹 Escape=togglePanel('settings') — 설정 패널이 바로 열린다(별도 일시정지 페이지 없음).
	check(menu.get_snapshot().page=="settings" and paused and not menu.buttons.has("settings"),"escape_opens_web_settings_panel")
	var panel: Node=menu._center
	# SWEEP-B(2026-10-23): 웹 리마스터 설정 탭 배치(parity_ui_05_settings_layout.json = 웹 DOM 실측):
	#   게임 탭 = Language(optLang)·'전체화면 (F11)' 버튼 / 화면 탭 = 화면 흔들림·안내 글자 크기·'설정 창 화면에 맞추기'(optPanelFit)·FPS 제한(optFps range, CAPS 인덱스)
	check(panel.controls.has("lang") and panel.controls.has("전체화면 (F11)"),"system_controls")
	panel.controls.tab_screen.pressed.emit();panel=menu._center
	check(panel.controls.has("textScale") and panel.controls.has("panelFit") and panel.controls.has("shake") and panel.controls.has("fpsCap"),"screen_controls")
	panel.controls.shake.value=0;panel.controls.shake.drag_ended.emit(true)
	check(opt.shake==0,"shake_actual_control_OPT")
	panel.controls.textScale.value=110;panel.controls.textScale.drag_ended.emit(true)
	for i in 2:await process_frame
	check(opt.textScale==110,"text_scale_round_contract_actual_control")
	panel.controls.panelFit.button_pressed=false
	for i in 2:await process_frame
	check(opt.panelFit==false,"panel_fit_actual_control")
	panel.controls.tab_system.pressed.emit();panel=menu._center
	panel.controls.lang.select(1);panel.controls.lang.item_selected.emit(1)
	for i in 2:await process_frame
	check(opt.lang=="en" and TranslationServer.get_locale().begins_with("en"),"language_actual_control")
	panel.controls.tab_sound.pressed.emit();panel=menu._center
	panel.controls.sfxVol.value=37;panel.controls.sfxVol.drag_ended.emit(true)
	panel.controls.bgmVol.value=12;panel.controls.bgmVol.drag_ended.emit(true)
	check(opt.sfxVol==37 and opt.bgmVol==12 and main.read_native_attack_audio_settings().sfx_percent==37,"volume_controls_existing_OPT_consumer")
	panel.controls.tab_screen.pressed.emit();panel=menu._center
	# 웹 optFps = range(0..CAPS-1) → OPT.fpsCap=CAPS[value] (G49041)
	var cap: HSlider=panel.controls.fpsCap
	cap.value=float(menu.settings_bridge.CAPS.find(120));cap.drag_ended.emit(true)
	for i in 2:await process_frame
	check(opt.fpsCap==120 and Engine.max_fps==120 and Engine.physics_ticks_per_second==hz,"120_render_cap_physics_unchanged")
	# 웹 '전체화면 (F11)'은 체크박스가 아닌 토글 버튼(게임 탭)
	panel.controls.tab_system.pressed.emit();panel=menu._center
	panel.controls["전체화면 (F11)"].pressed.emit()
	for i in 2:await process_frame
	if DisplayServer.get_name()!="headless":check(root.mode==Window.MODE_FULLSCREEN,"actual_OS_fullscreen")
	panel.controls["전체화면 (F11)"].pressed.emit()
	for i in 2:await process_frame
	if DisplayServer.get_name()!="headless":check(root.mode==Window.MODE_WINDOWED,"actual_OS_windowed")
	check(is_same(opt,main.source_initialization_services.read_current_options()) and opt.diff==5 and opt.diffV2==1,"same_OPT_identity_protected_diff")
	var store:=Store.new();check(store.open_store().ready,"existing_adapter_namespace")
	var saved:=store.read_json("hellcave_settings")
	check(saved.ready and saved.found and saved.value.keys().size()==3 and same_source(saved.value.opt,opt) and saved.value.binds==input.primary and saved.value.binds2==input.secondary,"source_payload_shape_and_exact_values "+JSON.stringify({"ready":saved.get("ready"),"found":saved.get("found"),"opt_equal":same_source(saved.value.opt,opt),"bindings_equal":saved.value.binds==input.primary,"secondary_equal":saved.value.binds2==input.secondary,"saved_opt":saved.value.opt}))
	check(store.get_item("hellLang").raw=="en","raw_hellLang_source_format")
	check(store.read_json("hellcave_screen").value.mode=="windowed","separate_original_screen_key")
	# Core fault injection: IO lock denies persistence after the explicitly acknowledged live prefix.
	check(DirAccess.make_dir_absolute(folder.path_join(".writer"))==OK,"fixture_storage_lock")
	var failed: Dictionary=menu.request_settings({"bgmVol":13})
	check(failed.applied and not failed.persisted and opt.bgmVol==13 and store.read_json("hellcave_settings").value.opt.bgmVol==12,"IO_failure_reports_actual_commit_prefix_without_fake_saved")
	check(DirAccess.remove_absolute(folder.path_join(".writer"))==OK,"remove_only_fixture_lock")
	check(menu.request_settings({"bgmVol":12}).persisted,"retry_saves_current_live_state")
	var corrupted:=store.begin_set("bad-saved-option","hellcave_settings",JSON.stringify({"opt":{"fpsCap":120.5}}))
	check(corrupted.ready and store.run_request("bad-saved-option").committed,"invalid_saved_fixture_written")
	var before_restore: Dictionary=opt.duplicate(true)
	check(bridge.restore().get("status")=="REJECTED" and opt==before_restore,"corrupt_saved_option_refused_atomically")
	check(menu.request_settings({"fpsCap":120}).persisted,"repair_only_own_fixture_via_normal_save")
	check(main.read_native_input_bindings()==input and main.player.get("_native_combat_qe")==qe,"no_InputMap_or_QE_owner_change")
	check(menu.TEXT.combat[0]=="Q 패링 · E 방패(불꽃칼날)","correct_source_key_guidance")
	# Saved protected fields are preserved on disk, but never applied to input/combat.
	var protected_payload: Dictionary=store.read_json("hellcave_settings").value
	protected_payload.binds["parry"]="KeyF";protected_payload.opt["diff"]=10;protected_payload.opt["future_setting"]="opaque"
	var protected_write:=store.begin_set("protected-fixture","hellcave_settings",JSON.stringify(protected_payload))
	check(protected_write.ready and store.run_request("protected-fixture").committed,"protected_saved_fixture")
	check(menu.request_settings({"fpsCap":120}).persisted,"normal_UI_save_over_existing_settings")
	var preserved: Dictionary=store.read_json("hellcave_settings").value
	check(preserved.binds.parry=="KeyF" and preserved.opt.diff==10 and preserved.opt.future_setting=="opaque" and opt.diff==5,"saved_protected_fields_retained_without_live_adoption")
	# Independent newer lobby language wins; original settings OPT remains en.
	var language_write:=store.begin_set("newer-lobby","hellLang","ko")
	check(language_write.ready and store.run_request("newer-lobby").committed,"newer_lobby_language_written")
	var expected: Dictionary=opt.duplicate(true);expected.lang="ko"
	await dispose()
	check(not bridge.request({"fpsCap":60}).applied,"lost_owner_cannot_write")
	await boot()
	menu=main.native_demo_pause_menu;bridge=menu.settings_bridge;opt=main.source_initialization_services.read_current_options()
	check(bridge.snapshot().restore.status=="READY" and bridge.snapshot().restore.settings_found and same_source(opt,expected),"fresh_Main_restores_disk_settings_and_newer_language "+JSON.stringify({"restore":bridge.snapshot().restore,"actual":opt,"expected":expected}))
	check(Engine.max_fps==120 and TranslationServer.get_locale().begins_with("ko"),"restore_applies_actual_consumers")
	check(main.read_native_input_bindings()==input,"saved_BINDS_not_applied")
	main._toggle_pause();check(menu.get_snapshot().page=="settings" and paused,"escape_opens_settings_after_restore");panel=menu._center
	if not captures.is_empty():
		DirAccess.make_dir_recursive_absolute(captures)
		root.size=Vector2i(1920,1080)
		panel.controls.textScale.grab_focus()
		panel._rebuild("system")
		check(panel.controls.textScale.has_focus(),"focus_retained_on_display_rebuild")
		await capture("01-system")
		panel.controls.tab_sound.pressed.emit();await capture("02-sound")
	# 웹 togglePanel: 열린 설정에서 Escape = closeAllPanels → 재개 / 닫기 [ESC] 버튼도 같은 경로
	main._toggle_pause();check(not paused and not menu.is_menu_visible(),"Esc_closes_settings_and_resumes")
	main._toggle_pause();check(paused and menu.get_snapshot().page=="settings","Esc_reopens_settings")
	menu.buttons.back.pressed.emit();check(not paused and not menu.is_menu_visible(),"close_button_resumes_existing_owner")
	await dispose()
	print("DEMO11_50_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"saved_bindings_applied":false}))
	quit(1 if failures else 0)
func capture(name: String) -> void:
	for i in 5:await process_frame
	await RenderingServer.frame_post_draw
	var image:=root.get_texture().get_image()
	check(image.get_size()==Vector2i(1920,1080),"capture1920_"+name)
	check(image.save_png(captures.path_join(name+".png"))==OK,"capture_"+name)
	check(image.get_region(Rect2i(410,10,1100,1060)).save_png(captures.path_join(name+"-1x.png"))==OK,"crop1x_"+name)

# JSON carries JS numbers as native floats. Compare exact numeric values without
# treating bool/string or missing keys as numbers; no tolerance/default fill.
func same_source(a: Variant,b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float):return float(a)==float(b)
	if a is Dictionary and b is Dictionary:
		if a.size()!=b.size():return false
		for key in a:
			if not b.has(key) or not same_source(a[key],b[key]):return false
		return true
	return typeof(a)==typeof(b) and a==b

func capture_only() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolation_capture_only")
	check(DisplayServer.get_name()!="headless","GPU_capture_backend")
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--captures="):captures=arg.trim_prefix("--captures=")
	if captures.is_empty():failures+=1;quit(1);return
	root.size=Vector2i(1920,1080)
	await boot()
	main._toggle_pause();check(main.native_demo_pause_menu.get_snapshot().page=="settings","escape_opens_settings_capture")
	var panel: Node=main.native_demo_pause_menu._center
	check(panel.find_child("HellGothicCrest",true,false)!=null,"existing_crest_reused")
	check(panel.controls.tab_system.get_theme_color("font_disabled_color")==Color("dfd6c2"),"selected_tab_bone_ink")
	await capture("01-system")
	panel.controls.tab_sound.pressed.emit();await capture("02-sound")
	await dispose()
	print("DEMO11_50_CAPTURE_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skip":0,"logic_suite_repeated":false}))
	quit(1 if failures else 0)
