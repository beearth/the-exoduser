"""검수 후보의 실제 high→low 베이크와 동일 low 메시·텍스처 FBX 납품. Unity 없음."""
import bpy,bmesh,math,json,sys,shutil,numpy as np
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3'
for d in ['Models','Textures','Materials']:(P/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/뿌리매립선_검수후보.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.device='CPU';S.render.threads_mode='FIXED';S.render.threads=10
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));visibility={o.name:(o.hide_render,o.hide_get())for o in S.objects}
for o in S.objects:o.hide_render=True;o.hide_set(True)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):
 old=o.data;instances=[q for q in S.objects if q!=o and q.data==old];o.data=old.copy();select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
 for q in instances:q.data=o.data
def image(name,size,kind='linear'):
 im=bpy.data.images.new(name,width=size,height=size,alpha=True);im.colorspace_settings.name='sRGB'if kind=='color'else'Non-Color';return im
def save(im,name):
 im.filepath_raw=str(P/'Textures'/(name+'.png'));im.file_format='PNG';im.save();return str(im.filepath_raw)
def constant(name,size,val):
 im=image(name,size);im.generated_color=(*([val]*3),1);save(im,name);return im
def material(id,ims,alpha=False,strength=.55):
 m=bpy.data.materials.new(id+'_Baked');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;n.clear();bs=n.new('ShaderNodeBsdfPrincipled');out=n.new('ShaderNodeOutputMaterial');l.new(bs.outputs[0],out.inputs['Surface'])
 for kind,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:
  tx=n.new('ShaderNodeTexImage');tx.image=ims[kind];l.new(tx.outputs[0],bs.inputs[socket])
  if kind=='BaseColor'and alpha:
   cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.32;l.new(tx.outputs['Alpha'],cut.inputs[0]);l.new(cut.outputs[0],bs.inputs['Alpha'])
 tx=n.new('ShaderNodeTexImage');tx.image=ims['Normal'];nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=strength;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal']);return m
def clean(o):
 bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 loose=[v for v in bm.verts if not v.link_faces]
 if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
 bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.normal_update()
 if 'Terrain'in o.name:bmesh.ops.reverse_faces(bm,faces=[f for f in bm.faces if f.normal.z<0])
 bm.to_mesh(o.data);bm.free()
def checkpoint():
 (R/'source/납품-베이크진행.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')

opaque=['RF3_Moss_Rock_1','RF3_Moss_Rock_2','RF3_Moss_Rock_3']
for id in opaque:
 print('원본 UV 암반2K 재베이크',id,flush=True);low=bpy.data.objects[id];old=low.data;clones=[o for o in S.objects if o!=low and o.data==old];src=bpy.data.objects[id+'_High'];high=src.copy();high.data=src.data.copy();high.name=id+'_원본UVHigh';S.collection.objects.link(high)
 for i,m in enumerate(list(high.data.materials)):
  cp=m.copy();high.data.materials[i]=cp;n=cp.node_tree.nodes;l=cp.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');prev=bs.inputs['Base Color'].links[0].from_socket;mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.58,.65,.46,1);l.new(prev,mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color'])
 low.data=high.data.copy();de=low.modifiers.new('스캔원래UV_형상보존','DECIMATE');de.ratio=.75;apply(low,de)
 for o in clones:o.data=low.data
 for f in low.data.polygons:f.use_smooth=True
 size=2048
 clean(low);select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
 low.data.uv_layers.active_index=0
 original=list(high.data.materials);target=bpy.data.materials.new(id+'_Target');target.use_nodes=True;low.data.materials.clear();low.data.materials.append(target)
 for f in low.data.polygons:f.material_index=0
 ims={};S.render.bake.use_selected_to_active=True;S.render.bake.cage_extrusion=.20 if 'Tree'in id else .06;S.render.bake.max_ray_distance=.8 if 'Tree'in id else .25;S.render.bake.margin=12
 high.hide_render=False;low.hide_render=False
 for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
  im=image(id+'_'+kind,size,'color'if kind=='BaseColor'else'linear')
  if kind=='Normal':im.generated_color=(.5,.5,1,1)
  tx=target.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;target.node_tree.nodes.active=tx
  if kind not in ['Normal','AO']:
   for m in original:
    if not m or not m.use_nodes:continue
    n=m.node_tree.nodes;l=m.node_tree.links;bs=next((q for q in n if q.type=='BSDF_PRINCIPLED'),None);out=next(q for q in n if q.type=='OUTPUT_MATERIAL');em=n.new('ShaderNodeEmission');em.name='베이크임시'
    if kind=='Curvature':ge=n.new('ShaderNodeNewGeometry');ge.name='베이크임시곡률';l.new(ge.outputs['Pointiness'],em.inputs[0])
    else:
     so=bs.inputs['Base Color'if kind=='BaseColor'else kind]
     if so.is_linked:l.new(so.links[0].from_socket,em.inputs[0])
     else:em.inputs[0].default_value=so.default_value if kind=='BaseColor'else(*([so.default_value]*3),1)
    l.new(em.outputs[0],out.inputs['Surface'])
  select([high,low],low);S.cycles.samples=12 if kind=='AO'else 1;bpy.ops.object.bake(type='NORMAL'if kind=='Normal'else'AO'if kind=='AO'else'EMIT');save(im,id+'_'+kind);ims[kind]=im
  for m in original:
   if not m or not m.use_nodes:continue
   n=m.node_tree.nodes;l=m.node_tree.links;bs=next((q for q in n if q.type=='BSDF_PRINCIPLED'),None);out=next(q for q in n if q.type=='OUTPUT_MATERIAL')
   if bs:l.new(bs.outputs[0],out.inputs['Surface'])
   for q in list(n):
    if q.name.startswith('베이크임시'):n.remove(q)
  target.node_tree.nodes.remove(tx);print('맵 완료',id,kind,flush=True)
 low.data.materials.clear();low.data.materials.append(material(id,ims));high.hide_render=True;high.hide_set(True);low.hide_render=True;low.hide_set(True)
 r=next(r for r in rows if r['id']==id);r.update({'텍스처해상도':size,'재질':id+'_Baked','맵':{k:Path(im.filepath_raw).name for k,im in ims.items()},'베이크':'실제 원본/조형 high→decimated low selected-to-active Cycles normal/AO/curvature/PBR','high':high.name,'텍스처규격':[2048,2048],'암반후속':'원래 스캔UV·75퍼센트 기하 보존,6맵2K 실제 재베이크. 자동UV 조각화 세부 손실을 수정'});checkpoint()


for id in opaque:
 o=bpy.data.objects[id];select([o]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_render=True;o.hide_set(True);r=next(x for x in rows if x['id']==id);r.update({'재질':o.data.materials[0].name,'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'high삼각형':sum(len(f.vertices)-2 for f in bpy.data.objects[r['high']].data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]})
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/매립뿌리_원본UV암반.png');bpy.ops.render.render(write_still=True)
