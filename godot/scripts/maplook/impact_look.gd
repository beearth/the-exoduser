extends Node2D
## IMPACT-LOOK (2026-10-21) — 타격 임팩트 강화 레이어. 사용자 기준: "스킬임펙트도 많이 배워야할듯 위키드",
## "POE2도 임펙트는 좋은디 위키드가 더 좀 맞는듯 절재됀 화려함".
## 원칙(절제된 화려함): 효과 수는 적게, 한 방은 또렷하고 묵직하게. 화면을 덮는 입자 폭발 금지.
## 표시 전용 — 시뮬레이션 시간·피해·넉백·RNG(공유 RNG 소비 금지, 자체 RNG만)·판정 불변.
## 입력: player.telemetry_event("native_hurte") — 근접·검기·지옥강타·가시덫·얼음파쇄·얼음칼날 공통 경로.
## 문서: docs/5.1임펙트디자인/WICKED_IMPACT_REFERENCE_20261021.md

const MAX_BURSTS_PER_FRAME := 3
const MAX_SPARKS := 160
const MAX_RINGS := 24
const MAX_MARKS := 28
# 출처별 표현(절제: 잦은 지속 피해·칼날은 최소, 무거운 일격은 조금 더).
const STYLE := {
	"weapon":      {"sparks": 5, "len": [16.0, 34.0], "core": Color(1.0, 0.96, 0.88), "tint": Color(1.0, 0.62, 0.30), "ring": false, "mark": true,  "freeze": 0.0},
	"kiSlash":     {"sparks": 4, "len": [18.0, 38.0], "core": Color(0.96, 0.98, 1.0), "tint": Color(0.70, 0.78, 1.0), "ring": false, "mark": true,  "freeze": 0.0},
	"giantSlam":   {"sparks": 6, "len": [22.0, 44.0], "core": Color(1.0, 0.92, 0.70), "tint": Color(1.0, 0.45, 0.16), "ring": true,  "mark": true,  "freeze": 0.06},
	"iceShatter":  {"sparks": 4, "len": [14.0, 30.0], "core": Color(0.92, 1.0, 1.0), "tint": Color(0.48, 0.86, 1.0), "ring": true,  "mark": false, "freeze": 0.0},
	"iceOrbBlade": {"sparks": 2, "len": [10.0, 20.0], "core": Color(0.92, 1.0, 1.0), "tint": Color(0.48, 0.86, 1.0), "ring": false, "mark": false, "freeze": 0.0},
	"spikeTrap":   {"sparks": 0, "len": [0.0, 0.0],   "core": Color(1, 1, 1),        "tint": Color(1, 1, 1),        "ring": false, "mark": false, "freeze": 0.0},
}

var world: Node2D
var player: Node2D
var _rng := RandomNumberGenerator.new()
var _add_layer: Node2D        # 가산(불꽃·고리) — 환경광 영향 없음
var _mark_layer: Node2D       # 바닥 흔적 — 일반 합성
var _sparks: Array = []       # {p, v, len, life, max, core, tint, w}
var _rings: Array = []        # {p, r0, r1, life, max, col}
var _marks: Array = []        # {p, r, life, max, ang, sx}
var _bursts_this_frame := 0
var _freeze_left := 0.0
var _player_sprites: Array = []
var _pops: Dictionary = {}    # sprite instance_id → {node, base_scale, t, max, dir}
var _stats := {"bursts": 0, "skipped_budget": 0, "freezes": 0, "pops": 0, "marks": 0}


static func install(owner_world: Node2D, _map_data: Dictionary, owner_player: Node2D) -> Node2D:
	if not is_instance_valid(owner_world) or not is_instance_valid(owner_player) \
			or not owner_player.has_signal("telemetry_event"):
		return null
	var look: Node2D = load("res://scripts/maplook/impact_look.gd").new()
	look.name = "ImpactLook"
	owner_world.add_child(look)
	look.configure(owner_world, owner_player)
	return look


func configure(owner_world: Node2D, owner_player: Node2D) -> void:
	world = owner_world
	player = owner_player
	_rng.seed = 20261021
	z_as_relative = false
	z_index = 4001
	_add_layer = _Layer.new()
	_add_layer.owner_look = self
	_add_layer.additive = true
	var add_material := CanvasItemMaterial.new()
	add_material.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
	add_material.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	_add_layer.material = add_material
	_add_layer.z_as_relative = false
	_add_layer.z_index = 4001
	add_child(_add_layer)
	_mark_layer = _Layer.new()
	_mark_layer.owner_look = self
	_mark_layer.additive = false
	_mark_layer.z_as_relative = false
	_mark_layer.z_index = -2004  # 바닥 데칼(-2005) 바로 위, 액터 아래
	add_child(_mark_layer)
	for child in player.find_children("*", "AnimatedSprite2D", true, false):
		_player_sprites.append(child)
	player.telemetry_event.connect(_on_player_event)
	set_process(true)


func _on_player_event(kind: String, data: Dictionary) -> void:
	if kind != "native_hurte" or data.get("ok") != true:
		return
	var source: String = str(data.get("source", "weapon"))
	var style: Dictionary = STYLE.get(source, STYLE["weapon"])
	var enemy: Object = instance_from_id(int(data.get("enemy_id", 0))) if int(data.get("enemy_id", 0)) != 0 else null
	if enemy == null or not enemy is Node2D:
		return
	if _bursts_this_frame >= MAX_BURSTS_PER_FRAME:
		_stats.skipped_budget += 1
		return
	_bursts_this_frame += 1
	_stats.bursts += 1
	var at: Vector2 = (enemy as Node2D).global_position
	var dir: Vector2 = (at - player.global_position)
	dir = dir.normalized() if dir.length() > 0.001 else Vector2.RIGHT
	var crit: bool = data.get("is_crit") == true
	var killed: bool = data.get("killed") == true
	var heavy: bool = crit or killed or (source == "kiSlash" and int(data.get("step", 0)) >= 3)
	var count: int = int(style["sparks"]) + (3 if heavy else 0)
	# ① 불꽃 줄기 — 타격 방향 ±35°, 짧고 밝게. 중심은 흰빛, 꼬리는 출처 색.
	for i in range(count):
		if _sparks.size() >= MAX_SPARKS:
			_sparks.pop_front()
		var ang: float = dir.angle() + _rng.randf_range(-0.62, 0.62)
		var speed: float = _rng.randf_range(260.0, 520.0) * (1.25 if heavy else 1.0)
		var life: float = _rng.randf_range(0.10, 0.18) * (1.2 if heavy else 1.0)
		var length: float = _rng.randf_range(style["len"][0], style["len"][1]) * (1.3 if heavy else 1.0)
		_sparks.append({"p": at + dir * 6.0, "v": Vector2.from_angle(ang) * speed, "len": length,
			"life": life, "max": life, "core": style["core"], "tint": style["tint"],
			"w": _rng.randf_range(1.4, 2.4) * (1.25 if heavy else 1.0)})
	# ② 충격 고리 — 무거운 일격에만 하나.
	if (style["ring"] or heavy) and _rings.size() < MAX_RINGS:
		var r1: float = 52.0 if killed else (44.0 if heavy else 36.0)
		if source == "giantSlam": r1 = 64.0
		_rings.append({"p": at, "r0": 8.0, "r1": r1, "life": 0.16, "max": 0.16,
			"col": Color(style["core"], 0.55)})
	# ③ 맞은 그림 찌그러짐(표시 전용, 원래 크기로 정확히 복원).
	_pop_enemy(enemy as Node2D, dir, heavy)
	# ④ 표시 전용 히트스톱 — 플레이어 동작 프레임만 잠깐 멈춤(시뮬레이션 시간 불변).
	var freeze: float = float(style["freeze"])
	if killed: freeze = maxf(freeze, 0.07)
	elif crit: freeze = maxf(freeze, 0.05)
	elif source == "kiSlash" and int(data.get("step", 0)) >= 3: freeze = maxf(freeze, 0.05)
	if freeze > 0.0:
		_freeze_player(freeze)
	# ⑤ 바닥 흔적 — 옅은 핏자국, 처치 시 조금 크게. 서서히 사라짐.
	if style["mark"]:
		if _marks.size() >= MAX_MARKS:
			_marks.pop_front()
		var radius: float = (22.0 if killed else 11.0) * _rng.randf_range(0.8, 1.2)
		_marks.append({"p": at + dir * _rng.randf_range(6.0, 16.0), "r": radius, "life": 3.2, "max": 3.2,
			"ang": dir.angle(), "sx": _rng.randf_range(1.3, 1.8)})
		_stats.marks += 1


func _pop_enemy(enemy: Node2D, dir: Vector2, heavy: bool) -> void:
	var body: Variant = enemy.get("_body")
	if not body is Node2D or not is_instance_valid(body):
		return
	var id: int = body.get_instance_id()
	if not _pops.has(id):
		_pops[id] = {"node": body, "base_scale": body.scale, "t": 0.0, "max": 0.11, "dir": dir, "heavy": heavy}
	else:
		_pops[id]["t"] = 0.0
		_pops[id]["heavy"] = heavy
	_stats.pops += 1


func _freeze_player(seconds: float) -> void:
	if _freeze_left <= 0.0:
		for sprite in _player_sprites:
			if is_instance_valid(sprite):
				sprite.set_meta("impact_speed_scale", sprite.speed_scale)
				sprite.speed_scale = 0.0
	_freeze_left = maxf(_freeze_left, seconds)
	_stats.freezes += 1


func _process(delta: float) -> void:
	_bursts_this_frame = 0
	if _freeze_left > 0.0:
		_freeze_left -= delta
		if _freeze_left <= 0.0:
			for sprite in _player_sprites:
				if is_instance_valid(sprite) and sprite.has_meta("impact_speed_scale"):
					sprite.speed_scale = float(sprite.get_meta("impact_speed_scale"))
					sprite.remove_meta("impact_speed_scale")
	for spark in _sparks:
		spark.life -= delta
		spark.p += spark.v * delta
		spark.v *= pow(0.02, delta)  # 빠르게 감속
	_sparks = _sparks.filter(func(s): return s.life > 0.0)
	for ring in _rings:
		ring.life -= delta
	_rings = _rings.filter(func(r): return r.life > 0.0)
	for mark in _marks:
		mark.life -= delta
	_marks = _marks.filter(func(m): return m.life > 0.0)
	for id in _pops.keys():
		var pop: Dictionary = _pops[id]
		var node: Variant = pop["node"]
		if not is_instance_valid(node):
			_pops.erase(id)
			continue
		pop["t"] += delta
		var k: float = clampf(pop["t"] / pop["max"], 0.0, 1.0)
		var amount: float = (0.16 if pop["heavy"] else 0.10) * (1.0 - k) * (1.0 - k)
		var base: Vector2 = pop["base_scale"]
		node.scale = Vector2(base.x * (1.0 + amount), base.y * (1.0 - amount * 0.7))
		if k >= 1.0:
			node.scale = base
			_pops.erase(id)
	_add_layer.queue_redraw()
	_mark_layer.queue_redraw()


func get_snapshot() -> Dictionary:
	var out := _stats.duplicate()
	out["live_sparks"] = _sparks.size()
	out["live_rings"] = _rings.size()
	out["live_marks"] = _marks.size()
	out["freezing"] = _freeze_left > 0.0
	return out


class _Layer extends Node2D:
	var owner_look: Node
	var additive := true

	func _draw() -> void:
		if not is_instance_valid(owner_look):
			return
		if additive:
			for spark in owner_look._sparks:
				var k: float = spark.life / spark.max
				var tail: Vector2 = spark.p - spark.v.normalized() * spark.len * (0.4 + 0.6 * k)
				draw_line(tail, spark.p, Color(spark.tint, 0.85 * k), spark.w * 1.8, true)
				draw_line(spark.p.lerp(tail, 0.5), spark.p, Color(spark.core, k), spark.w, true)
			for ring in owner_look._rings:
				var k: float = 1.0 - ring.life / ring.max
				var r: float = lerpf(ring.r0, ring.r1, 1.0 - pow(1.0 - k, 3.0))
				var col: Color = ring.col
				col.a *= (1.0 - k)
				draw_arc(ring.p, r, 0.0, TAU, 40, col, 2.2 * (1.0 - k) + 0.6, true)
		else:
			for mark in owner_look._marks:
				var k: float = mark.life / mark.max
				var a: float = 0.32 * minf(1.0, k * 2.5)
				draw_set_transform(mark.p, mark.ang, Vector2(mark.sx, 1.0))
				draw_circle(Vector2.ZERO, mark.r, Color(0.22, 0.02, 0.03, a))
				draw_circle(Vector2(mark.r * 0.35, 0.0), mark.r * 0.55, Color(0.30, 0.03, 0.04, a * 0.8))
				draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
