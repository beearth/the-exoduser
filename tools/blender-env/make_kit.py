import bpy, bmesh, math, random, json, os, hashlib, time
from pathlib import Path
from mathutils import Vector
from mathutils.noise import noise_vector

ROOT=Path('I:/EXODUSER-Storage/demo-art/blender-env')
OUT=ROOT/'delivery/Assets/Exoduser/Art/Environment/CH1_1'
SRC=Path('I:/EXODUSER-Storage/steam-keyshot/pbr-source')
for p in [OUT/'Models',OUT/'Textures',OUT/'Materials',ROOT/'renders',ROOT/'source']:
 p.mkdir(parents=True,exist_ok=True)
random.seed(301030)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
S=bpy.context.scene
S.render.engine='CYCLES';S.cycles.device='CPU';S.cycles.samples=32
S.cycles.use_denoising=True;S.render.threads_mode='FIXED';S.render.threads=12
S.render.image_settings.file_format='PNG';S.render.image_settings.color_mode='RGBA'
S.view_settings.view_transform='AgX';S.view_settings.look='AgX - Medium High Contrast'
S.render.film_transparent=False
S.world.color=(.18,.18,.18)
S.unit_settings.system='METRIC';S.unit_settings.scale_length=1

def select(objs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or objs[-1]
def apply(o,m):
 select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
def mesh(name,vs,fs,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],fs);me.update()
 o=bpy.data.objects.new(name,me);S.collection.objects.link(o);o.data.materials.append(mat)
 return o
def smooth(o):
 for p in o.data.polygons:p.use_smooth=True
 return o
def source_mat(name,tint,texture=None,metal=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear()
 out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs['BSDF'],out.inputs['Surface'])
 bs.inputs['Base Color'].default_value=(*tint,1);bs.inputs['Roughness'].default_value=.77;bs.inputs['Metallic'].default_value=metal
 pos=n.new('ShaderNodeNewGeometry');scale=n.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs[3].default_value=.65;l.new(pos.outputs['Position'],scale.inputs[0])
 if texture:
  tex=n.new('ShaderNodeTexImage');tex.image=bpy.data.images.load(str(SRC/(texture+'_Diffuse.jpg')),check_existing=True);tex.projection='BOX';tex.projection_blend=.28;l.new(scale.outputs[0],tex.inputs['Vector'])
  hsv=n.new('ShaderNodeHueSaturation');hsv.inputs['Saturation'].default_value=.28;hsv.inputs['Value'].default_value=.9;l.new(tex.outputs['Color'],hsv.inputs['Color'])
  mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.6;mix.inputs[2].default_value=(*tint,1);l.new(hsv.outputs[0],mix.inputs[1]);l.new(mix.outputs[0],bs.inputs['Base Color'])
  # CC0 러프니스는 원본에서 이어 받고, 미세 결은 약하게 제한한다.
  rough=n.new('ShaderNodeTexImage');rough.image=bpy.data.images.load(str(SRC/(texture+'_Rough.jpg')),check_existing=True);rough.image.colorspace_settings.name='Non-Color';rough.projection='BOX';rough.projection_blend=.3;l.new(scale.outputs[0],rough.inputs[0]);l.new(rough.outputs[0],bs.inputs['Roughness'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.035;l.new(tex.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
 return m
rock=source_mat('원본_차가운암반',(.49,.54,.58),'rock_face')
bark=source_mat('원본_괴사목질',(.38,.29,.25),'bark_brown_02')
inner=source_mat('원본_찢긴심재',(.39,.28,.20),'bark_brown_02')
stone=source_mat('원본_오래된석조',(.56,.51,.43),'rock_face')
bone=source_mat('원본_낡은상아',(.48,.405,.28))
iron=source_mat('원본_산화철',(.13,.105,.085),metal=.72)
ash=source_mat('원본_재퇴적',(.30,.285,.275),'burned_ground_01')
allmods=[];records=[]

def block(name,loc,scale,mat,seed=0,bevel=.13):
 rng=random.Random(seed)
 bpy.ops.mesh.primitive_cube_add(size=2,location=loc);o=bpy.context.object;o.name=name
 o.scale=scale;select([o]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 for v in o.data.vertices:
  v.co.x+=rng.uniform(-.1,.1)*scale[0];v.co.y+=rng.uniform(-.1,.1)*scale[1];v.co.z+=rng.uniform(-.1,.1)*scale[2]
 o.data.materials.append(mat)
 b=o.modifiers.new('큰마모면','BEVEL');b.width=bevel;b.segments=2;apply(o,b)
 return o
def rockpiece(loc,scale,seed,mat=rock):
 rng=random.Random(seed)
 # 상자 베벨 대신 높이별 불규칙 파단점을 볼록껍질로 연결한다.
 # 절리면은 저주파 큰 평면이며 위·옆면이 직각 상자가 되지 않는다.
 vs=[]
 for k,(height,rad,count) in enumerate([(-.84,.75,7),(-.12,1.02,9),(.74,.56,6)]):
  for j in range(count):
   a=j*math.tau/count+k*.29+rng.uniform(-.14,.14);rr=rad*rng.uniform(.78,1.19)
   vs.append((scale[0]*(rr*math.cos(a)+height*.17),scale[1]*(rr*math.sin(a)-height*.12),scale[2]*(height+rng.uniform(-.26,.23)+.14*math.cos(a))))
 o=mesh('불규칙절리암',vs,[],mat);bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.convex_hull(bm,input=list(bm.verts),use_existing_faces=False)
 orphan=[v for v in bm.verts if not v.link_faces]
 if orphan:bmesh.ops.delete(bm,geom=orphan,context='VERTS')
 bm.to_mesh(o.data);bm.free();o.data.update()
 o.location=loc;o.rotation_euler=(rng.uniform(-.18,.18),rng.uniform(-.24,.24),rng.uniform(-.5,.5))
 b=o.modifiers.new('깨진모서리마모','BEVEL');b.width=min(scale)*.065;b.segments=2;apply(o,b)
 return o

def tube(name,points,radii,mat,sides=12,flutes=0,cap=True):
 vs=[];fs=[]
 for k,p in enumerate(points):
  p=Vector(p);d=Vector(points[min(k+1,len(points)-1)])-Vector(points[max(0,k-1)])
  d.normalize();ref=Vector((0,0,1)) if abs(d.z)<.92 else Vector((1,0,0))
  u=d.cross(ref).normalized();v=d.cross(u).normalized()
  for j in range(sides):
   a=2*math.pi*j/sides;r=radii[k]*(1+flutes*math.sin(a*5+k*.38)+.035*math.cos(a*3+k*.8))
   vs.append(tuple(p+r*(u*math.cos(a)+v*math.sin(a))))
 for k in range(len(points)-1):
  for j in range(sides):a=k*sides+j;b=k*sides+(j+1)%sides;fs.append((a,b,b+sides,a+sides))
 if cap:fs.extend([tuple(reversed(range(sides))),tuple((len(points)-1)*sides+j for j in range(sides))])
 return smooth(mesh(name,vs,fs,mat))
def curved(name,pts,rs,mat=bark,sides=12,flutes=.1):
 # Catmull-Rom 보간으로 원뿔/직선 가지 대신 무게가 있는 굽은 형태를 만든다.
 ps=[];rr=[]
 for i in range(len(pts)-1):
  p0=Vector(pts[max(0,i-1)]);p1=Vector(pts[i]);p2=Vector(pts[i+1]);p3=Vector(pts[min(len(pts)-1,i+2)])
  for j in range(5):
   t=j/5;ps.append(tuple(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t)));rr.append(rs[i]*(1-t)+rs[i+1]*t)
 ps.append(pts[-1]);rr.append(rs[-1]);return tube(name,ps,rr,mat,sides,flutes)

def hollow_trunk():
 N=28;K=10;vs=[];fs=[]
 for wall in range(2):
  for k in range(K):
   t=k/(K-1);cx=.38*math.sin(t*2);cy=.26*t*t
   for j in range(N):
    a=j*math.tau/N;r=(1.15-.5*t)*(1+.13*math.cos(a*6+t*1.5)+.09*math.sin(a*3-t))
    if wall:r-=.17+.04*math.sin(a*3)
    z=t*3.9+(max(0,t-.7)/.3)*(.48*math.sin(a*4)+.24*math.cos(a*9))
    vs.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
 for w in range(2):
  for k in range(K-1):
   for j in range(N):
    a=w*N*K+k*N+j;b=w*N*K+k*N+(j+1)%N
    fs.append((a,b,b+N,a+N) if not w else (a+N,b+N,b,a))
 for j in range(N):
  a=(K-1)*N+j;b=(K-1)*N+(j+1)%N;fs.append((a,b,b+N*K,a+N*K))
 o=smooth(mesh('갈라진속빈고목',vs,fs,bark));o.data.materials.append(inner)
 for p in o.data.polygons:
  if p.index>=(K-1)*N:p.material_index=1
 return o

def join_parts(parts,name):
 select(parts);bpy.ops.object.convert(target='MESH');bpy.ops.object.join();o=bpy.context.object;o.name=name
 bpy.context.scene.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR');bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 # Boolean 처리 후 생기는 미사용 빈 슬롯은 합치기 경계에서 제거한다.
 for i in reversed(range(len(o.data.materials))):
  if o.data.materials[i] is None:
   assert not any(p.material_index==i for p in o.data.polygons), '면이 참조하는 빈 재질'
   o.data.materials.pop(index=i)
 return o
def addmod(name,parts,role):
 o=join_parts(parts,name);allmods.append(o);records.append({'id':name,'역할':role});return o

# 1. 연속 외곽 대형: 타원 바위 반복을 피하고 길게 갈라진 절리면과 내려가는 밑면을 조형.
parts=[]
for i,(x,y,z,sx,sy,sz) in enumerate([(-2.7,.55,1.6,1.55,1.55,2.0),(-.8,1.1,2,1.75,1.5,2.55),(1.5,1.2,1.5,1.55,1.4,2.1),(3,.7,.8,1.0,1.35,1.5),(-2.5,-.5,.25,1.6,.9,.7),(.3,-.45,.1,2.2,1.1,.65),(2.5,-.6,-.1,1.2,1.1,.6)]):
 parts.append(rockpiece((x,y,z),(sx,sy,sz),70+i))
addmod('HE_Cliff_Mass_A',parts,'큰암반·연속외곽')
parts=[]
for i,(x,y,z,sx,sy,sz) in enumerate([(-2.7,.6,-1.8,1.6,1.1,2.7),(-.6,.8,-2.0,1.4,1.25,3.2),(1.6,.6,-1.7,1.7,1.15,2.4),(0,-.5,-.05,2.7,1.0,.5),(2.5,-.1,-.45,1.4,.9,.4)]):parts.append(rockpiece((x,y,z),(sx,sy,sz),170+i))
addmod('HE_Cliff_Drop_B',parts,'절벽끝·심연전경, 윗턱 높이0.5m')
parts=[rockpiece((-.7,0,.7),(1.4,1.1,1),270),rockpiece((.95,.3,.5),(1,1.1,.7),271),rockpiece((-.2,-1,.13),(1.25,.7,.3),272)]
addmod('HE_Rock_Connector',parts,'대형암반–바닥 중형접합')

# 2. 나무: 비대칭 휜 몸통, 속 빈 상단, 굵은 둔단 가지, 바닥에 눕는 뿌리.
parts=[hollow_trunk()]
for j,(a,length) in enumerate([(0,3.4),(.8,2.8),(1.9,3.1),(3.0,3.9),(4.0,2.6),(5.1,3.5)]):
 ca=math.cos(a);sa=math.sin(a)
 parts.append(curved('넓은판뿌리',[(.55*ca,.55*sa,.85),(1.3*ca,1.3*sa,.32),(length*.74*ca,length*.74*sa,.14),(length*ca,length*sa,.035)],[.38,.32,.18,.045],sides=14))
parts.append(curved('부러진굵은가지',[(.25,0,2.0),(-.8,.1,2.2),(-1.6,.4,2.7),(-2.0,.5,2.8)],[.38,.31,.19,.17]))
parts.append(curved('처진가지',[(.45,.2,2.6),(1.2,.7,2.45),(1.7,.9,2.0)],[.3,.22,.14]))
addmod('HE_Deadwood_Hollow',parts,'뒤틀린 부패고목·판뿌리')
parts=[curved('쓰러진심재',[(-3,0,.3),(-1.7,.2,.6),(-.1,.4,.65),(1.4,.3,.32),(3,-.1,.1)],[.22,.48,.43,.28,.12],sides=20,flutes=.16)]
parts.append(curved('부러진목질가지',[(-.8,.2,.6),(-.6,1,.6),(.1,1.8,.3),(.8,2.3,.12)],[.24,.18,.12,.06]))
parts.append(curved('바닥유착뿌리',[(.4,.3,.4),(1,-.6,.25),(2,-1.4,.1),(3.6,-1.8,.02)],[.22,.2,.11,.035]))
addmod('HE_Root_Fallen',parts,'목질–바닥 낮은접합')

# 3. 석조: 개별 줄눈·큰 결손·불규칙 붕괴선. 완벽한 원기둥 반복을 피한다.
parts=[]
for row,count in enumerate([6,5,3]):
 for j in range(count):
  x=(j-(count-1)*.5)*.94+(.22 if row%2 else 0)
  parts.append(block('무너진성벽석',(x,0,.34+row*.66),(.47,.43,.32),stone,400+row*10+j,.055))
for j in range(6):parts.append(rockpiece((random.uniform(-2.8,2.8),random.uniform(-1.25,-.5),.18),(.5,.4,.25),500+j,stone))
addmod('HE_Ruin_Wall',parts,'무너진 석벽·기단')
parts=[]
for k in range(4):
 bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=.54 if k in [0,3] else .4,depth=.32 if k in [0,3] else .75,location=(.06*k,0,.16+(0 if k==0 else .32+(k-1)*.75)))
 o=bpy.context.object;o.data.materials.append(stone);b=o.modifiers.new('마모몰딩','BEVEL');b.width=.045;b.segments=2;apply(o,b);parts.append(o)
parts.append(block('부러진주두',(.18,.04,2.28),(.56,.51,.15),stone,610,.08))
for j in range(3):parts.append(rockpiece((-.9+j*.7,-.9,.16),(.4,.4,.23),620+j,stone))
addmod('HE_Ruin_Pillar',parts,'부러진 기둥·낮은보조실루엣')

# 4. 뼈: 좌우 갈비 곡선, 분절 척추, 구멍이 뚫린 두개골·긴뼈.
parts=[]
for j in range(8):
 x=-1.25+j*.33
 parts.append(block('척추마디',(x,0,.37),(.12,.13,.15),bone,700+j,.09))
 for sign in [-1,1]:parts.append(curved('갈비뼈',[(x,0,.45),(x+.03,sign*.42,.77),(x-.03,sign*.8,.63),(x-.13,sign*.98,.19)],[.055,.06,.05,.028],bone,sides=8,flutes=0))
parts.append(curved('대퇴골',[(-.3,-1.15,.15),(.3,-1.6,.13),(1.1,-1.8,.12)],[.12,.065,.13],bone,sides=10,flutes=0))
# 두개골의 안와는 실제 메시 Boolean. 텍스처 검은 점으로 대체하지 않는다.
bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=12,location=(-1.95,.12,.30));sk=bpy.context.object;sk.scale=(.4,.31,.3);select([sk]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);sk.data.materials.append(bone)
for y in [-.17,.17]:
 bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,radius=.13,location=(-2.23,y+.12,.35));cut=bpy.context.object
 b=sk.modifiers.new('실제안와','BOOLEAN');b.object=cut;b.operation='DIFFERENCE';apply(sk,b);bpy.data.objects.remove(cut,do_unlink=True)
parts.append(smooth(sk));parts.append(block('턱뼈',(-2.20,.12,.13),(.18,.23,.055),bone,730,.03))
addmod('HE_Bone_Heap',parts,'갈비·척추·두개골 무더기')

# 5. 쇠사슬: 실제로 교차하는 타원 고리. 정면 텍스처 선이 아니다.
parts=[]
for j in range(17):
 bpy.ops.mesh.primitive_torus_add(major_segments=16,minor_segments=6,location=(-2.6+j*.32,.3*math.sin(j*.23),.09),major_radius=.16,minor_radius=.033)
 o=bpy.context.object;o.scale=(1.4,1,1);o.rotation_euler.x=math.pi/2 if j%2 else 0;o.data.materials.append(iron);parts.append(smooth(o))
addmod('HE_Chain_Drape',parts,'교차 타원 쇠사슬·높은장식 금지')

# 6. 재 둔덕: 넓은 낮은 형태에만 지형 퇴적, 자갈은 가장자리 작은 군집.
parts=[]
bpy.ops.mesh.primitive_uv_sphere_add(segments=28,ring_count=12,location=(0,0,-.10));o=bpy.context.object
o.scale=(2.6,1.6,.46);select([o]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
for v in o.data.vertices:
 v.co.z=max(-.05,v.co.z)*(1+.22*math.sin(v.co.x*1.8+v.co.y))
o.data.materials.append(ash);parts.append(smooth(o))
for j in range(15):
 a=j*2.399;r=1.35+.45*math.sin(j*1.2)
 parts.append(rockpiece((r*math.cos(a)*1.3,r*math.sin(a)*.75,.04),(.11+.08*(j%3),.12+.04*(j%2),.10),800+j,rock))
addmod('HE_Ash_Gravel',parts,'낮은 잿더미·자갈 접합')

# 7. 먼 폐허: 높이 차이가 큰 개구부·절반 아치, 실루엣만으로 깊이를 만든다.
def archpiece(cx,cz,r,a0,a1,width,depth):
 vs=[]
 for y in [-depth,depth]:
  for rr in [r,r+width]:
   for a in [a0,a1]:vs.append((cx+rr*math.cos(a),y,cz+rr*math.sin(a)))
 return mesh('아치쐐기석',vs,[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)],stone)
parts=[]
for x,height in [(-2.5,6.5),(2.5,4.2)]:
 for k in range(int(height/.64)):parts.append(block('먼탑석조',(x,.05,k*.64+.3),(.57,.65,.31),stone,900+k+int(x*5),.04))
for j in range(9):parts.append(archpiece(0,3.2,1.92,j*math.pi/11,(j+1)*math.pi/11-.025,.53,.52))
parts.append(block('뒤쪽두꺼운버팀벽',(-3.9,.4,1.5),(1.0,.63,1.55),stone,940,.09))
addmod('HE_Vista_Ruined_Arch',parts,'심연너머 먼 폐허·비보행 BACK')

# 원본 킷: 모든 고해상도 베이크 입력은 따로 보존, 런타임 FBX는 로우만.
for o in allmods:o.hide_render=True;o.hide_set(True)
manifest=[]
previous=json.loads((ROOT/'source/모듈명세.json').read_text(encoding='utf8')) if (ROOT/'source/모듈명세.json').exists() else []
changed={'HE_Cliff_Mass_A','HE_Cliff_Drop_B','HE_Rock_Connector','HE_Ruin_Wall','HE_Ruin_Pillar','HE_Ash_Gravel'}
complete={r['id'] for r in previous if r['id'] not in changed}
for idx,low in enumerate(allmods):
 print('모듈 베이크 시작',idx,low.name,flush=True)
 low.hide_render=False;low.hide_set(False)
 select([low]);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.025);bpy.ops.object.mode_set(mode='OBJECT')
 high=low.copy();high.data=low.data.copy();S.collection.objects.link(high);high.name=low.name+'_High'
 # 실루엣 유지용 SIMPLE 세분화와 낮은 주파수 조형. 고주파 점무늬를 만들지 않는다.
 sub=high.modifiers.new('하이폴리세분화','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;apply(high,sub)
 # 작은 베벨이 뒤집히는 정점 변위는 사용하지 않는다. 넓은 조형은 실제 로우 메시,
 # 하이폴리의 미세 표면은 CC0 범프로 만든 뒤 노멀에 투영한다.
 # 하이폴리 법선은 실물 조형·CC0 범프를 포함. 커브/모서리 베이크는 각 메시에서 실제 실행.
 select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
 original_mats=list(high.data.materials)
 target=bpy.data.materials.new(low.name+'_베이크표적');target.use_nodes=True
 low.data.materials.clear();low.data.materials.append(target)
 for p in low.data.polygons:p.material_index=0
 size=2048 if idx in [0,1,3,10] else 1024
 texpaths={};images={}
 bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.18;bak.max_ray_distance=.4;bak.margin=12
 for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
  path=OUT/'Textures'/(low.name+'_'+kind+'.png')
  if low.name in complete and path.exists():
   im=bpy.data.images.load(str(path),check_existing=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color';images[kind]=im;texpaths[kind]=str(path.relative_to(ROOT));continue
  im=bpy.data.images.new(low.name+'_'+kind,width=size,height=size,alpha=False)
  im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color'
  if kind=='Normal':im.generated_color=(.5,.5,1,1)
  node=target.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;target.node_tree.nodes.active=node
  # 모든 출력은 같은 UV와 하이→로우 투영을 사용한다.
  if kind in ['BaseColor','Roughness','Metallic','Curvature']:
   for m in original_mats:
    n=m.node_tree.nodes;l=m.node_tree.links;out=next(x for x in n if x.type=='OUTPUT_MATERIAL');bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');em=n.new('ShaderNodeEmission');em.name='임시베이크'
    if kind=='Curvature':
     geom=n.new('ShaderNodeNewGeometry');geom.name='임시곡률';l.new(geom.outputs['Pointiness'],em.inputs['Color'])
    else:
     socket=bs.inputs['Base Color' if kind=='BaseColor' else kind]
     if socket.is_linked:l.new(socket.links[0].from_socket,em.inputs['Color'])
     elif kind=='BaseColor':em.inputs['Color'].default_value=socket.default_value
     else:em.inputs['Color'].default_value=(*([socket.default_value]*3),1)
    l.new(em.outputs[0],out.inputs['Surface'])
   typ='EMIT'
  else:typ='NORMAL' if kind=='Normal' else 'AO'
  select([high,low],low);S.cycles.samples=16 if kind=='AO' else 1
  bpy.ops.object.bake(type=typ)
  path=OUT/'Textures'/(low.name+'_'+kind+'.png');im.filepath_raw=str(path);im.file_format='PNG';im.save();images[kind]=im;texpaths[kind]=str(path.relative_to(ROOT))
  for m in original_mats:
   n=m.node_tree.nodes;l=m.node_tree.links;out=next(x for x in n if x.type=='OUTPUT_MATERIAL');bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');l.new(bs.outputs[0],out.inputs['Surface'])
   for x in list(n):
    if x.name.startswith('임시'):n.remove(x)
  target.node_tree.nodes.remove(node)
 # 렌더는 베이크된 PBR만 사용한다. 원본 좌표와 절차식 재질 의존 없음.
 n=target.node_tree.nodes;l=target.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0])
 col=n.new('ShaderNodeTexImage');col.image=images['BaseColor']
 ao=n.new('ShaderNodeTexImage');ao.image=images['AO'];mult=n.new('ShaderNodeMixRGB');mult.blend_type='MULTIPLY';mult.inputs[0].default_value=.55;l.new(col.outputs[0],mult.inputs[1]);l.new(ao.outputs[0],mult.inputs[2]);l.new(mult.outputs[0],bs.inputs['Base Color'])
 normal=n.new('ShaderNodeTexImage');normal.image=images['Normal'];nm=n.new('ShaderNodeNormalMap');l.new(normal.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
 for kind in ['Roughness','Metallic']:
  tx=n.new('ShaderNodeTexImage');tx.image=images[kind];l.new(tx.outputs[0],bs.inputs[kind])
 high.hide_render=True;high.hide_set(True)
 select([low]);bpy.ops.export_scene.fbx(filepath=str(OUT/'Models'/(low.name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 bounds=[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)]
 manifest.append({**records[idx],'정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'텍스처해상도':size,'범위XYZ최소최대':bounds,'텍스처':texpaths,'베이크':'Blender Cycles CPU selected-to-active, normal/AO/pointiness/basecolor/roughness/metallic'})
 low.hide_render=True;low.hide_set(True)
 (ROOT/'source/모듈명세.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
 print('모듈 완료',low.name,flush=True)

# 렌더 스튜디오: 모든 모듈 동일 52도 카메라, 동일 노출/광원. 보이는 모듈 크기는 명세 미터 기준.
def aim(o,point):o.rotation_euler=(Vector(point)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,power,color,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=loc;aim(o,(0,0,1));return o
area('넓은중립키',(-5,-6,10),1550,(.83,.9,1),7)
area('따뜻한보조',(6,-1,5),1000,(1,.72,.48),6)
area('차가운윤곽',(-2,5,8),1800,(.58,.74,1),5)
ground=source_mat('검수바닥',(.065,.071,.08))
bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='검수용바닥';floor.data.materials.append(ground)
bpy.ops.object.camera_add();cam=bpy.context.object;S.camera=cam;cam.data.type='ORTHO';cam.data.lens=50
S.cycles.samples=24;S.render.resolution_x=1600;S.render.resolution_y=1000;S.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/환경모듈_하이로우_베이크.blend'))
for idx,o in enumerate(allmods):
 if idx>0:continue
 o.hide_render=False;o.hide_set(False)
 bounds=manifest[idx]['범위XYZ최소최대'];center=Vector(((bounds[0]+bounds[3])/2,(bounds[1]+bounds[4])/2,(bounds[2]+bounds[5])/2))
 extent=max(bounds[3]-bounds[0],bounds[4]-bounds[1],(bounds[5]-bounds[2])*1.35)
 floor.location.z=bounds[2]-.025
 cam.location=center+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));aim(cam,center);cam.data.ortho_scale=max(2.5,extent*1.4)
 S.render.filepath=str(ROOT/'renders'/(o.name+'.png'));bpy.ops.render.render(write_still=True)
 # 같은 카메라에서 모듈만 90도 회전해 측면을 확인한다.
 o.rotation_euler.z=math.pi/2;S.render.filepath=str(ROOT/'renders'/(o.name+'_side.png'));bpy.ops.render.render(write_still=True);o.rotation_euler.z=0
 o.hide_render=True;o.hide_set(True)

floor.hide_render=True
bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/환경모듈_하이로우_베이크.blend'))
(ROOT/'source/완료.json').write_text(json.dumps({'모듈수':len(manifest),'Unity실행':0,'시간':time.time()},ensure_ascii=False,indent=2),encoding='utf8')
print('환경 킷 생성 및 렌더 종료',flush=True)
