"""승인 나무다리 키프레임용 독립 환경 메시와 실제 하이→로우 베이크. Unity 실행 없음."""
import bpy,bmesh,math,json,sys
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2')
OLD=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1')
P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'))
S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.device='CPU';S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
def material(name,color,image=None,scale=(1,1,1),rough=.85):
 m=bpy.data.materials.new(name);m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=rough
 if image:
  tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(OLD/'pbr-source'/image),check_existing=True);tx.projection='BOX';tx.projection_blend=.2
  g=n.new('ShaderNodeTexCoord');v=n.new('ShaderNodeVectorMath');v.operation='MULTIPLY';v.inputs[1].default_value=scale;l.new(g.outputs['Object'],v.inputs[0]);l.new(v.outputs[0],tx.inputs[0]);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*color,1);l.new(tx.outputs[0],mix.inputs[1]);l.new(mix.outputs[0],bs.inputs['Base Color'])
  bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.22;bump.inputs['Distance'].default_value=.075;l.new(tx.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
  rp=OLD/'pbr-source'/image.replace('_Diffuse.jpg','_Rough.jpg')
  if rp.exists():
   rt=n.new('ShaderNodeTexImage');rt.image=bpy.data.images.load(str(rp),check_existing=True);rt.image.colorspace_settings.name='Non-Color';rt.projection='BOX';rt.projection_blend=.2;l.new(v.outputs[0],rt.inputs[0]);l.new(rt.outputs[0],bs.inputs['Roughness'])
 return m
print('PBR 원본',list((OLD/'pbr-source').glob('*')),flush=True)
bark=material('승인_검게썩은수피',(.35,.29,.22),'bark_brown_02_Diffuse.jpg',(.36,.36,.16))
wood=material('승인_부패판자',(.75,.60,.42),'fine_grained_wood_Diffuse.jpg',(.12,.9,.9))
inner=material('승인_썩은내부목질',(.12,.075,.038),'bark_brown_02_Diffuse.jpg',(.25,.25,.10))
moss=material('승인_회갈색수염이끼',(.19,.175,.11),rough=.98)
rope=material('승인_썩은밧줄',(.27,.225,.135),rough=.98)
fungal=material('승인_갈색부후균갓',(.21,.115,.038),rough=.85)
gills=material('승인_균류옅은테',(.48,.37,.20),rough=.90)
iron=material('승인_녹슨화로',(.095,.065,.038),rough=.77)
mats=[bark,wood,inner,moss,rope,fungal,gills,iron]
class Geo:
 def __init__(self):self.v=[];self.f=[];self.mi=[]
 def face(self,ids,mi):self.f.append(tuple(ids));self.mi.append(mi)
 def tube(self,pts,rs,mi=0,n=10,phase=0,cap=True,flute=.10):
  base=len(self.v);pts=[Vector(p) for p in pts]
  for k,p in enumerate(pts):
   d=(pts[min(k+1,len(pts)-1)]-pts[max(0,k-1)]).normalized();u=d.cross(Vector((1,0,0)) if abs(d.z)>.8 else Vector((0,0,1))).normalized();v=d.cross(u).normalized()
   for j in range(n):
    a=j*math.tau/n;rr=rs[k]*(1+flute*math.sin(j*2.7+phase)+flute*.5*math.sin(a*5+k*.17));self.v.append(tuple(p+rr*(u*math.cos(a)+v*math.sin(a))))
  for k in range(len(pts)-1):
   for j in range(n):a=base+k*n+j;b=base+k*n+(j+1)%n;self.face((a,b,b+n,a+n),mi)
  if cap:self.face([base+j for j in reversed(range(n))],mi);self.face([base+(len(pts)-1)*n+j for j in range(n)],mi)
 def plank(self,c,sz,phase=0,mi=1):
  # 팔각 단면·끝 갈라짐·폭과 두께 변화를 실제 형태에 보존한다.
  x,y,z=c;L,w,t=sz;base=len(self.v)
  cross=[(-.5,-.32),(-.37,-.5),(.38,-.5),(.5,-.25),(.48,.31),(.31,.5),(-.39,.5),(-.5,.22)]
  for k in range(7):
   u=k/6;xx=x+(u-.5)*L
   for j,(yy,zz) in enumerate(cross):self.v.append((xx+.075*math.sin(phase+j*2.1)*(abs(2*u-1)**8),y+yy*w+.045*math.sin(u*5+phase)+.020*(xx-x)*math.sin(phase*1.7),z+zz*t+.045*math.sin(u*4+phase)))
  for k in range(6):
   for j in range(8):a=base+k*8+j;b=base+k*8+(j+1)%8;self.face((a,b,b+8,a+8),mi)
  self.face([base+j for j in reversed(range(8))],2);self.face([base+48+j for j in range(8)],2)
 def object(self,id):
  me=bpy.data.meshes.new(id+'_형태');me.from_pydata(self.v,[],self.f);me.update()
  for m in mats:me.materials.append(m)
  for f,mi in zip(me.polygons,self.mi):f.material_index=mi;f.use_smooth=mi!=1
  o=bpy.data.objects.new(id,me);S.collection.objects.link(o);return o
def roots(g,origin=(0,0,0),scale=1,phase=0):
 # 원뿔 방사뿌리를 넓고 납작한 판근으로 교체한다. 지면 아래로 끝을 묻는다.
 for j,a in enumerate([.15,1.25,2.65,3.45,4.85,5.7]):
  a+=phase;L=scale*(2.7+.7*math.sin(j*1.9));base=len(g.v)
  for k in range(10):
   t=k/9;aa=a+.18*math.sin(t*4+j);r=.58*scale+L*t;w=scale*(.62*(1-t)**.8+.08);h=scale*(1.5*(1-t)**2.5-.14)
   for v,hf in [(-1,0),(-.3,.75),(0,1),(.35,.65),(1,0)]:g.v.append((origin[0]+r*math.cos(aa)-w*v*math.sin(aa),origin[1]+r*math.sin(aa)+w*v*math.cos(aa),origin[2]+h*hf-.09*scale))
  for k in range(9):
   for q in range(4):b=base+k*5+q;g.face((b,b+1,b+6,b+5),0)
  # 판근 양옆과 밑면을 닫아 종잇장 같은 외곽을 없앤다.
  bottom=len(g.v)
  for k in range(10):
   for q in [0,4]:p=Vector(g.v[base+k*5+q]);p.z-=.18*scale;g.v.append(tuple(p))
  for k in range(9):
   a=base+k*5;b=bottom+k*2;g.face((a,a+5,b+2,b),0);g.face((a+4,b+1,b+3,a+9),0);g.face((b,b+2,b+3,b+1),0)
  g.face((base,base+1,base+2,base+3,base+4,bottom+1,bottom),0)
  a=base+45;b=bottom+18;g.face((a+4,a+3,a+2,a+1,a,b,b+1),0)
def hollow(g,height=10,radius=1.5,lean=1.8,phase=0):
 n=48;rings=20;base=len(g.v)
 # 전면 개구부는 높이 약4m에서 닫고 상부는 불규칙한 파단면으로 만든다.
 for innerflag in [False,True]:
  for k in range(rings):
   t=k/(rings-1);z=t*height;gap=max(0,.64*(1-z/(height*.47)));cx=lean*t+.45*math.sin(t*5);cy=.25*(math.sin(t*4+phase)-math.sin(phase))
   for j in range(n):
    a=-math.pi/2+gap+(math.tau-2*gap)*j/(n-1);rad=radius*(1-.55*t)*(1+.22*math.sin(a*7+phase+t*1.8)+.11*math.cos(a*13+t*5));rad-=radius*.24 if innerflag else 0
    top=.80*math.sin(a*7+phase)+.43*math.cos(a*11) if k==rings-1 else 0
    g.v.append((cx+rad*math.cos(a),cy+rad*math.sin(a),z+top))
 for layer in range(2):
  b=base+layer*n*rings
  for k in range(rings-1):
   for j in range(n-1):
    a=b+k*n+j;ids=(a,a+1,a+1+n,a+n);g.face(ids if layer==0 else ids[::-1],0 if layer==0 else 2)
 for k in range(rings-1):
  for j in [0,n-1]:a=base+k*n+j;b=a+n*rings;g.face((a,a+n,b+n,b),2)
 for j in range(n-1):a=base+(rings-1)*n+j;b=a+n*rings;g.face((a,a+1,b+1,b),2)
def shelf(g,c,r,phase=0):
 x,y,z=c;n=18;center=len(g.v);g.v.append((x,y,z+.15*r));base=len(g.v)
 # 속이 빈 고리 대신 중심부터 막힌 반원형 갓·얇은 옅은테·아랫면을 만든다.
 for k,(fraction,h) in enumerate([(.55,.14),(1,.05),(.99,-.08)]):
  for j in range(n):
   a=-math.pi/2+j/(n-1)*math.pi;rr=r*fraction*(1+.055*math.sin(a*5+phase));g.v.append((x+rr*math.sin(a),y-rr*math.cos(a),z+h*r))
 for j in range(n-1):g.face((center,base+j,base+j+1),5)
 for k in range(2):
  for j in range(n-1):a=base+k*n+j;g.face((a,a+n,a+n+1,a+1),5 if k==0 else 6)
 bottom=len(g.v);g.v.append((x,y,z-.08*r))
 for j in range(n-1):g.face((bottom,base+2*n+j+1,base+2*n+j),6)
 for j in [0,n-1]:g.face((center,base+j,base+n+j,base+2*n+j,bottom),5)
def drapes(g,origin=(0,0,0),scale=1,phase=0):
 x,y,z=origin
 for j in range(42):
  xx=x+scale*(-1.3+j*.062);length=scale*(.30+1.12*(.5+.5*math.sin(j*1.83+phase))**.5);pts=[];rs=[]
  for k in range(7):
   t=k/6;pts.append((xx+scale*.16*math.sin(j+t*5),y+scale*.15*math.cos(j*.7+t*4),z-length*t));rs.append(scale*(.018+.009*(j%3))*(1-t*.92))
  g.tube(pts,rs,3,n=5,phase=j,flute=.1)
  if j%2==0:
   p=pts[2];g.tube([p,(p[0]+scale*.12,p[1]+.03,p[2]-.16),(p[0]+scale*.08,p[1],p[2]-.35)],[scale*.018,scale*.012,.002],3,n=4)
  if j<39 and j%3==0:
   p=pts[1];g.tube([p,(p[0]+scale*.10,p[1]-.03,p[2]-.18),(p[0]+scale*.23,p[1],p[2]-.14)],[scale*.014]*3,3,n=4)
records=[]
def put(id,g,role,size=1024):
 for suffix in ['', '_High']:
  o=bpy.data.objects.get(id+suffix)
  if o:bpy.data.objects.remove(o,do_unlink=True)
 o=g.object(id);o.hide_render=True;o.hide_set(True);records.append((o,role,size))

g=Geo();hollow(g,height=10,radius=1.6,lean=2.4);roots(g,scale=1.15)
for pts,rs in [([(1.0,.1,6),(2.0,.25,6.4),(2.6,.45,7.4),(2.65,.5,7.9)],[.55,.42,.26,.20]),([(1.5,.3,7),(.8,.5,7.8),(.3,.7,7.9)],[.40,.25,.17]),([(1.9,.7,8.7),(2.4,1.0,9.6),(2.2,1.5,10.0)],[.33,.23,.13])]:g.tube(pts,rs,n=12,flute=.17)
put('RF_Ancient_Rotten_Tree',g,'검게 썩은 거대 속빈 줄기·비대칭 부러진 가지·넓은6판근·실물스캔 밑동',2048)
g=Geo()
for j in range(29):
  y=-5.4+j*.386;z=.64-.20*math.sin(j/28*math.pi);g.plank((.06*math.sin(j*2.1),y,z),(4.2+.30*math.sin(j*1.6),.32+.04*math.sin(j*2.3),.19),j)
for side in [-1,1]:
 g.tube([(side*1.55,-5.8,.22),(side*1.65,0,.03),(side*1.6,5.8,.25)],[.23,.25,.19],n=12)
 for j in range(5):
  y=-5.4+j*2.7;x=side*2.05;z=.64-.2*math.sin(j/4*math.pi)
  g.tube([(x,y,-.8),(x+.04,y+.03,z+.75),(x+.08,y,z+1.33)],[.20,.18,.12],n=10,phase=j,flute=.17)
  for turn in range(4):
   pts=[(x+.215*math.cos(k*math.tau/14),y+.215*math.sin(k*math.tau/14),z+.60+turn*.045+.045*k/14) for k in range(15)];g.tube(pts,[.024]*15,4,n=4,flute=0)
  if j<4:
   g.tube([(x,y,z+.91),(x+.10*side,y+.7,z+.92),(x+.08,y+1.35,z+.82),(x-.04,y+2.0,z+.89),(x,y+2.7,z+.92)],[.125,.11,.10,.11,.12],n=9,phase=j)
   pts=[(x,y+k*2.7/12,z+.52-.13*math.sin(k/12*math.pi)) for k in range(13)];g.tube(pts,[.035]*13,4,n=5)
put('RF_Rotten_Wood_Bridge',g,'상판 약11.2m·지지구조 약11.62m 썩은 나무다리·29판자·10말뚝·목재난간·밧줄',2048)
g=Geo()
for j in range(3):
 a=.1+j*.38;pts=[(-3.7+k*.85, .25*math.sin(k*.8+j)+j*.45,.25+j*.30+.12*math.sin(k*.7)) for k in range(10)];rs=[(.47-j*.09)*(1-.04*k) for k in range(10)];g.tube(pts,rs,n=16,phase=j,flute=.20)
g.tube([(1,.5,.7),(1.3,.8,1.2),(1.7,1.2,1.4)],[.18,.12,.08],n=9)
put('RF_Fallen_Log',g,'비대칭으로 겹친 부패 고목·실물스캔 파단 목질',2048)
g=Geo();drapes(g,(0,0,2.3));put('RF_Hanging_Moss',g,'회갈색 부패 수염이끼42줄기·21분기·정적 메시',1024)
g=Geo()
for j in range(15):shelf(g,(-.50+.5*math.sin(j*2.4),.20*math.cos(j*2),.16+j*.12),.32+.21*(.5+.5*math.sin(j*1.7)),j)
for j in range(14):g.tube([(-.7+j*.1,.15,.01),(-.5+j*.08,.25,.12),(-.6+j*.08,.15,.4)],[.014,.01,.003],6,n=4)
put('RF_Fungal_Colony',g,'겹친 갈색 목재부후균15개·옅은테·균사',1024)
g=Geo();roots(g,origin=(0,0,-.18),scale=1.0,phase=.25);g.tube([(-3,-.6,.1),(-1,-.9,.8),(1,-.5,1.0),(3,.3,.6)],[.45,.35,.20,.09],n=12,flute=.2);put('RF_Foreground_Roots',g,'화면 아래 전경용 넓은 판근과 실물파단 목질·비보행',2048)
g=Geo()
for j in range(7):
 x=-1.5+j*.48;y=.4*math.sin(j*2);h=1.3+1.3*(.5+.5*math.sin(j*1.9));g.tube([(x,y,-.5),(x+.12,y+.04,h*.7),(x+.22,y,h)],[.22,.19,.055],n=9,phase=j,flute=.25)
 rootscale=.30;g.tube([(x,y,.20),(x+.35,y-.3,.05),(x+.65,y-.4,-.1)],[.12,.08,.025],n=7)
put('RF_River_Stake_Cluster',g,'독액 강가의 썩고 부러진 말뚝7개·낮은 접지뿌리',1024)
g=Geo();g.tube([(0,0,-.20),(0,0,1.5),(0,0,1.65)],[.22,.18,.20],n=12)
for j in range(8):
 a=j*math.tau/8;g.tube([(.20*math.cos(a),.20*math.sin(a),1.36),(.34*math.cos(a),.34*math.sin(a),1.62),(.34*math.cos(a),.34*math.sin(a),2.12)],[.025,.026,.024],7,n=5)
for z,rad in [(1.60,.34),(1.90,.34)]:g.tube([(rad*math.cos(k*math.tau/32),rad*math.sin(k*math.tau/32),z) for k in range(33)],[.035]*33,7,n=5,flute=0)
put('RF_Bridge_Torch_Holder',g,'다리 끝 목재 횃불받침·녹슨 철제바구니. 불꽃·광원 제외',1024)

# 원형 관형 목질 대신 실물 파단·갈라진 밑동을 실제 기하에 합성한다.
scanpath=Path('I:/EXODUSER-Storage/demo-art/map/r2/source/r2_one_mass_lod_baked.blend')
for id,source,sc,offset in [('RF_Ancient_Rotten_Tree','MASS_rotten_foot_scanned_stump',(2.8,2.7,1.6),(0,0,-.12)),('RF_Fallen_Log','MASS_broken_rising_trunk_scanned',(7.6,1.7,1.15),(0,0,.05)),('RF_Foreground_Roots','MASS_rotten_foot_scanned_stump',(3.1,2.5,1.0),(0,0,-.20))]:
 low=next(o for o,_,_ in records if o.name==id)
 with bpy.data.libraries.load(str(scanpath),link=False) as (a,b):b.objects=[source]
 scan=b.objects[0];S.collection.objects.link(scan);select([scan]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 # append 후 실제 기하로 치수를 확정한다. 링크 전 matrix_world는 사용하지 않는다.
 if id=='RF_Fallen_Log':
  for v in scan.data.vertices:x,y,z=v.co;v.co=(z,y,-x)
 mn=[min(v.co[k] for v in scan.data.vertices) for k in range(3)];mx=[max(v.co[k] for v in scan.data.vertices) for k in range(3)]
 for v in scan.data.vertices:v.co=Vector(tuple(((v.co[k]-mn[k])/(mx[k]-mn[k])-(.5 if k<2 else 0))*sc[k]+offset[k] for k in range(3)))
 scan.data.uv_layers.active.name='원본UV'
 for matindex,m in enumerate(list(scan.data.materials)):
  m=m.copy();scan.data.materials[matindex]=m;n=m.node_tree.nodes;l=m.node_tree.links;uv=n.new('ShaderNodeUVMap');uv.uv_map='원본UV'
  for x in n:
   if x.type=='TEX_IMAGE':l.new(uv.outputs[0],x.inputs[0])
   if x.type=='NORMAL_MAP':x.uv_map='원본UV'
  bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');old=bs.inputs['Base Color'].links[0].from_socket;mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.44,.35,.24,1);l.new(old,mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color'])
 dec=scan.modifiers.new('실물파단저밀도','DECIMATE');dec.ratio=.17;apply(scan,dec)
 low.data.uv_layers.new(name='원본UV');select([low,scan],low);bpy.ops.object.join();low.name=id;low.hide_render=True;low.hide_set(True)
 dims=[max(v.co[k] for v in low.data.vertices)-min(v.co[k] for v in low.data.vertices) for k in range(3)]
 assert dims[0]<9 and dims[1]<9 and (id!='RF_Fallen_Log' or dims[2]<2),'스캔 합성 크기 계약 '+str((id,dims))
 print('실제 합성 범위 계약 PASS',id,dims,flush=True)

rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));changed={o.name for o,_,_ in records};rows=[r for r in rows if r['id'] not in changed]
if '--shape-only' in sys.argv:
 for o,role,size in records:
  select([o]);tri=o.modifiers.new('고정삼각화','TRIANGULATE');apply(o,tri)
 bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/나무다리_형태.blend'));print('큰 형태 저장',flush=True);sys.exit(0)
for low,role,size in records:
 print('실제 베이크 시작',low.name,flush=True);select([low]);low.hide_render=False
 # 새 메시만 편집모드에 넘기고 원본 키트의 속성과 UV는 변경하지 않는다.
 if not low.data.uv_layers.get('UVMap'):low.data.uv_layers.new(name='UVMap')
 low.data.uv_layers.active_index=low.data.uv_layers.find('UVMap')
 for u in low.data.uv_layers:u.active_render=u.name=='UVMap'
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.12,island_margin=.010);bpy.ops.object.mode_set(mode='OBJECT')
 tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
 bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 unused=[v for v in bm.verts if not v.link_faces]
 if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
 bm.to_mesh(low.data);bm.free();low.data.update()
 high=low.copy();high.data=low.data.copy();high.name=low.name+'_High';S.collection.objects.link(high);sub=high.modifiers.new('하이_실루엣보존','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;apply(high,sub)
 originals=list(high.data.materials);target=bpy.data.materials.new(low.name+'_베이크표적');target.use_nodes=True;low.data.materials.clear();low.data.materials.append(target)
 for f in low.data.polygons:f.material_index=0
 ims={};paths={};bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.018;bak.max_ray_distance=.05;bak.margin=12
 for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
  im=bpy.data.images.new(low.name+'_'+kind,width=size,height=size,alpha=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color'
  if kind=='Normal':im.generated_color=(.5,.5,1,1)
  tx=target.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;target.node_tree.nodes.active=tx
  if kind not in ['Normal','AO']:
   for m in originals:
    n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');em=n.new('ShaderNodeEmission');em.name='임시베이크'
    if kind=='Curvature':ge=n.new('ShaderNodeNewGeometry');ge.name='임시곡률';l.new(ge.outputs['Pointiness'],em.inputs[0])
    else:
     so=bs.inputs['Base Color' if kind=='BaseColor' else kind]
     if so.is_linked:l.new(so.links[0].from_socket,em.inputs[0])
     elif kind=='BaseColor':em.inputs[0].default_value=so.default_value
     else:em.inputs[0].default_value=(*([so.default_value]*3),1)
    l.new(em.outputs[0],out.inputs[0])
  select([high,low],low);S.cycles.samples=8 if kind=='AO' else 1;bpy.ops.object.bake(type='NORMAL' if kind=='Normal' else 'AO' if kind=='AO' else 'EMIT')
  p=P/'Textures'/(low.name+'_'+kind+'.png');im.filepath_raw=str(p);im.file_format='PNG';im.save();ims[kind]=im;paths[kind]=str(p.relative_to(R))
  for m in originals:
   n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs[0])
   for x in list(n):
    if x.name.startswith('임시'):n.remove(x)
  target.node_tree.nodes.remove(tx)
  print(low.name,kind,'완료',flush=True)
 n=target.node_tree.nodes;l=target.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0])
 for kind,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:tx=n.new('ShaderNodeTexImage');tx.image=ims[kind];l.new(tx.outputs[0],bs.inputs[socket])
 tx=n.new('ShaderNodeTexImage');tx.image=ims['Normal'];nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.5;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
 for u in list(low.data.uv_layers):
  if u.name!='UVMap':low.data.uv_layers.remove(u)
 high.hide_render=True;high.hide_set(True);select([low]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(low.name+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 rows.append({'id':low.name,'역할':role,'정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'텍스처해상도':size,'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'텍스처':paths,'베이크':'Cycles CPU 실제 selected-to-active normal/AO/curvature/PBR. SIMPLE 세분화 하이·CC0 범프'})
 low.hide_render=True;low.hide_set(True)
 (R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
# 공통 베이크 루프 종료
assert len(rows) in (14,17),len(rows)
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
(R/'source/완료.json').write_text(json.dumps({'모듈':len(rows),'재제작':sorted(changed),'Unity실행':0},ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/베이크완료.json').write_text(json.dumps({'모듈':len(rows),'베이크완료':True},ensure_ascii=False),encoding='utf8')
print('승인 나무다리 키트 베이크 완료',flush=True)
