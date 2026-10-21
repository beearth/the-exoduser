extends Node
## DEMO11-41 only sound authority. No combat/State writer and no polling reflection.
const CATALOG=preload("res://port_modules/sound_source/bgm_catalog.gd")
const SELECT=preload("res://port_modules/sound_source/bgm_selection.gd")
const LIFE=preload("res://port_modules/sound_source/bgm_lifecycle.gd")
const MEDIA=preload("res://scripts/native_music_media.gd")
const BOSS_SIGNAL="native_boss_music_changed" # actor signal(phase: String, stage: int)
const ARPG_MIX=preload("res://scripts/native_arpg_audio_mix.gd")
var arpg_mix: Node
var media: RefCounted
var life: RefCounted
var _catalog: RefCounted
var _main: Node
var _context: Dictionary={"bgm_track":"auto","game":{"stage":0,"cutscene_done":true,"on":true}}
var _rng:=RandomNumberGenerator.new() # Music never consumes combat RNG.
var _scene := "stopped"
var _field := "hell1"
var _bus := ""
var _voice_serial := 0
var _voices: Dictionary={}
var _voice_keys: Dictionary={}
var _boss: WeakRef
var _intro: WeakRef
var _closed := false
var _options_signature: Array=[]
func configure(main: Node,source_root: String) -> bool:
	if is_instance_valid(_main) or not is_inside_tree():return false
	_main=main;_rng.randomize();_catalog=CATALOG.new()
	process_mode=Node.PROCESS_MODE_ALWAYS
	_field=_catalog.stage_key(0).key
	_bus="EXODUSER-BGM-%s" % get_instance_id()
	AudioServer.add_bus();AudioServer.set_bus_name(AudioServer.bus_count-1,_bus)
	AudioServer.set_bus_send(AudioServer.get_bus_index(_bus),"Music")
	media=MEDIA.new(self,_bus,source_root)
	life=LIFE.new(SELECT.new(_catalog),media,func() -> Dictionary:return _context,func() -> float:return _rng.randf())
	if life.status().status!="READY":close();return false
	arpg_mix=ARPG_MIX.new();add_child(arpg_mix);arpg_mix.configure(self)
	main.native_sound_event.connect(_combat_audio_event)
	main.source_document_visibility_changed.connect(_visibility)
	main.player.telemetry_event.connect(_player_event)
	return true
func bind_intro(owner: Node) -> void:
	if not is_instance_valid(owner) or not owner.has_signal("native_audio_phase_changed"):return
	_intro=weakref(owner);owner.native_audio_phase_changed.connect(_intro_phase)
	_intro_phase(owner.phase)
func _intro_phase(phase: String) -> void:
	if phase=="guide":transition("guide")
	elif phase=="opening":transition("field")
func bind_boss_actor(actor: Node) -> Dictionary:
	if not is_instance_valid(actor) or not actor.has_signal(BOSS_SIGNAL):return {"ready":false,"signal":BOSS_SIGNAL,"contract":"(phase: String, stage: int): entered/exited/victory"}
	if _boss!=null and is_instance_valid(_boss.get_ref()):return {"ready":false,"reason":"actor_already_bound"}
	_boss=weakref(actor);actor.connect(BOSS_SIGNAL,_boss_event)
	actor.tree_exiting.connect(_boss_exit,CONNECT_ONE_SHOT)
	return {"ready":true}
func _boss_event(phase: String,stage: int) -> void:
	if stage!=0:return # DEMO11-01 fixed 1-1 authority, no invented later stage.
	if phase=="entered":transition("boss")
	elif phase=="exited":transition("field")
	elif phase=="victory":transition("field") # Clear returns to the field cycle.
func _boss_exit() -> void:
	_boss=null
	if not _closed and _scene=="boss":transition("field")
func _player_event(kind: String,_data: Dictionary) -> void:
	if kind=="player_died":transition("death")
	else:arpg_mix.combat_event(kind)
func _combat_audio_event(kind: String,_data: Dictionary) -> void:
	arpg_mix.combat_event(kind)
func _visibility() -> void:
	var hidden: Variant=_main.read_native_document_hidden()
	media.suspend((get_tree().paused and _scene!="intro") or (hidden is bool and hidden)) # Cinematic pause keeps intro music.
	arpg_mix.suspend(media.suspended)
func transition(scene: String, key: String="") -> Dictionary:
	if _closed or scene not in ["lobby","intro","guide","field","boss","death","victory","stop"]:return {"ready":false,"reason":"scene_unsupported"}
	if scene==_scene and key.is_empty():return {"ready":true,"duplicate":true}
	refresh_options()
	_scene=scene
	arpg_mix.scene_changed(scene)
	stop_voices()
	_context.erase("cutscene_state")
	_context.game={"stage":0,"cutscene_done":true,"on":true}
	match scene:
		"stop","guide":life.stop()
		"field":
			arpg_mix.play(_field if key.is_empty() else key)
			if not key.is_empty():_field=key
		"intro":
			if key not in ["cutscene_prologue","cutscene_nemesis","cutscene_warintro"]:life.stop();return {"ready":false,"reason":"exact_intro_segment_required"}
			_context.cutscene_state="INTRO_CUTSCENE";life.play(key,true)
			_restore_envelope()
		"death","victory":
			life.fade_out(500 if scene=="death" else 800)
			media.set_timeout(_terminal.bind(scene),600 if scene=="death" else 1000)
		_:arpg_mix.play(scene)
	return {"ready":true,"scene":scene}
func _terminal(scene: String) -> void:
	if not _closed and _scene==scene:
		life.play(scene)
		_restore_envelope()
func _restore_envelope() -> void:
	var current: RefCounted=life.snapshot_state().cur
	if current!=null:current.envelope=1.0
func refresh_options() -> void:
	if not is_instance_valid(_main.source_initialization_services):return
	var options: Variant=_main.source_initialization_services.read_current_options()
	if not options is Dictionary:return
	var signature: Array=[options.get("bgmTrack","auto"),options.get("bgmVol",30),options.get("sfxVol",60)]
	if signature==_options_signature:return
	_options_signature=signature
	_context.bgm_track=str(signature[0]);life.set_volume(float(signature[1])/100.0)
	if arpg_mix!=null:
		for tail in arpg_mix._tails:tail.volume=float(signature[1])/100.0
	for bus in ["Voice","UI","Ambience"]:
		var index:=AudioServer.get_bus_index(bus)
		if index>=0:
			var trim: float=ARPG_MIX.PROFILE.AMBIENCE_DB if bus=="Ambience" else 0.0
			AudioServer.set_bus_volume_linear(index,db_to_linear(trim)*float(signature[2])/100.0)
func request_voice(owner: Node,path: String,rate: float,gain: float) -> Dictionary:
	if _closed or not is_instance_valid(owner) or path!="res://assets/sfx/voice/voice_wakeup.mp3":return {"accepted":false,"reason":"voice_owner_or_asset_unsupported"}
	var key: String="%s:%s" % [owner.get_instance_id(),path]
	if _voice_keys.has(key):
		var previous: int=_voice_keys[key]
		return {"accepted":true,"duplicate":true,"playing":_voices[previous].audio.playing() if _voices.has(previous) else false}
	var bus: String="Voice"
	if AudioServer.get_bus_index(bus)<0:return {"accepted":false,"reason":"SND08_bus_missing"}
	_voice_serial+=1
	var id: int=_voice_serial
	var audio: RefCounted=media.create_audio(path);audio.output=bus;audio.rate=rate;audio.volume=gain
	_voices[id]={"audio":audio,"owner":weakref(owner)};_voice_keys[key]=id
	audio.on_ended=_finish_voice.bind(id);audio.on_error=_finish_voice.bind(id)
	owner.tree_exiting.connect(_voice_owner_exit.bind(id),CONNECT_ONE_SHOT)
	audio.play(Callable(),_finish_voice.bind(id))
	return {"accepted":true,"id":id,"playing":audio.playing()}
func _voice_owner_exit(id: int) -> void: _finish_voice(id)
func _finish_voice(id: int) -> void:
	if not _voices.has(id):return
	var entry: Dictionary=_voices[id];_voices.erase(id)
	var owner: Node=entry.owner.get_ref()
	var cb: Callable=_voice_owner_exit.bind(id)
	if is_instance_valid(owner) and owner.tree_exiting.is_connected(cb):owner.tree_exiting.disconnect(cb)
	media.release_audio(entry.audio)
func stop_voices() -> void:
	for id in _voices.keys():_finish_voice(id)
func _input(event: InputEvent) -> void:
	if not media.suspended and (event is InputEventKey or event is InputEventMouseButton):media.interact()
func _process(_delta: float) -> void:
	if _closed:return
	refresh_options();_visibility()
func snapshot() -> Dictionary:
	var s: Dictionary=life.snapshot_state() if life!=null else {}
	return {"scene":_scene,"key":s.get("cur_key",""),"cache":s.get("cache",{}).size(),"media":media.snapshot() if media!=null else {},"voices":_voices.size(),"boss_bound":_boss!=null,"boss_signal":BOSS_SIGNAL,"BGM_bus":_bus,"closed":_closed,"audible_verified":false,"arpg_mix":arpg_mix.snapshot() if arpg_mix!=null else {}}
func close() -> void:
	if _closed:return
	_closed=true
	if arpg_mix!=null:arpg_mix.close()
	if is_instance_valid(_main):
		if _main.native_sound_event.is_connected(_combat_audio_event):_main.native_sound_event.disconnect(_combat_audio_event)
		if _main.source_document_visibility_changed.is_connected(_visibility):_main.source_document_visibility_changed.disconnect(_visibility)
		if is_instance_valid(_main.player) and _main.player.telemetry_event.is_connected(_player_event):_main.player.telemetry_event.disconnect(_player_event)
	if _intro!=null and is_instance_valid(_intro.get_ref()):
		var owner: Node=_intro.get_ref()
		if owner.native_audio_phase_changed.is_connected(_intro_phase):owner.native_audio_phase_changed.disconnect(_intro_phase)
	if _boss!=null and is_instance_valid(_boss.get_ref()):
		var actor: Node=_boss.get_ref()
		if actor.is_connected(BOSS_SIGNAL,_boss_event):actor.disconnect(BOSS_SIGNAL,_boss_event)
		if actor.tree_exiting.is_connected(_boss_exit):actor.tree_exiting.disconnect(_boss_exit)
	if life!=null:life.stop()
	stop_voices()
	if media!=null:media.dispose()
	life=null
	var index: int=AudioServer.get_bus_index(_bus)
	if index>0:AudioServer.remove_bus(index)
func _exit_tree() -> void:close()
