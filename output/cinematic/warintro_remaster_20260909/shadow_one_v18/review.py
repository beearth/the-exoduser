import importlib.util,json,shutil,hashlib
from pathlib import Path
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def source():
    assert not (R/'w09_one.mp4').exists(),'Preserve normalized source'
    m.run(['-i',R/'source.mp4','-an','-vf','scale=1920:1080:flags=lanczos,crop=1916:1080:2:0,setsar=1','-c:v','libx264','-crf','16','-preset','fast','-threads','4',R/'w09_one.mp4'])
    m.run(['-i',R/'w09_one.mp4','-f','null','-'])
    q=m.probe(R/'w09_one.mp4');v=next(x for x in q['streams'] if x['codec_type']=='video')
    assert float(v['duration'])>=4.5
    m.inspect('w09_one',[0,.4,.8,1.2,1.6,2,2.4,2.8,3.2,3.6,4,4.45])
    m.dump('source_qa.json',dict(duration=float(v['duration']),frames=int(v['nb_frames']),width=v['width'],height=v['height'],fps=v['avg_frame_rate'],decode='PASS',visual_review='pending',sha256=hashlib.sha256((R/'w09_one.mp4').read_bytes()).hexdigest()))
def excerpt():
    m.run(['-ss','45.5','-i',R/'final.mp4','-t','5.5','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'shadow_excerpt.mp4'])
    m.run(['-i',R/'shadow_excerpt.mp4','-f','null','-']);q=m.probe(R/'shadow_excerpt.mp4');v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==330
    assert (R/'narration.wav').read_bytes()==(R.parent/'combat_trim_v17/narration.wav').read_bytes()
    m.dump('excerpt_qa.json',dict(duration=5.5,frames=330,decode='PASS',narration_v17_identical=True,sha256=hashlib.sha256((R/'shadow_excerpt.mp4').read_bytes()).hexdigest()))
    shutil.copy2(R/'shadow_excerpt.mp4',m.PROJECT/'대검전사_킬루가문_그림자_수정본.mp4')
if __name__=='__main__':
    import sys
    {'source':source,'excerpt':excerpt}[sys.argv[1]]()
