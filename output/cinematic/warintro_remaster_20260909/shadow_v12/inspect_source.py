import hashlib,io,json,os,subprocess,sys
from pathlib import Path
from PIL import Image,ImageDraw
P=Path(__file__).resolve().parent
BIN=Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin'
FF,FP=BIN/'ffmpeg.exe',BIN/'ffprobe.exe'
name=sys.argv[1];src=P/f'{name}.mp4'
times=[0,.4,.8,1.2,1.6,2,2.6,3.4,4.45]
subprocess.run([str(FF),'-v','error','-i',str(src),'-f','null','-'],check=True)
meta=json.loads(subprocess.check_output([str(FP),'-v','error','-show_streams','-of','json',str(src)]))
v=next(s for s in meta['streams'] if s['codec_type']=='video')
assert (v['width'],v['height'])==(1916,1080)
assert float(v['duration'])>max(times)
canvas=Image.new('RGB',(1152,720),'#111');draw=ImageDraw.Draw(canvas)
for i,t in enumerate(times):
    raw=subprocess.check_output([str(FF),'-v','error','-ss',str(t),'-i',str(src),'-frames:v','1','-vf','scale=384:216','-f','image2pipe','-vcodec','mjpeg','-'])
    x,y=i%3*384,i//3*240;canvas.paste(Image.open(io.BytesIO(raw)),(x,y));draw.text((x+8,y+218),str(t)+'s',fill='white')
canvas.save(P/f'{name}_contact.jpg',quality=95)
qpath=P/'source_qa.json';q=json.loads(qpath.read_text()) if qpath.exists() else {}
q[name]=dict(duration=float(v['duration']),frames=int(v['nb_frames']),fps=v['r_frame_rate'],width=v['width'],height=v['height'],bytes=src.stat().st_size,sha256=hashlib.sha256(src.read_bytes()).hexdigest(),decode='PASS',sample_times=times,visual_review='pending',realtime_review=False)
qpath.write_bytes((json.dumps(q,ensure_ascii=False,indent=2)+'\n').encode('utf-8'))
print(json.dumps(q[name]))
