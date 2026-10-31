"""방사형 판근을 제거하고 공식 CC0 실물 뿌리 군락으로 큰 줄기·지면 접합을 재구성한다."""
import bpy,bmesh,math,json,sys,hashlib
from pathlib import Path
from mathutils import Vector,Matrix
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');BASE=R/'source/목질층전환전_97039f5a4';P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest';SRC=R/'pbr-source/root_cluster_01/root_cluster_01_2k.blend'
bpy.ops.wm.open_mainfile(filepath=str(BASE/'source/숲_베이크.blend'));S=bpy.context.scene;S.render.engine='CYCLES';S.render.threads_mode='FIXED';S.render.threads=10
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
def uv_original(o,backup=False):
 if o.data.uv_layers:o.data.uv_layers.active.name='원본UV'
 for i,m in enumerate(list(o.data.materials)):
  m=m.copy();o.data.materials[i]=m;n=m.node_tree.nodes;l=m.node_tree.links;uv=n.new('ShaderNodeUVMap');uv.uv_map='원본UV'
  for tx in n:
   if tx.type=='TEX_IMAGE' and tx.image:
    l.new(uv.outputs[0],tx.inputs['Vector'])
    if backup:
     name=Path(tx.image.filepath).name;dst=R/'source/근원베이크_불변입력'/name;dst.parent.mkdir(exist_ok=True)
     if tx.image.packed_file:dst.write_bytes(bytes(tx.image.packed_file.data))
     elif not dst.exists():dst.write_bytes(Path(bpy.path.abspath(tx.image.filepath)).read_bytes())
     # Image.copy()는 픽셀 캐시를 재사용한다. 보존 packed 바이트에서 새 이미지로 읽는다.
     old_space=tx.image.colorspace_settings.name
     tx.image=bpy.data.images.load(str(dst),check_existing=False);tx.image.colorspace_settings.name=old_space
   if tx.type=='NORMAL_MAP':tx.uv_map='원본UV'
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def remove_plate_roots(o):
 adj=[[] for v in o.data.vertices]
 for e in o.data.edges:a,b=e.vertices;adj[a].append(b);adj[b].append(a)
 todo_set=set(range(len(adj)));drop=set()
 while todo_set:
  a=todo_set.pop();group={a};todo=[a]
  while todo:
   for b in adj[todo.pop()]:
    if b in todo_set:todo_set.remove(b);group.add(b);todo.append(b)
  if max(o.data.vertices[i].co.z for i in group)<2.20:drop.update(group)
 bm=bmesh.new();bm.from_mesh(o.data);bm.verts.ensure_lookup_table();bmesh.ops.delete(bm,geom=[bm.verts[i] for i in drop],context='VERTS');bm.to_mesh(o.data);bm.free();o.data.update();print('구 방사형 판근/밑동 제거',o.name,len(drop),flush=True)
def make_root(scale):
 with bpy.data.libraries.load(str(SRC),link=False) as (a,b):b.objects=['root_cluster_01']
 o=b.objects[0];S.collection.objects.link(o);bpy.context.view_layer.update();vs=[o.matrix_world@v.co for v in o.data.vertices];zmin=min(v.z for v in vs);zmax=max(v.z for v in vs);upper=[v for v in vs if v.z>zmin+(zmax-zmin)*.88];anchor=sum(upper,Vector())/len(upper);lower=[v for v in vs if v.z<zmin+(zmax-zmin)*.18];center=sum(lower,Vector())/len(lower);heading=math.atan2(center.y-anchor.y,center.x-anchor.x);a=math.atan2(-.84,.54)-heading
 o.parent=None;o.matrix_world=Matrix.Identity(4)
 for v,p in zip(o.data.vertices,vs):v.co=p
 # 원래 스캔 뿌리·토양 연결을 보존하고 외곽 토양을 기준면 아래로 묻는다.
 # 분리법은 뿌리까지 찢어 FAIL이었으므로 사용하지 않는다.
 for v,p in zip(o.data.vertices,vs):v.co=p
 zmin=min(p.z for p in vs)
 for v,p in zip(o.data.vertices,vs):
  q=(p-Vector((anchor.x,anchor.y,zmin)))*scale;v.co=(q.x*math.cos(a)-q.y*math.sin(a),q.x*math.sin(a)+q.y*math.cos(a),q.z-.72)
 uv_original(o)
 for mat in o.data.materials:
  n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');old=bs.inputs['Base Color'].links[0].from_socket;mul=n.new('ShaderNodeMixRGB');mul.blend_type='MULTIPLY';mul.inputs[0].default_value=1;mul.inputs[2].default_value=(.50,.47,.39,1);l.new(old,mul.inputs[1]);l.new(mul.outputs[0],bs.inputs['Base Color'])
 return o
ids=['RF_Ancient_Rotten_Tree','RF_Fractured_Stump','RF_Gnarled_Split_Trunk','RF_Foreground_Roots'];rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));prepared=[]
for id,scale in zip(ids,[1.6,1.25,1.4,1.5]):
 old=bpy.data.objects.get(id+'_High')
 if old:bpy.data.objects.remove(old,do_unlink=True)
 body=bpy.data.objects[id];body.data=body.data.copy()
 if id!='RF_Foreground_Roots':remove_plate_roots(body);uv_original(body,True)
 else:bpy.data.objects.remove(body,do_unlink=True);body=None
 root=make_root(scale);highroot=root.copy();highroot.data=root.data.copy();S.collection.objects.link(highroot);highroot.name='근원하이_'+id;highroot.hide_render=True;highroot.hide_set(True)
 dec=root.modifiers.new('실물뿌리로우','DECIMATE');dec.ratio=.035;apply(root,dec)
 if body:
  highbody=body.copy();highbody.data=body.data.copy();S.collection.objects.link(highbody);select([highbody,highroot],highbody);bpy.ops.object.join();high=highbody;select([body,root],body);bpy.ops.object.join();low=body
 else:low=root;high=highroot
 low.name=id;high.name=id+'_High';low.hide_render=True;low.hide_set(True);high.hide_render=True;high.hide_set(True);prepared.append((id,low,high))
if '--bake' not in sys.argv:
 for o in list(S.objects):
  if o.type in ['LIGHT','CAMERA']:bpy.data.objects.remove(o,do_unlink=True)
 def aim(o,p):o.rotation_euler=(Vector(p)-o.location).to_track_quat('-Z','Y').to_euler()
 for name,pos,energy,color,size in [('차가운큰면광',(-8,-1,15),4200,(.57,.69,.83),11),('후경림광',(4,18,18),4200,(.56,.70,.90),10),('따뜻한미약보조',(7,-10,8),850,(.84,.65,.43),9)]:
  d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.color=color;d.shape='DISK';d.size=size;o=bpy.data.objects.new(name,d);S.collection.objects.link(o);o.location=pos;aim(o,(0,0,4))
 bpy.ops.object.camera_add();cam=bpy.context.object;cam.location=Vector((9,-13,math.hypot(9,13)*math.tan(math.radians(52))))+Vector((0,0,4));aim(cam,(0,0,4));cam.data.type='ORTHO';cam.data.ortho_scale=19;S.camera=cam
 bpy.ops.mesh.primitive_plane_add(size=160);o=bpy.context.object;m=bpy.data.materials.new('중립검수바닥');m.diffuse_color=(.055,.063,.075,1);o.data.materials.append(m)
 low=prepared[0][1];low.hide_set(False);low.hide_render=False;S.cycles.samples=32;S.cycles.use_denoising=True;S.render.resolution_x=1600;S.render.resolution_y=1000;S.render.resolution_percentage=100;S.view_settings.view_transform='AgX';S.view_settings.exposure=.3;S.render.filepath=str(R/'compare/실물뿌리군락_형태시험.png');bpy.ops.render.render(write_still=True);bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/실물뿌리군락_형태시험.blend'));print('실물 뿌리 군락 형태 시험. 기존 납품 무변경',flush=True);sys.exit(0)
for id,low,high in prepared:
 print('실물 뿌리 접합 베이크 시작',id,flush=True);select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri);bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 unused=[v for v in bm.verts if not v.link_faces]
 if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
 bm.to_mesh(low.data);bm.free();low.data.update();uv=low.data.uv_layers.new(name='UVMap');low.data.uv_layers.active_index=low.data.uv_layers.find('UVMap')
 for u in low.data.uv_layers:u.active_render=u.name=='UVMap'
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.1,island_margin=.008);bpy.ops.object.mode_set(mode='OBJECT')
 materials=list(high.data.materials);target=bpy.data.materials.new(id+'_근원베이크');target.use_nodes=True;low.data.materials.clear();low.data.materials.append(target)
 for f in low.data.polygons:f.material_index=0
 ims={};paths={};S.render.bake.use_selected_to_active=True;S.render.bake.cage_extrusion=.055;S.render.bake.max_ray_distance=.18;S.render.bake.margin=12
 for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
  im=bpy.data.images.new(id+'_실물뿌리_'+kind,width=2048,height=2048,alpha=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color'
  if kind=='Normal':im.generated_color=(.5,.5,1,1)
  tx=target.node_tree.nodes.new('ShaderNodeTexImage');tx.image=im;target.node_tree.nodes.active=tx
  if kind not in ['Normal','AO']:
   for m in materials:
    n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');em=n.new('ShaderNodeEmission');em.name='임시근원'
    if kind=='Curvature':ge=n.new('ShaderNodeNewGeometry');ge.name='임시곡률';l.new(ge.outputs['Pointiness'],em.inputs[0])
    else:
     so=bs.inputs['Base Color' if kind=='BaseColor' else kind]
     if so.is_linked:l.new(so.links[0].from_socket,em.inputs[0])
     elif kind=='BaseColor':em.inputs[0].default_value=so.default_value
     else:em.inputs[0].default_value=(*([so.default_value]*3),1)
    l.new(em.outputs[0],out.inputs[0])
  select([high,low],low);low.hide_render=False;high.hide_render=False;S.cycles.samples=12 if kind=='AO' else 1;bpy.ops.object.bake(type='NORMAL' if kind=='Normal' else 'AO' if kind=='AO' else 'EMIT');im.filepath_raw=str(P/'Textures'/(id+'_'+kind+'.png'));im.file_format='PNG';im.save();ims[kind]=im;paths[kind]=str((P/'Textures'/(id+'_'+kind+'.png')).relative_to(R));target.node_tree.nodes.remove(tx)
  for m in materials:
   n=m.node_tree.nodes;l=m.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');out=next(x for x in n if x.type=='OUTPUT_MATERIAL');l.new(bs.outputs[0],out.inputs[0])
   for x in list(n):
    if x.name.startswith('임시'):n.remove(x)
  print(id,kind,'완료',flush=True)
 n=target.node_tree.nodes;l=target.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0])
 for kind,socket in [('BaseColor','Base Color'),('Roughness','Roughness'),('Metallic','Metallic')]:tx=n.new('ShaderNodeTexImage');tx.image=ims[kind];l.new(tx.outputs[0],bs.inputs[socket])
 tx=n.new('ShaderNodeTexImage');tx.image=ims['Normal'];nm=n.new('ShaderNodeNormalMap');nm.inputs['Strength'].default_value=.5;l.new(tx.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
 for u in list(low.data.uv_layers):
  if u.name!='UVMap':low.data.uv_layers.remove(u)
 low.hide_render=True;low.hide_set(True);high.hide_render=True;high.hide_set(True)
 for row in rows:
  if row['id']==id:row.update({'역할':('큰 속빈 줄기 보존·CC0 실제 얽힌 뿌리 접합' if id=='RF_Ancient_Rotten_Tree' else 'CC0 실제 뿌리 군락·부패 목질과 지면 연결'),'정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'텍스처해상도':2048,'범위XYZ최소최대':[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)],'텍스처':paths,'베이크':'기존 큰 줄기 UV 보존+Poly Haven Root Cluster01 high→low normal/AO/curvature/PBR 2048; 원본 MD5/SHA 일치'})
 (R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/숲_베이크.blend'));print('구 판근 제거·실물 뿌리 접합4종 베이크 완료',flush=True)
