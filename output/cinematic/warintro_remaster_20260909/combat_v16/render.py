"""Replace W15 with demon confrontation followed by active sword combat; preserve v14 narration and memories."""
import hashlib, io, json, os, shutil, subprocess
from pathlib import Path
import numpy as np
import soundfile as sf
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
V7=ROOT.parent/'realism_v7'
V11=ROOT.parent/'dialogue_audit_v11'
PROJECT=ROOT.parents[3]
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF,FP=BIN/'ffmpeg.exe',BIN/'ffprobe.exe'
RATE=48000
TOTAL=103.5
VOCATIVE_AT=100.0
COMMAND_END=96.095
SHOTS=[('w08_witness',7.5),('w09',4.5),('w10a_straight',3),('w10b',2.5),('w10c',4),('w11a_memory',3.5),('w11b_present',2),('w12_fall',4.5),('w13_countless',6.5),('w14_arrival',5.5),('w15_faceoff',3),('w15_fight',4.5),('w16a',2),('w16b_armor',3.55),('w16c',4.95),('w16d',3.5)]

def dump(name,data):
    (ROOT/name).write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
def run(args):
    subprocess.run([str(FF),'-hide_banner','-v','error','-y',*map(str,args)],cwd=ROOT,check=True)
def pcm(path):
    return np.frombuffer(subprocess.check_output([str(FF),'-v','error','-i',str(path),'-vn','-ar',str(RATE),'-ac','2','-f','f32le','-']),np.float32).reshape(-1,2)
def probe(path):
    return json.loads(subprocess.check_output([str(FP),'-v','error','-show_format','-show_streams','-of','json',str(path)]))
def stamp(t):
    n=round(t*1000)
    return f'{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}'
def source(name):
    return (ROOT if name in {'w15_faceoff','w15_fight'} else ROOT.parent/'memory_v14' if name in {'w11a_memory','w11b_present'} else V11 if name in {'w08_witness','w12_fall','w13_countless','w14_arrival'} else V7)/f'{name}.mp4'

def render():
    target=ROOT/'final.mp4'
    assert not target.exists(), 'Preserve existing v16 final before rerendering'
    args=['-filter_complex_threads','1','-threads','1','-t','38.7','-i',ROOT.parent/'full_review_v4/clean.mp4']
    for name,d in SHOTS:
        assert source(name).exists(), name
        args += ['-threads','1','-t',d+.2,'-i',source(name)]
    args += ['-i',ROOT/'narration.wav']
    fc=['[0:v]trim=duration=38.5,setpts=PTS-STARTPTS,fps=60,trim=end_frame=2310,setsar=1[v0]']
    cursor=2310
    timeline=[]
    for i,(name,d) in enumerate(SHOTS,1):
        frames=round(d*60)
        fc.append(f'[{i}:v]setpts=PTS-STARTPTS,pad=1920:1080:2:0:black,fps=60,trim=end_frame={frames},setsar=1[v{i}]')
        timeline.append(dict(source=str(source(name).relative_to(ROOT.parent)),start_frame=cursor,end_frame=cursor+frames,start=cursor/60,end=(cursor+frames)/60,speed=1))
        cursor+=frames
    assert cursor==round(TOTAL*60)
    fc.append(''.join(f'[v{i}]' for i in range(len(SHOTS)+1))+f"concat=n={len(SHOTS)+1}:v=1:a=0,fade=t=out:st={TOTAL-.8}:d=0.8,subtitles=caps.srt:fontsdir=../full_review_v4/fonts:force_style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'[v]")
    args += ['-filter_complex',';'.join(fc),'-map','[v]','-map',f'{len(SHOTS)+1}:a:0','-t',TOTAL,'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar',RATE,'-movflags','+faststart',target]
    print('Rendering confrontation and combat revision...',flush=True); run(args)
    run(['-ss','89.5','-i',target,'-t',TOTAL-89.5,'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',ROOT/'ending.mp4'])
    dump('assembly_manifest.json',dict(version=16,total=TOTAL,frames=cursor,fps=60,source_fps="mixed; see source_manifest.json",width=1920,height=1080,shots=timeline,captions=22,fade=[TOTAL-.8,TOTAL],source_speed=1,interpolation=False,freeze_padding=False,opening=[0,38.5],audio='narration.wav',source_v7_preserved=True))

def verify():
    receipts=[]
    for name,seconds in [('final.mp4',TOTAL),('ending.mp4',TOTAL-89.5)]:
        p=ROOT/name
        run(['-i',p,'-f','null','-'])
        info=probe(p)
        v=next(s for s in info['streams'] if s['codec_type']=='video')
        a=next(s for s in info['streams'] if s['codec_type']=='audio')
        assert int(v['nb_frames'])==round(seconds*60)
        assert abs(float(a['duration'])-seconds)<.06
        receipts.append(dict(file=name,duration=seconds,frames=int(v['nb_frames']),bytes=p.stat().st_size,sha256=hashlib.sha256(p.read_bytes()).hexdigest(),audio_codec=a['codec_name'],audio_channels=a['channels'],decode='PASS'))
    ref,actual=pcm(ROOT/'narration.wav'),pcm(ROOT/'final.mp4')
    n=min(len(ref),len(actual)); corr=float(np.corrcoef(ref[:n].ravel(),actual[:n].ravel())[0,1])
    assert corr>.995
    gap=actual[round(96.12*RATE):round(99.96*RATE)]
    gap_rms=float(np.sqrt(np.mean(gap**2))); assert gap_rms<.0001
    times=[60.6,61.6,62.6,82.1,83.5,84.95,85.05,86,87,88.5,89.51,100.5]
    canvas=Image.new('RGB',(1440,4*294),'#111'); draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        raw=subprocess.check_output([str(FF),'-v','error','-ss',str(t),'-i',str(ROOT/'final.mp4'),'-frames:v','1','-vf','scale=480:270','-f','image2pipe','-vcodec','mjpeg','-'])
        x,y=i%3*480,i//3*294
        canvas.paste(Image.open(io.BytesIO(raw)).convert('RGB'),(x,y));draw.text((x+8,y+273),f'{t:.2f}s',fill='white')
    canvas.save(ROOT/'final_contact.jpg',quality=95)
    dump('qa.json',dict(receipts=receipts,audio_correlation=corr,digital_gap_rms=gap_rms,contact_times=times,visual_review='pending',realtime_review=False,listening_review=False))
    shutil.copy2(ROOT/'final.mp4',PROJECT/'대검전사_스토리_총합본.mp4')
    shutil.copy2(ROOT/'ending.mp4',PROJECT/'대검전사_엔딩.mp4')
    shutil.copy2(ROOT/'ending_dialogue.mp3',PROJECT/'대검전사_마지막대사_쉼수정.mp3')
    shutil.copy2(ROOT/'ending_dialogue.mp3',PROJECT/'대검전사_뉴버전_컷별영상/마지막대사_쉼수정.mp3')
    print(json.dumps(dict(receipts=receipts,audio_correlation=corr,gap_rms=gap_rms),ensure_ascii=False),flush=True)

def inspect(name,times,filter_text='scale=480:270',size=(480,270)):
    path=source(name)
    w,h=size
    canvas=Image.new('RGB',(w*3,(h+24)*((len(times)+2)//3)),'#111'); draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        raw=subprocess.check_output([str(FF),'-v','error','-ss',str(t),'-i',str(path),'-frames:v','1','-vf',filter_text,'-f','image2pipe','-vcodec','mjpeg','-'])
        x,y=i%3*w,i//3*(h+24)
        canvas.paste(Image.open(io.BytesIO(raw)).convert('RGB'),(x,y));draw.text((x+8,y+h+3),f'{name} {t:.3f}s',fill='white')
    canvas.save(ROOT/f'{name}_contact.jpg',quality=95)

if __name__=='__main__':
    import sys
    {'render':render,'verify':verify}[sys.argv[1]]()
