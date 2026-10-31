import bpy,bmesh,json,math
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env')
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
S=bpy.context.scene;S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=12
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def sel(objs,active):
 bpy.ops.object.select_all(action='DESELECT')
 for o in objs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active
def separate(src):
 o=src.copy();o.data=src.data.copy();S.collection.objects.link(o);o.hide_set(False);sel([o],o)
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.separate(type='LOOSE');bpy.ops.object.mode_set(mode='OBJECT')
 result=list(bpy.context.selected_objects)
 for p in result:p.hide_render=True
 return result
def center(o):
 points=[o.matrix_world@v.co for v in o.data.vertices]
 return Vector(tuple((min(p[k] for p in points)+max(p[k] for p in points))/2 for k in range(3)))
receipts=[]
for r in rows:
 id=r['id'];low=bpy.data.objects[id];high=bpy.data.objects[id+'_High']
 # 작은 베벨보다 큰 변위를 주면 하이폴리 자체가 접히는 것이 직접 원인이었다.
 # 검은 점을 지우는 대신 겹치지 않는 하이폴리 표면과 CC0 범프 디테일로 재구성한다.
 source_materials=list(high.data.materials)
 high.data=low.data.copy();high.data.materials.clear()
 for m in source_materials:high.data.materials.append(m)
 for p in high.data.polygons:p.material_index=0
 sub=high.modifiers.new('접힘없는하이폴리','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;sel([high],high);bpy.ops.object.modifier_apply(modifier=sub.name)
 r['하이폴리면']=len(high.data.polygons)
 # convex_hull가 남긴 내부 고립 정점은 얼굴 없는 loose 오브젝트를 만들므로 원본 단계에서 제거한다.
 removed=0
 for obj in [low,high]:
  bm=bmesh.new();bm.from_mesh(obj.data);orphan=[v for v in bm.verts if not v.link_faces];removed+=len(orphan)
  if orphan:bmesh.ops.delete(bm,geom=orphan,context='VERTS')
  bm.to_mesh(obj.data);bm.free();obj.data.update()
 if len(low.data.vertices)!=r['정점']:
  r['정점']=len(low.data.vertices);sel([low],low)
  bpy.ops.export_scene.fbx(filepath=str(R/'delivery/Assets/Exoduser/Art/Environment/CH1_1/Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 lows=separate(low);highs=separate(high)
 assert len(lows)==len(highs),(id,len(lows),len(highs))
 im=bpy.data.images.new(id+'_고립투영노멀',width=r['텍스처해상도'],height=r['텍스처해상도'],alpha=False);im.colorspace_settings.name='Non-Color';im.generated_color=(.5,.5,1,1)
 mat=low.data.materials[0];node=mat.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;mat.node_tree.nodes.active=node
 bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.024 if ('Bone' in id or 'Chain' in id) else .065;bak.max_ray_distance=bak.cage_extrusion*2.2;bak.margin=12
 unmatched=list(highs);maxdist=0
 for i,l in enumerate(lows):
  c=center(l);h=min(unmatched,key=lambda x:(center(x)-c).length);dist=(center(h)-c).length;assert dist<.2,(id,'쌍매칭실패',dist);maxdist=max(maxdist,dist);unmatched.remove(h)
  h.hide_render=False;l.hide_render=False;sel([h,l],l);bak.use_clear=i==0
  bpy.ops.object.bake(type='NORMAL');h.hide_render=True;l.hide_render=True
 path=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1/Textures'/(id+'_Normal.png');im.filepath_raw=str(path);im.file_format='PNG';im.save();mat.node_tree.nodes.remove(node)
 for o in lows+highs:bpy.data.objects.remove(o,do_unlink=True)
 receipts.append({'id':id,'개별메시쌍':len(lows),'고립정점정리':removed,'최대중심오차m':maxdist,'케이지m':bak.cage_extrusion,'방법':'접힘없는 하이폴리+CC0 범프, 연결성분별 하이→로우 고립 투영'})
 print('고립투영 완료',id,len(lows),flush=True)
(R/'노멀-고립투영.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
