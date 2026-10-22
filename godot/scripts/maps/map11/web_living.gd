extends Node2D
## Original browser builders, ch1-living-detail.js:4-15,312-367,406-528.
## Visual nodes only: no geometry, spawn, camera or gameplay state writes.
var _rows: Array[Dictionary]=[]
var _moat_glow: Sprite2D
var _vents: Array[Dictionary]=[]
var _seed: int=77123
func _ready() -> void:
 var source: Dictionary=JSON.parse_string(FileAccess.get_file_as_string("res://assets/map/web_parity/living/source.json"))
 for row in source.regions:
  var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/web_parity/living/region%d.png"%row.variant)
  sprite.centered=false;sprite.position=Vector2(row.x,row.y);sprite.z_index=-2779;add_child(sprite)
 for row in source.shadows:
  var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/web_parity/living/"+row.name)
  sprite.centered=false;sprite.position=Vector2(row.x,row.y);sprite.z_index=-2790;add_child(sprite)
 # game.html 26812-26823 and ch1-altar-moat.js 8-145: original cached surfaces.
 for name in ["hill","moat","moatGlow"]:
  var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/web_parity/living/"+name+".png")
  sprite.centered=false;sprite.position=Vector2(4930,3440);sprite.z_index=-2850 if name=="hill" else -2849
  if name=="moatGlow":sprite.scale=Vector2(2,2);_moat_glow=sprite
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(sprite)
 for i in 22:
  var angle: float=(i+_random()*.8)/22*TAU
  var d: float=.94+(_random()-.5)*.07
  var point:=Vector2(950+720*d*cos(angle),480+360*d*sin(angle))
  var bridge_t: float=clampf((point.x-70)/400,0,1)
  if point.x>=44 and point.x<=496 and absf(point.y-480)<=lerpf(72,120,bridge_t)+26:continue
  var period: float=2300+_random()*2600;var phase: float=_random();var size: float=6+_random()*7
  var sprite:=Sprite2D.new();sprite.texture=load("res://assets/map/web_parity/living/moatBubble.png");sprite.z_index=-2848
  sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(sprite)
  _vents.append({"sprite":sprite,"point":point+Vector2(4930,3440),"period":period,"phase":phase,"size":size})
 var objects: Array=source.objects.duplicate()
 for a in [[91,181,-.3],[114,177,.5],[87,155,.7],[122,148,-.5],[79,124,.2],[119,114,-.8],[85,96,.4],[126,81,-.6],[91,62,.5],[116,47,-.2],[97,27,.8]]:
  objects.append({"type":"tissue_bed","x":(a[0]+.5)*40,"y":(a[1]+.5)*40,"angle":a[2]})
 var kinds: Dictionary={"m_c1tree":2.1,"m_c1cocoon":1.1,"m_c1pool":1.25,"m_c1spod":.65,"m_c1sroot":.75,"pit_poison":1.2,"tissue_bed":1.8}
 var feet: Dictionary={"m_c1tree":230,"m_c1cocoon":100,"m_c1spod":40}
 for o in objects:
  if not kinds.has(o.type):continue
  var wet: bool=o.type in ["m_c1pool","pit_poison"]
  var secretion: bool=o.type in ["m_c1cocoon","m_c1spod"]
  var scale_value: float=float(o.get("scale",1))
  var size: float=float(kinds[o.type])*minf(1.6,scale_value)
  for surface in [false,true]:
   if surface and not wet and not secretion:continue
   # Dedicated original pit()/poolSurface() are separate builders, not generic membranes.
   if surface and ((o.type=="pit_poison" and o.x==6500 and o.y==5580) or (o.type=="m_c1pool" and o.x==6700 and o.y==1740)):continue
   var variant: int=absi(int(floor(o.x/40))*7+int(floor(o.y/40))*11)%3
   var name: String=("surfaceWet" if wet else "surfaceDry") if surface else ("wet" if wet else "dry%d"%variant)
   var texture: Texture2D=load("res://assets/map/web_parity/living/"+name+".png")
   var sprites: Array[Sprite2D]=[]
   for i in 2:
    var sprite:=Sprite2D.new();sprite.texture=texture;sprite.region_enabled=true;sprite.region_rect=Rect2(0,0,320,320)
    sprite.position=Vector2(o.x,o.y+(0 if surface and wet else float(feet.get(o.type,0))*scale_value))
    sprite.scale=Vector2.ONE*size;sprite.rotation=float(o.get("angle",0));sprite.z_index=-2499 if surface else -2778
    sprite.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;add_child(sprite);sprites.append(sprite)
   _rows.append({"sprites":sprites,"x":float(o.x),"y":float(o.y)})
 render_at(0)
func _random() -> float:
 _seed=(_seed*1664525+1013904223)&0xffffffff
 return float(_seed)/4294967296.0
func render_at(now: float) -> void:
 if is_instance_valid(_moat_glow):_moat_glow.modulate.a=.07+.03*sin(now*.0017)+.015*sin(now*.0041+1.7)
 for vent in _vents:
  var sprite: Sprite2D=vent.sprite
  var t: float=fposmod(now/vent.period+vent.phase,1)
  sprite.visible=t<=.7
  if not sprite.visible:continue
  var k: float=t/.7;var pop: float=(k-.86)/.14 if k>.86 else 0.0
  var size: float=vent.size*(.35+.65*minf(1,k/.6))*(1+pop*.9)
  sprite.scale=Vector2.ONE*size/32;sprite.position=vent.point-Vector2(0,k*3)
  sprite.modulate.a=minf(1,k/.18)*(1-pop)*.8
 for row in _rows:
  var phase: float=fposmod((now*.00095+row.x*.017+row.y*.011)/TAU,1)*16
  var frame: int=int(floor(phase));var mix_value: float=phase-frame
  for i in 2:
   var sprite: Sprite2D=row.sprites[i];var f: int=(frame+i)%16
   sprite.region_rect=Rect2((f%4)*320,(f/4)*320,320,320)
   sprite.modulate.a=mix_value if i==1 else 1-mix_value
