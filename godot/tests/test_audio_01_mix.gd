extends SceneTree
const MUSIC=preload("res://scripts/native_music_lifecycle.gd")
const PROFILE=preload("res://scripts/native_audio_mix_profile.gd")
class Options extends Node:
	var values: Dictionary={"bgmTrack":"auto","bgmVol":60,"sfxVol":60}
	func read_current_options() -> Dictionary:return values
class Player extends Node:
	signal telemetry_event(kind: String,data: Dictionary)
class MainFixture extends Node:
	signal source_document_visibility_changed
	signal native_sound_event(kind: String,data: Dictionary)
	var player: Node
	var source_initialization_services: Node
	var hidden := false
	func read_native_document_hidden() -> bool:return hidden
var assertions:=0
var failures:=0
func check(value: bool,label: String) -> void:
	assertions+=1
	if not value:failures+=1;printerr("AUDIO_01_FAIL ",label)
func record(music: Node,label: String) -> void:print("AUDIO_01_STATE ",label," ",JSON.stringify(music.arpg_mix.snapshot()))
func _initialize() -> void:
	preload("res://tests/mac_harness_safety.gd").arm(self, 120.0)
	call_deferred("run")
func run() -> void:
	check(OS.get_user_data_dir().get_file()=="EXODUSER-AUDIO-01-Isolated","isolated user directory")
	for bus in ["Master","Music","Ambience","SFX","UI","Voice"]:
		check(AudioServer.get_bus_index(bus)>=0,"bus exists "+bus)
		print("AUDIO_01_BUS ",bus," ",AudioServer.get_bus_volume_db(AudioServer.get_bus_index(bus)))
	var before:=AudioServer.bus_count
	var main:=MainFixture.new();root.add_child(main)
	main.player=Player.new();main.add_child(main.player)
	main.source_initialization_services=Options.new();main.add_child(main.source_initialization_services)
	var music=MUSIC.new();main.add_child(music)
	check(music.configure(main,ProjectSettings.globalize_path("res://../")),"native lifecycle configured")
	music.arpg_mix.time_scale=0.01
	music.transition("field")
	check(music.life.snapshot_state().cur!=null,"existing field asset selected")
	check(AudioServer.get_bus_send(AudioServer.get_bus_index(music._bus))=="Music","music output routed")
	await create_timer(0.08).timeout
	check(is_equal_approx(AudioServer.get_bus_volume_db(AudioServer.get_bus_index("Music")),PROFILE.FIELD_DB),"field trim -14")
	check(music.arpg_mix.cycle.time_left>=1.1 and music.arpg_mix.cycle.time_left<=1.8,"120-180 second cycle scaled")
	record(music,"playing")
	main.native_sound_event.emit("native_attack_audio_queued",{})
	check(music.arpg_mix.ducked,"attack event ducks")
	await create_timer(0.01).timeout
	check(music.arpg_mix.duck_db<0,"attack tween lowers gain")
	var tween: Tween=music.arpg_mix._duck_tween
	main.player.telemetry_event.emit("player_damage",{})
	check(music.arpg_mix._duck_tween==tween,"repeated combat extends hold without tween allocation")
	record(music,"duck")
	await create_timer(0.1).timeout
	check(not music.arpg_mix.ducked and is_zero_approx(music.arpg_mix.duck_db),"hold then smooth release")
	record(music,"released")
	main.hidden=true;music._visibility()
	var remaining: float=music.arpg_mix.cycle.time_left
	await create_timer(0.06).timeout
	check(is_equal_approx(remaining,music.arpg_mix.cycle.time_left),"hidden cycle frozen")
	main.hidden=false;music._visibility()
	var saw_rest:=false
	for i in range(220):
		await create_timer(0.01).timeout
		if music.arpg_mix.phase=="rest":
			saw_rest=true;break
	check(saw_rest,"accelerated cycle enters ambience-only rest")
	check(music.life.snapshot_state().cur==null,"rest has no music handle")
	check(music.arpg_mix.cycle.time_left<=0.4,"20-40 second rest scaled")
	record(music,"rest")
	await music.arpg_mix.cycle.timeout
	await process_frame
	check(music.arpg_mix.phase=="playing" and music.life.snapshot_state().cur!=null,"one full cycle restarts music")
	record(music,"cycle complete")
	music._boss_event("entered",0)
	check(music.arpg_mix.phase=="off" and music.arpg_mix.cycle.is_stopped(),"boss cancels field cycle")
	await create_timer(0.07).timeout
	check(is_equal_approx(music.arpg_mix.level_db,-7.0),"boss lift +7")
	check(music.life.snapshot_state().cur_key=="boss","boss music selected")
	record(music,"boss")
	music._boss_event("victory",0)
	check(music._scene=="field" and music.arpg_mix.phase=="playing","boss clear restores field")
	main.source_initialization_services.values.bgmVol=0;music.refresh_options()
	check(is_zero_approx(music.life.snapshot_state().cur.volume),"user music mute preserved")
	main.source_initialization_services.values.sfxVol=0;music.refresh_options()
	check(AudioServer.get_bus_volume_linear(AudioServer.get_bus_index("Ambience"))==0,"user SFX mute applies to ambience")
	music.transition("field","hell1")
	music.transition("boss")
	music.transition("stop")
	music.transition("intro","cutscene_warintro")
	check(is_equal_approx(music.life.snapshot_state().cur.envelope,1.0),"intro restores envelope after cancelled field fade")
	music.transition("stop")
	check(music.arpg_mix.cycle.is_stopped() and music.arpg_mix._tails.is_empty(),"stop cancels timers and tails")
	music.close();main.free();await process_frame
	await create_timer(0.25).timeout # Let the audio server drain stopped playback references.
	check(AudioServer.bus_count==before,"dynamic buses cleaned")
	print("AUDIO_01_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"ambience":"HOLD: no approved forest asset","audible_verified":false,"driver":AudioServer.get_driver_name()}))
	quit(0 if failures==0 else 1)
