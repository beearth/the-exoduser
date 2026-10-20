extends "res://scripts/maps/map11/field_preview.gd"
## G2 visual-only assembly. Geometry/compiler and the G1 camera board are inherited.
const MapLook=preload("res://scripts/native_map_look.gd")
const PROP_DIR="res://assets/map/props/"
const VARIANTS=[1,4,2,7,3,11,5,6]
var forest_instances: int=0
var forest_layers: Dictionary={"BACK":0,"MID":0,"FRONT":0}
var forest_sides: Dictionary={"LEFT":0,"RIGHT":0,"TOP":0,"START":0}
var _shadow: Texture2D
var _textures: Array[Texture2D]=[]
var _forest_rows: Array[Dictionary]=[]
func _ready() -> void:
	super._ready()
	if adapter==null: return
	_shadow=MapLook._make_radial_texture(128,[0.0,.35,.7,1.0],[.7,.5,.15,0.0])
	for variant in VARIANTS: _textures.append(load(PROP_DIR+"rotforest_tree_%02d.png"%variant))
	_build_forest("BACK",850,690,1320,Color(.28,.31,.33))
	_build_forest("MID",350,510,1030,Color(.52,.49,.49))
	_build_forest("FRONT",60,620,720,Color(.70,.64,.61))
	select_board("start")
func _build_mass() -> void:
	super._build_mass()
	# Replace only the eight outer gray proxy masses, preserving all inner masses.
	for i in range(8): get_node("OuterMass%02d"%i).hide()
	var keep: Array[Dictionary]=[]
	for row in _rows:
		if not str(row.node.name).begins_with("OuterMass"): keep.append(row)
	_rows=keep
func _build_forest(layer: String, distance_: float, spacing: float, height_: float, tone: Color) -> void:
	var paths: Array[PackedVector2Array]=Geometry2D.offset_polygon(recipe.outer,distance_)
	var serial: int=0
	for path in paths:
		var lengths:=PackedFloat32Array(); var perimeter: float=0
		for i in range(path.size()):
			perimeter+=path[i].distance_to(path[(i+1)%path.size()]); lengths.append(perimeter)
		var count: int=int(ceil(perimeter/spacing)); var edge: int=0
		for i in range(count):
			var along: float=(float(i)+(.13 if layer=="MID" else .57))*perimeter/count
			while edge<lengths.size()-1 and along>lengths[edge]: edge+=1
			var previous: float=0 if edge==0 else lengths[edge-1]
			var fraction: float=(along-previous)/(lengths[edge]-previous)
			var foot: Vector2=path[edge].lerp(path[(edge+1)%path.size()],fraction)
			# Open authored start and gate sight corridors. No physics holes made.
			if absf(foot.x)<800 and (foot.y>3500 or foot.y< -3800): continue
			var side: String="START" if foot.y>2800 else ("TOP" if foot.y< -3000 else ("LEFT" if foot.x<0 else "RIGHT"))
			var variation: float=[.91,1.08,.97,1.17,.86,1.03,1.12][i%7]
			var idx: int=(i*3+(2 if layer=="BACK" else 5 if layer=="MID" else 0))%_textures.size()
			_add_tree(layer,side,foot,height_*variation,tone,idx,(i+idx)%3==0)
			serial+=1
func _add_tree(layer: String,side: String,foot: Vector2,height_: float,tone: Color,idx: int,mirror: bool) -> void:
	var tree:=Node2D.new(); tree.name=layer+"_"+side+"_%03d"%forest_instances
	tree.position=foot; tree.z_index=int(foot.y*.35); add_child(tree)
	var sprite:=Sprite2D.new(); sprite.texture=_textures[idx]; sprite.centered=false
	var size_: Vector2=sprite.texture.get_size()
	sprite.offset=Vector2(-size_.x*.5,-size_.y*.94); sprite.scale=Vector2.ONE*(height_/size_.y)
	sprite.flip_h=mirror; sprite.modulate=tone; tree.add_child(sprite)
	var shadow:=Sprite2D.new(); shadow.texture=_shadow; shadow.position=Vector2(0,15)
	shadow.scale=Vector2(height_*.007,height_*.0014); shadow.modulate=Color(0,0,0,.5); shadow.z_index=-1; tree.add_child(shadow)
	# Conservative image AABB cached once, including transparent margins.
	var rect:=Rect2(foot+sprite.offset*sprite.scale,size_*sprite.scale).grow(55)
	var row: Dictionary={"node":tree,"foot":foot,"rect":rect,"layer":layer,"side":side,"variant":VARIANTS[idx]}
	_rows.append(row); _forest_rows.append(row)
	forest_instances+=1; forest_layers[layer]+=1; forest_sides[side]+=1
func select_board(id: String) -> void:
	super.select_board(id)
	if _sub!=null and id!="occlusion": _sub.text="G2 / BACK · MID · FRONT / 기존 RGBA 외곽 / 형상·충돌 유지"
func receipt() -> Dictionary:
	var result: Dictionary=super.receipt()
	result.forest_instances=forest_instances; result.forest_layers=forest_layers.duplicate(); result.forest_sides=forest_sides.duplicate()
	result.texture_variants=_textures.size(); result.g1_structure="TEMPORARY_PASS"; result.g2_visual="REVIEW_PENDING"
	return result
