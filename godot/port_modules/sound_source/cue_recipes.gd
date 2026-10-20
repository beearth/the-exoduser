extends RefCounted
## SND-08 source e556b617 game.html12756–12776/12827–12840.
## dispatch(kind,args)·timer 주입만. Main/State/입력 caller 연결0.
var _dispatch: Callable
var _schedule: Callable
var _generation := 0

func _init(dispatch: Callable, schedule: Callable) -> void:
	_dispatch = dispatch
	_schedule = schedule

func status() -> Dictionary:
	return {"status": "READY" if _dispatch.is_valid() and _schedule.is_valid() else "NOT_READY", "scope": "source_cue_dispatch_only"}

func _batch(entries: Array) -> Dictionary:
	for entry in entries:
		var reply: Variant = _dispatch.call(entry[0], entry[1])
		if reply is Dictionary and reply.get("status") == "THREW": return reply.duplicate(true)
	return {"status": "DISPATCHED"}

func _later(ms: float, entries: Array) -> void:
	_schedule.call(_deferred_batch.bind(_generation, entries.duplicate(true)), ms)

func _deferred_batch(generation: int, entries: Array) -> Dictionary:
	if generation != _generation: return {"status": "CANCELLED"}
	return _batch(entries)

func cancel_pending() -> void:
	# owner adapter 명시 종료만. 정상 cue 중첩은 취소하지 않는다.
	_generation += 1

func play(cue: String) -> Dictionary:
	if status().status != "READY": return {"status": "NOT_READY"}
	match cue:
		"click":
			return _batch([["tone", [1800, 0.03, "sine", 0.025, 2400]]])
		"pickup":
			return _batch([["fm", [1400, 700, 200, 0.07, 0.06, "sine", 2200]],
				["fm", [2000, 1000, 150, 0.06, 0.035, "sine", 2800]], ["tone", [3200, 0.04, "sine", 0.015]]])
		"potion":
			var first := _batch([["fm", [500, 100, 300, 0.06, 0.05, "sine", 700]],
				["noise", [0.03, 4000, 0.015, 6000, 0.002, "bandpass"]]])
			if first.status == "THREW": return first
			_later(55, [["fm", [650, 130, 350, 0.06, 0.045, "sine", 900]],
				["noise", [0.02, 5000, 0.012, 7000, 0.001, "bandpass"]]])
			_later(110, [["fm", [850, 170, 400, 0.07, 0.045, "sine", 1100]], ["tone", [1200, 0.04, "sine", 0.025]]])
			_later(170, [["fm", [1100, 220, 300, 0.1, 0.05, "sine", 1400]],
				["noise", [0.03, 10000, 0.015, 12000, 0.001, "highpass"]]])
			return {"status": "DISPATCHED"}
		"forge":
			return _batch([["fm", [1800, 400, 1200, 0.15, 0.08]], ["sub", [100, 0.05, 0.04]],
				["noise", [0.03, 8000, 0.05, 4000, 0.001, "highpass"]]])
		"crystalEquip":
			var first := _batch([["sample", ["equip_rare", 0.38, 1.12, true]],
				["noise", [0.025, 3400, 0.012, 1700, 0.003, "bandpass"]], ["tone", [880, 0.14, "sine", 0.014, 1320, 0.006]]])
			if first.status == "THREW": return first
			_later(65, [["tone", [1760, 0.19, "sine", 0.007, 1046, 0.008]]])
			return {"status": "DISPATCHED"}
		_: return {"status": "UNSUPPORTED", "cue": cue}
