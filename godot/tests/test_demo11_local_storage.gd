extends SceneTree
const Store = preload("res://port_modules/save_adapter/demo_local_storage.gd")
const USERDIR := "EXODUSER-demo11-05-Isolated-20261021"
const SOURCE_SHA := preload("res://source_snapshot/snapshot.gd").SHA256
var checks := 0
var failures := 0
var now := 0.0
var on := true
var db_ready := true
var raw := ""
var original := ""
var store: RefCounted
var folder := ""
var reentry_denied := false

func _initialize() -> void:
	var args := OS.get_cmdline_user_args()
	call_deferred("_open_failure_check" if "--open-failure-only" in args else ("_restart_check" if "--readback-only" in args else "_run"))
func check(value: bool, label: String) -> void:
	checks += 1
	if not value: failures += 1; printerr("DEMO11_05_FAIL ", label)
func put(id: String, key: String, value: String) -> Dictionary:
	var result: Dictionary = store.begin_set(id, key, value)
	return store.run_request(id) if result.get("ready", false) else result
func read_text(path: String) -> String: return FileAccess.get_file_as_string(path)

func _run() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR: printerr("DEMO11_05_INVALID_ISOLATION"); quit(2); return
	check(not Store.accepts_namespace("/synthetic/EXODUSER-Godot-Native-First"), "protected real namespace rejected by pure guard, no host access")
	check(not Store.accepts_namespace("/synthetic/EXODUSER-other"), "non-demo namespace rejected")
	check(FileAccess.get_sha256(ProjectSettings.globalize_path(preload("res://source_snapshot/snapshot.gd").PATH)) == SOURCE_SHA, "current source pin")
	folder = OS.get_user_data_dir().path_join("demo_local_storage")
	if DirAccess.dir_exists_absolute(folder):
		check(DirAccess.rename_absolute(folder, folder + "-preserved-" + str(Time.get_ticks_usec())) == OK, "preserve previous isolated evidence")
	store = Store.new()
	check(store.readiness().ready, "isolated namespace admitted")
	check(not store.get_item("hellsave_demo").ready, "no implicit IO before open")
	check(store.open_store().ready, "real native directory created")
	check(not store.get_item("../hellsave_demo").ready, "path traversal denied")
	check(not store.begin_set("x", "hellsave_demo500", "{}").ready, "developer namespace denied")
	check(not store.begin_set("x", "hellsave_demo_5", "{}").ready, "sixth slot denied")
	check(not store.begin_set("x", "hellsave_demo_active", "5").ready, "invalid active index denied")
	check(not store.begin_set("x", "hellsave_demo", "{broken").ready, "invalid JSON never overwrites")
	check(not store.begin_set("x", "hellsave_demo", "[]").ready, "nonobject save denied")
	original = ' {"ts":1,"player":{"lv":1},"game":{"stage":0,"mats":1000},"inv":{"bag":[]},"unknown":{"한글":"가😀"},"future":null} '
	check(put("initial", "hellsave_demo", original).ok, "physical first commit")
	check(store.get_item("hellsave_demo").raw == original, "exact UTF8/whitespace/unknown/null preserved")
	check(FileAccess.get_file_as_bytes(folder.path_join("hellsave_demo.json")) == original.to_utf8_buffer(), "file contains source JSON bytes without envelope")
	var first_time: float = store.snapshot().last_save_ms
	check(first_time > 0, "success ACK only after commit")
	var repeated: Dictionary = store.begin_set("initial", "hellsave_demo", original)
	check(repeated.settled and repeated.ok and repeated.last_save_ms == first_time, "settled duplicate replays receipt without another ACK")
	repeated.ok = false
	check(store.begin_set("initial", "hellsave_demo", original).ok, "receipt caller mutation detached")
	check(not store.begin_set("initial", "hellsave_demo", "{}").ready, "same request ID different bytes conflicts")
	check(store.read_json("hellsave_demo").value.unknown["한글"] == "가😀", "SV strict reader reused")
	for index in 5:
		check(put("slot-" + str(index), "hellsave_demo_" + str(index), '{"name":"전사' + str(index) + '","charIdx":0}').ok, "metadata-only source slot supported")
	check(put("active", "hellsave_demo_active", "4").ok, "active raw decimal stored")
	check(store.get_item("hellsave_demo_active").raw == "4", "active string roundtrip")
	var fresh := Store.new()
	check(fresh.open_store().ready and fresh.get_item("hellsave_demo").raw == original, "new adapter instance/restart reads actual file")
	check(store.begin_set("pending", "hellsave_demo", "{\"player\":{\"lv\":2}}").status == "PENDING", "begin write pending")
	check(store.begin_set("pending", "hellsave_demo", "{\"player\":{\"lv\":2}}").status == "PENDING", "inflight duplicate does not start another IO")
	check(not fresh.begin_set("racing", "hellsave_demo", "{}").ready, "exclusive native writer lock across instances")
	check(store.get_item("hellsave_demo").raw == original, "read during pending sees committed old file")
	check(not store.advance("pending").settled, "write/flush precedes rename")
	check(store.get_item("hellsave_demo").raw == original, "old value remains after temp flush")
	check(store.advance("pending").ok, "atomic overwrite of existing file succeeds")
	check(fresh.read_json("hellsave_demo").value.player.lv == 2, "other reader sees complete new value")
	check(put("restore-fixture", "hellsave_demo", original).ok, "restore own isolated fixture")
	_test_failures()
	_test_removal_and_corruption()
	# Test only link to our own isolated sentinel, never a real user directory.
	var sentinel := OS.get_user_data_dir().path_join("sentinel.json")
	var f := FileAccess.open(sentinel, FileAccess.WRITE); f.store_string("unchanged"); f.close()
	var link := folder.path_join("hellsave_demo_3.json")
	check(DirAccess.remove_absolute(link) == OK, "remove own slot before link test")
	var directory := DirAccess.open(folder)
	check(directory.create_link(sentinel, link) == OK, "isolated link fixture")
	check(not store.get_item("hellsave_demo_3").ready and not put("link", "hellsave_demo_3", "{}").ready, "symlink read/write refused")
	check(read_text(sentinel) == "unchanged", "outside-store isolated sentinel preserved")
	check(DirAccess.remove_absolute(link) == OK, "unlink fixture only")
	_test_lifecycle()
	check(not DirAccess.dir_exists_absolute(folder.path_join(".writer")), "no owned temp/lock leak")
	print("DEMO11_05_RESULT ", JSON.stringify({"checks":checks,"failures":failures,"host_io":true,"full_restore":false,"public_play_evidence":false,"root":folder,"source_sha256":SOURCE_SHA}))
	quit(0 if failures == 0 else 1)

func _test_failures() -> void:
	var before: float = store.snapshot().last_save_ms
	check(store.begin_set("fail-open", "hellsave_demo", "{}").ready, "open failure admission")
	check(DirAccess.make_dir_absolute(folder.path_join(".writer/next")) == OK, "native file-open conflict injected")
	var failed: Dictionary = store.run_request("fail-open")
	check(not failed.ok and failed.reason == "write_open_failed", "open failure not acknowledged")
	check(store.get_item("hellsave_demo").raw == original and store.snapshot().last_save_ms == before, "open failure preserves old bytes/time")
	check(store.begin_set("fail-short", "hellsave_demo", '{"new":true}').ready, "partial write admission")
	store.advance("fail-short")
	var partial := FileAccess.open(folder.path_join(".writer/next"), FileAccess.WRITE); partial.store_string("{"); partial.close()
	failed = store.run_request("fail-short")
	check(not failed.ok and failed.reason == "temporary_mismatch", "partial temp cannot commit")
	check(store.get_item("hellsave_demo").raw == original and store.snapshot().last_save_ms == before, "partial temp preserves old bytes/time")
	check(store.begin_set("fail-rename", "hellsave_demo", '{}').ready, "rename failure admission")
	store.advance("fail-rename")
	check(DirAccess.remove_absolute(folder.path_join(".writer/next")) == OK, "missing temp injected before commit")
	failed = store.run_request("fail-rename")
	check(not failed.ok and failed.reason == "temporary_missing_or_linked", "lost temp no delete-rename gap")
	check(store.get_item("hellsave_demo").raw == original and store.snapshot().last_save_ms == before, "commit failure preserves old bytes/time")
	check(store.begin_set("cancel", "hellsave_demo", '{}').ready, "cancel admission")
	check(not store.cancel_request("cancel").ok, "cancel is failed settlement")
	check(store.get_item("hellsave_demo").raw == original, "cancel preserves prior file")
	check(store.release_receipt("cancel") and not store.release_receipt("unknown"), "explicit bounded receipt release")

func _test_removal_and_corruption() -> void:
	check(store.begin_remove("remove", "hellsave_demo_4").ready and store.run_request("remove").ok, "actual remove")
	check(not store.get_item("hellsave_demo_4").found, "removed key missing")
	check(put("recreate", "hellsave_demo_4", '{}').ok, "recreate after remove")
	check(store.begin_remove("remove", "hellsave_demo_4").ok and store.get_item("hellsave_demo_4").found, "duplicate remove cannot delete newly recreated data")
	var path := folder.path_join("hellsave_demo_4.json")
	var f := FileAccess.open(path, FileAccess.WRITE); f.store_string("{broken"); f.close()
	check(not store.read_json("hellsave_demo_4").ready and read_text(path) == "{broken", "corrupt save preserved without fresh overwrite")
	f = FileAccess.open(path, FileAccess.WRITE); f.store_buffer(PackedByteArray([255,254,0])); f.close()
	check(not store.get_item("hellsave_demo_4").ready, "invalid UTF8 is IO error, never fresh state")

func _test_lifecycle() -> void:
	# A fresh namespace-specific adapter clock; old files still persist.
	store = Store.new(); store.open_store()
	raw = original
	var configured: Dictionary = store.configure_lifecycle({
		"clock":func():
			var id: String = store.snapshot().pending
			if not id.is_empty(): reentry_denied = not store.advance(id).ready
			return {"ready":true,"ms":now},
		"current_state":func(): return {"ready":true,"on":on,"db_ready":db_ready,"saving":false,"save_debounce":false,"pending_force":false,"save_now_pending":false},
		"current_slot":func(): return {"ready":true,"value":"hellsave_demo"},
		"current_collector":func(): return {"ready":true,"context":{"raw_json":raw}},
		"current_rift":func(): return {"ready":true,"enabled":true,"save_state_ready":true}})
	check(configured.ready, "existing SV lifecycle bound to actual IO")
	check(store.start_auto_save().due_ms == 30000 and store.schedule_boot_save().due_ms == 3000, "source timer constants reused")
	check(store.rift_save_busy().busy, "boot ticket registered")
	now = 2999; check(store.poll().outcomes.is_empty(), "boot not early")
	now = 3000; var pumped: Dictionary = store.poll()
	check(pumped.ready and pumped.outcomes[0].result.ok and store.snapshot().last_save_ms == 3000, "boot success ACK after native file commit")
	check(not store.rift_save_busy().busy, "boot ticket settled")
	check(reentry_denied, "duplicate reentrant IO during ACK denied")
	now = 30000; raw = '{"player":{"lv":3}}'; pumped = store.poll()
	check(pumped.outcomes[0].result.ok and store.read_json("hellsave_demo").value.player.lv == 3, "auto reads current serialized collector at firing time")
	now = 56000; store.schedule_boot_save()
	now = 59000; store.poll()
	now = 60000; pumped = store.poll()
	check(pumped.outcomes[0].status == "SKIPPED" and pumped.outcomes[0].reason == "success_gap", "ten second success gap preserved")
	check(DirAccess.make_dir_absolute(folder.path_join(".writer")) == OK, "foreign/stale writer lock fixture")
	now = 90000; pumped = store.poll()
	check(pumped.ready and not pumped.outcomes[0].result.ok, "known IO admission failure settles without fake success")
	check(store.snapshot().last_save_ms == 59000 and store.snapshot().lifecycle.inflight.is_empty(), "failed write no timestamp or unknown inflight leak")
	check(DirAccess.remove_absolute(folder.path_join(".writer")) == OK, "remove only test-created stale lock")
	on = false; now = 120000; pumped = store.poll()
	check(pumped.outcomes[0].reason == "on_or_db_ready", "off state auto gate preserved")

func _restart_check() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR: quit(2); return
	store = Store.new()
	check(store.open_store().ready, "separate process reopens native store")
	var persisted: Dictionary = store.read_json("hellsave_demo")
	check(persisted.ready and persisted.found and persisted.value.player.lv == 3, "separate process reads last acknowledged bytes")
	check(not store.read_json("hellsave_demo_4").ready, "separate process preserves corrupt slot instead of fresh overwrite")
	check(store.get_item("hellsave_demo_active").raw == "4", "active index persisted across process restart")
	check(not DirAccess.dir_exists_absolute(OS.get_user_data_dir().path_join("demo_local_storage/.writer")), "restart no writer lock left")
	print("DEMO11_05_RESULT ", JSON.stringify({"checks":checks,"failures":failures,"separate_process_readback":true,"host_io":true}))
	quit(0 if failures == 0 else 1)

func _open_failure_check() -> void:
	if OS.get_user_data_dir().get_file() != USERDIR: quit(2); return
	folder = OS.get_user_data_dir().path_join("demo_local_storage")
	store = Store.new()
	check(store.open_store().ready and store.read_json("hellsave_demo").value.player.lv == 3, "existing committed data readable")
	var held := folder + "-open-failure-fixture"
	check(DirAccess.rename_absolute(folder, held) == OK, "temporarily move own isolated store")
	var unavailable: Dictionary = store.get_item("hellsave_demo")
	check(not unavailable.ready and unavailable.reason == "store_directory_unavailable", "lost store directory is failure, never missing/fresh")
	var f := FileAccess.open(folder, FileAccess.WRITE); f.store_string("blocking-file"); f.close()
	var unopened := Store.new()
	check(not unopened.open_store().ready, "native mkdir/open failure surfaced")
	check(not unopened.get_item("hellsave_demo").ready and unopened.snapshot().root.is_empty(), "failed open does not publish a usable root")
	check(FileAccess.get_file_as_string(folder) == "blocking-file", "failed open preserves conflicting file")
	check(DirAccess.remove_absolute(folder) == OK and DirAccess.rename_absolute(held, folder) == OK, "restore only isolated fixture")
	check(store.read_json("hellsave_demo").value.player.lv == 3, "committed data unchanged after IO failure")
	print("DEMO11_05_RESULT ", JSON.stringify({"checks":checks,"failures":failures,"focused_open_failure":true,"host_io":true}))
	quit(0 if failures == 0 else 1)
