extends Node2D
## PC-ENEMY-ACTORS (2026-10-23) — G 계열 표시 전용 장식(원본 drawEn 53758–53946). 상태·RNG·시계 쓰기 0.
## 원본 _eDecor = !(G.hitStop>0&&!e.ib)&&dst2(P,e)<360000. etype 7/13/14/16/17 고유 장식 + 상태 장식
## (eCharge 붉은 구체 53929 / eSwoop 잔상 53939 / eSlamWind 충격파 53941 / eSummon 채널링 53945).
## 1장(20–29) 공통 얼음 오라·29 이중 아크(53839–53859)는 Mac 공통 장식(SourceEnemyDecor)이 있으면 그쪽이 그린다(중복 0).
var actor: Node2D
var visual_clock_ms: float = -1

func configure(owner_actor: Node2D) -> void:
	actor = owner_actor
	z_as_relative = true
	actor.draw.connect(queue_redraw)

func _now() -> float: return visual_clock_ms if visual_clock_ms >= 0 else float(Time.get_ticks_msec())

func _c(hex: String, a: float) -> Color: return Color(Color(hex), clampf(a, 0, 1))

func _draw() -> void:
	if not is_instance_valid(actor) or not actor.alive or not is_instance_valid(actor.player): return
	var g: Variant = actor.world.get_parent().source_state.read_current_g()
	if g is Dictionary and float(g.get("hitStop", 0)) > 0: return
	if actor.global_position.distance_squared_to(actor.player.global_position) >= 360000: return
	var e: Dictionary = actor.data.native_final
	var r: float = actor.radius
	var now: float = _now()
	var sa: float = 1.0 # 원본 sa: 은신·부활무적·스턴 투명도(본체와 같은 식)
	if e.get("_cloaked", false): sa = 0.08 + sin(now / 300) * 0.05
	elif float(e.get("reviveIframes", 0)) > 0: sa = maxf(0, 0.2 + sin(now / 40) * 0.5)
	elif actor._stun_ticks > 0: sa = 0.6
	match actor.etype:
		7: # 53788 리치: 보라 후광 + 중심 X
			draw_circle(Vector2.ZERO, r + 8, _c("#8833cc", 0.2 + sin(now / 300) * 0.1))
			draw_line(Vector2(-4, -4), Vector2(4, 4), _c("#cc66ff", sa * 0.8), 2, true)
			draw_line(Vector2(4, -4), Vector2(-4, 4), _c("#cc66ff", sa * 0.8), 2, true)
		13: # 53819 거미: 다이아몬드
			var sl: float = r * 1.2
			draw_colored_polygon(PackedVector2Array([Vector2(-sl, 0), Vector2(0, -sl * 0.6), Vector2(sl, 0), Vector2(0, sl * 0.6)]), _c("#9b6b6b", 0.3))
		14: # 53821 날개 아크
			var wf: float = sin(now / 200) * 0.3
			var f: float = float(actor.facing)
			draw_arc(Vector2.ZERO, r + 6, f - 1.8 + wf, f - 0.4 + wf, 16, _c("#4a6b4a", 0.25 + wf * 0.1), 2, true)
			draw_arc(Vector2.ZERO, r + 6, f + 0.4 - wf, f + 1.8 - wf, 16, _c("#4a6b4a", 0.25 + wf * 0.1), 2, true)
		16: # 53829 덫사도 보라 위험 마크
			draw_circle(Vector2.ZERO, r + 4, _c("#5e10a8", 0.2 + sin(now / 250) * 0.1))
		17: # 53831 모체 적갈색 맥동
			draw_circle(Vector2.ZERO, r + 8, _c("#6b2a2a", 0.2 + sin(now / 400) * 0.1))
	if actor.etype >= 20 and actor.etype <= 29 and actor.get_node_or_null("SourceEnemyDecor") == null:
		draw_circle(Vector2.ZERO, r + 5, _c("#88ccff", 0.15 + sin(now / 250) * 0.08))
		for i in 2:
			var fa: float = now / 200 + i * 3.14 + actor.etype
			var fr: float = r + 6 + sin(now / 150 + i) * 3
			draw_rect(Rect2(Vector2(cos(fa), sin(fa)) * fr - Vector2.ONE, Vector2(2, 2)), _c("#cceeff", 0.4))
		if actor.etype == 29:
			draw_arc(Vector2.ZERO, r + 15, now / 200, now / 200 + PI * 1.6, 32, _c("#4455aa", 0.25 + sin(now / 150) * 0.12), 3, true)
			draw_arc(Vector2.ZERO, r + 10, -now / 250, -now / 250 + PI * 1.2, 24, _c("#88ccff", 0.25 + sin(now / 150) * 0.12), 2, true)
	var s: String = str(actor.state)
	if s == "eCharge": # 53929 돌진 붉은 전기 구체(내부 poolPart Math.random 은 렌더 RNG — 미소비)
		var br: float = r + 5 + sin(now * 0.08) * 2
		draw_circle(Vector2.ZERO, br * 1.4, Color(1, 60.0 / 255, 60.0 / 255, 0.3))
		draw_circle(Vector2.ZERO, br, Color(1, 90.0 / 255, 80.0 / 255, 0.85))
		draw_circle(Vector2.ZERO, br * 0.5, Color(1, 200.0 / 255, 180.0 / 255, 0.9))
		for ai in 5:
			var aa: float = TAU / 5 * ai + now * 0.015
			var p0 := Vector2(cos(aa), sin(aa)) * br * 0.3
			var ma: float = aa + 0.4 + sin(now * 0.02 + ai) * 0.5
			var mr: float = br * 0.65 + sin(now * 0.025 + ai * 2) * 3
			var p2 := Vector2(cos(aa), sin(aa)) * br * 0.9
			var c1 := Vector2(cos(ma), sin(ma)) * mr
			var pts := PackedVector2Array()
			for k in 9:
				var t: float = k / 8.0
				pts.append(p0 * (1 - t) * (1 - t) + c1 * 2 * (1 - t) * t + p2 * t * t)
			draw_polyline(pts, _c("#ff8866", 0.7 + 0.2 * sin(now * 0.06)), 2, true)
		draw_circle(Vector2.ZERO, br * 0.35, Color(1, 1, 1, 0.9))
	elif s == "eSwoop": # 53939 급강하 잔상
		var dx: float = float(e.get("echDx", 0))
		var dy: float = float(e.get("echDy", 0))
		for ci in range(1, 4):
			draw_circle(Vector2(-dx * 7 * ci, -dy * 7 * ci), r, Color(Color(str(e.col)), 0.12 / ci))
	elif s == "eSlamWind": # 53941 지면강타 충격파
		var prog: float = 1 - float(actor.st2) / 40.0
		draw_arc(Vector2.ZERO, r + 20 * prog, 0, TAU, 40, _c("#4a1a1a", 0.3 * prog), 4, true)
	elif s == "eSummon": # 53945 소환 채널링
		draw_arc(Vector2.ZERO, r + 12, 0, TAU, 40, _c("#8833cc", 0.3 + sin(now / 100) * 0.2), 3, true)
