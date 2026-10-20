extends RefCounted
## SND-02: 원본 샘플/보이스 치환/선언 라우팅의 읽기 전용 카탈로그.
## 최신 원본 284d7faf4 game.html:10076–10331, 10359–10378, 12327–12336.
## 파일 문자열만 보존한다. 음원 로딩/재생/변환, 보이스 선택, 게임 owner 연결 없음.

const DATA_PATH := "res://data/sound_source_samples.json"
const NAMESPACES := ["samples", "voice_map", "routes"]

var _tables: Dictionary = {}
var _load_status: Dictionary = {"status": "NOT_READY", "reason": "not_loaded"}


func _init(data_path: String = DATA_PATH) -> void:
	var file := FileAccess.open(data_path, FileAccess.READ)
	if file == null:
		_load_status = {"status": "NOT_READY", "reason": "catalog_file_unavailable", "path": data_path}
		return
	var parser := JSON.new()
	if parser.parse(file.get_as_text()) != OK:
		_load_status = {"status": "NOT_READY", "reason": "catalog_json_invalid", "path": data_path}
		return
	var raw: Variant = parser.data
	if not _valid_tables(raw):
		_load_status = {"status": "NOT_READY", "reason": "catalog_shape_invalid", "path": data_path}
		return
	# 검증을 마친 세 영역을 함께 소유한다. 부분 데이터나 임의 기본 카탈로그를 게시하지 않는다.
	_tables = raw
	_load_status = {"status": "READY", "sample_count": _tables.samples.size(),
		"voice_mapping_count": _tables.voice_map.size(), "route_count": _tables.routes.size()}


static func _valid_tables(raw: Variant) -> bool:
	if not raw is Dictionary or raw.size() != NAMESPACES.size():
		return false
	for section in NAMESPACES:
		if not raw.has(section) or not raw[section] is Dictionary:
			return false
	for section in ["samples", "voice_map"]:
		for key in raw[section]:
			if not key is String or not raw[section][key] is String:
				return false
	for key in raw.routes:
		if not key is String or not raw.routes[key] is Dictionary:
			return false
		var route: Dictionary = raw.routes[key]
		if route.size() != 2:
			return false
		if route.get("type") == "procedural":
			if not route.has("fn") or not route.fn is String:
				return false
		elif route.get("type") == "file":
			if not route.has("src") or not route.src is String:
				return false
		else:
			return false
	return true


func status() -> Dictionary:
	return _load_status.duplicate(true)


func snapshot() -> Dictionary:
	if _load_status.status != "READY":
		return status()
	var result := _tables.duplicate(true)
	result["status"] = "READY"
	return result


func lookup_sample(key: String) -> Dictionary:
	return _lookup("samples", key)


func lookup_voice_mapping(key: String) -> Dictionary:
	# 논리 키를 반환할 뿐 variant RNG/10000ms 제한/캐릭터 판정은 여기서 실행하지 않는다.
	return _lookup("voice_map", key)


func lookup_route(key: String) -> Dictionary:
	# SFX_MAP의 선언 데이터다. 실제 dispatcher 존재나 파일 가용성의 증거가 아니다.
	return _lookup("routes", key)


func _lookup(section: String, key: String) -> Dictionary:
	if _load_status.status != "READY":
		return status()
	if not _tables[section].has(key):
		return {"status": "MISSING", "namespace": section, "key": key}
	var value: Variant = _tables[section][key]
	if value is Dictionary:
		value = value.duplicate(true)
	return {"status": "READY", "namespace": section, "key": key, "value": value}
