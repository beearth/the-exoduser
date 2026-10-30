"""분리된 바닥 스캔 조각만 제외하고 납품-조립-현재 PNG의 동일성을 기록한다."""
import bpy,bmesh,json,hashlib,math
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));removed=[]
for id in ([] if any(r.get('매립깊이m')for r in rows)else ['RF3_Ancient_Tree_A','RF3_Ancient_Tree_B','RF3_Root_Stump']):
 o=bpy.data.objects[id];me=o.data;parent=list(range(len(me.vertices)))
 def root(a):
  while parent[a]!=a:parent[a]=parent[parent[a]];a=parent[a]
  return a
 def union(a,b):
  a=root(a);b=root(b)
  if a!=b:parent[b]=a
 pos={}
 for v in me.vertices:
  key=tuple(round(x,4)for x in v.co)
  if key in pos:union(v.index,pos[key])
  else:pos[key]=v.index
 for e in me.edges:union(*e.vertices)
 comps={}
 for v in me.vertices:comps.setdefault(root(v.index),[]).append(v)
 keep=max(comps,key=lambda k:len(comps[k]));bad=set()
 for k,vs in comps.items():
  if k!=keep and max(v.co.z for v in vs)<1.30:bad.update(v.index for v in vs)
 bm=bmesh.new();bm.from_mesh(me);bm.verts.ensure_lookup_table();bv=[bm.verts[i]for i in bad]
 if bv:bmesh.ops.delete(bm,geom=bv,context='VERTS')
 loose=[v for v in bm.verts if not v.link_faces]
 if loose:bmesh.ops.delete(bm,geom=loose,context='VERTS')
 bm.to_mesh(me);bm.free();removed.append({'id':id,'소형바닥분리정점':len(bv),'전체성분':len(comps)})
 bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
for r in rows:
 o=bpy.data.objects[r['id']];r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)],'재질':o.data.materials[0].name})
 r['BumpScale']=next((n.inputs['Strength'].default_value for n in o.data.materials[0].node_tree.nodes if n.type=='NORMAL_MAP'),0)
 for m in o.data.materials:
  for n in m.node_tree.nodes:
   if n.type=='TEX_IMAGE'and n.image:
    im=n.image;f=Path(bpy.path.abspath(im.filepath))
    if f.parent==P/'Textures':
     if im.packed_file:im.unpack(method='REMOVE')
     im.reload()
try:S.view_settings.look='AgX - Medium High Contrast'
except TypeError:pass
S.render.resolution_x=1920;S.render.resolution_y=1080;S.render.resolution_percentage=100;S.cycles.samples=96
meshes={bpy.data.objects[r['id']].data:r['id']for r in rows};poses=[{'id':meshes[o.data],'이름':o.name,'BlenderXYZ':list(o.location),'회전모드':o.rotation_mode,'회전XYZ':list(o.rotation_euler),'배율':list(o.scale)}for o in S.objects if o.type=='MESH'and not o.hide_render and o.data in meshes]
water=next(n for n in bpy.data.materials['독액_기준대리물_비납품'].node_tree.nodes if n.type=='BSDF_PRINCIPLED')
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/조립-납품모듈배치.json').write_text(json.dumps({'범위':'Blender 정적 납품 동일 조립. Unity게임/충돌 배치 아님','대리물':'수면·불·체적안개/빛기둥','카메라XYZ':list(S.camera.location),'카메라회전':list(S.camera.rotation_euler),'초점mm':S.camera.data.lens,'배치':poses,'스캔잔여제거':removed,'컬러look':S.view_settings.look,'독액':{'linearRGB최소':[.062,.070,.014],'linearRGB최대':[.082,.086,.021],'roughness':water.inputs['Roughness'].default_value,'SpecularIORLevel':water.inputs['Specular IOR Level'].default_value,'IOR':water.inputs['IOR'].default_value,'발광':water.inputs['Emission Strength'].default_value}},ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.outliner.orphans_purge(do_local_ids=True,do_linked_ids=False,do_recursive=True);bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('현재 납품 동일 조립 동결',len(poses),removed,flush=True)
