extends RefCounted
## SETTINGS-S10 / DEMO11-50. Original settings keys/payload, existing demo IO boundary.
## No saved BINDS application, difficulty migration, player save or combat writer.
const Store=preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Read=preload("res://scripts/native_settings_read_view.gd")
const CAPS=[30,60,120,144,244,0]
var _main: WeakRef
var _store:=Store.new()
var _view:=Read.new()
var _serial:=0
var _busy:=false
var _receipt: Dictionary={"status":"NOT_READY"}
var _restore: Dictionary={"status":"NOT_STARTED"}
func configure(main: Node) -> bool:
	if _main!=null: return false
	_main=weakref(main)
	if not _view.configure(main.source_initialization_services): return false
	var opened:=_store.open_store()
	if not opened.ready: _restore=opened;apply_consumers();return true
	_restore=restore()
	return true
func read_options() -> Dictionary: return _view.read_current_options_view()
func validate(changes: Dictionary) -> bool:
	return preload("res://port_modules/npc_interaction/source_options_state.gd").validate_settings_fields(changes)
func _commit(changes: Dictionary) -> Dictionary:
	if not validate(changes): return {"applied":false,"reason":"invalid_or_protected_setting"}
	var main: Node=_main.get_ref()
	if not is_instance_valid(main) or not main.is_inside_tree(): return {"applied":false,"reason":"owner_lost"}
	var packet:=read_options()
	if packet.status!="READY": return {"applied":false,"reason":packet.reason}
	return main.source_initialization_services.get_source_options_state().commit_settings_fields(changes)
func request(changes: Dictionary) -> Dictionary:
	if _busy: return {"applied":false,"reason":"reentrant_settings_request"}
	_busy=true
	var result:=_commit(changes)
	if result.applied:
		apply_consumers()
		var saved:=save()
		result.merge({"persisted":saved.get("ready",false),"storage":saved,"prefix":"OPT_and_consumers_committed"})
	_receipt=result.duplicate(true)
	_busy=false
	return result
func _write(key: String, raw: String) -> Dictionary:
	_serial+=1
	var id: String="settings-%d-%d" % [get_instance_id(),_serial]
	var result:=_store.begin_set(id,key,raw)
	if not result.get("ready",false): return result
	for i in 2:
		if result.get("settled",false): break
		result=_store.advance(id)
	if result.get("settled",false): _store.release_receipt(id)
	result=result.duplicate(true)
	result["ready"]=result.get("settled",false) and result.get("committed",false) and result.get("cleanup_error",OK)==OK
	return result
func save() -> Dictionary:
	var packet:=read_options()
	if packet.status!="READY": return {"ready":false,"reason":packet.reason}
	var main: Node=_main.get_ref()
	if not is_instance_valid(main): return {"ready":false,"reason":"owner_lost"}
	var profile: Dictionary=main.read_native_input_bindings()
	if profile.get("ready")!=true:return {"ready":false,"reason":"binding_reader_unready"}
	# Source saveSettings shape. Current native defaults are captured, never restored/remapped here.
	var payload: Dictionary={"binds":profile.primary.duplicate(true),"binds2":profile.secondary.duplicate(true),"opt":packet.options.duplicate(true)}
	var existing:=_store.read_json("hellcave_settings")
	if not existing.get("ready",false):return existing
	if existing.get("found",false) and existing.value is Dictionary and existing.value.get("binds") is Dictionary and existing.value.get("binds2") is Dictionary and existing.value.get("opt") is Dictionary:
		# Protected saved bindings/unknown OPT fields survive settings UI writes.
		payload=existing.value.duplicate(true)
		for key in ["sfxVol","bgmVol","lang","fpsCap","textScale","panelFit","shake"]:payload.opt[key]=packet.options[key]
	var settings:=_write("hellcave_settings",JSON.stringify(payload))
	if not settings.get("ready",false): return settings
	var language:=_write("hellLang",str(packet.options.lang))
	return {"ready":language.get("ready",false),"settings":settings,"language":language,"partial_prefix":not language.get("ready",false)}
func restore() -> Dictionary:
	var item:=_store.read_json("hellcave_settings")
	if not item.get("ready",false): return item
	var restored:=false
	if item.get("found",false):
		if not item.value is Dictionary or not item.value.get("opt") is Dictionary: return {"status":"REJECTED","reason":"settings_payload_invalid"}
		var allowed: Dictionary={}
		for key in item.value.opt:
			if key in ["sfxVol","bgmVol","lang","fpsCap","textScale","panelFit","shake"]: allowed[key]=item.value.opt[key]
		if not allowed.is_empty():
			var commit:=_commit(allowed)
			if not commit.applied:return {"status":"REJECTED","reason":commit.reason}
			restored=true
	# Same source precedence: newer independent lobby choice follows settings OPT.lang.
	var language:=_store.get_item("hellLang")
	if not language.get("ready",false): return language
	if language.get("found",false) and language.raw in ["ko","en"]: _commit({"lang":language.raw})
	var screen:=_store.read_json("hellcave_screen")
	if not screen.get("ready",false): return screen
	if screen.get("found",false):
		if not screen.value is Dictionary or screen.value.get("mode") not in ["windowed","fullscreen"]:return {"status":"REJECTED","reason":"screen_payload_invalid"}
		_apply_screen(screen.value.mode)
	apply_consumers()
	return {"status":"READY","settings_found":restored,"key_bindings_restored":false,"protected_fields_restored":false,"language_precedence":"settings_then_hellLang"}
func apply_consumers() -> void:
	var packet:=read_options()
	if packet.status!="READY":return
	Engine.max_fps=int(packet.options.fpsCap) # render cap only; no physics/scheduler rewrite
	TranslationServer.set_locale(str(packet.options.lang))
	# Existing Main SFX reader consumes OPT.sfxVol directly per sample; do not double its gain.
	# BGM gain is stored for the existing BGM owner; no missing BGM playback is fabricated.
func request_screen(mode: String) -> Dictionary:
	if _busy or mode not in ["windowed","fullscreen"]:return {"applied":false,"reason":"invalid_screen_or_busy"}
	var main: Node=_main.get_ref()
	if not is_instance_valid(main) or not main.is_inside_tree():return {"applied":false,"reason":"owner_lost"}
	_apply_screen(mode)
	var window: Window=main.get_window()
	var saved:=_write("hellcave_screen",JSON.stringify({"mode":mode,"res":"%dx%d" % [window.size.x,window.size.y]}))
	return {"applied":true,"display_applied":DisplayServer.get_name()!="headless","persisted":saved.get("ready",false),"storage":saved}
func _apply_screen(mode: String) -> void:
	if DisplayServer.get_name()=="headless":return
	var main: Node=_main.get_ref()
	if is_instance_valid(main):main.get_window().mode=Window.MODE_FULLSCREEN if mode=="fullscreen" else Window.MODE_WINDOWED
func snapshot() -> Dictionary:
	return {"options":read_options().duplicate(true),"restore":_restore.duplicate(true),"last_request":_receipt.duplicate(true),"key_remapping":false,"BGM_playback_owner":"HOLD_not_installed"}
