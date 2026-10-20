extends RefCounted
## game.html L6667 fresh OPT, with no settings/UI/OS side effects.
## Returned Dictionary is the actual holder/provider reference, not a copy.

const SOURCE_BOOT := "source_boot"
const CURRENT_PRE_RESTORE := "current_pre_restore"
const CURRENT_LIVE := "current_live"
const SOURCE_DEFAULTS := {
	"shake": 80, "textScale": 100, "panelFit": true, "diffV2": 1, "hitStop": 0, "parts": 80, "sfxVol": 60, "bgmVol": 60,
	"diff": 5, "minPickRar": 0, "minPickLvTier": 0, "fpsCap": 0,
	"petAuto": true, "bossDebug": false, "bloom": true, "trail": true,
	"slash": true, "postfx": true, "deathFx": true, "lighting": true,
	"torch": true, "ambPart": false, "fog": true, "bossFog": true, "grain": true,
	"autoPotThr": 0.99, "cursor": 0, "cursorSize": 50, "quality": "high",
	"resScale": 100, "ssaa": 1, "outline": true, "bgmTrack": "auto", "lang": "ko",
	"crAutoFuse": -1, "crAutoEnh": -1, "showFps": false, "atmos": 2
}

var _owned_options: Variant = null
var _current_reader := Callable()
var _phase := "NOT_READY"
var _last_status: Dictionary = {"status": "NOT_READY", "phase": "NOT_READY", "reason": "actual_OPT_missing"}

func initialize_source_boot(is_electron: Variant) -> bool:
	if typeof(is_electron) != TYPE_BOOL:
		_last_status = {"status": "NOT_READY", "phase": _phase, "reason": "source_IS_ELECTRON_missing_or_not_bool"}
		return false
	if _owned_options != null or _current_reader.is_valid():
		return false
	_owned_options = SOURCE_DEFAULTS.duplicate(true)
	_owned_options.parts = 100 if is_electron else 80
	_phase = SOURCE_BOOT
	read_current_options()
	return true

func bind_current_options_reader(reader: Callable, phase: String) -> bool:
	if not reader.is_valid() or not _is_phase(phase):
		return false
	_current_reader = reader
	_owned_options = null
	_phase = phase
	_last_status = {"status": "NOT_READY", "phase": phase, "reason": "current_reader_not_yet_read"}
	return true

func set_current_phase(phase: String) -> bool:
	# Caller reports lifecycle; this does not load/restore/save or publish to Main.
	if phase != CURRENT_PRE_RESTORE and phase != CURRENT_LIVE:
		return false
	if read_current_options() == null:
		return false
	_phase = phase
	_last_status.phase = phase
	return true

func read_current_options() -> Variant:
	var current: Variant
	var origin: String
	if _current_reader.is_valid():
		current = _current_reader.call()
		origin = "injected_current_reader"
	elif _owned_options != null:
		current = _owned_options
		origin = "owned_source_initializer"
	else:
		return _not_ready("actual_OPT_missing")
	if typeof(current) != TYPE_DICTIONARY:
		return _not_ready("actual_OPT_not_dictionary")
	var missing: Array = []
	for key in SOURCE_DEFAULTS:
		if not current.has(key):
			missing.append(key)
	if not missing.is_empty():
		_last_status = {"status": "NOT_READY", "phase": _phase,
			"reason": "source_OPT_fields_missing", "missing_fields": missing}
		return null
	_last_status = {"status": "READY", "phase": _phase, "origin": origin,
		"source_fields": SOURCE_DEFAULTS.size(), "current_fields": current.size(),
		"phase_authority": "caller_reported_not_Main_publication"}
	# Raw values and extra fields are preserved. No signed getter/clamp/default fill.
	return current

func current_reader_callable() -> Callable:
	return Callable(self, "read_current_options")

func get_last_status() -> Dictionary:
	return _last_status.duplicate(true)

func _is_phase(phase: String) -> bool:
	return phase == SOURCE_BOOT or phase == CURRENT_PRE_RESTORE or phase == CURRENT_LIVE

func _not_ready(reason: String) -> Variant:
	_last_status = {"status": "NOT_READY", "phase": _phase, "reason": reason}
	return null

# DEMO11-50: existing OPT identity is the sole writer; caller validates the allowed UI domain.
func commit_settings_fields(changes: Dictionary) -> Dictionary:
	if not validate_settings_fields(changes):return {"applied":false,"reason":"invalid_or_protected_setting"}
	var current: Variant=read_current_options()
	if not current is Dictionary: return {"applied":false,"reason":"current_OPT_unavailable"}
	for key in changes:
		if key not in ["sfxVol","bgmVol","lang","fpsCap","textScale","panelFit","shake"]:
			return {"applied":false,"reason":"protected_or_unknown_option"}
	for key in changes: current[key]=changes[key]
	return {"applied":true}

const CAPS=[30,60,120,144,244,0]
static func validate_settings_fields(changes: Dictionary) -> bool:
	if changes.is_empty(): return false
	for key in changes:
		var value: Variant=changes[key]
		match key:
			"sfxVol","bgmVol","shake":
				if not _number(value) or value<0 or value>100: return false
			"textScale":
				if not _number(value) or value<80 or value>160 or fmod(float(value),10)!=0: return false
			"panelFit":
				if not value is bool: return false
			"lang":
				if not value is String or value not in ["ko","en"]: return false
			"fpsCap":
				if not _number(value) or float(value)!=floor(float(value)) or int(value) not in CAPS: return false
			_: return false
	return true
static func _number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))
