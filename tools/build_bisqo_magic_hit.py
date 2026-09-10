"""Trim and level Bisqo's CC BY 4.0 Freesound #855371 public HQ preview."""
from pathlib import Path
import hashlib,json,os,subprocess,wave,shutil
import numpy as np
R=Path(__file__).resolve().parents[1]
O=R/'output/audio/bisqo_magic_hit_20260910';O.mkdir(parents=True,exist_ok=True)
source=O/'855371_bisqo_source_hq.mp3'
if not source.exists():shutil.copyfile(R/'tmp/bisqo_855371_hq.mp3',source)
target=R/'sfx/hit/player_projectile_impact.wav'
backup=O/'previous_procedural_hit.wav'
if not backup.exists():shutil.copyfile(target,backup)
ff=next((Path(os.environ['LOCALAPPDATA'])/'Microsoft/WinGet/Packages').glob('Gyan.FFmpeg_*/ffmpeg-*/bin/ffmpeg.exe'))
sr=48000;start=.06;duration=.42
raw=subprocess.check_output([str(ff),'-v','error','-i',str(source),'-af','highpass=f=70','-ac','1','-ar',str(sr),'-f','f32le','-'])
full=np.frombuffer(raw,'<f4').astype(float)
x=full[round(start*sr):round((start+duration)*sr)].copy()
attack=round(.002*sr);fade=round(.12*sr)
x[:attack]*=np.linspace(0,1,attack);x[-fade:]*=np.linspace(1,0,fade)**2
gain=min(.75/abs(x).max(),.135/np.sqrt(np.mean(x*x)));x*=gain
assert len(x)==20160 and np.isfinite(x).all() and abs(x).max()<=.75
pcm=np.round(x*32767).astype('<i2')
assert pcm[0]==0 and pcm[-1]==0
with wave.open(str(target),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(sr);w.writeframes(pcm.tobytes())
shutil.copyfile(target,R/'마법_피격음_적용본.wav')
credit='''DSGNSrce_Deep Dark Magic Impact Short Kick 016_GMcM_FS1DM
Creator: Bisqo
Source: https://freesound.org/people/Bisqo/sounds/855371/
License: Creative Commons Attribution 4.0 International
https://creativecommons.org/licenses/by/4.0/
Source file used: Freesound public HQ MP3 preview (not the original 24-bit WAV).
https://cdn.freesound.org/previews/855/855371_6779432-hq.mp3
Modified for Hell Road: 70 Hz high-pass, stereo to mono, crop 0.060-0.480 s,
2 ms fade-in, final 120 ms squared fade-out, gain normalization, 48 kHz PCM16 WAV.
Used in: sfx/hit/player_projectile_impact.wav
'''
(R/'sfx/hit/ATTRIBUTION.txt').write_bytes(credit.encode('utf-8'))
report={'status':'PASS','source_id':855371,'creator':'Bisqo','license':'CC BY 4.0','source_format':'public HQ MP3 preview','source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'source_duration_s':len(full)/sr,'crop_start_s':start,'crop_end_s':start+duration,'duration_s':duration,'highpass_hz':70,'attack_s':.002,'end_fade_s':.12,'fade_power':2,'gain':float(gain),'peak':float(abs(x).max()),'rms':float(np.sqrt(np.mean(x*x))),'sample_rate':sr,'channels':1,'bits':16,'samples':len(x),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'preview_repetitions':1,'listening_review':False}
(O/'asset_qa.json').write_bytes(json.dumps(report,ensure_ascii=False,indent=2).encode('utf-8'))
print(json.dumps(report,ensure_ascii=False))
