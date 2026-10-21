extends RefCounted
## MAP11-30 look lock. Target-derived art is identity; curve only grades legacy art.
const LIGHT_SCREEN=Vector2(-0.45,-0.89) # upper-left diffuse key, baked source
const FLESH=Color("694044")
const VEIN=Color("351b26")
const GLOW=Color("985caa")
const FOG=Color("69636b")
const FOG_ALPHA=Vector2(.12,.26)
const FOG_RADII=Vector2(1450,2100)
const LEGACY_CURVE=preload("res://assets/maps/map11/target30/legacy_to_target_curve.png")
const SOURCE_CURVE_IDENTITY=true
const SOURCE_SCALE=2.6666666667
const PROJECTION_Y=.6
const FLOOR_EXTENT=4096.0*SOURCE_SCALE
const SCREEN_CENTER=Vector2(0,120)
const SOURCE_ELLIPSE=Vector4(1000,550,820,350)
const BORDER_RADIUS=1755.0
const VEIN_STRENGTH=.065
const POD_SCALE=.012
const POD_GLOW=.055
const PULSE_HZ=.16
const PARALLAX=.08
const SPLIT=preload("res://assets/maps/map11/target30/split.json")
const FLOOR=preload("res://assets/maps/map11/target30/floor.png")
const VEINS=preload("res://assets/maps/map11/target30/veins.png")
const FOREGROUND=preload("res://assets/maps/map11/target30/foreground.png")
const FOG_TEXTURE=preload("res://assets/maps/map11/target30/fog.png")
const TEXTURES=[
 [preload("res://assets/maps/map11/target30/west_mouth.png")],
 [preload("res://assets/maps/map11/target30/north_west.png")],
 [preload("res://assets/maps/map11/target30/north_heart.png")],
 [preload("res://assets/maps/map11/target30/north_east.png")],
 [preload("res://assets/maps/map11/target30/east_mouth.png")],
 [preload("res://assets/maps/map11/target30/south_west.png")],
 [preload("res://assets/maps/map11/target30/south_east.png")]]
