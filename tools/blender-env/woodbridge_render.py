"""같은 납품 메시·PNG로 원화 구도와 모듈52도 검수 렌더. 수면·불은 Blender 검수 대리물."""
import bpy,math,json,sys,hashlib
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');OLD=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source'/('실물주간_형태시험.blend' if '--scan-trial' in sys.argv else '숲_베이크.blend')));S=bpy.context.scene
S.render.engine='CYCLES';S.cycles.samples=32;S.cycles.use_denoising=True;S.cycles.transparent_max_bounces=32;S.render.threads_mode='FIXED';S.render.threads=10
for o in list(S.objects):
 if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
 else:o.hide_render=True;o.hide_set(True)
for im in bpy.data.images:
 if im.source=='FILE' and im.filepath:
  if '근원베이크_불변입력' in im.filepath:continue
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
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def inputs(id):return {'FBX_SHA256':sha(P/'Models'/(id+'.fbx')),'PNG_SHA256':{k:sha(P/'Textures'/(id+'_'+k+'.png')) for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic','MetallicSmoothness']}}
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
  (R/'renders'/('입력_'+r['id']+'.json')).write_text(json.dumps({'id':r['id'],'입력':inputs(r['id']),'렌더':{suffix:sha(R/'renders'/(r['id']+suffix+'.png')) for suffix in ['','_side']},'카메라각':52,'조명':'모든 모듈 동일3광원·세계광','레시피SHA':sha(Path(__file__))},ensure_ascii=False,indent=2),encoding='utf8')
  o.rotation_euler.z=0;o.hide_render=True;o.hide_set(True)
 print('동일52도 모듈 정면·측면 완료',flush=True);sys.exit(0)

def simplemat(name,col,rough=.8,emission=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough
 if emission:bs.inputs['Emission Color'].default_value=(*col,1);bs.inputs['Emission Strength'].default_value=emission
 return m
key=bpy.data.objects['차가운큰면광'];key.location=(-10,8,19);key.data.energy=3400;key.data.size=9;aim(key,(0,2,0))
soil=bpy.data.materials.new('검수_CC0젖은흙_낙엽층');soil.use_nodes=True;n=soil.node_tree.nodes;l=soil.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');g=n.new('ShaderNodeNewGeometry');scale=n.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs[3].default_value=.12;l.new(g.outputs['Position'],scale.inputs[0]);textures=[];roughs=[]
for asset in ['mud_forest','brown_mud_leaves_01']:
 tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(R/'source'/('검수_'+asset+'_저주파.png')));tx.projection='BOX';tx.projection_blend=.35;l.new(scale.outputs[0],tx.inputs[0]);textures.append(tx)
 rt=n.new('ShaderNodeTexImage');rt.image=bpy.data.images.load(str(R/'pbr-source'/asset/'Rough.jpg'));rt.image.colorspace_settings.name='Non-Color';rt.projection='BOX';rt.projection_blend=.35;l.new(scale.outputs[0],rt.inputs[0]);roughs.append(rt)
noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=.20;noise.inputs['Detail'].default_value=1;l.new(g.outputs['Position'],noise.inputs['Vector']);mix=n.new('ShaderNodeMixRGB');l.new(noise.outputs['Fac'],mix.inputs[0]);l.new(textures[0].outputs[0],mix.inputs[1]);l.new(textures[1].outputs[0],mix.inputs[2]);tone=n.new('ShaderNodeMixRGB');tone.blend_type='MULTIPLY';tone.inputs[0].default_value=1;tone.inputs[2].default_value=(.76,.67,.52,1);l.new(mix.outputs[0],tone.inputs[1]);l.new(tone.outputs[0],bs.inputs['Base Color']);l.new(roughs[0].outputs[0],bs.inputs['Roughness']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.18;bump.inputs['Distance'].default_value=.055;l.new(mix.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update();me.materials.append(mat);o=bpy.data.objects.new(name,me);S.collection.objects.link(o)
 for f in me.polygons:f.use_smooth=True
 return o
for sign in [-1,1]:
 vs=[];fs=[]
 for j in range(321):
  x=-40+j*.25;edge=5.6+.6*math.sin(x*.27)+.3*math.sin(x*.63)
  if sign<0:edge-=2.4*math.exp(-((x+7.6)/3.6)**2)
  else:edge-=5.2*math.exp(-((x-7)/3.2)**2)
  for i in range(129):
   y=sign*(edge+i*.25);z=.57+.22*math.sin(x*.23+y*.12)+.12*math.sin(x*.4-y*.3)
   if i<8:z=-.15+(.58*math.sin((i/8)*math.pi/2))
   vs.append((x,y,z))
 for j in range(320):
  for i in range(128):a=j*129+i;fs.append((a,a+129,a+130,a+1) if sign>0 else (a+1,a+130,a+129,a))
 mesh('검수_연결된강둑',vs,fs,soil)
# 강바닥은 실제 납품 메시. 수면은 색상만 합의하기 위한 Blender 대리면이다.
for x in [-20,-10,0,10,20,30]:
 o=place('RF_Riverbed',(x,0,-.45));o.scale.y=2.2
water=simplemat('색기준_탁한병든녹황_비납품',(.075,.080,.023),.34);n=water.node_tree.nodes;l=water.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');bs.inputs['IOR'].default_value=1.36;bs.inputs['Coat Weight'].default_value=.05;bs.inputs['Specular IOR Level'].default_value=.28;bs.inputs['Coat Roughness'].default_value=.25
ge=n.new('ShaderNodeNewGeometry');no=n.new('ShaderNodeTexNoise');no.inputs['Scale'].default_value=.18;no.inputs['Detail'].default_value=1;l.new(ge.outputs['Position'],no.inputs['Vector']);mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.052,.058,.012,1);mix.inputs[2].default_value=(.084,.087,.024,1);l.new(no.outputs['Fac'],mix.inputs[0]);l.new(mix.outputs[0],bs.inputs['Base Color']);wave=n.new('ShaderNodeTexNoise');wave.inputs['Scale'].default_value=1.7;wave.inputs['Detail'].default_value=1;l.new(ge.outputs['Position'],wave.inputs[0]);bu=n.new('ShaderNodeBump');bu.inputs['Strength'].default_value=.12;bu.inputs['Distance'].default_value=.035;l.new(wave.outputs['Fac'],bu.inputs['Height']);l.new(bu.outputs[0],bs.inputs['Normal'])
mesh('검수용_정적독액색면',[(-50,-8,-.12),(50,-8,-.12),(50,58,-.12),(-50,58,-.12)],[(0,1,2,3)],water)
for y in [12,22,32]:
 o=place('RF_Riverbed',(12,y,-.45),1,90);o.scale.y=1.8
place('RF_Rotten_Wood_Bridge',(0,0,0))
for side in [-1,1]:
 for y in [-4.7,-1.8,1.5,4.2]:place('RF_Hanging_Moss',(side*2.13,y,1.06),.18,90*side)
# 외곽 큰 질량을 먼저 연결하고 전투/접근공간을 비운다.
for x,y,sc,yaw in [(-7.6,-6.3,1.38,5),(-10,4,1.15,88),(-11,14,1.3,155),(6,13,1.35,205),(12,18,1.05,260),(-5,24,1.15,110),(7,29,.95,310),(-16,25,1.2,40),(-16,1,.85,230)]:
 tid='RF_Gnarled_Split_Trunk' if (x,y) in [(-10,4),(12,18),(-5,24),(-16,1)] else 'RF_Ancient_Rotten_Tree'
 tree=place(tid,(x,y,.5),sc,yaw);bpy.context.view_layer.update();world_points=[tree.matrix_world@v.co for v in tree.data.vertices];tree_bvh=BVHTree.FromPolygons(world_points,[tuple(f.vertices) for f in tree.data.polygons],all_triangles=False)
 # 휜 줄기의 실제 높이별 중심과 카메라 쪽 표면에 부착한다.
 a=math.radians(yaw)
 def trunk_surface(z,r):
  t=z/(8.2 if tid=='RF_Gnarled_Split_Trunk' else 10);cx=(-2.4 if tid=='RF_Gnarled_Split_Trunk' else 2.4)*t+.45*math.sin(t*5);cy=.25*math.sin(t*4)
  if '--scan-trial' in sys.argv or (R/'source/전체목질스캔완료.json').exists():
   band=[p for p in world_points if abs(p.z-(.5+sc*z))<.22*sc]
   if band:
    bx=sorted(p.x for p in band)[len(band)//2];by=sorted(p.y for p in band)[len(band)//2];hit,normal,index,distance=tree_bvh.ray_cast(Vector((bx+27*.54,by-27*.84,.5+sc*z)),Vector((-.54,.84,0)),54)
    if hit:return (hit.x+.08*.54,hit.y-.08*.84)
  return (x+sc*(cx*math.cos(a)-cy*math.sin(a)+r*.54),y+sc*(cx*math.sin(a)+cy*math.cos(a)-r*.84))
 if y<20:
  fx,fy=trunk_surface(1.0,1.45);place('RF_Fungal_Colony',(fx,fy,.6),sc*.76,32.7)
  for z,patch in [(6.6,.82),(3.8,1.0),(1.9,.72)]:
   mx,my=trunk_surface(z,1.6*(1-.55*z/10)+.32);place('RF_Hanging_Moss',(mx,my,.5+sc*(z-2.35*patch)),sc*patch,32.7)
 # 작은 장식 산포가 아니라 큰 줄기의 지면 접합부를 잇는 낮은 마른 덤불 군락.
 if y<16:
  for dx,dy,sz,ry in [(-1.7,-.5,.95,15),(.8,-1.6,1.15,115),(1.8,.9,.8,235)]:place('RF_Withered_Shrub',(x+dx*sc,y+dy*sc,.52),sc*sz,ry+yaw)
for x,y,yaw,sc in [(-6,-9,25,1),(-7,8,15,1.1),(7,9,140,1),(10,-7,100,1.1),(13,4,50,.9),(-12,18,150,1),(-6,-13,15,1.2)]:place('RF_Fallen_Log',(x,y,-.4 if -5<y<6 else .65),sc,yaw)
place('RF_Fractured_Stump',(7,1.4,.48),.80,12);place('RF_Fungal_Colony',(7.5,.1,.5),.60,32.7);place('RF_Hanging_Moss',(7.4,-.4,1.25),.55,32.7)
for x,y,yaw,sc in [(5.2,2.7,15,.8),(7.9,3.1,145,1.1),(8.7,1.8,250,.7)]:place('RF_Withered_Shrub',(x,y,.28),sc,yaw)
place('RF_Foreground_Branch_Frame',(-3,-10,1.0),1.3,20)
# 그루터기 받침은 위 강둑의 연속된 반도로 만든다. 별도 원형 지면 판을 사용하지 않는다.
for x,y,yaw,sc in [(-7,-10,10,1.1),(8,-9,110,1.0)]:place('RF_Foreground_Roots',(x,y,.40),sc,yaw)
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
# 실물 뿌리의 흙 접합면 아래로 검수 지형을 연결한다. 별도 둥근 흙판을 붙이지 않는다.
# 이 지형은 Blender 조립 대리물이며 실제 맵/Collider/높이 권위를 변경하지 않는다.
bpy.context.view_layer.update();fields=[]
shore_points={-1:{},1:{}}
for o in clones:
 if not any(k in o.name for k in ['RF_Ancient_Rotten_Tree','RF_Fractured_Stump','RF_Gnarled_Split_Trunk','RF_Foreground_Roots']):continue
 faces=[tuple(f.vertices) for f in o.data.polygons if f.normal.z>.2 and max(o.data.vertices[i].co.z for i in f.vertices)<.18]
 if not faces:continue
 points=[o.matrix_world@v.co for v in o.data.vertices];used={i for f in faces for i in f};bounds=[min(points[i][k] for i in used) for k in [0,1]]+[max(points[i][k] for i in used) for k in [0,1]];fields.append((bounds,BVHTree.FromPolygons(points,faces,all_triangles=False)))
 sign=1 if o.location.y>=0 else -1
 for i in used:
  p=points[i];bucket=round(p.x*4);shore_points[sign][bucket]=min(shore_points[sign].get(bucket,100),sign*p.y-.45)
for o in S.objects:
 if not o.name.startswith('검수_연결된강둑'):continue
 sign=1 if sum(v.co.y for v in o.data.vertices)>0 else -1
 # 스캔 접합 토양의 전체 외곽까지 연속 강둑을 잇는다. 수면 위 흙판을 허용하지 않는다.
 edges=[]
 for j in range(321):
  bucket=round((-40+j*.25)*4);ys=[shore_points[sign][k] for k in range(bucket-8,bucket+9) if k in shore_points[sign]];old=sign*o.data.vertices[j*129].co.y;edges.append(min(old,min(ys)) if ys else old)
 for iteration in range(6):edges=[sum(edges[max(0,min(320,j+k))] for k in range(-2,3))/5 for j in range(321)]
 for j,new in enumerate(edges):
  old=sign*o.data.vertices[j*129].co.y;shift=sign*(new-old)
  for i in range(129):o.data.vertices[j*129+i].co.y+=shift*max(0,1-i/40)
 for v in o.data.vertices:
  p=o.matrix_world@v.co
  for b,bvh in fields:
   if b[0]<=p.x<=b[2] and b[1]<=p.y<=b[3]:
    hit,normal,index,distance=bvh.ray_cast(Vector((p.x,p.y,30)),Vector((0,0,-1)),60)
    if hit:v.co.z=max(v.co.z,hit.z-.025)
  if sign>0:
   # 오른쪽 지류와 독립 그루터기 섬. 큰 직사각 강둑으로 수로를 막지 않는다.
   x,y=p.x,p.y;bank=4.3+.12*max(y,0)+1.1*math.sin(y*.23)-x;island=2.5*(1-math.sqrt(((x-7)/2.5)**2+((y-1.4)/3.0)**2));treefoot=2.0*(1-math.sqrt(((x-6)/2.4)**2+((y-13)/2.8)**2));d=max(bank,island,treefoot);fac=max(0,min(1,(d+.6)/1.2));v.co.z=-1.1+(v.co.z+1.1)*fac
 o.data.update()
# 저층 식생의 기부는 최종 강둑 표면에 붙인다. 목질 자체를 흙으로 덮지 않는다.
terrain=[o for o in S.objects if o.name.startswith('검수_연결된강둑')];v_all=[];f_all=[]
for o in terrain:
 base=len(v_all);v_all.extend(o.matrix_world@v.co for v in o.data.vertices);f_all.extend(tuple(i+base for i in f.vertices) for f in o.data.polygons)
ground_bvh=BVHTree.FromPolygons(v_all,f_all,all_triangles=False)
for o in clones:
 if 'RF_Withered_Shrub' not in o.name:continue
 hit,normal,index,distance=ground_bvh.ray_cast(Vector((o.location.x,o.location.y,30)),Vector((0,0,-1)),60)
 if hit:o.location.z=hit.z-.025
 else:o.hide_render=True
# 빛기둥과 전중경의 얇은 습기층은 Blender 검수 대리물이다.
bpy.ops.mesh.primitive_cube_add(size=2,location=(0,7,13));air=bpy.context.object;air.name='검수_전중경습기';air.scale=(33,18,15);ma=bpy.data.materials.new('검수_얇은습기');ma.use_nodes=True;nn=ma.node_tree.nodes;nn.clear();oo=nn.new('ShaderNodeOutputMaterial');vo=nn.new('ShaderNodeVolumePrincipled');vo.inputs['Density'].default_value=.006;vo.inputs['Color'].default_value=(.50,.57,.63,1);ma.node_tree.links.new(vo.outputs[0],oo.inputs['Volume']);air.data.materials.append(ma)
for pos,target,energy,size in [((-2,8,28),(-3,-4,0),35000,.18),((4,19,27),(1,6,0),26000,.13)]:
 d=bpy.data.lights.new('검수_차가운빛기둥','SPOT');d.energy=energy;d.color=(.67,.77,.93);d.spot_size=size;d.spot_blend=.62;ob=bpy.data.objects.new(d.name,d);S.collection.objects.link(ob);ob.location=pos;aim(ob,target)
light('검수_길넓은반사',(0,11,12),2200,(.83,.72,.54),9,(0,10,0))
# 카메라에서 읽히는 부드러운 체적 광선. 연출용 비납품이며 게임 광원 구현과 구분한다.
for origin,target in [(Vector((-3,8,28)),Vector((-5,-4,0))),(Vector((3,20,27)),Vector((0,6,0)))]:
 axis=origin-target;center=(origin+target)/2;bpy.ops.mesh.primitive_cone_add(vertices=48,radius1=1.2,radius2=.25,depth=axis.length,location=center);ob=bpy.context.object;ob.name='검수_연출체적빛_비납품';ob.rotation_euler=axis.to_track_quat('Z','Y').to_euler();m=bpy.data.materials.new(ob.name);m.use_nodes=True;nn=m.node_tree.nodes;nn.clear();ll=m.node_tree.links;out=nn.new('ShaderNodeOutputMaterial');vol=nn.new('ShaderNodeVolumePrincipled');vol.inputs['Color'].default_value=(.57,.66,.76,1);vol.inputs['Anisotropy'].default_value=.25;vol.inputs['Emission Color'].default_value=(.24,.31,.40,1);co=nn.new('ShaderNodeTexCoord');sep=nn.new('ShaderNodeSeparateXYZ');ll.new(co.outputs['Generated'],sep.inputs[0]);comb=nn.new('ShaderNodeCombineXYZ')
 for k in ['X','Y']:
  sub=nn.new('ShaderNodeMath');sub.operation='SUBTRACT';sub.inputs[1].default_value=.5;ll.new(sep.outputs[k],sub.inputs[0]);ll.new(sub.outputs[0],comb.inputs[k])
 le=nn.new('ShaderNodeVectorMath');le.operation='LENGTH';ll.new(comb.outputs[0],le.inputs[0]);fac=nn.new('ShaderNodeMapRange');fac.inputs['From Min'].default_value=0;fac.inputs['From Max'].default_value=.5;fac.inputs['To Min'].default_value=1;fac.inputs['To Max'].default_value=0;ll.new(le.outputs['Value'],fac.inputs[0]);den=nn.new('ShaderNodeMath');den.operation='MULTIPLY';den.inputs[1].default_value=.008;ll.new(fac.outputs[0],den.inputs[0]);ll.new(den.outputs[0],vol.inputs['Density']);em=nn.new('ShaderNodeMath');em.operation='MULTIPLY';em.inputs[1].default_value=.14;ll.new(fac.outputs[0],em.inputs[0]);ll.new(em.outputs[0],vol.inputs['Emission Strength']);ll.new(vol.outputs[0],out.inputs['Volume']);ob.data.materials.append(m)
# 기준 렌더의 낮은 부유목과 얇은 가장자리 거품. 새 수면 게임 구현 아님.
for x,y,yaw in [(-6,-3.8,20),(8,-1.9,12),(-12,1.9,-5),(12,3,10),(5,-3,0)]:place('RF_Fallen_Log',(x,y,-.06),.16,yaw)
for x,y,yaw in [(-7,-4.2,12),(-10,5.2,170),(7,3.5,170),(12,5.2,180),(12,-4.9,0),(-13,-4.9,0)]:
 o=place('RF_Foam_Bank',(x,y,-.11),.65,yaw);o.scale.z=.10
# 뒤쪽부터 깊어지는 균질 안개. 전경을 전체 색막으로 덮지 않는다.
bpy.ops.mesh.primitive_cube_add(size=2,location=(0,35,9));fog=bpy.context.object;fog.name='검수_후경연무';fog.scale=(50,23,15);m=bpy.data.materials.new('검수_후경균질안개');m.use_nodes=True;n=m.node_tree.nodes;n.clear();out=n.new('ShaderNodeOutputMaterial');v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=.026;v.inputs['Color'].default_value=(.37,.43,.47,1);m.node_tree.links.new(v.outputs[0],out.inputs['Volume']);fog.data.materials.append(m)
S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.resolution_percentage=100;S.cycles.samples=48
cam.location=(16,-25,26);aim(cam,(0,4,1));cam.data.lens=40
if '--draft' in sys.argv:S.render.resolution_percentage=65;S.cycles.samples=16
S.render.filepath=str(R/('승인구도_초벌.png' if '--draft' in sys.argv else '승인구도_최종.png'));bpy.ops.render.render(write_still=True)
placements=[{'id':o.name.replace('배치_','').split('.')[0],'BlenderXYZ':list(o.location),'배율':list(o.scale),'회전Z':math.degrees(o.rotation_euler.z)} for o in clones]
(R/'source/조립-시연전용.json').write_text(json.dumps({'범위':'실제 납품 FBX와 동일 메시/베이크PNG의 Blender 정적 시연. 수면·불·광원·안개·토양은 비납품 검수 대리물. Unity/Player0','카메라':{'BlenderXYZ':list(cam.location),'목표':[0,4,1],'초점mm':cam.data.lens,'수평대비하향각':math.degrees(math.atan2(25,math.hypot(16,29)))},'독액색':{'linearRGB':[.075,.080,.023],'sRGB_HEX':'#4D502A','거칠기':.34,'발광':0},'배치':placements},ensure_ascii=False,indent=2),encoding='utf8')
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_조립.blend'))
if '--draft' not in sys.argv:(R/'renders/조립_입력.json').write_text(json.dumps({'입력':{row['id']:inputs(row['id']) for row in rows},'PNG_SHA256':sha(R/'승인구도_최종.png'),'원본SHA256':sha(R/'source/숲_베이크.blend'),'조립SHA256':sha(R/'source/승인구도_조립.blend'),'레시피SHA256':sha(Path(__file__))},ensure_ascii=False,indent=2),encoding='utf8')
print('승인구도 Blender 정적 렌더 완료',flush=True)
