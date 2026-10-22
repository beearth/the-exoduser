from pathlib import Path
import hashlib,json
root=Path.cwd();folder=root/'godot/assets/map/web_parity/detail02'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
files=[]
for p in sorted(folder.glob('*.png')):
 if p.name.startswith('stamp') or (p.name.startswith('color') and p.name not in ['color0.png','color3.png','color4.png']):continue
 if p.name.startswith('face'):source='ch1-face-life.js:8-193'
 elif p.name in ['point.png','color0.png','color3.png','color4.png']:source='godot/source_snapshot/game.html:4505-4551,25500'
 else:source='ch1-living-detail.js:529-1108'
 files.append({'file':p.name,'source':source,'sha256':sha(p)})
(folder/'provenance.json').write_text(json.dumps({'snapshot_sha256':sha(root/'godot/source_snapshot/game.html'),'source_js':{n:sha(root/n) for n in ['ch1-face-life.js','ch1-living-detail.js','ch1-altar-moat.js']},'generator':'tools/parity-map-02/export_details.cjs + export_lights.cjs','transform_oracle':'source.json transformOracle: direct public Canvas drawImage matrices at1000/2375ms','data_files':{n:sha(folder/n) for n in ['source.json','lights.json']},'files':files},indent=2)+'\n')
print(len(files),'runtime PNGs')
