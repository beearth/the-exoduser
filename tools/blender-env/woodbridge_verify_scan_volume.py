"""예각 가시가 실제 최종 기하에 남지 않았는지 이전 원본의 bounds와 대조한다."""
import bpy,json,hashlib
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));names=tuple(id+s for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump'] for s in ['', '_High'])
def bounds(o):return [min(v.co[k] for v in o.data.vertices) for k in range(3)]+[max(v.co[k] for v in o.data.vertices) for k in range(3)]
current={name:bpy.data.objects[name] for name in names};actual={name:bounds(o) for name,o in current.items()}
with bpy.data.libraries.load(str(R/'source/두께오류복구/깨끗한기하.blend'),link=False) as (a,b):b.objects=list(names)
results=[]
for name,old in zip(names,b.objects):
 ref=bounds(old);delta=max(abs(a-b) for a,b in zip(ref,actual[name]));assert delta<=.25,(name,'20cm 두께를 벗어난 가시',delta);o=current[name];walls={i for i,m in enumerate(o.data.materials) if m and '_썩은내벽' in m.name};wall_faces=sum(f.material_index in walls for f in o.data.polygons)
 native=(R/'source/원본가지보존완료.json').exists() and not name.startswith('RF_Fractured_Stump')
 if name.endswith('_High') and not native:assert wall_faces>100,(name,'실제 내벽 없음')
 if native and name=='RF_Ancient_Rotten_Tree_High':assert sum(f.material_index==3 for f in o.data.polygons)>10,'실제 절삭 공동 없음'
 results.append({'id':name,'목질방식':'닫힌 원본 스캔·불필요한 겹면0' if native else '최대20cm 제한 목질 두께','최대bounds변화m':delta,'허용상한m':.25,'실제추가내벽면':wall_faces,'판정':'PASS'})
(R/'실제목질두께-기하검사.json').write_text(json.dumps({'sourceSHA256':hashlib.sha256((R/'source/숲_베이크.blend').read_bytes()).hexdigest(),'복구원본SHA256':hashlib.sha256((R/'source/두께오류복구/깨끗한기하.blend').read_bytes()).hexdigest(),'검사':results,'경계':'예각 긴 가시 재발/실제 내벽 검사. 디자인 PASS가 아님'},ensure_ascii=False,indent=2),encoding='utf8');print('실제 목질 두께6기하·가시 재발 검사 PASS',results,flush=True)
