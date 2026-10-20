#!/usr/bin/env python3
"""Summarize Godot servers profiler totals and the slowest physics profile frame."""
import json,argparse,pathlib
p=argparse.ArgumentParser();p.add_argument('raw');p.add_argument('--out',required=True);a=p.parse_args();messages=json.loads(pathlib.Path(a.raw).read_text());sigs={};total=None;frames=[]
for m in messages:
 if not isinstance(m,list) or len(m)<3:continue
 name,data=m[0],m[2]
 if name=='servers:function_signature':sigs[data[1]]=data[0]
 if name=='servers:profile_total':total=data
 if name=='servers:profile_frame':frames.append(data)
assert total is not None,'No accumulated profile_total received'
def parse(frame):
 x=7
 for _ in range(frame[6]):x+=2+int(frame[x+1])
 words=int(frame[x]);flat=frame[x+1:];assert len(flat)==words
 # FunctionInfo currently serializes sig,count,self,total,internal (seconds).
 stride=5
 if len(flat)%5 or not all(flat[i] in sigs for i in range(0,len(flat),5)):stride=4
 assert len(flat)%stride==0
 rows=[]
 for i in range(0,len(flat),stride):
  sig,calls,self_s,total_s=flat[i:i+4];rows.append({'signature':sigs.get(sig,str(sig)),'calls':calls,'self_ms':self_s*1000,'inclusive_ms':total_s*1000,'internal_ms':flat[i+4]*1000 if stride==5 else None})
 rows.sort(key=lambda r:r['self_ms'],reverse=True);return rows
rows=parse(total);slowest=max(frames,key=lambda f:f[3]) if frames else None
result={'profiler':'Godot built-in servers script profiler; accumulated measured region only','raw_frames':len(frames),'rows':rows,'top10_self':rows[:10],'slowest_physics_frame':{'frame_meta':slowest[:6],'top10_self':parse(slowest)[:10]} if slowest else None};pathlib.Path(a.out).write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps({'functions':len(rows),'slowest_physics_frame':result['slowest_physics_frame']},ensure_ascii=False))
