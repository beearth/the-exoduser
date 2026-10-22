extends RefCounted
## DEMO11-07: metadata-only char0 admission. Full saved-Player restore belongs to DEMO11-06.
const JS=preload("res://port_modules/save_adapter/source_player_restore.gd")
const CHARACTERS=["엑소듀서 전사","실버테일","헬거너","변성술사","창법사"] # I3199–3231; only char0 is released.
var phase:="idle"
var error:=""
var packet: Dictionary={}
var launches:=0
var _main: WeakRef
var _menu: RefCounted
var _previous_active: Variant
var _active_written:=false
static func validate_name(raw: String, index: int=0) -> Dictionary:
	if index!=0:return {"ready":false,"reason":"character_locked"}
	var name:=raw.strip_edges()
	var units:=name.to_utf16_buffer().size()/2 # Source JS name.length, not codepoint count.
	if units<2 or units>8:return {"ready":false,"reason":"name_length"}
	for c in ['<','>','"',"'",'&','/','\\']:
		if name.contains(c):return {"ready":false,"reason":"name_special"}
	return {"ready":true,"name":name}
func _fail(reason: String) -> Dictionary:
	error=reason;phase="failed";return {"ready":false,"reason":reason}
func prepare(menu: RefCounted,slot: int) -> Dictionary:
	if phase in ["starting","entered"]:return {"ready":false,"reason":"entry_already_started"}
	phase="preparing";error="";packet={};_menu=menu;_active_written=false
	if not menu.refresh() or slot<0 or slot>=5:return _fail("slot_unavailable")
	var row: Dictionary=menu.rows[slot]
	if row.kind not in ["new","saved"]:return _fail("slot_unavailable")
	var data: Dictionary=row.data
	if data.get("charIdx",0)!=0:return _fail("character_locked")
	if JS._truthy(data.get("player")):return _fail("saved_player_restore_required")
	if not data.get("name") is String or data.name.is_empty():return _fail("name_required")
	var game_item: Dictionary=menu.storage.get_item("hellsave_demo")
	var active: Dictionary=menu.storage.get_item("hellsave_demo_active")
	if not game_item.get("ready",false) or not active.get("ready",false):return _fail("active_read_failed")
	# Do not discard another session's unsynchronised progress. DEMO11-06 owns return/sync.
	if game_item.get("found",false):return _fail("active_save_sync_required")
	_previous_active=active.get("raw")
	if active.get("found",false) and active.raw not in ["0","1","2","3","4"]:return _fail("active_invalid")
	var current: Dictionary=menu.storage.get_item(menu._key(slot))
	if not current.get("ready",false) or current.get("raw")!=row.raw:return _fail("slot_changed")
	packet={"slot":slot}
	if not menu._write("hellsave_demo_active",str(slot),false,_previous_active):return _fail(menu.last_error)
	_active_written=true
	current=menu.storage.get_item(menu._key(slot))
	var check_active: Dictionary=menu.storage.get_item("hellsave_demo_active")
	if not current.get("ready",false) or current.get("raw")!=row.raw or not check_active.get("ready",false) or check_active.get("raw")!=str(slot):
		rollback();return _fail("entry_readback_failed")
	var game: Variant=data.get("game",{})
	var done: bool=JS._truthy(game.get("cutsceneDone")) if game is Dictionary else false
	packet={"slot":slot,"name":data.name,"charIdx":0,"cutscene_done":done,"metadata_raw":row.raw,"full_restore":false}
	phase="prepared"
	return {"ready":true,"packet":packet.duplicate(true)}
func rollback() -> bool:
	if phase=="entered":return false # late callback must not clear a live active session.
	if not _active_written:return true
	var ok: bool=_menu._write("hellsave_demo_active","" if _previous_active==null else str(_previous_active),_previous_active==null,str(packet.get("slot",_menu.selected)))
	if ok:_active_written=false
	return ok
func launch(screen: Control,slot: int) -> Dictionary:
	var started: Dictionary=_launch_begin(screen,slot,false)
	if not started.get("ready",false):return started
	return _launch_finish(screen,started.main)
## BOOT-01 (PC, 2026-10-22) — launch와 같은 순서·판정. 다른 점 두 가지뿐이다.
## Main에 native_boot_staged 메타를 줘 _ready 본문이 여러 프레임에 나뉘게 하고, 끝날 때까지 기다린 뒤
## (그리고 한 프레임 더 넘긴 뒤) request_native_lobby_entry를 부른다. 각 프레임 사이에 OS 이벤트 펌프가 돈다.
func launch_staged(screen: Control,slot: int,loading: Node=null) -> Dictionary:
	if is_instance_valid(loading):loading.begin_main_boot(null) # 원본 _startDemoNew showBootLoading('DEMO 로딩...')
	var started: Dictionary=_launch_begin(screen,slot,true)
	if not started.get("ready",false):return started
	var main: Node=started.main
	if is_instance_valid(loading):loading.main=main
	if is_instance_valid(main) and main.has_method("is_native_boot_body_done"):
		if not main.is_native_boot_body_done():
			await main.native_boot_stage_completed
		if is_instance_valid(main) and main.is_inside_tree():
			await main.hold_native_boot_frame() # _ready 마지막 단계와 진입(인트로 시작)이 한 프레임에 겹치지 않게
		if is_instance_valid(main):
			main.end_native_boot_staging()
	return _launch_finish(screen,main)
func _launch_begin(screen: Control,slot: int,staged: bool) -> Dictionary:
	var prepared:=prepare(screen.menu,slot)
	if not prepared.ready:return prepared
	var scene: PackedScene=load("res://scenes/main.tscn")
	if scene==null:rollback();return _fail("main_load_failed")
	var main: Node=scene.instantiate();_main=weakref(main);phase="starting"
	main.set_meta("native_lobby_entry_pending",true)
	if staged:main.set_meta("native_boot_staged",true)
	main.set_meta("native_story_locale",screen.bridge.language) # S10 lobby selection, before any optional explicit override.
	for key in ["native_audio_source_root","native_story_source_root","native_story_locale"]:
		if screen.has_meta(key):main.set_meta(key,screen.get_meta(key))
	var tree: SceneTree=screen.get_tree()
	tree.root.add_child(main)
	return {"ready":true,"main":main}
func _launch_finish(screen: Control,main: Node) -> Dictionary:
	if not is_instance_valid(main) or not main.is_inside_tree():
		rollback();return _fail("main_admission_failed")
	var tree: SceneTree=main.get_tree()
	var result: Dictionary=main.request_native_lobby_entry(self)
	if not result.get("ready",false):
		main.queue_free();rollback();return _fail(str(result.get("reason","main_admission_failed")))
	phase="entered";launches+=1
	tree.current_scene=main
	if is_instance_valid(screen):screen.queue_free()
	return {"ready":true,"main":main,"packet":packet.duplicate(true)}
func read_packet(main: Node) -> Dictionary:
	if _main==null or _main.get_ref()!=main or phase not in ["starting","entered"]:return {"ready":false}
	return {"ready":true,"packet":packet.duplicate(true)}
