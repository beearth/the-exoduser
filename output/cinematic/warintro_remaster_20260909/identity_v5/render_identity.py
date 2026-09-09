"""Replace only the two rejected protagonist identities, preserving the v4 clock/audio."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess

import numpy as np
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parent
V4=ROOT.parent/'full_review_v4'
REPO=ROOT.parents[3]
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF=str(BIN/'ffmpeg.exe')
FP=str(BIN/'ffprobe.exe')
os.chdir(ROOT)


def run(args):
    subprocess.run([FF,'-hide_banner','-v','error','-y',*map(str,args)],check=True)


def probe(path):
    return json.loads(subprocess.check_output([FP,'-v','error','-show_streams','-show_format','-of','json',str(path)]))


def dump(name,data):
    Path(name).write_bytes((json.dumps(data,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))


def time_s(value):
    h,m,s=value.replace(',','.').split(':')
    return int(h)*3600+int(m)*60+float(s)


def srt_time(value):
    ms=round(value*1000)
    return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'


def pcm(path):
    return np.frombuffer(subprocess.check_output([FF,'-v','error','-i',str(path),'-vn','-ac','1','-ar','24000','-f','f32le','-']),np.float32)


def render():
    Path('segments').mkdir(exist_ok=True)
    Path('fonts').mkdir(exist_ok=True)
    shutil.copyfile(V4/'fonts/NotoSerifCJKkr-Medium.otf','fonts/NotoSerifCJKkr-Medium.otf')
    shutil.copyfile(V4/'caps.srt','caps.srt')
    shots=[
        dict(id='W09',image='w09_identity.png',frames=270,crop=[0,0,1920,1080],zoom=.025,start_s=46,end_s=50.5),
        dict(id='W10-A',image='w10_identity.png',frames=180,crop=[0,0,1920,1080],zoom=.015,start_s=50.5,end_s=53.5),
        dict(id='W10-B',image='w10_identity.png',frames=150,crop=[150,180,1152,648],zoom=.015,start_s=53.5,end_s=56),
        dict(id='W10-C',image='w10_identity.png',frames=240,crop=[600,0,1296,729],zoom=.020,start_s=56,end_s=60),
    ]
    for shot in shots:
        x,y,w,h=shot['crop'];n=shot['frames']
        vf=(f'scale=1920:1080:flags=lanczos,crop={w}:{h}:{x}:{y},scale=3840:2160:flags=lanczos,'
            f"zoompan=z='1+{shot['zoom']}*on/{n-1}':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=1:s=1920x1080:fps=60,setsar=1")
        print('Rendering',shot['id'],flush=True)
        run(['-loop',1,'-framerate',60,'-i',shot['image'],'-vf',vf,'-frames:v',n,'-an',
             '-c:v','libx264','-preset','fast','-crf',18,'-threads',4,'-pix_fmt','yuv420p',f"segments/{shot['id']}.mp4"])
    Path('segments/list.txt').write_bytes(''.join(f"file '{s['id']}.mp4'\n" for s in shots).encode())
    run(['-f','concat','-safe',0,'-i','segments/list.txt','-c','copy','replacement_clean.mp4'])
    cues=[]
    source=Path('caps.srt').read_text(encoding='utf-8')
    for block in source.strip().split('\n\n'):
        lines=block.splitlines()
        start,end=map(time_s,lines[1].split(' --> '))
        if 46<=start<60:
            cues.append(f"{len(cues)+1}\n{srt_time(start-46)} --> {srt_time(end-46)}\n"+'\n'.join(lines[2:]))
    assert len(cues)==4
    Path('replacement.srt').write_bytes(('\n\n'.join(cues)+'\n').encode('utf-8'))
    style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'
    run(['-i','replacement_clean.mp4','-vf',f"subtitles=replacement.srt:fontsdir=fonts:force_style='{style}'",
         '-c:v','libx264','-preset','fast','-crf',18,'-threads',4,'-pix_fmt','yuv420p','-an','replacement.mp4'])
    print('Rendering full story; copying original audio stream',flush=True)
    fc=('[0:v]split=2[a][b];[a]trim=end=46,setpts=PTS-STARTPTS[head];'
        '[b]trim=start=60:end=101,setpts=PTS-STARTPTS[tail];'
        '[1:v]setpts=PTS-STARTPTS[middle];[head][middle][tail]concat=n=3:v=1:a=0[v]')
    run(['-i',V4/'final.mp4','-i','replacement.mp4','-filter_complex_threads',4,'-filter_complex',fc,
         '-map','[v]','-map','0:a','-t',101,'-r',60,'-c:v','libx264','-preset','fast','-crf',19,
         '-threads',4,'-pix_fmt','yuv420p','-c:a','copy','-movflags','+faststart','final.mp4'])
    run(['-ss',44,'-i','final.mp4','-t',18,'-c:v','libx264','-preset','fast','-crf',19,'-threads',4,
         '-c:a','aac','-b:a','192k','-movflags','+faststart','identity_review.mp4'])
    manifest=json.loads((V4/'manifest.json').read_text(encoding='utf-8'))
    manifest.update(version=5,revision='Canonical game warrior identity for W09 and W10',replacement_range_s=[46,60],
        identity_reference=['assets/charselect/warrior_cut.png','assets/charselect/poster_idle_warrior_higgsfield.jpg'],
        motion='New identity-corrected stills, restrained camera zoom, original four cuts; no newly generated body animation',
        identity_shots=shots,audio='v4 AAC stream copied unchanged')
    dump('manifest.json',manifest)


def verify():
    receipts={}
    for name,duration,frames in [('replacement.mp4',14,840),('final.mp4',101,6060),('identity_review.mp4',18,1080)]:
        info=probe(name);v=next(s for s in info['streams'] if s['codec_type']=='video')
        assert (v['width'],v['height'],v['r_frame_rate'],int(v['nb_frames']))==(1920,1080,'60/1',frames),v
        assert abs(float(v['duration'])-duration)<.02
        run(['-i',name,'-f','null','-'])
        receipts[name]=dict(duration_s=duration,frames=frames,bytes=Path(name).stat().st_size)
    before,after=pcm(V4/'final.mp4'),pcm('final.mp4')
    assert len(before)==len(after) and np.array_equal(before,after),'Original narration must be sample-identical'
    assert Path('caps.srt').read_bytes()==(V4/'caps.srt').read_bytes()
    Path('frames').mkdir(exist_ok=True)
    times=[45.5,46,48,50.483333,50.5,52,53.483333,53.5,55,55.983333,56,58,59.983333,60,61]
    canvas=Image.new('RGB',(1440,294*5),'#101010');draw=ImageDraw.Draw(canvas)
    for i,t in enumerate(times):
        dest=f'frames/{i:02d}_{t:.3f}.jpg'
        run(['-ss',t,'-i','final.mp4','-frames:v',1,'-update',1,dest])
        with Image.open(dest) as im:
            x,y=i%3*480,i//3*294
            canvas.paste(im.resize((480,270)),(x,y));draw.text((x+8,y+274),f'{t:.3f}s',fill='white')
    canvas.save('contact.jpg',quality=94)
    qa=dict(receipts=receipts,full_decode_pass=True,narration_pcm_sample_identical_v4=True,
        captions_byte_identical_v4=True,caption_count=21,edited_cues=4,replaced_range_s=[46,60],
        preserved_ending_range_s=[89.5,101],question_pause_s=3.7,visual_review_pending=True,
        realtime_audio_approval=False)
    dump('qa.json',qa)
    print(json.dumps(qa,indent=2),flush=True)


if __name__=='__main__':
    import sys
    {'render':render,'verify':verify}[sys.argv[1]]()
