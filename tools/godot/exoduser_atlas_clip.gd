class_name ExoduserAtlasClip
extends RefCounted
## Converts the editor's exoduser-atlas-clip JSON and an already loaded texture.
## This resource does not load saves, create a scene, or own a game clock.

static func _positive_integer(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value)) \
		and float(value) > 0.0 and float(value) <= 9007199254740991.0 \
		and float(value) == floor(float(value))

static func build(data: Dictionary, texture: Texture2D) -> SpriteFrames:
	var format_value = data.get("format")
	var version_value = data.get("version")
	if not format_value is String or not (version_value is int or version_value is float):
		push_error("Invalid EXODUSER atlas resource types")
		return null
	if format_value != "exoduser-atlas-clip" or version_value != 1:
		push_error("Unsupported EXODUSER atlas resource")
		return null
	var clip_name = data.get("name", "")
	if not clip_name is String or clip_name.strip_edges().is_empty() or clip_name.length() > 200:
		push_error("Invalid EXODUSER clip name")
		return null
	for field in ["columns", "rows", "frameCount"]:
		if not _positive_integer(data.get(field)):
			push_error("Invalid EXODUSER atlas integer: " + field)
			return null
	var columns: int = int(data["columns"])
	var rows: int = int(data["rows"])
	var count: int = int(data["frameCount"])
	if float(columns) * float(rows) > 9007199254740991.0 or count > columns * rows:
		push_error("EXODUSER frame count exceeds atlas capacity")
		return null
	var fps = data.get("fps")
	if not (fps is int or fps is float) or not is_finite(float(fps)) or float(fps) <= 0.0:
		push_error("Invalid EXODUSER clip FPS")
		return null
	var looping = data.get("loop")
	if not looping is bool or texture == null:
		push_error("EXODUSER clip requires a loop flag and loaded texture")
		return null
	var width: int = texture.get_width()
	var height: int = texture.get_height()
	if width <= 0 or height <= 0 or width % columns != 0 or height % rows != 0:
		push_error("EXODUSER texture dimensions do not divide the grid")
		return null
	var cell_width: int = int(width / columns)
	var cell_height: int = int(height / rows)
	if cell_width <= 2 or cell_height <= 2:
		push_error("EXODUSER atlas cell cannot contain a 1px inset")
		return null
	var frames := SpriteFrames.new()
	frames.remove_animation(&"default")
	var animation := StringName(clip_name)
	frames.add_animation(animation)
	frames.set_animation_speed(animation, float(fps))
	# Current Godot exposes loop modes; older Godot 4 exposes the bool setter.
	if frames.has_method("set_animation_loop_mode"):
		frames.call("set_animation_loop_mode", animation, 1 if looping else 0)
	else:
		frames.set_animation_loop(animation, looping)
	for frame in range(count):
		var region := AtlasTexture.new()
		region.atlas = texture
		region.filter_clip = true
		region.region = Rect2((frame % columns) * cell_width + 1, \
			int(frame / columns) * cell_height + 1, cell_width - 2, cell_height - 2)
		frames.add_frame(animation, region, 1.0)
	return frames
