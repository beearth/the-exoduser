extends RefCounted
## G31120–31364, stage0/normal/no-el projection. Other inputs NOT_READY.
const DIFFICULTY=preload("res://scripts/native_ch2_enemy_constructor_policy.gd")
const RAW_SPEED={0:.3,1:.18,4:.14,5:.5,6:.35}
const RADII={0:10,1:10,4:16,5:10,6:13}
const RANGES={0:400,1:600,4:400,5:200,6:400}
static func radius(et: int,u: float) -> float:return (RADII[et]+u*2.0)*2.0
static func build(template: Dictionary,physical_projectile: Dictionary,et: int,at: Vector2,level: float,stage_offset: float,source: Dictionary,id: String,order: int,difficulty: int=5) -> Dictionary:
	var r:=template.duplicate(true)
	var lv: float=maxf(1.0,(level if level!=0 else 1.0)+DIFFICULTY.DIFF_LV_OFF[difficulty]+stage_offset)
	var curve: float=(.4*lv*lv*lv+199.0*lv+100.0)*2.925 if lv<=500 else 50000000.0*pow(1.0014,lv-500)*2.925
	var pacing: float=1.0/(1.0+minf(9.0,maxf(0,lv-1))/18.0)
	var hp: int=int(floor(floor(curve*pacing*DIFFICULTY.DIFF_MUL[difficulty])))
	var atk: int=int(floor((50.0+lv*1.95)*.6*DIFFICULTY.DIFF_MUL[difficulty]))
	var speed: float=(maxf(.2,RAW_SPEED[et]*1.3)+source.speed_u*.08)*1.5
	var rad: float=radius(et,source.radius_u)
	var lit: Dictionary=source.literal
	r.merge({"a_constructor":"source_mkEn_stage0_normal_v1","id":id,"order":order,"etype":et,"level":lv,"element":"","element_id":-1,"spawn_position":[at.x,at.y],"requested_spawn_position":[at.x,at.y],"hp":hp,"attack":atk,"radius":rad,"speed_pixels_per_tick":speed,"poise":hp,"max_poise":hp,"eShield":hp,"eShieldMax":hp,"eRes":[0,0,0,0,0,0,0],"elite":0,"mods":[],"aura":null,"facing":lit.facing,"initial_facing":lit.facing,"initial_idle_ticks":lit.st2,"initial_projectile_ticks":lit.projT,"projectile_cooldown_ticks":9999 if et==5 else 240,"projectile_range":RANGES[et],"factory_random_seed":order},true)
	r.projectile=physical_projectile.duplicate(true)
	r.projectile.base_damage=atk*2;r.projectile.contact_damage=atk*2
	r.projectile.merge({"redBean":false,"homing":false,"element":"","element_id":-1,"native_dtype":"magic"},true)
	r.native_flags={"ib":false,"elite":0,"mods":[],"aura":null}
	var n: Dictionary=r.native_final
	n.merge({"x":at.x,"y":at.y,"_homeX":at.x,"_homeY":at.y,"etype":et,"ib":false,"lv":lv,"r":rad,"speed":speed,"hp":hp,"mhp":hp,"atk":atk,"poise":hp,"maxPoise":hp,"eShield":hp,"eShieldMax":hp,"st2":lit.st2,"facing":lit.facing,"projT":lit.projT,"projCd":r.projectile_cooldown_ticks,"bossPatT":lit.bossPatT,"_bossOrbitAng":lit._bossOrbitAng,"_erraticAng":lit._erraticAng,"reviveIframes":15.0,"shieldAng":lit.get("shieldAng",0.0),"shieldBashCd":lit.get("shieldBashCd",9999),"shieldBashT":lit.get("shieldBashT",9999)},true)
	var seed: int=(et*7+int(at.x*31.0))&0x7fffffff
	n["_mob8Col"]=(seed%40)%8;n["_mob8Row"]=int((seed%40)/8);n["_mob8dir"]=true
	n.erase("el")
	r.initial_timers.merge({"st2":lit.st2,"projT":lit.projT,"projCd":r.projectile_cooldown_ticks,"bossPatT":lit.bossPatT},true)
	return r
