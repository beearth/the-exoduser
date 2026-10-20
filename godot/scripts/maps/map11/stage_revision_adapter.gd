extends RefCounted
## Consumer-owned lifecycle gate, never installs into Main/State itself.
## Bind once between ticks. Hot predicates allocate no lists or reflection metadata.
const Provider = preload("res://scripts/maps/map11/stage_provider.gd")
var _provider: RefCounted
var _owner: WeakRef
var _guard: Callable
var _instance: String = ""
var _revision: int = 0
var _world := Transform2D.IDENTITY
var _inverse := Transform2D.IDENTITY
var _bound: bool = false

func bind_context(provider: RefCounted, owner: Node, instance_id: String, revision: int, current_guard: Callable, world_transform: Transform2D = Transform2D.IDENTITY) -> bool:
	unbind()
	if not provider is Provider or not is_instance_valid(owner) or not current_guard.is_valid(): return false
	if current_guard.get_object() != owner or not owner.is_inside_tree(): return false
	# Only rigid world transforms: query radii/attack metrics never silently scale.
	if not world_transform.origin.is_finite() or not world_transform.x.is_finite() or not world_transform.y.is_finite(): return false
	if not is_equal_approx(world_transform.x.length_squared(),1) or not is_equal_approx(world_transform.y.length_squared(),1) or not is_zero_approx(world_transform.x.dot(world_transform.y)) or world_transform.determinant() < 0: return false
	if not provider.is_current(instance_id,revision): return false
	_provider = provider
	_owner = weakref(owner)
	_guard = current_guard
	_instance = instance_id
	_revision = revision
	_world = world_transform
	_inverse = _world.affine_inverse()
	_bound = true
	if not runtime_ready():
		unbind()
		return false
	return true
func unbind() -> void:
	_bound = false
	_provider = null
	_owner = null
	_guard = Callable()
func runtime_ready() -> bool:
	if not _bound or _owner == null or not is_instance_valid(_owner.get_ref()) or not _guard.is_valid(): return false
	if not _owner.get_ref().is_inside_tree(): return false
	if not _provider.is_current(_instance,_revision): return false
	var current: Variant = _guard.call(_instance,_revision)
	return current is bool and current
func status() -> String: return "OK" if runtime_ready() else "NOT_READY"
func can_move(point: Vector2, r: float) -> bool:
	return runtime_ready() and _provider.can_move(_inverse*point,r)
func is_blocked(point: Vector2, r: float = 0) -> bool: return not can_move(point,r)
func line_of_sight(a: Vector2, b: Vector2) -> bool:
	return runtime_ready() and _provider.line_of_sight(_inverse*a,_inverse*b)
func region_at(point: Vector2) -> int:
	return _provider.region_at(_inverse*point) if runtime_ready() else -1
func anchor(id: String, role: String) -> Dictionary:
	if not runtime_ready(): return {"status":"NOT_READY"}
	var result: Dictionary = _provider.anchor(id,role)
	if result.status == "OK":
		result.anchor.position = _world*result.anchor.position
		result.anchor.facing += _world.get_rotation()
	return result
func legacy_boss_metrics(out: Dictionary) -> bool:
	out.clear()
	if not runtime_ready(): return false
	var metric: Vector3i = _provider.boss_extent()
	out.merge({"mw":metric.x,"mh":metric.y,"T":metric.z,"map_instance_id":_instance,"revision":_revision})
	return true
func sweep_circle(a: Vector2, b: Vector2, r: float, out: Dictionary) -> bool:
	# Caller reuses `out`; true means query executed, not that movement was clear.
	out.clear()
	if not runtime_ready():
		out.status = "NOT_READY"
		return false
	var local_a: Vector2 = _inverse*a
	var local_b: Vector2 = _inverse*b
	var t: float = _provider.sweep_fraction(local_a,local_b,r)
	if t < 0:
		out.status = "INVALID_QUERY"
		return false
	var hit: bool = t < 1.0 or not _provider.can_move(local_b,r)
	var contact: Vector2 = local_a.lerp(local_b,t)
	var distance: float = local_a.distance_to(local_b)
	var safe_t: float = maxf(0,t-0.001/maxf(distance,0.001)) if hit else t
	out.status = "OK"
	out.hit = hit
	out.fraction = t
	out.position = _world*local_a.lerp(local_b,safe_t)
	out.normal = _world.basis_xform(_provider.contact_normal(contact,r)) if hit else Vector2.ZERO
	out.revision = _revision
	return true

func describe() -> Dictionary:
	if _provider == null: return {"content_valid":false,"runtime_ready":false,"status":"NOT_READY"}
	var result: Dictionary = _provider.describe()
	result.runtime_ready = runtime_ready()
	result.status = "OK" if result.runtime_ready else "NOT_READY"
	result.world_transform = _world
	return result
