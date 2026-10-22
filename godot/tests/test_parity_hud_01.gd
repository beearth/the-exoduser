extends SceneTree
## PARITY-HUD-01: actual display geometry, read-only values, source atlas and ring reuse.
var checks:=0
var failures:=0
var main: Node
func _initialize() -> void:call_deferred("run")
func check(ok: bool,what: String) -> void:
 checks+=1
 if not ok:failures+=1;printerr("PARITY_HUD_FAIL ",what)
func run() -> void:
 if not OS.get_user_data_dir().get_file().begins_with("EXODUSER-demo11-PARITY-HUD-01-TEST-"):quit(2);return
 root.size=Vector2i(1920,1080)
 main=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in range(20):await process_frame
 var hud: Node=main.hud
 var public: Control=hud.get_node("PublicHUD")
 var hp: Control=public.get_node("NativeHPGlobe")
 var mp: Control=public.get_node("NativeSPGlobe")
 check(hp.size==Vector2(157.5,157.5),"source175*.9 orb")
 check(hp.position.is_equal_approx(Vector2(440.25,912.5)),"source HP rect")
 check(mp.position.is_equal_approx(Vector2(1322.25,912.5)),"source MP rect")
 check(hp.has_node("WebOrbTrim") and mp.has_node("WebOrbTrim"),"source ring/eyes layers")
 check(not hud._hp_text.visible and not hud._stamina_text.visible,"legacy multirow labels hidden")
 check(public.get_node("NativeSkillBar").position.is_equal_approx(Vector2(591,931.2)),"source skillbar rect")
 check(hud._slot_icons.size()==13,"source13 slots")
 check(public.get_node("NativeMinimap").visible,"MAP11 minimap enabled")
 check(public.get_node("NativeMinimap").scale==Vector2(.85,.85),"source minimap scale")
 check(public.has_node("WebRegionDirection"),"source region arrow consumer")
 check(public.get_node("NativeStageClock").position.is_equal_approx(Vector2(875,17)),"source stage clock rect")
 check(public.get_node("NativeObjectivePanel").position.is_equal_approx(Vector2(1684,16)),"source objective rect")
 var owner: Node=public.get_node("Demo11OwnerHUD")
 check(not owner._strip.visible and not owner._selection.visible and not owner._failure.visible,"no non-source toast")
 var adapter: Node=main.world.get_node("NativeFloatingText")
 var pool: Array=adapter._producer.txts
 check(pool.size()==40,"source40 preallocated at boot")
 var first: Dictionary=pool[0]
 for i in range(41):adapter.emit_native_text(4020,7420,"1","#fff",35,0,"1")
 check(is_same(pool[0],first) and pool.size()==40,"ring overwrite retains slot identity")
 check(adapter._number_atlas_texture.get_size()==Vector2(480,168),"source canvas10x3 cells48x56")
 check(adapter._number_atlas_supply_calls==1 and adapter._number_atlas_bake_calls==0,"source atlas once; no bake during play")
 print("PARITY_HUD_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"source":"game.html:143-386,2615-2662,43929-43990","namespace":OS.get_user_data_dir().get_file()}))
 quit(1 if failures else 0)
