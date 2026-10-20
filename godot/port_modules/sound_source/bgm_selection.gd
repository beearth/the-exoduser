extends RefCounted
## SND-05: game.html @e556b617:4054–4090, 4094–4095, 4154–4157(reset만).
## RNG[0,1) 주입. bad/last/played-set 상태와 순수 선곡만. 재생·fade·옵션 gate 없음.
const CATALOG = preload("res://port_modules/sound_source/bgm_catalog.gd")
var _tracks: Dictionary = {}
var _bad_srcs: Dictionary = {}
var _last_src := ""
var _played_sets: Dictionary = {}
var _act_done: Dictionary = {}
var _status: Dictionary = {"status": "NOT_READY", "reason": "bgm_catalog_unavailable"}


func _init(catalog: RefCounted) -> void:
	if catalog == null:
		return
	var source: Dictionary = catalog.snapshot()
	if source.get("status") != "READY" or not source.get("tracks") is Dictionary:
		_status["catalog_status"] = source.duplicate(true)
		return
	_tracks = source.tracks.duplicate(true)
	_status = {"status": "READY"}


func status() -> Dictionary:
	return _status.duplicate(true)


func snapshot_state() -> Dictionary:
	return {"last_src": _last_src, "bad_srcs": _bad_srcs.duplicate(true),
		"played_sets": _played_sets.duplicate(true), "act_done": _act_done.duplicate(true)}


static func is_act_key(key: String) -> bool:
	return key in CATALOG.ACT_KEYS


func mark_bad(src: String) -> void:
	_bad_srcs[src] = 1


func set_last_src(src: String) -> void:
	_last_src = src


func reset_act(key: String) -> void:
	# 원본 play(auto 장 진입)의 두 assignment만. last/bad/다른 장은 보존.
	_played_sets[key] = []
	_act_done[key] = false


func pick_random(key: String, random_unit: Callable) -> Dictionary:
	if _status.status != "READY":
		return status()
	var entries: Array = _tracks.get(key, [])
	if entries.is_empty():
		return _result(null)
	var allowed := _allowed(entries)
	if allowed.is_empty():
		return _result(null)
	if allowed.size() == 1:
		return _result(allowed[0])
	return _result(_choose(allowed, random_unit))


func pick_all_random(random_unit: Callable) -> Dictionary:
	if _status.status != "READY":
		return status()
	var all: Array = []
	for key in CATALOG.ALL_RANDOM_KEYS:
		all.append_array(_allowed(_tracks.get(key, [])))
	return _result(null if all.is_empty() else _choose(all, random_unit))


func pick_act_first(key: String, random_unit: Callable) -> Dictionary:
	if _status.status != "READY":
		return status()
	var entries: Array = _tracks.get(key, [])
	if entries.is_empty():
		return _result(null)
	if not _played_sets.has(key):
		_played_sets[key] = []
	var played: Array = _played_sets[key]
	var allowed: Array = []
	for src in entries:
		if not played.has(src) and not _bad_srcs.get(src, 0):
			allowed.append(src)
	if allowed.is_empty():
		_act_done[key] = true
		return _result(null)
	var pick: String = _choose(allowed, random_unit)
	if not played.has(pick):
		played.append(pick)
	if played.size() >= _allowed(entries).size():
		_act_done[key] = true
	return _result(pick)


func pick_mixed(key: String, random_unit: Callable) -> Dictionary:
	if _status.status != "READY":
		return status()
	var all: Array = _tracks.get(key, []).duplicate()
	all.append_array(_tracks.get("gameplay", []))
	var allowed := _allowed(all)
	return _result(null if allowed.is_empty() else _choose(allowed, random_unit))


func _allowed(entries: Array) -> Array:
	var result: Array = []
	for src in entries:
		if not _bad_srcs.get(src, 0):
			result.append(src)
	return result


func _choose(entries: Array, random_unit: Callable) -> String:
	# 원본 do/while: 중복 entry·직전 곡 재추첨을 보존. 시도 상한·dedup·폴백 없음.
	var pick: String = entries[floori(float(random_unit.call()) * entries.size())]
	while entries.size() > 1 and pick == _last_src:
		pick = entries[floori(float(random_unit.call()) * entries.size())]
	return pick


func _result(src: Variant) -> Dictionary:
	# null은 정상적인 무곡 결과이며 NOT_READY와 구분한다.
	return {"status": "READY", "src": src}
