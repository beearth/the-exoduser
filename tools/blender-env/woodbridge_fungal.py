"""갓 중앙의 빈 고리를 닫은 실제 기하로 부후균만 재제작·6맵 재베이크한다."""
import bpy,bmesh,math,json,ast
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
src=Path(__file__).with_name('woodbridge_make.py').read_text(encoding='utf8');tree=ast.parse(src);wanted={'Geo','select','apply','shelf'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef)) and n.name in wanted],type_ignores=[]),'<공통조형함수>','exec'))
mats=[]
for i in range(8):
 m=bpy.data.materials.new('닫힌갓_'+str(i));m.use_nodes=True;bs=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.46,.34,.17,1) if i==6 else (.16,.078,.021,1);bs.inputs['Roughness'].default_value=.9;mats.append(m)
id='RF_Fungal_Colony'
for suffix in ['', '_High']:
 o=bpy.data.objects.get(id+suffix)
 if o:bpy.data.objects.remove(o,do_unlink=True)
g=Geo();radial=[]
for j in range(15):
 c=(-.50+.5*math.sin(j*2.4),.20*math.cos(j*2),.16+j*.12);radius=.32+.21*(.5+.5*math.sin(j*1.7));start=len(g.v);shelf(g,c,radius,j)
 radial.extend([min(1,math.hypot(p[0]-c[0],p[1]-c[1])/radius) for p in g.v[start:]])
for j in range(14):
 start=len(g.v);x=-.7+j*.1;g.tube([(x,.15,.01),(x+.05,.18,.07),(x+.12,.24,.13),(x+.08,.20,.22),(x+.10,.16,.30)],[.010,.008,.006,.004,.001],6,n=4);radial.extend([0]*(len(g.v)-start))
o=g.object(id);a=o.data.attributes.new('갓반경','FLOAT','POINT')
for item,value in zip(a.data,radial):item.value=value
for m in mats:
 if m==mats[6]:continue
 n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');at=n.new('ShaderNodeAttribute');at.attribute_name='갓반경';mul=n.new('ShaderNodeMath');mul.operation='MULTIPLY';mul.inputs[1].default_value=18;l.new(at.outputs['Fac'],mul.inputs[0]);sn=n.new('ShaderNodeMath');sn.operation='SINE';l.new(mul.outputs[0],sn.inputs[0]);rg=n.new('ShaderNodeMapRange');rg.inputs['From Min'].default_value=-1;rg.inputs['From Max'].default_value=1;l.new(sn.outputs[0],rg.inputs['Value']);mix=n.new('ShaderNodeMixRGB');mix.inputs[1].default_value=(.15,.07,.02,1);mix.inputs[2].default_value=(.21,.11,.04,1);l.new(rg.outputs[0],mix.inputs[0]);l.new(mix.outputs[0],bs.inputs['Base Color'])
records=[(o,'닫힌 층상 부후균15개·낮은 대비 성장고리·얇은테·휘어진 균사',1024)]
rows=[r for r in json.loads((R/'source/모듈명세.json').read_text(encoding='utf8')) if r['id']!=id]
code=src[src.index('for low,role,size in records:'):src.index('# 공통 베이크 루프 종료')]
exec(compile(code,'<공통하이로우베이크>','exec'))
assert len(rows) in (14,17)
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
print('중앙이 막힌 목재 부후균 재베이크 완료',flush=True)
