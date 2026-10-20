#!/usr/bin/env python3
"""Run only the offline-verified DEMO11-46 QA app; no UI synthesis.
The standalone lobby must be baked as a separate export; no path override/router.
Prefer normal UI exit. Any blocked cleanup must target only the recorded own PID
and is not proof of normal exit or exit-save. Existing games/servers stay untouched.
"""
import argparse
import datetime
import json
from pathlib import Path
import subprocess
from export_demo11_mac import verify_pack,godot_gate

p=argparse.ArgumentParser(description=__doc__)
p.add_argument('--app',type=Path,required=True)
p.add_argument('--out-dir',type=Path,required=True)
p.add_argument('--label',required=True)
p.add_argument('--scene',choices=['field','lobby'],default='field')
a=p.parse_args();out=a.out_dir.resolve();out.mkdir(parents=True,exist_ok=True)
if not a.label.replace('-','').isalnum():raise RuntimeError('invalid label')
record=verify_pack(a.app.resolve());exe=record['executable']
expected='res://scenes/demo_lobby.tscn' if a.scene=='lobby' else 'res://scenes/main.tscn'
if record['binary_settings'].get('application/run/main_scene')!=expected:raise RuntimeError('entry scene must be baked by the exporter; CLI path overrides are disabled by official templates')
if (out/(a.label+'.launch.json')).exists():raise RuntimeError('preserve old launch receipt')
godot_gate(out,a.label)
argv=[exe,'--resolution','1280x720','--position','80,80','--log-file',str(out/(a.label+'.engine.log'))]
with (out/(a.label+'.stdout.log')).open('w') as stdout,(out/(a.label+'.stderr.log')).open('w') as stderr:
 process=subprocess.Popen(argv,stdout=stdout,stderr=stderr)
 launch={'utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'pid':process.pid,'argv':argv,'userdir':record['userdir'],'scene':a.scene,'standalone_lobby_diagnostic':a.scene=='lobby'}
 (out/(a.label+'.launch.json')).write_text(json.dumps(launch,indent=2)+'\n');print('launched own QA app pid',process.pid,flush=True)
 code=process.wait()
 (out/(a.label+'.exit.json')).write_text(json.dumps({'pid':process.pid,'exit':code,'utc':datetime.datetime.now(datetime.timezone.utc).isoformat()},indent=2)+'\n')
 print('own QA app exit',code,flush=True)
