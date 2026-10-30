"""재현된 지형 노멀 기저 반전 수정. 기존8종 중 지면 Normal/AO만 재베이크."""
import bpy,bmesh,math,json,numpy as np,shutil
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;visibility={o.name:(o.hide_render,o.hide_get())for o in S.objects};low=bpy.data.objects['RF3_Continuous_Bank_Terrain'];bm=bmesh.new();bm.from_mesh(low.data);bm.normal_update();bad=[f for f in bm.faces if f.normal.z<0];bmesh.ops.reverse_faces(bm,faces=bad);bm.to_mesh(low.data);bm.free()
for o in S.objects:o.hide_render=True;o.hide_set(True)
with bpy.data.libraries.load(str(R/'source/승인구도_베이크입력.blend'),link=False)as(a,b):b.objects=['RF3_Continuous_Bank_Terrain']
high=b.objects[0];S.collection.objects.link(high);high.name='지면_검증된위방향_High';mat=low.data.materials[0];S.render.bake.use_selected_to_active=True;S.render.bake.normal_space='TANGENT';S.render.bake.normal_r='POS_X';S.render.bake.normal_g='POS_Y';S.render.bake.normal_b='POS_Z';S.render.bake.cage_extrusion=.6;S.render.bake.max_ray_distance=2;S.render.bake.margin=12
hist=R/'source/실패노멀보존';hist.mkdir(exist_ok=True);stats=[]
for kind in ['Normal','AO']:
 p=P/'Textures'/('RF3_Continuous_Bank_Terrain_'+kind+'.png');shutil.copyfile(p,hist/p.name);im=bpy.data.images.new('위방향재베이크_'+kind,width=4096,height=4096);im.colorspace_settings.name='Non-Color';im.generated_color=(.5,.5,1,1)if kind=='Normal'else(1,1,1,1);tx=mat.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;mat.node_tree.nodes.active=tx;bpy.ops.object.select_all(action='DESELECT')
 for o in [high,low]:o.hide_set(False);o.hide_render=False;o.select_set(True)
 bpy.context.view_layer.objects.active=low;S.cycles.samples=12 if kind=='AO'else 1;bpy.ops.object.bake(type='NORMAL'if kind=='Normal'else'AO');im.filepath_raw=str(p);im.file_format='PNG';im.save();arr=np.empty(4096*4096*4,dtype=np.float32);im.pixels.foreach_get(arr)
 if kind=='Normal':
  neg=float((arr[2::4]<.4).mean());assert neg<.001,neg
  for n in mat.node_tree.nodes:
   if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.45
   if n.type=='TEX_IMAGE'and n!=tx and n.image and n.image.name.startswith('RF3_Continuous_Bank_Terrain_Normal'):n.image=im
  stats.append({'종류':kind,'Blue음수비율':neg,'평균Blue':float(arr[2::4].mean())})
 else:stats.append({'종류':kind,'평균AO':float(arr[0::4].mean())})
 mat.node_tree.nodes.remove(tx);print('지면 재베이크',stats[-1],flush=True)
bpy.data.objects.remove(high,do_unlink=True)
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
select=lambda:None
bpy.ops.object.select_all(action='DESELECT');low.hide_set(False);low.select_set(True);bpy.context.view_layer.objects.active=low;bpy.ops.export_scene.fbx(filepath=str(P/'Models/RF3_Continuous_Bank_Terrain.fbx'),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);low.hide_set(True)
# 모든 이끼 다발의 맨 윗부분을 실제 목질 표면에 붙인다.
from mathutils.bvhtree import BVHTree
woodnames=['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','River_Stake'];wooddata={o.data for o in S.objects if o.name.startswith('RF3_')and any(x in o.name for x in woodnames)};verts=[];faces=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in wooddata:
  base=len(verts);verts.extend(o.matrix_world@v.co for v in o.data.vertices);faces.extend(tuple(base+i for i in f.vertices)for f in o.data.polygons)
bvh=BVHTree.FromPolygons(verts,faces);mossdata=bpy.data.objects['RF3_Hanging_Moss'].data;top=max(v.co.z for v in mossdata.vertices);moved=removed=0
for o in list(S.objects):
 if o.type=='MESH'and not o.hide_render and o.data==mossdata:
  anchor=o.matrix_world@Vector((0,0,top));hit,normal,index,d=bvh.find_nearest(anchor)
  if hit is None or d>3.2:bpy.data.objects.remove(o,do_unlink=True);removed+=1
  else:o.location+=hit-anchor;moved+=1
# 빛기둥 가장자리와 강도를 부드럽게 만든다.
for o in S.objects:
 if o.type=='LIGHT'and o.name.startswith('검수_체적달빛_'):o.data.energy*=.48;o.data.spot_blend=1.0
 if o.name.startswith('검수_실제체적빛기둥_'):
  m=o.data.materials[0];n=m.node_tree.nodes;l=m.node_tree.links;scatter=next(q for q in n if q.type=='VOLUME_SCATTER');g=n.new('ShaderNodeTexCoord');sep=n.new('ShaderNodeSeparateXYZ');l.new(g.outputs['Generated'],sep.inputs[0]);xx=n.new('ShaderNodeMath');xx.operation='SUBTRACT';xx.inputs[1].default_value=.5;l.new(sep.outputs['X'],xx.inputs[0]);yy=n.new('ShaderNodeMath');yy.operation='SUBTRACT';yy.inputs[1].default_value=.5;l.new(sep.outputs['Y'],yy.inputs[0]);a=n.new('ShaderNodeMath');a.operation='MULTIPLY';l.new(xx.outputs[0],a.inputs[0]);l.new(xx.outputs[0],a.inputs[1]);b=n.new('ShaderNodeMath');b.operation='MULTIPLY';l.new(yy.outputs[0],b.inputs[0]);l.new(yy.outputs[0],b.inputs[1]);c=n.new('ShaderNodeMath');c.operation='ADD';l.new(a.outputs[0],c.inputs[0]);l.new(b.outputs[0],c.inputs[1]);r=n.new('ShaderNodeMapRange');r.interpolation_type='SMOOTHERSTEP';r.inputs['From Min'].default_value=.025;r.inputs['From Max'].default_value=.22;r.inputs['To Min'].default_value=.016;r.inputs['To Max'].default_value=0;l.new(c.outputs[0],r.inputs[0]);l.new(r.outputs[0],scatter.inputs['Density'])
S.render.resolution_percentage=38;S.cycles.samples=16
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/수정검수_법선접지빛.png');bpy.ops.render.render(write_still=True)
(R/'source/지면-법선수정-검증.json').write_text(json.dumps({'원인재현':'저밀도 뒤 recalc에서16798면 하향. 베이크 뒤 FBX복구의 위방향 메시와 tangent 기저 불일치','수정면':len(bad),'NormalAO재베이크':stats,'이끼실물접지':moved,'부유이끼제외':removed},ensure_ascii=False,indent=2),encoding='utf8');print('법선·접지·빛 수정 검수 완료',flush=True)
