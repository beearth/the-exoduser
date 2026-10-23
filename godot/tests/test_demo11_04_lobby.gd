extends SceneTree
const USERDIR := "EXODUSER-demo11-04-Isolated-20261021-SWEEP-B2-20261023-01"
const Store = preload("res://port_modules/save_adapter/demo_local_storage.gd")
const Menu = preload("res://scripts/native_save_slot_menu.gd")
const Bridge = preload("res://scripts/native_settings_lobby_bridge.gd")
var checks := 0
var failures := 0
var news: Array = []
var loads: Array = []
var serial := 0
func _initialize() -> void: call_deferred("_run")
func check(value: bool, label: String) -> void:
	checks+=1
	if not value: failures+=1; printerr("DEMO11_04_FAIL ",label)
func commit(store: RefCounted, key: String, data: Dictionary) -> bool:
	serial+=1
	var id := "fixture-%d" % serial
	var begin: Dictionary=store.begin_set(id,key,JSON.stringify(data))
	if not begin.get("ready",false): return false
	var receipt: Dictionary=store.run_request(id); store.release_receipt(id)
	return receipt.get("ok",false)
# JS JSON numbers are binary64; retain exact field/shape checks while allowing
# Godot integer fixture literals and parsed float carriers of the same number.
func same(a: Variant, b: Variant) -> bool:
	if (a is int or a is float) and (b is int or b is float): return a == b
	if typeof(a)!=typeof(b): return false
	if a is Dictionary:
		if a.size()!=b.size(): return false
		for k in a:
			if not b.has(k) or not same(a[k],b[k]): return false
		return true
	if a is Array:
		if a.size()!=b.size(): return false
		for i in a.size():
			if not same(a[i],b[i]): return false
		return true
	return a==b
func clear_store(store: RefCounted) -> void:
	for key in Store.KEYS:
		serial+=1
		var id := "clear-%d" % serial
		if store.begin_remove(id,key).get("ready",false): store.run_request(id); store.release_receipt(id)
func _run() -> void:
	check(OS.get_user_data_dir().get_file()==USERDIR,"isolated namespace only")
	if failures: quit(2); return
	var store=Store.new()
	check(store.open_store().get("ready",false),"real store open")
	clear_store(store)
	var menu=Menu.new()
	menu.new_game_requested.connect(func(slot: int,data: Dictionary): news.append({"slot":slot,"data":data}))
	menu.continue_requested.connect(func(slot: int,data: Dictionary): loads.append({"slot":slot,"data":data}))
	check(menu.open() and menu.rows.size()==5,"exact five actual slots")
	check(menu.rows.all(func(row): return row.kind=="empty"),"missing files shown empty")
	check(menu.selected==-1 and not menu.request_continue(),"no automatic selection/continue")
	check(not menu.request_new(0,"   ") and news.is_empty(),"blank name denied")
	check(menu.request_new(0,"재의 맹세"),"metadata actual write and readback")
	check(news.size()==1 and news[0].slot==0 and not news[0].data.has("player"),"new request carries metadata only after IO")
	check(store.read_json("hellsave_demo_0").value.name=="재의 맹세","independent adapter reads actual created bytes")
	check(not menu.request_new(1,"재의 맹세") and not store.get_item("hellsave_demo_1").found,"duplicate name cannot write second slot")
	check(not menu.request_new(0,"덮어쓰기"),"occupied slot cannot overwrite")
	check(menu.select_slot(0) and menu.request_continue() and news.size()==2 and loads.is_empty(),"metadata-only start is not restore")
	var payload := {"name":"재의 맹세","ts":1700000000000,"charIdx":0,"player":{"lv":3},"game":{"stage":0},"unknown":{"한글":"원문"}}
	check(commit(store,"hellsave_demo_0",payload),"explicit saved fixture committed via adapter")
	check(menu.select_slot(0) and menu.request_continue(),"continue reads current disk payload")
	check(loads.size()==1 and same(loads[0].data,payload),"complete unknown fields handed off unchanged")
	check(not store.get_item("hellsave_demo").found and not store.get_item("hellsave_demo_active").found,"continue does not activate/restore or write gameplay keys")
	check(menu.ask_delete(0) and store.get_item("hellsave_demo_0").found,"asking delete is read-only")
	menu.cancel_delete()
	check(menu.pending_delete.is_empty() and store.get_item("hellsave_demo_0").found,"cancel preserves disk")
	check(menu.ask_delete(0),"delete captures selected raw snapshot")
	var replaced:=payload.duplicate(true); replaced.unknown.한글="다른 저장"
	check(commit(store,"hellsave_demo_0",replaced),"second actual writer replaces save")
	check(not menu.confirm_delete() and same(store.read_json("hellsave_demo_0").value,replaced),"stale confirmation cannot delete replacement")
	var lock: String=store.readiness().root.path_join(".writer")
	check(DirAccess.make_dir_absolute(lock)==OK,"inject external writer lock")
	var before: Array=menu.rows.duplicate(true)
	check(not menu.request_new(1,"먼지의 순례자") and not store.get_item("hellsave_demo_1").found and menu.rows==before,"IO failure cannot optimistically create")
	check(menu.ask_delete(0) and not menu.confirm_delete() and store.get_item("hellsave_demo_0").found,"IO failure cannot optimistically delete")
	check(DirAccess.remove_absolute(lock)==OK,"release own injected lock")
	menu.cancel_delete()
	check(menu.ask_delete(0) and menu.confirm_delete(),"confirmed delete actual commit")
	check(not store.get_item("hellsave_demo_0").found and menu.rows[0].kind=="empty","delete UI state from missing readback")
	for i in 5: check(menu.request_new(i,"전사 "+str(i+1)),"fill slot "+str(i))
	check(not menu.request_new(5,"여섯째") and menu.rows.size()==5,"five-slot limit")
	var root_path: String=store.readiness().root
	check(DirAccess.rename_absolute(root_path,root_path+".qa-backup")==OK,"inject directory unavailable")
	before=menu.rows.duplicate(true)
	check(not menu.refresh() and menu.rows==before,"read IO failure keeps old list rather than five false empties")
	check(DirAccess.rename_absolute(root_path+".qa-backup",root_path)==OK,"restore own fixture directory")
	clear_store(store)
	# Captures and UI checks use explicit fixture saves, never a claimed restore.
	check(commit(store,"hellsave_demo_0",payload) and commit(store,"hellsave_demo_2",{"name":"먼지의 순례자","ts":1700000000000,"charIdx":0}),"screen fixtures on actual disk")
	var screen=load("res://scenes/demo_lobby.tscn").instantiate()
	root.add_child(screen)
	await process_frame
	check(screen.menu.rows.size()==5 and screen.start.disabled,"actual screen starts unselected")
	# SWEEP-B(2026-10-23): 웹 로비는 텍스트 brand/crest 대신 .lobby-brand-logo 이미지(실측 1507.2,195,249.5,104)를 쓴다.
	var logo: TextureRect=screen.get_node("logo")
	check(logo.get_rect()==Rect2(1507.2,195,249.5,104),"brand logo respects web .lobby-brand-logo rect rather than texture minimum")
	check(screen._number_label(3.0)=="3","source integral JSON level label has no .0 suffix")
	var fonts=load("res://scripts/native_ui_fonts.gd")
	# 웹 계산값: 슬롯 이름 Noto Sans KR 600 16.8px / #charName Noto Sans KR 16px
	check(fonts.chain_families(screen.card_names[0].get_theme_font("font"))[0]=="Noto Sans KR","slot names use web Noto Sans KR token")
	check(fonts.chain_families(screen.name_input.get_theme_font("font"))[0]=="Noto Sans KR","name entry uses web #charName Noto Sans KR token")
	check(logo.texture!=null and logo.texture.resource_path=="res://assets/ui/parity_ui_04/logo.png","brand uses web logo image asset")
	check(logo.get_rect().position.x>=screen.get_node("ancestor").get_rect().end.x,"brand logo outside the art rectangle")
	screen.cards[0].pressed.emit()
	check(screen.menu.selected==0 and not screen.start.disabled,"actual card control selects saved slot")
	var received: Array=[]
	screen.continue_requested.connect(func(slot: int,data: Dictionary): received.append([slot,data]))
	screen.start.pressed.emit()
	check(received.size()==1 and same(received[0][1],payload),"actual continue control calls payload handoff")
	screen.erase.grab_focus(); screen.erase.pressed.emit()
	check(screen.modal.visible and root.gui_get_focus_owner()==screen.cancel,"delete opens modal with safe cancel focus")
	# 웹 삭제 확인: '<이름> 캐릭터를 정말 삭제하시겠습니까?' Noto Sans KR 16px rgb(236,217,183) (슬롯 번호/기록명 줄 없음)
	check(screen.modal_title.text=="재의 맹세 캐릭터를 정말 삭제하시겠습니까?" and fonts.chain_families(screen.modal_title.get_theme_font("font"))[0]=="Noto Sans KR","delete prompt uses web text and Noto Sans KR")
	check(screen.card_names.all(func(label): return fonts.chain_families(label.get_theme_font("font"))[0]=="Noto Sans KR"),"all five slot name labels use web Noto Sans KR")
	# 웹 카드 표기: 저장 슬롯은 이름, 빈 슬롯은 '—' (번호 표기 없음, 저장 슬롯 먼저)
	var shown: Array=[];for i in screen.cards.size():if screen.cards[i].visible:shown.append(screen.card_names[i].text)
	check(shown.size()>=2 and shown[0]=="재의 맹세" and shown[1]=="먼지의 순례자" and shown.slice(2).all(func(t): return t=="—"),"visible slot cards: saved names first then web empty dash, no numbering "+str(shown))
	screen.cancel.pressed.emit()
	check(not screen.modal.visible and root.gui_get_focus_owner()==screen.erase,"cancel restores initiating focus")
	screen._new_card.pressed.emit()
	check(screen.get_snapshot().form_visible,"web + 새 캐릭터 card opens character creation")
	var bridge=Bridge.new(); bridge.configure("fr")
	check(bridge.text("한국어","English")=="English","untranslated locale explicit English fallback")
	bridge.configure("ko"); check(bridge.text("한국어","English")=="한국어","explicit Korean handoff")
	var key:=InputEventKey.new(); key.keycode=KEY_A; bridge.observe(key)
	check(bridge.device=="keyboard","S10 keyboard observation no persistence")
	root.remove_child(screen); screen.free()
	await process_frame
	print("DEMO11_04_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"real_io":true,"restore":false,"captures":false,"userdir":OS.get_user_data_dir()}))
	quit(0 if failures==0 else 1)
