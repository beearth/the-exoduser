"""원화의 물가 반영·완만한 흐름·전면 처진 이끼·큰 목질 접합을 조립에 반영."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('표면마감_'):bpy.data.objects.remove(o,do_unlink=True)
water=bpy.data.materials['독액_기준대리물_비납품'];n=water.node_tree.nodes;l=water.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.19;coord=n.new('ShaderNodeNewGeometry');mp=n.new('ShaderNodeVectorMath');mp.operation='MULTIPLY';mp.inputs[1].default_value=(1.6,.34,1);l.new(coord.outputs['Position'],mp.inputs[0]);wave=n.new('ShaderNodeTexNoise');wave.inputs['Scale'].default_value=2.;wave.inputs['Detail'].default_value=1.4;wave.inputs['Roughness'].default_value=.4;l.new(mp.outputs[0],wave.inputs[0]);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.28;bump.inputs['Distance'].default_value=.027;l.new(wave.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
foam=bpy.data.materials.get('검수_유기거품막')
if foam:
 f=next(q for q in foam.node_tree.nodes if q.type=='BSDF_PRINCIPLED');f.inputs['Base Color'].default_value=(.22,.23,.095,1)
terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'];bvh=BVHTree.FromPolygons([v.co for v in terrain.data.vertices],[tuple(f.vertices)for f in terrain.data.polygons])
def ground(x,y):
 h,n,ix,d=bvh.ray_cast(Vector((x,y,20)),Vector((0,0,-1)),40);return h.z if h else -1
def put(id,pos,sc,rot):
 src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='표면마감_'+id;o.location=pos;o.scale=sc;o.rotation_euler=rot;o.hide_render=False;o.hide_set(False);return o
# 실제 파단 스캔 목질을 뿌리 크기로 사용. 진입축과 판자 위는 비운다.
for j in range(24):
 x=(-13+j*.98);y=(-7.2 if j%2==0 else 6.6)+.5*math.sin(j*1.7)
 if abs(x)<2.8:continue
 z=ground(x,y)
 if z<-.03:continue
 a=j*1.618;put('RF3_Fallen_Log',(x,y,z-.07),(.17+.055*(j%3),.11,.11),(0,.06*math.sin(j),a))
# 가까운 고목의 매끈한 접합부를 부러진 실물 목질로 잇는다.
for i,(p,sc,rot)in enumerate([((-7,-5.7,1.3),(.62,.28,.30),(.1,-1.18,.3)),((-8.1,-5.3,1.1),(.48,.25,.25),(-.05,-1.1,-.4)),((5.8,.0,-.07),(.30,.18,.18),(0,-.8,.4))]):put('RF3_Fallen_Log',p,sc,rot)
# 평면에 박힌 잎처럼 보이지 않도록 전면 다발을 실제 표면에서 약간 떨어뜨린다.
wood={bpy.data.objects['RF3_'+t].data for t in ['Ancient_Tree_A','Ancient_Tree_B','Root_Stump','Fallen_Log','Rotten_Wood_Bridge']};vs=[];fs=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wood:
  a=len(vs);vs.extend(o.matrix_world@v.co for v in o.data.vertices);fs.extend(tuple(a+i for i in f.vertices)for f in o.data.polygons)
woodbvh=BVHTree.FromPolygons(vs,fs);moss=bpy.data.objects['RF3_Hanging_Moss'];top=max(v.co.z for v in moss.data.vertices)
for o in S.objects:
 if o.name.startswith('원화밀도_RF3_Hanging_Moss'):
  anchor=o.matrix_world@Vector((0,0,top));hit,no,ix,d=woodbvh.find_nearest(anchor)
  if hit:o.location+=hit-anchor+Vector((no.x*.24,no.y*.24,0))
# 다리 위의 난간 접점에서만 이끼가 아래로 드리우게 한다.
for j,(x,y)in enumerate([(-1.45,-3),(-1.45,1.7),(1.45,-1.4),(1.45,3.7)]):
 q=put('RF3_Hanging_Moss',(x,y,.1),(.52,.52,.62),(0,0,0 if x<0 else math.pi));q.location.z=1.65-top*q.scale.z
# 기존 실제 산란 체적의 위치를 원화처럼 좌측 전경과 중경 사이로 옮긴다.
a=Vector((-5,2,20));b=Vector((-4,-3,0));v=b-a
o=bpy.data.objects.get('검수_실제체적빛기둥_0')
if o:o.location=(a+b)*.5;o.rotation_euler=(-v).to_track_quat('Z','Y').to_euler();o.scale.z=v.length/26.2
o=bpy.data.objects.get('검수_체적달빛_0')
if o:o.location=a;o.rotation_euler=(b-a).to_track_quat('-Z','Y').to_euler();o.data.energy=44000;o.data.spot_blend=1
S.render.resolution_percentage=50;S.cycles.samples=24;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/강가_목질_이끼마감.png');bpy.ops.render.render(write_still=True)
