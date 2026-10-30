"""낮은 전경 목질과 가지 프레임으로 승인 원화의 깊이 계층을 맞춘다."""
import bpy,math,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene
for o in list(S.objects):
 if o.name.startswith('승인전경_'):bpy.data.objects.remove(o,do_unlink=True)
for id,p,sc,a in [('RF3_Fallen_Log',(5,-13,1.6),(2.2,1.4,1.3),34),('RF3_Foreground_Branch_Frame',(2,-12,2.3),(1.8,1.8,1.8),34)]:
 src=bpy.data.objects[id];o=src.copy();o.data=src.data;S.collection.objects.link(o);o.name='승인전경_'+id;o.location=p;o.scale=sc;o.rotation_euler.z=math.radians(a);o.hide_render=False;o.hide_set(False)
S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/전경마감_확인.png');bpy.ops.render.render(write_still=True)
