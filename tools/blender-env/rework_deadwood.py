import bpy,bmesh,math,json,hashlib
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1';name='HE_Deadwood_Hollow'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
S=bpy.context.scene;S.render.engine='CYCLES';S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=12
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
for id in [name,name+'_High']:bpy.data.objects.remove(bpy.data.objects[id],do_unlink=True)
source=Path('I:/EXODUSER-Storage/demo-art/map/r2/source/r2_one_mass_lod_baked.blend')
with bpy.data.libraries.load(str(source),link=False) as (src,dst):dst.objects=['MASS_rotten_foot_scanned_stump','MASS_broken_rising_trunk_scanned']
parts=[]
for o in dst.objects:
 S.collection.objects.link(o);o.hide_render=False;o.hide_set(False);parts.append(o);select([o]);bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
 for v in o.data.vertices:
  x,y,z=v.co;v.co=(x-.8+.065*z*z,y+1.2+.09*math.sin(z*1.1)*z,z+.60)
 for m in o.data.materials:
  n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');socket=bs.inputs['Base Color']
  if socket.is_linked:
   original=socket.links[0].from_socket;h=n.new('ShaderNodeHueSaturation');h.inputs['Saturation'].default_value=.38;l.new(original,h.inputs['Color'])
   mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=.55;mul.inputs[2].default_value=(.50,.36,.31,1);l.new(h.outputs[0],mul.inputs[1]);l.new(mul.outputs[0],socket)
select(parts);bpy.ops.object.join();high=bpy.context.object;high.name=name+'_High';S.cursor.location=(0,0,0);bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
low=high.copy();low.data=high.data.copy();S.collection.objects.link(low);low.name=name;select([low]);dec=low.modifiers.new('스캔보존리토폴로지','DECIMATE');dec.ratio=.065;bpy.ops.object.modifier_apply(modifier=dec.name)
tri=low.modifiers.new('고정삼각화','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=tri.name)
bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
orphan=[v for v in bm.verts if not v.link_faces]
if orphan:bmesh.ops.delete(bm,geom=orphan,context='VERTS')
bm.to_mesh(low.data);bm.free();low.data.update()
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.012);bpy.ops.object.mode_set(mode='OBJECT')
materials=list(high.data.materials)
target=bpy.data.materials.get(name+'_베이크표적') or bpy.data.materials.new(name+'_베이크표적');target.use_nodes=True;target.node_tree.nodes.clear();low.data.materials.clear();low.data.materials.append(target)
for p in low.data.polygons:p.material_index=0
images={};bak=S.render.bake;bak.use_selected_to_active=True;bak.use_clear=True;bak.cage_extrusion=.065;bak.max_ray_distance=.3;bak.margin=12
for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
 im=bpy.data.images.new(name+'_스캔_'+kind,width=2048,height=2048,alpha=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color'
 if kind=='Normal':im.generated_color=(.5,.5,1,1)
 node=target.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;target.node_tree.nodes.active=node
 if kind in ['Curvature','BaseColor','Roughness','Metallic']:
  for m in materials:
   n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');em=n.new('ShaderNodeEmission');em.name='임시베이크'
   if kind=='Curvature':
    geom=n.new('ShaderNodeNewGeometry');geom.name='임시곡률';l.new(geom.outputs['Pointiness'],em.inputs[0])
   else:
    sock=bs.inputs['Base Color' if kind=='BaseColor' else kind]
    if sock.is_linked:l.new(sock.links[0].from_socket,em.inputs[0])
    elif kind=='BaseColor':em.inputs[0].default_value=sock.default_value
    else:em.inputs[0].default_value=(*([sock.default_value]*3),1)
   l.new(em.outputs[0],out.inputs['Surface'])
  typ='EMIT'
 else:typ='NORMAL' if kind=='Normal' else 'AO'
 select([high,low],low);S.cycles.samples=16 if kind=='AO' else 1;bpy.ops.object.bake(type=typ)
 im.filepath_raw=str(P/'Textures'/(name+'_'+kind+'.png'));im.file_format='PNG';im.save();images[kind]=im;target.node_tree.nodes.remove(node)
 for m in materials:
  n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs['Surface'])
  for x in list(n):
   if x.name.startswith('임시'):n.remove(x)
n=target.node_tree.nodes;l=target.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0]);tx=n.new('ShaderNodeTexImage');tx.image=images['BaseColor'];l.new(tx.outputs[0],bs.inputs['Base Color'])
for kind in ['Roughness','Metallic']:
 tx=n.new('ShaderNodeTexImage');tx.image=images[kind];l.new(tx.outputs[0],bs.inputs[kind])
tx=n.new('ShaderNodeTexImage');tx.image=images['Normal'];nm=n.new('ShaderNodeNormalMap');l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
select([low]);bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 if r['id']==name:
  r.update({'역할':'실물 스캔에서 재구성한 휜 부패고목·비대칭 뿌리','정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'베이크':'CC0 scan 124174 faces → decimate .065, normal/AO/curvature/PBR 2048 Cycles selected-to-active'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
(R/'고목-스캔전환.json').write_text(json.dumps({'원본':str(source),'원본SHA256':hashlib.sha256(source.read_bytes()).hexdigest(),'라이선스':'Poly Haven CC0','이전후보':'방사형 원뿔뿌리 FAIL, 단순 축소가 아니라 실물 스캔 조형으로 제작법 전환','정본':'I:/EXODUSER-Storage/demo-art/map/r2/import-manifest.json','편집':'원본 불변, 자기 소스에 append한 뒤 휜 체중선·적갈색 목질 재구성','삼각형':len(low.data.polygons)},ensure_ascii=False,indent=2),encoding='utf8')
for o in [high,low]:o.hide_render=True;o.hide_set(True)
bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/환경모듈_하이로우_베이크.blend'))
print('고목 실물 스캔 재작업 완료',len(low.data.polygons),flush=True)
