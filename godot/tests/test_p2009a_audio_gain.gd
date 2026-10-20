extends "res://tests/test_p2009a_feedback.gd"

func _contracts(feedback: Node) -> void:
	var audio: Node = feedback.get("audio")
	for gain in [0.0, 0.6, 0.36]:
		audio._play(audio.get("_voice"), gain)
		var voice: AudioStreamPlayer = audio.get("_voices").back()
		check(is_equal_approx(voice.volume_linear, gain), "exact source linear gain %s including silence" % gain)
