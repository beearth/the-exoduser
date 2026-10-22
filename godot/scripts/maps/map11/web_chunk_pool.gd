extends Node2D
## Source CH1 production/sway/boundary layers. Decode once at setup; fixed GPU slots.
## No resource loading, directory/reflection API, new nodes/images/textures in advance().
const SIDE := 5 # logical viewport 1920x1080: at most 3 visible columns/rows + one ring
var images: Array[Image]=[]
var ground: Array[Sprite2D]=[]
var sway: Array[Sprite2D]=[]
var edge: Array[Sprite2D]=[]
var textures: Array[ImageTexture]=[]
var owners:=PackedInt32Array()
var wanted:=PackedByteArray()
var visible_cells:=PackedByteArray()
var upload_count:=0
var upload_max_us:=0
var resident_bytes:=0
var _empty_sway: Image
func prepare(parent: Node2D,_rows: Array) -> void:
 var folder: String="chunks_gpu_bc7" if OS.get_name()=="Windows" else "chunks_gpu"
 _empty_sway=load("res://assets/map/web_parity/"+folder+"/blank_sway.res")
 owners.resize(25);owners.fill(-1);wanted.resize(64);visible_cells.resize(64)
 for i in range(64):
  var x: int=i%8;var y: int=i/8
  for layer in range(3):
   var path: String="res://assets/map/web_parity/"+folder+("/%d_%d_%d.res"%[x,y,layer])
   var image: Image
   if layer==1 and not FileAccess.file_exists(path):image=_empty_sway
   else:image=load(path)
   images.append(image)
  var g:=Sprite2D.new();g.region_enabled=true;g.region_rect=Rect2(1,1,1334,1334);g.centered=false;g.scale=Vector2.ONE*(1000.0/1334);g.z_index=-3000;g.position=Vector2(x*1000,y*1000);g.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR;parent.add_child(g);ground.append(g)
  var s:=Sprite2D.new();s.centered=false;s.scale=Vector2.ONE*(1000.0/1024);s.z_index=-2950;s.position=g.position;s.texture_filter=CanvasItem.TEXTURE_FILTER_LINEAR
  var mat:=ShaderMaterial.new();mat.shader=preload("res://scripts/maps/map11/web_sway.gdshader");mat.set_shader_parameter("world_x",float(x*1000));mat.set_shader_parameter("world_y",float(y*1000));s.material=mat;parent.add_child(s);sway.append(s)
  var e:=Sprite2D.new();e.centered=false;e.z_index=-2800;e.position=g.position;parent.add_child(e);edge.append(e)
 # Fixed storage, allocated before gameplay. BC7 (Windows) / S3TC (Mac GL4.1) images compressed offline; no runtime encoding or PNG decode.
 for slot in range(25):
  for layer in range(3):
   var tex:=ImageTexture.create_from_image(images[layer]);textures.append(tex)
   resident_bytes+=images[layer].get_data_size()
 advance(Vector2(4020,7420),Vector2(1920,1080),true)
func advance(center: Vector2,size: Vector2,settle: bool=false) -> void:
 wanted.fill(0);visible_cells.fill(0)
 var x0: int=clampi(floori((center.x-size.x*.5)/1000),0,7)
 var x1: int=clampi(floori((center.x+size.x*.5)/1000),0,7)
 var y0: int=clampi(floori((center.y-size.y*.5)/1000),0,7)
 var y1: int=clampi(floori((center.y+size.y*.5)/1000),0,7)
 for y in range(maxi(0,y0-1),mini(7,y1+1)+1):
  for x in range(maxi(0,x0-1),mini(7,x1+1)+1):
   wanted[y*8+x]=1
   if x>=x0 and x<=x1 and y>=y0 and y<=y1:visible_cells[y*8+x]=1
 # Evict references immediately; retained fixed backing slots are overwritten before reuse.
 for i in range(64):
  if wanted[i]==0:
   ground[i].texture=null;sway[i].texture=null;edge[i].texture=null
 for pass_ in range(2):
  for i in range(64):
   if wanted[i]==0 or (visible_cells[i]==0)!=(pass_==1):continue
   var slot: int=(i%8)%SIDE+((i/8)%SIDE)*SIDE
   if owners[slot]==i:
    ground[i].texture=textures[slot*3];sway[i].texture=textures[slot*3+1];edge[i].texture=textures[slot*3+2];continue
   var before: int=Time.get_ticks_usec()
   var old: int=owners[slot]
   if old>=0:ground[old].texture=null;sway[old].texture=null;edge[old].texture=null
   for layer in range(3):textures[slot*3+layer].update(images[i*3+layer])
   ground[i].texture=textures[slot*3];sway[i].texture=textures[slot*3+1];edge[i].texture=textures[slot*3+2]
   owners[slot]=i;upload_count+=1;upload_max_us=maxi(upload_max_us,Time.get_ticks_usec()-before)
   if not settle:return # one predecoded chunk triplet per visual update, ring prepared before entry
 # Reattach unchanged resident slots that were outside a previous view.
 for i in range(64):
  if wanted[i]==0:continue
  var slot: int=(i%8)%SIDE+((i/8)%SIDE)*SIDE
  if owners[slot]==i:
   ground[i].texture=textures[slot*3];sway[i].texture=textures[slot*3+1];edge[i].texture=textures[slot*3+2]
func render_at(now: float) -> void:
 for i in range(64):
  if sway[i].texture!=null:(sway[i].material as ShaderMaterial).set_shader_parameter("clock_ms",now)
