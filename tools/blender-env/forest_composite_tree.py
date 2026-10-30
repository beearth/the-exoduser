import bpy,bmesh,math,json,hashlib,shutil
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');OLD=Path('I:/EXODUSER-Storage/demo-art/blender-env');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';id='RF_Ancient_Rotten_Tree'
bpy.ops.wm.open_mainfile(filepath=str(R/'source/숲_베이크.blend'));S=bpy.context.scene;S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
for suffix in ['', '_High']:
 o=bpy.data.objects.get(id+suffix)
 if o:bpy.data.objects.remove(o,do_unlink=True)
m=bpy.data.materials.get(id+'_베이크표적')
if m:bpy.data.materials.remove(m,do_unlink=True)
with bpy.data.libraries.load(str(OLD/'source/환경모듈_최종.blend'),link=False) as (src,dst):dst.objects=['HE_Deadwood_Hollow']
scan=dst.objects[0];scanmat=scan.data.materials[0].copy();scanmat.name='거목_실물목질원본'
# 기존 스캔의 원 UV는 보존하고 명시적으로 읽는다. 새 베이크 UV와 혼용하지 않음.
un=scanmat.node_tree.nodes.new('ShaderNodeUVMap');un.uv_map='원본UV'
for n in scanmat.node_tree.nodes:
 if n.type=='TEX_IMAGE':scanmat.node_tree.links.new(un.outputs['UV'],n.inputs['Vector'])
 if n.type=='NORMAL_MAP':n.uv_map='원본UV'
with bpy.data.libraries.load(str(R/'source/숲_형태.blend'),link=False) as (src,dst):dst.objects=['RF_Ancient_Rotten_Tree']
proc=dst.objects[0];proc.name='TMP_윗가지원본';bark=proc.data.materials[0].copy();bark.name='거목_윗가지수피원본'
vs=[];faces=[];uvsrc=[];mi=[];sm=[]
# 부패 밑동·찢긴 스캔 목질. 실제 원본은 읽기만 한다.
for v in scan.data.vertices:vs.append(tuple(v.co*1.15))
for f in scan.data.polygons:
 faces.append(tuple(f.vertices));uvsrc.extend([tuple(scan.data.uv_layers.active.data[l].uv) for l in f.loop_indices]);mi.append(0);sm.append(f.use_smooth)
# 절차식 후보의 큰 줄기/가지 중 하부 스캔 파편139성분은 제외한다.
adj={v.index:set() for v in proc.data.vertices}
for e in proc.data.edges:a,b=e.vertices;adj[a].add(b);adj[b].add(a)
left=set(adj);keep=set()
while left:
 a=left.pop();g={a};todo=[a]
 while todo:
  for b in adj[todo.pop()]:
   if b in left:left.remove(b);g.add(b);todo.append(b)
 if max(proc.data.vertices[i].co.z for i in g)>1.4:keep.update(g)
lookup={}
for i in sorted(keep):lookup[i]=len(vs);vs.append(tuple(proc.data.vertices[i].co))
for f in proc.data.polygons:
 if all(i in keep for i in f.vertices):faces.append(tuple(lookup[i] for i in f.vertices));uvsrc.extend([(0,0)]*len(f.vertices));mi.append(1);sm.append(f.use_smooth)
me=bpy.data.meshes.new(id+'_깨끗한합성');me.from_pydata(vs,[],faces);me.update();assert not me.validate(verbose=True)
me.materials.append(scanmat);me.materials.append(bark);sourceuv=me.uv_layers.new(name='원본UV')
for i,uv in enumerate(uvsrc):sourceuv.data[i].uv=uv
for i,f in enumerate(me.polygons):f.material_index=mi[i];f.use_smooth=sm[i]
low=bpy.data.objects.new(id,me);S.collection.objects.link(low);uv=me.uv_layers.new(name='UVMap');me.uv_layers.active_index=1;uv.active_render=True;sourceuv.active_render=False
bpy.ops.object.select_all(action='DESELECT');low.select_set(True);bpy.context.view_layer.objects.active=low
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.1,island_margin=.006);bpy.ops.object.mode_set(mode='OBJECT')
tri=low.modifiers.new('고정삼각화','TRIANGULATE');bpy.ops.object.modifier_apply(modifier=tri.name)
bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
orphans=[v for v in bm.verts if not v.link_faces]
if orphans:bmesh.ops.delete(bm,geom=orphans,context='VERTS')
bm.to_mesh(low.data);bm.free();low.data.update()
low.data.uv_layers.active_index=low.data.uv_layers.find('UVMap');low.data.uv_layers['UVMap'].active_render=True;low.data.uv_layers['원본UV'].active_render=False
high=low.copy();high.data=low.data.copy();high.name=id+'_High';S.collection.objects.link(high);bpy.ops.object.select_all(action='DESELECT');high.select_set(True);bpy.context.view_layer.objects.active=high;sub=high.modifiers.new('원목세부보존_하이','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;bpy.ops.object.modifier_apply(modifier=sub.name)
images={};size=4096;S.render.bake.use_selected_to_active=False;S.render.bake.use_clear=True;S.render.bake.margin=16
for kind in ['Normal','BaseColor','AO','Curvature','Roughness','Metallic']:
 active=low if kind=='Normal' else high;low.hide_render=active!=low;high.hide_render=active!=high;active.hide_set(False);bpy.ops.object.select_all(action='DESELECT');active.select_set(True);bpy.context.view_layer.objects.active=active
 im=bpy.data.images.new(id+'_합성_'+kind,width=size,height=size,alpha=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color';targets=[]
 for mat in [scanmat,bark]:
  n=mat.node_tree.nodes;l=mat.node_tree.links;tx=n.new('ShaderNodeTexImage');tx.image=im;n.active=tx;targets.append((mat,tx));bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL')
  if kind not in ['Normal','AO']:
   em=n.new('ShaderNodeEmission');em.name='임시합성'
   if kind=='Curvature':
    g=n.new('ShaderNodeNewGeometry');g.name='임시곡률';l.new(g.outputs['Pointiness'],em.inputs[0])
   else:
    socket=bs.inputs['Base Color' if kind=='BaseColor' else kind]
    if socket.is_linked:l.new(socket.links[0].from_socket,em.inputs[0])
    elif kind=='BaseColor':em.inputs[0].default_value=socket.default_value
    else:em.inputs[0].default_value=(*([socket.default_value]*3),1)
   l.new(em.outputs[0],out.inputs[0])
 S.cycles.samples=16 if kind=='AO' else 1;bpy.ops.object.bake(type='NORMAL' if kind=='Normal' else 'AO' if kind=='AO' else 'EMIT');im.filepath_raw=str(P/'Textures'/(id+'_'+kind+'.png'));im.file_format='PNG';im.save();images[kind]=im
 for mat,node in targets:
  n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs[0]);n.remove(node)
  for x in list(n):
   if x.name.startswith('임시'):n.remove(x)
 print('거목 합성 맵',kind,flush=True)
mat=bpy.data.materials.new(id+'_베이크표적');mat.use_nodes=True;n=mat.node_tree.nodes;l=mat.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0])
for kind,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:tx=n.new('ShaderNodeTexImage');tx.image=images[kind];l.new(tx.outputs[0],bs.inputs[socket])
tx=n.new('ShaderNodeTexImage');tx.image=images['Normal'];nm=n.new('ShaderNodeNormalMap');nm.uv_map='UVMap';nm.inputs['Strength'].default_value=.7;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
low.data.materials.clear();low.data.materials.append(mat)
for f in low.data.polygons:f.material_index=0
for u in list(low.data.uv_layers):
 if u.name!='UVMap':low.data.uv_layers.remove(u)
assert len(low.data.uv_layers)==1 and low.data.uv_layers[0].name=='UVMap'
bpy.ops.object.select_all(action='DESELECT');high.hide_render=True;low.hide_render=False;low.hide_set(False);low.select_set(True);bpy.context.view_layer.objects.active=low
bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
shutil.copy2(P/'Textures'/(id+'_BaseColor.png'),R/'source/최종원베이크'/(id+'_BaseColor.png'))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'))
for r in rows:
 if r['id']==id:r.update({'역할':'썩은 거목·실물 스캔 밑동과 비대칭 큰 가지 합성·드러난 찢긴 목질','정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'텍스처해상도':4096,'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'검증기존베이크재사용':True,'베이크':'기존 CC0 하이 베이크 목질+새 큰 가지. 원본UV를 보존하고 공통 새 UV 4096에 재베이크. Normal은 로우 MikkT 기저, 나머지는 하이 입력. 원본 스캔/UV 변경0'})
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'거목-스캔합성.json').write_text(json.dumps({'원본':str(OLD/'source/환경모듈_최종.blend'),'원본SHA256':hashlib.sha256((OLD/'source/환경모듈_최종.blend').read_bytes()).hexdigest(),'방법':'기존 실물 스캔 밑동과 큰 가지 합성, 원본UV 보존 후 새UV 재베이크','대상4096':True,'노멀기저':'최종 로우 UVMap·MikkT','원본변경':0},ensure_ascii=False,indent=2),encoding='utf8')
for o in [low,high]:o.hide_render=True;o.hide_set(True)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('거목 실물 합성 완료',flush=True)
