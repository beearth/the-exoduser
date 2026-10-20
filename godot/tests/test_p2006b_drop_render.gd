extends SceneTree

const USERDIR = "EXODUSER-P2006B-Render-Isolated-20261020"

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name", "") != USERDIR:
		quit(2)
		return
	var main: Node = load("res://scenes/main.tscn").instantiate()
	root.add_child(main)
	for frame in range(12):
		await physics_frame
	var adapter: Node2D = main.get("world").get_node("NativeWorldDrops")
	var nearest: bool = adapter.texture_filter == CanvasItem.TEXTURE_FILTER_NEAREST
	print("P2006B_RENDER_RESULT ", JSON.stringify({"assertions": 1, "failures": 0 if nearest else 1,
		"texture_filter": adapter.texture_filter, "expected": CanvasItem.TEXTURE_FILTER_NEAREST,
		"source": "game.html:51736 X.imageSmoothingEnabled=false before world-item branch52579"}))
	main.get_parent().remove_child(main)
	main.free()
	quit(0 if nearest else 1)
