#!/usr/bin/env python3
"""Headless DEMO11 traversal. Exit 0 means a valid diagnostic, never E2E PASS.
Example: python3 tools/run_demo11_47h.py --godot-bin /path/to/Godot --node-bin /path/to/node --source-root /path/to/source --out /path/to/logs
"""
import argparse,pathlib,subprocess,json,time,sys
from demo11_47h_contract import validate_result
p=argparse.ArgumentParser();p.add_argument('--godot-bin',required=True);p.add_argument('--node-bin',required=True);p.add_argument('--source-root',required=True);p.add_argument('--out',required=True);p.add_argument('--require-ready',action='store_true');p.add_argument('--skip-import',action='store_true');a=p.parse_args()
godot=pathlib.Path(a.godot_bin).expanduser().resolve()
if godot.is_dir():godot=godot/('Contents/MacOS/Godot' if godot.suffix=='.app' else 'Godot.app/Contents/MacOS/Godot')
if not godot.is_file():raise SystemExit('Godot executable not found')
w=pathlib.Path(__file__).resolve().parents[1];out=pathlib.Path(a.out).expanduser().resolve();out.mkdir(parents=True,exist_ok=True);stamp=time.strftime('%Y%m%d-%H%M%S')+'-'+str(time.time_ns()%1000000);prefix='run-'+stamp
user='EXODUSER-demo11-47h-Isolated-20261021';override=w/'godot/override.cfg'
if override.exists() and override.stat().st_size:raise SystemExit('Refusing to overwrite nonempty override.cfg')
def gate(tag):
 while True:
  pattern='Godot.app/Contents/MacOS/Godot';pg=subprocess.Popen(['pgrep','-f',pattern],stdout=subprocess.PIPE);wc=subprocess.run(['wc','-l'],stdin=pg.stdout,capture_output=True,text=True);pg.stdout.close();pg.wait();n=int(wc.stdout.strip())
  raw=subprocess.run(['pgrep','-fl',pattern],capture_output=True,text=True).stdout;lines=[]
  for line in raw.splitlines():
   fields=line.split(maxsplit=2);lines.append(line if len(fields)>1 and fields[1].endswith('/Godot') else fields[0]+' non-Godot argv match (redacted)')
  with (out/'godot-gate.jsonl').open('a') as f:f.write(json.dumps({'run':prefix,'tag':tag,'time':time.time(),'count':n,'processes':lines})+'\n')
  if n<2:return lines
  print('WAIT Godot count',n,flush=True);time.sleep(30)
def launch(tag,extra):
 processes=gate(tag);override.write_text('[application]\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name='+json.dumps(user)+'\n',encoding='utf-8')
 cmd=[str(godot),'--headless','--path',str(w/'godot'),*extra];code=1
 try:
  with (out/(prefix+'-'+tag+'.stdout.log')).open('w',encoding='utf-8') as so,(out/(prefix+'-'+tag+'.stderr.log')).open('w',encoding='utf-8') as se:r=subprocess.run(cmd,cwd=w,stdout=so,stderr=se,timeout=180);code=r.returncode
 finally:override.write_text('',encoding='utf-8')
 return code,processes
if not a.skip_import:
 code,_=launch('import',['--editor','--import','--quit'])
 errors=[s for s in (out/(prefix+'-import.stderr.log')).read_text().splitlines() if 'ERROR:' in s]
 if code or errors:print(json.dumps({'overall':'FAIL','import_exit':code,'errors':errors[:8]},ensure_ascii=False));sys.exit(1)
result_file=out/(prefix+'-stages.json')
args=['--script','res://tests/test_demo11_47h_e2e.gd','--','--node-bin='+str(pathlib.Path(a.node_bin).resolve()),'--source-root='+str(pathlib.Path(a.source_root).expanduser().resolve()),'--results-path='+str(result_file),'--demo11-storage=on']
if a.require_ready:args.append('--require-ready')
code,processes=launch('e2e',args)
stdout=(out/(prefix+'-e2e.stdout.log')).read_text();stderr=(out/(prefix+'-e2e.stderr.log')).read_text();errors=[s for s in (stdout+'\n'+stderr).splitlines() if 'ERROR:' in s or '_FAIL ' in s]
result=json.loads(result_file.read_text()) if result_file.exists() else {'overall':'FAIL','counts':{},'reason':'missing stage result'}
validation=validate_result(result) if result_file.exists() else ['missing_result']
errors.extend('HARNESS_CONTRACT: '+e for e in validation)
if errors:result['overall']='FAIL'
result['engine_exit']=code;result['engine_errors']=errors;result['preexisting_processes']=processes;result['override_bytes']=override.stat().st_size
try:result['git_sha']=subprocess.check_output(['git','rev-parse','HEAD'],cwd=w,text=True,stderr=subprocess.DEVNULL).strip()
except subprocess.CalledProcessError:result['git_sha']='unknown'
result_file.write_text(json.dumps(result,ensure_ascii=False,indent=2));(out/'latest-result.json').write_text(json.dumps({'result_file':str(result_file),'overall':result['overall'],'counts':result['counts']},ensure_ascii=False,indent=2))
print(json.dumps({'overall':result['overall'],'counts':result['counts'],'engine_exit':code,'errors':errors[:8],'not_ready':[r['id']+': '+r['reason'] for r in result.get('stages',[]) if r['status']=='NOT_READY'],'failed':[r['id']+': '+r['reason'] for r in result.get('stages',[]) if r['status']=='FAIL'],'result_file':str(result_file)},ensure_ascii=False))
sys.exit(1 if errors or result['overall']=='FAIL' or code not in [0,2] else (2 if a.require_ready and result['overall']!='PASS' else 0))
