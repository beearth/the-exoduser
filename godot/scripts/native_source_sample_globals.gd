extends RefCounted
## Owned port of the source file declaration, not a missing-provider default.
## Current source direct references: game.html:12361,12383; declaration:17472.
var _initialized := false
var _gx_vol_mul: Variant = null

func initialize_source_boot() -> bool:
	if _initialized:
		return false
	_gx_vol_mul = 1
	_initialized = true
	return true

func read_current_sample_context() -> Dictionary:
	if not _initialized:
		return {"ready":false,"reason":"source_sample_globals_not_initialized"}
	if not (_gx_vol_mul is int or _gx_vol_mul is float) or not is_finite(float(_gx_vol_mul)):
		return {"ready":false,"reason":"current_source_gx_volume_not_numeric"}
	return {"ready":true,"gx_vol_mul":_gx_vol_mul,
		"authority":"owned_source_file_sample_globals",
		"source_declaration":"game.html:17472","current":true}
