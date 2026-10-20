extends Node2D
## Independent gray G1 field blockout; no Main/State/factory or combat writers.
const Recipe = preload("res://scripts/maps/map11/field_recipe.gd")
const Provider = preload("res://scripts/maps/map11/field_provider.gd")
const Adapter = preload("res://scripts/maps/map11/stage_revision_adapter.gd")
const Fonts = preload("res://scripts/native_ui_fonts.gd")
const BOARD_IDS = ["start","early","main","west","east","landmark","late","gate"]
const TITLES = ["기상터","초기 공터","중앙 전투면","마른 심재 고리","습윤 고리","시체나무와 심장 제단","북쪽 그늘","보스문"]
const CAMERAS = [Vector2(0,3350),Vector2(-600,2400),Vector2(0,1200),Vector2(-3150,-650),Vector2(3400,-100),Vector2(-250,-2740),Vector2(900,-3150),Vector2(0,-3750)]
const REGION_COLORS = [Color(.40,.42,.44),Color(.46,.46,.47),Color(.44,.43,.42),Color(.51,.50,.47)]
var recipe: Resource
var provider: RefCounted
var adapter: RefCounted
var player: CharacterBody2D
var camera: Camera2D
var board_id: String = "start"
var tick: int = 0
var _title: Label
var _sub: Label
var _foot: Label
var _font: Font = Fonts.stack("hell",400)
var _rows: Array[Dictionary] = []
var _overview: Node2D
var _route_lines: Node2D
var _offset := Vector2.ZERO
var _context_active: bool = true
var occlusion_hits: int = 0

func _ready() -> void:
	RenderingServer.set_default_clear_color(Color("181a20"))
	recipe = load("res://scripts/maps/map11/field_recipe.tres").duplicate(true)
	provider = Provider.new()
	if not provider.compile(recipe):
		push_error("FIELD NOT_READY: "+str(provider.errors))
		set_physics_process(false)
		return
	adapter = Adapter.new()
	if not adapter.bind_context(provider,self,"map11.field",1,_current):
		push_error("FIELD OWNER NOT_READY")
		set_physics_process(false)
		return
	_build_ground()
	_build_physics()
	_build_mass()
	_build_markers()
	_build_player()
	_build_ui()
	select_board("start")
func _current(id: String, rev: int) -> bool: return _context_active and id == "map11.field" and rev == 1
func _polygon(parent: Node2D, points: PackedVector2Array, color: Color, z: int) -> Polygon2D:
	var shape := Polygon2D.new()
	shape.polygon = points
	shape.color = color
	shape.z_index = z
	parent.add_child(shape)
	return shape
func _ellipse(center: Vector2, size_: Vector2) -> PackedVector2Array:
	var points := PackedVector2Array()
	for i in range(64): points.append(center+Vector2(cos(TAU*i/64.0)*size_.x,sin(TAU*i/64.0)*size_.y))
	return points
func _build_ground() -> void:
	for polygon in Geometry2D.offset_polygon(recipe.outer,850): _polygon(self,polygon,Color("282b31"),-3500)
	for polygon in Geometry2D.offset_polygon(recipe.outer,360): _polygon(self,polygon,Color("383b40"),-3400)
	for row in recipe.regions:
		_polygon(self,row.polygon,REGION_COLORS[row.id],-3000)
		var border := Line2D.new()
		border.points = row.polygon
		border.closed = true
		border.width = 5
		border.default_color = Color(.8,.8,.77,.18)
		border.z_index = -2900
		add_child(border)
	_polygon(self,_ellipse(Vector2(0,1300),Vector2(1600,1600)),Color(.65,.65,.61,.055),-2800)
	# Purely visual low wet pool; not a hazard or collision object.
	_polygon(self,_ellipse(Vector2(3400,750),Vector2(480,240)),Color(.29,.33,.32),-2750)
func _build_physics() -> void:
	var rim := StaticBody2D.new()
	rim.name = "CompiledOuterRim"
	add_child(rim)
	var outline := CollisionPolygon2D.new()
	outline.build_mode = CollisionPolygon2D.BUILD_SEGMENTS
	outline.polygon = recipe.outer
	rim.add_child(outline)
	for row in recipe.solids:
		if not row.blocks_move: continue
		var body := StaticBody2D.new()
		body.name = row.id.get_file()
		body.position = row.center
		add_child(body)
		var hit := CollisionShape2D.new()
		var shape := CircleShape2D.new()
		shape.radius = row.radius
		hit.shape = shape
		body.add_child(hit)
func _mass(name_: String, foot: Vector2, size_: Vector2, tone: Color, fork: bool) -> void:
	var root := Node2D.new()
	root.name = name_
	root.position = foot
	root.z_index = int(foot.y*.35)
	add_child(root)
	_polygon(root,_ellipse(Vector2(50,30),Vector2(size_.x*.55,size_.x*.12)),Color(0,0,0,.28),-1)
	var w: float = size_.x
	var h: float = size_.y
	var points := PackedVector2Array([Vector2(-w*.5,0),Vector2(-w*.45,-h*.45),Vector2(-w*.32,-h*.9),Vector2(-w*.13,-h*.65),Vector2(w*.03,-h),Vector2(w*.16,-h*.73),Vector2(w*.39,-h*.92),Vector2(w*.5,-h*.35),Vector2(w*.43,0)]) if fork else PackedVector2Array([Vector2(-w*.5,0),Vector2(-w*.4,-h*.75),Vector2(-w*.15,-h),Vector2(w*.32,-h*.8),Vector2(w*.5,-h*.35),Vector2(w*.45,0)])
	_polygon(root,points,tone,0)
	_polygon(root,PackedVector2Array([Vector2(w*.04,-h*.77),Vector2(w*.3,-h*.63),Vector2(w*.4,-h*.2),Vector2(w*.1,0)]),tone.darkened(.25),1)
	_rows.append({"node":root,"foot":foot,"rect":Rect2(foot-Vector2(w*.5,h),size_).grow(65)})
func _build_mass() -> void:
	var indices = [0,2,5,8,11,14,17,20]
	for i in range(indices.size()):
		var point: Vector2 = recipe.outer[indices[i]]
		_mass("OuterMass%02d"%i,point+point.normalized()*260,Vector2(1050+(i%3)*270,700+(i%4)*180),Color(.19+i%3*.025,.20+i%3*.025,.22+i%3*.025),i%2==0)
	_mass("DryHeartwood",Vector2(-1800,-550),Vector2(1320,1150),Color("45474a"),true)
	_mass("LowWetRootMass",Vector2(2100,100),Vector2(1500,280),Color("424949"),false)
	_mass("EarlyFallenLog_VisualOnly",Vector2(-1550,2450),Vector2(1500,220),Color("434243"),false)
	_mass("D01SplitCorpseTree",Vector2(-250,-2700),Vector2(850,850),Color("555354"),true)
	_mass("D01LowHeartAltar",Vector2(-250,-2320),Vector2(520,120),Color("73716c"),false)
	_polygon(self,_ellipse(Vector2(-250,-2380),Vector2(70,45)),Color("77736e"),int(-2320*.35)+2)
	# Broad framed passage; no fake open/close gate writer.
	_mass("GateLeft",Vector2(-750,-3830),Vector2(500,650),Color("505257"),false)
	_mass("GateRight",Vector2(750,-3830),Vector2(500,650),Color("505257"),false)
	_polygon(self,PackedVector2Array([Vector2(-1000,-4430),Vector2(1000,-4430),Vector2(1000,-4310),Vector2(-1000,-4310)]),Color("505257"),int(-3830*.35)+2)
func _build_markers() -> void:
	var markers := Node2D.new()
	markers.name = "Markers"
	add_child(markers)
	_route_lines = Node2D.new()
	_route_lines.name = "AuthoredRouteOverlay"
	_route_lines.z_index = 3000
	add_child(_route_lines)
	for row in recipe.anchors:
		var marker := Marker2D.new()
		marker.name = row.marker
		marker.position = row.position
		markers.add_child(marker)
		var dot := Polygon2D.new()
		dot.polygon = _ellipse(row.position,Vector2(50,50))
		dot.color = Color("c4b38f")
		_route_lines.add_child(dot)
	for route in recipe.routes:
		var line := Line2D.new()
		var from: Vector2
		var to: Vector2
		for row in recipe.anchors:
			if row.id == route.from: from = row.position
			if row.id == route.to: to = row.position
		line.points = PackedVector2Array([from,to])
		line.width = 14
		line.default_color = Color(.8,.7,.5,.7)
		_route_lines.add_child(line)
func _build_player() -> void:
	player = CharacterBody2D.new()
	player.name = "IndependentBasicWalker"
	add_child(player)
	var hit := CollisionShape2D.new()
	var shape := CircleShape2D.new()
	shape.radius = 15
	hit.shape = shape
	player.add_child(hit)
	_polygon(player,_ellipse(Vector2(0,4),Vector2(27,9)),Color(0,0,0,.65),-1)
	var sprite := Sprite2D.new()
	sprite.texture = load("res://assets/player/east.png")
	sprite.region_enabled = true
	sprite.region_rect = Rect2(0,0,48,48)
	sprite.offset = Vector2(0,-20)
	sprite.scale = Vector2.ONE*2.5
	player.add_child(sprite)
	camera = Camera2D.new()
	camera.process_callback = Camera2D.CAMERA2D_PROCESS_PHYSICS
	add_child(camera)
	camera.make_current()
func _build_ui() -> void:
	var layer := CanvasLayer.new()
	add_child(layer)
	var panel := ColorRect.new()
	panel.position = Vector2(24,22)
	panel.size = Vector2(760,132)
	panel.color = Color(.04,.035,.045,.94)
	layer.add_child(panel)
	var hairline := ColorRect.new()
	hairline.position = Vector2(24,22)
	hairline.size = Vector2(760,1)
	hairline.color = Color("8d744c")
	layer.add_child(hairline)
	_title = _label(layer,Vector2(44,34),24,true)
	_sub = _label(layer,Vector2(44,82),17,false)
	_foot = _label(layer,Vector2(36,1010),18,false)
	_foot.text = "WASD 이동 / 1–8 카메라 / 9 전체 윤곽 / 제품 연결 없음"
func _label(parent: Node, at: Vector2, size_: int, title: bool) -> Label:
	var label := Label.new()
	label.position = at
	label.add_theme_font_override("font",Fonts.stack("hell_title",700) if title else _font)
	label.add_theme_font_size_override("font_size",size_)
	label.add_theme_color_override("font_color",Color("dfd6c2"))
	parent.add_child(label)
	return label
func select_board(id: String) -> void:
	board_id = id
	_route_lines.visible = id == "overview"
	if id == "occlusion":
		player.position = Vector2(-250,-3000)
		camera.position = Vector2(-250,-2900)
		camera.zoom = Vector2.ONE*.75
		_title.text = "MAP11 / 가림 페이드 검수"
		_sub.text = "밑동 y정렬 / 앞 수목 alpha 0.15 / 실제 충돌 유지"
		return
	if id == "overview":
		player.position = $Markers/Start.position
		camera.position = Vector2(0,-75)
		camera.zoom = Vector2.ONE*.105
		_title.text = "MAP11 / FIELD MASTER"
		_sub.text = "회색 MASS / 4지역 / 두 갈래 순환 / 제품 연결 없음"
		return
	var index: int = BOARD_IDS.find(id)
	if index < 0: return
	player.position = get_node("Markers/"+recipe.anchors[_anchor_index(id)].marker).position
	camera.position = CAMERAS[index]
	_offset = camera.position-player.position
	camera.zoom = Vector2.ONE*(.66 if id == "landmark" else Recipe.AUTHOR_ZOOM)
	_title.text = "MAP11 / "+TITLES[index]
	_sub.text = "회색 MASS / 지역 %d / 기본 이동 156 / 충돌·LOS 동일 recipe"%provider.region_at(player.position)
func _anchor_index(id: String) -> int:
	for i in range(recipe.anchors.size()):
		if recipe.anchors[i].id == "map11.field."+id: return i
	return -1
func _unhandled_key_input(event: InputEvent) -> void:
	if not event is InputEventKey or not event.pressed or event.echo: return
	var index: int = int(event.keycode)-KEY_1
	if index >= 0 and index < 8: select_board(BOARD_IDS[index])
	elif event.keycode == KEY_9: select_board("overview")
func update_occlusion(delta: float) -> void:
	player.z_index = int(player.position.y*.35)+1
	for row in _rows:
		var foreground: bool = row.foot.y >= player.position.y and (row.rect.has_point(player.position) or row.rect.has_point(player.position-Vector2(0,55)))
		var target: float = .15 if foreground else 1.0
		row.node.modulate.a = move_toward(row.node.modulate.a,target,delta*10)
		if foreground: occlusion_hits += 1
func _physics_process(delta: float) -> void:
	tick += 1
	var direction := Vector2(float(Input.is_physical_key_pressed(KEY_D))-float(Input.is_physical_key_pressed(KEY_A)),float(Input.is_physical_key_pressed(KEY_S))-float(Input.is_physical_key_pressed(KEY_W)))
	player.velocity = direction.normalized()*Recipe.BASIC_SPEED
	player.move_and_slide()
	if direction != Vector2.ZERO and board_id != "overview": camera.position = player.position+_offset
	update_occlusion(delta)
func receipt() -> Dictionary:
	return {"content":provider.describe(),"runtime_ready":adapter.runtime_ready(),"markers":recipe.anchors.size(),"routes":recipe.routes.size(),"cycles":recipe.routes.size()-recipe.anchors.size()+1,"basic_speed":Recipe.BASIC_SPEED,"reference_zoom":Recipe.AUTHOR_ZOOM,"occlusion_cached_proxies":_rows.size(),"occlusion_hits":occlusion_hits,"main_connected":false,"art_generation":false,"tick_list_api":false}
