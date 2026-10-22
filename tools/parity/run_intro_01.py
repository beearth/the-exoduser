"""Single-pass PARITY-INTRO-01 checks. Uses native Mac transport + isolated overrides."""
from pathlib import Path
import sys,shutil
sys.path.insert(0,str(Path(__file__).resolve().parents[2]/'godot/tests'))
from mac_harness import run
project=Path(__file__).resolve().parents[2]/'godot'
out=Path.home()/'exoduser-wt/_out/PARITY-INTRO-01'
engine=Path.home()/'.codex/tools/godot-4.7.2/Godot.app/Contents/MacOS/Godot'
kind=sys.argv[1]
if kind=='tests':
 for name,script,ud in [('inventory','test_demo11_23b_inventory','EXODUSER-demo11-23b-Isolated-20261021'),('intro','test_demo11_08_story_intro','EXODUSER-demo11-PARITY-INTRO-01-Tests-Isolated')]:
  run(project,out/'tests',engine,name,ud,['--headless','--script','res://tests/'+script+'.gd'],['--node-bin='+shutil.which('node'),'--source-game='+str(project/'source_snapshot/game.html'),'--artifacts-dir='+str(out/'inventory-oracle'),'--demo11-storage=on'],timeout=240)
else:
 script='e2e_parity_intro_01' if kind=='e2e' else 'capture_parity_intro_01'
 run(project,out/kind,engine,kind,'EXODUSER-demo11-PARITY-INTRO-01-'+kind+'-Isolated',['--windowed','--resolution','1920x1080','--audio-driver','Dummy','--script','res://tests/'+script+'.gd'],['--demo11-storage=on','--out='+str(out/'captures')],timeout=180)
