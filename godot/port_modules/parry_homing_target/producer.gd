extends RefCounted
##
## FDG Godot 이식 — 원본 _parryHomingTarget 동일 패스 캐시/조회 provider.
## TASK GODOT-PORT-PARRY-HOMING-TARGET-FIRST-20261013
##
## 소유: 격리 포트 모듈(이 파일). 탄 carrier 변이는 black(Shot.apply_source_q_reflection), Q/E 자격·bank·doParry 는 SKILL,
## World/Player/공간해시/frame/projs 루프 driver 는 ENGINE 소유다. 이 모듈은 자체 frame/physics/process/RNG/자동 구동이 없다.
##
## 원본 R(읽기전용): /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html
##   let _phtDone=false,_phtTgt=null;                                   : 19170
##   _resetParryHomingCache(){_phtDone=false;_phtTgt=null}              : 19171
##   _parryHomingTarget()                                               : 19172-19180
##     19173 _parryLesson?.active → chapter===1&&(step===0||step===1)&&parryEnemy?.alive ? parryEnemy : null (캐시 미접촉)
##     19174 if(_phtDone) return _phtTgt   (캐시된 null 도 그대로 반환, 재검사 0)
##     19175 _phtDone=true
##     19176 _t=null, _m=360000
##     19177 _ne=shQuery(P.x,P.y,600)
##     19178 for: !e.alive → skip; d=dst2(P.x,P.y,e.x,e.y); d<_m(엄격) → 갱신 (동률은 먼저 순회된 적 유지)
##     19179 _phtTgt=_t; return _t
##   무효화 지점: projs 루프 진입 {let pw=0;_resetParryHomingCache(); ...}  : 35285 (update 1회당 1회)
##   호출 지점(모두 위 루프 내부): 35557 빨콩 / 35567 물리입 / 35576 titanEye / 35624 bwBean / 35640 gbBean / 35677 일반 Q(무지개 포함)
##   shQuery(셀 128, cy→cx 순회, 셀 내 삽입/스왑 순서, 반경 내 재검사 없음) : 19025-19035 / 18988 / 18993-19022
##   dst2(a,b,c,d)=(c-a)**2+(d-b)**2                                     : 32385
##
## 원본과 다른 점(결과 불변, 바인딩 무결성만):
##   - 원본은 _phtDone=true 를 shQuery 전에 쓴다. 원본 shQuery 는 실패하지 않으므로, 여기서는 스캔이 성공한 뒤에만
##     done/target 을 커밋한다. 바인딩 오류는 캐시를 오염시키지 않고 명시적 오류로 끝난다.
##   - 원본 호출은 항상 35285 reset 이후 같은 update 안에서만 일어난다. reset 없이(또는 reset 한 frame 과 다른
##     frame 에서) 조회하면 자동 reset 하지 않고 명시적 오류를 낸다.

const SOURCE_QUERY_R := 600.0          # 19177 shQuery(P.x,P.y,600)
const SOURCE_INIT_MIN_D2 := 360000.0   # 19176 _m=360000 (=600², 엄격 <)
const LESSON_CHAPTER := 1              # 19173 l.chapter===1
const LESSON_STEPS := [0, 1]           # 19173 l.step===0||l.step===1
const REQUIRED_BINDINGS := ["player", "query_enemies", "frame_provider", "parry_lesson"]

## carrier provider 가 바인딩 오류 때 돌려주는 값. black Shot 은 이를 "parry_homing_target_unreadable" 로 거부하고
## 탄을 변이하지 않는다(정당한 무표적 null 과 구분).
class QueryError extends RefCounted:
	var reason := ""
	func _init(r: String) -> void:
		reason = r

var last_error := ""
var gaps: Dictionary = {}
# 계측(원본 동작 아님). automatic_driver_steps 는 이 모듈이 스스로 구동한 횟수로, 구조상 항상 0.
var reset_count := 0
var query_count := 0
var scan_count := 0
var cache_hit_count := 0
var lesson_count := 0
var error_count := 0
var carrier_provider_calls := 0
var automatic_driver_steps := 0
var last_query: Dictionary = {}

var _configured := false
var _player: Object
var _query_enemies: Callable
var _frame_provider: Callable
var _parry_lesson: Callable
var _lesson_declared_absent := false
# 원본 _phtDone/_phtTgt
var _done := false
var _target: Variant = null
var _pass_frame: Variant = null

## bindings(모두 키 필수):
##   player: Object — 현재 P (Node2D 면 global_position/position, 아니면 x/y). black 이 읽는 P 와 같은 객체여야 한다.
##   query_enemies: Callable(x: float, y: float, r: float) -> Array — 원본 shQuery 결과 순서 그대로(빌린 버퍼 가능, 즉시 순회).
##   frame_provider: Callable() -> float — ENGINE World.get_native_frame (reset/조회가 같은 update 인지 확인).
##   parry_lesson: Callable() -> Variant(null | Dictionary | Object{active,chapter,step,parryEnemy}) 또는 null
##     (null = 이 World 에 원본 window._parryLesson 이 없음을 명시 선언 → 19173 분기 skip, gap 기록).
func configure(bindings: Dictionary) -> bool:
	if _configured:
		return _reject("already_configured")
	for key in REQUIRED_BINDINGS:
		if not bindings.has(key):
			return _reject("missing_binding_" + key)
	var pl: Variant = bindings["player"]
	if typeof(pl) != TYPE_OBJECT or not is_instance_valid(pl):
		return _reject("missing_player")
	if not (pl is Node2D or ("x" in pl and "y" in pl)):
		return _reject("player_position_unreadable")
	for key in ["query_enemies", "frame_provider"]:
		var c: Variant = bindings[key]
		if not (c is Callable) or not (c as Callable).is_valid():
			return _reject(key + "_not_valid_callable")
	var lesson: Variant = bindings["parry_lesson"]
	if lesson == null:
		_lesson_declared_absent = true
		gaps["parry_lesson_declared_absent_19173_branch_skipped"] = 1
	elif lesson is Callable and (lesson as Callable).is_valid():
		_parry_lesson = lesson
	else:
		return _reject("parry_lesson_not_callable_or_null")
	_player = pl
	_query_enemies = bindings["query_enemies"]
	_frame_provider = bindings["frame_provider"]
	_configured = true
	last_error = ""
	return true

## 원본 _resetParryHomingCache (19171). ENGINE 이 projs 루프 진입(35285)에서 update 당 1회 호출한다.
func reset_for_projectile_pass() -> Dictionary:
	if not _configured:
		return {"ok": false, "error": "unconfigured"}
	var f: Variant = _frame_provider.call()
	if not ((f is float or f is int) and is_finite(float(f))):
		return {"ok": false, "error": "frame_provider_not_finite"}
	_done = false
	_target = null
	_pass_frame = float(f)
	reset_count += 1
	return {"ok": true, "error": "", "pass_frame": _pass_frame}

## 원본 _parryHomingTarget (19172-19180).
## 반환: {ok, error, target(Object|null), branch("lesson"|"cache"|"scan"), cached_done, pass_frame, scanned, d2}
## ok=false 이면 캐시 상태는 호출 전 그대로다.
func query() -> Dictionary:
	query_count += 1
	var out := {"ok": false, "error": "", "target": null, "branch": "", "cached_done": _done, "pass_frame": _pass_frame}
	if not _configured:
		return _fail(out, "unconfigured")
	var f: Variant = _frame_provider.call()
	if not ((f is float or f is int) and is_finite(float(f))):
		return _fail(out, "frame_provider_not_finite")
	if _pass_frame == null:
		return _fail(out, "query_outside_projectile_pass_reset_35285_missing")
	if float(f) != float(_pass_frame):
		return _fail(out, "stale_pass_frame_reset_35285_missing")
	# 19173 레슨 분기: 캐시를 읽지도 쓰지도 않는다.
	if not _lesson_declared_absent:
		var l: Variant = _parry_lesson.call()
		if l != null and not (l is Dictionary or (typeof(l) == TYPE_OBJECT and is_instance_valid(l))):
			return _fail(out, "parry_lesson_state_unreadable")
		if l != null and _truthy(_field(l, "active")):
			var pe: Variant = _field(l, "parryEnemy")
			var ch: Variant = _field(l, "chapter")
			var st: Variant = _field(l, "step")
			var hit: bool = _num_eq(ch, LESSON_CHAPTER) and (_num_eq(st, LESSON_STEPS[0]) or _num_eq(st, LESSON_STEPS[1])) \
				and pe != null and _truthy(_field(pe, "alive"))
			lesson_count += 1
			out["ok"] = true
			out["branch"] = "lesson"
			out["target"] = pe if hit else null
			last_query = out
			return out
	# 19174 캐시 재사용(null 포함, 재검사 없음)
	if _done:
		if typeof(_target) == TYPE_OBJECT and not is_instance_valid(_target):
			# 원본 JS 객체는 해제되지 않는다. 같은 패스 안 Godot 해제는 ENGINE 수명 결함 → 캐시는 유지, 명시 오류.
			return _fail(out, "cached_target_freed_engine_lifecycle")
		cache_hit_count += 1
		out["ok"] = true
		out["branch"] = "cache"
		out["target"] = _target
		last_query = out
		return out
	# 19176-19178 스캔
	var pp := _player_pos()
	if not pp.is_finite():
		return _fail(out, "player_position_not_finite")
	var ne: Variant = _query_enemies.call(pp.x, pp.y, SOURCE_QUERY_R)
	scan_count += 1
	if not (ne is Array):
		return _fail(out, "query_enemies_result_not_array")
	var sel: Dictionary = source_select(pp, ne)
	if not sel["ok"]:
		return _fail(out, sel["error"])
	# 19175/19179 커밋(스캔 성공 후에만)
	_done = true
	_target = sel["target"]
	out["ok"] = true
	out["branch"] = "scan"
	out["target"] = _target
	out["scanned"] = sel["scanned"]
	out["d2"] = sel["d2"]
	out["cached_done"] = true
	last_query = out
	return out

## black Shot.apply_source_q_reflection 의 homing_target_provider 로 넘길 Callable.
## 정상: 원본 결과(Object 또는 정당한 무표적 null). 바인딩 오류: QueryError(black 이 변이 없이 거부).
func get_carrier_provider() -> Callable:
	return _carrier_query

func _carrier_query() -> Variant:
	carrier_provider_calls += 1
	var r := query()
	if not r["ok"]:
		return QueryError.new(r["error"])
	return r["target"]

## 현재 P.x/P.y — SKILL 이 black ctx.player_position 에 같은 값을 넣는다(원본 aim 기준 P).
func player_position() -> Vector2:
	return _player_pos() if _configured else Vector2.INF

func get_snapshot() -> Dictionary:
	return {"configured": _configured, "done": _done,
		"target_id": _target.get_instance_id() if typeof(_target) == TYPE_OBJECT and is_instance_valid(_target) else 0,
		"target_is_null": _target == null, "pass_frame": _pass_frame, "reset_count": reset_count,
		"query_count": query_count, "scan_count": scan_count, "cache_hit_count": cache_hit_count,
		"lesson_count": lesson_count, "error_count": error_count, "carrier_provider_calls": carrier_provider_calls,
		"automatic_driver_steps": automatic_driver_steps, "lesson_declared_absent": _lesson_declared_absent,
		"gaps": gaps.duplicate(), "last_error": last_error}

## 19176-19178 순수 선택. candidates 는 원본 shQuery 순서 그대로 순회하며 필터·재정렬하지 않는다.
## 원본 e.alive/e.x/e.y 를 읽을 수 없는 후보는 바인딩 오류(원본 ens 원소는 항상 이 필드를 가진다).
## NaN 좌표는 원본처럼 d<_m 이 거짓이 되어 자연히 제외된다.
static func source_select(pp: Vector2, candidates: Array) -> Dictionary:
	var t: Variant = null
	var m := SOURCE_INIT_MIN_D2
	var n := 0
	for i in range(candidates.size()):
		var e: Variant = candidates[i]
		# 해제된 인스턴스에 `is` 를 먼저 쓰지 않는다(유효성 먼저).
		if typeof(e) != TYPE_OBJECT or not is_instance_valid(e):
			return {"ok": false, "error": "candidate_%d_not_live_object" % i}
		if not ("alive" in e):
			return {"ok": false, "error": "candidate_%d_missing_alive" % i}
		var alive: Variant = e.get("alive")
		if not (alive is bool):
			return {"ok": false, "error": "candidate_%d_alive_not_bool" % i}
		n += 1
		if not alive:
			continue
		var ep: Variant = _enemy_pos(e)
		if ep == null:
			return {"ok": false, "error": "candidate_%d_position_unreadable" % i}
		var v: Vector2 = ep
		var d := (v.x - pp.x) * (v.x - pp.x) + (v.y - pp.y) * (v.y - pp.y)   # 32385 dst2
		if d < m:
			m = d
			t = e
	var d2: Variant = null
	if t != null:
		d2 = m
	return {"ok": true, "error": "", "target": t, "d2": d2, "scanned": n}

# black Shot 이 목표 위치를 읽는 순서와 같다(Node2D → global_position/position, 아니면 x/y).
static func _enemy_pos(e: Object) -> Variant:
	if e is Node2D:
		var nd := e as Node2D
		return nd.global_position if nd.is_inside_tree() else nd.position
	if "x" in e and "y" in e:
		var x: Variant = e.get("x")
		var y: Variant = e.get("y")
		if (x is float or x is int) and (y is float or y is int):
			return Vector2(float(x), float(y))
	return null

func _player_pos() -> Vector2:
	if not is_instance_valid(_player):
		return Vector2.INF
	if _player is Node2D:
		var n := _player as Node2D
		return n.global_position if n.is_inside_tree() else n.position
	var x: Variant = _player.get("x")
	var y: Variant = _player.get("y")
	if not ((x is float or x is int) and (y is float or y is int)):
		return Vector2.INF
	return Vector2(float(x), float(y))

static func _field(o: Variant, key: String) -> Variant:
	if o is Dictionary:
		return o.get(key)
	if typeof(o) == TYPE_OBJECT and is_instance_valid(o) and key in o:
		return o.get(key)
	return null

# JS 참/거짓(이 분기에 오는 타입만).
static func _truthy(v: Variant) -> bool:
	match typeof(v):
		TYPE_NIL:
			return false
		TYPE_BOOL:
			return v
		TYPE_INT:
			return v != 0
		TYPE_FLOAT:
			return v != 0.0 and not is_nan(v)
		TYPE_STRING, TYPE_STRING_NAME:
			return String(v) != ""
		TYPE_OBJECT:
			return is_instance_valid(v)
	return true

# JS === (number 끼리만 참)
static func _num_eq(v: Variant, n: int) -> bool:
	return (v is int or v is float) and float(v) == float(n)

func _fail(out: Dictionary, reason: String) -> Dictionary:
	error_count += 1
	out["ok"] = false
	out["error"] = reason
	out["target"] = null
	last_error = reason
	last_query = out
	return out

func _reject(reason: String) -> bool:
	last_error = reason
	return false
