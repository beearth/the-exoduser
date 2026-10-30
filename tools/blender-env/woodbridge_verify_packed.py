import bpy,json,hashlib
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r2');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_RottenForest/Textures'
rows=json.loads((R/'source/모듈명세.json').read_text(encoding='utf8'));result=[]
for filename in ['숲_베이크.blend','승인구도_조립.blend']:
 bpy.ops.wm.open_mainfile(filepath=str(R/'source'/filename));seen=set();checks=[]
 for r in rows:
  o=bpy.data.objects.get(r['id']);assert o,r['id']
  for m in o.data.materials:
   for n in m.node_tree.nodes:
    if n.type=='TEX_IMAGE' and n.image and n.image.filepath:
     im=n.image;p=P/Path(im.filepath).name
     if not p.exists() or im.name in seen:continue
     seen.add(im.name);assert im.packed_file,('패킹 누락',filename,im.name)
     a=hashlib.sha256(bytes(im.packed_file.data)).hexdigest();b=hashlib.sha256(p.read_bytes()).hexdigest();assert a==b,('패킹이 납품 PNG와 다름',filename,im.name)
     checks.append({'이미지':p.name,'sha256':a})
 result.append({'원본':filename,'연결된패킹PNG':len(checks),'모두현재납품과byte일치':True,'검사':checks})
(R/'packed-검사.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print('원본2개 실제 연결된 패킹 PNG byte PASS',flush=True)
