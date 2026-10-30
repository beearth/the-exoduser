"""분리된 굽은 섬유70가닥+실물 알파 잎. 넓은 천막 코어는 사용하지 않는다."""
import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));id='RF3_Hanging_Moss';o=bpy.data.objects[id];r=next(x for x in rows if x['id']==id);oldmaps=r['맵'].copy();ims={}
for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
 im=bpy.data.images.load(str(P/'Textures'/('Atlas_moss_fiber_'+k+'.png')),check_existing=False);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
for uv in o.data.uv_layers.active.data:uv.uv.x*=.5
for m in o.data.materials:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE'and n.image:
   for k,p in oldmaps.items():
    if Path(n.image.filepath).name==p and k in ims:n.image=ims[k]
with bpy.data.libraries.load(str(R/'source/이끼섬유_베이크.blend'),link=False)as(a,b):b.objects=['MOSS_FIBER_LO']
core=b.objects[0];S.collection.objects.link(core);core.hide_set(False);core.hide_render=False
for uv in core.data.uv_layers.active.data:uv.uv.x=.5+.5*uv.uv.x
old=o.data;clones=[q for q in S.objects if q!=o and q.data==old];mat=o.data.materials[0];bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);core.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.object.join();o.data.materials.clear();o.data.materials.append(mat)
for f in o.data.polygons:f.material_index=0
for q in clones:q.data=o.data
bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_render=True;o.hide_set(True)
r.update({'맵':{k:Path(im.filepath).name for k,im in ims.items()},'텍스처규격':[4096,2048],'텍스처해상도':4096,'역할':'70개의 분리된 굽은 부피 섬유와 원본 비례 CC0 미세 잎1080개를 엮은 수염이끼','베이크':'atlasU0..0.5:실물 알파식물 UV/노멀·AO1/곡률.5/roughness.9 상수. U0.5..1:분리된 섬유 high→low 실제 normal/AO/곡률/PBR 베이크. 넓은 면 코어0','정점':len(o.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in o.data.polygons),'bounds':[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)],'세부원본':{'식물':1080,'분리섬유':70,'베이크파일':'source/이끼섬유_베이크.blend'}})
for im in bpy.data.images:
 if im.source=='FILE'and Path(bpy.path.abspath(im.filepath)).parent==P/'Textures':
  if im.packed_file:im.unpack(method='REMOVE')
  im.reload()
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/분리섬유이끼_검수.png');bpy.ops.render.render(write_still=True)
