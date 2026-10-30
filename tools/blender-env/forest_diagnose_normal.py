import bpy,math,json
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
for o in S.objects:
 if o.type=='MESH':o.hide_render=True
name='RF_Ancient_Rotten_Tree';o=bpy.data.objects[name];o.hide_render=False;o.hide_set(False);floor=bpy.data.objects['검수용바닥'];floor.hide_render=False;floor.location.z=0
vs=[v.co for v in o.data.vertices];mn=Vector(tuple(min(v[k] for v in vs) for k in range(3)));mx=Vector(tuple(max(v[k] for v in vs) for k in range(3)));c=(mn+mx)*.5;cam=S.camera;cam.location=c+Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))));cam.rotation_euler=(c-cam.location).to_track_quat('-Z','Y').to_euler();bpy.context.view_layer.update();pv=[cam.matrix_world.inverted()@v for v in vs];cam.data.ortho_scale=max(2.5,max(abs(v.x) for v in pv)*2.4,max(abs(v.y) for v in pv)*3.84)
S.render.resolution_x=1600;S.render.resolution_y=1000;S.cycles.samples=24;S.render.threads_mode='FIXED';S.render.threads=10
mat=o.data.materials[0];nm=next(n for n in mat.node_tree.nodes if n.type=='NORMAL_MAP');nm.inputs['Strength'].default_value=0
S.render.filepath=str(R/'source/거목_노멀끔_진단.png');bpy.ops.render.render(write_still=True)
print('동일카메라 노멀만 끔 진단 종료',flush=True)
