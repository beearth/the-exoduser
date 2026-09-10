import importlib.util,subprocess,hashlib
from pathlib import Path
import numpy as np
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
raw=subprocess.check_output([str(m.FF),'-v','error','-i',str(R/'w11a_memory.mp4'),'-vf','scale=160:90','-pix_fmt','rgb24','-f','rawvideo','-'])
frames=np.frombuffer(raw,np.uint8).reshape(-1,90,160,3).astype(np.float32)
assert len(frames)==210
diff=np.mean(np.abs(np.diff(frames,axis=0)),axis=(1,2,3))
cuts=sorted((np.argsort(diff)[-4:]+1).tolist())
assert cuts==[30,39,48,57],cuts
assert (R/'narration.wav').read_bytes()==(R.parent/'dialogue_audit_v11/narration.wav').read_bytes()
target=R/'remember_excerpt.mp4'
m.run(['-ss','59.5','-i',R/'final.mp4','-t','6','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',target])
m.run(['-i',target,'-f','null','-'])
p=m.probe(target);v=next(x for x in p['streams'] if x['codec_type']=='video');a=next(x for x in p['streams'] if x['codec_type']=='audio')
assert int(v['nb_frames'])==360 and abs(float(a['duration'])-6)<.06
import shutil
shutil.copy2(target,m.PROJECT/'대검전사_리멤버_회상수정.mp4')
m.dump('memory_qa.json',dict(frame_count=210,detected_local_cut_frames=cuts,global_cut_frames=[3630,3639,3648,3657],frames_per_memory=9,total_memory_frames=27,narration_identical_to_v11=True,excerpt=dict(duration=6,frames=360,source_range=[59.5,65.5],sha256=hashlib.sha256(target.read_bytes()).hexdigest(),decode='PASS',audio='aac'),visual_review='pending',realtime_review=False,listening_review=False))
print('9/9/9 frame boundaries verified; 6s voiced Remember excerpt ready')
