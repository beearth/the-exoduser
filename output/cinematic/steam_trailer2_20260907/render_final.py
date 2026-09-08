import json, subprocess, wave, hashlib
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw
R=48000
D=2719/24
def run(*args):
    return subprocess.check_output(args)
def probe(path):
    return json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))
def decode(path):
    return np.frombuffer(run("ffmpeg","-v","error","-i",path,"-f","f32le","-ac","2","-ar",str(R),"pipe:1"),dtype="<f4").reshape(-1,2).copy()
vo=decode("source.mp4")
music=decode("music.mp3")
n=round(D*R)
assert len(vo)>=n and len(music)>=n
t=np.arange(n)/R
envelope=.22*np.minimum(1,t/.75)*np.minimum(1,np.maximum(0,(D-t)/2))
mixed=vo[:n]+music[:n]*envelope[:,None]
peak=float(np.abs(mixed).max())
gain=min(1,.95/peak)
mixed*=gain
with wave.open("mix.wav","wb") as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(R)
    w.writeframes((mixed*32767).astype("<i2").tobytes())
run("ffmpeg","-y","-v","error","-i","source.mp4","-i","mix.wav","-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","320k","-t",str(D),"-movflags","+faststart","mixed_clean.mp4")
Path("caps.srt").write_text("1\n00:00:00,080 --> 00:00:02,940\n우주에는 셀 수 없는 세계가 있다.\n\n2\n00:00:04,122 --> 00:00:07,042\n어딘가에선 우주가 태어나고,\n\n3\n00:00:07,042 --> 00:00:09,922\n어딘가에선 또 하나의 우주가 스러진다.\n\n4\n00:00:09,922 --> 00:00:12,762\n탄생과 소멸에는 끝이 없건만…\n\n5\n00:00:12,762 --> 00:00:16,402\n잔혹하게도, 지옥은 단 하나뿐이다.\n\n6\n00:00:17,402 --> 00:00:20,622\n누가 정한 섭리인지,\n\n7\n00:00:21,262 --> 00:00:24,182\n죄를 지은 모든 생명은 제 안의 악의와 함께…\n\n8\n00:00:24,182 --> 00:00:26,962\n단 하나의 지옥으로 흘러든다.\n\n9\n00:00:27,932 --> 00:00:30,832\n누구나 마음 깊은 곳에선 그 존재를 알고 있다.\n\n10\n00:00:30,832 --> 00:00:33,632\n강물이 낮은 곳으로 흐르듯,\n\n11\n00:00:33,632 --> 00:00:36,072\n끝없이 아래로만 향하는 힘.\n\n12\n00:00:36,452 --> 00:00:38,132\n오직 파괴만을 갈망하는 그 힘이\n\n13\n00:00:38,132 --> 00:00:42,352\n흐르고, 쌓이고, 끝내 고이는 곳…\n\n14\n00:00:42,352 --> 00:00:45,452\n지옥이라 불리는 곳이다.\n\n15\n00:00:46,472 --> 00:00:50,632\n그 깊은 곳에 가라앉은 영혼은 돌아갈 길을 잃고…\n\n16\n00:00:50,632 --> 00:00:54,252\n다시 태어날 기회마저 빼앗긴다.\n\n17\n00:00:56,632 --> 00:00:58,632\n시간은 의미를 잃고,\n\n18\n00:00:58,832 --> 00:01:01,512\n고통만이 육체에 스며들고,\n\n19\n00:01:02,112 --> 00:01:04,512\n그들은 제 안의 파괴적 에너지 그대로…\n\n20\n00:01:04,512 --> 00:01:08,452\n고통의 형상으로 잉태된다.\n\n21\n00:01:09,502 --> 00:01:14,142\n지옥의 모든 괴물은… 한때, 어딘가의 누군가였다.\n\n22\n00:01:16,532 --> 00:01:19,432\n지옥은 시대를 묻지 않는다.\n\n23\n00:01:20,472 --> 00:01:22,472\n검을 쥔 자도,\n\n24\n00:01:22,652 --> 00:01:23,972\n강철의 몸을 가진 자도.\n\n25\n00:01:24,972 --> 00:01:27,252\n초능력을 지닌 자도,\n\n26\n00:01:27,889 --> 00:01:29,729\n마법의 극에 닿은 자도.\n\n27\n00:01:30,902 --> 00:01:33,622\n모두가 뒤엉킨 단 하나의 구덩이.\n\n28\n00:01:35,902 --> 00:01:40,322\n서로를 겨누는 그들이 원하는 것은… 단 하나.\n\n29\n00:01:40,322 --> 00:01:41,682\n탈출.\n\n30\n00:01:42,972 --> 00:01:45,232\n추락에 맞서는 자들.\n\n31\n00:01:46,020 --> 00:01:49,292\n우리는 그들을…\n\n32\n00:01:49,600 --> 00:01:51,100\n엑소듀서라 부른다."+"\n",encoding="utf-8")
cues=Path("caps.srt").read_text().strip().split("\n\n")
assert len(cues)==32 and "탈출." in cues[28] and "엑소듀서라 부른다." in cues[31]
# Verify the actual Korean font, not just a successful ffmpeg exit.
def selected_font():
    p=subprocess.run(["ffmpeg","-v","info","-i","mixed_clean.mp4","-vf","subtitles=caps.srt:fontsdir=fonts:force_style='FontName=Noto Serif CJK KR,Fontsize=16,Bold=1'","-frames:v","30","-f","null","-"],capture_output=True,text=True,check=True)
    return "\n".join(l for l in p.stderr.splitlines() if "fontselect:" in l)
before=selected_font()
assert "NotoSerifCJKkr-Medium" not in before, "RED precondition: use a fresh sandbox"
print("RED: requested serif fell back before font registration: "+before,flush=True)
fontdir=Path("/home/user/.local/share/fonts")
fontdir.mkdir(parents=True,exist_ok=True)
subprocess.run(["cp","fonts/NotoSerifCJKkr-Medium.otf",str(fontdir)],check=True)
subprocess.run(["fc-cache","-f",str(fontdir)],check=True)
after=selected_font()
assert "NotoSerifCJKkr-Medium" in after and "WenQuanYi" not in after
Path("font_selection.txt").write_text(after+"\n")
print("GREEN: "+after,flush=True)
print(json.dumps({"phase":"mix_ready","duration":D,"music_gain":.22,"master_gain":gain,"pre_gain_peak":peak,"cues":len(cues)}),flush=True)
subprocess.run(["bash","/home/user/.higgsfield/workflows/subtitles/scripts/burn_caps_clean.sh","--in","mixed_clean.mp4","--srt","caps.srt","--out","subbed24.mp4","--font","Noto Serif CJK KR","--fontsdir","fonts","--fontsize","16","--marginv","32","--outline","0.6","--shadow","1","--no-caps"],check=True)
outs=[("subbed24.mp4","EXODUSER_Trailer_02_KO_Final.mp4")]
receipts=[]
for inp,out in outs:
    run("ffmpeg","-y","-v","error","-i",inp,"-map","0:v:0","-map","0:a:0","-vf","fps=30","-c:v","libx264","-preset","fast","-b:v","8M","-minrate","8M","-maxrate","8M","-bufsize","16M","-x264-params","nal-hrd=cbr:force-cfr=1","-pix_fmt","yuv420p","-c:a","aac","-b:a","320k","-ar","48000","-ac","2","-t",str(D),"-movflags","+faststart",out)
    p=probe(out);v=next(s for s in p["streams"] if s["codec_type"]=="video");a=next(s for s in p["streams"] if s["codec_type"]=="audio")
    assert (v["width"],v["height"],v["avg_frame_rate"])==(1280,720,"30/1")
    assert abs(float(v["duration"])-D)<.04 and abs(float(a["duration"])-D)<.04
    assert v["codec_name"]=="h264" and a["codec_name"]=="aac" and a["sample_rate"]=="48000" and a["channels"]==2
    run("ffmpeg","-v","error","-i",out,"-f","null","-")
    receipts.append({"file":out,"bytes":Path(out).stat().st_size,"sha256":hashlib.sha256(Path(out).read_bytes()).hexdigest(),"video_duration":v["duration"],"audio_duration":a["duration"],"frames":v["nb_frames"],"bitrate":v.get("bit_rate"),"decode":"PASS"})
    print(json.dumps(receipts[-1]),flush=True)
times=[1.5,5.5,14,19,29,48,60,71,77,79,81,85.5,88.5,92,98,104,100.9,106.5,110.3,112]
Path("proof").mkdir(exist_ok=True)
sheet=Image.new("RGB",(1280,5*202),(14,14,14));draw=ImageDraw.Draw(sheet)
for i,s in enumerate(times):
    path=f"proof/{i+1:02d}_{s}.jpg"
    run("ffmpeg","-y","-v","error","-ss",str(s),"-i",outs[0][1],"-frames:v","1","-q:v","2",path)
    im=Image.open(path);im.thumbnail((320,180))
    x,y=(i%4)*320,(i//4)*202
    sheet.paste(im,(x,y));draw.text((x+5,y+183),f"{i+1:02d} | {s:.2f}s",fill="white")
sheet.save("EXODUSER_Trailer_02_Final_Proof.jpg",quality=94)
qa={"source":"world_intro_v13_exodus_en.mp4","source_sha256":hashlib.sha256(Path("source.mp4").read_bytes()).hexdigest(),"range":[0,D],"cuts":17,"caption_cues":32,"font_selection":after,"ko29":"탈출.","english_word":"Exodus.","logo":[109.291667,D],"music":"bgm/cutscene/prologue_theme.mp3","music_source_offset":0,"music_gain":.22,"music_fade_in":.75,"music_fade_out":2,"voice_gain":1,"master_gain":gain,"sample_rate":R,"source_fps":24,"delivery_fps":30,"frame_conversion":"duplicate/drop only, no interpolation or speed change","subtitle_style":{"font":"Noto Serif CJK KR Medium","libass_fontsize":16,"libass_marginv":32,"outline":.6,"shadow":1,"fill":"white","plate":False},"subtitle_timing":"existing user-approved game SSOT, no automatic retiming","outputs":receipts,"audio_audition":"not personally auditioned","steam_uploaded":False}
Path("qa.json").write_text(json.dumps(qa,ensure_ascii=False,indent=2)+"\n")
Path("edit.jsx").write_text('export default async ({project}) => { const p=await project({dir:"project",size:"1280x720",fps:30,background:"#000000"}); const movie=await p.add("EXODUSER_Trailer_02_KO_Final.mp4"); p.cut(movie,{at:0,from:0,dur:113.3}); await p.frame(110.3,"project_proof.png"); };\n')
subprocess.run(["higgsedit","build","edit.jsx"],check=True)
subprocess.run(["zip","-q","-r","EXODUSER_Trailer_02_Final_QA.zip","qa.json","caps.srt","edit.jsx","render.py","font_selection.txt","project","proof","project_proof.png"],check=True)
print("READY_FOR_UPLOAD",flush=True)
