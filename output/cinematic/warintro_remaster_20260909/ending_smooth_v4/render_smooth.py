import json,subprocess,zipfile
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
def run(a): return subprocess.run(a,check=True)
def probe(p): return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",p]))
# First 1.8s only. Stretch the sparse ORIGINAL frame timestamps, then synthesize intermediate frames.
# No duplicated-frame movie is used as an input.
vf="trim=start=0:end=1.8,setpts=(PTS-STARTPTS)*5.555555555556,scale=1280:854:flags=lanczos,crop=1280:720:0:67,setsar=1,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:me=epzs:vsbmc=1:scd=none,tpad=stop_mode=clone:stop_duration=1"
run(["ffmpeg","-v","warning","-i","generated.mp4","-vf",vf,"-an","-t","10","-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p","interpolated_full.mp4"])
# Motion interpolation precedes editorial crop cuts so no blending across camera cuts is possible.
fc="[0:v]split=3[a][b][c];[a]trim=start=0.5:end=2.5,setpts=PTS-STARTPTS,crop=960:540:160:0,scale=1280:720:flags=lanczos[aa];[b]trim=start=2.5:end=6.05,setpts=PTS-STARTPTS,crop=640:360:320:360,scale=1280:720:flags=lanczos[bb];[c]trim=start=6.05:end=7,setpts=PTS-STARTPTS,crop=960:540:160:0,scale=1280:720:flags=lanczos[cc];[aa][bb][cc]concat=n=3:v=1:a=0,setsar=1[v]"
run(["ffmpeg","-v","warning","-i","interpolated_full.mp4","-filter_complex",fc,"-map","[v]","-an","-r","60","-t","6.5","-c:v","libx264","-crf","16","-preset","medium","-pix_fmt","yuv420p","-movflags","+faststart","smooth_ending.mp4"])
p=probe("smooth_ending.mp4")
v=p["streams"][0]
assert len(p["streams"])==1 and v["codec_type"]=="video"
assert v["r_frame_rate"]=="60/1" and int(v["nb_frames"])==390
assert abs(float(v["duration"])-6.5)<.02
run(["ffmpeg","-v","error","-i","smooth_ending.mp4","-f","null","-"])
r=subprocess.check_output(["ffmpeg","-v","error","-i","smooth_ending.mp4","-vf","scale=320:180","-pix_fmt","gray","-f","rawvideo","-"])
x=np.frombuffer(r,np.uint8).reshape(-1,180,320).astype(np.float32)
segments=[]
for name,a,b in [("A",0,120),("B",120,333),("C",333,390)]:
 d=np.abs(np.diff(x[a:b],axis=0)).mean(axis=(1,2))
 segments.append({"shot":name,"frame_start":a,"frame_end":b,"duration_s":(b-a)/60,"mean_luma_mad":float(d.mean()),"median_luma_mad":float(np.median(d)),"near_duplicate_lt_0_1":int((d<.1).sum()),"near_duplicate_lt_0_25":int((d<.25).sum()),"transitions":len(d),"change_gt_0_25_hz":float((d>.25).sum()/((b-a)/60))})
qa={"duration_s":6.5,"fps":60,"frames":390,"width":1280,"height":720,"silent":True,"full_decode_pass":True,"source_original_trim_s":[0,1.8],"source_time_stretch":5.555555555556,"source_reference_offset_s":.5,"absolute_timeline_s":[89.5,96],"absolute_cuts_s":[91.5,95.05],"interpolation":"ffmpeg minterpolate MCI AOBMC bidirectional EPZS VSBMC","segments":segments,"bytes":Path("smooth_ending.mp4").stat().st_size,"visual_review_pending":True,"limitations":["Synthetic intermediate frames; not native high-frame-rate capture.","Upscaling cropped regions cannot restore lost original detail."]}
Path("qa.json").write_text(json.dumps(qa,indent=2))
times=[0,.8,1.983333,2,3.7,5.533333,5.55,6.483333]
sheet=Image.new("RGB",(1280,384*4),"#101010");dr=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 f=f"frame{i}.jpg";run(["ffmpeg","-v","error","-ss",str(t),"-i","smooth_ending.mp4","-frames:v","1","-update","1",f])
 im=Image.open(f).resize((640,360));xx=(i%2)*640;yy=(i//2)*384;sheet.paste(im,(xx,yy));dr.text((xx+8,yy+363),f"{t:.3f}s",fill="white")
sheet.save("contact.jpg",quality=95)
with zipfile.ZipFile("package.zip","w",zipfile.ZIP_DEFLATED,compresslevel=2) as z:
 for name in ["smooth_ending.mp4","qa.json","render_smooth.py","contact.jpg"]:z.write(name)
print(json.dumps(qa,indent=2))
