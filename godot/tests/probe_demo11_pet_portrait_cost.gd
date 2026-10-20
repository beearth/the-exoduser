extends SceneTree
const USERDIR="EXODUSER-demo11-perf-enemy-Isolated-20261021"
func _initialize() -> void:call_deferred("run")
func run() -> void:
 var failures:=0;var rows: Array=[];var retained: Array=[]
 if not OS.get_user_data_dir().ends_with(USERDIR):failures+=1
 for path in ["res://assets/pets/crow_portrait.png","res://assets/pets/cat_portrait.png"]:
  var t:=Time.get_ticks_usec();var first: Texture2D=load(path);var cold:=Time.get_ticks_usec()-t
  t=Time.get_ticks_usec();var second: Texture2D=load(path);var warm:=Time.get_ticks_usec()-t
  if first==null or first!=second:failures+=1
  retained.append(first);retained.append(second)
  rows.append({"path":path,"first_load_us":cold,"retained_repeat_load_us":warm,"same_resource":first==second})
 print("PET_PORTRAIT_COST_RESULT ",JSON.stringify({"checks":3,"failures":failures,"rows":rows,"scope":"headless read-only load probe, retains textures; no PC pet code changes"}))
 quit(1 if failures else 0)
