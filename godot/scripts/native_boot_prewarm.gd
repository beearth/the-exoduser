extends Node
## BOOT-01 (PC, 2026-10-22) — 필드 진입 전 예열(백그라운드).
##
## 무엇을 하나
## - 진입(add_child(main)) 중 메인 스레드에서 동기로 하던 일을 진입 전에 미리 끝내 둔다.
##   1) 리소스 읽기(load()) — 목록(manifest)의 리소스를 백그라운드 스레드로 읽어 캐시에 붙잡아 둔다.
##   2) 이미지 처리 — World 원본 onload 픽셀 처리, 드랍 빔 검정 마스크, 인트로 컷 이미지 디코드를
##      각 모듈의 같은 순수 함수(정적 함수)로 워커 스레드에서 미리 돌린다.
## - 진입 순서와 계약은 그대로다. 진입 중의 load()는 같은 리소스를 캐시에서 받고, 각 모듈은 미리 계산한
##   결과가 있으면 그것을, 없으면 예전처럼 그 자리에서 계산한다. 결과는 같은 함수의 출력이라 동일하다.
## - 목록·작업표는 성능 힌트다. 빠지거나 낡아도 동작은 같다. 그 항목만 진입 중 동기로 처리된다.
##
## 목록 재생성: godot/tools/boot01_gen_prewarm_manifest.py — docs/engine/BOOT01_MULTI_FRAME_STARTUP_20261022.md
const MANIFEST_PATH := "res://data/native_boot_prewarm_manifest.json"
const MAIN_SCENE_PATH := "res://scenes/main.tscn"
## 작업표 제공 모듈. 정적 함수 native_boot_prewarm_jobs(context) -> Array 와
## native_boot_prewarm_kernel(input: Image, job: Dictionary) -> Variant 를 가진다(멤버 접근 없음).
## main.tscn 백그라운드 읽기가 끝난 뒤 캐시에서 받는다(로비 메인 스레드에서 동기 컴파일하지 않음).
const PROVIDERS := ["res://scripts/world.gd", "res://scripts/native_world_drops.gd", "res://scripts/native_story_intro.gd"]
# 동시에 요청하는 백그라운드 읽기 수. 백그라운드에서 읽힌 텍스처의 GPU 업로드는 다음 그리기에 몰리므로
# 한 프레임에 끝나는 개수를 작게 둔다(측정: 12개일 때 그리기 501ms 프레임 발생).
const MAX_IN_FLIGHT := 4
const MAIN_BUDGET_USEC := 6000 # 프레임마다 메인 스레드에서 쓰는 예열 시간 상한(get_image·텍스처 생성 등)
const HOLD_AFTER_ENTRY_SEC := 30.0 # 진입 뒤 첫 프레임들의 load()도 캐시를 받도록 잠시 더 붙잡는다

static var _pump: Node
static var _queue_ready := false
static var _priority_count := 0 # 대기열 앞쪽 우선 항목 수(main.tscn과 겹치지 않는 영상 프레임)
static var _issued := 0
static var _context: Dictionary = {}
static var _queue: PackedStringArray = PackedStringArray()
static var _in_flight: PackedStringArray = PackedStringArray()
static var _held: Array = []
static var _total := 0
static var _loaded := 0
static var _failed := 0
static var _jobs_ready := false
static var _jobs: Array = [] # 대기 [{key,source,path,provider,output,...}]
static var _tasks: Array = [] # 진행 중 [{id,job,holder}]
static var _finishing: Array = [] # 워커 완료, 메인 스레드 마무리(텍스처 생성) 대기
static var _results: Dictionary = {} # key -> Variant
static var _jobs_total := 0
static var _early_jobs := 0
static var _jobs_done := 0
static var _started_usec := 0
static var _complete_usec := 0

## 로비가 부른다. 한 프로세스에서 한 번만 시작한다(다시 불러도 무시).
static func begin(tree: SceneTree, context: Dictionary = {}) -> void:
	if is_instance_valid(_pump) or tree == null:
		return
	# 헤드리스(더미 렌더러)는 그리기·GPU 업로드가 없어 얻을 것이 없고, 더미 텍스처 저장소는 백그라운드 텍스처
	# 생성에 안전하지 않다("Initializing already initialized RID"). 예열 없이 예전 동기 경로 그대로 둔다.
	if DisplayServer.get_name() == "headless":
		return
	_reset()
	_context = context.duplicate(true)
	_started_usec = Time.get_ticks_usec()
	_pump = load("res://scripts/native_boot_prewarm.gd").new()
	_pump.name = "NativeBootPrewarm"
	_pump.process_mode = Node.PROCESS_MODE_ALWAYS
	tree.root.add_child.call_deferred(_pump)

## 대기열 만들기(펌프 첫 프레임) — 로비 _ready 프레임을 무겁게 하지 않도록 begin에서 하지 않는다.
static func _build_queue() -> void:
	# 먼저 쓰이는 것부터: 로비가 넘긴 우선 목록(전사 이야기 영상 프레임) → 진입 목록(manifest)
	var seen := {}
	var paths: Array = []
	for path in _context.get("priority_resources", []):
		paths.append(path)
	_priority_count = paths.size()
	var manifest: Variant = JSON.parse_string(FileAccess.get_file_as_string(MANIFEST_PATH)) if FileAccess.file_exists(MANIFEST_PATH) else null
	if manifest is Dictionary and manifest.get("resources") is Array:
		paths.append_array(manifest.resources)
	for path in paths:
		if path is String and not seen.has(path) and not ResourceLoader.has_cached(path):
			seen[path] = true
			_queue.append(path)
	_total = _queue.size()
	_queue_ready = true
	# 공급 모듈 없이 바로 시작하는 작업(로딩 화면 이미지 등): main.tscn 읽기를 기다리지 않는다
	for job in _context.get("early_jobs", []):
		if job is Dictionary and not job.get("key", "").is_empty():
			var row: Dictionary = job.duplicate()
			row["provider"] = ""
			_jobs.append(row)
			_early_jobs += 1

static func _reset() -> void:
	_context = {}
	_queue = PackedStringArray(); _in_flight = PackedStringArray(); _held = []
	_total = 0; _loaded = 0; _failed = 0
	_queue_ready = false; _priority_count = 0; _issued = 0; _jobs_ready = false; _jobs = []; _tasks = []; _finishing = []; _results = {}; _jobs_total = 0; _early_jobs = 0; _jobs_done = 0
	_started_usec = 0; _complete_usec = 0

static func is_started() -> bool:
	return is_instance_valid(_pump)

static func is_complete() -> bool:
	return is_started() and _queue_ready and _jobs_ready and _queue.is_empty() and _in_flight.is_empty() \
		and _jobs.is_empty() and _tasks.is_empty() and _finishing.is_empty()

## 0..1 진행률(로딩 표시용)
static func progress() -> float:
	if not is_started():
		return 0.0
	var all := _total + _jobs_total
	if all <= 0:
		return 1.0 if _jobs_ready else 0.0
	return float(_loaded + _failed + _jobs_done) / float(all)

static func snapshot() -> Dictionary:
	return {"started": is_started(), "complete": is_complete(), "resources": _total, "loaded": _loaded,
		"failed": _failed, "in_flight": _in_flight.size(), "jobs_ready": _jobs_ready, "jobs": _jobs_total,
		"jobs_done": _jobs_done, "results": _results.size(), "held": _held.size(),
		"elapsed_ms": ((_complete_usec if _complete_usec > 0 else Time.get_ticks_usec()) - _started_usec) / 1000.0 if _started_usec > 0 else 0.0}

## 모듈이 부른다. 미리 계산한 결과(없으면 null). take=true면 꺼낸 뒤 지운다(한 번만 쓰는 큰 결과).
static func read_result(key: String, take: bool = false) -> Variant:
	if not _results.has(key):
		return null
	var r: Variant = _results[key]
	if take:
		_results.erase(key)
	return r

## 진입이 끝난 뒤 로비가 부른다. 붙잡은 리소스·결과를 잠시 뒤 놓는다.
static func release_after_entry() -> void:
	if is_instance_valid(_pump):
		_pump._release_at_msec = Time.get_ticks_msec() + int(HOLD_AFTER_ENTRY_SEC * 1000.0)

static func release() -> void:
	for t in _tasks:
		WorkerThreadPool.wait_for_task_completion(t.id)
	var pump := _pump
	_reset()
	_pump = null
	if is_instance_valid(pump):
		pump.queue_free()

var _release_at_msec := -1

func _process(_delta: float) -> void:
	if _release_at_msec >= 0 and Time.get_ticks_msec() >= _release_at_msec:
		release()
		return
	var budget_end := Time.get_ticks_usec() + MAIN_BUDGET_USEC
	if not _queue_ready:
		_build_queue()
		return
	_pump_resources(budget_end)
	if not _jobs_ready:
		_build_jobs()
	_collect_tasks()
	while not _finishing.is_empty() and Time.get_ticks_usec() <= budget_end:
		_finish_job(_finishing.pop_front())
	var k := 0
	while k < _jobs.size() and Time.get_ticks_usec() <= budget_end:
		var job: Dictionary = _jobs[k]
		if job.source == "texture" and (_in_flight.has(job.path) or _queue.has(job.path)):
			k += 1
			continue
		_jobs.remove_at(k)
		_start_job(job)
	if _complete_usec == 0 and is_complete():
		_complete_usec = Time.get_ticks_usec()

func _pump_resources(budget_end: int) -> void:
	var i := 0
	while i < _in_flight.size():
		var path := _in_flight[i]
		var st := ResourceLoader.load_threaded_get_status(path)
		if st == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
			i += 1
			continue
		if st == ResourceLoader.THREAD_LOAD_LOADED:
			var res: Resource = ResourceLoader.load_threaded_get(path)
			if res != null:
				_held.append(res); _loaded += 1
			else:
				_failed += 1
		else:
			_failed += 1
		_in_flight.remove_at(i)
		if Time.get_ticks_usec() > budget_end:
			return
	while _in_flight.size() < MAX_IN_FLIGHT and not _queue.is_empty():
		# main.tscn 백그라운드 읽기(같은 의존 리소스를 다른 스레드에서 읽는 중)가 끝나기 전에는 우선 항목만 요청한다.
		# 같은 파일을 두 스레드가 동시에 읽으면 main 스크립트 preload가 실패했다(창 모드 07 로비 테스트, 2026-10-22).
		if _issued >= _priority_count and ResourceLoader.load_threaded_get_status(MAIN_SCENE_PATH) == ResourceLoader.THREAD_LOAD_IN_PROGRESS:
			break
		_issued += 1
		var next := _queue[0]
		_queue.remove_at(0)
		if ResourceLoader.has_cached(next):
			_loaded += 1
			continue
		if ResourceLoader.exists(next) and ResourceLoader.load_threaded_request(next, "", false) == OK:
			_in_flight.append(next)
		else:
			_failed += 1

func _build_jobs() -> void:
	if not ResourceLoader.has_cached(MAIN_SCENE_PATH):
		return
	for provider in PROVIDERS:
		if not ResourceLoader.has_cached(provider):
			return
	var seen := {}
	for provider in PROVIDERS:
		var script: Script = load(provider)
		for job in script.native_boot_prewarm_jobs(_context):
			if not job is Dictionary or seen.has(job.get("key")):
				continue
			seen[job.key] = true
			var row: Dictionary = job.duplicate()
			row["provider"] = provider
			_jobs.append(row)
	_jobs_total = _jobs.size() + _jobs_done # 이미 끝난 앞선 작업(early_jobs) 포함
	_jobs_ready = true

func _start_job(job: Dictionary) -> void:
	var input: Image = null
	if job.source == "texture":
		var tex: Variant = load(job.path) if ResourceLoader.exists(job.path) else null
		input = tex.get_image() if tex is Texture2D else null
		if input == null or input.is_empty():
			_jobs_done += 1 # 처리 불가 — 모듈이 진입 중 원래 경로(동기)로 판정한다
			return
	var script: Script = load(job.provider) if not str(job.provider).is_empty() else null
	var holder: Array = [null]
	var id := WorkerThreadPool.add_task(func() -> void:
		var src: Image = input
		if job.source == "file":
			src = Image.load_from_file(job.path)
			if src == null or src.is_empty():
				return
		holder[0] = script.native_boot_prewarm_kernel(src, job) if script != null else src, false, "BOOT-01 prewarm")
	_tasks.append({"id": id, "job": job, "holder": holder})

func _collect_tasks() -> void:
	var j := 0
	while j < _tasks.size():
		var t: Dictionary = _tasks[j]
		if not WorkerThreadPool.is_task_completed(t.id):
			j += 1
			continue
		WorkerThreadPool.wait_for_task_completion(t.id)
		_tasks.remove_at(j)
		_finishing.append(t)

func _finish_job(t: Dictionary) -> void:
	var r: Variant = t.holder[0]
	if r != null:
		if t.job.get("output", "") == "texture" and r is Image:
			r = ImageTexture.create_from_image(r) # 텍스처 생성(GPU 업로드)은 메인 스레드에서
		_results[t.job.key] = r
	_jobs_done += 1
