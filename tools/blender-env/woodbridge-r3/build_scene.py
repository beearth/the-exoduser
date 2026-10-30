"""스캔 목질·암반과 승인 나무다리 구도의 독립 Blender 환경. Unity 실행 없음."""
import bpy,bmesh,math,json,random,sys
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3')
R2=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/스캔-원본.blend'))
S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.device='CPU';S.cycles.samples=32;S.cycles.use_denoising=True;S.render.threads_mode='FIXED';S.render.threads=10
rng=random.Random(31030)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
def fix_world(o):
 mw=o.matrix_world.copy();o.data=o.data.copy();o.data.transform(mw);o.parent=None;o.matrix_world=Matrix.Identity(4);o.rotation_mode='XYZ'
 pts=[v.co for v in o.data.vertices];mn=Vector([min(p[k] for p in pts) for k in range(3)]);mx=Vector([max(p[k] for p in pts) for k in range(3)]);center=(mn+mx)*.5;center.z=mn.z
 for v in o.data.vertices:v.co-=center
 return mx-mn
src={o.name:o for o in S.objects if o.type=='MESH'}
for o in src.values():fix_world(o)
# CC0 원본 재질을 공통 부패 톤으로 처리. 미세 점 생성·디더·필름그레인 없음.
for m in list(bpy.data.materials):
 if not m.use_nodes:continue
 n=m.node_tree.nodes;l=m.node_tree.links;bs=next((x for x in n if x.type=='BSDF_PRINCIPLED'),None)
 if not bs:continue
 if bs.inputs['Base Color'].is_linked:
  prev=bs.inputs['Base Color'].links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.28 if 'shrub' in m.name else .50;h.inputs['Value'].default_value=.65 if 'moss' in m.name else .72;l.new(prev,h.inputs['Color'])
  tint=n.new('ShaderNodeMixRGB');tint.blend_type='MULTIPLY';tint.inputs[0].default_value=1;tint.inputs[2].default_value=(.70,.55,.34,1) if 'shrub' in m.name else (.74,.72,.53,1) if 'moss' in m.name else (.66,.66,.60,1);l.new(h.outputs[0],tint.inputs[1]);l.new(tint.outputs[0],bs.inputs['Base Color'])
 for x in n:
  if x.type=='NORMAL_MAP':x.inputs['Strength'].default_value=.52
 bs.inputs['Roughness'].default_value=.85
 if 'moss' in m.name or 'shrub' in m.name:
  m.surface_render_method='DITHERED';m.use_transparency_overlap=False
for o in src.values():o.hide_render=True;o.hide_set(True)
lib={};highs={};module_roles={}
def part(id,scale=1,loc=(0,0,0),rot=(0,0,0)):
 base=src[id];o=base.copy();o.data=base.data.copy();S.collection.objects.link(o);o.name='조형_'+id;o.hide_set(False);o.hide_render=False;o.scale=(scale,)*3 if isinstance(scale,(float,int)) else scale;o.location=loc;o.rotation_euler=rot
 select([o]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);return o
def join(parts,name):
 select(parts,parts[0]);bpy.ops.object.join();o=parts[0];o.name=name;return o
def module(name,parts,role,ratio=1):
 high=join(parts,name+'_High');highs[name]=high;low=high.copy();low.data=high.data.copy();S.collection.objects.link(low);low.name=name
 if ratio<1:m=low.modifiers.new('실제스캔_로우화','DECIMATE');m.ratio=ratio;apply(low,m)
 bm=bmesh.new();bm.from_mesh(low.data);bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00001);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(low.data);bm.free()
 for o in [high,low]:o.hide_render=True;o.hide_set(True)
 lib[name]=low;module_roles[name]=role;return low
st=src['tree_stump_02'];tr=src['dead_tree_trunk_02']
def tree(name,phase=0):
 ps=[part('tree_stump_02',(4.8,4.4,5.5),loc=(0,0,-.5),rot=(0,0,phase))]
 # 길이 방향의 스캔 파단·거친 수피를 세워, 끝으로 가늘어지는 휜 주간을 만든다.
 o=part('dead_tree_trunk_02');vs=o.data.vertices;mn=min(v.co.x for v in vs);mx=max(v.co.x for v in vs)
 for v in vs:
  x,y,z=v.co;t=(x-mn)/(mx-mn);rad=1.35*(1-.50*t);v.co=(y*rad+.5*math.sin(t*3.6+phase),-(z-.5)*rad+.4*math.sin(t*4.1),1.4+t*15)
 o.rotation_euler.z=phase;select([o]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True);ps.append(o)
 # 굵은 판근은 실물 로그의 갈라진 부위를 가로로 접합한다.
 for j,a in enumerate([.1,1.8,3.0,4.5,5.6]):
  o=part('dead_tree_trunk_02',(.95,.9,.8),loc=(1.1*math.cos(a+phase),1.1*math.sin(a+phase),.12),rot=(.12,.15,a+phase));ps.append(o)
 for j,(p,a) in enumerate([((.3,.0,8.0),-.75),((.3,.1,11),.95)]):ps.append(part('dry_branches_medium_01_a',(3.1,4.5,3.3),p,(0,a,phase+j*1.5)))
 return module(name,ps,'CC0 스캔 거대 고목·노출 판근·비대칭 파단 주간',.24)
tree('RF3_Ancient_Tree_A',.1);tree('RF3_Ancient_Tree_B',1.35)
module('RF3_Fallen_Log',[part('dead_tree_trunk_02',(1.7,1.8,1.4)),part('dry_branches_medium_01_a',3,loc=(-1.8,.3,.3),rot=(0,.2,.4))],'스캔 쓰러진 부패 고목과 가지',.25)
module('RF3_Root_Stump',[part('tree_stump_02',(3.0,3.1,5.5),loc=(0,0,-.2))],'강가 낮은 스캔 그루터기·진흙과 뿌리 접합',.35)
for i in range(1,4):module('RF3_Moss_Rock_'+str(i),[part('rock_moss_set_01_rock0'+str(i))],'CC0 실물 이끼 암반 '+str(i),.45)
# CC0 식물 원본의 실제 알파를 보존한 교차 카드. 그린을 병든 회갈색으로 톤 조정한다.
ps=[]
for j in range(16):
 a=j*2.399;rad=.14+.45*(j%4)/3;ps.append(part('shrub_03_'+['a','b','c','d'][j%4],(2.0,2.0,2.0+.6*math.sin(j)),(rad*math.cos(a),rad*math.sin(a),-.01),(0,.1*math.sin(j),a)))
module('RF3_Withered_Shrub',ps,'CC0 식물 알파 카드의 시든 덤불 군락',1)
ps=[]
for j in range(44):
 id=['moss_01_a_LOD0','moss_01_c_LOD0','moss_01_tall_a_LOD0','moss_01_tall_b_LOD0'][j%4];sc=22+14*(.5+.5*math.sin(j*1.8));x=-1.35+(j%11)*.25;y=(j//11)*.12;ps.append(part(id,(sc*.62,sc*.46,sc*1.6),(x,y,2.5-.13*(j%3)),(math.pi,0,j*2.399)))
module('RF3_Hanging_Moss',ps,'CC0 이끼 알파 카드44묶음·아래로 늘어진 회갈색 수염이끼',1)
ps=[part('moss_01_'+a+'_LOD0',20,loc=(.20*math.cos(i*2.399)*(i%4),.20*math.sin(i*2.399)*(i%4),.04),rot=(0,0,i*2.399)) for i,a in enumerate(['a','b','c','d','e','f','g','a','c','e','f','a','g','e','c','a'])]
module('RF3_Moss_Cushion',ps,'CC0 이끼 알파 카드 접지 패치',1)
# 기존 키트는 원본을 변경하지 않고 필요한 독립 모듈만 인수한다.
oldids=['RF_Rotten_Wood_Bridge','RF_Fungal_Colony','RF_River_Stake_Cluster','RF_Bridge_Torch_Holder','RF_Foreground_Branch_Frame','RF_Forest_Vista_Card']
with bpy.data.libraries.load(str(R2/'source/숲_베이크.blend'),link=False)as(a,b):b.objects=[x for x in oldids if x in a.objects]
for o in b.objects:
 S.collection.objects.link(o);o.hide_render=True;o.hide_set(True);name=o.name.replace('RF_','RF3_');o.name=name;lib[name]=o;module_roles[name]='r2 베이크 원본 인수 후 구도/식생 접합 개선'
 if name=='RF3_Rotten_Wood_Bridge':
  bm=bmesh.new();bm.from_mesh(o.data);seen=set()
  for v in bm.verts:
   if v in seen:continue
   todo=[v];island=[];seen.add(v)
   while todo:
    q=todo.pop();island.append(q)
    for e in q.link_edges:
     w=e.other_vert(q)
     if w not in seen:seen.add(w);todo.append(w)
   mn=Vector([min(q.co[k] for q in island)for k in range(3)]);mx=Vector([max(q.co[k]for q in island)for k in range(3)])
   if mx.x-mn.x>3 and mx.y-mn.y<.7 and mn.z>.18:
    cy=(mx.y+mn.y)*.5;j=round((cy+5.4)/.386);tw=.013*math.sin(j*1.8)
    for q in island:
     x,y,z=q.co;q.co.y+=x*tw;q.co.z+=.035*math.sin(j*2.3)+.025*x*math.sin(j*1.2)
     if j in [7,18,23]and x>1.1:q.co.x=1.1+(x-1.1)*.5;q.co.z-=.12*(x-1.1)
  bm.to_mesh(o.data);bm.free();module_roles[name]='29부패판자·10말뚝·불규칙 뒤틀림·3곳 부분파손·목재난간·처진밧줄'
# 원본 텍스처는 절대경로로 확정한다.
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)

def simple(name,col,rough=.85,emit=0):
 m=bpy.data.materials.new(name);m.use_nodes=True;bs=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*col,1);bs.inputs['Roughness'].default_value=rough
 if emit:bs.inputs['Emission Color'].default_value=(*col,1);bs.inputs['Emission Strength'].default_value=emit
 return m
def mesh(name,vs,faces,mat):
 me=bpy.data.meshes.new(name);me.from_pydata(vs,[],faces);me.update();me.materials.append(mat);o=bpy.data.objects.new(name,me);S.collection.objects.link(o)
 for f in me.polygons:f.use_smooth=True
 return o
def uvmat(name,id,scale=.3):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');geom=n.new('ShaderNodeNewGeometry');v=n.new('ShaderNodeVectorMath');v.operation='SCALE';v.inputs[3].default_value=scale;l.new(geom.outputs['Position'],v.inputs[0]);maps={}
 for kind in ['Diffuse','Rough','nor_gl']:
  p=next((R/'pbr-source').glob(id+'_'+kind+'.*'));tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(p),check_existing=True);tx.projection='BOX';tx.projection_blend=.3;l.new(v.outputs[0],tx.inputs[0]);maps[kind]=tx
  if kind!='Diffuse':tx.image.colorspace_settings.name='Non-Color'
 h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.60;h.inputs['Value'].default_value=.70;l.new(maps['Diffuse'].outputs[0],h.inputs['Color']);l.new(h.outputs[0],bs.inputs['Base Color']);l.new(maps['Rough'].outputs[0],bs.inputs['Roughness']);nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.35;l.new(maps['nor_gl'].outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal']);return m
soil=uvmat('분층_젖은흙','mud_forest',.32);leaf=uvmat('분층_부패낙엽','brown_mud_leaves_01',.34);mosstex=uvmat('분층_이끼흙','forest_leaves_02',.34)
# 경사·수면 높이·진입 동선을 공유하는 단일 연속 지형, 바위 블록 대신 곡면 강둑.
def signed(x,y):
 north=y-(5.8+.5*math.sin(x*.4));south=(-6+.5*math.sin(x*.35))-y;right=6.7+.12*max(y,0)+1.3*math.sin(y*.23)-x
 bank=max(south,min(north,right));island=1-math.sqrt(((x-6.2)/2.6)**2+((y-.8)/3.0)**2)
 return max(bank,island*2.5)
def ground(x,y):
 d=signed(x,y);h=.62+.25*math.sin(x*.27+y*.16)+.14*math.sin(x*.67-y*.4)
 return -1.1+(h+1.1)*max(0,min(1,(d+1.4)/2.2))+.09*math.sin(x*2.1+y)*max(0,min(1,d+1))
vs=[];faces=[];nx=151;ny=161
for j in range(ny):
 y=-22+j*.5
 for i in range(nx):x=-36+i*.5;vs.append((x,y,ground(x,y)))
for j in range(ny-1):
 for i in range(nx-1):a=j*nx+i;faces.append((a,a+1,a+nx+1,a+nx))
terrain=mesh('RF3_Continuous_Bank_Terrain',vs,faces,soil);terrain.data.materials.append(leaf);terrain.data.materials.append(mosstex)
for f in terrain.data.polygons:
 c=f.center;x=sum(terrain.data.vertices[v].co.x for v in f.vertices)/4;y=sum(terrain.data.vertices[v].co.y for v in f.vertices)/4
 # 패치 경계는 후속 블렌드 노드로 연결한다. 주행로는 저대비 진흙, 가장자리는 낙엽.
 f.material_index=0 if abs(x)<2.6+.5*math.sin(y*.6) else 1 if math.sin(x*.5+y*.2)>.0 else 2
terrain.hide_render=True;terrain.hide_set(True);lib[terrain.name]=terrain;module_roles[terrain.name]='연속된 굴곡 강둑·경사·독액 강바닥·젖은흙/낙엽/이끼층. 전체게임맵 아님'
clones=[]
def place(name,p,sc=1,yaw=0):
 o=lib[name].copy();o.data=lib[name].data;S.collection.objects.link(o);o.name='배치_'+name;o.location=p;o.scale=(sc,)*3 if isinstance(sc,(float,int))else sc;o.rotation_euler.z=math.radians(yaw);o.hide_set(False);o.hide_render=False;clones.append(o);return o
place('RF3_Continuous_Bank_Terrain',(0,0,0));place('RF3_Rotten_Wood_Bridge',(0,0,0))
trees=[(-7.3,-4.3,1.15,15),(5.0,14,1.05,195),(-11,15,.92,110),(-5,28,.85,255),(11,29,.85,15),(-15,33,1.0,60),(3,43,.90,170),(-16,1,.92,260),(-20,18,.95,330)]
for ti,(x,y,sc,a) in enumerate(trees):
 z=ground(x,y)-.20;place('RF3_Ancient_Tree_'+('A'if ti%2==0 else 'B'),(x,y,z),sc,a)
 for j in range(8):
  aa=a*math.pi/180+j*.80;r=1.1+.45*(j%3);zz=z+sc*(2.1+.75*(j%3));place('RF3_Hanging_Moss',(x+r*math.cos(aa),y+r*math.sin(aa),zz),sc*(.7+.25*(j%2)),a+j*37)
 for j in range(3):
  aa=3.8+j*.6;place('RF3_Fungal_Colony',(x+1.8*sc*math.cos(aa),y+1.8*sc*math.sin(aa),z+sc*(.4+j*.42)),sc*.65,a+20)
 # 스캔 뿌리와 잔가지가 바닥 접합을 연속해서 감싼다.
 for j in range(5):
  aa=j*1.3+a*.01745;xx=x+2.6*sc*math.cos(aa);yy=y+2.6*sc*math.sin(aa)
  place('RF3_Moss_Cushion',(xx,yy,ground(xx,yy)+.02),sc*(.8+.3*(j%2)),j*57)
place('RF3_Root_Stump',(6.2,.8,ground(6.2,.8)-.2),1.05,130)
for a in [0,50,130,220,300]:place('RF3_Hanging_Moss',(6.2+1.8*math.cos(math.radians(a)),.8+1.8*math.sin(math.radians(a)),1.4),.65,a)
place('RF3_Fungal_Colony',(5.7,-.4,.35),1.2,20)
for x,y,sc,a in [(-7,-10,1,25),(-8,8,1.2,25),(9,9,1.1,150),(11,-7,.9,100),(-12,20,1,50),(-12,-10,1.2,25),(12,20,1,45)]:place('RF3_Fallen_Log',(x,y,ground(x,y)),sc,a)
# 강가 경사를 따라 암반·침수 말뚝·낙엽 덤불의 낮은 접합을 배치한다.
for i,(x,y) in enumerate([(-7,-5.7),(-5,-5.9),(4,-6.1),(8,-5.4),(-8,5.9),(-5,5.8),(4,5.6),(7,7),(8,11),(8,17),(10,23),(8,3),(11,-2),(-11,1)]):
 place('RF3_Moss_Rock_'+str(1+i%3),(x,y,ground(x,y)-.24),(.65,.70,.6),i*73)
 if i%2==0:place('RF3_River_Stake_Cluster',(x+1,y,-.65),.66,i*45)
 for j in range(5):
  xx=x+math.sin(j*2.4+i)*1.5;yy=y+math.cos(j*1.7)*.9
  if ground(xx,yy)>.15:place('RF3_Withered_Shrub',(xx,yy,ground(xx,yy)-.01),.65+.25*(j%3),i*31+j*45)
for i,(x,y)in enumerate([(-5,-8),(-8,-10),(-4,-12),(-5,8),(5,9),(6,13),(-7,16),(-9,23),(7,26),(-3,34)]):
 for j in range(7):
  xx=x+math.sin(j*2.4)*1.7;yy=y+math.cos(j*1.9)*1.2;place('RF3_Withered_Shrub',(xx,yy,ground(xx,yy)),.7+.3*(j%2),j*55+i*30)
# 판자 위·난간과 로프 아래는 실제 CC0 알파 식생을 걸어 이끼가 구조에 붙도록 한다.
for side in [-1,1]:
 for j in range(12):
  y=-5.2+j*.94;x=side*2.0;place('RF3_Moss_Cushion',(x,y,1.10+.15*math.sin(j)),.4,side*j*32)
  if j%2==0:place('RF3_Hanging_Moss',(x,y,.25),.33,90)
for x,y in [(-2.3,-4.7),(2.3,4.7)]:
 place('RF3_Bridge_Torch_Holder',(x,y,.6),.8)
 d=bpy.data.lights.new('다리끝_검수횃불','POINT');d.energy=320;d.color=(1,.38,.075);d.shadow_soft_size=.45;o=bpy.data.objects.new(d.name,d);S.collection.objects.link(o);o.location=(x,y,2.22)
 flame=simple('검수_불꽃',(1,.26,.025),.5,7);bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2,radius=.17,location=(x,y,2.2));o=bpy.context.object;o.scale=(.75,.75,1.7);o.data.materials.append(flame)
# 병든 녹황색 강: 넓은 저주파 반사 변화와 흐름 결, 강가 거품 띠. Blender 기준 대리면.
water=bpy.data.materials.new('독액_기준대리물_비납품');water.use_nodes=True;n=water.node_tree.nodes;l=water.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');bs.inputs['Roughness'].default_value=.27;bs.inputs['IOR'].default_value=1.36
g=n.new('ShaderNodeTexCoord');mapping=n.new('ShaderNodeVectorMath');mapping.operation='MULTIPLY';mapping.inputs[1].default_value=(.16,1.8,.15);l.new(g.outputs['Generated'],mapping.inputs[0]);noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=38;noise.inputs['Detail'].default_value=1;l.new(mapping.outputs[0],noise.inputs[0]);ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.2;ramp.color_ramp.elements[0].color=(.030,.036,.009,1);ramp.color_ramp.elements[1].position=.8;ramp.color_ramp.elements[1].color=(.12,.13,.028,1);l.new(noise.outputs['Fac'],ramp.inputs[0]);l.new(ramp.outputs[0],bs.inputs['Base Color']);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.11;bump.inputs['Distance'].default_value=.065;l.new(noise.outputs['Fac'],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
mesh('検수_독액대리면',[(-45,-25,-.08),(45,-25,-.08),(45,75,-.08),(-45,75,-.08)],[(0,1,2,3)],water)
foam=simple('독액가장자리_낮은거품막',(.16,.17,.065),.75)
foamvs=[];foamfs=[]
for sign in [-1,1]:
 for j in range(125):
  x=-25+j*.42;y=(5.8+.5*math.sin(x*.4)) if sign>0 else (-6+.5*math.sin(x*.35));w=.08+.10*(.5+.5*math.sin(j*.72));y+=sign*(-.8+.12*math.sin(j*.5));base=len(foamvs)
  foamvs.extend([(x,y,-.065),(x+.35,y+.03,-.063),(x+.30,y+sign*w,-.06),(x,y+sign*w*.8,-.065)]);foamfs.append((base,base+1,base+2,base+3))
mesh('검수_강가거품띠',foamvs,foamfs,foam)
# 뒤쪽 레이어는 실제 거목과 안개 카드로 연속된 깊이를 구성한다.
for x,y,sc in [(-15,55,1.5),(0,65,1.5),(16,68,1.8)]:
 o=place('RF3_Forest_Vista_Card',(x,y,-.3),sc,0);o.visible_shadow=False
def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
def area(name,p,power,col,size,target):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=col;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=p;aim(o,target)
area('차가운_숲틈광',(-5,4,20),6500,(.63,.75,1),10,(0,0,0));area('후경_푸른림',(-5,26,24),4500,(.55,.69,.90),12,(0,10,0));area('전경_넓은반사',(9,-15,12),1800,(.76,.69,.53),10,(0,0,0))
if S.world is None:S.world=bpy.data.worlds.new('숲_검수월드')
S.world.use_nodes=True;bg=next(n for n in S.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.12,.17,.23,1);bg.inputs[1].default_value=.28
def fogbox(name,loc,scale,density):
 bpy.ops.mesh.primitive_cube_add(size=2,location=loc);o=bpy.context.object;o.name=name;o.scale=scale;m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;n.clear();v=n.new('ShaderNodeVolumePrincipled');v.inputs['Density'].default_value=density;v.inputs['Color'].default_value=(.35,.43,.52,1);v.inputs['Anisotropy'].default_value=.28;out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(v.outputs[0],out.inputs['Volume']);o.data.materials.append(m)
fogbox('후경_체적안개',(0,37,12),(45,25,20),.020);fogbox('강가_저층연무',(0,9,.8),(30,18,1.3),.013)
for x,y in [(-8,2),(-4,12)]:
 d=bpy.data.lights.new('숲틈_빛기둥','SPOT');d.energy=17000;d.color=(.70,.80,1);d.spot_size=.22;d.spot_blend=.40;d.shadow_soft_size=.1;o=bpy.data.objects.new(d.name,d);S.collection.objects.link(o);o.location=(x-6,y+3,20);aim(o,(x,y,0))
fogbox('빛기둥_희박입자',(0,8,10),(24,18,11),.004)
# 전경 가지 프레임은 길을 가리지 않고 화면 모서리만 묶는다.
place('RF3_Foreground_Branch_Frame',(-4,-13,1.8),1.35,8)
bpy.ops.object.camera_add(location=(18,-27,25));cam=bpy.context.object;cam.name='승인구도_검수카메라';cam.data.lens=42;aim(cam,(0,6,1));S.camera=cam
S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.resolution_percentage=100;S.view_settings.view_transform='AgX';S.view_settings.exposure=.40
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_스캔재제작.blend'))
rows=[{'id':k,'역할':module_roles[k],'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'정점':len(o.data.vertices),'high':highs[k].name if k in highs else None,'alpha':any(s in k for s in ['Moss_Cushion','Hanging_Moss','Withered_Shrub','Vista_Card'])}for k,o in lib.items()]
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/구도명세.json').write_text(json.dumps({'범위':'Blender 검수용 정적 조립·실게임 아님','Unity':0,'카메라XYZ':list(cam.location),'목표':[0,6,1],'초점mm':42,'독액':{'linearRGB평균':[.075,.083,.019],'sRGB_HEX':'#4D5126','IOR':1.36,'roughness':.27,'발광':0},'실제배치수':len(clones)},ensure_ascii=False,indent=2),encoding='utf8')
if '--draft'in sys.argv:S.render.resolution_percentage=65;S.cycles.samples=20
S.render.filepath=str(R/'renders/승인구도_스캔초벌.png');bpy.ops.render.render(write_still=True)
print('스캔 재제작과 첫 구도 렌더 완료',flush=True)
