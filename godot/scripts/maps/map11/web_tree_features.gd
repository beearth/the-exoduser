extends Node2D
## ch1-rot-trees.js 60-71,308-329: original atlas patches and feature timing.
var rows: Array[Dictionary]=[]
var tree: Dictionary
var seed_state: int
func rnd() -> float:
 seed_state=(seed_state*1664525+1013904223)&0xffffffff
 return float(seed_state)/4294967296.0
func configure(data: Dictionary) -> void:
 tree=data
 seed_state=((int(tree.idx)+1)*2654435761)&0xffffffff
 if seed_state==0:seed_state=1
 for i in range(tree.feats.size()*2+2):rnd()
 for f in tree.feats:
  if not f.get("texture") or float(f.pw)<=0:continue
  var sprite:=Sprite2D.new();sprite.texture=load(f.texture);sprite.centered=false;sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  add_child(sprite);rows.append({"sprite":sprite,"f":f,"next":0.0,"blink":-1.0})
func render_at(now: float) -> void:
 var h: float=float(tree.anchorY)-float(tree.y)
 var gust: float=.62+.38*sin(now*.00021+float(tree.x)*.00042)*sin(now*.000083+1.3)
 var amplitude: float=minf(11,2.6+.0055*float(tree.h))*gust
 for row in rows:
  var f: Dictionary=row.f;var sprite: Sprite2D=row.sprite
  var s: float=clampf((h-float(f.cy)*float(tree.k))/h,0,1)
  var dx: float=amplitude*(pow(s,1.7)*sin(now*.00105+float(tree.phase)+float(tree.x)*.0006)+.32*sin(now*.0029+float(tree.phase2))*pow(s,2.4))
  sprite.position=Vector2(float(f.px)+dx/float(tree.k),float(f.py));sprite.scale=Vector2.ONE;sprite.modulate.a=1
  if f.k=="e":
   if row.next==0:row.next=now+600+rnd()*5200
   if now>=row.next and row.blink<0:row.blink=now;row.next=now+(380 if rnd()<.16 else 1900+rnd()*5200)
   var a: float=0
   if row.blink>=0:
    var t: float=now-float(row.blink)
    if t<100:a=t/100
    elif t<170:a=1
    elif t<290:a=1-(t-170)/120
    else:row.blink=-1
   sprite.modulate.a=a
  elif f.k=="m":
   var p: float=.5+.5*sin(now*float(f.speed)+float(f.phase));sprite.scale.y=1-.07*p*p
  else:
   var p: float=.5+.5*sin(now*float(f.speed)+float(f.phase));var scale_: float=1+.06*p*p
   sprite.scale=Vector2.ONE*scale_;sprite.position-=Vector2(float(f.pw),float(f.ph))*(scale_-1)*.5
