extends Node2D
##
## FDG Godot 이식 — 보호막 Q진입 임팩트 버스트 렌더러(G._sbBurst draw). TASK GODOT-PORT-SHIELD_BURST_VISUAL-FIRST-20261013.
##
## 원 R: game.html drawP() "보호막 Q진입 — 초반 임팩트 버스트 렌더" @59935~60024 (canonical
##   /Users/fordeargamers/Projects/exoduser-migration-20261001/game.html). 원 draw 분기를 실제 Node2D
##   _draw 프리미티브(draw_circle/draw_arc/draw_polyline)로 옮긴다. scalar getter/recipe 전용 아님.
##
## 소유: 격리 포트 모듈(port_modules/shield_burst_visual). combat_qe_runtime.gd BurstRing 은 READ ONLY.
##   - 이 노드는 _process/_physics_process/_input 0, 자체 시계/RNG 0. ring r/alive/max_r 를 쓰지 않는다.
##   - ENGINE 의 기존 World render phase 가 매 소스 프레임 request_render() 를 호출 → queue_redraw → _draw.
##   - 좌표: 원은 카메라 변환 안에서 월드 좌표(_b.x,_b.y)로 그린다 → 이 노드는 월드 캔버스 아래
##     항등 변환으로 붙어야 한다(ENGINE seam). 이 노드는 자기 transform 을 바꾸지 않는다.
##   - 블렌드: 원 블록은 globalCompositeOperation 을 설정하지 않음(X.save 상속, 기본 source-over)
##     → Godot CanvasItem 기본 BLEND_MODE_MIX. material 미설정.
##
## 원 소스 의존(이 노드가 소유하지 않음 → provider 주입):
##   ring      : G._sbBurst 대응 BurstRing(x,y,r,max_r,det,peace,alive) — ENGINE 의 활성 ring
##   now_ms    : 원 drawP `const t=_now` (_now=_gameTime+_acc, ms, game.html:55910/62416) — peace 전용
##   rand      : 원 render-time Math.random() 대응 [0,1) — ENGINE RNG(로컬 RNG 금지)
##   release   : 원 _b.release (game.html:34386/34409) — BurstRing 에 필드 없음 → ENGINE/SKILL 제공
##

## 원 상수 (game.html:59944~60019)
const SRC_PEACE_COLS: Array[String] = ["#ff2244", "#ff8800", "#ffee00", "#00ff66", "#00ccff", "#8855ff", "#ff44cc"]  # _pcCols
const SRC_PEACE_N := 7          # _pcN 7가닥 무지개 번개
const SRC_PEACE_SEGS := 5       # _segs 지그재그 분할
const SRC_PEACE_SEED_MS := 40.0 # _seed=~~(t/40)
const SRC_DEF_C1 := "#4488ff"   # _bC1 기본
const SRC_DEF_C2 := "#88bbff"   # _bC2 기본
const SRC_DET_C1 := "#ff4400"   # _bC1 기폭팔
const SRC_DET_C2 := "#ff8844"   # _bC2 기폭팔
const SRC_SPARK_GATE := 0.7     # if(_bP<.7)

## Godot 백엔드 테셀레이션(원 canvas arc 는 해석적 → 원작 프레임 수와 무관한 backend 분할)
const ARC_TESS_PX := 4.0
const ARC_TESS_MIN := 8
const ARC_TESS_MAX := 192

const ST_UNCONFIGURED := "UNCONFIGURED"
const ST_NO_RING_PROVIDER := "NO_RING_PROVIDER"
const ST_NO_BURST := "NO_BURST"             # 원 if(G._sbBurst) 거짓
const ST_EXPIRED := "BURST_EXPIRED"         # 원 r>=maxR → G._sbBurst=null (36563)
const ST_DRAWN_PEACE := "DRAWN_PEACE"
const ST_DRAWN_DEFAULT := "DRAWN_DEFAULT"
const ST_MISSING := "MISSING_PROVIDER:"

var _ring_provider: Callable = Callable()
var _now_provider: Callable = Callable()
var _rand_provider: Callable = Callable()
var _release_provider: Callable = Callable()

var _cmds: Array = []
var _ga: float = 1.0                 # canvas globalAlpha 상태(범위 밖/NaN 대입은 무시 = canvas 규칙)

var last_status: String = ST_UNCONFIGURED
var last_snapshot: Dictionary = {}
var last_rand_calls: int = 0
var draw_pass_count: int = 0          # 실제 _draw 실행 횟수
var drawn_ops: Array = []             # 마지막 _draw 에서 실제 호출된 프리미티브

## ring_provider: () -> BurstRing|null. visual_providers: { now_ms, rand, release(ring)->bool } Callable.
## Callable 은 RefCounted 대상을 유지하지 않는다 → 호출측이 provider 객체 수명을 보장해야 한다.
func configure(ring_provider: Callable, visual_providers: Dictionary = {}) -> void:
	_ring_provider = ring_provider
	_now_provider = visual_providers.get("now_ms", Callable())
	_rand_provider = visual_providers.get("rand", Callable())
	_release_provider = visual_providers.get("release", Callable())
	_cmds = []
	last_status = ST_UNCONFIGURED if not _ring_provider.is_valid() else "CONFIGURED"

## ENGINE World render phase 에서 1 소스 프레임당 1회. ring 을 읽기만 하고 draw list 를 만든 뒤 redraw 요청.
## 원 render-time Math.random 소비 순서를 여기서 1회 재현 → 동일 프레임의 재-_draw 는 같은 그림.
func request_render() -> bool:
	_cmds = []
	last_rand_calls = 0
	var ok := _build()
	if not ok:
		_cmds = []
	queue_redraw()
	return ok

func commands() -> Array:
	return _cmds.duplicate(true)

## BurstRing 읽기 전용 스냅샷(필드 read 만, 메서드 호출 0).
static func snapshot_of(ring: Object) -> Dictionary:
	if ring == null:
		return {}
	return {
		"x": float(ring.get("x")), "y": float(ring.get("y")),
		"r": float(ring.get("r")), "max_r": float(ring.get("max_r")),
		"spd": float(ring.get("spd")), "det": bool(ring.get("det")),
		"peace": bool(ring.get("peace")), "alive": bool(ring.get("alive")),
	}

func _build() -> bool:
	if not _ring_provider.is_valid():
		last_status = ST_NO_RING_PROVIDER
		return false
	var ring: Object = _ring_provider.call()
	if ring == null:
		last_snapshot = {}
		last_status = ST_NO_BURST
		return false
	var s := snapshot_of(ring)
	last_snapshot = s
	if not s["alive"]:
		last_status = ST_EXPIRED
		return false
	var c := Vector2(s["x"], s["y"])
	var r: float = s["r"]
	var b_p: float = r / s["max_r"]            # _bP=_b.r/_b.maxR
	var b_f: float = 1.0 - b_p                 # _bF=1-_bP
	_ga = 1.0                                  # X.save() 상속값(블록 내 모든 draw 전 명시 대입)
	if s["peace"]:
		if not _now_provider.is_valid():
			last_status = ST_MISSING + "now_ms"
			return false
		if not _rand_provider.is_valid():
			last_status = ST_MISSING + "rand"
			return false
		_build_peace(c, r, b_p, b_f, float(_now_provider.call()))
		last_status = ST_DRAWN_PEACE
		return true
	if not _release_provider.is_valid():
		last_status = ST_MISSING + "release"
		return false
	if b_p < SRC_SPARK_GATE and not _rand_provider.is_valid():
		last_status = ST_MISSING + "rand"
		return false
	var release_r: float = s["max_r"] if bool(_release_provider.call(ring)) else 0.0  # _bReleaseR
	_build_default(c, r, b_p, b_f, bool(s["det"]), release_r)
	last_status = ST_DRAWN_DEFAULT
	return true

## ═══ 평화충격파 (원 59942~59992) ═══
func _build_peace(c: Vector2, r: float, b_p: float, b_f: float, t: float) -> void:
	_alpha(.3 * b_f); _fill(c, r * .4, "#ffffff")
	_alpha(.15 * b_f); _fill(c, r * .7, "#ffaadd")
	var src_seed := src_to_int32(t / SRC_PEACE_SEED_MS)  # _seed=~~(t/40) — JS ToInt32
	for li in SRC_PEACE_N:
		var ang: float = PI * 2.0 * li / SRC_PEACE_N + b_p * 2.0 + sin(src_seed * .3 + li) * 0.3
		var e := Vector2(c.x + cos(ang) * r, c.y + sin(ang) * r)
		var pts := PackedVector2Array()
		for si in SRC_PEACE_SEGS + 1:
			var t2: float = float(si) / SRC_PEACE_SEGS
			var mid := si > 0 and si < SRC_PEACE_SEGS
			var jx: float = (_rand() - .5) * r * .15 if mid else 0.0
			var jy: float = (_rand() - .5) * r * .15 if mid else 0.0
			pts.append(Vector2(c.x + (e.x - c.x) * t2 + jx, c.y + (e.y - c.y) * t2 + jy))
		var col: String = SRC_PEACE_COLS[li]
		_alpha(.3 * b_f); _poly(pts, col, 6.0)          # 글로우 패스
		_alpha(.8 * b_f); _poly(pts, col, 2.0)          # 코어 패스
		_alpha(.6 * b_f); _poly(pts, "#ffffff", .8)     # 백색 코어
		_alpha(.5 * b_f); _fill(e, 4.0 + _rand() * 3.0, col)  # 끝점 글로우
	_alpha(.5 * b_f)                                    # 외곽 링 (무지개 회전), lineWidth=3
	for ri in SRC_PEACE_N:
		var a1: float = PI * 2.0 * ri / SRC_PEACE_N + b_p * 3.0
		_arc(c, r, a1, a1 + PI * 2.0 / SRC_PEACE_N * .8, SRC_PEACE_COLS[ri], 3.0)
	_alpha(.4 * b_f); _arc(c, r, 0.0, TAU, "#ffffff", 1.5)  # 백색 외곽

## ═══ 기본/기폭팔 충격파 (원 59993~60021) ═══
func _build_default(c: Vector2, r: float, b_p: float, b_f: float, det: bool, release_r: float) -> void:
	var c1: String = SRC_DET_C1 if det else SRC_DEF_C1
	var c2: String = SRC_DET_C2 if det else SRC_DEF_C2
	var lw: float = 7.0 if det else 5.0
	if release_r > 0.0:                                 # Q 해제: 저장 반경 버블 외곽 유지
		_alpha(maxf(.06, .18 * b_f)); _fill(c, release_r, c1)
		_alpha(maxf(.24, .6 * b_f)); _arc(c, release_r, 0.0, TAU, c2, 3.0)
	_alpha((.45 if det else .35) * b_f); _fill(c, r, c1)
	_alpha((.6 if det else .5) * b_f); _fill(c, r * .5, c2)
	_alpha(.85 * b_f); _arc(c, r, 0.0, TAU, c2, lw)
	_alpha(.6 * b_f); _arc(c, r, 0.0, TAU, "#ffffff", 2.0)
	var n: int = 12 if det else 8
	if b_p < SRC_SPARK_GATE:
		for k in n:
			var ba: float = PI * 2.0 * k / n
			var br: float = r * .7 + _rand() * r * .3
			_alpha(.7 * (1.0 - b_p / SRC_SPARK_GATE))
			var sr: float = (4.0 if det else 3.0) + _rand() * 3.0
			_fill(Vector2(c.x + cos(ba) * br, c.y + sin(ba) * br), sr, "#ffffff" if k % 2 == 0 else c1)

## JS ToInt32 (원 `~~x`): 비유한(NaN/±Inf) → 0, 0방향 절삭, mod 2^32, ≥2^31 이면 −2^32 (signed32).
## GDScript int() 는 int64 라 2^31 이상에서 원과 다르다 → 원 seed 1개 전용 변환.
static func src_to_int32(v: float) -> int:
	if not is_finite(v):
		return 0
	var tr: float = v - fmod(v, 1.0)            # trunc (fmod 는 피제수 부호 유지)
	var m: float = fmod(tr, 4294967296.0)       # 정수 double → 정확
	if m < 0.0:
		m += 4294967296.0
	if m >= 2147483648.0:
		m -= 4294967296.0
	return int(m)

## canvas globalAlpha 대입 규칙: 유한하고 [0,1] 범위일 때만 반영.
func _alpha(v: float) -> void:
	if is_finite(v) and v >= 0.0 and v <= 1.0:
		_ga = v

func _rand() -> float:
	last_rand_calls += 1
	return float(_rand_provider.call())

func _col(hex: String) -> Color:
	return Color(Color.html(hex), _ga)

func _fill(c: Vector2, r: float, hex: String) -> void:
	_cmds.append({"op": "fill_circle", "c": c, "r": r, "col": _col(hex)})

func _arc(c: Vector2, r: float, a0: float, a1: float, hex: String, w: float) -> void:
	var pc := clampi(int(ceil(absf(a1 - a0) * maxf(r, 1.0) / ARC_TESS_PX)), ARC_TESS_MIN, ARC_TESS_MAX)
	_cmds.append({"op": "stroke_arc", "c": c, "r": r, "a0": a0, "a1": a1, "pc": pc, "col": _col(hex), "w": w})

func _poly(pts: PackedVector2Array, hex: String, w: float) -> void:
	_cmds.append({"op": "polyline", "pts": pts, "col": _col(hex), "w": w})

func _draw() -> void:
	draw_pass_count += 1
	drawn_ops = []
	for cmd in _cmds:
		match cmd["op"]:
			"fill_circle":
				draw_circle(cmd["c"], cmd["r"], cmd["col"])
			"stroke_arc":
				draw_arc(cmd["c"], cmd["r"], cmd["a0"], cmd["a1"], cmd["pc"], cmd["col"], cmd["w"], true)
			"polyline":
				draw_polyline(cmd["pts"], cmd["col"], cmd["w"], true)
		drawn_ops.append(cmd["op"])
