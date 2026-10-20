extends RefCounted
## TI-00: read the existing source State INV without creating another owner.
## game.html:15176 canonical slots; 16174-16179 INV fields (2026-10-20 main).
## Native admission below is an adapter boundary, not an original JS validator.
## No item schema, mutation, cache, layout, startup, RNG, input or save operation.

const SOURCE_STATE = preload("res://scripts/native_source_new_run_state.gd")
const EQUIPMENT_READER = preload("res://port_modules/equipment_affix_reader/producer.gd")

var _source_state: WeakRef

## Binding is structural: an uninitialized exact State can bind and read null.
## A failed replacement deliberately removes the previous binding.
func bind_source_state(owner: Node) -> bool:
	_source_state = null
	if not _is_source_state(owner):
		return false
	_source_state = weakref(owner)
	return true

## Return the current owner's Dictionary itself, never a copy or old success.
## The State getter decides its own lifecycle/pre-Tree readiness.
func read_current_inventory() -> Variant:
	if _source_state == null:
		return null
	var owner: Variant = _source_state.get_ref()
	if not _is_source_state(owner):
		return null
	var inventory: Variant = owner.read_current_inventory()
	if not inventory is Dictionary:
		return null
	if not inventory.get("bag") is Array \
			or not inventory.get("equipped") is Dictionary \
			or not inventory.has("selected") \
			or not inventory.get("ossCollect") is Dictionary:
		return null
	var equipped: Dictionary = inventory["equipped"]
	for slot in EQUIPMENT_READER.SLOT_NAMES:
		if not equipped.has(slot):
			return null
	return inventory

## Canonical source order, independent of the live Dictionary insertion order.
func source_slot_names() -> Array:
	return EQUIPMENT_READER.SLOT_NAMES.duplicate()

static func _is_source_state(owner: Variant) -> bool:
	return is_instance_valid(owner) and owner is Node \
		and not owner.is_queued_for_deletion() \
		and owner.get_script() == SOURCE_STATE \
		and owner.has_method("read_current_inventory")
