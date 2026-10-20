extends "res://tests/test_demo11_boss_actor.gd"
## Regression for PC player readback surviving phase effects into the same tick.
var suffix_iframes := -1.0
var hurt_requests := 0
func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
	main = MAIN.new()
	root.add_child(main)
	if not main.is_node_ready(): await main.ready
	actor = main.native_demo_boss_actor
	_fresh()
	fixture = {"hp":16000.0,"s":"idle","st2":20.0}
	check(actor.begin_tick(_frame()),"phase_frame")
	_finish_pending()
	check(hurt_requests == 1,"fixture_PC_owner_called_once")
	check(actor.snapshot().ticks_completed == 1 and actor.snapshot().reason == "","one_completed_AI_tick")
	check(suffix_iframes == 27.0,"PC_player_readback_reaches_same_tick_suffix")
	main.free()
	print("DEMO34_READBACK_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":[],"fixture_readback_only":true,"damage_parry_verified":false}))
	quit(1 if failures else 0)
func _response(request: Dictionary) -> Dictionary:
	if request.command == "hurtP":
		hurt_requests += 1
		var player: Dictionary = request.player.duplicate(true)
		player.iframes = 27.0 # Fixture observation only; never a live Player write.
		return {"ack":true,"player_after":player}
	if request.command == "source_updateE_suffix": suffix_iframes = request.player.iframes
	return super._response(request)
