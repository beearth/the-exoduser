"""최종 후보의 실제 목질/지면에 식생을 재접지하고 현재 배치 영수증을 동결."""
import bpy,json
from pathlib import Path
from mathutils import Vector
from mathutils.bvhtree import BVHTree
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));S=bpy.context.scene;rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));woodtags=['Ancient_Tree','Root_Stump','Fallen_Log','Rotten_Wood_Bridge','River_Stake','Foreground_Branch'];wooddata={bpy.data.objects[r['id']].data for r in rows if any(t in r['id']for t in woodtags)};terrain=bpy.data.objects['RF3_Continuous_Bank_Terrain'].data
def bvh_for(data):
 vs=[];fs=[]
 for o in S.objects:
  if o.type=='MESH'and not o.hide_render and o.data in data:
   b=len(vs);vs.extend(o.matrix_world@v.co for v in o.data.vertices);fs.extend(tuple(b+i for i in f.vertices)for f in o.data.polygons)
 return BVHTree.FromPolygons(vs,fs)
wood=bvh_for(wooddata);surface=bvh_for(wooddata|{terrain});drape=bpy.data.objects['RF3_Hanging_Moss'].data;cushion=bpy.data.objects['RF3_Moss_Cushion'].data;top=max(v.co.z for v in drape.vertices);moved=removed=grounded=0
for o in list(S.objects):
 if o.type!='MESH'or o.hide_render:continue
 if o.data==drape:
  anchor=o.matrix_world@Vector((0,0,top));hit,n,idx,d=wood.find_nearest(anchor)
  if hit is None or d>2.5:bpy.data.objects.remove(o,do_unlink=True);removed+=1
  else:o.location+=hit-anchor;moved+=1
 elif o.data==cushion:
  hit,n,idx,d=surface.ray_cast(o.location+Vector((0,0,2)),Vector((0,0,-1)),5)
  if hit is None or hit.z<-.1:bpy.data.objects.remove(o,do_unlink=True);removed+=1
  else:o.location.z=hit.z+.015;grounded+=1
for r in rows:
 o=bpy.data.objects[r['id']];r['정점']=len(o.data.vertices);r['저밀도삼각형']=sum(len(f.vertices)-2 for f in o.data.polygons);r['bounds']=[min(v.co[k]for v in o.data.vertices)for k in range(3)]+[max(v.co[k]for v in o.data.vertices)for k in range(3)]
 if r.get('high')and bpy.data.objects.get(r['high']):r['high삼각형']=sum(len(f.vertices)-2 for f in bpy.data.objects[r['high']].data.polygons)
 if 'Terrain'in r['id']:r['high원본']={'파일':'source/승인구도_베이크입력.blend','오브젝트':'RF3_Continuous_Bank_Terrain','삼각형':48000,'후속':'현재기저위방향 Normal/AO 재베이크 후 비노출 흙섬을 수면 아래로 낮춤'}
meshes={bpy.data.objects[r['id']].data:r['id']for r in rows};placements=[]
for o in S.objects:
 if o.type=='MESH'and not o.hide_render and o.data in meshes:placements.append({'id':meshes[o.data],'이름':o.name,'BlenderXYZ':list(o.location),'회전XYZ':list(o.rotation_euler),'배율':list(o.scale)})
(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');(R/'source/조립-납품모듈배치.json').write_text(json.dumps({'범위':'동일 납품모듈의 Blender 정적 검수. 게임/충돌 배치 아님','프록시':'수면·불·조명·안개/빛기둥은 Blender 기준 대리물','카메라XYZ':list(S.camera.location),'초점mm':S.camera.data.lens,'배치':placements,'이끼재접지':moved,'이끼쿠션접지':grounded,'부유식생제외':removed},ensure_ascii=False,indent=2),encoding='utf8');S.render.resolution_percentage=100;S.cycles.samples=96;bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('납품동일 조립 동결',len(placements),moved,grounded,removed,flush=True)
