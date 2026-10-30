"""실제 CC0 균열 수피를 기존 스캔 하이 표면에 투사해 저밀도 UV의 4K 컬러/노멀로 베이크."""
import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));vis={o.name:(o.hide_render,o.hide_get())for o in S.objects}
for o in S.objects:o.hide_render=True;o.hide_set(True)
def sel(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
m=bpy.data.materials.new('CC0_균열수피_추가표면');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');coord=n.new('ShaderNodeTexCoord');mp=n.new('ShaderNodeVectorMath');mp.operation='MULTIPLY';mp.inputs[1].default_value=(.42,.42,.32);l.new(coord.outputs['Object'],mp.inputs[0]);diff=n.new('ShaderNodeTexImage');diff.image=bpy.data.images.load(str(R/'pbr-source/bark_brown_02_Diffuse_4k.jpg'));diff.projection='BOX';diff.projection_blend=.35;l.new(mp.outputs[0],diff.inputs[0]);mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.45,.40,.32,1);l.new(diff.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color']);bs.inputs['Roughness'].default_value=.9;tx=n.new('ShaderNodeTexImage');tx.image=bpy.data.images.load(str(R/'pbr-source/bark_brown_02_bump_4k.jpg'));tx.image.colorspace_settings.name='Non-Color';tx.projection='BOX';tx.projection_blend=.35;l.new(mp.outputs[0],tx.inputs[0]);bump=n.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.7;bump.inputs['Distance'].default_value=.12;l.new(tx.outputs[0],bump.inputs['Height']);l.new(bump.outputs[0],bs.inputs['Normal'])
for id in ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']:
 low=bpy.data.objects[id];high=bpy.data.objects[id+'_High'].copy();high.data=high.data.copy();high.name=id+'_균열수피High';S.collection.objects.link(high);high.data.materials.clear();high.data.materials.append(m)
 for f in high.data.polygons:f.material_index=0
 original=list(low.data.materials);target=bpy.data.materials.new(id+'_균열표적');target.use_nodes=True;low.data.materials.clear();low.data.materials.append(target);bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.2;bak.max_ray_distance=.8;bak.margin=16;bak.normal_space='TANGENT';bak.normal_r='POS_X';bak.normal_g='POS_Y';bak.normal_b='POS_Z'
 for kind in ['Normal','BaseColor']:
  im=bpy.data.images.new(id+'_균열_'+kind,width=4096,height=4096,alpha=True);im.colorspace_settings.name='sRGB'if kind=='BaseColor'else'Non-Color';t=target.node_tree.nodes.new('ShaderNodeTexImage');t.image=im;target.node_tree.nodes.active=t
  if kind=='BaseColor':em=n.new('ShaderNodeEmission');l.new(mul.outputs[0],em.inputs[0]);l.new(em.outputs[0],out.inputs['Surface'])
  sel([high,low],low);high.hide_render=False;low.hide_render=False;S.cycles.samples=1;bpy.ops.object.bake(type='NORMAL'if kind=='Normal'else'EMIT');im.filepath_raw=str(P/'Textures'/(id+'_'+kind+'.png'));im.file_format='PNG';im.save();target.node_tree.nodes.remove(t)
  if kind=='BaseColor':n.remove(em);l.new(bs.outputs[0],out.inputs['Surface'])
  for mat in original:
   for q in mat.node_tree.nodes:
    if q.type=='TEX_IMAGE'and q.image and Path(q.image.filepath).name==id+'_'+kind+'.png':q.image=im
  print('균열수피4K',id,kind,flush=True)
 low.data.materials.clear()
 for mat in original:low.data.materials.append(mat)
 high.hide_render=True;high.hide_set(True);low.hide_render=True;low.hide_set(True);r=next(x for x in rows if x['id']==id);r['수피추가']='CC0 bark_brown_02 diffuse/bump4K를 스캔 high에 Object BOX 투사. 기존 low UV 4K BaseColor/Normal 실제 재베이크. AO/곡률/roughness/metallic은 기존 베이크 재표본화';r['텍스처규격']=[4096,4096];r['텍스처해상도']=4096
for name,(render,hide)in vis.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/균열수피4K_검수.png');bpy.ops.render.render(write_still=True)
