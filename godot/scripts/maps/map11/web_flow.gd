extends RefCounted
## game.html 31744-31785,31847-31908: 40px eight-neighbor BFS; same tie order.
const DX=[1,-1,0,0,1,-1,1,-1]
const DY=[0,0,1,-1,1,1,-1,-1]
var tiles: Array
var distance:=PackedInt32Array()
var queue:=PackedInt32Array()
var target:=Vector2.ZERO
var target_cell:=Vector2i(-1,-1)
func configure(map_data: Dictionary) -> void:
 tiles=map_data.tiles;distance.resize(40000);queue.resize(40000);distance.fill(-1)
func prepare(point: Vector2) -> void:
 target=point
 var cell:=Vector2i(int(point.x/40),int(point.y/40))
 if cell==target_cell:return
 target_cell=cell;distance.fill(-1)
 if cell.x<0 or cell.y<0 or cell.x>=200 or cell.y>=200:return
 var head: int=0;var tail: int=1
 var first: int=cell.y*200+cell.x;queue[0]=first;distance[first]=0
 while head<tail:
  var index: int=queue[head];head+=1
  var x: int=index%200;var y: int=index/200
  for i in range(8):
   var xx: int=x+DX[i];var yy: int=y+DY[i]
   if xx<0 or yy<0 or xx>=200 or yy>=200:continue
   var ni: int=yy*200+xx
   if distance[ni]>=0 or int(tiles[ni])==1:continue
   if i>=4 and (int(tiles[y*200+xx])==1 or int(tiles[yy*200+x])==1):continue
   distance[ni]=distance[index]+1;queue[tail]=ni;tail+=1
func direction(point: Vector2) -> Vector2:
 var x: int=int(point.x/40);var y: int=int(point.y/40)
 if x<0 or y<0 or x>=200 or y>=200:return Vector2.ZERO
 var best: int=distance[y*200+x]
 if best<0:return Vector2.ZERO
 if best==0:return (target-Vector2(x*40+20,y*40+20)).normalized()
 var bx: int=0;var by: int=0
 for i in range(8):
  var xx: int=x+DX[i];var yy: int=y+DY[i]
  if xx<0 or yy<0 or xx>=200 or yy>=200:continue
  var d: int=distance[yy*200+xx]
  if d>=0 and d<best:best=d;bx=DX[i];by=DY[i]
 return Vector2(bx,by).normalized()
