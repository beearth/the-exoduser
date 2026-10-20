extends RefCounted
## SND-03: game.html @284d7faf4:12296–12326 / 12358–12370.
## 원본 playSample의 보이스 치환 이후 단계와 frame queue만. 게임 owner 연결 없음.
## clock/RNG/active reader는 total numeric Callable, dispatch는 {ok:bool,error?:Variant}.
## numeric 인자·일반 own-property key 범위. JS prototype 특수키/문자열 수치 강제변환은 지원 밖.
## JS throw는 backend가 실패 packet으로 전달한다. 임의 GDScript 런타임 오류를 catch하지 않는다.
const POLICY = preload("res://port_modules/sound_source/policy.gd")


static func new_state() -> Dictionary:
	return {"queue": [], "last_t": {}, "frame_t": 0, "frame_counts": {},
		"death_cd": 0, "hit_cd": 0, "m_sfx_playing": 0, "sb_cd": 0}


static func enqueue_resolved(state: Dictionary, key: String, volume: float, rate: float,
		priority: bool, gx_volume_mul: float, now_ms: Callable, random_unit: Callable) -> Dictionary:
	# key는 SND-04가 치환한 결과를 받는다. 카탈로그 등록 여부로 임의 거부하지 않는다.
	if key.is_empty():
		return {"status": "DROPPED", "reason": "empty_key"}
	if gx_volume_mul < 1.0:
		volume *= gx_volume_mul
		if volume < 0.01:
			return {"status": "DROPPED", "reason": "gx_volume"}
	var is_priority := priority or POLICY.is_skill(key) or POLICY.is_footstep(key)
	if not is_priority:
		var now: float = now_ms.call()
		var last: float = state.last_t.get(key, 0.0)
		if now - last < 30.0:
			return {"status": "DROPPED", "reason": "duplicate_30ms"}
		state.last_t[key] = now
	# 원본 !rate: numeric 0/NaN만 기본 1. volume=0을 여기서 1로 바꾸지 않는다.
	if rate == 0.0 or is_nan(rate):
		rate = 1.0
	rate *= 0.92 + float(random_unit.call()) * 0.16
	var entry := {"key": key, "vol": volume, "rate": rate}
	if is_priority:
		entry["pri"] = 1
		state.queue.push_front(entry)
	else:
		state.queue.push_back(entry)
	return {"status": "QUEUED", "priority": is_priority}


static func flush(state: Dictionary, mobile: bool, audio_time: Callable,
		active_nodes: Callable, dispatch: Callable) -> Dictionary:
	var limits: Dictionary = POLICY.limits(mobile)
	state.frame_t += 1
	if state.death_cd > 0:
		state.death_cd -= 1
	if state.hit_cd > 0:
		state.hit_cd -= 1
	state.m_sfx_playing = 0
	var seen := {}
	var category_seen := {}
	var processed := 0
	var attempted := 0
	var time: float = audio_time.call()
	var failure: Dictionary = {}
	var index := 0
	# 원본은 loop마다 live queue.length를 읽는다. dispatch 중 enqueue도 같은 frame에 관측한다.
	while index < state.queue.size():
		var entry: Dictionary = state.queue[index]
		index += 1
		var priority := bool(entry.get("pri", false))
		var active: int = active_nodes.call()
		if active >= limits.active_nodes and not priority:
			continue
		if not priority and processed >= limits.samples_per_frame:
			continue
		var category: String = POLICY.category(entry.key)
		if not priority and category_seen.get(category, 0) >= limits.category_per_frame:
			continue
		category_seen[category] = category_seen.get(category, 0) + 1
		var n: int = seen.get(entry.key, 0)
		var volume_mul := 1.0 if n < 2 else maxf(0.08, pow(0.5, n - 1))
		var pitch_mul := 1.0 if n < 2 else maxf(0.7, 1.0 - (n - 1) * 0.05)
		attempted += 1
		var reply: Variant = dispatch.call(entry.key, entry.vol * volume_mul,
			entry.rate * pitch_mul, time, entry.get("pan", 0.0))
		if not reply is Dictionary or not reply.get("ok") is bool:
			failure = {"reason": "invalid_dispatch_result"}
			break
		if not reply.ok:
			failure = {"reason": "dispatch_failed", "error": reply.get("error")}
			break
		# 실패한 dispatch는 원본 throw처럼 seen/cnt를 올리지 않는다.
		seen[entry.key] = n + 1
		processed += 1
	# 원본 finally: 성공·실패·상한 skip 모두 나머지 queue 폐기, 기존 frame count key는 0으로 보존.
	state.queue.clear()
	for key in state.frame_counts:
		state.frame_counts[key] = 0
	if state.sb_cd > 0:
		state.sb_cd -= 1
	return {"status": "COMPLETE" if failure.is_empty() else "DISPATCH_FAILED",
		"processed": processed, "attempted": attempted, "failure": failure}
