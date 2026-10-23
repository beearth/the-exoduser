extends RefCounted
## PC-PLAYER-SHIELD (2026-10-23) — 원본 hurtP 에너지쉴드 블록 실행자.
## game.html(sha dee094fd) G43544~43566. Player 피해 경로 두 곳(_apply_native_damage 직격,
## _receive_native_burn_damage 화상 DOT)이 최소뎀 계산 직후·HP 감산 직전에 부른다.
##   P 쓰기(shieldRegenT=180·shield)          → State.apply_native_player_shield_hit (P dict 소유자)
##   u_d20 _uEq('_uShieldBreakBank') 판독 G43552 → Main 공급 콜백 u_eq (값>0이면 _uqS 미이식 → 기록만)
##   addTxt '⚡쉴드 파괴!' G43558 · poolPart×10 G43559 · addTxt '❄-'+a G43563 → World 텍스트·파티클
## 원본에 없는 것(사운드·화면 흔들림·별도 연출)은 넣지 않는다 — 격파 시 원본도 소리 없음.

const BREAK_COLOR := "#4488ff" # G43558/G43559/G43563

## a = hurtP 지역 변수 a(int). 반환 {applied, a(쉴드 뒤), broke, full_block, …}.
## State가 없거나(P dict 미설치 단위 테스트) 준비 전이면 applied=false·a 그대로(기존 동작).
static func absorb(player: Node2D, a: int) -> Dictionary:
	var main: Node = player.get_parent()
	if not is_instance_valid(main):
		return {"applied": false, "a": a, "reason": "main_missing"}
	var state: Variant = main.get("source_state")
	if not is_instance_valid(state) or not state.has_method("apply_native_player_shield_hit"):
		return {"applied": false, "a": a, "reason": "state_missing"}
	var r: Dictionary = state.apply_native_player_shield_hit(main, float(a))
	if r.get("ready") != true or r.get("applied") != true:
		r["applied"] = false
		r["a"] = a
		return r
	var at: Vector2 = player.global_position
	var unported: Array = []
	if r.get("broke") == true:
		# G43552~43557 u_d20 파열 저장 — 판독 순서 그대로. _uqS(shieldBankCd/T/Amt)·Q 패링 방출(G38536)은 미이식.
		var sbk: Variant = _u_eq(main, "_uShieldBreakBank")
		if sbk == null:
			unported.append("u_eq_not_ready:_uShieldBreakBank")
		elif float(sbk) > 0.0:
			unported.append("unported_branch_active:_uShieldBreakBank")
		_text(main, at.x, at.y - 30.0, _tr(main, "⚡쉴드 파괴!"), BREAK_COLOR, 50) # G43558
		var world: Variant = main.get("world")
		var parts := 0
		for k in range(10): # G43559
			var sa: float = PI * 2.0 * float(k) / 10.0
			var sz: float = 3.0 + _rand(world) * 2.0
			var life: float = 15.0 + _rand(world) * 8.0
			if is_instance_valid(world) and world.has_method("emit_native_source_particle"):
				if world.emit_native_source_particle({"position": at, "velocity": Vector2(cos(sa) * 5.0, sin(sa) * 5.0),
						"color": Color(BREAK_COLOR), "size": sz, "life_ticks": life, "render_owner": "pc_player_shield"}):
					parts += 1
		r["break_particles"] = parts
	else:
		_text(main, at.x, at.y - 25.0, "❄-" + str(a), BREAK_COLOR, 20) # G43563 (_T 없음)
	r["unported"] = unported
	return r

static func _u_eq(main: Node, stat: String) -> Variant:
	if not main.has_method("get_native_normal_enemy_damage_provider_callbacks"):
		return null
	var reader: Variant = main.get_native_normal_enemy_damage_provider_callbacks().get("u_eq")
	if not reader is Callable or not reader.is_valid():
		return null
	var v: Variant = reader.call(stat)
	if not v is Dictionary or str(v.get("status")) != "READY" or not (v.get("value") is int or v.get("value") is float):
		return null
	return float(v["value"])

static func _rand(world: Variant) -> float:
	# Math.random() — 원본 인자 평가 순서(크기 → 수명)대로 World 난수를 1회씩 소비.
	if is_instance_valid(world) and world.has_method("sample_native_random_unit"):
		return float(world.sample_native_random_unit())
	return 0.0 # World 없음 → 파티클도 없음(전역 RNG 미소비)

static func _tr(main: Node, text: String) -> String:
	if main.has_method("translate_native_boot_label"):
		var v: Variant = main.translate_native_boot_label(text)
		if v is String:
			return v
	return text

static func _text(main: Node, x: float, y: float, text: String, col: String, life: int) -> void:
	var world: Variant = main.get("world")
	if is_instance_valid(world) and world.has_method("emit_native_text"):
		world.emit_native_text(x, y, text, col, life)
