extends SceneTree
const CONSUMER=preload("res://scripts/native_combat_sound_consumer.gd")
const MAIN=preload("res://scripts/main.gd")
const USERDIR="EXODUSER-demo11-40-Isolated-20261021"
var assertions:=0
var failures:=0
func _initialize() -> void: call_deferred("_run")
func check(ok: bool,label: String) -> void:
	assertions+=1
	if not ok: failures+=1;printerr("DEMO11_40_FAIL ",label)
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"actual isolated userdir")
	if failures: finish();return
	var before: int=AudioServer.bus_count
	# Real Main event bridge without starting or mutating combat/State.
	var main=MAIN.new()
	var c=CONSUMER.new()
	root.add_child(c)
	var stream:=AudioStreamMP3.new()
	stream.data=FileAccess.get_file_as_bytes("res://assets/sfx/attack_source/sword_swing1.mp3")
	check(stream.get_length()>0,"existing original MP3 decodes")
	check(c.configure(main,{"sword_swing1":stream,"monster_hit":stream,"death_monster1":stream}),"real SND configure")
	check(not c.configure(main,{}),"duplicate configure refused")
	check(main.native_sound_event.get_connections().size()==1,"exactly one subscriber")
	main._record_event("enemy_damage",{})
	check(c.snapshot().received==0,"no damage handler or damage side effects")
	for i in range(3):
		main._record_event("native_attack_audio_queued",{"key":"sword_swing1","gain":0.8,"rate":1.0,"priority":true,"character":0})
	check(c.snapshot().queued==3,"existing event consumed once each")
	c.flush({"ready":true,"sfx_gain":0.6},0,false)
	var snap: Dictionary=c.snapshot()
	check(snap.starts==3 and snap.active.size()==3 and snap.queued==0,"sole backend exactly three starts")
	var gains: Array=[]
	for voice in snap.active:
		gains.append(voice.volume)
		check(voice.playing,"actual AudioStreamPlayer playing")
		check(voice.bus==snap.bus,"voice uses sole SND07 bus")
	check(is_equal_approx(gains[0],0.48) and is_equal_approx(gains[1],0.48) and is_equal_approx(gains[2],0.24),"SND03 third duplicate damping, SND07 sample OPT once")
	var mix_bus: int=snap.mix.bus
	var nodes: Dictionary=snap.graph.nodes
	var mix_name: String=nodes[mix_bus].bus
	check(AudioServer.get_bus_send(AudioServer.get_bus_index(snap.bus))==mix_name,"backend sends to SND08 mbus")
	check(is_equal_approx(AudioServer.get_bus_volume_linear(AudioServer.get_bus_index(mix_name)),0.6),"original second mbus OPT factor")
	for id in nodes:
		var n: Dictionary=nodes[id]
		var index: int=AudioServer.get_bus_index(n.bus)
		var target: String="SFX" if n.to==0 else nodes[n.to].bus # AUDIO-01 documented destination
		check(index>AudioServer.get_bus_index(target) and AudioServer.get_bus_send(index)==target,"bus %s index%d target%s index%d actual%s" % [n.bus,index,target,AudioServer.get_bus_index(target),AudioServer.get_bus_send(index)])
	check(AudioServer.get_bus_send(AudioServer.get_bus_index("SFX"))=="Master","AUDIO-01 SFX reaches final Master")
	check(snap.graph.DSP=="BYPASS_UNVERIFIED","no false DSP equivalence")
	c.flush({"ready":true,"sfx_gain":0.0},0,false)
	check(AudioServer.is_bus_mute(AudioServer.get_bus_index(mix_name)),"OPT zero mutes already active voices")
	main._record_event("native_attack_audio_queued",{"key":"sword_swing1","gain":1.0,"rate":1.0,"priority":true,"character":1})
	c.flush({"ready":true,"sfx_gain":1.0},0,false)
	check(c.snapshot().starts==3,"stale character queue discarded")
	c.flush({"ready":false},0,false)
	check(c.snapshot().active.is_empty() and c.snapshot().ends==3,"source loss stops voices exactly once")
	c.install_sample("heavy_hit",stream)
	main._record_event("native_skill_sample_requested",{"key":"heavy_hit","gain":1.0,"rate":1.0,"character":0})
	c.flush({"ready":true,"sfx_gain":1.0},0,false)
	check(c.snapshot().starts==4,"skill and attack share backend")
	c.flush({"ready":true,"sfx_gain":1.0},0,true)
	check(c.snapshot().active.is_empty() and c.snapshot().ends==4,"pause drains timers and voices")
	main._record_event("native_attack_audio_queued",{"key":"death_monster1","gain":1.0,"rate":1.0,"priority":false,"character":0})
	c.flush({"ready":true,"sfx_gain":1.0},0,false)
	check(c.snapshot().starts==5,"death SND priority uses same backend")
	var v: AudioStreamPlayer=c.backend.voice_node(5)
	v.finished.emit()
	c.backend.stop_all("duplicate_cleanup")
	check(c.snapshot().ends==5,"finished and stop callback cleanup idempotent")
	c.close();c.close()
	check(main.native_sound_event.get_connections().is_empty(),"exit unsubscribes")
	check(AudioServer.bus_count==before,"all owned buses removed, foreign buses retained")
	c.free();main.free()
	await process_frame
	await create_timer(0.1).timeout
	# Natural Main boot and its installed consumer; no damage or movement edits.
	var live=load("res://scenes/main.tscn").instantiate()
	root.add_child(live)
	for i in range(8):await physics_frame
	var settings: Dictionary=live.read_native_attack_audio_settings()
	check(settings.get("ready")==true,"live Main audio owners ready")
	if settings.get("ready")==true:
		paused=true
		live._character_picker.select(1)
		live._on_native_character_selected(1)
		paused=false
		var player=live.player
		var original_state: String=player.state
		player.state="swing" # isolated request fixture; no combat callback invoked
		player._native_attack_audio_serial+=1
		var reply: Dictionary=live.request_native_attack_sound(player,"start",1,player._native_attack_audio_serial)
		check(reply.get("accepted")==true,"actual attack producer accepted: "+str(reply))
		var twice: Dictionary=live.request_native_attack_sound(player,"start",1,player._native_attack_audio_serial)
		check(twice.get("accepted")==false,"actual duplicate phase refused")
		live._advance_native_attack_audio()
		check(live.get_native_attack_audio_snapshot().starts==1,"actual producer -> event -> SND backend once")
		check(live._attack_audio_active.is_empty() and live._attack_audio_queue.is_empty(),"legacy backend silent and queue drained")
		player.state=original_state
		live.request_native_skill_sample("res://assets/sfx/skill/heavy_hit.mp3",1.0,1.0)
		live._advance_native_attack_audio()
		check(live.get_native_attack_audio_snapshot().starts==2,"actual skill audio entry shares backend")
	live.free()
	await process_frame
	await create_timer(0.2).timeout
	check(AudioServer.bus_count==before,"live Main exit leaves no buses")
	finish()
func finish() -> void:
	print("DEMO11_40_RESULT ",JSON.stringify({"assertions":assertions,"failures":failures,"driver":AudioServer.get_driver_name(),"DSP_parity":false,"audible_verified":false,"skipped":[]}))
	quit(0 if failures==0 else 1)
