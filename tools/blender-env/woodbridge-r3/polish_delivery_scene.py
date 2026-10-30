"""동일 납품 모듈로 물가 부유물·말뚝 반영과 실제 체적 빛기둥을 마감한다."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith(('검수_납품고목_부유물','검수_납품식생_부유낙엽','연속외곽_접합','전경_부패목질프레임','검수_실제체적빛기둥_','검수_체적달빛_')):bpy.data.objects.remove(o,do_unlink=True)
for i,(x,y,a,s)in enumerate([(-4,-2.8,15,.22),(-5,-.8,70,.15),(4,-3.8,15,.20),(8,-2,45,.15),(10,2,80,.23),(8,5,10,.15),(12,10,60,.20)]):
 src=bpy.data.objects['RF3_Fallen_Log'];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='검수_납품고목_부유물';o.location=(x,y,-.20);o.scale=(s,s*.55,.08);o.rotation_euler.z=math.radians(a);o.hide_render=False;o.hide_set(False)
for i,(x,y,a)in enumerate([(-5,-3,15),(9,-.5,60),(9,4,30),(13,9,45)]):
 src=bpy.data.objects['RF3_Withered_Shrub'];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='검수_납품식생_부유낙엽';o.location=(x,y,-.066);o.scale=(.42,.42,.035);o.rotation_euler.z=math.radians(a);o.hide_render=False;o.hide_set(False)
water=bpy.data.materials['독액_기준대리물_비납품'];bs=next(n for n in water.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.27
def place(id,pos,sc,yaw=0,name='연속외곽_접합'):
 src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name=name;o.location=pos;o.scale=(sc,)*3 if isinstance(sc,(float,int))else sc;o.rotation_euler.z=math.radians(yaw);o.hide_render=False;o.hide_set(False);return o
# 왼쪽 중경의 빈 구멍을 연속 목질 질량으로 잇고 오른쪽에는 강의 먼 깊이를 남긴다.
place('RF3_Ancient_Tree_B',(-10,7,.45),.80,65)
place('RF3_Fallen_Log',(-10,5,.3),1.25,35)
place('RF3_Root_Stump',(13,5,-.42),.53,90)
place('RF3_Root_Stump',(14,16,-.48),.45,150)
place('RF3_Fallen_Log',(13,-5,-.20),(1.65,1.45,1.45),130,'전경_부패목질프레임')
for x,y,z,sc,a in [(-10,5,1.6,1.1,20),(-8.8,6.5,2,.9,140),(12,-5,1.1,1.1,60),(14,-3,1.7,.8,130),(12,4,.8,.6,30)]:place('RF3_Hanging_Moss',(x,y,z),sc,a)
for x,y,sc,a in [(-9,6,1.5,10),(-11,6,1.4,90),(-8,8,1.4,0),(9,-6,1.2,15),(10,-7,1.3,45),(12,-4,1.2,80),(8,10,1.2,40)]:place('RF3_Withered_Shrub',(x,y,.5 if x<0 else .03),sc,a)
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
for i,(start,end,power)in enumerate([((-1,20,22),(-3.5,7,0),85000),((-7,13,20),(-8,2,0),55000)]):
 a,b=Vector(start),Vector(end);v=b-a;bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=1.6,radius2=.22,depth=v.length,location=(a+b)*.5);o=bpy.context.object;o.name='검수_실제체적빛기둥_'+str(i);o.rotation_euler=(-v).to_track_quat('Z','Y').to_euler();m=bpy.data.materials.new(o.name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();sc=n.new('ShaderNodeVolumeScatter');sc.inputs['Color'].default_value=(.59,.72,.88,1);sc.inputs['Density'].default_value=.035;sc.inputs['Anisotropy'].default_value=.25;out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(sc.outputs[0],out.inputs['Volume']);o.data.materials.append(m)
 d=bpy.data.lights.new('검수_체적달빛_'+str(i),'SPOT');d.energy=power;d.color=(.66,.79,1);d.spot_size=.16;d.spot_blend=.65;o=bpy.data.objects.new(d.name,d);S.collection.objects.link(o);o.location=a;aim(o,b)
S.cycles.samples=96;S.render.resolution_percentage=100
placements=[]
ids=[r['id']for r in json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'))]
meshes={bpy.data.objects[id].data:id for id in ids}
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in meshes:placements.append({'id':meshes[o.data],'이름':o.name,'BlenderXYZ':list(o.location),'회전XYZ':list(o.rotation_euler),'scale':list(o.scale)})
(R/'source/조립-납품모듈배치.json').write_text(json.dumps({'범위':'동일 납품 모듈의 Blender 정적 배치. Unity게임/충돌 적용 아님','프록시':'독액 표면·불·체적안개/빛기둥은 Blender 검수 전용','카메라XYZ':list(S.camera.location),'배치':placements},ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('부유물·식생·체적빛 조립 마감',len(placements),flush=True)
