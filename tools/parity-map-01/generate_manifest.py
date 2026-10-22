from pathlib import Path
import json,hashlib,re
root=Path.cwd();src=(root/'godot/source_snapshot/game.html').read_text();m=json.loads((root/'godot/data/map.json').read_text());assets=root/'godot/assets/map/web_parity'
def line(at):return src.count('\n',0,at)+1 if at>=0 else None
rows=[]
for c in m['chunks']:
 rows.append({'item':f'chunk_{c["x"]}_{c["y"]}','source_line':[11612,11615,11754,11762,51924],'source_asset':f'assets/map/ch1/production_finish/chunk_{c["x"]}_{c["y"]}.png','godot_asset':c['texture'],'world_rect':c['world_rect'],'source_rect':c['source_rect']})
hand_start=src.index('handProps:[',src.index('const _MAP_COMPOSE='));hand_end=src.index('// CH1-1 HAND PROPS END',hand_start)
for p in m['props']:
 needle="id:'"+p['id']+"'";at=src.find(needle,hand_start,hand_end);meta=src.find(needle,src.index('const _CH_DECO='),hand_start) if 'const _CH_DECO=' in src else -1
 if meta<0:meta=src.find("'"+p['id']+"':",src.index('const _OBJ_META='),src.index('// _CH_DECO 프리로드',src.index('const _OBJ_META=')))
 source_asset=f'assets/map/ch1/{p["metadata"].get("dir","floor_objects")}/{p["metadata"].get("file",Path(p["texture"]).name)}'
 if p['id']=='pit_poison':source_asset='assets/map/ch1/collision/pit_poison.png' # game.html 17502 direct sprite map, not CH_DECO default dir
 rows.append({'item':p['id'],'placement_source_line':line(at),'metadata_source_line':line(meta),'source_line':[17526,17638,26061,26080,52442,52453],'source_asset':source_asset,'godot_asset':p['texture'],'position':p['position'],'draw_size':p['draw_size'],'pivot':p['pivot'],'metadata':p['metadata']})
def provenance(p):
 if 'tree_' in p.name or 'feature_' in p.name:return 'ch1-rot-trees.js:14-426'
 if 'sway_' in p.name:return 'ch1-forest-sway.js:10-98'
 if 'edge_' in p.name:return 'ch1-boundary-edge.js:1-95'
 return 'game.html:18247-18264,18341-18363,52029-52047'
output={'source_sha256':hashlib.sha256((root/'godot/source_snapshot/game.html').read_bytes()).hexdigest(),'items':rows,'derived_layers':[{'file':str(p.relative_to(root)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'source':provenance(p)} for p in sorted(assets.glob('*.png'))]}
(root/'docs/engine/PARITY_MAP_01_SOURCE_MANIFEST_20261022.json').write_text(json.dumps(output,ensure_ascii=False,indent=2)+'\n')
print('manifest',len(rows),'original placements',sum(p.get('placement_source_line') is not None for p in rows),'derived PNG',len(output['derived_layers']))
