"""One-shot real Compatibility GPU dump; isolated userdir and bounded child process.
Usage: python3 godot/tests/run_vram_01_capture.py --engine /path/Godot --out /path/out --label before
Run from worktree root. Requires imported project. Never runs/imports the shared R tree.
"""
import argparse
import threading
from pathlib import Path
from mac_harness import run
from vram_01_debugger import serve
p=argparse.ArgumentParser()
p.add_argument('--engine',required=True)
p.add_argument('--out',required=True,type=Path)
p.add_argument('--label',required=True)
a=p.parse_args()
a.out.mkdir(parents=True,exist_ok=True)
(a.out/'captures').mkdir(exist_ok=True)
listener=threading.Thread(target=serve,args=(a.out,),daemon=True)
listener.start()
ok=run(Path.cwd()/'godot',a.out,a.engine,a.label,'EXODUSER-demo11-VRAM-01-Isolated-'+a.label,
 ['--remote-debug','tcp://127.0.0.1:16081','--script','res://tests/capture_vram_01.gd'],
 ['--demo11-storage=on','--out='+str(a.out.resolve()),'--label='+a.label],timeout=300)
listener.join(timeout=10)
raise SystemExit(0 if ok else 1)
