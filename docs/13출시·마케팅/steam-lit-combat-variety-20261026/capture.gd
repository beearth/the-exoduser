extends SceneTree
var main:Node
var shots:Array=[]
var report:Dictionary={"staged_capture":true,"source":"Godot lighting worktree development preview","postprocessing":false,"hud_hidden_in_live_view":true,"dialogue_panel_hidden_for_development_map_preview":true,"enemy_placement":"normal intro ring API at camera fixture; no enemy teleport or stat edits","performance_claim":false,"shots":[]}
var output:="I:/EXODUSER-Storage/steam/gallery_refresh_20261026/v4"
const SPOTS:=[{"id":"camp","at":Vector2(2100,4300),"skill":"slam"},{"id":"cocoon","at":Vector2(1950,2320),"skill":"ice"},{"id":"toxic","at":Vector2(6350,2020),"skill":"spike"},{"id":"tree","at":Vector2(4350,4020),"skill":"holy"}]
func _initialize()->void:call_deferred("_run")
func _run()->void:
	if ProjectSettings.get_setting("application/config/custom_user_dir_name")!="EXODUSER-SteamCombat-Isolated-20261026" or DisplayServer.get_name()=="headless":
		quit(2)
		return
	root.size=Vector2i(1920,1080)
	root.gui_disable_input=true
	for spot in SPOTS:
		seed(20261020)
		main=load("res://scenes/main.tscn").instantiate()
		main.set_meta("native_map_look","on")
		root.add_child(main)
		_disable_input(main)
		var at:Vector2=spot.at
		main.player.global_position=at
		main.camera.global_position=at
		main.camera.reset_smoothing()
		main.world._update_visible_chunks(at,true)
		main.source_intro_sequence.begin_native_intro()
		var opened:Dictionary=main.source_intro_sequence.finish_native_guide()
		main.hud.visible=false
		for i in range(310):await physics_frame
		var skills:Node=main.world.get_node("NativeSkillSlots")
		for frame in range(140):
			var closest:Node2D=null
			var best:=100000.0
			var count:=0
			for enemy in main.world.get_enemies():
				if not is_instance_valid(enemy) or enemy.get("alive")!=true:continue
				var d:float=enemy.global_position.distance_to(main.player.global_position)
				if d<900:count+=1
				if d<best:
					best=d
					closest=enemy
			if closest!=null:main.player.set("facing",(closest.global_position-main.player.global_position).normalized())
			if frame==0:main.player.request_attack()
			if frame==9:main.player.release_attack()
			if frame==0 and spot.skill!="slam":main.player.release_attack()
			if frame==55 and main.player.get("state")=="idle":
				match spot.skill:
					"slam":skills.cast_giant_slam()
					"ice":skills.cast_ice_orb()
					"spike":skills.cast_spike_trap()
					"holy":skills.cast_holy_dome()
			if frame==100 and spot.skill=="ice":skills.activate_ice_shatter()
			var pet_panel:Control=main.world.get_node("NativePets").get("_subtitle_root")
			if is_instance_valid(pet_panel):pet_panel.visible=false
			if frame in [15,62,69,107,125]:
				await RenderingServer.frame_post_draw
				var file:="%s_%03d.png"%[spot.id,frame]
				shots.append({"file":file,"image":root.get_texture().get_image()})
				report.shots.append({"file":file,"live_enemies_in_radius":count,"player_state":main.player.get("state"),"position":[at.x,at.y],"skill":spot.skill,"intro":opened,"pets":main.world.get_node("NativePets").get_native_pets_snapshot(),"skills":skills.get_native_skill_slots_snapshot()})
			await physics_frame
		print("REFRESH_CAPTURE_SPOT ",spot.id)
		root.remove_child(main)
		main.free()
		await process_frame
	for shot in shots:shot.image.save_png(output.path_join(shot.file))
	var f:=FileAccess.open(output.path_join("receipt.json"),FileAccess.WRITE)
	f.store_string(JSON.stringify(report,"\t"))
	f.close()
	print("REFRESH_CAPTURE_DONE ",shots.size())
	quit(0)
func _disable_input(n:Node)->void:
	n.set_process_input(false)
	n.set_process_unhandled_input(false)
	n.set_process_unhandled_key_input(false)
	for c in n.get_children():_disable_input(c)
