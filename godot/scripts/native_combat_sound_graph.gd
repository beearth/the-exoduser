extends RefCounted
## DEMO11-40 AudioServer routing adapter for SND-08. DSP nodes are explicit bypasses:
## WebAudio biquad Q / compressor knee have no verified native equivalent.
var _nodes: Dictionary = {}
var _serial := 0
var _prefix := ""
func _init() -> void: _prefix="DEMO11Sound-%s-" % get_instance_id()
func create(kind: String) -> int:
	_serial+=1
	var bus: String=_prefix+str(_serial)
	AudioServer.add_bus()
	AudioServer.set_bus_name(AudioServer.bus_count-1,bus)
	_nodes[_serial]={"bus":bus,"kind":kind,"params":{},"to":0}
	return _serial
func destination() -> int: return 0
func set_param(id: int, param: String, value: Variant) -> void:
	_nodes[id].params[param]=value
	if param=="gain" and _nodes[id].kind=="gain":
		var index: int=AudioServer.get_bus_index(_nodes[id].bus)
		AudioServer.set_bus_volume_linear(index,float(value))
		AudioServer.set_bus_mute(index,float(value)==0.0)
func connect_nodes(a: int,b: int,_param: String="") -> void: _nodes[a].to=b
func commit() -> void:
	# Godot can send only to buses on its left. Build destination-first order.
	var ids: Array=_nodes.keys()
	ids.sort_custom(func(a: int,b: int) -> bool: return _depth(a)<_depth(b))
	for id in ids: AudioServer.move_bus(AudioServer.get_bus_index(_nodes[id].bus),-1)
	for id in ids:
		AudioServer.set_bus_send(AudioServer.get_bus_index(_nodes[id].bus),bus_name(_nodes[id].to))
func _depth(id: int) -> int: return 0 if id==0 else 1+_depth(_nodes[id].to)
func bus_name(id: int) -> String: return "Master" if id==0 else _nodes[id].bus
func disconnect_node(id: int) -> void:
	if not _nodes.has(id): return
	var index: int=AudioServer.get_bus_index(_nodes[id].bus)
	if index>0: AudioServer.remove_bus(index)
	_nodes.erase(id)
func snapshot() -> Dictionary:
	return {"nodes":_nodes.duplicate(true),"DSP":"BYPASS_UNVERIFIED","native_DSP_parity_verified":false}
