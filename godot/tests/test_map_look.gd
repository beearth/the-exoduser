extends SceneTree
## MAP-LOOK 계약 회귀: ① 하니스 기본 부팅은 꺼짐(기존 테스트 기준선 불변)
## ② 메타 "on"이면 설치 — 어둠 단계 이관·광원·그림자·전경·입자·재질 적용
## ③ 표시 전용 — 게임플레이 데이터(map.json 충돌·소품 위치)와 G 키 집합 불변.
const USERDIR := "EXODUSER-MapLook-Isolated-20261020"
var assertions := 0
var failures := 0

func _initialize() -> void:
	call_deferred("_run")

func _check(ok: bool, label: String) -> void:
	assertions += 1
	if not ok:
		failures += 1
		print("MAPLOOK_FAIL ", label)

func _boot(mode: String) -> Node:
	var main: Node = (load("res://scenes/main.tscn") as PackedScene).instantiate()
	if mode != "":
		main.set_meta("native_map_look", mode)
	root.add_child(main)
	for i in range(8): await physics_frame
	return main

func _free(main: Node) -> void:
	if is_instance_valid(main):
		if main.get_parent() != null: main.get_parent().remove_child(main)
		main.free()

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		print("MAPLOOK_BLOCKED isolation")
		quit(2)
		return
	# ① 하니스 기본: 꺼짐
	var plain: Node = await _boot("")
	_check(plain.world.get_node_or_null("NativeMapLook") == null, "harness default boot leaves map look off")
	var lighting: Node = plain.get_node_or_null("NativeScreenLighting")
	_check(lighting != null and lighting.is_native_lightmap_enabled() == true, "original lightmap overlay stays on when map look off")
	var plain_filter: ColorRect = plain.get_node("NativeScreenLighting/NativeColorFilter") as ColorRect
	var plain_gamma: Variant = (plain_filter.material as ShaderMaterial).get_shader_parameter("shadow_gamma")
	_check(plain_gamma == null or is_equal_approx(float(plain_gamma), 1.0),
		"original color filter keeps gamma 1 when map look is off")
	var g_keys_plain: Array = plain.source_state.read_current_g().keys()
	g_keys_plain.sort()
	var props_plain := _prop_snapshot(plain)
	_free(plain)
	# ② 메타 on: 설치
	var main: Node = await _boot("on")
	var look: Node = main.world.get_node_or_null("NativeMapLook")
	_check(look != null, "map look installed with meta on")
	if look != null:
		var snap: Dictionary = look.get_native_map_look_snapshot()
		_check(snap.get("active") == true, "map look active")
		_check(int(snap.get("lights", 0)) >= 20, "object + tree + player lights mounted (%s)" % snap.get("lights"))
		_check(int(snap.get("spawn_hole_lights", 0)) == 14, "one light per 1-1 spawn hole (%s)" % snap.get("spawn_hole_lights"))
		_check(int(snap.get("prop_shadows", 0)) >= 20, "prop drop shadows (%s)" % snap.get("prop_shadows"))
		_check(int(snap.get("ground_masses", 0)) == 3, "three authored ground masses mounted (%s)" % snap.get("ground_masses"))
		var masses := 0
		for child in look.get_children():
			if child is Sprite2D and str(child.name).begins_with("GroundMass_"):
				masses += 1
				_check(child.z_index == -2750 and child.z_as_relative == false, "ground mass stays between chunks and props")
		_check(masses == 3, "ground masses are visible render nodes")
		_check(int(snap.get("foreground", 0)) >= 10, "parallax foreground silhouettes (%s)" % snap.get("foreground"))
		_check(int(snap.get("occluders", 0)) >= 10, "trunk occluders (%s)" % snap.get("occluders"))
		_check(int(snap.get("styled_props", 0)) == 36, "all 36 props get lit material (%s)" % snap.get("styled_props"))
		_check(snap.get("spores") == true and snap.get("embers") == true, "spores and camp embers")
		_check(snap.get("lightmap_overlay_enabled") == false, "original lightmap darkness handed to CanvasModulate")
		var active_filter: ColorRect = main.get_node("NativeScreenLighting/NativeColorFilter") as ColorRect
		_check(is_equal_approx(float((active_filter.material as ShaderMaterial).get_shader_parameter("shadow_gamma")), 0.75),
			"map look lifts dark tone only while active")
		var modulates := 0
		for child in look.get_children():
			if child is CanvasModulate: modulates += 1
		_check(modulates == 1, "single ambient CanvasModulate")
	# IMPACT-LOOK: 모듈 설치·타격 이벤트 반응·자체 RNG(공유 난수 소비 0)
	var impact: Node = main.world.get_node_or_null("ImpactLook")
	_check(impact != null, "impact look module installed with map look")
	if impact != null:
		var draws_before: int = int(main.world.get_native_runtime_snapshot().get("random_draw_count", -1))
		var enemy: Node2D = null
		for e in main.world.get_enemies():
			if e.get("alive") == true:
				enemy = e
				break
		if enemy != null:
			main.player.telemetry_event.emit("native_hurte", {"ok": true, "source": "kiSlash", "step": 3, "is_crit": true, "killed": false, "enemy_id": enemy.get_instance_id()})
			var snap_i: Dictionary = impact.get_snapshot()
			_check(int(snap_i.get("bursts", 0)) == 1 and int(snap_i.get("live_sparks", 0)) >= 7, "heavy kiSlash hit spawns restrained spark burst (%s)" % snap_i)
			_check(snap_i.get("freezing") == true and int(snap_i.get("live_rings", 0)) == 1, "heavy hit: one ring + presentation freeze")
			main.player.telemetry_event.emit("native_hurte", {"ok": true, "source": "spikeTrap", "enemy_id": enemy.get_instance_id()})
			_check(int(impact.get_snapshot().get("live_sparks", 0)) == int(snap_i.get("live_sparks", 0)), "spike trap DOT adds no sparks (restraint)")
			_check(int(main.world.get_native_runtime_snapshot().get("random_draw_count", -1)) == draws_before, "impact look consumes no shared RNG")
	# ③ 표시 전용
	var g_keys: Array = main.source_state.read_current_g().keys()
	g_keys.sort()
	_check(g_keys == g_keys_plain, "G key set unchanged by map look")
	_check(_prop_snapshot(main) == props_plain, "prop positions/z/visibility unchanged by map look")
	_check(main.world.map_data.get("collision_rects", []).size() == 292, "map collision data untouched")
	_free(main)
	print("MAPLOOK_RESULT ", JSON.stringify({"assertions": assertions, "failures": failures}))
	quit(1 if failures > 0 else 0)

func _prop_snapshot(main: Node) -> Array:
	var out: Array = []
	for child in main.world.get_children():
		if child is Sprite2D and child.texture != null and str(child.texture.resource_path).begins_with("res://assets/map/props/"):
			out.append([str(child.texture.resource_path), child.position, child.z_index, child.visible, child.scale])
	return out
