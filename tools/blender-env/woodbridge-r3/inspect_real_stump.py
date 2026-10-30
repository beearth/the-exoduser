"""속빈 나무를 잘라 만든 밑동 대신 실제 부패 그루터기 스캔의 큰 형태를 먼저 검수."""
import bpy,math,json
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/중경숲_검수후보.blend'));S=bpy.context.scene
for o in S.objects:o.hide_render=True;o.hide_set(True)
before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(R/'scan-source/tree_stump_01/tree_stump_01.gltf'));objs=[o for o in S.objects if o not in before and o.type=='MESH']
for o in objs:
 mw=o.matrix_world.copy();o.data.transform(mw);o.parent=None;o.matrix_world=Matrix.Identity(4);o.rotation_mode='XYZ'
bpy.ops.object.select_all(action='DESELECT')
for o in objs:o.hide_set(False);o.select_set(True)
bpy.context.view_layer.objects.active=objs[0];bpy.ops.object.join();o=objs[0];o.name='실제_부패그루터기_원본UVHigh';me=o.data;mn=Vector([min(v.co[k]for v in me.vertices)for k in range(3)]);mx=Vector([max(v.co[k]for v in me.vertices)for k in range(3)]);c=(mn+mx)*.5;c.z=mn.z;size=mx-mn;sc=Vector((5.5/max(size.x,size.y),5.5/max(size.x,size.y),2.4/size.z))
for v in me.vertices:v.co=(v.co-c)*sc-Vector((0,0,.2))
for mat in me.materials:
 n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');prev=bs.inputs['Base Color'].links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.55;h.inputs['Value'].default_value=.65;l.new(prev,h.inputs['Color']);mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.64,.56,.40,1);l.new(h.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color'])
o.hide_render=True;o.hide_set(True);bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/실제그루터기_제작입력.blend'))
o.hide_render=False;o.hide_set(False);S.world.use_nodes=True;bg=next(n for n in S.world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs[0].default_value=(.16,.18,.21,1);bg.inputs[1].default_value=.45
def area(name,p,power,col,size):
 d=bpy.data.lights.new(name,'AREA');d.energy=power;d.color=col;d.shape='DISK';d.size=size;q=bpy.data.objects.new(name,d);S.collection.objects.link(q);q.location=p;q.rotation_euler=(Vector((0,0,1))-q.location).to_track_quat('-Z','Y').to_euler()
area('검수주광',(-5,-7,12),1900,(.67,.77,1),7);area('검수보조',(7,-4,7),900,(1,.79,.56),6);area('검수림',(0,7,11),2100,(.6,.74,.96),7);bpy.ops.mesh.primitive_plane_add(size=80);floor=bpy.context.object;floor.location.z=-.04;m=bpy.data.materials.new('검수지면');m.diffuse_color=(.035,.043,.055,1);floor.data.materials.append(m);bpy.ops.object.camera_add();cam=bpy.context.object;S.camera=cam;cam.data.type='ORTHO';cam.data.ortho_scale=7.0;target=Vector((0,0,1));cam.location=target+Vector((10,-14,math.hypot(10,14)*math.tan(math.radians(52))));cam.rotation_euler=(target-cam.location).to_track_quat('-Z','Y').to_euler();S.render.resolution_x=1600;S.render.resolution_y=1000;S.render.resolution_percentage=70;S.cycles.samples=24;S.render.filepath=str(R/'renders/실제부패그루터기_52도_형태검수.png');bpy.ops.render.render(write_still=True);print('실제그루터기 원래 크기',list(size),'형상 배율',list(sc),flush=True)
