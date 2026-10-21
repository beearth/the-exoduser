extends "res://scripts/maps/map11/field_seam_preview.gd"
## MAP11-14 product assembly; no preview actor, UI, collision or gameplay writer.
const GroundContact=preload("res://scripts/maps/map11/ground_contact.gd")
const TourTextures=preload("res://scripts/maps/map11/tour_textures.gd")
const Target32=preload("res://scripts/maps/map11/target32_layout.gd")
var target32: Node2D
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
 # Retire only the selected entrance art, preserving all other field regions.
 var keep: Array[Dictionary]=[]
 for row in _rows:
  if Target32.in_region(row.foot):row.node.hide()
  else:keep.append(row)
 _rows=keep
 for row in _decal_rows:
  if Target32.in_region(row.position):row.node.hide();row.node.set_meta("target32_retired",true)
 target32=preload("res://scripts/maps/map11/target32_scene.gd").new();target32.name="Target32FirstRegion";add_child(target32)
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
 # Static baked recess hides the old straight floor edge; no collision or tick work.
 var recess:=Sprite2D.new();recess.name="GateOrganicRecess"
 recess.texture=preload("res://assets/maps/map11/gate_organic_recess.png")
 recess.position=Vector2(0,-4250);recess.scale=Vector2(4800.0/3072.0,900.0/640.0)
 recess.z_index=-2986;add_child(recess)
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
  GroundContact.align(leaf,"res://assets/map/ch1/collision/cage_gate.png#"+str(side))
  leaf.set_meta("closed_x",leaf.position.x);add_child(leaf);GroundContact.depth(leaf,leaf.global_position);gate_leaves.append(leaf)
func _rgba(id: String,file: String,foot: Vector2,height_: float,mirror: bool) -> void:
 var texture_: Texture2D=load(PROP_DIR+file)
 if file=="prop_g_root.png":
  # Low root aprons are floor decals, never vertical props or shadow casters.
  _stamp(texture_,foot,Vector2(height_*texture_.get_width()/texture_.get_height(),height_*.40),0.0,_root_material,mirror,"shoulder")
  return
 var root:=Node2D.new();root.name=id;root.position=foot;add_child(root)
 GroundContact.depth(root,root.global_position)
 var sprite:=Sprite2D.new();sprite.texture=texture_;sprite.scale=Vector2.ONE*(height_/texture_.get_height());sprite.flip_h=mirror
 root.add_child(sprite)
 var bounds: Rect2=GroundContact.align(sprite)
 _rows.append({"node":root,"foot":foot,"rect":Rect2(foot+bounds.position,bounds.size).grow(55)})
func _build_ground() -> void:
 super._build_ground()
 # Inherited preview shoulder AO is intentionally absent on product floor decals.
 for child in _surface.get_children():
  if child is Sprite2D and child.texture==_contact and child.z_index==0:
   _surface.remove_child(child);child.queue_free()
func _add_tree(layer: String,side: String,foot: Vector2,height_: float,tone: Color,idx: int,mirror: bool) -> void:
 super._add_tree(layer,side,foot,height_,tone,idx,mirror)
 var row: Dictionary=_forest_rows.back()
 var sprite: Sprite2D=row.node.get_child(0)
 # Setup-only deterministic silhouette variation; replace rather than add sprites.
 var seed_: int=absi(int(foot.x)*31+int(foot.y)*17+idx*113)
 var serial: int=_forest_rows.size()-1
 sprite.rotation_degrees=[-6.0,3.5,-2.0,7.0,-4.5,1.5,5.0][seed_%7]
 sprite.scale.x*=[.86,1.06,.94,1.15,.90,1.02,1.10][(seed_/7)%7]
 sprite.flip_h=bool(seed_%2)
 sprite.modulate=tone*Color([.87,1.04,.95,1.09,.92][(seed_/11)%5],.96,.98,1.0)
 var key: String=""
 if layer!="BACK" and serial%9 in [2,6]:
  var asset: String="tour_cocoon_tree" if serial%9==2 else "hell_impaled_corpse"
  sprite.texture=TourTextures.ASSETS[asset][seed_%3][0]
  sprite.scale=Vector2.ONE*((510.0 if asset=="tour_cocoon_tree" else 390.0)/sprite.texture.get_height())
  sprite.scale.x*=[.90,1.12,1.0][seed_%3]
  key=sprite.texture.resource_path
  row.variant=asset
  # Existing contact ellipse follows the smaller replacement, no extra draw.
  var shadow: Sprite2D=row.node.get_child(1)
  shadow.scale=Vector2(2.4,.48) if asset=="tour_cocoon_tree" else Vector2(1.15,.24)
 # Re-align the transformed opaque hull once; culling and fade share it.
 var bounds: Rect2=GroundContact.align(sprite,key)
 GroundContact.depth(row.node,row.node.global_position)
 row.rect=Rect2(foot+bounds.position,bounds.size).grow(55)
func update_product(point: Vector2,delta: float) -> void:
 var inverse:=get_global_transform_with_canvas().affine_inverse()
 var view:=Rect2(inverse*Vector2.ZERO,get_viewport_rect().size/get_viewport().get_camera_2d().zoom).grow(200)
 target32.update_view(point,delta)
 for row in _decal_rows:
  if row.node.has_meta("target32_retired"):continue
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
