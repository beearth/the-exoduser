extends RefCounted
## parry-lesson.js:32,489–507,552–611,646–683.
## 단계별 PC 소비자 lease. 기본/0/8 및 PC 전투 식/피해 쓰기는 소유하지 않는다.
const Consumer := preload("res://scripts/native_demo11_lesson_step_consumer.gd")
const REASONS := {
	1: "physical_projectile_reflect_unported", 2: "volley_mixed_magic_projectiles_unported",
	3: "volley_physical_projectiles_unported", 4: "chain_movement_unported",
	5: "lightning_dash_unported", 6: "rage_gauge_unported", 7: "rage_burst_unported"}
var results: Dictionary = {}
var current := -1
var focus_ticks := 0
var retry_ticks := 0
var _bindings: Dictionary = {}
var _world: WeakRef
var _owner: WeakRef
var _lease := false
var _wait := 0

func configure(world: Node) -> void:
	_world = weakref(world)

func bind_consumer(number: int, consumer: Node) -> bool:
	if number < 1 or number > 7 or not consumer is Consumer or not _live(consumer):
		return false
	if not consumer.supports_lesson_step(number):
		return false
	if current == number and _lease:
		return false
	_bindings[number] = weakref(consumer)
	return true

func _live(node: Node) -> bool:
	var world: Node = _world.get_ref() if _world != null else null
	return is_instance_valid(node) and node.is_inside_tree() and not node.is_queued_for_deletion() \
		and is_instance_valid(world) and world.is_inside_tree() and world.is_ancestor_of(node)

func _consumer() -> Node:
	var owner: Node = _owner.get_ref() if _owner != null else null
	return owner if _live(owner) else null

func enter(number: int, context: Dictionary) -> void:
	leave("advance")
	current = number
	_wait = 90 # 보류도 체크/성공 연출 없이 독립적으로 다음 단계로 인계한다.
	focus_ticks = 0
	retry_ticks = 0
	var ref: WeakRef = _bindings.get(number)
	var owner: Node = ref.get_ref() if ref != null else null
	if not _live(owner):
		results[number] = {"status": "NOT_READY", "reason": REASONS.get(number, "step_out_of_range")}
		return
	_owner = weakref(owner)
	_lease = true # begin 거부/부분 실패도 restore 대상이다.
	var admission: Dictionary = owner.begin_lesson_step(number, context)
	if admission.get("ready") != true:
		results[number] = {"status": "NOT_READY", "reason": str(admission.get("reason", "pc_begin_rejected"))}
		leave("begin_rejected")
		return
	focus_ticks = 150 if number == 7 else 0 # 원문 505/525–531.
	results[number] = {"status": "PRACTICE", "reason": ""}

func tick() -> String:
	if not results.has(current):
		return ""
	if results[current].status in ["COMPLETE", "SKIPPED"]:
		return ""
	if results[current].status == "NOT_READY":
		_wait -= 1
		return "defer" if _wait <= 0 else ""
	var owner := _consumer()
	if owner == null:
		results[current] = {"status": "NOT_READY", "reason": "pc_consumer_lost"}
		leave("owner_lost")
		_wait = 90
		return ""
	if retry_ticks > 0:
		retry_ticks -= 1
		if retry_ticks == 0:
			if not owner.retry_lesson_step(current):
				results[current] = {"status": "NOT_READY", "reason": "pc_restore_rejected"}
				leave("retry_rejected")
				_wait = 90
		return ""
	if focus_ticks > 0:
		focus_ticks -= 1
		return ""
	var packet: Dictionary = owner.advance_lesson_step(current)
	if packet.get("ready") != true:
		results[current] = {"status": "NOT_READY", "reason": str(packet.get("reason", "pc_tick_rejected"))}
		leave("tick_rejected")
		_wait = 90
	elif packet.get("failed") == true:
		retry_ticks = 60 # 원문 458/590; HP/pose/탄 정리는 PC retry/restore owner.
		results[current]["failures"] = int(results[current].get("failures", 0)) + 1
		results[current]["failure_kind"] = str(packet.get("failure_kind", "retry"))
	elif packet.get("completed") == true:
		# completed는 신뢰된 PC 소비자의 실제 증인 계약. ready/ack만으로 성공하지 않는다.
		results[current]["status"] = "COMPLETE"
		leave("complete")
		return "complete"
	return ""

func leave(reason: String) -> void:
	if _lease:
		_lease = false # 재진입/중복 skip/exit에도 단 한 번.
		var owner: Node = _owner.get_ref() if _owner != null else null
		if is_instance_valid(owner) and not owner.is_queued_for_deletion():
			owner.restore_lesson_step(current, reason)
	_owner = null
	focus_ticks = 0
	retry_ticks = 0

func skip_remaining() -> void:
	leave("skip")
	for number in range(1, 8):
		if not results.has(number):
			results[number] = {"status": "SKIPPED", "reason": "user_skip"}
		elif results[number].status != "COMPLETE":
			results[number]["skipped"] = true
			if results[number].status == "PRACTICE":
				results[number]["status"] = "SKIPPED"
				results[number]["reason"] = "user_skip"

func reset() -> void:
	leave("restart")
	results.clear()
	current = -1

func snapshot() -> Dictionary:
	return {"step": current, "results": results.duplicate(true), "focus_ticks": focus_ticks,
		"retry_ticks": retry_ticks, "lease": _lease, "completion_authority": "bound_pc_consumer"}
