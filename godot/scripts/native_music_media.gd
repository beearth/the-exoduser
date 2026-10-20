extends RefCounted
## DEMO11-41 native adapter for the unchanged SND-06 media/timer contract.
var host: Node
var bus := ""
var source_root := ""
var audios: Array=[]
var timers: Dictionary={}
var listeners: Dictionary={}
var _serial := 0
var closed := false
var suspended := false
var _resume: Array=[]
func _init(owner: Node,output: String,root_path: String) -> void:
	host=owner;bus=output;source_root=root_path
func create_audio(src: String) -> RefCounted:
	var a=NativeAudio.new(self,src);audios.append(a);return a
func set_interval(callback: Callable,ms: int) -> int: return _timer(callback,ms,false)
func set_timeout(callback: Callable,ms: int) -> int: return _timer(callback,ms,true)
func _timer(callback: Callable,ms: int,once: bool) -> int:
	if closed:return -1
	_serial+=1
	var id: int=_serial
	var timer:=Timer.new();timer.one_shot=once;timer.ignore_time_scale=true
	timer.process_mode=Node.PROCESS_MODE_ALWAYS;timer.wait_time=maxf(0.001,ms/1000.0)
	host.add_child(timer);timers[id]={"timer":timer,"callback":callback,"once":once}
	timer.timeout.connect(_fire.bind(id));timer.start();timer.paused=suspended
	return id
func _fire(id: int) -> void:
	if not timers.has(id):return
	var entry: Dictionary=timers[id]
	if entry.once:clear_interval(id)
	if entry.callback.is_valid():entry.callback.call()
func clear_interval(id: Variant) -> void:
	if not timers.has(id):return
	var timer: Timer=timers[id].timer;timers.erase(id)
	if is_instance_valid(timer):timer.stop();timer.queue_free()
func add_listener(event: String,callback: Callable,_passive: bool) -> void: listeners[event]=callback
func remove_listener(event: String,_callback: Callable) -> void: listeners.erase(event)
func set_legacy_volume(_value: float) -> void: pass # No second legacy player exists.
func interact() -> void:
	for callback in listeners.values().duplicate():
		if callback.is_valid():callback.call()
func suspend(value: bool) -> void:
	if value==suspended:return
	suspended=value
	if value:
		_resume.clear()
		for a in audios:
			if a.playing():a.pause();_resume.append(a)
	else:
		for a in _resume:
			if audios.has(a):a.play(Callable(),Callable())
		_resume.clear()
	for entry in timers.values():entry.timer.paused=value
func release_audio(a: RefCounted) -> void:
	_resume.erase(a);audios.erase(a);a.release()
func dispose() -> void:
	if closed:return
	closed=true
	for id in timers.keys():clear_interval(id)
	listeners.clear();_resume.clear()
	for a in audios.duplicate():release_audio(a)
func snapshot() -> Dictionary:
	var active: Array=[]
	for a in audios:active.append({"src":a.src,"playing":a.playing(),"volume":a.volume,"position":a.current_time,"loop":a.loop,"bus":a.output})
	return {"audios":active,"timers":timers.size(),"listeners":listeners.size(),"suspended":suspended,"closed":closed}

class NativeAudio extends RefCounted:
	var driver: RefCounted
	var src := ""
	var output := ""
	var preload_mode := "auto"
	var on_ended := Callable()
	var on_error := Callable()
	var node: AudioStreamPlayer
	var rate := 1.0
	var volume := 1.0:
		set(value):
			volume=value
			if is_instance_valid(node):node.volume_linear=value
	var current_time := 0.0:
		get:return node.get_playback_position() if playing() else current_time
		set(value):
			current_time=value
			if playing():node.seek(value)
	var loop := false:
		set(value):
			loop=value
			if is_instance_valid(node) and node.stream is AudioStreamMP3:node.stream.loop=value
	func _init(media: RefCounted,path: String) -> void: driver=media;src=path;output=media.bus
	func playing() -> bool: return is_instance_valid(node) and node.playing
	func play(success: Callable,reject: Callable) -> void:
		if driver==null or driver.closed:return
		if driver.suspended:
			if not driver._resume.has(self):driver._resume.append(self)
			return
		if not is_instance_valid(node):
			var stream: AudioStream
			var path: String=src if src.begins_with("res://") else driver.source_root.path_join(src)
			if FileAccess.file_exists(path):
				match path.get_extension().to_lower():
					"mp3":
						var mp3:=AudioStreamMP3.new();mp3.data=FileAccess.get_file_as_bytes(path);mp3.loop=loop;stream=mp3
					"wav":stream=AudioStreamWAV.load_from_file(path)
					"ogg":stream=AudioStreamOggVorbis.load_from_file(path)
			if stream==null or stream.get_length()<=0:
				driver.set_timeout(_failed.bind(reject),1);return
			node=AudioStreamPlayer.new();node.process_mode=Node.PROCESS_MODE_ALWAYS
			node.stream=stream;node.bus=output;driver.host.add_child(node)
			node.finished.connect(_ended)
		node.volume_linear=volume;node.pitch_scale=rate;node.play(current_time)
		if node.playing:
			if success.is_valid():driver.set_timeout(success,1)
		elif reject.is_valid():driver.set_timeout(reject,1)
	func _failed(reject: Callable) -> void:
		if on_error.is_valid():on_error.call()
		if reject.is_valid():reject.call()
		if driver!=null:driver.release_audio(self)
	func _ended() -> void:
		current_time=0
		if on_ended.is_valid():on_ended.call()
	func pause() -> void:
		if driver!=null:driver._resume.erase(self) # explicit stop cancels deferred resume
		if playing():current_time=node.get_playback_position();node.stop()
	func remove_src() -> void: src=""
	func load() -> void:
		if src.is_empty() and driver!=null:driver.release_audio(self)
	func release() -> void:
		on_ended=Callable();on_error=Callable()
		if is_instance_valid(node):node.stop();node.stream=null;node.queue_free()
		node=null;driver=null
