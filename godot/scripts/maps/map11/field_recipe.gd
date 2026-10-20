extends "res://scripts/maps/map11/stage_recipe.gd"
## New hand-authored world geometry. Not web-map coordinates or tile occupancy.
const AUTHOR_ZOOM = .75
const BASIC_SPEED = 156.0 # player.gd default _movement_speed; no product writer.
@export var outer := PackedVector2Array([Vector2(-700,4050),Vector2(850,3950),Vector2(1600,3300),Vector2(2450,2000),Vector2(3750,2850),Vector2(4700,1800),Vector2(3850,600),Vector2(4800,-900),Vector2(4000,-1750),Vector2(3200,-1900),Vector2(2850,-2900),Vector2(2000,-3300),Vector2(1450,-4100),Vector2(-1000,-4200),Vector2(-1250,-2800),Vector2(-3600,-2900),Vector2(-4100,-1600),Vector2(-4200,-400),Vector2(-4250,1100),Vector2(-3400,2250),Vector2(-1800,2200),Vector2(-1550,3300)])
func _init() -> void:
	map_instance_id = "map11.field"
	revision = 1
	radius = 0
	effect_extent = Vector3i.ZERO # Field must not impersonate the arena effect metric.
	anchors.clear()
	regions.clear()
	solids.clear()
	routes.clear()
	add_anchor("start","Start","player_start",Vector2(0,3700))
	add_anchor("early","Early","path_waypoint",Vector2(-500,2550))
	add_anchor("main","MainArena","combat_center",Vector2(0,1300))
	add_anchor("west_lower","WestLower","path_waypoint",Vector2(-2600,1350))
	add_anchor("west","West","path_waypoint",Vector2(-3500,-450))
	add_anchor("west_upper","WestUpper","path_waypoint",Vector2(-2450,-2000))
	add_anchor("east_lower","EastLower","path_waypoint",Vector2(3000,1700))
	add_anchor("east","East","path_waypoint",Vector2(3800,-100))
	add_anchor("east_upper","EastUpper","path_waypoint",Vector2(2500,-1900))
	add_anchor("landmark","Landmark","landmark",Vector2(-250,-2100))
	add_anchor("landmark_east","LandmarkEast","path_waypoint",Vector2(500,-2150))
	add_anchor("late","Late","path_waypoint",Vector2(1000,-3100))
	add_anchor("gate","Gate","gate",Vector2(0,-3750))
	add_anchor("return","Return","gate_return",Vector2(500,-3500))
	for pair in [["start","early"],["early","main"],["main","west_lower"],["west_lower","west"],["west","west_upper"],["west_upper","landmark"],["main","east_lower"],["east_lower","east"],["east","east_upper"],["east_upper","landmark"],["main","landmark"],["landmark","landmark_east"],["landmark_east","late"],["late","gate"],["late","return"]]:
		routes.append({"from":"map11.field."+pair[0],"to":"map11.field."+pair[1],"clearance":96.0})
	solids.append({"id":"map11.field.dry_mass","center":Vector2(-1800,-550),"radius":620.0,"blocks_move":true,"blocks_los":true})
	solids.append({"id":"map11.field.wet_mass","center":Vector2(2100,100),"radius":720.0,"blocks_move":true,"blocks_los":true})
	solids.append({"id":"map11.field.corpse_tree","center":Vector2(-250,-2700),"radius":220.0,"blocks_move":true,"blocks_los":true})
	solids.append({"id":"map11.field.heart_altar","center":Vector2(-250,-2320),"radius":100.0,"blocks_move":true,"blocks_los":false})
	var clips: Array[PackedVector2Array] = [PackedVector2Array([Vector2(-10000,-10000),Vector2(0,-10000),Vector2.ZERO,Vector2(-10000,0)]),PackedVector2Array([Vector2(0,-10000),Vector2(10000,-10000),Vector2(10000,0),Vector2.ZERO]),PackedVector2Array([Vector2(-10000,0),Vector2.ZERO,Vector2(0,10000),Vector2(-10000,10000)]),PackedVector2Array([Vector2.ZERO,Vector2(10000,0),Vector2(10000,10000),Vector2(0,10000)])]
	for i in range(4):
		var clipped: Array[PackedVector2Array] = Geometry2D.intersect_polygons(outer,clips[i])
		regions.append({"id":i,"key":"map11.field.region."+str(i),"polygon":clipped[0] if clipped.size()==1 else PackedVector2Array()})
func region_id(p: Vector2) -> int: return (0 if p.y <= 0 else 2) + (0 if p.x <= 0 else 1)
func add_anchor(id: String, marker: String, role: String, p: Vector2) -> void:
	anchors.append({"id":"map11.field."+id,"marker":marker,"role":role,"position":p,"facing":-PI/2,"region_id":region_id(p),"clearance":96.0})
