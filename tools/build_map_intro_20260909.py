"""30-second caption-free map film from seven current-runtime camera moves."""
import json,subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from PIL import Image,ImageDraw
from capture_map_intro_20260909 import SHOTS,OUT,ROOT

EDIT=OUT/'edit'
FINAL=ROOT/'captures/map_intro_20260909/EXODUSER_MAP_INTRO_30S_1080P60.mp4'

def run(args):
    p=subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,creationflags=subprocess.CREATE_NO_WINDOW)
    if p.returncode:raise RuntimeError(p.stderr.decode('utf-8',errors='replace'))

def segment(item):
    i,s=item;target=EDIT/f'{i:02}.mp4';duration=s['duration']
    run(['-ss',.5,'-i',OUT/(s['name']+'.webm'),'-t',duration,'-an','-vf','fps=60,scale=1920:1080,setsar=1,eq=gamma=1.35:contrast=1.06:saturation=1.04',
         '-frames:v',round(duration*60),'-c:v','libx264','-threads',4,'-preset','fast','-crf',17,'-pix_fmt','yuv420p',target])
    print('Edited '+s['name'],flush=True)
    return target

def main():
    EDIT.mkdir(parents=True,exist_ok=True);FINAL.parent.mkdir(parents=True,exist_ok=True)
    with ThreadPoolExecutor(max_workers=2) as pool:files=list(pool.map(segment,enumerate(SHOTS)))
    title=EDIT/'07.mp4'
    run(['-loop',1,'-framerate',60,'-i',ROOT/'output/imagegen/trailer/steam_title_card_api_v2.png','-t',3.5,
         '-vf','scale=1920:1080,setsar=1,fade=t=in:d=0.25,fade=t=out:st=3:d=0.5',
         '-an','-frames:v',210,'-c:v','libx264','-threads',4,'-preset','fast','-crf',17,'-pix_fmt','yuv420p',title])
    files.append(title)
    (EDIT/'concat.txt').write_text(''.join(f"file '{f.as_posix()}'\n" for f in files),encoding='utf-8')
    run(['-f','concat','-safe',0,'-i',EDIT/'concat.txt','-c','copy',EDIT/'picture.mp4'])
    run(['-i',EDIT/'picture.mp4','-ss',3,'-i',ROOT/'bgm/1장_썩은숲/h0_explore.mp3','-t',30,
         '-vf','drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill,fade=t=in:d=0.25',
         '-af','afade=t=in:d=0.5,afade=t=out:st=27.5:d=2.5,loudnorm=I=-18:TP=-1.5:LRA=9',
         '-map','0:v','-map','1:a','-r',60,'-c:v','libx264','-threads',6,'-preset','medium','-crf',18,
         '-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709',
         '-c:a','aac','-b:a','256k','-ar',48000,'-movflags','+faststart',FINAL])
    timeline=[];t=0
    for s in SHOTS:
        timeline.append(dict(name=s['name'],stage=s['stage'],landmark=s['landmark'],sourceStart=.5,start=t,end=t+s['duration']))
        t+=s['duration']
    timeline.append(dict(name='title',start=t,end=t+3.5))
    assert t+3.5==30
    (OUT/'timeline.json').write_text(json.dumps(timeline,indent=2),encoding='utf-8')
    print(FINAL,flush=True)

if __name__=='__main__':main()
