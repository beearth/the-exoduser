"""반복 거목을 줄이는 낮은 파단 그루터기·옆으로 휜 줄기·전경 가지를 실제 조형한다."""
import bpy,bmesh,math,json,ast
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');OLD=R.parent/'forest-r1';P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
src=Path(__file__).with_name('woodbridge_make.py').read_text(encoding='utf8');tree=ast.parse(src);wanted={'Geo','select','apply','material','hollow','roots'}
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,(ast.ClassDef,ast.FunctionDef)) and n.name in wanted],type_ignores=[]),'<공통조형함수>','exec'))
bark=material('변주_검게썩은수피',(.35,.29,.22),'bark_brown_02_Diffuse.jpg',(.36,.36,.16));wood=material('변주_목질',(.50,.39,.25),'fine_grained_wood_Diffuse.jpg',(.12,.9,.9));inner=material('변주_내부목질',(.12,.075,.038),'bark_brown_02_Diffuse.jpg',(.25,.25,.10))
mats=[bark,wood,inner]+[material('변주_보존'+str(j),(.20,.15,.08)) for j in range(5)]
spec=[]
g=Geo();hollow(g,height=3.35,radius=1.45,lean=.45,phase=.7);roots(g,scale=.92,phase=.3)
spec.append(('RF_Fractured_Stump',g,'강가 낮은 파단 그루터기·속빈 내부·찢긴 림·여섯 판근',2048))
g=Geo();hollow(g,height=8.2,radius=1.20,lean=-2.4,phase=1.1);roots(g,scale=.85,phase=.8)
g.tube([(-1.9,.2,5.1),(-3.4,.3,5.8),(-3.9,.5,7.0),(-4.1,.7,7.6)],[.43,.31,.21,.14],n=12,phase=1.8,flute=.18)
g.tube([(-2.9,.35,5.7),(-3.5,-.4,6.0),(-3.85,-.55,6.15)],[.21,.14,.08],n=9,phase=2,flute=.18)
spec.append(('RF_Gnarled_Split_Trunk',g,'옆으로 굽은 비대칭 파단 줄기·크고 작은 가지 분기·판근',2048))
g=Geo();g.tube([(-4,0,.1),(-2.8,.2,.65),(-1.2,.4,1.2),(.5,.8,1.35),(2.1,.9,1.0),(3.6,1.2,.85)],[.42,.36,.29,.22,.14,.08],n=12,phase=2.4,flute=.20)
for pts,rs in [([(-2.8,.2,.65),(-2.9,.55,1.6),(-2.5,.9,2.3)],[.23,.14,.06]),([(-1.2,.4,1.2),(-.7,-.2,2.2),(.1,-.4,2.6)],[.17,.10,.04]),([(.5,.8,1.35),(1.2,1.4,2.1),(1.8,1.7,2.3)],[.14,.08,.03])]:g.tube(pts,rs,n=8,phase=1.2,flute=.2)
spec.append(('RF_Foreground_Branch_Frame',g,'카메라 아래 전경용 휘어진 부패 가지 프레임·갈라진 세 분기',1024))
records=[]
for id,g,role,size in spec:
 for suffix in ['', '_High']:
  o=bpy.data.objects.get(id+suffix)
  if o:bpy.data.objects.remove(o,do_unlink=True)
 records.append((g.object(id),role,size))
ids={s[0] for s in spec};rows=[r for r in json.loads((R/'source/모듈명세.json').read_text(encoding='utf8')) if r['id'] not in ids]
code=src[src.index('for low,role,size in records:'):src.index('# 공통 베이크 루프 종료')]
exec(compile(code,'<공통하이로우베이크>','exec'))
assert len(rows)==17
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
print('큰 실루엣 변주3종·총17종 저장',flush=True)
