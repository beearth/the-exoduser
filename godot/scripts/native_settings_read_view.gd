extends RefCounted
## SETTINGS-S01: game.html:6311 at 9528ea35, comparison reference only.
## The current options Dictionary stays owned by the supplied source owner.
## No settings restore, missing-field fill, input/reset, UI or persistence writes.

const SOURCE_DEFAULT_REFERENCE := {
	"shake": 80, "textScale": 100, "panelFit": true, "hitStop": 0,
	"parts": 80, "sfxVol": 60, "bgmVol": 60, "diff": 5, "diffV2": 1,
	"minPickRar": 0, "minPickLvTier": 0, "fpsCap": 0, "petAuto": true,
	"bossDebug": false, "bloom": true, "trail": true, "slash": true,
	"postfx": true, "deathFx": true, "lighting": true, "torch": true,
	"ambPart": false, "fog": true, "bossFog": true, "grain": true,
	"autoPotThr": 0.99, "cursor": 0, "cursorSize": 50, "quality": "high",
	"resScale": 100, "ssaa": 1, "outline": true, "bgmTrack": "auto",
	"lang": "ko", "crAutoFuse": -1, "crAutoEnh": -1, "showFps": false,
	"atmos": 2
}

var _source_owner: WeakRef
var _configured := false


func get_source_default_reference(is_electron: bool = false) -> Dictionary:
	var reference := SOURCE_DEFAULT_REFERENCE.duplicate(true)
	reference["parts"] = 100 if is_electron else 80
	return reference


func configure(source_owner: Object) -> bool:
	if _configured or not is_instance_valid(source_owner) \
			or not source_owner.has_method("read_current_options"):
		return false
	# Keep only a WeakRef; resolve the current method on every read.
	_source_owner = weakref(source_owner)
	_configured = true
	return true


func read_current_options_view() -> Dictionary:
	if not _configured:
		return _not_ready("source_owner_not_configured")
	var owner: Object = _source_owner.get_ref()
	if not is_instance_valid(owner):
		return _not_ready("source_owner_lost")
	if not owner.has_method("read_current_options"):
		return _not_ready("source_options_reader_missing")
	var current: Variant = owner.call("read_current_options")
	if not is_instance_valid(owner):
		return _not_ready("source_owner_lost_during_read")
	if current == null:
		return _not_ready("current_options_unavailable")
	if not current is Dictionary:
		return _not_ready("current_options_not_dictionary")
	var missing_keys: Array = []
	var extra_keys: Array = []
	for key in SOURCE_DEFAULT_REFERENCE:
		if not current.has(key):
			missing_keys.append(key)
	for key in current:
		if not SOURCE_DEFAULT_REFERENCE.has(key):
			extra_keys.append(key)
	var packet := {
		"expected_count": SOURCE_DEFAULT_REFERENCE.size(),
		"current_count": current.size(),
		"missing_keys": missing_keys,
		"extra_keys": extra_keys
	}
	if not missing_keys.is_empty():
		# Merged S01 requires missing fields to be NOT_READY. Preserve the
		# observed raw reference for diagnostics, never as usable options.
		packet["status"] = "NOT_READY"
		packet["reason"] = "source_settings_fields_missing"
		packet["observed_options"] = current
	else:
		packet["status"] = "READY"
		packet["options"] = current
	return packet


func _not_ready(reason: String) -> Dictionary:
	return {"status": "NOT_READY", "reason": reason}
