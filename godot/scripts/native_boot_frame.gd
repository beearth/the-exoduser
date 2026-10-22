extends RefCounted
## BOOT-01 (PC, 2026-10-22) — 진입 단계 사이 "다음 엔진 프레임 끝"까지 기다리는 도우미.
## 창이 그려지면 frame_post_draw(그리기 직후) 뒤에 돌아온다. 그래서 다음 단계 일은 한 프레임의 맨 끝에 놓이고
## 곧바로 OS 이벤트 펌프가 돈다(단계 일과 다음 프레임 그리기가 한 펌프 구간에 겹치지 않음).
## 헤드리스·최소화 창은 그리기가 없어 process_frame으로 돌아온다(기다리는 중 최소화돼도 멈추지 않음).
signal done

static func next(tree: SceneTree) -> void:
	var waiter = load("res://scripts/native_boot_frame.gd").new()
	waiter._arm(tree)
	await waiter.done

var _tree: SceneTree
var _fired := false

func _arm(tree: SceneTree) -> void:
	_tree = tree
	RenderingServer.frame_post_draw.connect(_finish, CONNECT_ONE_SHOT)
	tree.process_frame.connect(_on_process_frame)

func _on_process_frame() -> void:
	if _drawing_possible():
		return
	_finish()

func _drawing_possible() -> bool:
	if DisplayServer.get_name() == "headless":
		return false
	return DisplayServer.window_get_mode() != DisplayServer.WINDOW_MODE_MINIMIZED

func _finish() -> void:
	if _fired:
		return
	_fired = true
	if RenderingServer.frame_post_draw.is_connected(_finish):
		RenderingServer.frame_post_draw.disconnect(_finish)
	if is_instance_valid(_tree) and _tree.process_frame.is_connected(_on_process_frame):
		_tree.process_frame.disconnect(_on_process_frame)
	done.emit()
