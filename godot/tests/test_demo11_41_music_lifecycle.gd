extends SceneTree
const USERDIR="EXODUSER-demo11-41-Isolated-20261021"
class BossFixture extends Node:
	signal native_boss_music_changed(phase: String,stage: int)
var assertions:=0
var failures:=0
var skipped: Array=[]
var state_evidence: Array=[]
func check_media(ok: bool,label: String) -> void:
	if AudioServer.get_driver_name()=="Dummy":
		var reason: String="Dummy audio driver: actual playback/deferred media callbacks are not observable reliably; headless Window visibility may suspend media timers. User real-window listening remains required."
		skipped.append({"label":label,"reason":reason})
		print("DEMO11_41_SKIP ",JSON.stringify(skipped.back()))
	else:check(ok,label)
func record_state(music: Node,label: String) -> void:
	var s: Dictionary=music.snapshot()
	state_evidence.append({"label":label,"scene":s.scene,"key":s.key,"suspended":s.media.suspended,"timers":s.media.timers})
func _initialize() -> void:
	preload("res://tests/mac_harness_safety.gd").arm(self, 120.0)
	call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok:failures+=1;printerr("DEMO11_41_FAIL ",label)
func _run() -> void:
	# Legacy map contract: own dormant/provider/intro fixture, no MAP11 product binding.
	if "--map11=off" not in OS.get_cmdline_user_args():push_error("legacy contract requires --map11=off");quit(2);return
	var source_root: String=""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--source-root="):source_root=arg.trim_prefix("--source-root=")
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
	check(not source_root.is_empty() and DirAccess.dir_exists_absolute(source_root.path_join("bgm")),"explicit read-only original asset root")
	if failures:finish();return
	var before: int=AudioServer.bus_count
	var main=load("res://scenes/main.tscn").instantiate()
	main.set_meta("native_audio_source_root",source_root)
	root.add_child(main)
	for i in range(8):await physics_frame
	paused=false # explicit isolated harness resume, no production authority bypass
	await process_frame
	var music: Node=main._music_lifecycle
	check(is_instance_valid(music) and music.life.status().status=="READY","Main installs unchanged SND06 model")
	check(main.read_native_demo_policy().get("status")=="READY","DEMO11-01 authority retained")
	check(not main.bind_native_boss_music(null).ready,"missing actor is contract only")
	for scene in ["lobby","intro","field"]:
		var segment: String="cutscene_warintro" if scene=="intro" else ""
		check(main.request_native_music_scene(scene,segment).ready,"actual scene request "+scene)
		await process_frame
		var s: Dictionary=music.snapshot()
		var cur: RefCounted=music.life.snapshot_state().cur
		check(s.scene==scene and cur!=null,"scene transition selects native handle "+scene)
		record_state(music,scene)
		check_media(cur!=null and cur.playing(),"actual original track plays "+scene)
		check(cur.output==s.BGM_bus and AudioServer.get_bus_send(AudioServer.get_bus_index(s.BGM_bus))=="Music","BGM independent of SFX volume")
		check(is_equal_approx(cur.volume,0.6),"live OPT bgmVol60")
		var same: RefCounted=cur
		check(main.request_native_music_scene(scene).get("duplicate",false),"duplicate scene does not restart")
		check(music.life.snapshot_state().cur==same,"same cached Audio identity")
	var current: RefCounted=music.life.snapshot_state().cur
	music.media.suspend(true)
	check(not current.playing(),"suspend actually pauses")
	music.media.suspend(false)
	check_media(current.playing(),"resume actual same Audio")
	music.media.suspend(true)
	main.request_native_music_scene("stop")
	music.media.suspend(false)
	check(not current.playing() and music.life.snapshot_state().cur==null,"stop while suspended cannot resurrect old music")
	main.request_native_music_scene("field")
	var owner:=Node.new();main.add_child(owner)
	var voice: Dictionary=main.request_native_lifecycle_voice(owner,"res://assets/sfx/voice/voice_wakeup.mp3",1.0)
	check(voice.get("accepted",false),"voice accepted without character selection")
	check(main.request_native_lifecycle_voice(owner,"res://assets/sfx/voice/voice_wakeup.mp3",1.0).get("duplicate",false),"voice duplicate owner suppressed")
	var vs: Dictionary=music.snapshot()
	check(vs.voices==1,"one voice")
	var voice_audio: RefCounted=music._voices[voice.id].audio
	check(voice_audio.output=="Voice","voice routes to Voice bus")
	check_media(voice_audio.playing(),"voice plays on Voice bus")
	check(is_equal_approx(voice_audio.volume,0.6),"voice sample OPT gain")
	music.media.suspend(true);check(not voice_audio.playing(),"voice suspended")
	music.media.suspend(false);check_media(voice_audio.playing(),"voice resumed")
	owner.free();check(music.snapshot().voices==0,"owner exit releases voice")
	var queued_owner:=Node.new();main.add_child(queued_owner)
	music.media.suspend(true)
	var queued: Dictionary=main.request_native_lifecycle_voice(queued_owner,"res://assets/sfx/voice/voice_wakeup.mp3",1.0)
	check(queued.get("accepted",false) and not queued.get("playing",true),"suspended voice is accepted queued, never fake playing")
	music.media.suspend(false)
	check_media(music._voices[queued.id].audio.playing(),"queued voice actually starts on resume")
	queued_owner.free()
	var boss:=BossFixture.new();main.add_child(boss)
	check(main.bind_native_boss_music(boss).ready,"fixture actor contract subscribes")
	boss.native_boss_music_changed.emit("entered",0)
	check(music.snapshot().key=="boss","boss signal selects boss track")
	check_media(music.life.snapshot_state().cur!=null and music.life.snapshot_state().cur.playing(),"boss signal plays actual boss track")
	boss.native_boss_music_changed.emit("entered",1)
	check(music.snapshot().key=="boss","non-demo stage signal ignored")
	boss.native_boss_music_changed.emit("exited",0)
	check(music.snapshot().key=="hell1","boss exit resumes field selection")
	boss.native_boss_music_changed.emit("entered",0)
	boss.free();check(music.snapshot().key=="hell1","actor exit restores field")
	main.player.telemetry_event.emit("player_died",{})
	check(is_instance_valid(main.native_demo_life) and music.snapshot().scene=="field","installed life owner suppresses premature legacy death music")
	# Audio-only public seam used by native_demo11_life._final_ui; no life/HP injection.
	check(main.request_native_music_scene("death").ready,"final-life consumer music request accepted")
	check(music.snapshot().scene=="death" and music.media.snapshot().timers>0,"final-life music request starts terminal timer")
	record_state(music,"death requested")
	await create_timer(0.68).timeout
	check_media(music.snapshot().key=="death" and music.life.snapshot_state().cur.playing(),"existing death signal fade and terminal playback")
	check_media(music.life.snapshot_state().cur!=null and not music.life.snapshot_state().cur.on_ended.is_valid(),"death has no automatic next track")
	main.request_native_music_scene("field")
	main.request_native_music_scene("victory")
	main.request_native_music_scene("field") # old terminal timeout must not steal restored field
	await create_timer(1.05).timeout
	check(music.snapshot().key=="hell1","stale terminal callback cannot replace newer scene")
	main.request_native_music_scene("victory")
	await create_timer(1.05).timeout
	check(music.snapshot().scene=="victory","victory request state retained")
	record_state(music,"victory requested")
	check_media(music.snapshot().key=="victory" and music.life.snapshot_state().cur!=null and music.life.snapshot_state().cur.playing(),"victory actual playback")
	main.request_native_music_scene("stop")
	check(music.life.snapshot_state().cur==null,"explicit stop")
	var seq=main.source_intro_sequence
	check(seq.begin_native_intro().applied,"actual intro owner begins")
	check(music.snapshot().scene=="guide" and music.life.snapshot_state().cur==null,"guide keeps music stopped")
	check(seq.finish_native_guide().applied,"actual opening owner runs")
	check(music.snapshot().key=="hell1","actual opening signal starts field")
	check(music.snapshot().cache<=6,"SND06 bounded cache")
	var bad: RefCounted=music.media.create_audio("bgm/__demo11_41_missing_fixture__.mp3")
	var receipt: Dictionary={"error":false,"reject":false}
	bad.on_error=func() -> void:receipt.error=true
	bad.play(Callable(),func() -> void:receipt.reject=true)
	check(not FileAccess.file_exists(source_root.path_join(bad.src)) and music.media.audios.has(bad),"missing fixture absent and request handle registered")
	await create_timer(0.03).timeout
	check_media(receipt.error and receipt.reject,"missing original asset emits error and rejects")
	check_media(not music.media.audios.has(bad),"failed load releases native handle")
	music.close();music.close()
	check(bad.driver==null and not music.media.audios.has(bad),"close releases missing request handle on every driver")
	check(music.media.snapshot().audios.is_empty() and music.media.snapshot().timers==0 and music.media.snapshot().listeners==0,"close drains audios timers listeners")
	main.free()
	await process_frame
	await create_timer(0.2).timeout
	check(AudioServer.bus_count==before,"all music and SND buses restored")
	finish()
func finish() -> void:
	print("DEMO11_41_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"skipped":skipped,"state_evidence":state_evidence,"driver":AudioServer.get_driver_name(),"audible_verified":false,"boss_actor":"fixture contract only","lobby_intro_scene_owner":"request API only"}))
	quit(0 if failures==0 else 1)
