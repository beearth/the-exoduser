"""굵은 철사처럼 보이던 이끼를 125개의 가늘고 부드러운 부패 섬유로 다시 조형한다."""
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
 m=bpy.data.materials.new('회갈색부패섬유_'+str(j));m.use_nodes=True;bs=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.15+.008*j,.14+.006*j,.085+.004*j,1);bs.inputs['Roughness'].default_value=.98;mats.append(m)
g=Geo()
for bunch,cx in enumerate([-1.15,-.55,.03,.65,1.18]):
 for j in range(25):
  phase=j*2.399+bunch*.8;x=cx+.18*math.sin(phase);z=2.3+.07*math.sin(j*.9);length=.65+.95*(.5+.5*math.sin(j*1.73+bunch))**.6;pts=[];rs=[]
  for k in range(21):
   t=k/20;pts.append((x+.045*math.sin(t*9+phase)+.07*t*math.sin(phase),.045*math.cos(phase)+.055*math.sin(t*8+phase),z-length*t));rs.append((.006+.0025*(j%3)/2)*(1-t*.92))
  g.tube(pts,rs,3 if j%3 else 4,n=4,phase=j,flute=.05)
  if j%4==0:
   p=pts[8];g.tube([p,(p[0]+.025,p[1]+.02,p[2]-.12),(p[0]+.04,p[1]+.015,p[2]-.25)],[.003,.002,.0007],3,n=3,flute=0)
id='RF_Hanging_Moss'
for suffix in ['', '_High']:
 o=bpy.data.objects.get(id+suffix)
 if o:bpy.data.objects.remove(o,do_unlink=True)
records=[(g.object(id),'회갈색 부패 수염이끼·5다발/125가는섬유·가늘어진 끝·정적 메시',1024)];rows=[r for r in json.loads((R/'source/모듈명세.json').read_text(encoding='utf8')) if r['id']!=id]
exec(compile(src[src.index('for low,role,size in records:'):src.index('# 공통 베이크 루프 종료')],'<공통하이로우베이크>','exec'))
assert len(rows)==17
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('가늘고 부드러운 부패 섬유 이끼 재베이크 완료',flush=True)
