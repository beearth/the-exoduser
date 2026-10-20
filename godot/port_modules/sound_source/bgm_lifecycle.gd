extends RefCounted
## SND-06: game.html @e556b617:4042–4053 / 4091–4207. 독립 모델, Node/실곡 없음.
## backend: create_audio(src), set_interval(callback,ms), clear_interval(handle),
## set_timeout(callback,ms), add_listener(event,callback,passive), remove_listener(event,callback),
## set_legacy_volume(value). 타이머는 등록 중 callback을 호출하지 않고 고유 handle을 반환한다.
## Audio: preload_mode, volume, current_time, loop, on_ended/on_error(Callable 또는 빈 Callable),
## play(success,reject), pause(), remove_src(), load(). play 결과는 비동기로 callback 1회.
## read_context(): {bgm_track, cutscene_state?, force_cutscene?, game?:{stage,cutscene_done,on}|null}.
## 게임/옵션 owner를 만들지 않고 매 동작 현재 값을 읽는다. key/option은 원본 string 경로만 지원.
const SELECT = preload("res://port_modules/sound_source/bgm_selection.gd")
const EVENTS := ["click", "keydown", "pointerdown", "touchstart", "mousemove"]
const CACHE_MAX := 6
var _selection: RefCounted
var _backend: RefCounted
var _read_context: Callable
var _random: Callable
var _cur: RefCounted
var _cur_key := ""
var _vol := 0.3
var _fade: Variant = null
var _cache: Dictionary = {}
var _cache_lru: Array = []
var _pending: Variant = null
var _bound := false
var _pending_extra: Array = []
var _status: Dictionary = {"status": "NOT_READY", "reason": "dependencies_unavailable"}


func _init(selection: RefCounted, backend: RefCounted, read_context: Callable, random_unit: Callable) -> void:
	if selection == null or backend == null or not read_context.is_valid() or not random_unit.is_valid():
		return
	for method in ["create_audio", "set_interval", "clear_interval", "set_timeout", "add_listener", "remove_listener", "set_legacy_volume"]:
		if not backend.has_method(method):
			_status["missing_backend_method"] = method
			return
	if selection.status().get("status") != "READY":
		_status["selection_status"] = selection.status()
		return
	_selection = selection
	_backend = backend
	_read_context = read_context
	_random = random_unit
	_status = {"status": "READY"}


func status() -> Dictionary:
	return _status.duplicate(true)


func snapshot_state() -> Dictionary:
	# 컨테이너만 복사하며 Audio/타이머는 backend 소유 identity handle이다.
	return {"cur": _cur, "cur_key": _cur_key, "vol": _vol, "fade": _fade,
		"cache": _cache.duplicate(), "cache_lru": _cache_lru.duplicate(),
		"pending": _pending, "bound": _bound, "pending_extra": _pending_extra.duplicate(),
		"selection": {} if _selection == null else _selection.snapshot_state()}


func get_audio(src: String) -> RefCounted:
	if _status.status != "READY": return null
	if not _cache.has(src):
		var a: RefCounted = _backend.create_audio(src)
		a.preload_mode = "auto"
		a.on_error = _audio_error.bind(src, a)
		_cache[src] = a
	_cache_lru.erase(src)
	_cache_lru.append(src)
	while _cache_lru.size() > CACHE_MAX:
		var index := -1
		for i in _cache_lru.size():
			if _cache.get(_cache_lru[i]) != _cur:
				index = i
				break
		if index < 0: break
		var old: String = _cache_lru.pop_at(index)
		var audio: RefCounted = _cache.get(old)
		if audio != null:
			audio.pause()
			audio.remove_src()
			audio.load()
		_cache.erase(old)
	return _cache.get(src)


func _audio_error(src: String, audio: RefCounted) -> void:
	_selection.mark_bad(src)
	_cache.erase(src)
	_cache_lru.erase(src)
	if _cur == audio:
		_cur = null
		_backend.set_timeout(on_ended, 300)


func enqueue_pending_extra(audio: RefCounted) -> void:
	# 원본 _pendingExtra.push 접점. listener 설치/주 음악 pending 변경은 하지 않는다.
	if _status.status == "READY": _pending_extra.append(audio)


func on_interact() -> void:
	if _status.status != "READY": return
	if _pending != null and _pending != "" and _cur != null:
		_cur.play(_interact_success, Callable())
	while not _pending_extra.is_empty():
		var audio: RefCounted = _pending_extra.pop_front()
		audio.play(Callable(), Callable())


func _interact_success() -> void:
	_pending = null
	for event in EVENTS:
		_backend.remove_listener(event, on_interact)
	_bound = false


func on_ended() -> void:
	if _status.status != "READY": return
	var key := _cur_key
	if key.is_empty(): return
	var context: Dictionary = _read_context.call()
	var option: String = context.bgm_track
	var src: Variant = null
	if SELECT.is_act_key(key) and option == "auto":
		if _selection.snapshot_state().act_done.get(key, false):
			src = _selection.pick_all_random(_random).src
		else:
			src = _selection.pick_act_first(key, _random).src
		if src == null: src = _selection.pick_all_random(_random).src
	elif option == "allRandom":
		src = _selection.pick_all_random(_random).src
	else:
		src = _selection.pick_random(key, _random).src
	if src == null: return
	var fade: Variant = _fade
	_fade = null
	if fade != null: _backend.clear_interval(fade)
	_selection.set_last_src(src)
	var audio := get_audio(src)
	audio.volume = _vol
	audio.current_time = 0
	audio.on_ended = on_ended
	# 원본 ended에는 loop=false 재대입도 pending 재설정도 없다.
	audio.play(Callable(), Callable())
	_cur = audio


func play_track(src: String) -> void:
	if _status.status != "READY": return
	stop()
	_cur_key = "_track"
	_selection.set_last_src(src)
	var audio := get_audio(src)
	audio.volume = _vol
	audio.current_time = 0
	audio.loop = true
	audio.on_ended = Callable()
	audio.play(Callable(), _play_rejected.bind("_track"))
	_cur = audio


func play(key: String, force := false) -> void:
	if _status.status != "READY": return
	var context: Dictionary = _read_context.call()
	if not key.begins_with("cutscene_") and _intro_blocked(context): return
	var option: String = context.bgm_track
	if not force and option.begins_with("t:"): return
	if not force and option != "auto" and option != "allRandom" and key not in ["death", "victory", "forge"] and key != option: return
	stop()
	_cur_key = key
	var src: Variant = null
	if SELECT.is_act_key(key) and option == "auto":
		_selection.reset_act(key)
		src = _selection.pick_act_first(key, _random).src
		if src == null: src = _selection.pick_mixed(key, _random).src
	elif option == "allRandom" and key not in ["death", "victory", "forge"] and not key.begins_with("cutscene_"):
		src = _selection.pick_all_random(_random).src
	else:
		src = _selection.pick_random(key, _random).src
	if src == null: return
	_selection.set_last_src(src)
	var audio := get_audio(src)
	audio.volume = _vol
	audio.current_time = 0
	audio.loop = false
	audio.on_ended = Callable() if key in ["death", "victory"] else on_ended
	audio.play(Callable(), _play_rejected.bind(key))
	_cur = audio


func _intro_blocked(context: Dictionary) -> bool:
	if context.get("cutscene_state") == "INTRO_CUTSCENE": return true
	if context.get("force_cutscene", false):
		# G가 선언되지 않은 경우 원본 try의 ReferenceError로 나머지 probe도 생략.
		if not context.has("game"): return false
		if context.game == null or not context.game.get("cutscene_done", false): return true
	var game: Variant = context.get("game")
	return game is Dictionary and game.get("stage") == 0 and not game.get("cutscene_done", false) and not game.get("on", false)


func _play_rejected(key: String) -> void:
	# 원본의 늦은 Promise reject에는 현재 Audio/세대 검사 없음. 그대로 보존.
	_pending = key
	if not _bound:
		_bound = true
		for event in EVENTS:
			_backend.add_listener(event, on_interact, true)


func stop() -> void:
	if _status.status != "READY": return
	var fade: Variant = _fade
	_fade = null
	if fade != null: _backend.clear_interval(fade)
	if _cur != null:
		_cur.on_ended = Callable()
		_cur.pause()
		_cur.current_time = 0
		_cur = null
		_cur_key = ""


func fade_out(duration_ms: float) -> void:
	if _status.status != "READY" or _cur == null: return
	var audio := _cur
	var step: float = audio.volume / (duration_ms / 50.0)
	if _fade != null: _backend.clear_interval(_fade)
	_fade = null
	var token := {"handle": null}
	token.handle = _backend.set_interval(_fade_tick.bind(audio, step, token), 50)
	_fade = token.handle


func _fade_tick(audio: RefCounted, step: float, token: Dictionary) -> void:
	var fade: Variant = token.handle
	if _fade != fade: return
	if _cur != audio:
		_backend.clear_interval(fade)
		_fade = null
		return
	audio.volume = maxf(0, audio.volume - step)
	if audio.volume <= 0:
		_backend.clear_interval(fade)
		_fade = null
		audio.on_ended = Callable()
		audio.pause()
		audio.current_time = 0
		if _cur == audio:
			_cur = null
			_cur_key = ""


func set_volume(value: float) -> void:
	if _status.status != "READY": return
	_vol = value
	if _cur != null: _cur.volume = value
	_backend.set_legacy_volume(value)
