import importlib.util,json,shutil,hashlib
from pathlib import Path
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
target=R/'shadow_excerpt.mp4'
m.run(['-ss','46','-i',R/'final.mp4','-t','4.5','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',target])
m.run(['-i',target,'-f','null','-'])
q=m.probe(target);v=next(x for x in q['streams'] if x['codec_type']=='video');a=next(x for x in q['streams'] if x['codec_type']=='audio')
assert int(v['nb_frames'])==270 and abs(float(a['duration'])-4.5)<.06
shutil.copy2(target,m.PROJECT/'대검전사_그날밤_수정컷.mp4')
m.dump('excerpt_qa.json',dict(duration=4.5,frames=270,bytes=target.stat().st_size,sha256=hashlib.sha256(target.read_bytes()).hexdigest(),decode='PASS',audio=a['codec_name'],source_range=[46,50.5],realtime_review=False,listening_review=False))
print('4.5s captioned and voiced excerpt ready')
