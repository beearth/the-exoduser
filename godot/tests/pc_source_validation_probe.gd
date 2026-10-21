extends RefCounted
## Measurement-only counter sink for bench_pc_source_validation.gd.
## Production scripts never reference this file; a temporary local
## instrumentation patch (not committed) calls PROBE.add(name, usec).
static var enabled := false
static var rows: Dictionary = {}

static func reset() -> void:
	rows = {}

static func add(name: String, usec: int) -> void:
	if not enabled: return
	var row: Variant = rows.get(name)
	if row == null:
		rows[name] = [1, usec]
	else:
		row[0] += 1
		row[1] += usec

static func snapshot(frames: int) -> Dictionary:
	var out := {}
	for name in rows:
		var row: Array = rows[name]
		out[name] = {"calls": row[0], "calls_per_frame": float(row[0]) / maxi(1, frames),
			"inclusive_ms_per_frame": float(row[1]) / 1000.0 / maxi(1, frames)}
	return out
