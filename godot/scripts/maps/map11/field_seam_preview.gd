extends "res://scripts/maps/map11/field_outer_preview.gd"
## G3/G4 visual-only world-continuous surface + existing RGBA shoulders/decals.
const GROUND_PATH="res://assets/map/ch1/ground_dark_soil.png"
const CRACK_PATH="res://assets/map/ch3/floor_objects/prop_ice_gcrack.png"
const ROOT_PATHS=["res://assets/map/ch1/floor_objects/prop_g_edge.png","res://assets/map/props/prop_g_root.png"]
var _surface: Polygon2D
var _ground: Texture2D
var _root_material: ShaderMaterial
var _crack_material: ShaderMaterial
var _contact: Texture2D
var shoulder_count: int=0
var fissure_count: int=0
var _decal_rows: Array[Dictionary]=[]
func _build_ground() -> void:
	for polygon in Geometry2D.offset_polygon(recipe.outer,850): _polygon(self,polygon,Color("211c1b"),-3500)
	for polygon in Geometry2D.offset_polygon(recipe.outer,360): _polygon(self,polygon,Color("302724"),-3400)
	_ground=load(GROUND_PATH)
	_surface=_polygon(self,recipe.outer,Color.WHITE,-3000)
	_surface.name="ContinuousSkinSurface"
	_surface.clip_children=CanvasItem.CLIP_CHILDREN_AND_DRAW
	var material_=ShaderMaterial.new(); material_.shader=load("res://scripts/maps/map11/field_surface.gdshader"); material_.set_shader_parameter("ground",_ground); _surface.material=material_
	_root_material=ShaderMaterial.new(); _root_material.shader=load("res://scripts/maps/map11/field_decal.gdshader")
	_crack_material=ShaderMaterial.new(); _crack_material.shader=_root_material.shader; _crack_material.set_shader_parameter("fissure",true)
	_contact=MapLook._make_radial_texture(128,[0.0,.35,.7,1.0],[.65,.4,.12,0.0])
	var textures: Array[Texture2D]=[]
	for path in ROOT_PATHS: textures.append(load(path))
	var serial: int=0
	for edge in range(recipe.outer.size()):
		var a: Vector2=recipe.outer[edge]; var b: Vector2=recipe.outer[(edge+1)%recipe.outer.size()]
		var count: int=maxi(1,int(ceil(a.distance_to(b)/620)))
		for i in range(count):
			var foot: Vector2=a.lerp(b,(i+.35)/count)
			if absf(foot.x)<750 and (foot.y>3500 or foot.y< -3800): continue
			var angle: float=(b-a).angle()
			var point: Vector2=foot+foot.direction_to(Vector2.ZERO)*80
			var size_: Vector2=Vector2(730+(serial%4)*100,290+(serial%3)*80)
			_stamp(textures[serial%2],point,size_,angle,_root_material,serial%3==0,"shoulder")
			var shadow:=Sprite2D.new(); shadow.texture=_contact; shadow.position=point+Vector2(0,35)
			shadow.scale=Vector2(size_.x/128.0,size_.y*.8/128.0); shadow.modulate=Color(0,0,0,.42); shadow.z_index=0; _surface.add_child(shadow)
			shoulder_count+=1; serial+=1
	# Disconnected asymmetrical texture fragments, not a Line2D/cable curve.
	var sites=[Vector2(-950,1700),Vector2(1050,1900),Vector2(-650,2850),Vector2(-3100,-1000),Vector2(3450,650),Vector2(1750,-1950),Vector2(400,-1300),Vector2(-1000,-2050),Vector2(850,-3200),Vector2(0,-3700)]
	for i in range(sites.size()):
		for part in range(3):
			var size_: Vector2=Vector2(240+(i%4)*80,170+((i+part)%4)*65)
			_stamp(load(CRACK_PATH),sites[i]+Vector2(part*145-100,((i+part)%3-1)*125),size_,i*.79+part*1.1,_crack_material,part==1,"fissure")
			fissure_count+=1
func _stamp(texture_: Texture2D,at: Vector2,size_: Vector2,angle: float,material_: ShaderMaterial,mirror: bool,kind: String) -> void:
	var sprite:=Sprite2D.new(); sprite.texture=texture_; sprite.position=at; sprite.scale=size_/texture_.get_size(); sprite.rotation=angle; sprite.flip_h=mirror; sprite.material=material_; sprite.z_index=1 if kind=="shoulder" else 2; _surface.add_child(sprite)
	_decal_rows.append({"node":sprite,"kind":kind,"position":at,"size":size_,"angle":angle})
func select_board(id: String) -> void:
	super.select_board(id)
	if _sub!=null and id!="occlusion": _sub.text="G3/G4 / 수피·피부 접합 / 불규칙 decal / 형상·전투 유지"
func receipt() -> Dictionary:
	var result: Dictionary=super.receipt()
	result.shoulders=shoulder_count; result.fissure_fragments=fissure_count; result.surface_uv="continuous_world_3_rotations_3_scales"; result.new_images=0
	result.g2_ring="PASS"; result.forest_depth="BACK fog .48 / MID .13 / FRONT 0"
	result.forest_variation="height7 width5 brightness6 rotation6 mirror"; result.regional_reflection="LEFT dry heartwood / RIGHT muted yellow-green lower UV"
	result.g3_g4_visual="REVIEW_PENDING"; return result

func _build_mass() -> void:
	super._build_mass()
	for row in _rows:
		# Preserve approved silhouette/foot; only replace its hard ground shadow.
		row.node.get_child(0).hide()
		var shadow:=Sprite2D.new(); shadow.texture=_contact; shadow.position=Vector2(25,22)
		shadow.scale=Vector2(row.rect.size.x/128.0,row.rect.size.x*.20/128.0); shadow.modulate=Color(0,0,0,.58); shadow.z_index=-1; row.node.add_child(shadow)
		_stamp(load(ROOT_PATHS[0]),row.foot+Vector2(0,25),Vector2(row.rect.size.x*.9,320),.13,_root_material,false,"shoulder")
		shoulder_count+=1
func _build_player() -> void:
	super._build_player()
	player.get_child(1).hide()
	var shadow:=Sprite2D.new(); shadow.texture=_contact; shadow.position=Vector2(0,4); shadow.scale=Vector2(.6,.16); shadow.modulate=Color(0,0,0,.8); shadow.z_index=-1; player.add_child(shadow)

# G2 follow-up: setup-only transforms/materials; feet, z order and geometry stay fixed.
func _add_tree(layer: String,side: String,foot: Vector2,height_: float,tone: Color,idx: int,mirror: bool) -> void:
	var serial: int=forest_instances
	var height_factor: float=[.72,1.24,.90,1.13,.81,1.30,1.02][serial%7]
	var width_factor: float=[.80,1.18,.94,1.10,.87][serial%5]
	var brightness: float=[.78,1.16,.93,1.07,.86,1.22][serial%6]
	super._add_tree(layer,side,foot,height_*height_factor,tone*Color(brightness,brightness,brightness,1),idx,mirror != (serial%4==0))
	var row: Dictionary=_forest_rows.back()
	var sprite: Sprite2D=row.node.get_child(0)
	sprite.scale.x*=width_factor
	sprite.rotation=[-.085,.045,-.025,.10,-.055,.02][serial%6]
	var material_:=ShaderMaterial.new()
	material_.shader=load("res://scripts/maps/map11/field_forest_depth.gdshader")
	material_.set_shader_parameter("fog",.48 if layer=="BACK" else (.13 if layer=="MID" else .0))
	material_.set_shader_parameter("west",1.0 if side=="LEFT" else .0)
	material_.set_shader_parameter("east",1.0 if side=="RIGHT" else .0)
	sprite.material=material_
	# Cache rotated/anisotropic sprite AABB once; preserve inherited fade at runtime.
	var size_: Vector2=sprite.texture.get_size()
	var bounds:=Rect2(sprite.transform*sprite.offset,Vector2.ZERO)
	for corner in [Vector2(size_.x,0),size_,Vector2(0,size_.y)]:
		bounds=bounds.expand(sprite.transform*(sprite.offset+corner))
	row.rect=Rect2(bounds.position+foot,bounds.size).grow(55)
	row.height_factor=height_factor; row.width_factor=width_factor
	row.brightness=brightness; row.fog=.48 if layer=="BACK" else (.13 if layer=="MID" else .0)
