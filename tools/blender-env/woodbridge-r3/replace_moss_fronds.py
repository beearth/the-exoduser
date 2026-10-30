"""천막형 코어를 폐기하고 원본 비례 CC0 미세 잎을 곡선 다발로 엮는다."""
import bpy,json,math,shutil
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));oldpic=R/'renders/RF3_Hanging_Moss.png'
if oldpic.exists():shutil.copyfile(oldpic,R/'renders/FAIL_이끼천막형_1600.png')
id='RF3_Hanging_Moss';o=bpy.data.objects[id];old=o.data;vs=[];fs=[];uvs=[]
for stem in range(18):
 bx=(stem/17-.5)*1.35+.06*math.sin(stem*1.6);by=.24*math.sin(stem*2.4);L=1.12+.62*(.5+.5*math.sin(stem*1.7));top=2.3+.12*math.sin(stem*2.0)
 for level in range(20):
  t=level/19;cx=bx+.10*math.sin(t*4+stem)*t;cy=by+.075*math.sin(t*5+stem*.7)*t;cz=top-L*t
  for side in range(3):
   src=bpy.data.objects[['moss_01_tall_a_LOD0','moss_01_tall_b_LOD0'][(stem+level+side)%2]].data;mn=Vector([min(v.co[k]for v in src.vertices)for k in range(3)]);mx=Vector([max(v.co[k]for v in src.vertices)for k in range(3)]);height=.085+.045*(.5+.5*math.sin(stem+level*1.7+side));scale=height/(mx.z-mn.z);a=stem*1.3+level*.7+side*math.tau/3;rx=.022*math.cos(a);ry=.022*math.sin(a);base=len(vs)
   for v in src.vertices:
    x=(v.co.x-(mn.x+mx.x)*.5)*scale;y=(v.co.y-(mn.y+mx.y)*.5)*scale;z=(v.co.z-mn.z)*scale;vs.append((cx+rx+x*math.cos(a)-y*math.sin(a),cy+ry+x*math.sin(a)+y*math.cos(a),cz-z))
   for f in src.polygons:fs.append(tuple(base+i for i in f.vertices));uvs.extend(tuple(src.uv_layers.active.data[k].uv)for k in f.loop_indices)
me=bpy.data.meshes.new('CC0_원본비례_이끼1080');me.from_pydata(vs,[],fs);me.update();uv=me.uv_layers.new(name='UVMap')
for q,v in zip(uv.data,uvs):q.uv=v
mat=old.materials[0];me.materials.append(mat)
for f in me.polygons:f.use_smooth=True
o.data=me
for q in S.objects:
 if q.data==old:q.data=me
for id in ['RF3_Hanging_Moss','RF3_Moss_Cushion']:
 q=bpy.data.objects[id];r=next(r for r in rows if r['id']==id);oldmaps=r['맵'].copy();ims={}
 for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
  im=bpy.data.images.load(str(P/'Textures'/('Atlas_moss_01_'+k+'.png')),check_existing=False);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
 if id=='RF3_Moss_Cushion':
  for u in q.data.uv_layers.active.data:u.uv.x*=2
 for m in q.data.materials:
  for n in m.node_tree.nodes:
   if n.type=='TEX_IMAGE'and n.image:
    name=Path(n.image.filepath).name
    for k,p in oldmaps.items():
     if name==p and k in ims:n.image=ims[k]
 r['맵']={k:Path(im.filepath).name for k,im in ims.items()};r['텍스처규격']=[2048,2048];r['텍스처해상도']=2048;r['high']=None;r['high삼각형']=None;r.pop('세부원본',None);r['베이크']='CC0 원본 UV/노멀/Alpha·컬러 톤. AO1·곡률.5·roughness.9 상수. 불투명 코어 채택0'
 if id=='RF3_Hanging_Moss':r['역할']='원본 비례 CC0 미세 이끼1080개를18개 곡선 다발로 엮은 입체 수염이끼';r['세부원본']={'곡선다발':18,'다발당단':20,'단당원본식물':3,'원본비례유지':True}
 r.update({'정점':len(q.data.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in q.data.polygons),'bounds':[min(v.co[k]for v in q.data.vertices)for k in range(3)]+[max(v.co[k]for v in q.data.vertices)for k in range(3)]})
 bpy.ops.object.select_all(action='DESELECT');q.hide_set(False);q.select_set(True);bpy.context.view_layer.objects.active=q;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);q.hide_set(True)
wooddata={bpy.data.objects[r['id']].data for r in rows if any(s in r['id']for s in ['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','Foreground_Branch','River_Stake'])};vv=[];ff=[]
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data in wooddata:
  b=len(vv);vv.extend(q.matrix_world@v.co for v in q.data.vertices);ff.extend(tuple(b+i for i in f.vertices)for f in q.data.polygons)
bvh=BVHTree.FromPolygons(vv,ff);top=max(v.co.z for v in me.vertices)
for q in S.objects:
 if q.type=='MESH'and not q.hide_render and q.data==me:
  anchor=q.matrix_world@Vector((0,0,top));hit,n,idx,d=bvh.find_nearest(anchor)
  if hit is not None:
   if math.hypot(n.x,n.y)>.1:q.rotation_euler.z=math.atan2(n.y,n.x)+math.pi/2
   q.location=hit+Vector((n.x*.025,n.y*.025,-top*q.scale.z))
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=38;S.cycles.samples=16;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/원본비례_이끼다발_검수.png');bpy.ops.render.render(write_still=True)
