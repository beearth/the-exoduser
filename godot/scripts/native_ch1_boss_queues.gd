extends RefCounted
## PC-BOSS-CORE (2026-10-22) — 1장 보스 전역 큐 tick 순수 실행자(원본 update() 37015–37129 의 보스 생산 큐).
##   _chaseAoes 37015–37053 · _fissures 37067 · _tideWaves 37069 · _seekerMines 37071 · _poisonPools 37079 · _lavaPools 37129
##   + 보스 지뢰(mine:true 정지탄) 투사체 루프 34671·34678–34688
## 원본 실행 순서: (투사체 루프의 지뢰) → chase → fissure → tide → seeker → poison → (리듬탄·ORB: BC09) → lava.
## 상태 소유 0: 큐 배열 사본을 받아 갱신본을 돌려준다. P 판정·피해·패링·표시·RNG 는 env(PC core/테스트 env).
## env: q_player()->{x,y,r,iframes,s,kb}  q_hurt(dmg,opts)  q_kb_add(kx,ky)  q_is_p_win()->bool
##      q_parry(bank_add,in_dmg)  q_rng(tag,line)->float  q_present(cmd,args,line)  q_text(x,y,text,col,life)
##      q_shake(n)  q_tr(text)  q_status(field,value)  q_el_mul(a)->float(elMul(a,ar().el))
## 미이식(기록만): 독장판/ORB/분출의 플레이어 P.poison·P._webSlow(플레이어 상태 writer 부재) — q_status 로 core 가 기록.
const ELC := ["#bbbbbb", "#ff5522", "#3388ff", "#9933cc", "#ffee00", "#ff88cc", "#88aa44"] # 14338

static func tick_mines(mines: Array, sp: float, env: Object) -> Array:
	var kept: Array = []
	for m0 in mines:
		var p: Dictionary = m0.duplicate(true)
		p.life = _n(p.life) - sp * 0.667 # 34671
		var dead := false
		p.vx = 0
		p.vy = 0
		var P: Dictionary = env.q_player()
		if _dst(P, p) < 30 and _n(P.iframes) <= 0 and str(P.s) != "charge": # 34681
			env.q_hurt(_i32(_n(p.dmg) * env.q_el_mul(int(_n(p.el)))), {"dtype": "magic", "src": env.q_tr("지뢰"), "druidPoison": p.get("_druidPoison") == true})
			P = env.q_player()
			var ka: float = atan2(_n(P.y) - _n(p.y), _n(P.x) - _n(p.x))
			env.q_kb_add(cos(ka) * 10, sin(ka) * 10)
			P = env.q_player()
			env.q_text(P.x, _n(P.y) - 20, env.q_tr("💥 지뢰!"), "#ffcc00", 40)
			env.q_present("addParts", [p.x, p.y, "#ffaa00", 12], 34684)
			env.q_shake_set(6)
			dead = true
		elif _n(p.life) <= 0:
			env.q_present("addParts", [p.x, p.y, "#ffcc00", 5], 34686)
			dead = true
		if not dead: kept.append(p)
	return kept

static func tick(g: Dictionary, sp: float, env: Object, si: int = 0) -> Dictionary:
	var out := {}
	# ── 37015–37053 추적 장판 ──
	if g.get("_chaseAoes") is Array and not (g._chaseAoes as Array).is_empty():
		var kept: Array = []
		for c0 in g._chaseAoes:
			var ca: Dictionary = c0.duplicate(true)
			ca.t = _n(ca.t) + sp
			if _n(ca.t) >= _n(ca.interval) and _n(ca.cnt) < _n(ca.maxCnt):
				ca.t = 0
				ca.cnt = _n(ca.cnt) + 1
				if not ca.get("zones") is Array: ca.zones = []
				var P0: Dictionary = env.q_player()
				ca.zones.append({"x": P0.x, "y": P0.y, "r": ca.r, "t": 0, "delay": ca.delay, "dmg": ca.dmg, "el": ca.el, "hit": false, "druid": ca.get("druid")})
			if ca.get("zones") is Array:
				var zk: Array = []
				for z in ca.zones:
					z.t = _n(z.t) + sp
					if not _t(z.get("hit")) and _n(z.t) >= _n(z.delay):
						z.hit = true
						z.explT = 0
						z.explMax = 15
						env.q_present("SFX.detonate", [], 37032)
						env.q_shake(6)
						if _t(z.get("druid")): env.q_present("playVFXAng", ["druid_hit", z.x, z.y, _n(z.r) * 1.7 / 362.0, 3, 0, false], 37033)
						var P: Dictionary = env.q_player()
						if _dst(P, z) < _n(z.r) + _n(P.r) and _n(P.iframes) <= 0 and str(P.s) != "charge":
							env.q_hurt(_i32(_n(z.dmg) * env.q_el_mul(int(_n(z.el)))), {})
							P = env.q_player()
							var ka: float = atan2(_n(P.y) - _n(z.y), _n(P.x) - _n(z.x))
							env.q_kb_add(cos(ka) * 8, sin(ka) * 8)
						for k in range(12):
							var a: float = PI * 2 * k / 12.0
							var spd2: float = 3 + env.q_rng("chase_part_speed", 37043) * 4
							var col: String = ("#84a83d" if k % 2 == 0 else "#345334") if _t(z.get("druid")) else ("#ff4400" if k % 2 == 0 else "#ff8800")
							var sz: float = 3 + env.q_rng("chase_part_size", 37044) * 2
							var life: float = 8 + env.q_rng("chase_part_life", 37044) * 6
							env.q_present("poolPart", [_n(z.x) + cos(a) * 10, _n(z.y) + sin(a) * 10, cos(a) * spd2, sin(a) * spd2, col, sz, life], 37044)
					if _t(z.get("hit")):
						z.explT = (_n(z.get("explT")) if _t(z.get("explT")) else 0.0) + sp
						if z.get("explMax") != null and _n(z.explT) >= _n(z.explMax): continue # JS x>=undefined → false
					zk.append(z)
				ca.zones = zk
			if _n(ca.cnt) >= _n(ca.maxCnt) and (not ca.get("zones") is Array or (ca.zones as Array).is_empty()): continue
			kept.append(ca)
		out["_chaseAoes"] = kept
	# ── 37067 균열 ──
	if g.get("_fissures") is Array and not (g._fissures as Array).is_empty():
		var kept: Array = []
		for f0 in g._fissures:
			var fs: Dictionary = f0.duplicate(true)
			fs.t = _n(fs.t) + sp
			var hx: float = _n(fs.x) + cos(_n(fs.ang)) * _n(fs.len)
			var hy: float = _n(fs.y) + sin(_n(fs.ang)) * _n(fs.len)
			var P: Dictionary = env.q_player()
			var to_p: float = atan2(_n(P.y) - hy, _n(P.x) - hx)
			hx += cos(to_p) * _n(fs.spd) * sp
			hy += sin(to_p) * _n(fs.spd) * sp
			fs.ang = atan2(hy - _n(fs.y), hx - _n(fs.x))
			fs.len = minf(_n(fs.maxLen), sqrt((hx - _n(fs.x)) * (hx - _n(fs.x)) + (hy - _n(fs.y)) * (hy - _n(fs.y))))
			hx = _n(fs.x) + cos(_n(fs.ang)) * _n(fs.len)
			hy = _n(fs.y) + sin(_n(fs.ang)) * _n(fs.len)
			if not _t(fs.get("exploded")) and _n(fs.len) >= _n(fs.maxLen):
				fs.exploded = true
				env.q_present("SFX.detonate", [], 37067)
				env.q_shake(12)
				if _t(fs.get("druid")): env.q_present("playVFXAng", ["druid_hit", hx, hy, _n(fs.explR) * 1.5 / 362.0, 3, 0, false], 37067)
				P = env.q_player()
				if sqrt((_n(P.x) - hx) * (_n(P.x) - hx) + (_n(P.y) - hy) * (_n(P.y) - hy)) < _n(fs.explR) and _n(P.iframes) <= 0 and str(P.s) != "charge":
					env.q_hurt(_i32(_n(fs.dmg) * env.q_el_mul(int(_n(fs.el)))), {})
					P = env.q_player()
					var ka: float = atan2(_n(P.y) - hy, _n(P.x) - hx)
					env.q_kb_add(cos(ka) * 10, sin(ka) * 10)
				for k in range(10):
					var a: float = PI * 2 * k / 10.0
					var el: int = int(_n(fs.el))
					var col: String = ELC[el] if el >= 0 and el < ELC.size() else "#ff4400"
					env.q_present("poolPart", [hx, hy, cos(a) * 5, sin(a) * 5, col, 3, 10], 37067)
			if _n(fs.t) < _n(fs.maxT): kept.append(fs)
		out["_fissures"] = kept
	# ── 37069 조류파 ──
	if g.get("_tideWaves") is Array and not (g._tideWaves as Array).is_empty():
		var kept: Array = []
		for w0 in g._tideWaves:
			var tw: Dictionary = w0.duplicate(true)
			tw.t = _n(tw.t) + sp
			tw.r = minf(_n(tw.maxR), _n(tw.r) + _n(tw.spd) * sp)
			tw.hitT = _n(tw.hitT) - sp
			if _n(tw.hitT) <= 0:
				tw.hitT = 10
				var P: Dictionary = env.q_player()
				var pd2: float = _dst(P, tw)
				if absf(pd2 - _n(tw.r)) < _n(tw.w) and _n(P.iframes) <= 0 and str(P.s) != "charge":
					var p_ang: float = atan2(_n(P.y) - _n(tw.y), _n(P.x) - _n(tw.x))
					var gd: float = p_ang - _n(tw.gapAng)
					while gd > PI: gd -= PI * 2
					while gd < -PI: gd += PI * 2
					if absf(gd) > _n(tw.gapSize):
						if env.q_is_p_win():
							env.q_parry(_i32(_n(tw.dmg) * 0.5), _n(tw.dmg))
						else:
							env.q_hurt(_i32(_n(tw.dmg) * env.q_el_mul(int(_n(tw.el)))), {})
			if _n(tw.t) < _n(tw.maxT): kept.append(tw)
		out["_tideWaves"] = kept
	# ── 37071 추적 지뢰 ──
	if g.get("_seekerMines") is Array and not (g._seekerMines as Array).is_empty():
		var kept: Array = []
		for s0 in g._seekerMines:
			var sm: Dictionary = s0.duplicate(true)
			sm.t = _n(sm.t) + sp
			var P: Dictionary = env.q_player()
			if _n(sm.t) > _n(sm.armT):
				var h: float = atan2(_n(P.y) - _n(sm.y), _n(P.x) - _n(sm.x))
				sm.vx = _n(sm.vx) + (cos(h) * _n(sm.spd) * 0.02) * sp
				sm.vy = _n(sm.vy) + (sin(h) * _n(sm.spd) * 0.02) * sp
				var sv: float = sqrt(_n(sm.vx) * _n(sm.vx) + _n(sm.vy) * _n(sm.vy))
				if sv > 1.5:
					sm.vx = _n(sm.vx) * (1.5 / sv)
					sm.vy = _n(sm.vy) * (1.5 / sv)
			sm.x = _n(sm.x) + _n(sm.vx) * sp
			sm.y = _n(sm.y) + _n(sm.vy) * sp
			var del := false
			if _n(sm.t) > _n(sm.armT) and _dst(P, sm) < _n(sm.r) + _n(P.r) and _n(P.iframes) <= 0:
				if env.q_is_p_win():
					var ra: float = atan2(_n(sm.y) - _n(P.y), _n(sm.x) - _n(P.x))
					sm.vx = cos(ra) * 4
					sm.vy = sin(ra) * 4
					sm.t = 0
					sm.armT = 999
					sm.maxT = 120
					env.q_present("SFX.deflect", [], 37071)
				else:
					var el: int = 0 if _t(sm.get("_druidMine")) else int(_n(sm.el))
					env.q_hurt(_i32(_n(sm.dmg) * env.q_el_mul(el)), {"druidPoison": _t(sm.get("_druidMine"))})
					del = true
					env.q_present("SFX.detonate", [], 37071)
					env.q_shake(8)
					for k in range(8):
						var a: float = PI * 2 * k / 8.0
						env.q_present("poolPart", [sm.x, sm.y, cos(a) * 4, sin(a) * 4, "#5e10a8", 3, 8], 37071)
			if _n(sm.t) >= _n(sm.maxT): del = true
			if del:
				env.q_present("SFX.detonate", [], 37071)
				for k in range(6):
					var ux: float = env.q_rng("seeker_end_vx", 37071)
					var uy: float = env.q_rng("seeker_end_vy", 37071)
					env.q_present("poolPart", [sm.x, sm.y, (ux - 0.5) * 4, (uy - 0.5) * 4, "#5e10a8", 2, 6], 37071)
				continue
			kept.append(sm)
		out["_seekerMines"] = kept
	# ── 37079 독웅덩이 ──
	if g.get("_poisonPools") is Array and not (g._poisonPools as Array).is_empty():
		var kept: Array = []
		for q0 in g._poisonPools:
			var pp: Dictionary = q0.duplicate(true)
			pp.t = _n(pp.t) + sp
			pp.tickT = (_n(pp.get("tickT")) if _t(pp.get("tickT")) else 0.0) + sp
			var P: Dictionary = env.q_player()
			if _dst(P, pp) < _n(pp.r) + _n(P.r) and _n(P.iframes) <= 0 and _n(pp.tickT) >= 60:
				pp.tickT = 0
				env.q_hurt(_i32(_n(pp.dmg) * 0.5 * env.q_el_mul(int(_n(pp.el)))), {})
				P = env.q_player()
				env.q_text(P.x, _n(P.y) - 15, env.q_tr("독!"), "#44cc00", 20)
				if si == 0 or si == 3:
					env.q_status("poison+", 2)
					env.q_status("_webSlow>=", 60)
			if _n(pp.t) < _n(pp.maxT): kept.append(pp)
		out["_poisonPools"] = kept
	return out

## 37129 용암 장판(리듬탄·ORB 뒤)
static func tick_lava(g: Dictionary, sp: float, env: Object) -> Variant:
	if not g.get("_lavaPools") is Array or (g._lavaPools as Array).is_empty(): return null
	var kept: Array = []
	for l0 in g._lavaPools:
		var lp: Dictionary = l0.duplicate(true)
		lp.t = _n(lp.t) + sp
		if _n(lp.t) >= _n(lp.warnT):
			lp.tickT = (_n(lp.get("tickT")) if _t(lp.get("tickT")) else 0.0) + sp
			var P: Dictionary = env.q_player()
			if _dst(P, lp) < _n(lp.r) + _n(P.r) and _n(P.iframes) <= 0 and _n(lp.tickT) >= 30:
				lp.tickT = 0
				env.q_hurt(_i32(_n(lp.dmg) * 0.4 * env.q_el_mul(int(_n(lp.el)))), {})
				P = env.q_player()
				env.q_text(P.x, _n(P.y) - 15, "🔥", "#ff4400", 20)
		if _n(lp.t) < _n(lp.maxT): kept.append(lp)
	return kept

static func _dst(a: Dictionary, b: Dictionary) -> float:
	return sqrt((_n(b.x) - _n(a.x)) * (_n(b.x) - _n(a.x)) + (_n(b.y) - _n(a.y)) * (_n(b.y) - _n(a.y)))

static func _n(v: Variant) -> float:
	if v is int or v is float: return float(v)
	if v is bool: return 1.0 if v else 0.0
	return 0.0

static func _t(v: Variant) -> bool:
	if v == null: return false
	if v is bool: return v
	if v is int or v is float: return float(v) != 0.0 and not is_nan(float(v))
	if v is String: return not (v as String).is_empty()
	return true

static func _i32(value: float) -> int:
	if not is_finite(value) or value == 0: return 0
	var wrapped: float = fmod(floor(value) if value >= 0 else ceil(value), 4294967296.0)
	if wrapped < 0: wrapped += 4294967296.0
	if wrapped >= 2147483648.0: wrapped -= 4294967296.0
	return int(wrapped)

## 14344 elMul(a,d)
static func el_mul(a: int, d: int) -> float:
	if (a == 1 and d == 2) or (a == 2 and d == 1) or (a == 3 and d == 4) or (a == 4 and d == 3) \
			or (a == 3 and d == 5) or (a == 5 and d == 3) or (a == 6 and d == 4) or (a == 4 and d == 6): return 2.0
	if a == d and a != 0: return 0.5
	return 1.0
