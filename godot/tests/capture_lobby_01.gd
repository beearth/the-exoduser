extends SceneTree
const OUT="/Users/fordeargamers/exoduser-wt/_out/LOBBY-01/captures"
func _initialize() -> void: call_deferred("_run")
func capture(file: String) -> void:
	await process_frame
	await RenderingServer.frame_post_draw
	var image:=root.get_texture().get_image()
	assert(image.get_size()==Vector2i(1600,900))
	assert(image.save_png(OUT.path_join(file))==OK)
func _run() -> void:
	assert(OS.get_user_data_dir().get_file()=="EXODUSER-demo11-LOBBY-01-Isolated-20261021")
	root.size=Vector2i(1600,900)
	root.content_scale_size=Vector2i(1920,1080)
	root.content_scale_mode=Window.CONTENT_SCALE_MODE_CANVAS_ITEMS
	TranslationServer.set_locale("ko")
	var screen=load("res://scenes/demo_lobby.tscn").instantiate()
	root.add_child(screen)
	for i in 4:await process_frame
	assert(screen.menu.ready)
	assert(screen.cards[0].has_focus())
	await capture("01-lobby.png")
	# Actual keyboard accept opens the focused empty slot.
	var enter:=InputEventAction.new();enter.action="ui_accept";enter.pressed=true
	Input.parse_input_event(enter)
	await process_frame
	enter=InputEventAction.new();enter.action="ui_accept";enter.pressed=false;Input.parse_input_event(enter)
	await process_frame
	assert(screen._form.visible)
	assert(screen.name_input.has_focus())
	assert(screen.character_buttons.size()==5)
	await capture("02-creation.png")
	var hover:=InputEventMouseMotion.new();hover.position=Vector2(1280,480)*Vector2(1600.0/1920,900.0/1080)
	Input.parse_input_event(hover)
	await create_timer(0.8).timeout
	await capture("03-locked-hover.png")
	screen.character_buttons[1].pressed.emit()
	assert(screen.character_index==0)
	assert(screen.creation_error.text=="출시 준비 중")
	screen.name_input.text="A";screen.name_input.text_submitted.emit("A")
	assert(screen.creation_error.text=="이름은 2~8자여야 합니다.")
	await capture("04-name-error.png")
	screen.name_input.text="A<";screen._create()
	assert(screen.creation_error.text=="특수문자는 사용할 수 없습니다.")
	assert(screen.menu.rows[0].kind=="empty")
	screen._close_form();assert(screen.cards[0].has_focus())
	TranslationServer.set_locale("en");screen._choose(0)
	await process_frame
	assert(screen._entry_error("name_length")=="Name must be 2–8 characters.")
	await capture("05-creation-en.png")
	# Only isolated metadata creation; custom SceneTree does not launch Main.
	screen.name_input.text="Warrior";screen._create()
	assert(not screen._form.visible)
	assert(screen.menu.rows[0].kind=="new")
	assert(screen.menu.storage.get_item("hellsave_demo_active").get("found",false)==false)
	print("LOBBY_01_RESULT PASS: keyboard accept, five portraits, locked admission, validation, cancel focus, EN, isolated metadata; 1600x900")
	quit()
