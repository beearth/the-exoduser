"""Deterministic short projectile impact: low body, dry crack and energy grit."""
from pathlib import Path
import json,wave
import numpy as np
R=Path(__file__).resolve().parents[1]
RATE=48000;DURATION=.18
t=np.arange(round(RATE*DURATION))/RATE
rng=np.random.default_rng(20260910)
def band_noise(lo,hi):
    white=rng.normal(0,1,len(t))
    spec=np.fft.rfft(white);freq=np.fft.rfftfreq(len(t),1/RATE)
    spec*=np.minimum(1,freq/lo)**4/(1+(freq/hi)**8)
    noise=np.fft.irfft(spec,n=len(t))
    return noise/(np.max(np.abs(noise))+1e-9)
# Falling body pitch: 180Hz to 65Hz, with an inharmonic metal/energy tick.
body=np.sin(2*np.pi*(65*t+115*.025*(1-np.exp(-t/.025))))*np.exp(-t/.042)
crack=band_noise(700,5800)*np.exp(-t/.011)
grit=band_noise(180,2300)*np.exp(-t/.045)
tick=np.sin(2*np.pi*1370*t+2*np.sin(2*np.pi*83*t))*np.exp(-t/.018)
sound=(.54*body+.42*crack+.34*grit+.07*tick)
sound*=np.minimum(1,t/.001)*np.minimum(1,(DURATION-t)/.012)
sound*=.75/np.max(np.abs(sound))
out=R/'sfx/hit/player_projectile_impact.wav'
with wave.open(str(out),'wb') as w:
    w.setnchannels(1);w.setsampwidth(2);w.setframerate(RATE)
    w.writeframes(np.round(sound*32767).astype('<i2').tobytes())
report={'source':'procedural, no voice or music','sample_rate':RATE,'duration_s':DURATION,'channels':1,'bits':16,'samples':len(sound),'seed':20260910,'peak':float(np.max(np.abs(sound))),'rms':float(np.sqrt(np.mean(sound**2))),'body_pitch_hz':[180,65],'body_decay_s':.042,'crack_band_hz':[700,5800],'crack_decay_s':.011,'grit_band_hz':[180,2300],'grit_decay_s':.045,'tick_hz':1370,'attack_s':.001,'end_fade_s':.012,'bytes':out.stat().st_size}
qa=R/'output/audio/projectile_player_hit_20260910';qa.mkdir(parents=True,exist_ok=True)
(qa/'asset_qa.json').write_bytes((json.dumps(report,indent=2)+'\n').encode())
print(json.dumps(report))
