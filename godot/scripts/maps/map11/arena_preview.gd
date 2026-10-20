extends Node2D
## MAP11-01 independent design blockout. No Main, G, save, damage or reward writer.
## Existing MAP-LOOK implementation/shaders are composed, never copied/modified.
const MapLook = preload("res://scripts/native_map_look.gd")
const Catalog = preload("res://scripts/native_ch1_boss_catalog.gd")
const RADIUS = 1700.0
const PLAYER_R = 15.0 # main player.gd export default; independent preview fixture
const BOSS_R = 44.0
const SLAM_R = 1320.0 # G41111–41142, si0 phase4: 1000+0*30+4*80
const TIDE_R = 1750.0 # G37949–37963
const FISSURE_LENGTH = 2304.0 # G37931–37948, max(128,108)*40*.45
const FISSURE_BLAST = 691.2 # min(750,2304*.3), NOT derived from new room size
const BOSS_HEIGHT = 620.4 # r44 * source dh14.1, idle atlas aspect retained G10963
const BODY_RADII = [164.0,259.0,359.0,459.0]
const ORB_ANGLES = [-.14,0.0,.14]
const BOARD_IDS = ["entry","close","wall","clear","body","bullets"]
const PROP_DIR = "res://assets/map/props/"
var map_data: Dictionary = {"props":[],"prop_colliders":[]}
var _chunks: Dictionary = {} # NativeMapLook read-only view, no web chunks
var player: CharacterBody2D
var boss: Sprite2D
var camera: Camera2D
var look: Node2D
var overlay_mode: int = 0
var board_id: String = "entry"
var tick: int = 0
const Fonts = preload("res://scripts/native_ui_fonts.gd")
var _font: Font = Fonts.stack("hell",400)
var _title: Label
var _sub: Label
var _foot: Label
var _legend: Label
var _overlay: Node2D
var _rim: StaticBody2D
var _tex: Dictionary = {}
var board_serial: int = 0
var _contact_boss: Sprite2D
var _contact_player: Sprite2D
var _rim_sprites: Array[Dictionary] = []
var _decal_count: int = 0

class Lines extends Node2D:
	var host: Node2D
	func _draw() -> void: host.draw_overlays(self)

func _ready() -> void:
	RenderingServer.set_default_clear_color(Color("11131b"))
	_build_floor()
	_build_rim()
	_build_props()
	_build_actors()
	_build_look()
	_overlay = Lines.new()
	_overlay.host = self
	_overlay.z_index = 3500
	var guide_material := CanvasItemMaterial.new()
	guide_material.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	_overlay.material = guide_material
	add_child(_overlay)
	_build_ui()
	select_board("entry")

func _circle_points(center: Vector2, radius: float, count: int = 128) -> PackedVector2Array:
	var points := PackedVector2Array()
	for i in range(count): points.append(center + Vector2.from_angle(TAU*float(i)/count)*radius)
	return points

func _poly(name_: String, points: PackedVector2Array, color: Color, z: int = -100) -> Polygon2D:
	var p := Polygon2D.new()
	p.name = name_
	p.polygon = points
	p.color = color
	p.z_index = z
	add_child(p)
	return p

func _build_floor() -> void:
	_poly("RenderMass",_circle_points(Vector2.ZERO,3900),Color("171820"),-500)
	var floor_mesh := _poly("SkinFloor",_circle_points(Vector2.ZERO,RADIUS),Color.WHITE,-450)
	floor_mesh.texture = load("res://assets/map/ch1_si1/ground_dark_soil.png")
	floor_mesh.texture_repeat = CanvasItem.TEXTURE_REPEAT_ENABLED
	floor_mesh.uv = floor_mesh.polygon
	floor_mesh.texture_scale = Vector2.ONE*1.2
	var surface := ShaderMaterial.new()
	surface.shader = preload("res://scripts/maps/map11/skin_floor.gdshader")
	floor_mesh.material = surface
	# MAP11-14: disconnected RGBA fissures share the field material grammar.
	var fissures:=Node2D.new();fissures.name="IrregularFissureDecals";fissures.z_index=-420;add_child(fissures)
	var fissure_material:=ShaderMaterial.new();fissure_material.shader=preload("res://scripts/maps/map11/field_decal.gdshader");fissure_material.set_shader_parameter("fissure",true)
	var sites=[Vector2(-1200,520),Vector2(1050,-430),Vector2(-470,1100),Vector2(550,450),Vector2(-690,-790)]
	for i in range(sites.size()):
		for part in range(3):
			var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/ch3/floor_objects/prop_ice_gcrack.png");sprite.material=fissure_material
			sprite.position=sites[i]+Vector2(part*135-100,((i+part)%3-1)*90);sprite.scale=Vector2(260+(i%3)*75,190+part*40)/sprite.texture.get_size();sprite.rotation=i*.79+part*1.1;sprite.flip_h=part==1;fissures.add_child(sprite)
	var ground := Node2D.new()
	ground.name = "RGBAFloorDecals"
	ground.z_index = -435
	add_child(ground)
	_decal(ground,"res://assets/map/props/prop_g_root.png",Vector2(-780,260),Vector2(1150,850),-.35,false)
	_decal(ground,"res://assets/map/props/prop_g_root.png",Vector2(880,-220),Vector2(1100,820),.7,false)
	_decal(ground,"res://assets/map/ch1/floor_objects/flesh_g_0.png",Vector2(-1130,730),Vector2(850,600),.4,true)
	_decal(ground,"res://assets/map/ch1/floor_objects/flesh_g_0.png",Vector2(920,-830),Vector2(780,560),-.5,true)

func _decal(parent: Node2D, path: String, foot: Vector2, size_: Vector2, angle: float, tissue: bool) -> void:
	var sprite := Sprite2D.new()
	sprite.texture = load(path)
	sprite.position = foot
	sprite.scale = size_/sprite.texture.get_size()
	sprite.rotation = angle
	var material_ := ShaderMaterial.new()
	material_.shader = preload("res://scripts/maps/map11/organic_decal.gdshader")
	material_.set_shader_parameter("tissue",tissue)
	sprite.material = material_
	parent.add_child(sprite)
	_decal_count += 1

func _build_rim() -> void:
	_rim = StaticBody2D.new()
	_rim.name = "CombatRim_R1700_NoInteriorPillars"
	add_child(_rim)
	var shape := CollisionPolygon2D.new()
	shape.build_mode = CollisionPolygon2D.BUILD_SEGMENTS
	shape.polygon = _circle_points(Vector2.ZERO,RADIUS,256)
	_rim.add_child(shape)

func _texture(file: String) -> Texture2D:
	if not _tex.has(file): _tex[file] = load(PROP_DIR+file)
	return _tex[file]

func _prop(id: String,file: String,foot: Vector2,height: float,mirror: bool = false) -> void:
	var sprite := Sprite2D.new()
	sprite.name = id
	sprite.texture = _texture(file)
	sprite.centered = false
	var ts := sprite.texture.get_size()
	sprite.offset = Vector2(-ts.x*.5,-ts.y*.94)
	sprite.scale = Vector2.ONE*(height/ts.y)
	sprite.position = foot
	sprite.flip_h = mirror
	sprite.z_index = 80 + int(foot.y/10.0)
	add_child(sprite)
	if foot.length() > RADIUS: _rim_sprites.append({"sprite":sprite,"rect":Rect2(foot+sprite.offset*sprite.scale,ts*sprite.scale).grow(65)})
	map_data.props.append({"id":id,"position":[foot.x,foot.y],"texture":PROP_DIR+file,"draw_size":[ts.x*height/ts.y,height]})
	map_data.prop_colliders.append({"id":id,"kind":"circle","position":[foot.x,foot.y],"radii":[90,45]}) # visual occluder only

func _build_props() -> void:
	# Two staggered layers, varied existing RGBA silhouettes. All feet outside R.
	for i in range(24):
		var a: float = TAU*float(i)/24.0
		var file: String = "rotforest_tree_%02d.png"%([1,2,3,4,5,6,7,11][i%8])
		_prop("OuterTree%02d"%i,file,Vector2.from_angle(a)*(1760+float(i%3)*65),900+float(i%4)*85,i%2==0)
	for i in range(12):
		var a: float = TAU*(float(i)+.35)/12.0
		_prop("LivingCorpse%02d"%i,"prop_corpsetree.png",Vector2.from_angle(a)*1760,850+float(i%3)*65,i%2==1)
		_prop("Cocoon%02d"%i,"prop_cocoon.png",Vector2.from_angle(a+.09)*1760,190+float(i%3)*25)
	_prop("NorthHeartAltar","prop_altar.png",Vector2(0,-1850),330)
	_prop("EntryArch_VisualOnly","bone_arch.png",Vector2(0,1120),360)
	_prop("ClearArch_VisualOnly","bone_arch.png",Vector2(0,-1460),390)

func _build_actors() -> void:
	player = CharacterBody2D.new()
	player.name = "PreviewPlayer_NotProductPlayer"
	add_child(player)
	var hit := CollisionShape2D.new()
	var circle := CircleShape2D.new()
	circle.radius = PLAYER_R
	hit.shape = circle
	player.add_child(hit)
	var sprite := Sprite2D.new()
	sprite.texture = load("res://assets/player/east.png")
	sprite.region_enabled = true
	sprite.region_rect = Rect2(0,0,48,48)
	sprite.offset = Vector2(0,-20)
	sprite.scale = Vector2.ONE*2.5 # existing player.gd visual_scale default
	sprite.z_index = 500
	player.add_child(sprite)
	boss = Sprite2D.new()
	boss.name = "SourceIdleArt_NoBossAI"
	boss.texture = load("res://assets/maps/map11/boss_dark_druid_8dir_v3.png")
	boss.region_enabled = true
	boss.region_rect = Rect2(0,0,414,620)
	boss.offset = Vector2(0,-310)
	boss.scale = Vector2.ONE*(BOSS_HEIGHT/620.0)
	boss.z_index = 350
	add_child(boss)
	_contact_player = _contact_shadow(player,Vector2(0,4),Vector2(54,19),499)
	_contact_boss = _contact_shadow(self,Vector2(0,-22),Vector2(240,66),349)
	camera = Camera2D.new()
	camera.name = "BoardCamera"
	camera.process_callback = Camera2D.CAMERA2D_PROCESS_PHYSICS
	camera.position_smoothing_enabled = false
	add_child(camera)
	camera.make_current()

func _contact_shadow(parent: Node2D, at: Vector2, size_: Vector2, z: int) -> Sprite2D:
	var shadow := Sprite2D.new()
	shadow.name = "ActorContactShadow"
	shadow.texture = MapLook._make_radial_texture(128,[0.0,.28,.65,1.0],[1.0,.85,.30,0.0])
	shadow.modulate = Color(0,0,0,.85)
	shadow.position = at
	shadow.scale = size_/128.0
	shadow.z_index = z
	var mat := CanvasItemMaterial.new()
	mat.light_mode = CanvasItemMaterial.LIGHT_MODE_UNSHADED
	shadow.material = mat
	parent.add_child(shadow)
	return shadow

func _build_look() -> void:
	look = MapLook.new()
	look.name = "ReusedMainMapLook"
	add_child(look)
	look.set("_world",self)
	look.set("_main",self)
	look.set("_player",player)
	var source_profile: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://data/map_look_ch1.json"))
	look.set("_data",{"sway":source_profile.sway,"prop_shadow":source_profile.prop_shadow,"occluder_radius_scale":.7})
	look.set("_light_texture",MapLook._make_radial_texture(256,[0.0,.35,.7,1.0],[1.0,.62,.2,0.0]))
	var ambient := CanvasModulate.new()
	ambient.color = Color(.31,.32,.39)
	look.add_child(ambient)
	look.set("_ambient",ambient)
	look.call("_style_props")
	look.call("_mount_prop_shadows")
	look.call("_mount_occluders")
	var lights: Array = []
	var pl: Dictionary = {"color":[1.0,.76,.58],"radius":350,"energy":1.18,"shadow":true,"flicker":[.025,7.0]}
	var player_light: PointLight2D = look.call("_make_light","PreviewPlayerLight",pl)
	look.set("_player_light",player_light)
	lights.append(look.call("_light_row",player_light,pl))
	for i in range(2):
		var spec: Dictionary = {"color":[.85,.13,.10],"radius":660 if i==0 else 590,"energy":1.0,"pulse":[.08,.18]}
		var light: PointLight2D = look.call("_make_light","FissurePool%02d"%i,spec)
		light.position = Vector2(-790,210) if i==0 else Vector2(810,-160)
		lights.append(look.call("_light_row",light,spec))
	var cold_spec: Dictionary = {"color":[.50,.61,.82],"radius":1000,"energy":.38,"shadow":true}
	var cold: PointLight2D = look.call("_make_light","NorthWestKey",cold_spec)
	cold.position = Vector2(-250,-550)
	lights.append(look.call("_light_row",cold,cold_spec))
	look.set("_lights",lights)
	look.set("active",true) # Existing process handles flicker/pulse; no G/State bound.

func _build_ui() -> void:
	var vignette_layer := CanvasLayer.new()
	vignette_layer.layer = 1
	add_child(vignette_layer)
	var vignette := ColorRect.new()
	vignette.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	vignette.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var vignette_material := ShaderMaterial.new()
	vignette_material.shader = preload("res://scripts/maps/map11/arena_vignette.gdshader")
	vignette.material = vignette_material
	vignette_layer.add_child(vignette)
	var layer := CanvasLayer.new()
	layer.layer = 2
	add_child(layer)
	var panel := ColorRect.new()
	panel.position = Vector2(24,22)
	panel.size = Vector2(700,125)
	panel.color = Color(.045,.035,.047,.93)
	panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	layer.add_child(panel)
	var hairline := ColorRect.new()
	hairline.position = Vector2(24,22)
	hairline.size = Vector2(700,1)
	hairline.color = Color("8d744c")
	layer.add_child(hairline)
	_title = Label.new()
	_title.position = Vector2(44,34)
	_title.add_theme_font_override("font",Fonts.stack("hell_title",700))
	_title.add_theme_color_override("font_color",Color("dfd6c2"))
	_title.add_theme_font_size_override("font_size",24)
	layer.add_child(_title)
	_sub = Label.new()
	_sub.position = Vector2(44,78)
	_sub.add_theme_font_override("font",_font)
	_sub.add_theme_font_size_override("font_size",16)
	_sub.add_theme_color_override("font_color",Color("b8a79b"))
	layer.add_child(_sub)
	_foot = Label.new()
	_foot.position = Vector2(36,1008)
	_foot.add_theme_font_override("font",_font)
	_foot.add_theme_font_size_override("font_size",18)
	_foot.add_theme_color_override("font_color",Color("dfd6c2"))
	layer.add_child(_foot)
	_legend = Label.new()
	_legend.position = Vector2(34,225)
	_legend.add_theme_font_override("font",_font)
	_legend.add_theme_font_size_override("font_size",19)
	_legend.add_theme_color_override("font_color",Color("dfd6c2"))
	layer.add_child(_legend)

func select_board(id: String) -> void:
	board_id = id
	board_serial += 1
	overlay_mode = 0
	boss.visible = true
	boss.position = $Markers/Boss.position
	match id:
		"entry":
			player.position = $Markers/Entry.position
			camera.position = Vector2(0,180)
			camera.zoom = Vector2.ONE*.65
		"close":
			player.position = Vector2(210,360)
			camera.position = Vector2(0,-110)
			camera.zoom = Vector2.ONE*.88
		"wall":
			player.position = Vector2(1570,0)
			camera.position = Vector2(1140,-170)
			camera.zoom = Vector2.ONE*.76
		"clear":
			player.position = Vector2(0,-1250)
			boss.visible = false
			camera.position = Vector2(0,-1390)
			camera.zoom = Vector2.ONE*.68
		"body", "bullets":
			player.position = Vector2(0,900)
			camera.position = Vector2.ZERO
			camera.zoom = Vector2.ONE*.27
			overlay_mode = 1 if id == "body" else 2
	_title.text = "MAP11 / "+id.to_upper()+" / DESIGN BLOCKOUT"
	_sub.text = "R1700 / LIVING FLOOR / LOCAL LIGHT / NO BOSS AI\nBC01–10 OVERLAY / NO COMBAT OR CLEAR WRITER"
	_foot.text = "1 ENTRY   2 CLOSE   3 WALL   4 CLEAR   5 BODY   6 BULLETS   WASD MOVE   |   D05 CIRCULAR / SMALLER"
	if overlay_mode == 1: _foot.text = "SLAM1320 · TIDE1750 · CHARGE1750 · FISSURE2304 + BLAST691.2 > RIM (FLAGGED, NOT SHORTENED)"
	if overlay_mode == 2: _foot.text = "FAN16 REQUEST LANES · RHYTHM9 /66f · ORB3 ±0.14 · SOURCE SPEED/LIFE UNCHANGED / DISPLAY ONLY"
	_contact_boss.visible = boss.visible
	_legend.visible = overlay_mode > 0
	_legend.text = "BC01–10 / SOURCE SPACE\n\nBOSS r44 / PLAYER r15\nSLASH 359 / SWEEP 459\nGRAB 259 / BURROW 164\nJUMP IMPACT 300 / SPIN 500\nSLAM P4 1320 / TIDE 1750\nCHARGE 50 x 35 = 1750\nMULTIDASH P4: 10 segments\nFISSURE 2304 + BLAST 691.2\nOUTSIDE RIM: 1295.2 (FLAG)\n\nNO DAMAGE / NO AI / NO CLEAR" if overlay_mode == 1 else "BC09 / REQUEST GEOMETRY\n\nFAN: 16 requested lanes\nP4 spread = 0.94 PI\nBLACK: i%4 == 1 (P2+)\nRHYTHM: 9 every66 native ticks\nORB: 3 / ±0.14 / r26\n\nLINES ARE DISPLAY AIDS\nNOT LIVE PROJECTILES\nQ/E OWNER UNMODIFIED"
	_overlay.queue_redraw()

func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo: return
	var index: int = int(event.keycode)-KEY_1
	if index >= 0 and index < 6: select_board(BOARD_IDS[index])

func update_product_occlusion(point: Vector2,delta: float) -> void:
	# Cached sprite refs, scalar proximity fade; no enumeration/reflection API.
	for row in _rim_sprites:
		var sprite: Sprite2D = row.sprite
		var alpha: float = .22 if (row.rect.has_point(point) or row.rect.has_point(point-Vector2(0,55))) and sprite.position.y > point.y-100 else 1.0
		sprite.modulate.a = move_toward(sprite.modulate.a,alpha,delta*8.0)

func _physics_process(_delta: float) -> void:
	update_product_occlusion(player.position,_delta)
	tick += 1
	var direction := Vector2(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)),float(Input.is_physical_key_pressed(KEY_S))-float(Input.is_physical_key_pressed(KEY_W)))
	player.velocity = direction.normalized()*280.0
	player.move_and_slide()
	_overlay.queue_redraw()

func is_inside_arena(point: Vector2,radius: float) -> bool:
	return radius >= 0.0 and point.length()+radius <= RADIUS

func draw_overlays(canvas: Node2D) -> void:
	var bone := Color(.80,.75,.65,.75)
	if overlay_mode == 0:
		canvas.draw_arc(player.position,21,0,TAU,32,Color(.87,.84,.76,.55),2.0,true)
		# Dim combat rim/low relief evade annulus; no physical interior obstacles.
		canvas.draw_arc(Vector2.ZERO,RADIUS,0,TAU,160,Color(.5,.39,.42,.45),3.0,true)
		canvas.draw_arc(Vector2.ZERO,1300,0,TAU,128,Color(.55,.48,.49,.15),2.0,true)
		return
	canvas.draw_arc(Vector2.ZERO,RADIUS,0,TAU,160,bone,10.0,true)
	canvas.draw_arc(Vector2.ZERO,1300,0,TAU,128,Color(.5,.65,.65,.45),6.0,true)
	if overlay_mode == 1:
		for radius in BODY_RADII:
			canvas.draw_arc(boss.position,radius,0,TAU,80,Color(.7,.8,.65,.7),5.0,true)
		canvas.draw_arc(boss.position,SLAM_R,0,TAU,128,Color(1.0,.61,.19,.9),9.0,true)
		canvas.draw_arc(boss.position,TIDE_R,0,TAU,128,Color(.45,.77,.97,.8),8.0,true)
		canvas.draw_line(Vector2(-875,600),Vector2(875,600),Color(.7,.8,.9),18.0,true)
		canvas.draw_line(Vector2.ZERO,Vector2(FISSURE_LENGTH,0),Color(1.0,.24,.28),22.0,true)
		canvas.draw_arc(Vector2(FISSURE_LENGTH,0),FISSURE_BLAST,0,TAU,96,Color(1.0,.24,.28,.7),9.0,true)
		canvas.draw_rect(Rect2(-207.14,-BOSS_HEIGHT,414.28,BOSS_HEIGHT),Color(.9,.85,.7),false,9.0)
		canvas.draw_circle(Vector2.ZERO,BOSS_R,Color(.9,.75,.4,.8),false,9.0,true)
	else:
		var spread: float = PI*(.7+4*.06)
		for i in range(16):
			var a: float = PI*.5-spread*.5+spread*float(i)/15.0
			var color := Color(.92,.37,.24,.85) if i%4 != 1 else Color(.48,.4,.63,.95)
			canvas.draw_line(Vector2.ZERO,Vector2.from_angle(a)*2050,color,7.0,true)
			canvas.draw_circle(Vector2.from_angle(a)*1450,24,color,true,-1.0,true)
		for i in range(9):
			var a: float = -PI*.5+(float(i)/8.0-.5)*PI*(.42+4*.03)
			canvas.draw_line(Vector2.ZERO,Vector2.from_angle(a)*1900,Color(.64,.8,.94,.7),5.0,true)
		for a in ORB_ANGLES:
			var end := Vector2.from_angle(float(a))*1660
			canvas.draw_line(Vector2.ZERO,end,Color(.75,.85,.42,.9),8.0,true)
			canvas.draw_circle(end,26,Color(.75,.85,.42,.9),false,7.0,true)

func get_design_receipt() -> Dictionary:
	return {"radius":RADIUS,"interior_pillars":0,"source_boss_radius":BOSS_R,"slam_phase4":SLAM_R,"tide":TIDE_R,"center_slam_margin":RADIUS-SLAM_R,"center_tide_margin":RADIUS-TIDE_R,"fissure_length":FISSURE_LENGTH,"fissure_blast":FISSURE_BLAST,"fissure_length_outside":FISSURE_LENGTH-RADIUS,"fissure_full_envelope_outside":FISSURE_LENGTH+FISSURE_BLAST-RADIUS,"allowed_moves":Catalog.moves_for_stage(0),"look_script":look.get_script().resource_path,"shadow_count":int(look.get("_prop_shadows")),"occluders":(look.get("_occluders") as Array).size(),"lights":(look.get("_lights") as Array).size(),"contact_shadows":int(is_instance_valid(_contact_player))+int(is_instance_valid(_contact_boss)),"floor_decals":_decal_count,"local_light_pools":3,"live_combat":false,"clear_writer":false,"tick_path_list_api":false}
