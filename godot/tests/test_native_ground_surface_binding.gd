extends SceneTree
## Actual World + original loaded resources and CanvasItems. New binding only:
## no old MAP_RESOURCE suite, Main, physics driver, public pixels or gameplay.
const WorldScript = preload("res://scripts/world.gd")
const AdapterScript = preload("res://scripts/native_ground_surface_adapter.gd")

class InitialCamera extends Camera2D:
	func _init(point: Vector2) -> void:
		position = point

class ConstructorMapProvider extends Node2D:
	var initial_context: Variant
	func _init(context: Variant) -> void:
		initial_context = context
	func get_native_map_surface_context() -> Variant:
		return initial_context

var _world: Node2D
var _camera: Camera2D
var _adapter: Node2D
var _only: Array = []
var _failed = 0
var _passed: Array = []
var _completed: Array = []
var _observations: Dictionary = {}

func _initialize() -> void:
	paused = true
	for argument in OS.get_cmdline_user_args():
		if argument.begins_with("--only="):
			_only = Array(argument.trim_prefix("--only=").split(","))
	call_deferred("_run")

func check(value: bool, label: String) -> void:
	if not value:
		_failed += 1
		print("ASSERT_FAIL " + label)

func _setup_actual_world() -> bool:
	_world = WorldScript.new()
	_camera = InitialCamera.new(_world.get_start_position())
	root.add_child(_camera)
	_camera.make_current()
	_camera.force_update_scroll()
	root.add_child(_world)
	if not _world.ready_for_player:
		print("HARNESS_ERROR actual World resource/map/underlay startup not ready")
		return false
	var candidates: Array = []
	for child in _world.get_children():
		if child.get_script() == AdapterScript:
			candidates.append(child)
	if candidates.size() != 1:
		print("HARNESS_ERROR expected exactly one installed ground adapter")
		return false
	_adapter = candidates[0]
	return true

func _cleanup() -> void:
	if is_instance_valid(_world):
		_world.free()
	if is_instance_valid(_camera):
		_camera.free()

func _preserved_world_state() -> Dictionary:
	var collider_nodes: Array = []
	var sprites: Array = []
	var other_children: Array = []
	for child in _world.get_children():
		if child.get_script() == AdapterScript:
			continue
		other_children.append(child.get_instance_id())
		if child is StaticBody2D:
			var shapes: Array = []
			for item in child.get_children():
				if item is CollisionShape2D:
					shapes.append({"node":item.get_instance_id(), "position":item.position,
						"shape":item.shape.get_instance_id() if item.shape != null else 0})
			collider_nodes.append({"node":child.get_instance_id(), "position":child.position,
				"layer":child.collision_layer, "mask":child.collision_mask, "shapes":shapes})
		if child is Sprite2D:
			sprites.append({"node":child.get_instance_id(), "position":child.position,
				"scale":child.scale, "z":child.z_index, "visible":child.visible,
				"texture":child.texture.get_instance_id() if child.texture != null else 0})
	return {"collision_count":_world.collision_count, "collider_nodes":collider_nodes,
		"sprites":sprites, "other_children":other_children,
		"start":_world.get_start_position(), "exit":_world.get_exit_position(),
		"context":_world.get_native_map_surface_context()}

func _actual_resources_materials_and_pass_layers() -> void:
	if not _setup_actual_world():
		check(false, "actual resource fixture ready")
		return
	var snapshot: Dictionary = _world.get_native_ground_surface_snapshot()
	check(snapshot["ready"] and snapshot["resource_binding_ready"] and snapshot["pass_count"] == 2,
		"actual startup installs one ready two-pass underlay")
	check(snapshot["soil"]["path"] == "res://assets/map/ch1/ground_dark_soil.png"
		and snapshot["litter"]["path"] == "res://assets/map/ch1/materials/forest_moss_litter.png",
		"both original imported resource targets are actually bound")
	check(snapshot["soil"]["dimensions"] == Vector2i(1024,1024)
		and snapshot["litter"]["dimensions"] == Vector2i(1254,1254),
		"actual Texture2D dimensions retain original pixels, litter is not resized to repeat512")
	var surface: Node2D = _adapter.get_node("OriginalSoilLitterSurface")
	check(_adapter.transform == Transform2D.IDENTITY and surface.transform == Transform2D.IDENTITY
		and not surface.z_as_relative and surface.z_index == -3002, "actual local origin/transform and parent depth preserved")
	var soil: ColorRect = surface.get_node("SoilBase")
	var litter: ColorRect = surface.get_node("LitterOverlay")
	for rectangle in [soil,litter]:
		check(rectangle.size == Vector2(8000,8000) and rectangle.position == Vector2.ZERO,
			"real CanvasItem covers original world8000 square at local origin")
		check(rectangle.visible and rectangle.z_as_relative, "both original passes remain visible and relative to surface")
	var soil_material: ShaderMaterial = soil.material as ShaderMaterial
	var litter_material: ShaderMaterial = litter.material as ShaderMaterial
	check(soil_material != null and litter_material != null and soil_material.shader != null and litter_material.shader != null,
		"real pass CanvasItems hold actual ShaderMaterials")
	var soil_texture: Texture2D = soil_material.get_shader_parameter("soil_tex") as Texture2D
	var litter_texture: Texture2D = litter_material.get_shader_parameter("litter_tex") as Texture2D
	check(soil_texture != null and litter_texture != null
		and soil_texture.resource_path == snapshot["soil"]["path"] and litter_texture.resource_path == snapshot["litter"]["path"],
		"actual material sampler bindings agree with runtime resources")
	check(is_equal_approx(soil_material.get_shader_parameter("brightness"),.85)
		and is_equal_approx(soil_material.get_shader_parameter("saturation"),.48)
		and soil_material.get_shader_parameter("tile_world") == 1024.0,
		"soil actual shader inputs preserve approved recipe")
	check(is_equal_approx(litter_material.get_shader_parameter("brightness"),.76)
		and is_equal_approx(litter_material.get_shader_parameter("saturation"),.55)
		and is_equal_approx(litter_material.get_shader_parameter("overlay_alpha"),.7)
		and litter_material.get_shader_parameter("tile_world") == 512.0,
		"litter actual shader inputs preserve approved overlay recipe")
	check(surface.z_index + soil.z_index == -3002 and surface.z_index + litter.z_index == -3001,
		"effective soil/litter passes are ordered below preserved native chunks")
	var chunks = 0
	var props = 0
	var ground_props = 0
	for child in _world.get_children():
		if child is Sprite2D:
			if child.z_index == -3000:
				chunks += 1
				check(child.visible, "original active startup chunk remains visible")
			else:
				props += 1
				if child.z_index == -2500:
					ground_props += 1
	check(chunks > 0 and props > 0 and _world.collision_count > 0, "existing chunks/props/collision are still installed")
	var context: Dictionary = _world.get_native_map_surface_context()
	check(context["width"] * context["tile_size"] == 8000 and context["height"] * context["tile_size"] == 8000,
		"actual canonical World dimensions agree with installed underlay extent")
	snapshot["passes"][0]["texture"]["path"] = "fixture-only-detached-copy"
	check(_adapter.get_snapshot()["passes"][0]["texture"]["path"] == soil_texture.resource_path, "public underlay snapshot is detached")
	_observations["actual_bindings"] = {"dimensions":{"soil":[1024,1024],"litter":[1254,1254]},
		"effective_pass_z":[-3002,-3001], "original_chunks":chunks, "original_props":props,
		"original_ground_props":ground_props, "collision_count":_world.collision_count,
		"world_context":context, "shader_parameters_not_pixel_proof":true}
	_cleanup()

func _invalid_map_atomic_preflight() -> void:
	var canonical = {"schema":"exoduser.godot.ch1-native-first.v1", "stage":0, "width":200, "height":200, "tile_size":40}
	var contexts: Array = [null, {}, "invalid-map-context"]
	for change in [{"schema":"unsupported"},{"stage":1},{"width":201},{"tile_size":20},{"height":false}]:
		var unsupported: Dictionary = canonical.duplicate()
		unsupported.merge(change,true)
		contexts.append(unsupported)
	var results: Array = []
	for context in contexts:
		var world = ConstructorMapProvider.new(context)
		root.add_child(world)
		var adapter = AdapterScript.new()
		check(not adapter.configure(world), "constructor missing/unsupported map rejected before texture/surface installation")
		var snapshot: Dictionary = adapter.get_snapshot()
		check(not snapshot["configured"] and not snapshot["ready"] and snapshot["pass_count"] == 0
			and adapter.get_child_count() == 0 and world.get_child_count() == 0,
			"invalid map binding is atomic: no surface, pass or fake geometry child")
		check(adapter.dispose() and adapter.dispose(), "failed constructor binding cleanup is idempotent")
		results.append({"context_type":typeof(context), "error":snapshot["configuration_error"],
			"adapter_children":0, "provider_geometry_children":0})
		adapter.free()
		world.free()
	var missing = Node2D.new()
	root.add_child(missing)
	var no_getter = AdapterScript.new()
	check(not no_getter.configure(missing) and no_getter.get_child_count() == 0,
		"constructor World without actual public context getter is rejected")
	no_getter.free()
	missing.free()
	_observations["invalid_contexts"] = {"cases":results, "missing_getter_rejected":true,
		"constructor_providers_are_not_actual_map_geometry":true, "canonical_resources_deleted_or_renamed":false}

func _lifecycle_cleanup_preserves_existing_world() -> void:
	var results: Array = []
	for scenario in ["detach_surface", "reparent_surface", "queue_surface", "null_rebind", "queue_adapter"]:
		if not _setup_actual_world():
			check(false, "actual lifecycle fixture ready")
			return
		var before: Dictionary = _preserved_world_state()
		var surface: Node2D = _adapter.get_node("OriginalSoilLitterSurface")
		check(_adapter.is_native_surface_ready(), "installed actual material surface initially ready")
		match scenario:
			"detach_surface":
				_adapter.remove_child(surface)
			"reparent_surface":
				surface.reparent(_world)
			"queue_surface":
				surface.queue_free()
			"null_rebind":
				surface.bind_textures(null,null)
				check(surface.snapshot()["bound"], "ROOT null bind structural flag is true but does not establish readiness")
			"queue_adapter":
				_adapter.queue_free()
		check(not _adapter.get_snapshot()["ready"] and not _adapter.get_snapshot()["resource_binding_ready"]
			and not _world.get_native_ground_surface_snapshot()["ready"],
			"actual detached/reparented/queued/null-bound surface becomes unready:" + scenario)
		check(_adapter.dispose() and _adapter.dispose() and _adapter.get_child_count() == 0,
			"owned cleanup removes all underlay passes and is idempotent:" + scenario)
		check(not is_instance_valid(surface), "cleanup frees the owned surface, including detached/reparented instance:" + scenario)
		var after: Dictionary = _preserved_world_state()
		check(before == after, "cleanup preserves actual collision nodes/resources, chunks, props, START/EXIT and map context:" + scenario)
		results.append({"scenario":scenario, "ready_after":_adapter.get_snapshot()["ready"],
			"owned_surface_freed":not is_instance_valid(surface), "preserved_world_equal":before == after,
			"collision_count":after["collision_count"]})
		_cleanup()
	_observations["lifecycle"] = {"cases":results, "public_lifecycle_and_Surface_bind_only":true,
		"actual_World_geometry_written":false, "automatic_native_ticks":0}

func _group(name: String, callback: Callable) -> void:
	if not _only.is_empty() and not _only.has(name):
		return
	print("GROUP_BEGIN " + name)
	var before = _failed
	await callback.call()
	_completed.append(name)
	if before == _failed:
		_passed.append(name)
		print("GROUP_PASS " + name)
	else:
		print("GROUP_FAIL " + name)

func _run() -> void:
	var known = ["actual_resources_materials_and_pass_layers", "invalid_map_atomic_preflight", "lifecycle_cleanup_preserves_existing_world"]
	for requested in _only:
		if not known.has(requested):
			print("INVALID_ONLY_FILTER " + str(requested))
			quit(2)
			return
	await _group(known[0], _actual_resources_materials_and_pass_layers)
	await _group(known[1], _invalid_map_atomic_preflight)
	await _group(known[2], _lifecycle_cleanup_preserves_existing_world)
	print("NATIVE_GROUND_SURFACE_BINDING_RECEIPT " + JSON.stringify({"completed":_completed, "passed":_passed,
		"failed_assertions":_failed, "automatic_World_Player_physics":0, "explicit_World_Player_physics_calls":0,
		"explicit_render_calls":0, "live_HP_position_AI_clock_setters":false, "map_collision_nav_setters":false,
		"Main_capture_save_GUI":false, "old_MAP_RESOURCE_suite_reexecutions":0,
		"original_PNG_reads_hash_copy_import_by_worker":0, "observations":_observations}))
	quit(0 if _failed == 0 else 1)
