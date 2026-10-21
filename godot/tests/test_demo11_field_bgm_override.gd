extends SceneTree
## DEMO11 1-1 field BGM demo override: demo boot plays 「Rotten Forest - Ashen Gate」 for hell1,
## while the source catalog (game.html parity data) and every other key stay untouched.
const USERDIR := "EXODUSER-demo11-field-bgm-Isolated-20261021"
const CATALOG := preload("res://port_modules/sound_source/bgm_catalog.gd")
const DEMO_CATALOG := preload("res://scripts/native_demo11_bgm_catalog.gd")
const NEW_TRACK := "bgm/1장_썩은숲/Rotten Forest - Ashen Gate.mp3"
const SOURCE_TRACK := "bgm/1장_썩은숲/Ashes of the Fallen Gate.mp3"
var assertions := 0
var failures := 0


class NoPolicyMain extends Node:
	pass


func _initialize() -> void:
	call_deferred("_run")


func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		printerr("DEMO11_FIELD_BGM_FAIL ", label)


func _run() -> void:
	var source_root := ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-root="):
			source_root = arg.trim_prefix("--source-root=")
	check(OS.get_user_data_dir().get_file() == USERDIR, "actual isolated userdir")
	check(not source_root.is_empty() and FileAccess.file_exists(source_root.path_join(NEW_TRACK)), "new track file exists under source root")
	if failures:
		finish()
		return

	# Source catalog stays the game.html parity data.
	var source: RefCounted = CATALOG.new()
	check(source.tracks_for("hell1").get("entries") == [SOURCE_TRACK], "source catalog hell1 unchanged")
	var demo: RefCounted = DEMO_CATALOG.new()
	check(demo.tracks_for("hell1").get("entries") == [NEW_TRACK], "demo catalog hell1 replaced")
	check(demo.snapshot().tracks.hell1 == [NEW_TRACK], "demo snapshot hell1 replaced for selector copy")
	var same := true
	var src_snap: Dictionary = source.snapshot()
	var demo_snap: Dictionary = demo.snapshot()
	for key in src_snap.tracks:
		if key != "hell1" and src_snap.tracks[key] != demo_snap.tracks.get(key):
			same = false
	check(same and src_snap.tracks.size() == demo_snap.tracks.size(), "every other key identical to source")
	check(demo.all_random_entries().get("entries") == source.all_random_entries().get("entries"), "shared random pool unchanged")
	source = null
	demo = null

	var main = load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_audio_source_root", source_root)
	root.add_child(main)
	for i in range(8):
		await physics_frame
	paused = false # isolated harness resume, same as DEMO11-41 test
	await process_frame
	var music: Node = main._music_lifecycle
	check(is_instance_valid(music) and music.life.status().status == "READY", "music lifecycle installed")
	check(main.read_native_demo_policy().get("status") == "READY", "demo boot policy READY")
	check(music._catalog != null and music._catalog.has_method("demo_overrides"), "demo boot uses demo catalog")
	check(main.request_native_music_scene("field").get("ready") == true, "field scene request")
	await process_frame
	var s: Dictionary = music.snapshot()
	check(s.key == "hell1", "field keeps hell1 key")
	var last_src: String = str(music.life.snapshot_state().selection.get("last_src", ""))
	check(last_src == NEW_TRACK, "field selects the new track (%s)" % last_src)

	# A boot without demo policy keeps the source catalog.
	var plain := NoPolicyMain.new()
	var chosen: RefCounted = music._make_catalog(plain)
	check(chosen != null and not chosen.has_method("demo_overrides"), "non-demo boot keeps source catalog")
	plain.free()
	chosen = null

	if main.get_parent() != null:
		main.get_parent().remove_child(main)
	main.free()
	finish()


func finish() -> void:
	print("DEMO11_FIELD_BGM_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "driver": AudioServer.get_driver_name()}))
	quit(0 if failures == 0 else 1)
