extends Node2D
## DEMO11-45: only PC final-completion admission remains unbound.
const REWARDS=preload("res://scripts/native_map11_chest_rewards.gd")
var _main: WeakRef
var _provider: WeakRef
var _marker: Marker2D
var _available:=false
var _opened:=false
var _opening:=false
func configure(main: Node) -> bool:
 var provider: Node=main.read_native_map11_provider()
 if _main!=null or provider==null or not provider.runtime_ready():return false
 for row in provider.anchors("boss_center"):
  if row.id=="map11.arena.boss":_marker=row.marker
 if not is_instance_valid(_marker):return false
 _main=weakref(main);_provider=weakref(provider);global_position=_marker.global_position
 z_as_relative=false;z_index=int(global_position.y/4);hide();return true
func snapshot() -> Dictionary:
 return {"status":"NOT_READY","reason":"PC_FINAL_DEFEAT_REVIVE_INTERFACE_PENDING","anchor":"map11.arena.boss","available":_available,"opened":_opened,"persistent_opened":false}
func request_completion(_receipt: Dictionary,_owner: Node) -> Dictionary:
 # A copied HP=0 / absent actor / arbitrary Dictionary is never authority.
 return snapshot()
func _input(event: InputEvent) -> void:
 if not _available or _opened or not event is InputEventKey or not event.pressed or event.echo or event.physical_keycode!=KEY_R:return
 if open_chest().get("applied",false):get_viewport().set_input_as_handled()
func open_chest() -> Dictionary:
 if not _available:return snapshot()
 if _opened or _opening:return {"applied":false,"reason":"already_opened_or_busy"}
 var main: Node=_main.get_ref();var provider: Node=_provider.get_ref()
 if not is_instance_valid(main) or not is_instance_valid(provider) or not provider.runtime_ready() or main.read_native_map11_provider()!=provider or get_tree().paused:return {"applied":false,"reason":"owner"}
 if main.player.global_position.distance_to(global_position)>=60:return {"applied":false,"reason":"distance"}
 _opening=true
 var reward:=REWARDS.build(global_position,0,int(main.source_state.read_current_p().lv),func(_tag: String):return main.world.sample_native_random_unit())
 var result: Dictionary=main.source_state.commit_native_map11_chest(main,self,reward)
 if result.get("applied",false):_opened=true;queue_redraw()
 _opening=false;return result
func owns_pending_open(main: Node) -> bool:
 return _opening and _available and not _opened and _main.get_ref()==main and _provider.get_ref()==main.read_native_map11_provider()
func _draw() -> void:
 # Same simple 2D fallback kind as source52595; no map-placement/look edits.
 draw_rect(Rect2(-22,-28,44,28),Color("473b2c"),true)
 draw_rect(Rect2(-22,-28,44,28),Color("b7a077"),false,2)
 draw_line(Vector2(-22,-19 if not _opened else -34),Vector2(22,-19 if not _opened else -34),Color("b7a077"),3)
