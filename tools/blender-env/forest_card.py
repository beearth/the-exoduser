import bpy,json,math,hashlib
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';name='RF_Forest_Vista_Card'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene
for suffix in ['', '_High']:
 old=bpy.data.objects.get(name+suffix)
 if old:bpy.data.objects.remove(old,do_unlink=True)
oldmat=bpy.data.materials.get(name+'_베이크표적')
if oldmat:bpy.data.materials.remove(oldmat,do_unlink=True)
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
cam=S.camera;S.render.film_transparent=True;S.render.resolution_x=2048;S.render.resolution_y=1024;S.cycles.samples=32;S.render.threads_mode='FIXED';S.render.threads=10
cam.location=(0,-40,5.2);cam.rotation_euler=(Vector((0,0,5.2))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.ortho_scale=22
clones=[]
for j,(x,y,sz,yaw) in enumerate([(-9,2,.8,15),(-6,1,1.1,63),(-3,3,1.25,140),(0,0,.95,220),(2.8,2,1.15,90),(6,0,1.02,300),(8.8,1,.8,20)]):
 src=bpy.data.objects['RF_Ancient_Rotten_Tree'];o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.location=(x,y,0);o.scale=(sz,)*3;o.rotation_euler.z=math.radians(yaw);o.hide_render=False;o.hide_set(False);clones.append(o)
 m=bpy.data.materials.new('먼숲_실루엣'+str(j));m.use_nodes=True;n=m.node_tree.nodes;n.clear();em=n.new('ShaderNodeEmission');em.inputs[0].default_value=(.035+.004*j,.060+.004*j,.064+.004*j,1);em.inputs[1].default_value=1;out=n.new('ShaderNodeOutputMaterial');m.node_tree.links.new(em.outputs[0],out.inputs[0]);o.data.materials.clear();o.data.materials.append(m)
 for f in o.data.polygons:f.material_index=0
S.render.filepath=str(P/'Textures'/(name+'_BaseColor.png'));bpy.ops.render.render(write_still=True)
for o in clones:bpy.data.objects.remove(o,do_unlink=True)
S.render.film_transparent=False
me=bpy.data.meshes.new(name);me.from_pydata([(-11,0,0),(11,0,0),(11,0,11),(-11,0,11)],[],[(0,1,2),(0,2,3)]);me.update();o=bpy.data.objects.new(name,me);S.collection.objects.link(o)
uv=me.uv_layers.new(name='UVMap');coords=[(0,0),(1,0),(1,1),(0,1)]
for face in me.polygons:
 for li in face.loop_indices:uv.data[li].uv=coords[me.loops[li].vertex_index]
m=bpy.data.materials.new(name+'_베이크표적');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(P/'Textures'/(name+'_BaseColor.png')));l.new(tx.outputs['Color'],bs.inputs['Base Color']);l.new(tx.outputs['Alpha'],bs.inputs['Alpha']);bs.inputs['Roughness'].default_value=1;m.surface_render_method='BLENDED';o.data.materials.append(m)
# 카드의 7맵은 실루엣 이미지를 제외하고 상수. 3D 하이→로우 베이크로 속이지 않는다.
for kind,color in [('Normal',(.5,.5,1,1)),('AO',(1,1,1,1)),('Curvature',(.5,.5,.5,1)),('Roughness',(1,1,1,1)),('Metallic',(0,0,0,1)),('MetallicSmoothness',(0,0,0,0))]:
 im=bpy.data.images.new(name+'_'+kind,width=2048,height=1024,alpha=True);im.generated_color=color;im.colorspace_settings.name='Non-Color';im.filepath_raw=str(P/'Textures'/(name+'_'+kind+'.png'));im.file_format='PNG';im.save()
bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o
bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
high=o.copy();high.data=o.data.copy();high.name=name+'_High';S.collection.objects.link(high);high.hide_render=True;high.hide_set(True)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));rows=[r for r in rows if r['id']!=name];rows.append({'id':name,'역할':'22×11m 후경용 투명 숲 실루엣 카드, 비보행 BACK 전용','정점':4,'삼각형':2,'하이폴리면':2,'텍스처해상도':2048,'텍스처높이':1024,'범위XYZ최소최대':[-11,0,0,11,0,11],'베이크':'새 거목 조형 7개를 정면 투명 렌더. BaseColor RGBA, 나머지6맵 상수. 수면·기상 셰이더 아님'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/완료.json').write_text(json.dumps({'모듈수':len(rows),'Unity실행':0},ensure_ascii=False),encoding='utf8')
o.hide_render=True;o.hide_set(True)
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
print('먼 숲 카드: 실제 새 거목 7개 투명 렌더·2tri 납품',flush=True)
