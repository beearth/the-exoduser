extends CanvasLayer
## DEMO11-37 emits Main.native_demo_boss_defeated(stage_index:int) only after
## final death/revival resolution. This consumer never detects or kills bosses.
signal wishlist_requested(url: String)
signal lobby_requested
const VIEW = preload("res://scripts/native_demo_end_view.gd")
const WISHLIST_URL := "https://store.steampowered.com/" # G63668-63671; no invented app id.
var _main: Node
var _view: Control
var _phase := "playing"
var _clear_count := 0
var _end_count := 0
var _lobby_count := 0
func configure(main: Node) -> void:
 _main=main
 name="NativeDemoEndFlow"
 layer=120
 process_mode=Node.PROCESS_MODE_ALWAYS
 _view=VIEW.new()
 _view.main=main
 _view.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
 _view.visible=false
 add_child(_view)
 _view.action_requested.connect(_act)
 main.native_demo_boss_defeated.connect(_accept_clear)
func _accept_clear(stage_index: int) -> void:
 if _phase!="playing" or not is_instance_valid(_main): return
 var policy: Dictionary=_main.read_native_demo_policy()
 if policy.get("status")!="READY" or policy.get("demo")!=true or stage_index!=policy.get("last_stage") or stage_index!=policy.get("stage"): return
 var language: Dictionary=_main.get_native_startup_language_snapshot()
 if language.get("status")!="READY": return
 if not _main.source_state.commit_native_demo_clear(_main,stage_index,false): return
 _clear_count+=1
 _phase="clear"
 _view.language=language.language
 _view.visible=true
 _view.show_page("clear")
 var pets: Node=_main.world.get_node_or_null("NativePets")
 if is_instance_valid(pets):pets.present_native_demo_end_subtitle(self)
 # World/Player are explicitly PAUSABLE; parent disable alone cannot stop them.
 # Freeze their tree and parent input; only this UI remains ALWAYS.
 _main.process_mode=Node.PROCESS_MODE_DISABLED
 get_tree().paused=true
 _view.buttons.next.grab_focus()
func _act(action: String) -> void:
 if action=="next" and _phase=="clear":
  var policy: Dictionary=_main.read_native_demo_policy()
  if not _main.source_state.commit_native_demo_clear(_main,int(policy.last_stage),true): return
  _end_count+=1
  _phase="end"
  _view.show_page("end")
  _view.buttons.wishlist.grab_focus()
 elif action=="wishlist" and _phase=="end":
  wishlist_requested.emit(WISHLIST_URL)
 elif action=="lobby" and _phase=="end":
  _phase="leaving"
  _lobby_count+=1
  _view.buttons.lobby.disabled=true
  _view.buttons.wishlist.disabled=true
  lobby_requested.emit()
func report_link_result(code: int) -> void:
 if code!=OK: _view.show_link_failure()
func get_snapshot() -> Dictionary:
 return {"phase":_phase,"clear_count":_clear_count,"end_count":_end_count,"lobby_count":_lobby_count,
  "wishlist_url":WISHLIST_URL,
  "save_io":false,"boss_death_detection":false,"language":_view.language}
