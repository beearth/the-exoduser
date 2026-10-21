class_name ExoduserNativeEnemyCorpseRevive
extends RefCounted
## PCI-10 (2026-10-21, PC-LIFE-PACK) — 주술사(etype 9) 시체 부활 집행.
##
## 원본 G38944–38958 (updateE, `e.etype===9&&e.s==='idle'` 분기):
##   e.reviveT-=sp; if(e.reviveT<=0){ corpse = _deadPool 순서의 첫 `!ib && etype!==9 &&
##   !_absorbed && dst<150`; 있으면 같은 객체를 alive=true;hp=~~(mhp*.5);eShield=0;
##   eShieldMax=0;s='recover';st2=60;stunned=0;poise=maxPoise;reviveIframes=0 → VFX/텍스트 →
##   e.reviveT=e.reviveCd; 없으면 e.reviveT=60 }.
## 분리: reviveT 감소·호출 시점(caster tick)과 caster의 reviveT/reviveCd 필드는 caster owner(Mac B9)가
## 소유한다. 이 요청은 시체 선택·부활 쓰기와 next_timer(성공=ctx.revive_cd, 없음=60) 반환까지.
## _deadPool: 원본은 G34391에서 2프레임마다 ens 순서로 재구성(!alive&&!_absorbed)한다. 여기서는
## 호출 시점의 실제 world 등록 배열(ens identity) 순서로 같은 조건을 즉시 평가한다 — 직전 ≤1프레임
## 안에 죽은 시체가 원본 스냅샷에는 아직 없을 수 있는 차이(HOLD, Mac clock owner가 필요시 보정).
## RNG 소비 0(원본 분기에도 Math.random 없음; _reviveVFX/addParts 시각 RNG는 Mac 표현 소관).
## 틱 경로 코드 0(요청 이벤트 전용). 목록 생성 API 0.

const MAIN_PATH = "res://scripts/main.gd"
const SCHEMA = "exoduser.godot.enemy-corpse-revive.v1"
const RADIUS = 150.0       # G38948 dst<150
const RETRY_TICKS = 60.0   # G38954 e.reviveT=60

var _main: WeakRef
var _receipts: Dictionary = {}
var _busy := false
var _accepted := 0
var _rejected := 0

func configure(main: Node) -> bool:
	if _main != null or not _live(main) or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return false
	_main = weakref(main)
	return true

func request(owner: Node, caster: Node, ctx: Dictionary) -> Dictionary:
	var request_id: Variant = ctx.get("request_id")
	var receipt := {"schema": SCHEMA, "token": request_id, "accepted": false, "replayed": false, "revived": false,
		"rng_span": {"consumed": 0}, "source_prefix": [], "applied_fields": {}}
	if _busy:
		return _reject(receipt, "REJECTED", "enemy_revive_reentrant")
	if request_id is String and _receipts.has(request_id):
		var previous: Dictionary = _receipts[request_id].duplicate(true)
		previous["replayed"] = true
		return previous
	if not request_id is String or String(request_id).is_empty():
		return _reject(receipt, "REJECTED", "enemy_revive_request_id_required")
	var main: Variant = _ref(_main)
	if not _live(owner) or owner != main or not owner.is_inside_tree():
		return _reject(receipt, "REJECTED", "enemy_revive_foreign_owner")
	var world: Variant = owner.get("world")
	if not _live(world) or not world.has_method("get_enemies"):
		return _reject(receipt, "NOT_READY", "enemy_revive_world_not_ready")
	var registry: Array = world.get_enemies()
	# owner(caster) 부재·비등록·사망·비주술사 → NOT_READY, 타이머/시체 무변이.
	if not _live(caster) or not caster is Node2D or caster.get_parent() != world or not registry.has(caster):
		return _reject(receipt, "NOT_READY", "enemy_revive_caster_not_registered")
	if caster.get("alive") != true:
		return _reject(receipt, "NOT_READY", "enemy_revive_caster_dead")
	if not (caster.get("etype") is int or caster.get("etype") is float) or int(caster.get("etype")) != 9:
		return _reject(receipt, "REJECTED", "enemy_revive_caster_not_etype9")
	if caster.get("state") != null and str(caster.get("state")) != "idle":
		return _reject(receipt, "REJECTED", "enemy_revive_caster_not_idle:G38946")
	var revive_cd: Variant = ctx.get("revive_cd")
	if not (revive_cd is int or revive_cd is float) or not is_finite(float(revive_cd)):
		return _reject(receipt, "REJECTED", "enemy_revive_revive_cd_required")
	_busy = true
	var dead_count := 0
	var selected: Node = null
	var selected_index := -1
	for i in registry.size():
		var oe: Variant = registry[i]
		if not _live(oe) or oe.get("alive") != false or _absorbed(oe):
			continue
		dead_count += 1 # _deadPool 멤버(!alive && !_absorbed)
		if selected != null:
			continue
		var native: Dictionary = _native(oe)
		if native.get("ib") == true:
			continue
		if (oe.get("etype") is int or oe.get("etype") is float) and int(oe.get("etype")) == 9:
			continue
		if not oe is Node2D or (oe as Node2D).global_position.distance_to((caster as Node2D).global_position) >= RADIUS:
			continue
		selected = oe
		selected_index = i
	receipt["pool_revision"] = {"registry_size": registry.size(), "dead_pool_size": dead_count,
		"native_frame": world.get_native_frame() if world.has_method("get_native_frame") else null,
		"pool_source": "on-demand ens order (G34391 2-frame rebuild cadence: HOLD)"}
	if selected == null:
		receipt["status"] = "SOURCE_RETURN"
		receipt["accepted"] = true
		receipt["reason"] = "G38954 corpse=null"
		receipt["source_prefix"] = ["G38948 _deadPool scan: none", "G38954 e.reviveT=60"]
		receipt["next_timer"] = RETRY_TICKS
		return _finish(receipt, request_id)
	receipt["selected_index"] = selected_index
	receipt["corpse_id"] = str((selected.get("data") as Dictionary).get("id", selected.name)) if selected.get("data") is Dictionary else str(selected.name)
	if not selected.has_method("apply_native_enemy_corpse_revive"):
		# 원본은 첫 후보를 고른다 — 지원 안 되는 actor를 건너뛰어 다음 후보로 바꾸지 않는다.
		_busy = false
		return _reject(receipt, "NOT_READY", "enemy_revive_corpse_writer_unsupported:" + str(selected.get_script().resource_path if selected.get_script() else "none"))
	receipt["before"] = _readback(selected)
	var write: Dictionary = selected.apply_native_enemy_corpse_revive(world)
	if write.get("applied") != true:
		_busy = false
		receipt["after"] = _readback(selected)
		return _reject(receipt, "NOT_READY", "enemy_revive_writer_refused:" + str(write.get("reason")))
	receipt["after"] = _readback(selected)
	receipt["readback"] = receipt["after"]
	receipt["revived"] = true
	receipt["actor"] = selected
	receipt["applied_fields"] = {"actor": ["alive", "hp", "eShield", "eShieldMax", "state", write.get("recover_field"),
		"stunned", "poise", "reviveIframes"]}
	receipt["source_prefix"] = ["G38948 첫 후보 선택", "G38950 alive/hp/eShield/s/st2/stunned/poise/reviveIframes",
		"G38953 e.reviveT=e.reviveCd → next_timer"]
	receipt["presentation"] = ["G38951 _reviveVFX('#ffdd44','💀부활!')", "G38952 addTxt('🔮주술!')/addParts"]
	receipt["next_timer"] = float(revive_cd)
	receipt["status"] = "APPLIED"
	receipt["accepted"] = true
	receipt["reason"] = ""
	# PCI-11: 같은 actor의 열린 처치 토큰을 취소 신호로 정리.
	if owner.has_method("_final_enemy_death_bus"):
		var bus: RefCounted = owner._final_enemy_death_bus()
		if bus != null:
			receipt["death_cancel"] = bus.cancel_for_actor(selected, "corpse_revived:G38949")
	return _finish(receipt, request_id)

func get_snapshot() -> Dictionary:
	return {"schema": SCHEMA, "accepted": _accepted, "rejected": _rejected, "busy": _busy, "tick_path": false}

func _finish(receipt: Dictionary, request_id: String) -> Dictionary:
	_accepted += 1
	var stored: Dictionary = receipt.duplicate(true)
	_receipts[request_id] = stored
	_busy = false
	return receipt

func _reject(receipt: Dictionary, status: String, reason: String) -> Dictionary:
	receipt["status"] = status
	receipt["accepted"] = false
	receipt["reason"] = reason
	_rejected += 1
	return receipt

static func _readback(enemy: Node) -> Dictionary:
	var native: Dictionary = _native(enemy)
	return {"alive": enemy.get("alive"), "hp": enemy.get("hp"), "mhp": enemy.get("mhp"),
		"eShield": enemy.get("eShield"), "eShieldMax": enemy.get("eShieldMax"), "state": enemy.get("state"),
		"stunned": enemy.get("_stun_ticks"), "poise": enemy.get("poise"), "max_poise": enemy.get("max_poise"),
		"reviveIframes": native.get("reviveIframes", 0.0), "collision_layer": enemy.get("collision_layer"),
		"instance_id": enemy.get_instance_id()}

static func _native(enemy: Node) -> Dictionary:
	var data: Variant = enemy.get("data")
	if data is Dictionary and data.get("native_final") is Dictionary:
		return data["native_final"]
	return {}

static func _absorbed(enemy: Node) -> bool:
	return enemy.get("_absorbed") == true or _native(enemy).get("_absorbed") == true

static func _ref(value: Variant) -> Variant:
	return value.get_ref() if value is WeakRef and is_instance_valid(value) else null

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())
