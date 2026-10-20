extends RefCounted
## Prototype: boot-only discovery, frozen ordered deferred physics-entry callbacks.
const FEATURE_DIR = "res://scripts/native_features"
var _entries: Array = []
var _callbacks: Array[Callable] = []
var _sealed := false
var ready := false

func _init(main: Node = null) -> void:
	if main == null:
		return # test construction; caller registers then seals
	var directory := DirAccess.open(FEATURE_DIR)
	if directory == null:
		push_error("Feature directory unavailable")
		return
	var files := directory.get_files() # boot only; exported .gd.remap supported
	files.sort()
	for file in files:
		var path: String = file.trim_suffix(".remap")
		if not path.ends_with(".gd"):
			continue
		var script = load(FEATURE_DIR.path_join(path))
		if script == null or not script.new().register_feature(self, main):
			push_error("Feature registration rejected: " + path)
			return
	ready = seal()

func register_physics_entry(id: String, order: int, callback: Callable) -> bool:
	if _sealed or id.is_empty() or not callback.is_valid():
		return false
	for entry in _entries:
		if entry.id == id or entry.order == order:
			return false # ambiguous order fails at boot, never silently tie-break
	_entries.append({"id":id, "order":order, "callback":callback})
	return true

func seal() -> bool:
	if _sealed:
		return false
	_entries.sort_custom(func(a: Dictionary, b: Dictionary) -> bool: return a.order < b.order)
	for entry in _entries:
		_callbacks.append(entry.callback)
	_entries.clear()
	_sealed = true
	ready = true
	return true

func queue_physics_entry(main: Node, source_ticks: float, serial: int) -> void:
	if not ready:
		return
	for callback in _callbacks:
		callback.call_deferred(main, source_ticks, serial)
