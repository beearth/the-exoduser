#!/usr/bin/env python3
"""Isolated Godot fixed-N runner; raw logs and built-in debugger profile (no source instrumentation)."""
import argparse,json,pathlib,subprocess,time,socket,struct,threading
p=argparse.ArgumentParser();p.add_argument('--godot-bin',required=True);p.add_argument('--node-bin',required=True);p.add_argument('--out',required=True);p.add_argument('--tag',required=True);p.add_argument('--suite',default='bench_demo11_perf_enemy');p.add_argument('--population',type=int,default=30);p.add_argument('--mode',choices=['cpu','headless','render'],default='cpu');p.add_argument('--profile',action='store_true');p.add_argument('--import-only',action='store_true');p.add_argument('--userdir',default='EXODUSER-demo11-perf-enemy-Isolated-20261021');a=p.parse_args()
w=pathlib.Path(__file__).resolve().parents[1];out=pathlib.Path(a.out);out.mkdir(parents=True,exist_ok=True);prefix=out/a.tag
pattern='Godot.app/Contents/MacOS/Godot'
def inventory():
 pg=subprocess.Popen(['pgrep','-f',pattern],stdout=subprocess.PIPE);wc=subprocess.run(['wc','-l'],stdin=pg.stdout,capture_output=True,text=True);pg.stdout.close();pg.wait()
 raw=subprocess.run(['pgrep','-fl',pattern],capture_output=True,text=True).stdout
 lines=[]
 for line in raw.splitlines():
  fields=line.split(maxsplit=2)
  # pgrep -f can match another tool's notification argv containing a quoted
  # historical command. Preserve its PID/count, not unrelated prompt contents.
  lines.append(line if len(fields)>1 and fields[1].endswith('/Godot') else fields[0]+' non-Godot argv match (redacted)')
 return int(wc.stdout.strip()),'\n'.join(lines)+'\n'
while True:
 n,ps=inventory()
 with (out/'godot-gate.jsonl').open('a') as f:f.write(json.dumps({'tag':a.tag,'time':time.time(),'count':n,'pgrep':ps})+'\n')
 if n<2:break
 print('WAIT Godot count',n,flush=True);time.sleep(30)
(out/(a.tag+'.pre-pgrep.txt')).write_text(ps)
# A pre-existing user app is never killed/suspended. Results are marked contended.
other_pids=[int(x.split()[0]) for x in ps.splitlines()]
messages=[];server=None;thread=None
class Reader:
 def __init__(self,b):self.b=b;self.i=0
 def take(self,fmt):
  v=struct.unpack_from('<'+fmt,self.b,self.i);self.i+=struct.calcsize('<'+fmt);return v[0] if len(v)==1 else list(v)
 def value(self):
  header=self.take('I');t=header&65535;wide=header&65536
  if t==0:return None
  if t==1:return bool(self.take('I'))
  if t==2:return self.take('q' if wide else 'i')
  if t==3:return self.take('d' if wide else 'f')
  if t in [4,21]:
   n=self.take('I');v=self.b[self.i:self.i+n].decode('utf-8');self.i+=(n+3)&~3;return v
  if t==28:return [self.value() for _ in range(self.take('I')&0x7fffffff)]
  if t==27:return {str(self.value()):self.value() for _ in range(self.take('I')&0x7fffffff)}
  if t==29:
   n=self.take('I');v=list(self.b[self.i:self.i+n]);self.i+=(n+3)&~3;return v
  if t in [30,31,32,33]:
   n=self.take('I');return [self.take({30:'i',31:'q',32:'f',33:'d'}[t]) for _ in range(n)]
  if t==34:return [self.string() for _ in range(self.take('I'))]
  raise ValueError(('variant_type',t,self.i))
 def string(self):
  n=self.take('I');v=self.b[self.i:self.i+n].decode('utf-8');self.i+=(n+3)&~3;return v
if a.profile:
 server=socket.socket();server.bind(('127.0.0.1',0));server.listen(1);server.settimeout(180)
 port=server.getsockname()[1]
 def collect():
  try:
   client,_=server.accept();client.settimeout(60);buf=b''
   with client:
    while True:
     part=client.recv(65536)
     if not part:break
     buf+=part
     while len(buf)>=4:
      size=struct.unpack_from('<I',buf)[0]
      if len(buf)<size+4:break
      raw=buf[4:4+size];buf=buf[4+size:]
      try:messages.append(Reader(raw).value())
      except Exception as e:messages.append({'decode_error':str(e),'bytes':len(raw)})
  except Exception as e:messages.append({'socket_error':str(e)})
 thread=threading.Thread(target=collect,daemon=True);thread.start()
args=[a.godot_bin]+([] if a.mode=='render' else ['--headless'])+['--path',str(w/'godot')]
if a.mode=='render':args+=['--resolution','1920x1080','--position','0,0']
if a.profile:args+=['--remote-debug','tcp://127.0.0.1:'+str(port)]
if a.import_only:args+=['--editor','--import','--quit']
else:args+=['--script','res://tests/'+a.suite+'.gd','--','--node-bin='+a.node_bin,'--population='+str(a.population),'--mode='+a.mode,'--profile='+('on' if a.profile else 'off')]
override=w/'godot/override.cfg';override.write_text('[application]\nconfig/use_custom_user_dir=true\nconfig/custom_user_dir_name='+json.dumps(a.userdir)+'\n')
start=time.time()
try:
 with pathlib.Path(str(prefix)+'.stdout.log').open('w') as so,pathlib.Path(str(prefix)+'.stderr.log').open('w') as se:r=subprocess.run(args,stdout=so,stderr=se,cwd=w,timeout=180)
finally:override.write_text('')
if thread:thread.join(5);server.close();pathlib.Path(str(prefix)+'.profile-raw.json').write_text(json.dumps(messages,ensure_ascii=False))
text=pathlib.Path(str(prefix)+'.stdout.log').read_text();err=pathlib.Path(str(prefix)+'.stderr.log').read_text();fail=[l for l in (text+'\n'+err).splitlines() if 'ERROR:' in l or '_FAIL ' in l];summaries=[]
for line in text.splitlines():
 if '_RESULT ' in line:
  try:summaries.append(json.loads(line.split('_RESULT ',1)[1]))
  except ValueError:pass
if not a.import_only and not summaries:fail.append('missing_RESULT_summary')
result={'args':args,'exit':r.returncode,'seconds':time.time()-start,'errors':fail,'results':summaries,'other_Godot_PIDs':other_pids,'uncontended':not other_pids,'override_bytes':override.stat().st_size};pathlib.Path(str(prefix)+'.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'tag':a.tag,'exit':r.returncode,'errors':fail[:5],'results':summaries,'other_Godot_PIDs':other_pids},ensure_ascii=False),flush=True)
raise SystemExit(bool(r.returncode or fail))
