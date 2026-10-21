extends SceneTree
## Negative controls intentionally stop with nonzero codes; never a game scene.
const SAFETY=preload("res://tests/mac_harness_safety.gd")
func _initialize() -> void:call_deferred("run")
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-MacHarness-Isolated":quit(2);return
 if "--probe=timeout" in OS.get_cmdline_user_args():
  SAFETY.arm(self,.15)
  paused=true
  return # Deliberately stalled coroutine; ALWAYS guard must quit 124.
 if "--probe=error" in OS.get_cmdline_user_args():
  SAFETY.arm(self,.15)
  var absent: Variant=null
  absent.call("intentional_script_error")
  return
 var safe: bool=not SAFETY.can_capture() and DisplayServer.get_name()=="headless"
 print("MAC_HARNESS_SAFETY_RESULT ",JSON.stringify({"assertions":1,"failures":0 if safe else 1,"headless_capture_skipped":safe}))
 quit(0 if safe else 1)
