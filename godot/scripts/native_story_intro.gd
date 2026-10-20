extends CanvasLayer
## DEMO11-08: one presentation lifetime, then the existing P2-001i owner.
signal handed_off(reason: String)
const FONTS=preload("res://scripts/native_ui_fonts.gd")
const DATA_PATH="res://data/native_story_intro.json"
const HOLD_MS=2000 # game.html:62868 _CUT_SKIP_DUR
var segments: Array=[]
var segment:=0
var cue_index:=-2
var elapsed_ms:=0.0
var phase:="idle"
var handoff_count:=0
var source_root:=""
var locale:="ko"
var _main: Node
var _was_paused:=false
var _hold_at: int=-1
var _asset:=""
var _cache: Texture2D
var _image: TextureRect
var _subtitle: Label
var _title: Label
var _status: Label
var _skip: Button
var _retry: Button
var _last_tick:=0
var _hidden:=false
static func should_run(main: Node) -> bool:
	if main.has_meta("native_story_boot"):return bool(main.get_meta("native_story_boot"))
	return str(main.get_meta("native_intro_boot","auto"))=="auto" and main.get_tree().get_script()==null
func begin(main: Node) -> void:
	_main=main;process_mode=Node.PROCESS_MODE_ALWAYS;layer=100
	source_root=str(main.get_meta("native_story_source_root",ProjectSettings.globalize_path("res://../")))
	var options: Dictionary=main.source_initialization_services.read_current_options()
	locale=str(main.get_meta("native_story_locale",options.get("lang","ko")))
	if locale!="ko":locale="en"
	var parsed: Variant=JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
	if parsed is Dictionary:segments=parsed.get("segments",[])
	_was_paused=get_tree().paused;get_tree().paused=true
	_build();phase="playing";_last_tick=Time.get_ticks_msec()
	if segments.is_empty():_error();return
	_start_segment()
func _build() -> void:
	var panel:=Control.new();panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);panel.mouse_filter=Control.MOUSE_FILTER_STOP;add_child(panel)
	var black:=ColorRect.new();black.color=Color("090909");black.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);panel.add_child(black)
	_image=TextureRect.new();_image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_image.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;_image.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_COVERED;_image.mouse_filter=Control.MOUSE_FILTER_IGNORE;panel.add_child(_image)
	for bottom in [false,true]:
		var band:=ColorRect.new();band.color=Color(0.025,0.022,0.02,0.93)
		band.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE if bottom else Control.PRESET_TOP_WIDE)
		band.offset_top=-238 if bottom else 0;band.offset_bottom=0 if bottom else 108;panel.add_child(band)
		var line:=ColorRect.new();line.color=Color("8c7650");line.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE if bottom else Control.PRESET_TOP_WIDE);line.offset_top=-238 if bottom else 107;line.offset_bottom=-237 if bottom else 108;panel.add_child(line)
	_title=_label(panel,26,"cinzel_hell");_title.position=Vector2(76,33);_title.size=Vector2(1500,45)
	_subtitle=_label(panel,34,"hell");_subtitle.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_WIDE);_subtitle.offset_left=170;_subtitle.offset_right=-170;_subtitle.offset_top=-208;_subtitle.offset_bottom=-81;_subtitle.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_subtitle.vertical_alignment=VERTICAL_ALIGNMENT_CENTER;_subtitle.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
	_status=_label(panel,18,"hell");_status.set_anchors_and_offsets_preset(Control.PRESET_BOTTOM_LEFT);_status.position=Vector2(76,1021);_status.size=Vector2(1100,30)
	_skip=Button.new();_skip.text="건너뛰기 · SPACE 2초" if locale=="ko" else "Skip · hold SPACE 2s";_skip.position=Vector2(1500,991);_skip.size=Vector2(344,55);_style_button(_skip);panel.add_child(_skip)
	_skip.button_down.connect(func() -> void:_hold_at=Time.get_ticks_msec())
	_skip.button_up.connect(func() -> void:_hold_at=-1)
	_retry=Button.new();_retry.text="다시 시도" if locale=="ko" else "Retry";_retry.position=Vector2(810,700);_retry.size=Vector2(300,60);_style_button(_retry);panel.add_child(_retry);_retry.hide();_retry.pressed.connect(retry)
func _label(parent: Node,font_size: int,token: String) -> Label:
	var label:=Label.new();label.add_theme_font_override("font",FONTS.stack(token));label.add_theme_font_size_override("font_size",font_size);label.add_theme_color_override("font_color",Color("dfd6c2"));parent.add_child(label);return label
func _style_button(button: Button) -> void:
	button.add_theme_font_override("font",FONTS.stack("hell"));button.add_theme_font_size_override("font_size",22);button.add_theme_color_override("font_color",Color("dfd6c2"))
	var box:=StyleBoxFlat.new();box.bg_color=Color("171411");box.border_color=Color("8c7650");box.set_border_width_all(1);button.add_theme_stylebox_override("normal",box)
	var hover: StyleBoxFlat=box.duplicate();hover.bg_color=Color("481e16");button.add_theme_stylebox_override("hover",hover);button.add_theme_stylebox_override("pressed",hover)
func _start_segment() -> void:
	cue_index=-2;elapsed_ms=0;_asset="";_last_tick=Time.get_ticks_msec()
	_main.request_native_music_scene("intro",segments[segment].bgm)
	_title.text=("세계의 기록" if locale=="ko" else "CHRONICLES")+"   /   "+["I","II","III"][segment]
	_status.text="%s / %s" % [segment+1,segments.size()]
	_select_cue()
func _select_cue() -> void:
	var selected:=-1
	var cues: Array=segments[segment].cues
	for i in range(cues.size()):
		if elapsed_ms>=float(cues[i].t) and elapsed_ms<float(cues[i].t)+float(cues[i].dur):selected=i
	if selected==cue_index:return
	cue_index=selected
	if selected<0:_subtitle.text="";return
	var cue: Dictionary=cues[selected]
	_subtitle.text=str(cue.get("en",cue.text) if locale=="en" else cue.text)
	var path: String=cue.asset
	if path==_asset:return
	_asset=path
	if path.is_empty():_image.texture=null;_cache=null;return
	var image:=Image.new()
	if not FileAccess.file_exists(source_root.path_join(path)):_error();return
	if image.load(source_root.path_join(path))!=OK:_error();return
	_cache=ImageTexture.create_from_image(image);_image.texture=_cache
func _error() -> void:
	phase="error";_image.texture=null;_cache=null
	_subtitle.text="기록을 불러오지 못했습니다." if locale=="ko" else "Unable to load the chronicle."
	_status.text="다시 시도하거나 건너뛸 수 있습니다." if locale=="ko" else "Retry or skip to continue."
	_retry.show();_main.request_native_music_scene("stop")
func retry() -> void:
	if phase!="error":return
	_retry.hide();phase="playing"
	if segments.is_empty():_error();return
	_start_segment()
func advance(ms: float) -> void:
	if phase!="playing" or ms<0:return
	elapsed_ms+=ms
	while elapsed_ms>=float(segments[segment].duration):
		var remaining: float=elapsed_ms-float(segments[segment].duration)
		segment+=1
		if segment>=segments.size():finish("ended");return
		_start_segment();elapsed_ms=remaining
	_select_cue()
func _process(_delta: float) -> void:
	if phase not in ["playing","error"]:return
	var now:=Time.get_ticks_msec();var dt:=now-_last_tick;_last_tick=now
	var hidden: Variant=_main.read_native_document_hidden()
	_hidden=hidden is bool and hidden
	if _hidden:_hold_at=-1;return
	if _hold_at>=0 and now-_hold_at>=HOLD_MS:finish("skip");return
	if phase=="playing":
		advance(dt)
		if phase=="playing":_status.text="%s / %s" % [segment+1,segments.size()]
func _input(event: InputEvent) -> void:
	if phase not in ["playing","error"]:return
	if event is InputEventKey and event.physical_keycode==KEY_SPACE and not event.echo:
		_hold_at=Time.get_ticks_msec() if event.pressed else -1
		get_viewport().set_input_as_handled()
	elif event is InputEventKey or event is InputEventMouseButton:
		# The UI still receives button input; gameplay remains paused.
		if event is InputEventKey:get_viewport().set_input_as_handled()
func finish(reason: String) -> void:
	if phase in ["done","cancelled","idle"]:return
	phase="done";_hold_at=-1;handoff_count+=1;hide();_image.texture=null;_cache=null
	get_tree().paused=_was_paused
	_main.request_native_music_scene("guide")
	handed_off.emit(reason)
func cancel() -> void:
	if phase in ["done","cancelled","idle"]:return
	phase="cancelled";hide();_cache=null;_image.texture=null;get_tree().paused=_was_paused
	if is_instance_valid(_main):_main.request_native_music_scene("stop")
func _exit_tree() -> void:cancel()
