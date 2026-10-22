extends SceneTree
## Actual UI/input route only. No coordinates, HP, XP, loot, spawn or boss signal injection.
var OUT:=OS.get_environment("HOME")+"/exoduser-wt/_out/PARITY-MAP-01/e2e.json"
var screen: Node
var main: Node
var evidence: Dictionary={"continuous_E2E":false,"injections":0,"storage_argument":false,"stages":[]}
func _initialize() -> void:call_deferred("run")
func key(code: int,pressed: bool) -> void:
 var event:=InputEventKey.new();event.physical_keycode=code;event.keycode=code;event.pressed=pressed;Input.parse_input_event(event)
func wait_ms(ms: int) -> void:
 var deadline: int=Time.get_ticks_msec()+ms
 while Time.get_ticks_msec()<deadline:await process_frame
func run() -> void:
 evidence.storage_argument=OS.get_cmdline_user_args().has("--demo11-storage=on")
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-MAP-01-") or not evidence.storage_argument:finish("FAIL","isolation/argument");return
 screen=load("res://scenes/demo_lobby.tscn").instantiate();screen.set_meta("native_lobby_entry_enabled",true);root.add_child(screen);current_scene=screen
 var slot: int=-1
 for i in range(screen.menu.rows.size()):
  if screen.menu.rows[i].kind=="empty":slot=i;break
 if slot<0:finish("NOT_READY","isolated UI has no empty slot; no records deleted");return
 screen.cards[slot].pressed.emit();screen.character_buttons[0].pressed.emit();screen.name_input.text="패리티검수"+str(slot);screen.name_input.text_submitted.emit(screen.name_input.text)
 var deadline: int=Time.get_ticks_msec()+20000
 while Time.get_ticks_msec()<deadline:
  await process_frame
  if is_instance_valid(current_scene) and current_scene.has_method("read_native_map11_provider"):main=current_scene;break
 if not is_instance_valid(main):finish("NOT_READY","actual character creation did not enter Main");return
 evidence.stages.append("actual character UI → Main")
 root.mode=Window.MODE_WINDOWED;root.show()
 key(KEY_SPACE,true);await wait_ms(2400);key(KEY_SPACE,false);await wait_ms(1000)
 key(KEY_SPACE,true);await wait_ms(2400);key(KEY_SPACE,false);await wait_ms(1000)
 # The lesson's existing visible skip button is a product UI action.
 var guide: Node=main.source_intro_sequence
 if is_instance_valid(guide) and is_instance_valid(guide.lesson_flow):
  var button: Node=guide.lesson_flow.find_child("*",true,false)
  for child in guide.lesson_flow.find_children("*","Button",true,false):
   if child.text.contains("건너뛰기"):child.pressed.emit();break
 var g: Dictionary=main.source_state.read_current_g()
 evidence["intro_phase"]=guide.phase if is_instance_valid(guide) else "absent"
 if not g.get("on",false):finish("NOT_READY","actual skip input did not complete intro/guide; no state fallback");return
 evidence.stages.append("field running")
 var start: Vector2=main.player.global_position
 key(KEY_W,true)
 var mouse:=InputEventMouseButton.new();mouse.button_index=MOUSE_BUTTON_LEFT;mouse.pressed=true;mouse.position=Vector2(960,200);Input.parse_input_event(mouse)
 await wait_ms(30000)
 key(KEY_W,false);mouse.pressed=false;Input.parse_input_event(mouse)
 evidence["start"]=str(start);evidence["end"]=str(main.player.global_position);evidence["kills"]=g.get("kills",0);evidence["hp"]=main.player.hp
 evidence["provider_ready"]=is_instance_valid(main.read_native_map11_provider()) and main.read_native_map11_provider().runtime_ready()
 evidence["natural_enemy_count"]=main.world.get_enemies().size()
 finish("NOT_READY","no natural boss defeat → clear → lobby completion during strict input route")
func finish(status: String,reason: String) -> void:
 evidence["status"]=status;evidence["reason"]=reason
 var file:=FileAccess.open(OUT,FileAccess.WRITE);file.store_string(JSON.stringify(evidence,"  "));file.close()
 print("PARITY_E2E ",JSON.stringify(evidence))
 if is_instance_valid(main):main.queue_free()
 if is_instance_valid(screen):screen.queue_free()
 for i in range(4):await process_frame
 quit(1 if status=="FAIL" else 0)
