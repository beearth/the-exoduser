extends RefCounted
const SHARED=preload("res://scripts/native_fieldboss_common.gd")
## Fire Devil only. G61460–61504,61661–61725. Pending owners resume after the
## already committed source prefix; never re-run that prefix or its RNG.
var m: Dictionary
var p: Dictionary
var env: Dictionary
var owners: Dictionary
var pending: Dictionary = {}
var events: Array = []
var stage := -1
var distance := 0.0
var done := true
var _busy := false
func begin(record: Dictionary, player: Dictionary, context: Dictionary, callbacks: Dictionary) -> bool:
	if not done or _busy: return false
	m=record;p=player.duplicate(true);env=context;owners=callbacks;events=[];pending={};stage=0;done=false
	pump()
	return true
func _command(command: String, args: Dictionary, next: int) -> bool:
	pending={"command":command,"args":args,"next":next}
	return _serve()
func _serve() -> bool:
	if pending.is_empty(): return true
	var name: String=pending.command
	if not owners.has(name) or not owners[name].is_valid(): return false
	var reply: Variant=owners[name].call(pending.args)
	if not reply is Dictionary or reply.get("ack")!=true: return false
	if name=="protected_contact":
		var after: Variant=reply.get("player_after")
		if not valid_player(after): return false
		p=after.duplicate(true)
	if name=="spawn_projectile" and pending.args.get("fdEnergy",false):env["energy_completed"]=true
	stage=pending.next;pending={}
	return true
func pump() -> void:
	if _busy or done: return
	_busy=true
	if not _serve(): _busy=false;return
	while not done:
		match stage:
			0:
				if m.asleep:
					if dist(m.x,m.y,p.x,p.y)<=1000:
						m.asleep=0;m.emT=54;m.emMax=54;m.hid=1;m.spawnIn=1;m.tpX=m.x;m.tpY=m.y
						events.append({"kind":"wake"})
					done=true;continue
				m.t+=1;m._moving=false
				if m.hitCd>0:m.hitCd-=1
				if m.shotCd>0:m.shotCd-=1
				distance=dist(m.x,m.y,p.x,p.y);m.frame=clock(p.x-m.x,p.y-m.y)
				if m.emT>0:
					m.emT-=1
					if m.emT==0:
						m.x=m.tpX;m.y=m.tpY;distance=dist(m.x,m.y,p.x,p.y);m.hid=0;m.spawnIn=0
						if not m.get("_landed",false):m._landed=1;events.append({"kind":"first_land"})
						elif distance<m.r+110 and p.iframes<=0 and p.s!="charge":
							var a: float=atan2(p.y-m.y,p.x-m.x)
							if not _command("protected_contact",{"kind":"landing","damage":i32(m.atk),"dtype":"magic","knockback":{"x":cos(a)*16,"y":sin(a)*16},"player":p.duplicate(true)},8):break
							continue
					done=true;continue
				if m.hid:done=true;continue
				if not m.enChg>0 and distance>m.r+p.r+28:
					var ox: float=m.x;var oy: float=m.y;var a: float=atan2(p.y-m.y,p.x-m.x)
					var nx: float=m.x+cos(a)*1.8;var ny: float=m.y+sin(a)*1.8
					if not owners.is_wall.call(Vector2(nx,ny)):m.x=nx;m.y=ny;distance=dist(m.x,m.y,p.x,p.y)
					m.frame=clock(p.x-m.x,p.y-m.y);m._moving=m.x!=ox or m.y!=oy
					if m._moving:m.walkT+=1
				stage=1
			1:
				stage=2
				if distance<m.r+p.r:
					var a: float=atan2(p.y-m.y,p.x-m.x)
					var at: Dictionary={"x":m.x+cos(a)*(m.r+p.r),"y":m.y+sin(a)*(m.r+p.r)}
					if not _command("protected_contact",{"kind":"body_push","position":at,"player":p.duplicate(true)},2):break
					distance=m.r+p.r
			2:
				# Body-push acknowledgement includes the actual updated player.
				distance=dist(m.x,m.y,p.x,p.y);stage=3
				if distance<m.r+p.r+8 and p.iframes<=0 and p.s!="charge":
					if not _command("protected_contact",{"kind":"body","damage":m.atk,"dtype":"magic","player":p.duplicate(true)},3):break
			3:
				var can_shoot: bool=abs(m.x-env.camera.x)<=maxf(0,env.viewport.x/2.0-64) and abs(m.y-env.camera.y)<=maxf(0,env.viewport.y/2.0-64)
				if not can_shoot:m.enChg=0;m.burst=0;m.burstGap=0
				if can_shoot and m.shotCd<=0 and not m.enChg>0:m.shotCd=180;m.enChg=180;m.chargeWalkT=0
				stage=4
				if m.enChg>0:
					m.enChg-=1;m.chargeWalkT+=1
					if (int(m.t)&1)==0:
						var draws: Array=[]
						for n in range(4):draws.append(owners.rng.call())
						events.append({"kind":"charge_particle","draws":draws,"eye":eye(m)})
					if m.enChg==0:
						var a: float=atan2(p.y-m.y,p.x-m.x)
						var at: Dictionary=eye(m)
						if not _command("spawn_projectile",shot(at.x,at.y,a,i32(m.atk*2.8),true),4):break
						continue
			4:
				stage=5
				if env.get("energy_completed",false):
					m.burst=3;m.burstGap=18
					if not m.tpCd>0:m.tpCd=600
					env.erase("energy_completed")
				if m.burst>0 and not m.enChg>0:
					if m.burstGap>0:m.burstGap-=1
					else:
						var a: float=atan2(p.y-m.y,p.x-m.x)
						var at: Dictionary={"x":m.x+cos(a)*m.r*.55,"y":m.y+sin(a)*m.r*.55}
						if not _command("spawn_projectile",shot(at.x,at.y,a,i32(m.atk*1.4),false),6):break
			5:
				stage=7
			6:
				m.burst-=1;m.burstGap=20;stage=7
			7:
				if m.tpCd>0:
					m.tpCd-=1
					if m.tpCd==0:
						if distance<2200:m.tpX=p.x;m.tpY=p.y;m.emMax=54;m.emT=54;m.hid=1;m.spawnIn=0;m._landed=1;events.append({"kind":"teleport"})
						else:m.tpCd=600
				done=true
			8:
				events.append({"kind":"landing_impact"});done=true
	_busy=false
static func valid_player(value: Variant) -> bool:
	return SHARED.valid_player(value)
static func i32(value: float) -> int:
	return SHARED.fire_i32(value)
static func initial(at: Vector2, lv: float) -> Dictionary:
	var hp: int=i32((1800+(lv if lv!=0 else 1)*350)*2.5)
	return {"x":at.x,"y":at.y,"homeX":at.x,"homeY":at.y,"r":100,"hp":hp,"mhp":hp,"t":0,"frame":6,"_moving":false,"walkT":0,"chargeWalkT":0,"atk":i32((18+lv*2.8)*1.2),"hitCd":0,"shotCd":90,"tpCd":0,"emT":0,"emMax":54,"tpX":at.x,"tpY":at.y,"hid":1,"spawnIn":1,"asleep":1,"enChg":0,"burst":0,"burstGap":0,"el":1,"_fmKind":"fd"}
static func clock(dx: float,dy: float) -> int:
	if dx==0 and dy==0:return 6
	var oct: int=((int(floor(atan2(dy,dx)/(PI/4.0)+0.5))%8)+8)%8
	return [3,5,6,7,9,11,12,1][oct]
static func eye(v: Dictionary) -> Dictionary:
	var u:=0.5;var y:=0.30
	if int(v.frame) in [1,3,5]:u=0.70;y=0.28
	elif int(v.frame) in [7,9,11]:u=0.30;y=0.32
	elif int(v.frame)==12:y=0.22
	return {"x":v.x+(u-.5)*280,"y":v.y+280*(y-.58)}
static func shot(x: float,y: float,a: float,damage: int,energy: bool) -> Dictionary:
	var props: Dictionary={"x":x,"y":y,"vx":cos(a)*6,"vy":sin(a)*6,"dmg":damage,"el":1,"friendly":false,"life":320 if energy else 240,"ml":320 if energy else 240,"col":"#ff5522","sz":48 if energy else 2,"r":18 if energy else 10,"_typed":true}
	if energy:props.merge({"elemBall":true,"_commit":true,"fdEnergy":true})
	else:props.fireMagic=true
	return props

static func dist(x: float,y: float,a: float,b: float) -> float:
	return sqrt((a-x)*(a-x)+(b-y)*(b-y))
