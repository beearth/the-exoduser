extends RefCounted
## Per-feature descriptor. No shared catalog edit needed.
const Potion = preload("res://scripts/native_potion_recovery.gd")

func register_feature(registry: RefCounted, main: Node) -> bool:
	var potion: RefCounted = Potion.new()
	if not registry.register_physics_entry("demo11.auto_hp", 100, potion.advance_native):
		return false
	# Existing authority validates Main.source_potion identity; retain that contract.
	main.source_potion = potion
	return true
