"""Build a reviewable ILE submission package from existing EXODUSER assets."""
from pathlib import Path
import subprocess, json, re, hashlib, shutil, sys

ROOT=Path(r"G:\exoduser")
OUT=ROOT/"output/indie-live-expo-20261201"
PACK=OUT/"submission"
WORK=ROOT/"tmp/indie-live-expo-20261201"
TRAILER=ROOT/"captures/gameplay_trailer_20260909/EXODUSER_SKILL_TRAILER_V25_DAMAGE_TEXT_CAPTIONS_58S_1080P60.mp4"
PICTURE=ROOT/"tmp/trailer_damage_v25/edit/picture.mp4"
BGM=ROOT/"bgm/1장_썩은숲/Bloodsteel Ascension.mp3"
FF=shutil.which("ffmpeg")
FP=shutil.which("ffprobe")
FLAGS=subprocess.CREATE_NO_WINDOW if sys.platform=="win32" else 0
for d in (OUT,PACK,WORK): d.mkdir(parents=True,exist_ok=True)

def run(args, log):
    with (WORK/log).open("w",encoding="utf8") as f:
        p=subprocess.run([FF,"-hide_banner","-y",*map(str,args)],cwd=ROOT,stdout=f,stderr=f,creationflags=FLAGS)
    if p.returncode: raise RuntimeError(f"{log}: ffmpeg returned {p.returncode}")
    return (WORK/log).read_text(encoding="utf8",errors="replace")

def probe(path):
    p=subprocess.run([FP,"-v","error","-show_streams","-show_format","-of","json",str(path)],capture_output=True,text=True,encoding="utf8",creationflags=FLAGS,check=True)
    return json.loads(p.stdout)

def analyze(path,label):
    log=run(["-i",path,"-vn","-af","loudnorm=I=-15:TP=-1.5:LRA=11:print_format=json","-f","null","-"],label)
    found=re.findall(r'\{\s*"input_i"[\s\S]*?\}',log)
    if not found: raise RuntimeError("No loudness measurement")
    return json.loads(found[-1])

def normalize_filter(m):
    return (f"loudnorm=I=-15:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
            f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:"
            "linear=true:print_format=json,aformat=sample_rates=48000:channel_layouts=stereo")

VIDEO=["-r","60","-c:v","libx264","-threads","8","-preset","medium","-b:v","24M","-minrate","24M","-maxrate","24M","-bufsize","48M","-x264-params","nal-hrd=cbr:force-cfr=1","-pix_fmt","yuv420p","-color_range","tv","-colorspace","bt709","-color_primaries","bt709","-color_trc","bt709"]
AUDIO=["-c:a","aac","-b:a","320k","-ar","48000","-ac","2"]
sources={}
for dest,source in {
    "main.jpg":"img/title_art_1.png",
    "ss1.jpg":"지스타2026_제출사진_10장/06_불꽃칼날_화염스윙.png",
    "ss2.jpg":"지스타2026_제출사진_10장/08_보스전_다크드루이드.png",
    "ss3.jpg":"지스타2026_제출사진_10장/09_성장과빌드_패시브각인.png",
}.items():
    src=ROOT/source
    run(["-i",src,"-frames:v","1","-q:v","2",PACK/dest],dest+".log")
    sources[dest]={"source":source,"source_sha256":hashlib.sha256(src.read_bytes()).hexdigest(),"processing":"JPEG format conversion only; original composition preserved"}
print("IMAGES_READY",flush=True)

caption=(ROOT/"tmp/trailer_damage_v25/edit/captions.ass").read_text(encoding="utf-8-sig")
translations={
"썩은 숲의 제단":"ALTAR OF THE ROTTEN FOREST","군집의 심장":"HEART OF THE HIVE","지옥의 의식":"RITUAL OF HELL",
"탄막으로 ":"PARRY BULLETS. ","분노를 채워라":"BUILD RAGE.","모조리 끌어모아라":"GATHER THE HORDE",
"분노로 ":"UNLEASH ","섬멸하라":"YOUR RAGE","화염을 ":"STACK ","쌓아라":"THE FLAMES",
"한 번에 ":"DETONATE ","터뜨려라":"THEM ALL","얼음보주":"ICE ORB","전대 소환":"SUMMON THE ANCESTOR",
"탄막을 ":"ABSORB ","삼켜라":"THE BULLET STORM","그대로 ":"SEND IT ","되돌려라":"ALL BACK"}
for ko,en in translations.items(): caption=caption.replace(ko,en)
if re.search("[가-힣]",caption): raise RuntimeError("Untranslated caption")
(WORK/"captions-en.ass").write_text(caption,encoding="utf-8-sig")

full=PACK/"EXODUSER_HELL_LORD_full.mp4"
mfull=analyze(TRAILER,"full-input-loudness.log")
print("FULL_ENCODING",flush=True)
visual="[0:v][2:v]overlay=0:0:enable='lt(t,54)',drawbox=x=0:y=0:w=iw:h=38:color=black:t=fill,drawbox=x=0:y=1042:w=iw:h=38:color=black:t=fill,ass='tmp/indie-live-expo-20261201/captions-en.ass':fontsdir='tmp/trailer_damage_v25/fonts',tpad=stop_mode=clone:stop_duration=0.05[v];"
run(["-filter_complex_threads","2","-i",PICTURE,"-i",TRAILER,"-loop","1","-i",ROOT/"tmp/trailer_v2/edit/shade.png",
     "-filter_complex",visual+"[1:a]"+normalize_filter(mfull)+"[a]",
     "-map","[v]","-map","[a]","-t","58",*VIDEO,*AUDIO,"-movflags","+faststart",full],"full-encode.log")
print("FULL_READY",flush=True)

# Four genuine gameplay cuts, followed by the original logo shot.
cuts=[(13.4,3,"parry"),(21.85,3,"infernal_slam"),(31.85,3,"flame_detonation"),(50.85,3,"bullet_release"),(55,3,"title")]
audio_filters=[]
for i,(start,dur,_) in enumerate(cuts):
    audio_filters.append(f"[0:a]atrim=start={start}:duration={dur},asetpts=PTS-STARTPTS,afade=t=in:d=0.025,afade=t=out:st=2.975:d=0.025[a{i}]")
audio_filters.append("".join(f"[a{i}]" for i in range(len(cuts)))+"concat=n=5:v=0:a=1,volume=1.8,highpass=f=35[sfx]")
audio_filters.append("[1:a]atrim=duration=15,asetpts=PTS-STARTPTS,volume=0.48,afade=t=in:d=0.08,afade=t=out:st=13.6:d=1.4[bgm]")
audio_filters.append("[sfx][bgm]amix=inputs=2:duration=longest:normalize=0,aformat=sample_rates=48000:channel_layouts=stereo[mix]")
shortwav=WORK/"short-mix.wav"
run(["-filter_complex_threads","2","-i",PICTURE,"-ss","43","-i",BGM,"-filter_complex",";".join(audio_filters),"-map","[mix]","-t","15","-c:a","pcm_s24le",shortwav],"short-mix.log")
mshort=analyze(shortwav,"short-input-loudness.log")
short=PACK/"EXODUSER_HELL_LORD.mp4"
video_filters=[]
for i,(start,dur,_) in enumerate(cuts):
    video_filters.append(f"[0:v]trim=start={start}:duration={dur},setpts=PTS-STARTPTS[v{i}]")
video_filters.append("".join(f"[v{i}]" for i in range(len(cuts)))+"concat=n=5:v=1:a=0[v]")
video_filters.append("[1:a]"+normalize_filter(mshort)+"[a]")
print("SHORT_ENCODING",flush=True)
run(["-filter_complex_threads","2","-i",full,"-i",shortwav,"-filter_complex",";".join(video_filters),
     "-map","[v]","-map","[a]","-t","15",*VIDEO,*AUDIO,"-movflags","+faststart",short],"short-encode.log")
print("SHORT_READY",flush=True)
checks={}
for path,duration in [(short,15),(full,58)]:
    p=probe(path); v=next(s for s in p["streams"] if s["codec_type"]=="video"); a=next(s for s in p["streams"] if s["codec_type"]=="audio")
    if v["width"]!=1920 or v["height"]!=1080 or v["r_frame_rate"]!="60/1" or abs(float(p["format"]["duration"])-duration)>0.03: raise RuntimeError("Video spec mismatch")
    if a["codec_name"]!="aac" or a["sample_rate"]!="48000" or a["channels"]!=2: raise RuntimeError("Audio spec mismatch")
    loud=analyze(path,path.stem+"-final-loudness.log")
    if not -16<=float(loud["input_i"])<=-14: raise RuntimeError("Loudness out of range")
    run(["-v","error","-i",path,"-f","null","-"],path.stem+"-decode.log")
    checks[path.name]={"probe":p,"loudness":loud,"full_decode":"passed"}
files=[]
for path in sorted(PACK.iterdir()):
    files.append({"file":path.name,"bytes":path.stat().st_size,"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),"probe":probe(path)})
manifest={"event":"INDIE Live Expo 2026.12.1","prepared":"2026-09-28","status":"local_package_built_pending_visual_review_and_upload","source_video":str(TRAILER.relative_to(ROOT)),"source_video_sha256":hashlib.sha256(TRAILER.read_bytes()).hexdigest(),"source_picture":str(PICTURE.relative_to(ROOT)),"short_cuts":[{"source_start_seconds":s,"duration_seconds":d,"content":c} for s,d,c in cuts],"images":sources,"files":files,"checks":checks,"notes":["All gameplay comes from existing staged in-engine captures, not generated video.","English captions replace Korean trailer captions; gameplay content and damage numbers are retained.","24 Mbps delivery encoding cannot restore detail absent from the original footage.","Screenshots are existing September 14 captures and can differ from later development builds.","No form submission or rights consent performed."]}
(OUT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf8")
for path,interval,name in [(short,3,"short-contact.jpg"),(full,6,"full-contact.jpg")]:
    run(["-i",path,"-vf",f"fps=1/{interval},scale=480:-1,tile=3x4","-frames:v","1",OUT/name],name+".log")
print("PACKAGE_READY "+str(PACK),flush=True)
