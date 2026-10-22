extends SceneTree
const USERDIR="EXODUSER-PCIA-WIRE-Isolated-20261021"
var checks:=0
var failures:=0
func check(ok: bool,label: String) -> void:
 checks+=1
 if not ok:failures+=1;print("PCIA_FAIL ",label)
func _initialize() -> void:call_deferred("run")
func run() -> void:
 check(OS.get_user_data_dir().get_file()==USERDIR,"isolated")
 var main: Node=load("res://scenes/main.tscn").instantiate();root.add_child(main)
 for i in 8:await physics_frame
 # Suppress autonomous presentation/AI only; do not modify HP/iframe or PC writers.
 for child in main.get_children():
  if child!=main.native_demo_life:child.set_process(false);child.set_physics_process(false)
 var life: Node=main.native_demo_life
 var natural_roll: Dictionary=life._death_roll()
 check(natural_roll.has("roll") and natural_roll.roll>=0 and natural_roll.roll<100,"actual source-provider death roll")
 for hit in 20:
  if main.player.hp<=0:break
  main.player.receive_damage(int(main.player.max_hp))
  # PC physics is paused for fixture isolation: wait uses real receive_damage
  # with its own timers advancing through the actual Player callback.
  main.player.set_physics_process(true)
  for i in 150:await physics_frame
  main.player.set_physics_process(false)
  if not life.receipts.is_empty():break
 for i in 3:await process_frame
 var phase: Dictionary=main.read_native_player_life_phase()
 check(phase.phase in ["fallen","alive"],"product PCI-01 phase")
 check(life.receipts.any(func(r):return r.get("status")=="APPLIED" and r.get("op") in ["fallen_enter","revive_once"]),"actual HP0 automatically calls PCI-01")
 if phase.phase=="fallen":
  for i in 3:await process_frame
  if DisplayServer.get_name()!="headless":root.get_texture().get_image().save_png("/Users/fordeargamers/exoduser-wt/_out/PCIA-WIRE/fallen.png")
  var before: float=life.remaining
  paused=true
  for i in 3:await process_frame
  check(life.remaining==before,"pause consumes zero countdown")
  paused=false
  check(phase.clear_blocked,"fallen blocks clear")
  check(not main.source_state.commit_native_demo_clear(main,0,false),"actual clear writer rejects fallen")
  var retry: Dictionary=life.retry()
  check(retry.status=="NOT_READY","missing stage owner causes no EXP debit")
  var g: Dictionary=main.source_state.read_current_g()
  g.on=true
  main.world.set_physics_process(true)
  var epoch_before: int=int(main.world.get_native_projectile_fx_context().frame_reset_epoch)
  for i in 310:
   await physics_frame
   if main.read_native_player_life_phase().phase!="fallen":break
  for i in 3:await process_frame
  var final: Dictionary=main.read_native_player_life_phase()
  check(final.phase=="dead" and life.remaining==0,"actual native clock resolves 300 countdown to final death")
  # PC-SYS-2(2026-10-23): 원본 update()는 fallen 중 P.st2를 틱당 2 줄인다(G32794 공통 + G32991 case 'fallen').
  # 웹 실측 300 카운트다운 = 2506ms. 남은 값의 절반 틱보다 이르면 안 되고, 해소 뒤 대기(물리 1틱+process 3프레임) 이상 늦어도 안 된다.
  var spent: int=int(main.world.get_native_projectile_fx_context().frame_reset_epoch)-epoch_before
  check(spent>=int(ceil(before/2.0)),"no early countdown resolution")
  check(spent<=int(ceil(before/2.0))+5,"no late countdown resolution (two source decrements per tick)")
  check(g.get("on")==false and g.get("_sStats",{}).get("deaths")==1,"final death Mac followups once")
  if DisplayServer.get_name()!="headless":root.get_texture().get_image().save_png("/Users/fordeargamers/exoduser-wt/_out/PCIA-WIRE/dead.png")
  var expiry: int=life.receipts.size()
  for i in 3:await physics_frame
  check(life.receipts.size()==expiry,"no repeated resolve requests")
 print("PCIA_RESULT ",JSON.stringify({"checks":checks,"failures":failures,"phase":phase.phase,"receipts":life.receipts.size()}))
 main.free();quit(1 if failures else 0)
