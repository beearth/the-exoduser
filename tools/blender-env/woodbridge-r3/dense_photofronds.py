"""매끈한 섬유를 폐기. 넓고 갈라진 실물 잎 부분을 원래 비례로 겹쳐 자연스러운 다발을 만든다."""
import bpy,math,json,shutil
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));id='RF3_Hanging_Moss';o=bpy.data.objects[id];old=o.data;vs=[];fs=[];uvs=[]
if (R/'renders/RF3_Hanging_Moss.png').exists():shutil.copyfile(R/'renders/RF3_Hanging_Moss.png',R/'renders/FAIL_매끈한섬유_1600.png')
for stem in range(20):
 bx=(stem/19-.5)*1.35+.04*math.sin(stem*1.6);by=.25*math.sin(stem*2.4);L=1.12+.62*(.5+.5*math.sin(stem*1.7));top=2.3+.12*math.sin(stem*2)
 for level in range(14):
  t=level/13;cx=bx+.12*math.sin(t*4+stem)*t;cy=by+.1*math.sin(t*5+stem*.7)*t;cz=top-L*t
  for side in range(2):
   src=bpy.data.objects['moss_01_'+['a','b','c','d','e','f'][(stem+level+side)%6]+'_LOD0'].data;mn=Vector([min(v.co[k]for v in src.vertices)for k in range(3)]);mx=Vector([max(v.co[k]for v in src.vertices)for k in range(3)]);height=.16+.08*(.5+.5*math.sin(stem+level*1.7+side));sc=height/(mx.z-mn.z);a=stem*1.3+level*.7+side*math.pi/2;base=len(vs)
   for v in src.vertices:
    x=(v.co.x-(mn.x+mx.x)*.5)*sc;y=(v.co.y-(mn.y+mx.y)*.5)*sc;z=(v.co.z-mn.z)*sc;vs.append((cx+x*math.cos(a)-y*math.sin(a),cy+x*math.sin(a)+y*math.cos(a),cz-z))
   for f in src.polygons:fs.append(tuple(base+i for i in f.vertices));uvs.extend(tuple(src.uv_layers.active.data[k].uv)for k in f.loop_indices)
me=bpy.data.meshes.new('실물넓은잎_이끼560');me.from_pydata(vs,[],fs);me.update();uv=me.uv_layers.new(name='UVMap')
for q,v in zip(uv.data,uvs):q.uv=v
mat=old.materials[0];me.materials.append(mat)
for f in me.polygons:f.use_smooth=True
o.data=me
for q in S.objects:
 if q.data==old:q.data=me
r=next(x for x in rows if x['id']==id);oldmaps=r['맵'].copy();ims={}
for k in ['BaseColor','Normal','AO','Curvature','Roughness','Metallic']:
 p=P/'Textures'/('Atlas_hanging_moss_BaseColor.png'if k=='BaseColor'else'Atlas_moss_01_'+k+'.png');im=bpy.data.images.load(str(p),check_existing=False);im.colorspace_settings.name='sRGB'if k=='BaseColor'else'Non-Color';ims[k]=im
for n in mat.node_tree.nodes:
 if n.type=='TEX_IMAGE'and n.image:
  for k,p in oldmaps.items():
   if Path(n.image.filepath).name==p and k in ims:n.image=ims[k]
r.update({'맵':{k:Path(im.filepath).name for k,im in ims.items()},'텍스처규격':[2048,2048],'텍스처해상도':2048,'역할':'CC0 넓은 실물 잎560개를20개 처진 곡선 다발로 엮은 이끼·탈색 회녹색','베이크':'실물 잎 UV/노멀/원본Alpha·컬러 톤 atlas. AO1·곡률.5·roughness.9 기준 상수. 넓은 천막/매끈한 섬유0','정점':len(me.vertices),'저밀도삼각형':sum(len(f.vertices)-2 for f in me.polygons),'bounds':[min(v.co[k]for v in me.vertices)for k in range(3)]+[max(v.co[k]for v in me.vertices)for k in range(3)],'세부원본':{'실물원본':'moss_01_a..f_LOD0','원래잎비례':True,'잎560':True,'다발20':True}})
bpy.ops.object.select_all(action='DESELECT');o.hide_set(False);o.select_set(True);bpy.context.view_layer.objects.active=o;bpy.ops.export_scene.fbx(filepath=str(P/'Models'/(id+'.fbx')),use_selection=True,object_types={'MESH'},axis_forward='-Z',axis_up='Y',bake_anim=False,path_mode='STRIP',add_leaf_bones=False);o.hide_set(True)
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=45;S.cycles.samples=20;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S.render.filepath=str(R/'renders/넓은실물잎_처진이끼.png');bpy.ops.render.render(write_still=True)
