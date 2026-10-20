"""Regression for dependency reporting, independent of game state."""
import copy,sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'tools'))
from demo11_47h_contract import ORDER,USERDIR,validate_result
r={'headless':True,'userdir':USERDIR,'stages':[], 'overall':'NOT_READY','continuous_E2E':False}
for name in ORDER:
 r['stages'].append({'id':name,'status':'NOT_READY','blocked_by':['bossroom_gate'] if name in ['boss_defeat_signal','clear','demo_end','lobby_return'] else []})
r['counts']={'PASS':0,'FAIL':0,'NOT_READY':18}
checks=1;failures=int(bool(validate_result(r)))
for name in ['boss_defeat_signal','clear','demo_end','lobby_return']:
 bad=copy.deepcopy(r)
 next(row for row in bad['stages'] if row['id']==name)['blocked_by']=[]
 checks+=1;failures+=int(name+':gate_dependency' not in validate_result(bad))
print('checks='+str(checks)+' failures='+str(failures))
sys.exit(bool(failures))
