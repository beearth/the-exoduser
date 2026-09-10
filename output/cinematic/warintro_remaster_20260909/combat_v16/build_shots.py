"""Normalize two video shots without slowing or freezing source motion."""
import importlib.util,hashlib,json
from pathlib import Path
R=Path(__file__).resolve().parent
s=importlib.util.spec_from_file_location('render',R/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def build(name,source,seconds):
    target=R/(name+'.mp4')
    assert not target.exists(),target
    m.run(['-i',source,'-an','-vf',f'scale=1920:1080:flags=lanczos,crop=1916:1080:2:0,setsar=1,fps=60,trim=end_frame={round(seconds*60)},setpts=PTS-STARTPTS','-c:v','libx264','-crf','16','-preset','fast','-threads','4','-pix_fmt','yuv420p',target])
    q=m.probe(target);v=next(x for x in q['streams'] if x['codec_type']=='video');assert int(v['nb_frames'])==round(seconds*60)
    return dict(file=target.name,source=str(source.relative_to(R.parent)),range=[0,seconds],frames=int(v['nb_frames']),source_sha256=hashlib.sha256(source.read_bytes()).hexdigest(),sha256=hashlib.sha256(target.read_bytes()).hexdigest(),speed=1)
if __name__=='__main__':
    import sys
    name=sys.argv[1]
    if name=='faceoff':q=build('w15_faceoff',R.parent/'batch/w14/source.mp4',3)
    elif name=='fight':q=build('w15_fight',R/'fight_source.mp4',4.5)
    else:raise ValueError(name)
    m.dump(name+'_source.json',q)
    print(json.dumps(q))
