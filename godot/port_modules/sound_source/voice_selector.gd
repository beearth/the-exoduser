extends RefCounted
## SND-04: game.html @284d7faf4:12327–12341. SND-02 catalog의 map을 읽는다.
## 오디오·Node·실제 clock/RNG·캐릭터 owner 없음. 호출자가 clock(ms)/RNG[0,1)를 주입한다.
## direct/sample은 같은 selector를 호출해 stamp를 공유한다. 선택은 후속 음량/버퍼 gate보다 먼저다.
const REPEAT_BLOCK_MS := 10000.0
const VARIANT_COUNTS := {"silvertail_grunt": 3, "silvertail_parry": 3,
	"silvertail_demon_revive": 2, "silvertail_second_wind": 2,
	"silvertail_execution": 2, "silvertail_clear": 2, "silvertail_fuse": 2}
var _voice_map: Dictionary = {}
var _last_at: Dictionary = {}
var _catalog_status: Dictionary = {"status": "NOT_READY", "reason": "voice_catalog_unavailable"}


func _init(catalog: RefCounted) -> void:
	if catalog == null:
		return
	var source: Dictionary = catalog.snapshot()
	if source.get("status") != "READY":
		_catalog_status["catalog_status"] = source.duplicate(true)
		return
	_voice_map = source.voice_map.duplicate(true)
	_catalog_status = {"status": "READY", "mapping_count": _voice_map.size()}


func status() -> Dictionary:
	return _catalog_status.duplicate(true)


func snapshot_last_at() -> Dictionary:
	return _last_at.duplicate(true)


func select_key(key: String, character_index: int, now_ms: Callable, random_unit: Callable) -> Dictionary:
	# 원본은 char 판정→hasOwnProperty. 이미 silvertail_*인 key에 새 제한을 넣지 않는다.
	if character_index != 1:
		return {"status": "READY", "key": key}
	if _catalog_status.status != "READY":
		var failure := status()
		failure["key"] = ""
		return failure
	if not _voice_map.has(key):
		return {"status": "READY", "key": key}
	var mapped: String = _voice_map[key]
	if VARIANT_COUNTS.has(mapped):
		return _variant_key(mapped, VARIANT_COUNTS[mapped], now_ms, random_unit)
	return _take_voice(mapped, now_ms)


func _take_voice(key: String, now_ms: Callable) -> Dictionary:
	var now: float = now_ms.call()
	var last: float = _last_at.get(key, -INF)
	if now - last < REPEAT_BLOCK_MS:
		return {"status": "SILENT", "key": "", "reason": "repeat_block"}
	_last_at[key] = now
	return {"status": "READY", "key": key}


func _variant_key(base: String, count: int, now_ms: Callable, random_unit: Callable) -> Dictionary:
	var now: float = now_ms.call()
	var choices: Array[String] = []
	for i in range(1, count + 1):
		var key := base + str(i)
		var last: float = _last_at.get(key, -INF)
		if now - last >= REPEAT_BLOCK_MS:
			choices.append(key)
	if choices.is_empty():
		return {"status": "SILENT", "key": "", "reason": "variants_exhausted"}
	# 원본 Math.floor(random * choices.length). 재추첨·clamp·추가 RNG 호출 없음.
	var picked: String = choices[floori(float(random_unit.call()) * choices.size())]
	_last_at[picked] = now
	return {"status": "READY", "key": picked}
