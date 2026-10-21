extends RefCounted
## MAP11-22 authored exterior tableau. Setup-only PNG/normal resources and foot circles.
const Textures=preload("res://scripts/maps/map11/tour_textures.gd")
const PILLARS=[
 [preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_0_diffuse.png"),preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_0_normal.png")],
 [preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_1_diffuse.png"),preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_1_normal.png")],
 [preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_2_diffuse.png"),preload("res://assets/maps/map11/finale_pillar/tour_chained_pillar_2_normal.png")]
]
const Contact=preload("res://scripts/maps/map11/ground_contact.gd")
# asset, view, local foot, image height, foot collision radius
const ROWS=[
 ["tour_blood_basin",1,Vector2(-130,-1820),400.0,90.0],
 ["tour_torture_wheel",0,Vector2(180,-1910),640.0,85.0],
 ["tour_chained_pillar",1,Vector2(-490,-1810),540.0,60.0],
 ["tour_chained_pillar",2,Vector2(590,-1740),475.0,55.0],
 ["skull_pyramid",0,Vector2(-1490,-1060),520.0,95.0],
 ["skull_pyramid",2,Vector2(-1770,-600),390.0,80.0],
 ["hell_impaled_corpse",1,Vector2(-1650,-920),480.0,32.0],
 ["tour_chained_pillar",0,Vector2(-1880,50),560.0,60.0],
 ["hell_impaled_corpse",2,Vector2(-1770,480),430.0,32.0],
 ["hell_spike_pit",0,Vector2(-1540,1080),310.0,130.0],
 ["hell_impaled_corpse",0,Vector2(-1050,1500),370.0,30.0],
 ["skull_pyramid",1,Vector2(850,1630),300.0,70.0],
 ["hell_impaled_corpse",0,Vector2(1490,1110),510.0,32.0],
 ["hell_impaled_corpse",2,Vector2(1650,790),450.0,32.0],
 ["tour_chained_pillar",2,Vector2(1840,360),600.0,65.0],
 ["hell_spike_pit",1,Vector2(1910,-220),350.0,145.0],
 ["hell_impaled_corpse",1,Vector2(1810,-590),490.0,32.0],
 ["tour_torture_wheel",2,Vector2(1500,-1110),440.0,70.0],
 ["skull_pyramid",1,Vector2(1110,-1490),350.0,75.0]]
static func mount(scene: Node2D) -> void:
 var arena: Node2D=scene.arena_view
 var surface:=ShaderMaterial.new();surface.shader=preload("res://scripts/maps/map11/finale_surface.gdshader")
 var feet:=StaticBody2D.new();feet.name="FinaleExteriorFootCircles";arena.add_child(feet)
 for i in range(ROWS.size()):
  var row: Array=ROWS[i]
  var foot: Vector2=row[2]
  assert(foot.length()-row[4]>1700.0)
  var pair: Array=PILLARS[row[1]] if row[0]=="tour_chained_pillar" else Textures.ASSETS[row[0]][row[1]]
  var canvas:=CanvasTexture.new();canvas.diffuse_texture=pair[0];canvas.normal_texture=pair[1]
  canvas.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  canvas.specular_color=Color(.10,.08,.06);canvas.specular_shininess=.12
  var sprite:=Sprite2D.new();sprite.name="Finale%02d"%i;sprite.texture=canvas;sprite.position=foot;sprite.material=surface
  sprite.scale=Vector2.ONE*row[3]/canvas.get_height()
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR_WITH_MIPMAPS
  arena.add_child(sprite)
  var bounds: Rect2=Contact.align(sprite,pair[0].resource_path)
  Contact.depth(sprite,sprite.global_position)
  Contact.shadow(arena,sprite,foot,-440,.35,scene.lighting_look._unlit)
  arena._rim_sprites.append({"sprite":sprite,"rect":Rect2(foot+bounds.position,bounds.size).grow(65)})
  var collision:=CollisionShape2D.new();var circle:=CircleShape2D.new();circle.radius=row[4]
  collision.shape=circle;collision.position=foot;feet.add_child(collision)
 # Northern pair is admitted within the existing shared four-light cap at the northern view.
 scene.lighting_look._pool("FinaleBasin",arena.global_position+Vector2(-280,-1900),"arena",870,Color(1.0,.31,.17),1.15,.018)
 scene.lighting_look._pool("FinaleWheel",arena.global_position+Vector2(350,-2020),"arena",790,Color(1.0,.47,.25),1.05,.02)
 scene.lighting_look._pool("FinaleSkulls",arena.global_position+Vector2(-1640,-1040),"arena",760,Color(.95,.31,.19),.94,.025)
 scene.lighting_look._pool("FinaleEast",arena.global_position+Vector2(1750,160),"arena",750,Color(1.0,.26,.13),.85,.02)
