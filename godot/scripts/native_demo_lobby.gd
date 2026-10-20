extends Control
## Minimal native demo return landing. Not the web character-slot/save lobby.
const VIEW = preload("res://scripts/native_demo_end_view.gd")
var _leaving := false
var _view: Control
func _ready() -> void:
 # Old combat scene has already been removed before unpausing the landing.
 get_tree().paused=false
 process_mode=Node.PROCESS_MODE_ALWAYS
 _view=VIEW.new()
 _view.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 var language: String=str(get_tree().get_meta("native_demo_return_language","ko"))
 _view.language=language
 add_child(_view)
 _view.show_page("lobby")
 _view.action_requested.connect(_act)
 _view.buttons.replay.grab_focus()
func _act(action: String) -> void:
 if _leaving: return
 if action=="replay":
  _leaving=true
  _view.buttons.replay.disabled=true
  get_tree().call_deferred("change_scene_to_file","res://scenes/main.tscn")
 elif action=="wishlist":
  if OS.shell_open("https://store.steampowered.com/")!=OK: _view.show_link_failure()
