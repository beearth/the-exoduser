"""같은 납품 메시·PNG로 원화 구도와 모듈52도 검수 렌더. 수면·불은 Blender 검수 대리물."""
import bpy,math,json,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');OLD=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
S.render.engine='CYCLES';S.cycles.samples=32;S.cycles.use_denoising=True;S.render.threads_mode='FIXED';S.render.threads=10
for o in list(S.objects):
 if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
 else:o.hide_render=True;o.hide_set(True)
for im in bpy.data.images:
 if im.source=='FILE' and im.filepath:
  name=Path(im.filepath).name;pp=P/'Textures'/name
  if pp.exists():im.unpack(method='REMOVE') if im.packed_file else None;im.filepath=str(pp);im.reload()
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();cam=bpy.context.object;cam.name='승인구도_검수카메라';S.camera=cam;cam.data.type='PERSP';cam.data.lens=48
def light(name,pos,energy,color,size,target):
 d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=pos;aim(o,target);return o
light('차가운큰면광',(-8,-1,15),4200,(.57,.69,.83),11,(0,2,0));light('후경림광',(4,18,18),4200,(.56,.70,.90),10,(0,5,0));light('따뜻한미약보조',(7,-10,8),850,(.84,.65,.43),9,(0,0,1))
S.world.use_nodes=True;bg=next(n for n in S.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.15,.18,.21,1);bg.inputs[1].default_value=.30
S.view_settings.view_transform='AgX';S.view_settings.exposure=.3
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
clones=[]
def place(id,pos,scale=1,yaw=0):
 src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='배치_'+id;o.location=pos;o.scale=(scale,)*3;o.rotation_euler.z=math.radians(yaw);o.hide_render=False;o.hide_set(False)
 if id=='RF_Forest_Vista_Card':o.visible_shadow=False
 clones.append(o);return o
if '--modules' in sys.argv:
 # 독립 검수는 모든 모듈에 동일 광원·52도·화면 점유율을 사용한다.
 cam.data.type='ORTHO';S.render.resolution_x=1600;S.render.resolution_y=1000
 bpy.ops.mesh.primitive_plane_add(size=160);floor=bpy.context.object;floor.name='동일중립검수바닥';mat=bpy.data.materials.new('동일중립바닥');mat.use_nodes=True;bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.055,.063,.075,1);bs.inputs['Roughness'].default_value=.9;floor.data.materials.append(mat)
 for r in rows:
  if '--only' in sys.argv and r['id'] not in sys.argv[sys.argv.index('--only')+1:]:continue
  o=bpy.data.objects[r['id']];o.hide_render=False;o.hide_set(False)
  floor.location.z=0 if r['id'] in ['RF_Ancient_Rotten_Tree','RF_Withered_Shrub','RF_Fungal_Colony','RF_Foreground_Roots'] else r['범위XYZ최소최대'][2]-.025
  for side in [0,1]:
   o.rotation_euler.z=side*math.pi/2;bpy.context.view_layer.update();points=[o.matrix_world@v.co for v in o.data.vertices];mn=Vector([min(p[k] for p in points) for k in range(3)]);mx=Vector([max(p[k] for p in points) for k in range(3)]);c=(mn+mx)*.5
   cam.location=c+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));aim(cam,c);bpy.context.view_layer.update();ps=[cam.matrix_world.inverted()@p for p in points];cam.data.ortho_scale=max(2.5,max(abs(p.x) for p in ps)*2.4,max(abs(p.y) for p in ps)*3.84)
   S.render.filepath=str(R/'renders'/(r['id']+('_side' if side else '')+'.png'));bpy.ops.render.render(write_still=True)
  o.rotation_euler.z=0;o.hide_render=True;o.hide_set(True)
 print('동일52도 모듈 정면·측면 완료',flush=True);sys.exit(0)

def simplemat(name,col,rough=.8,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*col,1);bs.inputs['Emission Strength'].default_value=emission
 return m
soil=bpy.data.materials.new('검수_젖은회갈색토양');soil.use_nodes=True;n=soil.node_tree.nodes;l=soil.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(R/'source/검수_저주파토양.jpg'));tx.projection='BOX';tx.projection_blend=.3;g=n.new('ShaderNodeNewGeometry');v=n.new('ShaderNodeVectorMath');v.operation='SCALE';v.inputs[3].default_value=.16;l.new(g.outputs['Position'],v.inputs[0]);l.new(v.outputs[0],tx.inputs[0]);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.35,.29,.21,1);l.new(tx.outputs[0],mix.inputs[1]);l.new(mix.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.78
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();me.materials.append(mat);o=bpy.data.objects.new(name,me);S.collection.objects.link(o)
 for f in me.polygons:f.use_smooth=True
 return o
for sign in [-1,1]:
 vs=[];fs=[]
 for j in range(81):
  x=-40+j;edge=5.6+.6*math.sin(x*.27)+.3*math.sin(x*.63)
  if sign<0:edge-=2.4*math.exp(-((x+7.6)/3.6)**2)
  else:edge-=5.2*math.exp(-((x-7)/3.2)**2)
  for i in range(17):
   y=sign*(edge+i*2);z=.57+.22*math.sin(x*.23+y*.12)+.12*math.sin(x*.4-y*.3)
   if i==0:z=-.15
   elif i==1:z=.43
   vs.append((x,y,z))
 for j in range(80):
  for i in range(16):a=j*17+i;fs.append((a,a+17,a+18,a+1) if sign>0 else (a+1,a+18,a+17,a))
 mesh('검수_연결된강둑',vs,fs,soil)
# 강바닥은 실제 납품 메시. 수면은 색상만 합의하기 위한 Blender 대리면이다.
for x in [-20,-10,0,10,20,30]:
 o=place('RF_Riverbed',(x,0,-.45));o.scale.y=2.2
water=simplemat('색기준_탁한병든녹황_비납품',(.075,.080,.023),.43)
mesh('검수용_정적독액색면',[(-50,-8,-.12),(50,-8,-.12),(50,8,-.12),(-50,8,-.12)],[(0,1,2,3)],water)
place('RF_Rotten_Wood_Bridge',(0,0,0))
# 외곽 큰 질량을 먼저 연결하고 전투/접근공간을 비운다.
for x,y,sc,yaw in [(-7.6,-6.3,1.38,5),(-10,4,1.15,88),(-11,14,1.3,155),(6,13,1.35,205),(12,18,1.05,260),(-5,24,1.15,110),(7,29,.95,310),(-16,25,1.2,40),(-16,1,.85,230)]:
 tid='RF_Gnarled_Split_Trunk' if (x,y) in [(-10,4),(12,18),(-5,24),(-16,1)] else 'RF_Ancient_Rotten_Tree'
 place(tid,(x,y,.5),sc,yaw)
 # 휜 줄기의 실제 높이별 중심과 카메라 쪽 표면에 부착한다.
 a=math.radians(yaw)
 def trunk_surface(z,r):
  t=z/(8.2 if tid=='RF_Gnarled_Split_Trunk' else 10);cx=(-2.4 if tid=='RF_Gnarled_Split_Trunk' else 2.4)*t+.45*math.sin(t*5);cy=.25*math.sin(t*4)
  return (x+sc*(cx*math.cos(a)-cy*math.sin(a)+r*.54),y+sc*(cx*math.sin(a)+cy*math.cos(a)-r*.84))
 if y<20:
  fx,fy=trunk_surface(1.0,1.45);place('RF_Fungal_Colony',(fx,fy,.6),sc*.76,32.7)
  for z,patch in [(3.8,.66),(1.9,.50)]:
   mx,my=trunk_surface(z,1.6*(1-.55*z/10));place('RF_Hanging_Moss',(mx,my,.5+sc*(z-2.324*patch)),sc*patch,32.7)
 # 작은 장식 산포가 아니라 큰 줄기의 지면 접합부를 잇는 낮은 마른 덤불 군락.
 if y<16:
  for dx,dy,sz,ry in [(-1.7,-.5,.95,15),(.8,-1.6,1.15,115),(1.8,.9,.8,235)]:place('RF_Withered_Shrub',(x+dx*sc,y+dy*sc,.52),sc*sz,ry+yaw)
for x,y,yaw,sc in [(-6,-9,25,1),(-7,8,15,1.1),(7,9,140,1),(10,-7,100,1.1),(13,4,50,.9),(-12,18,150,1),(-6,-13,15,1.2)]:place('RF_Fallen_Log',(x,y,-.4 if -5<y<6 else .65),sc,yaw)
place('RF_Fractured_Stump',(7,1.4,.1),1.0,12);place('RF_Fungal_Colony',(7.6,.45,.3),.8,32.7);place('RF_Hanging_Moss',(7.3,.1,1.1),.7,32.7)
for x,y,yaw,sc in [(5.2,2.7,15,.8),(7.9,3.1,145,1.1),(8.7,1.8,250,.7)]:place('RF_Withered_Shrub',(x,y,.28),sc,yaw)
place('RF_Foreground_Branch_Frame',(-3,-10,1.0),1.3,20)
# 그루터기 받침은 위 강둑의 연속된 반도로 만든다. 별도 원형 지면 판을 사용하지 않는다.
for x,y,yaw,sc in [(-7,-10,10,1.4),(8,-9,110,1.3),(-7,6,0,1.0),(7,8,180,1.0)]:place('RF_Foreground_Roots',(x,y,.55),sc,yaw)
for x,y,yaw,sc in [(-9,-3,0,.85),(8,-3,10,1),(-11,3,0,.75),(12,4,15,.85),(8,4,0,.7)]:place('RF_River_Stake_Cluster',(x,y,-.12),sc,yaw)
for x,y,yaw in [(-3.4,-5.8,180),(3.7,-5.6,0),(-4.8,5.6,0),(4.3,6,180),(11,-5.8,0),(-11,5.8,0)]:
 # 다리 교대의 작은 암반만 남기고 강가 전체를 바위 줄로 둘러싸지 않는다.
 if abs(x)<4.4:
  o=place('RF_Corroded_Riverbank',(x,y,-.36),.65,yaw);o.scale.z=.6
 place('RF_Withered_Shrub',(x,y,.4),1.1,yaw)
for x,y,yaw in [(-5,-6.7,25),(-7,-7.5,110),(-6,7,160),(5,7,40),(7,11,70),(-7,12,250),(10,-7,35),(-10,9,80)]:
 place('RF_Withered_Shrub',(x,y,.5),1.2,yaw);place('RF_Fungal_Colony',(x+.5,y+.1,.5),.45,yaw)
for x,y,yaw in [(-5.8,-5.3,0),(6,-5.4,0),(-5,5.3,180),(8,5.4,180)]:
 o=place('RF_Foam_Bank',(x,y,-.09),.8,yaw)
 # 거품은 강 표면 높이와 일치시킨다. 셰이더 구현과 별도.
 o.scale.z=.26
for x,y in [(-2.3,-4.7),(2.3,4.7)]:
 place('RF_Bridge_Torch_Holder',(x,y,.6),.8)
 d=bpy.data.lights.new('검수용횃불광','POINT');d.energy=200;d.color=(1,.39,.09);d.shadow_soft_size=.45;o=bpy.data.objects.new('검수용횃불광',d);S.collection.objects.link(o);o.location=(x,y,2.22)
 flame=simplemat('검수용불꽃_비납품',(1,.24,.015),.8,5);bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=.17,location=(x,y,2.20));o=bpy.context.object;o.scale=(.8,.8,1.6);o.data.materials.append(flame)
for x,y,sc in [(-11,39,1.6),(9,42,1.8),(-3,57,2.1)]:place('RF_Forest_Vista_Card',(x,y,-.5),sc)
# 뒤쪽부터 깊어지는 균질 안개. 전경을 전체 색막으로 덮지 않는다.
bpy.ops.mesh.primitive_cube_add(size=2,location=(0,35,9));fog=bpy.context.object;fog.name='검수_후경연무';fog.scale=(50,23,15);m=bpy.data.materials.new('검수_후경균질안개');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=.026;v.inputs['Color'].default_value=(.37,.43,.47,1);m.node_tree.links.new(v.outputs[0],out.inputs['Volume']);fog.data.materials.append(m)
S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.resolution_percentage=100;S.cycles.samples=48
cam.location=(16,-25,26);aim(cam,(0,4,1));cam.data.lens=40
if '--draft' in sys.argv:S.render.resolution_percentage=65;S.cycles.samples=16
S.render.filepath=str(R/('승인구도_초벌.png' if '--draft' in sys.argv else '승인구도_최종.png'));bpy.ops.render.render(write_still=True)
placements=[{'id':o.name.replace('배치_','').split('.')[0],'BlenderXYZ':list(o.location),'배율':list(o.scale),'회전Z':math.degrees(o.rotation_euler.z)} for o in clones]
(R/'source/조립-시연전용.json').write_text(json.dumps({'범위':'실제 납품 FBX와 동일 메시/베이크PNG의 Blender 정적 시연. 수면·불·광원·안개·토양은 비납품 검수 대리물. Unity/Player0','카메라':{'BlenderXYZ':list(cam.location),'목표':[0,4,1],'초점mm':cam.data.lens,'수평대비하향각':math.degrees(math.atan2(25,math.hypot(16,29)))},'독액색':{'linearRGB':[.075,.080,.023],'sRGB_HEX':'#4D502A','거칠기':.43,'발광':0},'배치':placements},ensure_ascii=False,indent=2),encoding='utf8')
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_조립.blend'))
print('승인구도 Blender 정적 렌더 완료',flush=True)
