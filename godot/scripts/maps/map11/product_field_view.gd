extends "res://scripts/maps/map11/field_seam_preview.gd"
## MAP11-14 product assembly; no preview actor, UI, collision or gameplay writer.
var gate_leaves: Array[Node2D]=[]
var gate_open: float=0.0
func _ready() -> void:
 recipe=load("res://scripts/maps/map11/field_recipe.tres")
 _build_ground()
 # Static five-tap soil filter baked once; world-space three-scale blend is unchanged.
 _surface.material.shader=preload("res://scripts/maps/map11/product_surface.gdshader")
 _surface.material.set_shader_parameter("ground",load("res://assets/maps/map11/field_ground_filtered.png"))
 _build_mass()
 _shadow=MapLook._make_radial_texture(128,[0.0,.35,.7,1.0],[.7,.5,.15,0.0])
 for variant in VARIANTS: _textures.append(load(PROP_DIR+"rotforest_tree_%02d.png"%variant))
 _build_forest("BACK",850,690,1320,Color(.28,.31,.33))
 _build_forest("MID",350,510,1030,Color(.52,.49,.49))
 _build_forest("FRONT",60,620,720,Color(.70,.64,.61))
 set_process(false);set_physics_process(false)
 set_process_input(false);set_process_unhandled_input(false);set_process_unhandled_key_input(false)
func _build_mass() -> void:
 # Authored solids/anchors remain exclusively in the provider.
 _rgba("DryHeartwood","rotforest_tree_04.png",Vector2(-1800,-550),1150,false)
 _rgba("LowWetRootMass","prop_g_root.png",Vector2(2100,100),280,false)
 _rgba("EarlyFallenLog","prop_g_root.png",Vector2(-1550,2450),220,true)
 _rgba("D01SplitCorpseTree","prop_corpsetree.png",Vector2(-250,-2700),650,false)
 _rgba("D01SplitCrown","rotforest_tree_07.png",Vector2(-410,-2790),590,true)
 _rgba("D01LowHeartAltar","prop_altar.png",Vector2(-250,-2320),220,false)
 _rgba("D01ExposedTissue","prop_cocoon.png",Vector2(-260,-2370),110,false)
 _stamp(load(ROOT_PATHS[0]),Vector2(-250,-2650),Vector2(1150,380),.10,_root_material,false,"shoulder")
 # Existing skull/black-iron gate is split into two texture regions at setup.
 # No generated art, opaque bar proxies, collision or lock writer.
 for i in range(3):
  _rgba("GateRecess%02d"%i,"rotforest_tree_%02d.png"%[4,7,2][i],Vector2(-600+i*620,-4210-(i%2)*90),650+i*45,i==1)
 _rgba("GateRootApron","prop_g_root.png",Vector2(0,-4070),280,false)
 _rgba("GateBoneFrame","bone_arch.png",Vector2(0,-3830),650,false)
 var gate_texture: Texture2D=load("res://assets/map/ch1/collision/cage_gate.png")
 # Crop the existing iron infill, leaving stone/bone columns on the fixed frame.
 var infill:=Rect2(60,75,110,193)
 for side in range(2):
  var leaf:=Sprite2D.new();leaf.texture=gate_texture;leaf.region_enabled=true
  leaf.region_rect=Rect2(infill.position+Vector2(side*55,0),Vector2(55,193));leaf.centered=false
  leaf.offset=Vector2(-27.5,-193);leaf.scale=Vector2.ONE*(405.0/193.0)
  leaf.position=Vector2((-1 if side==0 else 1)*27.5*leaf.scale.x,-3890)
  leaf.set_meta("closed_x",leaf.position.x);leaf.z_index=int(-3830*.35)+2;add_child(leaf);gate_leaves.append(leaf)
func _rgba(id: String,file: String,foot: Vector2,height_: float,mirror: bool) -> void:
 var root:=Node2D.new();root.name=id;root.position=foot;root.z_index=int(foot.y*.35);add_child(root)
 var sprite:=Sprite2D.new();sprite.texture=load(PROP_DIR+file);sprite.centered=false
 var size_: Vector2=sprite.texture.get_size();sprite.offset=Vector2(-size_.x*.5,-size_.y*.94);sprite.scale=Vector2.ONE*(height_/size_.y);sprite.flip_h=mirror;root.add_child(sprite)
 var shadow:=Sprite2D.new();shadow.texture=_contact;shadow.position=Vector2(20,12);shadow.scale=Vector2(height_*.006,height_*.0012);shadow.modulate=Color(0,0,0,.6);shadow.z_index=-1;root.add_child(shadow)
 _rows.append({"node":root,"foot":foot,"rect":Rect2(foot+sprite.offset*sprite.scale,size_*sprite.scale).grow(55)})
func update_product(point: Vector2,delta: float) -> void:
 var inverse:=get_global_transform_with_canvas().affine_inverse()
 var view:=Rect2(inverse*Vector2.ZERO,get_viewport_rect().size/get_viewport().get_camera_2d().zoom).grow(200)
 for row in _decal_rows:
  var extent: float=(row.size as Vector2).length()*.5
  row.node.visible=view.intersects(Rect2(row.position-Vector2.ONE*extent,Vector2.ONE*extent*2.0))
 for row in _rows:
  row.node.visible=view.intersects(row.rect.grow(200))
  if not row.node.visible:continue
  var foreground: bool=row.foot.y>=point.y and (row.rect.has_point(point) or row.rect.has_point(point-Vector2(0,55)))
  row.node.modulate.a=move_toward(row.node.modulate.a,.15 if foreground else 1.0,delta*10)
 # Proximity is presentation only; never changes the authoritative gate lock.
 gate_open=move_toward(gate_open,1.0 if point.distance_to(Vector2(0,-3750))<900 else 0.0,delta*2.5)
 for i in range(gate_leaves.size()):
  gate_leaves[i].modulate.a=1.0-gate_open
  gate_leaves[i].position.x=float(gate_leaves[i].get_meta("closed_x"))+(-1 if i==0 else 1)*gate_open*380
