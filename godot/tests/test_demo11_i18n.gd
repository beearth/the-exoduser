extends SceneTree
const USERDIR="EXODUSER-demo11-i18n-Isolated-20261021"
const UI=preload("res://scripts/native_demo_ui_i18n.gd")
const GUIDE=preload("res://scripts/native_intro_key_guide_panel.gd")
var assertions:=0
var failures:=0
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;printerr("DEMO_I18N_FAIL ",label)
func korean(value: String) -> bool:
	for i in value.length():
		var c: int=value.unicode_at(i)
		if c>=0xac00 and c<=0xd7a3:return true
	return false
func _initialize() -> void:call_deferred("_run")
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
	if failures:quit(2);return
	check(korean("\uac00") and not korean("English"),"Korean detector checks codepoints, not UTF32 bytes")
	var catalog: Dictionary=UI.catalog()
	for key in catalog.messages:
		var en: String=UI.text(key,"en")
		check(not en.is_empty() and not korean(en),"EN key complete: "+key)
		check(UI.text(key,"ko")==key,"KO exact roundtrip: "+key)
		check(UI.text(key,"fr")==en,"unsupported locale uses explicit EN: "+key)
	check(UI.text("User-created Name","en")=="User-created Name","unbound player input remains unchanged")
	TranslationServer.set_locale("ko")
	var lobby=load("res://scenes/demo_lobby.tscn").instantiate();root.add_child(lobby)
	await process_frame
	check(lobby.bridge.language=="ko","lobby starts from current settings locale")
	lobby.cards[0].pressed.emit();lobby.name_input.text="Keeper"
	TranslationServer.set_locale("en");await process_frame;await process_frame
	check(lobby.bridge.language=="en" and lobby.start.text==UI.text("이어하기"),"already-open lobby retranslated")
	check(lobby.name_input.text=="Keeper" and lobby._form.visible,"locale switch preserves form and entered name")
	for button in lobby.cards:check(not korean(button.text),"EN slot card has no fixed Korean")
	TranslationServer.set_locale("ko");await process_frame;await process_frame
	check(lobby.start.text=="이어하기" and lobby.name_input.text=="Keeper","open lobby KO return keeps input")
	lobby.queue_free();await process_frame
	var guide=GUIDE.new();guide.language="en"
	for i in range(4):
		var step: Dictionary=guide.compose_step(i)
		for key in ["title","line","note","hint","next","skip"]:check(not korean(step[key]),"EN intro step "+str(i)+" "+key)
		for row in step.rows:check(not korean(row.key) and not korean(row.desc),"EN intro keyboard row")
	guide.pad=true
	for i in range(4):
		for row in guide.compose_step(i).rows:check(not korean(row.key) and not korean(row.desc),"EN gamepad row")
	guide.free()
	TranslationServer.set_locale("ko")
	var main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
	if not main.is_node_ready():await main.ready
	if not is_instance_valid(main._character_picker):main._build_native_character_selection_ui() # Existing display-only selection view.
	var lesson: Node=main.source_intro_sequence.lesson_flow
	check(is_instance_valid(lesson),"actual installed lesson UI owner")
	if not is_instance_valid(lesson):main.queue_free();quit(1);return
	if lesson._ui.is_empty():lesson._build_panel();lesson._render() # View-only construction, no practice/success event.
	var lesson_before: Array=[lesson.phase,lesson.step,lesson.checks.duplicate()]
	var state_before: Dictionary=main.source_state.read_current_inventory().duplicate(true)
	var mats: Variant=main.source_state.read_current_g().mats
	var draws: Variant=main.world.get_native_runtime_snapshot().random_draw_count
	main.source_forge.open_panel()
	TranslationServer.set_locale("en");await process_frame;await process_frame
	for label in main.source_forge.find_children("*","Label",true,false):check(not korean(label.text),"EN actual forge Label: "+label.text)
	for button in main.source_forge.find_children("*","Button",true,false):check(not korean(button.text),"EN actual forge Button: "+button.text)
	for label in lesson._panel.find_children("*","Label",true,false):check(not korean(label.text),"EN actual lesson Label: "+label.text)
	for button in lesson._panel.find_children("*","Button",true,false):check(not korean(button.text),"EN actual lesson Button: "+button.text)
	check([lesson.phase,lesson.step,lesson.checks]==lesson_before,"locale changes no lesson progress or judgement")
	for i in main._character_picker.item_count:
		check(not korean(main._character_picker.get_item_text(i)) and not korean(main._character_picker.get_item_tooltip(i)),"EN character label and unavailable tooltip")
	for label in main.hud._objective_values.values():check(not korean(label.text),"HUD numeric values remain numeric")
	for binding in main.hud.find_children("Demo11TextBinding","Node",true,false):check(not korean(str(binding.get_parent().get("text"))),"EN bound HUD static label")
	check(main.source_state.read_current_inventory()==state_before and main.source_state.read_current_g().mats==mats,"language switch has no inventory/wallet writes")
	check(main.world.get_native_runtime_snapshot().random_draw_count==draws,"paused locale switch consumes no gameplay RNG")
	TranslationServer.set_locale("ko");await process_frame;await process_frame
	check(main.source_forge.text("title")=="검은 화로","forge KO return")
	main.source_forge.close_panel()
	for child in main.find_children("*","AudioStreamPlayer",true,false):child.stop()
	main.queue_free();await process_frame;await create_timer(.15).timeout
	print("DEMO_I18N_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"catalog_keys":catalog.messages.size(),"settings_ui_in_main":false,"inventory_ui_in_main":false,"demo_end_ui_in_main":false,"skipped":[]}))
	quit(1 if failures else 0)
