extends SceneTree
const SLOT_SCRIPT=preload("res://scripts/native_skill_slots.gd")
const SHADER_PATH="res://assets/vfx/slam_atlas_feather.gdshader"
var slot: Node2D
var layer: Node2D
var folder:="user://slam_visual_regression"

class DrawLayer extends Node2D:
	var owner_slot: Node2D
	func _draw() -> void:
		if owner_slot.has_method("_draw_slam_content"): owner_slot.call("_draw_slam_content",self)
		else: owner_slot.call("_draw_additive_content",self)

func _initialize() -> void:call_deferred("_run")

func _run() -> void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name") != "EXODUSER-SteamCombat-Isolated-20261026":
		quit(2)
		return
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--out="):folder=arg.trim_prefix("--out=")
	DirAccess.make_dir_recursive_absolute(folder)
	root.size=Vector2i(480,480)
	RenderingServer.set_default_clear_color(Color.BLACK)
	slot=SLOT_SCRIPT.new()
	slot._sheet=load("res://assets/vfx/inferno_slam_impact_sheet.png")
	root.add_child(slot)
	slot.set_physics_process(false)
	layer=DrawLayer.new()
	layer.owner_slot=slot
	if ResourceLoader.exists(SHADER_PATH):
		var mat:=ShaderMaterial.new()
		mat.shader=load(SHADER_PATH)
		layer.material=mat
	else:
		var mat:=CanvasItemMaterial.new()
		mat.blend_mode=CanvasItemMaterial.BLEND_MODE_ADD
		layer.material=mat
	root.add_child(layer)
	var images: Array=[]
	for t in [22.49,22.51,34.0]:
		slot._waves=[{"x":240.0,"y":240.0,"maxR":400.0,"r":400.0,"t":t,"maxT":45.0}]
		layer.queue_redraw()
		await process_frame
		await RenderingServer.frame_post_draw
		images.append(root.get_texture().get_image())
	var mean_delta:=0.0
	for y in range(480):
		for x in range(480):
			var a:Color=images[0].get_pixel(x,y)
			var b:Color=images[1].get_pixel(x,y)
			mean_delta+=(absf(a.r-b.r)+absf(a.g-b.g)+absf(a.b-b.b))/3.0
	mean_delta/=480.0*480.0
	var edge_peak:=0.0
	for y in range(60,420):
		for x in [60,61,418,419]:
			var c:Color=images[2].get_pixel(x,y)
			edge_peak=maxf(edge_peak,maxf(c.r,maxf(c.g,c.b)))
	var result:Dictionary={"mean_frame_boundary_delta":mean_delta,"edge_peak":edge_peak,"frame_continuity_pass":mean_delta<0.002,"edge_pass":edge_peak<0.07,"shader":ResourceLoader.exists(SHADER_PATH)}
	var label:="after" if result.shader else "before"
	for i in range(images.size()):images[i].save_png(folder.path_join("slam_%s_%d.png"%[label,i]))
	var f:=FileAccess.open(folder.path_join("pixel-%s.json"%label),FileAccess.WRITE)
	f.store_string(JSON.stringify(result,"\t"))
	f.close()
	print("SLAM_PIXEL_TEST ",JSON.stringify(result))
	quit(0 if result.frame_continuity_pass and result.edge_pass else 1)
