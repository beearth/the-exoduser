"""Build a separate five-second W12 direction review, not the v10 final."""
import hashlib,io,json,os,shutil,subprocess
from pathlib import Path
from PIL import Image,ImageDraw
P=Path(__file__).resolve().parent
PROJECT=P.parents[3]
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF,FP=BIN/'ffmpeg.exe',BIN/'ffprobe.exe'
def run(args): subprocess.run([str(FF),'-hide_banner','-v','error','-y',*map(str,args)],cwd=P,check=True)
def probe(p):return json.loads(subprocess.check_output([str(FP),'-v','error','-show_streams','-show_format','-of','json',str(p)]))
src=P/'w12_hell.mp4'
run(['-i',src,'-f','null','-'])
v=next(s for s in probe(src)['streams'] if s['codec_type']=='video')
assert (v['width'],v['height'])==(1916,1080)
assert float(v['duration'])>=5
(P/'preview.srt').write_bytes('1\n00:00:00,500 --> 00:00:02,010\n그리고 지옥에 떨어진다.\n'.encode('utf-8'))
target=P/'hell_direction_preview.mp4'
run(['-i',src,'-ss','65.5','-i',P.parent/'ending_last_shot_v9/narration.wav','-filter_complex',"[0:v]pad=1920:1080:2:0:black,fps=60,trim=end_frame=300,subtitles=preview.srt:fontsdir=../full_review_v4/fonts:force_style='FontName=Noto Serif CJK KR,FontSize=13,MarginV=32,Outline=0.6,Shadow=0.4'[v]",'-map','[v]','-map','1:a:0','-t','5','-c:v','libx264','-preset','fast','-crf','18','-threads','4','-c:a','aac','-b:a','192k','-movflags','+faststart',target])
run(['-i',target,'-f','null','-'])
times=[0,.5,1,1.5,2,2.5,3,3.5,4.45]
canvas=Image.new('RGB',(1440,882),'#111');draw=ImageDraw.Draw(canvas)
for i,t in enumerate(times):
    raw=subprocess.check_output([str(FF),'-v','error','-ss',str(t),'-i',str(target),'-frames:v','1','-vf','scale=480:270','-f','image2pipe','-vcodec','mjpeg','-'])
    x,y=i%3*480,i//3*294
    canvas.paste(Image.open(io.BytesIO(raw)),(x,y));draw.text((x+8,y+273),str(t)+'s',fill='white')
canvas.save(P/'hell_contact.jpg',quality=95)
q=dict(source_duration=float(v['duration']),source_frames=int(v['nb_frames']),source_fps=v['r_frame_rate'],width=v['width'],height=v['height'],source_bytes=src.stat().st_size,source_sha256=hashlib.sha256(src.read_bytes()).hexdigest(),preview_seconds=5,preview_frames=300,source_decode='PASS',preview_decode='PASS',visual_review='pending',realtime_review=False,listening_review=False,not_full_v10=True)
(P/'hell_qa.json').write_bytes((json.dumps(q,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
shutil.copy2(target,PROJECT/'대검전사_지옥_새연출_시안.mp4')
print(json.dumps(q,ensure_ascii=False))
