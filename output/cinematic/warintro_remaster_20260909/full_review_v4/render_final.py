import json,os,shutil,subprocess,zipfile
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path.cwd(); OLD=Path("/home/user/warintro_recut_v3")
def run(a): return subprocess.run(a,check=True)
def get(url,p):
 if not Path(p).exists(): run(["curl","-fLsS",url,"-o",str(p)])
def probe(p): return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(p)]))
def pcm(p): return np.frombuffer(subprocess.check_output(["ffmpeg","-v","error","-i",str(p),"-ac","1","-ar","24000","-f","f32le","-"]),np.float32)
cfg=json.loads(Path("inputs.json").read_text())
SRC=OLD/"clean.mp4"
if not SRC.exists():
 SRC=ROOT/"source_v3.mp4";get(cfg["v3_clean_url"],SRC)
if not (OLD/"caps.srt").exists():
 get(cfg["v3_package_url"],"v3.zip")
 with zipfile.ZipFile("v3.zip") as z:
  for n in ["caps.srt","manifest.json"]:z.extract(n,"v3_metadata")
 OLD=ROOT/"v3_metadata"
get(cfg["smooth_hq_url"],"smooth_hq.mp4")
get(cfg["escape_hq_url"],"escape_hq.mp4")
for f in ["smooth_hq.mp4","escape_hq.mp4"]:
 e=probe(f);v=next(s for s in e["streams"] if s["codec_type"]=="video")
 assert v["width"]==1920 and v["height"]==1080 and v["r_frame_rate"]=="60/1",(f,v)
run(["ffmpeg","-v","error","-y","-i",str(SRC),"-t","89.5","-an","-c:v","copy","head.mp4"])
run(["ffmpeg","-v","error","-y","-i",str(SRC),"-vn","-af","apad=whole_dur=101","-t","101","-c:a","pcm_s24le","narration.wav"])
run(["ffmpeg","-v","error","-y","-i","smooth_hq.mp4","-i","escape_hq.mp4","-filter_complex","[0:v]trim=duration=6.5,setpts=PTS-STARTPTS,setsar=1[a];[1:v]trim=duration=5,setpts=PTS-STARTPTS,setsar=1[b];[a][b]concat=n=2:v=1:a=0,fade=t=out:st=10.7:d=0.8[v]","-map","[v]","-an","-t","11.5","-r","60","-c:v","libx264","-crf","16","-threads","4","-pix_fmt","yuv420p","ending_faded.mp4"])
jsx='''import {writeFileSync} from "node:fs";
export default async ({project})=>{
 const p=await project({dir:"edit-project",size:"1920x1080",fps:60,background:"#000000"});
 const head=await p.add('''+json.dumps(str(ROOT/"head.mp4"))+''');
 const ending=await p.add('''+json.dumps(str(ROOT/"ending_faded.mp4"))+''');
 p.cut(head,{from:0,dur:89.5,at:0,fit:"cover"});
 p.cut(ending,{from:0,dur:11.5,at:89.5,fit:"cover"});
 const voice=await p.add('''+json.dumps(str(ROOT/"narration.wav"))+''');
 writeFileSync('''+json.dumps(str(ROOT/"voice_id.txt"))+''',voice.id);
};'''
Path("edit.jsx").write_text(jsx)
run(["higgsedit","build","edit.jsx"])
run(["higgsedit","do","edit-project","place","--assetId",Path("voice_id.txt").read_text(),"--at","0","--duration","101"])
run(["higgsedit","render","edit-project","--out","renders/clean.mp4","--depth","8","--bitrate","16M","--shards","1","--concurrency","1"])
shutil.copyfile("edit-project/renders/clean.mp4","clean.mp4")
shutil.copyfile(OLD/"caps.srt","caps.srt")
Path("fonts").mkdir(exist_ok=True)
get("https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/Korean/NotoSerifCJKkr-Medium.otf","fonts/NotoSerifCJKkr-Medium.otf")
WF=Path(os.environ["HF_WORKFLOWS"])/"subtitles/scripts"
run(["bash",str(WF/"burn_caps_clean.sh"),"--in","clean.mp4","--srt","caps.srt","--out","final.mp4","--font","Noto Serif CJK KR","--fontsdir","fonts","--fontsize","13","--marginv","32","--outline","0.6","--shadow","0.4","--no-caps"])
run(["ffmpeg","-v","error","-y","-ss","89.5","-i","final.mp4","-t","11.5","-c:v","libx264","-crf","17","-threads","4","-c:a","aac","-b:a","192k","ending_final.mp4"])
a=pcm(SRC);b=pcm("final.mp4");n=min(len(a),len(b));corr=float(np.corrcoef(a[:n],b[:n])[0,1]);assert corr>.995
pause=b[int(91.5*24000):int(94.9*24000)];pause_rms=float(np.sqrt(np.mean(pause**2)));assert pause_rms<.0001
receipts={}
for name,dur in [("final.mp4",101),("clean.mp4",101),("ending_final.mp4",11.5)]:
 p=probe(name);vs=next(s for s in p["streams"] if s["codec_type"]=="video");au=next(s for s in p["streams"] if s["codec_type"]=="audio")
 assert abs(float(p["format"]["duration"])-dur)<.06,(name,p["format"]["duration"])
 assert vs["width"]==1920 and vs["height"]==1080 and vs["r_frame_rate"]=="60/1"
 assert abs(float(au["duration"])-float(vs["duration"]))<.2
 run(["ffmpeg","-v","error","-i",name,"-f","null","-"])
 receipts[name]={"bytes":Path(name).stat().st_size,"duration_s":float(p["format"]["duration"]),"fps":vs["r_frame_rate"],"frames":vs.get("nb_frames"),"audio_duration_s":float(au["duration"])}
m=json.loads((OLD/"manifest.json").read_text())
m.update(version=4,duration_s=101,size="1920x1080",fps=60,editorial_cut_count=28,revision="New escape closing cut and motion-interpolated 1080p60 ending",enhanced_range_s=[89.5,101],fade_s=[100.2,101])
for s in m["editorial_shots"]:
 s["start_s"]=s["start_frame"]/24;s["end_s"]=s["end_frame"]/24
 s["start_frame"]=round(s["start_s"]*60);s["end_frame"]=round(s["end_s"]*60)
 if s["id"]=="W16-B":s["end_frame"]=5703;s["end_s"]=95.05
 if s["id"]=="W16-C":s.update(start_frame=5703,end_frame=5760,start_s=95.05,end_s=96)
m["editorial_shots"].append({"id":"W16-D","start_frame":5760,"end_frame":6060,"start_s":96,"end_s":101,"label":"Escape path; rear-facing warrior; new generated cut"})
m["source_segments_v3"]=m.pop("segments")
m["segments"]=[{"source":"V3 clean","at_s":0,"duration_s":89.5},{"source":"ending_faded.mp4","at_s":89.5,"duration_s":11.5}]
Path("manifest.json").write_text(json.dumps(m,ensure_ascii=False,indent=2))
Path("frames").mkdir(exist_ok=True)
times=[90.5,91.4833,91.5,93.0,95.0333,95.05,95.7,95.9833,96.0,96.25,97.5,99.5,100.2,100.6,100.9833]
sheet=Image.new("RGB",(1920,382*5),"#101010");draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
 fp=f"frames/{i:02d}_{t:.3f}.jpg"
 run(["ffmpeg","-v","error","-y","-ss",str(t),"-i","final.mp4","-frames:v","1","-update","1",fp])
 im=Image.open(fp).convert("RGB")
 if t<100.8:assert np.asarray(im).mean()>2
 x=i%3*640;y=i//3*382
 sheet.paste(im.resize((640,360)),(x,y));draw.text((x+8,y+365),f"{t:.3f}s",fill="white")
sheet.save("contact.jpg",quality=94)
cadence=[]
raw=subprocess.check_output(["ffmpeg","-v","error","-i","ending_final.mp4","-vf","scale=320:180,format=gray","-f","rawvideo","-"])
frames=np.frombuffer(raw,np.uint8).reshape(-1,180,320).astype(np.float32)
for label,lo,hi in [("A",0,120),("B",120,333),("C",333,390),("D",390,642)]:
 delta=np.abs(np.diff(frames[lo:hi],axis=0)).mean(axis=(1,2))
 cadence.append({"shot":label,"frame_range":[lo,hi],"near_duplicate_lt_0_25":int((delta<.25).sum()),"transitions":len(delta),"changed_frames_hz":float((delta>=.25).sum()/((hi-lo)/60)),"mean_mad":float(delta.mean())})
qa={"ending_cadence":cadence,"duration_s":101,"fps":60,"size":"1920x1080","editorial_cut_count":28,"caption_count":21,"full_decode_pass":True,"narration_pcm_correlation":corr,"question_pause_s":3.7,"pause_rms":pause_rms,"caps_byte_identical_v3":Path("caps.srt").read_bytes()==(OLD/"caps.srt").read_bytes(),"source_ending_cadence_hz":4.32,"true_interpolation_range_s":[89.5,101],"earlier_cadence":"V3 24fps retained in 60fps export","fade_s":[100.2,101],"receipts":receipts,"visual_review_pending":True,"realtime_listen_review":False}
Path("qa.json").write_text(json.dumps(qa,indent=2))
with zipfile.ZipFile("package.zip","w",zipfile.ZIP_DEFLATED,compresslevel=2) as z:
 for n in ["ending_final.mp4","manifest.json","qa.json","caps.srt","edit.jsx","render_final.py","inputs.json","contact.jpg"]:z.write(n)
 for p in Path("frames").glob("*.jpg"):z.write(p)
print(json.dumps(qa))
