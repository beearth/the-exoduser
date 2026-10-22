extends SceneTree
## Input-only route. No save/world/HP/spawn/state injection.
var failures:=0
var evidence: Dictionary={"injections":0,"route":[]}
var main: Node
func _initialize() -> void:call_deferred("run")
func wait_ms(ms: int) -> void:
 var until: int=Time.get_ticks_msec()+ms
 while Time.get_ticks_msec()<until:await process_frame
func key(code: int,down: bool,unicode_value: int=0) -> void:
 var e:=InputEventKey.new();e.physical_keycode=code;e.keycode=code;e.unicode=unicode_value;e.pressed=down;Input.parse_input_event(e)
func click(at: Vector2) -> void:
 var m:=InputEventMouseMotion.new();m.position=at;Input.parse_input_event(m)
 var e:=InputEventMouseButton.new();e.position=at;e.button_index=MOUSE_BUTTON_LEFT;e.pressed=true;Input.parse_input_event(e)
 await process_frame
 e=e.duplicate();e.pressed=false;Input.parse_input_event(e);await wait_ms(200)
func hold(ms: int,code: int=KEY_SPACE) -> void:
 key(code,true);await wait_ms(ms);key(code,false);await wait_ms(200)
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-INTRO-01-") or not OS.get_cmdline_user_args().has("--demo11-storage=on"):finish("FAIL isolation");return
 root.size=Vector2i(1920,1080);root.content_scale_size=Vector2i(1920,1080)
 var screen=load("res://scenes/demo_lobby.tscn").instantiate();screen.set_meta("native_lobby_entry_enabled",true);root.add_child(screen);current_scene=screen
 await wait_ms(500);await hold(5300,KEY_ESCAPE);evidence.route.append("lobby cinematic: actual Escape hold")
 # SWEEP-B(2026-10-23): 웹 로비 '+ 새 캐릭터' 카드(1392,503,480,64) → 캐릭터 선택(#charVisualPop) '생성' #visualCreateBtn(1206.6,1004,133.4,46)
 await click(Vector2(1600,535));await click(Vector2(1273,1027))
 for letter in "IntroQA":key(0,true,letter.unicode_at(0));key(0,false)
 await wait_ms(100);key(KEY_ENTER,true);key(KEY_ENTER,false);await wait_ms(400)
 await hold(1500);evidence.route.append("character story: actual Space hold")
 var until: int=Time.get_ticks_msec()+20000
 while Time.get_ticks_msec()<until:
  if is_instance_valid(current_scene) and current_scene.has_method("read_native_intro_boundary_commit"):main=current_scene;break
  await process_frame
 if not is_instance_valid(main):finish("FAIL character entry");return
 evidence.route.append("character UI → Main")
 await hold(2300);await wait_ms(300);evidence.route.append("first-entry INTRO: actual Space hold")
 # Existing guide skip UI uses Space hold too (source key guide).
 await hold(2300);await wait_ms(1200)
 var g: Dictionary=main.source_state.read_current_g()
 evidence["field_on"]=g.get("on",false);evidence["story_handoff"]=main.native_story_intro.handoff_count
 evidence["guide_phase"]=main.source_intro_sequence.phase if is_instance_valid(main.source_intro_sequence) else "absent"
 if not g.get("on",false):finish("FAIL field not reached");return
 evidence.route.append("field reached")
 finish("PASS")
func finish(status: String) -> void:
 evidence["status"]=status;evidence["failures"]=0 if status=="PASS" else 1
 var f:=FileAccess.open(OS.get_environment("HOME")+"/exoduser-wt/_out/PARITY-INTRO-01/e2e-route.json",FileAccess.WRITE);f.store_string(JSON.stringify(evidence,"  "));f.close()
 print("PARITY_INTRO_E2E_RESULT ",JSON.stringify(evidence))
 paused=false
 for child in root.get_children():child.queue_free()
 for i in 6:await process_frame
 quit(0 if status=="PASS" else 1)
