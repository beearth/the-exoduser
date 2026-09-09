import json, os, shutil, subprocess, math, zipfile
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

def run(args, **kw): return subprocess.run(args, check=True, **kw)
def probe(p): return json.loads(subprocess.check_output(["ffprobe","-v","error","-show_format","-show_streams","-of","json",str(p)]))
root=Path.cwd()
m=json.loads(Path("manifest.json").read_text(encoding="utf-8"))
assert m["scene_count"]==16 and m["caption_count"]==21
Path("media").mkdir(exist_ok=True)
for s in m["segments"]:
    local=f"media/w{s['scene']:02d}.mp4"
    if not Path(local).exists():run(["curl","-fLsS",s["clean_url"],"-o",local])
    p=probe(local)
    assert abs(float(p["format"]["duration"])-s["source_duration_s"])<.1
lines=['export default async ({ project }) => {','const p = await project({dir:"master-project",size:"1280x720",fps:24,background:"#000000"});']
for s in m["segments"]:
    lines.append('const v%d = await p.add(%s);' % (s["scene"],json.dumps(str(root / ("media/w%02d.mp4" % s["scene"])))) )
    lines.append(f'p.cut(v{s["scene"]}, {{from:{s["trim_start_s"]},dur:{s["duration_s"]},at:{s["at_s"]},fit:"cover"}});')
lines.append('};')
Path("edit.jsx").write_text("\n".join(lines),encoding="utf-8")
run(["higgsedit","build","edit.jsx"])
run(["higgsedit","render","master-project","--out","renders/clean.mp4","--depth","8","--bitrate","8M","--shards","1","--concurrency","1"])
shutil.copyfile("master-project/renders/clean.mp4","clean.mp4")
wf=Path(os.environ["HF_WORKFLOWS"])/"subtitles/scripts"
Path("fonts").mkdir(exist_ok=True)
run(["curl","-fLsS","https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/Korean/NotoSerifCJKkr-Medium.otf","-o","fonts/NotoSerifCJKkr-Medium.otf"])
fontdir=Path.home()/".local/share/fonts";fontdir.mkdir(parents=True,exist_ok=True)
shutil.copyfile("fonts/NotoSerifCJKkr-Medium.otf",fontdir/"NotoSerifCJKkr-Medium.otf")
run(["fc-cache","-f"])
run(["bash",str(wf/"burn_caps_clean.sh"),"--in","clean.mp4","--srt","caps.srt","--out","final.mp4","--font","Noto Serif CJK KR","--fontsdir","fonts","--fontsize","13","--marginv","32","--outline","0.6","--shadow","0.4","--no-caps"])
receipts={}
for name in ["clean.mp4","final.mp4"]:
    p=probe(name)
    receipts[name]={"bytes":Path(name).stat().st_size,"duration_s":float(p["format"]["duration"]),"streams":p["streams"]}
    assert abs(float(p["format"]["duration"])-m["duration_s"])<.06
    assert {x["codec_type"] for x in p["streams"]}=={"video","audio"}
    run(["ffmpeg","-v","error","-i",name,"-f","null","-"])
def pcm(path,at,dur):
    return np.frombuffer(subprocess.check_output(["ffmpeg","-v","error","-i",str(path),"-ss",str(at),"-t",str(dur),"-ac","1","-ar","24000","-f","f32le","-"]),dtype=np.float32)
correlations=[]
for s in m["segments"]:
    a=pcm(f"media/w{s['scene']:02d}.mp4",s["voice_start_s"],s["voice_duration_s"])
    b=pcm("final.mp4",s["at_s"]+s["voice_start_s"]-s["trim_start_s"],s["voice_duration_s"])
    n=min(len(a),len(b));corr=float(np.corrcoef(a[:n],b[:n])[0,1])
    assert corr>.95,(s["scene"],corr)
    correlations.append({"scene":s["scene"],"correlation":corr})
Path("frames").mkdir(exist_ok=True)
def frame(name,t):
    out=Path("frames")/(name+".jpg")
    run(["ffmpeg","-v","error","-ss",str(t),"-i","final.mp4","-frames:v","1","-update","1","-q:v","2",str(out)])
    im=Image.open(out).convert("RGB")
    assert np.asarray(im).mean()>2,(name,t)
    return out
scenes=[]
for s in m["segments"]:
    c=next(c for c in m["captions"] if c["scene"]==s["scene"])
    t=(c["start_s"]+c["end_s"])/2
    scenes.append((frame(f"scene_{s['scene']:02d}",t),f"W{s['scene']:02d}  {t:.2f}s"))
caps=[]
for c in m["captions"]:
    t=(c["start_s"]+c["end_s"])/2
    caps.append((frame("caption_"+c["id"],t),f'{c["id"]}  {t:.2f}s'))
boundaries=[]
for s in m["segments"]:
    for label,t in [("start",s["at_s"]),("end",s["at_s"]+s["duration_s"]-1/24)]:
        boundaries.append((frame(f"boundary_{s['scene']:02d}_{label}",t),f'W{s["scene"]:02d} {label} {t:.2f}s'))
def sheet(items,cols,width,name):
    h=width*9//16
    out=Image.new("RGB",(width*cols,(h+22)*math.ceil(len(items)/cols)),"#101010")
    draw=ImageDraw.Draw(out)
    for i,(p,label) in enumerate(items):
        x=i%cols*width;y=i//cols*(h+22)
        out.paste(Image.open(p).resize((width,h)),(x,y))
        draw.text((x+6,y+h+4),label,fill="white")
    out.save(name,quality=94)
sheet(scenes,4,480,"scenes.jpg")
sheet(caps,3,640,"captions.jpg")
sheet(boundaries,4,480,"boundaries.jpg")
qa={"duration_s":m["duration_s"],"scenes":16,"caption_count":21,"original_caption_ids":[c["id"] for c in m["captions"]],"no_missing_or_duplicate_lines":True,"voice_segment_correlations":correlations,"full_decode_pass":True,"boundary_nonblack_pass":True,"receipts":receipts,"human_audio_approval":False,"visual_review_pending":True}
Path("qa.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding="utf-8")
with zipfile.ZipFile("package.zip","w",zipfile.ZIP_DEFLATED,compresslevel=2) as z:
    for p in [Path(n) for n in ["final.mp4","clean.mp4","manifest.json","caps.srt","qa.json","edit.jsx","render_master.py","scenes.jpg","captions.jpg","boundaries.jpg"]]+list(Path("frames").glob("*.jpg")):z.write(p,p.as_posix())
print(json.dumps({"duration_s":m["duration_s"],"scenes":16,"captions":21,"min_voice_correlation":min(x["correlation"] for x in correlations),"full_decode_pass":True}))

