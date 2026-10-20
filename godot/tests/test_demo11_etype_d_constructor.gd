extends "res://tests/test_demo11_etype_d_runtime.gd"
func run() -> void:
 check(OS.get_user_data_dir().ends_with(USERDIR),"isolation")
 await setup()
 if typed.size()==5:verify_constructor()
 else:check(false,"five real ctor fixtures")
 print("D_CTOR_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[]}))
 main.free();quit(1 if failures else 0)
