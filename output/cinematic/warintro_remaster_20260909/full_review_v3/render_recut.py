import json,os,shutil,subprocess,zipfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import numpy as np
from PIL import Image,ImageDraw
ROOT=Path.cwd();SRC=Path("/home/user/warintro_pause_v2/clean.mp4")
OLD=SRC.parent
WF=Path(os.environ["HF_WORKFLOWS"])/"subtitles/scripts"
plan=json.loads(Path("shot_plan.json").read_text())
def run(a):return subprocess.run(a,check=True)
def pcm(p):return np.frombuffer(subprocess.check_output(["ffmpeg","-v","error","-i",str(p),"-ac","1","-ar","24000","-f","f32le","-"]),dtype=np.float32)
def probe(p):return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(p)]))
Path("clips").mkdir(exist_ok=True)
run(["ffmpeg","-v","error","-i",str(SRC),"-t","50.5","-an","-c:v","copy","clips/head.mp4"])
run(["ffmpeg","-v","error","-i",str(SRC),"-vn","-c:a","pcm_s24le","narration.wav"])
def crop(s):
 x,y,w,h=s["crop"];dur=(s["end_frame"]-s["start_frame"])/24
 run(["ffmpeg","-v","error","-ss",str(s["source_start_s"]),"-i",str(SRC),"-t",str(dur),"-an","-vf",f"crop={w}:{h}:{x}:{y},scale=1280:720:flags=lanczos,setsar=1","-r","24","-c:v","libx264","-threads","2","-crf","17","-pix_fmt","yuv420p","clips/"+s["id"]+".mp4"])
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(crop,plan["shots"]))
lines=['import {writeFileSync} from "node:fs";','export default async ({project})=>{','const p=await project({dir:"edit-project",size:"1280x720",fps:24,background:"#000000"});',f'const head=await p.add({json.dumps(str(ROOT/"clips/head.mp4"))});','p.cut(head,{from:0,dur:50.5,at:0,fit:"cover"});']
for i,s in enumerate(plan["shots"]):
 lines += [f'const v{i}=await p.add({json.dumps(str(ROOT/"clips"/(s["id"]+".mp4")))});',f'p.cut(v{i},{{from:0,dur:{(s["end_frame"]-s["start_frame"])/24},at:{s["start_frame"]/24},fit:"cover"}});']
lines += [f'const voice=await p.add({json.dumps(str(ROOT/"narration.wav"))});',f'writeFileSync({json.dumps(str(ROOT/"voice_id.txt"))},voice.id);','};']
Path("edit.jsx").write_text("\n".join(lines))
run(["higgsedit","build","edit.jsx"])
run(["higgsedit","do","edit-project","place","--assetId",Path("voice_id.txt").read_text(),"--at","0","--duration","99"])
run(["higgsedit","render","edit-project","--out","renders/clean.mp4","--depth","8","--bitrate","8M","--shards","1","--concurrency","1"])
shutil.copyfile("edit-project/renders/clean.mp4","clean.mp4")
shutil.copyfile(OLD/"caps.srt","caps.srt")
Path("fonts").mkdir(exist_ok=True);shutil.copyfile(OLD/"fonts/NotoSerifCJKkr-Medium.otf","fonts/NotoSerifCJKkr-Medium.otf")
run(["bash",str(WF/"burn_caps_clean.sh"),"--in","clean.mp4","--srt","caps.srt","--out","final.mp4","--font","Noto Serif CJK KR","--fontsdir","fonts","--fontsize","13","--marginv","32","--outline","0.6","--shadow","0.4","--no-caps"])
run(["ffmpeg","-v","error","-ss","50.5","-i","final.mp4","-t","48.5","-c:v","libx264","-crf","18","-c:a","aac","-b:a","192k","review_tail.mp4"])
a=pcm(SRC);b=pcm("final.mp4");n=min(len(a),len(b));corr=float(np.corrcoef(a[:n],b[:n])[0,1]);assert corr>.995,corr
receipts={}
for name,dur in [("final.mp4",99),("clean.mp4",99),("review_tail.mp4",48.5)]:
 p=probe(name);assert abs(float(p["format"]["duration"])-dur)<.06
 run(["ffmpeg","-v","error","-i",name,"-f","null","-"])
 receipts[name]={"bytes":Path(name).stat().st_size,"duration_s":float(p["format"]["duration"])}
m=json.loads((OLD/"manifest.json").read_text());m["version"]=3;m["editorial_cut_count"]=27;m["editorial_shots"]=plan["shots"];m["revision"]="Split later scenes by expression, subject and narration"
assert len(m["captions"])==21
Path("manifest.json").write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding="utf-8")
Path("frames").mkdir(exist_ok=True)
def frame(name,t):
 p=Path("frames")/(name+".jpg")
 run(["ffmpeg","-v","error","-ss",str(t),"-i","final.mp4","-frames:v","1","-update","1",str(p)])
 return p
sheet=Image.new("RGB",(1920,382*6),"#101010");draw=ImageDraw.Draw(sheet)
boundary_means=[]
for i,s in enumerate(plan["shots"]):
 t=(s["start_frame"]+s["end_frame"])/48
 im=Image.open(frame(s["id"]+"_mid",t)).convert("RGB")
 x=i%3*640;y=i//3*382;sheet.paste(im.resize((640,360)),(x,y));draw.text((x+6,y+365),s["id"]+f" {t:.2f}s",fill="white")
 for suffix,fr in [("start",s["start_frame"]),("end",s["end_frame"]-1)]:
  im=Image.open(frame(s["id"]+"_"+suffix,fr/24)).convert("RGB");mean=float(np.asarray(im).mean())
  if fr<2375:assert mean>2,(s["id"],suffix,mean)
  boundary_means.append({"shot":s["id"],"frame":fr,"mean":mean})
sheet.save("contact.jpg",quality=95)
qa={"duration_s":99,"original_scene_count":16,"editorial_cut_count":27,"new_tail_shots":18,"caption_count":21,"narration_pcm_correlation":corr,"captions_byte_identical_to_v2":Path("caps.srt").read_bytes()==(OLD/"caps.srt").read_bytes(),"full_decode_pass":True,"frame_boundary_checks":boundary_means,"receipts":receipts,"question_pause_s":3.7,"fade_s":[98.2,99],"visual_review_pending":True,"human_audio_approval":False}
Path("qa.json").write_text(json.dumps(qa,indent=2))
with zipfile.ZipFile("package.zip","w",zipfile.ZIP_DEFLATED,compresslevel=2) as z:
 for name in ["final.mp4","review_tail.mp4","caps.srt","manifest.json","shot_plan.json","qa.json","contact.jpg","edit.jsx","render_recut.py"]:z.write(name)
 for p in Path("frames").glob("*.jpg"):z.write(p,p.as_posix())
print(json.dumps({k:qa[k] for k in ["duration_s","editorial_cut_count","narration_pcm_correlation","captions_byte_identical_to_v2","full_decode_pass"]}))

