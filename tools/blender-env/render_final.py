import bpy, math, json,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
S=bpy.context.scene;S.cycles.samples=24;S.render.threads_mode='FIXED';S.render.threads=12
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
only=set(sys.argv[sys.argv.index('--only')+1:]) if '--only' in sys.argv else None
for o in S.objects:
 if o.type=='MESH':o.hide_render=True
for im in bpy.data.images:
 if im.filepath and Path(bpy.path.abspath(im.filepath)).exists():
  im.source='FILE';im.reload()
floor=bpy.data.objects['검수용바닥'];floor.hide_render=False
cam=S.camera
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
S.render.resolution_x=1600;S.render.resolution_y=1000
for r in rows:
 if only and r['id'] not in only:continue
 o=bpy.data.objects[r['id']];o.hide_render=False;o.hide_set(False)
 b=r['범위XYZ최소최대'];center=Vector(((b[0]+b[3])/2,(b[1]+b[4])/2,(b[2]+b[5])/2));extent=max(b[3]-b[0],b[4]-b[1],(b[5]-b[2])*1.35)
 floor.location.z=0 if r['id'] in ['HE_Deadwood_Hollow','HE_Ash_Gravel'] else b[2]-.025
 for side in [False,True]:
  o.rotation_euler.z=math.pi/2 if side else 0;bpy.context.view_layer.update()
  points=[o.matrix_world@v.co for v in o.data.vertices];mn=Vector(tuple(min(v[k] for v in points) for k in range(3)));mx=Vector(tuple(max(v[k] for v in points) for k in range(3)));center=(mn+mx)*.5
  cam.location=center+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));aim(cam,center);bpy.context.view_layer.update()
  cp=[cam.matrix_world.inverted()@p for p in points];sx=max(abs(p.x) for p in cp)*2;sy=max(abs(p.y) for p in cp)*2
  cam.data.ortho_scale=max(2.5,sx*1.2,sy*1.6*1.2)
  S.render.filepath=str(R/'renders'/(r['id']+('_side' if side else '')+'.png'));bpy.ops.render.render(write_still=True)
 o.rotation_euler.z=0;o.hide_render=True;o.hide_set(True)

# 조립 확인은 Blender 독립 시연이다. Unity의 경로/충돌/플레이 캡처와 구분한다.
floor.location.z=-.16
floor.scale=(1,1,1)
# 조립 시연의 바닥은 무한 평면이 아닌 절벽 위의 한정된 선반이다.
me=bpy.data.meshes.new('검수용선반');me.from_pydata([(-12,-9,0),(5,-8,0),(7,-2,0),(6,5,0),(1,10,0),(-6,10,0),(-12,4,0)],[],[(0,1,2,3,4,5,6)]);me.update();me.materials.append(floor.data.materials[0]);floor.data=me
next(n for n in floor.data.materials[0].node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Base Color'].default_value=(.055,.043,.046,1)
clones=[]
def place(name,p,scale=1,yaw=0):
 src=bpy.data.objects[name];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='조립_'+name;o.location=p;o.scale=(scale,)*3;o.rotation_euler.z=math.radians(yaw);o.hide_render=False;o.hide_set(False);clones.append(o);return o
# 화면 왼쪽 연속 질량 → 낮은 접합 → 열린 중앙 → 오른쪽 절벽 → 멀리 떨어진 아치.
place('HE_Cliff_Mass_A',(-7,4,.7),1.05,25)
place('HE_Cliff_Mass_A',(-7.5,-2,.45),.92,115)
place('HE_Cliff_Drop_B',(5.8,.8,-.75),1.1,-25)
place('HE_Cliff_Drop_B',(2.9,-6,-.75),1.05,-5)
place('HE_Deadwood_Hollow',(-4.2,.4,0),1.15,85)
place('HE_Deadwood_Hollow',(-6,6,0),1.05,135)
place('HE_Root_Fallen',(-3.5,1.8,-.02),.85,-35)
place('HE_Rock_Connector',(-3,-2,-.2),.8,15)
place('HE_Rock_Connector',(3.8,3,-.3),.7,160)
place('HE_Ruin_Wall',(-.3,8,-.05),.8,-20)
place('HE_Ruin_Pillar',(3.5,6,-.05),1,18)
place('HE_Bone_Heap',(-2,3,-.02),.7,-25)
place('HE_Chain_Drape',(.5,5.5,-.02),.8,15)
place('HE_Ash_Gravel',(0,2,-.15),1.1,20)
place('HE_Ash_Gravel',(-3,-2.7,-.15),.75,40)
place('HE_Vista_Ruined_Arch',(5,17,-4),1.2,5)
place('HE_Vista_Ruined_Arch',(-8,24,-6),.8,160)
# 심연은 실제 바닥 메시와 분리된 낮은 연무. 표면 노이즈·디더링 없음.
bpy.ops.mesh.primitive_cube_add(size=2,location=(4,17,-.5));fog=bpy.context.object;fog.name='검수용균질연무';fog.scale=(22,10,5)
m=bpy.data.materials.new('검수용원근연무');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=.025;v.inputs['Color'].default_value=(.19,.27,.38,1);m.node_tree.links.new(v.outputs[0],out.inputs['Volume']);fog.data.materials.append(m)
S.render.resolution_x=1920;S.render.resolution_y=1080;S.cycles.samples=64
cam.data.ortho_scale=38;cam.location=(17,-20,math.hypot(17,26)*math.tan(math.radians(52)));aim(cam,(0,6,0))
S.render.filepath=str(R/'조립-52도.png');bpy.ops.render.render(write_still=True)
placements=[{'id':o.name.replace('조립_','').split('.')[0],'위치BlenderXYZ':list(o.location),'배율':list(o.scale),'회전Z도':math.degrees(o.rotation_euler.z)} for o in clones]
(R/'source/조립배치-시연전용.json').write_text(json.dumps({'용도':'Blender 형태·접합·원근 시연, Unity 실제 배치 좌표가 아님','좌표계':'Blender Z-up, meter','배치':placements},ensure_ascii=False,indent=2),encoding='utf8')
S.render.filepath=str(R/'조립-52도.png')
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_최종.blend'))
(R/'source/최종렌더완료.json').write_text(json.dumps({'렌더전체':len(rows)*2+1,'이번재촬영':(len(only) if only else len(rows))*2+1,'재촬영대상':sorted(only) if only else '전체','이외변경없는동일입력렌더재사용':bool(only),'Unity실행':0,'카메라내림각':52},ensure_ascii=False),encoding='utf8')
