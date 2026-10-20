extends "res://tests/test_p2009a_feedback.gd"

func _contracts(feedback: Node) -> void:
	var audio: Node = feedback.get("audio")
	var state: Node = main.get("source_state")
	var before: Dictionary = state.read_current_p().duplicate(true)
	check(audio.play_source("levelup"), "source level request accepted")
	var first: Dictionary = audio.snapshot().last
	check(first.synthesis_on_game_thread == false, "wave generation not on game thread")
	check(audio.play_source("pickup") and audio.play_source("levelup"), "back-to-back requests retain separate worker jobs")
	for frame in range(120):
		if audio.snapshot().pending == 0:
			break
		await process_frame
	var snap: Dictionary = audio.snapshot()
	check(snap.pending == 0, "all requested worker jobs collected")
	var voices: Array = audio.get("_voices")
	check(voices.size() >= 2, "multiple original cues reach actual AudioStreamPlayers")
	if voices.size() >= 2:
		check(not is_same(voices[0].stream, voices[1].stream), "fresh procedural waveform resources")
	var current: Dictionary = state.read_current_p()
	check(current.lv == before.lv and current.sp == before.sp and current.ap == before.ap, "presentation does not award levels or points")
	print("P2009A_WORKER_AUDIO ", JSON.stringify({"first": first, "last": snap.last, "pending": snap.pending, "active": snap.active}))
