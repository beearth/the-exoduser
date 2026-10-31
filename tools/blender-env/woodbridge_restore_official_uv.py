"""보존된 레이어 이름을 믿지 않고 공식 glTF의 UV를 실제 목질 표면으로 다시 투영한다."""
import bpy,bmesh,json,hashlib,array
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
from mathutils.geometry import barycentric_transform
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
if (R/'source/공식원본UV복구완료.json').exists():print('공식 원본 UV 복구 이미 완료',flush=True);raise SystemExit(0)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10;before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'pbr-source/island_tree_01/island_tree_01.gltf'));bpy.context.view_layer.update();imported=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];rawpoints=[];rawuv=[]
for o in imported:
 body={i for i,m in enumerate(o.data.materials) if m and 'island_tree_01' in m.name and not any(x in m.name for x in ['leaves','branches'])};layer=next((u for u in o.data.uv_layers if u.active_render),o.data.uv_layers[0]);o.data.calc_loop_triangles()
 for tri in o.data.loop_triangles:
  if tri.material_index not in body:continue
  rawpoints.extend(o.matrix_world@o.data.vertices[i].co for i in tri.vertices);rawuv.extend(Vector((*layer.data[i].uv,0)) for i in tri.loops)
assert len(rawpoints)>30000,'공식 목질 선택 실패';mn=Vector([min(p[k] for p in rawpoints) for k in range(3)]);mx=Vector([max(p[k] for p in rawpoints) for k in range(3)]);root=[p for p in rawpoints if p.z<mn.z+(mx.z-mn.z)*.04];c=Vector([(min(p[k] for p in root)+max(p[k] for p in root))*.5 for k in range(3)]);c.z=mn.z;scale=24/(mx.z-mn.z);native=[]
for p in rawpoints:q=(p-c)*scale;q.x*=.9;q.y*=.9;native.append(q)
print('공식 목질 UV',len(rawuv),'루프·범위',[(min(p[k] for p in rawuv),max(p[k] for p in rawuv)) for k in [0,1]],flush=True)
def digest(o,name):return hashlib.sha256(array.array('f',[c for u in o.data.uv_layers[name].data for c in u.uv]).tobytes()).hexdigest()
proof=[];prepared=[]
for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump']:
 high=bpy.data.objects[id+'_High'];ps=[]
 for p in native:
  q=p.copy()
  if id=='RF_Gnarled_Split_Trunk':q.x=-q.x;q.y*=.88;q.z*=.9
  elif id=='RF_Fractured_Stump':q.x*=1.18;q.y*=1.18;q.z-=.08
  q.z-=.35;ps.append(q)
 tris=[(i,i+1,i+2) for i in range(0,len(ps),3)];tree=BVHTree.FromPolygons(ps,tris,all_triangles=True);uv=high.data.uv_layers.get('원본목질UV') or high.data.uv_layers.new(name='원본목질UV');old=digest(high,uv.name);maximum=0;count=0;coords=[v.co.copy() for v in high.data.vertices];loop_vertex=[l.vertex_index for l in high.data.loops];flat=array.array('f',[0.0])*(len(uv.data)*2);uv.data.foreach_get('uv',flat)
 for fi,f in enumerate(high.data.polygons):
  if f.material_index!=0:continue
  center=sum((coords[i] for i in f.vertices),Vector())/len(f.vertices);hit,n,index,d=tree.find_nearest(center);maximum=max(maximum,d);tri=tris[index]
  for li in f.loop_indices:
   p=coords[loop_vertex[li]];tex=barycentric_transform(p,ps[tri[0]],ps[tri[1]],ps[tri[2]],rawuv[tri[0]],rawuv[tri[1]],rawuv[tri[2]]);flat[li*2]=max(0,min(1,tex.x));flat[li*2+1]=max(0,min(1,tex.y));count+=1
  if fi%5000==0:print('공식 UV 표면 대조 진행',id,fi,len(high.data.polygons),flush=True)
 uv.data.foreach_set('uv',flat);high.data.update()
 mat=high.data.materials[0].copy();high.data.materials[0]=mat;n=mat.node_tree.nodes;l=mat.node_tree.links;uvnode=n.new('ShaderNodeUVMap');uvnode.uv_map=uv.name
 for tx in n:
  if tx.type=='TEX_IMAGE':l.new(uvnode.outputs[0],tx.inputs['Vector'])
  if tx.type=='NORMAL_MAP':tx.uv_map=uv.name
 proof.append({'id':id,'공식표면대조루프':count,'표면최대거리m':maximum,'이전UV_SHA256':old,'복구UV_SHA256':digest(high,uv.name)});prepared.append((id,bpy.data.objects[id],high));print('공식 원본 표면UV 복구',proof[-1],flush=True)
for o in imported:bpy.data.objects.remove(o,do_unlink=True)
def select(obs,active=None):
 for o in bpy.context.view_layer.objects:o.select_set(False)
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));code=Path(__file__).with_name('woodbridge_natural_roots.py').read_text(encoding='utf8');code=code[code.index('for id,low,high in prepared:'):];code=code.replace("'큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'","'공식 glTF 원본 표면UV 복구·실제 CC0 목질/공동/파단'").replace('기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치','공식 원본 glTF UV를 실제 목질 표면에서 대조/재투영하고 새 게임UV로6맵 베이크. 레이어 이름/활성값만 신뢰하지 않음');exec(compile(code,str(Path(__file__)),'exec'))
for row,(_,_,hi) in zip(proof,prepared):row['베이크후UV_SHA256']=digest(hi,'원본목질UV');assert row['복구UV_SHA256']==row['베이크후UV_SHA256'],'복구 UV가 편집됨'
(R/'source/공식원본UV복구완료.json').write_text(json.dumps({'공식파일':str(R/'pbr-source/island_tree_01/island_tree_01.gltf'),'파일SHA256':hashlib.sha256((R/'pbr-source/island_tree_01/island_tree_01.gltf').read_bytes()).hexdigest(),'표면UV':proof},ensure_ascii=False,indent=2),encoding='utf8')
