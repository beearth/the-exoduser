"""Flash wife, parents and children-wagon memories during Remember; exclude rejected shadow cut."""
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
SHOTS=[('w08_witness',7.5),('w09',4.5),('w10a_straight',3),('w10b',2.5),('w10c',4),('w11a_memory',3.5),('w11b_present',2),('w12_fall',4.5),('w13_countless',6.5),('w14_arrival',5.5),('w15a',2.5),('w15b',130/60),('w15c',170/60),('w16a',2),('w16b_armor',3.55),('w16c',4.95),('w16d',3.5)]

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
    return (ROOT if name in {'w11a_memory','w11b_present'} else V11 if name in {'w08_witness','w12_fall','w13_countless','w14_arrival'} else V7)/f'{name}.mp4'

def prepare():
    old=pcm(V7/'narration_v7.wav')
    raw=pcm(ROOT.parent/'ending_weight_v8/weight_of_sin.mp3')
    # Trim only quiet margins, keeping 40ms before and 120ms after detected speech.
    block=480
    energy=np.sqrt(np.mean(raw[:len(raw)//block*block].reshape(-1,block,2)**2,axis=(1,2)))
    active=np.flatnonzero(energy>.003)
    assert len(active)>0
    lo=max(0,int(active[0]*block-.04*RATE))
    hi=min(len(raw),int((active[-1]+1)*block+.12*RATE))
    voice=raw[lo:hi].copy()
    ref=old[round(95.04*RATE):round(96.04*RATE)]
    def voiced_rms(x):
        e=np.sqrt(np.mean(x[:len(x)//block*block].reshape(-1,block,2)**2,axis=(1,2)))
        return float(np.sqrt(np.mean(e[e>.003]**2)))
    gain=min(voiced_rms(ref)/voiced_rms(voice),.95/float(np.max(np.abs(voice))))
    voice*=gain
    fade=round(.005*RATE)
    voice[:fade]*=np.linspace(0,1,fade,dtype=np.float32)[:,None]
    voice[-fade:]*=np.linspace(1,0,fade,dtype=np.float32)[:,None]
    out=np.zeros((round(TOTAL*RATE),2),np.float32)
    split=round(COMMAND_END*RATE)
    out[:split]=old[:split]
    at=round(VOCATIVE_AT*RATE)
    assert at+len(voice)<round((TOTAL-.8)*RATE), 'Lengthen speaker shot deliberately if speech exceeds its available duration'
    out[at:at+len(voice)]=voice
    assert np.array_equal(out[:split],old[:split])
    assert np.max(np.abs(out[split:at]))==0
    sf.write(ROOT/'narration.wav',out,RATE,subtype='FLOAT')
    sf.write(ROOT/'ending_dialogue.wav',out[round(89.5*RATE):],RATE,subtype='FLOAT')
    run(['-i',ROOT/'ending_dialogue.wav','-c:a','libmp3lame','-b:a','192k',ROOT/'ending_dialogue.mp3'])
    caps=json.loads((V7/'captions.json').read_text(encoding='utf-8'))
    caps[-1].update(start_s=VOCATIVE_AT,end_s=102.7,ko='"죄의 무게를 짊어진 자여."',en='"You... who bear the weight of sin."')
    dump('captions.json',caps)
    for name,items,offset in [('caps.srt',caps,0),('ending_dialogue.srt',caps[-3:],89.5)]:
        text='\n\n'.join(f"{i+1}\n{stamp(c['start_s']-offset)} --> {stamp(c['end_s']-offset)}\n{c['ko']}" for i,c in enumerate(items))+'\n'
        (ROOT/name).write_bytes(text.encode('utf-8'))
    dump('voice_manifest.json',dict(text='You... who bear the weight of sin.',ko='죄의 무게를 짊어진 자여.',voice_id='WS6naCm8T4gbyzsLnOjK',model='eleven_multilingual_v2',settings=dict(stability=.65,similarity_boost=.85,style=.35,use_speaker_boost=True),raw_duration=len(raw)/RATE,trim_range=[lo/RATE,hi/RATE],duration=len(voice)/RATE,gain=gain,global_range=[VOCATIVE_AT,VOCATIVE_AT+len(voice)/RATE],digital_gap=[COMMAND_END,VOCATIVE_AT],preserved_pcm_until=COMMAND_END,speed=1,pitch_change=False,total=TOTAL,ending_duration=TOTAL-89.5,captions=22,listening_review=False))
    print((ROOT/'voice_manifest.json').read_text(encoding='utf-8'),flush=True)

def render():
    target=ROOT/'final.mp4'
    assert not target.exists(), 'Preserve existing v13 final before rerendering'
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
    fc.append(''.join(f'[v{i}]' for i in range(18))+f"concat=n=18:v=1:a=0,fade=t=out:st={TOTAL-.8}:d=0.8,subtitles=caps.srt:fontsdir=../full_review_v4/fonts:force_style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'[v]")
    args += ['-filter_complex',';'.join(fc),'-map','[v]','-map','18:a:0','-t',TOTAL,'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-ar',RATE,'-movflags','+faststart',target]
    print('Rendering Remember flashback revision...',flush=True); run(args)
    run(['-ss','89.5','-i',target,'-t',TOTAL-89.5,'-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',ROOT/'ending.mp4'])
    dump('assembly_manifest.json',dict(version=13,total=TOTAL,frames=cursor,fps=60,source_fps=24,width=1920,height=1080,shots=timeline,captions=22,fade=[TOTAL-.8,TOTAL],source_speed=1,interpolation=False,freeze_padding=False,opening=[0,38.5],audio='narration.wav',source_v7_preserved=True))

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
    times=[46.8,60.4,60.53,60.68,60.83,60.97,61.2,63.4,63.6,65.2,66,100.5]
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
    {'prepare':prepare,'render':render,'verify':verify}[sys.argv[1]]()
