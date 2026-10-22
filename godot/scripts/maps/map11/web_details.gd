extends Node2D
## Original build-time caches: ch1-face-life.js:8-193 / ch1-living-detail.js:529-1108.
## All resources and nodes allocated during setup, never in render_at().
const BASE := "res://assets/map/web_parity/detail02/"
var data: Dictionary
var faces: Array[Dictionary]=[]
var rigs: Array[Dictionary]=[]
var textures: Dictionary={}
func _ready() -> void:
 data=JSON.parse_string(FileAccess.get_file_as_string(BASE+"source.json"))
 for f in data.face:
  var s:=piece(self,f.texture,Vector2(f.x,f.y),Vector2(f.w,f.h));s.z_index=-2949
  faces.append({"sprite":s,"f":f,"seed":int(f.seed),"next":0.0,"blink":-1.0})
func piece(parent: Node,name_: String,p: Vector2,size: Vector2) -> Sprite2D:
 var s:=Sprite2D.new()
 if not textures.has(name_):textures[name_]=load(BASE+name_)
 s.texture=textures[name_];s.centered=false;s.position=p;s.scale=size/s.texture.get_size()
 s.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;parent.add_child(s);return s
func atlas(parent: Node,name_: String,p: Vector2,size: Vector2,cells: Vector2,count: int) -> Sprite2D:
 var s:=piece(parent,name_,p,size)
 var m:=ShaderMaterial.new();m.shader=preload("res://scripts/maps/map11/web_detail_atlas.gdshader")
 m.set_shader_parameter("cells",cells);m.set_shader_parameter("last_pose",float(count-1));s.material=m;return s
func replace_prop(original: Sprite2D,row: Dictionary) -> Sprite2D:
 var id: String=row.id;var p:=Vector2(row.position[0],row.position[1])
 var o: Dictionary={}
 for entry in data.objects:
  if entry.type==id and float(entry.x)==p.x and float(entry.y)==p.y:o=entry;break
 if o.is_empty():return original
 if id=="m_c1gtoxic" and p==Vector2(6740,1620):original.hide();return original
 if id not in ["m_c1tree","m_c1camp","m_c1gtoxicf","pit_poison","m_c1pool","m_c1cocoon","m_c1spod"]:return original
 if id=="m_c1gtoxicf" and p!=Vector2(6500,5460):return original
 if id=="pit_poison" and p!=Vector2(6500,5580):return original
 var host:=Sprite2D.new();host.position=p;host.z_as_relative=false;host.z_index=original.z_index
 var body:=Node2D.new();host.add_child(body)
 var rig: Dictionary={"host":host,"body":body,"o":o,"id":id,"row":row,"parts":[]}
 var size:=Vector2(row.draw_size[0],row.draw_size[1]);var origin: Vector2=-size*Vector2(row.pivot[0],row.pivot[1])
 if id=="m_c1tree":
  var t: Dictionary=data.tree
  var sz: float=float(row.metadata.sz)*float(o.get("scale",1))*.72
  size=Vector2(sz*minf(1,float(t.fullW)/t.fullH),sz*minf(1,float(t.fullH)/t.fullW));origin=-size*Vector2(.5,.72)
  piece(body,t.body,origin,size).material=original.material
  var root:=atlas(body,t.roots,origin+Vector2(t.x0/t.fullW*size.x,t.y0/t.fullH*size.y),Vector2(t.w/t.fullW*size.x,t.h/t.fullH*size.y),Vector2(4,2),8)
  (root.material as ShaderMaterial).set_shader_parameter("tree_tone",1.0)
  rig.root=root
  for h in t.hanging:
   var pivot:=Node2D.new();pivot.position=origin+Vector2(h.ax/t.fullW*size.x,h.ay/t.fullH*size.y);body.add_child(pivot)
   var tex: Texture2D=load(BASE+h.tex)
   piece(pivot,h.tex,Vector2((h.x0-h.ax)/t.fullW*size.x,(h.y0-h.ay)/t.fullH*size.y),tex.get_size()*size/Vector2(t.fullW,t.fullH)).material=original.material
   rig.parts.append({"node":pivot,"h":h})
 elif id=="m_c1camp":
  var c: Dictionary=data.camp
  piece(body,c.ground,origin-Vector2(36*size.x/440,32*size.y/331.5),Vector2(512*size.x/440,400*size.y/331.5))
  piece(body,c.body,origin,size)
  for h in c.hands:
   var hand:=atlas(body,h.texture,origin+Vector2(h.minX/880*size.x,h.minY/663*size.y),Vector2(h.pw/880*size.x,h.ph/663*size.y),Vector2(6,4),24)
   rig.parts.append({"node":hand,"h":h})
 elif id=="m_c1gtoxicf":
  var sw: Dictionary=data.swamp
  if row.flip_h:body.scale.x=-1
  piece(body,sw.apron,-size*.5-Vector2(36*size.x/440,31*size.y/450),Vector2(512*size.x/440,512*size.y/450))
  piece(body,"swampBase.png",-size*.5,size)
  rig.water=atlas(body,sw.atlas,-size*.5,size,Vector2(4,4),16)
  for vent in sw.vents:
   var b:=atlas(body,"bubble.png",-size*.5+Vector2((vent.x-48)*size.x/440,(vent.y-64)*size.y/450),Vector2(96*size.x/440,96*size.y/450),Vector2(8,8),64)
   rig.parts.append({"node":b,"offset":vent.offset})
 elif id=="pit_poison":rig.pit=atlas(body,"pit.png",-size*.5,size,Vector2(4,4),16)
 else:
  var copy:=Sprite2D.new();copy.texture=original.texture;copy.centered=original.centered;copy.offset=original.offset;copy.scale=original.scale;copy.flip_h=original.flip_h;copy.texture_filter=original.texture_filter;body.add_child(copy)
  if id=="m_c1pool" and p==Vector2(6700,1740):
   var sc: float=minf(1.6,o.get("scale",1));var s: float=sc*.65
   for v in [[-48,-24,0],[38,-6,.31],[-3,35,.67]]:
    var b:=atlas(body,"bubble.png",Vector2(v[0]*sc-48*s,v[1]*sc-64*s),Vector2.ONE*96*s,Vector2(8,8),64)
    var gas:=atlas(body,"poolGas.png",Vector2(v[0]*sc-64*s,v[1]*sc-112*s),Vector2.ONE*128*s,Vector2(4,4),16)
    rig.parts.append({"node":b,"gas":gas,"offset":v[2]})
 original.free();rigs.append(rig);return host
func wrap_boundary_tree(sprite: Sprite2D,row: Dictionary) -> Sprite2D:
 var host:=Sprite2D.new();host.position=sprite.position
 var body:=Node2D.new();host.add_child(body)
 sprite.get_parent().remove_child(sprite);sprite.position=Vector2.ZERO;body.add_child(sprite)
 # Child depth follows the existing host occlusion index; geometry remains source-owned.
 sprite.z_as_relative=true;sprite.z_index=0
 rigs.append({"host":host,"body":body,"o":{"x":host.position.x,"y":host.position.y},"id":"boundary_tree","foot":float(row.draw_size[0])*.45})
 return host
func rnd(row: Dictionary) -> float:
 row.seed=(int(row.seed)*1664525+1013904223)&0xffffffff;return float(row.seed)/4294967296
func render_at(now: float,view: Rect2) -> void:
 var draws: int=0
 for row in faces:
  var f: Dictionary=row.f;var s: Sprite2D=row.sprite
  s.visible=view.grow(90).has_point(Vector2(f.x+f.w*.5,f.y+f.h*.5)) and draws<24
  if not s.visible:continue
  draws+=1
  var dx: float=float(f.swayK)*(3.8*sin(now*.00055+f.stripY*.001+f.chunkMidX*.00025)+1.2*sin(now*.00031-f.stripY*.0007+f.chunkMidX*.00035)) if f.swayK>.03 else 0.0
  s.position=Vector2(f.x+dx,f.y);s.scale=Vector2(f.w,f.h)/s.texture.get_size();s.modulate.a=1
  if f.k=="e":
   if row.next==0:row.next=now+900+rnd(row)*4600
   if now>=row.next and row.blink<0:row.blink=now;row.next=now+(430 if rnd(row)<.14 else 2300+rnd(row)*4900)
   var a: float=0
   if row.blink>=0:
    var t: float=now-row.blink
    if t<110:a=t/110
    elif t<175:a=1
    elif t<300:a=1-(t-175)/125
    else:row.blink=-1
   s.modulate.a=a
  else:
   var p: float=.5+.5*sin(now*f.speed+f.phase)
   if f.k=="m":s.scale.y*=1-.07*p*p
   else:
    var scale_: float=1+.06*p*p;s.scale*=scale_;s.position-=Vector2(f.w,f.h)*(scale_-1)*.5
 for rig in rigs:
  var o: Dictionary=rig.o;var body: Node2D=rig.body;var id: String=rig.id
  if not view.grow(2000).has_point(Vector2(o.x,o.y)):continue
  if id=="boundary_tree":
   var wave: float=sin(now*.00072+o.x*.017+o.y*.011)+.3*sin(now*.00131+o.y*.019)
   body.rotation=wave*.018;body.position=Vector2(0,rig.foot)-Vector2(0,rig.foot).rotated(body.rotation)
  elif id=="m_c1tree":
   var wave: float=sin(now*.00072+o.x*.017+o.y*.011)+.3*sin(now*.00131+o.y*.019)
   var foot: float=float(rig.row.metadata.sz)*float(o.get("scale",1))*.2016
   body.rotation=wave*.009;body.position=Vector2(0,foot)-Vector2(0,foot).rotated(body.rotation)
   var phase: float=fposmod((now*.0008+o.x*.017+o.y*.011)/TAU,1)*8
   (rig.root.material as ShaderMaterial).set_shader_parameter("pose",floor(phase*16)/16)
   for part in rig.parts:part.node.rotation=sin(now*part.h.speed+part.h.phase)*part.h.amp
  elif id=="m_c1camp":
   for part in rig.parts:
    var p: float=fposmod(now/5200+part.h.index*.27,1);var grip: float=0
    if p>=.18 and p<.4:var t: float=(p-.18)/.22;grip=t*t*(3-2*t)
    elif p<.57 and p>=.4:grip=1
    elif p>=.57 and p<.84:var t: float=(p-.57)/.27;grip=1-t*t*(3-2*t)
    (part.node.material as ShaderMaterial).set_shader_parameter("pose",round(grip*92)/4)
  elif id=="m_c1gtoxicf":
   (rig.water.material as ShaderMaterial).set_shader_parameter("pose",fposmod(now/6400,1)*16)
   for part in rig.parts:(part.node.material as ShaderMaterial).set_shader_parameter("pose",fposmod(now/6400+part.offset,1)*64)
  elif id=="pit_poison":(rig.pit.material as ShaderMaterial).set_shader_parameter("pose",fposmod((now*.00095+o.x*.017+o.y*.011)/TAU,1)*16)
  elif id=="m_c1pool":
   var wave: float=sin(now*.00095+o.x*.017+o.y*.011);body.scale=Vector2(1+wave*.012,1-wave*.018)
   for part in rig.parts:
    var q: float=fposmod(now/6400+part.offset,1)
    (part.node.material as ShaderMaterial).set_shader_parameter("pose",q*64)
    (part.gas.material as ShaderMaterial).set_shader_parameter("pose",q*16)
  else:
   var wave: float=sin(now*.00105+o.x*.017+o.y*.011);body.scale=Vector2(1+wave*.018,1-wave*.012);body.position=Vector2(0,32)-Vector2(0,32)*body.scale
