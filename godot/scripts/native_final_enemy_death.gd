class_name ExoduserNativeFinalEnemyDeath
extends RefCounted
## PCI-11 (2026-10-21, PC-LIFE-PACK) — 적 최종 처치 인계 버스.
##
## 발행 지점: 실제 hurtE 처치 파이프라인(native_normal_enemy_hurte.gd `_kill_pipeline`)의
## G42733 앵커 — 42702 사망 확정·킬 카운트·regKill, 42704~42732 사망 FX 뒤, 42734~42744
## 보스 사망 문구/문지기 해방 앞. 원본에서 문지기·보스 사망 문맥이 읽히는 바로 그 위치다.
##   - life_phase "final": 이번 사망으로 부활 예약이 없음(G42627 일반몹 부활 미당첨/이미 부활체/구울).
##   - life_phase "revival_pending": 이번 사망이 G42633 일반몹 부활(_revived)을 예약함.
##     원본은 G34497~ _reviveTimer 만료 때 구울/본모습으로 되살린다 — Godot 재스폰은 미이식이라
##     이 토큰은 열린 채 남고, 같은 actor가 PCI-10으로 되살아나면 "cancel"이 발행된다.
##   - "cancel": 이미 발행한 토큰의 actor가 다시 살아남(PCI-10 시체 부활).
## 보스(ib): 현재 PC hurtE는 G42124에서 boss_hurtE 미이식으로 정지 — 보스 HP/부활 판정
## (G42516~42625, G34497~34530) owner가 main에 없다. 보스 final death는 NOT_READY(구독 영수증
## coverage에 명시). Main37 clear sink를 복제하지 않는다 — 문지기 10%·게이트·clear·랭크 귀속은
## 구독자(Mac37/P3-003)가 소비한다. 이 모듈은 G 상태를 쓰지 않는다.
## 틱 경로 코드 0(처치 이벤트에서만 실행). 목록 생성 API 호출 0.

const MAIN_PATH = "res://scripts/main.gd"
const SCHEMA = "exoduser.godot.final-enemy-death.v1"
const EVENTS = ["final_death", "revival_pending", "cancel"]

var _main: WeakRef
var _subs: Array = []          # [{id, consumer, subscriber(WeakRef), events, delivered}]
var _sub_serial := 0
var _token_serial := 0
var _revision := 0
var _open: Dictionary = {}     # actor instance id → {token, life_phase, actor(WeakRef)}
var _queue: Array = []
var _delivering := false
var _published := 0
var _delivered := 0
var _rejected := 0
var _last: Dictionary = {}

func configure(main: Node) -> bool:
	if _main != null or not _live(main) or main.get_script() == null or main.get_script().resource_path != MAIN_PATH:
		return false
	_main = weakref(main)
	return true

static func coverage() -> Dictionary:
	return {"normal_enemy_hurte": {"status": "READY", "anchor": "G42733 (native_normal_enemy_hurte._kill_pipeline)"},
		"boss_ib": {"status": "READY", "anchor": "PC-BOSS-CORE publish_boss (G42733 revival_pending/final, G34525 final)", "scope": "1-1 si0 ordinary druid"},
		"legacy_receive_damage_kill": {"status": "NOT_READY", "reason": "enemy.receive_damage 레거시 사망은 원본 hurtE 처치 파이프라인이 아님"},
		"normal_revive_resurrection": {"status": "NOT_READY", "reason": "G34497~ 일반몹 _reviveTimer 재스폰 미이식 — revival_pending 토큰은 PCI-10 부활 때만 cancel"}}

func subscribe(consumer: Callable, ctx: Dictionary) -> Dictionary:
	var main: Variant = _ref(_main)
	var receipt := {"schema": SCHEMA, "accepted": false, "coverage": coverage(), "revision": _revision}
	if not _live(main):
		return _reject(receipt, "NOT_READY", "final_death_bus_Main_not_live")
	if _delivering:
		return _reject(receipt, "REJECTED", "final_death_subscribe_during_delivery")
	if not consumer.is_valid():
		return _reject(receipt, "REJECTED", "final_death_consumer_invalid")
	var subscriber: Variant = ctx.get("subscriber")
	if not _live(subscriber) or not subscriber is Node or (subscriber != main and not main.is_ancestor_of(subscriber)):
		return _reject(receipt, "REJECTED", "final_death_subscriber_not_Main_owned")
	var events: Variant = ctx.get("events", EVENTS)
	if not events is Array or events.is_empty():
		return _reject(receipt, "REJECTED", "final_death_events_invalid")
	for e in events:
		if e not in EVENTS:
			return _reject(receipt, "REJECTED", "final_death_event_unknown:" + str(e))
	for sub in _subs:
		if sub.consumer == consumer:
			return _reject(receipt, "REJECTED", "final_death_consumer_already_subscribed")
	_sub_serial += 1
	var id := "fdsub:%d" % _sub_serial
	_subs.append({"id": id, "consumer": consumer, "subscriber": weakref(subscriber), "events": events.duplicate(), "delivered": 0})
	receipt["status"] = "READY"
	receipt["accepted"] = true
	receipt["reason"] = ""
	receipt["subscription_id"] = id
	receipt["events"] = events.duplicate()
	return receipt

func unsubscribe(subscription_id: String) -> bool:
	if _delivering:
		return false
	for i in _subs.size():
		if _subs[i].id == subscription_id:
			_subs.remove_at(i)
			return true
	return false

## hurtE 처치 파이프라인 전용(G42733 앵커). 발행 실패는 처치 prefix를 되돌리지 않는다.
func publish(enemy: Node, context: Dictionary) -> Dictionary:
	var main: Variant = _ref(_main)
	if not _live(main) or not _live(enemy) or not _live(main.get("world")) \
			or enemy.get_parent() != main.world or not main.world.get_enemies().has(enemy) \
			or enemy.get("alive") != false:
		_rejected += 1
		return {"published": false, "reason": "final_death_actor_not_current_dead"}
	var key: int = enemy.get_instance_id()
	if _open.has(key) and _open[key].life_phase == "final":
		_rejected += 1
		return {"published": false, "reason": "final_death_duplicate_publish", "death_token": _open[key].token}
	var life_phase: String = "revival_pending" if context.get("revival_pending") == true else "final"
	if _open.size() > 256:
		for stale in _open.keys():
			if not _live(_open[stale].actor.get_ref()):
				_open.erase(stale)
	_token_serial += 1
	_revision += 1
	var token := "edeath:%d:%d" % [main.get_instance_id(), _token_serial]
	var g: Variant = main.source_state.read_current_g()
	var native: Dictionary = enemy.data.get("native_final", {}) if enemy.get("data") is Dictionary else {}
	var player_life: Dictionary = main.read_native_player_life_phase() if main.has_method("read_native_player_life_phase") else {}
	var payload := {"schema": SCHEMA, "event": life_phase if life_phase == "revival_pending" else "final_death",
		"actor": enemy, "death_token": token, "life_phase": life_phase,
		"stage": int(g.get("stage", -1)) if g is Dictionary and (g.get("stage") is int or g.get("stage") is float) else -1,
		"provider_revision": {"bus_revision": _revision, "main": main.get_instance_id(),
			"world": main.world.get_instance_id(), "registry_index": main.world.get_enemies().find(enemy)},
		"kill_receipt": context.get("kill_receipt", {}).duplicate(true),
		"gate_guard": {"is_gate_guard": native.get("_isGateGuard") == true, "ib": native.get("ib") == true,
			"source_lines": "G42734-42744", "effects_owner": "Mac37/P3-003 (_gateGuardKilled·bossGateOpen·clear)",
			"applied_by_pc": false},
		"player_life": {"phase": player_life.get("phase", "unknown"), "death_token": player_life.get("death_token", ""),
			"clear_blocked": player_life.get("clear_blocked", true)},
		"source_anchor": "G42733"}
	_open[key] = {"token": token, "life_phase": life_phase, "actor": weakref(enemy)}
	_published += 1
	_enqueue(payload)
	_last = _detached(payload)
	return {"published": true, "death_token": token, "life_phase": life_phase, "revision": _revision}

## PC-BOSS-CORE(2026-10-22) — 보스(ib) 발행 진입점. 보스 전투 owner(native_demo11_boss_core)만 호출한다.
## 원본: 1차 부활 실패 시 42733 앵커(2차 폴백 예약이면 revival_pending), 2차 판정 실패 34525(완전 사망 = final).
## payload.actor 는 Mac actor(encounter 가 비교하는 대상), 레지스트리 검증은 PC 보스 body 로 한다.
func publish_boss(actor: Node, body: Node, context: Dictionary) -> Dictionary:
	var main: Variant = _ref(_main)
	if not _live(main) or not _live(actor) or not _live(body) or not _live(main.get("world")) \
			or actor != main.get("native_demo_boss_actor") or actor.get_parent() != main.world \
			or body.get_parent() != main.world or not main.world.get_enemies().has(body) \
			or body.get("alive") != false:
		_rejected += 1
		return {"published": false, "reason": "boss_final_death_actor_not_current_dead"}
	var key: int = actor.get_instance_id()
	if _open.has(key) and _open[key].life_phase == "final":
		_rejected += 1
		return {"published": false, "reason": "final_death_duplicate_publish", "death_token": _open[key].token}
	var life_phase: String = "revival_pending" if context.get("revival_pending") == true else "final"
	_token_serial += 1
	_revision += 1
	var token := "bdeath:%d:%d" % [main.get_instance_id(), _token_serial]
	var g: Variant = main.source_state.read_current_g()
	var player_life: Dictionary = main.read_native_player_life_phase() if main.has_method("read_native_player_life_phase") else {}
	var payload := {"schema": SCHEMA, "event": life_phase if life_phase == "revival_pending" else "final_death",
		"actor": actor, "death_token": token, "life_phase": life_phase,
		"stage": int(g.get("stage", -1)) if g is Dictionary and (g.get("stage") is int or g.get("stage") is float) else -1,
		"provider_revision": {"bus_revision": _revision, "main": main.get_instance_id(),
			"world": main.world.get_instance_id(), "registry_index": main.world.get_enemies().find(body)},
		"kill_receipt": context.get("kill_receipt", {}).duplicate(true),
		"gate_guard": {"is_gate_guard": false, "ib": true, "source_lines": "G42733/G34525", "effects_owner": "Mac37 encounter",
			"applied_by_pc": false},
		"player_life": {"phase": player_life.get("phase", "unknown"), "death_token": player_life.get("death_token", ""),
			"clear_blocked": player_life.get("clear_blocked", true)},
		"source_anchor": "G34525" if context.get("anchor") == "G34525" else "G42733", "boss_body": str(body.name)}
	_open[key] = {"token": token, "life_phase": life_phase, "actor": weakref(actor)}
	_published += 1
	_enqueue(payload)
	_last = _detached(payload)
	return {"published": true, "death_token": token, "life_phase": life_phase, "revision": _revision}

## PCI-10 시체 부활 직후: 같은 actor의 열린 토큰을 취소한다.
func cancel_for_actor(enemy: Node, reason: String) -> Dictionary:
	var main: Variant = _ref(_main)
	if not _live(enemy) or not _live(main):
		return {"canceled": false, "reason": "final_death_cancel_actor_not_live"}
	var key: int = enemy.get_instance_id()
	if not _open.has(key):
		return {"canceled": false, "reason": "final_death_no_open_token"}
	var open: Dictionary = _open[key]
	_open.erase(key)
	_revision += 1
	var g: Variant = main.source_state.read_current_g()
	var payload := {"schema": SCHEMA, "event": "cancel", "actor": enemy, "death_token": open.token,
		"life_phase": "canceled", "canceled_phase": open.life_phase, "reason": reason,
		"stage": int(g.get("stage", -1)) if g is Dictionary and (g.get("stage") is int or g.get("stage") is float) else -1,
		"provider_revision": {"bus_revision": _revision, "main": main.get_instance_id(),
			"world": main.world.get_instance_id() if _live(main.get("world")) else 0}}
	_enqueue(payload)
	return {"canceled": true, "death_token": open.token, "canceled_phase": open.life_phase}

func read_open_token(enemy: Node) -> Dictionary:
	if not _live(enemy) or not _open.has(enemy.get_instance_id()):
		return {}
	var open: Dictionary = _open[enemy.get_instance_id()]
	return {"death_token": open.token, "life_phase": open.life_phase}

func get_snapshot() -> Dictionary:
	var subs: Array = []
	for sub in _subs:
		subs.append({"id": sub.id, "events": sub.events.duplicate(), "delivered": sub.delivered})
	return {"schema": SCHEMA, "subscriptions": subs, "published": _published, "delivered": _delivered,
		"rejected": _rejected, "open_tokens": _open.size(), "revision": _revision, "coverage": coverage(),
		"last": _last.duplicate(true), "tick_path": false, "clear_sink_duplicated": false}

func _enqueue(payload: Dictionary) -> void:
	_queue.append(payload)
	if _delivering:
		return # 전달 중 중첩 발행은 FIFO로 이어서 단회 전달
	_delivering = true
	while not _queue.is_empty():
		var item: Dictionary = _queue.pop_front()
		var main: Variant = _ref(_main)
		if item.event == "final_death" and _live(main) and main.has_signal("native_enemy_final_death"):
			main.native_enemy_final_death.emit(item.actor, int(item.stage))
		for sub in _subs.duplicate():
			var subscriber: Variant = sub.subscriber.get_ref()
			if not _live(subscriber) or not sub.consumer.is_valid() or item.event not in sub.events:
				continue
			sub.delivered += 1
			_delivered += 1
			sub.consumer.call(item.duplicate(true))
	_delivering = false

func _reject(receipt: Dictionary, status: String, reason: String) -> Dictionary:
	receipt["status"] = status
	receipt["accepted"] = false
	receipt["reason"] = reason
	_rejected += 1
	return receipt

static func _detached(payload: Dictionary) -> Dictionary:
	var out: Dictionary = payload.duplicate(true)
	out["actor"] = str(payload.actor.name) if is_instance_valid(payload.actor) else null
	return out

static func _ref(value: Variant) -> Variant:
	return value.get_ref() if value is WeakRef and is_instance_valid(value) else null

static func _live(value: Variant) -> bool:
	return is_instance_valid(value) and value is Object \
		and (not value is Node or not value.is_queued_for_deletion())
