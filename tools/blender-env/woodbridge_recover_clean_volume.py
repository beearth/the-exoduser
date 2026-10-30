"""자기 이전 조립 백업에서 깨끗한 기하6개만 회수. 다른 모듈/파일을 되돌리지 않는다."""
import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));names=tuple(id+s for id in ['RF_Ancient_Rotten_Tree','RF_Gnarled_Split_Trunk','RF_Fractured_Stump'] for s in ['', '_High'])
with bpy.data.libraries.load(str(R/'source/두께오류복구/깨끗한기하.blend'),link=False) as (a,b):b.objects=list(names)
for name,new in zip(names,b.objects):
 old=bpy.data.objects[name];old.data=new.data;bpy.data.objects.remove(new,do_unlink=True);old.hide_render=True;old.hide_set(True)
 assert max(abs(c) for v in old.data.vertices for c in v.co)<40,('기하 복구 크기',name)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('자기 원본에서 두께 전 기하6개만 회수, 다른 모듈 보존',flush=True)
