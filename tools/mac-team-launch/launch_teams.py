#!/usr/bin/env python3
"""Explicit launch only; never changes trust or permission settings."""
import argparse,datetime,json,subprocess,sys
from pathlib import Path
base=Path(__file__).resolve().parent
manifest=json.loads((base/'teams.json').read_text())
parser=argparse.ArgumentParser();parser.add_argument('--launch',action='store_true');args=parser.parse_args()
receipt=base/'launch-receipt.json'
state=json.loads(receipt.read_text()) if receipt.exists() else {'sessions':{}}
def save():
 state['checked_at']=datetime.datetime.now(datetime.timezone.utc).isoformat();receipt.write_text(json.dumps(state,ensure_ascii=False,indent=2)+'\n')
def inventory():
 p=subprocess.run([manifest['cli'],'agents','--json','--all'],capture_output=True,text=True,cwd=manifest['repo'])
 if p.returncode: raise RuntimeError(p.stderr or p.stdout)
 data=json.loads(p.stdout)
 if not isinstance(data,list): raise RuntimeError('Unknown inventory format; stopping to avoid duplicates.')
 return data
def matches(team,items):
 return [r for r in items if team['session_id'] in json.dumps(r,ensure_ascii=False) or team['name'] in json.dumps(r,ensure_ascii=False)]
items=inventory()
for team in manifest['teams']:
 found=matches(team,items)
 if len(found)>1: raise RuntimeError(team['team']+': multiple existing matches; manual review required')
 if found:
  state['sessions'][team['team']]={'state':'existing-verified','session_id':team['session_id'],'name':team['name']};save();print(team['team']+': existing, skipped');continue
 if team['team'] in state['sessions']:
  print(team['team']+': previous attempt exists; inspect before retry');continue
 if not args.launch:
  print(team['team']+': prepared, not launched');continue
 command=[manifest['cli'],'--bg','--name',team['name'],'--session-id',team['session_id'],'--tools','Read,Glob,Grep',(base / team['prompt_file']).read_text()]
 state['sessions'][team['team']]={'state':'launching','session_id':team['session_id'],'name':team['name']};save()
 try:p=subprocess.run(command,capture_output=True,text=True,cwd=manifest['repo'],timeout=60)
 except subprocess.TimeoutExpired:
  state['sessions'][team['team']]['state']='unknown-timeout';save();raise SystemExit('Unknown outcome; stopped without retry.')
 (base/(team['team']+'-launch.log')).write_text(p.stdout+p.stderr)
 if p.returncode:
  state['sessions'][team['team']]['state']='blocked';save();print(p.stdout+p.stderr);raise SystemExit(p.returncode)
 items=inventory()
 state['sessions'][team['team']]['state']='opened-inventory-verified' if matches(team,items) else 'launch-returned-verification-pending'
 save();print(team['team']+': '+state['sessions'][team['team']]['state'])
 if not matches(team,items): raise SystemExit('Inventory confirmation missing; stopped to avoid duplicates.')
if args.launch:
 final=inventory();state['verified_team_count']=sum(bool(matches(t,final)) for t in manifest['teams']);save()
 print('Inventory verified teams:',state['verified_team_count'],'/ 11. Registration acknowledgment and actual task execution must be reviewed separately.')
