"""Produce contact sheets and verify the final voice against the prepared PCM."""
import io
import json
import subprocess
import numpy as np
from PIL import Image, ImageDraw
from assemble import ROOT, FF, SHOTS, SOURCE_OVERRIDES

def frame(path, time):
    return Image.open(io.BytesIO(subprocess.check_output([str(FF),'-v','error','-ss',str(time),'-i',str(path),'-frames:v','1','-vf','scale=480:270','-f','image2pipe','-vcodec','mjpeg','-']))).convert('RGB')

def sources():
    for group in range(2):
        canvas=Image.new('RGB',(1440,8*294),'#101010')
        draw=ImageDraw.Draw(canvas)
        for row,(name,duration) in enumerate(SHOTS[group*8:group*8+8]):
            for col,t in enumerate([0,duration/2,duration-.08]):
                canvas.paste(frame(ROOT/SOURCE_OVERRIDES.get(name,f'{name}.mp4'),t),(col*480,row*294))
                draw.text((col*480+8,row*294+273),f'{name} / {t:.2f}s',fill='white')
        canvas.save(ROOT/f'source_contact_{group+1}.jpg',quality=90)

def final():
    times=[47,52,54.5,57,61.5,63.8,66.5,73,79,83.2,85.4,87.5,90.5,93,95.5,96.7,97.4,99]
    canvas=Image.new('RGB',(1440,6*294),'#101010')
    draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        x,y=i%3*480,i//3*294
        canvas.paste(frame(ROOT/'final.mp4',t),(x,y))
        draw.text((x+8,y+273),f'{t:.2f}s',fill='white')
    canvas.save(ROOT/'dialogue_contact.jpg',quality=94)
    def pcm(path):
        return np.frombuffer(subprocess.check_output([str(FF),'-v','error','-i',str(path),'-vn','-ac','1','-ar','24000','-f','f32le','-']),np.float32)
    a,b=pcm(ROOT/'narration_v7.wav'),pcm(ROOT/'final.mp4')
    n=min(len(a),len(b)); corr=float(np.corrcoef(a[:n],b[:n])[0,1])
    pause=b[int(96.12*24000):int(97.11*24000)]
    rms=float(np.sqrt(np.mean(pause**2)))
    assert corr>.995, corr
    assert rms<.0001, rms
    result=dict(narration_correlation=corr, internal_pause_rms=rms, captions=22, contact_samples=times, realtime_listening=False, realtime_motion_review=False)
    (ROOT/'assembly_qa.json').write_bytes((json.dumps(result,indent=2)+'\n').encode())
    print(result,flush=True)

def correction(name, duration):
    canvas=Image.new('RGB',(1440,3*294),'#101010')
    draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(np.linspace(0,duration-.05,9)):
        x,y=i%3*480,i//3*294
        canvas.paste(frame(ROOT/f'{name}.mp4',t),(x,y))
        draw.text((x+8,y+273),f'{name} / {t:.3f}s',fill='white')
    canvas.save(ROOT/f'{name}_contact.jpg',quality=95)
    subprocess.run([str(FF),'-v','error','-i',str(ROOT/f'{name}.mp4'),'-f','null','-'],check=True)

if __name__=='__main__':
    import sys
    {'sources':sources,'final':final,'sword':lambda:correction('w10a_straight',3),'armor':lambda:correction('w16b_armor',3.55)}[sys.argv[1]]()
