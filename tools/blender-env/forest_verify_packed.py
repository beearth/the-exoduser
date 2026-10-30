import bpy,json,hashlib,datetime,shutil
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/forest-r1');rows=[]
for name in ['숲_베이크.blend','숲_최종.blend']:
 path=R/'source'/name;bpy.ops.wm.open_mainfile(filepath=str(path));changed=False;checked=[]
 for im in bpy.data.images:
  if not im.filepath:continue
  f=Path(bpy.path.abspath(im.filepath))
  if '/CH1_1_RottenForest/Textures/' not in f.as_posix() or not f.exists():continue
  data=f.read_bytes();digest=hashlib.sha256(data).hexdigest();before=hashlib.sha256(bytes(im.packed_file.data)).hexdigest() if im.packed_file else None
  if before!=digest:
   if im.packed_file:im.unpack(method='REMOVE')
   im.source='FILE';im.reload();im.pack();changed=True
  after=hashlib.sha256(bytes(im.packed_file.data)).hexdigest() if im.packed_file else None
  assert after==digest,('packed byte 불일치',im.name,str(f),digest,after)
  checked.append({'이미지':im.name,'파일':str(f),'sha256':digest,'갱신':before!=after})
 if changed:
  backup=R/'source/packed-갱신전';backup.mkdir(exist_ok=True);dest=backup/(datetime.datetime.now().strftime('%H%M%S')+'-'+name);shutil.copy2(path,dest);bpy.ops.wm.save_as_mainfile(filepath=str(path))
 rows.append({'파일':name,'대조이미지':len(checked),'갱신':sum(x['갱신'] for x in checked),'결과':'PASS','자료':checked,'blendSHA256':hashlib.sha256(path.read_bytes()).hexdigest()})
(R/'packed-검사.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');print('현재 납품 PNG와 packed 데이터 byte 일치 PASS',[(r['파일'],r['대조이미지'],r['갱신']) for r in rows],flush=True)
