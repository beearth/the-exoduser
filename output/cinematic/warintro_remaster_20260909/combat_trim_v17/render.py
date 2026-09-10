"""Remove v16 88.5-89.5s; keep spoken words and shift the ending by one second."""
from pathlib import Path
import importlib.util,json,hashlib,shutil,io,subprocess
import numpy as np
import soundfile as sf
from PIL import Image,ImageDraw
R=Path(__file__).resolve().parent;V=R.parent/'combat_v16'
s=importlib.util.spec_from_file_location('v16',V/'render.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m)
def dump(n,q):(R/n).write_text(json.dumps(q,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def run(args):m.run(args)
def render():
    assert not (R/'final.mp4').exists(),'Preserve prior output'
    x,sr=sf.read(V/'narration.wav',dtype='float32',always_2d=True)
    removed=x[round(88.5*sr):round(89.5*sr)]
    assert np.sqrt(np.mean(removed**2))<.0001,'Cut includes audible speech'
    y=np.concatenate([x[:round(88.5*sr)],x[round(89.5*sr):]])
    sf.write(R/'narration.wav',y,sr,subtype='FLOAT')
    caps=json.loads((V/'captions.json').read_text(encoding='utf-8'))
    for c in caps:
        if c['start_s']>=89.5:c['start_s']-=1;c['end_s']-=1
        else:assert c['end_s']<=88.5
    dump('captions.json',caps)
    (R/'caps.srt').write_text('\n\n'.join(f"{i+1}\n{m.stamp(c['start_s'])} --> {m.stamp(c['end_s'])}\n{c['ko']}" for i,c in enumerate(caps))+'\n',encoding='utf-8')
    run(['-filter_complex_threads','1','-threads','1','-t','88.5','-i',V/'final.mp4','-threads','1','-ss','89.5','-i',V/'final.mp4','-i',R/'narration.wav','-filter_complex','[0:v]trim=end_frame=5310,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=840,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]','-map','[v]','-map','2:a','-t','102.5','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'final.mp4'])
    shutil.copy2(V/'ending.mp4',R/'ending.mp4')
    dump('assembly_manifest.json',dict(version=17,source='combat_v16/final.mp4',removed_original_range=[88.5,89.5],removed_frames=60,removed_pcm_rms=float(np.sqrt(np.mean(removed**2))),total=102.5,frames=6150,fps=60,faceoff=[82,85],fight=[85,88.5],ending=[88.5,102.5],question_caption=[89,93.25],command=[94.04,95.095],vocative=[99,101.52],vocative_caption=[99,101.7],digital_gap=[95.095,99],fade=[101.7,102.5],captions=22,source_speed=1,new_generation=False))
def verify():
    run(['-ss','82','-i',R/'final.mp4','-t','8','-c:v','libx264','-crf','18','-preset','fast','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',R/'trim_excerpt.mp4'])
    receipts=[]
    for n,d in [('final.mp4',102.5),('trim_excerpt.mp4',8),('ending.mp4',14)]:
        p=R/n;run(['-i',p,'-f','null','-']);q=m.probe(p)
        v=next(t for t in q['streams'] if t['codec_type']=='video');a=next(t for t in q['streams'] if t['codec_type']=='audio')
        assert int(v['nb_frames'])==round(d*60) and abs(float(a['duration'])-d)<.06
        receipts.append(dict(file=n,duration=d,frames=int(v['nb_frames']),decode='PASS',sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
    ref=m.pcm(R/'narration.wav');actual=m.pcm(R/'final.mp4');n=min(len(ref),len(actual))
    corr=float(np.corrcoef(ref[:n].ravel(),actual[:n].ravel())[0,1]);assert corr>.995
    gap=float(np.sqrt(np.mean(actual[round(95.12*48000):round(98.96*48000)]**2)));assert gap<.0001
    ts=[87,88.1,88.4,88.483334,88.5,88.75,89.1,99.5,101.6]
    canvas=Image.new('RGB',(1440,882));draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(ts):
        raw=subprocess.check_output([str(m.FF),'-v','error','-ss',str(t),'-i',str(R/'final.mp4'),'-frames:v','1','-vf','scale=480:270','-f','image2pipe','-vcodec','mjpeg','-'])
        xx,yy=i%3*480,i//3*294;canvas.paste(Image.open(io.BytesIO(raw)),(xx,yy));draw.text((xx+8,yy+273),str(t),fill='white')
    canvas.save(R/'contact.jpg',quality=95)
    dump('qa.json',dict(receipts=receipts,audio_correlation=corr,digital_gap_rms=gap,visual_review='pending',realtime_review=False,listening_review=False))
    print(json.dumps(receipts),flush=True)
def publish():
    q=json.loads((R/'qa.json').read_text(encoding='utf-8'));assert q['visual_review']!='pending'
    for src,dst in [('final.mp4','대검전사_스토리_총합본.mp4'),('trim_excerpt.mp4','대검전사_악마대치_전투_수정본.mp4'),('trim_excerpt.mp4','대검전사_마지막스윙_1초컷.mp4')]:shutil.copy2(R/src,m.PROJECT/dst)
if __name__=='__main__':
    import sys
    {'render':render,'verify':verify,'publish':publish}[sys.argv[1]]()
