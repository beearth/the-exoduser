"""현재 납품 FBX byte를 재수입하여 삼각형·퇴화면·UV·피벗/축을 확인."""
import bpy,bmesh,json,math,hashlib
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3/Models';rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));bpy.ops.wm.read_factory_settings(use_empty=True);out=[]
for r in rows:
 path=P/r['FBX'];digest=hashlib.sha256(path.read_bytes()).hexdigest();before=set(bpy.data.objects);bpy.ops.import_scene.fbx(filepath=str(path));obs=[o for o in bpy.data.objects if o not in before and o.type=='MESH'];tri=0;bad=0;loose=0;uv0=True;finite=True;points=[];uvbad=0
 for o in obs:
  me=o.data;tri+=sum(len(f.vertices)-2 for f in me.polygons);bm=bmesh.new();bm.from_mesh(me);bad+=sum(f.calc_area()<1e-9 for f in bm.faces);loose+=sum(not v.link_faces for v in bm.verts);bm.free();uv0=uv0 and bool(me.uv_layers);points.extend(o.matrix_world@v.co for v in me.vertices)
  for uv in me.uv_layers:
   for q in uv.data:
    if not all(math.isfinite(a)and -.001<=a<=1.001 for a in q.uv):uvbad+=1
  finite=finite and all(math.isfinite(a)for v in me.vertices for a in v.co)
 bounds=[min(v[k]for v in points)for k in range(3)]+[max(v[k]for v in points)for k in range(3)];delta=max(abs(a-b)for a,b in zip(bounds,r['bounds']));up=True
 if 'Terrain'in r['id']:up=all((o.matrix_world.to_3x3()@f.normal).z>=-1e-6 for o in obs for f in o.data.polygons)
 ok=tri==r['저밀도삼각형']and bad==0 and loose==0 and uv0 and uvbad==0 and finite and delta<.002 and up
 out.append({'id':r['id'],'SHA256':digest,'삼각형':tri,'예상삼각형':r['저밀도삼각형'],'퇴화면':bad,'고립정점':loose,'UV0':uv0,'UV범위오류':uvbad,'좌표유한':finite,'축피벗bounds최대오차':delta,'지면위방향':up if 'Terrain'in r['id']else None,'PASS':ok});print(out[-1],flush=True)
 for o in obs:bpy.data.objects.remove(o,do_unlink=True)
(R/'FBX-최신바이트-재수입검사.json').write_text(json.dumps({'검사':out,'PASS':all(x['PASS']for x in out)},ensure_ascii=False,indent=2),encoding='utf8')
assert all(x['PASS']for x in out),'현재 FBX 재수입 검사 실패'
