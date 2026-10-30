import bpy,bmesh,math,json,shutil
from pathlib import Path
from mathutils import Vector
ROOT=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');OUT=ROOT/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest'
history=ROOT/'source/이끼강바닥_변경전';history.mkdir(exist_ok=True)
for id in ['RF_Hanging_Moss','RF_Riverbed','RF_Broken_Stone_Bridge','RF_Fungal_Colony','RF_Corroded_Riverbank','RF_Foam_Bank']:
 for f in (OUT/'Textures').glob(id+'*.png'):
  if not (history/f.name).exists():shutil.copy2(f,history/f.name)
bpy.ops.wm.open_mainfile(filepath=str(ROOT/'source/숲_베이크.blend'));S=bpy.context.scene;S.cycles.samples=1;S.render.threads_mode='FIXED';S.render.threads=10
for o in S.objects:
 if o.type=='MESH':o.hide_render=True;o.hide_set(True)
def select(obs,active=None):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.hide_set(False);o.select_set(True)
 bpy.context.view_layer.objects.active=active or obs[-1]
def apply(o,m):select([o]);bpy.ops.object.modifier_apply(modifier=m.name)
for name in ['RF_Hanging_Moss','RF_Riverbed','RF_Broken_Stone_Bridge','RF_Fungal_Colony','RF_Corroded_Riverbank','RF_Foam_Bank']:
 for suffix in ['', '_High']:
  o=bpy.data.objects.get(name+suffix)
  if o:bpy.data.objects.remove(o,do_unlink=True)
 m=bpy.data.materials.get(name+'_베이크표적')
 if m:bpy.data.materials.remove(m,do_unlink=True)
# 각진 천 조각은 폐기하고 굵기가 변하는 섬유 다발로 제작법 전환.
mat=bpy.data.materials.get('늘어진죽은이끼');n=mat.node_tree.nodes;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED')
for x in n:
 if x.type=='MIX_RGB':x.inputs[0].default_value=.9;x.inputs[2].default_value=(.17,.205,.09,1)
 if x.type=='BUMP':x.inputs['Strength'].default_value=.035
vs=[];faces=[]
def cord(pts,rs,sides=6):
 base=len(vs)
 for k,p in enumerate(pts):
  p=Vector(p);d=Vector(pts[min(k+1,len(pts)-1)])-Vector(pts[max(0,k-1)]);d.normalize();ref=Vector((1,0,0)) if abs(d.z)>.8 else Vector((0,0,1));u=d.cross(ref).normalized();v=d.cross(u).normalized()
  for j in range(sides):a=j*math.tau/sides;vs.append(tuple(p+rs[k]*(math.cos(a)*u+math.sin(a)*v)))
 for k in range(len(pts)-1):
  for j in range(sides):a=base+k*sides+j;b=base+k*sides+(j+1)%sides;faces.append((a,b,b+sides,a+sides))
 faces.append(tuple(base+j for j in reversed(range(sides))));faces.append(tuple(base+(len(pts)-1)*sides+j for j in range(sides)))
for j in range(30):
 x=-1.4+j*.096;L=1.0+.95*(.5+.5*math.sin(j*1.73));pts=[];r=[]
 for k in range(10):
  t=k/9;pts.append((x+.10*math.sin(j+t*5),.12*math.cos(j*.73+t*4),2.55-L*t));r.append((.024+.012*(j%3))*(1-t*.88))
 cord(pts,r)
 if j%2==0:
  q=pts[4];cord([q,(q[0]+.18,q[1]+.08,q[2]-.18),(q[0]+.12,q[1]-.03,q[2]-.55)],[r[4]*.7,.017,.003],5)
# 윗부분은 가로로 붙는 섬유 매듭. 바처럼 보이는 두꺼운 가지는 포함하지 않는다.
cord([(-1.5,0,2.55),(-.7,.03,2.64),(.1,-.02,2.6),(.9,.02,2.62),(1.5,0,2.51)],[.06,.075,.06,.055,.025],8)
me=bpy.data.meshes.new('이끼섬유_불규칙다발');me.from_pydata(vs,[],faces);me.update();me.materials.append(mat);moss=bpy.data.objects.new('RF_Hanging_Moss',me);S.collection.objects.link(moss)
for f in me.polygons:f.use_smooth=True
# 강바닥 장축 양끝을 같은 함수값으로 수정. 원래 sin(1.4*x)는 양끝 높이가 달랐다.
with bpy.data.libraries.load(str(ROOT/'source/숲_형태.blend'),link=False) as (src,dst):dst.objects=['RF_Riverbed']
bed=dst.objects[0];S.collection.objects.link(bed);bed.name='RF_Riverbed';bed.hide_set(False)
for v in bed.data.vertices:
 x,y,z=v.co
 if abs(z-(-.9+.56*(abs(y)/3)**1.7+.06*math.sin(x*1.4)*math.cos(y*.8)))<.0001:v.co.z=-.9+.56*(abs(y)/3)**1.7+.06*math.cos(x*math.tau/10)*math.cos(y*.8)

# A2 수신 후: 포장석 위로 솟던 아치 천장을 낮추고 상판을 실제 아치 위에 얹는다.
with bpy.data.libraries.load(str(ROOT/'source/숲_형태.blend'),link=False) as (src,dst):dst.objects=['RF_Broken_Stone_Bridge']
bridge=dst.objects[0];S.collection.objects.link(bridge);bridge.name='RF_Broken_Stone_Bridge';bridge.hide_set(False)
adj={v.index:set() for v in bridge.data.vertices}
for edge in bridge.data.edges:a,b=edge.vertices;adj[a].add(b);adj[b].add(a)
left=set(adj)
while left:
 a=left.pop();group={a};todo=[a]
 while todo:
  for b in adj[todo.pop()]:
   if b in left:left.remove(b);group.add(b);todo.append(b)
 verts=[bridge.data.vertices[i] for i in group];mn=[min(v.co[k] for v in verts) for k in range(3)];mx=[max(v.co[k] for v in verts) for k in range(3)];c=[(a+b)*.5 for a,b in zip(mn,mx)];dim=[b-a for a,b in zip(mn,mx)]
 if len(verts)==8 and all(abs(abs(v.co.y)-1.55)<.001 for v in verts):
  for v in verts:v.co.x*=.88;v.co.z=-2.1+(v.co.z+2.1)*.88
 elif dim[0]<.8 and dim[1]<1.25 and dim[2]<.45:
  old=.56+.2*math.cos(c[0]*.4);new=.58+.53*max(0,math.cos(c[0]*math.pi/7.4))**2
  for v in verts:v.co.z+=new-old
 elif dim[0]<.8 and dim[1]<.6 and dim[2]>.45:
  old=.56+.2*math.cos(c[0]*.4);new=.58+.53*max(0,math.cos(c[0]*math.pi/7.4))**2
  for v in verts:v.co.z+=new-old

with bpy.data.libraries.load(str(ROOT/'source/숲_형태.blend'),link=False) as (src,dst):dst.objects=['RF_Fungal_Colony','RF_Corroded_Riverbank','RF_Foam_Bank']
colony,bank,bubbles=dst.objects
for o,name in zip(dst.objects,['RF_Fungal_Colony','RF_Corroded_Riverbank','RF_Foam_Bank']):S.collection.objects.link(o);o.name=name;o.hide_set(False)
# 부후균의 갈색 갓과 크림색 밑면을 실제 면에 분리한다.
for nm,col in [('부후균_갈색갓',(.25,.145,.065,1)),('부후균_크림밑면',(.57,.47,.29,1))]:
 m=bpy.data.materials.new(nm);m.use_nodes=True;bs=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=col;bs.inputs['Roughness'].default_value=.86
colony.data.materials.clear();colony.data.materials.append(bpy.data.materials['부후균_갈색갓']);colony.data.materials.append(bpy.data.materials['부후균_크림밑면'])
for f in colony.data.polygons:f.material_index=1 if f.normal.z<-.12 else 0
for v in colony.data.vertices:v.co.x+=.035*math.sin(v.co.y*5+v.co.z*4)
# 강가 하부의 부식/침전은 위치에 따른 넓은 올리브 오염. 점 노이즈 없음.
for mat in bank.data.materials:
 if not mat or '암반' not in mat.name:continue
 n=mat.node_tree.nodes;l=mat.node_tree.links;bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');old=bs.inputs['Base Color'].links[0].from_socket
 geom=n.new('ShaderNodeNewGeometry');sep=n.new('ShaderNodeSeparateXYZ');l.new(geom.outputs['Position'],sep.inputs[0]);rg=n.new('ShaderNodeMapRange');rg.inputs['From Min'].default_value=-.7;rg.inputs['From Max'].default_value=.65;rg.inputs['To Min'].default_value=.65;rg.inputs['To Max'].default_value=0;rg.clamp=True;l.new(sep.outputs['Z'],rg.inputs['Value']);mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';l.new(rg.outputs[0],mix.inputs[0]);l.new(old,mix.inputs[1]);mix.inputs[2].default_value=(.31,.38,.12,1);l.new(mix.outputs[0],bs.inputs['Base Color'])
# 진주 목걸이 같은 독립 구슬 대신 강가에 붙는 연속된 낮은 거품막으로 합친다.
for v in bubbles.data.vertices:v.co.x*=.84;v.co.y*=1.5
select([bubbles]);rm=bubbles.modifiers.new('거품막연결','REMESH');rm.mode='VOXEL';rm.voxel_size=.025;apply(bubbles,rm);sm=bubbles.modifiers.new('거품막곡면','SMOOTH');sm.factor=.8;sm.iterations=3;apply(bubbles,sm);dc=bubbles.modifiers.new('거품막감면','DECIMATE');dc.ratio=.28;apply(bubbles,dc)
for f in bubbles.data.polygons:f.use_smooth=True
for m in bubbles.data.materials:
 bs=next(x for x in m.node_tree.nodes if x.type=='BSDF_PRINCIPLED');bs.inputs['Base Color'].default_value=(.29,.32,.16,1);bs.inputs['Roughness'].default_value=.7
records=[{'id':'RF_Hanging_Moss','역할':'늘어진 불규칙 이끼 섬유 다발·30줄기와15분기, 정적 메시'},{'id':'RF_Riverbed','역할':'10×6m 강바닥 형태, 장축 양끝 동일·중앙 수심. 시각 메시, 충돌 별도'},{'id':'RF_Broken_Stone_Bridge','역할':'A2용 낮은 아치 돌다리·상판과 하부 구조 분리·무너진 난간'},{'id':'RF_Fungal_Colony','역할':'갈색 갓·크림 밑면의 목재 부후균과 균사'},{'id':'RF_Corroded_Riverbank','역할':'독액 강가 부식 암반·하부 올리브 오염·노출 뿌리'},{'id':'RF_Foam_Bank','역할':'강가에 붙이는 낮은 연속 거품막·정적 메시'}];allmods=[moss,bed,bridge,colony,bank,bubbles]
# 원본 킷: 모든 고해상도 베이크 입력은 따로 보존, 런타임 FBX는 로우만.
for o in allmods:o.hide_render=True;o.hide_set(True)
manifest=[r for r in json.loads((ROOT/'source/모듈명세.json').read_text(encoding='utf8')) if r['id'] not in {v['id'] for v in records}]
previous=[]
changed=set()
complete={r['id'] for r in previous if r['id'] not in changed}
for idx,low in enumerate(allmods):
 print('모듈 베이크 시작',idx,low.name,flush=True)
 low.hide_render=False;low.hide_set(False)
 # 겹친 UV 선택 속성/custom normal을 편집모드에 넘기지 않는다. 기하·재질·평활은 동일 byte 좌표로 보존.
 old=low.data;clean=bpy.data.meshes.new(low.name+'_베이크용기하');clean.from_pydata([tuple(v.co) for v in old.vertices],[],[tuple(f.vertices) for f in old.polygons]);clean.update()
 for m in old.materials:clean.materials.append(m)
 for dst,src in zip(clean.polygons,old.polygons):dst.material_index=src.material_index;dst.use_smooth=src.use_smooth
 assert len(clean.vertices)==len(old.vertices) and len(clean.polygons)==len(old.polygons)
 assert not clean.validate(verbose=True),'입력 기하 오류'
 low.data=clean
 select([low]);bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.05,island_margin=.025);bpy.ops.object.mode_set(mode='OBJECT')
 high=low.copy();high.data=low.data.copy();S.collection.objects.link(high);high.name=low.name+'_High'
 # 실루엣 유지용 SIMPLE 세분화와 낮은 주파수 조형. 고주파 점무늬를 만들지 않는다.
 sub=high.modifiers.new('하이폴리세분화','SUBSURF');sub.subdivision_type='SIMPLE';sub.levels=2;apply(high,sub)
 # 작은 베벨이 뒤집히는 정점 변위는 사용하지 않는다. 넓은 조형은 실제 로우 메시,
 # 하이폴리의 미세 표면은 CC0 범프로 만든 뒤 노멀에 투영한다.
 # 하이폴리 법선은 실물 조형·CC0 범프를 포함. 커브/모서리 베이크는 각 메시에서 실제 실행.
 select([low]);tri=low.modifiers.new('고정삼각화','TRIANGULATE');apply(low,tri)
 bm=bmesh.new();bm.from_mesh(low.data);bad=[f for f in bm.faces if f.calc_area()<1e-9]
 if bad:bmesh.ops.delete(bm,geom=bad,context='FACES')
 unused=[v for v in bm.verts if not v.link_faces]
 if unused:bmesh.ops.delete(bm,geom=unused,context='VERTS')
 bm.to_mesh(low.data);bm.free();low.data.update()
 original_mats=list(high.data.materials)
 target=bpy.data.materials.new(low.name+'_베이크표적');target.use_nodes=True
 low.data.materials.clear();low.data.materials.append(target)
 for p in low.data.polygons:p.material_index=0
 size=2048 if low.name in ['RF_Broken_Stone_Bridge','RF_Corroded_Riverbank'] else 1024
 texpaths={};images={}
 bak=S.render.bake;bak.use_selected_to_active=True;bak.cage_extrusion=.025;bak.max_ray_distance=.065;bak.margin=12
 for kind in ['Normal','AO','Curvature','BaseColor','Roughness','Metallic']:
  path=OUT/'Textures'/(low.name+'_'+kind+'.png')
  if low.name in complete and path.exists():
   im=bpy.data.images.load(str(path),check_existing=False);im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color';images[kind]=im;texpaths[kind]=str(path.relative_to(ROOT));continue
  im=bpy.data.images.new(low.name+'_'+kind,width=size,height=size,alpha=False)
  im.colorspace_settings.name='sRGB' if kind=='BaseColor' else 'Non-Color'
  if kind=='Normal':im.generated_color=(.5,.5,1,1)
  node=target.node_tree.nodes.new('ShaderNodeTexImage');node.image=im;target.node_tree.nodes.active=node
  # 모든 출력은 같은 UV와 하이→로우 투영을 사용한다.
  if kind in ['BaseColor','Roughness','Metallic','Curvature']:
   for m in original_mats:
    n=m.node_tree.nodes;l=m.node_tree.links;out=next(x for x in n if x.type=='OUTPUT_MATERIAL');bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');em=n.new('ShaderNodeEmission');em.name='임시베이크'
    if kind=='Curvature':
     geom=n.new('ShaderNodeNewGeometry');geom.name='임시곡률';l.new(geom.outputs['Pointiness'],em.inputs['Color'])
    else:
     socket=bs.inputs['Base Color' if kind=='BaseColor' else kind]
     if socket.is_linked:l.new(socket.links[0].from_socket,em.inputs['Color'])
     elif kind=='BaseColor':em.inputs['Color'].default_value=socket.default_value
     else:em.inputs['Color'].default_value=(*([socket.default_value]*3),1)
    l.new(em.outputs[0],out.inputs['Surface'])
   typ='EMIT'
  else:typ='NORMAL' if kind=='Normal' else 'AO'
  select([high,low],low);S.cycles.samples=16 if kind=='AO' else 1
  bpy.ops.object.bake(type=typ)
  path=OUT/'Textures'/(low.name+'_'+kind+'.png');im.filepath_raw=str(path);im.file_format='PNG';im.save();images[kind]=im;texpaths[kind]=str(path.relative_to(ROOT))
  for m in original_mats:
   n=m.node_tree.nodes;l=m.node_tree.links;out=next(x for x in n if x.type=='OUTPUT_MATERIAL');bs=next(x for x in n if x.type=='BSDF_PRINCIPLED');l.new(bs.outputs[0],out.inputs['Surface'])
   for x in list(n):
    if x.name.startswith('임시'):n.remove(x)
  target.node_tree.nodes.remove(node)
 # 렌더는 베이크된 PBR만 사용한다. 원본 좌표와 절차식 재질 의존 없음.
 n=target.node_tree.nodes;l=target.node_tree.links;n.clear();out=n.new('ShaderNodeOutputMaterial');bs=n.new('ShaderNodeBsdfPrincipled');l.new(bs.outputs[0],out.inputs[0])
 col=n.new('ShaderNodeTexImage');col.image=images['BaseColor']
 ao=n.new('ShaderNodeTexImage');ao.image=images['AO'];mult=n.new('ShaderNodeMixRGB');mult.blend_type='MULTIPLY';mult.inputs[0].default_value=.55;l.new(col.outputs[0],mult.inputs[1]);l.new(ao.outputs[0],mult.inputs[2]);l.new(mult.outputs[0],bs.inputs['Base Color'])
 normal=n.new('ShaderNodeTexImage');normal.image=images['Normal'];nm=n.new('ShaderNodeNormalMap');l.new(normal.outputs[0],nm.inputs['Color']);l.new(nm.outputs[0],bs.inputs['Normal'])
 for kind in ['Roughness','Metallic']:
  tx=n.new('ShaderNodeTexImage');tx.image=images[kind];l.new(tx.outputs[0],bs.inputs[kind])
 high.hide_render=True;high.hide_set(True)
 select([low]);bpy.ops.export_scene.fbx(filepath=str(OUT/'Models'/(low.name+'.fbx')),use_selection=True,object_types={'MESH'},apply_unit_scale=True,axis_forward='-Z',axis_up='Y',use_mesh_modifiers=True,bake_anim=False,path_mode='STRIP',add_leaf_bones=False)
 bounds=[min(v.co[k] for v in low.data.vertices) for k in range(3)]+[max(v.co[k] for v in low.data.vertices) for k in range(3)]
 manifest.append({**records[idx],'정점':len(low.data.vertices),'삼각형':len(low.data.polygons),'하이폴리면':len(high.data.polygons),'텍스처해상도':size,'범위XYZ최소최대':bounds,'텍스처':texpaths,'베이크':'Blender Cycles CPU selected-to-active, normal/AO/pointiness/basecolor/roughness/metallic'})
 low.hide_render=True;low.hide_set(True)
 (ROOT/'source/모듈명세.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf8')
 print('모듈 완료',low.name,flush=True)



for o in allmods:o.hide_render=True;o.hide_set(True)
assert len(manifest)==11 and len({r['id'] for r in manifest})==11,'최종11종 명세 누락'
assert all(bpy.data.objects.get(r['id']+'_High') for r in manifest),'하이폴리 누락'
for im in bpy.data.images:
 if im.source=='FILE':im.filepath=bpy.path.abspath(im.filepath)
bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(ROOT/'source/숲_베이크.blend'))
for id in ['RF_Hanging_Moss','RF_Riverbed','RF_Broken_Stone_Bridge','RF_Fungal_Colony','RF_Corroded_Riverbank','RF_Foam_Bank']:shutil.copy2(OUT/'Textures'/(id+'_BaseColor.png'),ROOT/'source/최종원베이크'/(id+'_BaseColor.png'))
print('이끼 형태 재작업·강바닥 접합 재베이크 완료',flush=True)
