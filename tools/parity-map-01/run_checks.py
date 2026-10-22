from pathlib import Path
import subprocess,json,os
root=Path.cwd();out=Path.home()/'exoduser-wt/_out/PARITY-MAP-01';config=root/'godot/override.cfg';before=config.read_bytes() if config.exists() else None
runtime=Path.home()/'.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot'
cases=[('test_map_look.gd','EXODUSER-MapLook-Isolated-20261020',['--map11=off']),('test_p3002_spawn_holes.gd','EXODUSER-P3002-Isolated-20261020',['--map11=off']),('test_p2003a_lighting.gd','EXODUSER-P2003A-Isolated-20261020',['--map11=off']),('test_parity_map_01.gd','EXODUSER-demo11-PARITY-MAP-01-Isolated-20261022',[])]
rows=[]
try:
 for script,namespace,args in cases:
  config.write_text('[application]\nconfig/custom_user_dir_name="'+namespace+'"\n')
  with (out/(script+'.log')).open('w') as log:
   p=subprocess.run([str(runtime),'--headless','--path',str(root/'godot'),'--script','res://tests/'+script,'--',*args],stdout=log,stderr=subprocess.STDOUT,timeout=120)
  text=(out/(script+'.log')).read_text();result=[line for line in text.splitlines() if 'RESULT ' in line or '_SKIP ' in line or 'SCRIPT ERROR' in line]
  row={'script':script,'exit':p.returncode,'summary':result[-8:],'mode':'legacy isolated source regression' if args else 'current web-map product'};rows.append(row);print(json.dumps(row),flush=True)
finally:
 if before is None:config.unlink(missing_ok=True)
 else:config.write_bytes(before)
 (out/'checks.json').write_text(json.dumps(rows,indent=2))
