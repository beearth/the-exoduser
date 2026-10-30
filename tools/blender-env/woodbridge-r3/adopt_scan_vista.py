import bpy,json
from pathlib import Path
R=Path('I:/EXODUSER-Storage/demo-art/blender-env/woodbridge-r3');P=R/'delivery/Assets/Exoduser/Art/Environment/CH1_1_WoodbridgeR3';bpy.ops.wm.open_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));o=bpy.data.objects['RF3_Forest_Vista_Card'];path=P/'Textures/RF3_Forest_Vista_Card_BaseColor.png';im=bpy.data.images.load(str(path),check_existing=False);im.colorspace_settings.name='sRGB'
for m in o.data.materials:
 for n in m.node_tree.nodes:
  if n.type=='TEX_IMAGE'and n.image and Path(n.image.filepath).name==path.name:n.image=im
rows=json.loads((R/'source/모듈명세_납품.json').read_text(encoding='utf8'));r=next(x for x in rows if x['id']==o.name);r['역할']='실제 CC0 거목17개의 원근별 가지/줄기 렌더·하단25퍼센트/가로끝 Alpha 페이드·먼 BACK 전용';r['베이크']='r2의 카드 geometry/상수 데이터맵 인수. BaseColor는 현재 실제 거목17개의 실루엣 렌더로 교체. 하이/로우3D 베이크 아님';(R/'source/모듈명세_납품.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf8');bpy.ops.file.pack_all();bpy.ops.wm.save_as_mainfile(filepath=str(R/'source/승인구도_납품동일.blend'));print('실제 스캔 먼 숲 카드 채택',flush=True)
