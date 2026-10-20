extends RefCounted
## NW-02: disconnected commands only. Snapshot names are native fixture carriers.
## map_present/zone_available are explicit caller booleans, not live map/zone readers.
const SOURCE_SHA256 := "4d911cdd92fb55dc7c687ca7ed7146e6339687300f41e7585fe8e83dc685e5d4"
const PORTAL_SHA256 := "4eae4f08342dd95a93c73982f266bec0cf7eb4a54237d4574190aa9d9a1ddfef"
const PLACE := "game.html:18309–18315"
const USE := "game.html:18316–18322"
const STAGE := "game.html:31534–31535"
const ZONE := "game.html:30160–30161"


func propose_place(snapshot: Variant) -> Dictionary:
	if not snapshot is Dictionary:
		return _nr(PLACE, "snapshot_not_dictionary")
	if typeof(snapshot.get("on")) != TYPE_BOOL:
		return _nr(PLACE, "on_not_bool")
	if not snapshot.on:
		return _result(PLACE, "undefined")
	if typeof(snapshot.get("map_present")) != TYPE_BOOL:
		return _nr(PLACE, "map_present_not_bool")
	if not snapshot.map_present or snapshot.get("player") == null:
		return _result(PLACE, "undefined")
	var player: Variant = snapshot.player
	if not player is Dictionary:
		return _nr(PLACE, "player_not_dictionary")
	var state: Variant = player.get("s")
	if state != null and typeof(state) != TYPE_STRING:
		return _nr(PLACE, "player_state_unsupported")
	if state == "dead" or state == "fallen":
		return _result(PLACE, "undefined")
	if not _xy(player):
		return _nr(PLACE, "player_xy_not_finite")
	var pair: Variant = snapshot.get("pair")
	if pair != null and not pair is Array:
		return _nr(PLACE, "pair_not_array_or_null")
	var point := {"x": float(player.x), "y": float(player.y)}
	if pair == null or pair.size() >= 2:
		return _result(PLACE, "undefined", [_set_command("G._playerPortalPair", [point]),
			_hint("포탈 A 설치 — 다른 곳에서 P를 눌러 포탈 B 설치", "Portal A placed — press P elsewhere to place Portal B", "#64eaff", 1800)])
	if pair.is_empty():
		return _nr(PLACE, "empty_pair_unsupported")
	if not _xy(pair[0]):
		return _nr(PLACE, "pair_xy_not_finite")
	if _distance(player, pair[0]) < 200.0:
		return _result(PLACE, "undefined", [_hint("포탈 간격이 너무 가깝습니다", "Portals are too close", "#ffcc66")])
	return _result(PLACE, "undefined", [{"op": "append", "path": "G._playerPortalPair", "value": point},
		_hint("포탈 B 설치 완료 — 가까이서 R을 눌러 이동", "Portal B ready — approach and press R to travel", "#64eaff", 2000)])


func propose_use(snapshot: Variant) -> Dictionary:
	if not snapshot is Dictionary:
		return _nr(USE, "snapshot_not_dictionary")
	var pair: Variant = snapshot.get("pair")
	if pair == null:
		return _result(USE, false)
	if not pair is Array:
		return _nr(USE, "pair_not_array_or_null")
	if pair.size() != 2:
		return _result(USE, false)
	var player: Variant = snapshot.get("player")
	if not _xy(player):
		return _nr(USE, "player_xy_not_finite")
	var near := -1
	for index in 2:
		if not _xy(pair[index]):
			return _nr(USE, "pair_xy_not_finite")
		if _distance(player, pair[index]) < 88.0:
			near = index
			break
	if near < 0:
		return _result(USE, false)
	var target: Variant = pair[1 - near]
	if not _xy(target):
		return _nr(USE, "target_xy_not_finite")
	var cam: Variant = snapshot.get("cam")
	if cam != null and not (typeof(cam) == TYPE_BOOL and cam == false) and not cam is Dictionary:
		return _nr(USE, "cam_unsupported")
	var x := float(target.x)
	var y := float(target.y)
	var commands := [_set_command("P.x", x), _set_command("P.y", y), _set_command("P.vx", 0), _set_command("P.vy", 0)]
	if cam is Dictionary:
		commands.append_array([_set_command("G.cam.x", x), _set_command("G.cam.y", y)])
	commands.append_array([{"op": "addParts", "args": [x, y, "#62e9ff", 14]},
		{"op": "addTxt", "args": [x, y - 28.0, {"key": "포탈 이동"}, "#8ff4ff", 35]},
		_hint("포탈 이동", "Portal travel", "#8ff4ff")])
	return _result(USE, true, commands)


func propose_reset(context: Variant, zone_available: Variant = null) -> Dictionary:
	if typeof(context) != TYPE_STRING or (context != "init_stage" and context != "load_zone"):
		return _nr(null, "reset_context_unsupported")
	if context == "init_stage":
		return _result(STAGE, "undefined", [{"op": "_resetInteractInput", "args": []}, _set_command("G._playerPortalPair", null)])
	if typeof(zone_available) != TYPE_BOOL:
		return _nr(ZONE, "zone_available_not_bool")
	return _result(ZONE, "undefined", [_set_command("G._playerPortalPair", null)] if zone_available else [])


func provenance() -> Dictionary:
	return {"file": "game.html", "source_sha256": SOURCE_SHA256, "portal_sha256": PORTAL_SHA256,
		"portal_lines": [18309, 18322], "reset_lines": [[30160, 30161], [31534, 31535]], "connected": false}


func _distance(a: Dictionary, b: Dictionary) -> float:
	var dx := float(b.x) - float(a.x)
	var dy := float(b.y) - float(a.y)
	return sqrt(dx * dx + dy * dy)


func _xy(value: Variant) -> bool:
	if not value is Dictionary:
		return false
	for key in ["x", "y"]:
		var number: Variant = value.get(key)
		if (typeof(number) != TYPE_INT and typeof(number) != TYPE_FLOAT) or not is_finite(float(number)):
			return false
	return true


func _set_command(path: String, value: Variant) -> Dictionary:
	return {"op": "set", "path": path, "value": value}


func _hint(ko: String, en: String, color: String, duration: Variant = null) -> Dictionary:
	var args := [{"ko": ko, "en": en}, color]
	if duration != null:
		args.append(duration)
	return {"op": "showPH", "args": args}


func _result(source: Variant, source_return: Variant, commands: Array = []) -> Dictionary:
	return {"ready": true, "reason": null, "source": source, "source_return": source_return, "commands": commands}


func _nr(source: Variant, reason: String) -> Dictionary:
	return {"ready": false, "reason": reason, "source": source, "source_return": null, "commands": []}
