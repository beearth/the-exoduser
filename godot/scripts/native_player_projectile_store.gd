extends RefCounted
## Current source game.html _mk/_reset/_get/_recyclePProj, not a flight renderer.
## Dictionary-backed Set keys and packet fields retain identity across reuse.
class SourceUndefined extends RefCounted:
	pass

class Packet extends RefCounted:
	var fields: Dictionary
	var phase: String = "borrowed"
	var store_id: int

const FREE_LIMIT: int = 120
var _undefined: RefCounted = SourceUndefined.new()
var _world: WeakRef
var _main: WeakRef
var _configured: bool = false
var _free: Array = []
var _issued: Dictionary = {}
var _live: Array = []
var _last_error: String = ""
var _created: int = 0
var _reused: int = 0
var _returned: int = 0
var _dropped: int = 0
# Generated from the exact current source statements, not merged defaults.
var _fresh_defaults: Dictionary = {"x":0,"y":0,"vx":0,"vy":0,"dmg":0,"el":0,"r":4,"spd":0,"alive":true,"owner":"p","maxDist":0,"dist":0,"stagger":0,"kb":0,"pierce":0,"pierceMax":0,"normalBow":false,"ghostXbow":false,"needle":false,"magic":false,"arcMissile":false,"_parryMagicShot":false,"_arcLock":0,"_maxBounce":0,"fireball":false,"explR":0,"explDmg":0,"lightning":false,"chainMax":0,"chainR":0,"_chainCount":0,"maliceHunt":false,"mhBlade":false,"mhFused":false,"mhPlague":false,"_mhMaxPierce":0,"ltnChaser":false,"plagueBlade":false,"plagueHoming":false,"_plagueLv":0,"_plagueHit":0,"_plagueMax":0,"bladeOrb":false,"_orbAng":0,"_orbEmitT":0,"_orbSlv":0,"_orbDmg":0,"bladeShard":false,"iceBlade":false,"_iceAng":0,"_iceT":0,"burstBolt":false,"burstExpR":0,"bleed":false,"poison":false,"freeze":false,"burn":false,"shock":false,"slow":false,"bomb":false,"bombR":0,"bombAtk":0,"mine":false,"trap":false,"web":false,"poisonZone":false,"dimRift":false,"omniHoming":false,"ebHoming":false,"home":false,"split":false,"splitDone":false,"_gwStk":0,"_pierced":0,"_hitSet":{},"_plagueTargets":null,"_lastPlagueE":null,"knockback":0,"kbAng":0,"col":null,"img":null,"imgKey":null,"sz":1,"rot":0,"rotSpd":0,"t":0,"maxT":0,"explosive":false,"_trail":null,"_trH":0,"_trLen":0,"sfxHit":null,"sfxSpawn":null,"_extraData":null,"_aoeR":0,"_aoeDmg":0}
var _reset_prefix: Dictionary = {"dmg":0,"vy":0,"vx":0,"y":0,"x":0,"el":0,"r":4,"spd":0,"alive":true,"owner":"p","maxDist":0,"dist":0,"stagger":0,"kb":0,"kbMult":_undefined,"pierce":0,"pierceMax":0,"needle":false,"ghostXbow":false,"normalBow":false,"_parryMagicShot":false,"arcMissile":false,"magic":false,"_arcLock":0,"_maxBounce":0,"fireball":false,"fireBeamProj":false,"energyShot":false,"explR":0,"explDmg":0,"mhPlague":false,"mhFused":false,"mhBlade":false,"maliceHunt":false,"lightning":false,"_mhMaxPierce":0,"ltnChaser":false,"venomBlade":false,"_venomPool":0,"plagueHoming":false,"plagueBlade":false,"_plagueMax":0,"_plagueHit":0,"_plagueLv":0,"bladeOrb":false,"_orbDmg":0,"_orbSlv":0,"_orbEmitT":0,"_orbAng":0,"iceBlade":false,"bladeShard":false,"_iceT":0,"_iceAng":0,"burstBolt":false,"burstExpR":0,"slow":false,"shock":false,"burn":false,"freeze":false,"poison":false,"bleed":false,"blueBean":false,"_aoeR":0,"_aoeDmg":0,"bomb":false,"bombAtk":0,"bombR":0,"dimRift":false,"poisonZone":false,"web":false,"trap":false,"mine":false,"splitDone":false,"split":false,"home":false,"ebHoming":false,"omniHoming":false,"_pierced":0,"_gwStk":0,"_lastPlagueE":null,"_plagueTargets":null}
var _reset_suffix: Dictionary = {"kbAng":0,"knockback":0,"imgKey":null,"img":null,"col":null,"sz":1,"maxT":0,"t":0,"rotSpd":0,"rot":0,"explosive":false,"_trail":null,"_trH":0,"_trLen":0,"_fromTurret":false,"_extraData":null,"sfxSpawn":null,"sfxHit":null,"chainMax":0,"chainR":0,"_chainCount":0,"_aoeDmg":0,"_aoeR":0,"bounces":0,"_bounceCool":0}

func configure(main: Node, world: Node) -> bool:
	if _configured or not is_instance_valid(main) or not is_instance_valid(world):
		return false
	_main = weakref(main)
	_world = weakref(world)
	_configured = true
	_last_error = _owner_error(main, false)
	if not _last_error.is_empty():
		_configured = false
	return _configured

func _owner_error(caller: Node, mutating: bool = true) -> String:
	var main: Variant = _main.get_ref() if _main != null else null
	var world: Variant = _world.get_ref() if _world != null else null
	if not _configured or not is_instance_valid(main) or not is_instance_valid(world) or caller != main:
		return "actual_packet_owner_unbound_or_foreign"
	if main.is_queued_for_deletion() or world.is_queued_for_deletion() or not main.is_inside_tree() or not world.is_inside_tree() or main.get_tree() != world.get_tree() or main.get("world") != world or world.get_parent() != main:
		return "actual_packet_world_lifecycle_mismatch"
	var player: Variant = main.get("player")
	var source: Variant = main.get("source_state")
	var providers: Variant = main.get("source_providers")
	if not is_instance_valid(player) or player.is_queued_for_deletion() or player.get_parent() != main or world.get("player") != player or not is_instance_valid(source) or not source.is_native_new_run_state_ready() or source.get_native_new_run_player() != player or source.get_native_new_run_world() != world:
		return "actual_packet_source_owner_not_ready"
	if not is_instance_valid(providers) or not providers.is_native_source_providers_ready() or providers.get_native_source_player() != player or providers.get_native_source_world() != world:
		return "actual_packet_provider_owner_not_ready"
	if mutating and world.get_tree().paused:
		return "actual_packet_world_paused"
	return ""

func _refuse(reason: String, packet: Variant = null) -> Dictionary:
	_last_error = reason
	return {"ready": false, "reason": reason, "packet": packet}

func borrow(caller: Node) -> Dictionary:
	var error: String = _owner_error(caller)
	if not error.is_empty():
		return _refuse(error)
	var packet: Packet
	var reused: bool = not _free.is_empty()
	if reused:
		packet = _free.pop_back()
		packet.phase = "borrowed"
	else:
		packet = Packet.new()
		packet.fields = _fresh_defaults.duplicate(true)
		packet.store_id = get_instance_id()
		_created += 1
	_issued[packet.get_instance_id()] = packet
	if reused:
		# Preserve source prefix -> affix read -> suffix -> passive read order.
		for key in _reset_prefix:
			packet.fields[key] = _reset_prefix[key]
		var hit_set: Variant = packet.fields.get("_hitSet")
		if not hit_set is Dictionary:
			packet.phase = "reset_refused"
			return _refuse("source_reset_hit_set_missing_after_prefix", packet)
		hit_set.clear()
		var affix: Variant = caller.read_native_player_projectile_pierce_flat()
		if not affix is Dictionary or affix.get("status") != "READY" or not _finite_number(affix.get("value")):
			packet.phase = "reset_refused"
			return _refuse("current_pierce_flat_not_ready_after_reset_prefix", packet)
		packet.fields._pierceRate = 50.0 + float(affix.value)
		for key in _reset_suffix:
			packet.fields[key] = _reset_suffix[key]
		var passive: Variant = caller.read_native_player_projectile_pierce_passive()
		if not passive is Dictionary or passive.get("status") != "READY" or not _finite_number(passive.get("value")):
			packet.phase = "reset_refused"
			return _refuse("current_pierce_passive_not_ready_after_reset_suffix", packet)
		var level: float = float(passive.value)
		if level > 0.0:
			packet.fields.pierce = minf(0.95, level * 0.05)
			packet.fields.pierceMax = passive.value
		_reused += 1
	_last_error = ""
	return {"ready": true, "reason": "", "packet": packet, "fields": packet.fields, "reused": reused}

func publish(caller: Node, packet: RefCounted) -> Dictionary:
	var error: String = _packet_error(caller, packet, ["borrowed"])
	if not error.is_empty():
		return _refuse(error)
	_live.append(packet)
	packet.phase = "live"
	_last_error = ""
	return {"ready": true, "registry_index": _live.size() - 1}

func retire(caller: Node, packet: RefCounted, recycle: bool) -> Dictionary:
	var error: String = _packet_error(caller, packet, ["borrowed", "live"])
	if not error.is_empty():
		return _refuse(error)
	var hit_set: Variant = packet.fields.get("_hitSet")
	if recycle and hit_set != null and not hit_set is Dictionary:
		return _refuse("recycle_hit_set_shape_unsupported")
	if packet.phase == "live":
		_live.erase(packet)
	_issued.erase(packet.get_instance_id())
	if recycle:
		# Source recycle checks existence; reset still requires the owned Set.
		# No Dictionary.clear(): unknown keys (including _mwMul) survive.
		if hit_set is Dictionary:
			hit_set.clear()
		packet.fields._bladeEchoPath = null
		packet.fields._bladeEchoCast = 0
		_returned += 1
		if _free.size() < FREE_LIMIT:
			packet.phase = "free"
			_free.append(packet)
		else:
			packet.phase = "retired"
			_dropped += 1
	else:
		# Range/wall source branches can remove without _recyclePProj.
		packet.phase = "retired"
		_dropped += 1
	_last_error = ""
	return {"ready": true, "recycled": recycle and packet.phase == "free"}

func _packet_error(caller: Node, packet: RefCounted, phases: Array) -> String:
	var error: String = _owner_error(caller)
	if not error.is_empty():
		return error
	if not packet is Packet or packet.store_id != get_instance_id() or _issued.get(packet.get_instance_id()) != packet or packet.phase not in phases:
		return "packet_not_issued_here_or_wrong_phase"
	return ""

func read_live(caller: Node) -> Variant:
	var error: String = _owner_error(caller, false)
	return _live if error.is_empty() else null

func is_source_undefined(value: Variant) -> bool:
	return is_same(value, _undefined)

func _finite_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value))

func get_snapshot() -> Dictionary:
	var main: Variant = _main.get_ref() if _main != null else null
	var error: String = _owner_error(main, false)
	var refused: int = 0
	for packet in _issued.values():
		if packet.phase == "reset_refused":
			refused += 1
	return {"schema": "exoduser.native.player-projectile-store.v1",
		"ready": error.is_empty(), "reason": error, "last_error": _last_error,
		"scope": "actual_world_packet_pool_registry_only", "free_limit": FREE_LIMIT,
		"free": _free.size(), "issued": _issued.size(), "live": _live.size(),
		"reset_refused": refused, "created": _created, "reused": _reused,
		"returned": _returned, "dropped": _dropped,
		"flight_bound": false, "damage_bound": false, "visual_bound": false,
		"actual_fireball_delivery_bound": false, "latest_full_game": false}
