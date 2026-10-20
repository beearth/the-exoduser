extends "res://tests/capture_map11_hell_props.gd"
## Same MAP11-20 600-tick walking measurement; one run, no budget recovery claim.
func _run() -> void:
 if OS.get_user_data_dir().get_file()!="EXODUSER-map11-25D-Isolated-20261021":quit(2);return
 for arg in OS.get_cmdline_user_args():
  if arg.begins_with("--output="):output=arg.trim_prefix("--output=")
 if output.is_empty():quit(3);return
 main=load("res://scenes/main.tscn").instantiate();main.set_meta("native_intro_boot","intro");root.add_child(main)
 main.source_intro_sequence.finish_native_guide();main.source_state.read_current_g().on=true
 for i in range(65):await physics_frame
 main.source_intro_sequence.lesson_flow.skip_all();main.world.get_node("NativePets")._subtitle_root.hide()
 results.append(await measure("field",Vector2(-850,-2400)))
 main.player.global_position=main.read_native_map11_provider().transition_sites().field_gate.global_position
 for i in range(40):await physics_frame
 check(main.native_map11.snapshot().space=="arena","real gate entry")
 var scene: Node=main.world.get_node("Map11ProductScene")
 results.append(await measure("arena",scene.arena_view.global_position+Vector2(1250,80)))
 var f:=FileAccess.open(output,FileAccess.WRITE)
 f.store_string(JSON.stringify({"samples":results,"checks":checks,"failures":failures,"prior_field_p95_ms":10.598,"viewport":[1920,1080],"physics_hz":Engine.physics_ticks_per_second,"scope":"one GUI run, 600 movement ticks per space; prior field from earlier MAP11-20, no matched fresh baseline or dense-combat claim"},"  "))
 main.queue_free()
 for i in range(16):await process_frame
 quit(0 if failures==0 else 1)
