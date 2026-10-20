extends RefCounted
## Missing5/6 states only. Base body, HP/shield, hurtE delegate and animation
## are reused. Player protection is never written here.
static func advance(a: Node,sp: float,frame: float,enemies: Array) -> void:
	if not is_instance_valid(a.player) or a.player.hp<=0:return
	if not a.a_pending.is_empty() and a.a_pending.get("kind")=="shield_bash":
		if not a.a_bash_owner.is_valid():return
		var result: Variant=a.a_bash_owner.call(a.a_pending.duplicate(true))
		if not result is Dictionary or result.get("accepted")!=true:return
		a.a_pending={};a.state="recover";a.st2=30
	var before: Vector2=a.global_position
	a.native_frame=frame
	a._spawn_ticks=maxf(0,a._spawn_ticks-sp);a._hit_flash=maxf(0,a._hit_flash-sp)
	a._hit_stun=maxf(0,a._hit_stun-sp);a._stun_ticks=maxf(0,a._stun_ticks-sp)
	if a._hit_stun>0 or a._stun_ticks>0:a._finish_motion(before,sp);return
	var delta: Vector2=a.player.global_position-a.global_position
	var d: float=delta.length()
	if not a.alerted and d<a.data.aggro_range and a.world.has_line_of_sight(a.global_position,a.player.global_position):a.alerted=true
	if not a.alerted and d>400:return
	a.facing=delta.angle();a.st2-=sp
	if a.poise<a.max_poise:
		a._poise_regen+=sp
		if a._poise_regen>=a.data.poise_regen_ticks:a.poise=minf(a.max_poise,a.poise+floor(a.max_poise*a.data.poise_regen_fraction));a._poise_regen=0
	var n: Dictionary=a.data.native_final
	if a.etype==5 and a.state=="idle" and d<35+a.player.radius:a.state="windup";a.st2=20 # atkTicketRequest is literally true G38577
	var escort:=false
	if a.etype==6:
		if a.eShield>0 and a.state=="idle":
			var nearest: Node2D;var best:=150.0
			for other in enemies:
				if other==a or not is_instance_valid(other) or other.etype not in [1,7,8]:continue
				var od: float=other.global_position.distance_to(a.global_position)
				if od<best:nearest=other;best=od
			if nearest!=null:
				var goal: Vector2=nearest.global_position+(a.player.global_position-nearest.global_position)*.6
				if goal.distance_to(a.global_position)>10:
					var step: Vector2=(goal-a.global_position).normalized()*a.data.speed_pixels_per_tick*1.2*sp
					if a.world.can_move(a.global_position+step,a.radius):a.global_position+=step
				escort=true
		n["_escorting"]=escort
		if a.state=="idle":
			var diff: float=wrapf(a.facing-float(n.shieldAng),-PI,PI)
			n.shieldAng+=diff*.08*sp;n.shieldBashT-=sp
			if a.eShield<=0 and n.shieldBashT<=0 and d<150 and d>30:
				a.state="eShieldBash";a.st2=20;n.echDx=cos(a.facing);n.echDy=sin(a.facing);n.shieldBashT=n.shieldBashCd
	match a.state:
		"idle":
			if not escort:a._move_native(Vector2.from_angle(a.facing)*a.data.speed_pixels_per_tick*a.data.idle_movement_multiplier,sp)
			a._apply_separation(sp)
			if d<a.radius+a.player.radius+8 and a.player.iframes<=0 and a.st2<=0:
				a.player.receive_damage(int(a.attack*.8)) # existing PC damage interface only
				a.st2=40+floor(a.world.sample_native_random_unit()*20)
		"windup":
			if a.st2<=0:a.state="attack";a.st2=8
		"attack":
			if a.st2<=5 and a.st2+sp>5:
				var direction:=Vector2.from_angle(a.facing)
				a.a_warnings.append({"t":60.0,"origin":a.global_position,"point":a.global_position+direction*a.radius*.7})
			if a.st2<=0:a.state="recover";a.st2=35
		"eSelfDestruct":a.state="idle";a.st2=30 # removal in current source, not an explosion
		"recover":
			if a.st2<=0:a.state="idle";a.st2=15+a.world.sample_native_random_unit()*15
		"eShieldBash":
			var at: Vector2=a.global_position+Vector2(n.echDx,n.echDy)*4.5*sp
			if not a.world.can_move(at,a.radius):a.state="recover";a.st2=20
			else:
				a.global_position=at
				if a.global_position.distance_to(a.player.global_position)<a.radius+a.player.radius+8 and a.player.iframes<=0:
					a.a_pending={"kind":"shield_bash","actor":a,"player":a.player,"attack":a.attack,"element_id":-1,"knockback":10,"stagger_ticks":40,"source":"G40768–40775"}
					# PC owns isPWin/doParry/KB/stagger. No fake ordinary-hit substitute.
				elif a.st2<=0:a.state="recover";a.st2=25
				if a.world.sample_native_random_unit()>.5:
					a.world.sample_native_random_unit();a.world.sample_native_random_unit()
	a._finish_motion(before,sp)
