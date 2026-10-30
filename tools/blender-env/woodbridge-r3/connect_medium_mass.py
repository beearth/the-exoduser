"""기존 납품 스캔으로 중경 강둑의 목질/이끼 질량을 연결. 모듈 바이트 변경 없음."""
import bpy,math,json,random,shutil
from pathlib import Path
from mathutils import Vector,Euler
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');src=R/'source/승인구도_납품동일.blend'
if not (R/'source/중경연결_이전.blend').exists():shutil.copyfile(src,R/'source/중경연결_이전.blend')
bpy.ops.wm.open_mainfile(filepath=str(src));S=bpy.context.scene;rng=random.Random(103032);added=[]
for o in list(S.objects):
 if o.name.startswith('중경연결_'):bpy.data.objects.remove(o,do_unlink=True)
def obj(id,p,sc,rot=(0,0,0),tag=''):
 s=bpy.data.objects[id];o=s.copy();o.data=s.data;S.collection.objects.link(o);o.name='중경연결_'+tag+'_'+id;o.rotation_mode='XYZ';o.rotation_euler=rot;o.location=p;o.scale=sc;o.hide_render=False;o.hide_set(False);added.append(o);return o
def bvh(o):
 bpy.context.view_layer.update();return BVHTree.FromPolygons([o.matrix_world@v.co for v in o.data.vertices],[tuple(f.vertices)for f in o.data.polygons])
top=max(v.co.z for v in bpy.data.objects['RF3_Hanging_Moss'].data.vertices)
def drape(p,n,sc,tag):
 rot=Euler((-.36,0,math.atan2(n.y,n.x)+math.pi/2+rng.uniform(-.2,.2)),'XYZ');p=p+Vector((n.x*.10,n.y*.10,0))-rot.to_matrix()@Vector((0,0,top*sc[2]));return obj('RF3_Hanging_Moss',p,sc,rot,tag)
# 카메라를 향한 실제 나무 표면에 중심부터 주변까지 연속하는 넓은 실물 잎 다발.
for name,levels in [('배치_RF3_Ancient_Tree_A',[2.4,3.8,5.2,6.8,8.4]),('배치_RF3_Ancient_Tree_B',[2.1,3.6,5.3]),('중경복귀_실제거목',[2.0,3.4,4.8]),('원화전경_RF3_Ancient_Tree_B',[2.1,3.8,5.6]),('배치_RF3_Root_Stump',[1.35,1.85])]:
 t=bpy.data.objects[name];b=bvh(t);a0=math.atan2(S.camera.location.y-t.location.y,S.camera.location.x-t.location.x)
 for k,z in enumerate(levels):
  for j in range(5 if 'Stump'not in name else 4):
   a=a0+(j-2)*.29+rng.uniform(-.10,.10);d=Vector((math.cos(a),math.sin(a),0));c=Vector((t.location.x,t.location.y,z+rng.uniform(-.18,.18)));hit,n,ix,dist=b.ray_cast(c+d*12,-d,24)
   if hit is not None:
    scale=rng.uniform(.73,1.02) if 'Stump'not in name else rng.uniform(.50,.68);drape(hit,n,(scale,scale,scale*rng.uniform(.8,1.15)),name)
# 강둑 전면의 직선 흙 절단을 기존 실제 파단 목질과 처진 잎으로 연결한다.
terrain=bpy.data.objects['배치_RF3_Continuous_Bank_Terrain'];ground=bvh(terrain)
for x in [-10.5,-8,-5.7,-3.6,3.5,5.4,7.3,9.3]:
 y=5.8+.5*math.sin(x*.4);hit,n,ix,dist=ground.ray_cast(Vector((x,y+.45,12)),Vector((0,0,-1)),24)
 if hit is None:continue
 z=hit.z;wood=obj('RF3_Fallen_Log',(x,y+.22,z-.16),(rng.uniform(.38,.58),.22,.38),(0,rng.uniform(-.06,.06),rng.uniform(-.24,.24)),'북강둑_파단목질');w=bvh(wood)
 for j in range(4):
  xx=x+(j-1.5)*.43;p,no,ix,dist=w.ray_cast(Vector((xx,y-5,z+.25)),Vector((0,1,0)),10)
  if p is not None:drape(p,no,(.49,.45,rng.uniform(.25,.40)),'북강둑_처진이끼')
# 물속에 고립된 그루터기와 북/남 강둑 사이의 실제 긴 목질 접합. 수면 바로 위/아래.
for x,y,yaw,sx,sy,z in [(6.25,3.4,1.15,.92,.38,-.12),(7.0,1.7,.48,.64,.33,-.18),(-5.4,-5.3,-.28,.7,.32,.31),(-6.8,-5.8,.65,.62,.29,.22)]:
 w=obj('RF3_Fallen_Log',(x,y,z),(sx,sy,.35),(0,0,yaw),'침수뿌리');b=bvh(w)
 for j in range(4):
  xx=x+rng.uniform(-1.25,1.25);yy=y+rng.uniform(-.45,.45);hit,n,ix,dist=b.ray_cast(Vector((xx,yy,8)),Vector((0,0,-1)),16)
  if hit is not None:
   obj('RF3_Moss_Cushion',hit-Vector((0,0,.06)),(.6,.55,.5),(0,0,rng.uniform(0,6.28)),'목질상부_실물이끼')
   if j%2==0:drape(hit,Vector((.4,-.9,0)),(.42,.4,.30),'목질_드레이프')
# 통행 중앙은 비워두고 다리의 바깥 난간/말뚝에 작은 자연스러운 이끼.
for side in [-1,1]:
 for j,y in enumerate([-4.4,-2.1,.3,2.9,4.6]):
  drape(Vector((side*1.69,y,.80+.12*math.sin(y))),Vector((side,0,0)),(.28,.28,.32 if j%2 else .43),'다리외측')
# 그루터기 상단의 건조한 평면은 식생 군락으로 덮되 실제 스캔 균열은 남긴다.
st=bpy.data.objects['배치_RF3_Root_Stump'];b=bvh(st)
for j in range(18):
 a=j*2.399;rr=.3+1.4*math.sqrt((j+.5)/18);x=st.location.x+rr*math.cos(a);y=st.location.y+rr*math.sin(a);hit,n,ix,dist=b.ray_cast(Vector((x,y,6)),Vector((0,0,-1)),12)
 if hit is not None and hit.z>.3:obj('RF3_Moss_Cushion',hit-Vector((0,0,.055)),(.48,.44,.42),(0,0,a),'그루터기상부')
(R/'source/중경연결-실제배치.json').write_text(json.dumps({'새인스턴스':len(added),'모듈변경':0,'설명':'같은 납품 스캔의 실제 표면 Ray 부착. 나무 앞면·강둑 전면·침수뿌리·다리 외측을 연속 목질과 실물 잎으로 연결. 게임 경로/성능 미검증.','배치':[{'이름':o.name,'위치':list(o.location),'배율':list(o.scale)}for o in added]},ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(src));S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.resolution_percentage=55;S.cycles.samples=32;S.render.filepath=str(R/'renders/중경연결_검수.png');bpy.ops.render.render(write_still=True);print('중경 강둑 실제 연결',len(added),flush=True)
