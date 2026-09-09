import json, re, shutil, subprocess, os
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path.cwd()
VOICE_START = 1.0
MANIFEST = json.loads(Path("source_manifest.json").read_text(encoding="utf-8"))
DURATION = MANIFEST["duration_s"]
LINES = MANIFEST["lines"]
SPEECH = " ".join(x["en"].replace('"', "") for x in LINES)
KO = " ".join(x["ko"] for x in LINES)
WF = Path(os.environ["HF_WORKFLOWS"]) / "subtitles/scripts"

def run(args, **kw):
    return subprocess.run(args, check=True, **kw)

def probe(path):
    return json.loads(subprocess.check_output(["ffprobe", "-v", "error", "-show_format", "-show_streams", "-of", "json", str(path)]))

voice_duration = float(probe("voice.mp3")["format"]["duration"])
assert voice_duration + VOICE_START < DURATION
Path("script_manifest.json").write_text(json.dumps({"beats":[{"phrase": SPEECH}]}, ensure_ascii=False), encoding="utf-8")
run(["python3", str(WF/"audio_to_captions.py"), "voice.mp3", "--srt", "en.srt", "--json", "alignment.json", "--script", "script_manifest.json", "--language", "en", "--max-words", "1"])
srt = Path("en.srt").read_text(encoding="utf-8-sig")
def norm(s):
    return re.sub(r"[^a-z0-9]+", " ", s.lower()).strip()
spoken = " ".join(x for x in srt.splitlines() if x.strip() and not x.strip().isdigit() and "-->" not in x)
assert norm(spoken) == norm(SPEECH), (spoken, SPEECH)
def seconds(h,m,s,ms):
    return int(h)*3600+int(m)*60+int(s)+int(ms)/1000
times = [seconds(*t) for t in re.findall(r"(\d\d):(\d\d):(\d\d),(\d\d\d)", srt)]
assert times and 0 <= min(times) < max(times) <= voice_duration + .1
start, end = min(times)+VOICE_START, min(max(times)+VOICE_START+.25, DURATION)
def stamp(sec):
    n = round(sec*1000)
    return f"{n//3600000:02d}:{n//60000%60:02d}:{n//1000%60:02d},{n%1000:03d}"
aligned=json.loads(Path("alignment.json").read_text(encoding="utf-8"))
assert aligned["similarity"]>=.9
word_caps=aligned["captions"]
assert len(word_caps)==len(norm(SPEECH).split()), word_caps
cues=[]; cursor=0
for line in LINES:
    count=len(norm(line["en"]).split())
    a=word_caps[cursor]["start"]+VOICE_START
    b=min(word_caps[cursor+count-1]["end"]+VOICE_START+.25,DURATION)
    if cursor+count < len(word_caps):
        b=min(b,word_caps[cursor+count]["start"]+VOICE_START)
    cues.append({"source_id":line["id"],"start":a,"end":b,"text":line["ko"]})
    cursor+=count
Path("caps.srt").write_text("\n\n".join(f'{i+1}\n{stamp(c["start"])} --> {stamp(c["end"])}\n{c["text"]}' for i,c in enumerate(cues))+"\n", encoding="utf-8")
script = """import { writeFileSync } from "node:fs";
export default async ({ project }) => {
  const p = await project({dir: "edit-project", size: "1280x720", fps: 24, background: "#000000"});
  const video = await p.add(%s);
  const voice = await p.add(%s);
  p.cut(video, {from: 0, dur: %s, at: 0, fit: "cover"});
  writeFileSync(%s, voice.id);
};
""" % (json.dumps(str(ROOT/"source.mp4")), json.dumps(str(ROOT/"voice.mp3")), DURATION, json.dumps(str(ROOT/"voice_asset_id.txt")))
Path("edit.jsx").write_text(script, encoding="utf-8")
run(["higgsedit", "build", "edit.jsx"])
run(["higgsedit", "do", "edit-project", "place", "--assetId", Path("voice_asset_id.txt").read_text().strip(), "--at", str(VOICE_START), "--duration", str(voice_duration)])
run(["higgsedit", "render", "edit-project", "--out", "renders/clean.mp4", "--depth", "8", "--bitrate", "8M", "--shards", "1", "--concurrency", "1"])
shutil.copyfile("edit-project/renders/clean.mp4", "clean.mp4")
run(["bash", str(WF/"fetch_fonts.sh")])
Path("fonts").mkdir(exist_ok=True)
run(["curl", "-fLsS", "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Serif/OTF/Korean/NotoSerifCJKkr-Medium.otf", "-o", "fonts/NotoSerifCJKkr-Medium.otf"])
fontdir=Path.home()/".local/share/fonts"
fontdir.mkdir(parents=True,exist_ok=True)
shutil.copyfile("fonts/NotoSerifCJKkr-Medium.otf", fontdir/"NotoSerifCJKkr-Medium.otf")
run(["fc-cache", "-f"])
font_match=subprocess.check_output(["fc-match", "Noto Serif CJK KR"],text=True).strip()
assert "NotoSerifCJK" in font_match, font_match
run(["bash", str(WF/"burn_caps_clean.sh"), "--in", "clean.mp4", "--srt", "caps.srt", "--out", "final.mp4", "--font", "Noto Serif CJK KR", "--fontsdir", "fonts", "--fontsize", "13", "--marginv", "32", "--outline", "0.6", "--shadow", "0.4", "--no-caps"])
receipts = {}
for name in ("source.mp4", "voice.mp3", "clean.mp4", "final.mp4"):
    p=probe(name)
    receipts[name]={"bytes":Path(name).stat().st_size,"duration":float(p["format"]["duration"]),"streams":[{k:s.get(k) for k in ("codec_type","codec_name","width","height","duration","sample_rate","r_frame_rate")} for s in p["streams"]]}
for name in ("clean.mp4","final.mp4"):
    v=next(s for s in receipts[name]["streams"] if s["codec_type"]=="video")
    a=next(s for s in receipts[name]["streams"] if s["codec_type"]=="audio")
    assert abs(float(v["duration"])-DURATION)<.05
    assert abs(float(a["duration"])-float(v["duration"]))<.2
    run(["ffmpeg", "-v", "error", "-i", name, "-f", "null", "-"])
def pcm(path, at=0, duration=None):
    args=["ffmpeg","-v","error","-i",path,"-ss",str(at)]
    if duration is not None: args += ["-t",str(duration)]
    return np.frombuffer(subprocess.check_output(args+["-ac","1","-ar","24000","-f","f32le","-"]),dtype=np.float32)
ref=pcm("voice.mp3")
actual=pcm("final.mp4",VOICE_START,voice_duration)
n=min(len(ref),len(actual))
corr=float(np.corrcoef(ref[:n],actual[:n])[0,1])
assert corr>.95, corr
qa={"duration_s":DURATION,"voice_start_s":VOICE_START,"voice_duration_s":voice_duration,"caption_start_s":start,"caption_end_s":end,"english":SPEECH,"korean":KO,"transcript_exact_match":True,"voice_pcm_correlation":corr,"font":font_match,"font_size_ass":13,"margin_v_ass":32,"outline_ass":.6,"shadow_ass":.4,"receipts":receipts,"human_audio_approval":False,"visual_review_pending":True,"caption_cues":cues,"source_ids":[x["id"] for x in LINES]}
Path("qa.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2),encoding="utf-8")
check_times=[0.0]+[(c["start"]+c["end"])/2 for c in cues]+[DURATION/2,DURATION-.5,DURATION-1/24]
check_times=sorted(set(check_times))
for i,t in enumerate(check_times):
    run(["ffmpeg","-v","error","-ss",str(t),"-i","final.mp4","-frames:v","1","-update","1",f"frame{i}.png"])
sheet=Image.new("RGB",(960,540*len(check_times)),(0,0,0))
for i in range(len(check_times)):
    sheet.paste(Image.open(f"frame{i}.png").convert("RGB").resize((960,540)),(0,i*540))
sheet.save("contact.jpg",quality=93)
print(json.dumps(qa,ensure_ascii=False,indent=2))
