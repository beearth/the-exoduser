"""성긴 거미다리 형태 대신 갈라진 마른 잔가지가 모인 실제 덤불을 제작한다."""
import bpy,bmesh,math,json,ast
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
src=Path(__file__).with_name('woodbridge_make.py').read_text(encoding='utf8');tree=ast.parse(src);wanted={'Geo','select','apply'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef)) and n.name in wanted],type_ignores=[]),'<공통조형함수>','exec'))
mats=[]
for j in range(8):
 m=bpy.data.materials.new('마른덤불_목질'+str(j));m.use_nodes=True;bs=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.15,.065,.022,1);bs.inputs['Roughness'].default_value=.96;mats.append(m)
g=Geo()
for j in range(13):
 a=j*2.39996;h=.62+.58*(.5+.5*math.sin(j*1.6));L=.3+.6*(.5+.5*math.sin(j*2.2));pts=[];rs=[]
 for k in range(7):
  t=k/6;r=L*t;pts.append((r*math.cos(a)+.06*math.sin(t*4+j),r*math.sin(a),h*(t-.24*t*t)));rs.append(.031*(1-t)+.003)
 g.tube(pts,rs,n=6,phase=j,flute=.1)
 for k in [2,3,4,5]:
  p=Vector(pts[k]);theta=a+(-.8 if k%2 else .8);q=p+Vector((.26*math.cos(theta),.26*math.sin(theta),.16));end=q+Vector((.20*math.cos(theta+.25),.20*math.sin(theta+.25),.04));g.tube([p,q,end],[.014,.008,.002],n=4,phase=j)
  fork=q+Vector((.11*math.cos(theta+1),.11*math.sin(theta+1),.12));g.tube([q,fork],[.006,.0015],n=4)
id='RF_Withered_Shrub'
for suffix in ['', '_High']:
 o=bpy.data.objects.get(id+suffix)
 if o:bpy.data.objects.remove(o,do_unlink=True)
records=[(g.object(id),'13마른줄기·52잔가지·52갈림의 낮은 시든 덤불, 신선한 잎 없음',1024)];rows=[r for r in json.loads((R/'source/모듈명세.json').read_text(encoding='utf8')) if r['id']!=id]
exec(compile(src[src.index('for low,role,size in records:'):src.index('# 공통 베이크 루프 종료')],'<공통하이로우베이크>','exec'))
assert len(rows)==17
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('마른 분기 덤불 재베이크 완료',flush=True)
