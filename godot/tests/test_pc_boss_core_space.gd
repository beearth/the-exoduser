extends SceneTree
## PC-BOSS-CORE — BOSS_SPACE_SCALE(S) 경계 변환 검증.
## (1) S=1: 모든 변환이 입력 비트를 그대로 돌려준다(곱셈 0).
## (2) S=0.4: 같은 원본 보스 공간 결과(PREFIX 원본 수치 계산)를 월드로 옮기면 공간 값만 ×S, 시간 값 동일.
## (3) 접촉 판정 예: d < e.r + P.r + 8 → 월드 S·44 + P.r + S·8 (P.r 은 월드 값 그대로).
const SPACE = preload("res://scripts/native_boss_space.gd")
const PREFIX = preload("res://scripts/native_demo11_boss_prefix.gd")
const USERDIR := "EXODUSER-pc-boss-core-Isolated-20261022"
var assertions := 0
var failures := 0
var fails: Array = []

class OpenEnv extends RefCounted:
	## 벽 없는 열린 공간 env — 기하가 스케일 불변이라 보스 공간 결과가 S 와 무관해야 한다.
	var rng: Array = []
	func pf_lesson_active() -> bool: return false
	func pf_tile_free(_x: float, _y: float, _r: float) -> bool: return true
	func pf_can_move(_x: float, _y: float, _r: float) -> bool: return true
	func pf_real_wall(_x: float, _y: float) -> bool: return false
	func pf_los(_a: float, _b: float, _c: float, _d: float) -> bool: return true
	func pf_ff_dir(_x: float, _y: float) -> Variant: return null
	func pf_rng(_t: String, _l: int) -> float: return rng.pop_front() if not rng.is_empty() else 0.5
	func pf_present(_c: String, _a: Array, _l: int) -> void: pass
	func pf_translate(t: String) -> String: return t
	func pf_hurt_e(e: Dictionary, _d: int, _l: int) -> Dictionary: return e
	func pf_rifts() -> Array: return []
	func pf_msfx_playing() -> int: return 0
	func pf_msfx_inc() -> void: pass
	func pf_generic_tick(e: Dictionary, p: Dictionary, _sp: float) -> Dictionary: return {"ok": true, "e": e, "p": p}

func check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		if fails.size() < 20: fails.append(label)

func _initialize() -> void: call_deferred("_run")

static func _bits(v: float) -> String:
	var b := PackedByteArray()
	b.resize(8)
	b.encode_double(0, v)
	return b.hex_encode()

func _run() -> void:
	check(OS.get_user_data_dir().ends_with(USERDIR), "isolation_userdir")
	check(SPACE.BOSS_SPACE_SCALE == 0.4, "decided_scale_0_4")
	var rng := RandomNumberGenerator.new()
	rng.seed = 2026102203
	# (1) S=1 비트 동일
	var id := SPACE.new()
	check(id.configure(1.0, Vector2(123.456, -8000.0)) and id.is_identity(), "identity_configured")
	for i in range(2000):
		var x := rng.randf_range(-1e5, 1e5) + rng.randf() * 1e-7
		var y := rng.randf_range(-1e5, 1e5)
		var w := id.to_world_xy(x, y)
		var b := id.to_boss_xy(x, y)
		check(_bits(w.x) == _bits(Vector2(x, y).x) and _bits(w.y) == _bits(Vector2(x, y).y), "s1_to_world_bits")
		check(_bits(b.x) == _bits(Vector2(x, y).x), "s1_to_boss_bits")
		check(_bits(id.len_to_world(x)) == _bits(x) and _bits(id.len_to_boss(y)) == _bits(y), "s1_len_bits")
	var pw := {"x": 10.5, "y": 20.25, "r": 15.0, "facing": 1.0, "s": "idle", "iframes": 0.0, "kb": {"x": 1.0, "y": 2.0}}
	check(is_same(id.player_to_boss(pw), pw), "s1_player_snapshot_same_object")
	# (2) S=0.4 사상
	var s := SPACE.new()
	var origin := Vector2(0.0, -8000.0)
	check(s.configure(0.4, origin) and not s.is_identity(), "s04_configured")
	for i in range(2000):
		var bx := rng.randf_range(-3000, 3000)
		var by := rng.randf_range(-11000, -5000)
		var w := s.to_world_xy(bx, by)
		# Vector2 는 float32(월드 노드 좌표와 같은 정밀도) — 상대 2^-23 허용
		check(absf(w.x - (origin.x + 0.4 * (bx - origin.x))) <= 1e-6 * maxf(1.0, absf(w.x)) and absf(w.y - (origin.y + 0.4 * (by - origin.y))) <= 1e-6 * maxf(1.0, absf(w.y)), "s04_to_world")
		var back := s.to_boss_xy(w.x, w.y)
		check(absf(back.x - bx) <= 1e-5 * maxf(1.0, absf(bx)) and absf(back.y - by) <= 1e-5 * maxf(1.0, absf(by)), "s04_round_trip")
	var pb: Dictionary = s.player_to_boss({"x": 100.0, "y": -7900.0, "r": 15.0, "facing": 0.3, "s": "idle", "iframes": 2.0, "kb": {"x": 0.4, "y": -0.8}})
	check(absf(pb.x - 250.0) < 1e-3 and absf(pb.y - (-7750.0)) < 1e-3 and absf(pb.r - 37.5) < 1e-9, "s04_player_position_radius")
	check(absf(pb.kb.x - 1.0) < 1e-9 and absf(pb.kb.y + 2.0) < 1e-9 and pb.facing == 0.3 and pb.iframes == 2.0, "s04_player_kb_and_time_unchanged")
	# (3) 접촉 임계: 보스 공간 d < e.r + P.r_b + 8 ⇔ 월드 d_w < S*44 + P.r + S*8
	var thr_b: float = 44.0 + pb.r + 8.0
	check(absf(s.len_to_world(thr_b) - (0.4 * 44.0 + 15.0 + 0.4 * 8.0)) < 1e-9, "s04_contact_threshold_world")
	# (4) 같은 원본 결과의 월드 투영: 보스 공간 PREFIX 결과는 S 와 무관, 월드 위치·거리만 ×S, 시간 값 동일
	var compared := 0
	for i in range(300):
		var e := {"ib": true, "etype": 0, "elite": 0, "mods": [], "x": rng.randf_range(-500, 500), "y": -8000.0 + rng.randf_range(-500, 500), "r": 44,
			"hp": 21017.0, "mhp": 21017.0, "atk": 46, "baseAtk": 46, "speed": 0.5, "s": ["idle", "recover"][i % 2], "st2": rng.randf_range(0, 40),
			"facing": 0.0, "kb": {"x": rng.randf_range(-3, 3), "y": rng.randf_range(-3, 3)}, "_aAtkM": 1, "_aSpdM": 1, "_alerted": true, "_projChargeT": 0}
		var p_world := {"x": rng.randf_range(-800, 800), "y": -8000.0 + rng.randf_range(-800, 800), "r": 15.0, "facing": 0.0, "s": "idle", "iframes": 0.0, "kb": {"x": 0.0, "y": 0.0}}
		# S=1 기준: 보스 공간 = 월드, 플레이어 월드 위치 p_world
		var env1 := OpenEnv.new()
		for k in range(4): env1.rng.append(0.25 * k)
		var r1: Dictionary = PREFIX.run(e, id.player_to_boss(p_world), 1.0, env1)
		# S=0.4: 플레이어 월드 위치를 O + S·(p_world − O)로 둔 같은 장면 → 보스 공간 입력은 S=1 과 동일해야 한다
		var pw2: Vector2 = s.to_world_xy(p_world.x, p_world.y)
		var p2 := {"x": pw2.x, "y": pw2.y, "r": 15.0 * 0.4, "facing": 0.0, "s": "idle", "iframes": 0.0, "kb": {"x": 0.0, "y": 0.0}}
		var env2 := OpenEnv.new()
		for k in range(4): env2.rng.append(0.25 * k)
		var r2: Dictionary = PREFIX.run(e, s.player_to_boss(p2), 1.0, env2)
		if r1.status != "READY" or r2.status != "READY":
			check(false, "prefix_ready")
			continue
		compared += 1
		var w1 := Vector2(r1.enemy.x, r1.enemy.y)
		var w2 := s.to_world_xy(r2.enemy.x, r2.enemy.y)
		var expect := origin + (w1 - origin) * 0.4
		check(w2.distance_to(expect) < 1e-2, "s04_boss_world_position_scaled") # float32 Vector2
		check(absf(s.len_to_world(r2.distance) - 0.4 * r1.distance) < 1e-3 * maxf(1.0, r1.distance), "s04_distance_scaled") # float32 경계
		check(r2.enemy.st2 == r1.enemy.st2 and r2.return_update == r1.return_update, "s04_time_values_equal")
		check(r2.enemy.atk == r1.enemy.atk and r2.enemy.hp == r1.enemy.hp, "s04_damage_hp_equal")
	print("PCBOSS_SPACE_FAILS ", JSON.stringify(fails))
	print("PCBOSS_SPACE_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures, "prefix_pairs": compared}))
	quit(1 if failures else 0)
