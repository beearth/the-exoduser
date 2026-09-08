"""v13 audio-only word replacement; run in Higgsfield with v12 source.mp4 and voice.mp3."""
import json, subprocess, wave
from pathlib import Path
import numpy as np
R=48000
D=2719/24
START=100.8
A,B=100.25,102.0
def run(*args): return subprocess.check_output(args)
def decode(p): return np.frombuffer(run("ffmpeg","-v","error","-i",p,"-f","f32le","-ac","2","-ar",str(R),"pipe:1"),dtype="<f4").reshape(-1,2).copy()
def rms(a):
    m=a.mean(axis=1); x=m[np.abs(m)>.01]
    return float(np.sqrt(np.mean(x*x)))
def vh(p): return run("ffmpeg","-v","error","-i",p,"-map","0:v:0","-c:v","copy","-f","hash","-hash","sha256","-").decode().strip()
src=decode("source.mp4"); voice=decode("voice.mp3")
gain=min(rms(src[round(100.839*R):round(101.279*R)])/rms(voice),.98/float(np.abs(voice).max()))
take=voice*gain
# Fade only the outer inaudible edges, not any syllable or internal interval.
for n,tail in [(48,False),(480,True)]:
    ramp=np.linspace(0,1,n)
    if tail: take[-n:]*=ramp[::-1,None]
    else: take[:n]*=ramp[:,None]
out=src[:round(D*R)].copy()
a,b,start=round(A*R),round(B*R),round(START*R)
out[a:b]=0
assert start>=a and start+len(take)<b
out[start:start+len(take)]=take
assert np.array_equal(out[:a],src[:a]) and np.array_equal(out[b:],src[b:len(out)])
with wave.open("mixed.wav","wb") as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(R)
    w.writeframes((np.clip(out,-1,1)*32767).astype("<i2").tobytes())
run("ffmpeg","-y","-v","error","-i","source.mp4","-i","mixed.wav","-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","192k","-t",str(D),"-movflags","+faststart","final.mp4")
p=json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json","final.mp4"))
v=next(s for s in p["streams"] if s["codec_type"]=="video")
assert int(v["nb_frames"])==2719 and abs(float(v["duration"])-D)<.00001
h1,h2=vh("source.mp4"),vh("final.mp4");assert h1==h2
decoded=decode("final.mp4")
wordcorr=float(np.corrcoef(take[480:-480].ravel(),decoded[start+480:start+len(take)-480].ravel())[0,1])
endcorr=float(np.corrcoef(src[round(105*R):round(111*R)].ravel(),decoded[round(105*R):round(111*R)].ravel())[0,1])
assert wordcorr>.98 and endcorr>.98
qa={"version":"v13","source":"world_intro_v12_fullscene_newvoice_en.mp4","video_frames":2719,"video_duration":float(v["duration"]),"format_duration":float(p["format"]["duration"]),"video_bitstream_identical":h1==h2,"video_sha256":h2,"bytes":Path("final.mp4").stat().st_size,"replaced_audio":[A,B],"voice_start":START,"voice_decoded_duration":len(voice)/R,"gain":gain,"word":"Exodus.","voice_id":"WS6naCm8T4gbyzsLnOjK","model":"eleven_multilingual_v2","word_aac_correlation":wordcorr,"unchanged_ending_correlation":endcorr,"subtitle_cue29":[100.322,101.682],"note":"one complete word take; no speed/pitch change; all other source PCM untouched before AAC encode; not personally auditioned"}
Path("qa.json").write_text(json.dumps(qa,indent=2)+"\n")
run("ffmpeg","-y","-v","error","-ss","95.791667","-i","final.mp4","-t","7","-c:v","libx264","-preset","fast","-crf","20","-c:a","aac","-b:a","192k","-movflags","+faststart","preview.mp4")
run("ffmpeg","-y","-v","error","-i","source.mp4","-an","-c:v","copy","picture.mp4")
print(json.dumps(qa,indent=2),flush=True)
