extends CanvasLayer
## Source movie still fallback. Motion remains HOLD pending approved Theora conversion.
signal finished
const EMPTY_CAPTIONS: Array=[]
var locale:="ko"
var phase:="idle"
var elapsed:=0.0
var group:="world"
var _data: Dictionary
var _textures: Dictionary={}
var _image: TextureRect
var _caption: Label
var _hint: Label
var _hold:=-1
var _hold_ms:=5000
var _sequence: Array=[]
var _was_paused:=false
var _owns_pause:=false
var _index:=-1
## BOOT-01 (PC) — begin과 같은 규칙의 프레임 리소스 경로(로비 예열이 백그라운드로 먼저 읽어 둔다).
static func frame_assets(kind: String) -> PackedStringArray:
	var out:=PackedStringArray()
	var data: Variant=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_video_source.json"))
	if not data is Dictionary:return out
	for key in (["gate","world"] if kind=="lobby" else ["warrior"]):
		for frame in data.get(key,{}).get("frames",[]):
			if not out.has(str(frame.asset)):out.append(str(frame.asset))
	return out
func begin(kind: String,language: String) -> void:
	locale=language;process_mode=Node.PROCESS_MODE_ALWAYS;layer=100
	_data=JSON.parse_string(FileAccess.get_file_as_string("res://data/parity_video_source.json"))
	_sequence=["gate","world"] if kind=="lobby" else ["warrior"]
	_hold_ms=1200 if kind=="warrior" else 5000
	for key in _sequence:
		for frame in _data[key].frames:_textures[frame.asset]=load(frame.asset)
	var panel:=Control.new();panel.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);panel.mouse_filter=Control.MOUSE_FILTER_STOP;add_child(panel)
	var black:=ColorRect.new();black.color=Color.BLACK;black.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);panel.add_child(black)
	_image=TextureRect.new();_image.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT);_image.expand_mode=TextureRect.EXPAND_IGNORE_SIZE;_image.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED;panel.add_child(_image)
	_caption=Label.new();_caption.position=Vector2(154,839);_caption.size=Vector2(1612,110);_caption.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER;_caption.vertical_alignment=VERTICAL_ALIGNMENT_BOTTOM;_caption.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART;_caption.add_theme_font_override("font",preload("res://scripts/native_ui_fonts.gd").stack("font"));_caption.add_theme_font_size_override("font_size",54);_caption.add_theme_color_override("font_shadow_color",Color.BLACK);_caption.add_theme_constant_override("shadow_outline_size",8);panel.add_child(_caption)
	_hint=Label.new();_hint.position=Vector2(1350,1015);_hint.size=Vector2(510,30);_hint.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT;_hint.add_theme_font_size_override("font_size",13);_hint.modulate=Color("c9b795");panel.add_child(_hint)
	_hint.text=preload("res://scripts/native_demo_ui_i18n.gd").text("SPACE 길게 눌러 건너뛰기",locale)
	_was_paused=get_tree().paused;_owns_pause=true;get_tree().paused=true;phase="playing";_next_group()
func _next_group() -> void:
	if _sequence.is_empty():finish();return
	group=_sequence.pop_front();elapsed=0;_index=-1
func _process(delta: float) -> void:
	if phase!="playing":return
	elapsed+=delta
	if _hold>=0 and Time.get_ticks_msec()-_hold>=_hold_ms:finish();return
	if elapsed>=float(_data[group].duration):_next_group();return
	var selected:=0
	var frames: Array=_data[group].frames
	for i in frames.size():
		if elapsed>=float(frames[i].t):selected=i
	if selected!=_index:_image.texture=_textures[frames[selected].asset];_index=selected
	_caption.position.y=971 if group=="warrior" else 839
	_caption.text=""
	for cue in _data[group].subtitles.get(locale,_data[group].subtitles.get("en",EMPTY_CAPTIONS)):
		if elapsed>=float(cue.start) and elapsed<float(cue.end):_caption.text=cue.text
	_hint.visible=group=="warrior" and elapsed<3
func next() -> void:
	for at in _data[group].cuts:
		if float(at)>elapsed+.05:elapsed=float(at);return
	_next_group()
func _input(event: InputEvent) -> void:
	if phase!="playing":return
	if event is InputEventKey and not event.echo:
		if event.physical_keycode==KEY_ESCAPE or (group=="warrior" and event.physical_keycode==KEY_SPACE):
			_hold=Time.get_ticks_msec() if event.pressed else -1
			if event.pressed and event.physical_keycode==KEY_SPACE:next()
		elif event.pressed and event.physical_keycode==KEY_SPACE:next()
		elif event.pressed and event.physical_keycode in [KEY_ENTER,KEY_RIGHT]:next()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed:next();get_viewport().set_input_as_handled()
func finish() -> void:
	if phase!="playing":return
	phase="done";hide();_restore_pause();finished.emit();queue_free()
func _restore_pause() -> void:
	if not _owns_pause:return
	_owns_pause=false
	if is_inside_tree():get_tree().paused=_was_paused
func _exit_tree() -> void:
	_restore_pause()
