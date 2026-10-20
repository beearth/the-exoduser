extends RefCounted
## Actual common registry admission; carrier and PC contact kernel unchanged.
static func fire(actor: Node,origin: Vector2,profile: Dictionary) -> Node2D:
	var reference: Variant=actor.world._native_natural_enemy_base
	var owner: Node=reference.get_ref() if reference is WeakRef else null
	if not is_instance_valid(owner):return null
	return owner.emit_profile_projectile(actor,origin,profile)
