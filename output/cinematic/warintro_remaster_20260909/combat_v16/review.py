"""Source motion samples and a voiced W15 excerpt for review."""
import importlib.util,json,hashlib,shutil,subprocess
from pathlib import Path
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def sources():
    m.inspect('w15_faceoff',[0,.5,1,1.5,2,2.95])
    m.inspect('w15_fight',[0,.4,.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4,4.45])
    receipts=[]
    for n in ['w15_faceoff.mp4','w15_fight.mp4','fight_source.mp4']:
        m.run(['-i',R/n,'-f','null','-']);q=m.probe(R/n)
        v=next(x for x in q['streams'] if x['codec_type']=='video')
        receipts.append(dict(file=n,duration=float(v['duration']),frames=int(v['nb_frames']),fps=v['avg_frame_rate'],width=v['width'],height=v['height'],decode='PASS'))
    m.dump('source_qa.json',dict(receipts=receipts,visual_review='pending',realtime_review=False))
def excerpt():
    p=R/'combat_excerpt.mp4';assert not p.exists()
    m.run(['-ss','82','-i',R/'final.mp4','-t','7.5','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',p])
    m.run(['-i',p,'-f','null','-']);q=m.probe(p)
    v=next(x for x in q['streams'] if x['codec_type']=='video');a=next(x for x in q['streams'] if x['codec_type']=='audio')
    assert int(v['nb_frames'])==450 and a['codec_name']=='aac'
    assert (R/'narration.wav').read_bytes()==(R.parent/'memory_v14/narration.wav').read_bytes()
    assert (R/'caps.srt').read_bytes()==(R.parent/'memory_v14/caps.srt').read_bytes()
    m.dump('excerpt_qa.json',dict(file=p.name,duration=7.5,frames=450,audio=a['codec_name'],decode='PASS',sha256=hashlib.sha256(p.read_bytes()).hexdigest(),narration_and_captions_v14_identical=True))
    shutil.copy2(p,m.PROJECT/'대검전사_악마대치_전투_수정본.mp4')
if __name__=='__main__':
    import sys
    {'sources':sources,'excerpt':excerpt}[sys.argv[1]]()
