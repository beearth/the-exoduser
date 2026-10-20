extends RefCounted
## SND-05: game.html @e556b617:3982–4037 / 4208–4211 / 10381–10390 / 16633–16666.
## 문자 경로·stage map만. 음원 로딩/복사/변환/재생과 캐릭터·맵 owner 연결 없음.
const DATA_PATH := "res://data/sound_source_bgm.json"
const ACT_KEYS := ["hell1", "hell2", "hell3", "hell4", "hell5", "hell6", "hell7"]
const ALL_RANDOM_KEYS := ["hell1", "hell2", "hell3", "hell4", "hell5", "hell6", "hell7", "gameplay"]
var _data: Dictionary = {}
var _status: Dictionary = {"status": "NOT_READY", "reason": "not_loaded"}


func _init(data_path: String = DATA_PATH) -> void:
	var file := FileAccess.open(data_path, FileAccess.READ)
	if file == null:
		_status = {"status": "NOT_READY", "reason": "catalog_file_unavailable", "path": data_path}
		return
	var parser := JSON.new()
	if parser.parse(file.get_as_text()) != OK:
		_status = {"status": "NOT_READY", "reason": "catalog_json_invalid", "path": data_path}
		return
	if not _valid_tables(parser.data):
		_status = {"status": "NOT_READY", "reason": "catalog_shape_invalid", "path": data_path}
		return
	_data = parser.data
	_status = {"status": "READY", "pool_count": _data.tracks.size(),
		"gameplay_count": _data.tracks.gameplay.size(), "all_random_count": _all_entries().size(),
		"stage_count": _data.si_to_hell.size(), "legacy_count": _data.legacy_bgm_map.size()}


static func _valid_tables(raw: Variant) -> bool:
	if not raw is Dictionary or raw.size() != 3:
		return false
	if not raw.get("tracks") is Dictionary or not raw.tracks.get("gameplay") is Array:
		return false
	for key in raw.tracks:
		if not key is String or not raw.tracks[key] is Array:
			return false
		for src in raw.tracks[key]:
			if not src is String:
				return false
	if not raw.get("legacy_bgm_map") is Dictionary or not raw.get("si_to_hell") is Array:
		return false
	for value in raw.legacy_bgm_map.values():
		if value is String:
			continue
		if not value is Dictionary or value.size() != 2 or not value.get("explore") is String or not value.get("boss") is String:
			return false
	if raw.si_to_hell.size() != 35:
		return false
	for hell in raw.si_to_hell:
		if not (hell is int or hell is float) or hell != floor(hell) or hell < 0 or hell > 6:
			return false
	return true


func status() -> Dictionary:
	return _status.duplicate(true)


func snapshot() -> Dictionary:
	if _status.status != "READY":
		return status()
	var result: Dictionary = _data.duplicate(true)
	result["status"] = "READY"
	return result


func tracks_for(key: String) -> Dictionary:
	if _status.status != "READY":
		return status()
	return {"status": "READY", "entries": _data.tracks.get(key, []).duplicate(true)}


func all_random_entries() -> Dictionary:
	if _status.status != "READY":
		return status()
	return {"status": "READY", "entries": _all_entries()}


func legacy_snapshot() -> Dictionary:
	if _status.status != "READY":
		return status()
	return {"status": "READY", "entries": _data.legacy_bgm_map.duplicate(true)}


func stage_key(si: int) -> Dictionary:
	if _status.status != "READY":
		return status()
	# 원본의 invalid si→hellNaN 문자열은 지원 밖. 유효 0..34 map만 readonly로 제공한다.
	if si < 0 or si >= _data.si_to_hell.size():
		return {"status": "UNSUPPORTED", "reason": "invalid_stage_index", "si": si}
	return {"status": "READY", "key": "hell" + str(int(_data.si_to_hell[si]) + 1)}


func _all_entries() -> Array:
	var result: Array = []
	for key in ALL_RANDOM_KEYS:
		result.append_array(_data.tracks.get(key, []))
	return result
