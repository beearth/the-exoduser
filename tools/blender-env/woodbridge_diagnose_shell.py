"""얇은 가지에서 안쪽 목질 면이 원래 스캔 바깥으로 나오는지 실제 3D 표면 대조."""
import bpy,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));names=('RF_Ancient_Rotten_Tree_High','RF_Gnarled_Split_Trunk_High');current={n:bpy.data.objects[n] for n in names}
with bpy.data.libraries.load(str(R/'source/두께오류복구/깨끗한기하.blend'),link=False) as (a,b):b.objects=list(names)
results=[]
for name,old in zip(names,b.objects):
 old.data.calc_loop_triangles();tree=BVHTree.FromPolygons([v.co for v in old.data.vertices],[tuple(t.vertices) for t in old.data.loop_triangles],all_triangles=True);now=current[name];mats={i for i,m in enumerate(now.data.materials) if m and '_썩은내벽' in m.name};faces=[f for f in now.data.polygons if f.material_index in mats and all(now.data.vertices[i].co.z>6 for i in f.vertices)];outside=0;largest=0;samples=0
 for f in faces[::7]:
  p=sum((now.data.vertices[i].co for i in f.vertices),Vector())/len(f.vertices);hit,n,index,d=tree.find_nearest(p);signed=(p-hit).dot(n);samples+=1
  if signed>.005:outside+=1;largest=max(largest,signed)
 results.append({'id':name,'가지내벽표본':samples,'원본외부로돌출':outside,'최대바깥거리m':largest});print('가지 내벽 실제 표면 대조',results[-1],flush=True)
(R/'얇은가지-원인검사.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
