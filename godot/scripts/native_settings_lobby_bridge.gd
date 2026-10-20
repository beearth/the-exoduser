extends RefCounted
## SETTINGS S10 explicit language/device handoff subset. No OPT/hellLang IO.
## Unknown locales use English; no claim of 29-language localization.
var language := "ko"
var device := "keyboard"
func configure(locale: String) -> void:
	language = "ko" if locale.begins_with("ko") else "en"
func observe(event: InputEvent) -> void:
	if event is InputEventJoypadButton or event is InputEventJoypadMotion: device = "gamepad"
	elif event is InputEventKey or event is InputEventMouse: device = "keyboard"
func text(ko: String, en: String) -> String:
	return ko if language == "ko" else en
