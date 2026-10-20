extends "res://tests/test_demo11_47h_e2e.gd"
## Validate callback boundaries and owner retirement without a gameplay traversal.
class Work extends Node:
 var cost_us:=200
 func _physics_process(_delta: float) -> void:
  var end: int=Time.get_ticks_usec()+cost_us
  while Time.get_ticks_usec()<end:pass
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-demo11-47m-Profile-Isolated-20261021":quit(1);return
 node_added.connect(profile_added)
 var first:=Stamp.new();first.process_physics_priority=-1000000;first.physics=before_physics;root.add_child(first)
 var last:=Stamp.new();last.process_physics_priority=1000000;last.physics=after_physics;root.add_child(last)
 begin("isolation")
 var parent:=Work.new();parent.name="MeasuredParent";root.add_child(parent)
 var child:=Work.new();child.cost_us=1000;child.name="MeasuredChild";parent.add_child(child)
 await settle(6)
 var parent_row: Dictionary={}
 for key in callback_costs:
  if key.begins_with(str(parent.get_path())+" | "):parent_row=callback_costs[key]
 var child_row: Dictionary={}
 for key in callback_costs:
  if key.begins_with(str(child.get_path())+" | "):child_row=callback_costs[key]
 var ok: bool=parent_row.calls>0 and parent_row.max_us<child_row.max_us and child_row.max_us>=1000
 var original_calls: int=child_row.calls
 child.queue_free();await settle(6)
 var replacement:=Work.new();replacement.name="MeasuredChild";replacement.cost_us=1000;parent.add_child(replacement)
 await settle(6)
 ok=ok and child_row.calls>original_calls
 replacement.queue_free();await settle(6)
 parent.set_physics_process(false)
 var calls: int=parent_row.calls
 await settle(6)
 ok=ok and parent_row.calls==calls
 parent.queue_free();await settle(6)
 print("DEMO11_47M_PROFILE_RESULT ",JSON.stringify({"pass":ok,"parent_us":parent_row.max_us,"child_us":child_row.max_us,"retirement_frames":12}))
 quit(0 if ok else 1)
