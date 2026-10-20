extends "res://tests/test_demo11_etype_d_runtime.gd"
func run() -> void:
 await setup()
 if typed.size()!=5:main.free();quit(1);return
 for i in 20:await physics_frame
 var g: Dictionary=main.source_state.read_current_g()
 for index in [0,1,2,3]:
  var a: Node=typed[index]
  a.data.native_final.reviveIframes=0
  a.poise=a.max_poise*0.5;a._poise_regen=199;a._last_serial=-1
  var prior: float=a.poise
  a.advance_native_phase(1,0,[])
  check(a.poise==minf(a.max_poise,prior+int(a.max_poise*0.15)) and a._poise_regen==0,"source200/15 percent poise type"+str(a.etype))
  # Explicit already-broken shield fixture, PC hurtE still owns the whole HP/death.
  a.eShield=0
  a.receive_damage(int(a.hp)+100,Vector2.RIGHT,"weapon",{})
  check(not a.alive and a.hp<=0 and a.not_ready=="","actual PC final death type"+str(a.etype)+a.not_ready)
 check(main.native_stage_spawn_adapter.snapshot().origins==5,"origin identity retained for deaths")
 var a: Node=typed[4]
 a.receive_damage(1,Vector2.RIGHT,"weapon",{"unported_D_opt":true})
 check(a.not_ready.contains("hurte_opts_unsupported"),"own type refused")
 check(not owner.spawn_selected("D-runtime-4",25).ready,"same etype future admission suspended without replay")
 check(owner.not_ready_types.size()==1 and not owner.not_ready_types.has(18),"type25 failure never suspends other types")
 print("D_DEATH_RESULT ",JSON.stringify({"assertions":checks,"failures":failures,"skipped":[],"source_global_AI_verified":false,"region_kills":g._regions.map(func(r):return r.kills)}))
 main.free();quit(1 if failures else 0)
