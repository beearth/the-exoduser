import bpy, json, math,hashlib,datetime
from pathlib import Path
from mathutils import Vector
R=Path('I:/EXODUSER-Storage/demo-art/blender-env')
old=R/'FBX-재수입검사.json'
if old.exists():
 archive=R/'source/검사이력';archive.mkdir(exist_ok=True);old.rename(archive/('FBX-이전-'+datetime.datetime.now().strftime('%H%M%S')+'.json'))
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));results=[]
with bpy.data.libraries.load(str(R/'source/환경모듈_하이로우_베이크.blend'),link=False) as (available,loaded):
 loaded.objects=[n for n in available.objects if n.endswith('_High')]
high_counts={o.name:len(o.data.polygons) for o in loaded.objects if o}
for r in rows:r['하이폴리면']=high_counts[r['id']+'_High']
for r in rows:
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 f=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1/Models'/(r['id']+'.fbx')
 bpy.ops.import_scene.fbx(filepath=str(f),use_anim=False)
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 assert len(meshes)==1,(r['id'],'메시수',len(meshes))
 o=meshes[0];o.data.calc_loop_triangles()
 vs=[o.matrix_world@v.co for v in o.data.vertices]
 bounds=[min(v[k] for v in vs) for k in range(3)]+[max(v[k] for v in vs) for k in range(3)]
 ref=r['범위XYZ최소최대'];err=max(abs(a-b) for a,b in zip(bounds,ref))
 deg=sum(t.area<1e-9 for t in o.data.loop_triangles)
 uv=list(o.data.uv_layers.active.data)
 invalid=sum(not all(math.isfinite(c) and -.001<=c<=1.001 for c in x.uv) for x in uv)
 used={loop.vertex_index for loop in o.data.loops};orphan=len(o.data.vertices)-len(used)
 assert err<.003,(r['id'],'축/크기',bounds,ref)
 assert not deg,(r['id'],'면적0',deg)
 assert not invalid,(r['id'],'UV범위',invalid)
 assert not orphan,(r['id'],'고립정점',orphan)
 assert len(o.data.polygons)==r['삼각형'],(r['id'],'삼각형수')
 results.append({'id':r['id'],'FBX_SHA256':hashlib.sha256(f.read_bytes()).hexdigest(),'FBX재수입':'PASS','삼각형':len(o.data.polygons),'축/크기최대오차m':err,'면적0':deg,'고립정점':orphan,'UV범위오류':invalid,'재질슬롯':[m.name if m else None for m in o.data.materials]})
(R/'FBX-재수입검사.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf8')
(R/'source/모듈명세.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8')
print('FBX 재수입 기술검사',len(results),'PASS; Unity 임포트/실게임 판정 아님',flush=True)
