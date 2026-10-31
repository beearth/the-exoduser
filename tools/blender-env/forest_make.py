import bpy, bmesh, math, random, json, os, hashlib, time
from pathlib import Path
from mathutils import Vector
from mathutils.noise import noise_vector

ROOT=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1')
OUT=ROOT/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
SRC=ROOT/'pbr-source'
for p in [OUT/'Models',OUT/'Textures',OUT/'Materials',ROOT/'renders',ROOT/'source']:
 p.mkdir(parents=True,exist_ok=True)
random.seed(301031)
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
bark=source_mat('원본_괴사목질',(.28,.26,.22),'bark_brown_02')
inner=source_mat('원본_찢긴심재',(.39,.29,.19),'bark_brown_02')
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


# 큰 썩은 숲 질량을 먼저 조형한다. 뾰족한 원뿔 숲 대신 비대칭 낙엽수의 체중선.
import sys
mode=sys.argv[sys.argv.index('--mode')+1] if '--mode' in sys.argv else 'shape'
wood=source_mat('썩은판재_목질',(.37,.28,.18),'bark_brown_02')
rope=source_mat('젖은밧줄',(.26,.24,.16))
moss=source_mat('늘어진죽은이끼',(.19,.22,.105),'burned_ground_01')
fungus=source_mat('균사_회황색',(.42,.375,.22),'burned_ground_01')
foam=source_mat('강가_탁한거품',(.39,.42,.24))
wet=source_mat('강바닥_괴사퇴적',(.20,.225,.15),'burned_ground_01')
for mat in [wood,rope,moss,fungus,foam,wet]:
 bs=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.82 if mat!=foam else .51
# 반복 파동 목리는 폐기하고 공식 CC0 실물 목재로 교체.
wood=source_mat('썩은판재_CC0목재',(.42,.36,.28),'fine_grained_wood')

def remesh_union(parts,name,voxel=.085,ratio=.3):
 o=join_parts(parts,name);select([o]);rm=o.modifiers.new('목질관절연결','REMESH');rm.mode='VOXEL';rm.voxel_size=voxel;apply(o,rm)
 sm=o.modifiers.new('넓은조형다듬기','SMOOTH');sm.factor=.45;sm.iterations=3;apply(o,sm)
 dec=o.modifiers.new('실루엣보존감면','DECIMATE');dec.ratio=ratio;apply(o,dec);smooth(o)
 return o

if mode=='shape':
 parts=[curved('기울어진거목몸통',[(0,0,0),(-.12,.06,1.1),(.12,.18,2.3),(.52,.30,3.8),(.29,.35,5.2),(.64,.49,6.6),(.48,.53,7.3)],[1.03,.76,.60,.45,.33,.20,.13],bark,24,.16)]
 limbs=[([(.2,.18,2.8),(-.8,.2,3.4),(-1.9,.42,3.7),(-2.8,.62,4.6),(-3.2,.8,4.75)],[.46,.36,.25,.15,.12]),
 ([(.5,.3,3.9),(1.5,.2,4.3),(2.8,.05,4.0),(3.7,.1,4.5)],[.37,.27,.16,.10]),
 ([(.35,.3,5.0),(-.7,.64,5.65),(-1.2,.9,6.5),(-2.0,1,6.9)],[.29,.21,.12,.075]),
 ([(.6,.45,6.2),(1.5,.7,6.7),(2.4,.9,6.5)],[.19,.13,.08]),
 ([(.1,.2,2.4),(.2,1.2,2.9),(.7,2.15,3.6),(.6,2.75,3.8)],[.39,.28,.16,.1]),
 ([(-1.9,.42,3.7),(-2.1,-.3,4.7),(-2,-.5,5.4)],[.18,.12,.065])]
 for pts,rs in limbs:parts.append(curved('부러진굵은가지',pts,rs,bark,16,.14))

 # 뿌리는 기존 CC0 스캔으로 교체. 규칙적인 원뿔 뿌리는 모두 제거.
 tree=remesh_union(parts,'거목_연결조형',.065,.34)
 # 부패 공동은 줄기 전면의 실제 음각.
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=(-.13,-.48,1.45));cut=bpy.context.object;cut.scale=(.38,.52,.72);select([cut]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 mod=tree.modifiers.new('썩어비어있는공동','BOOLEAN');mod.object=cut;mod.operation='DIFFERENCE';apply(tree,mod);bpy.data.objects.remove(cut,do_unlink=True)
 # 가는 가지는 굵은 줄기에서 자연스럽게 분기하고 아래로 처진다.
 details=[]
 for j,(pts,rs) in enumerate(limbs):
  start=Vector(pts[-2]);tip=Vector(pts[-1]);d=(tip-start).normalized();side=d.cross(Vector((0,0,1))).normalized()
  for sign in [-1,1]:
   q=start.lerp(tip,.45);e=q+d*(.75+.15*(j%3))+side*(sign*.44)+Vector((0,0,.35 if j%2 else -.22));tail=e+d*.35+Vector((0,0,-.23))
   details.append(curved('처진측가지',[tuple(q),tuple(e),tuple(tail)],[rs[-2]*.50,.035,.008],bark,8,.05))

 with bpy.data.libraries.load('I:/EXODUSER-Storage/demo-art/blender-env/source/환경모듈_최종.blend',link=False) as (src,dst):dst.objects=['HE_Deadwood_Hollow']
 foot=dst.objects[0];S.collection.objects.link(foot);foot.hide_render=False;foot.hide_set(False);select([foot]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 v=foot.data.vertices;mn=Vector(tuple(min(x.co[k] for x in v) for k in range(3)));mx=Vector(tuple(max(x.co[k] for x in v) for k in range(3)));c=(mn+mx)*.5;scale=4.8/max(mx.x-mn.x,mx.y-mn.y)
 for x in v:x.co=Vector(((x.co.x-c.x)*scale,(x.co.y-c.y)*scale,(x.co.z)*scale-.45))
 bm=bmesh.new();bm.from_mesh(foot.data);bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),plane_co=(0,0,1.3),plane_no=(0,0,1),dist=.00001,clear_outer=True,clear_inner=False);bm.to_mesh(foot.data);bm.free();foot.data.update()
 foot.data.materials.clear();foot.data.materials.append(bark)
 for face in foot.data.polygons:face.material_index=0
 tree=join_parts([tree,foot]+details,'거목_스캔뿌리_완성')
 addmod('RF_Ancient_Rotten_Tree',[tree],'외곽 거목·검게 썩은 줄기·낮게 펼쳐진 뿌리, 높이7m')
 # 쓰러진 고목: 넓은 찢긴 끝단, 뿌리판, 낮은 부러진 가지.
 parts=[curved('쓰러진큰줄기',[(-3.4,.25,.62),(-2,.1,.7),(-.5,0,.67),(1.1,-.1,.54),(2.7,-.12,.46),(3.5,-.08,.40)],[.56,.63,.58,.49,.39,.27],bark,24,.19)]
 for pts,rs in [([(-2.3,0,.8),(-2.8,.9,1.2),(-3.3,1.6,1.1)],[.3,.21,.08]),([(-.2,0,.7),(.0,.7,1.0),(.7,1.5,1.1)],[.28,.18,.10]), ([(1,-.15,.6),(1.4,-.75,.45),(2.4,-1.3,.17)],[.22,.14,.04])]:parts.append(curved('남은부러진가지',pts,rs,bark,14,.14))
 for j in range(7):
  a=j*math.tau/7;parts.append(curved('들린뿌리',[(-3.1,.2,.55),(-3.7,.2+.8*math.cos(a),.55+.6*math.sin(a)),(-4.3,.2+1.3*math.cos(a),.55+1.1*math.sin(a))],[.22,.13,.04],bark,10,.1))
 addmod('RF_Fallen_Log',[remesh_union(parts,'고목_연결조형',.055,.3)],'쓰러진 고목·뜯긴 뿌리판·낮은 바닥 접합')
 # 늘어진 이끼는 두께가 있는 불규칙 리본. 동일 길이의 실선 수염은 피한다.
 parts=[]
 for j in range(10):
  x=-1.3+j*.28;length=[1.05,1.65,1.3,2.1,1.8,2.35,1.5,2.0,1.2,1.6][j];vs=[];faces=[]
  for k in range(8):
   t=k/7;w=.15*(1-t)**.65+.014;cx=x+.11*math.sin(t*4+j);y=.13*math.sin(t*3+j*.5);z=2.5-length*t
   vs.extend([(cx-w,y,z),(cx,y-.10*math.sin(t*math.pi),z+.025),(cx+w,y+.03,z-.02)])
  for k in range(7):
   for a in range(2):f=k*3+a;faces.append((f,f+1,f+4,f+3))
  o=mesh('축늘어진이끼막',vs,faces,moss);sol=o.modifiers.new('이끼막두께','SOLIDIFY');sol.thickness=.018;apply(o,sol);parts.append(smooth(o))
 parts.append(curved('붙는목질능선',[(-1.6,0,2.5),(-.6,0,2.65),(.6,0,2.58),(1.5,0,2.5)],[.16,.18,.14,.08],bark,12,.1))
 addmod('RF_Hanging_Moss',parts,'가지에 붙이는 축 늘어진 이끼 덩어리·정적인 메시')
 # 갓버섯이 아닌 층상 목재 부후균. 균사 연결은 굵은 저주파 필라멘트.
 parts=[]
 for j,(x,y,z,sx,sy) in enumerate([(-.75,.12,.23,.75,.45),(-.15,.0,.38,.65,.44),(.6,.12,.18,.7,.5),(-.4,.35,.62,.53,.35),(.4,.42,.51,.48,.35)]):
  bpy.ops.mesh.primitive_uv_sphere_add(segments=20,ring_count=10,location=(x,y,z));o=bpy.context.object;o.scale=(sx,sy,.12);select([o]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(fungus);parts.append(smooth(o))
 for j in range(6):
  a=j*.9;parts.append(curved('굵은균사',[(-.4,0,.12),(.5*math.cos(a),.5*math.sin(a),.08),(1.4*math.cos(a),.85*math.sin(a),.025)],[.045,.035,.01],fungus,8,0))
 addmod('RF_Fungal_Colony',parts,'층상 부후균·노출 균사, 나무 밑 낮은 덩어리')
 parts=[]
 for j in range(7):
  a=j*2.399;L=.75+.28*(j%3);h=.7+.25*(j%4);x,y=math.cos(a),math.sin(a)
  pts=[(0,0,.05),(.25*x,.25*y,h*.6),(.65*x,.65*y,h),(L*x,L*y,h*.55)]
  parts.append(curved('죽은덤불줄기',pts,[.065,.047,.027,.011],bark,8,.08))
  parts.append(curved('아래로처진끝가지',[pts[1],(.6*x-.25*y,.6*y+.25*x,h*.65),(L*x-.3*y,L*y+.3*x,h*.35)],[.035,.022,.008],bark,7,0))
 addmod('RF_Withered_Shrub',parts,'시든 덤불·성긴 낮은 가지, 전투중앙 제외')
 # 강가의 높이 차이: 부식된 긴 암반 턱과 진흙 경사, 수면 자체는 생성하지 않는다.
 parts=[]
 for j,(x,y,z,sx,sy,sz) in enumerate([(-2.5,.4,.1,1.6,1.1,.7),(-.5,.65,.24,1.6,1.1,.9),(1.7,.6,.06,1.8,1.0,.65),(3,.35,-.2,1.0,.9,.55),(-1,-.5,-.24,1.7,.65,.4),(1.5,-.65,-.38,1.4,.7,.4)]):parts.append(rockpiece((x,y,z),(sx,sy,sz),1700+j,rock))
 parts.append(curved('노출된강가뿌리',[(-2,1,.65),(-1,.3,.39),(.5,-.1,.04),(1.8,-.4,-.18)],[.24,.18,.11,.035],bark,14,.1))
 addmod('RF_Corroded_Riverbank',parts,'독액 강가 부식 암반·뿌리 경사. 수면 기준Z0, 하부는 물속')
 # 강바닥은 양끝 높이를 맞춘 격자이며 중앙만 낮다. 물·움직임·셰이더 없음.
 vs=[];faces=[];nx,ny=24,12
 for j in range(ny+1):
  y=-3+j*6/ny
  for i in range(nx+1):
   x=-5+i*10/nx;z=-.9+.56*(abs(y)/3)**1.7+.06*math.sin(x*1.4)*math.cos(y*.8);vs.append((x,y,z))
 for j in range(ny):
  for i in range(nx):a=j*(nx+1)+i;faces.append((a,a+1,a+nx+2,a+nx+1))
 parts=[smooth(mesh('완만하게패인강바닥',vs,faces,wet))]
 for x,y in [(-3,1.6),(-1,-1.9),(2,1.7),(3.4,-1.8)]:parts.append(rockpiece((x,y,-.58),(.6,.5,.17),int(x*10+1800),rock))
 addmod('RF_Riverbed',parts,'10×6m 강바닥 형태, 양끝Z 동일·중앙수심. 시각 메시, 보행/충돌 계약 아님')
 parts=[]
 for j in range(13):
  x=-1.6+j*.26;y=.1*math.sin(j*.8);r=[.12,.19,.15,.22,.13,.18,.11][j%7]
  bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=(x,y,-.035));o=bpy.context.object;o.scale=(r,r*.8,r*.5);select([o]);bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);o.data.materials.append(foam);parts.append(smooth(o))
 addmod('RF_Foam_Bank',parts,'강가에 붙이는 탁한 거품 둔덕, 정적 메시·물 셰이더 제외')
 # 두꺼운 판자·하중 받침보·밧줄·말뚝. 중앙 유효 폭 2.8m, 관람용 난간은 낮음.
 parts=[]
 for y in [-1.0,1.0]:parts.append(curved('하중받는긴보',[(-4.2,y,.18),(-1.4,y,-.02),(1.4,y,0),(4.2,y,.21)],[.17,.19,.19,.16],bark,12,.12))
 for j in range(19):
  x=-3.9+j*.43;z=.43-.23*math.sin((j/18)*math.pi);ob=block('갈라진두꺼운판자',(x,.045*math.sin(j*2),z),(.20,1.48+(j%3-.9)*.08,.105),wood,2100+j,.045);ob.rotation_euler.z=.018*math.sin(j*3);parts.append(ob)
 for x in [-3.8,0,3.8]:
  for y in [-1.65,1.65]:
   parts.append(curved('부식된말뚝',[(x,y,-.15),(x+.07,y,.5),(x-.03,y,1.3)],[.14,.13,.09],bark,12,.12))
   for k in range(3):
    bpy.ops.mesh.primitive_torus_add(major_segments=12,minor_segments=5,major_radius=.15,minor_radius=.018,location=(x,y,.9+k*.042));o=bpy.context.object;o.data.materials.append(rope);parts.append(smooth(o))
 for y in [-1.65,1.65]:
  for a,b in [(-3.8,0),(0,3.8)]:parts.append(curved('처진안전밧줄',[(a,y,1.08),(a+(b-a)*.33,y,.78),(a+(b-a)*.66,y,.75),(b,y,1.08)],[.033,.033,.033,.033],rope,8,0))
 addmod('RF_Rotten_Wood_Bridge',parts,'썩은 나무다리·판자·하중보·밧줄·말뚝. 유효폭 약2.8m, Collider0')
 # 무너진 돌다리: 쐐기 아치의 구조적 두께와 불완전 난간.
 parts=[];N=13;r=2.9
 for j in range(N):
  a=math.pi*.10+j*math.pi*.80/N;b=math.pi*.10+(j+1)*math.pi*.80/N-.012
  o=archpiece(0,-2.1,r,a,b,.58,1.55) if 'archpiece' in globals() else None
  if o:parts.append(o)
 # 아치 쐐기 형상은 단순 큐브 나열이 아니며 안쪽 하중 곡선을 만든다.
 if not parts:
  for j in range(N):
   a=math.pi*.10+j*math.pi*.80/N;b=math.pi*.10+(j+1)*math.pi*.80/N-.015;v=[]
   for y in [-1.55,1.55]:
    for rr in [r,r+.62]:
     for th in [a,b]:v.append((rr*math.cos(th),y,-2.1+rr*math.sin(th)))
   parts.append(mesh('부서진아치쐐기석',v,[(0,1,3,2),(4,6,7,5),(0,4,5,1),(2,3,7,6),(0,2,6,4),(1,5,7,3)],stone))
 for j in range(14):
  x=-3.45+j*.53;z=.56+.20*math.cos(x*.4)
  for row in [-1,0,1]:parts.append(block('마모된다리포장석',(x,row*1.02,z),(.26,.5,.16),stone,2400+j*3+row,.045))
 for x in [-3.15,-2.5,-1.85,1.2,1.85,2.5,3.15]:
  for y in [-1.6,1.6]:
   if y<0 and x in [-1.85,1.2]:continue
   parts.append(block('부러진난간석',(x,y,.99 if x<0 else 1.12),(.29,.18,.34 if x<0 else .42),stone,2500+int(x*10+y),.065))
 for x in [-3.2,3.2]:parts.append(rockpiece((x,0,-.65),(.8,1.7,1.25),2600+int(x*10),stone))
 addmod('RF_Broken_Stone_Bridge',parts,'마모된 아치 돌다리·부분 붕괴 난간, 유효폭2.9m·경로 별도 검증')
 for o in allmods:o.hide_render=True;o.hide_set(True)
 # 동일 스튜디오 카메라·조명, 52도 내려다봄.
 def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
 for name,loc,power,color,size in [('중립키',(-5,-6,10),1550,(.83,.9,1),7),('따뜻한보조',(6,-1,5),1000,(1,.72,.48),6),('차가운윤곽',(-2,5,8),1800,(.58,.74,1),5)]:
  d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=loc;aim(o,(0,0,1))
 ground=source_mat('검수바닥',(.07,.075,.085));bpy.ops.mesh.primitive_plane_add(size=200);floor=bpy.context.object;floor.name='검수용바닥';floor.data.materials.append(ground)
 bpy.ops.object.camera_add();cam=bpy.context.object;S.camera=cam;cam.data.type='ORTHO'
 S.render.resolution_x=1600;S.render.resolution_y=1000;S.render.resolution_percentage=100
 (ROOT/'source/형태명세.json').write_text(json.dumps(records,ensure_ascii=False,indent=2),encoding='utf8')
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/숲_형태.blend'))
 for name in ['RF_Ancient_Rotten_Tree','RF_Rotten_Wood_Bridge','RF_Broken_Stone_Bridge','RF_Corroded_Riverbank']:
  o=bpy.data.objects[name];o.hide_render=False;o.hide_set(False);vs=[v.co for v in o.data.vertices];mn=Vector(tuple(min(v[k] for v in vs) for k in range(3)));mx=Vector(tuple(max(v[k] for v in vs) for k in range(3)));c=(mn+mx)*.5;floor.location.z=mn.z-.03;cam.location=c+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));aim(cam,c);bpy.context.view_layer.update();pv=[cam.matrix_world.inverted()@v for v in vs];cam.data.ortho_scale=max(max(abs(v.x) for v in pv)*2.4,max(abs(v.y) for v in pv)*3.84)
  S.cycles.samples=24;S.render.filepath=str(ROOT/'renders'/(name+'_shape.png'));bpy.ops.render.render(write_still=True);o.hide_render=True
 print('큰 형태 렌더 완료',flush=True)
else:
 bpy.ops.wm.open_mainfile(filepath=str(ROOT/'source/숲_형태.blend'))
 S=bpy.context.scene;records=json.loads((ROOT/'source/형태명세.json').read_text(encoding='utf8'));allmods=[bpy.data.objects[r['id']] for r in records]
 # 이전 형태 명세는 유지하고 기존 원본/납품을 덮지 않는 신규 폴더에서만 베이크.
 for o in S.objects:
  if o.type=='MESH':o.hide_render=True;o.hide_set(True)

 # 원본 킷: 모든 고해상도 베이크 입력은 따로 보존, 런타임 FBX는 로우만.
 for o in allmods:o.hide_render=True;o.hide_set(True)
 manifest=[]
 previous=[]
 changed=set()
 complete={r['id'] for r in previous if r['id'] not in changed}
 for idx,low in enumerate(allmods):
  print('모듈 베이크 시작',idx,low.name,flush=True)
  low.hide_render=False;low.hide_set(False)
  # 겹친 UV 선택 속성/custom normal을 편집모드에 넘기지 않는다. 기하·재질·평활은 동일 byte 좌표로 보존.
  old=low.data;clean=bpy.data.meshes.new(low.name+'_베이크용기하');clean.from_pydata([tuple(v.co) for v in old.vertices],[],[tuple(f.vertices) for f in old.polygons]);clean.update()
  for m in old.materials:clean.materials.append(m)
  for dst,src in zip(clean.polygons,old.polygons):dst.material_index=src.material_index;dst.use_smooth=src.use_smooth
  assert len(clean.vertices)==len(old.vertices) and len(clean.polygons)==len(old.polygons)
  assert not clean.validate(verbose=True),'입력 기하 오류'
  low.data=clean
  select([low]);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.025);bpy.ops.object.mode_set(mode='OBJECT')
  high=low.copy();high.data=low.data.copy();S.collection.objects.link(high);high.name=low.name+'_High'
  # 실루엣 유지용 SIMPLE 세분화와 낮은 주파수 조형. 고주파 점무늬를 만들지 않는다.
  sub=high.modifiers.new('하이폴리세분화','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;apply(high,sub)
  # 작은 베벨이 뒤집히는 정점 변위는 사용하지 않는다. 넓은 조형은 실제 로우 메시,
  # 하이폴리의 미세 표면은 CC0 범프로 만든 뒤 노멀에 투영한다.
  # 하이폴리 법선은 실물 조형·CC0 범프를 포함. 커브/모서리 베이크는 각 메시에서 실제 실행.
  select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
  bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
  if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
  unused=[v for v in bm.verts if not v.link_faces]
  if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
  bm.to_mesh(low.data);bm.free();low.data.update()
  original_mats=list(high.data.materials)
  target=bpy.data.materials.new(low.name+'_베이크표적');target.use_nodes=True
  low.data.materials.clear();low.data.materials.append(target)
  for p in low.data.polygons:p.material_index=0
  size=2048 if idx in [0,1,5,8,9] else 1024
  texpaths={};images={}
  bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.025;bak.max_ray_distance=.065;bak.margin=12
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



 for o in allmods:o.hide_render=True;o.hide_set(True)
 for im in bpy.data.images:
  if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
 bpy.ops.file.pack_all()
 bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/숲_베이크.blend'))
 (ROOT/'source/완료.json').write_text(json.dumps({'모듈수':len(manifest),'Unity실행':0},ensure_ascii=False),encoding='utf8')
 print('숲 3D 모듈 베이크 완료',flush=True)
