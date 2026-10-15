extends Node2D
## Shield Q burst ring caller: the missing contact between the actual BurstRing and its display.
## Ring producer (read-only): combat_qe_runtime._spawn_sb_burst -> projectile_sink.spawn_burst(ring)
##   (enter_shield_block / release_shield; G._sbBurst, game.html @33687/@34386/@34409). The ring is
##   advanced/expired only by the owner's native clock (runtime.tick -> BurstRing.advance, 36556-36563).
## Display (consumed, not duplicated): ROOT shield_burst_visual/producer.gd (drawP @59935-60024): its
##   own configure(ring_provider, {now_ms, rand, release}) + request_render() + _draw.
## Existing callers: none. spawn_burst is implemented only by test sinks; native_player_combat_qe and
##   native_combat_qe_adapter keep _active_burst private with no getter. This node is a projectile_sink
##   (spawn_burst arity 1, adapter SINK_METHODS) that forwards to an optional downstream sink once.
## Providers: release = the ring's own `release` field. now_ms (peace) and rand (render-time Math.random)
##   must come from ENGINE; when absent the ROOT node reports MISSING_PROVIDER and draws nothing. No local
##   clock/RNG here. Ring x/y/r/max_r/alive and player P/E/Q state, damage, poise are never written.
## Coordinates: the ROOT node draws in world space -> attach this node under the world canvas, identity.

const BurstVisual = preload("res://port_modules/shield_burst_visual/producer.gd")

var view: Node2D
var _ring: Object = null
var _owner_ref: WeakRef
var _downstream: Object = null
var terminated := false
var received := 0
var status := {}

## owner: the player node whose runtime emits the ring. providers: {now_ms: Callable, rand: Callable}
## from ENGINE. downstream_sink: ENGINE's existing projectile_sink (receives the same ring once).
func bind(owner: Node, providers: Dictionary = {}, downstream_sink: Object = null) -> void:
	_owner_ref = weakref(owner)
	_downstream = downstream_sink
	view = BurstVisual.new()
	add_child(view)
	var visual := {"release": func(ring): return bool(ring.get("release"))}
	for k in ["now_ms", "rand"]:
		if providers.get(k) is Callable and (providers[k] as Callable).is_valid():
			visual[k] = providers[k]
	view.configure(func(): return _ring, visual)
	status = {"bound": true, "providers": visual.keys()}

## projectile_sink seam (source G._sbBurst is a single slot: a new burst replaces the old one).
func spawn_burst(ring) -> void:
	received += 1
	_ring = ring
	if _downstream != null and _downstream.has_method("spawn_burst"):
		_downstream.spawn_burst(ring)

func current_ring() -> Object:
	return _ring

## World render phase, once per source frame after the owner's native tick.
func update() -> Dictionary:
	if terminated:
		return {"terminated": true}
	var owner: Node = _owner_ref.get_ref() if _owner_ref != null else null
	if owner == null or not is_instance_valid(owner):
		terminate()
		return {"terminated": true, "reason": "owner freed"}
	var drawn: bool = view.request_render()
	var st: String = view.last_status
	if st == BurstVisual.ST_EXPIRED:
		_ring = null                      # ring ended: release the reference, node kept for the next burst
		view.request_render()             # -> NO_BURST, empty command list
	status = {"status": st, "drawn": drawn, "commands": view.commands().size(), "has_ring": _ring != null}
	return status

func terminate() -> void:
	if terminated:
		return
	terminated = true
	_ring = null
	_downstream = null
	if is_instance_valid(view):
		view.request_render()             # ring provider now null -> nothing drawn
	queue_free()
