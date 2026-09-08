"""v12: preserve v10 picture bitstream; replace only final narration, one uncut take.
Run in Higgsfield sandbox with source.mp4 (v10) and voice.mp3 (new ElevenLabs take).
"""
import hashlib, json, subprocess, wave
from pathlib import Path
import numpy as np

FPS=24
FRAMES=2719
DURATION=FRAMES/FPS
RATE=48000
VOICE_START=105.927
REPLACE_FROM=105.0
def run(*args):
    return subprocess.check_output(args)
def decode(path):
    return np.frombuffer(run("ffmpeg","-v","error","-i",path,"-f","f32le","-ac","2","-ar",str(RATE),"pipe:1"),dtype="<f4").reshape(-1,2).copy()
def save_wav(path,a):
    with wave.open(path,"wb") as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(RATE)
        w.writeframes((np.clip(a,-1,1)*32767).astype("<i2").tobytes())
def active_rms(a):
    mono=a.mean(axis=1)
    selected=mono[np.abs(mono)>0.01]
    return float(np.sqrt(np.mean(selected**2)))
def video_hash(path):
    return run("ffmpeg","-v","error","-i",path,"-map","0:v:0","-c:v","copy","-an","-f","hash","-hash","sha256","-").decode().strip()
def probe(path):
    return json.loads(run("ffprobe","-v","error","-show_streams","-show_format","-of","json",path))
source=decode("source.mp4")
voice=decode("voice.mp3")
reference=source[round(105.332*RATE):round(107.0*RATE)]
gain=min(active_rms(reference)/active_rms(voice),0.98/float(np.max(np.abs(voice))))
take=voice*gain
# Only inaudible outer edges are faded; the native internal pause is untouched.
for count,reverse in [(round(.005*RATE),False),(round(.01*RATE),True)]:
    ramp=np.linspace(0,1,count)
    if reverse: take[-count:]*=ramp[::-1,None]
    else: take[:count]*=ramp[:,None]
out=np.zeros((round(DURATION*RATE),2),np.float32)
keep=round(REPLACE_FROM*RATE)
out[:keep]=source[:keep]
start=round(VOICE_START*RATE)
assert start+len(take)<len(out)
out[start:start+len(take)]=take
assert np.array_equal(out[:keep],source[:keep])
assert np.array_equal(out[start:start+len(take)],take)
save_wav("voice_full_continuous.wav",out)
run("ffmpeg","-y","-v","error","-i","source.mp4","-i","voice_full_continuous.wav","-map","0:v:0","-map","1:a:0","-c:v","copy","-c:a","aac","-b:a","192k","-t",str(DURATION),"-movflags","+faststart","final.mp4")
p=probe("final.mp4")
v=next(x for x in p["streams"] if x["codec_type"]=="video")
assert int(v["nb_frames"])==FRAMES
assert abs(float(v["duration"])-DURATION)<.00001
before=video_hash("source.mp4");after=video_hash("final.mp4")
assert before==after
decoded=decode("final.mp4")
corr=float(np.corrcoef(take[480:-480].ravel(),decoded[start+480:start+len(take)-480].ravel())[0,1])
assert corr>.98
qa={"version":"v12","source":"world_intro_v10_traditional_magic_en.mp4","video_frames":FRAMES,"video_duration":float(v["duration"]),"format_duration":float(p["format"]["duration"]),"video_sha256_source":before,"video_sha256_final":after,"video_bitstream_identical":before==after,"last_scene":[102.791667,109.291667],"logo":[109.291667,113.291667],"voice_start":VOICE_START,"voice_decoded_duration":len(voice)/RATE,"voice_gain":gain,"voice_insertion":"one continuous take; no internal splice or stretch","new_voice_correlation_after_aac":corr,"previous_pcm_preserved_until":REPLACE_FROM,"native_pause":[.756009,3.67288],"name_signal_onset":VOICE_START+3.67288,"subtitle_final_two":[[106.020,109.292],[109.6,111.1]],"voice_id":"WS6naCm8T4gbyzsLnOjK","model":"eleven_multilingual_v2","text":'We call them <break time="2.8s" /> Exoduser.',"auditory_review":"Not personally auditioned; inspect final preview by ear.","bytes":Path("final.mp4").stat().st_size}
Path("qa.json").write_text(json.dumps(qa,indent=2)+"\n")
run("ffmpeg","-y","-v","error","-ss","102.791667","-i","final.mp4","-t","10.5","-c:v","libx264","-preset","fast","-crf","20","-c:a","aac","-b:a","192k","-movflags","+faststart","ending_preview.mp4")
print(json.dumps(qa,indent=2))
