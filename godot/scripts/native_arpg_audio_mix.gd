extends Node
## AUDIO-01 event-driven mixer. No tick callback, combat writes or resource loading.
const PROFILE=preload("res://scripts/native_audio_mix_profile.gd")
var music: Node
var cycle: Timer
var combat: Timer
var phase := "off"
var ducked := false
var base_db := PROFILE.FIELD_DB
var duck_db := 0.0:
	set(value):
		duck_db=value
		_apply()
var level_db := PROFILE.FIELD_DB:
	set(value):
		level_db=value
		_apply()
var time_scale := 1.0 # Harness acceleration only; production default remains 1.
var _level_tween: Tween
var _duck_tween: Tween
var _paused := false
var _ambience: RefCounted
var _ambience_attempted := false
var _tails: Array=[]
var _fades: Array=[]
func configure(owner: Node) -> void:
	music=owner
	process_mode=Node.PROCESS_MODE_ALWAYS
	cycle=Timer.new();cycle.one_shot=true;add_child(cycle);cycle.timeout.connect(_cycle_elapsed)
	combat=Timer.new();combat.one_shot=true;add_child(combat);combat.timeout.connect(_combat_elapsed)
	_apply()
func _apply() -> void:
	var index:=AudioServer.get_bus_index("Music")
	if index>=0:AudioServer.set_bus_volume_db(index,level_db+duck_db)
func _duration(seconds: float) -> float:return maxf(0.01,seconds*time_scale)
func _fade(audio: RefCounted, target: float, seconds: float, release := false) -> void:
	var tween:=create_tween()
	_fades.append(tween)
	tween.tween_property(audio,"envelope",target,_duration(seconds))
	tween.finished.connect(_fade_finished.bind(weakref(tween),audio,release),CONNECT_ONE_SHOT)
	if _paused:tween.pause()
func _fade_finished(reference: WeakRef, audio: RefCounted, release: bool) -> void:
	_fades.erase(reference.get_ref())
	if release:
		_tails.erase(audio)
		music.media.release_audio(audio)
func play(key: String, force := false) -> void:
	# A separate tail preserves the outgoing source while SND06 owns its bounded cache.
	var old: RefCounted=music.life.snapshot_state().cur
	var tail: RefCounted
	if old!=null and old.playing():
		tail=music.media.create_audio(old.src)
		tail.volume=old.volume;tail.envelope=old.envelope
		tail.current_time=old.current_time
	for audio in music.life.snapshot_state().cache.values():audio.envelope=1.0
	music.life.play(key,force)
	var current: RefCounted=music.life.snapshot_state().cur
	if current!=null:
		current.envelope=0.0
		_fade(current,1.0,PROFILE.CROSSFADE)
	if tail!=null:
		_tails.append(tail);tail.play(Callable(),Callable())
		_fade(tail,0.0,PROFILE.CROSSFADE,true)
func scene_changed(scene: String) -> void:
	cycle.stop();phase="off"
	_cancel_fades()
	if _level_tween!=null:_level_tween.kill()
	base_db=PROFILE.FIELD_DB+PROFILE.BOSS_LIFT_DB if scene=="boss" else (PROFILE.FIELD_DB if scene=="field" else 0.0)
	# Level trim is separate from per-source crossfade and saved volume.
	_level_tween=create_tween()
	_level_tween.tween_property(self,"level_db",base_db,_duration(PROFILE.CROSSFADE))
	if _paused:_level_tween.pause()
	if scene not in ["field","boss"]:
		combat.stop();_set_duck(false)
		if _ambience!=null:_ambience.pause()
	else:
		_start_ambience()
		if scene=="field":_arm_play()
func _start_ambience() -> void:
	if not _ambience_attempted:
		_ambience_attempted=true
		if not PROFILE.FOREST_ASSET.is_empty():
			_ambience=music.media.create_audio(PROFILE.FOREST_ASSET)
			_ambience.output="Ambience";_ambience.loop=true;_ambience.volume=1.0
	if _ambience!=null and not _ambience.playing():_ambience.play(Callable(),Callable())
func _arm_play() -> void:
	phase="playing"
	cycle.start(_duration(music._rng.randf_range(PROFILE.FIELD_PLAY_MIN,PROFILE.FIELD_PLAY_MAX)))
func _cycle_elapsed() -> void:
	if music._scene!="field":return
	match phase:
		"playing":
			phase="fade_out"
			var current: RefCounted=music.life.snapshot_state().cur
			if current!=null:
				current.on_ended=Callable()
				_fade(current,0.0,PROFILE.FIELD_FADE)
			cycle.start(_duration(PROFILE.FIELD_FADE))
		"fade_out":
			music.life.stop();phase="rest"
			cycle.start(_duration(music._rng.randf_range(PROFILE.FIELD_REST_MIN,PROFILE.FIELD_REST_MAX)))
		"rest":
			play(music._field);_arm_play()
func combat_event(kind: String) -> void:
	if music._scene not in ["field","boss"] or _paused:return
	if kind not in ["native_attack_audio_queued","native_skill_sample_requested","player_damage","melee_hit","e_wave_hit"]:return
	combat.start(_duration(PROFILE.COMBAT_HOLD))
	_set_duck(true)
func _combat_elapsed() -> void:_set_duck(false)
func _set_duck(value: bool) -> void:
	if ducked==value:return
	ducked=value
	if _duck_tween!=null:_duck_tween.kill()
	_duck_tween=create_tween()
	_duck_tween.tween_property(self,"duck_db",PROFILE.DUCK_DB if value else 0.0,_duration(PROFILE.DUCK_ATTACK if value else PROFILE.DUCK_RELEASE))
	if _paused:_duck_tween.pause()
func suspend(value: bool) -> void:
	if value==_paused:return
	_paused=value;cycle.paused=value;combat.paused=value
	for tween in _fades:
		if tween.is_valid():
			if value:tween.pause()
			else:tween.play()
	for tween in [_level_tween,_duck_tween]:
		if tween!=null and tween.is_valid():
			if value:tween.pause()
			else:tween.play()
func snapshot() -> Dictionary:
	return {"phase":phase,"remaining":cycle.time_left,"ducked":ducked,"duck_db":duck_db,"music_db":level_db+duck_db,"ambience_asset":PROFILE.FOREST_ASSET,"ambience_ready":_ambience!=null,"tails":_tails.size(),"paused":_paused}
func _cancel_fades() -> void:
	for tween in _fades:tween.kill()
	_fades.clear()
	for tail in _tails:music.media.release_audio(tail)
	_tails.clear()
func close() -> void:
	cycle.stop();combat.stop()
	for tween in _fades:tween.kill()
	_fades.clear()
	if _level_tween!=null:_level_tween.kill()
	if _duck_tween!=null:_duck_tween.kill()
	for tail in _tails:music.media.release_audio(tail)
	_tails.clear()
	if _ambience!=null:music.media.release_audio(_ambience);_ambience=null
	level_db=0.0;duck_db=0.0
