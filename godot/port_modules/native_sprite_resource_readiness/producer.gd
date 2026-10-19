extends RefCounted
## Readonly native sprite/resource readiness inspector.
## Reads existing Sprite2D.texture / AnimatedSprite2D.sprite_frames objects of a
## caller-supplied live NodeTree against a caller-built source expectation.
## It never loads, allocates, copies, hashes, renders, waits or adds nodes, and
## never publishes JS source_sprite_wait completion or stage_complete.

const SCHEMA := "fdg-native-sprite-resource-readiness-v1"
const EXPECTATION_SCHEMA := "fdg-native-sprite-resource-expectation-v1"
const READINESS_SCOPE := "native_loaded_resources"
const NOT_PROVEN := "NOT_PROVEN"
const TARGET_CLASSES: Array[String] = ["AnimatedSprite2D", "Sprite2D"]

static func inspect(root: Variant, expected: Variant) -> Dictionary:
	var errors: Array = []
	var report: Dictionary = _empty_report()
	if not (expected is Dictionary) or (expected as Dictionary).is_empty():
		errors.append(_error("expected_definition_missing", "", {}))
		return _finish(report, errors)
	_validate_expected(expected, errors)
	if not errors.is_empty():
		return _finish(report, errors)
	if not _live_root(root, errors):
		return _finish(report, errors)
	# Synchronous readonly window: fingerprint, read, fingerprint. No await.
	var before: Dictionary = _state(root, expected)
	var seen: Dictionary = {}
	for target in expected["targets"]:
		_inspect_target(root, target, report, seen, errors)
	var after: Dictionary = _state(root, expected)
	report["state_unchanged"] = before == after
	if before != after:
		errors.append(_error("state_changed_during_inspection", "", {}))
	var paths: Array = seen.keys()
	paths.sort()
	for path in paths:
		report["textures"].append(seen[path])
	if expected.has("quality_target"):
		report["quality_target"] = _quality(expected["quality_target"], report["animations"])
	return _finish(report, errors)

static func _empty_report() -> Dictionary:
	return {"schema": SCHEMA, "status": "NOT_READY", "reason": "", "errors": [],
		"readiness_scope": READINESS_SCOPE, "source_wait_complete": NOT_PROVEN,
		"gpu_upload": NOT_PROVEN, "gpu_render": NOT_PROVEN,
		"js_source_sprite_wait_published": false, "stage_complete_published": false,
		"source_wait_publisher": "UNCONNECTED",
		"inspector_effects": {"resource_loads": 0, "image_reads": 0, "texture_allocations": 0,
			"nodes_added": 0, "draw_calls": 0, "waits": 0},
		"state_unchanged": null, "targets": [], "animations": [], "textures": [],
		"targets_inspected": 0, "animations_inspected": 0, "frames_inspected": 0}

static func _finish(report: Dictionary, errors: Array) -> Dictionary:
	report["errors"] = errors
	report["status"] = "READY" if errors.is_empty() and report["frames_inspected"] + report["targets_inspected"] > 0 else "NOT_READY"
	report["reason"] = errors[0]["code"] if not errors.is_empty() else ("" if report["status"] == "READY" else "no_actual_resource_read")
	return report

static func _error(code: String, at: String, detail: Dictionary) -> Dictionary:
	return {"code": code, "at": at, "detail": detail}

static func _invalid(errors: Array, at: String, why: String) -> void:
	errors.append(_error("expected_definition_invalid", at, {"why": why}))

# --- lifecycle ---------------------------------------------------------------

static func _lifecycle_error(node: Variant) -> String:
	if typeof(node) == TYPE_NIL:
		return "missing"
	if typeof(node) != TYPE_OBJECT:
		return "not_node"
	if not is_instance_valid(node):
		return "freed"
	if not (node is Node):
		return "not_node"
	if node.is_queued_for_deletion():
		return "queued_for_deletion"
	if not node.is_inside_tree():
		return "not_inside_tree"
	if not node.is_node_ready():
		return "not_ready"
	return ""

static func _live_root(root: Variant, errors: Array) -> bool:
	var life: String = _lifecycle_error(root)
	if life != "":
		errors.append(_error("root_" + life, "", {}))
		return false
	# Appropriate tree: the running main SceneTree, not a detached/foreign tree.
	if root.get_tree() != Engine.get_main_loop():
		errors.append(_error("root_foreign_tree", "", {}))
		return false
	return true

# --- expectation validation --------------------------------------------------

static func _node_path(value: Variant) -> NodePath:
	return NodePath(value) if value is String else value

static func _valid_node_path(value: Variant) -> bool:
	if not (value is NodePath or value is String):
		return false
	var path: NodePath = _node_path(value)
	if path.is_empty() or path.is_absolute() or path.get_subname_count() != 0:
		return false
	for index in range(path.get_name_count()):
		var name: String = path.get_name(index)
		if name == "" or name == "." or name == "..":
			return false
	return true

static func _positive_number(value: Variant) -> bool:
	return (value is int or value is float) and is_finite(float(value)) and float(value) > 0.0

static func _res_path(value: Variant) -> bool:
	return value is String and value.begins_with("res://") and value.length() > 6

static func _finite_rect(value: Variant) -> bool:
	return value is Rect2 and is_finite(value.position.x) and is_finite(value.position.y) \
		and is_finite(value.size.x) and is_finite(value.size.y)

static func _validate_expected(expected: Dictionary, errors: Array) -> void:
	if expected.get("schema") != EXPECTATION_SCHEMA:
		_invalid(errors, "schema", "unsupported_schema")
	var source: Variant = expected.get("source")
	if not (source is Dictionary) or source.is_empty():
		_invalid(errors, "source", "source_definition_missing")
	else:
		for key in source:
			if not (source[key] is String) or source[key] == "":
				_invalid(errors, "source/" + str(key), "source_reference_must_be_nonempty_string")
	if expected.has("quality_target"):
		var quality: Variant = expected["quality_target"]
		if not (quality is Dictionary) or not (quality.get("unique_frames") is int) \
				or quality.get("unique_frames") <= 0 or not _positive_number(quality.get("fps")):
			_invalid(errors, "quality_target", "unique_frames_int_and_fps_required")
	var targets: Variant = expected.get("targets")
	if not (targets is Array) or targets.is_empty():
		_invalid(errors, "targets", "required_targets_missing")
		return
	var ids: Dictionary = {}
	for t in range(targets.size()):
		var at: String = "targets/%d" % t
		var target: Variant = targets[t]
		if not (target is Dictionary):
			_invalid(errors, at, "target_descriptor_required")
			continue
		var id: Variant = target.get("id")
		if not (id is String) or id == "" or ids.has(id):
			_invalid(errors, at + "/id", "missing_or_duplicate_id")
		else:
			ids[id] = true
		if not _valid_node_path(target.get("node_path")):
			_invalid(errors, at + "/node_path", "relative_descendant_path_required")
		var target_class: Variant = target.get("class")
		if not (target_class is String) or not TARGET_CLASSES.has(target_class):
			_invalid(errors, at + "/class", "AnimatedSprite2D_or_Sprite2D_required")
			continue
		if target_class == "Sprite2D":
			_validate_texture(target.get("texture"), at + "/texture", errors)
			continue
		if target.has("exact_animation_names") and not (target["exact_animation_names"] is bool):
			_invalid(errors, at + "/exact_animation_names", "bool_required")
		var animations: Variant = target.get("animations")
		if not (animations is Array) or animations.is_empty():
			_invalid(errors, at + "/animations", "required_animations_missing")
			continue
		var names: Dictionary = {}
		for a in range(animations.size()):
			var animation_at: String = "%s/animations/%d" % [at, a]
			var animation: Variant = animations[a]
			if not (animation is Dictionary):
				_invalid(errors, animation_at, "animation_descriptor_required")
				continue
			var name: Variant = animation.get("name")
			if not (name is String) or name == "" or names.has(name):
				_invalid(errors, animation_at + "/name", "missing_or_duplicate_name")
			else:
				names[name] = true
			if animation.has("loop") and not (animation["loop"] is bool):
				_invalid(errors, animation_at + "/loop", "bool_required")
			if animation.has("speed") and not _positive_number(animation["speed"]):
				_invalid(errors, animation_at + "/speed", "positive_finite_required")
			if animation.has("exact_frame_count") and not (animation["exact_frame_count"] is bool):
				_invalid(errors, animation_at + "/exact_frame_count", "bool_required")
			var frames: Variant = animation.get("frames")
			if not (frames is Array) or frames.is_empty():
				_invalid(errors, animation_at + "/frames", "required_frames_missing")
				continue
			var indices: Dictionary = {}
			for f in range(frames.size()):
				var frame_at: String = "%s/frames/%d" % [animation_at, f]
				var frame: Variant = frames[f]
				if not (frame is Dictionary):
					_invalid(errors, frame_at, "frame_descriptor_required")
					continue
				var index: Variant = frame.get("index")
				if not (index is int) or index < 0 or indices.has(index):
					_invalid(errors, frame_at + "/index", "unique_nonnegative_int_required")
				else:
					indices[index] = true
				if frame.has("duration") and not _positive_number(frame["duration"]):
					_invalid(errors, frame_at + "/duration", "positive_finite_required")
				_validate_texture(frame.get("texture"), frame_at + "/texture", errors)

static func _validate_texture(texture: Variant, at: String, errors: Array) -> void:
	if not (texture is Dictionary):
		_invalid(errors, at, "texture_descriptor_required")
		return
	var texture_class: Variant = texture.get("class")
	if not (texture_class is String) or texture_class == "":
		_invalid(errors, at + "/class", "texture_class_required")
		return
	if texture_class != "AtlasTexture":
		if not _res_path(texture.get("resource_path")):
			_invalid(errors, at + "/resource_path", "res_path_required")
		return
	var atlas: Variant = texture.get("atlas")
	if not (atlas is Dictionary) or not _res_path(atlas.get("resource_path")) \
			or not (atlas.get("class") is String) or atlas.get("class") in ["", "AtlasTexture"]:
		_invalid(errors, at + "/atlas", "backed_atlas_class_and_res_path_required")
	# region null means the actual AtlasTexture empty default Rect2().
	if not texture.has("region"):
		_invalid(errors, at + "/region", "explicit_region_or_null_required")
	elif typeof(texture["region"]) != TYPE_NIL:
		var region: Variant = texture["region"]
		if not _finite_rect(region) or region.position.x < 0.0 or region.position.y < 0.0 \
				or region.size.x <= 0.0 or region.size.y <= 0.0:
			_invalid(errors, at + "/region", "finite_nonnegative_position_positive_size_required")
	if texture.has("margin") and not _finite_rect(texture["margin"]):
		_invalid(errors, at + "/margin", "finite_rect_required")
	if texture.has("filter_clip") and not (texture["filter_clip"] is bool):
		_invalid(errors, at + "/filter_clip", "bool_required")

# --- actual tree/resource reads ----------------------------------------------

static func _inspect_target(root: Node, target: Dictionary, report: Dictionary, seen: Dictionary, errors: Array) -> void:
	var path: NodePath = _node_path(target["node_path"])
	var at: String = target["id"]
	var node: Node = root.get_node_or_null(path)
	if node == null:
		errors.append(_error("target_node_missing", at, {"node_path": String(path)}))
		return
	var life: String = _lifecycle_error(node)
	if life != "":
		errors.append(_error("target_" + life, at, {"node_path": String(path)}))
		return
	if node.get_tree() != root.get_tree() or not root.is_ancestor_of(node):
		errors.append(_error("target_outside_supplied_root", at, {"node_path": String(path)}))
		return
	if node.get_class() != target["class"]:
		errors.append(_error("target_class_mismatch", at, {"expected": target["class"], "actual": node.get_class()}))
		return
	report["targets"].append({"id": at, "node_path": String(path), "class": node.get_class(),
		"parent_class": node.get_parent().get_class()})
	report["targets_inspected"] += 1
	if node is Sprite2D:
		_check_texture((node as Sprite2D).texture, target["texture"], at + "/texture", seen, errors)
		return
	_inspect_frames(node as AnimatedSprite2D, target, at, report, seen, errors)

static func _inspect_frames(sprite: AnimatedSprite2D, target: Dictionary, at: String, report: Dictionary, seen: Dictionary, errors: Array) -> void:
	var frames: SpriteFrames = sprite.sprite_frames
	if frames == null or not is_instance_valid(frames):
		errors.append(_error("sprite_frames_missing", at, {}))
		return
	var described: Dictionary = {}
	for animation in target["animations"]:
		described[animation["name"]] = true
	if target.get("exact_animation_names", false):
		var extras: Array = []
		for name in frames.get_animation_names():
			if not described.has(String(name)):
				extras.append(String(name))
		extras.sort()
		if not extras.is_empty():
			errors.append(_error("animation_unexpected", at, {"names": extras}))
	if not frames.has_animation(sprite.animation):
		errors.append(_error("current_animation_missing", at, {"animation": String(sprite.animation)}))
	elif sprite.frame < 0 or sprite.frame >= frames.get_frame_count(sprite.animation):
		errors.append(_error("current_frame_out_of_range", at, {"animation": String(sprite.animation), "frame": sprite.frame}))
	for animation in target["animations"]:
		var name: String = animation["name"]
		var animation_at: String = at + "/" + name
		if not frames.has_animation(name):
			errors.append(_error("animation_missing", animation_at, {}))
			continue
		var count: int = frames.get_frame_count(name)
		var speed: float = frames.get_animation_speed(name)
		var loop: bool = frames.get_animation_loop(name)
		if animation.has("loop") and loop != animation["loop"]:
			errors.append(_error("animation_loop_mismatch", animation_at, {"expected": animation["loop"], "actual": loop}))
		if animation.has("speed") and not is_equal_approx(speed, float(animation["speed"])):
			errors.append(_error("animation_speed_mismatch", animation_at, {"expected": float(animation["speed"]), "actual": speed}))
		if animation.get("exact_frame_count", false) and count != animation["frames"].size():
			errors.append(_error("animation_frame_count_mismatch", animation_at, {"expected": animation["frames"].size(), "actual": count}))
		var unique: Dictionary = {}
		for frame in animation["frames"]:
			var index: int = frame["index"]
			var frame_at: String = "%s/%d" % [animation_at, index]
			if index >= count:
				errors.append(_error("frame_missing", frame_at, {"frame_count": count}))
				continue
			if frame.has("duration") and not is_equal_approx(frames.get_frame_duration(name, index), float(frame["duration"])):
				errors.append(_error("frame_duration_mismatch", frame_at, {"expected": float(frame["duration"]), "actual": frames.get_frame_duration(name, index)}))
			var identity: String = _check_texture(frames.get_frame_texture(name, index), frame["texture"], frame_at, seen, errors)
			if identity != "":
				unique[identity] = true
			report["frames_inspected"] += 1
		report["animations"].append({"target": at, "name": name, "frames": count, "unique_frames": unique.size(),
			"speed_fps": speed, "loop": loop})
		report["animations_inspected"] += 1

static func _object_error(texture: Variant) -> String:
	if typeof(texture) == TYPE_NIL:
		return "missing"
	if typeof(texture) != TYPE_OBJECT or not is_instance_valid(texture):
		return "freed"
	if not (texture is Texture2D):
		return "not_texture2d"
	if texture is PlaceholderTexture2D:
		return "placeholder"
	return ""

## Returns a stable identity for unique-frame counting, or "" on any error.
static func _check_texture(texture: Variant, descriptor: Dictionary, at: String, seen: Dictionary, errors: Array) -> String:
	var problem: String = _object_error(texture)
	if problem != "":
		errors.append(_error("texture_" + problem, at, {}))
		return ""
	if texture.get_class() != descriptor["class"]:
		errors.append(_error("texture_class_mismatch", at, {"expected": descriptor["class"], "actual": texture.get_class()}))
		return ""
	if texture is AtlasTexture:
		return _check_atlas(texture, descriptor, at, seen, errors)
	return descriptor["resource_path"] if _check_backed(texture, descriptor["resource_path"], descriptor["class"], "texture", at, seen, errors) else ""

static func _check_backed(texture: Variant, path: String, texture_class: String, prefix: String, at: String, seen: Dictionary, errors: Array) -> bool:
	var problem: String = _object_error(texture)
	if problem != "":
		errors.append(_error(prefix + "_" + problem, at, {"expected_path": path}))
		return false
	var count: int = errors.size()
	if texture.get_class() != texture_class:
		errors.append(_error(prefix + "_class_mismatch", at, {"expected": texture_class, "actual": texture.get_class()}))
	if texture.resource_path != path:
		errors.append(_error(prefix + "_path_mismatch", at, {"expected": path, "actual": texture.resource_path}))
	if texture is CompressedTexture2D and texture.get_load_path() == "":
		errors.append(_error(prefix + "_unloaded", at, {"path": texture.resource_path}))
	var width: int = texture.get_width()
	var height: int = texture.get_height()
	if width <= 0 or height <= 0:
		errors.append(_error(prefix + "_zero_size", at, {"size": [width, height]}))
	if errors.size() != count:
		return false
	seen[path] = {"resource_path": path, "class": texture.get_class(), "width": width, "height": height}
	return true

## Godot AtlasTexture semantics: a zero region width/height uses the atlas
## width/height on that axis with the same position. No clipping is applied.
static func _effective_region(region: Rect2, atlas_size: Vector2) -> Rect2:
	var effective: Rect2 = region
	if effective.size.x == 0.0:
		effective.size.x = atlas_size.x
	if effective.size.y == 0.0:
		effective.size.y = atlas_size.y
	return effective

static func _inside(region: Rect2, atlas_size: Vector2) -> bool:
	return region.size.x > 0.0 and region.size.y > 0.0 and region.position.x >= 0.0 and region.position.y >= 0.0 \
		and region.end.x <= atlas_size.x and region.end.y <= atlas_size.y

static func _check_atlas(texture: AtlasTexture, descriptor: Dictionary, at: String, seen: Dictionary, errors: Array) -> String:
	var atlas_descriptor: Dictionary = descriptor["atlas"]
	if not _check_backed(texture.atlas, atlas_descriptor["resource_path"], atlas_descriptor["class"], "atlas", at, seen, errors):
		return ""
	var count: int = errors.size()
	var atlas_size := Vector2(texture.atlas.get_width(), texture.atlas.get_height())
	var region: Rect2 = texture.region
	var effective: Rect2 = _effective_region(region, atlas_size)
	if not _inside(effective, atlas_size):
		errors.append(_error("atlas_region_out_of_bounds", at, {"region": _rect(region), "effective": _rect(effective), "atlas_size": [atlas_size.x, atlas_size.y]}))
	var expected_region: Rect2 = descriptor["region"] if typeof(descriptor["region"]) != TYPE_NIL else Rect2()
	if region != expected_region:
		errors.append(_error("atlas_region_mismatch", at, {"expected": _rect(expected_region), "actual": _rect(region), "effective": _rect(effective)}))
	if not _inside(_effective_region(expected_region, atlas_size), atlas_size):
		errors.append(_error("expected_region_out_of_bounds", at, {"expected": _rect(expected_region), "atlas_size": [atlas_size.x, atlas_size.y]}))
	if descriptor.has("margin") and texture.margin != descriptor["margin"]:
		errors.append(_error("atlas_margin_mismatch", at, {"expected": _rect(descriptor["margin"]), "actual": _rect(texture.margin)}))
	if descriptor.has("filter_clip") and texture.filter_clip != descriptor["filter_clip"]:
		errors.append(_error("atlas_filter_clip_mismatch", at, {"expected": descriptor["filter_clip"], "actual": texture.filter_clip}))
	if texture.get_width() <= 0 or texture.get_height() <= 0:
		errors.append(_error("texture_zero_size", at, {"size": [texture.get_width(), texture.get_height()]}))
	if errors.size() != count:
		return ""
	return "%s|%s" % [atlas_descriptor["resource_path"], str(_rect(effective))]

static func _rect(rect: Rect2) -> Array:
	return [rect.position.x, rect.position.y, rect.size.x, rect.size.y]

static func _quality(target: Dictionary, animations: Array) -> Dictionary:
	# Informational gap report only; never a readiness gate.
	var meeting: int = 0
	for animation in animations:
		if animation["unique_frames"] >= target["unique_frames"] and animation["speed_fps"] >= float(target["fps"]):
			meeting += 1
	return {"unique_frames": target["unique_frames"], "fps": float(target["fps"]), "animations_total": animations.size(),
		"animations_meeting": meeting, "met": meeting == animations.size() and not animations.is_empty(), "readiness_gate": false}

# --- readonly fingerprint (internal; instance ids are not reported) ----------

static func _ids(nodes: Array) -> Array:
	var ids: Array = []
	for node in nodes:
		ids.append(node.get_instance_id())
	return ids

static func _node_state(node: Node) -> Dictionary:
	var parent: Node = node.get_parent()
	return {"id": node.get_instance_id(), "parent": parent.get_instance_id() if parent != null else 0,
		"children": _ids(node.get_children()), "inside_tree": node.is_inside_tree(), "queued": node.is_queued_for_deletion()}

static func _texture_state(texture: Variant) -> Array:
	if typeof(texture) != TYPE_OBJECT or not is_instance_valid(texture):
		return [0]
	if texture is AtlasTexture:
		var atlas: Variant = texture.atlas
		return [texture.get_instance_id(), atlas.get_instance_id() if is_instance_valid(atlas) else 0,
			texture.region, texture.margin, texture.filter_clip]
	return [texture.get_instance_id()]

static func _state(root: Node, expected: Dictionary) -> Dictionary:
	var state: Dictionary = {"root": _node_state(root)}
	for target in expected["targets"]:
		var node: Node = root.get_node_or_null(_node_path(target["node_path"]))
		if node == null or not is_instance_valid(node):
			state[target["id"]] = null
			continue
		var entry: Dictionary = _node_state(node)
		if node is AnimatedSprite2D:
			var sprite: AnimatedSprite2D = node as AnimatedSprite2D
			var frames: SpriteFrames = sprite.sprite_frames
			entry["animation"] = sprite.animation
			entry["frame"] = sprite.frame
			entry["frame_progress"] = sprite.frame_progress
			entry["playing"] = sprite.is_playing()
			entry["speed_scale"] = sprite.speed_scale
			entry["sprite_frames"] = frames.get_instance_id() if is_instance_valid(frames) else 0
			var contents: Dictionary = {}
			if is_instance_valid(frames):
				for name in frames.get_animation_names():
					var textures: Array = []
					for index in range(frames.get_frame_count(name)):
						textures.append(_texture_state(frames.get_frame_texture(name, index)))
					contents[name] = [frames.get_animation_speed(name), frames.get_animation_loop(name), textures]
			entry["contents"] = contents
		elif node is Sprite2D:
			var still: Sprite2D = node as Sprite2D
			entry["texture"] = _texture_state(still.texture)
			entry["region"] = [still.region_enabled, still.region_rect, still.hframes, still.vframes, still.frame]
		state[target["id"]] = entry
	return state
