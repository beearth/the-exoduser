extends SceneTree
const Query=preload("res://scripts/native_inventory_query.gd")
func _initialize() -> void: call_deferred("run")
func run() -> void:
	if OS.get_user_data_dir().get_file()!="EXODUSER-demo11-23b-Isolated-20261021": quit(2); return
	# G16434-16488: falsy optional arrays are skipped, DEF contributes def*5.
	var item: Dictionary={"slot":"armor","rarity":0,"el":0,"def":2,"affixes":null,"elements":null,"crystals":null}
	var results: Array=[Query.supported(item),Query.power(item)==10,Query.array_value(item,"affixes").is_empty(),Query.sorted_indices([{"slot":"armor","def":1},item])==[1,0]]
	var failures: int=results.count(false)
	print("DEMO11_23B_NULL_RESULT ",JSON.stringify({"checks":results.size(),"failures":failures,"source":"G16434-16488"}))
	quit(0 if failures==0 else 1)
