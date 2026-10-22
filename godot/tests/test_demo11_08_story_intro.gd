extends SceneTree
## PARITY-INTRO-01: source dialogue waits and real skip input boundary.
var checks:=0
var failures:=0
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;printerr("PARITY_INTRO_FAIL ",label)
func run() -> void:
 check(OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-INTRO-01-"),"isolated IO")
 var main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_story_boot",true);root.add_child(main)
 for i in 6:await process_frame
 var story: Node=main.native_story_intro
 if not is_instance_valid(story):
  check(false,"fresh first-entry story required; saved-run restore must not substitute it")
  main.queue_free();await process_frame
  print("PARITY_INTRO_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"reason":"fresh_story_owner_missing"}))
  quit(1);return
 story.set_process(false)
 check(story.phase=="playing" and paused,"first-entry owns pause")
 check(story.current_cue().img=="00.png" and story.cue_index==0,"first entry begins INTRO not legacy world/PRO")
 story.advance(2500);story.advance(1500)
 check(story.current_cue().speaker=="GODDESS","source third cue")
 story.advance(100000)
 check(story.cue_index==2 and story._wait,"dialogue waits indefinitely")
 story.click_advance()
 check(story.current_cue().img=="03.png" and not story._wait,"input advances once")
 story.advance(1);story.click_advance()
 check(story.current_cue().img=="03.png" and story._wait,"first input reveals typing")
 check(story._data.lines.size()==29,"source 29 languages")
 check(story._textures.size()==21,"21 approved images prepared outside tick")
 story.set_process(true)
 var e:=InputEventKey.new();e.physical_keycode=KEY_SPACE;e.keycode=KEY_SPACE;e.pressed=true;Input.parse_input_event(e)
 await create_timer(2.2,true,false,true).timeout
 e=e.duplicate();e.pressed=false;Input.parse_input_event(e)
 check(story.phase=="done" and story.handoff_count==1,"actual Space hold hands off once")
 check(is_instance_valid(main.source_intro_sequence),"existing waking sequence")
 story.finish("duplicate");check(story.handoff_count==1,"no double handoff")
 paused=false;main.queue_free()
 for i in 6:await process_frame
 print("PARITY_INTRO_RESULT ",JSON.stringify({"checks":checks,"failures":failures}))
 quit(1 if failures else 0)
