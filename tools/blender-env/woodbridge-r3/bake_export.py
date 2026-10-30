"""검수 후보의 실제 high→low 베이크와 동일 low 메시·텍스처 FBX 납품. Unity 없음."""
import bpy,bmesh,math,json,sys,shutil,numpy as np
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3'
for d in ['Models','Textures','Materials']:(P/d).mkdir(parents=True,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_베이크입력.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.device='CPU';S.render.threads_mode='FIXED';S.render.threads=10
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));visibility={o.name:(o.hide_render,o.hide_get())for o in S.objects}
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

opaque=['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Fallen_Log','RF3_Root_Stump','RF3_Moss_Rock_1','RF3_Moss_Rock_2','RF3_Moss_Rock_3','RF3_Continuous_Bank_Terrain']
for id in opaque:
 print('실제 high→low 베이크 시작',id,flush=True);low=bpy.data.objects[id];high=bpy.data.objects.get(id+'_High');size=4096 if 'Terrain'in id else 2048 if any(s in id for s in ['Tree','Log','Stump'])else 1024
 if not high:
  high=low.copy();high.data=low.data.copy();high.name=id+'_High';S.collection.objects.link(high);old=low.data;clones=[o for o in S.objects if o.data==old and o!=low and o!=high];de=low.modifiers.new('연속경사_저밀도','DECIMATE');de.ratio=.35;apply(low,de)
  for o in clones:o.data=low.data
 clean(low);select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
 if not low.data.uv_layers:low.data.uv_layers.new(name='UVMap')
 low.data.uv_layers.active_index=0
 if 'Terrain'in id:
  uv=low.data.uv_layers.active
  for lp in low.data.loops:
   p=low.data.vertices[lp.vertex_index].co;uv.data[lp.index].uv=((p.x+36)/75,(p.y+22)/80)
 else:
  bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.12,island_margin=.008);bpy.ops.object.mode_set(mode='OBJECT')
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
 r=next(r for r in rows if r['id']==id);r.update({'텍스처해상도':size,'재질':id+'_Baked','맵':{k:Path(im.filepath_raw).name for k,im in ims.items()},'베이크':'실제 원본/조형 high→decimated low selected-to-active Cycles normal/AO/curvature/PBR','high':high.name});checkpoint()

# 실제 Alpha 원본을 포함한 식생 atlas. 기존 UV/카드 실루엣은 그대로 유지한다.
for source,ids in [('moss_01',['RF3_Hanging_Moss','RF3_Moss_Cushion']),('shrub_03',['RF3_Withered_Shrub'])]:
 print('알파 아틀라스',source,flush=True);m=bpy.data.materials[source];n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED');out=next(q for q in n if q.type=='OUTPUT_MATERIAL');prev=bs.inputs['Base Color'].links[0].from_socket;em=n.new('ShaderNodeEmission');l.new(prev,em.inputs[0]);l.new(em.outputs[0],out.inputs['Surface'])
 bpy.ops.mesh.primitive_plane_add(size=2);plane=bpy.context.object;plane.data.materials.append(m);plane.hide_render=False;size=2048;prefix='Atlas_'+source;im=image(prefix+'_BaseColor',size,'color');tx=n.new('ShaderNodeTexImage');tx.image=im;n.active=tx;S.render.bake.use_selected_to_active=False;select([plane]);S.cycles.samples=1;bpy.ops.object.bake(type='EMIT')
 arr=np.empty(size*size*4,dtype=np.float32);im.pixels.foreach_get(arr);mask=bpy.data.images.load(str(R/'scan-source'/source/(source+'_Alpha.png')),check_existing=True);mask.colorspace_settings.name='Non-Color';a=np.empty(size*size*4,dtype=np.float32);mask.pixels.foreach_get(a);arr[3::4]=a[0::4];im.pixels.foreach_set(arr);im.update();save(im,prefix+'_BaseColor');n.remove(tx);n.remove(em);l.new(bs.outputs[0],out.inputs['Surface']);bpy.data.objects.remove(plane,do_unlink=True)
 ims={'BaseColor':im};normal=bpy.data.images.load(str(R/'scan-source'/source/'textures'/(source+'_nor_gl_2k.jpg')),check_existing=True);normal.colorspace_settings.name='Non-Color';save(normal,prefix+'_Normal');ims['Normal']=normal
 for k,v in [('AO',1),('Roughness',.9),('Metallic',0),('Curvature',.5)]:ims[k]=constant(prefix+'_'+k,size,v)
 for id in ids:
  low=bpy.data.objects[id];low.data.materials.clear();low.data.materials.append(material(id,ims,True,.25));r=next(r for r in rows if r['id']==id);r.update({'텍스처해상도':2048,'재질':id+'_Baked','맵':{k:Path(im.filepath_raw).name for k,im in ims.items()},'베이크':'CC0 원본 UV/노멀/알파 보존. 컬러 톤은 emission atlas bake. AO1·곡률.5·roughness.9는 식생 기준 상수','alpha':True});checkpoint()

for r in rows:
 id=r['id'];low=bpy.data.objects[id]
 if '맵'not in r:
  # 기존 r2 베이크 결과를 byte 원본으로 복사하고 현재 변형 메시와 연결한다.
  old=id.replace('RF3_','RF_');ims={}
  for kind in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
   path=R.parent/'woodbridge-r2/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures'/(old+'_'+kind+'.png');dest=P/'Textures'/(id+'_'+kind+'.png');shutil.copyfile(path,dest);im=bpy.data.images.load(str(dest),check_existing=False);im.colorspace_settings.name='sRGB'if kind=='BaseColor'else'Non-Color';ims[kind]=im
  low.data.materials.clear();low.data.materials.append(material(id,ims,r.get('alpha',False)));r.update({'텍스처해상도':ims['BaseColor'].size[0],'재질':id+'_Baked','맵':{k:Path(im.filepath_raw).name for k,im in ims.items()},'베이크':'r2 실제 베이크 원본 인수. 다리 기하 뒤틀림/부분파손 변경 포함'})
 clean(low);select([low]);tri=low.modifiers.new('고정삼각화_출력','TRIANGULATE');apply(low,tri);clean(low);select([low]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 r.update({'정점':len(low.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in low.data.polygons),'FBX':id+'.fbx','high삼각형':sum(len(f.vertices)-2 for f in bpy.data.objects[r['high']].data.polygons)if r.get('high')else None,'bounds':[min(v.co[k]for v in low.data.vertices)for k in range(3)]+[max(v.co[k]for v in low.data.vertices)for k in range(3)]});low.hide_set(True);low.hide_render=True;checkpoint()
for name,(render,hide)in visibility.items():
 o=bpy.data.objects.get(name)
 if o:o.hide_render=render;o.hide_set(hide)
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'))
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print('FBX·베이크 최종 저장',len(rows),flush=True)
