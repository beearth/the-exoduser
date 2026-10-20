extends SceneTree
var checks:=0
var failures:=0
var evidence: Dictionary={}
func _initialize() -> void:call_deferred("run")
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1
 evidence[label]=ok
func run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-demo11-47k-Isolated-20261021":quit(1);return
 var main=load("res://scenes/main.tscn").instantiate()
 main.set_meta("native_intro_boot","intro");root.add_child(main);current_scene=main
 for i in 12:await physics_frame
 main.source_intro_sequence.finish_native_guide()
 var lesson: Node=main.source_intro_sequence.lesson_flow
 var until:=Time.get_ticks_msec()+10000
 while not lesson.active and Time.get_ticks_msec()<until:await process_frame
 lesson.skip_all()
 for i in 20:await physics_frame
 var provider: Node=main.world.map11_provider
 var markers: Array=provider.fieldboss_markers()
 check(markers.size()==4,"four_actual_markers")
 for i in markers.size():check(provider.region_at(markers[i].global_position)==i and provider.can_move(markers[i].global_position,44),"family_site_"+str(i))
 var g: Dictionary=main.source_state.read_current_g()
 check(main.native_demo_anglers.snapshot().provider_bound,"family_provider_bound")
 check(g.get("_fbSpawned",false) and g.get("_fieldBosses",[]).size()==4,"actual_family_spawn")
 check(main.native_demo_anglers.snapshot().serial>=0,"actual_family_tick")
 var sites: Dictionary=provider.transition_sites()
 main.player.global_position=sites.field_gate.global_position
 var receipt: Dictionary=main.request_native_map11_transition("enter")
 check(receipt.get("status")!="READY" and not g.get("_bossArena",false),"locked_gate_rejects_entry")
 check(main.native_demo_boss_actor.snapshot().enemy.is_empty(),"no_boss_before_prerequisites")
 evidence.family=main.native_demo_anglers.snapshot();evidence.encounter=main.native_demo_encounter.snapshot();evidence.receipt=receipt
 evidence.remaining="Actual PC fieldboss HP/final readback and boss prefix/damage owners absent; no fabricated clear or HP writes"
 var out:=FileAccess.open(OS.get_cmdline_user_args()[0],FileAccess.WRITE)
 out.store_string(JSON.stringify({"checks":checks,"failures":failures,"evidence":evidence},"\t"));out.close()
 print("DEMO11_47K_RESULT checks=",checks," failures=",failures)
 for audio in main.find_children("*","AudioStreamPlayer",true,false):audio.stop()
 main.queue_free();await process_frame;await create_timer(.25).timeout
 quit(1 if failures else 0)
