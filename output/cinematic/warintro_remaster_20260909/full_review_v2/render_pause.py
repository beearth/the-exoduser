import json, os, shutil, subprocess, wave, zipfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
ROOT=Path.cwd()
OLD=Path("/home/user/warintro_full_review_20260909")
END=Path("/home/user/warintro_batch_w16_v2")
WF=Path(os.environ["HF_WORKFLOWS"])/"subtitles/scripts"
def run(args,**kw):return subprocess.run(args,check=True,**kw)
def probe(p):return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(p)]))
def pcm(p,at=0,dur=None):
    a=["ffmpeg","-v","error","-i",str(p),"-ss",str(at)]
    if dur is not None:a+=["-t",str(dur)]
    return np.frombuffer(subprocess.check_output(a+["-ac","1","-ar","48000","-f","f32le","-"]),dtype=np.float32)
def stamp(s):
    n=round(s*1000)
    return f"{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}"
def srt(caps):
    return "\n".join(f"{i+1}\n{stamp(c['start_s'])} --> {stamp(c['end_s'])}\n{c['ko']}\n" for i,c in enumerate(caps))
shutil.copyfile(END/"voice.mp3","original_voice.mp3")
voice=pcm("original_voice.mp3")
split=round(1.65*48000)
out=np.concatenate([voice[:split],np.zeros(3*48000,dtype=np.float32),voice[split:]])
with wave.open("voice_pause.wav","wb") as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000);w.writeframes((np.clip(out,-1,1)*32767).astype("<i2").tobytes())
run(["ffmpeg","-v","error","-i",str(END/"source.mp4"),"-an","-vf","setpts=1.66666666666667*PTS,fps=24,tpad=stop_mode=clone:stop_duration=0.1","-t","10","-c:v","libx264","-crf","17","-pix_fmt","yuv420p","ending_source.mp4"])
jsx='''import {writeFileSync} from "node:fs";
export default async ({project})=>{
 const p=await project({dir:"ending-project",size:"1280x720",fps:24,background:"#000000"});
 const v=await p.add(%s);const a=await p.add(%s);
 p.cut(v,{from:0,dur:10,at:0,fit:"cover"});
 writeFileSync(%s,a.id);
};'''%(json.dumps(str(ROOT/"ending_source.mp4")),json.dumps(str(ROOT/"voice_pause.wav")),json.dumps(str(ROOT/"voice_id.txt")))
Path("ending.jsx").write_text(jsx)
run(["higgsedit","build","ending.jsx"])
run(["higgsedit","do","ending-project","place","--assetId",Path("voice_id.txt").read_text(),"--at","1","--duration",str(len(out)/48000)])
run(["higgsedit","render","ending-project","--out","renders/clean.mp4","--depth","8","--bitrate","8M","--shards","1","--concurrency","1"])
run(["ffmpeg","-v","error","-i","ending-project/renders/clean.mp4","-vf","fade=t=out:st=9.2:d=0.8","-c:v","libx264","-crf","17","-c:a","copy","ending_clean.mp4"])
m=json.loads((OLD/"manifest.json").read_text())
m["version"]=2;m["duration_s"]=99;m["revision"]="Question pause and ending hold"
last=m["segments"][-1]
last.update({"folder":"full_review_v2","source_duration_s":10,"duration_s":9.5,"voice_duration_s":len(out)/48000,"audio_pause_added_s":3,"audio_split_source_s":1.65,"ending_fade_local_s":[9.2,10]})
m["captions"][-2]["end_s"]=94.25
m["captions"][-1]["start_s"]+=3
m["captions"][-1]["end_s"]+=3
last["clean_url"] = 'https://d2ol7oe51mr4n9.cloudfront.net/user_3G1zto9sz11Uf3iEOhJefE9HdGG/af8fcf75-68bf-4132-94c5-e8b8f5a4b8d1.mp4'
Path("manifest.json").write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
Path("caps.srt").write_text(srt(m["captions"]),encoding="utf-8")
ec=[dict(c,start_s=c["start_s"]-89,end_s=c["end_s"]-89) for c in m["captions"][-2:]]
Path("ending_caps.srt").write_text(srt(ec),encoding="utf-8")
jsx='''export default async ({project})=>{
 const p=await project({dir:"full-project",size:"1280x720",fps:24,background:"#000000"});
 const head=await p.add(%s);const end=await p.add(%s);
 p.cut(head,{from:0,dur:89.5,at:0,fit:"cover"});
 p.cut(end,{from:0.5,dur:9.5,at:89.5,fit:"cover"});
};'''%(json.dumps(str(OLD/"clean.mp4")),json.dumps(str(ROOT/"ending_clean.mp4")))
Path("full.jsx").write_text(jsx)
run(["higgsedit","build","full.jsx"])
run(["higgsedit","render","full-project","--out","renders/clean.mp4","--depth","8","--bitrate","8M","--shards","1","--concurrency","1"])
shutil.copyfile("full-project/renders/clean.mp4","clean.mp4")
Path("fonts").mkdir(exist_ok=True)
shutil.copyfile(OLD/"fonts/NotoSerifCJKkr-Medium.otf","fonts/NotoSerifCJKkr-Medium.otf")
for inp,cap,target in [("clean.mp4","caps.srt","final.mp4"),("ending_clean.mp4","ending_caps.srt","ending_final.mp4")]:
    run(["bash",str(WF/"burn_caps_clean.sh"),"--in",inp,"--srt",cap,"--out",target,"--font","Noto Serif CJK KR","--fontsdir","fonts","--fontsize","13","--marginv","32","--outline","0.6","--shadow","0.4","--no-caps"])
def correlation(a,b):
    n=min(len(a),len(b));return float(np.corrcoef(a[:n],b[:n])[0,1])
headcorr=correlation(pcm(OLD/"clean.mp4",0,89.5),pcm("final.mp4",0,89.5))
qcorr=correlation(voice[:split],pcm("final.mp4",90,1.65))
ccorr=correlation(voice[split:],pcm("final.mp4",94.65,len(voice[split:])/48000))
assert min(headcorr,qcorr,ccorr)>.95,(headcorr,qcorr,ccorr)
silence=pcm("final.mp4",92,2.3)
rms=float(np.sqrt(np.mean(silence**2)))
assert rms<.0001,rms
receipts={}
for name,duration in [("final.mp4",99),("clean.mp4",99),("ending_final.mp4",10),("ending_clean.mp4",10)]:
    p=probe(name);assert abs(float(p["format"]["duration"])-duration)<.05
    run(["ffmpeg","-v","error","-i",name,"-f","null","-"])
    receipts[name]={"bytes":Path(name).stat().st_size,"duration_s":float(p["format"]["duration"])}
assert m["captions"][:-2]==json.loads((OLD/"manifest.json").read_text())["captions"][:-2]
assert len(m["captions"])==21 and len({c["id"] for c in m["captions"]})==21
times=[89.5,90.6,92.4,94.1,94.6,95.6,97.5,98.5,98.958333]
sheet=Image.new("RGB",(1920,382*3),"#101010")
draw=ImageDraw.Draw(sheet)
for i,t in enumerate(times):
    name=f"frame{i}.jpg"
    run(["ffmpeg","-v","error","-ss",str(t),"-i","final.mp4","-frames:v","1","-update","1",name])
    im=Image.open(name).convert("RGB")
    if i==len(times)-1:assert np.asarray(im).mean()<3
    x=i%3*640;y=i//3*382
    sheet.paste(im.resize((640,360)),(x,y));draw.text((x+6,y+365),f"{t:.2f}s",fill="white")
sheet.save("contact.jpg",quality=95)
qa={"duration_s":99,"scene_count":16,"caption_count":21,"ending_duration_s":10,"question_spoken_end_s":91.34,"command_spoken_start_s":95.04,"question_to_command_gap_s":3.70,"silence_added_s":3,"question_caption_s":[90,94.25],"command_caption_s":[95.04,96.63],"end_hold_after_caption_s":2.37,"fade_s":[98.2,99],"unchanged_head_pcm_correlation":headcorr,"question_pcm_correlation":qcorr,"command_pcm_correlation":ccorr,"pause_rms":rms,"full_decode_pass":True,"receipts":receipts,"human_audio_approval":False,"visual_review_pending":True}
Path("qa.json").write_text(json.dumps(qa,indent=2))
with zipfile.ZipFile("package.zip","w",zipfile.ZIP_DEFLATED,compresslevel=2) as z:
    for name in ["final.mp4","ending_final.mp4","ending_clean.mp4","voice_pause.wav","original_voice.mp3","caps.srt","ending_caps.srt","manifest.json","qa.json","contact.jpg","render_pause.py","ending.jsx","full.jsx"]:z.write(name)
print(json.dumps(qa))

