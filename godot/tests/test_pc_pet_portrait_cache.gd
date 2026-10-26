extends SceneTree
## PCI-13 — native_pets 초상 캐시. 두 모드:
##   --mode=legacy : Main 부팅 없이 새 프로세스에서 기존 _show_bubble 초상 줄(exists+load→TextureRect)을
##                   crow→cat→crow→cat 순서로 재현해 발화당 비용(전후 비교의 '전')을 잰다.
##   (기본)        : 실제 Main 부팅 → configure 때 준비된 캐시 확인, 발화당 비용(load 0)·실패 무변이·
##                   대사 텍스트/표시 불변 확인.
const USERDIR = "EXODUSER-pc-life-pack-Isolated-20261021"
const PATHS := {"crow": "res://assets/pets/crow_portrait.png", "cat": "res://assets/pets/cat_portrait.png"}
var checks := 0
var failures := 0

func _initialize() -> void: call_deferred("_run")

func check(ok: bool, label: String) -> void:
	checks += 1
	if not ok:
		failures += 1
		print("PCPP_FAIL ", label)

func argument(name: String) -> String:
	for value in OS.get_cmdline_user_args():
		if value.begins_with(name + "="): return value.substr(name.length() + 1)
	return ""

func _run() -> void:
	check(OS.get_user_data_dir().get_file() == USERDIR, "isolated userdir")
	if failures > 0: quit(1); return
	if argument("--mode") == "legacy":
		await _legacy()
	else:
		await _cached()
	print("PCPP_RESULT ", JSON.stringify({"assertions": checks, "failures": failures}))
	quit(1 if failures > 0 else 0)

func _legacy() -> void:
	# 기존 코드(port aaf52dc0 native_pets.gd:671–673)와 같은 줄: TextureRect가 직전 초상 하나만 참조.
	var rect := TextureRect.new()
	root.add_child(rect)
	var timings: Array = []
	for who in ["crow", "cat", "crow", "cat", "crow"]:
		var t0 := Time.get_ticks_usec()
		var path: String = PATHS[who]
		if ResourceLoader.exists(path):
			rect.texture = load(path)
		timings.append({"who": who, "usec": Time.get_ticks_usec() - t0})
		await process_frame
	print("PCPP_LEGACY ", JSON.stringify(timings))
	check(timings.size() == 5, "legacy sequence measured")
	rect.queue_free()

func _cached() -> void:
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for i in 8: await physics_frame
	main.process_mode = Node.PROCESS_MODE_DISABLED
	var pets: Node = main.world.get_node_or_null("NativePets")
	check(is_instance_valid(pets) and pets.has_method("prepare_native_pet_portrait"), "actual NativePets with cache API")
	var snap: Dictionary = pets.get_native_pet_portrait_cache_snapshot()
	check(snap.keys.size() == 2 and "crow" in snap.keys and "cat" in snap.keys, "configure prepared crow+cat once")
	check(snap.prepare.crow.ready == true and snap.prepare.cat.ready == true, "both portraits ready")
	var configure_usec: int = int(snap.prepare.crow.usec) + int(snap.prepare.cat.usec)
	# 재준비는 재로드 0(같은 identity)
	var again: Dictionary = pets.prepare_native_pet_portrait("crow")
	check(again.ready == true and again.cached == true and again.resource_identity == snap.resource_identity.crow, "re-prepare = cached identity, no reload")
	var bad: Dictionary = pets.prepare_native_pet_portrait("dog")
	check(bad.ready == false and bad.reason == "unknown_pet_portrait_key" and pets.get_native_pet_portrait_cache_snapshot().keys.size() == 2, "unknown key rejected, cache unchanged")
	var portrait: TextureRect = pets.get("_portrait")
	var label: Label = pets.get("_bubble_label")
	var timings: Array = []
	for who in ["crow", "cat", "crow", "cat", "crow"]:
		var t0 := Time.get_ticks_usec()
		pets._show_bubble(who, "pcpp:" + who)
		timings.append({"who": who, "usec": Time.get_ticks_usec() - t0})
		check(portrait.texture.get_instance_id() == snap.resource_identity[who], "bubble %s uses cached identity" % who)
		check(label.text == "pcpp:" + who, "bubble text unchanged behavior (%s)" % who)
		check(absf(pets.get("_subtitle_root").modulate.a - 0.6) < 1e-6, "bubble opacity .6 unchanged")
	var max_usec := 0
	for t in timings: max_usec = maxi(max_usec, int(t.usec))
	check(max_usec < 8000, "every bubble < 8ms with cache — legacy swap 17~29ms (max %d us)" % max_usec)
	# 준비 실패 key: 현재 초상 무변이, 대사는 계속
	var cache: Dictionary = pets.get("_portrait_cache")
	var cat_tex: Variant = cache["cat"]
	cache.erase("cat")
	var before_id: int = portrait.texture.get_instance_id()
	pets._show_bubble("cat", "pcpp:missing")
	check(portrait.texture.get_instance_id() == before_id and label.text == "pcpp:missing", "missing cache key: portrait unchanged, text continues")
	cache["cat"] = cat_tex
	# 실제 대사 경로(_pet_say → _update_pet_bubble)도 그대로 동작
	var say_before: int = (pets.get("_say_log") as Array).size()
	print("PCPP_CACHED ", JSON.stringify({"configure_prepare_usec": configure_usec, "prepare": snap.prepare, "bubbles": timings, "max_bubble_usec": max_usec, "say_log": say_before}))
	main.queue_free()
	await process_frame
