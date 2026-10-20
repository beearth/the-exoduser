extends RefCounted
const P43=preload("res://tests/test_demo11_43_stage_spawn_adapter.gd")
class Provider extends P43.Provider:
	var world: Node2D
	func spawn_sites(kind: String,request: Dictionary) -> Dictionary:
		query_count+=1
		for row in rows:
			if row.id==request.hole_id:
				return {"ready":kind=="hole" and world.can_move(row.marker.global_position,request.radius),"revision":revision,"position":row.marker.global_position,"region_id":row.region_id,"site_id":row.id}
		return {"ready":false}
var main: Node
var provider: Node2D
var holes: Node
var actors: Array=[]
var receipts: Array=[]
func setup(tree: SceneTree) -> bool:
	main=load("res://scenes/main.tscn").instantiate();tree.root.add_child(main)
	main.set_process(false)
	main.player.set_physics_process(false)
	provider=Provider.new();provider.world=main.world;main.world.add_child(provider)
	for i in range(4):
		var at: Vector2=main.player.global_position+Vector2(-300+i*200,-300)
		if not main.world.can_move(at,40):
			var safe: Variant=main.world.native_safe_point(at.x,at.y,40)
			if safe==null:return false
			at=Vector2(safe.x,safe.y)
		var marker:=Marker2D.new();marker.global_position=at;provider.add_child(marker)
		provider.rows.append({"id":"cohort-hole-"+str(i),"marker":marker,"region_id":i,"room":-1,"size":.3})
		provider.groups.append({"hole_id":"cohort-hole-"+str(i),"spawn_group_id":"cohort-group-"+str(i),"region_id":i,"total":8})
	if not main.bind_native_spawn_stage_provider(provider).ready:return false
	holes=main.world.get_node("NativeSpawnHoleSystem")
	main.source_state.read_current_g().on=true
	var types: Array=[0,1,4,5,6]
	for i in range(5):
		var source:=recipe(types[i],2 if i==4 else 1)
		var result: Dictionary=main.request_native_etype_a_spawn(holes,"cohort-group-"+str(i%4),source)
		receipts.append(result)
		if not result.get("ready",false):return false
		actors.append(result.actor)
	return true
static func recipe(etype: int,n: int=1) -> Dictionary:
	var literal: Dictionary={"st2":42.5,"facing":TAU*.25,"projT":210.0,"bossPatT":35.0,"_bossOrbitAng":TAU*.25,"_erraticAng":TAU*.25}
	if etype==6:literal.merge({"shieldAng":TAU*.25,"shieldBashCd":135.0,"shieldBashT":70.0})
	return {"etype":etype,"spawn_n":n,"elite":0,"mods":[],"speed_u":.25,"radius_u":.25,"literal":literal}
func close() -> void:main.queue_free()
