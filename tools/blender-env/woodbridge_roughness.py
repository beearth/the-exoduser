"""현재 고정 메시/UV에 CC0 실제 roughness만 재투영한다. 형태·나머지5맵은 보존한다."""
import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');OLD=R.parent/'forest-r1';P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=10
ids=['RF_Ancient_Rotten_Tree','RF_Rotten_Wood_Bridge','RF_Fallen_Log','RF_Foreground_Roots','RF_River_Stake_Cluster','RF_Bridge_Torch_Holder'];rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
for id in ids:
 low=bpy.data.objects[id];high=bpy.data.objects[id+'_High'];materials=list(high.data.materials)
 for m in materials:
  n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED')
  if not bs.inputs['Roughness'].is_linked:
   tx=next((x for x in n if x.type=='TEX_IMAGE' and x.image and '_Diffuse.jpg' in x.image.filepath),None)
   if tx:
    rp=OLD/'pbr-source'/Path(tx.image.filepath).name.replace('_Diffuse.jpg','_Rough.jpg')
    if rp.exists():
     rt=n.new('ShaderNodeTexImage');rt.image=bpy.data.images.load(str(rp),check_existing=True);rt.image.colorspace_settings.name='Non-Color';rt.projection=tx.projection;rt.projection_blend=tx.projection_blend
     if tx.inputs[0].is_linked:l.new(tx.inputs[0].links[0].from_socket,rt.inputs[0])
     l.new(rt.outputs[0],bs.inputs['Roughness'])
  em=n.new('ShaderNodeEmission');em.name='임시거칠기';so=bs.inputs['Roughness'];out=next(x for x in n if x.type=='OUTPUT_MATERIAL')
  if so.is_linked:l.new(so.links[0].from_socket,em.inputs[0])
  else:em.inputs[0].default_value=(*([so.default_value]*3),1)
  l.new(em.outputs[0],out.inputs[0])
 size=next(r['텍스처해상도'] for r in rows if r['id']==id);im=bpy.data.images.new(id+'_실물거칠기',width=size,height=size,alpha=False);im.colorspace_settings.name='Non-Color';target=low.data.materials[0];tx=target.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;target.node_tree.nodes.active=tx
 bpy.ops.object.select_all(action='DESELECT')
 for o in [low,high]:o.hide_set(False);o.hide_render=False;o.select_set(True)
 bpy.context.view_layer.objects.active=low;S.render.bake.use_selected_to_active=True;S.render.bake.cage_extrusion=.018;S.render.bake.max_ray_distance=.05;S.render.bake.margin=12;bpy.ops.object.bake(type='EMIT')
 im.filepath_raw=str(P/'Textures'/(id+'_Roughness.png'));im.file_format='PNG';im.save();target.node_tree.nodes.remove(tx)
 for m in materials:
  n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs[0])
  for x in list(n):
   if x.name=='임시거칠기':n.remove(x)
 for o in [low,high]:o.hide_render=True;o.hide_set(True)
 print('CC0 실물 거칠기 재베이크',id,flush=True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'))
