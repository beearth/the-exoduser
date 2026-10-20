extends Node
## DEMO11-40: subscribe to existing queued audio events, never damage/input paths.
const BACKEND=preload("res://scripts/native_sound_backend.gd")
const CATALOG=preload("res://port_modules/sound_source/catalog.gd")
const QUEUE=preload("res://port_modules/sound_source/queue_phase.gd")
const MIX=preload("res://scripts/native_sound_mix.gd")
const GRAPH=preload("res://scripts/native_combat_sound_graph.gd")
var backend: Node
var _main: Node
var _mix: RefCounted
var _graph: RefCounted
var _state: Dictionary=QUEUE.new_state()
var _closed := false
var _gain := 1.0
var _ready := false
var _mobile := false
var _received := 0
var _rejected := 0
var _last: Dictionary={}
var _samples: Dictionary={}
func configure(main: Node, streams: Dictionary) -> bool:
	if is_instance_valid(_main) or not is_inside_tree() or not main.has_signal("native_sound_event"): return false
	_main=main
	_mobile=OS.has_feature("android") or OS.has_feature("ios")
	_samples=streams.duplicate()
	_graph=GRAPH.new()
	_mix=MIX.new(_graph,func() -> float: return _gain)
	var bus: int=_mix.mbus()
	_graph.commit()
	backend=BACKEND.new()
	add_child(backend)
	var result: Dictionary=backend.configure(CATALOG.new(),_load_sample,func() -> float: return _gain,
		func() -> float: return Time.get_ticks_msec(),func() -> float: return 0.0,
		func() -> bool: return not _closed)
	if result.status!="READY": close();return false
	for key in _samples: backend.install_stream(key,_samples[key])
	backend.route_output(_graph.bus_name(bus))
	_main.native_sound_event.connect(_on_event)
	return true
func install_sample(key: String,stream: AudioStream) -> bool:
	if _closed or not is_instance_valid(backend):return false
	if backend.install_stream(key,stream).status!="READY":return false
	_samples[key]=stream
	return true
func _load_sample(_key: String,_source_path: String) -> Dictionary:
	# No arbitrary filesystem/network fallback: admitted samples only.
	return {"status":"NOT_READY"}
func _on_event(kind: String, data: Dictionary) -> void:
	if _closed: return
	if kind=="native_attack_audio_queued":
		# Already passed Main's 30ms, jitter and serial gates. Never draw RNG twice.
		var entry: Dictionary={"key":str(data.key),"vol":float(data.gain),"rate":float(data.rate),"character":data.character}
		if data.priority: entry.pri=1;_state.queue.push_front(entry)
		else: _state.queue.append(entry)
		_received+=1
	elif kind=="native_skill_sample_requested":
		if not _samples.has(str(data.key)): _rejected+=1;return
		_state.queue.append({"key":str(data.key),"vol":float(data.gain),"rate":float(data.rate),"pri":1,"character":data.character})
		_received+=1
func flush(settings: Dictionary, character: int, paused: bool) -> void:
	_ready=settings.get("ready")==true
	if not _ready or paused:
		_state.queue.clear()
		backend.stop_all("source_lost" if not _ready else "paused")
		return
	_gain=float(settings.sfx_gain)
	_mix.mbus() # OPT live value; source sample gain and mbus both apply it.
	var valid: Array=[]
	for entry in _state.queue:
		if entry.character==character: valid.append(entry)
	_state.queue=valid
	_last=QUEUE.flush(_state,_mobile,func() -> float: return 0.0,
		func() -> int: return backend.snapshot().active.size(),backend.dispatch)
func snapshot() -> Dictionary:
	var result: Dictionary=backend.snapshot() if is_instance_valid(backend) else {"active":[],"starts":0,"ends":0}
	result.merge({"scope":"DEMO11_COMBAT_SND_CONSUMER","queued":_state.queue.size(),"received":_received,
		"rejected":_rejected,"last_flush":_last.duplicate(true),"closed":_closed,"mix":_mix.snapshot() if _mix!=null else {},
		"graph":_graph.snapshot() if _graph!=null else {},"subjective_sound_equivalence_verified":false},true)
	return result
func close() -> void:
	if _closed:return
	_closed=true
	if is_instance_valid(_main) and _main.native_sound_event.is_connected(_on_event): _main.native_sound_event.disconnect(_on_event)
	_state.queue.clear()
	if is_instance_valid(backend): backend.free()
	if _mix!=null: _mix.dispose()
	_samples.clear()
func _exit_tree() -> void: close()
