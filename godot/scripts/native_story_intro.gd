extends CanvasLayer
## PARITY-INTRO-01. Only the first-entry INTRO; lobby/story have separate owners.
signal handed_off(reason: String)
const HOLD_MS=2000
const DATA_PATH="res://data/parity_intro_source.json"
var phase:="idle"
var handoff_count:=0
var source_root:=""
var locale:="ko"
var cue_index:=0
var elapsed_ms:=0.0
var segment:=0
var segments: Array=[] # Legacy public inspection surface; never a product playlist.
var _main: Node
var _was_paused:=false
var _hold_at: int=-1
var _hidden:=false
var _view: Control
var _lines: Array=[]
var _textures: Dictionary={}
var _data: Dictionary
var _wait:=false
var _exit_elapsed:=0.0
static func should_run(main: Node) -> bool:
	if main.has_meta("native_story_boot"):return bool(main.get_meta("native_story_boot"))
	return str(main.get_meta("native_intro_boot","auto"))=="auto" and main.get_tree().get_script()==null
func begin(main: Node) -> void:
	_main=main;process_mode=Node.PROCESS_MODE_ALWAYS;layer=100
	source_root=str(main.get_meta("native_story_source_root",ProjectSettings.globalize_path("res://../")))
	var options: Dictionary=main.source_initialization_services.read_current_options()
	locale=str(main.get_meta("native_story_locale",options.get("lang","ko")))
	_data=JSON.parse_string(FileAccess.get_file_as_string(DATA_PATH))
	_lines=_data.lines.get(locale,_data.lines.en)
	# Bounded preparation at scene entry; no image/resource IO in a tick.
	for cue in _lines:
		var asset: String=str(cue.get("img","")) if cue.get("img")!=null else ""
		if asset.is_empty() or _textures.has(asset):continue
		var image:=Image.load_from_file(source_root.path_join("assets/cutscene/images/"+asset))
		if image!=null:_textures[asset]=ImageTexture.create_from_image(image)
	_was_paused=get_tree().paused;get_tree().paused=true
	_view=preload("res://scripts/parity_intro_canvas.gd").new();_view.owner_story=self
	add_child(_view);phase="playing"
	get_tree().create_timer(.4,true,false,true).timeout.connect(func():
		if phase=="playing":_main.request_native_music_scene("intro","cutscene_nemesis"))
func current_cue() -> Dictionary:
	return _lines[cue_index] if cue_index<_lines.size() else {}
func advance(ms: float) -> void:
	if phase!="playing" or ms<0:return
	elapsed_ms+=ms
	var cue:=current_cue()
	if cue.is_empty():finish("ended");return
	if cue.get("exit",false):
		if elapsed_ms>=float(cue.get("fade",{}).get("out",1500)):finish("ended")
	elif str(cue.get("text","")).is_empty() or cue.get("speaker")==null:
		if elapsed_ms>=float(cue.dur):_next()
	else:
		if elapsed_ms>=str(cue.text).replace("\n","").length()*float(cue.get("text_cfg",{}).get("speed",50)):_wait=true
func _next() -> void:
	_exit_elapsed=elapsed_ms
	cue_index+=1;elapsed_ms=0;_wait=false
	if cue_index>=_lines.size():finish("ended")
func click_advance() -> void:
	var cue:=current_cue()
	if cue.get("speaker")!=null and not str(cue.get("text","")).is_empty() and not _wait:_wait=true
	else:_next()
func _process(delta: float) -> void:
	if phase!="playing":return
	var hidden: Variant=_main.read_native_document_hidden()
	_hidden=hidden is bool and hidden
	if _hidden:_hold_at=-1;return
	if _hold_at>=0 and Time.get_ticks_msec()-_hold_at>=HOLD_MS:finish("skip");return
	advance(delta*1000)
	_view.queue_redraw()
func _input(event: InputEvent) -> void:
	if phase!="playing":return
	if event is InputEventKey and not event.echo:
		if event.physical_keycode==KEY_SPACE:_hold_at=Time.get_ticks_msec() if event.pressed else -1
		elif event.pressed and event.physical_keycode==KEY_ENTER:click_advance()
		get_viewport().set_input_as_handled()
	elif event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_LEFT:
		click_advance();get_viewport().set_input_as_handled()
func finish(reason: String) -> void:
	if phase in ["done","cancelled","idle"]:return
	phase="done";_hold_at=-1;handoff_count+=1;hide();_textures.clear()
	get_tree().paused=_was_paused
	_main.request_native_music_scene("guide");handed_off.emit(reason)
func cancel() -> void:
	if phase in ["done","cancelled","idle"]:return
	phase="cancelled";hide();_textures.clear();get_tree().paused=_was_paused
	if is_instance_valid(_main):_main.request_native_music_scene("stop")
func _exit_tree() -> void:cancel()
