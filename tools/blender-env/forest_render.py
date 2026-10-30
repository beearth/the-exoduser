import bpy, math, json,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'))
S=bpy.context.scene;S.cycles.samples=24;S.render.threads_mode='FIXED';S.render.threads=10
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
 floor.location.z=0 if r['id'] in ['RF_Ancient_Rotten_Tree','RF_Withered_Shrub','RF_Fungal_Colony'] else b[2]-.025
 for side in [False,True]:
  o.rotation_euler.z=math.pi/2 if side else 0;bpy.context.view_layer.update()
  points=[o.matrix_world@v.co for v in o.data.vertices];mn=Vector(tuple(min(v[k] for v in points) for k in range(3)));mx=Vector(tuple(max(v[k] for v in points) for k in range(3)));center=(mn+mx)*.5
  cam.location=center+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));aim(cam,center);bpy.context.view_layer.update()
  cp=[cam.matrix_world.inverted()@p for p in points];sx=max(abs(p.x) for p in cp)*2;sy=max(abs(p.y) for p in cp)*2
  cam.data.ortho_scale=max(2.5,sx*1.2,sy*1.6*1.2)
  S.render.filepath=str(R/'renders'/(r['id']+('_side' if side else '')+'.png'));bpy.ops.render.render(write_still=True)
 o.rotation_euler.z=0;o.hide_render=True;o.hide_set(True)


# 연결 시연은 독액 수면·게임 카메라/충돌과 별개인 Blender 정적 장면.
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
clones=[]
def place(name,pos,scale=1,yaw=0):
 src=bpy.data.objects[name];o=src.copy();o.data=src.data;
 if name=='RF_Forest_Vista_Card':o.visible_shadow=False
 S.collection.objects.link(o);o.name='조립_'+name;o.location=pos;o.scale=(scale,)*3;o.rotation_euler.z=math.radians(yaw);o.hide_render=False;o.hide_set(False);clones.append(o);return o
# 강바닥은 남북, 다리는 동서. 중앙은 수면 대신 납품된 채널 형상을 보임.
for y in [-7,3,13]:
 o=place('RF_Riverbed',(0,y,-.25),1,90);o.scale.y=1.4
for y in [-8,-2,5,12,19]:
 place('RF_Corroded_Riverbank',(-4.5+.3*math.sin(y),y,-.25),1,90)
 place('RF_Corroded_Riverbank',(4.5+.3*math.cos(y),y+1,-.25),1,-90)
place('RF_Broken_Stone_Bridge',(0,0,-.10),1,0)
# 큰 숲을 좌우로 연결하고 다리 앞은 비운다.
for x,y,sz,yaw in [(-8,-4,1,15),(-9,1,1.15,55),(-7.5,5,.88,145),(-10,8,1.2,210),(-8,12,1.05,85),(-11,16,1.3,20),(-7.5,21,.95,240),(8,4,1.05,290),(10,8,1.1,120),(7.7,12,.9,10),(10,16,1.2,185),(8,21,1.05,70),(11,25,1.25,260)]:place('RF_Ancient_Rotten_Tree',(x,y,0),sz,yaw)
place('RF_Fallen_Log',(-7,6,.02),.9,45);place('RF_Fallen_Log',(8,15,.03),.95,120)
for x,y,yaw in [(-5,-3,20),(-6,6,130),(6,7,250),(-7,13,300),(7,17,170)]:
 place('RF_Withered_Shrub',(x,y,.02),.8,yaw);place('RF_Fungal_Colony',(x-.3,y-.6,.02),.7,yaw)
for x,y,yaw in [(-8,3,55),(8,5,290),(-8,10,145)]:place('RF_Hanging_Moss',(x-.5,y-.5,1.1),1,yaw)
for x,y,yaw in [(-3.6,5,90),(3.5,8,90),(-3.8,-4,90)]:place('RF_Foam_Bank',(x,y,-.27),1,yaw)
# 양쪽 육지: 검수용 바닥은 베이크된 퇴적 재질을 공유, 실제 맵 지형을 바꾸지 않는다.
soil=bpy.data.materials.new('조립용_공통월드토양');soil.use_nodes=True;n=soil.node_tree.nodes;l=soil.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(R/'pbr-source/burned_ground_01_Diffuse.jpg'));tex.projection='BOX';tex.projection_blend=.3;geom=n.new('ShaderNodeNewGeometry');scale=n.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs[3].default_value=.22;l.new(geom.outputs['Position'],scale.inputs[0]);l.new(scale.outputs[0],tex.inputs[0]);mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.20,.17,.11,1);l.new(tex.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.88
for sign in [-1,1]:
 vs=[];fs=[]
 for j in range(17):
  y=-15+j*3
  for i in range(9):
   x=sign*(3.8+i*2);z=.03+.12*math.sin(y*.4+x*.3)+.045*i+.6*max(0,1-(abs(x)-3.8)/2.5)**2*math.exp(-y*y/9);vs.append((x,y,z))
 for j in range(16):
  for i in range(8):a=j*9+i;fs.append((a,a+1,a+10,a+9) if sign>0 else (a+9,a+10,a+1,a))
 me=bpy.data.meshes.new('조립용육지');me.from_pydata(vs,[],fs);me.update();me.materials.append(soil);o=bpy.data.objects.new('조립용육지',me);S.collection.objects.link(o)
 uv=me.uv_layers.new(name='UVMap')
 for f in me.polygons:
  f.use_smooth=True
  for li in f.loop_indices:
   v=me.vertices[me.loops[li].vertex_index].co;uv.data[li].uv=(v.x*.07,v.y*.07)
# 후경은 물체를 감추는 검은 끝 대신 겹치는 투명 카드와 실제 균질 안개.
for x,y,sc in [(-9,30,1.1),(10,32,1.3),(-3,43,1.5)]:place('RF_Forest_Vista_Card',(x,y,-1),sc,0)
bpy.ops.mesh.primitive_cube_add(size=2,location=(0,24,4));fog=bpy.context.object;fog.name='조립용후경연무';fog.scale=(30,20,10)
m=bpy.data.materials.new('조립용균질안개');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=.018;v.inputs['Color'].default_value=(.22,.31,.32,1);m.node_tree.links.new(v.outputs[0],out.inputs['Volume']);fog.data.materials.append(m)
# 광원 3개의 위치는 유지하되 큰 조립 범위에 맞춘다. 카드/안개를 런타임 구현으로 보고하지 않음.
for o in S.objects:
 if o.type=='LIGHT':o.data.energy*=2.5
S.world.color=(.055,.07,.085)
S.render.resolution_x=1920;S.render.resolution_y=1080;S.cycles.samples=48
cam.location=(17,-22,math.hypot(17,26)*math.tan(math.radians(52)));aim(cam,(0,4,0));cam.data.ortho_scale=37
S.render.filepath=str(R/'숲-다리-조립52도.png');bpy.ops.render.render(write_still=True)
placements=[{'id':o.name.replace('조립_','').split('.')[0],'BlenderXYZ':list(o.location),'배율':list(o.scale),'회전Z':math.degrees(o.rotation_euler.z)} for o in clones]
(R/'source/조립-시연전용.json').write_text(json.dumps({'범위':'Unity가 아닌 Blender 정적 접합 시연. 독액 수면/전투/캐릭터/충돌 없음','배치':placements},ensure_ascii=False,indent=2),encoding='utf8')
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_최종.blend'))
(R/'source/렌더완료.json').write_text(json.dumps({'이번대상':sorted(only) if only else [r['id'] for r in rows],'정면측면':(len(only) if only else len(rows))*2,'이외동일입력렌더재사용':bool(only),'Unity실행':0},ensure_ascii=False,indent=2),encoding='utf8')
print('선택 대상 정면·측면 및 조립 시연 렌더 완료',flush=True)
