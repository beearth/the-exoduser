"""CC0 알파 외곽과 실제 베이크한 연속 이끼 질량을 한 재질/atlas로 합친다."""
import bpy,json,math
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));ids=['RF3_Hanging_Moss','RF3_Moss_Cushion'];ims={}
for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
 im=bpy.data.images.load(str(P/'Textures'/('Atlas_moss_mass_'+k+'.png')),check_existing=True);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
for id in ids:
 o=bpy.data.objects[id];r=next(r for r in rows if r['id']==id);oldmaps=r['맵'].copy()
 for uv in o.data.uv_layers.active.data:uv.uv.x*=.5
 for m in o.data.materials:
  for n in m.node_tree.nodes:
   if n.type=='TEX_IMAGE'and n.image:
    name=Path(n.image.filepath).name
    for k,old in oldmaps.items():
     if name==old and k in ims:n.image=ims[k]
 r['맵']={k:Path(im.filepath).name for k,im in ims.items()};r['텍스처규격']=[4096,2048];r['텍스처해상도']=4096
with bpy.data.libraries.load(str(R/'source/이끼코어_베이크.blend'),link=False)as(a,b):b.objects=['MOSS_CORE_LO']
core=b.objects[0];S.collection.objects.link(core);core.hide_set(False);core.hide_render=False
for uv in core.data.uv_layers.active.data:uv.uv.x=.5+.5*uv.uv.x
o=bpy.data.objects['RF3_Hanging_Moss'];old=o.data;clones=[q for q in S.objects if q!=o and q.data==old];mat=o.data.materials[0];bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);core.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.join();o.data.materials.clear();o.data.materials.append(mat)
for f in o.data.polygons:f.material_index=0
for q in clones:q.data=o.data
o.hide_render=True;o.hide_set(True)
r=next(r for r in rows if r['id']=='RF3_Hanging_Moss');r.update({'역할':'실제 베이크한 연속 이끼 질량+CC0 알파 카드320개의 수염이끼 다발','베이크':'atlas 왼쪽:CC0 원본 UV/노멀/Alpha·AO1/곡률.5/roughness.9. 오른쪽:연속 질량 실제 high→low normal/AO/곡률/PBR','세부원본':{'카드':320,'코어':'source/이끼코어_베이크.blend:MOSS_CORE_HIGH','atlasU':{'원본카드':[0,.5],'코어':[.5,1]}}});next(r for r in rows if r['id']=='RF3_Moss_Cushion')['베이크']='CC0 원본카드 UV를 atlas U0..0.5로 재배치. 실제 알파/노멀/컬러 톤, AO1·곡률.5·roughness.9 상수'
wooddata={bpy.data.objects[r['id']].data for r in rows if any(s in r['id']for s in ['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','Foreground_Branch','River_Stake'])};vv=[];ff=[]
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data in wooddata:
  base=len(vv);vv.extend(q.matrix_world@v.co for v in q.data.vertices);ff.extend(tuple(base+i for i in f.vertices)for f in q.data.polygons)
bvh=BVHTree.FromPolygons(vv,ff);top=max(v.co.z for v in o.data.vertices)
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data==o.data:
  anchor=q.matrix_world@Vector((0,0,top));hit,n,idx,d=bvh.find_nearest(anchor)
  if hit is not None:
   if math.hypot(n.x,n.y)>.1:q.rotation_euler.z=math.atan2(n.y,n.x)+math.pi/2
   q.location=hit+Vector((n.x*.04,n.y*.04,-top*q.scale.z))
for id in ids:
 o=bpy.data.objects[id];bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True);r=next(r for r in rows if r['id']==id);r.update({'정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]})
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/입체이끼질량_검수.png');bpy.ops.render.render(write_still=True)
