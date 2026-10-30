"""현재 납품의 실제 PNG 픽셀과 조립에 연결된 packed 이미지의 동일성을 검증한다."""
import bpy,json,numpy as np,hashlib
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));seen=set();out=[]
for r in rows:
 o=bpy.data.objects[r['id']]
 for m in o.data.materials:
  for n in m.node_tree.nodes:
   if n.type!='TEX_IMAGE'or not n.image or n.image.as_pointer()in seen:continue
   im=n.image;seen.add(im.as_pointer());f=Path(bpy.path.abspath(im.filepath));entry={'이미지':im.name,'경로':str(f),'source':im.source,'packed':bool(im.packed_file),'규격':list(im.size),'현재납품맵':f.name in r['맵'].values()}
   if f.parent!=P/'Textures'or not f.exists():entry['PASS']=False;out.append(entry);continue
   disk=bpy.data.images.load(str(f),check_existing=False);disk.colorspace_settings.name=im.colorspace_settings.name;size=len(im.pixels);a=np.empty(size,dtype=np.float32);b=np.empty(size,dtype=np.float32);im.pixels.foreach_get(a);disk.pixels.foreach_get(b);entry['최대픽셀차']=float(np.max(np.abs(a-b)));entry['SHA256']=hashlib.sha256(f.read_bytes()).hexdigest();entry['PASS']=entry['현재납품맵']and entry['packed']and entry['최대픽셀차']<.00001;out.append(entry);bpy.data.images.remove(disk);del a,b
report={'범위':'18개 납품 모듈의 Blender 실제 연결 이미지. 선형 픽셀을 같은 색공간에서 대조','검사':out,'PASS':all(x['PASS']for x in out)};(R/'packed-현재PNG-검사.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print('실제 packed PNG',len(out),report['PASS'],[x for x in out if not x['PASS']],flush=True)
