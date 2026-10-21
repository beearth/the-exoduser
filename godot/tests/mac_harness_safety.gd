extends Node
## Test-only safety owner. Installed once; runs even if UI pauses the SceneTree.
var _tree: SceneTree
var _deadline:=0
static func can_capture() -> bool:
 return DisplayServer.get_name()!="headless"
static func arm(tree: SceneTree,seconds: float=120.0) -> void:
 var guard=load("res://tests/mac_harness_safety.gd").new()
 guard._tree=tree
 guard._deadline=Time.get_ticks_msec()+int(seconds*1000.0)
 guard.process_mode=Node.PROCESS_MODE_ALWAYS
 tree.root.add_child.call_deferred(guard)
func _process(_delta: float) -> void:
 if Time.get_ticks_msec()>=_deadline:
  printerr("MAC_HARNESS_TIMEOUT coroutine or test exceeded deadline")
  _tree.quit(124)
