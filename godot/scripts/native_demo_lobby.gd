extends Control
## Source goToLobby (G63676+, I3486+): return to the actual character-slot lobby.
func _ready() -> void:
 get_tree().paused=false
 TranslationServer.set_locale(str(get_tree().get_meta("native_demo_return_language","ko")))
 get_tree().set_meta("parity_lobby_cinematic_seen",true)
 get_tree().call_deferred("change_scene_to_file","res://scenes/demo_lobby.tscn")
