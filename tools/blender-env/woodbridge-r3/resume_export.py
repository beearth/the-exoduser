"""완료된 베이크/FBX를 재사용하여 포장 단계만 재개. 같은 베이크 반복 없음."""
import bpy,bmesh,json,shutil
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_베이크입력.blend'));S=bpy.context.scene
rows=json.loads((R/'source/납품-베이크진행.json').read_text(encoding='utf8'))
def select(obs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
def apply(o,m):
 old=o.data;clones=[q for q in S.objects if q!=o and q.data==old];o.data=old.copy();select([o],o);bpy.ops.object.modifier_apply(modifier=m.name)
 for q in clones:q.data=o.data
def mat(id,ims,alpha=False):
 m=bpy.data.materials.new(id+'_Baked');m.use_nodes=True;n=m.node_tree.nodes;l=m.node_tree.links;bs=next(q for q in n if q.type=='BSDF_PRINCIPLED')
 for kind,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:
  tx=n.new('ShaderNodeTexImage');tx.image=ims[kind];l.new(tx.outputs[0],bs.inputs[socket])
  if kind=='BaseColor'and alpha:
   if 'Vista_Card'in id:l.new(tx.outputs['Alpha'],bs.inputs['Alpha'])
   else:cut=n.new('ShaderNodeMath');cut.operation='GREATER_THAN';cut.inputs[1].default_value=.32;l.new(tx.outputs['Alpha'],cut.inputs[0]);l.new(cut.outputs[0],bs.inputs['Alpha'])
 tx=n.new('ShaderNodeTexImage');tx.image=ims['Normal'];nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.25 if alpha else .55;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal']);return m
for r in rows:
 id=r['id'];o=bpy.data.objects[id];olddata=o.data;clones=[q for q in S.objects if q!=o and q.data==olddata];path=P/'Models'/(id+'.fbx');wasrender=o.hide_render;washide=o.hide_get()
 if r.get('FBX')and path.exists():
  before=set(bpy.data.objects);bpy.ops.import_scene.fbx(filepath=str(path));new=next(q for q in S.objects if q not in before and q.type=='MESH');new.data.transform(new.matrix_world);o.data=new.data.copy()
  for q in list(bpy.data.objects):
   if q not in before:bpy.data.objects.remove(q,do_unlink=True)
  for q in clones:q.data=o.data
 elif 'Terrain'in id:
  de=o.modifiers.new('연속경사_저밀도','DECIMATE');de.ratio=.35;apply(o,de);tri=o.modifiers.new('고정삼각화','TRIANGULATE');apply(o,tri)
  if not o.data.uv_layers:o.data.uv_layers.new(name='UVMap')
  uv=o.data.uv_layers.active
  for lp in o.data.loops:
   v=o.data.vertices[lp.vertex_index].co;uv.data[lp.index].uv=((v.x+36)/75,(v.y+22)/80)
 if '맵'not in r:
  old=id.replace('RF3_','RF_');r['맵']={}
  for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
   origin=R.parent/'woodbridge-r2/delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures'/(old+'_'+k+'.png');dest=P/'Textures'/(id+'_'+k+'.png');shutil.copyfile(origin,dest);r['맵'][k]=dest.name
  r['텍스처해상도']=2048 if any(x in id for x in ['Bridge','Branch'])else 1024;r['베이크']='r2 실제 high→low 베이크 원본 인수. 다리 파손/휨 기하 보정'
 ims={}
 for k,name in r['맵'].items():
  im=bpy.data.images.load(str(P/'Textures'/name),check_existing=False);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
 o.data.materials.clear();m=mat(id,ims,r.get('alpha',False));o.data.materials.append(m)
 for f in o.data.polygons:f.material_index=0
 bm=bmesh.new();bm.from_mesh(o.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 loose=[v for v in bm.verts if not v.link_faces]
 if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
 bm.to_mesh(o.data);bm.free();select([o],o);tri=o.modifiers.new('최종삼각화','TRIANGULATE');apply(o,tri);select([o],o);bpy.ops.export_scene.fbx(filepath=str(path),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'FBX':path.name,'재질':m.name,'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]});o.hide_render=wasrender;o.hide_set(washide)
 print('완료된 베이크 재사용·출력',id,flush=True)
for me in list(bpy.data.meshes):
 if me.users==0:bpy.data.meshes.remove(me)
for m in list(bpy.data.materials):
 if m.users==0:bpy.data.materials.remove(m)
for im in list(bpy.data.images):
 if im.users==0:bpy.data.images.remove(im)
relinked=[]
for im in bpy.data.images:
 if im.source=='FILE':
  im.filepath=bpy.path.abspath(im.filepath);p=Path(im.filepath)
  if not p.exists() and (P/'Textures'/p.name).exists():
   im.filepath=str(P/'Textures'/p.name);im.reload();relinked.append(im.name)
  assert im.packed_file or Path(im.filepath).exists(),'실제 누락 이미지 '+im.filepath
(R/'source/FBX-임시경로-해결.json').write_text(json.dumps({'원인':'FBX STRIP의 상대 이미지명을 Blender 임시 임포터가 Models 아래로 해석. 임시 orphan mesh가 재질 참조를 보유했다.','재연결':relinked,'해결':'임시 orphan mesh/material/image 제거 및 실제 Textures 경로를 pack 전에 검증','베이크반복':0},ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('베이크 반복 없이 최종 복구/포장 완료',flush=True)
